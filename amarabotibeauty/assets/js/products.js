/* =============================================================================
   PRODUTOS DA VITRINE
   -----------------------------------------------------------------------------
   ATENÇÃO: lista e preços de EXEMPLO (base: oboticario.pt, out/2026).
   Troque pelos produtos, preços e quantidades reais da loja.
   Se a planilha do Google estiver ligada (sheetCsv em content.js), ela manda
   e esta lista só aparece se a planilha não carregar.

   id ........ nome único, sem espaço nem acento (vai no link e na sacola)
   cat ....... categoria (precisa existir em "categories" no content.js)
   line ...... linha do Boticário (Lily, Malbec, Nativa SPA…)
   name ...... nome do produto: { pt: '...', it: '...' } ou só '...' se for igual
   size ...... tamanho (75 ml, 200 g…)
   price ..... preço em euro (número com ponto: 37.40)
   stock ..... quantidade em estoque. 0 = esgotado (aparece "Avise-me")
   family .... opcional, família do perfume
   desc ...... opcional, descrição curta
   featured .. true = aparece em "Mais amados"
   isNew ..... true = selo "Novo"
   photo ..... opcional, foto do produto (arquivo em assets/img/produtos/ ou link
               completo). Sem foto, o site desenha o frasco na cor do produto.
   color ..... cor do desenho (sem foto)
   shape ..... desenho: round, square, tall, pump, flip, tube, jar, pot, spray,
               dropper, gloss, compact, mascara, box
   label ..... texto curto no rótulo do desenho (se não tiver, usa a linha)
   ========================================================================== */

