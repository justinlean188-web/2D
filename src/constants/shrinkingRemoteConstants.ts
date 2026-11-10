import type { SceneDef } from '../types';

export const SHRINKING_REMOTE_PROMPT = `THE SHRINKING REMOTE CONTROL -- 30-SECOND 2D STICKMAN SHORT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080x1920, 24 fps.

VISUAL STYLE:
Modern Pop flat 2D vector cartoon. Thick smooth black outlines, bright solid colours, simple geometric shapes, expressive cartoon faces, a colourful tidy bedroom, smooth animation and exaggerated physical comedy. No gradients, no textures, no watermark, no logo.

CHARACTER (LOCKED):
The exact same Angry Stickman in all five scenes. Large circular white head with a thick black outline, two small vertical black oval eyes, two thick expressive black eyebrows, one simple black mouth. No nose, no ears, no hair. Bright red knitted beanie with a rounded top and folded lower edge. Plain yellow short-sleeved T-shirt. Thin black stick arms connected to the sleeves. Small white rounded mitten hands with black outlines, connected directly to the black wrists. Blue trousers and small rounded solid-black shoes. Head roughly 40% of his total height. When he shrinks, the whole character shrinks uniformly: same colours, proportions and outfit in every shot, never a different character.

PROP (LOCKED):
One oversized black rectangular remote control with rounded corners, a thick black outline, one large glowing purple shrink button marked with a simple shrinking icon, one smaller red reset button marked with a simple reset icon, and a tiny purple indicator light. The purple button shrinks whatever the remote points at. The red button restores the target to its original size. Keep the remote's design and button positions consistent in every scene.

SHOT 1 (0-6s) -- THE MYSTERIOUS REMOTE:
Colourful tidy bedroom with a wooden desk, chair, lamp, bookshelf, bed and window. Stickman walks toward his desk, notices a strange black remote lying beside a notebook, picks it up with both mitten hands and examines the glowing purple button. He points it at the nearby chair and presses the purple button. A short purple beam hits the chair, which shrinks smoothly into a tiny miniature chair on the floor. ON-SCREEN TEXT: "WHAT DOES THIS BUTTON DO?!"

SHOT 2 (6-12s) -- SHRINKING EVERYTHING:
He points the remote at his desk and presses the button. A purple beam hits the desk, which shrinks into a miniature desk. He then shrinks the lamp and the bookshelf one after another. The objects stay in their original positions but become miniature. He laughs proudly and celebrates. At the end of the scene he accidentally turns the remote toward his own chest while celebrating. ON-SCREEN TEXT: "I'M A GENIUS!"

SHOT 3 (12-18s) -- OOPS!:
The purple button activates while pointing at Stickman. A purple beam hits his body. He shrinks uniformly from normal size to roughly eight centimetres tall. Every part of his outfit shrinks with him. The remote slips from his hands and drops onto the wooden floor beside him, now enormous compared with him. Stickman stands beside the giant remote, slowly looks up and opens his mouth in shock. ON-SCREEN TEXT: "I SHRUNK MYSELF?!"

SHOT 4 (18-24s) -- GIANT BEDROOM SURVIVAL:
The tiny Stickman looks up at the giant remote on the floor. He finds a long pencil lying on the floor and places it against the remote as a ladder, then climbs it carefully. Before he reaches the remote, a huge black sneaker slides across the bedroom floor from the side of the frame. Stickman notices it, jumps away from the pencil and lands safely on a giant soft pillow. The sneaker slides past and stops against the wall. Stickman looks relieved. ON-SCREEN TEXT: "EVERYTHING IS HUGE!"

SHOT 5 (24-30s) -- THE WRONG BUTTON!:
Stickman climbs onto the giant remote and walks toward the purple shrinking button, holding the edges for balance. He presses the purple button with both hands. It clicks. A purple beam shoots from the front of the remote toward the remaining full-sized furniture. The bed, desk, bookshelf and lamp shrink into even tinier miniature versions. Stickman stays tiny because the beam only hits the furniture. He looks around at the now enormous-looking bedroom floor and realises his mistake. He notices the smaller red RESET button nearby but cannot reach it. He stares directly at the camera with a defeated expression. End on a funny freeze-frame and a short comedic sting. ON-SCREEN TEXT: "THAT WAS NOT RESET!"

FINAL QUALITY RULES:
- Identical character design, colours and proportions in every scene. Scale the whole character uniformly when he shrinks.
- Both hands stay connected to the arms and keep their white rounded mitten shape.
- The remote always has the same black body, purple shrink button and red reset button.
- Every shrink beam visibly travels from the remote to its intended target.
- Keep the bedroom layout and prop positions consistent.
- No dialogue, no subtitles other than the specified captions, no watermark.
- Vertical 9:16 composition and all captions inside the safe viewing area.

AUDIO:
Upbeat playful score, magical shimmer, remote button clicks, purple beam zaps, shrinking whooshes, tiny footsteps, pencil taps, a giant sneaker slide, a pillow poof, a sad trombone and a freeze sting. No dialogue.`;

