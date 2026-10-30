// HTML for every page. build.mjs calls these and writes the files.

import site from './site.mjs';
import images from './images.mjs';
import { mark, word } from './logo.mjs';
import { van } from './van.mjs';
import {
  groups, services, bySlug, featured, process, reasons, testimonials, homeFaq, finishes, work,
} from './content.mjs';

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const href = (slug) => (slug ? `/${slug}` : '/');
const abs = (path) => site.url + path;
const tel = `tel:${site.phoneIntl}`;
const mailto = `mailto:${site.email}`;
const pad = (n) => String(n).padStart(2, '0');
const money = (n) => '$' + n.toLocaleString('en-AU');

/* ---------- small parts ---------- */

const icon = (name, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

const sprite = `<svg class="sprite" aria-hidden="true" focusable="false">
  <symbol id="i-arrow" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 12h15M13 6l6 6-6 6"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M5 3.5h3.2l1.6 4.2-2 1.4a11 11 0 0 0 7.1 7.1l1.4-2 4.2 1.6V19a1.8 1.8 0 0 1-1.9 1.8A16.4 16.4 0 0 1 3.2 5.4 1.8 1.8 0 0 1 5 3.5z"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></g></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></g></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4.5 4.5L19 7.5"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-spark" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1.5c.6 5.4 2.9 8 8.5 8.5-5.6.6-7.9 3.2-8.5 8.5-.6-5.3-2.9-7.9-8.5-8.5 5.6-.5 7.9-3.1 8.5-8.5z"/></symbol>
  <symbol id="i-drag" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M9 6 3 12l6 6M15 6l6 6-6 6"/></symbol>
  <symbol id="i-quote" viewBox="0 0 48 48"><path fill="currentColor" d="M20 10C10.6 13.2 5 20.4 5 29.5 5 35.4 8.6 39 13.3 39c4.3 0 7.4-3.1 7.4-7.3 0-4-2.9-6.9-6.6-7.2.8-4.4 4.2-8.3 9.2-10.4L20 10zm21 0c-9.4 3.2-15 10.4-15 19.5 0 5.9 3.6 9.5 8.3 9.5 4.3 0 7.4-3.1 7.4-7.3 0-4-2.9-6.9-6.6-7.2.8-4.4 4.2-8.3 9.2-10.4L41 10z"/></symbol>
  <symbol id="i-users" viewBox="0 0 24 24"><g fill="currentColor"><circle cx="9" cy="8" r="3.4"/><path d="M2.5 19c.6-3.6 3.3-5.6 6.5-5.6s5.9 2 6.5 5.6z"/><circle cx="16.8" cy="9" r="2.6"/><path d="M15.6 13.5c3 .1 5.3 1.9 5.9 5.5h-4.2c-.3-2.2-.8-3.9-1.7-5.5z"/></g></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><g fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20.5c.7-4.3 3.9-6.6 8-6.6s7.3 2.3 8 6.6z"/></g></symbol>
  <symbol id="i-cal" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke-linecap="round"/></g><g fill="currentColor"><rect x="7" y="13" width="3" height="3" rx=".8"/><rect x="14" y="13" width="3" height="3" rx=".8"/></g></symbol>
  <symbol id="i-box" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.6 20.5 7v10L12 21.4 3.5 17V7zM6 8l6 3.2L18 8l-6-3.1zm-.6 2v6l5.6 2.9v-6z"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></g></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 8h16M4 16h16"/></symbol>
  <symbol id="i-close" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></symbol>
  <symbol id="i-chev" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></symbol>
  <symbol id="i-instagram" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/></g><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></symbol>
  <symbol id="i-facebook" viewBox="0 0 24 24"><path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z"/></symbol>
  <symbol id="i-tiktok" viewBox="0 0 24 24"><path fill="currentColor" d="M16.6 3c.4 2.2 1.8 3.7 4 3.9v3.1a7.4 7.4 0 0 1-4-1.2v6.3A5.9 5.9 0 1 1 10.7 9v3.2a2.8 2.8 0 1 0 2.8 2.9V3h3.1z"/></symbol>
  <symbol id="i-youtube" viewBox="0 0 24 24"><path fill="currentColor" d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z"/></symbol>
</svg>`;

let eyeIds = 0;
// The chameleon mark. Its pupil (.pupil) follows the pointer, see site.js.
export function markSvg(cls = 'mark') {
  const id = `eye-${++eyeIds}`;
  const { eye, pupil } = mark;
  return `<svg class="${cls}" viewBox="${mark.viewBox}" aria-hidden="true" focusable="false">
    <path d="${mark.body}"/>
    <mask id="${id}"><rect width="756" height="414" fill="#fff"/><circle class="pupil" cx="${pupil.cx}" cy="${pupil.cy}" r="${pupil.r}" fill="#000"/></mask>
    <circle class="eyeball" cx="${eye.cx}" cy="${eye.cy}" r="${eye.r}" mask="url(#${id})"/>
  </svg>`;
}

function logo(cls = 'logo') {
  return `<svg class="${cls}" viewBox="-467 0 3025 214" role="img" aria-label="${esc(site.name)}">
    <g fill-rule="evenodd"><path class="logo__mark" d="${word.mark}"/><path class="logo__bora" d="${word.bora}"/><path class="logo__signs" d="${word.signs}"/></g>
  </svg>`;
}

// <picture> with AVIF and WebP at both sizes
export function picture(name, alt, { sizes = '100vw', eager = false, cls = '' } = {}) {
  const img = images[name];
  if (!img) throw new Error(`Unknown image: ${name}`);
  const set = (ext) => img.widths.map((w, i) => `/assets/img/work/${name}-${i ? 1600 : 800}.${ext} ${w}w`).join(', ');
  return `<picture${cls ? ` class="${cls}"` : ''}>
    <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
    <img src="/assets/img/work/${name}-800.webp" srcset="${set('webp')}" sizes="${sizes}" width="${img.w}" height="${img.h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">
  </picture>`;
}

const btn = (label, url, { kind = 'pink', size = '', ico = 'arrow', attrs = '' } = {}) =>
  `<a class="btn btn--${kind}${size ? ` btn--${size}` : ''}" href="${url}"${attrs} data-magnetic><span>${label}</span>${ico ? icon(ico) : ''}</a>`;

const kicker = (text) => `<p class="kicker"><span class="kicker__dot"></span>${esc(text)}</p>`;

const sectionHead = (k, title, lead = '', { tag = 'h2', cls = '' } = {}) => `
  <header class="section-head ${cls}">
    ${k ? kicker(k) : ''}
    <${tag} class="display" data-split>${title}</${tag}>
    ${lead ? `<p class="lead" data-reveal>${lead}</p>` : ''}
  </header>`;

const socialLinks = () =>
  Object.entries(site.social)
    .filter(([, u]) => u)
    .map(([k, u]) => `<a class="social" href="${u}" target="_blank" rel="noopener" aria-label="${site.name} on ${k[0].toUpperCase() + k.slice(1)}">${icon(k)}</a>`)
    .join('');

/* ---------- header / footer ---------- */

function header(current) {
  const col = (g) => `
      <div class="mega__col">
        <p class="mega__title">${groups[g]}</p>
        <ul>${services.filter((s) => s.group === g).map((s) => `<li><a href="${href(s.slug)}"${s.slug === current ? ' aria-current="page"' : ''}>${esc(s.name)}</a></li>`).join('')}</ul>
      </div>`;
  const mobileGroup = (g) => `
        <p class="menu__group">${groups[g]}</p>
        ${services.filter((s) => s.group === g).map((s) => `<a class="menu__sub" href="${href(s.slug)}">${esc(s.name)}</a>`).join('')}`;
  return `
<header class="hdr" data-hdr>
  <div class="hdr__in">
    <a class="hdr__brand" href="/" aria-label="${esc(site.name)} home">${logo()}</a>
    <nav class="nav" aria-label="Main">
      <div class="nav__item" data-mega>
        <button class="nav__link" type="button" aria-expanded="false" aria-controls="mega">Services ${icon('chev', 'i i--sm')}</button>
        <div class="mega" id="mega">
          <div class="mega__in">
            ${col('exterior')}${col('interior')}
            <div class="mega__col">
              <p class="mega__title">Decor</p>
              <ul><li><a href="/decor">Interior wrapping</a></li><li><a href="/services">All services</a></li></ul>
            </div>
            <a class="mega__feature" href="/vehicle-signage#wrap-it">
              ${picture('van-wrap-omkar', '', { sizes: '260px' })}
              <span class="mega__feature-text"><strong>Wrap a van in one drag</strong><span>See the before and after, and what it could cost.</span></span>
            </a>
          </div>
        </div>
      </div>
      <a class="nav__link" href="/vehicle-signage"${current === 'vehicle-signage' ? ' aria-current="page"' : ''}>Vehicle wraps</a>
      <a class="nav__link" href="/#work">Our work</a>
      <a class="nav__link" href="/decor"${current === 'decor' ? ' aria-current="page"' : ''}>Decor</a>
      <a class="nav__link" href="/contact"${current === 'contact' ? ' aria-current="page"' : ''}>Contact</a>
    </nav>
    <div class="hdr__actions">
      <a class="hdr__phone" href="${tel}" aria-label="Call ${site.phone}">${icon('phone')}<span aria-hidden="true">${site.phone}</span></a>
      ${btn('Free quote', '/contact', { kind: 'pink', size: 'sm', ico: '' })}
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu" data-burger>
        <span></span><span></span>
      </button>
    </div>
  </div>
</header>
<div class="menu" id="menu" data-menu hidden>
  <nav class="menu__in" aria-label="Mobile">
    <a class="menu__link" href="/">Home</a>
    <a class="menu__link" href="/services">Services</a>
    <div class="menu__groups">${mobileGroup('exterior')}${mobileGroup('interior')}</div>
    <a class="menu__link" href="/decor">Decor</a>
    <a class="menu__link" href="/#work">Our work</a>
    <a class="menu__link" href="/join-us">Join us</a>
    <a class="menu__link" href="/contact">Contact</a>
    <div class="menu__foot">
      <a class="btn btn--pink btn--lg" href="/contact"><span>Get a free quote</span>${icon('arrow')}</a>
      <a class="menu__phone" href="${tel}">${icon('phone')} ${site.phone}</a>
      <div class="socials">${socialLinks()}</div>
    </div>
  </nav>
</div>`;
}

function footer() {
  const popular = ['vehicle-signage', 'shopfront-signage', 'window-graphics', 'office-signage', 'frosted-window-film', 'decor'];
  const year = new Date().getFullYear();
  return `
<footer class="ftr">
  <div class="ftr__ticker" aria-hidden="true"><div class="ftr__ticker-track">${'<span>Hard to miss</span>'.repeat(8)}</div></div>
  <div class="container ftr__grid">
    <div class="ftr__brand">
      <a href="/" aria-label="${esc(site.name)} home">${logo('logo logo--ftr')}</a>
      <p>${esc(site.tagline)} Vehicle wraps, shopfront signage, window graphics and office signage across Adelaide.</p>
      <div class="socials">${socialLinks()}</div>
    </div>
    <div>
      <p class="ftr__title">Popular services</p>
      <ul class="ftr__list">${popular.map((s) => `<li><a href="${href(s)}">${esc(bySlug[s].name)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <p class="ftr__title">Company</p>
      <ul class="ftr__list">
        <li><a href="/services">All services</a></li>
        <li><a href="/#work">Our work</a></li>
        <li><a href="/join-us">Join the team</a></li>
        <li><a href="/contact">Free quote</a></li>
      </ul>
    </div>
    <div>
      <p class="ftr__title">Contact</p>
      <ul class="ftr__list ftr__contact">
        <li><a href="${tel}">${icon('phone')}${site.phone}</a></li>
        <li><a href="${mailto}">${icon('mail')}${site.email}</a></li>
        <li><a href="${site.mapUrl}" target="_blank" rel="noopener">${icon('pin')}${esc(site.address.street)}, ${esc(site.address.locality)} ${site.address.region} ${site.address.postcode}</a></li>
      </ul>
    </div>
  </div>
  <div class="container ftr__base">
    <p>© ${year} ${esc(site.legalName)} · ABN ${site.abn}</p>
    <p>Signwriters in Adelaide, South Australia</p>
  </div>
</footer>
<div class="dock" data-dock>
  <a class="dock__call" href="${tel}">${icon('phone')}<span>Call</span></a>
  <a class="dock__quote" href="/contact">Get a free quote ${icon('arrow')}</a>
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
    sameAs: Object.values(site.social).filter(Boolean),
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
  if (!site.metaPixelId) return '';
  return `<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
f.addEventListener('load',function(){t=b.createElement(e);t.async=!0;t.src=v;b.head.appendChild(t)})}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${site.metaPixelId}');fbq('track','PageView');
</script>
<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${site.metaPixelId}&ev=PageView&noscript=1"></noscript>`;
}

export function layout({ slug, title, description, image, imageSize, body, ld = [], bodyClass = '', head = '', noindex = false, assets }) {
  const url = slug === '404' ? `${site.url}/404` : site.url + href(slug === 'index' ? '' : slug);
  const ogImage = abs(image || '/assets/img/og-image.jpg');
  const [ogW, ogH] = imageSize || [1200, 630];
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '' : `<link rel="canonical" href="${url}">`}
<meta name="robots" content="${noindex || site.noindex ? 'noindex' : 'index, follow, max-image-preview:large'}">
<meta name="theme-color" content="#0d0614">
${site.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(site.googleSiteVerification)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="en_AU">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="${ogW}">
<meta property="og:image:height" content="${ogH}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script>document.documentElement.classList.add('js')</script>
<link rel="preload" href="/assets/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
${head}
<link rel="stylesheet" href="/assets/css/site.css?v=${assets.css}">
<script src="/assets/js/lenis.min.js?v=${assets.lenis}" defer></script>
<script src="/assets/js/site.js?v=${assets.js}" defer></script>
${slug === 'index' ? `<script src="/assets/js/hero3d.js?v=${assets.hero3d}" defer></script>` : ''}
${noindex ? '' : jsonLd({ url, title, description, image: ogImage }, ld)}
${pixel()}
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

const ctaFinal = (title = 'Get your free quote.') => `
<section class="cta-final">
  <div class="container center">
    <div class="cta-final__mark" data-reveal>${markSvg('mark mark--mascot')}</div>
    ${kicker('Ready when you are')}
    <h2 class="mega-type" data-split>${title}</h2>
    <p class="lead" data-reveal>Whether you have a question, need a quote or want to talk through an idea, our team is ready to help.</p>
    <div class="cta-row" data-reveal>
      ${btn('Get a free quote', '/contact', { size: 'lg' })}
      ${btn(`Call ${site.phone}`, tel, { kind: 'ghost', size: 'lg', ico: 'phone' })}
    </div>
  </div>
</section>`;

const processSection = (compact = false) => `
<section class="section process${compact ? ' process--compact' : ''}" id="process">
  <div class="container">
    ${sectionHead('A simpler signage process', process.title, process.lead, { cls: 'center' })}
    <div class="steps-wrap" data-steps>
    <div class="steps__line" aria-hidden="true"><span></span></div>
    <ol class="steps">
      ${process.steps.map((s, i) => `
      <li class="step" data-reveal style="--d:${i * 90}ms">
        <span class="step__num">${pad(i + 1)}</span>
        <h3 class="step__title">${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </li>`).join('')}
    </ol>
    </div>
  </div>
</section>`;

const faqSection = (faq, title = 'Good questions. Clear answers.') => `
<section class="section faq">
  <div class="container narrow">
    ${sectionHead('Frequently asked questions', title, '', { cls: 'center' })}
    <div class="faq__list">
      ${faq.map((f) => `
      <details class="faq__item" data-reveal>
        <summary><span>${esc(f.q)}</span><span class="faq__icon">${icon('plus')}</span></summary>
        <div class="faq__a"><p>${esc(f.a)}</p></div>
      </details>`).join('')}
    </div>
  </div>
</section>`;

const quoteBlock = (q) => `
<section class="section testimonial">
  <figure class="container narrow center quote" data-reveal>
    ${icon('quote', 'quote__icon')}
    <blockquote><p>${esc(q.text)}</p></blockquote>
    <figcaption><strong>${esc(q.name)}</strong>${q.role ? `<span>${esc(q.role)}</span>` : ''}</figcaption>
  </figure>
</section>`;

const clientsSection = () => `
<section class="clients" aria-labelledby="clients-title">
  <p class="clients__title" id="clients-title">Trusted by businesses big and small</p>
  <div class="clients__row">
    <div class="clients__track">
      ${[0, 1].map((k) => site.clients.map((c) => `<span class="client"${k ? ' aria-hidden="true"' : ''}><img src="/assets/img/clients/${c.file}.png" alt="${k ? '' : esc(c.name)}" loading="lazy" decoding="async"></span>`).join('')).join('')}
    </div>
  </div>
</section>`;

const serviceCard = (s, i, { big = false } = {}) => `
  <a class="svc${big ? ' svc--big' : ''}" href="${href(s.slug)}" data-spot data-reveal style="--d:${(i % 4) * 80}ms">
    <div class="svc__media">${picture(s.image, s.imageAlt, { sizes: big ? '(min-width: 900px) 50vw, 100vw' : '(min-width: 900px) 33vw, 100vw' })}</div>
    <div class="svc__body">
      <span class="svc__num">${pad(i + 1)}</span>
      <h3 class="svc__title">${esc(s.name)}</h3>
      <p>${esc(s.card)}</p>
      <span class="svc__go">${s.feature === 'wrap-slider' ? 'Try the wrap slider' : 'Explore'} ${icon('arrow')}</span>
    </div>
  </a>`;

/* ---------- home campaign panel ---------- */

// The tasks a business owner juggles, floating around the chameleon. x/y place each card in the panel (%),
// z is how far it floats toward the viewer, r and ty tilt it; mx/my are the places on a narrow panel (phones),
// where cards without them are left out.
const campaignCards = [
  { label: 'Payroll', icon: 'users', x: 57, y: 20, z: 60, r: -3, ty: 14, mx: 23, my: 44 },
  { label: 'Staff', icon: 'user', tone: 'pink', x: 55, y: 39, z: 90, r: 2, ty: 16, mx: 21, my: 60 },
  { label: 'Customers', icon: 'users', x: 53, y: 55, z: 70, r: -2, ty: 14, mx: 23, my: 76 },
  { label: 'Opening date', icon: 'cal', tone: 'pink', x: 55, y: 71, z: 110, r: 3, ty: 12 },
  { label: 'Emails', icon: 'mail', x: 87, y: 37, z: 80, r: 3, ty: -16 },
  { label: 'Stock', icon: 'box', tone: 'pink', x: 86, y: 55, z: 100, r: -2, ty: -14 },
  { label: 'Scheduling', icon: 'clock', x: 84, y: 72, z: 70, r: 2, ty: -12, mx: 77, my: 75 },
];

function campaign() {
  const card = (c, i) => `
      <div class="card${c.mx == null ? ' card--wide-only' : ''}" style="--x:${c.x}%;--y:${c.y}%;--z:${c.z}px;--r:${c.r}deg;--ty:${c.ty}deg;${c.mx != null ? `--mx:${c.mx}%;--my:${c.my}%;` : ''}--in:${0.5 + i * 0.09}s;--dur:${5 + (i % 3) * 1.3}s">
        <div class="card__in">
          <span class="card__icon${c.tone === 'pink' ? ' card__icon--pink' : ''}">${icon(c.icon)}</span>
          <span class="card__text"><b>${c.label}</b><span></span><span></span></span>
        </div>
      </div>`;
  return `<div class="camp-wrap" data-hero-camp>
      <div class="camp" data-camp>
        <div class="camp__bg" aria-hidden="true"><span class="camp__neon"></span><span class="camp__glow"></span></div>
        <div class="camp__back" data-camp-stage-back aria-hidden="true"><span class="camp__ring"></span></div>
        <div class="camp__copy">
          <p class="camp__title">One <span class="camp__less">less</span> thing<span class="camp__dot">.</span></p>
          <p class="camp__sub">You run the business. <strong>We’ll handle the signs.</strong></p>
        </div>
        <div class="camp__cham" aria-hidden="true">
          <img class="camp__img" src="/assets/img/hero/chameleon.webp" width="504" height="819" alt="" fetchpriority="high" decoding="async">
          <canvas class="camp__gl" data-cham3d data-color="/assets/img/hero/chameleon.webp" data-depth="/assets/img/hero/chameleon-depth.png"></canvas>
        </div>
        <div class="camp__stage" data-camp-stage aria-hidden="true">
          ${campaignCards.map(card).join('')}
          <div class="card card--sign" style="--x:81%;--y:14%;--z:120px;--r:-16deg;--ty:-10deg;--mx:68%;--my:40%;--in:1.2s;--dur:4.6s">
            <div class="card__in"><span class="card__check">${icon('check')}</span><b>Signage</b></div>
          </div>
        </div>
        <canvas class="camp__shards" data-shards aria-hidden="true"></canvas>
        <div class="camp__brand">${logo('logo logo--camp')}<span>Signage without the stress.</span></div>
      </div>
    </div>`;
}

// Google's "G", for the rating under the home headline
const googleG = `<svg class="grating__g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>`;

/* ---------- home ---------- */

export function home() {
  const tickerItems = ['Vehicle wraps', 'Shopfront signs', 'Window graphics', 'Office signage', 'Neon & illuminated', 'Wall graphics', 'Trailer wraps', 'Frosted film', 'Mesh banners'];
  const ticker = (items) => items.map((t) => `<span>${t}</span>${icon('spark', 'i ticker__spark')}`).join('');
  const rest = services.filter((s) => !featured.includes(s.slug));

  const body = `
<section class="hero2">
  <div class="container hero2__grid">
    <div class="hero2__copy">
      <span class="eyebrow" data-hero-in>${icon('spark', 'i')} Adelaide signwriters</span>
      <h1 class="hero2__h" data-split data-split-now>Signage that makes your business <em>hard to miss.</em></h1>
      <p class="lead hero2__lead" data-hero-in>Vehicle wraps, shopfront signage, window graphics and complete business signage, designed, produced and installed by one Adelaide team.</p>
      <div class="hero2__cta" data-hero-in>
        ${btn('Start your project', '/contact', { size: 'lg' })}
        ${btn(site.phone, tel, { kind: 'ghost', size: 'lg', ico: 'phone' })}
      </div>
      <ul class="hero2__trust" data-hero-in>
        <li>${icon('check')}Design to installation</li>
        <li>${icon('check')}Adelaide-based team</li>
        <li>${icon('check')}Quality materials</li>
      </ul>
      ${site.google ? `<a class="grating" href="${site.google.url}" target="_blank" rel="noopener" data-hero-in>
        ${googleG}<strong>${site.google.rating}</strong><span class="grating__stars" aria-hidden="true">★★★★★</span><span>on Google</span>
      </a>` : ''}
    </div>
    ${campaign()}
  </div>
</section>

<div class="ticker" aria-hidden="true">
  <div class="ticker__row"><div class="ticker__track" data-ticker>${ticker(tickerItems)}${ticker(tickerItems)}</div></div>
  <div class="ticker__row ticker__row--alt"><div class="ticker__track" data-ticker data-dir="-1">${ticker([...tickerItems].reverse())}${ticker([...tickerItems].reverse())}</div></div>
</div>

<section class="section intro" id="intro">
  <div class="container narrow center">
    <div class="mascot" data-reveal>${markSvg('mark mark--mascot')}</div>
    ${kicker('Built through reputation')}
    <h2 class="display" data-split>The sign company you don’t have to chase.</h2>
    <p class="lead" data-reveal>Signage should make running your business easier, not give you one more supplier to follow up. Bora Signs brings design, production and installation together, with straightforward advice and clear communication from the first enquiry to the final install.</p>
    <ul class="stats">
      ${site.stats.map((s, i) => `<li class="stat" data-reveal style="--d:${i * 100}ms"><strong><span data-count="${s.value}">${s.value}</span>${s.suffix}</strong><span>${esc(s.label)}</span></li>`).join('')}
    </ul>
    <div data-reveal>${btn('Talk to our team', '/contact', { kind: 'ghost' })}</div>
  </div>
</section>

<section class="section services" id="services">
  <div class="container">
    ${sectionHead('Our signage services', 'Made to get your business <em>noticed.</em>', 'Everything your business needs to be seen, on the road, on the street and inside your space.', { cls: 'center' })}
    <div class="svc-grid">
      ${featured.map((slug, i) => serviceCard(bySlug[slug], i, { big: true })).join('')}
    </div>
    <div class="svc-more" data-reveal>
      <p class="svc-more__title">More ways we can help</p>
      <div class="chips">
        ${rest.map((s) => `<a class="chip" href="${href(s.slug)}">${esc(s.name)} ${icon('arrow')}</a>`).join('')}
      </div>
    </div>
  </div>
</section>
${processSection()}

<section class="work" id="work" data-hscroll>
  <div class="work__sticky">
    <div class="container work__head">
      ${kicker('Recent work')}
      <h2 class="display" data-split>Hard to miss, all over Adelaide.</h2>
    </div>
    <div class="work__viewport">
      <div class="work__track" data-track>
        ${work.map((w, i) => `
        <a class="work-card${images[w.img].h > images[w.img].w ? ' work-card--tall' : ''}" href="${href(w.link)}" style="--i:${i}">
          ${picture(w.img, `${w.title}: ${w.tag.toLowerCase()} by Bora Signs`, { sizes: '(min-width: 900px) 34vw, 80vw' })}
          <span class="work-card__cap"><span class="work-card__tag">${esc(w.tag)}</span><strong>${esc(w.title)}</strong></span>
        </a>`).join('')}
        <a class="work-card work-card--next" href="/contact">
          <span class="work-card__next">${markSvg('mark')}<strong>Your business next?</strong><span>Get a free quote ${icon('arrow')}</span></span>
        </a>
      </div>
    </div>
    <div class="container work__bar" aria-hidden="true"><span data-work-progress></span></div>
  </div>
</section>

<section class="section reasons">
  <div class="container">
    ${sectionHead('Why choose Bora Signs', 'Details done right, <em>first time.</em>', '', { cls: 'center' })}
    <div class="reasons__grid">
      ${reasons.map((r, i) => `
      <article class="reason" data-spot data-reveal style="--d:${i * 80}ms">
        <span class="reason__num">${pad(i + 1)}</span>
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.text)}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

${clientsSection()}

<section class="section reviews" data-reviews>
  <div class="container narrow center">
    ${kicker('Our satisfied clients')}
    <div class="reviews__stage">
      ${testimonials.map((q, i) => `
      <figure class="quote review${i === 0 ? ' is-active' : ''}" data-review aria-hidden="${i === 0 ? 'false' : 'true'}">
        ${icon('quote', 'quote__icon')}
        <blockquote><p>${esc(q.text)}</p></blockquote>
        <figcaption><strong>${esc(q.name)}</strong>${q.role ? `<span>${esc(q.role)}</span>` : ''}</figcaption>
      </figure>`).join('')}
    </div>
    <div class="reviews__dots" role="tablist" aria-label="Testimonials">
      ${testimonials.map((q, i) => `<button type="button" role="tab" aria-selected="${i === 0}" aria-label="Testimonial ${i + 1}" data-review-dot="${i}"></button>`).join('')}
    </div>
  </div>
</section>

${faqSection(homeFaq, 'Common signage questions.')}
${ctaFinal()}`;

  return {
    slug: 'index',
    title: 'Sign Shop Adelaide | Vehicle Wraps, Shopfront & Office Signage | Bora Signs',
    description:
      'Adelaide sign company with 15+ years of experience: vehicle wraps, shopfront signage, window graphics and office signs, designed and installed by one local team.',
    image: '/assets/img/og-image.jpg',
    bodyClass: 'is-home',
    ld: [faqLd(homeFaq)],
    body,
  };
}

/* ---------- service pages ---------- */

function wrapSlider() {
  const w = site.wrapEstimate;
  return `
<section class="section wrapcalc-sec" id="wrap-it">
  <div class="container">
    ${sectionHead('Before & after', 'Drag to <em>wrap</em> the van.', 'From a logo on the door to a full wrap. Slide to see the difference, and what it could cost.', { cls: 'center' })}
  </div>
  <div class="container wrapcalc" data-wrapcalc data-min="${w.min}" data-max="${w.max}" data-step="${w.step}" data-tiers='${esc(JSON.stringify(w.tiers))}'>
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
      <div class="wrapcalc__stat"><span>Package</span><strong data-tier>Partial wrap</strong></div>
      <div class="wrapcalc__stat wrapcalc__stat--price"><span>Indicative price</span><strong><small>from</small> <span data-price>${money(Math.round((w.min + w.max) / 2))}</span></strong></div>
      <a class="btn btn--pink" data-quote href="/contact?service=vehicle-signage" data-magnetic><span>Get my exact quote</span>${icon('arrow')}</a>
    </div>
    <div class="wrapcalc__meter" aria-hidden="true">
      <span class="wrapcalc__fill" data-meter></span>
      ${w.tiers.map((t, i) => `<span class="wrapcalc__tick" style="--at:${i ? w.tiers[i - 1].upTo : 0}"><b>${esc(t.name)}</b></span>`).join('')}
    </div>
    <p class="wrapcalc__note">Indicative prices for a mid-size van, from ${money(w.min)} for logos and lettering to ${money(w.max)} for a full wrap. Every vehicle, design and film is different, so we confirm the final price in a written quote.</p>
  </div>
</section>`;
}

function finishesSection() {
  return `
<section class="section finishes">
  <div class="container">
    ${sectionHead('Texture. Tone. Character.', 'Find your kind of <em>beautiful.</em>', 'Bring the warmth of timber, the look of stone or a beautifully understated colour into your space.', { cls: 'center' })}
    <div class="finishes__grid">
      ${finishes.map((f, i) => `
      <article class="finish" data-reveal style="--d:${i * 80}ms">
        <span class="finish__swatch" style="${f.swatch ? `background-image:url(/assets/img/decor/${f.swatch}.webp)` : `background:${f.color}`}"></span>
        <span class="finish__num">${pad(i + 1)} / ${esc(f.note)}</span>
        <h3>${esc(f.name)}</h3>
      </article>`).join('')}
    </div>
  </div>
</section>`;
}

export function service(s) {
  const url = site.url + href(s.slug);
  const img = images[s.image];
  const related = s.related.map((r) => bySlug[r]);
  const linked = (item) => (item.link ? ` <a class="more" href="${href(item.link)}">${esc(bySlug[item.link].name)} ${icon('arrow')}</a>` : '');

  const body = `
<section class="phero">
  <div class="container center">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span aria-hidden="true">/</span><a href="/services">Services</a><span aria-hidden="true">/</span><span aria-current="page">${esc(s.name)}</span>
    </nav>
    <h1 class="phero__title">
      <span class="eyebrow" data-hero-in>${icon('spark', 'i')} ${esc(s.eyebrow)}</span>
      <span class="phero__h" data-split data-split-now>${esc(s.h1)}</span>
    </h1>
    <p class="lead phero__lead" data-hero-in>${esc(s.lead)}</p>
    <div class="cta-row" data-hero-in>
      ${btn('Get a free quote', `/contact?service=${s.slug}`, { size: 'lg' })}
      ${s.feature === 'wrap-slider' ? btn('Try the wrap slider', '#wrap-it', { kind: 'ghost', size: 'lg', ico: 'drag' }) : btn(site.phone, tel, { kind: 'ghost', size: 'lg', ico: 'phone' })}
    </div>
  </div>
  <div class="container">
    <div class="phero__media" data-parallax>
      ${picture(s.image, s.imageAlt, { sizes: '(min-width: 1280px) 1200px, 100vw', eager: true })}
    </div>
  </div>
</section>

${s.feature === 'wrap-slider' ? wrapSlider() : ''}
${s.feature === 'finishes' ? finishesSection() : ''}

<section class="section why">
  <div class="container">
    ${sectionHead(s.name, esc(s.why.title), '', { cls: 'center' })}
    <div class="why__grid why__grid--${s.why.items.length}">
      ${s.why.items.map((w, i) => `
      <article class="why-card" data-spot data-reveal style="--d:${i * 80}ms">
        <span class="why-card__num">${pad(i + 1)}</span>
        <h3>${esc(w.title)}</h3>
        <p>${esc(w.text)}${linked(w)}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

<section class="section options">
  <div class="container options__grid">
    <div class="options__head">
      ${kicker('What we do')}
      <h2 class="display" data-split>${esc(s.options.title)}</h2>
      <div data-reveal>${btn('Talk to us about yours', `/contact?service=${s.slug}`, { kind: 'ghost' })}</div>
    </div>
    <ul class="options__list">
      ${s.options.items.map((o, i) => `
      <li class="option" data-reveal style="--d:${i * 70}ms">
        <span class="option__icon">${icon('check')}</span>
        <div><h3>${esc(o.title)}</h3><p>${esc(o.text)}${linked(o)}</p></div>
      </li>`).join('')}
    </ul>
  </div>
</section>

${s.gallery.length > 1 ? `
<section class="section gallery">
  <div class="container">
    <div class="gallery__grid gallery__grid--${Math.min(s.gallery.length, 4)}">
      ${s.gallery.map((g, i) => `<figure class="gallery__item" data-reveal style="--d:${i * 80}ms">${picture(g, `${s.name} by Bora Signs in Adelaide`, { sizes: '(min-width: 900px) 40vw, 100vw' })}</figure>`).join('')}
    </div>
  </div>
</section>` : ''}

${quoteBlock(s.quote)}
${processSection(true)}
${faqSection(s.faq)}

<section class="section related">
  <div class="container">
    ${sectionHead('Keep exploring', 'Related services', '', { cls: 'center' })}
    <div class="related__grid">
      ${related.map((r, i) => `
      <a class="rel" href="${href(r.slug)}" data-reveal style="--d:${i * 70}ms">
        ${picture(r.image, '', { sizes: '(min-width: 900px) 25vw, 50vw' })}
        <span class="rel__name">${esc(r.name)} ${icon('arrow')}</span>
      </a>`).join('')}
    </div>
  </div>
</section>

${ctaFinal(s.feature === 'wrap-slider' ? 'Let’s wrap yours.' : 'Get your free quote.')}`;

  return {
    slug: s.slug,
    title: s.title,
    description: s.description,
    image: `/assets/img/work/${s.image}.jpg`,
    imageSize: [1200, Math.round((img.h * 1200) / img.w)],
    bodyClass: `is-service svc-${s.slug}`,
    ld: [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: s.name,
        serviceType: s.name,
        description: s.description,
        url,
        image: abs(`/assets/img/work/${s.image}.jpg`),
        provider: { '@id': `${site.url}/#business` },
        areaServed: { '@type': 'City', name: 'Adelaide' },
      },
      breadcrumbLd([['Home', `${site.url}/`], ['Services', `${site.url}/services`], [s.name, url]]),
      faqLd(s.faq),
    ],
    body,
  };
}

/* ---------- other pages ---------- */

export function servicesPage() {
  const body = `
<section class="phero phero--short">
  <div class="container center">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Services</span></nav>
    <h1 class="phero__title">
      <span class="eyebrow" data-hero-in>${icon('spark', 'i')} Signage services in Adelaide</span>
      <span class="phero__h" data-split data-split-now>Everything your business needs to be seen.</span>
    </h1>
    <p class="lead phero__lead" data-hero-in>From vehicle wraps that turn your fleet into moving advertisements to shopfront and office signage that lift your professional image, one team designs, produces and installs it all.</p>
    <div class="cta-row" data-hero-in>${btn('Get a free quote', '/contact', { size: 'lg' })}</div>
  </div>
</section>
${Object.keys(groups).map((g) => `
<section class="section services services--${g}">
  <div class="container">
    ${sectionHead(groups[g], g === 'exterior' ? 'Outside, where customers <em>find you.</em>' : g === 'interior' ? 'Inside, where you <em>win them over.</em>' : 'A fresh finish for your <em>space.</em>', '', { cls: 'center' })}
    <div class="svc-grid svc-grid--3${services.filter((s) => s.group === g).length === 1 ? ' svc-grid--single' : ''}">
      ${services.filter((s) => s.group === g).map((s, i) => serviceCard(s, i)).join('')}
    </div>
  </div>
</section>`).join('')}
${processSection(true)}
${ctaFinal()}`;
  return {
    slug: 'services',
    title: 'Signage Services Adelaide | Vehicle, Shopfront & Office Signs | Bora Signs',
    description:
      'Bora Signs services in Adelaide: vehicle and trailer wraps, shopfront and illuminated signs, window graphics, office and reception signs, wall graphics and decor.',
    image: '/assets/img/work/shopfront-lp-accounting.jpg',
    imageSize: [1200, 675],
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

const formShell = (kind, subject, fields, submit) => `
    <form class="form" data-form="${kind}" ${site.form.endpoint ? `action="${esc(site.form.endpoint)}" method="post"` : `action="${mailto}" method="post"`} data-mailto="${site.email}" novalidate>
      <input type="hidden" name="subject" value="${esc(subject)}">
      ${Object.entries(site.form.fields).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('')}
      <label class="hp" aria-hidden="true">Leave this empty<input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label>
      <div class="form__grid">${fields}</div>
      <div class="form__foot">
        <button class="btn btn--pink btn--lg" type="submit" data-magnetic><span>${submit}</span>${icon('arrow')}</button>
        <p class="form__status" role="status" aria-live="polite" data-status></p>
      </div>
    </form>`;

export function contactPage() {
  const options = services.map((s) => `<option value="${s.slug}">${esc(s.name)}</option>`).join('');
  const fields = `
      ${field('name', 'Your name', { required: true, auto: 'name' })}
      ${field('email', 'Email', { type: 'email', required: true, auto: 'email' })}
      ${field('phone', 'Phone', { type: 'tel', auto: 'tel' })}
      ${field('suburb', 'Suburb', { auto: 'address-level2' })}
      <label class="field field--full">
        <span>What do you need?</span>
        <select name="service" data-service>
          <option value="">Choose a service</option>${options}<option value="other">Something else</option>
        </select>
      </label>
      ${field('message', 'Tell us about your project', { type: 'textarea', required: true, full: true, attrs: ' placeholder="Vehicle make and model, sign size, measurements, deadline…" data-message' })}`;
  const body = `
<section class="phero phero--short">
  <div class="container center">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Contact</span></nav>
    <h1 class="phero__title">
      <span class="eyebrow" data-hero-in>${icon('spark', 'i')} Free quote · Adelaide</span>
      <span class="phero__h" data-split data-split-now>Let’s make you hard to miss.</span>
    </h1>
    <p class="lead phero__lead" data-hero-in>Tell us what you need. Send your logo, photos, measurements or a quick brief and we will come back with straightforward advice and a clear quote.</p>
  </div>
</section>
<section class="section contact">
  <div class="container contact__grid">
    <div class="contact__form" data-reveal>
      <h2 class="h3">Request a free quote</h2>
      ${formShell('quote', 'New quote request from borasigns.com.au', fields, 'Send my request')}
    </div>
    <aside class="contact__side" data-reveal>
      <a class="contact__card" href="${tel}">${icon('phone')}<span><small>Call us</small><strong>${site.phone}</strong></span></a>
      <a class="contact__card" href="${mailto}">${icon('mail')}<span><small>Email</small><strong>${site.email}</strong></span></a>
      <a class="contact__card" href="${site.mapUrl}" target="_blank" rel="noopener">${icon('pin')}<span><small>Workshop</small><strong>${esc(site.address.street)}, ${esc(site.address.locality)} ${site.address.region} ${site.address.postcode}</strong></span></a>
      <div class="contact__social"><p>Follow our latest installs</p><div class="socials">${socialLinks()}</div></div>
      <div class="contact__mascot">${markSvg('mark mark--contact')}</div>
    </aside>
  </div>
</section>
${processSection(true)}`;
  return {
    slug: 'contact',
    title: 'Contact Bora Signs | Free Signage Quote in Adelaide',
    description:
      'Get a free signage quote in Adelaide. Call 0482 530 280, email sales@borasigns.com.au or send your project details to Bora Signs in Welland, SA.',
    image: '/assets/img/og-image.jpg',
    bodyClass: 'is-contact',
    ld: [breadcrumbLd([['Home', `${site.url}/`], ['Contact', `${site.url}/contact`]])],
    body,
  };
}

export function joinPage() {
  const skills = ['Vehicle wrapping', 'Vinyl application', 'Sign installation', 'ACM signage', 'Window graphics', 'Wall graphics', 'Production or install support'];
  const fields = `
      ${field('name', 'Your name', { required: true, auto: 'name' })}
      ${field('email', 'Email', { type: 'email', required: true, auto: 'email' })}
      ${field('phone', 'Phone', { type: 'tel', required: true, auto: 'tel' })}
      ${field('suburb', 'Suburb', { auto: 'address-level2' })}
      <fieldset class="field field--full">
        <legend>Your experience</legend>
        <div class="checks">${skills.map((k) => `<label class="check"><input type="checkbox" name="experience" value="${k}"><span>${k}</span></label>`).join('')}</div>
      </fieldset>
      <label class="field field--full">
        <span>What are you looking for?</span>
        <select name="work_type"><option>Full-time</option><option>Casual</option><option>Subcontract</option><option>Trainee</option></select>
      </label>
      ${field('message', 'Tell us a bit about yourself', { type: 'textarea', required: true, full: true })}`;
  const body = `
<section class="phero phero--short">
  <div class="container center">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Join us</span></nav>
    <h1 class="phero__title">
      <span class="eyebrow" data-hero-in>${icon('spark', 'i')} Join the Bora Signs team</span>
      <span class="phero__h" data-split data-split-now>Good installers are hard to miss too.</span>
    </h1>
    <p class="lead phero__lead" data-hero-in>Bora Signs is growing. We are building a shortlist of reliable people for future opportunities in signage installation, vehicle wraps, production and install support.</p>
  </div>
</section>
<section class="section join">
  <div class="container join__grid">
    <div class="join__copy">
      <div class="join__block" data-reveal>
        <h2 class="h3">Who this is for</h2>
        <p>We may not be hiring right now, but we are always open to meeting quality people who take pride in clean work, show up on time and want to be part of a growing signage business. Experienced installers, subcontractors, casuals and trainees with the right attitude are all welcome.</p>
        <ul class="ticks">${skills.map((k) => `<li>${icon('check')}${k}</li>`).join('')}</ul>
      </div>
      <div class="join__block" data-reveal>
        <h2 class="h3">What we look for</h2>
        <ul class="ticks">${['Show up on time', 'Communicate clearly', 'Care about quality', 'Follow instructions', 'Work well in a team', 'Respect clients and job sites', 'Keep things clean and organised', 'Are willing to learn'].map((k) => `<li>${icon('check')}${k}</li>`).join('')}</ul>
        <p>Skill matters, but attitude and reliability matter just as much.</p>
      </div>
      <div class="join__block" data-reveal>
        <h2 class="h3">What happens after you apply?</h2>
        <ol class="join__steps">
          <li>We review your experience.</li>
          <li>If it looks like a fit, we contact you for a quick chat.</li>
          <li>We may ask for photos of previous work or references.</li>
          <li>If suitable, we may organise a paid trial, casual shift or interview.</li>
        </ol>
      </div>
    </div>
    <div class="join__form" data-reveal>
      <h2 class="h3">Apply to join the bench</h2>
      ${formShell('join', 'New job application from borasigns.com.au', fields, 'Send my application')}
    </div>
  </div>
</section>`;
  return {
    slug: 'join-us',
    title: 'Join Bora Signs | Vehicle Wrap & Sign Installer Jobs in Adelaide',
    description:
      'Join the Bora Signs team in Adelaide. We are building a shortlist of vehicle wrappers, sign installers and production people for casual and full-time work.',
    image: '/assets/img/work/install-van-wrap.jpg',
    imageSize: [1200, 675],
    bodyClass: 'is-join',
    ld: [breadcrumbLd([['Home', `${site.url}/`], ['Join us', `${site.url}/join-us`]])],
    body,
  };
}

export function notFound() {
  const body = `
<section class="phero phero--404">
  <div class="container center">
    <div class="nf__mark">${markSvg('mark mark--404')}</div>
    <h1 class="phero__title"><span class="eyebrow">Error 404</span><span class="phero__h">This page is hard to find.</span></h1>
    <p class="lead phero__lead">Unlike your business will be. The page may have moved when we rebuilt the site.</p>
    <div class="cta-row">${btn('Back to home', '/')}${btn('All services', '/services', { kind: 'ghost' })}</div>
  </div>
</section>`;
  return { slug: '404', title: 'Page not found | Bora Signs', description: 'This page could not be found.', bodyClass: 'is-404', noindex: true, body };
}
