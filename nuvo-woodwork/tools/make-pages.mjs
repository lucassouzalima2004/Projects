// Gera as páginas internas do site a partir de tools/pages/content.mjs:
//   projects/ (a biblioteca de projetos) e projects/<projeto>/   products/   journal/ e /<post>/   about-us/
// Os endereços são os mesmos do site antigo (nuvowoodwork.com), para os links do Google continuarem valendo
// quando o domínio mudar. O logo, os ícones e o rodapé vêm do index.html (uma fonte só).
//
// uso: node tools/make-pages.mjs   (dentro de nuvo-woodwork/; não precisa instalar nada)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects, products, journal, about } from './pages/content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIB = path.join(ROOT, 'assets/img/library');
const SITE = 'https://nuvowoodwork.com';
const PHONE = ['(561) 770-2595', '+15617702595'];

/* ------------------------------------------------------------ ajudantes */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');
const pad = (n) => String(n).padStart(2, '0');
const arrow = '<svg aria-hidden="true"><use href="#i-arrow"/></svg>';

// Largura e altura de um WebP (lendo o cabeçalho do arquivo)
const sizes = new Map();
function dims(file) {
  if (sizes.has(file)) return sizes.get(file);
  const p = path.join(LIB, file + '.webp');
  if (!fs.existsSync(p)) throw new Error('Falta a foto ' + p + ' (rode tools/make-photos.py)');
  const b = fs.readFileSync(p);
  const kind = b.toString('ascii', 12, 16);
  let w, h;
  if (kind === 'VP8 ') {
    w = b.readUInt16LE(26) & 0x3fff;
    h = b.readUInt16LE(28) & 0x3fff;
  } else if (kind === 'VP8L') {
    const n = b.readUInt32LE(21);
    w = (n & 0x3fff) + 1;
    h = ((n >> 14) & 0x3fff) + 1;
  } else if (kind === 'VP8X') {
    w = b.readUIntLE(24, 3) + 1;
    h = b.readUIntLE(27, 3) + 1;
  } else throw new Error('WebP desconhecido: ' + p);
  const d = { w, h };
  sizes.set(file, d);
  return d;
}

