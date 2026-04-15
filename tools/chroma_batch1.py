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
  'tanjiro_basic_idle_1775981801422.png': 'tanjiro_idle.png',
  'tanjiro_basic_run1_1775981817240.png': 'tanjiro_run1.png',
  'tanjiro_basic_run2_1775981832016.png': 'tanjiro_run2.png',
  'tanjiro_basic_crouch_1775981847096.png': 'tanjiro_crouch.png',
  'tanjiro_basic_jump_1775981857707.png': 'tanjiro_jump.png',
  'tanjiro_basic_crouch_walk1_1775981882117.png': 'tanjiro_crouch_walk1.png',
  'tanjiro_basic_crouch_walk2_1775981893059.png': 'tanjiro_crouch_walk2.png',
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
                # If it's close to magenta, it shouldn't have much green in it physically if it was just
                # lineart bleeding. If a pixel has high green, it might be the checkered haori!
                is_lineart = False
                if g < 150: # Safegaurd to protect the green haori from being nuked
                    is_lineart = True
                
                if is_lineart:
                    # Map the distance purely to an alpha channel of a BLACK pixel.
                    # This completely deletes the Magenta fringing and replaces it with a clean black anti-aliased edge.
                    ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
                    a_new = int(round((ratio ** 2) * 255))
                    pixels[x, y] = (0, 0, 0, a_new)

    img.save(dest_path)
    print(f"✓ FLAWLESS CHROMA & BLACK EDGE: {dest_name}")

def main():
    print(f"\n🗡️ FATAL MAGENTA CHROMA SWEEP...\n")
    for key, val in file_map.items():
        process_magenta_chroma(key, val)
    print("\n✅ Done.\n")

if __name__ == "__main__":
    main()
