# 🔴 CASE STUDY: Bug "Vòng Tròn Đen" Trong Ultimate VFX
> **Dự án:** Hơi Thở Kiếm Sĩ - Demon Slayer Fighting Game  
> **File liên quan:** `js/effects_v3.js`, `js/game_v3.js`, `js/characters_v3.js`  
> **Thời gian mất:** **1 ngày làm việc** (toàn bộ ngày 11/04/2026)  
> **Trạng thái:** ✅ ĐÃ GIẢI QUYẾT

---

## 🎯 Mô Tả Triệu Chứng

### Bug #1 — Phím Q (Ultimate)
Khi nhân vật sử dụng chiêu Ultimate (phím Q) và **dash trúng đối thủ**, một **hình tròn đen đặc lớn** (~300px diameter) xuất hiện tại điểm va chạm, to dần ra rồi biến mất.

### Bug #2 — Phím B (Block Shield)
Khi nhân vật giữ phím Block (B), thay vì hiện lá chắn xanh lam đẹp mắt, **cùng hình tròn đen đó** xuất hiện bao quanh nhân vật liên tục trong suốt thời gian block.

Cả hai bug đều:
- Che khuất nhân vật và background phía sau
- Xuất hiện trên **mọi trình duyệt** (Safari, Chrome, Cốc Cốc) trên Mac
- Không liên quan đến file PNG nào — đây là vật thể được **vẽ trực tiếp bằng code**

**Ảnh minh chứng:** Vòng tròn đen khổng lồ bao quanh nhân vật Inosuke khi ulti trúng Zenitsu.

---

## 🕵️ Hành Trình Điều Tra (Sai Lầm Liên Tiếp — Học Từ Đây!)

### ❌ Giả Thuyết Sai #1: Do file PNG có nền đen
**Lý luận sai:** "Ảnh impact PNG có nền đen, khi render lên Canvas nó hiện ra màu đen."  
**Hành động sai:** Đổi `globalCompositeOperation` từ `screen` → `source-over` → `lighter`.  
**Kết quả:** Không có tác dụng. Vòng tròn vẫn xuất hiện vì **vấn đề không phải ở file PNG**.

### ❌ Giả Thuyết Sai #2: Do `ctx.shadowBlur` của Safari
**Lý luận sai:** "Safari có bug với `shadowBlur`, tạo ra bóng đen xung quanh canvas element."  
**Hành động sai:** Thêm `ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;` trước khi `drawImage`.  
**Kết quả:** Không có tác dụng. Shadow của `drawImage` không phải thủ phạm.

### ❌ Giả Thuyết Sai #3: Do `Math.PI * 2` gây bug Webkit closed-path
**Lý luận sai:** "Webkit có bug khi arc từ 0 đến 2PI tạo ra filled circle."  
**Hành động sai:** Đổi tất cả `Math.PI * 2` → `Math.PI * 1.99`.  
**Kết quả:** Không có tác dụng cho vòng tròn đặc (chỉ đúng cho arc stroke, không phải thủ phạm chính).

### ❌ Giả Thuyết Sai #4: Do cache trình duyệt
**Lý luận sai:** "Code đã fix nhưng browser cache cũ."  
**Hành động sai:** Thêm `?v=4` vào script tags, yêu cầu user hard reload.  
**Kết quả:** Không có tác dụng vì code fix chưa đúng.

### ❌ Giả Thuyết Sai #5: Do pixel preload scrubber
**Lý luận sai:** "Cần scrub từng pixel của PNG lúc load game để xóa màu đen."  
**Hành động sai:** Viết pixel-scanning loop trong `Images.load()` để set alpha=0 cho mọi pixel đen.  
**Kết quả:** Không có tác dụng vì PNG không có vấn đề gì cả.

---

## ✅ NGUYÊN NHÂN GỐC RỄ THỰC SỰ

### 🔍 Root Cause: **Canvas Context Shadow State Leak vào Arc Drawing**

**Vị trí bug:** `effects_v3.js` — hàm `ultimateParticles()` + vòng lặp render particles

```javascript
// GAME_V3.JS — Khi ulti hit:
Effects.ultimateParticles(target.centerX, target.centerY,
  attacker.charData.projectileColor, attacker.charData.swordGlow, 50);
```

