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
  shadowAction?: string;
  propAction?: string;
}

import { CANDY_CLAW_PROMPT, CANDY_CLAW_SCENES } from './constants/candyClawConstants';
import { PLATE_SPIN_PROMPT, PLATE_SPIN_SCENES } from './constants/plateSpinConstants';
import { THREE_WALL_PING_PONG_PROMPT, THREE_WALL_PING_PONG_SCENES } from './constants/threeWallPingPongConstants';
import { CUP_IN_CUP_PROMPT, CUP_IN_CUP_SCENES } from './constants/cupInCupConstants';
import { YO_YO_REVENGE_PROMPT, YO_YO_REVENGE_SCENES } from './constants/yoYoRevengeConstants';
import { YO_BANDIT_PROMPT, YO_BANDIT_SCENES } from './constants/yoBanditConstants';
import { DESERT_ISLAND_PROMPT, DESERT_ISLAND_SCENES } from './constants/desertIslandConstants';
import { SHRINKING_REMOTE_PROMPT, SHRINKING_REMOTE_SCENES } from './constants/shrinkingRemoteConstants';
import { MAGIC_PAINTBRUSH_PROMPT, MAGIC_PAINTBRUSH_SCENES } from './constants/magicPaintbrushConstants';
export type CanvasTheme = 'black-on-white' | 'white-on-black';

export type ProjectId =
  | 'mind-traps'
  | 'arcade-claw'
  | 'diamond-heist'
  | 'pancake-flip'
  | 'vending-machine'
  | 'biggest-balloon'
  | 'find-the-ball'
  | 'attempt-247'
  | 'needle-thread'
  | 'magnet-trick'
  | 'ring-shot'
  | 'coin-flip'
  | 'pencil-landing'
  | 'domino-trickshot'
  | 'balloon-pop-jackpot'
  | 'candy-claw'
  | 'plate-spin'
  | 'three-wall-ping-pong'
  | 'cup-in-cup'
  | 'rubber-band'
  | 'yo-yo-revenge'
  | 'desert-island'
  | 'shrinking-remote'
  | 'magic-paintbrush'
  | 'dart-shot'
  | 'ping-pong-revenge'
  | 'trick-shot-champion'
  | 'pop-star'
  | 'paper-ball-part4'
  | 'paper-ball-part3'
  | 'paper-ball-sequel'
  | 'paper-ball-30'
  | 'paper-ball'
  | 'shadow-quit'
  | 'rubber-band'

export interface ProjectDef {
  id: ProjectId;
  title: string;
  subtitle: string;
  tagline: string;
  duration: number;
  hasAudioDialogue: boolean;
  hasCaptions: boolean;
  masterPrompt: string;
  scenes: SceneDef[];
}

export const isPaperBallProject = (id: ProjectId) =>
  id === 'paper-ball' ||
  id === 'paper-ball-30' ||
  id === 'paper-ball-sequel' ||
  id === 'paper-ball-part3' ||
  id === 'paper-ball-part4';

export const PAPER_BALL_PROMPT = `Minimalist 2D vector stickman comedy animation, vertical 9:16 aspect ratio, 1080×1920 resolution, smooth 24 fps animation. Pure white background, simple black stickman with a round head, bold clean black outlines, simple geometric props, crumpled white paper ball, small black trash can, one table lamp and one ceiling fan. Flat colors only, no gradients, no realistic textures, no 3D rendering, no unnecessary details. Exaggerated cartoon physics, clear readable silhouettes, snappy timing, elastic motion, fast ball tracking, satisfying ricochets, and deadpan comedic expressions. Maintain identical character proportions, prop designs, room layout, and lighting across all scenes. No dialogue, no captions, no text, no watermark.`;

export const PAPER_BALL_30_PROMPT = `THE PAPER BALL RICOCHET — 30-SECOND DIRECTOR'S CUT
AI VIDEO PROMPT

MASTER STYLE
Create a 30-second, vertical 9:16, 1080 x 1920, 24 fps minimalist 2D stickman comedy animation. Pure white background, bold clean black outlines, flat vector style. No gradients, realism, textures, 3D, text, subtitles, logos, or watermark.

CHARACTER
One consistent black stickman with a round white head, thin limbs, oversized round head, expressive eyebrows, highly readable eyes, and exaggerated cartoon body language. Maintain identical proportions and design in every shot.

ROOM & PROPS
A simple white room with a table, a small trash can, a table lamp, and a spinning ceiling fan. A crumpled white paper ball is the recurring prop. Keep the same room layout, prop shapes, character proportions, black-and-white palette, and camera language throughout. Flat geometric shadows and clean silhouettes only.

SCENE FLOW
0-4s: A casual no-look throw misses the trash can and hits the wall. The stickman slowly turns to camera with an awkward raised eyebrow.
4-8s: He produces a ruler and calculator, measures, studies the angle, adjusts his stance, and gives a confident thumbs-up.
8-11s: He throws too hard. The ball rebounds off the wall and bonks his forehead. Crossed eyes, frozen body, tiny birds circling his head.
11-15s: An absurd training montage: stretch, tiny squats, arm rotations, dramatic flexing, and a glare at the trash can.
15-19s: The next throw ricochets off the lamp, the table, and the spinning fan before curving toward the trash can. Fast camera pans, readable motion trails, rage turning into confusion.
19-23s: The ball descends in exaggerated slow motion. Close-up on the stickman gripping his head, holding his breath, then opening one eye and the other.
23-27s: The ball lands in the trash can with a satisfying plop. He celebrates wildly, pumps his fists, mimes receiving a championship trophy, and points at the camera.
27-30s: During the victory dance he accidentally kicks the trash can over. Paper balls spill everywhere. The music stops instantly. He freezes, lowers his arms, looks at the mess, and gives the camera a defeated deadpan stare.

SOUND
Sound effects only: whooshes, cartoon impacts, calculator beeps, training music, suspenseful heartbeat, victory fanfare, crash, and sad trombone. No dialogue, no subtitles, no on-screen text, no watermark.

ANIMATION
Smooth 24 fps movement, snappy comedic timing, clear trajectories, squash-and-stretch, well-timed pauses, readable silhouettes, and a final frozen reaction. Keep all typography out of the rendered frame.`;

export const PAPER_BALL_SEQUEL_PROMPT = `THE PAPER BALL RICOCHET — EPISODE 2 (DIRECT SEQUEL)
AI VIDEO PROMPT

Create a 30-second, vertical 9:16, 1080 x 1920, 24 fps minimalist 2D stickman comedy animation. This is a direct sequel to the previous episode. Start with the exact same black stickman, white background, bold black outlines, round white head, expressive eyes and eyebrows, overturned trash can, and scattered crumpled paper balls from the previous ending. Maintain strict visual continuity.

SCENE FLOW
0-3s: The stickman stares at the mess, slowly turns toward the trash can, points at it accusingly, and clenches his fists.
3-7s: He puts the trash can upright, measures the distance with a ruler, lines up five paper balls, cracks his knuckles, and poses like a professional trick-shot champion.
7-11s: He throws five paper balls in quick succession. Every shot misses in a different ridiculous way. One hits the ceiling, one hits his foot, one bounces off the wall, and two fly behind him. His confident smile gradually disappears.
11-15s: He trembles with rage, stomps the floor, and clenches his fists. Suddenly, he takes a deep breath and forces an exaggerated fake peaceful smile.
15-19s: He constructs an absurdly complicated paper-ball launcher from a ruler, rubber bands, and a stack of books. He puts on imaginary safety goggles and gives the camera a smug thumbs-up.
19-23s: The launcher fires with excessive force. The paper ball ricochets off a lamp, clips the spinning ceiling fan, and flies back toward him. His pupils shrink, and he raises his hands in panic.
23-27s: He ducks just in time. The ball flies over his head and drops perfectly into the trash can. He looks behind him in disbelief, then proudly points at himself as victory music plays.
27-30s: He celebrates wildly. The homemade launcher snaps, sending the stack of books flying. One book lands on his head. He freezes and gives the camera a defeated, deadpan stare. End on the same white background and consistent character design.

STYLE
Polished minimalist 2D vector cartoon, pure white background, thick black outlines, expressive stickman reactions, exaggerated squash-and-stretch, clear object trajectories, fast comedic cuts, well-timed pauses, funny physical comedy. No gradients, no realism, no 3D.

SOUND
Sound effects only: dramatic rumble, cartoon bonks, calming chime, mechanical clicks, launch sound, ricochets, victory fanfare, crash, sad trombone. No dialogue, no captions, no text, no watermark.`;

export const PAPER_BALL_PART3_PROMPT = `THE PAPER BALL RICOCHET - PART 3 (THE WALK TO THE BASKETBALL COURT)
AI VIDEO PROMPT

Create a 30-second, vertical 9:16, 1080 x 1920, 24 fps minimalist 2D stickman comedy animation. Thick black outlines, round white head, thin black limbs, expressive eyes, exaggerated physical comedy, smooth animation, and cartoon physics. Keep the same stickman character throughout. Use a simple white background that transitions into a minimalist outdoor basketball court. One orange basketball, one basketball hoop. No dialogue, no subtitles, no text, no watermark.

0-2 SECONDS - BOOK INCIDENT:
A book falls onto the stickman's head. He freezes, slowly clenches both fists, and glares furiously at the book.

2-7 SECONDS - WALK TO THE BASKETBALL COURT:
The stickman notices a basketball court far away. He suddenly gets a determined look and begins marching toward it, imagining himself as a basketball champion. Show him walking across a long sidewalk with exaggerated tiny fast steps, swinging arms, and an angry determined face. The court remains far away. He gets exhausted, sweats, drags his feet, stops to catch his breath, looks annoyed at how far he has to walk, then finally reaches the court. Make this walking journey clearly visible and distinct from the basketball scenes.

7-9 SECONDS - ARRIVAL:
He reaches the basketball court, bends over to catch his breath, then picks up an orange basketball. He looks at the hoop with extreme confidence and prepares his first shot.

9-14 SECONDS - FIRST FAILURES:
He aims and throws. The ball misses the hoop, hits the rim, and bounces straight back into his face. His head snaps backward. He catches the ball, looks furious, and immediately tries again. The next shot hits the backboard and bounces off his forehead. He stumbles backward in disbelief.

14-19 SECONDS - COMEDY FAILURE MONTAGE:
Use quick cuts. He throws again: the ball flies sideways. Another attempt: the ball hits the rim and bounces into his face. Another attempt: the ball bounces off the ground and hits his head. Each failure produces a different exaggerated reaction: shocked freeze, furious eye twitch, stomping feet, shaking fists, and dramatic frustration. Increase the speed and absurdity of the montage.

19-21 SECONDS - CALM DOWN:
The stickman almost explodes with rage. He takes a deep breath, closes his eyes, slowly relaxes his fists, positions his feet carefully, and aims with intense concentration.

21-25 SECONDS - FINAL SHOT:
He releases one perfect shot. Switch to dramatic slow motion. The basketball follows a beautiful high arc toward the hoop. The stickman watches with wide eyes and clasped hands. The ball rolls around the rim twice, then drops cleanly through the net with a satisfying SWISH.

25-28 SECONDS - CHAMPION CELEBRATION:
The stickman jumps, pumps both fists, and celebrates like he has won a championship. He flexes proudly and dances beside the hoop.

28-30 SECONDS - FINAL BONK:
The unstable basketball hoop tips over and crashes down onto the stickman's head with a loud cartoon BONK - backboard, rim and net and all. The basketball bounces out of the way. He is left dazed and hurt, then slowly lowers his arms, turns toward the camera, and gives an unbelievably furious stare with one twitching eye. Cut to black immediately.

Keep all actions readable and the character consistent. The walk to the basketball court must happen BEFORE any basketball throws. Show multiple clearly unsuccessful attempts with repeated ball-to-face gags, followed by exactly one successful final basket. Use cartoon sound effects, expressive reactions, quick cuts, and a slow-motion climax. No spoken words or on-screen text.`;
export const PAPER_BALL_PART4_PROMPT = `THE PAPER BALL RICOCHET — EPISODE 4 (THE HOOP BONK)
AI VIDEO PROMPT

Create a 30-second, vertical 9:16, minimalist 2D stickman comedy animation. Continue directly from Part 3, using the exact same black stickman character with a round white head, thin black limbs, thick black outlines, and exaggerated angry reactions. Maintain the same simple white background, basketball court, and bright orange basketball. Flat 2D vector style, smooth animation, exaggerated cartoon physics, fast comedic timing, and a funny visual punchline. No dialogue, no subtitles, no on-screen text, no logos, and no watermark.

SCENE 1 — THE HOOP BONK (0–5 SECONDS):
Continue immediately after the stickman celebrates his successful basketball shot from Part 3. The basketball drops through the hoop, but the hoop suddenly shakes violently. The entire lightweight basketball hoop assembly tips forward and falls onto his head. The stickman disappears beneath the hoop and net, with only his tiny black legs sticking out. Pause for one beat. His legs twitch angrily. He pushes the hoop off, stands up with the net tangled around his head, and gives the hoop an absolutely furious stare.

SCENE 2 — THE OVERPREPARED PLAN (5–10 SECONDS):
He decides to prove that he is a basketball champion. He collects a huge pile of basketballs and stacks them in his arms until the pile is taller than his head. He takes one confident step, but a ball slips out and hits his foot. Every basketball scatters across the court. He stands frozen, then slowly clenches his fists.

SCENE 3 — THE GREAT BASKETBALL CHASE (10–15 SECONDS):
Basketballs roll in every direction. He runs after one, dives toward another, and slips on a third. He catches one ball triumphantly, but another rolls behind him and bumps his feet together. He spins uncontrollably and lands sitting on the court, holding the one basketball he managed to save. His face turns red with cartoon rage.

SCENE 4 — THE IMPOSSIBLE TRICK SHOT (15–21 SECONDS):
He takes a deep breath, carefully aims, and throws the ball with all his strength. It misses the hoop, bounces off the backboard support, ricochets off the floor, hits a wall, and returns across the court. The stickman ducks. The ball bounces one final time and somehow drops perfectly through the hoop. He slowly looks up, stunned by his accidental success.

SCENE 5 — THE CHAMPION CELEBRATION (21–26 SECONDS):
He celebrates wildly, flexing his arms, jumping in the air, and pretending to receive a championship trophy. He climbs onto a small podium made from stacked basketballs and raises both arms like a world champion. The basketballs beneath his feet begin wobbling. He tries to maintain his heroic pose, smiling proudly while his legs shake.

SCENE 6 — THE UNEXPECTED FINAL GAG (26–30 SECONDS):
The basketballs roll out from under the podium. The stickman drops safely onto his feet, but the net from the fallen hoop is still tangled around his head. As he proudly poses for the imaginary crowd, the net catches on the hoop's metal support. He takes one step forward, gets gently pulled backward, and ends up hanging upside down by the net just a few inches above the ground. His arms dangle motionlessly. He slowly turns his head toward the camera with an exhausted, furious stare. One basketball rolls past and stops beside him. He gives it a tiny angry kick while still upside down. The ball rolls away, and he swings helplessly. Cut to black.

Maintain consistent character design and continuity from Part 3. The first gag must be the basketball hoop assembly falling onto his head. Do not repeat the old final gag of a basketball hitting his face. End with the stickman trapped upside down in the net, delivering a silent, deadpan comedy punchline. Keep the action easy to understand, harmless, exaggerated, and visually funny.`;

export const TRICK_SHOT_PROMPT = `ANGRY STICKMAN: TRICK-SHOT CHAMPION — 60-SECOND AI VIDEO PROMPT

Create a 60-second vertical 9:16 2D stickman comedy animation. This is a direct continuation of the previous basketball story: the basketball hoop has just fallen onto the main character's head. The story follows his anger, repeated trick-shot failures, intense training, championship challenge, incredible final shot, and funny victory.

VISUAL STYLE:
Minimalist 2D vector animation, clean white background, simple basketball court, thick black outlines, round white head, thin black limbs, expressive angry face, bright orange basketball, gold trophy, smooth movement, exaggerated cartoon physics, dynamic camera angles, and quick comedic timing. Keep the same character design throughout. Use energetic modern pop instrumental music that gradually becomes epic during the final shot. No dialogue, no subtitles, no watermark, and no logos.

CHARACTERS:
ANGRY STICKMAN: Wants to master trick shots and become the greatest champion. He is stubborn, explosive, determined, and comically bad at first.
REFEREE: Wants to find a genuine trick-shot champion and award the golden trophy.

SCENE 1 — THE FINAL STRAW (0–7 SECONDS):
Start with the basketball hoop falling onto the stickman's head. He crawls out of the net, furious. He grabs the basketball and attempts a powerful trick shot. The ball hits the rim and bounces directly onto his forehead. His eye twitches. He clenches his fists and points angrily at the hoop. Hold a brief comedic pause.

SCENE 2 — THE FAILED TRICK SHOTS (7–16 SECONDS):
He tries throwing the ball backward over his head. It misses. He bounces it off a wall. It flies past the hoop. He attempts a between-the-legs shot, but the ball rolls backward and escapes. Every failure causes a more exaggerated angry reaction. He stomps, shakes his fists, and drops to his knees in frustration.

SCENE 3 — RAGE TRAINING (16–26 SECONDS):
Energetic modern pop music begins. Show a fast training montage: dribbling around cones, bouncing the ball off walls, practicing spinning throws, shooting from unusual angles, and attempting blindfolded shots. Balls fly everywhere. He slips, instantly gets back up, and continues. Show a calendar flipping through several days to communicate time passing. His throws gradually become more accurate.

SCENE 4 — THE CHAMPIONSHIP CHALLENGE (26–36 SECONDS):
A referee enters holding a large golden trophy and gestures toward a basketball hoop. The stickman understands that this is the championship challenge. He steps forward confidently, spins the ball on one finger, and poses for the crowd. He takes his first attempt, but it misses badly. His confident smile disappears. He takes a deep breath and focuses.

SCENE 5 — THE IMPOSSIBLE SHOT (36–49 SECONDS):
The stickman stands with his back to the hoop and throws the basketball backward over his shoulder. The ball bounces off a wall, strikes the floor, ricochets off the backboard, and spins around the rim. Use dramatic slow motion as the ball nearly falls out. Everyone holds their breath. The ball circles the rim one more time and drops cleanly through the hoop. The crowd explodes with excitement. The stickman stares in disbelief, then bursts into joyful celebration.

SCENE 6 — THE TRICK-SHOT CHAMPION (49–56 SECONDS):
The referee awards the stickman a giant golden trophy. Confetti rains down. The stickman raises the trophy above his head, jumps proudly, and poses like the greatest athlete in the world. The music reaches its triumphant peak.

SCENE 7 — THE FINAL GAG (56–60 SECONDS):
The stickman kisses the trophy and raises it overhead. Suddenly, one stray basketball falls from above and lands perfectly inside the trophy. The trophy tips forward and covers his entire head. His thin black legs stick out beneath it. Hold for one beat. One leg slowly rises to give a thumbs-up gesture. Cut to black on the final musical beat.

STORY REQUIREMENTS:
The opening must begin with the hoop falling onto his head. Show several different failed trick shots before the training montage. Make his determination and skill progression clear. The championship shot must be genuinely successful and spectacular. The final joke must involve the trophy covering his head, not another basketball hitting his face. Use no dialogue, no subtitles, no text, and no scene reset. Maintain consistent character design and clear visual storytelling from beginning to end.`;

export const POP_STAR_PROMPT = `MAX, REX & BEEP - A 58-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

Create a 58-second vertical 9:16 modern pop comedy animation for YouTube Shorts. Use colorful, polished 2D cartoon animation with clean outlines, expressive characters, vibrant concert lights, smooth movement, exaggerated physical comedy, and energetic original upbeat pop instrumental music. Keep all character designs consistent throughout.

CHARACTERS AND MOTIVATIONS:
MAX: A black stickman with a round white head, wearing a shiny purple pop-star jacket. He wants to become a famous singer and impress everyone. He is overconfident but easily embarrassed.
REX: A rival stickman with a round white head, a flashy blue jacket, and a confident attitude. He wants to steal Max's spotlight and become the most popular performer.
BEEP: A small white robot with blue glowing eyes, tiny wheels, and a cleaning brush. It only wants to clean the stage, but accidentally becomes an amazing performer.

SCENE 1 - 0-7 SECONDS:
Max watches a giant concert screen showing a cheering crowd. He imagines himself as a superstar under dazzling lights. He grabs a hairbrush as a microphone and poses dramatically. The hairbrush breaks apart in his hand. Show the on-screen caption: "MAX WANTS TO BE A SUPERSTAR!" Start upbeat pop music.

SCENE 2 - 7-14 SECONDS:
Rex enters the concert stage holding a sparkling microphone. He notices Max practicing, smirks, and pushes his way into the center spotlight. Max looks offended. They glare at each other as the music adds a dramatic beat. Caption: "REX WANTS ALL THE ATTENTION!"

SCENE 3 - 14-23 SECONDS:
Max begins an exaggerated dance routine, spinning and moonwalking before attempting a backflip. He lands in a tangled heap. Rex laughs and performs a perfect spin. Max stubbornly attempts a bigger jump, accidentally kicking his microphone into the audience. Caption: "MAX WANTS TO IMPRESS EVERYONE!"

SCENE 4 - 23-32 SECONDS:
Beep, a tiny cleaning robot, rolls onto the stage and sweeps up confetti. Max and Rex continue arguing in the background. Beep rolls over Max's dropped microphone, accidentally connecting it to the speakers. A funny electronic pop beat starts. Beep's wheels begin bouncing perfectly in rhythm. Caption: "BEEP JUST WANTS TO CLEAN!"

SCENE 5 - 32-43 SECONDS:
The robot accidentally activates the stage's dance mode. Its wheels spin, its head bobs, and its cleaning brush moves like a dance prop. Each motion matches the music perfectly. The crowd cheers wildly. The spotlight follows Beep. Max and Rex freeze in disbelief. Caption: "NOBODY EXPECTED THIS!"

SCENE 6 - 43-52 SECONDS:
Beep finishes a flawless spin and bows. Confetti rains down. The crowd treats it like a superstar. Max tries copying its dance and falls flat on the stage. Rex tries the same spin, loses control, and slides into a pile of soft cushions beside the stage. Beep calmly resumes cleaning. Caption: "BEEP BECOMES THE STAR!"

SCENE 7 - 52-58 SECONDS:
Max and Rex reluctantly clean the confetti together. Beep rolls past wearing a tiny golden crown. It pauses, removes the crown, and drops it into the trash to continue its cleaning task. Max and Rex stare at each other with shocked expressions. Beep rolls away while dancing to the music. Finish on a strong musical beat. Caption: "FOLLOW YOUR DREAM... OR JUST CLEAN UP!"

STYLE AND EDITING:
Use vibrant purple, blue, pink, and cyan stage lighting; dynamic but readable camera movement; funny pauses before each punchline; smooth 2D animation; clear body language; and consistent character proportions. Keep the tone family-friendly. Use original instrumental pop music without copyrighted songs. All captions must be large, readable, correctly spelled, and timed to their scenes. Do not add any other dialogue or unnecessary text.`;

