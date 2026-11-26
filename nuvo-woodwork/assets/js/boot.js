/* =============================================================================
   Roda no <head>, antes de a página pintar: avisa o CSS que há JavaScript (as
   seções que entram ao rolar dependem disso) e, na home, escolhe a versão do
   topo pelo endereço: a caminhada pela casa (tour.js), ?video para o filme preso
   ao scroll (film.js) ou ?scenes para as cenas com parallax (chapters.js).
   Fica num arquivo (e não no HTML) para a política de segurança (_headers) não
   precisar liberar script escrito dentro da página.
   ========================================================================== */
document.documentElement.classList.add('js');
window.NUVO_FILM_MODE = (function (q) {
  const has = (k) => new RegExp('(^|&)' + k + '(=|&|$)').test(q);
  return has('video') ? 'video' : has('scenes') ? 'chapters' : 'tour';
})(location.search.slice(1));
