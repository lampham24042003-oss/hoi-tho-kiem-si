// effects.js - Particles, screen shake, hit flash, cinematic overlay
const Effects = (() => {
  const particles = [];
  const spriteImpacts = [];
  let shakeAmount = 0;
  let shakeX = 0;
  let shakeY = 0;
  let flashAlpha = 0;
  let flashColor = 'white';

  // Particle class
  function createParticle(x, y, color, options = {}) {
    const angle = options.angle !== undefined ? options.angle : Math.random() * Math.PI * 2;
    const speed = options.speed || (2 + Math.random() * 4);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed * (options.spreadX || 1),
      vy: Math.sin(angle) * speed * (options.spreadY || 1) - (options.upBias || 0),
      life: 1.0,
      decay: options.decay || (0.02 + Math.random() * 0.04),
      size: options.size || (2 + Math.random() * 4),
      color,
      glow: options.glow || color,
      type: options.type || 'spark',
      gravity: options.gravity !== undefined ? options.gravity : 0.15,
      alpha: 1.0
    });
  }

  function hitSparks(x, y, color, glow, count = 12) {
    for (let i = 0; i < count; i++) {
      createParticle(x, y, color, {
        glow,
        speed: 3 + Math.random() * 5,
        size: 1.5 + Math.random() * 3,
        decay: 0.03 + Math.random() * 0.05,
        upBias: 2,
        type: 'spark'
      });
    }
    // Slash line
    createParticle(x, y, glow, { type: 'ring', size: 30, decay: 0.08, speed: 0, gravity: 0 });
  }

  function ultimateParticles(x, y, color, glow, count = 30) {
    for (let i = 0; i < count; i++) {
      createParticle(x, y, color, {
        glow,
        speed: 5 + Math.random() * 8,
        size: 3 + Math.random() * 6,
        decay: 0.012 + Math.random() * 0.02,
        upBias: 3,
        type: 'spark'
      });
    }
    for (let i = 0; i < 5; i++) {
      createParticle(x, y, glow, { type: 'ring', size: 20 + i * 15, decay: 0.04, speed: 0, gravity: 0 });
    }
  }

  function energyBurst(x, y, color) {
    for (let i = 0; i < 8; i++) {
      createParticle(x, y, color, {
        angle: (i / 8) * Math.PI * 2,
        speed: 2 + Math.random() * 3,
        size: 3 + Math.random() * 4,
        decay: 0.025,
        gravity: 0.05,
        type: 'energy'
      });
    }
  }

  function screenShake(amount) {
    shakeAmount = Math.max(shakeAmount, amount);
  }

  function flashScreen(color = 'white', alpha = 0.6) {
    flashColor = color;
    flashAlpha = alpha;
  }

  function update() {
    // Shake decay
    if (shakeAmount > 0) {
      shakeX = (Math.random() - 0.5) * shakeAmount * 2;
      shakeY = (Math.random() - 0.5) * shakeAmount * 2;
      shakeAmount *= 0.85;
      if (shakeAmount < 0.2) shakeAmount = 0;
    } else {
      shakeX = 0; shakeY = 0;
    }

    // Flash decay
    if (flashAlpha > 0) flashAlpha -= 0.06;
    if (flashAlpha < 0) flashAlpha = 0;

    // Update Sprite Impacts
    for (let i = spriteImpacts.length - 1; i >= 0; i--) {
      spriteImpacts[i].life -= 0.05; // ~0.33s lifetime
      if (spriteImpacts[i].life <= 0) spriteImpacts.splice(i, 1);
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.95;
      p.life -= p.decay;
      p.alpha = p.life;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function draw(ctx, canvasW, canvasH) {
    // Apply shake transform
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Draw particles
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'ring') {
        ctx.strokeStyle = p.glow;
        // Tắt shadow để tránh bug Safari vẽ thành hình đen sì
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Dùng 1.99 thay vì 2 để tránh bug hình đóng của canvas Webkit
        ctx.arc(p.x, p.y, p.size * (1.5 - p.life), 0, Math.PI * 1.99);
        ctx.stroke();
      } else if (p.type === 'energy') {
        ctx.fillStyle = p.glow;
        // Tạm thời tắt shadow để tránh lỗi Safari
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 1.99);
        ctx.fill();
      } else {
        // Spark
        ctx.shadowColor = p.glow;
        ctx.shadowBlur = 8;
        ctx.fillStyle = p.color;
        const len = p.size * p.life;
        ctx.save();
        ctx.translate(p.x, p.y);
        const vel = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        ctx.rotate(Math.atan2(p.vy, p.vx));
        ctx.beginPath();
        ctx.ellipse(0, 0, len * 1.5, len * 0.4, 0, 0, Math.PI * 1.99);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    ctx.restore();

    // Draw Sprite Impacts
    if (spriteImpacts.length > 0) {
      ctx.save();
      ctx.translate(shakeX, shakeY);
      ctx.globalCompositeOperation = 'screen'; 
      for (const imp of spriteImpacts) {
        if (!imp.img) continue;
        // Peak alpha reduced to 0.7 to avoid obscuring characters visually
        const alpha = Math.min(0.7, imp.life * 1.5 * 0.7);
        ctx.globalAlpha = alpha;
        
        // Fast expansion scale (0.8 to 1.3)
        const scale = (0.8 + (1 - imp.life) * 0.5) * (imp.scaleMult || 1.0);
        const imgRatio = imp.img.width / imp.img.height;
        const h = 250 * scale; // Large impact
        const w = h * imgRatio;
        
        ctx.save();
        ctx.translate(imp.x, imp.y);
        ctx.rotate(imp.rotation);
        ctx.drawImage(imp.img, -w/2, -h/2, w, h);
        ctx.restore();
      }
      ctx.restore();
    }

    // Flash overlay
    if (flashAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = flashAlpha;
      ctx.fillStyle = flashColor;
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.restore();
    }
  }

  function waterHit(x, y) {
    for (let i = 0; i < 12; i++) {
      createParticle(x, y, '#88ddff', {
        glow: '#00d4ff', speed: 4 + Math.random() * 5,
        size: 2 + Math.random() * 3, decay: 0.028 + Math.random() * 0.03,
        upBias: 3, type: 'spark'
      });
    }
    for (let i = 0; i < 2; i++)
      createParticle(x, y, '#00d4ff', { type: 'ring', size: 12 + i * 20, decay: 0.05, speed: 0, gravity: 0 });
  }

  function flameHit(x, y) {
    for (let i = 0; i < 14; i++) {
      createParticle(x, y, i % 2 ? '#ff4488' : '#ff0033', {
        glow: '#ff88cc', speed: 5 + Math.random() * 6,
        size: 2 + Math.random() * 4, decay: 0.022 + Math.random() * 0.03,
        upBias: 5, type: 'spark'
      });
    }
    createParticle(x, y, '#ff2244', { type: 'ring', size: 28, decay: 0.055, speed: 0, gravity: 0 });
  }

  function lightningHit(x, y) {
    for (let i = 0; i < 18; i++) {
      createParticle(x, y, i < 8 ? '#ffffff' : '#ffff44', {
        glow: '#ffee00', speed: 7 + Math.random() * 9,
        size: 1 + Math.random() * 2.5, decay: 0.055 + Math.random() * 0.06,
        upBias: 0, type: 'spark'
      });
    }
    for (let i = 0; i < 3; i++)
      createParticle(x, y, '#ffffff', { type: 'ring', size: 8 + i * 14, decay: 0.1, speed: 0, gravity: 0 });
  }

  function beastHit(x, y) {
    for (let i = 0; i < 12; i++) {
      createParticle(x, y, i % 2 ? '#66ff88' : '#aaffcc', {
        glow: '#44ff66', speed: 5 + Math.random() * 5,
        size: 2 + Math.random() * 4, decay: 0.025 + Math.random() * 0.035,
        upBias: 1, spreadX: 1.6, type: 'spark'
      });
    }
    createParticle(x, y, '#44ff66', { type: 'ring', size: 32, decay: 0.048, speed: 0, gravity: 0 });
  }

  function getShake() { return { x: shakeX, y: shakeY }; }

  function spawnSpriteImpact(x, y, img, rotation = 0, scaleMult = 1.0) {
    if (!img) return;
    spriteImpacts.push({ x, y, img, life: 1.0, rotation, scaleMult });
  }

  return {
    hitSparks, ultimateParticles, energyBurst,
    screenShake, flashScreen, update, draw, getShake,
    waterHit, flameHit, lightningHit, beastHit, spawnSpriteImpact
  };
})();

