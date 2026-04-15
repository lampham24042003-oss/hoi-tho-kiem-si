// tanjiro.js - Custom Fighter Logic for Kamado Tanjiro
'use strict';

class TanjiroFighter extends Fighter {
  constructor(charData, isP2, x, canvasH, facingRight) {
    super(charData, isP2, x, canvasH, facingRight);
    
    // Tanjiro Specific Stats & Overrides
    this.maxHp = charData.maxHp || 5000;
    this.hp = this.maxHp;
    this.energy = charData.energy !== undefined ? charData.energy : 100;
    
    // State machine additions
    this.isPowerUp = false;
    this.powerUpTimer = 0;
    
    // J charge logic
    this.chargeJTimer = 0;
    this.isChargingJ = false;
    
    // Custom timers
    this.ult1Timer = 0;
    this.ult2Timer = 0;
    this.exhaustionTimer = 0;
    
    // Custom actions
    this.isFlipping = false;
    this.flipTimer = 0;
    this.flipDuration = 0.5; // 30 frames
    this.flipCooldown = 0.7; 
    this.lastFlipTime = -this.flipCooldown;
    
    // Skill Cooldowns
    this.lastAttacks = {
      j1: 0, j2: 0, k: 0, l: 0
    };
  }

  // ── CUSTOM STAT GETTERS (Overrides Fighter) ──
  getCurrentSpeed() {
    if (this.exhaustionTimer > 0) return 3.0; // -30% speed
    return this.isPowerUp ? 5.0 : 4.2;
  }

  getCurrentAttackDamage() {
    let dmg = 55; // default J1
    if (this.currentAttackVariant === 'J2') {
      dmg = 78;
    } else if (this.currentAttackVariant === 'ULT1' || this.currentAttackVariant === 'ULT2') {
      // Return flat ultimate damage if attack is hijacked by ult directly
      // In this system, ultimate hits might be processed differently, but just in case:
      return this.currentAttackVariant === 'ULT1' ? 130 : 131; // per hit logic can be 520/4
    }
    return this.isPowerUp ? dmg * 2 : dmg;
  }

  getCurrentKickDamage() {
    let dmg = 48; // default K
    return this.isPowerUp ? 96 : 48; 
  }

  getCurrentProjectileDamage() {
    let dmg = 62; // default L
    return this.isPowerUp ? 124 : 62;
  }

  getCurrentUltimateDamage() {
    if (this.currentAttackVariant === 'ULT2') {
      return 920; 
    }
    return 520; // ULT1
  }

  getCurrentUltimateKnockdown() {
    if (this.currentAttackVariant === 'ULT2') {
      return 132; // 2.2s at 60fps
    }
    return 72; // 1.2s at 60fps
  }

  onUltimateComplete(target) {
    if (this.currentAttackVariant === 'ULT2') {
      // simplified: just exhaust self
      this.exhaustionTimer = 1.5; // 1.5 seconds exhaustion
      this.isFlinching = true; // Force into a panting/tired state mechanically if needed
    }
  }

  // ── MULTI-HIT ULTIMATE OVERRIDE ───────────────────────────────
  initiateUltimateCombo(target) {
    this.isUltimateCombo = true;
    this.ultimateComboHits = 0;
    
    if (this.currentAttackVariant === 'ULT2') {
        this.ultimateComboMaxHits = 7;
        this.comboHitInterval = 8; // approx 0.13s per hit
    } else {
        this.ultimateComboMaxHits = 4;
        this.comboHitInterval = 10; // approx 0.16s per hit
    }
    this.comboHitTimer = 0;
  }

