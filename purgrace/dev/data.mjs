// Shopify-like objects built from the store's public catalogue (fixtures/purgrace-store.json).
// Only used by the preview (local server and the Cloudflare copy); the real store provides these objects itself.
// No Node imports: the same code runs in the browser's service worker.
export const FILES_CDN = 'https://cdn.shopify.com/s/files/1/0735/5288/7987/files/';

const cents = (v) => Math.round(parseFloat(v || 0) * 100);
const strip = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
export const handleize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

let mediaId = 1000;
export function makeImage(src, { width = 1000, height = 1000, alt = '' } = {}) {
  return {
    __image: true,
    id: ++mediaId,
    src,
    width,
    height,
    aspect_ratio: width / height,
    alt,
    media_type: 'image',
    presentation: { focal_point: '50% 50%' },
    toString() {
      return src;
    },
  };
}
export function imageFromSetting(value) {
  if (!value || typeof value !== 'string') return null;
  const m = value.match(/^shopify:\/\/shop_images\/(.+)$/);
  if (!m) return null;
  const known = {
    'brazilian-gold-plated-jewellery-australia-purgrace.png': [2400, 1200],
    'brazilian-gold-pendant-necklace-australia-purgrace.jpg': [887, 747],
  };
  const [w, h] = known[m[1]] || [1000, 1000];
  return makeImage(FILES_CDN + m[1], { width: w, height: h });
}

function buildProduct(p) {
  const media = p.images.map((img) => {
    const image = makeImage(img.src, { width: img.width || 1000, height: img.height || 1000, alt: img.alt || '' });
    image.id = img.id;
    image.preview_image = image;
    return image;
  });
  const options = p.options.map((o) => ({ name: o.name, position: o.position, values: o.values }));
  const hasOnlyDefault = options.length === 1 && options[0].name === 'Title' && options[0].values[0] === 'Default Title';
  const variants = p.variants.map((v) => {
    const opts = [v.option1, v.option2, v.option3].filter((x) => x != null);
    const featured = v.featured_image ? media.find((m) => m.id === v.featured_image.id) : null;
    return {
      id: v.id,
      title: v.title,
      options: opts,
      option1: v.option1,
      option2: v.option2,
      option3: v.option3,
      price: cents(v.price),
      compare_at_price: v.compare_at_price ? cents(v.compare_at_price) : null,
      available: v.available,
      sku: v.sku,
      barcode: v.barcode || null,
      featured_media: featured,
      featured_image: featured,
      inventory_management: null,
      inventory_quantity: 0,
      store_availabilities: [],
      quantity_rule: { min: 1, max: null, increment: 1 },
      unit_price_measurement: null,
      requires_shipping: true,
      url: `/products/${p.handle}?variant=${v.id}`,
    };
  });
  const prices = variants.map((v) => v.price);
  const product = {
    id: p.id,
    handle: p.handle,
    title: p.title,
    url: `/products/${p.handle}`,
    vendor: p.vendor,
    type: p.product_type,
    tags: p.tags,
    description: p.body_html || '',
    content: p.body_html || '',
    media,
    images: media,
    featured_media: media[0] || null,
    featured_image: media[0] || null,
    variants,
    variants_count: variants.length,
    has_only_default_variant: hasOnlyDefault,
    price: Math.min(...prices),
    price_min: Math.min(...prices),
    price_max: Math.max(...prices),
    price_varies: Math.min(...prices) !== Math.max(...prices),
    compare_at_price: null,
    available: variants.some((v) => v.available),
    options: options.map((o) => o.name),
    _options: options,
    metafields: { reviews: {}, custom: {} },
    published_at: p.published_at,
    created_at: p.created_at,
    'gift_card?': false,
    collections: [],
  };
  product.selected_variant = null;
  product.selected_or_first_available_variant = variants.find((v) => v.available) || variants[0];
  product.first_available_variant = product.selected_or_first_available_variant;
  setOptionsWithValues(product);
  variants.forEach((v) => (v.product = product));
  return product;
}

// Recompute options_with_values for the selected variant (availability is relative to the selection)
export function setOptionsWithValues(product, variant = product.selected_or_first_available_variant) {
  const selected = variant ? variant.options : [];
  product.options_with_values = product._options.map((o, index) => ({
    name: o.name,
    position: o.position,
    selected_value: selected[index],
    values: o.values.map((value) => {
      const candidate = selected.slice();
      candidate[index] = value;
      const match = product.variants.find((v) => v.options.every((x, i) => x === candidate[i]));
      return {
        name: value,
        selected: selected[index] === value,
        available: product.variants.some((v) => v.available && v.options.every((x, i) => x === candidate[i])),
        variant: match || null,
        swatch: null,
        id: `${product.id}-${index}-${handleize(value)}`,
        toString() {
          return value;
        },
      };
    }),
  }));
}

