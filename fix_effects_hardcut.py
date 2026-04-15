import os
import sys
from PIL import Image

def convert_to_transparent_hardcut(path):
    try:
        img = Image.open(path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            r, g, b, a = item
            lum = max(r, g, b)
            
            # HARD CUT: Make dark pixels completely transparent!
            if lum < 40:
                newData.append((0, 0, 0, 0))
            else:
                # To prevent source-over from darkening the background during blend fallbacks,
                # we artificially brighten the RGB values slightly so it always acts as a "light" overlay.
                scale = 255.0 / max(1, lum)
                nr = min(255, int(r * scale))
                ng = min(255, int(g * scale))
                nb = min(255, int(b * scale))
                
                # Make alpha proportional to original brightness
                alpha = int(lum * 1.5)
                if alpha > 255: alpha = 255
                
                newData.append((nr, ng, nb, alpha))
            
        img.putdata(newData)
        img.save(path, "PNG")
        print(f"Hard-fixed {path}")
    except Exception as e:
        print(f"Error on {path}: {e}")

effects_dir = "assets/effects"
for f in os.listdir(effects_dir):
    if f.endswith(".png") and "hit_" in f or "aura" in f or "impact" in f:
        path = os.path.join(effects_dir, f)
        convert_to_transparent_hardcut(path)

print("Done converting VFX to extremely bright hard-cut PNGs!")
