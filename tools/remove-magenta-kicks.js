const JimpPkg = require('jimp');
const Jimp = JimpPkg.Jimp;
const path = require('path');
const fs   = require('fs');

const CHROMA = { r: 255, g: 0, b: 255 };
const TOLERANCE = 80;
const FEATHER    = 30;

const BRAIN = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef';
const OUT   = path.join(__dirname, '..', 'assets', 'sprites');

const SPRITES = [
  ['mg_tanjiro_kick_1775873073342.png', 'tanjiro_kick.png'],
  ['mg_tanjiro_jump_kick_1775873101925.png', 'tanjiro_jump_kick.png'],
  ['mg_tanjiro_crouch_kick_1775873117332.png', 'tanjiro_crouch_kick.png'],
  ['mg_nezuko_kick_1775873156413.png', 'nezuko_kick.png'],
  ['mg_nezuko_jump_kick_1775873169893.png', 'nezuko_jump_kick.png'],
  ['mg_nezuko_crouch_kick_1775873183227.png', 'nezuko_crouch_kick.png'],
  ['mg_zenitsu_kick_1775873221244.png', 'zenitsu_kick.png'],
  ['mg_zenitsu_jump_kick_1775873236859.png', 'zenitsu_jump_kick.png'],
  ['mg_zenitsu_crouch_kick_1775873250724.png', 'zenitsu_crouch_kick.png'],
  ['mg_inosuke_kick_1775873287199.png', 'inosuke_kick.png'],
  ['mg_inosuke_jump_kick_1775873302710.png', 'inosuke_jump_kick.png'],
  ['mg_inosuke_crouch_kick_1775873317300.png', 'inosuke_crouch_kick.png'],
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
  console.log(`  ✓ processed: ${destFile}`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  console.log('Running magenta chroma key on kicks...');
  for (const [src, dest] of SPRITES) {
    await removeBg(src, dest);
  }
  console.log('Done.');
}

main().catch(err => console.error(err));
