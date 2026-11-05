import type { SceneDef } from '../types';

export const YO_BANDIT_PROMPT = `THE RUBBER BAND TRICKSHOT -- 30-SECOND 2D STICKMAN SHORT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080x1920, 24 fps.

VISUAL STYLE:
Modern Pop flat 2D vector cartoon. Thick consistent black outlines, simple geometric shapes, bright solid colours, smooth readable action, exaggerated facial expressions. Vertical 9:16 indoor/outdoor trickshot comedy with a wooden table, a small cardboard launcher with an elastic rubber band, a small crumpled white paper ball, a dark-blue trash bin with an open top, and a few additional small white paper balls hidden inside the bin for the final joke. No gradients, no textures, no watermark, no logo.

CHARACTER (LOCKED):
The exact same Angry Stickman in all five scenes. Large round white head with a thick black outline, two small black oval eyes, thick expressive black eyebrows, a small expressive black mouth, a bright red beanie, a bright yellow short-sleeved T-shirt, thin black stick arms and legs, blue trousers and solid black shoes. White mitten-shaped hands with thick black outlines and a visible thumb on each hand, connected naturally to the black wrists. Identical head size, body proportions, outfit and facial design in every shot. No detached or floating hands, no extra fingers, no colour changes.

OBJECTS:
One small cardboard rubber-band launcher with a simple rectangular frame.
One elastic rubber band stretched across the launcher.
One small crumpled white paper ball.
One medium-sized dark-blue trash bin with an open top.
A few additional small white paper balls hidden inside the bin for the final joke.

SHOT 1 (0-5s) -- THE IMPOSSIBLE TARGET:
Stickman stands behind a wooden table facing a trash bin far across the room. His red beanie sits firmly on his head. He wears his yellow short-sleeved shirt, blue trousers, and black shoes. His eyebrows are lowered in a confident expression. His eyes focus directly on the distant trash bin. His right arm bends forward toward the tabletop, with his right small rounded white hand resting beside the cardboard launcher. His left arm bends at the elbow, and his left hand points toward the distant trash bin. He leans slightly forward with a confident grin. The cardboard launcher sits on the table with the small crumpled white paper ball held inside the stretched elastic rubber band. Show a close-up of the paper ball and the launcher, then show the trash bin far across the room. ON-SCREEN TEXT: "IMPOSSIBLE RUBBER BAND SHOT!" SOUND: A short dramatic challenge sound.

SHOT 2 -- TOO HIGH! (5-11s):
Stickman stands behind the table. His right hand carefully holds the launcher steady. His left hand pulls the elastic rubber band backward while keeping the crumpled paper ball securely in position. Show the paper ball being held securely before release. He releases the elastic band. The paper ball flies in a high curved arc across the room. It passes clearly above the open trash bin and hits the wall behind it. Stickman's eyes widen. His eyebrows rise. His mouth opens slightly. He slowly lowers his hands and gives the launcher an annoyed look. ON-SCREEN TEXT: "WAY TOO HIGH!" CAMERA: Show the complete paper-ball flight path. Cut to Stickman's disappointed facial expression.

SHOT 3 -- TOO LOW! (11-17s):
Stickman adjusts the angle of the cardboard launcher. His right hand holds the launcher frame steady against the table. His left hand pulls the elastic rubber band backward, with the crumpled paper ball visibly secured in place. He releases it again. This time, the paper ball flies too low. It hits the floor before reaching the trash bin, bounces twice, and rolls underneath the bin. Stickman leans forward with his upper body bent. His right hand rests on his knee while his left hand points toward the crumpled paper ball underneath the bin. His face shows frustration. ON-SCREEN TEXT: "NOW IT'S TOO LOW!" CAMERA: Use a low camera angle to show the paper ball hitting the floor and rolling under the bin. Finish with Stickman's frustrated expression.

SHOT 4 -- PERFECT SHOT! (17-24s):
Stickman stands behind the table with both feet firmly planted. His right hand holds the launcher frame steady. His left hand carefully pulls the elastic rubber band backward. He adjusts the launcher angle slightly upward. He pauses, concentrates, and releases. Show the crumpled paper ball flying through the air in a smooth, clear curved trajectory. The ball approaches the trash bin, touches the front edge of its rim, bounces slightly upward, and drops directly into the open bin. Show the ball visibly falling inside the bin. Stickman's eyes widen with excitement. His mouth opens into a huge smile. He raises both arms above his head and jumps in celebration. ON-SCREEN TEXT: "PERFECT SHOT!!!" SOUND: A satisfying success sound followed by energetic celebration music.

SHOT 5 -- THE BIN'S REVENGE! (24-30s):
Stickman celebrates beside the table. Both arms are raised high. His body leans backward slightly with pride. The trash bin begins wobbling because the crumpled paper ball lands inside and pushes against the other paper balls. The bin slowly tilts toward Stickman. Stickman notices the movement. His eyebrows shoot upward. His eyes become huge. His mouth opens in shock. He tries to step backward, but the bin tips over and rolls toward him. The bin lands over his head like a giant helmet. Several crumpled paper balls spill out around his shoes. His arms hang down helplessly. His legs remain visible. His red beanie is no longer visible because the bin covers his head. End with Stickman frozen in embarrassment while crumpled paper balls roll across the floor. ON-SCREEN TEXT: "THE BIN GOT REVENGE! 😂" SOUND: A funny wobbling sound, a cartoon bonk, and a comedic ending sound.

FINAL QUALITY RULES:
- Identical character appearance in all scenes. Never change his clothes, colours, head shape or body proportions.
- Both hands stay connected to the arms at all times and keep consistent white mitten shapes with black outlines and visible thumbs.
- Show believable hand positions when holding or pulling the cardboard launcher.
- The elastic rubber band must remain attached to the cardboard launcher.
- Show the crumpled paper ball physically held by the elastic band before every launch.
- Show complete paper-ball trajectories without teleportation.
- The crumpled paper ball must visibly enter the trash bin in Scene 4.
- The trash bin must remain in the same location until Scene 5.
- Do not introduce extra characters or duplicate Stickmen.
- No dialogue or speech bubbles.
- Keep captions large, readable, and correctly spelled.
- Keep all important action within the vertical 9:16 frame.
- Preserve smooth animation and clear physical continuity.

AUDIO:
Upbeat playful background music, rubber band twang, paper ball whooshes, wobbling trash bin sounds, cartoon bonk, cheerful celebration music, wobble squeak, descending whistle, freeze sting. No dialogue.`;

