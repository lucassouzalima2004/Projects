/*
 * FreshFemme — cena térmica da capa.
 *
 * Um busto feminino em 3D (ray marching de SDF) visto por uma "câmera térmica":
 * começa quente (vermelho/amarelo), a mão borrifa o spray no pescoço e uma frente
 * gelada azul desce pelo corpo. Sem imagens: tudo é desenhado no shader, então
 * não aparece tom de pele, só temperatura.
 *
 * Uso: <div data-thermal data-temp-hot="38.4" data-temp-cold="31.2"> com um
 * <canvas data-thermal-canvas> dentro. O elemento recebe as classes
 * is-hot / is-spraying / is-cold e o evento "thermal:phase" a cada mudança de fase.
 */
(() => {
  const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

  const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform float uFront;   // raio da frente gelada (0..1.2)
uniform float uCold;    // quanto do frio ainda está na pele (0..1), cai no reaquecimento
uniform float uSpray;   // névoa do spray (0..1)
uniform float uYaw;
uniform float uPitch;
uniform float uBreath;
uniform float uFl;
uniform float uTargetY;

#define PI 3.14159265

// ---------- utilidades ----------
float hash(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
                 mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                 mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p){ float a = 0.5, s = 0.0; for(int i=0;i<4;i++){ s += a*noise(p); p *= 2.03; a *= 0.5; } return s; }
float noise2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash2(i), hash2(i+vec2(1,0)), f.x), mix(hash2(i+vec2(0,1)), hash2(i+vec2(1,1)), f.x), f.y); }

float smin(float a, float b, float k){ float h = max(k-abs(a-b), 0.0)/k; return min(a,b) - h*h*k*0.25; }
float smax(float a, float b, float k){ return -smin(-a, -b, k); }

float sdEllipsoid(vec3 p, vec3 r){ float k0 = length(p/r); float k1 = length(p/(r*r)); return k0*(k0-1.0)/k1; }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r){ vec3 pa = p-a, ba = b-a; float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0); return length(pa-ba*h) - r; }
float sdRoundCone(vec3 p, vec3 a, vec3 b, float r1, float r2){
  vec3 pa = p-a, ba = b-a; float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
  return length(pa-ba*h) - mix(r1, r2, h);
}
float sdCylinderY(vec3 p, float r, float h){ vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x,d.y),0.0) + length(max(d,0.0)); }

// ---------- a cena ----------
// materiais: 0 pele, 1 cabelo, 2 frasco, 3 roupa
const vec3 SPRAY_TARGET = vec3(0.034, 1.425, 0.03);
const vec3 BOTTLE_C     = vec3(0.176, 1.468, 0.1);
const float BOTTLE_A    = -0.32;
const vec3 NOZZLE       = vec3(0.142, 1.566, 0.1);

vec3 bottleLocal(vec3 p){
  vec3 q = p - BOTTLE_C;
  float c = cos(BOTTLE_A), s = sin(BOTTLE_A);
  return vec3(c*q.x - s*q.y, s*q.x + c*q.y, q.z);
}

float gTorso; float gArms; float gHead;

