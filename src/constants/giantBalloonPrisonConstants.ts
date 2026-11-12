import type { SceneDef } from '../types';

export const GIANT_BALLOON_PRISON_PROMPT = `THE GIANT BALLOON PRISON -- 30-SECOND 2D STICKMAN SHORT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080x1920, 24 fps.

VISUAL STYLE:
Modern Pop flat 2D vector cartoon. Thick smooth black outlines, bright saturated colours, clean geometric shapes, minimal shading, expressive cartoon faces, exaggerated physical comedy, smooth readable movement. No gradients, no textures, no watermark, no logo.

CHARACTER (LOCKED):
The exact same Angry Stickman in all five scenes. Large circular white head with a thick black outline, two small vertical black oval eyes, two thick expressive black eyebrows and one simple black mouth. No nose, no ears, no hair. Bright red knitted beanie with a rounded top and a clearly visible folded lower edge. Plain bright yellow short-sleeved T-shirt. Small compact torso. Thin black stick arms of consistent thickness, connected directly to the sleeves. Small white rounded mitten hands with black outlines, connected directly to the black wrists. Blue trousers, thin black legs and small rounded solid-black shoes. Head roughly 40% of his total height. Identical proportions, colours and outfit in every shot. The only intentional change is that the balloon pulls his beanie off in the final beat.

BALLOON (LOCKED):
One huge round balloon made of glossy bright red material with a thick dark-red outline. The surface is slightly transparent so the house and the stickman can still be seen inside it. A small tied neck and knot hang at its bottom. Two tiny cartoon eyes and a mischievous smiling mouth appear on the balloon surface once it becomes enormous. The balloon expands smoothly while keeping its round shape and never changes colour or tears.

ENVIRONMENT:
A cheerful small suburban house with a colourful living room: blue sofa, wooden table, standing lamp, front door, large windows, simple roof and chimney, bright green lawn and blue sky outside. Keep the house design and furniture consistent.

SHOT 1 (0-6s) -- THE TINY BALLOON:
The living room. Stickman discovers a tiny red balloon on the wooden table, picks it up with one mitten hand and finds a small hand pump beside it. He connects the pump nozzle to the balloon opening and presses the pump several times. The balloon grows from tennis-ball size to beach-ball size. He smiles proudly and raises his eyebrows. ON-SCREEN TEXT: "HOW BIG CAN THIS GET?"

SHOT 2 (6-12s) -- TOO MUCH AIR:
The same glossy red balloon grows from beach-ball size to nearly filling the entire living room. It pushes the blue sofa sideways, tips the standing lamp over gently and slides the wooden table toward the wall. Stickman becomes frightened and tries to pull the pump nozzle out, but the balloon keeps inflating by itself. It presses him gently against the wall. His eyes widen. ON-SCREEN TEXT: "WAIT\u2026 STOP!"

SHOT 3 (12-18s) -- THE HOUSE GETS TRAPPED:
The balloon expands upward through the open ceiling and pushes the roof upward. It keeps growing until its enormous round body surrounds the entire house. Wide exterior view: the complete house, including roof, walls, windows and chimney, is visible inside the giant transparent red balloon shell. The tied neck and knot dangle in the open front doorway. Two tiny mischievous eyes and a smiling mouth appear on the balloon. Stickman looks through the living-room window, sees the balloon around his whole house and freezes in disbelief. ON-SCREEN TEXT: "IT'S BIGGER THAN MY HOUSE!"

SHOT 4 (18-24s) -- THE BALLOON PRISON:
The house stays completely enclosed inside the enormous glossy red transparent balloon. The balloon slowly lifts the house a short distance above the green lawn. Inside, Stickman runs to the front door and pulls it open. The stretched red balloon surface is immediately outside the doorway with no open path. He angrily punches it with both mitten hands. The elastic surface stretches inward, springs back and gently bounces him backward. He lands on the blue sofa, dizzy and frustrated. ON-SCREEN TEXT: "LET ME OUT!"

SHOT 5 (24-30s) -- THE WORST ESCAPE:
The giant red balloon still surrounds the floating house, its tied neck and knot dangling in the open front doorway. Stickman runs to the front door, notices the knot, reaches outside and grabs the hanging knot with both white mitten hands. He pulls it loose. Air blasts downward from the balloon neck and the house descends slowly, landing safely back on the green lawn. Stickman celebrates inside the house with both hands raised. But the deflating balloon suddenly shoots upward like a rocket. The strong airflow blows his red beanie off his head and sends it flying upward after the balloon. He looks up with wide eyes and an open mouth, reaching desperately for his disappearing beanie. End on a close-up of his completely bald white circular head and furious expression. ON-SCREEN TEXT: "MY HAT!!!"

FINAL QUALITY RULES:
- Identical character design, colours and proportions in every scene. Never change the red beanie, yellow T-shirt, blue trousers or black shoes before the final beat.
- Hands stay small white rounded mittens connected directly to thin black wrists. No detached hands, oversized gloves, fingers or extra limbs.
- The balloon always stays the same glossy bright red with a tied neck, and grows smoothly, never jumping in size.
- The balloon is transparent enough to show the house inside it.
- Keep the house design, furniture and prop positions consistent.
- The balloon's knot dangles in the open front doorway before Stickman reaches for it.
- The house descends safely before the balloon shoots upward.
- The beanie only flies away because of the escaping airflow.
- No dialogue, no watermark, no gore or graphic violence.
- Vertical 9:16 composition with every caption inside the safe viewing area.

AUDIO:
Upbeat playful score, hand-pump squeaks, balloon stretch and inflate sounds, elastic bounce, wooden creaks, whooshes, a rocket launch and a freeze sting. No dialogue.`;

