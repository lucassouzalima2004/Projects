// Worker do site. Roda só em dois casos (veja "run_worker_first" e "not_found_handling" no workflow de publicação);
// o resto do site sai direto dos arquivos estáticos, sem passar por aqui:
//
// 1. Vídeos do topo. O iPhone (Safari e qualquer navegador no iOS) e o Safari do Mac só tocam vídeo se o servidor
//    entregar o pedaço do arquivo que eles pedem (cabeçalho Range, resposta 206). Os arquivos estáticos do Cloudflare
//    sempre vêm inteiros (resposta 200), então aqui o Worker corta o pedaço pedido e responde do jeito certo.
//    Os vídeos são pequenos (até 2,5 MB), então dá para ler o arquivo inteiro e cortar na memória.
// 2. Endereço que não existe. Responde a página 404.html com status 404 e sem cache, para uma foto nova que ainda não
//    chegou a todos os servidores logo depois de publicar não ficar "não encontrada" no navegador de ninguém.

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname.startsWith('/assets/video/')) return video(request, env);
    return notFound(request, env);
  },
};

async function video(request, env) {
  const res = await env.ASSETS.fetch(request);
  if (res.status === 404) return notFound(request, env);
  const range = request.headers.get('Range');
  const ifRange = request.headers.get('If-Range');
  if (res.status !== 200 || request.method !== 'GET' || !range || res.headers.has('Content-Encoding')
    || (ifRange && ifRange !== res.headers.get('ETag'))) {
    return withHeaders(res, res.body, res.status);
  }

  // Só um pedaço por pedido ("bytes=0-1", "bytes=1000-", "bytes=-500"), que é o que os navegadores pedem
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!m || (m[1] === '' && m[2] === '') || (m[1] !== '' && m[2] !== '' && Number(m[2]) < Number(m[1]))) {
    return withHeaders(res, res.body, res.status);
  }

  const body = await res.arrayBuffer();
  const size = body.byteLength;
  const start = m[1] === '' ? Math.max(0, size - Number(m[2])) : Number(m[1]);
  const end = m[1] === '' || m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  if (start >= size || start > end) {
    const out = withHeaders(res, null, 416);
    out.headers.set('Content-Range', `bytes */${size}`);
    out.headers.delete('Content-Length');
    return out;
  }
  const out = withHeaders(res, body.slice(start, end + 1), 206);
  out.headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  out.headers.set('Content-Length', String(end - start + 1));
  return out;
}

// Mesma resposta, avisando que o servidor aceita pedidos por pedaço
function withHeaders(res, body, status) {
  const headers = new Headers(res.headers);
  headers.set('Accept-Ranges', 'bytes');
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'public, max-age=2592000');
  return new Response(body, { status, headers });
}

// A página 404.html (servida em /404), com status 404 e sem cache
async function notFound(request, env) {
  const page = await env.ASSETS.fetch(new Request(new URL('/404', request.url)));
  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Robots-Tag': 'noindex',
  });
  const body = page.ok && request.method !== 'HEAD' ? page.body : null;
  return new Response(body, { status: 404, headers });
}
