// nezuko.js - Custom Fighter Logic for Kamado Nezuko
'use strict';

class NezukoFighter extends Fighter {
  constructor(charData, isP2, x, canvasH, facingRight) {
    super(charData, isP2, x, canvasH, facingRight);

    // ── NEZUKO SPECIFIC STATS ──
    this.maxHp = charData.maxHp || 4300;
    this.hp    = this.maxHp;
    this.energy = charData.energy !== undefined ? charData.energy : 100;

    // Movement
    this.baseSpeed    = charData.speed || 4.6;
    this.crouchSpeed  = 2.8; 
    this.jumpHeight   = 3.2; 
    this.airTime      = 0.95; 

    // NO PowerUp state (U is Ulti-0 instead)
    this.isPowerUp     = false; 
    this.exhaustionTimer = 0;

    // J charge logic
    this.chargeJTimer  = 0;
    this.isChargingJ   = false;

    // Ulti-2 specific — Khoảng trống suy kiệt (Tanjiro shadow attack phase)
    this.isWeaponless       = false; 
    this.weaponlessTimer    = 0;
    this.weaponlessDuration = 1.4; // 1.4s window

    // Burn DoT tracking 
    this.bleedEffects = []; // we can reuse bleedEffects system but style it as red burn if we want, or just use it. 
    this.burnColor    = '#ff44aa'; 

    // Skill Cooldowns
    this.lastAttacks = {
      j1: 0, j2: 0, k: 0, jump_k: 0, l: 0
    };
  }

  // ─────────────────────────────────────────────
  //  STAT GETTERS
  // ─────────────────────────────────────────────

  getCurrentSpeed() {
    if (this.exhaustionTimer > 0) return this.baseSpeed * 0.5; // penalty after Ulti-2 catch
    return this.baseSpeed; 
  }

  getCurrentAttackDamage() {
    if (this.currentAttackVariant === 'J2') return 72;  
    return 42; // J1 
  }

  getCurrentKickDamage() {
    if (this.currentAttackVariant === 'JUMP_K') return 65; 
    return 58; // K standing
  }

  getCurrentProjectileDamage() {
    return 55; // L
  }

  getCurrentUltimateDamage() {
    if (this.currentAttackVariant === 'ULT_O') return 590; // Nhát 1-3: 110x3, Nhát 4-5: 130x2
    if (this.currentAttackVariant === 'ULT1')  return 360; // 8x45
    return 180; // ULT0 
  }

  getCurrentUltimateKnockdown() {
    if (this.currentAttackVariant === 'ULT_O') return 108; // 1.8s stun 
    if (this.currentAttackVariant === 'ULT1')  return 72;  // 1.2s
    return 27; // ULT0 — 0.45s stun
  }

  onUltimateComplete(target) {
    if (this.currentAttackVariant === 'ULT_O') {
      this.isWeaponless    = false;
      this.weaponlessTimer = 0;
      this.exhaustionTimer = 2.0; // 2.0s exhausted
      this.isFlinching     = true;

      // Special mechanic: if target dies within 3 seconds, +20 energy
      if (target) {
        target._nezukoDeathMark = {
          owner: this,
          timer: 3.0
        };
      }
    }
  }

  getEnergyRegenRate() {
    // 0 energy per tick naturally. She gains energy via taking damage.
    return 0; 
  }

  // ─────────────────────────────────────────────
  //  MULTI-HIT ULTIMATE OVERRIDE
  // ─────────────────────────────────────────────

  initiateUltimateCombo(target) {
    this.isUltimateCombo  = true;
    this.ultimateComboHits = 0;

    if (this.currentAttackVariant === 'ULT_O') {
      // 5 hits total
      this.ultimateComboMaxHits = 5; 
      this.comboHitInterval     = 10; // ~0.16s 
      this.isWeaponless    = true;
      this.weaponlessTimer = this.weaponlessDuration;

      // Shadow Tanjiro summon simulation
      this._ult2SwordsAnim = {
        active:    true,
        phase:     'go',
        startMs:   Date.now(),
        goMs:      this.ultimateComboMaxHits * this.comboHitInterval * (1000/60),
        iX:        this.centerX,
        iY:        this.centerY,
        tX:        target ? target.centerX : this.centerX + (this.facingRight ? 200 : -200),
        tY:        target ? target.centerY : this.centerY,
      };

    } else if (this.currentAttackVariant === 'ULT1') {
      // 8 hits
      this.ultimateComboMaxHits = 8;
      this.comboHitInterval     = 9; // 8 x 9 = 72 frames (1.2s)
    } else {
      // ULT0 — 1 huge hit
      this.ultimateComboMaxHits = 1;
      this.comboHitInterval     = 5; 
    }
    this.comboHitTimer = this.comboHitInterval;
  }

