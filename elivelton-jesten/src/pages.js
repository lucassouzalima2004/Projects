// Monta o HTML das páginas públicas (início, carreiras, privacidade, termos e 404) em cada idioma.
import { STRINGS, LANGS, clientStrings } from './i18n.js';
import { icon } from './icons.js';

export const PAGES = ['home', 'careers', 'privacy', 'terms'];

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// *texto* vira destaque âmbar
const rich = (s) => esc(s).replace(/\*(.+?)\*/g, '<mark>$1</mark>');
// Troca {chave} por HTML já seguro, depois de escapar o resto do texto
const fill = (s, vars = {}) => esc(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
// < e os separadores de linha U+2028/U+2029 escapados para o JSON poder ficar dentro de <script>
const LINE_SEPARATORS = new RegExp(`[${String.fromCharCode(0x2028, 0x2029)}]`, 'g');
const json = (v) =>
  JSON.stringify(v)
    .replace(/</g, '\\u003c')
    .replace(LINE_SEPARATORS, (c) => `\\u${c.charCodeAt(0).toString(16)}`);

export function matchRoute(pathname) {
  for (const lang of LANGS) for (const page of PAGES) if (STRINGS[lang].routes[page] === pathname) return { lang, page };
  return null;
}

const telHref = (n) => `tel:${String(n).replace(/[^\d+]/g, '')}`;
const waHref = (n, text) => `https://wa.me/${String(n).replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
const countryName = (code, locale) => {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
};
const monthYear = (ym, locale) => {
  if (!ym) return '';
  const d = new Date(`${ym}-15T12:00:00Z`);
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
};
const longDate = (ts, locale) =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Lisbon' }).format(new Date(ts));

function picture(item, { sizes, alt, cls = '', eager = false }) {
  const set = [...(item.img || [])].sort((a, b) => a.w - b.w);
  if (!set.length) return '';
  const src = (set.find((x) => x.w >= 800) || set[set.length - 1]).u;
  const style = [item.focus ? `object-position:${item.focus}` : '', item.color ? `background-color:${item.color}` : ''].filter(Boolean).join(';');
  return `<img class="${cls}" src="${esc(src)}" srcset="${set.map((x) => `${esc(x.u)} ${x.w}w`).join(', ')}" sizes="${sizes}" alt="${esc(alt)}" width="${item.w}" height="${item.h}"${
    eager ? ' fetchpriority="high"' : ' loading="lazy"'
  } decoding="async"${style ? ` style="${style}"` : ''}>`;
}

const largest = (item) => [...(item.img || [])].sort((a, b) => b.w - a.w)[0]?.u || '';

// ---------- Moldura comum ----------

function logo(cls = '') {
  return `<svg class="logo ${cls}" viewBox="0 0 1526 420" role="img" aria-label="Jesten Construções"><use href="/assets/img/logo.svg#logo"/></svg>`;
}

function langLinks(ctx, cls) {
  return LANGS.map((l) => {
    const href = `${STRINGS[l].routes[ctx.page] || STRINGS[l].routes.home}?lang=${l}`;
    const current = l === ctx.lang ? ' aria-current="true"' : '';
    return `<a class="${cls}" href="${href}" hreflang="${STRINGS[l].locale}" lang="${STRINGS[l].locale}"${current} title="${esc(STRINGS[l].label)}">${l.toUpperCase()}</a>`;
  }).join('');
}

function navLinks(ctx) {
  const { s } = ctx;
  const home = s.routes.home;
  return [
    [`${home}#${s.anchors.services}`, s.nav.services],
    [`${home}#${s.anchors.works}`, s.nav.works],
    [`${home}#${s.anchors.method}`, s.nav.method],
    [`${home}#${s.anchors.company}`, s.nav.company],
    [s.routes.careers, s.nav.careers],
    [`${home}#${s.anchors.quote}`, s.nav.contact],
  ];
}

