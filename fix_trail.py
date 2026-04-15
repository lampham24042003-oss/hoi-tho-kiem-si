from PIL import Image

def process(path, out):
    img = Image.open(path).convert("RGBA")
    datas = img.getdata()
    newData = []
    for r, g, b, a in datas:
        lum = max(r, g, b)
        newData.append((r, g, b, lum))
    img.putdata(newData)
    img.save(out, "PNG")
    print(f"Fixed {out}")

process("ult1_trail.png", "assets/effects/zenitsu_vfx/vfx_zenitsu_ult1_attack.png")
process("ult2_trail.png", "assets/effects/zenitsu_vfx/vfx_zenitsu_ult2_attack.png")
