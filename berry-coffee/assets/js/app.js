/* =============================================================================
   Comportamento do site. Os textos, horários, cardápio e fotos vêm de
   content.js (window.SITE); normalmente não é preciso mexer neste arquivo.
   ========================================================================== */
(function () {
  'use strict';

  var S = window.SITE;
  if (!S) {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<p style="margin:0;padding:16px;background:#B42A44;color:#fff;font:16px/1.4 system-ui,sans-serif">' +
        'Não foi possível ler assets/js/content.js. Confira se não falta vírgula ou aspas na última edição.</p>'
    );
    return;
  }

  // Valores padrão para o site não quebrar se algum campo for apagado do content.js
  S.address = Object.assign({ street: '', town: '', county: '', eircode: '' }, S.address);
  S.social = Object.assign({ instagram: '', facebook: '', tripadvisor: '', google: '' }, S.social);
  S.instagram = Object.assign({ feedUrl: '', count: 12, posts: [] }, S.instagram);
  S.vouchers = Object.assign({ buyUrl: '' }, S.vouchers);
  S.hours = S.hours || {};
  S.specialDays = S.specialDays || {};
  ['window', 'favourites', 'menu', 'awards', 'reviews', 'ticker'].forEach((k) => { if (!Array.isArray(S[k])) S[k] = []; });

  /* ------------------------------------------------------------ helpers */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const store = {
    get(k) { try { return JSON.parse(window.localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* armazenamento indisponível */ } },
  };
  const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setAll = (sel, fn) => $$(sel).forEach(fn);
  const icon = (id, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} aria-hidden="true"><use href="#${id}"/></svg>`;

  /* ------------------------------------------------------------ links and contact */
  const digits = (s) => String(s || '').replace(/\D/g, '');
  // '085 737 2391' → '+353857372391' (número irlandês que começa com 0 ganha o +353)
  function intlPhone(s) {
    const raw = String(s || '').trim();
    const d = digits(raw);
    if (!d) return '';
    if (raw.charAt(0) === '+') return '+' + d;
    if (d.startsWith('00')) return '+' + d.slice(2);
    if (d.charAt(0) === '0') return '+353' + d.slice(1);
    return '+' + d;
  }
  const handle = () => String(S.social.instagram || '').replace(/^@/, '');
  const place = () => [S.name, S.address.street, S.address.town, [S.address.county, S.address.eircode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const igUrl = () => (handle() ? `https://www.instagram.com/${handle()}/` : '');
  const igDmUrl = () => (handle() ? `https://ig.me/m/${handle()}` : '');
  const directionsUrl = () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place())}`;
  const mapsUrl = () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place())}`;
  const waUrl = () => `https://wa.me/${intlPhone(S.whatsapp).slice(1)}?text=${encodeURIComponent(`Hi ${S.name}! `)}`;

  function link(sel, href, text) {
    setAll(sel, (a) => {
      if (!href) {
        (a.closest('li') || a).hidden = true;
        return;
      }
      a.href = href;
      if (text !== undefined) a.textContent = text;
    });
  }

  function renderContact() {
    link('[data-directions]', directionsUrl());
    link('[data-tel]', S.phone ? `tel:${intlPhone(S.phone)}` : '');
    link('[data-wa]', S.whatsapp ? waUrl() : '');
    link('[data-email]', S.email ? `mailto:${S.email}` : '');
    link('[data-ig]', igUrl());
    link('[data-ig-dm]', igDmUrl());
    link('[data-fb]', S.social.facebook);
    link('[data-tripadvisor]', S.social.tripadvisor);
    link('[data-review-google]', S.social.google || mapsUrl());
    setAll('[data-phone-text]', (el) => (el.textContent = S.phone || 'Call us'));
    setAll('[data-email-text]', (el) => (el.textContent = S.email || 'Email us'));
    setAll('[data-ig-handle]', (el) => (el.textContent = '@' + handle()));

    // Gift vouchers: o botão de compra online só aparece quando existe o link
    link('[data-voucher-mail]', S.email ? `mailto:${S.email}?subject=${encodeURIComponent('Gift voucher')}` : '');
    if (S.vouchers.buyUrl) {
      setAll('[data-voucher-buy]', (a) => {
        a.href = S.vouchers.buyUrl;
        a.hidden = false;
      });
      setAll('.vouchers__actions [data-tel]', (a) => a.classList.replace('btn--primary', 'btn--ghost'));
    }

    const a = S.address;
    $('#visit-address').innerHTML =
      `${esc(a.street)}, ${esc(a.town)}${a.county ? `, ${esc(a.county)}` : ''}` + (a.eircode ? `<small>Eircode ${esc(a.eircode)}</small>` : '');
    setAll('[data-address-lines]', (el) => (el.innerHTML = `${esc(a.street)}<br>${esc(a.town)}${a.county ? `, ${esc(a.county)}` : ''}${a.eircode ? `<br>${esc(a.eircode)}` : ''}`));

    if (S.notice) {
      $('#notice-text').textContent = S.notice;
      $('#notice').hidden = false;
    }
  }

  /* ------------------------------------------------------------ opening hours (Irish time) */
  const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const DAY_NAME = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
  const DAY_SHORT = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
  const toMin = (t) => {
    const [h, m] = String(t).split(':').map(Number);
    return h * 60 + (m || 0);
  };
  // '09:00' → '9am', '16:30' → '4:30pm'
  function fmtTime(t) {
    const [h, m] = String(t).split(':').map(Number);
    const suffix = h >= 12 && h < 24 ? 'pm' : 'am';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}${m ? ':' + String(m).padStart(2, '0') : ''}${suffix}`;
  }
  const isoDay = (d) => d.toISOString().slice(0, 10);
  const keyOf = (d) => DAYS[(d.getUTCDay() + 6) % 7];

  // Data e hora atuais na Irlanda. Para testar: index.html?now=2026-10-14T15:45
  function irishNow() {
    const forced = new URLSearchParams(window.location.search).get('now');
    const m = forced && forced.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    let y, mo, d, h, mi;
    if (m) {
      [y, mo, d, h, mi] = m.slice(1).map(Number);
    } else {
      try {
        const p = {};
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Dublin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
        }).formatToParts(new Date()).forEach((x) => (p[x.type] = x.value));
        [y, mo, d, h, mi] = [p.year, p.month, p.day, p.hour, p.minute].map(Number);
      } catch (e) {
        const n = new Date();
        [y, mo, d, h, mi] = [n.getFullYear(), n.getMonth() + 1, n.getDate(), n.getHours(), n.getMinutes()];
      }
    }
    const date = new Date(Date.UTC(y, mo - 1, d));
    return { date, minutes: (h % 24) * 60 + mi, key: keyOf(date) };
  }

  function hoursOn(date) {
    const special = S.specialDays[isoDay(date)];
    if (special === 'closed') return null;
    if (Array.isArray(special)) return special;
    const h = S.hours[keyOf(date)];
    return Array.isArray(h) && h.length === 2 ? h : null;
  }

  function status() {
    const now = irishNow();
    const today = hoursOn(now.date);
    if (today && now.minutes >= toMin(today[0]) && now.minutes < toMin(today[1])) {
      const left = toMin(today[1]) - now.minutes;
      const until = fmtTime(today[1]);
      if (left <= 30) return { state: 'soon', text: `Closing soon · open until ${until}`, short: `Closing at ${until}`, sign: ['Last orders soon!', 'Open'] };
      return { state: 'open', text: `Open now · until ${until}`, short: `Open · till ${until}`, sign: ['Come in, we’re', 'Open'] };
    }
    for (let i = 0; i < 8; i++) {
      const d = new Date(now.date.getTime() + i * 864e5);
      const h = hoursOn(d);
      if (!h || (i === 0 && now.minutes >= toMin(h[0]))) continue;
      const when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAY_NAME[keyOf(d)];
      const at = fmtTime(h[0]);
      return {
        state: 'closed',
        text: `Closed · opens ${when} at ${at}`,
        short: i === 0 ? `Opens at ${at}` : `Back ${i === 1 ? 'tomorrow' : DAY_SHORT[keyOf(d)]} ${at}`,
        sign: [i === 0 ? `See you at ${at}!` : 'Sorry, we’re', 'Closed'],
      };
    }
    return { state: 'closed', text: 'Closed for now', short: 'Closed', sign: ['Sorry, we’re', 'Closed'] };
  }

  // Agrupa dias seguidos com o mesmo horário: "Wed–Mon 9am–4pm · Closed Tue"
  function hourGroups() {
    const sig = (k) => (Array.isArray(S.hours[k]) ? S.hours[k].join('-') : 'closed');
    let start = 0;
    for (let i = 0; i < 7; i++) {
      if (sig(DAYS[i]) !== sig(DAYS[(i + 6) % 7])) { start = i; break; }
    }
    const groups = [];
    for (let n = 0; n < 7; n++) {
      const k = DAYS[(start + n) % 7];
      const last = groups[groups.length - 1];
      if (last && last.sig === sig(k)) last.days.push(k);
      else groups.push({ sig: sig(k), days: [k], hours: S.hours[k] });
    }
    return groups;
  }

  // openOnly: só os dias abertos ("Wed–Mon 9am–4pm"), para o selo da foto de destaque
  function hoursSummary(openOnly) {
    const label = (g) => (g.days.length === 7 ? 'Every day' : g.days.length === 1 ? DAY_SHORT[g.days[0]] : `${DAY_SHORT[g.days[0]]}–${DAY_SHORT[g.days[g.days.length - 1]]}`);
    const groups = hourGroups();
    const open = groups.filter((g) => g.sig !== 'closed').map((g) => `${label(g)} ${fmtTime(g.hours[0])}–${fmtTime(g.hours[1])}`);
    if (openOnly) return open.join(' · ');
    const closed = groups.filter((g) => g.sig === 'closed').map((g) => `Closed ${label(g)}`);
    return open.concat(closed).join(' · ');
  }

  // Cada linha mostra a próxima vez que aquele dia acontece, já com feriados e dias especiais
  function renderHours() {
    const now = irishNow();
    const offset = DAYS.indexOf(now.key);
    $('#hours-body').innerHTML = DAYS.map((k, n) => {
      const date = new Date(now.date.getTime() + ((n - offset + 7) % 7) * 864e5);
      const h = hoursOn(date);
      const special = S.specialDays[isoDay(date)] !== undefined;
      const today = n === offset;
      const label = h ? `${fmtTime(h[0])} – ${fmtTime(h[1])}` : 'Closed';
      return `<tr class="${today ? 'is-today' : ''}${h ? '' : ' is-closed'}"${today ? ' aria-current="date"' : ''}>
        <th scope="row">${DAY_NAME[k]}</th>
        <td>${special ? `<span class="hours__special">${date.getUTCDate()} ${date.toLocaleString('en-IE', { month: 'short', timeZone: 'UTC' })}</span> ` : ''}${label}</td>
      </tr>`;
    }).join('');
    setAll('[data-hours-summary]', (el) => (el.textContent = hoursSummary()));
  }

  function renderStatus() {
    const st = status();
    setAll('[data-status]', (el) => (el.dataset.state = st.state));
    setAll('[data-status-text]', (el) => (el.textContent = st.text));
    setAll('[data-status-short]', (el) => (el.textContent = st.short));
    const sign = $('#sign');
    sign.dataset.state = st.state;
    $('#sign-small').textContent = st.sign[0];
    $('#sign-big').textContent = st.sign[1];
  }

  /* ------------------------------------------------------------ the shop window (photo slideshow) */
  const slides = { list: [], current: 0, timer: null, playing: false, hold: false };

  function initSlides() {
    slides.list = S.window.filter((w) => w && w.img);
    const box = $('#slides');
    const dots = $('#slide-dots');
    // A primeira foto já vem no index.html (aparece mais rápido); é reaproveitada se for a mesma
    const poster = $('img', box);
    if (!slides.list.length) {
      $('.window__bar').hidden = true;
      return;
    }
    const reusePoster = !!poster && poster.getAttribute('src') === slides.list[0].img;
    if (poster && !reusePoster) poster.remove();
    slides.list.forEach((w, i) => {
      const reuse = i === 0 && reusePoster;
      const img = reuse ? poster : document.createElement('img');
      img.alt = w.alt || w.caption || '';
      img.width = 960;
      img.height = 1200;
      img.decoding = 'async';
      if (i === 0) {
        img.setAttribute('fetchpriority', 'high');
        img.src = w.img;
      } else {
        img.dataset.src = w.img;
      }
      if (!reuse) box.appendChild(img);

      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Photo ${i + 1} of ${slides.list.length}: ${w.caption || w.alt || ''}`);
      b.addEventListener('click', () => {
        showSlide(i, true);
        setPlaying(false);
      });
      dots.appendChild(b);
    });
    if (slides.list.length < 2) $('.window__controls').hidden = true;

    // As outras fotos carregam depois que a página abriu
    const loadRest = () =>
      $$('img[data-src]', box).forEach((img) => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    if (document.readyState === 'complete') setTimeout(loadRest, 400);
    else window.addEventListener('load', () => setTimeout(loadRest, 400));

    showSlide(0);
    $('#slides-toggle').addEventListener('click', () => setPlaying(!slides.playing));
    const win = $('#window');
    win.addEventListener('mouseenter', () => (slides.hold = true));
    win.addEventListener('mouseleave', () => (slides.hold = false));
    win.addEventListener('focusin', () => (slides.hold = true));
    win.addEventListener('focusout', () => (slides.hold = false));
    setPlaying(motionOK() && slides.list.length > 1);
  }

  function showSlide(i, announce) {
    const imgs = $$('#slides img');
    slides.current = (i + imgs.length) % imgs.length;
    imgs.forEach((img, n) => {
      const on = n === slides.current;
      img.classList.toggle('is-active', on);
      img.setAttribute('aria-hidden', String(!on));
      if (on && img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
    $$('#slide-dots button').forEach((b, n) => b.setAttribute('aria-current', String(n === slides.current)));
    const cap = $('#slide-caption');
    cap.setAttribute('aria-live', announce ? 'polite' : 'off');
    cap.textContent = slides.list[slides.current].caption || '';
  }

  function setPlaying(on) {
    slides.playing = on;
    clearInterval(slides.timer);
    const btn = $('#slides-toggle');
    btn.setAttribute('aria-label', on ? 'Pause slideshow' : 'Play slideshow');
    $('use', btn).setAttribute('href', on ? '#i-pause' : '#i-play');
    if (on) {
      slides.timer = setInterval(() => {
        if (!slides.hold && !document.hidden) showSlide(slides.current + 1);
      }, 5200);
    }
  }

  /* ------------------------------------------------------------ ticker */
  function renderTicker() {
    const items = S.ticker.length ? S.ticker : [S.tagline];
    const run = items.map((t) => `<span class="ticker__item">${esc(t)}${icon('tulip')}</span>`).join('');
    $('#ticker').innerHTML = run + run;
  }

  /* ------------------------------------------------------------ favourites */
  // Foto grande ao lado dos pratos, com o horário no selo
  function renderFeature() {
    const f = S.feature;
    const box = $('#feature');
    if (!f || !f.img) {
      box.hidden = true;
      return;
    }
    const when = hoursSummary(true);
    box.innerHTML = `<img src="${esc(f.img)}" width="960" height="1200" loading="lazy" decoding="async" alt="${esc(f.alt || f.title || '')}">
      ${when ? `<span class="feature__tag">${esc(when)}</span>` : ''}
      ${f.title || f.note ? `<figcaption>${f.title ? `<span class="feature__title">${esc(f.title)}</span>` : ''}${f.note ? `<span class="feature__note">${esc(f.note)}</span>` : ''}</figcaption>` : ''}`;
  }

  function renderFavourites() {
    const plates = $('#plates');
    plates.innerHTML = S.favourites
      .map(
        (f, i) => `<li class="plate-card" style="--i:${i}">
          <figure class="plate"><img src="${esc(f.img)}" width="640" height="640" loading="lazy" decoding="async" alt="${esc(f.alt || f.name)}"></figure>
          ${f.tag ? `<span class="plate-card__tag">${esc(f.tag)}</span>` : ''}
          <h3>${esc(f.name)}</h3>
          ${f.desc ? `<p>${esc(f.desc)}</p>` : ''}
        </li>`
      )
      .join('');
    if (!S.favourites.length) plates.hidden = true;
    if (!S.favourites.length && $('#feature').hidden) $('#favourites').hidden = true;

    // No celular os pratos rolam para o lado: a faixa precisa ser alcançável pelo teclado
    const sync = () => {
      if (plates.scrollWidth > plates.clientWidth + 1) plates.tabIndex = 0;
      else plates.removeAttribute('tabindex');
    };
    sync();
    window.addEventListener('resize', sync, { passive: true });
  }

  /* ------------------------------------------------------------ awards */
  // O primeiro prêmio é o destaque; os outros viram selos embaixo
  function renderAwards() {
    const list = S.awards.filter((a) => a && a.title);
    const top = list[0];
    if (!top) {
      $('.awards__grid').hidden = true;
      $('.award-badge').hidden = true;
      if (!S.reviews.length) $('#awards').hidden = true;
      return;
    }

    const photo = $('#award-photo');
    if (top.photo) {
      photo.innerHTML = `<img src="${esc(top.photo)}" width="800" height="1000" loading="lazy" decoding="async" alt="${esc(top.photoAlt || '')}">` +
        (top.caption ? `<figcaption>${esc(top.caption)}</figcaption>` : '');
    } else {
      photo.hidden = true;
    }

    $('#award-title').textContent = top.title;
    const year = $('#award-year');
    year.textContent = top.year || '';
    year.hidden = !top.year;
    const by = $('#award-by');
    by.textContent = top.by || '';
    by.hidden = !top.by;
    $('#award-quote').textContent = top.quote || '';
    $('.awards__quote').hidden = !top.quote;
    link('#award-url', top.url);

    const more = $('#award-list');
    more.innerHTML = list
      .slice(1)
      .map((a) => `<li>${icon('i-trophy')}<span>${esc([a.title, a.year].filter(Boolean).join(' '))}${a.by ? ` · ${esc(a.by)}` : ''}</span></li>`)
      .join('');
    more.hidden = list.length < 2;
  }

  /* ------------------------------------------------------------ menu */
  function boardHead(title, note, id) {
    return `<div class="board__head">
      <h3 class="board__title" id="${id}">${esc(title)}</h3>
      ${note ? `<span class="board__note">${esc(note)}</span>` : ''}
    </div>`;
  }

  // Sem preços: os preços mudam com frequência, então o cardápio do site mostra só os pratos
  const itemHTML = (it) => `<li class="item">
      <p class="item__name">${esc(it.name)}</p>
      ${it.desc ? `<p class="item__desc">${esc(it.desc)}</p>` : ''}
    </li>`;

  function renderMenu() {
    const boards = S.menu
      .filter((s) => s && Array.isArray(s.items) && s.items.length)
      .map(
        (s, n) => `<article class="board" aria-labelledby="board-${n}">
          ${boardHead(s.title, s.note, `board-${n}`)}
          <ul class="board__items" role="list">${s.items.map(itemHTML).join('')}</ul>
        </article>`
      );

    // Os pratos da estação mudam sempre e ficam no Instagram
    if (igUrl()) {
      boards.push(`<article class="board board--seasonal" aria-labelledby="board-seasonal">
        ${boardHead('Seasonal specials', 'New every season', 'board-seasonal')}
        <p>Chef George brings out new dishes and drinks every season. See what’s on right now on our Instagram.</p>
        <a class="btn btn--primary" href="${esc(igUrl())}" target="_blank" rel="noopener">${icon('i-ig', 'btn__icon')}<span>See this season’s specials</span></a>
      </article>`);
    }
    $('#boards').innerHTML = boards.join('');
  }

  /* ------------------------------------------------------------ Instagram feed */
  // Aceita o feed JSON do Behold ({ posts: [...] }) e também o formato da API do Instagram ({ data: [...] })
  function paletteColor(p) {
    const v = p && (p.dominant || p.muted || p.vibrant);
    if (!v) return '';
    if (/^\d+\s*,\s*\d+\s*,\s*\d+$/.test(v)) return `rgb(${v})`;
    return /^(#|rgb|hsl)/.test(v) ? v : '';
  }

  function normalizeFeed(json) {
    const list = Array.isArray(json) ? json : (json && (json.posts || json.data)) || [];
    return list
      .map((p) => {
        const type = String(p.mediaType || p.media_type || '').toUpperCase();
        const sizes = p.sizes || {};
        const sized = (sizes.medium || sizes.large || sizes.small || sizes.full || {}).mediaUrl;
        const video = type === 'VIDEO' || p.isReel;
        return {
          img: sized || p.thumbnailUrl || p.thumbnail_url || (video ? '' : p.mediaUrl || p.media_url),
          url: p.permalink,
          caption: p.prunedCaption || p.caption || '',
          alt: p.altText || '',
          type: video ? 'reel' : type === 'CAROUSEL_ALBUM' ? 'carousel' : 'image',
          color: paletteColor(p.colorPalette),
        };
      })
      .filter((p) => p.img && p.url);
  }

  function postHTML(p, i) {
    const caption = String(p.caption || '').replace(/\s+/g, ' ').trim();
    const short = caption.length > 140 ? caption.slice(0, 137).replace(/\s+\S*$/, '') + '…' : caption;
    const alt = p.alt || (short ? `Instagram post: ${short}` : 'Instagram post');
    const typeIcon = p.type === 'reel' ? icon('i-reel', 'post__type') : p.type === 'carousel' ? icon('i-carousel', 'post__type') : '';
    return `<li class="post" style="--i:${i}${p.color ? `;background:${esc(p.color)}` : ''}">
      <a href="${esc(p.url)}" target="_blank" rel="noopener">
        <img src="${esc(p.img)}" width="600" height="600" loading="lazy" decoding="async" alt="${esc(alt)}">
        ${typeIcon}
        <span class="post__cap" aria-hidden="true"><span>${esc(short)}</span></span>
      </a>
    </li>`;
  }

  function renderFeed(posts) {
    const grid = $('#feed-grid');
    grid.innerHTML = posts.slice(0, S.instagram.count || 12).map(postHTML).join('');
    $$('.post', grid).forEach(observe);
  }

  // O Behold atualiza o feed uma vez por dia e conta cada leitura no limite do mês:
  // cada visitante guarda o feed por 6 horas
  function fetchFeed(url) {
    const cached = store.get('berry-feed');
    if (cached && cached.url === url && Date.now() - cached.t < 6 * 60 * 60 * 1000) return Promise.resolve(cached.json);
    const ctrl = 'AbortController' in window ? new AbortController() : null;
    const timer = ctrl && setTimeout(() => ctrl.abort(), 8000);
    return fetch(url, ctrl ? { signal: ctrl.signal } : {})
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        clearTimeout(timer);
        store.set('berry-feed', { url, t: Date.now(), json });
        return json;
      });
  }

  function initFeed() {
    const fallback = S.instagram.posts.filter((p) => p && p.img && p.url);
    renderFeed(fallback);
    if (!S.instagram.feedUrl || !('fetch' in window)) return;
    fetchFeed(S.instagram.feedUrl)
      .then((json) => {
        // No plano grátis vêm só os 6 posts mais novos: os posts salvos completam a grade
        const posts = normalizeFeed(json);
        const code = (u) => (String(u).match(/\/(?:p|reels?|tv)\/([^/?#]+)/) || [])[1] || u;
        const have = new Set(posts.map((p) => code(p.url)));
        if (posts.length) renderFeed(posts.concat(fallback.filter((p) => !have.has(code(p.url)))));
        if (json && json.followersCount) {
          const count = $('[data-ig-count]');
          count.textContent = `${Number(json.followersCount).toLocaleString('en-IE')} followers`;
          count.hidden = false;
        }
      })
      .catch(() => { /* sem internet ou feed fora do ar: ficam os posts salvos */ });
  }

  /* ------------------------------------------------------------ reviews */
  function renderReviews() {
    const stars = icon('i-star').repeat(5);
    $('#reviews-list').innerHTML = S.reviews
      .map(
        (r) => `<figure class="review" data-reveal>
          <div class="review__stars" role="img" aria-label="5 out of 5 stars">${stars}</div>
          <blockquote class="review__text"><p>${esc(r.text)}</p></blockquote>
          <figcaption class="review__who"><span class="review__avatar" aria-hidden="true">${esc(String(r.name || '?').trim().charAt(0))}</span>${esc(r.name)}</figcaption>
        </figure>`
      )
      .join('');
    if (!S.reviews.length) {
      $('.awards__subtitle').hidden = true;
      $('#reviews-list').hidden = true;
    }
  }

  /* ------------------------------------------------------------ map (loads only on request) */
  function bindMap() {
    $('#map-load').addEventListener('click', () => {
      const map = $('#map');
      const frame = document.createElement('iframe');
      frame.src = `https://maps.google.com/maps?q=${encodeURIComponent(place())}&z=17&output=embed`;
      frame.title = `Map showing ${S.name} on ${S.address.street}, ${S.address.town}`;
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.allowFullscreen = true;
      map.appendChild(frame);
      $('.map__overlay', map).remove();
      $('.map__photo', map).remove();
      frame.focus({ preventScroll: true });
    });
  }

  /* ------------------------------------------------------------ structured data for Google */
  function renderJsonLd() {
    const abs = (u) => new URL(u, window.location.href).href;
    const canonical = ($('link[rel="canonical"]') || {}).href || window.location.href.split('#')[0];
    const byHours = {};
    DAYS.forEach((k) => {
      const h = S.hours[k];
      if (!Array.isArray(h)) return;
      (byHours[h.join('-')] = byHours[h.join('-')] || { days: [], h }).days.push(DAY_NAME[k]);
    });
    const awards = S.awards
      .filter((a) => a && a.title)
      .map((a) => [a.title, a.year].filter(Boolean).join(' ') + (a.by ? `, ${a.by}` : ''));
    const data = {
      '@context': 'https://schema.org',
      '@type': 'CafeOrCoffeeShop',
      name: S.name,
      slogan: S.tagline,
      description: ($('meta[name="description"]') || {}).content || '',
      url: canonical,
      image: [abs('assets/img/og-image.jpg')].concat(S.window.slice(0, 3).map((w) => abs(w.img))),
      logo: abs('assets/img/apple-touch-icon.png'),
      telephone: intlPhone(S.phone) || undefined,
      email: S.email || undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: S.address.street,
        addressLocality: S.address.town,
        addressRegion: S.address.county,
        postalCode: S.address.eircode,
        addressCountry: 'IE',
      },
      servesCuisine: ['Irish', 'Breakfast', 'Brunch', 'Coffee'],
      hasMenu: canonical.split('#')[0] + '#menu',
      openingHoursSpecification: Object.values(byHours).map((g) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: g.days,
        opens: g.h[0],
        closes: g.h[1],
      })),
      sameAs: [igUrl(), S.social.facebook, S.social.tripadvisor].filter(Boolean),
      award: awards.length ? awards : undefined,
    };
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
  }

  /* ------------------------------------------------------------ header, mobile menu and bar */
  const header = $('.site-header');
  const toggle = $('.menu-toggle');

  function setMenu(open) {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('use', toggle).setAttribute('href', open ? '#i-close' : '#i-menu');
    updateBar();
  }

  function bindHeader() {
    toggle.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
    $$('#nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', (e) => {
      if (header.classList.contains('nav-open') && !header.contains(e.target)) setMenu(false);
    });

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        header.classList.toggle('is-scrolled', window.scrollY > 24);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const bar = $('#mbar');
  const seen = { heroOut: false, visitIn: false, footerIn: false };

  function updateBar() {
    const show = seen.heroOut && !seen.visitIn && !seen.footerIn && !header.classList.contains('nav-open');
    bar.classList.toggle('is-visible', show);
    bar.setAttribute('aria-hidden', String(!show));
    $$('a', bar).forEach((a) => (a.tabIndex = show ? 0 : -1));
  }

  function bindBar() {
    if (!('IntersectionObserver' in window)) return;
    const watch = (el, fn) => new IntersectionObserver(([en]) => { fn(en.isIntersecting); updateBar(); }).observe(el);
    watch($('.hero'), (v) => (seen.heroOut = !v));
    watch($('#visit'), (v) => (seen.visitIn = v));
    watch($('.site-footer'), (v) => (seen.footerIn = v));
  }

  /* ------------------------------------------------------------ scroll reveals */
  let io = null;
  function observe(el) {
    if (io) io.observe(el);
  }

  function initReveal() {
    if (!motionOK() || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('reveal-on');
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    $$('[data-reveal], .plate-card, .post, .board').forEach(observe);
  }

  /* ------------------------------------------------------------ start */
  $('#year').textContent = String(irishNow().date.getUTCFullYear());
  renderContact();
  renderHours();
  renderStatus();
  setInterval(() => {
    renderStatus();
    renderHours();
  }, 60 * 1000);
  initSlides();
  renderTicker();
  renderFeature();
  renderFavourites();
  renderAwards();
  renderMenu();
  renderReviews();
  initReveal();
  initFeed();
  bindMap();
  bindHeader();
  bindBar();
  renderJsonLd();
})();
