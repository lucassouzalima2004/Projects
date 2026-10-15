/* Punto Pizza Verona · comportamento do site
   Os dados que mudam de vez em quando estão aqui no topo. */

const CONFIG = {
  // Horário de abertura (hora de Verona). 0 = domingo, 1 = segunda... Dia sem horário = fechado.
  hours: {
    0: ['17:00', '21:30'],
    1: null,
    2: ['17:00', '21:30'],
    3: ['17:00', '21:30'],
    4: ['17:00', '21:30'],
    5: ['17:00', '21:30'],
    6: ['17:00', '21:30']
  },
  phone: '045 862 2340'
};

const DAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Aperto / chiuso (sempre na hora de Verona) ---------- */

function romeNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, min: +get('hour') * 60 + +get('minute') };
}
const toMin = hm => { const [h, m] = hm.split(':'); return +h * 60 + +m; };

function openStatus() {
  const { day, min } = romeNow();
  const today = CONFIG.hours[day];
  if (today && min >= toMin(today[0]) && min < toMin(today[1])) {
    return { open: true, text: `Aperto ora · fino alle ${today[1]}`, day };
  }
  if (today && min < toMin(today[0])) return { open: false, text: `Chiuso · apre oggi alle ${today[0]}`, day };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const h = CONFIG.hours[d];
    if (h) return { open: false, text: `Chiuso · apre ${i === 1 ? 'domani' : DAYS[d]} alle ${h[0]}`, day };
  }
  return { open: false, text: 'Chiuso', day };
}

function paintStatus() {
  const s = openStatus();
  $$('.status').forEach(el => {
    el.textContent = s.text;
    el.classList.toggle('is-open', s.open);
  });
  $$('.orari tr[data-day]').forEach(tr => tr.classList.toggle('today', +tr.dataset.day === s.day));
}

/* ---------- Cabeçalho, menu do celular e barra fixa ---------- */

function initHeader() {
  const header = $('.site-header');
  const bar = $('.order-bar');
  const toggle = $('.menu-toggle');
  const onScroll = () => {
    const y = window.scrollY;
    header && header.classList.toggle('scrolled', y > 8);
    bar && bar.classList.toggle('show', y > 420 && !document.body.classList.contains('menu-open'));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!toggle) return;
  const close = () => {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
    onScroll();
  });
  $$('.nav a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 980) close(); });
}

/* ---------- Entrada suave das seções ---------- */

function initReveal() {
  const els = $$('.rv');
  if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  els.forEach(el => io.observe(el));
}

/* ---------- Pizzas ilustradas ----------
   Cada pizza do site é desenhada a partir dos ingredientes escritos embaixo dela:
   mudou o texto, muda o desenho. Ingrediente novo sem desenho? Acrescente em TOPPINGS. */

