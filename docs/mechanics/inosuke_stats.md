# HASHIBIRA INOSUKE — COMBAT MECHANICS & STATS
> Song Đao Dã Thú | Hơi Thở Của Dã Thú

## TỔNG QUAN NHÂN VẬT LÚC CHỌN (CHARACTER SELECT UI)
- **Tag (Phân loại chiến đấu)**: `Dã Thú Hung Hãn`, `Áp Sát Liên Tục`, `Bùng Phát Sát Thương`, `High Risk – High Reward`
- **Chỉ số Sức Mạnh Đánh Giá (Hệ Cơ Bản)**:
  - Tấn công (Attack):  `⭐⭐⭐⭐ (4/5)`
  - Phòng thủ (Defense): `⭐⭐ (2/5)`
  - Tốc độ (Speed):     `⭐⭐⭐⭐ (4/5)`
  - Linh hoạt (Agility): `⭐⭐⭐⭐⭐ (5/5)`
  - Độ khó (Difficulty): `⭐⭐⭐⭐ (4/5)`

---

## 1. DI CHUYỂN (MOVEMENT) & CHỈ SỐ CƠ BẢN

| Chỉ số              | Giá trị            | Ghi chú                                      |
|---------------------|--------------------|----------------------------------------------|
| HP Tối đa           | `4500`             | Giữa Tanjiro (5000) và Zenitsu (4200)        |
| Tốc độ cơ bản (A/D) | `4.8 units/s`      | Nhanh hơn Tanjiro, chậm hơn Zenitsu          |
| Không có Cường hoá (U) | —              | Không có trạng thái U. U là Ulti-0           |
| Độ cao nhảy (W)     | `3.4 units`        | **Cao nhất** roster — leo trèo dã thú        |
| Thời gian trên không | `~1.0s`           | **Lâu nhất** roster; có thể attack trên không (J/K) |
| Cúi người (S)       | Giảm hitbox ~30%   | Tốc độ lết: `3.0 units/s` (**nhanh nhất** dàn) |

- **Đặc trưng năng lượng**: Inosuke hồi `10 energy/s` khi **đang di chuyển** (chạy, nhảy). Ngừng hồi khi đứng hoàn toàn yên.
  - ↔ Ngược chiều hoàn toàn với Zenitsu (hồi khi đứng yên) và Tanjiro (hồi khi không spam).

---

## 2. PHÂN LOẠI ĐÒN ĐÁNH

| Kiểu          | Nút  | Range             | Ghi chú                                               |
|---------------|------|-------------------|-------------------------------------------------------|
| 🔴 Cận chiến  | J1, J2, K | `1.2 – 2.0 units` | Song đao → mỗi đòn J đều đánh 2 lần liên tiếp       |
| 🔵 Tầm trung  | L    | `4.0 – 6.5 units` | Ném vòng cung, hitbox `~1.2 units` (rộng nhất dàn)   |
| 🟣 Phòng thủ  | B    | –                 | Block 65% + Counter phản                             |

> **Đặc trưng song đao**: Mọi đòn J1 và J2 đều đánh **2 lần liên tiếp** (dao phải + dao trái). Damage ghi là tổng cộng cả 2 lần.

---

## 3. ATTACK CHI TIẾT

### ⚔️ J — SONG ĐAO BỔ CHÉO

**J1 — Tap nhanh** (`inosuke_idle_attack`)
- Damage: `50` (25+25, hai nhát song đao)
- Cooldown: `0.40s`
- Startup: `0.20s`
- Recovery: `0.25s`
- Hitbox: `140° phía trước`, dài `1.5 units`
- Lối đánh: Hai nhát liên tiếp. Hitbox rộng nhờ vung chéo hai lưỡi. Spam tốt; cooldown nhỉnh hơn Zenitsu.

**J2 — Giữ 0.3s** (`inosuke_heavy_attack`)
- Damage: `85` (40+45, hai nhát song đao)
- Cooldown: `0.72s`
- Startup: `0.38s`
- Recovery: `0.40s`
- Hitbox: `160°`, dài `2.0 units` (**Rộng nhất** roster)
- Hiệu ứng: **Bleed (Chảy Máu)** `8 dmg/s × 3s = 24 dmg` phụ trội
- Không gây knockback nặng như Tanjiro — giữ địch trong vùng cận chiến.

