from PIL import Image

def remove_white(path, out):
    img = Image.open(path).convert("RGBA")
    datas = img.getdata()
    newData = []
    for item in datas:
        # If pixel is close to pure white, make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    img.putdata(newData)
    img.save(out, "PNG")
    print(f"Removed white background from {out}")

remove_white("/Users/lap60488/.gemini/antigravity/brain/dacc25c1-99f0-4b69-8445-7a261ecd9b65/gen_zenitsu_exhaust_1776185009401.png", "assets/effects/zenitsu_vfx/vfx_zenitsu_exhaust_pose.png")
