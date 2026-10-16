// Painel do cliente (Jesten Construções): visitas, fotos e vídeos, página inicial, contatos, mensagens e conta.
import { MAPS } from './world-dots.js';

const app = document.getElementById('app');
const state = {
  content: null,
  range: '7d',
  mapView: 'europe',
  inbox: [],
  inboxFilter: 'all',
  openMessage: null,
  unread: 0,
  usage: null,
  statsTimer: null,
};

// ---------- Utilitários ----------

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const nf = new Intl.NumberFormat('pt-BR');
const regionName = (() => {
  try {
    const dn = new Intl.DisplayNames(['pt-BR'], { type: 'region' });
    return (code) => {
      if (!code || code === 'XX' || code === 'T1') return 'Desconhecido';
      try {
        return dn.of(code) || code;
      } catch {
        return code;
      }
    };
  } catch {
    return (code) => code || 'Desconhecido';
  }
})();
const when = (ts) => {
  const d = new Date(ts);
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  const sameDay = new Date().toDateString() === d.toDateString();
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return `hoje, ${time}`;
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}, ${time}`;
};
const bytes = (n) => (n > 1e9 ? `${(n / 1e9).toFixed(2)} GB` : n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);
const uid = () => `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const mediaIds = (v) => new Set((JSON.stringify(v || '').match(/\/media\/[a-z0-9]+/g) || []).map((m) => m.split('/').pop()));
// Apaga do banco os ficheiros que deixaram de ser usados no site
function dropUnused(removed) {
  const used = mediaIds(state.content);
  for (const id of mediaIds(removed)) if (!used.has(id)) api(`/media/${id}`, { method: 'DELETE' }).catch(() => {});
}

