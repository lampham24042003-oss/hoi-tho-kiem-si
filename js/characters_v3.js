// characters.js - Character definitions, stats, and rendering
const CHARACTERS = {
  tanjiro: {
    id: 'tanjiro',
    name: 'Tanjiro',
    displayName: 'Kamado Tanjiro',
    ultimateName: 'Thủy Hơi Thở - Thức Thứ Mười',
    sprites: {
      idle:   'assets/sprites/tanjiro_idle.png',
      idle_attack: 'assets/sprites/tanjiro_idle_attack.png', 
      jump:   'assets/sprites/tanjiro_jump.png',
      jump_attack: 'assets/sprites/tanjiro_jump_attack.png', 
      crouch: 'assets/sprites/tanjiro_crouch.png',
      crouch_attack: 'assets/sprites/tanjiro_crouch_attack.png',
      run1: 'assets/sprites/tanjiro_run1.png',
      run2: 'assets/sprites/tanjiro_run2.png',
      crouch_walk1: 'assets/sprites/tanjiro_crouch_walk1.png',
      crouch_walk2: 'assets/sprites/tanjiro_crouch_walk2.png',
      
      heavy_attack: 'assets/sprites/tanjiro_heavy_attack.png',
      heavy_jump_attack: 'assets/sprites/tanjiro_jump_heavy_attack.png',
      heavy_crouch_attack: 'assets/sprites/tanjiro_crouch_heavy_attack.png',
      kick: 'assets/sprites/tanjiro_kick.png', 
      jump_kick: 'assets/sprites/tanjiro_jump_kick.png', 
      crouch_kick: 'assets/sprites/tanjiro_crouch_kick.png', 
      projectile: 'assets/sprites/tanjiro_projectile.png',
      jump_projectile: 'assets/sprites/tanjiro_jump_projectile.png',
      crouch_projectile: 'assets/sprites/tanjiro_crouch_projectile.png',
      block: 'assets/sprites/tanjiro_block.png',
      
      powerup_pose: 'assets/sprites/tanjiro_powerup_pose.png',
      powerup_idle: 'assets/sprites/tanjiro_powerup_idle.png',
      powerup_run1: 'assets/sprites/tanjiro_powerup_run1.png',
      powerup_run2: 'assets/sprites/tanjiro_powerup_run2.png',
      powerup_crouch: 'assets/sprites/tanjiro_powerup_crouch.png',
      powerup_jump: 'assets/sprites/tanjiro_powerup_jump.png',
      powerup_crouch_walk1: 'assets/sprites/tanjiro_powerup_crouch_walk1.png',
      powerup_crouch_walk2: 'assets/sprites/tanjiro_powerup_crouch_walk2.png',

      powerup_idle_attack: 'assets/sprites/tanjiro_powerup_idle_attack.png',
      powerup_heavy_attack: 'assets/sprites/tanjiro_powerup_heavy_attack.png',
      powerup_kick: 'assets/sprites/tanjiro_powerup_kick.png',
      powerup_projectile: 'assets/sprites/tanjiro_powerup_projectile.png',
      powerup_jump_attack: 'assets/sprites/tanjiro_powerup_jump_attack.png',
      powerup_jump_heavy_attack: 'assets/sprites/tanjiro_powerup_jump_heavy_attack.png',
      powerup_jump_kick: 'assets/sprites/tanjiro_powerup_jump_kick.png',
      powerup_jump_projectile: 'assets/sprites/tanjiro_powerup_jump_projectile.png',
      powerup_crouch_attack: 'assets/sprites/tanjiro_powerup_crouch_attack.png',
      powerup_crouch_heavy_attack: 'assets/sprites/tanjiro_powerup_crouch_heavy_attack.png',
      powerup_crouch_kick: 'assets/sprites/tanjiro_powerup_crouch_kick.png',
      powerup_crouch_projectile: 'assets/sprites/tanjiro_powerup_crouch_projectile.png',

      ultimate1_charge: 'assets/sprites/tanjiro_ultimate1_charge.png',
      ultimate1_attack: 'assets/sprites/tanjiro_ultimate1_attack.png',
      ultimate2_charge: 'assets/sprites/tanjiro_ultimate2_charge.png',
      ultimate2_attack: 'assets/sprites/tanjiro_ultimate2_attack.png',

      ultimate_pose: 'assets/sprites/tanjiro_ultimate_pose.png', 
      exhaust_pose: 'assets/sprites/tanjiro_exhaust_pose.png?v=2',
    },
    vfx: {
      water_slash1: 'assets/effects/tanjiro_vfx/vfx_tanjiro_water_slash1.png',
      water_slash2: 'assets/effects/tanjiro_vfx/vfx_tanjiro_water_slash2.png',
      water_kick: 'assets/effects/tanjiro_vfx/vfx_tanjiro_water_kick.png',
      water_proj: 'assets/effects/tanjiro_vfx/vfx_tanjiro_water_proj.png',
      water_dodge: 'assets/effects/tanjiro_vfx/vfx_tanjiro_water_dodge.png',
      fire_slash1: 'assets/effects/tanjiro_vfx/vfx_tanjiro_fire_slash1.png',
      fire_slash2: 'assets/effects/tanjiro_vfx/vfx_tanjiro_fire_slash2.png',
      fire_kick: 'assets/effects/tanjiro_vfx/vfx_tanjiro_fire_kick.png',
      fire_proj: 'assets/effects/tanjiro_vfx/vfx_tanjiro_fire_proj.png',
      fire_dodge: 'assets/effects/tanjiro_vfx/vfx_tanjiro_fire_dodge.png',
      mark_transform: 'assets/effects/tanjiro_vfx/vfx_tanjiro_mark_transform.png',
      mark_aura: 'assets/effects/tanjiro_vfx/vfx_tanjiro_mark_aura.png',
      ult1_aura: 'assets/effects/tanjiro_vfx/vfx_tanjiro_ult1_aura.png',
      ult1_attack: 'assets/effects/tanjiro_vfx/vfx_tanjiro_ult1_attack.png',
      ult2_aura: 'assets/effects/tanjiro_vfx/vfx_tanjiro_ult2_aura.png',
      ult2_attack: 'assets/effects/tanjiro_vfx/vfx_tanjiro_ult2_attack.png',
      exhaust_aura: 'assets/effects/vfx_tanjiro_exhaust_aura.png',
    },
    impacts: {
      sword: 'assets/effects/tanjiro_vfx/impact_tanjiro_water_slash.png',
      kick: 'assets/effects/tanjiro_vfx/impact_tanjiro_water_kick.png',
      proj: 'assets/effects/tanjiro_vfx/impact_tanjiro_water_proj.png',
      fire_sword: 'assets/effects/tanjiro_vfx/impact_tanjiro_fire_slash.png',
      fire_kick: 'assets/effects/tanjiro_vfx/impact_tanjiro_fire_kick.png',
      fire_proj: 'assets/effects/tanjiro_vfx/impact_tanjiro_fire_proj.png',
      ult1: 'assets/effects/tanjiro_vfx/vfx_tanjiro_ult1_impact.png',
      ult2: 'assets/effects/tanjiro_vfx/vfx_tanjiro_ult2_impact.png',
      block: 'assets/effects/tanjiro_vfx/vfx_tanjiro_block.png',
    },
    // Fallback legacy sprite (used in char select card)
    spriteUrl: 'assets/sprites/tanjiro_idle.png',
    ultimateUrl: 'assets/ultimates/tanjiro.png', // Fallback
    cinematics: {
      powerup: 'assets/effects/tanjiro_vfx/cinematic_tanjiro_powerup.png',
      powerup_text: 'assets/effects/tanjiro_vfx/text_tanjiro_powerup.png',
      ult1: 'assets/effects/tanjiro_vfx/cinematic_tanjiro_ult1.png',
      ult1_text: 'assets/effects/tanjiro_vfx/text_tanjiro_ult1.png',
      ult2: 'assets/effects/tanjiro_vfx/cinematic_tanjiro_ult2.png',
      ult2_text: 'assets/effects/tanjiro_vfx/text_tanjiro_ult2.png',
    },
    swordLength: 120,
    swordColor: '#1a1a2e',
    swordGlow: '#00d4ff',
    auraColor: 'rgba(0, 180, 255, 0.4)',
    projectileColor: '#00aaff',
    projectileGlow: '#00d4ff',
    speed: 5,
    jumpForce: -16,
    maxHp: 5000,
    attackDamage: 6,
    kickDamage: 5,
    projectileDamage: 10,
    ultimateDamage: 40,
    selectColor: '#00d4ff',
    description: '',
    tags: ['Áp Sát', 'Dồn Sát Thương'],
    stats: {
      attack: 4,
      defense: 3,
      speed: 4,
      agility: 4,
      difficulty: 3
    },
    mechanicsDescription: `
      <div style="color:#ddd; font-family:sans-serif; font-size:13px; line-height:1.6; text-align:left;">
        <div style="color:#00d4ff; font-weight:bold; font-size:14px; border-bottom:1px solid rgba(0,212,255,0.4); padding-bottom:4px; margin-bottom:4px;">🌊 HỆ THỐNG CHIẾN ĐẤU CƠ BẢN (THỦY HƠI THỞ)</div>
        Nhân vật đa dụng (All-rounder) thiên về khả năng áp sát liên tục. Tốc độ hồi Nội Tự Nhiên cực nhanh: <b>8 Nộ / Giây</b>.<br>
        <div style="color:#55ff55; font-weight:bold; font-size:14px; border-bottom:1px solid rgba(85,255,85,0.4); padding-bottom:4px; margin-bottom:4px; margin-top:8px;">⚔️ ĐÒN ĐÁNH & CHIÊU THỨC</div>
        <b>[P] Chém Kiếm:</b> Nhấp nhả (P1) ra đòn nhanh. Giữ phím 0.3s (P2) để gồng đòn chém nặng, đẩy lùi cao hơn.<br>
        <b>[K] Quét Trụ:</b> Tung cú đá xoáy nước phá góc, đẩy lùi mạnh tạo khoảng trống an toàn.<br>
        <b>[L] Sóng Thủy Kiếm:</b> Phóng lốc nước bán nguyệt bay ngang bản đồ để cấu rỉa máu từ xa.<br>
        <div style="color:#ffdd33; font-weight:bold; font-size:14px; border-bottom:1px solid rgba(255,221,51,0.4); padding-bottom:4px; margin-bottom:4px; margin-top:8px;">🛡 PHÒNG THỦ & CƠ CHẾ COUNTER</div>
        <b>[B] Đỡ Đòn (Khối Thủy):</b> Tạo lá chắn hấp thụ <b>80% sát thương</b> nhận vào.<br>
        <span style="color:#ffcc00">⚠️ <b>Perfect Counter:</b></span> Nếu căn chuẩn nhịp để nhấn [B] ngay sát khung hình lúc giọt sát thương chạm áo (0.2s window), bạn không chỉ kháng đòn mà còn <b>hất văng 90 Sát Thương</b> trực tiếp vào kẻ tấn công, kèm hiệu ứng <b>Choáng (Stun) 0.4s</b>. Tuyệt đối bẻ gãy đường công của đối phương!<br>
        <div style="color:#ff4444; font-weight:bold; font-size:14px; border-bottom:1px solid rgba(255,68,68,0.4); padding-bottom:4px; margin-bottom:4px; margin-top:8px;">🔥 CẢNH GIỚI CƯỜNG HOÁ (HỎA THẦN THẦN LẠC)</div>
        <b>[U] Khai Ấn Diệt Quỷ (Tốn 70 Nộ):</b> Luồng nhiệt bốc lên, mở khóa Ấn Diện Quỷ trong 12 giây.<br>
        - Đổi toàn bộ VFX kỹ năng từ Nước sang Lửa rực cháy.<br>
        - Buff sức mạnh: <b>Nhân đôi (x2 Damage) sát thương tay</b> ở mọi đòn đánh cơ bản.<br>
        <div style="color:#ff2222; font-weight:bold; font-size:14px; border-bottom:1px solid rgba(255,34,34,0.4); padding-bottom:4px; margin-bottom:4px; margin-top:8px;">💥 KỸ NĂNG TỐI THƯỢNG (ULTIMATES)</div>
        <b>[I] Viêm Vũ (Tốn 80 Nộ):</b> Đập thẳng cột dung nham diện rộng dọn dẹp mặt đất, tung đòn an toàn tuyệt đối.<br>
        <b>[O] Liên Vũ Bất Tận (Tốn 95 Nộ):</b> Tiếp cận siêu tốc, xé nát bản đồ với chuỗi combo điên cuồng (<span style="color:#ffaa00; font-weight:bold;">940 Máu</span>).<br>
        <span style="color:#ff2222;">🆘 NHƯỢC ĐIỂM CHÍ MẠNG:</span> Vì vượt quá giới hạn sinh lý, sau khi kết thúc [O], toàn thân Tanjirou sẽ rơi vào trạng thái kiệt sức. Bạn sẽ <b>bị khóa mọi hành động (Phế Võ Công)</b> trong đúng 1.5 giây sau chiêu. Phải chắc chắn chiêu này sẽ kết liễu trận đấu!
      </div>
    `,
    swordPivotX: 20,
    swordPivotY: -10,
    vfxKick: 'assets/effects/vfx_kick_tanjiro_v3.png',
  },
  nezuko: {
    id: 'nezuko',
    name: 'Nezuko',
    displayName: 'Kamado Nezuko',
    ultimateName: 'Thuật Máu Quỷ - Máu Bùng Cháy',
    sprites: {
      idle:   'assets/sprites/nezuko_idle.png',
      idle_attack: 'assets/sprites/nezuko_idle_attack.png',
      jump:   'assets/sprites/nezuko_jump.png',
      jump_attack: 'assets/sprites/nezuko_jump_attack.png',
      crouch: 'assets/sprites/nezuko_crouch.png',
      crouch_attack: 'assets/sprites/nezuko_crouch_attack.png',
      run1: 'assets/sprites/nezuko_run1.png',
      run2: 'assets/sprites/nezuko_run2.png',
      ultimate_pose: 'assets/sprites/nezuko_ultimate.png',
      kick: 'assets/sprites/nezuko_kick.png',
      jump_kick: 'assets/sprites/nezuko_jump_kick.png',
      crouch_kick: 'assets/sprites/nezuko_crouch_kick.png',
      ultimate_dash: 'assets/sprites/nezuko_ultimate_dash.png',
    },
    impacts: {
      sword: 'assets/effects/hit_nezuko_sword_v3.png',
      kick: 'assets/effects/hit_nezuko_kick_v3.png',
      proj: 'assets/effects/hit_nezuko_proj_v3.png',
      block: 'assets/effects/hit_nezuko_block_v3.png',
    },
    spriteUrl: 'assets/sprites/nezuko_idle.png',
    ultimateUrl: 'assets/ultimates/nezuko.png',
    swordLength: 100,
    swordColor: '#cc0044',
    swordGlow: '#ff66aa',
    auraColor: 'rgba(255, 100, 180, 0.4)',
    projectileColor: '#ff44aa',
    projectileGlow: '#ff88cc',
    speed: 6,
    jumpForce: -17,
    maxHp: 1000,
    attackDamage: 5,
    kickDamage: 6,
    projectileDamage: 11,
    ultimateDamage: 42,
    selectColor: '#ff66aa',
    description: '',
    swordPivotX: 15,
    swordPivotY: -5,
    vfxKick: 'assets/effects/vfx_kick_nezuko_v3.png',
  },
  zenitsu: {
    id: 'zenitsu',
    name: 'Zenitsu',
    displayName: 'Agatsuma Zenitsu',
    ultimateName: 'Lôi Hơi Thở - Thần Tốc',
    vfx: {
      thunder_slash1: 'assets/effects/zenitsu_vfx/vfx_zenitsu_thunder_slash1.png',
      thunder_slash2: 'assets/effects/zenitsu_vfx/vfx_zenitsu_thunder_slash2.png',
      thunder_kick: 'assets/effects/zenitsu_vfx/vfx_zenitsu_thunder_kick.png',
      thunder_proj: 'assets/effects/zenitsu_vfx/vfx_zenitsu_thunder_proj.png',
      thunder_dodge: 'assets/effects/zenitsu_vfx/vfx_zenitsu_thunder_dodge.png',
      awaken_transform: 'assets/effects/zenitsu_vfx/vfx_zenitsu_awaken_transform.png',
      awaken_aura: 'assets/effects/zenitsu_vfx/vfx_zenitsu_awaken_aura.png',
      block: 'assets/effects/zenitsu_vfx/vfx_zenitsu_block.png',
      exhaust_aura: 'assets/effects/zenitsu_vfx/vfx_zenitsu_exhaust_aura.png',
      ult1_charge: 'assets/effects/zenitsu_vfx/vfx_zenitsu_ult1_charge.png',
      ult1_attack: 'assets/effects/zenitsu_vfx/vfx_zenitsu_ult1_attack.png',
      ult2_charge: 'assets/effects/zenitsu_vfx/vfx_zenitsu_ult2_charge.png',
      ult2_attack: 'assets/effects/zenitsu_vfx/vfx_zenitsu_ult2_attack.png',
      ultimate_dash: 'assets/effects/zenitsu_vfx/vfx_zenitsu_ultimate_dash.png',
      ultimate_pose: 'assets/effects/zenitsu_vfx/vfx_zenitsu_ultimate_pose.png',
      exhaust_pose: 'assets/effects/zenitsu_vfx/vfx_zenitsu_exhaust_pose.png',
    },
    sprites: {
      idle:   'assets/sprites/zenitsu_idle.png',
      idle_attack: 'assets/sprites/zenitsu_idle_attack.png',
      jump:   'assets/sprites/zenitsu_jump.png',
      jump_attack: 'assets/sprites/zenitsu_jump_attack.png',
      crouch: 'assets/sprites/zenitsu_crouch.png',
      crouch_attack: 'assets/sprites/zenitsu_crouch_attack.png',
      run1: 'assets/sprites/zenitsu_run1.png',
      run2: 'assets/sprites/zenitsu_run2.png',
      ultimate_pose: 'assets/sprites/zenitsu_ultimate_pose.png',
      kick: 'assets/sprites/zenitsu_kick.png',
      jump_kick: 'assets/sprites/zenitsu_jump_kick.png',
      crouch_kick: 'assets/sprites/zenitsu_crouch_kick.png',
      ultimate_dash: 'assets/sprites/zenitsu_ultimate_dash.png',
      
      crouch_walk1: 'assets/sprites/zenitsu_crouch_walk1.png',
      crouch_walk2: 'assets/sprites/zenitsu_crouch_walk2.png',
      heavy_attack: 'assets/sprites/zenitsu_heavy_attack.png',
      heavy_jump_attack: 'assets/sprites/zenitsu_heavy_jump_attack.png',
      heavy_crouch_attack: 'assets/sprites/zenitsu_heavy_crouch_attack.png',
      projectile: 'assets/sprites/zenitsu_projectile.png',
      jump_projectile: 'assets/sprites/zenitsu_jump_projectile.png',
      crouch_projectile: 'assets/sprites/zenitsu_crouch_projectile.png',
      block: 'assets/sprites/zenitsu_block.png',
      
      ultimate1_charge: 'assets/sprites/zenitsu_ultimate1_charge.png',
      ultimate1_attack: 'assets/sprites/zenitsu_ultimate1_attack.png',
      ultimate2_charge: 'assets/sprites/zenitsu_ultimate2_charge.png',
      ultimate2_attack: 'assets/sprites/zenitsu_ultimate2_attack.png',
      exhaust_pose: 'assets/sprites/zenitsu_exhaust_pose.png',
    },
    impacts: {
      sword: 'assets/effects/zenitsu_vfx/impact_zenitsu_thunder_slash.png',
      kick: 'assets/effects/zenitsu_vfx/impact_zenitsu_thunder_kick.png',
      proj: 'assets/effects/zenitsu_vfx/impact_zenitsu_thunder_proj.png',
      block: 'assets/effects/zenitsu_vfx/vfx_zenitsu_block.png', 
      ult0: 'assets/effects/zenitsu_vfx/hit_zenitsu_ult0.png',
      ult1: 'assets/effects/zenitsu_vfx/hit_zenitsu_ult1.png',
      ult2: 'assets/effects/zenitsu_vfx/hit_zenitsu_ult2.png'
    },
    spriteUrl: 'assets/sprites/zenitsu_idle.png',
    ultimateUrl: 'assets/ultimates/zenitsu.png',
    cinematics: {
      ult0: 'assets/effects/zenitsu_vfx/cinematic_zenitsu_ult0.png',
      ult0_text: 'assets/effects/zenitsu_vfx/ult_text_zenitsu_ult0.png',
      ult1: 'assets/effects/zenitsu_vfx/cinematic_zenitsu_ult1.png',
      ult1_text: 'assets/effects/zenitsu_vfx/ult_text_zenitsu_ult1.png',
      ult2: 'assets/effects/zenitsu_vfx/cinematic_zenitsu_ult2.png',
      ult2_text: 'assets/effects/zenitsu_vfx/ult_text_zenitsu_ult2.png',
    },
    swordLength: 110,
    swordColor: '#ffdd00',
    swordGlow: '#ffee44',
    auraColor: 'rgba(255, 220, 0, 0.4)',
    projectileColor: '#ffdd00',
    projectileGlow: '#fff066',
    speed: 5.5,
    jumpForce: -16,
    maxHp: 4200,
    attackDamage: 40,
    kickDamage: 35,
    projectileDamage: 50,
    ultimateDamage: 320,
    selectColor: '#ffdd00',
    description: '',
    tags: ['Cơ Động', 'Sốc Sát Thương'],
    stats: {
      attack: 4,
      defense: 2,
      speed: 5,
      agility: 5,
      difficulty: 4
    },
    mechanicsDescription: `
      <div style="color:#ddd; font-family:sans-serif; font-size:13px; line-height:1.6; text-align:left;">
        <div style="color:#ffdd00; font-weight:bold; font-size:14px; border-bottom:1px solid rgba(255,221,0,0.4); padding-bottom:4px; margin-bottom:4px;">⚡ HỆ THỐNG CHIẾN ĐẤU CƠ BẢN (LÔI HƠI THỞ)</div>
        Sát thủ siêu cơ động với tốc độ nhanh nhất game (5.2 units/s). Máu mỏng (4200), đòi hỏi lối đánh Hit & Run. Cơ chế hồi Nộ: <b>Hồi siêu tốc (15 Nộ/s) khi đứng im hoặc cúi người</b>, nhưng không gồng sét khi di chuyển.<br>
        <div style="color:#ffee44; font-weight:bold; font-size:14px; border-bottom:1px solid rgba(255,238,68,0.4); padding-bottom:4px; margin-bottom:4px; margin-top:8px;">⚔️ ĐÒN ĐÁNH & CHIÊU THỨC</div>
        <b>[P] Rút Kiếm (Iaijutsu):</b> Nhấp nhả (P1) để có tốc độ chém chớp nhoáng (0.15s), đục thủng phòng ngự. Giữ phím 0.3s (P2) chém đè nặng sinh hất lùi.<br>
        <b>[K] Quét Trụ:</b> Rất triệt để khi Dùng Cúi + Đá để tạo đòn đánh quét thẳng dưới chân đối phương.<br>
        <b>[L] Sóng Chớp:</b> Phóng kiếm khí tốc độ ánh sáng ngang dọc (12 units/s), dìm đối thủ từ xa để câu giờ sạc Nộ.<br>
        <div style="color:#ffaa00; font-weight:bold; font-size:14px; border-bottom:1px solid rgba(255,170,0,0.4); padding-bottom:4px; margin-bottom:4px; margin-top:8px;">🛡 PHÒNG THỦ KHẮC NGHIỆT & COUNTER</div>
        Do thể trạng mỏng, thủ của Zenitsu chịu nhiều áp lực và dễ bị Đòn Nặng phá khối đỡ (Guard Break).<br>
        <span style="color:#ffcc00">⚠️ <b>Perfect Counter:</b></span> Timing cực hẹp (0.15s). Lách chuẩn, phản xạ <b>110 DMG</b> chớp nhoáng kèm hiệu ứng <b>Choáng Cứng 0.6s</b>.<br>
        <div style="color:#ff6600; font-weight:bold; font-size:14px; border-bottom:1px solid rgba(255,102,0,0.4); padding-bottom:4px; margin-bottom:4px; margin-top:8px;">🔥 THỨC TỈNH (CƯỜNG HOÁ TỐC ĐỘ)</div>
        <b>[U] Sợi Chỉ Đỏ (Tốn 60 Nộ):</b> Cơ thể bọc điện dương trong 9 giây. Bước di chuyển Max Speed 6.5 units/s. Toàn bộ Delay Startup & Recovery <b>GIẢM MỘT NỬA</b>! Đòn đánh chớp nhoáng hóa bóng mờ!<br>
        <div style="color:#ff4444; font-weight:bold; font-size:14px; border-bottom:1px solid rgba(255,68,68,0.4); padding-bottom:4px; margin-bottom:4px; margin-top:8px;">💥 KỸ NĂNG TỐI THƯỢNG (ULTIMATES)</div>
        <b>[I] Bích Lịch Nhất Thiển Lục Liên (Tốn 75 Nộ):</b> Tụ cầu lôi, hóa tia sét phóng 6 lần vạch xé không gian. Dồn lập 660 DMG. Khóa gục đối thủ.<br>
        <b>[O] Bát Liên Thần Tốc (Tốn 100 nộ - Tất Sát Kỹ):</b> Úp người gầm thét, phóng tốc độ thần quang 8 lần dọn sạch ván cờ. <b>Gây Siêu Sát Thương Lên Tới 1150 DMG</b>. <br>
        <span style="color:#ff2222;">🆘 QUÁ TẢI CƠ THỂ:</span> Do đứt gãy gân cốt, sau khi phóng thần tốc <b>[O]</b>, Zenitsu hoàn toàn sụp đổ ngã quỵ xuống sàn mất 3 giây. Đóng băng 100% chiêu thức, nhận thêm sát thương Trọng Kích. High Risk - High Reward tàn khốc!
      </div>
    `,
    swordPivotX: 18,
    swordPivotY: -8,
    vfxKick: 'assets/effects/vfx_kick_zenitsu_v3.png',
  },
  inosuke: {
    id: 'inosuke',
    name: 'Inosuke',
    displayName: 'Hashibira Inosuke',
    ultimateName: 'Thú Hơi Thở - Nhận Thức Không Gian',
    sprites: {
      idle:   'assets/sprites/inosuke_idle.png',
      idle_attack: 'assets/sprites/inosuke_idle_attack.png',
      jump:   'assets/sprites/inosuke_jump.png',
      jump_attack: 'assets/sprites/inosuke_jump_attack.png',
      crouch: 'assets/sprites/inosuke_crouch.png',
      crouch_attack: 'assets/sprites/inosuke_crouch_attack.png',
      run1: 'assets/sprites/inosuke_run1.png',
      run2: 'assets/sprites/inosuke_run2.png',
      ultimate_pose: 'assets/sprites/inosuke_ultimate.png',
      kick: 'assets/sprites/inosuke_kick.png',
      jump_kick: 'assets/sprites/inosuke_jump_kick.png',
      crouch_kick: 'assets/sprites/inosuke_crouch_kick.png',
      ultimate_dash: 'assets/sprites/inosuke_ultimate_dash.png',
    },
    impacts: {
      sword: 'assets/effects/hit_inosuke_sword_v3.png',
      kick: 'assets/effects/hit_inosuke_kick_v3.png',
      proj: 'assets/effects/hit_inosuke_proj_v3.png',
      block: 'assets/effects/hit_inosuke_block_v3.png',
    },
    spriteUrl: 'assets/sprites/inosuke_idle.png',
    ultimateUrl: 'assets/ultimates/inosuke.png',
    swordLength: 130,
    swordColor: '#228833',
    swordGlow: '#44ff66',
    auraColor: 'rgba(50, 220, 80, 0.4)',
    projectileColor: '#33dd55',
    projectileGlow: '#66ff88',
    speed: 5.5,
    jumpForce: -16,
    maxHp: 1000,
    attackDamage: 7,
    kickDamage: 5,
    projectileDamage: 10,
    ultimateDamage: 42,
    selectColor: '#44ff66',
    description: '',
    swordPivotX: 22,
    swordPivotY: -12,
    vfxKick: 'assets/effects/vfx_kick_inosuke_v3.png',
  },
  murata: {
    id: 'murata',
    name: 'Murata',
    displayName: 'Murata',
    ultimateName: 'Chịu Trận',
    sprites: {
      idle: 'assets/chars/murata_idle.png',
      idle_attack: 'assets/chars/murata_idle.png',
      jump: 'assets/chars/murata_idle.png',
      jump_attack: 'assets/chars/murata_idle.png',
      crouch: 'assets/chars/murata_idle.png',
      crouch_attack: 'assets/chars/murata_idle.png',
      run1: 'assets/chars/murata_idle.png',
      run2: 'assets/chars/murata_idle.png',
      crouch_walk1: 'assets/chars/murata_idle.png',
      crouch_walk2: 'assets/chars/murata_idle.png',
      kick: 'assets/chars/murata_idle.png',
      jump_kick: 'assets/chars/murata_idle.png',
      crouch_kick: 'assets/chars/murata_idle.png',
      projectile: 'assets/chars/murata_idle.png',
      jump_projectile: 'assets/chars/murata_idle.png',
      crouch_projectile: 'assets/chars/murata_idle.png',
      block: 'assets/chars/murata_idle.png',
      ultimate_pose: 'assets/chars/murata_idle.png',
      exhaust_pose: 'assets/chars/murata_idle.png'
    },
    maxHp: 10000,
    speed: 0,
    attackDamage: 0,
    knockdownResist: 9999,
    selectColor: '#888888',
    description: 'Bao cát huấn luyện',
    swordPivotX: 0,
    swordPivotY: 0
  }
};

