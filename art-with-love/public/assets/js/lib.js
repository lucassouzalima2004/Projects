/* Catálogo, sacola e utilidades compartilhadas pelas páginas. */
import SHOP from './catalog.js';

export { SHOP };

export const MAX_QTY = 10;

/* ------------------------------------------------------------------ texto --- */
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const fmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: SHOP.currency || 'GBP' });
export const money = (n) => fmt.format(n).replace(/\.00$/, '');

export const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

/* --------------------------------------------------------------- catálogo --- */
export const products = SHOP.products;
export const productById = new Map(products.map((p) => [p.id, p]));
export const collections = SHOP.collections;
export const collectionById = new Map(collections.map((c) => [c.id, c]));

export const inCollection = (p, c) => (c.kind === 'edit' ? (p.tags || []).includes(c.id) : p.range === c.id);
export const productsIn = (c) => products.filter((p) => inCollection(p, c));
export const rangeOf = (p) => collectionById.get(p.range);

export const variantOf = (p, id) => (p.variants ? p.variants.find((v) => v.id === id) || p.variants[0] : null);
export const photoCount = (p, v) => (v ? v.photos : p.photos) || 1;
export const photo = (p, v, n = 1, size = 's') => `/assets/products/${v ? `${p.id}-${v.id}` : p.id}-${n}-${size}.webp`;
export const photos = (p, v, size) => Array.from({ length: photoCount(p, v) }, (_, i) => photo(p, v, i + 1, size));
export const productUrl = (p, v) => `/product/${p.id}${v && p.variants && v !== p.variants[0] ? `?colour=${v.id}` : ''}`;

export const isSoldOut = (p) => p.stock === 0;
export const maxQty = (p) => (typeof p.stock === 'number' ? Math.min(p.stock, MAX_QTY) : MAX_QTY);
export const lowStock = (p) => typeof p.stock === 'number' && p.stock > 0 && p.stock <= 3;

export const altText = (p, v, n = 1) =>
  `${p.name}${v ? ` in ${v.name}` : ''}${n > 1 ? `, photo ${n}` : ''}, shown with a ruler for size`;

/* ---------------------------------------------------------------- entrega --- */
export const shipping = SHOP.shipping;
export const freeLeft = (subtotal) => Math.max(0, shipping.freeOver - subtotal);
export const cheapestShipping = () => Math.min(...shipping.options.map((o) => o.price));

/* ---------------------------------------------------------------- contato --- */
export const waLink = (text) => `https://wa.me/${SHOP.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
export const igLink = () => (SHOP.instagram ? `https://instagram.com/${SHOP.instagram}` : '');

/* ----------------------------------------------------------------- sacola --- */
const KEY = 'awl-bag-v1';
const listeners = new Set();
let lines = read();

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return sanitize(Array.isArray(raw) ? raw : []);
  } catch {
    return [];
  }
}

// Descarta produtos que saíram do catálogo e respeita o estoque.
function sanitize(list) {
  const out = [];
  for (const l of list) {
    const p = productById.get(l?.id);
    if (!p || isSoldOut(p)) continue;
    const v = p.variants ? p.variants.find((x) => x.id === l.variant) : null;
    if (p.variants && !v) continue;
    const qty = Math.max(1, Math.min(maxQty(p), Math.floor(Number(l.qty) || 1)));
    out.push({ id: p.id, variant: v ? v.id : null, qty });
  }
  return out;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* modo privado */ }
  listeners.forEach((fn) => fn(bag));
}

window.addEventListener('storage', (e) => {
  if (e.key !== KEY) return;
  lines = read();
  listeners.forEach((fn) => fn(bag));
});

const same = (l, id, variant) => l.id === id && (l.variant || null) === (variant || null);

export const bag = {
  get lines() {
    return lines.map((l) => {
      const product = productById.get(l.id);
      const variant = variantOf(product, l.variant);
      return { id: l.id, variantId: l.variant, qty: l.qty, product, variant, total: product.price * l.qty };
    });
  },
  get count() { return lines.reduce((n, l) => n + l.qty, 0); },
  get subtotal() { return lines.reduce((n, l) => n + productById.get(l.id).price * l.qty, 0); },
  qtyOf(id, variant) { return lines.find((l) => same(l, id, variant))?.qty || 0; },
  add(id, variant, qty = 1) {
    const p = productById.get(id);
    if (!p || isSoldOut(p)) return 0;
    const line = lines.find((l) => same(l, id, variant));
    const before = line ? line.qty : 0;
    const after = Math.min(maxQty(p), before + qty);
    if (line) line.qty = after;
    else lines.push({ id, variant: variant || null, qty: after });
    save();
    return after - before;
  },
  set(id, variant, qty) {
    const p = productById.get(id);
    const line = lines.find((l) => same(l, id, variant));
    if (!line) return;
    if (qty <= 0) lines = lines.filter((l) => l !== line);
    else line.qty = Math.min(maxQty(p), qty);
    save();
  },
  remove(id, variant) {
    lines = lines.filter((l) => !same(l, id, variant));
    save();
  },
  clear() {
    lines = [];
    save();
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

/* ------------------------------------------------------- anúncios (Meta) --- */
export function track(event, data) {
  if (typeof window.fbq === 'function') window.fbq('track', event, data);
}

// Recebe bag.lines
const pixelId = (l) => (l.variantId ? `${l.id}:${l.variantId}` : l.id);
export const pixelData = (list) => ({
  content_type: 'product',
  content_ids: list.map(pixelId),
  contents: list.map((l) => ({ id: pixelId(l), quantity: l.qty })),
  value: list.reduce((n, l) => n + productById.get(l.id).price * l.qty, 0),
  currency: SHOP.currency,
});