const ICONS = {
  visitas: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  obras: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="15.5" cy="8.5" r="1.5"/>',
  inicio: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  contatos: '<path d="M5.2 3.5h3.6l1.9 4.7-2.3 1.5a11.5 11.5 0 0 0 5.9 5.9l1.5-2.3 4.7 1.9v3.6a1.6 1.6 0 0 1-1.6 1.6A17.4 17.4 0 0 1 3.6 5.1a1.6 1.6 0 0 1 1.6-1.6z"/>',
  mensagens: '<path d="M3 5h18v11H8l-5 4z"/><path d="M7 9h10M7 12h6"/>',
  conta: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  sair: '<path d="M10 4H4v16h6M15 8l4 4-4 4M19 12H9"/>',
  out: '<path d="M7 17 17 7M9 7h8v8"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 20h16"/>',
  up: '<path d="m6 14 6-6 6 6"/>',
  down: '<path d="m6 10 6 6 6-6"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.5 4.5-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  rotate: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3.5 6 8.5 7 8.5-7"/>',
  phone: '<path d="M5.2 3.5h3.6l1.9 4.7-2.3 1.5a11.5 11.5 0 0 0 5.9 5.9l1.5-2.3 4.7 1.9v3.6a1.6 1.6 0 0 1-1.6 1.6A17.4 17.4 0 0 1 3.6 5.1a1.6 1.6 0 0 1 1.6-1.6z"/>',
  whatsapp: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c.3 2.2 2.3 4.2 4.5 4.5l1-1.2 1.8.8-.3 1.6c-3.6.3-7.4-3.5-7.1-7.1l1.6-.3.8 1.8z"/>',
  download: '<path d="M12 4v12m-5-5 5 5 5-5M4 20h16"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
  live: '<circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4"/>',
  focus: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
  replace: '<path d="M4 7h13l-3-3M20 17H7l3 3"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  stack: '<rect x="3" y="7.5" width="13.5" height="13.5" rx="2.5"/><path d="M7.5 3.5h10.5a2.5 2.5 0 0 1 2.5 2.5v10.5"/>',
};
const icon = (name, cls = '') =>
  `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;

class ApiError extends Error {
  constructor(code, status, data) {
    super(code);
    this.status = status;
    this.data = data;
  }
}

async function api(path, { method = 'GET', body, raw = false } = {}) {
  const init = { method, headers: {}, credentials: 'same-origin' };
  if (body !== undefined) {
    if (raw) init.body = body;
    else {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
  }
  let res;
  try {
    res = await fetch(`/api/admin${path}`, init);
  } catch {
    throw new ApiError('offline', 0);
  }
  const data = (res.headers.get('content-type') || '').includes('json') ? await res.json().catch(() => null) : null;
  if (res.status === 401 && !['/login', '/password'].includes(path)) {
    renderLogin('A sessão terminou. Entre de novo.');
    throw new ApiError('auth', 401, data);
  }
  if (!res.ok) throw new ApiError(data?.error || 'error', res.status, data);
  return data;
}

function toast(message, kind = 'ok') {
  let box = $('.toasts');
  if (!box) {
    box = document.createElement('div');
    box.className = 'toasts';
    box.setAttribute('aria-live', 'polite');
    document.body.append(box);
  }
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.innerHTML = `${icon(kind === 'ok' ? 'check' : 'close')}<span>${esc(message)}</span>`;
  box.append(el);
  setTimeout(() => el.classList.add('is-out'), 3600);
  setTimeout(() => el.remove(), 4000);
}

const errorText = (e) =>
  e?.message === 'offline'
    ? 'Sem ligação à internet. Tente de novo.'
    : e?.status === 413
      ? 'Ficheiro grande demais.'
      : e?.status === 415
        ? 'Formato de arquivo não aceito.'
        : 'Não foi possível concluir. Tente de novo.';

// ---------- Entrada ----------

const logoSvg = (cls = '') => `<svg class="logo ${cls}" viewBox="0 0 1526 420" role="img" aria-label="Jesten Construções"><use href="/assets/img/logo.svg#logo"/></svg>`;

function renderNoPassword() {
  app.innerHTML = `
  <div class="login">
    <div class="login__card">
      ${logoSvg()}
      <h1 class="login__title">Painel ainda sem senha</h1>
      <p class="login__text">A senha ainda não foi cadastrada. Responsável técnico: crie o secret <code>JESTEN_ADMIN_PASSWORD</code> no GitHub (Settings › Secrets and variables › Actions) e rode o deploy de novo. Depois disso, esta página pede a senha para entrar.</p>
      <a class="btn btn--line" href="/">Ver o site</a>
    </div>
  </div>`;
}

function renderLogin(message = '') {
  clearInterval(state.statsTimer);
  app.innerHTML = `
  <div class="login">
    <form class="login__card" novalidate>
      ${logoSvg()}
      <h1 class="login__title">Painel do site</h1>
      <p class="login__text">Visitas, fotos e vídeos, contatos e mensagens do site da Jesten Construções.</p>
      <label class="field"><span class="field__label">Senha</span>
        <span class="pw"><input type="password" name="password" autocomplete="current-password" required autofocus>
        <button class="pw__toggle" type="button" aria-label="Mostrar senha">${icon('eye')}</button></span>
      </label>
      <p class="login__error" role="alert">${esc(message)}</p>
      <button class="btn btn--amber btn--wide" type="submit">Entrar</button>
      <a class="login__site" href="/" target="_blank" rel="noopener">Ver o site ${icon('out')}</a>
    </form>
  </div>`;
  const form = $('form', app);
  const input = form.elements.password;
  $('.pw__toggle', form).addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
    input.focus();
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const error = $('.login__error', form);
    if (!input.value) {
      error.textContent = 'Escreva a senha.';
      return;
    }
    const btn = $('button[type=submit]', form);
    btn.disabled = true;
    error.textContent = '';
    try {
      await api('/login', { method: 'POST', body: { password: input.value } });
      await start();
    } catch (err) {
      error.textContent =
        err.status === 429 ? 'Muitas tentativas. Aguarde 15 minutos e tente de novo.' : err.status === 401 ? 'Senha incorreta.' : errorText(err);
      btn.disabled = false;
      input.select();
    }
  });
}

// ---------- Estrutura ----------

const ROUTES = {
  visitas: { title: 'Visitas', icon: 'visitas', render: renderVisits },
  obras: { title: 'Fotos e vídeos', icon: 'obras', render: renderWorks },
  inicio: { title: 'Página inicial', icon: 'inicio', render: renderHome },
  contatos: { title: 'Contatos e redes', icon: 'contatos', render: renderContacts },
  mensagens: { title: 'Mensagens', icon: 'mensagens', render: renderInbox },
  conta: { title: 'Conta', icon: 'conta', render: renderAccount },
};

function renderShell() {
  app.innerHTML = `
  <div class="shell">
    <aside class="side">
      <a class="side__brand" href="#/visitas">${logoSvg('logo--light')}</a>
      <nav class="side__nav" aria-label="Painel">
        ${Object.entries(ROUTES)
          .map(
            ([key, r]) =>
              `<a class="side__link" href="#/${key}" data-route="${key}">${icon(r.icon)}<span>${r.title}</span>${key === 'mensagens' ? '<b class="badge" data-unread hidden></b>' : ''}</a>`,
          )
          .join('')}
      </nav>
      <div class="side__foot">
        <a class="side__link" href="/" target="_blank" rel="noopener">${icon('out')}<span>Ver o site</span></a>
        <button class="side__link" type="button" data-logout>${icon('sair')}<span>Sair</span></button>
      </div>
    </aside>
    <main class="main" id="main">
      <header class="main__head">
        <h1 class="main__title" data-title></h1>
        <div class="main__actions" data-actions></div>
      </header>
      <div class="main__body" data-body></div>
    </main>
  </div>`;
  $('[data-logout]', app).addEventListener('click', logout);
}

async function logout() {
  await api('/logout', { method: 'POST', body: {} }).catch(() => {});
  renderLogin('Sessão terminada.');
}

function setUnread(n) {
  state.unread = n;
  const b = $('[data-unread]');
  if (b) {
    b.hidden = !n;
    b.textContent = n > 99 ? '99+' : String(n);
  }
}

function route() {
  const key = (location.hash.replace(/^#\/?/, '') || 'visitas').split('/')[0];
  const r = ROUTES[key] || ROUTES.visitas;
  // Voltar no telemóvel com uma janela de edição aberta: fecha a janela junto com a página
  $$('dialog[open]').forEach((d) => d.close());
  clearInterval(state.statsTimer);
  $$('.side__link[data-route]').forEach((a) => a.toggleAttribute('aria-current', a.dataset.route === key));
  $('[data-title]').textContent = r.title;
  $('[data-actions]').innerHTML = '';
  document.title = `${r.title} · Painel Jesten`;
  const old = $('[data-body]');
  const body = old.cloneNode(false);
  old.replaceWith(body);
  body.innerHTML = '<div class="loading"><span></span></div>';
  window.scrollTo(0, 0);
  r.render(body).catch((e) => {
    if (e?.message !== 'auth') body.innerHTML = `<div class="empty"><p>${esc(errorText(e))}</p></div>`;
  });
}

async function start() {
  renderShell();
  const [content, overview] = await Promise.all([api('/content'), api('/overview')]);
  state.content = content;
  state.usage = overview.usage;
  setUnread(overview.unread);
  window.removeEventListener('hashchange', route);
  window.addEventListener('hashchange', route);
  route();
}

async function boot() {
  try {
    const s = await api('/status');
    if (!s.configured) return renderNoPassword();
    if (!s.authed) return renderLogin();
    await start();
  } catch (e) {
    if (e?.message !== 'auth') app.innerHTML = `<div class="login"><div class="login__card"><p>${esc(errorText(e))}</p></div></div>`;
  }
}

async function saveContent(message = 'Alterações publicadas no site.') {
  const saved = await api('/content', { method: 'PUT', body: state.content });
  state.content = saved;
  if (message) toast(message);
  return saved;
}

// ---------- Visitas ----------

const RANGES = [
  ['today', 'Hoje'],
  ['7d', '7 dias'],
  ['30d', '30 dias'],
  ['12m', '12 meses'],
];
const PAGE_LABELS = {
  '/': 'Início · PT',
  '/es/': 'Início · ES',
  '/en/': 'Início · EN',
  '/fr/': 'Início · FR',
  '/carreiras': 'Carreiras · PT',
  '/es/empleo': 'Carreiras · ES',
  '/en/careers': 'Carreiras · EN',
  '/fr/carrieres': 'Carreiras · FR',
  '/privacidade': 'Privacidade · PT',
  '/es/privacidad': 'Privacidade · ES',
  '/en/privacy': 'Privacidade · EN',
  '/fr/confidentialite': 'Privacidade · FR',
  '/termos': 'Termos · PT',
  '/es/terminos': 'Termos · ES',
  '/en/terms': 'Termos · EN',
  '/fr/conditions': 'Termos · FR',
};
const DEVICE = { mobile: 'Celular', desktop: 'Computador', tablet: 'Tablet' };
const LANG = { pt: 'Português', es: 'Espanhol', en: 'Inglês', fr: 'Francês' };

function delta(now, prev) {
  if (!prev) return now ? '<span class="delta delta--up">novo</span>' : '';
  const pct = Math.round(((now - prev) / prev) * 100);
  if (!pct) return '<span class="delta">igual ao período anterior</span>';
  return `<span class="delta ${pct > 0 ? 'delta--up' : 'delta--down'}">${pct > 0 ? '+' : ''}${pct}% vs período anterior</span>`;
}

function buckets(stats) {
  const map = new Map(stats.series.map((s) => [s.bucket, s]));
  const out = [];
  const lisbon = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  if (state.range === 'today') {
    const hourNow = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', hour: '2-digit', hourCycle: 'h23' }).format(new Date()));
    for (let h = 0; h <= hourNow; h++) {
      const k = String(h).padStart(2, '0');
      out.push({ key: k, label: `${k}h`, ...(map.get(k) || { views: 0, visitors: 0 }) });
    }
  } else if (state.range === '12m') {
    const d = new Date();
    for (let i = 11; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 15);
      const k = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
      out.push({ key: k, label: m.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), ...(map.get(k) || { views: 0, visitors: 0 }) });
    }
  } else {
    const days = state.range === '30d' ? 30 : 7;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000);
      const k = lisbon(d);
      const label = days === 7 ? d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }).replace('.', '') : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      out.push({ key: k, label, ...(map.get(k) || { views: 0, visitors: 0 }) });
    }
  }
  return out;
}

function chart(stats) {
  const data = buckets(stats);
  const max = Math.max(1, ...data.map((d) => d.views));
  const pow = 10 ** Math.floor(Math.log10(max));
  const top = Math.ceil(max / pow) * pow;
  const every = Math.ceil(data.length / (matchMedia('(max-width: 700px)').matches ? 6 : 12));
  const pct = (v) => ((v / top) * 100).toFixed(2);
  return `<div class="chart" role="img" aria-label="Gráfico de visitantes por período">
    <div class="chart__scale" aria-hidden="true">${[1, 0.5, 0].map((f) => `<span style="bottom:${f * 100}%">${nf.format(Math.round(top * f))}</span>`).join('')}</div>
    <div class="chart__cols">${data
      .map(
        (d, i) => `<div class="chart__col" tabindex="0" data-tip="${esc(`${d.label}: ${nf.format(d.visitors)} visitante${d.visitors === 1 ? '' : 's'}, ${nf.format(d.views)} página${d.views === 1 ? '' : 's'} vista${d.views === 1 ? '' : 's'}`)}">
        <div class="chart__bars"><i class="chart__views" style="height:${pct(d.views)}%"></i><i class="chart__visitors" style="height:${pct(d.visitors)}%"></i></div>
        <span class="chart__label">${i % every === 0 ? esc(d.label) : ''}</span>
      </div>`,
      )
      .join('')}</div>
  </div>
  <div class="legend"><span><i class="legend__visitors"></i>Visitantes</span><span><i class="legend__views"></i>Páginas vistas</span></div>`;
}

function mapSvg(stats) {
  const m = MAPS[state.mapView];
  const cities = stats.cities.filter((c) => c.lat != null && c.lon != null);
  const max = Math.max(1, ...cities.map((c) => c.visitors));
  const project = (lon, lat) => [(lon - m.lon0) * m.scale * m.kx, (m.lat1 - lat) * m.scale];
  const base = m.dot * (state.mapView === 'world' ? 2.2 : 1.6);
  const dots = cities
    .map((c) => {
      const [x, y] = project(c.lon, c.lat);
      if (x < -20 || y < -20 || x > m.width + 20 || y > m.height + 20) return '';
      const r = base + Math.sqrt(c.visitors / max) * base * 3;
      return `<g class="map__city" tabindex="0" data-tip="${esc(`${c.city}, ${regionName(c.country)}: ${nf.format(c.visitors)} visitante${c.visitors === 1 ? '' : 's'}`)}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 2.2).toFixed(1)}" class="map__halo"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" class="map__dot"/></g>`;
    })
    .join('');
  return `<svg class="map__svg" viewBox="0 0 ${m.width} ${m.height}" role="img" aria-label="Mapa das cidades de onde vieram as visitas"><path d="${m.path}" class="map__land" stroke-width="${m.dot}"/>${dots}</svg>`;
}

function bars(rows, { label, value = (r) => r.visitors, sub, total, empty = 'Sem dados ainda.' }) {
  if (!rows.length) return `<p class="muted">${empty}</p>`;
  const max = Math.max(1, ...rows.map(value));
  const sum = total || rows.reduce((a, r) => a + value(r), 0);
  return `<ol class="bars">${rows
    .map(
      (r) => `<li class="bars__row"><span class="bars__fill" style="width:${((value(r) / max) * 100).toFixed(1)}%"></span>
      <span class="bars__label">${label(r)}${sub ? `<small>${sub(r)}</small>` : ''}</span>
      <span class="bars__value">${nf.format(value(r))}<small>${sum ? Math.round((value(r) / sum) * 100) : 0}%</small></span></li>`,
    )
    .join('')}</ol>`;
}

