/* Resumo do pedido para a página de agradecimento (/thank-you?session_id=…).
 * Só devolve o primeiro nome, os itens e o total de um pagamento já concluído. */

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get('session_id') || '';
  if (!env.STRIPE_SECRET_KEY || !/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(id)) return json({ error: 'Not found' }, 404);

  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}?expand[]=line_items`, {
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });
  if (!res.ok) return json({ error: 'Not found' }, 404);
  const s = await res.json();
  if (s.payment_status !== 'paid') return json({ error: 'Not paid' }, 404);

  return json({
    name: (s.customer_details?.name || '').trim().split(/\s+/)[0] || '',
    total: s.amount_total / 100,
    items: (s.line_items?.data || []).map((li) => ({ name: li.description, qty: li.quantity, total: li.amount_total / 100 })),
  });
}
