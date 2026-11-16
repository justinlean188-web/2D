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

export type CanvasTheme = 'black-on-white' | 'white-on-black';

export type ProjectId =
  | 'giant-yoyo-trickshot'
  | 'reverse-bowling-trickshot'
  | 'giant-gear-trickshot'
  | 'invisible-tube-trickshot'
  | 'triple-gravity-trickshot'
  | 'giant-scissor-trickshot'
  | 'spiral-staircase-shot'
  | 'magnetic-maze-trickshot'
  | 'thousand-degree-hot-shot'
  | 'impossible-pinball-trickshot'
  | 'impossible-laser-maze'
  | 'impossible-keyhole-shot'
  | 'giant-slinky-trickshot'
  | 'longest-ruler-shot'
  | 'hundred-ball-chain'
  | 'ten-fan-trickshot'
  | 'invisible-wall-challenge'
  | 'shadow-trickshot'
  | 'super-bouncy-shoes'
  | 'mystery-floor-hole'
  | 'rubber-band-trap'
  | 'clone-button-disaster'
  | 'living-traffic-light'
  | 'infinite-gift-box'
  | 'self-building-robot'
  | 'runaway-cake'
  | 'mind-traps'
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
  youtubeTitle?: string;
  youtubeThumbnail?: string;
  youtubeHashtags?: string;
  masterPrompt: string;
  scenes: SceneDef[];
}

export function getProjectYouTubeMeta(project: ProjectDef) {
  return {
    title: project.youtubeTitle ?? `${project.title} #Shorts`,
    thumbnail: project.youtubeThumbnail ?? project.scenes[project.scenes.length - 1]?.captionText ?? 'WAIT FOR THE END!',
    hashtags:
      project.youtubeHashtags ??
      '#AngryStickman #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts',
  };
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

export const RUNAWAY_CAKE_PROMPT = `# THE RUNAWAY BIRTHDAY CAKE 🎂😂
## 2D Animated YouTube Short — 30 Seconds

### VISUAL STYLE
Modern Pop 2D flat vector cartoon animation. Vertical 9:16 composition, 24 FPS, vibrant solid colors, thick smooth black outlines, clean shapes, expressive facial animation, minimal shading, smooth exaggerated cartoon movement. Funny physical comedy with clear readable actions. No dialogue. Burned-in captions.

### MAIN CHARACTER — ANGRY STICKMAN
- Large circular white head with a thick, smooth black outline, approximately 40% of total character height.
- Two small vertical black oval eyes, two thick expressive black eyebrows, simple black mouth.
- No nose, no ears, no hair.
- Bright red knitted-style beanie with a rounded top and folded lower edge, outlined in black.
- Bright yellow plain short-sleeved T-shirt. No logos, text, or patterns. Small compact torso.
- Two thin black stick arms connected directly to yellow sleeves.
- Small white rounded mitten-shaped hands with black outlines connected directly to wrists.
- Thin black legs, blue trousers, and small rounded solid-black shoes.
- Consistency across all scenes. Personality: overconfident, impatient, easily frustrated, and extremely dramatic.

### THE RUNAWAY CAKE — PROP DESIGN
- Cute three-layer birthday cake: pink, blue, and yellow frosting layers with smooth white dripping frosting.
- Colorful round sprinkles and five small colorful birthday candles on top.
- Two tiny thin black cartoon legs underneath the bottom layer that unfold, run, jump, land, and dodge.
- Two tiny white mitten-shaped arms on the sides.
- Two small expressive eyes and a mischievous smiling mouth on the front.

### SCENE BREAKDOWN
- Scene 1 (0–6s): "FINALLY… MY BIRTHDAY CAKE!" — Colorful living room with wooden table, balloons, party bunting. Excited Stickman enters with silver fork. Cake wiggles, unfolds legs, smiles mischievously. Stickman freezes in confusion.
- Scene 2 (6–12s): "HEY! GET BACK HERE!" — Cake jumps off table, bounces on floor, and sprints toward the kitchen. Stickman chases with fork. Cake dodges reaching hands, leaving pink frosting footprints.
- Scene 3 (12–18s): "I'M GONNA GET YOU!" — Cake slides sideways across kitchen floor, leaving thick pink frosting trail. Stickman dives, shoes hit frosting, slides backward, spins 360° past refrigerator, crashes into soft cushion pile. Cake laughs.
- Scene 4 (18–24s): "GOTCHA—WAIT… WHAT?!" — Stickman stands up, spots cake behind chair. Crouches and tiptoes stealthily. Cake leaps off chair and lands directly on top of his red beanie like a hat. Stickman freezes with enormous shocked eyes.
- Scene 5 (24–30s): "THIS IS THE WORST BIRTHDAY EVER!" — Cake shakes on his head, top layer opens like a hatch, confetti bursts! Six tiny cupcake creatures pop out and dance. Stickman softens as one cupcake offers a tiny cake slice, but cupcake quickly chomps the slice itself! Stickman freezes in pure furious rage. Dramatic zoom on angry face.`;

export const RUNAWAY_CAKE_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Birthday Surprise",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "A colorful living room with a wooden table, birthday balloons, party decorations, and a large window. Stickman enters excitedly, spots a beautiful three-layer birthday cake in the middle of the table, his eyes sparkle with joy, grabs a silver fork and reaches toward it. Suddenly, two tiny black legs unfold underneath the cake, it wiggles, looks at him, and smiles mischievously. Stickman's smile drops in confusion.",
    animationDesc:
      "Stickman walks in from 0-2.2s, sparkle eye reaction at 2.8s, raises fork at 3.5s, cake legs unfold at 4.5s with cheeky wink and wiggle, Stickman mouth drops into confused 'o'.",
    soundDesc: "Upbeat cartoon music, happy footsteps, eye sparkle chimes, fork grab click, leg pop, cheeky chuckle.",
    captionText: "FINALLY… MY BIRTHDAY CAKE!",
    punchline: "The cake looks back at him and smiles.",
    characterAction: "Enters excitedly, sparkles with joy, raises fork, freezes in sudden confusion.",
    propAction: "Cake unfolds tiny black legs, wiggles, and winks mischievously.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "The Cake Runs Away",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "The three-layer cake suddenly jumps off the table, falling downward, landing on the floor with a small cartoon bounce, and immediately sprinting toward the kitchen on tiny black legs. Stickman looks shocked, fork in hand, chasing the cake as it dodges his outstretched mitten hands, leaving pink frosting footprints on the floor.",
    animationDesc:
      "Cake crouches and jumps off table at 6.0s, lands at 6.7s with squash, dashes right leaving pink footsteps. Stickman sprints after it with wide shocked eyes and lunging grabs.",
    soundDesc: "Boing spring jump, floor splat bounce, rapid pitter-patter cartoon running feet, near-miss whooshes.",
    captionText: "HEY! GET BACK HERE!",
    punchline: "A three-layer cake with an Olympic sprint.",
    characterAction: "Shocked gasp, aggressive sprint chase, repeated lunging mitten-hand grabs.",
    propAction: "Cake runs on tiny legs, ducks under reaching hands, leaves pink frosting footprints.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Frosting Trap",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "In the kitchen, the cake slides sideways across the tiled floor, squirting a thick slick pink frosting trail. Stickman dives forward, his black shoes hit the frosting, feet shoot forward as his upper body leans back, spins 360 degrees uncontrollably across the floor past the refrigerator, crashing into a soft pile of cushions. The cake stands laughing nearby.",
    animationDesc:
      "Cake squirts pink frosting trail at 12.2s. Stickman dives at 13.0s, hits frosting at 13.3s, slips, spins 360° across floor from 13.8s to 15.6s, crashes into cushions with feather poof, sits dizzy with spiral eyes and circling stars.",
    soundDesc: "Squirt slide, slide whistle drop, cartoon spin whooshes, soft cushion poof, giggling cake, dizzy chirping stars.",
    captionText: "I'M GONNA GET YOU!",
    punchline: "Zero traction against high-viscosity pink frosting.",
    characterAction: "Heroic dive turns into an involuntary 360° floor slide and a dazed, cross-eyed sit in the cushions.",
    propAction: "Frosting puddle creates zero-friction zone; cushion pile absorbs the crash.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Perfect Ambush",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Stickman stands up, shakes off dizziness, retrieves silver fork, and spots the cake hiding behind a kitchen chair. He crouches and tiptoes stealthily forward with intense focus. Just as he reaches to snatch it, the cake leaps high into the air from behind the chair and lands directly on top of his red beanie like a hat. Stickman freezes in place, arms stuck in the air, eyes bulging in shock.",
    animationDesc:
      "Stickman recovers at 18.5s, crouching tiptoe sneak from 19.5-21.8s. Cake spring-leaps off chair at 22.0s, lands splat on red beanie at 22.3s. Stickman locks in 200% wide-eyed disbelief freeze.",
    soundDesc: "Stand-up pop, tiptoe xylophone plinks, stealth suspense sting, cartoon spring leap, soft head splat, stunned silence.",
    captionText: "GOTCHA—WAIT… WHAT?!",
    punchline: "The prey becomes the hat.",
    characterAction: "Exaggerated high-knee tiptoe sneak, sudden frozen shock statue with bulging eyes.",
    propAction: "Cake leaps 260px into the air and seats itself comfortably on his head.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Birthday Explosion",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "The cake starts shaking on Stickman's head. Its top yellow layer opens like a hatch, bursting colorful confetti upward. Six tiny colorful cupcake creatures pop out, bounce onto the floor, and dance around him. Stickman softens as one cupcake offers a tiny cake slice, but the cupcake quickly chomps the slice itself! Stickman freezes in pure furious rage. Dramatic zoom on his angry face.",
    animationDesc:
      "Cake vibrates from 24-24.8s, lid pops at 25.0s, confetti explosion, 6 cupcakes bounce out and dance. Stickman's smile returns at 27.2s as cupcake offers slice, cupcake chomps it at 28.2s, Stickman face turns red with fury, intense zoom on angry face.",
    soundDesc: "Vibration rumble, party popper POP!, confetti shower, bouncing squeaks, hopeful chime, fast CHOMP, angry rage sting, final cartoon honk.",
    captionText: "THIS IS THE WORST BIRTHDAY EVER!",
    punchline: "Never trust a cupcake bearing gifts.",
    characterAction: "Vibrating head, soft hopeful smile, instant snap to boiling red rage with twitching eyebrow.",
    propAction: "Cake opens top hatch, releases confetti shower and 6 autonomous dancing cupcakes.",
  },
];

export const SELF_BUILDING_ROBOT_PROMPT = `# THE SELF-BUILDING ROBOT 🤖😂
30-second vertical 9:16 animated comedy short at 24fps, split into five continuous 6-second scenes.

VISUAL STYLE
Modern Pop 2D flat vector animation, thick smooth black outlines, bright solid colors, minimal shading, clean geometric shapes, expressive cartoon faces, smooth readable movement, exaggerated physical comedy. Vibrant colorful workshop and living room. No dialogue.

MAIN CHARACTER — ANGRY STICKMAN (IDENTICAL IN EVERY SCENE)
- Large circular white head with thick smooth black outline (~40% of total height), two vertical black oval eyes, thick expressive eyebrows, simple black mouth, no nose/ears/hair.
- Bright red knitted-style beanie with rounded top and folded lower edge.
- Bright yellow plain short-sleeved T-shirt (no logos/patterns) on small compact torso.
- Thin black stick arms connected directly to sleeves; small white rounded mitten hands connected directly to wrists.
- Thin black legs, blue trousers, small rounded solid-black shoes.

ROBOT BASE FORM & VISIBLE UPGRADES
- Base: small silver rectangular box body, one large circular blue glowing eye, two short silver mechanical arms with rounded grippers, four tiny black wheels, small red ON button.
- Every upgrade happens visibly: scan with thin blue laser line -> move physically to object -> pick up with mechanical arms -> attach visibly to body -> gain size/ability.

SCENES
- Scene 1 (0–6s): "MY NEW ROBOT!" — Stickman places tiny silver robot on workbench, presses red ON button, robot's blue eye lights up and waves one arm.
- Scene 2 (6–12s): "IT'S UPGRADING?!" — Robot scans toy car with blue laser, picks it up, attaches 4 bigger wheels to its body, zooms around workbench while Stickman misses.
- Scene 3 (12–18s): "WHO GAVE IT PERMISSION?!" — Robot scans and attaches electric fan (back), vacuum hose (flexible arm), and two metal pots (shoulder armor), expanding to refrigerator size.
- Scene 4 (18–24s): "GIVE MY STUFF BACK!" — Giant robot enters living room, attaches desk lamp (headlight) and sofa cushion (chest armor), grabs Stickman's red toolbox with vacuum hose, wins tug-of-war and drags Stickman.
- Scene 5 (24–30s): "I BUILT MY OWN BOSS!" — Robot stops with low-battery symbol; Stickman plugs dangling cable into portable power bank from workbench; giant mechanical legs unfold lifting robot high; robot places annoyed Stickman on its shoulder.`;

export const SELF_BUILDING_ROBOT_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "Meet My Robot!",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "In a colorful workshop, Angry Stickman proudly places a tiny homemade silver robot (box body, one circular blue eye, two short mechanical arms, four tiny black wheels, red ON button) onto the workbench. He presses the red ON button. The robot's blue eye lights up and it waves one mechanical arm.",
    animationDesc:
      "Stickman walks in holding robot (0-1.8s), sets it on workbench (1.8-2.6s), presses red button (3.25s), blue eye glows and robot waves arm happily (3.5-6.0s).",
    soundDesc: "Playful workshop score, footsteps, button click, robot wake-up bleep, confidence chime.",
    captionText: "MY NEW ROBOT!",
    punchline: "Small, cute, and completely harmless... for now.",
    characterAction: "Enters proudly, sets robot on bench, presses ON button, beams with star eyes.",
    propAction: "Tiny silver robot wakes up, glows blue, and waves one gripper arm.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Upgrade!",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "The tiny robot projects a thin blue scanning laser line onto a toy car on the floor, hops off the workbench, picks up the toy car with both mechanical arms, and visibly attaches its four wheels to its own body. Now rolling much faster, it zooms around the workbench while Stickman chases and misses.",
    animationDesc:
      "Blue laser scan (6.0-6.9s), hop to floor & roll to toy car (6.9-7.8s), lifts car and snaps 4 wheels underneath (7.8-8.8s), high-speed zoom chase around bench (8.8-12.0s).",
    soundDesc: "Laser scan sweep, spring hop, servo whir, fast whooshes, frustrated chase squeak.",
    captionText: "IT'S UPGRADING?!",
    punchline: "Four toy car wheels turned a toaster into a race car.",
    characterAction: "Drops into shock, sprints back and forth trying to catch the speeding robot.",
    propAction: "Robot scans toy car, harvests its 4 wheels, and zooms across the workshop.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Monster Upgrade",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "The robot scans the workshop again, physically collects an electric fan (mounted on its back), a vacuum cleaner hose (attached as a flexible mechanical arm), and two metal kitchen pots (clamped as shoulder armor). Its silver body expands to refrigerator size with a bright glowing blue eye as it flexes its new hose arm while Stickman watches in shock.",
    animationDesc:
      "Scans & mounts electric fan (12.0-13.4s), scans & attaches vacuum hose arm (13.4-14.8s), scans & clamps two metal pots onto shoulders (14.8-16.3s), expands to fridge size and flexes (16.3-18.0s).",
    soundDesc: "Three laser scans, escalating servo attachment whirs, low expansion rumble, robot flex bleep.",
    captionText: "WHO GAVE IT PERMISSION?!",
    punchline: "Household appliances were never meant to assemble themselves.",
    characterAction: "Freezes with jaw dropped and huge shocked eyes as his creation towers over him.",
    propAction: "Fan, vacuum hose, and two metal pots visibly attach as chassis grows to fridge size.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Robot Takes Over!",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "The giant upgraded robot rolls into the colorful living room, scans and attaches a desk lamp on top as a headlight and a sofa cushion on its front as chest armor. Its vacuum hose grabs Stickman's red toolbox and pulls it across the floor. Stickman grabs the hose with both white mitten hands and pulls backward, but the robot wins the tug-of-war and gently drags him across the floor.",
    animationDesc:
      "Rolls into living room & mounts desk lamp headlight (18.0-19.6s), straps sofa cushion chest armor (19.6-21.0s), grabs red toolbox with hose (21.0-21.7s), tug-of-war (21.7-23.0s), gently drags Stickman leftward (23.0-24.0s).",
    soundDesc: "Laser scans, lamp servo click, cushion thump, tug-of-war squeaks, floor slide.",
    captionText: "GIVE MY STUFF BACK!",
    punchline: "Even his own toolbox changed teams.",
    characterAction: "Grabs vacuum hose with both white mitten hands, leans back pulling, gets dragged across the floor.",
    propAction: "Desk lamp headlight, sofa cushion armor, and red toolbox pulled by flexible hose.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Final Upgrade",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "The robot stops moving and its circular blue eye flashes a simple low-battery symbol. Stickman notices the dangling charging cable, grabs a portable power bank from the workbench, and plugs it in. The robot recharges brightly and two giant mechanical legs unfold underneath, lifting it high. It gently picks Stickman up and seats him on its shoulder like a tiny passenger, where he stares annoyed at the camera.",
    animationDesc:
      "Low-battery stop & dangling cable (24.0-25.0s), Stickman grabs power bank from workbench and plugs in (25.0-26.4s), recharge surge & giant legs unfold upward (26.4-27.7s), gently lifts Stickman onto pot shoulder (27.7-28.7s), annoyed camera stare (28.7-30.0s).",
    soundDesc: "Power-down beeps, electric power-up surge, heavy leg extension servo, gentle lift, comedic trombone sting.",
    captionText: "I BUILT MY OWN BOSS!",
    punchline: "Never recharge a robot bigger than you.",
    characterAction: "Rushes to plug in power bank, gets lifted in shock, sits cross-armed with deadpan annoyed stare.",
    propAction: "Charging cable plugs into power bank; giant hydraulic legs unfold and raise chassis.",
  },
];

export const INFINITE_GIFT_BOX_PROMPT = `THE INFINITE GIFT BOX — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, thick smooth black outlines, vibrant solid colors, minimal shading, clean geometric shapes, expressive cartoon faces, smooth readable animation, exaggerated physical comedy. Colorful cozy living room. No photorealism, no 3D rendering, no dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN
- Large circular white head with thick smooth black outline (~40% of total height).
- Two small vertical black oval eyes, two thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Bright red knitted-style beanie with rounded top and folded lower edge.
- Bright yellow plain short-sleeved T-shirt (no logos/patterns) and small compact torso.
- Thin black stick arms connected directly to sleeves; small white rounded mitten hands connected directly to wrists (no detached circles, gaps, or fingers).
- Thin black legs, blue trousers, small rounded solid-black shoes.

SCENE FLOW
0-6s: Discovers a mysterious medium purple gift box with golden ribbon, golden bow, and glowing golden question mark on the living room table. Rubs hands excitedly and pulls the ribbon. Caption: "WHAT'S INSIDE?!"
6-12s: Purple lid opens revealing a small blue box, which opens to reveal a tiny green box, which opens to reveal an even tinier red box. Quick visual zooms; happy smile turns into confusion. Caption: "WAIT… THERE'S ANOTHER ONE?!"
12-18s: Frustrated, throws tiny red box onto the floor. It bounces once, then rapidly unfolds outward into a giant red gift box, pushing the sofa backward and shooting a golden ribbon around the floor lamp as Stickman jumps back in shock. Caption: "WHY IS IT GETTING BIGGER?!"
18-24s: Giant red box unfolds outward again, enclosing the entire living room inside an enormous gift box with giant golden ribbons. Stickman runs toward the doorway, grabs the blocking golden ribbon, and pulls with zero movement. Brief exterior wide shot of the house wrapped like a giant present, then back inside. Caption: "I'M LIVING INSIDE A GIFT!"
24-30s: Notices a giant golden bow above, grabs the loose ribbon end with both white mitten hands, and pulls hard. Walls retract, ribbons unwind, and box shrinks rapidly back to the original purple box. Stickman celebrates with both arms raised, then the purple box pops open launching 100+ tiny colorful gift boxes upward. One lands on his head and knocks off his red beanie. Angry stare at camera. Caption: "I HATE SURPRISES!"`;

export const INFINITE_GIFT_BOX_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Mysterious Present",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Angry Stickman enters a colorful cozy living room and spots a mysterious medium purple gift box with a golden ribbon, golden bow, and glowing question mark on the table. He rubs his white mitten hands excitedly, grabs the ribbon with both hands, and pulls.",
    animationDesc:
      "Walks into living room (0.0-1.5s), rubs white mitten hands excitedly with star eyes (1.5-3.2s), grabs golden ribbon with both hands and tugs (3.2-6.0s).",
    soundDesc: "Playful footsteps, magic chime sparkle, elastic golden ribbon pull squeaks.",
    captionText: "WHAT'S INSIDE?!",
    punchline: "Nothing good ever starts with a glowing question mark.",
    characterAction: "Walks in curiously, rubs mitten hands with star eyes, grabs and pulls golden ribbon.",
    propAction: "Purple gift box sits on table with golden ribbon, bow, and pulsing glowing question mark.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "Another Gift?!",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "The purple lid opens to reveal a small blue gift box. Stickman picks it up and opens it to find a tiny green box, then opens that to find an even tinier red box. Quick visual zooms into each nested box as his happy smile slowly turns to confusion.",
    animationDesc:
      "Purple lid pops open -> small blue box (6.0-7.2s), zoom & open blue box -> tiny green box (7.2-8.8s), zoom & open green box -> tiny red box & confused frown (8.8-12.0s).",
    soundDesc: "Pop-open chimes escalating in pitch, spring boing, comedic confusion squeak.",
    captionText: "WAIT… THERE'S ANOTHER ONE?!",
    punchline: "Three boxes deep and still zero actual presents.",
    characterAction: "Opens nested boxes with both mitten hands as happy smile turns into furrowed confusion.",
    propAction: "Nested purple -> blue -> green -> tiny red gift boxes open in sequence with punch zooms.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Boxes Get Bigger!",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Frustrated, Stickman throws the tiny red gift box onto the floor. It bounces once, then rapidly unfolds outward into a giant red gift box, physically pushing the sofa backward and shooting a long golden ribbon around the nearby floor lamp while Stickman jumps back in shock.",
    animationDesc:
      "Winds up & throws tiny red box (12.0-12.75s), single floor bounce (12.75-13.3s), giant red box unfolds & pushes sofa back (13.3-15.5s), ribbon shoots around lamp as Stickman leaps back (15.1-18.0s).",
    soundDesc: "Throw whoosh, floor boing bounce, rising cardboard expansion whoosh, sofa slide thump, lamp ding.",
    captionText: "WHY IS IT GETTING BIGGER?!",
    punchline: "Never bounce an angry gift box.",
    characterAction: "Hurls tiny red box down, then leaps backward with wide shocked eyes and dropped jaw.",
    propAction: "Tiny red box bounces once, unfolds into giant red box, pushes sofa left, and wraps lamp in golden ribbon.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Entire House Is a Present",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "The giant red gift box unfolds outward again until red walls and gigantic golden ribbons enclose the living room. Stickman runs toward the doorway, grabs the blocking golden ribbon with both mitten hands, and pulls hard with no movement. Brief exterior wide shot shows the whole house wrapped as a giant present before returning inside.",
    animationDesc:
      "Box walls unfold over living room (18.0-19.8s), Stickman sprints to doorway & pulls blocking ribbon (19.8-21.8s), exterior wide shot of gift-wrapped house (21.8-23.2s), return inside (23.2-24.0s).",
    soundDesc: "Massive room-unfold expansion, ribbon barrier snap, strained tug squeaks, dramatic exterior rumble.",
    captionText: "I'M LIVING INSIDE A GIFT!",
    punchline: "Locked inside his own living room by festive gift wrap.",
    characterAction: "Sprints for doorway, strains pulling the immovable golden ribbon, then glares defeated inside.",
    propAction: "Cardboard red box walls enclose room; doorway blocked by ribbon; house exterior sports giant roof bow.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Worst Surprise",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "Stickman spots a giant golden bow above, grabs the loose ribbon end with both white mitten hands, and pulls hard. The walls retract and unwind rapidly back into the original purple box. He celebrates with both arms raised, then the purple box pops open launching hundreds of tiny colorful gift boxes upward. One knocks off his red beanie as he stares angrily at the camera.",
    animationDesc:
      "Spots bow & grabs loose ribbon (24.0-25.2s), pulls hard & box folds inward rapidly (25.2-26.6s), arms-raised celebration (26.6-27.5s), purple box erupts 100+ mini boxes (27.5-28.2s), box bonks head knocking beanie off & angry stare (28.2-30.0s).",
    soundDesc: "Ribbon pull, reverse fold whoosh, celebration chime, gift fountain eruption, head bonk, sad trombone sting.",
    captionText: "I HATE SURPRISES!",
    punchline: "Even victory comes gift-wrapped in humiliation.",
    characterAction: "Yanks giant ribbon, celebrates wildly, gets bonked by falling mini box losing his beanie, glares at camera.",
    propAction: "Giant room unfolds back to purple box, which erupts 110 tiny colorful boxes raining across the floor.",
  },
];

