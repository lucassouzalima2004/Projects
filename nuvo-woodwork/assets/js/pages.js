/* =============================================================================
   Páginas internas (projetos, produtos, journal): as fotos abrem em tela cheia
   e, em produtos, a barra de ambientes marca onde a pessoa está.
   A rolagem aqui é a do próprio navegador (sem a rolagem suave da home).
   ========================================================================== */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ------------------------------------------------------------ fotos em tela cheia */
  const box = $('[data-lb-box]');
  if (box && box.showModal) {
    const pic = $('[data-lb-img]', box);
    const count = $('[data-lb-count]', box);
    const caption = $('[data-lb-alt]', box);
    let items = [];
    let at = 0;
    const pad = (n) => String(n).padStart(2, '0');
    const altOf = (b) => b.dataset.alt || ($('img', b) && $('img', b).alt) || '';

    function show(i) {
      at = (i + items.length) % items.length;
      const b = items[at];
      pic.classList.remove('is-in');
      pic.onload = () => pic.classList.add('is-in');
      pic.width = +b.dataset.w;
      pic.height = +b.dataset.h;
      pic.src = b.dataset.src;
      pic.alt = altOf(b);
      if (pic.complete) pic.classList.add('is-in');
      count.textContent = pad(at + 1) + ' / ' + pad(items.length);
      caption.textContent = altOf(b);
      box.classList.toggle('is-single', items.length < 2);
      // a próxima e a anterior já vão baixando
      [at + 1, at - 1].forEach((k) => {
        const n = items[(k + items.length) % items.length];
        if (n !== b) new Image().src = n.dataset.src;
      });
    }
    function open(b) {
      items = $$('[data-lb]', b.closest('[data-lb-group]'));
      document.documentElement.classList.add('lb-open');
      box.showModal();
      show(items.indexOf(b));
    }

    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lb]');
      if (b) open(b);
    });
    $('[data-lb-prev]', box).addEventListener('click', () => show(at - 1));
    $('[data-lb-next]', box).addEventListener('click', () => show(at + 1));
    $('[data-lb-close]', box).addEventListener('click', () => box.close());
    box.addEventListener('close', () => {
      document.documentElement.classList.remove('lb-open');
      pic.removeAttribute('src');
    });
    // clique fora da foto (no fundo escuro) fecha
    box.addEventListener('click', (e) => {
      if (e.target === box || e.target.classList.contains('lb__fig')) box.close();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(at + 1);
      else if (e.key === 'ArrowLeft') show(at - 1);
    });
    // no celular, o dedo arrasta para o lado para trocar de foto
    let x0 = null;
    box.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') x0 = e.clientX;
    });
    box.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 48 && items.length > 1) show(at + (dx < 0 ? 1 : -1));
    });
  }

  /* ------------------------------------------------------------ barra de ambientes (produtos) */
  const sub = $('[data-subnav]');
  if (sub && 'IntersectionObserver' in window) {
    const strip = $('.subnav__in', sub);
    const links = new Map($$('a', sub).map((a) => [a.getAttribute('href').slice(1), a]));
    let current = null;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const a = links.get(en.target.id);
          if (!a || a === current) return;
          if (current) current.removeAttribute('aria-current');
          a.setAttribute('aria-current', 'true');
          current = a;
          // no celular a barra corre para o lado e mostra o ambiente da vez (só ela anda, não a página)
          if (strip.scrollWidth > strip.clientWidth) {
            strip.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
          }
        }),
      { rootMargin: '-40% 0px -55% 0px' }
    );
    links.forEach((a, id) => {
      const s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }
})();
