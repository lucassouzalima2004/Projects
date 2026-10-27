/* =============================================================================
   Rolagem suave no computador (Lenis, em assets/js/vendor/): cada giro da roda
   do mouse ou gesto do trackpad vira um deslizamento contínuo que freia aos
   poucos, e a página inteira desliza junto com o filme.

   No celular e no tablet fica a rolagem do próprio aparelho (que já desliza
   com o dedo), e com "reduzir movimento" ligado também.
   Os links internos (#rooms, #contact...) deslizam até a seção, descontando o
   cabeçalho. Pelo teclado, o link funciona do jeito normal do navegador.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.Lenis) return;

  const LERP = 0.085; // quanto da distância anda a cada quadro: menor = desliza mais longe e mais macio
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)'); // mouse ou trackpad
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  let lenis = null;

  function update() {
    const want = fine.matches && !reduce.matches;
    if (want && !lenis) {
      lenis = new window.Lenis({ lerp: LERP, smoothWheel: true, syncTouch: false, autoRaf: true });
    } else if (!want && lenis) {
      lenis.destroy();
      lenis = null;
    }
    window.NUVO_SCROLL = lenis;
  }
  update();
  [fine, reduce].forEach((m) => (m.addEventListener ? m.addEventListener('change', update) : m.addListener(update)));

  // Desliza até a posição y da página; sem a rolagem suave, usa a do navegador
  window.NUVO_SCROLL_TO = (y) => {
    if (lenis) lenis.scrollTo(y, { duration: 1.6, easing: easeInOut });
    else window.scrollTo({ top: Math.round(y), behavior: reduce.matches ? 'auto' : 'smooth' });
  };

  // Links internos com o mouse: deslizam até a seção. O Lenis já desconta o cabeçalho fixo
  // (o scroll-padding-top do CSS).
  document.addEventListener('click', (e) => {
    if (!lenis || e.defaultPrevented || e.detail === 0 || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('skip-link')) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    const el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el, { duration: 1.6, easing: easeInOut });
    if (history.pushState) history.pushState(null, '', '#' + id);
  });
})();