  processUltimateCombo(target, finishCallback) {
    this.comboHitTimer--;
    
    if (this.comboHitTimer <= 0) {
        this.ultimateComboHits++;
        
        // Split total damage across hits
        let damage = this.getCurrentUltimateDamage() / this.ultimateComboMaxHits;
        const dir = this.facingRight ? 10 : -10;
        
        // Final hit special effects & finish
        if (this.ultimateComboHits >= this.ultimateComboMaxHits) {
             const oldBlock = target.isBlocking;
             target.isBlocking = false;
             target.invincibleTimer = 0;
             target.takeDamage(damage, dir * 3);
             target.isBlocking = oldBlock;
             target.knockdown(this.getCurrentUltimateKnockdown());
             
             this.onUltimateComplete(target);
             
             if (typeof Effects !== 'undefined') {
                // Force fire colors for ultimate instead of base charData colors
                Effects.ultimateParticles(target.centerX, target.centerY, '#ff3366', '#ff0022', 50);
                const ultIdx = (this.currentAttackVariant === 'ULT2') ? 'ult2' : 'ult1';
                const impactImg = (typeof Images !== 'undefined') ? Images.get(`hit_${this.charData.id}_${ultIdx}`) : null;
                
                if (impactImg) {
                   Effects.spawnSpriteImpact(target.centerX, target.centerY, impactImg, 0, 1.3);
                }
                
                Effects.screenShake(45); // Aggressive final hit shake
                if (typeof AudioManager !== 'undefined') AudioManager.heavyHit();
             }
             
             this.isUltimateCombo = false;
             finishCallback();
             return;
        } else {
             // Intermediate hits
             target.takeDamage(damage, dir);
             target.isFlinching = true;
             target.flinchTimer = 15; // short flinch
             
             if (typeof Effects !== 'undefined') {
                Effects.screenShake(16); // Aggressive shake
                
                // SPRAY ULTIMATE IMPACT ON EVERY HIT AS REQUESTED
                const ultIdx = (this.currentAttackVariant === 'ULT2') ? 'ult2' : 'ult1';
                const impactImg = (typeof Images !== 'undefined') ? Images.get(`hit_${this.charData.id}_${ultIdx}`) : null;
                if (impactImg) {
                   const randX = target.centerX + (Math.random() - 0.5) * 60;
                   const randY = target.centerY + (Math.random() - 0.5) * 60;
                   const randRot = Math.random() * Math.PI * 2;
                   // Lower scale slightly for intermediate hits so it layers nicely
                   Effects.spawnSpriteImpact(randX, randY, impactImg, randRot, 0.85);
                } else if (typeof CharEffects !== 'undefined') {
                   // Fallback
                   CharEffects.hitEffect(target.centerX + (Math.random()-0.5)*40, target.centerY + (Math.random()-0.5)*40, this.charData.id, 'fire_sword');
                }
             }
             if (typeof AudioManager !== 'undefined') {
                AudioManager.hit();
             }
             
             this.comboHitTimer = this.comboHitInterval;
             // Push attacker slightly forward to visually track combo
             this.x += dir;
        }
    }
  }
  // ──────────────────────────────────────────────────────────────

  getEnergyRegenRate() {
    return 8 / 60; // 8 energy per second
  }