export const SHADOW_QUIT_PROMPT = `WHAT IF YOUR SHADOW QUIT? — AI VIDEO PROMPT

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

export const PAPER_BALL_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Aim & Wind-Up",
    timeRange: [0.0, 2.0],
    videoPrompt:
      "A pure white room in 9:16 vertical view. On the left, a simple black stickman with a round head sits at a minimalist desk, clutching a crumpled white paper ball. Above him, a black 3-blade ceiling fan rotates smoothly at a relaxed, calm pace. On the far right floor sits a small black wastebasket. On the desk rests a geometric table lamp. The stickman squints with exaggerated concentration, aiming at the trash can.",
    animationDesc: "Ceiling fan spins smoothly and calmly. Stickman performs deliberate wind-up, eye tracking forward.",
    soundDesc: "Subtle rhythmic wind-up.",
    punchline: "Dead-serious concentration for a simple wastebasket toss.",
    characterAction: "Squints with intense focus, measures trajectory, cocks throwing arm back.",
    propAction: "Ceiling fan rotates calmly, table lamp steady.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "The Graceful Arc Toss",
    timeRange: [2.0, 4.4],
    videoPrompt:
      "The stickman launches the crumpled paper ball with snappy elastic cartoon release. The white crumpled ball flies in a high, graceful parabolic arc across the room towards the small black trash can. The stickman leans back with smug confidence, resting chin in palm.",
    animationDesc: "Elastic arm snap, clear slow-motion ball tracking across room, anticipation posture.",
    soundDesc: "Snappy cartoon whoosh sound at 2.0s.",
    punchline: "Smug satisfaction before the impending chaos.",
    characterAction: "Snappy release, crosses legs, watches smugly.",
    propAction: "Paper ball travels in high readable arc over the desk.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "Rim Clip & Reverse Bounce",
    timeRange: [4.4, 6.0],
    videoPrompt:
      "The paper ball clips the front metal rim of the small black trash can at 4.4s. It squashes elastically, hangs for a comedic beat at the apex, and ricochets cleanly backwards in a high readable lob toward the desk lamp. The stickman's smug smile begins to drop into an open-mouthed 'O' in sudden alarm.",
    animationDesc: "Rim impact squash at 4.4s, readable reverse ricochet arc, stickman mouth opens in alarm.",
    soundDesc: "Metallic rim clink at 4.4s.",
    punchline: "The paper ball reverses course with impossible geometric precision.",
    characterAction: "Eyes widen in sudden alarm, tracks ball reversing towards him.",
    propAction: "Trash can vibrates; ball arcs toward table lamp.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "Table Lamp Ding & Fan Ascent",
    timeRange: [6.0, 7.5],
    videoPrompt:
      "The ball strikes the table lamp on the desk with a resonant brass ding at 6.0s. The lampshade rocks back and forth with an elastic cartoon wobble. The ball ricochets straight up in a high vertical lob towards the ceiling fan as the stickman throws a hand up in panic.",
    animationDesc: "Lamp strike at 6.0s, lampshade oscillation wobble, vertical ball ascent toward fan.",
    soundDesc: "Resonant brass lamp bell ding at 6.0s.",
    punchline: "The table lamp acts like a pinball bumper.",
    characterAction: "Throws hand up in alarm, head whips up towards the ceiling.",
    propAction: "Lampshade wobbles back and forth elastically.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "Fan Batting, Forehead Bonk & Deadpan",
    timeRange: [7.5, 10.0],
    videoPrompt:
      "The rotating ceiling fan blade sweeps by and bats the ball with a solid WHACK at 7.5s! The ball arcs across to the right wall at 8.6s, rebounds horizontally, and strikes the stickman squarely in the forehead with a cartoon BONK at 9.4s! The ball drops softly onto the desk at 9.6s. Complete silence. The stickman blinks slowly, staring deadpan at the paper ball.",
    animationDesc: "Fan blade strike at 7.5s, wall bounce at 8.6s, forehead bonk at 9.4s, ball drops to desk at 9.6s, slow deadpan blink at 9.8s.",
    soundDesc: "Heavy fan WHACK at 7.5s, wall bounce at 8.6s, forehead BONK at 9.4s, soft plop at 9.6s, deadpan silence.",
    punchline: "The ball lands exactly where it started; total deadpan resignation.",
    characterAction: "Head snaps back on impact, dazed spiral eyes, then delivers a long deadpan slow blink.",
    propAction: "Paper ball rolls 2 inches on desk and rests peacefully in front of stickman.",
  },
];

export const PAPER_BALL_30_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The No-Look Miss",
    timeRange: [0.0, 4.0],
    videoPrompt:
      "Pure white vertical room. A black stickman with a round white head stands beside a table, holding a crumpled paper ball. Without looking, he casually flicks the ball toward a small trash can on the right. The ball sails past the rim and smacks the right wall with a flat cartoon impact. The stickman slowly turns his head toward the camera, one eyebrow climbing into an awkward, deadpan stare.",
    animationDesc:
      "Relaxed no-look toss at 0.8s, wall impact at 1.8s, slow head turn to camera from 2.2s to 3.4s, awkward eyebrow hold.",
    soundDesc: "Casual toss whoosh at 0.8s, flat wall thud at 1.8s, then an uncomfortable silence.",
    punchline: "The confidence of a trick-shot champion, the accuracy of a blindfolded tourist.",
    characterAction: "Casual flick, unbothered follow-through, slow awkward turn to camera with a raised eyebrow.",
    propAction: "Paper ball clips nothing, hits the right wall, and drops out of sight beside the trash can.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "The Scientific Method",
    timeRange: [4.0, 8.0],
    videoPrompt:
      "The stickman produces a thin ruler and a small blank calculator. He holds the ruler toward the trash can, studies the angle, punches silent buttons on the calculator, and widens his stance like an engineer preparing a moon launch. He nods, tucks the tools away, and gives himself a crisp thumbs-up with a confident eyebrow.",
    animationDesc:
      "Ruler and calculator reveal at 4.3s, two measuring poses, two small calculator button presses, wide stance at 5.9s, confident thumbs-up and nod at 6.6s.",
    soundDesc: "Two calculator beeps, a light ruler tap, a third confirmation beep, and a tiny confident ding.",
    punchline: "Extremely rigorous science for a distance of four feet.",
    characterAction: "Measures, calculates, adjusts stance, nods, delivers a self-satisfied thumbs-up.",
    propAction: "Ruler points at the trash can; calculator buttons blink silently; both tools disappear behind his back.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Rebound Bonk",
    timeRange: [8.0, 11.0],
    videoPrompt:
      "The stickman winds up with far too much confidence and hurls the paper ball at the wall. It rebounds straight back and bonks him in the forehead. His eyes cross, his body locks into a rigid freeze, and three tiny black birds circle his head in a lazy orbit.",
    animationDesc:
      "Oversized wind-up at 8.2s, hard throw at 8.5s, wall rebound at 9.0s, forehead bonk at 9.6s, frozen cross-eyed wobble, and circling birds through 11.0s.",
    soundDesc: "Hard throw whoosh at 8.5s, elastic wall bounce at 9.0s, hollow forehead bonk at 9.6s, then dizzy silence.",
    punchline: "Physics remains undefeated.",
    characterAction: "Overcommitted throw, head snaps back on impact, eyes cross, body freezes, birds orbit.",
    propAction: "Ball hits the right wall, rebounds across the room, bonks his forehead, and drops out of frame.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Absurd Training Montage",
    timeRange: [11.0, 15.0],
    videoPrompt:
      "Furious, the stickman shakes off the dizziness and begins an absurd training montage. He stretches both arms overhead, performs two tiny squats, rotates his throwing arm in fast circles, and flexes dramatically. He finishes by leaning forward and glaring at the trash can like a rival champion.",
    animationDesc:
      "Anger shake at 11.1s, overhead stretch at 11.6s, two quick squats from 12.4s to 13.2s, full arm circles from 13.3s to 14.0s, double-bicep flex at 14.2s, forward glare at 14.7s.",
    soundDesc: "Training music bed, cloth squeaks on the stretch, two squat thumps, a circular arm whoosh, and a final flex squeak.",
    punchline: "A full athletic regimen for the most important crumpled ball in the world.",
    characterAction: "Stretches, squats, arm circles, flexes, then locks eyes on the trash can with comic intensity.",
    propAction: "Trash can remains perfectly still, which only makes him angrier.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Pinball Ricochet",
    timeRange: [15.0, 19.0],
    videoPrompt:
      "The stickman launches the paper ball. It ricochets off the table lamp, bounces across the tabletop, clips the spinning ceiling fan, and changes direction toward the trash can. Fast camera pans and clean black motion trails follow the ball. The stickman's rage melts into wide-eyed confusion.",
    animationDesc:
      "Throw at 15.6s, lamp strike at 16.3s, tabletop bounce at 17.0s, fan clip at 17.7s, curving trajectory toward the trash can through 19.0s, camera pans with each impact.",
    soundDesc: "Throw whoosh, lamp bell ding at 16.3s, table thump at 17.0s, fan WHACK at 17.7s, and a fast ricochet whoosh.",
    punchline: "The room becomes a pinball machine and the stickman forgets which team he is on.",
    characterAction: "Confident throw becomes a chain of flinches, head whips, and open-mouthed confusion.",
    propAction: "Lamp wobbles, table vibrates, fan blade flexes, and the ball carves a zigzag toward the trash can.",
  },
  {
    id: 6,
    name: "Scene 6",
    title: "The Slow-Motion Drop",
    timeRange: [19.0, 23.0],
    videoPrompt:
      "Close-up on the paper ball descending toward the trash can in exaggerated slow motion. The stickman grips his head with both hands, holds his breath, and slowly opens one eye, then the other. A tense pause hangs in the air before the ball can land.",
    animationDesc:
      "Ball hangs above the rim through 19.0s to 23.0s, stickman grips head at 19.6s, one eye opens at 21.0s, second eye opens at 22.0s, held-breath pause at 22.5s.",
    soundDesc: "Slow suspenseful heartbeat at 19.3s, 20.3s, 21.3s, and 22.2s, with a final hush.",
    punchline: "Four seconds of pure anxiety over a ball that has already decided what it is going to do.",
    characterAction: "Grips head, holds breath, squints, opens eyes one at a time, freezes in suspense.",
    propAction: "Ball rotates and drifts downward in slow motion, hovering just above the trash can rim.",
  },
  {
    id: 7,
    name: "Scene 7",
    title: "Championship Celebration",
    timeRange: [23.0, 27.0],
    videoPrompt:
      "The paper ball drops perfectly into the trash can with a satisfying plop. The stickman erupts into an over-the-top celebration: jumping, pumping both fists, miming the lift of a championship trophy, and proudly pointing at the camera. His eyebrows and grin are huge and triumphant.",
    animationDesc:
      "Ball lands at 23.0s, disbelief beat, first jump at 23.6s, fist pumps through 24.8s, championship trophy pose at 25.4s, camera point at 26.2s, victory dance moves him beside the trash can.",
    soundDesc: "Trash plop at 23.0s, triumphant victory fanfare from 23.6s, and celebratory movement accents.",
    punchline: "A legendary victory over a wastebasket.",
    characterAction: "Jumps, pumps fists, holds an imaginary trophy overhead, points at the viewer with a smug grin.",
    propAction: "Trash can remains upright and victorious until the very last beat of the dance.",
  },
  {
    id: 8,
    name: "Scene 8",
    title: "The Accidental Crash",
    timeRange: [27.0, 30.0],
    videoPrompt:
      "During the final victory dance, the stickman accidentally kicks the trash can over. Paper balls spill across the floor. The music stops instantly. He freezes with his arms still raised, slowly lowers them, looks down at the mess, then turns to the camera with a defeated deadpan stare.",
    animationDesc:
      "Kick connects at 27.0s, trash can tips, paper balls spill, arms lower from 27.3s to 28.0s, head turns to the mess, then a slow deadpan look to camera through 30.0s.",
    soundDesc: "Sharp crash at 27.0s, instant music cutoff, bouncing paper-ball plops, then a mournful sad trombone.",
    punchline: "The greatest victory of his life lasts exactly four seconds.",
    characterAction: "Frozen mid-dance, arms drop, shoulders slump, deadpan camera stare held to the final frame.",
    propAction: "Trash can tips over and spills a pile of crumpled paper balls across the white floor.",
  },
];

export const SHADOW_QUIT_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Perfect Relationship",
    timeRange: [0.0, 2.0],
    videoPrompt:
      "A clean white canvas fills the vertical frame. A small black stick figure walks happily from left to right with an exaggerated, springy stride. Its round head bobs gently, its arms swing naturally, and its feet make quick, confident steps. Directly beneath its feet, a solid black shadow follows perfectly, matching every step with flawless synchronization. At approximately 1.2 seconds, the figure performs one particularly cheerful little skip. The shadow copies it exactly.",
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
      "Without warning, the shadow abruptly stops moving. The stick figure continues walking to the right, taking two more steps while its shadow remains frozen in place. The shadow stretches away from the figure's feet and detaches cleanly from the ground, remaining as a solid black silhouette. The stick figure takes one final step, pauses, and begins to notice that something is wrong. Its head slowly tilts backward, but the rest of its body stays facing forward.",
    animationDesc: "Sudden stop at 2.0s, continued walking, clean separation of shadow from feet, delayed head turn.",
    soundDesc: "A sharp record scratch exactly when the shadow stops, followed by a tiny awkward silence.",
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
      "The detached shadow rises vertically from the floor and transforms into an upright, featureless black silhouette with two arms and two legs. It reaches behind its back and produces a tiny white clipboard with one blank sheet of paper. The clipboard must remain simple and completely text-free. The shadow holds the clipboard, taps the blank page twice with one finger, then points accusingly toward the stick figure. The stick figure slowly straightens its posture, looking increasingly uncomfortable.",
    animationDesc: "Smooth rise, confident clipboard reveal, two precise taps, pointed accusation.",
    soundDesc: "Paper slap, two quick tapping sounds, and one tiny dry click.",
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
      "The shadow lowers itself onto the white floor, sits cross-legged, folds both arms tightly across its chest, and refuses to move. The stick figure cautiously approaches, stops a short distance away, and gives a small friendly wave. The shadow slowly turns its entire upper body toward the figure, pauses, and gives an exaggeratedly slow head shake. The stick figure's shoulders slump. Its arms gradually fall to its sides.",
    animationDesc: "Controlled sitting motion, slow wave, long unimpressed pause, defeated shoulder slump.",
    soundDesc: "Soft floor-contact thump followed by a tiny squeak as the shadow crosses its arms.",
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
      "The shadow suddenly stands up, turns directly toward the viewer, and delivers an exaggeratedly slow, unmistakable thumbs-down gesture. Behind it, the stick figure raises both hands in complete confusion, then points at itself as if asking, 'Me?' The shadow holds the thumbs-down pose for a full beat. At 9.3 seconds, the shadow turns its back on the stick figure and walks out of frame independently, leaving the figure standing alone on the white background.",
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

export const PAPER_BALL_SEQUEL_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Accusation",
    timeRange: [0.0, 3.0],
    videoPrompt:
      "Direct sequel opening. The same white room, now showing the aftermath of the last episode: the small black trash can lies overturned on its side at the right of the floor with crumpled paper balls scattered around it. The stickman stands in the middle of the room, shoulders low, staring at the mess with a flat, defeated expression. He slowly turns his head toward the overturned can, raises one arm and points at it accusingly, then drops both hands and clenches his fists tight.",
    animationDesc:
      "0.0-1.2s silent stare at the mess with drooping shoulders, 1.2-2.0s slow head turn toward the can, 2.0-2.6s accusatory point, 2.6-3.0s both fists clench with an anger mark.",
    soundDesc: "Low dramatic rumble under the opening stare, a hard fist clench at 2.7s.",
    punchline: "He blames the trash can for the entire previous episode.",
    characterAction: "Stares at the mess, turns, points accusingly at the can, clenches both fists.",
    propAction: "Overturned trash can and five scattered crumpled paper balls sit in the mess.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "Ritual of Preparation",
    timeRange: [3.0, 7.0],
    videoPrompt:
      "He marches to the overturned trash can, grabs it, and stands it back upright with a heavy thunk. He pulls out a ruler, stretches it toward the can, and squints while measuring the distance. He then gathers the scattered paper balls and lines up five of them neatly in a row on the floor in front of him. He cracks his knuckles, plants his feet, and strikes a professional trick-shot champion pose: chest out, chin up, one raised eyebrow, hands on hips.",
    animationDesc:
      "3.0-3.9s can rights itself with a thunk, 4.2-5.2s ruler measurement, 5.4-6.1s five balls slide into a row, 6.2-6.7s knuckle cracks, 6.7-7.0s champion pose.",
    soundDesc: "Can thunk, ruler tap, five soft mechanical clicks as the balls line up, two knuckle cracks.",
    punchline: "Maximum ceremony for a shot he has not taken yet.",
    characterAction: "Rights the can, measures with a ruler, lines up five balls, cracks knuckles, poses proudly.",
    propAction: "Trash can stands upright again, ruler appears, five paper balls line up on the floor.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "Five Straight Misses",
    timeRange: [7.0, 11.0],
    videoPrompt:
      "Rapid-fire slapstick. He throws five paper balls in quick succession and misses five different ways. Ball one sails straight up and bonks the ceiling. Ball two drops short and bounces off his own foot. Ball three slams into the right wall and rebounds. Balls four and five whistle over his shoulder and land behind him. With every miss his champion smile collapses a little further until he is standing there with a completely flat, betrayed stare.",
    animationDesc:
      "Throws at 7.3s, 8.05s, 8.75s, 9.55s and 10.25s. Ceiling bonk at 7.75s, foot bonk at 8.35s, wall rebound at 9.15s, two balls land behind him at 10.2s and 10.9s. Smile fades from grin to flat by 10.4s.",
    soundDesc: "Five throw whooshes, ceiling bonk, foot bonk, wall bounce.",
    punchline: "Five throws, five completely different ways to miss.",
    characterAction: "Confident grin drains away into a flat, betrayed deadpan.",
    propAction: "Each paper ball takes a different ridiculous path before landing.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "Rage, Then Diplomacy",
    timeRange: [11.0, 15.0],
    videoPrompt:
      "He trembles with rage, steam curling off him, fists clenched so hard his arms shake, and he stomps the floor twice hard enough to crack lines into the ground. He is about to explode, then he stops, takes one enormous deep breath with his eyes closed, and forces an exaggeratedly fake peaceful smile: eyes closed in cheerful arcs, huge grin, hands folded politely. It is the least convincing calm in the history of cartoons.",
    animationDesc:
      "11.0-12.3s rage tremble with anger mark, 12.3-12.7s first stomp, 12.7-13.2s tremble, 13.2-13.5s second stomp, 14.0-14.5s deep breath, 14.5-15.0s fake peaceful smile.",
    soundDesc: "Rage rumble, two heavy floor stomps, a long deep inhale, then a calming chime.",
    punchline: "Absolute rage converted into a suspiciously calm smile.",
    characterAction: "Trembles, stomps twice, clenches fists, breathes deeply, forces a fake peaceful smile.",
    propAction: "Dust lines flick out from the stomping foot, steam puffs from his head.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "Improvised Arsenal",
    timeRange: [15.0, 19.0],
    videoPrompt:
      "With grim determination he builds an absurdly complicated paper-ball launcher: a stack of books as a base, a ruler propped across them, and two stretched rubber bands holding a paper ball. Mechanical clicks punctuate every assembly step. He then puts on imaginary safety goggles, drawn as a dashed outline around his eyes, and leans toward the camera to give an enormous smug thumbs-up.",
    animationDesc:
      "15.0-15.6s books grabbed, 15.6-16.4s books placed, 16.4-17.0s ruler mounted, 17.0-17.6s rubber bands stretched, 17.6-18.2s dashed safety goggles appear, 18.2-19.0s camera push-in on a smug thumbs-up.",
    soundDesc: "Mechanical clicks, a rubber-band twang, a small smug confidence ding.",
    punchline: "Engineering a solution with a ruler, two bands, and a pile of books.",
    characterAction: "Builds the launcher piece by piece, wears imaginary goggles, smug thumbs-up to camera.",
    propAction: "Books, ruler, rubber bands, and a loaded paper ball form a homemade launcher.",
  },
  {
    id: 6,
    name: "Shot 6",
    title: "Over-Powered",
    timeRange: [19.0, 23.0],
    videoPrompt:
      "The launcher fires with wildly excessive force. The paper ball ricochets off the table lamp, clips the spinning ceiling fan, and rockets back toward the stickman. His pupils shrink to tiny dots, his brows lift in pure panic, and he throws both hands up as the ball grows larger in frame.",
    animationDesc:
      "19.0s launch, 19.85s lamp ricochet, 20.55s fan clip, 20.9-22.9s ball rockets back toward him, pupils shrink from 22.0s, hands fly up in panic.",
    soundDesc: "Launch blast, lamp ding, fan whack, two rising ricochet whooshes.",
    punchline: "The machine works perfectly and is aimed directly at his own face.",
    characterAction: "Panics with shrinking pupils and both hands thrown up in front of his face.",
    propAction: "Ball ricochets off lamp and fan, then rockets back at the stickman.",
  },
  {
    id: 7,
    name: "Shot 7",
    title: "Impossible Sink",
    timeRange: [23.0, 27.0],
    videoPrompt:
      "At the last possible frame he ducks, and the ball sails over his head in a wide arc and drops perfectly into the upright trash can with a satisfying plop. He slowly turns around and looks behind him in total disbelief, then whirls back to the camera, points proudly at himself with both thumbs, and bounces in a tiny victory dance while fanfare music plays.",
    animationDesc:
      "23.0-23.4s duck, 23.4-24.0s ball arcs overhead, 24.0s plop into the can, 24.0-24.9s he looks behind him, 24.9-27.0s double thumbs to himself with a victory bounce.",
    soundDesc: "Soft plop into the can, then a triumphant victory fanfare.",
    punchline: "Accidentally the greatest shot of his life, and he knows it.",
    characterAction: "Ducks in time, checks behind him in disbelief, points at himself with both thumbs.",
    propAction: "The paper ball drops dead center into the trash can.",
  },
  {
    id: 8,
    name: "Shot 8",
    title: "Instant Regret",
    timeRange: [27.0, 30.0],
    videoPrompt:
      "He celebrates wildly, arms thrown up, hopping with joy. The homemade launcher cannot take it: the rubber bands snap, the ruler flies apart, and the stack of books launches into the air. One book lands squarely on his head with a hollow bonk. He freezes instantly, arms slowly lowering, and gives the camera a defeated, deadpan stare while the sad trombone slides in. End on the same pure white background and the same character design.",
    animationDesc:
      "27.0-27.6s wild celebration, 27.6-28.0s launcher snaps and books fly, 28.0-28.45s books scatter, 28.45s book lands on his head, 28.6-30.0s frozen deadpan stare at camera.",
    soundDesc: "Sharp crash as the launcher snaps, a hollow book bonk, then a mournful sad trombone.",
    punchline: "The greatest victory of his life lasts about four seconds again.",
    characterAction: "Celebrates wildly, freezes with a book on his head, deadpan stare into the camera.",
    propAction: "Launcher snaps apart, books fly through the air, one book lands on his head.",
  },
];

export const PAPER_BALL_PART3_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Book Incident",
    timeRange: [0.0, 2.0],
    videoPrompt:
      "A plain white room. A book drops straight down out of frame and lands flat on the stickman's round white head with a hollow bonk. He freezes completely, then slowly clenches both fists and glares furiously at the book sitting on his head.",
    animationDesc:
      "0.0-0.62s the book falls and bonks him, 0.62-1.1s he freezes in shock, 1.1-2.0s his fists clench and his face turns to a furious glare.",
    soundDesc: "A low dramatic rumble, a hollow cartoon book bonk, a hard fist clench.",
    punchline: "A book lands on his head and he blames the book.",
    characterAction: "Freezes, clenches both fists, glares furiously upward at the book on his head.",
    propAction: "The book drops from above and stays balanced on his head.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "The Long Walk",
    timeRange: [2.0, 7.0],
    videoPrompt:
      "Far off in the distance a tiny basketball court with one hoop becomes visible on the horizon. The stickman spots it, gets a determined look and marches across a long sidewalk toward it with exaggerated tiny fast steps and swinging arms, imagining himself as a champion. The court stays far away the whole time. He gets exhausted, sweats, drags his feet, stops to catch his breath with his hands on his knees, and looks annoyed at how far he still has to go, before finally arriving.",
    animationDesc:
      "2.0-3.6s determined march with tiny fast steps, 3.6-4.8s he runs out of steam, 4.8-5.6s he drags his feet, 5.6-6.3s he stops bent over catching his breath, 6.3-6.9s he points at the still-distant court in annoyance, 6.9-7.0s he arrives.",
    soundDesc: "A march for the walk, squeaky shoes, heavy panting, an annoyed sigh.",
    punchline: "A five-second journey that feels like a marathon.",
    characterAction: "Marches, tires out, drags his feet, catches his breath, then glares at the distance.",
    propAction: "The court stays small in the distance while sidewalk seams scroll past.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "Arrival",
    timeRange: [7.0, 9.0],
    videoPrompt:
      "He finally reaches the minimalist outdoor basketball court, the book finally sliding off his head. Bent over, he catches his breath, then straightens up and picks up the orange basketball from the ground. He looks up at the hoop with extreme confidence, smug grin, and readies his first shot.",
    animationDesc:
      "7.0-7.5s he bends over breathing hard as the book slides off, 7.5-8.2s he straightens and picks the ball up, 8.2-9.0s he eyes the hoop with a smug grin and sets his feet.",
    soundDesc: "The book thumping to the floor, a basketball pickup bounce.",
    punchline: "All that walking for one orange ball.",
    characterAction: "Catches his breath, picks up the ball, and aims with smug confidence.",
    propAction: "The book slides off his head; the ball leaves the ground into his hands.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "First Failures",
    timeRange: [9.0, 14.0],
    videoPrompt:
      "He aims and throws. The ball misses the hoop, rattles the rim and rockets straight back into his face with a bonk, snapping his head backward. He catches the ball, looks absolutely furious and immediately tries again. The second shot hits the backboard and bounces off his forehead, sending him stumbling backward in disbelief.",
    animationDesc:
      "9.2-9.78s the first throw, 9.78-10.12s the rim rebound into his face, 10.12-10.4s his head snaps back, 10.5-10.85s he catches the ball and glares, 10.85-11.22s the second throw, 11.22-11.52s the backboard hit, 11.52-12.0s it bounces off his forehead and he stumbles back.",
    soundDesc: "Throw whooshes, a rim clink, two hard cartoon bonks, a stumble thud.",
    punchline: "The ball knows him better than he knows the hoop.",
    characterAction: "Head snaps back from the rebound, then stumbles backward off the backboard.",
    propAction: "The ball rattles the rim and then the backboard on consecutive attempts.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "Failure Montage",
    timeRange: [14.0, 19.0],
    videoPrompt:
      "Fast-cut failure montage. He throws again and the ball flies off sideways; another attempt rattles the rim and bounces into his face; another bounces off the ground and hits his head. Every failure gets a different exaggerated reaction: a shocked freeze, a furious eye twitch, stomping feet, shaking fists and finally a dramatic wail of frustration. The speed and absurdity keep increasing.",
    animationDesc:
      "14.1-14.75s a sideways miss and a shocked freeze, 15.0-15.62s a rim rebound into the face with an eye twitch, 16.0-16.72s a floor bounce into his head with stomping feet, 17.0-17.6s a wild miss and shaking fists, 18.0-19.0s the last attempt and a dramatic wail.",
    soundDesc: "Rapid throw whooshes, rim clinks, bonks, a comic womp, and a frustrated wail.",
    punchline: "Five shots, five new ways to embarrass himself.",
    characterAction: "Shocked freeze, eye twitch, stomping, shaking fists, wailing frustration.",
    propAction: "The ball misses sideways, hits the rim, and bounces off the floor into his head.",
  },
  {
    id: 6,
    name: "Shot 6",
    title: "Calm Down",
    timeRange: [19.0, 21.0],
    videoPrompt:
      "He is about to explode with rage, trembling and fuming. Then he stops, takes one enormous deep breath with his eyes closed, slowly relaxes his fists, carefully positions his feet and aims with intense concentration at the hoop.",
    animationDesc:
      "19.0-19.9s he trembles with rage, 19.9-20.4s one huge deep breath, 20.4-20.7s the fists relax and the eyes stay closed, 20.7-21.0s he opens his eyes, sets his feet and aims.",
    soundDesc: "A rage rumble, a long deep inhale, a single calming chime.",
    punchline: "The only way to make a free throw is to stop trying.",
    characterAction: "Rages, breathes deeply, relaxes, then aims with total focus.",
    propAction: "The ball waits in his hands while he composes himself.",
  },
  {
    id: 7,
    name: "Shot 7",
    title: "The Perfect Shot",
    timeRange: [21.0, 25.0],
    videoPrompt:
      "He releases one perfect shot and the film switches to dramatic slow motion. The basketball sails along a beautiful high arc toward the hoop while the stickman watches with wide eyes and clasped hands. It rolls around the rim twice, wobbling on the edge, and then drops cleanly through the net with a satisfying swish.",
    animationDesc:
      "21.0-21.2s the release, 21.2-23.2s a slow-motion high arc with the camera tracking the ball, 21.6-24.6s he watches with wide eyes and clasped hands, 23.2-24.75s the ball circles the rim twice, 24.75-25.0s it drops through the net.",
    soundDesc: "A release whoosh, a slow-motion swoosh, two rim rattles, then the swish.",
    punchline: "One shot, two circles, and it finally goes in.",
    characterAction: "Holds the follow-through with clasped hands and wide, hopeful eyes.",
    propAction: "The ball arcs high, circles the rim twice and drops through the net.",
  },
  {
    id: 8,
    name: "Shot 8",
    title: "Champion Celebration",
    timeRange: [25.0, 28.0],
    videoPrompt:
      "He jumps, pumps both fists and celebrates like he has just won a championship, then flexes proudly and dances beside the hoop while an imaginary crowd roars for him.",
    animationDesc:
      "25.0-25.6s the swish lands and he explodes into celebration, 25.6-26.3s he pumps his fists, 26.3-26.8s he flexes proudly, 26.8-28.0s he dances beside the hoop with sparkles.",
    soundDesc: "A triumphant fanfare and a big imaginary crowd cheer.",
    punchline: "A championship ceremony for an audience of absolutely nobody.",
    characterAction: "Jumps, pumps his fists, flexes and dances beside the hoop.",
    propAction: "The ball drops through the net and rolls to the floor behind him.",
  },
  {
    id: 9,
    name: "Shot 9",
    title: "The Hoop Falls On Him",
    timeRange: [28.0, 30.0],
    videoPrompt:
      "The unstable basketball hoop tips over behind him and the whole thing comes down on his head with a loud cartoon BONK — backboard, rim and net all crashing onto him. The basketball bounces out of the way. He is left dazed and hurt, wobbling with crossed eyes, then he slowly lowers his arms, turns toward the camera and gives an unbelievably furious stare with one twitching eye. Cut to black immediately.",
    animationDesc:
      "28.0-28.45s the hoop tips over and the backboard comes down on his head, 28.45-29.1s he is dazed and hurt with crossed eyes, 29.1-29.9s he turns to camera with a furious stare and a twitching eye, 29.9s cut to black.",
    soundDesc: "A basketball bounce, a loud cartoon bonk as the backboard lands, then a mournful sad trombone.",
    punchline: "The championship trophy and the championship are both on his head.",
    characterAction: "Bonked by the falling hoop, dazed and hurt, then a furious deadpan stare at the camera.",
    propAction: "The basketball hoop tips over and lands on his head, net and all.",
  },
];

export const PAPER_BALL_PART4_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Hoop Bonk",
    timeRange: [0.0, 5.0],
    videoPrompt:
      "A continuation of Part 3 on the same minimalist outdoor court. A basketball drops through the hoop, but the hoop suddenly shakes violently. The whole lightweight assembly tips forward and crashes down onto the stickman's head, hiding him completely under the backboard and net — only his tiny black legs stick out of the pile. After one dead beat his legs twitch angrily, he shoves the hoop off himself, stands up with the net tangled around his head, and glares at the hoop with pure fury.",
    animationDesc:
      "0.0-1.0s the ball drops through the hoop, 1.0-1.9s the hoop shakes violently, 1.9-2.6s the assembly tips onto his head, 2.6-3.6s only his legs stick out while he freezes, 3.6-4.3s the legs twitch, 4.3-5.0s he pushes the hoop off and glares at it with the net on his head.",
    soundDesc: "A swish, a metal creak, a heavy bonk, a shove-off thud.",
    punchline: "The championship trophy is also a weapon.",
    characterAction: "Vanishes under the fallen hoop, twitches his legs, then stands up furious with the net tangled on his head.",
    propAction: "The entire hoop assembly tips forward and lands on top of him.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "The Overprepared Plan",
    timeRange: [5.0, 10.0],
    videoPrompt:
      "Deciding to prove he is a basketball champion, he collects a huge pile of orange basketballs and stacks them in his arms until the pile is taller than his head. He takes one confident step. A ball slips out, hits his foot, and the entire pile scatters across the court. He stands frozen in the middle of the mess, then slowly clenches his fists.",
    animationDesc:
      "5.0-6.6s the pile grows in his arms until it is taller than his head, 6.6-7.4s one confident step, 7.4-7.8s a ball slips out and hits his foot, 7.8-9.0s every ball scatters across the court, 9.0-10.0s he freezes and clenches his fists.",
    soundDesc: "A pickup thump, a foot bonk, a scatter of bouncing balls.",
    punchline: "Preparation so extreme it becomes the problem.",
    characterAction: "Stacks an absurd pile of balls, fumbles it, then freezes and clenches his fists.",
    propAction: "The pile of basketballs collapses and scatters all over the court.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "The Great Basketball Chase",
    timeRange: [10.0, 15.0],
    videoPrompt:
      "Basketballs roll in every direction and he chases them. He runs after one, dives toward another and slips on a third. He finally catches one triumphantly — but another rolls in behind him and bumps his feet together. He spins uncontrollably and lands sitting on the court, still clutching the one basketball he managed to save, his face flushed red with cartoon rage.",
    animationDesc:
      "10.0-11.0s he runs after a rolling ball, 11.0-12.0s he dives for another, 12.0-12.8s he slips, 12.8-13.5s he catches one, 13.5-14.4s a ball bumps his feet together, 14.4-15.0s he spins and lands sitting, face flushed with rage.",
    soundDesc: "Squeaky running, a slip, a catch, a spinning landing thud.",
    punchline: "One ball saved, ten still rolling, and a face that could boil water.",
    characterAction: "Runs, dives, slips, catches one, spins and lands sitting with a red, furious face.",
    propAction: "A ball sneaks up behind him and knocks his feet together.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "The Impossible Trick Shot",
    timeRange: [15.0, 21.0],
    videoPrompt:
      "He takes a deep breath, carefully aims and throws the ball with all his strength. It misses the hoop, bounces off the backboard support, ricochets off the floor, hits the wall and comes back across the court. He ducks. The ball bounces one final time and somehow drops perfectly through the hoop. He slowly looks up, stunned by his accidental success.",
    animationDesc:
      "15.0-15.6s a deep breath and a careful aim, 15.6-16.1s the throw, 16.1-17.0s it misses and hits the backboard support, 17.0-17.8s it ricochets off the floor, 17.8-18.6s it hits the wall and returns, 18.6-19.2s he ducks, 19.2-20.8s one final bounce drops it perfectly through the hoop, 20.8-21.0s he stares up, stunned.",
    soundDesc: "A deep inhale, a throw whoosh, a support clink, two bounces and a swish.",
    punchline: "A shot that missed everything and still went in.",
    characterAction: "Ducks the returning ball, then stares up at the hoop in disbelief.",
    propAction: "The ball ricochets off the support, the floor and the wall, then drops straight through the hoop.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "The Champion Celebration",
    timeRange: [21.0, 26.0],
    videoPrompt:
      "He celebrates wildly: flexing his arms, jumping in the air, and pretending to receive a championship trophy from an imaginary crowd. He climbs onto a small podium built from stacked basketballs and raises both arms like a world champion. The basketballs under his feet begin to wobble, but he holds the heroic pose anyway, smiling proudly while his legs shake.",
    animationDesc:
      "21.0-22.0s wild celebration with flexing and jumping, 22.0-22.8s he mimes receiving a trophy, 22.8-23.8s he climbs onto the basketball podium, 23.8-26.0s he poses with both arms raised while the podium wobbles and his legs shake.",
    soundDesc: "A triumphant fanfare and an imaginary crowd cheer.",
    punchline: "The champion of a podium made of the very balls he lost.",
    characterAction: "Flexes, jumps, mimes a trophy, and poses proudly on a wobbling podium.",
    propAction: "A podium of stacked basketballs wobbles under his feet.",
  },
  {
    id: 6,
    name: "Shot 6",
    title: "The Unexpected Final Gag",
    timeRange: [26.0, 30.0],
    videoPrompt:
      "The basketballs roll out from under the podium and the stickman drops safely onto his feet, but the net from the fallen hoop is still tangled around his head. As he proudly poses for the imaginary crowd, the net catches on the hoop's metal support. He takes one step forward, gets gently pulled backward, and ends up hanging upside down by the net just a few inches above the ground. His arms dangle motionlessly. He slowly turns his head toward the camera with an exhausted, furious stare. One basketball rolls past and stops beside him; he gives it a tiny angry kick while still upside down. The ball rolls away and he swings helplessly. Cut to black.",
    animationDesc:
      "26.0-26.8s the podium balls roll out and he drops safely, 26.8-27.4s the net is still on his head, 27.4-28.0s the net catches on the metal support, 28.0-28.8s he steps forward and is pulled back, 28.8-29.4s he hangs upside down with his arms dangling, 29.4-30.0s he turns his head toward the camera with a furious stare, kicks one ball, and swings helplessly.",
    soundDesc: "Balls rolling away, a net creak, a final bounce, a tiny kick and a mournful sad trombone.",
    punchline: "Trapped upside down in a net, still trying to look dignified.",
    characterAction: "Hangs upside down by the net, arms dangling, and delivers one last furious stare and an angry little kick.",
    propAction: "The net snags on the fallen hoop's support and the podium balls roll away.",
  },
];

export const POP_STAR_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "Max Wants To Be A Superstar",
    timeRange: [0.0, 7.0],
    videoPrompt:
      "A colorful modern concert stage. Max, a black stickman in a shiny purple jacket, stares up at a giant screen showing a cheering crowd. Violet spotlights find him and he imagines himself as a superstar, grabbing a hairbrush and using it as a microphone. The hairbrush snaps apart in his hand. Caption on screen: MAX WANTS TO BE A SUPERSTAR!",
    animationDesc:
      "0.0-1.2s Max watches the crowd screen, 1.2-2.6s the spotlights find him and he imagines stardom, 2.6-3.6s he grabs the hairbrush, 3.6-5.0s he poses with it as a microphone, 5.0-5.9s the brush breaks apart, 5.9-7.0s he is embarrassed.",
    soundDesc: "Upbeat original pop instrumental, a crowd cheer, a sparkle sting and a hairbrush snap.",
    punchline: "His first microphone breaks before the chorus even starts.",
    characterAction: "Dreams of stardom, poses with a hairbrush, and watches it snap in his hand.",
    propAction: "The hairbrush breaks into flying bristles.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "Rex Wants All The Attention",
    timeRange: [7.0, 14.0],
    videoPrompt:
      "Rex, a rival stickman in a flashy blue jacket, strolls onto the stage with a sparkling microphone, smirks at Max and pushes into the center spotlight. Max looks offended and the two glare at each other as the music adds a dramatic beat. Caption on screen: REX WANTS ALL THE ATTENTION!",
    animationDesc:
      "7.0-8.6s Rex walks in from the right with the mic, 8.6-10.5s he smirks and takes the center spotlight, 10.5-12.2s Max is offended, 12.2-14.0s they glare as the lights flash on the beat.",
    soundDesc: "A microphone sparkle, a deflating crowd groan and a dramatic downbeat.",
    punchline: "Two singers, one spotlight, zero room for negotiation.",
    characterAction: "Rex struts in and claims the spotlight; Max glares from the side.",
    propAction: "Rex's microphone sparkles as it catches the light.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "Max Wants To Impress Everyone",
    timeRange: [14.0, 23.0],
    videoPrompt:
      "Max launches into an exaggerated dance routine: a wild spin, a long moonwalk, then a backflip that lands him in a tangled heap. Rex laughs and performs a perfect spin. Max stubbornly attempts a much bigger jump and accidentally kicks his microphone into the audience. Caption on screen: MAX WANTS TO IMPRESS EVERYONE!",
    animationDesc:
      "14.0-16.0s Max spins, 16.0-18.0s he moonwalks backwards, 18.0-19.6s the backflip ends in a tangled heap, 19.6-21.2s Rex laughs and spins perfectly, 21.2-23.0s Max jumps higher and kicks the mic away.",
    soundDesc: "Spin whooshes, a heavy landing thud, a laugh and a flying-microphone whoosh.",
    punchline: "His biggest jump sends the one thing he needed into the crowd.",
    characterAction: "Spins, moonwalks, backflips into a heap, then jumps and launches his mic away.",
    propAction: "The microphone sails off the stage into the audience.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Beep Just Wants To Clean",
    timeRange: [23.0, 32.0],
    videoPrompt:
      "Beep, a tiny white cleaning robot with blue glowing eyes and little wheels, rolls onto the stage and sweeps up confetti with its brush while Max and Rex argue in the background. Beep rolls straight over Max's dropped microphone and accidentally plugs it into the speakers. A funny electronic pop beat starts and Beep's wheels begin bouncing perfectly in rhythm. Caption on screen: BEEP JUST WANTS TO CLEAN!",
    animationDesc:
      "23.0-26.0s Beep rolls on and sweeps confetti, 26.0-28.6s Max and Rex argue behind it, 28.6-29.4s Beep rolls over the mic and connects it, 29.4-32.0s its wheels bounce in perfect time with the new beat.",
    soundDesc: "Robot bleeps, brush sweeps, a plug-in click and a bouncy electronic beat.",
    punchline: "A cleaning accident turns into a chart-topper.",
    characterAction: "Beep sweeps happily while the two singers argue, then starts bouncing to the beat.",
    propAction: "The microphone gets plugged into the speaker by a rolling robot.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "Nobody Expected This",
    timeRange: [32.0, 43.0],
    videoPrompt:
      "The robot accidentally activates the stage's dance mode. Its wheels spin, its head bobs and its cleaning brush swings like a dance prop, every move landing exactly on the music. The crowd on the big screen goes wild, the spotlight follows Beep around the stage, and Max and Rex freeze in disbelief. Caption on screen: NOBODY EXPECTED THIS!",
    animationDesc:
      "32.0-36.0s Beep's wheels spin and its head bobs, 36.0-39.0s the brush waves like a prop in time with the music, 39.0-43.0s the crowd erupts, the spotlight follows Beep, and both singers stand frozen.",
    soundDesc: "A full electronic pop breakdown, a huge crowd cheer and a building instrumental.",
    punchline: "The cleanup robot has better stage presence than both singers.",
    characterAction: "Beep dances perfectly, the two singers stand frozen watching it.",
    propAction: "A cyan spotlight tracks the robot across the stage.",
  },
  {
    id: 6,
    name: "Scene 6",
    title: "Beep Becomes The Star",
    timeRange: [43.0, 52.0],
    videoPrompt:
      "Beep finishes with a flawless spin and a polite bow as confetti rains down and the crowd treats it like a superstar. Max tries to copy the dance and falls flat on his face. Rex attempts the same spin, loses control and slides into a pile of soft cushions beside the stage. Beep calmly goes back to sweeping. Caption on screen: BEEP BECOMES THE STAR!",
    animationDesc:
      "43.0-45.0s Beep spins and bows, 45.0-47.0s confetti rains, 47.0-48.8s Max copies the dance and face-plants, 48.8-50.8s Rex spins, loses control and slides into the cushions, 50.8-52.0s Beep resumes cleaning.",
    soundDesc: "Applause, a heavy face-plant, a soft cushion boing and the pop track continuing.",
    punchline: "The clean-up robot is a better performer and a better sportsperson.",
    characterAction: "Beep bows and sweeps; Max face-plants; Rex slides into the cushions.",
    propAction: "Confetti rains and Rex compresses a pile of soft cushions.",
  },
  {
    id: 7,
    name: "Scene 7",
    title: "Follow Your Dream",
    timeRange: [52.0, 58.0],
    videoPrompt:
      "Max and Rex reluctantly clean the confetti together. Beep rolls past wearing a tiny golden crown, pauses, takes the crown off and drops it into the trash because it is still on duty. Max and Rex stare at each other in shock. Beep rolls away dancing to the music and the film ends on a strong musical beat. Caption on screen: FOLLOW YOUR DREAM... OR JUST CLEAN UP!",
    animationDesc:
      "52.0-54.0s Max and Rex sweep the confetti, 54.0-55.1s Beep rolls past in a golden crown, 55.1-56.0s it removes the crown and drops it in the trash, 56.0-57.0s the two singers stare at each other, 57.0-58.0s Beep rolls away dancing.",
    soundDesc: "Brush sweeps, a royal sparkle, a crown clink in the trash and a big final musical hit.",
    punchline: "The star of the show throws away the crown and goes back to work.",
    characterAction: "Beep removes the crown, drops it in the trash and dances off; both singers are stunned.",
    propAction: "The golden crown ends up in the trash can.",
  },
];

export const TRICK_SHOT_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Final Straw",
    timeRange: [0.0, 7.0],
    videoPrompt:
      "The old basketball hoop tips off its pole and lands flat across the angry stickman's head, the net tangled over him and the pole snapping in half. He crawls out, pulls the net off his head and glares at the broken hoop lying flat on the ground. He grabs the orange basketball and angrily throws it at the fallen hoop. It bounces off the metal base and smacks him in the forehead. His eye twitches. He clenches both fists and decides to master trick shots.",
    animationDesc:
      "0.0-1.15s the hoop falls and lands on his head, 1.15-2.0s the impact daze and the pole snapping, 2.0-3.3s he crawls out of the net, 3.3-4.0s he pulls the net off and glares at the broken hoop, 4.0-4.4s he grabs the ball, 4.4-5.0s the angry throw at the metal base, 5.0-5.6s the bounce back, 5.6-6.2s the forehead bonk and the eye twitch, 6.2-7.0s the clenched fists and the decision.",
    soundDesc:
      "A metal hoop crash, a heavy thud, a rim clink, a forehead bonk and a rising original pop score.",
    punchline: "The ball bounces off the rim and finds his forehead anyway.",
    characterAction: "Gets crushed by the hoop, crawls out furious, and points at the hoop with a twitching eye.",
    propAction: "The hoop lands on his head and ends up lying on the court.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "The Failed Trick Shots",
    timeRange: [7.0, 16.0],
    videoPrompt:
      "Three disastrous trick shots, and not one of them at a basket. First he throws the ball backwards over his shoulder at a plain wall: it bounces straight back and hits his bottom, so he jumps angrily. Then he sets a small trash can down and attempts a no-look shot: the ball misses, circles the can and rolls away, so he chases it furiously. Finally he puts a bucket on the ground for a between-the-legs bounce shot: the ball clatters off the bucket's rim, fires straight up and lands on his head. He freezes with a twitching eye.",
    animationDesc:
      "7.0-8.4s he winds up the over-the-shoulder throw, 8.4-9.4s the ball flies to the wall and bounces back, 9.4-10.0s it hits his bottom and he jumps, 10.0-10.9s he sets the trash can down and takes a no-look shot, 10.9-12.2s the ball misses and curls around the can, 12.2-13.0s he chases it furiously, 13.0-14.2s he sets the bucket down and bounce shoots, 14.2-15.0s the ball fires off the rim, 15.0-15.4s it lands on his head, 15.4-16.0s he freezes with a twitching eye.",
    soundDesc:
      "Throw whooshes, wall and pole clanks, a rolling ball and heavy frustrated stomps.",
    punchline: "Four trick shots, four ways to embarrass himself.",
    characterAction: "Rage escalates from a scowl to a full meltdown on his knees.",
    propAction: "The ball keeps finding the wall, the pole and the floor instead of the hoop.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "Rage Training",
    timeRange: [16.0, 26.0],
    videoPrompt:
      "A fast training montage with energetic modern pop music, now that his hoop is broken. He dribbles around orange cones, bounces the ball off the wall, practices spinning throws into a bucket, shoots while lying flat on his back, and attempts blindfolded shots. Balls fly everywhere and he slips on one, instantly getting back up. A blank calendar flips through several days to show the time passing, and his throws finally start to hit the training target.",
    animationDesc:
      "16.0-17.4s dribbling around the cones, 17.4-18.6s wall bounces, 18.6-19.8s spinning throws, 19.8-21.0s shooting from the floor, 21.0-22.2s blindfolded shots, 22.2-23.4s the slip and the instant recovery, 23.4-24.8s the calendar flipping through days, 24.8-26.0s the first accurate shot.",
    soundDesc:
      "The pop score kicks into gear with a driving beat, bounces, slides and a swish.",
    punchline: "Days of practice turn the worst shooter into a machine.",
    characterAction: "Trains flat out, falls over, gets straight back up and keeps drilling.",
    propAction: "Cones, a wall, a spinning ball and a calendar show the grind.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Championship Challenge",
    timeRange: [26.0, 36.0],
    videoPrompt:
      "A referee in a striped shirt walks in carrying a large golden trophy and gestures at the intact championship basketball hoop at the far end of the court, the broken one still lying on the ground behind them. The stickman understands the championship challenge, steps forward confidently, spins the ball on one finger and poses for the crowd. His first attempt misses badly. The confident smile disappears, he takes a deep breath and focuses.",
    animationDesc:
      "26.0-27.8s the referee enters with the trophy, 27.8-29.4s he gestures at the hoop, 29.4-30.4s the stickman steps forward, 30.4-31.4s the finger spin, 31.4-32.2s the proud pose, 32.2-33.8s the attempt that misses, 33.8-34.8s the smile dies, 34.8-36.0s the deep breath and the focus.",
    soundDesc:
      "A referee whistle, a dramatic rumble, a squeaky ball spin and a long deep breath.",
    punchline: "The champion is ready. His first shot is not.",
    characterAction: "Struts forward, poses for the crowd, misses and then locks in with a deep breath.",
    propAction: "The golden trophy arrives and the hoop waits for the champion.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Impossible Shot",
    timeRange: [36.0, 49.0],
    videoPrompt:
      "With his back to the championship hoop, the stickman throws the basketball backward over his shoulder. It ricochets off the right wall, strikes the floor, comes back up off the backboard and drops onto the rim. In dramatic slow motion it circles the rim, nearly falls out, circles once more and finally drops cleanly through the net. The crowd explodes, he stares in disbelief and then bursts into joyful celebration.",
    animationDesc:
      "36.0-37.2s he turns his back and sets up, 37.2-37.8s the over-the-shoulder throw, 37.8-39.3s the wall bounce, 39.3-40.5s the floor strike, 40.5-41.7s the backboard ricochet, 41.7-46.05s the slow motion rim circles, 46.05-46.9s the clean drop through, 46.6-47.8s disbelief, 47.8-49.0s the celebration.",
    soundDesc:
      "A rising wall crack, a hard floor bounce, a backboard clank, a rim rattle in slow motion and a swish.",
    punchline: "He scored without ever looking at the hoop.",
    characterAction: "Throws blind over his shoulder, holds his breath, then explodes with joy.",
    propAction: "One ball takes four bounces and still finds the net.",
  },
  {
    id: 6,
    name: "Scene 6",
    title: "The Trick-Shot Champion",
    timeRange: [49.0, 56.0],
    videoPrompt:
      "The referee awards the stickman the giant golden trophy as confetti rains down over the court. The stickman raises the trophy above his head, jumps proudly and poses like the greatest athlete in the world while the music hits its triumphant peak.",
    animationDesc:
      "49.0-50.4s the referee hands over the trophy, 50.4-52.2s the confetti and the grip on the trophy, 52.2-54.2s the overhead raise and the jumps, 54.2-56.0s the champion pose.",
    soundDesc:
      "A trophy ding, confetti sparkle and a roaring crowd over the peak of the score.",
    punchline: "The worst shooter in the league is now the champion.",
    characterAction: "Hoists the giant golden trophy and poses like the greatest athlete alive.",
    propAction: "Confetti falls and the golden trophy changes hands.",
  },
  {
    id: 7,
    name: "Scene 7",
    title: "The Final Gag",
    timeRange: [56.0, 60.0],
    videoPrompt:
      "The stickman kisses the golden trophy and raises it overhead. Suddenly one stray basketball falls from above and lands perfectly inside the trophy. The trophy tips forward and covers his entire head, leaving only his thin black legs sticking out beneath it. He holds the pose for one beat and one leg slowly rises to give a thumbs-up. Cut to black on the final musical beat.",
    animationDesc:
      "56.0-57.2s the kiss and the heart, 57.2-57.7s the overhead raise, 57.7-58.3s the stray ball drops into the cup, 58.3-59.2s the trophy tips over his head, 59.2-59.9s the legs and the thumbs-up, 59.9-60.0s the cut to black.",
    soundDesc:
      "A soft chime for the kiss, a plop as the ball lands in the cup, a metallic tip and the final fanfare.",
    punchline: "The champion is defeated by his own trophy.",
    characterAction: "Kisses the trophy and ends up wearing it like a helmet, giving a thumbs-up anyway.",
    propAction: "A stray basketball lands in the trophy and the trophy swallows his head.",
  },
];

export const PING_PONG_PROMPT = `THE PING-PONG REVENGE — 30-SECOND AI VIDEO PROMPT

