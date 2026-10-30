/* =============================================================================
   O filme da casa em 3D. Por enquanto é uma versão para comparar: abra o site
   com ?3d no fim do endereço.

   Cada ambiente é uma cena 3D feita da imagem dele (tools/make-3d.py, arquivos
   em assets/3d/): a própria foto é a textura e cada ponto fica na profundidade
   que a imagem mostra. O scroll leva a câmera para dentro de cada ambiente.
   Os ambientes se montam em volta de quem chega, e um passa para o outro numa
   fusão. Tudo é desenhado ao vivo, na frequência da tela, sem quadros de vídeo.

   No celular em pé, a câmera percorre o ambiente de um lado ao outro em vez de
   cortar as laterais. Os textos e a ordem dos ambientes ficam em content.js
   (tour3d). Se algo falhar, o site volta para o filme em vídeo (film.js).
   ========================================================================== */
import * as THREE from './vendor/three.module.min.js';

const C = window.NUVO;
const DATA = window.NUVO_3D || {};
const film = document.querySelector('[data-film]');
const TOUR = C && Array.isArray(C.tour3d) ? C.tour3d.filter((s) => DATA[s.id]) : [];
if (!film || !TOUR.length) throw new Error('3D: nada para mostrar');

const stage = film.querySelector('.film__stage');
const media = film.querySelector('[data-film-media]');
const beatsRoot = film.querySelector('[data-film-beats]');
const portrait = () => window.innerWidth < window.innerHeight * 0.9;
const FADE = 14; // % da tela de scroll para um título entrar ou sair
const OVERLAP = 34; // % da tela de scroll da fusão entre um ambiente e o próximo

/* ------------------------------------------------------------ helpers */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const rich = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');

/* ------------------------------------------------------------ desenho */
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.autoClear = false;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const canvas = renderer.domElement;
canvas.className = 'film__canvas';
canvas.setAttribute('aria-hidden', 'true');
media.appendChild(canvas);
film.classList.add('is-canvas');
const maxAniso = renderer.capabilities.getMaxAnisotropy();

