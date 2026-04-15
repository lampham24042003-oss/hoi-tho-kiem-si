# KAMADO TANJIRO - COMBAT MECHANICS & STATS

## TỔNG QUAN NHÂN VẬT LÚC CHỌN (CHARACTER SELECT UI)
- **Tag (Phân loại chiến đấu)**: `Áp Sát`, `Dồn Sát Thương`
- **Chỉ số Sức Mạnh Đánh Giá (Hệ Cơ Bản)**:
  - Tấn công (Attack): `⭐⭐⭐⭐ (4/5)`
  - Phòng thủ (Defense): `⭐⭐⭐ (3/5)`
  - Tốc độ (Speed): `⭐⭐⭐⭐ (4/5)`
  - Linh hoạt (Agility): `⭐⭐⭐⭐ (4/5)`
  - Độ khó (Difficulty): `⭐⭐⭐ (3/5)`

## 1. DI CHUYỂN (MOVEMENT) & CHỈ SỐ CƠ BẢN
- **Cơ bản**:
  - HP Tối đa: `5000`
- **A / D (Trái / Phải)**:
  - Tốc độ cơ bản: `4.2 units/s`
  - Khi Cường hoá (U): `5.0 units/s` (+20%)
- **W (Nhảy)**:
  - Độ cao nhảy: `2.8 units`
  - Thời gian trên không: `~0.9s`
  - *Có thể attack trên không (J/K/L)*
- **S (Cúi)**:
  - Giảm hitbox xuống `~40% chiều cao`
  - Tốc độ di chuyển khi cúi: `2.2 units/s`

## 2. PHÂN LOẠI ĐÒN ĐÁNH
- 🔴 **Cận chiến (Melee – cần áp sát)**: `J1`, `J2`, `K` -> Range hiệu quả: `1.2 – 1.8 units`
- 🔵 **Tầm trung (Mid-range)**: `L (sóng kiếm)` -> Range: `4.5 – 6 units`
- 🟣 **Khống chế / Phòng thủ**: `B (block + counter)`

## 3. ATTACK CHI TIẾT
### ⚔️ J – CHÉM NGANG
- **J1 (Tap nhanh)**:
  - Damage: `55`
  - Cooldown: `0.45s`
  - Tốc độ ra đòn (Startup): `0.22s`
  - Recovery: `0.23s`
  - Hitbox: `120° phía trước`, dài `1.3 units`
  - Loại: Cận chiến nhanh
  - Lối đánh: Mở combo, spam pressure.
- **J2 (Giữ 0.3s)**:
  - Damage: `78`
  - Cooldown: `0.65s`
  - Tốc độ ra đòn (Startup): `0.35s`
  - Recovery: `0.3s`
  - Hitbox: `140°`, dài `1.7 units` (+30%)
  - Hiệu ứng: CÓ minor stagger (giật nhẹ)
  - Lối đánh: Kết thúc combo, punish đối thủ.

### 🦵 K – ĐÁ
- Damage: `48`
- Cooldown: `0.55s`
- Startup: `0.25s`
- Recovery: `0.3s`
- Range: `1.4 units`
- Hiệu ứng: Knockback nhẹ (`~0.8 units`)
- Lối đánh: Ngắt nhịp đối thủ, tạo khoảng cách để follow L.

### 🌊 L – SÓNG KIẾM (RANGED)
- Damage: `62`
- Cooldown: `0.8s`
- Startup: `0.3s`
- Projectile speed: `8 units/s`
- Range tối đa: `6 units`
- Hitbox: Rộng vừa (`~0.8 units`)
- Lối đánh: Cấu rỉa từ xa, kết thúc combo, ép đối thủ phải Block.

### 🛡️ B – BLOCK / COUNTER
- **Block**: Giảm `80% damage`, Miễn nhiễm stagger nhẹ. (Nếu giữ lâu -> Bị ép góc / ăn chip damage).
- **Counter**:
  - Window: Kích hoạt trong `0.2s` đầu tiên ngay khi nhấn B.
  - Trúng Timing -> Counter (Phản đòn):
    - Damage: `90`
    - Stun: `0.4s`
    - Kháng cự: Knockback nhẹ.

