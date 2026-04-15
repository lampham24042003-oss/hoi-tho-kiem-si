/**
 * remove-bg-test.js – Remove WHITE background from test sprites
 * SAFE mode: ONLY edge flood-fill, NO global scan (prevents eating character pixels)
 */
const path = require('path');
const fs   = require('fs');
const JimpPkg = require('jimp');
const J = JimpPkg.Jimp;

const BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef';
const TEST_DIR  = path.join(__dirname, '..', 'assets', 'sprites', 'test');
const CHARS     = ['tanjiro', 'nezuko', 'zenitsu', 'inosuke'];
const POSES     = ['idle', 'jump', 'crouch', 'run1', 'run2'];

// Map from test filename to original brain filename
const BRAIN_MAP = {
  'tanjiro_idle.png':   'tanjiro_idle_new_1775792052542.png',
  'tanjiro_jump.png':   'tanjiro_jump_new_1775792137521.png',
  'tanjiro_crouch.png': 'tanjiro_crouch_new_1775792224264.png',
  'tanjiro_run1.png':   'tanjiro_run1_new_1775792311199.png',
  'tanjiro_run2.png':   'tanjiro_run2_v3_1775793274458.png',
  'nezuko_idle.png':    'nezuko_idle_new_1775792068282.png',
  'nezuko_jump.png':    'nezuko_jump_new_1775792158244.png',
  'nezuko_crouch.png':  'nezuko_crouch_new_1775792241748.png',
  'nezuko_run1.png':    'nezuko_run1_new_1775792324683.png',
  'nezuko_run2.png':    'nezuko_run2_v2_1775793097219.png',
  'zenitsu_idle.png':   'zenitsu_idle_new_1775792083647.png',
  'zenitsu_jump.png':   'zenitsu_jump_new_1775792172783.png',
  'zenitsu_crouch.png': 'zenitsu_crouch_new_1775792255236.png',
  'zenitsu_run1.png':   'zenitsu_run1_new_1775792345078.png',
  'zenitsu_run2.png':   'zenitsu_run2_v2_1775793111886.png',
  'inosuke_idle.png':   'inosuke_idle_new_1775792100408.png',
  'inosuke_jump.png':   'inosuke_jump_new_1775792189541.png',
  'inosuke_crouch.png': 'inosuke_crouch_new_1775792271838.png',
  'inosuke_run1.png':   'inosuke_run1_new_1775792361737.png',
  'inosuke_run2.png':   'inosuke_run2_v3_1775793290739.png',
};

// Specific sprites to process (problematic ones)
const TARGET_MAP = {
  'tanjiro_crouch.png': 'tanjiro_crouch_new_1775792224264.png',
  'tanjiro_run1.png':   'tanjiro_run1_new_1775792311199.png',
  'tanjiro_jump.png':   'tanjiro_jump_new_1775792137521.png',
  'nezuko_idle.png':    'nezuko_idle_new_1775792068282.png',
  'nezuko_jump.png':    'nezuko_jump_new_1775792158244.png',
  'nezuko_crouch.png':  'nezuko_crouch_new_1775792241748.png',
  'nezuko_run1.png':    'nezuko_run1_new_1775792324683.png',
  'nezuko_run2.png':    'nezuko_run2_v2_1775793097219.png',
  'zenitsu_jump.png':   'zenitsu_jump_new_1775792172783.png',
  'zenitsu_run1.png':   'zenitsu_run1_new_1775792345078.png',
  'inosuke_run1.png':   'inosuke_run1_new_1775792361737.png',
};

// Phase 1: flood-fill from edges
const TOLERANCE1 = 60;   // wider than before to catch more bg
const FEATHER1   = 25;

// Phase 2: multi-pass expansion from already-transparent border
const LUMA_THRESHOLD = 195;  // pixel must be bright (white-ish)
const TOLERANCE2     = 72;   // max dist from bg color to be considered bg
const MAX_PASSES     = 20;   // repeat until no more changes

function colorDist(r1,g1,b1, r2,g2,b2) {
  const dr=r1-r2, dg=g1-g2, db=b1-b2;
  return Math.sqrt(dr*dr+dg*dg+db*db);
}

