"""Converte um vídeo gerado (Flow/Veo, "foto colorida" laranja → azul) em imagem de câmera térmica real.

    python3 freshfemme/preview/tools/termico.py ENTRADA.mp4 SAIDA.mp4 [--rosto 0.42]

O calor vem da luz do próprio quadro; o azul do vídeo original marca onde ela esfriou. O rosto esfria só
em parte (o spray é no pescoço), então ela continua "viva" no fim. Gera também SAIDA.jpg (capa do vídeo).
--rosto é a altura, em fração do quadro, onde termina o rosto: ~0.42 no 16:9 e ~0.36 no 9:16.
Precisa de ffmpeg, numpy e Pillow.
"""
import argparse, os, subprocess, tempfile
import numpy as np
from PIL import Image, ImageFilter

# paleta ironbow (FLIR), puxada para o azul no frio
STOPS = [(0.00, '000000'), (0.12, '050a30'), (0.24, '1846c8'), (0.34, '3a2ab0'), (0.44, '8a1aa0'),
         (0.54, 'c8156e'), (0.64, 'ee3a1c'), (0.75, 'fb7a12'), (0.86, 'fdc02a'), (0.94, 'fff07a'), (1.00, 'ffffff')]
_xs = np.array([s for s, _ in STOPS])
_cs = np.array([[int(c[i:i + 2], 16) for i in (0, 2, 4)] for _, c in STOPS], float)
LUT = np.stack([np.interp(np.linspace(0, 1, 256), _xs, _cs[:, k]) for k in range(3)], 1).astype(np.uint8)


def blur(a, r):
    im = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    return np.asarray(im, float) / 255


def termico(img, rng, rosto=0.42):
    a = np.asarray(img.convert('RGB'), float) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    corpo = np.clip((lum - 0.03) / 0.10, 0, 1)
    ln = np.clip(lum / 0.75, 0, 1)
    frio = np.clip((b - r + 0.10) / 0.45, 0, 1)
    # a faixa da onda de frio e a névoa do spray são quase brancas: contam como frio, não como brilho
    nevoa = np.clip((lum - 0.72) / 0.15, 0, 1) * np.clip((b - r + 0.05) / 0.10, 0, 1)
    y = np.linspace(0, 1, a.shape[0])[:, None]
    mantem_rosto = np.clip((y - (rosto - 0.06)) / 0.12, 0, 1) * 0.45 + 0.55
    frio = np.maximum(frio * mantem_rosto, nevoa)
    calor = (0.50 + 0.40 * ln) * (1 - frio) + (0.22 + 0.40 * ln * (1 - nevoa)) * frio
    calor *= corpo
    calor = blur(calor, 4) + (lum - blur(lum, 10)) * 0.35   # sem textura de pele, mas com o traço do rosto
    calor = blur(calor, 1.2) + rng.normal(0, 0.012, calor.shape)  # granulado do sensor
    return Image.fromarray(LUT[np.clip(calor * 255, 0, 255).astype(np.uint8)])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('entrada')
    ap.add_argument('saida')
    ap.add_argument('--rosto', type=float, default=0.42)
    args = ap.parse_args()
    rng = np.random.default_rng(7)
    with tempfile.TemporaryDirectory() as tmp:
        src, dst = os.path.join(tmp, 'in'), os.path.join(tmp, 'out')
        os.makedirs(src); os.makedirs(dst)
        fps = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate',
                              '-of', 'csv=p=0', args.entrada], capture_output=True, text=True, check=True).stdout.strip() or '24'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', args.entrada, os.path.join(src, 'f_%04d.png')], check=True)
        quadros = sorted(os.listdir(src))
        for f in quadros:
            termico(Image.open(os.path.join(src, f)), rng, args.rosto).save(os.path.join(dst, f))
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', fps, '-i', os.path.join(dst, 'f_%04d.png'),
                        '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                        '-an', args.saida], check=True)
        capa = os.path.join(dst, quadros[min(7, len(quadros) - 1)])
        Image.open(capa).convert('RGB').save(os.path.splitext(args.saida)[0] + '.jpg', quality=82, optimize=True, progressive=True)
    print(f'{len(quadros)} quadros → {args.saida}')


if __name__ == '__main__':
    main()
