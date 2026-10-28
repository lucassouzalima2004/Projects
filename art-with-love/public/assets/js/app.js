/* Loja Art with Love: rotas, sacola, checkout, busca e detalhes de interação. */
import {
  SHOP, esc, money, plural, products, productById, collections, photo, productUrl, bag,
  freeLeft, shipping, waLink, igLink, track, pixelData, MAX_QTY,
} from './lib.js';
import * as views from './views.js';

const $ = (s, r = document) => r.querySelector(s);
const view = $('#view');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
const BRAND = 'Art with Love by Lulu';
let booted = false;

/* ================================================================= ROTAS === */
const routes = [
  [/^\/$/, () => views.home()],
  [/^\/shop\/?$/, (m, u) => views.shop(null, u)],
  [/^\/shop\/([\w-]+)\/?$/, (m, u) => views.shop(m[1], u)],
  [/^\/product\/([\w-]+)\/?$/, (m, u) => views.product(m[1], u)],
  [/^\/made-to-order\/?$/, () => views.madeToOrder()],
  [/^\/about\/?$/, () => views.about()],
  [/^\/help\/?$/, () => views.help()],
  [/^\/legal\/?$/, () => views.legal()],
  [/^\/thank-you\/?$/, (m, u) => views.thanks(u)],
];

function resolve(url) {
  for (const [re, fn] of routes) {
    const m = url.pathname.match(re);
    if (m) return fn(m, url);
  }
  return views.notFound();
}

const newKey = () => Math.random().toString(36).slice(2, 10);
const scrollMemory = new Map();
let cleanup = null;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!history.state?.key) history.replaceState({ key: newKey() }, '');

let scrollTick = 0;
addEventListener('scroll', () => {
  if (scrollTick) return;
  scrollTick = requestAnimationFrame(() => {
    scrollTick = 0;
    scrollMemory.set(history.state?.key, scrollY);
    $('#header').classList.toggle('is-scrolled', scrollY > 8);
  });
}, { passive: true });

function scrollToHash(hash, { smooth = false, focus = false } = {}) {
  let id = '';
  try { id = decodeURIComponent((hash || '').slice(1)); } catch { id = (hash || '').slice(1); }
  const el = id && document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: smooth && !reduced.matches ? 'smooth' : 'auto' });
  if (focus) { // leva o foco junto (link "Skip to content", índices das páginas de ajuda)
    if (!el.matches('a[href], button, input, select, textarea, [tabindex]')) el.tabIndex = -1;
    el.focus({ preventScroll: true });
  }
  return true;
}

function safeResolve(url) {
  try {
    return resolve(url);
  } catch (err) {
    console.error(err); // erro no catálogo: mostra a 404 em vez de travar a loja
    return views.notFound();
  }
}

function render(url, { pop = false } = {}) {
  const page = safeResolve(url);
  const swap = () => {
    if (cleanup) cleanup();
    cleanup = null;
    revealer?.disconnect();
    view.innerHTML = page.html;
    setMeta(page, url);
    markNav(url);
    try {
      const c = page.mount?.(view, api);
      if (typeof c === 'function') cleanup = c;
    } catch (err) {
      console.error(err);
    }
    reveal(view);
    if (pop && scrollMemory.has(history.state?.key)) scrollTo(0, scrollMemory.get(history.state.key));
    else if (!scrollToHash(url.hash)) scrollTo(0, 0);
  };

  if (booted && document.startViewTransition && !reduced.matches) {
    const t = document.startViewTransition(swap);
    // ao navegar muito rápido a transição anterior é pulada; não é erro
    [t.ready, t.finished, t.updateCallbackDone].forEach((pr) => pr.catch(() => {}));
  } else {
    swap();
    if (booted) {
      view.classList.remove('view-enter');
      void view.offsetWidth;
      view.classList.add('view-enter');
    }
  }
  if (booted) {
    view.focus({ preventScroll: true });
    track('PageView');
  }
}

function navigate(href, { replace = false, silent = false } = {}) {
  const url = new URL(href, location.href);
  const path = url.pathname + url.search + url.hash;
  if (replace) history.replaceState(history.state, '', path);
  else {
    scrollMemory.set(history.state?.key, scrollY);
    history.pushState({ key: newKey() }, '', path);
  }
  if (!silent) render(url);
}

