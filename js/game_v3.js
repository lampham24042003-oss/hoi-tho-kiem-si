// game.js - Core 2D Fighting Game Engine
'use strict';

const GROUND_Y_RATIO = 0.80; // ground at 80% canvas height
const GRAVITY = 0.55;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;

// ── Energy System Constants ─────────────────────────────────
const ENERGY_REGEN_PER_FRAME = 0.10;  // ~17s to fill from 0 at 60fps
const ENERGY_COST_ATTACK     = 2;     // P - sword attack (very small)
const ENERGY_COST_KICK       = 2;     // K - kick (very small)
const ENERGY_COST_PROJECTILE = 8;     // L - projectile (small)
const ENERGY_DRAIN_BLOCK     = 0.05;  // B (minimal drain per frame)
const ENERGY_BONUS_HIT_RECV  = 6;     // bonus when YOU get hit
const ENERGY_BONUS_HIT_LAND  = 4;     // bonus when YOUR attack lands
const MAX_ENERGY = 100;
const ENERGY_COST_ULTIMATE   = 85;    // Q - drains most energy (not all, avoids empty lock)
const FLOOR_THICKNESS = 6;

// ═══════════════════════════════════════════════════════════════
// Fighter class
// ═══════════════════════════════════════════════════════════════
class Fighter {
  constructor(charData, isP2, x, canvasH, facingRight) {
    this.charData = charData;
    this.isP2 = isP2;
    this.facingRight = facingRight;

    // Size
    this.w = 80;
    this.h = 130;

    // Position
    this.x = x;
    this.groundY = canvasH * GROUND_Y_RATIO;
    this.y = this.groundY - this.h;
    this.vy = 0;
    this.onGround = true;

    // Stats
    this.hp = charData.maxHp;
    this.energy = MAX_ENERGY;  // start FULL

    // State flags
    this.isCrouching = false;
    this.isJumping = false;
    this.isAttacking = false;
    this.isKicking = false;
    this.isBlocking = false;
    this.blockTime = 0;
    this.isDodging = false;
    this.isKnockedDown = false;
    this.isUltimate = false;
    this.isDead = false;
    this.isMoving = false;
    this.isUltimateStance = false;
    this.isUltimateDash = false;
    this.ultimateDashTimer = 0;
    this.ultimateDashTargetX = 0;
    this.ultimateDashTarget = null;

    // Attack timers
    this.attackTimer = 0;
    this.attackDuration = 20;
    this.kickTimer = 0;
    this.kickDuration = 18;
    this.dodgeTimer = 0;
    this.dodgeDuration = 22;
    this.knockdownTimer = 0;
    this.invincibleTimer = 0;
    this.hitFlash = 0;

    // Sword
    this.swordAngle = 0; // radians: 0 = horizontal pointing right
    this.swordTargetAngle = 0;
    this.swordLength = charData.swordLength;
    this.swordSwingProgress = 0; // 0-1 during attack

    // Projectiles fired by this fighter
    this.projectiles = [];

    // Walk bobbing for idle animation
    this.bobTimer = 0;

    // Combo state
    this.comboCount = 0;
    this.comboTimer = 0;

    // Sprites (8 states)
    this.sprites = {
      idle: null, idle_attack: null,
      jump: null, jump_attack: null,
      crouch: null, crouch_attack: null,
      run1: null, run2: null
    };

    // Input debounce
    this._prevKeys = {};
  }

  loadSprites() {
    const id = this.charData.id;
    this.sprites.idle   = Images.get(`sprite_${id}_idle`);
    this.sprites.idle_attack = Images.get(`sprite_${id}_idle_attack`);
    this.sprites.jump   = Images.get(`sprite_${id}_jump`);
    this.sprites.jump_attack = Images.get(`sprite_${id}_jump_attack`);
    this.sprites.crouch = Images.get(`sprite_${id}_crouch`);
    this.sprites.crouch_attack = Images.get(`sprite_${id}_crouch_attack`);
    this.sprites.run1   = Images.get(`sprite_${id}_run1`);
    this.sprites.run2   = Images.get(`sprite_${id}_run2`);
    this.sprites.ultimate_pose = Images.get(`sprite_${id}_ultimate_pose`);
    this.sprites.ultimate_dash = Images.get(`sprite_${id}_ultimate_dash`);
    
    // Kick sprites
    this.sprites.kick = Images.get(`sprite_${id}_kick`);
    this.sprites.jump_kick = Images.get(`sprite_${id}_jump_kick`);
    this.sprites.crouch_kick = Images.get(`sprite_${id}_crouch_kick`);
  }

  // Backwards-compat alias
  loadSprite() { this.loadSprites(); }

  _getCurrentSprite() {
    if (this.isUltimateDash && this.sprites.ultimate_dash) return this.sprites.ultimate_dash;
    if (this.isUltimateStance && this.sprites.ultimate_pose) return this.sprites.ultimate_pose;
    if (this.isDodging && this.sprites.crouch) return this.sprites.crouch;
    if (!this.onGround || this.isJumping) {
      if (this.isKicking && this.sprites.jump_kick) return this.sprites.jump_kick;
      return this.isAttacking ? this.sprites.jump_attack : this.sprites.jump;
    }
    if (this.isCrouching) {
      if (this.isKicking && this.sprites.crouch_kick) return this.sprites.crouch_kick;
      return this.isAttacking ? this.sprites.crouch_attack : this.sprites.crouch;
    }
    
    if (this.isKicking && this.sprites.kick) return this.sprites.kick;
    if (this.isAttacking) return this.sprites.idle_attack;

    // Movement (Run animation)
    if (this.isMoving && !this.isDodging && !this.isBlocking && !this.isAttacking && !this.isKicking) {
      const runIndex = Math.floor(Date.now() / 120) % 2;
      return runIndex === 0 ? this.sprites.run1 : this.sprites.run2;
    }

    return this.sprites.idle;
  }

  get centerX() { return this.x + this.w / 2; }
  get centerY() { return this.y + this.h / 2; }

  get swordPivotWorld() {
    const px = this.centerX + (this.facingRight ? this.charData.swordPivotX : -this.charData.swordPivotX);
    const py = this.centerY + this.charData.swordPivotY;
    return { x: px, y: py };
  }

  get swordTipWorld() {
    const pivot = this.swordPivotWorld;
    const dir = this.facingRight ? 1 : -1;
    const angle = this.swordAngle * dir;
    return {
      x: pivot.x + Math.cos(angle) * this.swordLength * dir,
      y: pivot.y + Math.sin(angle) * this.swordLength
    };
  }

  get attackHitbox() {
    if (!this.isAttacking) return null;
    const tip = this.swordTipWorld;
    const pivot = this.swordPivotWorld;
    // Hitbox along sword
    return {
      x: Math.min(tip.x, pivot.x) - 10,
      y: Math.min(tip.y, pivot.y) - 10,
      w: Math.abs(tip.x - pivot.x) + 20,
      h: Math.abs(tip.y - pivot.y) + 20,
    };
  }

  getCurrentAttackDamage() {
    return this.charData.attackDamage || 10;
  }

  getCurrentKickDamage() {
    return this.charData.kickDamage || 10;
  }

  getCurrentProjectileDamage() {
    return this.charData.projectileDamage || 15;
  }

  getCurrentUltimateDamage() {
    return this.charData.ultimateDamage || 150;
  }

  getCurrentUltimateKnockdown() {
    return 100;
  }

  onUltimateComplete(target) {
    // Override in subclasses for exhaustion/buff mechanics after ult finishes
  }

  getEnergyRegenRate() {
    return ENERGY_REGEN_PER_FRAME;
  }

  get kickHitbox() {
    if (!this.isKicking) return null;
    const dir = this.facingRight ? 1 : -1;
    const kickProgress = this.kickTimer / this.kickDuration;
    const reach = kickProgress < 0.5 ? kickProgress * 2 : 2 - kickProgress * 2;
    return {
      x: this.centerX + dir * (30 + reach * 50) - 25,
      y: this.y + this.h * 0.55,
      w: 60,
      h: 40,
    };
  }