function tooltips(root) {
  const show = (g) => {
    const card = g.closest('.card');
    if (!card) return;
    let tip = card.querySelector(':scope > .tip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'tip';
      card.append(tip);
    }
    tip.textContent = g.dataset.tip;
    tip.hidden = false;
    const r = g.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    tip.style.left = `${Math.min(Math.max(90, r.left - c.left + r.width / 2), c.width - 90)}px`;
    tip.style.top = `${r.top - c.top}px`;
  };
  const hide = () => $$('.tip', root).forEach((t) => (t.hidden = true));
  root.addEventListener('pointerover', (e) => {
    const g = e.target.closest('[data-tip]');
    if (g) show(g);
  });
  root.addEventListener('pointerout', (e) => {
    if (e.target.closest('[data-tip]')) hide();
  });
  root.addEventListener('focusin', (e) => {
    const g = e.target.closest('[data-tip]');
    if (g) show(g);
  });
  root.addEventListener('focusout', hide);
}

async function renderVisits(body) {
  const actions = $('[data-actions]');
  actions.innerHTML = `<div class="seg" role="group" aria-label="Período">${RANGES.map(
    ([k, l]) => `<button type="button" data-range="${k}" aria-pressed="${k === state.range}">${l}</button>`,
  ).join('')}</div>`;
  $$('[data-range]', actions).forEach((b) =>
    b.addEventListener('click', () => {
      state.range = b.dataset.range;
      $$('[data-range]', actions).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      load().catch((e) => {
        body.classList.remove('is-loading');
        if (e?.message !== 'auth') toast(errorText(e), 'error');
      });
    }),
  );

  const load = async (quiet = false) => {
    if (!quiet) body.classList.add('is-loading');
    const stats = await api(`/stats?range=${state.range}`);
    body.classList.remove('is-loading');
    draw(stats);
  };

  const draw = (s) => {
    // O mapa abre no mundo quando a maioria das visitas vem de fora da Europa
    if (!state.mapChosen) {
      const all = s.cities.reduce((a, c) => a + c.visitors, 0);
      const eu = s.cities.filter((c) => c.lat > 34 && c.lat < 61 && c.lon > -13 && c.lon < 30).reduce((a, c) => a + c.visitors, 0);
      if (all) {
        state.mapView = eu / all >= 0.5 ? 'europe' : 'world';
        state.mapChosen = true;
      }
    }
    const rangeLabel = RANGES.find(([k]) => k === state.range)[1].toLowerCase();
    const quotes = (s.inbox.quote || 0) + (s.inbox.job || 0);
    if (!s.views && !s.recent.length) {
      body.innerHTML = `<div class="empty empty--big">${icon('visitas')}<h2>Ainda não há visitas registradas</h2><p>Assim que alguém abrir o site, a visita aparece aqui com a cidade, o país, a página e de onde a pessoa veio (Google, Instagram, WhatsApp…). As suas visitas não contam enquanto estiver com sessão iniciada neste painel.</p></div>`;
      return;
    }
    body.innerHTML = `
    <div class="kpis">
      <div class="kpi"><span class="kpi__label">Visitantes</span><strong class="kpi__value">${nf.format(s.visitors)}</strong>${delta(s.visitors, s.prev.visitors)}</div>
      <div class="kpi"><span class="kpi__label">Páginas vistas</span><strong class="kpi__value">${nf.format(s.views)}</strong>${delta(s.views, s.prev.views)}</div>
      <div class="kpi kpi--live"><span class="kpi__label">${icon('live')}Agora no site</span><strong class="kpi__value">${nf.format(s.live)}</strong><span class="delta">últimos 5 minutos</span></div>
      <a class="kpi kpi--link" href="#/mensagens"><span class="kpi__label">Mensagens recebidas</span><strong class="kpi__value">${nf.format(quotes)}</strong><span class="delta">${nf.format(s.inbox.quote || 0)} orçamento${(s.inbox.quote || 0) === 1 ? '' : 's'} · ${nf.format(s.inbox.job || 0)} candidatura${(s.inbox.job || 0) === 1 ? '' : 's'}</span></a>
    </div>
    <section class="card"><header class="card__head"><h2>Visitantes · ${rangeLabel}</h2></header>${chart(s)}</section>
    <section class="card card--map">
      <header class="card__head"><h2>De onde vêm as visitas</h2>
        <div class="seg seg--sm" role="group" aria-label="Mapa"><button type="button" data-map="europe" aria-pressed="${state.mapView === 'europe'}">Europa</button><button type="button" data-map="world" aria-pressed="${state.mapView === 'world'}">Mundo</button></div>
      </header>
      <div class="map">${mapSvg(s)}</div>
    </section>
    <div class="grid2">
      <section class="card"><header class="card__head"><h2>Cidades</h2></header>${bars(s.cities.slice(0, 12), {
        label: (r) => `${esc(r.city)}`,
        sub: (r) => esc([r.region && r.region !== r.city ? r.region : '', regionName(r.country)].filter(Boolean).join(', ')),
        empty: 'A cidade aparece quando a rede consegue identificar a localização.',
      })}</section>
      <section class="card"><header class="card__head"><h2>Países</h2></header>${bars(s.countries.slice(0, 12), { label: (r) => `<b class="cc">${esc(r.key === 'XX' ? '?' : r.key)}</b>${esc(regionName(r.key))}` })}</section>
      <section class="card"><header class="card__head"><h2>Como chegaram ao site</h2></header>${bars(s.refs, {
        label: (r) => esc(r.key === 'Direto' ? 'Direto (link digitado, favoritos ou apps)' : r.key),
        empty: 'Ainda sem origens registradas.',
      })}</section>
      <section class="card"><header class="card__head"><h2>Páginas mais vistas</h2></header>${bars(s.pages, { label: (r) => esc(PAGE_LABELS[r.key] || r.key), value: (r) => r.views })}</section>
      <section class="card"><header class="card__head"><h2>Aparelho</h2></header>${bars(s.devices, { label: (r) => esc(DEVICE[r.key] || r.key) })}</section>
      <section class="card"><header class="card__head"><h2>Idioma do site</h2></header>${bars(s.langs, { label: (r) => esc(LANG[r.key] || r.key) })}</section>
    </div>
    <section class="card">
      <header class="card__head"><h2>Últimas visitas</h2></header>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Quando</th><th>Cidade</th><th>Página</th><th>Origem</th><th>Aparelho</th></tr></thead>
        <tbody>${s.recent
          .map(
            (r) => `<tr><td>${esc(when(r.ts))}</td><td>${esc([r.city, regionName(r.country)].filter(Boolean).join(', ') || '—')}</td><td>${esc(PAGE_LABELS[r.path] || r.path)}</td><td>${esc(
              r.ref === '-' ? 'Dentro do site' : r.ref || '—',
            )}</td><td>${esc(`${DEVICE[r.device] || r.device || ''} · ${r.os || ''}`)}</td></tr>`,
          )
          .join('')}</tbody>
      </table></div>
    </section>
    <p class="note">A localização é aproximada (cidade estimada pela rede da operadora). Robôs, buscadores e as suas próprias visitas com sessão iniciada neste painel não são contados. Os dados ficam guardados 13 meses.</p>`;
    $$('[data-map]', body).forEach((b) =>
      b.addEventListener('click', () => {
        state.mapView = b.dataset.map;
        state.mapChosen = true;
        $$('[data-map]', body).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        $('.map', body).innerHTML = mapSvg(s);
      }),
    );
    tooltips(body);
  };

  await load();
  state.statsTimer = setInterval(() => {
    if (document.visibilityState === 'visible') load(true).catch(() => {});
  }, 60_000);
}

// ---------- Fotos e vídeos ----------

