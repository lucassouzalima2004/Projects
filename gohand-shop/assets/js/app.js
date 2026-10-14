/* =============================================================================
   Comportamento do site. Os textos e contatos vêm de content.js (window.SITE);
   normalmente não é preciso mexer neste arquivo.
   ========================================================================== */
(function () {
  'use strict';

  var S = window.SITE;
  if (!S) {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<p style="position:relative;z-index:99;margin:0;padding:16px;background:#8C1D18;color:#fff;font:16px/1.4 system-ui,sans-serif">' +
        'Não foi possível ler assets/js/content.js. Confira se não falta vírgula ou aspas na última edição.</p>'
    );
    return;
  }

  // Valores padrão para o site não quebrar se algum campo for apagado do content.js
  S.brand = S.brand || 'GoHand Shop';
  S.location = Object.assign({ name: '', in: '', base: '' }, S.location);
  S.quote = Object.assign({ kinds: [], frequency: [], volume: [] }, S.quote);
  ['areas', 'services', 'promises', 'steps', 'faq'].forEach((k) => { if (!Array.isArray(S[k])) S[k] = []; });

  document.documentElement.classList.add('js');

  /* ------------------------------------------------------------ helpers */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* armazenamento indisponível */ } },
  };
  const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const icon = (id, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

  /* ------------------------------------------------------------ idioma */
  const state = { lang: initialLang() };

  function initialLang() {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'pt' || q === 'en') return q;
    const saved = store.get('gohand-lang');
    if (saved === 'pt' || saved === 'en') return saved;
    const first = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    return /^pt\b/i.test(first) ? 'pt' : 'en';
  }

  const L = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[state.lang] ?? v.en ?? '' : v ?? '');
  const dict = () => S.text[state.lang] || S.text.en;
  const t = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict());

  function fill(str, extra) {
    const tokens = Object.assign(
      {
        brand: S.brand,
        phone: prettyPhone(telNumber()),
        place: L(S.location.name),
        area: L(S.location.in),
        base: S.location.base,
      },
      extra
    );
    return String(str ?? '')
      .replace(/\{(\w+)\}/g, (m, k) => (k in tokens ? tokens[k] : m))
      .replace(/[ \t]+([.,])/g, '$1')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\.\./g, '.') // "in the U.S." no fim da frase
      .replace(/·\s*$/, '')
      .trim();
  }
  const tt = (path, extra) => fill(t(path), extra);

  // *texto* vira a faixa inclinada do logo
  const rich = (str) => esc(str).replace(/\*([^*]+)\*/g, '<span class="tag">$1</span>').replace(/\n/g, '<br>');

  /* ------------------------------------------------------------ contato */
  const digits = (v) => String(v || '').replace(/\D/g, '');
  const waNumber = () => digits(S.whatsapp);
  const telNumber = () => digits(S.phone) || waNumber();

  function prettyPhone(n) {
    if (!n) return '';
    if (n.length === 11 && n[0] === '1') return `(${n.slice(1, 4)}) ${n.slice(4, 7)}-${n.slice(7)}`;
    if (n.length === 10) return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
    if (n.startsWith('55') && n.length >= 12) return `+55 ${n.slice(2, 4)} ${n.slice(4, -4)}-${n.slice(-4)}`;
    return '+' + n;
  }

  const waLink = (text) => `https://wa.me/${waNumber()}${text ? '?text=' + encodeURIComponent(text) : ''}`;
  const telLink = () => `tel:+${telNumber()}`;

  /* ------------------------------------------------------------ textos */
  function applyTexts() {
    const html = document.documentElement;
    html.lang = state.lang === 'pt' ? 'pt-BR' : 'en-US';

    $$('[data-t]').forEach((el) => {
      const v = t(el.dataset.t);
      if (typeof v === 'string') el.textContent = fill(v);
    });
    $$('[data-t-rich]').forEach((el) => {
      const v = t(el.dataset.tRich);
      if (typeof v === 'string') el.innerHTML = rich(fill(v));
    });
    $$('[data-t-attr]').forEach((el) => {
      el.dataset.tAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':');
        const v = t(key);
        if (typeof v === 'string') el.setAttribute(attr, fill(v));
      });
    });

    document.title = tt('meta.title');
    const desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', tt('meta.description'));
    $('#nav').setAttribute('aria-label', state.lang === 'pt' ? 'Principal' : 'Main');
    $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));

    $$('[data-wa]').forEach((a) => { a.href = waLink(tt('wa.hello')); });
    $$('[data-tel]').forEach((a) => { a.href = telLink(); });
  }

  /* ------------------------------------------------------------ listas */
  const pad = (n) => String(n).padStart(2, '0');

  function renderTicker() {
    const items = t('ticker') || [];
    const group = items.concat(items).map((x) => `<span class="ticker__item">${esc(x)}</span>`).join('');
    $('#ticker').innerHTML = group + group;
  }

  function renderServices() {
    $('#services-list').innerHTML = S.services
      .map((s, i) => {
        const title = L(s.title);
        return `<li class="svc" style="--i:${i}">
          <span class="svc__num" aria-hidden="true">${pad(i + 1)}</span>
          <span class="svc__icon" aria-hidden="true">${icon(s.icon || 'box')}</span>
          <h3 class="svc__title">${esc(title)}</h3>
          <p class="svc__text">${esc(L(s.text))}</p>
          <a class="svc__cta" href="${esc(waLink(tt('wa.about', { service: title })))}" target="_blank" rel="noopener">
            ${esc(tt('services.cta'))}<span class="sr-only"> · ${esc(title)}</span>${icon('arrow')}
          </a>
        </li>`;
      })
      .join('');
  }

  function renderPromises() {
    $('#promises-list').innerHTML = S.promises
      .map(
        (p, i) => `<li class="promise" style="--i:${i}">
          <div class="promise__top">
            <span class="promise__icon">${icon(p.icon || 'check')}</span>
            <span class="promise__n" aria-hidden="true">${pad(i + 1)}/${pad(S.promises.length)}</span>
          </div>
          <h3 class="promise__title">${esc(L(p.title))}</h3>
          <p class="promise__text">${esc(L(p.text))}</p>
        </li>`
      )
      .join('');
  }

  function renderSteps() {
    const reached = new Set($$('#steps-list .step.is-reached').map((el) => el.dataset.i));
    $('#steps-list').innerHTML = S.steps
      .map(
        (s, i) => `<li class="step${reached.has(String(i)) ? ' is-reached' : ''}" data-i="${i}">
          <span class="step__dot" aria-hidden="true">${icon('check')}</span>
          <span class="step__status">${esc(tt('how.stepLabel'))} ${pad(i + 1)} · ${esc(L(s.status))}</span>
          <h3 class="step__title">${esc(L(s.title))}</h3>
          <p class="step__text">${esc(L(s.text))}</p>
        </li>`
      )
      .join('');
  }

  function renderFaq() {
    const open = new Set($$('#faq-list details[open]').map((d) => d.dataset.i));
    $('#faq-list').innerHTML = S.faq
      .map(
        (f, i) => `<details class="qa" data-i="${i}"${open.has(String(i)) ? ' open' : ''}>
          <summary><span>${esc(L(f.q))}</span><span class="qa__icon" aria-hidden="true">${icon('plus')}</span></summary>
          <p class="qa__a">${esc(fill(L(f.a)))}</p>
        </details>`
      )
      .join('');
  }

  function renderArea() {
    const section = $('#onde');
    const has = S.areas.length > 0;
    section.hidden = !has;
    $$('[data-needs-areas]').forEach((a) => { a.hidden = !has; });
    if (!has) return;
    $('#area-base').textContent = S.location.base ? tt('area.base') : '';
    $('#area-list').innerHTML = S.areas
      .map((c, i) => `<li style="--i:${i}">${icon('pin')}${esc(L(c))}</li>`)
      .join('');
  }

  function renderContact() {
    const rows = [
      { icon: 'wa', label: tt('contact.whatsapp'), value: prettyPhone(waNumber()), href: waLink(tt('wa.hello')), ext: true },
      { icon: 'phone', label: tt('contact.phone'), value: prettyPhone(telNumber()), href: telLink() },
    ];
    if (S.email) rows.push({ icon: 'mail', label: tt('contact.email'), value: S.email, href: 'mailto:' + S.email });
    if (S.instagram) {
      const user = String(S.instagram).replace(/^@/, '');
      rows.push({ icon: 'ig', label: tt('contact.instagram'), value: '@' + user, href: 'https://instagram.com/' + encodeURIComponent(user), ext: true });
    }
    if (S.hours) rows.push({ icon: 'clock', label: tt('contact.hours'), value: L(S.hours) });

    $('#contact-list').innerHTML = rows
      .map((r, i) => {
        const inner = `${icon(r.icon)}<span><small>${esc(r.label)}</small><strong>${esc(r.value)}</strong></span>`;
        return r.href
          ? `<li style="--i:${i}"><a class="contact__item" href="${esc(r.href)}"${r.ext ? ' target="_blank" rel="noopener"' : ''}>${inner}</a></li>`
          : `<li style="--i:${i}"><div class="contact__item">${inner}</div></li>`;
      })
      .join('');
  }

  /* ------------------------------------------------------------ código de barras */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed || 1;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  function barcode(seed) {
    const r = rng(hash(seed));
    let x = 0;
    let bars = '';
    const bar = (w) => { bars += `<rect x="${x}" width="${w}" height="60"/>`; x += w; };
    bar(2); x += 1; bar(1); x += 1; bar(2); x += 2;
    for (let i = 0; i < 34; i++) {
      bar(1 + Math.floor(r() * 3));
      x += 1 + Math.floor(r() * 2.4);
    }
    x += 1; bar(2); x += 1; bar(1); x += 1; bar(2);
    const nums = String(hash(seed + '#')).padStart(10, '0').slice(0, 10);
    return `<svg viewBox="0 0 ${x} 60" preserveAspectRatio="none" fill="#141414">${bars}</svg>` +
      `<span class="barcode__digits">${nums.slice(0, 1)} ${nums.slice(1, 6)} ${nums.slice(6)}</span>`;
  }

  /* ------------------------------------------------------------ etiqueta do topo */
  const label = {
    el: $('#hero-label'),
    visual: $('.hero__visual'),
    path: $('#route-path'),
    dash: $('.route__dash'),
    mover: $('#route-mover'),
    step: -1,
    times: ['08:12', '09:40', '10:05', '10:31'],
  };

  function renderLabel() {
    const statuses = t('label.statuses') || [];
    $('#label-steps').innerHTML = statuses
      .map((s, i) => `<li data-i="${i}"><span>${esc(s)}</span><time>${i <= label.step ? label.times[i] : '--:--'}</time></li>`)
      .join('');
    setLabelStep(label.step, true);
  }

  function setLabelStep(n, force) {
    if (n === label.step && !force) return;
    label.step = n;
    $$('#label-steps li').forEach((li, i) => {
      li.classList.toggle('is-done', i < n || (i === n && n === 3));
      li.classList.toggle('is-now', i === n && n < 3);
      li.querySelector('time').textContent = i <= n ? label.times[i] : '--:--';
    });
    label.el.classList.toggle('is-delivered', n === 3);
    label.visual.classList.toggle('is-arrived', n === 3);
  }

  function setRoute(p) {
    const len = label.path.getTotalLength();
    const pt = label.path.getPointAtLength(p * len);
    label.mover.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    label.dash.style.strokeDashoffset = String(1 - p);
  }

  function runLabel() {
    const code = 'GH-' + new Date().getFullYear() + '-' + String(hash(String(Date.now())) % 10000).padStart(4, '0');
    $('#label-code').textContent = code;
    $('#label-barcode').innerHTML = barcode(code);

    if (!motionOK()) {
      setRoute(1);
      setLabelStep(3, true);
      return;
    }

    const TRAVEL = 6200;
    const HOLD = 2600;
    const CYCLE = TRAVEL + HOLD;
    const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
    let start = null;
    let visible = true;

    new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }).observe(label.visual);

    const frame = (now) => {
      if (start === null) start = now + 900; // espera a etiqueta entrar
      const t0 = now - start;
      if (visible && t0 >= 0) {
        const tc = t0 % CYCLE;
        const k = Math.min(1, tc / TRAVEL);
        setRoute(ease(k));
        setLabelStep(k >= 1 ? 3 : k > 0.62 ? 2 : k > 0.22 ? 1 : 0);
      }
      requestAnimationFrame(frame);
    };
    setRoute(0);
    setLabelStep(0, true);
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------ orçamento */
  const form = $('#quote-form');

  function chipGroup(name, options) {
    const prev = form.querySelector(`input[name="${name}"]:checked`);
    const prevI = prev ? Number(prev.dataset.i) : -1;
    return options
      .map(
        (o, i) => `<label class="chip"><input type="radio" name="${name}" value="${esc(L(o))}" data-i="${i}"${i === prevI ? ' checked' : ''}><span>${esc(L(o))}</span></label>`
      )
      .join('');
  }

  function renderQuote() {
    $('#chips-kind').innerHTML = chipGroup('kind', S.quote.kinds);
    $('#chips-frequency').innerHTML = chipGroup('frequency', S.quote.frequency);
    $('#chips-volume').innerHTML = chipGroup('volume', S.quote.volume);
    $('#quote-perks').innerHTML = (t('quote.perks') || []).map((p) => `<li>${icon('check')}${esc(p)}</li>`).join('');
    updateQuoteCode();
  }

  function updateQuoteCode() {
    const data = new FormData(form);
    const seed = ['name', 'company', 'pickup', 'dropoff'].map((k) => data.get(k) || '').join('|');
    $('#quote-code').textContent = 'Q-' + String(hash(seed) % 100000).padStart(5, '0');
    $('#quote-barcode').innerHTML = barcode(seed || 'gohand');
  }

  function quoteMessage() {
    const data = new FormData(form);
    const val = (k) => String(data.get(k) || '').trim();
    const lines = [
      ['quote.name', val('name')],
      ['quote.company', val('company')],
      ['quote.pickup', val('pickup')],
      ['quote.dropoff', val('dropoff')],
      ['quote.kind', val('kind')],
      ['quote.frequency', val('frequency')],
      ['quote.volume', val('volume')],
      ['quote.notes', val('notes')],
    ]
      .filter(([, v]) => v)
      .map(([k, v]) => `• ${tt(k).replace(/\?$/, '')}: ${v}`);
    return [tt('quote.msgIntro'), '', ...lines].join('\n');
  }

  form.addEventListener('input', updateQuoteCode);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name;
    const err = $('#quote-error');
    if (!name.value.trim()) {
      err.textContent = tt('quote.needName');
      err.hidden = false;
      name.setAttribute('aria-invalid', 'true');
      name.focus();
      return;
    }
    err.hidden = true;
    name.removeAttribute('aria-invalid');
    const url = waLink(quoteMessage());
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;
  });
  form.elements.name.addEventListener('input', () => {
    if (form.elements.name.value.trim()) {
      $('#quote-error').hidden = true;
      form.elements.name.removeAttribute('aria-invalid');
    }
  });

  /* ------------------------------------------------------------ dados para o Google */
  function renderSchema() {
    let tag = $('#schema');
    if (!tag) {
      tag = document.createElement('script');
      tag.type = 'application/ld+json';
      tag.id = 'schema';
      document.head.appendChild(tag);
    }
    const data = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: S.brand,
      description: tt('meta.description'),
      telephone: '+' + telNumber(),
      url: window.location.origin + window.location.pathname,
      areaServed: S.areas.length ? S.areas.map(L) : L(S.location.name) || undefined,
      sameAs: S.instagram ? ['https://instagram.com/' + String(S.instagram).replace(/^@/, '')] : undefined,
      email: S.email || undefined,
    };
    tag.textContent = JSON.stringify(data);
  }

  /* ------------------------------------------------------------ tudo junto */
  function render() {
    applyTexts();
    renderTicker();
    renderServices();
    renderPromises();
    renderSteps();
    renderFaq();
    renderArea();
    renderContact();
    renderLabel();
    renderQuote();
    renderSchema();
    observeReveal();
  }

  $$('[data-lang]').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.dataset.lang === state.lang) return;
      state.lang = b.dataset.lang;
      store.set('gohand-lang', state.lang);
      render();
      $$('[data-reveal], .services__grid, .why__list, .area__chips, .contact__list').forEach((el) => el.classList.add('is-in'));
    })
  );

  /* ------------------------------------------------------------ topo e menu */
  const header = $('.site-header');
  const menuBtn = $('.menu-btn');
  const bar = $('.mobile-bar');

  // A barra fixa do celular aparece depois que os botões do topo saem da tela
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    bar.classList.toggle('is-visible', window.scrollY > 380 && !document.body.classList.contains('nav-open'));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    document.body.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', tt(open ? 'ui.close' : 'ui.menu'));
    onScroll();
  }
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
  $$('#nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      setMenu(false);
      menuBtn.focus();
    }
  });
  window.matchMedia('(min-width: 921px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // Link do menu ativo conforme a seção na tela
  const navLinks = $$('#nav a[href^="#"]:not([data-wa])');
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  navLinks.forEach((a) => {
    const target = $(a.getAttribute('href'));
    if (target) spy.observe(target);
  });
  spy.observe($('.hero')); // no topo, nenhum item fica marcado

  /* ------------------------------------------------------------ animações de entrada */
  const revealIO = 'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            en.target.classList.add('is-in');
            revealIO.unobserve(en.target);
          });
        },
        { rootMargin: '0px 0px -12% 0px' }
      )
    : null;

  function observeReveal() {
    $$('[data-reveal], .services__grid, .why__list, .area__chips, .contact__list').forEach((el) => {
      if (el.classList.contains('is-in')) return;
      if (revealIO) revealIO.observe(el);
      else el.classList.add('is-in');
    });
  }

  // Os passos "acendem" um a um, como um rastreio
  const track = $('#track');
  if ('IntersectionObserver' in window) {
    const trackIO = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        trackIO.disconnect();
        S.steps.forEach((s, i) => {
          // busca o passo na hora: a lista é refeita quando o idioma muda
          setTimeout(() => {
            const el = $$('#steps-list .step')[i];
            if (el) el.classList.add('is-reached');
          }, motionOK() ? 250 + i * 520 : 0);
        });
      },
      { rootMargin: '0px 0px -30% 0px' }
    );
    trackIO.observe(track);
  } else {
    $$('#steps-list .step').forEach((s) => s.classList.add('is-reached'));
  }

  $('#year').textContent = String(new Date().getFullYear());

  render();
  runLabel();
})();
