const fs=require('fs');
const s=fs.readFileSync('src/types.ts','utf8');
const i=s.indexOf('ARCADE_CLAW_PROMPT = `');
const j=s.indexOf('`;', i);
if(i>=0 && j>=0) {
  const promptContent = s.slice(i+22, j);
  const nonAscii = [];
  for(let k=0;k<promptContent.length;k++) {
    const c=promptContent.charCodeAt(k);
    if(c>127) nonAscii.push({pos:k, char:promptContent[k], code:c});
  }
  console.log('ARCADE Non-ASCII chars:', nonAscii.length);
  nonAscii.slice(0,20).forEach(x => console.log('At',x.pos,':',x.char,'(',x.code,')'));
}