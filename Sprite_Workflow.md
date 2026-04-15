# BỘ NGUYÊN TẮC LUẬT VÀNG TỐI CAO (THE GOLDEN RULES) TOÀN TẬP
*(Tài liệu Bắt Buộc Tuân Thủ Tối Cao Trước Khi Gen Bất Kỳ Asset Sprite Nào)*

## I. KIỂM TRA TRƯỚC KHI GEN (PRE-FLIGHT & MICRO-DETAILS)
1. **LUẬT SOI TIỂU TIẾT VÀ TỰ ĐỐI CHIẾU CỦA AI (100% MICRO-DETAIL UNIFICATION)**: 
   - **Tuyệt đối Bắt buộc**: AI (Tuyệt đối không bắt sếp phải làm) PHẢI TỰ ĐỘNG MỞ LẠI TOÀN BỘ CÁC SPRITE CŨ VÀ QUÉT ĐỐI CHIẾU CẨN THẬN BẰNG MẮT AI.
   - **Tanjiro**: Khuyên Tai Hanafuda, Sẹo trán, Áo Caro xanh đen, tất đen, sandal đen.
   - **Inosuke**: Cởi trần 100%, quần xanh đen nhạt, mang tất thụng lông ở ống chân và đai lưng xù lông (Thick Faux Furry Fluffy Waistband), đi chân đất hoặc hở ngón. Nắm 2 thanh kiếm răng cưa.
   - **Zenitsu**: Chuẩn Haori vàng cam mũi tên trắng gradient xẹp xuống, áo trong Demon Slayer đen, tất Kyahan quấn dây trắng chéo bắp chân, đi guốc/dép zori chuẩn. *(CẤM ĐI ỦNG ĐEN MỘT MÀU)*. Cầm kiếm vàng nhạt.
   - **Nezuko**: Tóc đen ngọn cam/đỏ, Ngậm trúc, váy Sakura hồng, Haori nâu đen bên ngoài, đi xà cạp đen chân quấn dây trắng, đi dép Zori *(CẤM ĐI CHÂN ĐẤT TRẦN THỦI LỦI kiểu hoang dã)*.
   - **SỰ THỐNG NHẤT TUYỆT ĐỐI (100% STRICT UNIFORMITY)**: Cùng 1 character, cùng 1 scale, cùng 1 position, fixed canvas (1024x1024), centered, feet aligned, no zoom, no perspective change, consistent style, transparent PNG. Mặc định quay mặt về hướng bên phải màn hình. Thống nhất cực kỳ strict về tổng thể, kích thước và từng detail nhỏ nhất (mắt, màu tóc, khuyên tai, kiểu tóc, dáng người, trang phục, áo khoác, thắt lưng, giày dép, tất Kyahan). Mọi chi tiết cần sự thống nhất vô cùng strict 100%. NHẤT ĐỊNH VÀO GAME, TỈ LỆ CƠ THỂ MỌI LOẠI POSE PHẢI THỐNG NHẤT 100% VỚI NHAU!

2. **LUẬT CẦM KIẾM VÀ CẤM VFX VẾT CHÉM**: 100% các Sprite ĐỀU PHẢI CẦM KIẾM. **KIẾM CẦN THỐNG NHẤT VÔ CÙNG QUAN TRỌNG**, tuyệt đối không biến tấu chuôi và lưỡi kiếm giữa các frame. ĐẶC BIỆT: **TUYỆT ĐỐI KHÔNG GEN VỆT CHÉM (SWORD SLASH TRAIL)** ở bất kỳ đòn đánh nào (Dù là Normal hay PowerUp). CHỈ GEN THANH KIẾM TRẦN! Lý do: Vết chém sẽ được lập trình VFX vẽ đè lên trên ở bước code sau, việc vẽ vệt chém dính vào sprite sẽ gây overlap và hỏng logic hình ảnh!
3. **LUẬT CHẤT LƯỢNG HÌNH ẢNH**: Mọi sprite sinh ra phải đạt **ĐỘ NÉT CĂNG TỐI ĐA (High Resolution, Ultra Sharpness)**.
4. **LUẬT HƯỚNG MẶT VÀ TRỤC X CỰC KỲ KHẮT KHE**: Luôn mặc định quay mặt góc nghiêng chiến đấu về PHÍA BÊN PHẢI màn hình. Đầu, ngực, chân, và lưỡi kiếm ĐỀU PHẢI CHỈ VỀ BÊN PHẢI (Right side of the screen). (Mẹo Prompt: `Character body in profile facing the right side. Looking strictly to the right edge. >>> RIGHTWARD ORIENTATION >>>`). Nếu AI vẫn ngoan cố sinh ra ảnh nhìn sang trái, lập tức coi như RÁC và phải bị loại bỏ/regenerate.
5. **LUẬT TƯ THẾ Đứng (IDLE)**: Khi đứng yên (Idle), chân phải chạm đất, người PHẢI ĐỨNG THẲNG LÊN (Stand tall and upright), không được khom lưng hay chùn chân nếu không có yêu cầu đặc biệt. Lưng phải thẳng.
6. **LUẬT TƯ THẾ ĐÁ (KICK POSE SPECIFICS)**: Cấm co cụm chân vô nghĩa. Khi đá, phi, trượt... luôn bắt buộc **1 chân duỗi thẳng chĩa thẳng về phía trước**.

