/* =============================================================================
   CONTEÚDO DO SITE — os dados que mudam com o tempo ficam neste arquivo.
   -----------------------------------------------------------------------------
   • Contato, endereço, horários e aviso ..... seção 1
   • Prêmios e Gift Vouchers ................. seção 2
   • Instagram (feed automático) ............. seção 3
   • Fotos da vitrine e pratos em destaque ... seção 4
   • Cardápio (sem preços) ................... seção 5
   • Avaliações .............................. seção 6

   Os títulos e a história do café estão no index.html.
   Os textos do site são em inglês (o público do café é irlandês).

   Dica: mantenha as aspas e as vírgulas no fim de cada linha. Se o site
   ficar em branco depois de uma edição, quase sempre é uma vírgula faltando.
   ========================================================================== */

window.SITE = {
  /* ---------------------------------------------------------------------------
     1. CAFÉ
     ------------------------------------------------------------------------- */
  name: 'The Berry Coffee',
  tagline: 'Good food. Great coffee. Cosy days.',

  phone: '085 737 2391', // Telefone do café, como aparece no site. O botão de ligar usa este mesmo número.
  whatsapp: '',          // WhatsApp do café (ex.: '085 737 2391'). Vazio = sem botão de WhatsApp.
  email: 'hello@theberrycoffee.ie',

  address: {
    street: '2 Main Street',
    town: 'Arklow',
    county: 'Co. Wicklow',
    eircode: 'Y14 N8C1',
  },

  social: {
    instagram: 'theberrycoffee', // Usuário sem @
    facebook: 'https://www.facebook.com/p/The-Berry-Coffee-61563827972137/',
    tripadvisor: 'https://www.tripadvisor.ie/Restaurant_Review-g186645-d33370084-Reviews-The_Berry_Coffee-Arklow_County_Wicklow.html',
    google: '', // Link "Escrever avaliação" do Google (opcional). Vazio = abre o café no Google Maps.
  },

  // Horário de funcionamento, na hora da Irlanda. null = fechado.
  // O site calcula sozinho "Open now", "Closing soon" e o próximo dia aberto.
  hours: {
    mon: ['09:00', '16:00'],
    tue: null,
    wed: ['09:00', '16:00'],
    thu: ['09:00', '16:00'],
    fri: ['09:00', '16:00'],
    sat: ['09:00', '16:00'],
    sun: ['09:00', '16:00'],
  },

  // Feriados e dias diferentes: 'closed' ou ['10:00', '14:00'].
  specialDays: {
    // '2026-12-25': 'closed',
    // '2026-12-24': ['09:00', '13:00'],
  },

  // Faixa de aviso no topo do site. Vazio = sem aviso.
  // Ex.: 'Closed 24–27 December. Happy Christmas from all of us!'
  notice: '',

  // Faixa verde que passa abaixo da vitrine
  ticker: [
    'All-day Irish breakfast',
    'French toast',
    'Fluffy pancakes',
    'Açaí',
    'Matcha',
    'Homemade cakes',
    'Vegan & gluten-free options',
    'Award-winning service',
    'Gift vouchers',
  ],

  /* ---------------------------------------------------------------------------
     2. PRÊMIOS E GIFT VOUCHERS
     -------------------------------------------------------------------------
     O primeiro prêmio da lista é o destaque da seção "Award-winning".
     Os outros aparecem embaixo, em uma lista. Para incluir um prêmio,
     copie o bloco { ... } e troque os textos.
     ------------------------------------------------------------------------- */
  awards: [
    {
      title: 'Exceptional Customer Service Award',
      year: '2026',
      by: 'Arklow & District Chamber of Commerce',
      quote: 'Every visit, conversation and kind word has helped us get here. This achievement belongs to all of us. Thank you, Arklow, for making us feel so at home.',
      photo: 'assets/img/photos/award.webp',
      photoAlt: 'Thiago smiling next to the Arklow & District Chamber award plaque on the café wall',
      caption: 'Over the moon!', // Bilhetinho escrito à mão na foto (opcional)
      url: 'https://www.instagram.com/p/Ddvetu5KHEd/',
    },
  ],

  vouchers: {
    // Link para comprar o voucher online, se um dia houver. Vazio = sem esse botão
    // (a pessoa liga, manda e-mail ou mensagem no Instagram).
    buyUrl: '',
  },

  /* ---------------------------------------------------------------------------
     3. INSTAGRAM
     -------------------------------------------------------------------------
     feedUrl: endereço de um feed JSON do Behold (behold.so). Com ele, o site
     mostra sozinho os posts mais novos do Instagram (veja o README).
     Vazio = o site mostra os posts abaixo, salvos em assets/img/feed/.
     ------------------------------------------------------------------------- */
  instagram: {
    feedUrl: '',
    count: 12, // Quantos posts aparecem
    posts: [
      { img: 'assets/img/feed/01-hot-chocolate-reel.webp', url: 'https://www.instagram.com/p/DeWFNeHK6yp/', type: 'reel', caption: 'The new hot chocolate with toasted marshmallows is just amazing… It’s like a warm hug in a cup! ☕️🍫' },
      { img: 'assets/img/feed/02-caption-this.webp', url: 'https://www.instagram.com/p/DeQ3SqPqTk1/', type: 'reel', caption: '☕😂 Caption this & win! Best caption wins a personalised The Berry Coffee cup.' },
      { img: 'assets/img/feed/03-toasty.webp', url: 'https://www.instagram.com/p/DeL1QMoq9V4/', type: 'reel', caption: 'Sweet. Creamy. Toasty. Irresistibly cosy. Come warm up with us at The Berry Coffee, Arklow.' },
      { img: 'assets/img/feed/04-whisk.webp', url: 'https://www.instagram.com/p/DeECOCsqDfW/', type: 'reel', caption: '🎶 I think I’ll take my whisk and leave… When it comes to whipped cream, no one wants to give up the whisk. 😂' },
      { img: 'assets/img/feed/05-call-us.webp', url: 'https://www.instagram.com/p/DeBgbvuq4Vd/', type: 'reel', caption: 'Hey, we just met you… and this is crazy… but here’s our number. 📞😂 Coffee, treats and good chats included.' },
      { img: 'assets/img/feed/06-boxty.webp', url: 'https://www.instagram.com/p/Dd-6QHxKV_C/', type: 'reel', caption: 'Chef George plating up one of the new additions to our autumn menu: Irish Beef & Potato Boxty 🇮🇪' },
      { img: 'assets/img/feed/07-autumn-menu.webp', url: 'https://www.instagram.com/p/Dd8U9gmqTfB/', type: 'reel', caption: 'The season just changed. So did our menu. 🍂 Taste the season.' },
      { img: 'assets/img/feed/08-autumn-drinks.webp', url: 'https://www.instagram.com/p/Dd5z3BxiqVy/', type: 'carousel', caption: 'Autumn has arrived. 🍂 Come find the one that’s very much your cup of tea. Or coffee. We’re not judging. ☕️' },
      { img: 'assets/img/feed/09-a-toast.webp', url: 'https://www.instagram.com/p/Dd0pySxq26Q/', type: 'reel', caption: 'A toast to the happiness of feeling that we truly belong here. Thank you, Arklow, for making us feel so at home. 🥂' },
      { img: 'assets/img/feed/10-award.webp', url: 'https://www.instagram.com/p/Ddvetu5KHEd/', type: 'reel', caption: 'We are over the moon: The Berry Coffee is the winner of the 2026 Exceptional Customer Service Award by Arklow & District Chamber of Commerce! 🏆' },
      { img: 'assets/img/feed/11-kitchen-concert.webp', url: 'https://www.instagram.com/p/DdqTdAkqMto/', type: 'reel', caption: 'Just another day at The Berry Coffee… ☕️ Coffee? ✔️ 🎤 Whitney Houston concert? Apparently. 😂' },
      { img: 'assets/img/feed/berry-brunch.webp', url: 'https://www.instagram.com/p/DdnucdMKxet/', type: 'reel', caption: 'Guess what’s back? The Berry Brunch! From a classic Full Irish to fluffy pancakes, we’ve got something for everyone. Come hungry, leave happy! ☕️🍓' },
    ],
  },

  /* ---------------------------------------------------------------------------
     4. FOTOS DA VITRINE (topo) E PRATOS EM DESTAQUE
     ------------------------------------------------------------------------- */
  // Fotos que se alternam na "vitrine" do topo (formato 4:5, em pé)
  window: [
    { img: 'assets/img/photos/berry-brunch.webp', caption: 'Brunch at The Berry', alt: 'A brunch board with sausage, rashers, black pudding, mushrooms, grilled tomato, halloumi, scrambled eggs, beans, potatoes and brown bread' },
    { img: 'assets/img/photos/full-irish.webp', caption: 'The Full Irish · served all day', alt: 'A Full Irish breakfast with sausages, rashers, black and white pudding, beans, a fried egg and toast, by the café window' },
    { img: 'assets/img/photos/matcha.webp', caption: 'Matcha, hot or iced', alt: 'Thiago holding two iced matcha drinks in The Berry Coffee cups' },
    { img: 'assets/img/photos/chorizo-eggs.webp', caption: 'Eggs on sourdough', alt: 'Scrambled eggs on toasted sourdough with golden potatoes on a plate' },
    { img: 'assets/img/photos/toasties.webp', caption: 'Sourdough toasties for lunch', alt: 'Three toasted sourdough sandwiches on ribbed plates, seen from above' },
  ],

  // Destaque grande ao lado dos pratos
  feature: {
    img: 'assets/img/photos/berry-brunch.webp',
    alt: 'The Berry brunch board: sausage, rashers, black pudding, mushrooms, tomato, halloumi, eggs, beans, potatoes and brown bread',
    title: 'All-day brunch',
    note: 'Something for everyone!',
  },

  // Pratos em destaque (aparecem em pratos redondos). Só pratos do ano todo.
  favourites: [
    {
      name: 'The Full Irish',
      desc: 'Sausages, rashers, black and white pudding, egg, beans, grilled tomato, mushroom, crispy potatoes and toast. The works.',
      tag: 'Served all day',
      img: 'assets/img/plates/full-irish.webp',
      alt: 'Full Irish breakfast seen from above',
    },
    {
      name: 'Eggs on Sourdough',
      desc: 'Creamy scrambled eggs on toasted sourdough, with golden potatoes on the side.',
      tag: 'Brunch',
      img: 'assets/img/plates/chorizo-eggs.webp',
      alt: 'Scrambled eggs on sourdough with golden potatoes',
    },
    {
      name: 'Sourdough Toasties',
      desc: 'Toasted sourdough sandwiches, generously filled and made to order.',
      tag: 'Lunch',
      img: 'assets/img/plates/sourdough-toastie.webp',
      alt: 'A toasted sourdough sandwich filled with chicken and roasted vegetables',
    },
    {
      name: 'Matcha',
      desc: 'Hot or iced: creamy, earthy and perfectly balanced.',
      tag: 'Every day',
      img: 'assets/img/plates/matcha.webp',
      alt: 'Two iced matcha drinks in cups with The Berry Coffee logo',
    },
  ],

  /* ---------------------------------------------------------------------------
     5. CARDÁPIO
     -------------------------------------------------------------------------
     Só os pratos principais, que existem o ano todo, sem preços.
     Os pratos da estação ficam no Instagram (o site mostra um quadro que leva pra lá).
     ------------------------------------------------------------------------- */
  menu: [
    {
      title: 'Breakfast & brunch',
      note: 'Served all day',
      items: [
        { name: 'The Full Irish', desc: 'Sausages, rashers, black and white pudding, egg, beans, grilled tomato, mushroom, crispy potatoes and toast.' },
        { name: 'French Toast', desc: 'Golden, thick and properly indulgent.' },
        { name: 'Fluffy Pancakes', desc: 'Stacked high and properly fluffy.' },
        { name: 'Eggs on Sourdough', desc: 'Creamy scrambled eggs on toasted sourdough.' },
        { name: 'Açaí Bowl', desc: 'A little taste of Brazil, topped with fresh fruit.' },
      ],
    },
    {
      title: 'Lunch',
      items: [
        { name: 'Sourdough Toasties', desc: 'Generously filled and toasted to order.' },
        { name: 'Signature dishes', desc: 'Ask the team what Chef George is cooking today.' },
      ],
    },
    {
      title: 'Cakes & bakes',
      note: 'Baked in our kitchen',
      items: [
        { name: 'Banana bread' },
        { name: 'Fresh scones', desc: 'Fruit or plain.' },
        { name: 'Homemade cakes', desc: 'With gluten-free and dairy-free options.' },
      ],
    },
    {
      title: 'Coffee & drinks',
      items: [
        { name: 'Coffee', desc: 'Espresso, Americano, latte, flat white, cappuccino and mocha.' },
        { name: 'Matcha & chai', desc: 'Hot or iced.' },
        { name: 'Hot chocolate & tea' },
        { name: 'Smoothies & fresh juices' },
        { name: 'Plant milks', desc: 'Oat, almond, coconut or soya.' },
      ],
    },
  ],

  /* ---------------------------------------------------------------------------
     6. AVALIAÇÕES
     ------------------------------------------------------------------------- */
  reviews: [
    {
      text: 'Thanks to the Berry Coffee for the delicious homemade food, excellent coffee, and friendly service. We will definitely be back. Very reasonably priced too.',
      name: 'Allison R.',
    },
    {
      text: 'Each time you go in the welcome you get is wonderful. Sets you up for lovely coffee/lunch, whatever it is you may have… they absolutely own it in every single way.',
      name: 'Paul M.',
    },
  ],
};