const Pizza = (() => {
  const f = n => Math.round(n * 10) / 10;
  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  // Forma orgânica fechada (curva suave passando por pontos ao redor de um centro)
  function blob(r, rnd, n = 8, j = .3, cx = 0, cy = 0) {
    const p = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      const rr = r * (1 - j / 2 + rnd() * j);
      p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    let d = `M${f(p[0][0])} ${f(p[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + 'Z';
  }
  const dots = (rnd, n, r, fill, spread) => Array.from({ length: n }, () =>
    `<circle cx="${f((rnd() - .5) * spread)}" cy="${f((rnd() - .5) * spread)}" r="${r}" fill="${fill}"/>`).join('');

  // layer: 1 queijos · 2 legumes · 3 carnes · 4 por cima. s: raio para não encavalar. free: pode encavalar.
  const TOPPINGS = [
    { k: 'burrata', re: /burrata/, layer: 4, n: 1, s: 22, center: true,
      draw: () => '<circle r="19" fill="url(#pz-burrata)" stroke="#e6dcc6" stroke-width="1"/><path d="M-5 -15.5Q0 -21 5 -15.5" fill="none" stroke="#e2d6bc" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="-6" cy="-6" rx="5" ry="3" fill="#fff" opacity=".8"/>' },
    { k: 'bufala', re: /mozzarella di bufala|bufala/, layer: 1, n: 6, s: 11,
      draw: rnd => `<path d="${blob(11, rnd, 9, .28)}" fill="#fffdf6" stroke="#efe5d0" stroke-width="1"/>` },
    { k: 'sfilacci', re: /sfilacci/, layer: 4, n: 22, s: 4, free: true,
      draw: () => '<path d="M-6 0q3-2.4 6 0t6 0" fill="none" stroke="#6e2a20" stroke-width="1.6" stroke-linecap="round"/>' },
    { k: 'salamino', re: /salamino/, layer: 3, n: 6, s: 10,
      draw: rnd => `<circle r="9.5" fill="#a92229" stroke="#7d151b" stroke-width="1.4"/>${dots(rnd, 6, 1.3, '#eaa39b', 12)}` },
    { k: 'speck', re: /speck/, layer: 3, n: 5, s: 11,
      draw: () => '<rect x="-12" y="-4.5" width="24" height="9" rx="2.5" fill="#8f2f2a"/><rect x="-12" y="-4.5" width="24" height="2.6" rx="1.3" fill="#f2d6cb"/>' },
    { k: 'pancetta', re: /pancetta/, layer: 3, n: 6, s: 10,
      draw: () => '<rect x="-11" y="-4" width="22" height="8" rx="2.5" fill="#e48f88"/><rect x="-11" y="-1.6" width="22" height="1.8" fill="#fbe5de"/><rect x="-11" y="2" width="22" height="1" fill="#fbe5de"/>' },
    { k: 'prosciutto', re: /prosciutto/, layer: 3, n: 5, s: 12,
      draw: rnd => `<path d="${blob(12, rnd, 10, .5)}" fill="#f1a4a1" stroke="#dc8783" stroke-width="1"/><path d="M-7 -5q7-4 13 1" fill="none" stroke="#fde6e1" stroke-width="2" stroke-linecap="round"/>` },
    { k: 'wurstel', re: /w[uü]rstel/, layer: 3, n: 7, s: 7,
      draw: () => '<circle r="6.2" fill="#d98a6b" stroke="#b5664a" stroke-width="1.2"/><circle r="3.3" fill="#ebb091"/>' },
    { k: 'salsiccia', re: /salsiccia/, layer: 3, n: 9, s: 6,
      draw: rnd => `<path d="${blob(5, rnd, 7, .6)}" fill="#9c5a3b"/>${dots(rnd, 3, .9, '#6f3a24', 5)}` },
    { k: 'tonno', re: /tonno/, layer: 3, n: 7, s: 7,
      draw: rnd => `<path d="${blob(6.5, rnd, 8, .6)}" fill="#c9a48d"/><path d="M-3 -2l5 1M-2 2l4 .5" stroke="#a37d66" stroke-width=".9" stroke-linecap="round"/>` },
    { k: 'acciughe', re: /acciughe|alici/, layer: 3, n: 6, s: 9,
      draw: () => '<path d="M-11 0C-5-3 5-3 11 0C5 3-5 3-11 0Z" fill="#7b4a38"/><path d="M-8 0H8" stroke="#cfc6ba" stroke-width=".8"/>' },
    { k: 'funghi', re: /funghi/, layer: 2, n: 6, s: 9,
      draw: () => '<path d="M-8.5-1C-8.5-9 8.5-9 8.5-1C8.5 1 4.5 1 3.2 1L3.2 7C3.2 9.2-3.2 9.2-3.2 7L-3.2 1C-4.5 1-8.5 1-8.5-1Z" fill="#cba57d" stroke="#8c6849" stroke-width=".9"/><path d="M-6.5-1.2H6.5" stroke="#9c7756" stroke-width=".9"/>' },
    { k: 'bosco', re: /misto bosco|porcini|chiodini/, layer: 2, n: 8, s: 7,
      draw: () => '<path d="M-7-1C-7-7.5 7-7.5 7-1C7 .8 3.6.8 2.6.8L2.6 5.6C2.6 7.4-2.6 7.4-2.6 5.6L-2.6.8C-3.6.8-7 .8-7-1Z" fill="#8f6b4b" stroke="#5e4430" stroke-width=".9"/>' },
    { k: 'carciofi', re: /carciof[io]/, layer: 2, n: 5, s: 10,
      draw: () => '<path d="M0-10.5C7.5-6.5 8.5 4 0 10.5C-8.5 4-7.5-6.5 0-10.5Z" fill="#b2b665" stroke="#7d8240" stroke-width="1"/><path d="M0-8V8M0-3.5 4-6.5M0 1 4.8-2M0-3.5-4-6.5M0 1-4.8-2" stroke="#7d8240" stroke-width=".9" fill="none"/>' },
    { k: 'olive', re: /olive/, layer: 3, n: 7, s: 5,
      draw: () => '<circle r="4.8" fill="#2b2420"/><circle r="1.8" fill="#5b3a2e"/><circle cx="-1.8" cy="-2.2" r="1" fill="#6d625b"/>' },
    { k: 'patatine', re: /patatine/, layer: 3, n: 14, s: 5, free: true,
      draw: () => '<rect x="-1.9" y="-8.5" width="3.8" height="17" rx="1.3" fill="#f3c34f" stroke="#d49b2a" stroke-width=".8"/>' },
    { k: 'patate', re: /\bpatate\b/, layer: 2, n: 6, s: 9,
      draw: rnd => `<circle r="8.2" fill="#f3dc9f" stroke="#ddbb6e" stroke-width="1.2"/>${dots(rnd, 3, .8, '#b98a3e', 9)}` },
    { k: 'zucchine', re: /zucchin[ei]/, layer: 2, n: 7, s: 8,
      draw: rnd => `<circle r="7.4" fill="#ecebc0" stroke="#3f7b37" stroke-width="2.1"/>${dots(rnd, 4, .9, '#c4c088', 6)}` },
    { k: 'melanzane', re: /melanzan[ae]/, layer: 2, n: 6, s: 9,
      draw: rnd => `<circle r="8.4" fill="#ead7a2" stroke="#4a2547" stroke-width="2.6"/>${dots(rnd, 5, .8, '#b79e64', 9)}` },
    { k: 'peperoni', re: /peperon[ie]/, layer: 2, n: 9, s: 7,
      draw: (rnd, i) => `<path d="M-9 3Q0-5 9 3" fill="none" stroke="${['#d93a2b', '#f2b33d', '#d93a2b'][i % 3]}" stroke-width="4" stroke-linecap="round"/>` },
    { k: 'radicchio', re: /radicchio/, layer: 2, n: 6, s: 9,
      draw: () => '<path d="M-8.5-3C-4.5-9.5 6-8.5 8.5-2C9.5 4 2.5 8.5-3 6.5C-8.5 4.5-10.5 1-8.5-3Z" fill="#8e1f3a"/><path d="M-5-1C-1-4 3-3 5 0M-3 3C0 1 3 2 4.2 4" stroke="#f2d7df" stroke-width="1.1" fill="none"/>' },
    { k: 'friarielli', re: /friarielli|cime di rapa/, layer: 2, n: 8, s: 8,
      draw: rnd => `<path d="${blob(7.5, rnd, 9, .6)}" fill="#2f5d2a"/><path d="M-4 0H4" stroke="#4f8a43" stroke-width="1"/>` },
    { k: 'cipolla', re: /cipoll[ae]/, layer: 2, n: 8, s: 7,
      draw: () => '<path d="M-7.5 1A7.5 7.5 0 0 1 7.5 1" fill="none" stroke="#efe0ee" stroke-width="2.4" stroke-linecap="round"/><path d="M-4.6 1A4.6 4.6 0 0 1 4.6 1" fill="none" stroke="#b27aa8" stroke-width="1.7" stroke-linecap="round"/>' },
    { k: 'cirio', re: /cirio|pomodorin[io]|ciliegin[io]/, layer: 2, n: 7, s: 7,
      draw: rnd => `<circle r="6.4" fill="#e3392c"/><circle r="4.6" fill="#f26d57"/>${dots(rnd, 4, .9, '#f8d3a1', 5)}` },
    { k: 'philadelphia', re: /philadelphia|formaggio spalmabile/, layer: 1, n: 6, s: 6,
      draw: rnd => `<path d="${blob(5.8, rnd, 7, .35)}" fill="#ffffff" stroke="#ebe4d8" stroke-width=".9"/>` },
    { k: 'stracchino', re: /stracchino|squacquerone|crescenza/, layer: 1, n: 5, s: 8,
      draw: rnd => `<path d="${blob(7.5, rnd, 8, .4)}" fill="#fff9ec" stroke="#ece0c6" stroke-width=".9"/>` },
    { k: 'ricotta', re: /ricotta/, layer: 1, n: 6, s: 6,
      draw: rnd => `<path d="${blob(5.5, rnd, 8, .5)}" fill="#ffffff" stroke="#ece6da" stroke-width=".8"/>${dots(rnd, 3, .5, '#e7dfd1', 6)}` },
    { k: 'brie', re: /brie/, layer: 1, n: 5, s: 9,
      draw: () => '<path d="M0 0L11-4.5A12 12 0 0 1 11 4.5Z" fill="#f5e4b3"/><path d="M11-4.5A12 12 0 0 1 11 4.5" fill="none" stroke="#fffdf5" stroke-width="2.4"/>' },
    { k: 'gorgonzola', re: /gorgonzola/, layer: 1, n: 6, s: 7,
      draw: rnd => `<path d="${blob(6.8, rnd, 8, .45)}" fill="#f7f1df"/>${dots(rnd, 4, .9, '#5c7e78', 8)}` },
    { k: 'scamorza', re: /scamorza|provola/, layer: 1, n: 5, s: 9,
      draw: rnd => `<path d="${blob(9, rnd, 8, .3)}" fill="#ecc994" stroke="#c99c5f" stroke-width="1.2"/>` },
    { k: 'mozzarella', re: /mozzarella|fior di latte/, layer: 1, cheese: true },
    { k: 'grana', re: /grana|parmigiano/, layer: 4, n: 10, s: 4, free: true,
      draw: rnd => `<path d="M${f(-3 - rnd() * 2)} ${f(-2 - rnd())}L${f(3 + rnd() * 2)} -2L${f(2 + rnd() * 2)} ${f(2 + rnd() * 2)}L${f(-3 - rnd())} 3Z" fill="#f1da93" stroke="#d6ba68" stroke-width=".5"/>` },
    { k: 'rucola', re: /rucola|rucoletta/, layer: 4, n: 9, s: 7,
      draw: () => '<path d="M0-12C3-9 1-7 4-5C2-3 5-1 3 1C5 3 2 5 3 8L0 12L-3 8C-2 5-5 3-3 1C-5-1-2-3-4-5C-1-7-3-9 0-12Z" fill="#4f8a2b"/><path d="M0-10V10" stroke="#3a6b1e" stroke-width=".9"/>' },
    { k: 'basilico', re: /basilico/, layer: 4, n: 5, s: 9,
      draw: () => '<path d="M0-10C7-6 7 5 0 10C-7 5-7-6 0-10Z" fill="#2f7d32"/><path d="M0-8.5V8.5" stroke="#1e5a22" stroke-width="1"/>' },
    { k: 'capperi', re: /capperi/, layer: 4, n: 10, s: 3,
      draw: () => '<circle r="2.4" fill="#6f7f38"/><circle cx=".7" cy="-.7" r=".7" fill="#9cab5b"/>' },
    { k: 'aglio', re: /aglio/, layer: 4, n: 9, s: 3, free: true,
      draw: () => '<path d="M-2.6 0Q0-2.2 2.6 0Q0 1.3-2.6 0Z" fill="#f8f1df"/>' },
    { k: 'origano', re: /origano/, layer: 4, n: 34, s: 1, free: true,
      draw: () => '<circle r=".95" fill="#4d6128"/>' }
  ];

  const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    <radialGradient id="pz-crust"><stop offset=".8" stop-color="#f3ca86"/><stop offset=".9" stop-color="#e2a65a"/><stop offset="1" stop-color="#b8742f"/></radialGradient>
    <radialGradient id="pz-sauce" cx=".45" cy=".4"><stop offset="0" stop-color="#e5482f"/><stop offset="1" stop-color="#c22c1b"/></radialGradient>
    <radialGradient id="pz-bianca" cx=".45" cy=".4"><stop offset="0" stop-color="#fbf0d2"/><stop offset="1" stop-color="#ecd5a3"/></radialGradient>
    <radialGradient id="pz-burrata" cx=".38" cy=".35"><stop offset=".25" stop-color="#ffffff"/><stop offset="1" stop-color="#ebe3d1"/></radialGradient>
  </defs></svg>`;

  function parse(text) {
    let t = ' ' + text.toLowerCase() + ' ';
    const tomato = /pomodoro/.test(t);
    const found = [];
    TOPPINGS.forEach(tp => {
      if (tp.re.test(t)) { found.push(tp); t = t.replace(tp.re, ' '); }
    });
    return { tomato, found };
  }

  function svg(text, seedText) {
    const rnd = rng(hash(seedText || text));
    const { tomato, found } = parse(text);
    const cheese = found.some(t => t.cheese);
    let out = '';

    // Borda e pontos queimados do forno
    out += '<circle cx="100" cy="100" r="96" fill="url(#pz-crust)"/>';
    for (let i = 0, n = 9 + Math.floor(rnd() * 5); i < n; i++) {
      const a = rnd() * Math.PI * 2, rr = 86 + rnd() * 7;
      out += `<path d="${blob(2 + rnd() * 3.5, rnd, 6, .6, 100 + Math.cos(a) * rr, 100 + Math.sin(a) * rr)}" fill="#6b3a1c" opacity="${f(.25 + rnd() * .35)}"/>`;
    }
    // Base: molho de tomate ou pizza "bianca"
    out += `<path d="${blob(81, rnd, 16, .06, 100, 100)}" fill="url(#${tomato ? 'pz-sauce' : 'pz-bianca'})"/>`;
    // Textura do molho
    if (tomato) {
      for (let i = 0; i < 26; i++) {
        const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 74;
        out += `<circle cx="${f(100 + Math.cos(a) * rr)}" cy="${f(100 + Math.sin(a) * rr)}" r="${f(1 + rnd() * 2.2)}" fill="${rnd() > .5 ? '#a8200f' : '#ef6a3c'}" opacity=".45"/>`;
      }
    }
    // Mozzarella derretida
    if (cheese) {
      for (let i = 0, n = tomato ? 12 : 15; i < n; i++) {
        const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 62;
        const x = 100 + Math.cos(a) * rr, y = 100 + Math.sin(a) * rr, r = 9 + rnd() * 8;
        out += `<path d="${blob(r, rnd, 9, .5, x, y)}" fill="#fff3d6" opacity="${tomato ? .95 : .85}"/>`;
        if (tomato && rnd() > .4) out += `<circle cx="${f(x - r * .3)}" cy="${f(y - r * .3)}" r="${f(r * .25)}" fill="#fffaf0" opacity=".9"/>`;
      }
    }

    // Coberturas, sem encavalar (menos quando é miúdo, como orégano)
    const placed = [];
    const many = found.filter(t => !t.cheese && !t.free).length;
    const scale = many > 4 ? .7 : many > 2 ? .85 : 1;
    const items = [];
    found.filter(t => !t.cheese).forEach(tp => {
      const n = tp.center ? 1 : Math.max(2, Math.round(tp.n * (tp.free ? 1 : scale)));
      for (let i = 0; i < n; i++) {
        let x = 100, y = 100;
        if (!tp.center) {
          let ok = false;
          for (let tries = 0; tries < 40 && !ok; tries++) {
            const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * (70 - tp.s * .6);
            x = 100 + Math.cos(a) * rr; y = 100 + Math.sin(a) * rr;
            ok = tp.free || placed.every(p => Math.hypot(p.x - x, p.y - y) > (p.s + tp.s) * .82);
          }
          if (!ok) continue;
        }
        if (!tp.free) placed.push({ x, y, s: tp.s });
        items.push({ layer: tp.layer, g: `<g transform="translate(${f(x)} ${f(y)}) rotate(${Math.round(rnd() * 360)})">${tp.draw(rnd, i)}</g>` });
      }
    });
    items.sort((a, b) => a.layer - b.layer).forEach(it => { out += it.g; });

    // Brilho de azeite
    out += '<ellipse cx="78" cy="70" rx="26" ry="14" fill="#fff" opacity=".07" transform="rotate(-30 78 70)"/>';
    return `<svg class="pz" viewBox="0 0 200 200" aria-hidden="true" focusable="false">${out}</svg>`;
  }

  function mount(root = document) {
    const targets = $$('[data-pz]', root);
    if (!targets.length) return;
    if (!document.getElementById('pz-crust')) document.body.insertAdjacentHTML('afterbegin', DEFS);
    targets.forEach(el => {
      const host = el.closest('[data-pz-host]') || el.parentElement;
      const text = el.dataset.pz || ($('.ing', host) || {}).textContent || '';
      const name = ($('h3', host) || {}).textContent || text;
      el.innerHTML = svg(text, el.dataset.seed || name.trim());
    });
  }

  return { svg, mount, parse };
})();

/* ---------- Menu: filtros, busca, abas e "scegli per me" ---------- */

const MEAT = /salamino|prosciutto|speck|pancetta|w[uü]rstel|salsiccia|sfilacci|tonno|acciughe|alici|mortadella|salame|bresaola|cotto|crudo|nduja|guanciale/;
const HOT = /piccante|nduja|peperoncino|diavola/;
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function initMenu() {
  const menu = $('#menu-list');
  if (!menu) return;
  const dishes = $$('.dish', menu);
  const pizzas = dishes.filter(d => d.querySelector('[data-pz]'));

  // Selos automáticos a partir dos ingredientes
  pizzas.forEach(d => {
    const ing = $('.ing', d).textContent.toLowerCase();
    const h3 = $('h3', d);
    d.dataset.veg = String(!MEAT.test(ing));
    d.dataset.hot = String(HOT.test(ing));
    d.dataset.bianca = String(!/pomodoro/.test(ing));
    if (d.dataset.veg === 'true') h3.insertAdjacentHTML('beforeend', '<span class="mini veg"><svg><use href="#i-leaf"/></svg>Veg</span>');
    if (d.dataset.hot === 'true') h3.insertAdjacentHTML('beforeend', '<span class="mini hot"><svg><use href="#i-chili"/></svg>Piccante</span>');
  });
  $$('.chip[data-filter]').forEach(c => {
    const key = c.dataset.filter;
    const n = key === 'all' ? pizzas.length : pizzas.filter(d => d.dataset[key] === 'true').length;
    const count = $('.n', c);
    if (count) count.textContent = n;
  });

  let filter = 'all';
  let query = '';
  const search = $('#menu-search');
  const empty = $('#menu-empty');

  function apply() {
    const q = norm(query.trim());
    let shown = 0;
    dishes.forEach(d => {
      const isPizza = pizzas.includes(d);
      const okFilter = filter === 'all' || (isPizza && d.dataset[filter] === 'true');
      const okQuery = !q || norm(d.textContent).includes(q);
      d.hidden = !(okFilter && okQuery);
      if (!d.hidden) shown++;
    });
    $$('.menu-sec', menu).forEach(sec => { sec.hidden = !$$('.dish', sec).some(d => !d.hidden); });
    $$('.tabs a').forEach(a => {
      const sec = document.getElementById(a.getAttribute('href').slice(1));
      a.hidden = sec ? sec.hidden : false;
    });
    if (empty) empty.hidden = shown > 0;
  }

  $$('.chip[data-filter]').forEach(c => c.addEventListener('click', () => {
    filter = c.dataset.filter;
    $$('.chip[data-filter]').forEach(x => x.setAttribute('aria-pressed', String(x === c)));
    apply();
  }));
  if (search) search.addEventListener('input', () => { query = search.value; apply(); });

  // Aba ativa conforme a rolagem
  const tabs = $$('.tabs a');
  if ('IntersectionObserver' in window && tabs.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        tabs.forEach(t => t.classList.toggle('on', t.getAttribute('href') === '#' + e.target.id));
        const on = tabs.find(t => t.classList.contains('on'));
        if (on) on.parentElement.scrollTo({ left: on.offsetLeft - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    $$('.menu-sec', menu).forEach(s => io.observe(s));
  }

  // Non sai cosa scegliere?
  const pick = $('#pick');
  const toast = $('#toast');
  let last = null;
  if (pick) pick.addEventListener('click', () => {
    const pool = pizzas.filter(d => !d.hidden && d !== last);
    const list = pool.length ? pool : pizzas;
    const d = list[Math.floor(Math.random() * list.length)];
    last = d;
    $$('.dish.picked').forEach(x => x.classList.remove('picked'));
    d.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    d.classList.add('picked');
    const pz = $('.pz', d);
    if (pz && !reduceMotion) pz.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(720deg)' }], { duration: 1200, easing: 'cubic-bezier(.2,.7,.2,1)' });
    if (toast) {
      toast.textContent = `Stasera si va di ${$('h3', d).firstChild.textContent.trim()}!`;
      toast.classList.add('show');
      clearTimeout(toast._t);
      toast._t = setTimeout(() => toast.classList.remove('show'), 3200);
    }
    setTimeout(() => d.classList.remove('picked'), 3600);
  });
}

/* ---------- Zona de entrega por CAP ---------- */

function initCap() {
  $$('.cap-form').forEach(form => {
    const caps = (form.dataset.caps || '').split(/\s+/).filter(Boolean);
    const input = $('input', form);
    const out = form.nextElementSibling;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const v = input.value.replace(/\D/g, '');
      out.className = 'cap-out';
      if (v.length !== 5) {
        out.textContent = 'Scrivi un CAP di 5 cifre, per esempio 37138.';
        out.classList.add('no');
      } else if (caps.includes(v)) {
        out.textContent = `Sì! Consegniamo al CAP ${v}. Buon appetito!`;
        out.classList.add('ok');
      } else {
        out.textContent = `Il ${v} è fuori dalla nostra zona di consegna. Chiamaci allo ${CONFIG.phone}: vediamo se riusciamo ad arrivare. Oppure ritira in pizzeria.`;
        out.classList.add('no');
      }
    });
  });
}

/* ---------- Avaliações: setas no celular ---------- */

function initReviews() {
  $$('[data-reviews]').forEach(wrap => {
    const list = $('.reviews', wrap);
    const step = () => (list.firstElementChild ? list.firstElementChild.getBoundingClientRect().width + 16 : 300);
    $$('[data-dir]', wrap).forEach(b => b.addEventListener('click', () => {
      list.scrollBy({ left: step() * +b.dataset.dir, behavior: reduceMotion ? 'auto' : 'smooth' });
    }));
  });
}

/* ---------- Mapa do Google só quando a pessoa pede (sem cookies antes disso) ---------- */

function initMap() {
  const btn = $('#load-map');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const box = btn.closest('.map');
    box.innerHTML = `<iframe title="Mappa: Punto Pizza, Via Albere 117, Verona" src="${btn.dataset.src}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
  });
}

/* ---------- Início ---------- */

document.addEventListener('DOMContentLoaded', () => {
  paintStatus();
  setInterval(paintStatus, 60000);
  initHeader();
  Pizza.mount();
  initMenu();
  initCap();
  initReviews();
  initMap();
  initReveal();
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
});