Create a 30-second vertical 9:16 2D stickman comedy animation. The whole film takes place in one minimalist white room with a simple rectangular table, a tiny white cup, one orange ping-pong ball, three books and a single hanging ceiling lamp. The camera is mostly locked off, with quick punch-in zooms on his face and the cup, plus short impact shakes. No dialogue, no extra characters, no scene resets.

VISUAL STYLE:
Minimalist 2D vector animation, pure white background, thick black outlines, round white head, thin black limbs, thick expressive eyebrows, squash-and-stretch cartoon physics, fast comedic timing. The only colour is the orange ping-pong ball and the orange captions; everything else is black and white with a subtle grey ground shadow. Keep the character design and prop positions identical for the entire film.

CHARACTER:
ANGRY STICKMAN: supremely overconfident, then instantly furious. He never speaks, his face does all the acting.

SCENE 1 — THE CHALLENGE (0–4 SECONDS):
He stands behind the table, holding the orange ball, grinning arrogantly at the tiny cup at the opposite end. He points at the cup, flexes, bounces the ball once on the table and lines up the shot. Caption: "EASIEST TRICKSHOT EVER!"

SCENE 2 — THE FIRST FAILURE (4–8 SECONDS):
He throws. The ball flies wildly past the cup, ricochets off the far wall, returns and bonks him directly on the forehead. His head snaps back and he freezes with crossed eyes. He slowly turns to the camera, offended, and points accusingly at the cup. Caption: "WHAT?!"

SCENE 3 — THE GENIUS PLAN (8–13 SECONDS):
He stacks three books into a makeshift ramp, measures the angle with his fingers, nods proudly and launches the ball up the ramp. The ball bounces off the top book, travels in a tiny arc and drops directly onto his foot. He hops around holding his foot. Caption: "SCIENTIFIC PRECISION!"

SCENE 4 — TOTAL RAGE (13–18 SECONDS):
He trembles, fists shaking, his whole body briefly turning into an exaggerated vibrating silhouette. He screams silently, raises both arms and slams the table with both hands. The table flexes and the ball shoots vertically into the ceiling. He looks up, confused. Caption: "I'VE HAD ENOUGH!"

SCENE 5 — THE IMPOSSIBLE TRICKSHOT (18–25 SECONDS):
The ball ricochets off the ceiling, hits the left wall, bounces off the hanging lamp and curves back toward him through a ridiculous sequence of perfectly timed rebounds. Meanwhile the tiny cup accidentally tips off the table's edge, falls through the air and lands perfectly upright on top of his round head. The ball drops down and lands exactly inside the cup. He freezes, eyes wide, then slowly looks up. Caption: "1000 IQ?!"

SCENE 6 — THE REVENGE OF THE CUP (25–30 SECONDS):
He celebrates, jumping and pumping his fists with the cup balanced on his head. The ball pops out of the cup, rises and drops straight onto his forehead. The cup slips down over his face like a helmet. He stops. His arms lower. He shakes with silent rage. Hold the final frame for half a second: motionless, cup over his face, fists clenched, the orange ball rolling slowly across the floor. Cut to black.

STORY REQUIREMENTS:
The cup must land on his head and the ball must visibly drop into it. Keep the cup on his head through the celebration. The final gag is the cup covering his face, not another ball hitting him. No dialogue, no subtitles inside the animation (captions are added in post), no watermark, no logos, no extra props, no second ball.`;

export const PING_PONG_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Challenge",
    timeRange: [0.0, 4.0],
    videoPrompt:
      "The stickman stands behind a simple rectangular table in a white room, holding one orange ping-pong ball. A tiny white cup sits at the opposite end of the table. He grins arrogantly, points at the cup, flexes, bounces the ball once on the table and lines up the shot.",
    animationDesc:
      "0.0-1.2s he holds the ball up and grins at the cup, 1.2-2.2s he points at it, 2.2-3.0s a double bicep flex, 3.0-3.45s one bounce on the table, 3.45-4.0s he lines up the throw.",
    soundDesc:
      "A confident ding, a light ping-pong bounce on the table and a low smug hum under the scene.",
    captionText: "EASIEST TRICKSHOT EVER!",
    punchline: "He has already won in his head.",
    characterAction: "Grins, points, flexes and bounces the ball once, radiating arrogance.",
    propAction: "The cup waits at the far end of the table.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "The First Failure",
    timeRange: [4.0, 8.0],
    videoPrompt:
      "He throws the ball. It sails wildly past the cup, ricochets off the far wall and returns to bonk him directly on the forehead. His head snaps back and he freezes with crossed eyes, then slowly turns to the camera and points accusingly at the cup.",
    animationDesc:
      "4.0-4.15s the wind-up, 4.15-4.75s the throw past the cup, 4.75-4.8s the wall strike, 4.8-6.0s the rebound, 6.0-6.85s the forehead bonk and crossed-eye freeze, 6.85-7.35s the offended turn, 7.35-8.0s the accusation.",
    soundDesc:
      "A throw whoosh, a hard wall bounce, a forehead bonk and a beat of dead silence before the accusation.",
    captionText: "WHAT?!",
    punchline: "The wall is a better teammate than he is.",
    characterAction: "Bonked on the forehead, then deeply offended at the cup.",
    propAction: "The ball bounces off the far wall and drops to the floor.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Genius Plan",
    timeRange: [8.0, 13.0],
    videoPrompt:
      "He stacks three books into a makeshift ramp on the table, measures the angle with his fingers, nods proudly, then launches the ball up the ramp. It bounces off the top book, travels in a tiny arc and drops straight onto his foot. He hops around holding his foot.",
    animationDesc:
      "8.0-9.7s the three books are stacked, 9.7-10.9s the angle measurement, 10.9-11.15s the proud nod, 11.15-11.65s he picks the ball up, 11.65-12.12s the launch, 12.12-12.45s the arc, 12.45-13.0s the foot plop and the hop.",
    soundDesc:
      "Three book thumps, three measuring beeps, a soft launch, a light bounce and a pained squeak.",
    captionText: "SCIENTIFIC PRECISION!",
    punchline: "The most carefully planned shot in history hits his own foot.",
    characterAction: "Stacks, measures, nods, and immediately regrets everything.",
    propAction: "Three books form the ramp; the ball lands on his foot.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Total Rage",
    timeRange: [13.0, 18.0],
    videoPrompt:
      "He trembles with clenched fists and his body briefly becomes a vibrating silhouette. He screams silently, raises both arms and slams the table with both hands. The table flexes and the ball shoots vertically toward the ceiling. He looks up, confused.",
    animationDesc:
      "13.0-13.4s he sweeps the books away, 13.4-14.5s the trembling build, 14.5-15.2s the silent scream and silhouette, 15.2-15.42s the arms come down, 15.42-15.72s the table slam and flex, 15.72-16.15s the recoil, 16.15-18.0s he watches the ball disappear into the ceiling.",
    soundDesc:
      "Books clatter, a low rumble builds, a heavy table slam, a spring launch and a long rising whistle.",
    captionText: "I'VE HAD ENOUGH!",
    punchline: "The table is not the problem. He is.",
    characterAction: "Trembles, screams silently and slams the table with both hands.",
    propAction: "The table flexes and the ball rockets straight up.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Impossible Trickshot",
    timeRange: [18.0, 25.0],
    videoPrompt:
      "The ball ricochets off the ceiling, hits the left wall, bounces off the hanging lamp and curves back toward him. Meanwhile the cup tips off the table, falls through the air and lands perfectly upright on his head. The ball drops exactly into the cup. He freezes, eyes wide, then slowly looks up.",
    animationDesc:
      "18.0-18.6s the ball reappears and hits the ceiling, 18.6-19.4s the left wall, 19.4-20.2s the lamp, 20.2-20.9s the table bounce, 20.9-21.6s the lob, 21.6-22.2s the cup lands on his head, 22.2-22.9s the ball drops in, 22.9-23.35s the jolt, 23.35-24.6s the slow look up, 24.6-25.0s the stunned smirk.",
    soundDesc:
      "Four rapid boings, a lamp ding, a porcelain clink as the cup lands, a soft plop as the ball drops in, then a magical sparkle.",
    captionText: "1000 IQ?!",
    punchline: "Perfect. Completely, terrifyingly perfect.",
    characterAction: "Freezes, eyes wide, then slowly looks up at the cup.",
    propAction: "The cup lands upright on his head and the ball drops in.",
  },
  {
    id: 6,
    name: "Scene 6",
    title: "The Revenge of the Cup",
    timeRange: [25.0, 30.0],
    videoPrompt:
      "He celebrates, jumping and pumping his fists with the cup balanced on his head. The ball pops out, rises and drops straight onto his forehead. The cup slips down over his face like a helmet. He stops, arms lowering, and shakes with silent rage. Final frame: motionless, cup over his face, fists clenched, the ball rolling slowly across the floor. Cut to black.",
    animationDesc:
      "25.0-25.35s the arms shoot up, 25.35-27.3s the jumping celebration, 27.3-27.65s the ball pops out and falls, 27.65-28.15s the forehead bonk, 28.15-28.6s the cup slides over his face and the arms sink, 28.6-29.7s the silent shaking rage, 29.7-29.95s the motionless final frame, 29.95s cut to black.",
    soundDesc:
      "A victory fanfare, a tiny pop, a forehead bonk, a cup squeak, a record scratch and a low angry rumble.",
    captionText: "I HATE THIS GAME!",
    punchline: "The cup gets the last word.",
    characterAction: "Celebrates, gets bonked, wears the cup and trembles with silent fury.",
    propAction: "The ball pops out of the cup and rolls across the floor; the cup stays on his face.",
  },
];

export const DART_SHOT_PROMPT = `THE ANGRY STICKMAN VS. THE IMPOSSIBLE DART SHOT - 30-SECOND AI VIDEO PROMPT

Create a 30-second vertical 9:16 2D stickman comedy animation. The whole film takes place in one minimalist white room with a dartboard on the right wall, one cork noticeboard, three darts, three books, a ruler, a bent spoon, a wall clock, a table lamp, a simple table and a simple chair. The camera is mostly medium-wide with quick punch-in zooms, one low-angle wind-up and short impact shakes. No dialogue, no extra characters, no scene resets.

VISUAL STYLE:
Minimalist 2D vector animation, pure white background, thick black outlines, round white head, thin black limbs, thick expressive eyebrows, squash-and-stretch cartoon physics, fast comedic timing. The only colour is the red outer ring and bullseye of the dartboard, the red dart flights and the red captions; everything else is black and white with a subtle grey ground shadow. Keep the character design and prop positions identical for the entire film. No photorealism, no 3D, no gradients, no textures, no logos, no watermarks.

CHARACTER:
One black stickman, round white head with a thick black outline, simple cartoon eyes, expressive eyebrows, thin black arms and legs, exaggerated body language. He is extremely competitive and believes he is a trickshot genius. No clothing, no anatomy, no other characters.

SCENE 1 - THE CHALLENGE (0-4s):
Medium-wide shot: the stickman on the left, the dartboard hanging on the right wall. He holds one dart, rolls his shoulder, stretches his throwing arm, narrows his eyes and points at the exact centre of the board. He gives a smug thumbs-up, raises the dart and lines up the shot. Camera starts wide and slowly pushes in on his confident face. Caption: "ONE SHOT. EASY."

SCENE 2 - TOTAL MISS (4-8s):
He throws. The dart flies wildly past the board, falls short and sticks harmlessly in the cork noticeboard beside it. He freezes with his arm extended, slowly turns his head toward the misplaced dart, looks at the board, then directly at the camera with his mouth open. Camera tracks the dart briefly, then snap-zooms on his stunned face. Caption: "IMPOSSIBLE!"

SCENE 3 - THE ENGINEER (8-14s):
He marches to the table and builds an absurd launcher: three books stacked into a platform, a ruler balanced on top and a spoon bent into a catapult. He rubs his hands, nods proudly, loads a dart and fires. The dart shoots up, spins in one exaggerated loop and lands harmlessly in the top of his own head. He slowly pulls it out and stares at it with trembling rage, then sweeps the whole contraption off the table. Camera shows the contraption from the side, follows the loop, then pushes in on his furious face. Caption: "100% ACCURATE!"

SCENE 4 - MAXIMUM RAGE (14-19s):
He stands in front of the board, shakes, screams silently, stomps once, takes a deep breath, snatches the last dart and throws it with all his strength. The dart rockets up and out of the frame. Camera drops to a low angle during the wind-up, punches in on his fist, then tracks the dart away. Caption: "JUST HIT THE BOARD!"

SCENE 5 - THE LEGENDARY TRICKSHOT (19-25s):
The dart ricochets off the edge of the wall clock, clips the lampshade, curves in a tight loop around the back of the chair, and flies across the room into the exact centre of the bullseye. The board shakes. The stickman stands motionless, eyes wide, then slowly raises both arms as he realises what happened. Camera tracks the rebounds, pushes in on the board for the final approach, and snaps to his astonished face. Caption: "PERFECT!"

SCENE 6 - THE CHAMPION (25-30s):
He dances in front of the board, pumps both fists and points at himself. The wall mounting creaks, the entire dartboard tips forward and drops safely over his round head like an oversized helmet. He freezes, lowers his arms, tries to look around, takes one small step and bumps into the chair. His body shakes with silent rage, fists clenched, the dartboard covering his face. Camera starts medium-wide, pushes in as the board falls, and ends on a still centred shot. Caption: "I QUIT." Hold the final pose for a beat, then cut to black.

AUDIO:
A light, playful score that turns faster and angrier as he fails. Fast whoosh on every throw, a soft cartoon thunk when a dart sticks, three book-placement thumps, mechanical clicks, a spring boing, a tiny head impact, a low growl and rising tension in the rage, a foot stomp, three fast boings and whooshes through the ricochet, a satisfying DING on the bullseye, a triumphant fanfare, a creaking mount, a heavy cartoon BONK, a record scratch and a low angry rumble under the final pose.

NEGATIVE PROMPT:
No photorealism, no 3D rendering, no anime, no detailed anatomy, no realistic blood or injury, no dangerous real-world dart throwing, no extra characters, no duplicate stickmen, no inconsistent head shape, no changing proportions, no clothing, no excessive background detail, no unnecessary scene changes, no flickering, no broken limbs, no distorted props, no illegible text, no logos, no watermarks.`;

export const DART_SHOT_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Challenge",
    timeRange: [0.0, 4.0],
    videoPrompt:
      "The stickman stands on the left side of a white room, one red-flighted dart in his hand, a dartboard on the right wall. He rolls his shoulder, stretches, points at the bullseye, gives a smug thumbs-up and raises the dart.",
    animationDesc:
      "0.0-0.7s smug hold, 0.7-1.3s shoulder roll, 1.3-1.8s arm stretch across the chest, 1.8-2.3s point at the board, 2.3-2.85s thumbs-up, 2.85-4.0s slow wind-up with narrowed eyes.",
    soundDesc: "A confident whistle, a tiny sparkle and a smug pizzicato under the scene.",
    captionText: "ONE SHOT. EASY.",
    punchline: "ONE SHOT. EASY.",
    characterAction: "Smug shoulder roll, point at the bullseye, thumbs-up, slow wind-up.",
    propAction: "The dart is held in his right hand; the board, clock and noticeboard stay fixed on the wall.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "Total Miss",
    timeRange: [4.0, 8.0],
    videoPrompt:
      "He throws. The dart sails past the board and sticks into the cork noticeboard beside it. He freezes with his arm out, turns his head to the dart, looks at the board, then at the camera with his mouth open.",
    animationDesc:
      "4.0-4.38s wind-up and release, 4.2-4.85s the weak throw, 4.85-5.5s frozen follow-through, 5.5-6.1s look at the dart, 6.1-6.5s look at the board, 6.5-7.2s stare at the camera, 7.2-8.0s disbelief hardens into clenched fists.",
    soundDesc:
      "A fast whoosh, a soft cartoon THUNK into cork, a short awkward silence and one tiny eyebrow twitch squeak.",
    captionText: "IMPOSSIBLE!",
    punchline: "IMPOSSIBLE!",
    characterAction: "Freezes mid follow-through, looks at the dart, the board and the camera.",
    propAction: "The dart sails over the board and sticks into the corkboard beside it; the board is untouched.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Engineer",
    timeRange: [8.0, 14.0],
    videoPrompt:
      "He stacks three books on the table, balances a ruler on top, bends a spoon into a catapult, loads a dart and fires. The dart loops in the air and lands point-first in the top of his own head. He pulls it out and sweeps the launcher away.",
    animationDesc:
      "8.0-8.35s march to the table, 8.4-9.4s three book drops, 9.4-10.05s ruler balance, 10.05-10.6s spoon bend, 10.6-11.1s hand rub, 11.1-11.55s proud nod, 11.55-12.0s pull and release, 12.0-12.8s loop and head landing, 12.8-13.3s pull it out, 13.3-14.0s sweep and stomp off.",
    soundDesc:
      "Three book thumps, a ruler tap, two mechanical clicks, a spring boing, a short whistle, a tiny impact and an angry growl.",
    captionText: "100% ACCURATE!",
    punchline: "100% ACCURATE!",
    characterAction: "Builds the book-and-spoon launcher, fires, and gets the dart in his own head.",
    propAction: "Three books, a ruler and a bent spoon form the launcher; the dart loops and sticks into his head; the launcher is swept off the table.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Maximum Rage",
    timeRange: [14.0, 19.0],
    videoPrompt:
      "He stands in front of the dartboard, vibrating with anger, screams silently, stomps, takes a huge breath and throws the last dart with all his strength. It rockets up and out of the frame.",
    animationDesc:
      "14.0-14.9s full-body tremble, 14.9-15.35s silent scream, 15.35-15.7s stomp, 15.7-16.7s deep breath, 16.7-17.45s low-angle wind-up, 17.45-17.7s throw, 17.7-19.0s follow-through and wide-eyed stare.",
    soundDesc:
      "A low growl, a rising tension bed, one heavy foot stomp and a huge dramatic whoosh.",
    captionText: "JUST HIT THE BOARD!",
    punchline: "JUST HIT THE BOARD!",
    characterAction: "Trembles, screams, stomps, breathes in and hurls the last dart.",
    propAction: "The dart rockets over the board and flies out of frame toward the clock.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Legendary Trickshot",
    timeRange: [19.0, 25.0],
    videoPrompt:
      "The dart bounces off the wall clock, clips the lampshade, loops around the chair and flies into the exact centre of the bullseye. The board shakes. The stickman freezes, then slowly raises both arms.",
    animationDesc:
      "19.35s clock, 20.2s lampshade, 20.75-21.2s a tight loop around the chair, 21.2-23.4s a slowing arc into the bullseye, 23.4s DING and board shake, 23.4-24.05s frozen shock, 24.05-25.0s arms rise into a celebration.",
    soundDesc:
      "Three fast boings, two whooshes, a short slow-motion shimmer, a satisfying DING and a triumphant fanfare.",
    captionText: "PERFECT!",
    punchline: "PERFECT!",
    characterAction: "Stands frozen, eyes wide, then slowly raises both arms.",
  },
  {
    id: 6,
    name: "Scene 6",
    title: "The Champion",
    timeRange: [25.0, 30.0],
    videoPrompt:
      "He dances in front of the board, plucks the dart out and flicks it away. The mounting gives way and the dartboard drops over his head like a helmet. He freezes, steps into the chair and shakes with silent rage, fists clenched.",
    animationDesc:
      "25.0-25.55s victory dance, 25.55-25.75s hop and pluck, 25.75-25.9s flick, 25.9-26.6s proud pose, 26.0-26.45s creak and tip, 26.45-26.85s fall, 26.85-27.6s frozen board-over-head beat, 27.6-28.1s one step and chair bump, 28.1-29.75s silent rage and final still, cut to black.",
    soundDesc:
      "A triumphant fanfare, a creaking mount, a heavy cartoon BONK, a record scratch and a low angry rumble.",
    captionText: "I QUIT.",
    punchline: "I QUIT.",
    characterAction: "Celebrates, plucks the dart, freezes under the board, steps into the chair and shakes.",
  },
];

export const COIN_FLIP_PROMPT = `THE ANGRY STICKMAN VS. THE IMPOSSIBLE COIN FLIP - 30-SECOND AI VIDEO PROMPT

Create a 30-second vertical 9:16 minimalist 2D stickman comedy animation. The whole film takes place in one white room with one small table holding a clear glass of water, a table lamp, three books, a ruler, a bent spoon, one wall clock and one simple chair. One shiny gold coin. The camera is mostly medium-wide with quick punch-in zooms, one low-angle wind-up, short tracking shots and brief impact shakes. No dialogue, no extra characters, no scene resets.

VISUAL STYLE:
Minimalist 2D vector animation, pure white background and floor, thick black outlines, flat vector artwork, round white head, thin black limbs, thick expressive eyebrows, exaggerated squash-and-stretch, fast comedic timing, clean silhouettes and subtle grey ground shadows. The only colour is the gold coin, the pale blue water and the gold-haloed captions; everything else is black and white. Keep the character design and prop positions identical for the entire film. No photorealism, no 3D, no gradients, no textures, no logos, no watermarks.

CHARACTER:
One black stickman, round white head with a thick black outline, simple cartoon eyes, expressive eyebrows, thin black arms and legs, exaggerated body language. He is convinced he is a coin-flip genius. No clothing, no anatomy, no other characters.

SCENE 1 - THE CHALLENGE (0-4s):
Medium-wide shot: the stickman on the left, a glass of water on the table at the right. He holds one gold coin up, smiles arrogantly, rolls his shoulder, points at the glass and flicks the coin with a confident snap. The coin sails clean over the glass and out of frame. Camera starts wide and punches in on his confident face. Caption: "EASY MONEY!"

SCENE 2 - TOTAL MISS (4-8s):
The coin sails back into frame, clangs off the rim of the glass, spins backward and gently bonks him on the forehead. He freezes, eyes wide, then his eyebrow starts to twitch. The coin drops onto the table. Camera snaps to his face for the bonk and holds on the twitch. Caption: "ARE YOU SERIOUS?!"

SCENE 3 - THE ENGINEER (8-14s):
He marches to the table and builds an absurd coin launcher: three books stacked into a platform, a ruler balanced on top and a spoon bent into a catapult. He pinches the coin off the table, loads it, pulls the lever and fires. The coin spins in one ridiculous loop and drops straight into his own shoe. He stares down at his foot in disbelief, then shakes with rage. Camera shows the launcher from the side, follows the loop, then pushes in on his foot and his furious face. Caption: "PERFECT ENGINEERING!"

SCENE 4 - MAXIMUM RAGE (14-19s):
He sweeps the entire launcher off the table, stomps across the room, clenches both fists, screams silently, takes a huge breath and flicks the coin with maximum cartoon force. The coin spins through the air leaving motion trails. Camera drops to a low angle for the stomp, then tracks the coin up and away. Caption: "GET IN THE GLASS!"

SCENE 5 - THE LEGENDARY TRICKSHOT (19-25s):
The coin ricochets off the wall clock, makes one full circle around the table lamp, bounces off a book on the chair and drops perfectly into the glass. The water splashes. The stickman stands motionless, eyes wide, then slowly raises both arms as he realises what happened. Camera tracks every rebound, pushes in on the glass for the splash, and snaps to his astonished face. Caption: "I'M A GENIUS!"

SCENE 6 - THE CHAMPION (25-30s):
He dances triumphantly beside the table, pumping both fists. The glass wobbles, hops off the table and tips over above him, dumping the water straight onto his head. The coin follows and lands gently on top of his head. He stops moving, lowers his arms and slowly clenches his fists in silent rage. Camera starts medium-wide, pushes in as the water hits, and ends on a still centred shot. Caption: "I QUIT." Hold the final pose for a beat, then cut to black.

AUDIO:
A light, playful score that turns faster and angrier as he fails. A coin flick and a confident whistle, a metallic ting on the glass rim, a cartoon bonk and a short silence, three book thumps, a ruler tap, mechanical clicks, a spring boing and a soft plop into the shoe, a low growl and rising tension in the rage, one heavy foot stomp, a huge dramatic whoosh, three fast boings and a spinning whistle through the ricochet, a satisfying DING and water splash on the winning drop, a triumphant fanfare that dies under a wobbling glass, a big water splash, a tiny coin ting and a record scratch under the final pose.