---

### 🐗 K — HÚC ĐẦU / ĐẠP LĂN

**K đứng — Húc Đầu** (`inosuke_headbutt`)
- Damage: `52`
- Cooldown: `0.55s`
- Startup: `0.22s`
- Recovery: `0.30s`
- Hiệu ứng: **Stagger 0.3s** (gián đoạn animation địch)
- Không knockback xa — giữ địch trong tầm cận chiến.

**S + K — Đạp Lăn** (`inosuke_roll_kick`)
- Damage: `38`
- Cooldown: `0.50s`
- Hitbox: **360° tròn xung quanh** (duy nhất trong roster)
- Hiệu ứng: **Pushback** đẩy địch ra `~1.5 units`
- Hữu dụng khi bị vây nhiều hướng.

---

### 🗡️ L — PHÓNG KIẾM VÒNG CUNG (`inosuke_projectile`)
- Damage: `60`
- Cooldown: `0.85s`
- Startup: `0.32s`
- Projectile speed: `9 units/s` (bay chậm hơn Zenitsu nhưng hitbox rộng hơn nhiều)
- Range: `~6.5 units`
- Hitbox: Rộng `~1.2 units` (**Rộng nhất** dàn)
- Cơ chế: Dao bay theo quỹ đạo vòng cung, **tự quay về tay** sau khi chạm hoặc hết tầm.
- **Vô hiệu trong Ulti-2** (weaponless phase — swords in flight).
- Lý tưởng để harass địch di chuyển ngang.

---

### 🛡️ B — BẢN NĂNG THÚ / PHẢN XẠ HOANG DÃ

**Block**:
- Giảm `65% damage` (yếu nhất roster — Inosuke không đứng im đỡ đòn mà né tránh).

**Counter**:
- Window: `0.18s` (hẹp hơn Tanjiro 0.20s).
- Trúng timing → Damage phản: `100 dmg` + **Bleed** `8 dmg/s × 2s`.
- Không gây stun; thay vào đó **áp sát địch ngay lập tức** sau phản đòn.

---

## 4. COMBO SYSTEM

**Combo Cốt lõi**: `J1 → J1 → K (Húc đầu) → J2 (160° + Bleed) → L (phóng kiếm theo)`

| Đòn  | Damage       |
|------|--------------|
| J1   | 50          |
| J1   | 50          |
| K    | 52          |
| J2   | 85 + 24 (Bleed) |
| L    | 60          |
| **Tổng** | **~271 dmg** (247 + 24 Bleed) |

**Flow**: Áp sát cấp tập bằng song đao → khóa địch bằng Húc Đầu (K Stagger) → bung J2 hitbox 160° kết thúc và gây Bleed → theo L để ép tầm xa nếu địch trụ được.

> Vì không có Cường Hóa, Inosuke nên dùng Ulti-0 ngay khi đủ 50 energy — không cần giữ bài quá lâu.

---

## 5. ENERGY SYSTEM (BẢN NĂNG DÃ THÚ)

- **Max**: `100 năng lượng`
- **Hồi phục**: `10 energy/s` khi **đang di chuyển** (chạy, nhảy, **không đứng yên**)
- Ngừng hồi khi đứng hoàn toàn yên — buộc phải liên tục vận động.

| Nhân vật | Cơ chế hồi energy          |
|----------|----------------------------|
| Tanjiro  | Hồi khi không spam attack  |
| Zenitsu  | Hồi khi đứng im hoàn toàn |
| Inosuke  | Hồi khi đang chuyển động   |

Cả ba cơ chế hoàn toàn khác nhau — thể hiện cá tính nhân vật.

---

## 6. ULTIMATE — HƠI THỞ CỦA DÃ THÚ

> Không có Cường Hóa (U). Thay vào đó: **U, I, O = Ulti-0, 1, 2**. Tất cả đều Lock mục tiêu 100%.

---

### ⚡ U — ULTI-0: HƠI THỞ CỦA DÃ THÚ: BỘC LIỆT MÃNH TIẾN
> `inosuke_ulti0_charge → inosuke_ulti0_attack`

