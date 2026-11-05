import type { SceneDef } from '../types';

export const YO_YO_REVENGE_PROMPT = `THE YO-YO REVENGE -- 30-SECOND 2D STICKMAN SHORT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080x1920, 24 fps.

VISUAL STYLE:
Modern Pop flat 2D vector cartoon. Thick consistent black outlines, simple geometric shapes, bright solid colours, smooth readable action, exaggerated facial expressions. One warm indoor trickshot room with a wooden table, a tiny blue cup on it, and one red-and-blue yo-yo on a visible string. No gradients, no textures, no watermark, no logo.

CHARACTER (LOCKED):
The exact same Angry Stickman in all five scenes. Large round white head with a thick black outline, two small black oval eyes, thick expressive black eyebrows, a small expressive mouth, a bright red beanie, a bright yellow short-sleeved T-shirt, thin black stick arms and legs, blue trousers and solid black shoes. White mitten-shaped hands with thick black outlines and a visible thumb on each hand, connected naturally to the black wrists. Identical head size, body proportions, outfit and facial design in every shot. No detached or floating hands, no extra fingers, no colour changes.

SHOT 1 (0-5s) -- THE CHALLENGE:
Medium full-body shot of the stickman standing on the left of the wooden table. His head is tilted toward the tiny blue cup. His right arm is bent forward at chest height, holding the red-and-blue yo-yo by its string; the string is clearly connected to his mitten hand. His left arm is bent at the elbow and points toward the cup. He leans toward the table, narrows his eyes, then gives a confident grin. Camera starts medium and pushes toward the cup and yo-yo. Caption: "CAN HE LAND A YO-YO IN THIS TINY CUP?"

SHOT 2 (5-11s) -- FIRST FAILURE:
He releases the yo-yo into a big swing with his right arm extended, still connected by the string. His left hand grips the edge of the table for balance. The yo-yo swings too high and sails over the cup, missing it completely. He raises his left shoulder, bends backward, widens his eyes and opens his mouth in shock, then ducks as the yo-yo whips back close to his face. After the near miss he straightens, looks annoyed and clenches both mitten hands into small cartoon fists. Camera shows the complete swing, then a close-up of his shocked face. Caption: "TOO HIGH!"

SHOT 3 (11-17s) -- THE IMPOSSIBLE ROUTE:
He crouches slightly beside the table. His left hand points toward the nearest wooden table leg. His right hand holds the yo-yo string low, keeping the yo-yo close to the floor. He swings the yo-yo around the outside of the table leg in one clear continuous loop; the string follows and wraps the leg naturally. The yo-yo swings too far and circles around his ankles. He looks down in surprise, spreads both arms to balance, lifts one foot and keeps the other planted, eyebrows uneven and mouth open in panic. He manages to stay standing, then pulls the yo-yo back to his hand. Camera starts with a side view of the leg and yo-yo path, then finishes medium on his stumble. Caption: "WAIT... TRY AROUND THE TABLE!"

SHOT 4 (17-24s) -- PERFECT TRICKSHOT:
He takes a wide stance, bends his knees, leans forward. His right arm is pulled back holding the string in a closed mitten fist. His left hand is raised beside his face with a thumb-up gesture. He narrows his eyes and lowers his eyebrows. He releases the yo-yo with a smooth controlled motion: it swings around the table leg, travels up in front of the tabletop and drops directly into the tiny blue cup. The yo-yo stays visibly inside the cup. His eyes go huge, his eyebrows shoot up, his mouth opens into a massive excited smile and he raises both arms above his head. Camera tracks the yo-yo through the trickshot, shows a close-up of the yo-yo in the cup, then cuts to his full-body celebration. Caption: "PERFECT SHOT!!!"

SHOT 5 (24-30s) -- THE YO-YO GETS REVENGE:
He stands proudly beside the table with both arms above his head, chest forward, feet apart, smiling. Suddenly the string snaps tight and pulls the yo-yo out of the cup. It swings back toward him. He notices too late: eyes widen, eyebrows shoot up, mouth becomes a small shocked circle. He tries to lower his right arm but cannot react fast enough. The yo-yo gently bonks his forehead. His red beanie pops upward into the air. His head tilts backward, his arms spread apart, his knees buckle and his eyes cross comically. He stands frozen in disbelief while the red beanie falls back toward his head. Camera uses a medium celebration, a quick close-up of the bonk and a full-body comedic freeze-frame. Caption: "THE YO-YO GOT REVENGE! 😂"

FINAL QUALITY RULES:
- Identical character appearance in all scenes. Never change clothing, colours, head shape or body proportions.
- Both hands stay connected to the arms at all times and keep consistent white mitten shapes with black outlines and visible thumbs.
- No extra characters or duplicate Stickmen.
- Keep the same yo-yo, table, cup and environment. The yo-yo and string stay physically connected.
- No teleporting objects or unexplained changes in position. Every movement has a clear start and end.
- Smooth, readable animation with expressive cartoon body language.
- Vertical 9:16 composition, 24 FPS, bright modern 2D vector style.

AUDIO:
Upbeat playful background music, string twangs, yo-yo whooshes, cup wobble, rim ping, shocked stings, a victory fanfare, a forehead bonk, a beanie pop, a descending whistle and a freeze sting. No dialogue.`;

