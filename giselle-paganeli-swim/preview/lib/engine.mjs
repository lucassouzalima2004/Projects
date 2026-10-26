// A small Shopify-flavoured Liquid renderer built on liquidjs. It renders the real theme files
// (layout, JSON templates, sections, snippets, locales) so the preview and the Shopify theme never
// drift apart. Runs in Node (static build) and in the browser (cart, filters, search in the preview).
import { Liquid, Tag, Hash, evalToken } from 'liquidjs';

const SCHEMA_RE = /\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/;

// Shopify allows `?` at the end of some property names (form.posted_successfully?).
const prepare = (source) => source.replace(/posted_successfully\?/g, 'posted_successfully');

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const kwargs = (args) => {
  const named = {};
  const positional = [];
  args.forEach((arg) => {
    if (Array.isArray(arg) && arg.length === 2 && typeof arg[0] === 'string') named[arg[0]] = arg[1];
    else positional.push(arg);
  });
  return { named, positional };
};

export const handleize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function formatMoney(cents, format = '€{{amount_with_comma_separator}}') {
  const value = (Number(cents) || 0) / 100;
  const parts = value.toFixed(2).split('.');
  const thousands = (sep) => parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const amounts = {
    amount: `${thousands(',')}.${parts[1]}`,
    amount_no_decimals: thousands(','),
    amount_with_comma_separator: `${thousands('.')},${parts[1]}`,
    amount_no_decimals_with_comma_separator: thousands('.'),
  };
  return format.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => amounts[key] ?? amounts.amount);
}

export function parseSchema(source) {
  const match = source && source.match(SCHEMA_RE);
  if (!match) return {};
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`Invalid schema JSON: ${error.message}`);
  }
}

// Preview-only changes to JSON templates (e.g. a real photo in "Shop the look"). Objects merge;
// a section's blocks and block_order are replaced as a whole.
// Deep-merges preview overrides into a template or section group; blocks merge by id, lists are replaced.
const mergeTemplate = (base, patch) => {
  if (!patch) return base;
  const out = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const replace = Array.isArray(value) || typeof value !== 'object' || value === null;
    out[key] = replace ? value : mergeTemplate(base[key] || {}, value);
  }
  return out;
};

