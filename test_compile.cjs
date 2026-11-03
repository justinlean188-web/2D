const fs=require('fs');
let s=fs.readFileSync('src/types.ts','utf8');

// Comment out the CANDY_CLAW_PROMPT and CANDY_CLAW_SCENES
s=s.replace('export const CANDY_CLAW_PROMPT =', '// export const CANDY_CLAW_PROMPT =');
s=s.replace('export const CANDY_CLAW_SCENES:', '// export const CANDY_CLAW_SCENES:');
s=s.replace('masterPrompt: CANDY_CLAW_PROMPT,', 'masterPrompt: "test",');
s=s.replace('scenes: CANDY_CLAW_SCENES,', 'scenes: [],');

fs.writeFileSync('src/types.test.ts',s,'utf8');
console.log('Created test file');