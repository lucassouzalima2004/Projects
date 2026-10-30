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
     2. TRECHOS DO FILME
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
     3. FILME EM 3D (versão para comparar: o site com ?3d no fim do endereço)
     -------------------------------------------------------------------------
     Cada ambiente é uma cena 3D feita da imagem dele (tools/make-3d.py →
     assets/3d/). O scroll leva a câmera para dentro; os ambientes com
     build: true se montam em volta de quem chega.

     length ....... quanto scroll o ambiente ocupa, em % da altura da tela
     dolly ........ quanto a câmera entra, em fração da profundidade do ambiente
     pan: false ... no celular em pé, a câmera fica no centro em vez de percorrer
                    o ambiente de um lado ao outro
     beats ........ os títulos: at: [entra, sai] de 0 a 1 dentro do ambiente
     ------------------------------------------------------------------------- */
  tour3d: [
    {
      id: 'door',
      length: 150,
      dolly: 0.25,
      pan: false,
      beats: [
        {
          at: [0, 0.3],
          hero: true,
          eyebrow: 'NUVO Woodwork · South Florida',
          title: 'Where wood\nbecomes *art.*',
          text: 'Custom kitchens, closets and millwork for luxury homes, designed in 3D and finished by hand.',
          cue: 'Scroll to come in',
        },
        { at: [0.4, 0.8], eyebrow: 'Foyers & millwork', title: 'First\nimpressions\nare built.' },
      ],
    },
    {
      id: 'living',
      length: 190,
      dolly: 0.18,
      build: true,
      beats: [{ at: [0.4, 0.8], eyebrow: 'Living rooms & media walls', title: 'Built around\nthe way\nyou live.' }],
    },
    {
      id: 'kitchen',
      length: 210,
      dolly: 0.2,
      build: true,
      beats: [{ at: [0.38, 0.8], eyebrow: 'Kitchens', title: 'Cut on CNC.\nFinished\nby hand.' }],
    },
    {
      id: 'closet',
      length: 190,
      dolly: 0.2,
      build: true,
      beats: [{ at: [0.4, 0.8], eyebrow: 'Closets', title: 'A room made\nfor getting\nready.' }],
    },
    {
      id: 'house',
      length: 240,
      dolly: 0.06,
      pan: false,
      beats: [
        { at: [0.12, 0.48], eyebrow: 'One house, one workshop', title: 'Every room,\none *signature.*' },
        {
          at: [0.56, 1],
          align: 'center',
          eyebrow: 'Free 3D design consultation',
          title: 'Your home\nis *next.*',
          text: 'Tell us about the room. We visit, measure and show you the design in 3D before anything is built.',
          actions: true,
        },
      ],
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