```javascript
// EFFECTS_V3.JS — ultimateParticles() tạo ring particles:
function ultimateParticles(x, y, color, glow, count = 30) {
  // spark particles...
  for (let i = 0; i < 5; i++) {
    // ⚠️ THỦ PHẠM: ring particles với size lớn
    createParticle(x, y, glow, { type: 'ring', size: 20 + i * 15, decay: 0.04, speed: 0, gravity: 0 });
  }
}
```

```javascript
// EFFECTS_V3.JS — Vòng lặp draw particles:
for (const p of particles) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, p.alpha);

  if (p.type === 'ring') {
    ctx.strokeStyle = p.glow;
    ctx.shadowColor = 'transparent';  // ← Không đủ! Phải dùng rgba(0,0,0,0)
    ctx.shadowBlur = 0;               // ← Không reset shadowOffset!
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (1.5 - p.life), 0, Math.PI * 1.99);
    ctx.stroke();
  } else if (p.type === 'spark') {
    ctx.shadowColor = p.glow;
    ctx.shadowBlur = 8;               // ← LEAK NÀY! Nếu spark vẽ trước ring trong cùng frame
    // ...
  }
}
```

### 🔬 Giải Thích Cơ Chế Bug

Trong **mỗi frame render**, các particles được lặp và vẽ theo thứ tự. Khi một `spark` particle được vẽ:
```javascript
ctx.shadowColor = '#ffee44';  // glow màu vàng/cam
ctx.shadowBlur = 8;
```

Vì mỗi particle dùng `ctx.save()` / `ctx.restore()` **riêng lẻ cho từng particle**, nhưng **`ctx.save()`/`ctx.restore()` của Canvas API chỉ lưu/khôi phục một số properties nhất định**. Trên các triển khai Webkit (Safari, WebKit-based), `shadowBlur` và đặc biệt là `shadowOffset` đôi khi **không được restore hoàn toàn** giữa các calls trong cùng một animation frame, đặc biệt khi GPU batching xảy ra.

Kết quả: Khi `ring` particle bắt đầu vẽ với `ctx.arc()`:
- `shadowBlur` vẫn còn giá trị > 0 từ spark trước đó
- Canvas fill shadow của arc = màu đen (default shadow color sau khi ctx.save không clean)
- Shadow region CỦA ARC = phần bên trong hình tròn
- **→ Hình tròn đen đặc xuất hiện!**

Với 5 ring particles có `size: 20, 35, 50, 65, 80` pixels, chúng overlap nhau tạo thành **một đĩa đen đặc lớn** rõ ràng trên màn hình.

---

## 🛠️ SOLUTION ĐÚNG ĐẮN

### Fix 1: Loại bỏ `ring` particles khỏi `ultimateParticles()`

```javascript
// ❌ TRƯỚC (gây bug):
function ultimateParticles(x, y, color, glow, count = 30) {
  // sparks...
  for (let i = 0; i < 5; i++) {
    createParticle(x, y, glow, { type: 'ring', size: 20 + i * 15, decay: 0.04, speed: 0, gravity: 0 });
  }
}

// ✅ SAU (đã fix):
function ultimateParticles(x, y, color, glow, count = 30) {
  // sparks...
  // Dùng ENERGY thay RING — energy dùng ctx.fill() không bị shadow leak
  for (let i = 0; i < 12; i++) {
    createParticle(x, y, glow, {
      angle: (i / 12) * Math.PI * 2,
      speed: 3 + Math.random() * 5,
      size: 4 + Math.random() * 5,
      decay: 0.025 + Math.random() * 0.02,
      gravity: 0.03,
      type: 'energy'  // ← ENERGY particle không dùng arc+stroke, không bị leak
    });
  }
}
```

### Fix 2: Reset HOÀN TOÀN shadow state trước khi vẽ bất kỳ `ring` nào

```javascript
// ❌ TRƯỚC (chưa đủ):
if (p.type === 'ring') {
  ctx.shadowColor = 'transparent';  // 'transparent' không đủ tin cậy
  ctx.shadowBlur = 0;
  // shadowOffsetX, shadowOffsetY chưa được reset!
  ctx.strokeStyle = p.glow;
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 1.99);
  ctx.stroke();
}

// ✅ SAU (fix hoàn toàn):
if (p.type === 'ring') {
  // Reset MỌI thuộc tính shadow về zero trước arc
  ctx.shadowColor = 'rgba(0,0,0,0)';  // rgba rõ ràng hơn 'transparent'
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;              // ← THIẾU CÁI NÀY LÀ BUG
  ctx.shadowOffsetY = 0;              // ← THIẾU CÁI NÀY LÀ BUG
  ctx.strokeStyle = p.glow;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 1.99);
  ctx.stroke();
}
```

