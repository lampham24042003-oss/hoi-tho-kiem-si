/**
 * remove-bg-smart.js  (v2)
 * Flood-fill background removal — multi-seed version.
 *
 * Cải tiến so với v1:
 *  • Không lấy trung bình màu corners — thay vào đó seed BFS từ TỪNG PIXEL
 *    trên toàn bộ 4 biên, kiểm tra mỗi pixel theo màu của chính nó với màu
 *    reference (góc (0,0) của ảnh gốc).
 *  • Tolerance cao hơn (120) để bắt được gradient nhẹ trên nền.
 *  • Vẫn an toàn — flood-fill CHỈ lan từ biên vào, không xóa vùng enclosed.
 */

const path = require('path');
const fs   = require('fs');

const JimpPkg = require('jimp');
const J = JimpPkg.Jimp;

// ── Cấu hình ─────────────────────────────────────────────────────────
const TOLERANCE = 120;   // pixel distance tối đa tính là background
const FEATHER   = 55;    // vùng fade alpha (anti-alias)

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

// ── Xử lý 1 ảnh ──────────────────────────────────────────────────────
async function removeBg(srcFile, destFile) {
  const srcPath  = path.join(BRAIN, srcFile);
  const destPath = path.join(OUT, destFile);

  if (!fs.existsSync(srcPath)) {
    console.error(`  ✗ Not found: ${srcFile}`);
    return;
  }

  const img = await J.read(srcPath);
  const { width, height } = img.bitmap;
  const data = img.bitmap.data;

  // ── Reference color: lấy từ pixel (0,0) — pixel góc trên-trái ────
  const bgR = data[0], bgG = data[1], bgB = data[2];

  // ── BFS setup ───────────────────────────────────────────────────────
  const visited = new Uint8Array(width * height);
  // Typed array queue: cặp [x, y] — max size = toàn bộ ảnh × 2
  const queue = new Int32Array(width * height * 2 + 8);
  let qHead = 0, qTail = 0;

  function enqueue(x, y) {
    const k = y * width + x;
    if (visited[k]) return;
    visited[k] = 1;
    queue[qTail++] = x;
    queue[qTail++] = y;
  }

  // Seed: toàn bộ 4 cạnh biên
  for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
  for (let y = 1; y < height - 1; y++) { enqueue(0, y); enqueue(width - 1, y); }

  // ── BFS flood-fill ──────────────────────────────────────────────────
  while (qHead < qTail) {
    const x = queue[qHead++];
    const y = queue[qHead++];

    const idx = (y * width + x) * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];

    // Distance tới màu reference (góc ảnh)
    const dr = r - bgR, dg = g - bgG, db = b - bgB;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist > TOLERANCE) continue; // pixel nhân vật → dừng lan

    // Pixel background → transparent (hoặc fade)
    if (dist < FEATHER) {
      data[idx + 3] = 0;
    } else {
      const ratio = (dist - FEATHER) / (TOLERANCE - FEATHER);
      data[idx + 3] = Math.round(ratio * 255);
    }

    // Lan sang 4 hướng
    if (x + 1 < width)  enqueue(x + 1, y);
    if (x - 1 >= 0)     enqueue(x - 1, y);
    if (y + 1 < height) enqueue(x, y + 1);
    if (y - 1 >= 0)     enqueue(x, y - 1);
  }

  await img.write(destPath);

  // Verify
  let t = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] === 0) t++;
  const pct = ((t / (width * height)) * 100).toFixed(1);
  console.log(`  ✓ ${destFile.padEnd(24)} ${pct}% transparent  (ref bg: rgb(${bgR},${bgG},${bgB}))`);
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  console.log('\n🗡️  Flood-fill BG removal v2 (tolerance=' + TOLERANCE + ')...\n');
  for (const [src, dest] of SPRITES) await removeBg(src, dest);
  console.log('\n✅ Xong — 12 sprites saved to assets/sprites/\n');
}

main().catch(err => { console.error('Lỗi:', err.message); process.exit(1); });
