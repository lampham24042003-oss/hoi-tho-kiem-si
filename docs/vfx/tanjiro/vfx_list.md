# TANJIRO VFX SPECIFICATION

Kho dữ liệu Asset VFX dạng Alpha/Transparent (Sử dụng Black BG Unmult) mô tả toàn bộ 28 hiệu ứng độc lập của Kamado Tanjiro, sử dụng cho `game_v3.js` và `characters_v3.js`. Do nhân vật game quay trái/quay phải, toàn bộ Asset đều được render sao cho có dễ dàng áp dụng đối xứng `ctx.scale(-1, 1)` mà không phá vỡ logic hình ảnh. Điểm đặc biệt của toàn bộ Asset này là hỗ trợ **Opacity bán mờ**, pha trộn với `globalCompositeOperation = 'screen'`.

## A. BỘ BASIC (Hơi Thở của Nước - Water Breathing)
VFX màu xanh dương chủ đạo, viền trắng, trong suốt như pha lê. Tan biến bằng Particle mỏng.

1. **`vfx_tanjiro_water_slash1.png` (J1)**: Vệt nước vòng cung chéo 45 độ. Nằm ngang, dẹt. 
2. **`vfx_tanjiro_water_slash2.png` (J2)**: Vệt chém ngang tầm ngực. Lực ly tâm lớn, sương mờ đuôi. Hình ngang mỏng.
3. **`vfx_tanjiro_water_kick.png` (K)**: Xoáy nước ripples nhỏ bán nguyệt tại mũi chân. Tròn bầu dục.
4. **`vfx_tanjiro_water_proj.png` (L)**: Lưỡi liềm sóng nước. Đầu mũi đậm nhát, vân nước cuộn xoáy bên trong. Dựng đứng di chuyển ngang.
5. **`vfx_tanjiro_water_dodge.png` (Né tránh)**: Vòng tròn nước mỏng quay quanh cơ thể tạo bóng mờ Afterimage.

## B. IMPACT BASIC (Xanh Dương)
6. **`impact_tanjiro_water_slash.png`**: Điểm chạm bung Splash nước, rẽ 2-3 vết chéo nhỏ.
7. **`impact_tanjiro_water_kick.png`**: Vòng sóng nước nén Shockwave, đập phẳng.
8. **`impact_tanjiro_water_proj.png`**: Sương mù mảnh vỡ lưỡi liềm rẽ đôi.

## C. TRẠNG THÁI CƯỜNG HOÁ (Ấn Diệt Quỷ)
9. **`vfx_tanjiro_mark_transform.png`**: Phóng thích hơi nóng Heat Distortion, tia đứt gãy mạch máu vút lên.
10. **`vfx_tanjiro_mark_aura.png`**: Màng Heat Haze liên tục (Opacity 30%) ôm ấp cơ thể, tóe tiểu đốm lửa vàng.

## D. BỘ CƯỜNG HOÁ (Hỏa Thần Thần Lạc)
Toàn bộ mang màu Lửa Đỏ Cam, Viền đỏ sẫm rực rỡ và nóng bỏng hơn Water.

11. **`vfx_tanjiro_fire_slash1.png` (J1 CH)**: Vòng cung kiếm lửa chói lóa. Để lại rãnh không khí cháy xém.
12. **`vfx_tanjiro_fire_slash2.png` (J2 CH)**: Vết rồng nhỏ uốn lượn hất ngang.
13. **`vfx_tanjiro_fire_kick.png` (K CH)**: Tiểu đứt lốc Blast nhỏ tại mũi chân.
14. **`vfx_tanjiro_fire_proj.png` (L CH)**: Phượng hoàng / Rồng lửa bay vút về trước.
15. **`vfx_tanjiro_fire_dodge.png`**: Bánh xe lửa (Fire wheel) kích thước gọn ôm người.

## E. IMPACT CƯỜNG HOÁ (Vàng kim)
16. **`impact_tanjiro_fire_slash.png`**: Điểm nổ tóe lửa pháo hoa (Sparks) sáng chói.
17. **`impact_tanjiro_fire_kick.png`**: Vụ nổ Blast hình cầu nén cực mạnh.
18. **`impact_tanjiro_fire_proj.png`**: Phượng hoàng chạm vỡ quầng khói mây rực cháy.

## F. ULTIMATE 1: Hỏa Thần Thần Lạc - Viêm Vũ (Dance)
19. **`vfx_tanjiro_ult1_transform.png` (Charge)**: Ép Plasma nhiệt lượng tối đa chói lóa trên thần kiếm.
20. **`vfx_tanjiro_ult1_aura.png` (Aura)**: Vòng Fire Ring chậm dưới đất thả ngàn tia lửa vàng kim dọc.
21. **`vfx_tanjiro_ult1_attack.png` (Slash)**: Vành đai lửa chém dọc hoàn hảo trên bầu mây. Lửa cuộn xoáy cứng ngắc cực ác.
22. **`vfx_tanjiro_ult1_impact.png` (Hit)**: Cột lửa Plasma xọc thẳng lên trời.

## G. ULTIMATE 2: Hỏa Thần Thần Lạc - Liên Vũ Bất Tận
23. **`vfx_tanjiro_ult2_transform.png` (Air Cast)**: Không khí nén áp suất xung quanh.
24. **`vfx_tanjiro_ult2_aura.png` (Air Sphere)**: Kén lửa bảo vệ trong suốt siêu mượt.
25. **`vfx_tanjiro_ult2_attack.png` (Combos)**: Lưới lửa vạch rối hình rồng đan xen cực nhiều nét chém gào thét.
26. **`vfx_tanjiro_ult2_impact.png` (Shockwave)**: Đấu nối tâm điểm 7 lần rách màn hình nổ ra Shockwave siêu khổng lồ.

## H. PHÒNG THỦ (Block)
27. **`vfx_tanjiro_block.png`**: Hydro-shield lăng trụ màu xanh trong như kính, độ mờ nhẹ gợn rạn do lực nén.

## I. TRẠNG THÁI SUY KIỆT (Exhaustion)
28. **`vfx_tanjiro_exhaust_aura.png`**: Cột khói/hơi nước mờ ảo bốc lên theo chiều dọc, thể hiện khí huyết sôi sục tản nhiệt ra ngoài khi cơ thể mệt lả sập nguồn sau [Liên Vũ Bất Tận].
