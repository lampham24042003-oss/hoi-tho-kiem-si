import os
import math
from PIL import Image

TOLERANCE = 180
FEATHER = 55
BG_COLOR = (255, 0, 255)

def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def process_magenta_chroma(src_path, dest_path):
    img = Image.open(src_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            dist = color_distance((r, g, b), BG_COLOR)
            
            # Additional check: If it's very close to magenta, kill it
            if r > 200 and b > 200 and g < 100:
                pixels[x, y] = (0, 0, 0, 0)
                continue

            if dist <= FEATHER:
                pixels[x, y] = (0, 0, 0, 0)
            elif dist <= TOLERANCE:
                if g < 150: 
                    ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
                    a_new = int(round((ratio ** 2) * 255))
                    # Retain original RGB, just modify Alpha (to preserve golden glow)
                    pixels[x, y] = (r, g, b, a_new)

    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    img.save(dest_path)
    print(f"✓ NO-CROP CHROMA SAVED: {dest_path}")

base_dir = "/Users/lap60488/.gemini/antigravity/brain/dacc25c1-99f0-4b69-8445-7a261ecd9b65/"
out_dir = "/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/assets/effects/zenitsu_vfx/"

process_magenta_chroma(base_dir + "raw_cine_ult0_1776189276157.png", out_dir + "cinematic_zenitsu_ult0.png")
process_magenta_chroma(base_dir + "raw_cine_ult1_1776189405647.png", out_dir + "cinematic_zenitsu_ult1.png")
process_magenta_chroma(base_dir + "raw_cine_ult2_1776189451222.png", out_dir + "cinematic_zenitsu_ult2.png")
print("Done!")
