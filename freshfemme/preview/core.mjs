// Núcleo do preview: emula o essencial da Shopify (objetos, filtros e tags do Liquid)
// sobre os arquivos do tema e os produtos reais salvos em data/.
//
// Não usa nada do Node: o mesmo código roda no servidor local (render.mjs) e no
// navegador, onde a versão publicada da prévia renderiza o carrinho lateral com o
// template de verdade do tema.
//
// Não é uma réplica completa da Shopify; a fonte da verdade continua sendo a loja.
const STORE_FILES = 'https://freshfemme.com.br/cdn/shop/files/';

// LiquidJS não aceita "?" em nomes de propriedade (posted_successfully?, performed?)
const prep = (src) => src.replace(/posted_successfully\?/g, 'posted_successfully_q').replace(/performed\?/g, 'performed_q');
const cents = (v) => (v == null || v === '' ? null : Math.round(parseFloat(v) * 100));

function makeImage(src, { width = 1200, height = 1200, alt = '', id } = {}) {
  if (!src) return null;
  return { src, url: src, width, height, alt, id: id || src, aspect_ratio: width / height, media_type: 'image' };
}
function shopImage(value) {
  if (typeof value !== 'string' || !value.startsWith('shopify://shop_images/')) return null;
  return makeImage(STORE_FILES + value.replace('shopify://shop_images/', ''), { alt: '' });
}

function moneyFmt(c, opts = {}) {
  if (c == null || c === '' || Number.isNaN(Number(c))) return '';
  const s = (Number(c) / 100).toFixed(2).split('.');
  const int = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (opts.currency === false ? '' : 'R$ ') + int + ',' + s[1];
}

function imageURL(img, args) {
  if (!img) return '';
  const src = typeof img === 'string' ? img : img.src || (img.featured_image && img.featured_image.src) || (img.preview_image && img.preview_image.src);
  if (!src) return '';
  const params = Object.fromEntries(args.filter(Array.isArray));
  const u = new URL(src.startsWith('//') ? 'https:' + src : src);
  if (params.width) u.searchParams.set('width', params.width);
  if (params.height) u.searchParams.set('height', params.height);
  return u.toString();
}

function attrs(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== false && v != null && v !== 'nil')
    .map(([k, v]) => (v === true || v === '' ? `${k}` : `${k}="${String(v).replace(/"/g, '&quot;')}"`))
    .join(' ');
}

/**
 * files: mapa { 'sections/header.liquid': '...', 'config/settings_data.json': '...', ... }
 * data:  { products, collections, pages } (mesmo formato de data/*.json)
 * site:  { origin, head } — endereço usado em canonical/og e HTML extra no <head>
 */
