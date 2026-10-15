// Conteúdo que o cliente edita pelo painel: obras (fotos e vídeos), destaque do topo, números,
// contactos e redes sociais. O que está aqui é o ponto de partida; o painel guarda as alterações no banco.

export const LANGS = ['pt', 'es', 'en', 'fr'];
export const CATEGORIES = ['estrutura', 'obra-nova', 'reabilitacao', 'remodelacao', 'outro'];
export const STATUSES = ['', 'ongoing', 'done'];

// Fotos de 1080 px saem em 480, 800 e 1080; a de 2048 px em 480, 800, 1200 e 1600 (ver tools/make-media.sh)
const photo = (name, sizes, w, h, color) => ({
  kind: 'image',
  img: sizes.map((size) => ({ u: `/assets/img/obras/${name}-${size}.webp`, w: size })),
  w,
  h,
  color,
});
const SQ = [480, 800, 1080];
const clip = (name, w, h, color) => ({
  kind: 'video',
  video: { u: `/assets/video/${name}.mp4`, poster: `/assets/video/${name}.webp` },
  w,
  h,
  color,
});
const t = (pt, es, en, fr) => ({ pt, es, en, fr });

const DEFAULT = {
  v: 1,
  // Fundo do topo da página inicial (foto ou vídeo, em ecrã inteiro). O painel troca por qualquer obra.
  hero: {
    ...photo('fundacoes-grua', [480, 800, 1200, 1600, 2048], 2048, 2048, '#5e5550'),
    focus: '50% 58%',
    title: t('Fundações e contenção periférica', 'Cimentación y contención perimetral', 'Foundations and perimeter retaining walls', 'Fondations et soutènement périphérique'),
    place: '',
  },
  numbers: { clients: 54, professionals: 91, ongoing: 8, founded: 2023 },
  hiring: true,
  contacts: {
    email: 'geral@jesten.pt',
    phones: [
      { country: 'PT', number: '+351 938 972 066' },
      { country: 'ES', number: '+34 642 29 96 85' },
    ],
    whatsapp: '351963430099',
    instagram: 'https://www.instagram.com/jestenconstrucoes',
    facebook: '',
    linkedin: '',
    address: 'Rua de Olivença, 11',
    postal: '3000-306 Coimbra',
    country: 'Portugal',
    maps: 'https://www.google.com/maps/search/?api=1&query=Rua+de+Oliven%C3%A7a+11%2C+3000-306+Coimbra',
  },
  company: { legal: 'Jesus & Buten, Lda', nif: '517737098', alvara: '' },
  works: [
    {
      id: 'laje-sant-cugat',
      ...photo('laje-sant-cugat', SQ, 1080, 1080, '#949084'),
      title: t('Armação e betonagem de laje', 'Armado y hormigonado de losa', 'Slab reinforcement and concrete pour', 'Ferraillage et coulage de dalle'),
      place: 'Sant Cugat del Vallès, Barcelona',
      category: 'estrutura',
      focus: '45% 50%',
    },
    {
      id: 'barcelona-lajes',
      ...clip('estrutura-barcelona', 512, 640, '#a29276'),
      title: t('Lajes e vigas em execução', 'Losas y vigas en ejecución', 'Slabs and beams under construction', 'Dalles et poutres en cours'),
      place: 'Barcelona, Espanha',
      category: 'estrutura',
    },
    {
      id: 'cofragem-muros',
      ...photo('cofragem-muros', SQ, 1080, 1080, '#8c8b81'),
      title: t('Cofragem de muros', 'Encofrado de muros', 'Wall formwork', 'Coffrage de voiles'),
      category: 'estrutura',
      focus: '60% 50%',
    },
    {
      id: 'armadura-fundacao',
      ...photo('armadura-fundacao', SQ, 1080, 1080, '#717258'),
      title: t('Armaduras de fundação', 'Armaduras de cimentación', 'Foundation reinforcement', 'Armatures de fondation'),
      category: 'estrutura',
      focus: '55% 50%',
    },
    {
      id: 'betonagem-laje',
      ...clip('betonagem-laje', 576, 720, '#8b8a80'),
      title: t('Betonagem de laje', 'Hormigonado de losa', 'Concrete pour on a slab', 'Coulage de dalle'),
      category: 'estrutura',
    },
    {
      id: 'fundacoes-grua',
      ...photo('fundacoes-grua', [480, 800, 1200, 1600], 2048, 2048, '#8b796f'),
      title: t('Fundações e contenção periférica', 'Cimentación y contención perimetral', 'Foundations and perimeter retaining walls', 'Fondations et soutènement périphérique'),
      category: 'obra-nova',
      focus: '50% 60%',
    },
    {
      id: 'cofragem-pilar',
      ...photo('cofragem-pilar', SQ, 1080, 1080, '#86847e'),
      title: t('Cofragem de pilares', 'Encofrado de pilares', 'Column formwork', 'Coffrage de poteaux'),
      place: 'Catalunha, Espanha',
      category: 'estrutura',
      focus: '62% 50%',
    },
    {
      id: 'pilares-catalunha',
      ...photo('pilares-catalunha', SQ, 1080, 1080, '#aaa295'),
      title: t('Arranques de pilares', 'Arranques de pilares', 'Column starter bars', 'Amorces de poteaux'),
      place: 'Catalunha, Espanha',
      category: 'estrutura',
    },
    {
      id: 'fundacoes-muros',
      ...clip('fundacoes-muros', 576, 720, '#9a948a'),
      title: t('Escavação e muros de contenção', 'Excavación y muros de contención', 'Excavation and retaining walls', 'Terrassement et murs de soutènement'),
      category: 'obra-nova',
    },
    {
      id: 'escavacao-grua',
      ...photo('escavacao-grua', SQ, 1080, 1080, '#9b9a94'),
      title: t('Escavação e fundações', 'Excavación y cimentación', 'Excavation and foundations', 'Terrassement et fondations'),
      category: 'obra-nova',
      focus: '40% 50%',
    },
    {
      id: 'escoras-estaleiro',
      ...photo('escoras-estaleiro', SQ, 1080, 1080, '#82857c'),
      title: t('Escoramento para lajes', 'Puntales para losas', 'Shoring for slabs', 'Étaiement des dalles'),
      category: 'estrutura',
      focus: '45% 50%',
    },
  ],
};