const CATEGORY = { estrutura: 'Estrutura', 'obra-nova': 'Obra nova', infraestrutura: 'Indústria e infraestruturas', reabilitacao: 'Reabilitação', remodelacao: 'Remodelação', outro: 'Outro' };
// Nomes de obra já usados (para juntar fotos da mesma obra num só quadro no site)
const groupNames = () => [...new Set(state.content.works.map((w) => (w.group || '').trim()).filter(Boolean))];
const groupList = (id) => `<datalist id="${id}">${groupNames().map((g) => `<option value="${esc(g)}"></option>`).join('')}</datalist>`;
const STATUS = { '': 'Sem estado', ongoing: 'Em curso', done: 'Concluída' };
const thumbOf = (w) => (w.kind === 'video' ? w.video.poster : [...(w.img || [])].sort((a, b) => a.w - b.w)[0]?.u) || '';
const bigOf = (w) => [...(w.img || [])].sort((a, b) => b.w - a.w)[0]?.u || '';
const monthLabel = (ym) => (ym ? new Date(`${ym}-15T12:00:00Z`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '');

async function renderWorks(body) {
  const works = state.content.works;
  body.innerHTML = `
  <div class="upload-bar">
    <label class="btn btn--amber upload-btn">${icon('upload')}<span>Adicionar fotos e vídeos</span><input type="file" accept="image/*,video/*,.heic,.heif,.mov" multiple data-files></label>
    <p class="muted">Pode escolher vários de uma vez, direto da galeria do celular. As fotos são reduzidas automaticamente (ficam leves e nítidas); vídeos até 200 MB, de preferência em MP4.</p>
  </div>
  <div class="uploads" data-uploads></div>
  <div class="drop" data-drop>${icon('upload')}<span>Solte as fotos e os vídeos aqui</span></div>
  <p class="hint-line">${icon('star')}A primeira fica em destaque no site. Arraste ou use as setas para mudar a ordem.</p>
  <p class="hint-line">${icon('stack')}Fotos com o mesmo nome de obra aparecem juntas no site, num só quadro; a primeira delas é a capa.</p>
  <ol class="wlist" data-list>${works.length ? '' : '<li class="empty">Ainda não há obras. Adicione as primeiras fotos.</li>'}</ol>`;
  drawList();

  const input = $('[data-files]', body);
  input.addEventListener('change', () => {
    addFiles([...input.files]);
    input.value = '';
  });
  // Arrastar ficheiros do computador
  const drop = $('[data-drop]', body);
  let depth = 0;
  const onEnter = (e) => {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    depth++;
    drop.classList.add('is-on');
  };
  const onLeave = () => {
    depth = Math.max(0, depth - 1);
    if (!depth) drop.classList.remove('is-on');
  };
  body.addEventListener('dragenter', onEnter);
  body.addEventListener('dragleave', onLeave);
  body.addEventListener('dragover', (e) => {
    if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
  });
  body.addEventListener('drop', (e) => {
    if (!e.dataTransfer?.files?.length) return;
    e.preventDefault();
    depth = 0;
    drop.classList.remove('is-on');
    addFiles([...e.dataTransfer.files]);
  });

  function drawList() {
    const list = $('[data-list]', body);
    if (!state.content.works.length) {
      list.innerHTML = '<li class="empty">Ainda não há obras. Adicione as primeiras fotos.</li>';
      return;
    }
    list.innerHTML = state.content.works
      .map((w, i) => {
        const title = w.title?.pt || '';
        const meta = [CATEGORY[w.category], w.place, monthLabel(w.date)].filter(Boolean).join(' · ');
        return `<li class="witem${w.visible === false ? ' is-hidden' : ''}" draggable="true" data-index="${i}">
          <span class="witem__grip" aria-hidden="true"></span>
          <button class="witem__thumb" type="button" data-edit="${i}" aria-label="Editar">${thumbOf(w) ? `<img src="${esc(thumbOf(w))}" alt="" loading="lazy">` : ''}${
            w.kind === 'video' ? `<span class="witem__video">${icon('play')}</span>` : ''
          }${i === 0 ? '<span class="witem__star">Destaque</span>' : ''}</button>
          <div class="witem__info">
            <strong>${title ? esc(title) : '<em class="warn">Sem título</em>'}</strong>
            <span>${esc(meta)}</span>
            <span class="chips">${w.group ? `<b class="chip chip--group">${esc(w.group)}</b>` : ''}${w.visible === false ? '<b class="chip chip--muted">Oculta</b>' : ''}${
              w.status ? `<b class="chip">${esc(STATUS[w.status])}</b>` : ''
            }${
              w.kind === 'video' ? '<b class="chip chip--muted">Vídeo</b>' : ''
            }</span>
          </div>
          <div class="witem__actions">
            <button class="ib" type="button" data-move="${i}" data-dir="-1" aria-label="Subir" ${i === 0 ? 'disabled' : ''}>${icon('up')}</button>
            <button class="ib" type="button" data-move="${i}" data-dir="1" aria-label="Descer" ${i === state.content.works.length - 1 ? 'disabled' : ''}>${icon('down')}</button>
            <button class="ib" type="button" data-toggle="${i}" aria-label="${w.visible === false ? 'Mostrar no site' : 'Ocultar do site'}" title="${w.visible === false ? 'Mostrar no site' : 'Ocultar do site'}">${icon(
              w.visible === false ? 'eyeOff' : 'eye',
            )}</button>
            <button class="btn btn--line btn--sm" type="button" data-edit="${i}">${icon('edit')}Editar</button>
          </div>
        </li>`;
      })
      .join('');
  }

  const list = $('[data-list]', body);
  let saveTimer;
  const saveSoon = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveContent('Ordem atualizada no site.').catch((e) => toast(errorText(e), 'error')), 500);
  };
  list.addEventListener('click', (e) => {
    const move = e.target.closest('[data-move]');
    const toggle = e.target.closest('[data-toggle]');
    const edit = e.target.closest('[data-edit]');
    const w = state.content.works;
    if (move) {
      const i = Number(move.dataset.move);
      const j = i + Number(move.dataset.dir);
      if (j < 0 || j >= w.length) return;
      [w[i], w[j]] = [w[j], w[i]];
      drawList();
      list.querySelector(`[data-move="${j}"][data-dir="${move.dataset.dir}"]`)?.focus();
      saveSoon();
    } else if (toggle) {
      const item = w[Number(toggle.dataset.toggle)];
      item.visible = item.visible === false;
      drawList();
      saveContent(item.visible ? 'Voltou a aparecer no site.' : 'Ocultada do site.').catch((err) => toast(errorText(err), 'error'));
    } else if (edit) {
      editWork(Number(edit.dataset.edit), drawList);
    }
  });
  // Reordenar arrastando (computador)
  let dragFrom = null;
  list.addEventListener('dragstart', (e) => {
    const li = e.target.closest('.witem');
    if (!li) return;
    dragFrom = Number(li.dataset.index);
    li.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(dragFrom));
  });
  list.addEventListener('dragover', (e) => {
    if (dragFrom == null) return;
    e.preventDefault();
    const li = e.target.closest('.witem');
    $$('.witem', list).forEach((x) => x.classList.toggle('is-over', x === li));
  });
  list.addEventListener('drop', (e) => {
    if (dragFrom == null) return;
    e.preventDefault();
    e.stopPropagation();
    const li = e.target.closest('.witem');
    const to = li ? Number(li.dataset.index) : state.content.works.length - 1;
    const [item] = state.content.works.splice(dragFrom, 1);
    state.content.works.splice(to, 0, item);
    dragFrom = null;
    drawList();
    saveSoon();
  });
  list.addEventListener('dragend', () => {
    dragFrom = null;
    $$('.witem', list).forEach((x) => x.classList.remove('is-dragging', 'is-over'));
  });

  async function addFiles(files) {
    const box = $('[data-uploads]', body);
    let added = 0;
    for (const file of files) {
      const row = document.createElement('div');
      row.className = 'up';
      row.innerHTML = `<span class="up__name">${esc(file.name)}</span><span class="up__bar"><i></i></span><span class="up__state">Preparando…</span>`;
      box.append(row);
      const bar = $('i', row);
      const stateEl = $('.up__state', row);
      const progress = (p) => {
        bar.style.width = `${Math.round(p * 100)}%`;
        stateEl.textContent = `${Math.round(p * 100)}%`;
      };
      try {
        const item = await uploadWork(file, progress, (msg) => (stateEl.textContent = msg));
        // Mantém a ordem em que foram escolhidos, todos no topo da lista
        state.content.works.splice(added, 0, item);
        await saveContent(null);
        drawList();
        added++;
        row.classList.add('is-done');
        stateEl.textContent = 'Publicado';
        setTimeout(() => row.remove(), 2500);
      } catch (e) {
        row.classList.add('is-error');
        stateEl.textContent = e.userMessage || errorText(e);
      }
    }
    if (added === 1) {
      toast('Publicado no site. Dê um título à obra.');
      editWork(0, drawList);
    } else if (added > 1) {
      toast(`${added} arquivos publicados no site.`);
      groupNew(added);
    }
  }

  // Junta as fotos acabadas de enviar numa obra (ficam num só quadro no site)
  function groupNew(n) {
    const items = state.content.works.slice(0, n);
    const d = dialog(`<form method="dialog" class="dlg__form" novalidate>
      <header class="dlg__head"><h2>São todas da mesma obra?</h2><button class="ib" type="button" data-x aria-label="Fechar">${icon('close')}</button></header>
      <div class="dlg__body fields">
        <p class="muted">Dê um nome à obra e os ${n} arquivos que acabou de enviar aparecem juntos no site, num só quadro, com o primeiro de capa. Pode ser uma obra nova ou uma que já existe.</p>
        <label class="field"><span class="field__label">Nome da obra</span><input name="group" list="group-names-new" maxlength="60" placeholder="Ex.: Edifício em Coimbra" required></label>
        ${groupList('group-names-new')}
      </div>
      <footer class="dlg__foot">
        <button class="btn btn--ghost" type="button" data-skip>Não, ficam separadas</button>
        <span class="spacer"></span>
        <button class="btn btn--amber" type="submit">Juntar</button>
      </footer>
    </form>`, { small: true });
    const form = $('form', d);
    const next = () => editWork(0, drawList);
    $('[data-x]', d).addEventListener('click', () => {
      d.close();
      next();
    });
    $('[data-skip]', d).addEventListener('click', () => {
      d.close();
      next();
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.elements.group.value.trim();
      if (!name) return form.elements.group.focus();
      items.forEach((w) => (w.group = name));
      try {
        await saveContent(`Juntas na obra "${name}".`);
        d.close();
        drawList();
        next();
      } catch (err) {
        toast(errorText(err), 'error');
      }
    });
  }
}