  loadSprites() {
    super.loadSprites();
    this.sprites.crouch_walk1 = Images.get(`sprite_${this.charData.id}_crouch_walk1`);
    this.sprites.crouch_walk2 = Images.get(`sprite_${this.charData.id}_crouch_walk2`);
    
    // Extra attacks
    this.sprites.heavy_attack = Images.get(`sprite_${this.charData.id}_heavy_attack`);
    this.sprites.heavy_jump_attack = Images.get(`sprite_${this.charData.id}_heavy_jump_attack`);
    this.sprites.heavy_crouch_attack = Images.get(`sprite_${this.charData.id}_heavy_crouch_attack`);
    this.sprites.projectile = Images.get(`sprite_${this.charData.id}_projectile`);
    this.sprites.jump_projectile = Images.get(`sprite_${this.charData.id}_jump_projectile`);
    this.sprites.crouch_projectile = Images.get(`sprite_${this.charData.id}_crouch_projectile`);
    this.sprites.block_pose = Images.get(`sprite_${this.charData.id}_block`);

    // PowerUp mode sprites
    this.sprites.powerup_idle = Images.get(`sprite_${this.charData.id}_powerup_idle`);
    this.sprites.powerup_run1 = Images.get(`sprite_${this.charData.id}_powerup_run1`);
    this.sprites.powerup_run2 = Images.get(`sprite_${this.charData.id}_powerup_run2`);
    this.sprites.powerup_crouch = Images.get(`sprite_${this.charData.id}_powerup_crouch`);
    this.sprites.powerup_jump = Images.get(`sprite_${this.charData.id}_powerup_jump`);
    this.sprites.powerup_crouch_walk1 = Images.get(`sprite_${this.charData.id}_powerup_crouch_walk1`);
    this.sprites.powerup_crouch_walk2 = Images.get(`sprite_${this.charData.id}_powerup_crouch_walk2`);
    this.sprites.powerup_pose = Images.get(`sprite_${this.charData.id}_powerup_pose`);
    
    // B2: Powerup Attacks
    this.sprites.powerup_idle_attack = Images.get(`sprite_${this.charData.id}_powerup_idle_attack`);
    this.sprites.powerup_heavy_attack = Images.get(`sprite_${this.charData.id}_powerup_heavy_attack`);
    this.sprites.powerup_kick = Images.get(`sprite_${this.charData.id}_powerup_kick`);
    this.sprites.powerup_projectile = Images.get(`sprite_${this.charData.id}_powerup_projectile`);
    
    this.sprites.powerup_jump_attack = Images.get(`sprite_${this.charData.id}_powerup_jump_attack`);
    this.sprites.powerup_jump_heavy_attack = Images.get(`sprite_${this.charData.id}_powerup_jump_heavy_attack`);
    this.sprites.powerup_jump_kick = Images.get(`sprite_${this.charData.id}_powerup_jump_kick`);
    this.sprites.powerup_jump_projectile = Images.get(`sprite_${this.charData.id}_powerup_jump_projectile`);

    this.sprites.powerup_crouch_attack = Images.get(`sprite_${this.charData.id}_powerup_crouch_attack`);
    this.sprites.powerup_crouch_heavy_attack = Images.get(`sprite_${this.charData.id}_powerup_crouch_heavy_attack`);
    this.sprites.powerup_crouch_kick = Images.get(`sprite_${this.charData.id}_powerup_crouch_kick`);
    this.sprites.powerup_crouch_projectile = Images.get(`sprite_${this.charData.id}_powerup_crouch_projectile`);

    // Ultimates
    this.sprites.ultimate1_charge = Images.get(`sprite_${this.charData.id}_ultimate1_charge`);
    this.sprites.ultimate1_attack = Images.get(`sprite_${this.charData.id}_ultimate1_attack`);
    this.sprites.ultimate2_charge = Images.get(`sprite_${this.charData.id}_ultimate2_charge`);
    this.sprites.ultimate2_attack = Images.get(`sprite_${this.charData.id}_ultimate2_attack`);

    this.sprites.ultimate_pose = Images.get(`sprite_${this.charData.id}_ultimate_pose`);
    this.sprites.exhaust_pose = Images.get(`sprite_${this.charData.id}_exhaust_pose`);
  }

