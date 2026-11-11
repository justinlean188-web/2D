import type { SceneDef } from '../types';

export const MAGIC_PAINTBRUSH_PROMPT = `THE MAGIC PAINTBRUSH -- 30-SECOND 2D STICKMAN SHORT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080x1920, 24 fps.

VISUAL STYLE:
Modern Pop flat 2D vector cartoon. Thick smooth black outlines, bright saturated colours, clean geometric shapes, expressive cartoon faces, magical rainbow paint effects with glowing particles, a colourful tidy bedroom, smooth animation and exaggerated physical comedy. No gradients, no textures, no watermark, no logo.

CHARACTER (LOCKED):
The exact same Angry Stickman in all five scenes. Large circular white head with a thick black outline, two small vertical black oval eyes, two thick expressive black eyebrows, one simple black mouth. No nose, no ears, no hair. Bright red knitted beanie with a rounded top and clearly visible folded lower edge. Plain bright yellow short-sleeved T-shirt. Thin black stick arms connected directly to the sleeves. Small white rounded mitten hands with black outlines, connected directly to the black wrists. Blue trousers and small rounded solid-black shoes. Head roughly 40% of total height. Identical proportions, colours and outfit in every shot, never a different character.

PROP (LOCKED):
One magical paintbrush with a brown wooden handle, a golden metal ferrule, a large pointed brush tip and glowing rainbow-coloured paint at the tip. Anything Stickman completely draws becomes real. Drawings visibly form before transforming into real objects. Keep the paintbrush design consistent in every scene.

MONSTER (LOCKED):
One purple monster: large round purple body, two small curved purple horns, two enormous white eyes with black pupils, a wide friendly mouth with small rounded white teeth, two short purple arms, two short purple legs and large rounded feet. Cute and silly rather than scary. Identical design in every scene.

SHOT 1 (0-6s) -- THE MAGIC DISCOVERY:
Colourful bedroom with a wooden desk, bookshelf, bed, window and a small old wooden box on the desk. Stickman notices the box and opens it. Inside is a magical paintbrush glowing with rainbow light. He picks it up with both mitten hands. He draws a simple red apple outline in the air; the outline glows, fills with red and transforms into a real shiny red apple. The apple drops into his hands. Stickman looks at it in disbelief. ON-SCREEN TEXT: "WAIT… IT'S REAL?!"

SHOT 2 (6-12s) -- CREATING ANYTHING:
Stickman becomes excited. He draws a golden staircase on the bedroom floor. First a glowing golden outline appears, then it fills with solid gold and transforms into a real staircase. He smiles proudly. Next he draws a giant birthday cake beside the staircase with colourful frosting, candles and several layers. He celebrates with both arms raised. ON-SCREEN TEXT: "I CAN CREATE ANYTHING!"

SHOT 3 (12-18s) -- THE TERRIBLE DRAWING:
Stickman becomes overconfident. He stands before an empty wall and draws a giant purple monster using the magical paintbrush. He draws the round body, two curved horns, enormous eyes, short arms and short legs. The completed outline glows purple. Suddenly it shakes and the monster pushes its head out of the drawing, then jumps forward into the bedroom and lands on the floor with a soft cartoon bounce. Stickman freezes in shock. ON-SCREEN TEXT: "UH… THAT'S NOT GOOD!"

SHOT 4 (18-24s) -- THE MONSTER CHASE:
The purple monster happily chases Stickman around the bedroom. Stickman runs past the desk, then around the giant birthday cake. The monster follows with bouncy footsteps and accidentally bumps into the cake, which falls sideways with frosting splattering across the floor. Stickman reaches the golden staircase and runs up a few steps. He turns, raises the paintbrush and quickly draws a giant cage outline between himself and the monster. The cage outline glows, preparing to become real. ON-SCREEN TEXT: "SOMEBODY STOP IT!"

SHOT 5 (24-30s) -- THE FINAL MISTAKE:
The glowing cage becomes a real large metal cage — but Stickman drew it around both himself and the monster! The cage appears around them together. Stickman looks left and right, realising he is trapped too. The monster sits happily inside, waves and smiles. Stickman looks at the camera with drooping eyebrows and a disappointed mouth. The monster notices the magical paintbrush lying on the floor inside the cage, picks it up with one short purple arm and draws a tiny Stickman on the cage wall. The tiny drawing glows and becomes a miniature living Stickman that waves happily. The original Stickman stares at the tiny copy in disbelief. End on a funny freeze-frame. ON-SCREEN TEXT: "I CREATED MY OWN PROBLEM!"

FINAL QUALITY RULES:
- Identical character design, colours and proportions in every scene. Never change the red beanie, yellow T-shirt, blue trousers or black shoes.
- Hands must stay small white rounded mittens connected directly to thin black wrists. No detached hands, oversized gloves, separate fingers or mismatched sleeves.
- The paintbrush always has the brown handle, gold ferrule and rainbow-glowing tip.
- Drawings must visibly form before transforming into real objects; objects appear at the exact location of their completed drawings.
- Keep the bedroom layout and prop positions consistent.
- No dialogue, no watermark, no gore or graphic violence.
- Vertical 9:16 composition with all captions inside the safe viewing area.

AUDIO:
Upbeat playful score, magical sparkle sounds, paintbrush swishes, transformation effects, monster footsteps, cartoon running sounds and funny impact effects. No dialogue.`;

