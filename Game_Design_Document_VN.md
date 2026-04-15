# Game Design Document (GDD)
# Breath of Ashes - Hơi Thở Của Tàn Tro

## 1. Thông Tin Chung (Overview)
- **Tên dự án:** Breath of Ashes
- **Thể loại:** 2D Fighting Game (Đối kháng)
- **Nền tảng:** Web Browser (HTML5 Canvas, JavaScript thuần)
- **Chủ đề:** Lấy cảm hứng trực tiếp từ thế giới anime Kimetsu no Yaiba (Demon Slayer)
- **Đồ họa:** 2D Anime Sprite, Cel-shading với hiệu ứng particle và VFX hiện đại.
- **Tiến độ hiện tại:** Core Game Loop (Chu trình chơi cốt lõi) hoàn thiện, hệ thống chiến đấu 1v1 Local với Custom AI.

## 2. Chủ Đề & Bối Cảnh (Theme & Setting)
Game diễn ra trong một bối cảnh giả tưởng về đêm - "Wisteria Night Forest" (Rừng Hoa Tử Đằng Về Đêm). 
Tông màu tối, sử dụng ánh sáng gradient neon từ các kỹ năng để làm nổi bật nhân vật, tạo ra không khí nghẹt thở của các trận chiến sinh tử (Deathmatch).

## 3. Hệ Thống Nhân Vật (Characters)
Danh sách Roster hiện tại bao gồm 4 nhân vật kinh điển. Mỗi nhân vật sở hữu trọn bộ 8 khung hình tự động chuyển đổi thông minh (Sprite Swapping: Idle, Attack, Jump, Crouch, Run, v.v...) và một Slash VFX (Hiệu ứng chém) mang bản sắc riêng.

### 3.1 Kamado Tanjiro
- **Tên tuyệt chiêu:** Thủy Hơi Thở - Thức Thứ Mười (Water Breathing)
- **Vũ khí / Đặc điểm:** Nichirin Katana đen, áo haori caro.
- **Slash VFX:** Sóng nước xanh biển pha cyan, chuyển động thanh thoát uốn lượn hình bán nguyệt.
- **Chỉ số (Base):** Cân bằng (Speed, HP trung bình).

### 3.2 Kamado Nezuko
- **Tên tuyệt chiêu:** Thuật Máu Quỷ - Máu Bùng Cháy (Blood Demon Art)
- **Vũ khí / Đặc điểm:** Móng vuốt quỷ / Sức mạnh thể chất, aura đỏ và hồng mười giờ.
- **Slash VFX:** Lưỡi dao máu với ngọn lửa quỷ dị màu hồng neon/đỏ thẫm, uyển chuyển và sắc mỏng.
- **Chỉ số (Base):** Sát thương lớn, tốc độ nhanh.

### 3.3 Agatsuma Zenitsu
- **Tên tuyệt chiêu:** Lôi Hơi Thở - Tốc Độ Thần (Thunder Breathing)
- **Vũ khí / Đặc điểm:** Haori vàng, chuyển động thần tốc.
- **Slash VFX:** Lưỡi sét vàng điện xé toạc không gian, lõi trắng sáng cường độ cao.
- **Chỉ số (Base):** Tốc độ cực cao, HP thấp (Glass Cannon).

### 3.4 Hashibira Inosuke
- **Tên tuyệt chiêu:** Thú Hơi Thở - Nhận Thức Không Gian (Beast Breathing)
- **Vũ khí / Đặc điểm:** Song kiếm răng cưa, mặt nạ heo rừng.
- **Slash VFX:** Lưỡi phong ba dạng răng cưa chém chéo, màu xanh lục nhạt (pale green) hoang dã.
- **Chỉ số (Base):** Cận chiến mạnh mẽ, tầm đánh càn lướt.

## 4. Cơ Chế Gameplay (Core Mechanics)

### 4.1 Điều Khiển (Controls)
- **W / A / S / D:** Di chuyển (Nhảy lên, Trái, Cúi xuống, Phải).
- **Phím J:** Giao tranh bằng Vũ khí (Light Attack) - Kết hợp với VFX hiệu ứng chém của từng nhân vật.
- **Phím K:** Tung cú đá bật lùi (Heavy Kicking).
- **Phím L:** Lướt / Né đòn (Dash / Dodge).
- **Phím U:** Đỡ đòn (Block) - Giảm thiểu lượng lớn sát thương.
- **Phím I:** Phóng đạn nhãn thuật / Projectile (Fireball / Chưởng từ xa).
- **Phím Q:** Kích hoạt Tuyệt Chiêu Cuối (Ultimate) khi thanh Năng lượng đầy 100%.

