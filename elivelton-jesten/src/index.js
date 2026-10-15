// Worker do site da Jesten Construções.
// Páginas: PT em /, ES em /es/, EN em /en/, FR em /fr/. Painel do cliente em /painel.
// Os arquivos de public/ (CSS, JS, fontes, fotos e vídeos) são servidos direto pelo Cloudflare, sem passar por aqui.
import { JestenStore, CHUNK } from './store.js';
import { homePage, careersPage, legalPage, notFoundPage, matchRoute, PAGES } from './pages.js';
import { STRINGS, LANGS } from './i18n.js';
import { defaultContent } from './content.js';
import { panelPage } from './panel.js';

export { JestenStore };

const DEFAULTS = defaultContent();
const CONTENT_TTL = 20_000;
let contentCache = { at: 0, content: null };

const store = (env) => env.STORE.get(env.STORE.idFromName('jesten'), { locationHint: 'weur' });

// ---------- Utilitários ----------

function parseCookies(header) {
  const out = {};
  for (const part of (header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function securityHeaders(headers, url, csp) {
  const https = url.protocol === 'https:';
  headers.set('Content-Security-Policy', csp + (https ? '; upgrade-insecure-requests' : ''));
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  if (https) headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (!indexable(url)) headers.set('X-Robots-Tag', 'noindex, nofollow');
}

// O único script embutido na página (document.documentElement.classList.add('js')) entra pelo hash abaixo:
// marca a página como "com JavaScript" antes de desenhar, para as animações não piscarem.
const CSP_SITE =
  "default-src 'self'; script-src 'self' 'sha256-Du+OJKJSbdUgz5nrHeWWINvez6XKDDU/tyj/5c2uvwo='; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; connect-src 'self'; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'";

// O endereço de prévia (.workers.dev) não deve aparecer no Google; o domínio definitivo sim
const indexable = (url) => !url.hostname.endsWith('.workers.dev') && !['localhost', '127.0.0.1'].includes(url.hostname);

function html(body, url, { status = 200, headers = {} } = {}) {
  const h = new Headers({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', ...headers });
  securityHeaders(h, url, CSP_SITE);
  return new Response(body, { status, headers: h });
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
  });
}

const lisbonDay = (ts) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ts));

async function getContent(env, fresh = false) {
  if (!fresh && contentCache.content && Date.now() - contentCache.at < CONTENT_TTL) return contentCache.content;
  try {
    const content = await store(env).getContent();
    contentCache = { at: Date.now(), content };
    return content;
  } catch (err) {
    console.error('content', err);
    return contentCache.content || DEFAULTS;
  }
}

// ---------- Visitas ----------

function parseUA(ua) {
  const s = ua || '';
  const bot =
    !s ||
    /bot\b|bot\/|crawler|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|facebookexternalhit|^whatsapp\/|curl|wget|python|go-http|java\/|okhttp|axios|node-fetch/i.test(s);
  const tablet = /ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(s);
  const mobile = !tablet && /mobi|iphone|ipod|android|windows phone/i.test(s);
  const browser = /edg(e|a|ios)?\//i.test(s)
    ? 'Edge'
    : /opr\/|opera/i.test(s)
      ? 'Opera'
      : /samsungbrowser/i.test(s)
        ? 'Samsung Internet'
        : /instagram/i.test(s)
          ? 'Instagram'
          : /fban|fbav|fb_iab/i.test(s)
            ? 'Facebook'
            : /firefox|fxios/i.test(s)
              ? 'Firefox'
              : /chrome|crios|chromium/i.test(s)
                ? 'Chrome'
                : /safari/i.test(s)
                  ? 'Safari'
                  : 'Outro';
  const os = /windows/i.test(s)
    ? 'Windows'
    : /iphone|ipad|ipod/i.test(s)
      ? 'iOS'
      : /android/i.test(s)
        ? 'Android'
        : /mac os x|macintosh/i.test(s)
          ? 'macOS'
          : /cros/i.test(s)
            ? 'ChromeOS'
            : /linux/i.test(s)
              ? 'Linux'
              : 'Outro';
  return { bot, device: tablet ? 'tablet' : mobile ? 'mobile' : 'desktop', browser, os };
}

const SOURCES = [
  [/(^|\.)google\./, 'Google'],
  [/(^|\.)bing\.com$/, 'Bing'],
  [/duckduckgo\.com$/, 'DuckDuckGo'],
  [/(^|\.)yahoo\./, 'Yahoo'],
  [/ecosia\.org$/, 'Ecosia'],
  [/instagram\.com$/, 'Instagram'],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, 'Facebook'],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'LinkedIn'],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, 'WhatsApp'],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, 'X'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'YouTube'],
  [/tiktok\.com$/, 'TikTok'],
  [/(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com)$/, 'IA (ChatGPT e outros)'],
];

