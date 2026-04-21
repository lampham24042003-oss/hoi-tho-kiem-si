import sys
from PIL import Image

def find_crouch_box(path):
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    data = img.getdata()
    
    lowest_y = 0
    
    for y in range(h-1, -1, -1):
        found = False
        for x in range(w):
            r, g, b, a = data[y*w + x]
            # Not magenta
            if not (r > 150 and b > 150 and g < 100):
                lowest_y = y
                found = True
                break
        if found:
            break
            
    print(f"Lowest non-magenta pixel is at y={lowest_y}")

find_crouch_box('assets/sprites/inosuke sprites/inosuke_crouch.jpeg')
