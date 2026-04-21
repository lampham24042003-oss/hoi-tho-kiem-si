import sys
from PIL import Image

def check_bottom(path):
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    data = img.getdata()
    
    bottom_row = [data[(h-1)*w + x] for x in range(w)]
    
    # Just print the first 5 pixels of the bottom row to see if it's magenta or the character
    print(f"File {path}")
    print(f"Sample of absolute bottom edge pixels: {bottom_row[400:410]}")

check_bottom('assets/sprites/inosuke sprites/inosuke_crouch.jpeg')
