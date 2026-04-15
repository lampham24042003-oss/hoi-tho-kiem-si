import os
import math
from PIL import Image
import glob

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/47cfc395-f823-42ad-8c79-b1632a80a208'
OUT_DIR = '/Users/lap60488/Downloads/game aaa/assets/sprites'

TOLERANCE = 170
FEATHER = 45
BG_COLOR = (255, 0, 255)

def find_latest_file(prefix):
    files = glob.glob(os.path.join(BRAIN_DIR, f"{prefix}_*.png"))
    if not files:
        return None
    return max(files, key=os.path.getctime)

mapping = {
    'tanjiro_basic_attack1_v2': 'tanjiro_idle_attack.png',
    'tanjiro_basic_attack2_v2': 'tanjiro_heavy_attack.png',
    'tanjiro_basic_kick_v2': 'tanjiro_kick.png',
    'tanjiro_basic_projectile_v2': 'tanjiro_projectile.png',
    
    'tanjiro_jump_attack1_v2': 'tanjiro_jump_attack.png',
    'tanjiro_jump_attack2_v2': 'tanjiro_jump_heavy_attack.png',
    'tanjiro_jump_kick_v2': 'tanjiro_jump_kick.png',
    'tanjiro_jump_projectile_v2': 'tanjiro_jump_projectile.png',
    
    'tanjiro_crouch_attack1_v2': 'tanjiro_crouch_attack.png',
    'tanjiro_crouch_attack2_v2': 'tanjiro_crouch_heavy_attack.png',
    'tanjiro_crouch_kick_v2': 'tanjiro_crouch_kick.png',
    'tanjiro_crouch_projectile_v2': 'tanjiro_crouch_projectile.png'
}

def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def process_magenta_chroma(src_path, dest_name):
    dest_path = os.path.join(OUT_DIR, dest_name)
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
                if g < 150: 
                    ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
                    a_new = int(round((ratio ** 2) * 255))
                    pixels[x, y] = (0, 0, 0, a_new)

    img.save(dest_path)
    print(f"✓ NO-CROP CHROMA SAVED: {dest_name}")

print(f"\n🗡️ BATCH 3 (BASE ATTACKS V2) CHROMA EXTRACT START...\n")
for prefix, dst in mapping.items():
    src_path = find_latest_file(prefix)
    if src_path:
        process_magenta_chroma(src_path, dst)
    else:
        print(f"ERROR: Could not find base file for {prefix}")
print("\n✅ Done.\n")
