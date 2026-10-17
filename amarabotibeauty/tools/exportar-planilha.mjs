// Gera tools/catalogo-modelo.csv a partir de assets/js/products.js.
// É o ponto de partida da planilha de estoque no Google (Arquivo → Importar). Não vai para o ar.
//
//   node amarabotibeauty/tools/exportar-planilha.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(here, '../assets/js/products.js'), 'utf8'), sandbox);
vm.runInNewContext(readFileSync(join(here, '../assets/js/content.js'), 'utf8'), sandbox);
const products = sandbox.window.PRODUCTS;
const cats = sandbox.window.SITE.categories;

const pt = (v) => (v && typeof v === 'object' ? v.pt : v ?? '');
const it = (v) => (v && typeof v === 'object' && v.it !== v.pt ? v.it : '');
const cell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const head = ['id', 'categoria', 'linha', 'nome', 'nome_it', 'tamanho', 'preco', 'estoque', 'destaque', 'novo', 'foto', 'cor', 'desenho', 'familia', 'familia_it', 'descricao', 'descricao_it'];
const rows = products.map((p) => [
  p.id,
  pt((cats.find((c) => c.id === p.cat) || {}).name) || p.cat,
  p.line,
  pt(p.name),
  it(p.name),
  p.size,
  String(p.price.toFixed(2)).replace('.', ','),
  p.stock,
  p.featured ? 'sim' : '',
  p.isNew ? 'sim' : '',
  p.photo || '',
  p.color || '',
  p.shape || '',
  pt(p.family),
  it(p.family),
  pt(p.desc),
  it(p.desc),
]);

const csv = [head, ...rows].map((r) => r.map(cell).join(',')).join('\n') + '\n';
writeFileSync(join(here, 'catalogo-modelo.csv'), csv);
console.log(`catalogo-modelo.csv: ${rows.length} produtos`);
