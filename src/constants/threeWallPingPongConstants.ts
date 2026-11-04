import type { SceneDef } from '../types';

export const THREE_WALL_PING_PONG_PROMPT = `THE THREE-WALL PING-PONG SHOT -- 30-SECOND 2D STICKMAN SHORT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080x1920, 24 fps.

VISUAL STYLE:
Modern Pop flat 2D vector cartoon. Thick consistent black outlines, simple geometric shapes, bright solid colours, smooth readable action, exaggerated facial expressions. A colorful indoor trickshot room with a table, three clearly visible walls arranged for a trickshot, a tiny red cup, a white ping-pong ball and a red paddle. No gradients, no textures, no watermark, no logo.

CHARACTER (LOCKED):
Round white head, two small black oval eyes, thick black eyebrows, simple black mouth, red beanie with a red pompom, yellow short-sleeved shirt, blue trousers, black shoes, thin black limbs and black mitten hands. Identical proportions and colours in every shot. The beanie stays on until the final avalanche.

SHOT 1 (0-6s) -- THE SETUP:
Wide shot of the stickman beside a table in a colorful indoor room. A tiny red cup sits at the opposite end. Three walls are visible around the room. The stickman points at the cup confidently, grips his red paddle, and prepares to shoot. Caption: "3 WALLS. 1 SHOT. IMPOSSIBLE!"

SHOT 2 (6-12s) -- THE FIRST FAIL:
Medium shot. The stickman hits the ping-pong ball. It travels toward the first wall but rebounds at the wrong angle and bounces directly into his red beanie. His head tilts backward and his eyebrows turn furious. The ball falls onto the table. Caption: "SHOT NUMBER ONE… FAILED!"

SHOT 3 (12-18s) -- SO CLOSE:
Side view showing the entire trickshot route. The stickman hits the ball again. Clearly show the ball bouncing off wall one, then wall two, then wall three, in that exact order. The ball returns toward the table but narrowly misses the red cup and rolls past it. The stickman drops to his knees dramatically. Caption: "SO CLOSE!"

SHOT 4 (18-24s) -- THE PERFECT SHOT:
Dramatic slow-motion shot. The stickman stands up, takes a deep breath, and carefully aims. He hits the ball. Clearly show one continuous ping-pong ball traveling through the air and bouncing off wall one, wall two, and wall three in order. The ball then lands inside the tiny red cup. The stickman jumps up with both arms raised in victory. Caption: "PERFECT THREE-WALL SHOT!"

SHOT 5 (24-30s) -- TOO MANY BALLS:
Close-up of the red cup shaking. It tips over, revealing that it was hiding a huge collection of ping-pong balls. Hundreds of ping-pong balls spill out across the table and cascade onto the stickman. He disappears underneath the balls. His red beanie slowly rises to the top of the pile. End on a funny freeze-frame. Caption: "HE WON… TOO MANY BALLS! 😂"

AUDIO:
Upbeat playful background music, paddle hit sounds, three distinct wall-bounce sounds, a dramatic success chime, then a funny rolling-ball avalanche sound effect. No dialogue, no voice-over.`;

