# Lesson Learnt: Cinematic Sprites & Epic Text Arts Workflow

Tài liệu này tổng hợp toàn bộ quy trình chuẩn chỉ nhất và ghi nhận lại **tất cả những sai lầm ngớ ngẩn, tốn thời gian** (Stupid Mistakes) của quá trình xây dựng hệ thống Cinematic (ảnh tung chiêu) và Text Arts (Chữ nổi tên chiêu thức) cho nhân vật. Bắt buộc đọc kĩ file này trước khi triển khai tạo Cinematic cho bất kỳ nhân vật mới nào!

---

## PHẦN 1: TỔNG HỢP NHỮNG LỖI LẦM NGU NGỐC NHẤT ĐÃ MẮC PHẢI (STUPID MISTAKES)

### 1. Ngu Ngốc 1: Đưa Background Đen vào Cinematic
- **Hành vi sai trái:** Mặc dù luật ở `Sprite_Workflow.md` đã quy định gắt gao về việc dùng nền huỳnh quang để cắt ChromaKey giữ lại tia lửa/hào quang, nhưng tôi lại nhắm mắt Generate Cinematic mốc với Background đen / gradient xám.
- **Hậu quả:** Bưng nguyên khối vuông đen (Black Artifacts) đắp lên màn hình Game, che khuất hoàn toàn chiến trường và làm hỏng toàn bộ trải nghiệm của người dùng. Trông đục ngầu và thiếu chuyên nghiệp.
- **Cách khắc phục vĩnh viễn:** Tuyệt đối dùng prompt `SOLID BRIGHT MAGENTA BACKGROUND #FF00FF` (Cấm dùng đen, trắng hay cảnh quan) cho mọi Cinematic AI!

### 2. Ngu Ngốc 2: Sinh chữ bằng AI và xài Font Rác
- **Hành vi sai trái:** Trông chờ AI vẽ dòng chữ Anime kiểu "dọc ngang vô tổ chức", vẽ luôn chữ sai chính tả tiếng Việt hoặc thiếu dấu.
- **Hậu quả:** Text rác tràn lan trên màn hình, bị vỡ, không đúng format, không đồng bộ với Engine. Xoay sang xài hàm Canvas mặc định (`ctx.fillText`) để vẽ text Arial tẻ nhạt không có sức nặng kinh hoàng của Ultimate.
- **Cách khắc phục vĩnh viễn:** Dùng Tool Python cứng (Script `tools/gen_text_epic.py`). Đánh thẳng Font chuẩn cực dày (như *Anton* hoặc *Impact*), Render hiệu ứng Gradient đa tầng (Đỏ vàng cho Lửa, Xanh trắng cho Nước), đẩy khối đùn 3D Extrude (Bevel) để kết xuất thẳng ra file PNG Transparent siêu to khổng lồ. Tuyệt đối không dùng AI vẽ chữ nữa.

### 3. Ngu Ngốc 3: Lỗi đè Layer Z-Index (Cinematic đè Nhân Vật)
- **Hành vi sai trái:** Render lớp Cinematic đè lên trước toàn bộ layer trong Game (Trên cùng của Canvas UI stack).
- **Hậu quả:** Chiêu chưa nổ nhưng nguyên cái bắp đùi nhân vật Cinematic to oạch đã che lấp toàn bộ nhân vật thực đang giao tranh (Player 1 & 2 bị che mù).
- **Cách khắc phục vĩnh viễn:** Trong ống dẫn `game_v3.js`, mảng Rendering của Cinematic Background **bắt buộc phải nằm dưới** (vẽ trước) các Token Nhân vật và Vật thể, đóng vai trò như một phông nền động (Dynamic Backdrop) cực mạnh bộc phát từ bóng tối lên.

### 4. Ngu Ngốc 4: Viết hiệu ứng VFX bị đóng băng khi Pause Game
- **Hành vi sai trái:** Viết hiệu ứng chớp loé Aura lửa khi Transform Cinematic dựa trên Frame Counter của nhân vật (Ví dụ biến `this.transformTimer += dt`).
- **Hậu quả:** Vì Game Loop đóng băng thời gian của 2 người chơi trong lúc Cinematic diễn ra, Biến timer cũng chết cứng. Lửa biến hình không chạy mà đóng băng y như cục sạn.
- **Cách khắc phục vĩnh viễn:** Các hàm Draw VFX liên quan tới không gian 4 chiều đứng thời gian (Cinematic Time Stop) phải sử dụng thuần biến tuyệt đối `Date.now() / 1000` thay vì Local Timer của nhân vật để hiệu ứng nhấp nháy, xoay vòng không bao giờ bị dừng lại.

