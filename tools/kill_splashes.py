import os
from PIL import Image

OUT_DIR = '/Users/lap60488/Downloads/game aaa/assets/sprites'

SPRITES = [
  ('tanjiro_kick.png', 'magenta'),
  ('tanjiro_jump_kick.png', 'magenta'),
  ('tanjiro_crouch_kick.png', 'magenta'),
  ('nezuko_kick.png', 'cyan'),
  ('nezuko_jump_kick.png', 'cyan'),
  ('nezuko_crouch_kick.png', 'cyan'),
  ('zenitsu_kick.png', 'blue'),
  ('zenitsu_jump_kick.png', 'blue'),
  ('zenitsu_crouch_kick.png', 'blue'),
  ('inosuke_kick.png', 'magenta'),
  ('inosuke_jump_kick.png', 'magenta'),
  ('inosuke_crouch_kick.png', 'magenta'),
]

def kill_splashes(dest_file, ctype):
    dest_path = os.path.join(OUT_DIR, dest_file)
    if not os.path.exists(dest_path):
        print(f"Skipping {dest_file}")
        return
        
    img = Image.open(dest_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    erased = 0
    blackened = 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0: continue
            
            if ctype == 'magenta':
                # Detect Magenta heavily: R and B dominate G
                if r > g + 40 and b > g + 40:
                    # If it's a bright neon splash (like Tanjiro's jump kick energy splash)
                    if g >= 80 or (r > 150 and b > 150):
                        pixels[x, y] = (0, 0, 0, 0)
                        erased += 1
                    else:
                        # Just standard dark purple rim lighting -> force black lineart
                        pixels[x, y] = (0, 0, 0, a)
                        blackened += 1
                        
            elif ctype == 'cyan':
                if g > r + 40 and b > r + 40:
                    if r >= 80 or (g > 150 and b > 150):
                        pixels[x, y] = (0, 0, 0, 0)
                        erased += 1
                    else:
                        pixels[x, y] = (0, 0, 0, a)
                        blackened += 1
                        
            elif ctype == 'blue':
                if b > r + 40 and b > g + 40:
                    if r >= 80 or g >= 80 or b > 150:
                        pixels[x, y] = (0, 0, 0, 0)
                        erased += 1
                    else:
                        pixels[x, y] = (0, 0, 0, a)
                        blackened += 1
                
    img.save(dest_path)
    print(f"  ✓ {dest_file}: {erased} splashed erased, {blackened} blackened.")

print("NUKE AI ENERGY SPLASHES AND HALOS...")
for dest, ctype in SPRITES:
    kill_splashes(dest, ctype)
print("Complete.")