// ──────────────────────────────────────────────
// Character-Specific Visual Effects
// ──────────────────────────────────────────────
const CharEffects = (() => {

  // ── Swing Trails ─────────────────────────────────────────────────
  // Called inside _drawSword after ctx.translate(pivot) + ctx.rotate(angle*dir)
  // So startAngle=(-0.7)*dir, endAngle=angle*dir in this local frame.

  function _waterTrail(ctx, angle, dir, len, progress) {
    const startA = (-0.7) * dir, endA = angle * dir;
    const baseAlpha = 0.6 * (1 - progress);
    const t = Date.now() * 0.004;
    // 3 flowing wave arcs at different radii
    for (let i = 0; i < 3; i++) {
      const r = len * (0.75 + i * 0.1);
      const ripple = Math.sin(t + i * 1.2) * 2;
      ctx.globalAlpha = baseAlpha * (1 - i * 0.28);
      ctx.strokeStyle = i === 0 ? '#cceeFF' : '#00aaff';
      ctx.lineWidth   = 3.5 - i * 1;
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur  = 14;
      ctx.beginPath();
      ctx.arc(ripple, ripple * 0.3, r, startA, endA, dir < 0);
      ctx.stroke();
    }
    // Droplet dots along the arc tip
    ctx.fillStyle  = '#aaddff';
    ctx.shadowBlur = 6;
    for (let i = 0; i < 4; i++) {
      const frac = i / 3;
      const a = startA + (endA - startA) * frac;
      ctx.globalAlpha = baseAlpha * (1 - frac * 0.5);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * len * 0.88, Math.sin(a) * len * 0.88, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function _flameTrail(ctx, angle, dir, len, progress) {
    const startA = (-0.7) * dir, endA = angle * dir;
    const baseAlpha = 0.65 * (1 - progress);
    const t = Date.now() * 0.012;
    const colors = ['#ff88aa', '#ff3366', '#cc0033', '#ff6688'];
    for (let i = 0; i < 4; i++) {
      const flicker = Math.sin(t + i * 0.9) * 4;
      const r = len * (0.7 + i * 0.08) + flicker;
      ctx.globalAlpha = baseAlpha * (1 - i * 0.2);
      ctx.strokeStyle = colors[i];
      ctx.lineWidth   = 4.5 - i;
      ctx.shadowColor = '#ff2266';
      ctx.shadowBlur  = 18 + flicker;
      ctx.beginPath();
      ctx.arc(0, flicker * 0.2, r, startA, endA, dir < 0);
      ctx.stroke();
    }
    // Flame sparks along trail
    ctx.shadowBlur = 10;
    for (let i = 0; i < 5; i++) {
      const a = startA + (endA - startA) * (i / 4);
      const r = len * (0.75 + Math.sin(t + i) * 0.08);
      ctx.globalAlpha = baseAlpha * 0.8;
      ctx.fillStyle   = i % 2 ? '#ff4488' : '#ffaacc';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 3.5 * (1 - progress), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function _lightningTrail(ctx, angle, dir, len, progress) {
    const startA = (-0.7) * dir, endA = angle * dir;
    const baseAlpha = 0.8 * (1 - progress);
    const t = Date.now() * 0.025;
    // Draw 3 passes: white core, yellow mid, gold outer
    const styles = [
      { color: '#ffffff', lw: 1.5, blur: 8  },
      { color: '#ffff44', lw: 3,   blur: 18 },
      { color: '#ffcc00', lw: 4.5, blur: 28 },
    ];
    for (let pass = 0; pass < 3; pass++) {
      ctx.strokeStyle = styles[pass].color;
      ctx.lineWidth   = styles[pass].lw;
      ctx.shadowColor = '#ffee00';
      ctx.shadowBlur  = styles[pass].blur;
      ctx.globalAlpha = baseAlpha * (1 - pass * 0.22);
      // Jagged path
      ctx.beginPath();
      const steps = 9;
      for (let s = 0; s <= steps; s++) {
        const frac = s / steps;
        const a = startA + (endA - startA) * frac;
        const r = len * 0.85;
        const jitter = (pass > 0 && s > 0 && s < steps) ? (Math.sin(t * 4 + s * 2.3) * (6 + pass * 3)) : 0;
        const px = Math.cos(a) * (r + jitter);
        const py = Math.sin(a) * (r + jitter);
        s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    // Side sparks
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 1;
    ctx.shadowBlur  = 6;
    for (let i = 0; i < 4; i++) {
      const a = startA + (endA - startA) * (i / 3);
      const r = len * 0.85;
      const ox = Math.cos(a) * r, oy = Math.sin(a) * r;
      const sa = Math.sin(t * 5 + i) * Math.PI;
      ctx.globalAlpha = baseAlpha * 0.9;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(sa) * 10, oy + Math.sin(sa) * 7);
      ctx.stroke();
    }
  }

  function _beastTrail(ctx, angle, dir, len, progress) {
    const startA = (-0.7) * dir, endA = angle * dir;
    const baseAlpha = 0.65 * (1 - progress);
    // 4 parallel claw-scratch lines
    const offsets = [-10, -3, 4, 11];
    const clawColors = ['#ccffdd', '#66ff88', '#33dd55', '#88ffaa'];
    for (let c = 0; c < 4; c++) {
      const off = offsets[c];
      ctx.globalAlpha = baseAlpha * (1 - c * 0.18);
      ctx.strokeStyle = clawColors[c];
      ctx.lineWidth   = 3 - c * 0.5;
      ctx.shadowColor = '#44ff66';
      ctx.shadowBlur  = 12;
      const r = len * 0.82;
      const sx = Math.cos(startA) * r, sy = Math.sin(startA) * r + off;
      const ex = Math.cos(endA) * r,   ey = Math.sin(endA) * r + off;
      const cpx = (sx + ex) / 2 + dir * 18, cpy = (sy + ey) / 2 - 8;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(cpx, cpy, ex, ey);
      ctx.stroke();
    }
    // Wind dust at arc tip
    ctx.fillStyle  = '#aaffcc';
    ctx.shadowBlur = 5;
    for (let i = 0; i < 4; i++) {
      const a   = startA + (endA - startA) * (i / 3);
      const r   = len * (0.6 + Math.random() * 0.3);
      ctx.globalAlpha = baseAlpha * 0.55;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r + (Math.random() - 0.5) * 16,
              Math.sin(a) * r + (Math.random() - 0.5) * 16, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Projectile Renderers ──────────────────────────────────────────
  // Called after ctx.translate(p.x, p.y). p.vx > 0 means moving right.

  function _waterProjectile(ctx, p) {
    const hw = p.w / 2, t = Date.now() * 0.008;
    ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 22;
    for (let i = 0; i < 3; i++) {
      const off = i * 7 * (p.vx > 0 ? -1 : 1);
      ctx.globalAlpha = p.life * (1 - i * 0.28);
      ctx.strokeStyle = ['#eef9ff', '#55ccff', '#0088cc'][i];
      ctx.fillStyle   = '#0099cc' + ['55', '33', '22'][i];
      ctx.lineWidth   = 3 - i * 0.8;
      ctx.beginPath();
      ctx.moveTo(-hw + off, 0);
      ctx.bezierCurveTo(-hw * 0.4 + off, -p.h * 2.2, hw * 0.4 + off, -p.h * 2.2, hw + off, 0);
      ctx.bezierCurveTo(hw * 0.4 + off, p.h * 2.2, -hw * 0.4 + off, p.h * 2.2, -hw + off, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // Trailing droplets
    const td = p.vx > 0 ? -1 : 1;
    ctx.shadowBlur = 6; ctx.fillStyle = '#88ddff';
    for (let i = 0; i < 5; i++) {
      ctx.globalAlpha = p.life * (0.8 - i * 0.15);
      ctx.beginPath();
      ctx.arc(td * (12 + i * 9), Math.sin(t + i) * 5, 2.5 - i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function _flameProjectile(ctx, p) {
    const hw = p.w / 2, t = Date.now() * 0.018;
    ctx.shadowColor = '#ff2266'; ctx.shadowBlur = 28;
    for (let i = 0; i < 3; i++) {
      const flicker = Math.sin(t + i * 1.1) * 4;
      ctx.globalAlpha = p.life * (1 - i * 0.22);
      ctx.strokeStyle = ['#ffbbcc', '#ff3366', '#cc0022'][i];
      ctx.fillStyle   = '#ff1144' + ['55', '33', '22'][i];
      ctx.lineWidth   = 5 - i * 1.2;
      ctx.beginPath();
      ctx.moveTo(-hw, flicker);
      ctx.bezierCurveTo(-hw * 0.4, -p.h * 2.8 + flicker, hw * 0.4, -p.h * 2.8 + flicker, hw, flicker);
      ctx.bezierCurveTo(hw * 0.4, p.h * 2.8 + flicker, -hw * 0.4, p.h * 2.8 + flicker, -hw, flicker);
      ctx.closePath(); if (i === 0) ctx.fill(); ctx.stroke();
    }
    // Flame trail
    const td = p.vx > 0 ? -1 : 1;
    ctx.shadowBlur = 10;
    for (let i = 0; i < 5; i++) {
      ctx.globalAlpha = p.life * (0.7 - i * 0.12);
      ctx.fillStyle   = i % 2 ? '#ff3366' : '#ff0022';
      ctx.beginPath();
      ctx.arc(td * (10 + i * 9), Math.sin(t + i * 0.8) * 7, 4 - i * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function _lightningProjectile(ctx, p) {
    const hw = p.w / 2, t = Date.now() * 0.02;
    ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 32;
    const passes = [
      { c: '#ffffff', lw: 1.5 },
      { c: '#ffff55', lw: 3.5 },
      { c: '#ffcc00', lw: 5.5 },
    ];
    for (let pass = 0; pass < 3; pass++) {
      ctx.strokeStyle = passes[pass].c;
      ctx.lineWidth   = passes[pass].lw;
      ctx.globalAlpha = p.life * (1 - pass * 0.2);
      ctx.beginPath();
      ctx.moveTo(-hw, 0);
      const segs = 8;
      for (let s = 1; s <= segs; s++) {
        const x = -hw + (hw * 2) * (s / segs);
        const y = s < segs ? (Math.sin(t + s * 2.2) * p.h * (pass === 0 ? 0.6 : 1.4)) : 0;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Side sparks
    const td = p.vx > 0 ? -1 : 1;
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.shadowBlur = 8;
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = p.life * 0.85;
      const sx = td * (14 + i * 10), sy = (Math.random() - 0.5) * p.h * 2;
      ctx.beginPath(); ctx.moveTo(sx, sy);
      ctx.lineTo(sx + td * -(6 + Math.random() * 8), sy + (Math.random() - 0.5) * 8);
      ctx.stroke();
    }
    // Speed lines
    ctx.strokeStyle = '#ffff44'; ctx.shadowBlur = 4;
    for (let i = 0; i < 4; i++) {
      ctx.globalAlpha = p.life * (0.5 - i * 0.1);
      const ox = td * (18 + i * 10), oy = (i - 1.5) * 5;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + td * -12, oy); ctx.stroke();
    }
  }

  function _windProjectile(ctx, p) {
    const hw = p.w / 2, t = Date.now() * 0.015;
    const spin = t * 4 * (p.vx > 0 ? 1 : -1);
    ctx.shadowColor = '#44ff66'; ctx.shadowBlur = 18;
    // Spinning wind rings
    ctx.save(); ctx.rotate(spin);
    for (let ring = 0; ring < 3; ring++) {
      const r = hw * (0.38 + ring * 0.28);
      ctx.strokeStyle = ['#eeffee', '#66ff88', '#22cc44'][ring];
      ctx.lineWidth   = 3 - ring * 0.7;
      ctx.globalAlpha = p.life * (1 - ring * 0.28);
      ctx.beginPath(); ctx.arc(0, 0, r, ring * 0.6, ring * 0.6 + Math.PI * 1.4); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * 0.65, ring * 0.6 + Math.PI, ring * 0.6 + Math.PI * 2.4); ctx.stroke();
    }
    ctx.restore();
    // Claw leading scratches
    const td = p.vx > 0 ? 1 : -1;
    ctx.strokeStyle = '#aaffcc'; ctx.lineWidth = 1.5; ctx.shadowBlur = 7;
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = p.life * 0.75;
      const ox = td * hw * 0.6, oy = (i - 1) * 7;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + td * 22, oy + (i - 1) * 3); ctx.stroke();
    }
  }

  // ── Public API ────────────────────────────────────────────────────

  function swingTrail(ctx, charId, angle, dir, len, progress, glow) {
    ctx.save();
    switch (charId) {
      case 'tanjiro': _waterTrail(ctx, angle, dir, len, progress);     break;
      case 'nezuko':  _flameTrail(ctx, angle, dir, len, progress);     break;
      case 'zenitsu': _lightningTrail(ctx, angle, dir, len, progress); break;
      case 'inosuke': _beastTrail(ctx, angle, dir, len, progress);     break;
      default:
        ctx.globalAlpha = 0.35 * (1 - progress);
        ctx.strokeStyle = glow; ctx.lineWidth = 2;
        ctx.shadowColor = glow; ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, len * 0.85, (-0.7) * dir, angle * dir, dir < 0);
        ctx.stroke();
    }
    ctx.restore();
  }

  function drawProjectile(ctx, p) {
    const charId = p.owner ? p.owner.charData.id : null;
    ctx.save();
    const sh = Effects.getShake();
    ctx.translate(p.x + sh.x, p.y + sh.y);
    switch (charId) {
      case 'tanjiro': _waterProjectile(ctx, p);     break;
      case 'nezuko':  _flameProjectile(ctx, p);     break;
      case 'zenitsu': _lightningProjectile(ctx, p); break;
      case 'inosuke': _windProjectile(ctx, p);      break;
      default: {
        const hw = p.w / 2;
        ctx.shadowColor = p.glow; ctx.shadowBlur = 20;
        ctx.strokeStyle = p.glow; ctx.lineWidth = 3;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.moveTo(-hw, 0);
        ctx.bezierCurveTo(-hw * 0.5, -p.h * 1.5, hw * 0.5, -p.h * 1.5, hw, 0);
        ctx.bezierCurveTo(hw * 0.5, p.h * 1.5, -hw * 0.5, p.h * 1.5, -hw, 0);
        ctx.closePath();
        ctx.fillStyle = p.color + '88'; ctx.fill(); ctx.stroke();
      }
    }
    ctx.restore();
  }

  function hitEffect(x, y, charId, type = 'sword') {
    const key = `hit_${charId}_${type}`;
    const img = Images.get(key);
    if (img) {
      const randomRotation = Math.random() * Math.PI * 2;
      
      let scaleMult = 1.0;
      if (type === 'sword') scaleMult = 0.35;  // Much smaller for quick slash
      else if (type === 'kick') scaleMult = 0.45; // Small for kick shockwave
      else if (type === 'block') scaleMult = 0.6; // Moderate for block
      else if (type === 'proj') scaleMult = 0.8;  // Medium for projectile

      Effects.spawnSpriteImpact(x, y, img, randomRotation, scaleMult);
    } else {
      // Fallback
      Effects.hitSparks(x, y, '#ffffff', '#aaddff', 12);
    }
  }

  return { swingTrail, drawProjectile, hitEffect };
})();

// ──────────────────────────────────────────────
// Cinematic Ultimate Overlay  (side-panel, fast)
// ──────────────────────────────────────────────
const CinematicOverlay = (() => {
  let active   = false;
  let timer    = 0;
  let phase    = 'idle'; // 'freeze' → 'show' → 'fadeout' → 'idle'
  let alpha    = 0;
  let riseOffset = 0;
  let attacker = null;
  let ultimateImage = null;
  let onComplete    = null;

  // Timing (frames at 60fps)
  const T_FREEZE   = 10;   // quick buildup
  const T_SHOW     = 25;   // peak visual
  const T_FADEOUT  = 15;   // dissipate fading

  function start(sourceAttacker, callback) {
    active        = true;
    phase         = 'freeze';
    timer         = 0;
    alpha         = 0;
    riseOffset    = 60; // start low, rise up naturally
    attacker      = sourceAttacker;
    ultimateImage = Images.get(`ultimate_${attacker.charData.id}`);
    onComplete    = callback;
  }

  function update(dt) {
    if (!active) return;
    timer += dt;

    if (phase === 'freeze') {
      const t = Math.min(1, timer / T_FREEZE);
      alpha  = t;
      riseOffset = 60 * (1 - t);
      if (timer >= T_FREEZE) { phase = 'show'; timer = 0; alpha = 1; riseOffset = 0; }

    } else if (phase === 'show') {
      alpha  = 1;
      riseOffset = 0;
      if (timer >= T_SHOW) {
        phase = 'fadeout';
        timer = 0;
        // Trigger peak game impact flash & shake
        Effects.flashScreen(attacker.charData.swordGlow || 'white', 0.6);
        Effects.screenShake(28);
        if (onComplete) { onComplete(); onComplete = null; }
      }

    } else if (phase === 'fadeout') {
      const t = Math.min(1, timer / T_FADEOUT);
      alpha  = 1 - t;
      riseOffset = -30 * t; // float gently upwards while fading
      if (timer >= T_FADEOUT) { active = false; phase = 'idle'; attacker = null; }
    }
  }

  function draw(ctx, W, H) {
    if (!active || alpha <= 0.01 || !ultimateImage || !attacker) return;

    ctx.save();
    
    // Apply shake to match character shake
    const sh = Effects.getShake();
    ctx.translate(sh.x, sh.y);

    // Screen blend mode acts exactly like lighting add, completely hiding pure black (#000000)
    // and naturally overlapping the aura onto the environment/characters without harsh edge lines.
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = alpha;

    const imgRatio = ultimateImage.width / ultimateImage.height;
    const drawH = H * 0.95; // Epic size scale
    const drawW = drawH * imgRatio;
    
    // Anchored directly over the attacker
    const cx = attacker.x;
    // Ground is approx H * 0.8. Adjust cy so the graphic sits gracefully.
    const cy = attacker.y;

    const imgX = cx; // Pivot at center X
    const imgY = cy - drawH + 90 + riseOffset; 
    
    if (!attacker.facingRight) {
      ctx.translate(imgX, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(ultimateImage, -drawW / 2, imgY, drawW, drawH);
    } else {
      ctx.drawImage(ultimateImage, imgX - drawW / 2, imgY, drawW, drawH);
    }

    ctx.restore();
  }

  function isActive()  { return active; }
  function isFreeze()  { return active && phase === 'freeze'; }

  return { start, update, draw, isActive, isFreeze };
})();

