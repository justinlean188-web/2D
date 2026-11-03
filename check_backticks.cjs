const fs=require('fs');
const s=fs.readFileSync('candy_constants_final.ts','utf8');
const backticks=[];
for(let i=0;i<s.length;i++)if(s[i]==='`')backticks.push(i);
console.log('Backtick positions:',backticks);
console.log('Count:',backticks.length);