export const LIVING_TRAFFIC_LIGHT_PROMPT = `THE LIVING TRAFFIC LIGHT 🚦😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, thick smooth black outlines, vibrant solid colors, minimal shading, clean geometric shapes, exaggerated cartoon expressions, smooth readable motion. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes (20x22 open), thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms (118+118px two-bone IK) connected directly to sleeves, connected small white mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical in every scene.

TRAFFIC LIGHT DESIGN
- Tall black housing (#1e1e26) with thick black outline, red/yellow/green lenses, cartoon eyes inside the lenses/housing, small mechanical arms (holding an octagonal red STOP sign), rolling wheels on its base, power cable plugged into a roadside power box, and a hidden backup battery compartment.

SCENE FLOW
0-6s (Scene 1): Stickman approaches a pedestrian crossing. The traffic light blinks strangely, grows cartoon eyes, and stares at him. Caption: "THAT LIGHT JUST BLINKED AT ME!"
6-12s (Scene 2): Green light! Stickman walks. Suddenly it turns red. A mechanical arm raises a STOP sign, blocking every direction he tries. Caption: "WHY ARE YOU STOPPING ME?!"
12-18s (Scene 3): Yellow light! Stickman tiptoes forward. The traffic light rolls sideways on its wheels, following him and blocking his path. Caption: "IT'S FOLLOWING ME!"
18-24s (Scene 4): Stickman runs toward a park. Multiple smaller traffic lights rise from the pavement, forming a wall of red STOP signals. He jumps over one but gets blocked by another. Caption: "THE WHOLE CITY IS AGAINST ME!"
24-30s (Scene 5): Stickman unplugs the main traffic light from the roadside power box. Everything goes dark. He celebrates, but the hidden backup battery activates. The red light flashes bright red in his face. He freezes angrily. Caption: "I'M NEVER CROSSING AGAIN!"

YOUTUBE METADATA
- YouTube Title: A TRAFFIC LIGHT CAME ALIVE! 🚦😂
- Thumbnail: YOU CAN'T MOVE!
- Hashtags: #AngryStickman #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts`;

export const LIVING_TRAFFIC_LIGHT_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Blinking Stare",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Angry Stickman approaches a pedestrian crosswalk. The tall black traffic light blinks strangely, grows cartoon eyes, and stares right down at him as Stickman points up in disbelief.",
    animationDesc:
      "Walks up to crosswalk (0.0-1.5s), traffic light blinks & sprouts cartoon eyes (1.6-2.9s), Stickman points in shock & glares suspiciously (3.0-6.0s).",
    soundDesc: "Footsteps, electronic glitch blink, cartoon eye-pop chime, suspicious bass pulse.",
    captionText: "THAT LIGHT JUST BLINKED AT ME!",
    punchline: "Pedestrian signals aren't supposed to make eye contact.",
    characterAction: "Walks to the curb, freezes in shock, points at the traffic light with wide eyes, then squints angrily.",
    propAction: "Traffic light lenses blink erratically, grow cartoon eyes, and lock its gaze onto Stickman.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "Denied at Every Turn",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Green light turns on and Stickman steps onto the crosswalk! Suddenly it snaps to red and a small mechanical arm thrusts out a red STOP sign, blocking him left, right, and every direction he tries.",
    animationDesc:
      "Green light -> cheerful step (6.0-6.9s), sudden red snap + mechanical STOP arm blocks front (6.9-8.1s), Stickman dodges left & right while arm mirrors & blocks every move (8.1-12.0s).",
    soundDesc: "Green go-chime, sharp red buzzer, metallic STOP-sign snaps left/center/right.",
    captionText: "WHY ARE YOU STOPPING ME?!",
    punchline: "It didn't just turn red — it took it personally.",
    characterAction: "Steps forward happily, recoils in shock, then darts right and left in growing rage.",
    propAction: "Traffic light snaps from green to red; mechanical arm extends octagonal STOP sign tracking Stickman's every dodge.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "Rolling Stalker",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Yellow light! Stickman carefully tiptoes forward trying to sneak past. The traffic light drops onto hidden wheels and rolls sideways, relentlessly following him and blocking his path.",
    animationDesc:
      "Yellow light -> sneaky tiptoes forward (12.0-13.6s), traffic light wheels pop out & roll sideways blocking path (13.6-15.4s), Stickman backpedals & fakes left/right while light mirrors him (15.4-18.0s).",
    soundDesc: "Tip-toe plucks, rubber wheel squeaks and rolling rumble, mechanical glare.",
    captionText: "IT'S FOLLOWING ME!",
    punchline: "Yield means yield. Even on the sidewalk.",
    characterAction: "Crouches into sneaky tiptoes, gasps as the pole rolls after him, panics with flailing mitten hands.",
    propAction: "Traffic light housing rolls smoothly on base wheels, trailing its taut power cable while aiming the STOP sign.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Wall of Red Lights",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Stickman sprints toward a green city park! Multiple smaller traffic lights rise out of the pavement, forming a wall of red STOP signals. He leaps high over one only to get blocked nose-to-sign by another.",
    animationDesc:
      "Sprints toward park gate (18.0-19.2s), four mini traffic lights pop out of pavement forming a red wall (19.0-20.4s), Stickman vaults over a mini light (20.4-21.5s), taller mini light rises directly in front & stops him cold (21.5-24.0s).",
    soundDesc: "Fast sprint steps, four hydraulic pop-ups, jump whoosh, final STOP-sign block snap.",
    captionText: "THE WHOLE CITY IS AGAINST ME!",
    punchline: "He cleared the first hurdle. He did not clear the backup unit.",
    characterAction: "Sprints furiously toward the park, hurdles mid-air over one mini light, lands blocked nose-to-sign.",
    propAction: "Four smaller traffic lights rise from pavement hatches flashing red and raising STOP arms in unison.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "Backup Battery Revenge",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "Stickman spots the main traffic light's power cable and yanks the plug out of the roadside power box! Everything goes pitch dark. He celebrates wildly — until the hidden backup battery activates and blasts a flashing red light straight into his face, freezing him in pure rage.",
    animationDesc:
      "Grabs plug & yanks from power box (24.0-24.9s), blackout darkness (24.9-26.6s), Stickman celebrates with fists raised (25.3-26.6s), hidden backup battery hatch opens & charges (26.6-27.7s), flashing red spotlight hits his face & he freezes angrily (27.7-30.0s).",
    soundDesc: "Plug yank, power-down blackout sweep, celebration fanfare cut short, battery charge whine, flashing red alarm & angry freeze sting.",
    captionText: "I'M NEVER CROSSING AGAIN!",
    punchline: "You can pull the plug, but you can't beat a hidden battery.",
    characterAction: "Tugs power cable free, dances in the dark, freezes rigid in crimson spotlight with clenched fists and angry glare.",
    propAction: "Power box sparks & goes dark; traffic light opens rear battery compartment glowing green and blasts flashing red beam.",
  },
];

export const CLONE_BUTTON_DISASTER_PROMPT = `THE CLONE BUTTON DISASTER 🧍😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, bright solid colors, thick smooth black outlines, clean geometric shapes, exaggerated cartoon comedy, smooth readable motion. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER & CLONE DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes (20x22 open), thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms (118+118px two-bone IK) connected directly to sleeves, connected small white mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414).
- Every clone looks 100% identical to the original Stickman with slightly different funny facial expressions. Clones appear ONLY after a visible machine flash.

SCENE FLOW
0-6s (Scene 1 — THE BUTTON): Stickman discovers a mysterious red button on a machine labeled "CLONE". He grins and presses it. A bright flash appears beside him and an identical Stickman suddenly appears. Caption: "ONE MORE ME?!"
6-12s (Scene 2 — TOO MANY!): The original presses the button repeatedly. Each press creates another identical clone until five Stickmen crowd the room looking confused and annoyed. Caption: "STOP MAKING COPIES!"
12-18s (Scene 3 — CLONE CHAOS): The clones begin copying everything the original does — raising one hand, raising both hands, jumping — as the room packs with dozens of identical Stickmen. Caption: "THEY COPY EVERYTHING!"
18-24s (Scene 4 — WHO IS THE REAL ONE?): The original tries escaping left and right exits, but clones block every exit and argue. He points at himself and every clone points right back. Caption: "WHO'S THE REAL ME?!"
24-30s (Scene 5 — ONE BUTTON TOO MANY): The original spots the machine's red RESET button, squeezes through the crowd, and presses it. All clones vanish in a bright flash. He celebrates — until one tiny clone flashes onto his shoulder and waves. Stickman screams. Caption: "THERE'S STILL ONE?!"

YOUTUBE METADATA
- Title: He Pressed the CLONE BUTTON… BIG MISTAKE! 🧍😂
- Thumbnail text: 100 OF ME?!
- Hashtags: #AngryStickman #CloneDisaster #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts`;

export const CLONE_BUTTON_DISASTER_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Button",
    timeRange: [0.0, 6.0],
    videoPrompt:
      'Angry Stickman discovers a mysterious red button on a machine labeled "CLONE". He grins mischievously and presses it — a bright flash erupts beside him and an identical Stickman pops into existence.',
    animationDesc:
      'Notices "CLONE" machine & grins (0.0-1.6s), presses glowing red CLONE button (1.6-2.8s), bright starburst flash spawns Clone #1 (2.8-3.6s), both stare in wide-eyed shock (3.6-6.0s).',
    soundDesc: "Machine hum, chunky red button press, bright cloning flash pop, shocked comedic sting.",
    captionText: "ONE MORE ME?!",
    punchline: "Curiosity didn't kill the Stickman. It multiplied him.",
    characterAction: "Walks up to machine, grins and slams the red button, recoils in disbelief at his own twin.",
    propAction: 'Machine console labeled "CLONE" flashes bright white-cyan starburst and ticks counter from 00 to 01.',
  },
  {
    id: 2,
    name: "Scene 2",
    title: "Too Many!",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "The original Stickman mashes the CLONE button repeatedly! Each press triggers a flash and creates another identical clone until five Stickmen crowd the room, all looking confused and annoyed.",
    animationDesc:
      "Frantically presses button 4 more times (6.1-10.3s), sequential flashes spawn Clones #2–#5 across the floor, all five glare at each other annoyed and confused (10.3-12.0s).",
    soundDesc: "Rapid button clicks, four ascending clone spawn pops, grumpy room murmur.",
    captionText: "STOP MAKING COPIES!",
    punchline: "Five Angry Stickmen in one room is four too many.",
    characterAction: "Mashes red button four times in panic, then crosses arms glaring at his four annoyed copies.",
    propAction: "Machine counter climbs 02 → 05 with four bright spawn flashes lighting the room.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "Clone Chaos",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "The clones start mimicking every move the original Stickman makes! He raises one hand, they all raise one hand; he jumps, everyone jumps — while more flashes pack the room with dozens of identical Stickmen.",
    animationDesc:
      "Original tests raising one arm -> all clones mirror (12.2-13.7s), raises both arms -> all mirror + flash wave packs 20 clones (13.7-15.6s), Stickman jumps -> whole crowd jumps in unison (15.6-18.0s).",
    soundDesc: "Mimic chimes, synchronized jump boings, massive crowd clone burst.",
    captionText: "THEY COPY EVERYTHING!",
    punchline: "Simon Says, except Simon is losing his mind.",
    characterAction: "Tests raising left arm, both arms, then leaps — horrified as 20 identical clones mirror every beat.",
    propAction: "Machine overloads to counter 20 with rapid flash bursts filling the room wall-to-wall.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Who Is The Real One?",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Original Stickman tries escaping through the left and right exits, but clones block every door! Everyone argues with wild gestures — the original points at his chest, and every clone points right back at him.",
    animationDesc:
      "Dashes to right EXIT -> blocked by wall of clones (18.0-19.6s), dashes to left EXIT -> blocked again (19.6-21.0s), chaotic pointing argument -> original points at himself & all 20 clones point back (21.0-24.0s).",
    soundDesc: "Fast dashes, door block thuds, escalating cartoon bickering & accusation sting.",
    captionText: "WHO'S THE REAL ME?!",
    punchline: "Even his own clones don't believe he's the original.",
    characterAction: "Sprints right and left trying both exits, waves arms arguing, points dramatically at himself.",
    propAction: "Left and right green EXIT signs loom above blocked doorways as 20 identical clones point accusingly.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "One Button Too Many",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "Spotting the red RESET button on the machine, Stickman squeezes through the crowd and slams it! A massive flash vanishes all clones. He celebrates — until one tiny clone flashes onto his shoulder and waves. Stickman screams!",
    animationDesc:
      "Spots glowing red RESET button & squeezes through crowd (24.0-25.4s), slams RESET -> bright full-screen flash erases all 20 clones (25.4-26.6s), dances in victory (26.6-27.7s), tiny flash spawns mini clone waving on his shoulder -> Stickman freezes screaming (27.7-30.0s).",
    soundDesc: "Squeeze squeaks, heavy RESET slam, huge vanish sweep, tiny victory chime cut short by mini pop & comedic shock scream.",
    captionText: "THERE'S STILL ONE?!",
    punchline: "Never trust a 99% effective RESET button.",
    characterAction: "Dives through clones to hit RESET, celebrates victory, then shrieks at the tiny waving clone on his shoulder.",
    propAction: "Machine RESET panel opens, screen flashes pure white erasing clones, counter resets 00 -> 01 for tiny shoulder clone.",
  },
];

export const RUBBER_BAND_TRAP_PROMPT = `THE GIANT RUBBER BAND TRAP 🪢😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, exaggerated physical comedy, smooth readable motion. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes (20x22 open), thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms (118+118px two-bone IK) connected directly to sleeves, connected small white mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical in every scene.

MAIN PROP
One enormous stretchy red rubber band (#ef233c) wrapped around two heavy bolted wooden posts, stretching, vibrating, snapping back, and recoiling realistically.

SCENE FLOW
0-6s (Scene 1 — THE DISCOVERY): Stickman finds a giant red rubber band around two heavy wooden posts. He grabs it with both hands and pulls; it stretches surprisingly far. Caption: "HOW STRONG IS THIS THING?!"
6-12s (Scene 2 — BAD IDEA): He stretches the band farther and accidentally loops it around his waist. He tries letting go, but the band stays taut between the posts. His eyes widen. Caption: "UH-OH…"
12-18s (Scene 3 — THE LAUNCH): One wooden post bends and suddenly breaks loose. The rubber band snaps back, launching Stickman spinning across the room with flailing arms and legs. Caption: "AAAAAAAA!"
18-24s (Scene 4 — BOUNCING EVERYWHERE): Stickman lands on a giant sofa cushion, bounces into a pile of pillows, then gets caught by the same rubber band stretching again like a giant elastic slingshot. Caption: "MAKE IT STOP!"
24-30s (Scene 5 — FINAL SNAP): Stickman grabs the loose end and carefully releases it. The band snaps back harmlessly. He celebrates — until the loose rubber band flicks his red beanie off his head. He stares angrily at the camera. Caption: "NEVER TOUCH THAT AGAIN!"

YOUTUBE METADATA
- Title: He Pulled a GIANT Rubber Band… BIG MISTAKE! 🪢😂
- Thumbnail: IT SNAPPED!
- Hashtags: #AngryStickman #RubberBand #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts`;

export const RUBBER_BAND_TRAP_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Discovery",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman discovers an enormous stretchy red rubber band looped around two heavy wooden posts. He grabs it with both white mitten hands and pulls back — it stretches surprisingly far and vibrates.",
    animationDesc:
      "Walks up to wooden posts (0.0-1.4s), grabs giant red band with both hands (2.1s), leans back stretching it into a tight vibrating V (2.3-6.0s).",
    soundDesc: "Footsteps, grip click, creaking rising elastic stretch groans.",
    captionText: "HOW STRONG IS THIS THING?!",
    punchline: "If it stretches that easily, let go immediately.",
    characterAction: "Leans backward pulling the giant red rubber band with clenched teeth and squinting effort.",
    propAction: "Giant red rubber band stretches tightly between the two heavy bolted wooden posts and vibrates.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "Bad Idea",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Pulling even farther, Stickman slips and loops the stretched red rubber band around his own waist! He lets go with both hands, realizing in horror the band stays locked taut between the posts.",
    animationDesc:
      "Strains backward (6.0-7.2s), slips backward looping band around his waist (7.4-8.2s), releases both hands defensively with wide eyes (8.2-12.0s).",
    soundDesc: "Deep strained elastic stretch, waist-loop boing, panicky squeak.",
    captionText: "UH-OH…",
    punchline: "Congratulating yourself early is optional when trapped in a giant slingshot.",
    characterAction: "Releases hands in panic while stuck wrapped inside the stretched red rubber band.",
    propAction: "Red rubber band cinches cleanly around his waist while both wooden posts groan inward.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Launch",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "The left wooden post bends dangerously inward, cracks, and breaks loose off its floor bolts! Freed from the post, the rubber band snaps back, launching Stickman spinning through the air across the room.",
    animationDesc:
      "Left post bends & cracks (12.0-13.25s), post snaps free & topples (13.3s), band launches Stickman spinning end-over-end across the room as camera pans right (13.5-18.1s).",
    soundDesc: "Wood crack & bolt snap, booming elastic twang launch, fast air whooshes.",
    captionText: "AAAAAAAA!",
    punchline: "Physics always collects its debt with interest.",
    characterAction: "Flails arms and legs spinning head-over-heels in mid-air across the room.",
    propAction: "Left wooden post breaks off its steel bracket; giant red band whips forward from the right post.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Bouncing Everywhere",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Stickman crashes onto a giant teal sofa cushion, bounces high into a colorful pile of pillows, then rebounds right back into the same red rubber band, which catches him and bounces him like a giant elastic slingshot!",
    animationDesc:
      "Squashes giant sofa cushion (18.25s), arcs into pillow pile (19.75s), rebounds into red rubber band anchored on right post and yo-yos back and forth (21.15-24.0s).",
    soundDesc: "Puffy sofa boing, soft pillow bounce, elastic slingshot stretch & twin recoil twangs.",
    captionText: "MAKE IT STOP!",
    punchline: "Soft cushions only guarantee a softer second launch.",
    characterAction: "Ricochets from sofa to pillows, then dizzily oscillates back and forth strapped in the red slingshot.",
    propAction: "Sofa cushion and pillows squash deeply on impact; red rubber band stretches taut from Post 2.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "Final Snap",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "Stickman carefully grabs the loose end and slips the band free. It snaps harmlessly back onto the post. He celebrates proudly — until the dangling tail whips out and flicks his red beanie clean off! He stares angrily at the camera.",
    animationDesc:
      "Carefully grabs & unhooks band (24.4-26.05s), band snaps safely to post (26.05-26.8s), fist-pumping victory dance (26.8-28.1s), band tail flicks beanie off (28.25s), beanie-less angry camera glare (28.65-30.0s).",
    soundDesc: "Grip click, gentle rubber recoil, victory chime, crisp elastic beanie flick, sad trombone sting.",
    captionText: "NEVER TOUCH THAT AGAIN!",
    punchline: "Never celebrate while the rubber band still has momentum.",
    characterAction: "Unhooks band gingerly, dances in victory, then freezes bare-headed glaring angrily at the lens.",
    propAction: "Rubber band coils on Post 2, flicks up to knock the red beanie onto the floor, then hangs innocently.",
  },
];

export const MYSTERY_FLOOR_HOLE_PROMPT = `THE MYSTERY HOLE IN THE FLOOR 🕳️😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth movement, exaggerated physical comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes (20x22 open), thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms (118+118px two-bone IK) connected directly to sleeves, connected small white mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

MAIN PROP
A perfectly circular mysterious hole in the wooden floor, glowing purple around its edge. Anything dropped inside returns as an oversized version of itself.

SCENE FLOW
0-6s (Scene 1 — THE DISCOVERY): Stickman discovers a small glowing purple hole in his living-room floor. He drops a tiny coin inside. A giant coin suddenly shoots upward and crashes onto the floor beside him. Caption: "WHAT IS THIS HOLE?!"
6-12s (Scene 2 — BIGGER!): Curious, Stickman drops a small rubber duck inside. A giant yellow rubber duck bursts out, bouncing across the room and knocking over a chair. Stickman jumps back. Caption: "IT MAKES EVERYTHING HUGE!"
12-18s (Scene 3 — BAD EXPERIMENT): Stickman drops a tiny toy car into the hole. A gigantic toy car emerges, smashing through the living-room furniture. Stickman runs away as it rolls toward him. Caption: "THAT'S TOO BIG!"
18-24s (Scene 4 — THE WORST IDEA): Stickman leans over the hole with a mischievous grin and drops his tiny red beanie inside by accident. A gigantic red beanie bursts out and covers the entire room like a giant blanket while Stickman struggles underneath. Caption: "NOT MY BEANIE!"
24-30s (Scene 5 — ONE LAST SURPRISE): Stickman pulls the giant beanie off and covers the mysterious hole with a wooden floorboard. He celebrates. Suddenly, the hole glows through the floorboard and launches a giant white version of his own head upward. He stares at the camera in disbelief. Caption: "I'M NEVER TOUCHING THAT AGAIN!"

YOUTUBE METADATA
- Title: He Found a MYSTERY HOLE… EVERYTHING GREW HUGE! 🕳️😂
- Thumbnail: IT MAKES THINGS HUGE!
- Hashtags: #AngryStickman #MysteryHole #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts`;

