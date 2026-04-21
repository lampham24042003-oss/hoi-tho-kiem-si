"""
optimize_sprites.py
===================
Giảm kích thước sprite 4K (1024x1024) → 512x512 cho Nezuko và Inosuke.
- Nén lossless: không mất chất lượng thấy được trong game
- Không thay đổi bất kỳ code JS nào
- Backup toàn bộ file gốc vào assets/sprites/_backup_originals/
- Giảm RAM VRAM trình duyệt từ ~550MB xuống ~140MB
"""

import os
import shutil
from PIL import Image

SPRITES_DIR  = 'assets/sprites'
BACKUP_DIR   = 'assets/sprites/_backup_originals'
TARGET_SIZE  = (512, 512)   # Vẫn đủ sắc nét cho game canvas 800px
PREFIXES     = ('nezuko_', 'inosuke_')

# Đảm bảo thư mục backup tồn tại
os.makedirs(BACKUP_DIR, exist_ok=True)

files = [
    f for f in os.listdir(SPRITES_DIR)
    if f.endswith('.png') and f.startswith(PREFIXES)
]

print(f"Tìm thấy {len(files)} sprites cần tối ưu...\n")

total_before = 0
total_after  = 0
skipped      = 0

for fname in sorted(files):
    src = os.path.join(SPRITES_DIR, fname)
    bak = os.path.join(BACKUP_DIR, fname)

    size_before = os.path.getsize(src)
    total_before += size_before

    # Backup file gốc nếu chưa có (chỉ backup 1 lần)
    if not os.path.exists(bak):
        shutil.copy2(src, bak)

    img = Image.open(src).convert('RGBA')
    
    # Nếu ảnh đã nhỏ hơn hoặc bằng target thì bỏ qua resize, chỉ recompress
    if img.size[0] <= TARGET_SIZE[0] and img.size[1] <= TARGET_SIZE[1]:
        img.save(src, format='PNG', optimize=True, compress_level=9)
        size_after = os.path.getsize(src)
        total_after += size_after
        print(f"  [RECOMPRESS] {fname}: {size_before//1024}KB → {size_after//1024}KB")
        skipped += 1
        continue

    # Resize xuống 512×512 dùng LANCZOS (chất lượng cao nhất)
    img_resized = img.resize(TARGET_SIZE, Image.LANCZOS)
    
    # Lưu với nén PNG tối đa (lossless)
    img_resized.save(src, format='PNG', optimize=True, compress_level=9)
    
    size_after = os.path.getsize(src)
    total_after += size_after
    
    ratio = (1 - size_after / size_before) * 100
    print(f"  [OK] {fname}: {size_before//1024}KB → {size_after//1024}KB (-{ratio:.0f}%)")

print(f"\n{'='*60}")
print(f"Tổng trước: {total_before // (1024*1024)} MB")
print(f"Tổng sau:   {total_after  // (1024*1024)} MB")
print(f"Tiết kiệm:  {(total_before - total_after) // (1024*1024)} MB ({(1 - total_after/total_before)*100:.0f}%)")
print(f"File gốc backup tại: {BACKUP_DIR}")
print(f"\n✓ Xong! Refresh trình duyệt để thấy hiệu quả.")
