// Gera as imagens de prévia do link (og-pt/es/en/fr.jpg, 1200x630), o ícone do iPhone e o favicon.ico.
// Uso: node tools/make-images.mjs  (precisa do Playwright com o Chromium instalado)
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = new URL('..', import.meta.url);
const file = (p) => new URL(p, root);
const sprite = readFileSync(file('public/assets/img/logo.svg'), 'utf8');
const symbol = (id) => {
  const m = new RegExp(`<symbol id="${id}" viewBox="([^"]+)">([\\s\\S]*?)</symbol>`).exec(sprite);
  return { viewBox: m[1], body: m[2] };
};
const logo = symbol('logo');
const mark = symbol('mark');
const fonts = `
@font-face{font-family:Archivo;src:url(${pathToFileURL(new URL('public/assets/fonts/archivo.woff2', root).pathname)}) format('woff2');font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:'Fragment Mono';src:url(${pathToFileURL(new URL('public/assets/fonts/fragment-mono.woff2', root).pathname)}) format('woff2')}`;
const photo = pathToFileURL(new URL('public/assets/img/obras/laje-sant-cugat-1080.webp', root).pathname);

const TEXT = {
  pt: { title: ['Construímos', 'com <mark>rigor.</mark>'], line: 'Construção civil · Portugal e Espanha' },
  es: { title: ['Construimos', 'con <mark>rigor.</mark>'], line: 'Construcción · Portugal y España' },
  en: { title: ['We build', 'with <mark>rigour.</mark>'], line: 'Construction · Portugal and Spain' },
  fr: { title: ['Construire', 'avec <mark>rigueur.</mark>'], line: 'Construction · Portugal et Espagne' },
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const dir = mkdtempSync(join(tmpdir(), 'jesten-'));
for (const [lang, t] of Object.entries(TEXT)) {
  const html = `<!doctype html><meta charset="utf-8"><style>${fonts}
  *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;display:grid;grid-template-columns:660px 540px;background:#141412;color:#eceae4;font-family:Archivo}
  .l{padding:56px 56px 50px;display:flex;flex-direction:column}
  svg{width:250px;color:#eceae4}
  h1{margin:auto 0 30px;font-weight:820;font-stretch:112%;font-size:${{ pt: 62, es: 62, en: 60, fr: 54 }[lang]}px;line-height:.94;letter-spacing:-.02em;text-transform:uppercase;white-space:nowrap}
  h1 span{display:block}mark{background:#d99b13;color:#141412;padding:0 .07em}
  p{margin:0;font:400 17px/1.3 'Fragment Mono';letter-spacing:.06em;text-transform:uppercase;color:#a19e95;display:flex;align-items:center;gap:14px}
  p i{width:36px;height:2px;background:#d99b13}
  .r{background:url(${photo}) 42% 50%/cover}
  </style><div class="l"><svg viewBox="${logo.viewBox}">${logo.body}</svg><h1>${t.title.map((x) => `<span>${x}</span>`).join('')}</h1><p><i></i>${t.line}</p></div><div class="r"></div>`;
  const f = join(dir, `og-${lang}.html`);
  writeFileSync(f, html);
  await page.goto(pathToFileURL(f).href);
  await page.waitForTimeout(400);
  await page.screenshot({ path: new URL(`public/assets/img/og-${lang}.jpg`, root).pathname, type: 'jpeg', quality: 86 });
}

// Ícones: marca TJ sobre preto
const icon = async (size, out, radius = 0) => {
  await page.setViewportSize({ width: size, height: size });
  const pad = Math.round(size * 0.2);
  const f = join(dir, `icon-${size}.html`);
  writeFileSync(
    f,
    `<!doctype html><style>body{margin:0;width:${size}px;height:${size}px;background:#141412;border-radius:${radius}px;display:grid;place-items:center}svg{height:${size - pad * 2}px;color:#f2f1ec;--logo-accent:#e8a20c}</style><svg viewBox="${mark.viewBox}">${mark.body}</svg>`,
  );
  await page.goto(pathToFileURL(f).href);
  await page.screenshot({ path: out, omitBackground: false });
};
await icon(180, new URL('public/assets/img/apple-touch-icon.png', root).pathname);
await icon(32, join(dir, 'fav32.png'));
await icon(192, new URL('public/assets/img/icon-192.png', root).pathname);
await browser.close();
console.log('ok', dir);
