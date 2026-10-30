#!/usr/bin/env python3
"""Turns the key images of the house into 3D scenes for the 3D version of the film (assets/js/film3d.js).

Each image becomes a mesh: the photo itself is the texture and every vertex sits at the depth the
image shows. A second, small layer sits behind the edges of the furniture with the background
continued under it, so moving the camera reveals background instead of holes.

  pip install torch transformers pillow opencv-python-headless numpy
  python3 tools/make-3d.py door=path/door.jpg:1.6 living=path/living.jpg:1.4 ...

  name=image:camera_height_in_metres   (the height used in the image prompts: PROMPTS.md)

Depth comes from Depth Anything V2 Small (Apache-2.0). It only gives relative depth; the real
scale comes from the floor: with a level camera at a known height and a 24 mm lens, the floor at
each row of the image is at a known distance, and the model's depth is fitted to it.

Writes assets/3d/<name>.bin, <name>.jpg (photo), <name>.bg.jpg (photo with the background continued
behind the edges) and assets/3d/scenes.js. In the .bin: front depth and background depth (Uint16, cm,
one per vertex) and one byte per mesh cell: bit 0 = the surface jumps in this cell (the front can tear
there when the camera moves), bit 1 = draw the background layer here.
"""
import json
import os
import sys

import cv2
import numpy as np
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForDepthEstimation

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', '3d')
HFOV = 73.7  # 24 mm lens on full frame, as in the image prompts
STEP = 4  # pixels between mesh vertices
FAR = 60.0  # metres: sky and anything farther


def disparity(model, proc, img):
    W, H = img.size
    inputs = proc(images=img, return_tensors='pt', size={'height': 770, 'width': 1372}, do_resize=True,
                  keep_aspect_ratio=True, ensure_multiple_of=14)
    with torch.no_grad():
        pred = model(**inputs).predicted_depth
    d = torch.nn.functional.interpolate(pred[:, None], size=(H, W), mode='bicubic', align_corners=False)
    return d[0, 0].numpy().astype(np.float64)


def fit_floor(disp, f, h):
    """disp ≈ a / z + b on the floor, where 1/z = (v - cy) / (f h) for a level camera."""
    H, W = disp.shape
    cy = H / 2
    v0 = int(cy + 0.3 * (H - cy))
    vs, us = np.mgrid[v0:H:3, 0:W:3]
    x = ((vs - cy) / (f * h)).ravel()
    y = disp[vs, us].ravel()
    rng = np.random.default_rng(0)
    best, best_n = None, -1
    tol = 0.02 * (np.percentile(y, 95) - np.percentile(y, 5))
    for _ in range(400):
        i, j = rng.choice(len(x), 2, replace=False)
        if abs(x[i] - x[j]) < 1e-6:
            continue
        a = (y[i] - y[j]) / (x[i] - x[j])
        if a <= 0:
            continue
        b = y[i] - a * x[i]
        # the floor is the farthest surface on each row: objects only sit above the line (closer)
        r = y - (a * x + b)
        n = np.count_nonzero(np.abs(r) < tol) - 0.25 * np.count_nonzero(r < -tol)
        if n > best_n:
            best, best_n = (a, b), n
    a, b = best
    inl = np.abs(y - (a * x + b)) < tol
    A = np.stack([x[inl], np.ones(inl.sum())], 1)
    a, b = np.linalg.lstsq(A, y[inl], rcond=None)[0]
    return a, b, inl.mean()


def sharpen(disp, k=7):
    """Snap each value to the local min or max, whichever is closer: object edges become one pixel sharp."""
    lo = cv2.erode(disp.astype(np.float32), np.ones((k, k), np.uint8))
    hi = cv2.dilate(disp.astype(np.float32), np.ones((k, k), np.uint8))
    mid = cv2.medianBlur(disp.astype(np.float32), 5)
    edge = (hi - lo) > 0.04 * (hi + 1e-6)
    snapped = np.where(np.abs(mid - lo) < np.abs(hi - mid), lo, hi)
    return np.where(edge, snapped, mid)


def jumps(inv):
    """Grid edges where the surface jumps (not just tilts): big step in inverse depth compared with its neighbours."""
    gx = np.abs(np.diff(inv, axis=1))
    gy = np.abs(np.diff(inv, axis=0))

    def mark(g, axis):
        ref = np.maximum(np.roll(g, 1, axis), np.roll(g, -1, axis))
        rel = g / (np.maximum(inv[:, :-1], inv[:, 1:]) if axis == 1 else np.maximum(inv[:-1], inv[1:]))
        return (g > 3.0 * ref + 1e-4) & (rel > 0.03) | (rel > 0.18)

    return mark(gx, 1), mark(gy, 0)


def background(img, inv_full, band):
    """Continue the background under the band (near side of each jump): each band pixel takes depth and
    colour from its farthest neighbour, repeatedly, so the far side spreads in."""
    depth = 1.0 / np.maximum(inv_full, 1e-6)
    col = img.astype(np.float32)
    known = ~band
    d = np.where(known, depth, 0.0)
    for _ in range(40):
        best = d.copy()
        bc = col.copy()
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (1, -1), (-1, 1), (-1, -1)):
            nd = np.roll(np.roll(d, dy, 0), dx, 1)
            nc = np.roll(np.roll(col, dy, 0), dx, 1)
            take = band & (nd > best + 1e-6)
            best = np.where(take, nd, best)
            bc = np.where(take[..., None], nc, bc)
        if np.array_equal(best, d):
            break
        d, col = best, bc
    d = np.where(band & (d == 0), depth, d)
    col = cv2.GaussianBlur(col, (0, 0), 3.5)
    out = np.where(band[..., None], col, img.astype(np.float32))
    return np.clip(out, 0, 255).astype(np.uint8), d