export const YO_YO_REVENGE_SCENES: SceneDef[] = [
  {
    id: 1,
    name: 'Shot 1',
    title: 'The Challenge',
    timeRange: [0.0, 5.0] as [number, number],
    videoPrompt:
      'Warm indoor trickshot room. The stickman (red beanie, yellow short-sleeved shirt, blue trousers, black shoes, white mitten hands) stands on the left side of a wooden table with a tiny blue cup on it. He holds a red-and-blue yo-yo by its visible string in his right hand at chest height and points at the cup with his left hand.',
    animationDesc:
      '0.0-0.8s he settles into the confident pose, 0.8-2.0s he leans toward the table with his head tilted at the cup, 2.0-2.8s he narrows his eyes, 2.8-4.0s he gives a confident grin and points, 4.0-5.0s he takes a breath and starts the wind-up.',
    soundDesc:
      'Upbeat score start, soft string twang at 1.8s, confident ding at 2.6s, cup settle at 3.4s, low whoosh into the wind-up at 4.6s.',
    captionText: 'CAN HE LAND A YO-YO IN THIS TINY CUP?',
    punchline: 'One yo-yo, one tiny cup, one very confident stickman.',
    characterAction: 'Holds the yo-yo by the string, points at the cup, narrows his eyes and grins.',
    propAction: 'The yo-yo dangles from his mitten hand on a visible string; the cup sits still on the table.',
  },
  {
    id: 2,
    name: 'Shot 2',
    title: 'First Failure',
    timeRange: [5.0, 11.0] as [number, number],
    videoPrompt:
      'Same room, table, cup and stickman. He releases the red-and-blue yo-yo into a huge swing. The string stays connected to his right hand. His left hand grips the near edge of the wooden table. The yo-yo sails too high over the tiny blue cup, then whips back toward his face. He ducks, then straightens with an annoyed glare and clenched fists.',
    animationDesc:
      '5.0-5.4s he releases the yo-yo, 5.4-6.9s the yo-yo swings down and up in a wide arc, passing high over the cup at 6.6s, 6.9-7.6s it whips back toward his face, 7.6-8.3s he ducks with wide eyes and an open mouth, 8.3-8.9s the yo-yo returns to his hand, 8.9-11.0s he straightens and clenches both fists in annoyance.',
    soundDesc:
      'String twang and release whoosh at 5.1s, swing whirr, high pass whoosh at 6.6s, cup wobble at 6.9s, near-miss whoosh at 7.7s, cartoon boing at 8.0s, angry sting at 9.0s.',
    captionText: 'TOO HIGH!',
    punchline: 'The cup is tiny. His swing is not.',
    characterAction: 'Releases the yo-yo, grips the table, ducks the return swing, then clenches his fists.',
    propAction: 'The yo-yo swings in one continuous arc over the cup and back; the cup stays on the table.',
  },
  {
    id: 3,
    name: 'Shot 3',
    title: 'The Impossible Route',
    timeRange: [11.0, 17.0] as [number, number],
    videoPrompt:
      'Side view of the same wooden table and stickman. He crouches slightly and points at the nearest table leg with his left hand while his right hand keeps the yo-yo close to the floor on its string. The yo-yo loops around the outside of the leg, then swings too far and circles both of his ankles. He wobbles with his arms spread and one foot lifted, then pulls the yo-yo back.',
    animationDesc:
      '11.0-11.6s he crouches and points at the leg, 11.6-12.4s the yo-yo drops close to the floor, 12.4-14.2s it loops once around the table leg with the string wrapping, 14.2-14.6s it swings toward him, 14.6-16.0s it circles his ankles while he wobbles with one foot up, 16.0-16.6s he pulls it back to his hand, 16.6-17.0s he sets his jaw for the last attempt.',
    soundDesc:
      'Idea ding at 11.3s, whoosh at 12.0s, two string whirrs around the leg, cartoon boing at 13.9s, squeak at 14.8s, balance wobble at 15.4s, relieved sigh at 16.2s.',
    captionText: 'WAIT... TRY AROUND THE TABLE!',
    punchline: 'A new route, a new disaster.',
    characterAction: 'Crouches, points at the table leg, swings the yo-yo around it, wobbles as it circles his ankles, then recovers.',
    propAction: 'The yo-yo travels in one continuous loop around the table leg and then around his ankles.',
  },
  {
    id: 4,
    name: 'Shot 4',
    title: 'Perfect Trickshot',
    timeRange: [17.0, 24.0] as [number, number],
    videoPrompt:
      'Same setup. The stickman takes a wide stance, bends his knees and leans forward. His right arm is pulled back with the yo-yo string in his mitten fist; his left hand is raised beside his face with a thumb-up gesture. He narrows his eyes and releases. The yo-yo swings around the table leg, climbs up in front of the tabletop and drops into the tiny blue cup. It stays visibly in the cup. He throws both arms above his head in a massive celebration.',
    animationDesc:
      '17.0-18.2s he takes the wide stance and raises his left thumb, 18.2-19.0s he narrows his eyes and aims, 19.0-19.4s he releases, 19.4-21.0s the yo-yo loops the table leg, 21.0-21.6s it climbs in front of the table, 21.6-22.0s it drops into the cup, 22.0-22.7s it rests visibly in the cup for the close-up, 22.7-24.0s he raises both arms overhead in a giant smile.',
    soundDesc:
      'Deep breath at 17.4s, soft flick at 19.2s, swing whoosh, leg whirr at 20.0s, rising whistle at 21.0s, cup ping at 21.7s, magic sparkle at 21.9s, victory fanfare at 22.7s.',
    captionText: 'PERFECT SHOT!!!',
    punchline: 'Around the leg, up the table, straight into the tiny cup.',
    characterAction: 'Wide stance, thumb-up focus, smooth release, watches the shot, then celebrates with both arms up.',
    propAction: 'The yo-yo loops the table leg, climbs in front of the tabletop and drops into the blue cup, where it stays visible.',
  },
  {
    id: 5,
    name: 'Shot 5',
    title: 'The Yo-Yo Gets Revenge',
    timeRange: [24.0, 30.0] as [number, number],
    videoPrompt:
      'Same room and character. The stickman celebrates proudly beside the table with both arms above his head. The taut string suddenly pulls the yo-yo out of the cup and it swings back at him. He notices too late, tries to lower his arm, and the yo-yo gently bonks his forehead. His red beanie pops into the air, his head tilts back, his arms spread and his eyes cross. He freezes in disbelief as the beanie falls back toward his head.',
    animationDesc:
      '24.0-25.0s proud celebration, 25.0-25.5s the string snaps tight and lifts the yo-yo out of the cup, 25.5-26.2s the yo-yo flies at his forehead while he notices too late, 26.2s gentle bonk, 26.2-26.6s the beanie pops upward, his head tilts back, his arms spread and his knees buckle, 26.6-29.0s he freezes cross-eyed in disbelief, 29.0-30.0s the beanie falls back toward his head in the freeze-frame.',
    soundDesc:
      'Taut string twang at 25.0s, whoosh at 25.4s, forehead bonk at 26.2s, beanie pop boing at 26.25s, wobble squeak at 26.8s, descending whistle at 28.6s, freeze sting at 29.5s, silence to the end.',
    captionText: 'THE YO-YO GOT REVENGE! 😂',
    punchline: 'He landed the shot. The yo-yo landed him.',
    characterAction: 'Proud celebration, late reaction, forehead bonk, beanie pops, arms spread, cross-eyed freeze.',
    propAction: 'The yo-yo is pulled out of the cup, bonks his forehead and dangles; the beanie flies up and falls back toward his head.',
  },
];