// O ambiente se monta: cada ponto aparece quando a "onda" que sai de onde a câmera começa passa por
// ele, com um brilho dourado na frente da onda (a marcenaria se formando em volta de quem chega)
// Nas bordas dos móveis (edge = 1) a malha da frente "estica" quando a câmera sai do ponto de
// partida: onde a textura fica muito mais esticada numa direção do que na outra, o ponto some e
// aparece a camada de trás (o fundo continuado). Parada no ponto de partida, a imagem é a foto exata.
const VERT = `
  attribute float edge;
  varying vec2 vUv;
  varying vec3 vPos;
  varying float vEdge;
  void main() {
    vUv = uv;
    vPos = position;
    vEdge = edge;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const FRAG = `
  uniform sampler2D map;
  uniform vec2 texSize;
  uniform float radius;
  uniform float glow;
  uniform float tear;
  varying vec2 vUv;
  varying vec3 vPos;
  varying float vEdge;
  void main() {
    if (tear > 0.0 && vEdge > 0.0) {
      vec2 a = dFdx(vUv) * texSize;
      vec2 b = dFdy(vUv) * texSize;
      float E = (a.x + b.y) * 0.5, F = (a.x - b.y) * 0.5, G = (b.x + a.y) * 0.5, H = (b.x - a.y) * 0.5;
      float Q = sqrt(E * E + H * H), R = sqrt(F * F + G * G);
      if ((Q + R) / max(abs(Q - R), 1e-5) > tear) discard;
    }
    float d = length(vPos) + 0.08 * sin(vPos.x * 3.1 + vPos.y * 2.3) * sin(vPos.z * 2.7 + vPos.y * 1.7);
    if (d > radius) discard;
    vec3 c = texture2D(map, vUv).rgb;
    float e = exp(-pow((radius - d) / 0.1, 2.0)) * glow;
    gl_FragColor = vec4(mix(c, vec3(0.86, 0.68, 0.44), clamp(e, 0.0, 0.6)), 1.0);
  }`;

// Fusão entre dois ambientes: o próximo é desenhado à parte e entra por cima, com transparência
const target = new THREE.WebGLRenderTarget(4, 4, { samples: 4 });
const quad = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.ShaderMaterial({
    uniforms: { tex: { value: target.texture }, alpha: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader:
      'uniform sampler2D tex; uniform float alpha; varying vec2 vUv; void main() { vec4 c = texture2D(tex, vUv); gl_FragColor = vec4(c.rgb, c.a * alpha); }',
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
);
const quadScene = new THREE.Scene();
quadScene.add(quad);
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

/* ------------------------------------------------------------ ambientes */
const scenes = TOUR.map((raw, index) => {
  const d = DATA[raw.id];
  const s = Object.assign({}, raw, {
    index,
    data: d,
    length: raw.length || 200,
    dolly: (raw.dolly ?? 0.25) * d.median, // metros que a câmera anda para dentro
    build: !!raw.build,
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(50, 1, 0.05, 400),
    radius: { value: 1e4 },
    glow: { value: 0 },
    ready: false,
  });
  return s;
});

let total = 0;
scenes.forEach((s) => {
  s.start = total;
  total += s.length;
});
film.style.setProperty('--film-len', total.toFixed(2));
film.classList.add('is-ready');

// Malha de um ambiente a partir da profundidade (assets/3d/<id>.bin, gerado pelo make-3d.py)
function buildMeshes(s, buf, front, back) {
  const d = s.data;
  const [gw, gh] = d.grid;
  const [W, H] = d.size;
  const n = gw * gh;
  const depth = new Uint16Array(buf, 0, n);
  const depthBg = new Uint16Array(buf, n * 2, n);
  const flags = new Uint8Array(buf, n * 4, (gw - 1) * (gh - 1));
  const cx = W / 2;
  const cy = H / 2;
  const uv = new Float32Array(n * 2);
  const pos = (src) => {
    const p = new Float32Array(n * 3);
    for (let j = 0, k = 0; j < gh; j++) {
      const v = Math.min(j * d.step, H - 1);
      for (let i = 0; i < gw; i++, k++) {
        const u = Math.min(i * d.step, W - 1);
        const z = src[k] / 100;
        p[k * 3] = ((u + 0.5 - cx) / d.f) * z;
        p[k * 3 + 1] = (-(v + 0.5 - cy) / d.f) * z;
        p[k * 3 + 2] = -z;
        uv[k * 2] = (u + 0.5) / W;
        uv[k * 2 + 1] = 1 - (v + 0.5) / H;
      }
    }
    return p;
  };
  // vértices que tocam uma célula com salto de profundidade
  const edge = new Float32Array(n);
  for (let j = 0; j < gh - 1; j++) {
    for (let i = 0; i < gw - 1; i++) {
      if (!(flags[j * (gw - 1) + i] & 1)) continue;
      const a = j * gw + i;
      edge[a] = edge[a + 1] = edge[a + gw] = edge[a + gw + 1] = 1;
    }
  }
  const tris = (want) => {
    const idx = [];
    for (let j = 0; j < gh - 1; j++) {
      for (let i = 0; i < gw - 1; i++) {
        const fl = flags[j * (gw - 1) + i];
        if (!want(fl)) continue;
        const a = j * gw + i;
        idx.push(a, a + gw, a + 1, a + 1, a + gw, a + gw + 1);
      }
    }
    return new THREE.BufferAttribute(new Uint32Array(idx), 1);
  };
  const make = (positions, index, map, behind) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setAttribute('edge', new THREE.BufferAttribute(edge, 1));
    g.setIndex(index);
    const m = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: map },
        texSize: { value: new THREE.Vector2(W, H) },
        radius: s.radius,
        glow: s.glow,
        tear: { value: behind ? 0 : 3.2 },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      side: THREE.DoubleSide,
      polygonOffset: behind,
      polygonOffsetFactor: behind ? 2 : 0,
      polygonOffsetUnits: behind ? 8 : 0,
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.renderOrder = behind ? 0 : 1;
    mesh.frustumCulled = false;
    return mesh;
  };
  const frontPos = pos(depth);
  const backPos = pos(depthBg);
  s.scene.add(make(backPos, tris((fl) => fl & 2), back, true));
  s.scene.add(make(frontPos, tris(() => true), front, false));
}

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      (t) => {
        t.anisotropy = maxAniso;
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        resolve(t);
      },
      undefined,
      reject
    );
  });
}

async function load(s) {
  if (s.loading) return s.loading;
  s.loading = Promise.all([
    fetch('assets/3d/' + s.id + '.bin').then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.arrayBuffer();
    }),
    loadTexture('assets/3d/' + s.id + '.jpg'),
    loadTexture('assets/3d/' + s.id + '.bg.jpg'),
  ]).then(([buf, front, back]) => {
    buildMeshes(s, buf, front, back);
    renderer.initTexture(front);
    renderer.initTexture(back);
    // sobe a cena para a placa de vídeo antes de ela aparecer (sem engasgo na primeira vez)
    renderer.compile(s.scene, s.camera);
    s.ready = true;
    wake();
  });
  return s.loading;
}

// Baixa um ambiente por vez: primeiro o da tela, depois os seguintes
async function loadAll() {
  const order = scenes.slice(Math.max(0, now.i)).concat(scenes.slice(0, Math.max(0, now.i)));
  for (const s of order) await load(s);
}

/* ------------------------------------------------------------ câmera de cada ambiente */
// Enquadramento como object-fit: cover no ponto de partida; no celular em pé sobra imagem dos lados,
// e a câmera percorre essa sobra ao longo do ambiente
function frame(s, aspect) {
  const d = s.data;
  const [W, H] = d.size;
  const hImg = 2 * Math.atan(W / 2 / d.f);
  const vImg = 2 * Math.atan(H / 2 / d.f);
  const vfov = aspect >= W / H ? 2 * Math.atan(Math.tan(hImg / 2) / aspect) : vImg;
  const hView = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
  s.camera.fov = (vfov * 180) / Math.PI;
  s.camera.aspect = aspect;
  s.camera.updateProjectionMatrix();
  s.yawRoom = Math.max(0, (hImg - hView) / 2); // quanto dá para virar sem mostrar a borda da imagem
  s.halfView = Math.tan(hView / 2);
}

// p: progresso no ambiente (negativo durante a fusão de entrada)
function pose(s, p) {
  const ov = OVERLAP / s.length;
  const t = clamp((p + ov) / (1 + ov)); // a câmera já anda enquanto o ambiente aparece
  const dz = s.dolly * easeInOut(t);
  // no celular em pé: de um lado ao outro do ambiente; no computador, um leve desvio
  const across = portrait() && s.pan !== false;
  const yaw = s.yawRoom * (across ? -0.85 * Math.cos(Math.PI * t) : 0.45 * Math.sin(Math.PI * t));
  const drift = dz * s.halfView * 0.18 * Math.sin(Math.PI * t);
  s.camera.position.set(drift, 0, -dz);
  s.camera.rotation.set(0, yaw, 0);
  // montagem: a onda vai de perto da câmera até o fundo do ambiente, quase toda durante a fusão
  if (s.build) {
    const b = smooth(clamp((p + ov) / (ov + 0.12)));
    s.radius.value = b >= 1 ? 1e4 : 0.35 + b * (s.data.median * 2.2 + 1.5);
    s.glow.value = b >= 1 ? 0 : 1;
  } else {
    s.radius.value = 1e4;
    s.glow.value = 0;
  }
}

/* ------------------------------------------------------------ títulos */
function beatHTML(b) {
  const tag = b.hero ? 'h1' : 'h2';
  let h = '';
  if (b.eyebrow) h += '<p class="beat__eyebrow">' + esc(b.eyebrow) + '</p>';
  h += '<' + tag + ' class="beat__title">' +
    String(b.title || '').split('\n').map((l) => '<span class="beat__line">' + rich(l) + '</span>').join('') +
    '</' + tag + '>';
  if (b.text) h += '<p class="beat__text">' + esc(b.text) + '</p>';
  if (b.actions && C.contact) {
    h += '<div class="beat__actions">' +
      '<a class="btn btn--solid" href="#contact">Book a free consultation</a>' +
      '<a class="btn btn--line" href="tel:' + esc(C.contact.tel) + '">Call ' + esc(C.contact.phone) + '</a></div>';
  }
  if (b.cue) h += '<p class="beat__cue"><span aria-hidden="true"></span>' + esc(b.cue) + '</p>';
  return h;
}

scenes.forEach((s) => {
  s.beats = (s.beats || []).map((raw) => {
    const b = Object.assign({ at: [0.4, 0.95] }, raw);
    b.fade = Math.max(0.001, Math.min(FADE / s.length, (b.at[1] - b.at[0]) / 4));
    b.el = document.createElement('article');
    b.el.className = 'beat beat--' + (b.align || 'left') + (b.hero ? ' beat--hero' : '');
    b.el.innerHTML = beatHTML(b);
    beatsRoot.appendChild(b.el);
    b.o = -1;
    b.y = 0;
    return b;
  });
});

function beatState(s, b, p) {
  const [a, z] = b.at;
  if (p < a || p > z) return [0, 0];
  const tin = a <= 0 && s.index === 0 ? 1 : clamp((p - a) / b.fade);
  const tout = z >= 1 && s.index === scenes.length - 1 ? 1 : clamp((z - p) / b.fade);
  const o = Math.min(tin, tout);
  const y = tin < 1 ? (1 - easeOut(tin)) * 42 : tout < 1 ? -(1 - easeOut(tout)) * 42 : 0;
  return [o, y];
}

const now = { i: -1, shown: [], l: -1, c: -1 };
function ui(s, p) {
  let l = 0;
  let c = 0;
  const shown = [];
  s.beats.forEach((b) => {
    const [o, y] = beatState(s, b, p);
    if (b.o !== o || b.y !== y) {
      b.o = o;
      b.y = y;
      b.el.style.setProperty('--o', o.toFixed(3));
      b.el.style.setProperty('--y', y.toFixed(1));
      b.el.classList.toggle('is-on', o > 0.02);
    }
    if (o > 0) shown.push(b);
    if (b.align === 'center') c = Math.max(c, o);
    else l = Math.max(l, o);
  });
  now.shown.forEach((b) => {
    if (!shown.includes(b)) {
      b.o = 0;
      b.el.style.setProperty('--o', '0');
      b.el.classList.remove('is-on');
    }
  });
  now.shown = shown;
  if (l !== now.l) stage.style.setProperty('--shade-l', (now.l = l).toFixed(3));
  if (c !== now.c) stage.style.setProperty('--shade-c', (now.c = c).toFixed(3));
}

/* ------------------------------------------------------------ scroll e pintura */
const metrics = { top: 0, dist: 1 };
let seenY = -1;
let want = true;
const stats = { paints: 0 };

function measure() {
  metrics.top = film.getBoundingClientRect().top + window.scrollY;
  metrics.dist = Math.max(1, film.offsetHeight - stage.offsetHeight);
  const w = canvas.clientWidth || stage.clientWidth;
  const h = canvas.clientHeight || stage.clientHeight;
  renderer.setSize(w, h, false);
  const pr = renderer.getPixelRatio();
  target.setSize(Math.round(w * pr), Math.round(h * pr));
  scenes.forEach((s) => frame(s, w / h));
  wake();
}

function paint() {
  const pos = clamp((window.scrollY - metrics.top) / metrics.dist) * total;
  let i = 0;
  while (i < scenes.length - 1 && pos >= scenes[i].start + scenes[i].length) i++;
  const s = scenes[i];
  const p = (pos - s.start) / s.length;
  if (i !== now.i) {
    now.i = i;
    loadAll();
  }
  ui(s, p);
  const next = scenes[i + 1];
  const into = next ? (pos - (next.start - OVERLAP)) / OVERLAP : -1; // 0 → 1 durante a fusão
  renderer.setRenderTarget(null);
  renderer.setClearColor(0x14110f, 1);
  renderer.clear();
  if (s.ready) {
    pose(s, p);
    const prev = scenes[i - 1];
    if (s.build && s.radius.value < 1e3 && prev && prev.ready) {
      // ainda se montando: o ambiente anterior continua por baixo do que ainda não apareceu
      pose(prev, 1);
      renderer.render(prev.scene, prev.camera);
      overlay(s, 1);
    } else {
      renderer.render(s.scene, s.camera);
    }
  }
  if (next && into > 0 && next.ready) {
    pose(next, (pos - next.start) / next.length);
    overlay(next, smooth(clamp(into)));
  }
  stats.paints++;
}

// Desenha um ambiente à parte e o põe por cima do que já está na tela (as partes que ainda não se
// montaram ficam transparentes)
function overlay(s, alpha) {
  renderer.setRenderTarget(target);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.render(s.scene, s.camera);
  renderer.setRenderTarget(null);
  quad.material.uniforms.alpha.value = alpha;
  renderer.render(quadScene, quadCam);
}

function wake() {
  want = true;
  if (window.NUVO_FRAME) window.NUVO_FRAME.request();
  else requestAnimationFrame(() => tick());
}

function tick() {
  if (!want && window.scrollY === seenY) return false;
  want = false;
  seenY = window.scrollY;
  paint();
  return false;
}

if (window.NUVO_FRAME) window.NUVO_FRAME.add(tick);
window.addEventListener('scroll', wake, { passive: true });
window.addEventListener('resize', measure);
measure();
loadAll();
// O resto da página mede a altura do filme ao carregar: agora ela mudou
window.dispatchEvent(new Event('resize'));

// Mesma interface do film.js (links do índice de ambientes)
function goTo(i) {
  const s = scenes[i];
  if (!s) return;
  const b = s.beats[s.beats.length - 1];
  const p = b ? Math.min(1, b.at[0] + b.fade * 1.5) : 0.6;
  const y = Math.round(metrics.top + ((s.start + s.length * p) / total) * metrics.dist);
  if (window.NUVO_SCROLL_TO) window.NUVO_SCROLL_TO(y);
  else window.scrollTo({ top: y, behavior: 'smooth' });
}
window.NUVO_FILM = {
  goTo,
  goToScene(id) {
    const s = scenes.find((x) => x.id === id);
    if (s) goTo(s.index);
  },
  scrollFor(id, p) {
    const s = scenes.find((x) => x.id === id);
    return s ? metrics.top + ((s.start + s.length * p) / total) * metrics.dist : null;
  },
  info() {
    return { mode: '3d', paints: stats.paints, ready: scenes.map((s) => s.ready), scene: now.i };
  },
};