function header(ctx) {
  const { s, content } = ctx;
  const c = content.contacts;
  const phones = c.phones
    .map((p) => `<a href="${telHref(p.number)}"><span class="topbar__k">${esc(p.country)}</span> ${esc(p.number)}</a>`)
    .join('');
  const links = navLinks(ctx);
  return `
<div class="topbar">
  <div class="wrap topbar__in">
    <div class="topbar__group">${phones}${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ''}</div>
    <nav class="topbar__langs" aria-label="${esc(s.nav.languages)}">${langLinks(ctx, 'lang-link')}</nav>
  </div>
</div>
<header class="site-header" data-header>
  <div class="wrap site-header__in">
    <a class="brand" href="${s.routes.home}" aria-label="Jesten Construções, ${esc(s.nav.home)}">${logo()}</a>
    <nav class="nav" aria-label="${esc(s.nav.main)}">
      ${links.map(([href, label]) => `<a class="nav__link" href="${href}">${esc(label)}</a>`).join('')}
    </nav>
    <a class="btn btn--amber btn--sm header__cta" href="${s.routes.home}#${s.anchors.quote}">${esc(s.nav.quote)}${icon('arrow')}</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-open>
      <span class="menu-btn__label">${esc(s.nav.menu)}</span>${icon('menu')}
    </button>
  </div>
</header>
<div class="menu" id="menu" data-menu hidden>
  <div class="menu__top wrap">
    <a class="brand" href="${s.routes.home}" aria-label="Jesten Construções, ${esc(s.nav.home)}">${logo('logo--light')}</a>
    <button class="menu-btn menu-btn--close" type="button" data-menu-close><span class="menu-btn__label">${esc(s.nav.close)}</span>${icon('close')}</button>
  </div>
  <nav class="menu__nav wrap" aria-label="${esc(s.nav.main)}">
    ${links.map(([href, label], i) => `<a class="menu__link" href="${href}"><span class="menu__n">0${i + 1}</span>${esc(label)}</a>`).join('')}
  </nav>
  <div class="menu__foot wrap">
    <a class="btn btn--amber" href="${s.routes.home}#${s.anchors.quote}">${esc(s.nav.quote)}${icon('arrow')}</a>
    <div class="menu__langs">${langLinks(ctx, 'lang-link lang-link--light')}</div>
  </div>
</div>`;
}

function footer(ctx) {
  const { s, content, year } = ctx;
  const c = content.contacts;
  const co = content.company;
  const social = [
    ['instagram', c.instagram, 'Instagram'],
    ['facebook', c.facebook, 'Facebook'],
    ['linkedin', c.linkedin, 'LinkedIn'],
    ['whatsapp', c.whatsapp ? waHref(c.whatsapp, s.quote.whatsappText) : '', 'WhatsApp'],
  ].filter(([, href]) => href);
  return `
<footer class="site-footer">
  <div class="wrap footer__top">
    <div class="footer__brand">
      <a class="brand" href="${s.routes.home}" aria-label="Jesten Construções, ${esc(s.nav.home)}">${logo('logo--light')}</a>
      <p>${esc(s.footer.tagline)}</p>
    </div>
    <div class="footer__col">
      <h2 class="footer__h">${esc(s.footer.contacts)}</h2>
      <ul class="footer__list">
        ${c.email ? `<li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : ''}
        ${c.phones.map((p) => `<li><a href="${telHref(p.number)}">${esc(p.number)}</a> <span class="footer__muted">${esc(countryName(p.country, s.locale))}</span></li>`).join('')}
        <li><a href="${esc(c.maps || '#')}" target="_blank" rel="noopener">${esc(c.address)}<br>${esc(c.postal)}, ${esc(c.country)}</a></li>
      </ul>
    </div>
    <div class="footer__col">
      <h2 class="footer__h">${esc(s.footer.site)}</h2>
      <ul class="footer__list">${navLinks(ctx).map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>
    </div>
    <div class="footer__col">
      <h2 class="footer__h">${esc(s.footer.social)}</h2>
      <ul class="footer__list footer__social">
        ${social.map(([name, href, label]) => `<li><a href="${esc(href)}" target="_blank" rel="noopener">${icon(name)}${label}</a></li>`).join('')}
      </ul>
    </div>
  </div>
  <div class="wrap footer__bottom">
    <p>${fill(s.footer.rights, { year })}</p>
    <p>${esc(co.legal)} · NIF ${esc(co.nif)}${co.alvara ? ` · ${fill(s.footer.alvara, { n: esc(co.alvara) })}` : ''}</p>
    <nav class="footer__legal" aria-label="Legal">
      <a href="${s.routes.privacy}">${esc(s.footer.privacy)}</a>
      <a href="${s.routes.terms}">${esc(s.footer.terms)}</a>
      <a href="https://www.livroreclamacoes.pt/" target="_blank" rel="noopener">${esc(s.footer.complaints)}</a>
    </nav>
    <a class="footer__top-link" href="#top">${esc(s.nav.top)}${icon('down', 'icon--up')}</a>
  </div>
</footer>`;
}

function mobileBar(ctx) {
  const { s, content } = ctx;
  const wa = content.contacts.whatsapp;
  return `
<div class="mobile-bar" data-mobile-bar>
  ${wa ? `<a class="mobile-bar__wa" href="${esc(waHref(wa, s.quote.whatsappText))}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a>` : ''}
  <a class="mobile-bar__cta" href="${s.routes.home}#${s.anchors.quote}">${esc(s.nav.quote)}${icon('arrow')}</a>
</div>`;
}

function structuredData(ctx) {
  const { content, origin } = ctx;
  const c = content.contacts;
  const postal = /^(\d{4}-\d{3})\s*(.*)$/.exec(c.postal || '');
  return {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    '@id': `${origin}/#empresa`,
    name: 'Jesten Construções',
    legalName: content.company.legal,
    taxID: content.company.nif,
    url: `${origin}/`,
    logo: `${origin}/assets/img/apple-touch-icon.png`,
    image: `${origin}/assets/img/og-pt.jpg`,
    email: c.email || undefined,
    telephone: c.phones[0]?.number.replace(/\s+/g, '') || undefined,
    foundingDate: String(content.numbers.founded),
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.address,
      postalCode: postal ? postal[1] : c.postal,
      addressLocality: postal ? postal[2] : '',
      addressCountry: 'PT',
    },
    areaServed: [
      { '@type': 'Country', name: 'Portugal' },
      { '@type': 'Country', name: 'Spain' },
    ],
    sameAs: [c.instagram, c.facebook, c.linkedin].filter(Boolean),
  };
}

