import os
import numpy as np
from PIL import Image
from concurrent.futures import ProcessPoolExecutor

TOLERANCE = 180
FEATHER = 55
BG_COLOR = np.array([0, 255, 255]) # Cyan

def process_cyan_chroma_fast(task):
    src_path, dest_path = task
    try:
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

        cyan_mask = (g > 200) & (b > 200) & (r < 100)
        new_a[cyan_mask] = 0

        feather_mask = (~cyan_mask) & (dist <= FEATHER)
        new_a[feather_mask] = 0

        tol_mask = (~cyan_mask) & (~feather_mask) & (dist <= TOLERANCE) & (r < 150)
        
        ratio = (dist[tol_mask] - FEATHER) / (TOLERANCE - FEATHER)
        new_a[tol_mask] = np.round((ratio ** 2) * 255)
        
        new_r[tol_mask] = 0
        new_g[tol_mask] = 0
        new_b[tol_mask] = 0

        out_data = np.stack((new_r, new_g, new_b, new_a), axis=2).astype(np.uint8)
        out_img = Image.fromarray(out_data, mode="RGBA")
        
        dest_dir = os.path.dirname(dest_path)
        if dest_dir:
            os.makedirs(dest_dir, exist_ok=True)
        # compress_level=1 reduces saving time from 5s to 0.5s per image
        out_img.save(dest_path, compress_level=1)
        print(f"✓ DONE: {os.path.basename(dest_path)}", flush=True)
    except Exception as e:
        print(f"✗ ERROR on {os.path.basename(dest_path)}: {e}")

if __name__ == '__main__':
    src_folder = "/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/assets/sprites/nezuko sprites"
    dest_folder = "/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/assets/sprites"

    tasks = []
    for filename in os.listdir(src_folder):
        if filename.endswith(".png"):
            tasks.append((os.path.join(src_folder, filename), os.path.join(dest_folder, filename)))
    
    print(f"Bắt đầu xử lý {len(tasks)} images bằng Multi-Processing...", flush=True)
    with ProcessPoolExecutor() as executor:
        executor.map(process_cyan_chroma_fast, tasks)
    print("HOÀN TẤT TẤT CẢ TỆP!", flush=True)
