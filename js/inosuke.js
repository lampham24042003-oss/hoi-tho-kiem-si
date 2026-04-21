// inosuke.js - Custom Fighter Logic for Hashibira Inosuke
'use strict';

class InosukeFighter extends Fighter {
  constructor(charData, isP2, x, canvasH, facingRight) {
    super(charData, isP2, x, canvasH, facingRight);

    // ── INOSUKE SPECIFIC STATS ──
    this.maxHp = charData.maxHp || 4500;
    this.hp    = this.maxHp;
    this.energy = charData.energy !== undefined ? charData.energy : 100;

    // Movement
    this.baseSpeed    = charData.speed || 4.8;
    this.crouchSpeed  = 3.0; // Fastest crouch in roster
    this.jumpHeight   = 3.4; // Highest jump in roster
    this.airTime      = 1.0; // Longest air time — can attack in air (J/K)

    // NO PowerUp state (U is Ulti-0 instead)
    this.isPowerUp     = false; // always false for Inosuke
    this.exhaustionTimer = 0;

    // J charge logic
    this.chargeJTimer  = 0;
    this.isChargingJ   = false;

    // Ulti-2 specific — "khoảng trống tay không" (weaponless phase)
    this.isWeaponless       = false; // true while swords are in flight (Ulti-2 phase 2-3)
    this.weaponlessTimer    = 0;
    this.weaponlessDuration = 1.2; // ~1.2s window when swords are in the air

    // Bleed DoT tracking (stacks from J2, B-counter, Ulti-1, Ulti-2)
    // Array of { dps, duration, elapsed } objects
    this.bleedEffects = [];

    // Skill Cooldowns
    this.lastAttacks = {
      j1: 0, j2: 0, k: 0, sk: 0, l: 0
    };
  }

  // ─────────────────────────────────────────────
  //  STAT GETTERS
  // ─────────────────────────────────────────────

  getCurrentSpeed() {
    if (this.exhaustionTimer > 0) return this.baseSpeed * 0.6; // penalty after Ulti-2 catch
    return this.baseSpeed; // 4.8 — no buff variant
  }

  getCurrentAttackDamage() {
    // J1 — dual-blade slash counts as 2 hits combined
    if (this.currentAttackVariant === 'J2') return 85;  // 40+45 dual hits
    return 50; // J1 default (25+25)
  }

  getCurrentKickDamage() {
    // K standing = headbutt, S+K = roll kick
    if (this.currentAttackVariant === 'SK') return 38; // roll kick
    return 52; // headbutt
  }

  getCurrentProjectileDamage() {
    return 60; // boomerang sword throw
  }

  getCurrentUltimateDamage() {
    if (this.currentAttackVariant === 'ULT_O') return 600; // Đầu Liệt: 280(go) + 320(return)
    if (this.currentAttackVariant === 'ULT1')  return 480; // Viên Chuyển Toàn Nha: 10×48
    return 195; // ULT0 — Bộc Liệt Mãnh Tiến: 3×65
  }

  getCurrentUltimateKnockdown() {
    if (this.currentAttackVariant === 'ULT_O') return 60;  // 1.0s stun (lượt đi)
    if (this.currentAttackVariant === 'ULT1')  return 90;  // 1.5s held in vortex
    return 30; // ULT0 — 0.5s stun
  }

  onUltimateComplete(target) {
    if (this.currentAttackVariant === 'ULT_O') {
      // After catching swords: 1.8s exhaustion, weaponless phase ends
      this.isWeaponless    = false;
      this.weaponlessTimer = 0;
      this.exhaustionTimer = 1.8;
      this.isFlinching     = true;
    }
  }

  getEnergyRegenRate() {
    // Return 0 so base Fighter.update() does NOT add energy on its own.
    // Inosuke gates regen manually in update() — only while moving.
    return 0;
  }

  // ─────────────────────────────────────────────
  //  MULTI-HIT ULTIMATE OVERRIDE
  // ─────────────────────────────────────────────

