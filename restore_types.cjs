const {execSync} = require('child_process');
const fs = require('fs');
const s = execSync('git show HEAD:src/types.ts', {encoding: 'utf8'});
fs.writeFileSync('src/types.ts', s, 'utf8');
console.log('restored');
console.log('occurrences:', (s.match(/balloon-pop-jackpot/g) || []).length);