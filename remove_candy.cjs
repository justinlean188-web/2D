const fs=require('fs');
let s=fs.readFileSync('src/types.ts','utf8');

// Find and remove the CANDY_CLAW_PROMPT and CANDY_CLAW_SCENES blocks entirely
const startPrompt = s.indexOf('export const CANDY_CLAW_PROMPT = `');
const endScenes = s.indexOf('];', s.indexOf('export const CANDY_CLAW_SCENES'));
if(startPrompt>=0 && endScenes>=0) {
  const endBlock = s.indexOf('\n', endScenes) + 1;
  s = s.slice(0, startPrompt) + s.slice(endBlock);
  console.log('Removed CANDY_CLAW_PROMPT and CANDY_CLAW_SCENES blocks');
} else {
  console.log('Could not find blocks to remove');
}

// Also fix the PROJECTS entry to not reference them
s=s.replace('masterPrompt: CANDY_CLAW_PROMPT,', 'masterPrompt: "test",');
s=s.replace('scenes: CANDY_CLAW_SCENES,', 'scenes: [],');

fs.writeFileSync('src/types.nocandy.ts',s,'utf8');
console.log('Created nocandy test file');