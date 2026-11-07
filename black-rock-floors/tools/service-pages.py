# Gera as páginas de serviço, de piso e de cidade a partir das partes comuns do index.html
# (cabeçalho, menu, formulário, projetos, rodapé...). Saída: <site>/<slug>/index.html, HTML estático.
#
# Uso: python3 tools/service-pages.py
# Rode de novo sempre que mudar o cabeçalho, o menu, o formulário ou o rodapé do index.html, para as outras
# páginas acompanharem. Os textos ficam aqui (SERVICES, os seis tipos de piso) e no tools/pages_content.py (a página
# geral de piso, as reformas e as cidades): edite lá, não no HTML gerado, senão a próxima rodada apaga a mudança.
import re, json, html, pathlib

from pages_content import FLOORING, REMODEL, CITIES, LOCAL, REMODEL_NEXT, REMODEL_LEAD

SITE = pathlib.Path(__file__).resolve().parent.parent
BRAND = 'Black Rock Remodeling'
index = (SITE / 'index.html').read_text()

def block(pattern):
    m = re.search(pattern, index, flags=re.S)
    assert m, pattern
    return m.group(0)

PAGE_SLUGS = ['hardwood-floor-installation', 'luxury-vinyl-plank', 'laminate-flooring', 'tile-installation', 'hardwood-floor-refinishing', 'stair-treads',
              FLOORING['slug'], *[s['slug'] for s in REMODEL], *[c['slug'] for c in CITIES], *[l['slug'] for l in LOCAL]]

def relink(s):
    """Ajusta os caminhos para uma página um nível abaixo da raiz."""
    s = re.sub(r'(src|href)="assets/', r'\1="../assets/', s)
    s = re.sub(r'(srcset)="([^"]+)"', lambda m: m.group(1) + '="' + re.sub(r'(^|, )assets/', r'\1../assets/', m.group(2)) + '"', s)
    s = s.replace('href="./"', 'href="../"')
    s = re.sub(r'(?<!use )href="#(?!contact"|main")([a-z-]+)"', r'href="../#\1"', s)
    for slug in PAGE_SLUGS:
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

ARROW = '<svg class="i" aria-hidden="true"><use href="#i-arrow"/></svg>'
CHECK = '<svg class="i" aria-hidden="true"><use href="#i-check"/></svg>'
PHONE_ICON = '<svg class="i" aria-hidden="true"><use href="#i-phone"/></svg>'
PROVIDER = {"@type": "HomeAndConstructionBusiness", "name": BRAND, "telephone": "+1-425-543-4667", "url": "/"}
ALL_FLOOR_PAGES = SERVICES

def breadcrumb(*items):
    """Cada item: (nome, endereço) ou (nome,) no último."""
    out = []
    for i, it in enumerate(items, 1):
        el = {"@type": "ListItem", "position": i, "name": it[0]}
        if len(it) > 1:
            el["item"] = it[1]
        out.append(el)
    return {"@type": "BreadcrumbList", "itemListElement": out}

def faq_ld(faq):
    return {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}

def doc(title, desc, og_title, ld, main):
    """A página inteira: o <head>, o cabeçalho e o rodapé são os mesmos em todas."""
    ld = {"@context": "https://schema.org", "@graph": ld}
    return f'''<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{esc(title)}</title>
  <meta name="description" content="{html.escape(desc)}">
  <meta name="theme-color" content="#0e0e0d">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="{BRAND}">
  <meta property="og:title" content="{html.escape(og_title)}">
  <meta property="og:description" content="{html.escape(desc)}">
  <meta property="og:image" content="../assets/img/og-image.jpg?v=2">
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
{main}
  </main>

  {footer}

  {actionbar}

  {lightbox}

  <script src="../assets/js/app.js" defer></script>
</body>
</html>
'''

def hero(tall, wide, alt, crumbs, h1a, h1b, sub):
    trail = '\n'.join(
        f'            <li><a href="{href}">{esc(name)}</a></li>' if href else f'            <li aria-current="page">{esc(name)}</li>'
        for name, href in crumbs)
    return f'''    <section class="hero hero--page" aria-labelledby="hero-title">
      <div class="hero-panel">
        <div class="hero-media">
          <picture>
            <source media="(max-aspect-ratio: 4/5)" srcset="{tall}" width="1000" height="1250">
            <img class="hero-poster" src="{wide}" width="1600" height="1000" alt="{html.escape(alt)}" fetchpriority="high">
          </picture>
        </div>
        <div class="hero-content">
          <ol class="crumbs" role="list" aria-label="Breadcrumb">
{trail}
          </ol>
          <h1 class="hero-title" id="hero-title"><span class="line"><span>{esc(h1a)}</span></span> <span class="line"><span><em>{esc(h1b)}</em></span></span></h1>
          <p class="hero-sub">{esc(sub)}</p>
          <div class="hero-actions">
            <a class="btn btn--square" href="#contact">Get a free estimate{ARROW}</a>
            <a class="hero-link" href="tel:+14255434667">{PHONE_ICON}(425) 543-4667</a>
          </div>
        </div>
        {rating}
      </div>
    </section>'''

