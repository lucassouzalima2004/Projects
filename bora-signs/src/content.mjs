// Page content. Each service becomes its own page at /<slug>, with its own title and description for Google and ads.
// Slugs match the old Wix addresses so existing Google rankings and ad links keep working
// (the ones that changed are redirected in build.mjs).

export const groups = {
  exterior: 'Exterior',
  interior: 'Interior',
  decor: 'Decor',
};

export const services = [
  {
    slug: 'vehicle-signage',
    name: 'Vehicle Signage',
    short: 'Vehicle wraps',
    group: 'exterior',
    title: 'Vehicle Signage Adelaide | Van, Ute & Car Wraps | Bora Signs',
    description:
      'Vehicle signage and wraps in Adelaide. Van, ute, car and fleet graphics designed, printed and installed by Bora Signs. Drag the van to see a wrap and a price.',
    eyebrow: 'Vehicle Signage Adelaide',
    h1: 'Turn your van into a moving billboard.',
    lead:
      'We design and install high-quality vehicle graphics that put your business in front of thousands of potential customers every day, wherever you drive and wherever you park.',
    image: 'install-van-wrap',
    imageAlt: 'Bora Signs installer applying a printed wrap to a work van with a heat gun',
    card: 'Vans, utes, cars and fleets wrapped in eye-catching graphics that work on every trip.',
    feature: 'wrap-slider',
    why: {
      title: 'Why vehicle signage?',
      items: [
        { title: 'Seen everywhere you go', text: 'Every job, every school run, every car park. Your vehicle becomes a billboard across Adelaide, building brand awareness with every kilometre.' },
        { title: 'Instant credibility', text: 'A well-designed vehicle tells customers you are established, organised and invested in your business before you even say hello.' },
        { title: 'Local by default', text: 'Parked at a job site or driving through the suburbs you service, your signage reaches the people most likely to call you.' },
        { title: 'Pay once, advertise for years', text: 'No monthly ad spend. A single investment that keeps promoting your business every day you are on the road.' },
      ],
    },
    options: {
      title: 'From a logo on the door to a full wrap',
      items: [
        { title: 'Logos & lettering', text: 'Cut vinyl logos, contact details and services. The fastest, most affordable way to brand a vehicle.' },
        { title: 'Partial wraps', text: 'Printed graphics over part of the vehicle, blending into the paint colour for big impact on a smaller budget.' },
        { title: 'Full wraps', text: 'Complete coverage in printed or colour-change film for maximum attention and a factory-finish look.' },
        { title: 'Fleet branding', text: 'Consistent graphics across every ute, van and truck so your fleet looks like one business.' },
      ],
    },
    gallery: ['van-wrap-omkar', 'install-van-wrap', 'trailer-wrap-mr-canes'],
    quote: {
      text: 'We had our company ute and van wrapped by Bora Signs, and we’re already seeing the benefits. The whole process was smooth, and the team delivered exactly what we wanted.',
      name: 'Tom W',
    },
    faq: [
      { q: 'How much does vehicle signage cost?', a: 'It depends on the vehicle, how much of it is covered, the design and the film. Logos and lettering cost far less than a full wrap. The van above shows an indicative range; send us the make and model and we will give you a firm quote.' },
      { q: 'Will a wrap damage my paint?', a: 'Vehicle films are made to go over factory paint in good condition, and they help protect it from everyday wear. Chips, resprays or damaged clear coat can lift with the film, so we check the surface before recommending a wrap.' },
      { q: 'Do you design the graphics?', a: 'Yes. Send us your logo and ideas and our team designs the layout around your vehicle. You approve a clear visual proof before anything is printed.' },
      { q: 'How long will my vehicle be off the road?', a: 'It depends on the size of the job. We confirm the timing with your quote and book the vehicle in when it suits your business.' },
    ],
    related: ['trailer-wrap', 'shopfront-signage', 'window-graphics', 'promotional-signage'],
  },
  {
    slug: 'trailer-wrap',
    name: 'Trailer Wraps',
    short: 'Trailer wraps',
    group: 'exterior',
    title: 'Trailer Wraps Adelaide | Food Truck & Trailer Wraps | Bora Signs',
    description:
      'Trailer and food truck wraps in Adelaide. Bold, durable graphics for food trailers, tradie trailers and event trailers, designed and installed by Bora Signs.',
    eyebrow: 'Trailer Wraps Adelaide',
    h1: 'Food truck and trailer wraps people stop for.',
    lead:
      'High-impact wraps for food trailers, food trucks and service trailers. From design to a flawless install, we make your trailer an advert people notice from across the car park.',
    image: 'trailer-wrap-mr-canes',
    imageAlt: 'Colourful printed wrap on the Mr Cane’s sugar cane juice food trailer',
    card: 'Food trucks, tradie and event trailers wrapped to sell before you open the hatch.',
    why: {
      title: 'Why wrap your trailer?',
      items: [
        { title: 'Design that sells', text: 'A great trailer wrap does more than look good. It explains what you offer in a glance and makes people hungry, curious or ready to call.' },
        { title: 'Built for the road', text: 'High-performance vehicle films made for Australian sun and everyday use, with vibrant colours that last and protection for the original surface.' },
        { title: 'Expert installation', text: 'A wrap is only as good as its install. Our team applies every panel for a smooth, bubble-free finish that looks painted on.' },
      ],
    },
    options: {
      title: 'Trailers we wrap',
      items: [
        { title: 'Food trailers & food trucks', text: 'Turn your mobile kitchen into an irresistible brand statement that draws a queue.' },
        { title: 'Tradie & service trailers', text: 'Market your services from every job site: plumbers, electricians, landscapers, builders and more.' },
        { title: 'Event & promo trailers', text: 'Make an instant impression at festivals, expos, pop-ups and community events.' },
      ],
    },
    gallery: ['trailer-wrap-mr-canes', 'van-wrap-omkar', 'install-van-wrap'],
    quote: {
      text: 'Bora Signs absolutely nailed it with our van wraps! The design is super bold, and we’re getting noticed everywhere we go. It’s like having a moving billboard.',
      name: 'Bora Signs client',
    },
    faq: [
      { q: 'How much does a trailer wrap cost?', a: 'It depends on the trailer size, the coverage and the design. Send us photos and the dimensions of your trailer for a tailored quote.' },
      { q: 'Can you wrap a food trailer with hatches, vents and fittings?', a: 'Yes. We plan the design around hatches, vents, windows and serving areas so your key messages stay visible when you are open.' },
      { q: 'Do you design the graphics?', a: 'Yes. Our team designs the wrap around your brand and menu, and you approve a visual proof before printing.' },
    ],
    related: ['vehicle-signage', 'promotional-signage', 'mesh-banner-adelaide', 'shopfront-signage'],
  },
  {
    slug: 'shopfront-signage',
    name: 'Shopfront Signage',
    short: 'Shopfront signs',
    group: 'exterior',
    title: 'Shopfront Signage Adelaide | Custom Shop Signs | Bora Signs',
    description:
      'Custom shopfront signage in Adelaide: fascia signs, 3D lettering, illuminated signs and facades. Designed, made and installed by the Bora Signs team.',
    eyebrow: 'Shopfront Signage Adelaide',
    h1: 'Shop signs that pull people through the door.',
    lead:
      'From bold lettering to vibrant graphics, we create shopfront signage that reflects your brand, draws people in and keeps working for you day and night.',
    image: 'shopfront-lp-accounting',
    imageAlt: 'LP Accounting shopfront with dimensional lettering signage installed by Bora Signs',
    card: 'Fascia signs, 3D letters and facades that make a lasting first impression.',
    why: {
      title: 'Why shopfront signage?',
      items: [
        { title: 'Easy to find', text: 'A well-designed sign is noticed by foot traffic and passing cars, and makes your business easy to spot for first-time customers.' },
        { title: 'Brand recognition', text: 'Your colours, fonts and logo on show every day help you stand out from competitors and stay top of mind.' },
        { title: 'Advertising 24/7', text: 'Unlike flyers or online ads, your shopfront promotes your business around the clock, with no ongoing cost.' },
        { title: 'A professional image', text: 'Quality signage tells people they can trust you, and gives them a reason to step inside.' },
      ],
    },
    options: {
      title: 'Shopfront signs we make',
      items: [
        { title: 'Fascia & building signs', text: 'Large-format signs and panels for your building, awning or fascia.' },
        { title: '3D & dimensional letters', text: 'Raised lettering and logos that add depth and a premium finish.' },
        { title: 'Illuminated signs', text: 'LED, backlit and neon signs that keep you visible after dark.', link: 'neon-illuminated-signage-adelaide' },
        { title: 'Shop facades', text: 'A complete refresh of your shop exterior that reflects your brand and draws attention.' },
      ],
    },
    gallery: ['shopfront-lp-accounting', 'install-building-sign', 'shopfront-nosso-cafe', 'shopfront-lp-accounting-detail'],
    quote: {
      text: 'We recently had exterior signage done by Bora Signs, and we’re so impressed! The team was professional, quick, and delivered a high-quality sign that perfectly captures our brand.',
      name: 'Bora Signs client',
    },
    faq: [
      { q: 'Do I need council approval for a shop sign?', a: 'Some signs need approval from your council or landlord, depending on size, location and lighting. We flag this during the site check so there are no surprises.' },
      { q: 'Can you install signs at height?', a: 'Yes. Our team installs building and fascia signage, including jobs that need lifting equipment. We confirm access and installation details during the site check.' },
      { q: 'How much does a shop sign cost?', a: 'It depends on size, materials, lighting and installation access. Send us a photo of your shopfront and your logo for a tailored quote.' },
    ],
    related: ['neon-illuminated-signage-adelaide', 'window-graphics', 'promotional-signage', 'vehicle-signage'],
  },
  {
    slug: 'window-graphics',
    name: 'Window Graphics',
    short: 'Window graphics',
    group: 'exterior',
    title: 'Window Graphics Adelaide | Shop Window Signs & Decals | Bora Signs',
    description:
      'Custom window graphics in Adelaide for shops and offices: printed displays, decals, promotions and privacy film. Designed and installed by Bora Signs.',
    eyebrow: 'Window Graphics Adelaide',
    h1: 'Turn your windows into your best advert.',
    lead:
      'Attract customers, promote a sale or add privacy. Window graphics are a versatile, eye-catching way to use the space people already look at.',
    image: 'window-graphics-cloud',
    imageAlt: 'Large printed window graphics on a commercial building reading Your journey to the cloud begins here',
    card: 'Printed displays, decals and privacy film that turn glass into advertising space.',
    why: {
      title: 'Why window graphics?',
      items: [
        { title: 'Curb appeal', text: 'Vibrant, creative windows turn heads, draw foot traffic and make your business stand out on the street.' },
        { title: 'Affordable advertising', text: 'Use your windows as prime ad space for your brand, products or offers, without recurring costs.' },
        { title: 'Privacy with light', text: 'Frosted and tinted graphics shield your interior from view while keeping the space bright.', link: 'frosted-window-film' },
        { title: 'Easy to update', text: 'Simple to install and remove, so you can refresh your windows for every season, sale or event.' },
      ],
    },
    options: {
      title: 'Window graphics we install',
      items: [
        { title: 'Full-colour window displays', text: 'Printed graphics that cover the glass with your brand, photos and messages.' },
        { title: 'Cut vinyl lettering', text: 'Opening hours, logos and contact details in crisp cut vinyl.' },
        { title: 'Promotional decals', text: 'Short-term graphics for sales, launches and seasonal campaigns.' },
        { title: 'Frosted & privacy film', text: 'Decorative frosting for offices, clinics and meeting rooms.', link: 'frosted-window-film' },
      ],
    },
    gallery: ['window-graphics-cloud', 'window-graphics-clinic', 'shopfront-nosso-cafe'],
    quote: {
      text: 'Love our new window graphics from Bora Signs! They’ve made our storefront pop and brought in more customers. Easy process and great results. Highly recommend!',
      name: 'Bora Signs client',
    },
    faq: [
      { q: 'Can people still see out through window graphics?', a: 'Yes, if you want them to. Perforated and frosted films let light in and keep a view out, while solid graphics give maximum colour and privacy. We recommend the right film for each window.' },
      { q: 'Are window graphics removable?', a: 'Yes. Window graphics can be removed when it is time for a change, which makes them ideal for promotions and rented premises.' },
      { q: 'How much do window graphics cost?', a: 'It depends on the glass area, the film and the design. Send us photos and approximate measurements for a tailored quote.' },
    ],
    related: ['frosted-window-film', 'shopfront-signage', 'promotional-signage', 'wall-graphics'],
  },
  {
    slug: 'neon-illuminated-signage-adelaide',
    name: 'Neon & Illuminated Signs',
    short: 'Neon & illuminated',
    group: 'exterior',
    title: 'Neon & Illuminated Signage Adelaide | LED & Backlit Signs | Bora Signs',
    description:
      'Custom neon, LED and backlit illuminated signs in Adelaide. Light up your shopfront, reception or event with signage designed and installed by Bora Signs.',
    eyebrow: 'Neon & Illuminated Signage Adelaide',
    h1: 'Light up your business. Day and night.',
    lead:
      'Custom neon and illuminated signage that combines creativity, function and craftsmanship to help your Adelaide business stand out in any setting.',
    image: 'reception-sign-divine-nursing',
    imageAlt: 'Dimensional reception sign with lettering and logo for Divine Nursing Services',
    card: 'Neon, LED and backlit signs that keep your brand in the spotlight after dark.',
    why: {
      title: 'Why illuminated signage?',
      items: [
        { title: 'Visible 24/7', text: 'Keep your business in the spotlight long after the sun goes down.' },
        { title: 'Made for your brand', text: 'Shapes, colours and lighting tailored to your brand’s identity and style.' },
        { title: 'Works anywhere', text: 'Perfect for storefronts, receptions, indoor displays and promotional events.' },
      ],
    },
    options: {
      title: 'Illuminated signs we make',
      items: [
        { title: 'Custom neon signs', text: 'From classic designs to modern takes, a neon sign that reflects your brand.' },
        { title: 'LED illuminated signs', text: 'Energy-efficient, highly customisable and a cost-effective way to get brilliant lighting.' },
        { title: 'Backlit signs', text: 'Halo-lit letters and logos for a sophisticated, polished look.' },
      ],
    },
    gallery: ['reception-sign-divine-nursing', 'shopfront-lp-accounting', 'install-building-sign'],
    quote: {
      text: 'Bora Signs completely transformed our storefront with a stunning illuminated sign that has become a landmark in our area. The design process was seamless, and the final product exceeded our expectations.',
      name: 'Sarah J.',
      role: 'Café owner',
    },
    faq: [
      { q: 'Are LED signs expensive to run?', a: 'LED lighting is energy efficient, which keeps running costs low compared with older lighting. We can talk you through the options for your sign.' },
      { q: 'Can illuminated signs go indoors and outdoors?', a: 'Yes. We specify the sign and lighting for where it will live, whether that is a reception wall or a street-facing fascia.' },
      { q: 'How much does an illuminated sign cost?', a: 'It depends on size, lighting type, materials and installation. Send us your logo and where you want the sign for a tailored quote.' },
    ],
    related: ['shopfront-signage', 'reception-signs', 'office-signage', 'window-graphics'],
  },
  {
    slug: 'mesh-banner-adelaide',
    name: 'Mesh Banners',
    short: 'Mesh banners',
    group: 'exterior',
    title: 'Mesh Banners Adelaide | Fence & Construction Site Banners | Bora Signs',
    description:
      'Durable printed mesh banners in Adelaide for construction sites, fences and events. Wind-resistant, UV-resistant and built for the Australian sun.',
    eyebrow: 'Mesh Banners Adelaide',
    h1: 'Big, bold banners that stand up to the wind.',
    lead:
      'Premium mesh banners built to handle the elements and deliver high-impact visuals: ideal for construction sites, fences, high-wind areas and events.',
    image: 'mesh-banner-fence',
    imageAlt: 'Printed mesh banners along a construction site fence in Adelaide',
    card: 'Wind-resistant fence and site banners that promote your brand at full scale.',
    why: {
      title: 'Why mesh banners?',
      items: [
        { title: 'Weather resistant', text: 'Perforated material lets wind pass through, reducing wear and tear on the banner and the fence.' },
        { title: 'UV and fade resistant', text: 'Made for Adelaide’s sunny conditions, so colours stay vibrant for longer.' },
        { title: 'Light but tough', text: 'Easy to install while strong enough to handle tough environments.' },
      ],
    },
    options: {
      title: 'Where mesh banners work best',
      items: [
        { title: 'Construction sites', text: 'Display your company name, project and contact details on the site fence.' },
        { title: 'Events', text: 'Showcase sponsors and promote upcoming events with ease.' },
        { title: 'Retail', text: 'Catch attention outside your store with bold, weatherproof signage.' },
      ],
    },
    gallery: ['mesh-banner-fence', 'feather-flags', 'install-building-sign'],
    quote: {
      text: 'We ordered mesh banners from Bora Signs for our construction site, and we couldn’t be happier. The material holds up perfectly even in windy conditions, and the design team brought our branding to life with vibrant colours and clear messaging.',
      name: 'John S.',
      role: 'Construction manager, Adelaide',
    },
    faq: [
      { q: 'What size can mesh banners be?', a: 'Mesh banners are made to measure, from a single fence panel to a full site perimeter. Send us the dimensions and we will plan the layout.' },
      { q: 'Do you install the banners?', a: 'Yes. We can supply banners ready to fix or install them on site.' },
      { q: 'How much do mesh banners cost?', a: 'It depends on the size, quantity and installation. Send us the measurements and your artwork or logo for a quote.' },
    ],
    related: ['promotional-signage', 'shopfront-signage', 'trailer-wrap', 'vehicle-signage'],
  },
  {
    slug: 'promotional-signage',
    name: 'Promotional Signs',
    short: 'Promotional signs',
    group: 'exterior',
    title: 'Promotional Signs Adelaide | Banners, Flags & A-Frames | Bora Signs',
    description:
      'Promotional signage in Adelaide: banners, flags, A-frames, posters and window decals for sales, events and launches. Designed and printed by Bora Signs.',
    eyebrow: 'Promotional Signage Adelaide',
    h1: 'Make your promotions impossible to miss.',
    lead:
      'Eye-catching banners, flags, A-frames and posters that showcase your offers, sales, events and launches, indoors, outdoors and on the go.',
    image: 'feather-flags',
    imageAlt: 'Row of printed blue feather flags at an outdoor event',
    card: 'Banners, flags and A-frames for sales, launches and events.',
    why: {
      title: 'Why promotional signage?',
      items: [
        { title: 'Grab attention', text: 'Bold, vibrant signs catch passers-by and draw them into your store or event.' },
        { title: 'Drive sales', text: 'Highlight special offers and limited-time deals so customers act now.' },
        { title: 'Cost-effective', text: 'Reach a big audience with your message without ongoing advertising costs.' },
        { title: 'Made to fit', text: 'Any size, location or design, from a single poster to a full event kit.' },
      ],
    },
    options: {
      title: 'Promotional signs we make',
      items: [
        { title: 'Banners', text: 'Perfect for sales, events and large-scale promotions.' },
        { title: 'A-frames', text: 'Portable signs for footpaths and high-traffic areas.' },
        { title: 'Posters', text: 'High-quality prints for retail spaces and window displays.' },
        { title: 'Flags & pop-up signs', text: 'Feather flags and pop-ups that make an event visible from a distance.' },
      ],
    },
    gallery: ['feather-flags', 'mesh-banner-fence', 'window-graphics-cloud'],
    quote: {
      text: 'Love our new window graphics from Bora Signs! They’ve made our storefront pop and brought in more customers. Easy process and great results.',
      name: 'Bora Signs client',
    },
    faq: [
      { q: 'Can you print promotional signs quickly?', a: 'Tell us your deadline when you ask for a quote and we will let you know what is possible for your launch or event.' },
      { q: 'Do you design the artwork?', a: 'Yes. Send us your logo, offer and any photos and we will design signs that match your brand.' },
    ],
    related: ['mesh-banner-adelaide', 'window-graphics', 'shopfront-signage', 'trailer-wrap'],
  },
  {
    slug: 'office-signage',
    name: 'Office Signage',
    short: 'Office signage',
    group: 'interior',
    title: 'Office Signage Adelaide | Wall Logos, Wayfinding & Murals | Bora Signs',
    description:
      'Office signage in Adelaide: reception logos, wall graphics, wayfinding and room signs that make your workplace look professional. Installed by Bora Signs.',
    eyebrow: 'Office Signage Adelaide',
    h1: 'Make your office look as good as your work.',
    lead:
      'Office signage is more than labelling rooms. It is part of your brand and how your workplace runs, from the first impression in reception to every meeting room.',
    image: 'office-frosted-glass',
    imageAlt: 'Office meeting rooms with decorative frosted glass film installed by Bora Signs',
    card: 'Logos, wayfinding and wall graphics that make your workplace look the part.',
    why: {
      title: 'Why office signage?',
      items: [
        { title: 'A professional look', text: 'Well-crafted signage creates a polished, cohesive space and a strong first impression for clients and visitors.' },
        { title: 'A welcoming reception', text: 'Logos, wall graphics and branded displays reinforce your identity the moment people walk in.', link: 'reception-signs' },
        { title: 'Easy navigation', text: 'Directional signs, room identifiers and desk signs help visitors find their way and keep the office organised.' },
        { title: 'A space your team loves', text: 'Graphics and murals that reflect your culture help people feel proud of where they work.', link: 'wall-graphics' },
      ],
    },
    options: {
      title: 'Office signage we install',
      items: [
        { title: 'Reception signs', text: 'Dimensional, acrylic and illuminated logos for your front desk.', link: 'reception-signs' },
        { title: 'Wayfinding & room signs', text: 'Clear directional and door signs throughout your workplace.' },
        { title: 'Wall graphics & murals', text: 'Brand stories, values and feature walls.', link: 'wall-graphics' },
        { title: 'Frosted glass', text: 'Privacy and branding for meeting rooms and glass partitions.', link: 'frosted-window-film' },
      ],
    },
    gallery: ['office-frosted-glass', 'wall-graphics-adelaide', 'reception-sign-divine-nursing'],
    quote: {
      text: 'Bora Signs nailed it with our office signs! They look amazing and really bring our space to life. The whole process was smooth, and the team was super easy to work with.',
      name: 'Bora Signs client',
    },
    faq: [
      { q: 'Can you install signage outside business hours?', a: 'Ask us when you request a quote. We plan installs around access restrictions so your team can keep working.' },
      { q: 'Do you match our brand guidelines?', a: 'Yes. Send us your brand guide, fonts and colours and we design every sign to match.' },
      { q: 'How much does office signage cost?', a: 'It depends on the number of signs, materials and installation. Send us your floor plan or photos for a tailored quote.' },
    ],
    related: ['reception-signs', 'wall-graphics', 'frosted-window-film', 'decor'],
  },
  {
    slug: 'reception-signs',
    name: 'Reception Signs',
    short: 'Reception signs',
    group: 'interior',
    title: 'Reception Signs Adelaide | 3D, Acrylic & Backlit Logos | Bora Signs',
    description:
      'Custom reception signs in Adelaide: 3D lettering, acrylic panels, backlit logos and wall decals that make a great first impression. By Bora Signs.',
    eyebrow: 'Reception Signs Adelaide',
    h1: 'First impressions start at reception.',
    lead:
      'Elevate your brand with a custom reception sign, designed and crafted by Bora Signs in Adelaide to welcome every client who walks through your door.',
    image: 'reception-sign-divine-nursing',
    imageAlt: 'Dimensional reception sign for Divine Nursing Services on a light wall',
    card: '3D letters, acrylic and backlit logos that welcome every visitor.',
    why: {
      title: 'Why a reception sign?',
      items: [
        { title: 'A stronger brand', text: 'Your reception sign is a visual anchor that reinforces your professionalism and values from the moment clients arrive.' },
        { title: 'Credibility', text: 'Quality signage signals attention to detail and commitment to quality, and leaves a strong positive impression.' },
        { title: 'A better welcome', text: 'Clear signage helps visitors know they are in the right place and feel welcome straight away.' },
      ],
    },
    options: {
      title: 'Reception sign styles',
      items: [
        { title: 'Wall graphics & vinyl decals', text: 'From cut-out logos and lettering to large-scale murals, a cost-effective, flexible option.' },
        { title: 'Illuminated signs', text: 'Backlit (halo) or front-lit letters with internal LED lighting for a striking glow.', link: 'neon-illuminated-signage-adelaide' },
        { title: 'Acrylic signs', text: 'Clear, frosted or coloured acrylic panels, mounted flush or on stand-offs for a floating look.' },
        { title: '3D dimensional lettering', text: 'Raised letters and logos that add depth and a premium finish.' },
      ],
    },
    gallery: ['reception-sign-divine-nursing', 'office-frosted-glass', 'wall-graphics-adelaide'],
    quote: {
      text: 'Bora Signs exceeded our expectations for our new reception sign! From the initial consultation to the final installation, their team was incredibly professional. We opted for 3D dimensional lettering, and the craftsmanship is outstanding.',
      name: 'Carie M.',
      role: 'Marketing manager',
    },
    faq: [
      { q: 'Which reception sign style is right for us?', a: 'It depends on your wall, lighting, budget and brand. Send us a photo of your reception and your logo, and we will recommend options.' },
      { q: 'Can you add lighting to an existing logo design?', a: 'In many cases, yes. Backlit and front-lit options can be designed around your existing logo.' },
    ],
    related: ['office-signage', 'neon-illuminated-signage-adelaide', 'wall-graphics', 'decor'],
  },
  {
    slug: 'wall-graphics',
    name: 'Wall Graphics',
    short: 'Wall graphics',
    group: 'interior',
    title: 'Wall Graphics Adelaide | Custom Wall Murals & Decals | Bora Signs',
    description:
      'Custom wall graphics and murals in Adelaide: vinyl decals, full wall wraps and removable graphics for offices, shops and cafés. Designed and installed by Bora Signs.',
    eyebrow: 'Wall Graphics Adelaide',
    h1: 'Give every wall something to say.',
    lead:
      'We design and install custom wall graphics and murals that transform interior spaces across Adelaide, from a subtle logo to a full feature wall.',
    image: 'wall-graphics-adelaide',
    imageAlt: 'Welcome to Adelaide wall graphic with photos and illustrations in an office',
    card: 'Murals, decals and feature walls that bring your brand into the room.',
    why: {
      title: 'Why wall graphics?',
      items: [
        { title: 'Immersive branding', text: 'Wall graphics immerse clients and staff in your story and values, turning an ordinary wall into a brand experience.' },
        { title: 'Quick, clean transformation', text: 'Compared with painting or renovating, wall graphics are a fast, tidy and cost-effective way to change how a room feels.' },
        { title: 'Endless design options', text: 'Company history, values, wayfinding or a striking focal point, and easy to update when your brand evolves.' },
      ],
    },
    options: {
      title: 'Wall graphics we install',
      items: [
        { title: 'Vinyl decals & lettering', text: 'Precision-cut logos, slogans, arrows and patterns applied straight onto the wall.' },
        { title: 'Full wall murals', text: 'Large-format photographic, illustrated or patterned graphics for maximum impact.' },
        { title: 'Removable graphics', text: 'Ideal for campaigns, seasonal themes and rented spaces, with clean removal.' },
      ],
    },
    gallery: ['wall-graphics-adelaide', 'office-frosted-glass', 'reception-sign-divine-nursing'],
    quote: {
      text: 'Bora Signs truly brought our office to life with an incredible full wall mural! We wanted something that reflected our company culture and added energy to our main meeting room. The team was fantastic, from design concept to installation.',
      name: 'Mark S.',
    },
    faq: [
      { q: 'Which walls can be wrapped?', a: 'Smooth, sound, painted walls work best. Textured or freshly painted walls may need preparation, so we check the surface before recommending a product.' },
      { q: 'Can wall graphics be removed later?', a: 'Yes. Removable films are available for short-term campaigns and rented spaces.' },
    ],
    related: ['office-signage', 'reception-signs', 'window-graphics', 'decor'],
  },
  {
    slug: 'frosted-window-film',
    name: 'Frosted Window Film',
    short: 'Frosted film',
    group: 'interior',
    title: 'Frosted Window Film Adelaide | Office Privacy Film | Bora Signs',
    description:
      'Frosted window film in Adelaide for offices, clinics and shops: privacy without losing light, custom frosted logos and partial frosting. Installed by Bora Signs.',
    eyebrow: 'Frosted Window Film Adelaide',
    h1: 'Privacy, with all the light.',
    lead:
      'Add elegance to your office, privacy for your customers or a modern feature to plain glass. Frosted window film does all three.',
    image: 'office-frosted-glass',
    imageAlt: 'Glass meeting room walls with striped frosted film in an Adelaide office',
    card: 'Privacy film and frosted logos for offices, clinics and meeting rooms.',
    why: {
      title: 'Why frosted window film?',
      items: [
        { title: 'Privacy', text: 'Stop people seeing in without blocking natural light.' },
        { title: 'A sleek look', text: 'Create a modern, sophisticated finish for offices, shops and meeting rooms.' },
        { title: 'Branding', text: 'Add logos, patterns or graphics to reinforce your brand on every pane.' },
      ],
    },
    options: {
      title: 'Frosted film options',
      items: [
        { title: 'Standard frosted film', text: 'Subtle privacy and a clean, modern look.' },
        { title: 'Custom frosted designs', text: 'Logos, stripes and patterns that make your space unique.' },
        { title: 'Partial frosting', text: 'Privacy at eye level while keeping views and light above and below.' },
      ],
    },
    gallery: ['office-frosted-glass', 'window-graphics-clinic', 'window-graphics-cloud'],
    quote: {
      text: 'Bora Signs nailed it with our office signs! They look amazing and really bring our space to life. Our office feels so much more professional now.',
      name: 'Bora Signs client',
    },
    faq: [
      { q: 'Does frosted film block light?', a: 'No. Frosted film diffuses light, so the room stays bright while people outside cannot see clearly in.' },
      { q: 'Can frosted film be removed?', a: 'Yes. It can be removed when you move or refresh your fit-out.' },
      { q: 'How much does frosted film cost?', a: 'It depends on the glass area and whether you want plain or custom designs. Send us photos and measurements for a quote.' },
    ],
    related: ['window-graphics', 'office-signage', 'reception-signs', 'wall-graphics'],
  },
  {
    slug: 'decor',
    name: 'Interior Wrapping',
    short: 'Bora Decor',
    group: 'decor',
    title: 'Interior Wrapping Adelaide | Kitchens, Desks & Cabinetry | Bora Signs',
    description:
      'Interior wrapping in Adelaide with architectural film: refresh reception desks, cabinetry, doors and kitchens in timber, stone or colour finishes. By Bora Decor.',
    eyebrow: 'Interior Wrapping Adelaide · Bora Decor',
    h1: 'Love your space. Keep what works.',
    lead:
      'A fresh finish for the space you already have. Transform your kitchen, cabinetry or business interior with professionally installed architectural film.',
    image: 'decor-kitchen-timber',
    imageAlt: 'Kitchen with timber-look cabinetry and stone-look island finish',
    card: 'Architectural film that gives desks, cabinets and kitchens a brand-new finish.',
    feature: 'finishes',
    why: {
      title: 'Why interior wrapping?',
      items: [
        { title: 'Strong & durable', text: 'Architectural films are made for everyday use on suitable interior surfaces.' },
        { title: 'Hygienic & non-porous', text: 'A smooth surface that is easy to wipe clean.' },
        { title: 'Stain & scratch resistant', text: 'Made to keep looking good in busy spaces.' },
        { title: 'Easy care', text: 'We confirm care instructions for your chosen film with your quote.' },
      ],
    },
    options: {
      title: 'What can we wrap?',
      items: [
        { title: 'Reception desks & counters', text: 'Refresh the surfaces your customers see first: desk fronts, side panels and suitable counters.' },
        { title: 'Cabinets & storage', text: 'Give cupboards, storage units and built-ins a consistent new look while keeping joinery that works.' },
        { title: 'Interior doors', text: 'Bring doors into the same colour and material palette as the rest of your space.' },
        { title: 'Wall panels & feature surfaces', text: 'A new finish for suitable smooth panels, creating a more cohesive space.' },
      ],
    },
    gallery: ['decor-kitchen-timber', 'decor-kitchen-marble'],
    quote: {
      text: 'The whole process was smooth, and the team delivered exactly what we wanted.',
      name: 'Tom W',
    },
    faq: [
      { q: 'Is wrapping right for my kitchen or cabinetry?', a: 'It can be a good option when the layout works and the structure is sound. Loose finishes, swollen boards, damage or moisture problems may need repair or replacement first. We review the condition before recommending a wrap.' },
      { q: 'Is architectural film the same as paint or new joinery?', a: 'No. It is a decorative film applied to a prepared surface. It creates a timber, stone or colour finish while keeping the existing substrate. It changes how the surface looks; it does not rebuild cabinetry or make it stronger.' },
      { q: 'How much does interior wrapping cost?', a: 'It depends on the area, film, preparation, edges, profiles and access. Send us photos and approximate dimensions for a tailored quote. If a site assessment is needed, we explain the next step and any fee before going ahead.' },
      { q: 'How durable is it, and how do I look after it?', a: 'Performance depends on the product, surface, installation and daily use. We confirm care instructions and any warranty with your quote. Use the recommended cleaning method and protect the finish from sharp objects, direct heat and harsh cleaners.' },
      { q: 'Can you wrap benchtops and splashbacks?', a: 'Some surfaces may be suitable, but heat, water, edges and use need a closer look. We only recommend a finish after checking the product and application. Film does not have the same properties as a solid stone benchtop.' },
      { q: 'How long does installation take?', a: 'It depends on the number of surfaces, preparation and complexity. We confirm the expected time and any access needs with your quote.' },
    ],
    related: ['office-signage', 'reception-signs', 'wall-graphics', 'frosted-window-film'],
  },
];

