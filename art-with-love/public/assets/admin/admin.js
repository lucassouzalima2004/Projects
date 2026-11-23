/* Painel da Lulu (/admin): lacinhos nas bonequinhas, preços e estoque, pagamentos. */

const $ = (s, r = document) => r.querySelector(s);
const app = $('#app');
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const asset = (p) => `/${String(p).replace(/^\//, '')}`;
const money = (n) => `£${Number(n).toFixed(2).replace(/\.00$/, '')}`;

let state = null; // { launch, dolls, bows, products, collections, stripe }

/* ------------------------------------------------------------- servidor --- */
async function api(path, opts = {}) {
  const res = await fetch(`/api/admin/${path}`, { credentials: 'same-origin', ...opts });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== 'login') {
    state = null;
    showLogin();
    throw new Error(data.error || 'Entre com a sua senha.');
  }
  if (!res.ok) throw new Error(data.error || 'Algo deu errado. Tente de novo.');
  return data;
}
const put = (path, body) => api(path, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

let toastTimer;
function toast(msg, kind = 'ok') {
  const t = $('#toast');
  t.textContent = msg;
  t.dataset.kind = kind;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 3600);
}

async function busy(btn, fn) {
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  try {
    return await fn();
  } catch (e) {
    toast(e.message, 'error');
    return null;
  } finally {
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
  }
}

/* -------------------------------------------------------------- moldura --- */
function frame(title, body, { back = true } = {}) {
  app.innerHTML = `
    <header class="top">
      ${back ? '<a class="top__back" href="#/" aria-label="Voltar ao início">‹ Início</a>' : '<span></span>'}
      <img class="top__logo" src="/assets/img/logo.webp" alt="Art with Love" width="640" height="144">
      <a class="top__site" href="/" target="_blank" rel="noopener">Ver site ↗</a>
    </header>
    <main class="page">
      <h1>${title}</h1>
      ${body}
    </main>`;
  window.scrollTo(0, 0);
}

function showLogin() {
  app.innerHTML = `
    <main class="login">
      <img class="login__logo" src="/assets/img/logo.webp" alt="Art with Love" width="640" height="144">
      <p class="login__by">By Lulu - London</p>
      <h1>Painel da loja</h1>
      <form class="card login__card" id="login">
        <label for="pw">Sua senha</label>
        <input id="pw" type="password" autocomplete="current-password" required>
        <button class="btn btn--primary" type="submit">Entrar</button>
        <p class="hint">Esqueceu a senha? Fale com o Lucas.</p>
      </form>
    </main>`;
  $('#login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const ok = await busy(btn, () => api('login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: $('#pw').value }) }));
    if (ok) {
      await load();
      location.hash = '#/';
      route();
    }
  });
  $('#pw').focus();
}

/* ---------------------------------------------------------------- início --- */
function home() {
  const s = state.stripe;
  frame('Olá, Lulu! 💕', `
    <p class="lead">O que você quer fazer hoje?</p>
    <nav class="menu">
      <a class="menu__item" href="#/lacos"><span class="menu__icon">🎀</span><span><strong>Lacinhos nas bonequinhas</strong><small>Troque os laços do lançamento da semana</small></span></a>
      <a class="menu__item" href="#/produtos"><span class="menu__icon">🏷️</span><span><strong>Preços e estoque</strong><small>Mude preços e marque o que esgotou</small></span></a>
      <a class="menu__item" href="#/pagamentos"><span class="menu__icon">💳</span><span><strong>Pagamentos</strong><small>${s.connected ? 'Cartão e PayPal ligados ✓' : 'Ligue o cartão e o PayPal para receber'}</small></span></a>
    </nav>
    <button class="btn btn--ghost btn--small" type="button" id="logout">Sair do painel</button>`, { back: false });
  $('#logout').addEventListener('click', async () => {
    await api('logout', { method: 'POST' }).catch(() => {});
    state = null;
    showLogin();
  });
}

