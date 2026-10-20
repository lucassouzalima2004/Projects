// Textos do site que o cliente pode mudar no painel ("Textos do site").
// Os textos de fábrica ficam em i18n.js. O painel guarda só o que foi alterado, por língua e por caminho
// (ex.: texts.pt['services.items.0.title']); na hora de montar a página, o alterado entra por cima do de fábrica.
// As funções da página de carreiras podem ser trocadas, acrescentadas e tiradas: ficam em content.roles.
import { STRINGS, LANGS } from './i18n.js';

// type: line (uma linha), title (uma linha; o que estiver entre *asteriscos* fica em dourado),
// text (parágrafo), tags (separadas por vírgula), lines (um item por linha)
const field = (path, label, type, max, hint) => ({ path, label, type, max, ...(hint ? { hint } : {}) });
const each = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).flat();

export const TEXT_SECTIONS = [
  {
    id: 'hero',
    title: 'Topo da página inicial',
    link: '/',
    fields: [
      field('hero.kicker', 'Etiqueta acima do título', 'line', 60),
      field('hero.title', 'Título', 'title', 90),
      field('hero.lead', 'Texto abaixo do título', 'text', 260),
    ],
  },
  {
    id: 'services',
    title: 'Serviços',
    link: '/#servicos',
    fields: [
      field('services.title', 'Título', 'title', 80),
      field('services.intro', 'Texto ao lado do título', 'text', 240),
      ...each(4, (i) => [
        field(`services.items.${i}.title`, `Serviço ${i + 1}: nome`, 'line', 60),
        field(`services.items.${i}.text`, `Serviço ${i + 1}: descrição`, 'text', 320),
        field(`services.items.${i}.tags`, `Serviço ${i + 1}: etiquetas`, 'tags', 140, 'Separadas por vírgula.'),
      ]),
    ],
  },
  {
    id: 'about',
    title: 'Empresa',
    link: '/#empresa',
    fields: [
      field('about.title', 'Título', 'title', 80),
      field('about.text.0', 'Primeiro parágrafo', 'text', 600),
      field('about.text.1', 'Segundo parágrafo', 'text', 600),
      field('about.badge', 'Texto no selo da foto, abaixo do ano', 'line', 40),
      ...each(3, (i) => [
        field(`about.values.${i}.title`, `Valor ${i + 1}`, 'line', 40),
        field(`about.values.${i}.text`, `Valor ${i + 1}: descrição`, 'text', 200),
      ]),
    ],
  },
  {
    id: 'works',
    title: 'Obras',
    link: '/#obras',
    fields: [field('works.title', 'Título', 'title', 80), field('works.intro', 'Texto ao lado do título', 'text', 240)],
  },
  {
    id: 'method',
    title: 'Como trabalhamos',
    link: '/#metodo',
    fields: [
      field('method.title', 'Título', 'title', 80),
      ...each(4, (i) => [field(`method.steps.${i}.title`, `Passo ${i + 1}`, 'line', 40), field(`method.steps.${i}.text`, `Passo ${i + 1}: descrição`, 'text', 220)]),
    ],
  },
  {
    id: 'hiring',
    title: 'Faixa de recrutamento',
    hint: 'A faixa amarela da página inicial que leva às carreiras.',
    link: '/',
    fields: [field('hiring.title', 'Título', 'title', 80), field('hiring.text', 'Texto', 'text', 260)],
  },
  {
    id: 'quote',
    title: 'Orçamento',
    link: '/#orcamento',
    fields: [field('quote.title', 'Título', 'title', 80), field('quote.lead', 'Texto', 'text', 260)],
  },
  {
    id: 'careers',
    title: 'Página de carreiras',
    link: '/carreiras',
    fields: [
      field('careers.title', 'Título do topo', 'title', 80),
      field('careers.lead', 'Texto do topo', 'text', 300),
      field('careers.rolesTitle', 'Título da lista de funções', 'line', 60),
      field('careers.offerTitle', 'Título do quadro escuro', 'line', 60),
      field('careers.offer', 'Itens do quadro escuro', 'lines', 600, 'Um por linha, até 6.'),
      field('careers.applyTitle', 'Título da candidatura', 'title', 80),
      field('careers.applyText', 'Texto da candidatura', 'text', 260),
    ],
  },
  {
    id: 'footer',
    title: 'Rodapé',
    link: '/',
    fields: [field('footer.tagline', 'Frase abaixo do logo', 'line', 100)],
  },
  {
    id: 'google',
    title: 'Google e prévia do link',
    hint: 'Como o site aparece no Google e quando o link é enviado no WhatsApp. O título fica melhor com até 60 letras e a descrição com até 155.',
    fields: [
      field('meta.home.title', 'Página inicial: título', 'line', 70),
      field('meta.home.description', 'Página inicial: descrição', 'text', 170),
      field('meta.careers.title', 'Carreiras: título', 'line', 70),
      field('meta.careers.description', 'Carreiras: descrição', 'text', 170),
    ],
  },
];