  get bodyHitbox() {
    if (this.isCrouching) {
      return { x: this.x + 8, y: this.y + this.h * 0.4, w: this.w - 16, h: this.h * 0.6 };
    }
    return { x: this.x + 8, y: this.y + 8, w: this.w - 16, h: this.h - 8 };
  }

  getCurrentSpeed() {
    return this.charData.speed || 5;
  }

  applyKeys(keys, canvasW) {
    if (this.isDead || this.isKnockedDown || this.isUltimate) return;

    const prev = this._prevKeys;

    // ── DODGE ──────────────────────────────────────────────────
    if (keys.dodge && !prev.dodge && !this.isDodging) {
      this.isDodging = true;
      this.dodgeTimer = this.dodgeDuration;
      this.invincibleTimer = this.dodgeDuration;
      AudioManager.dodge();
    }

    // ── BLOCK ──────────────────────────────────────────────────
    const wasBlocking = this.isBlocking;
    this.isBlocking = keys.block && this.onGround && !this.isAttacking && !this.isKicking && !this.isDodging;
    if (this.isBlocking && !wasBlocking) {
      this.blockTime = 0;
    } else if (this.isBlocking) {
      this.blockTime += 1/60; // Approximate dt
    }

    // ── MOVEMENT ───────────────────────────────────────────────
    this.isMoving = false;
    if (!this.isBlocking) {
    let moved = false;
    const currentSpeed = this.getCurrentSpeed();
    if (keys.moveLeft && !this.isDodging) {
      this.x -= currentSpeed;
      this.facingRight = false;
      moved = true;
      this.isMoving = true;
    }
    if (keys.moveRight && !this.isDodging) {
      this.x += currentSpeed;
      this.facingRight = true;
      moved = true;
      this.isMoving = true;
    }
      if (moved) this.bobTimer += 0.25;

      // Dodge movement
      if (this.isDodging) {
        const dir = this.facingRight ? 1 : -1;
        this.x += dir * 8;
      }
    }

    // ── CROUCH ─────────────────────────────────────────────────
    if (!this.isJumping) {
      const wasCrouching = this.isCrouching;
      this.isCrouching = keys.crouch && this.onGround;
      if (this.isCrouching && !wasCrouching) {
        // Shift down visually
        this.y = this.groundY - this.h * 0.65;
      } else if (!this.isCrouching && wasCrouching) {
        this.y = this.groundY - this.h;
      }
    }

    // ── JUMP ───────────────────────────────────────────────────
    if (keys.jump && !prev.jump && this.onGround && !this.isCrouching) {
      this.vy = this.charData.jumpForce;
      this.onGround = false;
      this.isJumping = true;
      this.isCrouching = false;
      AudioManager.jump();
    }

    // ── ATTACK (P) ─────────────────────────────────────────────
    if (keys.attack && !prev.attack && !this.isAttacking && !this.isKicking) {
      this.isAttacking = true;
      this.attackTimer = this.attackDuration;
      this.swordSwingProgress = 0;
      AudioManager.slash();
      this.energy = Math.max(0, this.energy - ENERGY_COST_ATTACK);
    }

    // ── KICK (K) ───────────────────────────────────────────────
    if (keys.kick && !prev.kick && !this.isKicking && !this.isAttacking) {
      this.isKicking = true;
      this.kickTimer = this.kickDuration;
      AudioManager.kick();
      this.energy = Math.max(0, this.energy - ENERGY_COST_KICK);
    }

    // ── PROJECTILE (L) ─────────────────────────────────────────
    if (keys.projectile && !prev.projectile && !this.isAttacking && this.energy >= ENERGY_COST_PROJECTILE) {
      this._fireProjectile();
      this.energy = Math.max(0, this.energy - ENERGY_COST_PROJECTILE);
    }

    // ── ULTIMATE (Q) ───────────────────────────────────────────
    if (keys.ultimate && !prev.ultimate && this.energy >= MAX_ENERGY && !this.isUltimate) {
      this._triggerUltimate();
    }

    // ── BLOCK ENERGY DRAIN ─────────────────────────────────────
    if (this.isBlocking) {
      this.energy = Math.max(0, this.energy - ENERGY_DRAIN_BLOCK);
    }

    // Boundary clamp
    this.x = Math.max(0, Math.min(canvasW - this.w, this.x));

    // Save previous keys for next frame (edge detection)
    this._prevKeys = { ...keys };
  }

  _gainEnergy(amount) {
    const wasMax = this.energy >= MAX_ENERGY;
    this.energy = Math.min(MAX_ENERGY, this.energy + amount);
    if (!wasMax && this.energy >= MAX_ENERGY) AudioManager.energyCharge();
  }

  _fireProjectile() {
    const pivot = this.swordPivotWorld;
    const dir = this.facingRight ? 1 : -1;
    AudioManager.projectile();

    // Spawn cách vị trí hiện tại ít nhất 40px để tránh spawn thẳng trong hitbox mục tiêu khi đứng gần
    const spawnX = pivot.x + dir * 40;

    this.projectiles.push({
      x: spawnX,
      y: pivot.y,
      vx: dir * 9,
      vy: 0,
      w: 80,
      h: 80,
      life: 1.0,
      color: this.charData.projectileColor,
      glow: this.charData.projectileGlow,
      damage: this.getCurrentProjectileDamage(),
      owner: this,
      trailParticles: []
    });
  }

  _triggerUltimate() {
    this.isUltimate = true;
    this.energy = Math.max(0, this.energy - ENERGY_COST_ULTIMATE);
    AudioManager.ultimate();
  }

  takeDamage(amount, knockback = 0) {
    if (this.invincibleTimer > 0 || this.isDead) return 'none';
    if (this.isDummy) {
      knockback = 0;
    }
    if (this.isBlocking) {
      if (this.blockTime <= 0.20) { // 0.2s counter window
        AudioManager.heavyHit();
        Effects.screenShake(6);
        return 'countered';
      }
      AudioManager.block();
      Effects.screenShake(3);
      // 80% damage reduction on normal block
      const actualDamage = amount * 0.2;
      this.hp = Math.max(0, this.hp - actualDamage);
      Effects.floatingText(this.centerX, this.y + 20, Math.floor(actualDamage), 'damage');
      
      if (this.hp <= 0) {
        this.die();
        return 'killed';
      }
      return 'blocked'; 
    }

    // In training mode, HP never drops below 1 to prevent death interrupts
    const minHp = this.isTraining ? 1 : 0;
    this.hp = Math.max(minHp, this.hp - amount);

    Effects.floatingText(this.centerX, this.y + 20, Math.floor(amount), 'damage');

    // Being hit gives energy bonus
    this._gainEnergy(ENERGY_BONUS_HIT_RECV);
    this.hitFlash = 8;
    Effects.screenShake(amount > 30 ? 12 : 6);
    Effects.flashScreen('white', amount > 30 ? 0.5 : 0.25);

    if (knockback !== 0) {
      this.x += knockback;
      this.vy = -5;
      if (this.onGround) { this.vy = -8; this.onGround = false; }
    }

    if (this.hp <= 0 && !this.isTraining) {
      this.hp = 0;
      this.isDead = true;
    }
    return 'hit';
  }

  knockdown(duration = 90) {
    if (this.isDummy) return;
    this.isKnockedDown = true;
    this.knockdownTimer = duration;
    this.vy = -10;
    this.onGround = false;
    this.isAttacking = false;
    this.isKicking = false;
    this.isBlocking = false;
  }

  heal(amount) {
    if (this.isDead || this.hp <= 0) return;
    const actualHeal = Math.min(amount, this.charData.maxHp - this.hp);
    if (actualHeal > 0) {
      this.hp += actualHeal;
      Effects.floatingText(this.centerX, this.y + 30, Math.floor(actualHeal), 'heal');
    }
  }