/* ------------------------------------------------- lacinhos: a vitrine --- */
function bowsHtml(look, selected = -1) {
  return (look.bows || []).map((b, i) => `<img class="bow${i === selected ? ' is-selected' : ''}" data-i="${i}" src="${esc(asset(b.src))}" alt="" draggable="false" style="--x:${b.x}%;--y:${b.y}%;--w:${b.width}%;--r:${b.rotate}deg;--sx:${b.flip ? -1 : 1}">`).join('');
}

function linkName(look) {
  const p = state.products.find((x) => x.id === look.product);
  if (p) return p.name;
  const c = state.collections.find((x) => x.id === look.collection);
  return c ? `Coleção ${c.name}` : 'Nenhum';
}

function lacos() {
  const L = state.launch;
  frame('Lacinhos nas bonequinhas', `
    <p class="lead">Toque numa bonequinha para trocar os laços dela. Depois, é só tocar em <strong>Salvar e publicar</strong>.</p>
    <section class="card">
      <label for="l-title">Título da seção</label>
      <input id="l-title" value="${esc(L.title)}" maxlength="60" placeholder="Ex.: The Winter launch">
      <label for="l-text">Texto embaixo do título</label>
      <textarea id="l-text" rows="2" maxlength="240">${esc(L.text)}</textarea>
      <button class="btn btn--primary" type="button" id="save-texts">Salvar e publicar</button>
    </section>
    <div class="dolls">
      ${L.looks.map((l, i) => `
        <a class="doll" href="#/lacos/${i}">
          <span class="stage stage--thumb"><img class="stage__doll" src="${esc(asset(l.artSmall || l.art))}" alt="">${bowsHtml(l)}</span>
          <span class="doll__info"><strong>${esc(l.label || 'Sem etiqueta')}</strong><small>Leva para: ${esc(linkName(l))}</small></span>
          <span class="doll__edit">Editar</span>
        </a>`).join('')}
    </div>`);
  $('#save-texts').addEventListener('click', (e) => busy(e.currentTarget, async () => {
    L.title = $('#l-title').value;
    L.text = $('#l-text').value;
    await publish();
  }));
}

async function publish() {
  const res = await put('launch', state.launch);
  state.launch = res.launch;
  toast('Publicado! Já está no site 💕');
}

