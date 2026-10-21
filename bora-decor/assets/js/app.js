/* Comportamento do site: rolagem suave, animações, vídeo do topo, projetos (antes/depois), perguntas,
   pedido de orçamento por e-mail (com fotos) e o camaleão que olha para o cursor. */
(function () {
  'use strict';

  const cfg = window.BORA || {};
  const doc = document.documentElement;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  window.__boraReady = true;
  if (!hasGsap) doc.classList.add('no-gsap');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  // ---------- Contatos vindos do config.js ----------
  $$('[data-tel]').forEach(a => { if (cfg.phoneIntl) a.href = `tel:${cfg.phoneIntl}`; });
  $$('[data-mail]').forEach(a => { if (cfg.email) a.href = `mailto:${cfg.email}`; });
  $$('[data-year]').forEach(n => { n.textContent = new Date().getFullYear(); });
  const social = $('[data-social]');
  if (social) {
    if (cfg.instagram) social.insertAdjacentHTML('beforeend', `<a href="${cfg.instagram}" target="_blank" rel="noopener" aria-label="Instagram"><svg class="icon"><use href="#i-ig"/></svg></a>`);
    if (cfg.facebook) social.insertAdjacentHTML('beforeend', `<a href="${cfg.facebook}" target="_blank" rel="noopener" aria-label="Facebook"><svg class="icon"><use href="#i-fb"/></svg></a>`);
  }

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
    const a = e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (a) track('Contact');
  });

  // ---------- Rolagem suave ----------
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 1, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const headerH = () => $('.header').offsetHeight;
  function goTo(target, focusEl) {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    const after = () => { if (focusEl) setTimeout(() => focusEl.focus({ preventScroll: true }), 60); };
    if (lenis) lenis.scrollTo(el, { offset: el.id === 'top' ? 0 : -headerH() + 1, duration: 1.5, onComplete: after });
    else { el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); setTimeout(after, 700); }
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = id === '#top' ? document.body : $(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    if (id === '#top') { if (lenis) lenis.scrollTo(0, { duration: 1.5 }); else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }
    else goTo(el);
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  });
  document.addEventListener('bora:goto', e => goTo(e.detail.target, e.detail.focus));

  // ---------- Residential / Commercial: a pílula dourada desliza até a página escolhida ----------
  $$('.seg').forEach(seg => {
    const pill = $('.seg__pill', seg);
    const items = $$('.seg__item', seg);
    const active = $('.seg__item.is-active', seg) || items[0];
    if (!pill || !active) return;
    let sliding = false;
    const place = (el, animate) => {
      if (!el.offsetWidth) return;
      pill.style.transition = animate ? '' : 'none';
      pill.style.width = `${el.offsetWidth}px`;
      pill.style.transform = `translateX(${el.offsetLeft}px)`;
    };
    // Vindo da outra página, a pílula começa do outro lado e desliza até a página atual
    let arrived = false;
    try { arrived = sessionStorage.getItem('bora-seg') === '1'; } catch (e) { /* sem storage */ }
    const other = items.find(i => i !== active);
    if (arrived && other && !reduce && other.offsetWidth) {
      place(other, false);
      sliding = true;
      requestAnimationFrame(() => requestAnimationFrame(() => { place(active, true); setTimeout(() => { sliding = false; }, 700); }));
    } else place(active, false);
    if ('ResizeObserver' in window) new ResizeObserver(() => { if (!sliding) place(active, false); }).observe(seg);
    // Voltando pelo botão "voltar" do navegador, a página volta como estava: põe a pílula no lugar
    window.addEventListener('pageshow', e => {
      if (!e.persisted) return;
      sliding = false;
      items.forEach(i => i.classList.remove('is-going'));
      place(active, false);
    });
    items.forEach(i => i.addEventListener('click', e => {
      if (i === active) { e.preventDefault(); closeMenu(); if (lenis) lenis.scrollTo(0, { duration: 1.2 }); else window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      try { sessionStorage.setItem('bora-seg', '1'); } catch (er) { /* sem storage */ }
      sliding = true;
      place(i, true);
      i.classList.add('is-going');
      setTimeout(() => { location.href = i.href; }, reduce ? 0 : 340);
    }));
  });
  window.addEventListener('pageshow', () => { try { sessionStorage.removeItem('bora-seg'); } catch (e) { /* sem storage */ } });

  // ---------- Topo: fundo ao rolar, some ao descer, volta ao subir ----------
  const header = $('.header');
  const dock = $('.dock');
  const quoteSection = $('#quote');
  let lastY = window.scrollY, quoteVisible = false;
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 30);
    const down = y > lastY + 2, up = y < lastY - 2;
    if (!document.body.classList.contains('menu-open')) {
      if (down && y > window.innerHeight * .7) header.classList.add('is-hidden');
      else if (up || y < 80) header.classList.remove('is-hidden');
    }
    if (dock) dock.classList.toggle('is-visible', y > window.innerHeight * .55 && !quoteVisible);
    lastY = y;
  }
  if (lenis) lenis.on('scroll', onScroll); else window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (quoteSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { quoteVisible = e.isIntersecting; onScroll(); }, { threshold: .15 }).observe(quoteSection);
  }

  // Link ativo no menu
  const navLinks = $$('.nav a[href^="#"]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${en.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(a => { const s = $(a.getAttribute('href')); if (s) io.observe(s); });
  }

  // ---------- Menu do celular ----------
  const menu = $('#menu');
  const menuBtn = $('.menu-btn');
  function openMenu() {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close menu');
    menuBtn.querySelector('use').setAttribute('href', '#i-x');
    document.body.classList.add('menu-open');
    header.classList.remove('is-hidden');
    if (lenis) lenis.stop();
  }
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    menuBtn.querySelector('use').setAttribute('href', '#i-menu');
    document.body.classList.remove('menu-open');
    if (lenis) lenis.start();
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 450);
  }
  if (menuBtn) menuBtn.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // ---------- Vídeo do topo ----------
  const video = $('.hero__video');
  const saveData = navigator.connection && navigator.connection.saveData;
  if (video && !reduce && !saveData) {
    const tall = window.matchMedia('(max-aspect-ratio: 3/4)').matches;
    const big = window.innerWidth * (window.devicePixelRatio || 1) > 2000 && window.innerWidth > 1100;
    let src = tall ? video.dataset.tall : (big && video.dataset.large) || video.dataset.wide;
    if (!video.canPlayType('video/mp4; codecs="avc1.640028"') && video.canPlayType('video/webm; codecs="vp9"')) {
      src = tall ? src.replace('.mp4', '.webm') : video.dataset.wide.replace('.mp4', '.webm');
    }
    video.src = src;
    video.preload = 'auto';
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
    const play = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
    play();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => (e.isIntersecting ? play() : video.pause()), { threshold: 0 }).observe(video);
    }
  }

  // ---------- Texto em palavras (máscara) ----------
  function splitWords(el, cls) {
    let i = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            if (cls === 'sw') {
              const s = document.createElement('span');
              s.className = 'sw'; s.textContent = p;
              frag.appendChild(s);
            } else {
              const w = document.createElement('span');
              w.className = 'w';
              const inner = document.createElement('span');
              inner.textContent = p;
              inner.style.setProperty('--i', i);
              w.appendChild(inner);
              frag.appendChild(w);
            }
            i++;
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    return i;
  }
  $$('[data-split], [data-split-words]').forEach(el => {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    splitWords(el, 'w');
    $$('.w', el).forEach(w => w.setAttribute('aria-hidden', 'true'));
  });
  const statement = $('[data-scrub]');
  let statementWords = [];
  if (statement) {
    splitWords(statement, 'sw');
    statementWords = $$('.sw', statement);
  }

  // ---------- Entrada do topo ----------
  const start = () => {
    doc.classList.add('is-loaded');
    $$('.hero [data-split]').forEach(el => el.classList.add('is-in'));
  };
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 700))]).then(() => requestAnimationFrame(start));

  // ---------- Aparecer ao rolar ----------
  const revealables = $$('.reveal, .reveal-wrap, [data-split], [data-split-words]').filter(el => !el.closest('.hero'));
  if ('IntersectionObserver' in window && !reduce) {
    // Elementos com clip-path fechado não "aparecem" para o observer: observa o pai deles
    const watched = new Map();
    const io = new IntersectionObserver(entries => {
      const batch = entries.filter(e => e.isIntersecting).flatMap(e => watched.get(e.target) || []);
      batch.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
      batch.forEach((el, k) => {
        if (el.classList.contains('is-in')) return;
        if (!el.matches('[data-split], [data-split-words]')) el.style.setProperty('--d', `${Math.min(k, 6) * 90}ms`);
        el.classList.add('is-in');
      });
      entries.forEach(e => { if (e.isIntersecting) io.unobserve(e.target); });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    revealables.forEach(el => {
      const target = el.classList.contains('reveal-wrap') ? el.parentElement : el;
      if (!watched.has(target)) { watched.set(target, []); io.observe(target); }
      watched.get(target).push(el);
    });
  } else {
    revealables.forEach(el => el.classList.add('is-in'));
  }

  // ---------- Contadores ----------
  function countUp(el) {
    const to = +el.dataset.count;
    const fmt = v => (el.hasAttribute('data-format') ? Math.round(v).toLocaleString('en-AU') : Math.round(v));
    if (reduce) { el.textContent = fmt(to); return; }
    const dur = to > 100 ? 1800 : 1400;
    let t0;
    const step = now => {
      if (!t0) t0 = now;
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 4);
      el.textContent = fmt(to * e);
      if (t < 1) requestAnimationFrame(step);
    };
    el.textContent = fmt(0);
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
    }), { threshold: .6 });
    $$('[data-count]').forEach(el => io.observe(el));
  }

  // ---------- Animações ligadas à rolagem (GSAP) ----------
  if (hasGsap && !reduce) {
    // O vídeo do topo encolhe e ganha cantos arredondados; o texto sobe e some
    gsap.to('.hero__media', {
      scale: .9, borderRadius: 30, yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__content', {
      yPercent: -18, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '75% top', scrub: true }
    });
    gsap.to('.hero__foot', {
      opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '25% top', scrub: true }
    });

    // O "10" da garantia flutua devagar
    if ($('.warranty__num')) {
      gsap.fromTo('.warranty__num', { yPercent: 10 }, {
        yPercent: -8, ease: 'none',
        scrollTrigger: { trigger: '.numbers', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }

    // Frase grande: as palavras acendem conforme a rolagem
    if (statement) {
      ScrollTrigger.create({
        trigger: statement, start: 'top 82%', end: 'bottom 40%', scrub: true,
        onUpdate: self => {
          const n = Math.round(self.progress * statementWords.length);
          statementWords.forEach((w, i) => w.classList.toggle('is-lit', i < n));
        }
      });
    }

    // Linha do passo a passo
    const steps = $('.steps');
    if (steps) {
      const items = $$('.step', steps);
      ScrollTrigger.create({
        trigger: steps, start: 'top 75%', end: 'bottom 55%', scrub: true,
        onUpdate: self => {
          steps.style.setProperty('--progress', self.progress.toFixed(3));
          items.forEach((s, i) => s.classList.toggle('is-lit', self.progress >= i / (items.length - 1) - .02 || (i === 0 && self.progress > 0)));
        }
      });
    }

    // Faixa de nomes: anda sozinha e acelera com a rolagem
    const track = $('.marquee__track');
    if (track) {
      const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 46, repeat: -1 });
      let boost = null;
      ScrollTrigger.create({
        trigger: '.marquee', start: 'top bottom', end: 'bottom top',
        onUpdate: self => {
          const v = Math.min(Math.abs(self.getVelocity()) / 300, 5);
          loop.timeScale(1 + v);
          if (boost) boost.kill();
          boost = gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'power2.out', delay: .1 });
        }
      });
    }
  } else {
    statementWords.forEach(w => w.classList.add('is-lit'));
    $$('.step').forEach(s => s.classList.add('is-lit'));
    const steps = $('.steps'); if (steps) steps.style.setProperty('--progress', 1);
  }

  // ---------- Antes e depois ----------
  const ba = $('.ba__frame');
  let baDemo = null;
  if (ba) {
    const range = $('.ba__range', ba);
    let touched = false, dragging = false;
    const set = v => { v = Math.max(0, Math.min(100, v)); ba.style.setProperty('--pos', `${v}%`); range.value = v; };
    range.style.pointerEvents = 'none';
    range.addEventListener('input', () => { touched = true; set(+range.value); });
    const fromEvent = e => { const r = ba.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };
    ba.addEventListener('pointerdown', e => {
      touched = true; dragging = true;
      ba.classList.add('is-dragging');
      ba.setPointerCapture(e.pointerId);
      set(fromEvent(e));
    });
    ba.addEventListener('pointermove', e => { if (dragging) set(fromEvent(e)); });
    const stop = () => { dragging = false; ba.classList.remove('is-dragging'); };
    ba.addEventListener('pointerup', stop);
    ba.addEventListener('pointercancel', stop);
    ba.style.cursor = 'ew-resize';

    // Mostra sozinho como funciona (na primeira vez que aparece e a cada projeto escolhido)
    baDemo = (delay) => {
      touched = false;
      set(50);
      if (reduce) return;
      const keys = [[0, 50], [900, 82], [1900, 16], [2700, 50]];
      let t0;
      const step = now => {
        if (touched) return;
        if (!t0) t0 = now + delay;
        const t = now - t0;
        if (t < 0) return requestAnimationFrame(step);
        let k = 1; while (k < keys.length - 1 && t > keys[k][0]) k++;
        const [ta, va] = keys[k - 1], [tb, vb] = keys[k];
        const p = Math.min(1, Math.max(0, (t - ta) / (tb - ta)));
        const ez = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        set(va + (vb - va) * ez);
        if (t < keys[keys.length - 1][0]) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!reduce && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        baDemo(1300);
      }, { threshold: .55 });
      io.observe(ba);
    }
  }

  // ---------- Projetos: lista em assets/js/projects.js ----------
  const projects = (window.BORA_PROJECTS || []).filter(p => p && p.before && p.after);
  if (ba && projects.length) {
    const imgB = $('.ba__img--before', ba), imgA = $('.ba__img--after', ba);
    const caption = $('[data-project-caption]'), text = $('[data-project-text]');
    const list = $('[data-project-list]'), filters = $('[data-project-filters]');
    let current = -1;
    const show = (i, demo) => {
      const p = projects[i];
      if (!p || i === current) return;
      current = i;
      if (!imgB.src.endsWith(p.before)) imgB.src = p.before;
      if (!imgA.src.endsWith(p.after)) imgA.src = p.after;
      imgB.alt = `Before: ${p.title}`;
      imgA.alt = `After: ${p.title}`;
      if (caption) caption.textContent = p.illustrative ? 'Illustrative transformation.' : [p.title, p.suburb, p.finish].filter(Boolean).join(' · ');
      if (text && p.text) text.textContent = p.text;
      if (list) $$('.project', list).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
      if (demo && baDemo) baDemo(250);
    };
    show(0, false);
    if (projects.length > 1 && list) {
      list.hidden = false;
      list.innerHTML = projects.map((p, i) => `<li><button type="button" class="project" data-i="${i}" data-cat="${p.category || ''}" aria-pressed="${i === 0}">
        <img src="${p.after}" alt="" loading="lazy" decoding="async"><span><b>${p.title}</b><small>${[p.category, p.suburb].filter(Boolean).join(' · ')}</small></span></button></li>`).join('');
      list.addEventListener('click', e => { const b = e.target.closest('.project'); if (b) show(+b.dataset.i, true); });
      const cats = [...new Set(projects.map(p => p.category).filter(Boolean))];
      if (cats.length > 1 && filters) {
        filters.hidden = false;
        filters.innerHTML = ['All', ...cats].map((c, i) => `<button type="button" class="chip${i ? '' : ' is-active'}" data-cat="${c}" aria-pressed="${!i}">${c}</button>`).join('');
        filters.addEventListener('click', e => {
          const b = e.target.closest('[data-cat]');
          if (!b) return;
          $$('[data-cat]', filters).forEach(x => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
          const cat = b.dataset.cat;
          let first = -1;
          $$('.project', list).forEach(x => { const ok = cat === 'All' || x.dataset.cat === cat; x.parentElement.hidden = !ok; if (ok && first < 0) first = +x.dataset.i; });
          if (first >= 0) show(first, true);
        });
      }
    }
  }

  // ---------- Texturas dos cartões e do mostruário (desenhadas quando chegam perto da tela) ----------
  const texEls = $$('[data-tex], [data-old]');
  if (texEls.length && window.BoraTextures) {
    const T = window.BoraTextures;
    const paint = el => {
      if (el.dataset.old) {
        $('.swap__old', el).style.backgroundImage = `url(${T.texture(el.dataset.old, 384)})`;
        $('.swap__new', el).style.backgroundImage = `url(${T.texture(el.dataset.new, 384)})`;
        return;
      }
      const tex = $('.family__tex, .tile__tex', el) || el;
      if (!tex.style.backgroundImage) tex.style.backgroundImage = `url(${T.texture(el.dataset.tex, 384)})`;
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { io.unobserve(e.target); paint(e.target); }
      }), { rootMargin: '600px 0px' });
      texEls.forEach(el => io.observe(el));
    } else texEls.forEach(paint);
  }
  // Toque num bloco "antes → depois" mostra o antes (no computador é ao passar o mouse)
  $$('.swap').forEach(t => t.addEventListener('click', () => { if (!finePointer) t.classList.toggle('is-before'); }));

  $$('[data-goto-filter]').forEach(b => b.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('bora:filter', { detail: { filter: b.dataset.gotoFilter } }));
    goTo('#studio');
  }));

  // ---------- Perguntas: abre e fecha com animação ----------
  const qas = $$('.qa');
  qas.forEach(d => {
    const sum = $('summary', d), body = $('.qa__a', d);
    sum.addEventListener('click', e => {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (d.open) {
        const h = body.offsetHeight;
        body.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => { d.open = false; };
      } else {
        qas.forEach(o => { if (o !== d && o.open) $('summary', o).click(); });
        d.open = true;
        const h = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    });
  });

  // ---------- Pedido de orçamento: vai por e-mail (com as fotos) pelo /api/quote do Worker ----------
  // Os campos com data-label entram no e-mail, na ordem do formulário.
  // Se o envio falhar, aparece um plano B: o e-mail já escrito para a pessoa mandar do próprio aplicativo.
  const form = $('[data-quote-form]');
  if (form) {
    const box = form.parentElement;
    const err = $('.form__error', form);
    const done = $('[data-form-done]', box), fail = $('[data-form-fail]', box);
    const submitBtn = $('button[type="submit"]', form), submitLabel = $('[data-submit-label]', form);
    const submitText = submitLabel.textContent;
    const look = $('[data-look-field]', form);
    const photoInput = $('[data-photos]', form), thumbs = $('[data-thumbs]', form), drop = $('[data-drop]', form);
    const MAX_PHOTOS = 6;
    const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;
    let photos = [];
    let sending = false;

    document.addEventListener('bora:look', e => { if (look && !look.dataset.edited) look.value = e.detail.text; });
    if (look) look.addEventListener('input', () => { look.dataset.edited = '1'; });

    // Fotos: diminui no próprio navegador (1600 px, JPEG) para enviar rápido mesmo no 4G
    const loadImage = file => new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => res({ img, url });
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('decode')); };
      img.src = url;
    });
    async function prepPhoto(file) {
      try {
        let src, w, h, cleanup = () => {};
        if (window.createImageBitmap) {
          src = await createImageBitmap(file, { imageOrientation: 'from-image' });
          w = src.width; h = src.height; cleanup = () => src.close && src.close();
        } else {
          const { img, url } = await loadImage(file);
          src = img; w = img.naturalWidth; h = img.naturalHeight; cleanup = () => URL.revokeObjectURL(url);
        }
        const k = Math.min(1, 1600 / Math.max(w, h));
        const cv = document.createElement('canvas');
        cv.width = Math.round(w * k); cv.height = Math.round(h * k);
        cv.getContext('2d').drawImage(src, 0, 0, cv.width, cv.height);
        cleanup();
        const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.82));
        if (!blob) throw new Error('encode');
        return { blob, type: 'image/jpeg', name: `${file.name.replace(/\.[^.]*$/, '') || 'photo'}.jpg` };
      } catch (e) {
        // Formato que o navegador não abre (ex.: HEIC no Chrome): manda o arquivo original se não for enorme
        if (file.size > 6 * 1024 * 1024) throw new Error('too-big');
        return { blob: file, type: file.type || 'application/octet-stream', name: file.name || 'photo' };
      }
    }
    const toB64 = blob => new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result).split(',')[1] || '');
      r.onerror = () => rej(r.error);
      r.readAsDataURL(blob);
    });

    function renderThumbs() {
      thumbs.innerHTML = '';
      photos.forEach((p, i) => {
        const li = document.createElement('li');
        li.className = 'thumb';
        li.innerHTML = `${p.preview ? `<img src="${p.preview}" alt="">` : '<span class="thumb__file"><svg class="icon"><use href="#i-camera"/></svg></span>'}<button type="button" aria-label="Remove photo ${i + 1}"><svg class="icon"><use href="#i-x"/></svg></button>`;
        $('button', li).addEventListener('click', () => {
          if (p.preview) URL.revokeObjectURL(p.preview);
          photos.splice(i, 1);
          renderThumbs();
        });
        thumbs.appendChild(li);
      });
      drop.classList.toggle('is-full', photos.length >= MAX_PHOTOS);
      $('b', drop).textContent = photos.length ? (photos.length >= MAX_PHOTOS ? '6 photos added' : 'Add more photos') : 'Add photos';
    }
    function addFiles(files) {
      const list = Array.from(files || []).filter(f => /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name));
      for (const file of list) {
        if (photos.length >= MAX_PHOTOS) break;
        const preview = /^image\/(jpeg|png|webp|gif)$/.test(file.type) ? URL.createObjectURL(file) : null;
        const item = { file, preview, prepared: prepPhoto(file) };
        item.prepared.catch(() => {});
        photos.push(item);
      }
      renderThumbs();
    }
    if (photoInput) {
      photoInput.addEventListener('change', () => { addFiles(photoInput.files); photoInput.value = ''; });
      ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
      ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
      drop.addEventListener('drop', e => addFiles(e.dataTransfer && e.dataTransfer.files));
    }

    const value = n => (form.elements[n] ? form.elements[n].value.trim() : '');
    const fields = () => {
      const fd = new FormData(form);
      const seen = new Set(), out = [];
      Array.from(form.elements).forEach(el => {
        if (!el.name || seen.has(el.name)) return;
        seen.add(el.name);
        const holder = el.closest('[data-label]');
        if (!holder) return;
        const val = fd.getAll(el.name).map(x => x.toString().trim()).filter(Boolean).join(', ');
        if (val) out.push([holder.dataset.label, val]);
      });
      return out;
    };
    function valid() {
      const checks = [
        ['name', v => v.length > 0],
        ['phone', v => v.replace(/\D/g, '').length >= 8],
        ['email', v => EMAIL_RE.test(v)],
        ['suburb', v => v.length > 0]
      ].filter(([n]) => form.elements[n]);
      const bad = checks.filter(([n, ok]) => !ok(value(n))).map(([n]) => n);
      checks.forEach(([n]) => form.elements[n].classList.toggle('is-invalid', bad.includes(n)));
      if (bad.length) {
        const names = { name: 'your name', phone: 'a phone number', email: 'a valid email', suburb: 'your suburb' };
        const list = bad.map(n => names[n]);
        err.textContent = `Please add ${list.length > 1 ? `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}` : list[0]}.`;
        err.hidden = false;
        form.elements[bad[0]].focus();
      } else err.hidden = true;
      return !bad.length;
    }
    ['name', 'phone', 'email', 'suburb'].forEach(n => form.elements[n] && form.elements[n].addEventListener('input', () => form.elements[n].classList.remove('is-invalid')));

    const post = (payload, onProgress) => new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/quote');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.timeout = 120000;
      xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
      xhr.onload = () => { let data = {}; try { data = JSON.parse(xhr.responseText); } catch (e) { /* resposta sem JSON */ } resolve({ status: xhr.status, data }); };
      xhr.onerror = () => resolve({ status: 0, data: {} });
      xhr.ontimeout = () => resolve({ status: 0, data: { error: 'timeout' } });
      xhr.send(JSON.stringify(payload));
    });
    const busy = (on, text) => {
      sending = on;
      submitBtn.disabled = on;
      submitBtn.classList.toggle('is-loading', on);
      submitLabel.textContent = on ? text : submitText;
    };
    const showPanel = panel => {
      form.hidden = true;
      [done, fail].forEach(p => { if (p) p.hidden = p !== panel; });
      panel.focus({ preventScroll: true });
      goTo(box.closest('section') || box);
    };
    function mailtoFallback() {
      const lines = [form.dataset.intro || "Hi Bora Decor! I'd like a free quote.", '', ...fields().map(([k, v]) => `${k}: ${v}`), '', photos.length ? `(I'll attach ${photos.length} photo${photos.length > 1 ? 's' : ''} to this email.)` : ''];
      const subject = `${form.dataset.subject || 'Quote request'}: ${value('name')}, ${value('suburb')}`;
      return `mailto:${cfg.email || 'info@boradecor.com.au'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (sending || !valid()) return;
      busy(true, photos.length ? 'Preparing photos…' : 'Sending…');
      const files = [];
      for (const p of photos) {
        try {
          const ready = await p.prepared;
          files.push({ name: ready.name, type: ready.type, data: await toB64(ready.blob) });
        } catch (er) { /* foto que não deu para ler fica de fora */ }
      }
      busy(true, 'Sending…');
      const payload = {
        page: form.dataset.page || 'Website',
        name: value('name'), phone: value('phone'), email: value('email'), suburb: value('suburb'),
        fields: fields(), photos: files, website: value('website')
      };
      const res = await post(payload, k => { submitLabel.textContent = k < 1 ? `Sending… ${Math.round(k * 100)}%` : 'Almost there…'; });
      busy(false);
      if (res.status === 200 && res.data.ok) {
        track('Lead', { content_name: form.dataset.lead || 'Quote form' });
        const nameEl = $('[data-done-name]', done);
        if (nameEl) nameEl.textContent = value('name') ? `, ${value('name').split(' ')[0]}` : '';
        showPanel(done);
        return;
      }
      const code = res.data && res.data.error;
      if (code === 'missing-fields') { valid(); err.textContent = 'Please check your name, phone, email and suburb.'; err.hidden = false; return; }
      if (code === 'too-large') { err.textContent = 'Those photos are too large to send together. Please remove one or two and try again.'; err.hidden = false; return; }
      if (code === 'bad-photo') { err.textContent = 'One of the photos couldn’t be read. Please remove it and try again.'; err.hidden = false; return; }
      // Sem e-mail configurado, sem internet ou erro no servidor: plano B
      const mail = $('[data-fail-mail]', fail);
      if (mail) mail.href = mailtoFallback();
      showPanel(fail);
    });

    const reopen = (reset) => {
      if (reset) {
        form.reset();
        photos.forEach(p => p.preview && URL.revokeObjectURL(p.preview));
        photos = [];
        renderThumbs();
        if (look) delete look.dataset.edited;
      }
      [done, fail].forEach(p => { if (p) p.hidden = true; });
      form.hidden = false;
    };
    const again = $('[data-form-again]', box), retry = $('[data-form-retry]', box);
    if (again) again.addEventListener('click', () => reopen(true));
    if (retry) retry.addEventListener('click', () => reopen(false));
  }

  // ---------- Botões "magnéticos" ----------
  if (finePointer && !reduce) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .22;
        const y = (e.clientY - r.top - r.height / 2) * .35;
        b.style.transform = `translate(${x}px, ${y}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  // ---------- Camaleões: o olho segue o cursor e piscam de vez em quando ----------
  const chams = new Set();
  const allChams = () => $$('.chameleon');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => (e.isIntersecting ? chams.add(e.target) : chams.delete(e.target))));
    const watch = () => allChams().forEach(c => { if (!c.dataset.watched) { c.dataset.watched = '1'; io.observe(c); } });
    watch();
    setTimeout(watch, 2500); // o camaleão do simulador é criado depois
  }
  const EYE = { x: 129.2, y: 118.2 }, PUPIL = { x: 134.8, y: 116.4 }, MAX = 11;
  let px = window.innerWidth / 2, py = window.innerHeight * .3, moved = false, wander = 0;
  if (!reduce) {
    window.addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; moved = true; }, { passive: true });
    const tick = now => {
      if (!finePointer && !moved) { // no celular, o olho passeia sozinho
        wander = now / 1000;
        px = window.innerWidth * (.5 + .45 * Math.sin(wander * .7));
        py = window.innerHeight * (.4 + .3 * Math.cos(wander * .45));
      }
      chams.forEach(c => {
        const eye = $('.eye', c), pupil = $('.pupil', c);
        if (!eye || !pupil) return;
        const r = eye.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1;
        const k = MAX * Math.min(1, d / 160);
        const tx = EYE.x + (dx / d) * k - PUPIL.x, ty = EYE.y + (dy / d) * k - PUPIL.y;
        const cur = pupil._p || { x: 0, y: 0 };
        cur.x += (tx - cur.x) * .14; cur.y += (ty - cur.y) * .14;
        pupil._p = cur;
        pupil.setAttribute('transform', `translate(${cur.x.toFixed(2)} ${cur.y.toFixed(2)})`);
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const blink = () => {
      chams.forEach(c => { c.classList.remove('is-blinking'); void c.offsetWidth; c.classList.add('is-blinking'); });
      setTimeout(blink, 2800 + Math.random() * 3600);
    };
    setTimeout(blink, 2400);
  }

  if (hasGsap) {
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }
})();