### Fix 3: Đặt lại `source-over` cho sprite impact rendering

```javascript
// Sau khi PNG đã được black-pixel scrubbed trong preload, 
// dùng source-over là an toàn nhất.
ctx.globalCompositeOperation = 'source-over';
```

---

## 📐 NGUYÊN TẮC BẮT BUỘC CHO CANVAS VFX (Rút Ra Từ Bug Này)

### 🚨 RULE #1: KHÔNG BAO GIỜ tin tưởng Canvas context state giữa các draw calls

```javascript
// ❌ SAI — Assume context sạch sau ctx.save/restore
ctx.save();
ctx.shadowBlur = 15;
drawSomething();
ctx.restore();
drawArc(); // ← KHÔNG AN TOÀN! Webkit có thể leak shadow state

// ✅ ĐÚNG — Reset MÌNH CHỦ ĐỘNG trước draw nhạy cảm
ctx.shadowColor = 'rgba(0,0,0,0)';
ctx.shadowBlur = 0;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;
drawArc(); // ← AN TOÀN
```

### 🚨 RULE #2: KHÔNG kết hợp `ctx.arc()` + `ctx.stroke()` với bất kỳ `shadowBlur > 0` nào

Safari/WebKit sẽ **fill shadow vào phần bên trong arc** khi `shadowBlur > 0`, tạo ra hình tròn đặc màu shadow (thường là đen).

```javascript
// ❌ NGUY HIỂM
ctx.shadowBlur = 10;
ctx.beginPath();
ctx.arc(x, y, r, 0, Math.PI * 2);
ctx.stroke(); // ← Webkit có thể fill đen bên trong!

// ✅ AN TOÀN
ctx.shadowBlur = 0; // Reset trước
ctx.beginPath();
ctx.arc(x, y, r, 0, Math.PI * 1.99); // Dùng 1.99 thay 2
ctx.stroke();
```

### 🚨 RULE #3: Dùng kiểu particle khác nhau cho mục đích khác nhau

| Loại Particle | Dùng Cho | Lệnh Vẽ | Nguy Hiểm với Shadow? |
|---|---|---|---|
| `spark` | Tia lửa, vệt sáng | `ctx.ellipse()` + `fill()` | Thấp |
| `energy` | Orbs năng lượng | `ctx.arc()` + `fill()` | Thấp |
| `ring` | Vòng tròn mở rộng | `ctx.arc()` + **`stroke()`** | **CAO — Reset shadow trước!** |

### 🚨 RULE #4: Thứ tự fix khi thấy "hình đen bí ẩn" trên Canvas

1. **Trước tiên:** Tắt tất cả shadow (`shadowBlur = 0`) trước mọi `ctx.arc()` + `ctx.stroke()`
2. **Thứ hai:** Kiểm tra particle loop — có particle nào dùng `ring` type gần `spark` type không?
3. **Thứ ba:** Kiểm tra `globalCompositeOperation` — dùng `source-over` cho PNG transparent
4. **Cuối cùng:** Mới kiểm tra file PNG có nền đen không

### 🚨 RULE #5: Không bao giờ dùng `'transparent'` cho shadowColor reset

```javascript
// ❌ Không đáng tin với một số triển khai Canvas:
ctx.shadowColor = 'transparent';

// ✅ Dùng rgba explicit:
ctx.shadowColor = 'rgba(0,0,0,0)';
```

---

## 📁 Files Đã Thay Đổi

| File | Dòng thay đổi | Nội dung thay đổi |
|---|---|---|
| `js/effects_v3.js` | L45-58 | `ultimateParticles()`: Xóa ring particles, thêm energy particles |
| `js/effects_v3.js` | L127-136 | Ring draw: Reset `shadowOffsetX/Y = 0` trước khi stroke |
| `js/effects_v3.js` | L170-172 | SpriteImpact: Đổi `lighter` → `source-over` |
| `js/effects_v3.js` | L676-678 | CinematicOverlay: Đổi `screen` → `lighter` |
| `js/game_v3.js` | L493-495 | Aura draw: Đổi về `source-over` |
| `js/characters_v3.js` | L199-208 | `Images.load()`: Thêm pixel scrubber cho VFX PNGs |
| `index.html` | L228-234 | Thêm `?v=4` cache-busting |

