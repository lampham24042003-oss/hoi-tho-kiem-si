/**
 * remove-bg-v3.js
 * Hai pass flood-fill:
 *  1. Pass 1 (tolerance=120): xóa phần lớn background từ biên
 *  2. Pass 2 (tolerance=80, seed từ tất cả px đã transparent): lan tiếp
 *     ra những vùng background nhạt hơn còn sót
 * Không xóa pixel bên trong nhân vật đã bị kẹp giữa 2 vùng solid.
 */

const path = require('path');
const fs   = require('fs');
const JimpPkg = require('jimp');
const J = JimpPkg.Jimp;

const BRAIN = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef';
const OUT   = path.join(__dirname, '..', 'assets', 'sprites');

const SPRITES = [
  ['tanjiro_idle_mg_1775755531982.png',   'tanjiro_idle.png'],
  ['tanjiro_jump_mg_1775755545819.png',   'tanjiro_jump.png'],
  ['tanjiro_crouch_mg_1775755558616.png', 'tanjiro_crouch.png'],
  ['nezuko_idle_mg_1775755572009.png',    'nezuko_idle.png'],
  ['nezuko_jump_mg_1775755585491.png',    'nezuko_jump.png'],
  ['nezuko_crouch_mg_1775755600469.png',  'nezuko_crouch.png'],
  ['zenitsu_idle_mg_1775755712223.png',   'zenitsu_idle.png'],
  ['zenitsu_jump_mg_1775755727154.png',   'zenitsu_jump.png'],
  ['zenitsu_crouch_mg_1775755741206.png', 'zenitsu_crouch.png'],
  ['inosuke_idle_mg_1775755753115.png',   'inosuke_idle.png'],
  ['inosuke_jump_mg_1775755765129.png',   'inosuke_jump.png'],
  ['inosuke_crouch_mg_1775755777978.png', 'inosuke_crouch.png'],
];

// Flood-fill generic helper
function floodFill(data, width, height, seedPixels, refR, refG, refB, tolerance, feather) {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height * 2 + 32);
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
    const x = queue[qHead++];
    const y = queue[qHead++];
    const idx = (y * width + x) * 4;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    const a = data[idx+3];
    if (a === 0) { // already transparent — keep spreading
      enqueue(x+1,y); enqueue(x-1,y); enqueue(x,y+1); enqueue(x,y-1);
      continue;
    }
    const dr = r - refR, dg = g - refG, db = b - refB;
    const dist = Math.sqrt(dr*dr + dg*dg + db*db);
    if (dist > tolerance) continue;
    if (dist < feather) {
      data[idx+3] = 0;
    } else {
      const ratio = (dist - feather) / (tolerance - feather);
      data[idx+3] = Math.round(ratio * 255);
    }
    enqueue(x+1,y); enqueue(x-1,y); enqueue(x,y+1); enqueue(x,y-1);
  }
}

async function removeBg(srcFile, destFile) {
  const srcPath  = path.join(BRAIN, srcFile);
  const destPath = path.join(OUT, destFile);
  if (!fs.existsSync(srcPath)) { console.error('  ✗ Not found: ' + srcFile); return; }

  const img = await J.read(srcPath);
  const { width, height } = img.bitmap;
  const data = img.bitmap.data;

  // ── Ref color: từ pixel (0,0) ─────────────────────────────────
  const refR = data[0], refG = data[1], refB = data[2];

  // ── PASS 1: Flood từ 4 biên, tolerance cao (bắt bulk background) ──
  const edgeSeeds = [];
  for (let x = 0; x < width; x++) {
    edgeSeeds.push([x, 0]); edgeSeeds.push([x, height-1]);
  }
  for (let y = 1; y < height-1; y++) {
    edgeSeeds.push([0, y]); edgeSeeds.push([width-1, y]);
  }
  floodFill(data, width, height, edgeSeeds, refR, refG, refB, 130, 60);

  // ── PASS 2: Seed từ mọi pixel đã transparent, lan tiếp ────────
  // Bắt px background bị "miss" do transition tone
  const transparentSeeds = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx+3] === 0) transparentSeeds.push([x, y]);
    }
  }
  // Pass 2 dùng tolerance thấp hơn (conservative) để không xóa edge nhân vật
  floodFill(data, width, height, transparentSeeds, refR, refG, refB, 110, 50);

  await img.write(destPath);

  // Stats
  let t = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] === 0) t++;
  const pct = ((t / (width * height)) * 100).toFixed(1);
  console.log('  ✓ ' + destFile.padEnd(24) + pct + '% transparent');
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  console.log('\n🗡️  2-pass flood-fill BG removal...\n');
  for (const [src, dest] of SPRITES) await removeBg(src, dest);
  console.log('\n✅ Done — 12 sprites saved.\n');
}

main().catch(err => { console.error('Lỗi:', err.message); process.exit(1); });
