/* =============================================================================
   CONTEÚDO DO SITE — tudo o que você precisa editar está neste arquivo.
   -----------------------------------------------------------------------------
   • Contato (WhatsApp, telefone, e-mail, Instagram) .. seção 1
   • Cidade e região atendida ........................ seção 2
   • Serviços, diferenciais, passos e dúvidas ......... seção 3
   • Opções do pedido de orçamento ................... seção 4
   • Textos em inglês (en) e português (pt) ........... seção 5

   Textos com *asteriscos* ganham a faixa preta inclinada do logo.
   Dica: mantenha as aspas e as vírgulas no fim de cada linha. Se o site
   ficar em branco depois de uma edição, quase sempre é uma vírgula faltando.
   ========================================================================== */

window.SITE = {
  /* ---------------------------------------------------------------------------
     1. CONTATO
     ------------------------------------------------------------------------- */
  brand: 'GoHand Shop',

  // WhatsApp que recebe os pedidos: código do país + número, só dígitos.
  // Ex.: celular americano (508) 555-0123  →  '15085550123'
  whatsapp: '17743461245',

  // Telefone da empresa para ligar. Vazio = usa o mesmo número do WhatsApp.
  phone: '18883111671',

  email: '',     // Ex.: 'contact@gohandshop.com'. Vazio = não aparece.
  instagram: '', // Usuário sem @. Vazio = não aparece.
  tiktok: '',    // Usuário sem @. Vazio = não aparece.
  facebook: '',  // Endereço da página depois de facebook.com/. Vazio = não aparece.

  // Endereços que aparecem no contato (e o primeiro vai para o Google).
  addresses: [
    {
      label: { en: 'New Jersey', pt: 'Nova Jersey' },
      lines: ['GoHandShop LLC', '971 US Highway 202N, Ste N', 'Branchburg, NJ 08876'],
      street: '971 US Highway 202N, Ste N', city: 'Branchburg', region: 'NJ', zip: '08876',
    },
    {
      label: { en: 'Massachusetts', pt: 'Massachusetts' },
      lines: ['GoHandShop LLC', '56 Broad St #77143', 'Boston, MA 02109-4301'],
      street: '56 Broad St #77143', city: 'Boston', region: 'MA', zip: '02109-4301',
    },
  ],

  hours: {
    en: 'Monday to Saturday, 7am to 7pm',
    pt: 'Segunda a sábado, das 7h às 19h',
  },

  /* ---------------------------------------------------------------------------
     2. ONDE ATENDE
     ------------------------------------------------------------------------- */
  location: {
    // Nome curto da região, aparece no topo do site.
    name: { en: 'NJ · MA · NY · CT', pt: 'NJ · MA · NY · CT' },
    // Como a região aparece no meio das frases ("... for businesses in New Jersey ...").
    in: {
      en: 'in New Jersey, Massachusetts, New York and Connecticut',
      pt: 'em Nova Jersey, Massachusetts, Nova York e Connecticut',
    },
    // Onde a empresa fica. Vazio = a frase "Based in ..." não aparece.
    base: { en: 'Branchburg, NJ and Boston, MA', pt: 'Branchburg, NJ e Boston, MA' },
  },

  // Regiões atendidas, aparecem como etiquetas na seção "Where we deliver".
  // main: true = destaque em laranja (onde a empresa mais atua).
  // Lista vazia = a seção some do site.
  areas: [
    { name: { en: 'New Jersey', pt: 'Nova Jersey' }, main: true },
    { name: 'Massachusetts', main: true },
    { name: { en: 'New York', pt: 'Nova York' } },
    { name: 'Connecticut' },
  ],

  /* ---------------------------------------------------------------------------
     3. SERVIÇOS, DIFERENCIAIS, PASSOS E DÚVIDAS
     icon: box, clock, route, pickup, cart, building, truck, chat, pin, camera, tag
     ------------------------------------------------------------------------- */
  services: [
    {
      icon: 'cart',
      title: { en: 'Marketplace & online sellers', pt: 'Sellers e lojas online' },
      text: {
        en: 'Pickup and local delivery for people who sell on marketplaces and online stores, so your customers get their orders sooner.',
        pt: 'Coleta e entrega local para quem vende em marketplaces e lojas online, para o seu cliente receber o pedido mais rápido.',
      },
    },
    {
      icon: 'clock',
      title: { en: 'Same-day delivery', pt: 'Entrega no mesmo dia' },
      text: {
        en: 'Book in the morning, delivered by the end of the day within our routes.',
        pt: 'Pediu de manhã, entregamos até o fim do dia dentro das nossas rotas.',
      },
    },
    {
      icon: 'route',
      title: { en: 'Scheduled routes', pt: 'Rotas programadas' },
      text: {
        en: 'Daily or weekly runs for stores, restaurants and offices, on the days you choose.',
        pt: 'Rotas diárias ou semanais para lojas, restaurantes e escritórios, nos dias que você escolher.',
      },
    },
    {
      icon: 'pickup',
      title: { en: 'Pickup & drop-off', pt: 'Coleta e entrega' },
      text: {
        en: 'We collect at your door, warehouse or post office and take it where it needs to go.',
        pt: 'Buscamos na sua porta, no depósito ou no correio e levamos aonde precisar.',
      },
    },
    {
      icon: 'building',
      title: { en: 'Business to business', pt: 'Entre empresas' },
      text: {
        en: 'Documents, parts, supplies and samples between companies, handled with care.',
        pt: 'Documentos, peças, suprimentos e amostras entre empresas, com todo o cuidado.',
      },
    },
    {
      icon: 'truck',
      title: { en: 'Last mile for carriers', pt: 'Última milha para transportadoras' },
      text: {
        en: 'Extra hands for carriers and logistics companies that need reliable drivers on the route.',
        pt: 'Reforço para transportadoras e empresas de logística que precisam de motorista confiável na rota.',
      },
    },
  ],

  promises: [
    {
      icon: 'chat',
      title: { en: 'Talk to who’s driving', pt: 'Fale com quem entrega' },
      text: {
        en: 'No call center. You message us on WhatsApp and get an answer from the people on the road.',
        pt: 'Sem central de atendimento. Você chama no WhatsApp e quem responde é quem está na rua.',
      },
    },
    {
      icon: 'pin',
      title: { en: 'Updates at every step', pt: 'Aviso a cada etapa' },
      text: {
        en: 'Picked up, on the way, delivered: you get a message at each stop.',
        pt: 'Coletado, a caminho, entregue: você recebe uma mensagem em cada etapa.',
      },
    },
    {
      icon: 'camera',
      title: { en: 'Photo proof of delivery', pt: 'Foto na entrega' },
      text: {
        en: 'Every drop-off is photographed at the door. No more “where did it go?”.',
        pt: 'Toda entrega é fotografada na porta. Acabou o “cadê o pacote?”.',
      },
    },
    {
      icon: 'tag',
      title: { en: 'Clear pricing', pt: 'Preço combinado' },
      text: {
        en: 'You get the price before we leave. No surprise fees at the end.',
        pt: 'Você sabe o valor antes de a gente sair. Nada de taxa surpresa no final.',
      },
    },
  ],

  // Os 4 passos aparecem como o rastreio de um pacote.
  steps: [
    {
      status: { en: 'Order placed', pt: 'Pedido feito' },
      title: { en: 'Send a message', pt: 'Mande uma mensagem' },
      text: {
        en: 'Tell us what, where and when, on WhatsApp or by phone.',
        pt: 'Conte o quê, de onde, para onde e quando, pelo WhatsApp ou por telefone.',
      },
    },
    {
      status: { en: 'Confirmed', pt: 'Confirmado' },
      title: { en: 'Get your quote', pt: 'Receba o orçamento' },
      text: {
        en: 'We reply with the price and pickup time. You say yes, we’re set.',
        pt: 'Respondemos com preço e horário da coleta. Você aprova e pronto.',
      },
    },
    {
      status: { en: 'In transit', pt: 'Em trânsito' },
      title: { en: 'We pick up and go', pt: 'Coletamos e saímos' },
      text: {
        en: 'Your package hits the road and you follow every step.',
        pt: 'Seu pacote pega a estrada e você acompanha cada etapa.',
      },
    },
    {
      status: { en: 'Delivered', pt: 'Entregue' },
      title: { en: 'Done, with proof', pt: 'Entregue, com prova' },
      text: {
        en: 'The delivery photo lands on your WhatsApp.',
        pt: 'A foto da entrega chega no seu WhatsApp.',
      },
    },
  ],

  faq: [
    {
      q: { en: 'Which areas do you cover?', pt: 'Quais regiões vocês atendem?' },
      a: {
        en: 'New Jersey, Massachusetts, New York and Connecticut, with most of our routes in New Jersey and Massachusetts. Send us your ZIP code and we’ll confirm.',
        pt: 'Nova Jersey, Massachusetts, Nova York e Connecticut, com a maior parte das rotas em Nova Jersey e Massachusetts. Mande o seu ZIP code que a gente confirma.',
      },
    },
    {
      q: { en: 'What can you deliver?', pt: 'O que vocês entregam?' },
      a: {
        en: 'Packages, boxes, documents, online store orders and business supplies. If it fits in our vehicle and is legal to carry, ask us.',
        pt: 'Pacotes, caixas, documentos, pedidos de loja online e materiais de empresas. Se cabe no nosso veículo e pode ser transportado, é só perguntar.',
      },
    },
    {
      q: { en: 'How much does a delivery cost?', pt: 'Quanto custa uma entrega?' },
      a: {
        en: 'It depends on distance, volume and how often you ship. Send us the pickup and delivery areas and we reply with a price. Recurring routes get better rates.',
        pt: 'Depende da distância, do volume e da frequência. Mande a origem e o destino e respondemos com o valor. Rotas fixas têm preço melhor.',
      },
    },
    {
      q: { en: 'Do you work with businesses on a regular schedule?', pt: 'Vocês atendem empresas com frequência fixa?' },
      a: {
        en: 'Yes. That’s our focus: small businesses and online sellers that ship every week, with daily or weekly routes, plus carriers that need extra drivers.',
        pt: 'Sim, esse é o nosso foco: pequenas empresas e sellers que enviam toda semana, com rotas diárias ou semanais, e transportadoras que precisam de reforço.',
      },
    },
    {
      q: { en: 'How do I know my package arrived?', pt: 'Como sei que o pacote chegou?' },
      a: {
        en: 'You get a WhatsApp message when we pick up, while we’re on the way and a photo when it’s delivered.',
        pt: 'Você recebe mensagem no WhatsApp na coleta, durante o trajeto e uma foto quando entregamos.',
      },
    },
    {
      q: { en: 'How do I pay?', pt: 'Como faço o pagamento?' },
      a: {
        en: 'We’ll agree on the payment method with your quote. Businesses with recurring routes can pay weekly.',
        pt: 'A forma de pagamento é combinada junto com o orçamento. Empresas com rota fixa podem pagar por semana.',
      },
    },
    {
      q: { en: 'Do you speak Portuguese?', pt: 'Vocês falam português?' },
      a: {
        en: 'Yes! We speak English and Portuguese. Message us in whichever you prefer.',
        pt: 'Sim! Atendemos em inglês e em português. Chame no idioma que preferir.',
      },
    },
  ],

  /* ---------------------------------------------------------------------------
     4. ORÇAMENTO
     crmForm: id do formulário do CRM (LeadConnector / GoHighLevel). Os pedidos
     caem direto no CRM. Vazio = aparece a "etiqueta" que abre o WhatsApp com a
     mensagem pronta (as opções abaixo são dela).
     ------------------------------------------------------------------------- */
  crmForm: 'j4intf8LbzEQ0gfpTXyy',
  crmFormHeight: 745, // altura inicial em px; o script do CRM ajusta sozinho

  quote: {
    kinds: [
      { en: 'Packages', pt: 'Pacotes' },
      { en: 'Documents', pt: 'Documentos' },
      { en: 'Online orders', pt: 'Pedidos online' },
      { en: 'Supplies', pt: 'Materiais' },
      { en: 'Other', pt: 'Outro' },
    ],
    frequency: [
      { en: 'Just once', pt: 'Só uma vez' },
      { en: 'Every week', pt: 'Toda semana' },
      { en: 'Every day', pt: 'Todo dia' },
    ],
    volume: ['1–10', '11–50', '51–200', '200+'],
  },

  /* ---------------------------------------------------------------------------
     5. TEXTOS
     Texto que faltar em pt aparece em inglês.
     Marcadores: {place} = location.name · {area} = location.in · {base} = location.base
                 {phone} = telefone · {brand} = nome
     ------------------------------------------------------------------------- */
  text: {
    en: {
      meta: {
        title: 'GoHand Shop · Package delivery for small businesses',
        description: 'Package delivery for small businesses and online sellers in New Jersey, Massachusetts, New York and Connecticut: same-day delivery, scheduled routes and pickups, with updates on WhatsApp.',
      },
      ui: {
        skip: 'Skip to content',
        menu: 'Menu',
        close: 'Close',
        lang: 'Language',
        whatsapp: 'WhatsApp',
        call: 'Call',
      },
      // Mensagens que já chegam escritas no WhatsApp
      wa: {
        hello: 'Hi {brand}! I found you on your website and I’d like more information.',
        about: 'Hi {brand}! I’d like to know more about: {service}.',
      },
      nav: {
        services: 'Services',
        how: 'How it works',
        quote: 'Get a quote',
        area: 'Coverage',
        faq: 'FAQ',
      },
      hero: {
        kicker: 'Package delivery · {place}',
        title: 'Your packages,\n*in good hands.*',
        lead: '{brand} delivers for small businesses and online sellers {area}: same-day, scheduled routes and pickups, with every step updated on WhatsApp.',
        whatsapp: 'Chat on WhatsApp',
        call: 'Call {phone}',
        note: 'Free quote · English & Português',
      },
      label: {
        priority: 'Priority',
        tracking: 'Tracking Nº',
        from: 'From',
        fromValue: 'Your business',
        to: 'To',
        toValue: 'Your customer',
        statuses: ['Picked up', 'In transit', 'Out for delivery', 'Delivered'],
        stamp: 'Delivered',
      },
      ticker: ['Same-day', 'Scheduled routes', 'Pickup & drop-off', 'E-commerce', 'Business to business', 'Last mile'],
      services: {
        kicker: 'Services',
        title: 'What we *move*',
        lead: 'One partner for small businesses and sellers who can’t stop shipping.',
        cta: 'Ask about this',
      },
      why: {
        kicker: 'Why {brand}',
        title: 'Small company.\n*Serious* delivery.',
        lead: 'We’re just getting started, and that’s the point: every package gets the attention of the people who run the company.',
      },
      how: {
        kicker: 'How it works',
        title: 'As easy as *tracking* a package',
        stepLabel: 'Step',
      },
      quote: {
        kicker: 'Free quote',
        title: 'Get a quote.\n*We deliver.*',
        lead: 'It takes 30 seconds. Tell us what you ship and where, and we get back to you with a price.',
        perks: ['No contract to get a price', 'Answer the same day', 'One-time or recurring'],
        header: 'Quote request',
        altLabel: 'Prefer to talk?',
        altWhatsapp: 'WhatsApp',
        altCall: 'Call',
        name: 'Your name',
        namePh: 'John Smith',
        company: 'Company',
        companyPh: 'Optional',
        pickup: 'Pickup from',
        pickupPh: 'City or ZIP',
        dropoff: 'Deliver to',
        dropoffPh: 'City, ZIP or area',
        kind: 'What are you shipping?',
        frequency: 'How often?',
        volume: 'Packages per run',
        notes: 'Anything else?',
        notesPh: 'Sizes, time windows, special care…',
        send: 'Send on WhatsApp',
        orCall: 'Prefer to talk? Call {phone}',
        needName: 'Tell us your name so we know who to answer.',
        msgIntro: 'Hi {brand}! I’d like a delivery quote.',
      },
      area: {
        kicker: 'Coverage',
        title: 'Where we *deliver*',
        base: 'Based in {base}.',
        lead: 'Not on the list? Message us: we’re adding new routes all the time.',
      },
      faq: {
        kicker: 'FAQ',
        title: 'Good *questions*',
        lead: 'Didn’t find yours? Ask us on WhatsApp.',
      },
      contact: {
        kicker: 'Let’s talk',
        title: 'Ready to *go?*',
        lead: 'Message us now and get your quote today.',
        whatsapp: 'WhatsApp',
        phone: 'Phone',
        email: 'Email',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        facebook: 'Facebook',
        hours: 'Hours',
        address: 'Address',
        map: 'Open in Maps',
      },
      footer: {
        tagline: 'Package delivery for small businesses and online sellers {area}.',
        rights: 'All rights reserved.',
        top: 'Back to top',
      },
    },

    pt: {
      meta: {
        title: 'GoHand Shop · Entregas para pequenas empresas',
        description: 'Entregas de pacotes para pequenas empresas e sellers de marketplace em Nova Jersey, Massachusetts, Nova York e Connecticut: no mesmo dia, rotas programadas e coletas, com aviso pelo WhatsApp.',
      },
      ui: {
        skip: 'Pular para o conteúdo',
        menu: 'Menu',
        close: 'Fechar',
        lang: 'Idioma',
        whatsapp: 'WhatsApp',
        call: 'Ligar',
      },
      wa: {
        hello: 'Olá, {brand}! Vi o site de vocês e queria mais informações.',
        about: 'Olá, {brand}! Quero saber mais sobre: {service}.',
      },
      nav: {
        services: 'Serviços',
        how: 'Como funciona',
        quote: 'Orçamento',
        area: 'Onde atendemos',
        faq: 'Dúvidas',
      },
      hero: {
        kicker: 'Entrega de pacotes · {place}',
        title: 'Sua entrega\n*em boas mãos.*',
        lead: 'A {brand} faz entregas para pequenas empresas e sellers de marketplace {area}: no mesmo dia, em rotas programadas e com coleta, avisando cada etapa pelo WhatsApp.',
        whatsapp: 'Chamar no WhatsApp',
        call: 'Ligar {phone}',
        note: 'Orçamento grátis · English & Português',
      },
      label: {
        priority: 'Prioridade',
        tracking: 'Rastreio Nº',
        from: 'De',
        fromValue: 'Sua empresa',
        to: 'Para',
        toValue: 'Seu cliente',
        statuses: ['Coletado', 'Em trânsito', 'Saiu para entrega', 'Entregue'],
        stamp: 'Entregue',
      },
      ticker: ['Mesmo dia', 'Rotas programadas', 'Coleta e entrega', 'E-commerce', 'Entre empresas', 'Última milha'],
      services: {
        kicker: 'Serviços',
        title: 'O que a gente *leva*',
        lead: 'Um parceiro para pequenas empresas e sellers que não podem parar de enviar.',
        cta: 'Quero esse',
      },
      why: {
        kicker: 'Por que a {brand}',
        title: 'Empresa pequena.\nEntrega *séria.*',
        lead: 'Estamos começando, e essa é a vantagem: cada pacote recebe a atenção de quem comanda a empresa.',
      },
      how: {
        kicker: 'Como funciona',
        title: 'Simples como *rastrear* um pacote',
        stepLabel: 'Etapa',
      },
      // quote: a seção de orçamento fica em inglês nos dois idiomas, igual ao formulário do CRM
      // (o site usa text.en.quote). Para traduzir, crie aqui um bloco quote como o do inglês.
      area: {
        kicker: 'Onde atendemos',
        title: 'Onde a gente *entrega*',
        base: 'Base em {base}.',
        lead: 'Sua cidade não está na lista? Chame a gente: estamos abrindo rotas novas o tempo todo.',
      },
      faq: {
        kicker: 'Dúvidas',
        title: 'Boas *perguntas*',
        lead: 'Não achou a sua? Pergunte no WhatsApp.',
      },
      contact: {
        kicker: 'Fale com a gente',
        title: 'Bora *rodar?*',
        lead: 'Chame agora e receba seu orçamento hoje mesmo.',
        whatsapp: 'WhatsApp',
        phone: 'Telefone',
        email: 'E-mail',
        instagram: 'Instagram',
        tiktok: 'TikTok',
        facebook: 'Facebook',
        hours: 'Horário',
        address: 'Endereço',
        map: 'Abrir no mapa',
      },
      footer: {
        tagline: 'Entregas para pequenas empresas e sellers {area}.',
        rights: 'Todos os direitos reservados.',
        top: 'Voltar ao topo',
      },
    },
  },
};