NEGATIVE PROMPT:
No photorealism, no 3D, no anime, no detailed anatomy, no realistic blood or injury, no extra characters, no duplicate stickmen or coins, no extra limbs, no changing character designs, no inconsistent proportions, no clothing, no excessive background detail, no unnecessary scene changes, no flickering, no distorted glass, no random background changes, no broken props, no illegible text, no logos, no watermarks.`;

export const COIN_FLIP_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Challenge",
    timeRange: [0.0, 4.0],
    videoPrompt:
      "The stickman stands beside a white room table with a glass of water on it, one gold coin in his hand. He shows it off, points at the glass and flicks the coin confidently. It sails clean over the glass and out of frame.",
    animationDesc:
      "0.0-0.65s smug hold with the coin up, 0.65-1.45s shoulder roll, 1.45-2.15s point at the glass, 2.15-2.55s cock the coin back, 2.55-2.72s flick, 2.72-4.0s follow-through as the smirk cracks and the coin misses.",
    soundDesc: "A confident whistle, a tiny sparkle, a coin flick and a smug pizzicato bed.",
    captionText: "EASY MONEY!",
    punchline: "EASY MONEY!",
    characterAction: "Shows the coin, points at the glass, flicks and watches it sail away.",
    propAction: "The glass, books, ruler, spoon, lamp, clock and chair stay put; the coin flies past the glass and off frame.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "Total Miss",
    timeRange: [4.0, 8.0],
    videoPrompt:
      "The coin comes back into frame, clangs off the rim of the glass and spins backward into his own forehead. He freezes with wide eyes, then his eyebrow twitches into fury.",
    animationDesc:
      "4.12-4.62s the coin returns and clangs the rim, 4.62-5.34s it spins back into his forehead, 5.34-6.05s frozen wide-eyed bonk, 6.05-6.95s twitching eyebrow, 6.95-8.0s full snarl and a glare at the table.",
    soundDesc: "A metallic ting, a cartoon bonk, a short awkward silence and one tiny eyebrow-twitch squeak.",
    captionText: "ARE YOU SERIOUS?!",
    punchline: "ARE YOU SERIOUS?!",
    characterAction: "Freezes on the bonk, blinks, then snarls with a twitching eyebrow.",
    propAction: "The coin clips the glass rim, bounces back to his head and drops on the table.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Engineer",
    timeRange: [8.0, 14.0],
    videoPrompt:
      "He stacks three books on the table, balances a ruler, bends a spoon into a catapult, loads the coin and fires. The coin loops once and drops straight into his own shoe. He stares at his foot, then shakes with rage.",
    animationDesc:
      "8.0-8.35s march to the table, 8.4-9.55s three book drops, 9.55-10.05s ruler balance, 10.05-10.6s spoon bend, 10.6-10.85s hand rub, 10.85-11.5s pinch the coin off the table, 11.5-12.05s load and pull, 12.05-13.4s launch, loop and shoe landing, 13.4-14.1s stare and tremble.",
    soundDesc:
      "Three book thumps, a ruler tap, two mechanical clicks, a spring boing, a spinning whistle and a soft plop into the shoe.",
    captionText: "PERFECT ENGINEERING!",
    punchline: "PERFECT ENGINEERING!",
    characterAction: "Builds the launcher, loads the coin, fires and stares at his own shoe.",
    propAction: "Three books, a ruler and a bent spoon form the launcher; the coin loops into his shoe.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Maximum Rage",
    timeRange: [14.0, 19.0],
    videoPrompt:
      "He sweeps the launcher off the table, stomps across the room, screams silently, takes a huge breath and flicks the coin with everything he has. It spins away with motion trails.",
    animationDesc:
      "14.1-14.55s sweep the launcher away, 14.55-15.05s stomp across the room, 15.05-15.3s tremble, 15.3-15.6s silent scream, 15.6-15.95s stomp, 15.95-16.6s deep breath, 16.6-17.35s wind-up, 17.35-17.58s flick, 17.58-19.0s follow-through and tracking stare.",
    soundDesc: "A wooden clatter, a low growl, a rising tension bed, a heavy foot stomp and a huge dramatic whoosh.",
    captionText: "GET IN THE GLASS!",
    punchline: "GET IN THE GLASS!",
    characterAction: "Sweeps, stomps, screams, breathes in and flicks the coin with both feet planted.",
    propAction: "The launcher flies off to the left; one book is thrown onto the chair seat and stays there.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Legendary Trickshot",
    timeRange: [19.0, 25.0],
    videoPrompt:
      "The coin bounces off the wall clock, circles the table lamp, bounces off the book on the chair and drops into the glass with a splash. He freezes, then raises both arms in disbelief.",
    animationDesc:
      "19.5s the clock, 20.35-21.15s a full loop around the lampshade, 21.15-21.85s to the book on the chair, 21.85s the bounce, 21.85-23.45s the long arc and splash, 23.45-24.05s frozen shock, 24.05-25.0s arms rise into a celebration.",
    soundDesc: "Three fast boings, two whooshes, a short slow-motion shimmer, a DING and a water splash.",
    captionText: "I'M A GENIUS!",
    punchline: "I'M A GENIUS!",
    characterAction: "Tracks the coin with his eyes, freezes at the splash, then erupts into celebration.",
    propAction: "The coin clips the clock, loops the lamp, bounces off the book on the chair and drops into the glass.",
  },
  {
    id: 6,
    name: "Scene 6",
    title: "The Champion",
    timeRange: [25.0, 30.0],
    videoPrompt:
      "He dances beside the table. The glass wobbles, hops and tips over above his head, dumping the water on him. The coin follows and lands on his head. He freezes and clenches his fists in silent rage.",
    animationDesc:
      "25.0-27.15s victory dance, 26.5-27.05s the glass wobbles, 26.75-27.6s it hops, tips and dumps the water, 27.35s the water hits his head, 27.56s the coin lands on his head, 27.75-28.85s he lowers his arms into fists, 28.85-29.75s the frozen final pose, cut to black.",
    soundDesc: "A triumphant fanfare, a wobbling glass, a big water splash, a tiny coin ting and a record scratch.",
    captionText: "I QUIT.",
    punchline: "I QUIT.",
    characterAction: "Dances, freezes under the water, then slowly clenches his fists.",
    propAction: "The glass hops and tips, dumps its water and lands on its side; the coin lands on his head.",
  },
];

export const MIND_TRAPS_PROMPT = `ANGRY STICKMAN: MIND TRAPS & THE RED CAGE
AI VIDEO PROMPT

MASTER STYLE
Create a 30-second, vertical 9:16, 1080 x 1920, 24 fps minimalist 2D stickman explainer animation in stark Minimalist Monochrome with vivid red storytelling accents. Pure white or pure black canvas, round heads, line limbs, consistent stroke weight (12px), and occasional simple expressions. Up to three vivid accent colors distinguish emotions, risks, or actions. Turn anxiety into a cage or attention into a progress bar.

CHARACTER & METAPHORS
- Black stickman on pure white background (Style 1A) and white stickman on pure black background (Style 1B).
- Round head, line limbs, minimal expressive facial features (diagonal angry brow slash, stunned wide eyes, teeth grit, cartoon anger vein 💢).
- Visual Metaphors: A 3D perspective wireframe red cage constricting around the figure, an overhead attention/stress HUD progress bar overflowing at 100%, and a giant vivid red gavel smashing cracked architectural columns.

SCENE FLOW
0-5s: The Anxiety Cage (Style 1B). Pure black canvas, glowing white stickman clutching head in panic. A vivid red wireframe cage constricts tightly around him. Caption: ANXIETY IS A CAGE.
5-10s: Attention Overload. An overhead minimalist HUD progress bar fills from 15% to 100% in vivid red: OVERFLOW! Steam vents from ears, comic anger vein ticks. Caption: ATTENTION OVERLOAD!
10-16s: Decisive Action & The Gavel (Style 1A). Cut to pure white canvas with towering black architectural columns. Black stickman raises an enormous vivid red gavel overhead, leaps and slams it into the ground! Radial shockwaves erupt, floor cracks spread, columns fracture. Caption: DECISIVE ACTION.
16-21s: The Cognitive Maze. Minimalist monochrome labyrinth walls. Red obstacle barrier. Dotted trajectory vector curve calculates escape angle; stickman leaps over cleanly. Caption: FIND THE VECTOR.
21-26s: Shatter The Pattern. Stickman swings the red gavel into the red cage. The cage violently shatters into 40+ geometric red shards flying across the frame. Screen shake on impact. Caption: SHATTER THE TRAP!
26-30s: Clarity Over Noise. Clean open composition. Standing tall in calm mastery. Overhead progress bar reads 100% CLARITY. Confident thumbs-up to camera with a serene smile. Caption: FEW LINES. BIG IDEA.

SOUND
Procedural synthesizer cues: low metallic cage rumble, tension heartbeat, ticking progress meter, alarm buzzer, foot stomp, colossal gavel impact crash, shattering glass/metal explosion, serene clarity chime. No dialogue.`;

export const MIND_TRAPS_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Anxiety Cage",
    timeRange: [0.0, 5.0],
    videoPrompt:
      "Style 1B: White figure on pure black canvas. Stickman clutches his head in anxiety as a vivid red wireframe cage bends and constricts tightly around him.",
    animationDesc:
      "0-2.5s White stickman crouches clutching head on pitch-black canvas; 2.5-5.0s vivid red 3D cage bars flex and constrict inward with breathing tension.",
    soundDesc: "Low metallic cage creak, subtle heartbeat pulse, and rising claustrophobic drone.",
    captionText: "ANXIETY IS A CAGE.",
    punchline: "ANXIETY IS A CAGE.",
    characterAction: "Crouches, clutches head with both hands, trembles with anxious wide eyes.",
    propAction: "3D perspective red cage bars constrict inward around the figure.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "Attention Overload",
    timeRange: [5.0, 10.0],
    videoPrompt:
      "An overhead minimalist HUD progress bar fills with vivid red to 100% OVERFLOW! Stickman glares upward, steam puffs from his ears and an anger vein pops.",
    animationDesc:
      "5.0-8.5s floating progress bar fills rapidly to 99%; 8.5-10.0s flashes OVERFLOW!, stickman snarls, steam vents from head and 💢 anger mark pops.",
    soundDesc: "Fast mechanical meter ticks, rising pitch alarm, and cartoon steam hiss.",
    captionText: "ATTENTION OVERLOAD!",
    punchline: "ATTENTION OVERLOAD!",
    characterAction: "Glares upward at the bar, eyebrow slashes into fury, teeth grit.",
    propAction: "Overhead HUD meter fills to max and flashes red warning hazards.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "Decisive Action",
    timeRange: [10.0, 16.0],
    videoPrompt:
      "Style 1A: Black figure on white canvas with massive cracked black columns. Black stickman raises an enormous vivid red gavel and slams it down with catastrophic force!",
    animationDesc:
      "10.0-12.8s stickman raises giant red gavel overhead; 12.8s colossal slam down; 12.8-16.0s shockwave ring, floor cracks shoot across canvas, columns buckle.",
    soundDesc: "Heavy foot stomp, dramatic wind-up whoosh, colossal thunderous hammer impact, and crashing stone pillars.",
    captionText: "DECISIVE ACTION.",
    punchline: "DECISIVE ACTION.",
    characterAction: "Leaps, grips giant red gavel with both hands, slams floor with decisive force.",
    propAction: "Giant red gavel smashes the ground; black columns fracture and crack lines spread.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Find The Vector",
    timeRange: [16.0, 21.0],
    videoPrompt:
      "Stickman encounters a red obstacle block in a minimalist maze. A dashed trajectory vector calculates the escape arc, and he leaps over cleanly.",
    animationDesc:
      "16.0-18.0s walks up to blocking red barrier, pauses to calculate; 18.0-21.0s dashed vector curve appears, stickman leaps cleanly over the obstacle.",
    soundDesc: "Rhythmic footsteps, calculating digital blip, and clean athletic leap whoosh.",
    captionText: "FIND THE VECTOR.",
    punchline: "FIND THE VECTOR.",
    characterAction: "Calculates trajectory, springs into athletic parkour leap.",
    propAction: "Minimalist maze walls, red barrier, and glowing trajectory curve.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "Shatter The Trap",
    timeRange: [21.0, 26.0],
    videoPrompt:
      "The stickman confronts the red cage armed with the red gavel. He swings and smashes the cage, which explodes into 40+ geometric red shards flying outward!",
    animationDesc:
      "21.0-23.2s wind-up swing; 23.2s impact shatters the red cage; 23.2-26.0s 40+ sharp red shards blast outward with screen shake.",
    soundDesc: "Heavy whoosh, explosive glass/metal shatter, and dispersing debris clatter.",
    captionText: "SHATTER THE TRAP!",
    punchline: "SHATTER THE TRAP!",
    characterAction: "Swings gavel forward, smashes cage, lands in empowered follow-through.",
    propAction: "Red cage bursts into dozens of high-velocity rotating polygon shards.",
  },
  {
    id: 6,
    name: "Scene 6",
    title: "Clarity Over Noise",
    timeRange: [26.0, 30.0],
    videoPrompt:
      "Clean open minimalist canvas. Stickman stands in calm mastery. Overhead meter shows 100% BALANCED CLARITY. He gives a confident thumbs-up to camera.",
    animationDesc:
      "26.0-28.5s calm breathing, 100% clarity bar pulses softly; 28.5-30.0s turns to camera, gives thumbs-up with sparkle ding.",
    soundDesc: "Serene glass chime, deep calm breath, and crisp confidence ding.",
    captionText: "FEW LINES. BIG IDEA.",
    punchline: "FEW LINES. BIG IDEA.",
    characterAction: "Stands upright, breathes calmly, gives confident thumbs-up.",
    propAction: "Clean minimalist HUD bar at 100% Clarity.",
  },
];

export const DIAMOND_HEIST_PROMPT = `THE ANGRY STICKMAN: THE IMPOSSIBLE DIAMOND HEIST — 30-SECOND AI VIDEO PROMPT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080×1920, 24fps.

VISUAL STYLE:
Minimalist flat 2D vector animation, thick black outlines, white round stickman head, black stickman body, expressive eyebrows, exaggerated physical comedy, a grand museum gallery, red security lasers, a glass display case, a giant sparkling diamond, a spoon, a metal serving tray, and a janitor's bucket. Keep the character and museum layout consistent throughout.

SCENE 1 (0–5 seconds):
The angry stickman sneaks into a museum gallery and spots a giant diamond inside a glass display case. He pulls a tiny spoon from his pocket and confidently points it at the diamond.
Caption added during editing: "He wants to steal a diamond using ONLY a spoon!"
Sound: Sneaky music and sparkling chime.

SCENE 2 (5–9 seconds):
He crawls beneath red laser beams but stands up too early and triggers the security system. Red lights flash and an alarm sounds. He freezes and gives the camera an innocent smile.
Caption: "ONE WRONG MOVE… ALARM!"
Sound: Laser zap, loud siren, awkward cough.

SCENE 3 (9–15 seconds):
Furious, he studies the gallery and spots a rolling janitor's bucket, a mop, and a shiny serving tray. He suddenly gets an idea and positions the tray like a trickshot surface.
Caption: "FINE. HE'LL USE PHYSICS!"
Sound: Record scratch followed by an idea ding.

SCENE 4 (15–22 seconds):
He flicks a tiny metal ball with the spoon. The ball ricochets off the serving tray, bounces off a wall, and hits a clearly visible automatic cleaning demonstration button. The display case opens as part of its scheduled demonstration. Show the entire improbable trajectory clearly.
Caption: "THE MOST RIDICULOUS PLAN EVER!"
Sound: Ping, boing, mechanical click, dramatic music.

SCENE 5 (22–26 seconds):
The stickman uses the spoon to lift the giant diamond and proudly holds it up. The alarms stop, and he celebrates as though he has accomplished the greatest trickshot in history.
Caption: "HE ACTUALLY GOT IT!"
Sound: Angelic choir and victory fanfare.

SCENE 6 (26–30 seconds):
The display case automatically closes around the stickman for the next exhibit cycle. He is trapped inside like a living statue, still holding the diamond. Visitors gather outside and take photographs. He maintains a fake smile while one eyebrow twitches angrily.
Caption: "HE FORGOT THE EXIT! 💀"
Sound: Glass clunk, camera clicks, muffled angry scream. End with a freeze-frame.

CAMERA:
Use quick cuts, expressive close-ups, clear movement, exaggerated cartoon timing, and a strong final visual punchline. Keep all actions readable without dialogue.

TEXT:
Do not generate text inside the animation frames. Add all captions during editing, timed to the matching scenes. Use bold, high-contrast text near the top of the vertical frame.

AUDIO:
Use sneaky music, laser zaps, alarms, metallic pings, mechanical clicks, a victory fanfare, and comedic camera sounds. No spoken dialogue, logos, or watermarks.`;

export const DIAMOND_HEIST_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Heist Begins",
    timeRange: [0.0, 5.0],
    videoPrompt:
      "The angry stickman sneaks into a museum gallery and spots a giant diamond inside a glass display case. He pulls a tiny spoon from his pocket and confidently points it at the diamond.",
    animationDesc:
      "0.0-0.8s stickman sneaks into gallery, 0.8-1.5s spots giant diamond in glass case, 1.5-2.5s pulls tiny spoon from pocket with flourish, 2.5-3.5s points spoon at diamond with confident smirk, 3.5-5.0s leans in admiring the target.",
    soundDesc: "Sneaky pizzicato music, sparkling diamond chime at 1.0s, spoon draw sound at 2.0s.",
    captionText: "He wants to steal a diamond using ONLY a spoon!",
    punchline: "One spoon, one giant diamond, zero plan.",
    characterAction: "Sneaks in, spots diamond, pulls spoon dramatically, points confidently.",
    propAction: "Grand museum gallery with glass display case containing giant sparkling diamond.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "The Alarm",
    timeRange: [5.0, 9.0],
    videoPrompt:
      "He crawls beneath red laser beams but stands up too early and triggers the security system. Red lights flash and an alarm sounds. He freezes and gives the camera an innocent smile.",
    animationDesc:
      "5.0-6.0s crawls under red laser grid, 6.0-6.5s stands up too early, chest hits laser beam, 6.5-7.0s red alarm lights flash, siren blares, 7.0-8.0s freezes in place, 8.0-9.0s turns to camera with innocent grin and raised eyebrow.",
    soundDesc: "Laser zap at 6.5s, loud siren alarm from 6.5s, awkward cough at 8.5s.",
    captionText: "ONE WRONG MOVE… ALARM!",
    punchline: "The world's most impatient laser crawler.",
    characterAction: "Crawls carefully, prematurely stands, triggers alarm, freezes, innocent smile.",
    propAction: "Red laser grid across gallery, glass case, flashing red alarm lights.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Setup",
    timeRange: [9.0, 15.0],
    videoPrompt:
      "Furious, he studies the gallery and spots a rolling janitor's bucket, a mop, and a shiny serving tray. He suddenly gets an idea and positions the tray like a trickshot surface.",
    animationDesc:
      "9.0-9.5s rage spark, eyebrows furrow, 9.5-10.5s scans gallery, spots bucket and mop, 10.5-11.5s rolls janitor's bucket into position, 11.5-12.5s places metal serving tray at perfect angle, 12.5-13.5s positions mop as backstop, 13.5-15.0s steps back, aims spoon at tiny metal ball on tray, manic grin.",
    soundDesc: "Rage growl at 9.0s, bucket roll clatter, tray clink, mop thud, record scratch at 12.0s, idea ding at 13.0s, dramatic rising music.",
    captionText: "FINE. HE'LL USE PHYSICS!",
    punchline: "A janitor's bucket, a serving tray, and pure desperation.",
    characterAction: "Rages, scans, drags bucket, angles tray, positions mop, aims with wild eyes.",
    propAction: "Janitor's bucket, mop, metal serving tray arranged as trickshot rig; tiny metal ball on tray.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Impossible Shot",
    timeRange: [15.0, 22.0],
    videoPrompt:
      "He flicks a tiny metal ball with the spoon. The ball ricochets off the serving tray, bounces off a wall, and hits a clearly visible automatic cleaning demonstration button. The display case opens as part of its scheduled demonstration. Show the entire improbable trajectory clearly.",
    animationDesc:
      "15.0-15.3s flicks ball with spoon, 15.3-16.0s ball hits serving tray with loud PING, 16.0-17.0s ricochets off gallery wall with BOING, 17.0-18.5s flies through air in perfect arc, 18.5-19.5s hits automatic cleaning demo button, 19.5-20.5s mechanical click, display case slides open, 20.5-22.0s diamond revealed, stickman stares in disbelief.",
    soundDesc: "Spoon flick thwack at 15.0s, tray PING at 15.5s, wall BOING at 16.2s, flight whoosh, button click at 19.5s, mechanical case opening, dramatic success sting at 20.5s.",
    captionText: "THE MOST RIDICULOUS PLAN EVER!",
    punchline: "A spoon, a tray, a wall, a button — perfection.",
    characterAction: "Flicks ball, tracks with head whipping between impacts, freezes at button hit, disbelief.",
    propAction: "Metal ball ricochets off tray, wall, hits demo button; glass case slides open revealing diamond.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Victory",
    timeRange: [22.0, 26.0],
    videoPrompt:
      "The stickman uses the spoon to lift the giant diamond and proudly holds it up. The alarms stop, and he celebrates as though he has accomplished the greatest trickshot in history.",
    animationDesc:
      "22.0-23.0s reaches in with spoon, scoops giant diamond, 23.0-24.0s holds diamond high on spoon like a trophy, 24.0-25.0s alarms stop, silence, 25.0-26.0s explosive celebration, victory dance, kisses spoon.",
    soundDesc: "Scoop sound at 22.5s, alarms cut at 24.0s, angelic choir at 24.0s, victory fanfare from 24.5s, celebratory whoops.",
    captionText: "HE ACTUALLY GOT IT!",
    punchline: "The most absurd heist in history actually worked.",
    characterAction: "Scoops diamond with spoon, holds it triumphantly, alarms stop, erupts in victory dance.",
    propAction: "Giant diamond balanced on tiny spoon; display case open; alarms silent.",
  },
  {
    id: 6,
    name: "Scene 6",
    title: "The Trap",
    timeRange: [26.0, 30.0],
    videoPrompt:
      "The display case automatically closes around the stickman for the next exhibit cycle. He is trapped inside like a living statue, still holding the diamond. Visitors gather outside and take photographs. He maintains a fake smile while one eyebrow twitches angrily.",
    animationDesc:
      "26.0-26.5s case mechanism activates, glass slides shut around him, 26.5-27.5s stickman frozen inside case like exhibit, 27.5-28.5s visitors gather, camera flashes, 28.5-29.5s stickman forced smile, eyebrow twitches with rage, 29.5-30.0s comedic freeze-frame on trapped face.",
    soundDesc: "Glass clunk at 26.5s, camera shutter clicks from 27.5s, muffled angry scream at 29.0s, record scratch freeze at 29.5s.",
    captionText: "HE FORGOT THE EXIT! 💀",
    punchline: "He stole the diamond but became the exhibit.",
    characterAction: "Trapped inside case, visitors photograph, fake smile, angry eyebrow twitch.",
    propAction: "Glass case closes around stickman; visitors outside with cameras; diamond still on spoon.",
  },
];

export const PANCAKE_FLIP_PROMPT = `THE ANGRY STICKMAN: THE PERFECT PANCAKE FLIP — 30-SECOND AI VIDEO PROMPT

Create a 30-second funny 2D stickman animation for YouTube Shorts, vertical 9:16, 1080x1920, 24fps.

VISUAL STYLE:
2D flat vector cartoon animation in a clean Modern Pop style, thick black outlines, bright flat colors, smooth 24 fps motion, exaggerated but readable cartoon physics. The main character is an angry-looking black stickman with a round white face, thick expressive eyebrows, a red beanie, and a bright yellow shirt. He is the only character in the entire animation. His personality is determined, competitive, impatient, and comically overconfident. The setting is a colorful modern kitchen with turquoise cabinets, a pink backsplash, an orange countertop, a gas stove on the left side of the counter, and a visible sink beside the stove. The kitchen contains a black frying pan, a metal spatula, one white round plate, three hardcover cookbooks, one wooden cutting board, and a small bottle of maple syrup. Keep the character, kitchen layout, prop positions, lighting and palette identical across every scene.

CONTINUITY LOCK:
There is exactly one golden pancake throughout the story. Never duplicate, replace, or transform it. The stove and sink remain on the left side of the counter; the ramp and plate are on the right. Once constructed, the wooden cutting board remains supported by the three stacked cookbooks. The white plate sits a short distance beyond the ramp's upper end, aligned with the pancake's flight path but not touching the ramp. The same black frying pan is used throughout. When the stickman catches the pancake during the second failed attempt, he holds the pan below the lower end of the ramp. Use hard cuts to hide difficult object handoffs. Never teleport objects or introduce unestablished props.

SHOT 1 (0-2s) THE HOOK:
Extreme close-up of the determined face, thick eyebrows angled sharply down, eyes locked on camera, gripping the black frying pan with the golden pancake visible along the bottom of the frame. Fast smash zoom, brief freeze-frame and a simple graphic flash without lettering. Caption added during editing: "CAN HE LAND IT?" Sound: dramatic whoosh, record-scratch freeze.

SHOT 2 (2-6s) THE FIRST FAILURE:
Wide shot of the kitchen. He confidently flicks the pan upward; the single pancake launches too high, spins and sticks flat against the ceiling with an exaggerated splat. Ceiling visible in the upper part of the frame. He slowly raises his head, eyebrows twitching in disbelief. Caption: "FIRST TRY…" Sound: pan swoosh, cartoon boing, sticky splat, short record scratch.

SHOT 3 (6-10s) THE PLAN:
Hard cut to the same pancake resting in the frying pan. A simple lightbulb graphic appears above his head. The wooden cutting board is already assembled into a ramp supported by the three stacked cookbooks; he adjusts the white plate a short distance beyond the upper end along the flight path, measures the angle with his hands, narrows his eyes and grins. Caption: "TIME FOR A RAMP." Sound: lightbulb ding, wooden clack, rising musical build.

SHOT 4 (10-13s) THE SECOND FAILURE:
Wide stable shot of the stickman, frying pan, ramp and plate. He holds the pan just below the lower end of the ramp and flicks the pancake onto the wooden board. The pancake slides halfway up, loses momentum, tips sideways and slides back into the pan he is holding underneath. He pauses, then slowly glares directly at the camera. Caption: "NOPE." Sound: wooden slide, soft flop, short sad trombone.

SHOT 5A (13-16s) THE FINAL LAUNCH:
He cracks his knuckles, takes a deep breath, narrows his eyes and flicks the single pancake from the pan onto the lower end of the ramp with a strong clean motion. The pancake slides rapidly up the board and launches into the air toward the plate. The camera follows the pancake briefly; end while it is airborne. Caption: "ONE SHOT." Sound: launch whoosh, rising whistle.

SHOT 5B (16-19s) THE PERFECT LANDING:
Continue directly from the airborne position. The same pancake spins through a smooth exaggerated arc above the plate while the stickman leans forward with clenched fists and wide eyes. It descends into the exact center of the white plate and settles flat without bouncing. A tiny sparkle appears on impact. No caption. Sound: rising whistle, brief sparkle, satisfying plate clink.

SHOT 6 (19-23s) THE CHAMPION:
He freezes in disbelief, then jumps into the air with both arms raised as colorful confetti bursts around him. He lands in an exaggerated champion pose and points proudly at the pancake. The plate and pancake stay stationary. Caption: "PERFECT!!!" Sound: victory fanfare, confetti pop, short crowd cheer.

SHOT 7 (23-29s) PANCAKE REVENGE:
Beat 1: while celebrating he backs into the countertop and bumps it with his hip; the plate jolts and the pancake slides off. Beat 2: hard cut to the same pancake already stuck flat across his face; do not animate a complicated airborne collision. Beat 3: the pancake slowly slides down his face revealing an intensely furious expression, fists clenched. Optionally one small drop of maple syrup drips onto his shirt. Caption: "…OR NOT 💀" Sound: counter bump, wet splat, slow sticky slide, angry musical sting.

SHOT 8 (29-30s) THE FINAL GAG:
The golden pancake now rests on top of his head like a tiny golden hat. He stands completely still, staring into the camera with a defeated furious expression, red beanie still visible. Slowly push the camera toward his face, matching Shot 1's framing. No caption. Sound: tiny sad trombone, then brief silence.

NEGATIVE PROMPT:
Photorealism, 3D rendering, extra characters, dialogue, speech bubbles, generated text inside the frames, logos, watermarks, changing outfits, changing kitchen colors, inconsistent character design, blurry images, distorted hands, extra limbs, duplicated pancakes, duplicated plates, morphing objects, random camera orientation, unnecessary scene transitions.

CAPTIONS (added during editing, upper-middle area 15-35% down, white extra-bold with thick black outline):
1. "CAN HE LAND IT?" 2. "FIRST TRY…" 3. "TIME FOR A RAMP." 4. "NOPE." 5. "ONE SHOT." 6. none 7. "PERFECT!!!" 8. "…OR NOT 💀" 9. none.

AUDIO:
One upbeat bouncy comedic background track at about 20-30% of the mix, prominent synchronized SFX, a music dip just before the pancake hits his face, short silence after the final sad trombone. No spoken dialogue or narration.`;

export const PANCAKE_FLIP_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Hook",
    timeRange: [0.0, 2.0],
    videoPrompt:
      "Extreme close-up of the angry stickman's determined face, thick eyebrows angled sharply downward, eyes locked on the camera, gripping the black frying pan with the golden pancake visible along the bottom of the frame. Fast smash zoom, brief freeze-frame and a simple graphic flash without lettering.",
    animationDesc:
      "0.0-0.7s smash zoom toward the face, 0.7-1.2s freeze-frame with graphic flash, 1.2-2.0s hold the determined close-up with the pan and pancake at the bottom of frame.",
    soundDesc: "Dramatic whoosh at 0.0s, record-scratch freeze at 0.9s.",
    captionText: "CAN HE LAND IT?",
    punchline: "One pancake, one impossible trickshot, zero patience.",
    characterAction: "Stares down the camera, grips the pan, prepares the trick shot.",
    propAction: "Black frying pan with the single golden pancake visible at the bottom.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "The First Failure",
    timeRange: [2.0, 6.0],
    videoPrompt:
      "Wide shot of the kitchen. The stickman stands beside the stove holding the frying pan. He confidently flicks the pan upward. The single golden pancake launches too high, spins through the air and sticks flat against the kitchen ceiling with an exaggerated cartoon splat. Ceiling visible in the upper part of the frame. He slowly raises his head to look at the pancake, eyebrows twitching in disbelief.",
    animationDesc:
      "2.0-2.8s confident wind-up, 2.8-3.4s pancake launches too high, 3.4-4.0s sticks flat to the ceiling with a splat, 4.0-4.6s camera punch-in toward the pancake, 4.6-6.0s stickman looks up in disbelief, eyebrows twitching.",
    soundDesc: "Pan swoosh at 2.6s, cartoon boing at 3.1s, sticky splat at 3.6s, short record scratch at 4.4s.",
    captionText: "FIRST TRY…",
    punchline: "The pancake found the ceiling instead of the plate.",
    characterAction: "Flicks confidently, watches the pancake stick to the ceiling, disbelief.",
    propAction: "Single golden pancake stuck flat on the ceiling; empty frying pan in his hand.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "The Plan",
    timeRange: [6.0, 10.0],
    videoPrompt:
      "Hard cut to the same golden pancake already resting inside the frying pan. The stickman suddenly gets an idea and a simple lightbulb graphic appears above his head. The wooden cutting board is already assembled into a ramp supported by three stacked hardcover cookbooks. He adjusts the white plate a short distance beyond the upper end of the ramp along the flight path, measures the angle with his hands, narrows his eyes and grins.",
    animationDesc:
      "6.0-6.6s hard cut to pancake in pan, 6.6-7.4s lightbulb graphic appears, 7.4-8.4s completed ramp and plate setup shown, 8.4-9.2s he measures the ramp angle with his hands, 9.2-10.0s narrows eyes and grins with exaggerated overconfidence.",
    soundDesc: "Lightbulb ding at 7.2s, wooden clack at 8.2s, rising musical build from 8.5s.",
    captionText: "TIME FOR A RAMP.",
    punchline: "A cutting board, three cookbooks and pure desperation.",
    characterAction: "Gets the idea, adjusts the plate, measures the ramp, grins.",
    propAction: "Cutting board ramp on three stacked cookbooks; white plate beyond the upper end; pancake back in the pan.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "The Second Failure",
    timeRange: [10.0, 13.0],
    videoPrompt:
      "Wide stable shot clearly showing the stickman, frying pan, ramp and plate. He holds the pan just below the lower end of the ramp and flicks the golden pancake onto the wooden board. The pancake slides halfway up, loses momentum, tips sideways and slides backward into the pan he is holding underneath. He looks down at it, pauses, then slowly turns his head toward the camera and glares directly at the viewer. His shoulders slump slightly.",
    animationDesc:
      "10.0-10.5s holds the pan below the ramp, 10.5-11.2s flicks the pancake onto the board, 11.2-12.0s pancake slides halfway up, tips and slides back into the pan, 12.0-13.0s he pauses and glares straight at the camera with slumped shoulders.",
    soundDesc: "Wooden slide at 11.2s, soft flop at 12.0s, short sad trombone at 12.2s.",
    captionText: "NOPE.",
    punchline: "Physics said no.",
    characterAction: "Flicks the pancake, catches it back in the pan, glares at the camera.",
    propAction: "Pancake slides up and returns to the frying pan below the ramp; plate stays beyond the ramp.",
  },
  {
    id: 5,
    name: "Shot 5A",
    title: "The Final Launch",
    timeRange: [13.0, 16.0],
    videoPrompt:
      "Wide shot showing the stickman, black frying pan, wooden ramp and white plate. The plate remains a short distance beyond the ramp's upper end along the intended flight path. He cracks his knuckles, takes a deep breath, narrows his eyes and flicks the single golden pancake from the pan onto the lower end of the ramp with a strong, clean motion. The pancake slides rapidly up the board and launches into the air toward the plate. The camera follows the pancake briefly and ends while it is airborne.",
    animationDesc:
      "13.0-13.6s cracks his knuckles, 13.6-14.2s deep breath and narrow eyes, 14.2-14.8s clean flick onto the low end of the ramp, 14.8-15.5s pancake slides rapidly up the board, 15.5-16.0s pancake launches into the air as the camera follows.",
    soundDesc: "Knuckle crack at 13.3s, deep breath at 13.8s, launch whoosh at 14.4s, rising whistle from 15.2s.",
    captionText: "ONE SHOT.",
    punchline: "Everything comes down to this flick.",
    characterAction: "Cracks knuckles, breathes deep, flicks the pancake up the ramp.",
    propAction: "Pancake slides up the wooden ramp and launches into the air toward the plate.",
  },
  {
    id: 6,
    name: "Shot 5B",
    title: "The Perfect Landing",
    timeRange: [16.0, 19.0],
    videoPrompt:
      "Continue directly from the airborne position. The same golden pancake continues along the same flight direction, preserving its size, color, shape and rotation. The white plate remains stationary. The pancake spins through a smooth exaggerated cartoon arc above the plate while the stickman leans forward with clenched fists and wide eyes. It descends into the exact center of the white plate and settles flat without bouncing out. A tiny sparkle appears on impact.",
    animationDesc:
      "16.0-17.4s pancake arcs smoothly above the plate, 17.4-18.2s descends into the center of the plate, 18.2-18.6s settles flat with a tiny sparkle, 18.6-19.0s stickman holds his breath with clenched fists.",
    soundDesc: "Rising whistle through the arc, brief sparkle at 18.3s, satisfying plate clink at 18.4s.",
    punchline: "Airborne and perfect - nothing can go wrong now.",
    characterAction: "Leans forward, clenched fists, wide eyes, holds his breath.",
    propAction: "Pancake lands flat in the center of the white plate without bouncing.",
  },
  {
    id: 7,
    name: "Shot 6",
    title: "The Champion",
    timeRange: [19.0, 23.0],
    videoPrompt:
      "The stickman stares at the pancake sitting perfectly in the center of the plate. He freezes in disbelief for a brief moment, then jumps into the air with both arms raised as colorful confetti bursts around him. He lands in an exaggerated champion pose and points proudly at the pancake as if he has won a world championship. The plate and pancake remain stationary.",
    animationDesc:
      "19.0-19.6s disbelief freeze, 19.6-20.6s jumps with arms raised, 20.6-21.2s confetti burst, 21.2-22.2s lands in champion pose, 22.2-23.0s points proudly at the pancake.",
    soundDesc: "Victory fanfare at 19.8s, confetti pop at 20.6s, short crowd cheer from 21.0s.",
    captionText: "PERFECT!!!",
    punchline: "The most absurd flip in pancake history actually landed.",
    characterAction: "Freezes, jumps, celebrates, points proudly at the pancake.",
    propAction: "Confetti burst; plate and pancake remain stationary on the counter.",
  },
  {
    id: 8,
    name: "Shot 7",
    title: "Pancake Revenge",
    timeRange: [23.0, 29.0],
    videoPrompt:
      "Three clear comedic beats. Beat 1: while celebrating, the stickman accidentally backs into the countertop and bumps it with his hip; the white plate jolts and the pancake slides off. Beat 2: hard cut to the same golden pancake already stuck flat across his face, covering most of it while the red beanie and yellow shirt remain visible. Beat 3: the pancake slowly slides down his face revealing an intensely furious expression, thick eyebrows angled sharply down, fists clenched. Optionally one small drop of maple syrup drips onto his shirt.",
    animationDesc:
      "23.0-24.0s he backs into the counter and bumps it, 24.0-24.6s plate jolts and pancake slides off, 24.6-25.2s hard cut to the pancake stuck flat across his face, 25.2-27.2s pancake slowly slides down, 27.2-29.0s furious reaction with clenched fists and an angry sting.",
    soundDesc: "Counter bump at 23.4s, wet splat at 24.8s, slow sticky slide 25.4-27.0s, angry musical sting at 27.4s.",
    captionText: "…OR NOT 💀",
    punchline: "The pancake had other plans.",
    characterAction: "Bumps the counter, gets a pancake to the face, slides it off, furious.",
    propAction: "Plate jolts, pancake slides off, sticks across his face, then slides down.",
  },
  {
    id: 9,
    name: "Shot 8",
    title: "The Final Gag",
    timeRange: [29.0, 30.0],
    videoPrompt:
      "The golden pancake now rests on top of the stickman's head like a tiny golden hat. He stands completely still and stares directly into the camera with a defeated, furious expression. His red beanie remains visible beneath the pancake and his yellow shirt stays unchanged. Slowly push the camera toward his face, matching Shot 1's head size, angle and centered composition as closely as possible. Hold the final image briefly.",
    animationDesc:
      "29.0-29.4s slow camera push toward the pancake hat, 29.4-30.0s hold the defeated furious stare.",
    soundDesc: "Tiny sad trombone at 29.1s, then brief silence.",
    punchline: "He finally landed the pancake... on his head.",
    characterAction: "Stands still with the pancake on his head, stares into the camera, defeated.",
    propAction: "Golden pancake resting on top of his head like a hat.",
  },
];

export const VENDING_MACHINE_PROMPT = `THE ANGRY STICKMAN: THE VENDING MACHINE REVENGE — 30-SECOND AI VIDEO PROMPT

