# Lesson Learnt: VFX Integration & Game Loop Architecture

Tài liệu này tổng hợp lại chuỗi các sai lầm ngớ ngẩn và chí mạng trong quá trình tích hợp gói 27 VFX mới của Tanjiro, đặc biệt là lỗi "tàng hình VFX" trong chuỗi Ultimate Combo. Mục tiêu là ghi nhớ vĩnh viễn để mạch code sau này không dẫm lại vết xe đổ, tiết kiệm hàng giờ test của người dùng.

## 1. Sai lầm chí mạng về Scope (Phạm vi biến) trong Vanilla JS
- **Vấn đề đã mắc phải**: Sử dụng `if (window.Effects)` để kiểm tra xem module tạo hiệu ứng có tồn tại không trước khi gọi lệnh.
- **Tại sao nó NGU**: Khác với `var`, các biến được khai báo bằng `const` hoặc `let` ở cấp cao nhất (top-level) trong một thẻ `<script>` thông thường **không bao giờ** tự động được gắn làm thuộc tính của đối tượng toàn cục `window`. Khai báo gốc là `const Effects = (() => { ... })();`, do đó `window.Effects` luôn luôn trả về `undefined`.
- **Hậu quả**: Toàn bộ đoạn code xả Impact, bắn tia lửa và rung màn hình bị bỏ qua hoàn toàn và **lỗi trong sự im lặng** vì trình duyệt xem khối `if(undefined)` là false thay vì báo lỗi mất biến `ReferenceError`.
- **Bài học**: Luôn kiểm tra biến toàn cục thông qua toán tử vạn năng: `if (typeof Effects !== 'undefined')`.

## 2. Lỗ hổng vòng lặp Game(Game Loop) và Đóng băng Trạng thái (State Machine)
- **Vấn đề đã mắc phải**: Khi kích hoạt Ultimate Combo, Engine chuyển trạng thái ván đấu sang `this.state = 'ultimate_combo'` và sử dụng tính năng **return early** (thoát sớm) ở đầu chu kỳ lặp để cắt không cho 2 người chơi hành động tự do (`this.p1.update()` không chạy).
- **Tại sao nó NGU**: Lệnh chốt sớm này đã vô tình nhốt luôn cả dòng chảy thời gian của hàm `Effects.update()` vốn chạy độc lập bên ngoài.
- **Hậu quả**: Hiệu ứng (Effects) tiếp tục nhận tín hiệu được vẽ lên (`Effects.draw` chạy), NHƯNG do `.update()` bị chặn, các particle, impact hay tia sparks không hề bị trừ dần thời gian sống (`life`) và cũng không có gia tốc rơi. Kết quả là mọi hiệu ứng hoặc bị đóng băng vĩnh viễn, hoặc sụp hỏng hệ thống tọa độ động.
- **Bài học**: Khối Update Engine của hiệu ứng khói lửa, rung chấn (`Effects.update()`) phải được ưu tiên đặt ngang hàng cốt lõi và luôn luôn được gọi bất kể trạng thái game đang pause hành động người chơi hay đang nhảy Cinematic.

## 3. Khẩu nghiệp "Cache Browser" và Vấn đề Cache Busting
- **Vấn đề đã mắc phải**: Thêm hàng đống logic mới, đổi đường dẫn ảnh, thay đổi tận gốc hệ lý thuyết rendering nhưng test trên trình duyệt vẫn không thấy tăm hơi.
- **Hậu quả**: Cãi nhau với người dùng rằng "ảnh đã có, code đã viết", đổ lỗi sai cho mạng hoặc cache mà không chốt hạ triệt để phiên bản buộc trình duyệt quên bộ nhớ cũ.
- **Bài học**: Xử lý logic cứng: Mỗi lần cấu trúc thư mục hoặc core engine thay đổi mạnh thì thẻ `<script src="js/xxx.js?v=XX">` phải được increment (tăng version) một cách kỷ luật để đập nát cache của user. 

## 4. Rủi ro về Phép hòa trộn (Blend Modes) che khuất đòn đánh
- **Vấn đề đã mắc phải**: Cài đặt `vfx_tanjiro_ult1_attack.png` (quả cầu lửa bọc thân) để spam vẽ **mỗi khung hình (frame by frame)** đè lên tâm nhân vật trong quá trình thi triển Combo. Lại dùng `ctx.globalCompositeOperation = 'screen'`.
- **Hậu quả**: Độ trong suốt (`alpha=0.45`) khi bị spam 60 lần/giây ở mode `screen` đã tạo ra sự cộng hưởng ánh sáng dẫn đến màn hình phát một quả cầu sáng trắng mù loà che lấp toàn bộ các VFX Impact xịn xò khác tung ra.
- **Bài học**: Phân tách rõ ràng giữa **Aura duy trì lâu** và **Impact điểm nổ**. Aura không nên spam opacity cộng dồn liên tục mà phải quản lý alpha theo nhịp, còn Impact thì dùng `source-over` đè lên hoàn toàn để đảm bảo hình khối tung đòn có độ trong suốt và sắc nét tuyệt đối.

## 5. Duyệt biến linh động (Dynamic Iteration) trong tiền nạp (Preload Asset)
- **Vấn đề đã mắc phải**: Trông chờ hoàn toàn vào thao tác loop động `Object.entries(c.impacts)` để phát hiện ra key `ult1`, `ult2` rồi tự động push vào kênh load ảnh.
- **Bài học**: Đối với các tài nguyên đóng vai trò "chốt sổ chặn cốt truyện" như Ultimate, tốt nhất là "Hardcode load thẳng tay" bên cạnh loop ẩn: `if (c.impacts.ult1) load("hit_tanjiro_ult1", ...)`. Để nếu trình duyệt có dở chứng skip object hay filter sai, ảnh Ultimate vẫn được nạp cưỡng chế vào bộ nhớ RAM.

## 6. Lạm dụng Cứu hộ cục bộ (Double Ctx Restore) 
- **Vấn đề đã mắc phải**: Trong hàm vòng lặp vẽ Array của Effects, khi luống cuống debug "vì sao hình không hiện", đã nhồi thêm 1 cặp `try...catch` có chứa lệnh dọn Context `ctx.restore()`.
- **Hậu quả**: `ctx.save()` được gọi một lần, nhưng `ctx.restore()` bị gọi chồng lên 2-3 lần. Context stack của HTML5 Canvas khi bị underflow sẽ vỡ mốc tọa độ gốc (`ctx.translate`). Rất may là nó không văng lỗi sập trang mà tự bỏ qua, nhưng hệ quả là làm mọi bức vẽ ở các layer đằng sau chệch hoàn toàn điểm ngắm.
- **Bài học**: Code Canvas đòi hỏi tính đối xứng sinh tử. Mỗi lệnh `ctx.save()` phải có duy nhất một `ctx.restore()` đi kèm để đóng gói Scope.

> **Kết luận thép**: Khi một hình ảnh không hiển thị, Vấn đề cốt lõi 80% KHÔNG PHẢI nằm ở "file lỗi hay đường dẫn chết". Mà nó nằm ở việc logic của Engine có CẤP PHÉP CHẠY hàm khởi tạo bức vẽ đó hay chưa (`if / const scope` bugs, state machine return bugs).
