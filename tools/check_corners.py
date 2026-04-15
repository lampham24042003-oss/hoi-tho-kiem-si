from PIL import Image
import os

BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef'
files = ['tanjiro_idle_new_1775792052542.png', 'inosuke_crouch_new_1775792271838.png', 'zenitsu_idle_new_1775792083647.png']

for f in files:
    path = os.path.join(BRAIN_DIR, f)
    if os.path.exists(path):
        img = Image.open(path).convert('RGB')
        color = img.getpixel((10, 10))
        print(f"{f} background color at corner: {color}")
