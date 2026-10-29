// Worker da prévia publicada: os arquivos estáticos saem direto do Cloudflare; só os vídeos da capa
// passam por aqui para atender pedidos de trecho (Range → 206), que o Safari do iPhone exige para tocar MP4.
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith('/preview/videos/') || response.status !== 200) return response;
    const headers = new Headers(response.headers);
    headers.set('Accept-Ranges', 'bytes');
    const range = request.headers.get('Range');
    if (!range || request.method === 'HEAD') return new Response(response.body, { status: 200, headers });

    const body = await response.arrayBuffer();
    const size = body.byteLength;
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    let start = -1;
    let end = size - 1;
    if (m && m[1] !== '') {
      start = Number(m[1]);
      if (m[2] !== '') end = Math.min(Number(m[2]), size - 1);
    } else if (m && m[2] !== '') {
      start = Math.max(0, size - Number(m[2])); // "bytes=-500": os últimos 500 bytes
    }
    if (start < 0 || start >= size || start > end) {
      headers.set('Content-Range', `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(body.slice(start, end + 1), { status: 206, headers });
  },
};
