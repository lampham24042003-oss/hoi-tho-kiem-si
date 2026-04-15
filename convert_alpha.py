import sys
from PIL import Image

def process(path, out):
    img = Image.open(path).convert("RGBA")
    datas = img.getdata()
    newData = []
    for r, g, b, a in datas:
        lum = max(r, g, b)
        # Tweak: ensure strong opacity on yellow
        newData.append((r, g, b, lum))
    img.putdata(newData)
    img.save(out, "PNG")
    print(f"Fixed {out}")

process("/Users/lap60488/.gemini/antigravity/brain/dacc25c1-99f0-4b69-8445-7a261ecd9b65/hit_zenitsu_ult1_v5_1776184009017.png", "assets/effects/zenitsu_vfx/hit_zenitsu_ult1.png")
