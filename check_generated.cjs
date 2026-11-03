const fs=require('fs');
const s=fs.readFileSync('src/types.ts','utf8');
const i=s.indexOf('export const CANDY_CLAW_PROMPT = `');
const j=s.indexOf('`;\r\n\r\nexport const CANDY_CLAW_SCENES');
if(i>=0 && j>=0) {
  const promptContent = s.slice(i+22, j);
  console.log('Prompt length:', promptContent.length);
  // Check for backticks
  const backticks = [];
  for(let k=0;k<promptContent.length;k++) if(promptContent.charCodeAt(k)===96) backticks.push(k);
  console.log('Backticks in prompt:', backticks.length);
  if(backticks.length>0) {
    backticks.forEach(pos => console.log('At',pos,':',JSON.stringify(promptContent.slice(Math.max(0,pos-30),pos+30))));
  }
  // Check closing
  console.log('After closing:', JSON.stringify(s.slice(j,j+50)));
} else {
  console.log('Not found with CRLF, trying LF');
  const j2=s.indexOf('`;\n\nexport const CANDY_CLAW_SCENES');
  if(j2>=0) {
    const promptContent = s.slice(i+22, j2);
    const backticks = [];
    for(let k=0;k<promptContent.length;k++) if(promptContent.charCodeAt(k)===96) backticks.push(k);
    console.log('Backticks in prompt (LF):', backticks.length);
    console.log('After closing:', JSON.stringify(s.slice(j2,j2+50)));
  }
}