Create a 30-second funny 2D stickman animation for YouTube Shorts, vertical 9:16, 1080x1920, 24fps.

VISUAL STYLE:
2D flat vector cartoon in clean Modern Pop style, thick black outlines, bright flat colors, smooth 24 fps motion, exaggerated cartoon physics. The main character is an angry-looking black stickman with a round white face, thick expressive eyebrows, a red beanie, and a bright yellow shirt. He is the only character. The setting is a small, brightly lit snack nook with a mint-green wall, a purple floor, and one tall blue vending machine centered against the wall. The machine has a big glass window showing three rows of colorful snacks, a coin slot and a small keypad on the right side, and a black flap at the bottom where snacks drop. Vertical 9:16 framing. The character and key objects stay in the centre 60% of the frame. Keep the same character design, outfit, set and colors in every shot.

CONTINUITY LOCK:
There is exactly one vending machine, one stickman, one tall push broom (introduced in Shot 4), and two bags of chips: a yellow bag and an orange bag. The bags are the only chips that ever appear. Do not duplicate, transform, or replace the bags, and do not add objects. Keep object sizes, proportions and camera orientation consistent. Use hard cuts to hide difficult object handoffs. No object teleports.

NEGATIVE PROMPT:
Photorealistic, 3D render, extra characters, dialogue, speech bubbles, text, letters, readable labels, subtitles, logos, brand names, watermarks, changing outfit, changing set colors, blurry, distorted hands, extra limbs.

SHOT 1 (0-2s) THE HOOK:
Extreme close-up of the stickman's angry face pressed against the vending machine glass, one eyebrow twitching. Behind the glass, a yellow chip bag dangles by one corner from its spiral, barely hanging on. Fast smash zoom in, then a hard freeze-frame with a brief graphic flash (no lettering or symbols). Caption added in the edit: "IT STOLE HIS COIN." SFX: dramatic whoosh, record-scratch freeze.

SHOT 2 (2-6s) ATTEMPT 1, THE SHAKE:
Wide shot of the stickman and the full machine. He grabs both sides of the machine and shakes it hard; the machine wobbles and rattles, and the yellow bag swings back and forth but stays hanging. He stops, slowly looks at the bag, and glares. Keep the whole machine visible. Caption: "ATTEMPT 1: SHAKE IT." SFX: rattling shake, cartoon boing, record scratch. Edit: quick punch-in on the swinging bag.

SHOT 3 (6-10s) ATTEMPT 2, THE SECOND COIN:
The stickman slowly pulls out a second coin from his pocket, kisses it for luck, and drops it into the slot. Hard cut to the inside of the machine glass: an orange bag drops from its spiral and stops hanging directly behind the yellow bag, so now two bags are stuck. Cut back to the stickman, whose eyebrows twitch in disbelief. Caption: "SECOND COIN…" with an optional follow-up at 9.0s: "NOW IT STOLE TWO." SFX: coin clink, spiral whirr, thud, record scratch.

SHOT 4 (10-14s) ATTEMPT 3, THE BROOM:
Hard cut to the stickman already holding the tall push broom. A lightbulb pops up above his head. He kneels, pushes the broom handle up through the black flap at the bottom of the machine, and pokes upward. The handle jams solidly in the flap and will not move. He tugs with both hands, straining, and gets nowhere. Keep the machine, broom and character visible in one wide shot. Caption: "TIME FOR A BROOM." SFX: lightbulb ding, wooden scrape, strained tug, sad trombone note.

SHOT 5 (14-19s) THE FLYING KICK:
The broom is gone (hard cut, empty floor). The stickman backs up to the far edge of the frame, cracks his knuckles, and sprints toward the machine. He leaps into a flying kick pose toward the glass. Slow-motion at the moment of contact: his foot hits the machine and the whole machine shudders, with a dramatic shockwave ring. End the clip right at impact. Caption: "NOW IT'S PERSONAL." SFX: footsteps, rising whistle, huge cartoon impact. Edit: slow down to about 40-50% only for the final airborne second, then return to normal speed at the impact.

SHOT 6 (19-23s) THE CELEBRATION:
Both the yellow and orange bags drop together into the flap. Hard cut to the stickman standing back up, dusting off, then pulling both bags from the flap. He holds them above his head, then jumps with both arms up while colorful confetti bursts around him. Energetic but brief. Caption: "BOTH BAGS!!!" SFX: double thud, victory fanfare, confetti pop, short crowd cheer.

SHOT 7 (23-29s) THE PUNCHLINE:
The stickman sits on the floor and tears open the yellow bag with a happy grin. A giant puff of air bursts out, blowing his eyebrows back and shaking his shirt. He looks inside, tilts the bag over his open palm, and exactly one tiny chip falls out and lands in his hand. Close-up on his palm, then his face, with eyebrows slowly slamming down into fury. Keep him centered and the single chip clearly visible. Caption: "99% AIR 💀" SFX: bag rip, big air puff, one tiny chip tink, slow angry sting.

SHOT 8 (29-30s) THE END FRAME:
The stickman stares directly into the camera, furious and defeated, holding the single chip between two fingers. Slowly push in toward his face. Match Shot 1's head size, camera angle and centered framing as closely as possible. Hold for a fraction of a second, then cut back to the opening for a comedic replay. No caption. SFX: tiny sad trombone, then a short silence.

CAPTIONS:
Add in the editor. Extra-bold sans-serif, white fill, thick black outline and drop shadow. Two to four words each, one line where possible. Position about 15-35% down from the top. Avoid the bottom 20% and the right edge. Quick 0.1s scale-bounce pop-in on the sound effect.

AUDIO:
One bouncy comedic loop at about 20-30% volume (royalty-free or YouTube Audio Library). SFX at full presence, cut precisely on the action. Music dip for 0.3s right before the air puff in Shot 7. No spoken dialogue or narration.

EDITING RULES:
Fast cuts through Shots 1-4. Slow motion only in Shot 5. Punch-ins on the swinging bag (Shot 2), the kick impact (Shot 5) and the lone chip (Shot 7). Never render real brand names or snack logos; use plain colored bags only. One simple action per shot; hard cuts to hide tricky handoffs.`;

export const VENDING_MACHINE_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Hook",
    timeRange: [0.0, 2.0],
    videoPrompt:
      "Extreme close-up of the stickman's angry face pressed against the vending machine glass, one eyebrow twitching. Behind the glass, a yellow chip bag dangles by one corner from its spiral, barely hanging on. Fast smash zoom in, then a hard freeze-frame with a brief graphic flash.",
    animationDesc:
      "0.0-0.9s fast smash zoom into the angry face against the glass, 0.9-1.9s hard freeze-frame with a white graphic flash, yellow bag dangling by one corner behind the glass.",
    soundDesc: "Dramatic whoosh at 0.0s, record-scratch freeze at 0.9s.",
    captionText: "IT STOLE HIS COIN.",
    punchline: "The machine has his coin and he has lost his patience.",
    characterAction: "Face pressed to the glass, eyebrow twitching, furious.",
    propAction: "One yellow chip bag dangles by a corner inside the glass.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "The Shake",
    timeRange: [2.0, 6.0],
    videoPrompt:
      "Wide shot of the stickman and the full machine. He grabs both sides of the machine and shakes it hard; the machine wobbles and rattles, and the yellow bag swings back and forth but stays hanging. He stops, slowly looks at the bag, and glares.",
    animationDesc:
      "2.0-2.5s grabs both sides, 2.5-4.2s shakes the machine hard, the yellow bag swings but stays hanging, 4.2-4.8s stops and looks at the bag, 4.8-6.0s glares at the machine.",
    soundDesc: "Rattling shake 2.5-4.2s, cartoon boing at 4.3s, record scratch at 4.8s.",
    captionText: "ATTEMPT 1: SHAKE IT.",
    punchline: "The machine rattles. The bag stays.",
    characterAction: "Grabs and shakes the machine, stops, glares at the stuck bag.",
    propAction: "Vending machine wobbles; yellow bag swings by one corner, still stuck.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "The Second Coin",
    timeRange: [6.0, 10.0],
    videoPrompt:
      "The stickman slowly pulls out a second coin from his pocket, kisses it for luck, and drops it into the slot. Hard cut to the inside of the machine glass: an orange bag drops from its spiral and stops hanging directly behind the yellow bag, so now two bags are stuck. Cut back to the stickman, whose eyebrows twitch in disbelief.",
    animationDesc:
      "6.0-6.7s pulls out the second coin, 6.7-7.3s kisses it, 7.3-7.8s drops it into the slot, 7.8-8.6s hard cut inside the glass as the orange bag drops and hangs behind the yellow bag, 8.6-10.0s cut back to the stickman's twitching eyebrows.",
    soundDesc: "Coin clink at 7.7s, spiral whirr 7.8-8.4s, thud at 8.5s, record scratch at 9.0s.",
    captionText: "SECOND COIN…",
    punchline: "Now the machine has two coins and two stuck bags.",
    characterAction: "Pulls out a coin, kisses it, drops it in, then stares in disbelief.",
    propAction: "Orange bag drops and hangs directly behind the yellow bag.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "The Broom",
    timeRange: [10.0, 14.0],
    videoPrompt:
      "Hard cut to the stickman already holding the tall push broom. A lightbulb pops up above his head. He kneels, pushes the broom handle up through the black flap at the bottom of the machine, and pokes upward. The handle jams solidly in the flap and will not move. He tugs with both hands, straining, and gets nowhere. Keep the machine, broom and character visible in one wide shot.",
    animationDesc:
      "10.0-10.6s hard cut to the broom in hand, 10.6-11.2s lightbulb appears, 11.2-12.0s kneels and pushes the handle into the flap, 12.0-12.8s the handle jams, 12.8-14.0s he tugs and strains with no movement.",
    soundDesc: "Lightbulb ding at 10.8s, wooden scrape at 11.6s, strained tug at 12.6s, sad trombone note at 13.4s.",
    captionText: "TIME FOR A BROOM.",
    punchline: "The broom meets a flap that refuses to cooperate.",
    characterAction: "Kneels, pokes the broom into the flap, tugs and strains.",
    propAction: "Tall push broom introduced; handle jams solidly in the black flap.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "The Flying Kick",
    timeRange: [14.0, 19.0],
    videoPrompt:
      "The broom is gone. The stickman backs up to the far edge of the frame, cracks his knuckles, and sprints toward the machine. He leaps into a flying kick pose toward the glass. Slow-motion at the moment of contact: his foot hits the machine and the whole machine shudders, with a dramatic shockwave ring. End the clip right at impact.",
    animationDesc:
      "14.0-14.8s backs up and cracks his knuckles, 14.8-15.8s sprints toward the machine, 15.8-18.2s leaps into the flying kick in slow motion, 18.2-19.0s foot contacts the glass and the machine shudders with a shockwave ring.",
    soundDesc: "Footsteps 14.8-15.8s, rising whistle 16.0-18.2s, huge cartoon impact at 18.4s.",
    captionText: "NOW IT'S PERSONAL.",
    punchline: "He is done negotiating with the machine.",
    characterAction: "Backs up, cracks knuckles, sprints, leaps into a flying kick.",
    propAction: "Broom is gone; the machine shudders at impact with a shockwave ring.",
  },
  {
    id: 6,
    name: "Shot 6",
    title: "The Celebration",
    timeRange: [19.0, 23.0],
    videoPrompt:
      "Both the yellow and orange bags drop together into the flap. Hard cut to the stickman standing back up, dusting off, then pulling both bags from the flap. He holds them above his head, then jumps with both arms up while colorful confetti bursts around him. Energetic but brief.",
    animationDesc:
      "19.0-19.6s both bags drop into the flap with a double thud, 19.6-20.4s hard cut to the stickman pulling both bags out, 20.4-21.2s holds them above his head, 21.2-22.2s jumps with both arms up, 22.2-23.0s confetti falls around him.",
    soundDesc: "Double thud at 19.4s, victory fanfare at 19.8s, confetti pop at 21.2s, short crowd cheer from 21.5s.",
    captionText: "BOTH BAGS!!!",
    punchline: "Two stuck bags, one triumphant idiot.",
    characterAction: "Stands up, pulls both bags from the flap, raises them, jumps in celebration.",
    propAction: "Yellow and orange bags drop together into the flap; confetti bursts.",
  },
  {
    id: 7,
    name: "Shot 7",
    title: "The Punchline",
    timeRange: [23.0, 29.0],
    videoPrompt:
      "The stickman sits on the floor and tears open the yellow bag with a happy grin. A giant puff of air bursts out, blowing his eyebrows back and shaking his shirt. He looks inside, tilts the bag over his open palm, and exactly one tiny chip falls out and lands in his hand. Close-up on his palm, then his face, with eyebrows slowly slamming down into fury.",
    animationDesc:
      "23.0-23.8s sits down and tears open the yellow bag, 23.8-25.0s giant air puff blows his face back, 25.0-26.2s looks inside and tilts the bag over his palm, 26.2-27.2s exactly one tiny chip falls into his hand, 27.2-29.0s eyebrows slam down into fury.",
    soundDesc: "Bag rip at 23.5s, big air puff at 24.2s, tiny chip tink at 26.7s, slow angry sting at 27.6s.",
    captionText: "99% AIR 💀",
    punchline: "The bag was mostly a rumor.",
    characterAction: "Sits, tears open the bag, gets blasted by air, finds one chip, rages.",
    propAction: "Yellow bag opens; giant air puff; exactly one tiny chip falls into his palm.",
  },
  {
    id: 8,
    name: "Shot 8",
    title: "The End Frame",
    timeRange: [29.0, 30.0],
    videoPrompt:
      "The stickman stares directly into the camera, furious and defeated, holding the single chip between two fingers. Slowly push in toward his face. Match Shot 1's head size, camera angle and centered framing as closely as possible. Hold for a fraction of a second, then cut back to the opening for a comedic replay.",
    animationDesc:
      "29.0-29.5s slow camera push toward the furious face, 29.5-30.0s hold the defeated stare with the single chip held between two fingers.",
    soundDesc: "Tiny sad trombone at 29.1s, then a short silence.",
    punchline: "One coin, two bags, one chip.",
    characterAction: "Stares into the camera, furious and defeated, holding the single chip.",
    propAction: "Single tiny chip held between two fingers; one yellow and one orange bag.",
  },
];

export const BIGGEST_BALLOON_PROMPT = `THE ANGRY STICKMAN: THE BIGGEST BALLOON — 30-SECOND AI VIDEO PROMPT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080×1920, 24fps.

VISUAL STYLE:
2D flat vector cartoon in clean Modern Pop style, thick black outlines, bright flat colors, smooth 24 fps motion, exaggerated cartoon physics. The main character is an angry-looking black stickman with a round white face, thick expressive eyebrows, a red beanie, and a bright yellow shirt. He is the only character. The setting is a sunny grassy hilltop park with a bright blue sky, simple white flat clouds, soft green hills in the background, and one tall dark-green pine tree with a sharp pointed top on the right side of the frame. Vertical 9:16 framing. The character and key objects stay in the center 60% of the frame. Keep the same character design, outfit, set and colors in every shot.

CONTINUITY LOCK:
There is exactly one stickman, one shiny red balloon with a short white string, and one pine tree. The balloon is the only balloon, and it keeps the same shape and bright red color as it grows. Do not add birds, animals, other trees, buildings, or any other character. Keep proportions and camera orientation consistent. Use hard cuts to hide difficult transitions. No object teleports.

NEGATIVE PROMPT:
Photorealistic, 3D render, extra characters, birds, animals, dialogue, speech bubbles, text, letters, numbers, subtitles, logos, watermarks, changing outfit, changing set colors, blurry, distorted hands, extra limbs.

SHOT 1 (0-2s) THE HOOK:
Extreme close-up of the stickman's determined face. He holds a small, limp red balloon right in front of his mouth, eyebrows slammed down. Smash zoom in, then a hard freeze-frame with a brief graphic flash (no lettering or symbols). Caption added in the edit: "WILL IT POP?" SFX: dramatic whoosh, record-scratch freeze.

SHOT 2 (2-6s) SIZE MEDIUM:
Medium shot on the grassy hilltop. The stickman takes a deep breath and blows into the balloon. His cheeks puff and the balloon grows until it is about the size of his head. He holds it up proudly and gives a thumbs-up. Caption: "SIZE: MEDIUM". SFX: inhale, rubber inflate squeaks, cheerful chime.

SHOT 3 (6-10s) SIZE LARGE, THE FAKE-OUT:
He keeps blowing and the balloon swells until it is as big as his whole body. The rubber stretches, shiny and tight, and makes loud squeaks. He suddenly flinches, shuts his eyes, and covers his face with both arms, bracing for a pop. Nothing happens. He slowly peeks out, then lets out a huge relieved sigh. Caption: "SIZE: LARGE". SFX: rubber stretch squeaks, tense drum roll, silence, relieved sigh. Edit: quick punch-in on the tight shiny balloon surface just before the flinch.

SHOT 4 (10-14s) SIZE GIANT:
The balloon is now taller than he is. His face is red and his cheeks are huge. He pinches the neck of the balloon, ties a quick knot, and steps back to admire it, looking proud and exhausted. The balloon bobs gently above him on its string. Caption: "SIZE: GIANT". SFX: final big inflate, knot snap, proud fanfare note.

SHOT 5 (14-18s) UH OH:
A breeze blows. The giant balloon starts to rise and pulls the stickman by the string. His feet leave the ground. He looks down, then up, then straight at the camera in panic. Hard cut to a wide shot: he is already floating well above the grass, holding the string with both hands, legs dangling. Caption: "UH OH." SFX: wind gust, rising whistle, record scratch.

SHOT 6 (18-22s) THIS IS FINE:
Wide, high shot of the hilltop park far below. The stickman floats peacefully in the sky, holding the string with one hand, and calmly waves at the camera with the other, suddenly relaxed and smug. A gentle breeze slowly drifts him sideways toward the tall pine tree with the sharp pointed top at the edge of the frame. He does not notice. Caption: "THIS IS FINE." SFX: calm music note, soft wind, then a quick dramatic sting as the pine tree enters the frame.

SHOT 7 (22-27s) THE ANTI-POP:
The stickman finally spots the pine tree. His eyes go huge and he paddles his legs in the air trying to steer away. The balloon touches the sharp pine tip. It does not bang: a tiny hole opens and the balloon deflates in one long, wild burst of air. The balloon zooms in loops and zigzags across the sky with the stickman clinging to the string and spinning, cheeks flapping, eyes wide. Keep the balloon red and the stickman clearly visible throughout. Captions: "THE POP…" at 22.2s, then "…WASN'T A POP 💀" as the zigzag begins. SFX: needle-poke "psst", long raspberry-style air release, whirling swoosh, cartoon boing. Edit: quick punch-in on the poke.

SHOT 8 (27-30s) THE END FRAME:
Hard cut to a close-up. The stickman hangs by his yellow shirt from a pine branch. The limp, deflated red balloon is draped across the front of his face like a floppy mask. He slowly pushes it down with one hand to reveal a defeated, furious stare straight into the camera. Slowly push in toward his face. Match Shot 1's head size, camera angle and centered framing as closely as possible. Hold for a fraction of a second, then cut back to the opening. No caption. SFX: tiny sad trombone, final air squeak, then a short silence.

CAPTIONS:
Add in the editor. Extra-bold sans-serif, white fill, thick black outline and drop shadow. Two to four words each, one line where possible. Position about 15-35% down from the top. Avoid the bottom 20% and the right edge. Quick 0.1s scale-bounce pop-in on the sound effect. Keep the "SIZE" captions in the same position and style, and make each one slightly larger than the last so the text grows with the balloon.

AUDIO:
One bouncy comedic loop at about 20-30% volume (royalty-free or YouTube Audio Library). SFX at full presence, cut precisely on the action. Drop the music for a beat during the fake-out in Shot 3, then bring it back at the relief sigh. No spoken dialogue or narration.

EDITING RULES:
Fast cuts through Shots 1-5. A calmer, wider beat in Shot 6 makes the Shot 7 chaos funnier. Punch-ins on the tight balloon (Shot 3), the needle-poke (Shot 7) and his furious face (Shot 8). Keep one simple action per shot; hard cuts to hide tricky transitions.`;

export const BIGGEST_BALLOON_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Hook",
    timeRange: [0.0, 2.0],
    videoPrompt:
      "Extreme close-up of the stickman's determined face. He holds a small, limp red balloon right in front of his mouth, eyebrows slammed down. Smash zoom in, then a hard freeze-frame with a brief graphic flash.",
    animationDesc:
      "0.0-0.9s smash zoom into the furious face behind the limp balloon, 0.9-1.9s hard freeze-frame with a white graphic flash, the limp red balloon wobbling in front of his mouth.",
    soundDesc: "Dramatic whoosh at 0.0s, record-scratch freeze at 0.9s.",
    captionText: "WILL IT POP?",
    punchline: "A balloon, a set of lungs, and a lot of misplaced confidence.",
    characterAction: "Glares at the tiny limp balloon, eyebrows slammed down.",
    propAction: "One small limp red balloon held right in front of his mouth.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "Size: Medium",
    timeRange: [2.0, 6.0],
    videoPrompt:
      "Medium shot on the grassy hilltop. The stickman takes a deep breath and blows into the balloon. His cheeks puff and the balloon grows until it is about the size of his head. He holds it up proudly and gives a thumbs-up.",
    animationDesc:
      "2.0-2.7s deep breath with rising chest, 2.7-4.4s blows into the balloon as it grows to head size, 4.4-5.2s holds it up proudly, 5.2-6.0s gives a confident thumbs-up.",
    soundDesc: "Deep inhale at 2.2s, rubber inflate squeaks 2.8-4.2s, cheerful chime at 4.6s.",
    captionText: "SIZE: MEDIUM",
    punchline: "So far, so under control.",
    characterAction: "Inhales, blows the balloon up to head size, holds it up and thumbs up.",
    propAction: "The red balloon grows from limp to head-size on its short white string.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "Size: Large, The Fake-Out",
    timeRange: [6.0, 10.0],
    videoPrompt:
      "He keeps blowing and the balloon swells until it is as big as his whole body. The rubber stretches, shiny and tight, and makes loud squeaks. He suddenly flinches, shuts his eyes, and covers his face with both arms, bracing for a pop. Nothing happens. He slowly peeks out, then lets out a huge relieved sigh.",
    animationDesc:
      "6.0-8.0s keeps blowing as the balloon swells to body size with stretching squeaks, 8.0-8.6s flinches and covers his face bracing for a pop, 8.6-9.2s nothing happens, 9.2-9.6s peeks out, 9.6-10.0s huge relieved sigh as his shoulders drop.",
    soundDesc: "Rubber stretch squeaks 6.2-7.8s, tense drum roll 7.6-8.0s, silence 8.0-9.2s, relieved sigh at 9.4s.",
    captionText: "SIZE: LARGE",
    punchline: "Everyone braces. Nothing pops.",
    characterAction: "Blows the balloon to body size, flinches, covers his face, peeks, and sighs in relief.",
    propAction: "The balloon swells to body size, shiny and tight, and holds without popping.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "Size: Giant",
    timeRange: [10.0, 14.0],
    videoPrompt:
      "The balloon is now taller than he is. His face is red and his cheeks are huge. He pinches the neck of the balloon, ties a quick knot, and steps back to admire it, looking proud and exhausted. The balloon bobs gently above him on its string.",
    animationDesc:
      "10.0-11.8s final big inflate as the balloon passes his height, 11.8-12.4s pinches the neck and ties a quick knot, 12.4-13.2s steps back to admire it, 13.2-14.0s proud exhausted pose while the giant balloon bobs above him.",
    soundDesc: "Final big inflate 10.2-11.6s, knot snap at 12.2s, proud fanfare note at 12.8s.",
    captionText: "SIZE: GIANT",
    punchline: "He has made something that should not be legal in a park.",
    characterAction: "Inflates the last of it, pinches and knots the neck, steps back and admires it, exhausted.",
    propAction: "The balloon grows taller than the stickman and bobs above him on its string.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "Uh Oh",
    timeRange: [14.0, 18.0],
    videoPrompt:
      "A breeze blows. The giant balloon starts to rise and pulls the stickman by the string. His feet leave the ground. He looks down, then up, then straight at the camera in panic. Hard cut to a wide shot: he is already floating well above the grass, holding the string with both hands, legs dangling.",
    animationDesc:
      "14.0-14.8s a breeze catches the balloon and it pulls the string taut, 14.8-15.6s his feet leave the ground and he looks down, 15.6-16.4s looks up then straight at the camera in panic, 16.4-18.0s hard cut wide: floating above the grass holding the string with both hands, legs dangling.",
    soundDesc: "Wind gust at 14.2s, rising whistle 15.0-16.0s, record scratch at 16.4s.",
    captionText: "UH OH.",
    punchline: "The balloon is now in charge.",
    characterAction: "Gets pulled off the ground, looks down, up and at the camera, then clings to the string.",
    propAction: "The giant balloon lifts him off the grass and rises into the sky.",
  },
  {
    id: 6,
    name: "Shot 6",
    title: "This Is Fine",
    timeRange: [18.0, 22.0],
    videoPrompt:
      "Wide, high shot of the hilltop park far below. The stickman floats peacefully in the sky, holding the string with one hand, and calmly waves at the camera with the other, suddenly relaxed and smug. A gentle breeze slowly drifts him sideways toward the tall pine tree with the sharp pointed top at the edge of the frame. He does not notice.",
    animationDesc:
      "18.0-19.2s floats peacefully with the park far below, 19.2-20.6s waves calmly at the camera, relaxed and smug, 20.6-21.8s a gentle breeze drifts him sideways toward the pine tree, 21.8-22.0s the sharp pine tip enters the frame and he still does not notice.",
    soundDesc: "Calm music note at 18.4s, soft wind 19.0-21.0s, quick dramatic sting at 21.8s.",
    captionText: "THIS IS FINE.",
    punchline: "Famous last words.",
    characterAction: "Floats calmly, waves at the camera with one hand, drifts toward the pine tree unaware.",
    propAction: "The balloon drifts sideways toward the pine tree with the sharp pointed top.",
  },
  {
    id: 7,
    name: "Shot 7",
    title: "The Anti-Pop",
    timeRange: [22.0, 27.0],
    videoPrompt:
      "The stickman finally spots the pine tree. His eyes go huge and he paddles his legs in the air trying to steer away. The balloon touches the sharp pine tip. It does not bang: a tiny hole opens and the balloon deflates in one long, wild burst of air. The balloon zooms in loops and zigzags across the sky with the stickman clinging to the string and spinning, cheeks flapping, eyes wide.",
    animationDesc:
      "22.0-22.6s spots the pine tree and his eyes go huge, 22.6-23.3s paddles his legs trying to steer away, 23.3-23.6s the balloon touches the sharp pine tip and a tiny hole opens, 23.6-26.8s the balloon deflates in one long wild burst, zigzagging in loops across the sky while he clings and spins, 26.8-27.0s the limp balloon flutters out.",
    soundDesc: "Needle-poke psst at 23.3s, long raspberry-style air release 23.5-26.5s, whirling swoosh at 24.4s, cartoon boing at 25.4s.",
    captionText: "THE POP…",
    punchline: "The pop never came. The flight did.",
    characterAction: "Spots the tree, paddles his legs, then clings to the string and spins through the zigzag.",
    propAction: "The balloon gets a tiny hole from the pine tip and deflates in a wild zigzag.",
  },
  {
    id: 8,
    name: "Shot 8",
    title: "The End Frame",
    timeRange: [27.0, 30.0],
    videoPrompt:
      "Hard cut to a close-up. The stickman hangs by his yellow shirt from a pine branch. The limp, deflated red balloon is draped across the front of his face like a floppy mask. He slowly pushes it down with one hand to reveal a defeated, furious stare straight into the camera. Slowly push in toward his face. Match Shot 1's head size, camera angle and centered framing as closely as possible.",
    animationDesc:
      "27.0-28.0s hangs by his shirt from the pine branch with the limp balloon draped over his face, 28.0-29.0s slowly pushes the deflated balloon down with one hand, 29.0-30.0s defeated furious stare into the camera with a slow push in.",
    soundDesc: "Tiny sad trombone at 27.4s, final air squeak at 28.6s, then a short silence.",
    punchline: "One balloon, one pine tree, one ruined afternoon.",
    characterAction: "Hangs from the branch, pushes the limp balloon off his face, glares into the camera.",
    propAction: "Limp deflated red balloon draped over his face, pushed down to his chest.",
  },
];

export const FIND_THE_BALL_PROMPT = `THE ANGRY STICKMAN: FIND THE BALL — 30-SECOND AI VIDEO PROMPT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080×1920, 24fps.

VISUAL STYLE:
2D flat vector cartoon in clean Modern Pop style, thick black outlines, bright flat colors, smooth 24 fps motion, exaggerated cartoon physics. The main character is an angry-looking black stickman with a round white face, thick expressive eyebrows, a red beanie, and a bright yellow shirt. He is the only character. The setting is a small theater stage with deep navy curtains, a warm spotlight cone, a polished wooden floor, and one small wooden table centered in front of him. On the table sit three plastic cups in a row, turned upside down: orange on the left, teal in the middle, purple on the right. Vertical 9:16 framing. The character and key objects stay in the center 60% of the frame. Keep the same character design, outfit, set and colors in every shot.

CONTINUITY LOCK:
There is exactly one stickman, one table, three cups (orange, teal, purple) and one bright pink ball. Cup colors never change. Do not add any other character, animal, or object. Keep object sizes, proportions and camera orientation consistent. Use hard cuts to hide difficult object handoffs. No object teleports.

NEGATIVE PROMPT:
Photorealistic, 3D render, extra characters, dialogue, speech bubbles, text, letters, numbers, subtitles, logos, watermarks, changing outfit, changing set colors, extra cups, extra balls, blurry, distorted hands, extra limbs.

SHOT 1 (0-2s) THE HOOK:
Extreme close-up of the stickman's face with a confident smirk and one raised eyebrow. He holds a bright pink ball up between two fingers right in front of his face. Smash zoom in, then a hard freeze-frame with a brief graphic flash. Caption added in the edit: "FIND THE BALL." SFX: dramatic whoosh, magic sparkle, record-scratch freeze.

SHOT 2 (2-6s) THE SETUP:
Medium shot of the stickman standing behind the table. He lifts the teal middle cup, places the pink ball on the table under it, and sets the cup back down, clearly covering the ball. He points two fingers at his eyes and then at the camera ("watch me"). Keep all three cups clearly visible. Caption: "WATCH CLOSELY…". SFX: cup clunk, magic sparkle, sneaky pizzicato music.

SHOT 3 (6-10s) THE SLOW SHUFFLE:
Locked camera on the table. The stickman slides the cups slowly: he swaps the orange and teal cups, then swaps the orange and purple cups. The movement is slow and easy to follow, one swap at a time. He keeps looking at the camera with a smug grin. Caption: "EASY, RIGHT?". SFX: cups sliding on wood, rhythmic tick-tock music.

SHOT 4 (10-15s) THE FAST SHUFFLE:
Same locked camera. The stickman speeds up and swaps the cups four more times, each swap still readable. His arms blur slightly with speed and his eyebrows go up and down. At about the midpoint of the shot the pink ball slips out from under the middle cup at 11.4s, rolls across the table and drops off the left edge at 12.5s, while the viewer's eyes are on the cups. The stickman does not notice it. His hands finish with a ta-da flourish over the restored cup row. Caption: "NOW FASTER.". SFX: fast cup slides, rising music tempo, tiny ball "tick-tick" rolling sound (very quiet). Edit: the rolling ball must stay visible for about one second but small. Keep it clear of the captions.

SHOT 5 (15-19s) PICK A CUP:
The cups stop sliding. The stickman slaps both hands on the table, leans toward the camera, and points straight at the viewer with a challenging smirk. Hold the pose. Camera slowly pushes in on the three cups. Caption: "PICK A CUP." with a countdown "3… 2… 1…" added in the edit. SFX: cups stop with a thud, drum roll, countdown beeps (3, 2, 1).