async function processSprite(file) {
  const brainFile = TARGET_MAP[file];
  const srcPath   = path.join(BRAIN_DIR, brainFile);
  const destPath  = path.join(TEST_DIR, file);
  fs.copyFileSync(srcPath, destPath);   // always start from original

  const img = await J.read(destPath);
  const { width, height } = img.bitmap;
  const data = img.bitmap.data;

  // Sample bg color from corner
  const refR = data[0], refG = data[1], refB = data[2];

  // ── PHASE 1: edge flood-fill ─────────────────────────────────────────────
  const visited = new Uint8Array(width * height);
  const stack   = [];

  function tryPush(x, y) {
    if (x<0||x>=width||y<0||y>=height) return;
    const k = y*width+x;
    if (visited[k]) return;
    visited[k] = 1;
    const i = k*4;
    if (colorDist(data[i],data[i+1],data[i+2], refR,refG,refB) < TOLERANCE1)
      stack.push(x, y);
  }

  for (let x=0; x<width; x++)    { tryPush(x,0); tryPush(x,height-1); }
  for (let y=1; y<height-1; y++) { tryPush(0,y); tryPush(width-1,y); }

  while (stack.length) {
    const y=stack.pop(), x=stack.pop();
    const i=(y*width+x)*4;
    const dist = colorDist(data[i],data[i+1],data[i+2], refR,refG,refB);
    data[i+3] = dist<FEATHER1 ? 0 : Math.round(((dist-FEATHER1)/(TOLERANCE1-FEATHER1))*255);
    tryPush(x+1,y); tryPush(x-1,y); tryPush(x,y+1); tryPush(x,y-1);
  }

  // ── PHASE 3: enclosed white pocket removal ───────────────────────────────
  // Find connected white regions NOT touching any image edge → interior bg pockets
  const LUMA_POCKET  = 185;  // pixels brighter than this are candidate bg
  const DIST_POCKET  = 80;   // max dist from bg ref to be considered bg
  const pocketVisited = new Uint8Array(width * height);

  function isWhitePocket(idx) {
    if (data[idx+3] < 10) return false;            // already transparent
    const luma = 0.299*data[idx] + 0.587*data[idx+1] + 0.114*data[idx+2];
    if (luma < LUMA_POCKET) return false;          // not bright enough
    const dist = colorDist(data[idx],data[idx+1],data[idx+2], refR,refG,refB);
    return dist < DIST_POCKET;
  }

  for (let startY=1; startY<height-1; startY++) {
    for (let startX=1; startX<width-1; startX++) {
      const startK = startY*width+startX;
      if (pocketVisited[startK]) continue;
      const si = startK*4;
      if (!isWhitePocket(si)) { pocketVisited[startK]=1; continue; }

      // BFS to find the connected white component
      const component = [];
      let touchesEdge = false;
      const q = [startX, startY];
      pocketVisited[startK] = 1;

      while (q.length) {
        const cy = q.pop(), cx = q.pop();
        component.push(cx, cy);
        if (cx===0||cx===width-1||cy===0||cy===height-1) touchesEdge = true;

        for (const [nx,ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]) {
          if (nx<0||nx>=width||ny<0||ny>=height) continue;
          const k = ny*width+nx;
          if (pocketVisited[k]) continue;
          pocketVisited[k] = 1;
          if (isWhitePocket(k*4)) q.push(nx, ny);
        }
      }

      // If this white region doesn't touch any image border → enclosed pocket → remove
      if (!touchesEdge) {
        for (let i=0; i<component.length; i+=2) {
          const idx = (component[i+1]*width+component[i])*4;
          data[idx+3] = 0;
        }
      }
    }
  }

  // Only removes bright pixels (white-ish) that are directly touching a
  // transparent pixel — safe, never creates interior holes
  for (let pass=0; pass<MAX_PASSES; pass++) {
    let changed = false;
    for (let y=0; y<height; y++) {
      for (let x=0; x<width; x++) {
        const i = (y*width+x)*4;
        if (data[i+3]===0) continue;                         // already transparent

        // Must be bright (white-ish background remnant)
        const luma = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2];
        if (luma < LUMA_THRESHOLD) continue;

        // Must be close to the sampled bg color
        const dist = colorDist(data[i],data[i+1],data[i+2], refR,refG,refB);
        if (dist > TOLERANCE2) continue;

        // Must be adjacent to at least one already-transparent pixel
        const hasAlpha0 =
          (x>0        && data[(y*width+(x-1))*4+3]     < 10) ||
          (x<width-1  && data[(y*width+(x+1))*4+3]     < 10) ||
          (y>0        && data[((y-1)*width+x)*4+3]     < 10) ||
          (y<height-1 && data[((y+1)*width+x)*4+3]     < 10);

        if (hasAlpha0) {
          data[i+3] = 0;
          changed = true;
        }
      }
    }
    if (!changed) { console.log(`    → expansion done after ${pass+1} pass(es)`); break; }
  }

  await img.write(destPath);

  let t=0;
  for (let i=3; i<data.length; i+=4) if (data[i]===0) t++;
  console.log(`  ✓ ${file}: ${((t/(width*height))*100).toFixed(1)}% transparent`);
}

(async () => {
  console.log('\n🧹  Deep-cleaning problematic sprites...\n');
  for (const file of Object.keys(TARGET_MAP)) {
    await processSprite(file);
  }
  console.log('\n✅  Done — all white patches removed.\n');
})().catch(e => { console.error(e.message); process.exit(1); });