### 4.2 State Machine (Hệ thống trạng thái)
Game Engine sử dụng kiến trúc Finite State Machine tinh vi để mô phỏng tính logic của game đối kháng:
- Không thể di chuyển khi đang tấn công (Animation Hitting Lock).
- Animation chạy (Run1/Run2) được tính toán chuyển đổi liên tục dựa trên Timestamp mượt mà.
- Frame ảnh sẽ được ưu tiên theo cấp độ hành động. (VD: Đang nhảy múa kiếm thì sẽ gọi sprite `jump_attack`).

### 4.3 Combat System & Ultimate
- Trận đấu có hệ thống combo liên hoàn, đếm số đòn đánh (Combo Count / Timer).
- Có Hitbox cơ bản để nhận sát thương (Body), Hitbox để tấn công (Sword/Kicking).
- Thanh năng lượng tự động tích lũy khi đánh trúng đối thủ hoặc bị sát thương.
- **Ultimate Cinematic System:** Hệ thống màn hình tối lại, overlay ảnh chân dung (Splash Art) cỡ lớn của nhân vật giáng một đòn chí mạng Xuyên Giáp (Unblockable).

## 5. Kiến Trúc Game Engine & Kỹ Thuật (Engineering)

### 5.1 Sprite Swapping Architecture
- Từ bỏ lối render rời rạc (Vẽ tay kiếm + ảnh body riêng), hệ thống sử dụng Baked-Assets Workflow.
- Cấu hình file `js/characters.js` quản lý dictionary: `idle, idle_attack, jump, jump_attack, crouch, crouch_attack, run1, run2`... 

### 5.2 Asset Processing Pipeline
Mọi asset đồ hoạ được Gen bằng AI, nhưng đi kèm với một **Quy trình loại bỏ Background tự động hóa (Chromakey Node.js)** mạnh mẽ:
- AI tạo nhân vật sử dụng dải màu chết (Magenta `#FF00FF` / Cyan `#00FFFF` / Blue `#0000FF`).
- File `tools/chromakey.js` và `tools/chromakey_vfx.js` (dùng thư viện Jimp) đi qua từng pixel, so sánh kênh màu (RGB channel difference) và despill thông minh để giữ lại các dải alpha (độ mờ viền gợn sóng) mà không bị lộ outline xanh hồng rẻ tiền.

## 6. Giao Diện & UX (User Interface)

- **Menu Screen:** Bố cục tối giản có hiệu ứng Cinematic Overlay.
- **Phòng Chọn Nhân Vật (Select Screen):** Giao diện lưới cao cấp. Trải nghiệm chọn 4 ô nhân vật (P1 & P2). Có hiển thị độ khó của Bot.
- **Game HUD:**
  - Hai thanh HP và Energy (Bar Mượt mà bằng linear-gradient). 
  - Tên nhân vật viết font viền đổ bóng nổi bật.
  - Thanh chữ Tự động phát sáng và hiện `⚡ Tuyệt chiêu! [Q]` khi đầy mana.
- **Pause & End Game Menu:** Blur Background, Font chữ Cinzel sang trọng cổ điển, tự động check ván cờ hòa (Draw) / Thắng / Thua.

## 7. Lộ Trình Phát Triển (Future Roadmap)
- **Giai đoạn 1 (Đã hoàn thành):** MVP Prototype Game Engine HTML5 với 4 nhân vật gốc, cấu hình xong hệ thống load assets thông minh.
- **Giai đoạn 2 (Tiếp theo):** Code thuật toán AI nâng cao cho Bot (hiện tại Bot đang chơi ngẫu nhiên cơ bản). 
- **Giai đoạn 3:** Hỗ trợ Online Multiplayer qua WebSocket.
- **Giai đoạn 4:** Mở rộng Roster (Đưa phe Quỷ Dữ như Muzan, Thượng Huyền vào). Thêm map mới.
