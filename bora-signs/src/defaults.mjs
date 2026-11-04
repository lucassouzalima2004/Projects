// The whole site as one content document: every text, list and setting the admin panel (/admin) can change.
// These are the starting values. Once the panel publishes, the published version (stored in Cloudflare KV) wins;
// keys added here later are filled in automatically for documents published before them (see normalize()).
//
// Text marked with *asterisks* is highlighted in pink on the site (it becomes <em>).
// Image fields hold the name of a photo in assets/img/work (images.mjs), a path such as /assets/img/clients/x.png,
// or an uploaded photo from the panel ("m:<id>:<width>x<height>:<format>").

import site from './site.mjs';
import { menu, services, featured, process, reasons, testimonials, homeFaq, finishes } from './content.mjs';

export const SCHEMA = 1;

const clone = (v) => JSON.parse(JSON.stringify(v));

export const defaults = {
  schema: SCHEMA,

  company: {
    name: site.name,
    legalName: site.legalName,
    abn: site.abn,
    tagline: site.tagline,
    description: site.description,
    phone: site.phone,
    phoneIntl: site.phoneIntl,
    email: site.email,
    address: clone(site.address),
    mapUrl: site.mapUrl,
    areaServed: site.areaServed,
    social: { instagram: site.social.instagram, facebook: site.social.facebook, tiktok: site.social.tiktok, youtube: site.social.youtube, linkedin: '' },
  },

  seo: {
    // Official address of the site (canonical links, sitemap). The panel shows it; the workers.dev link stays out of Google.
    siteUrl: site.url,
    ogImage: '/assets/img/og-image.jpg',
    googleSiteVerification: site.googleSiteVerification,
    metaPixelId: site.metaPixelId,
    gaId: '',
  },

  shopvox: clone(site.shopvox),
  // Join Us applications land in the panel inbox. With a Web3Forms key they are also emailed.
  forms: { web3formsKey: '' },

  google: { show: !!site.google, rating: site.google ? site.google.rating : '5.0', url: site.google ? site.google.url : '' },
  stats: clone(site.stats),
  clients: {
    title: 'Trusted by businesses big and small',
    items: site.clients.map((c) => ({ name: c.name, logo: `/assets/img/clients/${c.file}.png` })),
  },

  menu: menu.map((m) => ({
    label: m.label,
    href: m.href || '',
    items: (m.items || []).map(([label, slug]) => ({ label, href: `/${slug}` })),
  })),

  footer: {
    text: 'Vehicle wraps, shopfront signage, window graphics and office signage across Adelaide.',
    ticker: 'Hard to miss',
    popularTitle: 'Popular services',
    popular: ['vehicle-signage', 'shopfront-signage', 'window-graphics', 'office-signage', 'frosted-window-film', 'decor'],
    companyTitle: 'Company',
    company: [
      { label: 'All services', href: '/services' },
      { label: 'Join the team', href: '/join-us' },
      { label: 'Free quote', href: '/contact' },
    ],
    contactTitle: 'Contact',
    baseLine: 'Signwriters in Adelaide, South Australia',
    dockCall: 'Call',
    dockQuote: 'Get a free quote',
  },

  header: { button: 'Free Quote' },

  cta: {
    kicker: 'Ready when you are',
    title: 'Get your free quote.',
    text: 'Whether you have a question, need a quote or want to talk through an idea, our team is ready to help.',
    button: 'Get a free quote',
    call: 'Call',
  },

  process: {
    kicker: 'A simpler signage process',
    title: process.title,
    lead: process.lead,
    steps: clone(process.steps),
  },

  home: {
    seo: {
      title: 'Sign Shop Adelaide | Vehicle Wraps, Shopfront & Office Signage | Bora Signs',
      description: 'Adelaide sign company with 15+ years of experience: vehicle wraps, shopfront signage, window graphics and office signs, designed and installed by one local team.',
    },
    hero: {
      eyebrow: 'Adelaide signwriters',
      title: 'Signage that makes your business *hard to miss.*',
      tagStrong: 'One *less* thing.',
      tagText: 'You run the business.',
      tagEm: 'We’ll handle the signs.',
      lead: 'Vehicle wraps, shopfront signage, window graphics and complete business signage, designed, produced and installed by one Adelaide team.',
      button: 'Start your project',
      trust: ['Design to installation', 'Adelaide-based team', 'Quality materials'],
      // The tasks floating behind the chameleon; their places in the scene are fixed in render.mjs
      cards: [
        { label: 'Payroll', icon: 'users', pink: false },
        { label: 'Staff', icon: 'user', pink: true },
        { label: 'Customers', icon: 'users', pink: false },
        { label: 'Opening date', icon: 'cal', pink: true },
        { label: 'Emails', icon: 'mail', pink: false },
        { label: 'Stock', icon: 'box', pink: true },
        { label: 'Scheduling', icon: 'clock', pink: false },
      ],
      sign: 'Signage',
    },
    intro: {
      kicker: 'Built through reputation',
      title: 'The sign company you don’t have to chase.',
      text: 'Signage should make running your business easier, not give you one more supplier to follow up. Bora Signs brings design, production and installation together, with straightforward advice and clear communication from the first enquiry to the final install.',
      button: 'Talk to our team',
    },
    services: {
      kicker: 'Our signage services',
      title: 'Made to get your business *noticed.*',
      lead: 'Everything your business needs to be seen, on the road, on the street and inside your space.',
      featured: [...featured],
      moreTitle: 'More ways we can help',
    },
    reasons: {
      kicker: 'Why choose Bora Signs',
      title: 'Details done right, *first time.*',
      items: clone(reasons),
    },
    reviews: {
      kicker: 'Our satisfied clients',
      items: testimonials.map((q) => ({ text: q.text, name: q.name, role: q.role || '' })),
    },
    faq: {
      kicker: 'Frequently asked questions',
      title: 'Common signage questions.',
      items: clone(homeFaq),
    },
  },

  servicePage: {
    button: 'Get a free quote',
    sliderButton: 'Try the wrap slider',
    optionsKicker: 'What we do',
    optionsButton: 'Talk to us about yours',
    faqKicker: 'Frequently asked questions',
    faqTitle: 'Good questions. Clear answers.',
    relatedKicker: 'Keep exploring',
    relatedTitle: 'Related services',
    cardLink: 'Explore',
  },

  services: services.map((s) => ({
    slug: s.slug,
    hidden: false,
    name: s.name,
    short: s.short,
    group: s.group,
    title: s.title,
    description: s.description,
    eyebrow: s.eyebrow,
    h1: s.h1,
    lead: s.lead,
    image: s.image,
    imageAlt: s.imageAlt,
    card: s.card,
    feature: s.feature || '',
    why: clone(s.why),
    options: clone(s.options),
    gallery: [...s.gallery],
    quote: { text: s.quote.text, name: s.quote.name, role: s.quote.role || '' },
    faq: clone(s.faq),
    related: [...s.related],
    ctaTitle: s.feature === 'wrap-slider' ? 'Let’s wrap yours.' : 'Get your free quote.',
  })).map((s) => {
    for (const block of [s.why, s.options]) for (const it of block.items) if (!it.link) it.link = '';
    return s;
  }),

  servicesPage: {
    seo: {
      title: 'Signage Services Adelaide | Vehicle, Shopfront & Office Signs | Bora Signs',
      description: 'Bora Signs services in Adelaide: vehicle and trailer wraps, shopfront and illuminated signs, window graphics, office and reception signs, wall graphics and decor.',
    },
    image: 'shopfront-lp-accounting',
    eyebrow: 'Signage services in Adelaide',
    title: 'Everything your business needs to be seen.',
    lead: 'From vehicle wraps that turn your fleet into moving advertisements to shopfront and office signage that lift your professional image, one team designs, produces and installs it all.',
    button: 'Get a free quote',
    groups: [
      { key: 'exterior', label: 'Exterior', title: 'Outside, where customers *find you.*' },
      { key: 'interior', label: 'Interior', title: 'Inside, where you *win them over.*' },
      { key: 'decor', label: 'Decor', title: 'A fresh finish for your *space.*' },
    ],
  },

  van: {
    min: site.wrapEstimate.min,
    max: site.wrapEstimate.max,
    step: site.wrapEstimate.step,
    tiers: clone(site.wrapEstimate.tiers),
    kicker: 'Before & after',
    title: 'Drag to *wrap* the van.',
    lead: 'From a logo on the door to a full wrap. Slide to see the difference, and what it could cost.',
    button: 'Get my exact quote',
    note: 'Indicative prices for a mid-size van, from {min} for logos and lettering to {max} for a full wrap. Every vehicle, design and film is different, so we confirm the final price in a written quote.',
  },

  finishes: {
    kicker: 'Texture. Tone. Character.',
    title: 'Find your kind of *beautiful.*',
    lead: 'Bring the warmth of timber, the look of stone or a beautifully understated colour into your space.',
    items: finishes.map((f) => ({ name: f.name, note: f.note, image: f.swatch ? `/assets/img/decor/${f.swatch}.webp` : '', color: f.color || '' })),
  },

  contact: {
    seo: {
      title: 'Contact Bora Signs | Free Signage Quote in Adelaide',
      description: 'Get a free signage quote in Adelaide. Call 0482 530 280, email sales@borasigns.com.au or send your project details to Bora Signs in Regency Park, SA.',
    },
    eyebrow: 'Free quote · Adelaide',
    title: 'Let’s make you hard to miss.',
    lead: 'Tell us what you need. Send your logo, photos, measurements or a quick brief and we will come back with straightforward advice and a clear quote.',
    formTitle: 'Request a free quote',
    placeholder: 'Sizes, quantities, vehicle make and model, deadline…',
    filesHint: 'Logos, photos, inspiration, site pics: anything helps.',
    submit: 'Send my request',
    follow: 'Follow our latest installs',
  },

  join: {
    seo: {
      title: 'Join Bora Signs | Vehicle Wrap & Sign Installer Jobs in Adelaide',
      description: 'Join the Bora Signs team in Adelaide. We are building a shortlist of vehicle wrappers, sign installers and production people for casual and full-time work.',
    },
    image: 'install-van-wrap',
    eyebrow: 'Join the Bora Signs team',
    title: 'Good installers are hard to miss too.',
    lead: 'Bora Signs is growing. We are building a shortlist of reliable people for future opportunities in signage installation, vehicle wraps, production and install support.',
    whoTitle: 'Who this is for',
    whoText: 'We may not be hiring right now, but we are always open to meeting quality people who take pride in clean work, show up on time and want to be part of a growing signage business. Experienced installers, subcontractors, casuals and trainees with the right attitude are all welcome.',
    skills: ['Vehicle wrapping', 'Vinyl application', 'Sign installation', 'ACM signage', 'Window graphics', 'Wall graphics', 'Production or install support'],
    lookTitle: 'What we look for',
    look: ['Show up on time', 'Communicate clearly', 'Care about quality', 'Follow instructions', 'Work well in a team', 'Respect clients and job sites', 'Keep things clean and organised', 'Are willing to learn'],
    lookNote: 'Skill matters, but attitude and reliability matter just as much.',
    stepsTitle: 'What happens after you apply?',
    steps: [
      'We review your experience.',
      'If it looks like a fit, we contact you for a quick chat.',
      'We may ask for photos of previous work or references.',
      'If suitable, we may organise a paid trial, casual shift or interview.',
    ],
    formTitle: 'Apply to join the bench',
    workTypes: ['Full-time', 'Casual', 'Subcontract', 'Trainee'],
    submit: 'Send my application',
    thanks: 'Thanks! Your application is in. We’ll be in touch if it looks like a fit.',
  },

  thanks: {
    eyebrow: 'Request received',
    title: 'Thanks! It’s one less thing now.',
    lead: 'Your request is with our team and we’ll get back to you shortly. If it’s urgent, give us a call.',
  },

  notFound: {
    eyebrow: 'Error 404',
    title: 'This page is hard to find.',
    lead: 'Unlike your business will be. The page may have moved when we rebuilt the site.',
  },

  blog: {
    enabled: true,
    seo: {
      title: 'Signage Tips, Projects & News | Bora Signs Adelaide',
      description: 'Signage ideas, recent installs and practical advice for Adelaide businesses from the Bora Signs team.',
    },
    eyebrow: 'Bora Signs blog',
    title: 'Signage tips, projects and *news.*',
    lead: 'Ideas, recent installs and practical advice for Adelaide businesses.',
    footerLabel: 'Blog',
    readMore: 'Read more',
    empty: 'New posts are on their way.',
  },
  posts: [],

  // Old addresses sent to new ones (301), so ads, bookmarks and Google keep landing on the right page
  redirects: [
    { from: '/copy-of-vehicle-signage', to: '/trailer-wrap' },
    { from: '/contact-8', to: '/join-us' },
    { from: '/home', to: '/' },
    { from: '/blank', to: '/' },
  ],
};

