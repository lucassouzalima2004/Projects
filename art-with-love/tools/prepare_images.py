"""Turn phone photos into the product images the shop uses.

    python3 tools/prepare_images.py photo1.jpg photo2.jpg --name mermaid-doll-bow

Each photo becomes public/assets/products/<name>-<n>-s.webp (480 px wide, for grids)
and <name>-<n>-l.webp (960 px wide, for the product page), cropped to 3:4.
--rotate cw|ccw turns sideways photos upright. Needs Pillow (pip install pillow).
"""
import argparse
import pathlib

from PIL import Image, ImageOps

OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "assets" / "products"
SIZES = {"s": (480, 70), "l": (960, 72)}  # width, WebP quality


def to_portrait_3x4(im):
    w, h = im.size
    if w * 4 > h * 3:  # too wide: trim the sides
        nw = h * 3 // 4
        return im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    nh = w * 4 // 3  # too tall: trim top and bottom
    return im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))


def prepare(src, name, index, rotate=None):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    if rotate == "ccw":
        im = im.rotate(90, expand=True)
    elif rotate == "cw":
        im = im.rotate(-90, expand=True)
    im = to_portrait_3x4(im)
    OUT.mkdir(parents=True, exist_ok=True)
    for tag, (width, quality) in SIZES.items():
        out = im.resize((width, width * 4 // 3), Image.LANCZOS) if im.width > width else im
        out.save(OUT / f"{name}-{index}-{tag}.webp", "WEBP", quality=quality, method=6)


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("photos", nargs="+")
    p.add_argument("--name", required=True, help="product id, e.g. mermaid-doll-bow")
    p.add_argument("--rotate", choices=["cw", "ccw"])
    p.add_argument("--start", type=int, default=1, help="number of the first photo (default 1)")
    a = p.parse_args()
    for i, photo in enumerate(a.photos, a.start):
        prepare(photo, a.name, i, a.rotate)
        print(f"{a.name}-{i}: ok")