## 4. COMBO SYSTEM
- **Combo Cốt lõi**: `J` -> `K` -> `L`
- **Flow**: J (Mở) -> K (Đẩy lùi) -> L (Kết thúc từ xa dứt điểm).
- **Tổng Damage**: `~165 dmg`
- **Utility**: Có thể Cancel bằng `B` (Defensive cancel) hoặc Cancel bằng lướt / di chuyển.

## 5. ENERGY SYSTEM (NĂNG LƯỢNG)
- **Max limit**: `100`
- **Cơ chế hồi phục**: 
  - `8 energy/s` khi thả rông (không cast skill).
  - Ngừng hồi (`0 energy/s`) khi liên tục SPAM attack.
- Lối đánh: SPAM = Hết năng lượng. CHƠI KIỂM SOÁT NHỊP ĐỘ = Dồn được Ulti!

## 6. CƯỜNG HOÁ – NÚT U (DẤU ẤN DIỆT QUỶ)
- **Cost**: `-70 energy`
- **Duration**: `12s`
- **Buff**:
  - Damage Scale: `x2`
  - Attack speed: `+15%`
  - Move speed: `+20%` (Lên `5.0 units/s` thay vì 4.2)
- **Thuộc tính Damage Mới (Cực thốn)**:
  - J1: `110 dmg`
  - J2: `156 dmg`
  - K: `96 dmg`
  - L: `124 dmg`
- VAI TRÒ GAMEPLAY: Đẩy thành `Rushdown Mode`. Nhồi combo chuẩn có thể dứt điểm `~300-400 dmg`.

## 7. ULTIMATE (TUYỆT KỸ CẤP CAO)
- **THIẾT KẾ CHỐNG CHỒNG CHÉO (HẠN CHẾ CƠ CHẾ)**: KHÔNG THỂ kích hoạt Ultimate (Khóa Nút I và O) trong khi đang ở trạng thái Cường Hóa (Power Up). Người chơi phải tính toán kỹ 1 trong 2 lối đòn.

### 🔥 I – VIÊM VŨ (ULT 1)
- **Cost**: `-80 energy`
- **Range**: Cận chiến + Auto lock sát thương mục tiêu (`~2 units`).
- **Hiệu ứng**:
  - `4 hit` chém liên hoàn ác liệt.
  - Tổng damage: `520`
  - Stun cứng: `1.2s`
- Vai trò: Trừng phạt (Punish) sai lầm và vung đao quét sàn chốt hạ Round.

### 🔥🔥 O – LIÊN VŨ BẤT TẬN (ULT 2)
- **Cost**: `-95 energy`
- **Hiệu ứng**: 
  - `7 hit` liên hoàn tàn sát.
  - Base damage: `920`
  - Lửa đốt (Burn): `5 dmg/s × 4s` = `20 dmg` (Tổng DMG Thực Phẩm: `940 dmg`).
  - Stun cứng: `2.2s`
- **Nhược điểm Chí Mạng (Exhaustion)**:
  - Suy kiệt nội tạng sau khi tung chiêu: Thở dốc Mệt (Exhausted) mất `1.5s`.
  - Move speed sụt giảm: `-30%` (Chỉ còn `~3.0 units/s`).
  - Phế tính năng Lướt (Dash) nhanh.
- Vai trò: HIGH RISK / HIGH REWARD. Giấu bài kết thúc ván đấu triệt để.

## 8. NHỊP TRẬN (GAME FLOW CHIẾN LƯỢC TỔNG)
- **Early Phase (0–20s)**: Cấu rỉa máu bằng đạn sóng kiếm (`L`) và tạo pressure cận chiến liên tục bằng `J1` spam.
- **Mid Phase**: Chuyển giao qua Combo `J -> K -> L`. Rèn thói quen nhử mồi để Bait Counter.
- **Late Phase**: Tràn đầy năng lượng -> Dùng Cường hóa (`U`) xả ALL-IN kết thúc ván hoặc tích 100 sạc thẳng Ultimate.
