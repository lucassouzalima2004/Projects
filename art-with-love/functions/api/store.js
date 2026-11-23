/* GET /api/store → o que o painel mudou (lançamento da semana, preços e estoque),
 * para a loja aplicar antes de abrir. A chave do Stripe nunca sai daqui. */
import { readStore, json } from '../lib/store.js';

export async function onRequestGet({ env }) {
  const store = await readStore(env);
  return json({ launch: store.launch || null, products: store.products || {} });
}
