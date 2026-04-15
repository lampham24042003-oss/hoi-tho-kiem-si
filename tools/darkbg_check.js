const fs = require('fs');
const { Jimp } = require('jimp');

const BRAIN = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef';
const TEST  = '/Users/lap60488/Downloads/game aaa/assets/sprites/test';

(async()=>{
  const files = fs.readdirSync(TEST).filter(f => f.endsWith('.png') && !f.startsWith('.'));
  for(const file of files){
    const sprite = await Jimp.read(`${TEST}/${file}`);
    const W=sprite.bitmap.width, H=sprite.bitmap.height;
    
    // Create new dark background using Jimp buffer manipulation
    const bg = new Jimp({width:W,height:H});
    const bd = bg.bitmap.data;
    
    // Fill first with dark blue #1a1a2eff
    for(let i=0; i<bd.length; i+=4){
        bd[i] = 0x1a; bd[i+1] = 0x1a; bd[i+2] = 0x2e; bd[i+3] = 0xff;
    }
    
    const sd=sprite.bitmap.data;
    for(let i=0;i<sd.length;i+=4){
      const a=sd[i+3]/255;
      if (a > 0) {
          bd[i]  =Math.round(sd[i]*a  +bd[i]*(1-a));
          bd[i+1]=Math.round(sd[i+1]*a+bd[i+1]*(1-a));
          bd[i+2]=Math.round(sd[i+2]*a+bd[i+2]*(1-a));
          bd[i+3]=255;
      }
    }
    bg.bitmap.data = Buffer.from(bd);
    await bg.write(`${BRAIN}/darkbg_${file}`);
    console.log(`✓ ${file}`);
  }
  console.log('Done');
})().catch(e=>{console.error(e.message);process.exit(1);});