export const MYSTERY_FLOOR_HOLE_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Discovery",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman discovers a small glowing purple hole in his living-room floor. He leans down and drops a tiny gold coin inside — seconds later a giant coin shoots upward and slams beside him.",
    animationDesc:
      "Walks to glowing purple hole (0.0-1.4s), drops tiny gold coin in (2.2-2.7s), giant gold coin erupts upward & crashes onto floor (3.3-4.15s) before rolling off right.",
    soundDesc: "Footsteps, portal drop bloop, giant purple eruption boom, floor crash.",
    captionText: "WHAT IS THIS HOLE?!",
    punchline: "Rule one of mysterious glowing floor holes: stop feeding them.",
    characterAction: "Drops a tiny coin into the hole, leaps back in shock, points at the giant coin.",
    propAction: "Circular purple-glowing floor hole shoots out a gigantic matching gold coin.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "Bigger!",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Curious, Stickman drops a small yellow rubber duck into the purple hole. A giant yellow rubber duck bursts out, bouncing across the room and knocking over a wooden chair as Stickman jumps back!",
    animationDesc:
      "Holds small yellow duck & drops it in (6.2-7.5s), giant rubber duck erupts & squeaks (7.85-8.55s), bounces onto wooden chair knocking it over (9.25s) & hops out right.",
    soundDesc: "Portal bloop, eruption boom, deep giant duck squeak-honk, furniture crash.",
    captionText: "IT MAKES EVERYTHING HUGE!",
    punchline: "A bath toy shouldn't have the kinetic energy of a wrecking ball.",
    characterAction: "Drops small duck smugly, then jumps backward hands-up as the giant duck crushes the chair.",
    propAction: "Giant rubber duck bounces across the room, knocking the chair flat onto the floor.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "Bad Experiment",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman drops a tiny toy car into the glowing hole. A gigantic toy car bursts upward, smashes right through the living-room table, and rolls rapidly toward Stickman as he sprints away!",
    animationDesc:
      "Drops tiny red/blue toy car (12.2-13.4s), giant toy car erupts (13.75s), smashes side table (14.5s), rolls left chasing Stickman who sprints & leaps clear (15.1-17.9s).",
    soundDesc: "Drop bloop, eruption boom, table smash crash, fast chase whoosh.",
    captionText: "THAT'S TOO BIG!",
    punchline: "At least it didn't need parallel parking.",
    characterAction: "Drops tiny car, sprints left in sheer panic, leaps sky-high as the giant car speeds past.",
    propAction: "Giant toy car smashes wooden table apart and rolls aggressively toward the left wall.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Worst Idea",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Stickman leans over the glowing hole with a mischievous grin and accidentally drops his own red beanie inside! A gigantic red knitted beanie erupts and drapes over the entire room like a blanket as he struggles underneath.",
    animationDesc:
      "Leans smugly over hole (18.2-19.6s), red beanie slips off into hole (19.65-20.3s), colossal red beanie erupts (20.75s) and blankets Stickman squirming underneath (21.3-24.0s).",
    soundDesc: "Beanie drop bloop, colossal eruption boom, muffled squirm squeaks.",
    captionText: "NOT MY BEANIE!",
    punchline: "One size fits the whole living room.",
    characterAction: "Loses beanie into hole, squirms & kicks violently trapped under the giant knitted blanket.",
    propAction: "Gigantic matching red beanie (band, 5 stitches, pom) blankets Stickman on the floor.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "One Last Surprise",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "Stickman pulls the giant beanie off, covers the hole with a wooden floorboard, and celebrates! Suddenly purple light shines straight through the board and launches a giant white version of his own head upward!",
    animationDesc:
      "Yanks giant beanie aside (24.0-25.0s), slams wooden floorboard over hole (25.2-25.8s), fist-pumping celebration (26.15-27.1s), hole blasts board off & launches giant Stickman head (27.65s), stunned camera glare (28.65-30.0s).",
    soundDesc: "Cloth yank, board thump, victory chime, rising glow charge, huge eruption, sad trombone sting.",
    captionText: "I'M NEVER TOUCHING THAT AGAIN!",
    punchline: "Even a wooden plank can't stop a plot twist this big.",
    characterAction: "Covers hole, celebrates triumphantly, then freezes bare-headed staring dead at the camera.",
    propAction: "Wooden board shakes & flies off as a giant round white Stickman head rockets upward.",
  },
];

export const SUPER_BOUNCY_SHOES_PROMPT = `THE SUPER BOUNCY SHOES 👟😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth movement, exaggerated physical comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes (20x22 open), thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms (118+118px two-bone IK) connected directly to sleeves, connected small white mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

MAGIC SHOES
Bright red oversized sneakers with white rubber toe caps/soles and shiny silver coil springs underneath. Always visibly compress the silver springs right before every bounce and upward launch. Keep the exact same shoe design throughout.

SCENE FLOW
0-6s (Scene 1 — THE DISCOVERY): Stickman discovers a pair of strange red sneakers with springs underneath. He puts them on and takes one test step. BOING! He jumps unexpectedly high and lands back on the floor. Caption: "THESE SHOES ARE AMAZING!"
6-12s (Scene 2 — TOO MUCH POWER): He takes another step. The springs compress deeply and launch him right above his house. He lands in his garden, bouncing again before he can even stand up. Caption: "I CAN'T CONTROL THEM!"
12-18s (Scene 3 — SUPER BOUNCE): Stickman bounces over rooftops, a tall tree, and a streetlight. Each landing compresses the springs and launches him even higher while his face shifts from excitement to sheer panic. Caption: "SOMEONE STOP ME!"
18-24s (Scene 4 — THE TRAP): He spots a giant trampoline in a park and aims for it. He lands dead center, and the trampoline rockets him straight upward spinning head-over-heels in mid-air. Caption: "WRONG LANDING!"
24-30s (Scene 5 — FINAL BOING): Stickman lands safely on a huge soft pile of pillows, pulls the shoes off, and celebrates — until one loose spring pops out and launches a red sneaker into the air, landing squarely on his head and knocking his red beanie off! Caption: "NEVER AGAIN!"

YOUTUBE METADATA
- Title: He Wore SUPER BOUNCY SHOES… BIG MISTAKE! 👟😂
- Thumbnail: CAN'T STOP BOUNCING!
- Hashtags: #AngryStickman #BouncyShoes #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts`;

export const SUPER_BOUNCY_SHOES_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Discovery",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman discovers a pair of bright red oversized sneakers with shiny silver springs underneath. He puts them on and takes one test step — BOING! He launches unexpectedly high inside his house and lands on the floor.",
    animationDesc:
      "Walks to red spring sneakers (0.0-1.35s), puts them on (1.4-2.1s), crouches compressing springs (2.9-3.25s), shoots upward to ceiling height & lands safely (3.25-4.85s).",
    soundDesc: "Footsteps, sneaker latch clicks, crisp spring boing, floor thump.",
    captionText: "THESE SHOES ARE AMAZING!",
    punchline: "Rule one of spring-loaded footwear: never test them under a ceiling fan.",
    characterAction: "Discovers the spring sneakers, straps them on eagerly, takes one test bounce high into the air.",
    propAction: "Red oversized sneakers with silver springs visibly compress before firing Stickman upward.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "Too Much Power",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman takes another step. The silver springs compress completely and launch him straight out above his house! He lands in his garden, bouncing right back into the sky before he can stand.",
    animationDesc:
      "Crouches compressing springs deeply (6.0-6.45s), rockets high above house roof (6.45-8.8s), slams onto garden grass & instantly rebounds before standing (8.8-12.0s).",
    soundDesc: "Deep spring coil compression, high power boing, garden turf thump, instant rebound boing.",
    captionText: "I CAN'T CONTROL THEM!",
    punchline: "Zero brakes, maximum vertical clearance.",
    characterAction: "Gets launched over his own roof, lands squashed in the garden, and rebounds involuntarily.",
    propAction: "House roof passes underneath while the sneaker springs coil and snap back on contact.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "Super Bounce",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman bounces across town over rooftops, a tall tree, and a streetlight. Every landing squashes the silver springs and launches him even higher as his face shifts from excitement to sheer panic!",
    animationDesc:
      "Sequential escalating bounces: over town rooftops (12.25s), over giant oak tree (14.35s), over tall streetlight (16.35s) with panicked flailing arms.",
    soundDesc: "Escalating higher-pitched spring boings on every rooftop, tree, and curb rebound.",
    captionText: "SOMEONE STOP ME!",
    punchline: "Physics didn't read the warranty on those springs.",
    characterAction: "Flails arms helplessly as each landing fires him higher than the last.",
    propAction: "Rooftops, oak tree, and glowing streetlight scroll underneath across the panoramic town skyline.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Trap",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Spotting a giant trampoline in the park, Stickman aims straight for the center — only for the trampoline plus his spring shoes to rocket him straight upward, spinning wildly in mid-air!",
    animationDesc:
      "Dives toward park trampoline (18.0-19.65s), trampoline mat dips deeply then rockets him sky-high (19.65-24.0s) spinning 3 full rotations in mid-air.",
    soundDesc: "Massive dual trampoline + sneaker spring rocket boing, rapid mid-air spin whooshes.",
    captionText: "WRONG LANDING!",
    punchline: "Multiplying springs by a trampoline was a math error.",
    characterAction: "Aims proudly for the trampoline, then spins end-over-end near the clouds.",
    propAction: "Giant blue-and-yellow park trampoline flexes downward and fires Stickman into orbit.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "Final Boing",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "Stickman lands safely on a huge soft pile of pillows, rips the bouncy shoes off, and celebrates — until one loose spring pops out and launches a red sneaker onto his head, knocking his red beanie off!",
    animationDesc:
      "Drops safely into huge pillow pile (24.0-24.75s), yanks spring sneakers off (25.0-25.85s), fist-pumps in triumph (26.15-27.55s), loose spring pops launching right sneaker onto his head knocking beanie off (27.6-28.45s), deadpan angry camera glare (28.5-30.0s).",
    soundDesc: "Soft pillow thud, shoe release clicks, victory chime, metallic spring pop, sneaker head bonk, sad trombone sting.",
    captionText: "NEVER AGAIN!",
    punchline: "Even taken off, those shoes still got the last bounce.",
    characterAction: "Tears off the spring shoes, celebrates victory, gets bonked bare-headed and glares angrily at the lens.",
    propAction: "One silver spring pops off the discarded right sneaker, shooting the shoe onto Stickman's head and knocking his red beanie aside.",
  },
];

export const SHADOW_TRICKSHOT_PROMPT = `THE IMPOSSIBLE SHADOW TRICKSHOT 🌑 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth motion, exaggerated cartoon reactions. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes (20x22 open), thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms (118+118px two-bone IK) connected directly to sleeves, connected small white mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

PROPS & SHADOW RULES
- Small bright orange ball (#f97316), bright pivoting spotlight on a tripod stand, corner divider wall, and a large white target cup (#ffffff).
- Stickman's dark silhouette shadow matches his exact silhouette and movement (except during the special corner trickshot), controlled by spotlight angle and length.

SCENE FLOW
0-6s (Scene 1 — THE DISCOVERY): Stickman places an orange ball under a bright spotlight. His shadow stretches across the floor. He throws the ball toward a distant white cup, but misses badly. He notices the shadow's shape and gets an idea. Caption: "WHAT IF MY SHADOW COULD SHOOT?!"
6-12s (Scene 2 — FIRST ATTEMPT): Stickman moves his arm and swings. His shadow copies the movement and appears to kick the ball. The real ball rolls forward and hits a wall. Stickman looks frustrated. Caption: "IT ACTUALLY WORKS?!"
12-18s (Scene 3 — IMPOSSIBLE TRICK): He adjusts the spotlight. His shadow stretches around a corner. Stickman throws the ball toward the wall, and the shadow catches and kicks it around the corner toward the cup. Caption: "AROUND THE CORNER!"
18-24s (Scene 4 — FINAL SETUP): The ball approaches the cup but stops just short. Stickman panics and moves the spotlight lower. His giant shadow stretches across the entire room, raising one enormous shadow foot. Caption: "ONE LAST SHOT!"
24-30s (Scene 5 — UNEXPECTED ENDING): The shadow kicks the ball perfectly into the cup. Stickman celebrates wildly. Suddenly, the spotlight flickers off. His shadow disappears—and the ball pops out of the cup and hits his beanie off his head. Caption: "PERFECT SHOT... BAD LUCK!"

YOUTUBE METADATA
- Title: He Used His SHADOW to Make an IMPOSSIBLE Trickshot! 🌑😂
- Thumbnail: MY SHADOW DID THAT?!
- Hashtags: #AngryStickman #Trickshot #ShadowTrickshot #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts`;

export const SHADOW_TRICKSHOT_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Discovery",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman places a small orange ball under a bright spotlight while his dark silhouette stretches across the floor. He throws the ball toward a distant white cup and misses badly, then notices his shadow and gets a wild idea!",
    animationDesc:
      "Places orange ball (0.95s), throws & misses cup short (1.95-3.25s), stares down at his shadow & waves (3.65-4.7s), points excitedly at his shadow.",
    soundDesc: "Footsteps, ball drop, miss whoosh, floor thump, idea spark chime.",
    captionText: "WHAT IF MY SHADOW COULD SHOOT?!",
    punchline: "When your aim fails, outsource the trickshot to physics.",
    characterAction: "Places the ball, whiffs the throw, waves at his shadow, and points with an excited grin.",
    propAction: "Spotlight casts Stickman's exact silhouette across the floor beside the orange ball.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Attempt",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman swings his arm and steps forward. His shadow mirrors the movement and kicks the orange ball cleanly, sending it straight into a corner wall! Stickman stares shocked, then frustrated.",
    animationDesc:
      "Tests arm movement (6.1-7.5s), swings hard (8.2s) as shadow kicks ball into corner divider wall (8.85s), rebounds back, Stickman gasps then scowls.",
    soundDesc: "Shadow swoosh kick, crisp wall bonk, rebound roll.",
    captionText: "IT ACTUALLY WORKS?!",
    punchline: "The shadow has great power, zero GPS.",
    characterAction: "Swings arm forward, gasps in amazement, then glares angrily at the blocking corner wall.",
    propAction: "Ball slams against the corner wall face and rebounds onto the floor.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "Impossible Trick",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman adjusts the spotlight angle, stretching his shadow around the corner wall! He throws the ball toward the corner, and the shadow catches and kicks it cleanly around the corner toward the white cup.",
    animationDesc:
      "Swivels spotlight head (12.4-13.4s), throws ball toward corner (14.3s), stretched shadow catches (14.75s) and kicks around the corner (15.4s) rolling toward cup.",
    soundDesc: "Spotlight swivel click, throw whoosh, shadow catch swoosh, corner kick swoosh.",
    captionText: "AROUND THE CORNER!",
    punchline: "Angle of incidence equals comedy of reflection.",
    characterAction: "Rotates the spotlight, tosses the ball toward the wall, and watches open-mouthed.",
    propAction: "Spotlight lengthens the shadow around the corner wall to intercept and kick the orange ball.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Final Setup",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "The ball slows down and stops inches short of the white cup! Panicking, Stickman drags the spotlight low behind him—stretching a giant room-wide shadow that raises one enormous shadow foot behind the ball.",
    animationDesc:
      "Ball stops short at x=836 (18.4s), Stickman panics (18.6-19.6s), drags/lowers spotlight (19.9-21.5s), steps up and raises right foot (22.8s) casting a giant shadow foot.",
    soundDesc: "Ball stop thump, spotlight drag click, deep giant shadow rise whoosh.",
    captionText: "ONE LAST SHOT!",
    punchline: "Sometimes you just need a bigger shadow.",
    characterAction: "Panics, lowers the spotlight stand, and raises one leg dramatically to ready the giant shadow kick.",
    propAction: "Low spotlight projects an enormous room-spanning shadow across the floor right behind the ball.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "Unexpected Ending",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "The giant shadow kicks the orange ball cleanly into the white cup! Stickman celebrates wildly—until the spotlight flickers off, his shadow vanishes, and the ball pops straight out of the cup to knock his red beanie off!",
    animationDesc:
      "Giant shadow kicks ball into cup (24.15-24.85s), Stickman jumps celebrating (25.3-26.9s), spotlight flickers out (26.95-27.3s), shadow vanishes, ball pops out & bonks his beanie off (27.55-28.25s), bare-headed angry stare (28.75-30.0s).",
    soundDesc: "Giant shadow swoosh, cup drop clink, victory chime, spotlight flicker-off buzz, spring pop, head bonk, sad trombone sting.",
    captionText: "PERFECT SHOT... BAD LUCK!",
    punchline: "Never celebrate while standing in range of a rebound.",
    characterAction: "Kicks, leaps in triumph, freezes as lights die, gets bonked bare-headed, and glares angrily at the camera.",
    propAction: "Spotlight bulb sputters dead, shadow disappears, cup shudders and ejects the orange ball straight into Stickman's beanie.",
  },
];

export const INVISIBLE_WALL_PROMPT = `THE INVISIBLE WALL CHALLENGE 👻 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth animation, exaggerated expressions. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes (20x22 open), thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms (118+118px two-bone IK) connected directly to sleeves, connected small white mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

PROPS
- Orange basketball (#f97316), invisible glass walls (fully transparent except brief glowing blue outlines #38bdf8 on impact/touch), basketball hoop (always visible on the right), and trash can.

SCENE FLOW
0-6s (Scene 1 — THE DISCOVERY): Stickman prepares a basketball trickshot toward a hoop. He throws the ball, but it suddenly bounces backward in midair. He looks confused and touches the empty space. A faint blue outline flashes. Caption: "INVISIBLE WALL?!"
6-12s (Scene 2 — FIRST TRICKSHOT): He throws the ball from another angle. It hits an invisible wall and bounces sideways into a trash can. Stickman celebrates too early, then looks at the trash can in disbelief. Caption: "WAIT... I CAN USE IT!"
12-18s (Scene 3 — THE MASTER PLAN): Stickman discovers several invisible walls. He carefully throws the ball, bouncing it between three hidden surfaces. The ball narrowly misses the hoop. Caption: "THREE WALL BOUNCES!"
18-24s (Scene 4 — IMPOSSIBLE SETUP): He moves farther away and aims at the hoop. The ball bounces off five invisible walls, flying around the room at crazy angles. Stickman follows it with wide eyes. Caption: "FIVE BOUNCES!"
24-30s (Scene 5 — THE TWIST): The ball makes one final bounce and drops perfectly into the hoop. Stickman celebrates wildly. Suddenly, he runs forward and smacks face-first into a huge invisible wall. Its blue outline flashes as he slides down. Caption: "I FORGOT THE WALL! 😂"

YOUTUBE METADATA
- Title: He Discovered INVISIBLE WALLS… Then Tried a Trickshot! 👻😂
- Thumbnail: THE WALL IS INVISIBLE?!
- Hashtags: #AngryStickman #InvisibleWall #Trickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts`;

export const INVISIBLE_WALL_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Discovery",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman prepares a basketball trickshot toward the hoop on the right. He shoots, and the orange basketball slams against empty midair and bounces backward! Confused, he reaches out to touch the space as a glowing blue glass outline flashes.",
    animationDesc:
      "Dribbles & shoots basketball (0.55-1.85s), hits invisible Wall A & bounces back (1.85-2.65s), steps forward & taps empty air triggering glowing blue flash (4.35s).",
    soundDesc: "Basketball dribble, shot whoosh, crystalline glass ping, confused touch ping.",
    captionText: "INVISIBLE WALL?!",
    punchline: "Nothing ruins a clean jumper like invisible architecture.",
    characterAction: "Shoots toward the hoop, stares confused at the rebound, and pokes the invisible glass wall.",
    propAction: "Basketball rebounds backward off Wall A; blue outline glows briefly on hit and hand touch.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Trickshot",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman shoots steeply from another angle. The basketball hits an angled invisible wall, flashing glowing blue, and deflects sideways straight into a trash can! Stickman celebrates too early before staring at the trash can in disbelief.",
    animationDesc:
      "Shoots high angle (7.4s), hits angled invisible Wall B (8.05s) and drops into trash can (8.95s), fist-pumps early (9.0-10.1s), then drops jaw staring at bin (10.25s).",
    soundDesc: "Shot whoosh, glass ping, trash can crash, early victory chime.",
    captionText: "WAIT... I CAN USE IT!",
    punchline: "Two points in the wrong container.",
    characterAction: "Throws steep shot, cheers prematurely with eyes shut, then stares shocked at the trash can.",
    propAction: "Angled invisible wall flashes blue and banks the ball cleanly inside the trash can.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Master Plan",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman retrieves the ball, taps hidden surfaces to map his angles, and launches a careful shot that pinballs off three invisible walls in sequence—narrowly clipping the hoop rim!",
    animationDesc:
      "Grabs ball from bin (12.6s), taps hidden surface (13.2s), throws 3-wall combo (14.25s -> 14.75s -> 15.35s -> 15.95s) clipping front rim (16.65s).",
    soundDesc: "Tap ping, shot whoosh, ascending 3-wall glass pings, metallic rim clink.",
    captionText: "THREE WALL BOUNCES!",
    punchline: "Geometry: 99%. Luck: 1% short.",
    characterAction: "Maps hidden glass surfaces, aims intently, and gasps at the narrow rim-out.",
    propAction: "Three invisible glass panels flash glowing blue one after another as the ball ricochets toward the rim.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Impossible Setup",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Stickman retreats to the far left side and launches an impossible shot. The basketball rockets across the room off five invisible walls at wild angles while Stickman tracks every bounce with wide eyes!",
    animationDesc:
      "Runs to far left (18.25-19.0s), launches blistering shot (19.45s), ricochets off five invisible walls (19.95s, 20.65s, 21.35s, 22.1s, 22.9s) as head/eyes track the ball.",
    soundDesc: "Power shot whoosh, five rapid escalating glass wall pings.",
    captionText: "FIVE BOUNCES!",
    punchline: "Pinball wizardry with a basketball.",
    characterAction: "Squats far left, hurls the ball hard, and whips his gaze back and forth tracking five wild bounces.",
    propAction: "Five transparent walls across the room briefly flash glowing blue on each sharp direction change.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Twist",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "The basketball makes one final bounce and drops straight through the hoop! Stickman celebrates wildly and sprints forward toward the basket—only to slam face-first into the huge invisible wall and slide slowly to the floor!",
    animationDesc:
      "Final bounce (24.1s) -> clean hoop swish (24.7s), celebrates wildly (24.75-25.85s), sprints forward (25.85-26.85s), SMACKS face-first into huge Wall A flashing glowing blue (26.85s) & slides down seated (27.35-28.6s).",
    soundDesc: "Final glass ping, crisp net swish, victory chime, heavy glass face-slam thud, rubber-on-glass squeak slide, sad trombone sting.",
    captionText: "I FORGOT THE WALL! 😂",
    punchline: "Great trickshot. Terrible spatial memory.",
    characterAction: "Jumps in triumph, sprints toward the hoop, flattens against invisible glass, and slides down glaring angrily.",
    propAction: "Final wall flashes blue into a clean net swish; huge Wall A flashes bright blue on Stickman's face-slam.",
  },
];

export const TEN_FAN_PROMPT = `THE 10-FAN IMPOSSIBLE TRICKSHOT 🌀 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth physics, exaggerated comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes (20x22 open), thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms (118+118px two-bone IK) connected directly to sleeves, connected small white mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

PROPS
- Orange ping-pong ball (#f97316, radius 18).
- 10 identical gray desk fans (#94a3b8 / #64748b) with spinning blue blades (#38bdf8).
- Ceiling lamp, right studio wall, two studio obstacle blocks, and a tiny red target cup (#ef4444).

SCENE FLOW
0-6s (Scene 1 — THE CHALLENGE): Stickman places a ping-pong ball in front of a desk fan. He switches it on. The ball shoots backward and hits his forehead. He gets an idea and points at the fan. Caption: "WHAT IF I USE MORE FANS?!"
6-12s (Scene 2 — THE EXPERIMENT): He lines up three fans. The ball flies between their air streams, making two sharp turns before landing on his head. He looks furious. Caption: "THREE FANS... NOT ENOUGH!"
12-18s (Scene 3 — THE UPGRADE): Stickman adds seven more fans, making a winding air tunnel. He releases the ball. It flies through all ten fans, spiraling around obstacles. Caption: "10 FANS ACTIVATED!"
18-24s (Scene 4 — THE IMPOSSIBLE SHOT): The ball travels through the final fan, loops around a ceiling lamp, bounces off a wall, and heads toward a tiny red cup. Stickman holds his breath. Caption: "DON'T MISS!"
24-30s (Scene 5 — THE PERFECT DISASTER): The ball drops perfectly into the cup. Stickman celebrates like a champion. Suddenly all 10 fans turn toward him and blow one gigantic gust. Stickman flies backward as his red beanie sails across the room into the cup. Caption: "PERFECT SHOT... WRONG TARGET! 😂"

YOUTUBE METADATA
- Title: He Used 10 FANS for an IMPOSSIBLE Trickshot! 🌀😂
- Thumbnail: 10 FANS?!
- Hashtags: #AngryStickman #FanTrickshot #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts`;