export function createEngine({ files, locale, moneyFormat, currency = 'EUR', assetBase = '/assets/', images, templateOverrides = {} }) {
  const imageRegistry = images || new Map();

  const fs = {
    sep: '/',
    dirname: (path) => path.split('/').slice(0, -1).join('/'),
    resolve: (dir, file, ext) => (file.includes('/') ? `${file}${ext}` : `snippets/${file}${ext}`),
    exists: async (path) => path in files,
    existsSync: (path) => path in files,
    readFile: async (path) => prepare(files[path]),
    readFileSync: (path) => prepare(files[path]),
    contains: () => true,
  };

  const liquid = new Liquid({
    fs,
    root: ['.'],
    extname: '.liquid',
    cache: true,
    ownPropertyOnly: false,
    strictFilters: true,
    dynamicPartials: true,
  });

  /* ---------- Translations ---------- */
  const lookup = (key) => key.split('.').reduce((node, part) => (node == null ? node : node[part]), locale);
  liquid.registerFilter('t', (key, ...args) => {
    const { named } = kwargs(args);
    let value = lookup(String(key));
    if (value && typeof value === 'object' && 'count' in named) {
      value = Number(named.count) === 1 ? value.one ?? value.other : value.other ?? value.one;
    }
    if (typeof value !== 'string') return `translation missing: en.${key}`;
    return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) => (named[name] ?? '').toString());
  });

  /* ---------- Money ---------- */
  liquid.registerFilter('money', (cents) => formatMoney(cents, moneyFormat));
  liquid.registerFilter('money_with_currency', (cents) => `${formatMoney(cents, moneyFormat)} ${currency}`);
  liquid.registerFilter('money_without_currency', (cents) =>
    formatMoney(cents, moneyFormat.replace(/^[^{]*/, '').replace(/\}\}[^}]*$/, '}}'))
  );
  liquid.registerFilter('money_without_trailing_zeros', (cents) => formatMoney(cents, moneyFormat).replace(/[.,]00(?=\D*$)/, ''));

  /* ---------- URLs, assets, images ---------- */
  liquid.registerFilter('asset_url', (name) => `${assetBase}${name}`);
  liquid.registerFilter('shopify_asset_url', (name) => `${assetBase}${name}`);
  liquid.registerFilter('handleize', handleize);
  liquid.registerFilter('handle', handleize);
  liquid.registerFilter('image_url', (image) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    const src = image.src || (image.preview_image && image.preview_image.src) || '';
    if (src) imageRegistry.set(src, image.preview_image || image);
    return src;
  });
  liquid.registerFilter('image_tag', (src, ...args) => {
    const { named } = kwargs(args);
    const image = imageRegistry.get(src) || {};
    const attrs = {
      src,
      srcset: image.srcset,
      alt: named.alt ?? image.alt ?? '',
      width: image.width,
      height: image.height,
      loading: named.loading,
      sizes: image.srcset ? named.sizes : undefined,
      class: named.class,
      fetchpriority: named.fetchpriority,
    };
    return `<img ${Object.entries(attrs)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => (key === 'alt' ? `alt="${escapeHtml(value)}"` : `${key}="${escapeHtml(value)}"`))
      .join(' ')}${attrs.alt === '' ? ' alt=""' : ''}>`;
  });
  liquid.registerFilter('preload_tag', (href, ...args) => {
    const { named } = kwargs(args);
    return `<link rel="preload" href="${href}" as="${named.as || 'font'}" type="${named.type || ''}" crossorigin="${named.crossorigin || 'anonymous'}">`;
  });
  liquid.registerFilter('placeholder_svg_tag', (_name, className = '') =>
    `<svg class="${className}" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M120 500V230a80 80 0 0 1 160 0v270" fill="none" stroke="currentColor" stroke-opacity=".25"/></svg>`
  );
  liquid.registerFilter('payment_type_svg_tag', (type, ...args) => {
    const { named } = kwargs(args);
    const label = { visa: 'VISA', master: 'MC', american_express: 'AMEX', apple_pay: 'Pay', google_pay: 'GPay', paypal: 'PayPal' }[type] || type;
    return `<svg class="${named.class || ''}" viewBox="0 0 38 24" role="img" aria-label="${type}" xmlns="http://www.w3.org/2000/svg"><rect x=".5" y=".5" width="37" height="23" rx="3" fill="none" stroke="currentColor" stroke-opacity=".4"/><text x="19" y="15.5" text-anchor="middle" font-family="Jost, sans-serif" font-size="7" letter-spacing=".5" fill="currentColor">${label}</text></svg>`;
  });

  /* ---------- Shopify-only filters that have no meaning in a static preview ---------- */
  liquid.registerFilter('payment_button', () => '');
  liquid.registerFilter('media_tag', () => '');
  liquid.registerFilter('format_address', () => '');
  liquid.registerFilter('format_code', (code) => code);
  liquid.registerFilter('time_tag', (date) => `<time>${escapeHtml(date)}</time>`);
  liquid.registerFilter('default_errors', (errors) =>
    errors && errors.messages ? `<ul>${Object.values(errors.messages).map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>` : ''
  );
  liquid.registerFilter('structured_data', (product) => {
    if (!product || !product.title) return '';
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      brand: 'Giselle Paganeli Swim',
      offers: { '@type': 'Offer', priceCurrency: currency, price: (product.price / 100).toFixed(2) },
    };
    return JSON.stringify(data);
  });

  /* ---------- Tags ---------- */
  class SchemaTag extends Tag {
    constructor(token, remainTokens, engine) {
      super(token, remainTokens, engine);
      while (remainTokens.length) {
        const next = remainTokens.shift();
        if (next.name === 'endschema') return;
      }
      throw new Error('schema not closed');
    }

    render() {
      return '';
    }
  }
  liquid.registerTag('schema', SchemaTag);

  const FORM_ACTIONS = {
    product: '/cart/add',
    customer: '/contact',
    contact: '/contact',
    localization: '/localization',
    storefront_password: '/password',
    customer_login: '/account/login',
    create_customer: '/account',
    recover_customer_password: '/account/recover',
    reset_customer_password: '/account/reset',
    activate_customer_password: '/account/activate',
    customer_address: '/account/addresses',
    guest_login: '/account/login',
  };

  class FormTag extends Tag {
    constructor(token, remainTokens, engine, parser) {
      super(token, remainTokens, engine);
      const tk = this.tokenizer;
      this.typeToken = tk.readValue();
      tk.skipBlank();
      if (tk.peek() === ',') tk.advance();
      tk.skipBlank();
      const position = tk.p;
      const candidate = tk.readValue();
      tk.skipBlank();
      if (candidate && tk.peek() !== ':') {
        this.objectToken = candidate;
        if (tk.peek() === ',') tk.advance();
      } else {
        tk.p = position;
      }
      this.hash = new Hash(tk);
      this.templates = [];
      while (remainTokens.length) {
        const next = remainTokens.shift();
        if (next.name === 'endform') return;
        this.templates.push(parser.parseToken(next, remainTokens));
      }
      throw new Error('form not closed');
    }

    *render(ctx, emitter) {
      const type = yield evalToken(this.typeToken, ctx);
      const attrs = yield this.hash.render(ctx);
      const id = attrs.id ? ` id="${escapeHtml(attrs.id)}"` : '';
      const extra = Object.entries(attrs)
        .filter(([key]) => key !== 'id')
        .map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
        .join('');
      emitter.write(
        `<form method="post" action="${FORM_ACTIONS[type] || '/'}" accept-charset="UTF-8"${id}${extra}><input type="hidden" name="form_type" value="${type}"><input type="hidden" name="utf8" value="✓">`
      );
      ctx.push({ form: { errors: null, posted_successfully: false, email: '', name: '', body: '', phone: '' } });
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
      ctx.pop();
      emitter.write('</form>');
    }
  }
  liquid.registerTag('form', FormTag);

  class PaginateTag extends Tag {
    constructor(token, remainTokens, engine, parser) {
      super(token, remainTokens, engine);
      this.collectionToken = this.tokenizer.readValue();
      this.templates = [];
      while (remainTokens.length) {
        const next = remainTokens.shift();
        if (next.name === 'endpaginate') return;
        this.templates.push(parser.parseToken(next, remainTokens));
      }
      throw new Error('paginate not closed');
    }

    *render(ctx, emitter) {
      const items = (yield evalToken(this.collectionToken, ctx)) || [];
      ctx.push({
        paginate: { pages: 1, current_page: 1, items: items.length, parts: [], previous: null, next: null },
      });
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
      ctx.pop();
    }
  }
  liquid.registerTag('paginate', PaginateTag);

  class SectionsTag extends Tag {
    constructor(token, remainTokens, engine) {
      super(token, remainTokens, engine);
      this.groupToken = this.tokenizer.readValue();
    }

    *render(ctx, emitter) {
      const name = yield evalToken(this.groupToken, ctx);
      const globals = ctx.globals;
      emitter.write(yield api.renderGroup(name, globals));
    }
  }
  liquid.registerTag('sections', SectionsTag);

  /* ---------- Section rendering ---------- */
  const schemaCache = new Map();
  const schemaFor = (type) => {
    if (!schemaCache.has(type)) schemaCache.set(type, parseSchema(files[`sections/${type}.liquid`]));
    return schemaCache.get(type);
  };

  const parsed = new Map();
  const template = (path) => {
    if (!parsed.has(path)) {
      if (!(path in files)) throw new Error(`Missing theme file ${path}`);
      parsed.set(path, liquid.parse(prepare(files[path]), path));
    }
    return parsed.get(path);
  };

  const api = {
    liquid,
    schemaFor,
    images: imageRegistry,

    // resolve: (type, value) => Shopify object for resource settings (collection, product, page, link_list, image, url)
    buildSection({ id, type, data = {}, resolve }) {
      const schema = schemaFor(type);
      const settings = {};
      for (const setting of schema.settings || []) {
        if (!setting.id) continue;
        const raw = data.settings && setting.id in data.settings ? data.settings[setting.id] : setting.default;
        settings[setting.id] = resolve(setting.type, raw);
      }
      const blocks = (data.block_order || Object.keys(data.blocks || {})).map((blockId) => {
        const block = data.blocks[blockId];
        const blockSchema = (schema.blocks || []).find((item) => item.type === block.type) || {};
        const blockSettings = {};
        for (const setting of blockSchema.settings || []) {
          if (!setting.id) continue;
          const raw = block.settings && setting.id in block.settings ? block.settings[setting.id] : setting.default;
          blockSettings[setting.id] = resolve(setting.type, raw);
        }
        return { id: blockId, type: block.type, settings: blockSettings, shopify_attributes: '' };
      });
      return { section: { id, type, settings, blocks }, schema };
    },

    async renderSection({ id, type, data, resolve, globals, wrapperClass = '' }) {
      if (data && data.disabled) return '';
      const { section, schema } = api.buildSection({ id, type, data, resolve });
      const html = await liquid.render(template(`sections/${type}.liquid`), { section }, { globals });
      const tag = schema.tag || 'div';
      const classes = ['shopify-section', wrapperClass, schema.class].filter(Boolean).join(' ');
      return `<${tag} id="shopify-section-${id}" class="${classes}">${html}</${tag}>`;
    },

    async renderGroup(name, globals) {
      const group = mergeTemplate(JSON.parse(files[`sections/${name}.json`]), templateOverrides[name]);
      const resolve = globals.__resolve;
      const out = [];
      for (const key of group.order) {
        out.push(
          await api.renderSection({
            id: `sections--${name}__${key}`,
            type: group.sections[key].type,
            data: group.sections[key],
            resolve,
            globals,
            wrapperClass: `shopify-section-group-${name}`,
          })
        );
      }
      return out.join('\n');
    },

    templateJson(name) {
      return mergeTemplate(JSON.parse(files[`templates/${name}.json`]), templateOverrides[name]);
    },

    async renderTemplate(name, globals) {
      const json = api.templateJson(name);
      const resolve = globals.__resolve;
      const templateId = name.replace(/[./]/g, '-');
      const out = [];
      for (const key of json.order) {
        out.push(
          await api.renderSection({
            id: `template--${templateId}__${key}`,
            type: json.sections[key].type,
            data: json.sections[key],
            resolve,
            globals,
          })
        );
      }
      return { html: out.join('\n'), layout: json.layout || 'theme' };
    },

    async renderLayout(layout, globals) {
      return liquid.render(template(`layout/${layout}.liquid`), {}, { globals });
    },

    // Section Rendering API: ?section_id=template--collection__main or ?section_id=cart-drawer
    async renderSectionById(sectionId, globals) {
      const match = sectionId.match(/^template--(.+)__(.+)$/);
      if (match) {
        const templateName = Object.keys(files)
          .filter((path) => path.startsWith('templates/') && path.endsWith('.json'))
          .map((path) => path.slice(10, -5))
          .find((nameCandidate) => nameCandidate.replace(/[./]/g, '-') === match[1]);
        const json = api.templateJson(templateName);
        const data = json.sections[match[2]];
        return api.renderSection({ id: sectionId, type: data.type, data, resolve: globals.__resolve, globals });
      }
      return api.renderSection({ id: sectionId, type: sectionId, data: {}, resolve: globals.__resolve, globals });
    },
  };

  return api;
}
