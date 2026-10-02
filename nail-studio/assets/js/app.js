/* =============================================================================
   Comportamento do site. Os textos, serviços e preços vêm de content.js
   (window.SITE); normalmente não é preciso mexer neste arquivo.
   ========================================================================== */
(function () {
  'use strict';

  var S = window.SITE;
  if (!S) {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<p style="margin:0;padding:16px;background:#A60F2B;color:#fff;font:16px/1.4 system-ui,sans-serif">' +
        'Não foi possível ler assets/js/content.js. Confira se não falta vírgula ou aspas na última edição.</p>'
    );
    return;
  }

  // Valores padrão para o site não quebrar se algum campo for apagado do content.js
  S.brand = Object.assign({ name: 'Studio', tagline: '' }, S.brand);
  S.location = Object.assign({ city: '', in: { pt: 'na Austrália', en: 'in Australia' } }, S.location);
  ['categories', 'services', 'gallery'].forEach((k) => { if (!Array.isArray(S[k])) S[k] = []; });

  /* ------------------------------------------------------------ helpers */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const byId = (list, id) => list.find((x) => x.id === id);
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* armazenamento indisponível */ } },
  };

  /* ------------------------------------------------------------ state */
  const pick = (list, id) => (byId(list, id) ? id : list[0].id);
  const state = {
    lang: initialLang(),
    selected: new Set(),
    period: '',
    design: {
      shape: pick(S.shapes, 'amendoada'),
      color: pick(S.colors, 'acerola'),
      finish: pick(S.finishes, 'brilho'),
      skin: Math.min(1, S.skins.length - 1),
    },
    inspiration: null,
  };

  function initialLang() {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'pt' || q === 'en') return q;
    const saved = store.get('site-lang');
    if (saved === 'pt' || saved === 'en') return saved;
    const first = (navigator.languages && navigator.languages[0]) || navigator.language || 'pt';
    return /^pt/i.test(first) ? 'pt' : 'en';
  }

  /* ------------------------------------------------------------ i18n */
  const L = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[state.lang] ?? v.pt ?? '' : v ?? '');
  const dict = () => S.text[state.lang] || S.text.pt;
  const t = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict());
  const brandFull = () => [S.brand.name, S.brand.tagline].filter(Boolean).join(' ');

  function fill(str, extra) {
    const tokens = Object.assign(
      {
        brand: brandFull(),
        city: S.location.city || (state.lang === 'pt' ? 'Austrália' : 'Australia'),
        in: L(S.location.in),
      },
      extra
    );
    return String(str ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in tokens ? tokens[k] : m));
  }
  const tt = (path, extra) => fill(t(path), extra);

  const locale = () => (state.lang === 'pt' ? 'pt-BR' : 'en-AU');

  function money(n) {
    const v = Number(n) || 0;
    return S.currency + v.toLocaleString(locale(), { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }

  function duration(min) {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    if (!h) return m + ' min';
    if (state.lang === 'pt') return m ? h + 'h' + String(m).padStart(2, '0') : h + 'h';
    return m ? h + 'h ' + m + 'min' : h + 'h';
  }

  function formatDate(iso) {
    const [y, m, d] = String(iso).split('-').map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString(locale(), { weekday: 'short', day: 'numeric', month: 'short' });
  }

  const countLabel = (n) => (n === 1 ? t('summary.one') : fill(t('summary.other'), { n }));

  /* ------------------------------------------------------------ colour math */
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  function mix(hex, to, amt) {
    const a = rgb(hex);
    const b = rgb(to);
    return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * amt).toString(16).padStart(2, '0')).join('');
  }
  const shade = (hex, amt) => mix(hex, '#000000', amt);
  const tint = (hex, amt) => mix(hex, '#ffffff', amt);
  function luminance(hex) {
    const [r, g, b] = rgb(hex).map((v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /* ------------------------------------------------------------ static texts */
  function applyTexts() {
    document.documentElement.lang = state.lang === 'pt' ? 'pt-BR' : 'en-AU';

    $$('[data-t]').forEach((el) => {
      const v = t(el.dataset.t);
      if (typeof v === 'string') el.innerHTML = fill(v).replace(/ · /g, '&nbsp;· ');
    });
    $$('[data-t-attr]').forEach((el) => {
      el.dataset.tAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        const v = t(key);
        if (attr && typeof v === 'string') el.setAttribute(attr, fill(v));
      });
    });

    $$('[data-brand-name]').forEach((el) => (el.textContent = S.brand.name));
    $$('[data-brand-tag]').forEach((el) => (el.textContent = S.brand.tagline));
    $$('[data-brand-full]').forEach((el) => (el.textContent = brandFull()));
    $$('.logo').forEach((el) => el.setAttribute('aria-label', brandFull()));
    $('.contact').dataset.brand = S.brand.name;

    document.title = tt('meta.title');
    const desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', tt('meta.description'));
    $('#nav').setAttribute('aria-label', state.lang === 'pt' ? 'Principal' : 'Main');
    $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
  }

  /* ------------------------------------------------------------ hero fan */
  const TIP_PATH = 'M30 3C47 3 57 44 57 98L55.5 214C55.4 222 50 227 42 227H18C10 227 4.6 222 4.5 214L3 98C3 44 13 3 30 3Z';
  const colorCode = (id) => 'Nº ' + String(S.colors.findIndex((c) => c.id === id) + 1).padStart(2, '0');

  function renderFan() {
    const n = S.colors.length;
    const step = n > 1 ? Math.min(14, 120 / (n - 1)) : 0;
    const mid = (n - 1) / 2;
    $('#fan-tips').innerHTML = S.colors
      .map((c, i) => {
        const a = (i - mid) * step;
        return (
          `<button type="button" class="tip" data-color="${c.id}" aria-pressed="false" ` +
          `style="--a:${a.toFixed(2)}deg;--d:${Math.abs(i - mid)};--c:${c.hex}">` +
          `<svg viewBox="0 0 60 230" aria-hidden="true">` +
          `<path class="tip__fill" d="${TIP_PATH}"/>` +
          `<path d="${TIP_PATH}" fill="url(#tipShade)"/>` +
          `<path d="M15.5 40C11 72 10.6 122 11.8 170" fill="none" stroke="url(#tipGloss)" stroke-width="5.5" stroke-linecap="round"/>` +
          `<ellipse cx="42" cy="60" rx="2.6" ry="9" fill="#fff" opacity=".3"/>` +
          `<path d="${TIP_PATH}" fill="none" stroke="rgba(38,17,27,.2)" stroke-width="1"/>` +
          `</svg></button>`
        );
      })
      .join('');
  }

  function fanLabels() {
    $$('.tip').forEach((b) => {
      const c = byId(S.colors, b.dataset.color);
      b.setAttribute('aria-label', `${colorCode(c.id)} ${c.name}, ${L(c.desc)}`);
    });
  }

  function showFanCaption(id) {
    const c = byId(S.colors, id) || S.colors[0];
    $('#fan-code').textContent = colorCode(c.id);
    $('#fan-name').textContent = c.name;
    $('#fan-desc').textContent = L(c.desc);
  }

  function syncFan() {
    showFanCaption(state.design.color);
    $$('.tip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.color === state.design.color)));
  }

  /* ------------------------------------------------------------ simple lists */
  function renderLists() {
    $('#trust').innerHTML = (t('trust') || []).map((s) => `<li>${fill(s)}</li>`).join('');
    $('#hygiene').innerHTML = (t('about.hygiene') || []).map((s) => `<li>${fill(s)}</li>`).join('');
    $('#steps').innerHTML = (t('steps.items') || [])
      .map(
        (s, i) =>
          `<li class="step"><span class="step__n" aria-hidden="true">${i + 1}</span>` +
          `<h3>${fill(s.title)}</h3><p>${fill(s.text)}</p></li>`
      )
      .join('');

    const open = new Set($$('#faq details[open]').map((d) => d.dataset.i));
    $('#faq').innerHTML = (t('faq.items') || [])
      .map(
        (f, i) =>
          `<details class="faq__item" data-i="${i}"${open.has(String(i)) ? ' open' : ''}>` +
          `<summary><span>${fill(f.q)}</span><span class="faq__icon" aria-hidden="true"><svg><use href="#i-plus"/></svg></span></summary>` +
          `<div class="faq__a"><p>${fill(f.a)}</p></div></details>`
      )
      .join('');
  }

  function renderGallery() {
    const items = S.gallery || [];
    $('#galeria').hidden = !items.length;
    $('#gallery-grid').innerHTML = items
      .map((g) => `<li><img src="${esc(g.src)}" alt="${esc(L(g.alt))}" loading="lazy" decoding="async"></li>`)
      .join('');
  }

  const waNumber = () => String(S.whatsapp || '').replace(/\D/g, '');
  function prettyPhone(n) {
    if (/^61\d{9}$/.test(n)) return `+61 ${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
    return '+' + n;
  }

  function renderContact() {
    const rows = [
      [t('contact.booking'), esc(t('contact.bookingValue'))],
      [t('contact.hours'), esc(L(S.hours))],
      [t('contact.where'), esc(tt('contact.whereValue'))],
      ['WhatsApp', `<a data-wa href="#" target="_blank" rel="noopener">${prettyPhone(waNumber())}</a>`],
    ];
    if (S.instagram) {
      const user = String(S.instagram).replace(/^@/, '');
      rows.push([
        t('contact.instagram'),
        `<a href="https://www.instagram.com/${encodeURIComponent(user)}/" target="_blank" rel="noopener">@${esc(user)}</a>`,
      ]);
    }
    $('#contact-details').innerHTML = rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('');
  }

  /* ------------------------------------------------------------ service menu */
  const CHECK_PATH = 'M7 1C11 1 13 5 13 10V18C13 19.6 12 20.5 10.5 20.5H3.5C2 20.5 1 19.6 1 18V10C1 5 3 1 7 1Z';

  function savings(s) {
    if (!Array.isArray(s.includes)) return 0;
    const sum = s.includes.reduce((acc, id) => acc + ((byId(S.services, id) || {}).price || 0), 0);
    return Math.max(0, sum - s.price);
  }

  function priceHTML(s) {
    return (s.from ? `<small class="from">${esc(t('services.from'))}</small> ` : '') + money(s.price);
  }

  function renderMenu() {
    $('#menu').innerHTML = S.categories
      .map((cat) => {
        const items = S.services.filter((s) => s.cat === cat.id);
        if (!items.length) return '';
        return (
          `<section class="menu-cat" aria-labelledby="cat-${cat.id}">` +
          `<h4 class="menu-cat__title" id="cat-${cat.id}">${esc(L(cat.name))}</h4>` +
          `<ul class="menu-list" role="list">${items.map(serviceHTML).join('')}</ul></section>`
        );
      })
      .join('');
  }

  function serviceHTML(s) {
    const save = savings(s);
    const meta = [
      `<span class="svc__desc">${esc(L(s.desc))}</span>`,
      `<span class="svc__time">${duration(s.min)}${s.unit ? ' · ' + esc(L(s.unit)) : ''}</span>`,
      save ? `<span class="svc__save">${esc(fill(t('services.save'), { amount: money(save) }))}</span>` : '',
    ].join('');
    return (
      `<li class="svc">` +
      `<input type="checkbox" id="svc-${s.id}" value="${s.id}"${state.selected.has(s.id) ? ' checked' : ''}>` +
      `<label for="svc-${s.id}">` +
      `<svg class="svc__check" viewBox="0 0 14 21" aria-hidden="true"><path class="shape" d="${CHECK_PATH}"/>` +
      `<ellipse class="gloss" cx="4.3" cy="8.6" rx="1.1" ry="3.3"/></svg>` +
      `<span class="svc__main"><span class="svc__top"><span class="svc__name">${esc(L(s.name))}</span>` +
      `<span class="svc__leader" aria-hidden="true"></span></span>` +
      `<span class="svc__meta">${meta}</span></span>` +
      `<span class="svc__price">${priceHTML(s)}</span>` +
      `</label></li>`
    );
  }

  /* ------------------------------------------------------------ summary */
  function totals() {
    const items = S.services.filter((s) => state.selected.has(s.id));
    return {
      items,
      price: items.reduce((a, s) => a + s.price, 0),
      min: items.reduce((a, s) => a + s.min, 0),
      from: items.some((s) => s.from || s.unit),
    };
  }

  let shownIds = new Set();

  function renderSummary() {
    const { items, price, min, from } = totals();
    const list = $('#sum-list');

    if (!items.length) {
      list.innerHTML = `<li class="summary__empty">${esc(t('summary.empty'))}</li>`;
    } else {
      list.innerHTML = items
        .map(
          (s) =>
            `<li class="summary__item${shownIds.has(s.id) ? '' : ' is-new'}">` +
            `<span class="summary__item-name">${esc(L(s.name))}<small>${duration(s.min)}${s.unit ? ' · ' + esc(L(s.unit)) : ''}</small></span>` +
            `<span class="summary__item-price">${priceHTML(s)}</span>` +
            `<button type="button" class="icon-btn" data-remove="${s.id}" aria-label="${esc(t('summary.remove') + ': ' + L(s.name))}">` +
            `<svg aria-hidden="true"><use href="#i-close"/></svg></button></li>`
        )
        .join('');
    }
    shownIds = new Set(items.map((s) => s.id));

    $('#sum-count').textContent = items.length ? countLabel(items.length) : '';
    $('#sum-time').textContent = items.length ? duration(min) : '–';
    $('#sum-total').innerHTML = (items.length && from ? `<small class="from">${esc(t('services.from'))}</small> ` : '') + money(price);
    $('#summary').classList.toggle('is-empty', !items.length);

    $('#sum-inspo').hidden = !state.inspiration;
    if (state.inspiration) $('#sum-inspo-text').textContent = designText(state.inspiration);
    $('#sum-send-label').textContent = items.length || state.inspiration ? t('summary.send') : t('summary.sendEmpty');

    updateBar();
    updateLinks();
  }

  function renderPeriods() {
    const p = t('summary.periods') || {};
    $('#periods').innerHTML = Object.keys(p)
      .map(
        (k) =>
          `<label class="chip"><input type="radio" name="period" value="${k}"${state.period === k ? ' checked' : ''}>` +
          `<span>${esc(p[k])}</span></label>`
      )
      .join('');
  }

  /* ------------------------------------------------------------ WhatsApp */
  function requestMessage() {
    const w = (k) => t('wa.' + k);
    const { items, price, min, from } = totals();
    const blocks = [[tt('wa.greeting')]];

    if (items.length) {
      const lines = [`*${w('services')}*`];
      items.forEach((s) =>
        lines.push(`• ${L(s.name)}${s.unit ? ` (${L(s.unit)})` : ''} — ${s.from ? t('services.from') + ' ' : ''}${money(s.price)}`)
      );
      lines.push(`*${w('total')}:* ${from ? t('services.from') + ' ' : ''}${money(price)} · ${w('approx')} ${duration(min)}`);
      blocks.push(lines);
    }
    if (state.inspiration) blocks.push([`*${w('inspiration')}:* ${designText(state.inspiration)}`]);

    const name = $('#f-name').value.trim();
    const date = $('#f-date').value;
    const notes = $('#f-notes').value.trim();
    const pref = [date && formatDate(date), state.period && t('summary.periods.' + state.period)].filter(Boolean).join(' · ');
    const extra = [];
    if (name) extra.push(`*${w('name')}:* ${name}`);
    if (pref) extra.push(`*${w('preferred')}:* ${pref}`);
    if (notes) extra.push(`*${w('notes')}:* ${notes}`);
    if (extra.length) blocks.push(extra);

    return blocks.map((b) => b.join('\n')).join('\n\n');
  }

  function updateLinks() {
    const href = `https://wa.me/${waNumber()}?text=${encodeURIComponent(requestMessage())}`;
    $$('[data-wa]').forEach((a) => (a.href = href));
  }

  /* ------------------------------------------------------------ nail designer */
  // Comprimento da borda livre em relação à largura da unha
  const FREE_EDGE = { quadrada: 0.3, squoval: 0.3, oval: 0.45, amendoada: 0.95, bailarina: 1, stiletto: 1.25 };

  // Unha com a cutícula em (0,0), crescendo para cima (y negativo)
  function nailPath(shape, w, b) {
    const h = w / 2;
    const c = w * 0.16;
    const e = w * (FREE_EDGE[shape] ?? 0.45);
    const L2 = b + e;
    const f = (n) => +n.toFixed(2);
    let d = `M${f(-h)} ${f(-c)}C${f(-h)} ${f(c * 0.55)} ${f(h)} ${f(c * 0.55)} ${f(h)} ${f(-c)}`;
    switch (shape) {
      case 'quadrada':
      case 'squoval': {
        const r = w * (shape === 'quadrada' ? 0.08 : 0.3);
        d += `L${f(h)} ${f(-L2 + r)}Q${f(h)} ${f(-L2)} ${f(h - r)} ${f(-L2)}L${f(-h + r)} ${f(-L2)}Q${f(-h)} ${f(-L2)} ${f(-h)} ${f(-L2 + r)}`;
        break;
      }
      case 'amendoada':
        d += `L${f(h)} ${f(-b * 0.78)}C${f(h)} ${f(-b - e * 0.42)} ${f(w * 0.17)} ${f(-L2)} 0 ${f(-L2)}` +
          `C${f(-w * 0.17)} ${f(-L2)} ${f(-h)} ${f(-b - e * 0.42)} ${f(-h)} ${f(-b * 0.78)}`;
        break;
      case 'bailarina': {
        const tw = w * 0.27;
        const k = w * 0.05;
        d += `L${f(h)} ${f(-b * 0.85)}Q${f(h * 0.98)} ${f(-b - e * 0.45)} ${f(tw)} ${f(-L2 + k)}` +
          `Q${f(tw)} ${f(-L2)} ${f(tw - k)} ${f(-L2)}L${f(-tw + k)} ${f(-L2)}Q${f(-tw)} ${f(-L2)} ${f(-tw)} ${f(-L2 + k)}` +
          `Q${f(-h * 0.98)} ${f(-b - e * 0.45)} ${f(-h)} ${f(-b * 0.85)}`;
        break;
      }
      case 'stiletto':
        d += `L${f(h)} ${f(-b * 0.75)}C${f(h)} ${f(-b - e * 0.32)} ${f(w * 0.07)} ${f(-L2 + e * 0.22)} 0 ${f(-L2)}` +
          `C${f(-w * 0.07)} ${f(-L2 + e * 0.22)} ${f(-h)} ${f(-b - e * 0.32)} ${f(-h)} ${f(-b * 0.75)}`;
        break;
      default: // oval
        d += `L${f(h)} ${f(-b)}C${f(h)} ${f(-b - e * 0.62)} ${f(h * 0.56)} ${f(-L2)} 0 ${f(-L2)}` +
          `C${f(-h * 0.56)} ${f(-L2)} ${f(-h)} ${f(-b - e * 0.62)} ${f(-h)} ${f(-b)}`;
    }
    return d + 'Z';
  }

  // Dedos: base (x, y), inclinação, comprimento e largura. Ordem = ordem de desenho.
  const FINGERS = [
    { x: 330, y: 520, a: 22, len: 182, w: 62, thumb: true },
    { x: 116, y: 500, a: -12, len: 245, w: 50 },
    { x: 170, y: 500, a: -4.5, len: 318, w: 55 },
    { x: 282, y: 500, a: 7.5, len: 306, w: 55 },
    { x: 226, y: 500, a: 1.5, len: 338, w: 57 },
  ];

  // Brilho do glitter: pontos fixos (pseudoaleatórios) para não "piscar" a cada troca
  const GLITTER = (() => {
    let seed = 11;
    const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    return Array.from({ length: 30 }, () => ({ x: r() * 16, y: r() * 16, r: 0.35 + r() * 0.85, o: 0.4 + r() * 0.6, k: r() }));
  })();

  function fingerPath(len, w) {
    const h = w / 2;
    const ht = w * 0.44;
    return `M${-h} 40L${-ht} ${-len + ht}A${ht} ${ht} 0 0 1 ${ht} ${-len + ht}L${h} 40Z`;
  }

  function handSVG(d) {
    const color = (byId(S.colors, d.color) || S.colors[0]).hex;
    const skin = S.skins[d.skin] || S.skins[0];
    const crease = shade(skin, 0.45);
    const nude = '#F3D8D1';

    const defs = [
      `<linearGradient id="h-side" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".22" stop-color="#000" stop-opacity="0"/>` +
        `<stop offset=".36" stop-color="#fff" stop-opacity=".14"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>` +
        `<stop offset=".74" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>`,
      `<linearGradient id="h-back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>`,
      `<linearGradient id="h-nside" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".24" stop-color="#000" stop-opacity="0"/>` +
        `<stop offset=".76" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>`,
      `<linearGradient id="h-gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".22" stop-color="#fff" stop-opacity=".8"/>` +
        `<stop offset=".7" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
      `<linearGradient id="h-chrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(color, 0.45)}"/><stop offset=".22" stop-color="${tint(color, 0.55)}"/>` +
        `<stop offset=".36" stop-color="#fff"/><stop offset=".48" stop-color="${tint(color, 0.2)}"/><stop offset=".66" stop-color="${shade(color, 0.35)}"/>` +
        `<stop offset=".84" stop-color="${tint(color, 0.5)}"/><stop offset="1" stop-color="${shade(color, 0.5)}"/></linearGradient>`,
      `<linearGradient id="h-cat" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${shade(color, 0.62)}"/><stop offset=".38" stop-color="${shade(color, 0.38)}"/>` +
        `<stop offset=".5" stop-color="${tint(color, 0.55)}"/><stop offset=".57" stop-color="${tint(color, 0.2)}"/><stop offset=".68" stop-color="${shade(color, 0.4)}"/>` +
        `<stop offset="1" stop-color="${shade(color, 0.66)}"/></linearGradient>`,
      `<linearGradient id="h-boomer" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${nude}"/><stop offset=".38" stop-color="${nude}"/><stop offset="1" stop-color="${color}"/></linearGradient>`,
      `<pattern id="h-glitter" width="16" height="16" patternUnits="userSpaceOnUse">` +
        GLITTER.map(
          (g) =>
            `<circle cx="${g.x.toFixed(2)}" cy="${g.y.toFixed(2)}" r="${g.r.toFixed(2)}" fill="${g.k < 0.5 ? '#fff' : g.k < 0.8 ? tint(color, 0.6) : '#EBD8A0'}" opacity="${g.o.toFixed(2)}"/>`
        ).join('') +
        `</pattern>`,
    ];

    // Pele entre os dedos: um "U" atrás de cada par vizinho
    const centerAt = (fg, y) => fg.x + (fg.y - y) * Math.tan((fg.a * Math.PI) / 180);
    const webs = [[1, 2, 404], [2, 4, 400], [4, 3, 404], [3, 0, 418]]
      .map(([l, r, y]) => {
        const xl = centerAt(FINGERS[l], y);
        const xr = centerAt(FINGERS[r], y);
        const dip = l === 3 ? 58 : 44;
        return `M${xl.toFixed(1)} 470L${xl.toFixed(1)} ${y}Q${((xl + xr) / 2).toFixed(1)} ${y + dip} ${xr.toFixed(1)} ${y}L${xr.toFixed(1)} 470Z`;
      })
      .join('');
    const back = `<path d="${webs}" fill="${skin}"/><path d="${webs}" fill="#000" opacity=".1"/>`;

    const fingers = FINGERS.map((fg, i) => {
      const nw = fg.w * (fg.thumb ? 0.62 : 0.66);
      const b = nw * (fg.thumb ? 1.05 : 1.16);
      const cy = -fg.len + 3 + b;
      const np = nailPath(d.shape, nw, b);
      const e = nw * (FREE_EDGE[d.shape] ?? 0.45);
      const total = b + e;
      const h = nw / 2;
      const clip = `h-clip-${i}`;
      defs.push(`<clipPath id="${clip}"><path d="${np}"/></clipPath>`);

      const y1 = -fg.len + fg.len * 0.3;
      const y2 = -fg.len + fg.len * 0.6;
      const crease1 = `M${-fg.w * 0.2} ${y1}Q0 ${y1 + 3} ${fg.w * 0.2} ${y1}M${-fg.w * 0.13} ${y1 + 6}Q0 ${y1 + 8.5} ${fg.w * 0.13} ${y1 + 6}`;
      const crease2 = `M${-fg.w * 0.24} ${y2}Q0 ${y2 + 4} ${fg.w * 0.24} ${y2}M${-fg.w * 0.17} ${y2 + 7}Q0 ${y2 + 10} ${fg.w * 0.17} ${y2 + 7}M${-fg.w * 0.1} ${y2 + 13}Q0 ${y2 + 15} ${fg.w * 0.1} ${y2 + 13}`;

      let base;
      let over = '';
      switch (d.finish) {
        case 'cromado': base = 'url(#h-chrome)'; break;
        case 'olhodegato': base = 'url(#h-cat)'; over = `<path d="${np}" fill="url(#h-glitter)" opacity=".35"/>`; break;
        case 'babyboomer': base = 'url(#h-boomer)'; break;
        case 'francesinha':
          base = nude;
          over = `<path d="M${-h - 4} ${-b * 0.72}Q0 ${-b * 1.2} ${h + 4} ${-b * 0.72}L${h + 4} ${-total - 6}L${-h - 4} ${-total - 6}Z" fill="${color}"/>`;
          break;
        case 'glitter': base = color; over = `<path d="${np}" fill="url(#h-glitter)"/>`; break;
        default: base = color;
      }
      const glossy = d.finish !== 'fosco';
      const gloss = glossy
        ? `<ellipse cx="${-h * 0.42}" cy="${-total * 0.52}" rx="${nw * 0.075}" ry="${total * 0.3}" fill="url(#h-gloss)"/>` +
          `<ellipse cx="${h * 0.36}" cy="${-b * 0.3}" rx="${nw * 0.05}" ry="${nw * 0.1}" fill="#fff" opacity=".35"/>`
        : `<ellipse cx="0" cy="${-total * 0.5}" rx="${nw * 0.4}" ry="${total * 0.4}" fill="#fff" opacity=".06"/>`;

      return (
        `<g transform="translate(${fg.x} ${fg.y}) rotate(${fg.a})">` +
        `<path d="${fingerPath(fg.len, fg.w)}" fill="${skin}"/>` +
        `<path d="${fingerPath(fg.len, fg.w)}" fill="url(#h-side)"/>` +
        `<path d="${crease1}${fg.thumb ? '' : crease2}" fill="none" stroke="${crease}" stroke-opacity=".35" stroke-width="1.4" stroke-linecap="round"/>` +
        `<g transform="translate(0 ${cy.toFixed(2)})">` +
        `<path d="M${-h - 1.5} ${-nw * 0.1}C${-h - 1.5} ${nw * 0.16} ${h + 1.5} ${nw * 0.16} ${h + 1.5} ${-nw * 0.1}" fill="none" stroke="${crease}" stroke-opacity=".35" stroke-width="2"/>` +
        `<path d="${np}" fill="${base}"/>` +
        `<g clip-path="url(#${clip})">${over}<path d="${np}" fill="url(#h-nside)"/>${gloss}</g>` +
        `<path d="${np}" fill="none" stroke="#000" stroke-opacity=".14" stroke-width=".9"/>` +
        `</g></g>`
      );
    }).join('');

    const label = fill(t('design.preview'), {
      shape: L((byId(S.shapes, d.shape) || {}).name).toLowerCase(),
      color: (byId(S.colors, d.color) || {}).name,
      finish: L((byId(S.finishes, d.finish) || {}).name).toLowerCase(),
    });
    return (
      `<svg viewBox="0 70 440 390" role="img" aria-label="${esc(label)}">` +
      `<defs>${defs.join('')}</defs><g class="hand">${back}${fingers}</g></svg>`
    );
  }

  function designText(d) {
    return [
      L((byId(S.shapes, d.shape) || {}).name),
      (byId(S.colors, d.color) || {}).name,
      L((byId(S.finishes, d.finish) || {}).name),
    ]
      .filter(Boolean)
      .join(' · ');
  }

  function renderDesignOptions() {
    const d = state.design;
    $('#opt-shape').innerHTML = S.shapes
      .map(
        (s) =>
          `<label class="opt shape-opt"><input type="radio" name="shape" value="${s.id}"${d.shape === s.id ? ' checked' : ''}>` +
          `<span><svg viewBox="-12 -46 24 50" aria-hidden="true"><path d="${nailPath(s.id, 18, 20)}"/></svg>${esc(L(s.name))}</span></label>`
      )
      .join('');
    $('#opt-color').innerHTML = S.colors
      .map(
        (c) =>
          `<label class="opt swatch" title="${esc(c.name)}"><input type="radio" name="color" value="${c.id}"${d.color === c.id ? ' checked' : ''} ` +
          `aria-label="${esc(c.name + ', ' + L(c.desc))}"><span style="--c:${c.hex}"></span></label>`
      )
      .join('');
    $('#opt-finish').innerHTML = S.finishes
      .map(
        (f) =>
          `<label class="opt finish-opt"><input type="radio" name="finish" value="${f.id}"${d.finish === f.id ? ' checked' : ''}>` +
          `<span><i class="fx fx--${f.id}" aria-hidden="true"></i>${esc(L(f.name))}</span></label>`
      )
      .join('');
    $('#opt-skin').innerHTML = S.skins
      .map(
        (hex, i) =>
          `<label class="opt skin"><input type="radio" name="skin" value="${i}"${d.skin === i ? ' checked' : ''} ` +
          `aria-label="${esc(fill(t('design.skinOption'), { n: i + 1 }))}"><span style="--c:${hex}"></span></label>`
      )
      .join('');
  }

  function syncDesignInputs() {
    ['shape', 'color', 'finish', 'skin'].forEach((n) => {
      const el = $(`#design-form input[name="${n}"][value="${state.design[n]}"]`);
      if (el) el.checked = true;
    });
  }

  function renderDesign() {
    const d = state.design;
    const color = byId(S.colors, d.color) || S.colors[0];
    $('#hand').innerHTML = handSVG(d);
    $('#design-combo').textContent = designText(d);
    $('#design-desc').textContent = L((byId(S.shapes, d.shape) || {}).desc);
    $('#opt-color-name').textContent = color.name;
    $('#opt-finish').style.setProperty('--c', color.hex);
    renderAboutVisual();
    syncFan();
  }

  /* ------------------------------------------------------------ about visual */
  function bottleSVG(c) {
    const dark = luminance(c.hex) < 0.3;
    const ink = dark ? '#FBF8F7' : '#26111B';
    const brand = String(S.brand.name).toUpperCase();
    const spacing = brand.length > 9 ? '.12em' : '.34em';
    return (
      `<svg viewBox="0 0 260 420" role="img" aria-label="${esc(brand + ' ' + colorCode(c.id) + ' ' + c.name)}">` +
      `<defs>` +
      `<linearGradient id="b-cap" x1="0" x2="1"><stop offset="0" stop-color="#12070d"/><stop offset=".26" stop-color="#3e2230"/><stop offset=".52" stop-color="#26111b"/><stop offset="1" stop-color="#0b0408"/></linearGradient>` +
      `<linearGradient id="b-liquid" x1="0" x2="1"><stop offset="0" stop-color="${shade(c.hex, 0.28)}"/><stop offset=".3" stop-color="${c.hex}"/><stop offset=".72" stop-color="${c.hex}"/><stop offset="1" stop-color="${shade(c.hex, 0.32)}"/></linearGradient>` +
      `<linearGradient id="b-glass" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".09" stop-color="#fff" stop-opacity=".06"/><stop offset=".9" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>` +
      `<radialGradient id="b-shadow"><stop offset="0" stop-color="#26111b" stop-opacity=".28"/><stop offset="1" stop-color="#26111b" stop-opacity="0"/></radialGradient>` +
      `</defs>` +
      `<ellipse cx="130" cy="402" rx="112" ry="12" fill="url(#b-shadow)"/>` +
      `<rect x="98" y="14" width="64" height="152" rx="12" fill="url(#b-cap)"/>` +
      `<rect x="109" y="26" width="6" height="128" rx="3" fill="#fff" opacity=".2"/>` +
      `<rect x="104" y="162" width="52" height="26" rx="4" fill="${tint(c.hex, 0.55)}" opacity=".85"/>` +
      `<rect x="104" y="162" width="52" height="26" rx="4" fill="url(#b-glass)"/>` +
      `<rect x="32" y="184" width="196" height="212" rx="40" fill="url(#b-liquid)"/>` +
      `<path d="M32 356h196v0c0 22-18 40-40 40H72c-22 0-40-18-40-40z" fill="#fff" opacity=".2"/>` +
      `<rect x="32" y="184" width="196" height="212" rx="40" fill="url(#b-glass)" stroke="#26111b" stroke-opacity=".16"/>` +
      `<path d="M56 214C50 262 50 318 56 352" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="9" stroke-linecap="round"/>` +
      `<path d="M206 222C210 262 210 300 206 334" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="4" stroke-linecap="round"/>` +
      `<text x="130" y="258" text-anchor="middle" fill="${ink}" style="font-family:var(--font-body);font-size:11px;font-weight:500;letter-spacing:${spacing}">${esc(brand)}</text>` +
      `<text x="130" y="300" text-anchor="middle" fill="${ink}" style="font-family:var(--font-display);font-size:34px;font-style:italic;font-weight:600">${esc(c.name)}</text>` +
      `<text x="130" y="328" text-anchor="middle" fill="${ink}" opacity=".8" style="font-family:var(--font-mono);font-size:10px;letter-spacing:.1em">${colorCode(c.id)}</text>` +
      `</svg>`
    );
  }

  function renderAboutVisual() {
    const box = $('#about-visual');
    if (S.aboutPhoto) {
      if (!box.querySelector('img')) box.innerHTML = `<img src="${esc(S.aboutPhoto)}" alt="" loading="lazy" decoding="async">`;
      return;
    }
    box.innerHTML = bottleSVG(byId(S.colors, state.design.color) || S.colors[0]);
  }

  /* ------------------------------------------------------------ JSON-LD (Google) */
  function renderJsonLd() {
    let el = $('#ld-json');
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = 'ld-json';
      document.head.appendChild(el);
    }
    const data = {
      '@context': 'https://schema.org',
      '@type': 'NailSalon',
      name: brandFull(),
      description: tt('meta.description'),
      url: window.location.href.split('#')[0],
      telephone: '+' + waNumber(),
      priceRange: '$$',
      address: Object.assign({ '@type': 'PostalAddress', addressCountry: 'AU' }, S.location.city ? { addressLocality: S.location.city } : {}),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: t('services.cardTitle'),
        itemListElement: S.services.map((s) => ({
          '@type': 'Offer',
          price: s.price,
          priceCurrency: 'AUD',
          itemOffered: { '@type': 'Service', name: L(s.name), description: L(s.desc) },
        })),
      },
    };
    if (S.instagram) data.sameAs = ['https://www.instagram.com/' + String(S.instagram).replace(/^@/, '') + '/'];
    el.textContent = JSON.stringify(data);
  }

  /* ------------------------------------------------------------ header, menu, bar */
  const header = $('.site-header');
  const toggle = $('.menu-toggle');

  function setMenu(open) {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', t(open ? 'ui.close' : 'ui.menu'));
    $('use', toggle).setAttribute('href', open ? '#i-close' : '#i-menu');
  }

  const bar = $('#mbar');
  const seen = { heroOut: false, summaryIn: false, designIn: false, contactIn: false };

  function updateBar() {
    const has = state.selected.size > 0;
    const show = seen.heroOut && !seen.summaryIn && !seen.designIn && !seen.contactIn;
    bar.classList.toggle('is-visible', show);
    bar.classList.toggle('has-items', has);
    bar.setAttribute('aria-hidden', String(!show));
    $$('a', bar).forEach((a) => (a.tabIndex = show ? 0 : -1));
    if (has) {
      const { items, price, from } = totals();
      $('#mbar-text').textContent = `${countLabel(items.length)} · ${from ? t('services.from') + ' ' : ''}${money(price)}`;
    }
  }

  /* ------------------------------------------------------------ render all */
  function renderAll() {
    applyTexts();
    fanLabels();
    renderLists();
    renderGallery();
    renderContact();
    renderMenu();
    renderPeriods();
    renderDesignOptions();
    renderDesign();
    renderSummary();
    renderJsonLd();
    setMenu(header.classList.contains('nav-open'));
  }

  function setLang(lang) {
    if (lang === state.lang || !S.text[lang]) return;
    state.lang = lang;
    store.set('site-lang', lang);
    renderAll();
  }

  /* ------------------------------------------------------------ events */
  function bindEvents() {
    $$('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toggle.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
    $('#nav').addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && header.classList.contains('nav-open')) { setMenu(false); toggle.focus(); } });
    document.addEventListener('click', (e) => { if (header.classList.contains('nav-open') && !header.contains(e.target)) setMenu(false); });

    // Cartela do topo
    const tips = $('#fan-tips');
    tips.addEventListener('click', (e) => {
      const b = e.target.closest('.tip');
      if (!b) return;
      state.design.color = b.dataset.color;
      syncDesignInputs();
      renderDesign();
    });
    tips.addEventListener('pointerover', (e) => {
      const b = e.target.closest('.tip');
      if (b && e.pointerType === 'mouse') showFanCaption(b.dataset.color);
    });
    tips.addEventListener('pointerleave', () => showFanCaption(state.design.color));

    // Tabela de serviços
    $('#menu').addEventListener('change', (e) => {
      const cb = e.target.closest('input[type="checkbox"]');
      if (!cb) return;
      if (cb.checked) state.selected.add(cb.value);
      else state.selected.delete(cb.value);
      renderSummary();
    });

    $('#sum-list').addEventListener('click', (e) => {
      const b = e.target.closest('[data-remove]');
      if (!b) return;
      const id = b.dataset.remove;
      state.selected.delete(id);
      const cb = document.getElementById('svc-' + id);
      if (cb) cb.checked = false;
      renderSummary();
      const next = $('#sum-list [data-remove]') || $('#sum-clear');
      next.focus();
    });

    $('#sum-clear').addEventListener('click', () => {
      state.selected.clear();
      state.inspiration = null;
      state.period = '';
      $('#sum-form').reset();
      $$('#menu input:checked').forEach((i) => (i.checked = false));
      renderPeriods();
      renderSummary();
      setStatus('');
    });

    $('#sum-inspo-remove').addEventListener('click', () => {
      state.inspiration = null;
      renderSummary();
      setStatus('');
    });

    const form = $('#sum-form');
    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('input', updateLinks);
    // Período: um toque marca, outro toque desmarca
    $('#periods').addEventListener('click', (e) => {
      const input = e.target.closest('input[name="period"]');
      if (!input) return;
      if (state.period === input.value) {
        input.checked = false;
        state.period = '';
      } else {
        state.period = input.value;
      }
      updateLinks();
    });
    $('#periods').addEventListener('change', (e) => {
      if (e.target.checked) state.period = e.target.value;
      updateLinks();
    });

    // Monte sua unha
    $('#design-form').addEventListener('change', (e) => {
      const { name, value } = e.target;
      if (!(name in state.design)) return;
      state.design[name] = name === 'skin' ? Number(value) : value;
      renderDesign();
      setStatus('');
    });
    $('#design-form').addEventListener('submit', (e) => e.preventDefault());

    $('#design-use').addEventListener('click', () => {
      state.inspiration = Object.assign({}, state.design);
      renderSummary();
      setStatus(`${esc(t('design.used'))} · <a href="#summary">${esc(t('bar.view'))}</a>`);
    });

    $('#design-random').addEventListener('click', () => {
      const other = (list, cur) => {
        const pool = list.filter((x) => x.id !== cur);
        return (pool.length ? pool : list)[Math.floor(Math.random() * (pool.length || list.length))].id;
      };
      state.design.shape = other(S.shapes, state.design.shape);
      state.design.color = other(S.colors, state.design.color);
      state.design.finish = other(S.finishes, state.design.finish);
      syncDesignInputs();
      renderDesign();
      setStatus('');
    });

    // Barra fixa do celular: aparece depois do topo, some perto do pedido e do contato
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.target === $('.hero')) seen.heroOut = !en.isIntersecting;
          if (en.target.id === 'summary') seen.summaryIn = en.isIntersecting;
          if (en.target.id === 'design-form') seen.designIn = en.isIntersecting;
          if (en.target.id === 'contato') seen.contactIn = en.isIntersecting;
        });
        updateBar();
      });
      [$('.hero'), $('#summary'), $('#design-form'), $('#contato')].forEach((el) => io.observe(el));
    }

  }

  function setStatus(html) {
    $('#design-status').innerHTML = html;
  }

  /* ------------------------------------------------------------ start */
  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  $('#year').textContent = new Date().getFullYear();
  $('#f-date').min = today();
  renderFan();
  renderAll();
  bindEvents();
})();
