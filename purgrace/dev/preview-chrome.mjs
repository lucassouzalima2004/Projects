// What the online preview adds to every page: keeps it out of search engines, says it is a preview
// and starts the service worker that runs the store in the browser.

const BANNER = {
  en: 'New website preview · the live store is',
  'pt-BR': 'Prévia do novo site · a loja oficial é',
};

export function decorate(html, locale = 'en') {
  const banner = `<div class="preview-banner" style="background:#B89155;color:#2E211E;font:500 13px/1.45 Jost,system-ui,sans-serif;letter-spacing:.02em;text-align:center;padding:8px 16px">${BANNER[locale] || BANNER.en} <a href="https://www.purgrace.com.au" style="color:#2E211E;font-weight:600">purgrace.com.au</a></div>`;
  const register = `<script>if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');</script>`;
  return html
    .replace('<head>', '<head><meta name="robots" content="noindex, nofollow">')
    .replace(/<body([^>]*)>/, (m) => `${m}${banner}`)
    .replace('</body>', `${register}</body>`);
}