export function buildStore(origin, fixture) {
  const products = fixture.products.map(buildProduct);
  const byHandle = Object.fromEntries(products.map((p) => [p.handle, p]));

  const collections = fixture.collections.map((c) => {
    const members = (fixture.membership[c.handle] || []).map((h) => byHandle[h]).filter(Boolean);
    const image = c.image ? makeImage(c.image.src, { width: c.image.width, height: c.image.height, alt: c.image.alt || '' }) : null;
    const coll = {
      id: c.id,
      handle: c.handle,
      title: c.title,
      url: `/collections/${c.handle}`,
      description: c.body_html || '',
      image,
      featured_image: image || (members[0] && members[0].featured_media) || null,
      _all: members,
      products: members,
      products_count: members.length,
      all_products_count: members.length,
      metafields: { custom: {} },
      sort_options: [
        { value: 'manual', name: 'Featured' },
        { value: 'best-selling', name: 'Best selling' },
        { value: 'title-ascending', name: 'Alphabetically, A-Z' },
        { value: 'title-descending', name: 'Alphabetically, Z-A' },
        { value: 'price-ascending', name: 'Price, low to high' },
        { value: 'price-descending', name: 'Price, high to low' },
        { value: 'created-descending', name: 'Date, new to old' },
      ],
      default_sort_by: 'manual',
      sort_by: null,
      filters: [],
    };
    members.forEach((p) => p.collections.push(coll));
    return coll;
  });
  const collectionsByHandle = Object.fromEntries(collections.map((c) => [c.handle, c]));
  const collectionsList = Object.assign(collections.slice(), collectionsByHandle);

  const pageFromFixture = (url, handle, title) => {
    const p = fixture.pages[url];
    return { id: handle.length, handle, title: (p && p.title) || title, url: `/pages/${handle}`, content: (p && p.html) || '', template_suffix: null, metafields: {} };
  };
  const pages = {
    'discover-purgrace': pageFromFixture('/pages/discover-purgrace', 'discover-purgrace', 'About us'),
    contact: pageFromFixture('/pages/contact', 'contact', 'Contact us'),
    'delivery-policy': pageFromFixture('/pages/delivery-policy', 'delivery-policy', 'Delivery policy'),
    'size-guide': { id: 91, handle: 'size-guide', title: 'Size guide', url: '/pages/size-guide', content: '<p>How to find your ring size and the right necklace length.</p>', metafields: {} },
    care: { id: 92, handle: 'care', title: 'Jewellery care', url: '/pages/care', content: '<p>A few simple habits keep your gold-plated and silver jewellery shining for longer.</p>', metafields: {} },
    faq: { id: 93, handle: 'faq', title: 'Frequently asked questions', url: '/pages/faq', content: '', metafields: {} },
  };
  const templateFor = { 'discover-purgrace': 'about', contact: 'contact', 'size-guide': 'size-guide', care: 'care', faq: 'faq' };

  const link = (title, url, links = []) => ({ title, url, links, levels: links.length ? 1 : 0, active: false, current: false, child_active: false, type: 'http_link' });
  const linklists = {
    'main-menu': {
      handle: 'main-menu',
      title: 'Main menu',
      links: [
        link('Shop', '/collections/all', [
          link('All jewellery', '/collections/all'),
          link('Earrings', '/collections/earrings'),
          link('Necklaces', '/collections/necklace'),
          link('Pendants', '/collections/pendant'),
          link('Rings', '/collections/ring'),
          link('Bracelets', '/collections/bracelet'),
          link('Sets', '/collections/set'),
          link('Kids', '/collections/kids'),
        ]),
        link('Faith', '/collections/faith'),
        link('925 Silver', '/collections/solid-925-silver'),
        link('Best sellers', '/collections/best-sellers'),
        link('About', '/pages/discover-purgrace'),
      ],
    },
    footer: {
      handle: 'footer',
      title: 'Help',
      links: [link('Contact us', '/pages/contact'), link('Shipping', '/policies/shipping-policy'), link('Size guide', '/pages/size-guide'), link('Jewellery care', '/pages/care'), link('FAQ', '/pages/faq')],
    },
    'customer-account-main-menu': { handle: 'customer-account-main-menu', title: 'Account', links: [] },
  };

  const shop = {
    id: fixture.shop.id,
    name: 'PurGrace',
    url: origin,
    secure_url: origin,
    domain: 'purgrace.com.au',
    description: fixture.shop.description,
    currency: 'AUD',
    money_format: '${{amount}}',
    money_with_currency_format: '${{amount}} AUD',
    email: 'purgraceau@gmail.com',
    address: { city: 'Balcatta', province: 'Western Australia', province_code: 'WA', country_code: 'AU' },
    customer_accounts_enabled: true,
    taxes_included: true,
    enabled_payment_types: ['american_express', 'apple_pay', 'google_pay', 'master', 'paypal', 'visa'],
    policies: [
      { title: 'Privacy policy', url: '/policies/privacy-policy' },
      { title: 'Shipping policy', url: '/policies/shipping-policy' },
    ],
    shipping_policy: { title: 'Shipping policy', url: '/policies/shipping-policy', body: (fixture.pages['/policies/shipping-policy'] || {}).html || '' },
    brand: { logo: null },
    password_message: 'Our new store is almost ready.',
    published_locales: [],
  };

  const blog = { id: 1, handle: 'news', title: 'The journal', url: '/blogs/news', articles: [], articles_count: 0, all_tags: [], 'comments_enabled?': false, 'moderated?': true, metafields: {} };

  return { products, byHandle, collections: collectionsList, collectionsByHandle, pages, templateFor, linklists, shop, blog };
}

export { strip, cents };
