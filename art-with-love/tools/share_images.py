"""Imagens de compartilhamento (WhatsApp, Instagram, Google) e miniaturas do checkout.

    python3 tools/share_images.py            # cria só as que faltam
    python3 tools/share_images.py --force    # refaz todas

Para cada produto (e cada cor) do catálogo:
  public/assets/og/<id>.jpg              1200×630, prévia do link do produto
  public/assets/products/<id>-sq.jpg     600×600, foto na página de pagamento do Stripe
E também a prévia geral do site (public/assets/img/og-image.jpg) e os ícones.

Rode depois de prepare_images.py. Precisa de Pillow e do Node (para ler o catálogo).
"""
import argparse
import json
import math
import pathlib
import subprocess

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
PRODUCTS = PUBLIC / "assets" / "products"
OG = PUBLIC / "assets" / "og"
IMG = PUBLIC / "assets" / "img"
FONTS = pathlib.Path(__file__).resolve().parent / "fonts"

MILK = (251, 247, 243)
INK = (36, 22, 38)
INK2 = (94, 76, 97)
HOLO = [(245, 157, 194), (205, 176, 246), (159, 207, 244), (168, 230, 207), (248, 205, 164)]
BLUE = [(158, 216, 248), (79, 134, 236), (108, 78, 216)]  # coração e borboleta do logo dela


def catalog():
    js = "import('./public/assets/js/catalog.js').then(m => process.stdout.write(JSON.stringify(m.default)))"
    out = subprocess.run(["node", "--input-type=module", "-e", js], cwd=ROOT, check=True, capture_output=True, text=True)
    return json.loads(out.stdout)


def font(name, size, wght=None, opsz=None):
    f = ImageFont.truetype(str(FONTS / name), size)
    if wght or opsz:
        axes = {a["name"].lower() if isinstance(a["name"], str) else a["name"].decode().lower(): a for a in f.get_variation_axes()}
        values = []
        for key, a in axes.items():
            if key.startswith("weight") and wght:
                values.append(wght)
            elif key.startswith("optical") and opsz:
                values.append(opsz)
            else:
                values.append(a["default"])
        f.set_variation_by_axes(values)
    return f


def holo_gradient(w, h, stops=HOLO):
    g = Image.new("RGB", (w, 1))
    for x in range(w):
        t = x / max(1, w - 1) * (len(stops) - 1)
        i = min(int(t), len(stops) - 2)
        f = t - i
        g.putpixel((x, 0), tuple(round(stops[i][c] * (1 - f) + stops[i + 1][c] * f) for c in range(3)))
    return g.resize((w, h))


def background(w, h):
    bg = Image.new("RGB", (w, h), MILK)
    blobs = Image.new("RGBA", (w, h), MILK + (0,))  # transparente, mas na cor do fundo (o desfoque não escurece)
    d = ImageDraw.Draw(blobs)
    for (cx, cy, r, col) in [(0.12, 0.15, 0.32, HOLO[0]), (0.9, 0.2, 0.3, HOLO[2]), (0.55, 0.95, 0.3, HOLO[1]), (0.95, 0.95, 0.2, HOLO[3])]:
        R = r * w
        d.ellipse([cx * w - R, cy * h - R, cx * w + R, cy * h + R], fill=col + (150,))
    bg.paste(blobs.filter(ImageFilter.GaussianBlur(w / 9)), (0, 0), blobs.filter(ImageFilter.GaussianBlur(w / 9)))
    return bg


def rounded(im, r):
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1], r, fill=255)
    out = im.convert("RGBA")
    out.putalpha(mask)
    return out


