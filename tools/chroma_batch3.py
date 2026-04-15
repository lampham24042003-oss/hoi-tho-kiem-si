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
        
        # Identify bounding box
        min_x, min_y = width, height
        max_x, max_y = 0, 0
        
        # Find magenta #FF00FF (RGB: 255, 0, 255)
        # Tolerance for artifacts
        tolerance = 50
        
        # Background color target
        target_r, target_g, target_b = 255, 0, 255
        
        px_count = 0
        
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                
                # Check if it's magenta (high R, low G, high B)
                # Typical chroma magenta is R>200, G<100, B>200
                is_magenta = (r > 200 and g < 150 and b > 200)
                
                if is_magenta:
                    pixels[x, y] = (0, 0, 0, 0)
                else:
                    # Update bounding box for non-magenta pixels
                    if a > 0:
                        min_x = min(min_x, x)
                        min_y = min(min_y, y)
                        max_x = max(max_x, x)
                        max_y = max(max_y, y)
                        px_count += 1
                        
                        # Edge anti-aliasing enforcement (black outline rule)
                        # If it has magenta fringe, turn it black
                        if r > 150 and g < 120 and b > 150:
                            pixels[x, y] = (0, 0, 0, a)
                            
        # Crop to bounding box
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
        else:
            print(f"  -> WARNING: Empty or full-magenta image")
            img.save(output_path)
            return True
            
    except Exception as e:
        print(f"  -> Error processing image: {e}")
        return False

# Map generated files directly to sprite paths
brain_dir = "/Users/lap60488/.gemini/antigravity/brain/47cfc395-f823-42ad-8c79-b1632a80a208"
assets_dir = "/Users/lap60488/Downloads/game aaa/assets/sprites"

file_map = {
    'tanjiro_crouch_attack_v2_1775987768646.png': 'tanjiro_crouch_attack.png',
    'tanjiro_idle_attack_v2_1775987783704.png': 'tanjiro_idle_attack.png',
    'tanjiro_run1_v2_1775987798594.png': 'tanjiro_run1.png',
    'tanjiro_run2_v2_1775987811844.png': 'tanjiro_run2.png',
    'tanjiro_crouch_walk1_v2_1775987847383.png': 'tanjiro_crouch_walk1.png',
    'tanjiro_crouch_walk2_v2_1775987954618.png': 'tanjiro_crouch_walk2.png',
    'tanjiro_powerup_idle_v2_1775987980253.png': 'tanjiro_powerup_idle.png',
    'tanjiro_powerup_run1_v2_1775987992610.png': 'tanjiro_powerup_run1.png',
    'tanjiro_powerup_run2_v2_1775988036972.png': 'tanjiro_powerup_run2.png',
    'tanjiro_powerup_crouch_v2_1775988049578.png': 'tanjiro_powerup_crouch.png',
    'tanjiro_powerup_jump_v2_1775988067612.png': 'tanjiro_powerup_jump.png',
    'tanjiro_powerup_pose_v2_1775988083366.png': 'tanjiro_powerup_pose.png',
}

success_count = 0
for src, dst in file_map.items():
    src_path = os.path.join(brain_dir, src)
    dst_path = os.path.join(assets_dir, dst)
    if remove_magenta_background(src_path, dst_path):
        success_count += 1

print(f"Complete! Extracted {success_count} / {len(file_map)} sprites.")
