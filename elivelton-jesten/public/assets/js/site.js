// Jesten Construções · comportamento do site (menu, galeria, vídeos, formulários e contagem de visitas)
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const T = (() => {
    try {
      return JSON.parse($('#i18n')?.textContent || '{}');
    } catch {
      return {};
    }
  })();
  const fmt = (s, v) => String(s || '').replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);

  // ---------- Cabeçalho e barra do telemóvel ----------

  const header = $('[data-header]');
  const bar = $('[data-mobile-bar]');
  const hero = $('.hero, .page-hero');
  const quote = $('.quote, .apply');
  const footer = $('.site-footer');
  const seen = new Map();

  const updateBar = () => {
    if (!bar) return;
    const pastHero = hero ? seen.get(hero) === false : scrollY > 400;
    const nearForm = (quote && seen.get(quote)) || (footer && seen.get(footer));
    bar.classList.toggle('is-on', pastHero && !nearForm);
  };

  if ('IntersectionObserver' in window) {
    const watch = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target, e.isIntersecting);
        updateBar();
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    [hero, quote, footer].filter(Boolean).forEach((el) => watch.observe(el));
  }

  let ticking = false;
  addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        header?.classList.toggle('is-stuck', scrollY > 30);
        // No topo da página nenhum item do menu fica marcado
        if (scrollY < innerHeight * 0.5) $$('.nav__link.is-current').forEach((a) => a.classList.remove('is-current'));
        ticking = false;
      });
    },
    { passive: true },
  );

  // ---------- Menu do telemóvel ----------

  const menu = $('[data-menu]');
  const openBtn = $('[data-menu-open]');
  const closeBtn = $('[data-menu-close]');
  const setMenu = (open) => {
    if (!menu) return;
    menu.hidden = !open;
    openBtn?.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) closeBtn?.focus();
    else openBtn?.focus({ preventScroll: true });
  };
  openBtn?.addEventListener('click', () => setMenu(true));
  closeBtn?.addEventListener('click', () => setMenu(false));
  menu?.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu && !menu.hidden) setMenu(false);
  });

  // Troca de idioma: guarda a escolha também sem passar pelo servidor
  $$('.lang-link').forEach((a) =>
    a.addEventListener('click', () => {
      const lang = new URL(a.href).searchParams.get('lang');
      if (lang) document.cookie = `jlang=${lang}; path=/; max-age=31536000; samesite=lax${location.protocol === 'https:' ? '; secure' : ''}`;
    }),
  );

  // ---------- Animações ao rolar ----------

  const revealables = $$('[data-reveal], [data-gantt]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    // Itens lado a lado entram em cascata
    const groups = new Map();
    for (const el of revealables) {
      const list = groups.get(el.parentElement) || [];
      list.push(el);
      groups.set(el.parentElement, list);
    }
    for (const list of groups.values()) list.forEach((el, i) => el.style.setProperty('transition-delay', `${Math.min(i % 4, 3) * 80}ms`));
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  // Link do menu da secção visível
  const navLinks = $$('.nav__link');
  const sections = navLinks.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          navLinks.forEach((a) => a.classList.toggle('is-current', a.hash === `#${e.target.id}`));
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => spy.observe(s));
  }

  // ---------- Vídeo do topo ----------

  const heroVideo = $('[data-hero-video]');
  const heroToggle = $('[data-hero-toggle]');
  if (heroVideo) {
    const setPaused = (paused) => {
      heroToggle?.classList.toggle('is-paused', paused);
      heroToggle?.setAttribute('aria-label', paused ? T.hero?.play || 'Play' : T.hero?.pause || 'Pause');
    };
    let userPaused = reduceMotion || saveData;
    if (userPaused) {
      heroVideo.removeAttribute('autoplay');
      heroVideo.pause();
      setPaused(true);
    }
    heroToggle?.addEventListener('click', () => {
      if (heroVideo.paused) {
        userPaused = false;
        heroVideo.play().catch(() => {});
        setPaused(false);
      } else {
        userPaused = true;
        heroVideo.pause();
        setPaused(true);
      }
    });
    heroVideo.addEventListener('pause', () => setPaused(true));
    heroVideo.addEventListener('play', () => setPaused(false));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !userPaused) heroVideo.play().catch(() => setPaused(true));
        else if (!e.isIntersecting) heroVideo.pause();
      }).observe(heroVideo);
    }
  }

  // ---------- Obras: vídeos que só carregam quando aparecem ----------

  const tileVideos = $$('video[data-src]');
  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target;
          if (e.isIntersecting) {
            if (!v.src) {
              v.src = v.dataset.src;
              v.load();
            }
            if (!reduceMotion && !saveData) v.play().catch(() => {});
          } else if (!v.paused) v.pause();
        }
      },
      { rootMargin: '120px 0px', threshold: 0.25 },
    );
    tileVideos.forEach((v) => vio.observe(v));
  }

  const grid = $('[data-works]');
  const more = $('[data-works-more]');
  if (grid && more) {
    grid.classList.add('is-collapsed');
    more.addEventListener('click', () => {
      const open = grid.classList.toggle('is-collapsed') === false;
      more.setAttribute('aria-expanded', String(open));
      more.querySelector('span').textContent = open ? more.dataset.less : more.dataset.more;
      if (!open) grid.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      $$('.work--extra [data-reveal], .work--extra', grid).forEach((el) => el.classList.add('is-in'));
    });
  }

  // ---------- Galeria em ecrã inteiro ----------

  const box = $('[data-lightbox]');
  const works = (() => {
    try {
      return JSON.parse($('#works-data')?.textContent || '[]');
    } catch {
      return [];
    }
  })();
  if (box && works.length && typeof box.showModal === 'function') {
    const stage = $('[data-stage]', box);
    const title = $('[data-title]', box);
    const meta = $('[data-meta]', box);
    const count = $('[data-count]', box);
    let index = 0;
    let opener = null;

    const show = (i) => {
      index = (i + works.length) % works.length;
      const w = works[index];
      stage.textContent = '';
      let el;
      if (w.kind === 'video') {
        el = document.createElement('video');
        el.src = w.src;
        if (w.poster) el.poster = w.poster;
        el.controls = true;
        el.playsInline = true;
        el.loop = true;
        el.muted = true;
        el.autoplay = !reduceMotion;
      } else {
        el = document.createElement('img');
        if (w.srcset) {
          el.srcset = w.srcset;
          el.sizes = '100vw';
        }
        el.src = w.src;
        el.alt = w.title;
      }
      el.width = w.w;
      el.height = w.h;
      stage.append(el);
      title.textContent = w.title;
      meta.textContent = [w.status, w.meta].filter(Boolean).join(' · ');
      count.textContent = fmt(T.works?.of || '{n} / {total}', { n: index + 1, total: works.length });
      // Pré-carrega a seguinte
      const next = works[(index + 1) % works.length];
      if (next.kind === 'image') {
        const img = new Image();
        if (next.srcset) {
          img.srcset = next.srcset;
          img.sizes = '100vw';
        }
        img.src = next.src;
      }
    };

    const close = () => box.close();
    box.addEventListener('close', () => {
      stage.textContent = '';
      document.documentElement.style.overflow = '';
      opener?.focus({ preventScroll: true });
    });
    $('[data-prev]', box).addEventListener('click', () => show(index - 1));
    $('[data-next]', box).addEventListener('click', () => show(index + 1));
    $('[data-close]', box).addEventListener('click', close);
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    box.addEventListener('click', (e) => {
      if (e.target === box || e.target === stage) close();
    });
    let startX = null;
    stage.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
    });
    stage.addEventListener('pointerup', (e) => {
      if (startX == null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    });

    $$('[data-work]').forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        opener = a;
        show(Number(a.dataset.work));
        document.documentElement.style.overflow = 'hidden';
        box.showModal();
      }),
    );
  }

  // ---------- Formulários ----------

  const F = T.form || {};
  for (const form of $$('form[data-form]')) {
    const maxMb = Number(form.dataset.maxMb || 10);
    const status = $('[data-status]', form);
    const done = form.parentElement.querySelector('[data-done]');
    const fileInput = $('input[type=file]', form);
    const fileName = $('[data-file-name]', form);
    const fileClear = $('[data-file-clear]', form);
    const otherWrap = $('[data-other-role]', form);
    const roleSelect = $('select[name=role]', form);

    const setError = (name, message) => {
      const err = $(`[data-error-for="${name}"]`, form);
      const field = err?.closest('.field');
      if (err) err.textContent = message || '';
      field?.classList.toggle('is-invalid', Boolean(message));
      const input = form.elements[name];
      if (input && input.setAttribute) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    };

    const checkFile = () => {
      const f = fileInput?.files?.[0];
      if (!f) return true;
      if (f.size > maxMb * 1024 * 1024) {
        setError('file', fmt(F.fileBig, { mb: maxMb }));
        return false;
      }
      setError('file', '');
      return true;
    };

    fileInput?.addEventListener('change', () => {
      const f = fileInput.files?.[0];
      fileName.textContent = f ? f.name : F.none || '';
      fileInput.closest('.file')?.classList.toggle('has-file', Boolean(f));
      if (fileClear) fileClear.hidden = !f;
      checkFile();
    });
    fileClear?.addEventListener('click', () => {
      fileInput.value = '';
      fileInput.dispatchEvent(new Event('change'));
      fileInput.focus();
    });

    roleSelect?.addEventListener('change', () => {
      if (otherWrap) otherWrap.hidden = roleSelect.value !== 'outro';
    });

    const validate = () => {
      let first = null;
      for (const el of form.elements) {
        if (!el.name || el.type === 'hidden' || el.closest('.hp') || el.closest('[hidden]')) continue;
        let msg = '';
        const value = el.type === 'checkbox' ? el.checked : String(el.value || '').trim();
        if (el.required && !value) msg = el.type === 'checkbox' ? F.consent : F.required;
        else if (el.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) msg = F.email;
        if (el.type !== 'file') setError(el.name, msg);
        if (msg && !first) first = el;
      }
      if (!checkFile() && !first) first = fileInput;
      if (first) {
        first.focus();
        return false;
      }
      return true;
    };

    form.addEventListener('input', (e) => {
      const el = e.target;
      if (el.name && el.closest('.field')?.classList.contains('is-invalid')) setError(el.name, '');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      status.classList.remove('is-error');
      if (!validate()) return;
      form.classList.add('is-sending');
      status.textContent = F.sending || '';
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          const name = String(form.elements.name?.value || '').trim().split(/\s+/)[0];
          const text = done?.querySelector('[data-done-text]');
          if (text) text.textContent = name ? fmt(text.dataset.template, { name }) : text.textContent;
          form.hidden = true;
          if (done) {
            done.hidden = false;
            done.focus();
            done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
          }
          form.reset();
          fileInput?.dispatchEvent(new Event('change'));
          return;
        }
        if (data.error === 'invalid' && Array.isArray(data.fields)) {
          data.fields.forEach((f) => setError(f, f === 'email' ? F.email : f === 'consent' ? F.consent : F.required));
          status.textContent = '';
          return;
        }
        throw new Error(data.error || 'fail');
      } catch (err) {
        const code = err.message;
        status.textContent = code === 'rate' ? F.rate : code === 'size' ? fmt(F.fileBig, { mb: maxMb }) : code === 'type' ? F.fileType : F.fail;
        status.classList.add('is-error');
      } finally {
        form.classList.remove('is-sending');
      }
    });

    done?.querySelector('[data-again]')?.addEventListener('click', () => {
      done.hidden = true;
      form.hidden = false;
      form.querySelector('input:not([type=hidden]), select, textarea')?.focus();
    });
  }

  // Volta do envio sem JavaScript (?sent=...): limpa o endereço
  const sentReturn = /[?&]sent=/.test(location.search);
  if (sentReturn) history.replaceState(null, '', location.pathname + location.hash);

  // ---------- Visitas (sem cookies: só página, origem e idioma; país e cidade vêm do servidor) ----------

  if (!navigator.webdriver && document.visibilityState !== 'prerender' && !sentReturn) {
    const params = new URLSearchParams(location.search);
    const body = JSON.stringify({ p: location.pathname, r: document.referrer, u: params.get('utm_source') || '' });
    const send = () => {
      try {
        if (!navigator.sendBeacon || !navigator.sendBeacon('/api/v', new Blob([body], { type: 'text/plain' })))
          fetch('/api/v', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
      } catch {
        /* sem estatística, sem problema */
      }
    };
    if (document.readyState === 'complete') setTimeout(send, 300);
    else addEventListener('load', () => setTimeout(send, 300), { once: true });
  }
})();