export const SHRINKING_REMOTE_SCENES: SceneDef[] = [
  {
    id: 1,
    name: 'Shot 1',
    title: 'The Mysterious Remote',
    timeRange: [0.0, 6.0] as [number, number],
    videoPrompt:
      'A colourful tidy bedroom with a wooden desk, chair, lamp, bookshelf, bed and window. The stickman (red beanie, yellow short-sleeved shirt, blue trousers, black shoes, white mitten hands) walks to his desk, notices a strange black remote lying beside a notebook, picks it up with both hands and examines the glowing purple button. He points the remote at the nearby chair and presses the purple button. A short purple beam hits the chair, which shrinks smoothly into a tiny miniature chair on the floor.',
    animationDesc:
      '0.0-1.4s he walks to the desk, 1.4-2.4s he reaches down and picks up the remote with both mitten hands, 2.4-3.4s he examines it close to his face, 3.4-4.0s he aims at the chair, 4.0-4.3s the purple beam fires and hits the chair, 4.3-5.0s the chair shrinks to a miniature, 5.0-6.0s he stares at the remote in surprise.',
    soundDesc:
      'Playful score starts, notebook tap at 1.9s, magical shimmer at 2.4s, remote click at 3.95s, purple beam zap at 4.0s, shrinking whoosh at 4.3s, surprised boing at 5.2s.',
    captionText: 'WHAT DOES THIS BUTTON DO?!',
    punchline: 'One strange remote, one very small chair.',
    characterAction: 'Walks to the desk, picks up the remote with both hands, examines it, aims at the chair and fires.',
    propAction: 'The remote sits beside a notebook on the desk. The chair shrinks into a miniature on the floor.',
  },
  {
    id: 2,
    name: 'Shot 2',
    title: "I'm a Genius!",
    timeRange: [6.0, 12.0] as [number, number],
    videoPrompt:
      'Same colourful bedroom. The stickman points the remote at his desk and presses the purple button. A purple beam hits the desk, which shrinks into a miniature desk. He then points at the lamp and the bookshelf, shrinking both one after another. The objects remain in their original positions but become miniature versions. He laughs proudly and celebrates his discovery. At the end of the scene he accidentally turns the remote toward his own chest while celebrating.',
    animationDesc:
      '6.0-6.6s he aims at the desk, 6.6-7.3s the desk shrinks, 7.3-7.9s he aims at the lamp, 7.9-8.5s the lamp shrinks, 8.5-9.1s he turns and aims at the bookshelf, 9.1-9.7s the bookshelf shrinks, 9.7-11.0s he raises the remote overhead and laughs, 11.0-11.6s the remote swings toward his own chest, 11.6-12.0s he notices with a confused face.',
    soundDesc:
      'Remote click at 6.6s, beam zap at 6.65s, desk shrink whoosh at 6.9s, click and zap at 7.85s, lamp shrink at 8.1s, click and zap at 8.75s, bookshelf shrink at 9.0s, victory fanfare at 9.7s, dramatic rumble at 11.5s.',
    captionText: "I'M A GENIUS!",
    punchline: 'Everything is getting smaller. What could possibly go wrong?',
    characterAction: 'Shrinks the desk, lamp and bookshelf, celebrates with the remote overhead, then accidentally aims it at himself.',
    propAction: 'The desk, lamp and bookshelf shrink in place into miniatures.',
  },
  {
    id: 3,
    name: 'Shot 3',
    title: 'Oops!',
    timeRange: [12.0, 18.0] as [number, number],
    videoPrompt:
      'The remote activates while pointing directly at the stickman. A purple beam hits his body. He shrinks uniformly from normal size to roughly eight centimetres tall. His red beanie, white head, yellow shirt, thin black arms, white mitten hands, blue trousers and black shoes all shrink together. The remote slips from his hands and drops onto the wooden floor beside him, now enormous compared with him. Stickman stands beside the giant remote, slowly looks up and opens his mouth in shock.',
    animationDesc:
      '12.0-12.2s the remote is aimed at his chest, 12.2-12.5s the purple beam hits him, 12.2-13.2s he shrinks uniformly, 12.6-13.4s the remote slips and falls to the floor with a bounce, 13.4-14.5s he stands frozen and looks up at the giant remote, 14.5-16.0s his mouth opens in shock, 16.0-18.0s he looks from the remote to the camera in disbelief.',
    soundDesc:
      'Beam zap at 12.15s, shrinking whoosh at 12.25s, tiny pop at 13.2s, remote floor thump at 13.0s, remote bounce at 13.25s, shocked boing at 14.6s.',
    captionText: 'I SHRUNK MYSELF?!',
    punchline: 'The remote works. Just not on the furniture this time.',
    characterAction: 'Gets hit by his own beam, shrinks to tiny size, watches the remote fall and stares up at it in shock.',
    propAction: 'The remote drops from his hands, bounces once and lies on the floor beside him.',
  },
  {
    id: 4,
    name: 'Shot 4',
    title: 'Giant Bedroom Survival',
    timeRange: [18.0, 24.0] as [number, number],
    videoPrompt:
      'The tiny stickman looks up at the giant remote lying on the floor. He finds a long pencil lying on the floor and places it against the remote as a ladder. He climbs the pencil carefully. Before he reaches the remote, a huge black sneaker slides across the bedroom floor from the side of the frame. Stickman notices it, jumps away from the pencil and lands safely on a giant soft pillow. The sneaker slides past and stops against the wall. Stickman looks relieved.',
    animationDesc:
      '18.0-19.2s he looks up at the remote, 19.2-20.0s he walks to a pencil on the floor, 20.0-20.4s he leans the pencil against the remote, 20.4-21.3s he climbs carefully, 21.3-21.8s he notices the sliding sneaker and panics, 21.8-22.6s he jumps and lands on the pillow, 22.6-23.2s the sneaker slides past and stops, 23.2-24.0s he lies on the pillow, relieved.',
    soundDesc:
      'Tiny footsteps at 18.2s and 19.4s, pencil tap at 19.9s, sneaker slide at 21.4s, panic boing at 21.8s, jump whoosh at 22.0s, pillow poof at 22.6s, sneaker thud at 23.0s, relieved sigh at 23.4s.',
    captionText: 'EVERYTHING IS HUGE!',
    punchline: 'A pencil is a ladder when you are two centimetres tall.',
    characterAction: 'Leans the pencil on the remote, climbs it, spots the sneaker, jumps to the pillow and relaxes.',
    propAction: 'The pencil leans against the giant remote. The sneaker slides across the floor and stops. The pillow squishes on landing.',
  },
  {
    id: 5,
    name: 'Shot 5',
    title: 'The Wrong Button!',
    timeRange: [24.0, 30.0] as [number, number],
    videoPrompt:
      'Stickman climbs onto the giant remote control. He carefully walks toward the purple shrinking button, holding the edges for balance. He presses the purple button with both hands. It clicks. A purple beam shoots from the front of the remote toward the remaining full-sized bedroom furniture. The bed, desk, bookshelf and lamp shrink into even tinier miniature versions. Stickman remains tiny because the beam only hits the furniture. He looks around at the now even larger-looking bedroom floor and realises his mistake. He notices the smaller red RESET button on the remote. It is only a short distance away, but he cannot reach it. He stares directly at the camera with a defeated expression. Freeze-frame.',
    animationDesc:
      '24.0-24.7s he jumps from the pillow onto the remote, 24.7-25.4s he walks along the remote, 25.4-26.0s he crouches and presses the purple button with both hands, 26.0-26.3s the button clicks and the beam fires, 26.3-27.2s the bed, desk, bookshelf and lamp shrink to specks, 27.2-27.8s he looks around at the enormous floor, 27.8-28.4s he notices the red reset button and reaches for it, 28.4-29.0s he cannot reach it, 29.0-30.0s he stares at the camera, defeated, and the frame freezes.',
    soundDesc:
      'Jump whoosh at 24.1s, tiny footsteps at 24.9s and 25.2s, remote click at 26.0s, purple beam at 26.05s, furniture shrink whoosh at 26.3s, red button click at 27.8s, sad trombone at 28.2s, freeze sting at 29.4s.',
    captionText: 'THAT WAS NOT RESET!',
    punchline: 'He had one job: press the red one.',
    characterAction: 'Climbs the remote, presses the purple button, shrinks the furniture again, reaches for the red button, gives up and stares at the camera.',
    propAction: 'The purple button clicks and fires a beam. The bed, desk, bookshelf and lamp shrink to tiny miniatures. The red reset button stays out of reach.',
  },
];
