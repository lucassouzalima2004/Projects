// Monta o HTML das páginas públicas (início, carreiras, privacidade, termos e 404) em cada idioma.
import { STRINGS, LANGS, clientStrings } from './i18n.js';
import { icon } from './icons.js';

export const PAGES = ['home', 'careers', 'privacy', 'terms'];

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Título dividido em palavras, para entrarem uma a uma por baixo de uma máscara (o *destaque* continua âmbar)
function words(s) {
  const out = [];
  let mark = false;
  let word = '';
  const flush = () => {
    if (word) out.push(word);
    word = '';
  };
  for (const part of String(s ?? '').split(/(\*)/)) {
    if (part === '*') {
      mark = !mark;
      continue;
    }
    // Só o espaço normal separa palavras: o espaço fixo do francês (« ? », « : ») fica colado
    for (const piece of part.split(/([ \t\r\n]+)/)) {
      if (/^[ \t\r\n]+$/.test(piece)) flush();
      else if (piece) word += mark ? `<mark>${esc(piece)}</mark>` : esc(piece);
    }
  }
  flush();
  return out.map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`).join(' ');
}
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
const regionCodes = (c) => [...new Set([...(c.emails || []).map((e) => e.country), ...c.phones.map((p) => p.country)])];
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

function picture(item, { sizes, alt, cls = '', eager = false, attrs = '' }) {
  const set = [...(item?.img || [])].sort((a, b) => a.w - b.w);
  if (!set.length) return '';
  const src = (set.find((x) => x.w >= 800) || set[set.length - 1]).u;
  const style = [item.focus ? `object-position:${item.focus}` : '', item.color ? `background-color:${item.color}` : ''].filter(Boolean).join(';');
  return `<img class="${cls}" src="${esc(src)}" srcset="${set.map((x) => `${esc(x.u)} ${x.w}w`).join(', ')}" sizes="${sizes}" alt="${esc(alt)}" width="${item.w}" height="${item.h}"${
    eager ? ' fetchpriority="high"' : ' loading="lazy"'
  } decoding="async"${style ? ` style="${style}"` : ''}${attrs ? ` ${attrs}` : ''}>`;
}

const largest = (item) => [...(item.img || [])].sort((a, b) => b.w - a.w)[0]?.u || '';
const titleOf = (ctx, w) => w.title?.[ctx.lang] || w.title?.pt || ctx.s.works.categories[w.category] || '';
const findWork = (ctx, id) => ctx.defaults.works.find((w) => w.id === id);

const SERVICE_ICONS = ['structure', 'crane', 'building', 'roller'];
const VALUE_ICONS = ['shield', 'square', 'clock'];

// ---------- Moldura comum ----------

function logo(cls = '') {
  return `<svg class="logo ${cls}" viewBox="0 0 1526 420" role="img" aria-label="Jesten Construções"><use href="/assets/img/logo.svg#logo"/></svg>`;
}

const langHref = (ctx, l) => `${STRINGS[l].routes[ctx.page] || STRINGS[l].routes.home}?lang=${l}`;

function navLinks(ctx) {
  const { s } = ctx;
  const home = s.routes.home;
  return [
    [`${home}#${s.anchors.services}`, s.nav.services],
    [`${home}#${s.anchors.works}`, s.nav.works],
    [`${home}#${s.anchors.company}`, s.nav.company],
    [s.routes.careers, s.nav.careers],
    [`${home}#${s.anchors.quote}`, s.nav.contact],
  ];
}

