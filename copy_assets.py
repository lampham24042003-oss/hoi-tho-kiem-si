import os
import glob
import shutil
import re
from pathlib import Path

source_dir = Path(os.path.expanduser('~/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'))
dest_dir = Path('./tools/test')

bases = [
    'tanjiro_idle', 'tanjiro_idle_attack', 'tanjiro_jump', 'tanjiro_jump_attack', 'tanjiro_crouch', 'tanjiro_crouch_attack', 'tanjiro_run1', 'tanjiro_run2',
    'nezuko_idle', 'nezuko_idle_attack', 'nezuko_jump', 'nezuko_jump_attack', 'nezuko_crouch', 'nezuko_crouch_attack', 'nezuko_run1', 'nezuko_run2',
    'zenitsu_idle', 'zenitsu_idle_attack', 'zenitsu_jump', 'zenitsu_jump_attack', 'zenitsu_crouch', 'zenitsu_crouch_attack', 'zenitsu_run1', 'zenitsu_run2',
    'inosuke_idle', 'inosuke_idle_attack', 'inosuke_jump', 'inosuke_jump_attack', 'inosuke_crouch', 'inosuke_crouch_attack', 'inosuke_run1', 'inosuke_run2',
    'slash_vfx'
]

os.makedirs(dest_dir, exist_ok=True)
# Clear dest dir
for f in dest_dir.glob('*.png'):
    f.unlink()

for base in bases:
    paths = []
    pattern = re.compile(f"^{base}(_v2)?_[0-9]+\\.png$")
    for f in source_dir.glob('*.png'):
        if pattern.match(f.name):
            paths.append(f)
            
    if paths:
        # Get the most recently created/modified file
        latest_file = max(paths, key=os.path.getmtime)
        target = dest_dir / f'{base}.png'
        shutil.copy2(latest_file, target)
        print(f"Copied {latest_file.name} to {target.name}")
    else:
        print(f"WARNING: No images found for {base}")

