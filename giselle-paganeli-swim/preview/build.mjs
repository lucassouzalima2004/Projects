// Builds the static preview of the Shopify theme into preview/dist (or the folder in $OUT).
//   node build.mjs            → preview/dist
//   OUT=../_site node build.mjs
//   PREVIEW_ORIGIN=https://example.pages.dev node build.mjs   (absolute og:image / canonical URLs)
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSite } from './lib/site.mjs';
import * as catalog from './data/catalog.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const themeDir = path.resolve(here, '../theme');
const out = path.resolve(here, process.env.OUT || 'dist');
const origin = (process.env.PREVIEW_ORIGIN || '').replace(/\/$/, '');

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => (entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))
  );
  return nested.flat();
};

const write = async (file, content) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
};

// Theme source files (everything except binary assets).
const files = {};
for (const folder of ['layout', 'sections', 'snippets', 'templates', 'config', 'locales']) {
  for (const file of await walk(path.join(themeDir, folder))) {
    files[path.relative(themeDir, file).split(path.sep).join('/')] = await fs.readFile(file, 'utf8');
  }
}

const catalogData = {
  products: catalog.products,
  collections: catalog.collections,
  pages: catalog.pages,
  menus: catalog.menus,
  shop: catalog.shop,
  settingsOverrides: catalog.settingsOverrides,
  templateOverrides: catalog.templateOverrides,
  colorHex: catalog.colorHex,
};

const contentForHeader = (route, pagePath) => `
<meta name="robots" content="noindex, nofollow">
<link rel="stylesheet" href="/preview/preview.css">
<script type="importmap">{"imports":{"liquidjs":"/preview/vendor/liquid.browser.mjs"}}</script>
<script>window.__PREVIEW__=${JSON.stringify({ template: route.template, path: pagePath })};</script>
<script type="module" src="/preview/runtime.mjs"></script>`;

const site = createSite({ files, catalog: catalogData, origin, contentForHeader });

await fs.rm(out, { recursive: true, force: true });

const pages = [
  ['/', 'index.html'],
  ['/collections', 'collections/index.html'],
  ...catalog.collections.map((collection) => [`/collections/${collection.handle}`, `collections/${collection.handle}.html`]),
  ...catalog.products.map((product) => [`/products/${product.handle}`, `products/${product.handle}.html`]),
  ...catalog.pages.map((page) => [`/pages/${page.handle}`, `pages/${page.handle}.html`]),
  ['/cart', 'cart.html'],
  ['/search', 'search.html'],
  ['/password', 'password.html'],
  ['/account/login', 'account/login.html'],
  ['/account/register', 'account/register.html'],
  ['/404', '404.html'],
];

for (const [pagePath, file] of pages) {
  const { html } = await site.renderPage(pagePath);
  await write(path.join(out, file), html);
}

// Theme assets, exactly as Shopify serves them.
await fs.mkdir(path.join(out, 'assets'), { recursive: true });
for (const file of await walk(path.join(themeDir, 'assets'))) {
  await fs.copyFile(file, path.join(out, 'assets', path.basename(file)));
}

// Sample product photos (Pexels, preview only).
await fs.mkdir(path.join(out, 'preview/photos'), { recursive: true });
for (const file of await walk(path.join(here, 'media/photos'))) {
  if (file.endsWith('.jpg')) await fs.copyFile(file, path.join(out, 'preview/photos', path.basename(file)));
}

// Browser runtime: the same engine renders cart, filters, search and recommendations on the client.
await fs.mkdir(path.join(out, 'preview/lib'), { recursive: true });
for (const name of ['engine.mjs', 'store.mjs', 'site.mjs']) {
  await fs.copyFile(path.join(here, 'lib', name), path.join(out, 'preview/lib', name));
}
await write(path.join(out, 'preview/runtime.mjs'), await fs.readFile(path.join(here, 'runtime/runtime.mjs'), 'utf8'));
await write(path.join(out, 'preview/preview.css'), await fs.readFile(path.join(here, 'runtime/preview.css'), 'utf8'));
await write(
  path.join(out, 'preview/vendor/liquid.browser.mjs'),
  await fs.readFile(path.join(here, 'node_modules/liquidjs/dist/liquid.browser.mjs'), 'utf8')
);
await write(path.join(out, 'preview/bundle.json'), JSON.stringify({ files, catalog: catalogData }));

console.log(`Preview built: ${pages.length} pages → ${path.relative(process.cwd(), out) || out}`);
