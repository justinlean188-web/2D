const fs=require('fs');
const s=fs.readFileSync('src/types.ts','utf8');
const i=s.indexOf('CANDY_CLAW_PROMPT = `');
const j=s.indexOf('`;', i);
if(i>=0 && j>=0) {
  const promptContent = s.slice(i+22, j);
  const backticks = [];
  for(let k=0;k<promptContent.length;k++) if(promptContent.charCodeAt(k)===96) backticks.push(k);
  console.log('Backticks in CANDY:', backticks.length);
  if(backticks.length>0) {
    backticks.forEach(pos => {
      console.log('At',pos,':',JSON.stringify(promptContent.slice(Math.max(0,pos-30),pos+30)));
    });
  }
  // Check for any non-ASCII chars that might cause issues
  const nonAscii = [];
  for(let k=0;k<promptContent.length;k++) {
    const c=promptContent.charCodeAt(k);
    if(c>127) nonAscii.push({pos:k, char:promptContent[k], code:c});
  }
  console.log('Non-ASCII chars:', nonAscii.length);
  nonAscii.slice(0,20).forEach(x => console.log('At',x.pos,':',x.char,'(',x.code,')'));
}