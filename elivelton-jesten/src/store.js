// Banco de dados do site: um único Durable Object com SQLite.
// Guarda o conteúdo editável (obras, números, contactos), as visitas, as fotos e vídeos enviados pelo painel
// (em pedaços de 1,9 MB, abaixo do limite de 2 MB por linha), os pedidos de orçamento e candidaturas,
// as sessões do painel e os limites de tentativas.
import { DurableObject } from 'cloudflare:workers';
import { defaultContent, mergeContent, sanitizeContent, mediaIdsIn } from './content.js';

export const CHUNK = 1_900_000;
const DAY = 86_400_000;
const HIT_DAYS = 400; // ~13 meses, como diz a política de privacidade
const INBOX_DAYS = 730; // 2 anos
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 100_000; // máximo aceito pelo Workers

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (text) => hex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
const randomId = (bytes = 12) => {
  const alphabet = 'abcdefghijkmnopqrstuvwxyz23456789';
  return [...crypto.getRandomValues(new Uint8Array(bytes))].map((b) => alphabet[b % alphabet.length]).join('');
};
const randomToken = () => {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

async function pbkdf2(password, saltHex) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const salt = new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16)));
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS }, key, 256);
  return hex(bits);
}

async function sameText(a, b) {
  const [da, db] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  return crypto.subtle.timingSafeEqual(da, db);
}

