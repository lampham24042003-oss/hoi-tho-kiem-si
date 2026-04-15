const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const TEST_DIR = path.resolve(__dirname, 'test');
const SPRITES_DIR = path.resolve(__dirname, '../assets/sprites');

const items = [
  { prefix: 'vfx_tanjiro', type: 'magenta' },
  { prefix: 'vfx_nezuko', type: 'cyan' },
  { prefix: 'vfx_zenitsu', type: 'blue' },
  { prefix: 'vfx_inosuke', type: 'magenta' }
];

(async () => {
    if (!fs.existsSync(SPRITES_DIR)) {
        fs.mkdirSync(SPRITES_DIR, { recursive: true });
    }
    
    const allFiles = fs.readdirSync(TEST_DIR).filter(f => f.endsWith('.png'));
    
    for (const file of allFiles) {
        let type = null;
        for (const item of items) {
            if (file.startsWith(item.prefix)) {
                type = item.type;
                break;
            }
        }
        
        if (!type) continue; // Skip unknown files
        
        const srcPath = path.join(TEST_DIR, file);
        const dstPath = path.join(SPRITES_DIR, file);
        
        try {
            const image = await Jimp.read(srcPath);
            const data = image.bitmap.data;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                let alpha = 255;
                
                if (type === 'magenta') {
                    let maxMag = Math.min(r, b);
                    let diff = maxMag - g;
                    
                    if (diff > 50) { 
                        alpha = Math.max(0, 255 - maxMag);
                        data[i] = g;   
                        data[i+2] = g; 
                    } else if (diff > 20) {
                        alpha = 255;
                        data[i] = Math.min(r, g + 20);
                        data[i+2] = Math.min(b, g + 20);
                    }
                } 
                else if (type === 'cyan') {
                    let maxCy = Math.min(g, b);
                    let diff = maxCy - r;
                    if (diff > 50) {
                        alpha = Math.max(0, 255 - maxCy);
                        data[i+1] = r;
                        data[i+2] = r;
                    } else if (diff > 20) {
                        data[i+1] = Math.min(g, r + 20);
                        data[i+2] = Math.min(b, r + 20);
                    }
                }
                else if (type === 'blue') {
                    let maxBG = Math.max(r, g);
                    let diff = b - maxBG;
                    if (diff > 50) {
                        alpha = Math.max(0, 255 - b);
                        data[i] = maxBG;
                        data[i+1] = maxBG;
                        data[i+2] = maxBG; // Drop blue slightly too for outline preservation
                    } else if (diff > 20) {
                        data[i+2] = Math.min(b, maxBG + 20);
                    }
                }
                
                if (alpha < 10) alpha = 0;
                data[i+3] = alpha;
            }
            
            await image.write(dstPath);
            console.log(`✅ Chroma keyed: ${file}`);
            
        } catch(e) {
            console.log(`❌ Error processing ${file}: ${e.message}`);
        }
    }
})();