SHOT 6 (19-22s) TWO EMPTY CUPS:
The stickman lifts the orange cup on the left: it is empty. His smirk fades slightly. He lifts the purple cup on the right: it is empty as well. His eyebrows rise in confusion. Only the middle teal cup remains covered. Caption: "NOPE.". SFX: cup lifts, wah-wah trombone, record scratch.

SHOT 7 (22-27s) THE REAL ANSWER:
The stickman slowly lifts the middle teal cup: also empty. He freezes, then frantically looks under each cup again, shakes the table, and stares at the camera in panic. He looks down: the pink ball is sitting on the stage floor by his foot, calmly rolling to a stop. His eyes slowly narrow in fury. Keep the ball clearly visible on the floor. Captions: "WHERE'S THE BALL?!" at 22.2s, then "…IT ESCAPED 💀" at 24.6s. SFX: cup lift, record scratch, panicked tapping, tiny ball roll, angry sting.

SHOT 8 (27-30s) THE END FRAME:
Close-up. The stickman has picked the pink ball back up and holds it between two fingers in front of his face, exactly like Shot 1. His smirk is gone: he stares into the camera, defeated and furious. Match Shot 1's head size, camera angle and centered framing as closely as possible. Hold for a fraction of a second, then cut back to the opening. Caption: "DID YOU SEE IT? 👀". SFX: tiny sad trombone, then a short silence.

CAPTIONS:
Add in the editor. Extra-bold sans-serif, white fill, thick black outline and drop shadow. Two to four words each, one line where possible. Position about 15-35% down from the top. Avoid the bottom 20% and the right edge. Quick 0.1s scale-bounce pop-in on the sound effect. For the countdown in Shot 5, big centered "3", "2", "1" pops, one per beep, in the same font and style.

AUDIO:
One playful magic-show loop at about 20-30% volume (royalty-free or YouTube Audio Library). SFX at full presence, cut precisely on the action. Keep the rolling-ball sound very quiet so it feels like a hidden clue. Dip the music for the empty middle-cup reveal in Shot 7, then hit the angry sting when he sees the ball. No spoken dialogue or narration.

EDITING RULES:
Keep the camera locked during the shuffle so viewers can track the cups. Punch-ins on the cups at the countdown (Shot 5), the third empty cup (Shot 7) and his furious face (Shot 8). Keep one simple action per shot; hard cuts to hide tricky handoffs. The ball visibly rolls off the table during the fast shuffle, so a careful viewer can spot where it goes.

PUBLISHING:
Title: Can You Find the Ball? Most People Get This Wrong 🥤👀
Description: Three cups, one pink ball, and a magician who is way too pleased with himself. Follow the ball under the cups — but watch closely, because it slips away right in the middle of the shuffle. Most people miss it the first time. Did you see where it went? 👀
#shorts #findtheball #cupsandball #magictrick #braintest #stickman #cartoon #funny
Pinned comment: Which cup did you pick: 1, 2 or 3? 👇
Thumbnail: Shot 1 freeze-frame — the smug stickman holding the pink ball up beside his face, with the three cups on the table below.`;

export const FIND_THE_BALL_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Hook",
    timeRange: [0.0, 2.0],
    videoPrompt:
      "Extreme close-up of the stickman's face with a confident smirk and one raised eyebrow. He holds a bright pink ball up between two fingers right in front of his face. Smash zoom in, then a hard freeze-frame with a brief graphic flash.",
    animationDesc:
      "0.0-0.9s smash zoom into the smug face as he raises the pink ball between two fingers, 0.9-1.9s hard freeze-frame with a white graphic flash.",
    soundDesc: "Dramatic whoosh at 0.0s, magic sparkle at 0.95s, record-scratch freeze at 0.9s.",
    captionText: "FIND THE BALL.",
    punchline: "Three cups, one ball, and a magician who is very sure of himself.",
    characterAction: "Smirks at the camera and holds the pink ball up between two fingers.",
    propAction: "The bright pink ball is held right in front of his face.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "The Setup",
    timeRange: [2.0, 6.0],
    videoPrompt:
      "Medium shot of the stickman standing behind the table. He lifts the teal middle cup, places the pink ball on the table under it, and sets the cup back down, clearly covering the ball. He points two fingers at his eyes and then at the camera. Keep all three cups clearly visible.",
    animationDesc:
      "2.0-2.5s raises the ball in his right hand, 2.5-3.05s lifts the teal middle cup with his left hand, 3.05-3.45s places the ball under it, 3.45-4.0s sets the cup back down over the ball, 4.0-4.6s points two fingers at his eyes then at the camera, 4.6-6.0s rests his hands and smirks.",
    soundDesc: "Cup lift at 2.5s, magic sparkle 3.05s and 4.15s, cup clunk at 4.0s, sneaky pizzicato score.",
    captionText: "WATCH CLOSELY…",
    punchline: "He even shows you exactly where the ball goes. Trust him.",
    characterAction: "Lifts the middle cup, places the ball under it, covers it, then points at his eyes and the camera.",
    propAction: "The pink ball is placed on the table and covered by the teal middle cup.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "The Slow Shuffle",
    timeRange: [6.0, 10.0],
    videoPrompt:
      "Locked camera on the table. The stickman slides the cups slowly: he swaps the orange and teal cups, then swaps the orange and purple cups. The movement is slow and easy to follow, one swap at a time. He keeps looking at the camera with a smug grin.",
    animationDesc:
      "6.0-6.4s hands reach for the cups, 6.4-7.3s the orange and teal cups swap, 7.3-7.7s pause, 7.7-8.6s the orange and purple cups swap, 8.6-10.0s he taps the table and smirks at the camera.",
    soundDesc: "Two long cup slides at 6.4s and 7.7s, tick-tock score.",
    captionText: "EASY, RIGHT?",
    punchline: "So far he has not touched the ball. Allegedly.",
    characterAction: "Slides two cup swaps slowly while grinning at the camera.",
    propAction: "The orange and teal cups swap, then the orange and purple cups; the ball stays hidden under the teal cup.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "The Fast Shuffle",
    timeRange: [10.0, 15.0],
    videoPrompt:
      "Same locked camera. The stickman speeds up and swaps the cups four more times, each swap still readable. His arms blur slightly with speed and his eyebrows go up and down. At about the midpoint the pink ball slips out from under the middle cup and rolls off the left edge of the table and drops out of sight while the viewer's eyes are on the cups. He does not notice it.",
    animationDesc:
      "10.6-11.15s, 11.3-11.85s, 12.0-12.55s and 12.7-13.25s four fast swaps, 11.36-12.45s the pink ball is revealed as the teal cup slides right off it and it rolls across to the left edge, 12.45-13.05s it drops off the table, 13.05-14.5s it lands and rolls to a stop on the floor, 13.25-14.5s he performs a fast magic flourish over the restored cup row, 14.5-15.0s hands rise.",
    soundDesc: "Fast cup slides 10.6s / 11.3s / 12.0s / 12.7s, very quiet ball roll from 11.4s, flourish sparkle 13.25s, rising score.",
    captionText: "NOW FASTER.",
    punchline: "The ball has already left the show.",
    characterAction: "Shuffles fast with blurring arms and a magic flourish, unaware of the escaping ball.",
    propAction: "The pink ball sneaks out from under the middle cup, rolls off the table and away.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "Pick a Cup",
    timeRange: [15.0, 19.0],
    videoPrompt:
      "The cups stop sliding. The stickman slaps both hands on the table, leans toward the camera, and points straight at the viewer with a challenging smirk. Hold the pose. Camera slowly pushes in on the three cups. Countdown 3… 2… 1… added in the edit.",
    animationDesc:
      "15.0-15.35s both hands slap the table, 15.35-16.0s he leans in and points at the camera, 16.0-18.6s holds the challenge pose while the camera pushes in, countdown digits pop at 16.6s / 17.4s / 18.2s, 18.6-19.0s he raises one eyebrow.",
    soundDesc: "Table slap and cup thud at 15.0s, drum roll from 15.25s, countdown beeps at 16.6s / 17.4s / 18.2s.",
    captionText: "PICK A CUP.",
    punchline: "The audience has been invited to lose.",
    characterAction: "Slaps the table, leans in and points straight at the viewer.",
    propAction: "The three cups sit still on the table while the camera pushes in.",
  },
  {
    id: 6,
    name: "Shot 6",
    title: "Two Empty Cups",
    timeRange: [19.0, 22.0],
    videoPrompt:
      "The stickman lifts the orange cup on the left: it is empty. His smirk fades slightly. He lifts the purple cup on the right: it is empty as well. His eyebrows rise in confusion. Only the middle teal cup remains covered.",
    animationDesc:
      "19.0-19.35s lifts the left cup (empty), 19.35-19.85s holds it up, 19.85-20.15s sets it down, 20.3-20.65s lifts the right cup (empty), 20.65-21.25s holds it up, 20.85s wah-wah trombone, 21.25-21.55s sets it down with a record scratch, 21.55-22.0s stares at the middle cup.",
    soundDesc: "Cup lifts at 19.0s and 20.3s, wah-wah trombone at 20.85s, record scratch at 21.55s.",
    captionText: "NOPE.",
    punchline: "Two cups down, and the confidence is draining fast.",
    characterAction: "Lifts the left cup, then the right cup, both empty, and looks confused.",
    propAction: "The left and right cups are lifted and set back down, empty.",
  },
  {
    id: 7,
    name: "Shot 7",
    title: "The Real Answer",
    timeRange: [22.0, 27.0],
    videoPrompt:
      "The stickman slowly lifts the middle teal cup: also empty. He freezes, then frantically looks under each cup again, shakes the table, and stares at the camera in panic. He looks down: the pink ball is sitting on the stage floor by his foot, calmly rolling to a stop. His eyes slowly narrow in fury.",
    animationDesc:
      "22.0-22.48s slowly lifts the middle cup (empty), 22.48-22.95s holds it up, 22.95-23.25s sets it down, 23.25-24.55s frantically flips all three cups again and shakes the table, 24.55-24.95s stares at the camera in panic, 24.95-25.6s looks down as the ball rolls to a stop by his foot, 25.6-26.3s his eyes narrow in fury, 26.3-27.0s holds the angry stare.",
    soundDesc: "Cup lift at 22.0s, record scratch at 22.5s, panicked tapping 23.25-24.55s, tiny ball roll 24.95s, angry sting at 25.8s.",
    captionText: "WHERE'S THE BALL?!",
    punchline: "It was on the floor the whole time. Did you see it?",
    characterAction: "Lifts the last cup, panics, flips every cup, then spots the ball on the floor and rages.",
    propAction: "All three cups are empty; the pink ball rests on the floor by his foot.",
  },
  {
    id: 8,
    name: "Shot 8",
    title: "The End Frame",
    timeRange: [27.0, 30.0],
    videoPrompt:
      "Close-up. The stickman has picked the pink ball back up and holds it between two fingers in front of his face, exactly like Shot 1. His smirk is gone: he stares into the camera, defeated and furious. Match Shot 1's head size, camera angle and centered framing as closely as possible.",
    animationDesc:
      "27.0-27.55s he raises the ball back up between two fingers, 27.55-30.0s defeated furious stare into the camera with a slow push in.",
    soundDesc: "Tiny sad trombone at 27.4s, then a short silence.",
    captionText: "DID YOU SEE IT? 👀",
    punchline: "The trick worked perfectly. Just not for him.",
    characterAction: "Holds the ball up between two fingers and glares into the camera, defeated.",
    propAction: "The pink ball is held up in front of his face exactly like the opening.",
  },
];

export const ATTEMPT_247_PROMPT = `THE ANGRY STICKMAN: ATTEMPT #247 — 30-SECOND AI VIDEO PROMPT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080×1920, 24fps.

VISUAL STYLE:
2D flat vector cartoon in clean Modern Pop style, thick black outlines, bright flat colors, smooth 24 fps motion, exaggerated cartoon physics. The main character is an angry-looking black stickman with a round white face, thick expressive eyebrows, a red beanie, and a bright yellow shirt. He is the only character. The setting is a bright, simple office room with lavender walls, a warm wooden floor, one window on the left wall, and a ceiling with a small round white ceiling fan that is not spinning. The floor is covered ankle-deep in crumpled white paper balls. On the far right side of the room stands one tall green trash bin. A small gray trash bin sits on the floor right next to the stickman's heels, mostly hidden behind his legs and the paper balls. Vertical 9:16 framing. The character and key objects stay in the center 60% of the frame. Keep the same character design, outfit, set and colors in every shot.

CONTINUITY LOCK:
There are exactly two bins: one tall green bin across the room, and one small gray bin beside the stickman's heels. There is exactly one active paper ball in play at a time, plus the covering of crumpled paper on the floor. Do not add any other character, furniture or object. Keep object sizes, proportions, room geometry and camera orientation consistent. Use hard cuts to hide difficult object handoffs. No object teleports.

NEGATIVE PROMPT:
Photorealistic, 3D render, extra characters, dialogue, speech bubbles, text, letters, numbers, scoreboard, subtitles, logos, watermarks, changing outfit, changing room colors, extra bins, blurry, distorted hands, extra limbs.

SHOT 1 (0-2s) THE HOOK:
Extreme close-up of the stickman's exhausted, determined face, one eyebrow twitching. He holds a crumpled white paper ball in front of his eyes. A few crumpled balls are visible blurred behind him. Smash zoom in, then a hard freeze-frame with a brief graphic flash (no lettering or symbols). Caption added in the edit: "ATTEMPT #247." SFX: dramatic whoosh, record-scratch freeze, sports-arena sting.

SHOT 2 (2-6s) THE EASY SHOT:
Wide shot of the whole room, with the stickman on the left and the green bin on the far right. He rolls his shoulders, takes aim, and tosses the paper ball in a gentle arc. It hits the rim of the green bin, spins out, and drops onto the floor with the other paper balls. He slumps and glares at the bin. Caption: "JUST AIM. EASY." SFX: arm whoosh, rim clank, soft thud, tiny sad wah.

SHOT 3 (6-10s) THE DOORWAY SHOT:
The stickman walks several steps back to the left, crouches, and throws a high arc. The paper ball hits the still ceiling fan, bounces straight down, and lands on top of his own beanie like a tiny hat. He freezes with the paper ball on his head. Caption: "NOW FROM FAR AWAY." SFX: throw whoosh, soft fan tink, boing, record scratch.

SHOT 4 (10-14s) THE NO-LOOK SHOT:
He turns his back to the green bin, closes his eyes, and tosses the paper ball backward over his shoulder with a cool, overconfident smirk. The paper ball flies across the room, hits the window glass, and bounces harmlessly away to the floor. He keeps his eyes closed and his smirk on for one extra beat, then peeks to see that nothing went in. Caption: "NO-LOOK SHOT." SFX: cool laid-back music note, whoosh, window knock, record scratch.

SHOT 5 (14-18s) THE PLAN:
A lightbulb pops up over the stickman's head. He picks up a fresh paper ball, measures an imaginary angle with his thumbs and fingers, and looks from the ceiling to the right wall and then to the bin, narrowing his eyes. He rubs his hands together with a confident grin and takes aim. Keep all of the walls, ceiling and green bin visible in one wide shot. Caption: "THE IMPOSSIBLE BANK SHOT." SFX: lightbulb ding, thinking pizzicato, rising musical build.

SHOT 6 (18-22s) THE IMPOSSIBLE SHOT:
Slow motion. The stickman throws the paper ball upward. It bounces off the right wall, then off the ceiling, then heads down toward the green bin. It lands on the rim, circles around the rim three times, and then wobbles right at the edge. Camera follows the paper ball closely. End the clip as the paper ball hovers at the edge, before it falls. Caption: "IT'S IN?!" with a big centred 3 / 2 / 1 pop-in, one per rim spin. FX: rim tick marks, slow-motion speed streaks. SFX: launch whoosh, two bounce bops, ticking rim spin, drum roll, held breath.

SHOT 7 (22-27s) THE WIN, THEN THE TWIST:
The paper ball falls into the green bin. The stickman freezes for one second, then jumps with both arms up as confetti bursts around him. Hard cut: the camera pulls back to a wide shot and he slowly lowers his arms and looks down. Right next to his feet, the small gray bin is clearly visible now, in plain view with nothing blocking it. He stares at it, then slowly looks at the camera as his eyebrows slam downward in fury. Captions: "IT'S IN!!!" at 22.1s, then "…WAIT." at 24.3s, then "BIN #2 💀" at 25.65s. SFX: bin thunk, victory fanfare, confetti pop, record scratch on the cut, dramatic sting.

SHOT 8 (27-30s) THE END FRAME:
Close-up. The stickman holds a fresh crumpled paper ball in front of his face, exactly like Shot 1, with a defeated, furious stare straight into the camera. Match Shot 1's head size, camera angle and centered framing as closely as possible. Hold for a fraction of a second, then cut back to the opening. Caption: "DID YOU SPOT IT? 👀". SFX: tiny sad trombone, then a short silence.

CAPTIONS:
Add in the editor. Extra-bold sans-serif, white fill, thick black outline and drop shadow. Two to four words each, one line where possible. Position about 15-35% down from the top. Avoid the bottom 20% and the right edge. Quick 0.1s scale-bounce pop-in on the beat of the sound effect. For the rim-spin countdown in Shot 6, big centred "3", "2", "1" pops, one per rim spin, in the same font and style.

AUDIO:
Upbeat sports-highlight loop at about 20-30% volume. SFX at full presence, cut precisely on the action. Dip the music during the rim spin in Shot 6, then hit the fanfare on the drop and the sting on the reveal. No spoken dialogue, logos or watermarks.

PUBLISHING:
Title: Attempt #247: The Impossible Trash Can Trickshot 🗑️🏀
Description: 247 attempts, one impossible bank shot, and a twist you won't see coming. Did you spot the clue? #shorts #animation #stickman #funny #trickshot
Pinned comment: Did you spot the second bin before the reveal? 👇
Thumbnail: Shot 1 freeze-frame — the exhausted stickman holding the paper ball in front of his eyes.`;

export const ATTEMPT_247_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Hook",
    timeRange: [0.0, 2.0],
    videoPrompt:
      "Extreme close-up of the stickman's exhausted, determined face, one eyebrow twitching. He holds a crumpled white paper ball in front of his eyes. A few crumpled balls are blurred behind him. Smash zoom in, then a hard freeze-frame with a brief graphic flash.",
    animationDesc:
      "0.0-0.9s smash zoom into the exhausted face as he raises the paper ball in front of his eyes, 0.9-1.9s hard freeze-frame with a white graphic flash.",
    soundDesc: "Dramatic whoosh at 0.05s, record-scratch freeze at 0.9s, sports sting.",
    captionText: "ATTEMPT #247.",
    punchline: "Two hundred and forty-six failures. This one is going in. Probably.",
    characterAction: "Holds the paper ball in front of his exhausted face and glares.",
    propAction: "The active paper ball is held up at eye level.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "The Easy Shot",
    timeRange: [2.0, 6.0],
    videoPrompt:
      "Wide shot of the whole room, with the stickman on the left and the green bin on the far right. He rolls his shoulders, takes aim, and tosses the paper ball in a gentle arc. It hits the rim of the green bin, spins out, and drops onto the floor with the other paper balls. He slumps and glares at the bin.",
    animationDesc:
      "2.0-2.9s rolls his shoulders and takes aim, 3.05s releases, 3.66s rim clank, 3.95-4.32s the ball falls to the floor, 4.32-4.78s two small bounces, 4.45-6.0s he slumps and glares.",
    soundDesc: "Arm whoosh at 3.05s, rim clank 3.66s, soft floor thud 4.35s, tiny sad wah.",
    captionText: "JUST AIM. EASY.",
    punchline: "The first shot is always the easiest. Allegedly.",
    characterAction: "Rolls his shoulders, tosses gently, then slumps and glares at the bin.",
    propAction: "The paper ball clips the green bin rim and drops to the floor.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "The Doorway Shot",
    timeRange: [6.0, 10.0],
    videoPrompt:
      "The stickman walks several steps back to the left, crouches, and throws a high arc. The paper ball hits the still ceiling fan, bounces straight down, and lands on top of his own beanie like a tiny hat. He freezes with the paper ball on his head.",
    animationDesc:
      "6.0-7.15s walks back to the left, 7.15-7.5s crouches, 7.8s throws a moon shot, 8.42s the ball tinks off the ceiling fan, 8.95s it lands on his beanie, 9.0-10.0s he freezes and blinks.",
    soundDesc: "Throw whoosh 7.8s, fan tink 8.42s, paper plop 8.95s, cartoon boing, record scratch.",
    captionText: "NOW FROM FAR AWAY.",
    punchline: "The fan is not spinning. It does not need to be.",
    characterAction: "Walks back, crouches, launches a moon shot, then freezes with the ball on his beanie.",
    propAction: "The ball hits the still ceiling fan and drops straight onto his beanie.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "The No-Look Shot",
    timeRange: [10.0, 14.0],
    videoPrompt:
      "He turns his back to the green bin, closes his eyes, and tosses the paper ball backward over his shoulder with a cool, overconfident smirk. The paper ball flies across the room, hits the window glass, and bounces harmlessly away to the floor. He keeps his eyes closed and his smirk on for one extra beat, then peeks to see that nothing went in.",
    animationDesc:
      "10.0-10.45s lifts the ball off his beanie, 10.45-11.0s turns his head away with his eyes shut and smirks, 11.0s flicks the ball backward, 11.32s window knock, 12.05s the ball lands, 12.4-13.15s holds the pose then peeks, 13.15-14.0s slumps.",
    soundDesc: "Laid-back score note, whoosh 11.0s, window knock 11.32s, floor thud 12.05s, record scratch 13.15s.",
    captionText: "NO-LOOK SHOT.",
    punchline: "He did not look. He also did not score.",
    characterAction: "Turns away with his eyes shut, flicks the ball backward, holds the smirk, then peeks.",
    propAction: "The ball smacks the window glass and falls to the floor.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "The Plan",
    timeRange: [14.0, 18.0],
    videoPrompt:
      "A lightbulb pops up over the stickman's head. He picks up a fresh paper ball, measures an imaginary angle with his thumbs and fingers, and looks from the ceiling to the right wall and then to the bin, narrowing his eyes. He rubs his hands together with a confident grin and takes aim. Keep all of the walls, ceiling and green bin visible in one wide shot.",
    animationDesc:
      "14.0s lightbulb pops, 14.15-14.8s walks back to his mark, 14.8-15.25s squats and grabs a fresh ball off the heap, 15.55-16.25s frames up the angle, 16.25-16.75s looks ceiling-wall-bin, 16.75-17.2s rubs his hands, 17.2-18.0s takes aim.",
    soundDesc: "Lightbulb ding 14.0s, paper crumple 15.2s, knuckle crack 17.0s, rising build.",
    captionText: "THE IMPOSSIBLE BANK SHOT.",
    punchline: "Wall, ceiling, bin. What could possibly go wrong?",
    characterAction: "Gets an idea, picks up a fresh ball, measures the bank angle, rubs his hands and aims.",
    propAction: "A fresh paper ball is pulled off the heap and a dashed bank line appears.",
  },
  {
    id: 6,
    name: "Shot 6",
    title: "The Impossible Bank Shot",
    timeRange: [18.0, 22.0],
    videoPrompt:
      "Slow motion. The stickman throws the paper ball upward. It bounces off the right wall, then off the ceiling, then heads down toward the green bin. It lands on the rim, circles around the rim three times, and then wobbles right at the edge. Camera follows the paper ball closely. End the clip as the paper ball hovers at the edge, before it falls.",
    animationDesc:
      "18.35s launch, 19.0s right-wall bounce, 19.5s ceiling bounce, 20.15s lands on the rim, 20.15-21.75s three slow rim circles with big 3 / 2 / 1 digits, 21.75-22.0s wobbles at the front edge.",
    soundDesc: "Launch whoosh 18.35s, wall bounce 19.0s, ceiling bounce 19.5s, rim clink 20.15s, drum roll and countdown beeps 20.3s / 20.77s / 21.24s.",
    captionText: "IT'S IN?!",
    punchline: "Three bounces, three rim spins and one held breath.",
    characterAction: "Throws, then leans in with his hands clasped and his breath held.",
    propAction: "The ball banks off the wall and ceiling, then circles the rim three times.",
  },
  {
    id: 7,
    name: "Shot 7",
    title: "The Win, Then The Twist",
    timeRange: [22.0, 27.0],
    videoPrompt:
      "The paper ball falls into the green bin. The stickman freezes for one second, then jumps with both arms up as confetti bursts around him. Hard cut: the camera pulls back to a wide shot and he slowly lowers his arms and looks down. Right next to his feet, the small gray bin is clearly visible now, in plain view with nothing blocking it. He stares at it, then slowly looks at the camera as his eyebrows slam downward in fury.",
    animationDesc:
      "22.0s the ball drops in, 22.0-23.1s he freezes, 23.1-24.15s jumps with both arms up and confetti, 24.15s hard cut to the wide, 24.16-24.9s lowers his arms, 24.9-25.6s looks down at the gray bin, 25.6-26.3s stares, 26.3-27.0s looks at the camera and rages.",
    soundDesc: "Bin thunk 22.05s, victory fanfare and confetti 23.15s, record scratch on the cut 24.15s, angry sting 25.8s.",
    captionText: "IT'S IN!!! / …WAIT. / BIN #2 💀",
    punchline: "It went in. It went into the wrong bin.",
    characterAction: "Freezes, celebrates, then slowly looks down at the gray bin and rages at the camera.",
    propAction: "The ball drops into the green bin; the small gray bin is revealed at his feet.",
  },
  {
    id: 8,
    name: "Shot 8",
    title: "The End Frame",
    timeRange: [27.0, 30.0],
    videoPrompt:
      "Close-up. The stickman holds a fresh crumpled paper ball in front of his face, exactly like Shot 1, with a defeated, furious stare straight into the camera. Match Shot 1's head size, camera angle and centered framing as closely as possible.",
    animationDesc:
      "27.0-27.4s raises a fresh ball in front of his face, 27.4-30.0s defeated furious stare with a slow push in.",
    soundDesc: "Tiny sad trombone at 27.45s, then a short silence.",
    captionText: "DID YOU SPOT IT? 👀",
    punchline: "Two bins, 247 attempts, zero lessons learned.",
    characterAction: "Holds a fresh ball in front of his face and glares into the camera, defeated.",
    propAction: "The fresh paper ball is held up exactly like the opening shot.",
  },
];

export const NEEDLE_THREAD_PROMPT = `THE ANGRY STICKMAN: THE IMPOSSIBLE NEEDLE THREAD — 30-SECOND AI VIDEO PROMPT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080×1920, 24fps.

VISUAL STYLE:
Modern Pop 2D flat vector cartoon. Thick consistent black outlines, simple geometric shapes, smooth readable movements, exaggerated facial expressions, bright solid colors. Pure white background with minimal shadows, no decorations, no gradients, no textures. Centered mobile compositions; important action inside the central 60-70% of the frame.

CHARACTER:
The angry black stickman with a round white face, thick black eyebrows, expressive eyes, a red beanie and a bright yellow shirt. Black line limbs. The head, proportions, beanie and shirt stay identical everywhere. He is extremely competitive, impatient, determined, and comically overconfident — he treats a simple sewing task like an impossible world championship.

PROPS:
One tiny silver sewing needle with a small visible eye, one piece of thick red thread (same red and same thickness everywhere; it may bend, curl, tangle and pass through the eye but never disappears or changes color), one oversized magnifying glass, two hardcover books, one ruler, one simple lever mechanism, and his red beanie as the final punchline.

CONTINUITY:
Same stickman, needle and thread through the entire story. The needle stays small with a visible eye whenever threading is in focus. The magnifying glass and the homemade machine appear only when needed. Hard cuts between difficult actions. The final gag is caused exactly by the thread catching the beanie — no second needle, no second thread, no redesign. The thread must visibly pass through the actual eye in the success scene — not merely touch the needle. No photorealism, 3D, extra characters, duplicated props, logos, watermarks, random transitions or complex backgrounds.

STORY IN SIX CAPTIONED SHOTS (captions are burned in near the top; white extra-bold with a thick black outline and pop-in):

SHOT 1 (0-3s) "CAN HE THREAD IT?!":
Extreme close-up of the furious face, fast pullback to reveal the tiny needle and red thread, one confident thrust that bends and misses, a slow disbelief squint at the needle, punch-in on the angry face and a fist clench.

SHOT 2 (3-7s) "TOO SMALL!":
A careful lined-up attempt that bends away at the last moment, then a much faster attempt that curls into a tiny loop and slides around the side of the needle. Furious shaking arms and an angry point at the tiny needle. Every failure looks different.

SHOT 3 (7-12s) "MAKE IT EASIER.":
A lightbulb pops above his head. He raises an oversized magnifying glass between his face and the needle so the eye reads much larger through the lens. A confident slow guided attempt slides past and catches on the outside; a second attempt bends away. He drops his eyes into a furious side-eye at the camera.

SHOT 4 (12-18s) "PLAN B.":
A snap montage builds a ridiculous threading machine from two hardcover books, a ruler, a lever and the needle held upright in a stand, with the thread attached to the lever. He pulls the lever dramatically; the thread shoots forward, misses the eye and whips around his red beanie. The mechanism wobbles to a stop; his smile dies and his eyes drift upward to the tangled beanie. He ends fully tangled, holding the useless needle.

SHOT 5 (18-24s) "ONE LAST TRY…":
He untangles, sets everything aside, takes a deep breath and becomes perfectly still and focused. The camera pushes in as the thread tip slowly approaches the eye, fake-bends once, then passes cleanly through the real eye. He pulls a visible length through, throws both arms up and holds the threaded needle overhead. The success must be unmistakable.

SHOT 6 (24-30s) "WAIT… 💀":
Proud victory pose. A tug on the beanie: the thread is caught in its fabric, tying the beanie to the threaded needle. The beanie stretches upward, lifts completely off, and dangles from the thread while he holds the needle. Blank stare for half a second, then a slow look at the camera, brows snap down, fists clench, a full-body cartoon rage shake, extreme close-up final hold.

AUDIO:
Playful comedic score only, lower than the SFX. Tension builds through Shot 5, a satisfying sparkle and victory fanfare on the success, the fanfare cut off the instant the beanie lifts, a short silence, then a sharp comedic sting. No dialogue, no narration, no voice-over.`;

export const NEEDLE_THREAD_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Impossible Challenge",
    timeRange: [0.0, 3.0],
    videoPrompt:
      "Extreme close-up of the furious, determined face, then a fast pullback revealing the tiny silver needle in one hand and the thick red thread in the other against the white background. He confidently pushes the thread toward the tiny eye; it bends and misses. He freezes, squints at the needle with total disbelief, then an angry punch-in as he clenches his fist.",
    animationDesc:
      "0.0-0.5s extreme close-up of the face, 0.5-1.5s fast pullback to reveal needle and thread, 1.5-2.3s the thread thrust bends away and misses the eye, 2.3-3.0s disbelief squint and angry punch-in with a fist clench.",
    soundDesc: "Fast whoosh 0.05s, tiny metallic ding 0.55s, thread flick 1.75s, short comedic sting 2.45s.",
    captionText: "CAN HE THREAD IT?!",
    punchline: "Three seconds to establish the world's smallest enemy.",
    characterAction: "Holds the needle up confidently, thrusts, misses, squints in disbelief, clenches his fist.",
    propAction: "The tiny needle and thick red thread are held large enough to read on a phone.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "The First Failures",
    timeRange: [3.0, 7.0],
    videoPrompt:
      "Medium shot. He carefully holds the needle upright in front of his face and lines the straightened red thread up with the eye. It bends away at the last moment. A much faster second attempt curls into a tiny loop and slides around the side of the needle. His eyebrows lower, his eyes widen, his arms shake, and he points angrily at the tiny needle.",
    animationDesc:
      "3.0-4.0s careful first attempt, 4.0-5.0s the thread bends away and misses, 5.0-6.0s fast second attempt forms a tiny loop around the shaft, 6.0-7.0s furious shaking and an angry point at the needle.",
    soundDesc: "Rubbery boings 3.9s and 5.7s, thread squeak 5.05s, frustrated stomp 6.55s.",
    captionText: "TOO SMALL!",
    punchline: "The first mission failure of the thread championship.",
    characterAction: "Lines up carefully, misses, speeds up, misses worse, rages and points at the needle.",
    propAction: "The thread loops around the needle shaft instead of through the eye.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "The Magnifying Glass",
    timeRange: [7.0, 12.0],
    videoPrompt:
      "A lightbulb pops above his head. He grabs the oversized magnifying glass and holds it between his face and the needle so the eye reads much larger through the lens. Grinning, he slowly guides the thread toward the enlarged eye; it slides past and catches on the outside of the needle. A second guided attempt bends away too. He lowers the glass and gives the camera a furious side-eye.",
    animationDesc:
      "7.0-8.0s lightbulb moment, 8.0-9.0s he raises the magnifying glass, 9.0-10.2s first magnified attempt catches outside the eye, 10.2-11.0s second failure bends away, 11.0-12.0s slow furious side-eye at the camera.",
    soundDesc: "Lightbulb ding 7.35s, magical sparkle 7.42s, soft raise whoosh 8.3s, catch squeak 9.65s, miss squeak 10.85s, descending slide whistle 11.15s.",
    captionText: "MAKE IT EASIER.",
    punchline: "Science said yes. The thread said no.",
    characterAction: "Lightbulb idea, raises the glass, guides carefully, fails twice, drops into a furious side-eye.",
    propAction: "The oversized magnifying glass enlarges only the needle eye inside the lens; the needle stays untouched outside it.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "The Ridiculous Machine",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "A quick montage snaps two hardcover books, a ruler, a lever and the needle held upright in a stand into one ridiculous threading machine, the red thread attached to the lever. He presents it with a proud grin, pulls the lever dramatically, and the thread shoots forward, misses the eye and whips around his red beanie. The mechanism wobbles to a stop. His smile dies, his eyes drift upward, and he ends fully tangled holding the useless needle.",
    animationDesc:
      "12.0-14.0s fast snap montage of books, ruler, lever and needle stand, 14.0-15.4s proud presentation, 15.4-16.0s lever pull, 16.0-17.0s thread launches, misses and wraps the beanie, 17.0-18.0s wobble, upward glance and rage.",
    soundDesc: "Mechanical clicks 12.3-13.9s, proud ding 14.5s, lever clunk 15.95s, spring launch 16.35s, thread whip 16.6s, fabric squeak 17.05s, record scratch 17.35s.",
    captionText: "PLAN B.",
    punchline: "Engineering: also defeated by a one-millimeter hole.",
    characterAction: "Builds in a blur, presents proudly, pulls the lever, gets tangled in his own machine.",
    propAction: "Books, ruler, lever and needle stand snap together; the launched thread wraps around the beanie.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "One Last Try",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "He untangles, sets everything aside and takes a deep breath. Perfectly still, needle in one hand and the straightened thread in the other, his fury becomes total concentration. The camera pushes in as the thread tip drifts toward the eye, fakes a bend, then passes cleanly through the actual eye. He gently pulls a visible length through, then throws both arms up, holding the threaded needle overhead.",
    animationDesc:
      "18.0-19.0s untangle, reset and deep breath, 19.0-20.5s close-up of intense concentration, 20.5-22.6s slow approach with one fake-out bend, 22.6s the thread passes through the real eye, 22.6-23.4s he pulls a visible length through, 23.4-24.0s victory arms up with the threaded needle overhead.",
    soundDesc: "Deep breath 18.85s, quiet heartbeats 19.2-22.1s, fake-out squeak 21.9s, delicate threading 22.58s, satisfying sparkle 22.95s, victory fanfare 23.55s.",
    captionText: "ONE LAST TRY…",
    punchline: "Stillness. Focus. One millimeter of history.",
    characterAction: "Steadies completely, approaches slowly, threads the eye for real, erupts in victory.",
    propAction: "The red thread visibly passes through the needle eye and a trailing length is pulled through.",
  },
  {
    id: 6,
    name: "Shot 6",
    title: "The Final Twist",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "He proudly holds up the threaded needle. A tug: the red thread is caught through the fabric of his beanie, connecting it to the needle. The beanie stretches upward and lifts completely off while still attached to the thread. His bare head goes blank for half a second, then he looks at the needle, at the beanie, then at the camera. His brows snap down, fists clench, whole body shaking in cartoon rage. Extreme close-up final hold.",
    animationDesc:
      "24.0-25.0s proud victory pose, 25.0-26.0s the tug and the upward glance, 26.0-27.3s the beanie stretches and lifts off, 27.3-27.9s blank stare at the camera, 27.9-28.8s needle-then-beanie-then-camera look and rage shake, 28.8-30.0s extreme close-up furious final hold.",
    soundDesc: "Record scratch cuts the fanfare 24.15s, tiny fabric tug 25.2s, stretch squeak 26.55s, pop-off 27.28s, short silence, angry sting 28.85s.",
    captionText: "WAIT… 💀",
    punchline: "Fully threaded. Fully bald. Total defeat.",
    characterAction: "Celebrates, feels the tug, watches the beanie leave, goes blank, then erupts at the camera.",
    propAction: "The thread stays attached to needle and beanie; the bare head and dangling beanie land the gag.",
  },
];

export const MAGNET_TRICK_PROMPT = `THE IMPOSSIBLE MAGNET TRICK — 30-SECOND AI VIDEO PROMPT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080×1920, 24fps.