  _getCurrentSprite() {
    if (this.exhaustionTimer > 0 && this.sprites.exhaust_pose) return this.sprites.exhaust_pose;
    // Ultimate Cinematic & Dash
    if (this.isUltimateStance) {
      if (this.currentAttackVariant === 'ULT2' && this.sprites.ultimate2_charge) return this.sprites.ultimate2_charge;
      if (this.currentAttackVariant === 'ULT1' && this.sprites.ultimate1_charge) return this.sprites.ultimate1_charge;
      if (this.sprites.ultimate1_charge) return this.sprites.ultimate_pose;
    }
    if (this.isUltimateDash || this.isUltimateCombo) {
      if (this.currentAttackVariant === 'ULT2' && this.sprites.ultimate2_attack) return this.sprites.ultimate2_attack;
      if (this.currentAttackVariant === 'ULT1' && this.sprites.ultimate1_attack) return this.sprites.ultimate1_attack;
    }

    // PowerUp Casting
    if (this.isPowerUpCast) return this.sprites.powerup_idle; // Fix green square: fallback to idle power directly

    // Is Buff active? Select base state
    const isBuff = this.isPowerUp;

    if (this.isDodging) {
        return isBuff ? this.sprites.powerup_crouch : this.sprites.crouch;
    }
    
    if (this.isBlocking && this.sprites.block_pose) {
        return this.sprites.block_pose;
    }

    if (!this.onGround || this.isJumping) {
      if (this.isKicking) return isBuff ? this.sprites.powerup_jump_kick : this.sprites.jump_kick;
      if (this.isAttacking) {
        if (this.currentAttackVariant === 'L') return isBuff ? this.sprites.powerup_jump_projectile : this.sprites.jump_projectile;
        if (this.currentAttackVariant === 'J2') return isBuff ? this.sprites.powerup_jump_heavy_attack : this.sprites.heavy_jump_attack;
        return isBuff ? this.sprites.powerup_jump_attack : this.sprites.jump_attack;
      }
      return isBuff ? this.sprites.powerup_jump : this.sprites.jump;
    }
    if (this.isCrouching) {
      if (this.isKicking) return isBuff ? this.sprites.powerup_crouch_kick : this.sprites.crouch_kick;
      if (this.isAttacking) {
        if (this.currentAttackVariant === 'L') return isBuff ? this.sprites.powerup_crouch_projectile : this.sprites.crouch_projectile;
        if (this.currentAttackVariant === 'J2') return isBuff ? this.sprites.powerup_crouch_heavy_attack : this.sprites.heavy_crouch_attack;
        return isBuff ? this.sprites.powerup_crouch_attack : this.sprites.crouch_attack;
      }
      
      // Crouch Move
      if (this.isMoving && !this.isDodging && !this.isBlocking) {
          const runIndex = Math.floor(Date.now() / 150) % 2;
          if (isBuff) {
              return runIndex === 0 ? this.sprites.powerup_crouch_walk1 : this.sprites.powerup_crouch_walk2;
          }
          return runIndex === 0 ? this.sprites.crouch_walk1 : this.sprites.crouch_walk2;
      }
      return isBuff ? this.sprites.powerup_crouch : this.sprites.crouch;
    }
    
    // Standing Attacks
    if (this.isKicking) return isBuff ? this.sprites.powerup_kick : this.sprites.kick;
    if (this.isAttacking) {
        if (this.currentAttackVariant === 'L') return isBuff ? this.sprites.powerup_projectile : this.sprites.projectile;
        if (this.currentAttackVariant === 'J2') return isBuff ? this.sprites.powerup_heavy_attack : this.sprites.heavy_attack;
        return isBuff ? this.sprites.powerup_idle_attack : this.sprites.idle_attack;
    }

    // Movement
    if (this.isMoving && !this.isDodging && !this.isBlocking) {
      const runIndex = Math.floor(Date.now() / 120) % 2;
      if (isBuff) {
        return runIndex === 0 ? this.sprites.powerup_run1 : this.sprites.powerup_run2;
      }
      return runIndex === 0 ? this.sprites.run1 : this.sprites.run2;
    }
    
    return isBuff ? this.sprites.powerup_idle : this.sprites.idle;
  }