function layout(ctx, { meta, body, pageClass }) {
  const { s, origin, build, page, lang } = ctx;
  const path = s.routes[page] || ctx.path;
  const alternates =
    page in s.routes
      ? LANGS.map((l) => `<link rel="alternate" hreflang="${STRINGS[l].locale}" href="${origin}${STRINGS[l].routes[page]}">`).join('\n') +
        `\n<link rel="alternate" hreflang="x-default" href="${origin}${STRINGS.pt.routes[page]}">`
      : '';
  const ogImage = `${origin}/assets/img/og-${lang}.jpg`;
  return `<!doctype html>
<html lang="${s.locale}" id="top">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(meta.title)}</title>
${meta.description ? `<meta name="description" content="${esc(meta.description)}">` : ''}
${page in s.routes ? `<link rel="canonical" href="${origin}${path}">` : '<meta name="robots" content="noindex">'}
${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jesten Construções">
<meta property="og:title" content="${esc(meta.title)}">
${meta.description ? `<meta property="og:description" content="${esc(meta.description)}">` : ''}
<meta property="og:url" content="${origin}${path}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${s.og}">
${LANGS.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${STRINGS[l].og}">`).join('\n')}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f3f2ee">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="/assets/css/site.css?v=${build}">
<script src="/assets/js/site.js?v=${build}" defer></script>
${page === 'home' ? `<script type="application/ld+json">${json(structuredData(ctx))}</script>` : ''}
</head>
<body class="${pageClass}" data-lang="${lang}">
<a class="skip-link" href="#main">${esc(s.nav.skip)}</a>
${header(ctx)}
<main id="main">
${body}
</main>
${footer(ctx)}
${mobileBar(ctx)}
<script type="application/json" id="i18n">${json(clientStrings(lang))}</script>
</body>
</html>`;
}

// ---------- Partes da página inicial ----------

function kicker(n, label, cls = '') {
  return `<p class="kicker ${cls}"><span class="kicker__n">${n}</span><span class="kicker__label">${esc(label)}</span></p>`;
}

function heroMedia(ctx) {
  const { s, content } = ctx;
  const h = content.hero;
  const title = h.title?.[ctx.lang] || h.title?.pt || '';
  const caption = [title, h.place].filter(Boolean).map((x) => `<span>${esc(x)}</span>`).join('');
  let media;
  if (h.kind === 'video') {
    const style = [h.color ? `background-color:${h.color}` : '', h.focus ? `object-position:${h.focus}` : ''].filter(Boolean).join(';');
    media = `<video class="hero__video" data-hero-video autoplay muted loop playsinline preload="auto" poster="${esc(h.video.poster)}" width="${h.w}" height="${h.h}"${
      style ? ` style="${style}"` : ''
    } aria-label="${esc(title)}"><source src="${esc(h.video.u)}" type="video/mp4"></video>
      <button class="hero__toggle" type="button" data-hero-toggle aria-label="${esc(s.hero.pause)}">${icon('pause', 'icon--pause')}${icon('play', 'icon--play')}</button>`;
  } else {
    media = picture(h, { sizes: '(min-width: 1000px) 42vw, 100vw', alt: title, cls: 'hero__img', eager: true });
  }
  return `
    <figure class="hero__media">
      <div class="hero__frame">${media}<span class="hero__corner hero__corner--tl"></span><span class="hero__corner hero__corner--br"></span></div>
      <figcaption class="hero__caption"><span class="live"><i></i>${esc(s.hero.live)}</span>${caption}</figcaption>
    </figure>`;
}

function hero(ctx) {
  const { s, content } = ctx;
  const n = content.numbers;
  const facts = [
    [s.facts.clients, n.clients, '+'],
    [s.facts.professionals, n.professionals, '+'],
    [s.facts.ongoing, n.ongoing, ''],
    [s.facts.founded, n.founded, ''],
  ];
  return `
<section class="hero">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="hero__kicker"><span class="hero__kicker-rule"></span>${esc(s.hero.kicker)}</p>
      <h1 class="hero__title">${s.hero.title.map((line) => `<span class="line"><span class="line__in">${rich(line)}</span></span>`).join('')}</h1>
      <p class="hero__lead">${esc(s.hero.lead)}</p>
      <div class="hero__actions">
        <a class="btn btn--amber" href="#${s.anchors.quote}">${esc(s.hero.cta)}${icon('arrow')}</a>
        <a class="btn btn--line" href="#${s.anchors.works}">${esc(s.hero.cta2)}${icon('down')}</a>
      </div>
    </div>
    ${heroMedia(ctx)}
  </div>
  <div class="wrap">
    <dl class="facts">
      ${facts
        .map(
          ([label, value, suffix]) =>
            `<div class="facts__item"><dt>${esc(label)}</dt><dd>${esc(value)}${suffix ? `<span class="facts__plus">${suffix}</span>` : ''}</dd></div>`,
        )
        .join('')}
    </dl>
  </div>