function footerLinks(ctx) {
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

function langMenu(ctx) {
  const { s, lang } = ctx;
  return `<details class="lang" data-lang-menu>
        <summary class="lang__btn" aria-label="${esc(s.nav.languages)}">${icon('globe')}<span>${lang.toUpperCase()}</span>${icon('chevron', 'lang__chev')}</summary>
        <ul class="lang__list">${LANGS.map(
          (l) =>
            `<li><a class="lang-link" href="${langHref(ctx, l)}" hreflang="${STRINGS[l].locale}" lang="${STRINGS[l].locale}"${l === lang ? ' aria-current="true"' : ''}><span>${esc(
              STRINGS[l].label,
            )}</span><b>${l.toUpperCase()}</b></a></li>`,
        ).join('')}</ul>
      </details>`;
}

function header(ctx, overlay) {
  const { s, content } = ctx;
  const links = navLinks(ctx);
  const quoteHref = `${s.routes.home}#${s.anchors.quote}`;
  const c = content.contacts;
  return `
<header class="hdr${overlay ? ' hdr--overlay' : ' is-solid'}" data-header>
  <div class="wrap hdr__in">
    <a class="brand" href="${s.routes.home}" aria-label="Jesten Construções, ${esc(s.nav.home)}">${logo()}</a>
    <nav class="hdr__nav" aria-label="${esc(s.nav.main)}">
      ${links.map(([href, label]) => `<a class="hdr__link" href="${href}"${href === s.routes[ctx.page] ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('')}
    </nav>
    <div class="hdr__tools">
      ${langMenu(ctx)}
      <a class="btn btn--primary btn--sm hdr__cta" href="${quoteHref}">${esc(s.nav.quote)}</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="${esc(s.nav.menu)}" data-menu-open><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="menu" id="menu" data-menu hidden>
  <div class="menu__panel" role="dialog" aria-modal="true" aria-label="${esc(s.nav.menu)}">
    <div class="menu__top">
      <a class="brand" href="${s.routes.home}" aria-label="Jesten Construções, ${esc(s.nav.home)}">${logo()}</a>
      <button class="menu__close" type="button" aria-label="${esc(s.nav.close)}" data-menu-close>${icon('close')}</button>
    </div>
    <nav class="menu__nav" aria-label="${esc(s.nav.main)}">
      ${footerLinks(ctx).map(([href, label], i) => `<a class="menu__link" href="${href}" style="--i:${i}">${esc(label)}${icon('arrow')}</a>`).join('')}
    </nav>
    <div class="menu__foot">
      <a class="btn btn--primary btn--lg btn--block" href="${quoteHref}">${esc(s.nav.quote)}${icon('arrow')}</a>
      <div class="menu__langs">${LANGS.map(
        (l) => `<a class="chip-link lang-link" href="${langHref(ctx, l)}" hreflang="${STRINGS[l].locale}"${l === ctx.lang ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`,
      ).join('')}</div>
      <p class="menu__contacts">${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ''}${
        c.phones[0] ? `<a href="${telHref(c.phones[0].number)}">${esc(c.phones[0].number)}</a>` : ''
      }</p>
    </div>
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
<footer class="ftr">
  <div class="wrap ftr__top">
    <div class="ftr__brand" data-reveal>
      <a class="brand" href="${s.routes.home}" aria-label="Jesten Construções, ${esc(s.nav.home)}">${logo('logo--light')}</a>
      <p>${esc(s.footer.tagline)}</p>
      <div class="ftr__social">${social.map(([name, href, label]) => `<a class="social" href="${esc(href)}" target="_blank" rel="noopener" aria-label="${label}">${icon(name)}</a>`).join('')}</div>
    </div>
    <div class="ftr__col" data-reveal>
      <h2 class="ftr__h">${esc(s.footer.contacts)}</h2>
      <ul class="ftr__list">
        ${c.email ? `<li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : ''}
        ${regionCodes(c)
          .map(
            (code) => `<li class="ftr__region"><span class="ftr__muted">${esc(countryName(code, s.locale))}</span>${[
              ...(c.emails || []).filter((e) => e.country === code).map((e) => `<a href="mailto:${esc(e.email)}">${esc(e.email)}</a>`),
              ...c.phones.filter((p) => p.country === code).map((p) => `<a href="${telHref(p.number)}">${esc(p.number)}</a>`),
            ].join('')}</li>`,
          )
          .join('')}
        <li><a href="${esc(c.maps || '#')}" target="_blank" rel="noopener">${esc(c.address)}<br>${esc(c.postal)}, ${esc(c.country)}</a></li>
      </ul>
    </div>
    <div class="ftr__col" data-reveal>
      <h2 class="ftr__h">${esc(s.footer.site)}</h2>
      <ul class="ftr__list">${footerLinks(ctx).map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>
    </div>
    <div class="ftr__col" data-reveal>
      <h2 class="ftr__h">${esc(s.nav.company)}</h2>
      <ul class="ftr__list">
        <li>${esc(co.legal)}</li>
        <li>NIF ${esc(co.nif)}</li>
        ${co.alvara ? `<li>${fill(s.footer.alvara, { n: esc(co.alvara) })}</li>` : ''}
        <li><a href="${s.routes.privacy}">${esc(s.footer.privacy)}</a></li>
        <li><a href="${s.routes.terms}">${esc(s.footer.terms)}</a></li>
        <li><a href="https://www.livroreclamacoes.pt/" target="_blank" rel="noopener">${esc(s.footer.complaints)}</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap ftr__bottom">
    <p>${fill(s.footer.rights, { year })}</p>
    <a class="ftr__up" href="#top">${esc(s.nav.top)}<span>${icon('down', 'icon--up')}</span></a>
  </div>
</footer>`;
}

// Nas carreiras a barra leva à candidatura em vez do orçamento
function mobileBar(ctx) {
  const { s, content } = ctx;
  const wa = content.contacts.whatsapp;
  const jobs = ctx.page === 'careers';
  const text = jobs ? s.careers.whatsappText : s.quote.whatsappText;
  const [href, label] = jobs ? ['#candidatura', s.careers.form.submit] : [`${s.routes.home}#${s.anchors.quote}`, s.nav.quote];
  return `
<div class="mobile-bar" data-mobile-bar>
  ${wa ? `<a class="mobile-bar__wa" href="${esc(waHref(wa, text))}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('whatsapp')}</a>` : ''}
  <a class="btn btn--primary mobile-bar__cta" href="${href}">${esc(label)}${icon('arrow')}</a>
</div>`;
}

function waFloat(ctx) {
  const { s, content } = ctx;
  const wa = content.contacts.whatsapp;
  if (!wa) return '';
  const text = ctx.page === 'careers' ? s.careers.whatsappText : s.quote.whatsappText;
  return `
<a class="wa-float" href="${esc(waHref(wa, text))}" target="_blank" rel="noopener" aria-label="${esc(s.nav.whatsapp)}" data-wa-float>${icon('whatsapp')}<span class="wa-float__tip" aria-hidden="true">${esc(
    s.nav.whatsapp,
  )}</span></a>`;
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
    contactPoint: regionCodes(c).map((code) => ({
      '@type': 'ContactPoint',
      contactType: 'sales',
      areaServed: code,
      email: (c.emails || []).find((e) => e.country === code)?.email,
      telephone: c.phones.find((p) => p.country === code)?.number.replace(/\s+/g, ''),
    })),
    sameAs: [c.instagram, c.facebook, c.linkedin].filter(Boolean),
  };
}

function layout(ctx, { meta, body, pageClass, overlay = false }) {
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
<meta name="theme-color" content="#0e0f11">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/montserrat.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="/assets/css/site.css?v=${build}">
<script src="/assets/js/site.js?v=${build}" defer></script>
${page === 'home' ? `<script type="application/ld+json">${json(structuredData(ctx))}</script>` : ''}
</head>
<body class="${pageClass}" data-lang="${lang}">
<a class="skip-link" href="#main">${esc(s.nav.skip)}</a>
<div class="progress" aria-hidden="true"><i data-progress></i></div>
${header(ctx, overlay)}
<main id="main">
${body}
</main>
${footer(ctx)}
${mobileBar(ctx)}
${waFloat(ctx)}
<script type="application/json" id="i18n">${json(clientStrings(lang))}</script>
</body>
</html>`;
}

// ---------- Partes da página inicial ----------

function eyebrow(label, cls = '') {
  return `<p class="eyebrow ${cls}">${esc(label)}</p>`;
}

function heroBackground(ctx, h, alt) {
  if (h.kind === 'video') {
    const style = [h.color ? `background-color:${h.color}` : '', h.focus ? `object-position:${h.focus}` : ''].filter(Boolean).join(';');
    return `<video class="hero__media" data-hero-video autoplay muted loop playsinline preload="metadata" poster="${esc(h.video.poster)}" width="${h.w}" height="${h.h}"${
      style ? ` style="${style}"` : ''
    } aria-hidden="true"><source src="${esc(h.video.u)}" type="video/mp4"></video>`;
  }
  return picture(h, { sizes: '100vw', alt, cls: 'hero__media', eager: true });
}

function hero(ctx, visibleWorks) {
  const { s, content } = ctx;
  const h = content.hero;
  const caption = h.title?.[ctx.lang] || h.title?.pt || '';
  // O botão "ver a equipa em obra" abre o primeiro vídeo da galeria
  const videoIndex = h.kind === 'video' ? -1 : visibleWorks.findIndex((w) => w.kind === 'video');
  const video = visibleWorks[videoIndex];
  return `
<section class="hero hero--home">
  <div class="hero__bg">${heroBackground(ctx, h, caption)}</div>
  <div class="hero__shade" aria-hidden="true"></div>
  <div class="wrap hero__in">
    <div class="hero__content">
      <p class="pill-eyebrow"><i></i>${esc(s.hero.kicker)}</p>
      <h1 class="hero__title">${words(s.hero.title)}</h1>
      <p class="hero__lead">${esc(s.hero.lead)}</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="#${s.anchors.quote}">${esc(s.hero.cta)}${icon('arrow')}</a>
        <a class="btn btn--glass btn--lg" href="#${s.anchors.works}">${esc(s.hero.cta2)}</a>
      </div>
    </div>
    <div class="hero__aside">
      ${
        video
          ? `<a class="play" href="${esc(video.video.u)}" data-play="${videoIndex}"><span class="play__icon">${icon('play')}</span><span class="play__text"><b>${esc(s.hero.video)}</b><small>${esc(
              titleOf(ctx, video),
            )}</small></span></a>`
          : ''
      }
      ${
        caption || h.kind === 'video'
          ? `<div class="hero__meta">${
              caption ? `<p class="hero__caption"><span class="live"><i></i>${esc(s.hero.live)}</span>${esc([caption, h.place].filter(Boolean).join(' · '))}</p>` : ''
            }${
              h.kind === 'video'
                ? `<button class="hero__toggle" type="button" data-hero-toggle aria-label="${esc(s.hero.pause)}">${icon('pause', 'icon--pause')}${icon('play', 'icon--play')}</button>`
                : ''
            }</div>`
          : ''
      }
    </div>
  </div>
</section>`;
}

function stats(ctx) {
  const { s, content } = ctx;
  const n = content.numbers;
  const items = [
    [s.facts.clients, n.clients, true, true],
    [s.facts.professionals, n.professionals, true, true],
    [s.facts.ongoing, n.ongoing, false, true],
    [s.facts.founded, n.founded, false, false],
  ];
  return `
<div class="stats-wrap">
  <div class="wrap">
    <dl class="stats" data-stats>
      ${items
        .map(
          ([label, value, plus, count], i) =>
            `<div class="stat" style="--i:${i}"><dt>${esc(label)}</dt><dd><span${count ? ` data-to="${esc(value)}"` : ''}>${esc(value)}</span>${plus ? '<span class="stat__plus">+</span>' : ''}</dd></div>`,
        )
        .join('')}
    </dl>
  </div>
</div>`;
}

// Faixa com os serviços a passar (decorativa: o mesmo texto está nos cartões logo abaixo)
function marquee(ctx) {
  const { s } = ctx;
  const items = [s.services.items[0].title, ...s.services.items[0].tags.slice(0, 3), ...s.services.items.slice(1).map((it) => it.title)];
  const group = `<span class="marquee__group">${items.map((t) => `<span class="marquee__item">${esc(t)}</span><span class="marquee__sep"></span>`).join('')}</span>`;
  return `
<div class="marquee" aria-hidden="true">
  <div class="marquee__track">${group}${group}</div>
</div>`;
}

function services(ctx) {
  const { s } = ctx;
  return `
<section class="section" id="${s.anchors.services}">
  <div class="wrap">
    <header class="sec-head sec-head--split" data-reveal="text">
      <div>${eyebrow(s.services.kicker)}<h2 class="h2">${words(s.services.title)}</h2></div>
      <p class="sec-intro">${esc(s.services.intro)}</p>
    </header>
    <div class="svc-grid">
      ${s.services.items
        .map(
          (it, i) => `
      <article class="svc" data-reveal>
        <div class="svc__top"><span class="svc__icon">${icon(SERVICE_ICONS[i])}</span><span class="svc__n">0${i + 1}</span></div>
        <h3 class="svc__title">${esc(it.title)}</h3>
        <p class="svc__text">${esc(it.text)}</p>
        <ul class="chips">${it.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </article>`,
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function about(ctx) {
  const { s, content } = ctx;
  const main = findWork(ctx, 'armadura-fundacao');
  const second = findWork(ctx, 'cofragem-muros');
  return `
<section class="section section--soft" id="${s.anchors.company}">
  <div class="wrap about">
    <div class="about__media">
      <figure class="about__main" data-reveal="curtain">${picture(
        { ...main, focus: '55% 40%' },
        { sizes: '(min-width: 1000px) 38vw, 88vw', alt: s.about.photo, cls: 'about__img', attrs: 'data-parallax' },
      )}</figure>
      <figure class="about__second" data-reveal="curtain" style="--reveal-delay:.35s">${picture(second, { sizes: '(min-width: 1000px) 18vw, 42vw', alt: titleOf(ctx, second), cls: 'about__img' })}</figure>
      <div class="about__badge" data-reveal style="--reveal-delay:.8s"><strong>${esc(content.numbers.founded)}</strong><span>${esc(s.about.badge)}</span></div>
    </div>
    <div class="about__body" data-reveal="text">
      ${eyebrow(s.about.kicker)}
      <h2 class="h2">${words(s.about.title)}</h2>
      <div class="about__text">${s.about.text.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      <ul class="values">
        ${s.about.values
          .map((v, i) => `<li class="value" style="--i:${i}"><span class="value__icon">${icon(VALUE_ICONS[i])}</span><div><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></div></li>`)
          .join('')}
      </ul>
      <div class="about__cta"><a class="btn btn--dark btn--lg" href="#${s.anchors.quote}">${esc(s.about.cta)}${icon('arrow')}</a></div>
    </div>
  </div>
</section>`;
}

function workMeta(ctx, w) {
  const { s } = ctx;
  return [s.works.categories[w.category] || '', w.place, monthYear(w.date, s.locale)].filter(Boolean);
}

// Fotos com o mesmo nome de obra (o "grupo" do painel) formam um só quadro na galeria; a primeira é a capa.
// O resultado diz também a ordem da galeria em ecrã inteiro: as fotos de cada obra seguidas.
export function groupWorks(list) {
  const tiles = [];
  const byKey = new Map();
  for (const w of list) {
    const key = String(w.group || '').trim().toLowerCase();
    if (key && byKey.has(key)) {
      byKey.get(key).push(w);
      continue;
    }
    const items = [w];
    tiles.push(items);
    if (key) byKey.set(key, items);
  }
  return tiles;
}

// Botões das redes por baixo da galeria (cada um só aparece com o endereço preenchido no painel)
function socialPills(ctx) {
  const { s, content } = ctx;
  const c = content.contacts;
  const handle = (url) => url.replace(/\/+$/, '').split('/').pop().replace(/^@/, '');
  return [
    ['instagram', c.instagram, s.works.instagram, `@${handle(c.instagram || '')}`],
    ['facebook', c.facebook, s.works.facebook, 'Jesten Construções'],
    ['linkedin', c.linkedin, s.works.linkedin, 'Jesten Construções'],
  ]
    .filter(([, href]) => href)
    .map(
      ([kind, href, label, name]) =>
        `<a class="social-pill social-pill--${kind}" href="${esc(href)}" target="_blank" rel="noopener"><span class="social-pill__icon">${icon(kind)}</span><span class="social-pill__text"><small>${esc(
          label,
        )}</small><b>${esc(name)}</b></span>${icon('out', 'social-pill__go')}</a>`,
    )
    .join('');
}

function works(ctx, groups) {
  const { s, content } = ctx;
  if (!groups.length) return '';
  const flat = groups.flat();
  const covers = groups.map((g) => g[0]);
  const data = [];
  groups.forEach((g, gi) => {
    const album = titleOf(ctx, g[0]);
    g.forEach((w, i) =>
      data.push({
        kind: w.kind,
        src: w.kind === 'video' ? w.video.u : largest(w),
        poster: w.kind === 'video' ? w.video.poster : undefined,
        srcset: w.kind === 'image' ? w.img.map((x) => `${x.u} ${x.w}w`).join(', ') : undefined,
        w: w.w,
        h: w.h,
        title: titleOf(ctx, w),
        // Nas fotos de dentro de uma obra, o nome da obra vai junto
        meta: [i ? album : '', ...workMeta(ctx, w)].filter(Boolean).join(' · '),
        status: w.status ? s.works.status[w.status] : '',
        n: i + 1,
        of: g.length,
      }),
    );
  });
  // Os filtros contam fotos e vídeos; cada obra entra no tipo da sua capa
  const cats = [...new Set(covers.map((w) => w.category))];
  const countIn = (c) => groups.filter((g) => g[0].category === c).reduce((sum, g) => sum + g.length, 0);
  const filters =
    cats.length > 1
      ? `<div class="filters" role="group" aria-label="${esc(s.works.kicker)}" data-filters>
        <button class="filter" type="button" data-filter="all" aria-pressed="true">${esc(s.works.all)}<small>${flat.length}</small></button>
        ${cats
          .map(
            (c) =>
              `<button class="filter" type="button" data-filter="${esc(c)}" aria-pressed="false">${esc(s.works.categories[c] || c)}<small>${countIn(c)}</small></button>`,
          )
          .join('')}
      </div>`
      : '';
  const updated = content.updated
    ? `<p class="works__updated"><span class="live"><i></i>${fill(s.works.updated, { date: esc(longDate(content.updated, s.locale)) })}</span></p>`
    : '';
  let first = 0;
  const tiles = groups
    .map((g, i) => {
      const w = g[0];
      const index = first;
      first += g.length;
      const title = titleOf(ctx, w);
      const meta = workMeta(ctx, w);
      const count = g.length > 1 ? fill(s.works.photos, { n: g.length }) : '';
      const featured = i === 0;
      const sizes = featured ? '(min-width: 1000px) 62vw, 100vw' : '(min-width: 1000px) 31vw, (min-width: 640px) 48vw, 100vw';
      const media =
        w.kind === 'video'
          ? `<video class="tile__media" muted loop playsinline preload="none" poster="${esc(w.video.poster)}" data-src="${esc(w.video.u)}" width="${w.w}" height="${w.h}"${
              w.focus ? ` style="object-position:${w.focus}"` : ''
            } aria-hidden="true"></video>`
          : picture(w, { sizes, alt: title, cls: 'tile__media' });
      return `
      <li class="tile${featured ? ' tile--wide' : ''}${g.length > 1 ? ' tile--album' : ''}${i >= 9 ? ' tile--extra' : ''}" data-cat="${esc(w.category)}" data-reveal="curtain">
        <a class="tile__link" href="${esc(w.kind === 'video' ? w.video.u : largest(w))}" data-work="${index}" data-items="${g.length}" aria-label="${esc(
          `${s.works.open}: ${title}${count ? `, ${count}` : ''}`,
        )}"${w.color ? ` style="background-color:${w.color}"` : ''}>
          ${media}
          <span class="tile__shade" aria-hidden="true"></span>
          ${
            count
              ? `<span class="tile__badge">${icon('stack')}${esc(count)}</span>`
              : w.kind === 'video'
                ? `<span class="tile__badge">${icon('play')}${esc(s.works.video)}</span>`
                : ''
          }
          ${w.status ? `<span class="tile__status${w.status === 'ongoing' ? ' tile__status--live' : ''}">${esc(s.works.status[w.status])}</span>` : ''}
          <span class="tile__cap"><span class="tile__title">${esc(title)}</span>${meta.length ? `<span class="tile__meta">${esc(meta.join(' · '))}</span>` : ''}</span>
          <span class="tile__go" aria-hidden="true">${icon(count ? 'plus' : 'out')}</span>
        </a>
      </li>`;
    })
    .join('');
  const social = socialPills(ctx);
  return `
<section class="section" id="${s.anchors.works}">
  <div class="wrap">
    <header class="sec-head sec-head--split" data-reveal="text">
      <div>${eyebrow(s.works.kicker)}<h2 class="h2">${words(s.works.title)}</h2></div>
      <div class="sec-aside"><p class="sec-intro">${esc(s.works.intro)}</p>${updated}</div>
    </header>
    ${filters}
    <ul class="gallery" data-works>${tiles}
    </ul>
    <div class="gallery__foot">
      ${
        groups.length > 6
          ? `<div class="gallery__more${groups.length > 9 ? '' : ' gallery__more--m'}"><button class="btn btn--outline btn--lg" type="button" data-works-more aria-expanded="false" data-more="${esc(
              s.works.more,
            )}" data-less="${esc(s.works.less)}"><span>${esc(s.works.more)}</span>${icon('plus')}</button></div>`
          : ''
      }
      ${social ? `<div class="gallery__social">${social}</div>` : ''}
    </div>
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
  return `
<section class="section section--dark" id="${s.anchors.method}">
  <div class="wrap">
    <header class="sec-head sec-head--center" data-reveal="text">
      ${eyebrow(s.method.kicker, 'eyebrow--light')}
      <h2 class="h2">${words(s.method.title)}</h2>
    </header>
    <ol class="steps" data-reveal="steps">
      ${s.method.steps
        .map((st, i) => `<li class="step" style="--i:${i}"><span class="step__n">0${i + 1}</span><h3 class="step__title">${esc(st.title)}</h3><p class="step__text">${esc(st.text)}</p></li>`)
        .join('')}
    </ol>
  </div>
</section>`;
}

function hiring(ctx) {
  const { s, content } = ctx;
  if (!content.hiring) return '';
  const photo = findWork(ctx, 'escoras-estaleiro');
  return `
<section class="section section--tight">
  <div class="wrap">
    <div class="hire">
      <div class="hire__body" data-reveal="text">
        ${eyebrow(s.hiring.kicker, 'eyebrow--ink')}
        <h2 class="h2 hire__title">${words(s.hiring.title)}</h2>
        <p class="hire__text">${esc(s.hiring.text)}</p>
        <a class="btn btn--dark btn--lg" href="${s.routes.careers}">${esc(s.hiring.cta)}${icon('arrow')}</a>
      </div>
      <div class="hire__media" data-reveal="curtain">${picture({ ...photo, focus: '60% 35%' }, { sizes: '(min-width: 1000px) 42vw, 100vw', alt: '', cls: 'hire__img', attrs: 'data-parallax' })}</div>
    </div>
  </div>
</section>`;
}

// Lista de contactos diretos; nas carreiras só e-mail, WhatsApp e telefones
// Contactos de cada país (e-mail de orçamentos e telefones); nas carreiras vão só os telefones
function regions(ctx, { emails = true } = {}) {
  const { s, content } = ctx;
  const c = content.contacts;
  const blocks = regionCodes(c)
    .map((code) => {
      const rows = [
        ...(emails ? (c.emails || []).filter((e) => e.country === code).map((e) => ['mail', `mailto:${e.email}`, e.email]) : []),
        ...c.phones.filter((p) => p.country === code).map((p) => ['phone', telHref(p.number), p.number]),
      ];
      if (!rows.length) return '';
      return `<section class="region">
        <h3 class="region__name"><span class="region__code">${esc(code)}</span>${esc(countryName(code, s.locale))}</h3>
        <ul class="region__list">${rows.map(([ic, href, value]) => `<li><a href="${esc(href)}">${icon(ic)}<span>${esc(value)}</span></a></li>`).join('')}</ul>
      </section>`;
    })
    .join('');
  return blocks ? `<div class="regions">${blocks}</div>` : '';
}

function contacts(ctx, { only, whatsappText = ctx.s.quote.whatsappText } = {}) {
  const { s, content } = ctx;
  const c = content.contacts;
  const ch = s.quote.channels;
  const rows = [];
  if (c.email) rows.push(['mail', `mailto:${c.email}`, esc(c.emails?.length ? ch.general : ch.email), c.email, false]);
  if (c.whatsapp) rows.push(['whatsapp', waHref(c.whatsapp, whatsappText), esc(ch.whatsapp), `+${c.whatsapp.replace(/^(\d{3})(\d{3})(\d{3})(\d+)$/, '$1 $2 $3 $4')}`, true]);
  if (c.instagram) rows.push(['instagram', c.instagram, esc(ch.instagram), `@${c.instagram.replace(/\/+$/, '').split('/').pop() || ''}`, true]);
  // O endereço do Facebook e do LinkedIn pode ser comprido (profile.php?id=…): mostra-se o nome da empresa
  if (c.facebook) rows.push(['facebook', c.facebook, esc(ch.facebook), 'Jesten Construções', true]);
  if (c.linkedin) rows.push(['linkedin', c.linkedin, esc(ch.linkedin), 'Jesten Construções', true]);
  rows.push(['pin', c.maps, esc(ch.address), `${c.address}, ${c.postal}`, true]);
  return `<ul class="contacts">${rows
    .filter(([ic]) => !only || only.includes(ic))
    .map(
      ([ic, href, label, value, external], i) => `
      <li style="--i:${i}"><a class="contact" href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>
        <span class="contact__icon">${icon(ic)}</span>
        <span class="contact__body"><span class="contact__label">${label}</span><span class="contact__value">${esc(value)}</span></span>
        ${icon(external ? 'out' : 'arrow', 'contact__go')}
      </a></li>`,
    )
    .join('')}</ul>`;
}

function field({ id, name, label, type = 'text', required = false, attrs = '', hint = '', full = false, s }) {
  const opt = required ? '' : `<span class="field__opt">(${esc(s.form.optional)})</span>`;
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

function done(ctx, kind, f, visible) {
  const { s, content } = ctx;
  const wa = content.contacts.whatsapp;
  return `<div class="form-done" data-done="${kind}"${visible ? '' : ' hidden'} tabindex="-1">
        <span class="form-done__icon">${icon('check')}</span>
        <h3 class="form-done__title">${esc(f.successTitle)}</h3>
        <p class="form-done__text" data-done-text data-template="${esc(f.successText)}">${esc(f.successText.replace(/,? ?\{name\}/, ''))}</p>
        ${
          kind === 'quote' && wa
            ? `<p class="form-done__wa"><a class="btn btn--outline" href="${esc(waHref(wa, s.quote.whatsappText))}" target="_blank" rel="noopener">${icon('whatsapp')}${esc(f.successWhatsapp)}</a></p>`
            : ''
        }
        <p><button class="link-btn" type="button" data-again>${esc(f.another)}</button></p>
      </div>`;
}

function quote(ctx) {
  const { s } = ctx;
  const f = s.quote.form;
  const sent = ctx.sent === 'quote';
  return `
<section class="section section--soft" id="${s.anchors.quote}">
  <div class="wrap quote">
    <div class="quote__intro" data-reveal="text">
      ${eyebrow(s.quote.kicker)}
      <h2 class="h2">${words(s.quote.title)}</h2>
      <p class="sec-intro">${esc(s.quote.lead)}</p>
      <p class="quote__sub">${esc(s.quote.direct)}</p>
      ${regions(ctx)}
      ${contacts(ctx)}
    </div>
    <div class="quote__card" data-reveal>
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
          <button class="btn btn--primary btn--lg btn--block" type="submit" data-submit>${esc(f.submit)}${icon('arrow')}</button>
          <p class="form__status" data-status role="status" aria-live="polite"></p>
        </div>
      </form>
      ${done(ctx, 'quote', f, sent)}
    </div>
  </div>
</section>`;
}

export function homePage(ctx) {
  const groups = groupWorks(ctx.content.works.filter((w) => w.visible !== false));
  return layout(ctx, {
    meta: ctx.s.meta.home,
    pageClass: 'page-home',
    overlay: true,
    body: [hero(ctx, groups.flat()), stats(ctx), marquee(ctx), services(ctx), about(ctx), works(ctx, groups), method(ctx), hiring(ctx), quote(ctx)].join('\n'),
  });
}

// ---------- Carreiras ----------

export function careersPage(ctx) {
  const { s } = ctx;
  const c = s.careers;
  const f = c.form;
  const photo = findWork(ctx, 'escoras-estaleiro');
  const sent = ctx.sent === 'job';
  const body = `
<section class="hero hero--page">
  <div class="hero__bg">${picture({ ...photo, focus: '55% 35%' }, { sizes: '100vw', alt: '', cls: 'hero__media', eager: true })}</div>
  <div class="hero__shade" aria-hidden="true"></div>
  <div class="wrap hero__in">
    <div class="hero__content">
      <p class="pill-eyebrow"><i></i>${esc(c.kicker)}</p>
      <h1 class="hero__title">${words(c.title.join(' '))}</h1>
      <p class="hero__lead">${esc(c.lead)}</p>
      <div class="hero__actions"><a class="btn btn--primary btn--lg" href="#candidatura">${esc(f.submit)}${icon('down')}</a></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <header class="sec-head" data-reveal="text">${eyebrow(c.kicker)}<h2 class="h2">${words(c.rolesTitle)}</h2></header>
    <div class="roles">
      ${c.roles.map((r, i) => `<article class="role" data-reveal><span class="role__n">0${i + 1}</span><h3 class="role__title">${esc(r.title)}</h3><p>${esc(r.text)}</p></article>`).join('')}
      <aside class="offer" data-reveal>
        <h3 class="offer__title">${esc(c.offerTitle)}</h3>
        <ul class="offer__list">${c.offer.map((o) => `<li>${icon('check')}<span>${esc(o)}</span></li>`).join('')}</ul>
      </aside>
    </div>
  </div>
</section>
<section class="section section--soft" id="candidatura">
  <div class="wrap quote">
    <div class="quote__intro" data-reveal="text">
      ${eyebrow(f.title)}
      <h2 class="h2">${words(c.applyTitle)}</h2>
      <p class="sec-intro">${esc(c.lead)}</p>
      <p class="quote__sub">${esc(c.direct)}</p>
      ${regions(ctx, { emails: false })}
      ${contacts(ctx, { only: ['mail', 'whatsapp'], whatsappText: c.whatsappText })}
    </div>
    <div class="quote__card" data-reveal>
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
          <button class="btn btn--primary btn--lg btn--block" type="submit" data-submit>${esc(f.submit)}${icon('arrow')}</button>
          <p class="form__status" data-status role="status" aria-live="polite"></p>
        </div>
      </form>
      ${done(ctx, 'job', f, sent)}
    </div>
  </div>
</section>`;
  return layout(ctx, { meta: s.meta.careers, pageClass: 'page-careers', overlay: true, body });
}

// ---------- Páginas legais e 404 ----------

export function legalPage(ctx, which) {
  const { s, content } = ctx;
  const doc = s.legal[which];
  const email = content.contacts.email ? `<a href="mailto:${esc(content.contacts.email)}">${esc(content.contacts.email)}</a>` : 'geral@jesten.pt';
  const link = (text) =>
    text.replace(/www\.(livroreclamacoes\.pt|consumidor\.gov\.pt|cnpd\.pt|aepd\.es)/g, (m) => `<a href="https://${m}/" target="_blank" rel="noopener">${m}</a>`);
  const n = (i) => String(i + 1).padStart(2, '0');
  const body = `
<section class="page-head">
  <div class="wrap">
    ${eyebrow(s.legal.updated)}
    <h1 class="h1">${words(doc.title)}</h1>
    <p class="page-head__lead">${esc(doc.intro)}</p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap legal">
    <nav class="legal__toc" aria-label="${esc(doc.title)}">
      <ol>${doc.sections.map(([h], i) => `<li><a href="#s${i + 1}"><span>${n(i)}</span>${esc(h)}</a></li>`).join('')}</ol>
    </nav>
    <div class="legal__body">
      ${doc.sections.map(([h, p], i) => `<section class="legal__sec" id="s${i + 1}"><h2><span>${n(i)}</span>${esc(h)}</h2><p>${link(fill(p, { email }))}</p></section>`).join('')}
    </div>
  </div>
</section>`;
  return layout(ctx, { meta: s.meta[which], pageClass: 'page-legal', body });
}

export function notFoundPage(ctx) {
  const { s } = ctx;
  const body = `
<section class="page-head page-head--center">
  <div class="wrap">
    <p class="nf__code" aria-hidden="true">404</p>
    <h1 class="h1">${words(s.notFound.title)}</h1>
    <p class="page-head__lead">${esc(s.notFound.text)}</p>
    <a class="btn btn--primary btn--lg" href="${s.routes.home}">${esc(s.notFound.cta)}${icon('arrow')}</a>
  </div>
</section>`;
  return layout({ ...ctx, page: 'notFound' }, { meta: s.meta.notFound, pageClass: 'page-404', body });
}