addEventListener('popstate', () => {
  closeAll();
  render(new URL(location.href), { pop: true });
});

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href]');
  if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || /^\/(assets|api)\//.test(url.pathname)) return;
  e.preventDefault();
  closeAll();
  if (url.pathname === location.pathname && url.search === location.search) {
    if (url.hash) {
      scrollToHash(url.hash, { smooth: true, focus: true });
      history.replaceState(history.state, '', url.hash);
    } else scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' });
    return;
  }
  navigate(url.href);
});

function setMeta(page, url) {
  document.title = page.title.includes('Luxury handmade') ? `${BRAND} · ${page.title}` : `${page.title} · ${BRAND}`;
  const set = (sel, attr, value) => {
    const el = $(sel);
    if (el) el.setAttribute(attr, value);
  };
  set('meta[name="description"]', 'content', page.description || '');
  set('meta[property="og:title"]', 'content', document.title);
  set('meta[property="og:description"]', 'content', page.description || '');
  set('link[rel="canonical"]', 'href', `${SHOP.siteUrl || location.origin}${url.pathname}`);
  let robots = $('meta[name="robots"]');
  if (page.noindex && !robots) {
    robots = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex' });
    document.head.append(robots);
  } else if (!page.noindex && robots) robots.remove();
}

