/* Entrada do Cloudflare Worker: liga os endereços às funções em functions/.
 * Os arquivos de public/ são servidos direto pelo Cloudflare (veja wrangler.jsonc);
 * este código só roda para as páginas, /api/*, /media/*, /admin, /sitemap.xml e /robots.txt. */
import * as checkout from './functions/api/checkout.js';
import * as order from './functions/api/order.js';
import * as store from './functions/api/store.js';
import * as sitemap from './functions/sitemap.xml.js';
import * as robots from './functions/robots.txt.js';
import { handle as admin } from './functions/api/admin.js';
import { onRequest as pages } from './functions/_middleware.js';

const ROUTES = {
  '/api/checkout': checkout,
  '/api/order': order,
  '/api/store': store,
  '/sitemap.xml': sitemap,
  '/robots.txt': robots,
};

// Fotos dos laços enviadas pelo painel (guardadas no KV)
async function media(env, id) {
  if (!env.CMS || !/^[0-9a-f-]{36}$/.test(id)) return new Response('Not found', { status: 404 });
  const { value, metadata } = await env.CMS.getWithMetadata(`img:${id}`, 'arrayBuffer');
  if (!value) return new Response('Not found', { status: 404 });
  return new Response(value, {
    headers: { 'content-type': metadata?.type || 'image/png', 'cache-control': 'public, max-age=31536000, immutable' },
  });
}

// Página do painel: arquivo estático, fora do Google
async function adminPage(request, env) {
  const res = await env.ASSETS.fetch(request);
  const out = new Response(res.body, res);
  out.headers.set('x-robots-tag', 'noindex, nofollow');
  out.headers.set('cache-control', 'no-store');
  return out;
}

export default {
  async fetch(request, env, ctx) {
    const context = {
      request,
      env,
      waitUntil: (p) => ctx.waitUntil(p),
      next: () => env.ASSETS.fetch(request),
    };
    const path = new URL(request.url).pathname;
    if (path.startsWith('/api/admin/')) return admin(context);
    if (path.startsWith('/media/')) return media(env, path.slice(7));
    if (path === '/admin' || path.startsWith('/admin/')) return adminPage(request, env);
    const mod = ROUTES[path];
    if (!mod) return pages(context);
    const method = request.method === 'HEAD' ? 'Get' : request.method[0] + request.method.slice(1).toLowerCase();
    const handler = mod[`onRequest${method}`] || mod.onRequest;
    if (!handler) return new Response('Method not allowed', { status: 405 });
    return handler(context);
  },
};