def hang_card(canvas, photo, cx, top, w, angle):
    """Cola uma foto como cartela pendurada: sombra, cantos redondos e prendedor."""
    h = w * 4 // 3
    card = rounded(photo.resize((w, h), Image.LANCZOS), max(12, w // 16))
    pad = 60
    layer = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    shadow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([pad, pad + 18, pad + w, pad + h + 18], w // 16, fill=INK + (110,))
    layer = Image.alpha_composite(layer, shadow.filter(ImageFilter.GaussianBlur(18)))
    layer.alpha_composite(card, (pad, pad))
    peg = Image.new("RGBA", (16, 44), (0, 0, 0, 0))
    pd = ImageDraw.Draw(peg)
    pd.rounded_rectangle([0, 0, 15, 43], 4, fill=(240, 226, 208))
    pd.rectangle([3, 17, 12, 20], fill=(184, 156, 126))
    layer.alpha_composite(peg, (pad + w // 2 - 8, pad - 24))
    layer = layer.rotate(angle, resample=Image.BICUBIC, expand=False, center=(pad + w // 2, pad))
    canvas.paste(layer, (cx - w // 2 - pad, top - pad), layer)


def ribbon(canvas, x0, x1, y, sag):
    k = 3  # desenha em escala maior e reduz, para a linha sair lisa
    layer = Image.new("RGBA", (canvas.width * k, canvas.height * k), (238, 172, 198, 0))
    d = ImageDraw.Draw(layer)
    pts = [((x0 + (x1 - x0) * t) * k, (y + 4 * sag * t * (1 - t)) * k) for t in (i / 120 for i in range(121))]
    d.line(pts, fill=(238, 172, 198, 255), width=8 * k, joint="curve")
    d.line([(x, yy - 2 * k) for x, yy in pts], fill=(251, 222, 233, 255), width=2 * k)
    layer = layer.resize(canvas.size, Image.LANCZOS)
    canvas.paste(layer, (0, 0), layer)


def heart(d, cx, cy, s, fill):
    pts = []
    for i in range(200):
        t = i / 200 * 2 * math.pi
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * s, cy - y * s))
    d.polygon(pts, fill=fill)


def logo(canvas, x, y, size, center=False):
    d = ImageDraw.Draw(canvas)
    f = font("Allura.ttf", size)
    by = font("Jost.ttf", max(12, size // 4), wght=500)
    # "Art with L" + coração azul no lugar do "o" + "ve", como nas cartelas dela
    left, right = "Art with L", "ve"
    hw = size * 0.46
    w = d.textlength(left, font=f) + hw + d.textlength(right, font=f)
    x0 = x - w / 2 if center else x
    d.text((x0, y), left, font=f, fill=(20, 16, 20))
    hx = x0 + d.textlength(left, font=f)
    big = int(hw * 4)
    mask = Image.new("L", (big, big), 0)
    heart(ImageDraw.Draw(mask), big / 2, big / 2, big / 36, 255)
    grad = holo_gradient(big, big, BLUE).rotate(-35, resample=Image.BICUBIC)
    hs = int(hw)
    canvas.paste(grad.resize((hs, hs), Image.LANCZOS), (int(hx), int(y + size * 0.5)), mask.resize((hs, hs), Image.LANCZOS))
    d.text((hx + hw, y), right, font=f, fill=(20, 16, 20))
    sub = "BY LULU  ·  LONDON"
    spacing = size // 14
    sw = sum(d.textlength(c, font=by) + spacing for c in sub) - spacing
    sx = x - sw / 2 if center else x0 + 4
    for c in sub:
        d.text((sx, y + size * 1.08), c, font=by, fill=INK2)
        sx += d.textlength(c, font=by) + spacing


def wrap(d, text, f, width):
    lines, cur = [], ""
    for word in text.split():
        test = f"{cur} {word}".strip()
        if d.textlength(test, font=f) <= width:
            cur = test
        else:
            lines.append(cur)
            cur = word
    lines.append(cur)
    return lines


def pill(canvas, x, y, text):
    d = ImageDraw.Draw(canvas)
    f = font("Jost.ttf", 19, wght=500)
    spacing = 3
    tw = sum(d.textlength(c, font=f) + spacing for c in text) - spacing
    w, h = int(tw + 44), 46
    g = rounded(holo_gradient(w, h), h // 2)
    canvas.paste(g, (x, y), g)
    tx = x + 22
    for c in text:
        d.text((tx, y + 10), c, font=f, fill=INK)
        tx += d.textlength(c, font=f) + spacing


def product_card(photo, title, subtitle, out):
    W, H = 1200, 630
    c = background(W, H)
    ribbon(c, -40, 640, 40, 26)
    hang_card(c, photo, 320, 66, 390, 3)
    logo(c, 660, 70, 64)
    d = ImageDraw.Draw(c)
    f = font("BodoniModa.ttf", 64, wght=500, opsz=72)
    lines = wrap(d, title, f, 470)[:3]
    y = 215
    for line in lines:
        d.text((660, y), line, font=f, fill=INK)
        y += 74
    d.text((662, y + 14), subtitle, font=font("Jost.ttf", 26, wght=400), fill=INK2)
    pill(c, 660, y + 74, "HANDMADE IN LONDON")
    c.convert("RGB").save(out, "JPEG", quality=86, optimize=True, progressive=True)


def site_card(photos, out):
    W, H = 1200, 630
    c = background(W, H)
    logo(c, W // 2, 52, 92, center=True)
    d = ImageDraw.Draw(c)
    f = font("BodoniModa-Italic.ttf", 34, wght=400, opsz=40)
    t = "Luxury handmade bows, tied with love"
    d.text(((W - d.textlength(t, font=f)) / 2, 222), t, font=f, fill=INK2)
    ribbon(c, -40, W + 40, 300, 60)
    xs = [150, 375, 600, 825, 1050]
    for i, (x, p) in enumerate(zip(xs, photos)):
        t = (x + 40) / (W + 80)
        top = int(300 + 4 * 60 * t * (1 - t)) + 14
        hang_card(c, p, x, top, 176, (-4, 3, -2, 4, -3)[i])
    c.convert("RGB").save(out, "JPEG", quality=86, optimize=True, progressive=True)


def square(photo, out):
    w, h = photo.size
    s = min(w, h)
    sq = photo.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2)).resize((600, 600), Image.LANCZOS)
    sq.convert("RGB").save(out, "JPEG", quality=84, optimize=True)


def icons():
    for size, name in [(180, "apple-touch-icon.png"), (512, "icon-512.png"), (192, "icon-192.png")]:
        big = size * 4
        im = Image.new("RGB", (big, big), (255, 255, 255))
        mask = Image.new("L", (big, big), 0)
        heart(ImageDraw.Draw(mask), big / 2, big / 2 + big * 0.02, big / 46, 255)
        grad = holo_gradient(big, big, BLUE).rotate(-35, resample=Image.BICUBIC, expand=False)
        im.paste(grad, (0, 0), mask)
        im.resize((size, size), Image.LANCZOS).save(IMG / name, optimize=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    shop = catalog()
    OG.mkdir(parents=True, exist_ok=True)
    made = 0
    for p in shop["products"]:
        range_name = next((c["name"] for c in shop["collections"] if c["id"] == p["range"]), "")
        for v in p.get("variants") or [None]:
            base = f"{p['id']}-{v['id']}" if v else p["id"]
            src = PRODUCTS / f"{base}-1-l.webp"
            if not src.exists():
                print(f"sem foto: {src.name} (rode prepare_images.py)")
                continue
            photo = Image.open(src).convert("RGB")
            og, sq = OG / f"{base}.jpg", PRODUCTS / f"{base}-sq.jpg"
            if a.force or not og.exists():
                title = p["name"]
                subtitle = " · ".join(x for x in [v["name"] if v else None, p.get("size"), range_name] if x)
                product_card(photo, title, subtitle, og)
                made += 1
            if a.force or not sq.exists():
                square(photo, sq)
                made += 1
    site = IMG / "og-image.jpg"
    if a.force or not site.exists():
        ids = ["lollipop-bow", "teddy-bow", "mermaid-doll-bow", "flamingo-pompom-bow", "red-velvet-bow-pair"]
        photos = [Image.open(PRODUCTS / f"{i}-1-l.webp").convert("RGB") for i in ids if (PRODUCTS / f"{i}-1-l.webp").exists()]
        if len(photos) == 5:
            site_card(photos, site)
            made += 1
    if a.force or not (IMG / "apple-touch-icon.png").exists():
        icons()
        made += 3
    print(f"{made} imagens criadas")


if __name__ == "__main__":
    main()
