// HTML for every page, built from one content document (see defaults.mjs).
// The Worker calls render(content, path, ctx) for each request; the panel calls it for the live preview.

import images from './images.mjs';
import { mark as markData, word } from './logo.mjs';
import { van } from './van.mjs';
import { sprite, googleG } from './icons.mjs';
import { esc, mark, unmark, sanitize, plain, safeUrl } from './text.mjs';

export { esc };

// The document and request being rendered. Rendering is synchronous, so module state is safe in a Worker.
let c;
let site;
let ctx;
let bySlug;
let visible;

const href = (slug) => (slug ? `/${slug}` : '/');
const abs = (path) => site.url + path;
const pad = (n) => String(n).padStart(2, '0');
const money = (n) => '$' + Number(n).toLocaleString('en-AU');
const tel = () => `tel:${site.phoneIntl}`;
const mailto = () => `mailto:${site.email}`;
const svc = (slug) => (visible.has(slug) ? bySlug[slug] : null);
const link = (u) => esc(safeUrl(u) || '/');

/* ---------- images ---------- */

// Every image field holds one of: a photo name from images.mjs, an uploaded photo "m:<id>:<w>x<h>:<format>",
// or (for logos and swatches) a path under /assets or /media.
export function imageInfo(ref) {
  if (typeof ref !== 'string' || !ref) return null;
  const m = /^m:([a-z0-9]{6,40}):(\d{1,5})x(\d{1,5}):(webp|jpg|png)$/.exec(ref);
  if (m) {
    const [, id, w, h, ext] = m;
    const W = +w;
    const H = +h;
    const widths = W > 800 ? [800, W] : [W];
    const ogW = Math.min(W, 1200);
    return {
      w: W, h: H, widths, types: [ext === 'jpg' ? 'jpeg' : ext],
      src: (i, type) => `/media/${id}-${i ? 1600 : 800}.${type === 'jpeg' ? 'jpg' : type}`,
      og: `/media/${id}.jpg`, ogSize: [ogW, Math.round((H * ogW) / W)],
    };
  }
  const img = images[ref];
  if (!img) return null;
  return {
    ...img, types: ['avif', 'webp'],
    src: (i, type) => `/assets/img/work/${ref}-${i ? 1600 : 800}.${type}`,
    og: `/assets/img/work/${ref}.jpg`, ogSize: [1200, Math.round((img.h * 1200) / img.w)],
  };
}

// A single file for small images (logos, swatches)
export function smallSrc(ref) {
  if (typeof ref !== 'string' || !ref) return '';
  if (ref.startsWith('/')) return /^\/(assets|media)\/[\w./-]+$/.test(ref) && !ref.includes('..') ? ref : '';
  const info = imageInfo(ref);
  return info ? info.src(0, info.types[info.types.length - 1]) : '';
}

// <picture> with every format at both sizes
export function picture(ref, alt, { sizes = '100vw', eager = false, cls = '' } = {}) {
  const img = imageInfo(ref);
  if (!img) return '';
  const set = (type) => img.widths.map((w, i) => `${img.src(i, type)} ${w}w`).join(', ');
  const last = img.types[img.types.length - 1];
  return `<picture${cls ? ` class="${cls}"` : ''}>
    ${img.types.slice(0, -1).map((t) => `<source type="image/${t}" srcset="${set(t)}" sizes="${sizes}">`).join('\n    ')}
    <img src="${img.src(0, last)}" srcset="${set(last)}" sizes="${sizes}" width="${img.w}" height="${img.h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">
  </picture>`;
}

/* ---------- small parts ---------- */