  update(canvasW, canvasH) {
    if (this.isDead) return;

    this.groundY = canvasH * GROUND_Y_RATIO;

    // ── Passive Energy Regen ───────────────────────────────────
    if (!this.isUltimate && !this.isKnockedDown && !this.isAttacking && !this.isKicking) {
      this._gainEnergy(this.getEnergyRegenRate());
    }

    // ── Physics ────────────────────────────────────────────────
    if (!this.onGround) {
      this.vy += GRAVITY;
      this.y += this.vy;
      const targetGroundY = this.isCrouching ? this.groundY - this.h * 0.65 : this.groundY - this.h;
      if (this.y >= targetGroundY) {
        this.y = targetGroundY;
        this.vy = 0;
        this.onGround = true;
        this.isJumping = false;
      }
    }

    // ── Attack timers ──────────────────────────────────────────
    if (this.isAttacking) {
      this.attackTimer--;
      this.swordSwingProgress = 1 - this.attackTimer / this.attackDuration;
      // Sword swings from -40° → +60° (down-swing)
      const swingAngle = -0.7 + this.swordSwingProgress * 1.9;
      this.swordAngle = swingAngle;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        this.swordAngle = 0;
      }
    } else {
      // Idle sword hover
      this.swordAngle += (this._idleSwordAngle() - this.swordAngle) * 0.1;
    }

    if (this.isKicking) {
      this.kickTimer--;
      if (this.kickTimer <= 0) this.isKicking = false;
    }

    if (this.isDodging) {
      this.dodgeTimer--;
      if (this.dodgeTimer <= 0) this.isDodging = false;
    }

    if (this.isKnockedDown) {
      this.knockdownTimer--;
      if (this.knockdownTimer <= 0) {
        this.isKnockedDown = false;
        this.invincibleTimer = 60; // brief invincibility on get-up
      }
    }

    if (this.invincibleTimer > 0) this.invincibleTimer--;
    if (this.hitFlash > 0) this.hitFlash--;
    if (this.comboTimer > 0) this.comboTimer--;
    else this.comboCount = 0;

