// Side view of a panel van, plain and wrapped, for the before/after slider on the vehicle signage page.
// One SVG: the plain body at the bottom, the wrapped body on top clipped by #wrap-reveal
// (site.js moves that clip as the handle is dragged), then the parts that look the same either way.

import { mark, word } from './logo.mjs';

const BODY =
  'M60 104C60 82 72 70 96 69L628 62C668 62 694 70 714 90L796 190C806 203 820 210 840 213L912 224C934 228 946 244 946 266L946 344C946 364 934 376 914 376L840 376A80 80 0 0 0 680 376L310 376A80 80 0 0 0 150 376L86 376C70 376 60 366 60 350Z';
const WINDOW =
  'M648 98L706 96C714 96 720 99 725 105L782 182C785 186 783 190 778 190L648 190C643 190 640 187 640 182L640 106C640 101 643 98 648 98Z';

const wheel = (x) => `
    <g class="van__wheel" transform="translate(${x} 384)">
      <circle r="63" fill="#151118"/>
      <circle r="56" fill="none" stroke="#2b2530" stroke-width="3"/>
      <circle r="38" fill="url(#van-rim)"/>
      <g class="van__spokes">
        ${[0, 72, 144, 216, 288].map((a) => `<rect x="-5" y="-34" width="10" height="26" rx="5" fill="#6d6676" transform="rotate(${a})"/>`).join('')}
      </g>
      <circle r="11" fill="#c9c4d0"/>
      <circle r="4" fill="#6d6676"/>
    </g>`;

export function van() {
  const markScale = 0.17;
  return `<svg class="van" viewBox="0 0 1000 460" role="img" aria-labelledby="van-title">
  <title id="van-title">A white panel van, gradually covered by a purple and pink Bora Signs wrap</title>
  <defs>
    <linearGradient id="van-paint" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f1eef4"/><stop offset="1" stop-color="#cfc9d6"/>
    </linearGradient>
    <linearGradient id="van-livery" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3b0f66"/><stop offset=".6" stop-color="#25093f"/><stop offset="1" stop-color="#160527"/>
    </linearGradient>
    <linearGradient id="van-pink" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#f62584"/><stop offset="1" stop-color="#ff5fa9"/>
    </linearGradient>
    <linearGradient id="van-sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".22" stop-color="#fff" stop-opacity=".28"/>
      <stop offset=".34" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".28"/>
    </linearGradient>
    <linearGradient id="van-glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3f4a60"/><stop offset=".55" stop-color="#1b2030"/><stop offset="1" stop-color="#0e111a"/>
    </linearGradient>
    <radialGradient id="van-rim"><stop offset="0" stop-color="#e9e6ee"/><stop offset="1" stop-color="#8f8899"/></radialGradient>
    <radialGradient id="van-shadow"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <pattern id="van-dots" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="2.2" fill="#fff" fill-opacity=".14"/>
    </pattern>
    <clipPath id="van-body"><path d="${BODY}"/></clipPath>
    <clipPath id="wrap-reveal"><rect class="van__reveal" x="0" y="0" width="500" height="460"/></clipPath>
  </defs>

  <ellipse cx="500" cy="446" rx="480" ry="18" fill="url(#van-shadow)"/>

  <path d="${BODY}" fill="url(#van-paint)"/>

  <g clip-path="url(#wrap-reveal)">
    <g clip-path="url(#van-body)">
      <rect x="40" y="50" width="920" height="340" fill="url(#van-livery)"/>
      <rect x="40" y="50" width="420" height="200" fill="url(#van-dots)"/>
      <g transform="translate(-40 40) scale(.62)" opacity=".16" fill="#b56cff"><path d="${mark.body}"/></g>
      <path d="M40 372C300 352 560 286 1000 132L1000 236C600 356 330 404 40 420Z" fill="url(#van-pink)"/>
      <path d="M40 334C310 314 560 252 1000 96L1000 118C560 270 312 334 40 352Z" fill="#8b3dff"/>
      <g transform="translate(108 146) scale(.2)">
        <path d="${word.bora}" fill="#fff"/><path d="${word.signs}" fill="#ff5fa9"/>
      </g>
      <text x="110" y="222" fill="#fff" font-size="23" font-weight="600" letter-spacing=".5">Signage without the stress.</text>
      <text x="108" y="104" fill="#ff5fa9" font-size="15" font-weight="700" letter-spacing="3">VEHICLE WRAPS · SHOPFRONTS · WINDOWS · OFFICES</text>
      <g transform="translate(652 226) scale(${markScale})" fill="#fff">
        <path d="${mark.body}"/>
        <circle cx="${mark.eye.cx}" cy="${mark.eye.cy}" r="${mark.eye.r}"/>
        <circle cx="${mark.pupil.cx}" cy="${mark.pupil.cy}" r="${mark.pupil.r}" fill="#3b0f66"/>
      </g>
      <text x="110" y="256" fill="#fff" font-size="19" font-weight="600" opacity=".85">borasigns.com.au</text>
      <text x="330" y="336" fill="#fff" font-size="36" font-weight="800">0482 530 280</text>
      <rect x="40" y="50" width="920" height="340" fill="url(#van-sheen)"/>
    </g>
  </g>

  <path d="${BODY}" fill="url(#van-sheen)" opacity=".55"/>
  <path d="M74 266C300 258 600 258 938 268" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
  <g fill="none" stroke="#000" stroke-opacity=".22" stroke-width="2">
    <path d="M634 92V372M440 80V372M812 216V318M66 92V340"/>
    <path d="M150 124H434" stroke-opacity=".14" stroke-width="5" stroke-linecap="round"/>
  </g>
  <path d="${WINDOW}" fill="url(#van-glass)"/>
  <path d="M664 104L694 104L740 186L710 186Z" fill="#fff" fill-opacity=".12"/>
  <rect x="650" y="212" width="36" height="10" rx="5" fill="#2a2430"/>
  <rect x="452" y="212" width="36" height="10" rx="5" fill="#2a2430"/>
  <path d="M792 178L824 172C832 171 836 178 832 186L824 202L800 202Z" fill="#221d27"/>
  <path d="M930 236C940 238 946 246 946 256L946 272L912 270C908 256 914 241 930 236Z" fill="#fff4d6"/>
  <path d="M60 216H70C73 216 74 218 74 221V297C74 300 73 302 70 302H60Z" fill="#d61f3c"/>
  <path d="M946 330V350C946 366 934 378 914 378H846V334Z" fill="#2a2430"/>
  <path d="M60 336H122V378H86C70 378 60 368 60 352Z" fill="#2a2430"/>
  <path d="M312 352H678V376H312Z" fill="#2a2430"/>
  <path d="M152 378A78 78 0 0 1 308 378" fill="none" stroke="#0d0a10" stroke-width="6"/>
  <path d="M682 378A78 78 0 0 1 838 378" fill="none" stroke="#0d0a10" stroke-width="6"/>
  ${wheel(230)}
  ${wheel(760)}
</svg>`;
}
