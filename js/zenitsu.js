// zenitsu.js - Custom Fighter Logic for Agatsuma Zenitsu
'use strict';

class ZenitsuFighter extends Fighter {
  constructor(charData, isP2, x, canvasH, facingRight) {
    super(charData, isP2, x, canvasH, facingRight);
    
    // Zenitsu Specific Stats
    this.maxHp = charData.maxHp || 4200;
    this.hp = this.maxHp;
    this.energy = charData.energy !== undefined ? charData.energy : 100;

    // Movement speeds
    this.baseSpeed = this.charData.speed || 5.5;
    
    // J charge logic (J1 vs J2)
    this.chargeJTimer = 0;
    this.isChargingJ = false;
    
    // Custom timers
    this.exhaustionTimer = 0; // The penalty timer after using Ultimate 2 (God Speed)
    
    // Skill Cooldowns
    this.lastAttacks = {
      j1: 0, j2: 0, k: 0, l: 0
    };
  }

  // ── CUSTOM STAT GETTERS ──
  getCurrentSpeed() {
    if (this.currentAttackVariant && this.isAttacking) return 0;
    if (this.exhaustionTimer > 0) return this.baseSpeed * 0.4; 
    return this.baseSpeed;
  }

  getCurrentAttackDamage() {
    if (this.currentAttackVariant === 'J2') return 65; 
    if (this.currentAttackVariant === 'ULT1' || this.currentAttackVariant === 'ULT2') {
      return (this.currentAttackVariant === 'ULT2' ? 480 : 320); 
    }
    return 40; // Default J1
  }

  getCurrentKickDamage() {
    return 35; 
  }

  getCurrentProjectileDamage() {
    return 50; 
  }

  getCurrentUltimateDamage() {
    if (this.currentAttackVariant === 'ULT_O') return 880; 
    if (this.currentAttackVariant === 'ULT2') return 480; 
    return 320; // ULT1
  }

  getCurrentUltimateKnockdown() {
    if (this.currentAttackVariant === 'ULT_O') return 120; // 2.0s
    if (this.currentAttackVariant === 'ULT2') return 60; // 1.0s
    return 90; // 1.5s
  }

  onUltimateComplete(target) {
    if (this.currentAttackVariant === 'ULT_O') {
      // 2 seconds complete lock, then 5 seconds slow
      this.knockdown(120); // Self-knockdown for exhaustion
      this.exhaustionTimer = 5.0; // 5 seconds of 60% slow
    }
  }

  // ── MULTI-HIT ULTIMATE OVERRIDE ──
  initiateUltimateCombo() {
    this.isUltimateCombo = true;
    this.ultimateComboHits = 0;
    this.isFlinching = false; // invincible while performing ult
    
    if (this.currentAttackVariant === 'ULT_O') {
        this.ultimateComboMaxHits = 1; // 1 hit scan
        this.comboHitInterval = 10;
        this.isFlinching = false; // hit scan ignores flinch
    } else if (this.currentAttackVariant === 'ULT2') {
        this.ultimateComboMaxHits = 8; // Bát liên
        this.comboHitInterval = 3; // extremely fast 
    } else {
        this.ultimateComboMaxHits = 6; // Lục liên
        this.comboHitInterval = 6; // 0.1s
    }
    this.comboHitTimer = this.comboHitInterval;
  }