const FIELDS = new Map(TEXT_SECTIONS.flatMap((s) => s.fields.map((f) => [f.path, f])));
const MAX_LIST = { tags: 8, lines: 6 };
const ROLE_MAX = 16;

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

// Texto de fábrica no formato do painel (sempre texto simples) e o caminho de volta
function toEditor(v, type) {
  if (type === 'tags') return v.join(', ');
  if (type === 'lines') return v.join('\n');
  return Array.isArray(v) ? v.join(' ') : String(v ?? '');
}

function fromEditor(v, type) {
  if (type === 'tags') return v.split(',').map((t) => t.trim()).filter(Boolean).slice(0, MAX_LIST.tags);
  if (type === 'lines') return v.split('\n').map((t) => t.trim()).filter(Boolean).slice(0, MAX_LIST.lines);
  return v;
}

// Tira caracteres de controlo e espaços a mais; nos itens "um por linha", as quebras de linha ficam
function clean(v, max, keepLines = false) {
  const s = String(v ?? '').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '');
  const out = keepLines
    ? s
        .split('\n')
        .map((l) => l.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join('\n')
    : s.replace(/\s+/g, ' ').trim();
  return out.slice(0, max);
}

export const TEXT_DEFAULTS = Object.fromEntries(
  LANGS.map((l) => [l, Object.fromEntries([...FIELDS.values()].map((f) => [f.path, toEditor(get(STRINGS[l], f.path), f.type)]))]),
);

export const ROLE_DEFAULTS = STRINGS.pt.careers.roles.map((r) => {
  const of = (l, k) => STRINGS[l].careers.roles.find((x) => x.id === r.id)?.[k] || '';
  return { id: r.id, title: Object.fromEntries(LANGS.map((l) => [l, of(l, 'title')])), text: Object.fromEntries(LANGS.map((l) => [l, of(l, 'text')])) };
});

// Guarda só o que difere do texto de fábrica: um campo vazio volta ao de fábrica
export function sanitizeTexts(input) {
  const out = {};
  for (const l of LANGS) {
    const src = input?.[l];
    if (!src || typeof src !== 'object') continue;
    const o = {};
    for (const [path, f] of FIELDS) {
      if (typeof src[path] !== 'string') continue;
      let v = clean(src[path], f.max, f.type === 'lines');
      if (f.type === 'tags' || f.type === 'lines') v = toEditor(fromEditor(v, f.type), f.type);
      if (v && v !== TEXT_DEFAULTS[l][path]) o[path] = v;
    }
    if (Object.keys(o).length) out[l] = o;
  }
  return out;
}

// Funções da página de carreiras; sem alterações (ou sem nenhuma função) ficam as de fábrica
export function sanitizeRoles(list) {
  if (!Array.isArray(list)) return null;
  const ids = new Set(['outro']);
  const out = [];
  for (const r of list.slice(0, ROLE_MAX)) {
    const title = Object.fromEntries(LANGS.map((l) => [l, clean(r?.title?.[l], 60)]));
    const text = Object.fromEntries(LANGS.map((l) => [l, clean(r?.text?.[l], 240)]));
    if (!title.pt) continue;
    // O código da função vai nas candidaturas recebidas: mantém-se o que já tinha, as novas ganham um a partir do nome
    const base =
      String(r?.id || title.pt)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 30) || 'funcao';
    let id = base;
    for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;
    ids.add(id);
    out.push({ id, title, text });
  }
  return out.length && JSON.stringify(out) !== JSON.stringify(ROLE_DEFAULTS) ? out : null;
}

// Textos de uma língua com as alterações do painel por cima. Só copia os ramos que mudam; o resto é o de fábrica.
export function siteStrings(lang, content) {
  const base = STRINGS[lang];
  const over = content?.texts?.[lang];
  const roles = content?.roles;
  if (!over && !roles) return base;
  const s = { ...base };
  const set = (path, value) => {
    const keys = path.split('.');
    let o = s;
    let b = base;
    for (const k of keys.slice(0, -1)) {
      b = b?.[k];
      if (o[k] === b) o[k] = Array.isArray(b) ? [...b] : { ...b };
      o = o[k];
    }
    o[keys.at(-1)] = value;
  };
  for (const [path, v] of Object.entries(over || {})) {
    const f = FIELDS.get(path);
    if (f && typeof v === 'string' && v) set(path, fromEditor(v, f.type));
  }
  if (roles?.length) set('careers.roles', roles.map((r) => ({ id: r.id, title: r.title[lang] || r.title.pt, text: r.text[lang] || r.text.pt })));
  return s;
}