const CHARACTER_ORDER = ['tanjiro', 'nezuko', 'zenitsu', 'inosuke'];

// Preload all images
const Images = (() => {
  const cache = {};

  function load(key, url) {
    return new Promise((resolve) => {
      if (cache[key]) { resolve(cache[key]); return; }
      const img = new Image();
      img.onload = () => { 
        // TỰ ĐỘNG XÓA NỀN ĐEN BẰNG CANVAS (Xử lý tuyệt đối lỗi Safari vẽ vòng tròn đen)
        if (key.includes('cinematic') || key.includes('impact') || key.includes('aura') || key.includes('hit_') || key.includes('vfx') || key.includes('ultra') || key.startsWith('proj_')) {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);
            
            try {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              let modified = false;
              // Xóa nền đen tuyệt đối hoặc các viền đen tàn dư
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i+1], b = data[i+2];
                if (r <= 25 && g <= 25 && b <= 25) {
                  const lum = (0.299*r + 0.587*g + 0.114*b);
                  data[i+3] = lum > 5 ? (lum/25)*255 : 0;
                  modified = true;
                }
              }
              if (modified) {
                ctx.putImageData(imageData, 0, 0);
                const newImg = new Image();
                newImg.onload = () => { cache[key] = newImg; resolve(newImg); };
                newImg.src = canvas.toDataURL('image/png');
                return;
              }
            } catch (e) {
              console.warn("Canvas cross-origin prevent extracting pixels for:", key);
            }
        }
        cache[key] = img; 
        resolve(img); 
      };
      img.onerror = () => { cache[key] = null; resolve(null); };
      img.src = url;
    });
  }

  function get(key) { return cache[key] || null; }
  function dumpKeys() { return Object.keys(cache); }

  async function preloadAll() {
    const promises = [];
    for (const id of Object.keys(CHARACTERS)) {
      const c = CHARACTERS[id];
      // Dynamically load all 8+ pose sprites defined in c.sprites
      for (const [spriteKey, spriteUrl] of Object.entries(c.sprites)) {
        if (spriteUrl) {
          promises.push(load(`sprite_${id}_${spriteKey}`, spriteUrl));
        }
      }
      
      if (c.ultimateUrl) promises.push(load(`ultimate_${id}`, c.ultimateUrl + ''));
      promises.push(load(`ult_text_${id}`, `assets/effects/ult_text_${id}.png`));
      
      if (c.cinematics) {
         for (const [key, url] of Object.entries(c.cinematics)) {
            promises.push(load(`cinematic_${id}_${key}`, url));
         }
      }
      
      promises.push(load(`aura_${id}`, `assets/effects/${id}_aura_v3.png`));
      promises.push(load(`impact_${id}`, `assets/effects/${id}_impact_v3.png`));
      promises.push(load(`vfx_${id}`, `assets/sprites/vfx_${id}.png`));
      promises.push(load(`vfx_kick_${id}`, c.vfxKick));
      promises.push(load(`proj_${id}`, `assets/effects/proj_${id}.png`));

      if (c.impacts) {
        promises.push(load(`hit_${id}_sword`, c.impacts.sword));
        promises.push(load(`hit_${id}_kick`, c.impacts.kick));
        promises.push(load(`hit_${id}_proj`, c.impacts.proj));
        promises.push(load(`hit_${id}_block`, c.impacts.block));
        
        // Explicitly load all known impact keys to guarantee they exist!
        if (c.impacts.fire_sword) promises.push(load(`hit_${id}_fire_sword`, c.impacts.fire_sword));
        if (c.impacts.fire_kick) promises.push(load(`hit_${id}_fire_kick`, c.impacts.fire_kick));
        if (c.impacts.fire_proj) promises.push(load(`hit_${id}_fire_proj`, c.impacts.fire_proj));
        if (c.impacts.ult0) promises.push(load(`hit_${id}_ult0`, c.impacts.ult0));
        if (c.impacts.ult1) promises.push(load(`hit_${id}_ult1`, c.impacts.ult1));
        if (c.impacts.ult2) promises.push(load(`hit_${id}_ult2`, c.impacts.ult2));
      }
      
      if (c.vfx) {
        for (const [vfxKey, vfxUrl] of Object.entries(c.vfx)) {
          promises.push(load(`vfx_${id}_${vfxKey}`, vfxUrl));
        }
      }
    }
    promises.push(load('bg_sagiri', 'assets/bg/bg_sagiri.png'));
    promises.push(load('bg_natagumo', 'assets/bg/bg_natagumo.png'));
    promises.push(load('bg_mugen_train', 'assets/bg/bg_mugen_train.png'));
    promises.push(load('bg_entertainment_district', 'assets/bg/bg_entertainment_district.png'));
    promises.push(load('bg_swordsmith_village', 'assets/bg/bg_swordsmith_village.png'));
    promises.push(load('bg_infinity_castle', 'assets/bg/bg_infinity_castle.png'));
    promises.push(load('bg_fujikasane', 'assets/bg/bg_fujikasane.png'));
    promises.push(load('bg_butterfly_mansion', 'assets/bg/bg_butterfly_mansion.png'));
    promises.push(load('bg_tsuzumi_mansion', 'assets/bg/bg_tsuzumi_mansion.png'));
    promises.push(load('bg_kumotori', 'assets/bg/bg_kumotori.png'));
    promises.push(load('bg_corps_hq', 'assets/bg/bg_corps_hq.png'));
    promises.push(load('bg', 'assets/bg/night_forest.png')); // Keep old bg as fallback
    await Promise.all(promises);
    
    // Debug helper
    window.__DEBUG_VFX_KEYS = Object.keys(cache).filter(k => k.startsWith('vfx_tanjiro'));
  }

  return { load, get, preloadAll, dumpKeys };
})();