vec2 map(vec3 p){
  float br = uBreath;
  // cabeça: crânio + rosto afinando para o queixo
  float cran = sdEllipsoid(p - vec3(0.0, 1.603, -0.012), vec3(0.074, 0.094, 0.093));
  vec3 fp = p - vec3(0.0, 1.553, 0.028);
  fp.x *= 1.0 + max(0.0, -fp.y) * 3.2;
  float face = sdEllipsoid(fp, vec3(0.062, 0.083, 0.066));
  float head = smin(cran, face, 0.04);
  head = smin(head, sdCapsule(p, vec3(0.0, 1.585, 0.088), vec3(0.0, 1.553, 0.104), 0.011), 0.016); // nariz
  head = smax(head, -(length(p - vec3( 0.029, 1.595, 0.1)) - 0.012), 0.014);                         // olhos
  head = smax(head, -(length(p - vec3(-0.029, 1.595, 0.1)) - 0.012), 0.014);
  float ears = min(sdEllipsoid(p - vec3(0.074, 1.575, -0.01), vec3(0.012, 0.024, 0.016)),
                   sdEllipsoid(p - vec3(-0.074, 1.575, -0.01), vec3(0.012, 0.024, 0.016)));
  head = smin(head, ears, 0.01);

  // pescoço e trapézio
  float neck = sdRoundCone(p, vec3(0.0, 1.36, -0.022), vec3(0.0, 1.535, -0.018), 0.05, 0.041);
  float trapL = sdCapsule(p, vec3(-0.045, 1.405, -0.03), vec3(-0.158, 1.345, -0.018), 0.035);
  float trapR = sdCapsule(p, vec3( 0.045, 1.405, -0.03), vec3( 0.158, 1.345, -0.018), 0.035);

  // tronco
  float chest = sdEllipsoid(p - vec3(0.0, 1.225, -0.004), vec3(0.136, 0.165, 0.086 + br*0.003));
  float delL  = length(p - vec3(-0.172, 1.315, -0.008)) - 0.049;
  float delR  = length(p - vec3( 0.172, 1.315, -0.008)) - 0.049;
  float waist = sdEllipsoid(p - vec3(0.0, 1.03, -0.006), vec3(0.108, 0.16, 0.077));
  float hips  = sdEllipsoid(p - vec3(0.0, 0.85, -0.012), vec3(0.158, 0.14, 0.1));
  float bust  = smin(sdEllipsoid(p - vec3(-0.06, 1.185, 0.055 + br*0.002), vec3(0.056, 0.052, 0.046)),
                     sdEllipsoid(p - vec3( 0.06, 1.185, 0.055 + br*0.002), vec3(0.056, 0.052, 0.046)), 0.04);
  float torso = smin(chest, smin(trapL, trapR, 0.05), 0.06);
  torso = smin(torso, smin(delL, delR, 0.02), 0.045);
  torso = smin(torso, waist, 0.12);
  torso = smin(torso, hips, 0.1);
  torso = smin(torso, bust, 0.05);
  float body = smin(torso, neck, 0.05);

  // braço da esquerda (da tela) descansando
  float armL = sdRoundCone(p, vec3(-0.172, 1.302, -0.012), vec3(-0.176, 1.05, -0.04), 0.043, 0.032);
  armL = smin(armL, sdRoundCone(p, vec3(-0.176, 1.05, -0.04), vec3(-0.158, 0.81, 0.02), 0.031, 0.025), 0.025);

  // braço da direita levantado, mão fechada no frasco
  vec3 elbow = vec3(0.275, 1.11, 0.1);
  vec3 wrist = vec3(0.196, 1.392, 0.104);
  float armR = sdRoundCone(p, vec3(0.178, 1.302, -0.01), elbow, 0.043, 0.032);
  armR = smin(armR, sdRoundCone(p, elbow, wrist, 0.03, 0.023), 0.025);
  vec3 bq = bottleLocal(p);
  float fist = sdEllipsoid(bq - vec3(0.004, -0.036, 0.004), vec3(0.03, 0.04, 0.03));
  float fingers = sdCapsule(bq, vec3(-0.022, -0.05, 0.02), vec3(0.016, -0.05, 0.024), 0.0095);
  fingers = min(fingers, sdCapsule(bq, vec3(-0.022, -0.03, 0.021), vec3(0.016, -0.03, 0.025), 0.0095));
  fingers = min(fingers, sdCapsule(bq, vec3(-0.021, -0.011, 0.02), vec3(0.015, -0.011, 0.024), 0.009));
  float thumb = sdCapsule(bq, vec3(-0.024, -0.04, -0.004), vec3(-0.024, -0.006, 0.012), 0.009);
  float hand = smin(fist, min(fingers, thumb), 0.012);
  armR = smin(armR, hand, 0.03);

  gTorso = torso; gHead = head;
  float arms = min(armL, armR);
  gArms = arms;
  float skin = smin(body, head, 0.022);
  skin = smin(skin, arms, 0.02);

  // cabelo preso num coque, deixando o pescoço livre para o spray
  vec3 cp = p - vec3(0.0, 1.614, -0.018);
  float cap = sdEllipsoid(cp, vec3(0.085, 0.106, 0.104));
  cap = smax(cap, p.z - (0.022 + max(0.0, p.y - 1.628) * 1.25) + abs(p.x) * 0.25, 0.022);
  cap = smax(cap, -(p.y - 1.535 + p.z * 0.35), 0.02);
  float bun = sdEllipsoid(p - vec3(0.0, 1.6, -0.125), vec3(0.058, 0.054, 0.05));
  float hair = smin(cap, bun, 0.03);
  // rabo de cavalo caindo pela frente do ombro esquerdo (da tela)
  float tail = sdRoundCone(p, vec3(-0.06, 1.58, -0.07), vec3(-0.112, 1.42, 0.0), 0.034, 0.03);
  tail = smin(tail, sdRoundCone(p, vec3(-0.112, 1.42, 0.0), vec3(-0.098, 1.3, 0.07), 0.03, 0.024), 0.03);
  tail = smin(tail, sdRoundCone(p, vec3(-0.098, 1.3, 0.07), vec3(-0.075, 1.19, 0.095), 0.024, 0.008), 0.03);
  hair = smin(hair, tail, 0.03);
  hair += (noise(p * vec3(170.0, 40.0, 14.0)) - 0.5) * 0.0025;

  // frasco aerosol
  float bottle = sdCylinderY(bq, 0.0185, 0.064) - 0.0015;
  bottle = min(bottle, sdCylinderY(bq - vec3(0.0, 0.075, 0.0), 0.0135, 0.011) - 0.0015);
  bottle = min(bottle, sdCylinderY(bq - vec3(0.0, 0.092, 0.0), 0.006, 0.006));

  vec2 res = vec2(skin, 0.0);
  if (hair < res.x) res = vec2(hair, 1.0);
  if (bottle < res.x) res = vec2(bottle, 2.0);
  return res;
}

