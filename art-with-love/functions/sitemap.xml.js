/* Mapa do site para o Google, montado a partir do catálogo (sempre atualizado). */
import SHOP from '../public/assets/js/catalog.js';

export function onRequestGet({ request }) {
  const origin = (SHOP.siteUrl || new URL(request.url).origin).replace(/\/$/, '');
  const paths = [
    '/', '/shop', '/made-to-order', '/about', '/help', '/legal',
    ...SHOP.collections.map((c) => `/shop/${c.id}`),
    ...SHOP.products.map((p) => `/product/${p.id}`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
