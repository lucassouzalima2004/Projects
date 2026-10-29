// Gera a prévia publicável: o tema renderizado em HTML estático (todas as páginas,
// com os produtos reais) + o necessário para o carrinho funcionar no navegador.
//
//   SITE_URL=https://freshfemme-preview.exemplo.workers.dev node build.mjs
//
// A saída fica em dist/. É uma prévia para o cliente aprovar: não indexa no Google e o
// pagamento só mostra um aviso. A loja de verdade continua sendo o tema na Shopify.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEME, makePreview, readThemeFiles, readData } from './render.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, 'dist');
const SITE_URL = (process.env.SITE_URL || 'http://localhost:4000').replace(/\/$/, '');
const VERSION = Date.now().toString(36);

const write = (rel, content) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const head = [
  '<meta name="robots" content="noindex, nofollow">',
  `<meta property="og:image" content="${SITE_URL}/preview/og.jpg">`,
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="630">',
  `<script src="/preview/shim.js?v=${VERSION}"></script>`,
].join('');
const badge = `
<a class="preview-badge" href="https://freshfemme.com.br" target="_blank" rel="noopener" title="Abrir a loja atual">
  <span class="preview-badge__dot"></span>Prévia do novo site
</a>
<style>
  .preview-badge { position: fixed; left: 14px; bottom: 14px; z-index: 34; display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; background: rgb(30 42 45 / 0.88); color: #fff; font: 600 0.74rem/1 var(--font-body); letter-spacing: 0.02em; backdrop-filter: blur(8px); box-shadow: 0 8px 24px -10px rgb(0 0 0 / 0.5); text-decoration: none; }
  .preview-badge__dot { width: 7px; height: 7px; border-radius: 50%; background: #67c7c4; box-shadow: 0 0 0 3px rgb(103 199 196 / 0.3); }
  body:has(.sticky-atc.is-visible) .preview-badge, body.drawer-open .preview-badge { opacity: 0; pointer-events: none; }
</style>`;

function finish(html) {
  return html
    .replace('</head>', `${head}</head>`)
    .replace('</body>', `${badge}</body>`);
}

const preview = makePreview({ origin: SITE_URL, version: VERSION });
const { products, collections, pages } = preview.store;

// rota → arquivo (o Cloudflare serve /products/x a partir de products/x.html)
const routes = [
  ['/', 'index.html'],
  ['/collections', 'collections.html'],
  ['/cart', 'cart.html'],
  ['/search?all', 'search.html'],
  ['/account/login', 'account/login.html'],
  ['/account/register', 'account/register.html'],
  ['/account', 'account.html'],
  ['/404', '404.html'],
  ...Object.keys(products).map((h) => [`/products/${h}`, `products/${h}.html`]),
  ...Object.keys(collections).map((h) => [`/collections/${h}`, `collections/${h}.html`]),
  ...Object.keys(pages).map((h) => [`/pages/${h}`, `pages/${h}.html`]),
];

let count = 0;
for (const [url, file] of routes) {
  const { html } = await preview.renderRoute(url);
  write(file, finish(html));
  count++;
}

// arquivos do tema e da prévia
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
for (const f of fs.readdirSync(path.join(THEME, 'assets'))) {
  fs.copyFileSync(path.join(THEME, 'assets', f), path.join(OUT, 'assets', f));
}
write('preview/shim.js', fs.readFileSync(path.join(here, 'static/shim.js')));
write('preview/og.jpg', fs.readFileSync(path.join(here, 'static/og.jpg')));
// vídeos da capa (quando houver), referenciados nos templates como shopify://files/videos/<arquivo>
const videosDir = path.join(here, 'static/videos');
if (fs.existsSync(videosDir)) {
  for (const f of fs.readdirSync(videosDir)) write(`preview/videos/${f}`, fs.readFileSync(path.join(videosDir, f)));
}
write('preview/core.mjs', fs.readFileSync(path.join(here, 'core.mjs')));
write('preview/liquid.browser.mjs', fs.readFileSync(path.join(here, 'node_modules/liquidjs/dist/liquid.browser.mjs')));

// o carrinho no navegador só precisa do template do carrinho, dos snippets e dos dados
const themeFiles = readThemeFiles();
const files = Object.fromEntries(Object.entries(themeFiles).filter(([k]) =>
  k.startsWith('snippets/') || k.startsWith('locales/') || k.startsWith('config/') || k === 'sections/cart-drawer.liquid'));
const data = readData();
write('preview/bundle.json', JSON.stringify({ version: VERSION, files, data: { products: data.products, collections: data.collections, pages: {} } }));

write('robots.txt', 'User-agent: *\nDisallow: /\n');
write('_headers', [
  '/assets/*',
  '  Cache-Control: public, max-age=3600',
  '/preview/*',
  '  Cache-Control: public, max-age=3600',
  '/*',
  '  X-Robots-Tag: noindex, nofollow',
  '',
].join('\n'));

console.log(`${count} páginas em ${path.relative(process.cwd(), OUT)}/ (site: ${SITE_URL})`);