// <img> com as duas versões (900 px e a grande); sizes = largura na tela
function img(name, alt, { sizes: sz = '100vw', eager = false, cls = '' } = {}) {
  const big = dims(name);
  const small = dims(name + '-sm');
  return (
    `<img${cls ? ` class="${cls}"` : ''} src="/assets/img/library/${name}-sm.webp" ` +
    `srcset="/assets/img/library/${name}-sm.webp ${small.w}w, /assets/img/library/${name}.webp ${big.w}w" ` +
    `sizes="${sz}" width="${small.w}" height="${small.h}" alt="${esc(alt)}" ` +
    (eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"') + '>'
  );
}

// Uma foto que abre em tela cheia (pages.js); o grupo é o elemento com data-lb-group em volta
function shot(name, alt, opts = {}) {
  const big = dims(name);
  return (
    `<button class="shot${opts.btnCls ? ' ' + opts.btnCls : ''}" type="button" data-lb data-src="/assets/img/library/${name}.webp" ` +
    `data-w="${big.w}" data-h="${big.h}" aria-label="${esc('Open photo: ' + alt)}">${img(name, alt, opts)}` +
    (opts.more ? `<span class="shot__more">+${opts.more}</span>` : '') + '</button>'
  );
}

const dateText = (iso) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/* ------------------------------------------------------------ casca da página */
const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const defs = index.match(/<svg class="sr-defs"[\s\S]*?<\/svg>\n/)[0];
const footer = index.match(/<footer class="footer on-dark">[\s\S]*?<\/footer>/)[0];

const NAV = [
  ['/projects/', 'Projects'],
  ['/products/', 'Products'],
  ['/about-us/', 'About'],
  ['/journal/', 'Journal'],
];

function shell({ url, title, description, body, active, lightbox = false }) {
  const nav = NAV.map(([href, label]) => `<a href="${href}"${href === active ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ');
  const menu = [['/', 'The house'], ...NAV, ['/#contact', 'Contact']]
    .map(([href, label]) => `<a href="${href}"${href === active ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('\n      ');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <!-- Prévia: fora do Google até o site ir para o domínio da Nuvo (aí é só apagar esta linha em tools/make-pages.mjs) -->
  <meta name="robots" content="noindex">
  <link rel="canonical" href="${SITE}${url}">
  <meta name="theme-color" content="#14110F">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="NUVO Woodwork">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="/assets/img/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
  <link rel="preload" href="/assets/fonts/jost.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/instrument-sans.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script src="/assets/js/boot.js"></script>
</head>
<body class="page">
  <a class="skip-link" href="#main">Skip to content</a>

  ${defs}
  <header class="header" data-header>
    <a class="header__brand" href="/" aria-label="NUVO Woodwork, home">
      <svg class="logo" width="148" height="41" viewBox="0 0 147.6 40.5" aria-hidden="true"><use href="#logo"/></svg>
    </a>
    <nav class="header__nav" aria-label="Main">
      ${nav}
    </nav>
    <a class="btn btn--line btn--small header__cta" href="/#contact">Free 3D design</a>
    <button class="header__menu" type="button" aria-expanded="false" aria-controls="menu" data-menu-btn>
      <span class="sr-only" data-menu-label>Open menu</span>
      <svg aria-hidden="true"><use href="#i-menu"/></svg>
    </button>
  </header>

  <div class="menu" id="menu" data-menu inert>
    <nav aria-label="Menu">
      ${menu}
    </nav>
    <p class="menu__foot">
      <a href="tel:${PHONE[1]}">${PHONE[0]}</a>
      <a href="mailto:info@nuvowoodwork.com">info@nuvowoodwork.com</a>
    </p>
  </div>

  <main id="main">
${body}
${cta()}
  </main>

  ${footer}
${lightbox ? lightboxMarkup() : ''}
  <script src="/assets/js/app.js" defer></script>
  <script src="/assets/js/pages.js" defer></script>
</body>
</html>
`;
}

function lightboxMarkup() {
  return `
  <dialog class="lb" data-lb-box aria-label="Photo viewer">
    <figure class="lb__fig">
      <img class="lb__img" alt="" data-lb-img>
      <figcaption class="lb__cap"><span class="lb__count" data-lb-count></span><span data-lb-alt></span></figcaption>
    </figure>
    <button class="lb__btn lb__prev" type="button" data-lb-prev aria-label="Previous photo"><svg aria-hidden="true"><use href="#i-arrow"/></svg></button>
    <button class="lb__btn lb__next" type="button" data-lb-next aria-label="Next photo"><svg aria-hidden="true"><use href="#i-arrow"/></svg></button>
    <button class="lb__close" type="button" data-lb-close aria-label="Close"><svg aria-hidden="true"><use href="#i-close"/></svg></button>
  </dialog>
`;
}

function cta() {
  return `    <section class="cta-band on-dark" aria-labelledby="cta-title">
      <div class="wrap cta-band__in">
        <p class="eyebrow">Free 3D design consultation</p>
        <h2 class="h2" id="cta-title">Let's draw <em>your</em> room.</h2>
        <p class="lead">Tell us about the space. We visit, measure and show you the design in 3D before anything is built, at no cost.</p>
        <div class="cta-band__actions">
          <a class="btn btn--solid" href="/#contact">Request my free consultation${arrow}</a>
          <a class="btn btn--line" href="tel:${PHONE[1]}">Call ${PHONE[0]}</a>
        </div>
      </div>
    </section>`;
}

// O topo escuro de cada página: caminho, rótulo, título e texto
function hero({ crumbs, eyebrow, title, lead, extra = '', cls = '' }) {
  const trail = crumbs
    .map(([href, label]) => (href ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`))
    .join('<span class="crumbs__sep" aria-hidden="true">/</span>');
  return `    <section class="page-hero on-dark${cls ? ' ' + cls : ''}">
      <div class="wrap page-hero__in">
        <nav class="crumbs" aria-label="Breadcrumb">${trail}</nav>
        <p class="eyebrow">${esc(eyebrow)}</p>
        <h1 class="page-title">${rich(title)}</h1>
        ${lead ? `<p class="lead">${rich(lead)}</p>` : ''}
        ${extra}
      </div>
    </section>`;
}

const projectMeta = (p) => [p.place, p.kind].filter(Boolean).join(' · ');
const photoCount = (n) => `${n} photo${n === 1 ? '' : 's'}`;

/* ------------------------------------------------------------ projetos */
function projectsPage() {
  const cards = projects
    .map((p, i) => {
      const [cover, alt] = p.photos[0];
      const wide = i % 5 === 0; // 1 larga, 2 + 2 lado a lado
      return `        <li class="work-card${wide ? ' work-card--wide' : ''}">
          <a href="/projects/${p.slug}/">
            <div class="work-card__img">${img(cover, alt, { sizes: wide ? '(max-width: 760px) 100vw, 1320px' : '(max-width: 760px) 100vw, 640px' })}</div>
            <div class="work-card__cap">
              <span class="work-card__num">${pad(i + 1)}</span>
              <div class="work-card__text">
                <h2 class="work-card__name">${esc(p.title)}</h2>
                <span class="work-card__meta">${esc([projectMeta(p), photoCount(p.photos.length)].join(' · '))}</span>
              </div>
              <span class="work-card__go">View${arrow}</span>
            </div>
          </a>
        </li>`;
    })
    .join('\n');
  const body = `${hero({
    crumbs: [['/', 'Home'], [null, 'Projects']],
    eyebrow: `Completed projects · ${pad(projects.length)}`,
    title: 'Signature interiors, *curated for every lifestyle.*',
    lead: 'Explore completed projects across South Florida, from Boca Raton and Delray Beach to Miami and Parkland. Every photo is our own work.',
  })}

    <section class="work on-light" aria-label="All projects">
      <div class="wrap">
        <ol class="work-grid">
${cards}
        </ol>
      </div>
    </section>
`;
  return shell({
    url: '/projects/',
    title: 'Projects · NUVO Woodwork',
    description: 'Completed custom woodwork projects across South Florida: kitchens, closets, media walls, bars and millwork in Boca Raton, Delray Beach, Miami and Parkland.',
    body,
    active: '/projects/',
  });
}

function projectPage(p, i) {
  const [cover, coverAlt] = p.photos[0];
  const rest = p.photos.slice(1);
  const facts = [
    ['Type', p.kind],
    p.place && ['Location', p.place],
    ['Rooms', p.rooms.join(' · ')],
    ['Photos', String(p.photos.length)],
  ]
    .filter(Boolean)
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`)
    .join('');
  const next = [1, 2, 3].map((k) => projects[(i + k) % projects.length]);
  const more = next
    .map((q, k) => `          <li>
            <a class="index__row" href="/projects/${q.slug}/">
              <span class="index__num">${pad(((i + k + 1) % projects.length) + 1)}</span>
              <h3 class="index__name">${esc(q.title)}</h3>
              <p class="index__desc">${esc(q.rooms.join(' · '))}</p>
              <span class="index__go">View project${arrow}</span>
              ${img(q.photos[0][0], '', { sizes: '96px', cls: 'index__thumb' })}
            </a>
          </li>`)
    .join('\n');
  const body = `${hero({
    crumbs: [['/', 'Home'], ['/projects/', 'Projects'], [null, p.title]],
    eyebrow: `Project ${pad(i + 1)} · ${projectMeta(p)}`,
    title: p.title,
    extra: `<dl class="facts">${facts}</dl>`,
    cls: 'page-hero--split',
  })}

    <div class="cover-band" data-lb-group>
      <div class="wrap">
        ${shot(cover, coverAlt, { sizes: '(max-width: 1400px) 100vw, 1320px', eager: true, btnCls: 'shot--cover' })}
      </div>
${rest.length ? `      <div class="wrap gallery">
        ${rest.map(([n, a]) => shot(n, a, { sizes: '(max-width: 560px) 100vw, (max-width: 900px) 50vw, 440px' })).join('\n        ')}
      </div>` : ''}
    </div>

    <section class="more on-light" aria-labelledby="more-title">
      <div class="wrap">
        <header class="more__head">
          <h2 class="more__title" id="more-title">More projects</h2>
          <a class="link-arrow" href="/projects/">All ${projects.length} projects${arrow}</a>
        </header>
        <ol class="index">
${more}
        </ol>
      </div>
    </section>
`;
  return shell({
    url: `/projects/${p.slug}/`,
    title: `${p.title} · NUVO Woodwork`,
    description: `${p.title}: custom woodwork by NUVO Woodwork${p.place ? ' in ' + p.place : ' in South Florida'}. ${p.rooms.join(', ')}.`,
    body,
    active: '/projects/',
    lightbox: true,
  });
}

/* ------------------------------------------------------------ produtos */
function productsPage() {
  const nav = products
    .map((c, i) => `<a href="#${c.id}"><span>${pad(i + 1)}</span>${esc(c.name)}</a>`)
    .join('');
  const sections = products
    .map((c, i) => {
      const shown = c.photos.slice(0, 5);
      const extra = c.photos.length - shown.length;
      const photos = shown
        .map((n, k) => {
          const alt = altOf(n) || `${c.name} by NUVO Woodwork`;
          const big = k === 0 && shown.length > 2;
          return shot(n, alt, {
            sizes: big || shown.length === 1 ? '(max-width: 760px) 100vw, 660px' : '(max-width: 760px) 50vw, 330px',
            more: k === shown.length - 1 && extra > 0 ? extra : 0,
          });
        })
        .join('\n          ');
      // as fotos que não aparecem na grade só entram na tela cheia
      const hidden = c.photos
        .slice(5)
        .map((n) => {
          const big = dims(n);
          return `<button class="shot" type="button" hidden data-lb data-src="/assets/img/library/${n}.webp" data-w="${big.w}" data-h="${big.h}" data-alt="${esc(altOf(n) || c.name)}"></button>`;
        })
        .join('');
      const specs = c.items
        ? `<ol class="specs">${c.items
            .map(([t, d], k) => `<li class="spec"><span class="spec__ref">${String.fromCharCode(65 + i)}.${k + 1}</span><h3 class="spec__name">${esc(t)}</h3><p>${esc(d)}</p></li>`)
            .join('')}</ol>`
        : `<ul class="specs specs--list">${c.list.map((t, k) => `<li class="spec"><span class="spec__ref">${String.fromCharCode(65 + i)}.${k + 1}</span><h3 class="spec__name">${esc(t)}</h3></li>`).join('')}</ul>`;
      return `    <section class="product on-light" id="${c.id}" aria-labelledby="p-${c.id}">
      <div class="wrap">
        <header class="product__head">
          <span class="product__num">${pad(i + 1)} / ${pad(products.length)}</span>
          <h2 class="h2" id="p-${c.id}">${esc(c.name)}</h2>
        </header>
        <div class="product__grid">
          <div class="product__copy">
            <p class="product__lead">${esc(c.intro[0])}</p>
            <p>${esc(c.intro[1])}</p>
            ${c.outro ? `<p>${esc(c.outro)}</p>` : ''}
            <a class="btn btn--solid" href="/?room=${encodeURIComponent(c.room)}#contact">Plan your ${esc(c.name.replace(/s$/, '').toLowerCase())}${arrow}</a>
          </div>
          ${specs}
        </div>
        <div class="product__photos product__photos--${Math.min(shown.length, 5)}" data-lb-group>
          ${photos}${hidden}
        </div>
      </div>
    </section>`;
    })
    .join('\n\n');
  const body = `${hero({
    crumbs: [['/', 'Home'], [null, 'Products']],
    eyebrow: `Products · ${pad(products.length)} rooms`,
    title: 'Custom cabinetry & built-ins, *crafted to captivate & endure.*',
    lead: 'From kitchens and entertainment spaces to tailored storage and architectural millwork, each solution is designed to bring precision, elegance, and lasting function to South Florida homes.',
  })}

    <nav class="subnav" aria-label="Products" data-subnav>
      <div class="wrap subnav__in">${nav}</div>
    </nav>

${sections}
`;
  return shell({
    url: '/products/',
    title: 'Products · Custom kitchens, closets & built-ins · NUVO Woodwork',
    description: 'Custom kitchens, closets, entertainment rooms, bars, home offices, foyers, laundry rooms and architectural millwork for luxury homes in South Florida.',
    body,
    active: '/products/',
    lightbox: true,
  });
}

// O texto alternativo de uma foto que também aparece num projeto
function altOf(name) {
  for (const p of projects) for (const [n, a] of p.photos) if (n === name) return a;
  for (const j of journal) {
    if (j.cover[0] === name) return j.cover[1];
    for (const b of j.body) if (b[0] === 'img' && b[1] === name) return b[2];
  }
  return '';
}

/* ------------------------------------------------------------ journal */
const words = (j) => j.body.filter((b) => b[0] === 'p' || b[0] === 'h2').reduce((n, b) => n + b[1].split(/\s+/).length, 0);
const readTime = (j) => `${Math.max(1, Math.round(words(j) / 220))} min read`;

function postCard(j, h = 'h2') {
  return `<article class="post-card">
          <a class="post-card__img" href="/${j.slug}/" tabindex="-1" aria-hidden="true">${img(j.cover[0], '', { sizes: '(max-width: 760px) 100vw, 760px' })}</a>
          <div class="post-card__text">
            <p class="post-card__meta"><time datetime="${j.date}">${dateText(j.date)}</time> · ${esc(j.place)}</p>
            <${h} class="post-card__title"><a href="/${j.slug}/">${esc(j.title)}</a></${h}>
            <p>${esc(j.description)}</p>
            <a class="link-arrow" href="/${j.slug}/" aria-hidden="true" tabindex="-1">Read the story${arrow}</a>
          </div>
        </article>`;
}

function journalPage() {
  const list = [...journal].sort((a, b) => b.date.localeCompare(a.date));
  const body = `${hero({
    crumbs: [['/', 'Home'], [null, 'Journal']],
    eyebrow: 'Journal',
    title: 'Project stories & *woodwork insights.*',
    lead: 'Custom woodwork insights and project stories from homes across South Florida.',
  })}

    <section class="journal on-light" aria-label="All stories">
      <div class="wrap journal__list">
        ${list.map((j) => postCard(j)).join('\n        ')}
      </div>
    </section>
`;
  return shell({
    url: '/journal/',
    title: 'Journal · NUVO Woodwork',
    description: 'Custom woodwork insights and project stories in South Florida, by NUVO Woodwork.',
    body,
    active: '/journal/',
  });
}

function postPage(j) {
  const blocks = j.body
    .map((b) => {
      if (b[0] === 'p') return `<p>${esc(b[1])}</p>`;
      if (b[0] === 'h2') return `<h2>${esc(b[1])}</h2>`;
      if (b[0] === 'img') return `<figure class="prose__wide">${shot(b[1], b[2], { sizes: '(max-width: 1100px) 100vw, 1040px' })}</figure>`;
      if (b[0] === 'pair')
        return `<div class="prose__wide prose__pair">${b
          .slice(1)
          .map(([n, a]) => `<figure>${shot(n, a, { sizes: '(max-width: 760px) 100vw, 520px' })}</figure>`)
          .join('')}</div>`;
      return '';
    })
    .join('\n          ');
  const others = journal.filter((o) => o !== j);
  const body = `${hero({
    crumbs: [['/', 'Home'], ['/journal/', 'Journal'], [null, j.title]],
    eyebrow: `${dateText(j.date)} · ${j.place}`,
    title: j.title,
    extra: `<p class="page-hero__note">${readTime(j)}</p>`,
    cls: 'page-hero--split',
  })}

    <div class="cover-band cover-band--post" data-lb-group>
      <div class="wrap">
        ${shot(j.cover[0], j.cover[1], { sizes: '(max-width: 1400px) 100vw, 1320px', eager: true, btnCls: 'shot--cover' })}
      </div>
      <article class="wrap prose">
          ${blocks}
      </article>
    </div>
${others.length ? `
    <section class="more on-light" aria-labelledby="more-title">
      <div class="wrap">
        <header class="more__head">
          <h2 class="more__title" id="more-title">Keep reading</h2>
          <a class="link-arrow" href="/journal/">All stories${arrow}</a>
        </header>
        <div class="journal__list">
        ${others.map((o) => postCard(o, 'h3')).join('\n        ')}
        </div>
      </div>
    </section>
` : ''}`;
  return shell({
    url: `/${j.slug}/`,
    title: `${j.title} | ${j.place} · NUVO Woodwork`,
    description: j.description,
    body,
    active: '/journal/',
    lightbox: true,
  });
}

/* ------------------------------------------------------------ about */
function aboutPage() {
  const a = about;
  const journey = a.journey
    .map(([when, what], k) => `<li class="step">
            <span class="step__dim" aria-hidden="true"><span>${pad(k + 1)}</span></span>
            <h3>${esc(when)}</h3>
            <p>${esc(what)}</p>
          </li>`)
    .join('\n          ');
  const values = a.values
    .map(([t, d], k) => `<li class="value"><span class="value__num">${pad(k + 1)}</span><h3 class="value__name">${esc(t)}</h3><p>${esc(d)}</p></li>`)
    .join('\n          ');
  const apart = a.apart
    .map(([t, d], k) => `<li class="step">
            <span class="step__dim" aria-hidden="true"><span>${pad(k + 1)}</span></span>
            <h3>${esc(t)}</h3>
            <p>${esc(d)}</p>
          </li>`)
    .join('\n          ');
  const body = `${hero({
    crumbs: [['/', 'Home'], [null, 'About']],
    eyebrow: 'About us · Since 2015',
    title: 'Where artistic vision meets *functional interiors.*',
    lead: 'A family craft from Belo Horizonte, built into homes across South Florida.',
  })}

    <section class="about-who on-light" aria-labelledby="who-title">
      <div class="wrap about-who__grid">
        <div class="about-who__copy">
          <p class="eyebrow">Who we are</p>
          <h2 class="h2" id="who-title">Carpentry is a <em>family profession.</em></h2>
          ${a.who.slice(1).map((t) => `<p>${esc(t)}</p>`).join('\n          ')}
        </div>
        <figure class="about-who__fig">
          ${img('luxury-home-bar-lotuspalm31014-1', 'Bar with three backlit arched cabinets and a marble counter', { sizes: '(max-width: 900px) 100vw, 600px' })}
          <figcaption>Lotus Palm Grand Residence</figcaption>
        </figure>
      </div>
      <div class="wrap">
        <dl class="stats">
          <div class="stat"><dt>Years of family craft</dt><dd>30+</dd></div>
          <div class="stat"><dt>Building in South Florida since</dt><dd>2015</dd></div>
          <div class="stat"><dt>Growth since 2021</dt><dd>330%</dd></div>
          <div class="stat"><dt>Contractors &amp; subcontractors</dt><dd>30</dd></div>
        </dl>
      </div>
    </section>

    <section class="process on-dark" aria-labelledby="journey-title">
      <div class="wrap">
        <header class="section-head">
          <p class="eyebrow">Our journey in the United States</p>
          <h2 class="h2" id="journey-title">From local expertise to <em>international expansion.</em></h2>
        </header>
        <ol class="steps steps--four">
          ${journey}
        </ol>
      </div>
    </section>

    <section class="about-values on-light" aria-labelledby="values-title">
      <div class="wrap">
        <header class="section-head">
          <p class="eyebrow">Our value</p>
          <h2 class="h2" id="values-title">Crafting beautiful interiors with <em>passion and precision.</em></h2>
        </header>
        <div class="creed">
          <div class="creed__item"><h3>Our vision</h3><p>${esc(a.vision)}</p></div>
          <div class="creed__item"><h3>Our mission</h3><p>${esc(a.mission)}</p></div>
        </div>
        <ol class="values">
          ${values}
        </ol>
      </div>
    </section>

    <section class="process on-dark" aria-labelledby="apart-title">
      <div class="wrap">
        <header class="section-head">
          <p class="eyebrow">Why NUVO</p>
          <h2 class="h2" id="apart-title">What sets NUVO <em>apart.</em></h2>
          <p class="lead">The qualities that shape our client experience, execution standards, and long-term reputation.</p>
        </header>
        <ol class="steps">
          ${apart}
        </ol>
      </div>
    </section>
`;
  return shell({
    url: '/about-us/',
    title: 'About · NUVO Woodwork',
    description: 'NUVO Woodwork is led by master craftsman Eduardo Ramos: 30+ years of family carpentry, building custom woodwork in South Florida since 2015.',
    body,
    active: '/about-us/',
  });
}

/* ------------------------------------------------------------ home: projetos recentes */
// Os três cartões da faixa "Recent projects" da home (entre as marcas projetos:inicio e projetos:fim)
const HOME_PROJECTS = ['parkland-club-residence', 'delray-1', 'camino-real-signature-house'];

function homeProjects() {
  const cards = HOME_PROJECTS.map((slug) => {
    const i = projects.findIndex((p) => p.slug === slug);
    if (i < 0) throw new Error('HOME_PROJECTS: não achei o projeto ' + slug);
    const p = projects[i];
    return `          <li class="work-card">
            <a href="/projects/${p.slug}/">
              <div class="work-card__img">${img(p.photos[0][0], p.photos[0][1], { sizes: '(max-width: 760px) 100vw, 440px' })}</div>
              <div class="work-card__cap">
                <span class="work-card__num">${pad(i + 1)}</span>
                <div class="work-card__text">
                  <h3 class="work-card__name">${esc(p.title)}</h3>
                  <span class="work-card__meta">${esc([projectMeta(p), photoCount(p.photos.length)].join(' · '))}</span>
                </div>
                <span class="work-card__go">View${arrow}</span>
              </div>
            </a>
          </li>`;
  }).join('\n');
  return `<ol class="work-grid work-grid--three">\n${cards}\n        </ol>`;
}

/* ------------------------------------------------------------ grava */
function write(rel, html) {
  const file = path.join(ROOT, rel, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log('  ' + path.join(rel, 'index.html'));
}

// Páginas de projeto que saíram do content.mjs não ficam para trás
const keep = new Set(projects.map((p) => p.slug));
for (const d of fs.existsSync(path.join(ROOT, 'projects')) ? fs.readdirSync(path.join(ROOT, 'projects')) : []) {
  if (fs.statSync(path.join(ROOT, 'projects', d)).isDirectory() && !keep.has(d)) fs.rmSync(path.join(ROOT, 'projects', d), { recursive: true });
}

write('projects', projectsPage());
projects.forEach((p, i) => write(path.join('projects', p.slug), projectPage(p, i)));
write('products', productsPage());
write('journal', journalPage());
journal.forEach((j) => write(j.slug, postPage(j)));
write('about-us', aboutPage());

const home = index.replace(/(<!-- projetos:inicio -->)[\s\S]*?(<!-- projetos:fim -->)/, `$1\n        ${homeProjects()}\n        $2`);
if (home === index && !index.includes('<!-- projetos:inicio -->')) throw new Error('index.html sem as marcas projetos:inicio/fim');
fs.writeFileSync(path.join(ROOT, 'index.html'), home);
console.log('  index.html (projetos recentes)');