const icon = (name, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${esc(name)}"/></svg>`;

let eyeIds = 0;
// The chameleon mark. Its pupil (.pupil) follows the pointer, see site.js.
export function markSvg(cls = 'mark') {
  const id = `eye-${++eyeIds}`;
  const { eye, pupil } = markData;
  return `<svg class="${cls}" viewBox="${markData.viewBox}" aria-hidden="true" focusable="false">
    <path d="${markData.body}"/>
    <mask id="${id}"><rect width="756" height="414" fill="#fff"/><circle class="pupil" cx="${pupil.cx}" cy="${pupil.cy}" r="${pupil.r}" fill="#000"/></mask>
    <circle class="eyeball" cx="${eye.cx}" cy="${eye.cy}" r="${eye.r}" mask="url(#${id})"/>
  </svg>`;
}

function logo(cls = 'logo') {
  return `<svg class="${cls}" viewBox="-467 0 3025 214" role="img" aria-label="${esc(site.name)}">
    <g fill-rule="evenodd"><path class="logo__mark" d="${word.markBox}"/><path class="logo__eye" d="${word.markEye}"/><path class="logo__bora" d="${word.bora}"/><path class="logo__signs" d="${word.signs}"/></g>
  </svg>`;
}

const btn = (label, url, { kind = 'pink', size = '', ico = 'arrow', attrs = '' } = {}) =>
  `<a class="btn btn--${kind}${size ? ` btn--${size}` : ''}" href="${url}"${attrs} data-magnetic><span>${esc(label)}</span>${ico ? icon(ico) : ''}</a>`;

const kicker = (text) => (text ? `<p class="kicker"><span class="kicker__dot"></span>${esc(text)}</p>` : '');

const sectionHead = (k, title, lead = '', { tag = 'h2', cls = '' } = {}) => `
  <header class="section-head ${cls}">
    ${k ? kicker(k) : ''}
    <${tag} class="display" data-split>${mark(title)}</${tag}>
    ${lead ? `<p class="lead" data-reveal>${esc(lead)}</p>` : ''}
  </header>`;

const socialLinks = () =>
  Object.entries(site.social)
    .map(([k, u]) => [k, safeUrl(u)])
    .filter(([, u]) => /^https?:/.test(u))
    .map(([k, u]) => `<a class="social" href="${esc(u)}" target="_blank" rel="noopener" aria-label="${esc(site.name)} on ${k === 'linkedin' ? 'LinkedIn' : k === 'tiktok' ? 'TikTok' : k === 'youtube' ? 'YouTube' : k[0].toUpperCase() + k.slice(1)}">${icon(k)}</a>`)
    .join('');

const address = () => `${esc(site.address.street)}, ${esc(site.address.locality)} ${esc(site.address.region)} ${esc(site.address.postcode)}`;

// Menu links to hidden or deleted services are left out
const menuItems = (m) => m.items.filter((it) => {
  const slug = it.href.replace(/^\//, '');
  return it.label && (!bySlug[slug] || visible.has(slug));
});

/* ---------- header / footer ---------- */

function header(current) {
  const here = (h) => (h === href(current) || (current === 'index' && h === '/') ? ' aria-current="page"' : '');
  const item = (m, i) => {
    const items = menuItems(m);
    if (!items.length) return m.href ? `<a class="nav__link" href="${link(m.href)}"${here(m.href)}>${esc(m.label)}</a>` : '';
    const open = items.some((it) => it.href === href(current));
    const list = `<ul class="dd__menu" id="dd-${i}">${items.map((it) => `<li><a href="${link(it.href)}"${it.href === href(current) ? ' aria-current="page"' : ''}>${esc(it.label)}</a></li>`).join('')}</ul>`;
    return `
      <div class="dd" data-dropdown>
        ${m.href ? `<a class="nav__link${open ? ' is-current' : ''}" href="${link(m.href)}">${esc(m.label)}</a>` : `<span class="nav__link${open ? ' is-current' : ''}">${esc(m.label)}</span>`}
        <button class="dd__toggle" type="button" aria-expanded="false" aria-controls="dd-${i}" aria-label="${esc(m.label)} services">${icon('chev', 'i i--sm')}</button>
        ${list}
      </div>`;
  };
  const mobile = (m) => {
    const items = menuItems(m);
    if (!items.length) return m.href ? `<a class="menu__link" href="${link(m.href)}">${esc(m.label)}</a>` : '';
    return `<p class="menu__group">${m.href ? `<a href="${link(m.href)}">${esc(m.label)}</a>` : esc(m.label)}</p>
        <div class="menu__subs">${items.map((it) => `<a class="menu__sub" href="${link(it.href)}">${esc(it.label)}</a>`).join('')}</div>`;
  };
  return `
<header class="hdr" data-hdr>
  <div class="hdr__in">
    <a class="hdr__brand" href="/" aria-label="${esc(site.name)} home">${logo()}</a>
    <nav class="nav" aria-label="Main">
      ${c.menu.map(item).join('')}
    </nav>
    <div class="hdr__actions">
      ${btn(c.header.button, '/contact', { kind: 'pink', size: 'sm', ico: '' })}
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu" data-burger>
        <span></span><span></span>
      </button>
    </div>
  </div>
</header>
<div class="menu" id="menu" data-menu hidden>
  <nav class="menu__in" aria-label="Mobile">
    ${c.menu.map(mobile).join('\n    ')}
    <div class="menu__foot">
      <a class="btn btn--pink btn--lg" href="/contact"><span>${esc(c.header.button)}</span>${icon('arrow')}</a>
      <a class="menu__phone" href="${tel()}">${icon('phone')} ${esc(site.phone)}</a>
      <div class="socials">${socialLinks()}</div>
    </div>
  </nav>
</div>`;
}

const hasPosts = () => c.blog.enabled && publishedPosts().length > 0;

function footer() {
  const f = c.footer;
  const popular = f.popular.map(svc).filter(Boolean);
  const company = [...f.company, ...(hasPosts() ? [{ label: c.blog.footerLabel || 'Blog', href: '/blog' }] : [])];
  const year = new Date().getFullYear();
  return `
<footer class="ftr">
  ${f.ticker ? `<div class="ftr__ticker" aria-hidden="true"><div class="ftr__ticker-track">${`<span>${esc(f.ticker)}</span>`.repeat(8)}</div></div>` : ''}
  <div class="container ftr__grid">
    <div class="ftr__brand">
      <a href="/" aria-label="${esc(site.name)} home">${logo('logo logo--ftr')}</a>
      <p>${esc(site.tagline)} ${esc(f.text)}</p>
      <div class="socials">${socialLinks()}</div>
    </div>
    <div>
      <p class="ftr__title">${esc(f.popularTitle)}</p>
      <ul class="ftr__list">${popular.map((s) => `<li><a href="${href(s.slug)}">${esc(s.name)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <p class="ftr__title">${esc(f.companyTitle)}</p>
      <ul class="ftr__list">
        ${company.filter((l) => l.label).map((l) => `<li><a href="${link(l.href)}">${esc(l.label)}</a></li>`).join('\n        ')}
      </ul>
    </div>
    <div>
      <p class="ftr__title">${esc(f.contactTitle)}</p>
      <ul class="ftr__list ftr__contact">
        <li><a href="${tel()}">${icon('phone')}${esc(site.phone)}</a></li>
        <li><a href="${mailto()}">${icon('mail')}${esc(site.email)}</a></li>
        <li><a href="${link(site.mapUrl)}" target="_blank" rel="noopener">${icon('pin')}${address()}</a></li>
      </ul>
    </div>
  </div>
  <div class="container ftr__base">
    <p>© ${year} ${esc(site.legalName)} · ABN ${esc(site.abn)}</p>
    <p>${esc(f.baseLine)}</p>
  </div>
</footer>
<div class="dock" data-dock>
  <a class="dock__call" href="${tel()}">${icon('phone')}<span>${esc(f.dockCall)}</span></a>
  <a class="dock__quote" href="/contact">${esc(f.dockQuote)} ${icon('arrow')}</a>
</div>`;
}

/* ---------- structured data ---------- */

function business() {
  const a = site.address;
  return {
    '@type': 'LocalBusiness',
    '@id': `${site.url}/#business`,
    name: site.name,
    legalName: site.legalName,
    taxID: site.abn.replace(/\s/g, ''),
    description: site.description,
    url: `${site.url}/`,
    telephone: site.phoneIntl,
    email: site.email,
    logo: abs('/assets/img/logo-512.png'),
    image: [abs('/assets/img/work/install-van-wrap.jpg'), abs('/assets/img/work/shopfront-lp-accounting.jpg')],
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.street,
      addressLocality: a.locality,
      addressRegion: a.region,
      postalCode: a.postcode,
      addressCountry: a.country,
    },
    hasMap: site.mapUrl,
    areaServed: { '@type': 'City', name: 'Adelaide' },
    sameAs: Object.values(site.social).filter((u) => /^https?:/.test(safeUrl(u))),
  };
}

function jsonLd(page, extra = []) {
  const graph = [
    business(),
    { '@type': 'WebSite', '@id': `${site.url}/#website`, url: `${site.url}/`, name: site.name, inLanguage: 'en-AU', publisher: { '@id': `${site.url}/#business` } },
    {
      '@type': 'WebPage',
      '@id': `${page.url}#webpage`,
      url: page.url,
      name: page.title,
      description: page.description,
      inLanguage: 'en-AU',
      isPartOf: { '@id': `${site.url}/#website` },
      about: { '@id': `${site.url}/#business` },
      primaryImageOfPage: page.image ? { '@type': 'ImageObject', url: page.image } : undefined,
    },
    ...extra,
  ];
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
}

const breadcrumbLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url })),
});

