/* Acabamentos (cores e texturas) do simulador e da seção "Texture. Tone. Character."
   As texturas são desenhadas pelo próprio navegador (madeira, mármore, concreto...), sem baixar fotos.
   Para incluir um acabamento, copie uma linha de FINISHES e troque nome, cores e "seed" (muda o desenho). */
(function () {
  'use strict';

  // ---------- Lista de acabamentos ----------
  // type: solid | wood | marble | concrete | travertine | speckle
  // group: solid | timber | stone (filtros do simulador); hidden: só usado no "antes"
  const FINISHES = [
    { id: 'matte-white',  name: 'Matte White',    group: 'solid',  type: 'solid', color: '#ECE9E3' },
    { id: 'chalk',        name: 'Chalk',          group: 'solid',  type: 'solid', color: '#E2DACB' },
    { id: 'greige',       name: 'Greige',         group: 'solid',  type: 'solid', color: '#BCB2A3' },
    { id: 'sage',         name: 'Sage',           group: 'solid',  type: 'solid', color: '#A2AC94' },
    { id: 'eucalyptus',   name: 'Eucalyptus',     group: 'solid',  type: 'solid', color: '#6E7E6C' },
    { id: 'dusty-blue',   name: 'Dusty Blue',     group: 'solid',  type: 'solid', color: '#8C9FAB' },
    { id: 'navy',         name: 'Deep Navy',      group: 'solid',  type: 'solid', color: '#28334A' },
    { id: 'forest',       name: 'Forest',         group: 'solid',  type: 'solid', color: '#344339' },
    { id: 'terracotta',   name: 'Terracotta',     group: 'solid',  type: 'solid', color: '#B06E52' },
    { id: 'charcoal',     name: 'Charcoal',       group: 'solid',  type: 'solid', color: '#3B3A37' },
    { id: 'satin-black',  name: 'Satin Black',    group: 'solid',  type: 'solid', color: '#1F1E1C' },

    { id: 'natural-oak',  name: 'Natural Oak',    group: 'timber', type: 'wood', color: '#C7A47A', dark: '#9E7B53', seed: 11, rings: 6 },
    { id: 'blonde-ash',   name: 'Blonde Ash',     group: 'timber', type: 'wood', color: '#DDCBAA', dark: '#BFA57F', seed: 23, rings: 9 },
    { id: 'spotted-gum',  name: 'Spotted Gum',    group: 'timber', type: 'wood', color: '#A27B58', dark: '#73513A', seed: 37, rings: 6 },
    { id: 'smoked-oak',   name: 'Smoked Oak',     group: 'timber', type: 'wood', color: '#6E5E50', dark: '#4A3E35', seed: 41, rings: 8 },
    { id: 'walnut',       name: 'Walnut',         group: 'timber', type: 'wood', color: '#6F4C36', dark: '#432C1F', seed: 53, rings: 5 },

    { id: 'carrara',      name: 'Carrara',        group: 'stone',  type: 'marble', color: '#EEEDEA', vein: '#8A8D93', seed: 5,  strength: 0.7, scale: 1, sharp: 22, halo: 0.12 },
    { id: 'calacatta',    name: 'Calacatta Gold', group: 'stone',  type: 'marble', color: '#F1EEE8', vein: '#A88456', seed: 9,  strength: 1, scale: 0.8, sharp: 14, halo: 0.22 },
    { id: 'nero',         name: 'Nero Marquina',  group: 'stone',  type: 'marble', color: '#1D1D1F', vein: '#D9D6D0', seed: 17, strength: 0.8,  scale: 0.9 },
    { id: 'concrete',     name: 'Concrete',       group: 'stone',  type: 'concrete', color: '#8F8C87', seed: 29 },
    { id: 'travertine',   name: 'Travertine',     group: 'stone',  type: 'travertine', color: '#D8C8AE', dark: '#B9A584', seed: 31 },

    // "Antes" do simulador: a cozinha datada que todo mundo conhece
    { id: 'honey-oak',    name: 'Original honey timber', hidden: true, type: 'wood', color: '#B7773D', dark: '#8C5426', seed: 61, rings: 6 },
    { id: 'laminate',     name: 'Original speckled laminate', hidden: true, type: 'speckle', color: '#CDBFA8', seed: 71 }
  ];

  const byId = Object.fromEntries(FINISHES.map(f => [f.id, f]));

  // ---------- Ruído periódico (as texturas emendam sem costura) ----------
  function makeNoise(seed) {
    const p = new Uint8Array(512);
    const perm = Array.from({ length: 256 }, (_, i) => i);
    let s = seed * 9301 + 49297;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
    const grad = (h, x, y) => {
      switch (h & 7) {
        case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y;
        case 4: return x; case 5: return -x; case 6: return y; default: return -y;
      }
    };
    // Perlin 2D com período px × py
    function noise(x, y, px, py) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const x0 = ((xi % px) + px) % px, y0 = ((yi % py) + py) % py;
      const x1 = (x0 + 1) % px, y1 = (y0 + 1) % py;
      const u = fade(xf), v = fade(yf);
      const aa = p[p[x0] + y0], ab = p[p[x0] + y1], ba = p[p[x1] + y0], bb = p[p[x1] + y1];
      const l1 = grad(aa, xf, yf) + u * (grad(ba, xf - 1, yf) - grad(aa, xf, yf));
      const l2 = grad(ab, xf, yf - 1) + u * (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1));
      return l1 + v * (l2 - l1); // ~ -1..1
    }
    function fbm(x, y, px, py, oct) {
      let sum = 0, amp = 0.5, f = 1;
      for (let o = 0; o < oct; o++) {
        sum += amp * noise(x * f, y * f, px * f, py * f);
        f *= 2; amp *= 0.5;
      }
      return sum;
    }
    return { noise, fbm, rnd };
  }

  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, t) => a + (b - a) * t;
  const clamp = v => (v < 0 ? 0 : v > 255 ? 255 : v);
  const TAU = Math.PI * 2;

  // Cada função recebe (u, v) de 0 a 1 e devolve [r, g, b]
  const painters = {
    solid(f, N) {
      const c = hex(f.color);
      return (u, v) => {
        const n = N.fbm(u * 6, v * 6, 6, 6, 3) * 7 + (N.noise(u * 180, v * 180, 180, 180)) * 3;
        return [c[0] + n, c[1] + n, c[2] + n];
      };
    },
    wood(f, N) {
      const a = hex(f.color), b = hex(f.dark), R = f.rings || 7;
      return (u, v) => {
        // Veios quase retos (como uma lâmina de madeira), com ondas suaves e fibras finas
        const warp = N.fbm(u * 2, v * 1, 2, 1, 3);
        const t = u * R * 2 + warp * 1.1 + Math.sin(v * TAU + u * 3) * 0.12;
        const s = 0.5 + 0.5 * Math.sin(t * TAU);
        const line = Math.pow(s, 14);
        const band = 0.5 + 0.5 * N.fbm(u * 4, v * 0.5 + 7, 4, 1, 2) * 2;
        const fib = N.fbm(u * 96, v * 2, 96, 2, 2);
        const pore = N.noise(u * 260, v * 10, 260, 10);
        let k = 0.18 * s + 0.42 * line + 0.22 * band + fib * 0.32 + (pore > 0.45 ? 0.16 : 0);
        k = Math.max(0, Math.min(1, k));
        return [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
      };
    },
    marble(f, N) {
      const a = hex(f.color), b = hex(f.vein), st = f.strength || 0.6, sc = f.scale || 1;
      // Turbulência "ridged": soma de |ruído|, dá veios que correm em diagonal e se ramificam
      const turb = (u, v, base, oct) => {
        let sum = 0, amp = 0.5, fq = base;
        for (let o = 0; o < oct; o++) { sum += amp * Math.abs(N.noise(u * fq, v * fq, fq, fq)); fq *= 2; amp *= 0.5; }
        return sum;
      };
      const B = Math.max(1, Math.round(2 * sc));
      return (u, v) => {
        const t1 = u * 2 + v * 2 + turb(u, v, B, 5) * 2.2;
        const w1 = 0.55 + 0.45 * N.noise(u * 3 + 11, v * 3, 3, 3);
        const r1 = 1 - Math.abs(Math.sin(t1 * Math.PI));
        const v1 = (Math.pow(r1, f.sharp || 34) + Math.pow(r1, 6) * (f.halo || 0)) * w1;
        const t2 = u * 4 - v * 2 + turb(u + 0.37, v + 0.71, B * 2, 4) * 1.6;
        const v2 = Math.pow(1 - Math.abs(Math.sin(t2 * Math.PI)), 90) * 0.6;
        const cloud = N.fbm(u * 3, v * 3, 3, 3, 4);
        const k = Math.min(1, (v1 + v2) * st + Math.max(0, cloud) * st * 0.18);
        const l = cloud * (a[0] > 128 ? 10 : 14);
        return [mix(a[0], b[0], k) + l, mix(a[1], b[1], k) + l, mix(a[2], b[2], k) + l];
      };
    },
    concrete(f, N) {
      const c = hex(f.color);
      return (u, v) => {
        const big = N.fbm(u * 3, v * 3, 3, 3, 4) * 34;
        const mid = N.fbm(u * 18, v * 18, 18, 18, 2) * 12;
        const pit = N.noise(u * 140, v * 140, 140, 140) > 0.55 ? -26 : 0;
        const n = big + mid + pit;
        return [c[0] + n, c[1] + n, c[2] + n * 1.02];
      };
    },
    travertine(f, N) {
      const a = hex(f.color), b = hex(f.dark);
      return (u, v) => {
        const t = v * 9 + N.fbm(u * 2, v * 4, 2, 4, 4) * 1.4;
        const band = 0.5 + 0.5 * Math.sin(t * TAU);
        const fine = N.fbm(u * 30, v * 60, 30, 60, 2) * 0.25;
        const pit = N.noise(u * 70, v * 160, 70, 160) > 0.5 ? 0.35 : 0;
        const k = Math.max(0, Math.min(1, band * 0.45 + fine + pit));
        return [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
      };
    },
    speckle(f, N) {
      const c = hex(f.color);
      return (u, v) => {
        const n = N.fbm(u * 5, v * 5, 5, 5, 3) * 12;
        const s = N.noise(u * 200, v * 200, 200, 200);
        const d = s > 0.5 ? -60 : s < -0.55 ? 25 : 0;
        return [c[0] + n + d, c[1] + n + d * 0.95, c[2] + n + d * 0.9];
      };
    }
  };

  // ---------- Geração com cache ----------
  const cache = new Map();
  function texture(id, size) {
    size = size || 384;
    const key = id + '@' + size;
    if (cache.has(key)) return cache.get(key);
    const f = byId[id];
    const N = makeNoise(f.seed || 3);
    const paint = painters[f.type](f, N);
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(size, size);
    const d = img.data;
    for (let y = 0, i = 0; y < size; y++) {
      const v = y / size;
      for (let x = 0; x < size; x++, i += 4) {
        const c = paint(x / size, v);
        d[i] = clamp(c[0]); d[i + 1] = clamp(c[1]); d[i + 2] = clamp(c[2]); d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const url = cv.toDataURL(f.type === 'solid' ? 'image/png' : 'image/jpeg', 0.9);
    cache.set(key, url);
    return url;
  }

  // Cor média, para o camaleão e os detalhes que acompanham o acabamento
  function tone(id) {
    const f = byId[id];
    if (f.type === 'wood' || f.type === 'travertine') {
      const a = hex(f.color), b = hex(f.dark);
      return `rgb(${a.map((x, i) => Math.round(mix(x, b[i], 0.3))).join(',')})`;
    }
    return f.color;
  }
  const isDark = id => {
    const c = hex(byId[id].color);
    return (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) < 110;
  };

  window.BoraTextures = { FINISHES, byId, texture, tone, isDark };
})();
