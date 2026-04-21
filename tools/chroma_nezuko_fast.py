import os
import numpy as np
from PIL import Image

TOLERANCE = 180
FEATHER = 55
BG_COLOR = np.array([0, 255, 255]) # Cyan

def process_cyan_chroma_fast(src_path, dest_path):
    img = Image.open(src_path).convert("RGBA")
    data = np.array(img, dtype=np.float32)

    r = data[:, :, 0]
    g = data[:, :, 1]
    b = data[:, :, 2]
    a = data[:, :, 3]

    # Calculate distance for all pixels at once
    dist = np.sqrt(np.sum((data[:, :, :3] - BG_COLOR) ** 2, axis=2))
    
    # Create copies of arrays to modify
    new_a = np.copy(a)
    new_r = np.copy(r)
    new_g = np.copy(g)
    new_b = np.copy(b)

    # Condition 1: Pure Cyan check (High G, High B, Low R)
    cyan_mask = (g > 200) & (b > 200) & (r < 100)
    new_a[cyan_mask] = 0

    # Condition 2: Feather distance check
    feather_mask = (~cyan_mask) & (dist <= FEATHER)
    new_a[feather_mask] = 0

    # Condition 3: Tolerance check with blending
    tol_mask = (~cyan_mask) & (~feather_mask) & (dist <= TOLERANCE) & (r < 150)
    
    # Calculate alpha ratio for blending
    ratio = (dist[tol_mask] - FEATHER) / (TOLERANCE - FEATHER)
    new_a[tol_mask] = np.round((ratio ** 2) * 255)
    
    # Force black for mixed edge pixels
    new_r[tol_mask] = 0
    new_g[tol_mask] = 0
    new_b[tol_mask] = 0

    # Recombine and save
    out_data = np.stack((new_r, new_g, new_b, new_a), axis=2).astype(np.uint8)
    out_img = Image.fromarray(out_data, "RGBA")
    
    dest_dir = os.path.dirname(dest_path)
    if dest_dir:
        os.makedirs(dest_dir, exist_ok=True)
    out_img.save(dest_path)
    print(f"✓ FAST CHROMA SAVED: {dest_path}")

src_folder = "/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/assets/sprites/nezuko sprites"
dest_folder = "/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/assets/sprites"

for filename in os.listdir(src_folder):
    if filename.endswith(".png"):
        process_cyan_chroma_fast(os.path.join(src_folder, filename), os.path.join(dest_folder, filename))