def build(name, path, h, model, proc):
    img = Image.open(path).convert('RGB')
    W, H = img.size
    f = (W / 2) / np.tan(np.radians(HFOV / 2))
    disp = disparity(model, proc, img)
    a, b, share = fit_floor(disp, f, h)
    inv = np.clip((sharpen(disp) - b) / a, 1.0 / FAR, None)  # inverse depth in 1/m
    # mesh grid
    gw, gh = W // STEP + 1, H // STEP + 1
    us = np.clip(np.arange(gw) * STEP, 0, W - 1)
    vs = np.clip(np.arange(gh) * STEP, 0, H - 1)
    ginv = inv[np.ix_(vs, us)]
    jx, jy = jumps(ginv)
    # a cell is cut on the front layer if any of its edges jumps
    cut = np.zeros((gh - 1, gw - 1), bool)
    cut |= jx[:-1, :] | jx[1:, :]
    cut |= jy[:, :-1] | jy[:, 1:]
    # band: vertices up to 6 cells from a jump that stand in front of a farther surface nearby
    # (the near side, where the camera moving can reveal what is behind)
    touch = np.zeros((gh, gw), bool)
    touch[:, :-1] |= jx
    touch[:, 1:] |= jx
    touch[:-1, :] |= jy
    touch[1:, :] |= jy
    k = np.ones((13, 13), np.uint8)
    close = cv2.dilate(touch.astype(np.uint8), k) > 0
    farthest = cv2.erode(ginv.astype(np.float32), k)
    bandv = close & (ginv > farthest * 1.06)
    bandc = (bandv[:-1, :-1] | bandv[1:, :-1] | bandv[:-1, 1:] | bandv[1:, 1:]) | cut
    # background layer at full resolution (soft, rounded band: no blocks)
    soft = cv2.resize(bandv.astype(np.float32), (W, H), interpolation=cv2.INTER_LINEAR)
    band_full = cv2.GaussianBlur(soft, (0, 0), 3.0) > 0.2
    rgb = np.asarray(img)
    bg_rgb, bg_depth = background(rgb, inv, band_full)
    gdepth = 1.0 / ginv
    gbg = np.where(bandv, bg_depth[np.ix_(vs, us)], gdepth)
    gbg = np.maximum(gbg, gdepth)
    # files
    os.makedirs(OUT, exist_ok=True)
    to_cm = lambda z: np.clip(np.round(z * 100), 1, 65535).astype('<u2')
    flags = (cut.astype(np.uint8) | (bandc.astype(np.uint8) << 1))
    with open(os.path.join(OUT, name + '.bin'), 'wb') as fh:
        fh.write(to_cm(gdepth).tobytes())
        fh.write(to_cm(gbg).tobytes())
        fh.write(flags.tobytes())
    img.save(os.path.join(OUT, name + '.jpg'), quality=90, optimize=True, progressive=True)
    Image.fromarray(bg_rgb).save(os.path.join(OUT, name + '.bg.jpg'), quality=85, optimize=True, progressive=True)
    med = float(np.median(gdepth))
    print(f'{name}: floor fit a={a:.3f} b={b:.3f} ({share:.0%} of the bottom rows on the floor), '
          f'depth p5/median/p95 = {np.percentile(gdepth, 5):.2f}/{med:.2f}/{np.percentile(gdepth, 95):.2f} m, '
          f'cut cells {cut.mean():.1%}, background cells {bandc.mean():.1%}', flush=True)
    return {'grid': [int(gw), int(gh)], 'size': [W, H], 'step': STEP, 'f': round(float(f), 2), 'height': h,
            'median': round(med, 2)}


def main():
    proc = AutoImageProcessor.from_pretrained('depth-anything/Depth-Anything-V2-Small-hf')
    model = AutoModelForDepthEstimation.from_pretrained('depth-anything/Depth-Anything-V2-Small-hf').eval()
    torch.set_num_threads(os.cpu_count() or 4)
    scenes = {}
    for arg in sys.argv[1:]:
        name, rest = arg.split('=', 1)
        path, h = rest.rsplit(':', 1)
        scenes[name] = build(name, path, float(h), model, proc)
    manifest = os.path.join(OUT, 'scenes.js')
    old = {}
    if os.path.exists(manifest):
        try:
            old = json.loads(open(manifest).read().split('=', 1)[1].rstrip().rstrip(';'))
        except Exception:
            old = {}
    old.update(scenes)
    with open(manifest, 'w') as fh:
        fh.write('/* Gerado pelo tools/make-3d.py: as cenas 3D do filme. Não edite à mão. */\n')
        fh.write('window.NUVO_3D = ' + json.dumps(old, indent=2) + ';\n')
    print('→', os.path.normpath(manifest))


if __name__ == '__main__':
    main()