const faqLd = (faq) => ({
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

/* ---------- page shell ---------- */

function pixel() {
  const id = String(c.seo.metaPixelId || '').trim();
  if (!/^\d{6,20}$/.test(id) || ctx.preview) return '';
  return `<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
f.addEventListener('load',function(){t=b.createElement(e);t.async=!0;t.src=v;b.head.appendChild(t)})}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${id}');fbq('track','PageView');
</script>
<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1"></noscript>`;
}

function analytics() {
  const id = String(c.seo.gaId || '').trim().toUpperCase();
  if (!/^G-[A-Z0-9]{4,16}$/.test(id) || ctx.preview) return '';
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');</script>`;
}

// In the panel's preview, links ask the panel to open that page instead, and forms don't send
const previewScript = `<script>
addEventListener('click',function(e){if(parent===window)return;var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var u=new URL(a.href,document.baseURI),me=new URL(document.baseURI);
if(u.protocol!=='http:'&&u.protocol!=='https:'){e.preventDefault();return}
if(u.hash&&u.pathname===document.documentElement.dataset.path){e.preventDefault();var t=document.getElementById(decodeURIComponent(u.hash.slice(1)));if(t)t.scrollIntoView({behavior:'smooth'});return}
e.preventDefault();if(u.origin===me.origin)parent.postMessage({bsPreview:'go',path:u.pathname},'*')},true);
addEventListener('submit',function(e){e.preventDefault();e.stopImmediatePropagation();alert('Preview: forms are not sent from the panel.')},true);
</script>`;

function layout({ slug, path, title, description, image, imageSize, body, ld = [], bodyClass = '', head = '', noindex = false }) {
  const url = slug === '404' ? `${site.url}/404` : site.url + (path || href(slug === 'index' ? '' : slug));
  const ogImage = abs(image || c.seo.ogImage || '/assets/img/og-image.jpg');
  const [ogW, ogH] = imageSize || [1200, 630];
  const assets = ctx.assets;
  const verify = String(c.seo.googleSiteVerification || '').trim();
  return `<!doctype html>
<html lang="en-AU"${ctx.preview ? ` class="is-preview" data-path="${esc(path || href(slug === 'index' ? '' : slug))}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '' : `<link rel="canonical" href="${esc(url)}">`}
<meta name="robots" content="${noindex || site.noindex ? 'noindex' : 'index, follow, max-image-preview:large'}">
<meta name="theme-color" content="#0d0614">
${verify ? `<meta name="google-site-verification" content="${esc(verify)}">` : ''}
<meta property="og:type" content="${slug.startsWith('blog/') ? 'article' : 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="en_AU">
<meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="${ogW}">
<meta property="og:image:height" content="${ogH}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script>document.documentElement.classList.add('js')</script>
${ctx.preview ? previewScript : ''}
<link rel="preload" href="/assets/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
${head}
<link rel="stylesheet" href="/assets/css/site.css?v=${assets.css}">
<script src="/assets/js/lenis.min.js?v=${assets.lenis}" defer></script>
<script src="/assets/js/site.js?v=${assets.js}" defer></script>
${slug === 'index' ? `<script src="/assets/js/hero3d.js?v=${assets.hero3d}" defer></script>` : ''}
${noindex ? '' : jsonLd({ url, title, description, image: ogImage }, ld)}
${pixel()}${analytics()}
</head>
<body class="${bodyClass}">
${sprite}
<a class="skip" href="#main">Skip to content</a>
${header(slug)}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>
`;
}

/* ---------- shared sections ---------- */

const ctaFinal = (title) => `
<section class="cta-final">
  <div class="container center">
    <div class="cta-final__mark" data-reveal>${markSvg('mark mark--mascot')}</div>
    ${kicker(c.cta.kicker)}
    <h2 class="mega-type" data-split>${mark(title || c.cta.title)}</h2>
    <p class="lead" data-reveal>${esc(c.cta.text)}</p>
    <div class="cta-row" data-reveal>
      ${btn(c.cta.button, '/contact', { size: 'lg' })}
      ${btn(`${c.cta.call} ${site.phone}`, tel(), { kind: 'ghost', size: 'lg', ico: 'phone' })}
    </div>
  </div>
</section>`;

const processSection = (compact = false) => `
<section class="section process${compact ? ' process--compact' : ''}" id="process">
  <div class="container">
    ${sectionHead(c.process.kicker, c.process.title, c.process.lead, { cls: 'center' })}
    <div class="steps-wrap" data-steps>
    <div class="steps__line" aria-hidden="true"><span></span></div>
    <ol class="steps">
      ${c.process.steps.map((s, i) => `
      <li class="step" data-reveal style="--d:${i * 90}ms">
        <span class="step__num">${pad(i + 1)}</span>
        <h3 class="step__title">${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </li>`).join('')}
    </ol>
    </div>
  </div>
</section>`;

const faqSection = (faq, title, k) => (faq.length ? `
<section class="section faq">
  <div class="container narrow">
    ${sectionHead(k, title, '', { cls: 'center' })}
    <div class="faq__list">
      ${faq.map((f) => `
      <details class="faq__item" data-reveal>
        <summary><span>${esc(f.q)}</span><span class="faq__icon">${icon('plus')}</span></summary>
        <div class="faq__a"><p>${esc(f.a)}</p></div>
      </details>`).join('')}
    </div>
  </div>
</section>` : '');

const quoteBlock = (q) => (q && q.text ? `
<section class="section testimonial">
  <figure class="container narrow center quote" data-reveal>
    ${icon('quote', 'quote__icon')}
    <blockquote><p>${esc(q.text)}</p></blockquote>
    <figcaption><strong>${esc(q.name)}</strong>${q.role ? `<span>${esc(q.role)}</span>` : ''}</figcaption>
  </figure>
</section>` : '');

const clientsSection = () => {
  const items = c.clients.items.filter((x) => smallSrc(x.logo));
  if (!items.length) return '';
  return `
<section class="clients" aria-labelledby="clients-title">
  <p class="clients__title" id="clients-title">${esc(c.clients.title)}</p>
  <div class="clients__row">
    <div class="clients__track">
      ${[0, 1].map((k) => items.map((x) => `<span class="client"${k ? ' aria-hidden="true"' : ''}><img src="${esc(smallSrc(x.logo))}" alt="${k ? '' : esc(x.name)}" loading="lazy" decoding="async"></span>`).join('')).join('')}
    </div>
  </div>
</section>`;
};

const serviceCard = (s, i, { big = false } = {}) => `
  <a class="svc${big ? ' svc--big' : ''}" href="${href(s.slug)}" data-spot data-reveal style="--d:${(i % 4) * 80}ms">
    <div class="svc__media">${picture(s.image, s.imageAlt, { sizes: big ? '(min-width: 900px) 50vw, 100vw' : '(min-width: 900px) 33vw, 100vw' })}</div>
    <div class="svc__body">
      <span class="svc__num">${pad(i + 1)}</span>
      <h3 class="svc__title">${esc(s.name)}</h3>
      <p>${esc(s.card)}</p>
      <span class="svc__go">${esc(s.feature === 'wrap-slider' ? c.servicePage.sliderButton : c.servicePage.cardLink)} ${icon('arrow')}</span>
    </div>
  </a>`;

/* ---------- home hero scene ---------- */

// Where the tasks float behind the chameleon (the texts and icons come from the panel). x/y place each card in the
// scene (%), z is how far behind him it floats (more negative = further back, so it moves less with the pointer),
// side 'r' cards sit to his right with the label on their outer edge, so the part tucked behind him is the blank one.
// mx/my are the places on phones; cards without them are left out there.
const cardSlots = [
  { x: 18, y: 30, z: -60, mx: 16, my: 54 },
  { x: 13, y: 45, z: -110, mx: 15, my: 71 },
  { x: 16, y: 60, z: -80, mx: 17, my: 37 },
  { x: 12, y: 75, z: -130 },
  { side: 'r', x: 96, y: 45, z: -90, mx: 83, my: 74 },
  { side: 'r', x: 93, y: 61, z: -60, mx: 82, my: 88 },
  { side: 'r', x: 95, y: 77, z: -110, mx: 82, my: 58 },
];
export const cardCount = cardSlots.length;

function campaign() {
  const card = (slot, i) => {
    const t = c.home.hero.cards[i];
    if (!t || !t.label) return '';
    return `
        <div class="card${slot.side === 'r' ? ' card--r' : ''}${slot.mx == null ? ' card--wide-only' : ''}" style="--x:${slot.x}%;--y:${slot.y}%;--z:${slot.z}px;${slot.mx != null ? `--mx:${slot.mx}%;--my:${slot.my}%;` : ''}--in:${0.5 + i * 0.09}s">
          <div class="card__in">
            <span class="card__icon${t.pink ? ' card__icon--pink' : ''}">${icon(t.icon || 'users')}</span>
            <span class="card__text"><b>${esc(t.label)}</b><span></span><span></span></span>
          </div>
        </div>`;
  };
  return `<div class="scene-wrap">
      <div class="scene" data-camp aria-hidden="true">
        <div class="scene__glow" data-camp-glow></div>
        <div class="scene__back" data-camp-back>
          <span class="scene__ring"></span>
          ${cardSlots.map(card).join('')}
          <div class="card card--sign" style="--x:74%;--y:18%;--z:-40px;--mx:72%;--my:13%;--in:1.2s">
            <div class="card__in"><span class="card__check">${icon('check')}</span><b>${esc(c.home.hero.sign)}</b></div>
          </div>
          <canvas class="scene__shards" data-shards></canvas>
        </div>
        <div class="scene__cham">
          <img class="scene__img" src="/assets/img/hero/chameleon.webp" width="504" height="819" alt="" fetchpriority="high" decoding="async">
          <canvas class="scene__gl" data-cham3d data-color="/assets/img/hero/chameleon.webp" data-depth="/assets/img/hero/chameleon-depth.png"></canvas>
        </div>
      </div>
    </div>`;
}

/* ---------- home ---------- */

function home() {
  const h = c.home;
  const hero = h.hero;
  const featured = h.services.featured.map(svc).filter(Boolean);
  const rest = c.services.filter((s) => visible.has(s.slug) && !featured.includes(s));
  const g = c.google;

  const body = `
<section class="hero2">
  <div class="container hero2__grid">
    <div class="hero2__copy">
      <span class="eyebrow" data-hero-in>${icon('spark', 'i')} ${esc(hero.eyebrow)}</span>
      <h1 class="hero2__h" data-split data-split-now>${mark(hero.title)}</h1>
      <p class="hero2__tag" data-hero-in><strong>${esc(hero.tagStrong).replace(/\*([^*\n]+)\*/g, '<span>$1</span>')}</strong> ${esc(hero.tagText)} <em>${esc(hero.tagEm)}</em></p>
      <p class="lead hero2__lead" data-hero-in>${esc(hero.lead)}</p>
      <div class="hero2__cta" data-hero-in>
        ${btn(hero.button, '/contact', { size: 'lg' })}
        ${btn(site.phone, tel(), { kind: 'ghost', size: 'lg', ico: 'phone' })}
      </div>
      ${hero.trust.length ? `<ul class="hero2__trust" data-hero-in>
        ${hero.trust.map((t) => `<li>${icon('check')}${esc(t)}</li>`).join('\n        ')}
      </ul>` : ''}
      ${g.show ? `<a class="grating" href="${link(g.url)}" target="_blank" rel="noopener" data-hero-in>
        ${googleG}<strong>${esc(g.rating)}</strong><span class="grating__stars" aria-hidden="true">★★★★★</span><span>on Google</span>
      </a>` : ''}
    </div>
    ${campaign()}
  </div>
</section>
<section class="section intro" id="intro">
  <div class="container narrow center">
    <div class="mascot" data-reveal>${markSvg('mark mark--mascot')}</div>
    ${kicker(h.intro.kicker)}
    <h2 class="display" data-split>${mark(h.intro.title)}</h2>
    <p class="lead" data-reveal>${esc(h.intro.text)}</p>
    <ul class="stats">
      ${c.stats.map((s, i) => `<li class="stat" data-reveal style="--d:${i * 100}ms"><strong><span data-count="${+s.value || 0}">${+s.value || 0}</span>${esc(s.suffix)}</strong><span>${esc(s.label)}</span></li>`).join('')}
    </ul>
    <div data-reveal>${btn(h.intro.button, '/contact', { kind: 'ghost' })}</div>
  </div>
</section>

<section class="section services" id="services">
  <div class="container">
    ${sectionHead(h.services.kicker, h.services.title, h.services.lead, { cls: 'center' })}
    <div class="svc-grid">
      ${featured.map((s, i) => serviceCard(s, i, { big: true })).join('')}
    </div>
    ${rest.length ? `<div class="svc-more" data-reveal>
      <p class="svc-more__title">${esc(h.services.moreTitle)}</p>
      <div class="chips">
        ${rest.map((s) => `<a class="chip" href="${href(s.slug)}">${esc(s.name)} ${icon('arrow')}</a>`).join('')}
      </div>
    </div>` : ''}
  </div>
</section>
${processSection()}

<section class="section reasons">
  <div class="container">
    ${sectionHead(h.reasons.kicker, h.reasons.title, '', { cls: 'center' })}
    <div class="reasons__grid">
      ${h.reasons.items.map((r, i) => `
      <article class="reason" data-spot data-reveal style="--d:${i * 80}ms">
        <span class="reason__num">${pad(i + 1)}</span>
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.text)}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

${clientsSection()}

${h.reviews.items.length ? `<section class="section reviews" data-reviews>
  <div class="container narrow center">
    ${kicker(h.reviews.kicker)}
    <div class="reviews__stage">
      ${h.reviews.items.map((q, i) => `
      <figure class="quote review${i === 0 ? ' is-active' : ''}" data-review aria-hidden="${i === 0 ? 'false' : 'true'}">
        ${icon('quote', 'quote__icon')}
        <blockquote><p>${esc(q.text)}</p></blockquote>
        <figcaption><strong>${esc(q.name)}</strong>${q.role ? `<span>${esc(q.role)}</span>` : ''}</figcaption>
      </figure>`).join('')}
    </div>
    <div class="reviews__dots" role="tablist" aria-label="Testimonials">
      ${h.reviews.items.map((q, i) => `<button type="button" role="tab" aria-selected="${i === 0}" aria-label="Testimonial ${i + 1}" data-review-dot="${i}"></button>`).join('')}
    </div>
  </div>
</section>` : ''}

${faqSection(h.faq.items, h.faq.title, h.faq.kicker)}
${ctaFinal()}`;

  return {
    slug: 'index',
    title: h.seo.title,
    description: h.seo.description,
    image: c.seo.ogImage || '/assets/img/og-image.jpg',
    bodyClass: 'is-home',
    ld: h.faq.items.length ? [faqLd(h.faq.items)] : [],
    body,
  };
}

/* ---------- service pages ---------- */

function wrapSlider() {
  const w = c.van;
  const tiers = w.tiers.map((t) => ({ upTo: t.upTo, name: t.name }));
  return `
<section class="section wrapcalc-sec" id="wrap-it">
  <div class="container">
    ${sectionHead(w.kicker, w.title, w.lead, { cls: 'center' })}
  </div>
  <div class="container wrapcalc" data-wrapcalc data-min="${+w.min}" data-max="${+w.max}" data-step="${+w.step || 50}" data-tiers='${esc(JSON.stringify(tiers))}'>
    <div class="wrapcalc__stage" data-reveal>
      <span class="wrapcalc__tag wrapcalc__tag--l">Wrapped</span>
      <span class="wrapcalc__tag wrapcalc__tag--r">Plain</span>
      <div class="wrapcalc__van" data-van>
        ${van()}
        <div class="wrapcalc__handle" data-handle role="slider" tabindex="0" aria-label="Wrap coverage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
          <span class="wrapcalc__knob">${icon('drag')}</span>
          <span class="wrapcalc__hint">Drag me</span>
        </div>
      </div>
      <div class="wrapcalc__road" aria-hidden="true"></div>
    </div>
    <div class="wrapcalc__panel" data-reveal>
      <div class="wrapcalc__stat"><span>Coverage</span><strong data-cov>50%</strong></div>
      <div class="wrapcalc__stat"><span>Package</span><strong data-tier>${esc((tiers.find((t) => t.upTo >= 0.5) || tiers[tiers.length - 1] || { name: '' }).name)}</strong></div>
      <div class="wrapcalc__stat wrapcalc__stat--price"><span>Indicative price</span><strong><small>from</small> <span data-price>${money(Math.round((+w.min + +w.max) / 2))}</span></strong></div>
      <a class="btn btn--pink" data-quote href="/contact?service=vehicle-signage" data-magnetic><span>${esc(w.button)}</span>${icon('arrow')}</a>
    </div>
    <div class="wrapcalc__meter" aria-hidden="true">
      <span class="wrapcalc__fill" data-meter></span>
      ${tiers.map((t, i) => `<span class="wrapcalc__tick" style="--at:${i ? tiers[i - 1].upTo : 0}"><b>${esc(t.name)}</b></span>`).join('')}
    </div>
    <p class="wrapcalc__note">${esc(w.note).replace(/\{min\}/g, money(w.min)).replace(/\{max\}/g, money(w.max))}</p>
  </div>
</section>`;
}

const cssColor = (v) => (/^#[0-9a-f]{3,8}$/i.test(String(v).trim()) ? String(v).trim() : '');

function finishesSection() {
  const f = c.finishes;
  return `
<section class="section finishes">
  <div class="container">
    ${sectionHead(f.kicker, f.title, f.lead, { cls: 'center' })}
    <div class="finishes__grid">
      ${f.items.map((x, i) => `
      <article class="finish" data-reveal style="--d:${i * 80}ms">
        <span class="finish__swatch" style="${smallSrc(x.image) ? `background-image:url(${esc(smallSrc(x.image))})` : `background:${cssColor(x.color) || '#29384A'}`}"></span>
        <span class="finish__num">${pad(i + 1)} / ${esc(x.note)}</span>
        <h3>${esc(x.name)}</h3>
      </article>`).join('')}
    </div>
  </div>
</section>`;
}

function service(s) {
  const t = c.servicePage;
  const url = site.url + href(s.slug);
  const img = imageInfo(s.image);
  const related = s.related.map(svc).filter((r) => r && r !== s);
  const linked = (item) => (item.link && svc(item.link) ? ` <a class="more" href="${href(item.link)}">${esc(svc(item.link).name)} ${icon('arrow')}</a>` : '');
  const gallery = s.gallery.filter((g) => imageInfo(g));

  const body = `
<section class="phero phero--short">
  <div class="container center">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span aria-hidden="true">/</span><a href="/services">Services</a><span aria-hidden="true">/</span><span aria-current="page">${esc(s.name)}</span>
    </nav>
    <h1 class="phero__title">
      <span class="eyebrow" data-hero-in>${icon('spark', 'i')} ${esc(s.eyebrow)}</span>
      <span class="phero__h" data-split data-split-now>${mark(s.h1)}</span>
    </h1>
    <p class="lead phero__lead" data-hero-in>${esc(s.lead)}</p>
    <div class="cta-row" data-hero-in>
      ${btn(t.button, `/contact?service=${s.slug}`, { size: 'lg' })}
      ${s.feature === 'wrap-slider' ? btn(t.sliderButton, '#wrap-it', { kind: 'ghost', size: 'lg', ico: 'drag' }) : btn(site.phone, tel(), { kind: 'ghost', size: 'lg', ico: 'phone' })}
    </div>
  </div>
</section>

${s.feature === 'wrap-slider' ? wrapSlider() : ''}
${s.feature === 'finishes' ? finishesSection() : ''}

${s.why.items.length ? `<section class="section why">
  <div class="container">
    ${sectionHead(s.name, s.why.title, '', { cls: 'center' })}
    <div class="why__grid why__grid--${s.why.items.length}">
      ${s.why.items.map((w, i) => `
      <article class="why-card" data-spot data-reveal style="--d:${i * 80}ms">
        <span class="why-card__num">${pad(i + 1)}</span>
        <h3>${esc(w.title)}</h3>
        <p>${esc(w.text)}${linked(w)}</p>
      </article>`).join('')}
    </div>
  </div>
</section>` : ''}

${s.options.items.length ? `<section class="section options">
  <div class="container options__grid">
    <div class="options__head">
      ${kicker(t.optionsKicker)}
      <h2 class="display" data-split>${mark(s.options.title)}</h2>
      <div data-reveal>${btn(t.optionsButton, `/contact?service=${s.slug}`, { kind: 'ghost' })}</div>
    </div>
    <ul class="options__list">
      ${s.options.items.map((o, i) => `
      <li class="option" data-reveal style="--d:${i * 70}ms">
        <span class="option__icon">${icon('check')}</span>
        <div><h3>${esc(o.title)}</h3><p>${esc(o.text)}${linked(o)}</p></div>
      </li>`).join('')}
    </ul>
  </div>
</section>` : ''}

${gallery.length > 1 ? `
<section class="section gallery">
  <div class="container">
    <div class="gallery__grid gallery__grid--${Math.min(gallery.length, 4)}">
      ${gallery.map((g, i) => `<figure class="gallery__item" data-reveal style="--d:${i * 80}ms">${picture(g, `${s.name} by Bora Signs in Adelaide`, { sizes: '(min-width: 900px) 40vw, 100vw' })}</figure>`).join('')}
    </div>
  </div>
</section>` : ''}

${quoteBlock(s.quote)}
${processSection(true)}
${faqSection(s.faq, t.faqTitle, t.faqKicker)}

${related.length ? `<section class="section related">
  <div class="container">
    ${sectionHead(t.relatedKicker, t.relatedTitle, '', { cls: 'center' })}
    <div class="related__grid">
      ${related.map((r, i) => `
      <a class="rel" href="${href(r.slug)}" data-reveal style="--d:${i * 70}ms">
        ${picture(r.image, '', { sizes: '(min-width: 900px) 25vw, 50vw' })}
        <span class="rel__name">${esc(r.name)} ${icon('arrow')}</span>
      </a>`).join('')}
    </div>
  </div>
</section>` : ''}

${ctaFinal(s.ctaTitle)}`;

  return {
    slug: s.slug,
    title: s.title || `${s.name} Adelaide | ${site.name}`,
    description: s.description,
    image: img ? img.og : undefined,
    imageSize: img ? img.ogSize : undefined,
    bodyClass: `is-service svc-${s.slug}`,
    ld: [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: s.name,
        serviceType: s.name,
        description: s.description,
        url,
        image: img ? abs(img.og) : undefined,
        provider: { '@id': `${site.url}/#business` },
        areaServed: { '@type': 'City', name: 'Adelaide' },
      },
      breadcrumbLd([['Home', `${site.url}/`], ['Services', `${site.url}/services`], [s.name, url]]),
      ...(s.faq.length ? [faqLd(s.faq)] : []),
    ],
    body,
  };
}

/* ---------- other pages ---------- */

const pageHero = (crumb, eyebrow, title, lead, extra = '') => `
<section class="phero phero--short">
  <div class="container center">
    <nav class="crumbs" aria-label="Breadcrumb">${crumb}</nav>
    <h1 class="phero__title">
      <span class="eyebrow" data-hero-in>${icon('spark', 'i')} ${esc(eyebrow)}</span>
      <span class="phero__h" data-split data-split-now>${mark(title)}</span>
    </h1>
    <p class="lead phero__lead" data-hero-in>${esc(lead)}</p>${extra}
  </div>
</section>`;
const crumbs = (...items) => [`<a href="/">Home</a>`, ...items.map(([label, url]) => (url ? `<a href="${url}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`))].join('<span aria-hidden="true">/</span>');

function servicesPage() {
  const p = c.servicesPage;
  const img = imageInfo(p.image);
  const body = `${pageHero(crumbs(['Services']), p.eyebrow, p.title, p.lead, `
    <div class="cta-row" data-hero-in>${btn(p.button, '/contact', { size: 'lg' })}</div>`)}
${p.groups.map((g) => {
  const list = c.services.filter((s) => s.group === g.key && visible.has(s.slug));
  if (!list.length) return '';
  return `
<section class="section services services--${esc(g.key)}">
  <div class="container">
    ${sectionHead(g.label, g.title, '', { cls: 'center' })}
    <div class="svc-grid svc-grid--3${list.length === 1 ? ' svc-grid--single' : ''}">
      ${list.map((s, i) => serviceCard(s, i)).join('')}
    </div>
  </div>
</section>`;
}).join('')}
${processSection(true)}
${ctaFinal()}`;
  return {
    slug: 'services',
    title: p.seo.title,
    description: p.seo.description,
    image: img ? img.og : undefined,
    imageSize: img ? img.ogSize : undefined,
    bodyClass: 'is-services',
    ld: [breadcrumbLd([['Home', `${site.url}/`], ['Services', `${site.url}/services`]])],
    body,
  };
}

const field = (name, label, { type = 'text', required = false, auto = '', full = false, attrs = '' } = {}) => `
      <label class="field${full ? ' field--full' : ''}">
        <span>${label}${required ? ' <em aria-hidden="true">*</em>' : ''}</span>
        ${type === 'textarea'
          ? `<textarea name="${name}" rows="5"${required ? ' required' : ''}${attrs}></textarea>`
          : `<input type="${type}" name="${name}"${auto ? ` autocomplete="${auto}"` : ''}${required ? ' required' : ''}${attrs}>`}
      </label>`;

const formFoot = (submit) => `
      <div class="form__foot">
        <button class="btn btn--pink btn--lg" type="submit" data-magnetic><span>${esc(submit)}</span>${icon('arrow')}</button>
        <p class="form__status" role="status" aria-live="polite" data-status></p>
      </div>`;

const contactData = () => ` data-phone="${esc(site.phone)}" data-email="${esc(site.email)}"`;

// The quote form posts straight to ShopVox, which files it as a lead in "Online Leads" (files included).
// Field names are ShopVox's; service and suburb are added to the job description by site.js before sending.
// A copy without the files also lands in the panel's inbox, in case ShopVox is down.
const shopvoxForm = (fields, submit) => {
  const sv = c.shopvox;
  const action = `https://api.shopvox.com/v1/sales_leads.json?authToken=${encodeURIComponent(sv.authToken)}&account_id=${encodeURIComponent(sv.accountId)}`;
  return `
    <form class="form" data-form="quote" data-shopvox data-backup="/api/forms/quote" action="${esc(action)}" method="post" enctype="multipart/form-data"${contactData()} novalidate>
      <input type="hidden" name="pipeline_name" value="${esc(sv.pipeline)}">
      <input type="hidden" name="title" value="${esc(sv.title)}">
      <input type="hidden" name="lead_source_name" value="${esc(sv.leadSource)}">
      <input type="hidden" name="on_success" value="/thank-you">
      <label class="hp" aria-hidden="true">Leave this empty<input type="text" name="vox_protection" tabindex="-1" autocomplete="off"></label>
      <div class="form__grid">${fields}</div>${formFoot(submit)}
    </form>`;
};

// Forms that land in the panel's inbox (and, with a Web3Forms key, also in the team's email)
const inboxForm = (kind, subject, fields, submit, thanks) => {
  const key = String(c.forms.web3formsKey || '').trim();
  return `
    <form class="form" data-form="${kind}" data-inbox action="/api/forms/${kind}" method="post"${key ? ` data-web3forms="${esc(key)}"` : ''} data-subject="${esc(subject)}" data-thanks="${esc(thanks)}"${contactData()} novalidate>
      <label class="hp" aria-hidden="true">Leave this empty<input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label>
      <div class="form__grid">${fields}</div>${formFoot(submit)}
    </form>`;
};

function contactPage() {
  const p = c.contact;
  const list = c.services.filter((s) => visible.has(s.slug));
  const options = list.map((s) => `<option value="${s.slug}">${esc(s.name)}</option>`).join('');
  const viaShopvox = !!(c.shopvox && c.shopvox.authToken && c.shopvox.accountId);
  const n = viaShopvox
    ? { name: 'primaryContactName', phone: 'phone_number', message: 'details' }
    : { name: 'name', phone: 'phone', message: 'message' };
  const fields = `
      ${field(n.name, 'Your name', { required: true, auto: 'name' })}
      ${field('email', 'Email', { type: 'email', required: true, auto: 'email' })}
      ${field(n.phone, 'Phone', { type: 'tel', auto: 'tel' })}
      ${viaShopvox ? field('company_name', 'Company name', { auto: 'organization' }) : ''}
      ${field('suburb', 'Suburb', { auto: 'address-level2', full: !viaShopvox })}
      <label class="field${viaShopvox ? '' : ' field--full'}">
        <span>What do you need?</span>
        <select name="service" data-service>
          <option value="">Choose a service</option>${options}<option value="other">Something else</option>
        </select>
      </label>
      ${field(n.message, 'Tell us about your project', { type: 'textarea', required: true, full: true, attrs: ` placeholder="${esc(p.placeholder)}" data-message` })}
      ${viaShopvox ? `<label class="field field--full field--file">
        <span>Upload files (optional)</span>
        <input type="file" name="asset[]" multiple>
        <small>${esc(p.filesHint)}</small>
      </label>` : ''}`;
  const body = `${pageHero(crumbs(['Contact']), p.eyebrow, p.title, p.lead)}
<section class="section contact">
  <div class="container contact__grid">
    <div class="contact__form" data-reveal>
      <h2 class="h3">${esc(p.formTitle)}</h2>
      ${viaShopvox ? shopvoxForm(fields, p.submit) : inboxForm('quote', 'New quote request from the website', fields, p.submit, c.thanks.title)}
    </div>
    <aside class="contact__side" data-reveal>
      <a class="contact__card" href="${tel()}">${icon('phone')}<span><small>Call us</small><strong>${esc(site.phone)}</strong></span></a>
      <a class="contact__card" href="${mailto()}">${icon('mail')}<span><small>Email</small><strong>${esc(site.email)}</strong></span></a>
      <a class="contact__card" href="${link(site.mapUrl)}" target="_blank" rel="noopener">${icon('pin')}<span><small>Workshop</small><strong>${address()}</strong></span></a>
      <div class="contact__social"><p>${esc(p.follow)}</p><div class="socials">${socialLinks()}</div></div>
      <div class="contact__mascot">${markSvg('mark mark--contact')}</div>
    </aside>
  </div>
</section>
${processSection(true)}`;
  return {
    slug: 'contact',
    title: p.seo.title,
    description: p.seo.description,
    image: c.seo.ogImage || '/assets/img/og-image.jpg',
    bodyClass: 'is-contact',
    ld: [breadcrumbLd([['Home', `${site.url}/`], ['Contact', `${site.url}/contact`]])],
    body,
  };
}

function joinPage() {
  const p = c.join;
  const img = imageInfo(p.image);
  const fields = `
      ${field('name', 'Your name', { required: true, auto: 'name' })}
      ${field('email', 'Email', { type: 'email', required: true, auto: 'email' })}
      ${field('phone', 'Phone', { type: 'tel', required: true, auto: 'tel' })}
      ${field('suburb', 'Suburb', { auto: 'address-level2' })}
      ${p.skills.length ? `<fieldset class="field field--full">
        <legend>Your experience</legend>
        <div class="checks">${p.skills.map((k) => `<label class="check"><input type="checkbox" name="experience" value="${esc(k)}"><span>${esc(k)}</span></label>`).join('')}</div>
      </fieldset>` : ''}
      ${p.workTypes.length ? `<label class="field field--full">
        <span>What are you looking for?</span>
        <select name="work_type">${p.workTypes.map((k) => `<option>${esc(k)}</option>`).join('')}</select>
      </label>` : ''}
      ${field('message', 'Tell us a bit about yourself', { type: 'textarea', required: true, full: true })}`;
  const body = `${pageHero(crumbs(['Join us']), p.eyebrow, p.title, p.lead)}
<section class="section join">
  <div class="container join__grid">
    <div class="join__copy">
      <div class="join__block" data-reveal>
        <h2 class="h3">${esc(p.whoTitle)}</h2>
        <p>${esc(p.whoText)}</p>
        ${p.skills.length ? `<ul class="ticks">${p.skills.map((k) => `<li>${icon('check')}${esc(k)}</li>`).join('')}</ul>` : ''}
      </div>
      <div class="join__block" data-reveal>
        <h2 class="h3">${esc(p.lookTitle)}</h2>
        ${p.look.length ? `<ul class="ticks">${p.look.map((k) => `<li>${icon('check')}${esc(k)}</li>`).join('')}</ul>` : ''}
        ${p.lookNote ? `<p>${esc(p.lookNote)}</p>` : ''}
      </div>
      ${p.steps.length ? `<div class="join__block" data-reveal>
        <h2 class="h3">${esc(p.stepsTitle)}</h2>
        <ol class="join__steps">
          ${p.steps.map((k) => `<li>${esc(k)}</li>`).join('\n          ')}
        </ol>
      </div>` : ''}
    </div>
    <div class="join__form" data-reveal>
      <h2 class="h3">${esc(p.formTitle)}</h2>
      ${inboxForm('join', 'New job application from the website', fields, p.submit, p.thanks)}
    </div>
  </div>
</section>`;
  return {
    slug: 'join-us',
    title: p.seo.title,
    description: p.seo.description,
    image: img ? img.og : undefined,
    imageSize: img ? img.ogSize : undefined,
    bodyClass: 'is-join',
    ld: [breadcrumbLd([['Home', `${site.url}/`], ['Join us', `${site.url}/join-us`]])],
    body,
  };
}

function simplePage(slug, p, buttons, bodyClass, title, description) {
  const body = `
<section class="phero phero--404">
  <div class="container center">
    <div class="nf__mark">${markSvg('mark mark--404')}</div>
    <h1 class="phero__title"><span class="eyebrow">${slug === 'thank-you' ? `${icon('check', 'i')} ` : ''}${esc(p.eyebrow)}</span><span class="phero__h">${mark(p.title)}</span></h1>
    <p class="lead phero__lead">${esc(p.lead)}</p>
    <div class="cta-row">${buttons}</div>
  </div>
</section>`;
  return { slug, title, description, bodyClass, noindex: true, body };
}

const thankYou = () => simplePage('thank-you', c.thanks, `${btn('Back to home', '/')}${btn(site.phone, tel(), { kind: 'ghost', ico: 'phone' })}`, 'is-thanks', `Thank you | ${site.name}`, 'Your quote request has been received.');
const notFound = () => simplePage('404', c.notFound, `${btn('Back to home', '/')}${btn('All services', '/services', { kind: 'ghost' })}`, 'is-404', `Page not found | ${site.name}`, 'This page could not be found.');

/* ---------- blog ---------- */

export const today = () => new Date().toISOString().slice(0, 10);
function publishedPosts() {
  const now = today();
  return c.posts
    .filter((p) => p.status === 'published' && (!p.date || p.date <= now))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}
const niceDate = (d) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d || '')) return '';
  const [y, m, day] = d.split('-').map(Number);
  return `${day} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]} ${y}`;
};
const excerpt = (p) => p.excerpt || plain(p.body).slice(0, 180).replace(/\s+\S*$/, '…');

function blogIndex() {
  const b = c.blog;
  const posts = publishedPosts();
  const body = `${pageHero(crumbs(['Blog']), b.eyebrow, b.title, b.lead)}
<section class="section blog">
  <div class="container">
    ${posts.length ? `<div class="posts">
      ${posts.map((p, i) => `
      <a class="post-card" href="/blog/${p.slug}" data-reveal style="--d:${(i % 3) * 80}ms">
        <div class="post-card__media">${imageInfo(p.cover) ? picture(p.cover, p.coverAlt, { sizes: '(min-width: 900px) 33vw, 100vw' }) : markSvg('mark mark--post')}</div>
        <div class="post-card__body">
          ${p.date ? `<time datetime="${p.date}">${niceDate(p.date)}</time>` : ''}
          <h2 class="post-card__title">${esc(p.title)}</h2>
          <p>${esc(excerpt(p))}</p>
          <span class="post-card__go">${esc(b.readMore)} ${icon('arrow')}</span>
        </div>
      </a>`).join('')}
    </div>` : `<p class="lead center">${esc(b.empty)}</p>`}
  </div>
</section>
${ctaFinal()}`;
  return {
    slug: 'blog',
    title: b.seo.title,
    description: b.seo.description,
    image: c.seo.ogImage || '/assets/img/og-image.jpg',
    bodyClass: 'is-blog',
    noindex: !posts.length,
    ld: [breadcrumbLd([['Home', `${site.url}/`], ['Blog', `${site.url}/blog`]])],
    body,
  };
}

function blogPost(p) {
  const url = `${site.url}/blog/${p.slug}`;
  const img = imageInfo(p.cover);
  const more = publishedPosts().filter((x) => x !== p).slice(0, 3);
  const body = `
<article class="article">
  <header class="phero phero--short phero--post">
    <div class="container center">
      <nav class="crumbs" aria-label="Breadcrumb">${crumbs(['Blog', '/blog'], [p.title])}</nav>
      <h1 class="phero__title">
        ${p.date ? `<span class="eyebrow" data-hero-in>${icon('cal', 'i')} <time datetime="${p.date}">${niceDate(p.date)}</time></span>` : ''}
        <span class="phero__h phero__h--post" data-split data-split-now>${esc(p.title)}</span>
      </h1>
      ${p.excerpt ? `<p class="lead phero__lead" data-hero-in>${esc(p.excerpt)}</p>` : ''}
    </div>
  </header>
  ${img ? `<div class="container article__cover" data-reveal>${picture(p.cover, p.coverAlt, { sizes: '(min-width: 1100px) 1000px, 100vw', eager: true })}</div>` : ''}
  <div class="container narrow prose" data-reveal>
    ${sanitize(p.body)}
  </div>
</article>
${more.length ? `<section class="section blog blog--more">
  <div class="container">
    ${sectionHead(c.blog.footerLabel || 'Blog', 'More from the *blog.*', '', { cls: 'center' })}
    <div class="posts">
      ${more.map((x, i) => `
      <a class="post-card" href="/blog/${x.slug}" data-reveal style="--d:${i * 80}ms">
        <div class="post-card__media">${imageInfo(x.cover) ? picture(x.cover, x.coverAlt, { sizes: '(min-width: 900px) 33vw, 100vw' }) : markSvg('mark mark--post')}</div>
        <div class="post-card__body">
          ${x.date ? `<time datetime="${x.date}">${niceDate(x.date)}</time>` : ''}
          <h3 class="post-card__title">${esc(x.title)}</h3>
          <span class="post-card__go">${esc(c.blog.readMore)} ${icon('arrow')}</span>
        </div>
      </a>`).join('')}
    </div>
  </div>
</section>` : ''}
${ctaFinal()}`;
  const description = p.seoDescription || excerpt(p);
  return {
    slug: `blog/${p.slug}`,
    path: `/blog/${p.slug}`,
    title: p.seoTitle || `${p.title} | ${site.name}`,
    description,
    image: img ? img.og : undefined,
    imageSize: img ? img.ogSize : undefined,
    bodyClass: 'is-post',
    ld: [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: p.title,
        description,
        datePublished: p.date || undefined,
        image: img ? abs(img.og) : undefined,
        url,
        author: { '@id': `${site.url}/#business` },
        publisher: { '@id': `${site.url}/#business` },
        mainEntityOfPage: { '@id': `${url}#webpage` },
      },
      breadcrumbLd([['Home', `${site.url}/`], ['Blog', `${site.url}/blog`], [p.title, url]]),
    ],
    body,
  };
}

