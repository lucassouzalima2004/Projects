// Sample catalog for the preview. Names, prices and texts are placeholders until the brand
// confirms the final line sheet; no material or performance claims are made here.

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const products = [
  {
    handle: 'eva-triangle-bikini',
    title: 'Eva Triangle Bikini',
    type: 'Bikini',
    style: 'triangle',
    collections: ['bikinis'],
    price: 18500,
    colors: ['Pearl', 'Terracotta', 'Nero'],
    tags: ['new'],
    soldOut: [['Terracotta', 'XS']],
    description:
      '<p>A triangle bikini cut with Milanese precision: sliding cups, ties at the neck and back, and a bottom that rests low on the hips.</p><p>Sold as a set — top and bottom in the same size.</p>',
    fit: 'Adjustable triangle top with neck and back ties. Medium-coverage bottom.',
  },
  {
    handle: 'bellagio-bandeau-bikini',
    title: 'Bellagio Bandeau Bikini',
    type: 'Bikini',
    style: 'bandeau',
    collections: ['bikinis'],
    price: 19500,
    colors: ['Sand', 'Cacao', 'Nero'],
    description:
      '<p>Named after the pearl of Lake Como. A softly gathered bandeau that frames the shoulders, paired with a classic bottom.</p><p>Sold as a set.</p>',
    fit: 'Strapless bandeau top. Classic-coverage bottom.',
  },
  {
    handle: 'varenna-balconette-bikini',
    title: 'Varenna Balconette Bikini',
    type: 'Bikini',
    style: 'balconette',
    collections: ['bikinis'],
    price: 21000,
    colors: ['Terracotta', 'Pearl'],
    tags: ['new'],
    description:
      '<p>A balconette with a structured line and thin shoulder straps, inspired by the terraces of Varenna.</p><p>Sold as a set.</p>',
    fit: 'Balconette top with shoulder straps. Medium-coverage bottom.',
  },
  {
    handle: 'giardino-halter-bikini',
    title: 'Giardino Halter Bikini',
    type: 'Bikini',
    style: 'halter',
    collections: ['bikinis'],
    price: 19000,
    colors: ['Cacao', 'Sand'],
    soldOut: [['Sand', 'XL']],
    description:
      '<p>A halter top that ties at the nape of the neck, made for long afternoons in the garden. Paired with a high-cut bottom.</p><p>Sold as a set.</p>',
    fit: 'Halter top tied at the neck. High-cut bottom.',
  },
  {
    handle: 'trevo-ring-bikini',
    title: 'Trevo Ring Bikini',
    type: 'Bikini',
    style: 'ring',
    collections: ['bikinis'],
    price: 20500,
    colors: ['Nero', 'Pearl', 'Terracotta'],
    description:
      '<p>The house symbol, the clover, becomes jewellery: a ring detail at the centre of a soft bandeau.</p><p>Sold as a set.</p>',
    fit: 'Bandeau top with centre ring detail. Classic-coverage bottom.',
  },
  {
    handle: 'cascata-tie-side-bikini',
    title: 'Cascata Tie-side Bikini',
    type: 'Bikini',
    style: 'tieside',
    collections: ['bikinis'],
    price: 18000,
    colors: ['Sand', 'Terracotta'],
    description:
      '<p>Like the waterfall in the painting: light, fluid, tied at the hips with soft bows.</p><p>Sold as a set.</p>',
    fit: 'Small triangle top. Tie-side bottom, adjustable at the hips.',
  },
  {
    handle: 'eden-one-piece',
    title: 'Eden One-piece',
    type: 'Swimsuit',
    style: 'scoop',
    collections: ['swimsuits'],
    price: 26000,
    colors: ['Nero', 'Terracotta', 'Pearl'],
    tags: ['new'],
    description:
      '<p>The signature piece of the collection. A one-piece with a soft scoop neckline and an open back — essential, timeless, made to be worn from the water to the terrace.</p>',
    fit: 'Scoop neckline, open back. Medium leg.',
  },
  {
    handle: 'como-plunge-one-piece',
    title: 'Como Plunge One-piece',
    type: 'Swimsuit',
    style: 'plunge',
    collections: ['swimsuits'],
    price: 27000,
    colors: ['Cacao', 'Nero'],
    description:
      '<p>A deep plunging neckline with Italian restraint. Long lines and a refined back for evenings by the lake.</p>',
    fit: 'Plunge neckline. Medium leg, low back.',
  },
  {
    handle: 'paradiso-one-shoulder-swimsuit',
    title: 'Paradiso One-shoulder Swimsuit',
    type: 'Swimsuit',
    style: 'oneshoulder',
    collections: ['swimsuits'],
    price: 27500,
    colors: ['Terracotta', 'Sand'],
    description:
      '<p>An asymmetric line drawn across the shoulder. Sculptural and sensual, in the spirit of Brazilian summers.</p>',
    fit: 'One-shoulder neckline. High leg.',
  },
  {
    handle: 'serra-high-leg-one-piece',
    title: 'Serra High-leg One-piece',
    type: 'Swimsuit',
    style: 'highleg',
    collections: ['swimsuits'],
    price: 25500,
    colors: ['Pearl', 'Nero'],
    soldOut: [['Pearl', 'M']],
    description:
      '<p>A square neckline and a high leg that lengthens the silhouette — named after the mountains of Brazil.</p>',
    fit: 'Square neckline. High leg, medium back coverage.',
  },
  {
    handle: 'riva-resort-shirt',
    title: 'Riva Resort Shirt',
    type: 'Resortwear',
    style: 'shirt',
    collections: ['resortwear'],
    price: 24000,
    colors: ['Pearl', 'Sand'],
    description:
      '<p>A relaxed resort shirt with a camp collar, to wear open over swimwear or knotted at the waist.</p>',
    fit: 'Relaxed fit. Camp collar, short sleeves.',
  },
  {
    handle: 'lido-resort-shorts',
    title: 'Lido Resort Shorts',
    type: 'Resortwear',
    style: 'shorts',
    collections: ['resortwear'],
    price: 18000,
    colors: ['Pearl', 'Sand'],
    description:
      '<p>Easy shorts with a drawstring waist, made to pair with the Riva shirt from the beach to lunch.</p>',
    fit: 'Relaxed fit, drawstring waist.',
  },
].map((product) => ({ sizes: SIZES, tags: [], soldOut: [], ...product }));

