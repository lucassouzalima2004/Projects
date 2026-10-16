// Serve dist/ do jeito que o Cloudflare serve (x → x.html, 404.html para o resto),
// para conferir a prévia publicada antes de subir.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const PORT = Number(process.env.PORT || 4100);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.txt': 'text/plain' };

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let rel = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/index';
  const candidates = [rel, `${rel}.html`, `${rel}/index.html`].map((c) => path.join(root, c));
  let file = candidates.find((c) => c.startsWith(root) && fs.existsSync(c) && fs.statSync(c).isFile());
  let status = 200;
  if (!file) { file = path.join(root, '404.html'); status = 404; }
  res.writeHead(status, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`dist em http://localhost:${PORT}`));