export const bySlug = Object.fromEntries(services.map((s) => [s.slug, s]));

// The four services that lead on the home page, in this order
export const featured = ['vehicle-signage', 'shopfront-signage', 'window-graphics', 'office-signage'];

export const process = {
  title: 'From idea to installation.',
  lead: 'One accountable team, four clear stages and fewer surprises.',
  steps: [
    { title: 'Tell us what you need', text: 'Send your logo, photos, measurements or project brief.' },
    { title: 'Quote & site check', text: 'We confirm the right materials, access and installation details.' },
    { title: 'Design & approval', text: 'You receive a clear visual proof before anything goes to production.' },
    { title: 'Production & install', text: 'We produce your signage and our team installs it, then we check you are happy with the result.' },
  ],
};

export const reasons = [
  { title: 'Custom design', text: 'Every sign is designed around your brand, your site and the people you want to reach.' },
  { title: 'Quality materials', text: 'Films, substrates and lighting chosen to look great and last in Australian conditions.' },
  { title: 'Craftsmanship', text: 'Clean edges, straight lines and tidy installs. The details are the job.' },
  { title: 'One local team', text: 'Design, production and installation by one Adelaide team, so nothing gets lost.' },
];

export const testimonials = [
  bySlug['vehicle-signage'].quote,
  bySlug['reception-signs'].quote,
  bySlug['wall-graphics'].quote,
  bySlug['mesh-banner-adelaide'].quote,
];

