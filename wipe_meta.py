import os
from PIL import Image

def process(path):
    print(f"Wiping {path}")
    img = Image.open(path).convert("RGBA")
    # Greate a brand new, empty image
    out = Image.new("RGBA", img.size, (0,0,0,0))
    # Paste
    out.paste(img, (0,0))
    # Save, deleting ALL metadata (icc_profile, exif, etc)
    out.save(path, "PNG", icc_profile=None, exif=None)

effects_dir = "assets/effects"
for f in os.listdir(effects_dir):
    if f.endswith("_v3.png"):
        process(os.path.join(effects_dir, f))

print("DONE WIPING METADATA!")
