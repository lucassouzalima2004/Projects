/* =============================================================================
   O filme da casa: os vídeos ficam presos na tela e andam conforme o scroll
   (rolar para baixo avança, para cima volta), com os títulos de cada ambiente
   subindo e sumindo por cima.

   Os trechos do content.js são vídeos encadeados (o último quadro de um é o
   primeiro do próximo), então tocam um atrás do outro como um voo só. Os
   arquivos são preparados pelo tools/make-videos.sh (assets/video/) e listados
   em assets/video/manifest.js. Normalmente não é preciso mexer neste arquivo.

   Para o vídeo deslizar:
   • o filme é desenhado num canvas com quadros que o próprio navegador
     decodifica um pouco adiante do scroll (film-decoder.js), e dois quadros
     vizinhos se fundem: o movimento é contínuo mesmo rolando devagar;
   • o scroll vale mais nas partes com movimento e menos nas paradas;
   • o filme segue o scroll com um pouco de inércia;
   • cada vídeo começa a ser usado enquanto ainda está baixando.
   Em navegador sem esse decodificador, o filme usa o <video> normal.
   ========================================================================== */
(function () {
  'use strict';

  const C = window.NUVO;
  const film = document.querySelector('[data-film]');
  if (!C || !Array.isArray(C.scenes) || !C.scenes.length || !film) return;
  if (window.NUVO_3D_ON) return; // o filme em 3D (film3d.js) está no lugar deste

  const VIDEOS = window.NUVO_VIDEOS || {};
  const D = window.NUVO_DECODER; // film-decoder.js (só existe se o navegador tiver WebCodecs)
  const stage = film.querySelector('.film__stage');
  const media = film.querySelector('[data-film-media]');
  const beatsRoot = film.querySelector('[data-film-beats]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pace = Math.max(4, (C.tour && C.tour.pace) || 24); // % da tela de scroll por segundo de vídeo
  const FADE = 14; // % da tela de scroll para um título entrar ou sair
  const BLEND = 0.4; // segundos de fusão na emenda entre um vídeo e o próximo
  const KEEP_NOW = 22; // quadros decodificados guardados do trecho na tela
  const KEEP_NEAR = 4; // e dos vizinhos (para a emenda)

  /* ------------------------------------------------------------ helpers */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ramp = (a, b, v) => {
    const t = clamp((v - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const rich = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');

  /* ------------------------------------------------------------ ritmo de cada vídeo */
  // Quanto scroll cada quadro ganha: o quanto a imagem muda (média de 9 quadros), com um
  // mínimo para as partes paradas não sumirem e um máximo para um corte não segurar o scroll.
  function weights(motion) {
    const n = motion.length;
    const w = new Float32Array(n);
    for (let f = 1; f < n; f++) {
      let sum = 0;
      let k = 0;
      for (let j = Math.max(1, f - 4); j <= Math.min(n - 1, f + 4); j++) {
        sum += +motion[j] || 0;
        k++;
      }
      w[f] = clamp(sum / k, 2.5, 18);
    }
    return w;
  }

  const scenes = C.scenes.map((raw, index) => {
    const v = VIDEOS[raw.id];
    const video = v && v.wide && v.wide.src ? v : null;
    const fps = (video && video.fps) || 24;
    const frames = Math.max(2, (video && video.frames) || 240);
    const motion = video && Array.isArray(video.motion) && video.motion.length === frames ? video.motion : null;
    return Object.assign({}, raw, {
      index,
      video,
      fps,
      frames,
      duration: frames / fps,
      lead: Math.max(0, +raw.lead || 0),
      hold: Math.max(0, raw.hold == null ? 1 : +raw.hold || 0),
      blend: index < C.scenes.length - 1 ? BLEND : 0,
      w: motion ? weights(motion) : null,
      track: null, // quadros decodificados (modo canvas)
      goal: 0, // quadro que o scroll pede (modo <video>)
      at: -1, // quadro já pedido ao <video>
      o: -1,
      tries: 0,
    });
  });

  // Mesma quantidade de mudança na imagem por scroll em todos os vídeos
  let wsum = 0;
  let wn = 0;
  scenes.forEach((s) => {
    if (s.w) for (let f = 1; f < s.frames; f++, wn++) wsum += s.w[f];
  });
  const wmean = wn ? wsum / wn : 1;

  let total = 0;
  scenes.forEach((s) => {
    const n = s.frames;
    const cum = new Float32Array(n);
    let mean = wmean;
    if (s.w) {
      let acc = 0;
      for (let f = 1; f < n; f++) cum[f] = acc += s.w[f];
      mean = acc / (n - 1);
      for (let f = 1; f < n; f++) cum[f] /= acc;
    } else {
      for (let f = 1; f < n; f++) cum[f] = f / (n - 1);
    }
    s.cum = cum;
    const leadVh = s.lead * pace;
    const videoVh = pace * s.duration * (mean / wmean);
    s.len = leadVh + videoVh + s.hold * pace;
    s.qa = leadVh / s.len; // fim do lead
    s.qb = (leadVh + videoVh) / s.len; // fim do vídeo (começo do hold)
    s.blendQ = (s.blend * pace) / s.len;
    s.start = total;
    total += s.len;
  });
  film.style.setProperty('--film-len', total.toFixed(2));

  // Quadro do vídeo (com fração) num ponto q do trecho, de 0 a 1
  function frameAt(s, q) {
    if (q <= s.qa) return 0;
    if (q >= s.qb) return s.frames - 1;
    const u = (q - s.qa) / (s.qb - s.qa);
    const c = s.cum;
    let lo = 0;
    let hi = c.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (c[mid] <= u) lo = mid;
      else hi = mid;
    }
    const span = c[hi] - c[lo];
    return lo + (span > 0 ? (u - c[lo]) / span : 0);
  }

  // Ponto q do trecho em que o vídeo chega a t segundos (negativo = no lead; além do fim = no hold)
  function qAt(s, t) {
    if (t <= 0) return s.lead > 0 ? s.qa * clamp((t + s.lead) / s.lead) : 0;
    if (t >= s.duration) return s.hold > 0 ? s.qb + (1 - s.qb) * clamp((t - s.duration) / s.hold) : 1;
    const f = Math.min(t * s.fps, s.frames - 1);
    const i = Math.min(s.frames - 2, Math.floor(f));
    const u = s.cum[i] + (s.cum[i + 1] - s.cum[i]) * (f - i);
    return s.qa + clamp(u) * (s.qb - s.qa);
  }

  /* ------------------------------------------------------------ camadas (fotos e <video>) */
  // No modo canvas as camadas ficam escondidas e as fotos delas são desenhadas no canvas
  scenes.forEach((s) => {
    const layer = document.createElement('div');
    layer.className = 'film__scene';
    const pos = s.focus ? s.focus[0] * 100 + '% ' + s.focus[1] * 100 + '%' : '';
    s.stills = (s.stills || []).slice(0, 2).map((src) => {
      const img = document.createElement('img');
      img.className = 'film__still';
      img.alt = '';
      img.decoding = 'async';
      img.dataset.src = 'assets/img/' + src;
      if (pos) img.style.objectPosition = pos;
      img.addEventListener('load', repaintSoon);
      layer.appendChild(img);
      return img;
    });
    if (s.video) {
      const v = document.createElement('video');
      v.className = 'film__video';
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('disableremoteplayback', '');
      v.disablePictureInPicture = true;
      v.preload = 'auto';
      if (pos) v.style.objectPosition = pos;
      v.addEventListener('loadedmetadata', kick);
      v.addEventListener('seeked', () => {
        if (!s.live && !s.unlocking) showVideo(s);
        seek(s); // o próximo quadro já é pedido aqui, sem esperar a tela pintar de novo
      });
      // O vídeo só anda com o scroll: se o navegador começar a tocar sozinho, para
      v.addEventListener('play', () => {
        if (!s.unlocking) v.pause();
      });
      layer.appendChild(v);
      s.el = v;
    }
    media.appendChild(layer);
    s.layer = layer;
  });

  // As fotos de um trecho só são baixadas quando ele chega perto
  function loadStills(s) {
    if (!s || s.stillsOn) return;
    s.stillsOn = true;
    s.stills.forEach((img) => (img.src = img.dataset.src));
  }

  function setOpacity(s, a) {
    if (s.o === a) return;
    s.o = a;
    s.layer.style.opacity = a;
    s.layer.style.visibility = a > 0 ? 'visible' : 'hidden';
  }

  // Modo <video>: põe o trecho no quadro f (o vídeo, se pronto, ou a passagem da 1ª para a 2ª foto)
  function place(s, f) {
    s.goal = Math.round(clamp(f, 0, s.frames - 1));
    if (!s.live || stillMode()) {
      const mix = stillMix(s, f);
      if (mix !== s.mix) {
        s.mix = mix;
        s.layer.style.setProperty('--mix', mix.toFixed(3));
      }
    }
  }

  // Sem vídeo, a 2ª foto (o ambiente pronto) aparece na segunda metade do trecho
  const stillMix = (s, f) => ramp(0.45, 0.85, f / (s.frames - 1));

  /* ------------------------------------------------------------ modo: canvas ou <video> */
  let mode = 'video';
  let modeKnown = false;
  let canvas = null;
  let ctx = null;
  let view = null; // o que está na tela no modo canvas: { i, s, x, next, mix }
  let repaint = false;
  let snap = 0; // 0 → 1 depois que o scroll para: a fusão termina num quadro inteiro
  let restAt = 0;
  let heading = 1; // sentido do scroll
  const stats = { paints: 0, exact: 0, near: 0, stills: 0, gap: 0, moving: 0, movingMs: 0, long: 0 };
  // ?debug no endereço mostra o painel de diagnóstico; ?film=video ou ?film=canvas força um modo
  const params = new URLSearchParams(window.location.search);
  const DEBUG = params.has('debug');
  const FORCE = params.get('film');
  let why = 'decidindo';
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  // Aparelho que não dá conta do canvas: o tempo entre uma pintura de tela e outra, durante o
  // scroll, comparado com o ritmo normal da tela dele (base). Muito acima disso, volta para o <video>.
  const perf = { base: 0, n: 0, slow: 0 };
  const MEMO = 'nuvo-film-mode';
  const remember = (v) => {
    try {
      sessionStorage.setItem(MEMO, v);
    } catch (e) {
      /* sem sessionStorage */
    }
  };
  const remembered = () => {
    try {
      return sessionStorage.getItem(MEMO);
    } catch (e) {
      return null;
    }
  };

  const stillMode = () => reduce.matches; // com "reduzir movimento", só as fotos
  const portrait = () => window.innerWidth < window.innerHeight * 0.9;
  const infoFor = (s) => (portrait() && s.video.tall) || s.video.wide;
  const fileFor = (s) => infoFor(s).src;

  function repaintSoon() {
    repaint = true;
    kick();
  }

  // Usa o canvas se o navegador decodifica o vídeo do primeiro trecho (e não foi lento nesta visita)
  function chooseMode() {
    const first = scenes.find((s) => s.video);
    let check = Promise.resolve(false);
    if (FORCE === 'video') why = 'forçado por ?film=video';
    else if (!D) why = 'navegador sem WebCodecs';
    else if (!first) why = 'sem vídeo no manifest';
    else if (remembered() === 'video' && FORCE !== 'canvas') why = 'aparelho lento nesta visita';
    else check = D.supported(infoFor(first)).then((ok) => ok || ((why = 'navegador não decodifica este vídeo'), false));
    return check
      .then((ok) => ok && useCanvas(), () => {})
      .then(() => {
        modeKnown = true;
        pump();
      });
  }

  function useCanvas() {
    const c = document.createElement('canvas');
    const g = c.getContext('2d', { alpha: false });
    if (!g) return;
    canvas = c;
    ctx = g;
    canvas.className = 'film__canvas';
    media.appendChild(canvas);
    mode = 'canvas';
    why = '';
    film.classList.add('is-canvas');
    fitCanvas();
    dirty = true;
    kick();
  }

  // O decodificador falhou de vez (ou o aparelho ficou lento): volta para o <video>
  function useVideo(reason) {
    if (mode !== 'canvas') return;
    why = typeof reason === 'string' ? reason : 'o decodificador falhou';
    if (FORCE !== 'canvas') remember('video');
    mode = 'video';
    film.classList.remove('is-canvas');
    canvas.remove();
    canvas = ctx = null;
    scenes.forEach((s) => {
      if (!s.track) return;
      s.track.sleep();
      s.track = null;
      s.file = null;
    });
    loading = false;
    dirty = true;
    kick();
    pump();
  }

  // O canvas na resolução da tela (até 3x), para o vídeo ampliado não perder nitidez
  function fitCanvas() {
    if (!canvas) return;
    let r = Math.min(window.devicePixelRatio || 1, 3);
    const cw = canvas.clientWidth || stage.clientWidth;
    const ch = canvas.clientHeight || stage.clientHeight;
    if (cw * ch * r * r > 8.3e6) r = Math.sqrt(8.3e6 / (cw * ch)); // telas enormes: até ~4K
    const w = Math.max(1, Math.round(cw * r));
    const h = Math.max(1, Math.round(ch * r));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      repaint = true;
    }
  }

  // Desenha uma imagem cobrindo o canvas (como object-fit: cover), no ponto de foco do trecho
  function cover(img, s) {
    const iw = img.naturalWidth || img.displayWidth || img.width;
    const ih = img.naturalHeight || img.displayHeight || img.height;
    if (!iw || !ih) return;
    const W = canvas.width;
    const H = canvas.height;
    const k = Math.max(W / iw, H / ih);
    const dw = iw * k;
    const dh = ih * k;
    const fx = s.focus ? s.focus[0] : 0.5;
    const fy = s.focus ? s.focus[1] : 0.5;
    ctx.drawImage(img, (W - dw) * fx, (H - dh) * fy, dw, dh);
  }

  const ready = (img) => img && img.complete && img.naturalWidth > 0;

  // Um trecho no quadro x (com fração) e opacidade a. Devolve false se não tinha nada para desenhar.
  function paintScene(s, x, a) {
    const t = s.track;
    if (t) {
      // Os quadros prontos de antes e de depois de x, fundidos na proporção certa. Com todos os
      // quadros prontos são os dois vizinhos; se faltar algum no meio, a imagem passa de um para o
      // outro aos poucos em vez de travar e pular.
      const r = t.around(x);
      let A = r.a;
      let B = r.ia === r.ib ? null : r.b;
      let f = 0;
      if (A && B) {
        const gap = r.ib - r.ia;
        if (gap > 8) {
          if (x - r.ia > r.ib - x) A = B; // longe demais para fundir: o mais perto
          B = null;
        } else {
          f = (x - r.ia) / gap;
        }
      } else if (!A) {
        A = B;
        B = null;
      }
      if (A) {
        ctx.globalAlpha = a;
        cover(A, s);
        if (B && f > 0.004) {
          ctx.globalAlpha = a * f;
          cover(B, s);
        }
        const d = Math.min(r.a ? x - r.ia : Infinity, r.b ? r.ib - x : Infinity);
        if (d < 1) stats.exact++;
        else stats.near++;
        stats.gap += Math.min(d, 30);
        return true;
      }
    }
    // Sem quadro: as fotos do trecho
    const [p, q] = s.stills;
    const mix = stillMix(s, x);
    let drew = false;
    if (ready(p) && mix < 1) {
      ctx.globalAlpha = a;
      cover(p, s);
      drew = true;
    }
    if (ready(q) && mix > 0) {
      ctx.globalAlpha = drew ? a * mix : a;
      cover(q, s);
      drew = true;
    }
    if (drew) stats.stills++;
    return drew;
  }

  function paint() {
    repaint = false;
    if (!ctx || !view) return;
    const { s, next, mix } = view;
    let x = view.x;
    if (snap > 0) {
      const i = Math.floor(x);
      const f = x - i;
      x = i + f + (Math.round(f) - f) * ramp(0, 1, snap);
    }
    stats.paints++;
    if (!paintScene(s, x, 1)) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#14110F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (next && mix > 0.001) paintScene(next, 0, mix);
    ctx.globalAlpha = 1;
  }

  // Diz a cada vídeo o que decodificar: o trecho na tela onde o scroll está, o próximo o
  // começo (para a emenda) e o anterior o fim (se a pessoa voltar). Os outros liberam a memória.
  function drive() {
    if (!view) return;
    const { i, x, s } = view;
    const q = (x / (s.frames - 1)) || 0;
    scenes.forEach((o, k) => {
      const t = o.track;
      if (!t) return;
      if (k === i) t.want(x, heading, KEEP_NOW);
      else if (k === i + 1 && q > 0.5) t.want(0, 1, KEEP_NEAR);
      else if (k === i - 1 && q < 0.25) t.want(o.frames - 1, -1, KEEP_NEAR);
      else t.sleep();
    });
  }

  // Chegou um quadro decodificado: redesenha se for de um trecho na tela
  function onFrame(t) {
    if (!view) return;
    if (t === view.s.track || (view.next && t === view.next.track)) repaintSoon();
  }

  /* ------------------------------------------------------------ download */
  let loading = false;

  // Baixa um vídeo por vez: primeiro o do ponto em que a pessoa está, depois os seguintes
  function pump() {
    if (loading || stillMode() || !modeKnown) return;
    const from = Math.max(0, now.index);
    const order = scenes.slice(from).concat(scenes.slice(0, from).reverse());
    const s = order.find((x) => x.video && x.file !== fileFor(x) && x.tries < 2);
    if (!s) return;
    const info = infoFor(s);
    const file = info.src;
    loading = true;
    loadStills(s);
    s.file = file;
    s.tries++;
    const next = () => {
      loading = false;
      pump();
    };
    const failed = () => {
      s.file = null; // tenta de novo uma vez, daqui a pouco
      loading = false;
      setTimeout(pump, 2500);
    };

    if (mode === 'canvas' && info.sizes) {
      // Canvas: os bytes vão entrando no decodificador enquanto o arquivo baixa
      if (s.track) s.track.sleep();
      const track = new D.Track(info, { onFrame, onFail: useVideo });
      s.track = track;
      dirty = true;
      kick();
      stream(file, (chunk) => {
        if (s.track !== track) return;
        track.push(chunk);
        kick();
      }).then(() => {
        if (s.track === track && track.done()) s.tries = 0;
        next();
      }, failed);
      return;
    }

    // <video>: o arquivo inteiro primeiro (o Cloudflare não entrega pedaços e o iPhone precisa disso)
    const done = (url) => {
      attach(s, file, url);
      s.tries = 0;
      next();
    };
    if (!window.fetch || !window.URL || !URL.createObjectURL) {
      done(file);
      return;
    }
    fetch(file)
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.blob();
      })
      .then((blob) => done(URL.createObjectURL(blob)), () => done(file)); // se falhar, o navegador tenta sozinho
  }

  function stream(file, onChunk) {
    return fetch(file).then((r) => {
      if (!r.ok) throw new Error(r.status);
      if (!r.body || !r.body.getReader) return r.arrayBuffer().then((b) => onChunk(new Uint8Array(b)));
      const reader = r.body.getReader();
      const read = () =>
        reader.read().then((x) => {
          if (x.done) return;
          onChunk(x.value);
          return read();
        });
      return read();
    });
  }

  /* ------------------------------------------------------------ modo <video> */
  function attach(s, file, url) {
    if (s.url && s.url.indexOf('blob:') === 0) URL.revokeObjectURL(s.url);
    s.file = file;
    s.url = url;
    s.at = -1;
    s.live = false;
    s.layer.classList.remove('is-live', 'is-painted');
    s.el.src = url;
    unlock(s);
  }

  // No iPhone o vídeo só mostra imagem depois de um play(): toca e para na mesma hora, sem som
  // e ainda escondido. Depois disso ele é levado ao quadro certo e aparece.
  function unlock(s) {
    const v = s.el;
    s.unlocking = true;
    let timer = 0;
    const stop = () => {
      clearTimeout(timer);
      if (!s.unlocking) return;
      v.pause();
      s.unlocking = false;
      s.at = -1;
      kick();
    };
    timer = setTimeout(stop, 1500); // se o navegador não responder ao play(), segue sem ele
    let p = null;
    try {
      p = v.play();
    } catch (e) {
      p = null;
    }
    if (p && p.then) p.then(stop, stop);
    else stop();
  }

  // O vídeo aparece por cima das fotos assim que o primeiro quadro dele está na tela. Quando o
  // navegador confirma que o quadro foi pintado, as fotos de baixo deixam de ser desenhadas.
  function showVideo(s) {
    const go = () => {
      if (s.live) return;
      s.live = true;
      s.layer.classList.add('is-live');
    };
    if (s.el.requestVideoFrameCallback) {
      s.el.requestVideoFrameCallback(() => {
        go();
        s.layer.classList.add('is-painted');
      });
      setTimeout(go, 800);
    } else {
      go();
    }
  }

  // Pede ao vídeo o quadro do scroll. Só um pedido por vez: se o vídeo ainda está buscando,
  // o próximo sai quando ele terminar (evento seeked), já com o quadro mais recente.
  function seek(s) {
    if (mode !== 'video' || !s.url || s.goal === s.at || s.unlocking || s.o <= 0) return;
    const v = s.el;
    if (v.readyState < 1 || v.seeking) return;
    s.at = s.goal;
    v.currentTime = (s.goal + 0.5) / s.fps; // o meio do quadro: o navegador mostra exatamente esse
  }

  /* ------------------------------------------------------------ títulos */
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
    s.beats = (s.beats || []).map((raw) => {
      const b = Object.assign({}, raw);
      const t = Array.isArray(b.time) ? b.time : [];
      b.q0 = t[0] == null ? 0 : qAt(s, +t[0]);
      b.q1 = t[1] == null ? 1 : qAt(s, +t[1]);
      b.fade = Math.max(0.001, Math.min(FADE / s.len, (b.q1 - b.q0) / 4));
      b.el = document.createElement('article');
      b.el.className = 'beat beat--' + (b.align || 'left') + (b.hero ? ' beat--hero' : '');
      b.el.innerHTML = beatHTML(b);
      beatsRoot.appendChild(b.el);
      b.o = -1;
      b.y = 0;
      return b;
    });
  });

  // Cada título entra subindo, fica parado enquanto é lido e sai para cima, tudo preso ao scroll
  function beatState(s, b, q) {
    if (q < b.q0 || q > b.q1) return [0, 0];
    const tin = b.q0 <= 0 && s.index === 0 ? 1 : clamp((q - b.q0) / b.fade);
    const tout = b.q1 >= 1 && s.index === scenes.length - 1 ? 1 : clamp((b.q1 - q) / b.fade);
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

  const now = { index: -1, shown: [], l: -1, c: -1 };

  function ui(i, s, q) {
    if (i !== now.index) {
      now.index = i;
      loadStills(s);
      loadStills(scenes[i + 1]);
      pump();
    }
    let l = 0;
    let c = 0;
    const shown = [];
    s.beats.forEach((b) => {
      const [o, y] = beatState(s, b, q);
      setBeat(b, o, y);
      if (o > 0) shown.push(b);
      if (b.align === 'center') c = Math.max(c, o);
      else l = Math.max(l, o);
    });
    now.shown.forEach((b) => {
      if (!shown.includes(b)) setBeat(b, 0, 0);
    });
    now.shown = shown;
    // A sombra que deixa o título legível acompanha o título
    if (l !== now.l) stage.style.setProperty('--shade-l', (now.l = l).toFixed(3));
    if (c !== now.c) stage.style.setProperty('--shade-c', (now.c = c).toFixed(3));
  }

  /* ------------------------------------------------------------ scroll */
  const metrics = { top: 0, dist: 1 };
  let cur = 0;
  let target = 0;
  let raf = 0;
  let last = 0;
  let dirty = true;

  function draw() {
    const pos = cur * total;
    let i = 0;
    while (i < scenes.length - 1 && pos >= scenes[i].start + scenes[i].len) i++;
    const s = scenes[i];
    const q = clamp((pos - s.start) / s.len);
    ui(i, s, q);
    const next = scenes[i + 1];
    // O próximo trecho espera no primeiro quadro, por cima, e aparece na emenda
    const mix = next && s.blendQ > 0 ? ramp(1 - s.blendQ, 1, q) : 0;
    const x = frameAt(s, q);
    if (mode === 'canvas') {
      view = { i, s, x, next, mix };
      drive();
      repaint = true;
      return;
    }
    scenes.forEach((o) => {
      if (o !== s && o !== next) setOpacity(o, 0);
    });
    setOpacity(s, 1);
    place(s, x);
    if (next) {
      setOpacity(next, mix);
      place(next, 0);
    }
  }

  let seenY = -1;
  let want = false;

  function readScroll() {
    seenY = window.scrollY;
    target = clamp((window.scrollY - metrics.top) / metrics.dist);
    // Salto grande de uma vez (página recarregada no meio, tecla End): vai direto, sem passar pelo filme todo
    if (Math.abs(target - cur) * total > 150) {
      cur = target;
      dirty = true;
    }
  }

  // Pede uma pintura. Com o relógio único da página (scroll.js), o filme desenha no mesmo quadro em
  // que a rolagem suave andou: os dois nunca ficam um quadro fora de passo.
  function kick() {
    if (window.NUVO_FRAME) {
      want = true;
      window.NUVO_FRAME.request();
    } else if (!raf) {
      raf = requestAnimationFrame(tick);
    }
  }

  // O filme acompanha o scroll direto: no computador a rolagem suave já desliza e no celular a do
  // próprio aparelho. Só com mouse e sem a rolagem suave (se ela não carregar) o filme põe inércia.
  function tick(t) {
    raf = 0;
    readScroll(); // a posição desta pintura (com a rolagem suave, ela muda a cada quadro)
    const had = last; // havia uma pintura logo antes (o intervalo é real)
    const dt = last ? Math.min(64, t - last) : 16;
    const prev = cur;
    last = t;
    if (reduce.matches || window.NUVO_SCROLL || !finePointer.matches) {
      cur = target;
    } else {
      cur += (target - cur) * (1 - Math.exp(-dt / 100));
      if (Math.abs(target - cur) * total < 0.02) cur = target;
    }
    const moved = cur !== prev;
    if (moved) heading = cur > prev ? 1 : -1;
    if (moved || dirty) {
      dirty = false;
      draw();
    }
    let more = cur !== target;
    if (moved && had) {
      stats.moving++;
      stats.movingMs += t - had;
      if (perf.base && t - had > perf.base * 1.5) stats.long++;
    }
    if (mode === 'canvas') {
      if (moved && perf.base && had) watch(t - had);
      // Quando o scroll para, a fusão termina no quadro inteiro mais perto (imagem nítida parada)
      if (moved) restAt = 0;
      else if (!restAt) restAt = t;
      const sn = restAt ? clamp((t - restAt) / 160) : 0;
      if (sn !== snap) {
        snap = sn;
        repaint = true;
      }
      if (snap < 1) more = true;
      scenes.forEach((o) => {
        if (!o.track || !o.track.active) return;
        o.track.pump();
        if (o.track.sent.size) more = true; // esperando o decodificador
      });
      if (repaint) paint();
    } else {
      scenes.forEach(seek);
    }
    if (more) kick();
    else last = 0;
  }

  // O ritmo normal da tela (60 ou 120 por segundo, 30 no modo economia do iPhone)
  function probe() {
    const ds = [];
    let t0 = 0;
    const step = (t) => {
      if (t0) ds.push(t - t0);
      t0 = t;
      if (ds.length < 30) requestAnimationFrame(step);
      else perf.base = clamp(ds.sort((a, b) => a - b)[15], 6, 50);
    };
    requestAnimationFrame(step);
  }

  // Só troca quando fica pesado de verdade: mais de 30% das pinturas com 2,5 vezes o intervalo
  // normal (na tela de 60 por segundo, abaixo de 24 quadros por segundo)
  function watch(dt) {
    perf.n++;
    if (dt > perf.base * 2.5) perf.slow++;
    if (perf.n < 90) return;
    if (perf.slow / perf.n > 0.3) useVideo('aparelho lento (menos de 24 quadros/s)');
    perf.n = perf.slow = 0;
  }

  if (window.NUVO_FRAME) {
    window.NUVO_FRAME.add((t) => {
      if (!want && window.scrollY === seenY) return false; // nada mudou
      want = false;
      tick(t);
      return want;
    });
  }

  let wasPortrait = portrait();
  function measure(first) {
    metrics.top = film.getBoundingClientRect().top + window.scrollY;
    metrics.dist = Math.max(1, film.offsetHeight - stage.offsetHeight);
    readScroll();
    if (first === true) cur = target;
    fitCanvas();
    dirty = true;
    kick();
    // Celular girado: troca para o vídeo do formato certo
    if (portrait() !== wasPortrait) {
      wasPortrait = portrait();
      pump();
    }
  }

  // Vai para um trecho: o fim do vídeo, com o ambiente pronto e o título dele na tela
  function goTo(i) {
    const s = scenes[i];
    if (!s) return;
    const q = Math.max(0, s.qb - 0.002);
    const y = metrics.top + ((s.start + s.len * q) / total) * metrics.dist;
    if (window.NUVO_SCROLL_TO) window.NUVO_SCROLL_TO(Math.round(y));
    else window.scrollTo({ top: Math.round(y), behavior: reduce.matches ? 'auto' : 'smooth' });
  }

  window.addEventListener('scroll', () => {
    readScroll();
    kick();
  }, { passive: true });
  window.addEventListener('resize', measure);
  const onReduce = () => {
    film.classList.toggle('is-still', reduce.matches);
    scenes.forEach((s) => (s.mix = -1));
    dirty = true;
    kick();
    pump();
  };
  if (reduce.addEventListener) reduce.addEventListener('change', onReduce);
  else if (reduce.addListener) reduce.addListener(onReduce);
  // No iPhone em modo economia, o <video> só aparece depois de um toque: o primeiro toque destrava
  window.addEventListener('touchstart', () => {
    scenes.forEach((s) => {
      if (s.url && !s.live && !s.unlocking) unlock(s);
    });
  }, { once: true, passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) repaintSoon();
  });

  film.classList.toggle('is-still', reduce.matches);
  film.classList.add('is-ready'); // a seção ganha a altura do filme antes da primeira medida
  measure(true);
  loadStills(scenes[0]);
  chooseMode();
  if (document.readyState === 'complete') setTimeout(probe, 300);
  else window.addEventListener('load', () => setTimeout(probe, 300), { once: true });

  // Painel de diagnóstico (?debug no fim do endereço): o que o filme está fazendo neste aparelho,
  // atualizado a cada segundo. Os números de scroll contam só enquanto a página está andando.
  function debugPanel() {
    const box = document.createElement('pre');
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText =
      'position:fixed;left:8px;bottom:8px;z-index:9999;margin:0;padding:8px 10px;max-width:calc(100vw - 16px);' +
      'font:11px/1.45 ui-monospace,Menlo,Consolas,monospace;color:#d6ffcc;background:rgba(0,0,0,.8);' +
      'border-radius:6px;pointer-events:none;white-space:pre-wrap';
    document.body.appendChild(box);
    let a = Object.assign({}, stats);
    let b = D ? Object.assign({}, D.stats) : null;
    let t0 = performance.now();
    const pct = (x, n) => (n ? Math.round((x / n) * 100) + '%' : '-');
    setInterval(() => {
      const now = performance.now();
      const sec = (now - t0) / 1000;
      const st = stats;
      const dm = st.moving - a.moving;
      const fps = st.movingMs > a.movingMs ? Math.round((dm * 1000) / (st.movingMs - a.movingMs)) : '-';
      const painted = st.exact - a.exact + st.near - a.near + st.stills - a.stills;
      const lines = [
        'NUVO film · ' + (mode === 'canvas' ? 'CANVAS (decodificador)' : 'VIDEO (<video>)') + (why ? ' · ' + why : ''),
        'rolagem suave: ' + (window.NUVO_SCROLL ? 'sim' : 'não') + ' · tela ' + (perf.base ? Math.round(1000 / perf.base) + ' Hz' : '?') +
          ' · dpr ' + (window.devicePixelRatio || 1) + (canvas ? ' · canvas ' + canvas.width + '×' + canvas.height : ''),
        'rolando: ' + fps + ' quadros/s · lentos ' + pct(st.long - a.long, dm) + ' (' + (st.long - a.long) + ')',
        'pinturas: certas ' + pct(st.exact - a.exact, painted) + ' · perto ' + pct(st.near - a.near, painted) +
          ' · fotos ' + pct(st.stills - a.stills, painted) + ' · distância média ' + (painted ? ((st.gap - a.gap) / painted).toFixed(2) : '-'),
      ];
      if (D) {
        const ds = D.stats;
        const n = ds.latN - b.latN;
        lines.push(
          'decodificador: ' + Math.round((ds.out - b.out) / sec) + ' quadros/s · ' + (n ? ((ds.lat - b.lat) / n).toFixed(1) + ' ms' : '-') +
            ' · guarda como ' + D.keepAs() + ' · flush ' + ds.flushes + ' · erros ' + ds.errors
        );
        b = Object.assign({}, ds);
      }
      lines.push('baixado: ' + scenes.map((x) => (x.track ? Math.round((x.track.have / x.track.buf.length) * 100) + '%' : x.live ? 'ok' : '-')).join(' / '));
      lines.push(navigator.userAgent.replace(/^Mozilla\/5\.0 /, '').slice(0, 140));
      box.textContent = lines.join('\n');
      a = Object.assign({}, st);
      t0 = now;
    }, 1000);
  }
  if (DEBUG) debugPanel();

  window.NUVO_FILM = {
    goTo,
    goToScene(id) {
      const s = scenes.find((x) => x.id === id);
      if (s) goTo(s.index);
    },
    // Posição da página em que o trecho chega a t segundos do vídeo (para links e testes)
    scrollFor(id, t) {
      const s = scenes.find((x) => x.id === id);
      return s ? metrics.top + ((s.start + s.len * qAt(s, t)) / total) * metrics.dist : null;
    },
    // Como o filme está sendo desenhado (para testes)
    info() {
      return {
        mode,
        why,
        y: seenY, // a posição de scroll que o filme desenhou por último
        x: view ? +view.x.toFixed(3) : null, // o quadro (com fração) na tela, no modo canvas
        scene: view ? view.i : null,
        base: perf.base,
        stats: Object.assign({}, stats),
        cached: scenes.map((s) => (s.track ? s.track.cache.size : 0)),
        loaded: scenes.map((s) => (s.track ? Math.round((s.track.have / s.track.buf.length) * 100) : s.live ? 100 : 0)),
      };
    },
  };
})();
