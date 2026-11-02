/* =============================================================================
   CONTEÚDO DO "FILME" DA CASA E DO CONTATO
   -----------------------------------------------------------------------------
   • Contato e formulário ............ seção 1
   • Cenas do topo ................... seção 3
   • Filme em vídeo (?video) ......... seções 2 e 4
   • Visita (?tour) .................. seção 5

   Os textos das outras seções (ambientes, estúdio, processo, depoimentos)
   ficam direto no index.html.

   Dica: mantenha as aspas e as vírgulas no fim de cada linha. Se o filme
   sumir depois de uma edição, quase sempre é uma vírgula faltando aqui.
   ========================================================================== */

window.NUVO = {
  /* ---------------------------------------------------------------------------
     1. CONTATO
     ------------------------------------------------------------------------- */
  contact: {
    phone: '(561) 770-2595',
    tel: '+15617702595',
    email: 'info@nuvowoodwork.com',

    // Endereço que recebe o formulário (Formspree, Web3Forms, Getform...).
    // Vazio = o botão abre o e-mail do cliente com a mensagem pronta para info@.
    formEndpoint: '',
  },

  /* ---------------------------------------------------------------------------
     4. TRECHOS DO FILME EM VÍDEO (a versão antiga, em ?video)
     -------------------------------------------------------------------------
     Um voo só, da porta da casa até a casa inteira acesa, feito de 4 vídeos
     encadeados (o último quadro de um é o primeiro do próximo; veja PROMPTS.md).
     Cada trecho usa o vídeo de mesmo id: videos/02-kitchen.mp4 →
     tools/make-videos.sh → assets/video/kitchen.mp4.

     pace ......... velocidade do filme: quanto scroll (em % da altura da tela)
                    vale 1 segundo de vídeo, em média. Maior = mais lento.
                    As partes com mais movimento ganham mais scroll e as partes
                    paradas passam depressa, para o vídeo nunca parecer travado.

     Em cada trecho (todos os tempos em segundos do vídeo):
     lead ......... quanto o 1º quadro fica parado antes do vídeo andar
     hold ......... quanto o último quadro (o ambiente pronto) fica parado no fim
     stills ....... o 1º e o último quadro do vídeo, em assets/img/. Aparecem
                    enquanto o vídeo carrega (e no lugar dele, se não carregar)
     beats ........ os títulos que sobem e somem com o scroll:
                    time: [entra, sai] em segundos do vídeo. Negativo = antes do
                    vídeo andar (durante o lead); sem o "sai" = até o fim do trecho
                    title: \n quebra a linha; *palavra* fica em itálico dourado
                    align: 'left' (padrão) ou 'center'
     ------------------------------------------------------------------------- */
  tour: {
    pace: 24,
  },

  /* ---------------------------------------------------------------------------
     3. AS CENAS DO TOPO (chapters.js)
     -------------------------------------------------------------------------
     Cada cena ocupa a tela inteira. Uma pequena rolada leva à próxima, numa
     transição com parallax. Na última, a rolagem segue para o resto do site.

     image ........ a foto da cena, em assets/img/ (larga, 16:9, com 2752 px de
                    largura e uma cópia com 1376 px terminada em -1376; ver
                    tools/make-scenes.sh)
     tall ......... opcional: a versão em pé (9:16) para o celular
     focus ........ [x, y] de 0 a 1: o ponto da foto que fica no meio da tela
                    quando ela corta a foto (padrão: o centro). No celular em pé a
                    câmera passeia devagar em volta dele.
     card ......... opcional: uma foto de projeto real da Nuvo que flutua na cena
     eyebrow ...... a linha pequena em cima do título
     title ........ \n quebra a linha; *palavra* fica em itálico dourado
     text, cue .... opcionais: um parágrafo e o aviso para rolar
     actions ...... true: os botões de contato
     align ........ 'left' (padrão) ou 'center'
     ------------------------------------------------------------------------- */
  chapters: [
    {
      id: 'door',
      label: 'Entrance',
      image: 'scenes/door.webp',
      focus: [0.5, 0.6],
      eyebrow: 'NUVO Woodwork · South Florida',
      title: 'Where wood\nbecomes *art.*',
      text: 'Custom kitchens, closets and millwork for luxury homes, designed in 3D and finished by hand.',
      cue: 'Scroll to come in',
    },
    {
      id: 'living',
      label: 'Living',
      image: 'scenes/living.webp',
      focus: [0.7, 0.5],
      eyebrow: 'Living rooms & media walls',
      title: 'Built around\nthe way\nyou live.',
      card: { image: 'work/entertainment.webp', caption: 'A NUVO media wall' },
    },
    {
      id: 'kitchen',
      label: 'Kitchen',
      image: 'scenes/kitchen.webp',
      focus: [0.55, 0.55],
      eyebrow: 'Kitchens',
      title: 'Cut on CNC.\nFinished\nby hand.',
      card: { image: 'work/kitchen.webp', caption: 'Camino Real Signature House' },
    },
    {
      id: 'closet',
      label: 'Closet',
      image: 'scenes/closet.webp',
      focus: [0.5, 0.55],
      eyebrow: 'Closets',
      title: 'A room made\nfor getting\nready.',
      card: { image: 'work/closet.webp', caption: 'A NUVO walk-in closet' },
    },
    {
      id: 'house',
      label: 'Your home',
      image: 'scenes/house.webp',
      focus: [0.5, 0.5],
      align: 'center',
      eyebrow: 'Free 3D design consultation',
      title: 'Your home\nis *next.*',
      text: 'Tell us about the room. We visit, measure and show you the design in 3D before anything is built.',
      actions: true,
      cue: 'Keep scrolling to see our work',
    },
  ],

  scenes: [
    {
      id: 'living', // 01-living.mp4: da porta fechada até a sala pronta
      label: 'Living',
      lead: 0.3,
      hold: 0.6,
      stills: ['keys/door.webp', 'keys/living.webp'],
      beats: [
        {
          time: [-0.3, 0.9],
          hero: true,
          eyebrow: 'NUVO Woodwork · South Florida',
          title: 'Where wood\nbecomes *art.*',
          text: 'Custom kitchens, closets and millwork for luxury homes, designed in 3D and finished by hand.',
          cue: 'Scroll to come in',
        },
        { time: [1.3, 3.5], eyebrow: 'Foyers & millwork', title: 'First\nimpressions\nare built.' },
        { time: [5.6], eyebrow: 'Living rooms & media walls', title: 'Built around\nthe way\nyou live.' },
      ],
    },
    {
      id: 'kitchen', // 02-kitchen.mp4: da sala até a cozinha pronta
      label: 'Kitchen',
      hold: 0.6,
      stills: ['keys/living.webp', 'keys/kitchen.webp'],
      beats: [{ time: [4.2], eyebrow: 'Kitchens', title: 'Cut on CNC.\nFinished\nby hand.' }],
    },
    {
      id: 'closet', // 03-closet.mp4: da cozinha, escada acima, até o closet pronto
      label: 'Closet',
      hold: 0.6,
      stills: ['keys/kitchen.webp', 'keys/closet.webp'],
      beats: [{ time: [6.1], eyebrow: 'Closets', title: 'A room made\nfor getting\nready.' }],
    },
    {
      id: 'finale', // 04-finale.mp4: do closet até a casa inteira acesa
      label: 'Your home',
      hold: 3.2,
      stills: ['keys/closet.webp', 'keys/house.webp'],
      beats: [
        { time: [1.8, 4.9], eyebrow: 'One house, one workshop', title: 'Every room,\none *signature.*' },
        {
          time: [5.2],
          align: 'center',
          eyebrow: 'Free 3D design consultation',
          title: 'Your home\nis *next.*',
          text: 'Tell us about the room. We visit, measure and show you the design in 3D before anything is built.',
          actions: true,
        },
      ],
    },
  ],

  /* ---------------------------------------------------------------------------
     5. A VISITA (tour.js, em ?tour)
     -------------------------------------------------------------------------
     A câmera para em cada ambiente; uma rolada toca o mini vídeo inteiro até o
     próximo (rolando para cima, o mesmo vídeo de trás para frente). Também há
     etiquetas em cima das passagens, como no reel, e o link de voltar no canto.

     order ........ a ordem dos ambientes na rolada
     tall ......... true: tudo tem versão em pé (fotos tall e vídeos -tall), e o
                    celular em pé usa elas
     stops ........ os ambientes onde a câmera para
       image ...... a foto deitada do ambiente, em assets/img/ (igual ao último
                    quadro do vídeo que chega nele)
       tall ....... a foto em pé (igual ao último quadro do vídeo em pé)
       focus ...... [x, y] de 0 a 1: o ponto da foto deitada que fica no meio
                    da tela quando ela corta a foto
       pins ....... as etiquetas: to (para onde vai), label e at: [x, y], de 0
                    a 1 na foto (0,0 = canto de cima à esquerda)
       back ....... o link de voltar no canto: { to, label }
       cue ........ opcional: o aviso para rolar
     moves ........ os mini vídeos de um ambiente para outro, em assets/video/
                    (tools/make-tour-videos.sh): <video>.mp4 no computador e
                    <video>-tall.mp4 no celular em pé
       reverse .... true: existe o mesmo vídeo de trás para frente
                    (<video>-rev.mp4 e <video>-tall-rev.mp4), e voltar faz o
                    caminho voando. Sem ele, voltar é uma fusão entre as fotos.
       start, end . opcionais: o trecho do vídeo (em segundos)
       rate ....... opcional: velocidade (1 = normal)
     Sem um vídeo entre dois ambientes, a troca é a fusão também.

     A casa da visita é um projeto real da Nuvo (fotos que o Guilherme mandou em
     31/10, "EDITADAS.rar"). O computador e o celular usam fotos diferentes do
     mesmo cômodo: deitadas no computador e em pé no celular (a suíte é o quarto
     no computador e o closet no celular). Os mini vídeos são do Google Flow
     (Veo 3.1, primeiro e último quadro = as fotos); prompts no PROMPTS.md.
     ------------------------------------------------------------------------- */
  visit: {
    start: 'foyer',
    order: ['foyer', 'living', 'bar', 'kitchen', 'bath', 'closet'],
    tall: true,
    stops: [
      {
        id: 'foyer',
        label: 'Entrance',
        image: 'scenes/real-foyer.webp',
        tall: 'scenes/real-foyer-tall.webp',
        focus: [0.5, 0.5],
        eyebrow: 'NUVO Woodwork · South Florida',
        title: 'Where wood\nbecomes *art.*',
        text: 'A real NUVO home: the floating walnut stair, the slat wall and every cabinet you are about to see came out of our shop.',
        cue: 'Scroll to come in',
        pins: [{ to: 'living', label: 'Living room', at: [0.8, 0.42] }],
      },
      {
        id: 'living',
        label: 'Living room',
        image: 'scenes/real-living.webp',
        tall: 'scenes/real-living-tall.webp',
        focus: [0.5, 0.45],
        eyebrow: 'Living rooms & media walls',
        title: 'Built around\nthe way you live.',
        text: 'Walnut niches with hidden lighting, a stone-clad TV wall and a floating console, built to measure.',
        pins: [{ to: 'bar', label: 'Bar', at: [0.08, 0.42] }],
        back: { to: 'foyer', label: 'Back to the entrance' },
      },
      {
        id: 'bar',
        label: 'Bar',
        image: 'scenes/real-bar.webp',
        tall: 'scenes/real-bar-tall.webp',
        focus: [0.5, 0.45],
        eyebrow: 'Bars & entertaining',
        title: 'The room\neveryone *ends up in.*',
        text: 'A backlit agate wall framed in walnut, glass shelving and a slatted walnut bar front.',
        pins: [{ to: 'kitchen', label: 'Kitchen', at: [0.86, 0.45] }],
        back: { to: 'living', label: 'Back to the living room' },
      },
      {
        id: 'kitchen',
        label: 'Kitchen',
        image: 'scenes/real-kitchen.webp',
        tall: 'scenes/real-kitchen-tall.webp',
        focus: [0.5, 0.55],
        eyebrow: 'Kitchens',
        title: 'Cut on CNC.\nFinished by hand.',
        text: 'Walnut islands, black glass tall cabinets and lit floating shelves, all from the same workshop.',
        pins: [{ to: 'bath', label: 'Primary bath', at: [0.12, 0.4] }],
        back: { to: 'bar', label: 'Back to the bar' },
      },
      {
        id: 'bath',
        label: 'Primary bath',
        image: 'scenes/real-bath.webp',
        tall: 'scenes/real-bath-tall.webp',
        focus: [0.55, 0.5],
        eyebrow: 'Bathrooms',
        title: 'Quiet luxury,\n*lit from below.*',
        text: 'Floating walnut vanities with matte black fronts and a warm glow along the floor.',
        pins: [{ to: 'closet', label: 'Primary suite', at: [0.36, 0.48] }],
        back: { to: 'kitchen', label: 'Back to the kitchen' },
      },
      {
        // no computador é o quarto; no celular, o closet (id "closet" para o índice de ambientes)
        id: 'closet',
        label: 'Primary suite',
        image: 'scenes/real-suite.webp',
        tall: 'scenes/real-suite-tall.webp',
        focus: [0.5, 0.5],
        eyebrow: 'Free 3D design consultation',
        title: 'Your home\nis *next.*',
        text: 'Tell us about the room. We visit, measure and show you the design in 3D before anything is built.',
        actions: true,
        cue: 'Keep scrolling to see our work',
        pins: [{ to: 'foyer', label: 'Start the tour again', at: [0.5, 0.22] }],
        back: { to: 'bath', label: 'Back to the bath' },
      },
    ],
    moves: [
      { from: 'foyer', to: 'living', video: 'foyer-living', reverse: true },
      { from: 'living', to: 'bar', video: 'living-bar', reverse: true },
      { from: 'bar', to: 'kitchen', video: 'bar-kitchen', reverse: true },
      { from: 'kitchen', to: 'bath', video: 'kitchen-bath', reverse: true },
      { from: 'bath', to: 'closet', video: 'bath-suite', reverse: true },
    ],
  },
};
