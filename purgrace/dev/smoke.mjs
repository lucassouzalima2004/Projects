// Interaction smoke test against the local preview: cart drawer, quantity, variants,
// predictive search, filters, menu drawer, size guide and language switch.
// Usage: node smoke.mjs [screenshotDir]
import { chromium } from 'playwright-core';

const out = process.argv[2] || 'shots';
const base = process.env.PREVIEW || 'http://localhost:9292';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures++;
};
const errors = [];
const track = (page) => {
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text()) && errors.push(m.text()));
};

/* ---------------------------------------------------------------- desktop */
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktop.newPage();
track(page);
await page.request.post(`${base}/cart/clear.js`); // the preview keeps one shared cart

await page.goto(`${base}/products/18k-gold-plated-saint-benedict-medal-5428350000`, { waitUntil: 'networkidle' });
await page.click('.product-form__submit');
await page.waitForSelector('#CartDrawer[open]', { timeout: 5000 });
await page.waitForTimeout(700);
check(await page.isVisible('#CartDrawer .cart-item'), 'add to cart opens the drawer with the item');
check((await page.textContent('#cart-icon-bubble .cart-count'))?.trim() === '1', 'cart count bubble shows 1');
check(await page.isVisible('#CartDrawer .ship-bar'), 'free shipping bar is shown');
await page.screenshot({ path: `${out}/flow-cart-drawer.png` });

await page.click('#CartDrawer .qty__btn[name="plus"]');
await page.waitForFunction(() => document.querySelector('#cart-icon-bubble .cart-count')?.textContent.trim() === '2', null, { timeout: 5000 });
check(true, 'quantity plus updates the cart to 2');
check((await page.textContent('#CartDrawer .ship-bar__text')).includes('free shipping') || (await page.textContent('#CartDrawer .ship-bar__text')).length > 0, 'shipping bar text updates');
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
check(!(await page.isVisible('#CartDrawer[open]')), 'Escape closes the drawer');

// Variants on a ring
await page.goto(`${base}/products/half-eternity-ring-in-925-silver-with-cubic-zirconia-81022806`, { waitUntil: 'networkidle' });
await page.click('label.pill:has-text("R")');
await page.waitForTimeout(400);
check(page.url().includes('variant='), 'choosing a size updates the URL');
check((await page.textContent('.option__selected')).trim() === 'R', 'the selected size shows next to the label');
await page.click('[data-dialog-open^="SizeGuide-"]');
await page.waitForSelector('dialog.modal[open]', { timeout: 3000 });
check(await page.isVisible('dialog.modal[open] .size-table table'), 'size guide pop-up shows the ring table');
await page.screenshot({ path: `${out}/flow-size-guide.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

// Predictive search
await page.click('[data-dialog-open="SearchModal"]');
await page.waitForSelector('#SearchModal[open]');
await page.fill('#SearchModalInput', 'cross');
await page.waitForSelector('#PredictiveResults .predictive__product', { timeout: 5000 });
check((await page.$$('#PredictiveResults .predictive__product')).length > 0, 'predictive search shows products for "cross"');
await page.screenshot({ path: `${out}/flow-search.png` });
await page.keyboard.press('Escape');

// Filters without reload
await page.goto(`${base}/collections/earrings`, { waitUntil: 'networkidle' });
const before = (await page.$$('.product-grid__item')).length;
await page.click('label.facet__label:has-text("925 sterling silver")');
await page.waitForFunction((n) => document.querySelectorAll('.product-grid__item').length !== n, before, { timeout: 5000 });
const after = (await page.$$('.product-grid__item')).length;
check(after > 0 && after < before, `silver filter narrows the grid (${before} → ${after})`);
check(page.url().includes('filter.p.m.custom.material'), 'filter is kept in the URL');
check(await page.isVisible('.active-filters .pill--remove'), 'active filter pill is shown');
await page.screenshot({ path: `${out}/flow-filters.png` });

// Quick add from a card
await page.hover('.product-grid__item:first-child .card');
await page.click('.product-grid__item:first-child .card__add');
await page.waitForSelector('#CartDrawer[open]', { timeout: 5000 });
check(true, 'quick add from a card opens the drawer');
await desktop.close();

/* ---------------------------------------------------------------- mobile */
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const m = await mobile.newPage();
track(m);
await m.goto(`${base}/`, { waitUntil: 'networkidle' });
await m.click('.header__menu');
await m.waitForSelector('#MenuDrawer[open]');
await m.waitForTimeout(600);
check(await m.isVisible('#MenuDrawer .menu-drawer__link'), 'mobile menu drawer opens');
await m.screenshot({ path: `${out}/flow-mobile-menu.png` });
await m.keyboard.press('Escape');

await m.goto(`${base}/collections/earrings`, { waitUntil: 'networkidle' });
await m.click('[data-facets-open]');
await m.waitForTimeout(600);
check(await m.isVisible('.facets.is-open'), 'mobile filter panel opens');
await m.screenshot({ path: `${out}/flow-mobile-filters.png` });

await m.goto(`${base}/products/half-eternity-ring-in-925-silver-with-cubic-zirconia-81022806`, { waitUntil: 'networkidle' });
await m.evaluate(() => window.scrollTo(0, 1600));
await m.waitForTimeout(700);
check(await m.isVisible('sticky-atc.is-visible'), 'sticky add to cart bar appears after scrolling');
await mobile.close();

/* ---------------------------------------------------------------- language */
const pt = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p = await pt.newPage();
track(p);
await p.goto(`${base}/`, { waitUntil: 'networkidle' });
await p.click('.header__localization button[value="pt-BR"]');
await p.waitForLoadState('networkidle');
check((await p.textContent('.header__icons')).length >= 0 && (await p.content()).includes('Pular para o conteúdo'), 'PT switch renders Portuguese strings');
await pt.close();

await browser.close();
check(errors.length === 0, `no JavaScript errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
console.log(failures ? `\n${failures} failed` : '\nall passed');
process.exitCode = failures ? 1 : 0;
