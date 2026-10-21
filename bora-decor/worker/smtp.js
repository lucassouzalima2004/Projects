// Cliente SMTP mínimo para Cloudflare Workers (conexão TCP do próprio Worker).
// Usado só para mandar os pedidos de orçamento do site para o e-mail da Bora Decor.
import { connect } from 'cloudflare:sockets';

const enc = new TextEncoder();
const dec = new TextDecoder();

// base64 que aceita acentos (o btoa puro só aceita latin-1)
export function b64(text) {
  const bytes = enc.encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

// Quebra base64 em linhas de 76 caracteres (limite de linha do e-mail)
export function wrap76(s) {
  const out = [];
  for (let i = 0; i < s.length; i += 76) out.push(s.slice(i, i + 76));
  return out.join('\r\n');
}

// Cabeçalho com acentos/emoji: =?UTF-8?B?...?=
export function encodeHeader(text) {
  return /^[\x20-\x7e]*$/.test(text) ? text : `=?UTF-8?B?${b64(text)}?=`;
}

export async function sendMail(opts) {
  const { host, port, secure, user, pass, from, to, message, helo = 'localhost' } = opts;
  const socket = connect({ hostname: host, port: Number(port) }, { secureTransport: secure ? 'on' : 'off', allowHalfOpen: false });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  let buf = '';

  // Lê uma resposta completa (pode ter várias linhas: "250-..." até "250 ...")
  async function reply() {
    for (;;) {
      let start = 0;
      for (;;) {
        const end = buf.indexOf('\r\n', start);
        if (end < 0) break;
        const line = buf.slice(start, end);
        if (/^\d{3} /.test(line) || /^\d{3}$/.test(line)) {
          const text = buf.slice(0, end);
          buf = buf.slice(end + 2);
          return { code: Number(line.slice(0, 3)), text };
        }
        start = end + 2;
      }
      const { value, done } = await reader.read();
      if (done) throw new Error('SMTP: connection closed');
      buf += dec.decode(value, { stream: true });
    }
  }
  async function cmd(line, expect, label) {
    if (line !== null) await writer.write(enc.encode(`${line}\r\n`));
    const r = await reply();
    if (!expect.includes(r.code)) throw new Error(`SMTP ${label || (line || 'greeting').split(' ')[0]} failed: ${r.text}`);
    return r;
  }

  try {
    await cmd(null, [220]);
    await cmd(`EHLO ${helo}`, [250]);
    await cmd('AUTH LOGIN', [334]);
    await cmd(b64(user), [334], 'AUTH user');
    await cmd(b64(pass), [235], 'AUTH password');
    await cmd(`MAIL FROM:<${from}>`, [250]);
    for (const rcpt of to) await cmd(`RCPT TO:<${rcpt}>`, [250, 251]);
    await cmd('DATA', [354]);
    // A mensagem é toda em base64 por dentro, então nenhuma linha começa com "." (não precisa de dot-stuffing)
    const data = enc.encode(`${message}\r\n.\r\n`);
    for (let i = 0; i < data.length; i += 64 * 1024) await writer.write(data.subarray(i, i + 64 * 1024));
    await cmd(null, [250], 'message');
    try { await cmd('QUIT', [221]); } catch (e) { /* o servidor pode fechar antes */ }
  } finally {
    try { await socket.close(); } catch (e) { /* já fechado */ }
  }
}
