// Worker do site. Roda nas páginas, nos vídeos, no formulário e em endereço que não existe (veja "run_worker_first" e
// "not_found_handling" no workflow de publicação). Fotos, CSS, JS e fontes saem direto dos arquivos estáticos, sem
// passar por aqui.
//
// 0. Endereço oficial. www.blackrockremod.com e http:// levam para https://blackrockremod.com no mesmo caminho
//    (301). Sem isso o Google indexava a mesma página duas ou três vezes (www, http e a certa), como apareceu no
//    Search Console em 11/11. O .workers.dev e o computador (localhost) ficam como estão. O domínio antigo,
//    blackrockfloors.com, é outro Worker, na conta do Lucas: veja redirect-worker.js.
// 1. Vídeos do topo. O iPhone (Safari e qualquer navegador no iOS) e o Safari do Mac só tocam vídeo se o servidor
//    entregar o pedaço do arquivo que eles pedem (cabeçalho Range, resposta 206). Os arquivos estáticos do Cloudflare
//    sempre vêm inteiros (resposta 200), então aqui o Worker corta o pedaço pedido e responde do jeito certo.
//    Os vídeos são pequenos (até 2,5 MB), então dá para ler o arquivo inteiro e cortar na memória.
// 2. Endereço que não existe. Responde a página 404.html sem deixar guardar em cache. Sem isso, uma foto nova que
//    ainda não chegou a todos os servidores do Cloudflare logo depois de publicar (leva menos de um minuto) ficava
//    "não encontrada" por uma semana no navegador de quem abriu o site naquele minuto (as fotos ficam uma semana no
//    cache, veja o _headers).
// 3. Formulário de orçamento (/api/estimate). Manda o pedido para o e-mail do Gabriel pelo próprio Cloudflare (Email
//    Routing do blackrockremod.com, ligação EMAIL no wrangler.jsonc), sem serviço de fora e sem segredo. Precisa das
//    variáveis MAIL_TO e MAIL_FROM e do MAIL_TO confirmado em Email Routing → Destination addresses (veja "O formulário"
//    no README). Sem isso, responde 503 e a página abre o e-mail do visitante com o pedido já escrito.

import { EmailMessage } from 'cloudflare:email';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const official = officialUrl(url);
    // 301 para quem só lê (visitante, Google); 308 mantém um envio de formulário como envio
    if (official) return Response.redirect(official, ['GET', 'HEAD'].includes(request.method) ? 301 : 308);
    if (url.pathname === '/api/estimate') return estimate(request, env);
    if (url.pathname.startsWith('/assets/video/')) return video(request, env);
    const res = await env.ASSETS.fetch(request);
    return res.status === 404 ? notFound(request, env) : res;
  },
};

// O mesmo endereço sem www e com https, ou null se já estiver certo
function officialUrl(url) {
  const host = url.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.workers.dev')) return null;
  const bare = host.replace(/^www\./, '');
  if (bare === host && url.protocol === 'https:') return null;
  return `https://${bare}${url.pathname}${url.search}`;
}

// Limites de cada campo: o bastante para um pedido de verdade, pouco para quem quer abusar
const LIMITS = { name: 120, phone: 40, email: 160, city: 80, service: 80, message: 4000, page: 120 };

function reply(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}

async function estimate(request, env) {
  if (request.method !== 'POST') return reply(405, { ok: false, error: 'method' });
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return reply(403, { ok: false, error: 'origin' });

  const raw = await request.text();
  if (raw.length > 8000) return reply(413, { ok: false, error: 'size' });
  let input;
  try { input = JSON.parse(raw); } catch (err) { return reply(400, { ok: false, error: 'json' }); }
  if (!input || typeof input !== 'object') return reply(400, { ok: false, error: 'json' });

  // Robô: preencheu o campo escondido ou mandou em menos de 2 segundos. Responde "ok" e não manda nada.
  if (input.website || Number(input.elapsed) < 2000) return reply(200, { ok: true });

  // Só a mensagem pode ter várias linhas
  const field = (k) => {
    const v = String(input[k] ?? '').trim().slice(0, LIMITS[k]);
    return k === 'message' ? v : v.replace(/\s+/g, ' ');
  };
  const data = Object.fromEntries(Object.keys(LIMITS).map((k) => [k, field(k)]));
  if (data.name.length < 2) return reply(422, { ok: false, error: 'name' });
  if (data.phone.replace(/\D/g, '').length < 7) return reply(422, { ok: false, error: 'phone' });
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return reply(422, { ok: false, error: 'email' });

  if (!env.EMAIL || !env.MAIL_TO || !env.MAIL_FROM) return reply(503, { ok: false, error: 'not_configured' });

  const subject = `New estimate request: ${data.service || 'Website'}${data.city ? ` in ${data.city}` : ''} (${data.name})`;
  const text = [
    'New request from the website.\n',
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    data.email && `Email: ${data.email}`,
    data.city && `City: ${data.city}`,
    data.service && `Service: ${data.service}`,
    data.message && `\nMessage:\n${data.message}`,
    data.page && `\nSent from: ${new URL(request.url).origin}${data.page}`,
  ].filter(Boolean).join('\n');

  // MAIL_FROM vem como 'Nome <endereco@dominio>'; o envelope usa só o endereço
  const fromAddress = (/<([^>]+)>/.exec(env.MAIL_FROM) || [, env.MAIL_FROM])[1].trim();
  const raw822 = mimeText({ from: env.MAIL_FROM, fromAddress, to: env.MAIL_TO, replyTo: data.email, subject, text });
  try {
    await env.EMAIL.send(new EmailMessage(fromAddress, env.MAIL_TO, raw822));
  } catch (err) {
    console.error('O Cloudflare não mandou o e-mail:', err && err.message);
    return reply(502, { ok: false, error: 'send' });
  }
  return reply(200, { ok: true });
}

// E-mail simples em texto (RFC 5322), em UTF-8: o nome do cliente pode ter acento
function mimeText({ from, fromAddress, to, replyTo, subject, text }) {
  const b64 = (s) => {
    let bin = '';
    for (const byte of new TextEncoder().encode(s)) bin += String.fromCharCode(byte);
    return btoa(bin);
  };
  // Assunto só com ASCII vai como está; com acento, em pedaços codificados, cada um numa linha
  const encodedSubject = /^[\x20-\x7e]*$/.test(subject)
    ? subject
    : (subject.match(/.{1,30}/gsu) || ['']).map((part) => `=?UTF-8?B?${b64(part)}?=`).join('\r\n ');
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    replyTo && `Reply-To: ${replyTo}`,
    `Subject: ${encodedSubject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${fromAddress.split('@')[1]}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
  ].filter(Boolean);
  const body = b64(text.replace(/\r?\n/g, '\r\n')).replace(/.{76}/g, '$&\r\n');
  return `${headers.join('\r\n')}\r\n\r\n${body}\r\n`;
}

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
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'public, max-age=604800');
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
