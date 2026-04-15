import os
import glob
import shutil
import re
from pathlib import Path

source_dir = Path(os.path.expanduser('~/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'))
dest_dir = Path('/Users/lap60488/Downloads/game aaa/assets/effects')

if not dest_dir.exists():
    dest_dir.mkdir(parents=True)

patterns = [
    'hit_tanjiro_sword', 'hit_tanjiro_kick', 'hit_tanjiro_proj', 'hit_tanjiro_block',
    'hit_nezuko_sword', 'hit_nezuko_kick', 'hit_nezuko_proj', 'hit_nezuko_block',
    'hit_zenitsu_sword', 'hit_zenitsu_kick', 'hit_zenitsu_proj', 'hit_zenitsu_block',
    'hit_inosuke_sword', 'hit_inosuke_kick', 'hit_inosuke_proj', 'hit_inosuke_block'
]

for base in patterns:
    paths = []
    pattern = re.compile(f"^{base}_[0-9]+\\.png$")
    for f in source_dir.glob('*.png'):
        if pattern.match(f.name):
            paths.append(f)
            
    if paths:
        latest_file = max(paths, key=os.path.getmtime)
        target = dest_dir / f'{base}.png'
        shutil.copy2(latest_file, target)
        print(f"Copied {latest_file.name} to {target.name}")
    else:
        print(f"WARNING: No images found for {base}")