  initiateUltimateCombo(target) {
    this.isUltimateCombo  = true;
    this.ultimateComboHits = 0;

    if (this.currentAttackVariant === 'ULT_O') {
      // Phase structure handled separately in processUltimateCombo
      // Lượt đi: 2 swords × 140 = 280 (stun 1.0s)
      // Lượt về: 2 swords × 160 = 320 after delay
      this.ultimateComboMaxHits = 4; // 2 go + 2 return
      this.comboHitInterval     = 6; // ~0.1s apart within phase
      this._ultoPhase           = 'go'; // tracks current phase
      this._ultoPhaseTimer      = 0;
      // Weaponless starts now
      this.isWeaponless    = true;
      this.weaponlessTimer = this.weaponlessDuration;

      // ── Animated sword throw/return VFX ──────────────────────
      // tX/tY = target position snapshot at the moment of throw
      const tX   = target ? target.centerX : this.centerX + (this.facingRight ? 300 : -300);
      const tY   = target ? target.centerY : this.centerY;
      const iX   = this.centerX;
      const iY   = this.centerY;
      const totalMs = this.ultimateComboMaxHits * this.comboHitInterval * (1000 / 60); // ~400ms
      // Sword A: upper arc; Sword B: lower arc
      this._ult2SwordsAnim = {
        active:    true,
        phase:     'go',           // 'go' | 'return' | 'catch'
        startMs:   Date.now(),
        goMs:      totalMs * 0.45, // time to reach target
        returnMs:  totalMs * 0.45, // time to return
        iX, iY,                   // Inosuke position
        tX, tY,                   // target position
        // Sword A = upper path, Sword B = lower path
        swordA: { x: iX, y: iY, rot: 0 },
        swordB: { x: iX, y: iY, rot: 0.5 },
      };
    } else if (this.currentAttackVariant === 'ULT1') {
      // 5 vòng × 2 dao = 10 nhát
      this.ultimateComboMaxHits = 10;
      this.comboHitInterval     = 4; // ~0.067s — crazy fast vortex
    } else {
      // ULT0 — 3 slashes during dash
      this.ultimateComboMaxHits = 3;
      this.comboHitInterval     = 8; // ~0.13s
    }
    this.comboHitTimer = this.comboHitInterval;
  }

  processUltimateCombo(target, finishCallback) {
    this.comboHitTimer--;

    if (this.comboHitTimer <= 0) {
      this.ultimateComboHits++;

      let damage;
      let isReturnPhase = false;

      if (this.currentAttackVariant === 'ULT_O') {
        // First 2 hits = lượt đi (140 each), last 2 = lượt về (160 each)
        if (this.ultimateComboHits <= 2) {
          damage = 140;
        } else {
          damage = 160;
          isReturnPhase = true;
        }
      } else {
        damage = this.getCurrentUltimateDamage() / this.ultimateComboMaxHits;
      }

      const dir = this.facingRight ? 12 : -12;

      // Build impact image key
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

        // Apply Bleed on Ulti-1 and Ulti-2 finishers
        if (this.currentAttackVariant === 'ULT1') {
          // 8 dps × 4s
          target._applyBleed && target._applyBleed(8, 4);
          this._applyBleedToTarget(target, 8, 4);
        } else if (this.currentAttackVariant === 'ULT_O') {
          // 10 dps × 5s
          this._applyBleedToTarget(target, 10, 5);
        }

        this.onUltimateComplete(target);

        if (typeof Effects !== 'undefined') {
          const pColor = this.charData.projectileColor || '#cc0000';
          const gColor = this.charData.swordGlow       || '#ff4444';
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

        // ULT_O: stun at end of lượt đi so return hits land
        if (this.currentAttackVariant === 'ULT_O' && this.ultimateComboHits === 2) {
          // After 2nd hit (end of go-phase), stun target for return phase
          target.knockdown(60); // 1.0s stun to ensure return hits connect
        } else {
          target.takeDamage(damage, dir);
          target.isFlinching = true;
          target.flinchTimer = isReturnPhase ? 10 : 8;
        }

        if (typeof Effects !== 'undefined') {
          Effects.screenShake(isReturnPhase ? 20 : 12);
          if (impactImg) {
            const randX   = target.centerX + (Math.random() - 0.5) * 70;
            const randY   = target.centerY + (Math.random() - 0.5) * 70;
            const randRot = Math.random() * Math.PI * 2;
            Effects.spawnSpriteImpact(randX, randY, impactImg, randRot, 0.95);
          }
        }

        if (typeof AudioManager !== 'undefined') AudioManager.hit();

        this.comboHitTimer = this.comboHitInterval;

        // ULT0 slash-dash: push Inosuke through target
        if (this.currentAttackVariant === 'ULT0') {
          this.x += dir * 1.5;
        }
        // ULT1 vortex: spin-lock — stay around target
        if (this.currentAttackVariant === 'ULT1') {
          this.x += (Math.random() > 0.5 ? 1 : -1) * 8;
          this.y += (Math.random() > 0.5 ? -6 : 6);
        }
        // ULT_O: flip sword anim to return phase after hit 2 (end of go phase)
        if (this.currentAttackVariant === 'ULT_O' && this._ult2SwordsAnim) {
          if (this.ultimateComboHits === 2) {
            // Swords reached target, now return
            this._ult2SwordsAnim.phase   = 'return';
            this._ult2SwordsAnim.startMs = Date.now(); // reset timer for return
          }
        }
      }
    }
  }

  // Helper: apply bleed to target if it supports the bleedEffects array
  _applyBleedToTarget(target, dps, duration) {
    if (!target) return;
    if (Array.isArray(target.bleedEffects)) {
      target.bleedEffects.push({ dps, duration, elapsed: 0 });
    }
  }

  // ─────────────────────────────────────────────
  //  ULT_O SWORD ANIMATION (fly out + boomerang back)
  // ─────────────────────────────────────────────

