// Conteúdo que o cliente edita pelo painel: obras (fotos e vídeos), destaque do topo, números,
// contactos e redes sociais. O que está aqui é o ponto de partida; o painel guarda as alterações no banco.

export const LANGS = ['pt', 'es', 'en', 'fr'];
export const CATEGORIES = ['estrutura', 'obra-nova', 'infraestrutura', 'reabilitacao', 'remodelacao', 'outro'];
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
// Fotos do WhatsApp (ver tools/make-gallery.sh): 480, 960 e 1440 px; as verticais até à largura original
const WA = [480, 960, 1440];
const WA_P = [480, 960, 1200];
const wa = (name, color, h = 1080) => photo(name, WA, 1440, h, color);
const waP = (name, color) => photo(name, WA_P, 1200, 1600, color);
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
    // E-mail geral; os pedidos de orçamento têm um e-mail e telefones por país
    email: 'geral@jesten.pt',
    emails: [
      { country: 'PT', email: 'comercial@jesten.pt' },
      { country: 'ES', email: 'ofitec@jesten.pt' },
    ],
    phones: [
      { country: 'PT', number: '+351 938 972 066' },
      { country: 'PT', number: '+351 963 430 099' },
      { country: 'ES', number: '+34 745 065 618' },
      { country: 'ES', number: '+34 642 299 685' },
    ],
    whatsapp: '351963430099',
    instagram: 'https://www.instagram.com/jestenconstrucoes',
    facebook: 'https://www.facebook.com/p/Jesten-PT-ES-61577592785548/',
    linkedin: 'https://www.linkedin.com/in/jesten-constru%C3%A7%C3%B5es-b64a64372/',
    address: 'Rua de Olivença, 11',
    postal: '3000-306 Coimbra',
    country: 'Portugal',
    maps: 'https://www.google.com/maps/search/?api=1&query=Rua+de+Oliven%C3%A7a+11%2C+3000-306+Coimbra',
  },
  company: { legal: 'Jesus & Buten, Lda', nif: '517737098', alvara: '' },
  works: [
    // Sant Cugat del Vallès
    {
      id: 'sc-betonagem',
      ...wa('sc-betonagem', '#a9906f'),
      title: t('Betonagem de laje com bomba', 'Hormigonado de losa con bomba', 'Slab pour with a concrete pump', 'Coulage de dalle à la pompe'),
      place: 'Sant Cugat del Vallès, Barcelona',
      category: 'estrutura',
      group: 'Edifício em Sant Cugat',
      focus: '50% 55%',
    },
    {
      id: 'laje-sant-cugat',
      ...photo('laje-sant-cugat', SQ, 1080, 1080, '#949084'),
      title: t('Armação e betonagem de laje', 'Armado y hormigonado de losa', 'Slab reinforcement and concrete pour', 'Ferraillage et coulage de dalle'),
      place: 'Sant Cugat del Vallès, Barcelona',
      category: 'estrutura',
      group: 'Edifício em Sant Cugat',
      focus: '45% 50%',
    },
    {
      id: 'sc-cofragem',
      ...wa('sc-cofragem', '#a8a39d'),
      title: t('Cofragem de laje', 'Encofrado de losa', 'Slab formwork', 'Coffrage de dalle'),
      place: 'Sant Cugat del Vallès, Barcelona',
      category: 'estrutura',
      group: 'Edifício em Sant Cugat',
    },
    {
      id: 'sc-laje',
      ...wa('sc-laje', '#999897'),
      title: t('Laje betonada', 'Losa hormigonada', 'Slab after the pour', 'Dalle coulée'),
      place: 'Sant Cugat del Vallès, Barcelona',
      category: 'estrutura',
      group: 'Edifício em Sant Cugat',
    },
    {
      id: 'sc-bomba',
      ...clip('sc-bomba', 464, 832, '#9a8670'),
      title: t('Bomba de betão e grua em obra', 'Bomba de hormigón y grúa en obra', 'Concrete pump and crane on site', 'Pompe à béton et grue sur le chantier'),
      place: 'Sant Cugat del Vallès, Barcelona',
      category: 'estrutura',
      group: 'Edifício em Sant Cugat',
    },
    {
      id: 'sc-armadura',
      ...clip('sc-armadura', 480, 640, '#989693'),
      title: t('Laje em betonagem', 'Losa en hormigonado', 'Slab pour in progress', 'Dalle en cours de coulage'),
      place: 'Sant Cugat del Vallès, Barcelona',
      category: 'estrutura',
      group: 'Edifício em Sant Cugat',
    },
    // Depósito circular
    {
      id: 'dep-topo',
      ...wa('dep-topo', '#8b827f', 810),
      title: t('Depósito circular em betão armado', 'Depósito circular de hormigón armado', 'Circular reinforced concrete tank', 'Réservoir circulaire en béton armé'),
      category: 'infraestrutura',
      group: 'Depósito circular',
    },
    {
      id: 'dep-laje',
      ...wa('dep-laje', '#82807e'),
      title: t('Armadura da laje de fundo', 'Armadura de la losa de fondo', 'Base slab reinforcement', 'Ferraillage du radier'),
      category: 'infraestrutura',
      group: 'Depósito circular',
    },
    {
      id: 'dep-laje-arranques',
      ...wa('dep-laje-arranques', '#807e7c'),
      title: t('Laje de fundo e arranques da parede', 'Losa de fondo y esperas del muro', 'Base slab and wall starter bars', 'Radier et attentes du voile'),
      category: 'infraestrutura',
      group: 'Depósito circular',
    },
    {
      id: 'dep-laje-betonada',
      ...wa('dep-laje-betonada', '#b4ada4', 810),
      title: t('Laje betonada com os arranques da parede', 'Losa hormigonada con las esperas del muro', 'Poured slab with the wall starter bars', 'Radier coulé avec les attentes du voile'),
      category: 'infraestrutura',
      group: 'Depósito circular',
    },
    {
      id: 'dep-grua',
      ...wa('dep-grua', '#aaa8a7', 810),
      title: t('Descarga de material com camião grua', 'Descarga de material con camión grúa', 'Unloading materials with a crane truck', 'Déchargement du matériel au camion-grue'),
      category: 'infraestrutura',
      group: 'Depósito circular',
    },
    {
      id: 'dep-armadura',
      ...wa('dep-armadura', '#989da4', 810),
      title: t('Armadura da parede circular', 'Armadura del muro circular', 'Circular wall reinforcement', 'Ferraillage du voile circulaire'),
      category: 'infraestrutura',
      group: 'Depósito circular',
    },
    {
      id: 'dep-cofragem',
      ...wa('dep-cofragem', '#7c8290', 810),
      title: t('Montagem da cofragem', 'Montaje del encofrado', 'Formwork assembly', 'Montage du coffrage'),
      category: 'infraestrutura',
      group: 'Depósito circular',
    },
    {
      id: 'dep-cofragem-parede',
      ...wa('dep-cofragem-parede', '#76706e', 810),
      title: t('Cofragem da parede', 'Encofrado del muro', 'Wall formwork', 'Coffrage du voile'),
      category: 'infraestrutura',
      group: 'Depósito circular',
    },
    {
      id: 'dep-bomba',
      ...wa('dep-bomba', '#6292c9', 810),
      title: t('Betonagem da parede com bomba', 'Hormigonado del muro con bomba', 'Pouring the wall with a pump', 'Coulage du voile à la pompe'),
      category: 'infraestrutura',
      group: 'Depósito circular',
    },
    {
      id: 'dep-betonagem',
      ...wa('dep-betonagem', '#637d9c', 810),
      title: t('Betonagem com bomba e autobetoneira', 'Hormigonado con bomba y camión hormigonera', 'Pour with a pump and a mixer truck', 'Coulage avec pompe et camion toupie'),
      category: 'infraestrutura',
      group: 'Depósito circular',
    },
    {
      id: 'dep-descofrado',
      ...wa('dep-descofrado', '#adaea9', 810),
      title: t('Parede descofrada', 'Muro desencofrado', 'Wall after striking the formwork', 'Voile décoffré'),
      category: 'infraestrutura',
      group: 'Depósito circular',
    },
    {
      id: 'barcelona-lajes',
      ...clip('estrutura-barcelona', 512, 640, '#a29276'),
      title: t('Lajes e vigas em execução', 'Losas y vigas en ejecución', 'Slabs and beams under construction', 'Dalles et poutres en cours'),
      place: 'Barcelona, Espanha',
      category: 'estrutura',
    },
    // Fundação industrial
    {
      id: 'ind-fundacao',
      ...wa('ind-fundacao', '#6f7681'),
      title: t('Fundação industrial', 'Cimentación industrial', 'Industrial foundation', 'Fondation industrielle'),
      category: 'infraestrutura',
      group: 'Fundação industrial',
      focus: '50% 70%',
    },
    {
      id: 'ind-armaduras',
      ...wa('ind-armaduras', '#73767a'),
      title: t('Colocação das armaduras', 'Colocación de las armaduras', 'Placing the reinforcement', 'Mise en place des armatures'),
      category: 'infraestrutura',
      group: 'Fundação industrial',
    },
    {
      id: 'ind-arranques',
      ...wa('ind-arranques', '#69727c'),
      title: t('Laje de fundação com os arranques dos pedestais', 'Losa de cimentación con las esperas de los pedestales', 'Foundation slab with the pedestal starter bars', 'Radier avec les attentes des massifs'),
      category: 'infraestrutura',
      group: 'Fundação industrial',
    },
    {
      id: 'ind-pedestais',
      ...wa('ind-pedestais', '#737170'),
      title: t('Armaduras dos pedestais', 'Armaduras de los pedestales', 'Pedestal reinforcement', 'Armatures des massifs'),
      category: 'infraestrutura',
      group: 'Fundação industrial',
    },
    {
      id: 'ind-armacao',
      ...waP('ind-armacao', '#6b6f6d'),
      title: t('Armação de ferro em obra', 'Ferrallado en obra', 'Rebar fixing on site', 'Ferraillage sur le chantier'),
      category: 'infraestrutura',
      group: 'Fundação industrial',
    },
    {
      id: 'ind-verificacao',
      ...wa('ind-verificacao', '#6b7376'),
      title: t('Verificação das armaduras', 'Revisión de las armaduras', 'Checking the reinforcement', 'Contrôle des armatures'),
      category: 'infraestrutura',
      group: 'Fundação industrial',
    },
    {
      id: 'ind-escoramento',
      ...wa('ind-escoramento', '#667583'),
      title: t('Cofragem lateral escorada', 'Encofrado lateral apuntalado', 'Braced side formwork', 'Coffrage latéral étayé'),
      category: 'infraestrutura',
      group: 'Fundação industrial',
    },
    // Fundações e contenção periférica (a obra do edifício vermelho, a mesma do topo do site)
    {
      id: 'fundacoes-grua',
      ...photo('fundacoes-grua', [480, 800, 1200, 1600], 2048, 2048, '#8b796f'),
      title: t('Fundações e contenção periférica', 'Cimentación y contención perimetral', 'Foundations and perimeter retaining walls', 'Fondations et soutènement périphérique'),
      category: 'obra-nova',
      group: 'Fundações e contenção periférica',
      focus: '50% 60%',
    },
    {
      id: 'frv-terras',
      ...wa('frv-terras', '#878895'),
      title: t('Movimento de terras', 'Movimiento de tierras', 'Earthworks', 'Terrassement'),
      category: 'obra-nova',
      group: 'Fundações e contenção periférica',
    },
    {
      id: 'frv-pilares',
      ...wa('frv-pilares', '#9e9992'),
      title: t('Pilares e cofragens', 'Pilares y encofrados', 'Columns and formwork', 'Poteaux et coffrages'),
      category: 'obra-nova',
      group: 'Fundações e contenção periférica',
    },
    {
      id: 'frv-estrutura',
      ...wa('frv-estrutura', '#9a938a'),
      title: t('Vista geral da obra', 'Vista general de la obra', 'Site overview', "Vue d'ensemble du chantier"),
      category: 'obra-nova',
      group: 'Fundações e contenção periférica',
    },
    {
      id: 'frv-grua',
      ...clip('frv-grua', 480, 640, '#959086'),
      title: t('Grua e estrutura em execução', 'Grúa y estructura en ejecución', 'Crane and structure in progress', 'Grue et structure en cours'),
      category: 'obra-nova',
      group: 'Fundações e contenção periférica',
    },
    {
      id: 'betonagem-vibracao',
      ...clip('betonagem-vibracao', 576, 1024, '#616461'),
      title: t('Betonagem e vibração do betão', 'Hormigonado y vibrado', 'Pouring and vibrating the concrete', 'Coulage et vibration du béton'),
      category: 'estrutura',
    },
    // Posto de abastecimento
    {
      id: 'posto-pavimento',
      ...wa('posto-pavimento', '#939695'),
      title: t('Posto de abastecimento', 'Estación de servicio', 'Fuel service station', 'Station-service'),
      category: 'infraestrutura',
      group: 'Posto de abastecimento',
    },
    {
      id: 'posto-bombas',
      ...wa('posto-bombas', '#9e9c95'),
      title: t('Trabalhos junto às bombas de combustível', 'Trabajos junto a los surtidores', 'Works next to the fuel pumps', 'Travaux près des pompes à carburant'),
      category: 'infraestrutura',
      group: 'Posto de abastecimento',
    },
    {
      id: 'posto-valas',
      ...wa('posto-valas', '#838180'),
      title: t('Valas para tubagens', 'Zanjas para canalizaciones', 'Trenches for ducts', 'Tranchées pour gaines'),
      category: 'infraestrutura',
      group: 'Posto de abastecimento',
    },
    {
      id: 'posto-tubagens',
      ...photo('posto-tubagens', [480, 900], 900, 1600, '#6d6458'),
      title: t('Tubagens enterradas', 'Canalizaciones enterradas', 'Buried ducts', 'Gaines enterrées'),
      category: 'infraestrutura',
      group: 'Posto de abastecimento',
    },
    {
      id: 'posto-fundacoes',
      ...wa('posto-fundacoes', '#7b7b7b'),
      title: t('Escavação para fundações', 'Excavación para cimentaciones', 'Excavation for foundations', 'Fouilles pour fondations'),
      category: 'infraestrutura',
      group: 'Posto de abastecimento',
    },
    {
      id: 'posto-concluido',
      ...wa('posto-concluido', '#8d969d'),
      title: t('Pavimento concluído', 'Pavimento terminado', 'Finished paving', 'Revêtement terminé'),
      category: 'infraestrutura',
      group: 'Posto de abastecimento',
    },
    // Muros altos
    {
      id: 'muros-altos',
      ...wa('muros-altos', '#9c978d'),
      title: t('Cofragem de muros altos', 'Encofrado de muros altos', 'Tall wall formwork', 'Coffrage de voiles hauts'),
      category: 'estrutura',
      group: 'Muros altos',
      focus: '40% 50%',
    },
    {
      id: 'cofragem-muros',
      ...photo('cofragem-muros', SQ, 1080, 1080, '#8c8b81'),
      title: t('Cofragem de muros', 'Encofrado de muros', 'Wall formwork', 'Coffrage de voiles'),
      category: 'estrutura',
      group: 'Muros altos',
      focus: '60% 50%',
    },
    {
      id: 'muros-prontos',
      ...waP('muros-prontos', '#959795'),
      title: t('Muros cofrados, prontos a betonar', 'Muros encofrados, listos para hormigonar', 'Walls formed and ready for the pour', 'Voiles coffrés, prêts au coulage'),
      category: 'estrutura',
      group: 'Muros altos',
    },
    // Remodelação
    {
      id: 'remo-pavimento',
      ...wa('remo-pavimento', '#9e9b8e'),
      title: t('Remodelação de pátio', 'Reforma de patio', 'Patio renovation', "Rénovation d'un patio"),
      category: 'remodelacao',
      group: 'Remodelação de pátio',
      focus: '40% 60%',
    },
    {
      id: 'remo-cobertura',
      ...wa('remo-cobertura', '#968d88'),
      title: t('Substituição da cobertura', 'Sustitución de la cubierta', 'Replacing the roof', 'Remplacement de la couverture'),
      category: 'remodelacao',
      group: 'Remodelação de pátio',
    },
    // Pilares na Catalunha
    {
      id: 'cofragem-pilar',
      ...photo('cofragem-pilar', SQ, 1080, 1080, '#86847e'),
      title: t('Cofragem de pilares', 'Encofrado de pilares', 'Column formwork', 'Coffrage de poteaux'),
      place: 'Catalunha, Espanha',
      category: 'estrutura',
      group: 'Pilares na Catalunha',
      focus: '62% 50%',
    },
    {
      id: 'cat-balde',
      ...waP('cat-balde', '#8c8376'),
      title: t('Betonagem de pilares com balde', 'Hormigonado de pilares con cubilote', 'Pouring columns with a concrete skip', 'Coulage de poteaux à la benne'),
      place: 'Catalunha, Espanha',
      category: 'estrutura',
      group: 'Pilares na Catalunha',
    },
    {
      id: 'pilares-catalunha',
      ...photo('pilares-catalunha', SQ, 1080, 1080, '#aaa295'),
      title: t('Arranques de pilares', 'Arranques de pilares', 'Column starter bars', 'Amorces de poteaux'),
      place: 'Catalunha, Espanha',
      category: 'estrutura',
      group: 'Pilares na Catalunha',
    },
    {
      id: 'betonagem-laje',
      ...clip('betonagem-laje', 576, 720, '#8b8a80'),
      title: t('Betonagem de laje', 'Hormigonado de losa', 'Concrete pour on a slab', 'Coulage de dalle'),
      category: 'estrutura',
    },
    // Fundações junto a talude
    {
      id: 'armadura-fundacao',
      ...photo('armadura-fundacao', SQ, 1080, 1080, '#717258'),
      title: t('Armaduras de fundação', 'Armaduras de cimentación', 'Foundation reinforcement', 'Armatures de fondation'),
      category: 'obra-nova',
      group: 'Fundações junto a talude',
      focus: '55% 50%',
    },
    {
      id: 'tal-obra',
      ...wa('tal-obra', '#9a988d', 810),
      title: t('Fundações junto a um talude rochoso', 'Cimentación junto a un talud rocoso', 'Foundations next to a rock slope', "Fondations au pied d'un talus rocheux"),
      category: 'obra-nova',
      group: 'Fundações junto a talude',
    },
    {
      id: 'tal-cofragem',
      ...wa('tal-cofragem', '#9c7f52', 810),
      title: t('Cofragem de laje', 'Encofrado de losa', 'Slab formwork', 'Coffrage de dalle'),
      category: 'obra-nova',
      group: 'Fundações junto a talude',
    },
    {
      id: 'tal-armacao',
      ...wa('tal-armacao', '#77756c', 810),
      title: t('Armação junto ao talude', 'Ferrallado junto al talud', 'Rebar work at the foot of the slope', 'Ferraillage au pied du talus'),
      category: 'obra-nova',
      group: 'Fundações junto a talude',
    },
    // Fundações em sapatas
    {
      id: 'sap-betonagem',
      ...wa('sap-betonagem', '#9b8566', 810),
      title: t('Betonagem de fundações', 'Hormigonado de cimentaciones', 'Foundation concrete pour', 'Coulage des fondations'),
      category: 'obra-nova',
      group: 'Fundações em sapatas',
      focus: '55% 60%',
    },
    {
      id: 'sap-autobetoneira',
      ...wa('sap-autobetoneira', '#8f8d88', 810),
      title: t('Betão descarregado da autobetoneira', 'Vertido desde el camión hormigonera', 'Pouring straight from the mixer truck', 'Déversement depuis le camion toupie'),
      category: 'obra-nova',
      group: 'Fundações em sapatas',
    },
    {
      id: 'sap-valas',
      ...wa('sap-valas', '#9a795b', 810),
      title: t('Abertura de valas de fundação', 'Apertura de zanjas de cimentación', 'Digging the foundation trenches', 'Ouverture des tranchées de fondation'),
      category: 'obra-nova',
      group: 'Fundações em sapatas',
    },
    // Laje com autobomba
    {
      id: 'bomba-laje',
      ...wa('bomba-laje', '#7c8893', 810),
      title: t('Betonagem de laje com autobomba', 'Hormigonado de losa con autobomba', 'Slab pour with a truck-mounted pump', 'Coulage de dalle au camion-pompe'),
      category: 'estrutura',
      group: 'Laje com autobomba',
    },
    {
      id: 'bomba-nivelamento',
      ...wa('bomba-nivelamento', '#808282', 810),
      title: t('Espalhamento e nivelamento do betão', 'Extendido y nivelado del hormigón', 'Spreading and levelling the concrete', 'Étalement et réglage du béton'),
      category: 'estrutura',
      group: 'Laje com autobomba',
    },
    {
      id: 'fundacoes-muros',
      ...clip('fundacoes-muros', 576, 720, '#9a948a'),
      title: t('Escavação e muros de contenção', 'Excavación y muros de contención', 'Excavation and retaining walls', 'Terrassement et murs de soutènement'),
      category: 'obra-nova',
    },
    // Escavação e fundações
    {
      id: 'escavacao-grua',
      ...photo('escavacao-grua', SQ, 1080, 1080, '#9b9a94'),
      title: t('Escavação e fundações', 'Excavación y cimentación', 'Excavation and foundations', 'Terrassement et fondations'),
      category: 'obra-nova',
      group: 'Escavação e fundações',
      focus: '40% 50%',
    },
    {
      id: 'esc-sapatas',
      ...waP('esc-sapatas', '#9e9f98'),
      title: t('Sapatas e arranques de pilares', 'Zapatas y arranques de pilares', 'Footings and column starter bars', 'Semelles et amorces de poteaux'),
      category: 'obra-nova',
      group: 'Escavação e fundações',
    },
    // Alvenaria de tijolo
    {
      id: 'alv-tijolo',
      ...wa('alv-tijolo', '#9a7d6c', 810),
      title: t('Alvenaria de tijolo', 'Fábrica de ladrillo', 'Brick masonry', 'Maçonnerie en briques'),
      category: 'obra-nova',
      group: 'Alvenaria de tijolo',
      focus: '60% 50%',
    },
    {
      id: 'alv-paredes',
      ...clip('alv-paredes', 848, 480, '#918f95'),
      title: t('Paredes de tijolo e pilares', 'Muros de ladrillo y pilares', 'Brick walls and columns', 'Murs en briques et poteaux'),
      category: 'obra-nova',
      group: 'Alvenaria de tijolo',
    },
    // Paredes de blocos
    {
      id: 'blocos-paredes',
      ...wa('blocos-paredes', '#878885'),
      title: t('Paredes de blocos de betão', 'Muros de bloque de hormigón', 'Concrete block walls', 'Murs en blocs béton'),
      category: 'obra-nova',
      group: 'Paredes de blocos',
      focus: '70% 50%',
    },
    {
      id: 'blocos-obra',
      ...wa('blocos-obra', '#878886'),
      title: t('Vista da obra', 'Vista de la obra', 'Site view', 'Vue du chantier'),
      category: 'obra-nova',
      group: 'Paredes de blocos',
    },
    // Estrutura de edifício
    {
      id: 'pt-estrutura',
      ...wa('pt-estrutura', '#81797c', 1084),
      title: t('Estrutura de edifício', 'Estructura de edificio', 'Building structure', 'Structure de bâtiment'),
      category: 'obra-nova',
      group: 'Estrutura de edifício',
    },
    {
      id: 'pt-laje-inclinada',
      ...wa('pt-laje-inclinada', '#8f8981', 1084),
      title: t('Betonagem de laje inclinada', 'Hormigonado de losa inclinada', 'Pouring a sloped slab', "Coulage d'une dalle inclinée"),
      category: 'obra-nova',
      group: 'Estrutura de edifício',
    },
    {
      id: 'escoramento-laje',
      ...clip('escoramento-laje', 480, 640, '#8f7447'),
      title: t('Escoras sob a cofragem da laje', 'Puntales bajo el encofrado de la losa', 'Props under the slab formwork', 'Étais sous le coffrage de la dalle'),
      category: 'estrutura',
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
  out.works = out.works.map((w) => ({ visible: true, place: '', date: '', status: '', focus: '', category: 'estrutura', group: '', ...w }));
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
const emailOk = (v) => /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[a-z]{2,}$/i.test(str(v, 254));

// Telefones de Portugal e de Espanha sempre em grupos de 3, como pediu o cliente (+351 938 972 066, +34 642 299 685).
// Sem indicativo, usa o do país do quadro; números de outros países ficam como foram escritos.
const DIAL = { PT: '351', ES: '34' };
export function phoneFmt(number, country) {
  const n = String(number).trim();
  let d = n.replace(/\D/g, '');
  let code = '';
  if (/^(\+|00)/.test(n)) {
    if (n.startsWith('00')) d = d.slice(2);
    code = Object.values(DIAL).find((c) => d.startsWith(c) && d.length === c.length + 9) || '';
    d = d.slice(code.length);
  } else if (d.length === 9) code = DIAL[country] || '';
  return code ? `+${code} ${d.replace(/(\d{3})(?=\d)/g, '$1 ')}` : n;
}
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
      email: emailOk(contacts.email) ? str(contacts.email, 254) : '',
      emails: (Array.isArray(contacts.emails) ? contacts.emails : [])
        .slice(0, 6)
        .map((e) => ({ country: /^[A-Z]{2}$/.test(String(e?.country)) ? e.country : 'PT', email: str(e?.email, 254) }))
        .filter((e) => emailOk(e.email)),
      phones: (Array.isArray(contacts.phones) ? contacts.phones : [])
        .slice(0, 8)
        .map((p) => {
          const country = /^[A-Z]{2}$/.test(String(p?.country)) ? p.country : 'PT';
          return { country, number: phoneFmt(str(p?.number, 30).replace(/[^\d+ ()-]/g, ''), country) };
        })
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
          group: str(w.group, 60),
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
