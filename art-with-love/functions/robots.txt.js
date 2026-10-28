import SHOP from '../public/assets/js/catalog.js';

export function onRequestGet({ request }) {
  const origin = (SHOP.siteUrl || new URL(request.url).origin).replace(/\/$/, '');
  const body = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /thank-you\n\nSitemap: ${origin}/sitemap.xml\n`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
