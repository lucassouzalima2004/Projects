/* =============================================================================
   Decodificador do filme: tira os quadros direto do MP4, sem o <video>.

   O <video> precisa "procurar" cada posição pedida pelo scroll, e cada busca
   leva um tempo que varia de aparelho para aparelho. Aqui o navegador recebe
   os quadros comprimidos e os decodifica na placa de vídeo (WebCodecs) assim
   que o scroll chega perto, sempre um pouco adiante. Cada quadro pronto é
   copiado na hora para uma tela guardada (canvas), e o film.js desenha essas
   telas fundindo dois quadros vizinhos: o movimento fica contínuo mesmo
   rolando bem devagar.

   Onde começa cada quadro dentro do arquivo, o tamanho e quais são
   quadros-chave vêm do assets/video/manifest.js (tools/make-videos.sh). Num
   navegador sem WebCodecs este arquivo não faz nada e o film.js usa o <video>.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.VideoDecoder || !window.EncodedVideoChunk) return;

  const AHEAD = 16; // quadros decodificados adiante, no sentido do scroll
  const BEHIND = 5; // quadros guardados para trás (a pessoa pode voltar um pouco)
  const FAST_IN = 150; // quadros de vídeo por segundo a partir dos quais o scroll é "rápido"...
  const FAST_OUT = 90; // ...e abaixo dos quais volta a ser "lento" (a folga evita ficar trocando)
  const QUEUE = 4; // quadros no decodificador ao mesmo tempo: fila curta, posição nova é atendida logo

  // Como guardar um quadro pronto: copiado numa tela reaproveitada (o melhor), como ImageBitmap,
  // ou o próprio quadro do decodificador (último recurso, guarda poucos)
  let keepAs = 'canvas';

  // Telas livres, por tamanho, reaproveitadas entre os vídeos (não alocar memória a cada quadro)
  const pool = new Map();
  function take(w, h) {
    const free = pool.get(w + 'x' + h);
    if (free && free.length) return free.pop();
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.g = c.getContext('2d', { alpha: false });
    c.pooled = true;
    return c;
  }
  function release(img) {
    if (!img.pooled) {
      img.close();
      return;
    }
    const key = img.width + 'x' + img.height;
    if (!pool.has(key)) pool.set(key, []);
    const free = pool.get(key);
    if (free.length < 32) free.push(img);
    else img.width = img.height = 0;
  }

  function bytes(hex) {
    const a = new Uint8Array(hex.length >> 1);
    for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16);
    return a;
  }

  function config(info) {
    const c = { codec: info.codec, codedWidth: info.size[0], codedHeight: info.size[1], optimizeForLatency: true };
    if (info.description) c.description = bytes(info.description);
    return c;
  }

  // Este navegador decodifica este vídeo?
  function supported(info) {
    if (!info || !info.codec || !Array.isArray(info.sizes) || !info.keys) return Promise.resolve(false);
    try {
      return VideoDecoder.isConfigSupported(config(info)).then((r) => !!(r && r.supported), () => false);
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  // Números para o painel de diagnóstico (?debug)
  const stats = { out: 0, lat: 0, latN: 0, flushes: 0, errors: 0 };

  /* ------------------------------------------------------------ um vídeo */
  // Recebe os bytes do arquivo aos poucos (dá para começar antes de terminar de baixar) e
  // decodifica os quadros perto do ponto que o film.js pede.
  function Track(info, opts) {
    const n = info.sizes.length;
    this.info = info;
    this.n = n;
    this.cfg = config(info);
    this.off = new Float64Array(n + 1); // onde começa cada quadro no arquivo; off[n] = fim do último
    let o = info.start;
    for (let i = 0; i < n; i++) {
      this.off[i] = o;
      o += info.sizes[i];
    }
    this.off[n] = o;
    this.buf = new Uint8Array(o); // o arquivo até o fim do último quadro
    this.have = 0; // bytes que já chegaram
    this.cache = new Map(); // quadro → imagem decodificada
    this.sent = new Map(); // quadros no decodificador, ainda não devolvidos → hora do envio
    this.dec = null;
    this.prev = -1; // último quadro enviado: é a referência do próximo quadro que não é chave
    this.goal = 0; // posição pedida (com fração)
    this.goalAt = 0;
    this.dir = 1; // sentido do scroll
    this.limit = 8; // quantos quadros guardar
    this.list = []; // os quadros que valem a pena agora, do mais urgente ao menos
    this.keep = new Set();
    this.speed = 0; // quadros de vídeo por segundo pedidos pelo scroll (média)
    this.fast = false;
    this.active = false;
    this.errors = 0;
    this.lastSend = 0;
    this.lastOut = 0;
    this.onFrame = opts.onFrame || function () {};
    this.onFail = opts.onFail || function () {};
  }

  // Mais um pedaço do arquivo chegou
  Track.prototype.push = function (chunk) {
    const room = this.buf.length - this.have;
    if (room <= 0) return;
    const part = chunk.length > room ? chunk.subarray(0, room) : chunk;
    this.buf.set(part, this.have);
    this.have += part.length;
  };

  Track.prototype.done = function () {
    return this.have >= this.buf.length;
  };

  Track.prototype.open = function () {
    if (this.dec && this.dec.state !== 'closed') return true;
    const t = this;
    try {
      t.dec = new VideoDecoder({ output: (frame) => t.output(frame), error: () => t.error() });
      t.dec.configure(t.cfg);
    } catch (e) {
      try {
        if (t.dec) t.dec.close();
      } catch (e2) {
        /* já fechado */
      }
      t.error();
      return false;
    }
    t.prev = -1;
    t.sent.clear();
    return true;
  };

  // O decodificador falhou (ou o navegador o recolheu): abre outro na próxima vez. Falhas
  // seguidas fazem o film.js voltar para o <video>.
  Track.prototype.error = function () {
    stats.errors++;
    this.dec = null;
    this.prev = -1;
    this.sent.clear();
    if (++this.errors === 3) this.onFail(this);
  };

  Track.prototype.chunk = function (i) {
    return new EncodedVideoChunk({
      type: this.info.keys[i] === '1' ? 'key' : 'delta',
      timestamp: i,
      data: this.buf.subarray(this.off[i], this.off[i + 1]),
    });
  };

  // Envia o quadro i, começando pelo quadro-chave dele quando o anterior não foi o último enviado
  Track.prototype.send = function (i) {
    let k = i;
    while (k > 0 && this.info.keys[k] !== '1') k--;
    const from = this.prev >= k && this.prev < i ? this.prev + 1 : k;
    const now = performance.now();
    try {
      for (let j = from; j <= i; j++) {
        this.dec.decode(this.chunk(j));
        this.sent.set(j, now);
        this.prev = j;
      }
    } catch (e) {
      this.prev = -1;
      return false;
    }
    this.lastSend = now;
    return true;
  };

  Track.prototype.output = function (frame) {
    const i = frame.timestamp;
    const now = performance.now();
    if (this.sent.has(i)) {
      stats.lat += now - this.sent.get(i);
      stats.latN++;
      this.sent.delete(i);
    }
    stats.out++;
    this.lastOut = now;
    this.errors = 0;
    if (!this.active || this.cache.has(i) || !this.keep.has(i)) {
      frame.close();
      return;
    }
    if (keepAs === 'canvas') {
      // Cópia na hora para uma tela guardada: o quadro do decodificador é devolvido em seguida
      let c = null;
      try {
        c = take(frame.displayWidth, frame.displayHeight);
        c.g.drawImage(frame, 0, 0, c.width, c.height);
        frame.close();
        this.store(i, c);
        return;
      } catch (e) {
        if (c) release(c);
        keepAs = window.createImageBitmap ? 'bitmap' : 'frame';
      }
    }
    if (keepAs === 'bitmap') {
      createImageBitmap(frame).then(
        (img) => {
          frame.close();
          this.store(i, img);
        },
        () => {
          keepAs = 'frame';
          this.store(i, frame);
        }
      );
      return;
    }
    this.store(i, frame);
  };

  Track.prototype.store = function (i, img) {
    if (!this.active || this.cache.has(i) || !this.keep.has(i)) {
      release(img);
      return;
    }
    this.cache.set(i, img);
    this.trim();
    this.onFrame(this, i);
  };

  // Passou do limite: sai primeiro o que ficou fora da janela, do mais longe ao mais perto.
  // Os quadros antigos só saem quando chegam novos, então sempre há um quadro perto para mostrar.
  Track.prototype.trim = function () {
    const max = keepAs === 'frame' ? Math.min(this.limit, 6) : this.limit;
    if (this.cache.size <= max) return;
    const g = this.goal + 0.5;
    const order = Array.from(this.cache.keys()).sort((a, b) => {
      const ka = this.keep.has(a) ? 1 : 0;
      const kb = this.keep.has(b) ? 1 : 0;
      return ka - kb || Math.abs(b - g) - Math.abs(a - g);
    });
    for (let k = 0; this.cache.size > max; k++) {
      release(this.cache.get(order[k]));
      this.cache.delete(order[k]);
    }
  };

  // O film.js diz onde o trecho está (quadro com fração), para que lado o scroll vai e quantos
  // quadros guardar. A lista sai em ordem de urgência:
  // • normal: o quadro da tela, o vizinho dele (para a fusão), os próximos no sentido do scroll
  //   e alguns para trás — todos os quadros, para o movimento ficar contínuo;
  // • scroll muito rápido: a tela já pula quadros, então só os quadros-chave pelo caminho (cada
  //   um sai numa decodificação só), indo mais longe adiante.
  Track.prototype.want = function (goal, dir, limit) {
    const now = performance.now();
    const g = Math.floor(goal);
    dir = dir || this.dir;
    if (this.active && now > this.goalAt) {
      const v = (Math.abs(goal - this.goal) / (now - this.goalAt)) * 1000;
      const k = Math.min(1, (now - this.goalAt) / 120);
      this.speed += (v - this.speed) * k;
    } else if (!this.active) {
      this.speed = 0;
    }
    this.active = true;
    this.goalAt = now;
    const fast = this.fast ? this.speed > FAST_OUT : this.speed > FAST_IN;
    if (g !== Math.floor(this.goal) || dir !== this.dir || limit !== this.limit || fast !== this.fast || !this.list.length) {
      this.dir = dir;
      this.limit = limit;
      this.fast = fast;
      const list = [];
      if (fast) {
        const reach = AHEAD + Math.ceil(this.speed / 15);
        for (let i = g; Math.abs(i - g) <= reach && list.length < limit; i += dir) {
          if (i >= 0 && i < this.n && this.info.keys[i] === '1') list.push(i);
        }
        for (let i = g - dir, k = 0; k < 2 && Math.abs(i - g) < 6; i -= dir) {
          if (i >= 0 && i < this.n && this.info.keys[i] === '1') list.push(i), k++;
        }
      } else {
        list.push(g, g + 1);
        for (let k = 1; k <= AHEAD; k++) list.push(dir > 0 ? g + 1 + k : g - k);
        for (let k = 1; k <= BEHIND; k++) list.push(dir > 0 ? g - k : g + 1 + k);
      }
      this.list = list.filter((i) => i >= 0 && i < this.n).slice(0, limit);
      this.keep = new Set(this.list);
    }
    this.goal = goal;
    this.trim();
    this.pump();
  };

  // Decide o que decodificar agora: o quadro da tela, o vizinho (para a fusão) e os próximos
  Track.prototype.pump = function () {
    if (!this.active || this.have < this.off[1] || this.errors >= 3) return;
    if (!this.open()) return;
    const now = performance.now();
    // Decodificador que segura os quadros: força a entrega dos que já foram enviados. O que não
    // sair até o fim do flush não sai mais (a fila não pode ficar presa esperando por ele).
    if (this.sent.size && !this.flushing && now - this.lastSend > 40 && now - this.lastOut > 80) {
      this.flushing = true;
      stats.flushes++;
      this.prev = -1; // depois do flush, o próximo quadro enviado precisa ser chave
      const dec = this.dec;
      const end = () => {
        this.flushing = false;
        if (this.dec === dec) this.sent.clear();
      };
      dec.flush().then(end, end);
    }
    for (const i of this.list) {
      if (this.sent.size >= QUEUE) break;
      if (this.cache.has(i) || this.sent.has(i)) continue;
      if (this.off[i + 1] > this.have) continue; // ainda não chegou
      if (!this.send(i)) break;
    }
  };

  // Os dois quadros prontos que cercam a posição x (o de antes e o de depois). Com os dois, o
  // film.js funde um no outro na proporção certa: se faltar algum quadro no meio, a imagem passa
  // de um para o outro aos poucos em vez de travar e pular.
  Track.prototype.around = function (x) {
    let ia = -1;
    let ib = Infinity;
    this.cache.forEach((img, i) => {
      if (i <= x && i > ia) ia = i;
      if (i >= x && i < ib) ib = i;
    });
    return { ia, a: ia >= 0 ? this.cache.get(ia) : null, ib, b: ib < Infinity ? this.cache.get(ib) : null };
  };

  // Longe da tela: libera o decodificador e os quadros guardados
  Track.prototype.sleep = function () {
    if (!this.active) return;
    this.active = false;
    if (this.dec && this.dec.state !== 'closed') {
      try {
        this.dec.close();
      } catch (e) {
        /* já fechado */
      }
    }
    this.dec = null;
    this.prev = -1;
    this.sent.clear();
    this.list = [];
    this.keep = new Set();
    this.speed = 0;
    this.cache.forEach((img) => release(img));
    this.cache.clear();
  };

  window.NUVO_DECODER = { supported, Track, stats, keepAs: () => keepAs };
})();
