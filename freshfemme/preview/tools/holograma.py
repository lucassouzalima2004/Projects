"""Capa holográfica: anima o corpo anatômico translúcido do calor ao frio a partir de dois quadros parados
(gerados no Higgsfield, mesmo corpo e mesma pose, fundo preto): o QUENTE, todo vermelho/laranja, e o FRIO,
com a pele de fora azul-gelo e o interior ainda morno.

    python3 holograma.py QUENTE.jpg FRIO.jpg SAIDA.mp4 --size 1280x720 --neck 0.508,0.162

Os quadros usados na capa estão em holograma/. Dentro de freshfemme/preview:

    python3 tools/holograma.py tools/holograma/quente-desktop.jpg tools/holograma/frio-desktop.jpg \
        static/videos/freshfemme-capa-desktop.mp4 --size 1280x720 --neck 0.508,0.162
    python3 tools/holograma.py tools/holograma/quente-celular.jpg tools/holograma/frio-celular.jpg \
        static/videos/freshfemme-capa-celular.mp4 --size 720x1280 --neck 0.497,0.154 --crf 26

O que acontece no vídeo (8 s, 24 fps):
  0 s     quente, o brilho pulsa devagar como uma respiração
  ~1,7 s  um jato fino de névoa azul entra pela direita e chega ao pescoço
  2 s     o frio começa no pescoço (--spray) e desce como uma onda com a borda clara
  ~6 s    a pele inteira fica azul (--cold); o interior continua quente até o fim
Uma aproximação lenta (1,00 → 1,03) dá vida sem mexer no corpo. Gera também SAIDA.jpg (1º quadro).
--neck é a posição do pescoço em fração da largura e da altura do quadro. Precisa de ffmpeg, numpy e Pillow.
"""
import argparse, subprocess
import numpy as np
from PIL import Image, ImageFilter

FPS = 24


def smooth(e0, e1, x):
    u = np.clip((x - e0) / (e1 - e0), 0, 1)
    return u * u * (3 - 2 * u)