window.PRODUCTS = [
  /* ---------------------------------------------------------------- Perfumes */
  {
    id: 'lily-edp', cat: 'perfumes', line: 'Lily', size: '75 ml', price: 64.90, stock: 4,
    name: 'Lily Eau de Parfum',
    family: { pt: 'Floral', it: 'Floreale' },
    desc: {
      pt: 'O floral mais elegante do Boticário, com o lírio como estrela. Sofisticado do dia à noite.',
      it: 'Il floreale più elegante di O Boticário, con il giglio protagonista. Raffinato dal giorno alla sera.',
    },
    featured: true, color: '#EBC3B0', shape: 'round',
  },
  {
    id: 'floratta-rose-sucree-edp', cat: 'perfumes', line: 'Floratta', size: '75 ml', price: 37.40, stock: 6,
    name: 'Floratta Rose Sucrèe Eau de Parfum',
    family: { pt: 'Floral adocicado', it: 'Floreale dolce' },
    desc: {
      pt: 'Rosas com um toque doce e delicado. Romântico, feminino e fácil de amar.',
      it: 'Rose con un tocco dolce e delicato. Romantico, femminile e facile da amare.',
    },
    featured: true, isNew: true, color: '#F0A7B4', shape: 'tall', label: 'Floratta',
  },
  {
    id: 'liz-vanilla-edt', cat: 'perfumes', line: 'Liz', size: '100 ml', price: 34.99, stock: 2,
    name: 'Liz Vanilla Eau de Toilette',
    family: { pt: 'Floral baunilhado', it: 'Floreale vanigliato' },
    desc: {
      pt: 'A delicadeza de Liz com o aconchego da baunilha.',
      it: 'La delicatezza di Liz con il calore della vaniglia.',
    },
    isNew: true, color: '#E9D2A4', shape: 'square',
  },
  {
    id: 'egeo-dolce', cat: 'perfumes', line: 'Egeo', size: '90 ml', price: 32.99, stock: 0,
    name: { pt: 'Egeo Dolce Desodorante Colônia', it: 'Egeo Dolce Eau de Cologne' },
    family: { pt: 'Gourmand', it: 'Gourmand' },
    desc: {
      pt: 'Doce, divertido e marcante. Para quem ama perfumes gourmand.',
      it: 'Dolce, divertente e deciso. Per chi ama i profumi gourmand.',
    },
    color: '#E8587A', shape: 'tall',
  },
  {
    id: 'aura-edp', cat: 'perfumes', line: 'Aura', size: '75 ml', price: 50.00, stock: 3,
    name: 'Aura Eau de Parfum',
    desc: {
      pt: 'O perfume da linha Aura by Helena Coelho. Luminoso e envolvente.',
      it: 'Il profumo della linea Aura by Helena Coelho. Luminoso e avvolgente.',
    },
    isNew: true, color: '#E6B2A0', shape: 'round',
  },

  /* --------------------------------------------------------------- Masculino */
  {
    id: 'malbec-edt', cat: 'masculino', line: 'Malbec', size: '100 ml', price: 49.90, stock: 5,
    name: 'Malbec Eau de Toilette',
    family: { pt: 'Amadeirado', it: 'Legnoso' },
    desc: {
      pt: 'O clássico masculino do Boticário, com álcool vínico envelhecido em barris de carvalho.',
      it: 'Il classico maschile di O Boticário, con alcol di vino invecchiato in botti di rovere.',
    },
    featured: true, color: '#5E1B2C', shape: 'square',
  },
  {
    id: 'malbec-black-legend-edt', cat: 'masculino', line: 'Malbec', size: '100 ml', price: 37.40, stock: 3,
    name: 'Malbec Black Legend Eau de Toilette',
    family: { pt: 'Amadeirado intenso', it: 'Legnoso intenso' },
    desc: {
      pt: 'A versão mais intensa e misteriosa de Malbec.',
      it: 'La versione più intensa e misteriosa di Malbec.',
    },
    isNew: true, color: '#1F1A1E', shape: 'square', label: 'Black',
  },
  {
    id: 'zaad-edp', cat: 'masculino', line: 'Zaad', size: '95 ml', price: 64.90, stock: 1,
    name: 'Zaad Eau de Parfum',
    family: { pt: 'Amadeirado aromático', it: 'Legnoso aromatico' },
    desc: {
      pt: 'Marcante e sofisticado, para ocasiões especiais.',
      it: 'Deciso e sofisticato, per le occasioni speciali.',
    },
    color: '#2C4766', shape: 'tall',
  },
  {
    id: 'malbec-black-legend-deo', cat: 'masculino', line: 'Malbec', size: '125 ml', price: 9.99, stock: 8,
    name: { pt: 'Malbec Black Legend Desodorante Spray', it: 'Malbec Black Legend Deodorante Spray' },
    color: '#1F1A1E', shape: 'spray', label: 'Malbec',
  },
  {
    id: 'malbec-black-legend-locao', cat: 'masculino', line: 'Malbec', size: '200 ml', price: 12.99, stock: 0,
    name: { pt: 'Malbec Black Legend Loção Hidratante Corporal', it: 'Malbec Black Legend Lozione Corpo Idratante' },
    color: '#1F1A1E', shape: 'flip', label: 'Malbec',
  },

  /* ------------------------------------------------------------ Corpo & banho */
  {
    id: 'nativa-ameixa-negra-locao', cat: 'corpo', line: 'Nativa SPA', size: '400 ml', price: 21.99, stock: 7,
    name: { pt: 'Nativa SPA Ameixa Negra Loção Hidratante', it: 'Nativa SPA Prugna Nera Lozione Idratante' },
    desc: {
      pt: 'Hidratação prolongada com a fragrância envolvente da ameixa negra. Um best-seller da marca.',
      it: 'Idratazione prolungata con la fragranza avvolgente della prugna nera. Un best-seller del marchio.',
    },
    featured: true, color: '#5A2742', shape: 'pump', label: 'Nativa',
  },
  {
    id: 'lily-creme', cat: 'corpo', line: 'Lily', size: '250 g', price: 34.99, stock: 2,
    name: { pt: 'Lily Creme Hidratante Acetinado', it: 'Lily Crema Corpo Idratante' },
    desc: {
      pt: 'A fragrância de Lily num creme acetinado que deixa a pele perfumada o dia todo.',
      it: 'La fragranza di Lily in una crema vellutata che profuma la pelle tutto il giorno.',
    },
    color: '#EBC3B0', shape: 'jar',
  },
  {
    id: 'floratta-rose-sucree-creme', cat: 'corpo', line: 'Floratta', size: '200 g', price: 16.99, stock: 5,
    name: { pt: 'Floratta Rose Sucrèe Creme Hidratante', it: 'Floratta Rose Sucrèe Crema Idratante' },
    isNew: true, color: '#F0A7B4', shape: 'jar', label: 'Floratta',
  },
  {
    id: 'cuide-se-bem-deleite', cat: 'corpo', line: 'Cuide-se Bem', size: '400 ml', price: 14.99, stock: 9,
    name: { pt: 'Cuide-se Bem Deleite Loção Hidratante', it: 'Cuide-se Bem Deleite Lozione Idratante' },
    color: '#D9A06B', shape: 'pump', label: 'Deleite',
  },
  {
    id: 'cuide-se-bem-pessegura', cat: 'corpo', line: 'Cuide-se Bem', size: '400 ml', price: 14.99, stock: 4,
    name: { pt: 'Cuide-se Bem Pessegura Loção Hidratante', it: 'Cuide-se Bem Pessegura Lozione Idratante' },
    color: '#F2A783', shape: 'flip', label: 'Pêssego',
  },

  /* ------------------------------------------------------------------ Cabelos */
  {
    id: 'nativa-quinoa-shampoo', cat: 'cabelos', line: 'Nativa SPA', size: '300 ml', price: 12.99, stock: 6,
    name: { pt: 'Nativa SPA Quinoa Shampoo', it: 'Nativa SPA Quinoa Shampoo' },
    color: '#E2C17F', shape: 'flip', label: 'Quinoa',
  },
  {
    id: 'nativa-quinoa-condicionador', cat: 'cabelos', line: 'Nativa SPA', size: '250 ml', price: 12.99, stock: 6,
    name: { pt: 'Nativa SPA Quinoa Condicionador', it: 'Nativa SPA Quinoa Balsamo' },
    color: '#E2C17F', shape: 'tube', label: 'Quinoa',
  },
  {
    id: 'nativa-quinoa-mascara', cat: 'cabelos', line: 'Nativa SPA', size: '250 g', price: 16.99, stock: 0,
    name: { pt: 'Nativa SPA Quinoa Máscara Capilar', it: 'Nativa SPA Quinoa Maschera Capelli' },
    color: '#E2C17F', shape: 'jar', label: 'Quinoa',
  },

  /* -------------------------------------------------------------------- Rosto */
  {
    id: 'botik-acido-hialuronico', cat: 'rosto', line: 'Botik', size: '40 g', price: 32.99, stock: 3,
    name: { pt: 'Botik Creme Facial Ácido Hialurônico', it: 'Botik Crema Viso Acido Ialuronico' },
    desc: {
      pt: 'Hidratação intensa para o rosto, com textura leve.',
      it: 'Idratazione intensa per il viso, dalla texture leggera.',
    },
    color: '#BCD5E6', shape: 'pot',
  },
  {
    id: 'botik-vitamina-c', cat: 'rosto', line: 'Botik', size: '30 ml', price: 29.99, stock: 2,
    name: { pt: 'Botik Sérum Vitamina C', it: 'Botik Siero Vitamina C' },
    color: '#F0B03C', shape: 'dropper',
  },

  /* ---------------------------------------------------------------- Maquiagem */
  {
    id: 'berenice-lip-tint', cat: 'make', line: 'Quem Disse, Berenice?', size: '4 ml', price: 10.99, stock: 10,
    name: 'Creamy Lip Tint Quem Disse, Berenice?',
    isNew: true, color: '#C24461', shape: 'gloss', label: 'QDB',
  },
  {
    id: 'aura-blush', cat: 'make', line: 'Aura', size: '9 g', price: 19.00, stock: 3,
    name: 'Blush Aura by Helena Coelho',
    color: '#E58C83', shape: 'compact',
  },
  {
    id: 'aura-mascara', cat: 'make', line: 'Aura', size: '12 ml', price: 17.00, stock: 5,
    name: { pt: 'Máscara de Cílios Aura by Helena Coelho', it: 'Mascara Aura by Helena Coelho' },
    color: '#1F1A1E', shape: 'mascara',
  },
  {
    id: 'aura-gloss', cat: 'make', line: 'Aura', size: '', price: 16.00, stock: 0,
    name: 'Gloss Boss Aura by Helena Coelho',
    color: '#E9A08F', shape: 'gloss',
  },

  /* --------------------------------------------------------- Kits & presentes */
  {
    id: 'kit-lily', cat: 'kits', line: 'Lily', size: '', price: 68.99, stock: 2,
    name: { pt: 'Kit Presente Lily', it: 'Kit Regalo Lily' },
    desc: {
      pt: 'Produtos da linha Lily numa caixa pronta para presentear.',
      it: 'Prodotti della linea Lily in una confezione pronta da regalare.',
    },
    featured: true, color: '#EBC3B0', shape: 'box',
  },
  {
    id: 'kit-malbec', cat: 'kits', line: 'Malbec', size: '', price: 46.99, stock: 3,
    name: { pt: 'Kit Presente Malbec', it: 'Kit Regalo Malbec' },
    desc: {
      pt: 'O presente certo para ele: Malbec numa caixa elegante.',
      it: 'Il regalo giusto per lui: Malbec in una confezione elegante.',
    },
    color: '#5E1B2C', shape: 'box',
  },
  {
    id: 'kit-floratta', cat: 'kits', line: 'Floratta', size: '', price: 60.99, stock: 1,
    name: { pt: 'Kit Presente Floratta', it: 'Kit Regalo Floratta' },
    color: '#F0A7B4', shape: 'box',
  },
  {
    id: 'kit-nativa-orquidea', cat: 'kits', line: 'Nativa SPA', size: '', price: 49.99, stock: 0,
    name: { pt: 'Kit Nativa SPA Orquídea', it: 'Kit Nativa SPA Orchidea' },
    color: '#A97BBE', shape: 'box',
  },
];
