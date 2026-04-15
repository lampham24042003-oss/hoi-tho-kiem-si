import sys

def analyze(file_path):
    # Pure python code to read jpeg headers
    with open(file_path, "rb") as f:
        data = f.read(500)
        # Check APP0 segment for JFIF
        print(f"Read {len(data)} bytes")
        
analyze("assets/effects/tanjiro_impact_v2.png")
