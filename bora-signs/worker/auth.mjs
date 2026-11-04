// Panel sign-in: users with PBKDF2 password hashes, and sessions in a signed cookie (no server-side session store).
// Users live in KV under "users". Until someone changes a password or adds a user, the starting users in seed.mjs apply.

import seed from './seed.mjs';

const enc = new TextEncoder();
const COOKIE = 'bs_session';
const SESSION_DAYS = 14;
export const ITERATIONS = 20000; // Workers cap PBKDF2 at 100k; this keeps sign-in fast on the free plan

const b64 = (bytes) => btoa(String.fromCharCode(...bytes));
const unb64 = (s) => Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0));
const b64url = (bytes) => b64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s) => unb64(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));

export const randomId = (len = 12) => {
  const abc = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return [...bytes].map((b) => abc[b % abc.length]).join('');
};

function same(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function hashPassword(password, salt = b64(crypto.getRandomValues(new Uint8Array(16))), iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unb64(salt), iterations }, key, 256);
  return { salt, iterations, hash: b64(new Uint8Array(bits)) };
}

export async function users(env) {
  const list = await env.CMS.get('users', 'json');
  return Array.isArray(list) && list.length ? list : seed;
}
export const saveUsers = (env, list) => env.CMS.put('users', JSON.stringify(list));
export const publicUser = (u) => ({ username: u.username, name: u.name, mustChange: !!u.mustChange });

export async function checkPassword(user, password) {
  if (!user || typeof password !== 'string') return false;
  const { hash } = await hashPassword(password, user.salt, user.iterations || ITERATIONS);
  return same(hash, user.hash);
}

let secretMemo = null;
async function secretKey(env) {
  if (secretMemo) return secretMemo;
  let secret = await env.CMS.get('auth:secret');
  if (!secret) {
    secret = b64(crypto.getRandomValues(new Uint8Array(32)));
    await env.CMS.put('auth:secret', secret);
  }
  secretMemo = await crypto.subtle.importKey('raw', unb64(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  return secretMemo;
}

// A user's "v" changes with every password change, which signs out their other sessions
export async function sessionCookie(env, user, secure) {
  const payload = b64url(enc.encode(JSON.stringify({ u: user.username, v: user.v || 0, exp: Date.now() + SESSION_DAYS * 864e5 })));
  const sig = b64url(new Uint8Array(await crypto.subtle.sign('HMAC', await secretKey(env), enc.encode(payload))));
  return `${COOKIE}=${payload}.${sig}; Path=/; HttpOnly;${secure ? ' Secure;' : ''} SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}`;
}
export const clearCookie = (secure) => `${COOKIE}=; Path=/; HttpOnly;${secure ? ' Secure;' : ''} SameSite=Strict; Max-Age=0`;

export async function currentUser(req, env) {
  const raw = (req.headers.get('Cookie') || '').split(/;\s*/).find((p) => p.startsWith(`${COOKIE}=`));
  if (!raw) return null;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!payload || !sig) return null;
  let ok = false;
  try {
    ok = await crypto.subtle.verify('HMAC', await secretKey(env), unb64url(sig), enc.encode(payload));
  } catch {
    return null;
  }
  if (!ok) return null;
  let data;
  try {
    data = JSON.parse(new TextDecoder().decode(unb64url(payload)));
  } catch {
    return null;
  }
  if (!data || data.exp < Date.now()) return null;
  const user = (await users(env)).find((u) => u.username === data.u);
  return user && (user.v || 0) === data.v ? user : null;
}

// Simple fixed-window limit per visitor (KV counters that expire on their own)
export async function limited(env, key, max, seconds) {
  const k = `rl:${key}`;
  const n = +(await env.CMS.get(k)) || 0;
  if (n >= max) return true;
  await env.CMS.put(k, String(n + 1), { expirationTtl: Math.max(60, seconds) });
  return false;
}
export const clearLimit = (env, key) => env.CMS.delete(`rl:${key}`);
