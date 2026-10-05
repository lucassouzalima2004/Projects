// Reads the SEO texts the live store shows today (page title, meta description, collection and page
// descriptions), so the SEO files never overwrite what Priscila already wrote.
//   node fetch-live-seo.mjs   →  ../seo/live-seo.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(fs.readFileSync(path.join(here, 'fixtures/purgrace-store.json'), 'utf8'));
const BASE = 'https://purgrace.com.au';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext();
await ctx.route('**/*', (route) => (['image', 'font', 'media', 'stylesheet'].includes(route.request().resourceType()) ? route.abort() : route.continue()));

async function read(page, url, withDescription) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      const status = res ? res.status() : 0;
      if (status === 429) { await page.waitForTimeout(4000 * (attempt + 1)); continue; }
      return await page.evaluate((withDescription) => {
        const meta = (sel) => document.querySelector(sel)?.getAttribute('content') || null;
        const desc = withDescription ? (document.querySelector('.collection-hero__description, .collection__description, .rte, .main-page-content')?.innerText || '').trim() : null;
        return { title: document.title.trim(), description: meta('meta[name="description"]'), ogTitle: meta('meta[property="og:title"]'), visibleDescription: desc };
      }, withDescription).then((r) => ({ status, ...r }));
    } catch (e) {
      if (attempt === 2) return { status: 0, error: String(e).slice(0, 120) };
    }
  }
  return { status: 429 };
}

const jobs = [
  ...fixture.products.map((p) => ({ kind: 'product', handle: p.handle, url: `${BASE}/products/${p.handle}` })),
  ...fixture.collections.map((c) => ({ kind: 'collection', handle: c.handle, url: `${BASE}/collections/${c.handle}` })),
  ...Object.keys(fixture.pages).filter((u) => u.startsWith('/pages/')).map((u) => ({ kind: 'page', handle: u.split('/').pop(), url: BASE + u })),
  { kind: 'index', handle: 'home', url: `${BASE}/` },
];
const results = [];
const pages = await Promise.all([1, 2, 3].map(() => ctx.newPage()));
let next = 0;
await Promise.all(pages.map(async (page) => {
  while (next < jobs.length) {
    const job = jobs[next++];
    const r = await read(page, job.url, job.kind !== 'product');
    results.push({ ...job, ...r });
    await page.waitForTimeout(250);
  }
}));
await browser.close();
const out = path.resolve(here, '../seo/live-seo.json');
fs.writeFileSync(out, JSON.stringify({ fetched: new Date().toISOString(), base: BASE, results }, null, 1));
const bad = results.filter((r) => r.status !== 200);
console.log(`${results.length} pages read, ${bad.length} not 200`, bad.slice(0, 5).map((b) => `${b.handle}:${b.status}`).join(' '));
