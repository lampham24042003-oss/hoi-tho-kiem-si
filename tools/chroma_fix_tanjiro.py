import os
import numpy as np
from PIL import Image

TOLERANCE = 180
FEATHER = 55
BG_COLOR = np.array([255, 0, 255]) # Magenta

def process_magenta_chroma_fast(src_path, dest_path):
    img = Image.open(src_path).convert("RGBA")
    data = np.array(img, dtype=np.float32)

    r = data[:, :, 0]
    g = data[:, :, 1]
    b = data[:, :, 2]
    a = data[:, :, 3]

    dist = np.sqrt(np.sum((data[:, :, :3] - BG_COLOR) ** 2, axis=2))
    
    new_a = np.copy(a)
    new_r = np.copy(r)
    new_g = np.copy(g)
    new_b = np.copy(b)

    # Magenta: High R, High B, Low G
    magenta_mask = (r > 200) & (b > 200) & (g < 100)
    new_a[magenta_mask] = 0

    feather_mask = (~magenta_mask) & (dist <= FEATHER)
    new_a[feather_mask] = 0

    tol_mask = (~magenta_mask) & (~feather_mask) & (dist <= TOLERANCE) & (g < 150)
    
    ratio = (dist[tol_mask] - FEATHER) / (TOLERANCE - FEATHER)
    new_a[tol_mask] = np.round((ratio ** 2) * 255)
    
    # Force black outline
    new_r[tol_mask] = 0
    new_g[tol_mask] = 0
    new_b[tol_mask] = 0

    out_data = np.stack((new_r, new_g, new_b, new_a), axis=2).astype(np.uint8)
    out_img = Image.fromarray(out_data, mode="RGBA")
    
    dest_dir = os.path.dirname(dest_path)
    if dest_dir:
        os.makedirs(dest_dir, exist_ok=True)
    out_img.save(dest_path, compress_level=1)
    print(f"✓ FIXED TANJIRO MAGENTA: {dest_path}")

src = "/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/assets/sprites/nezuko sprites/tanjiro_ulti2_slash.png"
dest = "/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/assets/sprites/tanjiro_ulti2_slash.png"

if os.path.exists(src):
    process_magenta_chroma_fast(src, dest)
else:
    print(f"NOT FOUND: {src}")
