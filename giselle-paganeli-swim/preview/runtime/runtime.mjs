// Preview runtime: stands in for Shopify's servers so the static preview behaves like the store.
// It answers the same requests the theme makes (cart, Section Rendering API, predictive search,
// recommendations) by rendering the real theme sections in the browser. Not part of the theme.
const CART_KEY = 'eden-preview-cart';
const realFetch = window.fetch.bind(window);

const readCart = () => {
  try {
    const cart = JSON.parse(window.localStorage.getItem(CART_KEY));
    return cart && Array.isArray(cart.items) ? cart : { items: [], note: '' };
  } catch (error) {
    return { items: [], note: '' };
  }
};

const writeCart = (cart) => {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    /* private mode: the cart lives until the page changes */
  }
};

let sitePromise;
const site = () => {
  if (!sitePromise) {
    sitePromise = Promise.all([import('./lib/site.mjs'), realFetch('/preview/bundle.json').then((r) => r.json())]).then(
      ([{ createSite }, bundle]) => createSite({ files: bundle.files, catalog: bundle.catalog, origin: window.location.origin })
    );
  }
  return sitePromise;
};

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const html = (text) => new Response(text, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

const cartJson = async (cart) => {
  const s = await site();
  const view = s.store.cartFrom(cart);
  return {
    item_count: view.item_count,
    total_price: view.total_price,
    note: view.note,
    items: view.items.map((item) => ({ id: item.id, quantity: item.quantity, title: item.title, final_line_price: item.final_line_price })),
  };
};

const renderSections = async (ids = [], sectionsUrl, cart) => {
  const s = await site();
  const list = Array.isArray(ids) ? ids : String(ids).split(',');
  const out = {};
  for (const id of list.filter(Boolean)) {
    out[id] = await s.renderSection(id, id.startsWith('template--cart') ? '/cart' : sectionsUrl || window.location.pathname, new URLSearchParams(), cart);
  }
  return out;
};

const parseBody = (init) => {
  if (!init || !init.body) return {};
  if (typeof init.body === 'string') {
    try {
      return JSON.parse(init.body);
    } catch (error) {
      return Object.fromEntries(new URLSearchParams(init.body));
    }
  }
  if (init.body instanceof FormData) return Object.fromEntries(init.body);
  return {};
};

window.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url, window.location.href);
  if (url.origin !== window.location.origin) return realFetch(input, init);
  const route = url.pathname;
  const body = parseBody(init);

  if (route === '/cart/add.js') {
    const s = await site();
    const cart = readCart();
    const items = body.items || [{ id: body.id, quantity: body.quantity || 1 }];
    for (const entry of items) {
      const variant = s.store.variantsById.get(Number(entry.id));
      if (!variant || !variant.available) return json({ status: 422, description: 'This piece is sold out in that size.' }, 422);
      const line = cart.items.find((item) => item.id === variant.id);
      if (line) line.quantity += Number(entry.quantity) || 1;
      else cart.items.push({ id: variant.id, quantity: Number(entry.quantity) || 1 });
    }
    writeCart(cart);
    return json({ items, sections: await renderSections(body.sections, body.sections_url, cart) });
  }

  if (route === '/cart/change.js') {
    const cart = readCart();
    const index = Number(body.line) - 1;
    if (cart.items[index]) {
      const quantity = Math.max(0, Number(body.quantity) || 0);
      if (quantity === 0) cart.items.splice(index, 1);
      else cart.items[index].quantity = quantity;
    }
    writeCart(cart);
    return json({ ...(await cartJson(cart)), sections: await renderSections(body.sections, body.sections_url, cart) });
  }

  if (route === '/cart/update.js') {
    const cart = readCart();
    if ('note' in body) cart.note = body.note;
    writeCart(cart);
    return json(await cartJson(cart));
  }

  if (route === '/cart.js') return json(await cartJson(readCart()));

  if (route === '/search/suggest') {
    const s = await site();
    return html(await s.renderPredictive(url.searchParams.get('q') || '', readCart()));
  }

  if (route === '/recommendations/products') {
    const s = await site();
    return html(
      await s.renderRecommendations(url.searchParams.get('section_id'), url.searchParams.get('product_id'), url.searchParams.get('limit'), readCart())
    );
  }

  if (url.searchParams.has('section_id')) {
    const s = await site();
    const sectionId = url.searchParams.get('section_id');
    const params = new URLSearchParams(url.search);
    params.delete('section_id');
    return html(await s.renderSection(sectionId, route, params, readCart()));
  }

  return realFetch(input, init);
};

