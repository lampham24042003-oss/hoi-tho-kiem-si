import os
from PIL import Image
import math
import collections

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'
OUT_DIR  = '/Users/lap60488/Downloads/game aaa/assets/sprites'

file_map = {
  'whitebg_tanjiro_kick_1775875160452.png': 'tanjiro_kick.png',
  'whitebg_tanjiro_jump_kick_1775875172443.png': 'tanjiro_jump_kick.png',
  'whitebg_tanjiro_crouch_kick_1775875187352.png': 'tanjiro_crouch_kick.png',
  'whitebg_nezuko_kick_1775875291559.png': 'nezuko_kick.png',
  'whitebg_nezuko_jump_kick_1775875309720.png': 'nezuko_jump_kick.png',
  'whitebg_nezuko_crouch_kick_1775875324798.png': 'nezuko_crouch_kick.png',
  'whitebg_zenitsu_kick_1775875383129.png': 'zenitsu_kick.png',
  'whitebg_zenitsu_jump_kick_1775875399234.png': 'zenitsu_jump_kick.png',
  'whitebg_zenitsu_crouch_kick_1775875413859.png': 'zenitsu_crouch_kick.png',
  'whitebg_inosuke_kick_1775875476533.png': 'inosuke_kick.png',
  'whitebg_inosuke_jump_kick_1775875494895.png': 'inosuke_jump_kick.png',
  'whitebg_inosuke_crouch_kick_1775875510304.png': 'inosuke_crouch_kick.png',
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
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
            continue
            
        dist = math.sqrt((r-ref_r)**2 + (g-ref_g)**2 + (b-ref_b)**2)
        if dist > tol:
            continue
            
        if dist < feather:
            new_a = 0
            # For pure white, to avoid halo, we don't just set alpha. 
            # We also darken the pixel color slightly so fringing isn't white!
        else:
            new_a = int(((dist - feather) / (tol - feather)) * 255)
            
        # Color decontamination (premultiplied alpha reduction of white)
        # If a pixel is semi-transparent, it used to be blended with white background.
        # We should push its color towards black to remove white halo.
        f = (dist / tol)
        new_r = int(r * f)
        new_g = int(g * f)
        new_b = int(b * f)
        
        pixels[x, y] = (new_r, new_g, new_b, new_a)
        
        for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
            nx, ny = x+dx, y+dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))

def process(src_file, dest_file):
    src_path = os.path.join(BRAIN_DIR, src_file)
    dst_path = os.path.join(OUT_DIR, dest_file)
    if not os.path.exists(src_path):
        print(f"Missing {src_file}")
        return
        
    img = Image.open(src_path).convert('RGBA')
    width, height = img.size
    pixels = img.load()
    
    ref_color = (255, 255, 255) # Pure white
    
    # Pass 1: edge flood-fill
    edge_seeds = []
    for x in range(width):
        edge_seeds.append((x, 0))
        edge_seeds.append((x, height-1))
    for y in range(1, height-1):
        edge_seeds.append((0, y))
        edge_seeds.append((width-1, y))
        
    """
    White background parameters:
    Tolerance: 150 
    Feather: 60
    """
    flood_fill(pixels, width, height, edge_seeds, ref_color, tol=140, feather=60)
    
    # Pass 2: expand from transparent pixels
    t2_seeds = []
    for y in range(height):
        for x in range(width):
            if pixels[x, y][3] == 0:
                t2_seeds.append((x, y))
                
    flood_fill(pixels, width, height, t2_seeds, ref_color, tol=110, feather=40)
    
    img.save(dst_path)
    print(f"✓ Cleaned: {dest_file}")

print("\n🌿 Processing white-bg sprites with Flood Fill Algorithm...\n")
for src, dest in file_map.items():
    process(src, dest)
print("\n✅ Done!")
