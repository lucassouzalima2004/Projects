/* Dados que a Lulu muda pelo painel, guardados no Cloudflare KV (binding CMS):
 *   store   → { launch, products: { id: { price, stock } }, bows: [...] }
 *   stripe  → { secretKey, accountId, name, livemode, connectedAt }
 *   img:<id> → fotos dos laços enviadas pelo painel (servidas em /media/<id>)
 */
import SHOP from '../../public/assets/js/catalog.js';
import { applyStore } from '../../public/assets/js/merge.js';

export async function readStore(env) {
  if (!env.CMS) return {};
  try {
    return (await env.CMS.get('store', 'json')) || {};
  } catch {
    return {};
  }
}

export async function writeStore(env, store) {
  store.updatedAt = new Date().toISOString();
  await env.CMS.put('store', JSON.stringify(store));
}

// Catálogo com os preços, o estoque e o lançamento do painel (uma cópia: o módulo é compartilhado entre pedidos)
export async function loadShop(env) {
  return applyStore(structuredClone(SHOP), await readStore(env));
}

export async function readStripe(env) {
  if (!env.CMS) return null;
  try {
    return await env.CMS.get('stripe', 'json');
  } catch {
    return null;
  }
}

// Chave do Stripe: a do Cloudflare (wrangler secret) tem prioridade; senão, a que a Lulu conectou pelo painel
export async function stripeKey(env) {
  if (env.STRIPE_SECRET_KEY) return env.STRIPE_SECRET_KEY;
  return (await readStripe(env))?.secretKey || '';
}

export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
});
