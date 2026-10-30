/* Home campaign panel: the chameleon in 3D and the floating task cards.
   The chameleon is the campaign artwork on a dense mesh pushed forward by its depth map (WebGL, no library),
   lit by the neon and turned a little toward the pointer. The cards are HTML in a CSS 3D space that turns with it.
   Without WebGL, or with reduced motion, the flat artwork and still cards stay. */
(() => {
  const camp = document.querySelector('[data-camp]');
  if (!camp) return;
  const stage = camp.querySelector('[data-camp-stage]');
  const canvas = camp.querySelector('[data-cham3d]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // Pointer (or phone tilt) → where the scene looks, shared by the cards and the chameleon
  const look = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    look.tx = clamp((e.clientX / innerWidth - 0.5) * 2, -1, 1);
    look.ty = clamp((e.clientY / innerHeight - 0.5) * 2, -1, 1);
    look.active = true;
  }, { passive: true });
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    look.tx = clamp(e.gamma / 25, -1, 1);
    look.ty = clamp((e.beta - 45) / 30, -1, 1);
    look.active = true;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(camp);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

  const gl3d = !reduce && canvas ? setupGL(canvas) : null;
  const shards = reduce ? null : setupShards(camp.querySelector('[data-shards]'), camp.querySelector('.card--sign'));

  let running = false;
  let started = false;
  const t0 = performance.now();
  function frame(now) {
    if (!visible || document.hidden) { running = false; return; }
    const t = (now - t0) / 1000;
    // without a pointer the scene sways on its own
    const ix = look.active ? look.tx : Math.sin(t * 0.35) * 0.55;
    const iy = look.active ? look.ty : Math.sin(t * 0.27 + 1) * 0.3;
    look.x += (ix - look.x) * 0.06;
    look.y += (iy - look.y) * 0.06;
    if (shards) shards.step(t);  // reads layout, so before this frame's style changes
    stage.style.setProperty('--ry', `${(look.x * 7).toFixed(2)}deg`);
    stage.style.setProperty('--rx', `${(-look.y * 4).toFixed(2)}deg`);
    if (gl3d) gl3d.draw(t, look.x, look.y);
    requestAnimationFrame(frame);
  }
  function kick() {
    if (reduce || running || !started) return;
    running = true;
    requestAnimationFrame(frame);
  }
  // Motion starts once the page has loaded, so it never competes with the first paint
  const go = () => setTimeout(() => { started = true; kick(); }, 200);
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
      uniform sampler2D uTex; uniform vec3 uLight; uniform float uTime;
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
        float a = c.a * smoothstep(1.0, 0.955, vUv.y);             // the artwork is cut at the bottom
        gl_FragColor = vec4(col * a, a);
      }`);
    if (!prog) return null;
    const loc = (n) => gl.getUniformLocation(prog, n);
    const u = { proj: loc('uProj'), model: loc('uModel'), tex: loc('uTex'), light: loc('uLight'), time: loc('uTime') };

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
      const sample = (u, v) => {  // bilinear
        const x = u * (dw - 1), y = v * (dh - 1);
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
      draw(t, lx, ly) {
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
        // The mesh is 1 unit tall; frame it so it fills the canvas height
        const fov = 0.5, dist = 1 / (2 * Math.tan(fov / 2)) * 1.0;
        gl.uniformMatrix4fv(u.proj, false, perspective(fov, w / h, 0.1, 10));
        const yaw = lx * 0.2 + Math.sin(t * 0.5) * 0.02;
        const pitch = ly * 0.09;
        const breathe = 1 + Math.sin(t * 1.7) * 0.006;
        const model = multiply(translate(0, Math.sin(t * 0.9) * 0.006, -dist), multiply(rotY(yaw), multiply(rotX(pitch), scale(1, breathe, 1))));
        gl.uniformMatrix4fv(u.model, false, model);
        gl.uniform3f(u.light, -0.6 + lx * 0.9, 0.5 - ly * 0.4, 0.8);
        gl.uniform1f(u.time, t);
        gl.uniform1i(u.tex, 0);
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
        if (!shown) { shown = true; camp.classList.add('is-3d'); }
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
  function rotX(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }

  /* ---------- the Signage card breaks into shards, then puts itself back together ---------- */

  function setupShards(cv, card) {
    if (!cv || !card) return null;
    const ctx = cv.getContext('2d');
    const colors = ['#ff5fa9', '#f62584', '#ffffff', '#b98cff', '#8a3be0'];
    const N = 70;
    const parts = Array.from({ length: N }, (_, i) => ({
      // start somewhere on the card, drift to the right (a little up or down), away from the headline
      sx: Math.random(), sy: Math.random(),
      dx: 0.6 + Math.random() * 1.3, dy: -0.4 + Math.random() * 0.65,
      rot: Math.random() * 6, spin: (Math.random() - 0.5) * 8,
      size: 3 + Math.random() * 6, color: colors[i % colors.length], delay: Math.random() * 0.35,
    }));
    const CYCLE = 7;
    return {
      step(t) {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
        if (!w || !h) return;
        if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        // where the card sits inside the shard canvas
        const cr = card.getBoundingClientRect(), vr = cv.getBoundingClientRect();
        const cx = (cr.left - vr.left) * dpr, cy = (cr.top - vr.top) * dpr, cw = cr.width * dpr, ch = cr.height * dpr;
        const phase = (t % CYCLE) / CYCLE;
        // 0–.35 whole card · .35–.6 breaks away to the right · .6–.85 gone, shards drift · .85–1 flies back together
        let k;
        if (phase < 0.35) k = 0;
        else if (phase < 0.85) k = (phase - 0.35) / 0.5;
        else k = 1 - (phase - 0.85) / 0.15;
        let op = 1;
        if (phase >= 0.35 && phase < 0.47) op = 1 - (phase - 0.35) / 0.12;
        else if (phase >= 0.47 && phase < 0.88) op = 0;
        else if (phase >= 0.88 && phase < 0.98) op = (phase - 0.88) / 0.1;
        card.style.opacity = op.toFixed(3);
        // a few shards always trail off the right edge, like the campaign image
        for (const p of parts) {
          const kk = clamp((k - p.delay) / (1 - p.delay), 0, 1);
          const e = 1 - Math.pow(1 - kk, 3);
          const trail = (t * 0.25 + p.sx) % 1;
          const x = cx + p.sx * cw + e * p.dx * cw * 1.3 + (k === 0 ? trail * cw * 0.5 * (p.sy > 0.6 ? 1 : 0) : 0);
          const y = cy + p.sy * ch + e * p.dy * ch * 1.8 - (k === 0 ? trail * ch * 0.6 * (p.sy > 0.6 ? 1 : 0) : 0);
          const alpha = k === 0 ? (p.sy > 0.6 && p.sx > 0.7 ? (1 - trail) * 0.8 : 0) : (1 - kk * 0.55);
          if (alpha <= 0.01) continue;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(x, y);
          ctx.rotate(p.rot + p.spin * e);
          ctx.fillStyle = p.color;
          const s = p.size * dpr;
          ctx.beginPath(); ctx.moveTo(-s, -s * 0.6); ctx.lineTo(s, -s * 0.2); ctx.lineTo(-s * 0.2, s); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
      },
    };
  }
})();
