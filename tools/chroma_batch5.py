import os
import math
from PIL import Image

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/47cfc395-f823-42ad-8c79-b1632a80a208'
OUT_DIR = '/Users/lap60488/Downloads/game aaa/assets/sprites'

# Magenta Chroma Params
# FF00FF means R=255, B=255. G should be very low.
TOLERANCE = 190
FEATHER = 55
BG_COLOR = (255, 0, 255)

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
    'tanjiro_powerup_crouch_walk1_v2_1775988378332.png': 'tanjiro_powerup_crouch_walk1.png',
    'tanjiro_powerup_crouch_walk2_v2_1775988391570.png': 'tanjiro_powerup_crouch_walk2.png'
}

def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def process_magenta_chroma(in_name, dest_name):
    src_path = os.path.join(BRAIN_DIR, in_name)
    dest_path = os.path.join(OUT_DIR, dest_name)
    
    if not os.path.exists(src_path):
        print(f"Missing: {in_name}")
        return
        
    img = Image.open(src_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            dist = color_distance((r, g, b), BG_COLOR)
            
            if dist <= FEATHER:
                pixels[x, y] = (0, 0, 0, 0)
            elif dist <= TOLERANCE:
                is_lineart = False
                if g < 150: 
                    is_lineart = True
                
                if is_lineart:
                    ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
                    a_new = int(round((ratio ** 2) * 255))
                    pixels[x, y] = (0, 0, 0, a_new)

    img.save(dest_path)
    print(f"✓ FLAWLESS UNCROPPED CHROMA: {dest_name}")

def main():
    print(f"\n🗡️ FATAL MAGENTA CHROMA SWEEP BATCH 5 (UNCROPPED RECOVERY)...\n")
    for key, val in file_map.items():
        process_magenta_chroma(key, val)
    print("\n✅ Done.\n")

if __name__ == "__main__":
    main()