export function defaultContent() {
  return mergeContent(structuredClone(DEFAULT), 0);
}

// Completa o que foi guardado com os valores de fábrica (para campos novos de versões futuras do site)
export function mergeContent(saved, updated) {
  const base = structuredClone(DEFAULT);
  const s = saved && typeof saved === 'object' ? saved : {};
  const out = {
    ...base,
    ...s,
    numbers: { ...base.numbers, ...(s.numbers || {}) },
    contacts: { ...base.contacts, ...(s.contacts || {}) },
    company: { ...base.company, ...(s.company || {}) },
    hero: s.hero && (s.hero.img || s.hero.video) ? s.hero : base.hero,
    works: Array.isArray(s.works) ? s.works : base.works,
    updated: updated || 0,
  };
  out.works = out.works.map((w) => ({ visible: true, place: '', date: '', status: '', focus: '', category: 'estrutura', ...w }));
  return out;
}

// ---------- Limpeza do que vem do painel ----------

const str = (v, max) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
const int = (v, min, max, fallback) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
};
const httpsUrl = (v) => {
  const s = str(v, 300);
  if (!s) return '';
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '';
  } catch {
    return '';
  }
};
const MEDIA_URL = /^\/(media\/[a-z0-9]{8,32}|assets\/(img|video)\/[\w./-]{1,120})$/;
const mediaUrl = (v) => {
  const s = str(v, 200);
  return MEDIA_URL.test(s) && !s.includes('..') ? s : '';
};
const i18n = (v, max) => Object.fromEntries(LANGS.map((l) => [l, str(v?.[l], max)]));
const color = (v) => (/^#[0-9a-f]{6}$/i.test(String(v)) ? String(v).toLowerCase() : '#8a877e');
const focus = (v) => (/^\d{1,3}(\.\d+)?% \d{1,3}(\.\d+)?%$/.test(String(v)) ? String(v) : '');

function media(m) {
  const kind = m?.kind === 'video' ? 'video' : 'image';
  const out = { kind, w: int(m?.w, 1, 20000, 1000), h: int(m?.h, 1, 20000, 1000), color: color(m?.color), focus: focus(m?.focus) };
  if (kind === 'video') {
    out.video = { u: mediaUrl(m?.video?.u), poster: mediaUrl(m?.video?.poster) };
    if (!out.video.u) return null;
  } else {
    out.img = (Array.isArray(m?.img) ? m.img : [])
      .slice(0, 6)
      .map((x) => ({ u: mediaUrl(x?.u), w: int(x?.w, 1, 20000, 0) }))
      .filter((x) => x.u && x.w);
    if (!out.img.length) return null;
  }
  return out;
}

export function sanitizeContent(c) {
  const contacts = c?.contacts || {};
  const hero = media(c?.hero);
  return {
    v: 1,
    hero: hero ? { ...hero, title: i18n(c.hero.title, 120), place: str(c.hero.place, 80) } : structuredClone(DEFAULT.hero),
    numbers: {
      clients: int(c?.numbers?.clients, 0, 1_000_000, DEFAULT.numbers.clients),
      professionals: int(c?.numbers?.professionals, 0, 1_000_000, DEFAULT.numbers.professionals),
      ongoing: int(c?.numbers?.ongoing, 0, 100_000, DEFAULT.numbers.ongoing),
      founded: int(c?.numbers?.founded, 1900, 2100, DEFAULT.numbers.founded),
    },
    hiring: c?.hiring !== false,
    contacts: {
      email: /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[a-z]{2,}$/i.test(str(contacts.email, 254)) ? str(contacts.email, 254) : '',
      phones: (Array.isArray(contacts.phones) ? contacts.phones : [])
        .slice(0, 4)
        .map((p) => ({ country: /^[A-Z]{2}$/.test(String(p?.country)) ? p.country : 'PT', number: str(p?.number, 30).replace(/[^\d+ ()-]/g, '') }))
        .filter((p) => /\d{6}/.test(p.number.replace(/\D/g, ''))),
      whatsapp: str(contacts.whatsapp, 20).replace(/\D/g, ''),
      instagram: httpsUrl(contacts.instagram),
      facebook: httpsUrl(contacts.facebook),
      linkedin: httpsUrl(contacts.linkedin),
      address: str(contacts.address, 120),
      postal: str(contacts.postal, 60),
      country: str(contacts.country, 40),
      maps: httpsUrl(contacts.maps),
    },
    company: {
      legal: str(c?.company?.legal, 120),
      nif: str(c?.company?.nif, 20),
      alvara: str(c?.company?.alvara, 60),
    },
    works: (Array.isArray(c?.works) ? c.works : [])
      .slice(0, 300)
      .map((w) => {
        const m = media(w);
        if (!m) return null;
        return {
          id: str(w.id, 40).replace(/[^\w-]/g, '') || `w${Math.random().toString(36).slice(2, 10)}`,
          ...m,
          title: i18n(w.title, 140),
          place: str(w.place, 80),
          date: /^\d{4}-(0[1-9]|1[0-2])$/.test(String(w.date)) ? w.date : '',
          category: CATEGORIES.includes(w.category) ? w.category : 'outro',
          status: STATUSES.includes(w.status) ? w.status : '',
          focus: focus(w.focus),
          visible: w.visible !== false,
        };
      })
      .filter(Boolean),
  };
}

export function mediaIdsIn(content) {
  const ids = new Set();
  const scan = (v) => {
    if (typeof v === 'string') {
      const m = /^\/media\/([a-z0-9]+)/.exec(v);
      if (m) ids.add(m[1]);
    } else if (v && typeof v === 'object') Object.values(v).forEach(scan);
  };
  scan(content);
  return ids;
}
