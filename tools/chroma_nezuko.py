import os
import math
from PIL import Image

TOLERANCE = 180
FEATHER = 55
BG_COLOR = (0, 255, 255) # Cyan

def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def process_cyan_chroma(src_path, dest_path):
    img = Image.open(src_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            dist = color_distance((r, g, b), BG_COLOR)
            
            # Cyan is high G and high B, low R
            if g > 200 and b > 200 and r < 100:
                pixels[x, y] = (0, 0, 0, 0)
                continue

            if dist <= FEATHER:
                pixels[x, y] = (0, 0, 0, 0)
            elif dist <= TOLERANCE:
                if r < 150: # strict threshold
                    ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
                    a_new = int(round((ratio ** 2) * 255))
                    # Force black for mixed edge pixels (Rule 9: Force Black Edge)
                    pixels[x, y] = (0, 0, 0, a_new)

    # NO CROP! (Rule 10 strictly specifies no crop to prevent stretching)
                    
    dest_dir = os.path.dirname(dest_path)
    if dest_dir:
        os.makedirs(dest_dir, exist_ok=True)
    img.save(dest_path)
    print(f"✓ CHROMA SAVED: {dest_path}")

src_folder = "/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/assets/sprites/nezuko sprites"
dest_folder = "/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/assets/sprites"

for filename in os.listdir(src_folder):
    if filename.endswith(".png"):
        process_cyan_chroma(os.path.join(src_folder, filename), os.path.join(dest_folder, filename))