/* --------------------------------------------- lacinhos: uma bonequinha --- */
function editor(i) {
  const look = state.launch.looks[i];
  if (!look) return (location.hash = '#/lacos');
  if (!Array.isArray(look.bows)) look.bows = []; // bonequinha que ainda não tem laço
  let sel = look.bows.length ? 0 : -1;

  const options = `
    <option value="">Nenhum</option>
    <optgroup label="Produtos">${state.products.map((p) => `<option value="p:${esc(p.id)}" ${look.product === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</optgroup>
    <optgroup label="Coleções">${state.collections.map((c) => `<option value="c:${esc(c.id)}" ${look.collection === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</optgroup>`;

  frame(`Bonequinha ${i + 1}`, `
    <div class="editor">
      <div class="editor__stage">
        <div class="stage" id="stage"><img class="stage__doll" src="${esc(asset(look.art))}" alt="" draggable="false"><span id="bows"></span></div>
        <p class="hint center">Arraste o laço com o dedo até o cabelo.</p>
      </div>
      <div class="editor__side">
        <section class="card" id="controls"></section>
        <section class="card">
          <h2>Seus laços</h2>
          <p class="hint">Toque num laço para colocar na bonequinha (até 4).</p>
          <div class="library" id="library"></div>
        </section>
        <section class="card">
          <label for="link">Quando a cliente toca na bonequinha, leva para</label>
          <select id="link">${options}</select>
          <label for="label">Etiqueta no canto da foto</label>
          <input id="label" maxlength="30" value="${esc(look.label)}" placeholder="Ex.: New bow">
        </section>
      </div>
    </div>
    <div class="savebar"><button class="btn btn--primary btn--block" type="button" id="save">Salvar e publicar</button></div>
    <input type="file" id="file" accept="image/*" hidden>`);

  const stage = $('#stage');

  function drawBows() {
    $('#bows').innerHTML = bowsHtml(look, sel);
  }

  function drawControls() {
    const b = look.bows[sel];
    $('#controls').innerHTML = b ? `
      <h2>Laço escolhido</h2>
      <label for="size">Tamanho</label>
      <input id="size" type="range" min="5" max="60" step="0.5" value="${b.width}">
      <label for="turn">Girar</label>
      <input id="turn" type="range" min="-90" max="90" step="1" value="${b.rotate}">
      <div class="row">
        <button class="btn btn--ghost btn--small" type="button" id="flip">↔︎ Espelhar</button>
        <button class="btn btn--ghost btn--small btn--danger" type="button" id="remove">Tirar este laço</button>
      </div>` : `
      <h2>Nenhum laço nesta bonequinha</h2>
      <p class="hint">Escolha um dos seus laços abaixo, ou envie a foto de um laço novo.</p>`;
    if (!b) return;
    $('#size').addEventListener('input', (e) => { b.width = Number(e.target.value); drawBows(); });
    $('#turn').addEventListener('input', (e) => { b.rotate = Number(e.target.value); drawBows(); });
    $('#flip').addEventListener('click', () => { b.flip = !b.flip; drawBows(); });
    $('#remove').addEventListener('click', () => {
      look.bows.splice(sel, 1);
      sel = look.bows.length ? 0 : -1;
      drawBows();
      drawControls();
    });
  }

  function drawLibrary() {
    $('#library').innerHTML = `
      <button class="lib lib--new" type="button" id="new-bow"><span>＋</span>Laço novo</button>
      ${state.bows.map((b) => `<button class="lib" type="button" data-src="${esc(b.src)}" title="${esc(b.name)}"><img src="${esc(asset(b.src))}" alt="${esc(b.name)}"></button>`).join('')}`;
  }

  function addBow(src) {
    if (look.bows.length >= 4) return toast('Cada bonequinha leva até 4 laços.', 'error');
    look.bows.push({ src, x: 50, y: 22, width: 22, rotate: 0 });
    sel = look.bows.length - 1;
    drawBows();
    drawControls();
  }

  // arrastar o laço
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.bow');
    if (!el) return;
    e.preventDefault();
    sel = Number(el.dataset.i);
    drawBows();
    drawControls();
    const r = stage.getBoundingClientRect();
    const b = look.bows[sel];
    drag = { id: e.pointerId, dx: e.clientX - (r.left + (b.x / 100) * r.width), dy: e.clientY - (r.top + (b.y / 100) * r.height) };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const r = stage.getBoundingClientRect();
    const b = look.bows[sel];
    b.x = Math.min(100, Math.max(0, ((e.clientX - drag.dx - r.left) / r.width) * 100));
    b.y = Math.min(100, Math.max(0, ((e.clientY - drag.dy - r.top) / r.height) * 100));
    const img = stage.querySelector(`.bow[data-i="${sel}"]`);
    img.style.setProperty('--x', `${b.x}%`);
    img.style.setProperty('--y', `${b.y}%`);
  });
  const endDrag = () => { drag = null; };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  $('#library').addEventListener('click', (e) => {
    if (e.target.closest('#new-bow')) return $('#file').click();
    const b = e.target.closest('[data-src]');
    if (b) addBow(b.dataset.src);
  });
  $('#file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const bow = await newBow(file);
    if (!bow) return;
    state.bows.push(bow);
    drawLibrary();
    addBow(bow.src);
    toast('Laço novo pronto! Agora arraste até o cabelo.');
  });

  $('#save').addEventListener('click', (e) => busy(e.currentTarget, async () => {
    const v = $('#link').value;
    delete look.product;
    delete look.collection;
    if (v.startsWith('p:')) look.product = v.slice(2);
    if (v.startsWith('c:')) look.collection = v.slice(2);
    look.label = $('#label').value;
    look.bows.forEach((b) => { b.x = Math.round(b.x * 10) / 10; b.y = Math.round(b.y * 10) / 10; });
    await publish();
    location.hash = '#/lacos';
  }));

  drawBows();
  drawControls();
  drawLibrary();
}

