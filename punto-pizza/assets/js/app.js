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
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
let lenis = null;

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

/* ---------- Rolagem suave (Lenis) ---------- */

function headerOffset(extra = 16) {
  const tools = $('.menu-tools');
  return ($('.site-header') ? $('.site-header').offsetHeight : 0) + (tools ? tools.offsetHeight : 0) + extra;
}

function scrollToEl(el, offset) {
  const top = el.getBoundingClientRect().top + window.scrollY - (offset ?? headerOffset());
  if (lenis) lenis.scrollTo(top, { duration: 1.2 });
  else window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
}

function initSmooth() {
  if (!reduceMotion && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  // Links para âncoras da mesma página: rolagem suave, descontando o cabeçalho
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const el = id.length > 1 && document.getElementById(id.slice(1));
    if (!el) return;
    e.preventDefault();
    scrollToEl(el);
    history.replaceState(null, '', id);
    if (el.matches('main, [tabindex]')) el.focus({ preventScroll: true });
  });
}

/* ---------- Cabeçalho, menu do celular e barra fixa ---------- */

function initHeader() {
  const header = $('.site-header');
  const bar = $('.order-bar');
  const toggle = $('.menu-toggle');
  const onScroll = () => {
    const y = window.scrollY;
    header && header.classList.toggle('scrolled', y > 8);
    bar && bar.classList.toggle('show', y > 520 && !document.body.classList.contains('menu-open'));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!toggle) return;
  const close = () => {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  };
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
    onScroll();
  });
  $$('.nav a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 1060) close(); });
}

/* ---------- Títulos que entram palavra por palavra ---------- */

function splitWords(el) {
  let i = 0;
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement('span');
          const s = document.createElement('span');
          w.className = 'w';
          s.textContent = part;
          s.style.setProperty('--i', i++);
          w.append(s);
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('punto') && n.tagName !== 'BR') {
        walk(n);
      }
    });
  };
  walk(el);
  // o "punto" fica grudado na última palavra (não pode cair sozinho na linha de baixo)
  $$('.punto', el).forEach(p => { const prev = p.previousElementSibling; if (prev && prev.classList.contains('w')) prev.append(p); });
  el.style.setProperty('--n', i);
  el.classList.add('split');
}

/* ---------- Entrada das seções ao rolar ---------- */

function initReveal() {
  if (!reduceMotion) $$('[data-split]').forEach(splitWords);
  const hero = $('.hero');
  const heroTitle = hero && $('h1', hero);
  if (hero) {
    if (heroTitle && !reduceMotion) splitWords(heroTitle);
    requestAnimationFrame(() => requestAnimationFrame(() => { hero.classList.add('in'); heroTitle && heroTitle.classList.add('in'); }));
  }
  const els = $$('.rv, .rv-img, .rv-pop, .split:not(.hero h1)');
  if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .06 });
  els.forEach(el => io.observe(el));
}

/* ---------- Efeitos ligados à rolagem: topo, profundidade e giro das pizzas ---------- */

function initScrollFx() {
  if (reduceMotion) return;
  const speeds = $$('[data-speed]');
  const spins = $$('[data-spin]');
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    speeds.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      el.style.setProperty('--ty', ((r.top + r.height / 2 - vh / 2) * -parseFloat(el.dataset.speed)).toFixed(1) + 'px');
    });
    spins.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      el.style.setProperty('--rot', ((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.spin)).toFixed(2) + 'deg');
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

/* ---------- Números que contam (4,6 · 340) ---------- */

function initCounters() {
  const els = $$('[data-count]');
  if (!els.length) return;
  const fmt = (v, dec) => v.toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const run = el => {
    const to = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split('.')[1] || '').length;
    if (reduceMotion) { el.textContent = fmt(to, dec) + (el.dataset.suffix || ''); return; }
    const t0 = performance.now(), dur = 1600;
    const step = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(to * e, dec) + (el.dataset.suffix || '');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .6 });
  els.forEach(el => io.observe(el));
}

/* ---------- Carrossel de pizzas: arrastar, setas e barra de progresso ---------- */

