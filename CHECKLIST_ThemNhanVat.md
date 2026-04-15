# 🗡️ Checklist Thêm Nhân Vật Mới — Hơi Thở Kiếm Sĩ

> **Tổng số file cần tạo:** 22 file PNG + 1 block code  
> **Tổng thời gian ước tính (AI-assisted):** ~3–5 giờ  
> Mỗi PNG: `1024×1024 px`, nền trong suốt (transparent background), định dạng RGBA PNG-32

---

## 📁 FOLDER 1: `assets/sprites/` — 14 file PNG (Sprite Nhân Vật)

Tất cả sprite phải có **nền trong suốt hoàn toàn** (PNG-32, alpha channel).  
Đặt tên theo `{id}` là ID nhân vật (lowercase, không dấu). Ví dụ: `rengoku`, `akaza`, `muzan`...

| # | Tên File | Pose / Mô Tả | Ghi Chú |
|---|----------|--------------|---------|
| 1 | `{id}_idle.png` | Đứng yên, tư thế nghỉ | Tư thế cơ bản, dùng nhiều nhất |
| 2 | `{id}_idle_attack.png` | Đứng + chém kiếm | Tư thế tấn công từ đứng |
| 3 | `{id}_jump.png` | Nhảy lên (trên không) | Chân co lên, người nghiêng nhẹ |
| 4 | `{id}_jump_attack.png` | Nhảy + chém trên không | |
| 5 | `{id}_crouch.png` | Cúi người / ngồi thấp | Cơ thể thấp hơn bình thường |
| 6 | `{id}_crouch_attack.png` | Cúi + chém từ thấp | |
| 7 | `{id}_run1.png` | Chạy — khung 1 (chân trái trước) | Cặp run1/run2 tạo animation chạy |
| 8 | `{id}_run2.png` | Chạy — khung 2 (chân phải trước) | |
| 9 | `{id}_kick.png` | Đá từ đứng | |
| 10 | `{id}_jump_kick.png` | Đá trên không | |
| 11 | `{id}_crouch_kick.png` | Đá từ tư thế cúi | |
| 12 | `{id}_ultimate.png` | Tư thế tập khí / kích hoạt Ultimate | Pose đẹp, hoành tráng |
| 13 | `{id}_ultimate_dash.png` | Tư thế lao vào khi Ulti | Người lao nhanh về phía trước |
| 14 | `vfx_{id}.png` | VFX slash — quét ngang khi chém kiếm | Không phải sprite người, là hiệu ứng |

---

## 📁 FOLDER 2: `assets/effects/` — 7 file PNG (Effects Chiến Đấu)

Các ảnh này được xử lý qua pixel-scrubber lúc load → **có thể có nền đen, vẫn OK**.  
Kích thước: `1024×1024 px` (hoặc bất kỳ, nhưng nên vuông).

| # | Tên File | Dùng Khi Nào | Ghi Chú |
|---|----------|--------------|---------|
| 15 | `hit_{id}_sword_v3.png` | Hiệu ứng xuất hiện khi đòn chém TRÚNG | |
| 16 | `hit_{id}_kick_v3.png` | Hiệu ứng khi đòn đá TRÚNG | |
| 17 | `hit_{id}_proj_v3.png` | Hiệu ứng khi sóng kiếm (projectile) TRÚNG | |
| 18 | `hit_{id}_block_v3.png` | **Hiệu ứng lá chắn** — hiện khi giữ B (Block) | ⚠️ Kép đôi: vừa là shield VFX, vừa là hit-block effect |
| 19 | `{id}_aura_v3.png` | Aura bao quanh người khi Ultimate Dash | Glow/hào quang năng lượng to |
| 20 | `{id}_impact_v3.png` | Vụ nổ tại điểm va chạm khi Ulti trúng | Hiệu ứng bùng nổ lớn tại đích |
| 21 | `vfx_kick_{id}_v3.png` | VFX đặc biệt khi đá (khác vfx_kick sprite) | Hiệu ứng năng lượng khi chân đạp |
| 22 | **`proj_{id}.png`** | **Sóng kiếm bắn ra khi nhấn L** | Nền đen, dạng tia bắn thẳng ngang. Game tự xóa nền đen qua `screen` blend. |

