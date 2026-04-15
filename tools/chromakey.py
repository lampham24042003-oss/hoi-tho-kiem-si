import os
import math
from PIL import Image

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'
OUT_DIR = '/Users/lap60488/Downloads/game aaa/assets/sprites'

file_map = {
  'chroma_tanjiro_kick': {'file': 'tanjiro_kick.png', 'bg': (255, 0, 255), 'type': 'magenta'},
  'chroma_tanjiro_jump_kick': {'file': 'tanjiro_jump_kick.png', 'bg': (255, 0, 255), 'type': 'magenta'},
  'chroma_tanjiro_crouch_kick': {'file': 'tanjiro_crouch_kick.png', 'bg': (255, 0, 255), 'type': 'magenta'},
  'chroma_inosuke_kick': {'file': 'inosuke_kick.png', 'bg': (255, 0, 255), 'type': 'magenta'},
  'chroma_inosuke_jump_kick': {'file': 'inosuke_jump_kick.png', 'bg': (255, 0, 255), 'type': 'magenta'},
  'chroma_inosuke_crouch_kick': {'file': 'inosuke_crouch_kick.png', 'bg': (255, 0, 255), 'type': 'magenta'},
  'chroma_zenitsu_kick': {'file': 'zenitsu_kick.png', 'bg': (0, 0, 255), 'type': 'blue'},
  'chroma_zenitsu_jump_kick': {'file': 'zenitsu_jump_kick.png', 'bg': (0, 0, 255), 'type': 'blue'},
  'chroma_zenitsu_crouch_kick': {'file': 'zenitsu_crouch_kick.png', 'bg': (0, 0, 255), 'type': 'blue'},
  'chroma_nezuko_kick': {'file': 'nezuko_kick.png', 'bg': (0, 255, 255), 'type': 'cyan'},
  'chroma_nezuko_jump_kick': {'file': 'nezuko_jump_kick.png', 'bg': (0, 255, 255), 'type': 'cyan'},
  'chroma_nezuko_crouch_kick': {'file': 'nezuko_crouch_kick.png', 'bg': (0, 255, 255), 'type': 'cyan'}
}

def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def process_file(in_name, info):
    files = os.listdir(BRAIN_DIR)
    actual_file = next((f for f in files if f.startswith(in_name) and f.endswith('.png')), None)
    if not actual_file:
        print(f"Missing: {in_name}")
        return
    
    src = os.path.join(BRAIN_DIR, actual_file)
    dst = os.path.join(OUT_DIR, info['file'])
    bg = info['bg']
    ctype = info['type']
    
    img = Image.open(src).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    # Step 1: Flood fill from borders
    visited = set()
    queue = []
    
    # Add border pixels to queue
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        
    for p in queue:
        visited.add(p)
        
    head = 0
    while head < len(queue):
        x, y = queue[head]
        head += 1
        
        r, g, b, a = pixels[x, y]
        dist = color_distance((r, g, b), bg)
        
        if dist < 40:
            pixels[x, y] = (0, 0, 0, 0)
            
            for nx, ny in [(x-1,y), (x+1,y), (x,y-1), (x,y+1)]:
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
    # Step 2: Cinematic Chroma Despill
    edge_dirs = [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]
    for y in range(1, height - 1):
        for x in range(1, width - 1):
            r, g, b, a = pixels[x, y]
            if a > 0:
                is_edge = False
                for dx, dy in edge_dirs:
                    if pixels[x+dx, y+dy][3] == 0:
                        is_edge = True
                        break
                
                if is_edge:
                    if ctype == 'magenta':
                        if g < 100:
                            r = min(r, g)
                            b = min(b, g)
                    elif ctype == 'cyan':
                        if r < 100:
                            g = min(g, r)
                            b = min(b, r)
                    elif ctype == 'blue':
                        opp = max(r, g)
                        if opp < 100:
                            b = min(b, opp)
                    
                    dist = color_distance((r, g, b), bg)
                    if dist < 120:
                        pixels[x, y] = (r, g, b, int(max(0, min(255, dist/120.0 * 255))))
                    else:
                        pixels[x, y] = (r, g, b, a)

    img.save(dst)
    print(f"✓ Cinematic Key Python: {info['file']}")

print("Starting Python fallback chroma key...")
for in_name, info in file_map.items():
    process_file(in_name, info)
print("Complete!")