/* ---------- routing ---------- */

// ctx: { url: site address, noindex, assets: { css, js, lenis, hero3d }, preview }
function use(content, context) {
  c = content;
  ctx = context;
  site = { ...c.company, url: context.url.replace(/\/+$/, ''), noindex: !!context.noindex };
  bySlug = Object.fromEntries(c.services.map((s) => [s.slug, s]));
  visible = new Set(c.services.filter((s) => !s.hidden || context.preview).map((s) => s.slug));
}

const fixed = { '': home, services: servicesPage, contact: contactPage, 'join-us': joinPage, 'thank-you': thankYou };

// The page for a path, or null when there is none (the Worker then answers with notFoundPage)
function pageFor(path) {
  const slug = path.replace(/^\/+|\/+$/g, '');
  if (fixed[slug]) return fixed[slug]();
  if (slug === 'blog' && c.blog.enabled) return blogIndex();
  const post = /^blog\/([a-z0-9-]+)$/.exec(slug);
  if (post && c.blog.enabled) {
    const p = c.posts.find((x) => x.slug === post[1]);
    if (p && (ctx.preview || publishedPosts().includes(p))) return blogPost(p);
    return null;
  }
  const s = svc(slug);
  return s ? service(s) : null;
}

export function render(content, path, context) {
  use(content, context);
  const page = pageFor(path);
  return page ? layout(page) : null;
}

export function renderNotFound(content, context) {
  use(content, context);
  return layout(notFound());
}

// Every public page, for the sitemap and for checking a document before it is published
export function paths(content) {
  const list = ['/', '/services', ...content.services.filter((s) => !s.hidden).map((s) => `/${s.slug}`), '/contact', '/join-us'];
  c = content;
  ctx = ctx || {};
  if (content.blog.enabled) {
    const posts = publishedPosts();
    if (posts.length) list.push('/blog', ...posts.map((p) => `/blog/${p.slug}`));
  }
  return list;
}

export function sitemap(content, context) {
  use(content, context);
  const day = today();
  const prio = (p) => (p === '/' ? '1.0' : p === '/join-us' || p.startsWith('/blog') ? '0.5' : '0.8');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths(content).map((p) => {
  const post = p.startsWith('/blog/') && content.posts.find((x) => `/blog/${x.slug}` === p);
  return `  <url><loc>${esc(site.url + p)}</loc><lastmod>${(post && post.date) || day}</lastmod><priority>${prio(p)}</priority></url>`;
}).join('\n')}
</urlset>
`;
}

export const titleText = unmark;
