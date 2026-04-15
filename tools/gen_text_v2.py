import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def extract_black_chroma(img):
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Advanced luma chromakey for black to keep fire glowing beautifully
            if r <= 50 and g <= 50 and b <= 50:
                lum = (0.299 * r + 0.587 * g + 0.114 * b)
                new_a = int((lum / 50.0) * 255) if lum > 5 else 0
                pixels[x, y] = (0, 0, 0, new_a)
            elif r < 100 and g < 40 and b < 40:
                # Dark red shadow blending
                lum = (0.299 * r + 0.587 * g + 0.114 * b)
                pixels[x, y] = (r, g, b, int(max(0, min(255, lum * 2))))
    return img

def generate_calligraphy_text(text, output_path, bg_image_path, sizes=(130, 150)):
    width, height = 1500, 600
    
    # 1. Prepare magnificent background
    try:
        bg = Image.open(bg_image_path)
        bg = extract_black_chroma(bg)
        # Squeeze/stretch to fit text width
        bg = bg.resize((width, height), Image.Resampling.LANCZOS)
    except Exception as e:
        print(f"Failed to load BG: {e}")
        bg = Image.new('RGBA', (width, height), (0, 0, 0, 0))

    # 2. Try the beautiful downloaded Vietnamese handwriting font first
    font_paths = [
        "/tmp/font.ttf",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Arial.ttf"
    ]
    font = None
    for p in font_paths:
        if os.path.exists(p):
            try:
                font = ImageFont.truetype(p, sizes[0])
                break
            except Exception:
                continue
    if font is None:
        font = ImageFont.load_default()
        
    # 3. Draw Text
    text_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(text_layer)
    
    # Text positions adjusted for natural handwriting balance
    # Hot fiery glow behind text to integrate it
    glow_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.multiline_text((width/2, height/2), text.replace('\\n', '\n'), font=font, fill=(255, 50, 0, 220), anchor="mm", align="center", spacing=30)
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(8))
    
    # Core text (Bright Yellow/White like super-heated fire)
    # Using multiple strokes for thick impact styling
    stroke_w = 4
    for dx in [-stroke_w, 0, stroke_w]:
        for dy in [-stroke_w, 0, stroke_w]:
             d.multiline_text((width/2 + dx, height/2 + dy), text.replace('\\n', '\n'), font=font, fill=(50, 0, 0, 255), anchor="mm", align="center", spacing=30)
             
    d.multiline_text((width/2, height/2), text.replace('\\n', '\n'), font=font, fill=(255, 230, 200, 255), anchor="mm", align="center", spacing=30)
    
    # Compose
    final = Image.alpha_composite(bg, glow_img)
    final = Image.alpha_composite(final, text_layer)
    
    # Crop to tightly bound the action
    bbox = final.getbbox()
    if bbox:
        # Give generous padding for the flames to breathe
        final = final.crop((max(0, bbox[0]-40), max(0, bbox[1]-40), min(width, bbox[2]+40), min(height, bbox[3]+40)))
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final.save(output_path, "PNG")
    print(f"Generated Epic Text Art: {output_path}")

base = "/Users/lap60488/Downloads/game aaa/assets/effects/tanjiro_vfx/"
# Use the newly generated masterpiece brush stroke
bg_path = "/Users/lap60488/.gemini/antigravity/brain/47cfc395-f823-42ad-8c79-b1632a80a208/epic_brush_stroke_1776025008077.png"

generate_calligraphy_text("DẤU ẤN DIỆT QUỶ:\\nKHAI ẤN", base + "text_tanjiro_powerup.png", bg_path, sizes=(130, 150))
generate_calligraphy_text("HỎA THẦN THẦN LẠC:\\nVIÊM VŨ", base + "text_tanjiro_ult1.png", bg_path, sizes=(120, 150))
generate_calligraphy_text("HỎA THẦN THẦN LẠC:\\nLIÊN VŨ BẤT TẬN", base + "text_tanjiro_ult2.png", bg_path, sizes=(120, 150))
