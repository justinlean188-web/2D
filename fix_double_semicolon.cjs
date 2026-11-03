const fs=require('fs');
let s=fs.readFileSync('src/types.ts','utf8');

// Fix double semicolon after CANDY_CLAW_SCENES
s=s.replace('];;\r\n\r\n\r\nexport const PROJECTS', '];\r\n\r\nexport const PROJECTS');
s=s.replace('];;\n\n\nexport const PROJECTS', '];\n\nexport const PROJECTS');

fs.writeFileSync('src/types.ts',s,'utf8');
console.log('Fixed double semicolon');