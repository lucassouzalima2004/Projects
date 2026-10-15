// Casca HTML do painel do cliente (/painel). Todo o resto é montado pelo public/assets/js/panel.js.
export function panelPage({ build }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Painel · Jesten Construções</title>
<meta name="theme-color" content="#131311">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/panel.css?v=${build}">
<script src="/assets/js/panel.js?v=${build}" type="module"></script>
</head>
<body>
<div id="app" class="app" aria-live="polite">
  <div class="boot"><svg class="boot__mark" viewBox="0 0 281 370" aria-hidden="true"><use href="/assets/img/logo.svg#mark"/></svg></div>
</div>
<noscript><p class="noscript">O painel precisa de JavaScript ativado no navegador.</p></noscript>
</body>
</html>`;
}
