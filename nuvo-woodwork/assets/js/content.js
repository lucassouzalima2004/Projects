/* =============================================================================
   CONTEÚDO DO "FILME" DA CASA E DO CONTATO
   -----------------------------------------------------------------------------
   • Contato e formulário ............ seção 1
   • Trechos do filme (scroll) ....... seção 2

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
};
