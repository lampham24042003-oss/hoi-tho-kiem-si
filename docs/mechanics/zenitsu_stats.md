# AGATSUMA ZENITSU - COMBAT MECHANICS & STATS

## TỔNG QUAN NHÂN VẬT LÚC CHỌN (CHARACTER SELECT UI)
- **Tag (Phân loại chiến đấu)**: `Siêu Tốc Độ`, `Sát Thủ Đột Kích`, `High Risk - High Reward`
- **Chỉ số Sức Mạnh Đánh Giá (Hệ Cơ Bản)**:
  - Tấn công (Attack): `⭐⭐⭐⭐ (4/5)`
  - Phòng thủ (Defense): `⭐⭐ (2/5)`
  - Tốc độ (Speed): `⭐⭐⭐⭐⭐ (5/5)`
  - Linh hoạt (Agility): `⭐⭐⭐⭐ (4/5)`
  - Độ khó (Difficulty): `⭐⭐⭐⭐⭐ (5/5)`

## 1. DI CHUYỂN (MOVEMENT) & CHỈ SỐ CƠ BẢN
- **Cơ bản**:
  - HP Tối đa: `4200` (Máu thấp hơn Tanjiro, bù lại tốc độ cao cực đại)
- **A / D (Trái / Phải)**:
  - Tốc độ cơ bản: `5.2 units/s` (Nhanh nhất dàn nhân vật cơ bản)
  - Khi Cường hoá Thức Tỉnh (U): `6.5 units/s` (+25%)
- **W (Nhảy)**:
  - Độ cao nhảy: `3.0 units` (Nhảy bổng hơn)
  - Thời gian trên không: `~0.8s`
  - *Có thể attack trên không (Dùng bộ Jump Attacks)*
- **S (Cúi - Thể Iaijutsu)**:
  - Giảm hitbox xuống `~35% chiều cao` (Rạp gốc cây sát sàn)
  - Tốc độ lết sát đất (`crouch_walk`): `2.5 units/s`

## 2. PHÂN LOẠI ĐÒN ĐÁNH (POSE TƯƠNG ỨNG MỚI ĐƯỢC RENDER V4)
- 🔴 **Cận chiến (Melee – Rút kiếm chớp nhoáng)**: `J1`, `J2`, `K` -> Range cực hẹp nhưng chớp nhoáng: `1.0 – 1.6 units`
- 🔵 **Tầm trung (Mid-range Sóng Chớp)**: `L (projectile)` -> Range: `5.0 – 7 units`
- 🟣 **Tấn công lén (Crouch / Không chiến)**: Tận dụng các tư thế gập người hoặc nhảy cao để tạo bất ngờ.

## 3. ATTACK CHI TIẾT
### ⚔️ J – CHÉM RÚT KIẾM (IAIJUTSU)
- **J1 (Tap nhanh - `zenitsu_idle_attack`)**:
  - Damage: `45`
  - Cooldown: `0.35s`
  - Tốc độ ra đòn (Startup): `0.15s` (Cực kỳ chớp nhoáng)
  - Recovery: `0.25s`
  - Lối đánh: Mở combat thủng phòng ngự kẻ thù nhanh chóng.
- **J2 (Giữ 0.3s - `zenitsu_heavy_attack`)**:
  - Damage: `75`
  - Cooldown: `0.7s`
  - Tốc độ ra đòn (Startup): `0.4s` (Gồng lâu hơn Tanjiro)
  - Recovery: `0.45s`
  - Hitbox: `120°`, dài `1.8 units`
  - Hiệu ứng: Chém bổ đè nát búa, giật lùi (knockback).

### 🦵 K – ĐÁ (MARTIAL ARTS)
- **K (Đứng đá thẳng chân - `zenitsu_kick`)**:
  - Damage: `42`
  - Cực kỳ hữu dụng khi cần hất văng địch ra khỏi vùng cận chiến.
- **S + K (Đá Quét Sàn - `zenitsu_crouch_kick`)**:
  - Damage: `35`
  - Hiệu ứng: Cú quét trụ cực hiểm khiến đối phương "Té ngã" (Knockdown) trong 0.5s.

### 🌊 L – PHÓNG KIẾM KHÍ (PROJECTILE)
- **L (`zenitsu_projectile`)**:
  - Damage: `65`
  - Projectile speed: `12 units/s` (Bay cực nhanh tựa tia chớp)
  - Hitbox: Hẹp nhưng xuyên suốt xa (`~7 units`)
  - Lối đánh: Dìm hàng đối thủ không cho áp sát để câu giờ sạc Ulti.

### 🛡️ B – GẬP NGƯỜI THỦ / PHẢN XẠ THẦN TOÁN
- **Block**: Giảm `70% damage`. Phòng thủ của Zen yếu hơn, dễ vỡ Block (Guard Break).
- **Counter**: Bóp cò trong `0.15s` đầu tiên (Cửa sổ mỏng manh, Đòi hỏi tay cực to).
  - Trúng Timing -> Phản sát thương `110 dmg` kèm tê liệt `0.6s`.

