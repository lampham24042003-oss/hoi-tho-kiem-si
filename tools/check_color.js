const { Jimp } = require('jimp');
(async () => {
    const raw = await Jimp.read('/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef/darkbg_inosuke_idle.png');
    console.log("Sampling center 10x10 of DARKBG INOSUKE:");
    for(let i=0; i<10; i++){
        const x = 512 + i*15;
        const y = 512 + i*15;
        const hex = raw.getPixelColor(x, y);
        const r = (hex >>> 24) & 0xFF;
        const g = (hex >>> 16) & 0xFF;
        const b = (hex >>> 8) & 0xFF;
        console.log(`[x:${x}, y:${y}] - R:${r} G:${g} B:${b}`);
    }
})();
