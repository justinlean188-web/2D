const fs=require('fs');
const s=fs.readFileSync('src/types.ts','utf8');
const i=s.indexOf('ARCADE_CLAW_PROMPT = `');
const j=s.indexOf('`;\r\n\r\nexport const ARCADE_CLAW_SCENES');
if(i>=0 && j>=0){
  const c=s.slice(i+22,j);
  console.log('Has ...:', c.includes('...'));
  console.log('Has ${:', c.includes('${'));
}