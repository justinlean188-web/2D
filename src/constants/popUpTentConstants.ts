import type { SceneDef } from '../types';

export const POP_UP_TENT_PROMPT = `THE GIANT POP-UP TENT -- 30-SECOND 2D STICKMAN SHORT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080x1920, 24 fps.

VISUAL STYLE:
Modern Pop flat 2D vector cartoon. Thick smooth black outlines, bright saturated colours, clean geometric shapes, minimal shading, expressive cartoon faces, exaggerated physical comedy, smooth readable movement. No gradients, no textures, no watermark, no logo.

CHARACTER (LOCKED):
The exact same Angry Stickman in all five scenes. Large circular white head with a thick black outline, two small vertical black oval eyes, two thick expressive black eyebrows and one simple black mouth. No nose, no ears, no hair. Bright red knitted beanie with a rounded top and a clearly visible folded lower edge. Plain bright yellow short-sleeved T-shirt. Small compact torso. Thin black stick arms of consistent thickness, connected directly to the sleeves. Small white rounded mitten hands with black outlines, connected directly to the black wrists. Blue trousers, thin black legs and small rounded solid-black shoes. Head roughly 40% of his total height. Identical proportions, colours and outfit in every shot. The only intentional change is that the tiny tent knocks his beanie off in the final beat.

TENT (LOCKED):
One magic pop-up camping tent made of bright orange, turquoise and yellow fabric panels with thick black fabric outlines, flexible curved dark support poles and a small triangular entrance. The same tent appears in every shot. It must visibly unfold and stretch from a tiny folded package into a bedroom-sized tent and then into a giant tent that wraps around the whole house. It never teleports, never changes colour and never turns into a different object. A small red release button sits on the centre pole inside the giant tent.

ENVIRONMENT:
A cheerful colourful living room with warm cream walls, a wooden floor, a blue sofa, a small wooden table, a yellow standing lamp, a front door, a large window, a framed picture and a potted plant. Outside is a bright blue sky, flat white clouds and a green lawn. Keep the room, furniture and house design consistent.

SHOT 1 (0-6s) -- THE TINY TENT:
The living room. A tiny folded orange/turquoise pop-up tent package sits on the wooden floor. Stickman notices it, walks over, crouches and picks it up with both white mitten hands. He smiles confidently, holds it up, then throws it back down onto the floor. The camera pushes in on the little package. ON-SCREEN TEXT: "JUST A TINY TENT\u2026"

SHOT 2 (6-12s) -- TOO BIG!:
The package springs open with a loud POP. Its curved poles unfold and the orange/turquoise/yellow fabric expands continuously to bedroom size. The growing tent physically pushes the blue sofa backward against the wall. Stickman jumps away with wide eyes and both mitten hands raised. The tent keeps swelling while he stares at it. ON-SCREEN TEXT: "WAIT\u2026 THAT'S NOT NORMAL!"

SHOT 3 (12-18s) -- THE HOUSE DISAPPEARS:
The tent expands rapidly again. Its fabric stretches across the living room, bows the walls outward and pushes the ceiling and roof upward. It grows around the entire house. Wide exterior shot: the giant colourful tent completely covers the house, with the house door and window visible through its triangular entrance. Cut back inside to Stickman grabbing a flexible tent pole with both hands as the pole slides away and drags him sideways. ON-SCREEN TEXT: "IT ATE THE WHOLE HOUSE!"

SHOT 4 (18-24s) -- CAMPING DISASTER:
Inside the giant tent the living room has become an enormous colourful camping interior. Giant curved support poles rise overhead and the fabric walls glow orange, turquoise and yellow. Stickman pushes the elastic fabric ceiling upward with both mitten hands. The fabric bulges outward, snaps back and launches him backward. He flies through the air, lands on a huge turquoise sleeping bag, bounces once and sits up dizzy with spinning stars around his head. ON-SCREEN TEXT: "WELCOME TO MY NEW HOUSE?!"

SHOT 5 (24-30s) -- THE WORST CAMPING TRIP:
Stickman gets off the sleeping bag and notices a small red release button on the centre tent pole. He jumps up, grabs the button with both white mitten hands and presses it. The giant tent collapses inward in a rapid but readable sequence: the fabric folds, the curved poles retract and the whole tent shrinks back to its original tiny folded package. Stickman lands and stands proudly with his hands on his hips. The tiny package drops onto his head and knocks his red beanie off. He stares straight at the camera with an annoyed expression. ON-SCREEN TEXT: "NEVER GO CAMPING AGAIN!"

FINAL QUALITY RULES:
- Identical character design, colours and proportions in every scene. Never change the red beanie, yellow T-shirt, blue trousers or black shoes before the beanie is knocked off.
- Hands stay small white rounded mittens connected directly to thin black wrists. No detached hands, oversized gloves, fingers or extra limbs.
- The tent always keeps its orange, turquoise and yellow panels, black outlines, curved poles and triangular entrance.
- The tent expands through visible unfolding and elastic stretching, never by teleporting or changing shape.
- All objects move through visible physical motion. No unexplained cuts in object positions or sudden costume changes.
- Keep the room, furniture and prop positions consistent.
- No dialogue, no extra characters, no watermark, no logo, no gore.
- Vertical 9:16 composition with every caption inside the safe viewing area.

AUDIO:
Upbeat playful score, a big tent pop, fabric stretch and rustle layers, whooshes, elastic bounce, wooden creaks, a button click, a rapid collapse, the beanie whoosh and a freeze sting. No dialogue.`;

