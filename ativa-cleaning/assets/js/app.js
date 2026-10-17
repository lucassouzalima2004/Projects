/* Comportamento do site da Ativa: cabeçalho e menu, a janela empoeirada do topo que o rodo limpa,
   a janela interativa ("o que limpamos"), antes/depois de arrastar, carrosséis, pedido de orçamento
   (e-mail ou WhatsApp) e Meta Pixel. Contatos e números vêm de config.js. */
(function () {
  'use strict';

  const cfg = window.ATIVA || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const WA = cfg.whatsapp || '61438357508';
  const EMAIL = cfg.email || 'office@ativaservices.com';
  const waLink = text => `https://wa.me/${WA}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

  // ---------- Contatos vindos do config.js ----------
  $$('[data-tel]').forEach(a => { if (cfg.phoneIntl) a.href = `tel:${cfg.phoneIntl}`; });
  $$('[data-wa]').forEach(a => { a.href = waLink("Hi Ativa! I'd like a quote."); a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-mail]').forEach(a => { a.href = `mailto:${EMAIL}`; });
  $$('[data-year]').forEach(n => { n.textContent = new Date().getFullYear(); });
  $$('[data-rating]').forEach(n => { if (cfg.googleRating) n.textContent = cfg.googleRating; });
  $$('[data-review-count]').forEach(n => { if (cfg.googleReviews) n.textContent = cfg.googleReviews; });
  $$('[data-google-reviews]').forEach(a => { if (cfg.googleReviewsUrl) a.href = cfg.googleReviewsUrl; });
  $$('[data-google-write]').forEach(a => { if (cfg.googleWriteUrl) a.href = cfg.googleWriteUrl; });
  // Redes: vazio no config.js esconde o ícone
  [['ig', 'instagram'], ['fb', 'facebook']].forEach(([attr, key]) => {
    $$(`[data-${attr}]`).forEach(a => { if (cfg[key] === '') a.remove(); else if (cfg[key]) a.href = cfg[key]; });
  });

  // ---------- Meta Pixel (só se o ID estiver no config.js) ----------
  const track = (ev, data) => { if (window.fbq) window.fbq('track', ev, data || {}); };
  if (cfg.metaPixelId) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', cfg.metaPixelId);
    window.fbq('track', 'PageView');
  }
  document.addEventListener('click', e => {
    if (e.target.closest('a[href^="tel:"]')) track('Contact', { content_name: 'Phone' });
    if (e.target.closest('a[href*="wa.me"]')) track('Contact', { content_name: 'WhatsApp' });
  });

  // ---------- Cabeçalho e menu ----------
  const header = $('[data-header]');
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const menuBtn = $('[data-menu-btn]');
  const menu = $('[data-menu]');
  const setMenu = open => {
    menu.hidden = !open;
    header.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  window.matchMedia('(min-width: 1081px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  // ---------- Entrada das seções ----------
  const seen = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); seen.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .12 })
    : null;
  $$('[data-reveal]').forEach(el => (seen ? seen.observe(el) : el.classList.add('is-in')));

  // ---------- Faixa que corre (duplica o conteúdo para o loop não ter emenda) ----------
  $$('[data-ticker] .ticker__track').forEach(t => { if (t.firstElementChild) t.appendChild(t.firstElementChild.cloneNode(true)); });

  /* =========================================================================
     Janela do topo: o vidro começa empoeirado, o rodo limpa em "S" (como um
     limpador de janelas de verdade) e a pessoa termina arrastando o dedo/mouse.
     ====================================================================== */
  (function pane() {
    const root = $('[data-pane]');
    if (!root) return;
    const glass = $('[data-glass]', root);
    const canvas = $('[data-grime]', root);
    const sq = $('[data-squeegee]', root);
    const hint = $('[data-pane-hint]', root);
    const badge = $('[data-pane-badge]', root);
    const resetBtn = $('[data-pane-reset]', root);
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;

    // Quem pediu menos movimento já vê o vidro limpo
    if (reduce) { root.classList.add('is-done'); badge.hidden = false; resetBtn.hidden = true; return; }

    const COLS = 16, ROWS = 20, TOTAL = COLS * ROWS;
    const HALF = Math.PI / 2;
    let W = 0, H = 0, blade = 120, cell = 20;
    let grid = new Uint8Array(TOTAL), left = TOTAL;
    let state = 'idle';            // idle → auto → ready/play → done
    let autoDone = false, autoEndY = 0, seed = 11, raf = 0;
    let down = false, last = null, lastA = HALF;

    // Números aleatórios sempre iguais para a mesma "sujeira"
    const rng = a => () => {
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };

    function size() {
      const r = glass.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      blade = Math.max(80, Math.min(140, W * .27));
      cell = Math.min(W / COLS, H / ROWS);
      sq.style.width = `${blade}px`;
    }

    function paint() {
      const r = rng(seed);
      grid = new Uint8Array(TOTAL); left = TOTAL;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      // película de poeira, mais grossa embaixo
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgba(226, 220, 207, .80)');
      g.addColorStop(.55, 'rgba(210, 200, 182, .87)');
      g.addColorStop(1, 'rgba(170, 154, 128, .94)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // manchas
      for (let i = 0; i < 34; i++) {
        const x = r() * W, y = r() * H, rad = 20 + r() * 110, dark = r() > .4;
        const c = ctx.createRadialGradient(x, y, 0, x, y, rad);
        c.addColorStop(0, dark ? `rgba(118, 98, 70, ${.06 + r() * .12})` : `rgba(255, 255, 255, ${.06 + r() * .1})`);
        c.addColorStop(1, 'rgba(118, 98, 70, 0)');
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      }
      // poeira fina
      const n = Math.round(W * H / 55);
      for (let i = 0; i < n; i++) {
        const s = .3 + r() * 1.3;
        ctx.fillStyle = r() > .25 ? `rgba(92, 76, 54, ${.08 + r() * .35})` : `rgba(255, 255, 255, ${.15 + r() * .3})`;
        ctx.fillRect(r() * W, r() * H, s, s);
      }
      // marcas de gotas de chuva secas
      for (let i = 0; i < 46; i++) {
        const x = r() * W, y = r() * H * .92, rad = 2 + r() * 9;
        const c = ctx.createRadialGradient(x, y, rad * .45, x, y, rad);
        c.addColorStop(0, 'rgba(255, 255, 255, .05)');
        c.addColorStop(.75, `rgba(108, 90, 64, ${.18 + r() * .25})`);
        c.addColorStop(1, 'rgba(108, 90, 64, 0)');
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      }
      // escorridos
      ctx.lineCap = 'round';
      for (let i = 0; i < 16; i++) {
        let x = r() * W;
        const y = r() * H * .5, len = H * (.15 + r() * .45);
        ctx.strokeStyle = `rgba(118, 100, 74, ${.08 + r() * .14})`;
        ctx.lineWidth = 1 + r() * 2.5;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let k = 0; k < len; k += 8) { x += (r() - .5) * 2.2; ctx.lineTo(x, y + k); }
        ctx.stroke();
      }
      // "clean me" escrito com o dedo na poeira
      ctx.globalCompositeOperation = 'destination-out';
      const fs = Math.round(Math.min(W * .15, 76));
      ctx.save();
      ctx.translate(W * .5, H * .8);
      ctx.rotate(-.07);
      ctx.font = `800 ${fs}px "Bricolage Grotesque", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(3, fs * .07);
      ctx.fillStyle = 'rgba(0, 0, 0, .7)';
      ctx.strokeStyle = 'rgba(0, 0, 0, .9)';
      ctx.fillText('clean me', 0, 0);
      ctx.strokeText('clean me', 0, 0);
      ctx.restore();
    }

    // Marca as células da grade por onde a lâmina passou (para saber quanto já está limpo)
    function mark(x, y, a) {
      const h = blade / 2, n = Math.ceil(blade / (cell * .5));
      const c = Math.cos(a), s = Math.sin(a);
      for (let k = 0; k <= n; k++) {
        const t = -h + blade * k / n, px = x + c * t, py = y + s * t;
        if (px < 0 || py < 0 || px >= W || py >= H) continue;
        const i = Math.floor(py / H * ROWS) * COLS + Math.floor(px / W * COLS);
        if (!grid[i]) { grid[i] = 1; left--; }
      }
    }

    // A lâmina (perpendicular ao movimento) apaga a poeira entre dois pontos
    function wipe(x0, y0, a0, x1, y1, a1) {
      const h = blade / 2;
      const c0 = Math.cos(a0) * h, s0 = Math.sin(a0) * h, c1 = Math.cos(a1) * h, s1 = Math.sin(a1) * h;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(x0 - c0, y0 - s0); ctx.lineTo(x0 + c0, y0 + s0);
      ctx.lineTo(x1 + c1, y1 + s1); ctx.lineTo(x1 - c1, y1 - s1);
      ctx.closePath(); ctx.fill();
      // contorno fino para não sobrar risco entre um trecho e outro
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000';
      ctx.stroke();
      const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (cell * .5)));
      for (let j = 1; j <= steps; j++) {
        const k = j / steps;
        mark(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, a0 + angleDiff(a0, a1) * k);
      }
    }

    function angleDiff(a, b) { return Math.atan2(Math.sin(b - a), Math.cos(b - a)); }
    function turn(a, b, k) { return a + angleDiff(a, b) * k; }

    // Posiciona o rodo: centro da lâmina em (x, y), lâmina na direção a
    function place(x, y, a) {
      const s = blade / 200;
      sq.style.transform = `translate(${x}px, ${y}px) rotate(${a}rad) translate(${-100 * s}px, ${-8 * s}px)`;
    }

    // Caminho em "S": passa da esquerda para a direita, faz a curva em U e volta
    function rowsPath(fromY, toY) {
      const sp = blade * .8, m = blade * .42, r = sp / 2, pts = [];
      const line = (x0, y0, x1, y1) => {
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6));
        for (let i = 1; i <= n; i++) pts.push([x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n]);
      };
      const arc = (cx, cy, a0, a1) => {
        const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) * r / 6));
        for (let i = 1; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      };
      let y = fromY, right = true;
      pts.push([-blade * .8, y]);
      for (;;) {
        const xEnd = right ? W - m : m;
        line(pts[pts.length - 1][0], y, xEnd, y);
        if (y + sp > toY) { line(xEnd, y, right ? W + blade : -blade, y); break; }
        if (right) arc(xEnd, y + r, -HALF, HALF);
        else arc(xEnd, y + r, -HALF, -3 * HALF);
        y += sp;
        right = !right;
      }
      return { pts, lastY: y };
    }

    // Anima o rodo por um caminho; ao terminar chama done()
    function run(path, done) {
      const pts = path.pts, L = [0];
      for (let i = 1; i < pts.length; i++) L[i] = L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const total = L[L.length - 1];
      const dur = Math.max(900, total / Math.max(.9, W / 480));
      let i = 0, prev = pts[0], prevA = HALF, t0 = 0;
      root.classList.add('is-wiping');
      place(prev[0], prev[1], prevA);
      const step = now => {
        if (!t0) t0 = now;
        const k = Math.min(1, (now - t0) / dur);
        const d = (1 - Math.cos(Math.PI * k)) / 2 * total;
        while (i < pts.length - 1 && L[i + 1] <= d) {
          i++;
          const p = pts[i];
          const a = turn(prevA, Math.atan2(p[1] - prev[1], p[0] - prev[0]) + HALF, .5);
          wipe(prev[0], prev[1], prevA, p[0], p[1], a);
          prev = p; prevA = a;
        }
        place(prev[0], prev[1], prevA);
        if (k < 1) raf = requestAnimationFrame(step);
        else { root.classList.remove('is-wiping'); done(); }
      };
      raf = requestAnimationFrame(step);
    }

    // Aplica um caminho sem animação (ao redimensionar a tela)
    function applyInstant(path) {
      const pts = path.pts;
      let prevA = HALF;
      for (let i = 1; i < pts.length; i++) {
        const a = turn(prevA, Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) + HALF, .5);
        wipe(pts[i - 1][0], pts[i - 1][1], prevA, pts[i][0], pts[i][1], a);
        prevA = a;
      }
    }

    const autoPath = () => rowsPath(blade * .42, H * .58);

    function startAuto() {
      if (state !== 'idle') return;
      state = 'auto';
      const path = autoPath();
      autoEndY = path.lastY;
      run(path, () => {
        autoDone = true;
        if (state === 'auto') { state = 'ready'; hint.hidden = false; }
      });
    }

    // "Tap here": o rodo termina o vidro sozinho
    function autoFinish() {
      if (state === 'done' || state === 'auto') return;
      cancelAnimationFrame(raf);
      state = 'auto';
      hint.hidden = true;
      const from = autoDone ? autoEndY + blade * .8 : blade * .42;
      run(rowsPath(from, H + blade * .3), finish);
    }

    function finish() {
      if (state === 'done') return;
      state = 'done';
      cancelAnimationFrame(raf);
      down = false; last = null;
      root.classList.remove('is-wiping', 'is-hover');
      root.classList.add('is-done');
      hint.hidden = true;
      badge.hidden = false;
    }

    function check() { if (left <= TOTAL * .1) finish(); }

    // ---- a pessoa limpando
    const pos = e => { const r = glass.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const canPlay = () => state === 'idle' || state === 'ready' || state === 'play';

    glass.addEventListener('pointerdown', e => {
      if (state === 'done') return;
      if (state === 'auto') { cancelAnimationFrame(raf); }
      state = 'play';
      down = true;
      last = pos(e);
      try { glass.setPointerCapture(e.pointerId); } catch (_) { /* sem captura */ }
      root.classList.add('is-wiping');
      place(last[0], last[1], lastA);
      hint.hidden = true;
    });

    glass.addEventListener('pointermove', e => {
      const mouse = e.pointerType === 'mouse';
      if (!canPlay() || (!down && !mouse)) return;
      const p = pos(e);
      if (!last) { last = p; root.classList.add('is-wiping'); place(p[0], p[1], lastA); return; }
      const dx = p[0] - last[0], dy = p[1] - last[1];
      if (dx * dx + dy * dy < 9) return;
      // com o mouse, só passar por cima já limpa (depois que o rodo terminou a demonstração)
      if (state === 'idle') state = 'play';
      const a = turn(lastA, Math.atan2(dy, dx) + HALF, .35);
      wipe(last[0], last[1], lastA, p[0], p[1], a);
      last = p; lastA = a;
      place(p[0], p[1], a);
      if (state === 'ready') state = 'play';
      if (left < TOTAL * .7) hint.hidden = true;
      check();
    });

    const release = () => {
      down = false;
      if (state !== 'done' && !root.classList.contains('is-hover')) { last = null; root.classList.remove('is-wiping'); }
    };
    glass.addEventListener('pointerup', release);
    glass.addEventListener('pointercancel', () => { root.classList.remove('is-hover'); release(); });
    glass.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && state !== 'done' && state !== 'auto') root.classList.add('is-hover'); });
    glass.addEventListener('pointerleave', e => {
      if (e.pointerType !== 'mouse') return;
      root.classList.remove('is-hover');
      if (!down) { last = null; if (state !== 'auto') root.classList.remove('is-wiping'); }
    });

    hint.addEventListener('click', autoFinish);
    resetBtn.addEventListener('click', () => {
      seed++;
      root.classList.remove('is-done');
      badge.hidden = true;
      state = 'ready';
      paint();
      hint.hidden = false;
    });

    // Redimensionou: refaz a sujeira no novo tamanho (e o que o rodo já tinha limpado)
    let lastW = 0;
    const onResize = () => {
      const w = glass.getBoundingClientRect().width;
      if (!w || Math.abs(w - lastW) < 2) return;
      lastW = w;
      size();
      if (state === 'done') return;
      if (state === 'auto') { cancelAnimationFrame(raf); root.classList.remove('is-wiping'); state = autoDone ? 'ready' : 'idle'; }
      paint();
      if (autoDone) { const p = autoPath(); autoEndY = p.lastY; applyInstant(p); if (state !== 'play') hint.hidden = false; }
      if (state === 'idle') armAuto();
    };

    // Começa quando a janela aparece na tela
    let armed = false;
    function armAuto() {
      if (armed) return;
      armed = true;
      const go = () => setTimeout(startAuto, 650);
      if (!('IntersectionObserver' in window)) { go(); return; }
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); go(); } }, { threshold: .45 });
      io.observe(glass);
    }

    const fontReady = document.fonts && document.fonts.load
      ? Promise.race([document.fonts.load('800 60px "Bricolage Grotesque"'), new Promise(r => setTimeout(r, 1500))])
      : Promise.resolve();
    fontReady.catch(() => {}).then(() => {
      lastW = glass.getBoundingClientRect().width;
      size();
      paint();
      armAuto();
      if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(glass);
      else window.addEventListener('resize', onResize);
    });
  })();

  // ---------- Janela interativa: o que limpamos ----------
  (function anatomy() {
    const root = $('[data-anatomy]');
    if (!root) return;
    const btns = $$('button[data-part]', root);
    const parts = $$('.an-part', root);
    const dots = $$('[data-dot]', root);
    let auto = true, idx = 0, timer = 0;
    const set = key => {
      root.dataset.active = key;
      parts.forEach(p => p.classList.toggle('is-on', p.dataset.part === key));
      dots.forEach(d => d.classList.toggle('is-on', d.dataset.dot === key));
      btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.part === key)));
    };
    const pick = key => { auto = false; clearInterval(timer); set(key); };
    btns.forEach(b => {
      b.addEventListener('click', () => pick(b.dataset.part));
      b.addEventListener('mouseenter', () => pick(b.dataset.part));
      b.addEventListener('focus', () => pick(b.dataset.part));
    });
    dots.forEach(d => { d.style.cursor = 'pointer'; d.addEventListener('click', () => pick(d.dataset.dot)); });
    if (reduce || !('IntersectionObserver' in window)) { set('glass'); return; }
    new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (!e.isIntersecting || !auto) return;
      set(btns[idx].dataset.part);
      timer = setInterval(() => { idx = (idx + 1) % btns.length; set(btns[idx].dataset.part); }, 2600);
    }, { threshold: .35 }).observe(root);
  })();

  // ---------- Antes e depois ----------
  $$('[data-compare]').forEach(fig => {
    const stage = $('[data-compare-stage]', fig);
    const range = $('[data-compare-range]', fig);
    let drag = false, touched = false, anim = 0;
    const set = v => {
      v = Math.max(0, Math.min(100, v));
      stage.style.setProperty('--pos', `${v}%`);
      range.value = Math.round(v);
    };
    const at = e => { const r = stage.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
    const grab = () => { touched = true; cancelAnimationFrame(anim); };
    stage.addEventListener('pointerdown', e => {
      grab(); drag = true;
      try { stage.setPointerCapture(e.pointerId); } catch (_) { /* sem captura */ }
      set(at(e));
    });
    stage.addEventListener('pointermove', e => { if (drag) set(at(e)); });
    ['pointerup', 'pointercancel'].forEach(t => stage.addEventListener(t, () => { drag = false; }));
    range.addEventListener('input', () => { grab(); set(+range.value); });
    // pequena demonstração quando aparece na tela
    if (reduce || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const keys = [[0, 50], [700, 18], [1500, 82], [2200, 50]];
      let t0 = 0;
      const step = now => {
        if (touched) return;
        if (!t0) t0 = now;
        const t = now - t0;
        let j = 0;
        while (j < keys.length - 2 && t > keys[j + 1][0]) j++;
        const [ta, va] = keys[j], [tb, vb] = keys[j + 1];
        const k = Math.min(1, (t - ta) / (tb - ta));
        set(va + (vb - va) * (1 - Math.cos(Math.PI * k)) / 2);
        if (t < keys[keys.length - 1][0]) anim = requestAnimationFrame(step);
      };
      setTimeout(() => { anim = requestAnimationFrame(step); }, 500);
    }, { threshold: .55 });
    io.observe(stage);
  });

  // ---------- Carrosséis (fotos e avaliações) ----------
  function scroller(track, prev, next) {
    if (!track) return;
    const gap = () => parseFloat(getComputedStyle(track).columnGap) || 16;
    const step = () => {
      const item = track.firstElementChild;
      const w = item ? item.getBoundingClientRect().width + gap() : 300;
      return w * Math.max(1, Math.floor(track.clientWidth / w) - 1);
    };
    const go = dir => track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' });
    if (prev) prev.addEventListener('click', () => go(-1));
    if (next) next.addEventListener('click', () => go(1));
    const update = () => {
      if (prev) prev.disabled = track.scrollLeft < 8;
      if (next) next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
    };
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
  scroller($('[data-reel-track]'), $('[data-reel-prev]'), $('[data-reel-next]'));
  scroller($('[data-rev-track]'), $('[data-rev-prev]'), $('[data-rev-next]'));

  // ---------- Pedido de orçamento ----------
  const form = $('[data-quote]');
  if (!form) return;
  const err = $('[data-error]', form);
  const note = $('[data-note]', form);
  const done = $('[data-done]', form);
  const submitBtn = $('button[type="submit"]', form);
  const F = form.elements;
  const serviceInput = () => $('input[name="service"]:checked', form);

  // Botões "Quote a ..." dos serviços já escolhem o serviço no formulário
  $$('[data-service]').forEach(a => a.addEventListener('click', () => {
    const r = $(`input[name="service"][data-key="${a.dataset.service}"]`, form);
    if (r && !r.checked) { r.checked = true; sync(); }
  }));

  // Mostra só as perguntas do serviço escolhido
  function sync() {
    const key = (serviceInput() || {}).dataset.key || 'windows';
    $$('[data-when]', form).forEach(el => { el.hidden = !el.dataset.when.split(' ').includes(key); });
  }
  form.addEventListener('change', e => { if (e.target.name === 'service') sync(); });
  sync();

  $$('[data-step]', form).forEach(b => b.addEventListener('click', () => {
    const v = (parseInt(F.windows.value, 10) || 0) + Number(b.dataset.step);
    F.windows.value = Math.max(1, Math.min(200, v));
  }));

  if (F.date) {
    const t = new Date();
    t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
    F.date.min = t.toISOString().slice(0, 10);
  }

  if (cfg.formEndpoint) note.textContent = 'Your request comes straight to our team. Photos help: you can also send them on WhatsApp.';

  const pretty = (name, v) => {
    if (name !== 'date' || !v) return v;
    const d = new Date(`${v}T12:00:00`);
    return isNaN(d) ? v : d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Monta a mensagem: cada bloco com data-label vira uma linha, na ordem da página
  function compose() {
    const fd = new FormData(form);
    const lines = [form.dataset.intro || '', ''];
    $$('[data-label]', form).forEach(holder => {
      if (holder.closest('[hidden]')) return;
      const names = new Set($$('input, select, textarea', holder)
        .filter(el => el.closest('[data-label]') === holder && el.name)
        .map(el => el.name));
      const val = [...names]
        .flatMap(n => fd.getAll(n).map(v => pretty(n, String(v).trim())))
        .filter(Boolean)
        .join(', ');
      if (val) lines.push(`${holder.dataset.label}: ${val}`);
    });
    return lines.join('\n');
  }

  function validate(needed) {
    const fields = needed.map(n => F[n]);
    const bad = fields.filter(f => !f.value.trim());
    const mailBad = F.email.value.trim() && !F.email.validity.valid;
    if (mailBad) bad.push(F.email);
    [F.name, F.phone, F.suburb, F.email].forEach(f => f.classList.toggle('is-invalid', bad.includes(f)));
    if (bad.length) {
      const names = bad.filter(f => f !== F.email).map(f => f.name);
      const list = a => (a.length < 2 ? a[0] : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
      err.textContent = names.length ? `Please fill in your ${list(names)}.` : 'Please check your email address.';
      err.hidden = false;
      bad[0].focus();
      return false;
    }
    err.hidden = true;
    return true;
  }
  $$('input, textarea', form).forEach(f => f.addEventListener('input', () => {
    if (!f.classList.contains('is-invalid')) return;
    f.classList.remove('is-invalid');
    if (!$('.is-invalid', form)) err.hidden = true;
  }));

  const subject = () => {
    const s = serviceInput();
    const where = F.suburb.value.trim();
    return `${form.dataset.subject || 'Quote request'}: ${s ? s.value : 'Cleaning'}${where ? ` in ${where}` : ''}`;
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate(['name', 'phone', 'suburb'])) return;
    const message = compose();
    track('Lead', { content_name: `Quote form: ${(serviceInput() || {}).value || ''}` });
    if (cfg.formEndpoint) {
      submitBtn.disabled = true;
      try {
        const res = await fetch(cfg.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            _subject: subject(), subject: subject(), message,
            name: F.name.value.trim(), phone: F.phone.value.trim(), email: F.email.value.trim(),
            suburb: F.suburb.value.trim(), service: (serviceInput() || {}).value || ''
          })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        done.hidden = false;
        done.focus();
        return;
      } catch (_) {
        // se o serviço falhar, cai no e-mail
      } finally {
        submitBtn.disabled = false;
      }
    }
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject())}&body=${encodeURIComponent(message)}`;
  });

  $('[data-send-wa]', form).addEventListener('click', () => {
    if (!validate(['name', 'suburb'])) return;
    track('Lead', { content_name: 'Quote form: WhatsApp' });
    const url = waLink(`${compose()}\n\nI can send photos here too.`);
    // Sem "noopener" aqui: com ele o navegador devolve null e a página atual também iria para o WhatsApp
    const w = window.open(url, '_blank');
    if (w) w.opener = null; else location.href = url;
  });

  // ---------- Barra fixa no celular: aparece depois do topo, some no formulário ----------
  const dock = $('[data-dock]');
  if (dock && 'IntersectionObserver' in window) {
    let pastHero = false, atQuote = false;
    const update = () => dock.classList.toggle('is-on', pastHero && !atQuote);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; update(); }).observe($('.hero'));
    new IntersectionObserver(([e]) => { atQuote = e.isIntersecting; update(); }).observe($('#quote'));
  }
})();
