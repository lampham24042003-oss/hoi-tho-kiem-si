import os
import math
from PIL import Image

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/47cfc395-f823-42ad-8c79-b1632a80a208'
OUT_DIR = '/Users/lap60488/Downloads/game aaa/assets/sprites'

TOLERANCE = 170 # Distance from White
FEATHER = 40    # Distance from White to definitely delete

file_map = {
  'tanjiro_basic_idle_1775980355771.png': 'tanjiro_idle.png',
  'tanjiro_basic_run1_1775980365391.png': 'tanjiro_run1.png',
  'tanjiro_basic_run2_1775980379493.png': 'tanjiro_run2.png',
  'tanjiro_basic_crouch_1775980393098.png': 'tanjiro_crouch.png',
  'tanjiro_basic_jump_1775980405564.png': 'tanjiro_jump.png',
  'tanjiro_basic_crouch_walk1_1775980418884.png': 'tanjiro_crouch_walk1.png',
  'tanjiro_basic_crouch_walk2_1775980428772.png': 'tanjiro_crouch_walk2.png',
}

def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def process_force_black(in_name, dest_name):
    src_path = os.path.join(BRAIN_DIR, in_name)
    dest_path = os.path.join(OUT_DIR, dest_name)
    
    if not os.path.exists(src_path):
        print(f"Missing: {in_name}")
        return
        
    img = Image.open(src_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    # White background
    bg_r, bg_g, bg_b = 255, 255, 255
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0: continue
            
            dist = color_distance((r, g, b), (bg_r, bg_g, bg_b))
            
            if dist <= FEATHER:
                pixels[x, y] = (0, 0, 0, 0)
                
            elif dist <= TOLERANCE:
                ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
                a_new = int(round((ratio ** 1.8) * 255))
                # For white, anything in the fringe is brightened outline. Force it pure black.
                pixels[x, y] = (0, 0, 0, a_new)

    img.save(dest_path)
    print(f"✓ BLACK EDGE FORCE: {dest_name}")

def main():
    print(f"\n🗡️ FATAL BLACK OUTLINE SWEEP (GLOBAL SCAN ON WHITE)...\n")
    for key, val in file_map.items():
        process_force_black(key, val)
    print("\n✅ Done.\n")

if __name__ == "__main__":
    main()
