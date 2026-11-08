"""Silhueta térmica: transforma um vídeo da mulher (fundo preto, corpo laranja → azul, como o primeiro do Flow)
em só o contorno do corpo, preenchido de calor, sem rosto nem pele. Laranja/amarelo no calor, azul no frio,
com brilho em volta e um leve tremor de calor.

    python3 freshfemme/preview/tools/silhueta.py ENTRADA.mp4 SAIDA.mp4

Gera também SAIDA.jpg (capa do vídeo). O frio é lido do azul do vídeo de entrada, então o tempo do borrifo e
do esfriamento é o mesmo do original. Precisa de ffmpeg, numpy e Pillow.
"""
import argparse, os, subprocess, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# calor: azul gelo (frio) → magenta → vermelho → laranja → amarelo claro (quente)
STOPS = [(0.00, '02040c'), (0.10, '0a1f5c'), (0.22, '1560c8'), (0.32, '35b7ea'), (0.40, '9ff2ff'),
         (0.48, 'b04aa8'), (0.58, 'e0314a'), (0.70, 'f5671c'), (0.82, 'fca62b'), (0.92, 'ffd76a'), (1.00, 'fff6d6')]
_xs = np.array([s for s, _ in STOPS]); _cs = np.array([[int(c[i:i + 2], 16) for i in (0, 2, 4)] for _, c in STOPS], float)
LUT = np.stack([np.interp(np.linspace(0, 1, 256), _xs, _cs[:, k]) for k in range(3)], 1)

def blur(a, r):
    if r <= 0: return a
    im = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    return np.asarray(im, float) / 255

_NOISE = {}
def _noise(h, w, scale):
    """Textura de calor de baixa frequência, maior que o quadro para poder subir devagar."""
    key = (h, w)
    if key not in _NOISE:
        rng = np.random.default_rng(11)
        small = rng.random(((h * 2) // 70 + 2, w // 70 + 2))
        big = Image.fromarray((small * 255).astype(np.uint8)).resize((w, h * 2), Image.BICUBIC)
        n = np.asarray(big.filter(ImageFilter.GaussianBlur(24 * scale)), float) / 255
        _NOISE[key] = (n - n.mean()) / (n.std() + 1e-6)
    return _NOISE[key]

def silhueta(img, scale=1.0, t=0):
    a = np.asarray(img.convert('RGB'), float) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    raw = np.clip((lum - 0.035) / 0.05, 0, 1)
    # tapa buracos fechados (fundo preto aparecendo entre o cabelo e o pescoço)
    solid = np.pad(((blur(raw, 2 * scale) > 0.5) * 255).astype(np.uint8), 1)   # borda vazia: o preenchimento começa fora dela
    m = Image.fromarray(solid).copy()   # cópia: a imagem presa ao array não recebe o preenchimento
    ImageDraw.floodfill(m, (0, 0), 128)
    holes = (np.asarray(m)[1:-1, 1:-1] == 0).astype(float)
    raw = np.maximum(raw, blur(holes, 1.5 * scale))
    # contorno limpo: fecha os buracos entre os fios de cabelo e alisa a borda
    mask = np.clip((blur(raw, 3 * scale) - 0.35) / 0.3, 0, 1)
    mask = blur(mask, 1.0 * scale)
    # frio: só onde o vídeo ficou azul de verdade (cabelo roxo não conta)
    cold = blur(np.clip((b - r - 0.05) / 0.35, 0, 1) * raw, 24 * scale)
    cold = np.clip(cold / np.maximum(blur(raw, 24 * scale), 1e-3) * 1.6, 0, 1)   # o frio se espalha e leva o cabelo junto
    core = blur(mask, 30 * scale)
    core = np.clip((core - 0.2) / 0.65, 0, 1)
    vol = blur(lum, 18 * scale) / np.maximum(blur(raw, 18 * scale), 1e-3)   # volume suave, sem traços do rosto
    vol = np.clip((vol - 0.25) / 0.5, 0, 1)
    hot_heat = 0.50 + 0.36 * core + 0.06 * vol
    cold_heat = 0.11 + 0.18 * core + 0.04 * vol
    heat = hot_heat * (1 - cold) + cold_heat * cold
    # leve tremor de calor subindo pelo corpo (dá vida sem desenhar o rosto)
    h, w = heat.shape
    n = _noise(h, w, scale)
    off = int(t * 1.5) % h
    heat = heat + n[h - off:2 * h - off] * 0.012
    heat = blur(heat, 2 * scale)
    col = LUT[np.clip(heat * 255, 0, 255).astype(np.uint8)] / 255
    # brilho em volta (calor irradiando), na cor do corpo
    wide = blur(mask, 20 * scale)
    halo = np.clip(wide * 1.5 - mask, 0, 1)[..., None] * 0.5
    halo_col = LUT[np.clip(blur(heat * mask, 20 * scale) / np.maximum(wide, 1e-3) * 255, 0, 255).astype(np.uint8)] / 255
    # borda mais clara, como o contorno quente numa câmera térmica
    rim = np.clip((mask - blur(mask, 3 * scale)) * 2.5, 0, 1)[..., None] * 0.45
    out = col * mask[..., None]
    out = out + halo_col * halo * (1 - mask[..., None])
    out = out + (1 - out) * rim * mask[..., None]
    return Image.fromarray(np.clip(out * 255, 0, 255).astype(np.uint8))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('entrada')
    ap.add_argument('saida')
    args = ap.parse_args()
    with tempfile.TemporaryDirectory() as tmp:
        src, dst = os.path.join(tmp, 'in'), os.path.join(tmp, 'out')
        os.makedirs(src); os.makedirs(dst)
        fps = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate',
                              '-of', 'csv=p=0', args.entrada], capture_output=True, text=True, check=True).stdout.strip() or '24'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', args.entrada, os.path.join(src, 'f_%04d.png')], check=True)
        quadros = sorted(os.listdir(src))
        for i, f in enumerate(quadros):
            silhueta(Image.open(os.path.join(src, f)), t=i).save(os.path.join(dst, f))
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', fps, '-i', os.path.join(dst, 'f_%04d.png'),
                        '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                        '-an', args.saida], check=True)
        capa = os.path.join(dst, quadros[min(7, len(quadros) - 1)])
        Image.open(capa).convert('RGB').save(os.path.splitext(args.saida)[0] + '.jpg', quality=84, optimize=True, progressive=True)
    print(f'{len(quadros)} quadros → {args.saida}')


if __name__ == '__main__':
    main()
