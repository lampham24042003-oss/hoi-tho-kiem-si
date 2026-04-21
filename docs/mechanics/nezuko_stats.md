# KAMADO NEZUKO — COMBAT MECHANICS & STATS
> Huyết Quỷ Thuật | Hơi Thở Của Huyết Diệm

## TỔNG QUAN NHÂN VẬT LÚC CHỌN (CHARACTER SELECT UI)
- **Tag (Phân loại chiến đấu)**: `Huyết Diệm Bạo Liệt`, `Cước Thuật Tốc Kích`, `Suy Hao Liên Tục`, `High Risk – High Reward`
- **Chỉ số Sức Mạnh Đánh Giá (Hệ Cơ Bản)**:
  - Tấn công (Attack):  `⭐⭐⭐ (3/5)`
  - Phòng thủ (Defense): `⭐⭐⭐ (3/5)`
  - Tốc độ (Speed):     `⭐⭐⭐⭐ (4/5)`
  - Linh hoạt (Agility): `⭐⭐⭐⭐⭐ (5/5)`
  - Độ khó (Difficulty): `⭐⭐⭐⭐ (4/5)`

---

## 1. DI CHUYỂN (MOVEMENT) & CHỈ SỐ CƠ BẢN

| Chỉ số              | Giá trị            | Ghi chú                                      |
|---------------------|--------------------|----------------------------------------------|
| HP Tối đa           | `4300`             | Thấp hơn Tanjiro (5000), cao hơn Zenitsu (4200) |
| Tốc độ cơ bản (A/D) | `4.6 units/s`      | Nhanh hơn Tanjiro, chậm hơn Zenitsu          |
| Không có Cường hoá (U)| —              | Không có trạng thái U. U là Ulti-0           |
| Độ cao nhảy (W)     | `3.2 units`        | Cao — phong cách quỷ linh hoạt               |
| Thời gian trên không| `~0.95s`           | Gần bằng Inosuke; có thể attack trên không (J/K) |
| Cúi người (S)       | Giảm hitbox ~35%   | Tốc độ lết: `2.8 units/s`                    |

- **Đặc trưng năng lượng**: Nezuko hồi `12 energy/s` khi **nhận sát thương**. Càng bị đánh nhiều, năng lượng càng đầy.
  - ↔ Ngược chiều hoàn toàn với Zenitsu (hồi khi đứng yên), Tanjiro (hồi khi không spam), và Inosuke (hồi khi di chuyển).
  - Khắc họa bản năng quỷ: Nezuko mạnh hơn khi bị dồn vào góc tường, không phải khi an toàn.

---

## 2. PHÂN LOẠI ĐÒN ĐÁNH

| Kiểu          | Nút  | Range             | Ghi chú                                               |
|---------------|------|-------------------|-------------------------------------------------------|
| 🔴 Cận chiến  | J1, J2, K | `1.0 – 1.8 units` | Cước thuật không vũ khí — đá, đạp, đòn chân         |
| 🔵 Tầm trung  | L    | `3.5 – 6.0 units` | Phun huyết diệm, hitbox `~1.0 units`                |
| 🟣 Phòng thủ  | B    | –                 | Hồi máu thụ động + Counter phản                     |

> **Đặc trưng cước thuật**: Nezuko không dùng kiếm — mọi đòn cận chiến đều là chân hoặc tay không. Bù lại, tốc độ ra đòn nhanh hơn mức trung bình và gây hiệu ứng Huyết Diệm (Burn) độc đáo.

---

## 3. ATTACK CHI TIẾT

### 🦶 J — CƯỚC THUẬT HUYẾT DIỆM

**J1 — Tap nhanh** (`nezuko_idle_attack`)
- Damage: `42` (đá ngang nhanh)
- Cooldown: `0.38s`
- Startup: `0.18s`
- Recovery: `0.22s`
- Hitbox: `130° phía trước`, dài `1.4 units`
- Lối đánh: Đòn cước tốc độ, spam tốt. Tốc độ ra đòn nhanh nhất trong cận chiến của Nezuko. Đây là công cụ gây áp lực liên tục và châm Huyết Diệm từng tick nhỏ.

**J2 — Giữ 0.3s** (`nezuko_heavy_attack`)
- Damage: `72` (đá xoay vòng — đòn chân lớn)
- Cooldown: `0.68s`
- Startup: `0.36s`
- Recovery: `0.38s`
- Hitbox: `150°`, dài `1.8 units`
- Hiệu ứng: **Huyết Diệm (Burn)** `10 dmg/s × 3s = 30 dmg` phụ trội — lửa hồng bùng lên từ chỗ chân chạm địch.
- Không knockback xa — giữ địch trong tầm cận chiến để tiếp tục áp sát.

