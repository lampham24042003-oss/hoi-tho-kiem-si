import os
import time
from rembg import remove, new_session
from PIL import Image

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

t0 = time.time()
print("Loading rembg session...")
session = new_session('u2net')

for in_name, out_name in file_map.items():
    src = os.path.join(BRAIN_DIR, in_name)
    dst = os.path.join(OUT_DIR, out_name)
    
    if not os.path.exists(src):
        print(f"Missing: {in_name}")
        continue
    
    try:
        with open(src, 'rb') as i:
            input_data = i.read()
            # Rembg on white handles anime lineart and details perfectly without alpha matting bleeding
            output_data = remove(input_data, session=session, post_process_mask=True)
            
        with open(dst, 'wb') as o:
            o.write(output_data)
            
        print(f"✓ Processed flawlessly: {out_name}")
    except Exception as e:
        print(f"✗ Failed {out_name}: {e}")

print(f"Done in {time.time() - t0:.1f}s")