// Reduz a foto no próprio aparelho antes de enviar
async function decodeImage(file) {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } catch {
      const err = new Error('decode');
      err.userMessage = /hei[cf]$/i.test(file.name) || /hei[cf]/.test(file.type)
        ? 'Formato HEIC não abre neste navegador. No iPhone, envie pelo Safari ou em Ajustes › Câmara › Formatos escolha "Mais compatível".'
        : 'Não foi possível ler esta imagem.';
      throw err;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

async function encodeImage(source, maxSide, quality = 0.84) {
  const sw = source.videoWidth || source.naturalWidth || source.width;
  const sh = source.videoHeight || source.naturalHeight || source.height;
  const k = Math.min(1, maxSide / Math.max(sw, sh));
  const w = Math.round(sw * k);
  const h = Math.round(sh * k);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, w, h);
  let blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', quality));
  if (!blob || blob.type !== 'image/webp') blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.86));
  return { blob, w, h, canvas };
}

function averageColor(canvas) {
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 1;
  const ctx = c.getContext('2d');
  ctx.drawImage(canvas, 0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

async function uploadBlob(blob, kind, name, onProgress = () => {}) {
  const meta = await api('/media', { method: 'POST', body: { kind, mime: blob.type, name, size: blob.size } });
  for (let n = 0; n < meta.chunks; n++) {
    const part = blob.slice(n * meta.chunkSize, (n + 1) * meta.chunkSize);
    let tries = 0;
    for (;;) {
      try {
        await api(`/media/${meta.id}/${n}`, { method: 'PUT', body: part, raw: true });
        break;
      } catch (e) {
        if (++tries >= 3 || e.status === 401) throw e;
        await new Promise((r) => setTimeout(r, 800 * tries));
      }
    }
    onProgress((n + 1) / meta.chunks);
  }
  const done = await api(`/media/${meta.id}/done`, { method: 'POST', body: {} });
  return done.url;
}

async function videoInfo(file) {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;
  try {
    await new Promise((resolve, reject) => {
      video.onloadeddata = resolve;
      video.onerror = reject;
      setTimeout(reject, 15000);
    });
    video.currentTime = Math.min(0.6, (video.duration || 1) / 3);
    await new Promise((resolve) => {
      video.onseeked = resolve;
      setTimeout(resolve, 4000);
    });
    const poster = await encodeImage(video, 1080, 0.8);
    return { w: video.videoWidth, h: video.videoHeight, poster, color: averageColor(poster.canvas) };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function uploadWork(file, progress, say) {
  const base = {
    id: uid(),
    title: { pt: '', es: '', en: '', fr: '' },
    place: '',
    date: new Date().toISOString().slice(0, 7),
    category: 'estrutura',
    status: '',
    focus: '',
    visible: true,
  };
  const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|m4v|webm)$/i.test(file.name);
  if (!isVideo) {
    say('Reduzindo a foto…');
    const src = await decodeImage(file);
    const large = await encodeImage(src, 2000);
    const small = await encodeImage(src, 900);
    const color = averageColor(small.canvas);
    say('Enviando…');
    const bigUrl = await uploadBlob(large.blob, 'image', file.name, (p) => progress(p * 0.82));
    const smallUrl = await uploadBlob(small.blob, 'image', file.name, (p) => progress(0.82 + p * 0.18));
    return { ...base, kind: 'image', img: [{ u: smallUrl, w: small.w }, { u: bigUrl, w: large.w }], w: large.w, h: large.h, color };
  }
  if (file.size > 200 * 1024 * 1024) {
    const err = new Error('size');
    err.userMessage = 'Vídeo com mais de 200 MB. Encurte o vídeo ou envie uma versão mais leve.';
    throw err;
  }
  say('Lendo o vídeo…');
  const info = await videoInfo(file);
  // MOV com H.264 toca como MP4; marcar assim faz o Chrome aceitar
  const mime = file.type === 'video/webm' ? 'video/webm' : 'video/mp4';
  const blob = file.type === mime ? file : new Blob([file], { type: mime });
  let posterUrl = '';
  if (info?.poster) posterUrl = await uploadBlob(info.poster.blob, 'image', `${file.name}.webp`, (p) => progress(p * 0.04));
  say('Enviando…');
  const videoUrl = await uploadBlob(blob, 'video', file.name, (p) => progress(0.04 + p * 0.96));
  if (!info) toast('Vídeo enviado, mas este navegador não o conseguiu ler. Se não tocar no site, envie em MP4.', 'error');
  return { ...base, kind: 'video', video: { u: videoUrl, poster: posterUrl }, w: info?.w || 1080, h: info?.h || 1920, color: info?.color || '#8a877e' };
}

// Janela de edição de uma obra
function dialog(html, { wide = false, small = false } = {}) {
  const d = document.createElement('dialog');
  d.className = `dlg${wide ? ' dlg--wide' : ''}${small ? ' dlg--small' : ''}`;
  d.innerHTML = html;
  document.body.append(d);
  d.addEventListener('close', () => d.remove());
  d.addEventListener('click', (e) => {
    if (e.target === d) d.close();
  });
  d.showModal();
  return d;
}

function editWork(index, redraw) {
  const w = state.content.works[index];
  if (!w) return;
  const t = { pt: '', es: '', en: '', fr: '', ...(w.title || {}) };
  const [fx, fy] = (w.focus || '50% 50%').split(' ').map((v) => parseFloat(v));
  const d = dialog(
    `<form method="dialog" class="dlg__form" novalidate>
      <header class="dlg__head"><h2>Editar obra</h2><button class="ib" type="button" data-x aria-label="Fechar">${icon('close')}</button></header>
      <div class="dlg__grid">
        <div class="focus" data-focus>
          ${
            w.kind === 'video'
              ? `<video src="${esc(w.video.u)}" poster="${esc(w.video.poster)}" controls muted playsinline preload="metadata"></video>`
              : `<img src="${esc(bigOf(w))}" alt=""><span class="focus__pin" style="left:${fx}%;top:${fy}%"></span>`
          }
          ${w.kind === 'image' ? `<p class="muted">${icon('focus')}Toque na foto para escolher o ponto que nunca deve ser cortado.</p>` : ''}
        </div>
        <div class="fields">
          <label class="field"><span class="field__label">Título</span><input name="pt" value="${esc(t.pt)}" maxlength="140" placeholder="Ex.: Betonagem de laje"></label>
          <details class="tr"><summary>Traduções (opcional)</summary>
            <p class="muted">Se ficarem vazias, o site mostra o título em português.</p>
            <label class="field"><span class="field__label">Espanhol</span><input name="es" value="${esc(t.es)}" maxlength="140"></label>
            <label class="field"><span class="field__label">Inglês</span><input name="en" value="${esc(t.en)}" maxlength="140"></label>
            <label class="field"><span class="field__label">Francês</span><input name="fr" value="${esc(t.fr)}" maxlength="140"></label>
          </details>
          <label class="field"><span class="field__label">Obra <span class="muted">(fotos com o mesmo nome aparecem juntas no site)</span></span><input name="group" value="${esc(
            w.group || '',
          )}" list="group-names" maxlength="60" placeholder="Ex.: Depósito circular"></label>
          ${groupList('group-names')}
          <label class="field"><span class="field__label">Local</span><input name="place" value="${esc(w.place)}" maxlength="80" placeholder="Ex.: Coimbra, Portugal"></label>
          <div class="row2">
            <label class="field"><span class="field__label">Mês e ano</span><input name="date" type="month" value="${esc(w.date)}"></label>
            <label class="field"><span class="field__label">Tipo</span><select name="category">${Object.entries(CATEGORY)
              .map(([k, l]) => `<option value="${k}"${k === w.category ? ' selected' : ''}>${l}</option>`)
              .join('')}</select></label>
          </div>
          <label class="field"><span class="field__label">Estado da obra</span><select name="status">${Object.entries(STATUS)
            .map(([k, l]) => `<option value="${k}"${k === (w.status || '') ? ' selected' : ''}>${l}</option>`)
            .join('')}</select></label>
          <label class="switch"><input type="checkbox" name="visible" ${w.visible !== false ? 'checked' : ''}><span class="switch__ui"></span>Mostrar no site</label>
        </div>
      </div>
      <footer class="dlg__foot">
        <button class="btn btn--ghost danger" type="button" data-delete>${icon('trash')}Apagar</button>
        ${w.kind === 'image' ? `<button class="btn btn--ghost" type="button" data-rotate>${icon('rotate')}Girar</button>` : ''}
        <button class="btn btn--ghost" type="button" data-hero>${icon('star')}Usar no topo do site</button>
        <span class="spacer"></span>
        <button class="btn btn--amber" type="submit" data-save>Salvar</button>
      </footer>
    </form>`,
    { wide: true },
  );
  const form = $('form', d);
  let focus = w.focus || '';
  $('[data-x]', d).addEventListener('click', () => d.close());
  const stage = $('[data-focus]', d);
  const img = $('img', stage);
  img?.addEventListener('click', (e) => {
    const r = img.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
    focus = `${x}% ${y}%`;
    const pin = $('.focus__pin', stage);
    pin.style.left = `${x}%`;
    pin.style.top = `${y}%`;
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = form.elements;
    Object.assign(w, {
      title: { pt: f.pt.value.trim(), es: f.es.value.trim(), en: f.en.value.trim(), fr: f.fr.value.trim() },
      place: f.place.value.trim(),
      group: f.group.value.trim(),
      date: f.date.value,
      category: f.category.value,
      status: f.status.value,
      visible: f.visible.checked,
      focus,
    });
    try {
      await saveContent();
      d.close();
      redraw();
    } catch (err) {
      toast(errorText(err), 'error');
    }
  });
  $('[data-delete]', d).addEventListener('click', async () => {
    if (!confirm('Apagar esta obra do site? Esta ação não pode ser desfeita.')) return;
    const removed = state.content.works.splice(state.content.works.indexOf(w), 1)[0];
    try {
      await saveContent('Obra apagada.');
      d.close();
      redraw();
      dropUnused(removed);
    } catch (err) {
      state.content.works.splice(index, 0, removed);
      toast(errorText(err), 'error');
    }
  });
  $('[data-hero]', d).addEventListener('click', async () => {
    const { kind, img: im, video, w: ww, h, color } = w;
    state.content.hero = { kind, img: im, video, w: ww, h, color, focus: w.focus, title: { ...w.title }, place: w.place };
    try {
      await saveContent('Agora está no topo da página inicial.');
    } catch (err) {
      toast(errorText(err), 'error');
    }
  });
  $('[data-rotate]', d)?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.lastChild.textContent = 'Girando…';
    try {
      const res = await fetch(bigOf(w));
      const bmp = await createImageBitmap(await res.blob());
      const c = document.createElement('canvas');
      c.width = bmp.height;
      c.height = bmp.width;
      const ctx = c.getContext('2d');
      ctx.translate(c.width, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(bmp, 0, 0);
      const large = await encodeImage(c, 2000);
      const small = await encodeImage(c, 900);
      const old = w.img;
      const bigUrl = await uploadBlob(large.blob, 'image', 'girada.webp');
      const smallUrl = await uploadBlob(small.blob, 'image', 'girada.webp');
      Object.assign(w, { img: [{ u: smallUrl, w: small.w }, { u: bigUrl, w: large.w }], w: large.w, h: large.h, focus: '' });
      await saveContent('Foto girada.');
      dropUnused(old);
      d.close();
      redraw();
      editWork(state.content.works.indexOf(w), redraw);
    } catch (err) {
      toast(errorText(err), 'error');
      btn.disabled = false;
    }
  });
}

// ---------- Página inicial ----------

async function renderHome(body) {
  const c = state.content;
  const h = c.hero;
  const t = { pt: '', es: '', en: '', fr: '', ...(h.title || {}) };
  // O topo ocupa a tela inteira: avisa quando a foto ou o vídeo é pequeno ou vertical
  const video = h.kind === 'video';
  const small = h.w < 1400;
  const tall = h.h > h.w;
  const and = (...parts) => parts.filter(Boolean).join(' e ');
  const warn =
    small || tall
      ? `${video ? 'Este vídeo' : 'Esta foto'} ${and(small && `é ${video ? 'pequeno' : 'pequena'} (${h.w} px de largura)`, tall && 'está na vertical')}: no topo, que ocupa a tela inteira na horizontal, ${and(
          small && (video ? 'fica desfocado' : 'fica desfocada'),
          tall && 'aparece só a faixa do meio',
        )}.`
      : '';
  body.innerHTML = `
  <form class="stack" data-form novalidate>
    <section class="card">
      <header class="card__head"><h2>Destaque do topo</h2></header>
      <div class="hero-pick">
        <div class="hero-pick__media">${
          h.kind === 'video'
            ? `<video src="${esc(h.video.u)}" poster="${esc(h.video.poster)}" muted loop playsinline autoplay></video>`
            : `<img src="${esc(bigOf(h))}" alt="">`
        }</div>
        <div class="fields">
          <p class="muted">É a foto (ou o vídeo) que fica de fundo no topo do site, atrás do título "Construímos com rigor". Funciona melhor uma foto na horizontal, com boa luz. Para trocar, abra uma obra em <a href="#/obras">Fotos e vídeos</a> e toque em <b>Usar no topo do site</b>.</p>
          ${warn ? `<p class="muted"><i class="warn">${esc(warn)} Para o topo, prefira uma foto na horizontal com pelo menos 1600 px.</i></p>` : ''}
          <label class="field"><span class="field__label">Legenda</span><input name="hpt" value="${esc(t.pt)}" maxlength="120"><span class="muted">Aparece no canto do topo, ao lado de "Em obra".</span></label>
          <details class="tr"><summary>Traduções (opcional)</summary>
            <label class="field"><span class="field__label">Espanhol</span><input name="hes" value="${esc(t.es)}" maxlength="120"></label>
            <label class="field"><span class="field__label">Inglês</span><input name="hen" value="${esc(t.en)}" maxlength="120"></label>
            <label class="field"><span class="field__label">Francês</span><input name="hfr" value="${esc(t.fr)}" maxlength="120"></label>
          </details>
          <label class="field"><span class="field__label">Local</span><input name="hplace" value="${esc(h.place)}" maxlength="80"></label>
          <button class="btn btn--ghost" type="button" data-reset-hero>${icon('replace')}Voltar à foto original</button>
        </div>
      </div>
    </section>
    <section class="card">
      <header class="card__head"><h2>Números da empresa</h2></header>
      <p class="muted">Aparecem logo abaixo do topo. Clientes e profissionais ganham o sinal "+".</p>
      <div class="row4">
        <label class="field"><span class="field__label">Clientes</span><input name="clients" type="number" min="0" inputmode="numeric" value="${c.numbers.clients}"></label>
        <label class="field"><span class="field__label">Profissionais</span><input name="professionals" type="number" min="0" inputmode="numeric" value="${c.numbers.professionals}"></label>
        <label class="field"><span class="field__label">Obras em curso</span><input name="ongoing" type="number" min="0" inputmode="numeric" value="${c.numbers.ongoing}"></label>
        <label class="field"><span class="field__label">Ano de fundação</span><input name="founded" type="number" min="1900" max="2100" inputmode="numeric" value="${c.numbers.founded}"></label>
      </div>
    </section>
    <section class="card">
      <header class="card__head"><h2>Recrutamento</h2></header>
      <label class="switch"><input type="checkbox" name="hiring" ${c.hiring ? 'checked' : ''}><span class="switch__ui"></span>Mostrar a faixa "Venha construir connosco" na página inicial</label>
      <p class="muted">A página de carreiras continua no ar mesmo com a faixa escondida.</p>
    </section>
    <div class="savebar"><button class="btn btn--amber" type="submit">Salvar alterações</button></div>
  </form>`;
  const form = $('[data-form]', body);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = form.elements;
    c.hero.title = { pt: f.hpt.value.trim(), es: f.hes.value.trim(), en: f.hen.value.trim(), fr: f.hfr.value.trim() };
    c.hero.place = f.hplace.value.trim();
    c.numbers = { clients: Number(f.clients.value), professionals: Number(f.professionals.value), ongoing: Number(f.ongoing.value), founded: Number(f.founded.value) };
    c.hiring = f.hiring.checked;
    try {
      await saveContent();
      renderHome(body);
    } catch (err) {
      toast(errorText(err), 'error');
    }
  });
  $('[data-reset-hero]', body).addEventListener('click', async () => {
    if (!confirm('Voltar a pôr a foto original (fundações, com a grua) no topo do site?')) return;
    c.hero = null;
    try {
      await saveContent('A foto original voltou ao topo.');
      renderHome(body);
    } catch (err) {
      toast(errorText(err), 'error');
    }
  });
}

