// Local preview of the Grace theme with the PurGrace catalogue.
// Renders the real theme files with LiquidJS and mimics the Shopify objects, the cart API,
// the Section Rendering API, predictive search, recommendations and collection filters.
// It is a development aid: checkout, accounts and apps only exist on Shopify.
//
//   cd dev && npm install && npm run preview     →  http://localhost:9292
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Liquid, Tag, Value } from 'liquidjs';
import { buildStore, imageFromSetting, handleize, setOptionsWithValues, strip } from './data.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const THEME = path.resolve(here, '../theme');
const PORT = Number(process.env.PORT || 9292);
const ORIGIN = `http://localhost:${PORT}`;
const store = buildStore(ORIGIN);

const readJSON = (rel) => JSON.parse(fs.readFileSync(path.join(THEME, rel), 'utf8'));
const locales = { en: readJSON('locales/en.default.json'), 'pt-BR': readJSON('locales/pt-BR.json') };

/* ------------------------------------------------------------------ helpers */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const argsToObject = (args) => {
  const out = {};
  for (const a of args) if (Array.isArray(a) && a.length === 2) out[a[0]] = a[1];
  return out;
};
const formatMoney = (value, { currency = false, trailing = true } = {}) => {
  const amount = Number(value || 0) / 100;
  let s = amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (!trailing && s.endsWith('.00')) s = s.slice(0, -3);
  return `$${s}${currency ? ' AUD' : ''}`;
};
const lookup = (obj, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

/* ------------------------------------------------------------------ settings */
const FONTS = {
  cormorant: { family: 'Cormorant', fallback_families: 'serif' },
  jost: { family: 'Jost', fallback_families: 'sans-serif' },
  newsreader: { family: 'Newsreader', fallback_families: 'serif' },
  figtree: { family: 'Figtree', fallback_families: 'sans-serif' },
};
function fontObject(handle) {
  if (!handle) return null;
  const m = handle.match(/^(.*)_([ni])(\d)$/);
  const base = FONTS[m ? m[1] : handle] || { family: handle, fallback_families: 'sans-serif' };
  return { ...base, weight: m ? Number(m[3]) * 100 : 400, style: m && m[2] === 'i' ? 'italic' : 'normal', 'system?': false, toString() { return base.family; } };
}
function resolveUrl(value) {
  if (!value) return null;
  const m = String(value).match(/^shopify:\/\/(collections|pages|products|blogs)\/(.+)$/);
  return m ? `/${m[1]}/${m[2]}` : value;
}
function resolveSetting(def, raw) {
  const value = raw === undefined ? def.default : raw;
  switch (def.type) {
    case 'collection': return value ? store.collectionsByHandle[value] || null : null;
    case 'product': return value ? store.byHandle[value] || null : null;
    case 'link_list': return value ? store.linklists[value] || null : null;
    case 'image_picker': return imageFromSetting(value);
    case 'page': return value ? store.pages[value] || null : null;
    case 'blog': return value === 'news' ? store.blog : null;
    case 'url': return resolveUrl(value);
    case 'font_picker': return fontObject(value);
    case 'checkbox': return Boolean(value);
    case 'range':
    case 'number': return value == null || value === '' ? null : Number(value);
    default: return value === undefined ? null : value;
  }
}
function themeSettings() {
  const schema = readJSON('config/settings_schema.json');
  const data = readJSON('config/settings_data.json');
  const current = typeof data.current === 'string' ? data.presets[data.current] || {} : data.current || {};
  const out = {};
  for (const group of schema) for (const def of group.settings || []) if (def.id) out[def.id] = resolveSetting(def, current[def.id]);
  return out;
}

/* ------------------------------------------------------------------ sections */
const schemaCache = new Map();
function sectionSchema(type) {
  const file = path.join(THEME, 'sections', `${type}.liquid`);
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  return { src, schema: m ? JSON.parse(m[1]) : { settings: [] } };
}
function sectionObject(type, id, data = {}) {
  const { schema } = sectionSchema(type);
  const settings = {};
  for (const def of schema.settings || []) if (def.id) settings[def.id] = resolveSetting(def, data.settings ? data.settings[def.id] : undefined);
  const blocks = [];
  const order = data.block_order || Object.keys(data.blocks || {});
  for (const bid of order) {
    const b = (data.blocks || {})[bid];
    if (!b || b.disabled) continue;
    const bdef = (schema.blocks || []).find((x) => x.type === b.type) || { settings: [] };
    const bs = {};
    for (const def of bdef.settings || []) if (def.id) bs[def.id] = resolveSetting(def, b.settings ? b.settings[def.id] : undefined);
    blocks.push({ id: bid, type: b.type, settings: bs, shopify_attributes: '' });
  }
  return { id, settings, blocks, location: 'template' };
}

/* ------------------------------------------------------------------ engine */
const engine = new Liquid({
  root: [path.join(THEME, 'snippets')],
  extname: '.liquid',
  strictFilters: true,
  strictVariables: false,
  jsTruthy: false,
  dynamicPartials: true,
  ownPropertyOnly: false,
  cache: false,
});

function parseArgs(str) {
  const parts = [];
  let cur = '';
  let quote = null;
  for (const ch of str) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
    } else if (ch === ',') {
      parts.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}
function rawBlock(name) {
  return class extends Tag {
    constructor(token, remain, liquid) {
      super(token, remain, liquid);
      while (remain.length) {
        const t = remain.shift();
        if (t.name === `end${name}`) return;
      }
      throw new Error(`${name} not closed`);
    }
    render() {}
  };
}
['schema', 'javascript', 'stylesheet', 'doc'].forEach((n) => engine.registerTag(n, rawBlock(n)));
engine.registerTag('layout', class extends Tag {
  render(ctx) {
    ctx.getAll().__layout = this.token.args.replace(/['"]/g, '').trim();
  }
});
engine.registerTag('style', class extends Tag {
  constructor(token, remain, liquid, parser) {
    super(token, remain, liquid);
    this.templates = [];
    while (remain.length) {
      const t = remain.shift();
      if (t.name === 'endstyle') return;
      this.templates.push(parser.parseToken(t, remain));
    }
    throw new Error('style not closed');
  }
  *render(ctx, emitter) {
    const html = yield this.liquid.renderer.renderTemplates(this.templates, ctx);
    emitter.write(`<style data-shopify>${html}</style>`);
  }
});
engine.registerTag('form', class extends Tag {
  constructor(token, remain, liquid, parser) {
    super(token, remain, liquid);
    const parts = parseArgs(token.args);
    this.type = parts.shift().replace(/['"]/g, '');
    this.object = parts.length && !parts[0].includes(':') ? new Value(parts.shift(), liquid) : null;
    this.attrs = parts.map((p) => {
      const i = p.indexOf(':');
      return [p.slice(0, i).trim(), new Value(p.slice(i + 1).trim(), liquid)];
    });
    this.templates = [];
    while (remain.length) {
      const t = remain.shift();
      if (t.name === 'endform') return;
      this.templates.push(parser.parseToken(t, remain));
    }
    throw new Error('form not closed');
  }
  *render(ctx, emitter) {
    const attrs = {};
    for (const [k, v] of this.attrs) attrs[k] = yield v.value(ctx, false);
    const object = this.object ? yield this.object.value(ctx, false) : null;
    const actions = { product: '/cart/add', customer: '/contact#' + (attrs.id || ''), contact: '/contact', localization: '/localization', new_comment: object && object.url ? `${object.url}/comments` : '/comments', storefront_password: '/password' };
    const id = attrs.id || `${this.type}_form${object && object.id ? '_' + object.id : ''}`;
    const extra = Object.entries(attrs)
      .filter(([k]) => k !== 'id')
      .map(([k, v]) => `${k}="${esc(v)}"`)
      .join(' ');
    emitter.write(`<form method="post" action="${actions[this.type] || '/'}" id="${esc(id)}" accept-charset="UTF-8" ${this.type === 'product' ? 'enctype="multipart/form-data" ' : ''}${extra}><input type="hidden" name="form_type" value="${this.type}"><input type="hidden" name="utf8" value="✓">`);
    ctx.push({ form: { errors: null, 'posted_successfully?': false, email: '', set_as_default_checkbox: '<input type="checkbox" name="address[default]" value="1">' } });
    const inner = yield this.liquid.renderer.renderTemplates(this.templates, ctx);
    ctx.pop();
    emitter.write(inner + '</form>');
  }
});
engine.registerTag('paginate', class extends Tag {
  constructor(token, remain, liquid, parser) {
    super(token, remain, liquid);
    const m = token.args.match(/^\s*([\w.]+)\s+by\s+(.+?)\s*$/);
    this.path = m[1];
    this.size = new Value(m[2], liquid);
    this.templates = [];
    while (remain.length) {
      const t = remain.shift();
      if (t.name === 'endpaginate') return;
      this.templates.push(parser.parseToken(t, remain));
    }
    throw new Error('paginate not closed');
  }
  *render(ctx, emitter) {
    const size = Number(yield this.size.value(ctx, false)) || 20;
    const segs = this.path.split('.');
    const prop = segs.pop();
    const parent = segs.length ? lookup(ctx.getAll(), segs.join('.')) : ctx.getAll();
    const all = (parent && parent[prop]) || [];
    const page = Math.max(1, Number(ctx.getAll().current_page) || 1);
    const pages = Math.max(1, Math.ceil(all.length / size));
    const url = (n) => {
      const u = new URL(ctx.getAll().__url, ORIGIN);
      u.searchParams.set('page', n);
      return u.pathname + u.search;
    };
    const parts = [];
    for (let n = 1; n <= pages; n++) parts.push(n === page ? { title: n, is_link: false } : { title: n, is_link: true, url: url(n) });
    const paginate = {
      page_size: size, current_page: page, current_offset: (page - 1) * size, items: all.length, pages, parts,
      previous: page > 1 ? { title: 'Previous', url: url(page - 1), is_link: true } : null,
      next: page < pages ? { title: 'Next', url: url(page + 1), is_link: true } : null,
    };
    const slice = all.slice((page - 1) * size, page * size);
    const scope = { paginate };
    let saved = null;
    if (segs.length && parent) {
      saved = parent[prop];
      parent[prop] = slice;
    } else {
      scope[prop] = Object.assign(slice, all);
    }
    ctx.push(scope);
    const html = yield this.liquid.renderer.renderTemplates(this.templates, ctx);
    ctx.pop();
    if (segs.length && parent) parent[prop] = saved;
    emitter.write(html);
  }
});
engine.registerTag('section', class extends Tag {
  *render(ctx, emitter) {
    const name = this.token.args.replace(/['"]/g, '').trim();
    emitter.write(yield renderSection(name, name, {}, ctx.getAll().__page));
  }
});
engine.registerTag('sections', class extends Tag {
  *render(ctx, emitter) {
    const name = this.token.args.replace(/['"]/g, '').trim();
    const group = readJSON(`sections/${name}.json`);
    let html = '';
    for (const key of group.order) {
      const data = group.sections[key];
      if (data.disabled) continue;
      html += yield renderSection(data.type, `sections--${name}__${key}`, data, ctx.getAll().__page);
    }
    emitter.write(html);
  }
});

/* ------------------------------------------------------------------ filters */
const SVG_PLACEHOLDER = '<svg class="%c" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#efe6df"/></svg>';
const imageSource = (input) => {
  if (!input) return null;
  if (input.__image) return input;
  if (input.preview_image) return input.preview_image;
  if (input.__src) return input.__src;
  return null;
};
const withWidth = (src, w, h) => `${src}${src.includes('?') ? '&' : '?'}width=${w}${h ? `&height=${h}` : ''}`;

engine.registerFilter('t', function (key, ...args) {
  const opts = argsToObject(args);
  const lang = this.context.getAll().__locale || 'en';
  let value = lookup(locales[lang], key) ?? lookup(locales.en, key);
  if (value == null) return `translation missing: ${lang}.${key}`;
  if (typeof value === 'object') value = opts.count === 1 ? value.one ?? value.other : value.other ?? value.one;
  return String(value).replace(/{{\s*(\w+)\s*}}/g, (_, k) => (opts[k] == null ? '' : String(opts[k])));
});
engine.registerFilter('money', (v) => formatMoney(v));
engine.registerFilter('money_with_currency', (v) => formatMoney(v, { currency: true }));
engine.registerFilter('money_without_currency', (v) => (Number(v || 0) / 100).toFixed(2));
engine.registerFilter('money_without_trailing_zeros', (v) => formatMoney(v, { trailing: false }));
engine.registerFilter('asset_url', (name) => `/assets/${name}`);
engine.registerFilter('shopify_asset_url', (name) => `https://cdn.shopify.com/s/shopify/${name}`);
engine.registerFilter('stylesheet_tag', (url) => `<link href="${url}" rel="stylesheet" type="text/css" media="all">`);
engine.registerFilter('image_url', (input, ...args) => {
  const img = imageSource(input);
  if (!img) return '';
  const o = argsToObject(args);
  const w = o.width || (o.height ? Math.round(o.height * img.aspect_ratio) : img.width);
  const url = withWidth(img.src, w, o.height);
  return { __src: img, __width: Math.min(w, img.width), toString() { return url; }, url };
});
engine.registerFilter('image_tag', (input, ...args) => {
  if (!input || !input.__src) return '';
  const img = input.__src;
  const o = argsToObject(args);
  const widths = String(o.widths || '').split(',').map((x) => parseInt(x, 10)).filter((x) => x && x <= img.width);
  const srcset = widths.map((w) => `${withWidth(img.src, w)} ${w}w`).join(', ');
  const width = o.width || input.__width;
  const height = o.height || Math.round(width / img.aspect_ratio);
  const skip = new Set(['widths', 'width', 'height', 'alt', 'preload']);
  const attrs = Object.entries(o).filter(([k]) => !skip.has(k)).map(([k, v]) => `${k}="${esc(v)}"`).join(' ');
  return `<img src="${esc(input.url)}" ${srcset ? `srcset="${srcset}" ` : ''}alt="${esc(o.alt ?? img.alt ?? '')}" width="${width}" height="${height}" ${attrs}>`;
});
engine.registerFilter('placeholder_svg_tag', (name, cls) => SVG_PLACEHOLDER.replace('%c', esc(cls || '')));
engine.registerFilter('payment_type_svg_tag', (type, ...args) => {
  const o = argsToObject(args);
  const label = { american_express: 'AMEX', apple_pay: 'Pay', google_pay: 'G Pay', master: 'MC', paypal: 'PayPal', visa: 'VISA' }[type] || type;
  return `<svg class="${esc(o.class || '')}" viewBox="0 0 38 24" role="img" aria-label="${esc(type)}"><rect width="38" height="24" rx="4" fill="#fff" stroke="#ddd"/><text x="19" y="15.5" font-size="8" font-family="Arial" font-weight="700" text-anchor="middle" fill="#2E211E">${label}</text></svg>`;
});
engine.registerFilter('font_face', () => '');
engine.registerFilter('font_url', () => '');
engine.registerFilter('font_modify', (font) => font);
engine.registerFilter('preload_tag', () => '');
engine.registerFilter('handleize', handleize);
engine.registerFilter('handle', handleize);
engine.registerFilter('link_to', (text, url) => `<a href="${esc(url)}">${text}</a>`);
engine.registerFilter('metafield_tag', (v) => (v && v.value) || v || '');
engine.registerFilter('default_errors', (errors) => (Array.isArray(errors) ? errors.join('<br>') : String(errors || '')));
engine.registerFilter('format_address', (a) => (a ? [a.name, a.address1, a.city, a.province, a.zip, a.country].filter(Boolean).join('<br>') : ''));
engine.registerFilter('time_tag', (value) => {
  const d = new Date(value);
  return `<time datetime="${d.toISOString()}">${d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</time>`;
});
engine.registerFilter('payment_button', () => '<div class="shopify-payment-button"><button type="button" class="shopify-payment-button__button shopify-payment-button__button--unbranded">Buy it now</button></div>');
engine.registerFilter('payment_terms', () => '');
engine.registerFilter('video_tag', () => '<video controls></video>');
engine.registerFilter('external_video_tag', () => '<iframe title="video"></iframe>');
engine.registerFilter('model_viewer_tag', () => '<div class="model"></div>');
engine.registerFilter('structured_data', (obj) => {
  if (!obj) return '{}';
  if (obj.variants) {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': obj.has_only_default_variant ? 'Product' : 'ProductGroup',
      name: obj.title,
      description: strip(obj.description).slice(0, 500),
      brand: { '@type': 'Brand', name: obj.vendor },
      image: obj.featured_media ? obj.featured_media.src : undefined,
      offers: obj.variants.map((v) => ({ '@type': 'Offer', price: (v.price / 100).toFixed(2), priceCurrency: 'AUD', availability: `https://schema.org/${v.available ? 'InStock' : 'OutOfStock'}`, url: ORIGIN + v.url })),
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: obj.title });
});

/* ------------------------------------------------------------------ cart */
const cartState = { items: [], note: '' };
const allVariants = new Map(store.products.flatMap((p) => p.variants.map((v) => [String(v.id), v])));
function cartObject() {
  const items = cartState.items.map((it, i) => {
    const v = allVariants.get(String(it.variant_id));
    const p = v.product;
    return {
      key: `${v.id}:${i}`, id: v.id, variant_id: v.id, product_id: p.id, product: p, variant: v,
      title: p.title, quantity: it.quantity, price: v.price, final_price: v.price, original_price: v.price,
      line_price: v.price * it.quantity, final_line_price: v.price * it.quantity, original_line_price: v.price * it.quantity,
      url: v.url, image: v.featured_media || p.featured_media,
      options_with_values: p._options.map((o, idx) => ({ name: o.name, value: v.options[idx] })),
      properties: it.properties || {}, line_level_discount_allocations: [], selling_plan_allocation: null,
      url_to_remove: `/cart/change?line=${i + 1}&quantity=0`,
    };
  });
  const total = items.reduce((s, i) => s + i.final_line_price, 0);
  return {
    items, item_count: items.reduce((s, i) => s + i.quantity, 0), total_price: total, items_subtotal_price: total, original_total_price: total,
    note: cartState.note, currency: { iso_code: 'AUD', symbol: '$' }, taxes_included: true, cart_level_discount_applications: [], requires_shipping: true, 'empty?': !items.length,
  };
}

/* ------------------------------------------------------------------ filters & search */
const TYPE_RULES = [
  ['Earrings', /earring|ear cuff|hoop|brinco/i], ['Necklaces', /necklace|choker|chain|gargantilha|scapular/i], ['Pendants', /pendant|medal/i],
  ['Rings', /\bring\b/i], ['Bracelets', /bracelet|anklet/i], ['Sets', /\bset\b/i],
];
const typeOf = (p) => (TYPE_RULES.find(([, re]) => re.test(p.title)) || ['Other'])[0];
const materialOf = (p) => (/925|silver/i.test(p.title) ? '925 sterling silver' : '18K gold plated');

function buildFilters(products, query, baseUrl) {
  const params = new URLSearchParams(query);
  const active = (name) => params.getAll(name);
  const urlWith = (fn) => {
    const next = new URLSearchParams(query);
    next.delete('page');
    fn(next);
    const s = next.toString();
    return baseUrl + (s ? `?${s}` : '');
  };
  const listFilter = (label, param, valueOf) => {
    const counts = new Map();
    products.forEach((p) => counts.set(valueOf(p), (counts.get(valueOf(p)) || 0) + 1));
    const values = [...counts.entries()].sort().map(([v, count]) => {
      const isActive = active(param).includes(v);
      return {
        label: v, value: v, param_name: param, count, active: isActive,
        url_to_add: urlWith((n) => n.append(param, v)),
        url_to_remove: urlWith((n) => { const keep = n.getAll(param).filter((x) => x !== v); n.delete(param); keep.forEach((x) => n.append(param, x)); }),
      };
    });
    return { type: 'list', label, param_name: param, values, active_values: values.filter((v) => v.active), presentation: 'text' };
  };
  const max = Math.max(0, ...products.map((p) => p.price));
  const gte = params.get('filter.v.price.gte');
  const lte = params.get('filter.v.price.lte');
  return [
    listFilter('Availability', 'filter.v.availability', (p) => (p.available ? 'In stock' : 'Out of stock')),
    listFilter('Type', 'filter.p.product_type', typeOf),
    listFilter('Material', 'filter.p.m.custom.material', materialOf),
    {
      type: 'price_range', label: 'Price', param_name: 'filter.v.price', range_max: max,
      min_value: { param_name: 'filter.v.price.gte', value: gte ? Math.round(Number(gte) * 100) : null },
      max_value: { param_name: 'filter.v.price.lte', value: lte ? Math.round(Number(lte) * 100) : null },
      url_to_remove: urlWith((n) => { n.delete('filter.v.price.gte'); n.delete('filter.v.price.lte'); }),
      active_values: [], values: [],
    },
  ];
}
function applyFilters(products, query) {
  const params = new URLSearchParams(query);
  let list = products.slice();
  const avail = params.getAll('filter.v.availability');
  if (avail.length) list = list.filter((p) => avail.includes(p.available ? 'In stock' : 'Out of stock'));
  const types = params.getAll('filter.p.product_type');
  if (types.length) list = list.filter((p) => types.includes(typeOf(p)));
  const mats = params.getAll('filter.p.m.custom.material');
  if (mats.length) list = list.filter((p) => mats.includes(materialOf(p)));
  const gte = params.get('filter.v.price.gte');
  const lte = params.get('filter.v.price.lte');
  if (gte) list = list.filter((p) => p.price >= Number(gte) * 100);
  if (lte) list = list.filter((p) => p.price <= Number(lte) * 100);
  const sort = params.get('sort_by');
  const by = {
    'title-ascending': (a, b) => a.title.localeCompare(b.title), 'title-descending': (a, b) => b.title.localeCompare(a.title),
    'price-ascending': (a, b) => a.price - b.price, 'price-descending': (a, b) => b.price - a.price,
    'created-descending': (a, b) => String(b.created_at).localeCompare(String(a.created_at)),
  }[sort];
  if (by) list.sort(by);
  return list;
}
const matchesTerms = (p, q) => q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => `${p.title} ${p.type}`.toLowerCase().includes(w));

/* ------------------------------------------------------------------ rendering */
const PREVIEW_HEAD = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Jost:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">
<script>window.Shopify = { designMode: false, shop: 'purgrace-preview' };</script>`;

function globalsFor(page) {
  const settings = themeSettings();
  const cart = cartObject();
  return {
    settings, shop: store.shop, cart, linklists: store.linklists, collections: store.collections,
    all_products: store.byHandle, pages: store.pages, blogs: { news: store.blog },
    routes: {
      root_url: '/', account_url: '/account', account_login_url: '/account/login', account_logout_url: '/account/logout', account_register_url: '/account/register',
      account_addresses_url: '/account/addresses', collections_url: '/collections', all_products_collection_url: '/collections/all', search_url: '/search',
      predictive_search_url: '/search/suggest', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', cart_update_url: '/cart/update',
      product_recommendations_url: '/recommendations/products',
    },
    request: { page_type: page.type, locale: { iso_code: page.locale === 'pt-BR' ? 'pt-BR' : 'en' }, design_mode: false, origin: ORIGIN, host: `localhost:${PORT}`, path: page.path },
    localization: {
      available_languages: [{ iso_code: 'en', endonym_name: 'English' }, { iso_code: 'pt-BR', endonym_name: 'Português (Brasil)' }],
      language: { iso_code: page.locale === 'pt-BR' ? 'pt-BR' : 'en' },
      available_countries: [{ iso_code: 'AU', name: 'Australia', currency: { iso_code: 'AUD', symbol: '$' } }],
      country: { iso_code: 'AU', name: 'Australia', currency: { iso_code: 'AUD', symbol: '$' } },
    },
    template: { name: page.template, suffix: page.suffix || null, directory: null },
    canonical_url: ORIGIN + page.path, page_title: page.title, page_description: page.description || null, page_image: page.image || null,
    current_page: page.pageNumber || 1, current_tags: null, customer: null, powered_by_link: '<a href="https://www.shopify.com" target="_blank" rel="nofollow">Powered by Shopify</a>',
    content_for_header: PREVIEW_HEAD, additional_checkout_buttons: false, content_for_additional_checkout_buttons: '',
    __page: page, __locale: page.locale, __url: page.path + (page.query ? `?${page.query}` : ''),
    ...page.objects,
  };
}

async function renderSection(type, id, data, page) {
  const { src } = sectionSchema(type);
  const section = sectionObject(type, id, data);
  const tpl = engine.parse(src, path.join(THEME, 'sections', `${type}.liquid`));
  const html = await engine.render(tpl, { section }, { globals: globalsFor(page) });
  return `<div id="shopify-section-${id}" class="shopify-section">${html}</div>`;
}

async function renderTemplate(page) {
  const file = page.template + (page.suffix ? `.${page.suffix}` : '');
  const json = path.join(THEME, 'templates', `${file}.json`);
  let content = '';
  let layout = 'theme';
  if (fs.existsSync(json)) {
    const t = JSON.parse(fs.readFileSync(json, 'utf8'));
    if (t.layout) layout = t.layout;
    for (const key of t.order) {
      const data = t.sections[key];
      if (data.disabled) continue;
      content += await renderSection(data.type, `template--${file}__${key}`, data, page);
    }
  } else {
    const src = fs.readFileSync(path.join(THEME, 'templates', `${file}.liquid`), 'utf8');
    return engine.render(engine.parse(src), {}, { globals: globalsFor(page) });
  }
  const layoutSrc = fs.readFileSync(path.join(THEME, 'layout', `${layout}.liquid`), 'utf8');
  return engine.render(engine.parse(layoutSrc), { content_for_layout: content }, { globals: globalsFor(page) });
}

async function renderSectionById(page, id) {
  if (id.startsWith('template--')) {
    const [, file, key] = id.match(/^template--(.+?)__(.+)$/);
    const t = JSON.parse(fs.readFileSync(path.join(THEME, 'templates', `${file}.json`), 'utf8'));
    return renderSection(t.sections[key].type, id, t.sections[key], page);
  }
  if (id.startsWith('sections--')) {
    const [, group, key] = id.match(/^sections--(.+?)__(.+)$/);
    const g = readJSON(`sections/${group}.json`);
    return renderSection(g.sections[key].type, id, g.sections[key], page);
  }
  return renderSection(id, id, {}, page);
}

/* ------------------------------------------------------------------ routing */
function pageFor(urlPath, query, locale) {
  const params = new URLSearchParams(query);
  const base = { path: urlPath, query, locale, objects: {}, pageNumber: Number(params.get('page')) || 1 };
  const seg = urlPath.split('/').filter(Boolean);
  const home = { ...base, type: 'index', template: 'index', title: 'Brazilian Jewellery Australia | Rommanel Gold Jewellery | PurGrace', description: store.shop.description };
  if (!seg.length) return home;

  if (seg[0] === 'products' || (seg[0] === 'collections' && seg[2] === 'products')) {
    const handle = seg[0] === 'products' ? seg[1] : seg[3];
    const product = store.byHandle[handle];
    if (!product) return null;
    const variantId = params.get('variant');
    const variant = product.variants.find((v) => String(v.id) === variantId) || product.variants.find((v) => v.available) || product.variants[0];
    product.selected_variant = variantId ? variant : null;
    product.selected_or_first_available_variant = variant;
    setOptionsWithValues(product, variant);
    const objects = { product };
    if (seg[0] === 'collections') objects.collection = store.collectionsByHandle[seg[1]];
    return { ...base, type: 'product', template: 'product', title: product.title, description: strip(product.description).slice(0, 160), image: product.featured_media, objects };
  }
  if (seg[0] === 'collections' && seg[1]) {
    const c = store.collectionsByHandle[seg[1]];
    if (!c) return null;
    const filtered = applyFilters(c._all, query);
    const collection = { ...c, products: filtered, products_count: filtered.length, filters: buildFilters(c._all, query, c.url), sort_by: params.get('sort_by') };
    return { ...base, type: 'collection', template: 'collection', title: c.title, description: strip(c.description).slice(0, 160) || null, image: c.image, objects: { collection } };
  }
  if (seg[0] === 'collections') return { ...base, type: 'list-collections', template: 'list-collections', title: 'Collections' };
  if (seg[0] === 'search') {
    const q = (params.get('q') || '').trim();
    const matched = q ? applyFilters(store.products.filter((p) => matchesTerms(p, q)), query) : [];
    const all = q ? store.products.filter((p) => matchesTerms(p, q)) : [];
    const results = matched.map((p) => ({ ...p, object_type: 'product' }));
    const search = { performed: Boolean(q), terms: q, results, results_count: results.length, filters: buildFilters(all, query, '/search'), sort_options: store.collections.all.sort_options, sort_by: params.get('sort_by'), default_sort_by: 'relevance' };
    return { ...base, type: 'search', template: 'search', title: q ? `Search: ${q}` : 'Search', objects: { search } };
  }
  if (seg[0] === 'cart') return { ...base, type: 'cart', template: 'cart', title: 'Your bag' };
  if (seg[0] === 'pages' && store.pages[seg[1]]) {
    const pg = store.pages[seg[1]];
    return { ...base, type: 'page', template: 'page', suffix: store.templateFor[seg[1]] || null, title: pg.title, objects: { page: pg } };
  }
  if (seg[0] === 'policies') {
    const pg = { title: seg[1].replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()), content: store.shop.shipping_policy.body, url: urlPath };
    return { ...base, type: 'page', template: 'page', title: pg.title, objects: { page: pg } };
  }
  if (seg[0] === 'blogs') return { ...base, type: 'blog', template: 'blog', title: store.blog.title, objects: { blog: store.blog } };
  if (seg[0] === 'password') return { ...base, type: 'password', template: 'password', title: 'Opening soon' };
  if (seg[0] === 'gift_card') {
    const gift_card = { balance: 10000, initial_value: 15000, currency: 'AUD', code: 'GRACE-2026-ABCD', enabled: true, expired: false, expires_on: null, pass_url: null };
    return { ...base, type: 'gift_card', template: 'gift_card', title: 'Gift card', objects: { gift_card } };
  }
  return null;
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const buf = Buffer.concat(chunks);
  const type = req.headers['content-type'] || '';
  if (type.includes('application/json')) return JSON.parse(buf.toString() || '{}');
  const out = {};
  const add = (k, v) => {
    if (k.endsWith('[]')) (out[k] = out[k] || []).push(v);
    else out[k] = v;
  };
  if (type.includes('multipart/form-data')) {
    const boundary = type.split('boundary=')[1];
    for (const part of buf.toString().split(`--${boundary}`)) {
      const m = part.match(/name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n$/);
      if (m) add(m[1], m[2]);
    }
  } else {
    for (const [k, v] of new URLSearchParams(buf.toString())) add(k, v);
  }
  return out;
}

async function sectionsPayload(ids, sectionsUrl, locale) {
  if (!ids) return undefined;
  const list = Array.isArray(ids) ? ids : String(ids).split(',');
  const u = new URL(sectionsUrl || '/', ORIGIN);
  const page = pageFor(u.pathname, u.search.slice(1), locale) || pageFor('/', '', locale);
  const out = {};
  for (const id of list.filter(Boolean)) out[id] = await renderSectionById(page, id.trim());
  return out;
}

const MIME = { '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, ORIGIN);
  const query = url.searchParams.toString();
  const locale = url.searchParams.get('locale') === 'pt-BR' || (req.headers.cookie || '').includes('locale=pt-BR') ? 'pt-BR' : 'en';
  const send = (status, body, type = 'text/html; charset=utf-8') => {
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(body);
  };
  try {
    if (url.pathname.startsWith('/assets/')) {
      const file = path.join(THEME, 'assets', path.basename(url.pathname));
      if (!fs.existsSync(file)) return send(404, 'Not found', 'text/plain');
      return send(200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
    }
    if (req.method === 'POST' && url.pathname === '/localization') {
      const body = await readBody(req);
      res.writeHead(302, { Location: body.return_to || req.headers.referer || '/', 'Set-Cookie': `locale=${body.language_code === 'pt-BR' ? 'pt-BR' : 'en'}; Path=/` });
      return res.end();
    }
    if (req.method === 'POST' && url.pathname === '/cart/add') {
      const body = await readBody(req);
      const v = allVariants.get(String(body.id));
      if (!v) return send(422, JSON.stringify({ status: 422, message: 'Cart Error', description: 'Variant not found' }), 'application/json');
      if (!v.available) return send(422, JSON.stringify({ status: 422, message: 'Cart Error', description: 'This item is sold out.' }), 'application/json');
      const properties = {};
      for (const [k, val] of Object.entries(body)) {
        const m = k.match(/^properties\[(.+)\]$/);
        if (m && val) properties[m[1]] = val;
      }
      cartState.items.push({ variant_id: v.id, quantity: Math.max(1, Number(body.quantity) || 1), properties });
      const sections = await sectionsPayload(body.sections, body.sections_url, locale);
      return send(200, JSON.stringify({ id: v.id, quantity: Number(body.quantity) || 1, sections }), 'application/json');
    }
    if (req.method === 'POST' && (url.pathname === '/cart/clear' || url.pathname === '/cart/clear.js')) {
      cartState.items = [];
      cartState.note = '';
      return send(200, JSON.stringify(cartObject(), (k, v) => (k === 'product' || k === 'variant' ? undefined : v)), 'application/json');
    }
    if (req.method === 'POST' && url.pathname === '/cart/change') {
      const body = await readBody(req);
      const i = Number(body.line) - 1;
      if (cartState.items[i]) {
        if (Number(body.quantity) <= 0) cartState.items.splice(i, 1);
        else cartState.items[i].quantity = Number(body.quantity);
      }
      const sections = await sectionsPayload(body.sections, body.sections_url, locale);
      return send(200, JSON.stringify({ item_count: cartObject().item_count, sections }), 'application/json');
    }
    if (req.method === 'POST' && (url.pathname === '/cart/update' || url.pathname === '/cart')) {
      const body = await readBody(req);
      if (body.note != null) cartState.note = body.note;
      if (body['updates[]']) body['updates[]'].forEach((q, i) => cartState.items[i] && (cartState.items[i].quantity = Number(q)));
      cartState.items = cartState.items.filter((it) => it.quantity > 0);
      if ('checkout' in body) return send(200, '<!doctype html><title>Checkout</title><p style="font:18px system-ui;padding:40px">Checkout is handled by Shopify in the real store.</p>');
      if (req.headers.accept && req.headers.accept.includes('json')) return send(200, JSON.stringify({ note: cartState.note }), 'application/json');
      res.writeHead(302, { Location: '/cart' });
      return res.end();
    }
    if (url.pathname === '/search/suggest') {
      const q = (url.searchParams.get('q') || '').trim();
      const products = store.products.filter((p) => matchesTerms(p, q)).slice(0, 6);
      const collections = store.collections.filter((c) => c.title.toLowerCase().includes(q.toLowerCase())).slice(0, 4);
      const page = { ...pageFor('/', '', locale), objects: { predictive_search: { performed: Boolean(q), terms: q, resources: { products, collections, articles: [], pages: [] } } } };
      return send(200, await renderSectionById(page, url.searchParams.get('section_id') || 'predictive-search'));
    }
    if (url.pathname === '/recommendations/products') {
      const product = store.products.find((p) => String(p.id) === url.searchParams.get('product_id'));
      if (!product) return send(404, '');
      const limit = Number(url.searchParams.get('limit')) || 4;
      const pool = (product.collections[0] || store.collections.all)._all.filter((p) => p.id !== product.id && p.available);
      const intent = url.searchParams.get('intent');
      const picks = (intent === 'complementary' ? store.collectionsByHandle.earrings._all.filter((p) => p.id !== product.id) : pool).slice(0, limit);
      const page = { ...pageFor(product.url, '', locale), objects: { product, recommendations: { 'performed?': true, products: picks, products_count: picks.length, intent } } };
      return send(200, await renderSectionById(page, url.searchParams.get('section_id')));
    }
    if (url.pathname === '/cart.js') return send(200, JSON.stringify(cartObject(), (k, v) => (k === 'product' || k === 'variant' ? undefined : v)), 'application/json');
    if (url.pathname.startsWith('/account')) return send(200, '<!doctype html><p style="font:18px system-ui;padding:40px">Customer accounts are hosted by Shopify.</p>');

    const page = pageFor(url.pathname, query, locale);
    if (!page) {
      const nf = { path: url.pathname, query, locale, objects: {}, type: '404', template: '404', title: 'Page not found' };
      return send(404, await renderTemplate(nf));
    }
    const sectionId = url.searchParams.get('section_id');
    if (sectionId) return send(200, await renderSectionById(page, sectionId));
    const sections = url.searchParams.get('sections');
    if (sections) return send(200, JSON.stringify(await sectionsPayload(sections, url.pathname, locale)), 'application/json');
    return send(200, await renderTemplate(page));
  } catch (err) {
    console.error(err);
    send(500, `<pre style="white-space:pre-wrap;font:14px monospace;padding:20px">${esc(err.stack || err.message)}</pre>`);
  }
});

server.listen(PORT, () => console.log(`PurGrace preview on ${ORIGIN}`));
