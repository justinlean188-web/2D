const fs=require('fs');
const s=fs.readFileSync('src/types.ts','utf8');
const i=s.indexOf('ARCADE_CLAW_PROMPT = `');
const j=s.indexOf('`;\r\n\r\nexport const ARCADE_CLAW_SCENES');
if(i>=0 && j>=0) {
  const promptContent = s.slice(i+22, j);
  console.log('ARCADE_CLAW_PROMPT length:', promptContent.length);
  // Check for backticks
  const backticks = [];
  for(let k=0;k<promptContent.length;k++) if(promptContent[k]==='`') backticks.push(k);
  console.log('Backticks in ARCADE:', backticks);
  // Check line endings
  const crlf = promptContent.match(/\r\n/g);
  const lf = promptContent.match(/\n/g);
  console.log('CRLF count:', crlf ? crlf.length : 0);
  console.log('LF count:', lf ? lf.length : 0);
} else {
  console.log('Could not find ARCADE boundaries');
}