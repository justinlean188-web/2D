import type { SceneDef } from '../types';

export const PLATE_SPIN_PROMPT = `THE IMPOSSIBLE PLATE SPIN -- 30-SECOND 2D STICKMAN SHORT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080x1920, 24 fps.

VISUAL STYLE:
Modern Pop flat 2D vector cartoon. Thick consistent black outlines, simple geometric shapes, bright solid colours, smooth readable action, exaggerated facial expressions. A bright circus-style arcade challenge booth with a large open performance area, red-and-cream striped canvas, gold marquee bulbs, purple side curtains and a wooden stage. One bold sign reads "SPIN 10 PLATES!". Ten thin vertical plate-spinning sticks are arranged in a wide crown around the performer. No gradients, no textures, no watermark, no logo.

CHARACTER (LOCKED):
Round white head, two small black oval eyes, thick black eyebrows, simple black mouth, red beanie with a red pompom, yellow short-sleeved shirt, blue trousers, black shoes, thin black limbs and black mitten hands. Identical proportions and colours in every shot. The beanie stays on until the final plate lands.

SHOT 1 (0-6s) -- THE CHALLENGE:
Wide shot of the circus booth. The stickman walks in, notices the "SPIN 10 PLATES!" sign, looks determined, takes a colourful plate from the stack in the crate, tosses it onto the nearest thin stick and sets it spinning. Caption: "CAN HE SPIN 10 PLATES?"

SHOT 2 (6-12s) -- THREE PLATES:
Medium shot. The first plate spins steadily. He takes a second and a third plate and places each one on its own separate stick. All three spin at once. He puts his hands on his hips and smiles with total confidence. Caption: "3 PLATES! EASY!"

SHOT 3 (12-18s) -- TEN PLATES:
Seven more plates are added one at a time, each thrown visibly from the crate to its own empty stick. Exactly ten separate plates spin at once around him. He uses both hands to keep them balanced, the whole row wobbles slightly but every plate keeps spinning. He becomes extremely proud. Caption: "10 PLATES! UNBELIEVABLE!"

SHOT 4 (18-24s) -- THE WOBBLE:
He raises both arms in triumph while all ten plates spin. The plate directly in front of him begins to wobble, tilts further and further, then slips off its stick and flies upward on a clearly visible curved path. He snaps his head up with wide eyes and watches it spin horizontally above his head. Caption: "UH-OH... LOOK OUT!"

SHOT 5 (24-30s) -- THE RECORD:
The flying plate drops onto his red beanie and keeps spinning like a tiny circus hat. He freezes, shocked, eyes looking straight up. The other nine plates keep spinning. He slowly raises one finger proudly. End on a close-up of the spinning plate on his beanie. Caption: "NEW WORLD RECORD?! 😂"

AUDIO:
Upbeat playful circus music, plate-spinning whirrs, light clinks, fast spinning effects, a suspenseful wobble, a flying-plate whistle, a gentle final clink and a funny ending sting. No dialogue, no voice-over.`;