// quanto daquele ponto é roupa (borda suave)
float clothAmount(vec3 p){
  if (gTorso > min(gArms, gHead) + 0.006) return 0.0;
  float neckline = 1.292 - 0.062 * (1.0 - smoothstep(0.0, 0.11, abs(p.x)));
  return smoothstep(neckline + 0.008, neckline - 0.01, p.y);
}

vec3 calcNormal(vec3 p){
  const vec2 e = vec2(1.0, -1.0) * 0.0009;
  return normalize(e.xyy*map(p+e.xyy).x + e.yyx*map(p+e.yyx).x + e.yxy*map(p+e.yxy).x + e.xxx*map(p+e.xxx).x);
}

float calcAO(vec3 p, vec3 n){
  float occ = 0.0, sca = 1.0;
  for (int i = 0; i < 4; i++) {
    float h = 0.012 + 0.03 * float(i);
    occ += (h - map(p + n*h).x) * sca;
    sca *= 0.75;
  }
  return clamp(1.0 - 6.0*occ, 0.0, 1.0);
}

// paleta "ironbow" de câmera térmica, puxada para o vermelho
vec3 ironbow(float t){
  t = clamp(t, 0.0, 1.0);
  vec3 c = vec3(0.012, 0.006, 0.03);
  c = mix(c, vec3(0.16, 0.035, 0.30), smoothstep(0.0, 0.16, t));
  c = mix(c, vec3(0.47, 0.05, 0.43), smoothstep(0.16, 0.32, t));
  c = mix(c, vec3(0.78, 0.07, 0.30), smoothstep(0.32, 0.46, t));
  c = mix(c, vec3(0.95, 0.17, 0.11), smoothstep(0.46, 0.6, t));
  c = mix(c, vec3(1.0, 0.42, 0.05), smoothstep(0.6, 0.74, t));
  c = mix(c, vec3(1.0, 0.7, 0.12), smoothstep(0.74, 0.87, t));
  c = mix(c, vec3(1.0, 0.95, 0.68), smoothstep(0.87, 1.0, t));
  return c;
}
// paleta gelada
vec3 arctic(float t){
  t = clamp(t, 0.0, 1.0);
  vec3 c = vec3(0.004, 0.012, 0.05);
  c = mix(c, vec3(0.02, 0.12, 0.40), smoothstep(0.0, 0.3, t));
  c = mix(c, vec3(0.03, 0.42, 0.86), smoothstep(0.3, 0.56, t));
  c = mix(c, vec3(0.2, 0.82, 0.98), smoothstep(0.56, 0.8, t));
  c = mix(c, vec3(0.88, 1.0, 1.0), smoothstep(0.8, 1.0, t));
  return c;
}