// ---------- Contatos ----------

const COUNTRIES = ['PT', 'ES', 'FR', 'BR', 'GB', 'CH', 'LU', 'DE', 'BE', 'NL', 'AD'];

async function renderContacts(body) {
  const c = state.content.contacts;
  const co = state.content.company;
  c.emails = c.emails || [];
  const emailRow = (e, i) => `<div class="phone-row" data-email="${i}">
      <label class="field"><span class="field__label">País</span><select name="ec${i}">${COUNTRIES.map((k) => `<option value="${k}"${k === e.country ? ' selected' : ''}>${esc(regionName(k))}</option>`).join('')}</select></label>
      <label class="field"><span class="field__label">E-mail para orçamentos</span><input name="ee${i}" type="email" value="${esc(e.email)}" maxlength="200" placeholder="comercial@jesten.pt"></label>
      <button class="ib" type="button" data-remove-email="${i}" aria-label="Remover e-mail">${icon('trash')}</button>
    </div>`;
  const phoneRow = (p, i) => `<div class="phone-row" data-phone="${i}">
      <label class="field"><span class="field__label">País</span><select name="pc${i}">${COUNTRIES.map((k) => `<option value="${k}"${k === p.country ? ' selected' : ''}>${esc(regionName(k))}</option>`).join('')}</select></label>
      <label class="field"><span class="field__label">Telefone</span><input name="pn${i}" type="tel" value="${esc(p.number)}" maxlength="30" placeholder="+351 900 000 000"></label>
      <button class="ib" type="button" data-remove-phone="${i}" aria-label="Remover telefone">${icon('trash')}</button>
    </div>`;
  const draw = () => {
    body.innerHTML = `
    <form class="stack" data-form novalidate>
      <section class="card">
        <header class="card__head"><h2>Contatos</h2></header>
        <p class="muted">Aparecem na secção de orçamento e no rodapé. Cada país (Portugal, Espanha…) fica num quadro com o seu e-mail e os seus telefones.</p>
        <label class="field"><span class="field__label">E-mail geral</span><input name="email" type="email" value="${esc(c.email)}" maxlength="200"></label>
        <div data-emails>${c.emails.map(emailRow).join('')}</div>
        <button class="btn btn--ghost" type="button" data-add-email ${c.emails.length >= 6 ? 'disabled' : ''}>+ Adicionar e-mail de um país</button>
        <div data-phones>${c.phones.map(phoneRow).join('')}</div>
        <button class="btn btn--ghost" type="button" data-add-phone ${c.phones.length >= 8 ? 'disabled' : ''}>+ Adicionar telefone</button>
        <label class="field"><span class="field__label">WhatsApp (número com o código do país, só números)</span><input name="whatsapp" inputmode="numeric" value="${esc(c.whatsapp)}" maxlength="20" placeholder="351963430099"></label>
      </section>
      <section class="card">
        <header class="card__head"><h2>Redes sociais</h2></header>
        <p class="muted">Cole o endereço completo da página. Se ficar vazio, o botão não aparece no site.</p>
        <label class="field"><span class="field__label">Instagram</span><input name="instagram" type="url" value="${esc(c.instagram)}" placeholder="https://www.instagram.com/..."></label>
        <label class="field"><span class="field__label">Facebook</span><input name="facebook" type="url" value="${esc(c.facebook)}" placeholder="https://www.facebook.com/..."></label>
        <label class="field"><span class="field__label">LinkedIn</span><input name="linkedin" type="url" value="${esc(c.linkedin)}" placeholder="https://www.linkedin.com/company/..."></label>
      </section>
      <section class="card">
        <header class="card__head"><h2>Endereço e empresa</h2></header>
        <label class="field"><span class="field__label">Rua e número</span><input name="address" value="${esc(c.address)}" maxlength="120"></label>
        <div class="row2">
          <label class="field"><span class="field__label">Código postal e cidade</span><input name="postal" value="${esc(c.postal)}" maxlength="60"></label>
          <label class="field"><span class="field__label">País</span><input name="country" value="${esc(c.country)}" maxlength="40"></label>
        </div>
        <label class="field"><span class="field__label">Link do Google Maps</span><input name="maps" type="url" value="${esc(c.maps)}"></label>
        <div class="row2">
          <label class="field"><span class="field__label">Nome legal</span><input name="legal" value="${esc(co.legal)}" maxlength="120"></label>
          <label class="field"><span class="field__label">NIF</span><input name="nif" value="${esc(co.nif)}" maxlength="20"></label>
        </div>
        <label class="field"><span class="field__label">Alvará de construção (IMPIC), se tiver</span><input name="alvara" value="${esc(co.alvara)}" maxlength="60" placeholder="Ex.: 12345-PUB"></label>
      </section>
      <div class="savebar"><button class="btn btn--amber" type="submit">Salvar alterações</button></div>
    </form>`;
    const form = $('[data-form]', body);
    const collect = () => {
      const f = form.elements;
      c.phones = $$('[data-phone]', form).map((row) => {
        const i = row.dataset.phone;
        return { country: f[`pc${i}`].value, number: f[`pn${i}`].value.trim() };
      });
      c.emails = $$('[data-email]', form).map((row) => {
        const i = row.dataset.email;
        return { country: f[`ec${i}`].value, email: f[`ee${i}`].value.trim() };
      });
      Object.assign(c, {
        email: f.email.value.trim(),
        whatsapp: f.whatsapp.value.replace(/\D/g, ''),
        instagram: f.instagram.value.trim(),
        facebook: f.facebook.value.trim(),
        linkedin: f.linkedin.value.trim(),
        address: f.address.value.trim(),
        postal: f.postal.value.trim(),
        country: f.country.value.trim(),
        maps: f.maps.value.trim(),
      });
      Object.assign(co, { legal: f.legal.value.trim(), nif: f.nif.value.trim(), alvara: f.alvara.value.trim() });
    };
    $('[data-add-phone]', form).addEventListener('click', () => {
      collect();
      c.phones.push({ country: 'PT', number: '' });
      draw();
      $(`[name="pn${c.phones.length - 1}"]`, body)?.focus();
    });
    $('[data-add-email]', form).addEventListener('click', () => {
      collect();
      c.emails.push({ country: c.emails.some((e) => e.country === 'PT') ? 'ES' : 'PT', email: '' });
      draw();
      $(`[name="ee${c.emails.length - 1}"]`, body)?.focus();
    });
    form.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-remove-phone]');
      const rmEmail = e.target.closest('[data-remove-email]');
      if (!rm && !rmEmail) return;
      collect();
      if (rm) c.phones.splice(Number(rm.dataset.removePhone), 1);
      else c.emails.splice(Number(rmEmail.dataset.removeEmail), 1);
      draw();
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      collect();
      try {
        await saveContent();
        Object.assign(c, state.content.contacts);
        Object.assign(co, state.content.company);
        const dropped = ['facebook', 'linkedin', 'instagram'].filter((k) => form.elements[k].value.trim() && !state.content.contacts[k]);
        if (dropped.length) toast(`Endereço inválido em: ${dropped.join(', ')}.`, 'error');
        renderContacts(body);
      } catch (err) {
        toast(errorText(err), 'error');
      }
    });
  };
  draw();
}

