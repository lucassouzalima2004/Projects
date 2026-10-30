/* Bora Signs: smooth scrolling, entrance animations, menus, the van wrap slider and the forms. */
(() => {
  const d = document;
  const root = d.documentElement;
  const body = d.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const $ = (sel, el = d) => el.querySelector(sel);
  const $$ = (sel, el = d) => [...el.querySelectorAll(sel)];
  const track = (event, data) => window.fbq && window.fbq('track', event, data);

  /* ---------- smooth scroll ---------- */

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const scrollToEl = (el) => {
    if (lenis) lenis.scrollTo(el, { offset: -90, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = d.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(target);
    history.pushState(null, '', url.hash);
  });

  /* ---------- scroll loop ---------- */

  const onScroll = new Set();
  let lastY = scrollY;
  let velocity = 0;
  let ticking = false;
  const runScroll = () => {
    ticking = false;
    const y = scrollY;
    velocity = y - lastY;
    onScroll.forEach((fn) => fn(y, velocity));
    lastY = y;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(runScroll); } }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(runScroll));

  /* ---------- header ---------- */

  const hdr = $('[data-hdr]');
  const dock = $('[data-dock]');
  onScroll.add((y, v) => {
    hdr.classList.toggle('is-scrolled', y > 24);
    const busy = root.classList.contains('menu-open') || $('[data-mega].is-open');
    if (!busy && Math.abs(v) > 2) hdr.classList.toggle('is-hidden', v > 0 && y > 500);
    if (dock) dock.classList.toggle('is-on', y > innerHeight * 0.6);
  });

  // Services mega menu: opens on hover with a pointer, on click otherwise
  const mega = $('[data-mega]');
  if (mega) {
    const btn = $('button', mega);
    let timer;
    const set = (open) => { clearTimeout(timer); mega.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open); };
    btn.addEventListener('click', () => set(!mega.classList.contains('is-open')));
    if (finePointer) {
      mega.addEventListener('pointerenter', () => set(true));
      mega.addEventListener('pointerleave', () => { timer = setTimeout(() => set(false), 180); });
    }
    mega.addEventListener('focusout', (e) => { if (!mega.contains(e.relatedTarget)) set(false); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mega.classList.contains('is-open')) { set(false); btn.focus(); } });
  }

  // Full-screen menu on small screens
  const burger = $('[data-burger]');
  const menu = $('[data-menu]');
  function openMenu() {
    menu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    root.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    hdr.classList.remove('is-hidden');
    if (lenis) lenis.stop(); else body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.classList.remove('is-open');
    root.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    if (lenis) lenis.start(); else body.style.overflow = '';
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduce ? 0 : 700);
  }
  if (burger && menu) {
    burger.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); burger.focus(); } });
  }

  /* ---------- text split + reveals ---------- */

  // Wraps every word in two spans so it can slide up from behind a mask. Keeps <em> and other inline tags.
  function split(el) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = d.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const w = d.createElement('span');
            w.className = 'w';
            const inner = d.createElement('span');
            inner.className = 'w__in';
            inner.style.setProperty('--wi', i++);
            inner.textContent = part;
            w.append(inner);
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -4% 0px', threshold: 0.04 });

  $$('[data-split]').forEach((el) => {
    if (!reduce) split(el);
    if (!el.hasAttribute('data-split-now')) io.observe(el);
  });
  $$('[data-reveal]').forEach((el) => io.observe(el));

  const loaded = () => {
    body.classList.add('is-loaded');
    $$('[data-split-now]').forEach((el) => el.classList.add('is-in'));
  };
  // Wait for the fonts so headings don't animate in one typeface and land in another
  Promise.race([d.fonts ? d.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 500))])
    .then(() => requestAnimationFrame(loaded));

  /* ---------- counters ---------- */

  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target;
      const to = +el.dataset.count;
      if (reduce) return;
      const start = performance.now();
      const dur = 1800;
      const step = (t) => {
        const p = clamp((t - start) / dur, 0, 1);
        el.textContent = Math.round(to * (1 - Math.pow(2, -10 * p)));
        if (p < 1) requestAnimationFrame(step); else el.textContent = to;
      };
      el.textContent = '0';
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- page hero image parallax ---------- */

  const pmedia = $('[data-parallax]');
  if (pmedia && !reduce) {
    const img = $('img', pmedia);
    onScroll.add(() => {
      const r = pmedia.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      img.style.setProperty('--py', `${(r.top + r.height / 2 - innerHeight / 2) * -0.12}px`);
    });
  }

  /* ---------- tickers speed up with scrolling ---------- */

  const tickerEls = $$('[data-ticker]');
  const tickers = tickerEls.map((el) => (el.getAnimations ? el.getAnimations()[0] : null)).filter(Boolean);
  if (tickers.length && !reduce) {
    let rate = 1;
    let dir = 1;
    let applied = 1;
    let running = false;
    const loop = () => {
      if (!running) return;
      const target = 1 + Math.min(Math.abs(velocity) * 0.12, 6);
      if (Math.abs(velocity) > 1) dir = velocity > 0 ? 1 : -1;
      rate += (target - rate) * 0.08;
      velocity *= 0.9;
      const next = rate * dir;
      if (Math.abs(next - applied) > 0.02) { applied = next; tickers.forEach((a) => { a.playbackRate = next; }); }
      requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running) requestAnimationFrame(loop);
    }).observe(tickerEls[0].closest('.ticker'));
  }

  /* ---------- process line ---------- */

  $$('[data-steps]').forEach((wrap) => {
    const steps = $$('.step', wrap);
    const update = () => {
      const r = wrap.getBoundingClientRect();
      const p = clamp((innerHeight * 0.72 - r.top) / (r.height * 0.9), 0, 1);
      wrap.style.setProperty('--p', p);
      steps.forEach((s, i) => s.classList.toggle('is-lit', p >= i / steps.length + 0.02 || p === 1));
    };
    onScroll.add(update);
    update();
  });

  /* ---------- horizontal work strip ---------- */

  const hs = $('[data-hscroll]');
  if (hs) {
    const trackEl = $('[data-track]', hs);
    const viewport = $('.work__viewport', hs);
    const bar = $('.work__bar', hs);
    const wide = matchMedia('(min-width: 900px)');
    let dist = 0;
    const measure = () => {
      const pin = wide.matches && !reduce;
      hs.classList.toggle('is-pinned', pin);
      if (!pin) { hs.style.height = ''; trackEl.style.transform = ''; return; }
      dist = Math.max(0, trackEl.scrollWidth - innerWidth);
      hs.style.height = `${innerHeight + dist}px`;
    };
    const update = () => {
      if (!hs.classList.contains('is-pinned')) return;
      const r = hs.getBoundingClientRect();
      const p = clamp(-r.top / (hs.offsetHeight - innerHeight || 1), 0, 1);
      trackEl.style.transform = `translate3d(${-p * dist}px,0,0)`;
      bar.style.setProperty('--wp', p);
    };
    viewport.addEventListener('scroll', () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      bar.style.setProperty('--wp', max ? viewport.scrollLeft / max : 0);
    }, { passive: true });
    measure();
    addEventListener('resize', () => { measure(); update(); });
    addEventListener('load', () => { measure(); update(); });
    onScroll.add(update);
  }

  /* ---------- testimonials ---------- */

  const reviews = $('[data-reviews]');
  if (reviews) {
    const slides = $$('[data-review]', reviews);
    const dots = $$('[data-review-dot]', reviews);
    let idx = 0;
    let timer;
    let visible = false;
    const show = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => { s.classList.toggle('is-active', i === idx); s.setAttribute('aria-hidden', i !== idx); });
      dots.forEach((b, i) => b.setAttribute('aria-selected', i === idx));
    };
    const play = () => { clearInterval(timer); if (visible && !reduce) timer = setInterval(() => show(idx + 1), 7000); };
    dots.forEach((b, i) => b.addEventListener('click', () => { show(i); play(); }));
    reviews.addEventListener('pointerenter', () => clearInterval(timer));
    reviews.addEventListener('pointerleave', play);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; play(); }).observe(reviews);
  }

  /* ---------- FAQ open/close animation ---------- */

  $$('.faq__item').forEach((item) => {
    const summary = $('summary', item);
    const answer = $('.faq__a', item);
    summary.addEventListener('click', (e) => {
      if (reduce || !answer.animate) return;
      e.preventDefault();
      const ease = 'cubic-bezier(.16,1,.3,1)';
      if (item.open) {
        const a = answer.animate([{ height: `${answer.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: ease });
        a.onfinish = () => { item.open = false; };
      } else {
        item.open = true;
        answer.animate([{ height: '0px', opacity: 0 }, { height: `${answer.offsetHeight}px`, opacity: 1 }], { duration: 520, easing: ease });
      }
    });
  });

  /* ---------- pointer niceties ---------- */

  if (finePointer && !reduce) {
    $$('[data-spot]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.32;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // The chameleon keeps an eye on you
  const pupils = $$('.pupil').map((p) => {
    const eye = $('circle[mask]', p.ownerSVGElement);
    return { el: p, svg: p.ownerSVGElement, cx: +eye.getAttribute('cx'), cy: +eye.getAttribute('cy') };
  });
  if (pupils.length && !reduce) {
    let px = innerWidth / 2;
    let py = innerHeight / 3;
    let queued = false;
    const look = () => {
      queued = false;
      pupils.forEach((p) => {
        const r = p.svg.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight || !r.width) return;
        const vb = p.svg.viewBox.baseVal;
        // the header logo draws the mark scaled inside a wider viewBox
        const k = p.svg.classList.contains('logo') ? 0.5066 : 1;
        const ex = r.left + (p.cx * k / vb.width) * r.width;
        const ey = r.top + ((p.cy * k + (k < 1 ? 2 : 0)) / vb.height) * r.height;
        const dx = px - ex;
        const dy = py - ey;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(dist / 10, 20);
        p.el.setAttribute('cx', (p.cx + (dx / dist) * reach).toFixed(1));
        p.el.setAttribute('cy', (p.cy + (dy / dist) * reach).toFixed(1));
      });
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(look); } };
    addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; queue(); }, { passive: true });
    onScroll.add(queue);
  }

  /* ---------- van wrap slider ---------- */

  const wc = $('[data-wrapcalc]');
  if (wc) {
    const min = +wc.dataset.min;
    const max = +wc.dataset.max;
    const step = +wc.dataset.step || 50;
    const tiers = JSON.parse(wc.dataset.tiers);
    const van = $('[data-van]', wc);
    const handle = $('[data-handle]', wc);
    const reveal = $('.van__reveal', wc);
    const out = { cov: $('[data-cov]', wc), tier: $('[data-tier]', wc), price: $('[data-price]', wc), quote: $('[data-quote]', wc) };
    // Where the van body starts and ends in the drawing (viewBox is 1000 wide)
    const BODY_FROM = 60;
    const BODY_LEN = 886;
    const fmt = (n) => `$${Math.round(n).toLocaleString('en-AU')}`;
    let shownPrice = (min + max) / 2;
    let targetPrice = shownPrice;
    let rolling = false;
    let touched = false;

    const roll = () => {
      shownPrice += (targetPrice - shownPrice) * 0.18;
      if (Math.abs(targetPrice - shownPrice) < 1) shownPrice = targetPrice;
      out.price.textContent = targetPrice === 0 && shownPrice < 1 ? '—' : fmt(Math.round(shownPrice / 10) * 10);
      if (shownPrice !== targetPrice) requestAnimationFrame(roll); else rolling = false;
    };

    const set = (pos) => {
      pos = clamp(pos, 0, 1);
      const x = pos * 1000;
      reveal.setAttribute('width', x.toFixed(1));
      van.style.setProperty('--pos', pos);
      const cov = clamp((x - BODY_FROM) / BODY_LEN, 0, 1);
      const tier = cov > 0 ? tiers.find((t) => cov <= t.upTo + 1e-9) || tiers[tiers.length - 1] : null;
      const price = cov > 0 ? Math.round((min + (max - min) * cov) / step) * step : 0;
      const pct = Math.round(cov * 100);
      out.cov.textContent = `${pct}%`;
      out.tier.textContent = tier ? tier.name : 'Plain van';
      wc.style.setProperty('--cov', cov);
      targetPrice = price;
      if (reduce) out.price.textContent = price ? fmt(price) : '—';
      else if (!rolling) { rolling = true; requestAnimationFrame(roll); }
      handle.setAttribute('aria-valuenow', pct);
      handle.setAttribute('aria-valuetext', tier ? `${pct}% wrapped: ${tier.name}, from ${fmt(price)}` : 'Plain van, no wrap');
      out.quote.href = `/contact?service=vehicle-signage${tier ? `&package=${encodeURIComponent(tier.name)}` : ''}`;
      wc.dataset.pos = pos;
    };

    const fromEvent = (e) => {
      const r = van.getBoundingClientRect();
      return (e.clientX - r.left) / r.width;
    };
    const touch = () => { if (!touched) { touched = true; wc.classList.add('is-touched'); } };
    let dragging = false;
    van.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      dragging = true;
      touch();
      van.setPointerCapture(e.pointerId);
      wc.classList.add('is-dragging');
      set(fromEvent(e));
    });
    van.addEventListener('pointermove', (e) => { if (dragging) set(fromEvent(e)); });
    const stop = () => { dragging = false; wc.classList.remove('is-dragging'); };
    van.addEventListener('pointerup', stop);
    van.addEventListener('pointercancel', stop);
    out.quote.addEventListener('click', () => track('Lead', { content_name: 'Van wrap slider' }));

    handle.addEventListener('keydown', (e) => {
      const pos = +wc.dataset.pos;
      const moves = { ArrowLeft: -0.025, ArrowDown: -0.025, ArrowRight: 0.025, ArrowUp: 0.025, PageDown: -0.1, PageUp: 0.1 };
      if (e.key in moves) set(pos + moves[e.key]);
      else if (e.key === 'Home') set(0);
      else if (e.key === 'End') set(1);
      else return;
      e.preventDefault();
      touch();
    });

    set(0.5);

    // First time it scrolls into view: drive in, then sweep the handle to show what it does
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      wc.classList.add('is-in');
      if (reduce) return;
      wc.classList.add('is-driving');
      setTimeout(() => wc.classList.remove('is-driving'), 1700);
      const keys = [[0, 0.5], [900, 0.5], [1900, 0.12], [3300, 0.96], [4400, 0.62]];
      const t0 = performance.now();
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const demo = (now) => {
        if (touched) return;
        const t = now - t0;
        let i = keys.findIndex((k) => k[0] > t);
        if (i === -1) { set(keys[keys.length - 1][1]); return; }
        const [ta, pa] = keys[i - 1];
        const [tb, pb] = keys[i];
        set(pa + (pb - pa) * ease((t - ta) / (tb - ta)));
        requestAnimationFrame(demo);
      };
      requestAnimationFrame(demo);
    }, { threshold: 0.45 }).observe(van);
  }

  /* ---------- forms ---------- */

  const params = new URLSearchParams(location.search);
  $$('[data-form]').forEach((form) => {
    const status = $('[data-status]', form);
    const say = (msg, kind = '') => { status.textContent = msg; status.className = `form__status${kind ? ` is-${kind}` : ''}`; };
    const service = $('[data-service]', form);
    if (service && params.get('service')) service.value = params.get('service');
    const message = $('[data-message]', form);
    if (message && params.get('package')) {
      message.value = `Hi, I'm interested in a ${params.get('package').toLowerCase()} for my vehicle.\n\nMake and model: \n`;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let firstBad = null;
      $$('[required]', form).forEach((f) => {
        const ok = f.value.trim() && (f.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
        f.closest('.field').classList.toggle('is-invalid', !ok);
        if (!ok && !firstBad) firstBad = f;
      });
      if (firstBad) { say('Please fill in the highlighted fields.', 'err'); firstBad.focus(); return; }
      if (form.elements._gotcha && form.elements._gotcha.value) return;

      const data = new FormData(form);
      const action = form.getAttribute('action') || '';
      if (action.startsWith('mailto:')) {
        const skip = new Set(['subject', '_gotcha', ...[...form.querySelectorAll('input[type=hidden]')].map((i) => i.name)]);
        const lines = [];
        const seen = new Set();
        for (const [k] of data) {
          if (skip.has(k) || seen.has(k)) continue;
          seen.add(k);
          const v = data.getAll(k).filter(Boolean).join(', ');
          if (!v) continue;
          const label = k === 'service' && service ? service.selectedOptions[0].text : null;
          lines.push(`${k[0].toUpperCase()}${k.slice(1).replace(/_/g, ' ')}: ${label || v}`);
        }
        const msg = data.get('message') || '';
        const text = lines.filter((l) => !l.startsWith('Message:')).join('\n') + (msg ? `\n\n${msg}` : '');
        location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(text)}`;
        say('Your email app should open with your message ready to send. If it doesn’t, call us on 0482 530 280.', 'ok');
        track('Contact');
        return;
      }

      const btn = $('button[type=submit]', form);
      btn.disabled = true;
      say('Sending…');
      try {
        const res = await fetch(action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        say('Thanks! Your message is on its way. We’ll get back to you shortly.', 'ok');
        track('Lead', { content_name: form.dataset.form });
      } catch (err) {
        say('Sorry, that didn’t send. Please call us on 0482 530 280 or email sales@borasigns.com.au.', 'err');
      } finally {
        btn.disabled = false;
      }
    });
    $$('input, textarea', form).forEach((f) => f.addEventListener('input', () => f.closest('.field') && f.closest('.field').classList.remove('is-invalid')));
  });

  // Calls and emails count as contacts in Meta ads
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (a) track('Contact', { content_name: a.href.startsWith('tel:') ? 'Phone' : 'Email' });
  });

  runScroll();
})();