export const homeFaq = [
  { q: 'What areas do you service?', a: 'We are based in Welland and work with businesses across Adelaide and surrounds. If you are further out, ask us and we will let you know what is possible.' },
  { q: 'Do you handle design, production and installation?', a: 'Yes. One team takes your project from the first brief to the final install, with a visual proof for you to approve before anything is made.' },
  { q: 'How much does signage cost?', a: 'Every job is different: size, materials, design and installation all affect the price. Send us photos, measurements or a brief and we will give you a clear, tailored quote.' },
  { q: 'What do I need to send for a quote?', a: 'Your logo if you have one, photos of the vehicle, wall, window or shopfront, rough measurements and what you want to achieve. That is enough to get started.' },
  { q: 'Do you offer interior wrapping?', a: 'Yes, through Bora Decor. We refresh reception desks, cabinetry, doors and kitchens with architectural film in timber, stone and colour finishes.' },
];

export const finishes = [
  { name: 'Timber looks', note: 'Warm & natural', swatch: 'timber' },
  { name: 'Stone & marble looks', note: 'Quietly striking', swatch: 'marble' },
  { name: 'Soft neutrals', note: 'Effortlessly calm', color: '#D9D0C5' },
  { name: 'Statement colours', note: 'A little more depth', color: '#29384A' },
];

