// Serves ../dist/site the way Cloudflare Pages does (/collections/earrings → collections/earrings.html,
// 404.html for anything else, POST answered 405), to test the online preview locally.
//   npm run export && npm run serve:site     →  http://localhost:9393
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../dist/site');
const PORT = Number(process.env.PORT || 9393);
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.txt': 'text/plain', '.svg': 'image/svg+xml' };

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      return res.end('Method not allowed');
    }
    const clean = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/';
    const candidates = clean === '/' ? ['index.html'] : [clean.slice(1), `${clean.slice(1)}.html`, `${clean.slice(1)}/index.html`];
    const found = candidates.map((c) => path.join(ROOT, c)).find((f) => f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile());
    const file = found || path.join(ROOT, '404.html');
    const headers = { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'X-Robots-Tag': 'noindex, nofollow' };
    if (file.endsWith('sw.js')) headers['Cache-Control'] = 'no-cache';
    res.writeHead(found ? 200 : 404, headers);
    res.end(req.method === 'HEAD' ? undefined : fs.readFileSync(file));
  })
  .listen(PORT, () => console.log(`Online preview copy on http://localhost:${PORT}`));
