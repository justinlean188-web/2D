const fs=require('fs');
const s=fs.readFileSync('src/types.ts','utf8');
const i=s.indexOf('CANDY_CLAW_PROMPT = `');
const j=s.indexOf('`;\r\n\r\nexport const CANDY_CLAW_SCENES');
if(i>=0 && j>=0) {
  const promptContent = s.slice(i+22, j);
  const backticksInPrompt = [];
  for(let k=0;k<promptContent.length;k++) {
    if(promptContent[k]==='`') backticksInPrompt.push(k);
  }
  console.log('Backticks in prompt content:', backticksInPrompt);
  console.log('Prompt length:', promptContent.length);
  // Show context around any backticks
  backticksInPrompt.forEach(pos => {
    console.log('Context:', JSON.stringify(promptContent.slice(Math.max(0,pos-50), pos+50)));
  });
} else {
  console.log('Could not find template boundaries');
}