/* -------------------------------------------- laço novo: tirar o fundo --- */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Não consegui abrir essa foto. Tente outra.'));
    img.src = URL.createObjectURL(file);
  });
}

// Apaga o fundo liso que encosta nas bordas da foto (tolerância = quanto da cor do fundo apagar)
function removeBackground(src, tol) {
  const { width: w, height: h } = src;
  const out = new ImageData(new Uint8ClampedArray(src.data), w, h);
  const d = out.data;
  const border = [];
  for (let x = 0; x < w; x += 4) border.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y += 4) border.push(y * w, y * w + w - 1);
  const med = (k) => border.map((p) => d[p * 4 + k]).sort((a, b) => a - b)[border.length >> 1];
  const bg = [med(0), med(1), med(2)];
  const far = (p) => Math.hypot(d[p * 4] - bg[0], d[p * 4 + 1] - bg[1], d[p * 4 + 2] - bg[2]) > tol;
  const seen = new Uint8Array(w * h);
  const stack = border.filter((p) => !far(p));
  stack.forEach((p) => { seen[p] = 1; });
  while (stack.length) {
    const p = stack.pop();
    d[p * 4 + 3] = 0;
    const x = p % w;
    for (const q of [p - w, p + w, x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1]) {
      if (q >= 0 && q < w * h && !seen[q] && !far(q)) { seen[q] = 1; stack.push(q); }
    }
  }
  // borda suave: pixels vizinhos do fundo ficam meio transparentes
  for (let p = 0; p < w * h; p++) {
    if (!d[p * 4 + 3]) continue;
    const x = p % w;
    const n = [p - w, p + w, x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1].filter((q) => q >= 0 && q < w * h && seen[q]).length;
    if (n) d[p * 4 + 3] = Math.min(d[p * 4 + 3], 255 - n * 50);
  }
  return out;
}

function hasTransparency(data) {
  for (let i = 3; i < data.length; i += 4 * 7) if (data[i] < 250) return true;
  return false;
}

// Corta a sobra transparente e devolve um PNG de no máximo 800 px
function finish(imgData) {
  const { width: w, height: h, data } = imgData;
  let x0 = w; let y0 = h; let x1 = 0; let y1 = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 12) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    }
  }
  if (x1 <= x0 || y1 <= y0) throw new Error('A foto ficou vazia. Diminua o “Limpar o fundo”.');
  const tmp = document.createElement('canvas');
  tmp.width = w; tmp.height = h;
  tmp.getContext('2d').putImageData(imgData, 0, 0);
  const s = Math.min(1, 800 / Math.max(x1 - x0, y1 - y0));
  const c = document.createElement('canvas');
  c.width = Math.round((x1 - x0 + 1) * s);
  c.height = Math.round((y1 - y0 + 1) * s);
  c.getContext('2d').drawImage(tmp, x0, y0, x1 - x0 + 1, y1 - y0 + 1, 0, 0, c.width, c.height);
  return new Promise((resolve) => c.toBlob(resolve, 'image/png'));
}