// Photos in the "Our work" strip on the home page
export const work = [
  { img: 'install-van-wrap', title: 'Van wrap install', tag: 'Vehicle signage', link: 'vehicle-signage' },
  { img: 'install-building-sign-tall', title: 'Building sign at height', tag: 'Shopfront signage', link: 'shopfront-signage' },
  { img: 'trailer-wrap-mr-canes', title: 'Mr Cane’s food trailer', tag: 'Trailer wrap', link: 'trailer-wrap' },
  { img: 'shopfront-lp-accounting-detail', title: 'LP Accounting', tag: 'Shopfront signage', link: 'shopfront-signage' },
  { img: 'office-frosted-glass', title: 'Meeting room frosting', tag: 'Frosted film', link: 'frosted-window-film' },
  { img: 'van-wrap-omkar', title: 'OM KAR Autocare', tag: 'Vehicle signage', link: 'vehicle-signage' },
  { img: 'window-graphics-clinic', title: 'Clinic windows', tag: 'Window graphics', link: 'window-graphics' },
  { img: 'reception-sign-divine-nursing', title: 'Divine Nursing', tag: 'Reception sign', link: 'reception-signs' },
  { img: 'wall-graphics-adelaide', title: 'Welcome to Adelaide', tag: 'Wall graphics', link: 'wall-graphics' },
];
