from PIL import Image, ImageChops
import os
import sys

def unmult_vfx(input_path, output_path):
    print(f"Processing VFX: {input_path}")
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Calculate luminance/brightness to use as the new Alpha channel
        # A simple method for Unmultiply on black is to use the Max(R, G, B) as alpha.
        # Alternatively, we can use the grayscale image directly.
        r, g, b, a = img.split()
        
        # Convert to grayscale to get intensity
        intensity = img.convert("L")
        
        # We replace the alpha channel with the grayscale intensity.
        # But wait, if we just set Alpha = Intensity, the RGB values remain the same... 
        # which means partially transparent pixels will also be darkened by their original black background.
        # True Unmult divides the RGB components by the new Alpha.
        
        # Create a new image data array
        data = img.getdata()
        new_data = []
        for r_val, g_val, b_val, _ in data:
            # We use max(r,g,b) as alpha to preserve bright colored pixels without dimming them
            alpha = max(r_val, g_val, b_val)
            if alpha == 0:
                new_data.append((0, 0, 0, 0))
            else:
                # Unmultiply: boost the color so it's not pre-darkened by the black backgound
                new_r = min(255, int(r_val * 255 / alpha))
                new_g = min(255, int(g_val * 255 / alpha))
                new_b = min(255, int(b_val * 255 / alpha))
                
                # We can taper off absolute black heavily to avoid noisy grey borders
                # If alpha is very low, let's just make it completely transparent
                if alpha < 10:
                    new_data.append((0, 0, 0, 0))
                else:
                    new_data.append((new_r, new_g, new_b, alpha))
                
        img.putdata(new_data)
        
        # Save output
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        img.save(output_path, "PNG")
        print(f" -> Saved to {output_path}")

    except Exception as e:
        print(f"Failed processing {input_path}: {e}")

def main():
    if len(sys.argv) < 3:
        print("Usage: python extract_vfx.py <input_folder> <output_folder>")
        return
        
    input_folder = sys.argv[1]
    output_folder = sys.argv[2]
    
    if not os.path.exists(input_folder):
        print(f"Input folder not found: {input_folder}")
        return
        
    for filename in os.listdir(input_folder):
        if filename.endswith(".png"):
            in_path = os.path.join(input_folder, filename)
            out_path = os.path.join(output_folder, filename)
            unmult_vfx(in_path, out_path)
            
    print("VFX Extraction Completed!")

if __name__ == "__main__":
    main()
