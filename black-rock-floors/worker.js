// Worker do site. Só roda para os vídeos do topo (veja "run_worker_first" no workflow de publicação);
// o resto do site sai direto dos arquivos estáticos, sem passar por aqui.
//
// O iPhone (Safari e qualquer navegador no iOS) e o Safari do Mac só tocam vídeo se o servidor entregar
// o pedaço do arquivo que eles pedem (cabeçalho Range, resposta 206). Os arquivos estáticos do Cloudflare
// sempre vêm inteiros (resposta 200), então aqui o Worker corta o pedaço pedido e responde do jeito certo.
// Os vídeos são pequenos (até 2,5 MB), então dá para ler o arquivo inteiro e cortar na memória.

export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request);
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
  },
};

// Mesma resposta, avisando que o servidor aceita pedidos por pedaço
function withHeaders(res, body, status) {
  const headers = new Headers(res.headers);
  headers.set('Accept-Ranges', 'bytes');
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'public, max-age=604800');
  return new Response(body, { status, headers });
}
