const fs=require('fs');
const s=fs.readFileSync('src/types.ts','utf8');
const i=s.indexOf("'candy-claw': {", s.indexOf('export const PROJECTS'));
console.log(JSON.stringify(s.slice(i-100,i+500)));