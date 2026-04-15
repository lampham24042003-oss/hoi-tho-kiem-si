from PIL import Image

def inspect(path):
    print(f"Inspecting {path}")
    img = Image.open(path).convert("RGBA")
    datas = img.getdata()
    black_count = 0
    dark_count = 0
    white_count = 0
    alpha_0_count = 0
    total = len(datas)
    for r, g, b, a in datas:
        if a == 0:
            alpha_0_count += 1
        elif r < 50 and g < 50 and b < 50:
            dark_count += 1
        elif r > 200 and g > 200 and b > 200:
            white_count += 1
            
    print(f"Total pixels: {total}")
    print(f"Alpha=0: {alpha_0_count}")
    print(f"Dark pixels: {dark_count}")
    print(f"White pixels: {white_count}")

inspect("assets/effects/tanjiro_aura_v3.png")
inspect("assets/effects/hit_tanjiro_sword_v3.png")
