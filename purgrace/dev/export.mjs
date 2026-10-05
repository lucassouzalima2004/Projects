// Builds the online preview in ../dist/site for Cloudflare Pages:
//   - every page as static HTML, for the first visit and for browsers without service workers;
//   - the theme assets;
//   - sw.js, which runs the store in the visitor's browser (cart, filters, search, language).
// Pages carry a "preview" banner and noindex, so the copy never competes with purgrace.com.au on Google.
//
//   npm run export        PREVIEW_ORIGIN=https://… sets the address used in canonical and social links
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { createStorefront } from './core.mjs';
import { decorate } from './preview-chrome.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const THEME = path.resolve(here, '../theme');
const OUT = path.resolve(here, '../dist/site');
const BUILD = path.join(here, '.build');
const ORIGIN = (process.env.PREVIEW_ORIGIN || 'https://purgrace-preview.pages.dev').replace(/\/$/, '');

// The theme as one map of path → text, shared by this build and the service worker
const files = {};
for (const dir of ['config', 'layout', 'locales', 'sections', 'snippets', 'templates']) {
  for (const name of fs.readdirSync(path.join(THEME, dir))) files[`${dir}/${name}`] = fs.readFileSync(path.join(THEME, dir, name), 'utf8');
}
fs.mkdirSync(BUILD, { recursive: true });
fs.writeFileSync(path.join(BUILD, 'theme-files.json'), JSON.stringify(files));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const write = (rel, content) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

const fixture = JSON.parse(fs.readFileSync(path.join(here, 'fixtures/purgrace-store.json'), 'utf8'));
const storefront = createStorefront({ readText: (rel) => files[rel] ?? null, fixture, origin: ORIGIN, cache: true, decorate });
const fresh = () => ({ items: [], note: '', locale: 'en' });

// Cloudflare Pages serves /collections/earrings from collections/earrings.html
const fileFor = (route) => (route === '/' ? 'index.html' : `${route.slice(1)}.html`);
let pages = 0;
for (const route of storefront.routes()) {
  const out = await storefront.handle({ url: route, state: fresh() });
  if (out.status !== 200) throw new Error(`${route} answered ${out.status}`);
  write(fileFor(route), out.body);
  pages++;
}
write('404.html', (await storefront.handle({ url: '/404', state: fresh() })).body);

fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
for (const name of fs.readdirSync(path.join(THEME, 'assets'))) fs.copyFileSync(path.join(THEME, 'assets', name), path.join(OUT, 'assets', name));

await esbuild.build({
  entryPoints: [path.join(here, 'sw-entry.mjs')],
  outfile: path.join(OUT, 'sw.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  legalComments: 'none',
  logLevel: 'warning',
});

write('_headers', ['/*', '  X-Robots-Tag: noindex, nofollow', '/sw.js', '  Cache-Control: no-cache', ''].join('\n'));
write('robots.txt', 'User-agent: *\nDisallow: /\n');

const size = (fs.statSync(path.join(OUT, 'sw.js')).size / 1024).toFixed(0);
console.log(`Preview built in dist/site: ${pages} pages, sw.js ${size} KB, links point to ${ORIGIN}`);