function source(ref, utm, ownHost) {
  if (utm) return String(utm).slice(0, 40).replace(/^./, (c) => c.toUpperCase());
  if (!ref) return 'Direto';
  let host;
  try {
    host = new URL(ref).hostname.replace(/^(www|m|l|lm|mobile)\./, '');
  } catch {
    return 'Direto';
  }
  if (host === ownHost.replace(/^www\./, '')) return '-'; // navegação dentro do site
  for (const [re, name] of SOURCES) if (re.test(host)) return name;
  return host.slice(0, 60);
}

// Proteção simples contra excesso de registos falsos, por instância do Worker
const beaconHits = new Map();
function beaconAllowed(ip) {
  const minute = Math.floor(Date.now() / 60_000);
  const key = `${ip}|${minute}`;
  const n = (beaconHits.get(key) || 0) + 1;
  beaconHits.set(key, n);
  if (beaconHits.size > 5000) beaconHits.clear();
  return n <= 30;
}

async function beacon(request, env, ctx, url) {
  const cookies = parseCookies(request.headers.get('Cookie'));
  const ua = request.headers.get('User-Agent') || '';
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const info = parseUA(ua);
  // Não conta robôs nem quem está com sessão aberta no painel (o próprio cliente)
  if (cookies.jsess || info.bot || !beaconAllowed(ip)) return new Response(null, { status: 204 });
  if (Number(request.headers.get('Content-Length') || 0) > 4096) return new Response(null, { status: 204 });
  let body;
  try {
    body = JSON.parse((await request.text()).slice(0, 2000));
  } catch {
    return new Response(null, { status: 204 });
  }
  const path = typeof body.p === 'string' ? body.p.split('?')[0].slice(0, 100) : '';
  const route = matchRoute(path);
  if (!route) return new Response(null, { status: 204 });
  const cf = request.cf || {};
  const round = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Math.round(Number(v) * 10) / 10);
  const now = Date.now();
  const hit = {
    ts: now,
    day: lisbonDay(now),
    path,
    lang: route.lang,
    country: cf.country || null,
    region: cf.region || null,
    city: cf.city || null,
    lat: round(cf.latitude),
    lon: round(cf.longitude),
    ref: source(body.r, body.u, url.hostname),
    device: info.device,
    browser: info.browser,
    os: info.os,
  };
  ctx.waitUntil(store(env).recordHit(hit, ip, ua).catch((e) => console.error('hit', e)));
  return new Response(null, { status: 204 });
}

// ---------- Formulários públicos ----------

const MIME_OK = {
  quote: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  job: ['application/pdf'],
};

function sniff(bytes) {
  const b = new Uint8Array(bytes.slice(0, 16));
  const ascii = (from, to) => String.fromCharCode(...b.slice(from, to));
  if (ascii(0, 4) === '%PDF') return 'application/pdf';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && ascii(1, 4) === 'PNG') return 'image/png';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  if (ascii(4, 8) === 'ftyp' && /^(heic|heix|hevc|mif1|msf1|heif)$/.test(ascii(8, 12))) return 'image/heic';
  return null;
}

