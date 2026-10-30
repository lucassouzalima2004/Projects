/* Home hero scene: the chameleon in 3D with task cards floating behind him.
   The chameleon is the campaign artwork on a dense mesh pushed forward by its depth map (WebGL, no library),
   lit by the neon and turned toward the pointer. The cards, the neon ring and the glow are HTML layers behind him
   that move the other way, so the scene has depth. Every movement runs on springs, so it eases in and out the same
   at any frame rate. Without WebGL (or a graphics card) the flat artwork stays; with reduced motion nothing moves. */
(() => {
  const scene = document.querySelector('[data-camp]');
  if (!scene) return;
  const back = scene.querySelector('[data-camp-back]');
  const glow = scene.querySelector('[data-camp-glow]');
  const canvas = scene.querySelector('[data-cham3d]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- input: pointer, phone tilt, touch drag, scroll ---------- */

  const touchOnly = matchMedia('(hover: none)').matches;
  const input = { x: 0, y: 0, last: -1e9 };
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    input.x = clamp((e.clientX / innerWidth - 0.5) * 2, -1, 1);
    input.y = clamp((e.clientY / innerHeight - 0.5) * 2, -1, 1);
    input.last = performance.now();
  }, { passive: true });
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    input.x = clamp(e.gamma / 25, -1, 1);
    input.y = clamp((e.beta - 45) / 30, -1, 1);
    input.last = performance.now();
  }, { passive: true });

  // On a phone, drag sideways across him to turn him (vertical swipes still scroll the page); a tap makes him hop
  const drag = { on: false, id: 0, x0: 0, y0: 0, x: 0, moved: false };
  scene.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    Object.assign(drag, { on: true, id: e.pointerId, x0: e.clientX, y0: e.clientY, x: 0, moved: false });
  });
  scene.addEventListener('pointermove', (e) => {
    if (!drag.on || e.pointerId !== drag.id) return;
    drag.x = clamp((e.clientX - drag.x0) / (scene.clientWidth * 0.35), -1.2, 1.2);
    if (Math.abs(e.clientX - drag.x0) > 8) drag.moved = true;
  });
  const release = (e) => {
    if (!drag.on || e.pointerId !== drag.id) return;
    drag.on = false;
    if (!drag.moved) { hop.v -= 2.2; lookX.v += (Math.random() < 0.5 ? -1 : 1) * 6; }
    else lookX.v += drag.x * 4;  // let go: he swings back with a little wobble
    input.last = performance.now() - 1500;
  };
  scene.addEventListener('pointerup', release);
  scene.addEventListener('pointercancel', release);

  // Springs: the look settles without wobble, the hop is bouncy
  const spring = (stiffness, damping) => ({
    x: 0, v: 0,
    step(target, dt) { this.v += ((target - this.x) * stiffness - this.v * damping) * dt; this.x += this.v * dt; return this.x; },
  });
  const lookX = spring(26, 9.5);
  const lookY = spring(26, 9.5);
  const scrollS = spring(30, 11);
  const hop = spring(70, 7);

  // While nobody moves the pointer he looks around on his own: a new glance every few seconds
  const glance = { x: 0, y: 0, next: 0 };
  const lookAround = (t) => {
    if (t < glance.next) return;
    glance.x = (Math.random() * 2 - 1) * (touchOnly ? 1 : 0.8);
    glance.y = (Math.random() * 2 - 1) * 0.45;
    glance.next = t + 1.8 + Math.random() * 2.4;
  };
  // The Signage card shatters: he hops and turns to look at it
  const cheer = () => { hop.v -= 1.8; glance.x = 0.9; glance.y = -0.5; glance.next = performance.now() / 1000 + 1.6; };

  /* ---------- cards: each one floats on its own ---------- */

  const rnd = (seed) => { const v = Math.sin(seed * 9301 + 49297) * 233280; return v - Math.floor(v); };
  const cards = [...scene.querySelectorAll('.card')].map((el, i) => {
    const r = (k) => rnd(i * 13 + k);
    return {
      el,
      inner: el.querySelector('.card__in'),
      sign: el.classList.contains('card--sign'),
      // further back = moves less with the pointer
      depth: clamp(-parseFloat(getComputedStyle(el).getPropertyValue('--z')) / 130, 0.3, 1.2),
      f: [0.55 + r(1) * 0.35, 0.21 + r(2) * 0.15, 0.62 + r(3) * 0.3, 0.26 + r(4) * 0.14, 0.4 + r(5) * 0.3, 0.5 + r(6) * 0.3, 0.45 + r(7) * 0.3],
      p: Array.from({ length: 7 }, (_, k) => r(10 + k) * Math.PI * 2),
      fx: 0,
      fy: 0,
    };
  });

  let unit = 6; // one "float unit" in px, from the scene size
  const measure = () => { unit = scene.clientWidth / 110; };
  measure();
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(scene);

  /* ---------- loop ---------- */

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(scene);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

  const gl3d = !reduce && canvas ? setupGL(canvas) : null;
  const shards = reduce ? null : setupShards(scene.querySelector('[data-shards]'), cards.find((c) => c.sign), cheer);

  let running = false;
  let started = false;
  let prev = 0;
  const t0 = performance.now();
  function frame(now) {
    if (!visible || document.hidden) { running = false; return; }
    const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 1 / 60;
    prev = now;
    const t = (now - t0) / 1000;

    // Pointer (or finger) while it is moving; after a few quiet seconds he looks around by himself, blended in
    lookAround(now / 1000);
    const idle = drag.on ? 0 : clamp((now - input.last - 2500) / 1500, 0, 1);
    const sway = touchOnly ? 0.22 : 0.12;
    const ax = glance.x + Math.sin(t * 0.7) * sway, ay = glance.y + Math.sin(t * 0.9 + 1) * sway * 0.6;
    const ix = drag.on ? drag.x : input.x * (1 - idle) + ax * idle;
    const iy = drag.on ? 0 : input.y * (1 - idle) + ay * idle;
    const x = lookX.step(ix, dt);
    const y = lookY.step(iy, dt);
    const s = scrollS.step(clamp(scrollY / innerHeight, 0, 1), dt);
    const h = hop.step(0, dt);

    // He leans toward the pointer; the layer behind him (ring, cards) drifts the other way and tilts; the glow drifts least
    back.style.transform = `perspective(1400px) translate3d(${(-x * 1.3 * unit).toFixed(2)}px, ${(-y * 1.1 * unit + s * 4 * unit).toFixed(2)}px, 0) rotateX(${(-y * 5 - s * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
    glow.style.transform = `translate3d(${(-x * 1.2 * unit).toFixed(2)}px, ${(-y * 0.8 * unit).toFixed(2)}px, 0) scale(${(1 + Math.sin(t * 1.3) * 0.04 - h * 0.15).toFixed(3)})`;

    for (const c of cards) {
      const { f, p } = c;
      const fx = (Math.sin(t * f[0] + p[0]) * 0.6 + Math.sin(t * f[1] + p[1]) * 0.4) * unit * 0.9;
      const fy = (Math.sin(t * f[2] + p[2]) * 0.6 + Math.sin(t * f[3] + p[3]) * 0.4) * unit * 1.3;
      const rz = Math.sin(t * f[4] + p[4]) * 2.2 + (c.sign ? -12 : 0);
      const rx = Math.sin(t * f[5] + p[5]) * 7 - y * 4;
      const ry = Math.cos(t * f[6] + p[6]) * 9 + x * 6;
      const px = -x * unit * 0.8 * (1.3 - c.depth);
      const py = -y * unit * 0.7 * (1.3 - c.depth);
      c.fx = fx + px;
      c.fy = fy + py;
      c.inner.style.transform = `translate3d(${c.fx.toFixed(2)}px, ${c.fy.toFixed(2)}px, 0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
      c.inner.style.setProperty('--glare', (0.5 + ry / 30).toFixed(3));
    }

    if (shards) shards.step(t, x, y);
    if (gl3d) gl3d.draw(t, x, y, s, h, lookX.v);
    requestAnimationFrame(frame);
  }
  function kick() {
    if (reduce || running || !started) return;
    running = true;
    prev = 0;
    requestAnimationFrame(frame);
  }
  // Motion starts once the page has loaded, so it never competes with the first paint
  const go = () => setTimeout(() => { started = true; kick(); }, 150);
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });

  /* ---------- WebGL chameleon ---------- */

  function setupGL(cv) {
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) return null;
    // Without a graphics card (software rendering) every frame would load the processor: keep the flat artwork
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    if (/swiftshader|llvmpipe|software|softpipe/i.test(renderer)) return null;
    let ready = false;
    let count = 0;
    let aspect = 1;
    const prog = program(gl, `
      attribute vec3 aPos; attribute vec3 aNormal; attribute vec2 aUv;
      uniform mat4 uProj, uModel;
      varying vec2 vUv; varying vec3 vN;
      void main() {
        vUv = aUv;
        vN = mat3(uModel) * aNormal;
        gl_Position = uProj * uModel * vec4(aPos, 1.0);
      }`, `
      precision mediump float;
      uniform sampler2D uTex; uniform vec3 uLight;
      varying vec2 vUv; varying vec3 vN;
      void main() {
        vec4 c = texture2D(uTex, vUv);
        if (c.a < 0.03) discard;
        vec3 n = normalize(vN);
        vec3 l = normalize(uLight);
        float diff = max(dot(n, l), 0.0);
        float rim = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.2);
        float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 28.0);
        vec3 col = c.rgb * (0.86 + 0.26 * diff);
        col += vec3(1.0, 0.22, 0.62) * rim * 0.32;                 // pink neon on the edges
        col += vec3(0.75, 0.55, 1.0) * spec * 0.35;                // sheen that slides over skin and glasses
        float a = c.a * smoothstep(1.0, 0.8, vUv.y);               // he fades out where the artwork is cut
        gl_FragColor = vec4(col * a, a);
      }`);
    if (!prog) return null;
    const loc = (n) => gl.getUniformLocation(prog, n);
    const u = { proj: loc('uProj'), model: loc('uModel'), tex: loc('uTex'), light: loc('uLight') };

    const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
    Promise.all([load(cv.dataset.color), load(cv.dataset.depth)]).then(([color, depth]) => {
      aspect = color.width / color.height;
      buildMesh(depth);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, color);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ready = true;
      kick();
    }).catch(() => {});

    function buildMesh(depthImg) {
      const dc = document.createElement('canvas');
      dc.width = depthImg.width; dc.height = depthImg.height;
      const ctx = dc.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(depthImg, 0, 0);
      const px = ctx.getImageData(0, 0, dc.width, dc.height).data;
      const dw = dc.width, dh = dc.height;
      const at = (x, y) => px[(Math.min(dh - 1, Math.max(0, y)) * dw + Math.min(dw - 1, Math.max(0, x))) * 4] / 255;
      const sample = (uu, vv) => {  // bilinear
        const x = uu * (dw - 1), y = vv * (dh - 1);
        const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
        const a = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx;
        const b = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx;
        return a * (1 - fy) + b * fy;
      };
      const cols = 110, rows = Math.round(cols / aspect);
      const DEPTH = 0.2;
      const n = (cols + 1) * (rows + 1);
      const pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), nor = new Float32Array(n * 3);
      const z = new Float32Array(n);
      for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
          const k = j * (cols + 1) + i, uu = i / cols, vv = j / rows;
          z[k] = sample(uu, vv) * DEPTH;
          pos.set([(uu - 0.5) * aspect, 0.5 - vv, z[k] - DEPTH * 0.55], k * 3);
          uv.set([uu, vv], k * 2);
        }
      }
      const sx = aspect / cols, sy = 1 / rows;
      for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
          const k = j * (cols + 1) + i;
          const zl = z[j * (cols + 1) + Math.max(0, i - 1)], zr = z[j * (cols + 1) + Math.min(cols, i + 1)];
          const zu = z[Math.max(0, j - 1) * (cols + 1) + i], zd = z[Math.min(rows, j + 1) * (cols + 1) + i];
          const nx = -(zr - zl) / (2 * sx), ny = (zd - zu) / (2 * sy), len = Math.hypot(nx, ny, 1);
          nor.set([nx / len, ny / len, 1 / len], k * 3);
        }
      }
      const idx = new Uint16Array(cols * rows * 6);
      let p = 0;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1;
          idx.set([a, c, b, b, c, d], p); p += 6;
        }
      }
      count = idx.length;
      const buf = (data, name, size) => {
        const b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        const l = gl.getAttribLocation(prog, name);
        gl.enableVertexAttribArray(l);
        gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0);
      };
      gl.useProgram(prog);
      buf(pos, 'aPos', 3); buf(nor, 'aNormal', 3); buf(uv, 'aUv', 2);
      const ib = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    }

    let shown = false;
    return {
      draw(t, lx, ly, ls, hp, vx) {
        if (!ready) return;
        const dpr = Math.min(devicePixelRatio || 1, 1.75);
        const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
        if (!w || !h) return;
        if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
        gl.viewport(0, 0, w, h);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(prog);
        // Same framing as the flat artwork: 94% of the canvas height, standing on its bottom edge
        const fov = 0.5, view = 1 / 0.94, dist = view / (2 * Math.tan(fov / 2));
        gl.uniformMatrix4fv(u.proj, false, perspective(fov, w / h, 0.1, 10));
        const yaw = lx * (touchOnly ? 0.3 : 0.21) + Math.sin(t * 0.5) * 0.02 + ls * (touchOnly ? 0.35 : 0);
        const pitch = ly * 0.1 + ls * 0.12;
        const lean = clamp(-vx * 0.025, -0.12, 0.12);           // leans into a quick turn
        const breathe = 1 + Math.sin(t * 1.6) * (touchOnly ? 0.012 : 0.007);
        const squash = clamp(1 - hp * 0.25, 0.94, 1.06);        // stretches going up (hp < 0), squashes landing
        const tx = lx * 0.008;
        const ty = 0.5 - view / 2 + Math.sin(t * 0.85) * 0.007 - ly * 0.008 - Math.min(0, hp) * 0.22;
        const model = multiply(translate(tx, ty, -dist), multiply(rotY(yaw), multiply(rotX(pitch), multiply(rotZ(lean), scale(1 / Math.sqrt(squash), breathe * squash, 1)))));
        gl.uniformMatrix4fv(u.model, false, model);
        gl.uniform3f(u.light, -0.6 + lx * 0.9, 0.5 - ly * 0.4, 0.8);
        gl.uniform1i(u.tex, 0);
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
        if (!shown) { shown = true; scene.classList.add('is-3d'); }
      },
    };
  }

  function program(gl, vs, fs) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }
  // column-major 4x4 matrices
  function perspective(fovy, asp, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([f / asp, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
  }
  function multiply(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
    return o;
  }
  function translate(x, y, z) { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); }
  function scale(x, y, z) { return new Float32Array([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]); }
  function rotY(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }
  function rotZ(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
  function rotX(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }

  /* ---------- the Signage card breaks into shards, then puts itself back together ---------- */

  // The shard canvas sits in the same layer as the cards, so the card's place comes from layout, measured on resize only
  function setupShards(cv, sign, onBreak) {
    if (!cv || !sign) return null;
    const ctx = cv.getContext('2d');
    const colors = ['#ff5fa9', '#f62584', '#ffffff', '#b98cff', '#8a3be0'];
    const parts = Array.from({ length: 64 }, (_, i) => ({
      // start somewhere on the card, drift to the right (a little up or down)
      sx: Math.random(), sy: Math.random(),
      dx: 0.6 + Math.random() * 1.3, dy: -0.4 + Math.random() * 0.65,
      rot: Math.random() * 6, spin: (Math.random() - 0.5) * 8,
      size: 3 + Math.random() * 6, color: colors[i % colors.length], delay: Math.random() * 0.35,
    }));
    // neon dust rising slowly behind him
    const dust = Array.from({ length: 34 }, () => ({ x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 1.6, v: 0.012 + Math.random() * 0.03, tw: Math.random() * 6, c: colors[Math.floor(Math.random() * colors.length)] }));
    const CYCLE = 7;
    let lastPhase = 0;
    let box = { x: 0, y: 0, w: 0, h: 0 };
    const place = () => {
      const el = sign.el;
      box = { x: el.offsetLeft - el.offsetWidth / 2 - cv.offsetLeft, y: el.offsetTop - el.offsetHeight / 2 - cv.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
    };
    place();
    if ('ResizeObserver' in window) new ResizeObserver(place).observe(scene);
    return {
      step(t, lx, ly) {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
        if (!w || !h) return;
        if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; place(); }
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        for (const d of dust) {
          const yy = ((d.y - t * d.v) % 1 + 1) % 1;
          const a = Math.sin(t * 1.5 + d.tw) * 0.35 + 0.45;
          ctx.globalAlpha = a * Math.min(1, yy * 4) * Math.min(1, (1 - yy) * 4);
          ctx.fillStyle = d.c;
          ctx.beginPath();
          ctx.arc((d.x * w) - lx * 8 * dpr * d.s, yy * h - ly * 6 * dpr * d.s, d.s * dpr * 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        const cx = (box.x + sign.fx) * dpr, cy = (box.y + sign.fy) * dpr, cw = box.w * dpr, ch = box.h * dpr;
        const phase = (t % CYCLE) / CYCLE;
        if (lastPhase < 0.35 && phase >= 0.35 && onBreak) onBreak();
        lastPhase = phase;
        // 0–.35 whole card · .35–.6 breaks away to the right · .6–.85 gone, shards drift · .85–1 flies back together
        let k;
        if (phase < 0.35) k = 0;
        else if (phase < 0.85) k = (phase - 0.35) / 0.5;
        else k = 1 - (phase - 0.85) / 0.15;
        let op = 1;
        if (phase >= 0.35 && phase < 0.47) op = 1 - (phase - 0.35) / 0.12;
        else if (phase >= 0.47 && phase < 0.88) op = 0;
        else if (phase >= 0.88 && phase < 0.98) op = (phase - 0.88) / 0.1;
        sign.el.style.opacity = op.toFixed(3);
        // a few shards always trail off the right edge, like the campaign image
        for (const p of parts) {
          const kk = clamp((k - p.delay) / (1 - p.delay), 0, 1);
          const e = 1 - Math.pow(1 - kk, 3);
          const trail = (t * 0.25 + p.sx) % 1;
          const trailing = k === 0 && p.sy > 0.6;
          const x = cx + p.sx * cw + e * p.dx * cw * 1.3 + (trailing ? trail * cw * 0.5 : 0);
          const y = cy + p.sy * ch + e * p.dy * ch * 1.8 - (trailing ? trail * ch * 0.6 : 0);
          const alpha = k === 0 ? (trailing && p.sx > 0.7 ? (1 - trail) * 0.8 : 0) : (1 - kk * 0.55);
          if (alpha <= 0.01) continue;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(x, y);
          ctx.rotate(p.rot + p.spin * e);
          ctx.fillStyle = p.color;
          const sz = p.size * dpr;
          ctx.beginPath(); ctx.moveTo(-sz, -sz * 0.6); ctx.lineTo(sz, -sz * 0.2); ctx.lineTo(-sz * 0.2, sz); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
      },
    };
  }
})();
