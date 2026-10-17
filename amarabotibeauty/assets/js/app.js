/* =============================================================================
   Comportamento do site. Os textos vêm de content.js (window.SITE) e os
   produtos de products.js (window.PRODUCTS) ou da planilha do Google.
   Normalmente não é preciso mexer neste arquivo.
   ========================================================================== */
(function () {
  'use strict';

  var S = window.SITE;
  if (!S || !Array.isArray(window.PRODUCTS)) {
    document.documentElement.classList.remove('js');
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<p style="margin:0;padding:16px;background:#A60F2B;color:#fff;font:16px/1.4 system-ui,sans-serif">' +
        'Não foi possível ler assets/js/content.js ou products.js. Confira se não falta vírgula ou aspas na última edição.</p>'
    );
    return;
  }
  if (!Array.isArray(S.categories)) S.categories = [];

  /* ------------------------------------------------------------ helpers */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* armazenamento indisponível */ } },
  };
  const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Reinicia uma animação CSS ligada a uma classe
  function replay(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  // Conta de um número até outro (total da sacola)
  function tween(el, to, format) {
    const from = el.dataset.value === undefined ? to : Number(el.dataset.value);
    el.dataset.value = to;
    cancelAnimationFrame(el._raf);
    if (from === to || !motionOK()) {
      el.textContent = format(to);
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / 600);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = format(k < 1 ? from + (to - from) * eased : to);
      if (k < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  // Envolve cada palavra do título num <span class="word"> para a entrada palavra por palavra.
  // A pontuação logo depois de um <em> fica grudada na palavra (não quebra de linha sozinha).
  function splitWords(el) {
    el.innerHTML = el.innerHTML.replace(/(<em>[^<]*<\/em>)([.,!?;:…]+)/g, '<span class="nowrap">$1$2</span>');
    let w = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
              return;
            }
            const span = document.createElement('span');
            span.className = 'word';
            span.style.setProperty('--w', w++);
            span.textContent = part;
            frag.appendChild(span);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    };
    walk(el);
  }

  /* ------------------------------------------------------------ state */
  const state = {
    lang: initialLang(),
    cat: 'all',
    query: '',
    shown: S.pageSize || 12,
    products: [],
    cart: loadCart(),
    spot: [],
    spotI: 0,
  };

  function initialLang() {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'pt' || q === 'it') return q;
    const saved = store.get('amara-lang');
    if (saved === 'pt' || saved === 'it') return saved;
    const first = (navigator.languages && navigator.languages[0]) || navigator.language || 'pt';
    return /^it/i.test(first) ? 'it' : 'pt';
  }

  function loadCart() {
    try {
      const raw = JSON.parse(store.get('amara-cart') || '{}');
      return new Map(Object.entries(raw).filter(([, q]) => Number(q) > 0).map(([id, q]) => [id, Number(q)]));
    } catch (e) {
      return new Map();
    }
  }
  const saveCart = () => store.set('amara-cart', JSON.stringify(Object.fromEntries(state.cart)));

  /* ------------------------------------------------------------ i18n */
  const L = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[state.lang] ?? v.pt ?? '' : v ?? '');
  const dict = () => S.text[state.lang] || S.text.pt;
  const t = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict());
  const fill = (str, extra) =>
    String(str ?? '').replace(/\{(\w+)\}/g, (m, k) => {
      const tokens = Object.assign({ brand: S.brand }, extra);
      return k in tokens ? tokens[k] : m;
    });
  const tt = (path, extra) => fill(t(path), extra);
  const plural = (n, key) => (n === 1 ? t(key + '1') : tt(key, { n }));

  const locale = () => (state.lang === 'it' ? 'it-IT' : 'pt-BR');
  const money = (n) => new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
  const waLink = (msg) => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;

  /* ------------------------------------------------------------ produtos */
  const SHAPES = ['round', 'square', 'tall', 'pump', 'flip', 'tube', 'jar', 'pot', 'spray', 'dropper', 'gloss', 'compact', 'mascara', 'box'];
  const PALETTE = ['#EBC3B0', '#F0A7B4', '#E2C17F', '#B98AA6', '#D9A06B', '#9FB7D6', '#C24461', '#7FA37A'];

  function hexLum(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
    if (!m) return 0.5;
    const n = parseInt(m[1], 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  // Desenho mais provável pelo nome e categoria (para os produtos da planilha)
  function guessShape(p) {
    const n = norm([L(p.name), p.line].join(' '));
    const rules = [
      [/\bkit|coffret|presente|regalo/, 'box'],
      [/mascara de cilios|mascara de pestanas|\bmascara aura|rimel/, 'mascara'],
      [/blush|iluminador|po compacto|sombra|paleta|bronzer/, 'compact'],
      [/gloss|lip|batom|rossetto|labial/, 'gloss'],
      [/serum|siero|oleo|olio/, 'dropper'],
      [/desodorante|deodorante|spray|antitranspirante/, 'spray'],
      [/shampoo|sabonete liquido|gel de banho|bagnoschiuma/, 'flip'],
      [/condicionador|balsamo|creme para maos|crema mani|protetor/, 'tube'],
      [/mascara capilar|maschera|creme hidratante|crema corpo|manteiga|body butter/, 'jar'],
      [/facial|viso|olhos|occhi/, 'pot'],
      [/locao|lozione|hidratante|idratante/, 'pump'],
      [/eau de parfum|eau de toilette|colonia|cologne|perfume|profumo|parfum/, null],
    ];
    for (const [re, shape] of rules) {
      if (re.test(n)) return shape || ['round', 'square', 'tall'][slug(p.line || p.id).length % 3];
    }
    const byCat = { perfumes: 'square', masculino: 'square', corpo: 'pump', cabelos: 'flip', rosto: 'pot', make: 'gloss', kits: 'box' };
    return byCat[p.cat] || 'square';
  }

  function normalizeProduct(raw, i) {
    const p = Object.assign({}, raw);
    p.name = p.name || p.id || '';
    p.id = String(p.id || slug(L(p.name)) || 'produto-' + i);
    p.line = p.line || '';
    p.cat = p.cat || '';
    p.size = p.size || '';
    p.price = Number(p.price) || 0;
    p.stock = Math.max(0, Math.floor(Number(p.stock) || 0));
    if (!SHAPES.includes(p.shape)) p.shape = guessShape(p);
    const lines = S.lineColors || {};
    p.color = p.color || lines[norm(p.line)] || PALETTE[slug(p.line || p.id).length % PALETTE.length];
    p.glow = hexLum(p.color) < 0.05 ? '#E2B65A' : p.color;
    if (p.photo && !/^(https?:)?\/\/|^\/|^assets\//.test(p.photo)) p.photo = 'assets/img/produtos/' + p.photo;
    p.order = i;
    return p;
  }

  function setProducts(list) {
    state.products = list.map(normalizeProduct);
    // Categorias que vieram da planilha e não existem no content.js
    state.products.forEach((p) => {
      if (!p.cat) return;
      const found = S.categories.find((c) => c.id === p.cat || norm(c.name.pt) === norm(p.cat) || norm(c.name.it) === norm(p.cat));
      if (found) p.cat = found.id;
      else S.categories.push({ id: p.cat, name: { pt: p.cat, it: p.cat } });
    });
    state.byId = new Map(state.products.map((p) => [p.id, p]));
  }
  const byId = (id) => state.byId.get(id);

  /* ------------------------------------------------------------ desenhos dos frascos */
  const RIM = 'stroke="rgba(255,236,196,.34)" stroke-width="1"';
  // Forma colorida com sombra de volume e luz por cima
  const solid = (tag, a) =>
    `<${tag} ${a} fill="currentColor" ${RIM}/><${tag} ${a} fill="url(#gShade)"/><${tag} ${a} fill="url(#gDepth)"/>`;
  const glass = (tag, a) => `<${tag} ${a} fill="url(#gGlass)" ${RIM}/>`;
  const foil = (x, y, w, h, r) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#gFoilV)"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#gDepth)"/>` +
    `<rect x="${x + 2}" y="${y + 1.5}" width="${w - 4}" height="${Math.min(4, h / 4)}" rx="${Math.min(r, 2)}" fill="#fff" opacity=".28"/>`;
  const gloss = (x, y, h) => `<rect x="${x}" y="${y}" width="5" height="${h}" rx="2.5" fill="url(#gGloss)" opacity=".75"/>`;

  function label(x, y, w, h, text, opts = {}) {
    const txt = String(text || '').toUpperCase().slice(0, 12);
    const vertical = opts.vertical;
    const room = (vertical ? h : w) - 10;
    const fs = Math.max(6.5, Math.min(opts.size || 12, room / (Math.max(txt.length, 2) * 0.86)));
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rect = opts.bare
      ? ''
      : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="rgba(12,9,6,.58)" stroke="url(#gFoil)" stroke-width=".9"/>`;
    const rot = vertical ? ` transform="rotate(-90 ${cx} ${cy})"` : '';
    return `${rect}<text x="${cx}" y="${cy}" dy=".35em" text-anchor="middle" font-family="Bodoni Moda, Didot, serif" font-weight="600" font-size="${fs.toFixed(1)}" letter-spacing=".1em" fill="#F4DC9E"${rot}>${esc(txt)}</text>`;
  }

  const DRAW = {
    round: (l) =>
      foil(76, 30, 48, 46, 9) + foil(84, 74, 32, 18, 3) +
      glass('ellipse', 'cx="100" cy="160" rx="66" ry="66"') +
      solid('path', 'd="M70.6 112A58 58 0 1 0 129.4 112Z"') +
      '<ellipse cx="100" cy="112" rx="29.4" ry="3.2" fill="#fff" opacity=".22"/>' +
      label(68, 148, 64, 26, l) +
      '<path d="M50 140q-4 34 14 62" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="5" stroke-linecap="round"/>',
    square: (l) =>
      foil(70, 34, 60, 42, 5) +
      '<path d="M82 38v34M94 38v34M106 38v34M118 38v34" stroke="#000" stroke-opacity=".14"/>' +
      foil(86, 74, 28, 16, 2) +
      glass('rect', 'x="46" y="88" width="108" height="138" rx="12"') +
      solid('rect', 'x="53" y="106" width="94" height="113" rx="7"') +
      '<rect x="53" y="105" width="94" height="4" rx="2" fill="#fff" opacity=".2"/>' +
      label(64, 146, 72, 32, l) + gloss(58, 96, 120),
    tall: (l) =>
      foil(80, 18, 40, 56, 6) + foil(88, 72, 24, 14, 2) +
      glass('rect', 'x="62" y="84" width="76" height="142" rx="22"') +
      solid('rect', 'x="68" y="102" width="64" height="118" rx="17"') +
      '<rect x="70" y="101" width="60" height="4" rx="2" fill="#fff" opacity=".2"/>' +
      label(71, 150, 58, 28, l, { size: 11 }) + gloss(72, 92, 122),
    pump: (l) =>
      foil(112, 40, 34, 8, 4) + foil(78, 34, 44, 18, 6) + foil(95, 50, 10, 24, 1) + foil(82, 72, 36, 22, 4) +
      '<path d="M88 76v16M94 76v16M100 76v16M106 76v16M112 76v16" stroke="#000" stroke-opacity=".16"/>' +
      solid('rect', 'x="56" y="92" width="88" height="134" rx="20"') +
      label(66, 132, 68, 50, l) +
      '<path d="M82 170h36" stroke="url(#gFoil)" stroke-width=".9"/>' + gloss(64, 102, 112),
    flip: (l) =>
      foil(68, 52, 64, 40, 12) +
      '<path d="M70 64h60" stroke="#000" stroke-opacity=".22"/>' +
      solid('path', 'd="M60 96q0-6 6-6h68q6 0 6 6l4 114q0 16-16 16H72q-16 0-16-16Z"') +
      label(68, 128, 64, 48, l) + gloss(66, 100, 112),
    tube: (l) =>
      foil(74, 196, 52, 30, 6) +
      solid('path', 'd="M66 198 58 52q0-12 12-12h60q12 0 12 12l-8 146Z"') +
      solid('rect', 'x="56" y="28" width="88" height="14" rx="2"') +
      '<path d="M64 30v10M72 30v10M80 30v10M88 30v10M96 30v10M104 30v10M112 30v10M120 30v10M128 30v10M136 30v10" stroke="#000" stroke-opacity=".2"/>' +
      label(72, 98, 56, 50, l) + gloss(68, 48, 140),
    jar: (l) =>
      foil(40, 128, 120, 36, 8) +
      '<path d="M44 140h112M44 150h112" stroke="#000" stroke-opacity=".12"/>' +
      solid('rect', 'x="46" y="160" width="108" height="66" rx="14"') +
      label(46, 176, 108, 30, l) + gloss(54, 166, 52),
    pot: (l) =>
      foil(58, 150, 84, 30, 7) +
      solid('rect', 'x="62" y="176" width="76" height="50" rx="12"') +
      label(62, 186, 76, 24, l, { size: 10 }) + gloss(68, 180, 40),
    spray: (l) =>
      '<path d="M72 80V52q0-22 28-22t28 22v28Z" fill="url(#gFoilV)"/><path d="M72 80V52q0-22 28-22t28 22v28Z" fill="url(#gDepth)"/>' +
      foil(70, 78, 60, 8, 3) +
      solid('rect', 'x="68" y="84" width="64" height="142" rx="8"') +
      foil(68, 216, 64, 10, 4) +
      label(74, 112, 52, 92, l, { vertical: true, size: 13 }) + gloss(74, 92, 116),
    dropper: (l) =>
      '<path d="M86 72q0-46 14-46t14 46Z" fill="#1E1714" ' + RIM + '/><path d="M91 60q0-24 6-28" stroke="#fff" stroke-opacity=".3" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      foil(82, 70, 36, 26, 4) +
      glass('rect', 'x="64" y="94" width="72" height="132" rx="12"') +
      solid('rect', 'x="70" y="116" width="60" height="104" rx="8"') +
      '<rect x="97" y="96" width="6" height="100" rx="3" fill="#fff" opacity=".22"/>' +
      label(72, 150, 56, 28, l, { size: 11 }) + gloss(68, 102, 110),
    gloss: (l) =>
      foil(82, 20, 36, 98, 8) +
      glass('rect', 'x="80" y="116" width="40" height="110" rx="10"') +
      solid('rect', 'x="85" y="121" width="30" height="100" rx="7"') +
      '<rect x="97" y="121" width="6" height="66" rx="3" fill="#000" opacity=".16"/>' +
      label(85, 132, 30, 80, l, { vertical: true, bare: true, size: 11 }) + gloss(87, 26, 86),
    compact: () =>
      '<ellipse cx="100" cy="104" rx="72" ry="64" fill="url(#gFoilV)"/><ellipse cx="100" cy="104" rx="72" ry="64" fill="url(#gDepth)"/>' +
      '<ellipse cx="100" cy="104" rx="61" ry="53" fill="#231C17"/>' +
      '<path d="M62 76q20-26 58-22" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="10" stroke-linecap="round"/>' +
      foil(84, 160, 32, 10, 3) +
      '<path d="M26 196v9a74 30 0 0 0 148 0v-9Z" fill="url(#gFoilV)"/><path d="M26 196v9a74 30 0 0 0 148 0v-9Z" fill="url(#gDepth)"/>' +
      '<ellipse cx="100" cy="196" rx="74" ry="30" fill="url(#gFoil)"/>' +
      solid('ellipse', 'cx="100" cy="194" rx="58" ry="21"') +
      '<g fill="#fff" opacity=".5"><circle cx="80" cy="188" r="1.2"/><circle cx="104" cy="184" r="1"/><circle cx="118" cy="196" r="1.3"/><circle cx="92" cy="200" r="1"/><circle cx="128" cy="188" r=".9"/></g>',
    mascara: (l) =>
      foil(86, 20, 28, 104, 6) + foil(84, 122, 32, 6, 2) +
      solid('rect', 'x="84" y="126" width="32" height="100" rx="8"') +
      label(86, 132, 28, 88, l, { vertical: true, bare: true, size: 11 }) + gloss(89, 26, 92),
    box: (l) =>
      '<path d="M100 102C78 64 46 78 66 98c8 8 22 6 34 4Z" fill="url(#gFoilV)"/><path d="M100 102c22-38 54-24 34-4-8 8-22 6-34 4Z" fill="url(#gFoilV)"/>' +
      '<path d="M100 102C78 64 46 78 66 98c8 8 22 6 34 4Zm0 0c22-38 54-24 34-4-8 8-22 6-34 4Z" fill="url(#gDepth)"/>' +
      solid('rect', 'x="40" y="128" width="120" height="98" rx="4"') +
      solid('rect', 'x="34" y="102" width="132" height="30" rx="5"') +
      '<rect x="34" y="102" width="132" height="30" rx="5" fill="#fff" opacity=".1"/>' +
      foil(92, 102, 16, 124, 0) + foil(40, 168, 120, 12, 0) +
      '<circle cx="100" cy="102" r="8" fill="url(#gFoil)"/>' +
      `<g transform="rotate(-8 136 150)"><rect x="114" y="138" width="44" height="22" rx="3" fill="#F6EEE2"/><circle cx="119" cy="149" r="1.6" fill="#8E6219"/>${label(122, 138, 36, 22, l, { bare: true, size: 8 }).replace('fill="#F4DC9E"', 'fill="#6B4A14"')}</g>`,
  };

  function art(p, cls = 'pv__art') {
    const draw = DRAW[p.shape] || DRAW.square;
    return `<svg class="${cls}" viewBox="0 0 200 240" style="color:${esc(p.color)}" aria-hidden="true" focusable="false">${draw(p.label || p.line || L(p.name))}</svg>`;
  }

  // Foto do produto numa vitrine clara (o fundo branco da foto some nela); sem foto, o frasco desenhado
  function visual(p, eager = false) {
    if (p.photo) {
      return `<span class="pv pv--photo" style="--d:${(p.order * 1.7) % 6}"><span class="pv__window"></span><span class="pv__float"><img class="pv__img" src="${esc(p.photo)}" alt="" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></span><span class="pv__floor"></span></span>`;
    }
    return `<span class="pv" style="--d:${(p.order * 1.7) % 6}"><span class="pv__glow"></span><span class="pv__float">${art(p)}</span><span class="pv__floor"></span></span>`;
  }

  // Descrição só no idioma em que ela existe (as do site oficial são só em português)
  const descOf = (p) => {
    const d = p.desc;
    if (!d) return '';
    if (typeof d === 'string') return state.lang === 'pt' ? d : '';
    return d[state.lang] || '';
  };

  /* ------------------------------------------------------------ pedaços de produto */
  function stockHTML(p) {
    if (p.stock <= 0) return `<span class="stock stock--out">${esc(t('product.out'))}</span>`;
    if (p.stock <= (S.lowStock ?? 3)) {
      return `<span class="stock stock--low">${esc(p.stock === 1 ? t('product.low1') : tt('product.low', { n: p.stock }))}</span>`;
    }
    return `<span class="stock">${esc(t('product.inStock'))}</span>`;
  }

  function actHTML(p) {
    const name = `${L(p.name)}${p.size ? ` (${p.size})` : ''}`;
    if (p.stock <= 0) {
      return `<a class="add add--notify" href="${esc(waLink(tt('product.notifyMsg', { name })))}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-bell"/></svg><span>${esc(t('product.notify'))}</span></a>`;
    }
    const q = state.cart.get(p.id) || 0;
    if (!q) {
      return `<button class="add" type="button" data-add="${esc(p.id)}"><svg aria-hidden="true"><use href="#i-plus"/></svg><span>${esc(t('product.add'))}</span></button>`;
    }
    return `<div class="stepper">
      <button type="button" data-dec="${esc(p.id)}" aria-label="${esc(t('product.less'))}: ${esc(L(p.name))}"><svg aria-hidden="true"><use href="#i-minus"/></svg></button>
      <span class="stepper__n" aria-live="polite"><svg aria-hidden="true"><use href="#i-bag"/></svg><b>${q}</b><span class="sr-only">${esc(t('product.added'))}</span></span>
      <button type="button" data-inc="${esc(p.id)}" aria-label="${esc(t('product.plus'))}: ${esc(L(p.name))}"${q >= p.stock ? ' disabled' : ''}><svg aria-hidden="true"><use href="#i-plus"/></svg></button>
    </div>`;
  }

  const vtName = (id) => 'p-' + slug(id);

  function cardHTML(p, i, pending) {
    const out = p.stock <= 0;
    return `<li class="card${out ? ' is-out' : ''}${pending ? ' is-pending' : ''}" data-id="${esc(p.id)}" style="--glow:${esc(p.glow)};--i:${i % 4};view-transition-name:${vtName(p.id)}">
      <button class="card__art" type="button" data-open="${esc(p.id)}" aria-label="${esc(t('product.details'))}: ${esc(L(p.name))}">
        ${visual(p)}
        ${out ? `<span class="badge badge--out">${esc(t('product.out'))}</span>` : p.isNew ? `<span class="badge">${esc(t('product.new'))}</span>` : ''}
      </button>
      <div class="card__body">
        <p class="card__line">${esc(p.line)}</p>
        <h3 class="card__name">${esc(L(p.name))}</h3>
        <p class="card__meta">${p.size ? `<span>${esc(p.size)}</span>` : ''}${stockHTML(p)}</p>
        <p class="card__price">${money(p.price)}</p>
        <div class="card__act" data-act="${esc(p.id)}">${actHTML(p)}</div>
      </div>
    </li>`;
  }

  /* ------------------------------------------------------------ vitrine */
  const grid = $('[data-grid]');

  function visibleProducts() {
    const q = norm(state.query);
    const words = q.split(/\s+/).filter(Boolean);
    return state.products
      .filter((p) => state.cat === 'all' || p.cat === state.cat)
      .filter((p) => {
        if (!words.length) return true;
        const cat = S.categories.find((c) => c.id === p.cat);
        const desc = p.desc && typeof p.desc === 'object' ? [p.desc.pt, p.desc.it].join(' ') : p.desc;
        const hay = norm([p.name.pt || p.name, p.name.it, p.line, p.size, L(p.family), desc, cat && cat.name.pt, cat && cat.name.it].join(' '));
        return words.every((w) => hay.includes(w));
      })
      .sort((a, b) => (a.stock > 0 ? 0 : 1) - (b.stock > 0 ? 0 : 1) || a.order - b.order);
  }

  function renderChips() {
    const used = new Set(state.products.map((p) => p.cat));
    const cats = [{ id: 'all', name: { pt: t('shop.all'), it: t('shop.all') } }].concat(S.categories.filter((c) => used.has(c.id)));
    if (!cats.some((c) => c.id === state.cat)) state.cat = 'all';
    $('[data-chips]').innerHTML =
      '<span class="chips__pill" aria-hidden="true"></span>' +
      cats
        .map((c) => `<button class="chip" type="button" data-cat="${esc(c.id)}" aria-pressed="${c.id === state.cat}">${esc(L(c.name))}</button>`)
        .join('');
    placePill(false);
  }

  function placePill(animate = true) {
    const wrap = $('[data-chips]');
    const pill = $('.chips__pill', wrap);
    const on = $('.chip[aria-pressed="true"]', wrap);
    if (!pill || !on) return;
    if (!animate) pill.style.transition = 'none';
    pill.style.width = on.offsetWidth + 'px';
    pill.style.transform = `translateX(${on.offsetLeft}px)`;
    if (!animate) {
      void pill.offsetWidth;
      pill.style.transition = '';
    }
  }

  let gridSeen = false;
  function renderGrid(opts = {}) {
    const list = visibleProducts();
    const show = list.slice(0, state.shown);
    const before = opts.appendFrom ?? Infinity;
    // Primeira vez: os cartões entram conforme aparecem na tela. Depois, só os novos do "Ver mais".
    grid.innerHTML = show.map((p, i) => cardHTML(p, i, !gridSeen || i >= before)).join('');
    gridSeen = true;
    $('[data-count]').textContent = plural(list.length, 'shop.count');
    $('[data-empty]').hidden = list.length > 0;
    $('[data-more]').hidden = list.length <= state.shown;
    watchCards();
  }

  function swapGrid(update) {
    if (document.startViewTransition && motionOK()) document.startViewTransition(update);
    else update();
  }

  function setCat(id) {
    if (id === state.cat) return;
    state.cat = id;
    state.shown = S.pageSize || 12;
    if (state.query) {
      state.query = '';
      $('[data-search]').value = '';
      $('[data-search-clear]').hidden = true;
    }
    $$('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cat === id)));
    placePill();
    // Centraliza o botão escolhido na faixa de categorias (celular)
    const on = $(`.chip[data-cat="${CSS.escape(id)}"]`);
    const wrap = $('.chips-wrap');
    if (on && wrap.scrollWidth > wrap.clientWidth) {
      const left = on.getBoundingClientRect().left - wrap.getBoundingClientRect().left + wrap.scrollLeft - (wrap.clientWidth - on.offsetWidth) / 2;
      wrap.scrollTo({ left, behavior: motionOK() ? 'smooth' : 'auto' });
    }
    swapGrid(() => renderGrid());
  }

  // Atualiza só o botão dos produtos (sem redesenhar a vitrine)
  function refreshActs(id) {
    const p = byId(id);
    if (!p) return;
    $$(`[data-act="${CSS.escape(id)}"]`).forEach((el) => (el.innerHTML = actHTML(p)));
    const go = $('.quick__go');
    if (go) go.hidden = !state.cart.size;
  }

  /* ------------------------------------------------------------ cartões entrando e flutuando */
  let cardIO = null;
  let aliveIO = null;
  function watchCards() {
    if (!('IntersectionObserver' in window)) {
      $$('.card', grid).forEach((c) => c.classList.add('is-in', 'is-alive'));
      return;
    }
    if (cardIO) cardIO.disconnect();
    if (aliveIO) aliveIO.disconnect();
    cardIO = cardIO || new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        cardIO.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.12 });
    // Os frascos só flutuam enquanto estão na tela
    aliveIO = aliveIO || new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-alive', e.isIntersecting && motionOK()));
    });
    $$('.card', grid).forEach((c) => {
      if (c.classList.contains('is-pending')) cardIO.observe(c);
      aliveIO.observe(c);
    });
  }

  /* ------------------------------------------------------------ sacola */
  function addOne(id, from) {
    const p = byId(id);
    if (!p || p.stock <= 0) return;
    const q = state.cart.get(id) || 0;
    if (q >= p.stock) {
      toast(t('product.maxed'));
      return;
    }
    state.cart.set(id, q + 1);
    saveCart();
    if (from) fly(from);
    refreshActs(id);
    renderCart();
    tickNumbers(id);
  }

  function setQty(id, q) {
    const p = byId(id);
    if (!p) return;
    q = Math.max(0, Math.min(q, p.stock));
    if (q) state.cart.set(id, q);
    else state.cart.delete(id);
    saveCart();
    refreshActs(id);
    renderCart();
    tickNumbers(id);
  }

  function tickNumbers(id) {
    $$(`[data-act="${CSS.escape(id)}"] .stepper__n b, [data-line="${CSS.escape(id)}"] .stepper__n b`).forEach((b) => replay(b, 'tick'));
  }

  function cartLines() {
    return Array.from(state.cart.entries())
      .map(([id, q]) => ({ p: byId(id), q }))
      .filter((x) => x.p);
  }

  function renderCart() {
    const lines = cartLines();
    const count = lines.reduce((s, x) => s + x.q, 0);
    const total = lines.reduce((s, x) => s + x.q * x.p.price, 0);

    const badge = $('[data-cart-count]');
    badge.hidden = !count;
    if (badge.textContent !== String(count)) {
      badge.textContent = count;
      replay(badge, 'bump');
    }

    $('[data-cart-items]').textContent = count ? plural(count, 'cart.items') : '';
    $('[data-cart-empty]').hidden = count > 0;
    $('[data-order]').hidden = !count;
    $('[data-cart-foot]').hidden = !count;
    tween($('[data-cart-total]'), total, money);

    $('[data-cart-lines]').innerHTML = lines
      .map(({ p, q }) => `<li class="line" data-line="${esc(p.id)}" style="--glow:${esc(p.glow)}">
        <span class="line__art">${visual(p)}</span>
        <div class="line__info">
          <p class="line__name">${esc(L(p.name))}</p>
          <p class="line__meta">${esc([p.line, p.size].filter(Boolean).join(' · '))} · ${money(p.price)}</p>
          <div class="line__row">
            <div class="stepper">
              <button type="button" data-dec="${esc(p.id)}" aria-label="${esc(t('product.less'))}: ${esc(L(p.name))}"><svg aria-hidden="true"><use href="#i-minus"/></svg></button>
              <span class="stepper__n"><b>${q}</b></span>
              <button type="button" data-inc="${esc(p.id)}" aria-label="${esc(t('product.plus'))}: ${esc(L(p.name))}"${q >= p.stock ? ' disabled' : ''}><svg aria-hidden="true"><use href="#i-plus"/></svg></button>
            </div>
            <b class="line__price">${money(p.price * q)}</b>
          </div>
          <button class="line__rm" type="button" data-rm="${esc(p.id)}">${esc(t('cart.remove'))}</button>
        </div>
      </li>`)
      .join('');

    const dockBtn = $('.dock__cart');
    dockBtn.classList.toggle('is-empty', !count);
    $('[data-dock-label]').textContent = count ? plural(count, 'cart.items') : '';
    dockBtn.setAttribute('aria-label', `${t('cart.open')}: ${plural(count, 'cart.items')}`);
    $('[data-dock-total]').textContent = count ? money(total) : '';
  }

  // Confere a sacola com o estoque atual (depois de carregar a planilha)
  function clampCart() {
    const gone = [];
    let changed = false;
    state.cart.forEach((q, id) => {
      const p = byId(id);
      if (!p || p.stock <= 0) {
        if (p) gone.push(L(p.name));
        state.cart.delete(id);
        changed = true;
      } else if (q > p.stock) {
        state.cart.set(id, p.stock);
        changed = true;
      }
    });
    if (changed) {
      saveCart();
      toast(gone.length ? `${gone.join(', ')} ${t('cart.gone')}` : t('cart.changed'));
    }
  }

  function orderMessage(form) {
    const lines = cartLines();
    const total = lines.reduce((s, x) => s + x.q * x.p.price, 0);
    const data = new FormData(form);
    const delivery = data.get('delivery') === 'ship' ? t('cart.ship') : t('cart.pickup');
    const city = String(data.get('city') || '').trim();
    const notes = String(data.get('notes') || '').trim();
    const out = [tt('order.hello'), ''];
    lines.forEach(({ p, q }) => {
      out.push(`• ${q}× ${L(p.name)}${p.size ? ` (${p.size})` : ''} – ${money(p.price * q)}`);
    });
    out.push('', `*${t('order.total')}: ${money(total)}*`, '');
    out.push(`${t('order.name')}: ${String(data.get('name') || '').trim()}`);
    out.push(`${t('order.delivery')}: ${delivery}${data.get('delivery') === 'ship' && city ? ` (${city})` : ''}`);
    if (notes) out.push(`${t('order.notes')}: ${notes}`);
    return out.join('\n');
  }

  function sendOrder() {
    const form = $('[data-order]');
    const name = form.elements.name;
    const err = $('[data-order-err]');
    if (!name.value.trim()) {
      err.hidden = false;
      err.textContent = t('cart.needName');
      name.classList.remove('is-bad');
      void name.offsetWidth;
      name.classList.add('is-bad');
      name.focus();
      return;
    }
    err.hidden = true;
    name.classList.remove('is-bad');
    store.set('amara-cliente', JSON.stringify({ name: name.value.trim(), city: form.elements.city.value.trim() }));
    const url = waLink(orderMessage(form));
    const w = window.open(url, '_blank');
    if (w) w.opener = null;
    else window.location.href = url;
  }

  /* ------------------------------------------------------------ voo até a sacola */
  function fly(fromEl) {
    const target = $('.cart-btn');
    if (!motionOK() || !target || $('#quick').open) return;
    const a = fromEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const dot = document.createElement('span');
    dot.className = 'fly';
    dot.style.left = a.left + a.width / 2 + 'px';
    dot.style.top = a.top + a.height / 2 + 'px';
    document.body.appendChild(dot);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = dot.animate(
      [
        { transform: 'translate(0,0) scale(.4)', opacity: 0 },
        { transform: 'translate(0,-18px) scale(1.2)', opacity: 1, offset: 0.15 },
        { transform: `translate(${dx * 0.55}px, ${Math.min(dy * 0.4, -60)}px) scale(1)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(.35)`, opacity: 0.5 },
      ],
      { duration: 900, easing: 'cubic-bezier(.45,0,.25,1)' }
    );
    anim.onfinish = () => {
      dot.remove();
      replay(target, 'bump');
    };
  }

  /* ------------------------------------------------------------ aviso */
  let toastTimer = 0;
  function toast(msg) {
    const el = $('[data-toast]');
    el.textContent = msg;
    // Por cima das janelas abertas, quando o navegador permite
    if (el.showPopover) {
      if (!el.hasAttribute('popover')) el.setAttribute('popover', 'manual');
      try { el.hidePopover(); } catch (e) { /* já estava fechado */ }
      el.showPopover();
    }
    requestAnimationFrame(() => el.classList.add('is-on'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('is-on');
      setTimeout(() => {
        if (el.hidePopover && !el.classList.contains('is-on')) {
          try { el.hidePopover(); } catch (e) { /* já estava fechado */ }
        }
      }, 450);
    }, 3200);
  }

  /* ------------------------------------------------------------ janelas */
  function openDialog(d) {
    if (d.open) return;
    d.showModal();
    document.documentElement.classList.add('is-locked');
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('is-open')));
  }

  function closeDialog(d) {
    if (!d.open) return Promise.resolve();
    d.classList.remove('is-open');
    return (motionOK() ? wait(d.classList.contains('menu') ? 500 : 420) : Promise.resolve()).then(() => {
      d.close();
      if (!$$('dialog').some((x) => x.open)) document.documentElement.classList.remove('is-locked');
    });
  }

  $$('dialog').forEach((d) => {
    d.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeDialog(d);
    });
    d.addEventListener('click', (e) => {
      if (e.target === d) closeDialog(d);
    });
  });

  function openCart() {
    const quick = $('#quick');
    const menu = $('#menu');
    Promise.all([quick.open ? closeDialog(quick) : 0, menu.open ? closeDialog(menu) : 0]).then(() => openDialog($('#cart')));
  }

  function openQuick(id) {
    const p = byId(id);
    if (!p) return;
    const fam = L(p.family);
    $('[data-quick]').innerHTML = `
      <div class="quick__art" style="--glow:${esc(p.glow)}">${visual(p, true)}</div>
      <div class="quick__info">
        <button class="icon-btn quick__x" type="button" data-close><svg aria-hidden="true"><use href="#i-close"/></svg><span class="sr-only">${esc(t('ui.close'))}</span></button>
        <p class="card__line">${esc(p.line)}</p>
        <h2 class="quick__name" id="quick-name">${esc(L(p.name))}</h2>
        <p class="quick__price">${money(p.price)}</p>
        ${p.size || fam ? `<ul class="quick__tags">${p.size ? `<li><b>${esc(t('product.size'))}</b>${esc(p.size)}</li>` : ''}${fam ? `<li><b>${esc(t('product.family'))}</b>${esc(fam)}</li>` : ''}</ul>` : ''}
        ${descOf(p) ? `<p class="quick__desc">${esc(descOf(p))}</p>` : ''}
        <p class="quick__stock">${stockHTML(p)}</p>
        <div class="quick__act" data-act="${esc(p.id)}">${actHTML(p)}</div>
        <button class="quick__go" type="button" data-cart-open${state.cart.size ? '' : ' hidden'}>${esc(t('cart.open'))} →</button>
      </div>`;
    const card = $('.quick__art .pv');
    if (card) card.parentElement.classList.add('is-alive');
    openDialog($('#quick'));
  }

  /* ------------------------------------------------------------ mais amados (carrossel) */
  const spotEl = $('[data-spot]');
  const SPOT_MS = 6500;

  function renderSpotDots() {
    const featured = state.products.filter((p) => p.featured && p.stock > 0);
    state.spot = (featured.length ? featured : state.products.filter((p) => p.stock > 0)).slice(0, 8);
    $('#amados').hidden = !state.spot.length;
    if (!state.spot.length) return;
    state.spotI = Math.min(state.spotI, state.spot.length - 1);
    $('[data-spot-dots]').innerHTML = state.spot
      .map((p, i) => `<button class="dot" type="button" data-spot-go="${i}" aria-label="${esc(L(p.name))}"><i></i></button>`)
      .join('');
    spotEl.style.setProperty('--dur', SPOT_MS + 'ms');
    showSpot(state.spotI, 1, true);
  }

  function spotInfoHTML(p) {
    const meta = [L(p.family), p.size].filter(Boolean);
    return `<p class="card__line">${esc(p.line)}</p>
      <h3 class="spot__name">${esc(L(p.name))}</h3>
      ${descOf(p) ? `<p class="spot__desc">${esc(descOf(p))}</p>` : ''}
      ${meta.length ? `<p class="spot__meta">${meta.map((m) => `<span>${esc(m)}</span>`).join('<span aria-hidden="true">✦</span>')}</p>` : ''}
      <p class="spot__price">${money(p.price)}</p>
      <div class="spot__act"><div data-act="${esc(p.id)}">${actHTML(p)}</div></div>`;
  }

  let spotBusy = false;
  function showSpot(i, dir = 1, instant = false) {
    const list = state.spot;
    if (!list.length) return;
    i = (i + list.length) % list.length;
    const p = list[i];
    const artEl = $('[data-spot-art]');
    const info = $('[data-spot-info]');
    const word = $('[data-spot-word]');
    state.spotI = i;
    spotEl.style.setProperty('--c', p.glow);
    $('#amados').style.setProperty('--c', p.glow);
    $$('.dot', spotEl).forEach((d, k) => d.setAttribute('aria-current', String(k === i)));

    const swap = () => {
      artEl.innerHTML = visual(p, true);
      artEl.classList.add('is-alive');
      artEl.dataset.open = p.id;
      artEl.setAttribute('aria-label', `${t('product.details')}: ${L(p.name)}`);
      info.innerHTML = spotInfoHTML(p);
      word.textContent = p.line || L(p.name);
    };
    if (instant || !motionOK() || spotBusy) {
      swap();
      return;
    }
    spotBusy = true;
    const els = [artEl, info, word];
    const outs = els.map((el, k) =>
      el.animate(
        [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-dir * (k === 0 ? 60 : 30)}px)${k === 0 ? ' rotate(' + -dir * 8 + 'deg) scale(.9)' : ''}` }],
        { duration: 340, easing: 'cubic-bezier(.55,0,.75,.2)', fill: 'forwards' }
      )
    );
    Promise.all(outs.map((a) => a.finished)).then(() => {
      swap();
      els.forEach((el, k) => {
        const anim = el.animate(
          [{ opacity: 0, transform: `translateX(${dir * (k === 0 ? 70 : 40)}px)${k === 0 ? ' rotate(' + dir * 10 + 'deg) scale(.9)' : ''}` }, { opacity: 1, transform: 'none' }],
          { duration: 800, delay: k * 70, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' }
        );
        anim.onfinish = () => anim.cancel();
      });
      outs.forEach((a) => a.cancel());
      spotBusy = false;
    });
  }

  const spotPaused = { user: !motionOK(), hover: false, view: true, focus: false };
  function syncSpotPause() {
    const paused = spotPaused.user || spotPaused.hover || spotPaused.focus || !spotPaused.view || document.hidden;
    spotEl.classList.toggle('is-paused', paused);
    const btn = $('[data-spot-pause]');
    btn.innerHTML = `<svg aria-hidden="true"><use href="#${spotPaused.user ? 'i-play' : 'i-pause'}"/></svg><span class="sr-only">${esc(t(spotPaused.user ? 'loved.play' : 'loved.pause'))}</span>`;
  }

  /* ------------------------------------------------------------ textos fixos */
  function applyText() {
    const d = dict();
    document.documentElement.lang = state.lang === 'it' ? 'it' : 'pt-BR';
    document.title = d.meta.title;
    const md = $('meta[name="description"]');
    if (md) md.setAttribute('content', d.meta.description);

    $$('[data-t]').forEach((el) => (el.textContent = tt(el.dataset.t)));
    $$('[data-t-html]').forEach((el) => (el.innerHTML = tt(el.dataset.tHtml)));
    $$('[data-ph]').forEach((el) => (el.placeholder = t(el.dataset.ph)));
    $$('[data-brand]').forEach((el) => (el.textContent = S.brand));
    $('[data-search]').placeholder = t('shop.search');
    $('[data-search]').setAttribute('aria-label', t('shop.search'));

    const ring = $('[data-ring]');
    if (ring) ring.textContent = t('hero.ring');

    const hello = waLink(tt('whatsHello'));
    $$('[data-wa]').forEach((a) => (a.href = hello));
    $$('[data-wa-label]').forEach((el) => (el.textContent = S.whatsappLabel || ''));
    const ig = $('[data-ig]');
    if (ig) {
      ig.hidden = !S.instagram;
      ig.href = S.instagram ? `https://www.instagram.com/${S.instagram.replace(/^@/, '')}/` : '#';
    }
    $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

    const lang = $('[data-lang-toggle]');
    lang.classList.toggle('is-it', state.lang === 'it');
    lang.setAttribute('aria-label', t('ui.lang'));

    splitWords($('.hero__title'));

    $('[data-promise]').innerHTML = d.promise
      .map((x, i) => `<li class="promise__item" style="--i:${i}"><svg aria-hidden="true"><use href="#${esc(x.icon)}"/></svg><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></li>`)
      .join('');

    const steps = $('[data-steps]');
    $$('.step', steps).forEach((s) => s.remove());
    steps.insertAdjacentHTML(
      'beforeend',
      d.how.steps
        .map((s, i) => `<li class="step" style="--i:${i + 1}"><span class="step__n">0${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`)
        .join('')
    );

    $('[data-about]').innerHTML = d.about.text.map((p) => `<p>${esc(fill(p))}</p>`).join('');

    $('[data-faq]').innerHTML = d.faq.items
      .map((x, i) => `<details class="qa" name="faq" style="--i:${i}"><summary><span>${esc(x.q)}</span><i class="qa__ico" aria-hidden="true"><svg><use href="#i-plus"/></svg></i></summary><div class="qa__a"><p>${esc(x.a)}</p></div></details>`)
      .join('');
  }

  function renderMarquee() {
    // As linhas com mais produtos, até 14
    const freq = new Map();
    state.products.forEach((p) => p.line && p.line !== 'O Boticário' && freq.set(p.line, (freq.get(p.line) || 0) + 1));
    const lines = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([l]) => l);
    let items = lines.length ? lines : ['O Boticário'];
    while (items.length < 10) items = items.concat(items);
    const one = items.map((l) => `<span class="marquee__item">${esc(l)}<svg aria-hidden="true"><use href="#i-spark"/></svg></span>`).join('');
    $('[data-marquee]').innerHTML = one + one;
  }

  function renderAll() {
    applyText();
    renderMarquee();
    renderChips();
    renderGrid();
    renderSpotDots();
    renderCart();
    syncSpotPause();
  }

  function setLang(lang) {
    if (lang === state.lang) return;
    const run = () => {
      state.lang = lang;
      store.set('amara-lang', lang);
      renderAll();
      if ($('#quick').open) {
        const id = $('#quick .quick__act')?.dataset.act;
        if (id) openQuick(id);
      }
    };
    if (document.startViewTransition && motionOK()) document.startViewTransition(run);
    else run();
  }

  /* ------------------------------------------------------------ cliques */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-add],[data-inc],[data-dec],[data-rm],[data-open],[data-cat],[data-cart-open],[data-close],[data-spot-go],[data-menu-open],[data-lang-toggle]');
    if (!el) return;
    const d = el.dataset;
    if (d.add) addOne(d.add, el);
    else if (d.inc) addOne(d.inc, null);
    else if (d.dec) setQty(d.dec, (state.cart.get(d.dec) || 0) - 1);
    else if (d.rm) {
      const row = el.closest('.line');
      const done = () => setQty(d.rm, 0);
      if (row && motionOK()) {
        row.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(40px)' }], { duration: 300, easing: 'ease-in', fill: 'forwards' }).onfinish = done;
      } else done();
    } else if (d.open) openQuick(d.open);
    else if (d.cat) setCat(d.cat);
    else if ('cartOpen' in d) openCart();
    else if ('close' in d) {
      const dlg = el.closest('dialog');
      if (dlg) closeDialog(dlg).then(() => {
        if ('gotoShop' in d) $('#vitrine').scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto' });
      });
    } else if (d.spotGo) {
      const to = Number(d.spotGo);
      if (to !== state.spotI) showSpot(to, to > state.spotI ? 1 : -1);
    } else if ('menuOpen' in d) {
      const r = el.getBoundingClientRect();
      const menu = $('#menu');
      menu.style.setProperty('--mx', r.left + r.width / 2 + 'px');
      menu.style.setProperty('--my', r.top + r.height / 2 + 'px');
      $$('.menu__nav a', menu).forEach((a, i) => a.style.setProperty('--i', i));
      el.setAttribute('aria-expanded', 'true');
      openDialog(menu);
    } else if ('langToggle' in d) setLang(state.lang === 'pt' ? 'it' : 'pt');
  });

  // Links do menu: fecha e rola até a seção
  $$('#menu a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $(a.getAttribute('href'));
      closeDialog($('#menu')).then(() => target && target.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto' }));
    })
  );
  $('#menu').addEventListener('close', () => $('[data-menu-open]').setAttribute('aria-expanded', 'false'));

  $('[data-more]').addEventListener('click', () => {
    const from = state.shown;
    state.shown += S.pageSize || 12;
    renderGrid({ appendFrom: from });
  });

  let searchTimer = 0;
  $('[data-search]').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    $('[data-search-clear]').hidden = !e.target.value;
    searchTimer = setTimeout(() => {
      state.query = e.target.value;
      state.shown = S.pageSize || 12;
      if (state.query && state.cat !== 'all') {
        state.cat = 'all';
        $$('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cat === 'all')));
        placePill();
      }
      renderGrid();
    }, 140);
  });
  $('[data-search-clear]').addEventListener('click', () => {
    const input = $('[data-search]');
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.focus();
  });

  $('[data-send]').addEventListener('click', sendOrder);
  $('[data-order]').elements.name.addEventListener('input', (e) => {
    e.target.classList.remove('is-bad');
    $('[data-order-err]').hidden = true;
  });
  $('[data-order]').addEventListener('submit', (e) => {
    e.preventDefault();
    sendOrder();
  });
  $$('[data-order] input[name="delivery"]').forEach((r) =>
    r.addEventListener('change', () => ($('[data-city]').hidden = $('[data-order]').elements.delivery.value !== 'ship'))
  );
  try {
    const saved = JSON.parse(store.get('amara-cliente') || 'null');
    if (saved) {
      $('[data-order]').elements.name.value = saved.name || '';
      $('[data-order]').elements.city.value = saved.city || '';
    }
  } catch (e) { /* sem dados salvos */ }

  // Carrossel: setas, pausa, troca automática, arrastar no celular
  $('[data-spot-prev]').addEventListener('click', () => showSpot(state.spotI - 1, -1));
  $('[data-spot-next]').addEventListener('click', () => showSpot(state.spotI + 1, 1));
  $('[data-spot-pause]').addEventListener('click', () => {
    spotPaused.user = !spotPaused.user;
    syncSpotPause();
  });
  spotEl.addEventListener('animationend', (e) => {
    if (e.animationName === 'progress' && e.target.closest('.dot') && motionOK()) showSpot(state.spotI + 1, 1);
  });
  spotEl.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') {
      spotPaused.hover = true;
      syncSpotPause();
    }
  });
  spotEl.addEventListener('pointerleave', () => {
    spotPaused.hover = false;
    syncSpotPause();
  });
  spotEl.addEventListener('focusin', () => {
    spotPaused.focus = true;
    syncSpotPause();
  });
  spotEl.addEventListener('focusout', (e) => {
    if (!spotEl.contains(e.relatedTarget)) {
      spotPaused.focus = false;
      syncSpotPause();
    }
  });
  (function swipe() {
    const stage = $('.spot__stage');
    let x0 = null;
    let y0 = 0;
    stage.addEventListener('pointerdown', (e) => {
      x0 = e.clientX;
      y0 = e.clientY;
    });
    stage.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      const dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        stage.dataset.swiped = '1';
        showSpot(state.spotI + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      }
    });
    // Um arrasto não abre os detalhes
    stage.addEventListener('click', (e) => {
      if (stage.dataset.swiped) {
        e.stopPropagation();
        delete stage.dataset.swiped;
      }
    }, true);
  })();
  document.addEventListener('visibilitychange', syncSpotPause);

  /* ------------------------------------------------------------ rolagem: cabeçalho, barra, hero, dock */
  const hdr = $('#hdr');
  const hero = $('.hero');
  const heroIn = $('.hero__in');
  const bar = $('.progress i');
  const dock = $('[data-dock]');
  const fab = $('.fab-wa');
  const navLinks = $$('.hdr__nav a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  let ticking = false;

  function onScroll() {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    hdr.classList.toggle('is-solid', y > 24);
    const hh = hero.offsetHeight;
    const past = y > hh * 0.55;
    dock.classList.toggle('is-on', past);
    fab.classList.toggle('is-on', past);
    if (motionOK() && y < hh) {
      const k = y / hh;
      heroIn.style.transform = `translateY(${(y * 0.22).toFixed(1)}px) scale(${(1 - k * 0.06).toFixed(4)})`;
      heroIn.style.opacity = (1 - k * 1.15).toFixed(3);
    }
    // Link do menu da seção atual
    let here = null;
    sections.forEach((s) => {
      if (s.getBoundingClientRect().top < window.innerHeight * 0.4) here = s;
    });
    navLinks.forEach((a) => a.classList.toggle('is-here', !!here && a.getAttribute('href') === '#' + here.id));
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  // Entradas ao rolar
  function watchReveals() {
    const els = $$('.reveal, .stagger');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach((el) => io.observe(el));

    // O carrossel só troca sozinho quando está na tela
    new IntersectionObserver((entries) => {
      spotPaused.view = entries[0].isIntersecting;
      syncSpotPause();
    }, { threshold: 0.35 }).observe(spotEl);
  }

  /* ------------------------------------------------------------ medalhão que acompanha o mouse */
  function tilt() {
    const medal = $('.medal');
    if (!medal || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let raf = 0;
    hero.addEventListener('pointermove', (e) => {
      if (!motionOK()) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        medal.style.setProperty('--ry', (x * 18).toFixed(2) + 'deg');
        medal.style.setProperty('--rx', (-y * 14).toFixed(2) + 'deg');
      });
    });
    hero.addEventListener('pointerleave', () => {
      medal.style.setProperty('--ry', '0deg');
      medal.style.setProperty('--rx', '0deg');
    });
  }

  /* ------------------------------------------------------------ brilhos dourados do hero */
  function sparkles() {
    const canvas = $('.hero__sparkles');
    const ctx = canvas && canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    let w = 0;
    let h = 0;
    let parts = [];
    let running = false;
    let visible = true;
    let mx = 0;
    let my = 0;

    const make = (fresh) => ({
      x: Math.random() * w,
      y: fresh ? Math.random() * h : h + 10,
      r: Math.random() * 1.5 + 0.35,
      vy: -(Math.random() * 0.22 + 0.05),
      vx: (Math.random() - 0.5) * 0.1,
      a: Math.random() * Math.PI * 2,
      va: Math.random() * 0.025 + 0.008,
      star: Math.random() < 0.13,
      z: Math.random() * 0.8 + 0.2,
      tone: Math.random(),
    });

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(120, (w * h) / 8500));
      parts = Array.from({ length: n }, () => make(true));
    }

    function draw(still) {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        if (!still) {
          p.x += p.vx + mx * p.z * 0.25;
          p.y += p.vy * (0.6 + p.z);
          p.a += p.va;
          if (p.y < -12 || p.x < -12 || p.x > w + 12) Object.assign(p, make(false), { x: Math.random() * w });
        }
        const tw = (Math.sin(p.a) + 1) / 2;
        const alpha = 0.12 + tw * 0.78 * p.z;
        const g = 196 + Math.round(p.tone * 44);
        const b = 110 + Math.round(p.tone * 80);
        const px = p.x + mx * 14 * p.z;
        const py = p.y + my * 10 * p.z;
        if (p.star) {
          const s = p.r * (3 + tw * 4);
          ctx.strokeStyle = `rgba(255,${g},${b},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(px - s, py);
          ctx.lineTo(px + s, py);
          ctx.moveTo(px, py - s);
          ctx.lineTo(px, py + s);
          ctx.stroke();
          ctx.fillStyle = `rgba(255,248,225,${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, p.r * 0.9, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(255,${g},${b},${alpha * 0.22})`;
          ctx.beginPath();
          ctx.arc(px, py, p.r * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255,${g},${b},${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function loop() {
      if (!running) return;
      draw(false);
      requestAnimationFrame(loop);
    }
    function sync() {
      const should = visible && !document.hidden && motionOK();
      if (should && !running) {
        running = true;
        requestAnimationFrame(loop);
      } else if (!should) {
        running = false;
        draw(true);
      }
    }

    resize();
    draw(true);
    let rt = 0;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        resize();
        draw(true);
      }, 150);
    });
    hero.addEventListener('pointermove', (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        sync();
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', sync);
    sync();
  }

  /* ------------------------------------------------------------ planilha do Google (estoque) */
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') {
          cell += '"';
          i++;
        } else if (c === '"') quoted = false;
        else cell += c;
      } else if (c === '"') quoted = true;
      else if (c === ',') {
        row.push(cell);
        cell = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
      } else cell += c;
    }
    if (cell || row.length) {
      row.push(cell);
      rows.push(row);
    }
    return rows.filter((r) => r.some((c) => c.trim()));
  }

  const COLS = {
    id: ['id', 'codigo', 'cod'],
    cat: ['categoria', 'category', 'cat'],
    line: ['linha', 'line', 'marca'],
    name: ['nome', 'name', 'produto'],
    name_it: ['nome_it', 'nome_italiano', 'nome (it)'],
    size: ['tamanho', 'size', 'ml', 'tam'],
    price: ['preco', 'price', 'valor', 'preco_eur'],
    stock: ['estoque', 'stock', 'quantidade', 'qtd', 'qtde'],
    featured: ['destaque', 'featured', 'mais_amado'],
    isNew: ['novo', 'new', 'novidade'],
    photo: ['foto', 'photo', 'imagem', 'image'],
    color: ['cor', 'color'],
    shape: ['desenho', 'shape', 'formato'],
    label: ['rotulo', 'label'],
    family: ['familia', 'family'],
    family_it: ['familia_it'],
    desc: ['descricao', 'desc', 'description'],
    desc_it: ['descricao_it', 'desc_it'],
  };
  const truthy = (v) => /^(sim|s|x|1|true|yes|y|si|sì)$/i.test(String(v).trim());
  const num = (v) => Number(String(v).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')) || 0;

  function rowsToProducts(rows) {
    const head = rows[0].map((h) => norm(h).replace(/\s+/g, '_'));
    const col = {};
    Object.entries(COLS).forEach(([key, names]) => {
      const i = head.findIndex((h) => names.map((n) => n.replace(/\s+/g, '_')).includes(h));
      if (i >= 0) col[key] = i;
    });
    if (col.name === undefined) return [];
    const get = (r, key) => (col[key] === undefined ? '' : String(r[col[key]] ?? '').trim());
    const two = (r, a, b) => {
      const pt = get(r, a);
      const it = get(r, b);
      return it ? { pt, it } : pt;
    };
    return rows.slice(1)
      .filter((r) => get(r, 'name'))
      .map((r) => {
        const id = get(r, 'id') || slug(get(r, 'name'));
        // O que a planilha deixa em branco continua como está no products.js (se o id existir lá).
        // Só o estoque é sempre da planilha: em branco = esgotado.
        const local = window.PRODUCTS.find((x) => x.id === id) || {};
        const p = Object.assign({}, local, { id, stock: num(get(r, 'stock')) });
        const put = (key, value) => {
          if (get(r, key) !== '') p[key] = value;
        };
        const localPt = local.name && typeof local.name === 'object' ? local.name.pt : local.name;
        if (norm(get(r, 'name')) !== norm(localPt) || get(r, 'name_it')) p.name = two(r, 'name', 'name_it');
        put('cat', slugCat(get(r, 'cat')));
        put('line', get(r, 'line'));
        put('size', get(r, 'size'));
        put('price', num(get(r, 'price')));
        put('photo', get(r, 'photo'));
        put('color', get(r, 'color'));
        put('shape', get(r, 'shape'));
        put('label', get(r, 'label'));
        if (get(r, 'family')) p.family = two(r, 'family', 'family_it');
        if (get(r, 'desc')) p.desc = two(r, 'desc', 'desc_it');
        if (col.featured !== undefined) p.featured = truthy(get(r, 'featured'));
        if (col.isNew !== undefined) p.isNew = truthy(get(r, 'isNew'));
        return p;
      });
  }

  function slugCat(v) {
    if (!v) return '';
    const n = norm(v);
    const found = S.categories.find((c) => c.id === n || norm(c.name.pt) === n || norm(c.name.it) === n);
    return found ? found.id : v;
  }

  function loadSheet() {
    if (!S.sheetCsv) return;
    fetch(S.sheetCsv, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then((text) => {
        const list = rowsToProducts(parseCSV(text));
        if (!list.length) throw new Error('planilha sem produtos (confira a coluna "nome")');
        setProducts(list);
        clampCart();
        renderMarquee();
        renderChips();
        renderGrid();
        renderSpotDots();
        renderCart();
      })
      .catch((err) => {
        console.warn('Planilha de estoque:', err);
      });
  }

  /* ------------------------------------------------------------ início */
  setProducts(window.PRODUCTS);
  renderAll();
  onScroll();
  watchReveals();
  tilt();
  sparkles();
  loadSheet();

  window.addEventListener('resize', () => placePill(false));
  // Começa a animação de entrada quando as fontes chegaram (ou depois de 0,8 s)
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(800)]).then(() => {
    placePill(false);
    requestAnimationFrame(() => document.documentElement.classList.add('is-ready'));
  });
})();