---

### 💥 K — ĐẠP XUYÊN / BẬT NHẢY ĐẠP

**K đứng — Đạp Xuyên** (`nezuko_stomp`)
- Damage: `58`
- Cooldown: `0.52s`
- Startup: `0.20s`
- Recovery: `0.28s`
- Hiệu ứng: **Stagger 0.35s** + **Huyết Diệm** `10 dmg/s × 2s = 20 dmg`
- Đặc biệt: Không knockback xa — áp địch vào chỗ. Phối hợp tốt với J2 và Ulti-1.

**W + K (trên không) — Đạp Từ Trên** (`nezuko_air_kick`)
- Damage: `65`
- Cooldown: `0.60s`
- Hitbox: Hướng xuống dưới, 90° theo chiều dọc
- Hiệu ứng: **Slam** — đẩy địch xuống sàn, Knockdown 0.4s
- Hữu dụng để mở combo từ trên không hoặc ngắt animation địch đang tấn công.

---

### 🔥 L — PHUN HUYẾT DIỆM (`nezuko_projectile`)
- Damage: `55`
- Cooldown: `0.90s`
- Startup: `0.30s`
- Projectile speed: `10 units/s`
- Range: `~6.0 units`
- Hitbox: Rộng `~1.0 units`
- Cơ chế: Nezuko thở ra quả cầu lửa hồng màu máu. Khi chạm địch, Huyết Diệm bùng cháy ngay lập tức (`10 dmg/s × 4s = 40 dmg`).
- Đặc điểm phụ: Nếu địch đang có sẵn hiệu ứng Burn từ J2 hoặc K, quả cầu L sẽ **kéo dài thời gian Burn thêm 2s** thay vì reset.
- Lý tưởng để duy trì Burn từ xa và ép địch phải phòng thủ.

---

### 🛡️ B — BẢN NĂNG QUỶ / TÁI SINH HUYẾT

**Block**:
- Giảm `70% damage`.
- Đặc biệt: Mỗi đòn bị block → **hồi lại 8 HP** cho Nezuko (tái sinh huyết quỷ).

**Counter**:
- Window: `0.19s`.
- Trúng timing → Damage phản: `85 dmg` + **Huyết Diệm** `10 dmg/s × 3s = 30 dmg` ngay lập tức.
- Không gây stun dài; thay vào đó địch bị Burn ngay — phạt kẻ tấn công bằng lửa huyết.

---

## 4. COMBO SYSTEM

**Combo Cốt lõi**: `J1 → J1 → K (Stagger + Burn) → J2 (150° + Burn) → L (kéo dài Burn)`

| Đòn  | Damage       |
|------|--------------|
| J1   | 42          |
| J1   | 42          |
| K    | 58 + 20 (Burn 2s) |
| J2   | 72 + 30 (Burn 3s) |
| L    | 55 + kéo dài Burn +2s |
| **Tổng** | **~269 dmg + ~50 Burn tổng** |

**Flow**: Spam J1 để áp sát và châm Burn nhỏ → khóa địch bằng K (Stagger) → bung J2 hitbox 150° kết thúc và bùng Burn → L để duy trì Burn ngay cả khi địch rút lui. Burn tích lũy không reset nhau — mỗi lần áp thêm đòn là mỗi lần Burn được gia hạn.

> Vì không có Cường Hóa, Nezuko nên dùng Ulti-0 ngay khi đủ 50 energy — gap closer giá rẻ, dùng thường xuyên.

---

## 5. ENERGY SYSTEM (HUYẾT QUỶ NỘI LỰC)

- **Max**: `100 năng lượng`
- **Hồi phục**: `12 energy/s` khi **nhận sát thương** (bất kể từ đòn nào của địch)
- Không hồi khi đứng yên, không hồi khi di chuyển — chỉ hồi khi bị đánh.

| Nhân vật | Cơ chế hồi energy          |
|----------|----------------------------|
| Tanjiro  | Hồi khi không spam attack  |
| Zenitsu  | Hồi khi đứng im hoàn toàn |
| Inosuke  | Hồi khi đang chuyển động   |
| Nezuko   | **Hồi khi nhận sát thương**|

Bốn cơ chế hoàn toàn khác nhau — Nezuko là nhân vật duy nhất muốn bị đánh để mạnh hơn.

---

## 6. ULTIMATE — HUYẾT QUỶ THUẬT

