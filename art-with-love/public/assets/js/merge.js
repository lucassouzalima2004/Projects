/* Junta ao catálogo o que a Lulu muda pelo painel (/admin): preço, estoque e o
 * lançamento da semana. Usado no navegador (store.js) e no servidor
 * (functions/lib/store.js), para os dois verem sempre a mesma loja. */
export function applyStore(shop, store) {
  if (!store || typeof store !== 'object') return shop;
  const over = store.products || {};
  for (const p of shop.products) {
    const o = over[p.id];
    if (!o) continue;
    if (typeof o.price === 'number' && o.price > 0) p.price = o.price;
    if (o.stock === null) delete p.stock; // sem limite
    else if (Number.isInteger(o.stock) && o.stock >= 0) p.stock = o.stock;
  }
  if (store.launch && Array.isArray(store.launch.looks)) shop.launch = store.launch;
  return shop;
}
