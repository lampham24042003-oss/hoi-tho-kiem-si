import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def generate_fiery_text(text, output_path, sizes=(140, 150)):
    # Create a large pure transparent canvas
    width, height = 1500, 600 # Taller to support multi-line
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    
    # Use Helvetica which fully supports Vietnamese on MacOS
    font_paths = [
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Arial.ttf"
    ]
    
    font = None
    for p in font_paths:
        try:
            font = ImageFont.truetype(p, sizes[0])
            break
        except Exception:
            continue
            
    if font is None:
        font = ImageFont.load_default()
    
    # Multi-line handling
    lines = text.split("\\n")
    
    # 1. Draw large blurred glow (Outer, Deep Red)
    glow_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.multiline_text((width/2, height/2), text.replace('\\n', '\n'), font=font, fill=(255, 0, 0, 200), anchor="mm", align="center", spacing=20)
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(15))
    
    # 2. Draw intense orange glow (Inner)
    glow2_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    glow2_draw = ImageDraw.Draw(glow2_img)
    glow2_draw.multiline_text((width/2, height/2), text.replace('\\n', '\n'), font=font, fill=(255, 100, 0, 255), anchor="mm", align="center", spacing=20)
    glow2_img = glow2_img.filter(ImageFilter.GaussianBlur(6))
    
    # 3. Draw core text (Yellow/White)
    core_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    core_draw = ImageDraw.Draw(core_img)
    
    # Bold stroke effect around core text for readability
    stroke_width = 3
    core_draw.multiline_text((width/2, height/2), text.replace('\\n', '\n'), font=font, fill=(255, 230, 150, 255), anchor="mm", align="center", spacing=20, stroke_width=stroke_width, stroke_fill=(50, 0, 0, 255))
    
    # Compose
    final = Image.alpha_composite(img, glow_img)
    final = Image.alpha_composite(final, glow2_img)
    final = Image.alpha_composite(final, core_img)
    
    # Crop to bounding box precisely
    bbox = final.getbbox()
    if bbox:
        # Add padding
        final = final.crop((max(0, bbox[0]-30), max(0, bbox[1]-30), min(width, bbox[2]+30), min(height, bbox[3]+30)))
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final.save(output_path, "PNG")
    print(f"Generated text: {output_path}")

base = "/Users/lap60488/Downloads/game aaa/assets/effects/tanjiro_vfx/"
generate_fiery_text("DẤU ẤN DIỆT QUỶ:\\nKHAI ẤN", base + "text_tanjiro_powerup.png")
generate_fiery_text("HỎA THẦN THẦN LẠC:\\nVIÊM VŨ", base + "text_tanjiro_ult1.png", sizes=(130, 150))
generate_fiery_text("HỎA THẦN THẦN LẠC:\\nLIÊN VŨ BẤT TẬN", base + "text_tanjiro_ult2.png", sizes=(130, 150))