export const collections = [
  {
    handle: 'all',
    title: 'The Collection',
    description: '<p>Swimwear and resortwear from The Garden of Eden 2027.</p>',
  },
  {
    handle: 'bikinis',
    title: 'Bikinis',
    description: '<p>Each bikini is sold as a set.</p>',
  },
  {
    handle: 'swimsuits',
    title: 'Swimsuits',
    description: '<p>One-pieces designed in Milan and made in Brazil.</p>',
  },
  {
    handle: 'resortwear',
    title: 'Resortwear',
    description: '<p>From the water to the terrace.</p>',
  },
];

const supportNote =
  '<p><em>Preview text — the final version will be provided or approved by the brand.</em></p>';

export const pages = [
  { handle: 'the-garden-of-eden', title: 'The Garden of Eden', template: 'garden', content: '' },
  { handle: 'the-story', title: 'The Story', template: 'story', content: '' },
  { handle: 'help', title: 'Client care', template: 'help', content: '' },
  { handle: 'contact', title: 'Contact', template: 'contact', content: '' },
  {
    handle: 'size-guide',
    title: 'Size guide',
    template: 'support',
    content: `<p>Body measurements in centimetres. Measure bust, waist and hips and choose the size that matches the largest measurement.</p>
<div class="table-scroll"><table>
<thead><tr><th>Size</th><th>IT</th><th>BR</th><th>Bust</th><th>Waist</th><th>Hips</th></tr></thead>
<tbody>
<tr><td>XS</td><td>38</td><td>PP</td><td>78–82</td><td>60–64</td><td>86–90</td></tr>
<tr><td>S</td><td>40</td><td>P</td><td>82–86</td><td>64–68</td><td>90–94</td></tr>
<tr><td>M</td><td>42</td><td>M</td><td>86–90</td><td>68–72</td><td>94–98</td></tr>
<tr><td>L</td><td>44</td><td>G</td><td>90–95</td><td>72–77</td><td>98–103</td></tr>
<tr><td>XL</td><td>46</td><td>GG</td><td>95–100</td><td>77–82</td><td>103–108</td></tr>
</tbody></table></div>
<p><em>Indicative measurements for the preview — to be replaced with the brand's final grading.</em></p>`,
  },
  {
    handle: 'care',
    title: 'Care',
    template: 'support',
    content: `<h2>Every piece, for many summers</h2>
<ul><li>Rinse in cold fresh water after every swim, in the sea or in the pool.</li>
<li>Wash by hand with a mild soap. Do not wring.</li>
<li>Dry flat, in the shade. Do not tumble dry or iron.</li>
<li>Avoid rough surfaces and apply sunscreen before dressing.</li></ul>${supportNote}`,
  },
  {
    handle: 'shipping-returns',
    title: 'Shipping & returns',
    template: 'support',
    content: `<h2>Shipping</h2><p>Countries, delivery times and costs are shown at checkout, before payment.</p>
<h2>Exchanges and returns</h2><p>Unworn pieces, with labels and hygiene liner, can be exchanged or returned within the period set in the returns policy.</p>${supportNote}`,
  },
  { handle: 'privacy', title: 'Privacy', template: '', content: `<p>The privacy policy will be published here.</p>${supportNote}` },
  { handle: 'terms', title: 'Terms of sale', template: '', content: `<p>The terms of sale will be published here.</p>${supportNote}` },
  { handle: 'cookies', title: 'Cookies', template: '', content: `<p>The cookie policy will be published here.</p>${supportNote}` },
];

