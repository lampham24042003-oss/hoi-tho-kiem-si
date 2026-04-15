import sys
import os
import io
import time
from rembg import remove, new_session

TEXT_FILES = [
    'assets/effects/ult_text_tanjiro.png',
    'assets/effects/ult_text_nezuko.png',
    'assets/effects/ult_text_zenitsu.png',
    'assets/effects/ult_text_inosuke.png'
]

print("Loading rembg session...")
session = new_session('u2net')

for path in TEXT_FILES:
    if os.path.exists(path):
        print(f"Processing {path}...")
        with open(path, 'rb') as f:
            data = f.read()
            
        # Post process mask helps keep text edges sharp
        res = remove(data, session=session, post_process_mask=True)
        
        with open(path, 'wb') as f:
            f.write(res)
        print(f"Saved cleaned {path}")
    else:
        print(f"File not found: {path}")

print("Done blending text backgrounds!")
