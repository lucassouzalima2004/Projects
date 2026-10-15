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
@font-face{font-family:Montserrat;src:url(${pathToFileURL(new URL('public/assets/fonts/montserrat.woff2', root).pathname)}) format('woff2');font-weight:300 800}
@font-face{font-family:Inter;src:url(${pathToFileURL(new URL('public/assets/fonts/inter.woff2', root).pathname)}) format('woff2');font-weight:300 700}`;
// A mesma foto do topo do site
const photo = pathToFileURL(new URL('public/assets/img/obras/fundacoes-grua-1600.webp', root).pathname);

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
  *{box-sizing:border-box}
  body{margin:0;width:1200px;height:630px;position:relative;overflow:hidden;color:#fff;font-family:Inter;
    background:linear-gradient(90deg,rgba(10,11,13,.9) 0%,rgba(10,11,13,.66) 46%,rgba(10,11,13,.12) 100%),
      linear-gradient(0deg,rgba(10,11,13,.55) 0%,rgba(10,11,13,0) 45%),url(${photo}) 60% 58%/cover #5e5550}
  .in{position:absolute;inset:0;padding:58px 64px 60px;display:flex;flex-direction:column}
  svg{width:236px;color:#fff}
  .pill{margin-top:auto;align-self:flex-start;display:flex;align-items:center;gap:12px;padding:9px 20px 9px 15px;border:1px solid rgba(255,255,255,.24);
    border-radius:999px;background:rgba(255,255,255,.1);font:500 19px/1.2 Montserrat}
  .pill i{width:10px;height:10px;border-radius:50%;background:#e3a21a;box-shadow:0 0 0 5px rgba(227,162,26,.25)}
  h1{margin:28px 0 0;font:700 ${{ pt: 92, es: 92, en: 92, fr: 86 }[lang]}px/1.02 Montserrat;letter-spacing:-.035em;white-space:nowrap}
  h1 span{display:block}mark{background:none;color:#e3a21a}
  </style><div class="in"><svg viewBox="${logo.viewBox}">${logo.body}</svg><p class="pill"><i></i>${t.line}</p><h1>${t.title
    .map((x) => `<span>${x}</span>`)
    .join('')}</h1></div>`;
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
    `<!doctype html><style>body{margin:0;width:${size}px;height:${size}px;background:#0d0e10;border-radius:${radius}px;display:grid;place-items:center}svg{height:${size - pad * 2}px;color:#fff;--logo-accent:#e3a21a}</style><svg viewBox="${mark.viewBox}">${mark.body}</svg>`,
  );
  await page.goto(pathToFileURL(f).href);
  await page.screenshot({ path: out, omitBackground: false });
};
await icon(180, new URL('public/assets/img/apple-touch-icon.png', root).pathname);
await icon(32, join(dir, 'fav32.png'));
await icon(192, new URL('public/assets/img/icon-192.png', root).pathname);
await browser.close();
console.log('ok', dir);