function initRails() {
  $$('[data-rail]').forEach(wrap => {
    const rail = $('.rail', wrap);
    const bar = $('.rail-progress', wrap);
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const vis = rail.clientWidth / rail.scrollWidth;
      const p = max > 0 ? rail.scrollLeft / max : 1;
      if (bar) bar.style.setProperty('--rp', (vis + p * (1 - vis)).toFixed(3));
    };
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    $$('[data-dir]', wrap).forEach(b => b.addEventListener('click', () => {
      rail.scrollBy({ left: +b.dataset.dir * rail.clientWidth * .75, behavior: reduceMotion ? 'auto' : 'smooth' });
    }));
    // Arrastar com o mouse (no celular o dedo já rola)
    let down = false, moved = false, sx = 0, sl = 0;
    rail.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft;
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; rail.classList.add('dragging'); }
      if (moved) rail.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      setTimeout(() => rail.classList.remove('dragging'), 0);
    });
    rail.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    rail.addEventListener('dragstart', e => e.preventDefault());
  });
}

/* ---------- O método: a foto da esquerda acompanha o passo que está na tela ---------- */

function initStory() {
  const media = $('.story-media');
  const steps = $$('.story-steps li');
  if (!media || !steps.length) return;
  const imgs = $$('img', media);
  const no = $('.step-no', media);
  const set = i => {
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    imgs.forEach((im, k) => im.classList.toggle('on', k === i));
    if (no) no.textContent = String(i + 1).padStart(2, '0');
  };
  set(0);
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(steps.indexOf(e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => io.observe(s));
}

/* ---------- Botões "magnéticos" (só com mouse) ---------- */

function initMagnetic() {
  if (reduceMotion || !finePointer) return;
  $$('.btn-rosso, .btn-glass, .btn-ink, .round-btn').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .16).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * .24).toFixed(1)}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------- Menu: filtros, busca, abas e "scegli per me" ---------- */

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function initMenu() {
  const menu = $('#menu-list');
  if (!menu) return;
  const dishes = $$('.dish', menu);
  const pizzas = dishes.filter(d => d.dataset.kind === 'pizza');
  const search = $('#menu-search');
  const empty = $('#menu-empty');
  let filter = 'all';
  let query = '';

  const tabs = $$('.tabs a');
  const pill = $('.tabs .pill');
  const movePill = a => {
    if (!pill || !a) return;
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
    a.parentElement.scrollTo({ left: a.offsetLeft - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  const setTab = a => { tabs.forEach(t => t.classList.toggle('on', t === a)); movePill(a); };

  function apply() {
    const q = norm(query.trim());
    let shown = 0;
    dishes.forEach(d => {
      const tags = (d.dataset.tags || '').split(' ');
      const okFilter = filter === 'all' || tags.includes(filter);
      const okQuery = !q || norm(d.textContent).includes(q);
      d.hidden = !(okFilter && okQuery);
      if (!d.hidden) shown++;
    });
    $$('.menu-sec', menu).forEach(sec => { sec.hidden = !$$('.dish', sec).some(d => !d.hidden); });
    tabs.forEach(a => { const sec = document.getElementById(a.getAttribute('href').slice(1)); a.hidden = sec ? sec.hidden : false; });
    if (empty) empty.hidden = shown > 0;
    const on = tabs.find(t => t.classList.contains('on') && !t.hidden) || tabs.find(t => !t.hidden);
    if (on) setTab(on);
  }

  $$('.chip[data-filter]').forEach(c => c.addEventListener('click', () => {
    filter = c.dataset.filter;
    $$('.chip[data-filter]').forEach(x => x.setAttribute('aria-pressed', String(x === c)));
    apply();
  }));
  if (search) search.addEventListener('input', () => { query = search.value; apply(); });

  // Aba ativa conforme a rolagem
  if (tabs.length) {
    setTab(tabs[0]);
    window.addEventListener('resize', () => movePill(tabs.find(t => t.classList.contains('on'))));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const a = tabs.find(t => t.getAttribute('href') === '#' + e.target.id);
        if (a) setTab(a);
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
    scrollToEl(d, window.innerHeight / 2 - d.offsetHeight / 2);
    d.classList.add('picked');
    const img = $('.ph img', d);
    if (img && !reduceMotion) img.animate([{ transform: 'scale(1) rotate(0)' }, { transform: 'scale(1.1) rotate(540deg)' }, { transform: 'scale(1) rotate(720deg)' }], { duration: 1400, easing: 'cubic-bezier(.16,1,.3,1)' });
    if (toast) {
      toast.textContent = `Stasera si va di ${$('h3', d).textContent.trim()}!`;
      toast.classList.add('show');
      clearTimeout(toast._t);
      toast._t = setTimeout(() => toast.classList.remove('show'), 3200);
    }
    setTimeout(() => d.classList.remove('picked'), 3800);
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
  initSmooth();
  initHeader();
  initReveal();
  initScrollFx();
  initCounters();
  initRails();
  initStory();
  initMagnetic();
  initMenu();
  initCap();
  initMap();
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
});