> Không có Cường Hóa (U). Thay vào đó: **U, I, O = Ulti-0, 1, 2**. Tất cả đều Lock mục tiêu 100%.

---

### ⚡ U — ULTI-0: CƯỚC THUẬT TĂNG CƯỜNG
> `nezuko_ulti0_charge → nezuko_ulti0_attack`

- **Cost**: `-50 energy` (Thấp nhất — dùng thường xuyên)
- **Charge**: `0.35s`
- **Cơ chế**: Nezuko thu mình rồi bùng phát lao về phía địch bằng cú đạp lao xuyên toàn màn hình — lửa huyết bao quanh chân khi lao. Có thể xuyên và đánh từ phía sau.
- **Damage**: `180 dmg`
- **Hiệu ứng**: **Huyết Diệm** `10 dmg/s × 3s = 30 dmg` + **Stun 0.45s**
- **Dash distance**: Toàn màn hình (gap closer)
- **Vai trò**: Gap closer giá rẻ — dùng khi địch bỏ chạy để lại khoảng cách, hoặc để mở đầu combo áp sát từ xa. Chi phí thấp → sử dụng liên tục không cần dè dặt.

---

### 🌸 I — ULTI-1: HUYẾT QUỶ THUẬT: BỘC HUYẾT
> `nezuko_ulti1_charge → nezuko_ulti1_attack`

- **Cost**: `-75 energy`
- **Charge**: `0.5s`
- **Cơ chế**: Nezuko bùng phát huyết diệm từ toàn thân — lửa hồng bùng nổ thành làn sóng hình cầu bao quanh cô, đẩy địch trong vùng cận chiến vào vùng cháy rực. Địch bị khóa trong vùng lửa huyết trong suốt animation 1.2s.
- **Damage**: `8 × 45 = 360 dmg` (8 tick lửa xé liên tiếp)
- **Stun**: `1.2s` (bị giữ trong cột lửa)
- **Huyết Diệm sau kết thúc**: `10 dmg/s × 5s = 50 dmg`
- **Tổng thực tế**: `~410 dmg`
- **Đặc biệt**: Trong khi thực hiện Ulti-1, Nezuko **nhận 50% damage từ mọi đòn tấn công** — bản năng quỷ bảo vệ cô khi bùng phát. Năng lượng hồi nhanh gấp đôi nếu bị đánh trong trạng thái này.
- **Vai trò**: Punish kẻ thù sai lầm và ép Burn sâu. Tốt nhất sau K khi địch đang Stagger.

---

### 🔥🩸 O — ULTI-2: HUYẾT QUỶ THUẬT: BỘC HUYẾT VIÊM ĐAO (TẤT SÁT KỸ)
> `nezuko_ulti2_charge → nezuko_ulti2_summon → nezuko_ulti2_slash → nezuko_ulti2_catch → nezuko_exhaust_pose`

- **Cost**: `-100 energy`

**4 Phase**:
| Phase | Animation             | Mô tả                                                 |
|-------|-----------------------|-------------------------------------------------------|
| 1     | `ulti2_charge` (0.8s) | Nezuko nắm chặt hai tay, máu huyết bao phủ toàn thân, đôi mắt đỏ bừng lên |
| 2     | `ulti2_summon`        | Hình bóng mờ của Tanjiro hiện ra bên cạnh, lưỡi kiếm hoá đỏ rực nhờ huyết diệm Nezuko |
| 3     | `ulti2_slash`         | Hình bóng Tanjiro lao về phía mục tiêu, chém liên hoàn 5 nhát kiếm huyết diệm |
| 4     | `ulti2_catch`         | Nezuko nhận lại năng lượng huyết, hình bóng tan biến, Nezuko ngã xuống một bên |

**Damage**:
| Lượt      | Tính toán       | Damage     |
|-----------|-----------------|------------|
| Nhát 1-3  | `3 × 110`       | `330 dmg`  |
| Nhát 4-5  | `2 × 130`       | `260 dmg`  |
| **Tổng**  |                 | **`590 dmg`** |
| Stun      | Giữ địch trong chuỗi chém | `1.8s` |
| Huyết Diệm| `10 dmg/s × 6s` | `60 dmg`   |
| **Tổng thực tế** |          | **`~650 dmg`** |

> Đây là đòn duy nhất trong roster thể hiện sức mạnh kép — Nezuko dùng máu mình để triệu hồi sức mạnh của Tanjiro. Thematic nhất trong cả dàn nhân vật.

