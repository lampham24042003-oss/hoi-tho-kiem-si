import os
import math
from PIL import Image

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'
OUT_DIR = '/Users/lap60488/Downloads/game aaa/assets/sprites'

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

def remove_bg(prefix, dest_file):
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
    
    # Reference color from top-left (0, 0)
    bg_r, bg_g, bg_b, _ = pixels[0, 0]
    
    visited = set()
    queue = []
    
    def enqueue(x, y):
        if (x, y) not in visited:
            visited.add((x, y))
            queue.append((x, y))
            
    # Seed borders
    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(1, height - 1):
        enqueue(0, y)
        enqueue(width - 1, y)
        
    head = 0
    while head < len(queue):
        x, y = queue[head]
        head += 1
        
        r, g, b, a = pixels[x, y]
        
        dr = r - bg_r
        dg = g - bg_g
        db = b - bg_b
        dist = math.sqrt(dr*dr + dg*dg + db*db)
        
        if dist > TOLERANCE:
            continue
            
        if dist < FEATHER:
            pixels[x, y] = (r, g, b, 0)
        else:
            ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
            pixels[x, y] = (r, g, b, int(round(ratio * 255)))
            
        if x + 1 < width: enqueue(x + 1, y)
        if x - 1 >= 0: enqueue(x - 1, y)
        if y + 1 < height: enqueue(x, y + 1)
        if y - 1 >= 0: enqueue(x, y - 1)
        
    img.save(dest_path)
    
    # Calculate transparency percentage
    t = sum(1 for y in range(height) for x in range(width) if pixels[x, y][3] == 0)
    pct = (t / (width * height)) * 100
    print(f"  ✓ {dest_file.ljust(24)} {pct:.1f}% transparent  (ref bg: rgb({bg_r},{bg_g},{bg_b}))")

def main():
    print(f"\n🗡️ Flood-fill BG removal v2 Python Port (tolerance={TOLERANCE})...\n")
    for prefix, dest in SPRITES:
        remove_bg(prefix, dest)
    print("\n✅ Xong — 12 sprites saved to assets/sprites/\n")

if __name__ == "__main__":
    main()
