import os
import time
from rembg import remove, new_session

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'
OUT_DIR  = '/Users/lap60488/Downloads/game aaa/assets/sprites'

file_map = {
  'mg_tanjiro_kick_1775880131202.png': 'tanjiro_kick.png',
  'mg_tanjiro_jump_kick_1775880144534.png': 'tanjiro_jump_kick.png',
  'mg_tanjiro_crouch_kick_1775880158326.png': 'tanjiro_crouch_kick.png',
  'mg_nezuko_kick_1775880236805.png': 'nezuko_kick.png',
  'mg_nezuko_jump_kick_1775880253408.png': 'nezuko_jump_kick.png',
  'mg_nezuko_crouch_kick_1775880269464.png': 'nezuko_crouch_kick.png',
  'mg_zenitsu_kick_1775880357508.png': 'zenitsu_kick.png',
  'mg_zenitsu_jump_kick_1775880367943.png': 'zenitsu_jump_kick.png',
  'mg_zenitsu_crouch_kick_1775880381245.png': 'zenitsu_crouch_kick.png',
  'mg_inosuke_kick_1775880477203.png': 'inosuke_kick.png',
  'mg_inosuke_jump_kick_1775880487879.png': 'inosuke_jump_kick.png',
  'mg_inosuke_crouch_kick_1775880501796.png': 'inosuke_crouch_kick.png',
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
            # USE EXACTLY WHAT WORKED IN HISTORICAL CHAT
            output_data = remove(
                input_data, 
                session=session, 
                post_process_mask=True
            )
            
        with open(dst, 'wb') as o_file:
            o_file.write(output_data)
        print(f"✓ Processed perfectly: {out_name}")
    except Exception as e:
        print(f"✗ Failed {out_name}: {e}")

print(f"Done in {time.time() - t0:.1f}s")