  processUltimateCombo(target, finishCallback) {
    this.comboHitTimer--;

    if (this.comboHitTimer <= 0) {
      this.ultimateComboHits++;

      let damage;
      if (this.currentAttackVariant === 'ULT_O') {
        damage = this.ultimateComboHits <= 3 ? 110 : 130;
      } else {
        damage = this.getCurrentUltimateDamage() / this.ultimateComboMaxHits;
      }

      const dir = this.facingRight ? 12 : -12;

      let ultIdxStr = 'ult0';
      if (this.currentAttackVariant === 'ULT1')  ultIdxStr = 'ult1';
      else if (this.currentAttackVariant === 'ULT_O') ultIdxStr = 'ult2';
      
      const impactImg = (typeof Images !== 'undefined')
        ? Images.get(`hit_${this.charData.id}_${ultIdxStr}`)
        : null;

      if (this.ultimateComboHits >= this.ultimateComboMaxHits) {
        // ── FINAL HIT ──
        const oldBlock = target.isBlocking;
        target.isBlocking     = false;
        target.invincibleTimer = 0;
        target.takeDamage(damage, dir * 3);
        target.isBlocking = oldBlock;
        target.knockdown(this.getCurrentUltimateKnockdown());

        // Apply Burn (Huyết Diệm)
        if (this.currentAttackVariant === 'ULT1') {
          this._applyBurnToTarget(target, 10, 5); // 10 dmg/s x 5s
        } else if (this.currentAttackVariant === 'ULT_O') {
          this._applyBurnToTarget(target, 10, 6); // 10 dmg/s x 6s
        } else if (this.currentAttackVariant === 'ULT0') {
          this._applyBurnToTarget(target, 10, 3); // 10 dmg/s x 3s
        }

        this.onUltimateComplete(target);

        if (typeof Effects !== 'undefined') {
          const pColor = this.charData.projectileColor || '#ff2255';
          const gColor = this.charData.swordGlow       || '#ff6699';
          Effects.ultimateParticles(target.centerX, target.centerY, pColor, gColor, 50);

          if (impactImg) {
            Effects.spawnSpriteImpact(target.centerX, target.centerY, impactImg, 0, 1.2);
          }

          Effects.screenShake(40);
          if (typeof AudioManager !== 'undefined') AudioManager.heavyHit();
        }

        this.isUltimateCombo = false;
        finishCallback();
        return;

      } else {
        // ── INTERMEDIATE HIT ──
        target.takeDamage(damage, dir);
        target.isFlinching = true;
        target.flinchTimer = 12;

        if (typeof Effects !== 'undefined') {
          Effects.screenShake(15);
          if (impactImg) {
            const randX   = target.centerX + (Math.random() - 0.5) * 70;
            const randY   = target.centerY + (Math.random() - 0.5) * 70;
            const randRot = Math.random() * Math.PI * 2;
            Effects.spawnSpriteImpact(randX, randY, impactImg, randRot, 0.95);
          }
        }

        if (typeof AudioManager !== 'undefined') AudioManager.hit();

        this.comboHitTimer = this.comboHitInterval;

        if (this.currentAttackVariant === 'ULT0') {
          this.x += dir * 1.5;
        }
      }
    }
  }

  _applyBurnToTarget(target, dps, duration, extendMode = false) {
    if (!target) return;
    if (Array.isArray(target.bleedEffects)) {
      if (extendMode) {
        // Look for existing burn (represented in bleed arr)
        let found = false;
        for (let b of target.bleedEffects) {
          if (b.dps === dps && !b.isTrueBleed) { // simple heuristic or we add flags
            b.duration += duration;
            found = true;
            break;
          }
        }
        if (!found) {
           target.bleedEffects.push({ dps, duration, elapsed: 0, isBurn: true, color: this.burnColor });
        }
      } else {
        target.bleedEffects.push({ dps, duration, elapsed: 0, isBurn: true, color: this.burnColor });
      }
    }
  }