export const TEN_FAN_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Challenge",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman sets an orange ping-pong ball in front of a gray desk fan with blue blades and clicks it on. The gust shoots the ball straight back into his forehead! Rubbing his brow, an idea clicks and he points smugly at the fan.",
    animationDesc:
      "Places ping-pong ball (0.9s), switches fan on (1.75s), ball rockets back into forehead (2.35s), lightbulb idea pops & Stickman points at fan (4.15s).",
    soundDesc: "Ball placement thump, fan switch click, air whoosh, forehead bonk, idea chime.",
    captionText: "WHAT IF I USE MORE FANS?!",
    punchline: "Step one of engineering: double down on wind power.",
    characterAction: "Crouches to set the ball, recoils from a forehead bonk, then points with a bright idea.",
    propAction: "Gray desk fan spins up blue blades and blasts the ping-pong ball backward into Stickman.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "The Experiment",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman sets up three identical gray desk fans with blue blades on stepped studio shelves. The ping-pong ball rides their air streams, whipping through two sharp turns before blasting straight onto his head!",
    animationDesc:
      "Lines up 3 fans (6.05-6.8s), turns them on (7.55s), ball whips through two sharp turns (8.35s, 9.2s) and bonks top of head (10.15s), triggering furious fist shake.",
    soundDesc: "Switch click, dual air whooshes on sharp turns, crisp head bonk.",
    captionText: "THREE FANS... NOT ENOUGH!",
    punchline: "More wind, twice the trajectory, exact same target.",
    characterAction: "Steers the test launch, tracks the sharp turns wide-eyed, then shakes furious fists.",
    propAction: "Three gray fans whip the orange ping-pong ball across two sharp corners back onto his head.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Upgrade",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman adds seven more identical gray fans to build a massive 10-fan winding air tunnel around obstacles! He drops the ball in and watches in awe as it spirals smoothly past every single fan.",
    animationDesc:
      "Fans F4..F10 pop onto studio shelves (12.15-13.4s), master switch activates all 10 (14.1s), ball weaves cleanly through the entire 10-fan tunnel around blocks (14.3-18.0s).",
    soundDesc: "Master switch click, rapid rising sequence of airflow whooshes across fans.",
    captionText: "10 FANS ACTIVATED!",
    punchline: "Over-engineered wind tunnel perfection.",
    characterAction: "Activating all 10 fans and watching the S-curve spiral climb higher in amazement.",
    propAction: "Ten identical gray desk fans with spinning blue blades channel the ball seamlessly around obstacles.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Impossible Shot",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Out of the 10th fan, the ping-pong ball loops 360 degrees around the hanging ceiling lamp, ricochets sharply off the right studio wall, and arcs down toward the tiny red target cup while Stickman holds his breath!",
    animationDesc:
      "360° lamp loop (18.55-19.65s), right wall bounce (21.25s), suspenseful high arc descending over the tiny red cup while Stickman clenches fists holding his breath (22.4-24.0s).",
    soundDesc: "High spiral air whoosh, sharp studio wall bounce, rising suspense groove.",
    captionText: "DON'T MISS!",
    punchline: "Zero margin for error.",
    characterAction: "Tracks the ceiling lamp orbit and freezes clutching his breath as the ball descends.",
    propAction: "Ball orbits the swinging ceiling lamp, ricochets off the wall, and drops straight toward the red cup.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Perfect Disaster",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "The orange ping-pong ball drops dead-center into the tiny red cup! Stickman celebrates like a champion—until all 10 fans swivel simultaneously toward him and unleash one gigantic gust, blasting Stickman backward while his red beanie sails across the room right into the cup!",
    animationDesc:
      "Ball drops into cup (24.45s), champion celebration (24.55-26.2s), all 10 fans swivel left (26.2-26.65s), massive gust blasts Stickman backward & blows beanie across frame into cup (26.95-28.15s).",
    soundDesc: "Cup drop clink, victory chime, synchronized fan swivel click, huge gale gust, beanie cup plop, sad trombone.",
    captionText: "PERFECT SHOT... WRONG TARGET! 😂",
    punchline: "Ten fans, two targets in one cup.",
    characterAction: "Leaps in victory, gets blown backward to the far wall, and glares bare-headed at the camera.",
    propAction: "All 10 fans pivot toward Stickman and blow his red beanie neatly into the tiny red cup beside the ball.",
  },
];

export const IMPOSSIBLE_LASER_PROMPT = `THE IMPOSSIBLE LASER MAZE 🔴😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth animation, exaggerated comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes (20x22 open), thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms (118+118px two-bone IK) connected directly to sleeves, connected small white mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

PROPS
- Red laser emitters (#334155 housings with glowing red #ef4444 beams), small angled mirrors on floor/wall brackets, orange ping-pong ball (radius 16, #f97316), translucent cyan glass wall dividers, teal launch ramp, and golden target cup (#facc15) on a vault pedestal.

SCENE FLOW
0-6s (Scene 1 — THE CHALLENGE): Stickman discovers a room filled with red laser beams guarding a golden cup on a pedestal. He throws an orange ball, but a vertical red laser barrier deflects it back. He gets an idea. Caption: "IMPOSSIBLE LASER MAZE?!"
6-12s (Scene 2 — FIRST REFLECTION): He places a small mirror in front of the primary laser emitter. The beam reflects cleanly upward to a ceiling absorber, opening a corridor. Stickman smiles and positions the orange ball on a ramp. Caption: "CONTROL THE LASERS!"
12-18s (Scene 3 — THE TRICKSHOT): Stickman places three mirrors at different angles and rolls the orange ball down the ramp. It bounces cleanly off the mirrors along the open path between beams. Caption: "THREE PERFECT ANGLES!"
18-24s (Scene 4 — FINAL CHALLENGE): The ball travels through the narrow gap between glass walls and two crossing laser beams without touching any beam, bounces off the final mirror, and arcs toward the golden cup while Stickman watches nervously. Caption: "DON'T TOUCH THE LASERS!"
24-30s (Scene 5 — THE FUNNY ENDING): The ball drops cleanly into the golden cup! Stickman celebrates with a victory dance. Suddenly, the cup depresses a hidden pedestal switch—every laser turns on at once, locking a glowing red laser cage around him. He freezes, then slowly raises both hands in surrender. Caption: "I WON... BUT I'M TRAPPED! 😂"

YOUTUBE METADATA
- Title: He Solved the IMPOSSIBLE LASER MAZE with a Trickshot! 🔴😂
- Thumbnail: ONE WRONG MOVE!
- Hashtags: #AngryStickman #LaserMaze #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts`;

export const IMPOSSIBLE_LASER_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Challenge",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman discovers a spy-vault room guarded by red laser beams with a golden cup on a pedestal at the far end. He throws an orange ping-pong ball, which zaps off the laser barrier and bounces back before an idea strikes.",
    animationDesc:
      "Winds up & throws orange ball (1.75-2.1s), blocked by vertical laser barrier at x=450 (2.75s), bounces back onto floor (3.6s), lightbulb idea pose (4.5s).",
    soundDesc: "Throw whoosh, sharp laser barrier zap, idea confidence ding.",
    captionText: "IMPOSSIBLE LASER MAZE?!",
    punchline: "Even a ping-pong ball can't sneak past that barrier.",
    characterAction: "Throws the ball hopefully, recoils at the laser zap, then points upward with a bright idea.",
    propAction: "Red laser beam blocks the orange ball cleanly without letting it pass through.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Reflection",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman walks forward and places a small angled mirror directly in front of the main ceiling laser emitter, reflecting the red beam upward into the upper wall and clearing the path before setting the orange ball on a ramp.",
    animationDesc:
      "Walks to emitter line (6.0-7.2s), places laser-deflector mirror at (450, 860) reflecting beam upward (6.9s), smiles broadly and places launch ramp & ball (8.6-11.8s).",
    soundDesc: "Mirror placement ping, satisfying smile cue, ramp setup.",
    captionText: "CONTROL THE LASERS!",
    punchline: "If you can't dodge the laser, steer it.",
    characterAction: "Places the mirror accurately, grins proudly, and walks back to set the ball on the ramp.",
    propAction: "Mirror redirects the primary red laser beam cleanly up toward the ceiling.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Trickshot",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman positions three mirrors at calculated angles and rolls the orange ball down the ramp, bouncing cleanly off the first two mirrors along the laser-free path.",
    animationDesc:
      "Places three trickshot mirrors (12.2-14.2s), releases ball down ramp (15.2s), bounces cleanly off Mirror 1 (16.6s) and angles up toward Mirror 2.",
    soundDesc: "Mechanical mirror lock clicks, ramp roll whoosh, crisp glass mirror bounce pings.",
    captionText: "THREE PERFECT ANGLES!",
    punchline: "Geometry is finally paying off.",
    characterAction: "Locks the three mirrors into place and points excitedly as the ball begins its run.",
    propAction: "Ball rolls down the ramp and ricochets off Mirror 1 toward the laser corridor.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Final Challenge",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "The orange ball bounces off Mirror 2, threads the narrow gap between glass walls and two angled crossing laser beams without touching a single beam, hits Mirror 3, and arcs toward the golden cup as Stickman watches nervously.",
    animationDesc:
      "Mirror 2 bounce (18.1s), glides cleanly through narrow laser-free gap between glass walls & beams (18.1-21.0s), bounces off Mirror 3 (21.0s) and arcs toward golden cup (21.0-24.25s).",
    soundDesc: "Mirror bounce pings, tense mid-gap air whoosh, rising synth climb.",
    captionText: "DON'T TOUCH THE LASERS!",
    punchline: "Millimeters of clearance between beams and glass.",
    characterAction: "Crouches forward clenching his fists nervously watching the final arc.",
    propAction: "Orange ball threads the narrow corridor safely and rebounds off Mirror 3 toward the golden cup.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Funny Ending",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "Bullseye! The orange ball drops straight into the golden cup. Stickman dances in victory—until the cup depresses a hidden pedestal switch, turning on every laser at once into a glowing red cage around him! He freezes, then slowly raises his hands.",
    animationDesc:
      "Ball lands in golden cup (24.3s), victory dance (24.3-26.15s), cup triggers hidden switch (26.15s), red laser cage snaps around Stickman (26.35-26.75s), Stickman freezes wide-eyed and slowly raises both hands in surrender (27.3-29.8s).",
    soundDesc: "Victory chime, hidden switch click, red laser cage alarm, sad trombone sting.",
    captionText: "I WON... BUT I'M TRAPPED! 😂",
    punchline: "Solved the maze. Forgot about the pressure plate.",
    characterAction: "Celebrates with a victory dance, freezes in shock as the laser cage drops, and raises both mitten hands.",
    propAction: "Golden cup triggers a hidden pedestal switch activating a full red laser cage around Stickman.",
  },
];

export const IMPOSSIBLE_KEYHOLE_PROMPT = `THE IMPOSSIBLE KEYHOLE SHOT 🔑😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth animation, exaggerated comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes (20x22 open), thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms (118+118px two-bone IK) connected directly to sleeves, connected small white mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

PROPS
- Tiny golden key hanging by the door frame, orange ping-pong ball (radius 16, #f97316), giant wooden door with a small brass keyhole, hardcover book ramp, two angled mirrors on stands, curved teal ramp, and red target cup (#ef4444) on the other side of the door.

SCENE FLOW
0-6s (Scene 1 — THE CHALLENGE): Stickman stands far from a giant wooden door, points at its small brass keyhole, and throws an orange ping-pong ball. It misses, hits the wood door, and bounces right back into his forehead. Caption: "THROUGH THAT TINY HOLE?!"
6-12s (Scene 2 — FIRST ATTEMPT): He builds a small book ramp and launches the ball toward the keyhole—it clips the brass rim edge and drops. Stickman furiously kicks the ramp apart. Caption: "SO CLOSE!"
12-18s (Scene 3 — THE PERFECT ANGLE): Stickman sets up two angled mirrors and a curved teal ramp, adjusts the angles carefully, and releases the ball into Mirror 1 toward the door. Caption: "CALCULATED PERFECTLY!"
18-24s (Scene 4 — THE IMPOSSIBLE SHOT): The ball bounces off Mirror 2, glides up the curved ramp, and shoots straight through the tiny keyhole while Stickman stares open-mouthed. Caption: "IT WENT THROUGH!"
24-30s (Scene 5 — THE TWIST): The cutaway reveals the ball landing cleanly inside the red target cup on the other side! Stickman celebrates wildly—until the giant door suddenly swings open, knocks him backward onto the floor, and sends his red beanie flying right through the keyhole! Caption: "THE DOOR GOT REVENGE! 😂"

YOUTUBE METADATA
- Title: He Made an IMPOSSIBLE Keyhole Trickshot! 🔑😂
- Thumbnail: THROUGH THAT HOLE?!
- Hashtags: #AngryStickman #KeyholeTrickshot #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts`;

export const IMPOSSIBLE_KEYHOLE_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Challenge",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman stands far left pointing at the tiny brass keyhole in a giant wooden door, winds up, and throws the orange ping-pong ball—only for it to smack the wood panel and ricochet into his forehead.",
    animationDesc:
      "Points at keyhole (0.4-1.4s), throws ball (2.0s), hits wood door (2.85s), rebounds straight into forehead (3.7s) and glares angrily.",
    soundDesc: "Throw whoosh, wood door thud, forehead bonk.",
    captionText: "THROUGH THAT TINY HOLE?!",
    punchline: "Target size: keyhole. Aim accuracy: forehead.",
    characterAction: "Points at the keyhole, throws hard, and stumbles back from the forehead rebound.",
    propAction: "Orange ball misses the keyhole, thuds off the giant door, and bounces back.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Attempt",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman stacks books into a small launch ramp and sends the orange ball flying toward the keyhole—it clips the brass keyhole rim edge and falls! Stickman kicks the book ramp across the floor.",
    animationDesc:
      "Builds book ramp (6.2-7.8s), launches ball (8.0s), clips brass keyhole edge (9.35s), angrily kicks ramp scattering books (10.45-11.3s).",
    soundDesc: "Book placement click, launch whoosh, brass rim clink, angry ramp kick thump.",
    captionText: "SO CLOSE!",
    punchline: "Half an inch off the brass rim.",
    characterAction: "Builds the book ramp, watches eagerly, then kicks it flying in frustration.",
    propAction: "Ball launches off the book ramp and clinks off the brass keyhole edge.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Perfect Angle",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman places two angled mirrors on stands and a curved teal ramp, tweaks the angles carefully, and releases the orange ball onto Mirror 1 to redirect across the room.",
    animationDesc:
      "Positions Mirror 1, Mirror 2 & curved ramp (12.0-14.8s), releases ball (15.8s), ricochets sharply off Mirror 1 (16.95s) toward Mirror 2.",
    soundDesc: "Mirror adjustment clicks, launch whoosh, crystalline Mirror 1 bounce ping.",
    captionText: "CALCULATED PERFECTLY!",
    punchline: "Two mirrors, one curved ramp, zero margin for error.",
    characterAction: "Fine-tunes the mirror angles and releases the ball smoothly.",
    propAction: "Mirror 1 cleanly redirects the orange ball across the room toward Mirror 2.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Impossible Shot",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "The ball bounces off Mirror 2, glides cleanly along the curved ramp, and threads straight through the small brass keyhole as the camera pans to reveal the other side while Stickman watches open-mouthed.",
    animationDesc:
      "Mirror 2 bounce (18.65s), curves up teal ramp (19.55-21.5s), camera pans to cutaway view (21.8-23.8s), ball threads cleanly through the keyhole (22.85-23.4s).",
    soundDesc: "Mirror 2 ping, curved ramp swoosh, clean keyhole thread swish.",
    captionText: "IT WENT THROUGH!",
    punchline: "Nothing but brass and air.",
    characterAction: "Walks closer and stares with jaw dropped wide open.",
    propAction: "Ball rebounds off Mirror 2, accelerates up the curved ramp, and passes straight through the keyhole.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Twist",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "On the other side of the door, the orange ball drops cleanly inside the red target cup! Stickman leaps in celebration—until the giant wooden door violently swings open, knocks him backward to the floor, and sends his red beanie flying right through the keyhole!",
    animationDesc:
      "Ball lands in red cup (24.3s), Stickman celebrates (24.3-26.1s), giant door swings open (26.15-26.7s) knocking Stickman backward while his red beanie flies cleanly through the keyhole onto the other side (26.2-27.9s).",
    soundDesc: "Cup score ding, heavy wooden door slam, beanie flight whoosh, sad trombone sting.",
    captionText: "THE DOOR GOT REVENGE! 😂",
    punchline: "Shot went through the keyhole. So did his beanie.",
    characterAction: "Cheers wildly, gets knocked backward onto the floor by the door, and glares minus his beanie.",
    propAction: "Red cup catches the ball, then the giant door swings open and launches Stickman's red beanie through the keyhole.",
  },
];

export const GIANT_SLINKY_PROMPT = `THE GIANT SLINKY TRICKSHOT 🌀😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth physics, exaggerated comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes (20x22 open), thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms (118+118px two-bone IK) connected directly to sleeves, connected small white mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

PROPS
- Giant metallic rainbow slinky with clearly visible gleaming coils, small orange ball (radius 18, #f97316), two wooden tables, wooden staircase ramp, plush living-room sofa, wooden coffee table, and red target cup (#ef4444).

SCENE FLOW
0-6s (Scene 1 — THE DISCOVERY): Stickman finds a giant metallic rainbow slinky on the floor. He stretches it wide between his hands and releases one end. The spring snaps back violently, launching the orange ball across the room off the wall and right into his forehead. Caption: "THIS SPRING IS CRAZY!"
6-12s (Scene 2 — FIRST TRICKSHOT): He stretches the slinky between two wooden tables and places the orange ball inside its coils. He releases it. The spring launches the ball high upward, misses the red cup, and drops straight into his shoe. Caption: "MORE POWER!"
12-18s (Scene 3 — THE GIANT LAUNCHER): Stickman carries the red cup to the coffee table, climbs the stairs, and stretches the giant slinky down a wooden staircase ramp into a huge coil launcher. He places the ball at the starting point and pulls the spring tight. Caption: "MAXIMUM SPRING POWER!"
18-24s (Scene 4 — IMPOSSIBLE LAUNCH): He releases the spring. The ball rockets down the ramp, loops 360° through a coil loop made from the stretched rainbow coils, bounces off the right wall, flies over the sofa, and drops toward the tiny red target cup. Caption: "THE PERFECT SHOT?!"
24-30s (Scene 5 — THE SPRING REVENGE): The orange ball lands cleanly inside the red cup! Stickman celebrates wildly—until the giant slinky recoils loose, whips across the room, wraps around him like a rainbow spring cage, and bounces him up and down while flinging his red beanie right off his head. Caption: "THE SPRING WON! 😂"

YOUTUBE METADATA
- Title: He Built a GIANT SLINKY Launcher… BIG MISTAKE! 🌀😂
- Thumbnail: SPRING POWER!
- Hashtags: #AngryStickman #SlinkyTrickshot #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts`;

export const GIANT_SLINKY_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Discovery",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman discovers a giant metallic rainbow slinky coiled on the living-room floor, stretches it wide between his hands, and snaps it—launching the orange ball off the wall straight into his forehead.",
    animationDesc:
      "Picks up slinky (0.9-1.65s), stretches wide between hands (1.65-2.95s), snap release (2.95s) launches orange ball off right wall (3.42s) back into forehead (3.85s).",
    soundDesc: "Metallic slinky stretch twang, snap release, wall bounce, forehead bonk.",
    captionText: "THIS SPRING IS CRAZY!",
    punchline: "Newton's third law, now in metallic rainbow.",
    characterAction: "Stretches the giant rainbow slinky between his hands, gasps on snap, and recoils from the forehead bonk.",
    propAction: "Rainbow slinky snaps shut and ricochets the orange ball off the wall into Stickman's forehead.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Trickshot",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman stretches the giant slinky tightly between two wooden tables, pockets the orange ball into its coils, and releases—launching it high past the red cup and straight into his lifted shoe.",
    animationDesc:
      "Stretches slinky across two tables (6.3-7.5s), pulls center coils down with orange ball (7.5-8.8s), launches high upward (8.8-9.7s), misses red cup and drops straight into lifted right shoe (10.55s).",
    soundDesc: "Table-to-table coil stretch, spring launch twang, upward whoosh, shoe plop thump.",
    captionText: "MORE POWER!",
    punchline: "Great height. Wrong target.",
    characterAction: "Pulls the table-mounted slinky back like a slingshot, watches hopefully, then scowls at his shoe.",
    propAction: "Stretched rainbow coils catapult the ball past the red cup and into Stickman's shoe.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Giant Launcher",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman sets the red cup on the coffee table, climbs the stairs, stretches the giant metallic rainbow slinky all the way down a wooden ramp with a 360-degree coil loop, loads the orange ball, and pulls the spring back to maximum tension.",
    animationDesc:
      "Carries red cup to coffee table (12.1-13.2s), climbs stairs & anchors slinky down wooden ramp with coil loop (13.8-15.8s), loads ball (16.0s) and pulls spring coils tight (16.3-17.95s).",
    soundDesc: "Running footsteps, cup placement click, deep giant spring stretch, high-tension coil groan.",
    captionText: "MAXIMUM SPRING POWER!",
    punchline: "Staircase + wooden ramp + full coil loop = pure chaos.",
    characterAction: "Sets up the cup, sprints up the stairs, places the ball, and braces hard pulling the coils back.",
    propAction: "Rainbow slinky stretches down the wooden stair ramp into a circular coil loop.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Impossible Launch",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Stickman releases the giant slinky! The orange ball rockets down the ramp, zooms 360 degrees through the stretched rainbow coil loop, bounces off the living-room wall, flies cleanly over the sofa, and arcs toward the tiny red target cup.",
    animationDesc:
      "Mega release (18.0s) shoots ball down ramp (18.0-18.85s), loops 360° inside rainbow coils (18.85-19.95s), bounces off right wall (21.05s), arcs over plush sofa (21.05-22.8s), descends toward red cup (22.8-24.25s).",
    soundDesc: "Explosive slinky launch twang, fast coil-loop whoosh, crisp wall bounce, rising suspense tempo.",
    captionText: "THE PERFECT SHOT?!",
    punchline: "Through the coils, off the wall, over the sofa—could it actually go in?!",
    characterAction: "Releases the spring, sprints down the stairs to watch, and leans forward holding his breath.",
    propAction: "Ball whips through the 360° rainbow coil loop, wall-bounces, clears the sofa, and targets the red cup.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Spring Revenge",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "Swish! The orange ball drops straight into the red cup. Stickman leaps in victory—until the giant rainbow slinky snaps loose, whips across the room, wraps around him like a spring cage, bounces him up and down, and flings his red beanie right off his head!",
    animationDesc:
      "Ball lands inside red cup (24.25s), Stickman celebrates (24.3-26.0s), slinky recoils loose (26.0-26.55s) and wraps him in a rainbow spring cage, bouncing him 3 times (26.65-29.5s) while flinging his red beanie off his head (26.65-27.8s).",
    soundDesc: "Cup victory chime, sudden spring recoil snap, spring-cage wrap, beanie fly whoosh, heavy spring boings, sad trombone sting.",
    captionText: "THE SPRING WON! 😂",
    punchline: "Cup scored. Beanie lost. Slinky undefeated.",
    characterAction: "Jumps cheering, gasps as the coils whip toward him, and bounces helplessly bald-headed inside the spring cage.",
    propAction: "Giant rainbow slinky wraps around Stickman as a bouncing spring cage and launches his red beanie across the floor.",
  },
];

export const LONGEST_RULER_PROMPT = `THE WORLD'S LONGEST RULER SHOT 📏😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth physics, exaggerated comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes (20x22 open), thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms (118+118px two-bone IK) connected directly to sleeves, connected small white mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

PROPS
- Small classroom ruler (#facc15), giant bright yellow rulers (#facc15) with black centimeter/inch tick marks, small orange ball (radius 18, #f97316), red target cup, stacked books supporting every ramp, wooden picket fence, blue garden trampoline, and backyard basketball hoop.

SCENE FLOW
0-6s (Scene 1 — THE CRAZY IDEA): Stickman holds a normal small ruler and tries to flick an orange ball into a cup on the table. It barely rolls a few inches. An idea hits him—he pulls out an enormous bright yellow ruler. Caption: "I NEED A LONGER RULER!"
6-12s (Scene 2 — THE MEGA RAMP): He connects several giant yellow rulers into one huge sloping ramp supported on book stacks across the living room. He places the orange ball at the top and lets go; it rolls faster and faster. Caption: "THE LONGEST RULER EVER!"
12-18s (Scene 3 — THE TRICKSHOT BEGINS): The ball flies off the living-room ramp, bounces off a stack of books onto the doorway ruler, and shoots straight through the open garden door while Stickman sprints after it. Caption: "DON'T STOP NOW!"
18-24s (Scene 4 — THE IMPOSSIBLE DISTANCE): Outside, the ball speeds down the garden ruler, launches over the picket fence, bounces high off a trampoline, and arcs toward the basketball hoop. Caption: "THE FINAL SHOT!"
24-30s (Scene 5 — THE UNEXPECTED ENDING): The orange ball drops cleanly through the hoop! Stickman celebrates—until the entire ruler structure collapses behind him like dominoes, flicks the final ruler upward, and catapults Stickman straight into the empty basketball hoop basket where he sits wedged looking grumpy. Caption: "I BECAME THE FINAL SHOT! 😂"

YOUTUBE METADATA
- Title: He Built the LONGEST RULER… for ONE IMPOSSIBLE SHOT! 📏😂
- Thumbnail: HOW LONG IS THIS?!
- Hashtags: #AngryStickman #RulerTrickshot #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts`;