async function submitForm(request, env, url, kind) {
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  let lang = 'pt';
  const back = (sent) => {
    const s = STRINGS[lang];
    const target = kind === 'quote' ? `${s.routes.home}${sent ? '?sent=quote' : ''}#${s.anchors.quote}` : `${s.routes.careers}${sent ? '?sent=job' : ''}#candidatura`;
    return Response.redirect(new URL(target, url).href, 303);
  };
  const reply = (status, data) => (wantsJson ? json(data, status) : back(Boolean(data.ok)));

  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) return json({ error: 'origin' }, 403);
  const maxMb = kind === 'quote' ? 10 : 5;
  if (Number(request.headers.get('Content-Length') || 0) > (maxMb + 1) * 1024 * 1024) return reply(413, { error: 'size' });

  let form;
  try {
    form = await request.formData();
  } catch {
    return reply(400, { error: 'bad-request' });
  }
  if (LANGS.includes(form.get('lang'))) lang = form.get('lang');
  // Armadilhas para robôs: campo escondido preenchido ou envio rápido demais. Finge que deu certo.
  const t = Number(form.get('t'));
  if (form.get('website') || !t || Date.now() - t < 2500) return reply(200, { ok: true });

  const get = (k, max) => String(form.get(k) || '').replace(/\r\n/g, '\n').trim().slice(0, max);
  const email = get('email', 200);
  const emailOk = !email || /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(email);
  let data;
  const missing = [];
  if (kind === 'quote') {
    data = {
      name: get('name', 120),
      company: get('company', 120),
      email,
      phone: get('phone', 40),
      type: get('type', 40),
      location: get('location', 120),
      start: get('start', 40),
      message: get('message', 4000),
      lang,
    };
    for (const k of ['name', 'email', 'type', 'message']) if (!data[k]) missing.push(k);
  } else {
    data = {
      name: get('name', 120),
      phone: get('phone', 40),
      email,
      location: get('location', 120),
      role: get('role', 40),
      roleOther: get('roleOther', 80),
      experience: get('experience', 20),
      where: form.getAll('where').map(String).filter((w) => ['PT', 'ES'].includes(w)),
      message: get('message', 3000),
      lang,
    };
    for (const k of ['name', 'phone', 'location', 'role']) if (!data[k]) missing.push(k);
  }
  if (!emailOk) missing.push('email');
  if (form.get('consent') !== '1') missing.push('consent');
  if (missing.length) return reply(400, { error: 'invalid', fields: missing });

  const stub = store(env);
  const ip = request.headers.get('CF-Connecting-IP') || '0';
  if (!(await stub.allow(`form|${ip}`, 6, 3600))) return reply(429, { error: 'rate' });

  let fileId = null;
  const file = form.get('file');
  if (file && typeof file === 'object' && file.size > 0) {
    if (file.size > maxMb * 1024 * 1024) return reply(413, { error: 'size' });
    const bytes = await file.arrayBuffer();
    const mime = sniff(bytes);
    if (!mime || !MIME_OK[kind].includes(mime)) return reply(415, { error: 'type' });
    const name = String(file.name || 'anexo').replace(/[\\/]/g, '_').slice(0, 120);
    fileId = await stub.storeFile({ kind: 'file', mime, name, isPrivate: true }, bytes);
  }
  data.consentAt = new Date().toISOString();
  await stub.addInbox(kind, data, fileId);
  return reply(200, { ok: true });
}

// ---------- Painel: API ----------

const IMAGE_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'image/avif'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE = 25 * 1024 * 1024;
const MAX_VIDEO = 200 * 1024 * 1024;

function sessionCookie(token, url, maxAge = 30 * 86400) {
  return `jsess=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${url.protocol === 'https:' ? '; Secure' : ''}`;
}