  // ─────────────────────────────────────────────
  //  SPRITE LOADING
  // ─────────────────────────────────────────────

  loadSprites() {
    super.loadSprites();
    const id = this.charData.id; 

    this.sprites.crouch_walk1 = Images.get(`sprite_${id}_crouch_walk1`);
    this.sprites.crouch_walk2 = Images.get(`sprite_${id}_crouch_walk2`);

    this.sprites.heavy_attack        = Images.get(`sprite_${id}_heavy_attack`);
    this.sprites.heavy_jump_attack   = Images.get(`sprite_${id}_heavy_jump_attack`);
    this.sprites.heavy_crouch_attack = Images.get(`sprite_${id}_heavy_crouch_attack`);

    this.sprites.projectile        = Images.get(`sprite_${id}_projectile`);
    this.sprites.jump_projectile   = Images.get(`sprite_${id}_jump_projectile`);
    this.sprites.crouch_projectile = Images.get(`sprite_${id}_crouch_projectile`);

    this.sprites.stomp      = Images.get(`sprite_${id}_stomp`);   // K standing
    this.sprites.air_kick   = Images.get(`sprite_${id}_air_kick`); 

    this.sprites.block_pose = Images.get(`sprite_${id}_block`);

    this.sprites.ultimate0_charge = Images.get(`sprite_${id}_ulti0_charge`);
    this.sprites.ultimate0_attack = Images.get(`sprite_${id}_ulti0_attack`);
    this.sprites.ultimate1_charge = Images.get(`sprite_${id}_ulti1_charge`);
    this.sprites.ultimate1_attack = Images.get(`sprite_${id}_ulti1_attack`);
    this.sprites.ultimate2_charge = Images.get(`sprite_${id}_ulti2_charge`);
    this.sprites.ultimate2_summon = Images.get(`sprite_${id}_ulti2_summon`);
    this.sprites.ultimate2_slash  = Images.get(`sprite_${id}_ulti2_slash`);
    this.sprites.ultimate2_catch  = Images.get(`sprite_${id}_ulti2_catch`);

    this.sprites.ultimate_pose = Images.get(`sprite_${id}_ultimate_pose`);
    this.sprites.exhaust_pose  = Images.get(`sprite_${id}_exhaust_pose`);
  }

  // ─────────────────────────────────────────────
  //  SPRITE SELECTION
  // ─────────────────────────────────────────────

  _getCurrentSprite() {
    if (this.exhaustionTimer > 0 && this.sprites.exhaust_pose) return this.sprites.exhaust_pose;

    if (this.isUltimateStance || this.isUltimate) {
      if (this.currentAttackVariant === 'ULT_O' && this.sprites.ultimate2_charge) return this.sprites.ultimate2_charge;
      if (this.currentAttackVariant === 'ULT1'  && this.sprites.ultimate1_charge) return this.sprites.ultimate1_charge;
      if (this.currentAttackVariant === 'ULT0'  && this.sprites.ultimate0_charge) return this.sprites.ultimate0_charge;
      if (this.sprites.ultimate_pose) return this.sprites.ultimate_pose;
    }

    if (this.isUltimateDash || this.isUltimateCombo) {
      if (this.currentAttackVariant === 'ULT_O') {
        if (this.sprites.ultimate2_summon) return this.sprites.ultimate2_summon;
      }
      if (this.currentAttackVariant === 'ULT1'  && this.sprites.ultimate1_attack) return this.sprites.ultimate1_attack;
      if (this.currentAttackVariant === 'ULT0'  && this.sprites.ultimate0_attack) return this.sprites.ultimate0_attack;
    }

    if (this.isBlocking && this.sprites.block_pose) return this.sprites.block_pose;
    if (this.isDodging) return this.sprites.crouch;

    // AIR
    if (!this.onGround || this.isJumping) {
      if (this.isKicking) return this.sprites.air_kick;
      if (this.isAttacking) {
        if (this.currentAttackVariant === 'L')  return this.sprites.jump_projectile;
        if (this.currentAttackVariant === 'J2') return this.sprites.heavy_jump_attack;
        return this.sprites.jump_attack;
      }
      return this.sprites.jump;
    }

    // CROUCH
    if (this.isCrouching) {
      if (this.isKicking) return this.sprites.crouch_kick;
      if (this.isAttacking) {
        if (this.currentAttackVariant === 'L')  return this.sprites.crouch_projectile;
        if (this.currentAttackVariant === 'J2') return this.sprites.heavy_crouch_attack;
        return this.sprites.crouch_attack;
      }
      if (this.isMoving && !this.isDodging && !this.isBlocking) {
        const runIndex = Math.floor(Date.now() / 150) % 2;
        return runIndex === 0 ? this.sprites.crouch_walk1 : this.sprites.crouch_walk2;
      }
      return this.sprites.crouch;
    }

    // STANDING
    if (this.isKicking) {
      if (this.sprites.stomp) return this.sprites.stomp;
      return this.sprites.kick;
    }
    if (this.isAttacking) {
      if (this.currentAttackVariant === 'L')  return this.sprites.projectile;
      if (this.currentAttackVariant === 'J2') return this.sprites.heavy_attack;
      return this.sprites.idle_attack;
    }

    if (this.isMoving && !this.isDodging && !this.isBlocking) {
      const runIndex = Math.floor(Date.now() / 120) % 2;
      return runIndex === 0 ? this.sprites.run1 : this.sprites.run2;
    }

    return this.sprites.idle;
  }