## II. LOGIC PHÂN NHÓM POSE (3 TẦNG TRẠNG THÁI CAO CẤP)
Để đảm bảo quy tắc "Chỉ khác biệt chi tiết ở level loại pose, nhưng bên trong 1 loại pose thì phải giống nhau 100%", chúng ta chia làm 3 Nhóm chính:

### NHÓM A: TRẠNG THÁI CƠ BẢN (NORMAL STATE)
Đặc điểm: Giữ nguyên form, base thiết kế chuẩn, KHÔNG có aura, KHÔNG có lửa, KHÔNG có vệt sáng chém.
- **A1. Di chuyển (Movement)**:
  - Đứng (Idle), Nhảy (Jump), Cúi (Crouch).
  - Khung chạy 1 (Run 1): 2 chân hướng về phía sau.
  - Khung chạy 2 (Run 2): 1 chân sau, 1 chân duỗi thẳng tới trước.
  - Cúi đi (Crouchwalk 1 & 2): Tuân thủ luật chạy y hệt Run 1 & 2, nhưng người hạ thấp trọng tâm.
  - (Luật Space/Lộn vòng: engine tự xoay trục, không cần gen hình thể lộn vòng).
- **A2. Tấn công (Attack - Nút J, K, L)**:
  - Là sự kết hợp của tổ hợp (Tư thế) x (Loại đòn đánh).
  - 3 Tư thế (Đứng, Nhảy, Cúi) x 4 Loại Sinh đòn (Chém ngắn 1, Chém dài 2, Đá, Phóng Sóng Kiếm). 
  - Tổng cộng là 12 Poses tấn công cơ bản.

### NHÓM B: TRẠNG THÁI CƯỜNG HÓA (POWER-UP STATE - NÚT U)
Đặc điểm: Bộ khung giữ nguyên 100% tỉ lệ Nhóm A. "Phủ" lên hệ sinh thái Aura: TẤT CẢ POWERUP ĐỀU PHẢI CÓ AURA BAO QUANH CHÁY RỰC KHẮP CƠ THỂ PHÙ HỢP THUỘC TÍNH (Tanjiro bắt buộc có Aura Lửa bao quanh khổng lồ). Mắt sắc lẹm hoặc toé lửa đỏ, ấn trán phát sáng đỏ mạnh, mặt giận dữ, vệt Hơi Thở Mặt Trời rõ rệt, áo haori bay tung tóe, kiếm hóa lửa đỏ bùng cháy, áp lực cực mạnh (Aggressive).
- **B1. Di chuyển Cường hóa (7 Poses)**:
  - Lấy chính xác 7 poses di chuyển của Nhóm A1 và "phủ" Aura cường hóa aggressive lên.
- **B2. Tấn công Cường hóa (12 Poses)**:
  - Lấy chính xác 12 poses tấn công của Nhóm A2, "phủ" Aura cường hóa bao quanh người. LƯU Ý: THANH KIẾM BỐC LỬA nhưng TUYỆT ĐỐI KHÔNG VẼ VỆT CHÉM (SLASH TRAIL) ĐỂ TRÁNH OVERLAP VFX.

### NHÓM C: TUYỆT KỸ (ULTIMATE - NÚT I & O)
Đặc điểm: Đòi hỏi pose độc lập hoàn toàn, bùng nổ hiệu ứng và không dùng chung form với Nhóm A hay B.
- **C1. Ultimate 1 (Nút I) - Viêm Vũ**:
  - Pose Kích hoạt (Charge): Đứng lệch chân, kiếm kéo ra sau, đầu cúi nhẹ, lửa bắt đầu xoáy quanh kiếm.
  - Pose Tấn công (Execute): Xoay người chém vòng cung mạnh, vệt lửa cong bùng nổ theo đường kiếm.
- **C2. Ultimate 2 (Nút O) - Liên Vũ Bất Tận**:
  - Pose Kích hoạt (Charge): Hạ thấp trọng tâm, kiếm giữ ngang, toàn thân căng cứng, lửa xoáy bao quanh người.
  - Pose Tấn công (Execute): Lao lên chém liên hoàn, thân đổ về trước, nhiều vệt lửa bùng nổ chồng lên nhau tạo afterimage (tàn ảnh).