function markNav(url) {
  document.querySelectorAll('.header__nav a, .menu a').forEach((a) => {
    const href = new URL(a.href).pathname;
    const on = href === url.pathname || (href !== '/shop' && href !== '/' && url.pathname.startsWith(href));
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

/* Seções que aparecem ao rolar */
const revealer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('is-in');
    revealer.unobserve(en.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
  : null;

function reveal(root) {
  root.querySelectorAll('[data-reveal]').forEach((el) => {
    if (!revealer || reduced.matches) el.classList.add('is-in');
    else revealer.observe(el);
  });
}

/* ============================================================== PAINÉIS === */
const opened = [];

function openPanel(id, opener) {
  const el = document.getElementById(id);
  if (!el || opened.includes(el)) return;
  closeAll();
  clearTimeout(el._hideTimer);
  el.hidden = false;
  el._opener = opener || document.activeElement;
  $('#toast').classList.remove('is-on');
  opened.push(el);
  // trava a rolagem sem a página "pular" onde a barra de rolagem ocupa espaço (Windows)
  document.documentElement.style.setProperty('--sbw', `${innerWidth - document.documentElement.clientWidth}px`);
  document.body.classList.add('is-locked');
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-open')));
  const focusable = el.querySelector('input, [data-autofocus]') || el.querySelector('button, a[href]');
  setTimeout(() => focusable?.focus({ preventScroll: true }), 60);
  if (id === 'menu') $('.header__menu').setAttribute('aria-expanded', 'true');
  if (id === 'bag') renderBag(true);
}

function closePanel(el) {
  if (!el || el.hidden) return;
  el.classList.remove('is-open');
  if (opened.includes(el)) opened.splice(opened.indexOf(el), 1);
  if (!opened.length) document.body.classList.remove('is-locked');
  if (el.id === 'menu') $('.header__menu').setAttribute('aria-expanded', 'false');
  const done = () => { if (!opened.includes(el)) el.hidden = true; };
  if (reduced.matches) done();
  else el._hideTimer = setTimeout(done, 450);
  const back = el._opener;
  const visible = back?.isConnected && back.getClientRects().length && getComputedStyle(back).visibility !== 'hidden';
  const fallback = { bag: '#bag-btn', menu: '.header__menu', search: '[data-open="search"]' }[el.id];
  (visible ? back : fallback ? $(fallback) : view).focus({ preventScroll: true });
}

function closeAll() {
  [...opened].forEach(closePanel);
}

document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open]');
  if (opener) {
    e.preventDefault();
    openPanel(opener.dataset.open, opener);
    return;
  }
  const panel = e.target.closest('.sheet, .search, .zoom');
  if (!panel) return;
  // fecha no X ou clicando fora do painel
  if (e.target.closest('[data-close]') || e.target === panel) closePanel(panel);
});

document.addEventListener('keydown', (e) => {
  const top = opened[opened.length - 1];
  if (e.key === 'Escape' && top) {
    closePanel(top);
    return;
  }
  if (e.key === 'Tab' && top) { // mantém o foco dentro do painel aberto
    const items = [...top.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter((x) => x.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  if (e.key === '/' && !opened.length && !/input|textarea|select/i.test(document.activeElement.tagName)) {
    e.preventDefault();
    openPanel('search');
  }
});

/* ================================================================ SACOLA === */
let checkoutMode = 'stripe'; // muda para 'whatsapp' quando o pagamento online não está ligado
let bagKeys = '';

const lineKey = (l) => `${l.id}:${l.variantId || ''}`;

function updateCount() {
  const n = bag.count;
  const badge = $('#bag-count');
  badge.textContent = n;
  badge.hidden = n === 0;
  $('#bag-btn').setAttribute('aria-label', `Bag, ${plural(n, 'item')}`);
}

function orderMessage(lines) {
  const sub = lines.reduce((n, l) => n + l.total, 0);
  return [
    'Hi Lulu! I would like to order 💕',
    '',
    ...lines.map((l) => `• ${l.qty} × ${l.product.name}${l.variant ? ` (${l.variant.name})` : ''}, ${money(l.total)}`),
    '',
    `Subtotal: ${money(sub)}${freeLeft(sub) === 0 ? ' (free UK delivery)' : ''}`,
    'Delivery address and payment: please let me know the next steps.',
    '',
    'Thank you!',
  ].join('\n');
}

function freeBar(sub) {
  const left = freeLeft(sub);
  const pct = Math.min(100, (sub / shipping.freeOver) * 100);
  return `
    <div class="free" id="bag-free">
      <span>${left > 0 ? `You are <b>${money(left)}</b> away from free UK delivery` : '<b>Free UK delivery</b> is on us 💕'}</span>
      <span class="free__bar"><span style="width:${pct}%"></span></span>
    </div>`;
}

function lineItem(l) {
  return `
    <div class="line-item" data-key="${lineKey(l)}">
      <a href="${productUrl(l.product, l.variant)}"><img src="${photo(l.product, l.variant, 1)}" alt="" width="76" height="101"></a>
      <div class="line-item__info">
        <a class="line-item__name" href="${productUrl(l.product, l.variant)}">${esc(l.product.name)}</a>
        <span class="line-item__var">${l.variant ? `${esc(l.variant.name)} · ` : ''}${esc(l.product.size)}</span>
        <div class="line-item__controls">
          <div class="qty qty--sm" role="group" aria-label="Quantity of ${esc(l.product.name)}">
            <button type="button" data-line-qty="-1" aria-label="One fewer">${icon('minus')}</button>
            <output aria-live="polite">${l.qty}</output>
            <button type="button" data-line-qty="1" aria-label="One more" ${bag.room(l.id, l.variantId) <= 0 ? 'disabled' : ''}>${icon('plus')}</button>
          </div>
          <button class="line-item__remove" type="button" data-line-remove>Remove</button>
        </div>
      </div>
      <span class="price" data-line-total>${money(l.total)}</span>
    </div>`;
}

function renderBag(force) {
  updateCount();
  const body = $('#bag-body');
  const foot = $('#bag-foot');
  const lines = bag.lines;
  const keys = lines.map(lineKey).join('|');
  $('#bag-title').innerHTML = `Your bag${lines.length ? ` <small>${plural(bag.count, 'item')}</small>` : ''}`;

  if (!lines.length) {
    const ideas = products.filter((p) => p.featured && p.stock !== 0).slice(0, 3);
    body.innerHTML = `
      <div class="bag__empty">
        <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-heart"/></svg>
        <h3>Your bag is empty</h3>
        <p>Let’s find a bow she will love.</p>
        <a class="btn btn--primary" href="/shop">Shop the bows</a>
        <div class="bag__suggest">
          <h4>Customer favourites</h4>
          ${ideas.map((p) => `<a class="mini" href="${productUrl(p)}"><img src="${photo(p, p.variants?.[0], 1)}" alt="" width="56" height="74"><span><strong>${esc(p.name)}</strong><span>${esc(p.size)}</span></span><span class="price">${money(p.price)}</span></a>`).join('')}
        </div>
      </div>`;
    foot.hidden = true;
    bagKeys = '';
    return;
  }

  const sub = bag.subtotal;
  if (!force && keys === bagKeys) {
    // Só mudou a quantidade: atualiza os números sem redesenhar (sem piscar)
    lines.forEach((l) => {
      const row = body.querySelector(`[data-key="${CSS.escape(lineKey(l))}"]`);
      if (!row) return;
      row.querySelector('output').textContent = l.qty;
      row.querySelector('[data-line-total]').textContent = money(l.total);
      row.querySelector('[data-line-qty="1"]').disabled = bag.room(l.id, l.variantId) <= 0;
    });
    $('#bag-free').outerHTML = freeBar(sub);
  } else {
    body.innerHTML = freeBar(sub) + lines.map(lineItem).join('');
  }
  bagKeys = keys;

  const delivery = freeLeft(sub) === 0 ? 'Free' : `from ${money(Math.min(...shipping.options.map((o) => o.price)))}`;
  foot.hidden = false;
  foot.innerHTML = `
    <div class="totals">
      <div><span>Subtotal</span><span class="price">${money(sub)}</span></div>
      <div><small>UK delivery</small><small>${delivery}</small></div>
    </div>
    ${checkoutMode === 'stripe' ? `
      <button class="btn btn--primary btn--block" type="button" id="checkout">${icon('lock')} Checkout · ${money(sub)}</button>
      <p class="bag__secure">${icon('lock')} Secure payment by Stripe</p>
      <div class="pay-row" aria-label="Accepted payments"><span>VISA</span><span>MASTERCARD</span><span>AMEX</span><span>APPLE PAY</span><span>G PAY</span></div>
    ` : whatsappCheckout(lines)}
    <div id="bag-msg"></div>`;
}

function whatsappCheckout(lines, reason) {
  return `
    <div class="fallback">
      <p>${reason || 'Send your order to Lulu on WhatsApp. She will confirm it and send you a secure payment link.'}</p>
      <a class="btn btn--wa btn--block" href="${waLink(orderMessage(lines))}" target="_blank" rel="noopener" data-wa-order>${icon('wa')} Order on WhatsApp</a>
      ${SHOP.instagram ? `<a class="link" href="${igLink()}" target="_blank" rel="noopener" style="justify-self:center">or message @${esc(SHOP.instagram)} ${icon('arrow')}</a>` : ''}
    </div>`;
}

$('#bag').addEventListener('click', (e) => {
  const row = e.target.closest('.line-item');
  const qtyBtn = e.target.closest('[data-line-qty]');
  if (row && qtyBtn) {
    const [id, variant] = row.dataset.key.split(':');
    const cur = bag.qtyOf(id, variant || null);
    const next = cur + Number(qtyBtn.dataset.lineQty);
    if (next <= 0) removeLine(row, id, variant);
    else bag.set(id, variant || null, next);
    return;
  }
  if (row && e.target.closest('[data-line-remove]')) {
    const [id, variant] = row.dataset.key.split(':');
    removeLine(row, id, variant);
    return;
  }
  if (e.target.closest('#checkout')) checkout(e.target.closest('#checkout'));
  if (e.target.closest('[data-wa-order]')) track('InitiateCheckout', pixelData(bag.lines));
});

function removeLine(row, id, variant) {
  const index = [...row.parentNode.querySelectorAll('.line-item')].indexOf(row);
  const hadFocus = row.contains(document.activeElement);
  row.classList.add('is-leaving');
  setTimeout(() => {
    bag.remove(id, variant || null);
    if (!hadFocus) return;
    // mantém o foco dentro da sacola: próxima linha, ou o botão de fechar
    const rows = $('#bag-body').querySelectorAll('.line-item');
    const next = rows[Math.min(index, rows.length - 1)];
    (next?.querySelector('[data-line-remove]') || $('#bag [data-close]')).focus();
  }, reduced.matches ? 0 : 320);
}

async function checkout(btn) {
  const lines = bag.lines;
  if (!lines.length) return;
  btn.setAttribute('aria-busy', 'true');
  track('InitiateCheckout', pixelData(lines));
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: lines.map((l) => ({ id: l.id, variant: l.variantId, qty: l.qty })) }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) {
      location.assign(data.url);
      return;
    }
    btn.removeAttribute('aria-busy');
    if (res.status === 409 && data.error) {
      $('#bag-msg').innerHTML = `<p class="stock-note">${esc(data.error)}</p>`;
      return;
    }
    checkoutMode = 'whatsapp';
    $('#bag-msg').innerHTML = whatsappCheckout(lines, 'Online payment is not available right now. Send your order to Lulu on WhatsApp and she will send you a secure payment link.');
    btn.remove();
  } catch {
    btn.removeAttribute('aria-busy');
    $('#bag-msg').innerHTML = whatsappCheckout(lines, 'We could not reach the payment page. Check your connection and try again, or send your order on WhatsApp.');
  }
}

// Descobre se o pagamento online está ligado (STRIPE_SECRET_KEY no Cloudflare)
async function detectCheckout() {
  try {
    const res = await fetch('/api/checkout', { headers: { accept: 'application/json' } });
    const data = await res.json();
    checkoutMode = data.enabled ? 'stripe' : 'whatsapp';
  } catch {
    checkoutMode = 'whatsapp';
  }
  if (!$('#bag').hidden) renderBag(true);
}

bag.subscribe(() => renderBag());

/* ------------------------------------------------------- adicionar à sacola --- */
let toastTimer;

function toast(html, ms = 4200) {
  const el = $('#toast');
  el.innerHTML = html;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), ms);
}
$('#toast').addEventListener('pointerenter', () => clearTimeout(toastTimer));
$('#toast').addEventListener('pointerleave', () => { toastTimer = setTimeout(() => $('#toast').classList.remove('is-on'), 1800); });
$('#toast').addEventListener('click', (e) => {
  if (e.target.closest('[data-open]')) $('#toast').classList.remove('is-on');
});

