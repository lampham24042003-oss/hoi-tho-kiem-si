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
    
    for item in data:
        r, g, b, a = item
        # Background is Magenta
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

process_image("assets/sprites/inosuke sprites/inosuke_crouch.jpeg", "assets/sprites/inosuke_crouch.png")