- **Cost**: `-50 energy` (Thấp nhất — dùng thường xuyên)
- **Charge**: `0.4s`
- **Cơ chế**: Inosuke cúi thấp rồi bùng phát lao thẳng về phía địch, xuyên qua và **chém liên hoàn 3 lần** trong lúc lao qua. Có thể xuyên và đánh từ phía sau.
- **Damage**: `3 × 65 = 195 dmg`
- **Stun**: `0.5s`
- **Dash distance**: Toàn màn hình (gap closer)
- **Vai trò**: Gap closer — dùng khi địch bỏ chạy hoặc khi cần mở đầu áp sát từ xa. Chi phí thấp → dùng liên tục.

---

### 🌀 I — ULTI-1: HƠI THỞ CỦA DÃ THÚ: VIÊN CHUYỂN TOÀN NHA
> `inosuke_ulti1_charge → inosuke_ulti1_attack`

- **Cost**: `-75 energy`
- **Charge**: `0.5s`
- **Cơ chế**: Inosuke xoay tròn điên cuồng quanh địch như lốc xoáy — hai lưỡi dao xé liên tục **10 nhát** (5 vòng × 2 dao). Lock địch tại chỗ trong suốt animation.
- **Damage**: `10 × 48 = 480 dmg`
- **Stun**: `1.5s` (bị giữ trong lốc xoáy)
- **Bleed sau kết thúc**: `8 dmg/s × 4s = 32 dmg`
- **Tổng thực tế**: `~512 dmg`
- **Vai trò**: Punish kẻ thù sai lầm, xé máu nhanh. Tốt nhất sau `J1 → K` khi địch đang Stagger.

---

### 🗡️🗡️ O — ULTI-2: HƠI THỞ CỦA DÃ THÚ: ĐẦU LIỆT (TẤT SÁT KỸ)
> `inosuke_ulti2_charge → inosuke_ulti2_throw → inosuke_ulti2_return → inosuke_ulti2_catch → inosuke_exhaust_pose`

- **Cost**: `-100 energy`

**4 Phase**:
| Phase | Animation             | Mô tả                                                 |
|-------|-----------------------|-------------------------------------------------------|
| 1     | `ulti2_charge` (0.7s) | Inosuke gầm lên, tụ dã lực                           |
| 2     | `ulti2_throw`         | Ném cả 2 kiếm xuyên qua địch theo 2 quỹ đạo chéo   |
| 3     | `ulti2_return`        | 2 kiếm quay vòng trở lại xé địch từ phía sau         |
| 4     | `ulti2_catch`         | Inosuke chụp lại hai kiếm bằng hai tay               |

**Damage**:
| Lượt      | Tính toán       | Damage     |
|-----------|-----------------|------------|
| Lượt đi   | `2 × 140`       | `280 dmg`  |
| Lượt về   | `2 × 160`       | `320 dmg`  |
| **Tổng**  |                 | **`600 dmg`** |
| Stun lượt đi | Đảm bảo lượt về trúng | `1.0s` |
| Bleed     | `10 dmg/s × 5s` | `50 dmg`   |
| **Tổng thực tế** |          | **`~650 dmg`** |

> Đây là đòn duy nhất trong roster có **damage lượt về cao hơn lượt đi** — địch cần thoát ra trước khi hai kiếm quay về.

**⚠️ NHƯỢC ĐIỂM CHÍ MẠNG — Khoảng Trống Tay Không**:
- Trong `~1.2s` hai kiếm bay đi và trở về: `J1`, `J2` **bị vô hiệu hoá hoàn toàn** (weaponless).
- Chỉ còn `K` (Húc Đầu) và `B` (Block chỉ còn `50% reduction` thay vì `65%`).
- Nếu địch thoát stun và phản công trong giai đoạn này → **cực kỳ nguy hiểm**.
- Sau khi bắt kiếm về (`exhaust_pose`): **1.8s** không thể hành động.

---

## 7. BẢNG SO SÁNH CÂN BẰNG

