from PIL import Image

def rescale_and_pad(path, scale_factor=0.75):
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    
    # Calculate new size
    new_w = int(w * scale_factor)
    new_h = int(h * scale_factor)
    
    # Resize image
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Create new blank transparent image of original size
    new_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    
    # Calculate position to paste: centered horizontally, aligned to the bottom
    x = (w - new_w) // 2
    y = h - new_h
    
    # Paste
    new_img.paste(resized, (x, y))
    
    # Save
    new_img.save(path)
    print(f"Successfully rescaled {path} by {scale_factor}x and bottom-anchored.")

rescale_and_pad('assets/sprites/tanjiro_exhaust_pose.png', 0.75)
