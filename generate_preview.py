import os
import glob

sprite_dir = '/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/assets/sprites'
html_path = '/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/sprite_preview.html'

t_files = sorted([os.path.basename(f) for f in glob.glob(os.path.join(sprite_dir, 'tanjiro_*.png'))])
z_files = sorted([os.path.basename(f) for f in glob.glob(os.path.join(sprite_dir, 'zenitsu_*.png'))])

html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sprite Preview</title>
    <style>
        body { font-family: sans-serif; background: #222; color: #fff; padding: 20px; }
        .container { display: flex; flex-wrap: wrap; gap: 20px; }
        .card { background: #333; padding: 10px; border-radius: 8px; text-align: center; }
        img { max-width: 200px; height: auto; background: #555; }
        h1 { border-bottom: 2px solid #555; padding-bottom: 10px; }
    </style>
</head>
<body>
    <h1>Tanjiro Sprites</h1>
    <div class="container">
"""

for f in t_files:
    html_content += f'        <div class="card"><img src="assets/sprites/{f}" alt="{f}"><br><small>{f}</small></div>\n'

html_content += """
    </div>
    <h1>Zenitsu Sprites</h1>
    <div class="container">
"""

for f in z_files:
    html_content += f'        <div class="card"><img src="assets/sprites/{f}" alt="{f}"><br><small>{f}</small></div>\n'

html_content += """
    </div>
</body>
</html>
"""

with open(html_path, 'w') as f:
    f.write(html_content)

print(f"Generated {html_path}")
