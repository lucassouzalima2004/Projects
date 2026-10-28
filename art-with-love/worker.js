/* Entrada do Cloudflare Worker: liga os endereços às funções em functions/.
 * Os arquivos de public/ são servidos direto pelo Cloudflare (veja wrangler.jsonc);
 * este código só roda para as páginas, /api/*, /sitemap.xml e /robots.txt. */
import * as checkout from './functions/api/checkout.js';
import * as order from './functions/api/order.js';
import * as sitemap from './functions/sitemap.xml.js';
import * as robots from './functions/robots.txt.js';
import { onRequest as pages } from './functions/_middleware.js';

const ROUTES = {
  '/api/checkout': checkout,
  '/api/order': order,
  '/sitemap.xml': sitemap,
  '/robots.txt': robots,
};

export default {
  async fetch(request, env, ctx) {
    const context = {
      request,
      env,
      waitUntil: (p) => ctx.waitUntil(p),
      next: () => env.ASSETS.fetch(request),
    };
    const mod = ROUTES[new URL(request.url).pathname];
    if (!mod) return pages(context);
    const method = request.method === 'HEAD' ? 'Get' : request.method[0] + request.method.slice(1).toLowerCase();
    const handler = mod[`onRequest${method}`] || mod.onRequest;
    if (!handler) return new Response('Method not allowed', { status: 405 });
    return handler(context);
  },
};