export const THREE_WALL_PING_PONG_SCENES: SceneDef[] = [
  {
    id: 1,
    name: 'Shot 1',
    title: 'The Setup',
    timeRange: [0.0, 6.0] as [number, number],
    videoPrompt:
      'Wide view of a colorful indoor trickshot room with three clearly visible walls. A table runs horizontally. A tiny red plastic cup sits at the far end. A white ping-pong ball and red paddle rest near the stickman (red beanie, yellow shirt, blue trousers, black shoes). The stickman stands beside the table, points at the cup confidently, grips his red paddle, and prepares to shoot.',
    animationDesc:
      '0.0-1.2s he stands with a normal expression, 1.2-2.0s he points at the cup with a raised brow and o-mouth, 2.0-2.8s he narrows his eyes and clenches his fist, 2.8-3.6s he picks up the red paddle with a determined smirk, 3.6-4.5s he winds up for the shot, 4.5-6.0s he holds the pose, paddle back, eyes locked on the cup.',
    soundDesc:
      'Upbeat playful score start, confident sting at 1.5s, paddle grip click at 3.0s, wind-up whoosh at 4.0s, ambient room hum.',
    captionText: '3 WALLS. 1 SHOT. IMPOSSIBLE!',
    punchline: 'Three walls, one cup, one shot. He has never done this before.',
    characterAction: 'Stands by table, points at cup, picks up paddle, winds up for the shot.',
    propAction: 'Red cup sits at far end, ball and paddle ready, three walls visible.',
  },
  {
    id: 2,
    name: 'Shot 2',
    title: 'The First Fail',
    timeRange: [6.0, 12.0] as [number, number],
    videoPrompt:
      'Medium shot of the same room. The stickman hits the ping-pong ball with his red paddle. The ball travels toward the first wall but rebounds at the wrong angle and bounces directly into his red beanie. His head tilts backward and his eyebrows turn furious. The ball falls from his beanie onto the table.',
    animationDesc:
      '6.2s he swings the paddle with a grit expression, 6.5s ball hits paddle with a pop, 6.5-7.8s ball flies toward wall 1, 7.8s ball hits wall 1 at wrong angle, 7.8-8.5s ball ricochets back toward him, 8.5s ball hits beanie with a bonk, 8.5-9.5s head tilts back, eyes wide, brows furious, 9.5-10.5s ball falls onto table, 10.5-12.0s he stares at ball with angry squint and clenched fists.',
    soundDesc:
      'Paddle pop at 6.5s, ball flight whoosh 6.5-7.8s, wall thunk at 7.8s, ricochet boing at 8.0s, beanie bonk at 8.5s, angry sting at 9.0s, ball plop at 9.8s.',
    captionText: 'SHOT NUMBER ONE… FAILED!',
    punchline: 'The ball had other plans. It chose the beanie.',
    characterAction: 'Swings paddle, watches ball hit wall and return, takes it on the beanie, furious stare.',
    propAction: 'Ball hits paddle, flies to wall 1, ricochets into beanie, falls to table.',
  },
  {
    id: 3,
    name: 'Shot 3',
    title: 'So Close',
    timeRange: [12.0, 18.0] as [number, number],
    videoPrompt:
      'Side view showing the entire trickshot route across the room. The stickman hits the ball again. Clearly show the ball bouncing off wall one, then wall two, then wall three, in that exact order. The ball returns toward the table but narrowly misses the red cup and rolls past it. The stickman drops to his knees dramatically.',
    animationDesc:
      '12.3s he resets with a deep breath, 12.8s he swings, 13.0s ball hits paddle, 13.0-14.2s ball hits wall 1 (clean bounce), 14.2-15.4s ball hits wall 2 (clean bounce), 15.4-16.6s ball hits wall 3 (clean bounce), 16.6-17.5s ball approaches cup, misses by millimeters and rolls past, 17.5-18.0s he drops to knees with hands on head in disbelief.',
    soundDesc:
      'Deep breath at 12.3s, paddle pop at 12.8s, three clean wall thunks at 13.8s / 15.0s / 16.2s, near-miss slide at 17.2s, sad trombone at 17.6s.',
    captionText: 'SO CLOSE!',
    punchline: 'Millimeters. That is all it took.',
    characterAction: 'Deep breath, swings, watches three perfect bounces, drops to knees when ball misses cup.',
    propAction: 'Ball hits paddle, bounces wall 1, wall 2, wall 3, misses cup, rolls past.',
  },
  {
    id: 4,
    name: 'Shot 4',
    title: 'The Perfect Shot',
    timeRange: [18.0, 24.0] as [number, number],
    videoPrompt:
      'Dramatic slow-motion shot. The stickman stands up, takes a deep breath, and carefully aims. He hits the ball. Clearly show one continuous ping-pong ball traveling through the air and bouncing off wall one, wall two, and wall three in order. The ball then lands inside the tiny red cup. The stickman jumps up with both arms raised in victory.',
    animationDesc:
      '18.2s he stands up slowly, 18.5-19.5s deep breath with eyes shut, 19.5-20.0s slow-motion aim, 20.0s paddle strikes ball in slow-mo, 20.0-21.5s ball hits wall 1 (slow, visible arc), 21.5-22.5s ball hits wall 2, 22.5-23.3s ball hits wall 3, 23.3-23.8s ball drops into cup with a gentle clink, 23.8-24.0s he jumps with both arms raised, huge grin.',
    soundDesc:
      'Slow-mo swell 18.5-23.5s, paddle thock at 20.0s, three resonant wall chimes at 20.8s / 21.8s / 22.8s, cup plink at 23.5s, victory fanfare at 23.7s, happy hop at 23.9s.',
    captionText: 'PERFECT THREE-WALL SHOT!',
    punchline: 'Three walls. One cup. Perfection.',
    characterAction: 'Stands, breathes, slow-mo aim, strikes, watches, jumps in victory.',
    propAction: 'Ball travels slow-mo through three wall bounces, lands in cup.',
  },
  {
    id: 5,
    name: 'Shot 5',
    title: 'Too Many Balls',
    timeRange: [24.0, 30.0] as [number, number],
    videoPrompt:
      'Close-up of the red cup shaking. It tips over, revealing that it was hiding a huge collection of ping-pong balls. Hundreds of ping-pong balls spill out across the table and cascade onto the stickman. He disappears underneath the balls. His red beanie slowly rises to the top of the pile. End on a funny freeze-frame.',
    animationDesc:
      '24.2s cup shakes, 24.5s cup tips, 24.5-26.5s balls pour out in a growing avalanche, 26.5s he is buried, only beanie visible, 26.5-28.5s beanie rises slowly through the pile, 28.5-30.0s freeze-frame on beanie atop mountain of balls, angry vein appears at 29.0s.',
    soundDesc:
      'Cup rattle at 24.2s, avalanche rumble 24.5-27s, balls cascading 25-28s, soft beanie rise at 27.5s, freeze sting at 29.0s, silence to end.',
    captionText: 'HE WON… TOO MANY BALLS! 😂',
    punchline: 'The cup was a trap. He wanted one ball. He got them all.',
    characterAction: 'Watches cup shake, gets buried in balls, beanie rises, freezes with angry vein.',
    propAction: 'Cup tips, hundreds of balls spill, bury him, beanie surfaces.',
  },
];