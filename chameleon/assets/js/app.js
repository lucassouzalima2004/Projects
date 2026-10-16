/* Chameleon · comportamento do site
   Sem build. A única biblioteca é o Lenis (rolagem suave), em assets/js/vendor/.
   Quem ativou "reduzir movimento" no aparelho recebe a página parada, sem rolagem suave nem vídeo. */
(() => {
  'use strict';
  window.CHAMELEON_OK = true;

  // Número que recebe os pedidos de orçamento (só dígitos, com 353 na frente)
  const WHATSAPP = '353892407428';
  // Cores que o camaleão percorre na seção de orçamento
  const CYCLE = ['#ffc23a', '#4d74ff', '#ff2d55', '#8cff3a', '#3fa9ff', '#ff8a2a', '#ff3d9a', '#29ff7a'];

  const root = document.documentElement;
  root.classList.add('js');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);

  let vw = innerWidth;
  let vh = innerHeight;
  let scrollY = window.scrollY;

  /* ---------- Rolagem suave ---------- */

  let lenis = null;
  if (!reduce && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false, autoRaf: false });
  }

  const scrollToTarget = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -10, duration: 1.4 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#' || id === '#main') return;
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(target);
    if (target !== 0) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  });

  /* ---------- Cor do neon (o "camaleão") ---------- */

  const glow = { section: '#ffc23a', hover: null, current: '' };
  const neons = $$('.neon');
  const applyGlow = () => {
    const c = glow.hover || glow.section;
    if (!c || c === glow.current) return;
    const first = !glow.current;
    glow.current = c;
    root.style.setProperty('--glow', c);
    if (first || reduce) return;
    // O neon visível dá uma piscada enquanto troca de cor, como um letreiro de verdade
    neons.forEach((el) => {
      if (!el.classList.contains('is-lit') || !el.animate) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      el.animate([{ opacity: 1 }, { opacity: 0.3 }, { opacity: 0.9 }, { opacity: 0.45 }, { opacity: 1 }], { duration: 340, easing: 'linear' });
    });
  };
  const setSectionGlow = (c) => { glow.section = c; applyGlow(); };
  const setHoverGlow = (c) => { glow.hover = c; applyGlow(); };

  /* ---------- Entrada da página ---------- */

  const heroNeon = $('.hero-neon');
  const ready = () => {
    if (root.classList.contains('is-ready')) return;
    root.classList.add('is-ready');
    setTimeout(() => heroNeon && heroNeon.classList.add('is-lit'), reduce ? 0 : 1050);
  };
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(() => requestAnimationFrame(ready));
  } else {
    requestAnimationFrame(ready);
  }

  /* ---------- Vídeo do topo e legendas ---------- */

  const hero = $('[data-hero]');
  const heroInner = $('.hero-inner');
  const heroMedia = $('[data-hero-media]');
  const video = $('.hero-video');
  const reelBtn = $('[data-reel-btn]');
  const ns = $('[data-ns]');
  let reel = [];
  let reelIdx = -1;
  let userPaused = false;
  const canPlay = !reduce && !saveData;

  const pickReel = () => {
    const tall = (video.currentSrc || '').includes('hero-tall') || (!video.currentSrc && matchMedia('(max-aspect-ratio: 3/4)').matches);
    try { reel = JSON.parse(tall ? video.dataset.reelTall : video.dataset.reelWide); } catch (err) { reel = []; }
  };

  const showCaption = (i) => {
    const item = reel[i];
    if (!item) return;
    const [title, kind, color] = item;
    if (activeSection === hero || !activeSection) setSectionGlow(color);
    hero.dataset.color = color;
    ns.classList.add('is-out');
    setTimeout(() => {
      $('.ns-title', ns).textContent = title;
      $('.ns-kind', ns).textContent = kind;
      ns.classList.remove('is-out');
      ns.classList.add('is-in-from');
      void ns.offsetWidth;
      ns.classList.remove('is-in-from');
    }, 280);
  };

  const onVideoTime = () => {
    if (!reel.length) return;
    const step = parseFloat(video.dataset.step) || 2;
    const offset = parseFloat(video.dataset.offset) || 0;
    const i = clamp(Math.floor((video.currentTime - offset) / step), 0, reel.length - 1);
    if (i !== reelIdx) {
      reelIdx = i;
      showCaption(i);
    }
  };

  if (video) {
    video.addEventListener('loadedmetadata', pickReel);
    video.addEventListener('playing', () => video.classList.add('is-playing'));
    video.addEventListener('timeupdate', onVideoTime);
    const setReelBtn = (paused) => {
      reelBtn.setAttribute('aria-pressed', String(paused));
      $('.reel-btn-label', reelBtn).textContent = paused ? 'Play video' : 'Pause video';
    };
    if (canPlay) {
      video.setAttribute('autoplay', '');
      const p = video.play();
      // iPhone em modo de economia de bateria bloqueia o autoplay: o botão vira "Play"
      if (p && p.catch) p.catch(() => { userPaused = true; setReelBtn(true); });
    } else {
      video.removeAttribute('preload');
      reelBtn.hidden = true;
    }
    pickReel();
    if (reel[0]) { hero.dataset.color = reel[0][2]; setSectionGlow(reel[0][2]); }

    reelBtn.addEventListener('click', () => {
      userPaused = !video.paused;
      if (userPaused) video.pause();
      else video.play().catch(() => {});
      setReelBtn(userPaused);
    });

    // Economiza bateria: pausa quando o topo sai da tela
    new IntersectionObserver(([entry]) => {
      if (!canPlay || userPaused) return;
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }).observe(hero);
  }

  /* ---------- Topo fixo e menu ---------- */

  const header = $('[data-header]');
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-btn]');
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    menuBtn.setAttribute('aria-expanded', 'true');
    $('.menu-btn-label', menuBtn).textContent = 'Close';
    header.classList.remove('is-hidden');
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    $('.menu-btn-label', menuBtn).textContent = 'Menu';
    if (lenis) lenis.start();
    document.body.style.overflow = '';
    setTimeout(() => { if (!menuOpen) menu.hidden = true; }, 450);
  }
  menuBtn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) { closeMenu(); menuBtn.focus(); }
  });

  const updateHeader = (y, dy) => {
    header.classList.toggle('is-solid', y > 40);
    if (menuOpen) return;
    if (y > vh * 0.6 && dy > 3) header.classList.add('is-hidden');
    else if (dy < -3 || y < vh * 0.6) header.classList.remove('is-hidden');
  };

  /* ---------- Títulos que entram palavra por palavra ---------- */

  const splitWords = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let i = 0;
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const outer = document.createElement('span');
        outer.className = 'sw';
        const inner = document.createElement('span');
        inner.style.setProperty('--i', i++);
        inner.textContent = part;
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  };
  if (!reduce) $$('[data-split]').forEach(splitWords);

  /* ---------- Aparecer ao rolar ---------- */

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      revealIO.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  $$('[data-reveal], [data-split], .g-item, .step').forEach((el) => revealIO.observe(el));

  const neonIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add('is-lit'), 250);
      neonIO.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  $$('[data-neon]').forEach((el) => { if (el !== heroNeon) neonIO.observe(el); });

  /* ---------- Marcas passando (a velocidade acompanha a rolagem) ---------- */

  const marquee = $('[data-marquee]');
  const mq = { x: 0, w: 0, dir: 1, track: null };
  if (marquee) {
    const row = $('.marquee-row', marquee);
    const track = document.createElement('div');
    track.className = 'marquee-track';
    row.parentNode.insertBefore(track, row);
    track.appendChild(row);
    for (let k = 0; k < 2; k++) {
      const clone = row.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }
    mq.track = track;
    mq.row = row;
  }
  const updateMarquee = (dt, vel) => {
    if (!mq.track || reduce) return;
    const top = L.brands.top - scrollY;
    if (top > vh || top + L.brands.h < 0) return;
    if (Math.abs(vel) > 20) mq.dir = vel > 0 ? 1 : -1;
    const speed = 42 + Math.min(Math.abs(vel) * 0.22, 900);
    mq.x -= speed * mq.dir * dt;
    if (mq.w) {
      if (mq.x <= -mq.w) mq.x += mq.w;
      if (mq.x > 0) mq.x -= mq.w;
    }
    mq.track.style.transform = `translate3d(${mq.x.toFixed(2)}px,0,0)`;
  };

  /* ---------- Manifesto: as palavras acendem ---------- */

  const words = $('[data-words]');
  const tokens = [];
  if (words) {
    const walker = document.createTreeWalker(words, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.parentNode.closest('.pill')) return;
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const s = document.createElement('span');
        s.className = 'mw';
        s.textContent = part;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    $$('.mw, .pill', words).forEach((el) => tokens.push({ el, pill: el.classList.contains('pill'), o: -1 }));
  }
  const updateWords = (y) => {
    if (!words || reduce) return;
    const top = L.words.top - y;
    const p = clamp((vh * 0.85 - top) / (L.words.h + vh * 0.35), 0, 1);
    const lit = p * (tokens.length + 2);
    tokens.forEach((t, i) => {
      if (t.pill) {
        t.el.classList.toggle('is-on', lit > i);
      } else {
        const o = Math.round(clamp(lit - i, 0.16, 1) * 100) / 100;
        if (o !== t.o) { t.o = o; t.el.style.opacity = o; }
      }
    });
  };

  /* ---------- Serviços: a foto segue o mouse ---------- */

  const svcRows = $$('.svc');
  const follow = $('[data-follow]');
  const fol = { x: 0, y: 0, tx: 0, ty: 0, on: false, s: 0.85, started: false, w: 0, h: 0 };
  if (follow && fine && !reduce) {
    const fimg = $('img', follow);
    let preloaded = false;
    svcRows.forEach((row) => {
      row.addEventListener('mouseenter', (e) => {
        if (!preloaded) { svcRows.forEach((r) => { const im = new Image(); im.src = r.dataset.img; }); preloaded = true; }
        if (!fol.started) { fol.x = fol.tx = e.clientX; fol.y = fol.ty = e.clientY; fol.started = true; }
        if (!fol.w) { fol.w = follow.offsetWidth; fol.h = follow.offsetHeight; }
        fol.on = true;
        follow.classList.add('is-on');
        if (!fimg.src.endsWith(row.dataset.img)) {
          fimg.src = row.dataset.img;
          fimg.classList.remove('is-swap');
          void fimg.offsetWidth;
          fimg.classList.add('is-swap');
        }
        setHoverGlow(row.dataset.color);
      });
      row.addEventListener('mouseleave', () => {
        fol.on = false;
        follow.classList.remove('is-on');
        setHoverGlow(null);
      });
      row.addEventListener('mousemove', (e) => { fol.tx = e.clientX; fol.ty = e.clientY; });
    });
  }
  svcRows.forEach((row) => row.style.setProperty('--c', row.dataset.color));
  const updateFollow = () => {
    if (!follow || !fol.started) return;
    const dx = fol.tx - fol.x;
    const dy = fol.ty - fol.y;
    const ts = fol.on ? 1 : 0.85;
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1 && Math.abs(ts - fol.s) < 0.001) return;
    fol.x = lerp(fol.x, fol.tx, 0.14);
    fol.y = lerp(fol.y, fol.ty, 0.14);
    fol.s = lerp(fol.s, ts, 0.12);
    const w = fol.w;
    const h = fol.h;
    const rot = clamp((fol.tx - fol.x) * 0.05, -9, 9);
    const x = clamp(fol.x + 36, 12, vw - w - 12);
    const y = clamp(fol.y - h / 2, 12, vh - h - 12);
    follow.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${fol.s.toFixed(3)})`;
  };

  /* ---------- Trabalhos: cartões andando de lado ---------- */

  const workSec = $('#work');
  const pin = $('[data-work-pin]');
  const track = $('[data-work-track]');
  const cards = $$('.card:not(.card-cta)', track);
  const workBar = $('[data-work-bar]');
  const workCount = $('[data-work-count]');
  const pinMQ = matchMedia('(min-width: 1024px)');
  let pinOn = false;
  let workIdx = -1;

  cards.forEach((card) => {
    card.style.setProperty('--c', card.dataset.color);
    if (fine) {
      card.addEventListener('mouseenter', () => setHoverGlow(card.dataset.color));
      card.addEventListener('mouseleave', () => setHoverGlow(null));
    }
  });

  const setWorkIdx = (i) => {
    if (i === workIdx) return;
    workIdx = i;
    workCount.textContent = String(i + 1).padStart(2, '0');
    if (activeSection === workSec) setSectionGlow(cards[i].dataset.color);
  };

  const updatePin = (y) => {
    if (!pinOn) return;
    const dist = L.pin.dist;
    const p = clamp((y - L.pin.top) / dist, 0, 1);
    const x = -p * dist;
    track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    workBar.style.setProperty('--p', (0.06 + p * 0.94).toFixed(4));
    let best = 0;
    let bestD = Infinity;
    L.cards.forEach((c, i) => {
      const center = c.left + c.w / 2 + x;
      const d = center - vw / 2;
      c.el.style.setProperty('--px', `${(-d / vw * 60).toFixed(1)}px`);
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
    });
    setWorkIdx(best);
  };

  track.addEventListener('scroll', () => {
    if (pinOn) return;
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 0;
    workBar.style.setProperty('--p', (0.06 + p * 0.94).toFixed(4));
    setWorkIdx(clamp(Math.round(p * (cards.length - 1)), 0, cards.length - 1));
  }, { passive: true });

  /* ---------- Interruptor ---------- */

  const switchSec = $('[data-switch-sec]');
  const toggle = $('[data-toggle]');
  let switchTouched = false;
  const setSwitch = (on) => {
    switchSec.classList.toggle('is-on', on);
    toggle.setAttribute('aria-checked', String(on));
  };
  toggle.addEventListener('click', () => {
    switchTouched = true;
    setSwitch(toggle.getAttribute('aria-checked') !== 'true');
  });
  new IntersectionObserver(([entry], io) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    setTimeout(() => { if (!switchTouched) setSwitch(true); }, reduce ? 0 : 700);
  }, { threshold: 0.55 }).observe($('[data-stage]'));

  /* ---------- Folha clara, faixas de veículos e processo ---------- */

  const sheet = $('[data-sheet]');
  const roadRows = $$('[data-road]');
  const processBar = $('[data-process-bar]');
  const steps = $('[data-steps]');

  const updateSheet = (y) => {
    if (reduce) return;
    const top = L.sheet.top - y;
    const p = clamp((vh - top) / (vh * 0.85), 0, 1);
    if (p <= 0 || p >= 1) {
      if (sheet.style.transform) sheet.style.transform = '';
      return;
    }
    const e = 1 - Math.pow(1 - p, 3);
    sheet.style.transform = `scale(${(0.93 + 0.07 * e).toFixed(4)})`;
  };

  const updateRoad = (y) => {
    if (reduce) return;
    const top = L.road.top - y;
    if (top > vh || top + L.road.h < 0) return;
    const p = clamp((vh - top) / (vh + L.road.h), 0, 1);
    const shift = Math.min(vw * 0.45, 700);
    roadRows.forEach((row) => {
      const dir = Number(row.dataset.road);
      const x = dir < 0 ? -p * shift : -shift + p * shift;
      row.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    });
  };

  const updateProcess = (y) => {
    if (!processBar) return;
    const top = L.steps.top - y;
    const p = clamp((vh * 0.6 - top) / L.steps.h, 0, 1);
    processBar.style.setProperty('--p', p.toFixed(4));
  };

  /* ---------- Topo ao rolar ---------- */

  const updateHero = (y) => {
    if (reduce) return;
    const h = L.hero.h;
    if (y > h) return;
    const p = clamp(y / h, 0, 1);
    heroInner.style.transform = `translate3d(0,${(-p * h * 0.22).toFixed(1)}px,0)`;
    heroInner.style.opacity = (1 - p * 1.5).toFixed(3);
    heroMedia.style.transform = `translate3d(0,${(p * h * 0.32).toFixed(1)}px,0) scale(${(1 + p * 0.06).toFixed(4)})`;
  };

  /* ---------- Seção ativa (define a cor do neon) ---------- */

  const sections = [hero, $('.manifesto'), $('#services'), workSec, switchSec, sheet, $('#gallery'), $('#quote')].filter(Boolean);
  let activeSection = hero;
  let cycleTimer = 0;
  let cycleI = 0;
  const setActiveSection = (sec) => {
    if (sec === activeSection) return;
    activeSection = sec;
    clearInterval(cycleTimer);
    if (sec === hero) setSectionGlow(hero.dataset.color || glow.section);
    else if (sec === workSec) setSectionGlow(cards[Math.max(0, workIdx)].dataset.color);
    else if (sec === $('#gallery')) setSectionGlow(($('.chip.is-active') || {}).dataset?.color || '#ffc23a');
    else if (sec.dataset.glow === 'cycle') {
      const next = () => { setSectionGlow(CYCLE[cycleI++ % CYCLE.length]); };
      next();
      if (!reduce) cycleTimer = setInterval(next, 2600);
    } else if (sec.dataset.glow) setSectionGlow(sec.dataset.glow);
  };
  const updateActive = (y) => {
    const mid = y + vh * 0.5;
    let found = sections[0];
    L.sections.forEach((s) => { if (mid >= s.top) found = s.el; });
    setActiveSection(found);
  };

  /* ---------- Olhos do logo seguem o mouse ---------- */

  const eyes = $$('.eye').map((el) => ({ el, look: $('.eye-look', el), x: 0, y: 0, tx: 0, ty: 0 }));
  let pointer = null;
  let eyesDirty = false;
  if (fine) {
    window.addEventListener('pointermove', (e) => { pointer = { x: e.clientX, y: e.clientY }; eyesDirty = true; }, { passive: true });
  } else if (!reduce) {
    // No celular, cada olho olha para um lado de vez em quando, como um camaleão de verdade
    eyes.forEach((eye) => {
      const glance = () => {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() < 0.3 ? 0 : 3.5 + Math.random() * 1.5;
        eye.tx = Math.cos(a) * r;
        eye.ty = Math.sin(a) * r;
        setTimeout(glance, 1400 + Math.random() * 2600);
      };
      setTimeout(glance, 800 + Math.random() * 1500);
    });
  }
  const updateEyes = (scrolled) => {
    const measureNow = pointer && (eyesDirty || scrolled);
    eyesDirty = false;
    eyes.forEach((eye) => {
      if (measureNow) {
        const r = eye.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const dx = pointer.x - (r.left + r.width / 2);
        const dy = pointer.y - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 160) * 5;
        eye.tx = (dx / d) * k;
        eye.ty = (dy / d) * k;
      }
      if (Math.abs(eye.tx - eye.x) < 0.01 && Math.abs(eye.ty - eye.y) < 0.01) return;
      eye.x = lerp(eye.x, eye.tx, 0.2);
      eye.y = lerp(eye.y, eye.ty, 0.2);
      eye.look.style.transform = `translate(${eye.x.toFixed(2)}px,${eye.y.toFixed(2)}px)`;
    });
  };

  /* ---------- Logo grande do rodapé: luz que segue o mouse ---------- */

  const mark = $('[data-footer-mark]');
  if (mark && !reduce) {
    new IntersectionObserver(([entry]) => mark.classList.toggle('is-sweeping', entry.isIntersecting)).observe(mark);
  }
  if (mark && fine) {
    mark.addEventListener('pointermove', (e) => {
      const r = mark.getBoundingClientRect();
      mark.classList.add('is-tracking');
      mark.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      mark.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    });
    mark.addEventListener('pointerleave', () => {
      mark.classList.remove('is-tracking');
      mark.style.removeProperty('--mx');
      mark.style.removeProperty('--my');
    });
  }

  /* ---------- Botões "magnéticos" ---------- */

  if (fine && !reduce) {
    $$('[data-magnetic]').forEach((btn) => {
      const label = btn.firstElementChild;
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        btn.style.transform = `translate(${(dx * 12).toFixed(1)}px,${(dy * 10).toFixed(1)}px)`;
        if (label) label.style.transform = `translate(${(dx * 7).toFixed(1)}px,${(dy * 5).toFixed(1)}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
        if (label) label.style.transform = '';
      });
      btn.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1), color .35s, box-shadow .45s, background-color .35s';
    });
  }

  /* ---------- Galeria: filtros e foto grande ---------- */

  const grid = $('[data-grid]');
  const gItems = $$('.g-item', grid);
  const chips = $$('[data-filter]');
  chips.forEach((chip) => chip.style.setProperty('--c', chip.dataset.color));
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      setSectionGlow(chip.dataset.color);
      const first = new Map(gItems.map((it) => [it, it.getBoundingClientRect()]));
      gItems.forEach((it) => it.classList.toggle('is-hidden', f !== 'all' && it.dataset.cat !== f));
      gItems.forEach((it) => {
        if (it.classList.contains('is-hidden')) return;
        it.classList.add('is-in');
        if (reduce || !it.animate) return;
        const a = first.get(it);
        const b = it.getBoundingClientRect();
        if (!a.width) {
          it.animate([{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 550, easing: 'cubic-bezier(.16,1,.3,1)' });
        } else if (a.left !== b.left || a.top !== b.top) {
          it.animate([{ transform: `translate(${a.left - b.left}px,${a.top - b.top}px)` }, { transform: 'none' }], { duration: 750, easing: 'cubic-bezier(.16,1,.3,1)' });
        }
      });
      measureSoon();
    });
  });

  const lb = $('[data-lightbox]');
  const lbImg = $('[data-lb-img]', lb);
  const lbCap = $('[data-lb-cap]', lb);
  const lbCount = $('[data-lb-count]', lb);
  let lbList = [];
  let lbI = 0;
  const lbShow = (i) => {
    lbI = (i + lbList.length) % lbList.length;
    const btn = $('.g-btn', lbList[lbI]);
    const thumb = $('img', btn);
    lbImg.classList.add('is-loading');
    const full = new Image();
    full.onload = () => {
      lbImg.src = full.src;
      lbImg.alt = thumb.alt;
      lbImg.classList.remove('is-loading');
    };
    full.src = btn.dataset.full;
    lbCap.textContent = thumb.alt;
    lbCount.textContent = `${String(lbI + 1).padStart(2, '0')} / ${String(lbList.length).padStart(2, '0')}`;
  };
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.g-btn');
    if (!btn) return;
    lbList = gItems.filter((it) => !it.classList.contains('is-hidden'));
    lb.showModal();
    if (lenis) lenis.stop();
    lbShow(lbList.indexOf(btn.parentElement));
  });
  $('[data-lb-prev]', lb).addEventListener('click', () => lbShow(lbI - 1));
  $('[data-lb-next]', lb).addEventListener('click', () => lbShow(lbI + 1));
  $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
  lb.addEventListener('close', () => { if (lenis) lenis.start(); });
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb-inner')) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') lbShow(lbI - 1);
    if (e.key === 'ArrowRight') lbShow(lbI + 1);
  });
  let swipeX = null;
  lb.addEventListener('pointerdown', (e) => { swipeX = e.clientX; });
  lb.addEventListener('pointerup', (e) => {
    if (swipeX === null) return;
    const dx = e.clientX - swipeX;
    swipeX = null;
    if (Math.abs(dx) > 50) lbShow(lbI + (dx < 0 ? 1 : -1));
  });

  /* ---------- Orçamento pelo WhatsApp ---------- */

  const form = $('[data-quote]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = (id) => $(id, form).value.trim();
    const name = val('#q-name');
    const nameField = $('#q-name', form).closest('.field');
    nameField.classList.toggle('has-error', !name);
    if (!name) { $('#q-name', form).focus(); return; }
    const business = val('#q-business');
    const where = val('#q-where');
    const msg = val('#q-msg');
    const needs = $$('input[name="need"]:checked', form).map((i) => i.value);
    const lines = [
      `Hi Chameleon! My name is ${name}${business ? ` (${business})` : ''}.`,
      needs.length ? `I'm looking for: ${needs.join(', ')}.` : '',
      where ? `Location: ${where}.` : '',
      msg ? `\n${msg}` : '',
    ].filter(Boolean);
    const a = document.createElement('a');
    a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
  $('#q-name', form).addEventListener('input', (e) => {
    if (e.target.value.trim()) e.target.closest('.field').classList.remove('has-error');
  });

  /* ---------- Botão flutuante do WhatsApp ---------- */

  const waFloat = $('[data-wa-float]');
  const updateWa = (y) => {
    const show = y > vh * 0.8 && !menuOpen && y + vh < L.quote.top + vh * 0.4;
    waFloat.classList.toggle('is-visible', show);
  };

  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Medidas (refeitas ao redimensionar) ---------- */

  const L = { hero: {}, brands: {}, words: {}, pin: {}, cards: [], sheet: {}, road: {}, steps: {}, quote: {}, sections: [] };
  const absTop = (el) => el.getBoundingClientRect().top + window.scrollY;

  function measure() {
    vw = innerWidth;
    vh = innerHeight;
    const wantPin = pinMQ.matches && !reduce;
    if (wantPin !== pinOn) {
      pinOn = wantPin;
      root.classList.toggle('has-pin', pinOn);
      track.style.transform = '';
      track.scrollLeft = 0;
    }
    if (pinOn) {
      const dist = Math.max(0, track.scrollWidth - vw);
      pin.style.height = `${dist + vh}px`;
      L.pin = { top: absTop(pin), dist: dist || 1 };
      L.cards = cards.map((el) => ({ el, left: el.offsetLeft, w: el.offsetWidth }));
    } else {
      pin.style.height = '';
      cards.forEach((c) => c.style.removeProperty('--px'));
    }
    L.hero = { h: hero.offsetHeight };
    if (words) L.words = { top: absTop(words), h: words.offsetHeight };
    const prevT = sheet.style.transform;
    sheet.style.transform = '';
    L.sheet = { top: absTop(sheet) };
    sheet.style.transform = prevT;
    const road = $('#vehicles');
    L.road = { top: absTop(road), h: road.offsetHeight };
    L.steps = { top: absTop(steps), h: steps.offsetHeight };
    const brands = $('.brands');
    L.brands = { top: absTop(brands), h: brands.offsetHeight };
    if (fol.w) { fol.w = follow.offsetWidth; fol.h = follow.offsetHeight; }
    const quote = $('#quote');
    L.quote = { top: absTop(quote), h: quote.offsetHeight };
    L.sections = sections.map((el) => ({ el, top: absTop(el) }));
    if (mq.row) mq.w = mq.row.offsetWidth;
    if (lenis) lenis.resize();
    tick(true);
  }
  let measureT = 0;
  function measureSoon() {
    clearTimeout(measureT);
    measureT = setTimeout(measure, 120);
  }
  window.addEventListener('resize', measureSoon);
  if ('ResizeObserver' in window) new ResizeObserver(measureSoon).observe(document.body);
  window.addEventListener('load', measure);

  /* ---------- Laço de animação ---------- */

  let lastY = window.scrollY;
  let lastT = performance.now();
  let vel = 0;

  function tick(force) {
    scrollY = window.scrollY;
    const dy = scrollY - lastY;
    if (force === true || dy !== 0) {
      updateHeader(scrollY, dy);
      updateHero(scrollY);
      updateWords(scrollY);
      updatePin(scrollY);
      updateSheet(scrollY);
      updateRoad(scrollY);
      updateProcess(scrollY);
      updateActive(scrollY);
      updateWa(scrollY);
    }
    return dy;
  }

  function frame(t) {
    if (lenis) lenis.raf(t);
    const dt = Math.min(0.064, (t - lastT) / 1000) || 0.016;
    lastT = t;
    const dy = tick(false);
    lastY = scrollY;
    vel = lerp(vel, dy / dt, 0.18);
    updateMarquee(dt, vel);
    updateFollow();
    updateEyes(dy !== 0);
    requestAnimationFrame(frame);
  }

  measure();
  requestAnimationFrame(frame);
})();
