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

export type ProjectId =
  | 'coin-flip'
  | 'dart-shot'
  | 'ping-pong-revenge'
  | 'trick-shot-champion'
  | 'pop-star'
  | 'paper-ball-part4'
  | 'paper-ball-part3'
  | 'paper-ball-sequel'
  | 'paper-ball-30'
  | 'paper-ball'
  | 'shadow-quit';

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

export const PROJECTS: Record<ProjectId, ProjectDef> = {
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
  activeProject: 'coin-flip', // The latest short is the default film
  accentColor: '#e11d48',
  enableVoiceOver: false,
  enableSFX: true,
  voiceRate: 0.88,
  voicePitch: 0.92,
  voiceVolume: 1.0,
  showCaptions: false, // Strict: no captions, no text for paper-ball
  showSafeZones: false,
  fpsMode: 24,
  customVO1: 'What if your shadow quit?',
  customVO2: 'HR has been notified.',
  customEndCaption: 'YOUR SHADOW HAS RIGHTS.',
};

// Aliases for backwards compatibility
export const SCENES = PAPER_BALL_SCENES;
export const MASTER_PROMPT = PAPER_BALL_PROMPT;