def next_card(lines):
    items = '\n'.join(f'            <li>{CHECK}{esc(t)}</li>' for t in lines)
    return f'''        <div class="next-card" data-reveal>
          <p class="eyebrow eyebrow--light">Next step</p>
          <p class="next-card-title">A free, <em class="nowrap">no-pressure</em> estimate.</p>
          <ul class="next-card-list" role="list">
{items}
          </ul>
          <div class="next-card-actions">
            <a class="btn btn--red" href="#contact">Get a free estimate{ARROW}</a>
            <a class="next-card-phone" href="tel:+14255434667">{PHONE_ICON}(425) 543-4667</a>
          </div>
        </div>'''

FLOOR_NEXT = ['We measure every room and check the subfloor.', 'Written proposal, usually within 24 hours.', 'The number you approve is the number you pay.']

def checklist(items):
    return '\n'.join(f'            <li>{CHECK}{esc(t)}</li>' for t in items)

def know_items(know):
    """(título, texto) ou (título, texto, endereço, nome do link)."""
    out = []
    for item in know:
        link = f'<a class="link-arrow" href="{item[2]}">{esc(item[3])}{ARROW}</a>' if len(item) > 2 else ''
        out.append(f'          <div class="know-item" data-reveal><dt>{esc(item[0])}</dt><dd>{esc(item[1])}{link}</dd></div>')
    return '\n'.join(out)

def faq_section(heading, faq):
    items = '\n'.join(
        f'          <details class="qa">\n            <summary><span>{esc(q)}</span><svg class="i" aria-hidden="true"><use href="#i-plus"/></svg></summary>\n            <div class="qa-body"><p>{esc(a)}</p></div>\n          </details>'
        for q, a in faq)
    return f'''    <section class="faq section" id="faq" aria-labelledby="faq-title">
      <div class="wrap faq-grid">
        <div class="faq-intro">
          <p class="eyebrow">FAQ</p>
          <h2 class="h2" id="faq-title" data-reveal>{esc(heading)}</h2>
          <p class="lead" data-reveal>Still wondering about something? Call or text <a href="tel:+14255434667">(425) 543-4667</a> and you’ll get a straight answer.</p>
        </div>
        <div class="faq-list">
{items}
        </div>
      </div>
    </section>'''

def card(o):
    """Cartão com foto para a faixa "More services"."""
    d, q = o.get('dir', 'services'), o.get('q', '?v=4')
    return f'        <a class="more-card" href="../{o["slug"]}/"><img src="../assets/img/{d}/{o["img"]}-640.webp{q}" width="640" height="800" alt="" loading="lazy"><span>{esc(o["short"])}{ARROW}</span></a>'

def form_for(option=None, city=None):
    out = contact
    if option:
        assert f'<option>{option}</option>' in out, option
        out = out.replace(f'<option>{option}</option>', f'<option selected>{option}</option>')
    if city:
        out = out.replace('placeholder="Bellevue"', f'value="{city}" placeholder="Bellevue"')
    return out

