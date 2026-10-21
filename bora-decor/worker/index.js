// Worker do site da Bora Decor.
// - /api/quote: recebe o pedido de orçamento (dados + fotos) e manda por e-mail para QUOTE_TO.
// - todo o resto: arquivos do site (pasta publicada), servidos pelo Cloudflare.
//
// Configuração (ver README, seção "Pedidos de orçamento por e-mail"):
//   vars:    SMTP_HOST, SMTP_PORT, SMTP_USER (caixa que envia), QUOTE_TO (quem recebe), QUOTE_FROM_NAME
//   secret:  SMTP_PASS (senha da caixa SMTP_USER)
import { sendMail, b64, wrap76, encodeHeader } from './smtp.js';

const MAX_BODY = 16 * 1024 * 1024;        // limite do pedido inteiro
const MAX_PHOTOS = 6;
const MAX_PHOTOS_B64 = 13 * 1024 * 1024;  // ~9,5 MB de fotos depois do base64
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});
const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
const oneLine = (v, max) => clean(v, max).replace(/[\r\n]+/g, ' ');
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/quote') {
      if (request.method !== 'POST') return json({ ok: false, error: 'method-not-allowed' }, 405);
      return handleQuote(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};

async function handleQuote(request, env) {
  if (!env.SMTP_PASS || !env.SMTP_USER || !env.SMTP_HOST || !env.QUOTE_TO) {
    return json({ ok: false, error: 'not-configured' }, 503);
  }
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY) return json({ ok: false, error: 'too-large' }, 413);

  let data;
  try { data = await request.json(); } catch (e) { return json({ ok: false, error: 'bad-request' }, 400); }
  if (!data || typeof data !== 'object') return json({ ok: false, error: 'bad-request' }, 400);

  // Campo escondido que só robôs preenchem: finge que deu certo e não manda nada
  if (clean(data.website, 200)) return json({ ok: true });

  const name = oneLine(data.name, 120);
  const email = oneLine(data.email, 160);
  const phone = oneLine(data.phone, 40);
  const suburb = oneLine(data.suburb, 120);
  const page = oneLine(data.page, 40) || 'Website';
  if (!name || !suburb || !EMAIL_RE.test(email) || (phone.replace(/\D/g, '').length < 6)) {
    return json({ ok: false, error: 'missing-fields' }, 422);
  }

  // Campos na ordem do formulário: [rótulo, valor]
  const fields = (Array.isArray(data.fields) ? data.fields : []).slice(0, 24)
    .map(f => (Array.isArray(f) ? [oneLine(f[0], 60), clean(f[1], 3000)] : null))
    .filter(f => f && f[0] && f[1]);

  const photos = [];
  let total = 0;
  for (const [i, p] of (Array.isArray(data.photos) ? data.photos : []).slice(0, MAX_PHOTOS).entries()) {
    if (!p || typeof p.data !== 'string' || !p.data) continue;
    const type = PHOTO_TYPES.includes(p.type) ? p.type : 'application/octet-stream';
    total += p.data.length;
    if (total > MAX_PHOTOS_B64) return json({ ok: false, error: 'too-large' }, 413);
    const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif' }[type] || 'bin';
    const base = oneLine(p.name, 60).replace(/\.[^.]*$/, '').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'photo';
    // Só base64 puro, numa linha: nenhuma quebra de linha do visitante chega ao servidor de e-mail
    // (impede injetar comandos SMTP no meio da foto). As linhas de 76 são feitas aqui.
    if (!/^[A-Za-z0-9+/=]+$/.test(p.data)) return json({ ok: false, error: 'bad-photo' }, 400);
    photos.push({ filename: `${String(i + 1).padStart(2, '0')}-${base}.${ext}`, type, body: wrap76(p.data) });
  }

  const message = buildMessage({ env, page, name, email, phone, suburb, fields, photos });
  try {
    await sendMail({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 465,
      secure: env.SMTP_SECURE !== 'off',
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
      from: env.SMTP_USER,
      to: String(env.QUOTE_TO).split(',').map(s => s.trim()).filter(Boolean),
      helo: env.SMTP_HELO || 'boradecor.com.au',
      message
    });
  } catch (e) {
    console.error('quote email failed', e && e.message);
    return json({ ok: false, error: 'send-failed' }, 502);
  }
  return json({ ok: true, photos: photos.length });
}

