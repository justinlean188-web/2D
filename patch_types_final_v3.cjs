const fs = require('fs');
let s = fs.readFileSync('src/types.ts', 'utf8');

// 1. Add candy-claw to ProjectId union
s = s.replace(
  "| 'domino-trickshot'\r\n  | 'balloon-pop-jackpot'\r\n  | 'dart-shot'",
  "| 'domino-trickshot'\r\n  | 'balloon-pop-jackpot'\r\n  | 'candy-claw'\r\n  | 'dart-shot'"
);

// 2. Add import for candy-claw constants
const importIdx = s.indexOf("export type CanvasTheme = 'black-on-white' | 'white-on-black';");
if (importIdx >= 0) {
  const insert = `import { CANDY_CLAW_PROMPT, CANDY_CLAW_SCENES } from './constants/candyClawConstants';\r\n`;
  s = s.slice(0, importIdx) + insert + s.slice(importIdx);
  console.log('Added import');
} else {
  console.error('Could not find import location');
  process.exit(1);
}

// 2. Add candy-claw to PROJECTS after balloon-pop-jackpot
// Find the end of balloon-pop-jackpot entry (after its `},`)
const searchStr = "  'balloon-pop-jackpot': {\r\n    id: 'balloon-pop-jackpot',\r\n    title: 'Angry Stickman: The Balloon Pop Jackpot',\r\n    subtitle: 'The 30-Second Carnival Booth Comedy',\r\n    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',\r\n    duration: 30,\r\n    hasAudioDialogue: false,\r\n    hasCaptions: true,\r\n    masterPrompt: BALLOON_POP_PROMPT,\r\n    scenes: BALLOON_POP_SCENES,\r\n  },\r\n";
const projIdx = s.indexOf(searchStr);
if (projIdx >= 0) {
  const insertPos = projIdx + searchStr.length;
  const candyProject = `  'candy-claw': {\r\n    id: 'candy-claw',\r\n    title: 'Angry Stickman: The Candy Claw Disaster',\r\n    subtitle: 'The 30-Second Neon Arcade Comedy',\r\n    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',\r\n    duration: 30,\r\n    hasAudioDialogue: false,\r\n    hasCaptions: true,\r\n    masterPrompt: CANDY_CLAW_PROMPT,\r\n    scenes: CANDY_CLAW_SCENES,\r\n  },\r\n`;
  s = s.slice(0, insertPos) + candyProject + s.slice(insertPos);
  console.log('Added PROJECTS entry');
} else {
  console.error('Pattern not found for PROJECTS entry');
  process.exit(1);
}

// 3. Update DEFAULT_CONFIG.activeProject
s = s.replace(
  "activeProject: 'balloon-pop-jackpot', // The latest short is the default film",
  "activeProject: 'candy-claw', // The latest short is the default film"
);

fs.writeFileSync('src/types.ts', s, 'utf8');
console.log('All types.ts patches applied');