export const LONGEST_RULER_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Crazy Idea",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman flicks a tiny orange ball with a normal school ruler toward a red cup on his table, watches it stall inches short, gets a lightbulb idea, and hauls out a giant bright yellow ruler.",
    animationDesc:
      "Flicks normal ruler (1.25s), ball rolls slightly and stops (1.4-2.5s), lightbulb idea spark (3.65s), pulls out giant 600px yellow ruler (4.15-5.8s).",
    soundDesc: "Tiny ruler twang, idea ding, big ruler pull whoosh.",
    captionText: "I NEED A LONGER RULER!",
    punchline: "Small ruler, tiny roll. Big ruler, big trouble.",
    characterAction: "Flicks the ball impatiently, scowls, then grins wide holding an oversized yellow ruler.",
    propAction: "Small orange ball stalls mid-table; giant yellow ruler enters frame.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "The Mega Ramp",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman snaps multiple giant yellow rulers together onto sturdy book stacks across the living room, climbs up, sets the orange ball at the top, and lets it accelerate down the mega ramp.",
    animationDesc:
      "Snaps giant rulers A->B->C onto book stacks (6.4s, 7.2s), places orange ball at top (8.4s), ball accelerates smoothly along the sloping yellow mega ramp (8.8-12.0s).",
    soundDesc: "Mechanical ruler snap clicks, ball placement thump, accelerating ramp whoosh.",
    captionText: "THE LONGEST RULER EVER!",
    punchline: "Why walk to the hoop when you can build a highway?",
    characterAction: "Locks the giant rulers onto book stacks, places the ball cleanly, and pumps his fist.",
    propAction: "Three connected yellow rulers span the living room on book stacks as the orange ball picks up speed.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Trickshot Begins",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "The orange ball launches off the living-room ramp, bounces cleanly off a stack of hardcover books onto the doorway ruler, and rockets outside into the garden while Stickman chases it.",
    animationDesc:
      "Ball clears Ruler C onto book stack bounce (12.85s), glides onto doorway Ruler D (13.45-15.6s), shoots cleanly through the open doorway while Stickman sprints past (13.4-17.8s).",
    soundDesc: "Hardcover book bounce thump, running footsteps, doorway air whoosh.",
    captionText: "DON'T STOP NOW!",
    punchline: "From the living room straight out the back door!",
    characterAction: "Sprints rapidly alongside the rolling ball with wide excited eyes.",
    propAction: "Ball ricochets off a book stack and rockets down the doorway ruler into the garden.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Impossible Distance",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "In the sunny backyard garden, the orange ball blazes down the final yellow ruler, arcs cleanly over the wooden picket fence, bounces high off a trampoline, and flies straight toward the basketball hoop!",
    animationDesc:
      "Ball speeds down Garden Ruler E (18.85s), arcs over picket fence, hits blue trampoline center (21.25s), and launches high toward the backyard basketball hoop.",
    soundDesc: "Garden ramp whoosh, stretched spring trampoline boing, rising suspense build.",
    captionText: "THE FINAL SHOT!",
    punchline: "Fence cleared. Trampoline primed. Eyes on the rim.",
    characterAction: "Skids to a stop in the garden watching the high arc with clenched fists.",
    propAction: "Final ruler launches the ball off the garden trampoline toward the hoop.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Unexpected Ending",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "The tiny orange ball swishes cleanly through the basketball hoop! Stickman leaps in celebration—then hears the connected rulers collapse like dominoes behind him, flicking the final giant ruler upward to catapult Stickman straight into the empty hoop basket where he hangs wedged staring angrily!",
    animationDesc:
      "Orange ball swishes hoop (24.35s), Stickman celebrates (24.45-26.0s), rulers collapse like dominoes (26.05-26.85s), final ruler catapults Stickman (27.15-28.35s) cleanly into the empty basketball hoop basket where he sits wedged glaring angrily.",
    soundDesc: "Clean net swish, victory chime, collapsing domino clacks, giant ruler catapult flick, basket plop, sad trombone sting.",
    captionText: "I BECAME THE FINAL SHOT! 😂",
    punchline: "Perfect trickshot. Slightly cramped landing.",
    characterAction: "Celebrates wildly, gasps at the collapsing rulers, rockets through the air, and glares angrily wedged inside the basketball net.",
    propAction: "Collapsing ruler ramp catapults Stickman cleanly into the hoop net.",
  },
];

export const HUNDRED_BALL_PROMPT = `THE 100-BALL CHAIN REACTION ⚽😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth physics, exaggerated comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes (20x22 open), thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms (118+118px two-bone IK) connected directly to sleeves, connected small white mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

PROPS
- 100 colorful balls (orange #f97316, blue #3b82f6, green #22c55e, pink #ec4899, yellow #eab308, purple #a855f7, cyan #06b6d4, red #ef4444), domino rows, teal ramps, amber seesaw, spring bumpers, purple circular loop track, giant bottom funnel, giant ceiling basketball hoop, and giant red target button.

SCENE FLOW
0-6s (Scene 1 — THE FIRST BALL): Stickman places one tiny orange ball at the top of a long ramp. He flicks it. It rolls down and knocks over the first domino. Stickman grins confidently. Caption: "JUST ONE BALL..."
6-12s (Scene 2 — THE CHAIN BEGINS): The dominoes fall into a seesaw. The seesaw launches a blue ball into a row of balls. Ten colorful balls roll down different ramps, triggering more dominoes. Caption: "IT'S STARTING!"
12-18s (Scene 3 — TOTAL CHAOS): Dozens of balls roll through tunnels, bounce off springs, spin around circular tracks, and knock over more dominoes. Stickman watches with excitement. Caption: "100 BALLS ACTIVATED!"
18-24s (Scene 4 — THE FINAL SHOT): All the balls funnel into one giant ramp. The last ball launches upward, bounces off a wall, and flies toward a tiny red target button. Stickman holds his breath. Caption: "THE FINAL SHOT!"
24-30s (Scene 5 — THE SURPRISE): The ball hits the red button perfectly. A giant basketball hoop drops from the ceiling. The final ball shoots through it and scores. Stickman celebrates, but the remaining balls suddenly spill out of the machine and bury him in a colorful pile. Only his red beanie remains visible. Caption: "100 BALLS... 1 VICTIM! 😂"

YOUTUBE METADATA
- Title: He Started ONE Ball… Then 100 BALLS Went Crazy! ⚽😂
- Thumbnail: 100 BALLS?!
- Hashtags: #AngryStickman #ChainReaction #100Balls #Trickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts`;

export const HUNDRED_BALL_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The First Ball",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman sets one tiny orange ball at the top of a long ramp, flicks it cleanly, and grins smugly as it rolls down to tip over the first row of ivory dominoes.",
    animationDesc:
      "Places orange ball (0.85s), flicks down Ramp 1 (1.25s), Domino Row A cascades sequentially (2.95-4.3s), Stickman puts fists on hips grinning smugly.",
    soundDesc: "Placement thump, flick whoosh, ascending domino clacks.",
    captionText: "JUST ONE BALL...",
    punchline: "Small flick, massive chain reaction.",
    characterAction: "Places one ball carefully, flicks it, and stands grinning confidently.",
    propAction: "Orange ball rolls down Ramp 1 and tips all six dominoes toward the seesaw.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "The Chain Begins",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "The last domino slams the seesaw, launching a blue ball upward into a 10-ball rack. Ten colorful balls pour down double ramps and crash through Domino Row B to trip the overhead 100-ball hopper latch!",
    animationDesc:
      "Domino #6 hits seesaw (6.25s), seesaw launches blue ball into rack (6.55-7.6s), 10 colorful balls race down Ramp 2A/2B into Domino Row B (7.6-11.5s), pulling trigger cable.",
    soundDesc: "Seesaw thump, spring launch boing, rack latch click, Domino Row B clacks.",
    captionText: "IT'S STARTING!",
    punchline: "From 1 ball to 10—now the dominoes hit the master latch.",
    characterAction: "Watches the seesaw launch wide-eyed and points excitedly as 10 balls race down.",
    propAction: "Seesaw flings blue ball up to release 10 balls across two ramps into the overhead trigger.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "Total Chaos",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "The overhead glass hopper snaps open and unleashes all remaining colorful balls! Wave after wave rushes through translucent glass tunnels, bounces off golden springs, zips around a 360-degree loop track, and knocks down Domino Row C!",
    animationDesc:
      "Hopper gate opens (12.0s), 88 balls cascade through S-tunnel, Spring Bumpers 1 & 2, 360° circular loop track, and Domino Row C (12.0-18.0s) as Stickman cheers excitedly.",
    soundDesc: "Hopper latch click, escalating spring boings, tunnel loop whoosh, Domino Row C clacks.",
    captionText: "100 BALLS ACTIVATED!",
    punchline: "Pure colorful kinetic overload.",
    characterAction: "Jumps and pumps fists with wide-eyed excitement watching all 100 balls fly.",
    propAction: "100 colorful balls fill the S-tunnel, loop-de-loop, spring bumpers, and bottom funnel.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Final Shot",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "All 100 balls funnel down the giant ramp into the holding chamber while the last hero ball rockets off the launch kicker, ricochets off the upper wall bumper, and streaks toward the red target button while Stickman holds his breath!",
    animationDesc:
      "Balls fill holding chamber (18.0-20.4s), hero ball launches off orange kicker (20.65s), bounces off upper-left yellow bumper (21.85s), and arcs toward the red wall button as Stickman clutches his breath.",
    soundDesc: "Kicker spring launch boing, sharp wall bounce, rising suspense tempo.",
    captionText: "THE FINAL SHOT!",
    punchline: "Ninety-nine balls banked. One ball left for glory.",
    characterAction: "Crouches forward clenching both fists and holding his breath.",
    propAction: "Hero ball launches off the funnel kicker, bounces off the upper bumper, and targets the red button.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Surprise",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "Bullseye on the red target button! A giant basketball hoop drops smoothly from the ceiling and the final ball swishes right through it! Stickman leaps in celebration—until the bottom machine hatch bursts open, spilling all remaining balls across the room to bury him completely until only his red beanie sticks out!",
    animationDesc:
      "Red button hit (24.35s) drops ceiling basketball hoop (24.35-25.0s), hero ball swishes net (25.45s), Stickman celebrates (25.6-26.9s), holding-chamber hatch bursts open spilling 99 balls to bury Stickman under a mountain leaving only his red beanie visible (26.95-28.5s).",
    soundDesc: "Button chime + hydraulic hoop drop, clean net swish, victory chime, roaring 100-ball avalanche clatter, sad trombone.",
    captionText: "100 BALLS... 1 VICTIM! 😂",
    punchline: "Great trickshot. Unfortunate ball storage.",
    characterAction: "Celebrates wildly, gasps as the avalanche rushes toward him, and gets buried with only his red beanie poking out.",
    propAction: "Red button drops ceiling hoop for a swish, then chamber hatch unleashes a colorful 100-ball pile over Stickman.",
  },
];

export const IMPOSSIBLE_PINBALL_PROMPT = `THE IMPOSSIBLE PINBALL TRICKSHOT 🎮😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth physics, exaggerated comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes, thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms connected directly to sleeves, connected small white rounded mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

PROPS
- Giant arcade pinball machine, shiny silver ball, three red bumpers, yellow flippers, giant spinning obstacles, moving platforms, spinning bonus ring, glowing target hole, and bottom-right PRIZE slot.

SCENE FLOW
0-6s (Scene 1 — THE CHALLENGE): Stickman discovers a giant pinball machine, drops a silver ball into the launcher, and pulls the lever. The ball shoots out, misses every target, escapes the return chute, and hits his forehead. Caption: "LET'S MAKE THE IMPOSSIBLE SHOT!"
6-12s (Scene 2 — FIRST COMBO): He launches another ball. It hits three red bumpers, bounces off a wall, and narrowly misses the glowing target hole. Caption: "THREE PERFECT BOUNCES!"
12-18s (Scene 3 — ULTIMATE UPGRADE): Stickman activates giant spinning bumpers and moving platforms. The silver ball races through the machine, bouncing faster with every hit. Caption: "MAXIMUM PINBALL POWER!"
18-24s (Scene 4 — THE FINAL SHOT): The ball hits a yellow flipper, launches into the air, passes through a spinning ring, bounces off the top red bumper, and drops toward the tiny glowing target hole. Caption: "ONE LAST BOUNCE!"
24-30s (Scene 5 — THE TWIST): The ball lands perfectly in the glowing target hole. The machine flashes a huge WIN sign. Stickman celebrates—then the machine launches him like a pinball! He bounces off three giant bumpers and lands inside the PRIZE slot. Caption: "I'M THE JACKPOT! 😂"

YOUTUBE METADATA
- Title: He Built an IMPOSSIBLE Pinball Trickshot! 🎮😂
- Thumbnail: PINBALL CHAOS!
- Hashtags: #AngryStickman #Pinball #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts`;

export const IMPOSSIBLE_PINBALL_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Challenge",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman discovers a giant arcade pinball machine, drops a shiny silver ball into the launcher, and pulls the red plunger lever. The ball shoots over the arch, misses every bumper, exits the return chute, and bonks his forehead!",
    animationDesc:
      "Drops ball into feed (1.5s), pulls red lever (1.75-2.35s), launches ball over arch (2.35-3.45s), exits side chute and bonks forehead (3.78s), reacts dazed and angry.",
    soundDesc: "Mechanical drop click, plunger spring twang, forehead cartoon bonk.",
    captionText: "LET'S MAKE THE IMPOSSIBLE SHOT!",
    punchline: "Every target missed. Forehead squarely hit.",
    characterAction: "Drops ball in launcher, pulls lever, gets bonked on the forehead, and scowls.",
    propAction: "Silver ball shoots over the top arch and out the return chute into his head.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Combo",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman loads another silver ball and launches! It ricochets cleanly off all three red bumpers, bounces off the right wall rail, and narrowly grazes past the glowing target hole.",
    animationDesc:
      "Picks up ball and loads (6.0-6.85s), pulls & fires (7.45s), hits Red Bumper 1 (8.55s), Bumper 2 (9.15s), Bumper 3 (9.75s), wall rail (10.30s), narrowly misses glowing target hole rim (10.85s).",
    soundDesc: "Plunger launch, ascending three bumper chimes, wall bounce, rim clink.",
    captionText: "THREE PERFECT BOUNCES!",
    punchline: "Three red bumpers down—missed the hole by an inch.",
    characterAction: "Loads ball, watches eagerly, and clenches fists furiously on the rim miss.",
    propAction: "Silver ball bounces cleanly across B1, B2, B3, and right wall before draining.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "Ultimate Upgrade",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman slams the glowing UPGRADE button! Giant spinning obstacles and sliding neon platforms power on as the silver ball accelerates across every bumper, spinner, and moving platform.",
    animationDesc:
      "Hits upgrade button (12.40s) activating spinners & moving platforms, launches ball (13.20s), speeds through Bumper 1 (14.05s), Spinner 1 (14.55s), Bumper 3 (15.05s), Platform 1 (15.60s), Spinner 2 (16.15s), Platform 2 (16.70s), and Right Wall (17.25s).",
    soundDesc: "Power-up surge, turbo plunger launch, rapid ascending bumper & ping hits.",
    captionText: "MAXIMUM PINBALL POWER!",
    punchline: "Spinning blades, sliding platforms, full arcade overdrive.",
    characterAction: "Slams upgrade button, fires plunger, and cheers wildly as speed ramps up.",
    propAction: "Ball ricochets across all active bumpers, spinners, and moving platforms toward the yellow flipper.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Final Shot",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Stickman hits the yellow flipper button! The left yellow flipper launches the silver ball skyward cleanly through the spinning bonus ring, bounces once off the upper red bumper, and drops toward the tiny glowing target hole!",
    animationDesc:
      "Slams yellow flipper button (18.42s), flipper blasts ball up through center of Spinning Ring (19.65s), bounces off Bumper 2 (21.35s), descends in slow motion toward Glowing Target Hole (21.35-24.15s).",
    soundDesc: "Flipper solenoid snap, bonus ring swish, top bumper chime, suspense tempo.",
    captionText: "ONE LAST BOUNCE!",
    punchline: "Through the spinning ring—straight for the glowing hole.",
    characterAction: "Slams flipper button, then crouches gripping fists holding his breath.",
    propAction: "Yellow flipper sends silver ball through spinning ring into final slow-motion descent.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Twist",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "BULLSEYE! The silver ball drops straight into the glowing target hole! The giant marquee flashes WIN and confetti bursts as Stickman celebrates—until a hidden spring pad launches HIM into the machine, bouncing off all three giant bumpers straight into the PRIZE slot!",
    animationDesc:
      "Ball locks into target hole (24.15s), WIN marquee flashes & Stickman dances (24.15-25.80s), floor spring pad launches Stickman (25.85s) off Bumper 1 (26.55s), Bumper 2 (27.15s), Bumper 3 (27.75s), landing head-visible inside the PRIZE slot (28.55s).",
    soundDesc: "Jackpot fanfare, spring launch boing, three giant bumper chimes, slot thud, sad trombone sting.",
    captionText: "I'M THE JACKPOT! 😂",
    punchline: "Beat the pinball machine. Became the grand prize.",
    characterAction: "Dances in triumph, gets catapulted like a pinball across 3 bumpers, and glares wedged in the PRIZE slot.",
    propAction: "Machine flashes WIN & JACKPOT while three red bumpers ping Stickman straight into the PRIZE compartment.",
  },
];

export const HOT_SHOT_PROMPT = `THE 1,000-DEGREE HOT SHOT 🔥😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth physics, exaggerated comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes, thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms connected directly to sleeves, connected small white rounded mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.
- Oversized translucent cyan safety goggles worn over his eyes from 4.15s onward (eyes and eyebrows remain 100% readable).

PROPS
- Glowing 1,000-degree orange trickshot ball (yellow core + cartoon wavy heat shimmer lines, no realistic fire), heat-resistant metal ramps, springboard, three spinning metal rings, ice blocks (nearby ice cube, thin ice obstacle, giant ice wall, ice pit), narrow metal hoop, and golden target cup.

SCENE FLOW
0-6s (Scene 1 — THE HOT EXPERIMENT): Stickman places the glowing orange ball on a metal ramp. Heat radiates and melts a nearby ice cube into a puddle. He puts on oversized safety goggles and grins. Caption: "1,000-DEGREE BALL?!"
6-12s (Scene 2 — FIRST LAUNCH): He releases the ball. It races down the heat-resistant metal ramp, melts cleanly through a thin ice obstacle, and launches off a springboard as Stickman cheers. Caption: "TOO HOT TO STOP!"
12-18s (Scene 3 — THE HOT MAZE): The ball passes through three spinning metal rings, melts a clean hole straight through a giant ice wall, and bounces off another metal ramp. Caption: "ULTIMATE HEAT TRICKSHOT!"
18-24s (Scene 4 — FINAL TARGET): The ball flies over an ice pit, threads through a narrow metal hoop, and dives straight toward a tiny golden target cup. Caption: "PERFECT LANDING!"
24-30s (Scene 5 — THE TWIST): The ball drops into the golden cup! Stickman leaps over the ice pit to celebrate—until the cup glows red-hot and rockets the ball upward onto his beanie! His beanie puffs cartoon smoke while Stickman frantically pats it out with both hands. Caption: "MY BEANIE!!! 😂"

YOUTUBE METADATA
- Title: He Tried a 1,000-DEGREE Trickshot… BIG MISTAKE! 🔥😂
- Thumbnail: TOO HOT!!!
- Hashtags: #AngryStickman #HotShot #Trickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts`;

export const HOT_SHOT_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Hot Experiment",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman places a glowing 1,000-degree orange ball on top of a heat-resistant metal ramp. Heat shimmer melts a nearby ice cube into a puddle as Stickman puts on oversized safety goggles and grins.",
    animationDesc:
      "Places glowing ball at top of Metal Ramp 1 (1.35s), heat radiates melting nearby ice cube (1.6-4.0s), slips on oversized cyan safety goggles and grins (4.15s).",
    soundDesc: "Mechanical click, steam heat sizzle, confidence ding.",
    captionText: "1,000-DEGREE BALL?!",
    punchline: "Ice melts on contact. Safety goggles activated.",
    characterAction: "Places glowing ball on ramp, watches ice melt, puts on oversized goggles and grins.",
    propAction: "Glowing orange ball radiates wavy heat lines and melts the nearby ice cube.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Launch",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman releases the glowing ball! It races down the metal ramp, melts cleanly through a thin ice obstacle, and launches high off a springboard while Stickman cheers.",
    animationDesc:
      "Releases ball down Metal Ramp 1 (6.65s), slices through thin ice obstacle (8.45s), hits springboard pad (9.90s) and rockets into Scene 3 while Stickman cheers.",
    soundDesc: "Launch whoosh, crisp ice-melt sizzle, springboard boing.",
    captionText: "TOO HOT TO STOP!",
    punchline: "Thin ice stands zero chance against 1,000 degrees.",
    characterAction: "Releases ball and cheers wildly with raised fists.",
    propAction: "Ball speeds down metal ramp, melts thin ice obstacle, and bounces off springboard.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Hot Maze",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "The camera tracks the ball through three spinning metal rings, straight through the middle of a giant ice wall, and off a heat-resistant metal bounce ramp.",
    animationDesc:
      "Passes spinning Ring 1 (12.65s), Ring 2 (13.55s), Ring 3 (14.45s), melts clean circular tunnel through Giant Ice Wall (15.55s), bounces off Metal Ramp 2 (16.65s).",
    soundDesc: "Three rising ring chimes, giant ice-wall steam hiss, metallic rim clink.",
    captionText: "ULTIMATE HEAT TRICKSHOT!",
    punchline: "Three spinning rings and a solid wall of ice—melted clean through.",
    characterAction: "Runs enthusiastically behind the action wearing his oversized safety goggles.",
    propAction: "Ball threads spinning metal rings, tunnels through giant ice wall, and rebounds off metal ramp.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Final Target",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "The glowing ball arcs high over a steaming ice pit, threads cleanly through a narrow metal hoop, and dives straight toward the tiny golden target cup!",
    animationDesc:
      "Flies high over Ice Pit (18.0-20.8s), passes cleanly through narrow metal hoop (20.85s), dives toward golden target cup rim (21.0-24.15s).",
    soundDesc: "Hoop swish, suspenseful tempo build toward the cup.",
    captionText: "PERFECT LANDING!",
    punchline: "Over the ice pit, through the narrow hoop, locked on gold.",
    characterAction: "Stops at the edge of the ice pit, clasping both hands in suspense.",
    propAction: "Glowing orange ball soars across the ice pit through the narrow hoop toward the golden cup.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Twist",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "BULLSEYE! The glowing ball drops into the golden cup! Stickman leaps over the ice pit to celebrate—then the cup glows red-hot, rockets the ball onto his red beanie, and puffs cartoon smoke as Stickman frantically pats his head!",
    animationDesc:
      "Ball scores in golden cup (24.15s), Stickman leaps over Ice Pit to celebrate (24.2-25.8s), cup overheats bright red (25.85s) and rockets ball upward (26.15s) onto Stickman's beanie (27.15s); beanie puffs cartoon smoke as he frantically pats with both hands (27.25-30.0s).",
    soundDesc: "Victory ding, overheat sizzle, red-hot cup launch pop, head bonk, rapid pats, sad trombone sting.",
    captionText: "MY BEANIE!!! 😂",
    punchline: "Made the 1,000-degree shot. Paid the fashion price.",
    characterAction: "Celebrates beside the cup, freezes in shock, then frantically pats his smoking beanie.",
    propAction: "Golden cup turns red-hot and ejects the glowing ball straight onto Stickman's beanie.",
  },
];

