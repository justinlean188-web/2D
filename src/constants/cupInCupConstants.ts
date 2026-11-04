import type { SceneDef } from '../types';

export const CUP_IN_CUP_PROMPT = `THE IMPOSSIBLE CUP-IN-CUP SHOT -- 30-SECOND 2D STICKMAN SHORT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080x1920, 24 fps.

VISUAL STYLE:
Modern Pop flat 2D vector cartoon. Thick consistent black outlines, simple geometric shapes, bright solid colours, smooth readable action, exaggerated facial expressions. A colorful indoor trickshot room with a table, a blue cup containing a red cup, a ping-pong ball, and a tower of colorful cups for the finale. No gradients, no textures, no watermark, no logo.

CHARACTER (LOCKED):
Round white head, two small black oval eyes, thick black eyebrows, simple black mouth, red beanie with a red pompom, yellow short-sleeved shirt, blue trousers, black shoes, thin black limbs and black mitten hands. Identical proportions and colours in every shot. The beanie stays on until the final avalanche.

SHOT 1 (0-6s) -- THE IMPOSSIBLE TARGET:
Wide shot of the stickman behind a table. He carefully places a small red cup inside a larger blue cup. He steps back, picks up a ping-pong ball, and points confidently at the target. Caption: "ONE BALL. TWO CUPS. IMPOSSIBLE!"

SHOT 2 (6-12s) -- FIRST FAILURE:
The stickman throws the ball. It bounces once on the table, hits the outside rim of the blue cup, and flies away. The cups stay standing. He stares furiously, clenching fists. Caption: "NOT EVEN CLOSE!"

SHOT 3 (12-18s) -- ALMOST PERFECT:
He throws again. The ball bounces, passes through the blue cup's opening, but lands beside the red cup inside the blue cup. He celebrates, then realizes it's the wrong cup. Embarrassed. Caption: "SO CLOSE… WRONG CUP!"

SHOT 4 (18-24s) -- THE PERFECT SHOT:
Close-up, slow-motion. He breathes, aims, throws. The ball bounces once, arcs through the blue cup, and drops cleanly into the red cup. He jumps in victory. Caption: "CUP-IN-CUP! PERFECT!"

SHOT 5 (24-30s) -- THE CUP AVALANCHE:
He celebrates, bumps the table. A tower of colorful cups collapses onto him. He's buried, only his red beanie visible with a tiny cup balanced on top. Freeze-frame. Caption: "HE WON… THEN LOST EVERYTHING! 😂"

AUDIO:
Upbeat playful background music, cup placement clicks, ping-pong bounces, rim impact, suspense swell, satisfying plink, victory fanfare, cup tower wobble, avalanche crash, freeze sting. No dialogue.`;