> ⚠️ **NOTE STYLE SÓNG KIẾM (`proj_{id}.png`):**
> - Dạng: **1 tia năng lượng mỏng, bắn thẳng ngang (horizontal)**
> - Như Zenitsu (tia sét vàng) nhưng đổi màu/chất liệu theo nhân vật
> - **KHÔNG** vẽ hình rồng, hình người, quá phức tạp — chỉ là 1 tia gọn
> - Nền đen OK — game dùng `globalCompositeOperation = 'screen'` để tự xóa nền đen

---

## 📁 FOLDER 3: `assets/ultimates/` — 1 file PNG (Màn Hình Ulti)

| # | Tên File | Dùng Khi Nào | Ghi Chú |
|---|----------|--------------|---------|
| 22 | `{id}.png` | Hiển thị toàn màn hình trong Cinematic Ultimate | Ảnh lớn, hoành tráng, blend mode `screen/lighter` |

---

## 💻 CODE — 2 chỗ cần thay đổi

### Chỗ 1: `js/characters_v3.js` — Thêm data nhân vật

Thêm entry mới vào object `CHARACTERS`:

```javascript
CHARACTERS['{id}'] = {
  id: '{id}',
  name: 'Tên hiển thị ngắn',
  displayName: 'Họ Tên Đầy Đủ',
  ultimateName: 'Tên Tuyệt Chiêu Tiếng Việt',

  // ── SPRITES ────────────────────────────────────────────────
  sprites: {
    idle:           'assets/sprites/{id}_idle.png',
    idle_attack:    'assets/sprites/{id}_idle_attack.png',
    jump:           'assets/sprites/{id}_jump.png',
    jump_attack:    'assets/sprites/{id}_jump_attack.png',
    crouch:         'assets/sprites/{id}_crouch.png',
    crouch_attack:  'assets/sprites/{id}_crouch_attack.png',
    run1:           'assets/sprites/{id}_run1.png',
    run2:           'assets/sprites/{id}_run2.png',
    kick:           'assets/sprites/{id}_kick.png',
    jump_kick:      'assets/sprites/{id}_jump_kick.png',
    crouch_kick:    'assets/sprites/{id}_crouch_kick.png',
    ultimate_pose:  'assets/sprites/{id}_ultimate.png',
    ultimate_dash:  'assets/sprites/{id}_ultimate_dash.png',
  },

  // ── HIT EFFECTS ────────────────────────────────────────────
  impacts: {
    sword: 'assets/effects/hit_{id}_sword_v3.png',
    kick:  'assets/effects/hit_{id}_kick_v3.png',
    proj:  'assets/effects/hit_{id}_proj_v3.png',
    block: 'assets/effects/hit_{id}_block_v3.png',
  },

  // ── CARD / SELECT ──────────────────────────────────────────
  spriteUrl:    'assets/sprites/{id}_idle.png',
  ultimateUrl:  'assets/ultimates/{id}.png',
  vfxKick:      'assets/effects/vfx_kick_{id}_v3.png',

  // ── MÀU SẮC ────────────────────────────────────────────────
  swordColor:       '#xxxxxx',  // màu thân kiếm (tối)
  swordGlow:        '#xxxxxx',  // màu phát sáng kiếm (sáng)
  auraColor:        'rgba(r, g, b, 0.4)', // màu aura quanh người
  projectileColor:  '#xxxxxx',  // màu sóng kiếm
  projectileGlow:   '#xxxxxx',  // glow sóng kiếm
  selectColor:      '#xxxxxx',  // màu highlight trong char select

  // ── CHỈ SỐ CHIẾN ĐẤU ──────────────────────────────────────
  speed:            5,       // tốc độ di chuyển (4–7)
  jumpForce:        -16,     // lực nhảy (âm = lên cao, -14 đến -18)
  maxHp:            1000,    // HP tối đa
  attackDamage:     6,       // sát thương chém kiếm (4–8)
  kickDamage:       5,       // sát thương đá (4–7)
  projectileDamage: 10,      // sát thương sóng (8–14)
  ultimateDamage:   40,      // sát thương ulti (35–50)

  // ── THÔNG TIN HIỂN THỊ ────────────────────────────────────
  description: 'Mô tả ngắn về nhân vật và phong cách chiến đấu',
  swordLength:  120,   // độ dài kiếm ảnh hưởng hitbox (100–140)
  swordPivotX:  20,    // điểm xoay kiếm X
  swordPivotY: -10,    // điểm xoay kiếm Y
};
```

