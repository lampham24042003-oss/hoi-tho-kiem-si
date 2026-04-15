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
  'tanjiro_powerup_idle_1775983161429.png': 'tanjiro_powerup_idle.png',
  'tanjiro_powerup_run1_1775983173521.png': 'tanjiro_powerup_run1.png',
  'tanjiro_powerup_run2_1775983194484.png': 'tanjiro_powerup_run2.png',
  'tanjiro_powerup_crouch_1775983282240.png': 'tanjiro_powerup_crouch.png',
  'tanjiro_powerup_jump_1775983345662.png': 'tanjiro_powerup_jump.png',
  'tanjiro_powerup_crouch_walk1_1775983358166.png': 'tanjiro_powerup_crouch_walk1.png',
  'tanjiro_powerup_crouch_walk2_1775983369724.png': 'tanjiro_powerup_crouch_walk2.png',
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
                # Protect green & red
                is_lineart = False
                if g < 150: 
                    is_lineart = True
                
                # Protect the fiery red aura and mark
                if r > 200 and g < 100 and b < 100:
                    is_lineart = False
                
                if is_lineart:
                    ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
                    a_new = int(round((ratio ** 2) * 255))
                    pixels[x, y] = (0, 0, 0, a_new)

    img.save(dest_path)
    print(f"✓ FLAWLESS CHROMA & BLACK EDGE: {dest_name}")

def main():
    print(f"\n🗡️ FATAL MAGENTA CHROMA SWEEP BATCH 2.5 (BUFFED POWERUP POSES)...\n")
    for key, val in file_map.items():
        process_magenta_chroma(key, val)
    print("\n✅ Done.\n")

if __name__ == "__main__":
    main()
