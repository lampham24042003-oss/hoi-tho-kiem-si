import os
import io
import time
from rembg import remove, new_session
from PIL import Image

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'
TEST_DIR  = '/Users/lap60488/Downloads/game aaa/assets/sprites/test'

BRAIN_MAP = {
  'tanjiro_idle.png':   'tanjiro_idle_new_1775792052542.png',
  'tanjiro_jump.png':   'tanjiro_jump_new_1775792137521.png',
  'tanjiro_crouch.png': 'tanjiro_crouch_new_1775792224264.png',
  'tanjiro_run1.png':   'tanjiro_run1_new_1775792311199.png',
  'tanjiro_run2.png':   'tanjiro_run2_v3_1775793274458.png',
  'nezuko_idle.png':    'nezuko_idle_new_1775792068282.png',
  'nezuko_jump.png':    'nezuko_jump_new_1775792158244.png',
  'nezuko_crouch.png':  'nezuko_crouch_new_1775792241748.png',
  'nezuko_run1.png':    'nezuko_run1_new_1775792324683.png',
  'nezuko_run2.png':    'nezuko_run2_v2_1775793097219.png',
  'zenitsu_idle.png':   'zenitsu_idle_new_1775792083647.png',
  'zenitsu_jump.png':   'zenitsu_jump_new_1775792172783.png',
  'zenitsu_crouch.png': 'zenitsu_crouch_new_1775792255236.png',
  'zenitsu_run1.png':   'zenitsu_run1_new_1775792345078.png',
  'zenitsu_run2.png':   'zenitsu_run2_v2_1775793111886.png',
  'inosuke_idle.png':   'inosuke_idle_new_1775792100408.png',
  'inosuke_jump.png':   'inosuke_jump_new_1775792189541.png',
  'inosuke_crouch.png': 'inosuke_crouch_new_1775792271838.png',
  'inosuke_run1.png':   'inosuke_run1_new_1775792361737.png',
  'inosuke_run2.png':   'inosuke_run2_v3_1775793290739.png',
}

# The u2netp is a lighter, faster version, or u2net_anime for anime models.
# rembg automatically fetches the model. Let's use the default u2net for best quality.
t0 = time.time()
print("Loading AI model for perfect background removal...")
session = new_session('u2net') 

print()
print("========================================")
print("🤖 RUNNING PERFECT AI BG REMOVAL")
print("========================================")

for out_name, in_name in BRAIN_MAP.items():
    src_path = os.path.join(BRAIN_DIR, in_name)
    dst_path = os.path.join(TEST_DIR, out_name)
    
    if not os.path.exists(src_path):
        print(f"  ✗ Original not found: {in_name}")
        continue
        
    try:
        # with open(src_path, 'rb') as i:
        #     with open(dst_path, 'wb') as o:
        #         input_data = i.read()
        #         o.write(remove(input_data, session=session, alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=10, alpha_matting_erode_size=10))
        
        # Load image via PIL to apply a white background threshold constraint
        # Sometimes rembg removes things like Nezuko's black flames if they are considered "background". 
        # But u2net usually retains the character + aura perfectly.
        with open(src_path, 'rb') as i:
            input_data = i.read()
            # We don't use alpha matting to keep crisp anime edges
            output_data = remove(input_data, session=session, post_process_mask=True)
            
        with open(dst_path, 'wb') as o:
            o.write(output_data)
            
        print(f"  ✓ Processed flawlessly: {out_name}")
    except Exception as e:
        print(f"  ✗ Failed on {out_name}: {e}")

print(f"\nDone in {time.time() - t0:.1f}s")