  _drawUlt2Swords(ctx) {
    if (!this._ult2SwordsAnim || !this._ult2SwordsAnim.active) return;

    const anim   = this._ult2SwordsAnim;
    const now    = Date.now();
    const elapsed = now - anim.startMs;

    // Choose sprite and interpolation based on phase
    let imgKey, t, fromX, fromY, toX, toY, phaseDur;
    if (anim.phase === 'go') {
      imgKey   = 'vfx_inosuke_ult2_throw';
      phaseDur = anim.goMs;
      fromX = anim.iX; fromY = anim.iY;
      toX   = anim.tX; toY   = anim.tY;
    } else if (anim.phase === 'return') {
      imgKey   = 'vfx_inosuke_ult2_return';
      phaseDur = anim.returnMs;
      fromX = anim.tX; fromY = anim.tY;
      // Track current Inosuke position so swords fly to where he actually is
      toX   = this.centerX; toY = this.centerY;
    } else {
      // 'catch' flash — handled by catch VFX in main draw
      this._ult2SwordsAnim.active = false;
      return;
    }

    t = Math.min(1.0, elapsed / phaseDur);

    // Check if phase complete
    if (t >= 1.0) {
      if (anim.phase === 'go') {
        // Wait for processUltimateCombo to flip to 'return'
      } else if (anim.phase === 'return') {
        anim.phase  = 'catch';
        anim.active = false;
      }
    }

    const vfxImg = typeof Images !== 'undefined' ? Images.get(imgKey) : null;
    if (!vfxImg) return;

    // Ease in-out cubic
    const ease = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

    // Arc offsets: sword A arcs upward, sword B arcs downward
    const arcHeight = Math.abs(toX - fromX) * 0.3;
    const arcA =  arcHeight * Math.sin(Math.PI * t); // above the midpoint
    const arcB = -arcHeight * 0.6 * Math.sin(Math.PI * t); // below, shallower

    const sxA = fromX + (toX - fromX) * ease;
    const syA = fromY + (toY - fromY) * ease - arcA;
    const sxB = fromX + (toX - fromX) * ease;
    const syB = fromY + (toY - fromY) * ease - arcB;

    // Rotation: spins during flight
    const spin = t * Math.PI * 4 * (anim.phase === 'return' ? -1 : 1);
    const alpha = t < 0.1 ? t / 0.1 : (t > 0.9 ? (1 - t) / 0.1 : 1.0);

    const sh = typeof Effects !== 'undefined' ? Effects.getShake() : { x: 0, y: 0 };
    const drawW = 120, drawH = 120;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = alpha;

    // Sword A
    ctx.save();
    ctx.translate(sxA + sh.x, syA + sh.y);
    ctx.rotate(spin);
    ctx.drawImage(vfxImg, -drawW/2, -drawH/2, drawW, drawH);
    ctx.restore();

    // Sword B with slight offset and opposite spin for visual depth
    ctx.save();
    ctx.translate(sxB + sh.x + 18, syB + sh.y + 14);
    ctx.rotate(-spin + 0.8);
    ctx.drawImage(vfxImg, -drawW/2, -drawH/2, drawW, drawH);
    ctx.restore();

    ctx.restore();
  }

  // ─────────────────────────────────────────────
  //  SPRITE LOADING
  // ─────────────────────────────────────────────

  loadSprites() {
    super.loadSprites();

    const id = this.charData.id; // 'inosuke'

    // Crouch walk
    this.sprites.crouch_walk1 = Images.get(`sprite_${id}_crouch_walk1`);
    this.sprites.crouch_walk2 = Images.get(`sprite_${id}_crouch_walk2`);

    // Combat variants
    this.sprites.heavy_attack        = Images.get(`sprite_${id}_heavy_attack`);
    this.sprites.heavy_jump_attack   = Images.get(`sprite_${id}_heavy_jump_attack`);
    this.sprites.heavy_crouch_attack = Images.get(`sprite_${id}_heavy_crouch_attack`);

    // Projectile (boomerang sword throw)
    this.sprites.projectile        = Images.get(`sprite_${id}_projectile`);
    this.sprites.jump_projectile   = Images.get(`sprite_${id}_jump_projectile`);
    this.sprites.crouch_projectile = Images.get(`sprite_${id}_crouch_projectile`);

    // K variants
    this.sprites.headbutt   = Images.get(`sprite_${id}_headbutt`);   // K standing
    this.sprites.roll_kick  = Images.get(`sprite_${id}_roll_kick`);  // S+K

    // Block pose
    this.sprites.block_pose = Images.get(`sprite_${id}_block`);

    // Ulti sprites
    this.sprites.ultimate0_charge = Images.get(`sprite_${id}_ulti0_charge`);
    this.sprites.ultimate0_attack = Images.get(`sprite_${id}_ulti0_attack`);
    this.sprites.ultimate1_charge = Images.get(`sprite_${id}_ulti1_charge`);
    this.sprites.ultimate1_attack = Images.get(`sprite_${id}_ulti1_attack`);
    this.sprites.ultimate2_charge = Images.get(`sprite_${id}_ulti2_charge`);
    this.sprites.ultimate2_throw  = Images.get(`sprite_${id}_ulti2_throw`);
    this.sprites.ultimate2_return = Images.get(`sprite_${id}_ulti2_return`);
    this.sprites.ultimate2_catch  = Images.get(`sprite_${id}_ulti2_catch`);

    this.sprites.ultimate_pose = Images.get(`sprite_${id}_ultimate_pose`);
    this.sprites.exhaust_pose  = Images.get(`sprite_${id}_exhaust_pose`);
  }

