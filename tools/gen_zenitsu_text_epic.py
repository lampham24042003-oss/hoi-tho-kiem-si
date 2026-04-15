import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

def create_3d_text(text, font, canvas_size):
    width, height = canvas_size
    layer_3d = Image.new('RGBA', (width, height), (0,0,0,0))
    d_3d = ImageDraw.Draw(layer_3d)
    
    layer_face = Image.new('RGBA', (width, height), (0,0,0,0))
    d_face = ImageDraw.Draw(layer_face)
    
    lines = text.replace('\\n','\n').split('\n')
    text_w = 0
    text_h = 0
    try:
        bbox = d_face.multiline_textbbox((0,0), "\n".join(lines), font=font, align='center')
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
    except:
        pass
    
    cx, cy = width/2, height/2
    
    # Draw huge 3D extrusion
    depth = 12
    for offset in range(depth, 0, -1):
        color = (15, 15, 15, 255) if offset > 3 else (40, 40, 40, 255)
        for dx in [-2, 0, 2]:
            for dy in [-2, 0, 2]:
                d_3d.multiline_text((cx + offset + dx, cy + offset + dy), "\n".join(lines), font=font, fill=(0,0,0,255), anchor="mm", align="center")
        d_3d.multiline_text((cx + offset, cy + offset), "\n".join(lines), font=font, fill=color, anchor="mm", align="center")
        
    face_mask = Image.new('L', (width, height), 0)
    d_mask = ImageDraw.Draw(face_mask)
    d_mask.multiline_text((cx, cy), "\n".join(lines), font=font, fill=255, anchor="mm", align="center")
    
    face_gradient = Image.new('RGBA', (width, height), (0,0,0,0))
    grad_data = []
    top_c = (255, 255, 255, 255)
    bot_c = (255, 200, 0, 255)
    for y in range(height):
        factor = max(0, min(1, (y - (cy - text_h/2)) / float(max(1, text_h))))
        r = int(top_c[0] + factor*(bot_c[0] - top_c[0]))
        g = int(top_c[1] + factor*(bot_c[1] - top_c[1]))
        b = int(top_c[2] + factor*(bot_c[2] - top_c[2]))
        grad_data.extend([(r,g,b,255)] * width)
    face_gradient.putdata(grad_data)
    
    layer_face = Image.new('RGBA', (width, height), (0,0,0,0))
    layer_face.paste(face_gradient, (0,0), face_mask)
    
    inner_shadow = Image.new('RGBA', (width, height), (0,0,0,0))
    d_inner = ImageDraw.Draw(inner_shadow)
    d_inner.multiline_text((cx - 3, cy - 3), "\n".join(lines), font=font, fill=(255,255,255,100), anchor="mm", align="center")
    layer_face = Image.alpha_composite(layer_face, inner_shadow)
    
    stroke_layer = Image.new('RGBA', (width, height), (0,0,0,0))
    d_stroke = ImageDraw.Draw(stroke_layer)
    stroke_w = 5
    for dx in range(-stroke_w, stroke_w+1):
        for dy in range(-stroke_w, stroke_w+1):
           if dx==0 and dy==0: continue
           d_stroke.multiline_text((cx + dx, cy + dy), "\n".join(lines), font=font, fill=(255,250,150,255), anchor="mm", align="center")
           
    final_text = Image.alpha_composite(stroke_layer, layer_3d)
    final_text = Image.alpha_composite(final_text, layer_face)
    return final_text

def draw_electricity(layer, cx, cy, width, height, num_bolts):
    d = ImageDraw.Draw(layer)
    import random
    for _ in range(num_bolts):
        start_x = cx + random.randint(-600, 600)
        start_y = cy + random.randint(-200, 200)
        points = [(start_x, start_y)]
        curr_x, curr_y = start_x, start_y
        for i in range(10):
            curr_x += random.randint(20, 120) * (1 if random.random() > 0.5 else -1)
            curr_y += random.randint(-80, 80)
            points.append((curr_x, curr_y))
        d.line(points, fill=(255, 255, 100, 150), width=random.randint(4,10), joint="curve")
        d.line(points, fill=(255, 255, 255, 255), width=random.randint(2,4), joint="curve")

def generate_zenitsu_epic_text_art(text, output_path, font_size=150):
    width, height = 4000, 2000
    
    p = "/System/Library/Fonts/Supplemental/Arial Bold.ttf" 
    try:
        font = ImageFont.truetype(p, font_size)
    except:
        font = ImageFont.load_default()
        print("COULD NOT LOAD ARIAL BOLD. FALLING BACK TO DEFAULT.")

    text_comp = create_3d_text(text, font, (width, height))
    
    elec_comp = Image.new('RGBA', (width, height), (0,0,0,0))
    draw_electricity(elec_comp, width/2, height/2, width, height, 12)
    
    glow = text_comp.copy()
    glow = Image.alpha_composite(glow, elec_comp)
    glow = glow.filter(ImageFilter.GaussianBlur(25))
    glow_enhancer = ImageEnhance.Brightness(glow)
    glow = glow_enhancer.enhance(2.0)
    
    tight_glow = text_comp.copy()
    tight_glow = tight_glow.filter(ImageFilter.GaussianBlur(8))
    
    final = Image.alpha_composite(glow, tight_glow)
    final = Image.alpha_composite(final, elec_comp)
    final = Image.alpha_composite(final, text_comp)
    
    bbox = final.getbbox()
    if bbox:
        # Extra padding just in case
        final = final.crop((max(0, bbox[0]-150), max(0, bbox[1]-150), min(width, bbox[2]+150), min(height, bbox[3]+150)))
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    # Scale down a bit to match the actual game UI since 4000px is way too big
    # But ONLY if it's too big, let's just make it natural
    scale_factor = 0.5
    final = final.resize((int(final.width * scale_factor), int(final.height * scale_factor)), Image.Resampling.LANCZOS)
    
    final.save(output_path, "PNG")
    print(f"Generated Masterpiece Text Art: {output_path}")

base = "/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/assets/effects/zenitsu_vfx/"
generate_zenitsu_epic_text_art("PHÍCH LỊCH NHẤT THIỂM:\nLỤC LIÊN", base + "ult_text_zenitsu_ult0.png", font_size=200)
generate_zenitsu_epic_text_art("PHÍCH LỊCH NHẤT THIỂM:\nBÁT LIÊN", base + "ult_text_zenitsu_ult1.png", font_size=200)
generate_zenitsu_epic_text_art("PHÍCH LỊCH NHẤT THIỂM:\nTHẦN TỐC", base + "ult_text_zenitsu_ult2.png", font_size=210)
