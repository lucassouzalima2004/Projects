/* =============================================================================
   DADOS DA LOJA E TEXTOS DO SITE
   -----------------------------------------------------------------------------
   • Contato, Instagram e planilha de estoque ... seção 1
   • Categorias da vitrine ...................... seção 2
   • Textos em português (pt) e italiano (it) .. seção 3

   Os produtos ficam em products.js (ou na planilha do Google, se estiver ligada).

   Dica: mantenha as aspas e as vírgulas no fim de cada linha. Se o site
   ficar em branco depois de uma edição, quase sempre é uma vírgula faltando.
   ========================================================================== */

window.SITE = {
  /* ---------------------------------------------------------------------------
     1. LOJA
     ------------------------------------------------------------------------- */
  brand: 'Amarabotibeauty',

  // WhatsApp que recebe os pedidos: código do país + número, só dígitos.
  // O da logo é 351 420 4866 (Itália, +39)  →  '393514204866'
  whatsapp: '393514204866',
  whatsappLabel: '+39 351 420 4866',

  instagram: '', // Usuário sem @. Vazio = o link não aparece.

  // PLANILHA DE ESTOQUE (opcional). Com ela, os produtos e as quantidades vêm de uma
  // planilha do Google, que dá para atualizar pelo celular. Passo a passo no README.
  // Cole aqui o link de "Publicar na Web" em formato CSV (termina com output=csv).
  // Vazio = o site usa a lista de products.js.
  sheetCsv: '',

  // Estoque baixo: a partir de quantas unidades aparece "Últimas unidades"
  lowStock: 3,

  // Quantos produtos aparecem antes do botão "Ver mais"
  pageSize: 12,

  /* ---------------------------------------------------------------------------
     2. CATEGORIAS (a ordem aqui é a ordem dos botões da vitrine)
     ------------------------------------------------------------------------- */
  categories: [
    { id: 'perfumes',  name: { pt: 'Perfumes',          it: 'Profumi' } },
    { id: 'corpo',     name: { pt: 'Corpo & banho',     it: 'Corpo & bagno' } },
    { id: 'cabelos',   name: { pt: 'Cabelos',           it: 'Capelli' } },
    { id: 'rosto',     name: { pt: 'Rosto',             it: 'Viso' } },
    { id: 'make',      name: { pt: 'Maquiagem',         it: 'Make-up' } },
    { id: 'masculino', name: { pt: 'Masculino',         it: 'Uomo' } },
    { id: 'kits',      name: { pt: 'Kits & presentes',  it: 'Kit & regali' } },
  ],

  // Cor de cada linha, usada no desenho do frasco quando o produto não tem cor nem foto
  // (útil para os produtos que vêm da planilha)
  lineColors: {
    'lily': '#EBC3B0', 'malbec': '#5E1B2C', 'floratta': '#F0A7B4', 'liz': '#E9D2A4',
    'egeo': '#E8587A', 'zaad': '#2C4766', 'nativa spa': '#5A2742', 'cuide-se bem': '#F2A783',
    'botik': '#BCD5E6', 'aura': '#E6B2A0', 'make b.': '#B9475E', 'quem disse, berenice?': '#C24461',
    'coffee': '#6B4430', 'glamour': '#D44C6A', 'arbo': '#5F7A4E', 'quasar': '#2F5E8C',
    'siàge': '#C9A16B', 'boti baby': '#BFDDE9', 'accordes': '#7E4C7A', 'elysée': '#E3C38B',
  },

  /* ---------------------------------------------------------------------------
     3. TEXTOS
     {brand} vira o nome da loja e {n} vira um número.
     ------------------------------------------------------------------------- */
  text: {
    pt: {
      meta: {
        title: 'Amarabotibeauty · Produtos O Boticário na Itália',
        description: 'Perfumes, cremes, maquiagem e kits O Boticário na Itália. Escolha na vitrine e faça o pedido pelo WhatsApp.',
      },
      ui: {
        skip: 'Pular para os produtos',
        menu: 'Menu',
        close: 'Fechar',
        lang: 'Italiano',
        cart: 'Sacola',
        top: 'Voltar ao topo',
      },
      nav: { shop: 'Vitrine', loved: 'Mais amados', how: 'Como comprar', about: 'Sobre', faq: 'Dúvidas' },
      hero: {
        eyebrow: 'O Boticário na Itália',
        title: 'A beleza do <em>Brasil</em>, pertinho de você.',
        lead: 'Os perfumes e cuidados que você ama, com atendimento em português e italiano. Escolha na vitrine e finalize pelo WhatsApp.',
        cta: 'Ver a vitrine',
        whats: 'Falar no WhatsApp',
        ring: 'Perfumaria ✦ Corpo & banho ✦ Maquiagem ✦ Cabelos ✦ Presentes ✦ ',
        scroll: 'Role para ver',
      },
      promise: [
        { icon: 'i-seal', title: 'Produtos originais', text: 'Linhas O Boticário que o Brasil inteiro conhece.' },
        { icon: 'i-chat', title: 'Atendimento em português', text: 'E em italiano também. Tire dúvidas antes de comprar.' },
        { icon: 'i-bag', title: 'Pedido em 1 minuto', text: 'Monte a sacola e envie pelo WhatsApp, sem cadastro.' },
      ],
      shop: {
        eyebrow: 'Vitrine',
        title: 'Escolha o seu <em>favorito</em>',
        lead: 'Estoque atualizado: o que aparece aqui está pronto para você.',
        all: 'Todos',
        search: 'Buscar perfume, creme, linha…',
        clear: 'Limpar busca',
        empty: 'Nada encontrado para essa busca. Que tal perguntar no WhatsApp?',
        emptyAsk: 'Perguntar no WhatsApp',
        more: 'Ver mais produtos',
        count: '{n} produtos',
        count1: '1 produto',
      },
      product: {
        add: 'Adicionar',
        added: 'Na sacola',
        details: 'Detalhes',
        inStock: 'Em estoque',
        low: 'Últimas {n} unidades',
        low1: 'Última unidade',
        out: 'Esgotado',
        notify: 'Avise-me',
        notifyMsg: 'Olá, {brand}! Pode me avisar quando chegar *{name}*?',
        family: 'Família',
        size: 'Tamanho',
        new: 'Novo',
        qty: 'Quantidade',
        maxed: 'Você já pegou todas as unidades em estoque.',
        less: 'Tirar um',
        plus: 'Pôr mais um',
      },
      loved: {
        eyebrow: 'Mais amados',
        title: 'Os queridinhos da <em>casa</em>',
        prev: 'Anterior',
        next: 'Próximo',
        pause: 'Pausar',
        play: 'Continuar',
      },
      how: {
        eyebrow: 'Como comprar',
        title: 'Simples como <em>mandar um oi</em>',
        steps: [
          { title: 'Escolha', text: 'Toque em “Adicionar” nos produtos que quiser. A sacola soma tudo para você.' },
          { title: 'Envie pelo WhatsApp', text: 'Diga seu nome e como prefere receber. O pedido vai pronto, é só enviar.' },
          { title: 'Receba', text: 'Confirmamos o estoque, o pagamento e a entrega com você pelo WhatsApp.' },
        ],
      },
      about: {
        eyebrow: 'Sobre',
        title: 'Um pedacinho do <em>Brasil</em> na Itália',
        text: [
          'A {brand} nasceu para levar os perfumes e cuidados do Boticário para quem vive na Itália, sem precisar esperar alguém trazer na mala.',
          'Cada pedido é separado com carinho e atendido pessoalmente, em português ou em italiano.',
        ],
        sign: 'com carinho',
      },
      faq: {
        eyebrow: 'Dúvidas',
        title: 'Perguntas <em>frequentes</em>',
        items: [
          { q: 'Os produtos são originais?', a: 'Sim. Trabalhamos só com produtos originais O Boticário, lacrados.' },
          { q: 'Como faço o pedido?', a: 'Adicione os produtos à sacola, preencha seu nome e toque em “Enviar pedido pelo WhatsApp”. A mensagem já vai pronta: é só enviar.' },
          { q: 'Como funciona o pagamento?', a: 'Combinamos pelo WhatsApp depois de confirmar o estoque. Você só paga quando o pedido estiver confirmado.' },
          { q: 'Vocês entregam?', a: 'Sim. Você pode retirar pessoalmente ou receber em casa. Prazo e frete são combinados pelo WhatsApp, conforme a sua cidade.' },
          { q: 'O produto que eu quero está esgotado. E agora?', a: 'Toque em “Avise-me” no produto: a mensagem chega no nosso WhatsApp e avisamos assim que ele voltar.' },
          { q: 'Não achei o produto que procuro.', a: 'Fale com a gente: muitas vezes conseguimos trazer produtos da linha que ainda não estão na vitrine.' },
        ],
      },
      final: {
        title: 'Vamos montar o seu <em>pedido</em>?',
        text: 'Ficou com alguma dúvida? Mande uma mensagem: respondemos em português ou em italiano.',
        cta: 'Falar no WhatsApp',
      },
      footer: {
        disclaimer: 'Revenda independente de produtos O Boticário. O Boticário é uma marca do Grupo Boticário.',
        rights: 'Todos os direitos reservados.',
      },
      cart: {
        title: 'Sua sacola',
        empty: 'Sua sacola está vazia.',
        emptyCta: 'Ver a vitrine',
        subtotal: 'Total',
        items: '{n} itens',
        items1: '1 item',
        remove: 'Remover',
        name: 'Seu nome',
        namePh: 'Como podemos te chamar?',
        delivery: 'Como prefere receber?',
        pickup: 'Retirar pessoalmente',
        ship: 'Receber em casa',
        city: 'Cidade',
        cityPh: 'Ex.: Milano',
        notes: 'Observações (opcional)',
        notesPh: 'Presente, cor preferida, horário…',
        send: 'Enviar pedido pelo WhatsApp',
        note: 'Nada é cobrado agora: confirmamos estoque, pagamento e entrega com você pelo WhatsApp.',
        needName: 'Escreva seu nome para enviarmos o pedido.',
        open: 'Ver sacola',
        changed: 'O estoque mudou: ajustamos a quantidade de alguns itens.',
        gone: 'esgotou e saiu da sacola',
      },
      order: {
        hello: 'Olá, {brand}! Quero fazer um pedido:',
        total: 'Total',
        name: 'Nome',
        delivery: 'Entrega',
        notes: 'Observações',
      },
      whatsHello: 'Olá, {brand}! Vim pelo site e queria tirar uma dúvida.',
      loadError: 'Não foi possível carregar a planilha de estoque. Mostrando a lista do site.',
    },

    it: {
      meta: {
        title: 'Amarabotibeauty · Prodotti O Boticário in Italia',
        description: 'Profumi, creme, make-up e kit O Boticário in Italia. Scegli in vetrina e ordina su WhatsApp.',
      },
      ui: {
        skip: 'Vai ai prodotti',
        menu: 'Menu',
        close: 'Chiudi',
        lang: 'Português',
        cart: 'Borsa',
        top: 'Torna su',
      },
      nav: { shop: 'Vetrina', loved: 'I più amati', how: 'Come ordinare', about: 'Chi siamo', faq: 'Domande' },
      hero: {
        eyebrow: 'O Boticário in Italia',
        title: 'La bellezza del <em>Brasile</em>, vicino a te.',
        lead: 'I profumi e la cura del corpo che ami, con assistenza in italiano e portoghese. Scegli in vetrina e concludi su WhatsApp.',
        cta: 'Scopri la vetrina',
        whats: 'Scrivici su WhatsApp',
        ring: 'Profumeria ✦ Corpo & bagno ✦ Make-up ✦ Capelli ✦ Regali ✦ ',
        scroll: 'Scorri',
      },
      promise: [
        { icon: 'i-seal', title: 'Prodotti originali', text: 'Le linee O Boticário amate in tutto il Brasile.' },
        { icon: 'i-chat', title: 'Assistenza in italiano', text: 'E anche in portoghese. Chiedici tutto prima di ordinare.' },
        { icon: 'i-bag', title: 'Ordini in 1 minuto', text: 'Riempi la borsa e inviala su WhatsApp, senza registrazione.' },
      ],
      shop: {
        eyebrow: 'Vetrina',
        title: 'Scegli il tuo <em>preferito</em>',
        lead: 'Disponibilità aggiornata: quello che vedi qui è pronto per te.',
        all: 'Tutti',
        search: 'Cerca profumo, crema, linea…',
        clear: 'Cancella ricerca',
        empty: 'Nessun risultato per questa ricerca. Chiedici su WhatsApp!',
        emptyAsk: 'Chiedi su WhatsApp',
        more: 'Mostra altri prodotti',
        count: '{n} prodotti',
        count1: '1 prodotto',
      },
      product: {
        add: 'Aggiungi',
        added: 'Nella borsa',
        details: 'Dettagli',
        inStock: 'Disponibile',
        low: 'Ultimi {n} pezzi',
        low1: 'Ultimo pezzo',
        out: 'Esaurito',
        notify: 'Avvisami',
        notifyMsg: 'Ciao {brand}! Mi avvisi quando torna disponibile *{name}*?',
        family: 'Famiglia',
        size: 'Formato',
        new: 'Novità',
        qty: 'Quantità',
        maxed: 'Hai già preso tutti i pezzi disponibili.',
        less: 'Togli uno',
        plus: 'Aggiungi uno',
      },
      loved: {
        eyebrow: 'I più amati',
        title: 'I preferiti della <em>casa</em>',
        prev: 'Precedente',
        next: 'Successivo',
        pause: 'Pausa',
        play: 'Riprendi',
      },
      how: {
        eyebrow: 'Come ordinare',
        title: 'Facile come <em>mandare un ciao</em>',
        steps: [
          { title: 'Scegli', text: 'Tocca “Aggiungi” sui prodotti che vuoi. La borsa fa i conti per te.' },
          { title: 'Invia su WhatsApp', text: 'Scrivi il tuo nome e come preferisci ricevere. Il messaggio è già pronto.' },
          { title: 'Ricevi', text: 'Confermiamo disponibilità, pagamento e consegna con te su WhatsApp.' },
        ],
      },
      about: {
        eyebrow: 'Chi siamo',
        title: 'Un pezzetto di <em>Brasile</em> in Italia',
        text: [
          '{brand} nasce per portare i profumi e i prodotti di O Boticário a chi vive in Italia, senza aspettare che qualcuno li porti in valigia.',
          'Ogni ordine è preparato con cura e seguito di persona, in italiano o in portoghese.',
        ],
        sign: 'con affetto',
      },
      faq: {
        eyebrow: 'Domande',
        title: 'Domande <em>frequenti</em>',
        items: [
          { q: 'I prodotti sono originali?', a: 'Sì. Vendiamo solo prodotti originali O Boticário, sigillati.' },
          { q: 'Come faccio un ordine?', a: 'Aggiungi i prodotti alla borsa, scrivi il tuo nome e tocca “Invia l’ordine su WhatsApp”. Il messaggio è già pronto: basta inviarlo.' },
          { q: 'Come si paga?', a: 'Lo concordiamo su WhatsApp dopo aver confermato la disponibilità. Paghi solo quando l’ordine è confermato.' },
          { q: 'Fate consegne?', a: 'Sì. Puoi ritirare di persona o ricevere a casa. Tempi e spedizione si concordano su WhatsApp, in base alla tua città.' },
          { q: 'Il prodotto che voglio è esaurito. Cosa faccio?', a: 'Tocca “Avvisami” sul prodotto: il messaggio arriva sul nostro WhatsApp e ti avvisiamo appena torna.' },
          { q: 'Non trovo il prodotto che cerco.', a: 'Scrivici: spesso riusciamo a procurare prodotti della linea che non sono ancora in vetrina.' },
        ],
      },
      final: {
        title: 'Prepariamo il tuo <em>ordine</em>?',
        text: 'Hai qualche dubbio? Mandaci un messaggio: rispondiamo in italiano o in portoghese.',
        cta: 'Scrivici su WhatsApp',
      },
      footer: {
        disclaimer: 'Rivenditore indipendente di prodotti O Boticário. O Boticário è un marchio del Grupo Boticário.',
        rights: 'Tutti i diritti riservati.',
      },
      cart: {
        title: 'La tua borsa',
        empty: 'La tua borsa è vuota.',
        emptyCta: 'Scopri la vetrina',
        subtotal: 'Totale',
        items: '{n} articoli',
        items1: '1 articolo',
        remove: 'Rimuovi',
        name: 'Il tuo nome',
        namePh: 'Come ti chiami?',
        delivery: 'Come preferisci ricevere?',
        pickup: 'Ritiro di persona',
        ship: 'Consegna a casa',
        city: 'Città',
        cityPh: 'Es.: Milano',
        notes: 'Note (facoltativo)',
        notesPh: 'Regalo, colore preferito, orario…',
        send: 'Invia l’ordine su WhatsApp',
        note: 'Non paghi niente adesso: confermiamo disponibilità, pagamento e consegna con te su WhatsApp.',
        needName: 'Scrivi il tuo nome per inviare l’ordine.',
        open: 'Vedi borsa',
        changed: 'La disponibilità è cambiata: abbiamo aggiornato alcune quantità.',
        gone: 'è esaurito ed è stato tolto dalla borsa',
      },
      order: {
        hello: 'Ciao {brand}! Vorrei fare un ordine:',
        total: 'Totale',
        name: 'Nome',
        delivery: 'Consegna',
        notes: 'Note',
      },
      whatsHello: 'Ciao {brand}! Vengo dal sito e vorrei una informazione.',
      loadError: 'Non è stato possibile caricare la disponibilità aggiornata. Mostriamo l’elenco del sito.',
    },
  },
};