function buildMessage({ env, page, name, email, phone, suburb, fields, photos }) {
  const fromName = env.QUOTE_FROM_NAME || 'Bora Decor website';
  const subject = `Quote request (${page}): ${name}, ${suburb}`;
  const date = new Date().toUTCString().replace('GMT', '+0000');
  const id = `${crypto.randomUUID()}@${(env.SMTP_USER.split('@')[1] || 'boradecor.com.au')}`;
  const mix = `mix_${crypto.randomUUID().replace(/-/g, '')}`;
  const alt = `alt_${crypto.randomUUID().replace(/-/g, '')}`;
  const safeName = name.replace(/["\\]/g, '');

  const rows = [['Name', name], ['Phone', phone], ['Email', email], ['Suburb', suburb]]
    .concat(fields.filter(([label]) => !['Name', 'Phone', 'Email', 'Suburb'].includes(label)));
  const photoLine = photos.length ? `${photos.length} photo${photos.length > 1 ? 's' : ''} attached` : 'No photos attached';

  const text = [
    `New quote request from the ${page} page of boradecor.com.au`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    photoLine,
    '',
    `Reply to this email to answer ${name} directly.`
  ].join('\r\n');

  const tel = phone.replace(/[^\d+]/g, '');
  const html = `<!doctype html><html><body style="margin:0;background:#f2ece4;font-family:Arial,Helvetica,sans-serif;color:#1e1d1b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2ece4;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:#1c1b19;padding:22px 28px;color:#f2e9e2">
<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c8ad80">New quote request · ${esc(page)}</div>
<div style="font-size:22px;font-weight:bold;margin-top:6px">${esc(name)}, ${esc(suburb)}</div></td></tr>
<tr><td style="padding:22px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.5">
${rows.map(([k, v]) => {
    let value = esc(v).replace(/\r?\n/g, '<br>');
    if (k === 'Email') value = `<a href="mailto:${esc(email)}" style="color:#a2865a">${esc(email)}</a>`;
    if (k === 'Phone') value = `<a href="tel:${esc(tel)}" style="color:#a2865a">${esc(phone)}</a>`;
    return `<tr><td style="padding:8px 14px 8px 0;color:#6b645b;vertical-align:top;white-space:nowrap;border-bottom:1px solid #eee">${esc(k)}</td><td style="padding:8px 0;border-bottom:1px solid #eee">${value}</td></tr>`;
  }).join('\n')}
</table>
<p style="margin:18px 0 0;font-size:14px;color:#6b645b">${esc(photoLine)}. Reply to this email to answer ${esc(name)} directly.</p>
</td></tr></table></td></tr></table></body></html>`;

  const head = [
    `From: ${encodeHeader(fromName)} <${env.SMTP_USER}>`,
    `To: ${String(env.QUOTE_TO).split(',').map(s => `<${s.trim()}>`).join(', ')}`,
    `Reply-To: ${encodeHeader(safeName)} <${email}>`,
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${date}`,
    `Message-ID: <${id}>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${mix}"`
  ];
  const parts = [
    `--${mix}`,
    `Content-Type: multipart/alternative; boundary="${alt}"`,
    '',
    `--${alt}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap76(b64(text)),
    `--${alt}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap76(b64(html)),
    `--${alt}--`
  ];
  for (const p of photos) {
    parts.push(
      `--${mix}`,
      `Content-Type: ${p.type}; name="${p.filename}"`,
      `Content-Disposition: attachment; filename="${p.filename}"`,
      'Content-Transfer-Encoding: base64',
      '',
      p.body
    );
  }
  parts.push(`--${mix}--`);
  return `${head.join('\r\n')}\r\n\r\n${parts.join('\r\n')}`;
}
