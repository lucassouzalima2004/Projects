// Shopify-shaped objects (shop, products, collections, cart, search…) built from the sample catalog.
import { Drop } from 'liquidjs';
import { handleize } from './engine.mjs';

class OptionValue extends Drop {
  constructor(name, swatch) {
    super();
    this.name = name;
    this.swatch = swatch;
  }

  valueOf() {
    return this.name;
  }

  toString() {
    return this.name;
  }
}

const SORT_OPTIONS = [
  { name: 'Featured', value: 'manual' },
  { name: 'Best selling', value: 'best-selling' },
  { name: 'Alphabetically, A–Z', value: 'title-ascending' },
  { name: 'Alphabetically, Z–A', value: 'title-descending' },
  { name: 'Price, low to high', value: 'price-ascending' },
  { name: 'Price, high to low', value: 'price-descending' },
  { name: 'Date, new to old', value: 'created-descending' },
];

const stripHtml = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export function createStore(data, { origin = '' } = {}) {
  const { shop: shopData } = data;
  let id = 7000;
  const nextId = () => ++id;

  // Sample photos ship in two widths; the theme's image_tag gets both through srcset.
  // Product photos are 4:5 (640/1200 px); campaign crops list their own size in the catalog.
  const photoBase = `${origin}/preview/photos/`;
  const productFormat = { width: 1200, height: 1500, widths: [640, 1200] };
  const photo = (photoId, alt) => {
    const { width, height, widths } = (data.campaignPhotos || {})[photoId] || productFormat;
    const image = {
      id: nextId(),
      media_type: 'image',
      src: `${photoBase}${photoId}-${widths[widths.length - 1]}.jpg`,
      srcset: widths.map((w) => `${photoBase}${photoId}-${w}.jpg ${w}w`).join(', '),
      width,
      height,
      aspect_ratio: width / height,
      alt,
    };
    image.preview_image = image;
    return image;
  };

  /* ---------- Products ---------- */
  const products = data.products.map((raw, index) => {
    const product = {
      id: nextId(),
      object_type: 'product',
      handle: raw.handle,
      title: raw.title,
      type: raw.type,
      vendor: shopData.name,
      tags: raw.tags,
      description: raw.description,
      content: raw.description,
      url: `/products/${raw.handle}`,
      created_index: index,
      has_only_default_variant: false,
      options: ['Color', 'Size'],
      metafields: { custom: { fit: { value: raw.fit } } },
    };

    const media = [];
    const mediaByColor = {};
    raw.colors.forEach((color) => {
      raw.photos[color].forEach((photoId, index) => {
        const image = photo(photoId, `${raw.title} — ${color}${index ? ` (${index + 1})` : ''}`);
        media.push(image);
        if (!index) mediaByColor[color] = image;
      });
    });

    const variants = [];
    raw.colors.forEach((color) => {
      raw.sizes.forEach((size) => {
        const soldOut = raw.soldOut.some(([c, s]) => c === color && s === size);
        const variantId = nextId();
        variants.push({
          id: variantId,
          title: `${color} / ${size}`,
          option1: color,
          option2: size,
          options: [color, size],
          price: raw.price,
          compare_at_price: raw.compareAt || null,
          available: !soldOut,
          sku: `${handleize(raw.title).toUpperCase()}-${color.slice(0, 3).toUpperCase()}-${size}`,
          url: `/products/${raw.handle}?variant=${variantId}`,
          featured_media: mediaByColor[color],
          featured_image: mediaByColor[color],
          get product() {
            return product;
          },
        });
      });
    });

    Object.assign(product, {
      media,
      images: media,
      featured_media: media[0],
      featured_image: media[0],
      variants,
      price: raw.price,
      price_min: raw.price,
      price_max: raw.price,
      price_varies: false,
      compare_at_price: raw.compareAt || null,
      available: variants.some((variant) => variant.available),
      first_available_variant: variants.find((variant) => variant.available),
      selected_variant: null,
      get selected_or_first_available_variant() {
        return this.selected_variant || this.first_available_variant || variants[0];
      },
      options_with_values: [
        {
          name: 'Color',
          position: 1,
          values: raw.colors.map((color) => new OptionValue(color, data.colorHex[color] ? { color: data.colorHex[color] } : null)),
          selected_value: raw.colors[0],
        },
        { name: 'Size', position: 2, values: raw.sizes.map((size) => new OptionValue(size, null)), selected_value: null },
      ],
      collectionHandles: raw.collections,
    });
    return product;
  });
  const productsByHandle = Object.fromEntries(products.map((product) => [product.handle, product]));
  const variantsById = new Map(products.flatMap((product) => product.variants.map((variant) => [variant.id, variant])));

  /* ---------- Collections ---------- */
  const baseCollections = data.collections.map((raw) => {
    const items = raw.handle === 'all' ? products : products.filter((product) => product.collectionHandles.includes(raw.handle));
    return {
      id: nextId(),
      object_type: 'collection',
      handle: raw.handle,
      title: raw.title,
      description: raw.description,
      url: `/collections/${raw.handle}`,
      template_suffix: raw.template || null,
      products: items,
      all_products_count: items.length,
      products_count: items.length,
      featured_image: null,
      sort_options: SORT_OPTIONS,
      default_sort_by: 'manual',
      sort_by: null,
      filters: [],
    };
  });
  const collectionsByHandle = Object.fromEntries(baseCollections.map((collection) => [collection.handle, collection]));
  products.forEach((product) => {
    product.collections = product.collectionHandles.map((handle) => collectionsByHandle[handle]);
  });

  const FILTERS = [
    {
      label: 'Availability',
      param: 'filter.v.availability',
      type: 'boolean',
      values: () => [
        { label: 'In stock', value: '1' },
        { label: 'Out of stock', value: '0' },
      ],
      test: (product, value) => (value === '1' ? product.available : !product.available || product.variants.some((v) => !v.available)),
    },
    {
      label: 'Category',
      param: 'filter.p.product_type',
      type: 'list',
      values: (items) => [...new Set(items.map((product) => product.type))].map((type) => ({ label: type, value: type })),
      test: (product, value) => product.type === value,
    },
    {
      label: 'Color',
      param: 'filter.v.option.color',
      type: 'list',
      values: (items) =>
        [...new Set(items.flatMap((product) => product.variants.map((variant) => variant.option1)))].map((color) => ({ label: color, value: color })),
      test: (product, value) => product.variants.some((variant) => variant.option1 === value),
    },
    {
      label: 'Size',
      param: 'filter.v.option.size',
      type: 'list',
      values: (items) =>
        [...new Set(items.flatMap((product) => product.variants.map((variant) => variant.option2)))].map((size) => ({ label: size, value: size })),
      test: (product, value) => product.variants.some((variant) => variant.option2 === value && variant.available),
    },
  ];

  const sortProducts = (items, sortBy) => {
    const sorted = [...items];
    switch (sortBy) {
      case 'title-ascending':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-descending':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'price-ascending':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-descending':
        return sorted.sort((a, b) => b.price - a.price);
      case 'created-descending':
        return sorted.sort((a, b) => b.created_index - a.created_index);
      case 'best-selling':
        return sorted.sort((a, b) => ((a.id * 7) % 11) - ((b.id * 7) % 11));
      default:
        return sorted;
    }
  };

  // A collection as Shopify renders it for a given URL (?filter.…=…&sort_by=…).
  const collectionFor = (handle, params = new URLSearchParams()) => {
    const base = collectionsByHandle[handle];
    if (!base) return null;
    const active = Object.fromEntries(FILTERS.map((filter) => [filter.param, params.getAll(filter.param)]));
    const gte = params.get('filter.v.price.gte');
    const lte = params.get('filter.v.price.lte');
    const priceOk = (product) =>
      (!gte || product.price >= Number(gte) * 100) && (!lte || product.price <= Number(lte) * 100);

    const matches = (product, skipParam) =>
      FILTERS.every((filter) => {
        if (filter.param === skipParam) return true;
        const values = active[filter.param];
        return !values.length || values.some((value) => filter.test(product, value));
      }) && (skipParam === 'price' || priceOk(product));

    const urlWith = (mutate) => {
      const next = new URLSearchParams(params);
      next.delete('page');
      mutate(next);
      const query = next.toString();
      return `${base.url}${query ? `?${query}` : ''}`;
    };

    const filters = FILTERS.map((filter) => {
      const pool = base.products.filter((product) => matches(product, filter.param));
      const values = filter.values(base.products).map((option) => {
        const isActive = active[filter.param].includes(option.value);
        return {
          ...option,
          param_name: filter.param,
          active: isActive,
          count: pool.filter((product) => filter.test(product, option.value)).length,
          url_to_add: urlWith((next) => next.append(filter.param, option.value)),
          url_to_remove: urlWith((next) => {
            const kept = next.getAll(filter.param).filter((value) => value !== option.value);
            next.delete(filter.param);
            kept.forEach((value) => next.append(filter.param, value));
          }),
        };
      });
      return {
        label: filter.label,
        param_name: filter.param,
        type: filter.type,
        values,
        active_values: values.filter((value) => value.active),
        url_to_remove: urlWith((next) => next.delete(filter.param)),
      };
    });

    const rangeMax = Math.max(...base.products.map((product) => product.price));
    filters.push({
      label: 'Price',
      type: 'price_range',
      param_name: 'filter.v.price',
      values: [],
      active_values: [],
      range_max: rangeMax,
      min_value: { param_name: 'filter.v.price.gte', value: gte ? Number(gte) * 100 : null },
      max_value: { param_name: 'filter.v.price.lte', value: lte ? Number(lte) * 100 : null },
      url_to_remove: urlWith((next) => {
        next.delete('filter.v.price.gte');
        next.delete('filter.v.price.lte');
      }),
    });

    const sortBy = params.get('sort_by');
    const items = sortProducts(base.products.filter((product) => matches(product)), sortBy);
    return { ...base, products: items, products_count: items.length, filters, sort_by: sortBy };
  };

  const collections = Object.assign([...baseCollections], collectionsByHandle);

  /* ---------- Pages & menus ---------- */
  const pages = data.pages.map((raw) => ({
    id: nextId(),
    object_type: 'page',
    handle: raw.handle,
    title: raw.title,
    content: raw.content,
    url: `/pages/${raw.handle}`,
    template_suffix: raw.template || null,
  }));
  const pagesByHandle = Object.fromEntries(pages.map((page) => [page.handle, page]));

  const buildLinklists = (path) => {
    const build = (links) =>
      (links || []).map((link) => {
        const children = build(link.links);
        const current = link.url === path;
        const childActive = children.some((child) => child.current || child.child_active);
        return {
          title: link.title,
          url: link.url,
          links: children,
          current,
          // Like Shopify: the link's own page, or a page inside it (a product in a collection, a sub-page).
          active: current || (link.url.split('/').filter(Boolean).length > 1 && path.startsWith(`${link.url}/`)),
          child_active: childActive,
          child_current: children.some((child) => child.current),
        };
      });
    return Object.fromEntries(
      Object.entries(data.menus).map(([handle, menu]) => [handle, { handle, title: menu.title, links: build(menu.links) }])
    );
  };

  /* ---------- Cart ---------- */
  const cartFrom = (state = {}) => {
    const items = (state.items || [])
      .map((entry) => {
        const variant = variantsById.get(Number(entry.id));
        if (!variant) return null;
        const product = variant.product;
        const linePrice = variant.price * entry.quantity;
        return {
          id: variant.id,
          key: `${variant.id}:preview`,
          quantity: entry.quantity,
          title: `${product.title} - ${variant.title}`,
          product,
          variant,
          price: variant.price,
          final_price: variant.price,
          original_price: variant.price,
          final_line_price: linePrice,
          original_line_price: linePrice,
          line_price: linePrice,
          image: variant.featured_media,
          url: variant.url,
          options_with_values: [
            { name: 'Color', value: variant.option1 },
            { name: 'Size', value: variant.option2 },
          ],
          line_level_discount_allocations: [],
        };
      })
      .filter(Boolean);
    const total = items.reduce((sum, item) => sum + item.final_line_price, 0);
    return {
      items,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0),
      total_price: total,
      items_subtotal_price: total,
      original_total_price: total,
      note: state.note || '',
      currency: { iso_code: shopData.currency, symbol: shopData.countries[0].currency.symbol },
      cart_level_discount_applications: [],
      taxes_included: false,
    };
  };

  /* ---------- Search ---------- */
  const matchTerms = (terms, ...fields) => {
    const haystack = fields.map(stripHtml).join(' ').toLowerCase();
    return terms
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .every((term) => haystack.includes(term.replace(/s$/, '')));
  };

  const search = (terms) => {
    const productResults = products.filter((product) => matchTerms(terms, product.title, product.type, product.description, product.variants.map((v) => v.title).join(' ')));
    const pageResults = pages.filter((page) => matchTerms(terms, page.title, page.content));
    const results = [...productResults, ...pageResults];
    return { performed: Boolean(terms), terms, results, results_count: results.length, types: ['product', 'page'] };
  };

  const predictive = (terms) => {
    const result = search(terms);
    const lower = terms.toLowerCase();
    const queries = [...new Set(products.map((product) => product.type))]
      .filter((type) => type.toLowerCase().startsWith(lower.slice(0, 3)))
      .map((type) => ({ text: type, styled_text: `<mark>${type}</mark>`, url: `/search?q=${encodeURIComponent(type)}` }));
    return {
      performed: true,
      terms,
      resources: {
        products: result.results.filter((item) => item.object_type === 'product').slice(0, 4),
        pages: result.results.filter((item) => item.object_type === 'page').slice(0, 4),
        collections: baseCollections.filter((collection) => matchTerms(terms, collection.title)).slice(0, 4),
        queries: queries.slice(0, 3),
      },
    };
  };

  /* ---------- Settings resolution ---------- */
  const resolve = (type, raw) => {
    if (raw === undefined || raw === null || raw === '') return type === 'checkbox' ? false : null;
    switch (type) {
      case 'collection':
        return collectionsByHandle[raw] || null;
      case 'product':
        return productsByHandle[raw] || null;
      case 'page':
        return pagesByHandle[raw] || null;
      case 'image_picker':
        return String(raw).startsWith('preview:photo/') ? photo(String(raw).slice(14), '') : null;
      case 'url':
        return String(raw).replace(/^shopify:\/\/(collections|pages|products|blogs)\//, '/$1/');
      default:
        return raw;
    }
  };

  /* ---------- Routing ---------- */
  const route = (pathname, params = new URLSearchParams()) => {
    const path = pathname.replace(/\/+$/, '') || '/';
    const parts = path.split('/').filter(Boolean);
    if (path === '/') return { template: 'index', type: 'index', title: shopData.name };
    if (path === '/collections') return { template: 'list-collections', type: 'list-collections', title: 'Collections' };
    if (parts[0] === 'collections' && parts.length === 2) {
      const collection = collectionFor(parts[1], params);
      if (collection) {
        const template = collection.template_suffix ? `collection.${collection.template_suffix}` : 'collection';
        return { template, type: 'collection', title: collection.title, collection, description: stripHtml(collection.description) };
      }
    }
    if (parts[0] === 'products' && parts.length === 2 && productsByHandle[parts[1]]) {
      const product = productsByHandle[parts[1]];
      const variantId = Number(params.get('variant'));
      const selected = product.variants.find((variant) => variant.id === variantId) || null;
      const view = Object.create(product, { selected_variant: { value: selected } });
      return { template: 'product', type: 'product', title: product.title, product: view, description: stripHtml(product.description), image: product.featured_media };
    }
    if (parts[0] === 'pages' && parts.length === 2 && pagesByHandle[parts[1]]) {
      const page = pagesByHandle[parts[1]];
      return { template: page.template_suffix ? `page.${page.template_suffix}` : 'page', type: 'page', title: page.title, page, description: stripHtml(page.content).slice(0, 160) };
    }
    if (path === '/cart') return { template: 'cart', type: 'cart', title: 'Your bag' };
    if (path === '/search') return { template: 'search', type: 'search', title: 'Search', search: search(params.get('q') || '') };
    if (path === '/password') return { template: 'password', type: 'password', title: shopData.name };
    if (path === '/account/login') return { template: 'customers/login', type: 'customers/login', title: 'Sign in' };
    if (path === '/account/register') return { template: 'customers/register', type: 'customers/register', title: 'Create an account' };
    return { template: '404', type: '404', title: 'Page not found', notFound: true };
  };

  const ROUTES = {
    root_url: '/',
    cart_url: '/cart',
    cart_add_url: '/cart/add',
    cart_change_url: '/cart/change',
    cart_update_url: '/cart/update',
    cart_clear_url: '/cart/clear',
    search_url: '/search',
    predictive_search_url: '/search/suggest',
    all_products_collection_url: '/collections/all',
    collections_url: '/collections',
    account_url: '/account/login',
    account_login_url: '/account/login',
    account_register_url: '/account/register',
    account_logout_url: '/account/logout',
    account_addresses_url: '/account/addresses',
    product_recommendations_url: '/recommendations/products',
  };

  const localization = {
    available_countries: shopData.countries,
    country: shopData.countries[0],
    available_languages: shopData.languages,
    language: shopData.languages[0],
  };

  const shop = {
    name: shopData.name,
    description: shopData.description,
    url: origin || '/',
    currency: shopData.currency,
    money_format: shopData.moneyFormat,
    enabled_payment_types: shopData.paymentTypes,
    customer_accounts_enabled: true,
    taxes_included: false,
    password_message: '',
    checkout: { guest_login: false },
  };

  const globalsFor = ({ path, params = new URLSearchParams(), cartState, extra = {} }) => {
    const current = route(path, params);
    const [name, suffix] = current.template.split('.');
    const linklists = buildLinklists(path);
    const resolveFor = (type, raw) => (type === 'link_list' ? (raw && linklists[raw]) || null : resolve(type, raw));
    return {
      route: current,
      globals: {
        shop,
        settings: null,
        routes: ROUTES,
        localization,
        collections,
        pages: pagesByHandle,
        all_products: productsByHandle,
        linklists,
        cart: cartFrom(cartState),
        customer: null,
        template: { name: name.replace('customers/', ''), suffix: suffix || null, directory: name.startsWith('customers/') ? 'customers' : null },
        request: { path, page_type: current.type, locale: { iso_code: 'en', primary: true }, design_mode: false, origin, host: origin.replace(/^https?:\/\//, '') },
        page_title: current.title,
        page_description: current.description || shop.description,
        page_image: current.image || null,
        canonical_url: `${origin}${path}`,
        current_page: 1,
        current_tags: null,
        product: current.product || null,
        collection: current.collection || null,
        page: current.page || null,
        search: current.search || null,
        additional_checkout_buttons: false,
        content_for_additional_checkout_buttons: '',
        content_for_header: '',
        __resolve: resolveFor,
        ...extra,
      },
    };
  };

  return {
    products,
    productsByHandle,
    variantsById,
    collections: baseCollections,
    pages,
    resolve,
    route,
    globalsFor,
    cartFrom,
    search,
    predictive,
    collectionFor,
  };
}
