# Gera as 6 páginas de serviço e a página "Other services" a partir das partes comuns do index.html
# (cabeçalho, menu, formulário, projetos, rodapé...). Saída: <site>/<slug>/index.html, HTML estático.
#
# Uso: python3 tools/service-pages.py
# Rode de novo sempre que mudar o cabeçalho, o menu, o formulário ou o rodapé do index.html, para as outras
# páginas acompanharem. Os textos de cada página ficam aqui (SERVICES e OTHER): edite aqui, não no HTML gerado,
# senão a próxima rodada apaga a mudança.
import re, json, html, pathlib

SITE = pathlib.Path(__file__).resolve().parent.parent
index = (SITE / 'index.html').read_text()

def block(pattern):
    m = re.search(pattern, index, flags=re.S)
    assert m, pattern
    return m.group(0)

def relink(s):
    """Ajusta os caminhos para uma página um nível abaixo da raiz."""
    s = re.sub(r'(src|href)="assets/', r'\1="../assets/', s)
    s = re.sub(r'(srcset)="([^"]+)"', lambda m: m.group(1) + '="' + re.sub(r'(^|, )assets/', r'\1../assets/', m.group(2)) + '"', s)
    s = s.replace('href="./"', 'href="../"')
    s = re.sub(r'(?<!use )href="#(?!contact"|main")([a-z-]+)"', r'href="../#\1"', s)
    for slug in ['hardwood-floor-installation', 'luxury-vinyl-plank', 'laminate-flooring', 'tile-installation', 'hardwood-floor-refinishing', 'stair-treads', 'other-services']:
        s = s.replace(f'href="{slug}/"', f'href="../{slug}/"')
    return s

icons = ''.join(re.findall(r'<symbol id="i-[^"]+".*?</symbol>', index, flags=re.S))
topbar = relink(block(r'<aside class="topbar".*?</aside>'))
header = relink(block(r'<header class="site-header".*?</header>'))
menu = relink(block(r'<div class="menu" id="menu".*?</div>\s*</div>'))
work = relink(block(r'<section class="work section".*?</section>'))
steps = relink(block(r'<div class="process" id="process">.*?</ol>\s*</div>'))
contact = relink(block(r'<section class="contact section".*?</section>'))
footer = relink(block(r'<footer class="site-footer">.*?</footer>'))
actionbar = relink(block(r'<nav class="action-bar".*?</nav>'))
lightbox = relink(block(r'<dialog class="lightbox".*?</dialog>'))
rating = relink(block(r'<a class="hero-rating".*?</a>'))

COUNTIES = [{"@type": "AdministrativeArea", "name": "King County, WA"}, {"@type": "AdministrativeArea", "name": "Snohomish County, WA"}]

