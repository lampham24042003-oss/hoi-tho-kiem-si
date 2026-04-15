import os
import sys
import time
from rembg import remove, new_session

# Update to current brain
BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/47cfc395-f823-42ad-8c79-b1632a80a208'
OUT_DIR  = '/Users/lap60488/Downloads/game aaa/assets/sprites'

file_map = {
  'tanjiro_basic_idle_1775980355771.png': 'tanjiro_idle.png',
  'tanjiro_basic_run1_1775980365391.png': 'tanjiro_run1.png',
  'tanjiro_basic_run2_1775980379493.png': 'tanjiro_run2.png',
  'tanjiro_basic_crouch_1775980393098.png': 'tanjiro_crouch.png',
  'tanjiro_basic_jump_1775980405564.png': 'tanjiro_jump.png',
  'tanjiro_basic_crouch_walk1_1775980418884.png': 'tanjiro_crouch_walk1.png',
  'tanjiro_basic_crouch_walk2_1775980428772.png': 'tanjiro_crouch_walk2.png',
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
            output_data = remove(
                input_data, 
                session=session, 
                post_process_mask=True,
                alpha_matting=True,
                alpha_matting_foreground_threshold=240,
                alpha_matting_background_threshold=10,
                alpha_matting_erode_size=10
            ) # Added alpha matting for clean white removal
            
        with open(dst, 'wb') as o_file:
            o_file.write(output_data)
        print(f"✓ Processed perfectly: {out_name}")
    except Exception as e:
        print(f"✗ Failed {out_name}: {e}")

print(f"Done in {time.time() - t0:.1f}s")