</section>`;
}

function services(ctx) {
  const { s } = ctx;
  return `
<section class="section services" id="${s.anchors.services}">
  <div class="wrap">
    <header class="section-head" data-reveal>
      ${kicker('01', s.services.kicker)}
      <h2 class="section-title">${rich(s.services.title)}</h2>
      <p class="section-intro">${esc(s.services.intro)}</p>
    </header>
    <ol class="services__list">
      ${s.services.items
        .map(
          (it, i) => `
      <li class="service" data-reveal>
        <span class="service__n">0${i + 1}</span>
        <h3 class="service__title">${esc(it.title)}</h3>
        <div class="service__body">
          <p>${esc(it.text)}</p>
          <ul class="tags">${it.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        </div>
      </li>`,
        )
        .join('')}
    </ol>
  </div>
</section>`;
}

function band(ctx) {
  const item = ctx.content.works.find((w) => w.id === 'fundacoes-grua') || ctx.defaults.works.find((w) => w.id === 'fundacoes-grua');
  if (!item?.img) return '';
  return `
<figure class="band" data-reveal>
  ${picture({ ...item, focus: '50% 62%' }, { sizes: '100vw', alt: ctx.s.band, cls: 'band__img' })}
  <figcaption class="wrap band__caption"><span>${esc(ctx.s.band)}</span></figcaption>
</figure>`;
}

function workMeta(ctx, w) {
  const { s } = ctx;
  return [s.works.categories[w.category] || '', w.place, monthYear(w.date, s.locale)].filter(Boolean);
}

function works(ctx) {
  const { s, content, lang } = ctx;
  const list = content.works.filter((w) => w.visible !== false);
  if (!list.length) return '';
  const data = list.map((w) => ({
    kind: w.kind,
    src: w.kind === 'video' ? w.video.u : largest(w),
    poster: w.kind === 'video' ? w.video.poster : undefined,
    srcset: w.kind === 'image' ? w.img.map((x) => `${x.u} ${x.w}w`).join(', ') : undefined,
    w: w.w,
    h: w.h,
    title: w.title?.[lang] || w.title?.pt || s.works.categories[w.category] || '',
    meta: workMeta(ctx, w).join(' · '),
    status: w.status ? s.works.status[w.status] : '',
  }));
  const updated = content.updated ? `<p class="works__updated"><span class="live"><i></i>${fill(s.works.updated, { date: esc(longDate(content.updated, s.locale)) })}</span></p>` : '';
  const tiles = list
    .map((w, i) => {
      // Obra enviada sem título ainda: mostra o tipo (Estrutura, Obra nova…)
      const title = w.title?.[lang] || w.title?.pt || s.works.categories[w.category] || '';
      const meta = workMeta(ctx, w);
      const featured = i === 0;
      const sizes = featured ? '(min-width: 1100px) 50vw, (min-width: 700px) 66vw, 100vw' : '(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw';
      const media =
        w.kind === 'video'
          ? `<video class="work__video" muted loop playsinline preload="none" poster="${esc(w.video.poster)}" data-src="${esc(w.video.u)}" width="${w.w}" height="${w.h}"${
              w.focus ? ` style="object-position:${w.focus}"` : ''
            } aria-hidden="true"></video><span class="work__badge">${icon('play')}${esc(s.works.video)}</span>`
          : picture(w, { sizes, alt: title, cls: 'work__img' });
      return `
      <li class="work${featured ? ' work--featured' : ''}${i >= 9 ? ' work--extra' : ''}" data-reveal>
        <a class="work__open" href="${esc(w.kind === 'video' ? w.video.u : largest(w))}" data-work="${i}" aria-label="${esc(`${s.works.open}: ${title}`)}">
          <span class="work__media"${w.color ? ` style="background-color:${w.color}"` : ''}>${media}${
            w.status ? `<span class="work__status${w.status === 'ongoing' ? ' work__status--live' : ''}">${esc(s.works.status[w.status])}</span>` : ''
          }</span>
        </a>
        <div class="work__text">
          <h3 class="work__title">${esc(title)}</h3>
          ${meta.length ? `<p class="work__meta">${meta.map((m) => `<span>${esc(m)}</span>`).join('')}</p>` : ''}
        </div>
      </li>`;
    })
    .join('');
  return `
