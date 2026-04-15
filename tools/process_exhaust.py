from PIL import Image
import math
import os

def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def process_magenta(src, dst):
    TOLERANCE = 170
    FEATHER = 45
    BG_COLOR = (255, 0, 255)
    
    img = Image.open(src).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            dist = color_distance((r, g, b), BG_COLOR)
            if dist <= FEATHER:
                pixels[x, y] = (0, 0, 0, 0)
            elif dist <= TOLERANCE:
                if g < 150: 
                    ratio = (dist - FEATHER) / (TOLERANCE - FEATHER)
                    a_new = int(round((ratio ** 2) * 255))
                    pixels[x, y] = (0, 0, 0, a_new)

    img.save(dst)
    print("Magenta extraction complete:", dst)

def extract_vfx_black(src, dst):
    img = Image.open(src).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            luminance = max(r, g, b)
            pixels[x, y] = (r, g, b, luminance)
    img.save(dst)
    print("VFX Black extraction complete:", dst)

process_magenta('/Users/lap60488/.gemini/antigravity/brain/47cfc395-f823-42ad-8c79-b1632a80a208/sprite_tanjiro_exhaust_pose_raw_1776028525680.png', 'assets/sprites/tanjiro_exhaust_pose.png')
extract_vfx_black('/Users/lap60488/.gemini/antigravity/brain/47cfc395-f823-42ad-8c79-b1632a80a208/vfx_tanjiro_exhaust_aura_raw_1776028541928.png', 'assets/effects/vfx_tanjiro_exhaust_aura.png')
