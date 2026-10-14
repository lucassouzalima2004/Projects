/* =============================================================================
   CONTEÚDO DO SITE — os dados que mudam com o tempo ficam neste arquivo.
   -----------------------------------------------------------------------------
   • Contato, endereço, horários e aviso ..... seção 1
   • Instagram (feed automático) ............. seção 2
   • Pratos em destaque e fotos da vitrine ... seção 3
   • Cardápio e preços ....................... seção 4
   • Avaliações .............................. seção 5

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

  phone: '+353 83 349 4689',   // Como aparece no site
  whatsapp: '353833494689',    // Só dígitos, com 353 na frente
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

  award: {
    title: 'Exceptional Customer Service Award 2026',
    by: 'Arklow & District Chamber of Commerce',
    url: 'https://www.instagram.com/p/Ddvetu5KHEd/',
  },

  /* ---------------------------------------------------------------------------
     2. INSTAGRAM
     -------------------------------------------------------------------------
     feedUrl: endereço de um feed JSON do Behold (behold.so). Com ele, o site
     mostra sozinho os posts mais novos do Instagram (veja o README).
     Vazio = o site mostra os posts abaixo, salvos em assets/img/feed/.
     ------------------------------------------------------------------------- */
  instagram: {
    feedUrl: '',
    count: 12, // Quantos posts aparecem
    posts: [
      { img: 'assets/img/feed/10-award.webp', url: 'https://www.instagram.com/p/Ddvetu5KHEd/', type: 'reel', caption: 'We are over the moon: The Berry Coffee is the winner of the 2026 Exceptional Customer Service Award by Arklow & District Chamber of Commerce! 🏆' },
      { img: 'assets/img/feed/01-hot-chocolate-reel.webp', url: 'https://www.instagram.com/p/DeWFNeHK6yp/', type: 'reel', caption: 'The new hot chocolate with toasted marshmallows is just amazing… It’s like a warm hug in a cup! ☕️🍫' },
      { img: 'assets/img/feed/07-autumn-menu.webp', url: 'https://www.instagram.com/p/Dd8U9gmqTfB/', type: 'reel', caption: 'The season just changed. So did our menu. 🍂 The Berry Autumn Menu. Taste the season.' },
      { img: 'assets/img/feed/06-boxty.webp', url: 'https://www.instagram.com/p/Dd-6QHxKV_C/', type: 'reel', caption: 'Chef George plating up one of the new additions to our autumn menu: Irish Beef & Potato Boxty 🇮🇪' },
      { img: 'assets/img/feed/08-autumn-drinks.webp', url: 'https://www.instagram.com/p/Dd5z3BxiqVy/', type: 'carousel', caption: 'Autumn has arrived. 🍂 Come find the one that’s very much your cup of tea. Or coffee. We’re not judging. ☕️' },
      { img: 'assets/img/feed/05-call-us.webp', url: 'https://www.instagram.com/p/DeBgbvuq4Vd/', type: 'reel', caption: 'Hey, we just met you… and this is crazy… but here’s our number. 📞😂 Or just pop in and say hello!' },
      { img: 'assets/img/feed/03-toasty.webp', url: 'https://www.instagram.com/p/DeL1QMoq9V4/', type: 'reel', caption: 'Sweet. Creamy. Toasty. Irresistibly cosy. Come warm up with us at The Berry Coffee, Arklow.' },
      { img: 'assets/img/feed/09-a-toast.webp', url: 'https://www.instagram.com/p/Dd0pySxq26Q/', type: 'reel', caption: 'A toast to the happiness of feeling that we truly belong here. Thank you, Arklow, for making us feel so at home. 🥂' },
      { img: 'assets/img/feed/04-whisk.webp', url: 'https://www.instagram.com/p/DeECOCsqDfW/', type: 'reel', caption: '🎶 I think I’ll take my whisk and leave… When it comes to whipped cream, no one wants to give up the whisk. 😂' },
      { img: 'assets/img/feed/02-caption-this.webp', url: 'https://www.instagram.com/p/DeQ3SqPqTk1/', type: 'reel', caption: '☕😂 Caption this & win! Best caption wins a personalised The Berry Coffee cup.' },
      { img: 'assets/img/feed/00-winner.webp', url: 'https://www.instagram.com/p/DedxRhkqqfY/', type: 'image', caption: '🏆 Congratulations, @1966suzieg! You’ve won your very own personalised The Berry Coffee cup!' },
      { img: 'assets/img/feed/11-kitchen-concert.webp', url: 'https://www.instagram.com/p/DdqTdAkqMto/', type: 'reel', caption: 'Just another day at The Berry Coffee… ☕️ Coffee? ✔️ 🎤 Whitney Houston concert? Apparently. 😂' },
    ],
  },

  /* ---------------------------------------------------------------------------
     3. FOTOS DA VITRINE (topo) E PRATOS EM DESTAQUE
     ------------------------------------------------------------------------- */
  // Faixa azul que passa abaixo da vitrine
  ticker: [
    'All-day Irish breakfast',
    'French toast',
    'Pancakes',
    'Açaí',
    'Matcha',
    'Homemade cakes',
    'Vegan & gluten-free options',
    'Award-winning service',
  ],

  // Fotos que se alternam na "vitrine" do topo (formato 4:5, em pé)
  window: [
    { img: 'assets/img/photos/full-irish.webp', caption: 'The Full Irish · served all day', alt: 'A Full Irish breakfast with sausages, rashers, black and white pudding, beans, a fried egg and toast, by the café window' },
    { img: 'assets/img/photos/autumn-drinks.webp', caption: 'Iced matcha & iced chai · autumn menu', alt: 'An iced matcha and an iced chai latte in The Berry Coffee cups, with pumpkin and cinnamon on the counter' },
    { img: 'assets/img/photos/chorizo-eggs.webp', caption: 'Chorizo scrambled eggs on sourdough', alt: 'Scrambled eggs with chorizo and spinach on toasted sourdough, with golden potatoes on a navy plate' },
    { img: 'assets/img/photos/hot-chocolate.webp', caption: 'Hot chocolate with toasted marshmallows', alt: 'Two hot chocolates topped with toasted marshmallows, whipped cream and caramel' },
    { img: 'assets/img/photos/toasties.webp', caption: 'Sourdough toasties for lunch', alt: 'Three toasted sourdough sandwiches on navy ribbed plates, seen from above' },
  ],

  // Pratos em destaque (aparecem em pratos redondos)
  favourites: [
    {
      name: 'The Full Irish',
      desc: 'Sausages, rashers, black and white pudding, a fried egg, beans, grilled tomato, mushroom, crispy potatoes and toast. The works.',
      tag: 'Served all day',
      img: 'assets/img/plates/full-irish.webp',
      alt: 'Full Irish breakfast seen from above',
    },
    {
      name: 'Chorizo Scrambled Eggs',
      desc: 'Soft scrambled eggs on toasted sourdough with spinach and crispy chorizo, with golden potatoes on the side.',
      tag: 'Brunch',
      img: 'assets/img/plates/chorizo-eggs.webp',
      alt: 'Scrambled eggs with chorizo on sourdough and golden potatoes',
    },
    {
      name: 'Sourdough Toasties',
      desc: 'Toasted sourdough, generously filled with roast chicken, avocado, roasted peppers and more.',
      tag: 'Lunch',
      img: 'assets/img/plates/sourdough-toastie.webp',
      alt: 'A toasted sourdough sandwich filled with chicken and roasted vegetables',
    },
    {
      name: 'Toasted Marshmallow Hot Chocolate',
      desc: 'Rich, creamy and topped with perfectly toasted, gooey marshmallows. A warm hug in a cup.',
      tag: 'New',
      img: 'assets/img/plates/hot-chocolate.webp',
      alt: 'A cup of hot chocolate topped with golden toasted marshmallows',
    },
  ],

  /* ---------------------------------------------------------------------------
     4. CARDÁPIO
     -------------------------------------------------------------------------
     price ...... preço em euro (número, sem €). Vazio ('') = não mostra preço.
     add ........ true = mostra "+€0.50" (acréscimo)
     tags ....... 'v' vegetariano, 'vg' vegano, 'gf' sem glúten, 'df' sem lactose
     new ........ true = selo "New"

     Seção com seasonal: true vira o quadro de destaque da estação, com fotos
     e o emoji caindo (🍂 outono, ❄️ inverno, 🌸 primavera, ☀️ verão).
     ------------------------------------------------------------------------- */
  menu: [
    {
      id: 'breakfast',
      title: 'Breakfast & brunch',
      note: 'Served all day',
      items: [
        { name: 'The Full Irish', desc: 'Sausages, rashers, black and white pudding, fried egg, beans, grilled tomato, mushroom, crispy potatoes and toast.', price: '' },
        { name: 'Chorizo Scrambled Eggs', desc: 'On toasted sourdough with spinach and crispy chorizo, with golden potatoes.', price: '' },
        { name: 'French Toast', desc: 'Golden, thick and properly indulgent.', price: '' },
        { name: 'Pancakes', desc: 'Fluffy pancakes, stacked high.', price: '' },
        { name: 'Açaí Bowl', desc: 'A little taste of Brazil, topped with fresh fruit.', price: '' },
      ],
    },
    {
      id: 'lunch',
      title: 'Lunch',
      items: [
        { name: 'Sourdough Toasties', desc: 'Generously filled: roast chicken, avocado, roasted peppers and more.', price: '' },
        { name: 'Irish Beef & Potato Boxty', desc: 'Crispy potato boxty with slow-cooked Irish beef. Warm, comforting and full of flavour.', price: '', new: true },
      ],
    },
    {
      id: 'autumn',
      title: 'Autumn specials',
      note: 'Homemade syrups',
      seasonal: true,
      emoji: '🍂',
      photos: [
        { img: 'assets/img/photos/iced-chai.webp', alt: 'Iced chai latte with pumpkin spice homemade syrup' },
        { img: 'assets/img/photos/iced-matcha.webp', alt: 'Iced matcha with pumpkin spice homemade syrup' },
      ],
      items: [
        { name: 'Iced Chai Latte', desc: 'With our homemade pumpkin syrup. Warm spices, smooth and indulgent.', price: 6 },
        { name: 'Iced Matcha', desc: 'With homemade syrup. Creamy, earthy and perfectly balanced.', price: 6 },
        { name: 'Ube Berry Matcha', desc: 'Iced matcha with coconut milk, homemade strawberry jam, vanilla and purple ube.', price: 6 },
        { name: 'Strawberry Matcha Paradise', desc: 'Milk, matcha, vanilla and homemade strawberry syrup over ice.', price: 6 },
        { name: 'Mango Matcha', desc: 'Milk, matcha, vanilla and mango jam over ice.', price: 6 },
        { name: 'Iced Mocha & Cream', desc: 'Milk, chocolate, espresso and ice, with cream on top.', price: 6 },
        { name: 'Hot Chai Latte', price: 3.6 },
        { name: 'Hot Matcha Latte', price: 3.6 },
      ],
    },
    {
      id: 'coffee',
      title: 'Coffee & hot drinks',
      items: [
        { name: 'Espresso', price: 2 },
        { name: 'Double espresso', price: 2.5 },
        { name: 'Americano', price: 3 },
        { name: 'Latte', price: 3.5 },
        { name: 'Flat white', price: 3.5 },
        { name: 'Cappuccino', price: 3.5 },
        { name: 'Mocha', price: 3.6 },
        { name: 'Chai latte', price: 3.6 },
        { name: 'Matcha latte', price: 3.6 },
        { name: 'Hot chocolate', price: 3.6 },
        { name: 'Tea', price: 3 },
        { name: 'Extra shot', price: 0.5, add: true },
        { name: 'Plant milk', desc: 'Oat, almond, coconut or soya.', price: 0.5, add: true },
      ],
    },
    {
      id: 'cakes',
      title: 'Cakes & bakes',
      note: 'Baked in our kitchen',
      items: [
        { name: 'Lemon cake', price: 4, tags: ['gf'] },
        { name: 'Banana bread', price: 3.5 },
        { name: 'Carrot cake', price: 4, tags: ['df'] },
        { name: 'Bakewell cake', price: 4, tags: ['gf', 'df'] },
        { name: 'Fresh scones', desc: 'Fruit or plain.', price: 3.5 },
      ],
    },
    {
      id: 'smoothies',
      title: 'Smoothies & juices',
      items: [
        { name: 'Berry Smoothie', desc: 'Strawberries, blueberries and raspberries, blended with apple juice or milk.', price: 6 },
        { name: 'Strawberry & Banana Smoothie', desc: 'Milk, banana, honey and strawberries.', price: 6 },
        { name: 'Tropical Smoothie', desc: 'Mango, pineapple, banana, coconut milk and apple juice.', price: 6 },
        { name: 'Blue Cloud', desc: 'Coconut milk, spirulina, pineapple, mango and Greek yoghurt.', price: 6 },
        { name: 'Orange & Strawberry Twist', desc: 'Fresh orange juice blended with honey, strawberries and ice.', price: 6 },
        { name: 'Orange juice with bits', price: 3 },
        { name: 'Apple juice', price: 3 },
        { name: 'Soft drinks', price: 3 },
        { name: 'Lucozade', price: 2.8 },
        { name: 'Sparkling water', price: 2.2 },
        { name: 'Still water', price: 1.8 },
      ],
    },
  ],

  /* ---------------------------------------------------------------------------
     5. AVALIAÇÕES
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
