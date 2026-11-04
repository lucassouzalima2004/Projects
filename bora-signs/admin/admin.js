/* Bora Signs: painel do site (/admin). Um arquivo só, sem etapa de build.
   Fala com o Worker em /api: login, conteúdo (rascunho e publicação), fotos, mensagens, histórico e usuários. */
(() => {
  'use strict';

  const d = document;
  const app = d.getElementById('app');
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- helpers ---------- */

  const $ = (s, el = d) => el.querySelector(s);
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const getp = (o, k) => (k ? String(k).split('.').reduce((x, p) => (x == null ? x : x[p]), o) : o);
  const setp = (o, k, v) => {
    const ps = String(k).split('.');
    const last = ps.pop();
    const t = ps.reduce((x, p) => (x[p] == null ? (x[p] = {}) : x[p]), o);
    t[last] = v;
  };
  const slugify = (s = '') => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  const uid = (n = 10) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('');
  const unmark = (s) => String(s || '').replace(/\*([^*\n]+)\*/g, '$1');
  const today = () => { const t = new Date(); return new Date(t.getTime() - t.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
  const fmtDate = (iso, time = true) => {
    if (!iso) return '';
    const dt = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
    const day = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    return time ? `${day}, ${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : day;
  };
  const kb = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

  function h(tag, attrs, ...kids) {
    const el = d.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'value') el.value = v;
        else if (k === 'checked') el.checked = !!v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false && kid !== '') el.append(kid.nodeType ? kid : d.createTextNode(String(kid)));
    return el;
  }

  const ICONS = {
    dash: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
    pen: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5L5 20"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    inbox: '<path d="M3 13h5l1.5 3h5l1.5-3h5"/><path d="M5.5 5h13l2.5 8v6H3v-6z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.7 3.2-6 6.5-6s5.9 2.3 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .7 3.2 2.8 3.5 6"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="m10 17 5-5-5-5M15 12H3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    save: '<path d="M5 3h11l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M7 3v5h8V3M7 21v-7h10v7"/>',
    send: '<path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>',
    upload: '<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 8a4 4 0 0 1 0 8"/><path d="M12 12v9M8.5 15.5 12 12l3.5 3.5"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    left: '<path d="m15 6-6 6 6 6"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    desktop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    unlink: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/><path d="M4 4l16 16"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".8"/><circle cx="4.5" cy="12" r=".8"/><circle cx="4.5" cy="18" r=".8"/>',
    olist: '<path d="M10 6h10M10 12h10M10 18h10M4 5h1v4M4 9h2M6 19H4c0-1 2-1.6 2-2.6 0-.6-.5-.9-1-.9s-1 .3-1 .8"/>',
    quote: '<path d="M7 7h4v4c0 3-2 5-4 5M14 7h4v4c0 3-2 5-4 5"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    undo: '<path d="M4 9h11a5 5 0 0 1 0 10H8"/><path d="M8 5 4 9l4 4"/>',
    sparkle: '<path d="M12 3c.5 4.5 2.5 6.5 7 7-4.5.5-6.5 2.5-7 7-.5-4.5-2.5-6.5-7-7 4.5-.5 6.5-2.5 7-7z"/>',
    van: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    building: '<path d="M4 21V5l8-2v18M12 8h8v13M2 21h20M8 8v.01M8 12v.01M8 16v.01M16 12v.01M16 16v.01"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
    route: '<path d="M5 19V9a4 4 0 0 1 4-4h10"/><path d="m15 1 4 4-4 4"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.6 0-1.3-1.2-1.5-1.2-2.6 0-.9.8-1.6 1.7-1.6H16a5 5 0 0 0 5-5C21 6.3 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.7c0 1.7-2.4 2.1-2.4 3.8M12 17v.01"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.7-4.3 3.9-6.6 8-6.6s7.3 2.3 8 6.6"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    users2: '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 19c.6-3.6 3.3-5.6 6.5-5.6s5.9 2 6.5 5.6"/><circle cx="16.8" cy="9" r="2.6"/>',
    mailcard: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  };
  function ic(name, cls = '') {
    const s = d.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('class', `ic ${cls}`.trim());
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = ICONS[name] || ICONS.box;
    return s;
  }
  const btnIcon = (name, label, onclick, disabled = false, cls = '') =>
    h('button', { class: `btn btn--ghost btn--icon btn--sm ${cls}`, type: 'button', title: label, 'aria-label': label, onclick, disabled }, ic(name, 'ic--sm'));
  const button = (label, onclick, { icon, cls = '', title } = {}) =>
    h('button', { class: `btn ${cls}`, type: 'button', onclick, title }, icon ? ic(icon) : null, label);
  const pill = (text, tone = '') => h('span', { class: `pill${tone ? ` pill--${tone}` : ''}` }, text);
  const note = (html, warn = false) => h('div', { class: `note${warn ? ' note--warn' : ''}`, html });

  /* ---------- state ---------- */

  const S = {
    me: null,
    live: null, // published content
    liveMeta: { ver: null, at: null, by: null },
    doc: null, // what is being edited
    draftMeta: null,
    liveJson: '',
    savedJson: '',
    templates: {},
    builtins: {},
    cardIcons: [],
    media: null,
    unread: 0,
    siteUrl: location.origin,
    preview: { on: matchMedia('(min-width: 1281px)').matches, phone: false, path: '/' },
  };
  try {
    const saved = JSON.parse(localStorage.getItem('bs-panel-preview') || 'null');
    if (saved && matchMedia('(min-width: 1281px)').matches) Object.assign(S.preview, { on: !!saved.on, phone: !!saved.phone });
  } catch { /* storage blocked */ }

  const docJson = () => JSON.stringify(S.doc);
  const isDirty = () => docJson() !== S.savedJson;
  const isUnpublished = () => docJson() !== S.liveJson;
  const siteHost = () => {
    try { return new URL(S.doc.seo.siteUrl || S.siteUrl).host; } catch { return location.host; }
  };

  /* ---------- API ---------- */

  let relogging = null;
  async function api(path, { method = 'GET', body, form, text = false } = {}) {
    const opts = { method, headers: {}, credentials: 'same-origin' };
    if (form) opts.body = form;
    else if (body !== undefined) {
      opts.body = JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
    }
    let res;
    try {
      res = await fetch(path, opts);
    } catch {
      throw new Error('Sem conexão com o site. Confira a internet e tente de novo.');
    }
    if (res.status === 401 && S.me && !/\/api\/(login|password)$/.test(path)) {
      await relogin();
      return api(path, { method, body, form, text });
    }
    if (text) {
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      return res.text();
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const e = new Error(data.error || `Erro ${res.status}`);
      e.status = res.status;
      e.data = data;
      throw e;
    }
    return data;
  }

  /* ---------- toasts and modals ---------- */

  let toasts;
  function toast(msg, kind = 'ok', ms = 3800) {
    if (!toasts) { toasts = h('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' }); d.body.append(toasts); }
    const t = h('div', { class: `toast toast--${kind}` }, ic(kind === 'err' ? 'x' : 'check'), h('span', null, msg));
    toasts.append(t);
    setTimeout(() => t.remove(), ms);
  }
  const oops = (err) => toast(err && err.message ? err.message : 'Algo deu errado. Tente de novo.', 'err', 6000);

  function modal({ title, body, actions = [], wide = false, onClose }) {
    const back = h('div', { class: 'modal-back' });
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      back.remove();
      d.removeEventListener('keydown', onKey);
      if (onClose) onClose();
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const foot = actions.length ? h('div', { class: 'modal__foot' }, actions.map((a) => h('button', {
      class: `btn ${a.cls || ''}`,
      type: 'button',
      onclick: async (e) => {
        const b = e.currentTarget;
        if (a.run) {
          b.disabled = true;
          let r;
          try { r = await a.run(); } catch (err) { oops(err); r = false; }
          b.disabled = false;
          if (r === false) return;
        }
        close();
      },
    }, a.icon ? ic(a.icon) : null, a.label))) : null;
    const box = h('div', { class: `modal${wide ? ' modal--wide' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { class: 'modal__head' }, h('h2', null, title), btnIcon('x', 'Fechar', close)),
      h('div', { class: 'modal__body' }, body),
      foot);
    back.append(box);
    back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
    d.addEventListener('keydown', onKey);
    d.body.append(back);
    setTimeout(() => { const f = box.querySelector('.modal__body input, .modal__body textarea, .modal__body select, .modal__foot .btn--pink'); if (f) f.focus(); }, 40);
    return { close, box };
  }
  const confirmBox = (title, text, { ok = 'Confirmar', danger = false } = {}) => new Promise((res) => {
    let answered = false;
    modal({
      title,
      body: typeof text === 'string' ? h('p', null, text) : text,
      actions: [
        { label: 'Cancelar', run: () => { answered = true; res(false); } },
        { label: ok, cls: danger ? 'btn--danger' : 'btn--pink', run: () => { answered = true; res(true); } },
      ],
      onClose: () => { if (!answered) res(false); },
    });
  });

  /* ---------- sign in ---------- */

  const brand = () => h('img', { src: '/favicon.svg', alt: '', width: 64, height: 64 });

  function loginScreen(msg = '') {
    app.className = '';
    const err = h('div', { class: 'login__err', hidden: !msg }, msg);
    const user = h('input', { type: 'text', autocomplete: 'username', autocapitalize: 'none', spellcheck: 'false', required: true, id: 'lu' });
    const pass = h('input', { type: 'password', autocomplete: 'current-password', required: true, id: 'lp' });
    const go = h('button', { class: 'btn btn--pink', type: 'submit' }, 'Entrar');
    const form = h('form', {
      onsubmit: async (e) => {
        e.preventDefault();
        go.disabled = true;
        err.hidden = true;
        try {
          const { user: me } = await api('/api/login', { method: 'POST', body: { username: user.value, password: pass.value } });
          S.me = me;
          if (me.mustChange) return passwordScreen(pass.value);
          await start();
        } catch (ex) {
          err.textContent = ex.message;
          err.hidden = false;
          go.disabled = false;
          pass.select();
        }
      },
    },
    h('div', { class: 'f' }, h('label', { class: 'f__label', for: 'lu' }, 'Usuário'), user),
    h('div', { class: 'f' }, h('label', { class: 'f__label', for: 'lp' }, 'Senha'), pass),
    err, go);
    app.replaceChildren(h('div', { class: 'login' }, h('div', { class: 'login__card' },
      h('div', { class: 'login__brand' }, brand(), h('div', null, h('h1', null, 'Painel do site'), h('p', null, 'Bora Signs'))),
      form)));
    user.focus();
  }

  function passwordScreen(current = '') {
    app.className = '';
    const err = h('div', { class: 'login__err', hidden: true });
    const now = h('input', { type: 'password', autocomplete: 'current-password', value: current, id: 'pc' });
    const a = h('input', { type: 'password', autocomplete: 'new-password', id: 'pa', minlength: 10 });
    const b = h('input', { type: 'password', autocomplete: 'new-password', id: 'pb' });
    const go = h('button', { class: 'btn btn--pink', type: 'submit' }, 'Salvar senha e entrar');
    app.replaceChildren(h('div', { class: 'login' }, h('div', { class: 'login__card' },
      h('div', { class: 'login__brand' }, brand(), h('div', null, h('h1', null, 'Crie a sua senha'), h('p', null, 'Escolha uma senha só sua para entrar no painel. Pelo menos 10 caracteres.'))),
      h('form', {
        onsubmit: async (e) => {
          e.preventDefault();
          err.hidden = true;
          if (a.value.length < 10) { err.textContent = 'A nova senha precisa ter pelo menos 10 caracteres.'; err.hidden = false; return; }
          if (a.value !== b.value) { err.textContent = 'As duas senhas novas não são iguais.'; err.hidden = false; return; }
          go.disabled = true;
          try {
            const { user } = await api('/api/password', { method: 'POST', body: { current: now.value, next: a.value } });
            S.me = user;
            toast('Senha criada. Bem-vindo ao painel!');
            await start();
          } catch (ex) {
            err.textContent = ex.message;
            err.hidden = false;
            go.disabled = false;
          }
        },
      },
      h('div', { class: 'f', hidden: !!current }, h('label', { class: 'f__label', for: 'pc' }, 'Senha atual'), now),
      h('div', { class: 'f' }, h('label', { class: 'f__label', for: 'pa' }, 'Nova senha'), a),
      h('div', { class: 'f' }, h('label', { class: 'f__label', for: 'pb' }, 'Repita a nova senha'), b),
      err, go))));
    a.focus();
  }

  // When the session runs out mid-edit: sign in again without losing anything
  function relogin() {
    if (relogging) return relogging;
    relogging = new Promise((resolve) => {
      const err = h('div', { class: 'login__err', hidden: true });
      const user = h('input', { type: 'text', value: S.me ? S.me.username : '', autocomplete: 'username' });
      const pass = h('input', { type: 'password', autocomplete: 'current-password' });
      const m = modal({
        title: 'Entre de novo',
        body: [h('p', null, 'Sua sessão terminou. Entre de novo para continuar; nada do que você fez foi perdido.'),
          h('div', { class: 'f' }, h('label', { class: 'f__label' }, 'Usuário'), user),
          h('div', { class: 'f' }, h('label', { class: 'f__label' }, 'Senha'), pass), err],
        actions: [{
          label: 'Entrar',
          cls: 'btn--pink',
          run: async () => {
            try {
              const r = await api('/api/login', { method: 'POST', body: { username: user.value, password: pass.value } });
              S.me = r.user;
              relogging = null;
              resolve();
              return true;
            } catch (ex) {
              err.textContent = ex.message;
              err.hidden = false;
              return false;
            }
          },
        }],
        onClose: () => { if (relogging) setTimeout(() => { relogging = null; relogin().then(resolve); }, 0); },
      });
      setTimeout(() => pass.focus(), 60);
      return m;
    });
    return relogging;
  }

  /* ---------- start ---------- */

  async function boot() {
    try {
      const { user } = await api('/api/me');
      S.me = user;
      if (user.mustChange) return passwordScreen('');
      await start();
    } catch (e) {
      if (e.status === 401) loginScreen();
      else if (e.status === 503) app.replaceChildren(h('div', { class: 'login' }, h('div', { class: 'login__card' }, h('h1', null, 'Painel indisponível'), h('p', null, e.message))));
      else loginScreen(e.message);
    }
  }

  async function start() {
    const st = await api('/api/state');
    S.me = st.me;
    S.live = st.live.content;
    S.liveMeta = { ver: st.live.ver, at: st.live.at, by: st.live.by };
    S.liveJson = JSON.stringify(S.live);
    S.draftMeta = st.draft ? { at: st.draft.at, by: st.draft.by, base: st.draft.base } : null;
    S.doc = clone(st.draft ? st.draft.content : S.live);
    S.savedJson = docJson();
    S.templates = st.templates;
    S.builtins = st.builtins || {};
    S.cardIcons = st.cardIcons || [];
    S.unread = st.unread || 0;
    S.siteUrl = st.siteUrl || location.origin;
    shell();
    recoverBackup();
    route();
    if (S.draftMeta && S.draftMeta.base && S.draftMeta.base !== S.liveMeta.ver) {
      toast('Atenção: o rascunho salvo é de antes da última publicação.', 'err', 7000);
    }
  }

  /* ---------- changes ---------- */

  const backupKey = () => `bs-panel-backup:${S.me ? S.me.username : ''}`;
  const backup = debounce(() => {
    try {
      if (isDirty()) localStorage.setItem(backupKey(), JSON.stringify({ at: new Date().toISOString(), base: S.liveMeta.ver, json: docJson() }));
      else localStorage.removeItem(backupKey());
    } catch { /* storage full or blocked */ }
  }, 800);
  const clearBackup = () => { try { localStorage.removeItem(backupKey()); } catch { /* blocked */ } };

  function recoverBackup() {
    let b = null;
    try { b = JSON.parse(localStorage.getItem(backupKey()) || 'null'); } catch { /* blocked */ }
    if (!b || !b.json || b.json === S.savedJson || b.base !== S.liveMeta.ver) return;
    modal({
      title: 'Recuperar alterações?',
      body: h('p', null, `Encontramos alterações que não foram salvas neste navegador (${fmtDate(b.at)}). Quer continuar de onde parou?`),
      actions: [
        { label: 'Não, descartar', run: () => clearBackup() },
        { label: 'Recuperar', cls: 'btn--pink', run: () => { S.doc = JSON.parse(b.json); changed(); route(); toast('Alterações recuperadas. Lembre de salvar ou publicar.'); } },
      ],
    });
  }

  function changed() {
    updateStatus();
    backup();
    schedulePreview();
  }

  const AREAS = {
    company: 'Dados da empresa', seo: 'SEO e integrações', shopvox: 'ShopVox', forms: 'Formulários', google: 'Nota do Google',
    stats: 'Números da home', clients: 'Logos de clientes', menu: 'Menu', footer: 'Rodapé', header: 'Cabeçalho', cta: 'Chamada final',
    process: 'Processo em 4 passos', home: 'Página inicial', servicePage: 'Textos das páginas de serviço', servicesPage: 'Página de serviços',
    van: 'Van antes/depois', finishes: 'Acabamentos (Decor)', contact: 'Página de contato', join: 'Trabalhe conosco',
    thanks: 'Página de obrigado', notFound: 'Página 404', blog: 'Configurações do blog', redirects: 'Redirecionamentos',
  };
  function changeList(a, b) {
    const out = [];
    const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
    for (const [k, label] of Object.entries(AREAS)) if (!same(a[k], b[k])) out.push(label);
    const keyed = (list, key) => Object.fromEntries((list || []).map((x) => [x[key], x]));
    const as = keyed(a.services, 'slug');
    const bs = keyed(b.services, 'slug');
    for (const s of b.services) {
      if (!as[s.slug]) out.push(`Serviço novo: ${s.name || s.slug}`);
      else if (!same(as[s.slug], s)) out.push(`Serviço: ${s.name}`);
    }
    for (const s of a.services) if (!bs[s.slug]) out.push(`Serviço removido ou renomeado: ${s.name}`);
    if (a.services.map((s) => s.slug).join() !== b.services.map((s) => s.slug).join() && a.services.length === b.services.length) out.push('Ordem dos serviços');
    const ap = keyed(a.posts, 'id');
    const bp = keyed(b.posts, 'id');
    for (const p of b.posts) {
      if (!ap[p.id]) out.push(`Post novo: ${p.title || 'sem título'}`);
      else if (!same(ap[p.id], p)) out.push(`Post: ${p.title || 'sem título'}`);
    }
    for (const p of a.posts) if (!bp[p.id]) out.push(`Post removido: ${p.title || 'sem título'}`);
    return [...new Set(out)];
  }

  async function saveDraft() {
    try {
      const r = await api('/api/draft', { method: 'PUT', body: { content: S.doc, base: S.liveMeta.ver } });
      S.savedJson = docJson();
      S.draftMeta = { at: r.at, by: S.me.name, base: S.liveMeta.ver };
      clearBackup();
      updateStatus();
      toast('Rascunho salvo. Ainda não está no ar.');
      if (r.warnings && r.warnings.length) toast(r.warnings[0], 'err', 8000);
    } catch (e) { oops(e); }
  }

  function publishFlow() {
    const list = changeList(S.live, S.doc);
    if (!list.length) return toast('Não há nada novo para publicar.');
    const noteInput = h('input', { type: 'text', placeholder: 'Ex.: troquei as fotos da van', maxlength: 200 });
    const doPublish = async (force = false) => {
      try {
        const r = await api('/api/publish', { method: 'POST', body: { content: S.doc, base: S.liveMeta.ver, note: noteInput.value, force } });
        S.live = clone(S.doc);
        S.liveJson = docJson();
        S.savedJson = S.liveJson;
        S.liveMeta = { ver: r.live.ver, at: r.live.at, by: r.live.by };
        S.draftMeta = null;
        clearBackup();
        updateStatus();
        toast('Publicado! O site já mostra as alterações (em alguns lugares pode levar até 1 minuto).', 'ok', 6000);
        route();
        return true;
      } catch (e) {
        if (e.status === 409) {
          const ok = await confirmBox('Alguém publicou antes', `${e.message} Se publicar agora, a versão dessa pessoa será substituída pela sua (ela continua no Histórico).`, { ok: 'Publicar a minha versão', danger: true });
          if (ok) return doPublish(true);
          return false;
        }
        if (e.status === 422) {
          modal({ title: 'Falta acertar uma coisa', body: h('p', null, e.message), actions: [{ label: 'Entendi', cls: 'btn--pink' }] });
          return true;
        }
        oops(e);
        return false;
      }
    };
    modal({
      title: 'Publicar no site?',
      body: [
        h('p', null, 'Estas partes do site vão mudar para todo mundo:'),
        h('ul', { class: 'changes' }, list.map((x) => h('li', null, x))),
        h('div', { class: 'f' }, h('label', { class: 'f__label' }, 'Anotação para o histórico (opcional)'), noteInput),
      ],
      actions: [{ label: 'Cancelar' }, { label: 'Publicar agora', cls: 'btn--pink', icon: 'send', run: () => doPublish(false) }],
    });
  }

  async function discardFlow() {
    if (isDirty()) {
      const ok = await confirmBox('Desfazer alterações?', S.draftMeta ? 'Volta para o último rascunho salvo.' : 'Volta para o que está publicado no site.', { ok: 'Desfazer', danger: true });
      if (!ok) return;
      S.doc = JSON.parse(S.savedJson);
      clearBackup();
      changed();
      route();
      return;
    }
    if (S.draftMeta) {
      const ok = await confirmBox('Apagar o rascunho?', 'O rascunho salvo é apagado e o painel volta a mostrar o que está publicado.', { ok: 'Apagar rascunho', danger: true });
      if (!ok) return;
      try {
        await api('/api/draft', { method: 'DELETE' });
        S.draftMeta = null;
        S.doc = clone(S.live);
        S.savedJson = S.liveJson;
        changed();
        route();
        toast('Rascunho apagado.');
      } catch (e) { oops(e); }
    }
  }

  /* ---------- images ---------- */

  const mediaRe = /^m:([a-z0-9]{6,40}):(\d+)x(\d+):(webp|jpg|png)$/;
  function thumbUrl(ref) {
    if (!ref || typeof ref !== 'string') return '';
    if (ref.startsWith('/')) return ref;
    const m = mediaRe.exec(ref);
    if (m) return `/media/${m[1]}-800.${m[4]}`;
    if (S.builtins[ref]) return `/assets/img/work/${ref}-800.webp`;
    return '';
  }
  function refLabel(ref) {
    if (!ref) return '';
    const m = mediaRe.exec(ref);
    if (m) {
      const item = (S.media || []).find((x) => x.id === m[1]);
      return item ? item.name : 'Foto enviada';
    }
    if (ref.startsWith('/')) return ref.split('/').pop();
    return S.builtins[ref] ? ref.replace(/-/g, ' ') : ref;
  }
  function refSize(ref) {
    const m = mediaRe.exec(ref || '');
    if (m) return `${m[2]} × ${m[3]} px`;
    const b = S.builtins[ref];
    return b ? `${b.w} × ${b.h} px` : '';
  }
  // The JPEG used in link previews (WhatsApp, Facebook) for an image
  function ogPath(ref) {
    const m = mediaRe.exec(ref || '');
    if (m) return `/media/${m[1]}.jpg`;
    if (S.builtins[ref]) return `/assets/img/work/${ref}.jpg`;
    return ref || '';
  }

  async function loadMedia(force = false) {
    if (S.media && !force) return S.media;
    const { media } = await api('/api/media');
    S.media = media;
    return media;
  }

  function decodeImage(file) {
    const viaImg = () => new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error(`“${file.name}”: formato não suportado. Envie JPG, PNG ou WebP.`));
      img.src = URL.createObjectURL(file);
    });
    if (window.createImageBitmap) return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(viaImg);
    return viaImg();
  }
  function draw(src, W, H, w, hh, fill) {
    // Halve in steps first, so big phone photos shrink smoothly in every browser
    let cur = src;
    let cw = W;
    let ch = H;
    while (cw / 2 > w * 1.4) {
      const c = h('canvas', { width: Math.round(cw / 2), height: Math.round(ch / 2) });
      const x = c.getContext('2d');
      x.imageSmoothingQuality = 'high';
      x.drawImage(cur, 0, 0, c.width, c.height);
      cur = c;
      cw = c.width;
      ch = c.height;
    }
    const out = h('canvas', { width: w, height: hh });
    const x = out.getContext('2d');
    x.imageSmoothingQuality = 'high';
    if (fill) { x.fillStyle = fill; x.fillRect(0, 0, w, hh); }
    x.drawImage(cur, 0, 0, w, hh);
    return out;
  }
  const toBlob = (canvas, type, q) => new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Não deu para converter a imagem.'))), type, q));

  async function processImage(file) {
    if (!/^image\/(jpeg|png|webp|gif|avif|heic|heif)$/.test(file.type) && !/\.(jpe?g|png|webp|gif|avif)$/i.test(file.name)) throw new Error(`“${file.name}” não é uma imagem.`);
    const src = await decodeImage(file);
    const W = src.width || src.naturalWidth;
    const H = src.height || src.naturalHeight;
    if (!W || !H) throw new Error(`“${file.name}”: não deu para ler a imagem.`);
    const w = Math.min(1600, W);
    const hh = Math.max(1, Math.round((H * w) / W));
    if (hh > 8000) throw new Error(`“${file.name}” é comprida demais.`);
    const alpha = /png|webp|gif|avif/.test(file.type);
    let ext = 'webp';
    let type = 'image/webp';
    let big = await toBlob(draw(src, W, H, w, hh), type, 0.82);
    if (big.type !== 'image/webp') { // Safari can't make WebP
      ext = alpha ? 'png' : 'jpg';
      type = alpha ? 'image/png' : 'image/jpeg';
      big = await toBlob(draw(src, W, H, w, hh, alpha ? null : '#fff'), type, 0.86);
    }
    let v800 = big;
    let v1600 = null;
    if (w > 800) {
      v1600 = big;
      v800 = await toBlob(draw(src, W, H, 800, Math.round((H * 800) / W), ext === 'jpg' ? '#fff' : null), type, ext === 'webp' ? 0.8 : 0.85);
    }
    const ow = Math.min(1200, W);
    const og = await toBlob(draw(src, W, H, ow, Math.round((H * ow) / W), '#ffffff'), 'image/jpeg', 0.84);
    return { w, h: hh, ext, v800, v1600, og };
  }

  function uploadOne(file, onProgress) {
    return processImage(file).then((img) => new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('name', file.name.replace(/\.[^.]+$/, ''));
      fd.append('w', img.w);
      fd.append('h', img.h);
      fd.append('ext', img.ext);
      fd.append('v800', img.v800, `800.${img.ext}`);
      if (img.v1600) fd.append('v1600', img.v1600, `1600.${img.ext}`);
      fd.append('og', img.og, 'og.jpg');
      const x = new XMLHttpRequest();
      x.open('POST', '/api/media');
      x.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
      x.onload = () => {
        let data = {};
        try { data = JSON.parse(x.responseText); } catch { /* not JSON */ }
        if (x.status === 401) return reject(new Error('Sua sessão terminou. Entre de novo e envie outra vez.'));
        if (x.status >= 300) return reject(new Error(data.error || 'O envio falhou.'));
        resolve(data.media);
      };
      x.onerror = () => reject(new Error('Sem conexão. A foto não foi enviada.'));
      x.send(fd);
    }));
  }

  // Drop zone + button; calls onDone(mediaItems) after the uploads
  function uploader(onDone) {
    const input = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/gif,image/avif', multiple: true, hidden: true });
    const progress = h('div', { class: 'uploading' });
    const zone = h('div', { class: 'drop' },
      ic('upload', 'ic--lg'),
      h('p', null, 'Arraste fotos para cá ou escolha do computador ou celular. JPG, PNG ou WebP.'),
      button('Escolher fotos', () => input.click(), { icon: 'image', cls: 'btn--pink' }),
      input, progress);
    const run = async (files) => {
      const done = [];
      for (const file of files) {
        const bar = h('i');
        const row = h('div', null, h('div', { class: 'f__help' }, file.name), h('div', { class: 'bar' }, bar));
        progress.append(row);
        try {
          bar.style.width = '8%';
          const m = await uploadOne(file, (p) => { bar.style.width = `${10 + p * 88}%`; });
          bar.style.width = '100%';
          done.push(m);
          if (S.media) S.media.unshift(m);
          setTimeout(() => row.remove(), 900);
        } catch (e) {
          row.remove();
          oops(e);
        }
      }
      if (done.length) {
        toast(done.length === 1 ? 'Foto enviada.' : `${done.length} fotos enviadas.`);
        onDone(done);
      }
    };
    input.addEventListener('change', () => { run([...input.files]); input.value = ''; });
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('is-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-over'));
    zone.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('is-over'); run([...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'))); });
    return zone;
  }

  const mediaCard = (item, onclick, picked = false) => h('button', { class: `media${picked ? ' is-picked' : ''}`, type: 'button', onclick },
    h('div', { class: 'thumb' }, h('img', { src: thumbUrl(item.ref), alt: '', loading: 'lazy' })),
    h('div', { class: 'media__info' }, h('b', null, item.name), h('span', null, `${item.w} × ${item.h}${item.size ? ` · ${kb(item.size)}` : ''}`)));

  function builtinItems() {
    return Object.entries(S.builtins).map(([name, b]) => ({ id: name, ref: name, name: name.replace(/-/g, ' '), w: b.w, h: b.h }));
  }

  // Lets the user choose (or upload) one image, or several with multiple
  async function pickMedia({ onPick, multiple = false }) {
    const picked = new Set();
    const grid = h('div', { class: 'media-grid' });
    const builtGrid = h('div', { class: 'media-grid' });
    const addBtn = { label: 'Usar as fotos escolhidas', cls: 'btn--pink', run: () => { if (!picked.size) return false; onPick([...picked]); return true; } };
    const choose = (item, el) => {
      if (!multiple) { onPick(item.ref); m.close(); return; }
      if (picked.has(item.ref)) picked.delete(item.ref); else picked.add(item.ref);
      el.classList.toggle('is-picked', picked.has(item.ref));
    };
    const drawGrid = () => {
      grid.replaceChildren(...(S.media || []).map((it) => { const el = mediaCard(it, () => choose(it, el), picked.has(it.ref)); return el; }));
      if (S.media && !S.media.length) grid.append(h('p', { class: 'f__help' }, 'Nenhuma foto enviada ainda.'));
    };
    builtGrid.replaceChildren(...builtinItems().map((it) => { const el = mediaCard(it, () => choose(it, el)); return el; }));
    const m = modal({
      title: multiple ? 'Escolher fotos' : 'Escolher foto',
      wide: true,
      body: [
        uploader((items) => {
          drawGrid();
          if (!multiple && items.length === 1) { onPick(items[0].ref); m.close(); } else items.forEach((it) => picked.add(it.ref));
          drawGrid();
        }),
        h('h3', { class: 'h2', style: { margin: '6px 0 0' } }, 'Fotos enviadas'),
        grid,
        h('details', null, h('summary', { class: 'h2', style: { cursor: 'pointer' } }, 'Fotos que vieram com o site'), builtGrid),
      ],
      actions: multiple ? [{ label: 'Cancelar' }, addBtn] : [],
    });
    grid.append(h('div', { class: 'loading-row' }, h('div', { class: 'boot__spin' })));
    try { await loadMedia(); drawGrid(); } catch (e) { oops(e); }
  }

  /* ---------- rich text ---------- */

  const BLOCK = new Set(['P', 'H2', 'H3', 'H4', 'UL', 'OL', 'BLOCKQUOTE', 'HR', 'FIGURE']);
  const ALLOW = new Set([...BLOCK, 'STRONG', 'EM', 'U', 'S', 'A', 'LI', 'BR', 'IMG', 'FIGCAPTION', 'SUB', 'SUP']);
  const RENAME = { B: 'STRONG', I: 'EM', DIV: 'P', H1: 'H2', H5: 'H4', H6: 'H4', STRIKE: 'S' };
  const okHref = (u) => /^(https?:|mailto:|tel:|\/(?!\/)|#)/i.test(String(u || '').trim());
  function cleanHtml(html) {
    const tpl = d.createElement('template');
    tpl.innerHTML = html;
    const walk = (node, out) => {
      for (const ch of [...node.childNodes]) {
        if (ch.nodeType === 3) { out.append(d.createTextNode(ch.textContent)); continue; }
        if (ch.nodeType !== 1) continue;
        let tag = RENAME[ch.tagName] || ch.tagName;
        if (/^(SCRIPT|STYLE|META|LINK|TITLE|NOSCRIPT|IFRAME|OBJECT|SVG|TEMPLATE|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(tag)) continue;
        if (tag === 'SPAN') {
          const st = ch.getAttribute('style') || '';
          if (/font-weight:\s*(bold|[6-9]00)/.test(st)) tag = 'STRONG';
          else if (/font-style:\s*italic/.test(st)) tag = 'EM';
        }
        if (!ALLOW.has(tag)) { walk(ch, out); continue; }
        const el = d.createElement(tag);
        if (tag === 'A') {
          const href = ch.getAttribute('href');
          if (!okHref(href)) { walk(ch, out); continue; }
          el.setAttribute('href', href.trim());
        }
        if (tag === 'IMG') {
          const src = ch.getAttribute('src') || '';
          if (!/^(\/(media|assets)\/|https:\/\/)/.test(src)) continue;
          el.setAttribute('src', src);
          el.setAttribute('alt', ch.getAttribute('alt') || '');
          for (const a of ['width', 'height']) if (/^\d+$/.test(ch.getAttribute(a) || '')) el.setAttribute(a, ch.getAttribute(a));
        }
        walk(ch, el);
        out.append(el);
      }
    };
    const box = d.createElement('div');
    walk(tpl.content, box);
    // Loose text at the top level goes into paragraphs
    const out = d.createElement('div');
    let p = null;
    for (const n of [...box.childNodes]) {
      if (n.nodeType === 1 && BLOCK.has(n.tagName)) { p = null; out.append(n); continue; }
      if (n.nodeType === 3 && !n.textContent.trim() && !p) continue;
      if (!p) { p = d.createElement('p'); out.append(p); }
      p.append(n);
    }
    return out.innerHTML.replace(/(<p>(\s|<br>)*<\/p>)+$/g, '') || '<p></p>';
  }
  const textToHtml = (t) => t.split(/\n{2,}/).map((para) => `<p>${para.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`).join('');

  /* ---------- form builder ---------- */

  const MARK_HELP = 'Coloque <code>*asteriscos*</code> em volta de palavras para destacá-las em rosa.';
  let fid = 0;
  const nextId = () => `f${++fid}`;

  function wrap(def, control, { id, extra, help } = {}) {
    return h('div', { class: 'f' },
      def.l ? h(id ? 'label' : 'div', { class: 'f__label', for: id || null }, def.l, extra) : null,
      def.help || help ? h('div', { class: 'f__help', html: def.help || help }) : null,
      control);
  }

  function counter(def, input) {
    if (!def.max) return null;
    const c = h('span', { class: 'count' });
    const upd = () => { const n = input.value.length; c.textContent = `${n} / ${def.max}`; c.classList.toggle('is-over', n > def.max); };
    input.addEventListener('input', upd);
    upd();
    return c;
  }

  const R = {
    text(obj, def) {
      const id = nextId();
      const input = h('input', { id, type: def.type || 'text', value: getp(obj, def.k) ?? '', placeholder: def.ph || null, autocomplete: 'off', inputmode: def.inputmode || null });
      input.addEventListener('input', () => { setp(obj, def.k, def.trim ? input.value.trim() : input.value); changed(); if (def.onInput) def.onInput(input.value); });
      return wrap(def, input, { id, extra: counter(def, input), help: def.mark ? MARK_HELP : '' });
    },
    area(obj, def) {
      const id = nextId();
      const input = h('textarea', { id, rows: def.rows || 3, value: getp(obj, def.k) ?? '', placeholder: def.ph || null });
      input.addEventListener('input', () => { setp(obj, def.k, input.value); changed(); if (def.onInput) def.onInput(input.value); });
      return wrap(def, input, { id, extra: counter(def, input), help: def.mark ? MARK_HELP : '' });
    },
    number(obj, def) {
      const id = nextId();
      const input = h('input', { id, type: 'number', value: getp(obj, def.k) ?? 0, step: def.step || 'any', min: def.min ?? null, max: def.maxv ?? null, inputmode: 'decimal' });
      input.addEventListener('input', () => { const v = parseFloat(input.value); setp(obj, def.k, Number.isFinite(v) ? v : 0); changed(); });
      return wrap(def, input, { id });
    },
    percent(obj, def) {
      const id = nextId();
      const input = h('input', { id, type: 'number', value: Math.round((getp(obj, def.k) || 0) * 100), min: 0, max: 100, step: 1, inputmode: 'numeric' });
      input.addEventListener('input', () => { const v = Math.min(100, Math.max(0, parseFloat(input.value) || 0)); setp(obj, def.k, v / 100); changed(); });
      return wrap(def, input, { id });
    },
    date(obj, def) {
      const id = nextId();
      const input = h('input', { id, type: 'date', value: getp(obj, def.k) || '' });
      input.addEventListener('change', () => { setp(obj, def.k, input.value); changed(); if (def.onInput) def.onInput(input.value); });
      return wrap(def, input, { id });
    },
    toggle(obj, def) {
      const input = h('input', { type: 'checkbox', checked: !!getp(obj, def.k) });
      input.addEventListener('change', () => { setp(obj, def.k, def.invert ? !input.checked : input.checked); changed(); if (def.onInput) def.onInput(input.checked); });
      if (def.invert) input.checked = !getp(obj, def.k);
      return h('div', { class: 'f' }, h('label', { class: 'toggle' }, input, h('span', { class: 'toggle__ui' }), def.l), def.help ? h('div', { class: 'f__help', html: def.help }) : null);
    },
    select(obj, def) {
      const id = nextId();
      const opts = typeof def.options === 'function' ? def.options() : def.options;
      const val = getp(obj, def.k) ?? '';
      const sel = h('select', { id }, opts.map(([v, label]) => h('option', { value: v }, label)));
      if (!opts.some(([v]) => v === val)) sel.append(h('option', { value: val }, val || '—'));
      sel.value = val;
      sel.addEventListener('change', () => { setp(obj, def.k, sel.value); changed(); if (def.onInput) def.onInput(sel.value); });
      return wrap(def, sel, { id });
    },
    color(obj, def) {
      const id = nextId();
      const text = h('input', { id, type: 'text', value: getp(obj, def.k) || '', placeholder: '#29384A' });
      const pick = h('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(getp(obj, def.k) || '') ? getp(obj, def.k) : '#29384a', style: { width: '52px', height: '42px', padding: '2px', border: '1px solid var(--line-2)', borderRadius: '10px', background: '#fff' } });
      text.addEventListener('input', () => { setp(obj, def.k, text.value.trim()); if (/^#[0-9a-f]{6}$/i.test(text.value.trim())) pick.value = text.value.trim(); changed(); });
      pick.addEventListener('input', () => { text.value = pick.value; setp(obj, def.k, pick.value); changed(); });
      return wrap(def, h('div', { style: { display: 'flex', gap: '8px' } }, pick, text), { id });
    },
    icon(obj, def) {
      const names = { users: 'Pessoas', user: 'Pessoa', cal: 'Calendário', mail: 'E-mail', box: 'Caixa', clock: 'Relógio', phone: 'Telefone', pin: 'Local', check: 'Visto', spark: 'Brilho' };
      return R.select(obj, { ...def, options: S.cardIcons.map((n) => [n, names[n] || n]) });
    },
    image(obj, def) {
      const box = h('div', { class: 'img-field' });
      const redraw = () => {
        const ref = getp(obj, def.k) || '';
        const url = thumbUrl(ref);
        box.replaceChildren(
          h('div', { class: `thumb${def.logo ? ' thumb--logo' : ''}` }, url ? h('img', { src: url, alt: '' }) : ic('image', 'ic--lg')),
          h('div', { class: 'img-field__meta' },
            h('b', null, url ? refLabel(ref) : 'Nenhuma imagem'),
            refSize(ref) ? h('span', null, refSize(ref)) : null,
            h('div', { class: 'row' },
              button(url ? 'Trocar' : 'Escolher imagem', () => pickMedia({ onPick: (r) => { setp(obj, def.k, def.og ? ogPath(r) : r); changed(); redraw(); } }), { icon: 'image', cls: 'btn--sm' }),
              url && def.clear !== false ? button('Tirar', () => { setp(obj, def.k, ''); changed(); redraw(); }, { cls: 'btn--sm btn--ghost btn--danger' }) : null)));
      };
      redraw();
      if (!S.media) loadMedia().then(redraw).catch(() => {});
      return wrap(def, box);
    },
    images(obj, def) {
      const box = h('div', { class: 'gallery' });
      const list = () => { let a = getp(obj, def.k); if (!Array.isArray(a)) { a = []; setp(obj, def.k, a); } return a; };
      const redraw = () => {
        const a = list();
        box.replaceChildren(...a.map((ref, i) => h('div', { class: 'gallery__item' },
          h('div', { class: 'thumb' }, thumbUrl(ref) ? h('img', { src: thumbUrl(ref), alt: '' }) : ic('image')),
          h('div', { class: 'gallery__tools' },
            btnIcon('left', 'Mover para a esquerda', () => { a.splice(i - 1, 0, a.splice(i, 1)[0]); changed(); redraw(); }, i === 0),
            btnIcon('trash', 'Tirar da galeria', () => { a.splice(i, 1); changed(); redraw(); }, false, 'btn--danger'),
            btnIcon('right', 'Mover para a direita', () => { a.splice(i + 1, 0, a.splice(i, 1)[0]); changed(); redraw(); }, i === a.length - 1)))),
        h('button', { class: 'gallery__add', type: 'button', onclick: () => pickMedia({ multiple: true, onPick: (refs) => { list().push(...refs); changed(); redraw(); } }) }, ic('plus', 'ic--lg'), 'Adicionar fotos'));
      };
      redraw();
      return wrap(def, box);
    },
    list(obj, def) {
      const box = h('div', { class: 'list' });
      const arr = () => { let a = getp(obj, def.k); if (!Array.isArray(a)) { a = []; setp(obj, def.k, a); } return a; };
      const titleOf = (it, i) => (def.title ? def.title(it, i) : (it.title || it.label || it.name || it.q || it.text || it.from || ''));
      const redraw = (openIdx = -1) => {
        const a = arr();
        box.replaceChildren();
        a.forEach((it, i) => {
          const titleEl = h('span', { class: 'item__title' });
          const setTitle = () => { const t = unmark(titleOf(it, i)); titleEl.replaceChildren(t || h('em', null, def.empty || 'Sem título')); };
          setTitle();
          const body = h('div', { class: 'item__body' }, typeof def.item === 'function' ? def.item(it, i) : fields(it, def.item));
          body.addEventListener('input', setTitle);
          body.addEventListener('change', setTitle);
          const el = h('div', { class: `item${i === openIdx || (def.open && openIdx < 0) ? '' : ' is-closed'}` });
          const toggle = () => el.classList.toggle('is-closed');
          titleEl.addEventListener('click', toggle);
          el.append(h('div', { class: 'item__head' },
            h('span', { class: 'item__num' }, String(i + 1).padStart(2, '0')),
            titleEl,
            h('div', { class: 'item__tools' },
              def.fixed ? null : btnIcon('up', 'Subir', () => { a.splice(i - 1, 0, a.splice(i, 1)[0]); changed(); redraw(i - 1); }, i === 0),
              def.fixed ? null : btnIcon('down', 'Descer', () => { a.splice(i + 1, 0, a.splice(i, 1)[0]); changed(); redraw(i + 1); }, i === a.length - 1),
              def.fixed ? null : btnIcon('trash', 'Remover', async () => {
                const t = unmark(titleOf(it, i));
                if (t && !(await confirmBox('Remover da lista?', `“${t.slice(0, 80)}” vai sair da lista.`, { ok: 'Remover', danger: true }))) return;
                a.splice(i, 1);
                changed();
                redraw();
              }, false, 'btn--danger'),
              btnIcon('down', 'Abrir ou fechar', toggle))),
          body);
          box.append(el);
        });
        if (!def.fixed && (!def.maxItems || a.length < def.maxItems)) {
          box.append(button(def.addLabel || 'Adicionar', () => { a.push(def.add ? def.add() : {}); changed(); redraw(a.length - 1); }, { icon: 'plus', cls: 'btn--sm list__add' }));
        }
      };
      redraw();
      return wrap(def, box);
    },
    strings(obj, def) {
      const box = h('div', { class: 'strings' });
      const arr = () => { let a = getp(obj, def.k); if (!Array.isArray(a)) { a = []; setp(obj, def.k, a); } return a; };
      const redraw = (focus = -1) => {
        const a = arr();
        box.replaceChildren(...a.map((s, i) => {
          const input = h('input', { type: 'text', class: 'input', value: s });
          input.addEventListener('input', () => { a[i] = input.value; changed(); });
          if (i === focus) setTimeout(() => input.focus(), 0);
          return h('div', { class: 'strings__row' }, input,
            btnIcon('up', 'Subir', () => { a.splice(i - 1, 0, a.splice(i, 1)[0]); changed(); redraw(); }, i === 0),
            btnIcon('down', 'Descer', () => { a.splice(i + 1, 0, a.splice(i, 1)[0]); changed(); redraw(); }, i === a.length - 1),
            btnIcon('trash', 'Remover', () => { a.splice(i, 1); changed(); redraw(); }, false, 'btn--danger'));
        }), button(def.addLabel || 'Adicionar', () => { a.push(''); changed(); redraw(a.length - 1); }, { icon: 'plus', cls: 'btn--sm list__add' }));
      };
      redraw();
      return wrap(def, box);
    },
    seo(obj, def) {
      const base = def.k ? getp(obj, def.k) : obj;
      const tk = def.tk || 'title';
      const dk = def.dk || 'description';
      const sT = h('div', { class: 'serp__title' });
      const sD = h('div', { class: 'serp__desc' });
      const sU = h('span');
      const upd = () => {
        sT.textContent = base[tk] || (def.fallbackTitle ? def.fallbackTitle() : '') || 'Título da página';
        sD.textContent = base[dk] || (def.fallbackDesc ? def.fallbackDesc() : '') || 'Escreva uma descrição para o Google.';
        sU.textContent = `${siteHost()}${typeof def.path === 'function' ? def.path() : def.path || '/'}`.replace(/\/$/, '');
      };
      const t = R.text(base, { k: tk, l: 'Título no Google', max: 60, onInput: upd, help: 'Aparece no Google e na aba do navegador. O ideal é ter até 60 caracteres, com o serviço e “Adelaide”.' });
      const ds = R.area(base, { k: dk, l: 'Descrição no Google', max: 160, rows: 3, onInput: upd, help: 'O texto que aparece embaixo do título no Google. O ideal é ter de 120 a 160 caracteres.' });
      upd();
      return h('div', { class: 'f', style: { gap: '16px' } }, t, ds,
        h('div', { class: 'f' }, h('div', { class: 'f__label' }, 'Como aparece no Google'), h('div', { class: 'serp' }, h('div', { class: 'serp__url' }, h('i'), sU), sT, sD)));
    },
    slug(obj, def) {
      const id = nextId();
      let committed = getp(obj, def.k) || '';
      const input = h('input', { id, type: 'text', value: committed, autocomplete: 'off', spellcheck: 'false' });
      input.addEventListener('change', () => {
        const v = slugify(input.value) || committed;
        input.value = v;
        if (v === committed) return;
        const old = committed;
        committed = v;
        setp(obj, def.k, v);
        if (def.onRename) def.onRename(old, v);
        changed();
      });
      return wrap(def, h('div', { class: 'prefix' }, h('span', null, `${siteHost()}/${def.prefix || ''}`), input), { id });
    },
    link(obj, def) {
      const id = nextId();
      const groups = linkOptions();
      const all = groups.flatMap((g) => g.items.map(([v]) => v));
      const val = getp(obj, def.k) || '';
      const sel = h('select', { id },
        def.optional ? h('option', { value: '' }, '— sem link próprio —') : null,
        groups.map((g) => h('optgroup', { label: g.label }, g.items.map(([v, label]) => h('option', { value: v }, label)))),
        h('option', { value: '__custom' }, 'Outro endereço…'));
      const custom = h('input', { type: 'text', value: val, placeholder: 'https://… ou /pagina', class: 'input' });
      sel.value = all.includes(val) ? val : val ? '__custom' : def.optional ? '' : '/';
      custom.hidden = sel.value !== '__custom';
      sel.addEventListener('change', () => {
        custom.hidden = sel.value !== '__custom';
        setp(obj, def.k, sel.value === '__custom' ? custom.value.trim() : sel.value);
        if (!custom.hidden) custom.focus();
        changed();
      });
      custom.addEventListener('input', () => { setp(obj, def.k, custom.value.trim()); changed(); });
      return wrap(def, h('div', { style: { display: 'grid', gap: '6px' } }, sel, custom), { id });
    },
    services(obj, def) {
      const box = h('div', { class: 'strings' });
      const arr = () => { let a = getp(obj, def.k); if (!Array.isArray(a)) { a = []; setp(obj, def.k, a); } return a; };
      const name = (slug) => { const s = S.doc.services.find((x) => x.slug === slug); return s ? `${s.name}${s.hidden ? ' (escondido)' : ''}` : `${slug} (não existe mais)`; };
      const redraw = () => {
        const a = arr();
        const add = h('select', { class: 'input' }, h('option', { value: '' }, '+ Adicionar serviço…'),
          S.doc.services.filter((s) => !a.includes(s.slug) && s.slug !== def.exclude).map((s) => h('option', { value: s.slug }, s.name)));
        add.addEventListener('change', () => { if (add.value) { a.push(add.value); changed(); redraw(); } });
        box.replaceChildren(...a.map((slug, i) => h('div', { class: 'strings__row' },
          h('div', { class: 'input', style: { background: '#faf8fd' } }, name(slug)),
          btnIcon('up', 'Subir', () => { a.splice(i - 1, 0, a.splice(i, 1)[0]); changed(); redraw(); }, i === 0),
          btnIcon('down', 'Descer', () => { a.splice(i + 1, 0, a.splice(i, 1)[0]); changed(); redraw(); }, i === a.length - 1),
          btnIcon('trash', 'Tirar', () => { a.splice(i, 1); changed(); redraw(); }, false, 'btn--danger'))), add);
      };
      redraw();
      return wrap(def, box);
    },
    service(obj, def) {
      return R.select(obj, { ...def, options: () => [['', '— nenhum —'], ...S.doc.services.map((s) => [s.slug, s.name])] });
    },
    rich(obj, def) {
      const area = h('div', { class: 'rte__area', contenteditable: 'true', 'data-placeholder': 'Escreva o texto aqui…', role: 'textbox', 'aria-multiline': 'true' });
      area.innerHTML = cleanHtml(getp(obj, def.k) || '');
      if (area.innerHTML === '<p></p>') area.innerHTML = '';
      const sync = debounce(() => { setp(obj, def.k, cleanHtml(area.innerHTML)); changed(); }, 300);
      let range = null;
      const keep = () => { const s = getSelection(); if (s.rangeCount && area.contains(s.anchorNode)) range = s.getRangeAt(0).cloneRange(); };
      const restore = () => { area.focus(); if (range) { const s = getSelection(); s.removeAllRanges(); s.addRange(range); } };
      d.addEventListener('selectionchange', keep);
      area.addEventListener('input', sync);
      area.addEventListener('focus', () => { try { d.execCommand('defaultParagraphSeparator', false, 'p'); } catch { /* old browser */ } });
      area.addEventListener('paste', (e) => {
        e.preventDefault();
        const htmlText = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');
        d.execCommand('insertHTML', false, htmlText ? cleanHtml(htmlText) : textToHtml(text));
        sync();
      });
      const run = (cmd, value) => { restore(); d.execCommand(cmd, false, value); sync(); };
      const tb = (label, title, fn, icon) => h('button', { type: 'button', title, 'aria-label': title, onmousedown: (e) => e.preventDefault(), onclick: fn }, icon ? ic(icon, 'ic--sm') : label);
      const bar = h('div', { class: 'rte__bar' },
        tb('Texto', 'Parágrafo normal', () => run('formatBlock', '<p>')),
        tb('Título', 'Título de seção', () => run('formatBlock', '<h2>')),
        tb('Subtítulo', 'Subtítulo', () => run('formatBlock', '<h3>')),
        h('span', { class: 'sep' }),
        tb('B', 'Negrito', () => run('bold')),
        h('button', { type: 'button', title: 'Itálico', onmousedown: (e) => e.preventDefault(), onclick: () => run('italic'), style: { fontStyle: 'italic' } }, 'I'),
        h('span', { class: 'sep' }),
        tb('', 'Lista', () => run('insertUnorderedList'), 'list'),
        tb('', 'Lista numerada', () => run('insertOrderedList'), 'olist'),
        tb('', 'Citação', () => run('formatBlock', '<blockquote>'), 'quote'),
        h('span', { class: 'sep' }),
        tb('', 'Link', () => {
          keep();
          const input = h('input', { type: 'text', placeholder: 'https://… ou /contact', class: 'input' });
          modal({
            title: 'Adicionar link',
            body: [h('p', { class: 'f__help' }, 'Selecione o texto antes. Use /contact, /vehicle-signage etc. para páginas do site.'), input],
            actions: [{ label: 'Cancelar' }, { label: 'Adicionar link', cls: 'btn--pink', run: () => { const u = input.value.trim(); if (!okHref(u)) { toast('Endereço inválido. Comece com https://, / ou mailto:', 'err'); return false; } run('createLink', u); return true; } }],
          });
        }, 'link'),
        tb('', 'Tirar link', () => run('unlink'), 'unlink'),
        tb('', 'Imagem', () => {
          keep();
          pickMedia({ onPick: (ref) => {
            const m = mediaRe.exec(ref);
            const src = m ? `/media/${m[1]}-${+m[2] > 800 ? 1600 : 800}.${m[4]}` : `/assets/img/work/${ref}-1600.webp`;
            const dims = m ? [m[2], m[3]] : S.builtins[ref] ? [S.builtins[ref].w, S.builtins[ref].h] : [];
            run('insertHTML', `<p><img src="${src}" alt=""${dims.length ? ` width="${dims[0]}" height="${dims[1]}"` : ''}></p>`);
          } });
        }, 'image'),
        tb('Limpar', 'Tirar formatação', () => run('removeFormat')));
      return wrap(def, h('div', { class: 'rte' }, bar, area));
    },
  };

  function fields(obj, defs) {
    return defs.filter(Boolean).map((def) => {
      if (def.t === 'row') return h('div', { class: def.cols.length === 3 ? 'grid3' : 'grid2' }, def.cols.map((c) => R[c.t || 'text'](obj, c)));
      if (def.t === 'note') return note(def.html, def.warn);
      return R[def.t || 'text'](obj, def);
    });
  }

  function linkOptions() {
    const doc = S.doc;
    const groups = [{ label: 'Páginas', items: [['/', 'Página inicial'], ['/services', 'Todos os serviços'], ['/contact', 'Contato (orçamento)'], ['/join-us', 'Trabalhe conosco'], ...(doc.blog.enabled ? [['/blog', 'Blog']] : [])] }];
    groups.push({ label: 'Serviços', items: doc.services.map((s) => [`/${s.slug}`, s.name || s.slug]) });
    if (doc.posts.length) groups.push({ label: 'Posts do blog', items: doc.posts.map((p) => [`/blog/${p.slug}`, p.title || p.slug]) });
    return groups;
  }

  let secId = 0;
  function sec(title, desc, icon, body, { open = false } = {}) {
    const key = `${location.hash}|${++secId}`;
    const el = h('details', { class: 'card sec', open: open || openSecs.has(key) },
      h('summary', null, h('span', { class: 'sec__ico' }, ic(icon)), h('div', null, h('h2', null, title), desc ? h('p', null, desc) : null), ic('down', 'chev')),
      h('div', { class: 'sec__body' }, body));
    el.addEventListener('toggle', () => { if (el.open) openSecs.add(key); else openSecs.delete(key); });
    return el;
  }
  const openSecs = new Set();

  /* ---------- shell ---------- */

  let V; // the view element
  let topTitle;
  let statusEl;
  let saveBtn;
  let publishBtn;
  let undoBtn;
  let navEl;
  let shellEl;
  let workEl;

  const navItems = [
    ['', 'Painel', 'dash'],
    '|Conteúdo',
    ['home', 'Página inicial', 'home'],
    ['services', 'Serviços', 'layers'],
    ['blog', 'Blog', 'pen'],
    ['pages', 'Outras páginas', 'file', [['pages/services', 'Página de serviços'], ['pages/contact', 'Contato'], ['pages/join', 'Trabalhe conosco'], ['pages/thanks', 'Obrigado'], ['pages/404', 'Página 404']]],
    ['blocks', 'Blocos repetidos', 'box'],
    ['menu', 'Menu e rodapé', 'menu'],
    '|Fotos e contatos',
    ['media', 'Fotos', 'image'],
    ['messages', 'Mensagens', 'inbox'],
    '|Site',
    ['settings', 'Configurações', 'gear'],
    ['history', 'Histórico', 'clock'],
    ['users', 'Usuários', 'users'],
  ];

  function shell() {
    app.className = '';
    topTitle = h('div', { class: 'top__title' });
    statusEl = h('button', { class: 'top__status', type: 'button', onclick: () => showChanges() });
    undoBtn = h('button', { class: 'btn btn--ghost btn--icon', type: 'button', title: 'Desfazer alterações', 'aria-label': 'Desfazer alterações', onclick: discardFlow }, ic('undo'));
    saveBtn = h('button', { class: 'btn', type: 'button', onclick: saveDraft, title: 'Salvar sem publicar (Ctrl+S)' }, ic('save'), h('span', { class: 'lbl-wide' }, 'Salvar rascunho'));
    publishBtn = h('button', { class: 'btn btn--pink', type: 'button', onclick: publishFlow }, ic('send'), 'Publicar');
    const previewBtn = h('button', { class: 'btn', type: 'button', onclick: () => togglePreview() }, ic('eye'), h('span', { class: 'lbl-wide' }, 'Prévia'));
    navEl = h('nav', { 'aria-label': 'Painel' });
    workEl = h('div', { class: 'work' });
    V = h('div', { class: 'view' });
    workEl.append(V, previewPane());
    shellEl = h('div', { class: 'shell' },
      h('aside', { class: 'side' },
        h('a', { class: 'side__brand', href: '#/' }, h('img', { src: '/favicon.svg', alt: '', width: 40, height: 40 }), h('div', null, h('b', null, 'Bora Signs'), h('small', null, 'Painel do site'))),
        navEl,
        h('div', { class: 'side__foot' },
          h('div', { class: 'side__me' }, h('span', { class: 'avatar' }, (S.me.name || '?').slice(0, 1).toUpperCase()), h('div', null, h('b', null, S.me.name), h('div', { style: { fontSize: '12px', color: '#8b7a9f' } }, S.me.username))),
          h('a', { class: 'nav-link', href: S.siteUrl, target: '_blank', rel: 'noopener' }, ic('external'), 'Ver o site'),
          h('button', { class: 'nav-link', type: 'button', onclick: logout }, ic('logout'), 'Sair'))),
      h('div', { class: 'main' },
        h('header', { class: 'top' },
          h('button', { class: 'btn btn--ghost btn--icon top__menu', type: 'button', 'aria-label': 'Menu', onclick: () => shellEl.classList.toggle('menu-open') }, ic('menu')),
          topTitle, statusEl,
          h('div', { class: 'top__actions' }, undoBtn, previewBtn, saveBtn, publishBtn)),
        workEl));
    shellEl.addEventListener('click', (e) => { if (e.target === shellEl) shellEl.classList.remove('menu-open'); });
    app.replaceChildren(shellEl);
    drawNav();
    updateStatus();
    applyPreview();
  }

  function drawNav() {
    const cur = location.hash.replace(/^#\/?/, '');
    const top = cur.split('/')[0];
    navEl.replaceChildren(...navItems.map((it) => {
      if (typeof it === 'string') return h('div', { class: 'side__label' }, it.slice(1));
      const [path, label, icon, subs] = it;
      const on = path === '' ? cur === '' : top === path.split('/')[0];
      const a = h('a', { class: `nav-link${on && !subs ? ' is-on' : on ? ' is-on' : ''}`, href: `#/${subs ? subs[0][0] : path}` }, ic(icon), label,
        path === 'messages' && S.unread ? h('span', { class: 'badge' }, S.unread) : null);
      if (!subs || !on) return a;
      return [a, h('div', { class: 'nav-sub' }, subs.map(([p, l]) => h('a', { class: `nav-link${cur === p ? ' is-on' : ''}`, href: `#/${p}` }, l)))];
    }).flat());
  }

  function updateStatus() {
    if (!statusEl) return;
    const dirty = isDirty();
    const unpub = isUnpublished();
    statusEl.className = `top__status${dirty ? ' is-dirty' : unpub ? ' is-draft' : ''}`;
    statusEl.replaceChildren(h('i'), h('span', null, dirty ? 'Alterações não salvas' : unpub ? 'Rascunho salvo, não publicado' : 'Tudo publicado'));
    statusEl.title = dirty ? 'Você mudou coisas que ainda não foram salvas nem publicadas. Clique para ver.' : unpub ? 'Há um rascunho salvo que ainda não está no site.' : 'O site mostra exatamente o que está no painel.';
    saveBtn.disabled = !dirty;
    publishBtn.disabled = !unpub;
    undoBtn.hidden = !dirty && !S.draftMeta;
  }

  function showChanges() {
    const list = changeList(S.live, S.doc);
    modal({
      title: list.length ? 'O que mudou' : 'Tudo publicado',
      body: list.length ? [h('p', null, 'Partes do site com mudanças que ainda não estão no ar:'), h('ul', { class: 'changes' }, list.map((x) => h('li', null, x)))]
        : h('p', null, `O site mostra exatamente o que está no painel.${S.liveMeta.at ? ` Última publicação: ${fmtDate(S.liveMeta.at)}${S.liveMeta.by ? ` por ${S.liveMeta.by}` : ''}.` : ''}`),
      actions: list.length ? [{ label: 'Fechar' }, { label: 'Publicar', cls: 'btn--pink', run: () => { setTimeout(publishFlow, 0); } }] : [{ label: 'Fechar' }],
    });
  }

  async function logout() {
    if (isDirty() && !(await confirmBox('Sair sem salvar?', 'Você tem alterações não salvas. Elas ficam guardadas só neste navegador.', { ok: 'Sair mesmo assim', danger: true }))) return;
    try { await api('/api/logout', { method: 'POST' }); } catch { /* signing out anyway */ }
    S.me = null;
    loginScreen();
  }

  /* ---------- preview ---------- */

  const P = { pane: null, frames: [], front: 0, timer: null, seq: 0, lastPath: null, pathEl: null };

  function previewPane() {
    P.frames = [h('iframe', { title: 'Prévia do site' }), h('iframe', { title: 'Prévia do site', class: 'is-back', 'aria-hidden': 'true' })];
    P.pathEl = h('div', { class: 'preview__path' });
    const seg = h('div', { class: 'seg' },
      h('button', { type: 'button', title: 'Computador', 'aria-label': 'Computador', onclick: () => { S.preview.phone = false; applyPreview(); } }, ic('desktop', 'ic--sm')),
      h('button', { type: 'button', title: 'Celular', 'aria-label': 'Celular', onclick: () => { S.preview.phone = true; applyPreview(); } }, ic('phone', 'ic--sm')));
    P.seg = seg;
    P.pane = h('section', { class: 'preview', 'aria-label': 'Prévia' },
      h('div', { class: 'preview__bar' }, seg, P.pathEl,
        btnIcon('refresh', 'Atualizar prévia', () => refreshPreview()),
        btnIcon('external', 'Abrir prévia em tela cheia', openPreviewWindow),
        btnIcon('x', 'Fechar prévia', () => togglePreview(false))),
      (P.stage = h('div', { class: 'preview__stage' }, h('div', { class: 'preview__busy' }), ...P.frames)));
    // "Computer" shows the real desktop layout, scaled down to fit the pane
    if (window.ResizeObserver) new ResizeObserver(fitPreview).observe(P.stage);
    return P.pane;
  }

  function applyPreview() {
    const show = S.preview.on && !S.previewParked;
    workEl.classList.toggle('has-preview', show);
    P.pane.hidden = !show;
    P.pane.classList.toggle('is-phone', S.preview.phone);
    P.seg.children[0].classList.toggle('is-on', !S.preview.phone);
    P.seg.children[1].classList.toggle('is-on', S.preview.phone);
    fitPreview();
    try { localStorage.setItem('bs-panel-preview', JSON.stringify({ on: S.preview.on, phone: S.preview.phone })); } catch { /* blocked */ }
    if (show) schedulePreview(0);
  }
  function fitPreview() {
    const W = P.stage.clientWidth;
    const H = P.stage.clientHeight;
    for (const f of P.frames) {
      if (S.preview.phone || !W) { f.style.width = ''; f.style.height = ''; f.style.transform = ''; continue; }
      const vw = Math.max(W, 1280);
      const k = W / vw;
      f.style.width = `${vw}px`;
      f.style.height = `${H / k}px`;
      f.style.transform = `scale(${k})`;
      f.style.transformOrigin = '0 0';
    }
  }
  function togglePreview(on = !(S.preview.on && !S.previewParked)) { S.preview.on = on; S.previewParked = false; applyPreview(); }
  // On narrow screens the preview covers the editor, so it only opens when asked
  matchMedia('(min-width: 1281px)').addEventListener('change', (e) => { if (!e.matches && S.preview.on && P.pane) togglePreview(false); });
  function setPreviewPath(path) {
    if (!path) return;
    if (path !== S.preview.path) { S.preview.path = path; schedulePreview(0); }
    if (P.pathEl) P.pathEl.textContent = `${siteHost()}${path === '/__404' ? '/página-que-não-existe' : path}`;
  }
  function schedulePreview(delay = 650) {
    if (!S.preview.on || S.previewParked || !P.pane) return;
    clearTimeout(P.timer);
    P.timer = setTimeout(refreshPreview, delay);
  }
  async function previewHtml(doc, path) {
    return api('/api/preview', { method: 'POST', body: { content: doc, path }, text: true });
  }
  async function refreshPreview() {
    if (!S.preview.on) return;
    const seq = ++P.seq;
    P.pane.classList.add('is-busy');
    let html;
    try {
      html = await previewHtml(S.doc, S.preview.path);
    } catch (e) {
      P.pane.classList.remove('is-busy');
      return;
    }
    if (seq !== P.seq) return;
    const front = P.frames[P.front];
    const back = P.frames[1 - P.front];
    let y = 0;
    try { if (P.lastPath === S.preview.path) y = front.contentWindow.scrollY; } catch { /* not loaded */ }
    back.onload = () => {
      if (seq !== P.seq) return;
      try { back.contentWindow.scrollTo(0, y); } catch { /* cross-origin never happens here */ }
      back.classList.remove('is-back');
      back.removeAttribute('aria-hidden');
      front.classList.add('is-back');
      front.setAttribute('aria-hidden', 'true');
      P.front = 1 - P.front;
      P.lastPath = S.preview.path;
      P.pane.classList.remove('is-busy');
    };
    back.srcdoc = html;
  }
  async function openPreviewWindow() {
    const w = window.open('', '_blank');
    if (!w) return toast('O navegador bloqueou a janela. Libere pop-ups para este site.', 'err');
    try {
      const html = await previewHtml(S.doc, S.preview.path);
      w.document.open();
      w.document.write(html);
      w.document.close();
    } catch (e) { w.close(); oops(e); }
  }

  // Clicking a link inside the preview opens that page's editor
  window.addEventListener('message', (e) => {
    if (!e.data || e.data.bsPreview !== 'go' || !P.frames.some((f) => f.contentWindow === e.source)) return;
    const path = String(e.data.path || '/');
    const slug = path.replace(/^\/+|\/+$/g, '');
    const map = { '': 'home', services: 'pages/services', contact: 'pages/contact', 'join-us': 'pages/join', 'thank-you': 'pages/thanks', blog: 'blog' };
    if (map[slug] != null) location.hash = `#/${map[slug]}`;
    else if (slug.startsWith('blog/')) {
      const p = S.doc.posts.find((x) => `blog/${x.slug}` === slug);
      if (p) location.hash = `#/blog/${p.id}`;
    } else if (S.doc.services.some((s) => s.slug === slug)) location.hash = `#/services/${slug}`;
    else setPreviewPath(path);
  });

  /* ---------- views ---------- */

  function head(title, desc, actions = [], crumbs = []) {
    return h('div', { class: 'view__head' },
      h('div', null,
        crumbs.length ? h('div', { class: 'crumb' }, crumbs.map(([l, href], i) => [i ? ' / ' : '', h('a', { href }, l)])) : null,
        h('h1', null, title), desc ? h('p', null, desc) : null),
      actions.length ? h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, actions) : null);
  }
  function render(...kids) {
    secId = 0;
    V.replaceChildren(h('div', { class: 'view__in' }, kids));
  }
  const liveLink = (path) => `${S.siteUrl.replace(/\/$/, '')}${path}`;

  function viewDashboard() {
    const first = (S.me.name || '').split(' ')[0];
    const visible = S.doc.services.filter((s) => !s.hidden).length;
    const posts = S.doc.posts.filter((p) => p.status === 'published').length;
    const mediaTile = h('b', null, S.media ? S.media.length : '…');
    if (!S.media) loadMedia().then((m) => { mediaTile.textContent = m.length; }).catch(() => { mediaTile.textContent = '–'; });
    const unpub = isUnpublished();
    const tile = (icon, value, label, href) => h('a', { class: 'card tile', href }, h('span', { class: 'sec__ico' }, ic(icon)), value.nodeType ? value : h('b', null, value), h('span', null, label));
    const quick = (icon, label, href) => h('a', { href }, h('span', { class: 'sec__ico' }, ic(icon)), label);
    render(
      h('div', { class: 'card hello' },
        h('div', { class: 'hello__mark' }, h('img', { src: '/favicon.svg', alt: '' })),
        h('div', { style: { flex: 1, position: 'relative', zIndex: 1 } }, h('h1', null, `Olá, ${first}!`), h('p', null, 'Aqui você muda os textos, as fotos, os serviços e o blog do site. Nada vai para o ar até você clicar em Publicar.')),
        h('a', { class: 'btn', href: S.siteUrl, target: '_blank', rel: 'noopener' }, ic('external'), 'Abrir o site')),
      h('div', { class: 'card status-card', style: { marginTop: '16px' } },
        h('span', { class: 'sec__ico', style: unpub ? { background: 'var(--amber-soft)', color: 'var(--amber)' } : { background: 'var(--green-soft)', color: 'var(--green)' } }, ic(unpub ? 'pen' : 'check')),
        h('div', { class: 'status-card__text' },
          h('b', null, unpub ? 'Você tem alterações que ainda não estão no site' : 'O site está em dia com o painel'),
          h('span', null, S.liveMeta.at ? `Última publicação: ${fmtDate(S.liveMeta.at)}${S.liveMeta.by ? `, por ${S.liveMeta.by}` : ''}.` : 'O site ainda mostra o conteúdo original; nada foi publicado pelo painel.')),
        unpub ? button('Ver o que mudou', showChanges, { icon: 'eye' }) : null,
        unpub ? button('Publicar', publishFlow, { icon: 'send', cls: 'btn--pink' }) : null),
      h('div', { class: 'tiles' },
        tile('layers', visible, 'serviços no site', '#/services'),
        tile('pen', posts, posts === 1 ? 'post publicado' : 'posts publicados', '#/blog'),
        tile('image', mediaTile, 'fotos enviadas', '#/media'),
        tile('inbox', S.unread, S.unread === 1 ? 'mensagem nova' : 'mensagens novas', '#/messages')),
      h('h2', { class: 'h2' }, 'Atalhos'),
      h('div', { class: 'card quick' },
        quick('home', 'Editar a página inicial', '#/home'),
        quick('pen', 'Escrever um post', '#/blog/new'),
        quick('image', 'Enviar fotos', '#/media'),
        quick('building', 'Telefone, e-mail e endereço', '#/settings/company'),
        quick('van', 'Preços da van', '#/settings/van'),
        quick('menu', 'Menu do site', '#/menu')),
      h('h2', { class: 'h2' }, 'Como funciona'),
      h('div', { class: 'card', style: { padding: '6px 20px' } }, h('ul', { style: { paddingLeft: '18px', lineHeight: 1.7 } },
        h('li', { html: 'Mude o que quiser nos campos. A <b>prévia</b> ao lado mostra a página com as suas mudanças na hora. Clique nos links da prévia para editar outra página.' }),
        h('li', { html: '<b>Salvar rascunho</b> guarda o que você fez sem colocar no ar. <b>Publicar</b> coloca no site para todo mundo.' }),
        h('li', { html: 'Nos títulos, escreva <code>*assim*</code> para a palavra ficar em rosa.' }),
        h('li', { html: 'Errou? Em <a href="#/history">Histórico</a> dá para voltar qualquer uma das últimas 60 publicações.' }))));
    return { title: 'Painel', preview: '/' };
  }

  const faqDefs = (title = true) => [
    { k: 'kicker', l: 'Etiqueta' },
    title ? { k: 'title', l: 'Título', mark: true } : null,
    { k: 'items', t: 'list', l: 'Perguntas', title: (it) => it.q, item: [{ k: 'q', l: 'Pergunta' }, { k: 'a', l: 'Resposta', t: 'area', rows: 3 }], add: () => ({ q: '', a: '' }), addLabel: 'Adicionar pergunta' },
  ];

  function viewHome() {
    const o = S.doc.home;
    render(
      head('Página inicial', 'A primeira página do site. Clique em cada parte para abrir.'),
      sec('Google', 'Título e descrição da home nas buscas.', 'search', [R.seo(o, { k: 'seo', path: '/' })]),
      sec('Topo da página', 'O título, a frase da campanha e os botões ao lado do camaleão.', 'sparkle', fields(o.hero, [
        { k: 'eyebrow', l: 'Etiqueta acima do título' },
        { k: 'title', l: 'Título principal', t: 'area', rows: 2, mark: true },
        { t: 'row', cols: [{ k: 'tagStrong', l: 'Campanha (negrito)', help: '<code>*less*</code> ganha destaque' }, { k: 'tagText', l: 'Campanha (meio)' }, { k: 'tagEm', l: 'Campanha (itálico)' }] },
        { k: 'lead', l: 'Texto embaixo', t: 'area', rows: 3 },
        { k: 'button', l: 'Botão principal', help: 'Leva para a página de orçamento. O segundo botão é o telefone.' },
        { k: 'trust', t: 'strings', l: 'Selos com ✓ embaixo dos botões', addLabel: 'Adicionar selo' },
        { t: 'note', html: 'A nota do Google fica em <a href="#/settings/google">Configurações → Google</a>.' },
      ]), { open: true }),
      sec('Cartões atrás do camaleão', 'As tarefas que flutuam atrás dele. O lugar de cada cartão é fixo; deixe o texto vazio para esconder um.', 'box', fields(o.hero, [
        { k: 'cards', t: 'list', l: 'Cartões', fixed: true, title: (it) => it.label, empty: 'Escondido', item: [{ t: 'row', cols: [{ k: 'label', l: 'Texto' }, { k: 'icon', t: 'icon', l: 'Ícone' }] }, { k: 'pink', t: 'toggle', l: 'Ícone rosa' }] },
        { k: 'sign', l: 'Cartão que se quebra (com ✓)', help: 'O cartão no alto que vira estilhaços e volta.' },
      ])),
      sec('Apresentação', 'O bloco logo depois do topo, com os números.', 'file', fields(o.intro, [
        { k: 'kicker', l: 'Etiqueta' }, { k: 'title', l: 'Título', mark: true }, { k: 'text', l: 'Texto', t: 'area', rows: 4 }, { k: 'button', l: 'Botão' },
        { t: 'note', html: 'Os números (15+ anos etc.) ficam em <a href="#/settings/stats">Configurações → Números</a>.' },
      ])),
      sec('Serviços em destaque', 'Os cards grandes e a lista de outros serviços.', 'layers', fields(o.services, [
        { k: 'kicker', l: 'Etiqueta' }, { k: 'title', l: 'Título', mark: true }, { k: 'lead', l: 'Texto', t: 'area', rows: 2 },
        { k: 'featured', t: 'services', l: 'Serviços com card grande', help: 'Os outros serviços visíveis aparecem embaixo, como botões.' },
        { k: 'moreTitle', l: 'Título da lista de outros serviços' },
      ])),
      sec('Por que a Bora Signs', 'Os motivos numerados.', 'star', fields(o.reasons, [
        { k: 'kicker', l: 'Etiqueta' }, { k: 'title', l: 'Título', mark: true },
        { k: 'items', t: 'list', l: 'Motivos', item: [{ k: 'title', l: 'Título' }, { k: 'text', l: 'Texto', t: 'area', rows: 2 }], add: () => ({ title: '', text: '' }), addLabel: 'Adicionar motivo' },
      ])),
      sec('Depoimentos', 'Os depoimentos que trocam sozinhos.', 'quote', fields(o.reviews, [
        { k: 'kicker', l: 'Etiqueta' },
        { k: 'items', t: 'list', l: 'Depoimentos', title: (it) => (it.name ? `${it.name}: ${it.text}` : it.text), item: [{ k: 'text', l: 'Depoimento', t: 'area', rows: 3 }, { t: 'row', cols: [{ k: 'name', l: 'Nome' }, { k: 'role', l: 'Empresa ou cargo (opcional)' }] }], add: () => ({ text: '', name: '', role: '' }), addLabel: 'Adicionar depoimento' },
      ])),
      sec('Dúvidas frequentes', 'Também vão para o Google como perguntas e respostas.', 'help', fields(o.faq, faqDefs())),
      sec('Outros blocos da home', '', 'box', [note('O <b>processo em 4 passos</b> e a <b>chamada final</b> aparecem em várias páginas: edite em <a href="#/blocks">Blocos repetidos</a>. Os <b>logos de clientes</b> ficam em <a href="#/settings/clients">Configurações → Clientes</a>.')]),
    );
    return { title: 'Página inicial', preview: '/' };
  }

  /* services */

  const groupLabel = (key) => (S.doc.servicesPage.groups.find((g) => g.key === key) || { label: key || '—' }).label;
  const isLiveService = (slug) => S.live.services.some((x) => x.slug === slug);

  function renameServiceRefs(from, to) {
    const doc = S.doc;
    const fix = (s) => (s === from ? to : s);
    doc.home.services.featured = doc.home.services.featured.map(fix);
    doc.footer.popular = doc.footer.popular.map(fix);
    for (const s of doc.services) {
      s.related = s.related.map(fix);
      for (const it of [...s.why.items, ...s.options.items]) if (it.link === from) it.link = to;
    }
    for (const m of doc.menu) {
      if (m.href === `/${from}`) m.href = `/${to}`;
      for (const it of m.items) if (it.href === `/${from}`) it.href = `/${to}`;
    }
    for (const r of doc.redirects) if (r.to === `/${from}`) r.to = `/${to}`;
    doc.redirects = doc.redirects.filter((r) => r.from !== `/${to}`);
    if (isLiveService(from) && !doc.redirects.some((r) => r.from === `/${from}`)) doc.redirects.push({ from: `/${from}`, to: `/${to}` });
  }
  function removeServiceRefs(slug) {
    const doc = S.doc;
    doc.home.services.featured = doc.home.services.featured.filter((x) => x !== slug);
    doc.footer.popular = doc.footer.popular.filter((x) => x !== slug);
    for (const s of doc.services) {
      s.related = s.related.filter((x) => x !== slug);
      for (const it of [...s.why.items, ...s.options.items]) if (it.link === slug) it.link = '';
    }
    for (const m of doc.menu) m.items = m.items.filter((it) => it.href !== `/${slug}`);
    if (isLiveService(slug) && !doc.redirects.some((r) => r.from === `/${slug}`)) doc.redirects.push({ from: `/${slug}`, to: '/services' });
  }
  const uniqueSlug = (base, taken) => { let s = base || 'novo-servico'; let i = 2; while (taken.includes(s)) s = `${base}-${i++}`; return s; };

  function newService() {
    const name = h('input', { type: 'text', placeholder: 'Ex.: Floor Graphics' });
    const group = h('select', null, S.doc.servicesPage.groups.map((g) => h('option', { value: g.key }, g.label)));
    modal({
      title: 'Novo serviço',
      body: [
        h('div', { class: 'f' }, h('label', { class: 'f__label' }, 'Nome do serviço (em inglês, como no site)'), name),
        h('div', { class: 'f' }, h('label', { class: 'f__label' }, 'Grupo'), group),
        note('O serviço novo começa <b>escondido</b>. Preencha os textos e a foto, e depois ligue em “Básico”.'),
      ],
      actions: [{ label: 'Cancelar' }, {
        label: 'Criar serviço',
        cls: 'btn--pink',
        run: () => {
          const n = name.value.trim();
          if (!n) { toast('Escreva o nome do serviço.', 'err'); return false; }
          const s = clone(S.templates.service);
          Object.assign(s, {
            name: n, short: n, group: group.value, hidden: true,
            slug: uniqueSlug(slugify(n), [...S.doc.services.map((x) => x.slug), 'services', 'contact', 'join-us', 'blog', 'admin']),
            eyebrow: `${n} Adelaide`, title: `${n} Adelaide | Bora Signs`, h1: n,
            why: { title: `Why ${n.toLowerCase()}?`, items: [] }, options: { title: 'What we do', items: [] },
          });
          S.doc.services.push(s);
          changed();
          location.hash = `#/services/${s.slug}`;
          return true;
        },
      }],
    });
  }

  function duplicateService(s) {
    const c = clone(s);
    c.name = `${s.name} (cópia)`;
    c.slug = uniqueSlug(`${s.slug}-copia`, S.doc.services.map((x) => x.slug));
    c.hidden = true;
    S.doc.services.splice(S.doc.services.indexOf(s) + 1, 0, c);
    changed();
    toast('Cópia criada (escondida).');
    location.hash = `#/services/${c.slug}`;
  }

  async function deleteService(s) {
    const ok = await confirmBox('Apagar serviço?', `A página “${s.name}” sai do site${isLiveService(s.slug) ? ` e o endereço /${s.slug} passa a levar para a página de serviços` : ''}. Só vale depois de publicar.`, { ok: 'Apagar serviço', danger: true });
    if (!ok) return;
    S.doc.services = S.doc.services.filter((x) => x !== s);
    removeServiceRefs(s.slug);
    changed();
    location.hash = '#/services';
  }

  function viewServices() {
    const list = S.doc.services;
    render(
      head('Serviços', 'Cada serviço tem a própria página, com endereço próprio para anúncios e Google. A ordem aqui é a ordem na página de serviços.', [button('Novo serviço', newService, { icon: 'plus', cls: 'btn--pink' })]),
      h('div', { class: 'card rows' }, list.map((s, i) => h('div', { class: 'row-item' },
        h('a', { href: `#/services/${s.slug}`, style: { display: 'contents' } },
          h('div', { class: 'thumb' }, thumbUrl(s.image) ? h('img', { src: thumbUrl(s.image), alt: '', loading: 'lazy' }) : ic('image')),
          h('div', { class: 'row-item__main' }, h('b', null, s.name || 'Sem nome'), h('span', null, `/${s.slug} · ${groupLabel(s.group)}`))),
        s.hidden ? pill('Escondido', 'amber') : null,
        !isLiveService(s.slug) ? pill('Novo', 'violet') : null,
        h('div', { class: 'row-item__tools' },
          btnIcon('up', 'Subir', () => { list.splice(i - 1, 0, list.splice(i, 1)[0]); changed(); viewServices(); }, i === 0),
          btnIcon('down', 'Descer', () => { list.splice(i + 1, 0, list.splice(i, 1)[0]); changed(); viewServices(); }, i === list.length - 1),
          btnIcon('copy', 'Duplicar', () => duplicateService(s)),
          btnIcon('trash', 'Apagar', () => deleteService(s), false, 'btn--danger'))))),
    );
    return { title: 'Serviços', preview: '/services' };
  }

  function menuPlacement(s) {
    const groups = S.doc.menu.filter((m) => m.items.length);
    if (!groups.length) return null;
    return h('div', { class: 'f' }, h('div', { class: 'f__label' }, 'No menu do site'),
      h('div', { style: { display: 'flex', gap: '18px', flexWrap: 'wrap' } }, groups.map((m) => {
        const input = h('input', { type: 'checkbox', checked: m.items.some((it) => it.href === `/${s.slug}`) });
        input.addEventListener('change', () => {
          if (input.checked) m.items.push({ label: s.name, href: `/${s.slug}` });
          else m.items = m.items.filter((it) => it.href !== `/${s.slug}`);
          changed();
        });
        return h('label', { class: 'toggle' }, input, h('span', { class: 'toggle__ui' }), m.label);
      })),
      h('div', { class: 'f__help', html: 'Para mudar a ordem ou o texto no menu, use <a href="#/menu">Menu e rodapé</a>.' }));
  }

  function viewService(slug) {
    const s = S.doc.services.find((x) => x.slug === slug);
    if (!s) {
      render(head('Serviço não encontrado', 'Talvez o endereço tenha mudado.', [], [['Serviços', '#/services']]));
      return { title: 'Serviços', preview: '/services' };
    }
    const itemDefs = [{ t: 'row', cols: [{ k: 'title', l: 'Título' }, { k: 'link', t: 'service', l: 'Link para outro serviço (opcional)' }] }, { k: 'text', l: 'Texto', t: 'area', rows: 2 }];
    const titleEl = h('h1', null, s.name);
    const headEl = head('', null, [
      isLiveService(s.slug) && !s.hidden ? h('a', { class: 'btn', href: liveLink(`/${s.slug}`), target: '_blank', rel: 'noopener' }, ic('external'), 'Ver no site') : null,
      button('Duplicar', () => duplicateService(s), { icon: 'copy' }),
      button('Apagar', () => deleteService(s), { icon: 'trash', cls: 'btn--danger' }),
    ].filter(Boolean), [['Serviços', '#/services']]);
    headEl.querySelector('h1').replaceWith(titleEl);
    render(
      headEl,
      s.hidden ? note('Este serviço está <b>escondido</b>: não aparece no site, nos menus nem no Google. Quando estiver pronto, desligue “Esconder do site” aqui embaixo.', true) : null,
      sec('Básico', 'Nome, endereço e onde aparece.', 'tag', [
        ...fields(s, [
          { t: 'row', cols: [{ k: 'name', l: 'Nome do serviço', onInput: (v) => { titleEl.textContent = v; topTitle.textContent = v || 'Serviço'; } }, { k: 'short', l: 'Nome curto', help: 'Para espaços pequenos.' }] },
          { k: 'slug', t: 'slug', l: 'Endereço da página', help: 'Se mudar, o endereço antigo continua funcionando e leva para o novo.', onRename: (a, b) => { renameServiceRefs(a, b); history.replaceState(null, '', `#/services/${b}`); setPreviewPath(`/${b}`); } },
          { t: 'row', cols: [{ k: 'group', t: 'select', l: 'Grupo na página de serviços', options: () => S.doc.servicesPage.groups.map((g) => [g.key, g.label]) }, { k: 'feature', t: 'select', l: 'Recurso especial', options: [['', 'Nenhum'], ['wrap-slider', 'Van antes/depois com preço'], ['finishes', 'Acabamentos (Decor)']] }] },
          { k: 'hidden', t: 'toggle', l: 'Esconder do site', onInput: () => setTimeout(route, 0) },
          { k: 'card', l: 'Texto do card', t: 'area', rows: 2, help: 'Aparece no card do serviço, na home e na página de serviços.' },
        ]),
        menuPlacement(s),
      ], { open: true }),
      sec('Google', 'Como a página aparece nas buscas.', 'search', [R.seo(s, { path: () => `/${s.slug}` })]),
      sec('Topo da página', 'O que aparece primeiro na página.', 'sparkle', fields(s, [
        { k: 'eyebrow', l: 'Etiqueta acima do título' }, { k: 'h1', l: 'Título', t: 'area', rows: 2, mark: true }, { k: 'lead', l: 'Texto abaixo do título', t: 'area', rows: 3 },
      ])),
      sec('Foto do serviço', 'No card do serviço, nos relacionados e na prévia do link (WhatsApp, Facebook).', 'image', fields(s, [
        { k: 'image', t: 'image', l: 'Foto', clear: false },
        { k: 'imageAlt', l: 'Descrição da foto', help: 'Para o Google e para quem usa leitor de tela. Ex.: “Van com envelopamento completo da Omkar”.' },
      ])),
      sec('Por que contratar', 'Os cards numerados.', 'star', fields(s.why, [
        { k: 'title', l: 'Título', mark: true },
        { k: 'items', t: 'list', l: 'Motivos', item: itemDefs, add: () => ({ title: '', text: '', link: '' }), addLabel: 'Adicionar motivo' },
      ])),
      sec('O que fazemos', 'A lista de opções com ✓.', 'check', fields(s.options, [
        { k: 'title', l: 'Título', mark: true },
        { k: 'items', t: 'list', l: 'Opções', item: itemDefs, add: () => ({ title: '', text: '', link: '' }), addLabel: 'Adicionar opção' },
      ])),
      sec('Galeria', 'Aparece quando há 2 fotos ou mais.', 'image', fields(s, [{ k: 'gallery', t: 'images', l: 'Fotos da galeria' }])),
      sec('Depoimento', '', 'quote', fields(s.quote, [{ k: 'text', l: 'Depoimento', t: 'area', rows: 3 }, { t: 'row', cols: [{ k: 'name', l: 'Nome' }, { k: 'role', l: 'Empresa ou cargo (opcional)' }] }])),
      sec('Dúvidas frequentes', 'Também vão para o Google como perguntas e respostas.', 'help', fields(s, [
        { k: 'faq', t: 'list', l: 'Perguntas', title: (it) => it.q, item: [{ k: 'q', l: 'Pergunta' }, { k: 'a', l: 'Resposta', t: 'area', rows: 3 }], add: () => ({ q: '', a: '' }), addLabel: 'Adicionar pergunta' },
      ])),
      sec('Serviços relacionados', 'No fim da página.', 'layers', fields(s, [{ k: 'related', t: 'services', l: 'Relacionados', exclude: s.slug, help: 'O ideal são 4.' }])),
      sec('Chamada final', 'O bloco de orçamento do fim.', 'send', fields(s, [{ k: 'ctaTitle', l: 'Título', mark: true }])),
    );
    return { title: s.name || 'Serviço', preview: `/${s.slug}` };
  }

  /* other pages */

  const PAGES = {
    services: {
      title: 'Página de serviços', path: '/services', obj: () => S.doc.servicesPage,
      desc: 'A página com todos os serviços, separados por grupo.',
      secs: (o) => [
        sec('Google', '', 'search', [R.seo(o, { k: 'seo', path: '/services' })]),
        sec('Topo da página', '', 'sparkle', fields(o, [{ k: 'eyebrow', l: 'Etiqueta' }, { k: 'title', l: 'Título', mark: true }, { k: 'lead', l: 'Texto', t: 'area', rows: 3 }, { k: 'button', l: 'Botão' }]), { open: true }),
        sec('Grupos', 'Cada serviço escolhe o seu grupo (em Serviços → Básico).', 'layers', fields(o, [
          { k: 'groups', t: 'list', l: 'Grupos', title: (g) => g.label, item: [{ t: 'row', cols: [{ k: 'label', l: 'Nome do grupo' }, { k: 'title', l: 'Título da seção', mark: true }] }], add: () => ({ key: `grupo-${uid(4)}`, label: '', title: '' }), addLabel: 'Adicionar grupo' },
          { t: 'note', html: 'Serviços de um grupo apagado deixam de aparecer nesta página.' },
        ])),
        sec('Prévia do link', 'A imagem que aparece quando alguém compartilha esta página.', 'image', fields(o, [{ k: 'image', t: 'image', l: 'Imagem' }])),
      ],
    },
    contact: {
      title: 'Contato', path: '/contact', obj: () => S.doc.contact,
      desc: 'A página de orçamento. O formulário manda o pedido para o ShopVox e guarda uma cópia em Mensagens.',
      secs: (o) => [
        sec('Google', '', 'search', [R.seo(o, { k: 'seo', path: '/contact' })]),
        sec('Topo da página', '', 'sparkle', fields(o, [{ k: 'eyebrow', l: 'Etiqueta' }, { k: 'title', l: 'Título', mark: true }, { k: 'lead', l: 'Texto', t: 'area', rows: 3 }]), { open: true }),
        sec('Formulário', '', 'mail', fields(o, [
          { k: 'formTitle', l: 'Título do formulário' }, { k: 'placeholder', l: 'Exemplo dentro do campo da mensagem' }, { k: 'filesHint', l: 'Dica do campo de arquivos' },
          { t: 'row', cols: [{ k: 'submit', l: 'Botão de enviar' }, { k: 'follow', l: 'Texto acima das redes sociais' }] },
          { t: 'note', html: 'Telefone, e-mail e endereço ficam em <a href="#/settings/company">Configurações → Empresa</a>. As chaves do ShopVox ficam em <a href="#/settings/integrations">Integrações</a>.' },
        ])),
      ],
    },
    join: {
      title: 'Trabalhe conosco', path: '/join-us', obj: () => S.doc.join,
      desc: 'A página para quem quer trabalhar na Bora. As candidaturas chegam em Mensagens.',
      secs: (o) => [
        sec('Google', '', 'search', [R.seo(o, { k: 'seo', path: '/join-us' })]),
        sec('Topo da página', '', 'sparkle', fields(o, [{ k: 'eyebrow', l: 'Etiqueta' }, { k: 'title', l: 'Título', mark: true }, { k: 'lead', l: 'Texto', t: 'area', rows: 3 }]), { open: true }),
        sec('Para quem é', '', 'users', fields(o, [{ k: 'whoTitle', l: 'Título' }, { k: 'whoText', l: 'Texto', t: 'area', rows: 4 }, { k: 'skills', t: 'strings', l: 'Experiências', help: 'Também viram as opções do formulário.', addLabel: 'Adicionar experiência' }])),
        sec('O que buscamos', '', 'star', fields(o, [{ k: 'lookTitle', l: 'Título' }, { k: 'look', t: 'strings', l: 'Itens', addLabel: 'Adicionar item' }, { k: 'lookNote', l: 'Frase final' }])),
        sec('Depois de se candidatar', '', 'clock', fields(o, [{ k: 'stepsTitle', l: 'Título' }, { k: 'steps', t: 'strings', l: 'Passos', addLabel: 'Adicionar passo' }])),
        sec('Formulário', '', 'mail', fields(o, [{ k: 'formTitle', l: 'Título' }, { k: 'workTypes', t: 'strings', l: 'Tipos de vaga', addLabel: 'Adicionar tipo' }, { k: 'submit', l: 'Botão de enviar' }, { k: 'thanks', l: 'Mensagem depois de enviar', t: 'area', rows: 2 }])),
        sec('Prévia do link', '', 'image', fields(o, [{ k: 'image', t: 'image', l: 'Imagem' }])),
      ],
    },
    thanks: {
      title: 'Obrigado', path: '/thank-you', obj: () => S.doc.thanks,
      desc: 'A página que aparece depois de pedir um orçamento.',
      secs: (o) => [sec('Textos', '', 'check', fields(o, [{ k: 'eyebrow', l: 'Etiqueta' }, { k: 'title', l: 'Título', mark: true }, { k: 'lead', l: 'Texto', t: 'area', rows: 3 }]), { open: true })],
    },
    404: {
      title: 'Página 404', path: '/__404', obj: () => S.doc.notFound,
      desc: 'Aparece quando alguém abre um endereço que não existe.',
      secs: (o) => [sec('Textos', '', 'help', fields(o, [{ k: 'eyebrow', l: 'Etiqueta' }, { k: 'title', l: 'Título', mark: true }, { k: 'lead', l: 'Texto', t: 'area', rows: 3 }]), { open: true })],
    },
  };

  function viewPage(name) {
    const p = PAGES[name];
    render(head(p.title, p.desc, p.path !== '/__404' ? [h('a', { class: 'btn', href: liveLink(p.path), target: '_blank', rel: 'noopener' }, ic('external'), 'Ver no site')] : [], [['Outras páginas', '#/pages/services']]), ...p.secs(p.obj()));
    return { title: p.title, preview: p.path };
  }

  function viewBlocks() {
    const doc = S.doc;
    render(
      head('Blocos repetidos', 'Partes que aparecem em várias páginas. Mudou aqui, muda em todas.'),
      sec('Processo em 4 passos', 'Na home, nos serviços, na página de serviços e no contato.', 'clock', fields(doc.process, [
        { k: 'kicker', l: 'Etiqueta' }, { k: 'title', l: 'Título', mark: true }, { k: 'lead', l: 'Texto', t: 'area', rows: 2 },
        { k: 'steps', t: 'list', l: 'Passos', item: [{ k: 'title', l: 'Título' }, { k: 'text', l: 'Texto', t: 'area', rows: 2 }], add: () => ({ title: '', text: '' }), addLabel: 'Adicionar passo' },
      ]), { open: true }),
      sec('Chamada final', 'O bloco “Get your free quote” no fim das páginas.', 'send', fields(doc.cta, [
        { k: 'kicker', l: 'Etiqueta' }, { k: 'title', l: 'Título', mark: true, help: 'Cada serviço pode ter um título próprio (no fim da página do serviço).' }, { k: 'text', l: 'Texto', t: 'area', rows: 2 },
        { t: 'row', cols: [{ k: 'button', l: 'Botão' }, { k: 'call', l: 'Palavra antes do telefone' }] },
      ])),
      sec('Cabeçalho', 'A barra do topo.', 'menu', fields(doc.header, [{ k: 'button', l: 'Botão do topo' }])),
      sec('Textos das páginas de serviço', 'Títulos e botões que se repetem em todos os serviços.', 'layers', fields(doc.servicePage, [
        { t: 'row', cols: [{ k: 'button', l: 'Botão de orçamento' }, { k: 'sliderButton', l: 'Botão da van' }] },
        { t: 'row', cols: [{ k: 'optionsKicker', l: 'Etiqueta de “O que fazemos”' }, { k: 'optionsButton', l: 'Botão de “O que fazemos”' }] },
        { t: 'row', cols: [{ k: 'faqKicker', l: 'Etiqueta das dúvidas' }, { k: 'faqTitle', l: 'Título das dúvidas', mark: true }] },
        { t: 'row', cols: [{ k: 'relatedKicker', l: 'Etiqueta dos relacionados' }, { k: 'relatedTitle', l: 'Título dos relacionados', mark: true }] },
        { k: 'cardLink', l: 'Texto do link nos cards de serviço' },
      ])),
    );
    return { title: 'Blocos repetidos', preview: '/' };
  }

  function viewMenu() {
    const doc = S.doc;
    render(
      head('Menu e rodapé', 'O menu do topo (também no celular) e os links do rodapé.'),
      sec('Menu principal', 'Itens com subitens viram menus que abrem.', 'menu', fields(doc, [{
        k: 'menu', t: 'list', l: 'Itens do menu', title: (m) => `${m.label}${m.items.length ? `  ·  ${m.items.length} subitens` : ''}`,
        item: [
          { t: 'row', cols: [{ k: 'label', l: 'Texto' }, { k: 'href', t: 'link', l: 'Leva para', optional: true }] },
          { k: 'items', t: 'list', l: 'Subitens', title: (it) => it.label, item: [{ t: 'row', cols: [{ k: 'label', l: 'Texto' }, { k: 'href', t: 'link', l: 'Leva para' }] }], add: () => ({ label: '', href: '/' }), addLabel: 'Adicionar subitem' },
        ],
        add: () => ({ label: '', href: '/', items: [] }), addLabel: 'Adicionar item ao menu',
      }]), { open: true }),
      sec('Rodapé', '', 'file', fields(doc.footer, [
        { k: 'text', l: 'Texto ao lado do logo', t: 'area', rows: 2, help: 'Vem depois do slogan (que fica em Configurações → Empresa).' },
        { k: 'ticker', l: 'Faixa que passa no topo do rodapé', help: 'Deixe vazio para tirar a faixa.' },
        { t: 'row', cols: [{ k: 'popularTitle', l: 'Título da coluna de serviços' }, { k: 'companyTitle', l: 'Título da coluna da empresa' }] },
        { k: 'popular', t: 'services', l: 'Serviços no rodapé' },
        { k: 'company', t: 'list', l: 'Links da coluna da empresa', title: (it) => it.label, item: [{ t: 'row', cols: [{ k: 'label', l: 'Texto' }, { k: 'href', t: 'link', l: 'Leva para' }] }], add: () => ({ label: '', href: '/' }), addLabel: 'Adicionar link' },
        { t: 'note', html: 'O link do <b>Blog</b> entra sozinho nessa coluna quando houver posts publicados.' },
        { t: 'row', cols: [{ k: 'contactTitle', l: 'Título da coluna de contato' }, { k: 'baseLine', l: 'Frase no pé da página' }] },
        { t: 'row', cols: [{ k: 'dockCall', l: 'Barra do celular: botão de ligar' }, { k: 'dockQuote', l: 'Barra do celular: botão de orçamento' }] },
      ])),
    );
    return { title: 'Menu e rodapé', preview: '/' };
  }

  /* blog */

  const postState = (p) => (p.status !== 'published' ? ['Rascunho', ''] : p.date && p.date > today() ? ['Agendado', 'violet'] : ['Publicado', 'green']);
  const autoSlug = new WeakSet();

  function viewBlog() {
    const posts = [...S.doc.posts].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    render(
      head('Blog', 'Posts ajudam o site a aparecer no Google: dicas, trabalhos recentes, novidades.', [
        button('Configurações do blog', () => { location.hash = '#/blog/settings'; }, { icon: 'gear' }),
        button('Novo post', () => { location.hash = '#/blog/new'; }, { icon: 'plus', cls: 'btn--pink' }),
      ]),
      !S.doc.blog.enabled ? note('O blog está <b>desligado</b>: os posts não aparecem no site. Ligue em Configurações do blog.', true) : null,
      posts.length ? h('div', { class: 'card rows' }, posts.map((p) => {
        const [label, tone] = postState(p);
        return h('a', { class: 'row-item', href: `#/blog/${p.id}` },
          h('div', { class: 'thumb' }, thumbUrl(p.cover) ? h('img', { src: thumbUrl(p.cover), alt: '', loading: 'lazy' }) : ic('pen')),
          h('div', { class: 'row-item__main' }, h('b', null, p.title || 'Sem título'), h('span', null, `${p.date ? fmtDate(p.date, false) : 'Sem data'} · /blog/${p.slug}`)),
          pill(label, tone));
      })) : h('div', { class: 'card empty' }, ic('pen'), h('p', null, 'Nenhum post ainda.'), button('Escrever o primeiro post', () => { location.hash = '#/blog/new'; }, { icon: 'plus', cls: 'btn--pink' })),
    );
    return { title: 'Blog', preview: '/blog' };
  }

  function viewBlogSettings() {
    const b = S.doc.blog;
    render(
      head('Configurações do blog', '', [], [['Blog', '#/blog']]),
      sec('Blog', '', 'gear', fields(b, [
        { k: 'enabled', t: 'toggle', l: 'Blog ligado', help: 'Desligado, a página /blog e os posts saem do site.' },
        { k: 'footerLabel', l: 'Nome do link no rodapé' }, { k: 'readMore', l: 'Texto “leia mais” dos cards' }, { k: 'empty', l: 'Texto quando ainda não há posts' },
      ]), { open: true }),
      sec('Página do blog', 'A lista de posts em /blog.', 'file', fields(b, [{ k: 'eyebrow', l: 'Etiqueta' }, { k: 'title', l: 'Título', mark: true }, { k: 'lead', l: 'Texto', t: 'area', rows: 2 }]), { open: true }),
      sec('Google', '', 'search', [R.seo(b, { k: 'seo', path: '/blog' })]),
    );
    return { title: 'Configurações do blog', preview: '/blog' };
  }

  function viewPost(id) {
    if (id === 'new') {
      const p = { ...clone(S.templates.post), id: uid(10), date: today(), slug: `novo-post-${uid(4)}`, status: 'draft' };
      S.doc.posts.unshift(p);
      autoSlug.add(p);
      changed();
      location.replace(`#/blog/${p.id}`);
      return null;
    }
    const p = S.doc.posts.find((x) => x.id === id);
    if (!p) {
      render(head('Post não encontrado', '', [], [['Blog', '#/blog']]));
      return { title: 'Blog', preview: '/blog' };
    }
    const titleEl = h('h1', null, p.title || 'Novo post');
    const live = S.live.posts.find((x) => x.id === p.id);
    const headEl = head('', null, [
      live && live.status === 'published' ? h('a', { class: 'btn', href: liveLink(`/blog/${live.slug}`), target: '_blank', rel: 'noopener' }, ic('external'), 'Ver no site') : null,
      button('Apagar', async () => {
        if (!(await confirmBox('Apagar post?', `“${p.title || 'Sem título'}” sai do blog depois de publicar.`, { ok: 'Apagar post', danger: true }))) return;
        S.doc.posts = S.doc.posts.filter((x) => x !== p);
        if (live && live.status === 'published' && !S.doc.redirects.some((r) => r.from === `/blog/${live.slug}`)) S.doc.redirects.push({ from: `/blog/${live.slug}`, to: '/blog' });
        changed();
        location.hash = '#/blog';
      }, { icon: 'trash', cls: 'btn--danger' }),
    ].filter(Boolean), [['Blog', '#/blog']]);
    headEl.querySelector('h1').replaceWith(titleEl);
    const statusNote = h('div');
    const drawStatus = () => {
      const [label] = postState(p);
      statusNote.replaceChildren(label === 'Rascunho' ? note('Este post é um <b>rascunho</b>: não aparece no site. Mude o status para “Publicado” em Publicação e depois clique em Publicar.', true)
        : label === 'Agendado' ? note(`<b>Agendado</b>: aparece no site a partir de ${fmtDate(p.date, false)} (depois de clicar em Publicar).`) : '');
    };
    drawStatus();
    let slugField;
    render(
      headEl, statusNote,
      sec('Texto', '', 'pen', fields(p, [
        { k: 'title', l: 'Título', onInput: (v) => {
          titleEl.textContent = v || 'Novo post';
          topTitle.textContent = v || 'Novo post';
          if (autoSlug.has(p) && slugify(v)) {
            const s = slugify(v);
            const taken = S.doc.posts.filter((x) => x !== p).map((x) => x.slug);
            p.slug = taken.includes(s) ? `${s}-${uid(3)}` : s;
            const input = slugField && slugField.querySelector('input');
            if (input) input.value = p.slug;
            setPreviewPath(`/blog/${p.slug}`);
          }
        } },
        { k: 'excerpt', l: 'Resumo', t: 'area', rows: 2, help: 'Aparece na lista do blog e embaixo do título. Se ficar vazio, usamos o começo do texto.' },
        { k: 'body', t: 'rich', l: 'Texto do post' },
      ]), { open: true }),
      sec('Publicação', 'Status, data e endereço.', 'cal', [
        ...fields(p, [{ t: 'row', cols: [
          { k: 'status', t: 'select', l: 'Status', options: [['published', 'Publicado'], ['draft', 'Rascunho (não aparece)']], onInput: drawStatus },
          { k: 'date', t: 'date', l: 'Data', onInput: drawStatus },
        ] }]),
        (slugField = R.slug(p, { k: 'slug', l: 'Endereço', prefix: 'blog/', onRename: (a, b) => {
          autoSlug.delete(p);
          if (live && live.slug === a && live.status === 'published' && !S.doc.redirects.some((r) => r.from === `/blog/${a}`)) S.doc.redirects.push({ from: `/blog/${a}`, to: `/blog/${b}` });
          setPreviewPath(`/blog/${b}`);
        } })),
      ], { open: true }),
      sec('Imagem de capa', 'Na lista do blog, no topo do post e na prévia do link.', 'image', fields(p, [{ k: 'cover', t: 'image', l: 'Capa' }, { k: 'coverAlt', l: 'Descrição da imagem' }])),
      sec('Google', 'Se ficar vazio, usamos o título e o resumo.', 'search', [R.seo(p, { tk: 'seoTitle', dk: 'seoDescription', path: () => `/blog/${p.slug}`, fallbackTitle: () => `${p.title} | Bora Signs`, fallbackDesc: () => p.excerpt })]),
    );
    slugField.querySelector('input').addEventListener('input', () => autoSlug.delete(p));
    return { title: p.title || 'Novo post', preview: `/blog/${p.slug}` };
  }

  /* media */

  function usageOf(ref) {
    const m = mediaRe.exec(ref);
    const id = m ? m[1] : ref;
    const has = (v) => typeof v === 'string' && (v === ref || v.includes(`/media/${id}`) || v.includes(`m:${id}:`));
    const out = [];
    const doc = S.doc;
    for (const s of doc.services) if (has(s.image) || s.gallery.some(has)) out.push(`Serviço: ${s.name}`);
    for (const p of doc.posts) if (has(p.cover) || has(p.body)) out.push(`Post: ${p.title || 'sem título'}`);
    if (doc.clients.items.some((c) => has(c.logo))) out.push('Logos de clientes');
    if (doc.finishes.items.some((f) => has(f.image))) out.push('Acabamentos (Decor)');
    if (has(doc.servicesPage.image) || has(doc.join.image) || has(doc.seo.ogImage)) out.push('Prévia de link');
    return out;
  }

  function mediaDetails(item, redraw) {
    const used = usageOf(item.ref);
    const full = `${location.origin}/media/${item.id}-${item.w > 800 ? 1600 : 800}.${item.ext}`;
    modal({
      title: item.name,
      wide: true,
      body: [
        h('img', { src: thumbUrl(item.ref).replace('-800.', item.w > 800 ? '-1600.' : '-800.'), alt: '', style: { maxHeight: '56vh', margin: '0 auto', borderRadius: '12px' } }),
        h('p', { class: 'f__help' }, `${item.w} × ${item.h} px · ${kb(item.size || 0)} · enviada ${fmtDate(item.at)}${item.by ? ` por ${item.by}` : ''}`),
        used.length ? note(`Em uso em: <b>${used.map((u) => u.replace(/</g, '&lt;')).join(', ')}</b>.`) : note('Esta foto não está em uso no painel.'),
      ],
      actions: [
        { label: 'Copiar link da foto', icon: 'link', run: async () => { try { await navigator.clipboard.writeText(full); toast('Link copiado.'); } catch { prompt('Link da foto:', full); } return false; } },
        { label: 'Apagar foto', cls: 'btn--danger', icon: 'trash', run: async () => {
          const ok = await confirmBox('Apagar foto?', used.length ? `Ela está em uso (${used.join(', ')}). Se apagar, esses lugares ficam sem a foto.` : 'A foto é apagada de vez.', { ok: 'Apagar', danger: true });
          if (!ok) return false;
          await api(`/api/media/${item.id}`, { method: 'DELETE' });
          S.media = S.media.filter((x) => x.id !== item.id);
          toast('Foto apagada.');
          redraw();
          return true;
        } },
        { label: 'Fechar', cls: 'btn--pink' },
      ],
    });
  }

  function viewMedia() {
    const grid = h('div', { class: 'media-grid' }, h('div', { class: 'loading-row' }, h('div', { class: 'boot__spin' })));
    const search = h('input', { type: 'search', class: 'input', placeholder: 'Procurar pelo nome…', style: { maxWidth: '280px' } });
    const drawGrid = () => {
      const q = search.value.trim().toLowerCase();
      const list = (S.media || []).filter((m) => !q || m.name.toLowerCase().includes(q));
      grid.replaceChildren(...list.map((it) => mediaCard(it, () => mediaDetails(it, drawGrid))));
      if (!list.length) grid.append(h('p', { class: 'f__help' }, q ? 'Nenhuma foto com esse nome.' : 'Nenhuma foto enviada ainda.'));
    };
    search.addEventListener('input', drawGrid);
    render(
      head('Fotos', 'As fotos enviadas aqui aparecem em todos os campos de imagem. O painel diminui as fotos sozinho para o site continuar rápido.'),
      uploader(drawGrid),
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', margin: '22px 0 10px' } }, h('h2', { class: 'h2', style: { margin: 0 } }, 'Fotos enviadas'), search),
      grid,
      h('details', { class: 'card sec', style: { marginTop: '22px' } },
        h('summary', null, h('span', { class: 'sec__ico' }, ic('image')), h('div', null, h('h2', null, 'Fotos que vieram com o site'), h('p', null, 'Podem ser usadas em qualquer campo; não dá para apagar.')), ic('down', 'chev')),
        h('div', { class: 'sec__body' }, h('div', { class: 'media-grid' }, builtinItems().map((it) => mediaCard(it, () => {}))))),
    );
    loadMedia(true).then(drawGrid).catch(oops);
    return { title: 'Fotos', preview: null };
  }

  /* messages */

  const FIELD_NAMES = {
    primaryContactName: 'Nome', name: 'Nome', email: 'E-mail', phone: 'Telefone', phone_number: 'Telefone', company_name: 'Empresa',
    suburb: 'Bairro', page: 'Enviado da página', service: 'Serviço', details: 'Mensagem', message: 'Mensagem', experience: 'Experiência', work_type: 'Procura', files: 'Arquivos anexados (foram para o ShopVox)',
  };
  function viewMessages() {
    const listEl = h('div', { class: 'inbox__list' }, h('div', { class: 'loading-row' }, h('div', { class: 'boot__spin' })));
    const readEl = h('div', { class: 'inbox__read' }, h('div', { class: 'empty' }, ic('inbox'), h('p', null, 'Escolha uma mensagem.')));
    const box = h('div', { class: 'card inbox' }, listEl, readEl);
    let items = [];
    let current = null;
    const kindPill = (k) => (k === 'join' ? pill('Trabalhe conosco', 'violet') : pill('Orçamento', 'pink'));
    const drawList = () => {
      listEl.replaceChildren(...items.map((m) => h('button', {
        class: `row-item${m.read ? '' : ' is-unread'}${current === m.id ? ' is-on' : ''}`, type: 'button', onclick: () => open(m),
      }, h('div', { class: 'row-item__main' }, h('b', null, m.name || m.email || 'Sem nome'), h('span', null, `${fmtDate(m.at)} · ${m.email || ''}`)), kindPill(m.kind))));
      if (!items.length) listEl.append(h('div', { class: 'empty' }, ic('inbox'), h('p', null, 'Nenhuma mensagem ainda. Os pedidos de orçamento e as candidaturas do site aparecem aqui.')));
    };
    const open = async (m) => {
      current = m.id;
      box.classList.add('is-reading');
      drawList();
      readEl.replaceChildren(h('div', { class: 'loading-row' }, h('div', { class: 'boot__spin' })));
      try {
        const { message } = await api(`/api/messages/${m.id}`);
        if (!m.read) {
          api(`/api/messages/${m.id}/read`, { method: 'POST', body: { read: true } }).catch(() => {});
          m.read = true;
          S.unread = Math.max(0, S.unread - 1);
          drawNav();
          drawList();
        }
        const f = message.fields || {};
        const email = f.email || '';
        const phone = f.phone || f.phone_number || '';
        readEl.replaceChildren(...[
          h('button', { class: 'btn btn--sm btn--ghost inbox__back', type: 'button', onclick: () => box.classList.remove('is-reading'), style: { marginBottom: '10px' } }, ic('back', 'ic--sm'), 'Voltar'),
          h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } }, kindPill(message.kind), h('span', { class: 'f__help' }, fmtDate(message.at))),
          h('h2', null, f.name || f.primaryContactName || email || 'Sem nome'),
          h('dl', { class: 'msg-fields' }, Object.entries(f).map(([k, v]) => h('div', null, h('dt', null, FIELD_NAMES[k] || k.replace(/_/g, ' ')), h('dd', null, v)))),
          message.kind === 'quote' ? note('Pedidos de orçamento também entram no ShopVox (com os arquivos). Esta é uma cópia de segurança.') : null,
          h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' } },
            email ? h('a', { class: 'btn btn--pink', href: `mailto:${email}?subject=${encodeURIComponent('Bora Signs')}` }, ic('mail'), 'Responder por e-mail') : null,
            phone ? h('a', { class: 'btn', href: `tel:${phone.replace(/[^\d+]/g, '')}` }, ic('phone'), 'Ligar') : null,
            button('Marcar como não lida', async () => { await api(`/api/messages/${m.id}/read`, { method: 'POST', body: { read: false } }); m.read = false; S.unread += 1; drawNav(); drawList(); }, { icon: 'mail' }),
            button('Apagar', async () => {
              if (!(await confirmBox('Apagar mensagem?', 'Ela é apagada de vez.', { ok: 'Apagar', danger: true }))) return;
              await api(`/api/messages/${m.id}`, { method: 'DELETE' });
              items = items.filter((x) => x !== m);
              current = null;
              box.classList.remove('is-reading');
              readEl.replaceChildren(h('div', { class: 'empty' }, ic('inbox'), h('p', null, 'Mensagem apagada.')));
              drawList();
            }, { icon: 'trash', cls: 'btn--danger' }))].filter(Boolean));
      } catch (e) { oops(e); }
    };
    render(head('Mensagens', 'Pedidos de orçamento (cópia do que vai para o ShopVox) e candidaturas do Trabalhe conosco.'), box);
    api('/api/messages').then(({ messages }) => {
      items = messages;
      S.unread = items.filter((m) => !m.read).length;
      drawNav();
      drawList();
    }).catch(oops);
    return { title: 'Mensagens', preview: null };
  }

  /* history */

  function viewHistory() {
    const list = h('div', { class: 'card rows' }, h('div', { class: 'loading-row' }, h('div', { class: 'boot__spin' })));
    render(head('Histórico', 'Cada publicação fica guardada (as últimas 60). Dá para ver como estava e voltar a qualquer uma.'), list);
    api('/api/revisions').then(({ revisions, live }) => {
      if (!revisions.length) {
        list.replaceChildren(h('div', { class: 'empty' }, ic('clock'), h('p', null, 'Nada publicado pelo painel ainda. O site mostra o conteúdo original.')));
        return;
      }
      list.replaceChildren(...revisions.map((r) => h('div', { class: 'row-item' },
        h('span', { class: 'sec__ico' }, ic('clock')),
        h('div', { class: 'row-item__main' }, h('b', null, fmtDate(r.at)), h('span', null, [r.by, r.note].filter(Boolean).join(' · ') || '—')),
        live && live.ver === r.ver ? pill('No ar', 'green') : null,
        h('div', { class: 'row-item__tools' },
          button('Ver', async () => {
            try {
              const { content } = await api(`/api/revisions/${r.ver}`);
              const frame = h('iframe', { style: { width: '100%', height: '62vh', border: '0', borderRadius: '12px', background: '#0c0612' } });
              modal({ title: `Versão de ${fmtDate(r.at)}`, wide: true, body: [frame], actions: [{ label: 'Fechar' }, { label: 'Voltar para esta versão', cls: 'btn--pink', icon: 'undo', run: () => restore(content) }] });
              frame.srcdoc = await previewHtml(content, '/');
            } catch (e) { oops(e); }
          }, { cls: 'btn--sm', icon: 'eye' }),
          live && live.ver === r.ver ? null : button('Voltar para esta', async () => {
            try { restore((await api(`/api/revisions/${r.ver}`)).content); } catch (e) { oops(e); }
          }, { cls: 'btn--sm', icon: 'undo' })))));
    }).catch(oops);
    const restore = async (content) => {
      if (isDirty() && !(await confirmBox('Trocar pelo que estava?', 'As alterações não salvas que você fez agora serão substituídas.', { ok: 'Trocar', danger: true }))) return false;
      S.doc = clone(content);
      changed();
      toast('Versão carregada no painel. Confira na prévia e clique em Publicar para colocar no ar.', 'ok', 7000);
      location.hash = '#/';
      return true;
    };
    return { title: 'Histórico', preview: null };
  }

  /* settings */

  const TABS = [
    ['company', 'Empresa', 'building'], ['social', 'Redes sociais', 'share'], ['google', 'Google', 'star'], ['stats', 'Números', 'chart'],
    ['clients', 'Clientes', 'users2'], ['van', 'Van antes/depois', 'van'], ['finishes', 'Acabamentos', 'palette'], ['seo', 'SEO', 'search'],
    ['integrations', 'Integrações', 'plug'], ['redirects', 'Redirecionamentos', 'route'],
  ];

  function viewSettings(tab = 'company') {
    if (!TABS.some(([k]) => k === tab)) tab = 'company';
    const doc = S.doc;
    const tabs = h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' } },
      TABS.map(([k, l, i]) => h('a', { class: `btn btn--sm${k === tab ? ' btn--dark' : ''}`, href: `#/settings/${k}` }, ic(i, 'ic--sm'), l)));
    const body = {
      company: () => [
        sec('Empresa', 'Aparece no rodapé, no contato e nos dados para o Google.', 'building', fields(doc.company, [
          { t: 'row', cols: [{ k: 'name', l: 'Nome' }, { k: 'legalName', l: 'Razão social' }] },
          { t: 'row', cols: [{ k: 'abn', l: 'ABN' }, { k: 'tagline', l: 'Slogan', help: 'Aparece no rodapé.' }] },
          { k: 'description', l: 'Descrição da empresa (para o Google)', t: 'area', rows: 3 },
        ]), { open: true }),
        sec('Contato', '', 'phone', fields(doc.company, [
          { t: 'row', cols: [{ k: 'phone', l: 'Telefone (como aparece)', ph: '0482 530 280' }, { k: 'phoneIntl', l: 'Telefone para ligar', ph: '+61482530280', help: 'Com +61 e sem espaços.' }] },
          { k: 'email', l: 'E-mail', type: 'email' },
          { t: 'note', html: 'Algumas descrições para o Google citam o telefone (ex.: na página de contato). Se mudar o número, confira lá também.' },
        ]), { open: true }),
        sec('Endereço', '', 'pin', fields(doc.company, [
          { k: 'address.street', l: 'Rua e número' },
          { t: 'row', cols: [{ k: 'address.locality', l: 'Bairro / cidade' }, { k: 'address.region', l: 'Estado' }, { k: 'address.postcode', l: 'CEP (postcode)' }] },
          { k: 'mapUrl', l: 'Link do Google Maps' },
          { k: 'areaServed', l: 'Área atendida' },
        ]), { open: true }),
      ],
      social: () => [sec('Redes sociais', 'Deixe vazio para esconder uma rede.', 'share', fields(doc.company.social, [
        { k: 'instagram', l: 'Instagram', ph: 'https://www.instagram.com/…' }, { k: 'facebook', l: 'Facebook' }, { k: 'tiktok', l: 'TikTok' }, { k: 'youtube', l: 'YouTube' }, { k: 'linkedin', l: 'LinkedIn' },
      ]), { open: true })],
      google: () => [sec('Nota do Google', 'O selo “5.0 ★★★★★ on Google” embaixo do título da home.', 'star', fields(doc.google, [
        { k: 'show', t: 'toggle', l: 'Mostrar o selo' }, { t: 'row', cols: [{ k: 'rating', l: 'Nota', ph: '5.0' }, { k: 'url', l: 'Link para as avaliações' }] },
      ]), { open: true })],
      stats: () => [sec('Números da home', 'Os números que contam na apresentação.', 'chart', fields(doc, [{
        k: 'stats', t: 'list', l: 'Números', title: (s) => `${s.value}${s.suffix} ${s.label}`, open: true,
        item: [{ t: 'row', cols: [{ k: 'value', t: 'number', l: 'Número' }, { k: 'suffix', l: 'Depois do número', ph: '+' }, { k: 'label', l: 'Legenda' }] }],
        add: () => ({ value: 0, suffix: '', label: '' }), addLabel: 'Adicionar número',
      }]), { open: true })],
      clients: () => [sec('Logos de clientes', 'A faixa de logos na home. Use logos claros (brancos) com fundo transparente (PNG).', 'users2', fields(doc.clients, [
        { k: 'title', l: 'Título da faixa' },
        { k: 'items', t: 'list', l: 'Logos', title: (c) => c.name, item: [{ k: 'name', l: 'Nome do cliente' }, { k: 'logo', t: 'image', l: 'Logo', logo: true }], add: () => ({ name: '', logo: '' }), addLabel: 'Adicionar logo' },
      ]), { open: true })],
      van: () => [
        sec('Preços da van', 'O antes/depois na página de vehicle signage: o preço sobe enquanto a pessoa arrasta.', 'van', fields(doc.van, [
          { t: 'row', cols: [{ k: 'min', t: 'number', l: 'Preço mínimo (AUD)', min: 0 }, { k: 'max', t: 'number', l: 'Preço máximo (AUD)', min: 0 }, { k: 'step', t: 'number', l: 'Arredondar de', min: 1, help: 'Ex.: 50 mostra $3.550, $3.600…' }] },
          { k: 'tiers', t: 'list', l: 'Pacotes', title: (t) => `${t.name} (até ${Math.round(t.upTo * 100)}%)`, open: true, item: [{ t: 'row', cols: [{ k: 'name', l: 'Nome do pacote' }, { k: 'upTo', t: 'percent', l: 'Vai até (% da van)' }] }], add: () => ({ name: '', upTo: 1 }), addLabel: 'Adicionar pacote' },
        ]), { open: true }),
        sec('Textos', '', 'file', fields(doc.van, [
          { k: 'kicker', l: 'Etiqueta' }, { k: 'title', l: 'Título', mark: true }, { k: 'lead', l: 'Texto', t: 'area', rows: 2 }, { k: 'button', l: 'Botão' },
          { k: 'note', l: 'Observação embaixo', t: 'area', rows: 3, help: '<code>{min}</code> e <code>{max}</code> viram os preços.' },
        ])),
      ],
      finishes: () => [sec('Acabamentos (Decor)', 'Os acabamentos da página de interior wrapping.', 'palette', fields(doc.finishes, [
        { k: 'kicker', l: 'Etiqueta' }, { k: 'title', l: 'Título', mark: true }, { k: 'lead', l: 'Texto', t: 'area', rows: 2 },
        { k: 'items', t: 'list', l: 'Acabamentos', item: [{ t: 'row', cols: [{ k: 'name', l: 'Nome' }, { k: 'note', l: 'Legenda' }] }, { k: 'image', t: 'image', l: 'Textura (foto)' }, { k: 'color', t: 'color', l: 'Ou uma cor', help: 'Usada quando não há foto.' }], add: () => ({ name: '', note: '', image: '', color: '#d9d0c5' }), addLabel: 'Adicionar acabamento' },
      ]), { open: true })],
      seo: () => [sec('SEO', 'O que ajuda o site no Google.', 'search', fields(doc.seo, [
        { k: 'siteUrl', l: 'Endereço oficial do site', trim: true, help: 'Só este endereço aparece no Google. Os outros (como o link workers.dev) ficam fora do Google para não competir.' },
        { k: 'ogImage', t: 'image', l: 'Imagem padrão da prévia do link', og: true, help: 'Aparece quando alguém compartilha o site no WhatsApp, Facebook etc.' },
        { k: 'googleSiteVerification', l: 'Código de verificação do Google Search Console', help: 'Só o código (o que vem em content="…").' },
      ]), { open: true })],
      integrations: () => [
        sec('ShopVox', 'O formulário de orçamento cria um lead no ShopVox.', 'plug', fields(doc.shopvox, [
          { t: 'row', cols: [{ k: 'authToken', l: 'Auth token', trim: true }, { k: 'accountId', l: 'Account ID', trim: true }] },
          { t: 'row', cols: [{ k: 'pipeline', l: 'Funil (pipeline)' }, { k: 'leadSource', l: 'Origem do lead' }] },
          { k: 'title', l: 'Título do lead' },
          { t: 'note', html: 'Sem as chaves, os pedidos chegam só em Mensagens.' },
        ]), { open: true }),
        sec('E-mail das candidaturas', 'As candidaturas do Trabalhe conosco chegam em Mensagens. Para receber também por e-mail, crie uma chave grátis no Web3Forms.', 'mail', fields(doc.forms, [
          { k: 'web3formsKey', l: 'Chave do Web3Forms (opcional)', trim: true, help: 'Em <a href="https://web3forms.com" target="_blank" rel="noopener">web3forms.com</a>, com o e-mail que deve receber.' },
        ]), { open: true }),
        sec('Anúncios e estatísticas', '', 'chart', fields(doc.seo, [
          { k: 'metaPixelId', l: 'Meta Pixel (Facebook/Instagram)', trim: true, help: 'Só os números. Cada pedido de orçamento conta como Lead.' },
          { k: 'gaId', l: 'Google Analytics 4', trim: true, ph: 'G-XXXXXXXXXX' },
        ]), { open: true }),
      ],
      redirects: () => [sec('Redirecionamentos', 'Endereços antigos que levam para os novos (301). Ajuda anúncios e o Google a não caírem em página inexistente.', 'route', fields(doc, [{
        k: 'redirects', t: 'list', l: 'Redirecionamentos', title: (r) => `${r.from}  →  ${r.to}`, open: false,
        item: [{ t: 'row', cols: [{ k: 'from', l: 'De (endereço antigo)', ph: '/pagina-antiga', trim: true }, { k: 'to', t: 'link', l: 'Para' }] }],
        add: () => ({ from: '/', to: '/' }), addLabel: 'Adicionar redirecionamento',
      }]), { open: true })],
    }[tab];
    const previewFor = { van: '/vehicle-signage', finishes: '/decor', stats: '/', clients: '/', google: '/', company: '/contact', social: '/contact' };
    render(head('Configurações', 'Dados da empresa e ajustes do site.'), tabs, ...body());
    return { title: 'Configurações', preview: previewFor[tab] || null };
  }

  /* users */

  function viewUsers() {
    const list = h('div', { class: 'card rows' }, h('div', { class: 'loading-row' }, h('div', { class: 'boot__spin' })));
    const pw = { current: h('input', { type: 'password', autocomplete: 'current-password' }), a: h('input', { type: 'password', autocomplete: 'new-password' }), b: h('input', { type: 'password', autocomplete: 'new-password' }) };
    const drawUsers = (users) => {
      list.replaceChildren(...users.map((u) => h('div', { class: 'row-item' },
        h('span', { class: 'avatar' }, (u.name || '?').slice(0, 1).toUpperCase()),
        h('div', { class: 'row-item__main' }, h('b', null, u.name), h('span', null, u.username)),
        u.mustChange ? pill('Senha provisória', 'amber') : null,
        u.username === S.me.username ? pill('Você', 'pink') : h('div', { class: 'row-item__tools' },
          button('Nova senha', () => {
            const p = h('input', { type: 'text', value: `Bora-${uid(4)}-${uid(4)}`, class: 'input' });
            modal({ title: `Nova senha para ${u.name}`, body: [h('p', null, 'É uma senha provisória: a pessoa cria a dela no próximo acesso.'), p], actions: [{ label: 'Cancelar' }, { label: 'Salvar senha', cls: 'btn--pink', run: async () => { const r = await api(`/api/users/${u.username}/password`, { method: 'POST', body: { password: p.value } }); drawUsers(r.users); toast('Senha trocada. Passe a senha provisória para a pessoa.'); } }] });
          }, { cls: 'btn--sm', icon: 'lock' }),
          button('Remover', async () => {
            if (!(await confirmBox('Remover acesso?', `${u.name} não vai mais conseguir entrar no painel.`, { ok: 'Remover', danger: true }))) return;
            try { drawUsers((await api(`/api/users/${u.username}`, { method: 'DELETE' })).users); } catch (e) { oops(e); }
          }, { cls: 'btn--sm btn--danger', icon: 'trash' })))));
    };
    const field = (label, input, help) => h('div', { class: 'f' }, h('label', { class: 'f__label' }, label), help ? h('div', { class: 'f__help' }, help) : null, input);
    render(
      head('Usuários', 'Quem pode entrar no painel.', [button('Adicionar pessoa', () => {
        const nm = h('input', { type: 'text' });
        const un = h('input', { type: 'text', autocapitalize: 'none', spellcheck: 'false' });
        const pw0 = h('input', { type: 'text', value: `Bora-${uid(4)}-${uid(4)}` });
        nm.addEventListener('input', () => { un.value = slugify(nm.value.split(' ')[0]).replace(/-/g, ''); });
        modal({
          title: 'Adicionar pessoa',
          body: [field('Nome', nm), field('Usuário (para entrar)', un, 'Letras minúsculas, sem espaço.'), field('Senha provisória', pw0, 'A pessoa cria a própria senha no primeiro acesso.')],
          actions: [{ label: 'Cancelar' }, { label: 'Adicionar', cls: 'btn--pink', run: async () => {
            const r = await api('/api/users', { method: 'POST', body: { name: nm.value.trim(), username: un.value.trim(), password: pw0.value } });
            drawUsers(r.users);
            toast('Pessoa adicionada. Passe o usuário e a senha provisória para ela.');
          } }],
        });
      }, { icon: 'plus', cls: 'btn--pink' })]),
      list,
      h('h2', { class: 'h2' }, 'Sua senha'),
      h('form', { class: 'card', style: { padding: '18px', display: 'grid', gap: '14px', maxWidth: '520px' }, onsubmit: async (e) => {
        e.preventDefault();
        if (pw.a.value.length < 10) return toast('A nova senha precisa ter pelo menos 10 caracteres.', 'err');
        if (pw.a.value !== pw.b.value) return toast('As duas senhas novas não são iguais.', 'err');
        try {
          const r = await api('/api/password', { method: 'POST', body: { current: pw.current.value, next: pw.a.value } });
          S.me = r.user;
          e.target.reset();
          toast('Senha trocada.');
        } catch (ex) { oops(ex); }
      } }, field('Senha atual', pw.current), field('Nova senha', pw.a, 'Pelo menos 10 caracteres.'), field('Repita a nova senha', pw.b), h('div', null, h('button', { class: 'btn btn--pink', type: 'submit' }, ic('lock'), 'Trocar senha'))),
    );
    api('/api/users').then((r) => drawUsers(r.users)).catch(oops);
    return { title: 'Usuários', preview: null };
  }

  /* ---------- routing ---------- */

  const routes = [
    [/^$/, viewDashboard],
    [/^home$/, viewHome],
    [/^services$/, viewServices],
    [/^services\/(.+)$/, viewService],
    [/^pages\/(services|contact|join|thanks|404)$/, viewPage],
    [/^pages$/, () => viewPage('services')],
    [/^blocks$/, viewBlocks],
    [/^menu$/, viewMenu],
    [/^blog$/, viewBlog],
    [/^blog\/settings$/, viewBlogSettings],
    [/^blog\/(.+)$/, viewPost],
    [/^media$/, viewMedia],
    [/^messages$/, viewMessages],
    [/^history$/, viewHistory],
    [/^settings(?:\/(\w+))?$/, viewSettings],
    [/^users$/, viewUsers],
  ];

  function route() {
    if (!S.doc || !V) return;
    const path = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const hit = routes.find(([re]) => re.test(path));
    const scrollY = V.dataset.route === path ? window.scrollY : 0;
    const out = hit ? hit[1](...path.match(hit[0]).slice(1)) : viewDashboard();
    if (!out) return;
    V.dataset.route = path;
    topTitle.textContent = out.title;
    d.title = `${out.title} · Painel Bora Signs`;
    drawNav();
    shellEl.classList.remove('menu-open');
    if (out.preview) setPreviewPath(out.preview);
    if (S.previewParked !== !out.preview) { S.previewParked = !out.preview; applyPreview(); }
    window.scrollTo(0, scrollY);
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', (e) => { if (S.doc && isDirty()) { e.preventDefault(); e.returnValue = ''; } });
  d.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && S.doc) { e.preventDefault(); if (isDirty()) saveDraft(); }
  });

  boot();
})();
