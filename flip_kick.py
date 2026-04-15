from PIL import Image, ImageOps
import os
path = '/Users/lap60488/Downloads/game aaa/assets/sprites/tanjiro_kick.png'
if os.path.exists(path):
    img = Image.open(path)
    img_flipped = ImageOps.mirror(img)
    img_flipped.save(path)
    print("Flipped tanjiro_kick.png successfully.")
else:
    print("tanjiro_kick.png not found.")
