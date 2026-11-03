import fs from 'node:fs';

let s = fs.readFileSync('src/types.ts', 'utf8');

// 1. Add candy-claw to ProjectId union
s = s.replace(
  "| 'domino-trickshot'\r\n  | 'balloon-pop-jackpot'\r\n  | 'dart-shot'",
  "| 'domino-trickshot'\r\n  | 'balloon-pop-jackpot'\r\n  | 'candy-claw'\r\n  | 'dart-shot'"
);

// 2. Insert CANDY_CLAW_PROMPT and CANDY_CLAW_SCENES before PROJECTS
// Using a function to avoid template literal issues
const prompt = `THE CANDY CLAW DISASTER — 30-SECOND AI VIDEO PROMPT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080×1920, 30fps.

VISUAL STYLE:
Modern Pop flat 2D vector cartoon. Thick consistent black outlines, simple geometric shapes, smooth readable movements, exaggerated facial expressions, bright solid colors. A neon carnival arcade with a giant colorful candy claw machine. Rainbow LED lights, glowing decorations, candy-cane pillars. No gradients, no textures, no watermark, no logo.

CHARACTER (LOCKED):
Round white head, two small black oval eyes, thick black eyebrows, simple black mouth, yellow short-sleeved shirt, blue trousers, black shoes, red beanie with a red pompom, thin black limbs and black mitten hands.

SHOT 1 (0-6s) — THE GIANT CANDY PRIZE:
Wide view of a giant colorful claw machine. Inside: hundreds of colorful sweets. A gigantic rainbow lollipop stands upright in the middle. The angry stickman approaches, points at it with excitement, clenches his fist, and inserts a game token. The machine lights up. Caption: "CAN HE WIN THE GIANT LOLLIPOP?"

SHOT 2 (6-12s) — THE FIRST GRAB:
He operates the joystick, moves the claw above a large pink candy, presses the red button. The three-pronged claw descends, opens, and closes around the pink candy. It lifts slowly, but just before reaching the top, the candy slips from the claw and falls back. He stares with a furious expression. Caption: "SO CLOSE... BUT NO CANDY!"

SHOT 3 (12-18s) — THE PERFECT GRAB:
He takes a deep breath, carefully moves the joystick. The claw travels horizontally above the giant rainbow lollipop, stops over its stick, descends, opens, and closes securely around the stick. It lifts the entire giant lollipop out of the pile. He jumps excitedly and raises both arms. Caption: "HE GOT THE BIG ONE!"

SHOT 4 (18-24s) — CANDY OVERLOAD:
The claw moves toward the collection area holding the lollipop. Suddenly the machine shakes. A hidden bottom dispenser opens. Hundreds of colorful sweets pour out through the front prize chute. The candy pile grows across the floor. He turns toward the chute, shocked, and tries to step backward. Caption: "WHY IS EVERYTHING FALLING?!"

SHOT 5 (24-30s) — BURIED IN CANDY:
One final enormous avalanche of sweets. Candies spill across the floor and surround him. He tries to run but gets buried under the soft candy pile. Only his round white head and red beanie remain visible. The giant rainbow lollipop falls gently from the claw and lands upright on top of his red beanie. He slowly looks up at the lollipop, then turns to the camera with an extremely angry stare. Brief comedic freeze-frame. Caption: "HE WON... TOO MUCH CANDY!"

SOUND:
Energetic arcade chiptune score plus procedural SFX only. Joystick movement, claw motor whirs, candy drops, machine beeps, avalanche rumbles, victory fanfare, final comedic sting. No dialogue, no narration, no voice-over.`;

