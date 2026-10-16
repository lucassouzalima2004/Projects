// Adaptador Node do preview: lê o tema e os dados do disco e entrega o núcleo
// (core.mjs) pronto para o servidor local, o build estático e o zip.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Liquid, Tag } from 'liquidjs';
import { createPreview } from './core.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const THEME = path.resolve(here, '../theme');
export const DATA = path.join(here, 'data');

// todos os arquivos de texto do tema, indexados pelo caminho relativo (ex.: sections/header.liquid)
export function readThemeFiles(dir = THEME, base = THEME, out = {}) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.name.startsWith('.')) continue;
    const full = path.join(dir, d.name);
    if (d.isDirectory()) readThemeFiles(full, base, out);
    else if (/\.(liquid|json)$/.test(d.name)) out[path.relative(base, full).split(path.sep).join('/')] = fs.readFileSync(full, 'utf8');
  }
  return out;
}

export function readData() {
  const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
  return { products: read('products.json'), collections: read('collections.json'), pages: read('pages.json') };
}

export function makePreview(site) {
  return createPreview({ Liquid, Tag, files: readThemeFiles(), data: readData(), site });
}

// API usada pelo servidor local (relê o tema a cada pedido, para refletir edições na hora)
export async function renderRoute(urlPath, opts = {}) {
  const preview = makePreview();
  if (opts.sections) return { json: await preview.renderSections(urlPath, opts.sections, opts.cart) };
  return preview.renderRoute(urlPath, opts);
}
const shared = makePreview();
export const store = shared.store;
export const cartObject = (lines) => makePreview().cartObject(lines);
export const findVariant = (id) => shared.findVariant(id);