Sau đó thêm `'{id}'` vào mảng `CHARACTER_ORDER`:
```javascript
const CHARACTER_ORDER = ['tanjiro', 'nezuko', 'zenitsu', 'inosuke', '{id}'];
//                                                                   ^^^^^^^^ thêm vào đây
```

---

### Chỗ 2: `js/effects_v3.js` — Thêm Swing Trail & Projectile Style

Nhân vật mới cần có hiệu ứng đao phong và sóng kiếm riêng. Tìm 2 switch-case và thêm vào:

```javascript
// Hàm swingTrail() — hiệu ứng quét đao
switch (charId) {
  case 'tanjiro': _waterTrail(...);     break;
  case 'nezuko':  _flameTrail(...);     break;
  case 'zenitsu': _lightningTrail(...); break;
  case 'inosuke': _beastTrail(...);     break;
  case '{id}': _yourNewTrail(...);      break; // ← THÊM VÀO ĐÂY
  default: /* generic trail */
}

// Hàm drawProjectile() — kiểu sóng kiếm bay
switch (charId) {
  case 'tanjiro': _waterProjectile(...);     break;
  case 'nezuko':  _flameProjectile(...);     break;
  case 'zenitsu': _lightningProjectile(...); break;
  case 'inosuke': _windProjectile(...);      break;
  case '{id}': _yourNewProjectile(...);      break; // ← THÊM VÀO ĐÂY
  default: /* generic projectile */
}
```

> 💡 Nếu chưa muốn tạo trail/projectile riêng, **bỏ qua bước này** — `default` case sẽ tự dùng hiệu ứng generic khá ổn.

---

## 📊 Tổng Hợp Nhanh

| Hạng Mục | Số Lượng | Thư Mục |
|---|---|---|
| Sprite nhân vật (poses) | 13 file | `assets/sprites/` |
| VFX slash (hiệu ứng chém) | 1 file | `assets/sprites/` |
| Hit effects (4 loại) | 4 file | `assets/effects/` |
| Aura (Ultimate dash) | 1 file | `assets/effects/` |
| Impact (Ultimate hit) | 1 file | `assets/effects/` |
| VFX kick | 1 file | `assets/effects/` |
| Ultimate cinematic | 1 file | `assets/ultimates/` |
| **Tổng PNG** | **22 file** | |
| Code characters_v3.js | +1 entry | — |
| Code effects_v3.js | +2 case lines | — (tùy chọn) |

---

## ⚡ Thứ Tự Làm Việc Đề Xuất

```
1. Tạo {id}_idle.png → test trong game trước
2. Tạo 12 pose còn lại của sprites/
3. Tạo 4 hit effects (sword, kick, proj, block)
4. Tạo aura + impact cho Ultimate
5. Tạo vfx_kick + vfx_slash
6. Tạo ultimate cinematic
7. Thêm entry vào characters_v3.js
8. Test toàn bộ trong game
9. (Tùy chọn) Thêm trail/projectile style riêng vào effects_v3.js
```

---

## ⚠️ Lưu Ý Quan Trọng

- **Tên file phải khớp chính xác** với `id` trong `CHARACTERS` object (case-sensitive)
- **PNG nền đen vẫn OK** cho effects/ và ultimates/ — pixel scrubber sẽ xử lý tự động
- **Sprites/** bắt buộc phải transparent (xóa background sạch)
- **Kích thước khuyến nghị:** `1024×1024` cho effects, `512×1024` hoặc tương tự cho sprites
- **Không cần sửa** `game_v3.js`, `ai.js`, `main.js` — hệ thống đã dynamic theo charId
- **Sau mỗi lần thêm char:** Bump version `?v=N` trong `index.html` để clear cache

---

*Tài liệu tổng hợp từ codebase Hơi Thở Kiếm Sĩ — 11/04/2026*
