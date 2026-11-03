const fs=require('fs');
let s=fs.readFileSync('src/types.ts','utf8');

// Fix the stray quote in PROJECTS - handle mixed line endings
s=s.replace("  },\r\n  '\n  'candy-claw': {", "  },\r\n  'candy-claw': {");
s=s.replace("  },\r\n  '\r\n  'candy-claw': {", "  },\r\n  'candy-claw': {");

fs.writeFileSync('src/types.ts',s,'utf8');
console.log('Fixed stray quote');