  // ─────────────────────────────────────────────
  //  SPRITE SELECTION
  // ─────────────────────────────────────────────

  _getCurrentSprite() {
    // Exhaustion after Ulti-2 catch
    if (this.exhaustionTimer > 0 && this.sprites.exhaust_pose) return this.sprites.exhaust_pose;

    // Ultimate charge stances
    if (this.isUltimateStance || this.isUltimate) {
      if (this.currentAttackVariant === 'ULT_O' && this.sprites.ultimate2_charge) return this.sprites.ultimate2_charge;
      if (this.currentAttackVariant === 'ULT1'  && this.sprites.ultimate1_charge) return this.sprites.ultimate1_charge;
      if (this.currentAttackVariant === 'ULT0'  && this.sprites.ultimate0_charge) return this.sprites.ultimate0_charge;
      if (this.sprites.ultimate_pose) return this.sprites.ultimate_pose;
    }

    // Ultimate active attack sprites
    if (this.isUltimateDash || this.isUltimateCombo) {
      if (this.currentAttackVariant === 'ULT_O') {
        // Phase-aware: go vs return
        if (this.isWeaponless && this.ultimateComboHits >= 2 && this.sprites.ultimate2_return) return this.sprites.ultimate2_return;
        if (this.sprites.ultimate2_throw) return this.sprites.ultimate2_throw;
      }
      if (this.currentAttackVariant === 'ULT1'  && this.sprites.ultimate1_attack) return this.sprites.ultimate1_attack;
      if (this.currentAttackVariant === 'ULT0'  && this.sprites.ultimate0_attack) return this.sprites.ultimate0_attack;
    }

    // Block
    if (this.isBlocking && this.sprites.block_pose) return this.sprites.block_pose;

    // Dodge (fast crouch-lunge)
    if (this.isDodging) return this.sprites.crouch;

    // ── AIR STATES (longest air time in roster) ──
    if (!this.onGround || this.isJumping) {
      if (this.isKicking) return this.sprites.jump_kick;
      if (this.isAttacking) {
        if (this.currentAttackVariant === 'L')  return this.sprites.jump_projectile;
        if (this.currentAttackVariant === 'J2') return this.sprites.heavy_jump_attack;
        return this.sprites.jump_attack;
      }
      return this.sprites.jump;
    }

    // ── CROUCH ──
    if (this.isCrouching) {
      if (this.isKicking) {
        // S+K roll kick
        if (this.currentAttackVariant === 'SK' && this.sprites.roll_kick) return this.sprites.roll_kick;
        return this.sprites.crouch_kick;
      }
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

    // ── STANDING ──
    if (this.isKicking) {
      if (this.currentAttackVariant === 'SK' && this.sprites.roll_kick) return this.sprites.roll_kick;
      if (this.sprites.headbutt) return this.sprites.headbutt;
      return this.sprites.kick;
    }
    if (this.isAttacking) {
      if (this.currentAttackVariant === 'L')  return this.sprites.projectile;
      if (this.currentAttackVariant === 'J2') return this.sprites.heavy_attack;
      return this.sprites.idle_attack;
    }

    // Movement
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

    // Pass movement/jump/dodge/block to base class; suppress combat keys
    const superKeys = {
      ...keys,
      attack: false, kick: false, projectile: false,
      ultimate: false, powerup: false, ult1: false, ult2: false
    };
    super.applyKeys(superKeys, canvasW);

    const now = performance.now() / 1000;

    // ── 1. J — DUAL BLADE SLASH (J1 / J2) ──
    // J is disabled in weaponless phase (Ulti-2 swords in flight)
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
        const cd      = isHeavy ? 0.72 : 0.40;

        if (now - this.lastAttacks[cdKey] > cd) {
          this.isAttacking          = true;
          // Use attackDuration for J1; 1.8× for J2 (same ratio as Tanjiro)
          this.attackTimer          = isHeavy ? Math.ceil(this.attackDuration * 1.8) : this.attackDuration;
          this.swordSwingProgress   = 0;
          this.lastAttacks[cdKey]   = now;
          this.currentAttackVariant = isHeavy ? 'J2' : 'J1';

          if (window.AudioManager) window.AudioManager.slash();

          if (isHeavy) this._pendingBleed = { dps: 8, duration: 3 };
        }
      }
    }

    // ── 2. K — HEADBUTT (standing) / ROLL KICK (S+K) ──
    if (keys.kick && !prev.kick && !this.isAttacking && !this.isKicking) {
      const isRoll    = this.isCrouching; // S+K
      const cdKey     = isRoll ? 'sk' : 'k';
      const cd        = isRoll ? 0.50 : 0.55;

      if (now - this.lastAttacks[cdKey] > cd) {
        this.isKicking          = true;
        this.kickTimer          = isRoll ? 14 : 18; // frames
        this.lastAttacks[cdKey] = now;
        this.currentAttackVariant = isRoll ? 'SK' : 'K';
        if (window.AudioManager) window.AudioManager.kick();
      }
    }