vec2 project(vec3 P, vec3 ro, vec3 fw, vec3 rt, vec3 up, float fl){
  vec3 v = P - ro; float z = dot(v, fw);
  return vec2(dot(v, rt), dot(v, up)) * fl / z;
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5*uRes) / uRes.y;

  // câmera
  float dist = 2.6;
  vec3 ta = vec3(0.04, uTargetY, 0.0);
  vec3 ro = ta + dist * vec3(sin(uYaw)*cos(uPitch), sin(uPitch), cos(uYaw)*cos(uPitch));
  vec3 fw = normalize(ta - ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
  float fl = uFl;
  vec3 rd = normalize(uv.x*rt + uv.y*up + fl*fw);

  // esfera envolvente para descartar o fundo rápido
  vec3 bc = vec3(0.04, 1.25, 0.0); float brad = 0.6;
  vec3 oc = ro - bc; float bb = dot(oc, rd); float cc = dot(oc, oc) - brad*brad; float hdisc = bb*bb - cc;

  float t = 0.0; float hit = -1.0; float mat = 0.0; float minD = 1e3; float minY = 2.0;
  if (hdisc > 0.0) {
    float sq = sqrt(hdisc);
    t = max(-bb - sq, 0.0);
    float tmax = -bb + sq;
    for (int i = 0; i < 96; i++) {
      vec3 p = ro + rd*t;
      vec2 h = map(p);
      if (h.x < minD) { minD = h.x; minY = p.y; }
      if (h.x < 0.0009) { hit = t; mat = h.y; break; }
      t += h.x * 0.92;
      if (t > tmax) break;
    }
  }

  float frontOn = uCold * smoothstep(0.05, 0.5, uFront);
  float halo = exp(-max(minD, 0.0) * 20.0);
  vec3 col;
  float alpha;

  if (hit > 0.0) {
    vec3 p = ro + rd*hit;
    map(p);
    vec3 n = calcNormal(p);
    float ao = calcAO(p, n);
    float facing = clamp(dot(n, -rd), 0.0, 1.0);
    float cloth = mat < 0.5 ? clothAmount(p) : 0.0;

    float temp = 0.73;
    if (mat > 0.5 && mat < 1.5) temp = 0.4;        // cabelo isola, aparece mais frio
    else if (mat > 1.5) temp = 0.12;               // frasco frio
    temp = mix(temp, 0.61 + (noise(p * vec3(18.0, 46.0, 18.0)) - 0.5) * 0.06, cloth);
    // superfícies de lado emitem menos para a câmera
    temp *= mix(0.66, 1.0, pow(facing, 0.5));
    // dobras e cantos acumulam calor
    if (mat < 0.5) temp += (1.0 - ao) * 0.14;
    if (mat < 0.5) {
      vec3 q;
      q = p - vec3(0.0, 1.565, 0.06);  temp += 0.07 * exp(-dot(q, q) * 280.0) * (1.0 - cloth);
      q = p - vec3(0.0, 1.43, 0.02);   temp += 0.1  * exp(-dot(q, q) * 320.0);
      q = p - vec3(0.0, 1.28, 0.07);   temp += 0.06 * exp(-dot(q, q) * 140.0) * (1.0 - cloth);
      q = vec3(abs(p.x) - 0.02, p.y - 1.594, p.z - 0.09); temp += 0.06 * exp(-dot(q, q) * 5000.0);
      q = p - vec3(0.0, 1.548, 0.11); temp -= 0.035 * exp(-dot(q, q) * 3000.0);
    }
    // manchas orgânicas e tremulação do calor
    temp += (fbm(p*9.0 + vec3(0.0, uTime*0.12, 0.0)) - 0.5) * 0.08;
    temp += 0.016 * sin(uTime*3.1 + p.y*38.0) * (1.0 - frontOn);

    // frente gelada partindo do ponto do spray, descendo mais rápido que subindo
    float cold = 0.0, edge = 0.0;
    if (mat < 0.5 || mat > 1.5) {
      vec3 d = p - SPRAY_TARGET;
      float k = d.y < 0.0 ? 0.6 : 2.7;
      float dd = length(vec3(d.x*1.05, d.y*k, d.z));
      float nn = (fbm(p*12.0 + vec3(0.0, uTime*0.5, 0.0)) - 0.5) * 0.14;
      float r = uFront;
      cold = (1.0 - smoothstep(r - 0.06, r + 0.012, dd + nn)) * uCold;
      edge = exp(-pow((dd + nn - r) / 0.018, 2.0)) * smoothstep(0.0, 0.04, r) * uCold;
      if (mat > 1.5) cold = 0.0;
    } else {
      cold = uCold * smoothstep(0.4, 0.8, uFront) * 0.7;
    }
    float impact = exp(-dot(p - SPRAY_TARGET, p - SPRAY_TARGET) * 1100.0) * uSpray;

    // isotermas: linhas finas de mesma temperatura, seguem o volume do corpo
    float iso = fract(temp * 14.0);
    float isoLine = smoothstep(0.08, 0.0, min(iso, 1.0 - iso)) * step(mat, 0.5) * 0.16 * smoothstep(1.45, 1.4, p.y);
    vec3 hotCol = ironbow(temp) * (1.0 + isoLine);
    float ct = clamp(0.3 + (temp - 0.4) * 1.25 + facing * 0.18, 0.0, 1.0);
    vec3 coldCol = arctic(ct) * (1.0 + isoLine * 0.8);
    col = mix(hotCol, coldCol, cold);
    float sparkle = step(0.94, hash(floor(p * 420.0) + floor(uTime * 8.0)));
    col += vec3(0.6, 0.95, 1.0) * edge * (0.55 + sparkle * 0.9);
    col += vec3(0.75, 1.0, 1.0) * impact * 0.8;
    // borda fria (rim) que dá volume no estado gelado
    col += vec3(0.5, 0.9, 1.0) * pow(1.0 - facing, 3.0) * cold * 0.35 * smoothstep(1.5, 1.44, p.y);
    // o quadril se dissolve no fundo em vez de terminar num corte
    alpha = smoothstep(0.74, 0.95, p.y);
  } else {
    float bgT = 0.03 + fbm(vec3(uv*3.0, uTime*0.05)) * 0.05;
    vec3 hotHalo = ironbow(bgT + halo * 0.3);
    vec3 coldHalo = arctic(bgT * 2.0 + halo * 0.42);
    col = mix(hotHalo, coldHalo, frontOn * 0.85);
    alpha = clamp(halo * 0.95, 0.0, 1.0) * smoothstep(0.74, 0.95, minY);
  }

  // névoa do spray em espaço de tela
  if (uSpray > 0.001) {
    vec2 A = project(NOZZLE, ro, fw, rt, up, fl);
    vec2 B = project(SPRAY_TARGET + vec3(0.0, 0.0, 0.025), ro, fw, rt, up, fl);
    vec2 ab = B - A; float L2 = dot(ab, ab);
    float h = dot(uv - A, ab) / L2;
    vec2 perp = uv - (A + ab*clamp(h, 0.0, 1.3));
    float w = mix(0.003, 0.045, clamp(h, 0.0, 1.3));
    float cone = smoothstep(w, 0.0, length(perp)) * smoothstep(-0.02, 0.08, h) * smoothstep(1.4, 0.75, h);
    float stream = noise2(vec2(h*10.0 - uTime*16.0, length(perp)*110.0));
    float drops = step(0.982, hash2(floor((uv + vec2(uTime*0.4, -uTime*0.12))*380.0))) * smoothstep(w*1.6, 0.0, length(perp)) * 2.0;
    float m = (cone * (0.3 + 0.95*stream) + drops) * uSpray;
    col = mix(col, vec3(0.8, 0.98, 1.0), clamp(m, 0.0, 1.0) * 0.9);
    alpha = max(alpha, clamp(m, 0.0, 1.0));
  }

  // linhas de varredura e granulação de sensor
  float scan = 0.95 + 0.05 * sin(frag.y * 1.7 + uTime * 6.0);
  float grain = (hash2(frag + fract(uTime) * 91.7) - 0.5) * 0.045;
  col = col * scan + grain * alpha;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * alpha, alpha);
}
`;

  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const seg = (t, a, b) => clamp01((t - a) / (b - a));

  // linha do tempo de um ciclo (segundos)
  const T = { spray: 1.6, front: 2.15, frontEnd: 7.4, hold: 10, rewarm: 11.6, loop: 12.4 };
  const FRONT_MAX = 0.82;

  function sample(t) {
    const spray = t > T.spray && t < T.spray + 1.6 ? Math.sin(seg(t, T.spray, T.spray + 1.6) * Math.PI) : 0;
    const fx = seg(t, T.front, T.frontEnd);
    const front = (fx < 0.5 ? 2 * fx * fx : 1 - Math.pow(-2 * fx + 2, 2) / 2) * 0.35 * FRONT_MAX + (1 - Math.pow(1 - fx, 2)) * 0.65 * FRONT_MAX;
    const cold = t < T.hold ? (t > T.front ? 1 : 0) : 1 - easeInOut(seg(t, T.hold, T.rewarm));
    let phase = 'hot';
    if (t >= T.spray && t < T.front + 0.5) phase = 'spraying';
    else if (t >= T.front + 0.5 && t < T.hold) phase = 'cold';
    else if (t >= T.hold && t < T.rewarm) phase = 'rewarm';
    // temperatura mostrada no visor: 0 = quente, 1 = gelado
    const coolness = t < T.front ? 0 : t < T.hold ? easeOut(seg(t, T.front, T.frontEnd)) : cold;
    return { spray, front, cold, phase, coolness };
  }

  class ThermalScene {
    constructor(root) {
      this.root = root;
      this.canvas = root.querySelector('[data-thermal-canvas]');
      this.readout = root.querySelector('[data-thermal-temp]');
      this.bar = root.querySelector('[data-thermal-bar]');
      this.hot = parseFloat(root.dataset.tempHot || '38.4');
      this.coldTemp = parseFloat(root.dataset.tempCold || '31.2');
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      this.quality = 1;
      this.visible = true;
      this.phase = '';
      this.start = performance.now();
      if (!this.init()) {
        root.classList.add('thermal--fallback');
        return;
      }
      root.classList.add('thermal--ready');
      this.bind();
      this.resize();
      this.frame = this.frame.bind(this);
      if (this.reduced) {
        this.renderAt(T.frontEnd + 1, T.frontEnd + 1);
      } else {
        requestAnimationFrame(this.frame);
      }
    }

    init() {
      const gl = this.canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: 'high-performance' });
      if (!gl) return false;
      this.gl = gl;
      const compile = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          console.warn('[thermal]', gl.getShaderInfoLog(s));
          return null;
        }
        return s;
      };
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'aPos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      this.u = {};
      ['uRes', 'uTime', 'uFront', 'uCold', 'uSpray', 'uYaw', 'uPitch', 'uBreath', 'uFl', 'uTargetY'].forEach((n) => {
        this.u[n] = gl.getUniformLocation(prog, n);
      });
      gl.clearColor(0, 0, 0, 0);
      return true;
    }

    bind() {
      this.onResize = () => this.resize();
      window.addEventListener('resize', this.onResize, { passive: true });
      if (!this.reduced) {
        this.root.addEventListener('pointermove', (e) => {
          const r = this.root.getBoundingClientRect();
          this.pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
          this.pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        }, { passive: true });
        this.root.addEventListener('pointerleave', () => { this.pointer.tx = 0; this.pointer.ty = 0; });
      }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            const was = this.visible;
            this.visible = en.isIntersecting;
            if (this.visible && !was && !this.reduced) requestAnimationFrame(this.frame);
          });
        }).observe(this.root);
      }
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.visible && !this.reduced) requestAnimationFrame(this.frame);
      });
      // o slider da capa pede para recomeçar do calor sempre que volta para este slide
      this.root.addEventListener('thermal:restart', () => {
        if (this.reduced) return;
        this.start = performance.now();
        this.renderAt(0, 0);
      });
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const aspect = rect.width / rect.height;
      // enquadramento: da cintura até um respiro acima da cabeça, sem cortar o braço levantado.
      // No computador o corpo fica na coluna central (40% da largura), então afastamos a câmera
      // quando a tela é mais "quadrada" para ele não invadir o texto.
      const vw = window.innerWidth;
      const fit = vw >= 1200 ? 0.75 : vw >= 990 ? 0.92 : 0.4;
      const halfH = Math.max(0.5, fit / aspect);
      this.fl = (2.6 * 0.5) / halfH;
      this.targetY = 1.34 - (halfH - 0.5) * 0.35;
      // a câmera térmica real tem baixa resolução; renderizar menor deixa leve e dá o visual certo
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let scale = dpr * 0.45 * this.quality;
      const maxPixels = 560000 * this.quality;
      if (rect.width * rect.height * scale * scale > maxPixels) scale = Math.sqrt(maxPixels / (rect.width * rect.height));
      const w = Math.max(2, Math.round(rect.width * scale));
      const h = Math.max(2, Math.round(rect.height * scale));
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
      }
      this.gl.viewport(0, 0, w, h);
      if (this.reduced) this.renderAt(T.frontEnd + 1, T.frontEnd + 1);
    }

    setPhase(phase) {
      if (phase === this.phase) return;
      this.root.classList.remove('is-' + this.phase);
      this.phase = phase;
      this.root.classList.add('is-' + phase);
      this.root.dispatchEvent(new CustomEvent('thermal:phase', { detail: { phase } }));
    }

    renderAt(t, elapsed) {
      const gl = this.gl;
      const s = sample(t);
      const p = this.pointer;
      p.x += (p.tx - p.x) * 0.05;
      p.y += (p.ty - p.y) * 0.05;
      const yaw = -0.3 + Math.sin(elapsed * 0.23) * 0.07 + p.x * 0.24;
      const pitch = 0.04 + p.y * -0.05;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(this.u.uRes, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.u.uTime, elapsed);
      gl.uniform1f(this.u.uFront, s.front);
      gl.uniform1f(this.u.uCold, s.cold);
      gl.uniform1f(this.u.uSpray, s.spray);
      gl.uniform1f(this.u.uYaw, yaw);
      gl.uniform1f(this.u.uPitch, pitch);
      gl.uniform1f(this.u.uBreath, Math.sin(elapsed * 1.6));
      gl.uniform1f(this.u.uFl, this.fl);
      gl.uniform1f(this.u.uTargetY, this.targetY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      this.setPhase(s.phase);
      const temp = this.hot + (this.coldTemp - this.hot) * s.coolness + (s.coolness < 0.02 ? Math.sin(elapsed * 2.3) * 0.08 : 0);
      if (this.readout) this.readout.textContent = temp.toFixed(1).replace('.', ',');
      if (this.bar) this.bar.style.setProperty('--level', (1 - s.coolness).toFixed(3));
      this.root.style.setProperty('--coolness', s.coolness.toFixed(3));
    }

    // mede o intervalo entre quadros desenhados: se a GPU não acompanha, o intervalo cresce.
    // Primeiro baixa a resolução interna; se nem assim der, troca pela imagem estática.
    adapt(dt) {
      if (dt > 400) return; // aba voltou do segundo plano, ignora
      this.frames = (this.frames || 0) + 1;
      this.acc = (this.acc || 0) + dt;
      if (this.frames < 24) return;
      const avg = this.acc / this.frames;
      this.frames = 0;
      this.acc = 0;
      if (avg > 52 && this.quality > 0.45) {
        this.quality = Math.max(0.45, this.quality * 0.75);
        this.resize();
      } else if (avg > 110) {
        this.stop = true;
        this.root.classList.remove('thermal--ready');
        this.root.classList.add('thermal--fallback');
      }
    }

    frame(now) {
      // seção removida no editor de temas: para de desenhar
      if (!this.root.isConnected) this.stop = true;
      if (this.stop || !this.visible || document.hidden) {
        this.lastDraw = 0;
        return;
      }
      requestAnimationFrame(this.frame);
      // a cena é lenta por natureza: 30 quadros por segundo bastam e poupam bateria
      if (this.lastDraw && now - this.lastDraw < 31) return;
      if (this.lastDraw) this.adapt(now - this.lastDraw);
      this.lastDraw = now;
      const elapsed = (now - this.start) / 1000;
      this.renderAt(elapsed % T.loop, elapsed);
    }
  }

  // permite que o preview/screenshot congele um instante: window.__thermalAt(seconds)
  window.__thermalScenes = [];
  window.__thermalAt = (t) => window.__thermalScenes.forEach((s) => { s.visible = false; s.renderAt(t, t); });

  const boot = () => {
    document.querySelectorAll('[data-thermal]:not(.thermal--ready):not(.thermal--fallback)').forEach((el) => {
      window.__thermalScenes.push(new ThermalScene(el));
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('shopify:section:load', boot);
})();