export const MAGNETIC_MAZE_PROMPT = `THE MAGNETIC MAZE TRICKSHOT 🧲😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth physics, exaggerated comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes, thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms connected directly to sleeves, connected small white rounded mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

PROPS
- Shiny silver metal ball, giant red and blue horseshoe magnets, transparent maze, curved magnetic tunnel, vertical wall, metal ramps, spinning obstacle, golden target cup, and a giant metal chair.

SCENE FLOW
0-6s (Scene 1 — THE DISCOVERY): Stickman places a shiny silver ball on a table beside a giant red horseshoe magnet. The ball suddenly flies toward the magnet and snaps onto it! Stickman gets an idea and grins. Caption: "I CAN CONTROL THE BALL!"
6-12s (Scene 2 — FIRST ATTEMPT): He places two horseshoe magnets on opposite sides of a transparent maze. Moving the magnets pulls the ball through the maze—until overpowered repulsion blasts the ball backward straight onto his forehead! Caption: "TOO MUCH POWER!"
12-18s (Scene 3 — THE MAGNETIC UPGRADE): Stickman adds four magnets beneath the maze. He moves them carefully, guiding the silver ball around sharp corners, through a curved tunnel, and straight up a vertical wall. Caption: "MAGNETIC CONTROL!"
18-24s (Scene 4 — IMPOSSIBLE SHOT): He positions the final blue magnet above a tiny golden cup. The ball climbs the wall, flies across a gap, circles a spinning obstacle, and drops toward the target. Caption: "DON'T LOSE CONTROL!"
24-30s (Scene 5 — THE TWIST): The ball lands perfectly in the golden cup! Stickman celebrates. Suddenly, all the magnets activate together and pull every metal object in the room toward him—his red beanie flies off onto the overhead magnet, and a giant metal chair sticks to his back! Caption: "EVERYTHING IS MAGNETIC! 😂"

YOUTUBE METADATA
- Title: He Built a MAGNETIC Maze… The Ball Went CRAZY! 🧲😂
- Thumbnail: MAGNET POWER!
- Hashtags: #AngryStickman #MagneticMaze #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts`;

export const MAGNETIC_MAZE_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Discovery",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman places a shiny silver metal ball on a lab table beside a giant red horseshoe magnet. The ball suddenly zooms across the table and snaps onto the magnet as Stickman gets a bright idea.",
    animationDesc:
      "Places silver ball on table (1.15s), red magnet pulses with field waves (1.95s), ball rockets and snaps onto magnet poles (2.75s), Stickman reacts in shock then grins and points (3.85s).",
    soundDesc: "Metal placement clink, electromagnetic pull hum, snap clank, idea ding.",
    captionText: "I CAN CONTROL THE BALL!",
    punchline: "Silver ball meets giant magnet. Instant inspiration.",
    characterAction: "Places silver ball, jumps back in surprise, then points excitedly with a grin.",
    propAction: "Shiny silver ball flies across the table and sticks onto the red horseshoe magnet.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Attempt",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman positions blue and red horseshoe magnets on opposite sides of a transparent maze. Pulling the ball inside works briefly—until overloaded magnetic power blasts it straight back into his forehead!",
    animationDesc:
      "Moves side magnets pulling ball across maze tracks (6.85-8.8s), magnets surge overpowered (9.0-9.45s), ball shoots backward out of the maze and bonks his forehead (9.95s).",
    soundDesc: "Escalating magnet hums, power surge whoosh, forehead cartoon bonk.",
    captionText: "TOO MUCH POWER!",
    punchline: "Overloaded the magnets. Took a metal ball to the forehead.",
    characterAction: "Steers opposite magnets, strains with effort, gets bonked on the forehead, and scowls.",
    propAction: "Silver ball zigzags through transparent maze before firing backward onto his head.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Magnetic Upgrade",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman slots four alternating red and blue magnets beneath the transparent maze! Guiding them smoothly, the silver ball rounds sharp corners, zips through a curved tunnel, and climbs a vertical wall.",
    animationDesc:
      "Slots 4 bottom magnets (12.35s), guides ball around sharp corners (12.9-14.7s), sweeps through curved U-tunnel (14.7-15.85s), and climbs straight up the vertical wall (15.85-18.0s).",
    soundDesc: "Mechanical slot click, smooth rising electromagnetic attraction hums.",
    captionText: "MAGNETIC CONTROL!",
    punchline: "Four bottom magnets turn chaos into precision.",
    characterAction: "Steers confidently with a mini handheld magnet while trotting alongside the course.",
    propAction: "Ball follows bottom magnets around corners, through tunnel, and up the vertical wall.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "Impossible Shot",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "With the final blue horseshoe magnet positioned directly above the tiny golden cup, the silver ball clears the top metal ramp, flies across the gap, orbits a spinning obstacle, and drops toward the target!",
    animationDesc:
      "Clears top wall ramp (18.0-19.05s), leaps gap (19.05-20.55s), orbits spinning cross obstacle (20.55-22.55s), pulls to overhead magnet (22.55-23.35s), and drops straight toward golden cup (23.35-24.15s).",
    soundDesc: "Launch whoosh, high-pitched orbital magnet hum, suspense build.",
    captionText: "DON'T LOSE CONTROL!",
    punchline: "Over the gap, around the spinner, locked above gold.",
    characterAction: "Points toward overhead magnet, then crouches gripping both fists in suspense.",
    propAction: "Silver ball orbits spinning obstacle and descends straight toward the golden target cup.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Twist",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "BULLSEYE! The silver ball drops straight into the golden cup! Stickman dances in triumph—then ALL magnets activate at once, yanking his red beanie off and slamming a giant metal chair onto his back!",
    animationDesc:
      "Ball scores in cup & confetti pops (24.15s), Stickman celebrates (24.15-25.75s), all magnets overload (25.80s), red beanie flies off onto overhead magnet (26.35-27.15s), wrench/bolts & giant metal chair slam onto his back (27.65s).",
    soundDesc: "Victory ding, all-magnets overload surge, zip whoosh, heavy chair metal clank, sad trombone sting.",
    captionText: "EVERYTHING IS MAGNETIC! 😂",
    punchline: "Nailed the magnetic trickshot. Became a human magnet.",
    characterAction: "Dances in triumph, freezes in shock as his beanie flies off, and hunches with a giant metal chair stuck to his back.",
    propAction: "All magnets flare cyan, red beanie sticks to the overhead magnet, and metal objects + giant chair stick to Stickman.",
  },
];

export const SPIRAL_STAIRCASE_PROMPT = `THE IMPOSSIBLE SPIRAL STAIRCASE SHOT 🌀😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth physics, exaggerated comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes, thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms connected directly to sleeves, connected small white rounded mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

PROPS
- Orange basketball, giant spiral staircase (consistent clockwise-descending helix), curved cyan safety rails, pile of colorful cushions, three rotating platforms, bottom curved launch ramp, circular bonus hoop, and basketball hoop on the opposite wall.

SCENE FLOW
0-6s (Scene 1 — THE CHALLENGE): Stickman stands at the top of a giant spiral staircase. He places an orange basketball on the first step and pushes it. It rolls down two steps, flies off the unrailed edge, and bonks his head! Caption: "ONE STAIRCASE. ONE SHOT!"
6-12s (Scene 2 — FIRST ATTEMPT): He adds curved rails along the staircase. The ball speeds smoothly around the spiral curve—then flies off an open corner and crashes into a pile of cushions! Caption: "CONTROL THE CURVE!"
12-18s (Scene 3 — THE UPGRADE): Stickman installs three rotating platforms between staircase levels and launches the ball again. It rolls down the spiral, bounces cleanly across all three spinning platforms, and exits downward! Caption: "PERFECT SPIRAL!"
18-24s (Scene 4 — THE FINAL SHOT): Reaching the bottom, the ball rolls onto a curved ramp, launches upward cleanly through a circular hoop, and flies toward the basketball basket on the opposite wall! Caption: "DON'T MISS!"
24-30s (Scene 5 — THE TWIST): The ball drops perfectly through the basket! Stickman celebrates at the top—then the staircase suddenly starts rotating like a giant carousel! He loses his balance, slides down every step, launches up the ramp, and lands wedged inside the basketball basket! Caption: "I BECAME THE BALL! 😂"

YOUTUBE METADATA
- Title: He Made a SPIRAL STAIRCASE Trickshot… INSANE! 🌀😂
- Thumbnail: THE CRAZY SPIRAL!
- Hashtags: #AngryStickman #SpiralStaircase #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts`;

export const SPIRAL_STAIRCASE_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Challenge",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman stands at the top of a giant spiral staircase, places an orange basketball on the first step, and pushes it. It rolls down two steps, flies off the edge, and hits his head!",
    animationDesc:
      "Places basketball on Step 1 (1.15s), pushes it (1.65s), rolls down two steps (1.65-2.35s), flies off open edge and bonks Stickman on the head (3.05s), sparks rail idea (4.20s).",
    soundDesc: "Ball placement bounce, push whoosh, step roll ticks, forehead bonk, idea ding.",
    captionText: "ONE STAIRCASE. ONE SHOT!",
    punchline: "No rails yet. Immediate boomerang bonk.",
    characterAction: "Places basketball on top step, pushes it, gets bonked on the head, and gets an idea.",
    propAction: "Orange basketball rolls two spiral steps before flying off into Stickman's head.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Attempt",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman adds curved cyan safety rails along the spiral staircase and pushes the ball again. It gains speed around the helix before shooting off an open corner straight into a pile of cushions!",
    animationDesc:
      "Snaps curved rails onto staircase (6.15s), pushes ball (6.85s), speeds around spiral (6.85-9.45s), flies off corner gap into cushion pile (10.15s).",
    soundDesc: "Rail latch click, accelerating spiral step ticks, soft cushion crash.",
    captionText: "CONTROL THE CURVE!",
    punchline: "Half the curve controlled. Straight into the cushions.",
    characterAction: "Installs curved rails, watches excitedly, then clenches fists in frustration.",
    propAction: "Ball hugs the upper spiral rail before flying off the lower corner into cushions.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Upgrade",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman installs three rotating platforms between the lower staircase levels! He launches the ball again—it zips down the spiral, hops cleanly across every spinning platform, and exits at the bottom!",
    animationDesc:
      "Installs 3 rotating platforms & finishes lower rails (12.15s), launches ball (12.95s), jumps onto Platform 1 (14.35s), Platform 2 (15.25s), Platform 3 (16.25s), exits bottom (18.0s).",
    soundDesc: "Platform clicks, springy platform bounce boings, crisp spiral ticks.",
    captionText: "PERFECT SPIRAL!",
    punchline: "Three spinning platforms bridge the gap to the bottom.",
    characterAction: "Installs spinning platforms, launches ball, and cheers wildly from the top.",
    propAction: "Orange basketball rolls the spiral and hops cleanly between three rotating platforms.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Final Shot",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "At the bottom of the spiral staircase, the basketball rolls smoothly onto a curved steel ramp, rockets upward through a circular bonus hoop, and arcs across the room toward the basketball basket!",
    animationDesc:
      "Hits curved bottom ramp (18.0-19.35s), launches upward cleanly through circular hoop (20.85s), arcs across room toward opposite wall basketball basket (20.85-24.0s).",
    soundDesc: "Ramp launch whoosh, circular hoop ping, dramatic rising arc.",
    captionText: "DON'T MISS!",
    punchline: "Up the ramp, through the ring, aimed straight at the hoop.",
    characterAction: "Leans over top landing gripping both fists in breathless suspense.",
    propAction: "Basketball launches up curved ramp, threads circular hoop, and flies toward the wall basket.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Twist",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "SWISH! The basketball drops through the basket! Stickman celebrates—until the spiral staircase begins spinning like a giant carousel! He slides down every step, launches up the ramp, and lands wedged inside the basketball basket!",
    animationDesc:
      "Ball swishes through net & confetti bursts (24.15s), Stickman dances (24.15-25.75s), staircase spins like a carousel (25.80s), Stickman slides down spiral (26.35-28.15s), flies through hoop and lands inside the basket (29.10s).",
    soundDesc: "Clean net swish, victory ding, carousel motor spin-up, rapid slide ticks, whoosh, net swish, sad trombone sting.",
    captionText: "I BECAME THE BALL! 😂",
    punchline: "First the ball scored. Then Stickman followed it right through the hoop.",
    characterAction: "Celebrates at top, loses balance on carousel staircase, slides every step, and glares wedged in the basket.",
    propAction: "Entire spiral staircase rotates like a carousel while Stickman rides the trickshot path into the hoop.",
  },
];

export const GIANT_SCISSOR_PROMPT = `THE GIANT SCISSOR TRICKSHOT ✂️😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth physics, exaggerated comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes, thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms connected directly to sleeves, connected small white rounded mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

PROPS
- Giant silver scissors with large red handles, colorful strings visibly connected to overhead pulleys and triggers, orange ball, seesaw, 5 colorful dominoes, elevated ramp, giant pendulum ball, spring launcher, and red target cup.

SCENE FLOW
0-6s (Scene 1 — THE DISCOVERY): Stickman finds enormous silver scissors on a table. He cuts a hanging string. A small orange ball drops, rolls down a ramp, and lands inside a red cup. His eyes widen! Caption: "SCISSORS CAN MAKE TRICKSHOTS?!"
6-12s (Scene 2 — THE SETUP): He connects colorful strings to suspended balls, dominoes, and a seesaw, then carefully positions the giant scissors beside the first string. Caption: "ONE CUT STARTS EVERYTHING!"
12-18s (Scene 3 — CHAIN REACTION): SNIP! He cuts the first string. A ball drops onto the seesaw, launching another ball into dominoes, which pull a pulley string that releases a ball down an elevated ramp! Caption: "THE CHAIN REACTION!"
18-24s (Scene 4 — THE FINAL CUT): Stickman cuts the final string holding a giant pendulum ball. The pendulum swings down, hits a spring launcher, and rockets the orange ball toward a tiny red target cup! Caption: "THE PERFECT CUT!"
24-30s (Scene 5 — THE TWIST): The orange ball drops cleanly inside the cup! Stickman celebrates—then the last loose string snaps, swinging the giant scissors shut and cutting his red beanie right off his head! Caption: "SNIP! THERE GOES MY HAT! 😂"

YOUTUBE METADATA
- Title: He Used GIANT SCISSORS for an IMPOSSIBLE Trickshot! ✂️😂
- Thumbnail: ONE CUT = CHAOS!
- Hashtags: #AngryStickman #ScissorTrickshot #ChainReaction #FunnyAnimation #StickmanAnimation #YouTubeShorts`;

export const GIANT_SCISSOR_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Discovery",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman finds enormous silver scissors with bright red handles on a table. He snips a hanging string—a small orange ball drops, rolls down a ramp, and lands inside a red cup! His eyes widen in awe.",
    animationDesc:
      "Picks up giant scissors (1.25s), snips String 0 (2.15s), orange ball rolls down mini ramp (2.55s) and lands in red cup (3.35s), eyes widen & grins (3.35-5.75s).",
    soundDesc: "Scissor snip, ramp thump, cup drop clink, discovery ding.",
    captionText: "SCISSORS CAN MAKE TRICKSHOTS?!",
    punchline: "One snip drops the ball straight into the red cup.",
    characterAction: "Picks up giant scissors, snips the string, and gasps wide-eyed with a huge grin.",
    propAction: "Silver scissors cut cyan string; suspended orange ball rolls down ramp into red cup.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "The Setup",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman connects colorful cyan, purple, and gold strings to suspended balls, five dominoes, pulleys, and a seesaw—then carefully positions the giant scissors right beside the first string!",
    animationDesc:
      "Camera pans to rig & Stickman connects colorful strings (6.0-10.2s), carefully lines up giant scissors beside Cyan String 1 (10.25s).",
    soundDesc: "Mechanical setup clicks as strings latch onto pulleys and triggers.",
    captionText: "ONE CUT STARTS EVERYTHING!",
    punchline: "Every pulley, domino, and seesaw is rigged by string.",
    characterAction: "Ties colorful strings and aims the giant scissors beside the first trigger string.",
    propAction: "Colorful strings connect suspended balls, seesaw, 5 dominoes, and overhead pulleys.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "Chain Reaction",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "SNIP! Stickman cuts the first string! A ball drops onto the seesaw, launching a green ball into five dominoes—which pull a purple pulley string releasing Ball B down an elevated ramp!",
    animationDesc:
      "Snips String 1 (12.25s), Ball A drops onto seesaw (13.15s), green ball topples 5 dominoes (14.10-15.10s), Purple String 2 pulls over Pulley 2 releasing Ball B down elevated ramp (15.25-17.2s).",
    soundDesc: "Scissor snip, seesaw spring boing, 5 escalating domino clacks, pulley release whoosh, floor thump.",
    captionText: "THE CHAIN REACTION!",
    punchline: "One snip triggers seesaw, dominoes, pulley, and ramp.",
    characterAction: "Snips the first string and trots forward cheering on the chain reaction.",
    propAction: "Ball drops onto seesaw, dominoes topple, and pulley releases elevated ramp ball.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Final Cut",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Stickman cuts the final gold string holding a giant pendulum ball! The pendulum swings down, slams the spring launcher, and rockets the orange ball in a high arc toward the tiny red target cup!",
    animationDesc:
      "Cuts Gold String 3 (18.35s), giant indigo pendulum swings down (18.35-20.35s), hits yellow spring launcher (20.35s), orange ball rockets toward tiny red cup (20.4-24.0s).",
    soundDesc: "Final scissor snip, pendulum whoosh, heavy spring launcher boing.",
    captionText: "THE PERFECT CUT!",
    punchline: "Final cut unleashes the pendulum and rockets the orange ball.",
    characterAction: "Snips the final overhead string and crouches gripping both fists in suspense.",
    propAction: "Pendulum strikes spring launcher, rocketing the orange ball toward the red target cup.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Twist",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "BULLSEYE! The orange ball lands inside the red cup! Stickman celebrates—then the last loose string snaps, swinging the giant scissors shut and snipping his red beanie right off his head!",
    animationDesc:
      "Orange ball lands in red cup & confetti pops (24.15s), Stickman celebrates (24.15-25.8s), last loose string snaps (25.85s), mounted scissors swing shut & snag his red beanie on the upper silver blade (26.55-30.0s).",
    soundDesc: "Cup drop clink, victory ding, taut string snap, heavy scissor snip, whoosh, sad trombone sting.",
    captionText: "SNIP! THERE GOES MY HAT! 😂",
    punchline: "Made the impossible scissor shot. Lost his beanie to the blade.",
    characterAction: "Celebrates wildly, leaps backward in shock as his hat gets snipped, then glares at the scissors.",
    propAction: "Orange ball scores in cup; loose string snaps giant scissors shut with red beanie caught on the upper blade.",
  },
];

export const TRIPLE_GRAVITY_PROMPT = `THE TRIPLE GRAVITY TRICKSHOT 🌍😂 — 30-SECOND VERTICAL POP COMEDY
AI VIDEO PROMPT

VISUAL STYLE
Modern Pop 2D flat vector animation, vertical 9:16 (1080x1920), 24 fps, vibrant colors, thick smooth black outlines, smooth animation, exaggerated comedy. No dialogue, no logos or watermarks.

STRICT MAIN CHARACTER DESIGN — ANGRY STICKMAN (LOCKED RIG)
- Large circular white head (radius 70, 5px #17121f outline), two vertical black oval eyes, thick expressive black eyebrows, simple black mouth. No nose, ears, or hair.
- Red knitted-style beanie (#e63946) with folded lower edge (#b3222e), 5 stitches, and pom (#ff6b6b).
- Plain yellow short-sleeved T-shirt (#ffd166), thin black stick arms connected directly to sleeves, connected small white rounded mitten hands (no fingers or detached hands).
- Blue trousers (#2f5fa8), thin black legs, solid black shoes (#141414). Keep identical throughout.

PROPS
- Orange basketball, three glowing gravity zones (blue = sideways >>>, purple = upward ^^^, green = downward vvv), vertical climb wall, floating platforms with narrow gap, normal hoop, and golden target hoop.

SCENE FLOW
0-6s (Scene 1 — THE DISCOVERY): Stickman throws an orange basketball toward a normal hoop. Entering a glowing blue gravity zone on the floor, the ball suddenly falls sideways instead of down and smashes into the vertical wall. He discovers the glowing blue zone! Caption: "GRAVITY IS BROKEN?!"
6-12s (Scene 2 — FIRST GRAVITY): He rolls the ball into the blue zone. Sideways gravity pulls it against the vertical wall, making it roll upward along the wall. Stickman gets excited and points toward the golden target hoop. Caption: "SIDEWAYS GRAVITY!"
12-18s (Scene 3 — THREE GRAVITY ZONES): Stickman flips switches activating the purple (upward) and green (downward) gravity zones. The ball travels sideways up the wall, lifts upward through purple, then drops suddenly in green onto a floating platform. He grins confidently! Caption: "THREE GRAVITIES!"
18-24s (Scene 4 — THE IMPOSSIBLE SHOT): He releases the ball through all three zones. It climbs the vertical wall (blue), crosses the ceiling (purple), drops straight through the narrow gap (green), bounces off the lower floating platform, and flies toward the golden hoop! Caption: "IMPOSSIBLE TRAJECTORY!"
24-30s (Scene 5 — THE TWIST): The ball scores cleanly through the golden hoop! Stickman celebrates—then all three gravity zones activate beneath him! He gets pulled sideways, floats upside down, and sticks flat to the ceiling with his red beanie hanging down! Caption: "I FORGOT ABOUT GRAVITY! 😂"

YOUTUBE METADATA
- Title: He BROKE GRAVITY for an IMPOSSIBLE Trickshot! 🌍😂
- Thumbnail: GRAVITY IS BROKEN!
- Hashtags: #AngryStickman #GravityTrickshot #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts`;

export const TRIPLE_GRAVITY_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Discovery",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman throws an orange basketball toward a normal hoop—then the ball suddenly swerves sideways into a vertical wall! He walks closer and discovers a glowing blue gravity zone on the floor.",
    animationDesc:
      "Throws basketball toward normal hoop (1.65s), enters glowing Blue Zone (2.35s) and swerves sideways into vertical wall (2.90s), leans down inspecting the blue gravity field (4.15-5.75s).",
    soundDesc: "Dribble bounce, throw whoosh, gravity hum, wall bounce, discovery ding.",
    captionText: "GRAVITY IS BROKEN?!",
    punchline: "The ball went sideways instead of down.",
    characterAction: "Throws basketball toward the normal hoop, gasps in shock, and points at the glowing blue zone.",
    propAction: "Blue gravity zone activates and pulls the basketball sideways into the vertical wall.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Gravity",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman rolls the basketball into the glowing blue zone. Sideways gravity pins it to the vertical wall, making it roll right up the wall! He cheers excitedly and points toward the golden target hoop.",
    animationDesc:
      "Picks up ball and rolls into Blue Zone (7.65s), ball climbs vertical wall under sideways gravity (8.15-10.25s), Stickman points excitedly toward the golden hoop (10.20s).",
    soundDesc: "Roll whoosh, sideways gravity hum, excited chime, floor bounce.",
    captionText: "SIDEWAYS GRAVITY!",
    punchline: "Rolling straight up a vertical wall.",
    characterAction: "Rolls basketball into the blue zone, cheers wide-eyed, and points toward the golden hoop.",
    propAction: "Sideways blue gravity keeps the basketball rolling vertically along the wall.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "Three Gravity Zones",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman flips switches activating the purple (upward) and green (downward) zones! The ball travels sideways up the wall, lifts upward through purple, and drops straight onto a floating platform. He grins confidently.",
    animationDesc:
      "Flips Purple (12.35s) & Green (12.95s) switches, launches ball (13.65s), enters Blue -> Purple lift (14.85s) -> Green downward drop onto upper floating platform (16.45s), confident grin (16.85s).",
    soundDesc: "Switch clicks, rising/falling gravity hums, platform land thump, confidence ding.",
    captionText: "THREE GRAVITIES!",
    punchline: "Sideways, upward, then downward onto a floating platform.",
    characterAction: "Flips both gravity switches, watches all three zones chain cleanly, and grins confidently.",
    propAction: "Basketball transitions across Blue, Purple, and Green zones onto the floating platform.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Impossible Shot",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Stickman releases the ball through all three zones! It climbs the vertical wall, crosses the ceiling upside-down, drops cleanly through the narrow gap, bounces off the lower floating platform, and flies toward the golden hoop!",
    animationDesc:
      "Releases shot (18.65s), climbs wall in Blue (19.05-20.3s), crosses ceiling in Purple (20.3-21.85s), shoots down through narrow gap in Green (21.85-22.7s), bounces off angled platform toward golden hoop (22.7-24.15s).",
    soundDesc: "Release whoosh, triple gravity direction hums, floating bounce pad boing.",
    captionText: "IMPOSSIBLE TRAJECTORY!",
    punchline: "Wall climb, ceiling run, narrow-gap drop toward gold.",
    characterAction: "Releases the basketball cleanly and crouches gripping both fists in suspense.",
    propAction: "Ball climbs wall, crosses ceiling, threads narrow gap, and launches toward the golden hoop.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Twist",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "SWISH! The ball drops straight through the golden hoop! Stickman celebrates—then all three gravity zones activate beneath him! He gets pulled sideways, floats upside down, and sticks to the ceiling with his red beanie hanging down!",
    animationDesc:
      "Ball swishes through golden hoop & confetti pops (24.15s), celebrates (24.2-25.75s), triple gravity overload activates (25.80s), pulled sideways (25.85-26.6s), floats upside down (26.6-27.55s) and sticks to ceiling with red beanie dangling downward (27.55-30.0s).",
    soundDesc: "Clean swish, victory ding, triple gravity overload surge, slide whoosh, upward hum, ceiling thump, sad trombone sting.",
    captionText: "I FORGOT ABOUT GRAVITY! 😂",
    punchline: "Broke gravity to score. Ended up stuck upside down on the ceiling.",
    characterAction: "Celebrates triumphantly, gets yanked sideways, flips upside down, and glares stuck to the ceiling.",
    propAction: "All three gravity zones activate together, pinning Stickman upside down to the ceiling with his beanie hanging down.",
  },
];