  processUltimateCombo(target, finishCallback) {
    this.comboHitTimer--;
    
    if (this.comboHitTimer <= 0) {
        this.ultimateComboHits++;
        
        let damage = this.getCurrentUltimateDamage() / this.ultimateComboMaxHits;
        const dir = this.facingRight ? 12 : -12;
        
          let ultIdxStr = 'ult0';
          if (this.currentAttackVariant === 'ULT2') ultIdxStr = 'ult1';
          else if (this.currentAttackVariant === 'ULT_O') ultIdxStr = 'ult2';
          const impactImg = (typeof Images !== 'undefined') ? Images.get(`hit_${this.charData.id}_${ultIdxStr}`) : null;
          
          if (this.ultimateComboHits >= this.ultimateComboMaxHits) {
               const oldBlock = target.isBlocking;
               target.isBlocking = false;
               target.invincibleTimer = 0;
               target.takeDamage(damage, dir * 4);
               target.isBlocking = oldBlock;
               target.knockdown(this.getCurrentUltimateKnockdown());
               
               this.onUltimateComplete(target);
               
               if (typeof Effects !== 'undefined') {
                  Effects.ultimateParticles(target.centerX, target.centerY, this.charData.projectileColor, this.charData.swordGlow, 50);
                  
                  if (impactImg) {
                     Effects.spawnSpriteImpact(target.centerX, target.centerY, impactImg, 0, 0.95); // Final hit scaled down heavily so it doesn't cover token
                  }
                  
                  Effects.screenShake(35);
                  Effects.flashScreen('#ffee44', 0.6);
                  if (typeof AudioManager !== 'undefined') AudioManager.heavyHit();
               }
               
               this.isUltimateCombo = false;
               finishCallback();
               return;
          } else {
               target.takeDamage(damage, dir);
               target.isFlinching = true;
               target.flinchTimer = 8;
               if (typeof Effects !== 'undefined') {
                  Effects.screenShake(10);
                  if (impactImg) {
                     // Spawns with random offset and rotation, scaled down heavily to 0.55
                     const randX = target.centerX + (Math.random() - 0.5) * 80;
                     const randY = target.centerY + (Math.random() - 0.5) * 80;
                     const randRot = Math.random() * Math.PI * 2;
                     Effects.spawnSpriteImpact(randX, randY, impactImg, randRot, 0.55);
                  }
               }
               if (typeof AudioManager !== 'undefined') {
                  AudioManager.hit();
               }
               
               this.comboHitTimer = this.comboHitInterval;
               if (this.currentAttackVariant !== 'ULT_O') { // God speed doesn't zig zag incrementally
                   this.x += dir * 2; 
                   // Zig zag vertical randomly
                   this.y += (Math.random() > 0.5 ? -15 : 15);
               }
          }
    }
  }

  getEnergyRegenRate() {
    return 12 / 60; // 12 energy per second
  }

  loadSprites() {
    super.loadSprites();
    this.sprites.crouch_walk1 = Images.get(`sprite_${this.charData.id}_crouch_walk1`);
    this.sprites.crouch_walk2 = Images.get(`sprite_${this.charData.id}_crouch_walk2`);
    
    this.sprites.heavy_attack = Images.get(`sprite_${this.charData.id}_heavy_attack`);
    this.sprites.heavy_jump_attack = Images.get(`sprite_${this.charData.id}_heavy_jump_attack`);
    this.sprites.heavy_crouch_attack = Images.get(`sprite_${this.charData.id}_heavy_crouch_attack`);
    this.sprites.projectile = Images.get(`sprite_${this.charData.id}_projectile`);
    this.sprites.jump_projectile = Images.get(`sprite_${this.charData.id}_jump_projectile`);
    this.sprites.crouch_projectile = Images.get(`sprite_${this.charData.id}_crouch_projectile`);
    this.sprites.block_pose = Images.get(`sprite_${this.charData.id}_block`);

    this.sprites.ultimate1_charge = Images.get(`sprite_${this.charData.id}_ultimate1_charge`);
    this.sprites.ultimate1_attack = Images.get(`sprite_${this.charData.id}_ultimate1_attack`);
    this.sprites.ultimate2_charge = Images.get(`sprite_${this.charData.id}_ultimate2_charge`);
    this.sprites.ultimate2_attack = Images.get(`sprite_${this.charData.id}_ultimate2_attack`);

    this.sprites.ultimate_pose = Images.get(`sprite_${this.charData.id}_ultimate_pose`);
    this.sprites.ultimate_dash = Images.get(`sprite_${this.charData.id}_ultimate_dash`);
    this.sprites.exhaust_pose = Images.get(`sprite_${this.charData.id}_exhaust_pose`);
  }