    // ── 3. L — BOOMERANG SWORD THROW (disabled while weaponless) ──
    if (keys.projectile && !prev.projectile && !this.isAttacking && !this.isKicking
        && !this.isWeaponless && now - this.lastAttacks.l > 0.85) {
      this._fireProjectile();
      this.lastAttacks.l        = now;
      this.currentAttackVariant = 'L';
      this.isAttacking          = true;
      this.attackTimer          = 20; // frames lock
    }

    // ── 4. U — ULTI 0: Bộc Liệt Mãnh Tiến (50 energy) ──
    if (keys.powerup && !prev.powerup && !this.isAttacking && this.energy >= 50 && !this.isUltimate) {
      this.isUltimate           = true;
      this.ultimateTimer        = 0;
      this.energy              -= 50;
      this.currentAttackVariant = 'ULT0';
      this._transformStartMs    = Date.now();
      if (window.AudioManager) window.AudioManager.ultimate();
    }

    // ── 5. I — ULTI 1: Viên Chuyển Toàn Nha (75 energy) ──
    if (keys.ult1 && !prev.ult1 && !this.isAttacking && this.energy >= 75 && !this.isUltimate) {
      this.isUltimate           = true;
      this.ultimateTimer        = 0;
      this.energy              -= 75;
      this.currentAttackVariant = 'ULT1';
      this._transformStartMs    = Date.now();
      if (window.AudioManager) window.AudioManager.ultimate();
    }

    // ── 6. O — ULTI 2: Đầu Liệt (100 energy) ──
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
  //  BLOCK / COUNTER OVERRIDE
  //  Block: 65% reduction (weakest in roster)
  //  Counter window: 0.18s → 100 dmg + Bleed 8×2s
  // ─────────────────────────────────────────────

