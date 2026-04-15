const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

(async () => {
  const spriteDir = path.resolve(__dirname, '../assets/sprites');
  const testDir = path.resolve(__dirname, 'test');
  
  const processDir = async (dir) => {
      const file = path.join(dir, 'zenitsu_idle_attack.png');
      if (fs.existsSync(file)) {
          const image = await Jimp.read(file);
          image.flip({ horizontal: true, vertical: false });
          await image.write(file);
          console.log(`✅ Flipped: ${file}`);
      } else {
          console.log(`❌ Not found: ${file}`);
      }
  };

  await processDir(spriteDir);
  await processDir(testDir);
})();