export const POP_UP_TENT_SCENES: SceneDef[] = [
  {
    id: 1,
    name: 'Shot 1',
    title: 'The Tiny Tent',
    timeRange: [0.0, 6.0] as [number, number],
    videoPrompt:
      'A colourful living room with a blue sofa, wooden table, yellow standing lamp, front door, large window, framed picture and potted plant. The stickman (red beanie, yellow short-sleeved shirt, blue trousers, black shoes, white mitten hands) notices a tiny folded orange/turquoise pop-up tent package on the wooden floor, crouches, picks it up with both hands, smiles confidently, then throws it back down. The camera pushes in on the package.',
    animationDesc:
      '0.0-0.9s he notices the package, 0.9-1.7s he walks over, 1.7-2.4s he crouches and grabs it with both hands, 2.4-3.3s he lifts it and straightens up, 3.3-4.1s he smiles proudly, 4.1-4.8s he throws it down, 4.8-5.6s it lands and settles, 5.6-6.0s it wiggles as the camera pushes in.',
    soundDesc:
      'Playful score starts, notice squeak at 0.7s, walk whoosh at 1.2s, pickup squeak at 2.2s, fabric rustle at 2.8s, proud sparkle at 3.5s, throw whoosh at 4.4s, package plop at 4.9s, wiggle squeak at 5.5s.',
    captionText: 'JUST A TINY TENT\u2026',
    punchline: 'One tiny package. What could possibly go wrong?',
    characterAction: 'Notices the package, crouches, picks it up with both hands, smiles and throws it down.',
    propAction: 'The tiny folded tent package sits on the floor, is lifted and dropped, then wiggles.',
  },
  {
    id: 2,
    name: 'Shot 2',
    title: 'Too Big!',
    timeRange: [6.0, 12.0] as [number, number],
    videoPrompt:
      'Same living room. The folded package springs open with a loud POP. Its curved poles unfold and the orange, turquoise and yellow fabric expands continuously to bedroom size. The growing tent pushes the blue sofa backward against the wall. The stickman jumps away with wide eyes and both mitten hands raised.',
    animationDesc:
      '6.0-6.2s the package bursts open, 6.2-7.0s the tent springs to waist height, 7.0-8.4s it swells to a small room tent, 8.4-9.6s it reaches bedroom size and shoves the sofa, 9.6-10.6s he lands from his jump with his hands up, 10.6-12.0s the tent keeps swelling while he stares.',
    soundDesc:
      'Big balloon pop at 6.0s, spring boing at 6.05s, fabric stretch at 6.4s, jump whoosh at 6.15s, sofa slide at 7.3s, elastic stretch at 8.2s, wooden creak at 9.0s, settle boing at 9.6s, shock squeak at 10.2s.',
    captionText: 'WAIT\u2026 THAT\'S NOT NORMAL!',
    punchline: 'The tent is bedroom-sized. The bedroom is not.',
    characterAction: 'Jumps away from the exploding package and stares with wide eyes and raised mitten hands.',
    propAction: 'The tent unfolds from the package and grows to bedroom size, pushing the sofa backward.',
  },
  {
    id: 3,
    name: 'Shot 3',
    title: 'The House Disappears',
    timeRange: [12.0, 18.0] as [number, number],
    videoPrompt:
      'The tent expands rapidly again. Its fabric stretches across the living room, bows the walls outward and pushes the ceiling and roof upward, then grows around the entire house. A wide exterior shot shows the giant colourful tent covering the house with the house door and window visible through its triangular entrance. Back inside, the stickman grabs a flexible tent pole with both hands as it slides away.',
    animationDesc:
      '12.0-12.8s the tent stretches across the room, 12.8-13.6s it bows the walls and lifts the roof, 13.6-14.8s the camera pulls back as it swallows the house, 14.8-15.8s the exterior wide shot holds, 15.8-16.0s cut back inside, 16.0-16.7s a giant pole slides past and he grabs it, 16.7-17.5s it drags him sideways, 17.5-18.0s he lets go and stumbles.',
    soundDesc:
      'Fabric stretch at 12.2s, wooden creak at 12.7s, wall rumble at 13.2s, big inflate at 14.0s, roof creak at 14.7s, deep rumble at 15.2s, pole slide whoosh at 16.2s, grab squeak at 16.6s, drag whoosh at 17.0s, stumble impact at 17.5s.',
    captionText: 'IT ATE THE WHOLE HOUSE!',
    punchline: 'The house is no longer outside the tent.',
    characterAction: 'Backs away as the room is swallowed, then grabs a sliding pole and is dragged sideways.',
    propAction: 'The tent bows the walls, lifts the roof, encloses the whole house and its pole slides away.',
  },
  {
    id: 4,
    name: 'Shot 4',
    title: 'Camping Disaster',
    timeRange: [18.0, 24.0] as [number, number],
    videoPrompt:
      'Inside the giant tent, the living room has become an enormous colourful camping interior. Giant curved support poles rise overhead, with orange, turquoise and yellow fabric panels and a huge turquoise sleeping bag on the ground. The stickman pushes the elastic fabric ceiling upward with both mitten hands; it bulges, snaps back and launches him backward. He lands on the sleeping bag, bounces once and sits up dizzy with spinning stars around his head.',
    animationDesc:
      '18.0-18.6s he looks up at the giant fabric, 18.6-19.0s he crouches and raises both hands, 19.0-19.7s he pushes the fabric upward and it bulges, 19.7-20.0s the fabric snaps back, 20.0-20.6s he flies backward, 20.6s he lands on the sleeping bag, 20.6-21.1s he bounces once and settles, 21.1-24.0s he sits dizzy with spinning stars.',
    soundDesc:
      'Fabric ripple at 18.4s, elastic push at 19.0s, tension creak at 19.5s, snap boing at 19.95s, launch whoosh at 20.1s, bag landing at 20.6s, bounce boing at 20.85s, settle puff at 21.1s, dizzy boing at 22.0s.',
    captionText: 'WELCOME TO MY NEW HOUSE?!',
    punchline: 'It is roomy. It is also not a house.',
    characterAction: 'Pushes the fabric ceiling, is launched backward, lands on the sleeping bag and sits up dizzy.',
    propAction: 'The giant tent fabric bulges and snaps back; the sleeping bag catches him.',
  },
  {
    id: 5,
    name: 'Shot 5',
    title: 'The Worst Camping Trip',
    timeRange: [24.0, 30.0] as [number, number],
    videoPrompt:
      'Inside the giant tent, the stickman gets off the sleeping bag and notices a small red release button on the centre tent pole. He jumps up, grabs it with both mitten hands and presses it. The giant tent collapses inward in a rapid readable sequence: fabric folds, curved poles retract and the whole tent shrinks back to its original tiny folded package. He stands proudly, then the tiny package drops onto his head and knocks off his red beanie. He stares at the camera with an annoyed expression.',
    animationDesc:
      '24.0-24.4s he gets off the sleeping bag, 24.4-24.8s he notices the red button, 24.8-25.2s he walks under it, 25.2-25.6s he jumps and grabs it, 25.6-26.0s he presses it, 26.0-27.0s the tent collapses inward to a tiny package, 27.0-27.9s he stands proudly with his hands on his hips, 27.9-28.3s the package drops on his head and knocks off his beanie, 28.3-30.0s he stares at the camera, annoyed.',
    soundDesc:
      'Get-up whoosh at 24.1s, notice squeak at 24.6s, walk whoosh at 24.9s, jump boing at 25.4s, button click at 25.9s, collapse air release at 26.05s, fabric fold at 26.2s, pole retract creak at 26.45s, collapse impact at 26.75s, proud fanfare at 27.5s, package drop whoosh at 28.0s, head bonk at 28.25s, beanie whoosh at 28.35s, freeze sting at 29.5s.',
    captionText: 'NEVER GO CAMPING AGAIN!',
    punchline: 'The tent is tiny again. The grudge is not.',
    characterAction: 'Gets up, jumps, presses the release button, lands proudly, then gets a tent dropped on his head.',
    propAction: 'The giant tent collapses to the tiny package, which falls onto his head and knocks off the beanie.',
  },
];
