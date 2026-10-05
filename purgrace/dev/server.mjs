// Local preview of the Grace theme with the PurGrace catalogue (the storefront itself is core.mjs).
// Theme files are read again on every request, so edits show up on reload.
//
//   cd dev && npm install && npm run preview     →  http://localhost:9292
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorefront } from './core.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const THEME = path.resolve(here, '../theme');
const PORT = Number(process.env.PORT || 9292);
const ORIGIN = `http://localhost:${PORT}`;

const fixture = JSON.parse(fs.readFileSync(path.join(here, 'fixtures/purgrace-store.json'), 'utf8'));
const readText = (rel) => {
  const file = path.join(THEME, rel);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
};
const storefront = createStorefront({ readText, fixture, origin: ORIGIN });
const state = { items: [], note: '', locale: 'en' };

const MIME = { '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, ORIGIN);
  try {
    if (url.pathname.startsWith('/assets/')) {
      const file = path.join(THEME, 'assets', path.basename(url.pathname));
      if (!fs.existsSync(file)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Not found');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      return res.end(fs.readFileSync(file));
    }
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const locale = (req.headers.cookie || '').includes('locale=pt-BR') ? 'pt-BR' : 'en';
    const out = await storefront.handle({ method: req.method, url: url.toString(), headers: req.headers, body: Buffer.concat(chunks).toString(), state, locale });
    res.writeHead(out.status, out.headers);
    res.end(out.body);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<pre style="white-space:pre-wrap;font:14px monospace;padding:20px">${storefront.esc(err.stack || err.message)}</pre>`);
  }
});

server.listen(PORT, () => console.log(`PurGrace preview on ${ORIGIN}`));
