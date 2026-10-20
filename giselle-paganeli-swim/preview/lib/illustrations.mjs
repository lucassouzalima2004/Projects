// Flat-lay drawings of each product, used in the preview until the real photographs exist.
// Every drawing is an 800 × 1000 SVG (4:5, the product image ratio of the theme).

const mix = (hex, target, amount) => {
  const a = hex.match(/\w\w/g).map((h) => parseInt(h, 16));
  const b = target.match(/\w\w/g).map((h) => parseInt(h, 16));
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * amount).toString(16).padStart(2, '0')).join('')}`;
};

const isDark = (hex) => {
  const [r, g, b] = hex.match(/\w\w/g).map((h) => parseInt(h, 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
};

const bottom = (top, legs, crotch, width = 0) => {
  const l = 262 - width;
  const r = 538 + width;
  return `M${l} ${top} C${330 - width} ${top + 16} ${470 + width} ${top + 16} ${r} ${top} C${r - 8} ${top + legs} ${r - 26} ${top + legs + 22} ${r - 52} ${top + legs + 36} C${452} ${top + legs + 56} ${428} ${crotch - 50} 418 ${crotch} C406 ${crotch + 6} 394 ${crotch + 6} 382 ${crotch} C372 ${crotch - 50} 348 ${top + legs + 56} ${l + 52} ${top + legs + 36} C${l + 26} ${top + legs + 22} ${l + 8} ${top + legs} ${l} ${top} Z`;
};

const onePiece = (neck, legY = 718, crotchY = 822, legDepth = 70) =>
  `M316 190 L338 190 ${neck} L484 190 C494 262 514 316 532 362 C548 420 540 476 524 540 C512 594 516 650 546 ${legY} C500 ${legY + 10} 456 ${crotchY - legDepth} 432 ${crotchY} C420 ${crotchY + 8} 380 ${crotchY + 8} 368 ${crotchY} C344 ${crotchY - legDepth} 300 ${legY + 10} 254 ${legY} C284 650 288 594 276 540 C260 476 252 420 268 362 C286 316 306 262 316 190 Z`;

const mirror = (d) =>
  d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${800 - Number(x)} ${y}`);

const clover = (cx, cy, r, color) =>
  [45, 135, 225, 315]
    .map(
      (angle) =>
        `<path d="M0 0 C${-r * 0.55} ${-r * 0.35} ${-r * 0.6} ${-r * 1.05} 0 ${-r * 1.2} C${r * 0.6} ${-r * 1.05} ${r * 0.55} ${-r * 0.35} 0 0 Z" transform="translate(${cx} ${cy}) rotate(${angle})" fill="${color}" fill-opacity=".35" stroke="${color}" stroke-width="3"/>`
    )
    .join('') + `<circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="${color}"/>`;

