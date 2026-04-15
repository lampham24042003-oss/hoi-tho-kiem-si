import os
import sys
from PIL import Image

def remove_magenta_background(input_path, output_path):
    print(f"Processing: {input_path}")
    if not os.path.exists(input_path):
        print(f"ERROR: File not found: {input_path}")
        return False
        
    try:
        img = Image.open(input_path).convert("RGBA")
        pixels = img.load()
        width, height = img.size
        
        min_x, min_y = width, height
        max_x, max_y = 0, 0
        px_count = 0
        
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                is_magenta = (r > 200 and g < 150 and b > 200)
                
                if is_magenta:
                    pixels[x, y] = (0, 0, 0, 0)
                else:
                    if a > 0:
                        min_x = min(min_x, x)
                        min_y = min(min_y, y)
                        max_x = max(max_x, x)
                        max_y = max(max_y, y)
                        px_count += 1
                        
                        if r > 150 and g < 120 and b > 150:
                            pixels[x, y] = (0, 0, 0, a)
                            
        if max_x >= min_x and max_y >= min_y and px_count > 0:
            padding = 5
            min_x = max(0, min_x - padding)
            min_y = max(0, min_y - padding)
            max_x = min(width, max_x + padding)
            max_y = min(height, max_y + padding)
            
            img_cropped = img.crop((min_x, min_y, max_x, max_y))
            img_cropped.save(output_path)
            print(f"  -> Saved {output_path} (Cropped: {max_x-min_x}x{max_y-min_y})")
            return True
    except Exception as e:
        print(f"  -> Error: {e}")
        return False

brain_dir = "/Users/lap60488/.gemini/antigravity/brain/47cfc395-f823-42ad-8c79-b1632a80a208"
assets_dir = "/Users/lap60488/Downloads/game aaa/assets/sprites"

file_map = {
    'tanjiro_powerup_crouch_walk1_v2_1775988378332.png': 'tanjiro_powerup_crouch_walk1.png',
    'tanjiro_powerup_crouch_walk2_v2_1775988391570.png': 'tanjiro_powerup_crouch_walk2.png',
}

for src, dst in file_map.items():
    remove_magenta_background(os.path.join(brain_dir, src), os.path.join(assets_dir, dst))