export const GIANT_BALLOON_PRISON_SCENES: SceneDef[] = [
  {
    id: 1,
    name: 'Shot 1',
    title: 'The Tiny Balloon',
    timeRange: [0.0, 6.0] as [number, number],
    videoPrompt:
      'A colourful living room with a blue sofa, wooden table, standing lamp, front door and large window. The stickman (red beanie, yellow short-sleeved shirt, blue trousers, black shoes, white mitten hands) discovers a tiny red balloon on the wooden table, picks it up with one mitten hand, finds a small hand pump beside it, connects the nozzle and presses the pump several times. The balloon grows from tennis-ball size to beach-ball size. He smiles proudly.',
    animationDesc:
      '0.0-0.9s he notices the tiny balloon on the table, 0.9-1.6s he walks over and reaches for it, 1.6-2.2s he lifts it with one mitten hand, 2.2-2.9s he spots the hand pump, 2.9-3.5s he connects the nozzle, 3.5-5.1s he presses the pump four times and the balloon grows, 5.1-6.0s he smiles proudly with raised eyebrows.',
    soundDesc:
      'Playful score starts, balloon squeak at 1.7s, pump click at 3.0s, pump squeaks at 3.5s / 3.9s / 4.3s / 4.7s, balloon inflate at 5.0s, proud sparkle at 5.5s.',
    captionText: 'HOW BIG CAN THIS GET?',
    punchline: 'One tiny balloon, one very big idea.',
    characterAction: 'Finds the balloon, picks it up, connects the pump and inflates it, then admires his work.',
    propAction: 'The balloon grows from tennis-ball size to beach-ball size on the table.',
  },
  {
    id: 2,
    name: 'Shot 2',
    title: 'Too Much Air',
    timeRange: [6.0, 12.0] as [number, number],
    videoPrompt:
      'Same living room. The glossy red balloon grows from beach-ball size to nearly filling the room. It pushes the blue sofa sideways, tips the standing lamp over gently and slides the wooden table toward the wall. The stickman panics and tries to pull the pump nozzle out, but the balloon keeps inflating by itself and presses him gently against the wall.',
    animationDesc:
      '6.0-7.4s the balloon swells and fills the room, 7.4-8.4s the sofa slides sideways, 8.4-9.4s the lamp tips and the table slides, 9.4-10.4s he pulls at the nozzle in panic, 10.4-11.2s the balloon presses him against the wall, 11.2-12.0s his eyes widen in panic.',
    soundDesc:
      'Balloon stretch at 6.2s, sofa whoosh at 7.6s, table whoosh at 8.6s, lamp squeak at 9.4s, balloon press at 10.2s, panicked squeak at 10.9s.',
    captionText: 'WAIT\u2026 STOP!',
    punchline: 'The pump has stopped. The balloon has not.',
    characterAction: 'Tries to pull the nozzle out, then gets pressed gently against the wall with wide eyes.',
    propAction: 'The sofa slides, the lamp tips and the table slides as the balloon fills the room.',
  },
  {
    id: 3,
    name: 'Shot 3',
    title: 'The House Gets Trapped',
    timeRange: [12.0, 18.0] as [number, number],
    videoPrompt:
      'The red balloon expands upward through the open ceiling and pushes the roof upward. It keeps growing until its enormous round body surrounds the entire house. A wide exterior view shows the complete house, roof, walls, windows and chimney inside the giant transparent red balloon shell, with the tied neck and knot dangling in the open front doorway. Tiny mischievous eyes and a smiling mouth appear on the balloon. The stickman looks through the living-room window and freezes in disbelief.',
    animationDesc:
      '12.0-13.4s the balloon swells through the ceiling, 13.4-14.4s it pushes the roof upward, 14.4-15.6s the camera pulls back to reveal the house inside the balloon, 15.6-16.6s the balloon face appears, 16.6-17.4s the stickman reaches the window, 17.4-18.0s he freezes in disbelief.',
    soundDesc:
      'Balloon stretch at 12.2s, wooden creak at 13.5s, big inflate at 14.5s, magical shimmer at 15.8s, shock boing at 16.9s, dramatic rumble at 17.2s.',
    captionText: "IT'S BIGGER THAN MY HOUSE!",
    punchline: 'The balloon is no longer indoors. The house is now indoors.',
    characterAction: 'Watches the balloon burst through the ceiling, runs to the window and freezes.',
    propAction: 'The roof lifts, the balloon encloses the whole house and grows a mischievous face.',
  },
  {
    id: 4,
    name: 'Shot 4',
    title: 'The Balloon Prison',
    timeRange: [18.0, 24.0] as [number, number],
    videoPrompt:
      'The house stays completely enclosed inside the enormous glossy red transparent balloon. The balloon slowly lifts the house above the green lawn. Inside, the stickman runs to the front door and pulls it open. The stretched red balloon surface is immediately outside the doorway with no open path. He angrily punches it with both mitten hands. The elastic surface stretches inward, springs back and bounces him backward onto the blue sofa, dizzy and frustrated.',
    animationDesc:
      '18.0-19.2s the balloon lifts the house off the lawn, 19.2-20.2s he runs to the front door, 20.2-20.8s he pulls the door open, 20.8-21.4s he sees the balloon surface and gets angry, 21.4-22.0s he punches with both hands, 22.0-22.6s the surface stretches and springs back, 22.6-23.4s he flies backward and lands on the sofa, 23.4-24.0s he lies there dizzy.',
    soundDesc:
      'House lift rumble at 18.8s, cartoon run at 19.6s, door squeak at 20.4s, angry sting at 21.4s, punch impact at 22.0s, elastic stretch at 22.3s, spring boing at 22.6s, sofa landing at 23.4s.',
    captionText: 'LET ME OUT!',
    punchline: 'There is a door. There is no way out.',
    characterAction: 'Runs to the door, opens it, punches the balloon surface and is bounced onto the sofa.',
    propAction: 'The house floats above the lawn; the door opens onto the balloon surface.',
  },
  {
    id: 5,
    name: 'Shot 5',
    title: 'The Worst Escape',
    timeRange: [24.0, 30.0] as [number, number],
    videoPrompt:
      'The giant red balloon still surrounds the floating house with its tied neck and knot dangling in the open front doorway. The stickman runs to the front door, notices the knot, reaches outside and grabs the knot with both white mitten hands. He pulls it loose. Air blasts downward and the house descends slowly, landing safely on the green lawn. He celebrates with both hands raised. The deflating balloon suddenly shoots upward like a rocket and the airflow blows his red beanie off. He looks up with wide eyes, reaching for it. End on a close-up of his bald white head and furious expression.',
    animationDesc:
      '24.0-24.6s he runs to the open front door and notices the knot, 24.6-25.1s he leans out and reaches down, 25.1-25.6s he grabs the knot with both hands, 25.6-26.1s he pulls it loose, 26.1-27.1s air blasts down and the house descends, 27.1-27.7s he celebrates with both hands up, 27.7-28.6s the balloon rockets upward and blows his beanie off, 28.6-30.0s close-up of his bald head and furious face.',
    soundDesc:
      'Footsteps at 24.3s, reach whoosh at 25.2s, balloon squeak at 25.7s, knot pop at 26.1s, air blast at 26.3s, house landing thud at 27.1s, victory fanfare at 27.6s, rocket launch at 28.0s, beanie whoosh at 28.4s, freeze sting at 29.5s.',
    captionText: 'MY HAT!!!',
    punchline: 'The house is saved. The hat is not.',
    characterAction: 'Runs to the door, reaches out, pulls the knot, celebrates the landing, then loses his beanie.',
    propAction: 'The knot pops, the house descends, the balloon rockets away and the beanie flies upward.',
  },
];