  // ─────────────────────────────────────────────
  //  INPUT HANDLER
  // ─────────────────────────────────────────────

  applyKeys(keys, canvasW) {
    if (this.isDead || this.isFlinching || this.isKnockedDown) {
      this.isChargingJ  = false;
      this.chargeJTimer = 0;
      return;
    }

    if (this.isUltimate) return;

    const prev = this._prevKeys || {};

    const superKeys = {
      ...keys,
      attack: false, kick: false, projectile: false,
      ultimate: false, powerup: false, ult1: false, ult2: false
    };
    super.applyKeys(superKeys, canvasW);

    const now = performance.now() / 1000;

    // ── 1. J — CƯỚC THUẬT (J1 / J2) ──
    if (!this.isWeaponless) {
      if (keys.attack && !this.isAttacking && !this.isKicking) {
        this.isChargingJ  = true;
        this.chargeJTimer += 1 / 60;
      } else if (!keys.attack && this.isChargingJ) {
        this.isChargingJ = false;
        const t  = this.chargeJTimer;
        this.chargeJTimer = 0;

        const isHeavy = t >= 0.3;
        const cdKey   = isHeavy ? 'j2' : 'j1';
        const cd      = isHeavy ? 0.68 : 0.38;

        if (now - this.lastAttacks[cdKey] > cd) {
          this.isAttacking          = true;
          this.attackTimer          = isHeavy ? Math.ceil(this.attackDuration * 1.5) : this.attackDuration;
          this.swordSwingProgress   = 0;
          this.lastAttacks[cdKey]   = now;
          this.currentAttackVariant = isHeavy ? 'J2' : 'J1';

          if (window.AudioManager) window.AudioManager.slash();

          if (isHeavy) this._pendingBleed = { dps: 10, duration: 3 }; // Burn 10dps x 3s
        }
      }
    }

    // ── 2. K — ĐẠP XUYÊN (K) / ĐẠP TỪ TRÊN (Jump+K) ──
    if (keys.kick && !prev.kick && !this.isAttacking && !this.isKicking && !this.isWeaponless) {
      const isAir  = !this.onGround;
      const cdKey  = isAir ? 'jump_k' : 'k';
      const cd     = isAir ? 0.60 : 0.52;

      if (now - this.lastAttacks[cdKey] > cd) {
        this.isKicking          = true;
        this.kickTimer          = isAir ? 18 : 16;
        this.lastAttacks[cdKey] = now;
        this.currentAttackVariant = isAir ? 'JUMP_K' : 'K';
        if (window.AudioManager) window.AudioManager.kick();
      }
    }

    // ── 3. L — PHUN HUYẾT DIỆM ──
    if (keys.projectile && !prev.projectile && !this.isAttacking && !this.isKicking
        && !this.isWeaponless && now - this.lastAttacks.l > 0.90) {
      this._fireProjectile();
      this.lastAttacks.l        = now;
      this.currentAttackVariant = 'L';
      this.isAttacking          = true;
      this.attackTimer          = 20; 
    }

    // ── 4. U — ULTI 0 (50 energy) ──
    if (keys.powerup && !prev.powerup && !this.isAttacking && this.energy >= 50 && !this.isUltimate) {
      this.isUltimate           = true;
      this.ultimateTimer        = 0;
      this.energy              -= 50;
      this.currentAttackVariant = 'ULT0';
      this._transformStartMs    = Date.now();
      if (window.AudioManager) window.AudioManager.ultimate();
    }

    // ── 5. I — ULTI 1 (75 energy) ──
    if (keys.ult1 && !prev.ult1 && !this.isAttacking && this.energy >= 75 && !this.isUltimate) {
      this.isUltimate           = true;
      this.ultimateTimer        = 0;
      this.energy              -= 75;
      this.currentAttackVariant = 'ULT1';
      this._transformStartMs    = Date.now();
      if (window.AudioManager) window.AudioManager.ultimate();
    }

    // ── 6. O — ULTI 2 (100 energy) ──
    if (keys.ult2 && !prev.ult2 && !this.isAttacking && this.energy >= 100 && !this.isUltimate) {
      this.isUltimate           = true;
      this.ultimateTimer        = 0;
      this.energy              -= 100;
      this.currentAttackVariant = 'ULT_O';
      this._transformStartMs    = Date.now();
      if (window.AudioManager) window.AudioManager.ultimate();
    }

    this._prevKeys = { ...keys };
  }

