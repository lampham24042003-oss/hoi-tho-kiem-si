import os
import math
from PIL import Image

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'
OUT_DIR = '/Users/lap60488/Downloads/game aaa/assets/sprites'

# Tolerate much further out from the background color to capture the dark lineart borders
TOLERANCE = 190
FEATHER = 55

SPRITES = [
  ('chroma_tanjiro_kick_', 'tanjiro_kick.png', (255, 0, 255), 'magenta'),
  ('chroma_tanjiro_jump_kick_', 'tanjiro_jump_kick.png', (255, 0, 255), 'magenta'),
  ('chroma_tanjiro_crouch_kick_', 'tanjiro_crouch_kick.png', (255, 0, 255), 'magenta'),
  ('chroma_nezuko_kick_', 'nezuko_kick.png', (0, 255, 255), 'cyan'),
  ('chroma_nezuko_jump_kick_', 'nezuko_jump_kick.png', (0, 255, 255), 'cyan'),
  ('chroma_nezuko_crouch_kick_', 'nezuko_crouch_kick.png', (0, 255, 255), 'cyan'),
  ('chroma_zenitsu_kick_', 'zenitsu_kick.png', (0, 0, 255), 'blue'),
  ('chroma_zenitsu_jump_kick_', 'zenitsu_jump_kick.png', (0, 0, 255), 'blue'),
  ('chroma_zenitsu_crouch_kick_', 'zenitsu_crouch_kick.png', (0, 0, 255), 'blue'),
  ('chroma_inosuke_kick_', 'inosuke_kick.png', (255, 0, 255), 'magenta'),
  ('chroma_inosuke_jump_kick_', 'inosuke_jump_kick.png', (255, 0, 255), 'magenta'),
  ('chroma_inosuke_crouch_kick_', 'inosuke_crouch_kick.png', (255, 0, 255), 'magenta'),
]

def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def process_global_chroma(prefix, dest_file, bg_color, ctype):
    files = os.listdir(BRAIN_DIR)
    actual_file = next((f for f in files if f.startswith(prefix) and f.endswith('.png')), None)
    if not actual_file:
        print(f"  ✗ Not found: {prefix}")
        return
        
    src_path = os.path.join(BRAIN_DIR, actual_file)
    dest_path = os.path.join(OUT_DIR, dest_file)
    
    img = Image.open(src_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            dist = color_distance((r, g, b), bg_color)
            
            # Pure Background
            if dist <= FEATHER:
                pixels[x, y] = (0, 0, 0, 0)
                
            # Fringed / Anti-aliased lineart area
            elif dist <= TOLERANCE:
                # Any pixel that is this close to the background color mathematically MUST be
                # the "Lineart blending with Background"
                # Since we know the Anime lineart is BLACK, we FORCE this fringe pixel to be pure black
                # instead of trying to save its RGB value. We just map its alpha to create a smooth fade.
                
                # Double check to prevent touching any stray skin/clothes pixels (Safeguard)
                # If a pixel matches the background THIS closely, its opposing anchors MUST be low.
                # E.g. for Magenta, Green MUST be low.
                is_lineart = False
                if ctype == 'magenta' and g < 160: is_lineart = True
                if ctype == 'cyan' and r < 160: is_lineart = True
                if ctype == 'blue' and max(r, g) < 160: is_lineart = True
                
                if is_lineart:
                    ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
                    # Use a power curve to squeeze the alpha (makes the black lineart sharp but faded)
                    a_new = int(round((ratio ** 2) * 255))
                    
                    # Force it entirely to Black Lineart
                    pixels[x, y] = (0, 0, 0, a_new)

    img.save(dest_path)
    print(f"  ✓ Flawless Edge Chroma: {dest_file}")

def main():
    print(f"\n🗡️ ULTIMATE GLOBAL CHROMA SCAN: BLACK OUTLINE EDITION...\n")
    for prefix, dest, bg, ctype in SPRITES:
        process_global_chroma(prefix, dest, bg, ctype)
    print("\n✅ Xong — 12 sprites fully despilled into black linearts.\n")

if __name__ == "__main__":
    main()