SERVICES = [
  dict(
    slug='hardwood-floor-installation', key='hardwood', img='hardwood', option='Hardwood', short='Hardwood', num='01',
    title='Hardwood Floor Installation in King & Snohomish County, WA',
    desc='Solid and engineered hardwood installed over a flattened, prepped subfloor. Free in-home measure and written proposal. Serving Seattle, Bellevue, Everett, Lynnwood and nearby.',
    h1='Hardwood floor installation',
    sub='Solid and engineered hardwood, laid over a subfloor we flatten and prep first. Species, width and finish chosen to match the light your rooms actually get.',
    alt='Living room with a light oak hardwood floor',
    included_h2='What’s included in a hardwood install.',
    included=[
      'Free in-home measure and moisture check',
      'Tear-out and haul-away of the old floor',
      'Subfloor flattening, re-screwing and prep',
      'Underlayment matched to the floor and the subfloor',
      'Nail-down, glue-down or floating install',
      'Baseboards or shoe moulding, transitions and vent covers',
      'Final walkthrough and clean-up',
    ],
    know_h2='Before you choose hardwood.',
    know=[
      ('Best rooms', 'Living rooms, bedrooms, dining rooms, hallways and stairs. For full bathrooms and wet basements, luxury vinyl plank or tile is the better call.'),
      ('Solid or engineered', 'Solid hardwood can be sanded and refinished many times. Engineered hardwood is more stable over concrete, radiant heat and rooms with humidity swings.'),
      ('Acclimation', 'The boards rest in your home for a few days before we install them, so they match the moisture of the rooms they’ll live in.'),
      ('Prefinished or site-finished', 'Prefinished boards are ready the day they go down. Site-finished floors are sanded and coated in place for a seamless, custom look.'),
    ],
    faq=[
      ('Should I choose solid or engineered hardwood?', 'Solid hardwood is ¾ in thick and can be sanded and refinished many times; it’s the classic choice over a plywood subfloor. Engineered hardwood has a real wood top layer over a stable core, so it handles concrete slabs, radiant heat and humidity swings better. We recommend one after we see your subfloor.'),
      ('Can you install hardwood over concrete?', 'Engineered hardwood can go over a flat, moisture-tested slab, glued down or floated. Solid hardwood generally needs a wood subfloor.'),
      ('Do you install hardwood on stairs?', 'Yes. We build treads, risers and nosing that match the new floor, so the stairs and the rooms read as one.'),
    ],
  ),
  dict(
    slug='luxury-vinyl-plank', key='lvp', img='lvp', option='Luxury vinyl plank (LVP)', short='Luxury Vinyl Plank', num='02',
    title='Luxury Vinyl Plank (LVP) Installation in King & Snohomish County, WA',
    desc='Waterproof luxury vinyl plank for kitchens, basements and homes with kids and pets. Click-lock or glue-down, with the subfloor leveled first. Free in-home estimates.',
    h1='Luxury vinyl plank installation',
    sub='Fully waterproof and warm underfoot: the right answer for kitchens, basements and homes with kids and pets. Click-lock or glue-down, depending on the slab.',
    alt='Open kitchen and living room with a wood-look luxury vinyl plank floor',
    included_h2='What’s included in an LVP install.',
    included=[
      'Free in-home measure and slab moisture test',
      'Tear-out and haul-away of carpet, vinyl or laminate',
      'Leveling of dips and high spots in the subfloor',
      'Vapor barrier or underlayment where the floor needs it',
      'Click-lock floating or full-spread glue-down install',
      'Undercut door jambs, transitions and trim',
      'Final walkthrough and clean-up',
    ],
    know_h2='Before you choose luxury vinyl plank.',
    know=[
      ('Best rooms', 'Kitchens, bathrooms, laundry rooms, basements, rentals and any home with pets. It’s quiet, warm underfoot and easy to clean.'),
      ('Wear layer', 'Thicker wear layers hold up better. Around 12 mil suits light traffic; 20 mil is the pick for busy homes, kids and dogs.'),
      ('Flat matters', 'Vinyl shows every dip in the subfloor, so leveling is part of the job, not an extra we find later.'),
      ('Waterproof planks', 'The planks are waterproof. Standing water should still be wiped up so it can’t reach the subfloor at the edges.'),
    ],
    faq=[
      ('Is luxury vinyl plank really waterproof?', 'Rigid-core LVP planks are waterproof, which makes them a great fit for kitchens, baths and basements. Standing water should still be wiped up so it can’t reach the subfloor at the edges.'),
      ('Click-lock or glue-down?', 'Click-lock floats over the subfloor and goes in fast. Glue-down is better for large open areas, heavy rolling loads or rooms with big temperature swings, like sunrooms. We recommend one after the measure.'),
      ('Can LVP go over my existing floor?', 'It can often go over a flat, well-bonded floor like sheet vinyl or tile. Carpet always comes out. We check during the measure.'),
    ],
  ),
  dict(
    slug='laminate-flooring', key='laminate', img='laminate', option='Laminate', short='Laminate', num='03',
    title='Laminate Flooring Installation in King & Snohomish County, WA',
    desc='Scratch-resistant, budget-friendly laminate floated over a quiet underlayment, with the expansion gap hidden under the trim. Free in-home measure and written proposal.',
    h1='Laminate flooring installation',
    sub='Hard-wearing and budget-friendly, with wood looks that hold up to daily traffic. Floated over a quiet underlayment, with the expansion gap hidden under the trim.',
    alt='Living room with a wood-look laminate floor',
    included_h2='What’s included in a laminate install.',
    included=[
      'Free in-home measure',
      'Tear-out and haul-away of the old floor',
      'Subfloor flattening and prep',
      'Foam or cork underlayment, with a moisture barrier where needed',
      'Floating install with the right expansion gap at every wall',
      'Baseboards or shoe moulding and transitions',
      'Final walkthrough and clean-up',
    ],
    know_h2='Before you choose laminate.',
    know=[
      ('Best rooms', 'Bedrooms, living rooms, offices, hallways and rentals. For full bathrooms and wet basements, luxury vinyl plank is the safer pick.'),
      ('Scratch resistance', 'Laminate’s hard melamine top layer shrugs off pet nails, chair legs and grit better than many floors.'),
      ('Water', 'Many newer laminates are water-resistant, but they’re not waterproof. Spills should be wiped up quickly.'),
      ('Room to move', 'Floating floors expand and shrink with the seasons. We leave a small gap at every wall and hide it under the trim.'),
    ],
    faq=[
      ('Laminate or luxury vinyl plank?', 'Laminate is harder on top and resists scratches well; LVP is fully waterproof. We usually suggest laminate for living areas and bedrooms, and LVP for kitchens, baths and basements.'),
      ('Why does laminate need an expansion gap?', 'Floating floors move a little with temperature and humidity. A small gap at the walls lets them move without buckling, and the baseboard or shoe moulding hides it.'),
      ('Is laminate noisy?', 'A flat subfloor and a good underlayment make the difference. We flatten first and pick an underlayment that keeps footsteps quiet.'),
    ],
  ),
  dict(
    slug='tile-installation', key='tile', img='tile', option='Tile', short='Tile', num='04',
    title='Tile Installation in King & Snohomish County, WA',
    desc='Porcelain, ceramic and natural stone tile set flat, spaced true and sealed. Bathrooms, entries, laundry rooms and kitchens. Free in-home estimates.',
    h1='Tile installation',
    sub='Porcelain, ceramic and natural stone, set flat, spaced true and sealed to last.',
    alt='Open kitchen and dining area with a large-format porcelain tile floor',
    included_h2='What’s included in a tile install.',
    included=[
      'Free in-home measure and layout plan',
      'Tear-out and haul-away of the old floor',
      'Leveling, backer board or uncoupling membrane',
      'Layout from the room’s center lines, with no thin slivers at doorways',
      'Full-coverage thinset and leveling clips on large tiles',
      'Grout, sealing and transitions',
      'Final walkthrough and clean-up',
    ],
    know_h2='Before you choose tile.',
    know=[
      ('Best rooms', 'Bathrooms, entryways, mudrooms, laundry rooms and kitchens: anywhere water and grit show up.'),
      ('Porcelain or ceramic', 'Porcelain is denser and absorbs less water, so it works almost anywhere. Ceramic is lighter and great for lower-traffic floors and walls.'),
      ('Large format', 'Big tiles need a very flat floor and full mortar coverage, so leveling is part of the job.'),
      ('Grout', 'Sealed cement grout or stain-resistant epoxy grout. We help you pick a color that hides daily life.'),
    ],
    faq=[
      ('What’s the difference between porcelain and ceramic tile?', 'Porcelain is denser and absorbs less water, so it’s tougher and works almost anywhere. Ceramic is lighter and great for walls and lower-traffic floors.'),
      ('Do you install large-format tile?', 'Yes. Large tiles need a very flat substrate and full mortar coverage, so leveling and back-buttering are part of the job.'),
      ('Can you tile over a wood subfloor?', 'Yes, with the right backer board or uncoupling membrane so normal floor movement doesn’t crack the tile or the grout.'),
    ],
  ),
  dict(
    slug='hardwood-floor-refinishing', key='refinishing', img='refinishing', option='Hardwood refinishing', short='Hardwood Refinishing', num='05',
    title='Hardwood Floor Refinishing in King & Snohomish County, WA',
    desc='Sanding, staining and sealing that brings tired hardwood back without replacing it. Stain samples on your own floor. Free in-home estimates in Seattle, Bellevue and nearby.',
    h1='Hardwood floor refinishing',
    sub='Sanding, staining and sealing that brings tired floors back without replacing them.',
    alt='Sanding a hardwood floor down to bare wood during a refinish',
    included_h2='What’s included in a refinish.',
    included=[
      'Free check of board thickness, damage and old finish',
      'Rooms sealed off and floors around them protected',
      'Sanding to bare wood, edges and corners included',
      'Board repairs or replacements where needed',
      'Stain samples on your own floor before we commit',
      'Sealer and two coats of finish',
      'Final walkthrough and clean-up',
    ],
    know_h2='Before you refinish.',
    know=[
      ('Refinish or recoat', 'If the wear is only in the finish, a buff and recoat freshens the floor without sanding. Deeper scratches and gray boards need a full sand.'),
      ('Color', 'Sanding takes the floor back to bare wood, so you can go lighter, darker or natural. We test stains on your floor, in your light.'),
      ('Back on the floor', 'Light foot traffic is usually fine after about a day. Furniture and rugs come back later; we give you exact times for the finish we use.'),
      ('Engineered floors', 'Many engineered floors can be refinished at least once if the wear layer is thick enough. We check before we quote.'),
    ],
    faq=[
      ('How many times can a hardwood floor be refinished?', 'Solid ¾ in hardwood can usually be sanded several times over its life. Engineered floors depend on the wear layer: some can be sanded once or twice, some only recoated. We check before we quote.'),
      ('Can you change the color of my floor?', 'Yes. After sanding to bare wood we can stain it lighter or darker. We test a few colors on your floor so you can see them in your own light.'),
      ('Do I need to move out during a refinish?', 'Usually not for the whole job, but you’ll need to stay off the floors while the finish cures. We plan the rooms in an order that keeps your home usable.'),
    ],
  ),
  dict(
    slug='stair-treads', key='stairs', img='stairs', option='Stair treads', short='Stair Treads', num='06',
    title='Stair Treads and Risers in King & Snohomish County, WA',
    desc='Carpet-to-hardwood stair conversions, new treads, risers and nosing finished to match your floors. Free in-home estimates across King and Snohomish County.',
    h1='Stair treads and risers',
    sub='Treads, risers and nosing cut and finished to match the floor they run into.',
    alt='Staircase with light oak treads and a dark wood handrail',
    included_h2='What’s included in a stair job.',
    included=[
      'Free in-home measure of every step',
      'Carpet, pad and tack strip removal',
      'New hardwood treads, or cap treads over existing stairs',
      'Risers painted or matched to the treads',
      'Bullnose or square nosing, plus a matching landing',
      'Treads glued and nailed for a solid, quiet step',
      'Final walkthrough and clean-up',
    ],
    know_h2='Before you redo your stairs.',
    know=[
      ('Matching the floor', 'We match species, width and stain to the floor at the top and bottom, so the stairs don’t look like an afterthought.'),
      ('Cap treads or new treads', 'Cap treads cover the existing stairs without tearing them out. Damaged stairs get new treads on the original structure.'),
      ('Code', 'Residential stairs in Washington follow the IRC: risers up to 7¾ in, treads at least 10 in deep, and nosing between ¾ and 1¼ in.'),
      ('Risers', 'White or painted risers brighten a stairwell; stained risers match a traditional look. Both are on the table.'),
    ],
    faq=[
      ('Can you replace carpet on stairs with hardwood?', 'Yes. We remove the carpet, pad and tack strips, then install hardwood treads and new or painted risers, matched to your floors.'),
      ('Do the stairs need to be rebuilt?', 'Usually not. Cap treads go over the existing stair structure. If a stringer or tread is damaged, we tell you during the measure.'),
      ('Can you match my existing hardwood?', 'We match species, width and finish as closely as possible and test the stain on a sample tread first.'),
    ],
  ),
]

