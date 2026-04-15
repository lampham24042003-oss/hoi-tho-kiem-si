import os
from PIL import Image
import math
import collections

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'
OUT_DIR  = '/Users/lap60488/Downloads/game aaa/assets/sprites'

file_map = {
  'greenbg_tanjiro_kick_1775876638030.png': 'tanjiro_kick.png',
  'greenbg_tanjiro_jump_kick_1775876651649.png': 'tanjiro_jump_kick.png',
  'greenbg_tanjiro_crouch_kick_1775876663243.png': 'tanjiro_crouch_kick.png',
  'greenbg_nezuko_kick_1775876744444.png': 'nezuko_kick.png',
  # Use new generated image for Nezuko jump
  'greenbg_nezuko_jump_kick_1775878692363.png': 'nezuko_jump_kick.png',
  'greenbg_nezuko_crouch_kick_1775876773798.png': 'nezuko_crouch_kick.png',
  'greenbg_zenitsu_kick_1775876815012.png': 'zenitsu_kick.png',
  'greenbg_zenitsu_jump_kick_1775876827890.png': 'zenitsu_jump_kick.png',
  'greenbg_zenitsu_crouch_kick_1775876840297.png': 'zenitsu_crouch_kick.png',
  'greenbg_inosuke_kick_1775876919082.png': 'inosuke_kick.png',
  'greenbg_inosuke_jump_kick_1775876932250.png': 'inosuke_jump_kick.png',
  # Use new generated image for Inosuke crouch
  'greenbg_inosuke_crouch_kick_1775878705362.png': 'inosuke_crouch_kick.png',
}

def flood_fill(pixels, width, height, seed_pixels, ref_color, tol, feather):
    ref_r, ref_g, ref_b = ref_color
    visited = set(seed_pixels)
    queue = collections.deque(seed_pixels)
    
    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        
        if a == 0:
            for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
                nx, ny = x+dx, y+dy
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
            continue
            
        dr, dg, db = r - ref_r, g - ref_g, b - ref_b
        dist = math.sqrt(dr*dr + dg*dg + db*db)
        
        if dist > tol:
            continue
            
        if dist < feather:
            pixels[x, y] = (0, 0, 0, 0)
        else:
            ratio = (dist - feather) / (tol - feather)
            alpha = int(ratio * 255)
            
            # AGGRESSIVE DECONTAMINATION
            # Clamp green so it can never exceed red or blue on the edge
            # This completely destroys any green tint.
            max_rb = max(r, b)
            new_g = min(g, max_rb)
            
            # Darken the pixel for smoother blending against dark backgrounds
            f = max(0.1, ratio**1.5)
            new_r = int(r * f)
            new_g = int(new_g * f)
            new_b = int(b * f)
            
            pixels[x, y] = (new_r, new_g, new_b, alpha)
            
        for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
            nx, ny = x+dx, y+dy
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                visited.add((nx, ny))
                queue.append((nx, ny))

def global_cleanup(pixels, width, height, ref_color):
    """Pass 3: Global scan to aggressively kill any remaining isolated green specks."""
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0: continue
            
            # Aggressive global green killer for floating islands
            if g > 150 and b < 100 and r < 100 and g > (r + 10) * 1.2:
                pixels[x, y] = (0,0,0,0)

def process(src_file, dest_file):
    src_path = os.path.join(BRAIN_DIR, src_file)
    dst_path = os.path.join(OUT_DIR, dest_file)
    if not os.path.exists(src_path):
        print(f"Missing {src_file}")
        return
        
    img = Image.open(src_path).convert('RGBA')
    width, height = img.size
    pixels = img.load()
    
    ref_color = (0, 255, 0)
    
    edge_seeds = []
    for x in range(width):
        edge_seeds.append((x, 0))
        edge_seeds.append((x, height-1))
    for y in range(1, height-1):
        edge_seeds.append((0, y))
        edge_seeds.append((width-1, y))
        
    flood_fill(pixels, width, height, edge_seeds, ref_color, tol=150, feather=80)
    
    t2_seeds = []
    for y in range(height):
        for x in range(width):
            if pixels[x, y][3] == 0:
                t2_seeds.append((x, y))
                
    flood_fill(pixels, width, height, t2_seeds, ref_color, tol=130, feather=60)
    
    global_cleanup(pixels, width, height, ref_color)
    
    img.save(dst_path)
    print(f"✓ Cleaned completely: {dest_file}")

print("\n🗡️  Ultimate Chroma Key - EXTREME Green Spill Suppression!\n")
for src, dest in file_map.items():
    process(src, dest)
print("\n✅ Done!")