async function readJson(request, max = 2_000_000) {
  const text = await request.text();
  if (text.length > max) throw new Error('too-large');
  return JSON.parse(text || '{}');
}

// Diferença do horário de Lisboa para UTC, em minutos (0 no inverno, 60 no verão)
function lisbonOffset(ts) {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Lisbon', timeZoneName: 'shortOffset' })
    .formatToParts(new Date(ts))
    .find((p) => p.type === 'timeZoneName')?.value;
  const m = /GMT([+-]\d+)(?::(\d+))?/.exec(name || '');
  return m ? Number(m[1]) * 60 + Math.sign(Number(m[1])) * Number(m[2] || 0) : 0;
}

function statsRange(range) {
  const now = Date.now();
  const today = lisbonDay(now);
  const back = (days) => lisbonDay(now - days * 86_400_000);
  const base = { today, now, tzOffset: lisbonOffset(now), byMonth: false, byHour: false };
  switch (range) {
    case 'today':
      return { ...base, since: today, prevSince: back(1), byHour: true };
    case '30d':
      return { ...base, since: back(29), prevSince: back(59) };
    case '12m':
      return { ...base, since: back(364), prevSince: back(729), byMonth: true };
    default:
      return { ...base, since: back(6), prevSince: back(13) };
  }
}

async function adminApi(request, env, url) {
  const stub = store(env);
  const path = url.pathname.slice('/api/admin'.length) || '/';
  const method = request.method;
  const cookies = parseCookies(request.headers.get('Cookie'));
  const ip = request.headers.get('CF-Connecting-IP') || '0';
  const ua = request.headers.get('User-Agent') || '';

  if (method !== 'GET' && method !== 'HEAD') {
    // Só aceita alterações vindas do próprio site
    const origin = request.headers.get('Origin');
    const site = request.headers.get('Sec-Fetch-Site');
    if ((origin && origin !== url.origin) || (site && site !== 'same-origin') || (!origin && !site)) return json({ error: 'origin' }, 403);
  }

  if (path === '/status' && method === 'GET') {
    const authed = await stub.session(cookies.jsess);
    return json({ authed, configured: Boolean(env.ADMIN_PASSWORD) || (await stub.hasPassword()) });
  }
  if (path === '/login' && method === 'POST') {
    let body = {};
    try {
      body = await readJson(request, 2000);
    } catch {
      return json({ error: 'bad-request' }, 400);
    }
    const r = await stub.login(String(body.password || ''), env.ADMIN_PASSWORD || '', ip, ua);
    if (r.error) return json(r, r.error === 'rate' ? 429 : r.error === 'no-password' ? 503 : 401);
    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(r.token, url) });
  }
  if (path === '/logout' && method === 'POST') {
    await stub.logout(cookies.jsess);
    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', url, 0) });
  }

  if (!(await stub.session(cookies.jsess))) return json({ error: 'auth' }, 401);

  if (path === '/stats' && method === 'GET') return json(await stub.stats(statsRange(url.searchParams.get('range'))));
  if (path === '/content' && method === 'GET') return json(await stub.getContent());
  if (path === '/content' && method === 'PUT') {
    let body;
    try {
      body = await readJson(request);
    } catch {
      return json({ error: 'bad-request' }, 400);
    }
    const content = await stub.saveContent(body);
    contentCache = { at: Date.now(), content };
    return json(content);
  }
  if (path === '/overview' && method === 'GET') {
    const [unread, usage] = await Promise.all([stub.unread(), stub.usage()]);
    return json({ unread, usage });
  }
  if (path === '/media' && method === 'GET') return json({ media: await stub.listMedia(), usage: await stub.usage() });
  if (path === '/media' && method === 'POST') {
    let b;
    try {
      b = await readJson(request, 5000);
    } catch {
      return json({ error: 'bad-request' }, 400);
    }
    const size = Number(b.size);
    const kind = b.kind === 'video' ? 'video' : 'image';
    const types = kind === 'video' ? VIDEO_TYPES : IMAGE_TYPES;
    if (!types.includes(b.mime)) return json({ error: 'type' }, 415);
    if (!Number.isInteger(size) || size <= 0 || size > (kind === 'video' ? MAX_VIDEO : MAX_IMAGE)) return json({ error: 'size' }, 413);
    return json(await stub.createMedia({ kind, mime: b.mime, name: b.name, size }));
  }
  let m = /^\/media\/([a-z0-9]{8,32})\/(\d{1,4})$/.exec(path);
  if (m && method === 'PUT') {
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength > CHUNK) return json({ error: 'bad-size' }, 413);
    const r = await stub.putChunk(m[1], Number(m[2]), bytes);
    return json(r, r.error ? 400 : 200);
  }
  m = /^\/media\/([a-z0-9]{8,32})\/done$/.exec(path);
  if (m && method === 'POST') {
    const r = await stub.finishMedia(m[1]);
    return json(r, r.error ? 400 : 200);
  }
  m = /^\/media\/([a-z0-9]{8,32})$/.exec(path);
  if (m && method === 'DELETE') return json(await stub.deleteMedia(m[1]));
  if (path === '/inbox' && method === 'GET') return json({ items: await stub.listInbox() });
  m = /^\/inbox\/(\d+)$/.exec(path);
  if (m && method === 'PATCH') {
    const b = await readJson(request, 1000).catch(() => ({}));
    return json(await stub.setRead(Number(m[1]), Boolean(b.read)));
  }
  if (m && method === 'DELETE') return json(await stub.deleteInbox(Number(m[1])));
  m = /^\/file\/([a-z0-9]{8,32})$/.exec(path);
  if (m && method === 'GET') return stub.fetch(new Request(`https://store/file/${m[1]}`, { headers: request.headers }));
  if (path === '/password' && method === 'POST') {
    const b = await readJson(request, 2000).catch(() => ({}));
    const r = await stub.changePassword(String(b.current || ''), String(b.next || ''), env.ADMIN_PASSWORD || '', ua);
    if (r.error) return json(r, r.error === 'wrong' ? 401 : 400);
    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(r.token, url) });
  }
  return json({ error: 'not-found' }, 404);
}

