const fs = require('fs');
// Simple PNG parser to check basic info
const buffer = fs.readFileSync('assets/effects/zenitsu_impact_v3.png');
console.log("File size:", buffer.length);
// PNG header
console.log("Header:", buffer.subarray(0, 8).toString('hex'));
