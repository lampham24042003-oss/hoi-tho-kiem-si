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
      case 'easy':   return 60 + Math.random() * 40;  
      case 'medium': return 30 + Math.random() * 20;  
      case 'hard':   return 8 + Math.random() * 8;    
    }
  }

  _chance(pct) {
    return Math.random() * 100 < pct;
  }

  update(keys) {
    if (!this.fighter || !this.opponent) return;

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

    // --- BỘ NÃO PHÒNG THỦ DÙNG CHUNG (Cho Medium/Hard) ---
    if (this.difficulty === 'hard' || (this.difficulty === 'medium' && this._chance(40))) {
      const opponentAttacking = this.opponent.isAttacking || this.opponent.isKicking;
      
      // Reactive Perfect Counter Block (Hard xài liên tục nếu đối thủ vung kiếm)
      if (opponentAttacking && absDx < 160 && isOpponentAhead && this.blockCooldown === 0) {
        if (this.difficulty === 'hard' && this._chance(85)) {
          aiKeys.block = true;
          this.blockCooldown = 25; // Cooldown tíc tắc => Spam Block liên tục
          return aiKeys;
        } else if (this.difficulty === 'medium' && this._chance(40)) {
           aiKeys.block = true;
           this.blockCooldown = 45;
           return aiKeys;
        }
      }

      // Né Projectile (Dash/Dodge)
      if (this.opponent.projectiles && this.opponent.projectiles.length > 0) {
        const threat = this.opponent.projectiles.find(p =>
          Math.abs(p.y - this.fighter.y) < 80 &&
          ((p.vx > 0 && p.x < this.fighter.x) || (p.vx < 0 && p.x > this.fighter.x))
        );
        if (threat && this.dodgeCooldown === 0) {
          if (this.difficulty === 'hard' && this._chance(80)) {
            aiKeys.dodge = true;
            this.dodgeCooldown = 50;
            return aiKeys;
          } else if (this._chance(30)) {
            aiKeys.dodge = true;
            this.dodgeCooldown = 80;
            return aiKeys;
          }
        }
      }
    }

    // --- BỘ NHỊP QUYẾT ĐỊNH HÀNH ĐỘNG ---
    if (this.actionTimer >= this.actionInterval) {
      this.actionTimer = 0;
      this.actionInterval = this._getBaseInterval();

      // Based on character logic
      if (charId === 'tanjiro') {
        this._playTanjiro(aiKeys, dx, absDx, isOpponentAhead);
      } else if (charId === 'zenitsu') {
        this._playZenitsu(aiKeys, dx, absDx, isOpponentAhead);
      } else {
        this._playGeneric(aiKeys, dx, absDx, isOpponentAhead);
      }
      
      // Chạy hành động lẻ được gán
      if (this.currentAction === 'jump' && this.jumpCooldown === 0) {
        aiKeys.jump = true;
        this.jumpCooldown = this.difficulty === 'hard' ? 40 : 80;
        this.currentAction = null;
      }
      
      // Di chuyển
      if (this.currentAction === 'approach') {
        aiKeys.moveRight = dx > 0;
        aiKeys.moveLeft = dx < 0;
      } else if (this.currentAction === 'retreat') {
        aiKeys.moveLeft = dx > 0;
        aiKeys.moveRight = dx < 0;
      }
    }

    return aiKeys;
  }

  // --- LOGIC BOT: TANJIRO ---
  _playTanjiro(keys, dx, absDx, isOpponentAhead) {
    const energy = this.fighter.energy || 0;
    
    // Tự động biến Hỏa Thần nếu đủ 70 Nộ
    if (energy >= 70 && !this.fighter.isPowerUp && this.ultimateCooldown === 0) {
       keys.powerup = true;
       this.ultimateCooldown = 60;
       return;
    }

    // ULT2 (O): Sát thương siêu to nhưng Kiệt Sức. Chủ yếu xài chốt liễu.
    if (energy >= 95 && absDx < 300 && this.ultimateCooldown === 0 && this.difficulty !== 'easy') {
       if (this.opponent.hp < 1500 || this.fighter.hp < 1500) {
           keys.ult2 = true;
           this.ultimateCooldown = 300;
           return;
       }
    }

    // ULT1 (I): Rải dam diện rộng an toàn, spam ngay khi đủ 80 Nộ (nhất là Mode Hard)
    if (energy >= 80 && absDx < 250 && this.ultimateCooldown === 0) {
       if (this.difficulty === 'hard' || this._chance(50)) {
           keys.ult1 = true;
           this.ultimateCooldown = 150;
           return;
       }
    }

    this._selectStandardAction(keys, dx, absDx, isOpponentAhead, 130, 250);
  }

  // --- LOGIC BOT: ZENITSU ---
  _playZenitsu(keys, dx, absDx, isOpponentAhead) {
    const energy = this.fighter.energy || 0;
    
    // Zenitsu rất mạnh khoảng tầm xam dx > 150 với J1 lao tới.
    
    // Kích hoạt Powerup (U - 55 Nộ) để cấu rỉa bất ngờ từ xa cực kì nguy hiểm.
    if (energy >= 55 && absDx > 180 && absDx < 450 && this.ultimateCooldown === 0) {
      if (this.difficulty === 'hard' || this._chance(60)) {
         keys.powerup = true;
         this.ultimateCooldown = 90;
         return;
      }
    }

    // ULT1 - Lục Liên (I - 80 Nộ): Nhảy lạng lách kinh hoàng
    if (energy >= 80 && absDx < 600 && this.ultimateCooldown === 0) {
      if (this.difficulty === 'hard' || this._chance(60)) {
         keys.ult1 = true;
         this.ultimateCooldown = 200;
         return;
      }
    }

    // ULT2 - Thần Tốc (O - 100 Nộ): Dash one-shot toàn bản đồ luôn
    if (energy >= 100 && this.ultimateCooldown === 0 && this.difficulty !== 'easy') {
      keys.ult2 = true;
      this.ultimateCooldown = 300;
      return;
    }

    // Bọn múa: Zenitsu Hard lạm dụng J1 tầm trung để áp sát xé xác địch
    if (this.difficulty === 'hard') {
       if (absDx > 150 && absDx < 350 && this._chance(60)) {
           this.currentAction = 'attack';
           keys.attack = true;
           return;
       }
    }

    this._selectStandardAction(keys, dx, absDx, isOpponentAhead, 150, 320); // Range xa hơn bình thường
  }

  // --- LOGIC BOT: GENERIC (Nezuko / Inosuke) ---
  _playGeneric(keys, dx, absDx, isOpponentAhead) {
     if (this.fighter.energy >= 100 && this.ultimateCooldown === 0 && this._chance(60)) {
       keys.ultimate = true;
       this.ultimateCooldown = 180;
       return;
     }

     this._selectStandardAction(keys, dx, absDx, isOpponentAhead, 130, 250);
  }

  _selectStandardAction(keys, dx, absDx, isOpponentAhead, closeRange, midRange) {
    const rand = Math.random();

    // Easy AI (Ngu ngơ đánh chậm)
    if (this.difficulty === 'easy') {
      if (absDx < closeRange && rand < 0.4) keys.attack = true;
      else if (absDx < closeRange && rand < 0.6) keys.kick = true;
      else if (rand < 0.75) this.currentAction = 'approach';
      else if (rand < 0.85) this.currentAction = 'idle';
      else this.currentAction = 'retreat';
      
      if (this._chance(10)) this.currentAction = 'jump';
      return;
    }

    // Medium & Hard (Xài kĩ năng tinh quái hơn)
    if (absDx < closeRange && isOpponentAhead) {
      if (rand < 0.4) keys.attack = true;
      else if (rand < 0.65) keys.kick = true;
      else if (rand < 0.75 && this.difficulty === 'hard') keys.crouch = true; // Hard thỉnh thoảng ngồi né
      else if (rand < 0.85) keys.projectile = true;
      else this.currentAction = 'approach';
    } 
    else if (absDx < midRange) {
      if (rand < 0.4) keys.projectile = true;
      else if (rand < 0.8) this.currentAction = 'approach';
      else this.currentAction = 'retreat';
    }
    else {
      // Ở xa thì tiến lại gần, bắn đạn rỉa máu
      this.currentAction = 'approach';
      if (this._chance(30)) keys.projectile = true;
    }

    if (this._chance(15)) this.currentAction = 'jump';
  }

  setFighter(fighter) { this.fighter = fighter; }
  setOpponent(opponent) { this.opponent = opponent; }
}
