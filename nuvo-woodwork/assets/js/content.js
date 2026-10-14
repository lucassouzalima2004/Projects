/* =============================================================================
   CONTEÚDO DO "FILME" DA CASA E DO CONTATO
   -----------------------------------------------------------------------------
   • Contato e formulário ............ seção 1
   • Cenas do filme (scroll) ......... seção 2

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
     2. CENAS DO FILME
     -------------------------------------------------------------------------
     A ordem aqui é a ordem do scroll. Cada cena usa o vídeo de mesmo id
     (videos/kitchen.mp4 → tools/make-frames.sh → assets/frames/kitchen/).
     Enquanto o vídeo não existe, a cena aparece como desenho técnico que vira
     a foto em "placeholder" (ou a fachada desenhada, nas cenas externas).

     length ....... quanto scroll a cena ocupa, em % da altura da tela
     phases ....... true = mostra "Design · Build · Installed" no canto
     focus ........ opcional, [x, y] de 0 a 1: o que manter na tela quando o
                    celular corta as laterais do vídeo (padrão: o centro)
     placeholder .. { photo: 'kitchen' } usa assets/img/rooms/kitchen.webp
                    (focus aqui vale só para a foto)
                    { house: 'dusk' | 'night' } desenha a fachada
     beats ........ os textos que entram e saem durante a cena:
                    at: [início, fim] de 0 a 1 dentro da cena
                    align: 'left' | 'right' | 'center'
                    *palavra* fica em itálico dourado
     ------------------------------------------------------------------------- */
  scenes: [
    {
      id: 'arrival',
      label: 'Arrival',
      length: 150,
      placeholder: { house: 'dusk' },
      beats: [
        {
          at: [0, 0.34],
          align: 'center',
          hero: true,
          eyebrow: 'NUVO Woodwork · South Florida',
          title: 'Where wood becomes *art.*',
          text: 'Custom kitchens, closets and millwork for luxury homes, designed in 3D and finished by hand.',
          cue: 'Scroll to walk through the house',
        },
        {
          at: [0.46, 0.84],
          eyebrow: 'A house, room by room',
          title: 'Every room starts as a *blank wall.*',
          text: 'Keep scrolling and watch each space come together, the way we design, build and install it for our clients.',
        },
      ],
    },
    {
      id: 'foyer',
      label: 'Foyer',
      length: 135,
      phases: true,
      placeholder: { photo: 'foyer', focus: [0.3, 0.5] },
      beats: [
        {
          eyebrow: '01 — Foyer',
          title: 'First impressions are *built.*',
          text: 'An empty entry is where every project begins: a site visit, a tape measure and a conversation about how you live.',
        },
        {
          align: 'right',
          eyebrow: 'Foyers by NUVO',
          title: 'Paneling, consoles and benches that *welcome you home.*',
          list: ['Wall paneling', 'Console cabinets', 'Storage benches', 'Shoe & coat storage'],
          link: { label: 'Plan your foyer', room: 'Foyer' },
        },
      ],
    },
    {
      id: 'kitchen',
      label: 'Kitchen',
      length: 140,
      phases: true,
      placeholder: { photo: 'kitchen' },
      beats: [
        {
          eyebrow: '02 — Kitchen',
          title: 'The heart of the home, *drawn first.*',
          text: 'We plan cabinetry around how you cook, gather and move, and show it to you in 3D before a single panel is cut.',
        },
        {
          eyebrow: 'Kitchens by NUVO',
          title: 'Cut on CNC. *Finished by hand.*',
          list: ['Full cabinet systems', 'Islands & pantry walls', 'Handleless or raised-panel doors', 'Smart storage'],
          link: { label: 'Plan your kitchen', room: 'Kitchen' },
        },
      ],
    },
    {
      id: 'living',
      label: 'Living',
      length: 135,
      phases: true,
      placeholder: { photo: 'living', focus: [0.72, 0.5] },
      beats: [
        {
          align: 'right',
          eyebrow: '03 — Entertainment',
          title: 'A wall that *disappears* into the room.',
          text: 'Screens, speakers and cables are planned before the wall is closed, so nothing shows but the wood.',
        },
        {
          eyebrow: 'Media walls & bars by NUVO',
          title: 'Wired, lit and *made to measure.*',
          list: ['TV wall units', 'Backlit display niches', 'Wet bars & wine storage', 'Concealed wiring'],
          link: { label: 'Plan your media wall', room: 'Entertainment' },
        },
      ],
    },
    {
      id: 'office',
      label: 'Office',
      length: 130,
      phases: true,
      placeholder: { photo: 'office', focus: [0.35, 0.5] },
      beats: [
        {
          eyebrow: '04 — Office',
          title: 'Room to *think.*',
          text: 'A desk at the right height, shelves at the right depth, and a place for every cable.',
        },
        {
          align: 'right',
          eyebrow: 'Offices by NUVO',
          title: 'Built-ins that work as *hard as you do.*',
          list: ['Built-in desks', 'Bookcases & library ladders', 'Printer & tech storage', 'Cable management'],
          link: { label: 'Plan your office', room: 'Office' },
        },
      ],
    },
    {
      id: 'closet',
      label: 'Closet',
      length: 135,
      phases: true,
      placeholder: { photo: 'closet' },
      beats: [
        {
          eyebrow: '05 — Closet',
          title: 'Dress in a room *made for it.*',
          text: 'We start with what you own, from suits and gowns to shoes and bags, and design every shelf around it.',
        },
        {
          eyebrow: 'Closets by NUVO',
          title: 'Walk-in, reach-in, *lit from within.*',
          list: ['Hanging systems', 'Drawer banks & islands', 'Integrated lighting & mirrors', 'Seating benches'],
          link: { label: 'Plan your closet', room: 'Closet' },
        },
      ],
    },
    {
      id: 'laundry',
      label: 'Laundry',
      length: 120,
      phases: true,
      placeholder: { photo: 'laundry', focus: [0.6, 0.5] },
      beats: [
        {
          align: 'right',
          eyebrow: '06 — Laundry',
          title: 'Even the laundry deserves *craft.*',
          text: 'Small rooms need the most planning: every inch around the washer and dryer counts.',
        },
        {
          eyebrow: 'Laundry rooms by NUVO',
          title: 'Folded, hung and *out of sight.*',
          list: ['Counters over washer & dryer', 'Pull-out hampers', 'Tall storage', 'Utility sink'],
          link: { label: 'Plan your laundry room', room: 'Laundry' },
        },
      ],
    },
    {
      id: 'finale',
      label: 'Your home',
      length: 150,
      placeholder: { house: 'night' },
      beats: [
        {
          at: [0.04, 0.42],
          align: 'center',
          eyebrow: 'One house, one workshop',
          title: 'Every room, *one signature.*',
          text: 'From the foyer to the closet, one team designs, builds and installs it all, backed by a 36-month warranty.',
        },
        {
          at: [0.54, 1],
          align: 'center',
          eyebrow: 'Free 3D design consultation',
          title: 'Your home *is next.*',
          text: 'Tell us about the room. We visit, measure and show you the design in 3D before anything is built.',
          actions: true,
        },
      ],
    },
  ],
};
