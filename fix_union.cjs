const fs=require('fs');
let s=fs.readFileSync('src/types.ts','utf8');
s=s.replace("| 'balloon-pop-jackpot'\r\n  | 'dart-shot'", "| 'balloon-pop-jackpot'\r\n  | 'candy-claw'\r\n  | 'dart-shot'");
fs.writeFileSync('src/types.ts', s, 'utf8');
console.log('done');