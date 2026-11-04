// Bora Signs on Cloudflare Workers: the public site, rendered from the published content, and the panel's API.
// Static files (CSS, JS, fonts, photos and the panel itself at /admin) are served by Workers assets before this runs.

import build from './build-info.mjs';
import { normalize, templates, slugify, SCHEMA } from '../src/defaults.mjs';
import { render, renderNotFound, paths, sitemap, cardCount } from '../src/render.mjs';
import { cardIcons } from '../src/icons.mjs';
import images from '../src/images.mjs';
import {
  users, saveUsers, publicUser, checkPassword, hashPassword, sessionCookie, clearCookie, currentUser, limited, clearLimit, randomId,
} from './auth.mjs';
import {
  liveContent, livePointer, getDraft, saveDraft, deleteDraft, getRevision, publish, revisions, prune, mediaList, messageList,
} from './store.mjs';

const RESERVED = new Set(['', 'services', 'contact', 'join-us', 'thank-you', 'blog', 'admin', 'api', 'media', 'assets', '404', 'index', 'sitemap.xml', 'robots.txt', 'favicon.svg']);
const MAX_DOC = 3 * 1024 * 1024;
const MAX_FILE = 12 * 1024 * 1024;

const security = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...security, ...headers } });
const fail = (status, error, extra = {}) => json({ error, ...extra }, status);
const html = (body, status = 200, headers = {}) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...security, ...headers } });

const today = () => new Date().toISOString().slice(0, 10);

/* ---------- site address ---------- */

// The official address (Settings → SEO in the panel) is indexed by Google. Any other host, such as the workers.dev
// link, shows the same site with noindex and its own address in canonical links.
function siteContext(url, content) {
  let official = null;
  try {
    official = content.seo.siteUrl ? new URL(content.seo.siteUrl) : null;
  } catch { /* not a valid address: everything stays out of Google */ }
  const live = !!official && official.host === url.host;
  return { url: live ? official.origin : url.origin, noindex: !live, assets: build.assets, official };
}

/* ---------- public site ---------- */

async function sitePage(req, env, url) {
  const memo = await liveContent(env);
  const content = memo.content;
  const ctx = siteContext(url, content);
  const path = decodeURIComponent(url.pathname);

  // borasigns.com.au → www.borasigns.com.au (or the other way round), when the official address says so
  if (ctx.official && ctx.official.host !== url.host && ctx.official.host.replace(/^www\./, '') === url.host.replace(/^www\./, '')) {
    return Response.redirect(ctx.official.origin + url.pathname + url.search, 301);
  }

  if (path === '/robots.txt') {
    return new Response(`User-agent: *\n${ctx.noindex ? 'Disallow: /' : 'Allow: /\nDisallow: /admin/\nDisallow: /api/'}\n\nSitemap: ${ctx.url}/sitemap.xml\n`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
    });
  }
  if (path === '/sitemap.xml') {
    return new Response(sitemap(content, ctx), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
  }

  const lower = path.toLowerCase().replace(/\/+$/, '') || '/';
  const redirect = content.redirects.find((r) => (r.from.toLowerCase().replace(/\/+$/, '') || '/') === lower);
  if (redirect && redirect.to !== path) return Response.redirect(new URL(redirect.to, url.origin).href, 301);

  // Clean addresses: /page.html and /page/ go to /page
  if (/\.html$/i.test(path)) return Response.redirect(url.origin + (path.replace(/(\/index)?\.html$/i, '') || '/') + url.search, 301);
  if (path.length > 1 && path.endsWith('/')) return Response.redirect(url.origin + path.replace(/\/+$/, '') + url.search, 301);

  const etag = `"${memo.ver}.${build.id}.${today()}.${ctx.noindex ? 0 : 1}"`;
  const headers = { 'Cache-Control': 'public, max-age=0, must-revalidate', ETag: etag };
  const key = `${url.host}${path}`;
  let page = memo.pages.get(key);
  if (!page) {
    let body = null;
    let status = 200;
    try {
      body = render(content, path, ctx);
      if (body == null) {
        status = 404;
        body = renderNotFound(content, ctx);
      }
    } catch (err) {
      console.error('render failed', path, err && err.stack);
      return html('<!doctype html><title>Bora Signs</title><p>Sorry, this page could not be shown. Please call 0482 530 280.</p>', 500);
    }
    page = { body, status };
    if (memo.pages.size > 200) memo.pages.clear();
    memo.pages.set(key, page);
  }
  if (page.status === 200 && req.headers.get('If-None-Match') === etag) return new Response(null, { status: 304, headers: { ...headers, ...security } });
  return html(req.method === 'HEAD' ? null : page.body, page.status, page.status === 200 ? headers : { 'Cache-Control': 'no-cache' });
}