export const YO_BANDIT_SCENES: SceneDef[] = [
  {
    id: 1,
    name: 'Shot 1',
    title: 'The Impossible Target',
    timeRange: [0.0, 5.0] as [number, number],
    videoPrompt:
      'Warm indoor/outdoor trickshot room. The stickman (red beanie, yellow short-sleeved shirt, blue trousers, black shoes, white mitten hands) stands behind a wooden table facing a trash bin far across the room. He holds a small cardboard rubber-band launcher with the crumpled white paper ball secured inside the stretched elastic rubber band. His right hand rests beside the launcher, and his left hand points toward the distant trash bin. He has a confident expression with lowered brows and focuses on the distant bin. Show a close-up of the crumpled paper ball and launcher, then show the trash bin far across the room.',
    animationDesc:
      '0.0-0.8s he settles into the confident pose, 0.8-2.0s he leans forward and points at the distant bin, 2.0-3.0s he narrows his eyes with concentration, 3.0-4.0s he gives a confident grin, 4.0-5.0s he takes a breath and prepares the launcher for the first attempt.',
    soundDesc:
      'Upbeat score start, short dramatic challenge sound at 1.5s, rubber band twang at 2.5s, confident ding at 3.4s.',
    captionText: 'IMPOSSIBLE RUBBER BAND SHOT!',
    punchline: 'One paper ball, one trash bin, one confident stickman.',
    characterAction: 'Holds the launcher, points at the bin, narrows his eyes and grins.',
    propAction: 'The crumpled paper ball sits inside the stretched rubber band on the cardboard launcher; the trash bin stays still across the room.',
  },
  {
    id: 2,
    name: 'Shot 2',
    title: 'Way Too High!',
    timeRange: [5.0, 11.0] as [number, number],
    videoPrompt:
      'Same room, table and stickman. He carefully holds the cardboard launcher steady with his right hand. His left hand pulls the elastic rubber band backward, securing the crumpled paper ball in position. Show the paper ball being held securely before release. He releases the elastic band. The crumpled paper ball flies in a high curved arc across the room. It passes clearly above the open trash bin and hits the wall behind it. Stickman\'s eyes widen. His eyebrows rise. His mouth opens slightly. He slowly lowers his hands and gives the launcher an annoyed look.',
    animationDesc:
      '5.0-5.4s he grips the launcher, 5.4-6.2s he pulls the elastic band back, 6.2-7.0s he releases, 7.0-8.5s the paper ball arcs high over the bin at 7.5s, 8.5-9.5s it whistles through the air, 9.5-11.0s he lowers his hands with an annoyed glare.',
    soundDesc:
      'Rubber band twang at 5.2s, paper ball whoosh at 5.8s, high arc whoosh at 7.0s, cartoon boing at 8.0s (ball hits wall), angry sting at 9.0s.',
    captionText: 'WAY TOO HIGH!',
    punchline: 'His swing is not. The cup is tiny.',
    characterAction: 'Releases the elastic band, watches the high arc, then looks annoyed.',
    propAction: 'The paper ball arcs high over the bin and hits the wall; the bin stays still.',
  },
  {
    id: 3,
    name: 'Shot 3',
    title: 'Too Low!',
    timeRange: [11.0, 17.0] as [number, number],
    videoPrompt:
      'Same room, table and stickman. He adjusts the angle of the cardboard launcher. His right hand holds the launcher frame steady against the table. His left hand pulls the elastic rubber band backward, with the crumpled paper ball visibly secured in place. He releases it again. This time, the paper ball flies too low. It hits the floor before reaching the trash bin, bounces twice, and rolls underneath the bin. Stickman leans forward with his upper body bent. His right hand rests on his knee while his left hand points toward the crumpled paper ball underneath the bin. His face shows frustration.',
    animationDesc:
      '11.0-12.0s he adjusts the launcher angle, 12.0-13.0s he pulls the elastic band back to a shallower angle, 13.0-14.5s he releases, 14.5-15.5s the paper ball arcs low and hits the floor at 14.8s, 15.5-16.5s it bounces twice and rolls under the bin, 16.5-17.0s he leans forward frustrated, pointing under the bin.',
    soundDesc:
      'Rubber band twang at 12.2s, paper ball whoosh at 13.2s, floor thump at 14.7s, two quick floor bounces at 15.2s, roll whoosh at 15.8s, frustrated sigh at 16.5s.',
    captionText: 'NOW IT\'S TOO LOW!',
    punchline: 'The floor is not the target.',
    characterAction: 'Adjusts angle, releases low, watches it bounce under the bin, then looks frustrated.',
    propAction: 'The paper ball hits the floor, bounces twice, and rolls under the bin.',
  },
  {
    id: 4,
    name: 'Shot 4',
    title: 'Perfect Shot!',
    timeRange: [17.0, 24.0] as [number, number],
    videoPrompt:
      'Same setup. Stickman stands behind the table with both feet firmly planted. His right hand holds the cardboard launcher frame steady. His left hand carefully pulls the elastic rubber band backward. He adjusts the launcher angle slightly upward. He pauses, concentrates, and releases. Show the crumpled paper ball flying through the air in a smooth, clear curved trajectory. The ball approaches the trash bin, touches the front edge of its rim, bounces slightly upward, and drops directly into the open bin. Show the crumpled paper ball visibly falling inside the bin. Stickman\'s eyes widen with excitement. His mouth opens into a huge smile. He raises both arms above his head and jumps in celebration.',
    animationDesc:
      '17.0-18.0s he takes the stance and pulls the band to the optimal angle, 18.0-19.0s he concentrates and releases, 19.0-20.5s the paper ball arcs smoothly toward the bin, 20.5-21.2s it touches the bin rim at 20.8s and bounces upward, 21.2-22.0s it drops visibly into the open bin, 22.0-23.0s he raises both arms overhead in celebration, 23.0-24.0s he lands and poses with a huge smile.',
    soundDesc:
      'Rubber band twang at 17.5s, paper ball whoosh at 18.5s, bin rim click at 20.5s, satisfying drop sound at 21.2s, celebration music at 22.0s.',
    captionText: 'PERFECT SHOT!!!',
    punchline: 'Around the bin, straight in.',
    characterAction: 'Wide stance, focused release, watches the shot, then celebrates with both arms up.',
    propAction: 'The crumpled paper ball arcs into the bin and stays inside.',
  },
  {
    id: 5,
    name: 'Shot 5',
    title: "The Bin's Revenge!",
    timeRange: [24.0, 30.0] as [number, number],
    videoPrompt:
      'Stickman celebrates beside the table with both arms raised high and a proud expression. The trash bin begins wobbling because the crumpled paper ball lands inside and pushes against the other paper balls hidden within. The bin slowly tilts toward Stickman. Stickman notices the movement. His eyebrows shoot upward. His eyes become huge. His mouth opens in shock. He tries to step backward, but the bin tips over and rolls toward him. The bin lands over his head like a giant helmet. Several crumpled paper balls spill out around his shoes. His arms hang down helplessly. His legs remain visible. His red beanie is no longer visible because the bin covers his head. End with Stickman frozen in embarrassment while crumpled paper balls roll across the floor.',
    animationDesc:
      '24.0-25.0s proud celebration with both arms raised, 25.0-25.5s the bin begins a slight wobble, 25.5-26.5s the bin tilts toward him and he notices, 26.5-27.0s his eyebrows shoot up and his eyes go wide, 27.0-27.5s his mouth opens in shock, 27.5-28.0s he tries to step backward too late, 28.0-28.5s the bin tips over and rolls toward him, 28.5-29.5s the bin lands over his head like a giant helmet, several paper balls spill out around his shoes, 29.5-30.0s he freezes in embarrassment as paper balls roll across the floor.',
    soundDesc:
      'Rubber band snap at 24.5s, wobble whoosh at 25.0s, cartoon bonk at 26.0s, shocked sting at 26.5s, descending whistle at 27.5s, freeze sting at 29.0s, silence to the end.',
    captionText: 'THE BIN GOT REVENGE! 😂',
    punchline: 'He landed the shot. The bin landed him.',
    characterAction: 'Celebrates, bin tips, rolls over his head, paper balls spill, freeze-frame embarrassment.',
    propAction: 'The bin tips over, lands over his head, paper balls spill out; he freezes while they roll away.',
  },
];