export const PLATE_SPIN_SCENES: SceneDef[] = [
  {
    id: 1,
    name: 'Shot 1',
    title: 'The Challenge',
    timeRange: [0.0, 6.0] as [number, number],
    videoPrompt:
      'Wide view of a bright circus-style arcade challenge booth with red-and-cream striped canvas, gold marquee bulbs, purple side curtains, a wooden stage and ten thin vertical plate-spinning sticks arranged in a crown around the open performance area. A bold sign reads "SPIN 10 PLATES!". The stickman (red beanie, yellow shirt, blue trousers, black shoes) walks in, notices the sign, looks determined, picks a colourful plate from the stack in a wooden crate, tosses it onto the nearest stick and sets it spinning.',
    animationDesc:
      '0.0-1.7s he walks in from the left with a normal expression, 1.7-2.4s he stops and looks up at the sign with raised brows and an o-mouth, 2.4-3.2s he narrows his eyes and clenches his fists, 3.2-4.2s he reaches into the crate and takes the top plate, 4.2-4.9s he flicks the plate onto the near-right stick, 4.9-6.0s the plate spins and he grins at it.',
    soundDesc:
      'Circus score start, footsteps 0.2-1.6s, sign sparkle at 2.0s, determined sting at 2.6s, crate rattle at 3.6s, plate whoosh at 4.3s, light clink and spin whirr at 4.9s.',
    captionText: 'CAN HE SPIN 10 PLATES?',
    punchline: 'The booth is built for ten plates. He has never spun one.',
    characterAction: 'Walks in, notices the sign, takes a plate and tosses it onto the first stick.',
    propAction: 'The first plate lands on its stick and begins to spin; the stack in the crate shrinks.',
  },
  {
    id: 2,
    name: 'Shot 2',
    title: 'Three Plates',
    timeRange: [6.0, 12.0] as [number, number],
    videoPrompt:
      'Medium shot of the same circus booth. The first plate spins on its stick. The stickman takes a second plate from the crate, tosses it onto a separate empty stick, then does the same with a third plate. All three plates spin steadily. He puts his hands on his hips, tilts his head and gives a confident smirk at the camera.',
    animationDesc:
      '6.4-7.0s he grabs the next plate, 7.0-7.5s the second plate flies to the near-left stick, 8.6-9.1s he grabs the third plate, 9.1-9.8s it flies up to the top-left stick, 9.8-11.9s all three spin while he rests his hands on his hips with a proud smirk.',
    soundDesc:
      'Crate rattle at 6.4s, plate whoosh at 6.8s, clink at 7.0s, spin whirr; crate rattle at 8.6s, plate whoosh at 9.0s, clink at 9.2s, three-plate whirr at 9.8s, confident sting at 10.6s.',
    captionText: '3 PLATES! EASY!',
    punchline: 'Three is easy. Ten is the record.',
    characterAction: 'Adds two more plates, then poses with his hands on his hips.',
    propAction: 'Second and third plates each land on their own separate stick and spin.',
  },
  {
    id: 3,
    name: 'Shot 3',
    title: 'Ten Plates',
    timeRange: [12.0, 18.0] as [number, number],
    videoPrompt:
      'Same circus booth. The stickman rapidly adds seven more plates, one at a time, each one visibly thrown from the crate to its own empty stick. Exactly ten separate plates now spin at once around him. He uses both hands to keep them balanced. The row of plates wobbles slightly, but every plate keeps spinning. He beams with enormous pride.',
    animationDesc:
      '12.3-12.8s plate four, 12.8-13.3s plate five, 13.3-13.9s plate six, 13.9-14.4s plate seven, 14.4-15.0s plate eight, 15.0-15.5s plate nine, 15.5-16.0s plate ten; 16.0-16.8s he balances the whole row with both hands, 16.8-17.2s every plate wobbles, 17.2-18.0s he puffs his chest and grins.',
    soundDesc:
      'Seven quick crate rattles, plate whooshes and clinks from 12.3-16.0s, the ten-plate whirr rises, a tense wobble at 16.9s, relieved sparkle at 17.3s, proud sting at 17.6s.',
    captionText: '10 PLATES! UNBELIEVABLE!',
    punchline: 'Ten plates, ten sticks, one very proud stickman.',
    characterAction: 'Rapidly adds seven plates, balances the row with both hands and puffs out his chest.',
    propAction: 'Seven more plates each land on a separate empty stick; all ten spin together.',
  },
  {
    id: 4,
    name: 'Shot 4',
    title: 'The Wobble',
    timeRange: [18.0, 24.0] as [number, number],
    videoPrompt:
      'Same circus booth. The stickman raises both arms in triumph while all ten plates spin. The near-right plate, directly in front of him, begins to wobble. It tilts further and further, then slips off the top of its stick and flies upward on a clearly visible curved path. He snaps his head up with wide eyes and his mouth in a small o, watching the plate spin horizontally above his head. The other nine plates keep spinning.',
    animationDesc:
      '18.0-19.3s both arms shoot up in triumph, 19.4-20.2s the near-right plate starts to wobble and he glances at it, 20.2-21.05s the tilt grows while he reaches toward it, 21.05s it slips off the stick, 21.05-21.9s it climbs on a visible curved path, 21.9-23.4s it hovers and spins flat above his head while he stares straight up, 23.4-24.0s it starts to drop and he freezes.',
    soundDesc:
      'Victory fanfare at 18.2s, plate wobble creak from 19.5s, rising tension at 20.4s, slip pop at 21.05s, flying-plate whistle 21.1-23.3s, a hush at 23.4s.',
    captionText: 'UH-OH... LOOK OUT!',
    punchline: 'Nine plates are fine. The tenth has other plans.',
    characterAction: 'Raises both arms, spots the wobble, reaches for it, then stares straight up in wide-eyed shock.',
    propAction: 'The near-right plate tilts, slips off its stick and follows a curved path above his head.',
  },
  {
    id: 5,
    name: 'Shot 5',
    title: 'The Record',
    timeRange: [24.0, 30.0] as [number, number],
    videoPrompt:
      'Same circus booth. The flying plate drops onto the stickman\'s red beanie and keeps spinning like a tiny circus hat. He freezes, shocked, eyes looking straight upward. The other nine plates keep spinning around him. He slowly raises one finger proudly, then the camera pushes in on the spinning plate balanced on his beanie. Caption: "NEW WORLD RECORD?! 😂".',
    animationDesc:
      '24.0-24.5s the plate settles on the beanie, 24.5-26.0s he freezes with eyes rolled up and a flat mouth, 26.0-27.2s his right hand slowly rises with one finger up and a tiny smirk, 27.2-30.0s the camera pushes into a close-up of the spinning plate on the beanie while the other plates keep spinning behind him.',
    soundDesc:
      'Gentle plate clink at 24.3s, record scratch at 24.6s, tiny proud ding at 26.8s, soft sparkle at 27.6s, funny ending sting at 29.0s.',
    captionText: 'NEW WORLD RECORD?! 😂',
    punchline: 'The plate missed the floor and found the beanie.',
    characterAction: 'Freezes, looks straight up, slowly raises one proud finger while the plate spins on his beanie.',
    propAction: 'The fallen plate lands on the beanie and keeps spinning; the other nine plates stay spinning.',
  },
];
