import sys
import os
from PIL import Image

def process_image(input_path, output_path):
    print(f"Processing {input_path} -> {output_path}")
    img = Image.open(input_path).convert("RGBA")
    
    if img.size != (1024, 1024):
        img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
        
    data = img.getdata()
    new_data = []
    
    # Background color is SOLID BRIGHT MAGENTA #FF00FF (r:255, g:0, b:255)
    for item in data:
        r, g, b, a = item
        
        # Detect magenta background
        if r > 150 and b > 150 and g < 100:
            new_data.append((0, 0, 0, 0)) # Transparent
        else:
            # Force black edge for magenta fringing
            if r > g + 50 and b > g + 50 and r > 100 and b > 100:
                new_data.append((10, 10, 10, a))
            else:
                new_data.append(item)
                
    img.putdata(new_data)
    img.save(output_path, "PNG")

input_dir = "assets/sprites/inosuke sprites"
output_dir = "assets/sprites"

files = [
    ("inosuke_idle_heavy_attack.jpeg", "inosuke_heavy_attack.png"),
    ("inosuke_jump_heavy_attack.jpeg", "inosuke_jump_heavy_attack.png"),
    ("inosuke_crouch_heavy_attack.jpeg", "inosuke_crouch_heavy_attack.png")
]

for in_file, out_file in files:
    process_image(os.path.join(input_dir, in_file), os.path.join(output_dir, out_file))

print("Keys extracted and saved.")
