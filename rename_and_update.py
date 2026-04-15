import os
import glob

# 1. Rename files in assets/effects
effects_dir = 'assets/effects'
for f in glob.glob(f"{effects_dir}/*.png"):
    if "_v3" not in f:
        new_name = f.replace(".png", "_v3.png")
        os.rename(f, new_name)
        print(f"Renamed {f} to {new_name}")

# 2. Update characters_v2.js
js_file = 'js/characters_v2.js'
with open(js_file, 'r') as file:
    content = file.read()

# Replace any .png in assets/effects with _v3.png
content = content.replace('.png', '_v3.png')
# Fix double _v3 if any
content = content.replace('_v3_v3.png', '_v3.png')
content = content.replace('_v2_v3.png', '_v3.png') # This means _v2 becomes _v3

with open(js_file, 'w') as file:
    file.write(content)

print("Updated characters_v2.js")
