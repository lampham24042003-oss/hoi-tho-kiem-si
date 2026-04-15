import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

def extract_black_chroma(img):
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r <= 60 and g <= 60 and b <= 60:
                lum = (0.299 * r + 0.587 * g + 0.114 * b)
                new_a = int((lum / 60.0) * 255) if lum > 5 else 0
                pixels[x, y] = (0, 0, 0, new_a)
            elif r < 120 and g < 50 and b < 50:
                lum = (0.299 * r + 0.587 * g + 0.114 * b)
                pixels[x, y] = (r, g, b, int(max(0, min(255, lum * 2.5))))
    return img

def create_3d_text(text, font, canvas_size):
    width, height = canvas_size
    layer_3d = Image.new('RGBA', (width, height), (0,0,0,0))
    d_3d = ImageDraw.Draw(layer_3d)
    
    layer_face = Image.new('RGBA', (width, height), (0,0,0,0))
    d_face = ImageDraw.Draw(layer_face)
    
    lines = text.replace('\\n','\n').split('\n')
    text_w = 0
    text_h = 0
    # Center text
    try:
        bbox = d_face.multiline_textbbox((0,0), "\n".join(lines), font=font, align='center')
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
    except:
        pass
    
    cx, cy = width/2, height/2
    
    # Draw huge 3D extrusion (Heavy Black/Dark Red)
    depth = 12
    for offset in range(depth, 0, -1):
        color = (30, 0, 0, 255) if offset > 3 else (80, 0, 0, 255)
        # Heavy stroke for extrusion outline
        for dx in [-2, 0, 2]:
            for dy in [-2, 0, 2]:
                d_3d.multiline_text((cx + offset + dx, cy + offset + dy), "\n".join(lines), font=font, fill=(0,0,0,255), anchor="mm", align="center")
        d_3d.multiline_text((cx + offset, cy + offset), "\n".join(lines), font=font, fill=color, anchor="mm", align="center")
        
    # Draw true face mask
    face_mask = Image.new('L', (width, height), 0)
    d_mask = ImageDraw.Draw(face_mask)
    d_mask.multiline_text((cx, cy), "\n".join(lines), font=font, fill=255, anchor="mm", align="center")
    
    # Gradient applied to face
    face_gradient = Image.new('RGBA', (width, height), (0,0,0,0))
    grad_data = []
    top_c = (255, 230, 100, 255) # Yellow
    bot_c = (255, 50, 0, 255)    # Red
    for y in range(height):
        # Create gradient map over the text's vertical height
        factor = max(0, min(1, (y - (cy - text_h/2)) / float(text_h+1)))
        r = int(top_c[0] + factor*(bot_c[0] - top_c[0]))
        g = int(top_c[1] + factor*(bot_c[1] - top_c[1]))
        b = int(top_c[2] + factor*(bot_c[2] - top_c[2]))
        grad_data.extend([(r,g,b,255)] * width)
    face_gradient.putdata(grad_data)
    
    # composite face
    layer_face = Image.new('RGBA', (width, height), (0,0,0,0))
    layer_face.paste(face_gradient, (0,0), face_mask)
    
    # Inner shadow / Bevel effect: slightly shifted black mask subtracted
    inner_shadow = Image.new('RGBA', (width, height), (0,0,0,0))
    d_inner = ImageDraw.Draw(inner_shadow)
    d_inner.multiline_text((cx - 3, cy - 3), "\n".join(lines), font=font, fill=(255,255,255,100), anchor="mm", align="center")
    layer_face = Image.alpha_composite(layer_face, inner_shadow)
    
    # White Stroke Outline
    stroke_layer = Image.new('RGBA', (width, height), (0,0,0,0))
    d_stroke = ImageDraw.Draw(stroke_layer)
    stroke_w = 4
    for dx in range(-stroke_w, stroke_w+1):
        for dy in range(-stroke_w, stroke_w+1):
           if dx==0 and dy==0: continue
           d_stroke.multiline_text((cx + dx, cy + dy), "\n".join(lines), font=font, fill=(255,255,255,255), anchor="mm", align="center")
           
    # Final assembly: Outer Stroke -> 3D Block -> Face
    final_text = Image.alpha_composite(stroke_layer, layer_3d)
    final_text = Image.alpha_composite(final_text, layer_face)
    
    return final_text

def generate_epic_text_art(text, output_path, bg_path, font_size=160):
    width, height = 1500, 700
    try:
        bg = Image.open(bg_path)
        bg = extract_black_chroma(bg)
        bg = bg.resize((width, height), Image.Resampling.LANCZOS)
    except:
        bg = Image.new('RGBA', (width, height), (0,0,0,0))
        
    # Extremely aggressive font
    p = "/tmp/Anton.ttf"
    try:
        font = ImageFont.truetype(p, font_size)
    except:
        font = ImageFont.load_default()
        print("COULD NOT LOAD ANTON FONT!")

    # Generate 3D textual overlay
    text_comp = create_3d_text(text, font, (width, height))
    
    # Massive Glow behind text
    glow = text_comp.copy()
    glow = glow.filter(ImageFilter.GaussianBlur(15))
    glow_enhancer = ImageEnhance.Brightness(glow)
    glow = glow_enhancer.enhance(1.5)
    
    # Final Layering
    final = Image.alpha_composite(bg, glow)
    final = Image.alpha_composite(final, text_comp)
    
    bbox = final.getbbox()
    if bbox:
        final = final.crop((max(0, bbox[0]-50), max(0, bbox[1]-50), min(width, bbox[2]+50), min(height, bbox[3]+50)))
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final.save(output_path, "PNG")
    print(f"Generated Masterpiece Text Art: {output_path}")

base = "/Users/lap60488/Downloads/game aaa/assets/effects/tanjiro_vfx/"
bg_path = "/Users/lap60488/.gemini/antigravity/brain/47cfc395-f823-42ad-8c79-b1632a80a208/epic_brush_stroke_1776025008077.png"

generate_epic_text_art("DẤU ẤN DIỆT QUỶ:\\nKHAI ẤN", base + "text_tanjiro_powerup.png", bg_path, font_size=150)
generate_epic_text_art("HỎA THẦN THẦN LẠC:\\nVIÊM VŨ", base + "text_tanjiro_ult1.png", bg_path, font_size=140)
generate_epic_text_art("HỎA THẦN THẦN LẠC:\\nLIÊN VŨ BẤT TẬN", base + "text_tanjiro_ult2.png", bg_path, font_size=140)
