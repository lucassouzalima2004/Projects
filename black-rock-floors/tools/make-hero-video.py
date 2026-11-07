#!/usr/bin/env python3
"""Monta o vídeo do topo da home (assets/video/) a partir de um clipe de cozinha.

Clipe: "A kitchen with black cabinets and stainless steel appliances", Curtis Adams, Pexels (licença gratuita, sem
crédito obrigatório): https://www.pexels.com/video/a-kitchen-with-black-cabinets-and-stainless-steel-appliances-19228420/
Não é obra do Gabriel. Para trocar por um trabalho real dele, grave um clipe deitado, coloque em tools/clips/ e mude CLIP.

O que faz: baixa os brancos um pouco, emenda o fim no começo com uma fusão (o loop não dá pulo) e grava cada versão
em MP4 (toca em tudo, inclusive iPhone) e WebM (navegadores sem H.264), mais os pôsteres, que são o primeiro quadro.

Uso: python3 -E tools/make-hero-video.py   (precisa de PyAV, numpy e Pillow; não usa ffmpeg de linha de comando)
"""
import pathlib
import urllib.request
from fractions import Fraction

import av
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
CLIP = ROOT / 'tools/clips/19228420-hd_1920_1080_30fps.mp4'
URL = 'https://videos.pexels.com/video-files/19228420/19228420-hd_1920_1080_30fps.mp4'
OUT = ROOT / 'assets/video'
FADE = 30          # quadros da fusão do fim com o começo (1 s)
TALL_CENTER = 0.60 # centro do recorte do celular (0 = esquerda, 1 = direita)
TALL_WIDTH = 1350  # largura desse recorte, em pixels do clipe
RATE = Fraction(30000, 1001)

# Só baixa os brancos, para a parede e a bancada não estourarem ao lado do painel escuro do site
LUT = np.clip(np.interp(np.arange(256) / 255, [0, 0.5, 0.8, 1], [0, 0.51, 0.80, 0.94]) * 255, 0, 255).astype(np.uint8)


def tall(img):
    # No celular o vídeo ocupa só a parte de cima do painel, acima do texto: um recorte em pé mostraria só a coifa
    x = int(TALL_CENTER * 1920 - TALL_WIDTH / 2)
    x = max(0, min(x, 1920 - TALL_WIDTH))
    return img.crop((x, 0, x + TALL_WIDTH, 1080)).resize((800, 640), Image.LANCZOS)


VERSIONS = {
    'hero-1080': lambda im: im,
    'hero-720': lambda im: im.resize((1280, 720), Image.LANCZOS),
    'hero-tall': tall,
}
CODECS = {
    'mp4': ('libx264', {'crf': '27', 'preset': 'slow', 'profile': 'high', 'tune': 'film', 'g': '60',
                        'x264-params': 'colorprim=bt709:transfer=bt709:colormatrix=bt709'}),
    'webm': ('libvpx-vp9', {'crf': '36', 'b': '0', 'row-mt': '1', 'deadline': 'good', 'cpu-used': '3', 'g': '60',
                            'colorspace': 'bt709', 'color_primaries': 'bt709', 'color_trc': 'bt709'}),
}


class Writer:
    def __init__(self, path, codec, opts, size):
        fmt_opts = {'movflags': '+faststart'} if path.suffix == '.mp4' else {}
        self.c = av.open(str(path), 'w', options=fmt_opts)
        self.s = self.c.add_stream(codec, rate=RATE)
        self.s.width, self.s.height = size
        self.s.pix_fmt = 'yuv420p'
        self.s.options = opts

    def add(self, rgb):
        f = av.VideoFrame.from_ndarray(rgb, format='rgb24').reformat(format='yuv420p', dst_colorspace='ITU709')
        for p in self.s.encode(f):
            self.c.mux(p)

    def close(self):
        for p in self.s.encode():
            self.c.mux(p)
        self.c.close()


def main():
    if not CLIP.exists():
        CLIP.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(URL, CLIP)
    src = av.open(str(CLIP))
    stream = src.streams.video[0]
    total = sum(1 for _ in av.open(str(CLIP)).decode(video=0))

    writers = []
    for name, fn in VERSIONS.items():
        size = fn(Image.new('RGB', (1920, 1080))).size
        for ext, (codec, opts) in CODECS.items():
            writers.append((fn, Writer(OUT / f'{name}.{ext}', codec, dict(opts), size)))

    head = []
    first_written = False
    for i, frame in enumerate(src.decode(stream)):
        rgb = LUT[frame.to_ndarray(format='rgb24')]
        if i < FADE:
            head.append(rgb)
            continue
        if i >= total - FADE:
            a = (i - (total - FADE) + 1) / FADE
            rgb = (rgb * (1 - a) + head[i - (total - FADE)] * a).astype(np.uint8)
        img = Image.fromarray(rgb)
        if not first_written:
            img.resize((1600, 900), Image.LANCZOS).save(OUT / 'hero-poster.webp', quality=72, method=6)
            tall(img).save(OUT / 'hero-poster-tall.webp', quality=72, method=6)
            first_written = True
        cache = {}
        for fn, w in writers:
            if fn not in cache:
                cache[fn] = np.asarray(fn(img))
            w.add(cache[fn])
        if i % 100 == 0:
            print('quadro', i, 'de', total, flush=True)
    for _, w in writers:
        w.close()
    print('pronto:', total - FADE, 'quadros,', round((total - FADE) / float(RATE), 2), 's')
    for p in sorted(OUT.iterdir()):
        print(p.name, round(p.stat().st_size / 1e6, 2), 'MB')


main()