  // ─────────────────────────────────────────────
  //  BLOCK / COUNTER / DAMAGE TAKEN OVERRIDE
  // ─────────────────────────────────────────────

  takeDamage(amount, knockback = 0) {
    if (this.invincibleTimer > 0 || this.isDead) return 'none';
    if (this.isDummy) { amount = 0; knockback = 0; }

    // Ulti-1 defense buff: Takes 50% dmg while casting (spec rule)
    if (this.currentAttackVariant === 'ULT1' && this.isUltimate) {
       amount = amount * 0.5;
    }

    if (this.isBlocking) {
      const counterWindow = 0.19;
      if (this.blockTime <= counterWindow) {
        // COUNTER: 85 dmg + burn 10x3
        if (window.AudioManager) AudioManager.heavyHit();
        if (window.Effects)      Effects.screenShake(8);
        return 'countered'; // Main game loop logic delegates counter dmg, but we handle effects there.
      }
      
      // Block regular
      if (window.AudioManager) AudioManager.block();
      if (window.Effects)      Effects.screenShake(3);

      // BLOCK HP HEALING: "Hồi 8 HP mỗi đòn đỡ"
      this.hp = Math.min(this.maxHp, this.hp + 8);

      const actualDamage = amount * 0.30; // 70% reduction
      this.hp = Math.max(0, this.hp - actualDamage);
      if (window.Effects) {
        Effects.floatingText(this.centerX, this.y + 20, Math.floor(actualDamage), 'damage');
        Effects.floatingText(this.centerX, this.y + 40, "+8 HP", 'heal');
      }

      this._gainEnergy(amount * 0.5); 

      if (this.hp <= 0) { this.die(); return 'killed'; }
      return 'blocked';
    }

    // ── UNBLOCKED HIT ──
    const minHp = this.isTraining ? 1 : 0;
    this.hp = Math.max(minHp, this.hp - amount);

    if (window.Effects) Effects.floatingText(this.centerX, this.y + 20, Math.floor(amount), 'damage');

    // Năng lượng quỷ: Hồi nhiều energy khi bị đánh
    let gain = (amount > 10) ? amount * 0.6 : 10;
    if (this.currentAttackVariant === 'ULT1' && this.isUltimate) gain *= 2; // double while ulti1
    this._gainEnergy(gain);

    this.hitFlash = 8;
    if (window.Effects) {
      Effects.screenShake(amount > 30 ? 12 : 6);
      Effects.flashScreen('white', amount > 30 ? 0.5 : 0.25);
    }

    if (knockback !== 0) {
      this.x  += knockback;
      this.vy  = -5;
      if (this.onGround) { this.vy = -8; this.onGround = false; }
    }

    if (this.hp <= 0 && !this.isTraining) {
      this.hp     = 0;
      this.isDead = true;
    }
    return 'hit';
  }

  // ─────────────────────────────────────────────
  //  PROJECTILE
  // ─────────────────────────────────────────────

