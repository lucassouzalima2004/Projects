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
     tools/make-frames.sh → assets/frames/kitchen/.
     Enquanto o vídeo não existe, o trecho mostra as fotos de "placeholder".

     length ....... quanto scroll o trecho ocupa, em % da altura da tela
     lead ......... parte do começo em que o vídeo fica parado no 1º quadro
     hold ......... parte do fim em que o vídeo fica parado no último quadro
                    (é quando o ambiente pronto aparece com o título)
     focus ........ opcional, [x, y] de 0 a 1: o que manter na tela quando o
                    celular corta as laterais (padrão: o centro)
     placeholder .. fotos de assets/img/ mostradas enquanto não há vídeo
     beats ........ os títulos que sobem e somem com o scroll:
                    at: [início, fim] de 0 a 1 dentro do trecho
                    title: \n quebra a linha; *palavra* fica em itálico bronze
                    align: 'left' (padrão) ou 'center'
     ------------------------------------------------------------------------- */
  scenes: [
    {
      id: 'living', // 01-living.mp4: da porta fechada até a sala pronta
      label: 'Living',
      length: 320,
      lead: 0.12, // a porta fica fechada enquanto o título de abertura aparece
      placeholder: { photos: ['rooms/foyer.webp', 'rooms/living.webp'] },
      beats: [
        {
          at: [0, 0.13],
          hero: true,
          eyebrow: 'NUVO Woodwork · South Florida',
          title: 'Where wood\nbecomes *art.*',
          text: 'Custom kitchens, closets and millwork for luxury homes, designed in 3D and finished by hand.',
          cue: 'Scroll to come in',
        },
        { at: [0.2, 0.4], eyebrow: 'Foyers & millwork', title: 'First\nimpressions\nare built.' },
        { at: [0.62, 0.97], eyebrow: 'Living rooms & media walls', title: 'Built around\nthe way\nyou live.' },
      ],
    },
    {
      id: 'kitchen', // 02-kitchen.mp4: da sala até a cozinha pronta
      label: 'Kitchen',
      length: 270,
      placeholder: { photos: ['rooms/kitchen.webp', 'work/kitchen.webp'] },
      beats: [{ at: [0.6, 0.97], eyebrow: 'Kitchens', title: 'Cut on CNC.\nFinished\nby hand.' }],
    },
    {
      id: 'closet', // 03-closet.mp4: da cozinha, escada acima, até o closet pronto
      label: 'Closet',
      length: 270,
      placeholder: { photos: ['rooms/closet.webp', 'work/closet.webp'] },
      beats: [{ at: [0.6, 0.97], eyebrow: 'Closets', title: 'A room made\nfor getting\nready.' }],
    },
    {
      id: 'finale', // 04-finale.mp4: do closet até a casa inteira acesa
      label: 'Your home',
      length: 320,
      hold: 0.32,
      placeholder: { photos: ['work/aventura.webp', 'work/bar.webp'] },
      beats: [
        { at: [0.18, 0.5], eyebrow: 'One house, one workshop', title: 'Every room,\none *signature.*' },
        {
          at: [0.66, 1],
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