### 5. Ngu Ngốc 5: Chữ lòi khỏi màn hình
- **Hành vi sai trái:** Vẽ Text Cinematic ra tọa độ ngẫu nhiên dội ra tận Pixel 1300 của Canvas.
- **Hậu quả:** Ngôn từ hoa mỹ "LIÊN VŨ BẤT TẬN" bị chặt làm đôi lòi ra ngoài mép MacBook của User.
- **Cách khắc phục vĩnh viễn:** Phải Code một bộ kẹp (Clamping Logic) tự bóp giới hạn tính toán theo `textWidth`: 
  `x = Math.max(margin + halfW, Math.min(canvasW - margin - halfW, x))` để bắt giam cái Text ở yên 100% tỷ lệ bên trong khung hình vẽ ranh giới an toàn.

---

## PHẦN 2: WORKFLOW CHUẨN XÂY DỰNG CINEMATIC & EPIC TEXT MỚI

Khi làm mới (Quy trình 5 Bước Thần Thánh Cấm Trượt):

### Bước 1: Render Hình Ảnh AI chuẩn Chroma Key (The Character Shot)
Dùng Prompt theo Motif quy định chặt đứt mọi suy nghĩ hoa lá cành!
**Công thức Prompt:** `Refer STRICTLY to official anime visual of [Character]. Extreme close-up or Dynamic action Freeze-frame (nhấn mạnh Pose đang múa kiếm). High contrast cinematic lighting, extremely ultra sharp, aggressive energy. NO TEXT. SOLID BRIGHT MAGENTA BACKGROUND #FF00FF.`

### Bước 2: Bóc Nền (Chroma Key Process)
Không dùng auto-crop, không tự tẩy nền. Gọi công cụ `tools/chroma_batch_b2_c.py` bằng Python. Đục thủng Background Magenta, chốt viền Đen thẳng thắn, Output giữ nguyên Canvas gốc.
*Mục lục lưu trữ:* `assets/effects/[character]_vfx/cinematic_[character]_[skillname].png`.

### Bước 3: Generate Text 3D Bằng Engine Nội Bộ (Epic Text Art)
Chạy tệp công cụ Python (chỉnh sửa tuỳ số lượng chữ).
Ví dụ Script: `python tools/gen_text_epic.py` (Khai báo text có dấn Tiếng Việt cực đầy đủ e.g. "HỎA THẦN THẦN LẠC: LIÊN VŨ BẤT TẬN").
Định hướng Gradient tuỳ vào hệ thống Hơi Thở (Ví dụ: Thủy = Cyan/Blue, Sấm = Yellow/White).
*Mục lục lưu trữ:* `assets/effects/[character]_vfx/text_[character]_[skillname].png`.

### Bước 4: Mapping vào nhân vật (`characters_v3.js`)
Ở phần cuối của object Character tương ứng, thêm Data Block về Cinematic:
```javascript
cinematics: {
  ult1: {
      image: 'assets/effects/tên_nhân_vật_vfx/cinematic_tên_chiêu_1.png',
      textImage: 'assets/effects/tên_nhân_vật_vfx/text_tên_chiêu_1.png'
  },
  ult2: { ... }
}
```

### Bước 5: Móc vào Event Fire 
Đảm bảo trong logic của Character (VD: `[character].js`), khi User phang phím Tung Chiêu Trấn Phái:
```javascript
if (keys.ult1 && ...) {
  // Triggers cinematic freeze frame
  if (typeof Effects !== 'undefined') {
    Effects.startCinematic(
      this.charData.cinematics.ult1.image, 
      this.charData.cinematics.ult1.textImage
    );
  }
}
```

Đóng gói, đập nát bộ nhớ Cache Browser (tăng `?v=X` ở `index.html`) và Test! Toàn bộ Cinematic sẽ Popup như sấm sét mà không phạm phải bất kì một sự ngu ngốc nào ở trên!