export function createPreview({ Liquid, Tag, files, data, site = {} }) {
  const origin = site.origin || 'http://localhost:4000';
  const readJSON = (p) => JSON.parse(files[p].replace(/\/\*[\s\S]*?\*\//, ''));
  const locale = readJSON('locales/pt-BR.default.json');
  const settingsSchema = readJSON('config/settings_schema.json');
  const settingsData = readJSON('config/settings_data.json').current;

  /* ---------------------------------------------------------------- dados */
  const products = {};
  const productsById = {};
  for (const p of data.products) {
    const images = p.images.map((img) => {
      const im = makeImage(img.src, { width: img.width, height: img.height, alt: img.alt || '', id: img.id });
      Object.defineProperty(im, 'preview_image', { enumerable: false, value: im });
      return im;
    });
    const variants = p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      price: cents(v.price),
      compare_at_price: cents(v.compare_at_price),
      available: v.available !== false,
      options: [v.option1, v.option2, v.option3].filter((o) => o != null),
      option1: v.option1,
      sku: v.sku || '',
      url: `/products/${p.handle}?variant=${v.id}`,
      featured_media: null,
    }));
    const prices = variants.map((v) => v.price);
    const first = variants.find((v) => v.available) || variants[0];
    const product = {
      id: p.id,
      title: p.title,
      handle: p.handle,
      url: `/products/${p.handle}`,
      vendor: p.vendor,
      type: p.product_type,
      tags: p.tags,
      description: p.body_html || '',
      content: p.body_html || '',
      price: Math.min(...prices),
      price_min: Math.min(...prices),
      price_max: Math.max(...prices),
      price_varies: Math.min(...prices) !== Math.max(...prices),
      compare_at_price: first.compare_at_price,
      available: variants.some((v) => v.available),
      images,
      media: images,
      featured_image: images[0] || null,
      featured_media: images[0] || null,
      variants,
      options: p.options.map((o) => o.name),
      options_with_values: p.options.map((o, i) => ({ name: o.name, position: i + 1, values: o.values, selected_value: first.options[i] })),
      has_only_default_variant: variants.length === 1 && variants[0].title === 'Default Title',
      selected_or_first_available_variant: first,
      first_available_variant: first,
      template_suffix: p.handle === 'spray-refrescante-para-calores-menopausa-freshfemme' ? 'spray' : '',
    };
    products[p.handle] = product;
    productsById[p.id] = product;
  }

  const collections = {};
  for (const c of data.collections) {
    const list = c.product_handles.map((h) => products[h]).filter(Boolean);
    collections[c.handle] = {
      id: c.id,
      title: c.title,
      handle: c.handle,
      url: `/collections/${c.handle}`,
      description: c.description || '',
      image: c.image ? makeImage(c.image.src, { width: c.image.width, height: c.image.height }) : null,
      featured_image: list[0] ? list[0].featured_image : null,
      products: list,
      products_count: list.length,
      all_products_count: list.length,
      filters: [],
      sort_options: [
        { value: 'manual', name: 'Em destaque' },
        { value: 'best-selling', name: 'Mais vendidos' },
        { value: 'price-ascending', name: 'Menor preço' },
        { value: 'price-descending', name: 'Maior preço' },
        { value: 'created-descending', name: 'Mais recentes' },
      ],
      sort_by: 'manual',
      default_sort_by: 'manual',
    };
  }
  collections.all = { ...collections.frontpage, title: 'Todos os produtos', handle: 'all', url: '/collections/all', description: '', products: Object.values(products), products_count: data.products.length };
  // coleções de cada produto (não enumerável para o `| json` não entrar em loop)
  for (const p of Object.values(products)) {
    Object.defineProperty(p, 'collections', {
      enumerable: false,
      get: () => Object.values(collections).filter((c) => c.handle !== 'all' && c.products.includes(p)),
    });
  }

  const pages = {};
  for (const [handle, p] of Object.entries(data.pages)) pages[handle] = { ...p, url: `/pages/${handle}` };

  const menu = (handle, title, links) => ({ handle, title, links: links.map(([t, url]) => ({ title: t, url, links: [], current: false })) });
  const linklists = {
    'main-menu': menu('main-menu', 'Menu principal', [
      ['Spray Menopausa', '/collections/spray-menopausa-freshfemme'],
      ['Dermocosméticos', '/collections/dermocosmeticos'],
      ['Suplementos', '/collections/suplementos-vivaage-freshfemme'],
      ['Sabonetes Naturais & Veganos', '/collections/sabonetes-naturais-veganos'],
      ['Kits Presentes', '/collections/kits-presentes'],
    ]),
  };
  linklists.footer = linklists['main-menu'];

  /* -------------------------------------------------------- configurações */
  function schemaDefaults(defs = []) {
    const out = {};
    for (const s of defs) if (s.id) out[s.id] = s.default !== undefined ? s.default : s.type === 'checkbox' ? false : null;
    return out;
  }
  function resolveSetting(def, value) {
    if (!def) return value;
    if (value === '' || value == null) {
      if (['product', 'collection', 'image_picker', 'page', 'link_list', 'video_url'].includes(def.type)) return null;
      if (def.type === 'product_list' || def.type === 'collection_list') return Object.assign([], { count: 0 });
      return value;
    }
    switch (def.type) {
      case 'product': return products[value] || null;
      case 'collection': return collections[value] || null;
      case 'page': return pages[value] || null;
      case 'link_list': return linklists[value] || null;
      case 'image_picker': return shopImage(value);
      case 'product_list': { const arr = value.map((h) => products[h]).filter(Boolean); return Object.assign(arr, { count: arr.length }); }
      case 'collection_list': { const arr = value.map((h) => collections[h]).filter(Boolean); return Object.assign(arr, { count: arr.length }); }
      default: return value;
    }
  }
  function resolveSettings(defs, given = {}) {
    const base = { ...schemaDefaults(defs), ...given };
    const byId = Object.fromEntries(defs.filter((d) => d.id).map((d) => [d.id, d]));
    const out = {};
    for (const [k, v] of Object.entries(base)) out[k] = resolveSetting(byId[k], v);
    return out;
  }
  const settings = resolveSettings(settingsSchema.flatMap((g) => g.settings || []), settingsData);
  const fontObj = (family, fallback) => ({ family: `"${family}"`, fallback_families: fallback, weight: 400, style: 'normal' });
  settings.font_display = fontObj('Bricolage Grotesque', 'sans-serif');
  settings.font_body = fontObj('Bricolage Grotesque', 'sans-serif');

  /* --------------------------------------------------------------- liquid */
  function loadSection(type) {
    const src = files[`sections/${type}.liquid`];
    if (src == null) throw new Error(`seção não encontrada: ${type}`);
    const m = src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
    return { src: prep(src), schema: m ? JSON.parse(m[1]) : {} };
  }
  function translate(key, args) {
    let v = key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), locale);
    const params = Object.fromEntries(args.filter(Array.isArray));
    if (v && typeof v === 'object') {
      // regra do português (CLDR): "one" vale para 0 e 1
      const n = Number(params.count);
      v = (n === 0 || n === 1) && v.one ? v.one : v.other;
    }
    if (v == null) return `translation missing: pt-BR.${key}`;
    return String(v).replace(/{{\s*(\w+)\s*}}/g, (_, k) => (params[k] != null ? params[k] : ''));
  }
  function buildSection(id, type, data) {
    const { src, schema } = loadSection(type);
    const blocks = (data.block_order || []).map((bid) => {
      const b = data.blocks[bid];
      const def = (schema.blocks || []).find((x) => x.type === b.type) || { settings: [] };
      return { id: `${id}__${bid}`, type: b.type, settings: resolveSettings(def.settings || [], b.settings || {}), shopify_attributes: '' };
    });
    const section = { id, settings: resolveSettings(schema.settings || [], data.settings || {}), blocks, block_order: data.block_order || [] };
    return { src, schema, section };
  }

  function createEngine() {
    const engine = new Liquid({
      root: ['snippets'],
      extname: '.liquid',
      strictFilters: false,
      strictVariables: false,
      jsTruthy: false,
      relativeReference: false,
      cache: true,
      fs: {
        readFileSync: (f) => prep(files[f]),
        readFile: async (f) => prep(files[f]),
        existsSync: (f) => f in files,
        exists: async (f) => f in files,
        contains: () => true,
        resolve: (root, file, ext) => `${root}/${file}${file.endsWith(ext) ? '' : ext}`,
      },
    });

    const f = engine.registerFilter.bind(engine);
    f('asset_url', (name) => `/assets/${name}?v=${site.version || 'preview'}`);
    f('shopify_asset_url', (name) => `https://cdn.shopify.com/s/shopify/${name}`);
    f('stylesheet_tag', (url) => `<link href="${url}" rel="stylesheet" type="text/css" media="all" />`);
    f('script_tag', (url) => `<script src="${url}"></script>`);
    f('image_url', (img, ...args) => imageURL(img, args));
    f('image_tag', (url, ...args) => {
      const params = Object.fromEntries(args.filter(Array.isArray));
      const a = { src: url, alt: params.alt ?? '' };
      if (params.widths) {
        const base = new URL(url);
        a.srcset = String(params.widths).split(',').map((w) => { base.searchParams.set('width', w.trim()); return `${base.toString()} ${w.trim()}w`; }).join(', ');
      }
      for (const k of ['class', 'loading', 'sizes', 'width', 'height', 'fetchpriority']) if (params[k] != null) a[k] = params[k];
      if (!a.width) a.width = params.width || 1200;
      if (!a.height) a.height = params.height || 1200;
      return `<img ${attrs(a)}>`;
    });
    f('money', (c) => moneyFmt(c));
    f('money_with_currency', (c) => moneyFmt(c) + ' BRL');
    f('money_without_currency', (c) => moneyFmt(c, { currency: false }));
    f('money_without_trailing_zeros', (c) => moneyFmt(c).replace(',00', ''));
    f('t', (key, ...args) => translate(key, args));
    f('handleize', (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    f('font_face', () => '');
    f('font_modify', (font, prop, val) => (font ? { ...font, [prop]: val } : null));
    f('font_url', () => '');
    f('color_extract', (hex, comp) => {
      const h = String(hex).replace('#', '');
      const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
      return { red: (n >> 16) & 255, green: (n >> 8) & 255, blue: n & 255 }[comp] ?? 0;
    });
    f('placeholder_svg_tag', (name, cls) => `<svg class="${cls || ''}" viewBox="0 0 525 525" xmlns="http://www.w3.org/2000/svg"><rect width="525" height="525" fill="#e8f6f4"/><circle cx="262" cy="262" r="80" fill="#cdebe5"/></svg>`);
    f('payment_type_svg_tag', (type) => `<svg viewBox="0 0 38 24" width="38" height="24" role="img" aria-label="${type}"><rect width="38" height="24" rx="4" fill="#fff"/><text x="19" y="15" font-size="7" text-anchor="middle" fill="#1e2a2d" font-family="sans-serif">${String(type).slice(0, 6)}</text></svg>`);
    f('default_errors', () => '');
    f('format_address', (a) => (a ? [a.address1, a.city, a.zip].filter(Boolean).join('<br>') : ''));
    f('external_video_tag', () => '');
    f('video_tag', () => '');
    f('media_tag', () => '');
    f('payment_button', () => '<div class="shopify-payment-button"><button type="button" class="shopify-payment-button__button shopify-payment-button__button--unbranded" data-preview-checkout style="width:100%;color:#fff;border:0;cursor:pointer">Comprar agora</button></div>');
    f('format_code', (s) => s);
    f('structured_data', () => '');
    f('date', (v, ...args) => {
      const d = v === 'now' || v === 'today' ? new Date() : new Date(v);
      const fmtArg = args.find((a) => typeof a === 'string');
      if (args.some(Array.isArray) || fmtArg === undefined) return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      return fmtArg.replace('%Y', d.getFullYear()).replace('%m', String(d.getMonth() + 1).padStart(2, '0')).replace('%d', String(d.getDate()).padStart(2, '0'));
    });
    f('json', (v) => JSON.stringify(v ?? null));

    const skipUntil = (name) => class extends Tag {
      constructor(token, remain, liquid) {
        super(token, remain, liquid);
        while (remain.length) { const t = remain.shift(); if (t.name === name) return; }
      }
      * render() { return ''; }
    };
    engine.registerTag('schema', skipUntil('endschema'));
    engine.registerTag('stylesheet', skipUntil('endstylesheet'));
    engine.registerTag('javascript', skipUntil('endjavascript'));
    engine.registerTag('layout', class extends Tag { * render() { return ''; } });

    function* renderSection(ctx, type, id, data, extraClass) {
      const { src, schema, section } = buildSection(id, type, data);
      ctx.push({ section });
      const html = yield engine.renderer.renderTemplates(engine.parse(src), ctx);
      ctx.pop();
      return `<div id="shopify-section-${id}" class="shopify-section ${extraClass} ${schema.class || ''}">${html}</div>`;
    }
    engine.registerTag('section', class extends Tag {
      constructor(token, remain, liquid) { super(token, remain, liquid); this.type = token.args.trim().replace(/['"]/g, ''); }
      * render(ctx) { return yield renderSection(ctx, this.type, this.type, {}, ''); }
    });
    engine.registerTag('sections', class extends Tag {
      constructor(token, remain, liquid) { super(token, remain, liquid); this.group = token.args.trim().replace(/['"]/g, ''); }
      * render(ctx) {
        const group = readJSON(`sections/${this.group}.json`);
        let out = '';
        for (const key of group.order) {
          const s = group.sections[key];
          out += yield renderSection(ctx, s.type, `sections--${this.group}__${key}`, s, `shopify-section-group-${this.group}`);
        }
        return out;
      }
    });

    const blockTag = (endName, render) => class extends Tag {
      constructor(token, remain, liquid) {
        super(token, remain, liquid);
        this.args = token.args;
        this.tpls = [];
        const stream = liquid.parser.parseStream(remain)
          .on(`tag:${endName}`, () => stream.stop())
          .on('template', (tpl) => this.tpls.push(tpl))
          .on('end', () => { throw new Error(`falta ${endName}`); });
        stream.start();
      }
      * render(ctx, emitter) { yield* render.call(this, ctx, emitter); }
    };
    const actions = { product: '/cart/add', customer: '/contact#newsletter', contact: '/contact', customer_login: '/account/login', create_customer: '/account', recover_customer_password: '/account/recover', guest_login: '/account/login', customer_address: '/account/addresses', storefront_password: '/password', activate_customer_password: '/account/activate', reset_customer_password: '/account/reset' };
    engine.registerTag('form', blockTag('endform', function* (ctx, emitter) {
      const m = this.args.match(/^\s*'([^']+)'\s*(.*)$/);
      const type = m[1];
      const rest = m[2].replace(/^,\s*/, '');
      const a = { method: 'post', 'accept-charset': 'UTF-8', action: actions[type] || '/' };
      // atributos: chave: valor (chaves podem ter hífen)
      const re = /([a-zA-Z_][\w-]*)\s*:\s*('(?:[^']*)'|"(?:[^"]*)"|[\w.]+)/g;
      let mm;
      while ((mm = re.exec(rest))) {
        let val = mm[2];
        if (/^['"]/.test(val)) val = val.slice(1, -1);
        else val = yield engine.evalValue(val, ctx);
        a[mm[1]] = val;
      }
      ctx.push({ form: { posted_successfully_q: false, errors: null, email: '', name: '', body: '', phone: '' } });
      emitter.write(`<form ${attrs(a)} data-form-type="${type}"><input type="hidden" name="form_type" value="${type}" /><input type="hidden" name="utf8" value="✓" />`);
      yield engine.renderer.renderTemplates(this.tpls, ctx, emitter);
      emitter.write('</form>');
      ctx.pop();
    }));
    engine.registerTag('paginate', blockTag('endpaginate', function* (ctx, emitter) {
      ctx.push({ paginate: { pages: 1, current_page: 1, parts: [], previous: null, next: null, items: 0 } });
      yield engine.renderer.renderTemplates(this.tpls, ctx, emitter);
      ctx.pop();
    }));
    return engine;
  }

  /* ----------------------------------------------------------- carrinho */
  function cartObject(lines) {
    const items = lines.map((l, i) => {
      const p = productsById[l.product_id];
      if (!p) return null;
      const v = p.variants.find((x) => String(x.id) === String(l.variant_id)) || p.variants[0];
      return {
        id: v.id, key: `${v.id}:1`, product_id: p.id, variant_id: v.id, product: p, variant: v, title: p.title, quantity: l.quantity,
        price: v.price, final_price: v.price, original_price: v.price, line_price: v.price * l.quantity, final_line_price: v.price * l.quantity,
        original_line_price: (v.compare_at_price || v.price) * l.quantity, image: p.featured_image, url: v.url, url_to_remove: `/cart/change?line=${i + 1}&quantity=0`,
        line_level_discount_allocations: [],
      };
    }).filter(Boolean);
    return {
      items, item_count: items.reduce((s, i) => s + i.quantity, 0), total_price: items.reduce((s, i) => s + i.final_line_price, 0),
      original_total_price: items.reduce((s, i) => s + i.line_price, 0), cart_level_discount_applications: [], note: '', currency: { iso_code: 'BRL' },
    };
  }
  function findVariant(id) {
    for (const p of Object.values(products)) {
      const v = p.variants.find((x) => String(x.id) === String(id));
      if (v) return { product: p, variant: v };
    }
    return null;
  }

  /* -------------------------------------------------------------- rotas */
  function route(urlPath) {
    const u = new URL(urlPath, 'http://localhost');
    const parts = u.pathname.replace(/\.html$/, '').replace(/\/+$/, '').split('/').filter(Boolean);
    if (!parts.length || parts[0] === 'index') return { template: 'index', page_type: 'index' };
    if (parts[0] === 'products' && products[parts[1]]) {
      const product = products[parts[1]];
      const view = u.searchParams.get('view') || product.template_suffix;
      return { template: 'product', suffix: view && files[`templates/product.${view}.json`] ? view : '', page_type: 'product', product };
    }
    if (parts[0] === 'collections' && parts[1] && collections[parts[1]]) return { template: 'collection', page_type: 'collection', collection: collections[parts[1]] };
    if (parts[0] === 'collections') return { template: 'list-collections', page_type: 'list-collections' };
    if (parts[0] === 'cart') return { template: 'cart', page_type: 'cart' };
    if (parts[0] === 'search') return { template: 'search', page_type: 'search', q: u.searchParams.get('q'), all: u.searchParams.has('all') };
    if (parts[0] === 'pages' && parts[1] === 'contact') return { template: 'page', suffix: 'contact', page_type: 'page', page: pages.contact };
    if (parts[0] === 'pages' && pages[parts[1]]) return { template: 'page', page_type: 'page', page: pages[parts[1]] };
    if (parts[0] === 'account' && parts[1] === 'register') return { template: 'customers/register', page_type: 'customers/register' };
    if (parts[0] === 'account') return { template: 'customers/login', page_type: 'customers/login' };
    if (parts[0] === 'password') return { template: 'password', page_type: 'password', layout: 'password' };
    return { template: '404', page_type: '404' };
  }

  function globalsFor(urlPath, r, cart) {
    let results = [];
    if (r.all) results = Object.values(products);
    else if (r.q) results = Object.values(products).filter((p) => p.title.toLowerCase().includes(r.q.toLowerCase()));
    results = results.map((p) => Object.assign(Object.create(p), p, { object_type: 'product' }));
    return {
      settings,
      shop: { name: 'FreshFemme', url: origin, description: 'Cosmética de resultado', money_format: 'R$ {{amount_with_comma_separator}}', customer_accounts_enabled: true, enabled_payment_types: ['visa', 'master', 'pix', 'elo', 'hipercard'], password_message: 'Estamos preparando novidades.', checkout: { guest_login: false } },
      routes: { root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', cart_update_url: '/cart/update', search_url: '/search', predictive_search_url: '/search/suggest', all_products_collection_url: '/collections/all', account_url: '/account', account_login_url: '/account/login', account_register_url: '/account/register', account_logout_url: '/account/logout', account_addresses_url: '/account/addresses', product_recommendations_url: '/recommendations/products' },
      request: { locale: { iso_code: 'pt-BR' }, page_type: r.page_type, origin, path: urlPath, design_mode: false },
      template: { name: r.template.replace('customers/', ''), suffix: r.suffix || null, directory: r.template.includes('/') ? 'customers' : null },
      canonical_url: origin + urlPath,
      page_title: r.product ? r.product.title : r.collection ? r.collection.title : r.page ? r.page.title : 'FreshFemme - Cosmética de Resultado',
      page_description: 'Alívio imediato dos fogachos, dermocosméticos premiados e suplementos para mulheres 40+.',
      page_image: null,
      current_page: 1,
      cart,
      collections,
      all_products: products,
      linklists,
      pages,
      product: r.product || null,
      collection: r.collection || null,
      page: r.page || null,
      blog: null,
      customer: null,
      recommendations: { performed_q: false, products: [], products_count: 0 },
      search: { performed: !!(r.q || r.all), terms: r.q || '', results, results_count: results.length },
      additional_checkout_buttons: false,
      content_for_additional_checkout_buttons: '',
    };
  }

  // Section Rendering API (ex.: /?sections=cart-drawer)
  async function renderSections(urlPath, ids, cart = cartObject([])) {
    const r = route(urlPath);
    const engine = createEngine();
    const globals = globalsFor(urlPath, r, cart);
    const out = {};
    for (const id of ids) out[id] = await engine.parseAndRender(`{% section '${id}' %}`, {}, { globals });
    return out;
  }

  async function renderRoute(urlPath, { cart = cartObject([]) } = {}) {
    const r = route(urlPath);
    const engine = createEngine();
    const globals = globalsFor(urlPath, r, cart);
    const tplJSON = readJSON(`templates/${r.template}${r.suffix ? '.' + r.suffix : ''}.json`);
    let content = '';
    for (const key of tplJSON.order) {
      const s = tplJSON.sections[key];
      const { src, schema, section } = buildSection(`template--preview__${key}`, s.type, s);
      const html = await engine.parseAndRender(src, { section }, { globals });
      content += `<div id="shopify-section-${section.id}" class="shopify-section ${schema.class || ''}">${html}</div>`;
    }
    const layout = prep(files[`layout/${tplJSON.layout || r.layout || 'theme'}.liquid`]);
    const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&display=swap" rel="stylesheet">';
    const html = await engine.parseAndRender(layout, { content_for_layout: content, content_for_header: fonts + (site.head || '') }, { globals });
    return { html, route: r };
  }

  return { store: { products, collections, pages, productsById }, settings, cartObject, findVariant, route, renderRoute, renderSections };
}