    // ── Flinch countdown ────────────────────────────────────────
    // isFlinching được set bởi các character-specific ultimate combos.
    // Nếu không có countdown thì isFlinching bị kẹt vĩnh viễn → lock input.
    if (this.isFlinching && this.flinchTimer !== undefined) {
      if (this.flinchTimer > 0) {
        this.flinchTimer--;
      } else {
        this.isFlinching = false;
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.008;
      if (p.x < -100 || p.x > canvasW + 100 || p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  _idleSwordAngle() {
    // Slight downward rest angle
    return this.onGround ? 0.3 : -0.2;
  }

  draw(ctx, canvasW, canvasH) {
    if (this.isDead && !this.isKnockedDown) {
      this._drawDefeated(ctx);
      return;
    }

    ctx.save();

    const shake = Effects.getShake();
    const cx = this.centerX + shake.x;
    const cy = this.centerY + shake.y;

    // Kỹ thuật tối ưu (Optimized Hit Flash): KHÔNG dùng ctx.filter vì trên ảnh 1024x1024 sẽ lòi RAM
    let isFlashing = (this.hitFlash > 0 && this.hitFlash % 2 === 0);

    // Ghost trail when dodging
    if (this.isDodging) {
      ctx.globalAlpha = 0.3;
      this._drawCharacterSprite(ctx, cx - (this.facingRight ? 20 : -20), cy, 0.85);
      ctx.globalAlpha = 1.0;
    }

    // Tối ưu hóa (Optimized Aura Glow): Rollback về thuật toán gốc ShadowBlur của Game.
    // Lỗi viền đen và bóng mờ kỳ dị hoàn toàn là do các thuật toán vẽ thủ công trước đó.
    // Engine gốc đã xử lý việc này hoàn hảo nhất.
    if (this.energy >= MAX_ENERGY) {
      const t = Date.now() / 500;
      ctx.shadowColor = this.charData.swordGlow || '#ffffff';
      ctx.shadowBlur = 20 + Math.sin(t) * 10;
    }

    // Draw character body
    if (isFlashing) {
      // Cách flash siêu nhẹ: vẽ sprite với globalComposite = 'lighter' và sáng tối đa
      ctx.save();
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'lighter';
      this._drawCharacterSprite(ctx, cx, cy, 1.0);
      this._drawCharacterSprite(ctx, cx, cy, 1.0);
      ctx.restore();
    } else {
      this._drawCharacterSprite(ctx, cx, cy, 1.0);
    }

    // Draw ultimate dash aura
    if (this.isUltimateDash) {
      const auraImg = Images.get(`aura_${this.charData.id}`);
      if (auraImg) {
        ctx.save();
        
        // PNG aura đã được pixel-scrubbed lúc preload để xóa nền đen.
        // Dùng source-over là safe nhất cho transparent PNG.
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        
        ctx.translate(cx, cy);
        if (!this.facingRight) ctx.scale(-1, 1);
        
        const sz = this.h * 1.5; // Size vừa phải, bao bọc sát người
        ctx.drawImage(auraImg, -sz/2, -sz/2 - 20, sz, sz);
        ctx.restore();
      }
    }

    // Reset filter
    ctx.filter = 'none';
    ctx.shadowBlur = 0;

    // Slash VFX integrated sweep
    if (this.isAttacking && this.swordSwingProgress > 0) {
      this._drawSlashVFX(ctx, cx, cy);
    }

    // Draw kick effect
    if (this.isKicking) {
      this._drawKickEffect(ctx);
    }

    // Draw projectiles
    for (const p of this.projectiles) {
      this._drawProjectile(ctx, p);
    }

    // Blocking shield shimmer
    if (this.isBlocking) {
      this._drawBlockShield(ctx);
    }

    ctx.restore();
  }

  _drawCharacterSprite(ctx, cx, cy, scale) {
    // Pick correct pose sprite
    const sprite = this._getCurrentSprite();

    ctx.save();
    ctx.translate(cx, cy);
    if (!this.facingRight) ctx.scale(-1, 1);

    // Bob animation (only when walking on ground)
    const bobY = (this.onGround && !this.isCrouching) ? Math.sin(this.bobTimer) * 2 : 0;

    // All poses drawn at the SAME height — crouch image already shows the
    // character in a low stance, so we do NOT shrink the sprite.
    let drawH = this.h * scale;
    const drawW = (sprite ? (sprite.width / sprite.height) * drawH : this.w);

    // Slight tilt in the air (if not dodging or knocked down)
    if (!this.onGround || this.isJumping) {
      if (!this.isDodging && !this.isKnockedDown) ctx.rotate(-0.12);
    }
    
    // Knocked down rotation
    if (this.isKnockedDown) ctx.rotate(1.4);

    // Full 360 Forward Roll when Dodging
    if (this.isDodging) {
      const progress = (this.dodgeDuration - this.dodgeTimer) / this.dodgeDuration;
      ctx.rotate(progress * Math.PI * 2);
    }

    if (sprite) {
      // Bottom-anchor: sprite bottom aligns with character feet (at +drawH/2)
      ctx.drawImage(sprite, -drawW / 2, -drawH / 2 + bobY, drawW, drawH);
    } else {
      ctx.fillStyle = this.charData.selectColor;
      ctx.fillRect(-drawW / 2, -drawH / 2 + bobY, drawW, drawH);
    }

    ctx.restore();
  }

  _drawSlashVFX(ctx, cx, cy) {
    const vfx = Images.get(`vfx_${this.charData.id}`);
    if (!vfx) return;

    ctx.save();
    ctx.translate(cx, cy);
    
    const dir = this.facingRight ? 1 : -1;
    ctx.scale(dir, 1);

    // Swing logic: fade in quickly, sweep down, then fade out
    if (this.swordSwingProgress < 0.2) {
      ctx.globalAlpha = this.swordSwingProgress / 0.2;
    } else if (this.swordSwingProgress > 0.7) {
      ctx.globalAlpha = Math.max(0, 1 - (this.swordSwingProgress - 0.7) / 0.3);
    } else {
      ctx.globalAlpha = 1.0;
    }

    ctx.shadowColor = this.charData.swordGlow || '#00d4ff';
    ctx.shadowBlur = 15;

    // Rotate the slash slightly based on pose
    if (!this.onGround || this.isJumping) {
      ctx.rotate(0.2);
    } else if (this.isCrouching) {
      ctx.rotate(-0.3);
    }

    const drawW = 110;
    const drawH = drawW * (vfx.height / vfx.width);
    
    // Animate downward swipe motion based on swing progress
    const vx = 40; 
    const vy = -25 + (this.swordSwingProgress * 50);

    ctx.drawImage(vfx, vx - drawW/2, vy - drawH/2, drawW, drawH);

    ctx.restore();
  }

  _drawKickEffect(ctx) {
    const vfx = Images.get(`vfx_kick_${this.charData.id}`);
    if (!vfx) return;

    const progress = 1 - this.kickTimer / this.kickDuration;
    const dir = this.facingRight ? 1 : -1;
    
    // Position of the foot
    const kickY = this.y + this.h * 0.65; // Knee/Foot level

    ctx.save();
    
    // Use screen mode for VFX glow since background is pitch black
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = Math.max(0, 1 - progress);
    
    ctx.translate(this.centerX, kickY);
    
    // Rotate the slash depending on the pose and direction
    let angle = dir === 1 ? -0.2 : Math.PI + 0.2;
    if (!this.onGround || this.isJumping) angle += dir * 0.3;
    if (this.isCrouching) angle -= dir * 0.4;
    ctx.rotate(angle);
    
    const drawW = 100 + progress * 50; // Expands outward
    const drawH = drawW * (vfx.height / vfx.width);
    
    // Animate the image offset to travel outward
    const vx = 10 + progress * 40;
    
    ctx.drawImage(vfx, vx, -drawH/2, drawW, drawH);

    ctx.restore();
  }

  _drawProjectile(ctx, p) {
    CharEffects.drawProjectile(ctx, p);
  }

  _drawBlockShield(ctx) {
    const sh = Effects.getShake();
    const t = Date.now() / 400;
    const dir = this.facingRight ? 1 : -1;

    // Vị trí: phía trước nhân vật (hướng mặt)
    const cx = this.centerX + dir * 45 + sh.x;
    const cy = this.centerY + sh.y;

    // Lấy ảnh block PNG của nhân vật (hit_{charId}_block)
    const blockImg = Images.get(`hit_${this.charData.id}_block`);

    ctx.save();
    // Không bao giờ set shadowBlur trước drawImage — an toàn tuyệt đối
    ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.globalCompositeOperation = 'source-over';

    if (blockImg) {
      // Hiển thị PNG block effect với pulse animation
      const pulse = 0.75 + Math.sin(t * 3) * 0.12; // nhịp đập nhẹ
      const alpha = 0.75 + Math.sin(t * 2.5) * 0.15;

      const sz = this.h * 1.4 * pulse; // Size phủ vừa nhân vật
      const imgRatio = blockImg.width / blockImg.height;
      const drawW = sz * imgRatio;
      const drawH = sz;

      ctx.globalAlpha = alpha;

      // Flip theo hướng nhân vật nhìn
      ctx.translate(cx, cy);
      if (!this.facingRight) ctx.scale(-1, 1);

      ctx.drawImage(blockImg, -drawW / 2, -drawH / 2, drawW, drawH);

    } else {
      // Fallback nếu ảnh chưa load: vẽ 1 ring đơn giản (không shadow)
      const pulse = 0.6 + Math.sin(t * 3) * 0.15;
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = this.charData.swordGlow || '#aaccff';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(0,0,0,0)';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.beginPath();
      ctx.arc(cx, cy, 45, 0, Math.PI * 1.99);
      ctx.stroke();
    }

    ctx.restore();
  }

  _drawDefeated(ctx) {
    const sh = Effects.getShake();
    const cx = this.centerX + sh.x;
    const cy = this.groundY + sh.y;

    ctx.save();
    ctx.translate(cx, cy - 20);
    if (!this.facingRight) ctx.scale(-1, 1);
    ctx.rotate(1.5); // lying down

    const sprite = this.sprite || Images.get(`sprite_${this.charData.id}`);
    if (sprite) {
      const drawH = this.h * 0.5;
      const drawW = (sprite.width / sprite.height) * drawH;
      ctx.globalAlpha = 0.6;
      ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
    }
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════
// Game Engine
// ═══════════════════════════════════════════════════════════════
class GameEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;

    this.mode = options.mode || 'offline'; // 'offline' | 'online'
    this.difficulty = options.difficulty || 'medium';
    this.p1CharId = options.p1Char || 'tanjiro';
    this.p2CharId = options.p2Char || 'nezuko';
    this.onlineRole = options.onlineRole || 'host'; // 'host' | 'guest'

    this.state = 'countdown'; // 'countdown' | 'playing' | 'paused' | 'ultimate' | 'ended'
    this.countdownTimer = 180; // 3 seconds at 60fps
    this.roundTimer = 60 * 99; // 99 seconds
    this.winner = null;
    this.rafId = null;
    this.paused = false;
    this.onGameEnd = options.onGameEnd || (() => {});

    // Create fighters
    const p1Data = CHARACTERS[this.p1CharId];
    const p2Data = CHARACTERS[this.p2CharId];
    
    if (p1Data.id === 'tanjiro') {
      this.p1 = new TanjiroFighter(p1Data, false, canvas.width * 0.25, canvas.height, true);
    } else if (p1Data.id === 'zenitsu') {
      this.p1 = new ZenitsuFighter(p1Data, false, canvas.width * 0.25, canvas.height, true);
    } else if (p1Data.id === 'inosuke') {
      this.p1 = new InosukeFighter(p1Data, false, canvas.width * 0.25, canvas.height, true);
    } else if (p1Data.id === 'nezuko') {
      this.p1 = new NezukoFighter(p1Data, false, canvas.width * 0.25, canvas.height, true);
    } else {
      this.p1 = new Fighter(p1Data, false, canvas.width * 0.25, canvas.height, true);
    }
    
    if (p2Data.id === 'tanjiro') {
      this.p2 = new TanjiroFighter(p2Data, true, canvas.width * 0.75, canvas.height, false);
    } else if (p2Data.id === 'zenitsu') {
      this.p2 = new ZenitsuFighter(p2Data, true, canvas.width * 0.75, canvas.height, false);
    } else if (p2Data.id === 'inosuke') {
      this.p2 = new InosukeFighter(p2Data, true, canvas.width * 0.75, canvas.height, false);
    } else if (p2Data.id === 'nezuko') {
      this.p2 = new NezukoFighter(p2Data, true, canvas.width * 0.75, canvas.height, false);
    } else {
      this.p2 = new Fighter(p2Data, true, canvas.width * 0.75, canvas.height, false);
    }
    
    if (this.mode === 'training') {
      this.p1.isTraining = true;
      this.p2.isTraining = true;
      this.p2.isDummy = true;
    }

    this.p1.loadSprites();
    this.p2.loadSprites();

    // AI
    this.ai = null;
    if (this.mode === 'offline') {
      this.ai = new AIController(this.difficulty, this.p2, this.p1);
    }

    // Input state
    this.keys = {
      moveLeft: false, moveRight: false, jump: false, crouch: false,
      attack: false, kick: false, dodge: false, projectile: false,
      block: false, ultimate: false, powerup: false, ult1: false, ult2: false
    };
    this.aiKeys = {
      moveLeft: false, moveRight: false, jump: false, crouch: false,
      attack: false, kick: false, dodge: false, projectile: false,
      block: false, ultimate: false, powerup: false, ult1: false, ult2: false
    };

    // Background
    this.bgImage = Images.get(options.bgId || 'bg_sagiri');

    // Bind input
    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);
    document.addEventListener('keydown', this._boundKeyDown);
    document.addEventListener('keyup', this._boundKeyUp);
  }

  _onKeyDown(e) {
    switch (e.code) {
      case 'KeyA': this.keys.moveLeft = true; break;
      case 'KeyD': this.keys.moveRight = true; break;
      case 'KeyW': this.keys.jump = true; break;
      case 'KeyS': this.keys.crouch = true; break;
      case 'KeyJ': this.keys.attack = true; break; // Legacy was P
      case 'KeyK': this.keys.kick = true; break;
      case 'Space': this.keys.dodge = true; e.preventDefault(); break;
      case 'KeyL': this.keys.projectile = true; break;
      case 'KeyB': this.keys.block = true; break;
      case 'KeyU': this.keys.powerup = true; break;
      case 'KeyI': this.keys.ult1 = true; break;
      case 'KeyO': this.keys.ult2 = true; break;
      case 'KeyQ': this.keys.ultimate = true; break; // Legacy generic ultimate
      case 'KeyP': this.keys.attack = true; break; // Keep legacy P for P2/old compat
      case 'Escape': this.togglePause(); break;
    }
  }

  _onKeyUp(e) {
    switch (e.code) {
      case 'KeyA': this.keys.moveLeft = false; break;
      case 'KeyD': this.keys.moveRight = false; break;
      case 'KeyW': this.keys.jump = false; break;
      case 'KeyS': this.keys.crouch = false; break;
      case 'KeyJ': this.keys.attack = false; break;
      case 'KeyK': this.keys.kick = false; break;
      case 'Space': this.keys.dodge = false; break;
      case 'KeyL': this.keys.projectile = false; break;
      case 'KeyB': this.keys.block = false; break;
      case 'KeyU': this.keys.powerup = false; break;
      case 'KeyI': this.keys.ult1 = false; break;
      case 'KeyO': this.keys.ult2 = false; break;
      case 'KeyQ': this.keys.ultimate = false; break;
      case 'KeyP': this.keys.attack = false; break;
    }
  }

  togglePause() {
    if (this.state === 'ended' || this.state === 'ultimate') return;
    this.paused = !this.paused;
    if (this.paused) this.state = 'paused';
    else this.state = 'playing';
  }

  start() {
    this.loop();
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    document.removeEventListener('keydown', this._boundKeyDown);
    document.removeEventListener('keyup', this._boundKeyUp);
  }

  loop() {
    this.rafId = requestAnimationFrame(() => this.loop());
    this.update();
    this.render();
  }

  update() {
    if (this.state === 'paused') return;

    // ── COUNTDOWN ───────────────────────────────────────────────
    // Đếm ngược chỉ là visual, TẤT CẢ các nút (di chuyển & chiến đấu) đều có hiệu lực ngay lập tức
    if (this.state === 'countdown') {
      this.countdownTimer--;
      if (this.countdownTimer <= 0) this.state = 'playing';
      // Không return ở đây nữa để toàn bộ game logic bên dưới (nhận input, va chạm) vẫn chạy bình thường.
    }

    if (CinematicOverlay.isActive()) {
      CinematicOverlay.update(1);
    }

    // ── ULTIMATE CINEMATIC (FREEZE GAME) ────────────────────────
    if (this.state === 'ultimate') {
      Effects.update();
      return;
    }

    // ── ULTIMATE DASH ───────────────────────────────────────────
    if (this.state === 'ultimate_dash') {
      let attacker = this.p1.isUltimateDash ? this.p1 : this.p2;
      let target = attacker.ultimateDashTarget;

      attacker.ultimateDashTimer--;

      // ── Inosuke ULT_O (Đầu Liệt): STANDS IN PLACE — swords fly to target, character stays put ──
      const isInosukeUltO = attacker.charData && attacker.charData.id === 'inosuke'
                            && attacker.currentAttackVariant === 'ULT_O';

      if (isInosukeUltO) {
          // Inosuke does NOT move — just face the target and stay grounded
          attacker.facingRight = (attacker.ultimateDashTarget && attacker.ultimateDashTarget.x > attacker.x);
          attacker.y = attacker.groundY - attacker.h; // snap to ground
          attacker.onGround = true;
          attacker.isJumping = false; // CRITICAL: prevent getting stuck in jump pose if cast mid-air
          attacker.vy = 0;
      } else {
          // Normal dash: move rapidly toward target
          attacker.x += (attacker.ultimateDashTargetX - attacker.x) * 0.3;

          // Zenitsu Zig-Zag for ULT1 / ULT2
          if (attacker.charData && attacker.charData.id === 'zenitsu' &&
              (attacker.currentAttackVariant === 'ULT1' || attacker.currentAttackVariant === 'ULT2')) {
              const jumpHeight = 100;
              if (Math.floor(attacker.ultimateDashTimer / 2) % 2 === 0) {
                  attacker.y = attacker.groundY - attacker.h - jumpHeight;
              } else {
                  attacker.y = attacker.groundY - attacker.h + (jumpHeight / 3);
              }
          }

          // Inosuke ULT1 (Viên Chuyển Toàn Nha): spin-orbit around target during approach
          if (attacker.charData && attacker.charData.id === 'inosuke' &&
              attacker.currentAttackVariant === 'ULT1') {
              const orbitAngle = (Date.now() / 80) % (Math.PI * 2);
              const radius = 60;
              if (attacker.ultimateDashTimer > 8) {
                  attacker.y = (attacker.groundY - attacker.h) + Math.sin(orbitAngle) * 30;
              }
          }
      }


      if (attacker.ultimateDashTimer <= 0) {
        attacker.isUltimateDash = false;
        
        if (typeof attacker.initiateUltimateCombo === 'function') {
            this.state = 'ultimate_combo';
            attacker.initiateUltimateCombo(target);
        } else {
            this.state = 'playing';

            const oldBlock = target.isBlocking;
            target.isBlocking = false;
            target.invincibleTimer = 0;
            target.takeDamage(attacker.getCurrentUltimateDamage(), attacker.facingRight ? 30 : -30);
            target.isBlocking = oldBlock;
            target.knockdown(attacker.getCurrentUltimateKnockdown());

            attacker.onUltimateComplete(target);

            Effects.ultimateParticles(target.centerX, target.centerY,
              attacker.charData.projectileColor, attacker.charData.swordGlow, 50);

            const impactImg = Images.get(`impact_${attacker.charData.id}`);
            if (impactImg) {
              Effects.spawnSpriteImpact(target.centerX, target.centerY, impactImg, 0, 0.85);
            }

            Effects.screenShake(30);

            if (target.isDead) {
              setTimeout(() => this._endRound(), 500);
            }
        }
      }
      Effects.update(); // CRITICAL: Effects must update during dash too!
      return;
    }

    // ── ULTIMATE COMBO ──────────────────────────────────────────
    if (this.state === 'ultimate_combo') {
      let attacker = this.p1.isUltimateCombo ? this.p1 : this.p2;
      let target = attacker.ultimateDashTarget; // Re-use the target from dash
      
      if (!attacker.isUltimateCombo) {
          // Fallback if flags are mismatched
          this.state = 'playing';
          return;
      }

      attacker.processUltimateCombo(target, () => {
          this.state = 'playing';
          target.isFlinching = false; // FINALLY RESET FLINCH SO TARGET CAN MOVE AGAIN!
          if (target.isDead) {
              setTimeout(() => this._endRound(), 500);
          }
      });
      // CRITICAL FIX: Effects must continue to update so impacts decay and particles move!
      Effects.update();
      return;
    }

    if (this.state !== 'playing' && this.state !== 'countdown') return;

    // ── ROUND TIMER & TRAINING MODE ─────────────────────────────
    if (this.mode === 'training') {
      this.roundTimer = 60 * 99; // Keep at max
      // Infinite HP and Energy for Player
      this.p1.hp = this.p1.maxHp;
      this.p1.energy = 100;
      this.p2.energy = 100;
      // Revive if knocked out
      if (this.p1.isDead) { this.p1.isDead = false; this.p1.hp = this.p1.maxHp; }
      if (this.p2.isDead) { this.p2.isDead = false; this.p2.hp = this.p2.maxHp; }
    } else if (this.state === 'playing') {
      this.roundTimer--;
      if (this.roundTimer <= 0) {
        this._endRound();
        return;
      }
    }

    // ── AI KEYS ─────────────────────────────────────────────────
    if (this.ai) {
      this.aiKeys = this.ai.update(this.aiKeys) || this.aiKeys;
    }

    // ── CHECK ULTIMATE TRIGGERS ─────────────────────────────────
    if (this.p1.isUltimate) {
      this._executeUltimate(this.p1, this.p2);
      return;
    }
    if (this.p2.isUltimate) {
      this._executeUltimate(this.p2, this.p1);
      return;
    }

    // ── APPLY INPUT ─────────────────────────────────────────────
    this.p1.applyKeys(this.keys, this.W);
    this.p2.applyKeys(this.aiKeys, this.W);
    
    // ── CHECK POWERUP CINEMATIC TRIGGERS ────────────────────────
    if (this.p1.isPowerUpCastTrigger) {
      this.p1.isPowerUpCastTrigger = false;
      this.state = 'ultimate';
      CinematicOverlay.start(this.p1, this.p2, () => {
         this.state = 'playing';
         if (typeof AudioManager !== 'undefined') AudioManager.heavyHit();
      }, 'powerup');
      return;
    }
    if (this.p2.isPowerUpCastTrigger) {
      this.p2.isPowerUpCastTrigger = false;
      this.state = 'ultimate';
      CinematicOverlay.start(this.p2, this.p1, () => {
         this.state = 'playing';
         if (typeof AudioManager !== 'undefined') AudioManager.heavyHit();
      }, 'powerup');
      return;
    }

    // ── FACING ──────────────────────────────────────────────────
    // P1: controlled purely by A/D keys (set in applyKeys above)
    // P2/AI: always faces opponent so attacks land in correct direction
    if (!this.p2.isKnockedDown) {
      this.p2.facingRight = this.p1.x > this.p2.x;
    }

    // ── UPDATE FIGHTERS ─────────────────────────────────────────
    this.p1.update(this.W, this.H);
    this.p2.update(this.W, this.H);

    // ── COLLISION DETECTION ─────────────────────────────────────
    this._checkHits();
    this._checkProjectileHits();

    // ── EFFECTS ─────────────────────────────────────────────────
    Effects.update();


    // ── DEATH CHECK ─────────────────────────────────────────────
    if (this.mode !== 'training') {
      if (this.p1.isDead || this.p2.isDead) {
        this._endRound();
      }
    }
  }

  _checkHits() {
    // P1 sword hits P2
    if (this.p1.isAttacking) {
      const hitbox = this.p1.attackHitbox; // Or custom hitbox
      if (hitbox && this._rectOverlap(hitbox, this.p2.bodyHitbox)) {
        const dir = this.p1.facingRight ? 1 : -1;
        const damage = this.p1.getCurrentAttackDamage();
        const status = this.p2.takeDamage(damage, dir * 15);
        const tip = this.p1.swordTipWorld;
        if (status === 'hit') {
          CharEffects.hitEffect(tip.x, tip.y, this.p1, 'sword');
          AudioManager.hit();
          this.p1._gainEnergy(ENERGY_BONUS_HIT_LAND);
        } else if (status === 'blocked') {
          CharEffects.hitEffect(tip.x, tip.y, this.p2, 'block');
        } else if (status === 'countered') {
          CharEffects.hitEffect(tip.x, tip.y, this.p2, 'block');
          if (this.p2.charData.id === 'zenitsu') {
             // Zenitsu: counter dash behind + 65dmg + stun 0.6s
             this.p2.x = this.p1.x + (this.p1.facingRight ? -40 : 40);
             this.p2.facingRight = !this.p2.facingRight;
             this.p1.takeDamage(65, 0);
             this.p1.knockdown(36); // 0.6s stun
          } else if (this.p2.charData.id === 'inosuke') {
             // Inosuke Wild Counter: 100dmg + Bleed 8/s×2s + instant reposition into attacker
             this.p1.takeDamage(100, -dir * 15);
             if (Array.isArray(this.p1.bleedEffects)) this.p1.bleedEffects.push({ dps: 8, duration: 2, elapsed: 0 });
             // Áp sát địch ngay lập tức — không stun
             this.p2.x = this.p1.x + (this.p1.facingRight ? 30 : -30);
          } else {
             // Default counter (Tanjiro etc): 90dmg + stun 0.4s
             this.p1.takeDamage(90, -dir * 15);
             this.p1.knockdown(24); // 0.4s stun
          }
        }
      }
    }
    // P2 sword hits P1
    if (this.p2.isAttacking) {
      const hitbox = this.p2.attackHitbox;
      if (hitbox && this._rectOverlap(hitbox, this.p1.bodyHitbox)) {
        const dir = this.p2.facingRight ? 1 : -1;
        const damage = this.p2.getCurrentAttackDamage();
        const status = this.p1.takeDamage(damage, dir * 15);
        const tip = this.p2.swordTipWorld;
        if (status === 'hit') {
          CharEffects.hitEffect(tip.x, tip.y, this.p2, 'sword');
          AudioManager.hit();
          this.p2._gainEnergy(ENERGY_BONUS_HIT_LAND);
        } else if (status === 'blocked') {
          CharEffects.hitEffect(tip.x, tip.y, this.p1, 'block');
        } else if (status === 'countered') {
          CharEffects.hitEffect(tip.x, tip.y, this.p1, 'block');
          if (this.p1.charData.id === 'zenitsu') {
             this.p1.x = this.p2.x + (this.p2.facingRight ? -40 : 40);
             this.p1.facingRight = !this.p1.facingRight;
             this.p2.takeDamage(65, 0);
             this.p2.knockdown(36);
          } else if (this.p1.charData.id === 'inosuke') {
             // Inosuke Wild Counter: 100dmg + Bleed + áp sát
             this.p2.takeDamage(100, -dir * 15);
             if (Array.isArray(this.p2.bleedEffects)) this.p2.bleedEffects.push({ dps: 8, duration: 2, elapsed: 0 });
             this.p1.x = this.p2.x + (this.p2.facingRight ? 30 : -30);
          } else {
             this.p2.takeDamage(90, -dir * 15);
             this.p2.knockdown(24);
          }
        }
      }
    }
    // Kick hits
    if (this.p1.isKicking) {
      const kb = this.p1.kickHitbox;
      if (kb && this._rectOverlap(kb, this.p2.bodyHitbox)) {
        const dir = this.p1.facingRight ? 1 : -1;
        const damage = this.p1.getCurrentKickDamage();
        const status = this.p2.takeDamage(damage, dir * 20);
        const kx = kb.x + kb.w / 2, ky = kb.y + kb.h / 2;
        if (status === 'hit') {
          CharEffects.hitEffect(kx, ky, this.p1, 'kick');
          AudioManager.heavyHit();
          this.p1._gainEnergy(ENERGY_BONUS_HIT_LAND);
        } else if (status === 'blocked') {
          CharEffects.hitEffect(kx, ky, this.p2, 'block');
        } else if (status === 'countered') {
          CharEffects.hitEffect(kx, ky, this.p2, 'block');
          if (this.p2.charData.id === 'zenitsu') {
             this.p2.x = this.p1.x + (this.p1.facingRight ? -40 : 40);
             this.p2.facingRight = !this.p2.facingRight;
             this.p1.takeDamage(65, 0);
             this.p1.knockdown(36);
          } else if (this.p2.charData.id === 'inosuke') {
             this.p1.takeDamage(100, -dir * 15);
             if (Array.isArray(this.p1.bleedEffects)) this.p1.bleedEffects.push({ dps: 8, duration: 2, elapsed: 0 });
             this.p2.x = this.p1.x + (this.p1.facingRight ? 30 : -30);
          } else {
             this.p1.takeDamage(90, -dir * 15);
             this.p1.knockdown(24);
          }
        }
      }
    }
    if (this.p2.isKicking) {
      const kb = this.p2.kickHitbox;
      if (kb && this._rectOverlap(kb, this.p1.bodyHitbox)) {
        const dir = this.p2.facingRight ? 1 : -1;
        const damage = this.p2.getCurrentKickDamage();
        const status = this.p1.takeDamage(damage, dir * 20);
        const kx = kb.x + kb.w / 2, ky = kb.y + kb.h / 2;
        if (status === 'hit') {
          CharEffects.hitEffect(kx, ky, this.p2, 'kick');
          AudioManager.heavyHit();
          this.p2._gainEnergy(ENERGY_BONUS_HIT_LAND);
        } else if (status === 'blocked') {
          CharEffects.hitEffect(kx, ky, this.p1, 'block');
        } else if (status === 'countered') {
          CharEffects.hitEffect(kx, ky, this.p1, 'block');
          if (this.p1.charData.id === 'zenitsu') {
             this.p1.x = this.p2.x + (this.p2.facingRight ? -40 : 40);
             this.p1.facingRight = !this.p1.facingRight;
             this.p2.takeDamage(65, 0);
             this.p2.knockdown(36);
          } else if (this.p1.charData.id === 'inosuke') {
             this.p2.takeDamage(100, -dir * 15);
             if (Array.isArray(this.p2.bleedEffects)) this.p2.bleedEffects.push({ dps: 8, duration: 2, elapsed: 0 });
             this.p1.x = this.p2.x + (this.p2.facingRight ? 30 : -30);
          } else {
             this.p2.takeDamage(90, -dir * 15);
             this.p2.knockdown(24);
          }
        }
      }
    }
  }

  _checkProjectileHits() {
    // P1 projectiles hit P2
    for (let i = this.p1.projectiles.length - 1; i >= 0; i--) {
      const p = this.p1.projectiles[i];
      if (p.alreadyHit) { this.p1.projectiles.splice(i, 1); continue; } // Đã hit rồi — xóa ngay
      const pBox = { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h };
      if (this._rectOverlap(pBox, this.p2.bodyHitbox)) {
        p.alreadyHit = true; // Đánh dấu trước — không bao giờ hit 2 lần
        const status = this.p2.takeDamage(p.damage, p.vx > 0 ? 25 : -25);
        if (status === 'hit') {
          CharEffects.hitEffect(p.x, p.y, this.p1, 'proj');
          Effects.screenShake(8);
          AudioManager.heavyHit();
        } else if (status === 'blocked' || status === 'countered') {
          CharEffects.hitEffect(p.x, p.y, this.p2, 'block');
        }
        this.p1.projectiles.splice(i, 1); // Xóa trong mọi trường hợp khi chạm
      }
    }
    // P2 projectiles hit P1
    for (let i = this.p2.projectiles.length - 1; i >= 0; i--) {
      const p = this.p2.projectiles[i];
      if (p.alreadyHit) { this.p2.projectiles.splice(i, 1); continue; } // Đã hit rồi — xóa ngay
      const pBox = { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h };
      if (this._rectOverlap(pBox, this.p1.bodyHitbox)) {
        p.alreadyHit = true; // Đánh dấu trước
        const status = this.p1.takeDamage(p.damage, p.vx > 0 ? 25 : -25);
        if (status === 'hit') {
          CharEffects.hitEffect(p.x, p.y, this.p2, 'proj');
          Effects.screenShake(8);
          AudioManager.heavyHit();
        } else if (status === 'blocked' || status === 'countered') {
          CharEffects.hitEffect(p.x, p.y, this.p1, 'block');
        }
        this.p2.projectiles.splice(i, 1); // Xóa trong mọi trường hợp khi chạm
      }
    }
  }

  _rectOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  _executeUltimate(attacker, target) {
    this.state = 'ultimate';
    attacker.isUltimate = false;
    attacker.isUltimateStance = true;

    // Determine which side attacker is on
    const side = attacker.x < this.W / 2 ? 'left' : 'right';

    // Pass target to CinematicOverlay with specific type
    let ultType = 'ult0';
    const charId = attacker.charData ? attacker.charData.id : '';
    const variant = attacker.currentAttackVariant;

    if (charId === 'zenitsu') {
        if (variant === 'ULT1') ultType = 'ult0';
        else if (variant === 'ULT2') ultType = 'ult1';
        else if (variant === 'ULT_O') ultType = 'ult2';
    } else if (charId === 'inosuke') {
        if (variant === 'ULT0') ultType = 'ult0';
        else if (variant === 'ULT1') ultType = 'ult1';
        else if (variant === 'ULT_O') ultType = 'ult2';
    } else {
        // Tanjiro và các nhân vật khác
        if (variant === 'ULT2' || variant === 'ULT_O') ultType = 'ult2';
        else if (variant === 'ULT1') ultType = 'ult1';
        else ultType = 'ult0';
    }
    CinematicOverlay.start(attacker, target, () => {
      this.state = 'ultimate_dash';
      attacker.isUltimateStance = false;
      attacker.isUltimateDash = true;
      attacker.ultimateDashTarget = target;
      // Dash to slightly in front of the target
      attacker.ultimateDashTargetX = target.centerX - attacker.w/2 + (attacker.facingRight ? -80 : 80);
      attacker.ultimateDashTimer = 15; // 0.25 seconds dash
      
      if (typeof AudioManager !== 'undefined') AudioManager.heavyHit(); // play strong sound
    }, ultType);
  }

  _endRound() {
    if (this.state === 'ended') return;
    this.state = 'ended';

    if (this.p1.isDead && this.p2.isDead) this.winner = 'draw';
    else if (this.p1.isDead) this.winner = 'p2';
    else if (this.p2.isDead) this.winner = 'p1';
    else {
      // Time up - higher HP wins
      if (this.p1.hp > this.p2.hp) this.winner = 'p1';
      else if (this.p2.hp > this.p1.hp) this.winner = 'p2';
      else this.winner = 'draw';
    }

    if (this.winner === 'p1') AudioManager.victory();
    else AudioManager.defeat();

    setTimeout(() => this.onGameEnd(this.winner), 2000);
  }

  render() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    // ── BACKGROUND ──────────────────────────────────────────────
    if (this.bgImage) {
      const sh = Effects.getShake();
      ctx.drawImage(this.bgImage, sh.x - 5, sh.y - 5, W + 10, H + 10);
    } else {
      ctx.fillStyle = '#0d0a1a';
      ctx.fillRect(0, 0, W, H);
    }

    // ── GROUND ──────────────────────────────────────────────────
    this._drawGround(ctx, W, H);

    // ── ULTIMATE CINEMATIC (Rendered BEHIND fighters for epic 3D pop) ──
    if (CinematicOverlay.isActive()) {
      CinematicOverlay.draw(ctx, W, H);
    }

    // ── FIGHTERS ────────────────────────────────────────────────
    this.p2.draw(ctx, W, H);
    this.p1.draw(ctx, W, H);

    // ── EFFECTS LAYER ───────────────────────────────────────────
    Effects.draw(ctx, W, H);

    // ── HUD ─────────────────────────────────────────────────────
    this._drawHUD(ctx, W, H);

    // ── COUNTDOWN ───────────────────────────────────────────────
    if (this.state === 'countdown') {
      this._drawCountdown(ctx, W, H);
    }


    // ── PAUSED ──────────────────────────────────────────────────
    if (this.state === 'paused') {
      this._drawPauseMenu(ctx, W, H);
    }

    // ── ROUND RESULT ────────────────────────────────────────────
    if (this.state === 'ended') {
      this._drawRoundResult(ctx, W, H);
    }

    // ── WATERMARK ───────────────────────────────────────────────
    this._drawWatermark(ctx, W, H);
  }

  _drawGround(ctx, W, H) {
    const groundY = H * GROUND_Y_RATIO;
    const sh = Effects.getShake();

    // Ground line with glow
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 80);
    groundGrad.addColorStop(0, 'rgba(0, 200, 255, 0.4)');
    groundGrad.addColorStop(1, 'rgba(0, 50, 80, 0)');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(sh.x - 5, groundY + sh.y, W + 10, 80);

    ctx.strokeStyle = 'rgba(0, 220, 255, 0.6)';
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sh.x, groundY + sh.y);
    ctx.lineTo(W + sh.x, groundY + sh.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  _drawHUD(ctx, W, H) {
    const barW = W * 0.35;
    const barH = 22;
    const energyH = 14;
    const barY = 18;
    const padding = 18;

    // ── P1 HUD (left side) ──────────────────────────────────────
    this._drawHealthBar(ctx, padding, barY, barW, barH,
      this.p1.hp / this.p1.charData.maxHp, this.p1.charData.selectColor, false, this.p1.charData.maxHp);
    this._drawEnergyBar(ctx, padding, barY + barH + 4, barW, energyH,
      this.p1.energy / MAX_ENERGY, this.p1.charData.swordGlow, false);
    this._drawCharName(ctx, padding + barW * 0.5, barY + barH + energyH + 20,
      this.p1.charData.displayName, this.p1.charData.selectColor, 'left', padding);

    // ── P2 HUD (right side) ─────────────────────────────────────
    this._drawHealthBar(ctx, W - padding - barW, barY, barW, barH,
      this.p2.hp / this.p2.charData.maxHp, this.p2.charData.selectColor, true, this.p2.charData.maxHp);
    this._drawEnergyBar(ctx, W - padding - barW, barY + barH + 4, barW, energyH,
      this.p2.energy / MAX_ENERGY, this.p2.charData.swordGlow, true);
    this._drawCharName(ctx, W - padding - barW * 0.5, barY + barH + energyH + 20,
      this.p2.charData.displayName, this.p2.charData.selectColor, 'right', W - padding);

    // ── TIMER ────────────────────────────────────────────────────
    const secs = Math.ceil(this.roundTimer / 60);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px "Cinzel", serif';
    const timerColor = secs <= 10 ? '#ff4444' : '#ffffff';
    ctx.fillStyle = timerColor;
    ctx.shadowColor = timerColor;
    ctx.shadowBlur = 15;
    ctx.fillText(secs > 0 ? secs : '0', W / 2, 50);
    ctx.restore();

    // ── VS ───────────────────────────────────────────────────────
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px "Cinzel", serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('VS', W / 2, 70);
    ctx.restore();

    // ── ENERGY FULL INDICATOR ────────────────────────────────────
    if (this.p1.energy >= MAX_ENERGY) {
      const t = Date.now() / 300;
      ctx.save();
      ctx.globalAlpha = 0.7 + Math.sin(t) * 0.3;
      ctx.textAlign = 'left';
      ctx.font = 'bold 13px "Cinzel", serif';
      ctx.fillStyle = this.p1.charData.swordGlow;
      ctx.shadowColor = this.p1.charData.swordGlow;
      ctx.shadowBlur = 10;
      ctx.fillText('⚡ Tuyệt chiêu! [Q]', padding, barY + barH + energyH + 40);
      ctx.restore();
    }
    if (this.p2.energy >= MAX_ENERGY) {
      const t = Date.now() / 300;
      ctx.save();
      ctx.globalAlpha = 0.7 + Math.sin(t) * 0.3;
      ctx.textAlign = 'right';
      ctx.font = 'bold 13px "Cinzel", serif';
      ctx.fillStyle = this.p2.charData.swordGlow;
      ctx.shadowColor = this.p2.charData.swordGlow;
      ctx.shadowBlur = 10;
      ctx.fillText('⚡ Tuyệt chiêu!', W - padding, barY + barH + energyH + 40);
      ctx.restore();
    }
  }

  _drawHealthBar(ctx, x, y, w, h, pct, color, rtl, maxHp = 100) {
    // Background
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.roundRect(x, y, w, h, 4);
    ctx.stroke();

    // Health fill
    const fillW = Math.max(0, w * pct);
    const hpColor = pct > 0.6 ? color : pct > 0.3 ? '#ffcc00' : '#ff3333';
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, hpColor);
    grad.addColorStop(1, hpColor + '88');

    const fillX = rtl ? x + w - fillW : x;
    ctx.fillStyle = grad;
    ctx.shadowColor = hpColor;
    ctx.shadowBlur = 8;
    if (fillW > 4) {
      ctx.beginPath();
      if (rtl) {
        ctx.roundRect(fillX, y, fillW, h, [0, 4, 4, 0]);
      } else {
        ctx.roundRect(fillX, y, fillW, h, [4, 0, 0, 4]);
      }
      ctx.fill();
    }

    // HP text — show actual HP value, not percentage
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 0;
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(pct * maxHp)} / ${maxHp} HP`, x + w / 2, y + h - 4);

    ctx.restore();
  }

  _drawEnergyBar(ctx, x, y, w, h, pct, color, rtl) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.roundRect(x, y, w, h, 3);
    ctx.fill();

    const fillW = Math.max(0, w * pct);
    const fillX = rtl ? x + w - fillW : x;
    const isGlowing = pct >= 1;

    if (isGlowing) {
      const t = Date.now() / 200;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15 + Math.sin(t) * 8;
    } else {
      ctx.shadowColor = color;
      ctx.shadowBlur = 5;
    }

    const energyGrad = ctx.createLinearGradient(x, y, x + w, y);
    energyGrad.addColorStop(0, color + 'aa');
    energyGrad.addColorStop(1, color);
    ctx.fillStyle = energyGrad;

    if (fillW > 3) {
      ctx.beginPath();
      if (rtl) {
        ctx.roundRect(fillX, y, fillW, h, [0, 3, 3, 0]);
      } else {
        ctx.roundRect(fillX, y, fillW, h, [3, 0, 0, 3]);
      }
      ctx.fill();
    }

    ctx.restore();
  }

  _drawCharName(ctx, x, y, name, color, align, anchorX) {
    ctx.save();
    ctx.textAlign = align === 'left' ? 'left' : 'right';
    ctx.font = 'bold 12px "Cinzel", serif';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillText(name, anchorX, y);
    ctx.restore();
  }

  _drawCountdown(ctx, W, H) {
    const secs = Math.ceil(this.countdownTimer / 60);
    const t = (this.countdownTimer % 60) / 60;

    ctx.save();
    ctx.textAlign = 'center';
    const scale = 1 + (1 - t) * 0.5;
    ctx.translate(W / 2, H / 2);
    ctx.scale(scale, scale);
    ctx.globalAlpha = t;

    if (secs > 0) {
      ctx.font = `bold ${Math.round(120 / scale)}px "Cinzel", serif`;
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = 40;
      ctx.fillText(secs, 0, 30);
    } else {
      ctx.font = `bold ${Math.round(80 / scale)}px "Cinzel", serif`;
      ctx.fillStyle = '#ffdd00';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 40;
      ctx.fillText('CHIẾN ĐẤU!', 0, 20);
    }
    ctx.restore();

    // Dark overlay fade
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0, (this.countdownTimer - 120) / 60 * 0.4)})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  _drawPauseMenu(ctx, W, H) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';

    ctx.font = 'bold 52px "Cinzel", serif';
    ctx.fillStyle = '#00d4ff';
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 25;
    ctx.fillText('TẠM DỪNG', W / 2, H / 2 - 50);

    ctx.shadowBlur = 0;
    ctx.font = '20px "Cinzel", serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('Nhấn ESC để tiếp tục', W / 2, H / 2 + 10);
    ctx.fillText('Nhấn ESC để mở menu', W / 2, H / 2 + 40);

    ctx.restore();
  }

  _drawRoundResult(ctx, W, H) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';

    let resultText = '';
    let color = '#fff';
    if (this.winner === 'p1') {
      resultText = `${this.p1.charData.displayName} THẮNG!`;
      color = this.p1.charData.selectColor;
    } else if (this.winner === 'p2') {
      resultText = `${this.p2.charData.displayName} THẮNG!`;
      color = this.p2.charData.selectColor;
    } else {
      resultText = 'HÒA!';
      color = '#ffdd00';
    }

    ctx.font = 'bold 60px "Cinzel", serif';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.fillText(resultText, W / 2, H / 2 - 20);

    ctx.shadowBlur = 0;
    ctx.font = '18px "Cinzel", serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Đang quay về menu...', W / 2, H / 2 + 40);

    ctx.restore();
  }

  _drawWatermark(ctx, W, H) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.font = '11px "Cinzel", serif';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillText('Lam Phạm - BabyBlue', W - 10, H - 10);
    ctx.restore();
  }
}

// Current game engine instance (global reference for cleanup)
let currentGame = null;

function startGame(options) {
  if (currentGame) {
    currentGame.stop();
    currentGame = null;
  }
  const canvas = document.getElementById('game-canvas');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  currentGame = new GameEngine(canvas, options);
  currentGame.start();
  return currentGame;
}

function stopGame() {
  if (currentGame) {
    currentGame.stop();
    currentGame = null;
  }
}
