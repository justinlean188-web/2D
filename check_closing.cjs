const fs=require('fs');
const s=fs.readFileSync('src/types.ts','utf8');
const i=s.indexOf('CANDY_CLAW_PROMPT = `');
const j=s.indexOf('`;', i);
if(i>=0 && j>=0) {
  // Check the exact bytes around the closing backtick
  const closing = s.slice(j-10, j+10);
  console.log('Closing context:', JSON.stringify(closing));
  console.log('Closing bytes:', Buffer.from(closing).toString('hex'));
  
  // Check if the backtick is actually a different character
  const backtickChar = s[j];
  console.log('Backtick char:', backtickChar, 'code:', backtickChar.charCodeAt(0));
}