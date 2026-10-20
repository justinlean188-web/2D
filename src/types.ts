export interface SceneDef {
  id: number;
  name: string;
  timeRange: [number, number]; // [startTime, endTime]
  title: string;
  videoPrompt: string;
  animationDesc: string;
  soundDesc: string;
  voiceOverText?: string;
  voiceOverTime?: number;
  captionText?: string;
  punchline: string;
  characterAction: string;
  shadowAction?: string;
  propAction?: string;
}

export type ProjectId = 'paper-ball' | 'shadow-quit';

export interface ProjectDef {
  id: ProjectId;
  title: string;
  subtitle: string;
  tagline: string;
  hasAudioDialogue: boolean;
  hasCaptions: boolean;
  masterPrompt: string;
  scenes: SceneDef[];
}

export const PAPER_BALL_PROMPT = `Minimalist 2D vector stickman comedy animation, vertical 9:16 aspect ratio, 1080×1920 resolution, smooth 24 fps animation. Pure white background, simple black stickman with a round head, bold clean black outlines, simple geometric props, crumpled white paper ball, small black trash can, one table lamp and one ceiling fan. Flat colors only, no gradients, no realistic textures, no 3D rendering, no unnecessary details. Exaggerated cartoon physics, clear readable silhouettes, snappy timing, elastic motion, fast ball tracking, satisfying ricochets, and deadpan comedic expressions. Maintain identical character proportions, prop designs, room layout, and lighting across all scenes. No dialogue, no captions, no text, no watermark.`;

export const SHADOW_QUIT_PROMPT = `WHAT IF YOUR SHADOW QUIT? — AI VIDEO PROMPT

MASTER STYLE PROMPT
Create a 10-second, vertically framed 2D minimalist comedy animation in 9:16 aspect ratio, 1080 × 1920, smooth 24 fps.

Visual style: Premium flat 2D vector animation, pure white background, crisp black outlines, simple geometric shapes, deliberate clean compositions, fluid character movement, and perfectly timed visual comedy. Use only white, solid black, and a single muted soft-red accent. No gradients, textures, realistic lighting, 3D rendering, or unnecessary background objects.

Main character: A simple black stick figure with a perfectly round white face outlined in black, two small black eyes, thin expressive arms and legs, and a slightly oversized round head. Maintain identical proportions and design throughout every shot.

Shadow character: A completely solid black silhouette with no facial features, initially attached naturally to the main character's feet. It can detach from the ground, stand upright, move independently, and use exaggerated pantomime gestures. Its movements should feel intentional, sarcastic, and emotionally exhausted.

Animation quality: Smooth anticipation, exaggerated pauses, satisfying movement arcs, subtle squash-and-stretch, clean silhouettes, precise staging, and expressive body language. Every action must read instantly on a mobile screen.

Camera: Locked side-view composition with both characters clearly visible. Keep important action centered within the vertical safe area. No unnecessary camera movement.

Tone: Absurd workplace comedy, dry sarcasm, awkward silence, and a final punchline delivered with complete seriousness.

Audio: Minimal, carefully synchronized cartoon sound effects. Voice-over is calm, monotone, and slightly bored.

Strict constraints: No generated text, letters, numbers, subtitles, logos, watermarks, extra characters, additional limbs, flickering outlines, morphing designs, or inconsistent character proportions. Add all typography and captions during editing.`;

