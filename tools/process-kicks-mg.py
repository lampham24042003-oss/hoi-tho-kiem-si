import os
import time
from rembg import remove, new_session

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'
OUT_DIR  = '/Users/lap60488/Downloads/game aaa/assets/sprites'

file_map = {
  'mg_tanjiro_kick_1775873073342.png': 'tanjiro_kick.png',
  'mg_tanjiro_jump_kick_1775873101925.png': 'tanjiro_jump_kick.png',
  'mg_tanjiro_crouch_kick_1775873117332.png': 'tanjiro_crouch_kick.png',
  'mg_nezuko_kick_1775873156413.png': 'nezuko_kick.png',
  'mg_nezuko_jump_kick_1775873169893.png': 'nezuko_jump_kick.png',
  'mg_nezuko_crouch_kick_1775873183227.png': 'nezuko_crouch_kick.png',
  'mg_zenitsu_kick_1775873221244.png': 'zenitsu_kick.png',
  'mg_zenitsu_jump_kick_1775873236859.png': 'zenitsu_jump_kick.png',
  'mg_zenitsu_crouch_kick_1775873250724.png': 'zenitsu_crouch_kick.png',
  'mg_inosuke_kick_1775873287199.png': 'inosuke_kick.png',
  'mg_inosuke_jump_kick_1775873302710.png': 'inosuke_jump_kick.png',
  'mg_inosuke_crouch_kick_1775873317300.png': 'inosuke_crouch_kick.png',
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
            # Rembg on magenta is absolutely flawless, it easily isolates characters
            output_data = remove(input_data, session=session, post_process_mask=True)
            
        with open(dst, 'wb') as o:
            o.write(output_data)
            
        print(f"✓ Processed: {out_name}")
    except Exception as e:
        print(f"✗ Failed {out_name}: {e}")

print(f"Done in {time.time() - t0:.1f}s")
