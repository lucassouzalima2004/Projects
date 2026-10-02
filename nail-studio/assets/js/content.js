/* =============================================================================
   CONTEÚDO DO SITE — tudo o que você precisa editar está neste arquivo.
   -----------------------------------------------------------------------------
   • Nome, contato, cidade e horários ........ seção 1
   • Serviços e preços (o "cartão") .......... seção 2
   • Cores, formatos e acabamentos ........... seção 3
   • Fotos (galeria e "Sobre") ............... seção 4
   • Textos em português (pt) e inglês (en) .. seção 5

   Dica: mantenha as aspas e as vírgulas no fim de cada linha. Se o site
   ficar em branco depois de uma edição, quase sempre é uma vírgula faltando.
   ========================================================================== */

window.SITE = {
  /* ---------------------------------------------------------------------------
     1. NEGÓCIO
     ------------------------------------------------------------------------- */
  brand: {
    name: 'Bossa',          // Nome principal do logo (troque pelo nome dela)
    tagline: 'Nail Studio', // Complemento que aparece ao lado do nome
  },

  // WhatsApp que recebe os pedidos: código do país + número, só dígitos.
  // Ex.: celular australiano 0412 345 678  →  '61412345678'
  whatsapp: '61400000000',

  instagram: '', // Usuário sem @. Vazio = o link não aparece.

  location: {
    city: '', // Ex.: 'Gold Coast'. Vazio = aparece só "Austrália".
    // Como a cidade aparece no meio das frases:
    in: { pt: 'na Austrália', en: 'in Australia' }, // Ex.: { pt: 'na Gold Coast', en: 'on the Gold Coast' }
  },

  hours: {
    pt: 'Segunda a sábado, das 9h às 19h',
    en: 'Monday to Saturday, 9am to 7pm',
  },

  currency: '$', // Valores em dólar australiano (AUD)

  /* ---------------------------------------------------------------------------
     2. SERVIÇOS E PREÇOS
     -------------------------------------------------------------------------
     ATENÇÃO: valores de exemplo. Substitua pelos serviços do cartão dela.

     cat ........ categoria (precisa existir em "categories")
     min ........ duração aproximada em minutos
     price ...... preço em dólar (número, sem $)
     from ....... true = mostra "a partir de"
     unit ....... opcional, ex.: { pt: 'por unha', en: 'per nail' }
     includes ... opcional (combos): ids dos serviços avulsos. O site calcula
                  sozinho quanto a cliente economiza.
     ------------------------------------------------------------------------- */
  categories: [
    { id: 'maos',  name: { pt: 'Mãos',        en: 'Hands' } },
    { id: 'pes',   name: { pt: 'Pés',         en: 'Feet' } },
    { id: 'along', name: { pt: 'Alongamento', en: 'Extensions' } },
    { id: 'combo', name: { pt: 'Combos',      en: 'Combos' } },
    { id: 'extra', name: { pt: 'Extras',      en: 'Add-ons' } },
  ],

  services: [
    {
      id: 'mani-br', cat: 'maos', min: 45, price: 40,
      name: { pt: 'Manicure brasileira', en: 'Brazilian manicure' },
      desc: { pt: 'Cutilagem detalhada, lixamento e esmalte tradicional.', en: 'Detailed cuticle care, shaping and classic polish.' },
    },
    {
      id: 'mani-gel', cat: 'maos', min: 60, price: 55,
      name: { pt: 'Esmaltação em gel', en: 'Gel manicure' },
      desc: { pt: 'Manicure brasileira com esmalte em gel. Brilho por até 3 semanas.', en: 'Brazilian manicure with gel polish. Shine for up to 3 weeks.' },
    },
    {
      id: 'blindagem', cat: 'maos', min: 75, price: 70,
      name: { pt: 'Blindagem em gel', en: 'Builder gel overlay' },
      desc: { pt: 'Camada de gel que fortalece a unha natural, na cor que você escolher.', en: 'A strengthening gel layer over your natural nails, in the colour of your choice.' },
    },
    {
      id: 'pedi-br', cat: 'pes', min: 50, price: 45,
      name: { pt: 'Pedicure brasileira', en: 'Brazilian pedicure' },
      desc: { pt: 'Cutilagem, lixamento e esmalte tradicional.', en: 'Cuticle care, shaping and classic polish.' },
    },
    {
      id: 'pedi-gel', cat: 'pes', min: 60, price: 60,
      name: { pt: 'Pedicure em gel', en: 'Gel pedicure' },
      desc: { pt: 'Pedicure brasileira finalizada com esmalte em gel.', en: 'Brazilian pedicure finished with gel polish.' },
    },
    {
      id: 'spa-pes', cat: 'pes', min: 75, price: 75,
      name: { pt: 'Spa dos pés', en: 'Spa pedicure' },
      desc: { pt: 'Esfoliação, hidratação profunda, massagem e esmaltação.', en: 'Exfoliation, deep moisturising, massage and polish.' },
    },
    {
      id: 'gel-along', cat: 'along', min: 120, price: 95,
      name: { pt: 'Alongamento em gel', en: 'Gel extensions' },
      desc: { pt: 'Aplicação completa no molde, no formato que você escolher.', en: 'A full set sculpted on forms, in the shape of your choice.' },
    },
    {
      id: 'fibra', cat: 'along', min: 150, price: 110,
      name: { pt: 'Alongamento em fibra de vidro', en: 'Fibreglass extensions' },
      desc: { pt: 'Queridinho do Brasil: leve, resistente e com acabamento natural.', en: 'A Brazilian favourite: light, strong and natural-looking.' },
    },
    {
      id: 'manut', cat: 'along', min: 90, price: 70,
      name: { pt: 'Manutenção', en: 'Infill' },
      desc: { pt: 'Para alongamentos feitos aqui há até 4 semanas.', en: 'For extensions done here within the last 4 weeks.' },
    },
    {
      id: 'combo-br', cat: 'combo', min: 90, price: 80, includes: ['mani-br', 'pedi-br'],
      name: { pt: 'Mão e pé brasileira', en: 'Brazilian mani + pedi' },
      desc: { pt: 'Manicure e pedicure tradicionais no mesmo horário.', en: 'Classic manicure and pedicure in one visit.' },
    },
    {
      id: 'combo-gel', cat: 'combo', min: 120, price: 105, includes: ['mani-gel', 'pedi-gel'],
      name: { pt: 'Mão e pé em gel', en: 'Gel mani + pedi' },
      desc: { pt: 'Esmaltação em gel nas mãos e nos pés.', en: 'Gel polish on hands and feet.' },
    },
    {
      id: 'art', cat: 'extra', min: 10, price: 5, from: true, unit: { pt: 'por unha', en: 'per nail' },
      name: { pt: 'Nail art', en: 'Nail art' },
      desc: { pt: 'Desenhos à mão livre, pedrarias e detalhes.', en: 'Hand-painted designs, gems and details.' },
    },
    {
      id: 'french', cat: 'extra', min: 15, price: 10,
      name: { pt: 'Francesinha', en: 'French tips' },
      desc: { pt: 'Clássica branca ou colorida.', en: 'Classic white or coloured.' },
    },
    {
      id: 'chrome', cat: 'extra', min: 10, price: 10,
      name: { pt: 'Cromado ou olho de gato', en: 'Chrome or cat-eye' },
      desc: { pt: 'Efeito espelhado ou magnético.', en: 'Mirror or magnetic shimmer effect.' },
    },
    {
      id: 'remocao', cat: 'extra', min: 20, price: 15,
      name: { pt: 'Remoção de gel ou alongamento', en: 'Gel or extension removal' },
      desc: { pt: 'Para trabalhos feitos em outro lugar, sem agredir a unha.', en: 'For work done elsewhere, removed gently to protect your nails.' },
    },
    {
      id: 'reparo', cat: 'extra', min: 10, price: 8, unit: { pt: 'por unha', en: 'per nail' },
      name: { pt: 'Reparo de unha', en: 'Nail repair' },
      desc: { pt: 'Conserto de unha quebrada ou lascada.', en: 'Fix for a broken or chipped nail.' },
    },
  ],

  /* ---------------------------------------------------------------------------
     3. CARTELA DE CORES, FORMATOS E ACABAMENTOS (seção "Monte sua unha")
     ------------------------------------------------------------------------- */
  colors: [
    { id: 'coco',       hex: '#F2E7E2', name: 'Coco',       desc: { pt: 'Branco leitoso',     en: 'Milky white' } },
    { id: 'areia',      hex: '#DDBBA6', name: 'Areia',      desc: { pt: 'Nude clarinho',      en: 'Soft nude' } },
    { id: 'caju',       hex: '#EE9E81', name: 'Caju',       desc: { pt: 'Pêssego quente',     en: 'Warm peach' } },
    { id: 'goiaba',     hex: '#E06C86', name: 'Goiaba',     desc: { pt: 'Rosa cremoso',       en: 'Creamy guava pink' } },
    { id: 'jacaranda',  hex: '#9A80C8', name: 'Jacarandá',  desc: { pt: 'Lilás de primavera', en: 'Spring lilac' } },
    { id: 'pitanga',    hex: '#D9492F', name: 'Pitanga',    desc: { pt: 'Coral vibrante',     en: 'Bright coral' } },
    { id: 'acerola',    hex: '#A60F2B', name: 'Acerola',    desc: { pt: 'Vermelho clássico',  en: 'Classic red' } },
    { id: 'acai',       hex: '#4D1A3C', name: 'Açaí',       desc: { pt: 'Berry profundo',     en: 'Deep berry' } },
    { id: 'jabuticaba', hex: '#1E0D16', name: 'Jabuticaba', desc: { pt: 'Ameixa quase preta', en: 'Almost-black plum' } },
  ],

  shapes: [
    { id: 'quadrada',  name: { pt: 'Quadrada',       en: 'Square' },   desc: { pt: 'Linhas retas e visual moderno.', en: 'Straight lines and a modern look.' } },
    { id: 'squoval',   name: { pt: 'Quadrada suave', en: 'Squoval' },  desc: { pt: 'Cantos arredondados, prática no dia a dia.', en: 'Softened corners, easy for everyday.' } },
    { id: 'oval',      name: { pt: 'Oval',           en: 'Oval' },     desc: { pt: 'Clássica e delicada, alonga os dedos.', en: 'Classic and delicate, lengthens the fingers.' } },
    { id: 'amendoada', name: { pt: 'Amendoada',      en: 'Almond' },   desc: { pt: 'Elegante e feminina, afina as mãos.', en: 'Elegant and feminine, slims the hands.' } },
    { id: 'bailarina', name: { pt: 'Bailarina',      en: 'Coffin' },   desc: { pt: 'Afunilada com ponta reta, cheia de atitude.', en: 'Tapered with a flat tip, full of attitude.' } },
    { id: 'stiletto',  name: { pt: 'Stiletto',       en: 'Stiletto' }, desc: { pt: 'Pontuda e marcante.', en: 'Pointed and dramatic.' } },
  ],

  finishes: [
    { id: 'brilho',     name: { pt: 'Brilho',       en: 'Glossy' } },
    { id: 'fosco',      name: { pt: 'Fosco',        en: 'Matte' } },
    { id: 'francesinha', name: { pt: 'Francesinha', en: 'French' } },
    { id: 'babyboomer', name: { pt: 'Baby boomer',  en: 'Baby boomer' } },
    { id: 'cromado',    name: { pt: 'Cromado',      en: 'Chrome' } },
    { id: 'olhodegato', name: { pt: 'Olho de gato', en: 'Cat-eye' } },
    { id: 'glitter',    name: { pt: 'Glitter',      en: 'Glitter' } },
  ],

  skins: ['#F3D6C6', '#E2B596', '#C38B67', '#93603F', '#5B3727'],

  /* ---------------------------------------------------------------------------
     4. FOTOS
     -------------------------------------------------------------------------
     Coloque as fotos em assets/img/ e liste aqui. Enquanto a lista estiver
     vazia, a galeria não aparece no site.
     Ex.: { src: 'assets/img/galeria/01.jpg', alt: { pt: 'Unhas amendoadas vermelhas', en: 'Red almond nails' } },
     ------------------------------------------------------------------------- */
  gallery: [],

  // Foto dela para a seção "Sobre" (vertical, ex.: 'assets/img/sobre.jpg').
  // Vazio = mostra a ilustração do vidro de esmalte.
  aboutPhoto: '',

  /* ---------------------------------------------------------------------------
     5. TEXTOS
     -------------------------------------------------------------------------
     {brand} = nome completo · {city} = cidade · {in} = "na Austrália" etc.
     <em>…</em> = palavra em itálico e em destaque nos títulos.
     ------------------------------------------------------------------------- */
  text: {
    pt: {
      meta: {
        title: '{brand} · Manicure e pedicure brasileira',
        description: 'Manicure e pedicure com técnica brasileira {in}. Esmaltação em gel, alongamento em fibra e em gel, spa dos pés. Agende pelo WhatsApp.',
      },
      ui: {
        skip: 'Pular para o conteúdo',
        language: 'Idioma',
        menu: 'Menu',
        close: 'Fechar',
      },
      nav: { services: 'Serviços', design: 'Monte sua unha', about: 'Sobre', faq: 'Dúvidas', book: 'Agendar' },
      hero: {
        eyebrow: 'Manicure e pedicure brasileira · {city}',
        title: 'Cutícula <em>perfeita</em>.<br>Brilho que <em>dura</em>.',
        lead: 'Manicure e pedicure com a técnica brasileira, em um estúdio privado e só com hora marcada. Materiais esterilizados, produtos profissionais e atenção total a cada detalhe.',
        primary: 'Agendar horário',
        secondary: 'Chamar no WhatsApp',
        fanLabel: 'Cartela de cores',
        fanHint: 'Toque numa cor',
      },
      trust: ['Somente com hora marcada', 'Materiais esterilizados', 'Lixas de uso único', 'Técnica brasileira'],
      services: {
        eyebrow: 'Serviços e valores',
        title: 'Monte seu <em>horário</em>',
        lead: 'Toque nos serviços que você quer e envie o pedido pelo WhatsApp. A confirmação do horário chega por lá.',
        cardTitle: 'Tabela de serviços',
        cardNote: 'Valores em dólar australiano (AUD). Tempos aproximados.',
        from: 'a partir de',
        save: 'economize {amount}',
      },
      summary: {
        title: 'Seu pedido',
        empty: 'Nenhum serviço escolhido ainda. Toque nos itens da tabela para adicionar.',
        one: '1 serviço',
        other: '{n} serviços',
        total: 'Total estimado',
        time: 'Duração aproximada',
        remove: 'Remover',
        clear: 'Limpar',
        name: 'Seu nome',
        namePh: 'Como podemos te chamar?',
        date: 'Dia preferido',
        period: 'Período',
        periods: { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' },
        notes: 'Observações',
        notesPh: 'Ex.: quero nail art floral, tenho unhas sensíveis…',
        inspiration: 'Inspiração',
        send: 'Enviar pedido pelo WhatsApp',
        sendEmpty: 'Chamar no WhatsApp',
        fine: 'O horário fica reservado depois da nossa confirmação.',
      },
      design: {
        eyebrow: 'Monte sua unha',
        title: 'Formato, cor e <em>acabamento</em>',
        lead: 'Experimente combinações e veja como ficam no seu tom de pele. Gostou? Envie a inspiração junto com o pedido.',
        shape: 'Formato',
        color: 'Cor',
        finish: 'Acabamento',
        skin: 'Tom de pele',
        skinOption: 'Tom de pele {n}',
        use: 'Usar no meu pedido',
        used: 'Inspiração adicionada ao pedido',
        surprise: 'Me surpreenda',
        note: 'Ilustração para inspirar. O resultado final é combinado com você no atendimento.',
        preview: 'Mão com unhas {shape}, cor {color}, acabamento {finish}',
      },
      gallery: {
        eyebrow: 'Portfólio',
        title: 'Trabalhos <em>recentes</em>',
      },
      about: {
        eyebrow: 'Sobre',
        title: 'Feito à mão, <em>sem pressa</em>.',
        p1: 'A manicure brasileira é famosa pela cutilagem caprichada e por um acabamento que dura semanas. É essa técnica que você encontra aqui, em um espaço reservado, com hora marcada e atenção só para você.',
        p2: 'Cada atendimento começa com uma conversa sobre formato, cor e a sua rotina. Assim a unha fica linda no primeiro dia e continua linda na terceira semana.',
        hygieneTitle: 'Nosso protocolo de higiene',
        hygiene: [
          'Alicates e espátulas esterilizados, abertos na sua frente.',
          'Lixas e palitos de uso único, novos para cada cliente.',
          'Bancada e equipamentos higienizados entre os atendimentos.',
          'Esmaltes e géis de marcas profissionais.',
        ],
      },
      steps: {
        eyebrow: 'Como agendar',
        title: 'Agende em <em>três passos</em>',
        items: [
          { title: 'Escolha os serviços', text: 'Toque nos itens da tabela e, se quiser, monte a inspiração da sua unha.' },
          { title: 'Envie pelo WhatsApp', text: 'O pedido chega pronto, com serviços, valores e o dia que você prefere.' },
          { title: 'Receba a confirmação', text: 'Respondemos com o horário disponível e o endereço do estúdio.' },
        ],
      },
      faq: {
        eyebrow: 'Dúvidas',
        title: 'Perguntas <em>frequentes</em>',
        items: [
          { q: 'Quanto tempo dura a esmaltação em gel?', a: 'Em média de duas a três semanas, dependendo do crescimento da unha e dos cuidados em casa. Usar luvas para lavar louça e fazer faxina ajuda bastante.' },
          { q: 'Onde fica o estúdio?', a: 'O atendimento é em um estúdio privado {in}. O endereço exato é enviado junto com a confirmação do horário.' },
          { q: 'Preciso ir sem esmalte?', a: 'Não precisa. A remoção de esmalte comum já está inclusa. Gel ou alongamento feitos em outro lugar entram como remoção, na seção Extras.' },
          { q: 'Quais são as formas de pagamento?', a: 'PayID, transferência bancária ou dinheiro, no fim do atendimento.' },
          { q: 'E se eu precisar remarcar ou cancelar?', a: 'Sem problemas. Avise com pelo menos 24 horas de antecedência para liberarmos o horário. Atrasos de mais de 15 minutos podem precisar ser remarcados.' },
        ],
      },
      contact: {
        eyebrow: 'Agendamentos',
        title: 'Vamos deixar suas unhas <em>impecáveis</em>?',
        lead: 'Mande uma mensagem e garanta seu horário.',
        cta: 'Chamar no WhatsApp',
        hours: 'Horários',
        where: 'Onde',
        whereValue: 'Estúdio privado {in}',
        booking: 'Atendimento',
        bookingValue: 'Somente com hora marcada',
        instagram: 'Instagram',
      },
      footer: { rights: 'Todos os direitos reservados.', top: 'Voltar ao topo' },
      bar: { empty: 'Agendar pelo WhatsApp', view: 'Ver pedido' },
      wa: {
        greeting: 'Olá! Vi o site da {brand} e gostaria de agendar um horário 💅',
        services: 'Serviços',
        total: 'Total estimado',
        approx: 'aprox.',
        inspiration: 'Inspiração',
        name: 'Nome',
        preferred: 'Preferência',
        notes: 'Observações',
      },
    },

    en: {
      meta: {
        title: '{brand} · Brazilian manicure & pedicure',
        description: 'Brazilian-technique manicures and pedicures {in}. Gel polish, fibreglass and gel extensions, spa pedicures. Book on WhatsApp.',
      },
      ui: {
        skip: 'Skip to content',
        language: 'Language',
        menu: 'Menu',
        close: 'Close',
      },
      nav: { services: 'Services', design: 'Design your nails', about: 'About', faq: 'FAQ', book: 'Book' },
      hero: {
        eyebrow: 'Brazilian manicure & pedicure · {city}',
        title: 'Flawless <em>cuticles</em>.<br>Shine that <em>lasts</em>.',
        lead: 'Brazilian-technique manicures and pedicures in a private, appointment-only studio. Sterilised tools, professional products and real attention to every detail.',
        primary: 'Book an appointment',
        secondary: 'Message on WhatsApp',
        fanLabel: 'Colour chart',
        fanHint: 'Tap a colour',
      },
      trust: ['By appointment only', 'Sterilised tools', 'Single-use files', 'Brazilian technique'],
      services: {
        eyebrow: 'Services & prices',
        title: 'Build your <em>appointment</em>',
        lead: 'Tap the services you’d like, then send your request on WhatsApp. We’ll confirm your time there.',
        cardTitle: 'Service menu',
        cardNote: 'Prices in Australian dollars (AUD). Times are approximate.',
        from: 'from',
        save: 'save {amount}',
      },
      summary: {
        title: 'Your request',
        empty: 'No services yet. Tap items on the menu to add them.',
        one: '1 service',
        other: '{n} services',
        total: 'Estimated total',
        time: 'Approx. time',
        remove: 'Remove',
        clear: 'Clear',
        name: 'Your name',
        namePh: 'What should we call you?',
        date: 'Preferred day',
        period: 'Time of day',
        periods: { manha: 'Morning', tarde: 'Afternoon', noite: 'Evening' },
        notes: 'Notes',
        notesPh: 'E.g. floral nail art, sensitive nails…',
        inspiration: 'Nail inspiration',
        send: 'Send request on WhatsApp',
        sendEmpty: 'Message on WhatsApp',
        fine: 'Your time is reserved once we confirm it.',
      },
      design: {
        eyebrow: 'Design your nails',
        title: 'Shape, colour and <em>finish</em>',
        lead: 'Try combinations and see how they look on your skin tone. Love it? Send it along with your request.',
        shape: 'Shape',
        color: 'Colour',
        finish: 'Finish',
        skin: 'Skin tone',
        skinOption: 'Skin tone {n}',
        use: 'Add to my request',
        used: 'Added to your request',
        surprise: 'Surprise me',
        note: 'An illustration for inspiration. We’ll fine-tune the final look with you at your appointment.',
        preview: 'Hand with {shape} nails, {color} colour, {finish} finish',
      },
      gallery: {
        eyebrow: 'Portfolio',
        title: 'Recent <em>work</em>',
      },
      about: {
        eyebrow: 'About',
        title: 'Handcrafted, <em>never rushed</em>.',
        p1: 'Brazilian manicures are famous for meticulous cuticle work and a finish that lasts for weeks. That’s the technique you’ll find here, in a private space with appointment-only bookings and attention just for you.',
        p2: 'Every appointment starts with a chat about shape, colour and your routine, so your nails look beautiful on day one and still look beautiful in week three.',
        hygieneTitle: 'Our hygiene standards',
        hygiene: [
          'Nippers and pushers sterilised and unsealed in front of you.',
          'Single-use files and sticks, new for every client.',
          'Workstation and equipment sanitised between appointments.',
          'Professional-grade polishes and gels.',
        ],
      },
      steps: {
        eyebrow: 'How to book',
        title: 'Book in <em>three steps</em>',
        items: [
          { title: 'Pick your services', text: 'Tap items on the menu and, if you like, design your nail inspiration.' },
          { title: 'Send it on WhatsApp', text: 'Your request arrives ready, with services, prices and your preferred day.' },
          { title: 'Get your confirmation', text: 'We’ll reply with an available time and the studio address.' },
        ],
      },
      faq: {
        eyebrow: 'FAQ',
        title: 'Good to <em>know</em>',
        items: [
          { q: 'How long does gel polish last?', a: 'Usually two to three weeks, depending on how fast your nails grow and your aftercare. Wearing gloves for dishes and cleaning helps a lot.' },
          { q: 'Where is the studio?', a: 'Appointments are held in a private studio {in}. The exact address is sent with your booking confirmation.' },
          { q: 'Do I need to arrive with bare nails?', a: 'No. Removing regular polish is included. Gel or extensions done elsewhere are charged as a removal, listed under Add-ons.' },
          { q: 'How can I pay?', a: 'PayID, bank transfer or cash, at the end of your appointment.' },
          { q: 'What if I need to reschedule or cancel?', a: 'No problem. Please let us know at least 24 hours ahead so we can offer the time to someone else. Arriving more than 15 minutes late may mean rescheduling.' },
        ],
      },
      contact: {
        eyebrow: 'Bookings',
        title: 'Ready for <em>flawless</em> nails?',
        lead: 'Send us a message and secure your spot.',
        cta: 'Message on WhatsApp',
        hours: 'Hours',
        where: 'Where',
        whereValue: 'Private studio {in}',
        booking: 'Bookings',
        bookingValue: 'By appointment only',
        instagram: 'Instagram',
      },
      footer: { rights: 'All rights reserved.', top: 'Back to top' },
      bar: { empty: 'Book on WhatsApp', view: 'View request' },
      wa: {
        greeting: 'Hi! I found {brand} online and I’d like to book an appointment 💅',
        services: 'Services',
        total: 'Estimated total',
        approx: 'approx.',
        inspiration: 'Nail inspiration',
        name: 'Name',
        preferred: 'Preferred time',
        notes: 'Notes',
      },
    },
  },
};