VISUAL STYLE:
Modern Pop 2D flat vector cartoon. Thick consistent black outlines, simple geometric shapes, smooth readable movements, exaggerated facial expressions, bright solid colors. Pure white background with minimal shadows, no decorations, no gradients, no textures. Centered mobile compositions; important action inside the central 60-70% of the frame.

CHARACTER:
The angry black stickman with a round white face, thick black eyebrows, expressive eyes, a red beanie and a bright yellow shirt. Black line limbs. The head, proportions, beanie and shirt stay identical everywhere. He is extremely confident, impatient, and comically overconfident — he treats a simple magnet task like an impossible world championship.

PROPS:
One red-and-blue horseshoe magnet, one tiny steel screw, one cup, metal spoons, metal forks, one metal chair, and one saucepan. Keep the screw and cup visible and consistent between scenes. Every magnet-attracted object is steel/metal colored.

CONTINUITY:
Same stickman, screw and cup through the entire story. The screw is tiny and stays beside the cup until the final success. The big magnet draws every metal object EXCEPT the screw. The screw only moves when the tiny magnet is used. Hard cuts between escalating failures. No photorealism, 3D, extra characters, duplicated props, logos, watermarks, random transitions or complex backgrounds.

STORY IN SIX CAPTIONED SHOTS (captions are burned in near the top; white extra-bold with a thick black outline and pop-in):

SHOT 1 (0-4s) "ONE SCREW. THAT'S IT.":
The stickman stands at a table. A tiny steel screw sits beside an empty cup. He confidently holds a horseshoe magnet near the screw, expecting it to move. Nothing happens. He shakes the magnet, squints at the screw, and gives the camera an annoyed stare.

SHOT 2 (4-9s) "WHY THE SPOONS?!":
He waves the magnet more aggressively. Several nearby metal spoons and forks suddenly slide and fly toward it, clanging together into a ridiculous cluster. The tiny screw remains completely still. He looks at the cluster, then back at the screw, visibly furious.

SHOT 3 (9-14s) "STOP ATTRACTING EVERYTHING!":
He tries again. A metal chair begins scraping toward him across the floor. He runs sideways while still holding the magnet, and the chair slowly follows. He stops, looks behind himself, and panics.

SHOT 4 (14-20s) "I REGRET EVERYTHING.":
A comedic swarm of metal utensils flies toward the magnet. Spoons, forks, and a saucepan pile up around him. He ends up buried beneath the harmless metal clutter, with only his angry face visible. The screw remains beside the cup, untouched.

SHOT 5 (20-26s) "SMALL MAGNET. SMALL TARGET.":
He crawls out of the pile, looks at the screw, and has an idea. He puts the large magnet aside and picks up a tiny magnet. He carefully moves it toward the steel screw. The screw lifts, travels across the tabletop, and drops neatly into the cup. His angry face transforms into pure joy. Hold on the successful result.

SHOT 6 (26-30s) "MISSION COMPLETE… BONK 💀":
He celebrates by raising the tiny magnet above his head. A final metal spoon flies into frame and sticks to a small metal clip on his red beanie. The spoon pulls the beanie down over his eyes. He stands completely still for one beat, then shakes with cartoon fury. End on his furious expression.

AUDIO:
Comedic instrumental music, magnet hum, tiny screw taps, utensils clanging, chair scraping, running footsteps, saucepan clatter, dramatic idea chime, screw dropping into cup, triumphant fanfare, final spoon ping, and a comedic sting. No dialogue, no narration, no voice-over.`;

export const MAGNET_TRICK_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The One Screw",
    timeRange: [0.0, 4.0],
    videoPrompt:
      "Medium shot at a white table. A tiny steel screw sits beside an empty metal cup. The angry stickman holds a red-and-blue horseshoe magnet near the screw, expecting it to move. Nothing happens. He shakes the magnet, squints at the screw, and gives the camera an annoyed stare.",
    animationDesc:
      "0.0-1.0s stand at the table with magnet and screw, 1.0-2.2s holds the magnet confidently near the screw, 2.2-3.0s shakes the magnet and squints in disbelief, 3.0-4.0s annoyed punch-in stare at the camera.",
    soundDesc: "Magnet hum 0.5s, tiny metallic tick 1.6s, rubbery squeak 2.7s, annoyed sting 3.5s.",
    captionText: "ONE SCREW. THAT'S IT.",
    punchline: "The world's smallest metal object ignores him.",
    characterAction: "Holds the magnet up confidently, shakes it, squints, glares at the camera.",
    propAction: "The screw stays dead still beside the cup.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "Why the Spoons",
    timeRange: [4.0, 9.0],
    videoPrompt:
      "Medium shot at the table. He waves the horseshoe magnet more aggressively. Several metal spoons and forks slide and fly toward it from off-screen, clanging together into a ridiculous cluster stuck to the magnet. The tiny screw remains completely still beside the cup. He looks at the cluster, then back at the screw, visibly furious.",
    animationDesc:
      "4.0-5.2s waves the magnet aggressively, 5.2-6.5s spoons and forks fly and clang onto the magnet, 6.5-8.0s he stares at the cluster, then at the screw, 8.0-9.0s furious look between cluster and screw.",
    soundDesc: "Magnet whoosh 4.6s, clangs 5.4-6.2s, metal cluster rattle 6.8s, furious grunt 8.4s.",
    captionText: "WHY THE SPOONS?!",
    punchline: "Everything metal answers — except the target.",
    characterAction: "Waves the magnet, gapes at the utensil cluster, rages at the screw.",
    propAction: "Spoons and forks stack on the big magnet; the screw never moves.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "The Chair Chase",
    timeRange: [9.0, 14.0],
    videoPrompt:
      "Medium shot at the table. He holds the magnet up again and a metal chair begins scraping across the floor toward him. He runs sideways while still holding the magnet, and the chair slowly follows. He stops, looks behind himself, and panics as the chair keeps coming.",
    animationDesc:
      "9.0-10.0s holds the magnet, chair starts scraping toward him, 10.0-11.5s he runs sideways with the magnet, chair trailing, 11.5-12.5s he stops and looks back, 12.5-14.0s panic as the chair keeps sliding.",
    soundDesc: "Magnet hum 9.5s, chair scrape 10.2-11.8s, running footsteps 10.4-11.4s, panic sting 13.4s.",
    captionText: "STOP ATTRACTING EVERYTHING!",
    punchline: "The magnet has a bigger crush on the chair than on him.",
    characterAction: "Runs sideways with the magnet, stops, looks behind, panics.",
    propAction: "The metal chair slides across the floor behind the magnet.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "The Metal Swarm",
    timeRange: [14.0, 20.0],
    videoPrompt:
      "A comedic swarm of metal utensils flies toward the magnet. Spoons, forks, and a saucepan pile up around him. He ends up buried beneath the harmless metal clutter, with only his angry face visible above the pile. The screw remains beside the cup, untouched.",
    animationDesc:
      "14.0-15.5s spoons and forks fly toward the magnet, 15.5-17.0s a saucepan joins the pile, 17.0-18.5s he is buried under the clutter, 18.5-20.0s only his angry face shows above the pile.",
    soundDesc: "Utensils clatter 14.8-15.8s, saucepan crash 16.2s, pile wobble 17.6s, defeated moan 19.2s.",
    captionText: "I REGRET EVERYTHING.",
    punchline: "Buried by his own magnetism.",
    characterAction: "Gets buried under spoons, forks and a saucepan; only his angry face peeks out.",
    propAction: "Spoons, forks and a saucepan stack on and around him; the screw stays by the cup.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "Small Magnet. Small Target.",
    timeRange: [20.0, 26.0],
    videoPrompt:
      "He crawls out of the pile, looks at the screw, and gets an idea — a dramatic lightbulb chime. He puts the large magnet aside and picks up a tiny magnet. Carefully he moves the tiny magnet toward the steel screw. The screw lifts off the table, travels across the tabletop, and drops neatly into the cup. His angry face transforms into pure joy. Hold on the successful result.",
    animationDesc:
      "20.0-21.0s crawls out and spots the screw, 21.0-22.2s lightbulb idea and swap to the tiny magnet, 22.2-24.4s slow approach, screw lifts and travels, 24.4-25.2s screw drops into the cup, 25.2-26.0s pure joy hold.",
    soundDesc: "Crawl rustle 20.4s, idea chime 21.5s, tiny magnet ping 22.6s, screw tap 23.8s, cup drop 24.6s, triumphant fanfare 25.1s.",
    captionText: "SMALL MAGNET. SMALL TARGET.",
    punchline: "Wrong tool, wrong size — until now.",
    characterAction: "Crawls out, idea chime, swaps magnets, watches the screw with joy.",
    propAction: "The tiny magnet lifts the screw and deposits it into the cup.",
  },
  {
    id: 6,
    name: "Shot 6",
    title: "Mission Complete Bonk",
    timeRange: [26.0, 30.0],
    videoPrompt:
      "He celebrates by raising the tiny magnet above his head. A final metal spoon flies into frame and sticks to a small metal clip on his red beanie. The spoon pulls the beanie down over his eyes. He stands completely still for one beat, then shakes with cartoon fury. End on his furious expression.",
    animationDesc:
      "26.0-27.4s raises the tiny magnet in victory, 27.4-28.2s a spoon flies in and sticks to the beanie clip, 28.2-29.0s the spoon pulls the beanie down over his eyes, 29.0-29.6s one still beat, 29.6-30.0s cartoon fury shake, final furious hold.",
    soundDesc: "Fanfare continues 26.2s, spoon fly-in 27.7s, spoon ping 27.9s, beanie drag 28.3s, stillness, comedic sting 29.8s.",
    captionText: "MISSION COMPLETE… BONK 💀",
    punchline: "Solved the screw, lost the beanie.",
    characterAction: "Celebrates, gets bonked by the spoon, stands still, then erupts in fury.",
    propAction: "A metal spoon sticks to a clip on his beanie and pulls it over his eyes.",
  },
];

export const PENCIL_LANDING_PROMPT = `THE IMPOSSIBLE PENCIL LANDING — 30-SECOND AI VIDEO PROMPT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080×1920, 24fps.

VISUAL STYLE:
- Minimalist Modern Pop flat 2D vector animation, drawn on a pure white background.
- Main character: black stickman, round white face, thick angry black eyebrows, red beanie, yellow shirt, black stick limbs.
- Props: one yellow wooden pencil with pink eraser and sharpened graphite tip, a simple desk, and a red book.
- Very thick black outlines, flat bright colours, expressive squash-and-stretch, soft contact shadows, no gradients or textures.
- No dialogue, no narration, no readable text inside the picture: SFX plus an energetic Modern Pop instrumental score only.

THE STORY (5 beats):
1. 0-5s — HOOK: he flips the pencil toward the desk with confidence. It lands flat instead of upright. He stares at it and clenches his fists in anger.
2. 5-10s — "WHY WON'T IT STAND UP?!": three quick failed attempts. The pencil rolls off the desk, bonks him harmlessly on the forehead, and disappears under a book. He stomps angrily. Quick comedic cuts.
3. 10-15s — "PRACTICE MAKES PERFECT!": a fast training montage synced to energetic Modern Pop music. He repeatedly flicks and spins the pencil, improves his technique, and prepares one final attempt. End with a dramatic launch.
4. 15-22s — "I ACTUALLY DID IT!!!": the pencil rotates in slow motion and lands sharpened-tip-first on the desk. It wobbles for two seconds before balancing upright. He celebrates with an exaggerated victory dance as the music peaks.
5. 22-30s — "WAIT… THAT'S NOT THE DESK!": his celebration shakes the desk, launching the pencil into the air. The pencil spins and lands upright on top of his round head. He freezes cross-eyed, trying to look up at it, then ends with an angry expression and a comedic musical sting.

Keep the same character, pencil, desk, book, and white background throughout. All pencil movements must be visible and physically understandable. The final pencil must visibly travel through the air before landing on his head. No extra characters.`;

export const PENCIL_LANDING_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Flip",
    timeRange: [0.0, 5.0],
    videoPrompt:
      "A stickman in a red beanie and yellow shirt stands at a desk holding a yellow pencil with a pink eraser. He flips the pencil toward the desk with a confident smirk. It lands flat instead of upright. He stares at it in disbelief, then clenches both fists in anger.",
    animationDesc:
      "0.0-1.3s confident hold, 1.3-2.3s smirk, 2.3-4.0s flip toward desk, 4.0-5.0s pencil lands flat, angry stare and fist clench.",
    soundDesc: "Confident flip whoosh, flat thud, angry sting.",
    captionText: "I WILL LAND THIS PENCIL PERFECTLY!",
    punchline: "Confidence instantly crushed by a flat landing.",
    characterAction: "Flips pencil, stares, clenches fists in anger.",
    propAction: "Pencil flips and lands flat on the desk.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "Why Won't It Stand Up?",
    timeRange: [5.0, 10.0],
    videoPrompt:
      "Three quick failed attempts in rapid succession. First throw: pencil rolls off the desk. Second: pencil bonks him harmlessly on the forehead. Third: pencil drops under a red book. After each failure he reacts bigger. Ends with him stomping the ground, face red with cartoon anger.",
    animationDesc:
      "5.0-6.0s first throw rolls off desk, 6.0-6.6s second throw bonks forehead, 6.6-7.0s third drops under book, 7.0-8.0s reactions grow, 8.0-10.0s face goes red, stomping.",
    soundDesc: "Roll off desk, forehead bonk, thud under book, angry foot stomp.",
    captionText: "WHY WON'T IT STAND UP?!",
    punchline: "Three failures, escalating frustration.",
    characterAction: "Throws, gets bonked, stomps, turns red.",
    propAction: "Pencil rolls off desk, bonks forehead, hides under book.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "Practice Makes Perfect",
    timeRange: [10.0, 15.0],
    videoPrompt:
      "A fast training montage synced to energetic music. He repeatedly flicks and spins the pencil, getting better each time. He catches it, balances it, and works up to one final dramatic launch from the desk.",
    animationDesc:
      "10.0-11.0s pick up pencil, 11.0-12.2s flick and spin, 12.2-13.6s another attempt lands flat, 13.6-14.4s spin on desk, 14.4-15.0s dramatic final launch into the air.",
    soundDesc: "Fast flicks, pencil taps, rising music tension.",
    captionText: "PRACTICE MAKES PERFECT!",
    punchline: "A montage of near-misses building to one shot.",
    characterAction: "Practices, improves, goes determined.",
    propAction: "Pencil flicks, spins, lands, launches.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "I Actually Did It",
    timeRange: [15.0, 22.0],
    videoPrompt:
      "The pencil rotates in slow motion through the air and lands sharpened-tip-first on the desk. It wobbles for two seconds, then balances upright. The stickman freezes in shock, then breaks into an exaggerated victory dance as the music peaks.",
    animationDesc:
      "15.0-15.1s launch, 15.1-20.0s slow-motion rotation toward desk, 20.0-21.4s sharpened tip lands, wobbles, balances, 21.4-22.0s victory dance begins.",
    soundDesc: "Slow-motion whooshes, clean tip-first landing plop, wobble settle, triumphant fanfare.",
    captionText: "I ACTUALLY DID IT!!!",
    punchline: "Slow motion pays off — the tip lands first.",
    characterAction: "Watches in shock, then dances in victory.",
    propAction: "Pencil rotates, lands tip-first, balances upright.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "Wait… That's Not the Desk!",
    timeRange: [22.0, 30.0],
    videoPrompt:
      "His victory dance shakes the desk, launching the pencil into the air. The pencil spins upward, passes his face, and lands upright balanced on top of his head. He freezes cross-eyed trying to look up at it, then ends with a furious angry expression and a comedic sting.",
    animationDesc:
      "22.0-26.0s victory dance with hops, 26.0-26.8s desk shake launches pencil, 26.8-27.6s pencil spins upward past face, 27.6-28.6s pencil lands upright on head, 28.6-30.0s cross-eyed freeze then fury.",
    soundDesc: "Dance hops, desk shake, pencil launch whoosh, spin, wooden balancing thud, record scratch, angry sting.",
    captionText: "WAIT… THAT'S NOT THE DESK! 💀",
    punchline: "He landed it — on the wrong surface.",
    characterAction: "Dances, freezes cross-eyed, gets furious.",
    propAction: "Pencil launches, spins, lands upright on his head.",
  },
];

export const RING_SHOT_PROMPT = `THE IMPOSSIBLE RING SHOT — 30-SECOND AI VIDEO PROMPT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080×1920, 24fps.

VISUAL STYLE:
- Minimalist Modern Pop flat 2D vector animation, drawn on a pure white background.
- Main character: black stickman, round white face, thick angry black eyebrows, red beanie, yellow shirt, black stick limbs.
- Props: one small red ball, five colourful circular hoops hanging in a rising zigzag, and a small cup balanced on his head.
- Very thick black outlines, flat bright colours, expressive squash-and-stretch, soft contact shadows, no gradients or textures.
- No dialogue, no narration, no readable text inside the picture: SFX plus an energetic background score only.

THE STORY (6 beats):
1. 0-4s — HOOK: he stands in front of the five hoops, a cup balanced on his head, holding the red ball. He studies the rig, smirks, points up at the cup, then goes determined.
2. 4-8s — ATTEMPT #1: he throws far too hard. The ball misses the first hoop, smacks the wall, ricochets back and bonks him on the forehead. His beanie spins in the air while the cup wobbles but stays upright. He freezes, then clenches his fists in rage.
3. 8-13s — ATTEMPT #27: a rapid montage. The ball drops through the first two hoops but misses the third. The next throw clangs off a rim and knocks him backwards. A dramatic spinning throw flops and rolls slowly between his feet. His face goes red and he stomps the ground.
4. 13-20s — ONE LAST TRY: he takes a deep breath, picks the ball up, plants his feet and aims. The throw is slow motion: the ball slips cleanly through all five hoops, each one flashing as it passes, then arcs down toward the cup on his head.
5. 20-26s — HE ACTUALLY DID IT: the ball drops into the cup. He slowly raises both arms, eyes sparkling, chest puffed out, then breaks into an exaggerated victory dance.
6. 26-30s — NEVER CELEBRATE TOO EARLY: mid-dance the cup tips forward, the ball drops out, bounces off his forehead and launches his red beanie into the air. He freezes, looks up at the flying beanie, then stares straight into the camera in furious disbelief. Freeze on that face.

Keep the character design, the five hoop positions, the ball colour and the cup design identical in every beat.`;

export const RING_SHOT_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "Five Rings. One Shot.",
    timeRange: [0.0, 4.0],
    videoPrompt:
      "A stickman in a red beanie and yellow shirt stands in front of five colourful hoops hanging in a rising zigzag. A small cup is balanced on his head and he holds a red ball. He studies the rig, smirks confidently, points up at the cup, then narrows his eyes with determination. End on a fast push-in to his angry, focused face.",
    animationDesc:
      "0.0-1.3s studies the hoops, 1.3-2.3s confident smirk, 2.3-3.1s points up at the cup, 3.1-4.0s determined stare, quick camera push-in.",
    soundDesc: "Dramatic whoosh, confident beat, low tension riser.",
    captionText: "5 RINGS. 1 SHOT. IMPOSSIBLE?",
    punchline: "Five hoops, one ball, one cup balanced on his head.",
    characterAction: "Studies the rig, smirks, points at the cup, goes determined.",
    propAction: "Ball held at his chest, cup balanced perfectly on his beanie.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "Attempt #1",
    timeRange: [4.0, 8.0],
    videoPrompt:
      "He throws the ball far too hard. It flies straight past the first hoop, smacks the back wall, ricochets back across the room and bonks him square on the forehead. His beanie spins up into the air while the cup wobbles but somehow stays upright. He freezes with wide eyes, then clenches both fists in rage.",
    animationDesc:
      "4.0-4.5s wind-up, 4.75s release, 4.75-5.15s ball misses hoop one and hits the wall, 5.15-5.62s ricochet returns and bonks his forehead, 5.62-6.35s beanie spins in the air and lands back, 6.35-8.0s fists clenched, furious, small shake.",
    soundDesc: "Fast whoosh 4.75s, wall smack 5.15s, double bonk 5.62s, spring boing 5.8s, angry sting 6.5s.",
    captionText: "ATTEMPT #1",
    punchline: "The wall throws it back harder than he threw it.",
    characterAction: "Throws, gets bonked, freezes, then clenches his fists in rage.",
    propAction: "Ball misses hoop one, ricochets off the wall, hits his forehead; beanie spins in the air.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "Attempt #27",
    timeRange: [8.0, 13.0],
    videoPrompt:
      "A rapid montage of ridiculous attempts. The ball drops through the first two hoops but misses the third. Another throw clangs off a rim and knocks him backwards. He tries a dramatic spinning throw and the ball just rolls slowly between his feet. His face turns bright red with cartoon anger and he stomps the ground.",
    animationDesc:
      "8.22-9.06s ball through hoops one and two, misses the third, 9.55-10.24s rim clang knocks him backwards, 10.95-11.9s spinning throw flops and rolls between his feet, 12.05-13.0s face goes red, stomps, ball pops back up into his hand.",
    soundDesc: "Three quick whooshes, rim clang 9.78s, rubber squeaks, angry foot stomp 12.3s, comedic sting 12.6s.",
    captionText: "ATTEMPT #27",
    punchline: "Three more ways to fail in five seconds.",
    characterAction: "Throws twice, is knocked backwards, flops a spin throw, turns red and stomps.",
    propAction: "Ball passes two hoops, clangs a rim, then rolls between his feet.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "One. Last. Try.",
    timeRange: [13.0, 20.0],
    videoPrompt:
      "He takes a deep breath, plants his feet, checks the cup on his head, narrows his eyes and throws the ball in slow motion. The ball passes cleanly through all five hoops, each hoop flashing as it goes, then arcs down toward the cup on his head. His angry expression turns to shocked disbelief.",
    animationDesc:
      "13.0-14.4s deep breath and aim, 14.5-19.4s slow-motion ball through all five hoops with a flash on each, arcing down toward the cup, 19.4-20.0s the ball drops into the cup, he freezes in disbelief.",
    soundDesc: "Deep inhale 13.4s, heartbeat, five satisfying whooshes 15.3-18.6s, rising tension, clean cup plop 19.4s.",
    captionText: "ONE. LAST. TRY.",
    punchline: "Slow motion, five hoops, one perfect arc.",
    characterAction: "Breathes, aims, throws slowly, then stares in disbelief.",
    propAction: "Ball passes through all five hoops and drops into the cup on his head.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "He Actually Did It?!",
    timeRange: [20.0, 26.0],
    videoPrompt:
      "The red ball sits perfectly inside the cup balanced on his head. He slowly raises both arms in victory, eyes sparkling, chest puffed out, then breaks into an exaggerated victory dance, convinced he is a legendary trickshot champion.",
    animationDesc:
      "20.0-21.0s wobble settles, ball rests in the cup, 21.0-22.0s disbelief, 22.0-26.0s arms up, sparkling eyes, hips wiggling, two little hops of celebration.",
    soundDesc: "Cup settle 20.2s, sparkling chime 21.0s, triumphant fanfare 21.4s, dance beat with two hop thuds 23.1s and 24.5s.",
    captionText: "HE ACTUALLY DID IT?!",
    punchline: "The impossible shot is real — and he knows it.",
    characterAction: "Disbelief, then arms up, sparkling eyes and an exaggerated victory dance.",
    propAction: "The ball settles inside the cup and rides every hop.",
  },
  {
    id: 6,
    name: "Shot 6",
    title: "Never Celebrate Too Early",
    timeRange: [26.0, 30.0],
    videoPrompt:
      "During the victory dance the cup tips forward, the ball rolls out, drops onto his forehead with a loud bonk and launches his red beanie into the air. He stops dancing, looks up at his flying beanie, then stares straight at the camera with furious disbelief. Freeze on his furious expression for the final beat.",
    animationDesc:
      "26.0-26.45s dance continues, 26.45-27.05s cup tips and the ball rolls out, 27.06-27.4s ball bonks his forehead and the beanie launches, 27.35-29.05s beanie spins in the air and lands back, 27.3-28.95s he stares up at it, 28.95-30.0s furious camera stare, final freeze.",
    soundDesc: "Cup clatter 26.5s, loud bonk 27.1s, beanie whoosh 27.35s, record scratch 27.9s, angry sting 29.0s.",
    captionText: "NEVER CELEBRATE TOO EARLY 💀",
    punchline: "The trick was perfect. The celebration was not.",
    characterAction: "Freezes mid-dance, watches the beanie fly, then stares furiously into the camera.",
    propAction: "Cup tips, ball drops out and bonks his forehead, beanie launches and lands back.",
  },
];
export const DOMINO_TRICKSHOT_PROMPT = `THE IMPOSSIBLE DOMINO TRICKSHOT — 30-SECOND AI VIDEO PROMPT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080×1920, 24fps.

VISUAL STYLE:
Modern Pop flat 2D vector cartoon. Thick consistent black outlines, simple geometric shapes, smooth readable movements, exaggerated facial expressions, bright solid colors. Clean white background with minimal shadows, no decorations, no gradients, no textures. Centered mobile compositions; important action inside the central 60-70% of the frame.

CHARACTER:
The angry black stickman with a round white face, thick black eyebrows, expressive eyes, a red beanie and a bright yellow shirt. Black line limbs. The head, proportions, beanie and shirt stay identical everywhere. He is extremely competitive, impatient, and comically overconfident — he treats a simple domino chain reaction like an impossible world championship.

PROPS:
One tiny blue ball, 20 colorful dominoes (red, orange, yellow, green, blue, purple), one small ramp, one second ball (red), and one red cup on a short platform. Keep the domino colors consistent throughout. The dominoes are arranged in a line with the ramp at the end leading to the cup.

CONTINUITY:
Same stickman, blue ball, dominoes, ramp, red ball, and red cup through the entire story. The domino line stays in the same position. Hard cuts between escalating failures. No photorealism, 3D, extra characters, duplicated props, logos, watermarks, random transitions or complex backgrounds.

STORY IN SIX CAPTIONED SHOTS (captions are burned in near the top; white extra-bold with a thick black outline and pop-in):

SHOT 1 (0-4s) "ONE BALL. 20 DOMINOES. ONE SHOT.":
The stickman stands beside a carefully arranged line of 20 colorful dominoes. At the end is a small ramp, a second ball, and a red cup positioned on a short platform. He holds a tiny blue ball, points at the cup, and grins confidently.

SHOT 2 (4-8s) "ATTEMPT #1":
He gently flicks the blue ball. It rolls past the first domino without touching it and falls off the table. He stares at the untouched domino line, then slowly clenches his black mitten hands.

SHOT 3 (8-14s) "WHY IS EVERYTHING FALLING?!":
He flicks too hard. The first domino falls, but it knocks the next domino sideways. The chain collapses in the wrong direction. He frantically tries to catch the falling dominoes, accidentally knocking down the remaining line with his arm.

SHOT 4 (14-20s) "DON'T BLINK…":
He takes a breath and flicks the ball with precise force. The ball hits the first domino. All 20 dominoes fall in a satisfying, perfectly timed sequence. The final domino nudges the second ball onto the ramp, sending it rolling toward the red cup.

SHOT 5 (20-25s) "PERFECT CHAIN REACTION!!":
The second ball arcs off the ramp and lands directly inside the red cup. He jumps up, raises both black mitten hands, and celebrates like a champion. The cup wobbles precariously on its platform.

SHOT 6 (25-30s) "THE FINAL DOMINO GOT REVENGE 💀":
The last wobble sends the red cup tumbling off the platform. It drops upside down over his head and covers his beanie and eyes. He freezes with his arms raised, then slowly lowers them and gives the camera an absolutely furious stare.

AUDIO:
Playful bouncy score only, lower than the SFX. Tension builds through Shot 4, a satisfying click rhythm and victory fanfare on the success, the fanfare cut off the instant the cup wobbles, a short silence, then a sharp comedic sting. No dialogue, no narration, no voice-over.`;

export const DOMINO_TRICKSHOT_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Challenge",
    timeRange: [0.0, 4.0],
    videoPrompt:
      "The angry stickman in red beanie and yellow shirt stands beside a carefully arranged line of 20 colorful dominoes (red, orange, yellow, green, blue, purple). At the end of the line is a small wooden ramp, a red ball, and a red cup on a short platform. He holds a tiny blue ball, points at the cup with a confident grin. Clean white background.",
    animationDesc:
      "0.0-1.0s he stands confidently beside the domino line, 1.0-2.5s points at the cup and grins, 2.5-3.5s holds up the blue ball and winks, 3.5-4.0s determined stare at the camera.",
    soundDesc: "Dramatic boom at 0.05s, ticking countdown from 0.5s, confident chime at 2.0s.",
    captionText: "ONE BALL. 20 DOMINOES. ONE SHOT.",
    punchline: "Twenty dominoes stand between him and glory.",
    characterAction: "Stands beside domino line, points at cup, holds up blue ball, grins confidently.",
    propAction: "20 colorful dominoes in a line, ramp, red ball, red cup on platform, blue ball in hand.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "First Failure",
    timeRange: [4.0, 8.0],
    videoPrompt:
      "He gently flicks the blue ball with his fingers. It rolls slowly past the first domino without touching it, continuing off the edge of the table and dropping out of sight. He stares at the perfectly still domino line, eyebrows twitching, then slowly clenches both black mitten hands into tight fists.",
    animationDesc:
      "4.0-4.5s winds up the flick, 4.5-5.2s releases the ball, 5.2-6.0s ball rolls past first domino and falls off table, 6.0-7.0s stares at untouched dominoes, 7.0-8.0s slowly clenches fists, eyebrows twitching.",
    soundDesc: "Soft flick at 4.5s, rolling ball 4.5-6.0s, tiny plop at 6.1s, sad trombone at 6.5s.",
    captionText: "ATTEMPT #1",
    punchline: "He missed the first domino. By a mile.",
    characterAction: "Flicks ball gently, watches it miss completely, stares in disbelief, clenches fists.",
    propAction: "Blue ball rolls past domino #1 and falls off table; all 20 dominoes remain standing.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "Total Disaster",
    timeRange: [8.0, 14.0],
    videoPrompt:
      "He flicks the blue ball way too hard. It slams into the first domino, which falls but knocks the second domino sideways instead of forward. The chain reaction collapses in a chaotic mess — dominoes falling left, right, and backwards. He frantically waves his arms trying to catch them, but his flailing arm sweeps across the table and knocks down the rest of the line.",
    animationDesc:
      "8.0-8.5s winds up hard, 8.5-9.0s slams ball into first domino, 9.0-10.5s chain goes sideways chaotically, 10.5-12.0s he waves arms frantically trying to catch them, 12.0-13.0s his arm sweeps and knocks down the rest, 13.0-14.0s stands amid the ruin, furious stomp.",
    soundDesc: "Hard impact 8.7s, rapid clattering 9.0-12.0s, cartoon crash 12.5s, frustrated stomp 13.5s.",
    captionText: "WHY IS EVERYTHING FALLING?!",
    punchline: "His 'help' destroyed what the chaos missed.",
    characterAction: "Flicks too hard, watches chain go wrong, flails arms to catch dominoes, accidentally knocks down the rest, stomps in fury.",
    propAction: "Domino chain collapses sideways chaotically; his arm sweeps the remaining standing dominoes.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "The Perfect Chain",
    timeRange: [14.0, 20.0],
    videoPrompt:
      "He takes a deep breath, centers himself, and flicks the blue ball with precise, measured force. It taps the first domino perfectly. All 20 dominoes fall in a satisfying, rhythmic, perfectly timed sequence — click, click, click. The final domino tips forward and gently nudges the red ball onto the ramp. The red ball rolls smoothly up and down the ramp toward the red cup.",
    animationDesc:
      "14.0-15.0s deep breath, centers himself, 15.0-15.5s precise flick, 15.5-18.5s all 20 dominoes fall in perfect rhythm, 18.5-19.0s final domino nudges red ball onto ramp, 19.0-20.0s red ball rolls down ramp toward cup.",
    soundDesc: "Deep breath 14.2s, precise tap 15.3s, rhythmic domino clicks 15.5-18.5s (one per 0.15s), rising music swell, rolling ball 19.0s.",
    captionText: "DON'T BLINK…",
    punchline: "Twenty dominoes. One perfect rhythm. Zero mistakes.",
    characterAction: "Breathes, flicks with precision, watches with intense focus as the chain completes.",
    propAction: "Blue ball hits domino #1; all 20 fall in perfect sequence; last domino nudges red ball onto ramp; red ball rolls toward cup.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "Impossible Success",
    timeRange: [20.0, 25.0],
    videoPrompt:
      "The red ball arcs off the ramp and lands directly inside the red cup with a satisfying ping. He explodes upward, both black mitten hands raised in victory, beaming with triumph. He does a little victory hop. The red cup wobbles precariously on its platform, teetering back and forth.",
    animationDesc:
      "20.0-20.5s red ball arcs off ramp, 20.5-21.0s ball lands in cup with ping, 21.0-22.0s jumps up with both arms raised, 22.0-24.0s victory dance with hops, 24.0-25.0s cup wobbles visibly on platform, he notices and freezes mid-hop.",
    soundDesc: "Satisfying cup ping 20.7s, victory fanfare 21.0s, crowd cheer 21.5s, hop thuds 22.5s and 23.5s, cup wobble creak 24.5s.",
    captionText: "PERFECT CHAIN REACTION!!",
    punchline: "He did it. The impossible chain reaction actually worked.",
    characterAction: "Watches ball land in cup, jumps in victory, dances, notices cup wobbling, freezes.",
    propAction: "Red ball arcs off ramp into cup; cup wobbles on platform.",
  },
  {
    id: 6,
    name: "Shot 6",
    title: "The Twist",
    timeRange: [25.0, 30.0],
    videoPrompt:
      "The cup's final wobble sends it tumbling off the platform. It drops upside down right over his head, covering his beanie and eyes completely. He freezes with his arms still raised in victory pose. The cup sits on his shoulders like a helmet. Slowly, he lowers his arms. He gives the camera an absolutely furious, deadpan stare through the cup.",
    animationDesc:
      "25.0-25.5s cup wobbles one last time, 25.5-26.0s cup tips off platform and falls onto his head, 26.0-27.0s freezes with arms raised, cup covering face, 27.0-28.0s slowly lowers arms, 28.0-30.0s furious deadpan stare into camera through the cup.",
    soundDesc: "Cup wobble creak 25.2s, hollow bonk 25.7s, record scratch 26.0s, angry sting 29.0s, then silence.",
    captionText: "THE FINAL DOMINO GOT REVENGE 💀",
    punchline: "The chain reaction was perfect. The cup had other plans.",
    characterAction: "Freezes as cup lands on head, slowly lowers arms, stares furiously into camera.",
    propAction: "Red cup falls off platform and lands upside-down on his head, covering beanie and eyes.",
  },
];

export const ARCADE_CLAW_PROMPT = `THE ANGRY STICKMAN: THE IMPOSSIBLE CLAW MACHINE — 30-SECOND AI VIDEO PROMPT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080×1920, 24fps.