**⚠️ NHƯỢC ĐIỂM CHÍ MẠNG — Khoảng Trống Suy Kiệt**:
- Trong `~1.4s` hình bóng Tanjiro đang lao chém: Nezuko không thể dùng `J`, `K`, hay `L`.
- Chỉ còn `B` (Block — giảm 70%).
- Nếu địch có thể thoát stun và phản công trong giai đoạn này → cực kỳ nguy hiểm.
- Sau khi hình bóng tan biến (`exhaust_pose`): **2.0s** không thể hành động.
- **Cơ chế đặc biệt sau Ulti-2**: Nezuko nhận được `+20 energy` ngay lập tức nếu địch chết trong vòng 3s sau đòn này (máu huyết hấp thụ từ mục tiêu đã ngã).

---

## 7. BẢNG SO SÁNH CÂN BẰNG

| Chỉ số                  | Tanjiro             | Zenitsu              | Inosuke                | Nezuko                 |
|-------------------------|---------------------|----------------------|------------------------|------------------------|
| HP                      | `5000`              | `4200`               | `4500`                 | `4300`                 |
| Tốc độ cơ bản           | `4.2 units/s`       | `5.2 units/s`        | `4.8 units/s`          | `4.6 units/s`          |
| Tốc độ khi buff         | `5.0` (U)           | `6.5` (U)            | Không đổi              | Không đổi              |
| Hồi Energy              | `8/s` khi idle      | `15/s` khi đứng yên  | `10/s` khi di chuyển   | **`12/s` khi nhận dmg**|
| Block giảm dmg          | `80%`               | `70%`                | `65%`                  | `70% + hồi 8 HP/hit`   |
| Counter damage          | `90 + stun 0.4s`    | `110 + tê liệt 0.6s` | `100 + Bleed 8×2s`     | `85 + Burn 10×3s`      |
| Ulti damage cao nhất    | `940` (O)           | `1150` (O)           | `~650` (O)             | `~650` (O)             |
| Exhaustion sau Ulti-2   | `1.5s`              | `3.0s`               | `1.8s`                 | `2.0s`                 |
| Đặc trưng độc đáo       | Burn (lửa)          | Shock (điện)         | Bleed (máu)            | **Burn + Huyết Diệm**  |
| Hitbox cận chiến        | `120–140°`          | `120°`               | `140–160°` (rộng nhất) | `130–150°`             |
| Crouch speed            | `2.2 units/s`       | `2.5 units/s`        | `3.0 units/s`          | `2.8 units/s`          |
| Air time                | `~0.9s`             | `~0.8s`              | `~1.0s`                | `~0.95s`               |
| Vũ khí                  | Kiếm                | Kiếm                 | Song đao               | **Không vũ khí (cước)**|

---

## 8. NHỊP TRẬN CHIẾN LƯỢC TỔNG

### Giai Đoạn 1 — Nghịch Lý: Đón Đòn Lấy Nội Lực
- Đây là điểm khác biệt cốt lõi: Nezuko hồi năng lượng khi bị đánh — đừng né đòn bừa bãi ngay từ đầu.
- Dùng B (Block + Hồi máu) để hấp thụ vài đòn nhẹ → vừa hồi HP vừa sạc Energy.
- Ném L (Huyết Diệm) liên tục để bắt đầu châm Burn từ xa.
- Khi đủ 50 energy → kích Ulti-0 gap-close ngay, không cần giữ bài.

### Giai Đoạn 2 — Áp Lực Cận Chiến + Tích Lũy Burn
- Sau Ulti-0, đang trong tầm cận chiến → spam `J1 × 2` để áp sát.
- Gây Stagger bằng `K` (Đạp Xuyên) → Burn bắt đầu tick.
- Bung `J2` (150° hitbox + Burn) kết thúc chuỗi → dùng `L` ngay để kéo dài Burn thêm 2s.
- Burn không reset nhau — mỗi lần áp thêm đòn là thêm thời gian bào mòn. Ép địch phải phòng thủ liên tục.

### Giai Đoạn 3 — Kết Liễu: Bộc Huyết Viêm Đao
- Tích đủ 100 energy (dễ hơn nếu bị đánh nhiều ở phase 1-2) → kích Ulti-2.
- Luôn tung khi địch đang Stagger hoặc Stun để đảm bảo chuỗi 5 nhát trúng đủ.
- Trong weaponless phase (~1.4s): chủ động B Block và dùng S + di chuyển để tránh đòn phản.
- Nếu địch dưới 40% máu + đang có Burn → kết liễu gần như chắc chắn.
- Nếu địch chết trong 3s sau Ulti-2 → +20 energy ngay lập tức để tiếp tục Ulti-0 trong trận tiếp theo.
