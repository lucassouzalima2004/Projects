/* Checkout com Stripe.
 *
 * GET  /api/checkout  → { enabled }  (o site usa isso para mostrar "Checkout" ou "Order on WhatsApp")
 * POST /api/checkout  → { url }      (página de pagamento do Stripe)
 *
 * Os preços NUNCA vêm do navegador: cada item é conferido com o catálogo
 * (public/assets/js/catalog.js) aqui no servidor.
 *
 * Variáveis no Cloudflare Pages (Settings → Variables and Secrets):
 *   STRIPE_SECRET_KEY  chave secreta do Stripe (sk_live_… ou sk_test_… para testar)
 *   SITE_URL           opcional: endereço final, ex. https://artwithlovebylulu.co.uk
 */
import SHOP from '../../public/assets/js/catalog.js';

const MAX_QTY = 10;
const products = new Map(SHOP.products.map((p) => [p.id, p]));

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

export const onRequestGet = ({ env }) => json({ enabled: Boolean(env.STRIPE_SECRET_KEY) });

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Online payment is not set up yet.', fallback: true }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // Confere cada item com o catálogo e junta repetidos
  const lines = new Map();
  for (const item of Array.isArray(body?.items) ? body.items.slice(0, 40) : []) {
    const p = products.get(item?.id);
    if (!p) return json({ error: 'A piece in your bag is no longer available. Please remove it and try again.' }, 409);
    if (p.stock === 0) return json({ error: `Sorry, the ${p.name} has just sold out. Please remove it to continue.` }, 409);
    const v = p.variants ? p.variants.find((x) => x.id === item.variant) : null;
    if (p.variants && !v) return json({ error: `Please choose a colour for the ${p.name}.` }, 409);
    const qty = Math.floor(Number(item.qty));
    if (!Number.isFinite(qty) || qty < 1) return json({ error: 'Invalid quantity.' }, 400);
    const key = `${p.id}:${v ? v.id : ''}`;
    const line = lines.get(key) || { p, v, qty: 0 };
    line.qty += qty;
    lines.set(key, line);
  }
  if (!lines.size) return json({ error: 'Your bag is empty.' }, 400);

  // Estoque por produto (somando as cores)
  const perProduct = new Map();
  for (const { p, qty } of lines.values()) perProduct.set(p, (perProduct.get(p) || 0) + qty);
  for (const [p, qty] of perProduct) {
    if (typeof p.stock === 'number' && qty > p.stock) {
      return json({ error: `We only have ${p.stock} of the ${p.name}. Please lower the quantity.` }, 409);
    }
    if (qty > MAX_QTY) return json({ error: `You can order up to ${MAX_QTY} of each piece online. For more, message Lulu.` }, 409);
  }

  const origin = (env.SITE_URL || SHOP.siteUrl || new URL(request.url).origin).replace(/\/$/, '');
  const currency = SHOP.currency.toLowerCase();
  const pence = (n) => String(Math.round(n * 100));
  const subtotal = [...lines.values()].reduce((n, l) => n + l.p.price * l.qty, 0);

  const form = new URLSearchParams();
  form.set('mode', 'payment');
  form.set('locale', 'en-GB');
  form.set('submit_type', 'pay');
  form.set('success_url', `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`);
  form.set('cancel_url', `${origin}/shop?bag=open`);
  form.set('allow_promotion_codes', 'true');
  form.set('phone_number_collection[enabled]', 'true');
  form.set('billing_address_collection', 'auto');
  form.set('metadata[source]', 'website');

  [...lines.values()].forEach(({ p, v, qty }, i) => {
    const k = `line_items[${i}]`;
    form.set(`${k}[quantity]`, String(qty));
    form.set(`${k}[price_data][currency]`, currency);
    form.set(`${k}[price_data][unit_amount]`, pence(p.price));
    form.set(`${k}[price_data][product_data][name]`, v ? `${p.name} (${v.name})` : p.name);
    if (p.summary) form.set(`${k}[price_data][product_data][description]`, p.summary);
    form.set(`${k}[price_data][product_data][metadata][product_id]`, p.id);
    if (v) form.set(`${k}[price_data][product_data][metadata][colour]`, v.id);
    if (origin.startsWith('https://')) {
      form.set(`${k}[price_data][product_data][images][0]`, `${origin}/assets/products/${v ? `${p.id}-${v.id}` : p.id}-sq.jpg`);
    }
  });

  (SHOP.shipping.countries || ['GB']).forEach((c, i) => form.set(`shipping_address_collection[allowed_countries][${i}]`, c));
  SHOP.shipping.options.forEach((o, i) => {
    const free = i === 0 && subtotal >= SHOP.shipping.freeOver;
    const k = `shipping_options[${i}][shipping_rate_data]`;
    form.set(`${k}[type]`, 'fixed_amount');
    form.set(`${k}[display_name]`, free ? `${o.name} · Free` : o.name);
    form.set(`${k}[fixed_amount][amount]`, free ? '0' : pence(o.price));
    form.set(`${k}[fixed_amount][currency]`, currency);
    if (o.days) {
      form.set(`${k}[delivery_estimate][minimum][unit]`, 'business_day');
      form.set(`${k}[delivery_estimate][minimum][value]`, String(o.days[0]));
      form.set(`${k}[delivery_estimate][maximum][unit]`, 'business_day');
      form.set(`${k}[delivery_estimate][maximum][value]`, String(o.days[1]));
    }
  });

  // Recado para presente (aparece no pedido no painel do Stripe)
  form.set('custom_fields[0][key]', 'giftmessage');
  form.set('custom_fields[0][label][type]', 'custom');
  form.set('custom_fields[0][label][custom]', 'Gift message');
  form.set('custom_fields[0][type]', 'text');
  form.set('custom_fields[0][optional]', 'true');
  form.set('custom_fields[0][text][maximum_length]', '200');

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    console.error('Stripe checkout error:', res.status, data?.error?.message);
    return json({ error: 'The payment page could not be opened. Please try again.' }, 502);
  }
  return json({ url: data.url });
}