// ---------- Páginas ----------

function legacyRedirect(pathname) {
  const p = pathname.toLowerCase();
  if (p === '/index.html' || p === '/pt' || p === '/pt/') return '/';
  if (['/trabalhe-conosco', '/trabalhe-connosco', '/trabalhe-conosco/'].includes(p)) return '/carreiras';
  if (/^\/(es|en|fr)$/.test(p)) return `${p}/`;
  if (p.length > 1 && p.endsWith('/') && matchRoute(p.slice(0, -1))) return p.slice(0, -1);
  return null;
}

function preferredLang(request) {
  const header = request.headers.get('Accept-Language');
  if (!header) return 'pt';
  const first = header.split(',')[0].trim().slice(0, 2).toLowerCase();
  return LANGS.includes(first) ? first : 'en';
}

async function renderPage(request, env, url, route) {
  const content = await getContent(env);
  const ctx = {
    ...route,
    s: STRINGS[route.lang],
    content,
    defaults: DEFAULTS,
    origin: url.origin,
    build: env.BUILD_ID || 'dev',
    year: new Date().getFullYear(),
    path: url.pathname,
    sent: url.searchParams.get('sent'),
  };
  const body = route.page === 'home' ? homePage(ctx) : route.page === 'careers' ? careersPage(ctx) : legalPage(ctx, route.page);
  return html(body, url, { headers: { 'Content-Language': STRINGS[route.lang].locale, ...(url.pathname === '/' ? { Vary: 'Accept-Language, Cookie' } : {}) } });
}

