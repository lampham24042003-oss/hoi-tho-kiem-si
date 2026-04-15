import os
import sys
from PIL import Image

def process(path):
    try:
        img = Image.open(path).convert("RGBA")
        datas = img.getdata()
        newData = []
        for r, g, b, a in datas:
            lum = max(r, g, b)
            newData.append((r, g, b, lum))
        img.putdata(newData)
        img.save(path, "PNG")
        print(f"Fixed {path}")
    except Exception as e:
        print(f"Skipped {path}: {e}")

# Process specific generated image
process_override = "/Users/lap60488/.gemini/antigravity/brain/dacc25c1-99f0-4b69-8445-7a261ecd9b65/hit_zenitsu_ult2_v5_1776184257405.png"
out_override = "assets/effects/zenitsu_vfx/hit_zenitsu_ult2.png"
img_over = Image.open(process_override).convert("RGBA")
datas = img_over.getdata()
newData = []
for r, g, b, a in datas:
    lum = max(r, g, b)
    newData.append((r, g, b, lum))
img_over.putdata(newData)
img_over.save(out_override, "PNG")
print(f"Fixed overriding {out_override}")

# Process directory
d = "assets/effects/zenitsu_vfx"
for f in os.listdir(d):
    if f.endswith(".png"):
        process(os.path.join(d, f))

