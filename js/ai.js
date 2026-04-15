// ai.js - AI Controller for offline mode (Easy / Medium / Hard)
class AIController {
  constructor(difficulty, fighter, opponent) {
    this.difficulty = difficulty; // 'easy' | 'medium' | 'hard'
    this.fighter = fighter;
    this.opponent = opponent;
    this.actionTimer = 0;
    this.actionInterval = this._getBaseInterval();
    this.currentAction = null;
    this.dodgeCooldown = 0;
    this.blockCooldown = 0;
    this.jumpCooldown = 0;
    this.ultimateCooldown = 0;
  }

  _getBaseInterval() {
    switch (this.difficulty) {
      case 'easy':   return 40 + Math.random() * 20;  // 0.6s - 1.0s
      case 'medium': return 15 + Math.random() * 15;  // 0.25s - 0.5s
      case 'hard':   return 4 + Math.random() * 6;    // 0.06s - 0.16s (Extremely fast reactions)
    }
  }

  _chance(pct) {
    return Math.random() * 100 < pct;
  }

  update(keys) {
    if (!this.fighter || !this.opponent) return keys;

    if (this.dodgeCooldown > 0) this.dodgeCooldown--;
    if (this.blockCooldown > 0) this.blockCooldown--;
    if (this.jumpCooldown > 0) this.jumpCooldown--;
    if (this.ultimateCooldown > 0) this.ultimateCooldown--;

    this.actionTimer++;

    // Base aiKeys structure
    const aiKeys = {
      moveLeft: false, moveRight: false, jump: false,
      crouch: false, attack: false, kick: false,
      dodge: false, projectile: false, block: false, 
      ultimate: false, powerup: false, ult1: false, ult2: false
    };

    const dx = this.opponent.x - this.fighter.x;
    const absDx = Math.abs(dx);
    const facingRight = this.fighter.facingRight;
    const isOpponentAhead = (dx > 0 && facingRight) || (dx < 0 && !facingRight);
    
    // Safety check just in case charData is missing
    const charId = this.fighter.charData ? this.fighter.charData.id : 'unknown';

    // --- DEFENSIVE OVERRIDES (Interrupts actions instantly) ---
    if ((this.difficulty === 'hard' || this.difficulty === 'medium') && this.actionTimer % 3 === 0) {
      const opponentAttacking = this.opponent.isAttacking || this.opponent.isKicking;
      
      // Reactive Perfect Counter Block 
      if (opponentAttacking && absDx < 160 && isOpponentAhead && this.blockCooldown === 0) {
        if (this.difficulty === 'hard' && this._chance(98)) {
           this.currentAction = 'block';
           this.blockCooldown = 15;
           return;
        } else if (this.difficulty === 'medium' && this._chance(65)) {
           this.currentAction = 'block';
           this.blockCooldown = 40;
           return;
        } else if (this.difficulty === 'easy' && this._chance(25)) {
           this.currentAction = 'block';
           this.blockCooldown = 90;
           return;
        }
      } // Dodge Projectile
      if (this.opponent.projectiles && this.opponent.projectiles.length > 0) {
        const threat = this.opponent.projectiles.find(p =>
          Math.abs(p.y - this.fighter.y) < 80 &&
          ((p.vx > 0 && p.x < this.fighter.x) || (p.vx < 0 && p.x > this.fighter.x))
        );
        if (threat && this.dodgeCooldown === 0) {
          if (this.difficulty === 'hard' && this._chance(80)) {
            aiKeys.dodge = true; // Dodge is an instant tap
            this.dodgeCooldown = 50;
            this.currentAction = 'idle'; // Reset action
          } else if (this._chance(30)) {
            aiKeys.dodge = true;
            this.dodgeCooldown = 80;
            this.currentAction = 'idle';
          }
        }
      }
    }

    // --- HEARTBEAT & ACTION SELECTION ---
    if (this.actionTimer >= this.actionInterval) {
      this.actionTimer = 0;
      this.actionInterval = this._getBaseInterval();
      
      // Reset action for fresh evaluation
      this.currentAction = 'idle';

      // Character-specific brain overrides this.currentAction
      if (charId === 'tanjiro') {
        this._playTanjiro(aiKeys, dx, absDx, isOpponentAhead);
      } else if (charId === 'zenitsu') {
        this._playZenitsu(aiKeys, dx, absDx, isOpponentAhead);
      } else {
        this._playGeneric(aiKeys, dx, absDx, isOpponentAhead);
      }
    }

    // --- APPLY CURRENT ACTION TO KEYS ---
    if (this.currentAction === 'attack') aiKeys.attack = true;
    else if (this.currentAction === 'kick') aiKeys.kick = true;
    else if (this.currentAction === 'projectile') aiKeys.projectile = true;
    else if (this.currentAction === 'block') aiKeys.block = true;
    else if (this.currentAction === 'crouch') aiKeys.crouch = true;
    else if (this.currentAction === 'powerup') aiKeys.powerup = true;
    else if (this.currentAction === 'ult1') aiKeys.ult1 = true;
    else if (this.currentAction === 'ult2') aiKeys.ult2 = true;
    else if (this.currentAction === 'ultimate') aiKeys.ultimate = true;
    else if (this.currentAction === 'jump') { 
        aiKeys.jump = true; 
        this.currentAction = null; // Jump is a one-frame stroke
    }
    else if (this.currentAction === 'approach') {
      aiKeys.moveRight = dx > 0;
      aiKeys.moveLeft = dx < 0;
    } else if (this.currentAction === 'retreat') {
      aiKeys.moveLeft = dx > 0;
      aiKeys.moveRight = dx < 0;
    }

    return aiKeys;
  }