export const PAPER_BALL_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Aim & Wind-Up",
    timeRange: [0.0, 2.0],
    videoPrompt:
      "A pure white room in 9:16 vertical view. On the left, a simple black stickman with a round head sits at a minimalist desk, clutching a crumpled white paper ball. Above him, a black 3-blade ceiling fan rotates smoothly at a relaxed, calm pace. On the far right floor sits a small black wastebasket. On the desk rests a geometric table lamp. The stickman squints with exaggerated concentration, aiming at the trash can.",
    animationDesc: "Ceiling fan spins smoothly and calmly. Stickman performs deliberate wind-up, eye tracking forward.",
    soundDesc: "Subtle rhythmic wind-up.",
    punchline: "Dead-serious concentration for a simple wastebasket toss.",
    characterAction: "Squints with intense focus, measures trajectory, cocks throwing arm back.",
    propAction: "Ceiling fan rotates calmly, table lamp steady.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "The Graceful Arc Toss",
    timeRange: [2.0, 4.4],
    videoPrompt:
      "The stickman launches the crumpled paper ball with snappy elastic cartoon release. The white crumpled ball flies in a high, graceful parabolic arc across the room towards the small black trash can. The stickman leans back with smug confidence, resting chin in palm.",
    animationDesc: "Elastic arm snap, clear slow-motion ball tracking across room, anticipation posture.",
    soundDesc: "Snappy cartoon whoosh sound at 2.0s.",
    punchline: "Smug satisfaction before the impending chaos.",
    characterAction: "Snappy release, crosses legs, watches smugly.",
    propAction: "Paper ball travels in high readable arc over the desk.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "Rim Clip & Reverse Bounce",
    timeRange: [4.4, 6.0],
    videoPrompt:
      "The paper ball clips the front metal rim of the small black trash can at 4.4s. It squashes elastically, hangs for a comedic beat at the apex, and ricochets cleanly backwards in a high readable lob toward the desk lamp. The stickman's smug smile begins to drop into an open-mouthed 'O' in sudden alarm.",
    animationDesc: "Rim impact squash at 4.4s, readable reverse ricochet arc, stickman mouth opens in alarm.",
    soundDesc: "Metallic rim clink at 4.4s.",
    punchline: "The paper ball reverses course with impossible geometric precision.",
    characterAction: "Eyes widen in sudden alarm, tracks ball reversing towards him.",
    propAction: "Trash can vibrates; ball arcs toward table lamp.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "Table Lamp Ding & Fan Ascent",
    timeRange: [6.0, 7.5],
    videoPrompt:
      "The ball strikes the table lamp on the desk with a resonant brass ding at 6.0s. The lampshade rocks back and forth with an elastic cartoon wobble. The ball ricochets straight up in a high vertical lob towards the ceiling fan as the stickman throws a hand up in panic.",
    animationDesc: "Lamp strike at 6.0s, lampshade oscillation wobble, vertical ball ascent toward fan.",
    soundDesc: "Resonant brass lamp bell ding at 6.0s.",
    punchline: "The table lamp acts like a pinball bumper.",
    characterAction: "Throws hand up in alarm, head whips up towards the ceiling.",
    propAction: "Lampshade wobbles back and forth elastically.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "Fan Batting, Forehead Bonk & Deadpan",
    timeRange: [7.5, 10.0],
    videoPrompt:
      "The rotating ceiling fan blade sweeps by and bats the ball with a solid WHACK at 7.5s! The ball arcs across to the right wall at 8.6s, rebounds horizontally, and strikes the stickman squarely in the forehead with a cartoon BONK at 9.4s! The ball drops softly onto the desk at 9.6s. Complete silence. The stickman blinks slowly, staring deadpan at the paper ball.",
    animationDesc: "Fan blade strike at 7.5s, wall bounce at 8.6s, forehead bonk at 9.4s, ball drops to desk at 9.6s, slow deadpan blink at 9.8s.",
    soundDesc: "Heavy fan WHACK at 7.5s, wall bounce at 8.6s, forehead BONK at 9.4s, soft plop at 9.6s, deadpan silence.",
    punchline: "The ball lands exactly where it started; total deadpan resignation.",
    characterAction: "Head snaps back on impact, dazed spiral eyes, then delivers a long deadpan slow blink.",
    propAction: "Paper ball rolls 2 inches on desk and rests peacefully in front of stickman.",
  },
];