| Chỉ số                  | Tanjiro             | Zenitsu              | Inosuke                |
|-------------------------|---------------------|----------------------|------------------------|
| HP                      | `5000`              | `4200`               | `4500`                 |
| Tốc độ cơ bản           | `4.2 units/s`       | `5.2 units/s`        | `4.8 units/s`          |
| Tốc độ khi buff         | `5.0` (U)           | `6.5` (U)            | Không đổi (no buff)    |
| Hồi Energy              | `8/s` khi idle      | `15/s` khi đứng yên  | `10/s` khi di chuyển   |
| Block giảm dmg          | `80%`               | `70%`                | `65%`                  |
| Counter damage          | `90 + stun 0.4s`    | `110 + tê liệt 0.6s` | `100 + Bleed 8×2s`     |
| Ulti damage cao nhất    | `940` (O)           | `1150` (O)           | `~650` (O)             |
| Exhaustion sau Ulti-2   | `1.5s`              | `3.0s`               | `1.8s`                 |
| Đặc trưng độc đáo       | Burn (lửa)          | Shock (điện)         | **Bleed (máu)**        |
| Hitbox cận chiến        | `120–140°`          | `120°`               | **140–160°** (rộng nhất) |
| Crouch speed            | `2.2 units/s`       | `2.5 units/s`        | **3.0 units/s** (nhanh nhất) |
| Air time                | `~0.9s`             | `~0.8s`              | **~1.0s** (lâu nhất)   |

---

## 8. NHỊP TRẬN CHIẾN LƯỢC TỔNG

### Giai Đoạn 1 — 0 đến 25s: Đánh Rỉa Liên Tục
- **Luôn di chuyển** để hồi energy (đứng yên = mất cơ hội sạc nộ).
- Ném kiếm `L` để harass tầm xa — hitbox vòng cung rộng dễ trúng địch dodge ngang.
- `J1 × 2` rồi rút — không dừng lại.
- Tích Ulti-0 (chỉ cần `50 energy`) sẵn để dùng ngay khi cần gap-close.

### Giai Đoạn 2 — Áp Lực Cận Chiến
- Lao vào bằng **Ulti-0** (Bộc Liệt Mãnh Tiến) để đến gần trong chớp mắt.
- Gây Stagger bằng `K` (Húc Đầu).
- Đổ **Ulti-1** (Viên Chuyển Toàn Nha) khi địch đang Stagger → xé sâu vào máu + Bleed.
- Bleed từ `J2` và Ulti-1 bào mòn máu theo thời gian — tiếp tục áp sát để duy trì.

### Giai Đoạn 3 — Kết Liễu: Đầu Liệt
- Tích đủ `100 energy` → kích **Ulti-2 (Đầu Liệt)**.
- Luôn tung khi địch đang **Stagger hoặc Stun** để đảm bảo lượt về trúng.
- Trong weaponless phase (~1.2s): chủ động `K` Húc Đầu hoặc chạy né; tuyệt đối không stand và bị punish.
- Nếu địch dưới `40% máu` + đang có Bleed → kết liễu gần như chắc chắn.

---

## 9. ANIMATION KEYS (FILE NAMING REFERENCE)

| Action                  | Animation Key                  |
|-------------------------|--------------------------------|
| Idle                    | `inosuke_idle`                 |
| Run                     | `inosuke_run1`, `inosuke_run2` |
| Crouch / Crouch Walk    | `inosuke_crouch`, `inosuke_crouch_walk1`, `inosuke_crouch_walk2` |
| Jump                    | `inosuke_jump`                 |
| J1 Attack               | `inosuke_idle_attack`          |
| J2 Heavy Attack         | `inosuke_heavy_attack`         |
| K Headbutt              | `inosuke_headbutt`             |
| S+K Roll Kick           | `inosuke_roll_kick`            |
| L Projectile            | `inosuke_projectile`           |
| Block                   | `inosuke_block`                |
| Ulti-0 Charge/Attack    | `inosuke_ulti0_charge`, `inosuke_ulti0_attack` |
| Ulti-1 Charge/Attack    | `inosuke_ulti1_charge`, `inosuke_ulti1_attack` |
| Ulti-2 Phases           | `inosuke_ulti2_charge`, `inosuke_ulti2_throw`, `inosuke_ulti2_return`, `inosuke_ulti2_catch` |
| Exhaust                 | `inosuke_exhaust_pose`         |

---

*Tham khảo: `tanjiro_stats.md`, `zenitsu_stats.md` — Phiên bản: v1.0*
