const fs=require('fs');
const s=fs.readFileSync('src/types.ts','utf8');
const i=s.indexOf('export const CANDY_CLAW_PROMPT = `');
if(i>=0) {
  // Check the exact bytes around the declaration
  console.log('Declaration bytes:', Buffer.from(s.slice(i,i+50)).toString('hex'));
  // Find the closing backtick
  let inTemplate = false;
  for(let k=i; k<s.length; k++) {
    if(s.charCodeAt(k)===96 && (k===0 || s.charCodeAt(k-1)!==92)) {
      if(!inTemplate) {
        inTemplate = true;
        console.log('Opening backtick at:', k, 'char:', s[k]);
      } else {
        console.log('Closing backtick at:', k, 'char:', s[k]);
        console.log('After closing:', Buffer.from(s.slice(k,k+20)).toString('hex'));
        break;
      }
    }
  }
}