/**
 * remove-bg-swords.js – Remove background from sword images
 * Samples the top-left corner pixel as background reference,
 * then flood-fills + expands, using distance-based tolerance.
 */
const path = require('path');
const fs   = require('fs');
const JimpPkg = require('jimp');
const J = JimpPkg.Jimp;

const SPRITES_DIR = path.join(__dirname, '..', 'assets', 'sprites');
const SWORDS = ['sword_tanjiro', 'sword_nezuko', 'sword_zenitsu', 'sword_inosuke'];

// Tolerance: how far from the bg color a pixel can be and still be removed
const TOLERANCE  = 80;   // catch light grey/near-white around bg
const FEATHER    = 40;   // below this distance → fully transparent

function colorDist(r1, g1, b1, r2, g2, b2) {
  const dr = r1-r2, dg = g1-g2, db = b1-b2;
  return Math.sqrt(dr*dr + dg*dg + db*db);
}

async function process(name) {
  const p = path.join(SPRITES_DIR, `${name}.png`);
  if (!fs.existsSync(p)) { console.log(`  ✗ Not found: ${name}.png`); return; }

  const img = await J.read(p);
  const { width, height } = img.bitmap;
  const data = img.bitmap.data; // RGBA flat Uint8Array

  // Sample background color from all 4 corners, pick closest cluster
  const corners = [[0,0],[width-1,0],[0,height-1],[width-1,height-1]];
  const cornerColors = corners.map(([x,y]) => {
    const i = (y * width + x) * 4;
    return [data[i], data[i+1], data[i+2]];
  });
  // Use top-left corner as primary bg reference
  const [refR, refG, refB] = cornerColors[0];
  console.log(`  BG color for ${name}: rgb(${refR},${refG},${refB})`);

  function isBg(r, g, b) {
    return colorDist(r, g, b, refR, refG, refB) < TOLERANCE;
  }

  const visited = new Uint8Array(width * height);
  const stack   = [];

  function tryPush(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const k = y * width + x;
    if (visited[k]) return;
    visited[k] = 1;
    const i = k * 4;
    if (data[i+3] === 0 || isBg(data[i], data[i+1], data[i+2])) {
      stack.push(x, y);
    }
  }

  // ── Step 1: Flood-fill from all 4 edges ──────────────────────────
  for (let x = 0; x < width; x++)   { tryPush(x, 0); tryPush(x, height-1); }
  for (let y = 1; y < height-1; y++) { tryPush(0, y); tryPush(width-1, y); }

  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    const i = (y * width + x) * 4;
    const r = data[i], g = data[i+1], b = data[i+2];
    const dist = colorDist(r, g, b, refR, refG, refB);
    if (FEATHER > 0 && dist < FEATHER) {
      data[i+3] = 0;
    } else if (dist < TOLERANCE) {
      data[i+3] = Math.round(((dist - FEATHER) / (TOLERANCE - FEATHER)) * 255);
    }
    tryPush(x+1,y); tryPush(x-1,y); tryPush(x,y+1); tryPush(x,y-1);
  }

  // ── Step 2: Global scan – any stray bg pixels anywhere ───────────
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] === 0) continue;
    if (isBg(data[i], data[i+1], data[i+2])) data[i+3] = 0;
  }

  // ── Step 3: Feather – expand transparency to near-bg adjacent pixels
  const toZero = [];
  for (let y = 1; y < height-1; y++) {
    for (let x = 1; x < width-1; x++) {
      const i = (y * width + x) * 4;
      if (data[i+3] === 0) continue;
      const nbrs = [(y*width+(x+1))*4, (y*width+(x-1))*4, ((y+1)*width+x)*4, ((y-1)*width+x)*4];
      if (nbrs.some(ni => data[ni+3] === 0)) {
        const dist = colorDist(data[i], data[i+1], data[i+2], refR, refG, refB);
        if (dist < TOLERANCE * 0.75) toZero.push(i);
      }
    }
  }
  for (const i of toZero) data[i+3] = 0;

  await img.write(p); // save as transparent PNG

  let transparent = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] === 0) transparent++;
  console.log(`  ✓ ${name}: ${((transparent/(width*height))*100).toFixed(1)}% transparent\n`);
}

(async () => {
  console.log('\n🗡️  Removing sword backgrounds (corner-sample mode)...\n');
  for (const s of SWORDS) await process(s);
  console.log('✅ Done! Swords saved to assets/sprites/\n');
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