function newBow(file) {
  return new Promise(async (resolve) => {
    let img;
    try {
      img = await loadImage(file);
    } catch (e) {
      toast(e.message, 'error');
      return resolve(null);
    }
    const s = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * s);
    c.height = Math.round(img.naturalHeight * s);
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const original = ctx.getImageData(0, 0, c.width, c.height);
    const cutAlready = hasTransparency(original.data);
    let tol = 45;
    let current = cutAlready ? original : removeBackground(original, tol);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__card">
        <h2>Laço novo</h2>
        <p class="hint">${cutAlready ? 'Essa foto já veio sem fundo. 👍' : 'Apaguei o fundo da foto. Se sobrou fundo, aumente; se apagou parte do laço, diminua.'}</p>
        <canvas class="checker" id="preview"></canvas>
        ${cutAlready ? '' : `<label for="tol">Limpar o fundo</label><input id="tol" type="range" min="8" max="140" value="${tol}">`}
        <label for="bow-name">Nome do laço (só para você)</label>
        <input id="bow-name" maxlength="40" placeholder="Ex.: Laço vermelho de Natal">
        <div class="row">
          <button class="btn btn--ghost" type="button" data-act="cancel">Cancelar</button>
          <button class="btn btn--primary" type="button" data-act="use">Usar este laço</button>
        </div>
      </div>`;
    document.body.append(modal);
    const prev = $('#preview', modal);
    prev.width = c.width;
    prev.height = c.height;
    const paint = () => prev.getContext('2d').putImageData(current, 0, 0);
    paint();
    $('#tol', modal)?.addEventListener('input', (e) => {
      tol = Number(e.target.value);
      current = removeBackground(original, tol);
      paint();
    });
    modal.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'cancel') { modal.remove(); resolve(null); }
      if (act === 'use') {
        const res = await busy(e.target.closest('button'), async () => {
          const blob = await finish(current);
          const name = encodeURIComponent($('#bow-name', modal).value || 'Laço novo');
          return api('upload', { method: 'POST', headers: { 'content-type': 'image/png', 'x-name': name }, body: blob });
        });
        if (!res) return;
        modal.remove();
        resolve(res.bow);
      }
    });
  });
}

/* ------------------------------------------------------ preços e estoque --- */
function produtos() {
  frame('Preços e estoque', `
    <p class="lead">Mude o preço ou marque o que esgotou. Depois toque em <strong>Salvar</strong>.</p>
    <div class="products">
      ${state.products.map((p) => {
        const mode = p.stock === null ? 'sale' : p.stock === 0 ? 'out' : 'qty';
        return `
        <div class="product card" data-id="${esc(p.id)}">
          <img src="${esc(p.photo)}" alt="" loading="lazy">
          <div class="product__body">
            <strong>${esc(p.name)}</strong>
            <small>${esc(p.size)}${p.price !== p.basePrice ? ` · preço original ${money(p.basePrice)}` : ''}</small>
            <div class="product__row">
              <label class="price">£ <input type="number" inputmode="decimal" min="0.5" step="0.5" value="${p.price}" data-f="price" aria-label="Preço de ${esc(p.name)}"></label>
              <select data-f="mode" aria-label="Estoque de ${esc(p.name)}">
                <option value="sale" ${mode === 'sale' ? 'selected' : ''}>À venda</option>
                <option value="qty" ${mode === 'qty' ? 'selected' : ''}>Poucas peças</option>
                <option value="out" ${mode === 'out' ? 'selected' : ''}>Esgotado</option>
              </select>
              <input class="qty" type="number" inputmode="numeric" min="1" max="999" value="${p.stock || 1}" data-f="qty" aria-label="Quantas peças de ${esc(p.name)}" ${mode === 'qty' ? '' : 'hidden'}>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="savebar"><button class="btn btn--primary btn--block" type="button" id="save">Salvar preços e estoque</button></div>`);
  $('.products').addEventListener('change', (e) => {
    if (e.target.dataset.f !== 'mode') return;
    e.target.closest('.product').querySelector('[data-f="qty"]').hidden = e.target.value !== 'qty';
  });
  $('#save').addEventListener('click', (e) => busy(e.currentTarget, async () => {
    const products = {};
    app.querySelectorAll('.product').forEach((row) => {
      const mode = row.querySelector('[data-f="mode"]').value;
      products[row.dataset.id] = {
        price: Number(row.querySelector('[data-f="price"]').value),
        stock: mode === 'sale' ? null : mode === 'out' ? 0 : Math.max(1, Number(row.querySelector('[data-f="qty"]').value) || 1),
      };
    });
    await put('products', { products });
    await load();
    produtos();
    toast('Preços e estoque salvos! Já está no site 💕');
  }));
}

/* ----------------------------------------------------------- pagamentos --- */
function pagamentos() {
  const s = state.stripe;
  frame('Pagamentos', s.connected ? `
    <section class="card status status--on">
      <h2>✓ Cartão e PayPal ligados</h2>
      <p>As clientes pagam no site e o dinheiro vai para a sua conta do Stripe, que manda para o seu banco.</p>
      <p><strong>Conta:</strong> ${esc(s.name)}${s.livemode === false ? ' <span class="tag">modo de teste</span>' : ''}${s.keyEnd ? ` · chave terminada em ${esc(s.keyEnd)}` : ''}</p>
      <div class="row">
        <a class="btn btn--primary" href="https://dashboard.stripe.com" target="_blank" rel="noopener">Abrir o Stripe ↗</a>
        ${s.fixed ? '' : '<button class="btn btn--ghost btn--danger" type="button" id="off">Desligar</button>'}
      </div>
    </section>` : `
    <section class="card status">
      <h2>Hoje os pedidos chegam pelo WhatsApp</h2>
      <p>Para as clientes pagarem com cartão, Apple Pay, Google Pay e PayPal direto no site, conecte a sua conta do Stripe. É grátis: o Stripe só cobra uma pequena taxa quando você vende.</p>
    </section>
    <ol class="steps">
      <li>Crie a sua conta em <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener">dashboard.stripe.com/register</a>, com o seu e-mail e o país <strong>United Kingdom</strong>.</li>
      <li>Preencha os dados do seu negócio e a <strong>conta do banco</strong> (sort code e account number). É para ela que o Stripe manda o dinheiro das vendas.</li>
      <li>Para aceitar PayPal: <strong>Settings → Payment methods → PayPal</strong> e conecte a sua conta PayPal.</li>
      <li>Copie a sua chave: <strong>Developers → API keys → Secret key</strong> (ela começa com <code>sk_live_</code>).</li>
      <li>Cole a chave aqui embaixo e toque em <strong>Conectar</strong>.</li>
    </ol>
    <form class="card" id="connect">
      <label for="key">Chave secreta do Stripe</label>
      <input id="key" type="password" autocomplete="off" spellcheck="false" placeholder="sk_live_…" required>
      <button class="btn btn--primary" type="submit">Conectar</button>
      <p class="hint">A chave fica guardada só no servidor da loja. Nunca mande essa chave por WhatsApp ou e-mail.</p>
    </form>`);
  $('#connect')?.addEventListener('submit', (e) => {
    e.preventDefault();
    busy(e.target.querySelector('button'), async () => {
      const res = await put('stripe', { secretKey: $('#key').value });
      state.stripe = res.stripe;
      pagamentos();
      toast('Pronto! O site já aceita cartão 💳');
    });
  });
  $('#off')?.addEventListener('click', (e) => {
    if (!confirm('Desligar os pagamentos? As clientes voltam a pedir pelo WhatsApp.')) return;
    busy(e.currentTarget, async () => {
      const res = await api('stripe', { method: 'DELETE' });
      state.stripe = res.stripe;
      pagamentos();
      toast('Pagamentos desligados.');
    });
  });
}

/* ---------------------------------------------------------------- rotas --- */
async function load() {
  state = await api('data');
}

function route() {
  if (!state) return;
  const h = location.hash.replace(/^#\/?/, '');
  const m = h.match(/^lacos\/(\d+)$/);
  if (m) return editor(Number(m[1]));
  if (h === 'lacos') return lacos();
  if (h === 'produtos') return produtos();
  if (h === 'pagamentos') return pagamentos();
  return home();
}

addEventListener('hashchange', route);

(async () => {
  try {
    await load();
    route();
  } catch {
    if (!state) showLogin();
  }
})();