  // Override applyKeys to handle Tanjiro's unique inputs
  applyKeys(keys, canvasW) {
    if (this.isDead || this.isFlinching || this.isKnockedDown) {
      if (!this.isDead) { // Allow charge dropping if flinching
        this.isChargingJ = false;
        this.chargeJTimer = 0;
      }
      return;
    }
    
    if (this.isFlipping || this.isUltimate) return;

    const prev = this._prevKeys || {};

    // Pass safe keys to super so standard Movement, Jump, Crouch, Block, Dodge all work properly!
    const superKeys = { ...keys, attack: false, kick: false, projectile: false, ultimate: false };
    super.applyKeys(superKeys, canvasW);

    const now = performance.now() / 1000;

    // Custom Combat Handlers
    // 1. Hold J logic (J1 vs J2)
    if (keys.attack && !this.isAttacking && !this.isKicking) {
      this.isChargingJ = true;
      this.chargeJTimer += 1/60; // Approximate dt
    } else if (!keys.attack && this.isChargingJ) {
      this.isChargingJ = false;
      const t = this.chargeJTimer;
      this.chargeJTimer = 0;
      
      const cd = t >= 0.3 ? 0.65 : 0.45;
      if (now - this.lastAttacks[t>=0.3?'j2':'j1'] > cd) {
        this.isAttacking = true;
        this.attackTimer = t >= 0.3 ? 36 : this.attackDuration; // Base uses frame countdown (~60fps)
        this.swordSwingProgress = 0;
        this.lastAttacks[t>=0.3?'j2':'j1'] = now;
        if (window.AudioManager) window.AudioManager.slash();
        this.currentAttackVariant = t >= 0.3 ? 'J2' : 'J1';
      }
    }

    // 2. Kick (K)
    if (keys.kick && !prev.kick && !this.isAttacking && !this.isKicking && now - this.lastAttacks.k > 0.55) {
      this.isKicking = true;
      this.kickTimer = this.kickDuration; // Frame countdown
      this.lastAttacks.k = now;
      if (window.AudioManager) window.AudioManager.kick();
    }

    // 3. Projectile (L)
    if (keys.projectile && !prev.projectile && !this.isAttacking && !this.isKicking && now - this.lastAttacks.l > 0.8) {
      this._fireProjectile(); 
      this.lastAttacks.l = now;
      this.currentAttackVariant = 'L';
      this.isAttacking = true;
      this.attackTimer = 24; // 24 frames lock for the projectile pose
    }

    // 4. PowerUp (U)
    if (keys.powerup && !prev.powerup && !this.isAttacking && !this.isPowerUp && this.energy >= 70) {
      this.isPowerUp = true;
      this.powerUpTimer = 12; // 12 seconds buff
      this.energy -= 70;
      // trigger lock casting pose
      this.isPowerUpCast = true;
      this.isPowerUpCastTrigger = true; // Trigger for game_v3.js to intercept and freeze CinematicOverlay
      this.powerUpCastTimer = 0.8;
      this._transformStartMs = Date.now();
      if (typeof AudioManager !== 'undefined') AudioManager.energyCharge();
      this.isMoving = false;
    }

    // 5. Ultimate 1 (I) -> Viêm Vũ
    if (keys.ult1 && !prev.ult1 && this.energy >= 80 && !this.isUltimate && !this.isPowerUp) {
      this.isUltimate = true;
      this.ultimateTimer = 0; // Ultimate works differently, usually counts up in specific classes
      this.energy -= 80;
      this.currentAttackVariant = 'ULT1';
      this._transformStartMs = Date.now();
      if (window.AudioManager) window.AudioManager.ultimate();
    }

    // 6. Ultimate 2 (O) -> Liên Vũ Bất Tận
    if (keys.ult2 && !prev.ult2 && this.energy >= 95 && !this.isUltimate && !this.isPowerUp) {
      this.isUltimate = true;
      this.ultimateTimer = 0;
      this.energy -= 95;
      this.currentAttackVariant = 'ULT2';
      this._transformStartMs = Date.now();
      if (window.AudioManager) window.AudioManager.ultimate();
    }

    this._prevKeys = { ...keys };
  }

  _drawSlashVFX(ctx, cx, cy) {
    let vfxKey = null;
    const isBuff = this.isPowerUp;

    if (this.currentAttackVariant === 'J1') vfxKey = isBuff ? 'fire_slash1' : 'water_slash1';
    else if (this.currentAttackVariant === 'J2') vfxKey = isBuff ? 'fire_slash2' : 'water_slash2';
    else if (this.currentAttackVariant === 'L') vfxKey = isBuff ? 'fire_proj' : 'water_proj'; // Wait, L is projectile, not slash vfx drawn here
    
    let vfxImg = null;
    if (vfxKey && typeof Images !== 'undefined') {
       vfxImg = Images.get(`vfx_${this.charData.id}_${vfxKey}`);
    }

    if (vfxImg) {
      ctx.save();
      ctx.translate(cx, cy);
      const dir = this.facingRight ? 1 : -1;
      ctx.scale(dir, 1);
      
      // Swing logic: fade out over progress
      ctx.globalAlpha = Math.max(0, 1 - this.swordSwingProgress);
      ctx.globalCompositeOperation = 'screen';
      
      const drawW = 160; 
      const drawH = drawW * (vfxImg.height / vfxImg.width);
      
      // Tùy chỉnh vị trí theo từng chiêu
      if (this.currentAttackVariant === 'J1') {
         ctx.drawImage(vfxImg, 20, -drawH/2, drawW, drawH);
      } else if (this.currentAttackVariant === 'J2') {
         // Chiêu J2 quạt rộng và to hơn
         ctx.drawImage(vfxImg, 0, -drawH/2 + 20, drawW * 1.5, drawH * 1.5);
      } else {
         ctx.drawImage(vfxImg, 20, -drawH/2, drawW, drawH);
      }
      
      ctx.restore();
    } else {
      super._drawSlashVFX(ctx, cx, cy);
    }
  }