## III. TRONG KHI GEN (PROMPTING)
6. **LUẬT THAM CHIẾU ANIME GỐC (STRICT ORIGINAL ANIME REFERENCE)**: 
   - Thay vì mô tả thủ công tiểu tiết, prompt BẮT BUỘC phải ra lệnh cho AI tham chiếu (Refer) trực tiếp đến visual gốc chuẩn của nhân vật trong bộ Anime nguyên tác.
   - Ví dụ: `Refer STRICTLY to the highly detailed official anime visual of Kamado Tanjiro from Demon Slayer. Maintain 100% exact strict consistency in style and character design details with the original anime reference across all poses.`
   - Điều này ép hệ thống giữ nguyên dáng dấp, họa tiết và màu sắc đúng chuẩn studio Ufotable, tránh việc AI tự phiêu thiết kế.
7. **LUẬT CẤM RÁC AI**: Khóa họng AI tự ý vẽ thêm các vệt sáng năng lượng nhảm nhí dưới háng, đốm phản quang, hay VỆT CHÉM QUỸ ĐẠO KIẾM (Slash Trail). Phải có `FLAT LIGHTING, NO SHADOWS` nếu là đòn đánh thường Nhóm A. **Cấm tuyệt đối chắp nhặt chi tiết thừa thãi của character khác (VD: cấm ráp tà áo choàng Rengoku vào Tanjiro).**
7. **LUẬT CHROMAKEY BACKGROUND (THIẾT YẾU CHO EXTRACTION CHIẾT XUẤT)**:
   - Trong prompt **BẮT BUỘC** phải chèn câu lệnh tạo phông nền màu dạ quang chói để Python có thể khoét không dính viền.
   - Ví dụ: `SOLID BRIGHT MAGENTA BACKGROUND #FF00FF` (Cho Tanjiro, Inosuke).
   - Ví dụ: `SOLID BRIGHT CYAN BACKGROUND #00FFFF` (Cho Nezuko).
   - Ví dụ: `SOLID BRIGHT BLUE BACKGROUND #0000FF` (Cho Zenitsu).
   - *Tuyệt đối cấm nền đen, nền trắng trong suốt hoặc bối cảnh nhà cửa, cây cối.*

## IV. SAU KHI GEN (EXTRACTION PIPELINE)
8. **LUẬT ĐỤC LỖ TÓC TƠ (FORCE BLACK EDGE & CLEAN UP KÍN)**:
   - Khi chạy kịch bản Python xóa nền (Chromakey), thuật toán phải sử dụng **Quét Toàn Cục (Global Pixel Scan)** tịnh tiến qua mọi pixel.
   - Xóa sạch cả những phần kín: Khoảng lẻ tẻ giữa các lọn tóc của Nezuko, khoảng trống kẹp kẽ cánh tay hay nách áo... Không trật 1 pixel thừa mứa màu nền nào chặn giữa nhân vật.
9. **LUẬT ÉP ĐEN VIỀN (BLACK OUTLINE ALIASING)**:
   - Viền điểm ảnh giao giao thoa (anti-alias) giữa nhân vật và Background huỳnh quang bắt buộc phải tát thẳng về màu Black (Đen Bóng Lineart).
   - Không được để lại quầng sáng dạ quang (magenta/cyan fringe) bám quanh da thịt nhân vật.
10. **KHÔNG CROP, GIỮ NGUYÊN FORM CỐ ĐỊNH NHẰM TRÁNH HIỆN TƯỢNG BẸO HÌNH**:
   - TẤT CẢ các hình ảnh sau khi bóc nền ChromaKey tuyệt đối dĩ bất dịch không được dùng hàm Auto-Crop, phải ép file PNG duy trì kích thước canvas nguyên thủy 1024x1024 để đảm bảo Engine import vào form character ko bị méo xệch hình thể. Không có 1 pixel Lem Nhem. Nền sau khi xử lý phải hoàn chỉnh trong suốt (Transparent 100%).
11. **LUẬT CHUẨN HOÁ KÍCH THƯỚC (SCALE NORMALIZATION)**: Hình ảnh Gen ra từ AI có tật tự phóng to (zoom in) lấp đầy tâm ảnh. BẮT BUỘC AI phải theo dõi sát sao, nếy thấy bức nào to/nhỏ sai lệch so với Base Pose thì phải dùng ngay Python Post-Processing (script resize) thu nhỏ ảnh lại (ví dụ 0.9x, 0.8x) sao cho ăn khớp 100% với form chuẩn. Đảm bảo lúc nhân vật nhảy vào game đổi pose không bị biến dạng phóng lớn / teo nhỏ đột ngột.
