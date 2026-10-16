/*
 * Prévia publicada do tema (sem Shopify por trás).
 * Simula o que a loja faria no servidor: carrinho (/cart/add.js, /cart/change.js,
 * ?sections=cart-drawer), busca rápida (/search/suggest.json), busca e ordenação.
 * O carrinho fica no navegador (localStorage) e é desenhado com o template real do
 * tema, renderizado aqui mesmo com LiquidJS. O pagamento e os formulários só avisam
 * que é uma prévia.
 */
(() => {
  window.__STATIC_PREVIEW__ = true;
  const KEY = 'freshfemme-preview-cart-v1';
  const load = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  };
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) { /* modo anônimo */ }
  };
  let lines = load();

  let previewPromise;
  const getPreview = () => {
    if (!previewPromise) {
      previewPromise = Promise.all([
        import('/preview/liquid.browser.mjs'),
        import('/preview/core.mjs'),
        fetch('/preview/bundle.json').then((r) => r.json()),
      ]).then(([liquid, core, bundle]) => core.createPreview({
        Liquid: liquid.Liquid,
        Tag: liquid.Tag,
        files: bundle.files,
        data: bundle.data,
        site: { origin: location.origin, version: bundle.version },
      }));
    }
    return previewPromise;
  };

  const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
  const readBody = (init) => {
    const body = init && init.body;
    if (!body) return {};
    if (typeof FormData !== 'undefined' && body instanceof FormData) return Object.fromEntries(body.entries());
    if (typeof body === 'string') {
      try { return JSON.parse(body); } catch (e) { return Object.fromEntries(new URLSearchParams(body)); }
    }
    return {};
  };
  const summary = (preview) => {
    const cart = preview.cartObject(lines);
    return { item_count: cart.item_count, total_price: cart.total_price };
  };

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (url.origin !== location.origin) return originalFetch(input, init);
    const path = url.pathname;

    if (path === '/cart/add.js') {
      const preview = await getPreview();
      const body = readBody(init);
      const found = preview.findVariant(body.id);
      if (!found) return json({ status: 422, message: 'Produto não encontrado', description: 'Produto não encontrado' }, 422);
      const qty = Math.max(1, parseInt(body.quantity || '1', 10));
      const line = lines.find((l) => String(l.variant_id) === String(found.variant.id));
      if (line) line.quantity += qty;
      else lines.push({ product_id: found.product.id, variant_id: found.variant.id, quantity: qty });
      save();
      return json({ id: found.variant.id, quantity: qty, title: found.product.title });
    }
    if (path === '/cart/change.js') {
      const preview = await getPreview();
      const body = readBody(init);
      const i = parseInt(body.line, 10) - 1;
      const qty = parseInt(body.quantity, 10);
      if (lines[i]) {
        if (!(qty > 0)) lines.splice(i, 1);
        else lines[i].quantity = qty;
      }
      save();
      return json(summary(preview));
    }
    if (path === '/cart.js') return json(summary(await getPreview()));
    if (url.searchParams.has('sections')) {
      const preview = await getPreview();
      const ids = url.searchParams.get('sections').split(',');
      return json(await preview.renderSections(path, ids, preview.cartObject(lines)));
    }
    if (path === '/search/suggest.json') {
      const preview = await getPreview();
      const q = (url.searchParams.get('q') || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const products = Object.values(preview.store.products)
        .filter((p) => p.title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q))
        .slice(0, 6)
        .map((p) => ({ title: p.title, url: p.url, image: p.featured_image && p.featured_image.src, price: (p.price / 100).toFixed(2) }));
      return json({ resources: { results: { products } } });
    }
    if (path === '/recommendations/products') return new Response('', { status: 404 });
    return originalFetch(input, init);
  };

  const toast = (msg) => {
    if (window.FreshTheme) window.FreshTheme.toast(msg);
    else alert(msg);
  };
  const MSG_CHECKOUT = 'Esta é uma prévia do novo site. O pagamento vai funcionar quando o tema estiver na loja da Shopify.';
  const MSG_FORM = 'Prévia do novo site: os formulários vão funcionar quando o tema estiver na loja da Shopify.';

  // pagamento e formulários: só avisam
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form.matches('[data-product-form]') || form.matches('[role="search"]') || form.matches('[data-filter-form]')) return;
    const submitter = e.submitter;
    if ((submitter && submitter.name === 'checkout') || form.querySelector('[name="checkout"]')) {
      e.preventDefault();
      toast(MSG_CHECKOUT);
      return;
    }
    if (form.method && form.method.toLowerCase() === 'post') {
      e.preventDefault();
      toast(MSG_FORM);
    }
  }, true);
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-preview-checkout]')) {
      e.preventDefault();
      toast(MSG_CHECKOUT);
    }
  }, true);

  const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const priceOf = (card) => {
    const el = card.querySelector('[data-price-current]');
    return el ? parseFloat(el.textContent.replace(/[^\d,]/g, '').replace(',', '.')) || 0 : 0;
  };

  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);

    // carrinho guardado de outra página
    if (lines.length && window.FreshCart) {
      const count = lines.reduce((s, l) => s + l.quantity, 0);
      document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = count; el.dataset.count = count; });
      window.FreshCart.refresh(location.pathname.startsWith('/cart')).catch(() => {});
    }

    // busca: a página traz todos os produtos e filtramos aqui
    if (location.pathname.startsWith('/search')) {
      const q = (params.get('q') || '').trim();
      const input = document.getElementById('SearchPageInput');
      if (input) input.value = q;
      const cards = Array.from(document.querySelectorAll('.product-grid .card'));
      let shown = 0;
      cards.forEach((card) => {
        const title = card.querySelector('.card__title');
        const ok = !q || (title && normalize(title.textContent).includes(normalize(q)));
        card.hidden = !ok;
        if (ok) shown++;
      });
      const info = document.querySelector('.page-hero__text');
      if (info) info.textContent = q ? `${shown} ${shown === 1 ? 'resultado' : 'resultados'} para "${q}"` : `${shown} produtos`;
    }

    // coleção: ordenação por preço feita aqui
    const sort = params.get('sort_by');
    const grid = document.querySelector('.collection .product-grid');
    if (grid && sort) {
      const select = document.querySelector('[data-sort]');
      if (select) select.value = sort;
      if (sort === 'price-ascending' || sort === 'price-descending') {
        const cards = Array.from(grid.children);
        cards.sort((a, b) => (priceOf(a) - priceOf(b)) * (sort === 'price-ascending' ? 1 : -1));
        cards.forEach((c) => grid.appendChild(c));
      }
    }
  });
})();
