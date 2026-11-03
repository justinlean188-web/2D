const fs=require('fs');
let s=fs.readFileSync('src/types.ts','utf8');

// 1. Add candy-claw to ProjectId union
s=s.replace("| 'domino-trickshot'\r\n  | 'balloon-pop-jackpot'\r\n  | 'dart-shot'","| 'domino-trickshot'\r\n  | 'balloon-pop-jackpot'\r\n  | 'candy-claw'\r\n  | 'dart-shot'");

// Read the constants from a file
const insert=fs.readFileSync('candy_constants.ts','utf8');

const idx=s.indexOf('];\r\n\r\nexport const PROJECTS: Record<ProjectId, ProjectDef> = {');
if(idx>=0){
  s=s.slice(0,idx+4)+'\r\n\r\n'+insert+'\r\n\r\n'+s.slice(idx+4);
}else{
  console.error('PROJECTS pattern not found');
  process.exit(1);
}

// 3. Add candy-claw to PROJECTS after balloon-pop-jackpot
const candyProject=`  'candy-claw': {
    id: 'candy-claw',
    title: 'Angry Stickman: The Candy Claw Disaster',
    subtitle: 'The 30-Second Neon Arcade Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: CANDY_CLAW_PROMPT,
    scenes: CANDY_CLAW_SCENES,
  },`;

const projIdx=s.indexOf("  'balloon-pop-jackpot': {\r\n    id: 'balloon-pop-jackpot',\r\n    title: 'Angry Stickman: The Balloon Pop Jackpot',\r\n    subtitle: 'The 30-Second Carnival Booth Comedy',\r\n    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',\r\n    duration: 30,\r\n    hasAudioDialogue: false,\r\n    hasCaptions: true,\r\n    masterPrompt: BALLOON_POP_PROMPT,\r\n    scenes: BALLOON_POP_SCENES,\r\n  },\r\n  'coin-flip': {");
if(projIdx>=0){
  s=s.slice(0,projIdx+3)+candyProject+"\r\n  'coin-flip': {";
}else{
  console.error('PROJECTS entry pattern not found');
  process.exit(1);
}

// 4. Update DEFAULT_CONFIG.activeProject
s=s.replace("activeProject: 'balloon-pop-jackpot', // The latest short is the default film","activeProject: 'candy-claw', // The latest short is the default film");

fs.writeFileSync('src/types.ts',s,'utf8');
console.log('done');