// Shapes for list items the panel can add, so new items always have every field
export const templates = {
  service: {
    slug: '', hidden: false, name: '', short: '', group: 'exterior', title: '', description: '', eyebrow: '', h1: '', lead: '',
    image: 'install-building-sign', imageAlt: '', card: '', feature: '',
    why: { title: '', items: [] }, options: { title: '', items: [] }, gallery: [], quote: { text: '', name: '', role: '' },
    faq: [], related: [], ctaTitle: 'Get your free quote.',
  },
  post: {
    id: '', slug: '', status: 'draft', date: '', title: '', excerpt: '', cover: '', coverAlt: '', body: '<p></p>',
    seoTitle: '', seoDescription: '',
  },
};

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

// Fills in anything missing (or of the wrong type) from `base`, so the renderer can trust the document's shape.
function fill(value, base) {
  if (Array.isArray(base)) return Array.isArray(value) ? value : clone(base);
  if (isObj(base)) {
    const out = isObj(value) ? { ...value } : {};
    for (const k of Object.keys(base)) out[k] = fill(out[k], base[k]);
    return out;
  }
  if (typeof base === 'string') return typeof value === 'string' ? value : value == null ? base : String(value);
  if (typeof base === 'number') return typeof value === 'number' && Number.isFinite(value) ? value : Number.isFinite(+value) && value !== '' && value != null ? +value : base;
  if (typeof base === 'boolean') return typeof value === 'boolean' ? value : !!value;
  return value === undefined ? base : value;
}