export const INVISIBLE_TUBE_PROMPT = `MODERN POP 2D STICKMAN SHORT — "THE INVISIBLE TUBE TRICKSHOT" (9:16 VERTICAL · 30 SECONDS · 5 SCENES · 24 FPS · NO DIALOGUE)

CHARACTER (LOCKED ANGRY STICKMAN RIG):
- White round head (r=70) with thick black outline (#17121f), small vertical oval eyes, expressive eyebrows, red knitted beanie (#e63946), yellow T-shirt (#ffd166), blue trousers (#2f5fa8), thin black limbs, connected small rounded white mitten hands, black shoes.
- Identical character rig throughout all 5 scenes (red beanie gets knocked cleanly off his head onto the Air Pump at 27.15s).

PROPS & WORLD CONTINUITY:
- Orange ping-pong ball (always crisp & visible even inside transparent tubes), transparent tubes with faint blue outlines (connected U-bend, 360 upside-down loop, spiral coils, vertical climb, ceiling loop, vertical drop), floor Air Pump with cyan forward (>>>) and red reverse (<<<) gauge/chevrons, and persistent Red Target Cup on right pedestal.

5-SCENE TIMELINE (30 SECONDS):
- Scene 1 (0-6s) The Mystery ("WHERE DID IT GO?!"): Throws orange ball toward cup; it vanishes into an invisible U-tube, zips behind him, and shoots out behind his back. Turns left in shock and spots faint blue transparent outline.
- Scene 2 (6-12s) The Discovery ("INVISIBLE BALL TRACK!"): Connects giant transparent bend + 360 upside-down loop tube, drops ball inside; rolls through loop upside down and shoots out other end.
- Scene 3 (12-18s) The Upgrade ("THE ULTIMATE TUBE!"): Connects twisting spiral coils, vertical climb, ceiling loop, and drop chute; releases ball, loses momentum and drops just short of cup.
- Scene 4 (18-24s) The Final Shot ("FULL SPEED!"): Drops ball into Air Pump inlet and slams pump ON (cyan >>>); ball accelerates through coils, vertical climb, ceiling loop, and rockets down toward tiny red cup!
- Scene 5 (24-30s) The Twist ("THE BALL CAME BACK! 😂"): Ball lands in red cup! Stickman celebrates, then Air Pump reverses (red <<<), sucking ball backward through entire track until it shoots out the inlet and knocks his red beanie onto the Air Pump!`;

export const INVISIBLE_TUBE_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Mystery",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman throws an orange ping-pong ball toward the red cup. It enters a transparent U-tube with faint blue outlines, zips behind him, and shoots out behind his back! He spins around in shock and spots the invisible tube.",
    animationDesc:
      "Throws orange ball right (1.55s), ball enters faint transparent U-tube (1.95s), zips behind him and pops out behind his back (2.85s), turns left in shock and points at tube (4.35s).",
    soundDesc: "Toss whoosh, hollow tube enter pop, pneumatic travel whoosh, exit whoosh, floor thump, discovery ding.",
    captionText: "WHERE DID IT GO?!",
    punchline: "Thought the room was haunted. It was an invisible U-tube.",
    characterAction: "Confidently throws ball toward cup, spins around startled when it exits behind him.",
    propAction: "Transparent U-tube guides orange ball behind Stickman and pops it out behind his back.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "The Discovery",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "He discovers a giant transparent tube with curved bends and a full 360-degree upside-down loop! He drops the ball inside—it rolls smoothly through the bends, loops upside down, and shoots out the other end!",
    animationDesc:
      "Connects giant loop tube (6.35s), drops orange ball into inlet (7.65s), ball completes full 360 upside-down loop (8.6-9.8s) and shoots out right nozzle (10.3s).",
    soundDesc: "Setup click, hollow tube enter pop, loop travel whoosh, exit whoosh, floor bounce.",
    captionText: "INVISIBLE BALL TRACK!",
    punchline: "Zero friction, full visibility, 360-degree loop.",
    characterAction: "Drops the orange ball into the raised inlet and watches excitedly as it loops upside down.",
    propAction: "Orange ping-pong ball visibly loops 360 degrees inside the faint-blue transparent track.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Upgrade",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "He connects transparent tubes into the Ultimate Track: two spiral coils, a vertical climb, a ceiling loop, and a vertical drop! He drops the ball in, watches it zoom upward, then drop just short of the cup.",
    animationDesc:
      "Clips ultimate tube track together (12.35-12.95s), drops ball in (13.65s), zooms through coils and vertical drop before rolling slightly short of the red cup (16.75-17.35s).",
    soundDesc: "Twin assembly clicks, tube enter pop, loop rush whoosh, vertical drop whoosh, floor thump.",
    captionText: "THE ULTIMATE TUBE!",
    punchline: "Built the whole skyline track—just needs more air power.",
    characterAction: "Assembles the multi-loop track, drops the ball, and grimaces slightly when it stops short.",
    propAction: "Connected transparent tube track with spiral coils, vertical climb, ceiling loop, and drop chute.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Final Shot",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "He connects the floor Air Pump and slams it ON! Cyan airflow blasts the orange ball at full speed through the spiral coils, straight up the vertical climb, around the ceiling loop, and down toward the tiny red cup!",
    animationDesc:
      "Drops ball at pump inlet (18.65s), slams Air Pump ON with cyan >>> gauge (18.85s), ball rockets through twin coils (19.0-20.1s), ceiling loop (20.6-21.6s), and fires down chute toward red cup (22.9-24.15s).",
    soundDesc: "Tube enter pop, Air Pump pneumatic turbo blast, high-speed coil & ceiling loop whooshes, nozzle rocket shot.",
    captionText: "FULL SPEED!",
    punchline: "Maximum air pressure engaged.",
    characterAction: "Slams the Air Pump switch down, points upward tracking the turbo ball, and crouches for impact.",
    propAction: "Air Pump blasts cyan forward >>> airflow, rocketing the ball through every connected transparent loop.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Twist",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "DING! The orange ball lands cleanly inside the red cup! Stickman celebrates—then the Air Pump flips into REVERSE! It sucks the ball backward through every tube until it shoots out the inlet and knocks off his red beanie!",
    animationDesc:
      "Ball drops inside red cup & confetti bursts (24.15s), celebrates (24.2-25.8s), Air Pump flips to red <<< REVERSE (25.85s), ball zooms backward through track (26.15-27.15s) and knocks Stickman's red beanie onto the Air Pump (27.15-30.0s).",
    soundDesc: "Cup drop clink, victory ding, Air Pump reverse vacuum surge, backward zoom whoosh, beanie head bonk, floor thump, sad trombone sting.",
    captionText: "THE BALL CAME BACK! 😂",
    punchline: "Scored the impossible shot—and got robbed by the reverse switch.",
    characterAction: "Celebrates hands high, gasps as suction reverses, gets his red beanie knocked off, and glares deadpan.",
    propAction: "Air Pump switches to red <<< reverse, sucking ball out of the cup backward through every loop to knock off his beanie.",
  },
];

export const GIANT_GEAR_PROMPT = `MODERN POP 2D STICKMAN SHORT — "THE GIANT GEAR TRICKSHOT" (9:16 VERTICAL · 30 SECONDS · 5 SCENES · 24 FPS · NO DIALOGUE)

CHARACTER (LOCKED ANGRY STICKMAN RIG):
- White round head (r=70) with thick black outline (#17121f), small vertical oval eyes, expressive eyebrows, red knitted beanie (#e63946), yellow T-shirt (#ffd166), blue trousers (#2f5fa8), thin black limbs, connected small rounded white mitten hands, black shoes.
- Identical character rig throughout all 5 scenes (red beanie gets pulled into the reversing gears at 26.10s and snaps back onto his head stretched like a spring at 28.25s).

PROPS & CONTINUITY:
- Metallic silver gears with clearly visible teeth rotating in strictly opposite interlocking directions, silver metal ball, spring launcher, rotating ramp, spinning circular track, metal ring, small bounce ramp, and persistent golden target cup.

5-SCENE TIMELINE (30 SECONDS):
- Scene 1 (0-6s) The Discovery ("GEARS CAN LAUNCH BALLS?!"): Drops silver ball between two giant interlocking gears; they launch it straight upward onto his head.
- Scene 2 (6-12s) First Attempt ("MORE GEARS, MORE POWER!"): Connects three different-sized interlocking gears; ball transfers through all three before the final small gear launches it backward over him.
- Scene 3 (12-18s) The Mega Machine ("SIX GEARS ACTIVATED!"): Builds six interlocking gear wheels feeding a rotating ramp and spinning circular track; silver ball travels cleanly through every stage.
- Scene 4 (18-24s) The Impossible Shot ("THE PERFECT LAUNCH!"): Final gear accelerates faster, launching the silver ball through a metal ring, bouncing off a small ramp directly toward the golden target cup.
- Scene 5 (24-30s) The Twist ("THE GEARS STOLE MY HAT! 😂"): Ball lands perfectly inside the golden cup! Celebrates, then gears reverse direction and pull his red beanie through the machine—emerging stretched like a giant spring that snaps onto his head!`;

export const GIANT_GEAR_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Discovery",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman finds two giant interlocking silver gears spinning in opposite directions. He drops a silver metal ball between their teeth—the gears launch it straight upward, and it lands right on his head!",
    animationDesc:
      "Steps right & drops silver ball between 2 interlocking gears (1.65s), gears launch ball straight up (2.15-2.85s), lands on his red beanie (3.45s), bounces onto floor (4.25s).",
    soundDesc: "Gear whir, toss whoosh, spring launch boing, head bonk, floor bounce, idea ding.",
    captionText: "GEARS CAN LAUNCH BALLS?!",
    punchline: "Discovered vertical gear propulsion. Tested it with his own forehead.",
    characterAction: "Drops the silver ball into the meshing gears, beams with pride, gets bonked on the head, and gets an idea.",
    propAction: "Two equal silver gears rotate in opposite directions, pinching and launching the silver ball straight upward.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Attempt",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "He connects three interlocking gears of different sizes and drops the silver ball onto the first large gear. Each gear transfers the ball to the next—until the fast final gear launches it backward over his head!",
    animationDesc:
      "Connects 3 different-sized gears (6.3s), drops ball onto Gear 1 (7.55s), transfers G1 -> G2 -> G3 (7.9-9.8s), launches backward over ducking Stickman (9.8-10.75s).",
    soundDesc: "Gear assembly click, metal tooth clinks, rising gear train whir, backward launch whoosh, floor crash.",
    captionText: "MORE GEARS, MORE POWER!",
    punchline: "Three gears multiplied the speed—in the completely wrong direction.",
    characterAction: "Drops the ball onto Gear 1, pumps his fists excitedly, then ducks in shock as it rockets backward over him.",
    propAction: "Large, medium, and small interlocking silver gears spin at inverse tooth ratios, firing the ball backward.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Mega Machine",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman builds a giant six-gear mega machine! The silver ball travels cleanly across all six interlocking gears, climbs a rotating ramp, and enters a spinning circular track.",
    animationDesc:
      "Activates 6-gear machine (12.35s), ball travels step-by-step across Gears 1-6 (13.35-15.45s), climbs rotating ramp (15.45-16.55s), orbits spinning circular track (16.55-18.0s).",
    soundDesc: "Machine click, six ascending metallic gear clinks, rotating ramp whir, circular track whoosh.",
    captionText: "SIX GEARS ACTIVATED!",
    punchline: "Six interlocking gears running like clockwork.",
    characterAction: "Releases the silver ball onto Gear 1 and watches proudly as it climbs the ramp into the circular track.",
    propAction: "Six opposite-spinning silver gears feed the ball up a rotating ramp into a spinning circular track.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Impossible Shot",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "He cranks the spring launcher! The final gear spins faster and launches the silver ball cleanly through a metal ring! It bounces off a small ramp and flies directly toward the golden target cup!",
    animationDesc:
      "Fires spring launcher (18.45s), turbo Gear 6 accelerates (19.15s) and launches ball (20.05s) through the metal ring (20.9s) onto small bounce ramp (22.15s) arcing toward the golden cup.",
    soundDesc: "Spring launcher boing, turbo gear whir, high-speed launch whoosh, metal ring chime, small ramp bounce.",
    captionText: "THE PERFECT LAUNCH!",
    punchline: "Calculated to the millimeter.",
    characterAction: "Pulls the spring launcher lever, points along the ball's arc, and crouches in suspense.",
    propAction: "Turbo Gear 6 shoots the silver ball through the orange metal ring onto the angled ramp toward the golden cup.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Twist",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "DING! The silver ball lands perfectly inside the golden cup! Stickman celebrates—then the giant gears reverse direction and pull his red beanie into the machine! It emerges stretched like a giant spring and snaps onto his head!",
    animationDesc:
      "Ball lands in golden cup & confetti pops (24.15s), celebrates (24.2-25.8s), gears reverse direction (25.8s), yanks red beanie through all 6 gears (26.1-27.55s), shoots out stretched like a spring and snaps onto head (28.25-30.0s).",
    soundDesc: "Golden cup clink, victory ding, mechanical reverse clutch, hat yank whoosh, gear grind, spring stretch boing, head snap, trombone sting.",
    captionText: "THE GEARS STOLE MY HAT! 😂",
    punchline: "Won the trickshot. Now his beanie has coil suspension.",
    characterAction: "Celebrates victory, gasps as his hat gets pulled into the gears, recoils as the spring-beanie snaps back, and glares deadpan.",
    propAction: "All six gears reverse direction, threading Stickman's red beanie through the teeth and shooting it out as a giant bouncy spring.",
  },
];

export const REVERSE_BOWLING_PROMPT = `MODERN POP 2D STICKMAN SHORT — "THE REVERSE BOWLING TRICKSHOT" (9:16 VERTICAL · 30 SECONDS · 5 SCENES · 24 FPS · NO DIALOGUE)

CHARACTER (LOCKED ANGRY STICKMAN RIG):
- White round head (r=70) with thick black outline (#17121f), small vertical oval eyes, expressive eyebrows, red knitted beanie (#e63946), yellow T-shirt (#ffd166), blue trousers (#2f5fa8), thin black limbs, connected small rounded white mitten hands, black shoes.
- Identical character rig throughout all 5 scenes.

PROPS & CONTINUITY:
- Purple bowling ball (consistent size r=30, vibrant purple #9333ea with three finger holes), 10 white bowling pins with consistent dual red stripes, curved orange ramp, spinning blue platform, two angled cyan mirrors, arched teal curved tunnel, and orange/red spring ramp.

5-SCENE TIMELINE (30 SECONDS):
- Scene 1 (0-6s) The Crazy Challenge ("BOWLING... BACKWARDS?!"): Stickman stands behind ten bowling pins, throws the purple bowling ball backward (left), where it rolls back behind him and hits his foot.
- Scene 2 (6-12s) First Attempt ("WRONG DIRECTION!"): Places a curved ramp behind him; ball rolls backward down ramp, bounces off left wall, changes direction, and knocks down only one pin.
- Scene 3 (12-18s) The Upgrade ("MASTER THE ANGLES!"): Adds two mirrors and a spinning platform; ball travels backward, bounces off the spinning platform and both mirrors, returning toward the pins from the opposite side.
- Scene 4 (18-24s) The Perfect Strike ("BACKWARDS STRIKE!"): Ball rolls through a curved tunnel, launches off a spring ramp, flies behind the bowling pins, and smashes the center pin—knocking all 10 pins down in one perfect strike!
- Scene 5 (24-30s) The Twist ("STRIKE... ON ME! 😂"): Celebrates with a victory dance, then the purple ball rolls back along the same route, hits his feet, flips him backward into the bowling lane, and a final pin drops squarely onto his head!`;

export const REVERSE_BOWLING_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Crazy Challenge",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman stands before 10 red-striped bowling pins—but throws the purple bowling ball BACKWARD! It bounces behind him and rolls right into his foot!",
    animationDesc:
      "Points at 10 pins, turns left & throws purple bowling ball backward (1.9s), bounces off left wall (2.8s) and rolls right into his foot (3.65s).",
    soundDesc: "Throw whoosh, wall thump, bowling roll rumble, foot bonk.",
    captionText: "BOWLING... BACKWARDS?!",
    punchline: "Refused to bowl forward. Bowled his own heel instead.",
    characterAction: "Points confidently at the pins, flings the purple ball backward, and hops holding his foot.",
    propAction: "Purple bowling ball rolls backward, rebounds off the left baseboard, and hits his foot.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Attempt",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "He places a curved ramp behind him and rolls the ball backward down the ramp! It bounces off the left wall, changes direction over his head, and knocks down ONLY ONE pin!",
    animationDesc:
      "Places curved ramp (6.1s), rolls ball backward down ramp (7.55s), bounces off left wall (8.45s), arcs onto lane (9.55s) and topples 1 pin (10.15s).",
    soundDesc: "Setup click, wooden lane rumble, wall thump, single pin wood knock.",
    captionText: "WRONG DIRECTION!",
    punchline: "1 out of 10 pins. Backwards progress.",
    characterAction: "Sets up the curved ramp, rolls backward, points excitedly, then crosses fists annoyed.",
    propAction: "Curved ramp launches ball off left wall onto the lane, knocking down only front pin #0.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Upgrade",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "Stickman adds two mirrors and a spinning platform! He rolls the ball backward—it rockets off the spinning platform, bounces between both mirrors, and drops toward the pins from the opposite side!",
    animationDesc:
      "Adds 2 mirrors & spinning platform (12.15s), rolls backward (13.55s), spinning platform flings ball (14.35s) to Mirror 1 (15.1s) -> Mirror 2 (16.05s) -> opposite side approach.",
    soundDesc: "Setup click, roll rumble, spring platform boing, twin crystalline mirror pings, lane thump.",
    captionText: "MASTER THE ANGLES!",
    punchline: "Geometry meets bowling.",
    characterAction: "Positions the mirrors and spinning platform, rolls backward, and tracks the ball overhead.",
    propAction: "Spinning platform and dual angled mirrors redirect the purple ball around the room.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Perfect Strike",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "The purple ball rolls through a curved tunnel, launches off a spring ramp, and flies behind the bowling pins! It hits the center pin—sending ALL TEN pins crashing down in one perfect backwards strike!",
    animationDesc:
      "Releases ball (18.65s), spinning platform -> curved tunnel (19.85-20.75s) -> spring ramp (21.35s) -> flies behind pins (22.1s) -> smashes center pin at 22.45s knocking all 10 pins down!",
    soundDesc: "Roll rumble, tunnel whoosh, spring ramp boing, massive 10-pin bowling strike crash, victory ding.",
    captionText: "BACKWARDS STRIKE!",
    punchline: "Zero forward throws. 10 pins down.",
    characterAction: "Releases backward, watches overhead, then pumps both fists as all 10 pins explode.",
    propAction: "Curved tunnel and spring ramp launch the ball behind the rack, collapsing all 10 pins in one strike.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Twist",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "Stickman celebrates with a victory dance! Suddenly, the purple bowling ball rolls back along the same route and hits his feet! He falls backward into the bowling lane—and a final pin drops straight onto his head!",
    animationDesc:
      "Victory dance (24.0-26.8s), ball races back through spring ramp & curved tunnel (25.85-27.15s), slams Stickman's feet (27.15s), flips him backward into lane (27.75s), final pin lands on his head (28.25s).",
    soundDesc: "Reverse roll rumble, spring boing, tunnel whoosh, feet slam, lane thump, final pin head knock, sad trombone.",
    captionText: "STRIKE... ON ME! 😂",
    punchline: "Picked up the spare on himself.",
    characterAction: "Dances triumphantly, gets swept off his feet, tumbles into the lane, and glares deadpan with a pin on his head.",
    propAction: "Purple bowling ball reverses through the tunnel to trip him, followed by the final pin dropping onto his head.",
  },
];

export const GIANT_YOYO_PROMPT = `MODERN POP 2D STICKMAN SHORT — "THE GIANT YO-YO TRICKSHOT" (9:16 VERTICAL · 30 SECONDS · 5 SCENES · 24 FPS · NO DIALOGUE)

CHARACTER (LOCKED ANGRY STICKMAN RIG):
- White round head (r=70) with thick black outline (#17121f), small vertical oval eyes, expressive eyebrows, red knitted beanie (#e63946), yellow T-shirt (#ffd166), blue trousers (#2f5fa8), thin black limbs, connected small rounded white mitten hands, black shoes.
- Identical character rig throughout all 5 scenes.

PROPS & CONTINUITY:
- Giant red-and-blue yo-yo (r=62) connected continuously to a strong white string throughout all 30 seconds, orange ping-pong ball (r=20), three vibrant spinning hoops along the swing path, ceiling pulley rig (Scenes 3-5), and a tiny golden target cup perched on the far-right pedestal.

5-SCENE TIMELINE (30 SECONDS):
- Scene 1 (0-6s) The Discovery ("THIS YO-YO IS HUGE!"): Finds the giant red-and-blue yo-yo, drops it on its white string, pulls it upward, and gets bonked squarely on the forehead.
- Scene 2 (6-12s) First Trickshot ("SPIN POWER!"): Places the orange ping-pong ball onto the yo-yo's spinning surface, whips it forward, and launches the ball toward the tiny golden cup—missing the rim by an inch.
- Scene 3 (12-18s) The Upgrade ("THREE HOOPS!"): Stretches the strong white string through a ceiling pulley, adds three spinning hoops along its path, and glides the yo-yo smoothly through all three while carrying the ball.
- Scene 4 (18-24s) The Impossible Shot ("PERFECT RELEASE!"): Pulls the string back hard and releases—the giant yo-yo rockets cleanly through all three spinning hoops and launches the orange ball toward the tiny golden cup.
- Scene 5 (24-30s) The Twist ("I'M THE YO-YO NOW! 😂"): The orange ball lands cleanly inside the cup! Stickman celebrates—then the giant yo-yo whips back along its string, wraps around his waist, and hoists him upward like a human yo-yo while his red beanie spins on the floor.`;

