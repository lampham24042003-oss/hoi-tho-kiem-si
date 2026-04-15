import os
import math
from PIL import Image

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'
OUT_DIR = '/Users/lap60488/Downloads/game aaa/assets/sprites'

# The exact parameters from remove-bg-smart v2
TOLERANCE = 120
FEATHER = 55

SPRITES = [
  ('chroma_tanjiro_kick_', 'tanjiro_kick.png'),
  ('chroma_tanjiro_jump_kick_', 'tanjiro_jump_kick.png'),
  ('chroma_tanjiro_crouch_kick_', 'tanjiro_crouch_kick.png'),
  ('chroma_nezuko_kick_', 'nezuko_kick.png'),
  ('chroma_nezuko_jump_kick_', 'nezuko_jump_kick.png'),
  ('chroma_nezuko_crouch_kick_', 'nezuko_crouch_kick.png'),
  ('chroma_zenitsu_kick_', 'zenitsu_kick.png'),
  ('chroma_zenitsu_jump_kick_', 'zenitsu_jump_kick.png'),
  ('chroma_zenitsu_crouch_kick_', 'zenitsu_crouch_kick.png'),
  ('chroma_inosuke_kick_', 'inosuke_kick.png'),
  ('chroma_inosuke_jump_kick_', 'inosuke_jump_kick.png'),
  ('chroma_inosuke_crouch_kick_', 'inosuke_crouch_kick.png'),
]

def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def process_force_black(prefix, dest_file):
    files = os.listdir(BRAIN_DIR)
    files.sort(key=lambda x: os.path.getmtime(os.path.join(BRAIN_DIR, x)), reverse=True)
    actual_file = next((f for f in files if f.startswith(prefix) and f.endswith('.png')), None)
    if not actual_file:
        print(f"  ✗ Not found: {prefix}")
        return
        
    src_path = os.path.join(BRAIN_DIR, actual_file)
    dest_path = os.path.join(OUT_DIR, dest_file)
    
    img = Image.open(src_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    # Grab the true background color from top-left pixel
    bg_r, bg_g, bg_b, _ = pixels[0, 0]
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            dist = color_distance((r, g, b), (bg_r, bg_g, bg_b))
            
            if dist <= FEATHER:
                # Absolute background core
                pixels[x, y] = (0, 0, 0, 0)
                
            elif dist <= TOLERANCE:
                # FEATHER < dist <= TOLERANCE meaning it's the transitional fading zone.
                # In the old code, we kept original RGB and just mapped alpha. That left glowing colors!
                # The user explicitly commands: "chuyển về viền đen cho t" (make it a black edge).
                # Action: We forcefully set RGB to 0,0,0 (pure black), transforming ANY neon fringe
                # into a clean, smooth black lineart shadow!
                
                ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
                # Curve it slightly to pull the alpha closer to the body
                a_new = int(round((ratio ** 1.3) * 255))
                pixels[x, y] = (0, 0, 0, a_new)

    img.save(dest_path)
    print(f"  ✓ BLACK EDGE FORCE: {dest_file}")

def main():
    print(f"\n🗡️ FATAL BLACK OUTLINE SWEEP (GLOBAL SCAN)...\n")
    for prefix, dest in SPRITES:
        process_force_black(prefix, dest)
    print("\n✅ Xong — 12 sprites given flawless black borders.\n")

if __name__ == "__main__":
    main()
