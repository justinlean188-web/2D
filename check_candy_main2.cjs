const fs=require('fs');
const s=fs.readFileSync('src/types.ts','utf8');
const i=s.indexOf('CANDY_CLAW_PROMPT = `');
const j=s.indexOf('`;\r\n\r\nexport const CANDY_CLAW_SCENES');
if(i>=0 && j>=0) {
  const promptContent = s.slice(i+22, j);
  console.log('CANDY_CLAW_PROMPT length:', promptContent.length);
  const backticks = [];
  for(let k=0;k<promptContent.length;k++) if(promptContent[k]==='`') backticks.push(k);
  console.log('Backticks in CANDY:', backticks);
  const crlf = promptContent.match(/\r\n/g);
  const lf = promptContent.match(/\n/g);
  console.log('CRLF count:', crlf ? crlf.length : 0);
  console.log('LF count:', lf ? lf.length : 0);
  console.log('Template properly closed:', s[j]==='`' && s[j+1]===';');
} else {
  console.log('Could not find CANDY boundaries with CRLF');
}