def esc(s):
    return html.escape(s, quote=False)

def page(svc):
    others = [o for o in SERVICES if o['slug'] != svc['slug']]
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "name": svc['h1'],
                "serviceType": svc['h1'],
                "description": svc['desc'],
                "areaServed": COUNTIES,
                "provider": {"@type": "HomeAndConstructionBusiness", "name": "Black Rock Floors", "telephone": "+1-425-543-4667", "url": "/"},
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": "/"},
                    {"@type": "ListItem", "position": 2, "name": "Services", "item": "/#services"},
                    {"@type": "ListItem", "position": 3, "name": svc['h1']},
                ],
            },
            {
                "@type": "FAQPage",
                "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in svc['faq']],
            },
        ],
    }
    included = '\n'.join(f'            <li><svg class="i" aria-hidden="true"><use href="#i-check"/></svg>{esc(t)}</li>' for t in svc['included'])
    know = '\n'.join(f'          <div class="know-item" data-reveal><dt>{esc(t)}</dt><dd>{esc(d)}</dd></div>' for t, d in svc['know'])
    faq = '\n'.join(
        f'          <details class="qa">\n            <summary><span>{esc(q)}</span><svg class="i" aria-hidden="true"><use href="#i-plus"/></svg></summary>\n            <div class="qa-body"><p>{esc(a)}</p></div>\n          </details>'
        for q, a in svc['faq'])
    more = '\n'.join(
        f'        <a class="more-card" href="../{o["slug"]}/"><img src="../assets/img/services/{o["img"]}-640.webp?v=4" width="640" height="800" alt="" loading="lazy"><span>{esc(o["short"])}<svg class="i" aria-hidden="true"><use href="#i-arrow"/></svg></span></a>'
        for o in others)
    form = contact.replace(f'<option>{svc["option"]}</option>', f'<option selected>{svc["option"]}</option>')
    assert 'selected' in form, svc['option']
    hero_img = f'''<picture>
            <source media="(max-aspect-ratio: 4/5)" srcset="../assets/img/services/{svc['img']}.webp?v=4" width="1000" height="1250">
            <img class="hero-poster" src="../assets/img/services/{svc['img']}-wide.webp?v=4" width="1600" height="1000" alt="{esc(svc['alt'])}" fetchpriority="high">
          </picture>'''
    title = f"{svc['title']} · Black Rock Floors"
    # Título em duas linhas, como no topo da home: a primeira em maiúsculas, o final em itálico
    h1a, h1b = ('Stair treads', 'and risers.') if svc['h1'] == 'Stair treads and risers' else (svc['h1'].rsplit(' ', 1)[0], svc['h1'].rsplit(' ', 1)[1] + '.')
    return f'''<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{esc(title)}</title>
  <meta name="description" content="{html.escape(svc['desc'])}">
  <meta name="theme-color" content="#0e0e0d">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Black Rock Floors">
  <meta property="og:title" content="{html.escape(svc['h1'])} · Black Rock Floors">
  <meta property="og:description" content="{html.escape(svc['desc'])}">
  <meta property="og:image" content="../assets/img/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../assets/img/apple-touch-icon.png">
  <link rel="preload" href="../assets/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../assets/fonts/cormorant-500.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../assets/fonts/cormorant-italic-450.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../assets/css/styles.css">
  <script>document.documentElement.classList.add('js')</script>
  <script type="application/ld+json">
  {json.dumps(ld, ensure_ascii=False, indent=2).replace(chr(10), chr(10) + '  ')}
  </script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <svg class="sprite" aria-hidden="true" focusable="false">
    <defs>
      {icons}
    </defs>
  </svg>

  {topbar}

  {header}

  {menu}

  <main id="main">
    <section class="hero hero--page" aria-labelledby="hero-title">
      <div class="hero-panel">
        <div class="hero-media">
          {hero_img}
        </div>
        <div class="hero-content">
          <ol class="crumbs" role="list" aria-label="Breadcrumb">
            <li><a href="../">Home</a></li>
            <li><a href="../#services">Services</a></li>
            <li aria-current="page">{esc(svc['short'])}</li>
          </ol>
          <h1 class="hero-title" id="hero-title"><span class="line"><span>{esc(h1a)}</span></span> <span class="line"><span><em>{esc(h1b)}</em></span></span></h1>
          <p class="hero-sub">{esc(svc['sub'])}</p>
          <div class="hero-actions">
            <a class="btn btn--square" href="#contact">Get a free estimate<svg class="i" aria-hidden="true"><use href="#i-arrow"/></svg></a>
            <a class="hero-link" href="tel:+14255434667"><svg class="i" aria-hidden="true"><use href="#i-phone"/></svg>(425) 543-4667</a>
          </div>
        </div>
        {rating}
      </div>
    </section>

    <section class="included section" aria-labelledby="included-title">
      <div class="wrap included-grid">
        <div class="included-copy">
          <p class="eyebrow">Service {svc['num']} · King &amp; Snohomish County</p>
          <h2 class="h2" id="included-title" data-reveal>{esc(svc['included_h2'])}</h2>
          <p class="lead" data-reveal>Every job is measured, quoted in writing and installed by the same crew, start to finish.</p>
          <ul class="checklist" role="list">
{included}
          </ul>
        </div>
        <div class="next-card" data-reveal>
          <p class="eyebrow eyebrow--light">Next step</p>
          <p class="next-card-title">A free, <em class="nowrap">no-pressure</em> estimate.</p>
          <ul class="next-card-list" role="list">
            <li><svg class="i" aria-hidden="true"><use href="#i-check"/></svg>We measure every room and check the subfloor.</li>
            <li><svg class="i" aria-hidden="true"><use href="#i-check"/></svg>Written proposal, usually within 24 hours.</li>
            <li><svg class="i" aria-hidden="true"><use href="#i-check"/></svg>The number you approve is the number you pay.</li>
          </ul>
          <div class="next-card-actions">
            <a class="btn btn--red" href="#contact">Get a free estimate<svg class="i" aria-hidden="true"><use href="#i-arrow"/></svg></a>
            <a class="next-card-phone" href="tel:+14255434667"><svg class="i" aria-hidden="true"><use href="#i-phone"/></svg>(425) 543-4667</a>
          </div>
        </div>
      </div>
    </section>

    <section class="know section" aria-labelledby="know-title">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Good to know</p>
          <h2 class="h2" id="know-title" data-reveal>{esc(svc['know_h2'])}</h2>
        </div>
        <dl class="know-grid">
{know}
        </dl>
        {steps}
      </div>
    </section>

    {work}

    <section class="faq section" id="faq" aria-labelledby="faq-title">
      <div class="wrap faq-grid">
        <div class="faq-intro">
          <p class="eyebrow">FAQ</p>
          <h2 class="h2" id="faq-title" data-reveal>{esc(svc['short'])} questions</h2>
          <p class="lead" data-reveal>Still wondering about something? Call or text <a href="tel:+14255434667">(425) 543-4667</a> and you’ll get a straight answer.</p>
        </div>
        <div class="faq-list">
{faq}
        </div>
      </div>
    </section>

    <section class="more section" aria-labelledby="more-title">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow eyebrow--light">More services</p>
          <h2 class="h2" id="more-title" data-reveal>Every floor. <em>One accountable crew.</em></h2>
        </div>
        <div class="more-grid">
{more}
        </div>
      </div>
    </section>

    {form}
  </main>

  {footer}

  {actionbar}

  {lightbox}

  <script src="../assets/js/app.js" defer></script>
</body>
</html>
'''


