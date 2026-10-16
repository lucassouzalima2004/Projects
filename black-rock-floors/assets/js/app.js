/* Black Rock Floors · comportamento da página
   Sem dependências. Todo o conteúdo está no HTML e aparece mesmo sem JavaScript;
   aqui ficam os extras: vídeo do topo, faixas que passam, menu, mapa, fotos ampliadas e formulário. */
(() => {
  'use strict';

  const PHONE = '+14255434667';
  const EMAIL = 'br.remodelingwa@gmail.com';
  // Horário de atendimento (hora do Pacífico): dia → [abre, fecha]
  const HOURS = { Mon: [8, 17], Tue: [8, 17], Wed: [8, 17], Thu: [8, 17], Fri: [8, 17], Sat: [9, 14] };

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;
  const root = document.documentElement;

  /* ---------- Cabeçalho ---------- */
  const header = $('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 4);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Marca no menu a seção que está na tela
  const navLinks = $$('.nav a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.remove('is-current'));
        const link = byId.get(e.target.id);
        if (link) link.classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Menu do celular ---------- */
  const menuBtn = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  const behindMenu = [$('main'), $('.site-footer'), $('.topbar'), $('[data-action-bar]')].filter(Boolean);
  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.visually-hidden').textContent = open ? 'Close menu' : 'Menu';
    root.classList.toggle('menu-open', open);
    behindMenu.forEach((el) => { el.inert = open; });
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
    } else {
      menu.classList.remove('is-open');
      menu.hidden = true;
    }
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1181px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  /* ---------- Aberto agora? (hora do Pacífico) ---------- */
  const status = $('[data-open-status]');
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_NAMES = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };
  const hourText = (h) => `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'}`;
  function pacificNow() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (t) => (parts.find((p) => p.type === t) || {}).value;
    return { day: get('weekday'), t: (Number(get('hour')) % 24) + Number(get('minute')) / 60 };
  }
  function updateStatus() {
    if (!status) return;
    let now;
    try { now = pacificNow(); } catch (err) { return; }
    const today = HOURS[now.day];
    const open = !!today && now.t >= today[0] && now.t < today[1];
    let html;
    if (open) {
      html = `<strong>Open now</strong> · until ${hourText(today[1])} · Free in-home estimates across King &amp; Snohomish County`;
    } else {
      let when = '';
      if (today && now.t < today[0]) {
        when = `today at ${hourText(today[0])}`;
      } else {
        const i = DAYS.indexOf(now.day);
        for (let k = 1; k <= 7; k++) {
          const d = DAYS[(i + k) % 7];
          if (HOURS[d]) { when = `${k === 1 ? 'tomorrow' : DAY_NAMES[d]} at ${hourText(HOURS[d][0])}`; break; }
        }
      }
      html = `<strong>Closed now</strong> · opens ${when} · Texts are welcome anytime`;
    }
    status.classList.toggle('is-closed', !open);
    $('.status-text', status).innerHTML = html;
  }
  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  /* ---------- Vídeo do topo ---------- */
  // O vídeo já começou pelo script logo depois dele, no index.html, que também escolhe a versão (video.pickSource).
  // Ele toca sempre que o topo está na tela, mesmo com "Reduzir movimento" ligado (pedido do cliente); o botão pausa.
  const video = $('.hero-video');
  const panel = $('.hero-panel');
  const videoBtn = $('[data-video-toggle]');
  if (video && panel && video.pickSource) {
    let userPaused = false;
    let onScreen = true;
    let anim = null;
    video.defaultMuted = true;
    video.playsInline = true;

    // Troca de versão sem voltar ao começo: as três têm a mesma duração e as mesmas cenas
    const setSource = (src) => {
      const t = video.getAttribute('src') ? video.currentTime : 0;
      video.src = src;
      if (t > 0.5) video.addEventListener('loadedmetadata', () => { video.currentTime = t; }, { once: true });
    };
    const isPlaying = () => (anim ? anim.classList.contains('is-playing') : !video.paused);
    const showState = () => {
      const paused = userPaused || !isPlaying();
      panel.classList.toggle('is-paused', paused);
      if (videoBtn) videoBtn.setAttribute('aria-label', paused ? 'Play the background video' : 'Pause the background video');
    };

    // O iPhone no modo de pouca bateria (e o navegador de alguns apps) não deixa vídeo tocar sozinho, mas o Safari
    // toca MP4 dentro de uma <img>, como um GIF: assim o topo abre com o vídeo rodando mesmo nesses casos.
    // (Se o aparelho não animar imagens, ela fica parada no primeiro quadro, que é igual ao pôster.)
    let triedImage = false;
    const playAsImage = () => {
      const src = video.pickSource();
      if (triedImage || !/\.mp4(\?|$)/.test(src)) return;
      triedImage = true;
      const img = new Image();
      img.className = 'hero-anim';
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.addEventListener('load', () => {
        if (!video.paused) return;
        anim = img;
        video.removeAttribute('src');
        video.load();
        video.after(img);
        if (!userPaused) img.classList.add('is-playing');
        showState();
      }, { once: true });
      img.src = src;
    };

    const play = () => {
      if (userPaused || !onScreen || document.hidden) return;
      if (anim) { anim.classList.add('is-playing'); showState(); return; }
      const src = video.pickSource();
      if (video.getAttribute('src') !== src) setSource(src);
      const p = video.play();
      if (p && p.catch) {
        p.catch((err) => {
          showState();
          if (err && err.name === 'NotAllowedError') playAsImage();
        });
      }
    };

    video.addEventListener('playing', () => {
      video.classList.add('is-playing');
      showState();
    });
    video.addEventListener('pause', showState);

    if (videoBtn) {
      videoBtn.addEventListener('click', () => {
        if (isPlaying()) {
          userPaused = true;
          if (anim) anim.classList.remove('is-playing'); else video.pause();
        } else {
          userPaused = false;
          play();
        }
        showState();
      });
    }

    // Só toca com o painel na tela (economiza bateria e dados)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
        if (onScreen) play(); else video.pause();
      }, { threshold: 0.15 }).observe(panel);
    }

    // Foi para outro app ou aba: pausa. Voltou: continua de onde parou (o celular não retoma sozinho)
    document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); else play(); });
    window.addEventListener('pageshow', (e) => { if (e.persisted) play(); });

    // Se o aparelho ainda assim não deixar tocar (navegador de alguns apps no Android), começa no primeiro toque na tela
    const kick = (e) => {
      if (isPlaying() || (videoBtn && videoBtn.contains(e.target))) return;
      play();
    };
    ['touchend', 'click', 'keydown'].forEach((type) => document.addEventListener(type, kick, { capture: true, passive: true }));

    // Girou o celular: troca para o vídeo em pé ou deitado, do mesmo ponto
    // (a barra de endereço e o teclado só mudam a altura, então só a largura conta)
    let lastW = window.innerWidth;
    let resizeT = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        const src = video.pickSource();
        if (anim) { if (/\.mp4(\?|$)/.test(src)) anim.src = src; return; }
        if (!video.getAttribute('src') || video.getAttribute('src') === src) return;
        video.classList.remove('is-playing');
        setSource(src);
        play();
      }, 300);
    });

    showState();
    play();
  }

  /* ---------- Entrada das seções, tábuas e contadores ---------- */
  $$('.why-grid, .steps').forEach((grid) => {
    Array.from(grid.children).forEach((child, i) => child.style.setProperty('--d', `${i * 0.08}s`));
  });
  $$('[data-planks]').forEach((el) => {
    el.insertAdjacentHTML('beforeend', '<span class="planks-cover" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>');
  });

  const countUp = (el) => {
    const target = Number(el.dataset.count);
    if (!target || reduceMotion.matches) return;
    const t0 = performance.now();
    const dur = 1400;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        if (e.target.matches('[data-count]')) countUp(e.target);
        reveal.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    $$('[data-reveal], [data-planks], [data-count]').forEach((el) => reveal.observe(el));
  } else {
    $$('[data-reveal], [data-planks]').forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Faixas que passam (avaliações e projetos) ---------- */
  // Foco que veio do teclado (no toque e no clique o navegador não mostra o contorno de foco)
  const keyboardFocus = (el) => { try { return el.matches(':focus-visible'); } catch (err) { return true; } };

  class Marquee {
    constructor(el) {
      this.el = el;
      this.track = $('.marquee-track', el);
      this.items = Array.from(this.track.children);
      this.speed = Number(el.dataset.speed) || 30;
      this.dir = el.dataset.direction === 'right' ? 1 : -1;
      this.offset = 0;
      this.v = 0;
      this.hover = false;
      this.focus = false;
      this.visible = false;
      this.drag = null;
      this.resumeAt = 0;
      this.moved = false;
      this.built = false;
      this.bind();
    }
    build() {
      this.built = true;
      $$('[data-clone]', this.track).forEach((n) => n.remove());
      const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
      this.setW = this.items.reduce((w, it) => w + it.getBoundingClientRect().width + gap, 0);
      if (!this.setW) return;
      const copies = Math.max(1, Math.ceil((this.el.clientWidth + this.setW) / this.setW));
      for (let k = 0; k < copies; k++) {
        this.items.forEach((it) => {
          const c = it.cloneNode(true);
          c.setAttribute('aria-hidden', 'true');
          c.setAttribute('data-clone', '');
          if (c.matches('a, button')) c.tabIndex = -1;
          $$('a, button', c).forEach((b) => { b.tabIndex = -1; });
          this.track.append(c);
        });
      }
      this.wrap();
      this.paint();
    }
    wrap() {
      if (!this.setW) return;
      while (this.offset <= -this.setW) this.offset += this.setW;
      while (this.offset > 0) this.offset -= this.setW;
    }
    paint() { this.track.style.transform = `translate3d(${this.offset.toFixed(2)}px,0,0)`; }
    bind() {
      const el = this.el;
      el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') this.hover = true; });
      el.addEventListener('pointerleave', () => { this.hover = false; });
      el.addEventListener('focusin', (e) => {
        // Só o teclado segura a faixa; no toque (e quando a foto ampliada fecha) ela continua andando
        if (!keyboardFocus(e.target)) return;
        this.focus = true;
        // Traz para a tela o cartão que recebeu o foco pelo teclado
        const item = e.target.closest('.marquee-track > *');
        if (!item) return;
        const box = el.getBoundingClientRect();
        const r = item.getBoundingClientRect();
        if (r.left < box.left + 24) this.offset += box.left + 24 - r.left;
        else if (r.right > box.right - 24) this.offset -= r.right - (box.right - 24);
        this.wrap();
        this.paint();
      });
      el.addEventListener('focusout', () => { this.focus = false; });

      this.track.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        this.drag = { x: e.clientX, y: e.clientY, start: this.offset, id: e.pointerId, active: false };
        this.moved = false;
      });
      this.track.addEventListener('pointermove', (e) => {
        const d = this.drag;
        if (!d || e.pointerId !== d.id) return;
        const dx = e.clientX - d.x;
        if (!d.active) {
          if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - d.y)) return;
          d.active = true;
          this.moved = true;
          el.classList.add('is-dragging');
          try { this.track.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
        }
        this.offset = d.start + dx;
        this.wrap();
        this.paint();
        this.v = 0;
      });
      const end = (e) => {
        if (!this.drag || (e && e.pointerId !== this.drag.id)) return;
        this.drag = null;
        el.classList.remove('is-dragging');
        this.resumeAt = performance.now() + 1200;
      };
      this.track.addEventListener('pointerup', end);
      this.track.addEventListener('pointercancel', end);
      // Depois de arrastar, o clique não abre a foto
      this.track.addEventListener('click', (e) => {
        if (this.moved) { e.preventDefault(); e.stopPropagation(); this.moved = false; }
      }, true);
      this.track.addEventListener('dragstart', (e) => e.preventDefault());
    }
    step(dt, now) {
      if (!this.visible || this.drag) return;
      // Andam mesmo com "Reduzir movimento" ligado (pedido do cliente); o botão Pause embaixo das avaliações para tudo
      const halt = this.hover || this.focus || root.classList.contains('motion-paused') || now < this.resumeAt;
      const target = halt ? 0 : this.speed * this.dir;
      this.v += (target - this.v) * Math.min(1, dt * 4);
      if (halt && Math.abs(this.v) < 1.5) this.v = 0;
      if (this.v === 0) return;
      this.offset += this.v * dt;
      this.wrap();
      this.paint();
    }
  }

  const marquees = $$('[data-marquee]').map((el) => new Marquee(el));
  if (marquees.length) {
    // O loop só roda enquanto alguma faixa está na tela
    let last = 0;
    let running = false;
    const frame = (now) => {
      if (!marquees.some((m) => m.visible)) { running = false; return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      marquees.forEach((m) => m.step(dt, now));
      requestAnimationFrame(frame);
    };
    const run = () => {
      if (running) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    };
    // Cada faixa só é montada (cópias para o loop) quando chega perto da tela
    if ('IntersectionObserver' in window) {
      const vis = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          const m = marquees.find((x) => x.el === e.target);
          if (!m) return;
          if (e.isIntersecting && !m.built) m.build();
          m.visible = e.isIntersecting;
        });
        run();
      }, { rootMargin: '300px 0px' });
      marquees.forEach((m) => vis.observe(m.el));
    } else {
      marquees.forEach((m) => { m.build(); m.visible = true; });
      run();
    }

    let lastW = window.innerWidth;
    let rt = 0;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        marquees.forEach((m) => { if (m.built) m.build(); });
      }, 200);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => marquees.forEach((m) => { if (m.built) m.build(); }));

    $$('[data-motion-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const paused = !root.classList.contains('motion-paused');
        root.classList.toggle('motion-paused', paused);
        $$('[data-motion-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(paused)));
      });
    });
  }

  /* ---------- Serviços: foto do serviço ativo (computador) ---------- */
  const services = $('[data-services]');
  if (services) {
    const rows = $$('[data-svc]', services);
    const photo = $('[data-stage-photo]', services);
    const num = $('[data-stage-num]', services);
    const name = $('[data-stage-name]', services);
    const shots = [];
    let active = 0;
    let staged = false;

    // Monta o painel fixo (fotos grandes) só no computador e só quando a seção chega perto
    const buildStage = () => {
      if (staged || !isDesktop()) return;
      staged = true;
      rows.forEach((row, i) => {
        const img = $('.svc-media img', row);
        const big = document.createElement('img');
        const srcset = (img.getAttribute('srcset') || '').split(',').map((s) => s.trim().split(/\s+/)[0]).filter(Boolean);
        big.alt = '';
        big.decoding = 'async';
        big.loading = i ? 'lazy' : 'eager';
        big.src = srcset[srcset.length - 1] || img.src;
        big.classList.toggle('is-active', i === active);
        photo.append(big);
        shots.push(big);
      });
      photo.insertAdjacentHTML('beforeend', '<span class="planks-cover" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>');
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { photo.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.3 });
        io.observe(photo);
      } else {
        photo.classList.add('is-in');
      }
    };
    if ('IntersectionObserver' in window) {
      const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { buildStage(); if (staged) near.disconnect(); } }, { rootMargin: '600px 0px' });
      near.observe(services);
    } else {
      buildStage();
    }
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) buildStage(); });

    const activate = (i) => {
      active = i;
      rows.forEach((r, k) => r.classList.toggle('is-active', k === i));
      shots.forEach((s, k) => s.classList.toggle('is-active', k === i));
      num.textContent = String(i + 1).padStart(2, '0');
      name.textContent = $('.svc-name', rows[i]).textContent.trim();
    };
    const touch = window.matchMedia('(hover: none)');
    rows.forEach((row, i) => {
      row.addEventListener('pointerenter', (e) => { if (isDesktop() && e.pointerType === 'mouse') activate(i); });
      row.addEventListener('focusin', () => { if (isDesktop()) activate(i); });
      // Na tela de toque grande, o primeiro toque abre o serviço e o segundo leva à página dele
      row.addEventListener('click', (e) => {
        if (isDesktop() && touch.matches && active !== i && !e.target.closest('.svc-more-inner a')) {
          e.preventDefault();
          activate(i);
        }
      });
    });
  }

  /* ---------- Mapa da área atendida ---------- */
  const map = $('.area-map');
  if (map) {
    const dots = new Map($$('.map-city', map).map((g) => [g.dataset.city, g]));
    const items = new Map($$('[data-cities] [data-city]').map((li) => [li.dataset.city, li]));
    $$('.map-city', map).forEach((g, i) => g.style.setProperty('--d', `${0.2 + i * 0.045}s`));
    let hovering = false;
    const light = (slug, on) => {
      const g = dots.get(slug);
      const li = items.get(slug);
      if (g) g.classList.toggle('is-hl', on);
      if (li) li.classList.toggle('is-hl', on);
    };
    const clear = () => dots.forEach((_, slug) => light(slug, false));
    const hook = (el, slug) => {
      el.addEventListener('pointerenter', () => { hovering = true; clear(); light(slug, true); });
      el.addEventListener('pointerleave', () => { hovering = false; light(slug, false); });
    };
    items.forEach((li, slug) => hook(li, slug));
    dots.forEach((g, slug) => hook(g, slug));

    // Com o mapa na tela, uma cidade por vez acende sozinha
    const slugs = Array.from(dots.keys());
    let timer = 0;
    let k = 0;
    const cycle = () => {
      if (hovering || reduceMotion.matches) return;
      clear();
      k = (k + 7) % slugs.length;
      light(slugs[k], true);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        clearInterval(timer);
        if (e.isIntersecting) timer = setInterval(cycle, 1900);
        else if (!hovering) clear();
      }, { threshold: 0.35 }).observe(map);
    }
  }

  /* ---------- Fotos ampliadas dos projetos ---------- */
  const lightbox = $('[data-lightbox]');
  const originals = $$('[data-project]:not([data-clone])');
  originals.forEach((btn, i) => { btn.dataset.index = String(i); });
  $$('[data-project][data-clone]').forEach((c) => {
    const twin = originals.find((o) => o.querySelector('img').getAttribute('src') === c.querySelector('img').getAttribute('src'));
    if (twin) c.dataset.index = twin.dataset.index;
  });
  if (lightbox && originals.length && typeof lightbox.showModal === 'function') {
    const img = $('[data-lightbox-img]', lightbox);
    const city = $('[data-lightbox-city]', lightbox);
    const service = $('[data-lightbox-service]', lightbox);
    let index = 0;
    let opener = null;
    const show = (i) => {
      index = (i + originals.length) % originals.length;
      const src = originals[index].querySelector('img');
      img.src = src.getAttribute('src');
      img.alt = src.alt;
      city.textContent = $('.project-city', originals[index]).textContent;
      // O tipo de serviço é opcional: os cartões de hoje mostram só a cidade
      const kind = $('.project-service', originals[index]);
      service.textContent = kind ? kind.textContent : '';
      service.hidden = !kind;
    };
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-project]');
      if (!btn) return;
      opener = btn.matches('[data-clone]') ? originals[Number(btn.dataset.index)] : btn;
      show(Number(btn.dataset.index) || 0);
      lightbox.showModal();
    });
    $('[data-lightbox-close]', lightbox).addEventListener('click', () => lightbox.close());
    $('[data-lightbox-prev]', lightbox).addEventListener('click', () => show(index - 1));
    $('[data-lightbox-next]', lightbox).addEventListener('click', () => show(index + 1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    lightbox.addEventListener('close', () => { if (opener) opener.focus({ preventScroll: true }); });
  }

  /* ---------- Pedido de orçamento: abre o e-mail ou o SMS já preenchido ---------- */
  const form = $('[data-estimate]');
  if (form) {
    const statusLine = $('[data-form-status]', form);
    const val = (n) => (form.elements[n] ? form.elements[n].value.trim() : '');
    const required = [
      { name: 'name', ok: (v) => v.length > 1 },
      { name: 'phone', ok: (v) => v.replace(/\D/g, '').length >= 7 },
    ];
    const validate = () => {
      let first = null;
      required.forEach(({ name, ok }) => {
        const input = form.elements[name];
        const err = document.getElementById(`${input.id}-error`);
        const bad = !ok(input.value.trim());
        input.setAttribute('aria-invalid', String(bad));
        if (bad) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
        err.hidden = !bad;
        if (bad && !first) first = input;
      });
      if (first) first.focus();
      return !first;
    };
    required.forEach(({ name }) => {
      form.elements[name].addEventListener('input', (e) => {
        if (e.target.getAttribute('aria-invalid') === 'true') {
          e.target.setAttribute('aria-invalid', 'false');
          document.getElementById(`${e.target.id}-error`).hidden = true;
        }
      });
    });
    const details = () => [
      `Name: ${val('name')}`,
      `Phone: ${val('phone')}`,
      val('email') && `Email: ${val('email')}`,
      val('city') && `City: ${val('city')}`,
      val('service') && `Service: ${val('service')}`,
    ].filter(Boolean);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) return;
      const subject = `Free estimate request: ${val('service') || 'new floor'}${val('city') ? ` in ${val('city')}` : ''}`;
      const body = ["Hi Black Rock Floors, I'd like a free estimate.", '', ...details(), '', val('message')].join('\n').trim();
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      statusLine.textContent = 'Your email app should open with everything filled in. Just hit send. If nothing opened, call or text (425) 543-4667.';
    });
    const smsBtn = $('[data-send-sms]', form);
    if (smsBtn) {
      smsBtn.addEventListener('click', () => {
        if (!validate()) return;
        const body = ["Hi Black Rock Floors, I'd like a free estimate.", ...details(), val('message')].filter(Boolean).join('\n');
        window.location.href = `sms:${PHONE}?&body=${encodeURIComponent(body)}`;
        statusLine.textContent = 'Your messages app should open with the request ready to send.';
      });
    }
    // Os links "Get a ... estimate" da página Other services já deixam o serviço escolhido no formulário
    const service = form.elements.service;
    document.addEventListener('click', (e) => {
      const pick = e.target.closest('[data-pick]');
      if (pick && service) service.value = pick.dataset.pick;
    });
  }

  /* ---------- Barra fixa do celular ---------- */
  const bar = $('[data-action-bar]');
  const hero = $('.hero');
  const contact = $('#contact');
  if (bar && hero && 'IntersectionObserver' in window) {
    let pastHero = false;
    let atContact = false;
    const sync = () => bar.classList.toggle('is-visible', pastHero && !atContact);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; sync(); }, { threshold: 0.25 }).observe(hero);
    if (contact) new IntersectionObserver(([e]) => { atContact = e.isIntersecting; sync(); }, { threshold: 0.2 }).observe(contact);
  }

  /* ---------- Ano no rodapé ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
