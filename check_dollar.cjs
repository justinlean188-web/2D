const fs=require('fs');
const s=fs.readFileSync('candy_prompt_ascii.ts','utf8');
const i=s.indexOf('${');
console.log('${ found at:',i);
if(i>=0)console.log('Context:',JSON.stringify(s.slice(Math.max(0,i-20),i+20)));