async function mediaFile(req, env, url, ctxEvent) {
  const name = url.pathname.slice(7);
  if (!/^[a-z0-9]{6,40}(-800|-1600)?\.(webp|jpg|png)$/.test(name)) return new Response('Not found', { status: 404 });
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  if (cache) {
    const hit = await cache.match(req);
    if (hit) return hit;
  }
  const { value, metadata } = await env.CMS.getWithMetadata(`file:${name}`, { type: 'stream', cacheTtl: 86400 });
  if (!value) return new Response('Not found', { status: 404 });
  const res = new Response(value, {
    headers: {
      'Content-Type': (metadata && metadata.type) || (name.endsWith('.png') ? 'image/png' : name.endsWith('.jpg') ? 'image/jpeg' : 'image/webp'),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
  if (cache) ctxEvent.waitUntil(cache.put(req, res.clone()));
  return res;
}

/* ---------- forms (public) ---------- */

async function formPost(req, env, kind) {
  if (!['quote', 'join'].includes(kind)) return fail(404, 'Unknown form');
  const ip = req.headers.get('CF-Connecting-IP') || 'local';
  let data = {};
  const type = req.headers.get('Content-Type') || '';
  try {
    if (type.includes('application/json') || type.includes('text/plain')) {
      data = JSON.parse(await req.text());
    } else {
      const form = await req.formData();
      for (const [k, v] of form) if (typeof v === 'string') data[k] = data[k] ? `${data[k]}, ${v}` : v;
    }
  } catch {
    return fail(400, 'Bad form');
  }
  if (!data || typeof data !== 'object') return fail(400, 'Bad form');
  if (data._gotcha || data.vox_protection) return json({ ok: true }); // a bot filled the hidden field
  if (await limited(env, `form:${ip}`, 12, 3600)) return fail(429, 'Too many messages. Please call us instead.');
  const fields = {};
  for (const [k, v] of Object.entries(data).slice(0, 40)) {
    if (/^(_gotcha|vox_protection|pipeline_name|title|lead_source_name|on_success|asset\[\])$/.test(k)) continue;
    const val = (Array.isArray(v) ? v.join(', ') : String(v ?? '')).slice(0, 6000).trim();
    if (val) fields[String(k).slice(0, 60)] = val;
  }
  if (!Object.keys(fields).length) return fail(400, 'Empty form');
  const id = `${Date.now().toString(36)}-${randomId(5)}`;
  const at = new Date().toISOString();
  const name = fields.name || fields.primaryContactName || '';
  const meta = { kind, at, read: false, name: name.slice(0, 80), email: (fields.email || '').slice(0, 120), files: data.files ? String(data.files).slice(0, 10) : '' };
  await env.CMS.put(`msg:${id}`, JSON.stringify({ kind, at, fields, page: String(data.page || '').slice(0, 200) }), { metadata: meta });
  return json({ ok: true });
}

/* ---------- panel API ---------- */

function checkDoc(doc) {
  const c = normalize(doc);
  const problems = [];
  const seen = new Set();
  for (const s of c.services) {
    if (RESERVED.has(s.slug)) problems.push(`O endereço “/${s.slug}” é reservado do site. Escolha outro para o serviço “${s.name}”.`);
    if (seen.has(s.slug)) problems.push(`Dois serviços usam o endereço “/${s.slug}”.`);
    seen.add(s.slug);
    if (!s.name.trim()) problems.push(`Um serviço (/${s.slug}) está sem nome.`);
  }
  const posts = new Set();
  for (const p of c.posts) {
    if (posts.has(p.slug)) problems.push(`Dois posts do blog usam o endereço “/blog/${p.slug}”.`);
    posts.add(p.slug);
    if (!p.title.trim()) problems.push(`Um post (/blog/${p.slug}) está sem título.`);
  }
  if (!c.services.some((s) => !s.hidden)) problems.push('O site precisa de pelo menos um serviço visível.');
  const pages = new Set(['/', '/services', '/contact', '/join-us', '/blog', ...c.services.map((s) => `/${s.slug}`), ...c.posts.map((p) => `/blog/${p.slug}`)]);
  for (const r of c.redirects) {
    const from = (r.from.toLowerCase().replace(/\/+$/, '') || '/');
    if (pages.has(from)) problems.push(`O redirecionamento de “${r.from}” esconde uma página que existe. Apague esse redirecionamento em Configurações → Redirecionamentos.`);
    if (!from.startsWith('/')) problems.push(`O redirecionamento “${r.from}” precisa começar com /.`);
  }
  return { c, problems };
}

// Renders every page once, so a broken document never reaches the public site
function tryRender(c) {
  const ctx = { url: 'https://check.local', noindex: true, assets: build.assets };
  for (const p of paths(c)) {
    try {
      if (render(c, p, ctx) == null) return `A página ${p} não pôde ser montada.`;
    } catch (err) {
      return `Erro ao montar a página ${p}: ${err.message}`;
    }
  }
  try {
    renderNotFound(c, ctx);
  } catch (err) {
    return `Erro ao montar a página 404: ${err.message}`;
  }
  return '';
}

async function readJson(req) {
  const text = await req.text();
  if (text.length > MAX_DOC) throw Object.assign(new Error('Conteúdo grande demais.'), { status: 413 });
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error('Pedido inválido.'), { status: 400 });
  }
}

async function api(req, env, url, event) {
  const path = url.pathname.replace(/\/+$/, '');
  const method = req.method;
  const secure = url.protocol === 'https:';

  const form = /^\/api\/forms\/([a-z]+)$/.exec(path);
  if (form && method === 'POST') return formPost(req, env, form[1]);

  // Everything else is the panel's: same-site requests only
  if (method !== 'GET' && method !== 'HEAD') {
    const origin = req.headers.get('Origin');
    if (origin && origin !== url.origin) return fail(403, 'Origem não permitida.');
  }

  if (path === '/api/login' && method === 'POST') {
    const ip = req.headers.get('CF-Connecting-IP') || 'local';
    if (await limited(env, `login:${ip}`, 8, 900)) return fail(429, 'Muitas tentativas. Espere 15 minutos e tente de novo.');
    const { username, password } = await readJson(req);
    const list = await users(env);
    const user = list.find((u) => u.username === String(username || '').trim().toLowerCase());
    if (!(await checkPassword(user, password))) return fail(401, 'Usuário ou senha incorretos.');
    event.waitUntil(clearLimit(env, `login:${ip}`));
    return json({ user: publicUser(user) }, 200, { 'Set-Cookie': await sessionCookie(env, user, secure) });
  }
  if (path === '/api/logout' && method === 'POST') return json({ ok: true }, 200, { 'Set-Cookie': clearCookie(secure) });

  const me = await currentUser(req, env);
  if (!me) return fail(401, 'Entre de novo para continuar.');

  if (path === '/api/me') return json({ user: publicUser(me) });

  if (path === '/api/password' && method === 'POST') {
    const { current, next } = await readJson(req);
    if (!(await checkPassword(me, current))) return fail(400, 'A senha atual não confere.');
    if (typeof next !== 'string' || next.length < 10) return fail(400, 'A nova senha precisa ter pelo menos 10 caracteres.');
    const list = await users(env);
    const user = list.find((u) => u.username === me.username);
    Object.assign(user, await hashPassword(next), { v: (user.v || 0) + 1, mustChange: false });
    await saveUsers(env, list);
    return json({ user: publicUser(user) }, 200, { 'Set-Cookie': await sessionCookie(env, user, secure) });
  }

  if (path === '/api/users' && method === 'GET') return json({ users: (await users(env)).map(publicUser), me: me.username });
  if (path === '/api/users' && method === 'POST') {
    const { username, name, password } = await readJson(req);
    const u = String(username || '').trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,30}$/.test(u)) return fail(400, 'Use de 3 a 30 letras minúsculas, números, ponto ou traço no usuário.');
    if (typeof password !== 'string' || password.length < 10) return fail(400, 'A senha precisa ter pelo menos 10 caracteres.');
    const list = await users(env);
    if (list.some((x) => x.username === u)) return fail(400, 'Já existe um usuário com esse nome.');
    list.push({ username: u, name: String(name || u).slice(0, 60), ...(await hashPassword(password)), v: 0, mustChange: true });
    await saveUsers(env, list);
    return json({ users: list.map(publicUser) });
  }
  const userPath = /^\/api\/users\/([a-z0-9._-]+)(\/password)?$/.exec(path);
  if (userPath) {
    const list = await users(env);
    const user = list.find((x) => x.username === userPath[1]);
    if (!user) return fail(404, 'Usuário não encontrado.');
    if (method === 'DELETE' && !userPath[2]) {
      if (user.username === me.username) return fail(400, 'Você não pode apagar o seu próprio usuário.');
      await saveUsers(env, list.filter((x) => x !== user));
      return json({ users: list.filter((x) => x !== user).map(publicUser) });
    }
    if (method === 'POST' && userPath[2]) {
      const { password } = await readJson(req);
      if (typeof password !== 'string' || password.length < 10) return fail(400, 'A senha precisa ter pelo menos 10 caracteres.');
      Object.assign(user, await hashPassword(password), { v: (user.v || 0) + 1, mustChange: true });
      await saveUsers(env, list);
      return json({ users: list.map(publicUser) });
    }
  }

  if (path === '/api/state' && method === 'GET') {
    const [ptr, draft, memo, inbox] = await Promise.all([livePointer(env), getDraft(env), liveContent(env), messageList(env)]);
    return json({
      me: publicUser(me),
      live: { ver: memo.ver, at: ptr ? ptr.at : null, by: ptr ? ptr.by : null, content: memo.content },
      draft: draft ? { base: draft.base, at: draft.at, by: draft.by, content: normalize(draft.content) } : null,
      templates,
      cardCount,
      cardIcons,
      builtins: images,
      schema: SCHEMA,
      unread: inbox.filter((m) => !m.read).length,
      siteUrl: url.origin,
    });
  }

  if (path === '/api/draft' && method === 'PUT') {
    const { content, base } = await readJson(req);
    const { c, problems } = checkDoc(content);
    const at = new Date().toISOString();
    await saveDraft(env, { content: c, base: base || null, at, by: me.name });
    return json({ ok: true, at, warnings: problems });
  }
  if (path === '/api/draft' && method === 'DELETE') {
    await deleteDraft(env);
    return json({ ok: true });
  }

  if (path === '/api/publish' && method === 'POST') {
    const { content, base, note, force } = await readJson(req);
    const { c, problems } = checkDoc(content);
    if (problems.length) return fail(422, problems.join(' '), { problems });
    const broken = tryRender(c);
    if (broken) return fail(422, broken);
    const ptr = await livePointer(env);
    const liveVer = ptr ? ptr.ver : 'default';
    if (!force && base && base !== liveVer) {
      return fail(409, `${ptr && ptr.by ? ptr.by : 'Outra pessoa'} publicou uma versão nova enquanto você editava.`, { conflict: true, live: ptr });
    }
    const out = await publish(env, c, me.name, note);
    await deleteDraft(env);
    event.waitUntil(prune(env, out.ver));
    return json({ ok: true, live: out });
  }

  if (path === '/api/revisions' && method === 'GET') return json({ revisions: await revisions(env), live: (await livePointer(env)) || null });
  const rev = /^\/api\/revisions\/([a-z0-9-]+)$/.exec(path);
  if (rev && method === 'GET') {
    const doc = await getRevision(env, rev[1]);
    return doc ? json({ content: normalize(doc) }) : fail(404, 'Versão não encontrada.');
  }

  if (path === '/api/preview' && method === 'POST') {
    const { content, path: page } = await readJson(req);
    const c = normalize(content);
    const ctx = { ...siteContext(url, c), noindex: true, preview: true };
    let body;
    try {
      body = render(c, String(page || '/'), ctx) || renderNotFound(c, ctx);
    } catch (err) {
      body = `<!doctype html><meta charset="utf-8"><body style="font:16px system-ui;padding:40px;background:#0c0612;color:#fff"><h1>Não deu para montar esta página</h1><p>${String(err.message).replace(/</g, '&lt;')}</p>`;
    }
    return html(body, 200, { 'Cache-Control': 'no-store' });
  }

  if (path === '/api/media' && method === 'GET') return json({ media: await mediaList(env) });
  if (path === '/api/media' && method === 'POST') {
    const fd = await req.formData();
    const ext = String(fd.get('ext'));
    const w = Math.round(+fd.get('w'));
    const h = Math.round(+fd.get('h'));
    if (!['webp', 'jpg', 'png'].includes(ext) || !(w > 0 && w <= 1600) || !(h > 0 && h <= 8000)) return fail(400, 'Imagem inválida.');
    const type = { webp: 'image/webp', jpg: 'image/jpeg', png: 'image/png' }[ext];
    const parts = [['v800', `-800.${ext}`, type], ['v1600', `-1600.${ext}`, type], ['og', '.jpg', 'image/jpeg']];
    const id = randomId(14);
    let size = 0;
    const files = [];
    for (const [field, suffix, mime] of parts) {
      const f = fd.get(field);
      if (!f || typeof f === 'string') {
        if (field === 'v1600' && w <= 800) continue;
        return fail(400, 'Faltou uma das versões da imagem.');
      }
      if (f.size > MAX_FILE) return fail(413, 'Imagem grande demais.');
      const buf = await f.arrayBuffer();
      const head = new Uint8Array(buf.slice(0, 12));
      const isPng = head[0] === 0x89 && head[1] === 0x50;
      const isJpg = head[0] === 0xff && head[1] === 0xd8;
      const isWebp = head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50;
      if (!({ 'image/png': isPng, 'image/jpeg': isJpg, 'image/webp': isWebp })[mime]) return fail(400, 'Formato de imagem inválido.');
      size += buf.byteLength;
      files.push([`file:${id}${suffix}`, buf, mime]);
    }
    await Promise.all(files.map(([k, buf, mime]) => env.CMS.put(k, buf, { metadata: { type: mime } })));
    const name = String(fd.get('name') || 'imagem').replace(/[^\w .()-]+/g, '').slice(0, 80) || 'imagem';
    const meta = { name, w, h, ext, size, at: new Date().toISOString(), by: me.name };
    await env.CMS.put(`media:${id}`, '', { metadata: meta });
    return json({ media: { id, ...meta, ref: `m:${id}:${w}x${h}:${ext}` } });
  }
  const mediaItem = /^\/api\/media\/([a-z0-9]{6,40})$/.exec(path);
  if (mediaItem && method === 'DELETE') {
    const id = mediaItem[1];
    const meta = (await env.CMS.getWithMetadata(`media:${id}`)).metadata;
    const ext = meta ? meta.ext : 'webp';
    await Promise.all([`media:${id}`, `file:${id}-800.${ext}`, `file:${id}-1600.${ext}`, `file:${id}.jpg`].map((k) => env.CMS.delete(k)));
    return json({ ok: true });
  }

  if (path === '/api/messages' && method === 'GET') return json({ messages: await messageList(env) });
  const msg = /^\/api\/messages\/([a-z0-9-]+)(\/read)?$/.exec(path);
  if (msg) {
    const key = `msg:${msg[1]}`;
    if (method === 'DELETE') {
      await env.CMS.delete(key);
      return json({ ok: true });
    }
    const { value, metadata } = await env.CMS.getWithMetadata(key, 'json');
    if (!value) return fail(404, 'Mensagem não encontrada.');
    if (method === 'POST' && msg[2]) {
      const { read } = await readJson(req);
      await env.CMS.put(key, JSON.stringify(value), { metadata: { ...metadata, read: !!read } });
      return json({ ok: true });
    }
    if (method === 'GET') return json({ message: { id: msg[1], ...value, ...metadata } });
  }

  if (path === '/api/slug' && method === 'GET') return json({ slug: slugify(url.searchParams.get('text') || '') });

  return fail(404, 'Não encontrado.');
}

export default {
  async fetch(req, env, event) {
    const url = new URL(req.url);
    try {
      if (url.pathname.startsWith('/api/')) {
        if (!env.CMS) return fail(503, 'O armazenamento do painel (KV) não está ligado a este Worker.');
        return await api(req, env, url, event);
      }
      if (url.pathname.startsWith('/media/') && env.CMS) return await mediaFile(req, env, url, event);
      if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      return await sitePage(req, env, url);
    } catch (err) {
      if (err && err.status) return fail(err.status, err.message);
      console.error(err && err.stack);
      return url.pathname.startsWith('/api/') ? fail(500, 'Erro no servidor. Tente de novo.') : html('<!doctype html><title>Bora Signs</title><p>Sorry, something went wrong. Please call 0482 530 280.</p>', 500);
    }
  },
};
