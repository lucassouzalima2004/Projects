// Serves preview/dist with the same "pretty URLs" as Cloudflare Pages (/products/x → products/x.html).
//   node serve.mjs [port]
import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), process.env.OUT || 'dist');
const port = Number(process.argv[2] || process.env.PORT || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

const candidates = (pathname) => {
  const clean = decodeURIComponent(pathname).replace(/\/+$/, '') || '/';
  if (clean === '/') return ['index.html'];
  return [clean, `${clean}.html`, `${clean}/index.html`].map((item) => item.replace(/^\//, ''));
};

http
  .createServer(async (request, response) => {
    const { pathname } = new URL(request.url, 'http://localhost');
    for (const candidate of candidates(pathname)) {
      const file = path.join(root, candidate);
      if (!file.startsWith(root)) break;
      try {
        const stat = await fs.stat(file);
        if (!stat.isFile()) continue;
        response.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
        response.end(await fs.readFile(file));
        return;
      } catch (error) {
        /* try the next candidate */
      }
    }
    response.writeHead(404, { 'Content-Type': TYPES['.html'] });
    response.end(await fs.readFile(path.join(root, '404.html')).catch(() => 'Not found'));
  })
  .listen(port, () => console.log(`Preview on http://localhost:${port}`));