## 4. COMBO SYSTEM
- **Combo Cốt lõi**: Gập người (`S + J1`) -> Hất tung (`K`) -> Bay lên nã Phóng Khí (`W + L`).
- **Flow**: Đánh úp (Hit and Run). Không đứng cù cưa cận chiến tay bo lâu quá 2 giây vì máu giấy cực yếu.

## 5. ENERGY SYSTEM (SẤM SÉT NỘI TẠI)
- **Max limit**: `100` tĩnh điện.
- **Cơ chế hồi phục**: 
  - Khác hẳn Tanjiro! Hồi cực nhanh `15 energy/s` khi **đứng im hoàn toàn** (Crouch hoặc Idle), nhưng **không hồi** khi đang đi bộ.
- Lối đánh: Nằm gai nếm mật, né đòn chờ đầy nộ rồi Bọc Sét bay vào.

## 6. CƯỜNG HOÁ TỐC ĐỘ – NÚT U (THỨC TỈNH)
- **Cost**: `-60 energy`
- **Duration**: `9s` (Thời lượng ngắn hơn Tanjiro)
- **Buff**:
  - Toàn bộ thời gian ra đòn (Startup và Recovery) chia đôi (Cực kỳ ảo diệu).
  - Bóng viền điện vàng bám vào người, Movement Speed văng lên `6.5 units/s`.
- VAI TRÒ: Zenitsu lúc này chạy nhảy như cào cào, dồn Damage shock.

## 7. ULTIMATE (KIẾM KỸ HƠI THỞ SẤM SÉT)
*(Khóa Nút I và O khi đang bật Cường Hóa U)*

### ⚡ I – BÍCH LỊCH NHẤT THIỂN (THUNDERCLAP & FLASH LỤC LIÊN)
- Tương ứng chùm ảnh: `zenitsu_ultimate1_charge` -> `zenitsu_ultimate1_attack`
- **Cost**: `-75 energy`
- **Cơ chế**: Vận sức tụ điện tròn trong `0.6s`, sau đó lao gạch chéo qua màn hình `6 lần`!
- **Hiệu ứng**:
  - Damage siêu khủng: `6 x 110` = `660 DMG`.
  - Khóa chặt địch trong khung hình, Stun `1.8s`.
- Vai trò: Đóng tráp đối thủ 1/3 cây máu chỉ trong chớp mắt. Chuyên dùng trừng phạt khi địch ném hụt skill.

### ⚡⚡⚡ O – THẦN TỐC (GODSPEED - Bát Liên Thần Tốc)
- Tương ứng chùm ảnh: `zenitsu_ultimate2_charge` -> `zenitsu_ultimate2_attack` -> `zenitsu_ultimate_dash` -> `zenitsu_ultimate_pose` -> `zenitsu_exhaust_pose`.
- **Cost**: `-100 energy` (Cạn thanh nội tại)
- **Cơ chế (Tất Sát Kỹ Tối Hình)**:
  - Phase 1: Tạo quả cầu thu lôi sát sàn ép điện vô cực (`ultimate2_charge`).
  - Phase 2: Bùng nổ quét văng 100% diện tích màn hình bằng tốc độ ánh sáng ngang dọc (`ultimate_dash` x 8 lần). Lôi ra `ultimate_pose` dứt điểm cực ngầu đằng sau lưng địch.
  - Tổng Damage: Lên tới `1150 DMG` (One-shot nếu địch dưới nửa bình).
- **Nhược điểm Chí Mạng (Tản Công Toàn Bộ)**:
  - Kích hoạt xong, tự động gục xuống chuyển sang rạp đất `zenitsu_exhaust_pose`.
  - Đóng băng toàn bộ hoạt động (Không thể Guard, không thể Nhảy) trong `3 Giây` liên tục. Ở trạng thái này sát thương nhận vào x1.5. Chết nếu trượt.

## 8. NHỊP TRẬN CHIẾN LƯỢC TỔNG (GAME FLOW)
- **Sống sót là chân lý (0 - 30s)**: Né đánh thả diều bằng Wave (`L`) và Dash. Dừng lại vài nhịp gập người lết đất (`S`) để Sạc Sét. Tuyệt đối không Spam chuỗi J để lộ sơ hở vì dễ vỡ Block.
- **Tiên phát Cấu Rỉa**: Lạm dụng sự uy hiếp của Iaijutsu (Crouch chộp nhanh) bắt bài hụt của đối phương.
- **Kết Liễu**: Một khi tụ đủ 100 Điện Tích -> Sạc Thần Tốc. Nếu địch đứng dưới <30% máu là coi như đứt. Đánh Lén, Shock Dame, Chớp Nhoáng.