const STYLES = {
  triangle: {
    front: '130 130 540 675',
    zoom: '230 250 340 425',
    pieces: [
      'M262 452 C300 420 330 360 348 300 C362 352 384 412 398 452 C352 462 306 462 262 452 Z',
      mirror('M262 452 C300 420 330 360 348 300 C362 352 384 412 398 452 C352 462 306 462 262 452 Z'),
      bottom(612, 28, 790),
    ],
    strings: [
      'M348 300 C356 240 372 190 394 160', 'M452 300 C444 240 428 190 406 160',
      'M394 160 C380 138 368 150 390 160', 'M406 160 C420 138 432 150 410 160',
      'M262 452 C220 448 190 448 150 454 C140 470 146 490 136 508',
      'M538 452 C580 448 610 448 650 454 C660 470 654 490 664 508',
      'M262 614 C240 618 222 628 206 644', 'M538 614 C560 618 578 628 594 644',
    ],
  },
  bandeau: {
    front: '130 130 540 675',
    zoom: '230 250 340 425',
    pieces: [
      'M248 372 C330 346 470 346 552 372 C556 404 554 432 548 458 C470 440 330 440 252 458 C246 432 244 404 248 372 Z',
      bottom(610, 40, 792, 10),
    ],
    folds: ['M400 354 C396 380 396 420 400 444', 'M386 358 C382 382 384 420 388 444', 'M414 358 C418 382 416 420 412 444'],
  },
  balconette: {
    front: '130 130 540 675',
    zoom: '230 200 340 425',
    pieces: [
      'M258 452 C258 400 282 360 330 352 C360 348 386 360 398 380 L398 452 C350 462 302 462 258 452 Z',
      mirror('M258 452 C258 400 282 360 330 352 C360 348 386 360 398 380 L398 452 C350 462 302 462 258 452 Z'),
      'M258 452 C350 466 450 466 542 452 L540 476 C450 490 350 490 260 476 Z',
      bottom(612, 34, 792, 6),
    ],
    strings: ['M300 356 L316 176', 'M500 356 L484 176'],
    folds: ['M300 420 C320 400 350 392 380 396', 'M500 420 C480 400 450 392 420 396'],
  },
  halter: {
    front: '130 130 540 675',
    zoom: '230 220 340 425',
    pieces: [
      'M256 458 C292 420 332 352 372 286 C384 344 392 410 398 458 C350 468 300 468 256 458 Z',
      mirror('M256 458 C292 420 332 352 372 286 C384 344 392 410 398 458 C350 468 300 468 256 458 Z'),
      'M256 458 C350 472 450 472 544 458 L544 484 C450 498 350 498 256 484 Z',
      bottom(606, 22, 794, 14),
    ],
    strings: [
      'M372 286 C380 230 392 196 400 176', 'M428 286 C420 230 408 196 400 176',
      'M400 176 C384 150 372 166 398 174', 'M400 176 C416 150 428 166 402 174',
    ],
  },
  ring: {
    front: '130 130 540 675',
    zoom: '230 250 340 425',
    pieces: [
      'M248 376 C300 358 350 356 382 362 C386 392 386 424 382 452 C340 446 296 448 252 460 C244 432 244 404 248 376 Z',
      mirror('M248 376 C300 358 350 356 382 362 C386 392 386 424 382 452 C340 446 296 448 252 460 C244 432 244 404 248 376 Z'),
      bottom(610, 40, 792, 10),
    ],
    hardware: (gold) => clover(400, 407, 22, gold),
  },
  tieside: {
    front: '130 130 540 675',
    zoom: '230 260 340 425',
    pieces: [
      'M276 448 C306 420 330 372 346 322 C358 368 378 414 394 448 C356 458 316 458 276 448 Z',
      mirror('M276 448 C306 420 330 372 346 322 C358 368 378 414 394 448 C356 458 316 458 276 448 Z'),
      bottom(616, 30, 790, -8),
    ],
    strings: [
      'M346 322 C354 258 372 200 394 166', 'M454 322 C446 258 428 200 406 166',
      'M276 448 C230 446 196 448 160 452', 'M524 448 C570 446 604 448 640 452',
      'M256 622 C232 600 220 614 246 626 C222 640 232 652 256 630',
      'M544 622 C568 600 580 614 554 626 C578 640 568 652 544 630',
      'M254 628 C246 654 240 676 230 698', 'M256 630 C254 658 256 682 250 704',
      'M546 628 C554 654 560 676 570 698', 'M544 630 C546 658 544 682 550 704',
    ],
  },
  scoop: {
    front: '128 150 544 680',
    zoom: '250 200 300 375',
    pieces: [onePiece('C344 252 352 300 362 330 C380 352 420 352 438 330 C448 300 456 252 462 190')],
    folds: ['M300 520 C330 560 470 560 500 520'],
  },
  plunge: {
    front: '128 150 544 680',
    zoom: '250 200 300 375',
    pieces: [onePiece('C350 300 376 420 400 505 C424 420 450 300 462 190')],
    folds: ['M318 610 C350 640 450 640 482 610'],
  },
  highleg: {
    front: '128 150 544 680',
    zoom: '250 220 300 375',
    pieces: [onePiece('C340 250 342 300 344 330 L456 330 C458 300 460 250 462 190', 676, 822, 96)],
    folds: ['M300 520 C330 552 470 552 500 520'],
  },
  oneshoulder: {
    front: '128 150 544 680',
    zoom: '240 160 320 400',
    pieces: [
      'M290 172 L344 166 C384 236 454 300 532 362 C548 420 540 476 524 540 C512 594 516 650 546 690 C504 700 458 750 432 822 C420 830 380 830 368 822 C342 750 296 700 254 690 C284 650 288 594 276 540 C260 476 252 420 268 362 C274 300 280 230 290 172 Z',
    ],
    folds: ['M300 300 C380 330 440 370 500 420'],
  },
  shirt: {
    front: '120 186 560 700',
    zoom: '280 170 240 300',
    pieces: [
      'M282 236 L352 214 C370 232 430 232 448 214 L518 236 L640 318 L604 420 L548 392 L552 842 C470 856 330 856 248 842 L252 392 L196 420 L160 318 Z',
      'M352 214 L322 272 L376 334 L400 296 Z',
      mirror('M352 214 L322 272 L376 334 L400 296 Z'),
    ],
    strings: ['M400 296 L400 848', 'M300 430 L360 430 L360 500 C340 506 320 506 300 500 Z'],
    buttons: [380, 470, 560, 650, 740],
    folds: ['M300 600 C320 700 310 780 300 840', 'M500 560 C480 650 492 760 500 840', 'M196 420 L252 392', 'M604 420 L548 392'],
  },
  shorts: {
    front: '150 270 500 625',
    zoom: '240 300 320 400',
    pieces: ['M250 330 L550 330 L572 720 L430 734 L400 520 L370 734 L228 720 Z', 'M250 330 L550 330 L552 382 L248 382 Z'],
    strings: [
      'M386 360 C382 420 370 450 356 472', 'M414 360 C420 420 434 446 450 464',
      'M262 400 C300 420 316 460 320 500', 'M538 400 C500 420 484 460 480 500',
    ],
    folds: ['M232 690 L376 704', 'M568 690 L424 704', 'M310 560 C320 620 316 670 306 712', 'M490 560 C480 620 484 670 494 712'],
  },
};

