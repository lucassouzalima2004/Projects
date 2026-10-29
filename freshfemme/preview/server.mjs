// Servidor de preview: renderiza o tema a cada pedido e simula o carrinho da Shopify
// (/cart/add.js, /cart/change.js, /cart.js e ?sections=cart-drawer) em memória.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEME, renderRoute, cartObject, findVariant, store } from './render.mjs';

const PORT = Number(process.env.PORT || 4000);
let lines = [];
const types = { '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => resolve(data));
  });
}
function parseBody(raw, type = '') {
  if (type.includes('application/json')) return JSON.parse(raw || '{}');
  if (type.includes('multipart/form-data')) {
    const out = {};
    for (const m of raw.matchAll(/name="([^"]+)"\r\n\r\n([^\r]*)/g)) out[m[1]] = m[2];
    return out;
  }
  return Object.fromEntries(new URLSearchParams(raw));
}
const send = (res, code, body, type = 'text/html; charset=utf-8') => {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname.startsWith('/preview/videos/')) {
      const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'static/videos', path.basename(url.pathname));
      if (!fs.existsSync(file)) return send(res, 404, 'not found', 'text/plain');
      const type = { '.webm': 'video/webm', '.jpg': 'image/jpeg' }[path.extname(file)] || 'video/mp4';
      return send(res, 200, fs.readFileSync(file), type);
    }
    if (url.pathname.startsWith('/assets/')) {
      const file = path.join(THEME, 'assets', path.basename(url.pathname));
      if (!fs.existsSync(file)) return send(res, 404, 'not found', 'text/plain');
      return send(res, 200, fs.readFileSync(file), types[path.extname(file)] || 'application/octet-stream');
    }
    if (url.pathname === '/cart/add.js' || url.pathname === '/cart/add') {
      const body = parseBody(await readBody(req), req.headers['content-type']);
      const found = findVariant(body.id);
      if (!found) return send(res, 422, JSON.stringify({ status: 422, message: 'Produto não encontrado', description: 'Produto não encontrado' }), 'application/json');
      const qty = Number(body.quantity || 1);
      const line = lines.find((l) => l.variant_id === found.variant.id);
      if (line) line.quantity += qty;
      else lines.push({ product_id: found.product.id, variant_id: found.variant.id, quantity: qty });
      return send(res, 200, JSON.stringify({ id: found.variant.id, quantity: qty }), 'application/json');
    }
    if (url.pathname === '/cart/change.js') {
      const body = parseBody(await readBody(req), req.headers['content-type']);
      const i = Number(body.line) - 1;
      if (lines[i]) {
        if (Number(body.quantity) <= 0) lines.splice(i, 1);
        else lines[i].quantity = Number(body.quantity);
      }
      const cart = cartObject(lines);
      return send(res, 200, JSON.stringify({ item_count: cart.item_count, total_price: cart.total_price }), 'application/json');
    }
    if (url.pathname === '/cart.js') {
      const cart = cartObject(lines);
      return send(res, 200, JSON.stringify({ item_count: cart.item_count, total_price: cart.total_price }), 'application/json');
    }
    if (url.pathname === '/search/suggest.json') {
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const products = Object.values(store.products).filter((p) => p.title.toLowerCase().includes(q)).slice(0, 6)
        .map((p) => ({ title: p.title, url: p.url, image: p.featured_image && p.featured_image.src, price: (p.price / 100).toFixed(2) }));
      return send(res, 200, JSON.stringify({ resources: { results: { products } } }), 'application/json');
    }
    if (url.pathname === '/recommendations/products') return send(res, 404, '', 'text/plain');
    if (url.searchParams.get('sections')) {
      const out = await renderRoute(url.pathname, { cart: cartObject(lines), sections: url.searchParams.get('sections').split(',') });
      return send(res, 200, JSON.stringify(out.json), 'application/json');
    }
    if (url.pathname === '/__cart') {
      // atalho para screenshots: /__cart?add=handle,handle
      lines = [];
      for (const h of (url.searchParams.get('add') || '').split(',').filter(Boolean)) {
        const p = store.products[h];
        if (p) lines.push({ product_id: p.id, variant_id: p.variants[0].id, quantity: 1 });
      }
      return send(res, 200, 'ok', 'text/plain');
    }
    const { html } = await renderRoute(url.pathname + url.search, { cart: cartObject(lines) });
    return send(res, 200, html);
  } catch (err) {
    console.error(err);
    return send(res, 500, `<pre>${String(err.stack || err).replace(/</g, '&lt;')}</pre>`);
  }
}).listen(PORT, () => console.log(`Preview em http://localhost:${PORT}`));
