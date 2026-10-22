// Sample catalog for the preview. Names, prices and texts are placeholders until the brand
// confirms the final line sheet; no material or performance claims are made here.
// Photos are Pexels stock pictures (see media/photos/CREDITS.md), for the preview only.

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const products = [
  {
    handle: 'eva-triangle-bikini',
    title: 'Eva Triangle Bikini',
    type: 'Bikini',
    collections: ['bikinis'],
    price: 18500,
    photos: { Nero: ['12184254', '12184162'], Pearl: ['28390584', '18892579'] },
    tags: ['new'],
    soldOut: [['Pearl', 'XS']],
    description:
      '<p>A triangle bikini cut with Milanese precision: soft cups, ties at the neck and back, and a bottom that rests low on the hips.</p><p>Sold as a set — top and bottom in the same size.</p>',
    fit: 'Triangle top with neck and back ties. Medium-coverage bottom.',
  },
  {
    handle: 'bellagio-bikini',
    title: 'Bellagio Bikini',
    type: 'Bikini',
    collections: ['bikinis'],
    price: 19500,
    photos: { Nero: ['18037479'] },
    description:
      '<p>Named after the pearl of Lake Como. A minimal triangle with tie-side bottom, made for still water and long swims.</p><p>Sold as a set.</p>',
    fit: 'Triangle top. Tie-side bottom, adjustable at the hips.',
  },
  {
    handle: 'cascata-tie-side-bikini',
    title: 'Cascata Tie-side Bikini',
    type: 'Bikini',
    collections: ['bikinis'],
    price: 18000,
    photos: { Sand: ['8369995', '8369989'] },
    tags: ['new'],
    description:
      '<p>Like the waterfall in the painting: light and fluid. A soft bralette top with a tie-side bottom, in the colour of warm sand.</p><p>Sold as a set.</p>',
    fit: 'Bralette top. Tie-side bottom, adjustable at the hips.',
  },
  {
    handle: 'giardino-bikini',
    title: 'Giardino Bikini',
    type: 'Bikini',
    collections: ['bikinis'],
    price: 19000,
    photos: { Terracotta: ['17995823'] },
    soldOut: [['Terracotta', 'XL']],
    description:
      '<p>Terracotta among the leaves: a triangle top and a high-cut bottom made for long afternoons in the garden.</p><p>Sold as a set.</p>',
    fit: 'Triangle top. High-cut bottom.',
  },
  {
    handle: 'villa-bikini',
    title: 'Villa Bikini',
    type: 'Bikini',
    collections: ['bikinis'],
    price: 21000,
    photos: { Pearl: ['3769133', '5282577'] },
    description:
      '<p>Pearl white for the pools of Italian villas. A clean top with a scooped back and a classic bottom.</p><p>Sold as a set.</p>',
    fit: 'Bralette top. Classic-coverage bottom.',
  },
  {
    handle: 'palma-bikini',
    title: 'Palma Bikini',
    type: 'Bikini',
    collections: ['bikinis'],
    price: 18500,
    photos: { Nero: ['4497012'] },
    description:
      '<p>An essential black bikini, shown here with the Riva Resort Shirt knotted at the waist.</p><p>Sold as a set.</p>',
    fit: 'Classic-coverage bottom.',
  },
  {
    handle: 'eden-one-piece',
    title: 'Eden One-piece',
    type: 'Swimsuit',
    collections: ['swimsuits'],
    price: 26000,
    photos: { Nero: ['4827962', '4497794'], Pearl: ['7261223'] },
    tags: ['new'],
    description:
      '<p>The signature piece of the collection. A one-piece with a soft scoop neckline — essential, timeless, made to be worn from the water to the terrace.</p>',
    fit: 'Scoop neckline. Medium leg.',
  },
  {
    handle: 'como-one-piece',
    title: 'Como One-piece',
    type: 'Swimsuit',
    collections: ['swimsuits'],
    price: 27000,
    photos: { Pearl: ['7732170', '6339291'] },
    soldOut: [['Pearl', 'M']],
    description:
      '<p>A pearl one-piece with a sculpted neckline, for the rocks and coves of the Mediterranean.</p>',
    fit: 'Sculpted neckline. Medium leg.',
  },
  {
    handle: 'paradiso-one-piece',
    title: 'Paradiso One-piece',
    type: 'Swimsuit',
    collections: ['swimsuits'],
    price: 27500,
    photos: { Terracotta: ['7788703', '29462470'] },
    description:
      '<p>Terracotta against the sea: a one-piece with long lines and a high leg, in the spirit of Brazilian summers.</p>',
    fit: 'High leg, open back.',
  },
  {
    handle: 'serra-long-sleeve-one-piece',
    title: 'Serra Long-sleeve One-piece',
    type: 'Swimsuit',
    collections: ['swimsuits'],
    price: 28500,
    photos: { Nero: ['5980148'] },
    description:
      '<p>Long sleeves and a round neck: a swimsuit that becomes a bodysuit for the evening. Named after the mountains of Brazil.</p>',
    fit: 'Long sleeves, round neck. Medium leg.',
  },
  {
    handle: 'riva-resort-shirt',
    title: 'Riva Resort Shirt',
    type: 'Resortwear',
    collections: ['resortwear'],
    price: 24000,
    photos: { Pearl: ['18791718', '10899208'] },
    description:
      '<p>A relaxed white shirt to wear open over swimwear or knotted at the waist, from the beach to lunch.</p>',
    fit: 'Relaxed fit, long sleeves to roll up.',
  },
  {
    handle: 'lido-resort-shorts',
    title: 'Lido Resort Shorts',
    type: 'Resortwear',
    collections: ['resortwear'],
    price: 16000,
    photos: { Terracotta: ['10756859'] },
    description:
      '<p>Easy shorts with an elastic waist, made to pair with a white shirt from the beach to the village.</p>',
    fit: 'Relaxed fit, elastic waist.',
  },
].map((product) => ({ sizes: SIZES, tags: [], soldOut: [], ...product, colors: Object.keys(product.photos) }));

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