export const menus = {
  'main-menu': {
    title: 'Main menu',
    links: [
      {
        title: 'Shop',
        url: '/collections/all',
        links: [
          { title: 'Bikinis', url: '/collections/bikinis' },
          { title: 'Swimsuits', url: '/collections/swimsuits' },
          { title: 'Resortwear', url: '/collections/resortwear' },
          { title: 'All pieces', url: '/collections/all' },
        ],
      },
      { title: 'The Garden of Eden', url: '/pages/the-garden-of-eden' },
      { title: 'The Story', url: '/pages/the-story' },
      { title: 'Client care', url: '/pages/help' },
      { title: 'Contact', url: '/pages/contact' },
    ],
  },
  footer: {
    title: 'Shop',
    links: [
      { title: 'Bikinis', url: '/collections/bikinis' },
      { title: 'Swimsuits', url: '/collections/swimsuits' },
      { title: 'Resortwear', url: '/collections/resortwear' },
      { title: 'The Garden of Eden', url: '/pages/the-garden-of-eden' },
      { title: 'The Story', url: '/pages/the-story' },
    ],
  },
  'customer-care': {
    title: 'Client care',
    links: [
      { title: 'Size guide', url: '/pages/size-guide' },
      { title: 'Care', url: '/pages/care' },
      { title: 'Shipping & returns', url: '/pages/shipping-returns' },
      { title: 'Questions', url: '/pages/help' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { title: 'Privacy', url: '/pages/privacy' },
      { title: 'Terms', url: '/pages/terms' },
      { title: 'Cookies', url: '/pages/cookies' },
    ],
  },
  'search-suggestions': {
    title: 'Search suggestions',
    links: [
      { title: 'Bikinis', url: '/collections/bikinis' },
      { title: 'Swimsuits', url: '/collections/swimsuits' },
      { title: 'Resortwear', url: '/collections/resortwear' },
      { title: 'The Garden of Eden', url: '/pages/the-garden-of-eden' },
    ],
  },
};

export const shop = {
  name: 'Giselle Paganeli Swim',
  description: 'Premium swimwear and resortwear. Italian elegance, Brazilian sensuality. Born in Milan · Made in Brazil.',
  currency: 'EUR',
  moneyFormat: '€{{amount_with_comma_separator}}',
  paymentTypes: ['visa', 'master', 'american_express', 'apple_pay', 'google_pay', 'paypal'],
  countries: [
    { iso_code: 'IT', name: 'Italia', currency: { iso_code: 'EUR', symbol: '€' } },
    { iso_code: 'US', name: 'United States', currency: { iso_code: 'USD', symbol: '$' } },
    { iso_code: 'BR', name: 'Brasil', currency: { iso_code: 'BRL', symbol: 'R$' } },
    { iso_code: 'GB', name: 'United Kingdom', currency: { iso_code: 'GBP', symbol: '£' } },
  ],
  languages: [
    { iso_code: 'en', endonym_name: 'English' },
    { iso_code: 'it', endonym_name: 'Italiano' },
    { iso_code: 'pt-BR', endonym_name: 'Português' },
  ],
};

// Theme settings the merchant would pick in the editor once the store exists.
export const settingsOverrides = {
  size_guide_page: 'size-guide',
  shipping_page: 'shipping-returns',
  search_menu: 'search-suggestions',
  social_instagram: 'https://www.instagram.com/',
};

export const colorHex = {
  Pearl: '#f3efe7',
  Sand: '#d6c5ae',
  Cacao: '#4b3226',
  Nero: '#151313',
  Terracotta: '#ad634d',
};
