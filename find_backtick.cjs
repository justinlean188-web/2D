const fs=require('fs');
const s=fs.readFileSync('src/types.ts','utf8');
const i=s.indexOf('export const CANDY_CLAW_PROMPT = `');
const j=s.indexOf('`;\n\nexport const CANDY_CLAW_SCENES');
if(i>=0 && j>=0) {
  const promptContent = s.slice(i+22, j);
  // Find the backtick
  for(let k=0;k<promptContent.length;k++) {
    if(promptContent.charCodeAt(k)===96) {
      console.log('Backtick at:',k);
      console.log('Context:',JSON.stringify(promptContent.slice(Math.max(0,k-50),k+50)));
      break;
    }
  }
}