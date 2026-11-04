// Text helpers shared by the renderer and the Worker.

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Plain text where *words in asterisks* are highlighted (pink italics on the site)
export const mark = (s = '') => esc(s).replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
// Same text without the asterisks, for titles, alt text and structured data
export const unmark = (s = '') => String(s).replace(/\*([^*\n]+)\*/g, '$1');

// Blog post bodies come from the panel's editor as HTML. Only these tags and attributes reach the page.
const ALLOWED = {
  p: [], h2: [], h3: [], h4: [], strong: [], b: [], em: [], i: [], u: [], s: [], sub: [], sup: [],
  a: ['href'], ul: [], ol: [], li: [], blockquote: [], br: [], hr: [],
  img: ['src', 'alt', 'width', 'height'], figure: [], figcaption: [],
};
const VOID = new Set(['br', 'hr', 'img']);
const DROP = new Set(['script', 'style', 'iframe', 'object', 'embed', 'template', 'noscript', 'svg', 'math', 'textarea', 'select', 'title', 'head']);
const TAG = /<!--[\s\S]*?(?:-->|$)|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const ATTR = /([^\s=/"'>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

const decode = (s) => s.replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(+d)).replace(/&colon;/gi, ':').replace(/&tab;|&newline;/gi, '')
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

// Links may go to pages of this site, anchors, the web, email or phone; images only from this site or https
export function safeUrl(raw, kind = 'href') {
  const v = decode(String(raw || '')).replace(/[\u0000- \u007f-\u009f]/g, '');
  if (!v) return '';
  if (kind === 'src') return /^\/(media|assets)\//.test(v) || /^https:\/\//i.test(v) ? v : '';
  if (/^\/(?!\/)/.test(v) || v.startsWith('#') || /^(https?:|mailto:|tel:)/i.test(v)) return v;
  return '';
}

const text = (s) => s.replace(/&(?!(?:[a-z][a-z0-9]{1,31}|#\d{1,7}|#x[0-9a-f]{1,6});)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function sanitize(html = '') {
  const src = String(html);
  let out = '';
  let last = 0;
  const open = [];
  TAG.lastIndex = 0;
  for (let m; (m = TAG.exec(src));) {
    out += text(src.slice(last, m.index));
    last = TAG.lastIndex;
    if (!m[2]) continue; // comment
    const closing = !!m[1];
    const tag = m[2].toLowerCase();
    if (DROP.has(tag)) {
      if (!closing) {
        const end = src.toLowerCase().indexOf(`</${tag}`, last);
        const stop = end < 0 ? src.length : src.indexOf('>', end);
        last = TAG.lastIndex = stop < 0 ? src.length : stop + 1;
      }
      continue;
    }
    if (!ALLOWED[tag]) continue;
    if (closing) {
      const at = open.lastIndexOf(tag);
      if (at < 0) continue;
      while (open.length > at) out += `</${open.pop()}>`;
      continue;
    }
    let attrs = '';
    ATTR.lastIndex = 0;
    for (let a; (a = ATTR.exec(m[3]));) {
      const name = a[1].toLowerCase();
      if (!ALLOWED[tag].includes(name)) continue;
      let val = a[2] ?? a[3] ?? a[4] ?? '';
      if (name === 'href' || name === 'src') val = safeUrl(val, name);
      else if (name === 'width' || name === 'height') val = /^\d{1,5}$/.test(val) ? val : '';
      else val = decode(val);
      if (!val) continue;
      attrs += ` ${name}="${esc(val)}"`;
      if (name === 'href' && /^https?:/i.test(val)) attrs += ' target="_blank" rel="noopener"';
    }
    if (tag === 'img') {
      if (!/ src=/.test(attrs)) continue;
      out += `<img${attrs} loading="lazy" decoding="async">`;
      continue;
    }
    out += `<${tag}${attrs}>`;
    if (!VOID.has(tag)) open.push(tag);
  }
  out += text(src.slice(last));
  while (open.length) out += `</${open.pop()}>`;
  return out;
}

// Text only, for excerpts, descriptions and structured data
export const plain = (html = '') =>
  decode(String(html).replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
