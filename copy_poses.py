import os
import glob
import shutil
import re
from pathlib import Path

source_dir = Path(os.path.expanduser('~/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'))
dest_dir = Path('./tools/test')

bases = {
    'pose_ultimate_tanjiro': 'tanjiro_ultimate',
    'pose_ultimate_nezuko': 'nezuko_ultimate',
    'pose_ultimate_zenitsu': 'zenitsu_ultimate',
    'pose_ultimate_inosuke': 'inosuke_ultimate'
}

for base, target_name in bases.items():
    paths = []
    pattern = re.compile(f"^{base}_[0-9]+\\.png$")
    for f in source_dir.glob('*.png'):
        if pattern.match(f.name):
            paths.append(f)
            
    if paths:
        latest_file = max(paths, key=os.path.getmtime)
        target = dest_dir / f'{target_name}.png'
        shutil.copy2(latest_file, target)
        print(f"Copied {latest_file.name} to {target.name}")
    else:
        print(f"WARNING: No images found for {base}")