# ---------- Página "Other services": a aba de reformas que o Gabriel pediu (16/10) ----------
# A introdução é do próprio Gabriel (WhatsApp, 16/10 15:21: "essa aí seria a introdução dessa página").
# As fotos dos 6 serviços e dos trabalhos com a cidade também são dele (16/10, 15:31 a 15:35), e ele pediu que
# ficassem "como lá na outra parte, de LVP, laminada" (a lista de serviços da home) e "tipo nossos trabalhos, com a
# cidade" (a faixa de projetos da home). As frases de cada serviço foram escritas por nós: pedir para ele conferir.
OTHER_INTRO = dict(
    p1='At Black Rock Remodeling LLC, we specialize in residential remodeling and new construction finishing. We are committed '
       'to providing reliable service, exceptional attention to detail, and clear communication with every client.',
    p2='Our services include interior and exterior painting, kitchen and bathroom remodeling, drywall installation and repair, '
       'finish carpentry, door and window installation, baseboards, trim, flooring, and more.',
    tagline='Quality craftsmanship, reliable service, and excellent communication from start to finish.',
)
# Serviços com foto, na mesma lista da home. img = assets/img/other/services/<img>.webp (819 px) e <img>-640.webp.
# pick = opção do formulário que o link já deixa escolhida; ld = nome nos dados para o Google, quando diferente do título.
OTHER_SERVICES = [
    dict(name='Exterior painting', img='exterior-painting', pick='Painting (interior or exterior)', link='Get a painting estimate',
         desc='Siding, trim and doors, washed, scraped, caulked and primed before the first coat, so the finish stands up to Northwest rain.',
         tags=['Siding', 'Trim', 'Doors', 'Prep and priming'],
         alt='Two-story house with white siding, a dark board-and-batten gable, black windows and a wood-trimmed entry'),
    dict(name='Interior painting', img='interior-painting', pick='Painting (interior or exterior)', link='Get a painting estimate',
         desc='Walls, ceilings, trim and doors. Holes and dents patched, floors and furniture covered, cut lines kept sharp.',
         tags=['Walls', 'Ceilings', 'Trim and doors', 'Drywall patching'],
         alt='Freshly painted empty living room with white trim, large windows and a wood-look floor'),
    dict(name='Kitchen remodeling', img='kitchen', pick='Kitchen remodeling', link='Get a kitchen estimate',
         desc='From a cabinet and backsplash refresh to a full remodel, planned as one project, with the floor included.',
         tags=['Cabinets', 'Backsplash', 'Trim', 'Flooring'],
         alt='Kitchen with white cabinets, a dark wood island with stools, black pendant lights and a wood-look floor'),
    dict(name='Bathroom remodeling', img='bathroom', pick='Bathroom remodeling', link='Get a bathroom estimate',
         desc='Updates and full remodels: tile, vanity and finishes, with a floor that’s made for water.',
         tags=['Tile', 'Vanities', 'Paint', 'Flooring'],
         alt='Bathroom with a glass shower, a freestanding tub, a double vanity and a large tile floor'),
    dict(name='Decks & fences', img='decks-fences', pick='Decks and fences', link='Get a deck or fence estimate',
         desc='New decks, railings and fences, built square, fastened right and sealed against the weather.',
         tags=['Decks', 'Railings', 'Fences', 'Stain and seal'],
         alt='Covered deck with wood-look boards and a black railing, looking out on a fenced lawn'),
    dict(name='New construction', ld='New construction finishing', img='new-construction', pick='New construction finishing', link='Get a finishing estimate',
         desc='The finish work on new homes and additions: drywall, doors, trim, baseboards, paint and floors, from bare framing to move-in ready.',
         tags=['Drywall', 'Doors and windows', 'Trim and baseboards', 'Finish carpentry'],
         alt='New house framed in wood, with a staircase and tall windows, ready for the finish work'),
]
# Os outros serviços da lista do Gabriel, em cartões sem foto
OTHER_MORE = [
    ('Drywall installation & repair', 'New walls hung and finished, and repairs that disappear under paint.'),
    ('Finish carpentry', 'The detail work that makes a room look finished.'),
    ('Door & window installation', 'New doors and windows, installed, trimmed out and sealed.'),
    ('Baseboards & trim', 'Cut tight at every corner and finished clean against the floor.'),
]
# Trabalhos reais, com a cidade (assets/img/other/work/<img>.webp, 720x900)
OTHER_WORK = [
    ('kirkland-kitchen', 'Kirkland', 'Kitchen with white cabinets, a marble-look island and dark wood-look floors in a Kirkland home'),
    ('seattle-stairs', 'Seattle', 'Staircase with dark treads and white risers in a Seattle home'),
    ('lynnwood-home', 'Lynnwood', 'New home with white siding and black trim in Lynnwood, with the Black Rock van out front'),
    ('bothell-bathroom', 'Bothell', 'Bathroom with green walls, green wall tile, a freestanding tub and a gray tile floor in a Bothell home'),
    ('seattle-framing', 'Seattle', 'Room framed and insulated, ready for drywall, on a job in Seattle'),
    ('bellevue-landing', 'Bellevue', 'Upstairs landing with carpet and a black metal railing in a Bellevue home'),
]

