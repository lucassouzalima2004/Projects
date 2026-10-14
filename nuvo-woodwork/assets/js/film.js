/* =============================================================================
   O filme da casa: um <canvas> preso na tela que avança quadro a quadro com o
   scroll, com os títulos de cada ambiente subindo e sumindo por cima.

   Os trechos do content.js são vídeos encadeados (o último quadro de um é o
   primeiro do próximo), então tocam um atrás do outro como um voo só. Cada um
   usa a sequência de imagens que o tools/make-frames.sh gera a partir do vídeo
   (assets/frames/<id>/), listada em assets/frames/manifest.js. Trecho sem vídeo
   mostra as fotos de placeholder com um zoom lento.
   Normalmente não é preciso mexer neste arquivo.
   ========================================================================== */
(function () {
  'use strict';

  const C = window.NUVO;
  const film = document.querySelector('[data-film]');
  if (!C || !Array.isArray(C.scenes) || !C.scenes.length || !film) return;

  const FRAMES = window.NUVO_FRAMES || {};
  const stage = film.querySelector('.film__stage');
  const canvas = film.querySelector('.film__canvas');
  const ctx = canvas.getContext('2d');
  const layer = document.createElement('canvas'); // o trecho seguinte, durante a emenda
  const lctx = layer.getContext('2d');
  const beatsRoot = film.querySelector('[data-film-beats]');
  const ruler = film.querySelector('[data-film-ruler]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const INK = '#14110F';

  /* ------------------------------------------------------------ helpers */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ramp = (a, b, v) => {
    const t = clamp((v - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const rich = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');

  const view = { w: 1, h: 1, dpr: 1, portrait: false };

  // Retângulo que cobre a tela com uma imagem iw × ih, mantendo `focus` à vista
  function coverRect(iw, ih, focus, zoom = 1) {
    const s = Math.max(view.w / iw, view.h / ih) * zoom;
    const w = iw * s;
    const h = ih * s;
    const f = focus || [0.5, 0.5];
    return { x: (view.w - w) * f[0], y: (view.h - h) * f[1], w, h };
  }

  function drawCover(g, img, alpha, focus, zoom) {
    const r = coverRect(img.naturalWidth, img.naturalHeight, focus, zoom);
    g.globalAlpha = alpha;
    g.drawImage(img, r.x, r.y, r.w, r.h);
    g.globalAlpha = 1;
  }

  /* ------------------------------------------------------------ sequências de quadros (vídeos) */
  const STRIDES = [16, 8, 4, 2, 1];

  function Sequence(scene, entry) {
    this.scene = scene;
    this.entry = entry;
    this.ext = entry.ext || 'webp';
    this.variant = '';
    this.count = 0;
    this.loaded = 0;
    this.broken = !entry.lg && !entry.mobile;
  }

  // Celular em pé usa os quadros "mobile" (verticais); o resto usa "lg" (16:9)
  Sequence.prototype.choose = function () {
    if (this.broken) return;
    const e = this.entry;
    const v = e.mobile && (view.portrait || !e.lg) ? 'mobile' : 'lg';
    if (v === this.variant) return;
    this.variant = v;
    this.count = e[v].n;
    this.imgs = new Array(this.count);
    this.state = new Uint8Array(this.count); // 0 na fila · 1 baixando · 2 pronto · 3 erro
    this.loaded = 0;
    // Primeiro um quadro a cada 16, depois a cada 8, 4, 2 e 1: o scroll já funciona com
    // poucos quadros e vai ficando mais suave conforme o resto chega. O último quadro
    // (o ambiente pronto) vem logo no começo.
    this.levels = STRIDES.map(() => []);
    for (let i = 0; i < this.count; i++) {
      const lv = i === this.count - 1 ? 0 : STRIDES.findIndex((s) => i % s === 0);
      this.levels[lv].push(i);
    }
    this.cursor = STRIDES.map(() => 0);
  };

  Sequence.prototype.next = function (lv) {
    const list = this.levels[lv];
    let c = this.cursor[lv];
    while (c < list.length && this.state[list[c]]) c++;
    this.cursor[lv] = c;
    return c < list.length ? list[c] : -1;
  };

  Sequence.prototype.src = function (i) {
    return 'assets/frames/' + this.scene.id + '/' + this.variant + '/' + String(i + 1).padStart(4, '0') + '.' + this.ext;
  };

  Sequence.prototype.nearest = function (i) {
    for (let d = 0; d < this.count; d++) {
      if (this.state[i - d] === 2) return i - d;
      if (this.state[i + d] === 2) return i + d;
    }
    return -1;
  };

  Sequence.prototype.progress = function () {
    return this.count ? this.loaded / this.count : 0;
  };

  Sequence.prototype.draw = function (g, fp) {
    if (this.broken || !this.count) return false;
    const x = fp * (this.count - 1);
    const i = Math.floor(x);
    const a = this.nearest(i);
    if (a < 0) return false;
    const focus = this.variant === 'mobile' ? null : this.scene.focus;
    drawCover(g, this.imgs[a], 1, focus);
    // Entre dois quadros prontos, mistura os dois: o movimento fica mais suave
    const f = x - i;
    if (a === i && f > 0.04 && this.state[i + 1] === 2) drawCover(g, this.imgs[i + 1], f, focus);
    return true;
  };

  const queue = { active: 0, max: 6 };

  function pump() {
    while (queue.active < queue.max) {
      const job = pick();
      if (!job) return;
      fetchFrame(job[0], job[1]);
    }
  }

  // Próximo quadro a baixar: o trecho atual e os seguintes primeiro, e os quadros
  // "espaçados" de cada trecho antes dos intermediários. Trechos longe de onde a pessoa
  // está ficam só com os espaçados até ela chegar perto (economiza o 4G).
  function pick() {
    let best = null;
    let score = Infinity;
    scenes.forEach((s) => {
      const m = s.seq;
      if (!m || m.broken || !m.count) return;
      const d = s.index >= now.index ? s.index - now.index : (now.index - s.index) * 2;
      const deepest = d <= 2 ? STRIDES.length - 1 : 1;
      for (let lv = 0; lv <= deepest && d + lv < score; lv++) {
        const f = m.next(lv);
        if (f >= 0) {
          best = [m, f];
          score = d + lv;
          break;
        }
      }
    });
    return best;
  }

  function fetchFrame(m, i) {
    const variant = m.variant;
    const img = new Image();
    img.decoding = 'async';
    m.state[i] = 1;
    queue.active++;
    const done = (ok) => {
      queue.active--;
      if (m.variant === variant) {
        m.state[i] = ok ? 2 : 3;
        if (ok) {
          m.imgs[i] = img;
          m.loaded++;
        } else if (i === 0) {
          m.broken = true; // sem o primeiro quadro, o trecho volta para as fotos
        }
        buffer(m.scene);
        if (Math.abs(m.scene.index - now.index) <= 1) requestDraw();
      }
      pump();
    };
    img.onload = () => {
      (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => done(true));
    };
    img.onerror = () => done(false);
    img.src = m.src(i);
  }

  /* ------------------------------------------------------------ placeholder (trecho sem vídeo) */
  const cache = {};
  function image(src) {
    if (cache[src]) return cache[src];
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      img.ok = true;
      requestDraw();
    };
    img.src = src;
    return (cache[src] = img);
  }

  // As fotos do trecho, uma depois da outra, com zoom lento e fusão entre elas
  function Stills(opt) {
    this.items = (opt.photos || []).map((p) => {
      const it = typeof p === 'string' ? { src: p } : p;
      return { img: image('assets/img/' + it.src), focus: it.focus || opt.focus };
    });
  }

  Stills.prototype.draw = function (g, fp) {
    const n = this.items.length;
    if (!n) return false;
    const x = Math.min(fp * n, n - 0.0001);
    const i = Math.floor(x);
    const t = x - i;
    const zoom = (u) => 1.02 + 0.07 * u;
    const cur = this.items[i];
    if (cur.img.ok) drawCover(g, cur.img, 1, cur.focus, zoom(t));
    const nx = this.items[i + 1];
    if (nx && nx.img.ok && t > 0.72) drawCover(g, nx.img, ramp(0.72, 1, t), nx.focus, zoom(0));
    return cur.img.ok;
  };

  /* ------------------------------------------------------------ trechos e linha do tempo */
  const scenes = C.scenes.map((raw, index) => {
    const last = index === C.scenes.length - 1;
    const s = Object.assign({}, raw, {
      index,
      length: raw.length || 260,
      lead: raw.lead ?? 0.03,
      hold: raw.hold ?? (last ? 0.3 : 0.25),
      // Vídeos encadeados quase não precisam de fusão: só o bastante para esconder uma diferença pequena
      blend: last ? 0 : raw.blend ?? 0.04,
    });
    s.beats = (raw.beats || []).map((b) => Object.assign({ at: [0.6, 0.97] }, b));
    s.seq = FRAMES[s.id] ? new Sequence(s, FRAMES[s.id]) : null;
    s.ph = null; // criado quando o trecho chega perto da tela
    return s;
  });

  let total = 0;
  scenes.forEach((s) => {
    s.start = total;
    total += s.length;
  });
  film.style.setProperty('--film-len', total);

  function placeholder(s) {
    if (!s.ph) s.ph = new Stills(s.placeholder || {});
    return s.ph;
  }

  // Posição do vídeo (0 a 1) num ponto do trecho: parado no começo (lead), andando, e parado
  // no fim (hold) com o ambiente pronto enquanto o título é lido.
  function framePos(s, p) {
    if (reduce.matches) return p <= s.lead ? 0 : 1; // sem animação: o começo e, depois, o ambiente pronto
    return clamp((p - s.lead) / (1 - s.lead - s.hold));
  }

  function paint(g, s, p) {
    g.globalAlpha = 1;
    g.fillStyle = INK;
    g.fillRect(0, 0, view.w, view.h);
    const fp = framePos(s, p);
    // Com vídeo, fica no escuro só até chegar o primeiro quadro (as fotos entram se o vídeo falhar)
    if (s.seq && !s.seq.broken) {
      s.seq.draw(g, fp);
      return;
    }
    placeholder(s).draw(g, fp);
  }

  /* ------------------------------------------------------------ títulos e régua */
  function beatHTML(b) {
    const tag = b.hero ? 'h1' : 'h2';
    let h = '';
    if (b.eyebrow) h += '<p class="beat__eyebrow">' + esc(b.eyebrow) + '</p>';
    h += '<' + tag + ' class="beat__title">' +
      String(b.title || '').split('\n').map((l) => '<span class="beat__line">' + rich(l) + '</span>').join('') +
      '</' + tag + '>';
    if (b.text) h += '<p class="beat__text">' + esc(b.text) + '</p>';
    if (b.actions && C.contact) {
      h += '<div class="beat__actions">' +
        '<a class="btn btn--solid" href="#contact">Book a free consultation</a>' +
        '<a class="btn btn--line" href="tel:' + esc(C.contact.tel) + '">Call ' + esc(C.contact.phone) + '</a></div>';
    }
    if (b.cue) h += '<p class="beat__cue"><span aria-hidden="true"></span>' + esc(b.cue) + '</p>';
    return h;
  }

  scenes.forEach((s) => {
    s.beats.forEach((b) => {
      const el = document.createElement('article');
      el.className = 'beat beat--' + (b.align || 'left') + (b.hero ? ' beat--hero' : '');
      el.innerHTML = beatHTML(b);
      beatsRoot.appendChild(el);
      b.el = el;
      b.o = -1;
      b.y = 0;
    });
  });

  ruler.innerHTML =
    '<ol class="ruler__list">' +
    scenes
      .map(
        (s) =>
          '<li class="ruler__seg" style="--len:' + s.length + '">' +
          '<button class="ruler__btn" type="button" data-go="' + s.index + '">' +
          '<span class="ruler__num">' + pad(s.index + 1) + '</span><span class="ruler__name">' + esc(s.label) + '</span></button>' +
          '<span class="ruler__buffer" aria-hidden="true"></span></li>'
      )
      .join('') +
    '</ol><span class="ruler__fill" aria-hidden="true"></span><span class="ruler__cursor" aria-hidden="true"></span>';
  const segs = Array.from(ruler.querySelectorAll('.ruler__seg'));
  const btns = Array.from(ruler.querySelectorAll('.ruler__btn'));

  // Faixa clara na régua: quanto do vídeo de cada trecho já foi baixado
  function buffer(s) {
    const v = s.seq && !s.seq.broken ? s.seq.progress() : 1;
    segs[s.index].style.setProperty('--buf', v.toFixed(3));
  }

  const now = { index: -1, shown: [] };

  // Cada título entra subindo, fica parado enquanto é lido e sai para cima, tudo preso ao scroll
  function beatState(s, b, p) {
    const [a, z] = b.at;
    if (p < a || p > z) return [0, 0];
    const f = Math.min(0.05, (z - a) / 4);
    const tin = a <= 0 && s.index === 0 ? 1 : clamp((p - a) / f);
    const tout = z >= 1 && s.index === scenes.length - 1 ? 1 : clamp((z - p) / f);
    const o = Math.min(tin, tout);
    if (reduce.matches) return [o, 0];
    const y = tin < 1 ? (1 - easeOut(tin)) * 42 : tout < 1 ? -(1 - easeOut(tout)) * 42 : 0;
    return [o, y];
  }

  function setBeat(b, o, y) {
    if (b.o === o && b.y === y) return;
    b.o = o;
    b.y = y;
    b.el.style.setProperty('--o', o.toFixed(3));
    b.el.style.setProperty('--y', y.toFixed(1));
    b.el.classList.toggle('is-on', o > 0.02);
  }

  function ui(i, s, p) {
    if (i !== now.index) {
      now.index = i;
      btns.forEach((b, j) => (j === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
      const next = scenes[i + 1];
      if (next && !next.seq) placeholder(next); // já começa a baixar as fotos do próximo
      pump();
    }
    let lead = null;
    const shown = [];
    s.beats.forEach((b) => {
      const [o, y] = beatState(s, b, p);
      setBeat(b, o, y);
      if (o > 0) {
        shown.push(b);
        if (!lead || o > lead.o) lead = b;
      }
    });
    now.shown.forEach((b) => {
      if (!shown.includes(b)) setBeat(b, 0, 0);
    });
    now.shown = shown;
    stage.dataset.align = lead ? lead.align || 'left' : 'none';
    ruler.style.setProperty('--t', cur.toFixed(4));
  }

  /* ------------------------------------------------------------ desenho e scroll */
  const metrics = { top: 0, dist: 1 };
  let cur = 0;
  let target = 0;
  let raf = 0;
  let last = 0;
  let dirty = true;

  function draw() {
    const pos = cur * total;
    let i = 0;
    while (i < scenes.length - 1 && pos >= scenes[i].start + scenes[i].length) i++;
    const s = scenes[i];
    const p = clamp((pos - s.start) / s.length);
    ui(i, s, p);
    // Depois do filme, a tela já não mostra o canvas: não precisa desenhar
    if (window.scrollY > metrics.top + metrics.dist + window.innerHeight) return;
    paint(ctx, s, p);
    const next = scenes[i + 1];
    if (next && s.blend > 0 && p > 1 - s.blend) {
      paint(lctx, next, 0);
      ctx.globalAlpha = ramp(1 - s.blend, 1, p);
      ctx.drawImage(layer, 0, 0);
      ctx.globalAlpha = 1;
    }
  }

  function readScroll() {
    target = clamp((window.scrollY - metrics.top) / metrics.dist);
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function requestDraw() {
    dirty = true;
    kick();
  }

  // O vídeo segue o scroll com um pouco de inércia, para não "pular" de quadro em quadro
  function tick(t) {
    raf = 0;
    const dt = last ? Math.min(64, t - last) : 16;
    const prev = cur;
    last = t;
    if (reduce.matches) {
      cur = target;
    } else {
      cur += (target - cur) * (1 - Math.exp(-dt / 95));
      if (Math.abs(target - cur) * total < 0.04) cur = target;
    }
    if (cur !== prev || dirty) {
      dirty = false;
      draw();
    }
    if (cur !== target) kick();
    else last = 0;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(stage.clientWidth * dpr));
    const h = Math.max(1, Math.round(stage.clientHeight * dpr));
    if (w !== canvas.width || h !== canvas.height) {
      canvas.width = layer.width = w;
      canvas.height = layer.height = h;
    }
    view.w = w;
    view.h = h;
    view.dpr = dpr;
    view.portrait = h > w * 1.05;
    scenes.forEach((s) => {
      if (s.seq) s.seq.choose();
      buffer(s);
    });
    metrics.top = film.getBoundingClientRect().top + window.scrollY;
    metrics.dist = Math.max(1, film.offsetHeight - stage.offsetHeight);
    readScroll();
    cur = target;
    requestDraw();
    pump();
  }

  // Vai para o começo de um trecho (o primeiro, para o topo)
  function goTo(i) {
    const s = scenes[i];
    if (!s) return;
    const p = i === 0 ? 0 : s.lead + 0.005;
    const y = metrics.top + ((s.start + s.length * p) / total) * metrics.dist;
    window.scrollTo({ top: Math.round(y), behavior: reduce.matches ? 'auto' : 'smooth' });
  }

  ruler.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (b) goTo(Number(b.dataset.go));
  });

  window.addEventListener('scroll', () => {
    readScroll();
    kick();
  }, { passive: true });
  window.addEventListener('resize', resize);
  if (reduce.addEventListener) reduce.addEventListener('change', requestDraw);

  film.classList.add('is-ready'); // a seção ganha a altura do filme antes da primeira medida
  resize();

  window.NUVO_FILM = {
    goTo,
    goToScene(id) {
      const s = scenes.find((x) => x.id === id);
      if (s) goTo(s.index);
    },
  };
})();
