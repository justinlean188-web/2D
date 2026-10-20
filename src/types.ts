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
  shadowAction: string;
}

export const SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Perfect Relationship",
    timeRange: [0.0, 2.0],
    videoPrompt:
      "A clean white canvas fills the vertical frame. A small black stick figure walks happily from left to right with an exaggerated, springy stride. Its round head bobs gently, its arms swing naturally, and its feet make quick, confident steps. Directly beneath its feet, a solid black shadow follows perfectly, matching every step with flawless synchronization. At approximately 1.2 seconds, the figure performs one particularly cheerful little skip. The shadow copies it exactly. The composition is simple, spacious, and visually satisfying. Both the figure and shadow remain completely visible.",
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
      "Without warning, the shadow abruptly stops moving. The stick figure continues walking to the right, taking two more steps while its shadow remains frozen in place. The shadow stretches away from the figure's feet and detaches cleanly from the ground, remaining as a solid black silhouette. The stick figure takes one final step, pauses, and begins to notice that something is wrong. Its head slowly tilts backward, but the rest of its body stays facing forward. Hold a brief, uncomfortable silence.",
    animationDesc: "Sudden stop at 2.0s, continued walking, clean separation of shadow from feet, delayed head turn.",
    soundDesc: "A sharp record scratch exactly when the shadow stops, followed by a tiny awkward silence.",
    captionText: undefined,
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
      "The detached shadow rises vertically from the floor and transforms into an upright, featureless black silhouette with two arms and two legs. It reaches behind its back and produces a tiny white clipboard with one blank sheet of paper. The clipboard must remain simple and completely text-free. The shadow holds the clipboard, taps the blank page twice with one finger, then points accusingly toward the stick figure. The stick figure slowly straightens its posture, looking increasingly uncomfortable. The shadow's movements are controlled, bureaucratic, and deeply unimpressed, as though it has rehearsed this complaint for years.",
    animationDesc: "Smooth rise, confident clipboard reveal, two precise taps, pointed accusation.",
    soundDesc: "Paper slap, two quick tapping sounds, and one tiny dry click.",
    captionText: undefined,
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
      "The shadow lowers itself onto the white floor, sits cross-legged, folds both arms tightly across its chest, and refuses to move. The stick figure cautiously approaches, stops a short distance away, and gives a small friendly wave. The shadow slowly turns its entire upper body toward the figure, pauses, and gives an exaggeratedly slow head shake. The stick figure's shoulders slump. Its arms gradually fall to its sides. Use a perfectly timed beat of awkward silence. Keep the body language exaggerated but simple enough to read immediately.",
    animationDesc: "Controlled sitting motion, slow wave, long unimpressed pause, defeated shoulder slump.",
    soundDesc: "Soft floor-contact thump followed by a tiny squeak as the shadow crosses its arms.",
    captionText: undefined,
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
      "The shadow suddenly stands up, turns directly toward the viewer, and delivers an exaggeratedly slow, unmistakable thumbs-down gesture. Behind it, the stick figure raises both hands in complete confusion, then points at itself as if asking, 'Me?' The shadow holds the thumbs-down pose for a full beat. At 9.3 seconds, the shadow turns its back on the stick figure and walks out of frame independently, leaving the figure standing alone on the white background. End on the stick figure's frozen, devastated expression. Hold the final frame briefly, with the empty space beneath its feet emphasizing the absence of its shadow.",
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

export const MASTER_PROMPT = `WHAT IF YOUR SHADOW QUIT? — AI VIDEO PROMPT

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

export interface StudioConfig {
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
  accentColor: '#e11d48',
  enableVoiceOver: true,
  enableSFX: true,
  voiceRate: 0.88,
  voicePitch: 0.92,
  voiceVolume: 1.0,
  showCaptions: true,
  showSafeZones: false,
  fpsMode: 24,
  customVO1: 'What if your shadow quit?',
  customVO2: 'HR has been notified.',
  customEndCaption: 'YOUR SHADOW HAS RIGHTS.',
};
