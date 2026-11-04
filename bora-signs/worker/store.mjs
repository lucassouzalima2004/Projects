// Where the content lives (Cloudflare KV, binding CMS):
//   live            {ver, at, by, note}   which version the public site shows
//   rev:<ver>       the content document of each published version (the history); never changes once written
//   draft           {content, base, at, by}   work saved in the panel but not published yet
// Versions are "<time in base 36>-<random>", so they sort by date.

import { defaults, normalize } from '../src/defaults.mjs';
import { randomId } from './auth.mjs';

export const KEEP_REVISIONS = 60;

const fresh = () => normalize(JSON.parse(JSON.stringify(defaults)));

// The published document, kept in memory and re-checked every few seconds
let memo = { ver: null, content: null, checked: 0, pages: new Map() };

export async function liveContent(env) {
  const now = Date.now();
  if (memo.content && now - memo.checked < 4000) return memo;
  const ptr = env.CMS ? await env.CMS.get('live', 'json') : null;
  if (!ptr || !ptr.ver) {
    if (memo.ver !== 'default') memo = { ver: 'default', content: fresh(), pages: new Map(), checked: now, at: null };
    memo.checked = now;
    return memo;
  }
  if (ptr.ver !== memo.ver) {
    const doc = await env.CMS.get(`rev:${ptr.ver}`, { type: 'json', cacheTtl: 86400 });
    memo = { ver: ptr.ver, content: doc ? normalize(doc) : fresh(), pages: new Map(), checked: now, at: ptr.at, by: ptr.by };
  }
  memo.checked = now;
  return memo;
}

export const forgetLive = () => { memo = { ver: null, content: null, checked: 0, pages: new Map() }; };

export const livePointer = (env) => env.CMS.get('live', 'json');
export const getDraft = (env) => env.CMS.get('draft', 'json');
export const saveDraft = (env, draft) => env.CMS.put('draft', JSON.stringify(draft));
export const deleteDraft = (env) => env.CMS.delete('draft');
export const getRevision = (env, ver) => env.CMS.get(`rev:${ver}`, { type: 'json', cacheTtl: 86400 });

export const newVersion = () => `${Date.now().toString(36)}-${randomId(4)}`;

export async function publish(env, content, by, note) {
  const ver = newVersion();
  const at = new Date().toISOString();
  const meta = { at, by, note: String(note || '').slice(0, 200) };
  await env.CMS.put(`rev:${ver}`, JSON.stringify(content), { metadata: meta });
  await env.CMS.put('live', JSON.stringify({ ver, ...meta }));
  forgetLive();
  return { ver, ...meta };
}

export async function revisions(env) {
  const out = [];
  let cursor;
  do {
    const page = await env.CMS.list({ prefix: 'rev:', cursor });
    for (const k of page.keys) out.push({ ver: k.name.slice(4), ...(k.metadata || {}) });
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  return out.sort((a, b) => (a.ver < b.ver ? 1 : -1));
}

// Keeps the newest versions (and always the live one)
export async function prune(env, liveVer) {
  const list = await revisions(env);
  const old = list.slice(KEEP_REVISIONS).filter((r) => r.ver !== liveVer);
  await Promise.all(old.map((r) => env.CMS.delete(`rev:${r.ver}`)));
}

/* ---------- media ---------- */

// media:<id> holds the details (as metadata); the files are file:<id>-800.<ext>, file:<id>-1600.<ext>, file:<id>.jpg

export async function mediaList(env) {
  const out = [];
  let cursor;
  do {
    const page = await env.CMS.list({ prefix: 'media:', cursor });
    for (const k of page.keys) {
      const m = k.metadata || {};
      out.push({ id: k.name.slice(6), ...m, ref: `m:${k.name.slice(6)}:${m.w}x${m.h}:${m.ext}` });
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  return out.sort((a, b) => ((a.at || '') < (b.at || '') ? 1 : -1));
}

/* ---------- inbox ---------- */

export async function messageList(env) {
  const out = [];
  let cursor;
  do {
    const page = await env.CMS.list({ prefix: 'msg:', cursor });
    for (const k of page.keys) out.push({ id: k.name.slice(4), ...(k.metadata || {}) });
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  return out.sort((a, b) => (a.id < b.id ? 1 : -1));
}