  // --- LOGIC BOT: TANJIRO ---
  _playTanjiro(keys, dx, absDx, isOpponentAhead) {
    const energy = this.fighter.energy || 0;
    
    // Tự động biến Hỏa Thần nếu đủ 70 Nộ
    if (energy >= 70 && !this.fighter.isPowerUp && this.ultimateCooldown === 0) {
       this.currentAction = 'powerup';
       this.ultimateCooldown = 60;
       return;
    }

    // ULT2 (O): Sát thương siêu to nhưng Kiệt Sức.
    if (energy >= 95 && absDx < 300 && this.ultimateCooldown === 0 && this.difficulty !== 'easy') {
       if (this.opponent.hp < 1500 || this.fighter.hp < 1500) {
           this.currentAction = 'ult2';
           this.ultimateCooldown = 300;
           return;
       }
    }

    // ULT1 (I): Rải dam diện rộng an toàn, spam ngay khi đủ 80 Nộ 
    if (energy >= 80 && absDx < 250 && this.ultimateCooldown === 0) {
       if (this.difficulty === 'hard' || this._chance(60)) {
           this.currentAction = 'ult1';
           this.ultimateCooldown = 120;
           return;
       }
    }

    this._selectStandardAction(keys, dx, absDx, isOpponentAhead, 140, 260);
  }

  // --- LOGIC BOT: ZENITSU ---
  _playZenitsu(keys, dx, absDx, isOpponentAhead) {
    const energy = this.fighter.energy || 0;
    
    // Nộ 55 -> Kích hoạt U (Powerup) cấu rỉa xa cực thốn
    if (energy >= 55 && absDx > 180 && absDx < 450 && this.ultimateCooldown === 0) {
      if (this.difficulty === 'hard' || this._chance(60)) {
         this.currentAction = 'powerup';
         this.ultimateCooldown = 120;
         return;
      }
    }

    // Lục Liên (I - 80 Nộ)
    if (energy >= 80 && absDx < 600 && this.ultimateCooldown === 0) {
      if (this.difficulty === 'hard' || this._chance(60)) {
         this.currentAction = 'ult1';
         this.ultimateCooldown = 200;
         return;
      }
    }

    // Thần Tốc O - 100 nộ
    if (energy >= 100 && this.ultimateCooldown === 0 && this.difficulty !== 'easy') {
      this.currentAction = 'ult2';
      this.ultimateCooldown = 300;
      return;
    }

    // Zenitsu Hard chơi cáu: Xài J1 đột kích
    if (this.difficulty === 'hard') {
       if (absDx >= 110 && absDx < 380 && this._chance(75)) {
           this.currentAction = 'attack';
           return;
       }
    }

    this._selectStandardAction(keys, dx, absDx, isOpponentAhead, 160, 320); 
  }

  // --- LOGIC BOT: GENERIC (Nezuko / Inosuke) ---
  _playGeneric(keys, dx, absDx, isOpponentAhead) {
     if (this.fighter.energy >= 100 && this.ultimateCooldown === 0 && this._chance(60)) {
       this.currentAction = 'ultimate';
       this.ultimateCooldown = 180;
       return;
     }

     this._selectStandardAction(keys, dx, absDx, isOpponentAhead, 130, 250);
  }

  _selectStandardAction(keys, dx, absDx, isOpponentAhead, closeRange, midRange) {
    const rand = Math.random();

    // Easy AI (Ngu ngơ đánh chậm)
    if (this.difficulty === 'easy') {
      if (absDx < closeRange && rand < 0.4) this.currentAction = 'attack';
      else if (absDx < closeRange && rand < 0.6) this.currentAction = 'kick';
      else if (rand < 0.75) this.currentAction = 'approach';
      else if (rand < 0.85) this.currentAction = 'idle';
      else this.currentAction = 'retreat';
      
      if (this._chance(10) && this.jumpCooldown === 0) {
          this.currentAction = 'jump';
          this.jumpCooldown = 100;
      }
      return;
    }

    // Medium & Hard (Xài kĩ năng tinh quái hơn)
    if (absDx < closeRange && isOpponentAhead) {
      if (rand < 0.45) this.currentAction = 'attack';
      else if (rand < 0.70) this.currentAction = 'kick';
      else if (rand < 0.85 && this.difficulty === 'hard') this.currentAction = 'crouch'; 
      else if (rand < 0.90) this.currentAction = 'projectile';
      else this.currentAction = 'approach';
    } 
    else if (absDx < midRange) {
      if (rand < 0.35) this.currentAction = 'projectile';
      else if (rand < 0.85) this.currentAction = 'approach';
      else this.currentAction = 'retreat';
    }
    else {
      this.currentAction = 'approach';
      if (this._chance(35)) this.currentAction = 'projectile';
    }

    if (this._chance(20) && this.jumpCooldown === 0) {
        this.currentAction = 'jump';
        this.jumpCooldown = this.difficulty === 'hard' ? 30 : 70;
    }
  }

  setFighter(fighter) { this.fighter = fighter; }
  setOpponent(opponent) { this.opponent = opponent; }
}
