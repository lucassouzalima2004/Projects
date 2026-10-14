/* =============================================================================
   O filme da casa: um <canvas> preso na tela que avança quadro a quadro com o
   scroll, com os textos de cada ambiente entrando e saindo por cima.

   Cada cena do content.js usa a sequência de imagens que o tools/make-frames.sh
   gera a partir dos vídeos (assets/frames/<id>/). O que existe fica listado em
   assets/frames/manifest.js, escrito pelo mesmo script. Cena sem vídeo aparece
   como placeholder: o desenho técnico que vira a foto real, ou a fachada
   desenhada a traço. Normalmente não é preciso mexer neste arquivo.
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
  const layer = document.createElement('canvas'); // a cena seguinte, durante a transição
  const lctx = layer.getContext('2d');
  const beatsRoot = film.querySelector('[data-film-beats]');
  const ruler = film.querySelector('[data-film-ruler]');
  const hud = film.querySelector('[data-film-hud]');
  const numEl = film.querySelector('[data-film-num]');
  const roomEl = film.querySelector('[data-film-room]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const INK = '#14110F';
  const PAPER = '#EADFCD'; // traço do desenho técnico
  const BRONZE = '#C68E4A';

  /* ------------------------------------------------------------ helpers */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ramp = (a, b, v) => {
    const t = clamp((v - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
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

  function drawCover(g, img, alpha, focus) {
    const r = coverRect(img.naturalWidth, img.naturalHeight, focus);
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

  // Próximo quadro a baixar: a cena atual e as seguintes primeiro, e os quadros
  // "espaçados" de cada cena antes dos intermediários. Cenas longe de onde a pessoa
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
          m.broken = true; // sem o primeiro quadro, a cena volta para o placeholder
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

  /* ------------------------------------------------------------ placeholders (cena sem vídeo) */
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

  // Traços brancos sobre preto → traços na cor do papel
  function tinted(img, color) {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  // A "caneta" do plotter: linha dourada com um brilho atrás
  function scanLine(g, x, alpha) {
    const w = 56 * view.dpr;
    const grad = g.createLinearGradient(x - w, 0, x, 0);
    grad.addColorStop(0, 'rgba(198, 142, 74, 0)');
    grad.addColorStop(1, 'rgba(198, 142, 74, .2)');
    g.globalAlpha = alpha;
    g.fillStyle = grad;
    g.fillRect(x - w, 0, w, view.h);
    g.fillStyle = BRONZE;
    g.fillRect(x - view.dpr, 0, view.dpr, view.h);
    g.globalAlpha = 1;
  }

  // Ambiente: o desenho técnico é traçado da esquerda para a direita e a foto real
  // aparece por baixo dele, com a câmera entrando devagar.
  function Blueprint(opt) {
    this.focus = opt.focus;
    this.photo = image('assets/img/rooms/' + opt.photo + '.webp');
    this.lines = image('assets/img/rooms/' + opt.photo + '-lines.webp');
    this.tint = null;
  }

  Blueprint.prototype.draw = function (g, fp) {
    if (!this.lines.ok) return false;
    if (!this.tint) this.tint = tinted(this.lines, PAPER);
    const zoom = 1 + 0.06 * easeInOut(fp);
    const r = coverRect(this.tint.width, this.tint.height, this.focus, zoom);
    const show = ramp(0.4, 0.92, fp);
    if (show > 0 && this.photo.ok) {
      g.globalAlpha = show;
      g.drawImage(this.photo, r.x, r.y, r.w, r.h);
    }
    const sweep = ramp(0, 0.48, fp) * view.w;
    const ink = 1 - ramp(0.62, 0.96, fp);
    if (sweep > 0 && ink > 0) {
      g.save();
      g.beginPath();
      g.rect(0, 0, sweep, view.h);
      g.clip();
      g.globalAlpha = ink;
      g.globalCompositeOperation = 'lighter';
      g.drawImage(this.tint, r.x, r.y, r.w, r.h);
      g.restore();
      if (sweep < view.w) scanLine(g, sweep, ink);
    }
    g.globalAlpha = 1;
    return true;
  };

  // Fachada desenhada a traço numa folha de 1600 × 900 (cenas externas sem vídeo)
  const SHEET = { w: 1600, h: 900, ground: 640 };
  let HOUSE = null;

  function buildHouse() {
    const paths = [];
    const add = (pts) => paths.push({ pts });
    const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
    const rows = (x0, x1, step, y0, y1) => {
      for (let x = x0; x <= x1 + 0.1; x += step) add([[x, y0], [x, y1]]);
    };
    const G = SHEET.ground;
    const glass = [[590, 346, 400, 94], [360, 490, 360, 138], [880, 490, 360, 138]];

    add([[40, G], [1560, G]]); // chão
    add(rect(280, 452, 1040, 16)); // laje do térreo
    add([[330, 468], [330, G]]);
    add([[1270, 468], [1270, G]]);
    add(rect(520, 312, 690, 16)); // laje de cima
    add([[560, 328], [560, 452]]);
    add([[1170, 328], [1170, 452]]);
    add([[300, 476], [1300, 476]]); // forro de madeira
    glass.forEach(([x, y, w, h]) => add(rect(x, y, w, h)));
    rows(670, 910, 80, 346, 440);
    rows(432, 648, 72, 490, 628);
    rows(952, 1168, 72, 490, 628);
    rows(1012, 1152, 14, 340, 448); // brises de madeira
    add(rect(758, 486, 84, G - 486)); // porta pivotante
    add([[742, G + 8], [858, G + 8]]); // degraus
    add([[728, G + 16], [872, G + 16]]);
    add(rect(300, 670, 1000, 30)); // espelho d'água
    for (let y = 680; y <= 692; y += 6) for (let x = 330; x < 1270; x += 90) add([[x, y], [x + 46, y]]);
    [[170, 330, 34], [262, 250, -26], [1392, 352, -38], [1478, 270, 22]].forEach(([x, h, lean]) => palm(add, x, G, h, lean));
    add([[280, 300], [280, 256]]); // cotas
    add([[1320, 300], [1320, 256]]);
    add([[280, 266], [1320, 266]]);
    add([[1350, 312], [1394, 312]]);
    add([[1350, G], [1394, G]]);
    add([[1384, 312], [1384, G]]);
    add(rect(1188, 768, 352, 86)); // carimbo da prancha
    add([[1188, 798], [1540, 798]]);
    add([[1400, 798], [1400, 854]]);

    let total = 0;
    paths.forEach((p) => {
      p.start = total;
      p.len = 0;
      for (let i = 1; i < p.pts.length; i++) p.len += Math.hypot(p.pts[i][0] - p.pts[i - 1][0], p.pts[i][1] - p.pts[i - 1][1]);
      total += p.len;
    });

    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const stars = [];
    for (let i = 0; i < 80; i++) stars.push([rnd() * SHEET.w, rnd() * 290, 0.25 + rnd() * 0.75]);
    return { paths, total, glass, stars };
  }

  function palm(add, x, G, h, lean) {
    const trunk = [];
    for (let t = 0; t <= 1.001; t += 0.1) trunk.push([x + lean * t * t, G - h * t]);
    add(trunk);
    add(trunk.map(([px, py], i) => [px + 9 - i * 0.5, py]));
    const top = trunk[trunk.length - 1];
    for (let k = 0; k < 8; k++) {
      const a = -Math.PI / 2 + (k - 3.5) * 0.42 + (lean > 0 ? 0.12 : -0.12);
      const len = 92 + (k % 3) * 16;
      const pts = [];
      for (let t = 0; t <= 1.001; t += 0.125) pts.push([top[0] + Math.cos(a) * len * t, top[1] + Math.sin(a) * len * t + 58 * t * t]);
      add(pts);
    }
  }

  // Fim de tarde: a fachada é desenhada, as luzes acendem e a câmera vai até a porta, que abre.
  // Noite: a casa inteira acesa e a câmera se afastando.
  function House(opt) {
    this.night = opt.house === 'night';
  }

  House.prototype.draw = function (g, fp) {
    if (!HOUSE) HOUSE = buildHouse();
    const night = this.night;
    const k = night ? 1 - easeInOut(fp) : easeInOut(ramp(0.5, 1, fp));
    const zoom = 1 + (night ? 0.7 : 1.25) * k;
    // A folha fica abaixo do título (no celular em pé, acima do texto) e a câmera desce até a porta
    const ax = 800;
    const ay = lerp(view.portrait ? 980 : 300, 566, k);
    const base = view.portrait ? (view.w / SHEET.w) * 1.3 : Math.max(view.w / SHEET.w, view.h / SHEET.h);
    const s = base * zoom;
    const ox = view.w / 2 - ax * s;
    const oy = view.h / 2 - ay * s;
    const glow = night ? 1 : ramp(0.42, 0.85, fp);
    const dusk = night ? 1 : ramp(0.3, 0.8, fp);

    // céu
    const horizon = oy + SHEET.ground * s;
    const sky = g.createLinearGradient(0, 0, 0, Math.max(2, horizon));
    sky.addColorStop(0, night ? '#07090E' : INK);
    sky.addColorStop(1, night ? '#171B26' : '#3B2616');
    g.globalAlpha = dusk;
    g.fillStyle = sky;
    g.fillRect(0, 0, view.w, view.h);
    g.globalAlpha = 1;

    g.setTransform(s, 0, 0, s, ox, oy);
    if (night) {
      g.fillStyle = PAPER;
      HOUSE.stars.forEach(([x, y, a]) => {
        g.globalAlpha = a * 0.7;
        g.fillRect(x, y, 1.6 / zoom, 1.6 / zoom);
      });
      g.globalAlpha = 1;
    }

    // vidros acesos (luz quente que vem de baixo) e o reflexo deles na água
    if (glow > 0) {
      HOUSE.glass.forEach(([x, y, w, h]) => {
        const gr = g.createLinearGradient(0, y, 0, y + h);
        gr.addColorStop(0, 'rgba(244, 183, 107, ' + 0.14 * glow + ')');
        gr.addColorStop(1, 'rgba(244, 183, 107, ' + 0.62 * glow + ')');
        g.fillStyle = gr;
        g.fillRect(x, y, w, h);
        const rf = g.createLinearGradient(0, 670, 0, 700);
        rf.addColorStop(0, 'rgba(244, 183, 107, ' + 0.22 * glow + ')');
        rf.addColorStop(1, 'rgba(244, 183, 107, 0)');
        g.fillStyle = rf;
        g.fillRect(Math.max(300, x), 670, Math.min(w, 1300 - x), 30);
      });
    }

    // porta de madeira; no fim do dia ela gira e mostra a luz de dentro
    const open = night ? 0 : ramp(0.8, 1, fp) * 1.35;
    if (glow > 0) {
      g.fillStyle = 'rgba(255, 210, 145, ' + (night ? 0.75 : glow) + ')';
      g.fillRect(758, 486, 84, SHEET.ground - 486);
      g.fillStyle = 'rgba(92, 60, 38, ' + glow + ')';
      g.fillRect(758, 486, 84 * Math.cos(open), SHEET.ground - 486);
    }

    // traços (de dia, desenhados aos poucos, como uma plotter); o traço fica fino mesmo com zoom
    const drawn = night ? HOUSE.total : HOUSE.total * ramp(0, 0.55, fp);
    g.lineWidth = (1.1 * view.dpr) / s;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.strokeStyle = PAPER;
    g.globalAlpha = night ? 0.5 : 0.92 - 0.4 * glow;
    g.beginPath();
    let tip = null;
    for (const p of HOUSE.paths) {
      if (p.start >= drawn) break;
      let left = drawn - p.start;
      g.moveTo(p.pts[0][0], p.pts[0][1]);
      for (let i = 1; i < p.pts.length; i++) {
        const [x0, y0] = p.pts[i - 1];
        const [x1, y1] = p.pts[i];
        const d = Math.hypot(x1 - x0, y1 - y0);
        if (left >= d) {
          g.lineTo(x1, y1);
          left -= d;
        } else {
          tip = [x0 + ((x1 - x0) * left) / d, y0 + ((y1 - y0) * left) / d];
          g.lineTo(tip[0], tip[1]);
          break;
        }
      }
    }
    g.stroke();
    if (tip) {
      g.globalAlpha = 1;
      g.fillStyle = BRONZE;
      g.beginPath();
      g.arc(tip[0], tip[1], (3.2 * view.dpr) / s, 0, Math.PI * 2);
      g.fill();
    }

    // cotas e carimbo
    const labels = night ? 0.45 : ramp(0.4, 0.55, fp) * (0.85 - 0.4 * glow);
    if (labels > 0) {
      g.globalAlpha = labels;
      g.fillStyle = PAPER;
      g.textAlign = 'center';
      g.font = '400 15px "DM Mono", ui-monospace, monospace';
      g.fillText("84'-0\"", 800, 256);
      g.save();
      g.translate(1374, 476);
      g.rotate(-Math.PI / 2);
      g.fillText("26'-4\"", 0, 0);
      g.restore();
      g.textAlign = 'left';
      g.font = '400 17px "DM Mono", ui-monospace, monospace';
      g.fillText('NUVO WOODWORK', 1204, 790);
      g.font = '400 11px "DM Mono", ui-monospace, monospace';
      g.fillText('RESIDENCE · SOUTH ELEVATION', 1204, 824);
      g.fillText('SCALE 1/8" = 1\'-0"', 1204, 842);
      g.font = '400 22px "DM Mono", ui-monospace, monospace';
      g.fillText('A-201', 1424, 836);
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    return true;
  };

  /* ------------------------------------------------------------ cenas e linha do tempo */
  const scenes = C.scenes.map((raw, index) => {
    const last = index === C.scenes.length - 1;
    const s = Object.assign({}, raw, {
      index,
      length: raw.length || 140,
      lead: raw.lead ?? (index === 0 ? 0 : 0.04),
      hold: raw.hold ?? (last ? 0.3 : 0.26),
      blend: last ? 0 : raw.blend ?? 0.14,
    });
    s.beats = (raw.beats || []).map((b, j) => Object.assign({ at: j === 0 ? [0.04, 0.42] : [0.52, 0.86] }, b));
    s.seq = FRAMES[s.id] ? new Sequence(s, FRAMES[s.id]) : null;
    s.ph = null; // criado quando a cena chega perto da tela
    return s;
  });

  let total = 0;
  scenes.forEach((s) => {
    s.start = total;
    total += s.length;
  });
  film.style.setProperty('--film-len', total);

  function placeholder(s) {
    if (!s.ph) {
      const opt = s.placeholder || {};
      s.ph = opt.photo ? new Blueprint(opt) : new House(opt);
    }
    return s.ph;
  }

  // Posição do vídeo (0 a 1) num ponto da cena: um respiro no início e o ambiente
  // pronto parado no fim, enquanto o texto é lido e a próxima cena entra.
  function framePos(s, p) {
    if (reduce.matches) return s.index === 0 ? 0.6 : 1;
    return clamp((p - s.lead) / (1 - s.lead - s.hold));
  }

  function paint(g, s, p) {
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = INK;
    g.fillRect(0, 0, view.w, view.h);
    const fp = framePos(s, p);
    // Com vídeo, fica no escuro só até chegar o primeiro quadro (o placeholder entra se o vídeo falhar)
    if (s.seq && !s.seq.broken) {
      s.seq.draw(g, fp);
      return;
    }
    placeholder(s).draw(g, fp);
  }

  /* ------------------------------------------------------------ textos e régua */
  function splitWords(el) {
    let n = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((c) => {
        if (c.nodeType === 1) return walk(c);
        if (c.nodeType !== 3) return;
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(' '));
          const w = document.createElement('span');
          const inner = document.createElement('span');
          w.className = 'w';
          inner.textContent = part;
          inner.style.setProperty('--wi', n++);
          w.appendChild(inner);
          frag.appendChild(w);
        });
        node.replaceChild(frag, c);
      });
    };
    walk(el);
  }

  function beatHTML(b) {
    let i = 0;
    const tag = b.hero ? 'h1' : 'h2';
    let h = '';
    if (b.eyebrow) h += '<p class="beat__eyebrow" style="--i:' + i++ + '">' + esc(b.eyebrow) + '</p>';
    h += '<' + tag + ' class="beat__title">' + rich(b.title) + '</' + tag + '>';
    i++;
    if (b.text) h += '<p class="beat__text" style="--i:' + i++ + '">' + esc(b.text) + '</p>';
    if (b.list) h += '<ul class="beat__list" style="--i:' + i++ + '">' + b.list.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>';
    if (b.link) {
      h += '<a class="beat__link" style="--i:' + i++ + '" href="#contact" data-room="' + esc(b.link.room || '') + '">' +
        esc(b.link.label) + '<svg aria-hidden="true"><use href="#i-arrow"/></svg></a>';
    }
    if (b.actions && C.contact) {
      h += '<div class="beat__actions" style="--i:' + i++ + '">' +
        '<a class="btn btn--solid" href="#contact">Book a free consultation</a>' +
        '<a class="btn btn--line" href="tel:' + esc(C.contact.tel) + '">Call ' + esc(C.contact.phone) + '</a></div>';
    }
    if (b.cue) h += '<p class="beat__cue" style="--i:' + i++ + '"><span aria-hidden="true"></span>' + esc(b.cue) + '</p>';
    return h;
  }

  scenes.forEach((s) => {
    s.beats.forEach((b) => {
      const el = document.createElement('article');
      el.className = 'beat beat--' + (b.align || 'left') + (b.hero ? ' beat--hero' : '');
      el.innerHTML = beatHTML(b);
      splitWords(el.querySelector('.beat__title'));
      beatsRoot.appendChild(el);
      b.el = el;
    });
  });

  ruler.innerHTML =
    '<ol class="ruler__list">' +
    scenes
      .map(
        (s) =>
          '<li class="ruler__seg" style="--len:' + s.length + '">' +
          '<button class="ruler__btn" type="button" data-go="' + s.index + '">' +
          '<span class="ruler__num">' + pad(s.index) + '</span><span class="ruler__name">' + esc(s.label) + '</span></button>' +
          '<span class="ruler__buffer" aria-hidden="true"></span></li>'
      )
      .join('') +
    '</ol><span class="ruler__fill" aria-hidden="true"></span><span class="ruler__cursor" aria-hidden="true"></span>';
  const segs = Array.from(ruler.querySelectorAll('.ruler__seg'));
  const btns = Array.from(ruler.querySelectorAll('.ruler__btn'));
  film.querySelectorAll('[data-film-total]').forEach((el) => (el.textContent = pad(scenes.length - 1)));

  // Faixa clara na régua: quanto do vídeo de cada cena já foi baixado
  function buffer(s) {
    const v = s.seq && !s.seq.broken ? s.seq.progress() : 1;
    segs[s.index].style.setProperty('--buf', v.toFixed(3));
  }

  const now = { index: -1, phase: -1, beat: null };

  function setBeat(b) {
    if (b === now.beat) return;
    if (now.beat) now.beat.el.classList.remove('is-on');
    now.beat = b;
    if (b) b.el.classList.add('is-on');
    stage.dataset.align = b ? b.align || 'left' : 'none';
  }

  function ui(i, s, p) {
    if (i !== now.index) {
      now.index = i;
      numEl.textContent = pad(i);
      roomEl.textContent = s.label;
      hud.classList.toggle('has-phases', !!s.phases);
      btns.forEach((b, j) => (j === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
      const next = scenes[i + 1];
      if (next && !next.seq) placeholder(next); // já começa a baixar a foto da próxima
      pump();
    }
    const fp = framePos(s, p);
    const ph = !s.phases ? -1 : fp < 0.34 ? 0 : fp < 0.97 ? 1 : 2;
    if (ph !== now.phase) {
      now.phase = ph;
      hud.dataset.phase = ph;
    }
    setBeat(s.beats.find((b) => p >= b.at[0] && p <= b.at[1]) || null);
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
      ctx.globalAlpha = easeInOut((p - (1 - s.blend)) / s.blend);
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

  function goTo(i) {
    const s = scenes[i];
    if (!s) return;
    const p = s.beats.length ? s.beats[0].at[0] + 0.01 : 0.02;
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
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(requestDraw);

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