---

## ➕ Bug Bổ Sung: Block Shield (Phím B) — Cùng Pattern

**Vị trí:** `game_v3.js` — hàm `_drawBlockShield()`

```javascript
// ❌ CODE GÂY BUG (ban đầu):
_drawBlockShield(ctx) {
  ctx.fillStyle = radialGradient;
  ctx.shadowColor = '#aaccff';
  ctx.shadowBlur = 20;         // ← shadowBlur SET TRƯỚC arc!
  ctx.beginPath();
  ctx.arc(cx, cy, 50, 0, Math.PI * 1.99);
  ctx.fill();                  // ← Webkit fill đen bên trong!
}

// ✅ CODE ĐÃ FIX:
_drawBlockShield(ctx) {
  // Lớp 1: Outer glow — dùng radial gradient to→transparent (KHÔNG shadowBlur)
  ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = outerRadialGradient; // gradient tự tạo glow effect
  ctx.arc(cx, cy, 75, 0, Math.PI * 1.99);
  ctx.fill();

  // Lớp 2: Inner disc — cùng pattern, không shadow
  ctx.fillStyle = innerRadialGradient;
  ctx.arc(cx, cy, 50, 0, Math.PI * 1.99);
  ctx.fill();
}
```

**Bài học từ bug này:** Radial gradient từ solid → transparent **đã tự nhiên tạo ra hiệu ứng glow đẹp hơn** mà không cần `shadowBlur` — gradient thực chất TỐTƠN shadow trong trường hợp này!

---

## ⏱️ Timeline Bug Fix (Thiệt Hại Về Thời Gian)

| Thời điểm | Hành động | Kết quả |
|---|---|---|
| Sáng 11/04 | Bắt đầu điều tra | — |
| ~10:00 | Giả thuyết #1: PNG có nền đen | ❌ Sai |
| ~11:00 | Giả thuyết #2: Safari shadowBlur bug | ❌ Sai |
| ~12:00 | Giả thuyết #3: Math.PI * 2 bug | ❌ Sai |
| ~14:00 | Giả thuyết #4: Cache browser | ❌ Sai |
| ~16:00 | Giả thuyết #5: Pixel scrubber | ❌ Sai |
| ~19:50 | Nhìn kỹ ảnh: "Đây là vật thể code vẽ, không phải PNG!" | 🔍 Đúng hướng |
| ~19:55 | Trace `ultimateParticles()` → `ring` particles | ✅ TÌM RA |
| ~19:58 | Apply fix, commit | ✅ XONG |

**Tổng thời gian mất:** ~10 tiếng  
**Thời gian fix thực tế (sau khi tìm đúng):** < 5 phút

---

## 💡 Bài Học Rút Ra

> **"Khi thấy một hình tròn đen lớn xuất hiện rồi biến mất trong game Canvas, câu hỏi đầu tiên KHÔNG PHẢI là 'File PNG nào có vấn đề?' mà phải là 'Code nào đang gọi ctx.arc() + ctx.stroke() với shadowBlur > 0?'"**

1. **Đọc ảnh trước, code sau.** Hình tròn ĐẶC hoàn hảo không thể sinh ra từ file PNG transparent — nó phải là vật thể được vẽ trực tiếp bởi code.
2. **Canvas context state là global trong một frame.** `ctx.save()`/`ctx.restore()` không đảm bảo 100% isolation, đặc biệt trên WebKit.
3. **Particle system tích lũy state.** Khi nhiều particle types khác nhau vẽ trong cùng một frame, states rất dễ leak sang nhau.
4. **`ring` là particle type nguy hiểm nhất.** Nó dùng `stroke()` — thay vì `fill()`. Stroke với shadow tạo ra filled shape bên trong arc trên Webkit.
5. **Giảm debug bằng cách tạm thời tắt từng system một.** Set `count = 0` cho ultimateParticles để xem hình tròn đen còn không, nếu mất → culprit chính là ở đây.

---

*Được ghi lại vào ngày 11/04/2026 bởi Lam Phạm - BabyBlue*  
*"Mất 1 ngày để học được bài học đáng giá nhất về Canvas VFX."*