def load(path, w, h):
    im = Image.open(path).convert('RGB')
    # recorta para a proporção de saída sem distorcer e reduz
    sw, sh = im.size
    if sw / sh > w / h:
        nw = round(sh * w / h); im = im.crop(((sw - nw) // 2, 0, (sw - nw) // 2 + nw, sh))
    else:
        nh = round(sw * h / w); im = im.crop((0, (sh - nh) // 2, sw, (sh - nh) // 2 + nh))
    a = np.asarray(im.resize((w, h), Image.LANCZOS), np.float32) / 255
    return np.clip((a - 0.03) / 0.97, 0, 1)  # fundo quase preto → preto


def blur(a, r):
    if r <= 0.3: return a
    im = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    return np.asarray(im, np.float32) / 255


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('hot'); ap.add_argument('cold'); ap.add_argument('out')
    ap.add_argument('--size', default='1280x720')
    ap.add_argument('--neck', default='0.5,0.18')
    ap.add_argument('--spray', type=float, default=2.0)
    ap.add_argument('--cold-at', type=float, default=6.0)
    ap.add_argument('--duration', type=float, default=8.0)
    ap.add_argument('--zoom', type=float, default=0.03)
    ap.add_argument('--crf', default='23')
    o = ap.parse_args()
    W, H = map(int, o.size.split('x'))
    # renderiza um pouco maior para a aproximação lenta não perder nitidez
    k = 1 + o.zoom + 0.01
    RW, RH = round(W * k / 2) * 2, round(H * k / 2) * 2
    hot, cold = load(o.hot, RW, RH), load(o.cold, RW, RH)
    nx, ny = (float(v) for v in o.neck.split(','))
    NX, NY = nx * RW, ny * RH
    S = min(RW, RH)  # escala de referência (altura no 16:9, largura no 9:16)
    BH = RH  # o corpo ocupa a altura do quadro nos dois formatos

    yy, xx = np.mgrid[0:RH, 0:RW].astype(np.float32)
    # distância a partir do pescoço, mais "rápida" na horizontal (ombros/braços esfriam junto com o peito)
    dist = np.sqrt(((xx - NX) * 0.8) ** 2 + (yy - NY) ** 2) / BH
    # a frente da onda ondula um pouco (ruído suave) para não parecer uma linha de scanner
    rng0 = np.random.default_rng(3)
    wob = Image.fromarray((rng0.random((9, 9)) * 255).astype(np.uint8)).resize((RW, RH), Image.BICUBIC)
    dist = dist + (np.asarray(wob, np.float32) / 255 - 0.5) * 0.06
    lum_cold = cold.max(2)
    body = smooth(0.14, 0.4, blur(lum_cold, max(1, S / 500)))
    dmax = float(dist[body > 0.3].max()) if (body > 0.3).any() else 1.0
    soft = 0.07
    rim = blur(lum_cold, max(1, S / 400))  # onde a borda clara da onda acende

    # jato de névoa: partículas saindo da borda direita, um pouco acima, em direção ao pescoço
    rng = np.random.default_rng(7)
    n = 7000
    birth = o.spray - 0.5 + rng.random(n) * 0.85
    travel = 0.3 + rng.random(n) * 0.14
    src = np.array([RW * 1.02, NY - 0.11 * BH])
    dst = np.array([NX + 0.02 * BH, NY + 0.004 * BH])
    spread = rng.normal(0, 1, n)
    lift = rng.normal(0, 1, n)
    jet_dir = (dst - src) / np.linalg.norm(dst - src)
    jet_nrm = np.array([-jet_dir[1], jet_dir[0]])
    MIST = np.array([0.78, 0.95, 1.0], np.float32)
    ICE = np.array([0.55, 0.9, 1.0], np.float32)

    cx, cy = RW / 2, RH * 0.5
    frames = int(round(o.duration * FPS))
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                           '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow',
                           '-crf', o.crf, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', o.out], stdin=subprocess.PIPE)
    for i in range(frames):
        t = i / FPS
        breath = 1 + 0.07 * np.sin(2 * np.pi * t / 2.8)
        # onda de frio
        u = smooth(o.spray + 0.1, o.cold_at, t)
        r = u * (dmax + soft)
        m = 1 - smooth(r - soft, r, dist) if u > 0 else np.zeros_like(dist)
        # o halo fora do corpo esfria junto, sem desenhar a linha da onda no fundo
        m = (body * m + (1 - body) * np.maximum(m, smooth(0, 0.75, u)))[..., None]
        frame = hot * (1 - m) * breath + cold * m * (1 + 0.03 * np.sin(2 * np.pi * t / 2.8))
        if 0 < u < 1:
            band = np.exp(-((dist - r + soft * 0.35) / (soft * 0.45)) ** 2) * rim * (1 - u * 0.5)
            frame = 1 - (1 - frame) * (1 - 0.55 * band[..., None] * ICE)
        # névoa
        age = (t - birth) / travel
        live = (age > 0) & (age < 1.35)
        if live.any():
            a = np.clip(age[live], 0, 1)
            p = src + (dst - src) * a[:, None]
            off = (spread[live] * (0.002 + 0.03 * a * a) * BH)[:, None] * jet_nrm + (lift[live] * 0.006 * BH * a)[:, None] * jet_dir
            over = np.clip(age[live] - 1, 0, None)  # depois de chegar, espalha e some
            off += (spread[live] * over * 0.16 * BH)[:, None] * jet_nrm + (lift[live] * over * 0.12 * BH)[:, None] * np.array([0, 1])
            p = p + off
            alpha = smooth(0.05, 0.45, age[live]) * (1 - smooth(0.9, 1.25, age[live])) * 0.55
            px = np.clip(p[:, 0].round().astype(int), 0, RW - 1)
            py = np.clip(p[:, 1].round().astype(int), 0, RH - 1)
            inside = (p[:, 0] >= 0) & (p[:, 0] < RW) & (p[:, 1] >= 0) & (p[:, 1] < RH)
            acc = np.zeros((RH, RW), np.float32)
            np.add.at(acc, (py[inside], px[inside]), alpha[inside])
            acc = np.clip(acc, 0, 1.5)
            fine = blur(np.clip(acc, 0, 1), S / 900)
            soft_ = blur(np.clip(acc, 0, 1), S / 260)
            haze = blur(np.clip(acc, 0, 1), S / 60)
            mist = np.clip(fine * 1.1 + soft_ * 1.4 + haze * 3.5, 0, 1) * 0.85
            frame = 1 - (1 - frame) * (1 - mist[..., None] * MIST)
        # brilho do impacto no pescoço
        hit = smooth(o.spray - 0.15, o.spray + 0.15, t) * (1 - smooth(o.spray + 0.3, o.spray + 1.4, t))
        if hit > 0:
            g = np.exp(-(((xx - NX) ** 2 + (yy - NY) ** 2) / (0.05 * BH) ** 2)) * hit * 0.3
            frame = 1 - (1 - frame) * (1 - g[..., None] * ICE)
        im = Image.fromarray((np.clip(frame, 0, 1) * 255).astype(np.uint8))
        z = 1 + o.zoom * smooth(0, o.duration, t)
        sc = (RW / k) / W / z  # tamanho de um pixel de saída na imagem renderizada
        ox, oy = cx - W / 2 * sc, cy - H / 2 * sc
        im = im.transform((W, H), Image.AFFINE, (sc, 0, ox, 0, sc, oy), Image.BICUBIC)
        if i == 0: im.save(o.out.rsplit('.', 1)[0] + '.jpg', quality=86)
        ff.stdin.write(im.tobytes())
    ff.stdin.close()
    ff.wait()


if __name__ == '__main__':
    main()
