/**
 * remove-bg.js
 * Chroma-key removal: xóa nền magenta (#ff00ff) → PNG trong suốt thật sự
 * Usage: node tools/remove-bg.js
 */

const JimpPkg = require('jimp');
const Jimp = JimpPkg.Jimp;
const path = require('path');
const fs   = require('fs');

// ── Cấu hình chroma key ────────────────────────────────────────
const CHROMA = { r: 255, g: 0, b: 255 };  // #ff00ff magenta
const TOLERANCE = 80;   // khoảng cách màu tối đa để tính là "background"
const FEATHER    = 30;  // <= tolerance này thì fade alpha dần (anti-alias đẹp hơn)

const BRAIN = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef';
const OUT   = path.join(__dirname, '..', 'assets', 'sprites');

// [source filename in BRAIN dir, output filename in assets/sprites]
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

function colorDistance(r, g, b) {
  const dr = r - CHROMA.r;
  const dg = g - CHROMA.g;
  const db = b - CHROMA.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

async function removeBg(srcFile, destFile) {
  const srcPath  = path.join(BRAIN, srcFile);
  const destPath = path.join(OUT,   destFile);

  if (!fs.existsSync(srcPath)) {
    console.error(`  ✗ Not found: ${srcFile}`);
    return;
  }

  const img = await Jimp.read(srcPath);
  const { width, height } = img.bitmap;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = img.bitmap.data[idx + 0];
      const g = img.bitmap.data[idx + 1];
      const b = img.bitmap.data[idx + 2];
      const dist = colorDistance(r, g, b);
      if (dist < FEATHER) {
        img.bitmap.data[idx + 3] = 0;
      } else if (dist < TOLERANCE) {
        const ratio = (dist - FEATHER) / (TOLERANCE - FEATHER);
        img.bitmap.data[idx + 3] = Math.round(ratio * 255);
      }
    }
  }

  await img.write(destPath);
  console.log(`  ✓ ${destFile}`);
}

async function main() {
  // Đảm bảo thư mục output tồn tại
  fs.mkdirSync(OUT, { recursive: true });

  console.log('\n🗡️  Đang xóa nền magenta → PNG trong suốt...\n');

  for (const [src, dest] of SPRITES) {
    await removeBg(src, dest);
  }

  console.log('\n✅ Xong! 12 sprites đã được lưu vào assets/sprites/\n');
}

main().catch(err => {
  console.error('Lỗi:', err.message);
  process.exit(1);
});
