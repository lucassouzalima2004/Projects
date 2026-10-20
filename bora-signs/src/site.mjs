// Company details and site settings. Most day-to-day edits happen here.

export default {
  name: 'Bora Signs',
  legalName: 'Bora Signs AU Pty Ltd',
  abn: '61 683 853 545',
  // Final address of the site, without a trailing slash. Used for canonical links, the sitemap and link previews.
  url: 'https://www.borasigns.com.au',
  tagline: 'Signage without the stress.',
  description:
    'Adelaide sign company with over 15 years of experience: vehicle wraps, shopfront signage, window graphics and office signage, designed, produced and installed by one local team.',

  phone: '0482 530 280',
  phoneIntl: '+61482530280',
  email: 'sales@borasigns.com.au',
  address: {
    street: 'U10A/113 Welland Ave',
    locality: 'Welland',
    region: 'SA',
    postcode: '5007',
    country: 'AU',
  },
  mapUrl: 'https://maps.google.com/?q=U10A%2F113+Welland+Ave,+Welland+SA+5007',
  areaServed: 'Adelaide, South Australia',

  social: {
    instagram: 'https://www.instagram.com/borasigns/',
    facebook: 'https://www.facebook.com/borasigns',
    tiktok: 'https://www.tiktok.com/@borasigns',
    youtube: 'https://www.youtube.com/@BoraSigns',
  },

  // Meta (Facebook/Instagram) pixel of Bora Signs. Empty turns it off.
  // (1070067669184384 is the Bora Decor pixel, so it stays off this site.)
  metaPixelId: '',
  // Google Search Console "HTML tag" verification code (only the content="..." value). Empty leaves it out.
  googleSiteVerification: '',

  // Where the quote and job-application forms are sent.
  // Empty: the form opens the visitor's email app with the message ready to send to `email` above.
  // Web3Forms (free): endpoint 'https://api.web3forms.com/submit' and fields { access_key: 'the key they email you' }.
  // Formspree: endpoint 'https://formspree.io/f/xxxxxxx' and fields {}.
  form: {
    endpoint: '',
    fields: {},
  },

  // Van wrap slider on the vehicle signage page: price shown from a little vinyl to a full wrap (AUD).
  wrapEstimate: {
    min: 500,
    max: 7000,
    step: 50,
    tiers: [
      { upTo: 0.25, name: 'Logo & lettering' },
      { upTo: 0.5, name: 'Partial wrap' },
      { upTo: 0.85, name: 'Three-quarter wrap' },
      { upTo: 1, name: 'Full wrap' },
    ],
  },

  stats: [
    { value: 15, suffix: '+', label: 'Years in signage' },
    { value: 100, suffix: 's', label: 'Of happy Adelaide clients' },
    { value: 1, suffix: '', label: 'Team from design to install' },
  ],

  clients: [
    { name: 'Woolworths', file: 'woolworths' },
    { name: 'Australia Post', file: 'australia-post' },
    { name: 'adidas', file: 'adidas' },
    { name: 'Sekisui Rib Loc', file: 'sekisui' },
    { name: 'Save the Children', file: 'save-the-children' },
    { name: 'Hercus Engineering', file: 'hercus' },
    { name: 'Evoro', file: 'evoro' },
    { name: 'Pet Universe Veterinary Centre', file: 'pet-universe' },
    { name: 'WHS', file: 'whs' },
  ],
};