  _getCurrentSprite() {
    if (this.isKnockedDown && this.exhaustionTimer > 0 && this.sprites.exhaust_pose) return this.sprites.exhaust_pose;
    // Ultimate Cinematic & Dash
    if (this.isUltimate || this.isUltimateStance) {
      if (this.currentAttackVariant === 'ULT_O' && this.sprites.ultimate2_charge) return this.sprites.ultimate2_charge;
      if (this.currentAttackVariant === 'ULT2' && this.sprites.ultimate1_charge) return this.sprites.ultimate1_charge;
      if (this.currentAttackVariant === 'ULT1' && this.sprites.ultimate_pose) return this.sprites.ultimate_pose;
      if (this.sprites.ultimate_pose) return this.sprites.ultimate_pose;
    }
    if (this.isUltimateDash || this.isUltimateCombo) {
      if (this.currentAttackVariant === 'ULT_O' && this.sprites.ultimate2_attack) return this.sprites.ultimate2_attack;
      if (this.currentAttackVariant === 'ULT2' && this.sprites.ultimate1_attack) return this.sprites.ultimate1_attack;
      if (this.currentAttackVariant === 'ULT1' && this.sprites.ultimate_dash) return this.sprites.ultimate_dash;
    }

    if (this.isDodging) return this.sprites.crouch; // Zenitsu tucks low to dodge
    
    if (this.isBlocking && this.sprites.block_pose) return this.sprites.block_pose;

    if (!this.onGround || this.isJumping) {
      if (this.isKicking) return this.sprites.jump_kick;
      if (this.isAttacking) {
        if (this.currentAttackVariant === 'L') return this.sprites.jump_projectile;
        if (this.currentAttackVariant === 'J2') return this.sprites.heavy_jump_attack;
        return this.sprites.jump_attack;
      }
      return this.sprites.jump;
    }
    if (this.isCrouching) {
      if (this.isKicking) return this.sprites.crouch_kick;
      if (this.isAttacking) {
        if (this.currentAttackVariant === 'L') return this.sprites.crouch_projectile;
        if (this.currentAttackVariant === 'J2') return this.sprites.heavy_crouch_attack;
        return this.sprites.crouch_attack;
      }
      
      if (this.isMoving && !this.isDodging && !this.isBlocking) {
          const runIndex = Math.floor(Date.now() / 150) % 2;
          return runIndex === 0 ? this.sprites.crouch_walk1 : this.sprites.crouch_walk2;
      }
      return this.sprites.crouch;
    }
    
    if (this.isKicking) return this.sprites.kick;
    if (this.isAttacking) {
        if (this.currentAttackVariant === 'L') return this.sprites.projectile;
        if (this.currentAttackVariant === 'J2') return this.sprites.heavy_attack;
        return this.sprites.idle_attack;
    }

    if (this.isMoving && !this.isDodging && !this.isBlocking) {
      const runIndex = Math.floor(Date.now() / 100) % 2; // Faster run animation
      return runIndex === 0 ? this.sprites.run1 : this.sprites.run2;
    }
    
    return this.sprites.idle;
  }
  _drawCharacterSprite(ctx, cx, cy, scale) {
    let offsetY = 0;
    const currentSprite = this._getCurrentSprite();
    
    // V4 Image AI Generation adjustments: 
    // Run poses and crouch poses were drawn with empty space under the feet in the 1024 canvas
    if (currentSprite === this.sprites.run1 || currentSprite === this.sprites.run2) {
      offsetY = this.h * 0.08; // Push down 8%
    } 
    // Apply downward shift to ALL crouching sprites and the Dodge phase (which relies on the crouch frame)
    else if (this.isCrouching || this.isDodging) {
      // Tanjiro's base game crouch sinks by 35% (h * 0.35). 
      // We replicate that severe drop here so Zenitsu hugs the ground exactly like Tanjiro.
      offsetY = this.h * 0.35; 
    }
    // Exhaust pose might also need a slight push down if it floats?
    else if (currentSprite === this.sprites.exhaust_pose) {
      offsetY = this.h * 0.40; // Push down exhaustion pose heavily since he lies on the floor
    }

    super._drawCharacterSprite(ctx, cx, cy + offsetY, scale);
  }