export function illustration(style, hex, view = 'front') {
  const spec = STYLES[style];
  if (!spec) throw new Error(`Unknown style ${style}`);
  const dark = isDark(hex);
  const light = mix(hex, '#ffffff', dark ? 0.16 : 0.35);
  const deep = mix(hex, '#000000', dark ? 0.1 : 0.16);
  const line = dark ? mix(hex, '#ffffff', 0.28) : mix(hex, '#000000', 0.32);
  const gold = '#a8895b';
  const bg = '#e9e2d6';
  const arch = '#f3eee5';
  const viewBox = view === 'detail' ? spec.zoom : spec.front;

  const pieces = spec.pieces
    .map(
      (d) =>
        `<path d="${d}" fill="url(#fabric)" stroke="${line}" stroke-width="2" stroke-linejoin="round"/><path d="${d}" fill="url(#weave)"/><path d="${d}" fill="url(#sheen)"/>`
    )
    .join('');
  const strings = (spec.strings || [])
    .map((d) => `<path d="${d}" fill="none" stroke="${deep}" stroke-width="5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${light}" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>`)
    .join('');
  const folds = (spec.folds || [])
    .map((d) => `<path d="${d}" fill="none" stroke="${line}" stroke-width="1.4" opacity=".45" stroke-linecap="round"/>`)
    .join('');
  const buttons = (spec.buttons || [])
    .map((y) => `<circle cx="400" cy="${y}" r="7" fill="${light}" stroke="${line}" stroke-width="1.5"/>`)
    .join('');
  const hardware = spec.hardware ? spec.hardware(gold) : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="800" height="1000" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="fabric" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${hex}"/><stop offset="1" stop-color="${deep}"/></linearGradient>
<radialGradient id="sheen" cx=".35" cy=".25" r=".7"><stop offset="0" stop-color="#fff" stop-opacity="${dark ? 0.14 : 0.32}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<pattern id="weave" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="7" height="7" fill="none"/><line x1="0" y1="0" x2="0" y2="7" stroke="${dark ? '#fff' : '#000'}" stroke-opacity=".05" stroke-width="2.4"/></pattern>
<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#3a2a20" flood-opacity=".16"/></filter>
</defs>
<rect x="-400" y="-400" width="1600" height="1800" fill="${bg}"/>
<path d="M140 1000 V440 A260 260 0 0 1 660 440 V1000 Z" fill="${arch}"/>
<g filter="url(#shadow)">${pieces}</g>
${folds}${strings}${buttons}${hardware}
</svg>`;
}

export const styles = Object.keys(STYLES);
