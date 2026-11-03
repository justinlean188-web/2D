const fs=require('fs');
const s=fs.readFileSync('src/types.ts','utf8');
const i=s.indexOf('export const CANDY_CLAW_PROMPT = `');
if(i>=0) {
  // Find the closing backtick
  let depth = 0;
  let inTemplate = false;
  for(let k=i; k<s.length; k++) {
    if(s[k]==='`' && (k===0 || s[k-1]!=='\\')) {
      if(!inTemplate) {
        inTemplate = true;
      } else {
        // Found closing backtick
        console.log('Closing backtick at:', k);
        console.log('Context:', JSON.stringify(s.slice(k-10, k+30)));
        break;
      }
    }
  }
}