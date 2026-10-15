/* Colour studio: a cozinha desenhada (SVG) troca de acabamento como se o filme estivesse sendo aplicado.
   Os acabamentos ficam em textures.js; as combinações prontas ficam em LOOKS, logo abaixo. */
(function () {
  'use strict';

  const T = window.BoraTextures;
  const root = document.querySelector('[data-studio]');
  if (!root || !T) return;

  // Combinações prontas ("Curated looks")
  const LOOKS = [
    { name: 'Sage & marble',  upper: 'sage',        base: 'sage',        bench: 'calacatta' },
    { name: 'Scandi light',   upper: 'matte-white', base: 'matte-white', bench: 'natural-oak' },
    { name: 'Hamptons',       upper: 'matte-white', base: 'navy',        bench: 'carrara' },
    { name: 'Japandi',        upper: 'blonde-ash',  base: 'blonde-ash',  bench: 'concrete' },
    { name: 'Moody luxe',     upper: 'walnut',      base: 'satin-black', bench: 'calacatta' },
    { name: 'Forest & oak',   upper: 'forest',      base: 'forest',      bench: 'natural-oak' }
  ];
  const ORIGINAL = { upper: 'honey-oak', base: 'honey-oak', bench: 'laminate' };
  const FIRST_LOOK = LOOKS[0];

  const NS = 'http://www.w3.org/2000/svg';
  const svg = root.querySelector('.kitchen');
  const section = root.closest('section');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const rect = (x, y, w, h, extra, parent) => el('rect', Object.assign({ x, y, width: w, height: h }, extra || {}), parent);

  // ---------- Geometria da cozinha (unidades do SVG) ----------
  const G = {
    upper: [[152, 94, 177, 232], [333, 94, 180, 232], [517, 94, 166, 150], [687, 94, 180, 232], [871, 94, 177, 232]],
    base: [
      [152, 490, 177, 56], [152, 550, 177, 66], [152, 620, 177, 66], // gaveteiro esquerdo
      [333, 490, 88, 196], [425, 490, 88, 196],                     // pia
      [517, 490, 166, 138], [517, 632, 166, 54],                    // forno + gaveta
      [687, 490, 88, 196], [779, 490, 88, 196],                     // portas
      [871, 490, 177, 96], [871, 590, 177, 96]                      // panelas
    ],
    bench: [[128, 452, 944, 8], [128, 460, 944, 26]]
  };
  // Portas um pouco maiores que o desenho: frestas finas como numa cozinha de verdade
  const grow = (r, k) => [r[0] - k, r[1] - k, r[2] + 2 * k, r[3] + 2 * k];
  G.upper = G.upper.map(r => grow(r, .7));
  G.base = G.base.map(r => grow(r, .7));
  const bbox = rects => {
    const x0 = Math.min(...rects.map(r => r[0])), y0 = Math.min(...rects.map(r => r[1]));
    const x1 = Math.max(...rects.map(r => r[0] + r[2])), y1 = Math.max(...rects.map(r => r[1] + r[3]));
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  };
  const BOX = { upper: bbox(G.upper), base: bbox(G.base), bench: bbox(G.bench) };

  const patSize = id => {
    const t = T.byId[id].type;
    return t === 'marble' ? 520 : t === 'concrete' ? 420 : t === 'travertine' ? 380 : t === 'speckle' ? 240 : 300;
  };

  // ---------- Montagem do SVG ----------
  const defs = el('defs', {}, svg);
  defs.innerHTML = `
    <linearGradient id="k-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EFEAE2"/><stop offset="1" stop-color="#DED6CA"/></linearGradient>
    <radialGradient id="k-wall-light" cx=".5" cy=".1" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="k-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B89E7C"/><stop offset="1" stop-color="#9D8262"/></linearGradient>
    <linearGradient id="k-door" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".13"/></linearGradient>
    <linearGradient id="k-shadow-down" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".34"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="k-edge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".25" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
    <linearGradient id="k-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F5F6"/><stop offset=".45" stop-color="#B9BDC1"/><stop offset="1" stop-color="#DDE0E3"/></linearGradient>
    <linearGradient id="k-steel-v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#AEB2B6"/><stop offset=".5" stop-color="#F2F3F4"/><stop offset="1" stop-color="#9DA1A5"/></linearGradient>
    <linearGradient id="k-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0DCB2"/><stop offset=".5" stop-color="#C2A06A"/><stop offset="1" stop-color="#8E6E40"/></linearGradient>
    <linearGradient id="k-brass-v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E6E40"/><stop offset=".45" stop-color="#F0DCB2"/><stop offset="1" stop-color="#A9874F"/></linearGradient>
    <linearGradient id="k-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A3C3F"/><stop offset=".55" stop-color="#151617"/><stop offset="1" stop-color="#232426"/></linearGradient>
    <linearGradient id="k-sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".38"/><stop offset=".94" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="k-led" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#FFF4DC" stop-opacity=".95"/><stop offset=".5" stop-color="#FFF4DC" stop-opacity=".28"/><stop offset="1" stop-color="#FFF4DC" stop-opacity="0"/></radialGradient>
    <radialGradient id="k-vignette" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>
    <pattern id="k-tiles" patternUnits="userSpaceOnUse" width="104" height="52">
      <rect width="104" height="52" fill="#F5F2ED"/>
      <path d="M0 0.5H104M0 26.5H104M52 0V26M26 26V52M78 26V52" stroke="#DAD3C8" stroke-width="2"/>
      <path d="M2 3H50M54 3H102M2 29H24M28 29H76M80 29H102" stroke="#fff" stroke-width="1.5" stroke-opacity=".9"/>
    </pattern>
    <pattern id="k-boards" patternUnits="userSpaceOnUse" width="180" height="92">
      <rect width="180" height="92" fill="url(#k-floor)"/>
      <path d="M0 0V92M90 0V92M45 0V46M135 46V92" stroke="#7F6549" stroke-opacity=".35" stroke-width="1.5"/>
    </pattern>`;

  // Paredes, piso, azulejos
  rect(0, 0, 1200, 800, { fill: 'url(#k-wall)' }, svg);
  rect(0, 0, 1200, 800, { fill: 'url(#k-wall-light)' }, svg);
  rect(0, 708, 1200, 92, { fill: 'url(#k-boards)' }, svg);
  rect(0, 708, 1200, 22, { fill: 'url(#k-shadow-down)', opacity: '.8' }, svg);
  rect(150, 326, 900, 128, { fill: 'url(#k-tiles)' }, svg);

  // Fundos escuros (aparecem nas frestas entre as portas)
  const backing = el('g', { fill: '#2B2620' }, svg);
  rect(150, 92, 365, 236, {}, backing);
  rect(515, 92, 170, 154, {}, backing);
  rect(685, 92, 365, 236, {}, backing);
  rect(150, 486, 900, 204, {}, backing);

  // Luz de LED embaixo dos armários e sombra no azulejo
  el('ellipse', { cx: 332, cy: 330, rx: 210, ry: 110, fill: 'url(#k-led)', opacity: '.75' }, svg);
  el('ellipse', { cx: 868, cy: 330, rx: 210, ry: 110, fill: 'url(#k-led)', opacity: '.75' }, svg);
  el('ellipse', { cx: 600, cy: 278, rx: 120, ry: 120, fill: 'url(#k-led)', opacity: '.65' }, svg);
  rect(150, 326, 365, 16, { fill: 'url(#k-shadow-down)', opacity: '.6' }, svg);
  rect(685, 326, 365, 16, { fill: 'url(#k-shadow-down)', opacity: '.6' }, svg);

  // Coifa embutida
  rect(517, 250, 166, 24, { rx: 3, fill: 'url(#k-steel)' }, svg);
  rect(523, 270, 154, 3, { fill: '#000', opacity: '.25' }, svg);

  // ---------- Zonas que recebem o filme ----------
  const zones = {};
  for (const name of ['upper', 'base', 'bench']) {
    const cp = el('clipPath', { id: `k-clip-${name}` }, defs);
    G[name].forEach(r => rect(r[0], r[1], r[2], r[3], { rx: name === 'bench' ? 0 : 2.5 }, cp));
    const g = el('g', { 'clip-path': `url(#k-clip-${name})` }, svg);
    const b = BOX[name];
    const layers = [0, 1].map(i => {
      const pat = el('pattern', { id: `k-pat-${name}-${i}`, patternUnits: 'userSpaceOnUse', width: 300, height: 300 }, defs);
      const img = el('image', { width: 300, height: 300, preserveAspectRatio: 'none' }, pat);
      const wipe = el('clipPath', { id: `k-wipe-${name}-${i}` }, defs);
      const wr = rect(b.x, b.y - 2, b.w, b.h + 4, {}, wipe);
      const lg = el('g', { 'clip-path': `url(#k-wipe-${name}-${i})` }, g);
      rect(b.x, b.y, b.w, b.h, { fill: `url(#k-pat-${name}-${i})` }, lg);
      return { pat, img, wr, g: lg };
    });
    const sheen = rect(b.x - 80, b.y - 2, 80, b.h + 4, { fill: 'url(#k-sheen)', opacity: 0 }, g);
    zones[name] = { g, layers, top: 0, sheen, box: b, finish: null, anim: null };
  }

  // Sombra da bancada sobre as portas de baixo
  rect(150, 486, 900, 18, { fill: 'url(#k-shadow-down)', opacity: '.75' }, svg);

  // Luz e frestas de cada porta (ficam por cima do filme)
  const light = el('g', { 'pointer-events': 'none' }, svg);
  G.upper.concat(G.base).forEach(r => rect(r[0], r[1], r[2], r[3], { rx: 2.5, fill: 'url(#k-door)', stroke: '#000', 'stroke-opacity': '.1', 'stroke-width': '.8' }, light));
  rect(128, 452, 944, 8, { fill: '#fff', opacity: '.2' }, light);
  rect(128, 460, 944, 26, { fill: 'url(#k-edge)' }, light);
  rect(128, 459.5, 944, 1.2, { fill: '#fff', opacity: '.45' }, light);

  // Forno (por cima do painel)
  const oven = el('g', {}, svg);
  rect(525, 496, 150, 126, { rx: 3, fill: 'url(#k-steel)' }, oven);
  rect(529, 500, 142, 12, { rx: 2, fill: '#1C1D1F' }, oven);
  rect(588, 503, 24, 6, { rx: 1, fill: '#7FD6C3', opacity: '.85' }, oven);
  el('circle', { cx: 545, cy: 506, r: 3.2, fill: '#C9CCD0' }, oven);
  el('circle', { cx: 655, cy: 506, r: 3.2, fill: '#C9CCD0' }, oven);
  rect(533, 528, 134, 86, { rx: 4, fill: 'url(#k-glass)' }, oven);
  el('path', { d: 'M560 528 L600 528 L560 614 L533 614 L533 590 Z', fill: '#fff', opacity: '.06' }, oven);
  rect(545, 517, 110, 5, { rx: 2.5, fill: 'url(#k-steel)' }, oven);

  // Puxadores (latão)
  const handles = el('g', {}, svg);
  const hbar = (x, y, w, h) => {
    rect(x + 1, y + 2, w, h, { rx: Math.min(w, h) / 2, fill: '#000', opacity: '.22' }, handles);
    rect(x, y, w, h, { rx: Math.min(w, h) / 2, fill: w > h ? 'url(#k-brass)' : 'url(#k-brass-v)' }, handles);
  };
  hbar(318, 252, 5, 62); hbar(342, 252, 5, 62); hbar(568, 228, 64, 5);
  hbar(856, 252, 5, 62); hbar(880, 252, 5, 62);
  hbar(208, 507, 64, 5); hbar(208, 570, 64, 5); hbar(208, 640, 64, 5);
  hbar(410, 506, 5, 62); hbar(431, 506, 5, 62);
  hbar(568, 650, 64, 5);
  hbar(764, 506, 5, 62); hbar(785, 506, 5, 62);
  hbar(928, 518, 64, 5); hbar(928, 616, 64, 5);

  // Rodapé dos armários
  rect(156, 688, 888, 20, { fill: '#1D1B18' }, svg);
  rect(156, 688, 888, 3, { fill: '#000', opacity: '.35' }, svg);

  // Objetos na bancada
  const deco = el('g', {}, svg);
  deco.innerHTML = `
    <!-- torneira -->
    <rect x="403" y="440" width="14" height="13" rx="2" fill="url(#k-steel-v)"/>
    <path d="M410 442 V378 Q410 356 432 356 Q452 356 452 378 V392" fill="none" stroke="url(#k-steel-v)" stroke-width="7" stroke-linecap="round"/>
    <path d="M410 412 h-16" stroke="url(#k-steel)" stroke-width="5" stroke-linecap="round"/>
    <!-- cooktop e panela -->
    <rect x="527" y="448" width="146" height="5" rx="1.5" fill="#141516"/>
    <rect x="566" y="414" width="62" height="34" rx="4" fill="url(#k-steel-v)"/>
    <rect x="562" y="410" width="70" height="6" rx="3" fill="url(#k-steel)"/>
    <rect x="590" y="402" width="14" height="9" rx="3" fill="#2A2A2A"/>
    <path d="M628 424 h28" stroke="#2A2A2A" stroke-width="6" stroke-linecap="round"/>
    <!-- vaso com planta -->
    <g transform="translate(226 0)">
      <path d="M10 416 h40 l-4 37 h-32 z" fill="#EDE6DB"/>
      <path d="M10 416 h40 l-1 6 h-38 z" fill="#000" opacity=".08"/>
      <path d="M30 416 C24 396 10 384 -4 382 C6 392 14 402 22 416 Z" fill="#5E7A55"/>
      <path d="M30 416 C34 392 48 376 64 372 C56 386 46 400 38 416 Z" fill="#6F8C63"/>
      <path d="M30 416 C28 390 32 368 40 352 C44 374 40 396 34 416 Z" fill="#4E6A47"/>
      <path d="M30 416 C20 402 4 400 -10 404 C2 410 14 414 26 416 Z" fill="#6F8C63"/>
    </g>
    <!-- tábuas -->
    <g>
      <rect x="935" y="352" width="46" height="100" rx="10" fill="#B48A5E" transform="rotate(-6 958 452)"/>
      <circle cx="952" cy="368" r="5" fill="#E9E3DA" transform="rotate(-6 958 452)"/>
      <rect x="960" y="372" width="40" height="80" rx="8" fill="#CBA57A"/>
      <rect x="975" y="360" width="10" height="16" rx="4" fill="#CBA57A"/>
    </g>
    <!-- fruteira -->
    <path d="M760 432 h76 q-6 22 -38 22 q-32 0 -38 -22 z" fill="#2F2D2A"/>
    <circle cx="784" cy="426" r="11" fill="#E8C547"/>
    <circle cx="804" cy="422" r="12" fill="#F0D05A"/>
    <circle cx="822" cy="428" r="10" fill="#D9B53A"/>
  `;

  // Camaleão em cima dos armários: assume a cor dos armários (camuflagem!)
  const bodyPath = document.querySelector('#lg-plate path');
  const cham = el('g', { class: 'k-cham', transform: 'translate(706 45) scale(.22)' }, svg);
  if (bodyPath) {
    el('path', { d: bodyPath.getAttribute('d'), class: 'k-cham__body', stroke: '#000', 'stroke-opacity': '.18', 'stroke-width': '6' }, cham);
    el('circle', { class: 'eye', cx: 129.2, cy: 118.2, r: 30.5, fill: '#F2E9E2' }, cham);
    el('circle', { class: 'pupil', cx: 134.8, cy: 116.4, r: 15.3, fill: '#272622' }, cham);
  }
  const chamBody = cham.querySelector('.k-cham__body');
  if (chamBody) chamBody.style.transition = 'fill 1.1s ease';

  rect(0, 0, 1200, 800, { fill: 'url(#k-vignette)', 'pointer-events': 'none' }, svg);

  // ---------- Animação do filme ----------
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function setLayer(z, layer, id) {
    const s = patSize(id);
    layer.pat.setAttribute('width', s);
    layer.pat.setAttribute('height', s);
    layer.pat.setAttribute('patternTransform', z === zones.bench && T.byId[id].type === 'wood' ? 'rotate(90)' : '');
    layer.img.setAttribute('width', s);
    layer.img.setAttribute('height', s);
    layer.img.setAttribute('href', T.texture(id, 384));
  }

  function wrapZone(name, id, opts) {
    const z = zones[name];
    opts = opts || {};
    if (z.finish === id && !opts.force) return Promise.resolve();
    if (z.anim) z.anim.finish();
    const b = z.box;
    const dir = opts.dir || 1;
    const next = z.layers[1 - z.top];
    setLayer(z, next, id);
    z.g.insertBefore(next.g, z.sheen); // camada nova por cima da atual
    z.finish = id;

    if (reduce || opts.instant) {
      next.wr.setAttribute('x', b.x); next.wr.setAttribute('width', b.w);
      z.top = 1 - z.top;
      return Promise.resolve();
    }
    next.wr.setAttribute('width', 0);
    const dur = opts.duration || 1050;
    return new Promise(resolve => {
      let raf, start;
      const done = () => {
        cancelAnimationFrame(raf);
        next.wr.setAttribute('x', b.x); next.wr.setAttribute('width', b.w);
        z.sheen.setAttribute('opacity', 0);
        z.top = 1 - z.top; z.anim = null; resolve();
      };
      z.anim = { finish: done };
      const step = now => {
        if (start === undefined) start = now;
        const t = Math.min(1, (now - start) / dur);
        const w = ease(t) * b.w;
        const x = dir > 0 ? b.x : b.x + b.w - w;
        next.wr.setAttribute('x', x); next.wr.setAttribute('width', w);
        const edge = dir > 0 ? b.x + w : b.x + b.w - w;
        z.sheen.setAttribute('x', dir > 0 ? edge - 80 : edge);
        z.sheen.setAttribute('transform', dir > 0 ? '' : `rotate(180 ${edge + 40} ${b.y + b.h / 2})`);
        z.sheen.setAttribute('opacity', t < .9 ? 1 : (1 - t) * 10);
        if (t < 1) raf = requestAnimationFrame(step); else done();
      };
      raf = requestAnimationFrame(step);
    });
  }

  // ---------- Estado e interface ----------
  const state = { upper: ORIGINAL.upper, base: ORIGINAL.base, bench: ORIGINAL.bench, twoTone: false, zone: 'cab', original: true, filter: 'all', touched: false };
  let chosen = { upper: FIRST_LOOK.upper, base: FIRST_LOOK.base, bench: FIRST_LOOK.bench };

  const zonesEl = root.querySelector('.studio__zones');
  const swatchesEl = root.querySelector('.studio__swatches');
  const looksEl = root.querySelector('.studio__looks-list');
  const statusEl = root.querySelector('[data-studio-status]');
  const zoneNameEl = root.querySelector('[data-studio-zone-name]');
  const finishNameEl = root.querySelector('[data-studio-finish-name]');
  const twoToneEl = root.querySelector('[data-studio-twotone]');
  const originalBtn = root.querySelector('[data-studio-original]');
  const quoteBtn = root.querySelector('[data-studio-quote]');
  const thumb = id => `url(${T.texture(id, 96)})`;

  const ZONE_LABEL = { cab: 'Cabinets', upper: 'Upper cabinets', base: 'Base cabinets', bench: 'Benchtop' };
  const zoneFinish = z => (z === 'cab' || z === 'upper' ? chosen.upper : z === 'base' ? chosen.base : chosen.bench);

  function lookText(sel) {
    sel = sel || chosen;
    const n = id => T.byId[id].name;
    const cab = sel.upper === sel.base ? `${n(sel.upper)} cabinets` : `${n(sel.upper)} upper & ${n(sel.base)} base cabinets`;
    return `${cab}, ${n(sel.bench)} benchtop`;
  }

  function renderZones() {
    const list = state.twoTone ? ['upper', 'base', 'bench'] : ['cab', 'bench'];
    if (!list.includes(state.zone)) state.zone = state.zone === 'cab' ? 'upper' : (state.zone === 'bench' ? 'bench' : 'cab');
    zonesEl.style.setProperty('--zones', list.length);
    zonesEl.innerHTML = '';
    list.forEach(z => {
      const id = zoneFinish(z);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'zone';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', z === state.zone ? 'true' : 'false');
      b.dataset.zone = z;
      b.innerHTML = `<span class="zone__chip" style="background-image:${thumb(id)}"></span><span class="zone__txt"><b>${ZONE_LABEL[z].replace(' cabinets', '')}</b><small>${T.byId[id].name}</small></span>`;
      b.addEventListener('click', () => { state.zone = z; renderZones(); syncSwatches(); });
      zonesEl.appendChild(b);
    });
  }

  function renderSwatches() {
    swatchesEl.innerHTML = '';
    T.FINISHES.filter(f => !f.hidden).forEach(f => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', f.name);
      b.dataset.id = f.id;
      b.dataset.group = f.group;
      b.style.backgroundImage = thumb(f.id);
      b.innerHTML = `<span class="swatch__tip">${f.name}</span>`;
      b.addEventListener('click', () => choose(f.id));
      swatchesEl.appendChild(b);
    });
    syncSwatches();
  }

  function syncSwatches() {
    const current = zoneFinish(state.zone);
    swatchesEl.querySelectorAll('.swatch').forEach(s => {
      s.setAttribute('aria-checked', s.dataset.id === current ? 'true' : 'false');
      s.hidden = state.filter !== 'all' && s.dataset.group !== state.filter;
    });
    zoneNameEl.textContent = ZONE_LABEL[state.zone];
    finishNameEl.textContent = T.byId[current].name;
  }

  function renderLooks() {
    looksEl.innerHTML = '';
    LOOKS.forEach(l => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'look';
      b.innerHTML = `<span class="look__dots"><i style="background-image:${thumb(l.upper)}"></i><i style="background-image:${thumb(l.base)}"></i><i style="background-image:${thumb(l.bench)}"></i></span>${l.name}`;
      b.addEventListener('click', () => applyLook(l));
      looksEl.appendChild(b);
    });
  }

  function setStatus(text) { statusEl.textContent = text; }

  function setChameleon(id) {
    if (chamBody) chamBody.style.fill = T.tone(id);
  }

  let running = 0;
  async function show(sel, opts) {
    opts = opts || {};
    running++;
    section && section.classList.add('is-wrapping');
    setStatus(opts.label || 'Wrapping…');
    setTimeout(() => setChameleon(sel.upper), reduce ? 0 : 300);
    const jobs = [];
    const delay = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
    jobs.push(wrapZone('upper', sel.upper, opts));
    jobs.push(delay(220).then(() => wrapZone('base', sel.base, opts)));
    jobs.push(delay(440).then(() => wrapZone('bench', sel.bench, opts)));
    await Promise.all(jobs);
    running--;
    if (!running) {
      section && section.classList.remove('is-wrapping');
      setStatus(state.original ? 'Original kitchen' : lookText());
    }
  }

  function apply() {
    state.original = false;
    originalBtn.setAttribute('aria-pressed', 'false');
    originalBtn.querySelector('span').textContent = 'Show original';
    show(chosen);
    renderZones();
    syncSwatches();
    updateQuoteLink();
    if (state.touched) document.dispatchEvent(new CustomEvent('bora:look', { detail: { text: lookText() } }));
  }

  function choose(id) {
    state.touched = true;
    if (state.zone === 'cab') { chosen.upper = id; chosen.base = id; }
    else chosen[state.zone] = id;
    apply();
  }

  function applyLook(l) {
    state.touched = true;
    chosen = { upper: l.upper, base: l.base, bench: l.bench };
    const two = l.upper !== l.base;
    if (two !== state.twoTone) { state.twoTone = two; twoToneEl.checked = two; }
    apply();
  }

  function surprise() {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const cabs = T.FINISHES.filter(f => !f.hidden && (f.group === 'solid' || f.group === 'timber'));
    const benches = T.FINISHES.filter(f => !f.hidden && (f.group === 'stone' || f.group === 'timber'));
    let upper = pick(cabs).id, base = upper, bench;
    if (Math.random() < .35) { base = pick(cabs.filter(f => f.id !== upper)).id; }
    do { bench = pick(benches).id; } while (bench === upper || bench === base);
    applyLook({ upper, base, bench });
  }

  function updateQuoteLink() {
    const cfg = window.BORA || {};
    const msg = `Hi Bora Decor! I tried the colour studio and I like: ${lookText()}. Could I get a quote? I'll send photos of my kitchen.`;
    quoteBtn.href = `https://wa.me/${cfg.whatsapp || '61482530280'}?text=${encodeURIComponent(msg)}`;
    quoteBtn.dataset.look = lookText();
  }

  // Filtros
  root.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
  function setFilter(f) {
    state.filter = f;
    root.querySelectorAll('[data-filter]').forEach(b => {
      const on = b.dataset.filter === f;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    syncSwatches();
  }

  twoToneEl.addEventListener('change', () => {
    state.twoTone = twoToneEl.checked;
    if (!state.twoTone) {
      chosen.base = chosen.upper;
      if (state.zone !== 'bench') state.zone = 'cab';
      apply();
    } else {
      if (state.zone === 'cab') state.zone = 'base';
      renderZones(); syncSwatches();
    }
  });

  originalBtn.addEventListener('click', () => {
    state.touched = true;
    if (state.original) { apply(); return; }
    state.original = true;
    originalBtn.setAttribute('aria-pressed', 'true');
    originalBtn.querySelector('span').textContent = 'Show new look';
    show(ORIGINAL, { dir: -1, label: 'Peeling back…' });
  });

  root.querySelector('[data-studio-random]').addEventListener('click', surprise);

  quoteBtn.addEventListener('click', e => {
    // Leva a combinação para o formulário de orçamento
    const field = document.querySelector('[data-look-field]');
    if (field) {
      field.value = lookText();
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('bora:goto', { detail: { target: '#quote', focus: field } }));
    }
  });

  // Atalho vindo dos cartões de acabamento
  document.addEventListener('bora:filter', e => setFilter(e.detail.filter));

  // Olho do camaleão da cozinha acompanha o cursor (feito em app.js para todos os camaleões)
  cham.classList.add('chameleon');

  // ---------- Início ----------
  let built = false;
  function build() {
    if (built) return;
    built = true;
    wrapZone('upper', ORIGINAL.upper, { instant: true });
    wrapZone('base', ORIGINAL.base, { instant: true });
    wrapZone('bench', ORIGINAL.bench, { instant: true });
    setChameleon(ORIGINAL.upper);
    renderZones();
    renderSwatches();
    renderLooks();
    updateQuoteLink();
    setStatus('Original kitchen');
  }

  // Prepara as texturas antes da seção aparecer e, quando ela aparece, "envelopa" a cozinha sozinha uma vez
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 200));
  const warm = () => idle(() => { build(); [FIRST_LOOK.upper, FIRST_LOOK.bench].forEach(id => T.texture(id, 384)); });
  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { near.disconnect(); warm(); }
    }, { rootMargin: '1200px 0px' });
    near.observe(root);
    const seen = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        seen.disconnect();
        build();
        setTimeout(() => { if (!state.touched) apply(); }, reduce ? 0 : 700);
      }
    }, { threshold: .45 });
    seen.observe(svg);
  } else {
    build();
    apply();
  }

  window.BoraStudio = { lookText: () => (state.original ? '' : lookText()) };
})();