  _fireProjectile() {
    const pivot = this.swordPivotWorld;
    const dir   = this.facingRight ? 1 : -1;
    if (window.AudioManager) AudioManager.projectile();

    this.projectiles.push({
      x:    pivot.x + dir * 55,  // Offset 55px — tránh spawn trong hitbox khi đứng gần
      y:    pivot.y,
      vx:   dir * 10,
      vy:   0,
      w:    100,
      h:    80,
      life: 1.0,
      alreadyHit: false,
      color: this.charData.projectileColor || '#ff22aa',
      glow:  this.charData.projectileGlow || '#ff88aa',
      damage: this.getCurrentProjectileDamage(),
      owner: this,
      trailParticles: []
    });
  }

  // ─────────────────────────────────────────────
  //  UPDATE HOOKS
  // ─────────────────────────────────────────────

  update(canvasW, canvasH) {
    if (this.isDead) return super.update(canvasW, canvasH);
    
    const dt = 1 / 60;
    super.update(canvasW, canvasH);

    if (this.exhaustionTimer > 0) {
      this.exhaustionTimer -= dt;
      if (this.exhaustionTimer <= 0) {
        this.exhaustionTimer = 0;
        this.isFlinching     = false;
      }
    }

    if (this.isWeaponless) {
      this.weaponlessTimer -= dt;
      if (this.weaponlessTimer <= 0) {
        this.isWeaponless = false;
      }
    }
    
    // Death mark logic +20 energy if target dies within 3 seconds
    // Note: the death mark is placed on the target via onUltimateComplete
    // It's evaluated on the target, so we don't strictly need it here.

    // Snap to ground to fix position drifts
    if (this.onGround && !this.isJumping && this.vy === 0) {
      this.y = this.groundY - this.h;
    }
  }

  // Hooking K kicks to deal stagger & Burn
  _dealKickDamage(target) {
    if (this.currentAttackVariant === 'K') {
      target.takeDamage(58, Math.sign(target.centerX - this.centerX) * 0.5);
      target.knockdown(21); // Stagger 0.35s
      this._applyBurnToTarget(target, 10, 2); // 10 dps * 2s
    } else if (this.currentAttackVariant === 'JUMP_K') {
      target.takeDamage(65, Math.sign(target.centerX - this.centerX) * 0);
      target.knockdown(24); // Slam knockdown 0.4s
    } else {
      target.takeDamage(this.getCurrentKickDamage(), Math.sign(target.centerX - this.centerX));
    }
  }

  draw(ctx, canvasW, canvasH) {
    super.draw(ctx, canvasW, canvasH);

    // Kéo logic vẽ bóng Tanjiro lao tới mục tiêu ở Ulti-2 (ulti2_slash)
    if (this._ult2SwordsAnim && this._ult2SwordsAnim.active) {
      const anim = this._ult2SwordsAnim;
      const tIdx = Date.now() - anim.startMs;
      
      // Delay tẹo trước khi bóng bay đi để trùng khớp nhịp xuất hiện
      if (tIdx > 120) {
        // Timeline chính: 0 -> anim.goMs
        const moveTime = Math.max(0, tIdx - 120);
        const progress = Math.min(1.0, moveTime / (anim.goMs - 120));
        
        // Cập nhật vị trí bóng (lao từ Nezuko đến Target)
        const shake = (typeof Effects !== 'undefined') ? Effects.getShake() : {x:0, y:0};
        const sx = anim.iX + (anim.tX - anim.iX) * Math.pow(progress, 0.5) + shake.x; 
        const sy = anim.iY + (anim.tY - anim.iY) * progress + shake.y;
        
        const slashSprite = this.sprites.ultimate2_slash; // Đã map trỏ tới tanjiro_ulti2_slash.png
        
        if (slashSprite) {
          ctx.save();
          ctx.translate(sx, sy);
          
          if (!this.facingRight) {
             ctx.scale(-1, 1);
          }

          // Hiệu ứng mờ dần về cuối đòn chém
          let alpha = 1.0;
          if (progress >= 1.0) {
             const fade = Math.max(0, 1.0 - (tIdx - anim.goMs) / 300); // Mờ dần trong 0.3s
             alpha = fade;
             if (fade <= 0) anim.active = false;
          }
          ctx.globalAlpha = alpha;

          // Render bóng ở tỉ lệ người thật (không phóng to như VFX)
          const drawH = this.h; 
          const drawW = (slashSprite.width / slashSprite.height) * drawH;
          
          ctx.drawImage(slashSprite, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        }
      }
    }
  }
}

// Globally register
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NezukoFighter;
} else if (typeof window !== 'undefined') {
  window.NezukoFighter = NezukoFighter;
}
