import os
import math
from PIL import Image

def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def process_cyan_chroma(input_path, output_path):
    print(f"Processing: {input_path}")
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return
        
    TOLERANCE = 180
    FEATHER = 40
    BG_COLOR = (0, 255, 255) # CYAN
    
    try:
        img = Image.open(input_path).convert("RGBA")
        pixels = img.load()
        width, height = img.size
        
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                
                dist = color_distance((r, g, b), BG_COLOR)
                
                if dist <= FEATHER:
                    pixels[x, y] = (0, 0, 0, 0)
                elif dist <= TOLERANCE:
                    # fringe edge anti-aliasing. Map it to black outline
                    ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
                    new_alpha = int(min(255, max(0, ratio * 255)))
                    pixels[x, y] = (0, 0, 0, new_alpha)
        
        # Crop to bounding box safely
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        img.save(output_path, "PNG")
        print(f"Saved: {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

assets = [
    ("/Users/lap60488/.gemini/antigravity/brain/47cfc395-f823-42ad-8c79-b1632a80a208/cinematic_tanjiro_powerup_v2_1776024317726.png", "cinematic_tanjiro_powerup.png"),
    ("/Users/lap60488/.gemini/antigravity/brain/47cfc395-f823-42ad-8c79-b1632a80a208/cinematic_tanjiro_ult1_v2_1776024331978.png", "cinematic_tanjiro_ult1.png"),
    ("/Users/lap60488/.gemini/antigravity/brain/47cfc395-f823-42ad-8c79-b1632a80a208/cinematic_tanjiro_ult2_v2_1776024345409.png", "cinematic_tanjiro_ult2.png"),
]

out_dir = "/Users/lap60488/Downloads/game aaa/assets/effects/tanjiro_vfx"
os.makedirs(out_dir, exist_ok=True)

for in_path, out_name in assets:
    process_cyan_chroma(in_path, os.path.join(out_dir, out_name))