export class JestenStore extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => {
      this.migrate();
      if ((await ctx.storage.getAlarm()) == null) await ctx.storage.setAlarm(Date.now() + 60_000);
    });
  }

  migrate() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL, updated INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS hits (
        ts INTEGER NOT NULL, day TEXT NOT NULL, path TEXT NOT NULL, lang TEXT,
        country TEXT, region TEXT, city TEXT, lat REAL, lon REAL,
        ref TEXT, device TEXT, browser TEXT, os TEXT, visitor TEXT
      );
      CREATE INDEX IF NOT EXISTS hits_day ON hits(day);
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY, kind TEXT NOT NULL, mime TEXT NOT NULL, name TEXT,
        size INTEGER NOT NULL, chunks INTEGER NOT NULL, done INTEGER NOT NULL DEFAULT 0,
        private INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS chunks (media TEXT NOT NULL, n INTEGER NOT NULL, data BLOB NOT NULL, PRIMARY KEY (media, n));
      CREATE TABLE IF NOT EXISTS inbox (
        id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, kind TEXT NOT NULL,
        data TEXT NOT NULL, file TEXT, read INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY, created INTEGER NOT NULL, expires INTEGER NOT NULL, ua TEXT);
      CREATE TABLE IF NOT EXISTS limits (k TEXT PRIMARY KEY, n INTEGER NOT NULL, reset INTEGER NOT NULL);
    `);
  }

  kvGet(k) {
    const row = this.sql.exec('SELECT v, updated FROM kv WHERE k = ?', k).toArray()[0];
    return row ? { value: JSON.parse(row.v), updated: row.updated } : null;
  }

  kvSet(k, value) {
    const now = Date.now();
    this.sql.exec(
      'INSERT INTO kv (k, v, updated) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, updated = excluded.updated',
      k, JSON.stringify(value), now,
    );
    return now;
  }

  // ---------- Limites de tentativas ----------

  allow(key, limit, windowSeconds) {
    const now = Date.now();
    const row = this.sql.exec('SELECT n, reset FROM limits WHERE k = ?', key).toArray()[0];
    if (!row || row.reset < now) {
      this.sql.exec(
        'INSERT INTO limits (k, n, reset) VALUES (?, 1, ?) ON CONFLICT(k) DO UPDATE SET n = 1, reset = excluded.reset',
        key, now + windowSeconds * 1000,
      );
      return true;
    }
    if (row.n >= limit) return false;
    this.sql.exec('UPDATE limits SET n = n + 1 WHERE k = ?', key);
    return true;
  }

  // ---------- Conteúdo ----------

  getContent() {
    const saved = this.kvGet('content');
    return saved ? mergeContent(saved.value, saved.updated) : defaultContent();
  }

  saveContent(content) {
    // Um painel aberto antes de uma atualização do site não conhece os campos novos (ex.: os textos): ficam os guardados
    const current = this.kvGet('content')?.value || {};
    const clean = sanitizeContent({ ...current, ...content });
    const updated = this.kvSet('content', clean);
    return mergeContent(clean, updated);
  }

  // ---------- Visitas ----------

  async recordHit(hit, ip, ua) {
    let salt = this.kvGet('salt')?.value;
    if (!salt || salt.day !== hit.day) {
      // Código anónimo que muda todo dia: conta visitantes únicos sem guardar IP nem cookie
      salt = { day: hit.day, value: randomToken() };
      this.kvSet('salt', salt);
    }
    const visitor = (await sha256(`${salt.value}|${ip}|${ua}`)).slice(0, 16);
    this.sql.exec(
      `INSERT INTO hits (ts, day, path, lang, country, region, city, lat, lon, ref, device, browser, os, visitor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      hit.ts, hit.day, hit.path, hit.lang, hit.country, hit.region, hit.city, hit.lat, hit.lon,
      hit.ref, hit.device, hit.browser, hit.os, visitor,
    );
  }

  // Todas as contas numa leitura só do período (o plano gratuito conta linhas lidas)
  stats({ since, prevSince, today, now, byMonth, byHour, tzOffset = 0 }) {
    const rows = this.sql
      .exec('SELECT ts, day, path, lang, country, region, city, lat, lon, ref, device, browser, os, visitor FROM hits WHERE day >= ?', prevSince)
      .toArray();

    const series = new Map();
    const tally = () => new Map();
    const countries = tally(), cities = tally(), pages = tally(), refs = tally(), devices = tally(), langs = tally(), browsers = tally(), oses = tally();
    const visitorsAll = new Set(), prevVisitors = new Set();
    let views = 0, prevViews = 0;
    const live = new Set();

    const bump = (map, key, visitorKey, extra) => {
      if (key == null || key === '') return;
      let e = map.get(key);
      if (!e) map.set(key, (e = { key, views: 0, v: new Set(), ...extra }));
      e.views++;
      e.v.add(visitorKey);
    };

    for (const r of rows) {
      const vk = `${r.day}|${r.visitor}`;
      if (r.day < since) {
        prevViews++;
        prevVisitors.add(vk);
        continue;
      }
      views++;
      visitorsAll.add(vk);
      const bucket = byHour
        ? String(new Date(r.ts + tzOffset * 60_000).getUTCHours()).padStart(2, '0')
        : byMonth
          ? r.day.slice(0, 7)
          : r.day;
      let s = series.get(bucket);
      if (!s) series.set(bucket, (s = { views: 0, v: new Set() }));
      s.views++;
      s.v.add(vk);
      bump(countries, r.country || 'XX', vk);
      if (r.city) bump(cities, `${r.city}|${r.country || ''}`, vk, { city: r.city, region: r.region, country: r.country, lat: r.lat, lon: r.lon });
      bump(pages, r.path, vk);
      if (r.ref && r.ref !== '-') bump(refs, r.ref, vk);
      bump(devices, r.device, vk);
      bump(langs, r.lang, vk);
      bump(browsers, r.browser, vk);
      bump(oses, r.os, vk);
      if (r.day === today && r.ts >= now - 5 * 60_000) live.add(r.visitor);
    }

    const top = (map, n = 12) =>
      [...map.values()]
        .map(({ v, ...e }) => ({ ...e, visitors: v.size }))
        .sort((a, b) => b.visitors - a.visitors || b.views - a.views)
        .slice(0, n);

    const recent = this.sql
      .exec('SELECT ts, path, lang, country, region, city, ref, device, browser, os FROM hits ORDER BY rowid DESC LIMIT 30')
      .toArray();

    const sinceTs = Date.parse(`${since}T00:00:00Z`) - tzOffset * 60_000;
    const quotes = this.sql.exec('SELECT kind, COUNT(*) AS n FROM inbox WHERE ts >= ? GROUP BY kind', sinceTs).toArray();

    return {
      views,
      visitors: visitorsAll.size,
      prev: { views: prevViews, visitors: prevVisitors.size },
      live: live.size,
      series: [...series.entries()].map(([bucket, s]) => ({ bucket, views: s.views, visitors: s.v.size })),
      countries: top(countries, 30),
      cities: top(cities, 200),
      pages: top(pages, 15),
      refs: top(refs, 15),
      devices: top(devices, 5),
      langs: top(langs, 5),
      browsers: top(browsers, 8),
      os: top(oses, 8),
      recent,
      inbox: Object.fromEntries(quotes.map((q) => [q.kind, q.n])),
    };
  }

  // ---------- Fotos, vídeos e anexos ----------

  createMedia({ kind, mime, name, size, isPrivate = false }) {
    const id = randomId();
    const chunks = Math.max(1, Math.ceil(size / CHUNK));
    this.sql.exec(
      'INSERT INTO media (id, kind, mime, name, size, chunks, done, private, created) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)',
      id, kind, mime, String(name || '').slice(0, 160), size, chunks, isPrivate ? 1 : 0, Date.now(),
    );
    return { id, chunks, chunkSize: CHUNK };
  }

  putChunk(id, n, bytes) {
    const m = this.sql.exec('SELECT size, chunks, done FROM media WHERE id = ?', id).toArray()[0];
    if (!m || m.done) return { error: 'not-found' };
    if (!Number.isInteger(n) || n < 0 || n >= m.chunks) return { error: 'bad-chunk' };
    const expected = n === m.chunks - 1 ? m.size - n * CHUNK : CHUNK;
    if (bytes.byteLength !== expected) return { error: 'bad-size', expected };
    this.sql.exec('INSERT OR REPLACE INTO chunks (media, n, data) VALUES (?, ?, ?)', id, n, bytes);
    return { ok: true };
  }

  finishMedia(id) {
    const m = this.sql.exec('SELECT chunks, done FROM media WHERE id = ?', id).toArray()[0];
    if (!m) return { error: 'not-found' };
    const got = this.sql.exec('SELECT COUNT(*) AS n FROM chunks WHERE media = ?', id).one().n;
    if (got !== m.chunks) return { error: 'incomplete', got, expected: m.chunks };
    this.sql.exec('UPDATE media SET done = 1 WHERE id = ?', id);
    return { ok: true, id, url: `/media/${id}` };
  }

  storeFile(meta, bytes) {
    const { id, chunks } = this.createMedia({ ...meta, size: bytes.byteLength });
    const all = new Uint8Array(bytes);
    for (let n = 0; n < chunks; n++) this.putChunk(id, n, all.slice(n * CHUNK, (n + 1) * CHUNK).buffer);
    this.finishMedia(id);
    return id;
  }

  deleteMedia(id) {
    this.sql.exec('DELETE FROM chunks WHERE media = ?', id);
    this.sql.exec('DELETE FROM media WHERE id = ?', id);
    return { ok: true };
  }

  listMedia() {
    return this.sql.exec('SELECT id, kind, mime, name, size, done, private, created FROM media ORDER BY created DESC').toArray();
  }

  usage() {
    const row = this.sql.exec('SELECT COUNT(*) AS files, COALESCE(SUM(size), 0) AS bytes FROM media WHERE done = 1').one();
    return { files: row.files, bytes: row.bytes, database: this.ctx.storage.sql.databaseSize };
  }

  // Entrega o arquivo em pedaços, aceitando Range (o Safari só toca vídeo assim)
  async fetch(request) {
    const url = new URL(request.url);
    const m = /^\/(media|file)\/([a-z0-9]{8,32})(?:\.[a-z0-9]+)?$/.exec(url.pathname);
    if (!m) return new Response('Not found', { status: 404 });
    const isPrivate = m[1] === 'file';
    const id = m[2];
    const row = this.sql.exec('SELECT id, mime, name, size, private FROM media WHERE id = ? AND done = 1', id).toArray()[0];
    if (!row || Boolean(row.private) !== isPrivate) return new Response('Not found', { status: 404 });

    const etag = `"${row.id}"`;
    const headers = new Headers({
      'Content-Type': row.mime,
      'Accept-Ranges': 'bytes',
      ETag: etag,
      'Cache-Control': isPrivate ? 'private, no-store' : 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    });
    if (isPrivate) {
      const ascii = (row.name || 'arquivo').replace(/[^\w.\- ]+/g, '_');
      headers.set('Content-Disposition', `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(row.name || 'arquivo')}`);
    }
    if (!isPrivate && request.headers.get('If-None-Match') === etag) return new Response(null, { status: 304, headers });

    let start = 0;
    let end = row.size - 1;
    let status = 200;
    const range = request.headers.get('Range');
    if (range) {
      const r = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (r && (r[1] || r[2])) {
        if (r[1] === '') {
          start = Math.max(0, row.size - Number(r[2]));
        } else {
          start = Number(r[1]);
          if (r[2] !== '') end = Math.min(Number(r[2]), row.size - 1);
        }
        if (start > end || start >= row.size) {
          headers.set('Content-Range', `bytes */${row.size}`);
          return new Response(null, { status: 416, headers });
        }
        status = 206;
        headers.set('Content-Range', `bytes ${start}-${end}/${row.size}`);
      }
    }
    headers.set('Content-Length', String(end - start + 1));
    if (request.method === 'HEAD') return new Response(null, { status, headers });

    const sql = this.sql;
    let n = Math.floor(start / CHUNK);
    const last = Math.floor(end / CHUNK);
    const body = new ReadableStream({
      type: 'bytes',
      pull(controller) {
        if (n > last) {
          controller.close();
          return;
        }
        const c = sql.exec('SELECT data FROM chunks WHERE media = ? AND n = ?', id, n).toArray()[0];
        if (!c) {
          controller.error(new Error('missing chunk'));
          return;
        }
        const buf = new Uint8Array(c.data);
        const base = n * CHUNK;
        controller.enqueue(buf.slice(Math.max(start - base, 0), Math.min(end - base + 1, buf.length)));
        n++;
      },
    });
    return new Response(body, { status, headers });
  }

  // ---------- Pedidos de orçamento e candidaturas ----------

  addInbox(kind, data, file) {
    const row = this.sql
      .exec('INSERT INTO inbox (ts, kind, data, file) VALUES (?, ?, ?, ?) RETURNING id', Date.now(), kind, JSON.stringify(data), file || null)
      .one();
    return row.id;
  }

  listInbox() {
    return this.sql
      .exec(
        `SELECT i.id, i.ts, i.kind, i.data, i.file, i.read, m.name AS fileName, m.size AS fileSize, m.mime AS fileMime
         FROM inbox i LEFT JOIN media m ON m.id = i.file ORDER BY i.id DESC LIMIT 500`,
      )
      .toArray()
      .map((r) => ({ ...r, data: JSON.parse(r.data), read: Boolean(r.read) }));
  }

  unread() {
    return this.sql.exec('SELECT COUNT(*) AS n FROM inbox WHERE read = 0').one().n;
  }

  setRead(id, read) {
    this.sql.exec('UPDATE inbox SET read = ? WHERE id = ?', read ? 1 : 0, id);
    return { ok: true };
  }

  deleteInbox(id) {
    const row = this.sql.exec('SELECT file FROM inbox WHERE id = ?', id).toArray()[0];
    if (row?.file) this.deleteMedia(row.file);
    this.sql.exec('DELETE FROM inbox WHERE id = ?', id);
    return { ok: true };
  }

  // ---------- Senha e sessões do painel ----------

  // A senha inicial é o secret ADMIN_PASSWORD. Se o cliente trocar a senha no painel, vale a nova, até
  // alguém mudar o ADMIN_PASSWORD no Cloudflare: aí a nova senha do painel é descartada (é o jeito de recuperar o acesso).
  async passwordOk(password, envPassword) {
    if (typeof password !== 'string' || !password) return false;
    const envHash = envPassword ? await sha256(`env|${envPassword}`) : null;
    const stored = this.kvGet('password')?.value;
    if (stored) {
      if (stored.envHash === envHash) return (await pbkdf2(password, stored.salt)) === stored.hash;
      this.sql.exec("DELETE FROM kv WHERE k = 'password'");
    }
    if (!envPassword) return false;
    return sameText(password, envPassword);
  }

  hasPassword() {
    return Boolean(this.kvGet('password'));
  }

  async login(password, envPassword, ip, ua) {
    if (!envPassword && !this.kvGet('password')) return { error: 'no-password' };
    if (!this.allow(`login|${ip}`, 8, 15 * 60)) return { error: 'rate' };
    if (!(await this.passwordOk(password, envPassword))) return { error: 'wrong' };
    return { token: await this.newSession(ua) };
  }

  async newSession(ua) {
    const token = randomToken();
    const now = Date.now();
    this.sql.exec(
      'INSERT INTO sessions (hash, created, expires, ua) VALUES (?, ?, ?, ?)',
      await sha256(token), now, now + SESSION_DAYS * DAY, String(ua || '').slice(0, 200),
    );
    return token;
  }

  async session(token) {
    if (!token || token.length > 100) return false;
    const row = this.sql.exec('SELECT expires FROM sessions WHERE hash = ?', await sha256(token)).toArray()[0];
    return Boolean(row && row.expires > Date.now());
  }

  async logout(token) {
    if (token) this.sql.exec('DELETE FROM sessions WHERE hash = ?', await sha256(token));
    return { ok: true };
  }

  async changePassword(current, next, envPassword, ua) {
    if (!(await this.passwordOk(current, envPassword))) return { error: 'wrong' };
    if (typeof next !== 'string' || next.length < 8 || next.length > 200) return { error: 'short' };
    const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    this.kvSet('password', {
      salt,
      hash: await pbkdf2(next, salt),
      envHash: envPassword ? await sha256(`env|${envPassword}`) : null,
    });
    // Encerra as outras sessões e abre uma nova para quem trocou
    this.sql.exec('DELETE FROM sessions');
    return { token: await this.newSession(ua) };
  }

  // ---------- Limpeza diária ----------

  async alarm() {
    const now = Date.now();
    const cutoff = new Date(now - HIT_DAYS * DAY).toISOString().slice(0, 10);
    this.sql.exec('DELETE FROM hits WHERE day < ?', cutoff);
    for (const r of this.sql.exec('SELECT id FROM inbox WHERE ts < ?', now - INBOX_DAYS * DAY).toArray()) this.deleteInbox(r.id);
    this.sql.exec('DELETE FROM sessions WHERE expires < ?', now);
    this.sql.exec('DELETE FROM limits WHERE reset < ?', now);
    // Envios que ficaram pela metade e fotos/vídeos que saíram do site há mais de 2 dias
    const used = mediaIdsIn(this.getContent());
    const attached = new Set(this.sql.exec('SELECT file FROM inbox WHERE file IS NOT NULL').toArray().map((r) => r.file));
    for (const m of this.sql.exec('SELECT id, done, private, created FROM media').toArray()) {
      const old = m.created < now - 2 * DAY;
      const orphan = m.private ? !attached.has(m.id) : !used.has(m.id);
      if ((!m.done && m.created < now - DAY) || (old && orphan)) this.deleteMedia(m.id);
    }
    await this.ctx.storage.setAlarm(now + DAY);
  }
}
