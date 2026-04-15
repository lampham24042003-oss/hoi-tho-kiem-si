import os
import time
from rembg import remove, new_session
from PIL import Image
import io

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'
OUT_DIR  = '/Users/lap60488/Downloads/game aaa/assets/sprites'

file_map = {
  'whitebg_tanjiro_kick_1775881813623.png': 'tanjiro_kick.png',
  'whitebg_tanjiro_jump_kick_1775881825308.png': 'tanjiro_jump_kick.png',
  'whitebg_tanjiro_crouch_kick_1775881839057.png': 'tanjiro_crouch_kick.png',
  'whitebg_nezuko_kick_1775881918741.png': 'nezuko_kick.png',
  'whitebg_nezuko_jump_kick_1775881932891.png': 'nezuko_jump_kick.png',
  'whitebg_nezuko_crouch_kick_1775881946738.png': 'nezuko_crouch_kick.png',
  'whitebg_zenitsu_kick_1775882034583.png': 'zenitsu_kick.png',
  'whitebg_zenitsu_jump_kick_1775882046769.png': 'zenitsu_jump_kick.png',
  'whitebg_zenitsu_crouch_kick_1775882058442.png': 'zenitsu_crouch_kick.png',
  'whitebg_inosuke_kick_1775882148010.png': 'inosuke_kick.png',
  'whitebg_inosuke_jump_kick_1775882161483.png': 'inosuke_jump_kick.png',
  'whitebg_inosuke_crouch_kick_1775882178493.png': 'inosuke_crouch_kick.png',
}

t0 = time.time()
print("Loading rembg session (u2net)...")
session = new_session('u2net')

for in_name, out_name in file_map.items():
    src = os.path.join(BRAIN_DIR, in_name)
    dst = os.path.join(OUT_DIR, out_name)
    
    if not os.path.exists(src):
        print(f"Missing: {in_name}")
        continue
    
    try:
        with open(src, 'rb') as i_file:
            input_data = i_file.read()
            
            # Step 1: Standard rembg extraction
            output_data = remove(
                input_data, 
                session=session, 
                post_process_mask=True
            )
            
        # Step 2: Edge Halo Darkening
        img = Image.open(io.BytesIO(output_data)).convert("RGBA")
        pixels = img.load()
        width, height = img.size
        
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                # If pixel is semi-transparent, it's an edge pixel blended with the white bg.
                if 0 < a < 250:
                    # We forcefully darken the RGB so the white halo becomes a black lineart shadow!
                    # This completely solves the "white background sticking" issue without deleting the white socks!
                    if a < 150:
                        pixels[x, y] = (0, 0, 0, a) # Turn highly transparent pixels to pure black shadow
                    else:
                        pixels[x, y] = (int(r * 0.2), int(g * 0.2), int(b * 0.2), a) # Darken less transparent ones
                        
        img.save(dst)
        print(f"✓ Processed perfectly: {out_name}")
    except Exception as e:
        print(f"✗ Failed {out_name}: {e}")

print(f"Done in {time.time() - t0:.1f}s")