  applyKeys(keys, canvasW) {
    if (this.isDead || this.isFlinching || this.isKnockedDown) {
      this.isChargingJ = false;
      this.chargeJTimer = 0;
      return;
    }
    
    if (this.isUltimate) return;

    // Penalty check: No jumping or dodging if exhausted
    const safeKeys = { ...keys };
    if (this.exhaustionTimer > 0) {
       safeKeys.jump = false;
       safeKeys.dodge = false;
    }

    const prev = this._prevKeys || {};

    // Dodge energy drain hook
    if (safeKeys.dodge && !prev.dodge && !this.isDodging) {
       if (this.energy < 5) safeKeys.dodge = false; // Cannot dodge if < 5 energy
       else {
           this.energy = Math.max(0, this.energy - 5); // Dodge costs 5 energy
       }
    }

    const superKeys = { ...safeKeys, attack: false, kick: false, projectile: false, ultimate: false, powerup: false, ult1: false, ult2: false };
    super.applyKeys(superKeys, canvasW);

    const now = performance.now() / 1000;

    // 1. Hold J logic (J1 vs J2)
    if (keys.attack && !this.isAttacking && !this.isKicking) {
      this.isChargingJ = true;
      this.chargeJTimer += 1/60; 
    } else if (!keys.attack && this.isChargingJ) {
      this.isChargingJ = false;
      const t = this.chargeJTimer;
      this.chargeJTimer = 0;
      
      const cd = t >= 0.3 ? 0.5 : 0.3;
      if (now - this.lastAttacks[t>=0.3?'j2':'j1'] > cd) {
        this.isAttacking = true;
        this.attackTimer = t >= 0.3 ? 24 : 12; // Base uses frame countdown
        this.swordSwingProgress = 0;
        this.lastAttacks[t>=0.3?'j2':'j1'] = now;
        if (window.AudioManager) window.AudioManager.slash();
        this.currentAttackVariant = t >= 0.3 ? 'J2' : 'J1';

        // J2 Dash component
        if (t >= 0.3) {
            const dir = this.facingRight ? 1 : -1;
            this.vx_bonus = dir * 15; // sudden forward propulsion
        }
      }
    }

    // 2. Kick (K)
    if (keys.kick && !prev.kick && !this.isAttacking && !this.isKicking && now - this.lastAttacks.k > 0.4) {
      this.isKicking = true;
      this.kickTimer = 15; // 0.25s
      this.lastAttacks.k = now;
      if (window.AudioManager) window.AudioManager.kick();
    }

    // 3. Projectile (L)
    if (keys.projectile && !prev.projectile && !this.isAttacking && !this.isKicking && now - this.lastAttacks.l > 1.2) {
      if (this.energy >= 8) { // standard cost
          this._fireProjectile(); 
          this.lastAttacks.l = now;
          this.currentAttackVariant = 'L';
          this.isAttacking = true;
          this.attackTimer = 18; 
          this.energy -= 8;
      }
    }

    // 4. PowerUp / U -> Nút Lục Liên (55 nộ)
    if (keys.powerup && !prev.powerup && !this.isAttacking && this.energy >= 55) {
      this.isUltimate = true;
      this.ultimateTimer = 0;
      this.energy -= 55;
      this.currentAttackVariant = 'ULT1'; // Lục liên
      this._transformStartMs = Date.now();
      if (window.AudioManager) window.AudioManager.ultimate();
    }

    // 5. Ultimate 1 / I -> Bát Liên (75 nộ)
    if (keys.ult1 && !prev.ult1 && !this.isAttacking && this.energy >= 75) {
      this.isUltimate = true;
      this.ultimateTimer = 0; 
      this.energy -= 75;
      this.currentAttackVariant = 'ULT2'; // Bát liên
      this._transformStartMs = Date.now();
      if (window.AudioManager) window.AudioManager.ultimate();
    }

    // 6. Ultimate 2 / O -> Thần Tốc (100 nộ)
    if (keys.ult2 && !prev.ult2 && !this.isAttacking && this.energy >= 100) {
      this.isUltimate = true;
      this.ultimateTimer = 0;
      this.energy -= 100;
      this.currentAttackVariant = 'ULT_O'; // Thần Tốc
      this._transformStartMs = Date.now();
      if (window.AudioManager) window.AudioManager.ultimate();
    }

    this._prevKeys = { ...keys };
  }

