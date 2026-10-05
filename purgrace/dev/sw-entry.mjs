// Service worker for the online preview (bundled into dist/site/sw.js by export.mjs).
// It runs the same storefront as the local server, inside the visitor's browser: pages, cart,
// filters, search and the language switch all work without a server. The cart lives in this
// browser only (Cache Storage) and nothing is sent anywhere.
import { createStorefront } from './core.mjs';
import { decorate } from './preview-chrome.mjs';
import fixture from './fixtures/purgrace-store.json';
import themeFiles from './.build/theme-files.json';

const storefront = createStorefront({
  readText: (rel) => themeFiles[rel] ?? null,
  fixture,
  origin: self.location.origin,
  cache: true,
  decorate,
});

const STATE_CACHE = 'purgrace-preview';
const STATE_URL = '/__preview-state';
let state = null;

async function loadState() {
  if (state) return state;
  try {
    const saved = await (await caches.open(STATE_CACHE)).match(STATE_URL);
    if (saved) state = await saved.json();
  } catch (e) {
    /* private browsing can refuse storage; the cart then lasts until the tab closes */
  }
  state = state || { items: [], note: '', locale: 'en' };
  return state;
}
async function saveState() {
  try {
    await (await caches.open(STATE_CACHE)).put(STATE_URL, new Response(JSON.stringify(state), { headers: { 'Content-Type': 'application/json' } }));
  } catch (e) {
    /* see loadState */
  }
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Theme assets and this script come from the static files
const PASS_THROUGH = /^\/(assets\/|sw\.js$|robots\.txt$|favicon|_headers$)/;

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || PASS_THROUGH.test(url.pathname)) return;
  event.respondWith(respond(event.request));
});

// One request at a time, so two quick clicks can't lose a cart change
let queue = Promise.resolve();
function respond(request) {
  const run = queue.then(() => render(request));
  queue = run.catch(() => {});
  return run;
}

async function render(request) {
  const body = request.method === 'GET' || request.method === 'HEAD' ? '' : await request.clone().text();
  try {
    const current = await loadState();
    const out = await storefront.handle({
      method: request.method,
      url: request.url,
      headers: {
        'content-type': request.headers.get('content-type') || '',
        accept: request.headers.get('accept') || '',
        referer: request.referrer || '',
      },
      body,
      state: current,
    });
    if (out.stateChanged) await saveState();
    if (out.status === 302) return Response.redirect(new URL(out.headers.Location, self.location.origin).href, 302);
    const headers = { ...out.headers };
    delete headers['Set-Cookie'];
    return new Response(out.body, { status: out.status, headers });
  } catch (err) {
    console.error(err);
    return fetch(request);
  }
}
