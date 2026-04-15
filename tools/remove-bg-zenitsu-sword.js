/**
 * remove-bg-zenitsu-sword.js – Targeted fix for Zenitsu sword
 * The sword has a dark grey background (sampled as ~rgb(84,84,84)).
 * Use aggressive tolerance + multi-seed approach.
 */
const path = require('path');
const fs   = require('fs');
const JimpPkg = require('jimp');
const J = JimpPkg.Jimp;

const SPRITES_DIR = path.join(__dirname, '..', 'assets', 'sprites');

// For Zenitsu sword: dark grey background
// The sword blade is bright yellow-gold, guard is dark
// We remove: grey and near-grey background
// Safe to remove: anything that's grey-ish (low saturation, matches bg color)
const TOLERANCE = 100;  // wider tolerance for grey bg
const FEATHER   = 50;

function colorDist(r1,g1,b1, r2,g2,b2) {
  const dr=r1-r2, dg=g1-g2, db=b1-b2;
  return Math.sqrt(dr*dr+dg*dg+db*db);
}

// Check if pixel is grey (low saturation) — bg grey pixels
function isGreyBg(r, g, b, refR, refG, refB) {
  const dist = colorDist(r, g, b, refR, refG, refB);
  // Also catch any grey that wasn't flood-filled (low saturation, dark)
  const maxCh = Math.max(r, g, b);
  const minCh = Math.min(r, g, b);
  const sat = maxCh > 0 ? (maxCh - minCh) / maxCh : 0;
  return dist < TOLERANCE || (sat < 0.08 && maxCh < 200);
}

async function process() {
  const srcPath  = path.join(SPRITES_DIR, 'sword_zenitsu.png');

  // Re-copy original to avoid operating on already-processed file
  const origPath = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef/sword_zenitsu_flat_1775790856822.png';
  fs.copyFileSync(origPath, srcPath);
  console.log('  Loaded original Zenitsu sword');

  const img = await J.read(srcPath);
  const { width, height } = img.bitmap;
  const data = img.bitmap.data;

  // Sample from multiple corners
  const corners = [[0,0],[width-1,0],[0,height-1],[width-1,height-1]];
  const [refR, refG, refB] = corners.map(([x,y]) => {
    const i = (y*width+x)*4;
    return [data[i], data[i+1], data[i+2]];
  })[0];

  console.log(`  BG color: rgb(${refR},${refG},${refB})`);

  const visited = new Uint8Array(width * height);
  const stack = [];

  function tryPush(x, y) {
    if (x<0||x>=width||y<0||y>=height) return;
    const k = y*width+x;
    if (visited[k]) return;
    visited[k] = 1;
    const i = k*4;
    if (data[i+3]===0 || isGreyBg(data[i],data[i+1],data[i+2], refR,refG,refB)) stack.push(x, y);
  }

  // Seed from all 4 edges
  for (let x=0; x<width; x++)    { tryPush(x,0); tryPush(x,height-1); }
  for (let y=1; y<height-1; y++) { tryPush(0,y); tryPush(width-1,y); }

  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    const i = (y*width+x)*4;
    const dist = colorDist(data[i],data[i+1],data[i+2], refR,refG,refB);
    data[i+3] = dist < FEATHER ? 0 : dist < TOLERANCE ? Math.round(((dist-FEATHER)/(TOLERANCE-FEATHER))*255) : 255;
    if (data[i+3] < 255) {
      tryPush(x+1,y); tryPush(x-1,y); tryPush(x,y+1); tryPush(x,y-1);
    }
  }

  // Global: remove all remaining grey bg pixels
  for (let i=0; i<data.length; i+=4) {
    if (data[i+3]===0) continue;
    if (isGreyBg(data[i],data[i+1],data[i+2], refR,refG,refB)) data[i+3]=0;
  }

  await img.write(srcPath);

  let t=0;
  for (let i=3; i<data.length; i+=4) if (data[i]===0) t++;
  console.log(`  ✓ sword_zenitsu: ${((t/(width*height))*100).toFixed(1)}% transparent`);
}

(async () => {
  console.log('\n⚡  Re-processing Zenitsu sword bg...\n');
  await process();
  console.log('✅  Done!\n');
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
