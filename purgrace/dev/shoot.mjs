// Screenshots of the local preview. Usage: node shoot.mjs [outDir] [path ...]
import { chromium } from 'playwright-core';
const out = process.argv[2] || 'shots';
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ['/', '/collections/earrings', '/products/18k-gold-plated-saint-benedict-medal-5428350000'];
const base = process.env.PREVIEW || 'http://localhost:9292';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const devices = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
for (const [name, opts] of Object.entries(devices)) {
  const ctx = await browser.newContext({ ...opts, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`[${name}] pageerror:`, e.message));
  page.on('console', (m) => m.type() === 'error' && console.log(`[${name}] console:`, m.text()));
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    const slug = p.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40) || 'home';
    await page.screenshot({ path: `${out}/${name}-${slug}.png`, fullPage: true });
    console.log('shot', name, p);
  }
  await ctx.close();
}
await browser.close();
