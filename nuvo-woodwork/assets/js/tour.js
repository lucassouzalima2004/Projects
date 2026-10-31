/* =============================================================================
   A visita (?tour): a câmera para em cada ambiente e um mini vídeo rápido a
   leva até o próximo. Uma rolada (roda, trackpad, dedo ou setas) toca o vídeo
   inteiro até o cômodo seguinte; rolando para cima, o mesmo vídeo de trás para
   frente. Na última parada a rolagem segue para o resto do site.
   Como no reel que o Lucas mandou, também há etiquetas em cima das passagens:
   clicar numa leva direto àquele ambiente, e o link no canto de cima volta.
   No fim de cada vídeo, a foto do ambiente (bem mais nítida) entra por cima do
   último quadro e aparecem o título e as etiquetas.

   O vídeo toca no tempo dele (não preso ao scroll), por isso é sempre liso.
   Computador e celular têm vídeos separados: deitados (16:9) e em pé (9:16).
   No celular em pé as etiquetas viram botões embaixo do título.
   Textos, etiquetas e vídeos ficam em content.js (visit).
   ========================================================================== */
(function () {
  'use strict';

  const C = window.NUVO;
  const film = document.querySelector('[data-film]');
  if (window.NUVO_FILM_MODE !== 'tour' || !C || !C.visit || !Array.isArray(C.visit.stops) || !film) return;

  const V = C.visit;
  const STOPS = new Map(V.stops.map((s) => [s.id, s]));
  const MOVES = V.moves || [];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const portrait = window.matchMedia('(max-aspect-ratio: 1/1)');
  // Em pé, com as versões em pé de tudo (visit.tall): vídeos e fotos 9:16. Senão, 16:9.
  const tall = () => !!V.tall && portrait.matches;
  const ORDER = (V.order || V.stops.map((s) => s.id)).filter((id) => STOPS.has(id));
  const FADE = 420; // fusão entre o vídeo e a foto (ms)
  const QUIET = 200; // ms sem rolar que separam um gesto do outro
  const NUDGE = 8; // px de rolagem que já contam como "quero o próximo cômodo"
  const SWIPE = 30; // px que o dedo anda para trocar de cômodo
  const OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const PAN = 'cubic-bezier(0.45, 0, 0.25, 1)';

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const rich = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ------------------------------------------------------------ montagem */
  film.classList.add('is-tour');
  const stage = film.querySelector('.film__stage');
  stage.innerHTML =
    '<div class="tour__frame">' +
    '<video class="tour__video" muted playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>' +
    V.stops.map((s, i) => {
      const img = '<img class="tour__still" data-stop="' + esc(s.id) + '" alt="" decoding="async" src="assets/img/' + esc(s.image) + '"' +
        (i ? ' fetchpriority="low"' : ' fetchpriority="high"') + '>';
      return V.tall && s.tall
        ? '<picture><source media="(max-aspect-ratio: 1/1)" srcset="assets/img/' + esc(s.tall) + '">' + img + '</picture>'
        : img;
    }).join('') +
    V.stops.map((s) =>
      '<div class="tour__pins" data-stop="' + esc(s.id) + '" inert>' +
      (s.pins || []).map((p) =>
        '<button class="tour__pin" type="button" data-to="' + esc(p.to) + '" style="--x:' + p.at[0] + ';--y:' + p.at[1] + '">' +
        '<span>' + esc(p.label) + '</span></button>').join('') +
      '</div>').join('') +
    '</div>' +
    '<div class="tour__shade" aria-hidden="true"></div>' +
    '<button class="tour__back" type="button" hidden><svg aria-hidden="true"><use href="#i-arrow"/></svg><span></span></button>' +
    '<div class="tour__copy" aria-live="polite"></div>';

  const frame = stage.querySelector('.tour__frame');
  const video = stage.querySelector('.tour__video');
  const stills = new Map(Array.from(stage.querySelectorAll('.tour__still')).map((el) => [el.dataset.stop, el]));
  const pinSets = new Map(Array.from(stage.querySelectorAll('.tour__pins')).map((el) => [el.dataset.stop, el]));
  const back = stage.querySelector('.tour__back');
  const copy = stage.querySelector('.tour__copy');
  const canPlay = !!video.canPlayType && video.canPlayType('video/mp4; codecs="avc1.64001f"') !== '';

  function copyHTML(s) {
    const tag = s.id === V.start ? 'h1' : 'h2';
    let h = '';
    if (s.eyebrow) h += '<p class="beat__eyebrow" data-line>' + esc(s.eyebrow) + '</p>';
    h += '<' + tag + ' class="beat__title">' +
      String(s.title || '').split('\n').map((l) => '<span class="beat__line" data-line>' + rich(l) + '</span>').join('') +
      '</' + tag + '>';
    if (s.text) h += '<p class="beat__text" data-line>' + esc(s.text) + '</p>';
    if (s.actions && C.contact) {
      h += '<div class="beat__actions" data-line>' +
        '<a class="btn btn--solid" href="#contact">Book a free consultation</a>' +
        '<a class="btn btn--line" href="tel:' + esc(C.contact.tel) + '">Call ' + esc(C.contact.phone) + '</a></div>';
    }
    // no celular em pé, as etiquetas viram botões aqui
    if (s.pins && s.pins.length) {
      h += '<div class="tour__choices" data-line>' +
        s.pins.map((p) => '<button class="tour__choice" type="button" data-to="' + esc(p.to) + '">' + esc(p.label) + '</button>').join('') +
        '</div>';
    }
    if (s.cue) h += '<p class="beat__cue" data-line><span aria-hidden="true"></span>' + esc(s.cue) + '</p>';
    return h;
  }

  /* ------------------------------------------------------------ enquadramento */
  // As fotos, o vídeo e as etiquetas moram juntos num quadro (16:9, ou 9:16 em pé) que cobre a tela,
  // com o ponto de interesse do ambiente o mais perto do meio que der. Entre dois ambientes o quadro
  // desliza junto com o voo.
  let box = { w: 0, h: 0 };
  function measure() {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const AR = tall() ? 9 / 16 : 16 / 9;
    let w = W;
    let h = W / AR;
    if (h < H) {
      h = H;
      w = H * AR;
    }
    box = { W, H, w, h };
    frame.style.width = w.toFixed(1) + 'px';
    frame.style.height = h.toFixed(1) + 'px';
  }
  function shift(id) {
    const f = (!tall() && (STOPS.get(id) || {}).focus) || [0.5, 0.5]; // o focus é da foto deitada
    return {
      x: Math.min(0, Math.max(box.W - box.w, box.W / 2 - f[0] * box.w)),
      y: Math.min(0, Math.max(box.H - box.h, box.H / 2 - f[1] * box.h)),
    };
  }
  function offset(id) {
    const o = shift(id);
    return 'translate3d(' + o.x.toFixed(1) + 'px,' + o.y.toFixed(1) + 'px,0)';
  }
  // Etiqueta perto da borda de uma foto cortada pela tela: entra o suficiente para aparecer inteira
  function keepIn(id) {
    const set = pinSets.get(id);
    if (!set) return;
    const o = shift(id);
    const m = 16;
    Array.from(set.children).forEach((el) => {
      const half = el.offsetWidth / 2;
      if (!half) return;
      const x = o.x + parseFloat(el.style.getPropertyValue('--x')) * box.w;
      const dx = Math.max(m + half - x, Math.min(0, box.W - m - half - x));
      el.style.setProperty('--dx', dx.toFixed(1) + 'px');
    });
  }
  function place(id) {
    frame.style.transform = offset(id);
    keepIn(id);
  }

  /* ------------------------------------------------------------ vídeos */
  // O Cloudflare não entrega pedaços de vídeo (e o iPhone precisa disso para tocar direto do
  // endereço): cada vídeo baixa inteiro e toca da memória.
  const files = new Map();
  function load(name) {
    if (!files.has(name)) {
      const p = fetch('assets/video/' + name + '.mp4')
        .then((r) => {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.blob();
        })
        .then((b) => URL.createObjectURL(b));
      p.catch(() => files.delete(name));
      files.set(name, p);
    }
    return files.get(name);
  }
  const saveData = !!(navigator.connection && navigator.connection.saveData);

  // O caminho de um ambiente para outro: o vídeo de ida, ou o de volta tocado ao contrário
  function route(from, to) {
    const m = MOVES.find((x) => x.from === from && x.to === to);
    if (m) return { m, rev: false };
    const r = MOVES.find((x) => x.from === to && x.to === from && x.reverse);
    if (r) return { m: r, rev: true };
    return null;
  }
  const fileOf = (r) => r.m.video + (tall() ? '-tall' : '') + (r.rev ? '-rev' : '');

  // Deixa o vídeo pronto no quadro t, já desenhado por baixo da foto
  function cue(url, t) {
    return new Promise((resolve, reject) => {
      const done = () => {
        video.removeEventListener('error', fail);
        resolve();
      };
      const fail = () => {
        video.removeEventListener('seeked', done);
        reject(new Error('video'));
      };
      video.addEventListener('error', fail, { once: true });
      const seek = () => {
        video.addEventListener('seeked', done, { once: true });
        video.currentTime = t + 0.001;
      };
      if (video.dataset.src !== url) {
        video.dataset.src = url;
        video.src = url;
        video.addEventListener('loadedmetadata', seek, { once: true });
      } else if (video.readyState >= 1) seek();
      else video.addEventListener('loadedmetadata', seek, { once: true });
    });
  }

  // Toca até o segundo `end` e para ali (o fim do vídeo costuma ficar parado: não precisa esperar)
  function playTo(end) {
    return new Promise((resolve) => {
      let raf = 0;
      const stop = () => {
        cancelAnimationFrame(raf);
        video.removeEventListener('ended', stop);
        clearInterval(guard);
        video.pause();
        resolve();
      };
      const check = () => {
        if (video.currentTime >= end - 0.03 || video.ended) stop();
        else raf = requestAnimationFrame(check);
      };
      // com a aba em segundo plano não há quadros: confere de tempos em tempos também
      const guard = setInterval(() => (video.currentTime >= end - 0.03 || video.ended) && stop(), 250);
      video.addEventListener('ended', stop);
      raf = requestAnimationFrame(check);
    });
  }

  /* ------------------------------------------------------------ estado */
  let here = null;
  let busy = false;
  let target = null; // para onde a câmera está indo

  function show(el, on) {
    el.classList.toggle('is-on', on);
  }

  function leave() {
    const s = STOPS.get(here);
    const set = pinSets.get(here);
    film.classList.add('is-moving');
    if (set) {
      set.classList.remove('is-shown');
      set.inert = true;
    }
    back.classList.remove('is-shown');
    const lines = Array.from(copy.querySelectorAll('[data-line]'));
    if (!reduce.matches && lines.length) {
      lines.forEach((el) => el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translate3d(0,-18px,0)' }],
        { duration: 260, easing: 'ease-in', fill: 'forwards' }));
    } else copy.innerHTML = '';
    return s;
  }

  function arrive(id, first) {
    here = id;
    busy = false;
    target = null;
    const s = STOPS.get(id);
    stills.forEach((el, k) => {
      show(el, k === id);
      el.classList.remove('is-top');
    });
    place(id);
    film.classList.remove('is-moving');
    film.dataset.stop = id;
    copy.innerHTML = copyHTML(s);
    if (typeof freeTouch === 'function') freeTouch();
    const lines = Array.from(copy.querySelectorAll('[data-line]'));
    if (!reduce.matches) {
      lines.forEach((el, k) =>
        el.animate([{ transform: 'translate3d(0,34px,0)', opacity: 0 }, { transform: 'none', opacity: 1 }],
          { duration: 900, delay: (first ? 250 : 60) + k * 70, easing: OUT, fill: 'backwards' }));
    }
    const set = pinSets.get(id);
    if (set) {
      set.inert = false;
      set.classList.add('is-shown');
      if (!reduce.matches) {
        Array.from(set.children).forEach((el, k) =>
          el.animate([{ opacity: 0, transform: 'scale(0.8)' }, { opacity: 1, transform: 'none' }],
            { duration: 700, delay: (first ? 700 : 260) + k * 110, easing: OUT, fill: 'backwards' }));
      }
    }
    if (s.back && STOPS.has(s.back.to)) {
      back.hidden = false;
      back.dataset.to = s.back.to;
      back.querySelector('span').textContent = s.back.label || 'Back';
      requestAnimationFrame(() => back.classList.add('is-shown'));
    } else {
      back.hidden = true;
      back.classList.remove('is-shown');
    }
    // as fotos e os vídeos dos próximos caminhos já ficam prontos: primeiro o da rolada para baixo,
    // depois o da rolada para cima, depois os das etiquetas
    const k = ORDER.indexOf(id);
    const next = [ORDER[k + 1], ORDER[k - 1]].concat((s.pins || []).map((p) => p.to), s.back ? [s.back.to] : [])
      .filter((to, i, all) => to && to !== id && all.indexOf(to) === i);
    next.forEach((to) => {
      const im = stills.get(to);
      if (im && im.decode) im.decode().catch(() => {});
    });
    if (canPlay && !saveData && !reduce.matches) {
      const want = next.map((to) => route(id, to)).filter(Boolean).map(fileOf);
      // no computador todos; no celular os dois da rolada (os outros quando o dedo encosta na etiqueta)
      (fine.matches ? want : want.slice(0, 2)).reduce((p, name) => p.then(() => load(name).catch(() => {})), Promise.resolve());
    }
  }

  /* ------------------------------------------------------------ de um ambiente para outro */
  async function go(to, button) {
    if (busy || !STOPS.has(to) || to === here) return;
    const r = canPlay && !reduce.matches && !document.hidden ? route(here, to) : null;
    if (!r) return fade(to);
    busy = true;
    target = to;
    if (button) button.classList.add('is-loading');
    let url;
    try {
      url = await load(fileOf(r));
    } catch (err) {
      if (button) button.classList.remove('is-loading');
      busy = false;
      return fade(to);
    }
    const from = here;
    const t0 = r.rev ? null : r.m.start || 0;
    try {
      // o arquivo de trás para frente tem a mesma duração: o trecho [start, end] vira [D - end, D - start]
      if (r.rev) {
        await cue(url, 0);
        const D = video.duration;
        await cue(url, Math.max(0, D - (r.m.end || D)));
      } else await cue(url, t0);
    } catch (err) {
      if (button) button.classList.remove('is-loading');
      busy = false;
      return fade(to);
    }
    if (button) button.classList.remove('is-loading');
    leave();
    const D = video.duration || 0;
    const a = video.currentTime;
    const b = r.rev ? D - (r.m.start || 0) : Math.min(D, r.m.end || D);
    const rate = r.m.rate || 1;
    video.playbackRate = rate;
    try {
      await video.play();
    } catch (err) {
      busy = false;
      return fade(to, true);
    }
    const ms = Math.max(300, ((b - a) / rate) * 1000);
    // a foto sai por cima do vídeo (que começa no mesmo quadro dela) e o quadro desliza até o
    // enquadramento do próximo ambiente durante o voo
    stills.get(from).animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE, easing: 'ease', fill: 'forwards' })
      .finished.then((an) => {
        show(stills.get(from), false);
        an.cancel();
      }).catch(() => {});
    const pan = frame.animate([{ transform: offset(from) }, { transform: offset(to) }], { duration: ms, easing: PAN, fill: 'forwards' });
    await playTo(b);
    // chegou: o último quadro do vídeo é a foto do ambiente, que entra por cima, nítida
    const dest = stills.get(to);
    if (dest.decode) await dest.decode().catch(() => {});
    dest.classList.add('is-top');
    dest.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE, easing: 'ease' });
    show(dest, true);
    await wait(FADE * 0.6);
    place(to);
    pan.cancel();
    arrive(to);
  }

  // Sem vídeo entre os dois: a foto do próximo entra por cima, chegando de um leve zoom
  async function fade(to, keepCopy) {
    if (busy && !keepCopy) return;
    busy = true;
    target = to;
    if (!keepCopy) leave();
    const dest = stills.get(to);
    if (dest.decode) await dest.decode().catch(() => {});
    dest.classList.add('is-top'); // por cima da foto que sai
    const from = here;
    const dur = reduce.matches ? 400 : 900;
    if (!reduce.matches) {
      frame.animate([{ transform: offset(from) }, { transform: offset(to) }], { duration: dur, easing: PAN });
      dest.animate([{ opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'none' }], { duration: dur, easing: OUT });
    } else dest.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, easing: 'ease' });
    show(dest, true);
    place(to);
    await wait(dur);
    arrive(to);
  }

  /* ------------------------------------------------------------ cliques */
  stage.addEventListener('click', (e) => {
    const b = e.target.closest('[data-to]');
    if (b && stage.contains(b)) go(b.dataset.to, b === back ? null : b);
  });
  // no celular, o vídeo de uma etiqueta começa a baixar quando o dedo encosta nela
  stage.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-to]');
    const r = b && here && route(here, b.dataset.to);
    if (r && canPlay) load(fileOf(r)).catch(() => {});
  }, { passive: true });

  /* ------------------------------------------------------------ rolada, dedo e teclado */
  const atTop = () => window.scrollY <= 2;
  const menuOpen = () => document.body.classList.contains('menu-open');
  const at = () => ORDER.indexOf(target || here); // o cômodo na tela (ou chegando nele)
  const last = ORDER.length - 1;
  const step = (dir) => {
    const to = ORDER[at() + dir];
    if (to) go(to);
  };

  // Roda e trackpad: um gesto troca um cômodo só. Depois que o dedo sai, o trackpad continua mandando
  // eventos por mais de um segundo (a inércia), cada vez menores; se a rolagem volta a crescer no meio
  // disso, é um gesto novo, e ele vale. (O mesmo das cenas do topo, em chapters.js.)
  let lastWheel = 0;
  let gated = false; // o gesto atual já trocou de cômodo (ou veio rolando a página): espera um gesto novo
  let acc = 0;
  let peak = 0;
  let valley = 0;
  window.addEventListener('wheel', (e) => {
    if (menuOpen() || e.ctrlKey) return;
    let dy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : 0;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= window.innerHeight;
    const v = Math.abs(dy);
    const now = performance.now();
    const gap = now - lastWheel;
    lastWheel = now;
    // uma pausa separa um gesto do outro, a não ser que seja o mesmo gesto depois de um engasgo
    const stall = gated && gap < 1000 && v > 0 && (busy || (v <= valley && v < peak));
    if (gap > QUIET && !stall) {
      gated = false;
      acc = 0;
      peak = valley = 0;
    }
    if (!dy) return;
    if (valley < peak && v > valley * 2 + 6) {
      peak = valley = v; // voltou a crescer depois de frear: gesto novo
      gated = false;
      acc = 0;
    } else if (v >= peak) peak = valley = v;
    else if (v < valley) valley = v;
    if (!atTop()) {
      gated = true; // chegou ao topo rolando a página: o mesmo gesto não troca de cômodo
      return;
    }
    const dir = dy > 0 ? 1 : -1;
    const edge = (dir > 0 && at() === last) || (dir < 0 && at() === 0);
    if (edge && !busy && !gated) return; // do último cômodo para baixo: segue para o resto do site
    e.preventDefault();
    e.lenisStopPropagation = true;
    if (gated || edge || busy) return;
    if (acc * dir < 0) acc = 0;
    acc += dy;
    if (Math.abs(acc) < NUDGE) return;
    gated = true;
    acc = 0;
    step(dir);
  }, { passive: false, capture: true });

  // Dedo: troca assim que o dedo anda um pouco. No último cômodo para baixo, o dedo rola a página.
  let touch = null;
  function freeTouch() {
    film.classList.toggle('is-free', at() === last || !atTop());
  }
  window.addEventListener('scroll', freeTouch, { passive: true });
  film.addEventListener('touchstart', (e) => {
    const p = e.touches[0];
    touch = e.touches.length === 1 && atTop() && !menuOpen() ? { x: p.clientX, y: p.clientY, done: false } : null;
  }, { passive: true });
  film.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) touch = null; // dois dedos: é zoom
    if (!touch) return;
    if (!film.classList.contains('is-free') && e.cancelable) e.preventDefault();
    const p = e.touches[0];
    const dy = touch.y - p.clientY;
    const dx = touch.x - p.clientX;
    const dir = dy > 0 ? 1 : -1;
    if (touch.done || busy || Math.abs(dy) < SWIPE || Math.abs(dy) < Math.abs(dx) * 1.2 || !atTop()) return;
    if (dir > 0 && at() === last) return; // a página rola sozinha
    touch.done = true;
    step(dir);
  }, { passive: false });
  film.addEventListener('touchend', () => (touch = null), { passive: true });
  film.addEventListener('touchcancel', () => (touch = null), { passive: true });

  window.addEventListener('keydown', (e) => {
    if (!atTop() || e.altKey || e.ctrlKey || e.metaKey || menuOpen()) return;
    const tag = (e.target && e.target.tagName) || '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || ((tag === 'BUTTON' || tag === 'A') && e.key === ' ')) return;
    const down = e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey);
    const up = e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey);
    if ((down && at() < last) || (up && at() > 0)) {
      e.preventDefault();
      if (!busy) step(down ? 1 : -1);
    }
  });

  /* ------------------------------------------------------------ início */
  measure();
  arrive(STOPS.has(V.start) ? V.start : V.stops[0].id, true);
  let resizing = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizing);
    resizing = requestAnimationFrame(() => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      if (W === box.W && H === box.H) return; // a barra do navegador do celular não muda a altura daqui
      measure();
      if (!busy) place(here);
      freeTouch();
    });
  });
  window.dispatchEvent(new Event('resize'));

  // Mesma interface das outras versões (as linhas do índice de ambientes levam ao ambiente)
  function goToScene(id) {
    if (!STOPS.has(id)) return;
    if (atTop()) {
      go(id);
      return;
    }
    if (!busy) {
      stills.forEach((el, k) => show(el, k === id));
      const set = pinSets.get(here);
      if (set) {
        set.classList.remove('is-shown');
        set.inert = true;
      }
      arrive(id);
    }
    if (window.NUVO_SCROLL_TO) window.NUVO_SCROLL_TO(0);
    else window.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
  }
  window.NUVO_FILM = {
    goTo: (i) => V.stops[i] && goToScene(V.stops[i].id),
    goToScene,
    info: () => ({ mode: 'tour', stop: here, busy, video: video.dataset.src ? video.currentTime : null }),
  };
})();
