/* =============================================================================
   As cenas do topo: cada ambiente da casa ocupa a tela inteira, e uma pequena
   rolada (roda do mouse, trackpad, dedo ou setas do teclado) leva à próxima
   cena numa transição com parallax:
   • a cena nova sobe por cima da anterior, e a foto dela anda mais devagar que
     a cena e chega com um leve zoom, como a câmera avançando pela casa;
   • a cena que sai fica para trás, anda mais devagar ainda e escurece;
   • o card do projeto real e os textos andam mais rápido (estão mais "perto").
   Voltando, tudo acontece ao contrário. Parada, a foto continua viva: um zoom
   bem lento no computador e, no celular em pé (onde a foto larga não cabe), a
   câmera passeia devagar de um lado para o outro da sala. No computador, as
   camadas também acompanham o mouse, cada uma num ritmo.
   Na última cena a rolagem segue para o resto do site; de volta ao topo,
   rolar para cima volta pelas cenas.

   A transição roda no tempo dela (não presa ao scroll), por isso é sempre
   lisa. Textos, fotos e a ordem das cenas ficam em content.js (chapters).
   O filme antigo em vídeo continua no ar em ?video.
   ========================================================================== */
(function () {
  'use strict';

  const C = window.NUVO;
  const film = document.querySelector('[data-film]');
  if (window.NUVO_FILM_MODE !== 'chapters' || !C || !Array.isArray(C.chapters) || !C.chapters.length || !film) return;

  const LIST = C.chapters;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const DUR = 1100; // duração da passagem de uma cena para outra (ms)
  const FREE = 0.82; // a partir daqui da passagem, uma nova rolada já pode seguir para a próxima
  // Arranca logo (nada de esperar parado) e chega devagar
  const EASE = 'cubic-bezier(0.35, 0, 0.1, 1)';
  const OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const IN = 'cubic-bezier(0.7, 0, 0.84, 0)';
  const QUIET = 200; // ms sem rolar que separam um gesto do outro (trackpad e roda continuam mandando eventos)
  const NUDGE = 8; // px de rolagem que já contam como "quero a próxima cena"
  const SWIPE = 30; // px que o dedo anda para trocar de cena

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const rich = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');

  /* ------------------------------------------------------------ montagem */
  film.classList.add('is-chapters');
  film.setAttribute('aria-roledescription', 'carousel');
  const stage = film.querySelector('.film__stage');
  stage.innerHTML = '';

  function copyHTML(c, first) {
    const tag = first ? 'h1' : 'h2';
    let h = '';
    if (c.eyebrow) h += '<p class="beat__eyebrow" data-line>' + esc(c.eyebrow) + '</p>';
    h += '<' + tag + ' class="beat__title">' +
      String(c.title || '').split('\n').map((l) => '<span class="beat__line" data-line>' + rich(l) + '</span>').join('') +
      '</' + tag + '>';
    if (c.text) h += '<p class="beat__text" data-line>' + esc(c.text) + '</p>';
    if (c.actions && C.contact) {
      h += '<div class="beat__actions" data-line>' +
        '<a class="btn btn--solid" href="#contact">Book a free consultation</a>' +
        '<a class="btn btn--line" href="tel:' + esc(C.contact.tel) + '">Call ' + esc(C.contact.phone) + '</a></div>';
    }
    if (c.cue) h += '<p class="beat__cue" data-line><span aria-hidden="true"></span>' + esc(c.cue) + '</p>';
    return h;
  }

  const items = LIST.map((c, i) => {
    const el = document.createElement('div');
    el.className = 'chapter chapter--' + (c.align || 'left') + (c.card ? ' has-card' : '');
    el.setAttribute('role', 'group');
    el.setAttribute('aria-roledescription', 'slide');
    el.setAttribute('aria-label', i + 1 + ' of ' + LIST.length + ': ' + (c.label || ''));
    const src = 'assets/img/' + c.image;
    const small = src.replace(/(\.\w+)$/, '-1376$1');
    // A primeira foto vem antes de tudo; as outras logo depois, sem disputar com ela
    let pic = '<img class="chapter__img" alt="" decoding="async" src="' + esc(src) + '" srcset="' + esc(small) + ' 1376w, ' + esc(src) +
      ' 2752w" sizes="(max-aspect-ratio: 16/9) calc(100vh * 1.8), 100vw" fetchpriority="' + (i ? 'low' : 'high') + '">';
    if (c.tall) pic = '<picture><source media="(orientation: portrait)" srcset="assets/img/' + esc(c.tall) + '">' + pic + '</picture>';
    el.innerHTML =
      '<div class="chapter__media"><div class="chapter__float" data-depth="1">' + pic + '</div></div>' +
      '<div class="chapter__shade" aria-hidden="true"></div>' +
      (c.card
        ? '<figure class="chapter__card"><div class="chapter__float" data-depth="3"><img src="assets/img/' + esc(c.card.image) +
          '" alt="' + esc(c.card.caption || '') + '" loading="lazy" decoding="async"><figcaption><span>Real project</span>' +
          esc(c.card.caption || '') + '</figcaption></div></figure>'
        : '') +
      '<div class="chapter__copy"><div class="chapter__float" data-depth="2">' + copyHTML(c, i === 0) + '</div></div>' +
      '<div class="chapter__dim" aria-hidden="true"></div>';
    stage.appendChild(el);
    const it = {
      c,
      el,
      media: el.querySelector('.chapter__media'),
      frame: el.querySelector('.chapter__media .chapter__float'),
      img: el.querySelector('.chapter__img'),
      card: el.querySelector('.chapter__card'),
      copy: el.querySelector('.chapter__copy'),
      lines: Array.from(el.querySelectorAll('[data-line]')),
      dim: el.querySelector('.chapter__dim'),
      drift: null,
      room: null,
      key: '',
    };
    it.img.addEventListener('load', () => {
      if (place(it) && it.el.classList.contains('is-active')) live(it);
    });
    return it;
  });

  // Tracinhos de navegação (um por cena), na lateral direita
  const nav = document.createElement('nav');
  nav.className = 'chapters__nav';
  nav.setAttribute('aria-label', 'Rooms of the house');
  nav.innerHTML = LIST.map((c, i) => '<button type="button" data-go="' + i + '"><span>' + esc(c.label || '') + '</span></button>').join('');
  stage.appendChild(nav);
  const dots = Array.from(nav.querySelectorAll('button'));
  nav.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (b) go(+b.dataset.go);
  });

  /* ------------------------------------------------------------ a foto: enquadramento e movimento lento */
  // Cobre a tela inteira mantendo o ponto de interesse (focus) o mais perto do centro que der
  // (devolve false quando nada mudou, por exemplo quando a barra do navegador do celular some)
  function place(it) {
    const V = it.frame.clientWidth;
    const H = it.frame.clientHeight;
    const nat = it.img.naturalWidth ? it.img.naturalWidth / it.img.naturalHeight : 16 / 9;
    const key = V + 'x' + H + '@' + nat;
    if (!V || !H || key === it.key) return false;
    it.key = key;
    let w = V;
    let h = V / nat;
    if (h < H) {
      h = H;
      w = H * nat;
    }
    const f = it.c.focus || [0.5, 0.5];
    const x = Math.min(0, Math.max(V - w, V / 2 - f[0] * w));
    const y = Math.min(0, Math.max(H - h, H / 2 - f[1] * h));
    const s = it.img.style;
    s.width = w.toFixed(1) + 'px';
    s.height = h.toFixed(1) + 'px';
    s.left = x.toFixed(1) + 'px';
    s.top = y.toFixed(1) + 'px';
    s.transformOrigin = (f[0] * 100).toFixed(1) + '% ' + (f[1] * 100).toFixed(1) + '%';
    // Sobra muita foto dos lados (celular em pé): dá para passear por ela
    it.room = w - V > V * 0.35 ? { right: -x, left: x - (V - w), w } : null;
    return true;
  }

  // Parada, a foto continua viva (some quando a cena sai)
  function live(it) {
    if (it.drift) it.drift.cancel();
    it.drift = null;
    if (reduce.matches) return;
    const r = it.room;
    if (r) {
      // vai um pouco para um lado, atravessa para o outro e volta ao começo
      const a = Math.min(r.right, r.w * 0.1);
      const b = Math.min(r.left, r.w * 0.1);
      const ease = 'cubic-bezier(0.45, 0, 0.55, 1)';
      it.drift = it.img.animate([
        { transform: 'none', easing: ease },
        { transform: 'translate3d(' + a.toFixed(1) + 'px,0,0)', offset: 0.25, easing: ease },
        { transform: 'translate3d(' + (-b).toFixed(1) + 'px,0,0)', offset: 0.75, easing: ease },
        { transform: 'none' },
      ], { duration: 26000, iterations: Infinity });
    } else {
      it.drift = it.img.animate([{ transform: 'none' }, { transform: 'scale(1.07)' }],
        { duration: 22000, easing: 'cubic-bezier(0.3, 0, 0.5, 1)', fill: 'forwards' });
    }
  }

  /* ------------------------------------------------------------ estado */
  let index = 0;
  let run = null; // a passagem em andamento
  const last = items.length - 1;
  const locked = () => !!run && performance.now() < run.free;
  const at = () => (run ? run.to : index); // a cena na tela (ou chegando nela)

  function settle(i) {
    items.forEach((it, k) => {
      const on = k === i;
      it.el.classList.toggle('is-active', on);
      it.el.inert = !on;
      it.el.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (!on && it.drift) {
        it.drift.cancel();
        it.drift = null;
      }
    });
    dots.forEach((d, k) => (k === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
    film.classList.toggle('is-last', i === last);
    index = i;
    freeTouch();
    if (!items[i].drift) live(items[i]);
    // as fotos vizinhas já decodificadas, para a próxima passagem não engasgar
    [items[i + 1], items[i - 1]].forEach((it) => it && it.img.decode && it.img.decode().catch(() => {}));
  }

  // Termina a passagem em andamento de uma vez (ela já está no fim quando isso acontece)
  function complete() {
    const r = run;
    if (!r) return;
    run = null;
    r.anims.forEach((a) => a.cancel());
    r.A.el.classList.remove('is-out', 'is-top');
    r.B.el.classList.remove('is-in', 'is-top');
    settle(r.to);
  }

  /* ------------------------------------------------------------ passagem de cena */
  function go(to, instant) {
    if (to === index && !run) return;
    if (to < 0 || to > last) return;
    if (run) {
      if (locked() && !instant) return;
      complete();
      if (to === index) return;
    }
    const fwd = to > index;
    const A = items[index]; // sai
    const B = items[to]; // entra
    if (instant || document.hidden) {
      settle(to);
      return;
    }
    // A cena de número maior fica por cima: indo em frente ela sobe e cobre a anterior;
    // voltando, ela desce e mostra a anterior por baixo (o mesmo movimento ao contrário)
    const top = reduce.matches || fwd ? B : A;
    const low = top === B ? A : B;
    const kf = (from, to2) => (fwd ? [from, to2] : [to2, from]);
    const t = { duration: DUR, easing: EASE, fill: 'both' };
    const dir = fwd ? 1 : -1;
    const anims = [];
    A.el.classList.add('is-out');
    B.el.classList.add('is-in');
    top.el.classList.add('is-top');
    if (reduce.matches) {
      anims.push(B.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: 'ease', fill: 'both' }));
    } else {
      // a de cima: entra (ou sai) inteira, e a foto dela anda mais devagar, com um leve zoom
      anims.push(top.el.animate(kf({ transform: 'translate3d(0,100%,0)' }, { transform: 'none' }), t));
      anims.push(top.media.animate(kf({ transform: 'translate3d(0,-58%,0) scale(1.16)' }, { transform: 'none' }), t));
      // a de baixo: fica para trás, anda pouco e escurece
      anims.push(low.el.animate(kf({ transform: 'none' }, { transform: 'translate3d(0,-26%,0)' }), t));
      anims.push(low.media.animate(kf({ transform: 'none' }, { transform: 'scale(1.06)' }), t));
      anims.push(low.dim.animate(kf({ opacity: 0 }, { opacity: 0.65 }), t));
      // os textos e o card da cena que sai vão embora primeiro, mais rápido que ela
      anims.push(A.copy.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate3d(0,' + -dir * 90 + 'px,0)', opacity: 0 }],
        { duration: DUR * 0.45, easing: IN, fill: 'both' }));
      if (A.card) anims.push(A.card.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate3d(0,' + -dir * 160 + 'px,0)', opacity: 0 }],
        { duration: DUR * 0.55, easing: IN, fill: 'both' }));
      // os da cena que entra chegam mais rápido que ela, um depois do outro
      if (B.card) anims.push(B.card.animate([{ transform: 'translate3d(0,' + dir * 200 + 'px,0)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 1000, delay: 260, easing: OUT, fill: 'both' }));
      B.lines.forEach((el, k) =>
        anims.push(el.animate([{ transform: 'translate3d(0,' + dir * 48 + 'px,0)', opacity: 0 }, { transform: 'none', opacity: 1 }],
          { duration: 820, delay: 300 + k * 60, easing: OUT, fill: 'both' })));
    }
    dots.forEach((d, k) => (k === to ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
    const r = { A, B, to, anims, free: performance.now() + (reduce.matches ? 400 : DUR * FREE) };
    run = r;
    Promise.all(anims.map((a) => a.finished.catch(() => {}))).then(() => {
      if (run === r) complete();
    });
  }

  /* ------------------------------------------------------------ entrada: roda, trackpad, dedo, teclado */
  const atTop = () => window.scrollY <= 2;
  const menuOpen = () => document.body.classList.contains('menu-open');

  // Roda e trackpad. Um gesto muda uma cena só. Depois que o dedo sai, o trackpad continua
  // mandando eventos por mais de um segundo (a inércia), cada vez menores; se a rolagem volta a
  // crescer no meio disso, é um gesto novo por cima da inércia do anterior, e ele vale.
  let lastWheel = 0;
  let gated = false; // o gesto atual já mudou de cena (ou veio rolando a página): espera um gesto novo
  let acc = 0;
  let peak = 0; // o maior passo do gesto atual
  let valley = 0; // o menor passo desde então (a inércia freando)

  window.addEventListener('wheel', (e) => {
    if (menuOpen() || e.ctrlKey) return;
    let dy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : 0;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= window.innerHeight;
    const v = Math.abs(dy);
    const now = performance.now();
    const gap = now - lastWheel;
    lastWheel = now;
    // Uma pausa separa um gesto do outro. Mas se a cena ainda está passando, ou se a rolagem volta menor do
    // que estava, é o mesmo gesto depois de um engasgo do navegador (um gesto novo começa crescendo).
    const stall = gated && gap < 1000 && v > 0 && (locked() || (v <= valley && v < peak));
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
    } else if (v >= peak) peak = valley = v; // ainda acelerando: o mesmo gesto
    else if (v < valley) valley = v; // freando
    if (!atTop()) {
      gated = true; // chegou ao topo rolando a página: o mesmo gesto não muda de cena
      return;
    }
    const dir = dy > 0 ? 1 : -1;
    const edge = (dir > 0 && at() === last) || (dir < 0 && at() === 0);
    if (edge && !locked() && !gated) return; // da última cena para baixo: segue para o resto do site
    // daqui em diante a rolagem é das cenas: a página não anda (nem a rolagem suave)
    e.preventDefault();
    e.lenisStopPropagation = true;
    if (gated || edge || locked()) return;
    if (acc * dir < 0) acc = 0;
    acc += dy;
    if (Math.abs(acc) < NUDGE) return;
    gated = true;
    acc = 0;
    go(at() + dir);
  }, { passive: false, capture: true });

  // Dedo: a cena muda assim que o dedo anda um pouco (sem esperar soltar). Um gesto muda uma cena só.
  // Na última cena para baixo (ou com a página rolada) o dedo rola a página.
  let touch = null;
  function freeTouch() {
    film.classList.toggle('is-free', index === last || !atTop());
  }
  window.addEventListener('scroll', freeTouch, { passive: true });
  film.addEventListener('touchstart', (e) => {
    const p = e.touches[0];
    touch = e.touches.length === 1 && atTop() && !menuOpen() ? { x: p.clientX, y: p.clientY, done: false } : null;
  }, { passive: true });
  film.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) touch = null; // dois dedos: é zoom, não troca de cena
    if (!touch) return;
    if (!film.classList.contains('is-free') && e.cancelable) e.preventDefault();
    const p = e.touches[0];
    const dy = touch.y - p.clientY;
    const dx = touch.x - p.clientX;
    const dir = dy > 0 ? 1 : -1;
    if (touch.done || locked() || Math.abs(dy) < SWIPE || Math.abs(dy) < Math.abs(dx) * 1.2 || !atTop()) return;
    if (dir > 0 && at() === last) return; // a página rola sozinha
    touch.done = true;
    go(at() + dir);
  }, { passive: false });
  film.addEventListener('touchend', () => (touch = null), { passive: true });
  film.addEventListener('touchcancel', () => (touch = null), { passive: true });

  window.addEventListener('keydown', (e) => {
    if (!atTop() || e.altKey || e.ctrlKey || e.metaKey || menuOpen()) return;
    const tag = (e.target && e.target.tagName) || '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || (tag === 'BUTTON' && e.key === ' ') || (tag === 'A' && e.key === ' ')) return;
    const down = e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey);
    const up = e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey);
    if (down && at() < last) {
      e.preventDefault();
      go(at() + 1);
    } else if (up && at() > 0) {
      e.preventDefault();
      go(at() - 1);
    }
  });

  /* ------------------------------------------------------------ parallax do mouse (computador) */
  const m = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };
  function follow() {
    m.raf = 0;
    m.x += (m.tx - m.x) * 0.08;
    m.y += (m.ty - m.y) * 0.08;
    film.style.setProperty('--mx', m.x.toFixed(4));
    film.style.setProperty('--my', m.y.toFixed(4));
    if (Math.abs(m.tx - m.x) + Math.abs(m.ty - m.y) > 0.001) m.raf = requestAnimationFrame(follow);
  }
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !fine.matches || reduce.matches || !atTop()) return;
    m.tx = (e.clientX / window.innerWidth) * 2 - 1;
    m.ty = (e.clientY / window.innerHeight) * 2 - 1;
    if (!m.raf) m.raf = requestAnimationFrame(follow);
  }, { passive: true });

  /* ------------------------------------------------------------ início */
  items.forEach(place);
  settle(0);
  // a primeira cena entra com os textos subindo, um depois do outro
  if (!reduce.matches) {
    items[0].lines.forEach((el, k) =>
      el.animate([{ transform: 'translate3d(0,40px,0)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 1100, delay: 250 + k * 90, easing: OUT, fill: 'backwards' }));
  }
  // as outras fotos baixam logo depois da primeira
  window.addEventListener('load', () => items.forEach((it) => it.img.decode && it.img.decode().catch(() => {})), { once: true });
  let resizing = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizing);
    resizing = requestAnimationFrame(() => {
      if (items.map(place).some(Boolean)) live(items[index]);
    });
  });
  [reduce, fine].forEach((q) => q.addEventListener && q.addEventListener('change', () => live(items[index])));
  window.dispatchEvent(new Event('resize')); // o resto da página mede de novo a altura do topo

  // Mesma interface do filme antigo (links do índice de ambientes e do cabeçalho)
  function goToScene(id) {
    const i = items.findIndex((it) => it.c.id === id);
    if (i < 0) return;
    if (atTop()) {
      go(i);
      return;
    }
    go(i, true); // já na cena certa quando a página chegar ao topo
    if (window.NUVO_SCROLL_TO) window.NUVO_SCROLL_TO(0);
    else window.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#tour"]');
    if (a && !a.closest('[data-scene-link]')) go(0, !atTop());
  });
  window.NUVO_FILM = {
    goTo: (i) => goToScene((items[i] || {}).c && items[i].c.id),
    goToScene,
    info: () => ({ mode: 'chapters', index, busy: !!run }),
  };
})();
