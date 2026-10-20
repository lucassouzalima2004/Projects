// Builds the site into dist/: one HTML file per page plus sitemap, robots.txt and redirects.
// No dependencies, only Node 18+:  node build.mjs

import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import site from './src/site.mjs';
import { services } from './src/content.mjs';
import { layout, home, service, servicesPage, contactPage, joinPage, notFound } from './src/render.mjs';

// Previews (the workers.dev link) put their own address in canonical links and link previews, and stay out of Google:
//   SITE_URL=https://bora-signs.example.workers.dev NOINDEX=1 node build.mjs
if (process.env.SITE_URL) site.url = process.env.SITE_URL.replace(/\/+$/, '');
site.noindex = process.env.NOINDEX === '1';

const root = dirname(fileURLToPath(import.meta.url));
const pub = join(root, 'public');
const out = join(root, 'dist');

// Old Wix addresses that changed, so ads, bookmarks and Google keep landing on the right page
const redirects = {
  '/copy-of-vehicle-signage': '/trailer-wrap',
  '/contact-8': '/join-us',
  '/home': '/',
  '/blank': '/',
};

const hash = (file) => createHash('sha1').update(readFileSync(join(pub, file))).digest('hex').slice(0, 10);
const assets = {
  css: hash('assets/css/site.css'),
  js: hash('assets/js/site.js'),
  lenis: hash('assets/js/lenis.min.js'),
};

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(pub, out, { recursive: true });

const pages = [home(), servicesPage(), ...services.map(service), contactPage(), joinPage(), notFound()];

for (const page of pages) {
  writeFileSync(join(out, `${page.slug}.html`), layout({ ...page, assets }));
}

const today = new Date().toISOString().slice(0, 10);
const listed = pages.filter((p) => !p.noindex);
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${listed.map((p) => `  <url><loc>${site.url}${p.slug === 'index' ? '/' : `/${p.slug}`}</loc><lastmod>${today}</lastmod><priority>${p.slug === 'index' ? '1.0' : p.slug === 'join-us' ? '0.4' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`,
);

writeFileSync(join(out, 'robots.txt'), `User-agent: *\n${site.noindex ? 'Disallow: /' : 'Allow: /'}\n\nSitemap: ${site.url}/sitemap.xml\n`);

writeFileSync(join(out, '_redirects'), Object.entries(redirects).map(([from, to]) => `${from} ${to} 301`).join('\n') + '\n');

console.log(`Built ${pages.length} pages into ${out}`);