def page(svc):
    """Página de um serviço: os seis tipos de piso, a página geral de piso e as reformas."""
    d, q = svc.get('dir', 'services'), svc.get('q', '?v=4')
    remodel = svc.get('kind') == 'remodeling'
    is_hub = svc['slug'] == FLOORING['slug']
    wide = svc.get('wide_path') or f"{d}/{svc['img']}{'' if d != 'services' else '-wide'}"
    if is_hub:
        others, parent, trail = SERVICES, ('Services', '../#services'), []
    elif remodel:
        others = [FLOORING] + [o for o in REMODEL if o['slug'] != svc['slug']]
        parent, trail = ('Services', '../#services'), []
    else:
        others = [FLOORING] + [o for o in SERVICES if o['slug'] != svc['slug']]
        parent, trail = ('Flooring', '../flooring/'), []
    ld = [
        {"@type": "Service", "name": svc['h1'], "serviceType": svc['h1'], "description": svc['desc'], "areaServed": COUNTIES, "provider": PROVIDER},
        breadcrumb(('Home', '/'), (parent[0], parent[1].replace('..', '')), (svc['h1'],)),
        faq_ld(svc['faq']),
    ]
    if 'h1a' in svc:
        h1a, h1b = svc['h1a'], svc['h1b']
    elif svc['h1'] == 'Stair treads and risers':
        h1a, h1b = 'Stair treads', 'and risers.'
    else:
        h1a, h1b = svc['h1'].rsplit(' ', 1)[0], svc['h1'].rsplit(' ', 1)[1] + '.'
    if is_hub or not remodel:
        more_head = ('More flooring', 'Every floor. <em>One accountable crew.</em>')
        label = 'Flooring'
    else:
        more_head = ('More services', 'Every project. <em>One accountable crew.</em>')
        label = 'Remodeling'
    more = '\n'.join(card(o) for o in others)
    main = f'''{hero(f"../assets/img/{d}/{svc['img']}.webp{q}", f"../assets/img/{wide}.webp{q}", svc['alt'], [('Home', '../'), parent, (svc['short'], None)], h1a, h1b, svc['sub'])}

    <section class="included section" aria-labelledby="included-title">
      <div class="wrap included-grid">
        <div class="included-copy">
          <p class="eyebrow">{label} · King &amp; Snohomish County</p>
          <h2 class="h2" id="included-title" data-reveal>{esc(svc['included_h2'])}</h2>
          <p class="lead" data-reveal>{esc(REMODEL_LEAD if remodel else 'Every job is measured, quoted in writing and installed by the same crew, start to finish.')}</p>
          <ul class="checklist" role="list">
{checklist(svc['included'])}
          </ul>
        </div>
{next_card(REMODEL_NEXT if remodel else FLOOR_NEXT)}
      </div>
    </section>

    <section class="know section" aria-labelledby="know-title">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Good to know</p>
          <h2 class="h2" id="know-title" data-reveal>{esc(svc['know_h2'])}</h2>
        </div>
        <dl class="know-grid">
{know_items(svc['know'])}
        </dl>
        {steps}
      </div>
    </section>

    {work}

{faq_section(f"{svc['short']} questions", svc['faq'])}

    <section class="more section" aria-labelledby="more-title">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow eyebrow--light">{more_head[0]}</p>
          <h2 class="h2" id="more-title" data-reveal>{more_head[1]}</h2>
        </div>
        <div class="more-grid more-grid--6">
{more}
        </div>
      </div>
    </section>

    {form_for(svc['option'])}'''
    return doc(f"{svc['title']} · {BRAND}", svc['desc'], f"{svc['h1']} · {BRAND}", ld, main)


def city_work(city, photos):
    """Os trabalhos reais daquela cidade. Sem foto da cidade, mostra a faixa geral de projetos."""
    if not photos:
        return work
    btns = '\n'.join(
        f'          <button class="project" type="button" data-project><img src="../assets/img/{d}/{img}.webp" width="720" height="900" alt="{html.escape(alt)}" loading="lazy"><span class="project-meta"><span class="project-city">{esc(city)}</span></span></button>'
        for d, img, alt in photos)
    return f'''<section class="city-work section" id="work" aria-labelledby="work-title">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Recent work</p>
          <h2 class="h2" id="work-title" data-reveal>Our work in <em>{esc(city)}.</em></h2>
        </div>
        <div class="city-work-grid">
{btns}
        </div>
      </div>
    </section>'''

def near_section(title, groups):
    cols = '\n'.join(
        f'''          <div>
            <h3 class="near-title">{esc(head)}</h3>
            <div class="near-links">{''.join(f'<a href="{h}">{esc(n)}</a>' for n, h in links)}</div>
          </div>'''
        for head, links in groups)
    return f'''    <section class="near section" aria-labelledby="near-title">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow eyebrow--light">Keep looking</p>
          <h2 class="h2" id="near-title" data-reveal>{title}</h2>
        </div>
        <div class="near-grid">
{cols}
        </div>
      </div>
    </section>'''

CITY_BY_NAME = {c['name']: c for c in CITIES}
SERVICE_LINKS = [(s['short'], f"../{s['slug']}/") for s in [FLOORING] + REMODEL]

