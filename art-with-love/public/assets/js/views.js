/* Páginas da loja. Cada função devolve { title, description, html, mount? }. */
import {
  SHOP, esc, money, plural, products, productById, collections, collectionById, productsIn,
  rangeOf, variantOf, photoCount, photo, photos, productUrl, isSoldOut, lowStock, maxQty, altText,
  shipping, waLink, igLink, bag, track,
} from './lib.js';

const freeOver = money(shipping.freeOver);
const fromShipping = money(Math.min(...shipping.options.map((o) => o.price)));
const icon = (id, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

/* -------------------------------------------------------------- pedaços --- */
export function priceTag(p) {
  if (!p.was) return `<span class="price">${money(p.price)}</span>`;
  return `<span class="price price--sale"><span class="sr-only">Was </span><s>${money(p.was)}</s><span class="sr-only">, now </span>${money(p.price)}</span>`;
}

function badges(p) {
  const out = [];
  if (isSoldOut(p)) out.push('<span class="badge badge--out">Sold out</span>');
  else if (p.was) out.push('<span class="badge badge--sale">Sale</span>');
  else if (lowStock(p)) out.push(`<span class="badge">Only ${p.stock} left</span>`);
  if ((p.tags || []).includes('porcelain')) out.push('<span class="badge badge--holo">Porcelain</span>');
  return out.join('');
}

export function card(p, i = 0) {
  const v = p.variants ? p.variants[0] : null;
  const url = productUrl(p);
  const n = photoCount(p, v);
  const add = isSoldOut(p)
    ? ''
    : p.variants
      ? `<a class="card__add" href="${url}" aria-label="Choose a colour for ${esc(p.name)}">${icon('plus')}<span>${p.variants.length} colours</span></a>`
      : `<button class="card__add" type="button" data-add="${p.id}" aria-label="Add ${esc(p.name)} to bag">${icon('plus')}<span>Add</span></button>`;
  return `
    <article class="card${isSoldOut(p) ? ' is-out' : ''}" style="--i:${i}">
      <div class="card__frame">
        <a class="card__media foil" href="${url}" tabindex="-1" aria-hidden="true">
          <img src="${photo(p, v, 1)}" alt="" loading="lazy" decoding="async" width="480" height="640">
          ${n > 1 ? `<img class="card__alt" src="${photo(p, v, 2)}" alt="" loading="lazy" decoding="async" width="480" height="640">` : ''}
          <span class="card__badges">${badges(p)}</span>
        </a>
        ${add}
      </div>
      <div class="card__body">
        <div class="card__top">
          <h3 class="card__name"><a href="${url}">${esc(p.name)}</a></h3>
          ${priceTag(p)}
        </div>
        <p class="card__meta">${esc(p.size)}</p>
        ${p.variants ? `<div class="card__swatches" aria-label="${p.variants.length} colours">${p.variants.map((x) => `<span style="--sw:${x.swatch}" title="${esc(x.name)}"></span>`).join('')}</div>` : ''}
      </div>
    </article>`;
}

const grid = (list) => `<div class="grid">${list.map(card).join('')}</div>`;

function sectionHead({ eyebrow, title, lead }) {
  return `
    <header class="section-head" data-reveal>
      ${eyebrow ? `<p class="eyebrow eyebrow--spark">${eyebrow}</p>` : ''}
      <h2>${title}</h2>
      ${lead ? `<p class="lead">${lead}</p>` : ''}
    </header>`;
}

function candleArt() {
  return `
    <svg class="candle-art" viewBox="0 0 400 400" role="img" aria-label="Illustration of a pastel birthday candle with a bow">
      <defs>
        <radialGradient id="cGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE6B8" stop-opacity=".75"/><stop offset="1" stop-color="#FFE6B8" stop-opacity="0"/></radialGradient>
        <linearGradient id="cWax" x1="0" x2="1"><stop offset="0" stop-color="#F7C5D7"/><stop offset=".5" stop-color="#FCE6EE"/><stop offset="1" stop-color="#E9A9C2"/></linearGradient>
        <linearGradient id="cFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF9B54"/><stop offset=".6" stop-color="#FFD36E"/><stop offset="1" stop-color="#FFF6DA"/></linearGradient>
        <linearGradient id="cPlate" x1="0" x2="1"><stop offset="0" stop-color="#D9C6F5"/><stop offset=".5" stop-color="#C4E3F7"/><stop offset="1" stop-color="#CDF1E2"/></linearGradient>
      </defs>
      <circle class="glow" cx="200" cy="96" r="90" fill="url(#cGlow)"/>
      <ellipse cx="200" cy="352" rx="150" ry="26" fill="url(#cPlate)" opacity=".9"/>
      <ellipse cx="200" cy="344" rx="120" ry="18" fill="#FBF7F3" opacity=".9"/>
      <rect x="160" y="140" width="80" height="204" rx="14" fill="url(#cWax)"/>
      <g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6">
        <path d="M168 176l64-22M168 216l64-22M168 256l64-22M168 296l64-22"/>
      </g>
      <path d="M200 140c0-10 0-18 1-24" stroke="#3B2A30" stroke-width="3" stroke-linecap="round"/>
      <path class="flame" d="M201 62c16 20 22 34 14 47-5 8-20 10-28 2-10-10-4-27 14-49z" fill="url(#cFlame)"/>
      <g transform="translate(200 236)">
        <path d="M0 0c-26-24-58-26-62-8-4 18 30 26 62 8z" fill="#E7779E"/>
        <path d="M0 0c26-24 58-26 62-8 4 18-30 26-62 8z" fill="#E7779E"/>
        <path d="M-4 4l-22 46 14-6 8 14 8-50z" fill="#D35C87"/>
        <path d="M4 4l22 46-14-6-8 14-8-50z" fill="#D35C87"/>
        <circle r="11" fill="#F7A9C4"/>
        <circle cx="-3" cy="-3" r="3.5" fill="#fff" opacity=".7"/>
      </g>
      <g fill="#fff">
        <path d="M84 120c2 9 6 13 15 15-9 2-13 6-15 15-2-9-6-13-15-15 9-2 13-6 15-15z" opacity=".9"/>
        <path d="M318 180c1.5 7 4.5 10 11.5 11.5-7 1.5-10 4.5-11.5 11.5-1.5-7-4.5-10-11.5-11.5 7-1.5 10-4.5 11.5-11.5z" opacity=".75"/>
        <path d="M300 70c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8z" opacity=".6"/>
      </g>
    </svg>`;
}

/* ------------------------------------------------------------------ home --- */
export function home() {
  const picks = ['lollipop-bow', 'teddy-bow', 'mermaid-doll-bow', 'flamingo-pompom-bow', 'red-velvet-bow-pair']
    .map((id) => productById.get(id))
    .filter((p) => p && !isSoldOut(p));
  for (const p of products) if (picks.length < 5 && !picks.includes(p) && !isSoldOut(p)) picks.push(p);

  const featured = products.filter((p) => p.featured && !isSoldOut(p)).slice(0, 8);
  const ranges = collections.filter((c) => c.kind === 'range');
  const edits = collections.filter((c) => c.kind === 'edit');
  const words = ['Handmade', 'bows,', '<br>', 'tied', 'with', '<em class="holo-mark">love</em>.'];
  let w = 0;
  const title = words.map((x) => (x === '<br>' ? '<br>' : `<span class="word" style="--w:${w++}">${x}</span>`)).join(' ');

  const marquee = [
    'Handmade in London', 'Cold porcelain details', 'Every bow shown with a ruler',
    `Free UK delivery over ${freeOver}`, 'Arrives on its signature card', 'Birthday candles made to order',
  ].map((t) => `<span>${t}</span>${icon('spark')}`).join('');

  const rulerProduct = productById.get('lollipop-bow') || featured[0];

  return {
    title: 'Luxury handmade hair bows, London',
    description: `Luxury handmade hair bows, baby headbands and cold porcelain keepsakes, made one at a time in London. Free UK delivery over ${freeOver}.`,
    html: `
      <section class="hero" aria-labelledby="hero-title">
        <div class="wrap">
          <p class="eyebrow eyebrow--spark hero__eyebrow">Handmade in London</p>
          <h1 class="hero__title" id="hero-title">${title}</h1>
          <p class="lead hero__lead">Luxury hair bows, baby headbands and little cold porcelain characters, made one at a time by Lulu.</p>
          <div class="hero__ctas">
            <a class="btn btn--primary" href="/shop">Shop the bows ${icon('arrow', 'btn__arrow')}</a>
            <a class="btn btn--ghost" href="/made-to-order">Birthday candles</a>
          </div>
        </div>
        <div class="line" id="line">
          <svg class="line__ribbon" viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 Q500 150 1000 30"/></svg>
          ${picks.map((p, i) => `
            <a class="hang" href="${productUrl(p)}" data-n="${i}" style="--i:${i};--sway:${5 + (i % 3) * 1.4}s;--r0:${i % 2 ? -10 : 10}deg">
              <span class="hang__peg" aria-hidden="true"></span>
              <span class="hang__card foil"><img src="${photo(p, p.variants?.[0], 1)}" alt="${esc(altText(p, p.variants?.[0]))}" width="480" height="640" ${i === 2 ? 'fetchpriority="high"' : 'loading="lazy"'}></span>
              <span class="hang__tag"><span class="hang__name">${esc(p.name)}</span> <b>${money(p.price)}</b></span>
            </a>`).join('')}
        </div>
      </section>

      <div class="marquee" aria-hidden="true">
        <div class="marquee__track"><div class="marquee__group">${marquee}</div><div class="marquee__group">${marquee}</div></div>
      </div>

      <section class="section" aria-labelledby="ranges-title">
        <div class="wrap">
          ${sectionHead({ eyebrow: 'The collection', title: '<span id="ranges-title">Something for <em>every</em> little head</span>' })}
          <div class="ranges">
            ${ranges.map((c, i) => {
              const cover = productById.get(c.cover) || productsIn(c)[0];
              return `
              <a class="range foil" href="/shop/${c.id}" data-reveal style="--d:${i * 0.08}s">
                <img src="${photo(cover, cover.variants?.[0], 1, 'l')}" srcset="${photo(cover, cover.variants?.[0], 1, 's')} 480w, ${photo(cover, cover.variants?.[0], 1, 'l')} 960w" sizes="(max-width: 760px) 78vw, 33vw" alt="" loading="lazy" decoding="async" width="960" height="1280">
                <span class="range__body">
                  <h3>${esc(c.name)}</h3>
                  <p>${plural(productsIn(c).length, 'piece')}</p>
                  <span class="range__go">${icon('arrow')}</span>
                </span>
              </a>`;
            }).join('')}
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:0" aria-labelledby="new-title">
        <div class="wrap">
          ${sectionHead({ eyebrow: 'Fresh from the studio', title: '<span id="new-title">New <em>favourites</em></span>' })}
          ${grid(featured)}
          <div class="section-foot"><a class="btn btn--ghost" href="/shop">Shop all ${products.length} pieces ${icon('arrow', 'btn__arrow')}</a></div>
        </div>
      </section>

      <section class="section" style="padding-top:0" aria-labelledby="ruler-title">
        <div class="wrap split">
          <div class="split__media" data-reveal>
            <div class="ruler-shot">
              <div class="ruler-shot__img"><img src="${photo(rulerProduct, null, 1, 'l')}" srcset="${photo(rulerProduct, null, 1, 's')} 480w, ${photo(rulerProduct, null, 1, 'l')} 960w" sizes="(max-width: 860px) 90vw, 460px" alt="${esc(altText(rulerProduct))}" loading="lazy" width="960" height="1280"></div>
              <p class="ruler-shot__note">${icon('ruler')}<span>See the true size in every photo</span></p>
            </div>
          </div>
          <div class="split__copy" data-reveal style="--d:.1s">
            <p class="eyebrow eyebrow--spark">No guesswork</p>
            <h2 id="ruler-title">Every bow is shown <em>with a ruler</em></h2>
            <p class="lead">Lulu photographs each piece next to a ruler, so you can see exactly how big it is before it arrives. No surprises, just the bow you fell for.</p>
            <ul class="ticks">
              <li>${icon('check')}<span>Real photos of the real piece, taken in the studio</span></li>
              <li>${icon('check')}<span>Arrives on its signature Art with Love card</span></li>
              <li>${icon('check')}<span>Dispatched within ${esc(shipping.dispatch)}</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:0" aria-label="Edits">
        <div class="wrap edits">
          ${edits.map((c, i) => {
            const list = productsIn(c);
            const two = [productById.get(c.cover) || list[0], list.find((p) => p.id !== c.cover) || list[0]];
            return `
            <a class="edit" href="/shop/${c.id}" data-reveal style="--d:${i * 0.08}s">
              <span class="edit__copy">
                <span class="eyebrow">${plural(list.length, 'piece')}</span>
                <h3>${esc(c.name)}</h3>
                <p>${esc(c.blurb)}</p>
                <span class="link">Explore ${icon('arrow')}</span>
              </span>
              <span class="edit__imgs" aria-hidden="true">${two.map((p) => `<img src="${photo(p, p.variants?.[0], 1)}" alt="" loading="lazy" width="480" height="640">`).join('')}</span>
            </a>`;
          }).join('')}
        </div>
      </section>

      <section class="night section" aria-labelledby="mto-title">
        <div class="wrap mto">
          <div class="mto__copy" data-reveal>
            <p class="eyebrow eyebrow--spark">Made to order</p>
            <h2 id="mto-title">Birthday candles, <em>sculpted by hand</em></h2>
            <p class="lead">Themed candles with cold porcelain characters, plus matching bows for the birthday girl. Tell Lulu the theme, the colours and the date, and she will make it just for you.</p>
            <div class="mto__ctas">
              <a class="btn btn--holo" href="/made-to-order">Start a commission ${icon('arrow', 'btn__arrow')}</a>
              <a class="btn btn--outline-light" href="/made-to-order#how">How it works</a>
            </div>
          </div>
          <div class="mto__art" data-reveal style="--d:.15s">${candleArt()}</div>
        </div>
      </section>

      <section class="section" aria-label="The maker">
        <div class="wrap wrap--narrow maker" data-reveal>
          <p class="eyebrow eyebrow--spark">From Lulu’s studio</p>
          <blockquote>Every bow is cut, folded and finished by hand, <em>one at a time</em>, in London.</blockquote>
          <p class="maker__sign" aria-hidden="true">Lulu</p>
          <a class="link" href="/about">Read our story ${icon('arrow')}</a>
        </div>
      </section>

      ${SHOP.instagram ? `
      <section class="section" style="padding-top:0" aria-labelledby="ig-title">
        <div class="wrap">
          <div class="insta" data-reveal>
            <p class="eyebrow">Follow the studio</p>
            <h2 id="ig-title">New pieces and behind the scenes</h2>
            <a class="insta__handle" href="${igLink()}" target="_blank" rel="noopener">@${esc(SHOP.instagram)}</a>
            <a class="btn btn--primary" href="${igLink()}" target="_blank" rel="noopener">${icon('ig')} Follow on Instagram</a>
          </div>
        </div>
      </section>` : ''}
    `,
    mount(root) {
      const line = root.querySelector('#line');
      if (!line) return;
      // Pendura as cartelas na curva da fita: y = 30 + 120·t·(1−t) no desenho de 110 de altura.
      const place = () => {
        const visible = [...line.querySelectorAll('.hang')].filter((h) => getComputedStyle(h).display !== 'none');
        const ribbonH = line.querySelector('.line__ribbon').getBoundingClientRect().height || 110;
        const lineW = line.clientWidth;
        const cardW = visible[0]?.offsetWidth || 0;
        // margem para a primeira e a última cartela não saírem da tela no celular
        const m = Math.max(0, (cardW / 2 + 10) / lineW - 0.5 / visible.length);
        visible.forEach((h, i) => {
          const t = m + ((i + 0.5) / visible.length) * (1 - 2 * m);
          const ribbonT = 0.04 + t * 0.92; // a fita passa um pouco das bordas
          const y = (30 + 120 * ribbonT * (1 - ribbonT)) * (ribbonH / 110);
          h.style.setProperty('--x', `${t * 100}%`);
          h.style.setProperty('--drop', `${y + 18}px`);
        });
      };
      place();
      const ro = new ResizeObserver(place);
      ro.observe(line);
      return () => ro.disconnect();
    },
  };
}

/* ------------------------------------------------------------------ shop --- */
const SORTS = {
  featured: { label: 'Featured', fn: (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) },
  'price-asc': { label: 'Price, low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price, high to low', fn: (a, b) => b.price - a.price },
  name: { label: 'Name, A to Z', fn: (a, b) => a.name.localeCompare(b.name) },
};

function shopList(c, sort) {
  const list = (c ? productsIn(c) : products.slice()).sort(SORTS[sort]?.fn || SORTS.featured.fn);
  // Esgotados por último
  return list.sort((a, b) => (isSoldOut(a) ? 1 : 0) - (isSoldOut(b) ? 1 : 0));
}

export function shop(id, url) {
  const c = id ? collectionById.get(id) : null;
  if (id && !c) return notFound();
  const sort = SORTS[url.searchParams.get('sort')] ? url.searchParams.get('sort') : 'featured';
  const list = shopList(c, sort);
  const chip = (cc) => {
    const n = cc ? productsIn(cc).length : products.length;
    const href = cc ? `/shop/${cc.id}` : '/shop';
    return `<a class="chip" href="${href}" data-chip="${cc ? cc.id : ''}" ${cc === c ? 'aria-current="page"' : ''}>${cc ? esc(cc.name) : 'All'} <small>${n}</small></a>`;
  };
  return {
    title: c ? c.name : 'Shop all',
    description: c ? c.blurb : 'Shop handmade hair bows, clip sets and baby headbands, made in London.',
    html: `
      <section class="wrap page-head">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/shop">Shop</a>${c ? `<span>/</span><span>${esc(c.name)}</span>` : ''}</nav>
        <h1 id="shop-title">${c ? esc(c.name) : 'Shop <em>all</em>'}</h1>
        <p class="lead" id="shop-lead">${esc(c ? c.blurb : 'Every piece is handmade in London and shown next to a ruler, so you know its true size.')}</p>
      </section>
      <div class="toolbar">
        <div class="wrap toolbar__inner">
          <nav class="chips" aria-label="Collections">${[null, ...collections].map(chip).join('')}</nav>
          <span class="toolbar__count" id="shop-count">${plural(list.length, 'piece')}</span>
          <label class="sort"><span class="sr-only">Sort by</span>
            <select id="shop-sort">${Object.entries(SORTS).map(([k, s]) => `<option value="${k}" ${k === sort ? 'selected' : ''}>${s.label}</option>`).join('')}</select>
            ${icon('down')}
          </label>
        </div>
      </div>
      <section class="wrap" aria-labelledby="shop-title">
        <div id="shop-grid">${list.length ? grid(list) : '<div class="empty"><p>Nothing here just yet. New pieces are on their way.</p><a class="btn btn--ghost" href="/shop">See everything</a></div>'}</div>
      </section>`,
    mount(root, { navigate }) {
      let current = c;
      let currentSort = sort;
      const gridEl = root.querySelector('#shop-grid');
      const update = (push) => {
        const l = shopList(current, currentSort);
        gridEl.innerHTML = grid(l);
        gridEl.firstElementChild.classList.add('is-filtering');
        root.querySelector('#shop-count').textContent = plural(l.length, 'piece');
        root.querySelector('#shop-title').innerHTML = current ? esc(current.name) : 'Shop <em>all</em>';
        root.querySelector('#shop-lead').textContent = current ? current.blurb : 'Every piece is handmade in London and shown next to a ruler, so you know its true size.';
        root.querySelectorAll('.chip').forEach((a) => {
          if (a.dataset.chip === (current ? current.id : '')) a.setAttribute('aria-current', 'page');
          else a.removeAttribute('aria-current');
        });
        const q = currentSort !== 'featured' ? `?sort=${currentSort}` : '';
        if (push) navigate(`${current ? `/shop/${current.id}` : '/shop'}${q}`, { silent: true, replace: push === 'replace' });
        document.title = `${current ? current.name : 'Shop all'} · Art with Love by Lulu`;
      };
      root.querySelector('.chips').addEventListener('click', (e) => {
        const a = e.target.closest('.chip');
        if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        e.stopPropagation();
        current = a.dataset.chip ? collectionById.get(a.dataset.chip) : null;
        a.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
        update(true);
      });
      root.querySelector('#shop-sort').addEventListener('change', (e) => {
        currentSort = e.target.value;
        update('replace');
      });
    },
  };
}

/* --------------------------------------------------------------- produto --- */
export function product(id, url) {
  const p = productById.get(id);
  if (!p) return notFound();
  let v = variantOf(p, url.searchParams.get('colour'));
  const range = rangeOf(p);
  const out = isSoldOut(p);
  const related = products.filter((x) => x !== p && x.range === p.range && !isSoldOut(x)).slice(0, 4);
  const shipLine = `${shipping.options[0].name}, ${fromShipping} · free over ${freeOver}`;

  const slides = (vv) => photos(p, vv, 'l').map((src, i) => `
    <button class="gallery__slide" type="button" data-zoom-open="${i}" aria-label="Enlarge photo ${i + 1}">
      <img src="${src}" alt="${esc(altText(p, vv, i + 1))}" width="960" height="1280" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>
    </button>`).join('');
  const thumbs = (vv) => photos(p, vv, 's').map((src, i) => `
    <button class="gallery__thumb" type="button" data-thumb="${i}" aria-label="Show photo ${i + 1}" aria-current="${i === 0}">
      <img src="${src}" alt="" width="480" height="640" loading="lazy">
    </button>`).join('');
  const dots = (vv) => photos(p, vv, 's').map((_, i) => `<span class="${i ? '' : 'is-on'}"></span>`).join('');

  const ask = `Hi Lulu! I have a question about the ${p.name}${v ? ` (${v.name})` : ''}: ${location.origin}${productUrl(p, v)}`;

  return {
    title: `${p.name}${v && v !== p.variants[0] ? ` · ${v.name}` : ''}`,
    description: p.summary,
    html: `
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb" style="justify-content:flex-start;padding-top:22px">
          <a href="/shop">Shop</a><span>/</span><a href="/shop/${range.id}">${esc(range.name)}</a><span>/</span><span>${esc(p.name)}</span>
        </nav>
        <article class="pdp">
          <div class="gallery" id="gallery">
            <div class="gallery__thumbs" id="thumbs">${thumbs(v)}</div>
            <div class="gallery__main">
              <div class="gallery__track" id="track">${slides(v)}</div>
              <span class="gallery__hint">${icon('ruler')} Shown with a ruler for size</span>
              <span class="gallery__dots" id="dots" aria-hidden="true">${dots(v)}</span>
            </div>
          </div>

          <div class="buy">
            <div class="buy__head">
              <p class="eyebrow">${esc(range.name)}</p>
              <h1>${esc(p.name)}</h1>
              <div class="buy__price">${priceTag(p)}<span class="buy__size">${esc(p.size)}</span></div>
            </div>
            <p class="buy__summary">${esc(p.summary)}</p>

            ${p.variants ? `
            <div>
              <p class="buy__label" id="colour-label">Colour <span id="colour-name">${esc(v.name)}</span></p>
              <div class="swatches" role="radiogroup" aria-labelledby="colour-label">
                ${p.variants.map((x) => `<button class="swatch" type="button" role="radio" aria-checked="${x === v}" aria-label="${esc(x.name)}" title="${esc(x.name)}" data-variant="${x.id}" style="--sw:${x.swatch}"></button>`).join('')}
              </div>
            </div>` : ''}

            ${lowStock(p) ? `<p class="stock-note">Only ${p.stock} left, each one is handmade</p>` : ''}

            ${out ? `
              <div class="buy__row"><button class="btn btn--primary" type="button" disabled>Sold out</button></div>
              <p class="ask">${icon('wa')} <span>Would you like one made? <a href="${waLink(`Hi Lulu! Could you make another ${p.name}?`)}" target="_blank" rel="noopener">Ask Lulu</a></span></p>
            ` : `
              <div class="buy__row" id="buy-row">
                <div class="qty" role="group" aria-label="Quantity">
                  <button type="button" data-qty="-1" aria-label="One fewer" disabled>${icon('minus')}</button>
                  <output id="qty" aria-live="polite">1</output>
                  <button type="button" data-qty="1" aria-label="One more" ${maxQty(p) <= 1 ? 'disabled' : ''}>${icon('plus')}</button>
                </div>
                <button class="btn btn--primary" type="button" id="add-btn">${icon('bag')} Add to bag · ${money(p.price)}</button>
              </div>
              <p class="ask">${icon('wa')} <span>Questions about size or colour? <a id="ask-link" href="${waLink(ask)}" target="_blank" rel="noopener">Message Lulu</a></span></p>
            `}

            <ul class="perks">
              <li>${icon('hand')} Handmade in London, one at a time</li>
              <li>${icon('truck')} Dispatched within ${esc(shipping.dispatch)} · ${esc(shipLine)}</li>
              <li>${icon('lock')} Secure checkout with card, Apple Pay or Google Pay</li>
            </ul>

            <div>
              <details class="acc" open>
                <summary>Details ${icon('plus')}</summary>
                <div class="acc__body"><ul>${(p.details || []).map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>
              </details>
              <details class="acc">
                <summary>Size ${icon('plus')}</summary>
                <div class="acc__body"><p>Every photo shows this piece next to a ruler marked in centimetres and inches, so you can see its real size at a glance. Tap a photo to see it larger.</p></div>
              </details>
              <details class="acc">
                <summary>Delivery &amp; returns ${icon('plus')}</summary>
                <div class="acc__body">
                  <ul>${shipping.options.map((o) => `<li>${esc(o.name)}: ${money(o.price)} (${o.days[0]}–${o.days[1]} working days)</li>`).join('')}<li>Free ${esc(shipping.options[0].name)} on orders over ${freeOver}</li></ul>
                  <p>Changed your mind? You have 14 days to return unused pieces. <a href="/help#returns">Returns policy</a></p>
                </div>
              </details>
              <details class="acc">
                <summary>Care &amp; safety ${icon('plus')}</summary>
                <div class="acc__body">
                  <p>Contains small parts. Hair accessories are not toys: please supervise little ones while they wear them and take them out before naps and bedtime.</p>
                  <p>Keep cold porcelain details dry and store your bows flat, away from direct sunlight, so the colours stay bright.</p>
                </div>
              </details>
            </div>
          </div>
        </article>
      </div>

      ${related.length ? `
      <section class="section" aria-labelledby="rel-title">
        <div class="wrap">
          ${sectionHead({ eyebrow: 'Complete the look', title: '<span id="rel-title">You may also <em>love</em></span>' })}
          ${grid(related)}
        </div>
      </section>` : ''}

      ${out ? '' : `
      <div class="sticky-buy" id="sticky-buy" aria-hidden="true">
        <img id="sticky-img" src="${photo(p, v, 1)}" alt="">
        <div class="sticky-buy__info"><strong>${esc(p.name)}</strong>${priceTag(p)}</div>
        <button class="btn btn--primary" type="button" id="sticky-add" tabindex="-1">Add to bag</button>
      </div>`}
    `,
    mount(root, { addToBag, openZoom }) {
      let qty = 1;
      let index = 0;
      const trackEl = root.querySelector('#track');
      const qtyOut = root.querySelector('#qty');

      track('ViewContent', {
        content_type: 'product', content_ids: [v ? `${p.id}:${v.id}` : p.id], content_name: p.name,
        value: p.price, currency: SHOP.currency,
      });

      const setIndex = (i, scroll) => {
        index = i;
        root.querySelectorAll('[data-thumb]').forEach((b, n) => b.setAttribute('aria-current', String(n === i)));
        root.querySelectorAll('#dots span').forEach((d, n) => d.classList.toggle('is-on', n === i));
        if (scroll) trackEl.scrollTo({ left: i * trackEl.clientWidth, behavior: 'smooth' });
      };
      trackEl.addEventListener('scroll', () => {
        const i = Math.round(trackEl.scrollLeft / trackEl.clientWidth);
        if (i !== index) setIndex(i, false);
      }, { passive: true });
      root.querySelector('#thumbs').addEventListener('click', (e) => {
        const b = e.target.closest('[data-thumb]');
        if (b) setIndex(Number(b.dataset.thumb), true);
      });
      trackEl.addEventListener('click', (e) => {
        const b = e.target.closest('[data-zoom-open]');
        if (b) openZoom(photos(p, v, 'l'), Number(b.dataset.zoomOpen), (src, n) => altText(p, v, n + 1));
      });

      // Cores
      root.querySelector('.swatches')?.addEventListener('click', (e) => {
        const b = e.target.closest('[data-variant]');
        if (!b || b.getAttribute('aria-checked') === 'true') return;
        v = variantOf(p, b.dataset.variant);
        root.querySelectorAll('[data-variant]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
        root.querySelector('#colour-name').textContent = v.name;
        trackEl.innerHTML = slides(v);
        root.querySelector('#thumbs').innerHTML = thumbs(v);
        root.querySelector('#dots').innerHTML = dots(v);
        trackEl.scrollLeft = 0;
        setIndex(0, false);
        const sticky = root.querySelector('#sticky-img');
        if (sticky) sticky.src = photo(p, v, 1);
        const askLink = root.querySelector('#ask-link');
        if (askLink) askLink.href = waLink(`Hi Lulu! I have a question about the ${p.name} (${v.name}): ${location.origin}${productUrl(p, v)}`);
        history.replaceState(history.state, '', productUrl(p, v));
      });

      // Quantidade
      const setQty = (n) => {
        qty = Math.max(1, Math.min(maxQty(p), n));
        if (!qtyOut) return;
        qtyOut.textContent = qty;
        root.querySelector('[data-qty="-1"]').disabled = qty <= 1;
        root.querySelector('[data-qty="1"]').disabled = qty >= maxQty(p);
      };
      root.querySelector('.qty')?.addEventListener('click', (e) => {
        const b = e.target.closest('[data-qty]');
        if (b) setQty(qty + Number(b.dataset.qty));
      });

      const add = (fromEl) => {
        const img = root.querySelectorAll('.gallery__slide img')[index] || root.querySelector('.gallery__slide img');
        addToBag(p.id, v ? v.id : null, qty, fromEl === 'sticky' ? root.querySelector('#sticky-img') : img);
        setQty(1);
      };
      root.querySelector('#add-btn')?.addEventListener('click', () => add());
      root.querySelector('#sticky-add')?.addEventListener('click', () => add('sticky'));

      // Barra fixa no celular quando o botão principal sai da tela
      const sticky = root.querySelector('#sticky-buy');
      const row = root.querySelector('#buy-row');
      if (!sticky || !row) return;
      const io = new IntersectionObserver(([en]) => {
        const on = !en.isIntersecting && en.boundingClientRect.top < 0;
        sticky.classList.toggle('is-on', on);
        sticky.setAttribute('aria-hidden', String(!on));
        root.querySelector('#sticky-add').tabIndex = on ? 0 : -1;
        document.body.classList.toggle('has-sticky', on && matchMedia('(max-width: 900px)').matches);
      });
      io.observe(row);
      return () => {
        io.disconnect();
        document.body.classList.remove('has-sticky');
      };
    },
  };
}

/* --------------------------------------------------------- sob encomenda --- */
export function madeToOrder() {
  const gallery = SHOP.madeToOrder.gallery || [];
  const lead = SHOP.madeToOrder.leadTime;
  return {
    title: 'Made to order · Birthday candles and bespoke bows',
    description: 'Themed cold porcelain birthday candles and bespoke bows, made to order in London.',
    html: `
      <section class="wrap page-head">
        <p class="eyebrow eyebrow--spark">Made to order</p>
        <h1>Made just <em>for you</em></h1>
        <p class="lead">Birthday candles with hand-sculpted cold porcelain characters, and bows made to match the party. Tell Lulu your idea and she will bring it to life.</p>
      </section>

      <section class="wrap" aria-label="What Lulu makes">
        <div class="offer">
          <article class="offer__card" data-reveal>
            <p class="eyebrow">Celebration candles</p>
            <h3>Birthday candles in <em>cold porcelain</em></h3>
            <p>Themed candles finished with little characters modelled by hand in cold porcelain, the Brazilian craft known as biscuit. A keepsake long after the candles are blown out.</p>
            <ul class="ticks">
              <li>${icon('check')}<span>Any theme, colours and name</span></li>
              <li>${icon('check')}<span>Birthdays, christenings and parties</span></li>
              <li>${icon('check')}<span>Made to keep</span></li>
            </ul>
          </article>
          <article class="offer__card" data-reveal style="--d:.08s">
            <p class="eyebrow">Bespoke bows</p>
            <h3>Bows made to <em>match</em></h3>
            <p>Matching bows for sisters, party outfits, school colours or a favourite character. Any of the bows in the shop can be remade in the colours you choose.</p>
            <ul class="ticks">
              <li>${icon('check')}<span>Your colours and ribbon</span></li>
              <li>${icon('check')}<span>Matching sets for siblings and friends</span></li>
              <li>${icon('check')}<span>Party bag gifts</span></li>
            </ul>
          </article>
        </div>
      </section>

      ${gallery.length ? `
      <section class="section" aria-labelledby="past-title">
        <div class="wrap">
          ${sectionHead({ eyebrow: 'Past commissions', title: '<span id="past-title">Made with <em>love</em></span>', lead: 'A few pieces Lulu has made before. Each one is unique, so yours will be made just for you.' })}
          <ul class="portfolio">${gallery.map((g) => `<li data-reveal><img src="/${esc(g.src.replace(/^\//, ''))}" alt="${esc(g.alt)}" loading="lazy"></li>`).join('')}</ul>
        </div>
      </section>` : ''}

      <section class="night section" id="how" aria-labelledby="how-title" style="margin-top:clamp(56px,8vw,104px)">
        <div class="wrap">
          ${sectionHead({ eyebrow: 'How it works', title: `<span id="how-title">From idea to <em>keepsake</em></span>`, lead: lead ? `Please allow around ${esc(lead)} from confirmation. Need it sooner? Just ask.` : '' })}
          <ol class="steps">
            <li data-reveal><h3>Share your idea</h3><p>Send the theme, colours, name and date using the form below.</p></li>
            <li data-reveal style="--d:.06s"><h3>Get a quote</h3><p>Lulu replies on WhatsApp with ideas and a price.</p></li>
            <li data-reveal style="--d:.12s"><h3>Confirm</h3><p>Once you are happy with the design, your piece goes into the diary.</p></li>
            <li data-reveal style="--d:.18s"><h3>Made by hand</h3><p>Sculpted, finished and posted to you, ready for the big day.</p></li>
          </ol>
        </div>
      </section>

      <section class="section" aria-labelledby="form-title">
        <div class="wrap wrap--narrow">
          ${sectionHead({ eyebrow: 'Start a commission', title: '<span id="form-title">Tell Lulu <em>your idea</em></span>', lead: 'Your request opens in WhatsApp, ready to send. No commitment, just a chat.' })}
          <form class="form" id="mto-form" novalidate data-reveal>
            <fieldset class="field">
              <legend>What would you like?</legend>
              <div class="pills">
                ${['Birthday candle', 'Bespoke bows', 'Candle and bows'].map((t, i) => `<label><input type="radio" name="what" value="${t}" ${i ? '' : 'checked'}><span>${t}</span></label>`).join('')}
              </div>
            </fieldset>
            <div class="form__row">
              <div class="field"><label for="m-name">Your name</label><input id="m-name" name="name" autocomplete="given-name" required></div>
              <div class="field"><label for="m-date">Date needed</label><input id="m-date" name="date" type="date"></div>
            </div>
            <div class="form__row">
              <div class="field"><label for="m-occasion">Occasion</label><input id="m-occasion" name="occasion" placeholder="e.g. 3rd birthday"></div>
              <div class="field"><label for="m-for">Name and age it is for</label><input id="m-for" name="for" placeholder="e.g. Sofia, turning 3"></div>
            </div>
            <div class="field"><label for="m-theme">Theme and colours</label><input id="m-theme" name="theme" required placeholder="e.g. mermaids, lilac and mint"></div>
            <div class="field"><label for="m-notes">Anything else?</label><textarea id="m-notes" name="notes" placeholder="Links to inspiration, quantities, budget…"></textarea></div>
            <div class="form__actions">
              <button class="btn btn--wa" type="submit">${icon('wa')} Send on WhatsApp</button>
              ${SHOP.instagram ? `<a class="link" href="${igLink()}" target="_blank" rel="noopener">or message on Instagram ${icon('arrow')}</a>` : ''}
            </div>
            <p class="form__fine">Lulu usually replies the same day.</p>
          </form>
        </div>
      </section>`,
    mount(root) {
      const form = root.querySelector('#mto-form');
      const date = form.querySelector('#m-date');
      date.min = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
      form.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('is-invalid'));
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = new FormData(form);
        let bad = null;
        for (const name of ['name', 'theme']) {
          if (!String(f.get(name) || '').trim()) {
            const field = form.querySelector(`[name="${name}"]`).closest('.field');
            field.classList.add('is-invalid');
            bad = bad || form.querySelector(`[name="${name}"]`);
          }
        }
        if (bad) { bad.focus(); return; }
        const d = f.get('date') ? new Date(`${f.get('date')}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
        const opt = (label, value) => (String(value || '').trim() ? `• ${label}: ${String(value).trim()}` : null);
        const msg = [
          'Hi Lulu! I would love a made-to-order piece 💕',
          '',
          opt('What', f.get('what')),
          opt('Occasion', f.get('occasion')),
          opt('For', f.get('for')),
          opt('Theme and colours', f.get('theme')),
          opt('Needed by', d),
          opt('Notes', f.get('notes')),
          '',
          `Thank you! ${String(f.get('name')).trim()}`,
        ].filter((x) => x !== null).join('\n');
        track('Contact');
        window.open(waLink(msg), '_blank', 'noopener');
      });
    },
  };
}

/* ----------------------------------------------------------------- sobre --- */
export function about() {
  const pick = ['bonnet-doll-bow', 'headband-duo', 'safari-lion-cub-bow'].map((id) => productById.get(id)).filter(Boolean);
  return {
    title: 'Our story',
    description: 'Art with Love is Lulu’s studio in London, making luxury handmade bows and cold porcelain keepsakes.',
    html: `
      <section class="wrap page-head">
        <p class="eyebrow eyebrow--spark">Our story</p>
        <h1>Made with <em>love</em>, in London</h1>
        <p class="lead">Art with Love is the studio of Luciene, Lulu to her customers: a maker who turns ribbon, pearls and cold porcelain into little treasures.</p>
      </section>
      <section class="section" style="padding-top:clamp(16px,3vw,32px)">
        <div class="wrap split">
          <div class="split__media" data-reveal>
            <div class="edit" style="background:var(--holo-soft);min-height:420px;grid-template-columns:1fr">
              <span class="edit__imgs" aria-hidden="true" style="min-height:420px">
                ${pick.slice(0, 2).map((p) => `<img src="${photo(p, p.variants?.[0], 1)}" alt="" loading="lazy">`).join('')}
              </span>
            </div>
          </div>
          <div class="split__copy prose" data-reveal style="--d:.1s">
            <h2 style="margin-top:0">One bow at a <em>time</em></h2>
            <p>Every piece is made by hand: the ribbon cut and folded, the layers built up, the pearls, pompoms and characters added one by one. Nothing is mass-produced, so each bow has its own small personality.</p>
            <p>Lulu brings the Brazilian tradition of <strong>biscuit</strong>, modelling in cold porcelain, to her London studio. It is how the little mermaids, teddies and dolls on her bows come to life, and how her birthday candles become keepsakes.</p>
            <p>Each piece is photographed next to a ruler, so you always know exactly what you are getting, and it arrives on its signature Art with Love card, ready to give.</p>
            <a class="btn btn--primary" href="/shop" style="width:fit-content">Shop the collection ${icon('arrow', 'btn__arrow')}</a>
          </div>
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="wrap">
          <ol class="steps" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
            <li data-reveal><h3>Handmade</h3><p>Cut, folded and finished by hand in London.</p></li>
            <li data-reveal style="--d:.06s"><h3>Honest sizing</h3><p>Every photo has a ruler. What you see is what arrives.</p></li>
            <li data-reveal style="--d:.12s"><h3>Small batches</h3><p>Many pieces are one of a kind. When they are gone, they are gone.</p></li>
          </ol>
        </div>
      </section>`,
  };
}

/* ----------------------------------------------------------------- ajuda --- */
export function help() {
  const contact = [
    `<li>WhatsApp: <a href="${waLink()}" target="_blank" rel="noopener">message Lulu</a></li>`,
    SHOP.instagram && `<li>Instagram: <a href="${igLink()}" target="_blank" rel="noopener">@${esc(SHOP.instagram)}</a></li>`,
    SHOP.email && `<li>Email: <a href="mailto:${esc(SHOP.email)}">${esc(SHOP.email)}</a></li>`,
  ].filter(Boolean).join('');
  return {
    title: 'Help · Delivery, returns and care',
    description: 'Delivery, returns, care and safety information for Art with Love by Lulu.',
    html: `
      <section class="wrap page-head">
        <p class="eyebrow eyebrow--spark">Help</p>
        <h1>Good to <em>know</em></h1>
        <nav class="toc" aria-label="On this page">
          <a class="chip" href="#delivery">Delivery</a><a class="chip" href="#returns">Returns</a><a class="chip" href="#care">Care &amp; safety</a><a class="chip" href="#payments">Payments</a><a class="chip" href="#contact">Contact</a>
        </nav>
      </section>
      <section class="wrap wrap--text prose" style="padding-bottom:clamp(40px,6vw,80px)">
        <h2 id="delivery">Delivery</h2>
        <p>We post to addresses in the United Kingdom with Royal Mail. Orders are dispatched within ${esc(shipping.dispatch)}, and every piece is packed with care so it arrives in perfect shape.</p>
        <ul>
          ${shipping.options.map((o) => `<li><strong>${esc(o.name)}</strong>: ${money(o.price)}, usually ${o.days[0]}–${o.days[1]} working days after dispatch</li>`).join('')}
          <li><strong>Free ${esc(shipping.options[0].name)}</strong> on orders over ${freeOver}</li>
        </ul>
        <p>Made-to-order pieces are posted as soon as they are ready. We will agree a date with you before we start.</p>

        <h2 id="returns">Returns</h2>
        <p>If you change your mind, you can cancel your order within 14 days of receiving it. Let us know, then send the pieces back unused and on their original card within a further 14 days. We will refund the item price and your original standard delivery within 14 days of getting them back. Return postage is paid by you unless the item is faulty.</p>
        <p>Made-to-order and personalised pieces, including candles, are made just for you, so they cannot be returned unless they arrive damaged or faulty.</p>
        <p class="note">Something wrong with your order? Message us within 48 hours of delivery with a photo and we will put it right.</p>

        <h2 id="care">Care &amp; safety</h2>
        <ul>
          <li>Our pieces contain small parts. Hair accessories are not toys: please supervise children while they wear them, and keep them away from under-3s when not being worn.</li>
          <li>Always take bows and headbands out before naps and bedtime.</li>
          <li>Keep cold porcelain details dry. Wipe gently with a dry cloth if needed.</li>
          <li>Store bows flat, away from direct sunlight, to keep their shape and colour.</li>
          <li>Candles are decorative keepsakes. Never leave a lit candle unattended.</li>
        </ul>

        <h2 id="payments">Payments</h2>
        <p>Checkout is handled securely by Stripe. You can pay with Visa, Mastercard, American Express, Apple Pay or Google Pay. We never see or store your card details. Prices are in pounds sterling (GBP).</p>

        <h2 id="contact">Contact</h2>
        <p>Questions about a bow, an order or a commission? Lulu is happy to help.</p>
        <ul>${contact}</ul>
      </section>`,
  };
}

/* ----------------------------------------------------------------- legal --- */
export function legal() {
  return {
    title: 'Privacy and terms',
    description: 'Privacy policy and terms of sale for Art with Love by Lulu.',
    html: `
      <section class="wrap page-head">
        <p class="eyebrow eyebrow--spark">The small print</p>
        <h1>Privacy &amp; <em>terms</em></h1>
        <nav class="toc" aria-label="On this page"><a class="chip" href="#privacy">Privacy</a><a class="chip" href="#cookies">Cookies</a><a class="chip" href="#terms">Terms of sale</a></nav>
      </section>
      <section class="wrap wrap--text prose" style="padding-bottom:clamp(40px,6vw,80px)">
        <h2 id="privacy">Privacy policy</h2>
        <p>Art with Love by Lulu is a small handmade business run by ${esc(SHOP.brand.maker)} in ${esc(SHOP.brand.city)}, United Kingdom. We only collect what we need to make and deliver your order.</p>
        <ul>
          <li><strong>When you order:</strong> your name, email, phone number and delivery address are collected by our payment provider, Stripe, and shared with us so we can post your order and contact you about it.</li>
          <li><strong>When you message us:</strong> on WhatsApp or Instagram, we see what you send us and use it to reply.</li>
          <li><strong>Payments:</strong> card details go straight to Stripe. We never see them.</li>
        </ul>
        <p>We keep order records for as long as the law requires for accounting, and never sell your details. You can ask to see, correct or delete your information at any time by contacting us. You also have the right to complain to the Information Commissioner’s Office (ico.org.uk).</p>

        <h2 id="cookies">Cookies</h2>
        <p>Your bag is saved on your own device so it is still there when you come back. We do not use advertising or tracking cookies unless you agree to them in the cookie banner, and you can change your mind at any time by clearing this site’s data in your browser.</p>

        <h2 id="terms">Terms of sale</h2>
        <ul>
          <li>Prices are shown in pounds sterling (GBP). Delivery is added at checkout.</li>
          <li>Your order is accepted when you receive our confirmation email. If a piece turns out to be unavailable, we will tell you straight away and refund you in full.</li>
          <li>Every piece is handmade, so small differences from the photos are part of its charm and are not a fault.</li>
          <li>Cancellations and returns follow our <a href="/help#returns">returns policy</a>, which does not affect your legal rights.</li>
          <li>Made-to-order pieces are confirmed with you before work begins.</li>
        </ul>
        <p class="note">Questions about these terms? <a href="/help#contact">Get in touch</a>.</p>
      </section>`,
  };
}

/* ----------------------------------------------------------- obrigado --- */
export function thanks(url) {
  const id = url.searchParams.get('session_id');
  return {
    title: 'Thank you',
    description: 'Thank you for your order.',
    noindex: true,
    html: `
      <section class="wrap thanks">
        <svg class="thanks__heart" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-heart"/></svg>
        <p class="eyebrow eyebrow--spark">Order confirmed</p>
        <h1>Thank you, <em id="thanks-name">lovely</em>!</h1>
        <p class="lead" style="max-width:32rem">Your order is in. A confirmation is on its way to your inbox, and Lulu will let you know as soon as it is in the post.</p>
        <div class="order-box" id="order-box" hidden></div>
        <div class="hero__ctas"><a class="btn btn--primary" href="/shop">Keep browsing</a>${SHOP.instagram ? `<a class="btn btn--ghost" href="${igLink()}" target="_blank" rel="noopener">${icon('ig')} Follow on Instagram</a>` : ''}</div>
      </section>`,
    async mount(root) {
      if (!id) return;
      bag.clear();
      try {
        const res = await fetch(`/api/order?session_id=${encodeURIComponent(id)}`);
        if (!res.ok) return;
        const o = await res.json();
        if (o.name) root.querySelector('#thanks-name').textContent = o.name;
        const box = root.querySelector('#order-box');
        box.innerHTML = `
          ${(o.items || []).map((i) => `<div class="totals"><div><span>${esc(i.name)} × ${i.qty}</span><span>${money(i.total)}</span></div></div>`).join('')}
          <div class="totals"><div class="totals__sum"><span>Total paid</span><span>${money(o.total)}</span></div></div>`;
        box.hidden = false;
        // Evita contar a mesma compra duas vezes ao recarregar a página
        const key = `awl-purchase-${id}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          track('Purchase', { value: o.total, currency: SHOP.currency });
        }
      } catch { /* a página de agradecimento continua funcionando sem o resumo */ }
    },
  };
}

/* ------------------------------------------------------------------ 404 --- */
export function notFound() {
  return {
    title: 'Page not found',
    description: 'This page could not be found.',
    noindex: true,
    status: 404,
    html: `
      <section class="wrap thanks">
        <svg class="thanks__heart" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-heart"/></svg>
        <p class="eyebrow">Error 404</p>
        <h1>This bow has <em>wandered off</em></h1>
        <p class="lead">The page you were looking for is not here. It may have sold out or moved.</p>
        <div class="hero__ctas"><a class="btn btn--primary" href="/shop">Shop all bows</a><a class="btn btn--ghost" href="/">Home</a></div>
      </section>`,
  };
}