export const SHADOW_QUIT_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Perfect Relationship",
    timeRange: [0.0, 2.0],
    videoPrompt:
      "A clean white canvas fills the vertical frame. A small black stick figure walks happily from left to right with an exaggerated, springy stride. Its round head bobs gently, its arms swing naturally, and its feet make quick, confident steps. Directly beneath its feet, a solid black shadow follows perfectly, matching every step with flawless synchronization. At approximately 1.2 seconds, the figure performs one particularly cheerful little skip. The shadow copies it exactly.",
    animationDesc: "Smooth walking cycle, gentle head bounce, cheerful skip at 1.2s, consistent shadow alignment.",
    soundDesc: "Two soft footstep pops followed by a tiny cheerful pop.",
    voiceOverText: "What if your shadow quit?",
    voiceOverTime: 0.1,
    captionText: "WHAT IF YOUR SHADOW QUIT?",
    punchline: "Total harmony before the sudden disruption.",
    characterAction: "Confident springy stride, cheerful 1.2s skip.",
    shadowAction: "Flawless synchronization attached to feet.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "The Resignation",
    timeRange: [2.0, 4.0],
    videoPrompt:
      "Without warning, the shadow abruptly stops moving. The stick figure continues walking to the right, taking two more steps while its shadow remains frozen in place. The shadow stretches away from the figure's feet and detaches cleanly from the ground, remaining as a solid black silhouette. The stick figure takes one final step, pauses, and begins to notice that something is wrong. Its head slowly tilts backward, but the rest of its body stays facing forward.",
    animationDesc: "Sudden stop at 2.0s, continued walking, clean separation of shadow from feet, delayed head turn.",
    soundDesc: "A sharp record scratch exactly when the shadow stops, followed by a tiny awkward silence.",
    punchline: "The shadow stops dead; figure keeps walking oblivious.",
    characterAction: "Takes 2 more steps, stops, head slowly pivots backwards.",
    shadowAction: "Stops dead, detaches cleanly from feet, stands frozen.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "Formal Complaint",
    timeRange: [4.0, 6.0],
    videoPrompt:
      "The detached shadow rises vertically from the floor and transforms into an upright, featureless black silhouette with two arms and two legs. It reaches behind its back and produces a tiny white clipboard with one blank sheet of paper. The clipboard must remain simple and completely text-free. The shadow holds the clipboard, taps the blank page twice with one finger, then points accusingly toward the stick figure. The stick figure slowly straightens its posture, looking increasingly uncomfortable.",
    animationDesc: "Smooth rise, confident clipboard reveal, two precise taps, pointed accusation.",
    soundDesc: "Paper slap, two quick tapping sounds, and one tiny dry click.",
    punchline: "Treating an ordinary daily walk like a formal HR workplace grievance.",
    characterAction: "Straightens posture awkwardly, arms twitching in discomfort.",
    shadowAction: "Rises upright, whips out clipboard, taps page twice, points accusingly.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Unpaid Overtime",
    timeRange: [6.0, 8.0],
    videoPrompt:
      "The shadow lowers itself onto the white floor, sits cross-legged, folds both arms tightly across its chest, and refuses to move. The stick figure cautiously approaches, stops a short distance away, and gives a small friendly wave. The shadow slowly turns its entire upper body toward the figure, pauses, and gives an exaggeratedly slow head shake. The stick figure's shoulders slump. Its arms gradually fall to its sides.",
    animationDesc: "Controlled sitting motion, slow wave, long unimpressed pause, defeated shoulder slump.",
    soundDesc: "Soft floor-contact thump followed by a tiny squeak as the shadow crosses its arms.",
    punchline: "The sit-in protest: folded arms and an icy slow-motion head shake.",
    characterAction: "Approaches cautiously, friendly nervous wave, shoulders slump in defeat.",
    shadowAction: "Drops to floor, cross-legged sit, folds arms, delivers cold head shake.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "HR Has Been Notified",
    timeRange: [8.0, 10.0],
    videoPrompt:
      "The shadow suddenly stands up, turns directly toward the viewer, and delivers an exaggeratedly slow, unmistakable thumbs-down gesture. Behind it, the stick figure raises both hands in complete confusion, then points at itself as if asking, 'Me?' The shadow holds the thumbs-down pose for a full beat. At 9.3 seconds, the shadow turns its back on the stick figure and walks out of frame independently, leaving the figure standing alone on the white background.",
    animationDesc: "Slow thumbs down, confused reaction, decisive walk-off at 9.3s, clean final freeze-frame.",
    soundDesc: "A short, mournful trombone note timed to the thumbs-down gesture.",
    voiceOverText: "HR has been notified.",
    voiceOverTime: 8.0,
    captionText: "YOUR SHADOW HAS RIGHTS.",
    punchline: "The devastating thumbs-down and total abandonment.",
    characterAction: "Hands up in disbelief, points at self, frozen in shock without shadow.",
    shadowAction: "Stands up, delivers deadpan thumbs-down to viewer, walks out of frame.",
  },
];

export const PROJECTS: Record<ProjectId, ProjectDef> = {
  'paper-ball': {
    id: 'paper-ball',
    title: 'The Paper Ball Ricochet',
    subtitle: 'Desk, Lamp, Ceiling Fan & Trash Can Gag',
    tagline: 'Minimalist 2D Vector Comedy · No Dialogue · Pure Visual Slapstick',
    hasAudioDialogue: false,
    hasCaptions: false,
    masterPrompt: PAPER_BALL_PROMPT,
    scenes: PAPER_BALL_SCENES,
  },
  'shadow-quit': {
    id: 'shadow-quit',
    title: 'What If Your Shadow Quit?',
    subtitle: 'Workplace Grievance Pantomime',
    tagline: 'Minimalist 2D Vector Comedy with Deadpan Voice-Over',
    hasAudioDialogue: true,
    hasCaptions: true,
    masterPrompt: SHADOW_QUIT_PROMPT,
    scenes: SHADOW_QUIT_SCENES,
  },
};

export interface StudioConfig {
  activeProject: ProjectId;
  accentColor: string;
  enableVoiceOver: boolean;
  enableSFX: boolean;
  voiceRate: number;
  voicePitch: number;
  voiceVolume: number;
  showCaptions: boolean;
  showSafeZones: boolean;
  fpsMode: 24 | 60;
  customVO1: string;
  customVO2: string;
  customEndCaption: string;
}

export const DEFAULT_CONFIG: StudioConfig = {
  activeProject: 'paper-ball', // Defaults immediately to the newly requested paper ball animation!
  accentColor: '#e11d48',
  enableVoiceOver: false,
  enableSFX: true,
  voiceRate: 0.88,
  voicePitch: 0.92,
  voiceVolume: 1.0,
  showCaptions: false, // Strict: no captions, no text for paper-ball
  showSafeZones: false,
  fpsMode: 24,
  customVO1: 'What if your shadow quit?',
  customVO2: 'HR has been notified.',
  customEndCaption: 'YOUR SHADOW HAS RIGHTS.',
};

// Aliases for backwards compatibility
export const SCENES = PAPER_BALL_SCENES;
export const MASTER_PROMPT = PAPER_BALL_PROMPT;
