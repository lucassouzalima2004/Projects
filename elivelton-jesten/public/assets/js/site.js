// Jesten Construções · comportamento do site (cabeçalho, menu, animações, números, galeria, vídeos, formulários e contagem de visitas)
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
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const hasIO = 'IntersectionObserver' in window;
  const motion = !reduceMotion;

  // ---------- Ao rolar: cabeçalho, barra de leitura e parallax ----------

  const header = $('[data-header]');
  const overlay = Boolean(header?.classList.contains('hdr--overlay'));
  const navLinks = $$('.hdr__link');
  const progress = $('[data-progress]');
  const hero = $('.hero');
  const heroBg = $('.hero__bg', hero || document);
  const heroIn = $('.hero__in', hero || document);
  const menu = $('[data-menu]');
  const langMenu = $('[data-lang-menu]');

  // Fotos com parallax: só as que estão à vista entram nas contas
  const parallax = new Set();
  if (motion && hasIO) {
    const pio = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? parallax.add(e.target) : parallax.delete(e.target);
      requestTick();
    });
    $$('img[data-parallax]').forEach((img) => pio.observe(img.parentElement));
  }

  let heroH = hero?.offsetHeight || 0;
  addEventListener('resize', () => (heroH = hero?.offsetHeight || 0), { passive: true });

  let ticking = false;
  let lastY = scrollY;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    // Leituras primeiro, escritas depois (sem forçar o navegador a recalcular a página a meio)
    const docMax = Math.max(1, root.scrollHeight - innerHeight);
    const boxes = [...parallax].map((box) => [box, box.getBoundingClientRect()]);

    header?.classList.toggle('is-scrolled', y > 40);
    if (overlay) header.classList.toggle('is-solid', y > 40);

    // O cabeçalho sai ao descer e volta ao subir (nunca com o menu ou o idioma abertos)
    if (header && motion) {
      const busy = (menu && !menu.hidden) || langMenu?.open || header.contains(document.activeElement);
      if (y < innerHeight * 0.6 || busy) header.classList.remove('is-hidden');
      else if (Math.abs(y - lastY) > 8) header.classList.toggle('is-hidden', y > lastY);
    }
    if (Math.abs(y - lastY) > 8 || y < 10) lastY = y;

    if (progress) progress.style.transform = `scaleX(${Math.min(1, y / docMax).toFixed(4)})`;

    if (motion && hero && y <= heroH) {
      // A foto do topo anda mais devagar que a página e o texto desvanece ao sair
      const p = heroH ? y / heroH : 0;
      if (heroBg) heroBg.style.translate = `0 ${(y * 0.32).toFixed(1)}px`;
      if (heroIn) {
        heroIn.style.opacity = String(Math.max(0, 1 - p * 1.5).toFixed(3));
        heroIn.style.translate = `0 ${(-p * 80).toFixed(1)}px`;
      }
    }
    for (const [box, r] of boxes) {
      const img = $('img[data-parallax]', box);
      const max = r.height * 0.06;
      const shift = Math.max(-max, Math.min(max, (r.top + r.height / 2 - innerHeight / 2) * 0.1));
      img.style.translate = `0 ${shift.toFixed(1)}px`;
    }

    // No topo da página nenhum item do menu fica marcado
    if (y < innerHeight * 0.5) navLinks.forEach((a) => a.classList.remove('is-current'));
  };
  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }
  addEventListener('scroll', requestTick, { passive: true });
  onScroll();

  // Link do menu da secção visível
  const spyLinks = navLinks.filter((a) => a.hash && a.pathname === location.pathname);
  const sections = spyLinks.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter(Boolean);
  if (sections.length && hasIO) {
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          spyLinks.forEach((a) => a.classList.toggle('is-current', a.hash === `#${e.target.id}`));
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => spy.observe(s));
  }

  // ---------- Menu do telemóvel ----------

  const openBtn = $('[data-menu-open]');
  const closeBtn = $('[data-menu-close]');
  let menuTimer = 0;
  const setMenu = (open) => {
    // A meio da animação de fecho o menu já conta como fechado
    if (!menu || (!menu.hidden && !menu.classList.contains('is-closing')) === open) return;
    clearTimeout(menuTimer);
    menu.classList.remove('is-closing');
    openBtn?.setAttribute('aria-expanded', String(open));
    root.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      closeBtn?.focus();
      return;
    }
    openBtn?.focus({ preventScroll: true });
    // Sai a deslizar antes de esconder
    if (!motion) {
      menu.hidden = true;
      return;
    }
    menu.classList.add('is-closing');
    menuTimer = setTimeout(() => {
      menu.hidden = true;
      menu.classList.remove('is-closing');
    }, 270);
  };
  openBtn?.addEventListener('click', () => setMenu(true));
  closeBtn?.addEventListener('click', () => setMenu(false));
  menu?.addEventListener('click', (e) => {
    if (e.target === menu || e.target.closest('a')) setMenu(false);
  });
  // O Tab fica dentro do menu enquanto ele está aberto
  menu?.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = $$('a[href], button:not([disabled])', menu);
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Seletor de idioma: fecha ao clicar fora; a escolha fica guardada também sem passar pelo servidor
  document.addEventListener('click', (e) => {
    if (langMenu?.open && !langMenu.contains(e.target)) langMenu.open = false;
  });
  $$('.lang-link').forEach((a) =>
    a.addEventListener('click', () => {
      const lang = new URL(a.href).searchParams.get('lang');
      if (lang) document.cookie = `jlang=${lang}; path=/; max-age=31536000; samesite=lax${location.protocol === 'https:' ? '; secure' : ''}`;
    }),
  );

  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (menu && !menu.hidden) setMenu(false);
    if (langMenu?.open) {
      langMenu.open = false;
      $('summary', langMenu)?.focus();
    }
  });

  // ---------- Animações ao rolar ----------

  const revealables = $$('[data-reveal]');
  const reveal = (el) => el.classList.add('is-in');
  if (hasIO && motion) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          reveal(e.target);
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
    for (const list of groups.values())
      list.forEach((el, i) => {
        if (!el.style.getPropertyValue('--reveal-delay')) el.style.setProperty('--reveal-delay', `${(i % 3) * 90}ms`);
      });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach(reveal);
  }

  // ---------- Números: contam até ao valor quando aparecem ----------

  const stats = $('[data-stats]');
  const counters = stats ? $$('[data-to]', stats).filter((el) => Number.isFinite(parseInt(el.dataset.to, 10))) : [];
  if (counters.length && hasIO && motion) {
    counters.forEach((el) => {
      el.textContent = '0';
    });
    const run = () => {
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / 1700);
        const k = 1 - (1 - p) ** 4;
        counters.forEach((el) => {
          el.textContent = String(Math.round(parseInt(el.dataset.to, 10) * k));
        });
        if (p < 1) requestAnimationFrame(tick);
        else stats.classList.add('is-done');
      };
      requestAnimationFrame(tick);
    };
    const sio = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        sio.disconnect();
        // Na abertura da página espera o cartão dos números aparecer
        setTimeout(run, Math.max(0, 750 - performance.now()));
      },
      { threshold: 0.15 },
    );
    sio.observe(stats);
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
    if (hasIO) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !userPaused) heroVideo.play().catch(() => setPaused(true));
        else if (!e.isIntersecting) heroVideo.pause();
      }).observe(heroVideo);
    }
  }

  // ---------- Obras: vídeos que só carregam quando aparecem ----------

  if (hasIO) {
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
    $$('video[data-src]').forEach((v) => vio.observe(v));
  }

  // ---------- Obras: filtros e "ver mais" ----------

  const grid = $('[data-works]');
  const tiles = grid ? $$('.tile', grid) : [];
  const more = $('[data-works-more]');
  const moreWrap = more?.parentElement;
  let expanded = false;
  let filter = 'all';
  const setCollapsed = () => grid?.classList.toggle('is-collapsed', Boolean(more) && filter === 'all' && !expanded);
  setCollapsed();

  more?.addEventListener('click', () => {
    expanded = !expanded;
    setCollapsed();
    more.setAttribute('aria-expanded', String(expanded));
    $('span', more).textContent = expanded ? more.dataset.less : more.dataset.more;
    if (!expanded) grid.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });

  const filterBtns = $$('[data-filter]');
  filterBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      if (btn.dataset.filter === filter) return;
      filter = btn.dataset.filter;
      filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      // Depois de filtrar, as obras entram só com o fade em cascata (sem a cortina)
      grid.classList.add('is-filtered');
      let n = 0;
      for (const t of tiles) {
        const show = filter === 'all' || t.dataset.cat === filter;
        t.hidden = !show;
        if (!show) continue;
        reveal(t);
        // As obras que ficam entram de novo em cascata
        if (motion && t.animate)
          t.animate([{ opacity: 0, transform: 'translateY(22px) scale(0.98)' }, { opacity: 1, transform: 'none' }], {
            duration: 650,
            delay: Math.min(n++, 8) * 55,
            easing: 'cubic-bezier(0.22, 0.7, 0.12, 1)',
            fill: 'backwards',
          });
      }
      if (moreWrap) moreWrap.hidden = filter !== 'all';
      setCollapsed();
    }),
  );

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
    let order = [];
    let pos = 0;
    let opener = null;

    const media = (w) => {
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
      return el;
    };

    const show = (p, dir = '') => {
      pos = (p + order.length) % order.length;
      const w = works[order[pos]];
      stage.dataset.dir = dir;
      stage.replaceChildren(media(w));
      title.textContent = w.title;
      meta.textContent = [w.status, w.meta].filter(Boolean).join(' · ');
      count.textContent = fmt(T.works?.of || '{n} / {total}', { n: pos + 1, total: order.length });
      // Pré-carrega a foto seguinte
      const next = works[order[(pos + 1) % order.length]];
      if (next.kind === 'image') {
        const img = new Image();
        if (next.srcset) {
          img.srcset = next.srcset;
          img.sizes = '100vw';
        }
        img.src = next.src;
      }
    };

    // Navega pelas obras que estão à vista com o filtro escolhido
    const open = (i, from) => {
      order = tiles.filter((t) => !t.hidden).map((t) => Number($('[data-work]', t)?.dataset.work));
      if (!order.includes(i)) order = works.map((_, k) => k);
      opener = from;
      show(order.indexOf(i));
      root.style.overflow = 'hidden';
      box.showModal();
    };

    const close = () => {
      if (!box.open || box.classList.contains('is-closing')) return;
      if (!motion) return box.close();
      box.classList.add('is-closing');
      setTimeout(() => {
        box.classList.remove('is-closing');
        box.close();
      }, 240);
    };
    box.addEventListener('close', () => {
      stage.textContent = '';
      root.style.overflow = '';
      opener?.focus({ preventScroll: true });
    });
    // Esc também fecha com o fade
    box.addEventListener('cancel', (e) => {
      e.preventDefault();
      close();
    });
    $('[data-prev]', box).addEventListener('click', () => show(pos - 1, 'prev'));
    $('[data-next]', box).addEventListener('click', () => show(pos + 1, 'next'));
    $('[data-close]', box).addEventListener('click', close);
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(pos - 1, 'prev');
      if (e.key === 'ArrowRight') show(pos + 1, 'next');
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
      if (Math.abs(dx) > 50) show(pos + (dx < 0 ? 1 : -1), dx < 0 ? 'next' : 'prev');
    });

    $$('[data-work]').forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        open(Number(a.dataset.work), a);
      }),
    );
    // Botão "ver a equipa em obra" do topo
    $$('[data-play]').forEach((b) =>
      b.addEventListener('click', (e) => {
        e.preventDefault();
        open(Number(b.dataset.play), b);
      }),
    );
  }

  // ---------- Cartões: luz âmbar que segue o rato ----------

  if (motion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.svc, .role').forEach((card) =>
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${Math.round(e.clientX - r.left)}px`);
        card.style.setProperty('--my', `${Math.round(e.clientY - r.top)}px`);
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

  // ---------- Barra do telemóvel e WhatsApp no computador: aparecem depois do topo e somem perto do formulário ----------

  const floats = [$('[data-mobile-bar]'), $('[data-wa-float]')].filter(Boolean);
  const top = $('.hero, .page-head');
  const quote = $('.quote');
  const footer = $('.ftr');
  if (floats.length && hasIO) {
    const seen = new Map();
    const watch = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target, e.isIntersecting);
        const pastTop = top ? seen.get(top) === false : true;
        const nearForm = (quote && seen.get(quote)) || (footer && seen.get(footer));
        floats.forEach((el) => el.classList.toggle('is-on', pastTop && !nearForm));
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    [top, quote, footer].filter(Boolean).forEach((el) => watch.observe(el));
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
