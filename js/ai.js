// ai.js - AI Controller for offline mode (Easy / Medium / Hard)
class AIController {
  constructor(difficulty, fighter, opponent) {
    this.difficulty = difficulty; // 'easy' | 'medium' | 'hard'
    this.fighter = fighter;
    this.opponent = opponent;
    this.actionTimer = 0;
    this.actionInterval = this._getBaseInterval();
    this.currentAction = null;
    this.comboStep = 0;
    this.comboTimer = 0;
    this.state = 'idle';
    this.thinkTimer = 0;
    this.dodgeCooldown = 0;
    this.blockCooldown = 0;
    this.jumpCooldown = 0;
    this.ultimateCooldown = 0;
    this.lastOpponentHP = 100;
  }

  _getBaseInterval() {
    switch (this.difficulty) {
      case 'easy':   return 50 + Math.random() * 40;  // ~1s
      case 'medium': return 25 + Math.random() * 20;  // ~0.5s
      case 'hard':   return 10 + Math.random() * 10;  // ~0.2s
    }
  }

  _chance(pct) {
    return Math.random() * 100 < pct;
  }

  update(keys) {
    if (!this.fighter || !this.opponent) return;

    // Cooldowns
    if (this.dodgeCooldown > 0) this.dodgeCooldown--;
    if (this.blockCooldown > 0) this.blockCooldown--;
    if (this.jumpCooldown > 0) this.jumpCooldown--;
    if (this.ultimateCooldown > 0) this.ultimateCooldown--;

    this.actionTimer++;
    this.thinkTimer++;

    const dx = this.opponent.x - this.fighter.x;
    const absDx = Math.abs(dx);
    const facingRight = this.fighter.facingRight;
    const isOpponentAhead = (dx > 0 && facingRight) || (dx < 0 && !facingRight);

    // Clear AI keys
    const aiKeys = {
      moveLeft: false, moveRight: false, jump: false,
      crouch: false, attack: false, kick: false,
      dodge: false, projectile: false, block: false, ultimate: false
    };

    // ── HARD AI ─────────────────────────────────────────────────────────
    if (this.difficulty === 'hard') {
      const opponentAttacking = this.opponent.isAttacking || this.opponent.isKicking;

      // Reactive block if opponent attacking and close
      if (opponentAttacking && absDx < 180 && isOpponentAhead && this._chance(60) && this.blockCooldown === 0) {
        aiKeys.block = true;
        this.blockCooldown = 30;
        return aiKeys;
      }

      // Dodge incoming projectile
      if (this.opponent.projectiles && this.opponent.projectiles.length > 0) {
        const threat = this.opponent.projectiles.find(p =>
          Math.abs(p.y - this.fighter.y) < 80 &&
          ((p.vx > 0 && p.x < this.fighter.x) || (p.vx < 0 && p.x > this.fighter.x))
        );
        if (threat && this.dodgeCooldown === 0 && this._chance(70)) {
          aiKeys.dodge = true;
          this.dodgeCooldown = 60;
          return aiKeys;
        }
      }

      // Use ultimate when energy full
      if (this.fighter.energy >= 100 && this.ultimateCooldown === 0 && this._chance(80)) {
        aiKeys.ultimate = true;
        this.ultimateCooldown = 180;
        return aiKeys;
      }

      // Projectile at medium range
      if (absDx > 200 && absDx < 450 && this._chance(30) && this.actionTimer % 40 === 0) {
        aiKeys.projectile = true;
        return aiKeys;
      }

      // Combo attack when close
      if (absDx < 140 && isOpponentAhead) {
        if (this.actionTimer % 8 === 0) {
          if (this._chance(60)) aiKeys.attack = true;
          else aiKeys.kick = true;
        }
        if (this.jumpCooldown === 0 && this._chance(15) && this.actionTimer % 50 === 0) {
          aiKeys.jump = true;
          this.jumpCooldown = 60;
        }
        // Move toward opponent only if too far
        if (absDx > 80) {
          aiKeys.moveRight = dx > 0;
          aiKeys.moveLeft = dx < 0;
        }
      } else {
        // Approach
        aiKeys.moveRight = dx > 0;
        aiKeys.moveLeft = dx < 0;
        // Jump over if stuck
        if (this.jumpCooldown === 0 && this._chance(8) && this.actionTimer % 60 === 0) {
          aiKeys.jump = true;
          this.jumpCooldown = 70;
        }
      }

      // Crouch occasionally to dodge high attacks
      if (this._chance(5) && this.actionTimer % 80 === 0) {
        aiKeys.crouch = true;
      }

    // ── MEDIUM AI ───────────────────────────────────────────────────────
    } else if (this.difficulty === 'medium') {
      if (this.actionTimer >= this.actionInterval) {
        this.actionTimer = 0;
        this.actionInterval = this._getBaseInterval();

        // Use ultimate occasionally
        if (this.fighter.energy >= 100 && this._chance(40) && this.ultimateCooldown === 0) {
          this.currentAction = 'ultimate';
          this.ultimateCooldown = 200;
        }
        // Basic combo
        else if (absDx < 140 && isOpponentAhead) {
          const rand = Math.random();
          if (rand < 0.4) this.currentAction = 'attack';
          else if (rand < 0.65) this.currentAction = 'kick';
          else if (rand < 0.75) this.currentAction = 'block';
          else if (rand < 0.85) this.currentAction = 'projectile';
          else this.currentAction = 'approach';
        } else {
          this.currentAction = 'approach';
          if (absDx > 300 && this._chance(30)) this.currentAction = 'projectile';
        }
        if (this._chance(15) && this.jumpCooldown === 0) {
          this.currentAction = 'jump';
          this.jumpCooldown = 80;
        }
      }

      // Execute current action
      if (this.currentAction === 'attack') aiKeys.attack = true;
      else if (this.currentAction === 'kick') aiKeys.kick = true;
      else if (this.currentAction === 'block') aiKeys.block = true;
      else if (this.currentAction === 'projectile') aiKeys.projectile = true;
      else if (this.currentAction === 'ultimate') aiKeys.ultimate = true;
      else if (this.currentAction === 'jump') { aiKeys.jump = true; this.currentAction = null; }
      else if (this.currentAction === 'approach') {
        aiKeys.moveRight = dx > 0;
        aiKeys.moveLeft = dx < 0;
      }

    // ── EASY AI ─────────────────────────────────────────────────────────
    } else {
      if (this.actionTimer >= this.actionInterval) {
        this.actionTimer = 0;
        this.actionInterval = this._getBaseInterval();

        const rand = Math.random();
        if (absDx < 130 && rand < 0.4) this.currentAction = 'attack';
        else if (absDx < 130 && rand < 0.55) this.currentAction = 'kick';
        else if (rand < 0.75) this.currentAction = 'approach';
        else if (rand < 0.85) this.currentAction = 'idle';
        else this.currentAction = 'retreat';

        if (this._chance(10) && this.jumpCooldown === 0) {
          this.currentAction = 'jump';
          this.jumpCooldown = 100;
        }
      }

      if (this.currentAction === 'attack') aiKeys.attack = true;
      else if (this.currentAction === 'kick') aiKeys.kick = true;
      else if (this.currentAction === 'jump') { aiKeys.jump = true; this.currentAction = null; }
      else if (this.currentAction === 'approach') {
        aiKeys.moveRight = dx > 0;
        aiKeys.moveLeft = dx < 0;
      } else if (this.currentAction === 'retreat') {
        aiKeys.moveLeft = dx > 0;
        aiKeys.moveRight = dx < 0;
      }
    }

    return aiKeys;
  }

  setFighter(fighter) { this.fighter = fighter; }
  setOpponent(opponent) { this.opponent = opponent; }
}
