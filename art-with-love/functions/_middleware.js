/* Antes de entregar a página, escreve no HTML o título, a descrição e a imagem de
 * prévia certos para cada endereço. É isso que o WhatsApp, o Instagram, o Facebook
 * e o Google leem (eles não rodam o JavaScript da loja).
 * Endereços que não existem recebem o status 404. */
import SHOP from '../public/assets/js/catalog.js';

const BRAND = 'Art with Love by Lulu';
const products = new Map(SHOP.products.map((p) => [p.id, p]));
const collections = new Map(SHOP.collections.map((c) => [c.id, c]));
const money = (n) => `£${Number.isInteger(n) ? n : n.toFixed(2)}`;
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const DEFAULT = {
  title: `${BRAND} · Luxury handmade hair bows, London`,
  description: `Luxury handmade hair bows, baby headbands and cold porcelain keepsakes, made one at a time in London. Free UK delivery over ${money(SHOP.shipping.freeOver)}.`,
  image: '/assets/img/og-image.jpg',
};

const PAGES = {
  '/': {},
  '/shop': { title: `Shop all · ${BRAND}`, description: 'Shop handmade hair bows, clip sets and baby headbands, made in London.' },
  '/made-to-order': { title: `Made to order · Birthday candles and bespoke bows · ${BRAND}`, description: 'Themed cold porcelain birthday candles and bespoke bows, made to order in London.' },
  '/about': { title: `Our story · ${BRAND}`, description: 'Art with Love is Lulu’s studio in London, making luxury handmade bows and cold porcelain keepsakes.' },
  '/help': { title: `Help · Delivery, returns and care · ${BRAND}`, description: 'Delivery, returns, care and safety information.' },
  '/legal': { title: `Privacy and terms · ${BRAND}`, description: 'Privacy policy and terms of sale.' },
  '/thank-you': { title: `Thank you · ${BRAND}`, noindex: true },
};

function metaFor(url, origin) {
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (PAGES[path]) return { ...DEFAULT, ...PAGES[path] };

  const shop = path.match(/^\/shop\/([\w-]+)$/);
  if (shop && collections.has(shop[1])) {
    const c = collections.get(shop[1]);
    const cover = products.get(c.cover);
    return {
      title: `${c.name} · ${BRAND}`,
      description: c.blurb,
      image: cover ? `/assets/og/${cover.variants ? `${cover.id}-${cover.variants[0].id}` : cover.id}.jpg` : DEFAULT.image,
    };
  }

  const prod = path.match(/^\/product\/([\w-]+)$/);
  if (prod && products.has(prod[1])) {
    const p = products.get(prod[1]);
    const v = p.variants ? p.variants.find((x) => x.id === url.searchParams.get('colour')) || p.variants[0] : null;
    const base = v ? `${p.id}-${v.id}` : p.id;
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.summary || p.name,
      image: Array.from({ length: (v ? v.photos : p.photos) || 1 }, (_, i) => `${origin}/assets/products/${base}-${i + 1}-l.webp`),
      brand: { '@type': 'Brand', name: SHOP.brand.name },
      sku: v ? `${p.id}-${v.id}` : p.id,
      offers: {
        '@type': 'Offer',
        url: `${origin}/product/${p.id}`,
        priceCurrency: SHOP.currency,
        price: p.price.toFixed(2),
        availability: p.stock === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    };
    return {
      title: `${p.name}${v && v !== p.variants[0] ? ` · ${v.name}` : ''} · ${BRAND}`,
      description: `${p.summary ? `${p.summary} ` : ''}${money(p.price)}, handmade in London.`,
      image: `/assets/og/${base}.jpg`,
      type: 'product',
      ld,
    };
  }

  return { ...DEFAULT, title: `Page not found · ${BRAND}`, noindex: true, status: 404 };
}

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.pathname.startsWith('/api/') || /\.[a-z0-9]+$/i.test(url.pathname)) return next();

  const res = await next();
  if (!(res.headers.get('content-type') || '').includes('text/html')) return res;

  const origin = (SHOP.siteUrl || url.origin).replace(/\/$/, '');
  const meta = metaFor(url, origin);
  const set = (name, value) => ({ element(e) { e.setAttribute(name, value); } });

  const out = new HTMLRewriter()
    .on('title', { element(e) { e.setInnerContent(meta.title); } })
    .on('meta[name="description"]', set('content', meta.description))
    .on('meta[property="og:title"]', set('content', meta.title))
    .on('meta[property="og:description"]', set('content', meta.description))
    .on('meta[property="og:image"]', set('content', `${origin}${meta.image}`))
    .on('meta[property="og:type"]', set('content', meta.type || 'website'))
    .on('link[rel="canonical"]', set('href', `${origin}${url.pathname}`))
    .on('head', {
      element(e) {
        e.append(`<meta property="og:url" content="${attr(origin + url.pathname)}">`, { html: true });
        if (meta.noindex) e.append('<meta name="robots" content="noindex">', { html: true });
        if (meta.ld) e.append(`<script type="application/ld+json">${JSON.stringify(meta.ld).replace(/</g, '\\u003c')}</script>`, { html: true });
      },
    })
    .transform(res);

  if (meta.status === 404) return new Response(out.body, { status: 404, headers: out.headers });
  return out;
}