  _drawKickEffect(ctx) {
    let vfxKey = this.isPowerUp ? 'fire_kick' : 'water_kick';
    const vfx = (typeof Images !== 'undefined') ? Images.get(`vfx_${this.charData.id}_${vfxKey}`) : null;
    
    if (!vfx) {
      super._drawKickEffect(ctx);
      return;
    }

    const progress = 1 - this.kickTimer / this.kickDuration;
    const dir = this.facingRight ? 1 : -1;
    const kickY = this.y + this.h * 0.65; // Knee/Foot level

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    // Nổ bung ra mạnh rồi tắt nhanh hơn
    if (progress < 0.2) ctx.globalAlpha = progress / 0.2;
    else ctx.globalAlpha = Math.max(0, 1 - Math.pow(progress, 2));
    
    ctx.translate(this.centerX, kickY);
    ctx.scale(dir, 1);
    
    // Rotate the kick slightly depending on the pose
    if (!this.onGround || this.isJumping) ctx.rotate(0.3);
    if (this.isCrouching) ctx.rotate(-0.4);
    
    const drawW = 100 + progress * 60; // Expands outward
    const drawH = drawW * (vfx.height / vfx.width);
    
    const vx = 20 + progress * 30; // Push forward
    ctx.drawImage(vfx, vx, -drawH/2, drawW, drawH);

    ctx.restore();
  }

  _fireProjectile() {
    super._fireProjectile();
    // Override color logic if powerup to allow VFX separation
    if (this.isPowerUp && this.projectiles.length > 0) {
      const p = this.projectiles[this.projectiles.length - 1];
      p.color = '#ff3366'; // Arbitrary fire color to trick VFX mapper
    }
  }

  _drawProjectile(ctx, p) {
    // Determine which VFX key to load based on when projectile spawned or current state
    // We can assume powerup projectiles are fire if they spawn with fire damage or check their color
    // A quick hack: see if projectile color is projectileColor (water) or not
    let vfxKey = (p.color === this.charData.projectileColor) ? 'water_proj' : 'fire_proj';
    const vfx = (typeof Images !== 'undefined') ? Images.get(`vfx_${this.charData.id}_${vfxKey}`) : null;

    if (!vfx) {
      super._drawProjectile(ctx, p);
      return;
    }

    ctx.save();
    const sh = window.Effects ? Effects.getShake() : {x:0, y:0};
    ctx.translate(p.x + sh.x, p.y + sh.y);
    ctx.scale(p.vx > 0 ? 1 : -1, 1);
    
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = p.life > 0.8 ? (1.0 - p.life) / 0.2 : (p.life < 0.1 ? p.life / 0.1 : 1.0);
    
    const drawW = p.w * 1.5;
    const drawH = drawW * (vfx.height / vfx.width);
    
    ctx.drawImage(vfx, -drawW/2, -drawH/2, drawW, drawH);
    ctx.restore();
  }

  _drawCenteredVFX(ctx, vfx, scaleParam = 1.0, isPulsing = false, globalAlpha = 1.0) {
    if (!vfx) return;
    ctx.save();
    const sh = typeof Effects !== 'undefined' ? Effects.getShake() : {x:0, y:0};
    ctx.translate(this.centerX + sh.x, this.centerY + sh.y);
    ctx.globalCompositeOperation = 'screen';
    
    let drawScale = scaleParam;
    if (isPulsing) {
       drawScale += Math.sin(Date.now() / 150) * 0.05;
    }
    
    // Scale flip if character facing left
    if (!this.facingRight) ctx.scale(-1, 1);
    
    ctx.globalAlpha = globalAlpha;
    const drawW = this.h * drawScale * 1.5; // Base visual scaling
    const drawH = drawW * (vfx.height / vfx.width);
    
    // Nudge higher to center perfectly on the chest of character
    ctx.drawImage(vfx, -drawW/2, -drawH/2 - 20, drawW, drawH);
    ctx.restore();
  }

