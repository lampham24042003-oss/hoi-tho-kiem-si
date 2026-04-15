import sys
from PIL import Image

def resize_and_anchor(filepath, scale_factor):
    try:
        img = Image.open(filepath).convert("RGBA")
        
        w, h = img.size
        new_w = int(w * scale_factor)
        new_h = int(h * scale_factor)
        
        # Scale down the image
        resized_img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Create a blank 1024x1024 canvas
        out_img = Image.new("RGBA", (w, h), (0,0,0,0))
        
        # Paste it such that the bottom edge touches the bottom of the canvas
        paste_x = (w - new_w) // 2
        paste_y = h - new_h
        
        out_img.paste(resized_img, (paste_x, paste_y))
        
        out_img.save(filepath)
        print(f"✅ Successfully resized {filepath} by {scale_factor}x and anchored to bottom.")
    except Exception as e:
        print(f"❌ Failed processing {filepath}: {e}")

files = [
    "assets/sprites/zenitsu_heavy_crouch_attack.png",
    "assets/sprites/zenitsu_crouch_projectile.png"
]

for f in files:
    resize_and_anchor(f, 0.82) # 82% of original size
