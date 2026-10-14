/* =============================================================================
   O filme da casa: os vídeos ficam presos na tela e andam conforme o scroll
   (rolar para baixo avança, para cima volta), com os títulos de cada ambiente
   subindo e sumindo por cima.

   Os trechos do content.js são vídeos encadeados (o último quadro de um é o
   primeiro do próximo), então tocam um atrás do outro como um voo só. Os
   arquivos são preparados pelo tools/make-videos.sh (assets/video/) e listados
   em assets/video/manifest.js. Normalmente não é preciso mexer neste arquivo.

   Para o vídeo deslizar:
   • cada vídeo é baixado inteiro antes de entrar (buscar um quadro nunca espera a rede);
   • o scroll vale mais nas partes com movimento e menos nas paradas (manifest.js);
   • o filme segue o scroll com um pouco de inércia e só pede um quadro novo
     quando o anterior já está na tela.
   ========================================================================== */
(function () {
  'use strict';

  const C = window.NUVO;
  const film = document.querySelector('[data-film]');
  if (!C || !Array.isArray(C.scenes) || !C.scenes.length || !film) return;

  const VIDEOS = window.NUVO_VIDEOS || {};
  const stage = film.querySelector('.film__stage');
  const media = film.querySelector('[data-film-media]');
  const beatsRoot = film.querySelector('[data-film-beats]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pace = Math.max(4, (C.tour && C.tour.pace) || 24); // % da tela de scroll por segundo de vídeo
  const FADE = 14; // % da tela de scroll para um título entrar ou sair
  const BLEND = 0.4; // segundos de fusão na emenda entre um vídeo e o próximo

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
    const video = VIDEOS[raw.id] && VIDEOS[raw.id].src ? VIDEOS[raw.id] : null;
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
      goal: 0, // quadro que o scroll pede
      at: -1, // quadro já pedido ao vídeo
      o: -1,
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

  /* ------------------------------------------------------------ camadas (fotos e vídeo) */
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

  // Põe o trecho no quadro f: o vídeo, se já estiver pronto, ou a passagem da 1ª para a 2ª foto
  function place(s, f) {
    s.goal = Math.round(clamp(f, 0, s.frames - 1));
    if (!s.live || stillMode()) {
      const mix = ramp(0.45, 0.85, f / (s.frames - 1));
      if (mix !== s.mix) {
        s.mix = mix;
        s.layer.style.setProperty('--mix', mix.toFixed(3));
      }
    }
  }

  /* ------------------------------------------------------------ vídeos */
  const stillMode = () => reduce.matches; // com "reduzir movimento", só as fotos
  const portrait = () => window.innerWidth < window.innerHeight * 0.9;
  const fileFor = (s) => (portrait() && s.video.tall) || s.video.src;
  let loading = false;

  // Baixa um vídeo por vez, inteiro: primeiro o do ponto em que a pessoa está, depois os seguintes
  function pump() {
    if (loading || stillMode()) return;
    const from = Math.max(0, now.index);
    const order = scenes.slice(from).concat(scenes.slice(0, from).reverse());
    const s = order.find((x) => x.video && x.file !== fileFor(x));
    if (!s) return;
    const file = fileFor(s);
    loading = true;
    loadStills(s);
    const done = (url) => {
      attach(s, file, url);
      loading = false;
      pump();
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
    if (!s.url || s.goal === s.at || s.unlocking || s.o <= 0) return;
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
    scenes.forEach((x) => {
      if (x !== s && x !== next) setOpacity(x, 0);
    });
    setOpacity(s, 1);
    place(s, frameAt(s, q));
    if (next) {
      // O próximo trecho espera no primeiro quadro, por cima, e aparece na emenda
      setOpacity(next, s.blendQ > 0 ? ramp(1 - s.blendQ, 1, q) : 0);
      place(next, 0);
    }
  }

  function readScroll() {
    target = clamp((window.scrollY - metrics.top) / metrics.dist);
    // Salto grande de uma vez (página recarregada no meio, tecla End): vai direto, sem passar pelo filme todo
    if (Math.abs(target - cur) * total > 150) {
      cur = target;
      dirty = true;
    }
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  // O filme segue o scroll com um pouco de inércia: desliza em vez de pular de um quadro a outro
  function tick(t) {
    raf = 0;
    const dt = last ? Math.min(64, t - last) : 16;
    const prev = cur;
    last = t;
    if (reduce.matches) {
      cur = target;
    } else {
      cur += (target - cur) * (1 - Math.exp(-dt / 120));
      if (Math.abs(target - cur) * total < 0.02) cur = target;
    }
    if (cur !== prev || dirty) {
      dirty = false;
      draw();
    }
    scenes.forEach(seek);
    if (cur !== target) kick();
    else last = 0;
  }

  let wasPortrait = portrait();
  function measure(first) {
    metrics.top = film.getBoundingClientRect().top + window.scrollY;
    metrics.dist = Math.max(1, film.offsetHeight - stage.offsetHeight);
    readScroll();
    if (first === true) cur = target;
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
    window.scrollTo({ top: Math.round(y), behavior: reduce.matches ? 'auto' : 'smooth' });
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
  // No iPhone em modo economia, o vídeo só aparece depois de um toque: o primeiro toque destrava
  window.addEventListener('touchstart', () => {
    scenes.forEach((s) => {
      if (s.url && !s.live && !s.unlocking) unlock(s);
    });
  }, { once: true, passive: true });

  film.classList.toggle('is-still', reduce.matches);
  film.classList.add('is-ready'); // a seção ganha a altura do filme antes da primeira medida
  measure(true);
  loadStills(scenes[0]);
  pump();

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
  };
})();