/* ---------- Messages ---------- */
let toastTimer;
const say = (message) => {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 4200);
};

document.addEventListener(
  'submit',
  (event) => {
    const form = event.target;
    const action = new URL(form.action, window.location.href).pathname;
    const submitter = event.submitter;
    let message = null;
    const popup = form.querySelector('welcome-popup') || form.closest('welcome-popup');
    if (popup && action === '/contact') {
      // On Shopify the page reloads with the code; here the welcome popup shows it in place.
      event.preventDefault();
      event.stopImmediatePropagation();
      popup.showSuccess();
      return;
    }
    if (action === '/cart' && submitter && submitter.name === 'checkout') {
      message = 'Preview — checkout opens on Shopify once the store is live.';
    } else if (action === '/contact') {
      const isNewsletter = form.querySelector('[name="contact[tags]"]');
      message = isNewsletter
        ? 'Preview — on Shopify this email joins the customer list with marketing consent.'
        : 'Preview — on Shopify this message is sent to the store email.';
    } else if (action === '/localization') {
      message = 'Preview — languages and currencies are switched on with Shopify Markets.';
    } else if (action.startsWith('/account') || action === '/password') {
      message = 'Preview — customer accounts work once the theme is installed on Shopify.';
    } else if (action === '/cart') {
      message = 'Preview — the cart updates automatically here.';
    }
    if (message) {
      event.preventDefault();
      event.stopImmediatePropagation();
      say(message);
    }
  },
  true
);

document.addEventListener(
  'change',
  (event) => {
    if (event.target.matches('[data-auto-submit]')) {
      event.stopImmediatePropagation();
      say('Preview — languages and currencies are switched on with Shopify Markets.');
    }
  },
  true
);

/* ---------- Server-rendered state the static pages cannot know ---------- */
const swap = (sectionId, markup) => {
  const current = document.getElementById(`shopify-section-${sectionId}`);
  if (!current || !markup) return;
  const fresh = new DOMParser().parseFromString(markup, 'text/html').getElementById(`shopify-section-${sectionId}`);
  if (!fresh) return;
  current.replaceWith(fresh);
  fresh.dispatchEvent(new CustomEvent('shopify:section:load', { bubbles: true }));
};

const banner = () => {
  if (sessionStorage.getItem('eden-preview-banner') === 'closed') return;
  const note = document.createElement('div');
  note.className = 'preview-note';
  note.innerHTML =
    '<span><strong>Preview</strong> · sample photos (Pexels), products and prices</span><button type="button" aria-label="Close">×</button>';
  note.querySelector('button').addEventListener('click', () => {
    note.remove();
    try {
      sessionStorage.setItem('eden-preview-banner', 'closed');
    } catch (error) {
      /* ignore */
    }
  });
  document.body.appendChild(note);
};

const boot = async () => {
  banner();
  const cart = readCart();
  const params = new URLSearchParams(window.location.search);
  const route = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  const listing = route.startsWith('/collections/') && [...params.keys()].some((key) => key.startsWith('filter.') || key === 'sort_by');
  const searching = route === '/search' && params.get('q');
  if (!cart.items.length && route !== '/cart' && !listing && !searching) return;

  const s = await site();
  if (cart.items.length) {
    const drawer = await s.renderSection('cart-drawer', route, params, cart);
    const fresh = new DOMParser().parseFromString(drawer, 'text/html').getElementById('CartContents');
    const current = document.getElementById('CartContents');
    if (fresh && current) current.replaceWith(fresh);
    const count = s.store.cartFrom(cart).item_count;
    document.querySelectorAll('[data-cart-count]').forEach((badge) => {
      badge.hidden = count === 0;
      const value = badge.querySelector('[data-cart-count-value]');
      if (value) value.textContent = count;
    });
  }
  if (route === '/cart') swap('template--cart__main', await s.renderSection('template--cart__main', '/cart', params, cart));
  if (searching) swap('template--search__main', await s.renderSection('template--search__main', '/search', params, cart));
  if (listing) {
    const section = document.querySelector('[id^="shopify-section-template--collection"][id$="__main"]');
    const sectionId = section ? section.id.replace('shopify-section-', '') : 'template--collection__main';
    swap(sectionId, await s.renderSection(sectionId, route, params, cart));
  }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