<section class="section works" id="${s.anchors.works}">
  <div class="wrap">
    <header class="section-head section-head--split" data-reveal>
      <div>
        ${kicker('02', s.works.kicker)}
        <h2 class="section-title">${rich(s.works.title)}</h2>
      </div>
      <div class="section-head__aside">
        <p class="section-intro">${esc(s.works.intro)}</p>
        ${updated}
      </div>
    </header>
    <ul class="works__grid" data-works>${tiles}
    </ul>
    ${
      list.length > 9
        ? `<div class="works__more"><button class="btn btn--line" type="button" data-works-more aria-expanded="false" data-more="${esc(s.works.more)}" data-less="${esc(s.works.less)}"><span>${esc(
            s.works.more,
          )}</span>${icon('plus')}</button></div>`
        : ''
    }
  </div>
  <script type="application/json" id="works-data">${json(data)}</script>
</section>
<dialog class="lightbox" data-lightbox aria-label="${esc(s.works.kicker)}">
  <div class="lightbox__stage" data-stage></div>
  <div class="lightbox__bar">
    <div class="lightbox__text"><p class="lightbox__title" data-title></p><p class="lightbox__meta" data-meta></p></div>
    <p class="lightbox__count" data-count></p>
    <div class="lightbox__nav">
      <button class="lightbox__btn" type="button" data-prev aria-label="${esc(s.works.prev)}">${icon('prev')}</button>
      <button class="lightbox__btn" type="button" data-next aria-label="${esc(s.works.next)}">${icon('next')}</button>
      <button class="lightbox__btn lightbox__btn--close" type="button" data-close aria-label="${esc(s.works.close)}">${icon('close')}</button>
    </div>
  </div>
</dialog>`;
}

function method(ctx) {
  const { s } = ctx;
  // Posição de cada etapa no cronograma (em 12 colunas)
  const spans = [
    [0, 2.5],
    [2, 4.5],
    [4, 11],
    [10.5, 12],
  ];
  return `
<section class="section method" id="${s.anchors.method}">
  <div class="wrap">
    <header class="section-head" data-reveal>
      ${kicker('03', s.method.kicker)}
      <h2 class="section-title">${rich(s.method.title)}</h2>
    </header>
    <div class="gantt" data-gantt>
      <div class="gantt__scale" aria-hidden="true"><span>${esc(s.method.start)}</span><span>${esc(s.method.end)}</span></div>
      <ol class="gantt__rows">
        ${s.method.steps
          .map(
            (st, i) => `
        <li class="gantt__row" style="--from:${spans[i][0]};--to:${spans[i][1]};--i:${i}">
          <div class="gantt__label"><span class="gantt__n">0${i + 1}</span><h3>${esc(st.title)}</h3><p>${esc(st.text)}</p></div>
          <div class="gantt__track" aria-hidden="true"><span class="gantt__bar"></span></div>
        </li>`,
          )
          .join('')}
      </ol>
    </div>
  </div>
</section>`;
}

function about(ctx) {
  const { s, content } = ctx;
  const photo = ctx.defaults.works.find((w) => w.id === 'armadura-fundacao');
  return `