  // Override projectile to be much faster
  _fireProjectile() {
    const pivot = this.swordPivotWorld;
    const dir = this.facingRight ? 1 : -1;
    if (window.AudioManager) AudioManager.projectile();
    this.projectiles.push({
      x: pivot.x,
      y: pivot.y,
      vx: dir * 12, // Faster than Tanjiro's 9
      vy: 0,
      w: 90,
      h: 45, // narrow hit box
      life: 1.0,
      color: this.charData.projectileColor,
      glow: this.charData.projectileGlow,
      damage: this.getCurrentProjectileDamage(),
      owner: this,
      trailParticles: []
    });
  }

  // Override takeDamage for block counter timing
  takeDamage(amount, knockback = 0) {
    if (this.invincibleTimer > 0 || this.isDead) return 'none';
    if (this.isDummy) {
      amount = 0;
      knockback = 0;
    }
    if (this.isBlocking) {
      if (this.blockTime <= 0.15) { // 0.15s counter window (Stricter than Tanjiro)
        if (window.AudioManager) AudioManager.heavyHit();
        if (window.Effects) Effects.screenShake(6);
        return 'countered';
      }
      if (window.AudioManager) AudioManager.block();
      if (window.Effects) Effects.screenShake(3);
      // 75% damage reduction on normal block (Weaker than Tanjiro's 80%)
      const actualDamage = amount * 0.25;
      this.hp = Math.max(0, this.hp - actualDamage);
      if (window.Effects) Effects.floatingText(this.centerX, this.y + 20, Math.floor(actualDamage), 'damage');
      
      if (this.hp <= 0) {
        this.die();
        return 'killed';
      }
      return 'blocked'; 
    }

    const minHp = this.isTraining ? 1 : 0;
    this.hp = Math.max(minHp, this.hp - amount);

    if (window.Effects) Effects.floatingText(this.centerX, this.y + 20, Math.floor(amount), 'damage');

    // Being hit gives energy bonus (Same as base)
    this._gainEnergy(6);
    this.hitFlash = 8;
    if (window.Effects) {
      Effects.screenShake(amount > 30 ? 12 : 6);
      Effects.flashScreen('white', amount > 30 ? 0.5 : 0.25);
    }

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

  _drawSlashVFX(ctx, cx, cy) {
    let vfxKey = null;
    if (this.currentAttackVariant === 'J1') vfxKey = 'thunder_slash1';
    else if (this.currentAttackVariant === 'J2') vfxKey = 'thunder_slash2';
    
    let vfxImg = null;
    if (vfxKey && typeof Images !== 'undefined') {
       vfxImg = Images.get(`vfx_zenitsu_${vfxKey}`);
    }

    if (vfxImg) {
      ctx.save();
      ctx.translate(cx, cy);
      const dir = this.facingRight ? 1 : -1;
      ctx.scale(dir, 1);
      
      ctx.globalAlpha = Math.max(0, 1 - this.swordSwingProgress);
      ctx.globalCompositeOperation = 'screen';
      
      const drawW = 160; 
      const drawH = drawW * (vfxImg.height / vfxImg.width);
      
      if (this.currentAttackVariant === 'J1') {
         ctx.drawImage(vfxImg, 20, -drawH/2, drawW, drawH);
      } else if (this.currentAttackVariant === 'J2') {
         ctx.drawImage(vfxImg, 0, -drawH/2, drawW * 1.5, drawH * 1.5);
      }
      ctx.restore();
    } else {
      if (super._drawSlashVFX) super._drawSlashVFX(ctx, cx, cy);
    }
  }

  _drawKickEffect(ctx) {
    const vfxImg = (typeof Images !== 'undefined') ? Images.get('vfx_zenitsu_thunder_kick') : null;
    if (!vfxImg) {
      if (super._drawKickEffect) super._drawKickEffect(ctx);
      return;
    }
    const progress = 1 - this.kickTimer / this.kickDuration;
    const dir = this.facingRight ? 1 : -1;
    const kickY = this.y + this.h * 0.65;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    if (progress < 0.2) ctx.globalAlpha = progress / 0.2;
    else ctx.globalAlpha = Math.max(0, 1 - Math.pow(progress, 2));
    ctx.translate(this.centerX, kickY);
    ctx.scale(dir, 1);
    const drawW = 100 + progress * 60;
    const drawH = drawW * (vfxImg.height / vfxImg.width);
    const vx = 20 + progress * 30;
    ctx.drawImage(vfxImg, vx, -drawH/2, drawW, drawH);
    ctx.restore();
  }

  _drawProjectile(ctx, p) {
    const vfxImg = (typeof Images !== 'undefined') ? Images.get('vfx_zenitsu_thunder_proj') : null;
    if (!vfxImg) {
      if (super._drawProjectile) super._drawProjectile(ctx, p);
      return;
    }
    ctx.save();
    const sh = window.Effects ? Effects.getShake() : {x:0, y:0};
    ctx.translate(p.x + sh.x, p.y + sh.y);
    ctx.scale(p.vx > 0 ? 1 : -1, 1);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = p.life > 0.8 ? (1.0 - p.life) / 0.2 : (p.life < 0.1 ? p.life / 0.1 : 1.0);
    const drawW = p.w * 1.5;
    const drawH = drawW * (vfxImg.height / vfxImg.width);
    ctx.drawImage(vfxImg, -drawW/2, -drawH/2, drawW, drawH);
    ctx.restore();
  }

  _drawCenteredVFX(ctx, vfx, scaleParam = 1.0, isPulsing = false, globalAlpha = 1.0, nudgeY = -20) {
    if (!vfx) return;
    ctx.save();
    const sh = typeof Effects !== 'undefined' ? Effects.getShake() : {x:0, y:0};
    ctx.translate(this.centerX + sh.x, this.centerY + sh.y);
    ctx.globalCompositeOperation = 'screen';
    let drawScale = scaleParam;
    if (isPulsing) {
       drawScale += Math.sin(Date.now() / 150) * 0.05;
    }
    if (!this.facingRight) ctx.scale(-1, 1);
    ctx.globalAlpha = globalAlpha;
    const drawW = this.h * drawScale * 1.5;
    const drawH = drawW * (vfx.height / vfx.width);
    ctx.drawImage(vfx, -drawW/2, -drawH/2 + nudgeY, drawW, drawH);
    ctx.restore();
  }

  draw(ctx, canvasW, canvasH) {
    if (this.isDodging && this.dodgeTimer > this.dodgeDuration * 0.2) {
       const dodgeVfx = (typeof Images !== 'undefined') ? Images.get('vfx_zenitsu_thunder_dodge') : null;
       if (dodgeVfx) {
          this._drawCenteredVFX(ctx, dodgeVfx, 1.2, false, 0.4, 0);
       }
    }
    
    super.draw(ctx, canvasW, canvasH);
    
    // Ultimate VFX hooks
    let ultKey = null;
    let isAnyUlt = false;
    const isCharging = this.isUltimate || this.isUltimateStance;
    const isDashing = this.isUltimateDash;
    const inUltimateState = isCharging || this.isUltimateDash || this.isUltimateCombo;
    
    if (this.currentAttackVariant === 'ULT1') { // U -> ulti0
       isAnyUlt = true;
       if (isDashing) ultKey = 'ultimate_dash';
    } else if (this.currentAttackVariant === 'ULT2') { // I -> ulti1
       isAnyUlt = true;
       if (isDashing) ultKey = 'ult1_attack';
    } else if (this.currentAttackVariant === 'ULT_O') { // O -> ulti2
       isAnyUlt = true;
       if (isDashing) ultKey = 'ult2_attack';
    }
    
    // Transform & Aura for ALL Ultimates
    if (isAnyUlt && inUltimateState) {
       // 1. Transform burst (very faint aura evaporation / túa ra)
       const elapsed = (Date.now() - (this._transformStartMs || Date.now())) / 1000;
       if (elapsed <= 0.6) {
           const transformVfx = (typeof Images !== 'undefined') ? Images.get('vfx_zenitsu_awaken_transform') : null;
           const p = elapsed / 0.6; // 0 to 1
           
           // "thật mờ thôi, túa ra rồi biến mất" 
           const scale = 1.2 + (p * 0.8); // Expand (zoom/túa ra) from 1.2 to 2.0
           const alpha = 0.3 * (1.0 - p); // Start extremely faint at 0.3 opacity and fade to 0
           this._drawCenteredVFX(ctx, transformVfx, scale, false, alpha); 
       }
    }
    
    if (ultKey) {
       const vfx = (typeof Images !== 'undefined') ? Images.get(`vfx_zenitsu_${ultKey}`) : null;
       if (vfx) {
          if (ultKey.endsWith('_attack') || ultKey === 'ultimate_pose' || ultKey === 'ultimate_dash') {
             this._drawCenteredVFX(ctx, vfx, 1.5, false, 0.8, 0);
          } else {
             const elapsed = (Date.now() - (this._transformStartMs || Date.now())) / 1000;
             const p = Math.min(1, elapsed / 0.5);
             this._drawCenteredVFX(ctx, vfx, 1.0 + p * 1.5, true, 0.5 + p*0.5, 0);
          }
       }
    }
    
    // Exhaustion Aura (Smoke/Spark FX when lying down)
    if (this.exhaustionTimer > 0) {
      const vfx = (typeof Images !== 'undefined') ? Images.get('vfx_zenitsu_exhaust_aura') : null;
      if (vfx) {
         ctx.save();
         const sh = typeof Effects !== 'undefined' ? Effects.getShake() : {x:0, y:0};
         ctx.translate(this.centerX + sh.x, this.centerY + sh.y);
         ctx.globalCompositeOperation = 'screen';
         const t = (Date.now() % 2000) / 2000;
         const driftY = -t * 60;
         const driftX = Math.sin(t * Math.PI * 2) * 5;
         ctx.translate(driftX, driftY);
         if (!this.facingRight) ctx.scale(-1, 1);
         const drawW = this.h * 1.2;
         const drawH = drawW * (vfx.height / vfx.width);
         let alpha = 0.6;
         if (t < 0.2) alpha = 0.6 * (t / 0.2);
         else if (t > 0.8) alpha = 0.6 * ((1 - t) / 0.2);
         ctx.globalAlpha = Math.min(this.exhaustionTimer, alpha);
         ctx.drawImage(vfx, -drawW/2, -drawH/2, drawW, drawH);
         ctx.restore();
      }
    }
  }

  update(canvasW, canvasH) {
    if (this.isDead) return super.update(canvasW, canvasH);
    const dt = 1/60;

    if (this.exhaustionTimer > 0) {
       this.exhaustionTimer -= dt;
       if (this.exhaustionTimer <= 0) {
           this.exhaustionTimer = 0;
           this.isFlinching = false;
       }
    }

    // Apply J2 bonus momentum
    if (this.vx_bonus) {
        this.x += this.vx_bonus;
        this.vx_bonus *= 0.8; // Decay velocity rapidly
        if (Math.abs(this.vx_bonus) < 0.5) this.vx_bonus = 0;
    }

    super.update(canvasW, canvasH);

    // FIX FOR V4 PRECISE RENDERING:
    // All Zenitsu V4 sprites (including Crouch, Ultimate, Exhaust) are perfectly bottom-aligned to the 1024x1024 canvas boundary.
    // We must OVERRIDE the base game's artificial Y-shifting (which lowers Y by 0.65*h during crouch/knockdown),
    // and explicitly nullify the vertical zig-zag from his Ultimates once he is on the ground.
    if (this.onGround && !this.isJumping && !this.vy) {
        this.y = this.groundY - this.h;
    }
  }
}