// Campaign-style crops used by the editorial sections of the preview (Pexels, preview only).
// Product photos are 4:5 at 640/1200 px; these list their own size.
export const campaignPhotos = {
  'campaign-18037479': { width: 2400, height: 1350, widths: [1200, 2400] },
  'campaign-18037479-m': { width: 1200, height: 1800, widths: [640, 1200] },
  'wide-8369989': { width: 1600, height: 1067, widths: [800, 1600] },
  'wide-6339291': { width: 1600, height: 1067, widths: [800, 1600] },
};

const galleryImage = (photo, shape, caption) => ({ type: 'image', settings: { image: `preview:photo/${photo}`, shape, caption } });

// Preview only: sample photos stand in for the campaign Giselle will shoot, and the "Shop the look"
// block on The Garden of Eden page uses a real photo with points on each piece.
export const templateOverrides = {
  index: {
    sections: {
      hero: {
        settings: { image: 'preview:photo/campaign-18037479', image_mobile: 'preview:photo/campaign-18037479-m', focal_x: 50, focal_y: 40 },
      },
      intro: {
        settings: { image: 'preview:photo/12184162', image_2: 'preview:photo/5980148', caption: '' },
      },
      story: {
        settings: { image_left: 'preview:photo/4827962', image_right: 'preview:photo/7261223' },
      },
      gallery: {
        blocks: {
          'image-1': galleryImage('28390584', 'portrait', 'Shoreline'),
          'image-2': galleryImage('wide-8369989', 'landscape', 'Salt and wind'),
          'image-3': galleryImage('3769133', 'square', 'Poolside'),
          'image-4': galleryImage('18892579', 'portrait', 'Golden hour'),
          'image-5': galleryImage('wide-6339291', 'landscape', 'Turquoise'),
        },
        block_order: ['image-1', 'image-2', 'image-3', 'image-4', 'image-5'],
      },
    },
  },
  'page.garden': {
    sections: {
      look: {
        settings: { image: 'preview:photo/4497012', image_ratio: 'portrait', overline: 'Shop the look', heading: 'Under the palms' },
        blocks: {
          shirt: { type: 'hotspot', settings: { product: 'riva-resort-shirt', x: 38, y: 58 } },
          bikini: { type: 'hotspot', settings: { product: 'palma-bikini', x: 62, y: 77 } },
        },
        block_order: ['shirt', 'bikini'],
      },
    },
  },
};