  takeDamage(amount, knockback = 0) {
    if (this.invincibleTimer > 0 || this.isDead) return 'none';
    if (this.isDummy) { amount = 0; knockback = 0; }

    if (this.isBlocking) {
      const counterWindow = 0.18;
      if (this.blockTime <= counterWindow) {
        // COUNTER — 100 dmg + Bleed, instant reposition into attacker
        if (window.AudioManager) AudioManager.heavyHit();
        if (window.Effects)      Effects.screenShake(8);
        // Bleed applied back to attacker; attacker referenced via last hit owner if tracked
        return 'countered';
      }
      if (window.AudioManager) AudioManager.block();
      if (window.Effects)      Effects.screenShake(3);

      // 65% damage reduction (block absorbs 65%, takes 35%)
      const actualDamage = amount * 0.35;
      this.hp = Math.max(0, this.hp - actualDamage);
      if (window.Effects) Effects.floatingText(this.centerX, this.y + 20, Math.floor(actualDamage), 'damage');

      if (this.hp <= 0) { this.die(); return 'killed'; }
      return 'blocked';
    }

    // ── UNBLOCKED HIT ──
    const minHp = this.isTraining ? 1 : 0;
    this.hp = Math.max(minHp, this.hp - amount);

    if (window.Effects) Effects.floatingText(this.centerX, this.y + 20, Math.floor(amount), 'damage');

    // Energy gain on hit (same as base)
    this._gainEnergy(6);
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
  //  PROJECTILE — BOOMERANG SWORD
  //  Wider hitbox than Zenitsu, slower speed, arc trajectory
  // ─────────────────────────────────────────────

  _fireProjectile() {
    const pivot = this.swordPivotWorld;
    const dir   = this.facingRight ? 1 : -1;
    if (window.AudioManager) AudioManager.projectile();

    this.projectiles.push({
      x:    pivot.x,
      y:    pivot.y,
      vx:   dir * 9,   // 9 units/s — slower than Zenitsu's 12
      vy:   0,          // straight flight (no arc — base update has no gravity for projectiles)
      w:    110,        // wider hitbox (1.2 units — widest in roster)
      h:    55,
      life: 1.0,
      isBoomerang: true,
      returnTriggered: false,
      color: this.charData.projectileColor,
      glow:  this.charData.projectileGlow || this.charData.swordGlow,
      damage: this.getCurrentProjectileDamage(),
      owner: this,
      trailParticles: []
    });
  }

  // ─────────────────────────────────────────────
  //  VFX DRAW OVERRIDES
  // ─────────────────────────────────────────────

  _drawSlashVFX(ctx, cx, cy) {
    let vfxKey = null;
    if (this.currentAttackVariant === 'J1') vfxKey = 'beast_slash1';
    else if (this.currentAttackVariant === 'J2') vfxKey = 'beast_slash2';

    const vfxImg = vfxKey && typeof Images !== 'undefined'
      ? Images.get(`vfx_inosuke_${vfxKey}`)
      : null;

    if (vfxImg) {
      ctx.save();
      ctx.translate(cx, cy);
      const dir = this.facingRight ? 1 : -1;
      ctx.scale(dir, 1);

      ctx.globalAlpha              = Math.max(0, 1 - this.swordSwingProgress);
      ctx.globalCompositeOperation = 'screen';

      const drawW = 160;
      const drawH = drawW * (vfxImg.height / vfxImg.width);

      if (this.currentAttackVariant === 'J1') {
        // 140° dual-cross slash
        ctx.drawImage(vfxImg, 20, -drawH / 2, drawW, drawH);
      } else if (this.currentAttackVariant === 'J2') {
        // 160° wide sweep — biggest hitbox in roster
        ctx.drawImage(vfxImg, 0, -drawH / 2 + 15, drawW * 1.6, drawH * 1.6);
      }
      ctx.restore();
    } else {
      if (super._drawSlashVFX) super._drawSlashVFX(ctx, cx, cy);
    }
  }

  _drawKickEffect(ctx) {
    // Headbutt or roll kick VFX — uses new beast_kick key for both
    const vfxImg = (typeof Images !== 'undefined') ? Images.get('vfx_inosuke_beast_kick') : null;

    if (!vfxImg) {
      if (super._drawKickEffect) super._drawKickEffect(ctx);
      return;
    }

    const progress = 1 - this.kickTimer / this.kickDuration;
    const dir      = this.facingRight ? 1 : -1;
    // BUG FIX: VFX phải hiện ở TÌP ĐẦU đòn đánh, không phải centerX của Inosuke
    const kickX    = this.centerX + dir * (this.w * 0.6 + progress * 30); // phía trước mặt
    const kickY    = this.y + this.h * 0.4;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    if (progress < 0.2) ctx.globalAlpha = progress / 0.2;
    else ctx.globalAlpha = Math.max(0, 1 - Math.pow(progress, 2));

    ctx.translate(kickX, kickY);

    if (this.currentAttackVariant === 'SK') {
      // 360° roll — radial expansion
      ctx.rotate(progress * Math.PI * 2);
    } else {
      ctx.scale(dir, 1);
    }

    const drawW = 130 + progress * 80;
    const drawH = drawW * (vfxImg.height / vfxImg.width);
    ctx.drawImage(vfxImg, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  _drawProjectile(ctx, p) {
    const vfxImg = (typeof Images !== 'undefined')
      ? Images.get('vfx_inosuke_beast_proj')
      : null;

    if (!vfxImg) {
      if (super._drawProjectile) super._drawProjectile(ctx, p);
      return;
    }

    ctx.save();
    const sh = window.Effects ? Effects.getShake() : { x: 0, y: 0 };
    ctx.translate(p.x + sh.x, p.y + sh.y);
    ctx.scale(p.vx > 0 ? 1 : -1, 1);

    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = p.life > 0.8
      ? (1.0 - p.life) / 0.2
      : (p.life < 0.1 ? p.life / 0.1 : 1.0);

    const drawW = p.w * 1.4;
    const drawH = drawW * (vfxImg.height / vfxImg.width);
    ctx.drawImage(vfxImg, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  _drawCenteredVFX(ctx, vfx, scaleParam = 1.0, isPulsing = false, globalAlpha = 1.0, nudgeY = -20) {
    if (!vfx) return;
    ctx.save();
    const sh = typeof Effects !== 'undefined' ? Effects.getShake() : { x: 0, y: 0 };
    ctx.translate(this.centerX + sh.x, this.centerY + sh.y);
    ctx.globalCompositeOperation = 'screen';

    let drawScale = scaleParam;
    if (isPulsing) drawScale += Math.sin(Date.now() / 150) * 0.05;

    if (!this.facingRight) ctx.scale(-1, 1);
    ctx.globalAlpha = globalAlpha;

    const drawW = this.h * drawScale * 1.5;
    const drawH = drawW * (vfx.height / vfx.width);
    ctx.drawImage(vfx, -drawW / 2, -drawH / 2 + nudgeY, drawW, drawH);
    ctx.restore();
  }

  // ─────────────────────────────────────────────
  //  DRAW
  // ─────────────────────────────────────────────

  _drawCharacterSprite(ctx, cx, cy, scale) {
    let offsetY = 0;
    let customScale = scale;
    const currentSprite = this._getCurrentSprite();
    
    // V4/V3 Image Generation adjustments: 
    if (currentSprite === this.sprites.run1 || currentSprite === this.sprites.run2) {
      offsetY = this.h * 0.08; // Run slightly floating, push down
    } 

    if (currentSprite === this.sprites.crouch_kick || 
        currentSprite === this.sprites.roll_kick || 
        currentSprite === this.sprites.heavy_crouch_attack) {
      customScale *= 1.25; // Character is drawn too small in these AI frames, enlarge manually
    } else if (currentSprite === this.sprites.exhaust_pose) {
      customScale *= 0.75; // Character is drawn too large (giant) in this AI frame, shrink manually
    }

    if (this.isCrouching || this.isDodging) {
      offsetY = this.h * 0.35; // Replicate Zenitsu/Tanjiro drop so feet stick out below the blue ground line
    }
    // Exhaust pose
    else if (currentSprite === this.sprites.exhaust_pose) {
      offsetY = this.h * 0.45; // Flat on floor (pushed down a bit more due to 0.75 shrink pulling it up)
    }

    super._drawCharacterSprite(ctx, cx, cy + offsetY, customScale);
  }

  draw(ctx, canvasW, canvasH) {
    // ── Dodge streak VFX (before character sprite so it renders behind) ──
    if (this.isDodging && this.dodgeTimer > this.dodgeDuration * 0.15) {
      const dodgeVfx = typeof Images !== 'undefined' ? Images.get('vfx_inosuke_beast_dodge') : null;
      if (dodgeVfx) {
        const progress = (this.dodgeDuration - this.dodgeTimer) / this.dodgeDuration;
        this._drawCenteredVFX(ctx, dodgeVfx, 1.4, false, Math.max(0, 0.65 * (1 - progress)), 30);
      }
    }

    // ── ULT_O animated sword throw/return (behind character) ──
    if (this.currentAttackVariant === 'ULT_O') {
      this._drawUlt2Swords(ctx);
    }

    super.draw(ctx, canvasW, canvasH);

    // ── Ultimate VFX hooks ──
    let ultKey       = null;
    let transformKey = null;
    let auraKey      = null;
    let isAnyUlt = false;
    const inUltState = this.isUltimate || this.isUltimateStance || this.isUltimateDash || this.isUltimateCombo;

    if (this.currentAttackVariant === 'ULT0') {
      isAnyUlt = true;
      transformKey = 'ulti0_transform';
      auraKey      = 'ulti0_aura';
      if (this.isUltimateDash || this.isUltimateCombo) ultKey = 'ult0_attack';
    } else if (this.currentAttackVariant === 'ULT1') {
      isAnyUlt = true;
      transformKey = 'ulti1_transform';
      auraKey      = 'ulti1_aura';
      if (this.isUltimateDash || this.isUltimateCombo) ultKey = 'ult1_vortex';
    } else if (this.currentAttackVariant === 'ULT_O') {
      isAnyUlt = true;
      transformKey = 'ulti2_transform';
      auraKey      = 'ulti2_aura';
      if (this.isUltimateDash || this.isUltimateCombo) {
        // catch flash when swords return to hands (last hit)
        if (!this.isWeaponless && this.ultimateComboHits >= this.ultimateComboMaxHits - 1) {
          ultKey = 'ult2_catch';
        }
        // ult2_throw / ult2_return handled by _drawUlt2Swords now (animated)
      }
    }

    // Per-ult transform burst at charge START — hiện rõ, tồn tại lâu hơn
    if (isAnyUlt && inUltState && transformKey) {
      const elapsed      = (Date.now() - (this._transformStartMs || Date.now())) / 1000;
      const transformVfx = typeof Images !== 'undefined' ? Images.get(`vfx_inosuke_${transformKey}`) : null;
      if (elapsed <= 0.7 && transformVfx) {
        const p     = elapsed / 0.7;
        const scale = 1.0 + p * 1.2;  // grow lớn dần
        const alpha = 0.9 * (1.0 - p);  // tăng từ 0.4 lên 0.9
        this._drawCenteredVFX(ctx, transformVfx, scale, false, alpha, 0);
      }
      // Generic beast_transform flash cho 0.25s đầu
      const genericTransVfx = typeof Images !== 'undefined' ? Images.get('vfx_inosuke_beast_transform') : null;
      if (elapsed <= 0.25 && genericTransVfx) {
        const p = elapsed / 0.25;
        this._drawCenteredVFX(ctx, genericTransVfx, 1.2, false, 0.95 * (1 - p), 0);
      }
    }

    // Per-ult aura during dash/combo — pulse rõ hơn
    if (isAnyUlt && (this.isUltimateDash || this.isUltimateCombo) && auraKey) {
      const auraVfx = typeof Images !== 'undefined' ? Images.get(`vfx_inosuke_${auraKey}`) : null;
      if (auraVfx) {
        const pulse = 0.55 + Math.abs(Math.sin(Date.now() / 120)) * 0.35;  // tăng từ 0.20-0.35
        this._drawCenteredVFX(ctx, auraVfx, 1.5, false, pulse, 0);
      }
    }

    if (ultKey) {
      const vfx = (typeof Images !== 'undefined')
        ? Images.get(`vfx_inosuke_${ultKey}`)
        : null;
      if (vfx) {
        if (this.currentAttackVariant === 'ULT1') {
          // Ulti-1 xoáy — rotating vortex
          ctx.save();
          const sh = typeof Effects !== 'undefined' ? Effects.getShake() : { x: 0, y: 0 };
          ctx.translate(this.centerX + sh.x, this.centerY + sh.y);
          ctx.rotate((Date.now() / 200) % (Math.PI * 2));
          ctx.globalCompositeOperation = 'screen';
          ctx.globalAlpha = 1.0;  // tăng từ 0.75 lên 1.0
          const drawW = this.h * 2.8;  // lớn hơn
          const drawH = drawW * (vfx.height / vfx.width);
          ctx.drawImage(vfx, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        } else {
          this._drawCenteredVFX(ctx, vfx, 1.8, false, 1.0, 0);  // tăng từ scale 1.6, alpha 0.8
        }
      }
    }

    // Exhaustion aura (after Ulti-2 catch)
    if (this.exhaustionTimer > 0) {
      const vfx = (typeof Images !== 'undefined')
        ? Images.get('vfx_inosuke_exhaust_aura')
        : null;
      if (vfx) {
        ctx.save();
        const sh = typeof Effects !== 'undefined' ? Effects.getShake() : { x: 0, y: 0 };
        // Anchor tại groundY (chân nhân vật) thay vì centerY để aura bám sát token
        const anchorY = (this.groundY || (this.y + this.h));
        ctx.translate(this.centerX + sh.x, anchorY - this.h * 0.35 + sh.y);
        ctx.globalCompositeOperation = 'screen';

        const t      = (Date.now() % 2000) / 2000;
        const driftY = -t * 18;  // giảm từ 50 xuống 18 để không bay quá cao
        const driftX = Math.sin(t * Math.PI * 2) * 6;
        ctx.translate(driftX, driftY);
        if (!this.facingRight) ctx.scale(-1, 1);

        const drawW = this.h * 1.4;
        const drawH = drawW * (vfx.height / vfx.width);

        let alpha = 0.55;
        if (t < 0.2)      alpha = 0.55 * (t / 0.2);
        else if (t > 0.8) alpha = 0.55 * ((1 - t) / 0.2);
        ctx.globalAlpha = Math.min(this.exhaustionTimer, alpha);

        ctx.drawImage(vfx, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }
    }

    // Bleed indicator overlay (small red pulse if target has active bleed)
    if (this.bleedEffects && this.bleedEffects.length > 0) {
      const bleedVfx = (typeof Images !== 'undefined')
        ? Images.get('vfx_inosuke_bleed_aura')
        : null;
      if (bleedVfx) {
        const pulse = 0.3 + Math.abs(Math.sin(Date.now() / 250)) * 0.25;
        this._drawCenteredVFX(ctx, bleedVfx, 0.8, true, pulse, 10);
      }
    }
  }

  // ─────────────────────────────────────────────
  //  UPDATE LOOP
  // ─────────────────────────────────────────────

  update(canvasW, canvasH) {
    if (this.isDead) return super.update(canvasW, canvasH);

    const dt = 1 / 60;

    // ── ENERGY REGEN: only while moving (opposite of Zenitsu) ──
    // getEnergyRegenRate() returns 0, so base class adds nothing.
    // We manually add here ONLY when the character is in motion.
    const isActuallyMoving = this.isMoving || this.isJumping || (!this.onGround);
    if (isActuallyMoving && !this.isUltimate && !this.isKnockedDown &&
        !this.isAttacking && !this.isKicking && this.exhaustionTimer <= 0) {
      this._gainEnergy(10 / 60); // 10 energy/s
    }

    // ── EXHAUSTION COUNTDOWN ──
    if (this.exhaustionTimer > 0) {
      this.exhaustionTimer -= dt;
      if (this.exhaustionTimer <= 0) {
        this.exhaustionTimer = 0;
        this.isFlinching     = false;
      }
    }

    // ── WEAPONLESS COUNTDOWN (safety fallback) ──
    if (this.isWeaponless) {
      this.weaponlessTimer -= dt;
      if (this.weaponlessTimer <= 0) {
        this.isWeaponless    = false;
        this.weaponlessTimer = 0;
      }
    }

    // ── BLEED DOT PROCESSING ──
    if (this.bleedEffects && this.bleedEffects.length > 0) {
      let totalBleedDmg = 0;
      this.bleedEffects = this.bleedEffects.filter(b => {
        b.elapsed += dt;
        totalBleedDmg += b.dps * dt;
        return b.elapsed < b.duration;
      });

      if (totalBleedDmg > 0 && this.hp > 0) {
        const minHp = this.isTraining ? 1 : 0;
        this.hp = Math.max(minHp, this.hp - totalBleedDmg);
        if (Math.random() < 0.03 && typeof Effects !== 'undefined') {
          Effects.floatingText(this.centerX, this.y + 10, Math.floor(totalBleedDmg * 30), 'bleed');
        }
        if (this.hp <= 0 && !this.isTraining) {
          this.hp     = 0;
          this.isDead = true;
        }
      }
    }

    // ── PENDING BLEED cleanup ──
    if (this._pendingBleed && !this.isAttacking) {
      this._pendingBleed = null;
    }

    super.update(canvasW, canvasH);

    // ── GROUND SNAP (Zenitsu pattern) ──
    // After ultimates, the game loop does NOT call update() during dash/combo states,
    // so the character can end up at wrong y. On the first normal frame, snap back.
    if (this.onGround && !this.isJumping && this.vy === 0) {
      this.y = this.groundY - this.h;
    }
  }
}
