from PIL import Image, ImageDraw
import sys
import numpy as np

img_path = sys.argv[1]
out_path = sys.argv[2]

img = Image.open(img_path).convert("RGB")
w, h = img.size

# Create a radial gradient mask (center white, edges black)
# To guarantee no cutoff, the mask drops to 0 smoothly but quickly near the edge.
Y, X = np.ogrid[:h, :w]
dist_from_center = np.sqrt((X - w/2)**2 + (Y - h/2)**2)

# Max distance is roughly w/2. We want it to reach 0 at say 0.9 * max_dist
max_dist = min(w, h)/2
mask = np.clip(1.0 - (dist_from_center / (max_dist * 0.85)), 0, 1)

# Apply some easing like x^2 to make the center stay bright longer
mask = mask ** 1.5

# Multiply RGB by mask
arr = np.array(img).astype(float)
arr[:,:,0] *= mask
arr[:,:,1] *= mask
arr[:,:,2] *= mask

img_out = Image.fromarray(arr.astype(np.uint8))
img_out.save(out_path)
print("Saved", out_path)
