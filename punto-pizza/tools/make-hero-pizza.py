# Gera a pizza que gira no topo do site a partir de uma foto de pizza inteira sobre fundo escuro.
#
#   python3 tools/make-hero-pizza.py tools/src/margherita-carlos.jpg
#
# A foto é tirada de lado, então a pizza aparece como uma elipse. O script acha essa elipse,
# estica a imagem até virar um círculo (como vista de cima) e recorta o fundo. No site, o CSS
# inclina o prato de novo (rotateX no .plate) e gira só a pizza, como num prato giratório.
# Saída: assets/img/hero/margherita-spin.webp (900 px), margherita-spin-720.webp e margherita-spin-560.webp.
# Precisa de: pip install numpy scipy pillow
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

src = Path(sys.argv[1])
out = Path(__file__).resolve().parent.parent / 'assets/img/hero'
im = Image.open(src).convert('RGB')

# Pizza = a maior área clara (o fundo é quase preto)
lum = np.asarray(im).astype(float) @ [.299, .587, .114]
lab, n = ndimage.label(lum >= 55)
sizes = ndimage.sum(lum >= 55, lab, range(1, n + 1))
pizza = ndimage.binary_fill_holes(ndimage.binary_opening(lab == np.argmax(sizes) + 1, iterations=4))

# Elipse (eixos alinhados) ajustada nas bordas esquerda e direita de cada linha.
# Ignora o topo e o fim da imagem, onde aparece a tábua de madeira.
h = pizza.shape[0]
pts = []
for y in range(int(h * .13), int(h * .9), 4):
    row = np.where(pizza[y])[0]
    if len(row):
        pts += [(row.min(), y), (row.max(), y)]
X, Y = np.array(pts, float).T
A, B, C, D = np.linalg.lstsq(np.stack([X * X, Y * Y, X, Y], 1), np.ones(len(X)), rcond=None)[0]
cx, cy = -C / (2 * A), -D / (2 * B)
k = 1 + C * C / (4 * A) + D * D / (4 * B)
ra, rb = np.sqrt(k / A), np.sqrt(k / B)
print(f'elipse: centro {cx:.0f},{cy:.0f}  raios {ra:.0f}x{rb:.0f}  inclinação {np.degrees(np.arccos(rb / ra)):.0f}°')

# Estica a elipse até virar círculo e recorta com borda suave (2% para dentro, para não pegar o fundo)
S = 1100
circ = im.transform((S, S), Image.EXTENT, (cx - ra, cy - rb, cx + ra, cy + rb), Image.BICUBIC)
mask = Image.new('L', (S * 4, S * 4), 0)
ImageDraw.Draw(mask).ellipse((S * 4 * .02, S * 4 * .02, S * 4 * .98, S * 4 * .98), fill=255)
circ.putalpha(mask.resize((S, S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2)))

out.mkdir(parents=True, exist_ok=True)
for size, name in [(900, 'margherita-spin.webp'), (720, 'margherita-spin-720.webp'), (560, 'margherita-spin-560.webp')]:
    circ.resize((size, size), Image.LANCZOS).save(out / name, quality=76, method=6)
    print('ok', out / name)
