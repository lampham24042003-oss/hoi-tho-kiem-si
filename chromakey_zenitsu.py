import sys
import os
from PIL import Image

def process_image(input_path, output_path):
    print(f"Processing {input_path} -> {output_path}")
    img = Image.open(input_path).convert("RGBA")
    
    # Ensure it is exactly 1024x1024
    if img.size != (1024, 1024):
        img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
        
    data = img.getdata()
    new_data = []
    
    # Background color is SOLID BRIGHT BLUE #0000FF
    
    for item in data:
        r, g, b, a = item
        # Detect blueish background. Magenta and Cyan might be present, but target is pure blue.
        # Blue #0000FF means high B, low R and G.
        
        # Determine if the pixel is primarily the blue background
        if b > 150 and r < 80 and g < 150:
            new_data.append((0, 0, 0, 0)) # Transparent
        else:
            # Force black edge: if the pixel is slightly blue but mostly object, remove the blue fringe by turning it black-ish
            # Check for blue fringing (high blue component relative to green/red on the edge of the object)
            if b > r + 30 and b > g + 30 and b > 100:
                # Darken/turn to black outline
                new_data.append((10, 10, 10, a))
            else:
                new_data.append(item)
                
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved {output_path}")

if __name__ == "__main__":
    import glob
    import re
    
    # Pass path as sys.argv[1] or default to the current active conversation
    if len(sys.argv) > 1:
        artifacts_dir = sys.argv[1]
    else:
        artifacts_dir = "/Users/lap60488/.gemini/antigravity/brain/dacc25c1-99f0-4b69-8445-7a261ecd9b65"
        
    output_dir = "/Users/lap60488/.gemini/antigravity/scratch/hoi-tho-kiem-si-main/assets/sprites"
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    files = glob.glob(os.path.join(artifacts_dir, "zenitsu_*.webp")) + glob.glob(os.path.join(artifacts_dir, "zenitsu_*.png"))
    files.sort(key=os.path.getmtime)
    
    for file in files:
        base_name = os.path.basename(file)
        # Use regex to remove appended timestamp like _1776086126966 from the filename
        clean_name = re.sub(r'_\d+\.(png|webp)$', '.png', base_name)
        if clean_name == base_name and base_name.endswith(".webp"):
            clean_name = base_name.replace(".webp", ".png")
            
        out_path = os.path.join(output_dir, clean_name)
        process_image(file, out_path)
