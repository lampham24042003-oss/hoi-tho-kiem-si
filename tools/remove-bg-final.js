/**
 * remove-bg-final.js  ─ 3-step hybrid removal
 *
 * Step 1: Flood-fill from image edges (catches connected background)
 * Step 2: Global pixel scan  ─ removes ANY lime-green pixel anywhere
 *          (catches "island" patches trapped inside character silhouette)
 * Step 3: Flood-fill from all transparent px (feathers new edges)
 *
 * Tuned heuristics:
 *   GREEN:   G > 180 AND B < 50 AND G/(R+1) > 1.5
 *     → Safe: Tanjiro haori G≈138 <180 ; Zenitsu lightning B≈60 >50
 *   MAGENTA: R > 140 AND G < 100 AND B > 80 AND R/G > 2.2
 *     → Safe: Nezuko pink G≈150 >100 ; skin G≈195 >100
 */

const path = require('path');
const fs   = require('fs');
const JimpPkg = require('jimp');
const J = JimpPkg.Jimp;

const BRAIN = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef';
const OUT   = path.join(__dirname, '..', 'assets', 'sprites');

// ── Sprite list ──────────────────────────────────────────────────────
// [srcFile, destFile, bgType]  bgType: 'green' | 'magenta'
const SPRITES = [
  // GREEN background (lime green, re-generated)
  ['tanjiro_idle_gr_1775760654926.png',   'tanjiro_idle.png',   'green'],
  ['tanjiro_jump_gr_1775760669545.png',   'tanjiro_jump.png',   'green'],
  ['tanjiro_crouch_gr_1775760683183.png', 'tanjiro_crouch.png', 'green'],
  ['zenitsu_jump_gr_1775760694835.png',   'zenitsu_jump.png',   'green'],
  ['zenitsu_crouch_gr_1775760707574.png', 'zenitsu_crouch.png', 'green'],
  ['inosuke_jump_gr_1775760721650.png',   'inosuke_jump.png',   'green'],
  ['inosuke_crouch_gr_1775760732695.png', 'inosuke_crouch.png', 'green'],
  // MAGENTA background (original batch ─ some still need cleanup)
  ['nezuko_idle_mg_1775755572009.png',    'nezuko_idle.png',    'magenta'],
  ['nezuko_jump_mg_1775755585491.png',    'nezuko_jump.png',    'magenta'],
  ['nezuko_crouch_mg_1775755600469.png',  'nezuko_crouch.png',  'magenta'],
  ['zenitsu_idle_mg_1775755712223.png',   'zenitsu_idle.png',   'magenta'],
  ['inosuke_idle_mg_1775755753115.png',   'inosuke_idle.png',   'magenta'],
];

// ── Helpers ──────────────────────────────────────────────────────────
function isBackgroundPixel(r, g, b, bgType) {
  if (bgType === 'green') {
    // Lime green: very high G, very low B, G clearly dominates R
    return g > 180 && b < 50 && g / (r + 1) > 1.5;
  } else {
    // Magenta/pink: high R, low G, moderate-high B
    return r > 140 && g < 100 && b > 80 && r / (g + 1) > 2.2;
  }
}

function floodFill(data, width, height, seedPixels, refR, refG, refB, tol, feather) {
  const visited = new Uint8Array(width * height);
  const queue   = new Int32Array(width * height * 2 + 32);
  let qHead = 0, qTail = 0;

  function enqueue(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const k = y * width + x;
    if (visited[k]) return;
    visited[k] = 1;
    queue[qTail++] = x;
    queue[qTail++] = y;
  }

  for (const [x, y] of seedPixels) enqueue(x, y);

  while (qHead < qTail) {
    const x = queue[qHead++], y = queue[qHead++];
    const idx = (y * width + x) * 4;
    const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];

    if (a === 0) {   // already transparent ─ keep spreading
      enqueue(x+1,y); enqueue(x-1,y); enqueue(x,y+1); enqueue(x,y-1);
      continue;
    }

    const dr = r-refR, dg = g-refG, db = b-refB;
    const dist = Math.sqrt(dr*dr + dg*dg + db*db);
    if (dist > tol) continue;

    data[idx+3] = dist < feather ? 0 : Math.round(((dist-feather)/(tol-feather))*255);
    enqueue(x+1,y); enqueue(x-1,y); enqueue(x,y+1); enqueue(x,y-1);
  }
}

// ── Main removal function ────────────────────────────────────────────
async function removeBg(srcFile, destFile, bgType) {
  const srcPath  = path.join(BRAIN, srcFile);
  const destPath = path.join(OUT, destFile);
  if (!fs.existsSync(srcPath)) { console.error('  ✗ Not found: ' + srcFile); return; }

  const img = await J.read(srcPath);
  const { width, height } = img.bitmap;
  const data = img.bitmap.data;
  const refR = data[0], refG = data[1], refB = data[2];

  // ── STEP 1: Flood-fill from all 4 edges ─────────────────────────
  const edgeSeeds = [];
  for (let x = 0; x < width; x++) {
    edgeSeeds.push([x, 0]); edgeSeeds.push([x, height-1]);
  }
  for (let y = 1; y < height-1; y++) {
    edgeSeeds.push([0, y]); edgeSeeds.push([width-1, y]);
  }
  floodFill(data, width, height, edgeSeeds, refR, refG, refB, 130, 60);

  // ── STEP 2: Global scan ─ remove any residual background px ─────
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] === 0) continue;   // already transparent
    const r = data[i], g = data[i+1], b = data[i+2];
    if (isBackgroundPixel(r, g, b, bgType)) {
      data[i+3] = 0;
    }
  }

  // ── STEP 3: Flood-fill from ALL transparent px ──────────────────
  // Seeds = every transparent pixel (expands cleanup to color edges)
  const t3seeds = [];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y*width+x)*4+3] === 0) t3seeds.push([x, y]);

  floodFill(data, width, height, t3seeds, refR, refG, refB, 100, 40);

  await img.write(destPath);

  let t = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] === 0) t++;
  const pct = ((t / (width * height)) * 100).toFixed(1);
  process.stdout.write('  ✓ ' + destFile.padEnd(24) + pct + '% transparent\n');
}

// ── Entry point ──────────────────────────────────────────────────────
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  console.log('\n🗡️  3-step hybrid BG removal (flood + global scan + expand)...\n');
  for (const [src, dest, type] of SPRITES) await removeBg(src, dest, type);
  console.log('\n✅ All sprites saved to assets/sprites/\n');
})().catch(err => { console.error('Lỗi:', err.message); process.exit(1); });
