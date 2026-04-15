from PIL import Image
def fix_lightning(path, out):
    img = Image.open(path).convert("RGBA")
    datas = img.getdata()
    newData = []
    for r, g, b, a in datas:
        lum = max(r, g, b)
        newData.append((r, g, b, lum))
    img.putdata(newData)
    img.save(out, "PNG")
    print(f"Fixed {out}")

fix_lightning("/Users/lap60488/.gemini/antigravity/brain/dacc25c1-99f0-4b69-8445-7a261ecd9b65/gen_zenitsu_ult1_dash_1776185375992.png", "assets/effects/zenitsu_vfx/vfx_zenitsu_ult1_attack.png")
fix_lightning("/Users/lap60488/.gemini/antigravity/brain/dacc25c1-99f0-4b69-8445-7a261ecd9b65/gen_zenitsu_ult2_dash_1776185616615.png", "assets/effects/zenitsu_vfx/vfx_zenitsu_ult2_attack.png")
