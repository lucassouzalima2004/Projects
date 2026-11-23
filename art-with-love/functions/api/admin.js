/* API do painel da Lulu (/admin). Tudo aqui exige login, menos o próprio login.
 *
 * Secrets do Worker (npx wrangler secret put):
 *   ADMIN_PASSWORD  senha do painel
 *   SESSION_SECRET  texto aleatório que assina o login (trocar desloga todo mundo)
 * KV (binding CMS): veja functions/lib/store.js
 */
import SHOP from '../../public/assets/js/catalog.js';
import { readStore, writeStore, loadShop, readStripe, json } from '../lib/store.js';

const COOKIE = 'awl_admin';
const SESSION_DAYS = 30;
const MAX_UPLOAD = 3 * 1024 * 1024;
const enc = new TextEncoder();

/* ------------------------------------------------------------ sessão --- */
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function sign(env, data) {
  const secret = `${env.SESSION_SECRET || ''}:${env.ADMIN_PASSWORD}`; // trocar a senha também desloga
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

const sha = async (s) => b64url(await crypto.subtle.digest('SHA-256', enc.encode(s)));

function sameString(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function isLoggedIn(request, env) {
  const raw = (request.headers.get('cookie') || '').split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw) return false;
  const [exp, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return sameString(sig, await sign(env, `awl-admin:${exp}`));
}

const cookie = (value, maxAge) => `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

/* --------------------------------------------------- dados do lançamento --- */
const BASE_LOOKS = SHOP.launch?.looks || [];
const DOLLS = BASE_LOOKS.map((l) => ({ art: l.art, artSmall: l.artSmall }));
const BASE_BOWS = [...new Map(BASE_LOOKS.flatMap((l) => l.bows || []).map((b) => [b.src, {
  src: b.src,
  name: b.src.replace(/^.*bow-|\.webp$/g, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}])).values()];

const isMedia = (s) => /^\/media\/[0-9a-f-]{36}$/.test(s);
const isAssetBow = (s) => /^assets\/img\/launch\/[\w-]+\.webp$/.test(s);
const clamp = (n, lo, hi, d) => (Number.isFinite(Number(n)) ? Math.min(hi, Math.max(lo, Math.round(Number(n) * 10) / 10)) : d);
const text = (s, max) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

function cleanLaunch(input) {
  const products = new Set(SHOP.products.map((p) => p.id));
  const collections = new Set(SHOP.collections.map((c) => c.id));
  const looks = (Array.isArray(input?.looks) ? input.looks : []).slice(0, 8).map((l) => {
    const doll = DOLLS.find((d) => d.art === l?.art);
    if (!doll) throw new Error('Bonequinha desconhecida.');
    const bows = (Array.isArray(l.bows) ? l.bows : []).slice(0, 4).map((b) => {
      const src = String(b?.src || '');
      if (!isMedia(src) && !isAssetBow(src)) throw new Error('Laço inválido.');
      return {
        src,
        x: clamp(b.x, 0, 100, 50),
        y: clamp(b.y, 0, 100, 20),
        width: clamp(b.width, 3, 80, 20),
        rotate: clamp(b.rotate, -180, 180, 0),
        ...(b.flip ? { flip: true } : {}),
      };
    });
    const look = { art: doll.art, artSmall: doll.artSmall, bows, label: text(l.label, 30) };
    if (products.has(l.product)) look.product = l.product;
    else if (collections.has(l.collection)) look.collection = l.collection;
    return look;
  });
  return {
    eyebrow: text(input?.eyebrow, 40) || 'New this week',
    title: text(input?.title, 60),
    text: text(input?.text, 240),
    looks,
  };
}

/* -------------------------------------------------------------- rotas --- */
async function login(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  const failKey = `fail:${ip}`;
  const fails = Number(await env.CMS.get(failKey)) || 0;
  if (fails >= 10) return json({ error: 'Muitas tentativas. Espere 15 minutos e tente de novo.' }, 429);
  const { password } = await request.json().catch(() => ({}));
  const ok = typeof password === 'string' && sameString(await sha(password.trim()), await sha(env.ADMIN_PASSWORD));
  if (!ok) {
    await env.CMS.put(failKey, String(fails + 1), { expirationTtl: 900 });
    return json({ error: 'Senha incorreta.' }, 401);
  }
  const exp = Date.now() + SESSION_DAYS * 864e5;
  return json({ ok: true }, 200, { 'set-cookie': cookie(`${exp}.${await sign(env, `awl-admin:${exp}`)}`, SESSION_DAYS * 86400) });
}

async function data(env) {
  const [store, shop, stripe] = await Promise.all([readStore(env), loadShop(env), readStripe(env)]);
  const base = new Map(SHOP.products.map((p) => [p.id, p]));
  return json({
    launch: shop.launch,
    dolls: DOLLS,
    bows: [...BASE_BOWS, ...(store.bows || [])],
    products: shop.products.map((p) => ({
      id: p.id,
      name: p.name,
      size: p.size,
      price: p.price,
      basePrice: base.get(p.id).price,
      stock: typeof p.stock === 'number' ? p.stock : null,
      photo: `/assets/products/${p.variants ? `${p.id}-${p.variants[0].id}` : p.id}-1-s.webp`,
    })),
    collections: SHOP.collections.map((c) => ({ id: c.id, name: c.name })),
    stripe: env.STRIPE_SECRET_KEY
      ? { connected: true, name: 'Conectado pelo Lucas', livemode: env.STRIPE_SECRET_KEY.includes('_live_'), fixed: true }
      : stripe
        ? { connected: true, name: stripe.name, livemode: stripe.livemode, keyEnd: stripe.secretKey.slice(-4), connectedAt: stripe.connectedAt }
        : { connected: false },
  });
}

async function saveLaunch(request, env) {
  let launch;
  try {
    launch = cleanLaunch(await request.json());
  } catch (e) {
    return json({ error: e.message || 'Dados inválidos.' }, 400);
  }
  const store = await readStore(env);
  store.launch = launch;
  await writeStore(env, store);
  return json({ ok: true, launch });
}

async function saveProducts(request, env) {
  const body = await request.json().catch(() => ({}));
  const ids = new Set(SHOP.products.map((p) => p.id));
  const out = {};
  for (const [id, o] of Object.entries(body?.products || {})) {
    if (!ids.has(id)) continue;
    const price = Math.round(Number(o?.price) * 100) / 100;
    const entry = {};
    if (Number.isFinite(price) && price > 0 && price < 10000) entry.price = price;
    if (o?.stock === null || o?.stock === '') entry.stock = null;
    else if (Number.isInteger(Number(o?.stock)) && Number(o.stock) >= 0) entry.stock = Math.min(999, Number(o.stock));
    out[id] = entry;
  }
  const store = await readStore(env);
  store.products = out;
  await writeStore(env, store);
  return json({ ok: true });
}

const MAGIC = {
  'image/png': (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8,
  'image/webp': (b) => b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
};

async function upload(request, env) {
  const type = (request.headers.get('content-type') || '').split(';')[0];
  if (!MAGIC[type]) return json({ error: 'Envie uma foto PNG, JPG ou WebP.' }, 415);
  const buf = await request.arrayBuffer();
  if (!buf.byteLength || buf.byteLength > MAX_UPLOAD) return json({ error: 'A foto precisa ter até 3 MB.' }, 413);
  if (!MAGIC[type](new Uint8Array(buf.slice(0, 12)))) return json({ error: 'Arquivo de imagem inválido.' }, 415);
  const id = crypto.randomUUID();
  await env.CMS.put(`img:${id}`, buf, { metadata: { type } });
  const store = await readStore(env);
  const bow = { src: `/media/${id}`, name: text(decodeURIComponent(request.headers.get('x-name') || ''), 40) || 'Laço novo', at: new Date().toISOString() };
  store.bows = [...(store.bows || []), bow].slice(-60);
  await writeStore(env, store);
  return json({ ok: true, bow });
}

async function removeBow(request, env) {
  const src = new URL(request.url).searchParams.get('src') || '';
  const store = await readStore(env);
  store.bows = (store.bows || []).filter((b) => b.src !== src);
  await writeStore(env, store);
  return json({ ok: true });
}

async function connectStripe(request, env) {
  const { secretKey } = await request.json().catch(() => ({}));
  const key = String(secretKey || '').trim();
  if (!/^(sk|rk)_(live|test)_[A-Za-z0-9]{10,}$/.test(key)) {
    return json({ error: 'Essa não parece uma chave secreta do Stripe. Ela começa com sk_live_ (ou sk_test_ para testar).' }, 400);
  }
  const res = await fetch('https://api.stripe.com/v1/account', { headers: { authorization: `Bearer ${key}` } });
  if (res.status === 401) return json({ error: 'O Stripe não aceitou essa chave. Copie de novo a chave secreta (Secret key).' }, 400);
  const acct = await res.json().catch(() => ({}));
  const name = acct.settings?.dashboard?.display_name || acct.business_profile?.name || acct.email || 'Conta Stripe';
  const info = { secretKey: key, accountId: acct.id || '', name, livemode: key.includes('_live_'), connectedAt: new Date().toISOString() };
  await env.CMS.put('stripe', JSON.stringify(info));
  return json({ ok: true, stripe: { connected: true, name, livemode: info.livemode, keyEnd: key.slice(-4), connectedAt: info.connectedAt } });
}

export async function handle({ request, env }) {
  if (!env.CMS || !env.ADMIN_PASSWORD) return json({ error: 'O painel ainda não foi configurado.' }, 503);
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/api\/admin\/?/, '');
  const m = request.method;

  // pedidos que mudam algo só podem vir do próprio site
  if (m !== 'GET') {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== url.host) return json({ error: 'Origem não permitida.' }, 403);
  }

  if (route === 'login' && m === 'POST') return login(request, env);
  if (route === 'logout' && m === 'POST') return json({ ok: true }, 200, { 'set-cookie': cookie('', 0) });
  if (!(await isLoggedIn(request, env))) return json({ error: 'Entre com a sua senha.' }, 401);

  if (route === 'session' && m === 'GET') return json({ ok: true });
  if (route === 'data' && m === 'GET') return data(env);
  if (route === 'launch' && m === 'PUT') return saveLaunch(request, env);
  if (route === 'products' && m === 'PUT') return saveProducts(request, env);
  if (route === 'upload' && m === 'POST') return upload(request, env);
  if (route === 'bows' && m === 'DELETE') return removeBow(request, env);
  if (route === 'stripe' && m === 'PUT') return connectStripe(request, env);
  if (route === 'stripe' && m === 'DELETE') {
    await env.CMS.delete('stripe');
    return json({ ok: true, stripe: { connected: false } });
  }
  return json({ error: 'Não encontrado.' }, 404);
}