function fly(img) {
  if (!img || reduced.matches || !img.getBoundingClientRect) return;
  const from = img.getBoundingClientRect();
  const to = $('#bag-btn').getBoundingClientRect();
  if (!from.width) return;
  const f = Object.assign(document.createElement('img'), { src: img.currentSrc || img.src, alt: '', className: 'flyer' });
  Object.assign(f.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
  document.body.append(f);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const s = 28 / from.width;
  f.animate([
    { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1, borderRadius: '14px' },
    { transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 60}px) scale(${Math.max(s, 0.35)}) rotate(-8deg)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(10deg)`, opacity: 0.2, borderRadius: '50%' },
  ], { duration: 820, easing: 'cubic-bezier(.5,0,.2,1)' }).finished.then(() => f.remove(), () => f.remove());
}

function addToBag(id, variant, qty, img) {
  const p = productById.get(id);
  const v = p.variants ? p.variants.find((x) => x.id === variant) || p.variants[0] : null;
  const added = bag.add(id, v ? v.id : null, qty);
  if (!added) {
    const why = typeof p.stock === 'number'
      ? `<b>That is all we have</b><span>All ${p.stock} of the ${esc(p.name)} are already in your bag.</span>`
      : `<b>Your bag is full of these</b><span>You can order up to ${MAX_QTY} online. For more, message Lulu.</span>`;
    toast(`<div class="toast__card"><img src="${photo(p, v, 1)}" alt=""><p>${why}</p><button class="btn btn--light btn--sm" type="button" data-open="bag">View bag</button></div>`);
    return;
  }
  fly(img);
  const btn = $('#bag-btn');
  btn.classList.remove('is-bump');
  void btn.offsetWidth;
  btn.classList.add('is-bump');
  track('AddToCart', {
    content_type: 'product', content_ids: [v ? `${id}:${v.id}` : id], content_name: p.name,
    value: p.price * added, currency: SHOP.currency,
  });
  toast(`
    <div class="toast__card">
      <img src="${photo(p, v, 1)}" alt="">
      <p><b>Added to your bag</b><span>${added > 1 ? `${added} × ` : ''}${esc(p.name)}${v ? ` · ${esc(v.name)}` : ''}</span></p>
      <button class="btn btn--light btn--sm" type="button" data-open="bag">View bag</button>
    </div>`);
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-add]');
  if (!b) return;
  e.preventDefault();
  addToBag(b.dataset.add, null, 1, b.closest('.card')?.querySelector('.card__media img'));
});

/* ================================================================= BUSCA === */
const index = products.map((p) => ({
  p,
  text: [p.name, p.summary, p.size, ...(p.details || []), ...(p.tags || []),
    ...collections.filter((c) => c.id === p.range || (p.tags || []).includes(c.id)).map((c) => c.name),
    ...(p.variants || []).map((v) => v.name)].join(' ').toLowerCase(),
}));
const SUGGEST = ['Porcelain', 'Headband', 'Pompom', 'Velvet', 'Rainbow', 'Pair', 'Flamingo'];

function highlight(text, terms) {
  const words = terms.filter((t) => t.length > 1).sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return esc(text);
  // split com grupo de captura: posições ímpares são os trechos encontrados
  return text.split(new RegExp(`(${words.join('|')})`, 'i')).map((part, i) => (i % 2 ? `<mark>${esc(part)}</mark>` : esc(part))).join('');
}

function runSearch(q) {
  const box = $('#search-results');
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) {
    box.innerHTML = `<div class="search__hint"><span>Try searching for</span><div class="search__tags">${SUGGEST.map((s) => `<button type="button" data-suggest="${s}">${s}</button>`).join('')}</div></div>`;
    return;
  }
  const hits = index.filter((x) => terms.every((t) => x.text.includes(t))).map((x) => x.p);
  box.innerHTML = hits.length
    ? hits.slice(0, 8).map((p) => `
      <a class="mini" href="${productUrl(p)}">
        <img src="${photo(p, p.variants?.[0], 1)}" alt="" width="56" height="74" loading="lazy">
        <span><strong>${highlight(p.name, terms)}</strong><span>${esc(p.size)}${p.variants ? ` · ${p.variants.length} colours` : ''}</span></span>
        <span class="price">${money(p.price)}</span>
      </a>`).join('')
    : `<div class="search__hint">No bows match “${esc(q)}”. Try a colour or a character, or <a href="/made-to-order">ask Lulu to make one</a>.</div>`;
}

const searchInput = $('#search-input');
searchInput.addEventListener('input', () => runSearch(searchInput.value));
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const first = $('#search-results a.mini');
    if (first) first.click();
  }
});
$('#search-results').addEventListener('click', (e) => {
  const s = e.target.closest('[data-suggest]');
  if (!s) return;
  searchInput.value = s.dataset.suggest;
  runSearch(s.dataset.suggest);
  searchInput.focus();
});
document.querySelector('[data-open="search"]').addEventListener('click', () => {
  searchInput.value = '';
  runSearch('');
});

/* ================================================================== ZOOM === */
const zoom = { list: [], i: 0, alt: null };

function showZoom() {
  const img = $('#zoom-img');
  img.style.opacity = 0;
  img.onload = () => { img.style.opacity = 1; };
  img.src = zoom.list[zoom.i];
  img.alt = zoom.alt ? zoom.alt(zoom.list[zoom.i], zoom.i) : '';
  $('#zoom-count').textContent = `${zoom.i + 1} / ${zoom.list.length}`;
  document.querySelectorAll('[data-zoom]').forEach((b) => { b.hidden = zoom.list.length < 2; });
}

function openZoom(list, i, alt) {
  Object.assign(zoom, { list, i, alt });
  showZoom();
  openPanel('zoom');
}

const stepZoom = (d) => {
  zoom.i = (zoom.i + d + zoom.list.length) % zoom.list.length;
  showZoom();
};

$('#zoom').addEventListener('click', (e) => {
  const b = e.target.closest('[data-zoom]');
  if (b) stepZoom(Number(b.dataset.zoom));
  else if (e.target.id === 'zoom-img') closePanel($('#zoom'));
});
document.addEventListener('keydown', (e) => {
  if ($('#zoom').hidden) return;
  if (e.key === 'ArrowRight') stepZoom(1);
  if (e.key === 'ArrowLeft') stepZoom(-1);
});
let zx = null;
$('#zoom').addEventListener('pointerdown', (e) => { zx = e.clientX; });
$('#zoom').addEventListener('pointerup', (e) => {
  if (zx === null) return;
  const dx = e.clientX - zx;
  zx = null;
  if (Math.abs(dx) > 50 && zoom.list.length > 1) stepZoom(dx < 0 ? 1 : -1);
});

const api = { navigate, addToBag, openZoom };

/* ============================================================ DETALHES === */
// Holograma e leve inclinação que seguem o ponteiro
document.addEventListener('pointermove', (e) => {
  if (!finePointer.matches || reduced.matches) return;
  const el = e.target.closest?.('.foil');
  if (!el) return;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty('--mx', `${x * 100}%`);
  el.style.setProperty('--my', `${y * 100}%`);
  el.style.setProperty('--angle', `${100 + x * 60}deg`);
  if (el.classList.contains('card__media')) {
    el.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
  }
}, { passive: true });
document.addEventListener('pointerout', (e) => {
  const el = e.target.closest?.('.card__media');
  if (el && !el.contains(e.relatedTarget)) {
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }
});

// Faixa de avisos no topo
function announce() {
  const items = [
    `${icon('spark')} Free UK delivery on orders over ${money(shipping.freeOver)}`,
    `${icon('spark')} Every piece handmade in London`,
    `${icon('spark')} Birthday candles made to order · <a href="/made-to-order">Start yours</a>`,
  ];
  const bar = $('#announce');
  bar.innerHTML = items.map((t, i) => `<p class="announce__item${i ? '' : ' is-on'}">${t}</p>`).join('');
  if (reduced.matches) return;
  let i = 0;
  setInterval(() => {
    const els = bar.children;
    els[i].classList.replace('is-on', 'is-off');
    const prev = els[i];
    setTimeout(() => prev.classList.remove('is-off'), 700);
    i = (i + 1) % els.length;
    els[i].classList.add('is-on');
  }, 4800);
}

function shell() {
  $('#year').textContent = new Date().getFullYear();
  const social = [
    SHOP.instagram && `<a href="${igLink()}" target="_blank" rel="noopener" aria-label="Instagram">${icon('ig')}</a>`,
    SHOP.whatsapp && `<a href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('wa')}</a>`,
    SHOP.email && `<a href="mailto:${esc(SHOP.email)}" aria-label="Email">${icon('mail')}</a>`,
  ].filter(Boolean).join('');
  $('#footer-social').innerHTML = social;

  $('#menu-links').innerHTML = `
    <a href="/shop">Shop all ${icon('chev')}</a>
    ${collections.filter((c) => c.kind === 'range').map((c) => `<a href="/shop/${c.id}">${esc(c.name)} ${icon('chev')}</a>`).join('')}
    <a href="/made-to-order">Made to order ${icon('chev')}</a>
    <a href="/about">Our story ${icon('chev')}</a>
    <div class="menu__small">
      <a href="/help">Delivery &amp; returns</a>
      ${SHOP.instagram ? `<a href="${igLink()}" target="_blank" rel="noopener">${icon('ig')} @${esc(SHOP.instagram)}</a>` : ''}
      <a href="${waLink()}" target="_blank" rel="noopener">${icon('wa')} WhatsApp</a>
    </div>`;
  announce();
  updateCount();
}

/* ======================================================= COOKIES + PIXEL === */
function loadPixel(id) {
  /* eslint-disable */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', id);
  window.fbq('track', 'PageView');
}

function consent() {
  if (!SHOP.metaPixelId) return;
  let choice = null;
  try { choice = localStorage.getItem('awl-consent'); } catch { /* sem armazenamento */ }
  if (choice === 'yes') return loadPixel(SHOP.metaPixelId);
  if (choice === 'no') return;
  const box = $('#consent');
  box.innerHTML = `
    <p>We would like to use cookies to understand which of our Instagram and Facebook posts bring you here. Your bag works either way. <a href="/legal#cookies">Learn more</a></p>
    <div class="consent__actions">
      <button class="btn btn--ghost" type="button" data-consent="no">No thanks</button>
      <button class="btn btn--primary" type="button" data-consent="yes">Accept</button>
    </div>`;
  box.hidden = false;
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-consent]');
    if (!b) return;
    try { localStorage.setItem('awl-consent', b.dataset.consent); } catch { /* sem armazenamento */ }
    box.hidden = true;
    if (b.dataset.consent === 'yes') loadPixel(SHOP.metaPixelId);
  });
}

/* ================================================================ INÍCIO === */
shell();
renderBag();
const start = new URL(location.href);
if (start.searchParams.get('bag') === 'open') {
  start.searchParams.delete('bag');
  history.replaceState(history.state, '', start.pathname + start.search + start.hash);
  setTimeout(() => openPanel('bag'), 400);
}
render(start);
booted = true;
consent();
(window.requestIdleCallback || ((fn) => setTimeout(fn, 1200)))(detectCheckout);
