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
      ultimate_pose: 'assets/sprites/tanjiro_ultimate.png',
      kick: 'assets/sprites/tanjiro_kick.png',
      jump_kick: 'assets/sprites/tanjiro_jump_kick.png',
      crouch_kick: 'assets/sprites/tanjiro_crouch_kick.png',
      ultimate_dash: 'assets/sprites/tanjiro_ultimate_dash.png',
    },
    impacts: {
      sword: 'assets/effects/hit_tanjiro_sword_v3.png',
      kick: 'assets/effects/hit_tanjiro_kick_v3.png',
      proj: 'assets/effects/hit_tanjiro_proj_v3.png',
      block: 'assets/effects/hit_tanjiro_block_v3.png',
    },
    // Fallback legacy sprite (used in char select card)
    spriteUrl: 'assets/sprites/tanjiro_idle.png',
    ultimateUrl: 'assets/ultimates/tanjiro.png',
    swordLength: 120,
    swordColor: '#1a1a2e',
    swordGlow: '#00d4ff',
    auraColor: 'rgba(0, 180, 255, 0.4)',
    projectileColor: '#00aaff',
    projectileGlow: '#00d4ff',
    speed: 5,
    jumpForce: -16,
    maxHp: 1000,
    attackDamage: 6,
    kickDamage: 5,
    projectileDamage: 10,
    ultimateDamage: 40,
    selectColor: '#00d4ff',
    description: 'Kiếm sĩ diệt quỷ mạnh mẽ với Thủy Hơi Thở',
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
    description: 'Quỷ cô gái với thuật máu bùng cháy bí ẩn',
    swordPivotX: 15,
    swordPivotY: -5,
    vfxKick: 'assets/effects/vfx_kick_nezuko_v3.png',
  },
  zenitsu: {
    id: 'zenitsu',
    name: 'Zenitsu',
    displayName: 'Agatsuma Zenitsu',
    ultimateName: 'Lôi Hơi Thở - Tốc Độ Thần',
    sprites: {
      idle:   'assets/sprites/zenitsu_idle.png',
      idle_attack: 'assets/sprites/zenitsu_idle_attack.png',
      jump:   'assets/sprites/zenitsu_jump.png',
      jump_attack: 'assets/sprites/zenitsu_jump_attack.png',
      crouch: 'assets/sprites/zenitsu_crouch.png',
      crouch_attack: 'assets/sprites/zenitsu_crouch_attack.png',
      run1: 'assets/sprites/zenitsu_run1.png',
      run2: 'assets/sprites/zenitsu_run2.png',
      ultimate_pose: 'assets/sprites/zenitsu_ultimate.png',
      kick: 'assets/sprites/zenitsu_kick.png',
      jump_kick: 'assets/sprites/zenitsu_jump_kick.png',
      crouch_kick: 'assets/sprites/zenitsu_crouch_kick.png',
      ultimate_dash: 'assets/sprites/zenitsu_ultimate_dash.png',
    },
    impacts: {
      sword: 'assets/effects/hit_zenitsu_sword_v3.png',
      kick: 'assets/effects/hit_zenitsu_kick_v3.png',
      proj: 'assets/effects/hit_zenitsu_proj_v3.png',
      block: 'assets/effects/hit_zenitsu_block_v3.png',
    },
    spriteUrl: 'assets/sprites/zenitsu_idle.png',
    ultimateUrl: 'assets/ultimates/zenitsu.png',
    swordLength: 110,
    swordColor: '#ffcc00',
    swordGlow: '#ffee44',
    auraColor: 'rgba(255, 220, 0, 0.4)',
    projectileColor: '#ffdd00',
    projectileGlow: '#fff066',
    speed: 7,
    jumpForce: -15,
    maxHp: 1000,
    attackDamage: 7,
    kickDamage: 4,
    projectileDamage: 12,
    ultimateDamage: 44,
    selectColor: '#ffdd00',
    description: 'Tốc độ sét đánh với Nhất Kiếm Vũ',
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
    description: 'Chiến binh hoang dã với song kiếm răng cưa',
    swordPivotX: 22,
    swordPivotY: -12,
    vfxKick: 'assets/effects/vfx_kick_inosuke_v3.png',
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
      img.onload = () => { cache[key] = img; resolve(img); };
      img.onerror = () => { cache[key] = null; resolve(null); };
      img.src = url;
    });
  }

  function get(key) { return cache[key] || null; }

  async function preloadAll() {
    const promises = [];
    for (const id of CHARACTER_ORDER) {
      const c = CHARACTERS[id];
      // Load all 8 pose sprites
      promises.push(load(`sprite_${id}_idle`,   c.sprites.idle));
      promises.push(load(`sprite_${id}_idle_attack`, c.sprites.idle_attack));
      promises.push(load(`sprite_${id}_jump`,   c.sprites.jump));
      promises.push(load(`sprite_${id}_jump_attack`, c.sprites.jump_attack + ''));
      promises.push(load(`sprite_${id}_crouch`, c.sprites.crouch));
      promises.push(load(`sprite_${id}_crouch_attack`, c.sprites.crouch_attack));
      promises.push(load(`sprite_${id}_run1`, c.sprites.run1));
      promises.push(load(`sprite_${id}_run2`, c.sprites.run2));
      promises.push(load(`sprite_${id}_ultimate_pose`, c.sprites.ultimate_pose));
      promises.push(load(`sprite_${id}_ultimate_dash`, c.sprites.ultimate_dash));
      promises.push(load(`sprite_${id}_kick`, c.sprites.kick));
      promises.push(load(`sprite_${id}_jump_kick`, c.sprites.jump_kick));
      promises.push(load(`sprite_${id}_crouch_kick`, c.sprites.crouch_kick));
      promises.push(load(`ultimate_${id}`, c.ultimateUrl + ''));
      promises.push(load(`aura_${id}`, `assets/effects/${id}_aura_v3.png`));
      promises.push(load(`impact_${id}`, `assets/effects/${id}_impact_v3.png`));
      promises.push(load(`vfx_${id}`, `assets/sprites/vfx_${id}.png`));
      promises.push(load(`vfx_kick_${id}`, c.vfxKick));

      if (c.impacts) {
        promises.push(load(`hit_${id}_sword`, c.impacts.sword));
        promises.push(load(`hit_${id}_kick`, c.impacts.kick));
        promises.push(load(`hit_${id}_proj`, c.impacts.proj));
        promises.push(load(`hit_${id}_block`, c.impacts.block));
      }
    }
    promises.push(load('bg', 'assets/bg/night_forest.png'));
    await Promise.all(promises);
  }

  return { load, get, preloadAll };
})();
