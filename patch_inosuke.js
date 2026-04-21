const fs = require('fs');
let content = fs.readFileSync('js/inosuke.js', 'utf8');

content = content.replace(
  /_drawCharacterSprite\(ctx, cx, cy, scale\) {([\s\S]*?)super._drawCharacterSprite\(ctx, cx, cy \+ offsetY, scale\);\n  }/g,
  `_drawCharacterSprite(ctx, cx, cy, scale) {
    let offsetY = 0;
    let customScale = scale;
    const currentSprite = this._getCurrentSprite();
    
    // V4 Image AI Generation adjustments: 
    if (currentSprite === this.sprites.run1 || currentSprite === this.sprites.run2) {
      offsetY = this.h * 0.08; // Run slightly floating, push down
    } 
    // ALL crouching/dodging sprites are drawn zoomed-in (occupying full 1024h without empty space).
    // We must shrink them down so he doesn't look like a giant (quá cao), 
    // and shift them so feet touch the ground, NOT sinking into it.
    else if (this.isCrouching || this.isDodging) {
      customScale *= 0.75; // Shrink to 75% size
      offsetY = this.h * ((1 - 0.75) / 2); // Shift down to align feet to ground
    }
    // Exhaust pose
    else if (currentSprite === this.sprites.exhaust_pose) {
      offsetY = this.h * 0.40; // Flat on floor
    }

    super._drawCharacterSprite(ctx, cx, cy + offsetY, customScale);
  }`
);

fs.writeFileSync('js/inosuke.js', content);
console.log("Patched!");