def other_page():
    desc = ('Painting inside and out, kitchen and bathroom remodeling, decks and fences, and new construction finishing '
            'from Black Rock Remodeling LLC, across King & Snohomish County, WA.')
    provider = {"@type": "HomeAndConstructionBusiness", "name": "Black Rock Floors", "telephone": "+1-425-543-4667", "url": "/"}
    plain = lambda name: name.replace('&', 'and')
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            *[{"@type": "Service", "name": plain(s.get('ld', s['name'])), "serviceType": plain(s.get('ld', s['name'])), "description": s['desc'],
               "areaServed": COUNTIES, "provider": provider} for s in OTHER_SERVICES],
            *[{"@type": "Service", "name": plain(name), "serviceType": plain(name), "description": text,
               "areaServed": COUNTIES, "provider": provider} for name, text in OTHER_MORE],
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": "/"},
                    {"@type": "ListItem", "position": 2, "name": "Other services"},
                ],
            },
        ],
    }
    arrow = '<svg class="i" aria-hidden="true"><use href="#i-arrow"/></svg>'
    svcs = '\n'.join(
        f"""            <li class="svc{' is-active' if i == 1 else ''}" data-svc>
              <figure class="svc-media">
                <img src="../assets/img/other/services/{s['img']}-640.webp" srcset="../assets/img/other/services/{s['img']}-640.webp 640w, ../assets/img/other/services/{s['img']}.webp 819w" sizes="(min-width: 700px) 40vw, 92vw" width="640" height="800" alt="{html.escape(s['alt'])}" loading="lazy">
              </figure>
              <div class="svc-body">
                <span class="svc-num">{i:02d}</span>
                <h3 class="svc-name">{esc(s['name'])}</h3>
                <div class="svc-more">
                  <div class="svc-more-inner">
                    <p class="svc-desc">{esc(s['desc'])}</p>
                    <ul class="tags" role="list">{''.join(f'<li>{esc(t)}</li>' for t in s['tags'])}</ul>
                    <a class="link-arrow" href="#contact" data-pick="{html.escape(s['pick'])}">{esc(s['link'])}{arrow}</a>
                  </div>
                </div>
              </div>
            </li>"""
        for i, s in enumerate(OTHER_SERVICES, 1))
    first = len(OTHER_SERVICES)
    cards = '\n'.join(
        f"""          <article class="other-card" data-reveal>
            <span class="other-num">{i:02d}</span>
            <h3 class="other-name">{esc(name)}</h3>
            <p>{esc(text)}</p>
          </article>"""
        for i, (name, text) in enumerate(OTHER_MORE, first + 1))
    projects = '\n'.join(
        f'          <button class="project" type="button" data-project><img src="../assets/img/other/work/{img}.webp" width="720" height="900" alt="{html.escape(alt)}" loading="lazy"><span class="project-meta"><span class="project-city">{esc(city)}</span></span></button>'
        for img, city, alt in OTHER_WORK)
    more = '\n'.join(
        f'        <a class="more-card" href="../{o["slug"]}/"><img src="../assets/img/services/{o["img"]}-640.webp?v=4" width="640" height="800" alt="" loading="lazy"><span>{esc(o["short"])}{arrow}</span></a>'
        for o in SERVICES)
    n_flooring = first + len(OTHER_MORE) + 1
    title = 'Home Remodeling & Painting in King & Snohomish County, WA · Black Rock Floors'
    return f"""<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{esc(title)}</title>
  <meta name="description" content="{html.escape(desc)}">
  <meta name="theme-color" content="#0e0e0d">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Black Rock Floors">
  <meta property="og:title" content="More than flooring · Black Rock Floors">
  <meta property="og:description" content="{html.escape(desc)}">
  <meta property="og:image" content="../assets/img/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../assets/img/apple-touch-icon.png">
  <link rel="preload" href="../assets/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../assets/fonts/cormorant-500.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../assets/fonts/cormorant-italic-450.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../assets/css/styles.css">
  <script>document.documentElement.classList.add('js')</script>
  <script type="application/ld+json">
  {json.dumps(ld, ensure_ascii=False, indent=2).replace(chr(10), chr(10) + '  ')}
  </script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <svg class="sprite" aria-hidden="true" focusable="false">
    <defs>
      {icons}
    </defs>
  </svg>

  {topbar}

  {header}

  {menu}

  <main id="main">
    <section class="hero hero--page" aria-labelledby="hero-title">
      <div class="hero-panel">
        <div class="hero-media">
          <picture>
            <source media="(max-aspect-ratio: 4/5)" srcset="../assets/img/other/bathroom.webp" width="1000" height="1250">
            <img class="hero-poster" src="../assets/img/other/bathroom-wide.webp" width="1088" height="680" alt="Bathroom with a glass shower, a freestanding tub and a porcelain tile floor" fetchpriority="high">
          </picture>
        </div>
        <div class="hero-content">
          <ol class="crumbs" role="list" aria-label="Breadcrumb">
            <li><a href="../">Home</a></li>
            <li aria-current="page">Other services</li>
          </ol>
          <h1 class="hero-title" id="hero-title"><span class="line"><span>More than</span></span> <span class="line"><span><em>flooring.</em></span></span></h1>
          <p class="hero-sub">Complete home remodeling services from Black Rock Remodeling LLC, across King &amp; Snohomish County.</p>
          <div class="hero-actions">
            <a class="btn btn--square" href="#contact">Get a free estimate{arrow}</a>
            <a class="hero-link" href="tel:+14255434667"><svg class="i" aria-hidden="true"><use href="#i-phone"/></svg>(425) 543-4667</a>
          </div>
        </div>
        {rating}
      </div>
    </section>

    <!-- Introdução: o texto que o Gabriel mandou, sem mudar nada -->
    <section class="other-intro section" aria-labelledby="intro-title">
      <div class="wrap other-intro-grid">
        <div class="section-head">
          <p class="eyebrow">Black Rock Remodeling LLC</p>
          <h2 class="h2" id="intro-title" data-reveal>Complete home remodeling <em>services.</em></h2>
        </div>
        <div class="other-intro-copy">
          <p class="lead" data-reveal>{esc(OTHER_INTRO['p1'])}</p>
          <p class="lead" data-reveal>{esc(OTHER_INTRO['p2'])}</p>
          <p class="other-tagline" data-reveal>{esc(OTHER_INTRO['tagline'])}</p>
        </div>
      </div>
    </section>

    <!-- Serviços com as fotos do Gabriel, no mesmo formato da lista de pisos da home -->
    <section class="services section" id="remodeling" aria-labelledby="services-title">
      <div class="wrap">
        <div class="services-head">
          <div class="section-head">
            <p class="eyebrow eyebrow--light">Remodeling services</p>
            <h2 class="h2" id="services-title" data-reveal>Inside and out, <em>start to finish.</em></h2>
          </div>
          <p class="lead" data-reveal>Painting, kitchens, bathrooms, decks and new construction. Every project starts with a free visit and a written proposal, and ends with a walkthrough.</p>
        </div>

        <div class="svc-layout" data-services>
          <ol class="svc-list" role="list">
{svcs}
          </ol>

          <!-- No computador, a foto do serviço ativo fica fixa ao lado da lista -->
          <div class="svc-stage" aria-hidden="true">
            <div class="svc-stage-photo" data-stage-photo></div>
            <p class="svc-stage-cap"><span data-stage-num>01</span><span data-stage-name>{esc(OTHER_SERVICES[0]['name'])}</span></p>
          </div>
        </div>
      </div>
    </section>

    <!-- Trabalhos reais, com a cidade, como na home -->
    <section class="work section" id="work" aria-labelledby="work-title">
      <div class="wrap work-head">
        <div class="section-head">
          <p class="eyebrow">Our work</p>
          <h2 class="h2" id="work-title" data-reveal>Recent projects, <em>city by city.</em></h2>
        </div>
        <p class="lead" data-reveal>Real jobs from across King and Snohomish County. Tap a photo to see it bigger.</p>
      </div>
      <div class="marquee marquee--work" data-marquee data-speed="36">
        <div class="marquee-track">
{projects}
        </div>
      </div>
      <div class="wrap marquee-foot">
        <button class="motion-btn" type="button" data-motion-toggle aria-pressed="false">
          <svg class="i i-pause" aria-hidden="true"><use href="#i-pause"/></svg><svg class="i i-play" aria-hidden="true"><use href="#i-play"/></svg>
          <span data-label-pause>Pause</span><span data-label-play>Play</span>
        </button>
      </div>
    </section>

    <section class="other-list section" aria-labelledby="other-title">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">More we do</p>
          <h2 class="h2" id="other-title" data-reveal>The details that <em>finish a home.</em></h2>
        </div>
        <div class="other-grid">
{cards}
          <article class="other-card" data-reveal>
            <span class="other-num">{n_flooring:02d}</span>
            <h3 class="other-name">Flooring</h3>
            <p>Hardwood, LVP, laminate, tile, refinishing and stairs: what we do every day.</p>
            <a class="link-arrow" href="#flooring">Flooring services{arrow}</a>
          </article>
          <article class="other-card other-card--cta" data-reveal>
            <span class="other-num">{n_flooring + 1:02d}</span>
            <h3 class="other-name">And more.</h3>
            <p>Have a project that isn’t on this list? Call or text and tell us about it. If it’s not something we do, we’ll tell you that too.</p>
            <div class="next-card-actions">
              <a class="btn btn--red" href="#contact">Get a free estimate{arrow}</a>
              <a class="next-card-phone" href="tel:+14255434667"><svg class="i" aria-hidden="true"><use href="#i-phone"/></svg>(425) 543-4667</a>
            </div>
          </article>
        </div>
        <div class="process">
          <h3 class="process-title" data-reveal>How it works</h3>
          <ol class="steps" role="list">
            <li class="step" data-reveal><span class="step-num">01</span><h4>Call or text</h4><p>Tell us about the room, what you want to change and your timeline.</p></li>
            <li class="step" data-reveal><span class="step-num">02</span><h4>Free in-home visit</h4><p>We look at the space, take measurements and talk through the options with you.</p></li>
            <li class="step" data-reveal><span class="step-num">03</span><h4>Written proposal</h4><p>Scope, materials, price and schedule on paper before any work starts.</p></li>
            <li class="step" data-reveal><span class="step-num">04</span><h4>Work and walkthrough</h4><p>We do the work, clean up every day and walk through it with you before we call it done.</p></li>
          </ol>
        </div>
      </div>
    </section>

    <section class="more section" id="flooring" aria-labelledby="more-title">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow eyebrow--light">Flooring</p>
          <h2 class="h2" id="more-title" data-reveal>And the floors, <em>of course.</em></h2>
        </div>
        <div class="more-grid more-grid--6">
{more}
        </div>
      </div>
    </section>

    {contact}
  </main>

  {footer}

  {actionbar}

  {lightbox}

  <script src="../assets/js/app.js" defer></script>
</body>
</html>
"""

for svc in SERVICES:
    out = SITE / svc['slug'] / 'index.html'
    out.parent.mkdir(exist_ok=True)
    out.write_text(page(svc))
    print(out.relative_to(SITE), len(out.read_text()))

out = SITE / 'other-services' / 'index.html'
out.parent.mkdir(exist_ok=True)
out.write_text(other_page())
print(out.relative_to(SITE), len(out.read_text()))
