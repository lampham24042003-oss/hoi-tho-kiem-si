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
  'tanjiro_heavy_attack_1775982774316.png': 'tanjiro_heavy_attack.png',
  'tanjiro_jump_heavy_attack_1775982787470.png': 'tanjiro_jump_heavy_attack.png',
  'tanjiro_crouch_heavy_attack_1775982806116.png': 'tanjiro_crouch_heavy_attack.png',
  'tanjiro_projectile_1775982819908.png': 'tanjiro_projectile.png',
  'tanjiro_jump_projectile_1775982830153.png': 'tanjiro_jump_projectile.png',
  'tanjiro_crouch_projectile_1775982841277.png': 'tanjiro_crouch_projectile.png',
  'tanjiro_powerup_pose_1775982853169.png': 'tanjiro_powerup_pose.png',
  'tanjiro_ultimate_pose_1775982865843.png': 'tanjiro_ultimate_pose.png',
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
            
            # Pure Magenta / Core Background
            if dist <= FEATHER:
                pixels[x, y] = (0, 0, 0, 0)
                
            # Magenta border spillage / Fringe / Aliasing
            elif dist <= TOLERANCE:
                # Protect green
                is_lineart = False
                if g < 150: 
                    is_lineart = True
                
                if is_lineart:
                    ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
                    a_new = int(round((ratio ** 2) * 255))
                    pixels[x, y] = (0, 0, 0, a_new)

    img.save(dest_path)
    print(f"✓ FLAWLESS CHROMA & BLACK EDGE: {dest_name}")

def main():
    print(f"\n🗡️ FATAL MAGENTA CHROMA SWEEP BATCH 2.5 (HEAVY & PROJECTILE ATTACKS)...\n")
    for key, val in file_map.items():
        process_magenta_chroma(key, val)
    print("\n✅ Done.\n")

if __name__ == "__main__":
    main()
