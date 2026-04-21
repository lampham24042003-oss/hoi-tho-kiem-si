import os
import math
from PIL import Image

# Nền cyan #00FFFF (0, 255, 255)
BG_COLOR  = (0, 255, 255)
TOLERANCE = 180
FEATHER   = 50

def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def process_cyan_chroma(src_path, dest_path):
    img    = Image.open(src_path).convert("RGBA")
    pixels = img.load()
    w, h   = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            dist = color_distance((r, g, b), BG_COLOR)

            # Hard kill: rõ ràng là cyan thuần (g cao, r thấp, b cao)
            if g > 180 and r < 60 and b > 180:
                pixels[x, y] = (0, 0, 0, 0)
                continue

            if dist <= FEATHER:
                pixels[x, y] = (0, 0, 0, 0)
            elif dist <= TOLERANCE:
                ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
                a_new = int(round((ratio ** 2) * 255))
                pixels[x, y] = (r, g, b, a_new)

    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    img.save(dest_path, "PNG")
    print(f"✓ Saved: {dest_path}")

vfx_dir = "/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/assets/effects/nezuko_vfx/"

process_cyan_chroma(vfx_dir + "nezuko_cinematic_ulti_0.jpeg", vfx_dir + "cinematic_nezuko_ult0.png")
process_cyan_chroma(vfx_dir + "nezuko_cinematic_ulti_1.jpeg", vfx_dir + "cinematic_nezuko_ult1.png")
process_cyan_chroma(vfx_dir + "nezuko_cinematic_ulti_2.jpeg", vfx_dir + "cinematic_nezuko_ult2.png")

print("Done!")