<section class="section about" id="${s.anchors.company}">
  <div class="wrap about__grid">
    <header class="about__head" data-reveal>
      ${kicker('04', s.about.kicker, 'kicker--light')}
      <h2 class="section-title">${rich(s.about.title)}</h2>
    </header>
    <div class="about__text" data-reveal>${s.about.text.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    <figure class="about__photo" data-reveal>
      ${picture({ ...photo, focus: '55% 45%' }, { sizes: '(min-width: 1000px) 45vw, 100vw', alt: s.about.photo, cls: 'about__img' })}
      <figcaption>${esc(s.about.photo)}</figcaption>
    </figure>
    <ul class="values">
      ${s.about.values.map((v, i) => `<li class="value" data-reveal><span class="value__n">0${i + 1}</span><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></li>`).join('')}
    </ul>
    <p class="about__legal">${esc(content.company.legal)} · NIF ${esc(content.company.nif)} · ${esc(content.contacts.postal)}</p>
  </div>
</section>`;
}

function hiring(ctx) {
  const { s, content } = ctx;
  if (!content.hiring) return '';
  return `
<section class="hiring">
  <div class="wrap hiring__in" data-reveal>
    <p class="hiring__kicker">${esc(s.hiring.kicker)}</p>
    <h2 class="hiring__title">${esc(s.hiring.title)}</h2>
    <p class="hiring__text">${esc(s.hiring.text)}</p>
    <a class="btn btn--ink" href="${s.routes.careers}">${esc(s.hiring.cta)}${icon('arrow')}</a>
  </div>
</section>`;
}

function channels(ctx) {
  const { s, content } = ctx;
  const c = content.contacts;
  const ch = s.quote.channels;
  const rows = [];
  if (c.email) rows.push(['mail', `mailto:${c.email}`, ch.email, c.email, false]);
  if (c.whatsapp) rows.push(['whatsapp', waHref(c.whatsapp, s.quote.whatsappText), ch.whatsapp, `+${c.whatsapp.replace(/^(\d{3})(\d{3})(\d{3})(\d+)$/, '$1 $2 $3 $4')}`, true]);
  for (const p of c.phones) rows.push(['phone', telHref(p.number), fill(ch.phone, { country: esc(countryName(p.country, s.locale)) }), p.number, false, true]);
  if (c.instagram) rows.push(['instagram', c.instagram, ch.instagram, '@' + (c.instagram.replace(/\/+$/, '').split('/').pop() || ''), true]);
  if (c.facebook) rows.push(['facebook', c.facebook, ch.facebook, c.facebook.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, ''), true]);
  if (c.linkedin) rows.push(['linkedin', c.linkedin, ch.linkedin, c.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, ''), true]);
  rows.push(['pin', c.maps, ch.address, `${c.address}, ${c.postal}`, true]);
  return `<ul class="channels">${rows
    .map(
      ([ic, href, label, value, external, labelIsHtml]) => `
      <li><a class="channel" href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>
        <span class="channel__icon">${icon(ic)}</span>
        <span class="channel__label">${labelIsHtml ? label : esc(label)}</span>
        <span class="channel__value">${esc(value)}</span>
        ${icon(external ? 'out' : 'arrow', 'channel__go')}
      </a></li>`,
    )
    .join('')}</ul>`;
}

function field({ id, name, label, type = 'text', required = false, optional, attrs = '', hint = '', full = false, s }) {
  const opt = required ? '' : `<span class="field__opt">(${esc(optional || s.form.optional)})</span>`;
  const input =
    type === 'textarea'
      ? `<textarea id="${id}" name="${name}" rows="5"${required ? ' required' : ''} ${attrs}></textarea>`
      : `<input id="${id}" name="${name}" type="${type}"${required ? ' required' : ''} ${attrs}>`;
  return `<div class="field${full ? ' field--full' : ''}"><label class="field__label" for="${id}">${esc(label)} ${opt}</label>${input}${
    hint ? `<p class="field__hint">${esc(hint)}</p>` : ''
  }<p class="field__error" data-error-for="${name}"></p></div>`;
}

function select({ id, name, label, options, required = false, s, full = false }) {
  const opt = required ? '' : `<span class="field__opt">(${esc(s.form.optional)})</span>`;
  return `<div class="field${full ? ' field--full' : ''}"><label class="field__label" for="${id}">${esc(label)} ${opt}</label><div class="select"><select id="${id}" name="${name}"${
    required ? ' required' : ''
  }><option value="">${esc(s.form.select)}</option>${options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select></div><p class="field__error" data-error-for="${name}"></p></div>`;
}

function fileField({ id, name, label, hint, accept, s }) {
  return `<div class="field field--full field--file"><span class="field__label" id="${id}-label">${esc(label)} <span class="field__opt">(${esc(s.form.optional)})</span></span>
    <label class="file" for="${id}"><input id="${id}" name="${name}" type="file" accept="${accept}" aria-labelledby="${id}-label"><span class="file__btn">${icon('clip')}${esc(
      s.form.choose,
    )}</span><span class="file__name" data-file-name>${esc(s.form.none)}</span></label>
    <button class="file__clear" type="button" data-file-clear hidden aria-label="${esc(s.form.remove)}">${icon('close')}</button>
    <p class="field__hint">${esc(hint)}</p><p class="field__error" data-error-for="${name}"></p></div>`;
}

function consent(id, text, s) {
  const link = `<a href="${s.routes.privacy}" target="_blank">${esc(s.form.privacy)}</a>`;
  return `<div class="field field--full field--check"><label class="check" for="${id}"><input id="${id}" name="consent" type="checkbox" value="1" required><span class="check__box">${icon(
    'check',
  )}</span><span class="check__text">${fill(text, { privacy: link })}</span></label><p class="field__error" data-error-for="consent"></p></div>`;
}

function formHidden(ctx, kind) {
  return `<input type="hidden" name="lang" value="${ctx.lang}"><input type="hidden" name="kind" value="${kind}"><input type="hidden" name="t" value="${Date.now()}">
  <div class="hp" aria-hidden="true"><label>Website <input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>`;
}

function quote(ctx) {
  const { s } = ctx;
  const f = s.quote.form;
  const sent = ctx.sent === 'quote';
  return `
<section class="section quote" id="${s.anchors.quote}">
  <div class="wrap quote__grid">
    <div class="quote__intro">
      <header class="section-head" data-reveal>
        ${kicker('05', s.quote.kicker)}
        <h2 class="section-title">${rich(s.quote.title)}</h2>
        <p class="section-intro">${esc(s.quote.lead)}</p>
      </header>
      <h3 class="quote__direct">${esc(s.quote.direct)}</h3>
      ${channels(ctx)}
    </div>
    <div class="quote__panel" data-reveal>
      <form class="form" data-form="quote" action="/api/quote" method="post" enctype="multipart/form-data" novalidate data-max-mb="10"${sent ? ' hidden' : ''}>
        <h3 class="form__title">${esc(f.title)}</h3>
        ${formHidden(ctx, 'quote')}
        <div class="form__grid">
          ${field({ id: 'q-name', name: 'name', label: f.name, required: true, attrs: 'autocomplete="name" maxlength="120"', s })}
          ${field({ id: 'q-company', name: 'company', label: f.company, attrs: 'autocomplete="organization" maxlength="120"', s })}
          ${field({ id: 'q-email', name: 'email', label: f.email, type: 'email', required: true, attrs: 'autocomplete="email" maxlength="200" inputmode="email"', s })}
          ${field({ id: 'q-phone', name: 'phone', label: f.phone, type: 'tel', attrs: 'autocomplete="tel" maxlength="40"', s })}
          ${select({ id: 'q-type', name: 'type', label: f.type, required: true, options: Object.entries(f.types), s })}
          ${field({ id: 'q-location', name: 'location', label: f.location, attrs: `maxlength="120" placeholder="${esc(f.locationHint)}"`, s })}
          ${select({ id: 'q-start', name: 'start', label: f.start, options: Object.entries(f.starts), s, full: true })}
          ${field({ id: 'q-message', name: 'message', label: f.message, type: 'textarea', required: true, full: true, attrs: `maxlength="4000" placeholder="${esc(f.messageHint)}"`, s })}
          ${fileField({ id: 'q-file', name: 'file', label: f.file, hint: f.fileHint, accept: '.pdf,application/pdf,image/jpeg,image/png,image/webp,image/heic,.heic', s })}
          ${consent('q-consent', f.consent, s)}
        </div>
        <div class="form__foot">
          <button class="btn btn--amber btn--wide" type="submit" data-submit>${esc(f.submit)}${icon('arrow')}</button>
          <p class="form__status" data-status role="status" aria-live="polite"></p>
        </div>
      </form>
      ${done(ctx, 'quote', f, sent)}
    </div>
  </div>
</section>`;
}

function done(ctx, kind, f, visible) {
  const { s, content } = ctx;
  const wa = content.contacts.whatsapp;
  return `<div class="form-done" data-done="${kind}"${visible ? '' : ' hidden'} tabindex="-1">
        <span class="form-done__icon">${icon('check')}</span>
        <h3 class="form-done__title">${esc(f.successTitle)}</h3>
        <p class="form-done__text" data-done-text data-template="${esc(f.successText)}">${esc(f.successText.replace(/,? ?\{name\}/, ''))}</p>
        ${kind === 'quote' && wa ? `<p class="form-done__wa"><a class="btn btn--line" href="${esc(waHref(wa, s.quote.whatsappText))}" target="_blank" rel="noopener">${icon('whatsapp')}${esc(f.successWhatsapp)}</a></p>` : ''}
        <p><button class="link-btn" type="button" data-again>${esc(f.another)}</button></p>
      </div>`;
}

export function homePage(ctx) {
  return layout(ctx, {
    meta: ctx.s.meta.home,
    pageClass: 'page-home',
    body: [hero(ctx), services(ctx), band(ctx), works(ctx), method(ctx), about(ctx), hiring(ctx), quote(ctx)].join('\n'),
  });
}

// ---------- Carreiras ----------

export function careersPage(ctx) {
  const { s } = ctx;
  const c = s.careers;
  const f = c.form;
  const photo = ctx.defaults.works.find((w) => w.id === 'escoras-estaleiro');
  const sent = ctx.sent === 'job';
  const body = `
<section class="page-hero careers-hero">
  <div class="wrap page-hero__grid">
    <div>
      <p class="hero__kicker"><span class="hero__kicker-rule"></span>${esc(c.kicker)}</p>
      <h1 class="page-title">${c.title.map((line) => `<span class="line"><span class="line__in">${rich(line)}</span></span>`).join('')}</h1>
      <p class="hero__lead">${esc(c.lead)}</p>
      <a class="btn btn--amber" href="#candidatura">${esc(f.submit)}${icon('down')}</a>
    </div>
    <figure class="page-hero__photo">${picture({ ...photo, focus: '45% 40%' }, { sizes: '(min-width: 1000px) 40vw, 100vw', alt: c.kicker, cls: 'page-hero__img', eager: true })}</figure>
  </div>
</section>
<section class="section roles">
  <div class="wrap roles__grid">
    <div>
      <h2 class="roles__title">${esc(c.rolesTitle)}</h2>
      <ol class="roles__list">${c.roles.map((r, i) => `<li class="role" data-reveal><span class="role__n">0${i + 1}</span><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></li>`).join('')}</ol>
    </div>
    <aside class="offer" data-reveal>
      <h2 class="offer__title">${esc(c.offerTitle)}</h2>
      <ul class="offer__list">${c.offer.map((o) => `<li>${icon('check')}<span>${esc(o)}</span></li>`).join('')}</ul>
    </aside>
  </div>
</section>
<section class="section apply" id="candidatura">
  <div class="wrap apply__grid">
    <header class="section-head">
      <p class="hero__kicker"><span class="hero__kicker-rule"></span>${esc(f.title)}</p>
      <h2 class="section-title">${rich(c.applyTitle)}</h2>
    </header>
    <div class="quote__panel">
      <form class="form" data-form="job" action="/api/job" method="post" enctype="multipart/form-data" novalidate data-max-mb="5"${sent ? ' hidden' : ''}>
        ${formHidden(ctx, 'job')}
        <div class="form__grid">
          ${field({ id: 'j-name', name: 'name', label: f.name, required: true, attrs: 'autocomplete="name" maxlength="120"', s })}
          ${field({ id: 'j-phone', name: 'phone', label: f.phone, type: 'tel', required: true, attrs: 'autocomplete="tel" maxlength="40"', s })}
          ${field({ id: 'j-email', name: 'email', label: f.email, type: 'email', attrs: 'autocomplete="email" maxlength="200" inputmode="email"', s })}
          ${field({ id: 'j-location', name: 'location', label: f.location, required: true, attrs: `maxlength="120" placeholder="${esc(f.locationHint)}"`, s })}
          ${select({ id: 'j-role', name: 'role', label: f.role, required: true, options: [...c.roles.map((r) => [r.id, r.title]), ['outro', f.other]], s })}
          ${select({ id: 'j-experience', name: 'experience', label: f.experience, options: Object.entries(f.experiences), s })}
          <div class="field field--full" data-other-role hidden><label class="field__label" for="j-other">${esc(f.otherLabel)}</label><input id="j-other" name="roleOther" type="text" maxlength="80"><p class="field__error" data-error-for="roleOther"></p></div>
          <fieldset class="field field--full field--choices"><legend class="field__label">${esc(f.where)}</legend>
            <label class="check check--inline"><input type="checkbox" name="where" value="PT"><span class="check__box">${icon('check')}</span><span class="check__text">${esc(countryName('PT', s.locale))}</span></label>
            <label class="check check--inline"><input type="checkbox" name="where" value="ES"><span class="check__box">${icon('check')}</span><span class="check__text">${esc(countryName('ES', s.locale))}</span></label>
          </fieldset>
          ${field({ id: 'j-message', name: 'message', label: f.message, type: 'textarea', full: true, attrs: `maxlength="3000" placeholder="${esc(f.messageHint)}"`, s })}
          ${fileField({ id: 'j-cv', name: 'file', label: f.cv, hint: f.cvHint, accept: '.pdf,application/pdf', s })}
          ${consent('j-consent', f.consent, s)}
        </div>
        <div class="form__foot">
          <button class="btn btn--amber btn--wide" type="submit" data-submit>${esc(f.submit)}${icon('arrow')}</button>
          <p class="form__status" data-status role="status" aria-live="polite"></p>
        </div>
      </form>
      ${done(ctx, 'job', f, sent)}
    </div>
  </div>
</section>`;
  return layout(ctx, { meta: s.meta.careers, pageClass: 'page-careers', body });
}

// ---------- Páginas legais e 404 ----------

export function legalPage(ctx, which) {
  const { s, content } = ctx;
  const doc = s.legal[which];
  const email = content.contacts.email ? `<a href="mailto:${esc(content.contacts.email)}">${esc(content.contacts.email)}</a>` : 'geral@jesten.pt';
  const link = (text) =>
    text.replace(/www\.(livroreclamacoes\.pt|consumidor\.gov\.pt|cnpd\.pt|aepd\.es)/g, (m) => `<a href="https://${m}/" target="_blank" rel="noopener">${m}</a>`);
  const body = `
<article class="legal">
  <div class="wrap legal__grid">
    <header class="legal__head">
      <p class="hero__kicker"><span class="hero__kicker-rule"></span>${esc(s.legal.updated)}</p>
      <h1 class="page-title page-title--sm">${esc(doc.title)}</h1>
      <p class="legal__intro">${esc(doc.intro)}</p>
    </header>
    <ol class="legal__sections">
      ${doc.sections.map(([h, p], i) => `<li class="legal__section"><h2><span class="legal__n">${String(i + 1).padStart(2, '0')}</span>${esc(h)}</h2><p>${link(fill(p, { email }))}</p></li>`).join('')}
    </ol>
  </div>
</article>`;
  return layout(ctx, { meta: s.meta[which], pageClass: 'page-legal', body });
}

export function notFoundPage(ctx) {
  const { s } = ctx;
  const body = `
<section class="not-found">
  <div class="wrap">
    <p class="not-found__code" aria-hidden="true">404</p>
    <h1 class="page-title page-title--sm">${esc(s.notFound.title)}</h1>
    <p class="hero__lead">${esc(s.notFound.text)}</p>
    <a class="btn btn--amber" href="${s.routes.home}">${esc(s.notFound.cta)}${icon('arrow')}</a>
  </div>
</section>`;
  return layout({ ...ctx, page: 'notFound' }, { meta: s.meta.notFound, pageClass: 'page-404', body });
}
