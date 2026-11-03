const fs=require('fs');
let s=fs.readFileSync('src/types.ts','utf8');
const i=s.indexOf("balloon-pop-jackpot': {", s.indexOf('export const PROJECTS'));
const j=s.indexOf("  },\n", i+50);
console.log(s.slice(i,j+3));