VISUAL STYLE:
Minimalist flat 2D vector animation, thick black outlines, white round stickman head, black stickman body, expressive eyebrows, exaggerated physical comedy, bright neon arcade colors, claw machines, arcade basketball, racing cabinets, pinball bumpers, and a giant teddy bear. Maintain consistent character proportions, props, and arcade layout across all scenes.

SCENE 1 (0–5 seconds):
Inside a colorful neon arcade, the angry stickman spots a giant teddy bear inside a claw machine. He holds up a single coin, inserts it into the machine, and confidently presses the button.
Caption added during editing: "He wants to win this giant teddy bear with ONE coin!"
Sound: Coin drop and cheerful arcade chime.

SCENE 2 (5–9 seconds):
The claw grabs the teddy bear and lifts it almost to the prize chute. At the last second, the claw opens and drops the bear back into the pile. The stickman's eye twitches and his fists clench.
Caption: "THE CLAW DROPS IT AT THE LAST SECOND!"
Sound: Mechanical squeak and sad trombone.

SCENE 3 (9–15 seconds):
The stickman enters revenge mode. He builds a ridiculous trickshot setup using an arcade basketball, a ramp, a pinball bumper, and nearby arcade cabinets. He aims the ball toward the claw machine's giant control button.
Caption: "SO HE TURNS THE ENTIRE ARCADE INTO A TRICKSHOT!"
Sound: Mechanical clanks and dramatic rising music.

SCENE 4 (15–22 seconds):
He launches the basketball. It bounces off a pinball bumper, ricochets off a racing-game cabinet, flies over several arcade machines, and lands perfectly on the claw machine's giant button. The machine activates and the claw grabs the teddy bear.
Caption: "THAT SHOT SHOULD BE IMPOSSIBLE!"
Sound: Rapid boings, whooshes, and a dramatic success sting.

SCENE 5 (22–26 seconds):
The claw successfully drops the giant teddy bear into the prize chute. The stickman jumps up and celebrates, then reaches inside to retrieve his prize.
Caption: "HE ACTUALLY WON IT!"
Sound: Victory fanfare and cheerful arcade music.

SCENE 6 (26–30 seconds):
The claw machine malfunctions. Dozens of giant teddy bears burst out of the prize chute like an avalanche, completely burying the stickman. After a brief pause, one tiny black arm emerges from the pile, still holding the original coin.
Caption: "HE WON… THE ENTIRE INVENTORY! 💀"
Sound: Machine alarm, plush avalanche, then a tiny coin ding. Finish on a comedic freeze-frame.

CAMERA:
Use quick cuts, close-ups of facial expressions, smooth ball tracking, clear action, and exaggerated cartoon physics. Keep every action understandable without dialogue.

TEXT:
Do not render words or captions inside the generated frames. Add the supplied captions during editing, timed to each scene. Use bold, large, high-contrast text near the top of the vertical frame.

AUDIO:
Include sound effects for coin insertion, claw movement, ball bounces, arcade alarms, the victory moment, and the final avalanche. No spoken dialogue, logos, or watermarks.`;

export const ARCADE_CLAW_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Challenge",
    timeRange: [0.0, 5.0],
    videoPrompt:
      "Inside a colorful neon arcade, the angry stickman spots a giant teddy bear inside a claw machine. He holds up a single coin, inserts it into the machine, and confidently presses the button.",
    animationDesc:
      "0.0-0.8s stickman walks to claw machine, 0.8-1.5s holds up coin with confident smirk, 1.5-2.5s inserts coin with dramatic flourish, 2.5-3.5s presses big red button with anticipation, 3.5-5.0s leans forward watching claw descend.",
    soundDesc: "Coin drop chime at 1.5s, arcade ambient hum, cheerful button beep at 2.5s, claw motor whir at 3.0s.",
    captionText: "He wants to win this giant teddy bear with ONE coin!",
    punchline: "One coin, total confidence, giant teddy bear in sight.",
    characterAction: "Walks up, holds coin high, inserts with flair, presses button eagerly, watches with hope.",
    propAction: "Claw machine glows with neon lights; giant teddy bear sits prominently in the prize pile.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "The Drop",
    timeRange: [5.0, 9.0],
    videoPrompt:
      "The claw grabs the teddy bear and lifts it almost to the prize chute. At the last second, the claw opens and drops the bear back into the pile. The stickman's eye twitches and his fists clench.",
    animationDesc:
      "5.0-5.8s claw closes on bear, 5.8-7.0s claw lifts bear toward chute, 7.0-7.5s claw reaches peak height, 7.5-7.8s claw suddenly opens, 7.8-8.2s bear falls back into pile, 8.2-9.0s stickman eye twitches, fists clench, rage builds.",
    soundDesc: "Claw motor strain at 5.0s, lifting whir, mechanical squeak at 7.5s, sad trombone at 8.0s, heavy silence.",
    captionText: "THE CLAW DROPS IT AT THE LAST SECOND!",
    punchline: "The cruelest mechanical betrayal in arcade history.",
    characterAction: "Watches with widening eyes, jaw drops at the drop, eye twitches violently, fists clench in rage.",
    propAction: "Claw grabs bear, lifts high, opens at the last inch, bear plummets back into the plush pile.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Invention",
    timeRange: [9.0, 15.0],
    videoPrompt:
      "The stickman enters revenge mode. He builds a ridiculous trickshot setup using an arcade basketball, a ramp, a pinball bumper, and nearby arcade cabinets. He aims the ball toward the claw machine's giant control button.",
    animationDesc:
      "9.0-9.5s rage spark, eyes glow red, 9.5-11.0s drags arcade basketball cabinet into position, 11.0-12.0s sets up ramp from racing game, 12.0-13.0s positions pinball bumper, 13.0-14.0s arranges cabinets as backstops, 14.0-15.0s places basketball on ramp, aims at claw button, manic grin.",
    soundDesc: "Rage growl at 9.0s, heavy cabinet thuds, mechanical clanks, ramp scrape, dramatic rising orchestral sting from 12.0s.",
    captionText: "SO HE TURNS THE ENTIRE ARCADE INTO A TRICKSHOT!",
    punchline: "An entire arcade becomes a Rube Goldberg machine for one button.",
    characterAction: "Furious assembly, dragging cabinets, positioning ramp and bumper, final aiming pose with wild eyes.",
    propAction: "Arcade basketball, wooden ramp, pinball bumper, racing cabinet all positioned to guide ball to claw button.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Impossible Shot",
    timeRange: [15.0, 22.0],
    videoPrompt:
      "He launches the basketball. It bounces off a pinball bumper, ricochets off a racing-game cabinet, flies over several arcade machines, and lands perfectly on the claw machine's giant button. The machine activates and the claw grabs the teddy bear.",
    animationDesc:
      "15.0-15.3s launches ball with slap, 15.3-16.0s ball hits pinball bumper with loud BOING, 16.0-16.8s ricochets off racing cabinet, 16.8-18.5s flies over arcade machines in perfect arc, 18.5-19.5s lands squarely on giant claw button, 19.5-20.5s machine activates with lights and sound, 20.5-22.0s claw descends and grabs teddy bear perfectly.",
    soundDesc: "Launch thwack at 15.0s, pinball BOING at 15.5s, cabinet ricochet at 16.2s, flight whooshes, button SLAM at 19.5s, machine activation fanfare at 20.0s, claw motor at 20.5s, success sting at 21.0s.",
    captionText: "THAT SHOT SHOULD BE IMPOSSIBLE!",
    punchline: "A pinball wizard shot across an entire arcade.",
    characterAction: "Slaps ball, tracks flight with head whipping between impacts, freezes at button impact, erupts in silent victory.",
    propAction: "Basketball ricochets off bumper, cabinet, flies over machines, hits button dead center; claw machine lights up and grabs bear.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Victory",
    timeRange: [22.0, 26.0],
    videoPrompt:
      "The claw successfully drops the giant teddy bear into the prize chute. The stickman jumps up and celebrates, then reaches inside to retrieve his prize.",
    animationDesc:
      "22.0-22.5s claw carries bear to chute, 22.5-23.5s bear drops into chute with satisfying thud, 23.5-24.0s stickman jumps and pumps fists, 24.0-25.0s victory dance, 25.0-26.0s reaches into prize chute to grab bear.",
    soundDesc: "Claw deposit thud at 22.5s, victory fanfare from 23.5s, cheerful arcade win music, celebratory whoops.",
    captionText: "HE ACTUALLY WON IT!",
    punchline: "The impossible trickshot actually worked.",
    characterAction: "Explosive celebration, fist pumps, victory dance, reaches eagerly into prize chute.",
    propAction: "Claw deposits bear in chute; prize door opens; stickman reaches in for the giant teddy.",
  },
  {
    id: 6,
    name: "Scene 6",
    title: "The Avalanche",
    timeRange: [26.0, 30.0],
    videoPrompt:
      "The claw machine malfunctions. Dozens of giant teddy bears burst out of the prize chute like an avalanche, completely burying the stickman. After a brief pause, one tiny black arm emerges from the pile, still holding the original coin.",
    animationDesc:
      "26.0-26.5s machine alarm blares, lights flash red, 26.5-27.5s dozens of giant teddy bears explode from chute like avalanche, 27.5-28.5s stickman completely buried under mountain of plush, 28.5-29.0s silence, 29.0-29.5s one tiny black arm emerges from pile holding original coin, 29.5-30.0s comedic freeze-frame on the arm and coin.",
    soundDesc: "Machine alarm at 26.0s, massive plush avalanche rumble 26.5-27.5s, muffled silence, tiny coin ding at 29.2s, record scratch freeze at 29.5s.",
    captionText: "HE WON… THE ENTIRE INVENTORY! 💀",
    punchline: "He wanted one bear. He got the whole warehouse.",
    characterAction: "Buried under plush avalanche, only one arm emerges from the pile, still clutching the original coin.",
    propAction: "Claw machine malfunctions, avalanche of giant teddy bears buries character; single arm with coin emerges from plush mountain.",
  },
];

export const BALLOON_POP_PROMPT = `THE BALLOON POP JACKPOT — 30-SECOND AI VIDEO PROMPT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080×1920, 24fps.

VISUAL STYLE:
Modern Pop flat 2D vector cartoon. Thick consistent black outlines, simple geometric shapes, smooth readable movements, exaggerated facial expressions, bright solid colors. Warm cream carnival tent, a wooden dart booth with a navy target board, ten colorful balloons in two neat rows, one giant golden balloon in the middle, a golden trophy display above the booth, LED bulbs, rainbow decorations and prize shelves. No gradients, no textures, no watermark, no logo.

CHARACTER (LOCKED):
Round white head, two small black oval eyes, thick black eyebrows, simple black mouth, yellow short-sleeved shirt, blue trousers, black shoes, red beanie with a red pompom, thin black limbs and black mitten hands.

SHOT 1 (0-6s) — THE CHALLENGE:
He stands at the counter, points up at the golden trophy over the booth, pounds one fist into the other palm and gives the camera a cocky nod. Caption: "POP 10 BALLOONS TO WIN!"

SHOT 2 (6-12s) — THREE TERRIBLE DARTS:
Three visibly travelling darts miss: one sticks in the booth frame, one thunks into the floor, and the third grazes a blue balloon so it only shakes and wobbles — it must NOT pop. He stares at the untouched board, then clenches his fists. Caption: "WHY CAN'T HE HIT ONE?!"

SHOT 3 (12-18s) — THREE QUICK POPS:
Three fast darts pop three balloons with confetti bursts. A hidden compartment in the counter bursts open and a stream of balloons sweeps the remaining row away; the lead balloon knocks his beanie off, he catches it and puts it back on, now angrier. Caption: "HE'S FINALLY ON FIRE!"

SHOT 4 (18-24s) — JACKPOT:
Only the giant golden balloon is left. Long suspense, a slow aim, a perfect hit: golden confetti, rainbow lights and a burst of sparkles. He jumps with both fists raised. Caption: "JACKPOT! ONE LAST BALLOON!"

SHOT 5 (24-30s) — THE PRIZE IS A BALLOON:
The trophy display case swings open and reveals a gigantic golden balloon that visibly rises and inflates until it bursts over him. He emerges from the gold foil with a tiny golden balloon tied to his beanie and gives the camera a furious deadpan stare. Caption: "WAIT... THE PRIZE IS A BALLOON?!"

SOUND:
Bouncy carnival comedy score plus procedural SFX only. Dart whooshes and wooden thunks, balloon pops, a bass-drum roll before the golden hit, a victory fanfare, a record scratch and an angry sting. No dialogue, no narration, no voice-over.`;

export const BALLOON_POP_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Shot 1",
    title: "The Challenge",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "The angry stickman (round white head, red beanie, yellow shirt, blue trousers, black shoes) stands at the counter of a carnival dart booth. Behind him: a navy target board with ten colorful balloons in two neat rows (red, blue, yellow, green, purple, pink), one giant golden balloon in the center, a golden trophy display above, LED bulbs, rainbow decorations and prize shelves. He points up at the golden trophy, then pounds a fist into his palm with a cocky grin.",
    animationDesc:
      "0.0-1.15s he smirks at the camera with a cocky nod, 1.15-2.35s he points up at the trophy case above the booth, 2.35-3.5s he holds the point and grins, 3.5-4.55s he pounds one fist into the other palm, 4.55-6.0s he leans forward with a determined stare, ready to throw.",
    soundDesc: "Carnival calliope score, booth light shimmer at 0.6s, confident chime at 2.0s, fist clap at 4.4s.",
    captionText: "POP 10 BALLOONS TO WIN!",
    punchline: "Ten balloons stand between him and the golden trophy.",
    characterAction: "Points at the trophy, nods cockily, clenches his fists.",
    propAction: "Ten colorful balloons, one giant golden balloon, trophy case glowing above the booth.",
  },
  {
    id: 2,
    name: "Shot 2",
    title: "Three Terrible Darts",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Same carnival booth and character. He throws three darts in a row. The first dart sticks in the wooden booth frame above the board, the second thunks into the sawdust floor, and the third just grazes a blue balloon — the balloon shakes and wobbles but does not pop. He freezes, blinks, then clenches his fists in frustration.",
    animationDesc:
      "6.5s first dart launches and thunks into the frame at 6.95s. 8.3s second dart launches and sticks in the floor at 8.78s. 9.7s third dart launches, grazes the blue balloon at 10.02s and falls to the floor by 10.75s; the blue balloon wobbles but stays intact. 10.85-12.0s he stares at the board and clenches his fists.",
    soundDesc: "Dart whooshes at 6.5s / 8.3s / 9.7s, wooden thunk at 6.95s, floor thunk at 8.78s, balloon wobble squeak at 10.1s, frustrated sting at 11.0s.",
    captionText: "WHY CAN'T HE HIT ONE?!",
    punchline: "Three darts, zero pops.",
    characterAction: "Throws three darts, misses each time, freezes, then clenches his fists.",
    propAction: "Dart 1 sticks in the frame, dart 2 in the floor, dart 3 grazes the blue balloon without popping it.",
  },
  {
    id: 3,
    name: "Shot 3",
    title: "Three Quick Pops",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Three rapid darts pop three balloons in puffs of confetti. The counter hatch bursts open and a stream of colorful balloons sweeps across the board, clearing the remaining row. The lead balloon bounces off his head and knocks the red beanie into the air; he catches it and puts it back on, angrier than before.",
    animationDesc:
      "12.6s red balloon pops, 13.4s purple balloon pops, 14.2s yellow balloon pops, each with confetti. 14.9s the hidden counter hatch flips open, 15.0-16.3s a stream of balloons jets up and sweeps the remaining seven balloons away while the lead balloon bonks his beanie off; 16.35-17.0s he catches it, 17.0-17.45s he puts it back on, 17.45-18.0s he scowls at the board.",
    soundDesc: "Dart whooshes at 12.35s / 13.15s / 13.95s, three balloon pops at 12.6s / 13.4s / 14.2s, hatch clunk at 14.9s, balloon rush 15.0-16.3s, comedic boing at 15.45s, beanie rustle at 17.0s, angry sting at 17.5s.",
    captionText: "HE'S FINALLY ON FIRE!",
    punchline: "Three perfect pops — then the booth fights back.",
    characterAction: "Pops three balloons, gets his beanie knocked off, catches it and puts it back on, scowling.",
    propAction: "Hidden counter compartment releases a balloon stream that sweeps the board and knocks the beanie loose.",
  },
  {
    id: 4,
    name: "Shot 4",
    title: "Jackpot",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Only the giant golden balloon remains in the middle of the board. The camera pushes in. He takes a long breath, aims carefully with a slow lean, and throws one perfect dart. The golden balloon bursts into gold confetti, rainbow lights sweep the booth and sparkles fill the frame. He jumps with both fists raised in triumph.",
    animationDesc:
      "18.0-20.25s suspense as he stares at the golden balloon, 20.25-21.35s a slow, deliberate aim, 21.3s the dart launches and hits at 21.6s: golden confetti burst, rainbow light sweep, sparkles. 22.25-24.0s he jumps with both fists raised in a victory dance.",
    soundDesc: "Drum roll 18.2-21.2s, dart whoosh at 21.3s, golden pop at 21.6s, victory fanfare 21.7-23.6s, happy hops at 22.25s / 23.05s.",
    captionText: "JACKPOT! ONE LAST BALLOON!",
    punchline: "One balloon left, one perfect shot.",
    characterAction: "Aims slowly, throws the perfect dart, then jumps with both fists raised.",
    propAction: "Golden balloon bursts into gold confetti; rainbow lights sweep the booth.",
  },
  {
    id: 5,
    name: "Shot 5",
    title: "The Prize Is A Balloon",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "The golden trophy display case swings open above the booth revealing a gigantic golden balloon that visibly rises and inflates. It bursts over him in a storm of gold foil and streamers. He emerges with a tiny golden balloon tied to his beanie and gives the camera a furious deadpan stare.",
    animationDesc:
      "24.0-24.5s the trophy case doors swing open, 24.5-25.3s a huge golden balloon begins to rise and inflate from the case, 25.3-27.3s it grows past the frame while he braces and squeezes his eyes shut, 27.4s it bursts in gold confetti and streamers, 27.4-28.2s he is buried under falling gold foil, 28.2-28.55s he pops out with a tiny golden balloon on his beanie, 28.55-30.0s the camera pushes into a furious stare with a twitching eyebrow.",
    soundDesc: "Case mechanism at 24.4s, balloon inflate 25.3-27.3s, giant burst at 27.4s, foil rain 27.4-28.3s, tiny squeak at 28.35s, record scratch at 28.2s, angry sting at 29.0s.",
    captionText: "WAIT... THE PRIZE IS A BALLOON?!",
    punchline: "He won the whole jackpot: one tiny balloon.",
    characterAction: "Braces for the burst, is buried in gold foil, emerges with a tiny balloon on his beanie, stares furiously.",
    propAction: "Trophy case opens, giant golden balloon inflates and bursts, tiny golden balloon tied to the beanie.",
  },
];

export const PROJECTS: Record<ProjectId, ProjectDef> = {
  'mind-traps': {
    id: 'mind-traps',
    title: 'Angry Stickman: Mind Traps & The Red Cage',
    subtitle: 'The 30-Second Minimalist Monochrome Explainer',
    tagline: 'Vertical 9:16 · Style 1A (White) & 1B (Black) · Vivid Red Accent Storytelling',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: MIND_TRAPS_PROMPT,
    scenes: MIND_TRAPS_SCENES,
  },
  'arcade-claw': {
    id: 'arcade-claw',
    title: 'Angry Stickman vs. The Impossible Claw Machine',
    subtitle: 'The 30-Second Arcade Avalanche Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Neon Arcade Chaos · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: ARCADE_CLAW_PROMPT,
    scenes: ARCADE_CLAW_SCENES,
  },
  'diamond-heist': {
    id: 'diamond-heist',
    title: 'Angry Stickman: The Impossible Diamond Heist',
    subtitle: 'The 30-Second Museum Spoon Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Minimalist Monochrome · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: DIAMOND_HEIST_PROMPT,
    scenes: DIAMOND_HEIST_SCENES,
  },
  'pancake-flip': {
    id: 'pancake-flip',
    title: 'Angry Stickman: The Perfect Pancake Flip',
    subtitle: 'The 30-Second Kitchen Trickshot Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: PANCAKE_FLIP_PROMPT,
    scenes: PANCAKE_FLIP_SCENES,
  },
  'vending-machine': {
    id: 'vending-machine',
    title: 'Angry Stickman: The Vending Machine Revenge',
    subtitle: 'The 30-Second Snack Nook Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: VENDING_MACHINE_PROMPT,
    scenes: VENDING_MACHINE_SCENES,
  },
  'biggest-balloon': {
    id: 'biggest-balloon',
    title: 'Angry Stickman: The Biggest Balloon',
    subtitle: 'The 30-Second Balloon Anti-Pop Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: BIGGEST_BALLOON_PROMPT,
    scenes: BIGGEST_BALLOON_SCENES,
  },
  'find-the-ball': {
    id: 'find-the-ball',
    title: 'Angry Stickman: Find the Ball',
    subtitle: 'The 30-Second Cup Shuffle Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: FIND_THE_BALL_PROMPT,
    scenes: FIND_THE_BALL_SCENES,
  },
  'attempt-247': {
    id: 'attempt-247',
    title: 'Angry Stickman: Attempt #247',
    subtitle: 'The 30-Second Impossible Trash Can Trickshot',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: ATTEMPT_247_PROMPT,
    scenes: ATTEMPT_247_SCENES,
  },
  'needle-thread': {
    id: 'needle-thread',
    title: 'Angry Stickman: The Impossible Needle Thread',
    subtitle: 'The 30-Second Sewing Championship Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: NEEDLE_THREAD_PROMPT,
    scenes: NEEDLE_THREAD_SCENES,
  },
  'magnet-trick': {
    id: 'magnet-trick',
    title: 'Angry Stickman: The Impossible Magnet Trick',
    subtitle: 'The 30-Second Magnet Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: MAGNET_TRICK_PROMPT,
    scenes: MAGNET_TRICK_SCENES,
  },
  'ring-shot': {
    id: 'ring-shot',
    title: 'Angry Stickman: The Impossible Ring Shot',
    subtitle: 'The 30-Second Five-Hoop Trickshot Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: RING_SHOT_PROMPT,
    scenes: RING_SHOT_SCENES,
  },
  'pencil-landing': {
    id: 'pencil-landing',
    title: 'Angry Stickman: The Impossible Pencil Landing',
    subtitle: 'The 30-Second Desk-and-Pencil Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: PENCIL_LANDING_PROMPT,
    scenes: PENCIL_LANDING_SCENES,
  },
  'domino-trickshot': {
    id: 'domino-trickshot',
    title: 'Angry Stickman: The Impossible Domino Trickshot',
    subtitle: 'The 30-Second Chain Reaction Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: DOMINO_TRICKSHOT_PROMPT,
    scenes: DOMINO_TRICKSHOT_SCENES,
  },
  'balloon-pop-jackpot': {
    id: 'balloon-pop-jackpot',
    title: 'Angry Stickman: The Balloon Pop Jackpot',
    subtitle: 'The 30-Second Carnival Booth Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: BALLOON_POP_PROMPT,
    scenes: BALLOON_POP_SCENES,
  },
  'candy-claw': {
    id: 'candy-claw',
    title: 'Angry Stickman: The Candy Claw Disaster',
    subtitle: 'The 30-Second Neon Arcade Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: CANDY_CLAW_PROMPT,
    scenes: CANDY_CLAW_SCENES,
  },
  'plate-spin': {
    id: 'plate-spin',
    title: 'Angry Stickman: The Impossible Plate Spin',
    subtitle: 'The 30-Second Circus Booth Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: PLATE_SPIN_PROMPT,
    scenes: PLATE_SPIN_SCENES,
  },
  'three-wall-ping-pong': {
    id: 'three-wall-ping-pong',
    title: 'Angry Stickman: The Three-Wall Ping-Pong Shot',
    subtitle: 'The 30-Second Trickshot Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: THREE_WALL_PING_PONG_PROMPT,
    scenes: THREE_WALL_PING_PONG_SCENES,
  },
  'cup-in-cup': {
    id: 'cup-in-cup',
    title: 'Angry Stickman: The Impossible Cup-in-Cup Shot',
    subtitle: 'The 30-Second Cup Trickshot Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: CUP_IN_CUP_PROMPT,
    scenes: CUP_IN_CUP_SCENES,
  },
  'rubber-band': {
    id: 'rubber-band',
    title: 'Angry Stickman: The Rubber Band Trickshot',
    subtitle: 'The 30-Second Rubber Band Trickshot Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: YO_BANDIT_PROMPT,
    scenes: YO_BANDIT_SCENES,
  },
  'desert-island': {
    id: 'desert-island',
    title: 'Angry Stickman: Stranded on a Desert Island',
    subtitle: 'The 30-Second Survival Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: DESERT_ISLAND_PROMPT,
    scenes: DESERT_ISLAND_SCENES,
  },
  'shrinking-remote': {
    id: 'shrinking-remote',
    title: 'Angry Stickman: The Shrinking Remote Control',
    subtitle: 'The 30-Second Bedroom Shrink Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: SHRINKING_REMOTE_PROMPT,
    scenes: SHRINKING_REMOTE_SCENES,
  },
  'magic-paintbrush': {
    id: 'magic-paintbrush',
    title: 'Angry Stickman: The Magic Paintbrush',
    subtitle: 'The 30-Second Magic Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: MAGIC_PAINTBRUSH_PROMPT,
    scenes: MAGIC_PAINTBRUSH_SCENES,
  },
  'yo-yo-revenge': {
    id: 'yo-yo-revenge',
    title: 'Angry Stickman: The Yo-Yo Revenge',
    subtitle: 'The 30-Second Yo-Yo Trickshot Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Modern Pop Color · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: YO_YO_REVENGE_PROMPT,
    scenes: YO_YO_REVENGE_SCENES,
  },
  'coin-flip': {
    id: 'coin-flip',
    title: 'Angry Stickman vs. The Impossible Coin Flip',
    subtitle: 'The 30-Second Glass-and-Coin Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Sound Effects Only · Original Comedy Score',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: COIN_FLIP_PROMPT,
    scenes: COIN_FLIP_SCENES,
  },
  'dart-shot': {
    id: 'dart-shot',
    title: 'Angry Stickman vs. The Impossible Dart Shot',
    subtitle: 'The 30-Second Bullseye Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Sound Effects Only · Original Comedy Score',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: DART_SHOT_PROMPT,
    scenes: DART_SHOT_SCENES,
  },
  'ping-pong-revenge': {
    id: 'ping-pong-revenge',
    title: 'The Ping-Pong Revenge',
    subtitle: 'The 30-Second One-Table Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Sound Effects Only · Original Comedy Score',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: PING_PONG_PROMPT,
    scenes: PING_PONG_SCENES,
  },
  'trick-shot-champion': {
    id: 'trick-shot-champion',
    title: 'Angry Stickman: Trick-Shot Champion',
    subtitle: 'The 60-Second Championship Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Sound Effects Only · Original Pop Score',
    duration: 60,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: TRICK_SHOT_PROMPT,
    scenes: TRICK_SHOT_SCENES,
  },
  'pop-star': {
    id: 'pop-star',
    title: 'Max, Rex & Beep — Pop Star',
    subtitle: '58-Second Vertical Pop Comedy',
    tagline: 'Modern 2D Cartoon Concert Short · Original Pop Instrumental',
    duration: 58,
    hasAudioDialogue: false,
    hasCaptions: true,
    masterPrompt: POP_STAR_PROMPT,
    scenes: POP_STAR_SCENES,
  },
  'paper-ball-part4': {
    id: 'paper-ball-part4',
    title: 'The Paper Ball Ricochet — Episode 4',
    subtitle: 'The Angry Stickman vs The Basketball Machine',
    tagline: '30-Second YouTube Shorts Comedy · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: false,
    masterPrompt: PAPER_BALL_PART4_PROMPT,
    scenes: PAPER_BALL_PART4_SCENES,
  },
  'paper-ball-part3': {
    id: 'paper-ball-part3',
    title: 'The Paper Ball Ricochet — Part 3',
    subtitle: 'The Long Walk to the Basketball Court',
    tagline: '30-Second Minimalist 2D Vector Comedy · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: false,
    masterPrompt: PAPER_BALL_PART3_PROMPT,
    scenes: PAPER_BALL_PART3_SCENES,
  },
  'paper-ball-sequel': {
    id: 'paper-ball-sequel',
    title: 'The Paper Ball Ricochet — Episode 2',
    subtitle: 'Sequel: Five Misses & One Over-Powered Launcher',
    tagline: '30-Second Minimalist 2D Vector Comedy · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: false,
    masterPrompt: PAPER_BALL_SEQUEL_PROMPT,
    scenes: PAPER_BALL_SEQUEL_SCENES,
  },
  'paper-ball-30': {
    id: 'paper-ball-30',
    title: 'The Paper Ball Ricochet — 30s',
    subtitle: 'Eight-Beat Slapstick Director\'s Cut',
    tagline: '30-Second Minimalist 2D Vector Comedy · Sound Effects Only',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: false,
    masterPrompt: PAPER_BALL_30_PROMPT,
    scenes: PAPER_BALL_30_SCENES,
  },
  'paper-ball': {
    id: 'paper-ball',
    title: 'The Paper Ball Ricochet — 10s',
    subtitle: 'Original Five-Beat Cut',
    tagline: 'Minimalist 2D Vector Comedy · No Dialogue · Pure Visual Slapstick',
    duration: 10,
    hasAudioDialogue: false,
    hasCaptions: false,
    masterPrompt: PAPER_BALL_PROMPT,
    scenes: PAPER_BALL_SCENES,
  },
  'shadow-quit': {
    id: 'shadow-quit',
    title: 'What If Your Shadow Quit?',
    subtitle: 'Workplace Grievance Pantomime',
    tagline: 'Minimalist 2D Vector Comedy with Deadpan Voice-Over',
    duration: 10,
    hasAudioDialogue: true,
    hasCaptions: true,
    masterPrompt: SHADOW_QUIT_PROMPT,
    scenes: SHADOW_QUIT_SCENES,
  },
};

export interface StudioConfig {
  activeProject: ProjectId;
  canvasTheme: CanvasTheme;
  vividAccent: string;
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
  activeProject: 'shrinking-remote', // The latest short is the default film
  canvasTheme: 'black-on-white', // Style 1A: Black on White (toggleable to Style 1B: White on Black)
  vividAccent: '#ef4444', // Vivid Red as seen in reference image for emotions, risks & cages
  accentColor: '#000000', // Minimalist Monochrome
  enableVoiceOver: false,
  enableSFX: true,
  voiceRate: 0.88,
  voicePitch: 0.92,
  voiceVolume: 1.0,
  showCaptions: true, // Captions on by default for explainer
  showSafeZones: false,
  fpsMode: 24,
  customVO1: 'What if your shadow quit?',
  customVO2: 'HR has been notified.',
  customEndCaption: 'YOUR SHADOW HAS RIGHTS.',
};

// Aliases for backwards compatibility
export const SCENES = PAPER_BALL_SCENES;
export const MASTER_PROMPT = PAPER_BALL_PROMPT;
