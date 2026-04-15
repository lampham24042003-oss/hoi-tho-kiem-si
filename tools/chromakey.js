const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const BRAIN_DIR = '/Users/lap60488/.gemini/antigravity/brain/5faef06b-635b-4e2b-9213-c45ede334aef';
const OUT_DIR = '/Users/lap60488/Downloads/game aaa/assets/sprites';

const fileMap = {
  // Tanjiro & Inosuke -> Magenta (#ff00ff)
  'chroma_tanjiro_kick': { file: 'tanjiro_kick.png', bg: [255, 0, 255], type: 'magenta' },
  'chroma_tanjiro_jump_kick': { file: 'tanjiro_jump_kick.png', bg: [255, 0, 255], type: 'magenta' },
  'chroma_tanjiro_crouch_kick': { file: 'tanjiro_crouch_kick.png', bg: [255, 0, 255], type: 'magenta' },
  'chroma_inosuke_kick': { file: 'inosuke_kick.png', bg: [255, 0, 255], type: 'magenta' },
  'chroma_inosuke_jump_kick': { file: 'inosuke_jump_kick.png', bg: [255, 0, 255], type: 'magenta' },
  'chroma_inosuke_crouch_kick': { file: 'inosuke_crouch_kick.png', bg: [255, 0, 255], type: 'magenta' },
  // Zenitsu -> Solid Blue (#0000ff)
  'chroma_zenitsu_kick': { file: 'zenitsu_kick.png', bg: [0, 0, 255], type: 'blue' },
  'chroma_zenitsu_jump_kick': { file: 'zenitsu_jump_kick.png', bg: [0, 0, 255], type: 'blue' },
  'chroma_zenitsu_crouch_kick': { file: 'zenitsu_crouch_kick.png', bg: [0, 0, 255], type: 'blue' },
  // Nezuko -> Cyan (#00ffff)
  'chroma_nezuko_kick': { file: 'nezuko_kick.png', bg: [0, 255, 255], type: 'cyan' },
  'chroma_nezuko_jump_kick': { file: 'nezuko_jump_kick.png', bg: [0, 255, 255], type: 'cyan' },
  'chroma_nezuko_crouch_kick': { file: 'nezuko_crouch_kick.png', bg: [0, 255, 255], type: 'cyan' }
};

function colorDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt(Math.pow(r1-r2, 2) + Math.pow(g1-g2, 2) + Math.pow(b1-b2, 2));
}

// Flood fill is queue-based to prevent stack overflow
async function processImage(inName, info) {
    const files = fs.readdirSync(BRAIN_DIR);
    const actualFile = files.find(f => f.startsWith(inName) && f.endsWith('.png'));
    if (!actualFile) {
        console.log("Missing:", inName);
        return;
    }
    const src = path.join(BRAIN_DIR, actualFile);
    const dest = path.join(OUT_DIR, info.file);
    const targetBg = info.bg;
    const type = info.type;
    
    const image = await Jimp.read(src);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // Step 1: Flood Fill the background
    const visited = new Uint8Array(width * height);
    const queue = [];
    
    // Start from multiple points on the boundaries
    for (let x=0; x<width; x++) { queue.push([x,0]); queue.push([x,height-1]); }
    for (let y=0; y<height; y++) { queue.push([0,y]); queue.push([width-1,y]); }
    
    for (let point of queue) {
        visited[point[1] * width + point[0]] = 1;
    }
    
    let head = 0;
    while(head < queue.length) {
        const [x, y] = queue[head++];
        
        const idx = (width * y + x) << 2;
        const r = image.bitmap.data[idx + 0];
        const g = image.bitmap.data[idx + 1];
        const b = image.bitmap.data[idx + 2];
        
        const dist = colorDistance(r, g, b, targetBg[0], targetBg[1], targetBg[2]);
        
        // Strict tolerance for background deletion to not chew into characters
        if (dist < 40) {
            image.bitmap.data[idx + 3] = 0; // Set transparent
            
            const neighbors = [[x-1,y], [x+1,y], [x,y-1], [x,y+1]];
            for (let [nx, ny] of neighbors) {
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    if (visited[ny * width + nx] === 0) {
                        visited[ny * width + nx] = 1;
                        queue.push([nx, ny]);
                    }
                }
            }
        }
    }
    
    // Step 2: Cinematic Chroma Despill
    const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (width * y + x) << 2;
            const a = image.bitmap.data[idx + 3];
            
            if (a > 0) {
                // Check if it's an edge pixel
                let isEdge = false;
                for (let [dx, dy] of dirs) {
                    const nIdx = (width * (y + dy) + (x + dx)) << 2;
                    if (image.bitmap.data[nIdx + 3] === 0) {
                        isEdge = true;
                        break;
                    }
                }
                
                if (isEdge) {
                    let r = image.bitmap.data[idx + 0];
                    let g = image.bitmap.data[idx + 1];
                    let b = image.bitmap.data[idx + 2];
                    
                    // Cinematic Protection Logic:
                    // Only despill if the opposing channel is dark (proving it's a black outline, not vibrant skin)
                    if (type === 'magenta') {
                        if (g < 100) { // Black outline has low Green
                            r = Math.min(r, g);
                            b = Math.min(b, g);
                        }
                    } else if (type === 'cyan') {
                        if (r < 100) { // Black outline has low Red
                            g = Math.min(g, r);
                            b = Math.min(b, r);
                        }
                    } else if (type === 'blue') {
                        const opp = Math.max(r, g);
                        if (opp < 100) { // Black outline has low Red and Green
                            b = Math.min(b, opp);
                        }
                    }
                    
                    // Smooth the alpha slightly based on color distance to background to feather the edge
                    const dist = colorDistance(r, g, b, targetBg[0], targetBg[1], targetBg[2]);
                    if (dist < 150) {
                        image.bitmap.data[idx + 3] = Math.max(0, Math.min(255, dist));
                    }
                    
                    image.bitmap.data[idx + 0] = r;
                    image.bitmap.data[idx + 1] = g;
                    image.bitmap.data[idx + 2] = b;
                }
            }
        }
    }
    
    await image.writeAsync(dest);
    console.log(`✓ Cinematic Key: ${info.file}`);
}

async function run() {
    console.log("Starting Cinematic Chroma Key extraction...");
    for (const [inName, info] of Object.entries(fileMap)) {
        await processImage(inName, info);
    }
    console.log("Completed!");
}
run();
