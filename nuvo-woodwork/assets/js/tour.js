/* =============================================================================
   A visita por clique (?tour), no formato do site do reel que o Lucas mandou:
   a câmera para em cada ambiente, com etiquetas em cima das passagens. Clicar
   numa etiqueta toca o vídeo da câmera indo até lá; no fim, o vídeo vira a foto
   do ambiente (bem mais nítida) e aparecem o título e as próximas etiquetas. O
   link no canto de cima volta: voando, quando existe o vídeo de trás para
   frente; senão, com uma fusão entre as fotos.

   O vídeo toca no tempo dele (não preso ao scroll), por isso é sempre liso. A
   rolagem da página continua normal. No celular em pé as etiquetas viram botões
   embaixo do título. Textos, etiquetas e vídeos ficam em content.js (visit).
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
  const AR = 16 / 9; // os vídeos e as fotos
  const FADE = 420; // fusão entre o vídeo e a foto (ms)
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
    V.stops.map((s, i) =>
      '<img class="tour__still" data-stop="' + esc(s.id) + '" alt="" decoding="async" src="assets/img/' + esc(s.image) + '"' +
      (i ? ' fetchpriority="low"' : ' fetchpriority="high"') + '>').join('') +
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
    return h;
  }

  /* ------------------------------------------------------------ enquadramento */
  // As fotos, o vídeo e as etiquetas moram juntos num quadro 16:9 que cobre a tela, com o ponto de
  // interesse do ambiente o mais perto do meio que der. Entre dois ambientes o quadro desliza junto
  // com o voo.
  let box = { w: 0, h: 0 };
  function measure() {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
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
    const f = (STOPS.get(id) || {}).focus || [0.5, 0.5];
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
  const fileOf = (r) => r.m.video + (r.rev ? '-rev' : '');

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
    const s = STOPS.get(id);
    stills.forEach((el, k) => {
      show(el, k === id);
      el.classList.remove('is-top');
    });
    place(id);
    film.classList.remove('is-moving');
    film.dataset.stop = id;
    copy.innerHTML = copyHTML(s);
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
    // as fotos e os vídeos dos próximos caminhos já ficam prontos
    const next = (s.pins || []).map((p) => p.to).concat(s.back ? [s.back.to] : []);
    next.forEach((to) => {
      const im = stills.get(to);
      if (im && im.decode) im.decode().catch(() => {});
    });
    if (canPlay && !saveData && !reduce.matches) {
      const want = next.map((to) => route(id, to)).filter(Boolean).map(fileOf);
      // no computador todos; no celular só o primeiro (os outros quando o dedo encosta na etiqueta)
      (fine.matches ? want : want.slice(0, 1)).reduce((p, name) => p.then(() => load(name).catch(() => {})), Promise.resolve());
    }
  }

  /* ------------------------------------------------------------ de um ambiente para outro */
  async function go(to, button) {
    if (busy || !STOPS.has(to) || to === here) return;
    const r = canPlay && !reduce.matches && !document.hidden ? route(here, to) : null;
    if (!r) return fade(to);
    busy = true;
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
    });
  });
  window.dispatchEvent(new Event('resize'));

  // Mesma interface das outras versões (as linhas do índice de ambientes levam ao ambiente)
  const atTop = () => window.scrollY <= 2;
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
