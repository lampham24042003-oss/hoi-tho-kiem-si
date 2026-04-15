import os
import sys
from PIL import Image

def convert_to_transparent(path):
    try:
        img = Image.open(path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # item is (R, G, B, A)
            r, g, b, a = item
            # Use max luminance for alpha channel
            lum = max(r, g, b)
            # Prevent pure black from appearing, set alpha to lum
            newData.append((r, g, b, lum))
            
        img.putdata(newData)
        # overwrite the same file, keeping png extension
        img.save(path, "PNG")
        print(f"Fixed {path}")
    except Exception as e:
        print(f"Error on {path}: {e}")

effects_dir = "assets/effects"
for f in os.listdir(effects_dir):
    if f.endswith(".png") and "hit_" in f or "aura" in f or "impact" in f:
        path = os.path.join(effects_dir, f)
        convert_to_transparent(path)

print("Done converting VFX to true transparent PNGs!")