// ---------- Mensagens ----------

const QUOTE_TYPES = {
  estrutura: 'Estrutura em betão armado',
  'obra-nova': 'Obra nova',
  reabilitacao: 'Reabilitação',
  remodelacao: 'Remodelação',
  equipa: 'Mão de obra para subempreitada',
  outro: 'Outro',
};
const STARTS = { asap: 'Assim que possível', soon: 'Nos próximos 3 meses', later: 'Daqui a mais de 3 meses', unknown: 'Ainda não sabe' };
const ROLES = {
  pedreiro: 'Pedreiro',
  cofrador: 'Cofrador / encofrador',
  armador: 'Armador de ferro',
  gruista: 'Gruista',
  encarregado: 'Encarregado',
  'chefe-producao': 'Chefe de produção',
  ajudante: 'Ajudante',
  administrativo: 'Administrativo',
  outro: 'Outra função',
};
const EXPERIENCE = { none: 'Sem experiência', lt2: 'Menos de 2 anos', '2to5': '2 a 5 anos', gt5: 'Mais de 5 anos' };

function messageFields(m) {
  const d = m.data;
  if (m.kind === 'quote')
    return [
      ['Nome', d.name],
      ['Empresa', d.company],
      ['E-mail', d.email],
      ['Telefone', d.phone],
      ['Tipo de obra', QUOTE_TYPES[d.type] || d.type],
      ['Local da obra', d.location],
      ['Quando quer começar', STARTS[d.start] || d.start],
      ['Idioma do site', LANG[d.lang] || d.lang],
    ];
  return [
    ['Nome', d.name],
    ['Telefone / WhatsApp', d.phone],
    ['E-mail', d.email],
    ['Onde vive', d.location],
    ['Função', d.role === 'outro' ? `Outra: ${d.roleOther || '—'}` : ROLES[d.role] || d.role],
    ['Experiência', EXPERIENCE[d.experience] || d.experience],
    ['Pode trabalhar em', (d.where || []).map(regionName).join(', ')],
    ['Idioma do site', LANG[d.lang] || d.lang],
  ];
}

