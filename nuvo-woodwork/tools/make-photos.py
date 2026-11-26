#!/usr/bin/env python3
# Fotos dos projetos, produtos e journal → assets/img/library/ em WebP, em dois tamanhos:
#   <nome>.webp     até 1800 px no lado maior (a foto aberta, em tela cheia)
#   <nome>-sm.webp  900 px de largura (as grades)
# O nome sai do arquivo, sem a data, "-scaled", "-nuvo-woodwork" e afins: 2026-04-camino-real-...-nuvo-woodwork.jpg
# vira camino-real-signature-house-....webp. É esse nome que vai em tools/pages/content.mjs.
#
# uso: python3 tools/make-photos.py fotos/*.jpg      (dentro de nuvo-woodwork/; precisa do Pillow)
#      FORCE=1 refaz as que já existem
import os, re, sys
from PIL import Image, ImageOps

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img', 'library')
BIG, SMALL = 1800, 900


def name_of(path):
    n = os.path.splitext(os.path.basename(path))[0]
    n = re.sub(r'^\d{4}-\d{2}-', '', n)  # data que veio do WordPress (2026-04-)
    n = re.sub(r'(?i)anyconv\.com__|copy-of-|-scaled|-nuvo-woodwork|-updated-1$', '', n)
    return re.sub(r'[^a-z0-9]+', '-', n.lower()).strip('-')


def main(files):
    os.makedirs(OUT, exist_ok=True)
    # a mesma foto em dois arquivos (o WordPress guardava cópias): fica a maior
    melhor = {}
    for f in files:
        n = name_of(f)
        with Image.open(f) as im:
            area = im.width * im.height
        if n not in melhor or area > melhor[n][1]:
            melhor[n] = (f, area)
    for n, (f, _) in sorted(melhor.items()):
        big, small = os.path.join(OUT, n + '.webp'), os.path.join(OUT, n + '-sm.webp')
        if os.path.exists(big) and os.path.exists(small) and not os.environ.get('FORCE'):
            continue
        im = ImageOps.exif_transpose(Image.open(f)).convert('RGB')
        a = im.copy()
        a.thumbnail((BIG, BIG), Image.LANCZOS)
        a.save(big, 'WEBP', quality=78, method=6)
        b = im.copy()
        if b.width > SMALL:
            b = b.resize((SMALL, round(b.height * SMALL / b.width)), Image.LANCZOS)
        b.save(small, 'WEBP', quality=74, method=6)
        if min(im.size) < 1000:
            print(f'aviso: {n} é pequena ({im.width}x{im.height})')
        print(f'{n}  {a.width}x{a.height}')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__ or 'uso: python3 tools/make-photos.py fotos/*.jpg')
    main(sorted(sys.argv[1:]))
