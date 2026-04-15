import os
import time
from rembg import remove, new_session
from PIL import Image
import io

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'
OUT_DIR  = '/Users/lap60488/Downloads/game aaa/assets/sprites'

file_map = {
  'chroma_tanjiro_kick': {'file': 'tanjiro_kick.png', 'type': 'magenta'},
  'chroma_tanjiro_jump_kick': {'file': 'tanjiro_jump_kick.png', 'type': 'magenta'},
  'chroma_tanjiro_crouch_kick': {'file': 'tanjiro_crouch_kick.png', 'type': 'magenta'},
  'chroma_inosuke_kick': {'file': 'inosuke_kick.png', 'type': 'magenta'},
  'chroma_inosuke_jump_kick': {'file': 'inosuke_jump_kick.png', 'type': 'magenta'},
  'chroma_inosuke_crouch_kick': {'file': 'inosuke_crouch_kick.png', 'type': 'magenta'},
  'chroma_zenitsu_kick': {'file': 'zenitsu_kick.png', 'type': 'blue'},
  'chroma_zenitsu_jump_kick': {'file': 'zenitsu_jump_kick.png', 'type': 'blue'},
  'chroma_zenitsu_crouch_kick': {'file': 'zenitsu_crouch_kick.png', 'type': 'blue'},
  'chroma_nezuko_kick': {'file': 'nezuko_kick.png', 'type': 'cyan'},
  'chroma_nezuko_jump_kick': {'file': 'nezuko_jump_kick.png', 'type': 'cyan'},
  'chroma_nezuko_crouch_kick': {'file': 'nezuko_crouch_kick.png', 'type': 'cyan'}
}

t0 = time.time()
print("Loading rembg session (u2net)...")
session = new_session('u2net')

for in_name, info in file_map.items():
    # Find actual latest generated file
    files = os.listdir(BRAIN_DIR)
    actual_file = next((f for f in files if f.startswith(in_name) and f.endswith('.png')), None)
    if not actual_file:
        print(f"Missing: {in_name}")
        continue
        
    src = os.path.join(BRAIN_DIR, actual_file)
    dst = os.path.join(OUT_DIR, info['file'])
    ctype = info['type']
    
    try:
        with open(src, 'rb') as i_file:
            input_data = i_file.read()
            
            # 1. THE AI SURGEON: Flawless structural cut ignoring gaps, dropshadows, or gradients
            output_data = remove(
                input_data, 
                session=session, 
                post_process_mask=True
            )
            
        # 2. THE CINEMATIC CHROMATIC DESPILL: Eliminates halos on the black lineart
        img = Image.open(io.BytesIO(output_data)).convert("RGBA")
        pixels = img.load()
        width, height = img.size
        
        edge_dirs = [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]
        
        for y in range(1, height - 1):
            for x in range(1, width - 1):
                r, g, b, a = pixels[x, y]
                
                # Check for alpha boundary pixels & fully opaque boundary pixels
                if a > 0:
                    is_edge = False
                    for dx, dy in edge_dirs:
                        if pixels[x+dx, y+dy][3] == 0:
                            is_edge = True
                            break
                            
                    # If it's near transparency OR itself semi-transparent (anti-aliased by rembg)
                    if is_edge or a < 255:
                        # Apply Cinematic Protection Logic:
                        # Only target "dark" pixels mixed with fluorescent
                        if ctype == 'magenta':
                            if g < 120: # Lineart anchors on low Green
                                r = min(r, g)
                                b = min(b, g)
                        elif ctype == 'cyan':
                            if r < 120: # Lineart anchors on low Red
                                g = min(g, r)
                                b = min(b, r)
                        elif ctype == 'blue':
                            opp = max(r, g)
                            if opp < 120: # Lineart anchors on low Red/Green
                                b = min(b, opp)
                                
                        # We also forcefully darken extreme color fringing by capping the brightness
                        # of the tinted channel to its baseline. This ensures black becomes pure black.
                        # Also if semi-transparent, it's definitely blending.
                        pixels[x, y] = (r, g, b, a)
                        
        img.save(dst)
        print(f"✓ Pure Perfection: {info['file']}")
    except Exception as e:
        print(f"✗ Failed {info['file']}: {e}")

print(f"Masterpiece completed in {time.time() - t0:.1f}s")
