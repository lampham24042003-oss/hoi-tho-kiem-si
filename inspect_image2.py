from PIL import Image

def analyze_pixels(path):
    print(f"--- Analyzing {path} ---")
    img = Image.open(path).convert("RGBA")
    datas = list(img.getdata())
    
    unique_colors = {}
    for r, g, b, a in datas:
        if a > 10:  # Ignore almost transparent pixels
            color = (r, g, b, a)
            unique_colors[color] = unique_colors.get(color, 0) + 1
            
    # Print the top 10 most frequent non-transparent colors
    sorted_colors = sorted(unique_colors.items(), key=lambda x: x[1], reverse=True)
    print("Top 20 colors:")
    for color, count in sorted_colors[:20]:
        print(f"Color: {color}, Count: {count}")

analyze_pixels("assets/effects/hit_tanjiro_sword_v3.png")