export const MAGIC_PAINTBRUSH_SCENES: SceneDef[] = [
  {
    id: 1,
    name: 'Shot 1',
    title: 'The Magic Discovery',
    timeRange: [0.0, 6.0] as [number, number],
    videoPrompt:
      'A colourful bedroom with a wooden desk, bookshelf, bed, window and a small old wooden box on the desk. Stickman (red beanie, yellow short-sleeved shirt, blue trousers, black shoes, white mitten hands) notices the box, opens it to reveal a magical paintbrush glowing with rainbow light, picks it up with both hands, draws a red apple outline in the air that glows and becomes a real shiny apple which drops into his hands.',
    animationDesc:
      '0.0-1.2s he walks to the desk and notices the box, 1.2-2.2s he opens the box and sees the glowing brush, 2.2-3.2s he picks up the brush with both mitten hands, 3.2-4.2s he draws a red apple outline in the air, 4.2-5.0s the outline glows and becomes a real apple, 5.0-6.0s he holds the apple in disbelief.',
    soundDesc:
      'Playful score starts, box creak at 1.3s, magical shimmer at 2.0s, brush pickup at 2.4s, paint swish at 3.3s, sparkle chime at 4.3s, apple drop at 4.9s, surprised boing at 5.4s.',
    captionText: 'WAIT\u2026 IT\u2019S REAL?!',
    punchline: 'A magic paintbrush that makes drawings real.',
    characterAction: 'Opens the box, picks up the brush, draws the apple, catches it in disbelief.',
    propAction: 'The brush glows rainbow; a drawn apple becomes a real apple.',
  },
  {
    id: 2,
    name: 'Shot 2',
    title: 'I Can Create Anything!',
    timeRange: [6.0, 12.0] as [number, number],
    videoPrompt:
      'Same colourful bedroom. Stickman draws a golden staircase on the floor; a glowing golden outline forms then becomes a real staircase. He smiles proudly, then draws a giant birthday cake beside the staircase with colourful frosting, candles and several layers. He celebrates with both arms raised.',
    animationDesc:
      '6.0-6.8s he aims the brush at the floor, 6.8-7.9s a golden staircase outline forms and becomes real, 7.9-8.6s he smiles and raises the brush, 8.6-9.8s he draws a birthday cake outline beside the stairs, 9.8-10.8s the cake fills with colour and becomes real, 10.8-12.0s he celebrates with both arms up.',
    soundDesc:
      'Paint swish at 6.1s, staircase outline chime at 6.9s, transformation ding at 7.6s, proud fanfare at 8.2s, cake outline swish at 9.0s, cake transform at 10.0s, celebration fanfare at 10.7s.',
    captionText: 'I CAN CREATE ANYTHING!',
    punchline: 'One brush, endless creations.',
    characterAction: 'Draws a golden staircase and a birthday cake, then celebrates triumphantly.',
    propAction: 'The staircase and cake materialize from their glowing outlines.',
  },
  {
    id: 3,
    name: 'Shot 3',
    title: 'The Terrible Drawing',
    timeRange: [12.0, 18.0] as [number, number],
    videoPrompt:
      'Stickman stands before an empty wall and draws a giant purple monster: round body, two curved horns, enormous eyes, short arms and short legs. The outline glows purple, shakes and the monster pushes its head out, jumps into the bedroom and lands with a soft bounce. Stickman freezes in shock.',
    animationDesc:
      '12.0-12.6s he faces the empty wall, 12.6-14.2s he draws the monster outline glowng purple, 14.2-15.0s the drawing shakes, 15.0-15.7s the monster pushes its head out, 15.7-16.5s the monster jumps out and bounces on the floor, 16.5-18.0s Stickman freezes in shock.',
    soundDesc:
      'Monster outline swish at 12.8s, purple glow hum at 13.6s, drawing shake rumble at 14.4s, monster head pop at 15.2s, monster bounce at 15.9s, stickman shock boing at 16.8s.',
    captionText: 'UH\u2026 THAT\u2019S NOT GOOD!',
    punchline: 'He brought a monster to life.',
    characterAction: 'Draws the monster, watches it come alive, freezes in shock.',
    propAction: 'The purple monster materializes from the wall drawing.',
  },
  {
    id: 4,
    name: 'Shot 4',
    title: 'The Monster Chase',
    timeRange: [18.0, 24.0] as [number, number],
    videoPrompt:
      'The purple monster chases Stickman around the bedroom. Stickman runs past the desk, then around the giant birthday cake. The monster follows with bouncy footsteps, bumps into the cake which falls sideways with frosting splattering, then Stickman runs up the golden staircase and draws a giant cage outline between himself and the monster.',
    animationDesc:
      '18.0-19.0s the chase begins, Stickman runs past the desk, 19.0-20.0s he runs around the cake, 20.0-20.7s the monster bumps the cake and frosting splatters, 20.7-21.8s Stickman runs up the staircase, 21.8-22.6s he turns and draws a giant cage outline, 22.6-24.0s the cage outline glows.',
    soundDesc:
      'Monster footsteps at 18.3s and 19.1s, cartoon running at 19.6s, cake bump at 20.3s, frosting splat at 20.5s, staircase thumps at 21.1s, cage swish at 22.0s, cage glow hum at 23.0s.',
    captionText: 'SOMEBODY STOP IT!',
    punchline: 'The chase leads straight into a trap.',
    characterAction: 'Runs from the monster, climbs the stairs, draws a cage.',
    propAction: 'The cake falls and splatters; the cage outline forms between them.',
  },
  {
    id: 5,
    name: 'Shot 5',
    title: 'The Final Mistake',
    timeRange: [24.0, 30.0] as [number, number],
    videoPrompt:
      'The cage becomes real around both Stickman and the monster. Stickman realises he is trapped too. The monster sits happily, waves and smiles. Stickman looks at the camera disappointed. The monster picks up the paintbrush from the cage floor and draws a tiny Stickman on the cage wall, which becomes a miniature living Stickman waving happily.',
    animationDesc:
      '24.0-24.8s the cage appears around both of them, 24.8-25.6s Stickman looks left and right in realisation, 25.6-26.4s the monster waves happily, 26.4-27.2s Stickman looks at the camera disappointed, 27.2-28.0s the monster picks up the brush, 28.0-29.2s the monster draws a tiny Stickman on the cage wall, 29.2-30.0s the tiny Stickman waves and the frame freezes.',
    soundDesc:
      'Cage slam at 24.1s, realisation boing at 25.2s, monster wave chime at 25.9s, disappointed trombone at 26.7s, brush pickup at 27.4s, tiny draw swish at 28.3s, tiny transformation ding at 28.9s, freeze sting at 29.6s.',
    captionText: 'I CREATED MY OWN PROBLEM!',
    punchline: 'He trapped himself along with the monster.',
    characterAction: 'Realises he is caged too, looks disappointed, watches the monster draw a tiny copy.',
    propAction: 'The cage surrounds both; the tiny Stickman materializes on the cage wall.',
  },
];