export const CUP_IN_CUP_SCENES: SceneDef[] = [
  {
    id: 1,
    name: 'Shot 1',
    title: 'The Impossible Target',
    timeRange: [0.0, 6.0] as [number, number],
    videoPrompt:
      'Wide view of a colorful indoor trickshot room. A table runs horizontally. A large blue plastic cup stands at the far end with a smaller red plastic cup upright inside it. The stickman (red beanie, yellow shirt, blue trousers, black shoes) places the cups carefully, steps back, picks up a white ping-pong ball, and points confidently at the target.',
    animationDesc:
      '0.0-1.2s he stands normally, 1.2-2.0s he places red cup inside blue cup with a click, 2.0-2.8s he steps back adjusting cups, 2.8-3.5s he picks up ping-pong ball, 3.5-4.5s he winds up pointing at target, 4.5-6.0s he holds pose with confident smirk.',
    soundDesc:
      'Upbeat score start, cup placement click at 1.5s, cup settle at 2.2s, ball pickup at 3.2s, confident ding at 4.0s, ambient room hum.',
    captionText: 'ONE BALL. TWO CUPS. IMPOSSIBLE!',
    punchline: 'Two cups, one tiny target. He has never made this shot.',
    characterAction: 'Places cups, steps back, picks up ball, points at target.',
    propAction: 'Red cup nests inside blue cup, ball appears in hand.',
  },
  {
    id: 2,
    name: 'Shot 2',
    title: 'First Failure',
    timeRange: [6.0, 12.0] as [number, number],
    videoPrompt:
      'Same table and cups. The stickman throws the ping-pong ball. It bounces once on the tabletop, hits the outside rim of the larger blue cup, and ricochets away. The cups remain perfectly still. The stickman stares with a furious expression, clenching both fists.',
    animationDesc:
      '6.2s he swings arm back with grit expression, 6.5s ball leaves hand, 6.5-7.2s ball flies toward cups, 7.2s ball bounces on table, 7.4s ball hits blue cup rim with a clang, 7.4-8.0s ball flies away, 8.0-10.0s he stares at cups with angry squint and clenched fists, 10.0-12.0s he glares, breathing hard.',
    soundDesc:
      'Wind-up whoosh at 6.3s, paddle pop at 6.5s, table bounce at 7.2s, rim clang at 7.4s, angry sting at 7.8s, ball rolling away at 8.2s.',
    captionText: 'NOT EVEN CLOSE!',
    punchline: 'The rim rejected him. The cups didn\'t even flinch.',
    characterAction: 'Throws ball, watches it hit rim and bounce away, furious stare.',
    propAction: 'Ball bounces on table, hits blue cup rim, ricochets away. Cups unmoved.',
  },
  {
    id: 3,
    name: 'Shot 3',
    title: 'Almost Perfect',
    timeRange: [12.0, 18.0] as [number, number],
    videoPrompt:
      'Same setup. The stickman carefully aims and throws again. The ball bounces once on the table, travels cleanly through the opening of the large blue cup, but lands beside the small red cup (inside the blue cup, but not in the red cup). The stickman raises his arms in celebration, then looks down and realizes the ball is in the wrong cup. His expression shifts to embarrassment.',
    animationDesc:
      '12.3s deep breath, 12.8s careful aim, 13.0s throws, 13.0-14.2s ball flies, 14.2s table bounce, 14.5s ball enters blue cup opening, 14.5-15.5s slow-mo ball drops beside red cup, 15.5s he jumps celebrating, 15.8s he looks down, 16.0-17.0s face falls to embarrassment, 17.0-18.0s he facepalms.',
    soundDesc:
      'Deep breath at 12.3s, paddle pop at 13.0s, table bounce at 14.2s, suspense swell 14.2-15.5s, soft plink at 15.5s, celebration fanfare at 15.5s, record scratch at 16.0s, sad trombone at 16.5s.',
    captionText: 'SO CLOSE… WRONG CUP!',
    punchline: 'He threaded the needle but missed the eye.',
    characterAction: 'Deep breath, careful throw, celebrates early, realizes mistake, embarrassed facepalm.',
    propAction: 'Ball bounces, enters blue cup, lands beside red cup (not inside).',
  },
  {
    id: 4,
    name: 'Shot 4',
    title: 'The Perfect Shot',
    timeRange: [18.0, 24.0] as [number, number],
    videoPrompt:
      'Dramatic slow-motion close-up. The stickman takes a deep breath, aims carefully, and throws. The ball bounces once on the table, arcs through the blue cup opening, and drops perfectly into the small red cup. The ball rests visibly inside the red cup. The stickman jumps up with both arms raised in victory.',
    animationDesc:
      '18.2s stands up slowly, 18.5-19.5s deep breath eyes shut, 19.5-20.0s slow-mo aim, 20.0s throws in slow-mo, 20.0-21.5s ball flies slow-mo, 21.5s table bounce, 21.5-22.5s ball enters blue cup, 22.5-23.3s ball drops into red cup with gentle plink, 23.3-24.0s he jumps with huge grin, arms raised.',
    soundDesc:
      'Slow-mo swell 18.5-23.5s, paddle thock at 20.0s, table bounce at 21.5s, resonant chime at 22.0s, perfect plink at 23.0s, victory fanfare at 23.3s, happy hop at 23.5s.',
    captionText: 'CUP-IN-CUP! PERFECT!',
    punchline: 'One bounce. Two cups. Perfection.',
    characterAction: 'Breathes, slow-mo aim, throws, watches, jumps in victory.',
    propAction: 'Ball slow-mo trajectory: bounce, through blue cup, into red cup.',
  },
  {
    id: 5,
    name: 'Shot 5',
    title: 'The Cup Avalanche',
    timeRange: [24.0, 30.0] as [number, number],
    videoPrompt:
      'The stickman celebrates beside the table. He accidentally bumps the table with his hip. A tall tower of colorful plastic cups stacked beside the target wobbles and collapses. Cups tumble naturally over the stickman, burying him. Only his red beanie remains visible, with one tiny plastic cup balanced on top. Funny freeze-frame ending.',
    animationDesc:
      '24.2s victory pose, 24.5s hip bumps table, 24.5-25.5s tower wobbles, 25.5s collapse begins, 25.5-27.5s cups cascade over him, 27.5s he is buried, 27.5-29.0s beanie rises with tiny cup on top, 29.0-30.0s freeze-frame with angry vein.',
    soundDesc:
      'Table bump at 24.5s, wobble creak 24.5-25.5s, avalanche rumble 25.5-27.5s, cups cascading 26-29s, soft beanie rise at 28.0s, freeze sting at 29.0s, silence to end.',
    captionText: 'HE WON… THEN LOST EVERYTHING! 😂',
    punchline: 'The cup tower had other plans.',
    characterAction: 'Celebrates, bumps table, gets buried in cups, beanie surfaces with cup on top.',
    propAction: 'Cup tower collapses, buries him, beanie with tiny cup emerges.',
  },
];