def city_page(c):
    name = c['name']
    prep = c.get('prep', 'in')
    area = {"@type": "City", "name": f"{name}, WA"}
    ld = [
        {"@type": "Service", "name": f"Flooring installation {prep} {name}, WA", "serviceType": "Flooring installation", "description": c['desc'], "areaServed": area, "provider": PROVIDER},
        breadcrumb(('Home', '/'), ('Service area', '/#area'), (name,)),
        faq_ld(c['faq']),
    ]
    intro = '\n'.join(f'          <p class="lead" data-reveal>{esc(t)}</p>' for t in c['intro'])
    near = [(n, f"../{CITY_BY_NAME[n]['slug']}/") for n in c['near']]
    local = [(f"{l['service']} in {name}", f"../{l['slug']}/") for l in LOCAL if l['city'] == name]
    main = f'''{hero(f"../assets/img/services/{c['img']}.webp?v=4", f"../assets/img/services/{c['wide']}.webp?v=4", f"New floor in a {name} home", [('Home', '../'), ('Service area', '../#area'), (name, None)], 'Flooring contractor', f'{prep} {name}, WA.', c['sub'])}

    <section class="included section" aria-labelledby="included-title">
      <div class="wrap included-grid">
        <div class="included-copy">
          <p class="eyebrow">Flooring installation · {esc(c['county'])}</p>
          <h2 class="h2" id="included-title" data-reveal>{esc(c['intro_h2'])}</h2>
{intro}
          <ul class="checklist" role="list">
{checklist(c['checklist'])}
          </ul>
        </div>
{next_card(FLOOR_NEXT)}
      </div>
    </section>

    <section class="know section" aria-labelledby="know-title">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Good to know</p>
          <h2 class="h2" id="know-title" data-reveal>{esc(c['know_h2'])}</h2>
        </div>
        <dl class="know-grid">
{know_items(c['know'])}
        </dl>
        {steps}
      </div>
    </section>

    {city_work(name, c['photos'])}

{faq_section(f'Flooring questions {prep} {name}', c['faq'])}

{near_section(f'Flooring company near <em>{esc(name)}.</em>', [('Nearby cities', near), (f'Services {prep} {name}', local + SERVICE_LINKS)])}

    {form_for('Flooring (not sure which type)', name)}'''
    return doc(f'Flooring Contractor {prep} {name}, WA · {BRAND}', c['desc'], f'Flooring contractor {prep} {name}, WA · {BRAND}', ld, main)

def local_page(l):
    base = next(s for s in REMODEL if s['slug'] == l['base'])
    city, service = l['city'], l['service']
    wide = base.get('wide_path') or f"{base['dir']}/{base['img']}"
    ld = [
        {"@type": "Service", "name": f"{service} in {city}, WA", "serviceType": service, "description": l['desc'], "areaServed": {"@type": "City", "name": f"{city}, WA"}, "provider": PROVIDER},
        breadcrumb(('Home', '/'), (service, f"/{base['slug']}/"), (city,)),
        faq_ld(l['faq']),
    ]
    intro = '\n'.join(f'          <p class="lead" data-reveal>{esc(t)}</p>' for t in l['intro'])
    siblings = [(f"{x['service']} in {x['city']}", f"../{x['slug']}/") for x in LOCAL if x['slug'] != l['slug']]
    main = f'''{hero(f"../assets/img/{base['dir']}/{base['img']}.webp", f"../assets/img/{wide}.webp", base['alt'], [('Home', '../'), (service, f"../{base['slug']}/"), (city, None)], service, f'in {city}, WA.', l['sub'])}

    <section class="included section" aria-labelledby="included-title">
      <div class="wrap included-grid">
        <div class="included-copy">
          <p class="eyebrow">{esc(service)} · {esc(l['county'])}</p>
          <h2 class="h2" id="included-title" data-reveal>{esc(l['intro_h2'])}</h2>
{intro}
          <ul class="checklist" role="list">
{checklist(l['checklist'])}
          </ul>
        </div>
{next_card(REMODEL_NEXT)}
      </div>
    </section>

    <section class="know section" aria-labelledby="know-title">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Good to know</p>
          <h2 class="h2" id="know-title" data-reveal>{esc(l['know_h2'])}</h2>
        </div>
        <dl class="know-grid">
{know_items(l['know'])}
        </dl>
        {steps}
      </div>
    </section>

    {work}

{faq_section(f'{service} questions in {city}', l['faq'])}

{near_section(f'More in <em>{esc(city)}</em> and nearby.', [(f'In {city}', [(f'Flooring in {city}', f"../{l['flooring']}/"), (service, f"../{base['slug']}/")]), ('More pages', siblings)])}

    {form_for(service, city)}'''
    return doc(f"{l['title']} · {BRAND}", l['desc'], f"{service} in {city}, WA · {BRAND}", ld, main)


def write(slug, content):
    out = SITE / slug / 'index.html'
    out.parent.mkdir(exist_ok=True)
    out.write_text(content)
    print(out.relative_to(SITE), len(content))

for svc in [*SERVICES, FLOORING, *REMODEL]:
    write(svc['slug'], page(svc))
for c in CITIES:
    write(c['slug'], city_page(c))
for l in LOCAL:
    write(l['slug'], local_page(l))