async function renderInbox(body) {
  const { items } = await api('/inbox');
  state.inbox = items;
  setUnread(items.filter((i) => !i.read).length);
  const draw = () => {
    const list = state.inbox.filter((m) => state.inboxFilter === 'all' || m.kind === state.inboxFilter);
    const current = state.inbox.find((m) => m.id === state.openMessage);
    const count = (k) => state.inbox.filter((m) => k === 'all' || m.kind === k).length;
    body.innerHTML = `
    <div class="seg seg--tabs" role="group" aria-label="Filtro">${[
      ['all', 'Todas'],
      ['quote', 'Orçamentos'],
      ['job', 'Candidaturas'],
    ]
      .map(([k, l]) => `<button type="button" data-filter="${k}" aria-pressed="${state.inboxFilter === k}">${l} <small>${count(k)}</small></button>`)
      .join('')}</div>
    <div class="inbox${current ? ' has-open' : ''}">
      <ol class="inbox__list">${
        list.length
          ? list
              .map(
                (m) => `<li><button type="button" class="msg${m.read ? '' : ' is-unread'}${m.id === state.openMessage ? ' is-open' : ''}" data-open="${m.id}">
            <span class="msg__top"><b>${esc(m.data.name || '—')}</b><time>${esc(when(m.ts))}</time></span>
            <span class="msg__kind">${esc(
              (m.kind === 'quote'
                ? ['Orçamento', QUOTE_TYPES[m.data.type] || m.data.type]
                : ['Candidatura', m.data.role === 'outro' ? m.data.roleOther || 'Outra função' : ROLES[m.data.role] || m.data.role]
              )
                .filter(Boolean)
                .join(' · '),
            )}</span>
            <span class="msg__text">${esc((m.data.message || m.data.location || '').slice(0, 140))}</span>
          </button></li>`,
              )
              .join('')
          : `<li class="empty">${icon('mensagens')}<p>Nenhuma mensagem por aqui ainda. Os pedidos de orçamento e as candidaturas enviadas pelo site aparecem nesta página.</p></li>`
      }</ol>
      <article class="inbox__view">${current ? messageView(current) : `<div class="empty">${icon('mensagens')}<p>Escolha uma mensagem para ler.</p></div>`}</article>
    </div>`;
  };
  const messageView = (m) => {
    const d = m.data;
    const subject = encodeURIComponent(m.kind === 'quote' ? 'O seu pedido de orçamento · Jesten Construções' : 'A sua candidatura · Jesten Construções');
    const phoneDigits = String(d.phone || '').replace(/\D/g, '');
    return `
      <header class="mview__head">
        <button class="btn btn--ghost mview__back" type="button" data-close-msg>← Voltar</button>
        <p class="mview__kind">${m.kind === 'quote' ? 'Pedido de orçamento' : 'Candidatura'} · ${esc(new Date(m.ts).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' }))}</p>
        <h2>${esc(d.name || '—')}</h2>
        <div class="mview__actions">
          ${d.email ? `<a class="btn btn--amber btn--sm" href="mailto:${esc(d.email)}?subject=${subject}">${icon('mail')}Responder por e-mail</a>` : ''}
          ${phoneDigits ? `<a class="btn btn--line btn--sm" href="https://wa.me/${phoneDigits}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a><a class="btn btn--line btn--sm" href="tel:${esc(d.phone)}">${icon('phone')}Ligar</a>` : ''}
        </div>
      </header>
      <dl class="mview__data">${messageFields(m)
        .filter(([, v]) => v)
        .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
        .join('')}</dl>
      ${d.message ? `<div class="mview__msg"><h3>Mensagem</h3><p>${esc(d.message)}</p></div>` : ''}
      ${m.file ? `<a class="file-dl" href="/api/admin/file/${esc(m.file)}" download>${icon('download')}<span><b>${esc(m.fileName || 'Anexo')}</b><small>${m.fileSize ? bytes(m.fileSize) : ''}</small></span></a>` : ''}
      <footer class="mview__foot">
        <button class="btn btn--ghost" type="button" data-unread-msg>Marcar como não lida</button>
        <button class="btn btn--ghost danger" type="button" data-delete-msg>${icon('trash')}Apagar</button>
      </footer>
      <p class="note">Consentimento dado no site em ${esc(new Date(d.consentAt || m.ts).toLocaleString('pt-BR'))}. Pela política de privacidade, as mensagens são apagadas automaticamente após 2 anos.</p>`;
  };
  draw();
  body.addEventListener('click', async (e) => {
    const filter = e.target.closest('[data-filter]');
    const open = e.target.closest('[data-open]');
    if (filter) {
      state.inboxFilter = filter.dataset.filter;
      draw();
    } else if (open) {
      const m = state.inbox.find((x) => x.id === Number(open.dataset.open));
      state.openMessage = m.id;
      if (!m.read) {
        m.read = true;
        setUnread(state.inbox.filter((i) => !i.read).length);
        api(`/inbox/${m.id}`, { method: 'PATCH', body: { read: true } }).catch(() => {});
      }
      draw();
      $('.inbox__view', body)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    } else if (e.target.closest('[data-close-msg]')) {
      state.openMessage = null;
      draw();
    } else if (e.target.closest('[data-unread-msg]')) {
      const m = state.inbox.find((x) => x.id === state.openMessage);
      m.read = false;
      state.openMessage = null;
      setUnread(state.inbox.filter((i) => !i.read).length);
      await api(`/inbox/${m.id}`, { method: 'PATCH', body: { read: false } }).catch(() => {});
      draw();
    } else if (e.target.closest('[data-delete-msg]')) {
      if (!confirm('Apagar esta mensagem e o anexo? Esta ação não pode ser desfeita.')) return;
      const id = state.openMessage;
      try {
        await api(`/inbox/${id}`, { method: 'DELETE' });
        state.inbox = state.inbox.filter((x) => x.id !== id);
        state.openMessage = null;
        setUnread(state.inbox.filter((i) => !i.read).length);
        toast('Mensagem apagada.');
        draw();
      } catch (err) {
        toast(errorText(err), 'error');
      }
    }
  });
}

// ---------- Conta ----------

async function renderAccount(body) {
  const overview = await api('/overview');
  state.usage = overview.usage;
  const u = state.usage;
  body.innerHTML = `
  <div class="stack">
    <section class="card">
      <header class="card__head"><h2>Trocar a senha</h2></header>
      <form class="fields fields--narrow" data-pw novalidate>
        <label class="field"><span class="field__label">Senha atual</span><input type="password" name="current" autocomplete="current-password" required></label>
        <label class="field"><span class="field__label">Nova senha (mínimo 8 caracteres)</span><input type="password" name="next" autocomplete="new-password" minlength="8" required></label>
        <label class="field"><span class="field__label">Repetir a nova senha</span><input type="password" name="again" autocomplete="new-password" required></label>
        <p class="form-error" role="alert"></p>
        <div><button class="btn btn--amber" type="submit">Trocar senha</button></div>
      </form>
      <p class="muted">Ao trocar a senha, as sessões abertas noutros aparelhos são terminadas. Se esquecer a senha, o responsável técnico pode redefini-la no Cloudflare.</p>
    </section>
    <section class="card">
      <header class="card__head"><h2>Armazenamento</h2></header>
      <p class="usage"><b>${bytes(u.bytes)}</b> em ${nf.format(u.files)} arquivo${u.files === 1 ? '' : 's'} enviados pelo painel (fotos, vídeos e anexos).</p>
      <div class="usage__bar"><i style="width:${Math.min(100, (u.bytes / 5e9) * 100).toFixed(2)}%"></i></div>
      <p class="muted">O plano gratuito do Cloudflare guarda até 5 GB. Fotos ocupam pouco (são reduzidas no envio); vídeos ocupam mais.</p>
    </section>
    <section class="card">
      <header class="card__head"><h2>Sessão</h2></header>
      <div class="btn-row">
        <a class="btn btn--ghost" href="/" target="_blank" rel="noopener">${icon('out')}Ver o site</a>
        <button class="btn btn--line" type="button" data-logout2>${icon('sair')}Sair do painel</button>
      </div>
    </section>
  </div>`;
  $('[data-logout2]', body).addEventListener('click', logout);
  const form = $('[data-pw]', body);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = form.elements;
    const err = $('.form-error', form);
    err.textContent = '';
    if (f.next.value.length < 8) return (err.textContent = 'A nova senha precisa de pelo menos 8 caracteres.');
    if (f.next.value !== f.again.value) return (err.textContent = 'As duas senhas novas não são iguais.');
    try {
      await api('/password', { method: 'POST', body: { current: f.current.value, next: f.next.value } });
      form.reset();
      toast('Senha trocada.');
    } catch (e2) {
      err.textContent = e2.status === 401 ? 'A senha atual não está certa.' : errorText(e2);
    }
  });
}

boot();