const listOf = (arr, shape) => (Array.isArray(arr) ? arr.filter(isObj).map((x) => fill(x, shape)) : []);
const strings = (arr) => (Array.isArray(arr) ? arr.filter((x) => typeof x === 'string' || typeof x === 'number').map(String) : []);
const item2 = { title: '', text: '', link: '' };

// Returns a complete, well-shaped content document from whatever was stored (older documents included).
export function normalize(doc) {
  const c = fill(isObj(doc) ? doc : {}, defaults);
  c.schema = SCHEMA;
  c.services = listOf(c.services, templates.service).map((s) => {
    s.why = fill(s.why, { title: '', items: [] });
    s.options = fill(s.options, { title: '', items: [] });
    s.why.items = listOf(s.why.items, item2);
    s.options.items = listOf(s.options.items, item2);
    s.quote = fill(s.quote, { text: '', name: '', role: '' });
    s.faq = listOf(s.faq, { q: '', a: '' });
    s.gallery = strings(s.gallery);
    s.related = strings(s.related);
    s.slug = slugify(s.slug);
    return s;
  }).filter((s) => s.slug);
  c.posts = listOf(c.posts, templates.post).map((p) => ({ ...p, slug: slugify(p.slug) })).filter((p) => p.slug);
  c.menu = listOf(c.menu, { label: '', href: '', items: [] }).map((m) => ({ ...m, items: listOf(m.items, { label: '', href: '' }) }));
  c.footer.popular = strings(c.footer.popular);
  c.footer.company = listOf(c.footer.company, { label: '', href: '' });
  c.home.hero.trust = strings(c.home.hero.trust);
  c.home.hero.cards = listOf(c.home.hero.cards, { label: '', icon: 'users', pink: false });
  c.home.services.featured = strings(c.home.services.featured);
  c.home.reasons.items = listOf(c.home.reasons.items, { title: '', text: '' });
  c.home.reviews.items = listOf(c.home.reviews.items, { text: '', name: '', role: '' });
  c.home.faq.items = listOf(c.home.faq.items, { q: '', a: '' });
  c.process.steps = listOf(c.process.steps, { title: '', text: '' });
  c.stats = listOf(c.stats, { value: 0, suffix: '', label: '' });
  c.clients.items = listOf(c.clients.items, { name: '', logo: '' });
  c.servicesPage.groups = listOf(c.servicesPage.groups, { key: '', label: '', title: '' }).filter((g) => g.key);
  c.van.tiers = listOf(c.van.tiers, { upTo: 1, name: '' }).sort((a, b) => a.upTo - b.upTo);
  c.finishes.items = listOf(c.finishes.items, { name: '', note: '', image: '', color: '' });
  for (const k of ['skills', 'look', 'steps', 'workTypes']) c.join[k] = strings(c.join[k]);
  c.redirects = listOf(c.redirects, { from: '', to: '' }).filter((r) => r.from && r.to);
  return c;
}

export function slugify(s = '') {
  return String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
