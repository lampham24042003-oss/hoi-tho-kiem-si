/**
 * process-green-sprites.js
 * Xử lý 7 sprites nền XANH LÁ (#00ff00) → transparent PNG
 */
const path = require('path');
const fs   = require('fs');
const JimpPkg = require('jimp');
const J = JimpPkg.Jimp;

const BRAIN = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef';
const OUT   = path.join(__dirname, '..', 'assets', 'sprites');

// 7 sprites mới gen trên nền xanh lá
const SPRITES = [
  ['tanjiro_idle_gr_1775760654926.png',   'tanjiro_idle.png'],
  ['tanjiro_jump_gr_1775760669545.png',   'tanjiro_jump.png'],
  ['tanjiro_crouch_gr_1775760683183.png', 'tanjiro_crouch.png'],
  ['zenitsu_jump_gr_1775760694835.png',   'zenitsu_jump.png'],
  ['zenitsu_crouch_gr_1775760707574.png', 'zenitsu_crouch.png'],
  ['inosuke_jump_gr_1775760721650.png',   'inosuke_jump.png'],
  ['inosuke_crouch_gr_1775760732695.png', 'inosuke_crouch.png'],
];

function floodFill(data, width, height, seedPixels, refR, refG, refB, tol, feather) {
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
    const x = queue[qHead++], y = queue[qHead++];
    const idx = (y * width + x) * 4;
    const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
    if (a === 0) {
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

async function process(srcFile, destFile) {
  const srcPath  = path.join(BRAIN, srcFile);
  const destPath = path.join(OUT, destFile);
  if (!fs.existsSync(srcPath)) { console.error('  ✗ Not found: ' + srcFile); return; }

  const img = await J.read(srcPath);
  const { width, height } = img.bitmap;
  const data = img.bitmap.data;
  const refR = data[0], refG = data[1], refB = data[2];

  // Pass 1: edge flood-fill
  const edgeSeeds = [];
  for (let x = 0; x < width; x++) { edgeSeeds.push([x,0]); edgeSeeds.push([x,height-1]); }
  for (let y = 1; y < height-1; y++) { edgeSeeds.push([0,y]); edgeSeeds.push([width-1,y]); }
  floodFill(data, width, height, edgeSeeds, refR, refG, refB, 130, 60);

  // Pass 2: expand from all transparent pixels
  const t2seeds = [];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y*width+x)*4+3] === 0) t2seeds.push([x, y]);
  floodFill(data, width, height, t2seeds, refR, refG, refB, 110, 50);

  await img.write(destPath);
  let t = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] === 0) t++;
  const pct = ((t / (width*height)) * 100).toFixed(1);
  console.log('  ✓ ' + destFile.padEnd(24) + pct + '% transparent  (ref: rgb(' + refR + ',' + refG + ',' + refB + '))');
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  console.log('\n🌿 Processing green-bg sprites (2-pass)...\n');
  for (const [src, dest] of SPRITES) await process(src, dest);
  console.log('\n✅ Done — sprites updated in assets/sprites/\n');
})().catch(err => { console.error('Lỗi:', err.message); process.exit(1); });