export const GIANT_YOYO_SCENES: SceneDef[] = [
  {
    id: 1,
    name: "Scene 1",
    title: "The Discovery",
    timeRange: [0.0, 6.0],
    videoPrompt:
      "Stickman discovers a giant red-and-blue yo-yo! He drops it on its white string, yanks upward, and the giant yo-yo swings right into his forehead!",
    animationDesc:
      "Lifts giant yo-yo (1.0-1.55s), drops spinning down to floor (1.55-2.45s), tugs upward and gets bonked on the forehead (3.25s).",
    soundDesc: "Spinning yo-yo whir, upward string whoosh, hollow forehead bonk.",
    captionText: "THIS YO-YO IS HUGE!",
    punchline: "Gravity always remembers the return swing.",
    characterAction: "Inspects the giant yo-yo, drops and yanks the string, recoils from the forehead bonk, then spots the golden cup.",
    propAction: "Giant red-and-blue yo-yo unwinds down its connected white string and whips back into his forehead.",
  },
  {
    id: 2,
    name: "Scene 2",
    title: "First Trickshot",
    timeRange: [6.0, 12.0],
    videoPrompt:
      "Stickman places an orange ping-pong ball onto the spinning yo-yo and whips it forward! The ball arcs cleanly toward the tiny golden cup—and misses by just an inch!",
    animationDesc:
      "Places orange ball on spinning yo-yo (6.0-7.75s), whips yo-yo forward (7.75-8.85s), ball arcs toward cup and clips outer rim at 10.35s before bouncing to the floor.",
    soundDesc: "Yo-yo spin whir, whip whoosh, metallic cup rim clink.",
    captionText: "SPIN POWER!",
    punchline: "Missed by one millimeter.",
    characterAction: "Balances the orange ball on top, swings the yo-yo forward, watches wide-eyed, then clenches fists in frustration.",
    propAction: "Spinning yo-yo flicks the orange ball across the room toward the golden cup, grazing the rim.",
  },
  {
    id: 3,
    name: "Scene 3",
    title: "The Upgrade",
    timeRange: [12.0, 18.0],
    videoPrompt:
      "He stretches the strong white string up through a ceiling pulley and hangs three vibrant spinning hoops along the swing path—testing a smooth pass right through all three!",
    animationDesc:
      "Mounts ceiling pulley & 3 spinning hoops (12.0-13.85s), sets orange ball on yo-yo, test-glides cleanly through Hoops 1, 2, and 3 (14.5-16.95s).",
    soundDesc: "Mechanical setup click, smooth pendulum whir, three ascending hoop-pass chimes.",
    captionText: "THREE HOOPS!",
    punchline: "Aligned through every spinning ring.",
    characterAction: "Rigs the string through the ceiling pulley, places the ball, and points proudly at the test pass.",
    propAction: "Yo-yo glides smoothly along the taut white pendulum string through three rotating hoops while carrying the orange ball.",
  },
  {
    id: 4,
    name: "Scene 4",
    title: "The Impossible Shot",
    timeRange: [18.0, 24.0],
    videoPrompt:
      "Stickman pulls the white string all the way back and snaps a PERFECT RELEASE! The giant yo-yo rockets through all three spinning hoops and launches the orange ball straight toward the tiny golden cup!",
    animationDesc:
      "Pulls string taut left (18.0-19.45s), releases at 19.45s—yo-yo blasts through Hoop 1 (20.15s), Hoop 2 (20.8s), Hoop 3 (21.45s) and launches ball (21.85s) arcing toward the cup.",
    soundDesc: "Tension click, turbo yo-yo whir, three rising hoop chimes, launch whoosh.",
    captionText: "PERFECT RELEASE!",
    punchline: "Three spinning hoops, zero margin for error.",
    characterAction: "Leans far back pulling the string tight, snaps a release, and crouches in suspense as the ball descends.",
    propAction: "High-speed red-and-blue yo-yo slices through all three spinning hoops and fires the orange ball toward the cup.",
  },
  {
    id: 5,
    name: "Scene 5",
    title: "The Twist",
    timeRange: [24.0, 30.0],
    videoPrompt:
      "DING! The orange ball lands perfectly inside the tiny golden cup! Stickman celebrates—then the giant yo-yo zips back along its string, wraps his waist, and hoists him up like a human yo-yo while his red beanie spins on the floor!",
    animationDesc:
      "Ball lands in cup & confetti bursts (24.05s), victory dance (24.1-25.75s), yo-yo recoils along string (25.75-26.65s), wraps waist and hoists him mid-air (26.85-30.0s) while red beanie spins on floor.",
    soundDesc: "Golden cup drop clink, victory ding, recoil zip, waist thump, elastic hoist snap, floor beanie spin, sad trombone.",
    captionText: "I'M THE YO-YO NOW! 😂",
    punchline: "Landed the shot. Became the counterweight.",
    characterAction: "Dances wildly, gets wrapped at the waist, and dangles upside-down mid-air like a human yo-yo with a deadpan glare.",
    propAction: "Giant yo-yo recoils along its connected string, loops Stickman's waist, and lifts him upward while his beanie spins below.",
  },
];

export const PROJECTS: Record<ProjectId, ProjectDef> = {
  'giant-yoyo-trickshot': {
    id: 'giant-yoyo-trickshot',
    title: 'The Giant Yo-Yo Trickshot 🪀😂',
    subtitle: '30-Second Three-Hoop Pendulum & Human Yo-Yo Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Built a GIANT YO-YO for an IMPOSSIBLE Trickshot! 🪀😂',
    youtubeThumbnail: 'HUMAN YO-YO?!',
    youtubeHashtags: '#AngryStickman #GiantYoYo #Trickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: GIANT_YOYO_PROMPT,
    scenes: GIANT_YOYO_SCENES,
  },
  'reverse-bowling-trickshot': {
    id: 'reverse-bowling-trickshot',
    title: 'The Reverse Bowling Trickshot 🎳😂',
    subtitle: '30-Second Backwards 10-Pin Bowling & Final Pin Drop Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Invented BACKWARDS BOWLING… IMPOSSIBLE STRIKE! 🎳😂',
    youtubeThumbnail: 'BACKWARDS STRIKE?!',
    youtubeHashtags: '#AngryStickman #ReverseBowling #BowlingTrickshot #ImpossibleTrickshot #FunnyAnimation #YouTubeShorts',
    masterPrompt: REVERSE_BOWLING_PROMPT,
    scenes: REVERSE_BOWLING_SCENES,
  },
  'giant-gear-trickshot': {
    id: 'giant-gear-trickshot',
    title: 'The Giant Gear Trickshot ⚙️😂',
    subtitle: '30-Second 6-Gear Clockwork Machine & Spring-Beanie Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Built a GIANT Gear Machine for an IMPOSSIBLE Trickshot! ⚙️😂',
    youtubeThumbnail: 'GEAR POWER!',
    youtubeHashtags: '#AngryStickman #GearTrickshot #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: GIANT_GEAR_PROMPT,
    scenes: GIANT_GEAR_SCENES,
  },
  'invisible-tube-trickshot': {
    id: 'invisible-tube-trickshot',
    title: 'The Invisible Tube Trickshot 👻😂',
    subtitle: '30-Second Transparent Loop Track & Air-Pump Reverse Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Built an INVISIBLE Tube Trickshot… BIG MISTAKE! 👻😂',
    youtubeThumbnail: 'WHERE DID IT GO?!',
    youtubeHashtags: '#AngryStickman #InvisibleTube #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: INVISIBLE_TUBE_PROMPT,
    scenes: INVISIBLE_TUBE_SCENES,
  },
  'triple-gravity-trickshot': {
    id: 'triple-gravity-trickshot',
    title: 'The Triple Gravity Trickshot 🌍😂',
    subtitle: '30-Second Blue/Purple/Green Gravity Lab Trickshot Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He BROKE GRAVITY for an IMPOSSIBLE Trickshot! 🌍😂',
    youtubeThumbnail: 'GRAVITY IS BROKEN!',
    youtubeHashtags: '#AngryStickman #GravityTrickshot #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: TRIPLE_GRAVITY_PROMPT,
    scenes: TRIPLE_GRAVITY_SCENES,
  },
  'giant-scissor-trickshot': {
    id: 'giant-scissor-trickshot',
    title: 'The Giant Scissor Trickshot ✂️😂',
    subtitle: '30-Second String-Pulley Chain-Reaction Scissor Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Used GIANT SCISSORS for an IMPOSSIBLE Trickshot! ✂️😂',
    youtubeThumbnail: 'ONE CUT = CHAOS!',
    youtubeHashtags: '#AngryStickman #ScissorTrickshot #ChainReaction #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: GIANT_SCISSOR_PROMPT,
    scenes: GIANT_SCISSOR_SCENES,
  },
  'spiral-staircase-shot': {
    id: 'spiral-staircase-shot',
    title: 'The Impossible Spiral Staircase Shot 🌀😂',
    subtitle: '30-Second Giant Carousel Staircase Trickshot Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Made a SPIRAL STAIRCASE Trickshot… INSANE! 🌀😂',
    youtubeThumbnail: 'THE CRAZY SPIRAL!',
    youtubeHashtags: '#AngryStickman #SpiralStaircase #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: SPIRAL_STAIRCASE_PROMPT,
    scenes: SPIRAL_STAIRCASE_SCENES,
  },
  'magnetic-maze-trickshot': {
    id: 'magnetic-maze-trickshot',
    title: 'The Magnetic Maze Trickshot 🧲😂',
    subtitle: '30-Second Horseshoe Magnet & Transparent Maze Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Built a MAGNETIC Maze… The Ball Went CRAZY! 🧲😂',
    youtubeThumbnail: 'MAGNET POWER!',
    youtubeHashtags: '#AngryStickman #MagneticMaze #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: MAGNETIC_MAZE_PROMPT,
    scenes: MAGNETIC_MAZE_SCENES,
  },
  'thousand-degree-hot-shot': {
    id: 'thousand-degree-hot-shot',
    title: 'The 1,000-Degree Hot Shot 🔥😂',
    subtitle: '30-Second Superheated Heat-Lab Trickshot Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Tried a 1,000-DEGREE Trickshot… BIG MISTAKE! 🔥😂',
    youtubeThumbnail: 'TOO HOT!!!',
    youtubeHashtags: '#AngryStickman #HotShot #Trickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: HOT_SHOT_PROMPT,
    scenes: HOT_SHOT_SCENES,
  },
  'impossible-pinball-trickshot': {
    id: 'impossible-pinball-trickshot',
    title: 'The Impossible Pinball Trickshot 🎮😂',
    subtitle: '30-Second Giant Arcade Pinball Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Built an IMPOSSIBLE Pinball Trickshot! 🎮😂',
    youtubeThumbnail: 'PINBALL CHAOS!',
    youtubeHashtags: '#AngryStickman #Pinball #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: IMPOSSIBLE_PINBALL_PROMPT,
    scenes: IMPOSSIBLE_PINBALL_SCENES,
  },
  'impossible-laser-maze': {
    id: 'impossible-laser-maze',
    title: 'The Impossible Laser Maze 🔴😂',
    subtitle: '30-Second Spy-Vault Laser Trickshot Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Solved the IMPOSSIBLE LASER MAZE with a Trickshot! 🔴😂',
    youtubeThumbnail: 'ONE WRONG MOVE!',
    youtubeHashtags: '#AngryStickman #LaserMaze #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: IMPOSSIBLE_LASER_PROMPT,
    scenes: IMPOSSIBLE_LASER_SCENES,
  },
  'impossible-keyhole-shot': {
    id: 'impossible-keyhole-shot',
    title: 'The Impossible Keyhole Shot 🔑😂',
    subtitle: '30-Second Doorway Keyhole Trickshot Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Made an IMPOSSIBLE Keyhole Trickshot! 🔑😂',
    youtubeThumbnail: 'THROUGH THAT HOLE?!',
    youtubeHashtags: '#AngryStickman #KeyholeTrickshot #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: IMPOSSIBLE_KEYHOLE_PROMPT,
    scenes: IMPOSSIBLE_KEYHOLE_SCENES,
  },
  'giant-slinky-trickshot': {
    id: 'giant-slinky-trickshot',
    title: 'The Giant Slinky Trickshot 🌀😂',
    subtitle: '30-Second Metallic Rainbow Spring Trickshot Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Built a GIANT SLINKY Launcher… BIG MISTAKE! 🌀😂',
    youtubeThumbnail: 'SPRING POWER!',
    youtubeHashtags: '#AngryStickman #SlinkyTrickshot #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: GIANT_SLINKY_PROMPT,
    scenes: GIANT_SLINKY_SCENES,
  },
  'longest-ruler-shot': {
    id: 'longest-ruler-shot',
    title: "The World's Longest Ruler Shot 📏😂",
    subtitle: '30-Second Backyard Mega-Ramp Trickshot Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Built the LONGEST RULER… for ONE IMPOSSIBLE SHOT! 📏😂',
    youtubeThumbnail: 'HOW LONG IS THIS?!',
    youtubeHashtags: '#AngryStickman #RulerTrickshot #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: LONGEST_RULER_PROMPT,
    scenes: LONGEST_RULER_SCENES,
  },
  'hundred-ball-chain': {
    id: 'hundred-ball-chain',
    title: 'The 100-Ball Chain Reaction ⚽😂',
    subtitle: '30-Second Rube Goldberg Chain-Reaction Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Started ONE Ball… Then 100 BALLS Went Crazy! ⚽😂',
    youtubeThumbnail: '100 BALLS?!',
    youtubeHashtags: '#AngryStickman #ChainReaction #100Balls #Trickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: HUNDRED_BALL_PROMPT,
    scenes: HUNDRED_BALL_SCENES,
  },
  'ten-fan-trickshot': {
    id: 'ten-fan-trickshot',
    title: 'The 10-Fan Impossible Trickshot 🌀',
    subtitle: '30-Second Wind-Tunnel Trickshot Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Used 10 FANS for an IMPOSSIBLE Trickshot! 🌀😂',
    youtubeThumbnail: '10 FANS?!',
    youtubeHashtags: '#AngryStickman #FanTrickshot #ImpossibleTrickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: TEN_FAN_PROMPT,
    scenes: TEN_FAN_SCENES,
  },
  'invisible-wall-challenge': {
    id: 'invisible-wall-challenge',
    title: 'The Invisible Wall Challenge 👻',
    subtitle: '30-Second Glass Trickshot Slapstick Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Discovered INVISIBLE WALLS… Then Tried a Trickshot! 👻😂',
    youtubeThumbnail: 'THE WALL IS INVISIBLE?!',
    youtubeHashtags: '#AngryStickman #InvisibleWall #Trickshot #FunnyAnimation #StickmanAnimation #YouTubeShorts',
    masterPrompt: INVISIBLE_WALL_PROMPT,
    scenes: INVISIBLE_WALL_SCENES,
  },
  'shadow-trickshot': {
    id: 'shadow-trickshot',
    title: 'The Impossible Shadow Trickshot 🌑',
    subtitle: '30-Second Spotlight Shadow Slapstick Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Used His SHADOW to Make an IMPOSSIBLE Trickshot! 🌑😂',
    youtubeThumbnail: 'MY SHADOW DID THAT?!',
    youtubeHashtags: '#AngryStickman #Trickshot #ShadowTrickshot #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts',
    masterPrompt: SHADOW_TRICKSHOT_PROMPT,
    scenes: SHADOW_TRICKSHOT_SCENES,
  },
  'super-bouncy-shoes': {
    id: 'super-bouncy-shoes',
    title: 'The Super Bouncy Shoes 👟😂',
    subtitle: '30-Second Spring-Sneaker Slapstick Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Wore SUPER BOUNCY SHOES… BIG MISTAKE! 👟😂',
    youtubeThumbnail: "CAN'T STOP BOUNCING!",
    youtubeHashtags: '#AngryStickman #BouncyShoes #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts',
    masterPrompt: SUPER_BOUNCY_SHOES_PROMPT,
    scenes: SUPER_BOUNCY_SHOES_SCENES,
  },
  'mystery-floor-hole': {
    id: 'mystery-floor-hole',
    title: 'The Mystery Hole in the Floor 🕳️😂',
    subtitle: '30-Second Oversized Portal Slapstick Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Found a MYSTERY HOLE… EVERYTHING GREW HUGE! 🕳️😂',
    youtubeThumbnail: 'IT MAKES THINGS HUGE!',
    youtubeHashtags: '#AngryStickman #MysteryHole #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts',
    masterPrompt: MYSTERY_FLOOR_HOLE_PROMPT,
    scenes: MYSTERY_FLOOR_HOLE_SCENES,
  },
  'rubber-band-trap': {
    id: 'rubber-band-trap',
    title: 'The Giant Rubber Band Trap 🪢😂',
    subtitle: '30-Second Elastic Slingshot Slapstick Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Pulled a GIANT Rubber Band… BIG MISTAKE! 🪢😂',
    youtubeThumbnail: 'IT SNAPPED!',
    youtubeHashtags: '#AngryStickman #RubberBand #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts',
    masterPrompt: RUBBER_BAND_TRAP_PROMPT,
    scenes: RUBBER_BAND_TRAP_SCENES,
  },
  'clone-button-disaster': {
    id: 'clone-button-disaster',
    title: 'The Clone Button Disaster 🧍😂',
    subtitle: '30-Second Cloning Chaos Slapstick Comedy',
    tagline: 'Modern Pop 2D Flat Vector · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'He Pressed the CLONE BUTTON… BIG MISTAKE! 🧍😂',
    youtubeThumbnail: '100 OF ME?!',
    youtubeHashtags: '#AngryStickman #CloneDisaster #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts',
    masterPrompt: CLONE_BUTTON_DISASTER_PROMPT,
    scenes: CLONE_BUTTON_DISASTER_SCENES,
  },
  'living-traffic-light': {
    id: 'living-traffic-light',
    title: 'The Living Traffic Light 🚦😂',
    subtitle: '30-Second Street-Crossing Slapstick Comedy',
    tagline: 'Modern Pop 2D Vector Cartoon · 24 FPS · Locked Angry Stickman Rig',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'A TRAFFIC LIGHT CAME ALIVE! 🚦😂',
    youtubeThumbnail: "YOU CAN'T MOVE!",
    youtubeHashtags: '#AngryStickman #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts',
    masterPrompt: LIVING_TRAFFIC_LIGHT_PROMPT,
    scenes: LIVING_TRAFFIC_LIGHT_SCENES,
  },
  'infinite-gift-box': {
    id: 'infinite-gift-box',
    title: 'The Infinite Gift Box 🎁',
    subtitle: 'The 30-Second Living-Room Surprise Comedy',
    tagline: 'Modern Pop 2D Flat Vector Short · 24 FPS · Original Comedy Score',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'THIS GIFT BOX ATE MY HOUSE! 🎁😂',
    youtubeThumbnail: 'I HATE SURPRISES!',
    youtubeHashtags: '#AngryStickman #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts',
    masterPrompt: INFINITE_GIFT_BOX_PROMPT,
    scenes: INFINITE_GIFT_BOX_SCENES,
  },
  'self-building-robot': {
    id: 'self-building-robot',
    title: 'The Self-Building Robot 🤖',
    subtitle: 'The 30-Second Workshop Upgrade Comedy',
    tagline: 'Modern Pop 2D Flat Vector Short · 24 FPS · Original Workshop Score',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'MY TINY ROBOT BUILT ITSELF?! 🤖😂',
    youtubeThumbnail: 'I BUILT MY OWN BOSS!',
    youtubeHashtags: '#AngryStickman #FunnyAnimation #RobotAnimation #2DAnimation #YouTubeShorts',
    masterPrompt: SELF_BUILDING_ROBOT_PROMPT,
    scenes: SELF_BUILDING_ROBOT_SCENES,
  },
  'runaway-cake': {
    id: 'runaway-cake',
    title: 'The Runaway Birthday Cake 🎂',
    subtitle: 'The 30-Second Slapstick Pop Comedy',
    tagline: 'Modern Pop 2D Vector Cartoon Short · 24 FPS · Original Comedy Score',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'MY BIRTHDAY CAKE RAN AWAY! 🎂😂',
    youtubeThumbnail: 'JUST ONE BITE!',
    youtubeHashtags: '#AngryStickman #FunnyAnimation #StickmanAnimation #2DAnimation #YouTubeShorts',
    masterPrompt: RUNAWAY_CAKE_PROMPT,
    scenes: RUNAWAY_CAKE_SCENES,
  },
  'mind-traps': {
    id: 'mind-traps',
    title: 'Angry Stickman: Mind Traps & The Red Cage',
    subtitle: 'The 30-Second Minimalist Monochrome Explainer',
    tagline: 'Vertical 9:16 · Style 1A (White) & 1B (Black) · Vivid Red Accent Storytelling',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'BREAK OUT OF THE RED CAGE! 🔥',
    youtubeThumbnail: 'BREAK THE TRAP!',
    youtubeHashtags: '#StickmanAnimation #Mindset #MinimalistAnimation #2DAnimation #YouTubeShorts',
    masterPrompt: MIND_TRAPS_PROMPT,
    scenes: MIND_TRAPS_SCENES,
  },
  'coin-flip': {
    id: 'coin-flip',
    title: 'Angry Stickman vs. The Impossible Coin Flip',
    subtitle: 'The 30-Second Glass-and-Coin Comedy',
    tagline: 'Vertical 9:16 Stickman Short · Sound Effects Only · Original Comedy Score',
    duration: 30,
    hasAudioDialogue: false,
    hasCaptions: true,
    youtubeTitle: 'THE IMPOSSIBLE COIN FLIP TRICK SHOT! 🪙😂',
    youtubeThumbnail: 'ONE LAST FLICK!',
    youtubeHashtags: '#AngryStickman #TrickShot #FunnyAnimation #2DAnimation #YouTubeShorts',
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
    youtubeTitle: 'THE IMPOSSIBLE DART TRICK SHOT! 🎯😂',
    youtubeThumbnail: 'I QUIT!',
    youtubeHashtags: '#AngryStickman #TrickShot #FunnyAnimation #2DAnimation #YouTubeShorts',
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
    youtubeTitle: 'PING-PONG BALL RUINED HIS LIFE! 🏓😂',
    youtubeThumbnail: 'NO WAY!!',
    youtubeHashtags: '#AngryStickman #PingPong #FunnyAnimation #2DAnimation #YouTubeShorts',
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
    youtubeTitle: 'HE BECAME A TRICK-SHOT CHAMPION! 🏀🏆',
    youtubeThumbnail: 'IMPOSSIBLE SHOT!',
    youtubeHashtags: '#AngryStickman #Basketball #TrickShot #2DAnimation #YouTubeShorts',
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
    youtubeTitle: 'THE ROBOT STOLE THE POP CONCERT! 🎤🤖',
    youtubeThumbnail: 'BEEP IS A STAR!',
    youtubeHashtags: '#2DAnimation #FunnyCartoon #RobotDance #YouTubeShorts',
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
    youtubeTitle: 'ANGRY STICKMAN VS BASKETBALL MACHINE! 🏀😂',
    youtubeThumbnail: 'HANGING UPSIDE DOWN!',
    youtubeHashtags: '#AngryStickman #PaperBall #FunnyAnimation #2DAnimation #YouTubeShorts',
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
    youtubeTitle: 'THE LONGEST WALK FOR ONE BASKET! 🏀😂',
    youtubeThumbnail: 'ONE MORE BONK!',
    youtubeHashtags: '#AngryStickman #StickmanAnimation #FunnyAnimation #YouTubeShorts',
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
    youtubeTitle: 'HE BUILT A PAPER BALL LAUNCHER! 📄😂',
    youtubeThumbnail: '5 MISSES?!',
    youtubeHashtags: '#AngryStickman #PaperBall #StickmanAnimation #YouTubeShorts',
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
    youtubeTitle: 'ONE PAPER BALL. ZERO LUCK! 📄🗑️',
    youtubeThumbnail: 'WAIT FOR IT!',
    youtubeHashtags: '#AngryStickman #StickmanAnimation #FunnyAnimation #YouTubeShorts',
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
    youtubeTitle: 'THE UNLUCKIEST PAPER THROW EVER! 📄😂',
    youtubeThumbnail: 'DIRECT HIT!',
    youtubeHashtags: '#StickmanAnimation #PaperBall #2DAnimation #YouTubeShorts',
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
    youtubeTitle: 'WHAT IF YOUR SHADOW QUIT?! 🌑📋',
    youtubeThumbnail: 'YOUR SHADOW HAS RIGHTS!',
    youtubeHashtags: '#StickmanAnimation #FunnyComedy #2DAnimation #YouTubeShorts',
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
  activeProject: 'giant-yoyo-trickshot', // The Giant Yo-Yo Trickshot 30s Short
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
