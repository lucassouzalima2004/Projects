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
     4. O FILME (o topo do site: film.js)
     -------------------------------------------------------------------------
     Uma caminhada só pela casa real da Nuvo (as fotos do Guilherme), da entrada
     até a suíte, feita de 5 vídeos do Google Flow encadeados: cada vídeo começa
     na foto de um cômodo e termina na do próximo, então o último quadro de um é
     o primeiro do seguinte (veja PROMPTS.md). Cada trecho usa o vídeo de mesmo
     id: videos/02-bar.mp4 (e 02-bar-mobile.mp4, a versão em pé) →
     tools/make-videos.sh → assets/video/bar.mp4 e bar.tall.mp4.

     glide ........ uma rolada leva a câmera sozinha até o próximo cômodo, numa
                    curva macia, em uns tantos segundos (um cômodo, contando a
                    saída e a chegada). 0 = o scroll anda o vídeo direto, quadro a
                    quadro (o mesmo que ?scrub no endereço).
     pace ......... velocidade do filme: quanto scroll (em % da altura da tela)
                    vale 1 segundo de vídeo, em média. Maior = mais lento.
                    As partes com mais movimento ganham mais scroll e as partes
                    paradas passam depressa, para o vídeo nunca parecer travado.

     Em cada trecho (todos os tempos em segundos do vídeo):
     lead ......... quanto o 1º quadro fica parado antes do vídeo andar
     hold ......... quanto o último quadro (o ambiente pronto) fica parado no fim
     stills ....... o 1º e o último quadro do vídeo, em assets/img/. Aparecem
                    enquanto o vídeo carrega (e no lugar dele, se não carregar)
     tall ......... as mesmas duas fotos em pé (9:16), para o celular em pé
     from ......... opcional: o cômodo de onde o trecho sai; o link do índice de
                    ambientes para esse cômodo leva ao começo do trecho
     beats ........ os títulos que sobem e somem com o scroll:
                    time: [entra, sai] em segundos do vídeo. Negativo = antes do
                    vídeo andar (durante o lead); sem o "sai" = até o fim do trecho
                    title: \n quebra a linha; *palavra* fica em itálico dourado
                    align: 'left' (padrão) ou 'center'
     ------------------------------------------------------------------------- */
  tour: {
    pace: 24,
    glide: 3.0,
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
      id: 'living', // 01-living.mp4: da entrada, passando pela escada flutuante, até a sala
      from: 'foyer', // o cômodo de onde o trecho sai (o índice de ambientes leva ao começo dele)
      label: 'Living room',
      lead: 0.8,
      hold: 1.2,
      stills: ['scenes/real-foyer.webp', 'scenes/real-living.webp'],
      tall: ['scenes/real-foyer-tall.webp', 'scenes/real-living-tall.webp'],
      beats: [
        {
          time: [-0.8, 1.0],
          hero: true,
          eyebrow: 'NUVO Woodwork · South Florida',
          title: 'Where wood\nbecomes *art.*',
          text: 'A real NUVO home: the floating walnut stair, the slat wall and every cabinet you are about to see came out of our shop.',
          cue: 'Scroll to come in',
        },
        { time: [1.6, 4.0], eyebrow: 'Foyers & stairs', title: 'First\nimpressions\nare built.' },
        {
          time: [6.0],
          eyebrow: 'Living rooms & media walls',
          title: 'Built around\nthe way\nyou live.',
          text: 'Walnut niches with hidden lighting, a stone-clad TV wall and a floating console, built to measure.',
        },
      ],
    },
    {
      id: 'bar', // 02-bar.mp4: da sala até o bar de ágata
      label: 'Bar',
      hold: 1.2,
      stills: ['scenes/real-living.webp', 'scenes/real-bar.webp'],
      tall: ['scenes/real-living-tall.webp', 'scenes/real-bar-tall.webp'],
      beats: [
        {
          time: [6.0],
          eyebrow: 'Bars & entertaining',
          title: 'The room\neveryone\n*ends up in.*',
          text: 'A backlit agate wall framed in walnut, glass shelving and a slatted walnut bar front.',
        },
      ],
    },
    {
      id: 'kitchen', // 03-kitchen.mp4: do bar até a cozinha
      label: 'Kitchen',
      hold: 1.2,
      stills: ['scenes/real-bar.webp', 'scenes/real-kitchen.webp'],
      tall: ['scenes/real-bar-tall.webp', 'scenes/real-kitchen-tall.webp'],
      beats: [
        {
          time: [6.0],
          eyebrow: 'Kitchens',
          title: 'Cut on CNC.\nFinished\nby hand.',
          text: 'Walnut islands, black glass tall cabinets and lit floating shelves, all from the same workshop.',
        },
      ],
    },
    {
      id: 'bath', // 04-bath.mp4: da cozinha, pelo corredor, até o banheiro
      label: 'Primary bath',
      hold: 1.2,
      stills: ['scenes/real-kitchen.webp', 'scenes/real-bath.webp'],
      tall: ['scenes/real-kitchen-tall.webp', 'scenes/real-bath-tall.webp'],
      beats: [
        {
          time: [6.0],
          eyebrow: 'Bathrooms',
          title: 'Quiet luxury,\n*lit from below.*',
          text: 'Floating walnut vanities with matte black fronts and a warm glow along the floor.',
        },
      ],
    },
    {
      // 05-closet.mp4: do banheiro até a suíte (no computador o quarto, no celular o closet).
      // O id é "closet" para a linha Closets do índice de ambientes chegar aqui.
      id: 'closet',
      label: 'Primary suite',
      hold: 3.0,
      stills: ['scenes/real-bath.webp', 'scenes/real-suite.webp'],
      tall: ['scenes/real-bath-tall.webp', 'scenes/real-suite-tall.webp'],
      beats: [
        { time: [1.6, 4.4], eyebrow: 'One house, one workshop', title: 'Every room,\none *signature.*' },
        {
          time: [5.8],
          eyebrow: 'Free 3D design consultation',
          title: 'Your home\nis *next.*',
          text: 'Tell us about the room. We visit, measure and show you the design in 3D before anything is built.',
          actions: true,
          cue: 'Keep scrolling to see our work',
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
