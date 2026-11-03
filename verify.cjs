const fs=require('fs');
const s=fs.readFileSync('src/types.ts','utf8');
console.log('candy-claw in ProjectId:', s.includes("candy-claw"));
console.log('CANDY_CLAW_PROMPT:', s.includes('CANDY_CLAW_PROMPT'));
console.log('CANDY_CLAW_SCENES:', s.includes('CANDY_CLAW_SCENES'));
console.log('activeProject candy-claw:', s.includes("activeProject: 'candy-claw'"));
console.log('import from constants:', s.includes("candyClawConstants"));