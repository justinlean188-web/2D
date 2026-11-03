const fs = require('fs');
let s = fs.readFileSync('src/types.ts', 'utf8');

// 1. Add candy-claw to ProjectId union
s = s.replace(
  "| 'domino-trickshot'\n  | 'balloon-pop-jackpot'\n  | 'dart-shot'",
  "| 'domino-trickshot'\n  | 'balloon-pop-jackpot'\n  | 'candy-claw'\n  | 'dart-shot'"
);

// 2. Read the constants from file
const constants = fs.readFileSync('candy_constants_final.ts', 'utf8');
const insert = constants + ';';

// Insert before PROJECTS - use LF pattern
const idx = s.indexOf('];\n\nexport const PROJECTS: Record<ProjectId, ProjectDef> = {');
if (idx >= 0) {
  s = s.slice(0, idx + 4) + '\n\n' + insert + '\n\n' + s.slice(idx + 4);
  console.log('Inserted constants');
} else {
  console.error('Pattern not found for PROJECTS insertion');
  process.exit(1);
}

// 3. Add candy-claw to PROJECTS after balloon-pop-jackpot
const candyProject = `
  'candy-claw': {
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

const projIdx = s.indexOf("  'balloon-pop-jackpot': {\n    id: 'balloon-pop-jackpot',\n    title: 'Angry Stickman: The Balloon Pop Jackpot',\n    subtitle: 'The 30-Second Carnival Booth Comedy',\n    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',\n    duration: 30,\n    hasAudioDialogue: false,\n    hasCaptions: true,\n    masterPrompt: BALLOON_POP_PROMPT,\n    scenes: BALLOON_POP_SCENES,\n  },\n  'coin-flip': {");
if (projIdx >= 0) {
  s = s.slice(0, projIdx + 3) + candyProject + "\n  'coin-flip': {";
  console.log('Added PROJECTS entry');
} else {
  console.error('Pattern not found for PROJECTS entry');
  process.exit(1);
}

// 4. Update DEFAULT_CONFIG.activeProject
s = s.replace(
  "activeProject: 'balloon-pop-jackpot', // The latest short is the default film",
  "activeProject: 'candy-claw', // The latest short is the default film"
);

fs.writeFileSync('src/types.ts', s, 'utf8');
console.log('All types.ts patches applied');