  draw(ctx, canvasW, canvasH) {
    super.draw(ctx, canvasW, canvasH);
    
    // --- U: PowerUp Cast Transform ---
    if (this.isPowerUpCast) {
       const vfx = (typeof Images !== 'undefined') ? Images.get('vfx_tanjiro_mark_transform') : null;
       const elapsed = (Date.now() - (this._transformStartMs || Date.now())) / 1000;
       if (elapsed < 0.4) {
           const p = Math.min(1, elapsed / 0.4);
           // Rapidly scale out and fade for an explosive dynamic feel
           this._drawCenteredVFX(ctx, vfx, 1.2 + p * 1.0, false, 1 - (p*p)); 
       }
    }
    
    // U: PowerUp Active Aura (REMOVED AS REQUESTED)
    
    // --- I, O: Ultimate States VFX ---
    let ultKey = null;
    if (this.currentAttackVariant === 'ULT1' || this.currentAttackVariant === 'ULT2') {
       const u = this.currentAttackVariant.toLowerCase();
       // Always use mark_transform for the opening stance instead of custom ones
       if (this.isUltimateStance) ultKey = `mark_transform`;
       else if (this.isUltimateDash) ultKey = `${u}_aura`;
       else if (this.isUltimateCombo) ultKey = `${u}_attack`;
    }
    
    if (ultKey) {
       const vfx = (typeof Images !== 'undefined') ? Images.get(`vfx_tanjiro_${ultKey}`) : null;
       if (vfx) {
          if (ultKey.endsWith('_attack')) {
             // Transparent and smaller so it doesn't block impacts
             this._drawCenteredVFX(ctx, vfx, 1.3, false, 0.45);
          } else if (ultKey === 'mark_transform') {
             const elapsed = (Date.now() - (this._transformStartMs || Date.now())) / 1000;
             if (elapsed < 0.4) {
                 const p = Math.min(1, elapsed / 0.4);
                 this._drawCenteredVFX(ctx, vfx, 1.5 + p * 1.5, false, 1 - (p*p));
             }
          } else {
             this._drawCenteredVFX(ctx, vfx, 2.0, ultKey.endsWith('_aura'), 0.8);
          }
       }
    }
    
    // Exhaustion Aura
    if (this.exhaustionTimer > 0) {
      const vfx = (typeof Images !== 'undefined') ? Images.get('vfx_tanjiro_exhaust_aura') : null;
      if (vfx) {
         ctx.save();
         const sh = typeof Effects !== 'undefined' ? Effects.getShake() : {x:0, y:0};
         ctx.translate(this.centerX + sh.x, this.centerY + sh.y);
         ctx.globalCompositeOperation = 'screen';
         
         // Drift up over time
         const t = (Date.now() % 2000) / 2000; // 0 to 1
         const driftY = -t * 60;
         const driftX = Math.sin(t * Math.PI * 2) * 5;
         ctx.translate(driftX, driftY);
         
         // Scale slightly based on facing
         if (!this.facingRight) ctx.scale(-1, 1);
         
         const drawW = this.h * 1.5;
         const drawH = drawW * (vfx.height / vfx.width);
         
         // Fade in and out
         let alpha = 0.6;
         if (t < 0.2) alpha = 0.6 * (t / 0.2);
         else if (t > 0.8) alpha = 0.6 * ((1 - t) / 0.2);
         ctx.globalAlpha = alpha;
         
         ctx.drawImage(vfx, -drawW/2, -drawH/2, drawW, drawH);
         ctx.restore();
      }
    }

  }

  update(canvasW, canvasH) {
    if (this.isDead) return super.update(canvasW, canvasH);

    const dt = 1/60;

    // Energy regeneration (8/s) -> approx dt
    if (!this.isAttacking && !this.isKicking && !this.isUltimate && !this.isPowerUpCast) {
      if (this.exhaustionTimer <= 0) {
        this.energy = Math.min(100, this.energy + 8 * dt);
      }
    }
    
    // Exhaustion logic
    if (this.exhaustionTimer > 0) {
      this.exhaustionTimer -= dt;
      if (this.exhaustionTimer <= 0) {
        this.exhaustionTimer = 0;
        this.isFlinching = false;
      }
    }
    
    // Casting PowerUp animation lock
    if (this.isPowerUpCast) {
      this.powerUpCastTimer -= dt;
      if (this.powerUpCastTimer <= 0) {
        this.isPowerUpCast = false;
        this.powerUpCastTimer = 0;
      }
    }

    // PowerUp timer
    if (this.isPowerUp) {
      this.powerUpTimer -= dt;
      if (this.powerUpTimer <= 0) {
        this.isPowerUp = false;
        this.powerUpTimer = 0;
      }
    }

    // Standard gravity and physics
    super.update(canvasW, canvasH);
  }
}