const scenes = `[
  {
    id: 1,
    name: "Shot 1",
    title: "The Giant Candy Prize",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Wide view of a giant colorful claw machine inside a neon carnival arcade. Hundreds of colorful sweets inside the glass enclosure: pink, yellow, blue, green, purple gummy candies, wrapped sweets, rainbow lollipops, round candy balls. A gigantic rainbow lollipop stands upright in the center. The angry stickman (red beanie, yellow shirt, blue trousers, black shoes) approaches, points at it excitedly, clenches his fist, and inserts a token. Machine lights up with rainbow LEDs.",
    animationDesc:
      "0.0-1.35s he stares at the machine with a normal expression, 1.35-2.25s he points at the giant lollipop with wide eyes, 2.25-2.95s he holds the point and grins while clenching his fist, 2.95-3.5s he smirks and prepares the token, 3.5-4.15s he inserts the token with an excited o-face, 4.15-6.0s he beams with a satisfied smile as the machine activates.",
    soundDesc: "Arcade chiptune score start, booth light shimmer at 0.5s, token clink at 3.8s, machine activation chime at 4.5s, magical sparkle at 4.9s.",
    captionText: "CAN HE WIN THE GIANT LOLLIPOP?",
    punchline: "The giant rainbow lollipop calls to him from the glass cage.",
    characterAction: "Approaches machine, points at giant lollipop, clenches fist, inserts token.",
    propAction: "Claw machine activates, rainbow LEDs light up, giant lollipop glows.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "The First Grab",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Same claw machine and character. He operates the joystick, moving the metal claw above a large pink gummy candy. He presses the big red button. The three-pronged claw descends vertically, opens its prongs, and closes around the pink candy. It lifts the candy slowly upward. Just before reaching the top, the candy slips from the claw and falls back into the candy pile with a bounce. The stickman stares at the machine with a furious expression, clenching both fists.",
    animationDesc:
      "6.45s he grips the joystick with determined squint, 7.65s he tilts the joystick left/right to position the claw, 7.95s he slams the red button with a grit expression, 8.85s he watches with wide eyes as the claw descends and grabs, 9.7s he grins as the candy rises, 10.15s his face drops to an o-expression as the candy slips, 10.45s he reaches out in disbelief, 10.45-12.0s he glares with angry squint, fists clenched.",
    soundDesc: "Joystick movement 6.45-7.8s, claw motor whir at 7.8s, button thunk at 7.95s, claw descending whir 8.0-8.8s, satisfying claw click at 8.85s, lifting sound 8.9-9.6s, candy slip pop at 9.7s, candy bounce thunk at 10.15s, funny failure sting at 11.0s.",
    captionText: "SO CLOSE... BUT NO CANDY!",
    punchline: "The pink candy taunts him by slipping away at the last second.",
    characterAction: "Operates joystick, presses button, watches claw grab, candy slips, furious stare.",
    propAction: "Claw grabs pink candy, lifts it, candy slips and falls back into pile.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "The Perfect Grab",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "The stickman takes a deep breath, eyes shut in concentration. He carefully moves the joystick, guiding the claw horizontally above the giant rainbow lollipop. The claw stops directly over the lollipop's stick. It descends, opens, and closes securely around the stick. It lifts the entire giant rainbow lollipop out of the candy pile. The stickman jumps excitedly with both fists raised in victory.",
    animationDesc:
      "12.65s he takes a deep breath with eyes shut, 14.0s he operates joystick with determined squint, 14.9s he presses the button with grit expression, 15.5s he watches with wide-eyed excitement as the claw descends onto the lollipop, 16.45s he jumps with both fists raised in a grin, 16.45-18.0s victory hops with happy expression.",
    soundDesc: "Deep breath at 12.6s, rising music swell 13.0-15.5s, claw motor at 14.9s, perfect claw click at 15.4s, satisfying lift sound 15.5-16.4s, victory fanfare at 16.4s, happy hop thumps at 16.55s / 17.25s.",
    captionText: "HE GOT THE BIG ONE!",
    punchline: "Perfect precision — the claw hooks the giant lollipop by its stick.",
    characterAction: "Deep breath, careful aim, presses button, watches lift, jumps with both fists raised.",
    propAction: "Claw descends onto lollipop stick, hooks it securely, lifts giant lollipop out.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "Candy Overload",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "The claw moves toward the machine's collection area carrying the giant lollipop. Suddenly the machine shakes violently. A hidden bottom candy dispenser opens. Hundreds of colorful sweets begin pouring out through the front prize chute onto the floor. The candy pile rapidly grows across the arcade floor. The stickman turns toward the chute with a shocked expression, mouth wide open, and tries to step backward as more candies spill out.",
    animationDesc:
      "18.75s he celebrates with happy raised fists, 19.35s machine shakes, his expression shifts to flat shock, 20.0s eyes wide, mouth open o-shape as candies pour, 20.0-23.55s he walks backward in panic with raised fists, 23.55-24.0s sad/grit expression as the pile surrounds him.",
    soundDesc: "Machine warning beeps at 18.85s, mechanical opening clunk at 19.6s, rapid candy bouncing 19.7-24s, escalating comedic music, candy avalanche rumble at 22.0s.",
    captionText: "WHY IS EVERYTHING FALLING?!",
    punchline: "The machine malfunctions and dumps its entire inventory.",
    characterAction: "Celebrates, machine shakes, shocked face, tries to back away from candy flood.",
    propAction: "Machine shakes, hidden dispenser opens, candy pours from front chute across floor.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "Buried in Candy",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "The candy dispenser releases one final enormous avalanche of colorful sweets. The candies spill across the floor and completely surround the stickman. He tries to run away but gets buried under the soft candy pile. Only his round white head and red beanie remain visible above the candy mountain. The giant rainbow lollipop falls gently from the claw and lands perfectly upright on top of his red beanie. He slowly looks upward at the lollipop, then turns toward the camera and gives an extremely angry deadpan stare. Brief comedic freeze-frame on his furious face.",
    animationDesc:
      "24.85s he walks in panic with wide eyes, 25.6s he is overtaken, sad shut eyes, 26.7s only head and beanie visible, looking around wildly, 27.55s looks up at lollipop falling, 28.4s lollipop lands on beanie, 28.9s normal flat stare, 28.9-30.0s angry squint with rage vein, freeze-frame.",
    soundDesc: "Huge candy avalanche at 24.4s, bouncing sweets 24.5-27s, soft cartoon impact as he's buried, lollipop landing plop at 28.4s, final comedic sting at 29.0s, freeze-frame silence.",
    captionText: "HE WON... TOO MUCH CANDY!",
    punchline: "He wanted one lollipop. He got the whole store.",
    characterAction: "Panics, buried in candy, lollipop lands on beanie, furious camera stare.",
    propAction: "Final avalanche buries him, claw releases lollipop onto beanie, freeze-frame.",
  },
]`;

// Insert before PROJECTS
const insert = `export const CANDY_CLAW_PROMPT = \`${prompt}\`;

export const CANDY_CLAW_SCENES: SceneDef[] = ${scenes};`;

const idx = s.indexOf('];\r\n\r\nexport const PROJECTS: Record<ProjectId, ProjectDef> = {');
if (idx >= 0) {
  s = s.slice(0, idx + 4) + '\r\n\r\n' + insert + '\r\n\r\n' + s.slice(idx + 4);
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

const projIdx = s.indexOf("  'balloon-pop-jackpot': {\r\n    id: 'balloon-pop-jackpot',\r\n    title: 'Angry Stickman: The Balloon Pop Jackpot',\r\n    subtitle: 'The 30-Second Carnival Booth Comedy',\r\n    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',\r\n    duration: 30,\r\n    hasAudioDialogue: false,\r\n    hasCaptions: true,\r\n    masterPrompt: BALLOON_POP_PROMPT,\r\n    scenes: BALLOON_POP_SCENES,\r\n  },\r\n  'coin-flip': {");
if (projIdx >= 0) {
  s = s.slice(0, projIdx + 3) + candyProject + "\r\n  'coin-flip': {";
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
console.log('All patches applied');