async function renderNotFound(env, url) {
  const lang = LANGS.find((l) => l !== 'pt' && url.pathname.startsWith(`/${l}/`)) || 'pt';
  const ctx = {
    lang,
    page: 'notFound',
    s: STRINGS[lang],
    content: await getContent(env),
    defaults: DEFAULTS,
    origin: url.origin,
    build: env.BUILD_ID || 'dev',
    year: new Date().getFullYear(),
    path: url.pathname,
  };
  return html(notFoundPage(ctx), url, { status: 404 });
}

function robots(url) {
  const body = indexable(url)
    ? `User-agent: *\nDisallow: /painel\nDisallow: /api/\n\nSitemap: ${url.origin}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}

function sitemap(url) {
  const entries = PAGES.flatMap((page) =>
    LANGS.map((lang) => {
      const alts = LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${STRINGS[l].locale}" href="${url.origin}${STRINGS[l].routes[page]}"/>`).join('');
      return `<url><loc>${url.origin}${STRINGS[lang].routes[page]}</loc>${alts}<changefreq>${page === 'home' ? 'weekly' : 'yearly'}</changefreq></url>`;
    }),
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } },
  );
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;
    try {
      if (pathname === '/api/v' && method === 'POST') return await beacon(request, env, ctx, url);
      if (pathname === '/api/quote' && method === 'POST') return await submitForm(request, env, url, 'quote');
      if (pathname === '/api/job' && method === 'POST') return await submitForm(request, env, url, 'job');
      if (pathname.startsWith('/api/admin/')) return await adminApi(request, env, url);
      if (pathname.startsWith('/api/')) return json({ error: 'not-found' }, 404);
      if (pathname.startsWith('/media/') && (method === 'GET' || method === 'HEAD')) return await store(env).fetch(request);

      if (method !== 'GET' && method !== 'HEAD') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      if (pathname === '/painel' || pathname === '/painel/') {
        const h = new Headers({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
        securityHeaders(h, url, CSP_SITE);
        return new Response(panelPage({ build: env.BUILD_ID || 'dev' }), { headers: h });
      }
      if (pathname === '/robots.txt') return robots(url);
      if (pathname === '/sitemap.xml') return sitemap(url);
      if (pathname.startsWith('/assets/')) return new Response('Not found', { status: 404 });

      const redirect = legacyRedirect(pathname);
      if (redirect) return Response.redirect(new URL(redirect + url.search, url).href, 301);

      const route = matchRoute(pathname);
      if (!route) return await renderNotFound(env, url);

      // Troca de idioma pelos botões PT/ES/EN/FR: guarda a escolha e volta ao endereço limpo
      const chosen = url.searchParams.get('lang');
      if (chosen) {
        const clean = new URL(url);
        clean.searchParams.delete('lang');
        const headers = new Headers({ Location: clean.href, 'Cache-Control': 'no-store' });
        if (LANGS.includes(chosen)) headers.append('Set-Cookie', `jlang=${chosen}; Path=/; Max-Age=31536000; SameSite=Lax${url.protocol === 'https:' ? '; Secure' : ''}`);
        return new Response(null, { status: 302, headers });
      }
      // Na página inicial em português, quem tem o navegador em outra língua vai para a versão dela (só na primeira visita)
      if (pathname === '/' && !parseCookies(request.headers.get('Cookie')).jlang && !parseUA(request.headers.get('User-Agent')).bot) {
        const lang = preferredLang(request);
        if (lang !== 'pt') {
          const target = new URL(STRINGS[lang].routes.home, url);
          target.search = url.search;
          return new Response(null, { status: 302, headers: { Location: target.href, 'Cache-Control': 'no-store', Vary: 'Accept-Language, Cookie' } });
        }
      }
      return await renderPage(request, env, url, route);
    } catch (err) {
      console.error(err);
      return new Response('Erro interno. Tente de novo dentro de instantes.', { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  },
};
