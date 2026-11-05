# Gera os logos da Black Rock Remodeling a partir do logo antigo (Black Rock Floors): mantém a montanha e o
# "BLACK ROCK", tira o "FLOORS" e escreve "REMODELING" na mesma altura, com a fonte Archivo do site.
# É uma adaptação provisória: quando o Gabriel mandar o arquivo original do logo novo, é só trocar os SVGs.
#
# Uso: python3 tools/make-logo.py <logo antigo.svg>  (precisa de fonttools e brotli: pip install fonttools brotli)
# Saída: assets/img/logo-white.svg e assets/img/logo-ink.svg
import pathlib
import re
import sys

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

SITE = pathlib.Path(__file__).resolve().parent.parent
WORD = 'REMODELING'
TOP, BOTTOM = 450.0, 508.5   # a mesma altura das letras de "FLOORS"
TRACKING = 26                # espaço entre as letras
CENTER = 543.5               # o centro do "BLACK ROCK"
GAP = 34                     # distância entre a palavra e os fios dos lados
EDGE_L, EDGE_R = 11.7, 1073.2

old = pathlib.Path(sys.argv[1]).read_text()
subpaths = re.findall(r'M[^M]+', re.search(r' d="([^"]+)"', old).group(1))

def ybounds(sp):
    ys = list(map(float, re.findall(r'-?\d+\.?\d*', sp)))[1::2]
    return min(ys), max(ys)

# Fica só o que está acima da última linha (a montanha e o "BLACK ROCK")
kept = [sp.strip() for sp in subpaths if ybounds(sp)[0] < 440]
assert len(kept) == 16, len(kept)

font = TTFont(SITE / 'assets/fonts/archivo-latin.woff2')
if 'fvar' in font:
    axes = {a.axisTag for a in font['fvar'].axes}
    font = instantiateVariableFont(font, {k: v for k, v in {'wght': 640, 'wdth': 112}.items() if k in axes})
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
cap = font['OS/2'].sCapHeight
scale = (BOTTOM - TOP) / cap

width = sum(glyphs[cmap[ord(c)]].width * scale for c in WORD) + TRACKING * (len(WORD) - 1)
x = CENTER - width / 2
pen = SVGPathPen(glyphs, ntos=lambda v: f'{v:.1f}'.rstrip('0').rstrip('.'))
for c in WORD:
    g = glyphs[cmap[ord(c)]]
    g.draw(TransformPen(pen, (scale, 0, 0, -scale, x, BOTTOM)))
    x += g.width * scale + TRACKING
letters = pen.getCommands()

# Os fios dos lados acompanham a palavra, que é mais larga que "FLOORS"
left_end = CENTER - width / 2 - GAP
right_start = CENTER + width / 2 + GAP
rules = (f'M{EDGE_L} 477.2H{left_end:.1f}V483.7H{EDGE_L}Z'
         f'M{right_start:.1f} 477.2H{EDGE_R}V483.7H{right_start:.1f}Z')
assert left_end - EDGE_L > 40, 'palavra larga demais para os fios'

d = ' '.join(kept) + ' ' + letters + rules
for name, color in (('logo-white', '#ffffff'), ('logo-ink', '#0e0e0d')):
    (SITE / 'assets/img' / f'{name}.svg').write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1087 518" role="img" aria-label="Black Rock Remodeling">'
        f'<path fill="{color}" fill-rule="evenodd" d="{d}"/></svg>\n')
print(f'palavra: {width:.0f} px de largura; fios: {EDGE_L}-{left_end:.0f} e {right_start:.0f}-{EDGE_R}')
