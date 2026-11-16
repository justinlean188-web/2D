import React from 'react';
import { Volume2, Play, Mic, MicOff } from 'lucide-react';
import { soundEngine, speakVoiceOver, stopVoiceOver } from '../audio/soundEngine';
import { StudioConfig } from '../types';

interface AudioLabProps {
  config: StudioConfig;
  setConfig: React.Dispatch<React.SetStateAction<StudioConfig>>;
}

export const AudioLab: React.FC<AudioLabProps> = ({ config, setConfig }) => {
  const isPaperBall = config.activeProject !== 'shadow-quit';
  const isExtended = config.activeProject === 'paper-ball-30';
  const isSequel = config.activeProject === 'paper-ball-sequel';
  const isPart3 = config.activeProject === 'paper-ball-part3';
  const isPart4 = config.activeProject === 'paper-ball-part4';
  const isPop = config.activeProject === 'pop-star';
  const isTrickShot = config.activeProject === 'trick-shot-champion';
  const isPingPong = config.activeProject === 'ping-pong-revenge';
  const isDartShot = config.activeProject === 'dart-shot';
  const isCoinFlip = config.activeProject === 'coin-flip';
  const isSelfBuildingRobot = config.activeProject === 'self-building-robot';
  const isInfiniteGiftBox = config.activeProject === 'infinite-gift-box';
  const isLivingTrafficLight = config.activeProject === 'living-traffic-light';
  const isCloneDisaster = config.activeProject === 'clone-button-disaster';
  const isRubberBandTrap = config.activeProject === 'rubber-band-trap';
  const isMysteryFloorHole = config.activeProject === 'mystery-floor-hole';
  const isSuperBouncyShoes = config.activeProject === 'super-bouncy-shoes';
  const isShadowTrickshot = config.activeProject === 'shadow-trickshot';
  const isInvisibleWall = config.activeProject === 'invisible-wall-challenge';
  const isTenFan = config.activeProject === 'ten-fan-trickshot';
  const isHundredBall = config.activeProject === 'hundred-ball-chain';
  const isLongestRuler = config.activeProject === 'longest-ruler-shot';
  const isGiantSlinky = config.activeProject === 'giant-slinky-trickshot';
  const isImpossibleKeyhole = config.activeProject === 'impossible-keyhole-shot';
  const isImpossibleLaser = config.activeProject === 'impossible-laser-maze';
  const isImpossiblePinball = config.activeProject === 'impossible-pinball-trickshot';
  const isHotShot = config.activeProject === 'thousand-degree-hot-shot';
  const isMagneticMaze = config.activeProject === 'magnetic-maze-trickshot';
  const isSpiralStaircase = config.activeProject === 'spiral-staircase-shot';
  const isGiantScissor = config.activeProject === 'giant-scissor-trickshot';
  const isTripleGravity = config.activeProject === 'triple-gravity-trickshot';
  const isInvisibleTube = config.activeProject === 'invisible-tube-trickshot';
  const isGiantGear = config.activeProject === 'giant-gear-trickshot';
  const isReverseBowling = config.activeProject === 'reverse-bowling-trickshot';
  const isGiantYoyo = config.activeProject === 'giant-yoyo-trickshot';
  const soundEffects = [
    // Paper Ball Ricochet Effects
    {
      project: 'paper-ball' as const,
      name: 'Paper Toss Whoosh',
      time: 'Paper Ball (2.0s)',
      desc: 'Snappy cartoon air release (420Hz -> 140Hz) as stickman flings the paper ball.',
      trigger: () => soundEngine.playWhoosh(),
    },
    {
      project: 'paper-ball' as const,
      name: 'Trash Rim Clink',
      time: 'Paper Ball (4.4s)',
      desc: 'Metallic high-frequency rim clip (1850Hz -> 800Hz triangle).',
      trigger: () => soundEngine.playRimClink(),
    },
    {
      project: 'paper-ball' as const,
      name: 'Table Lamp Brass Ding',
      time: 'Paper Ball (6.0s)',
      desc: '3-harmonic resonant brass bell ring (1100Hz, 1650Hz, 2200Hz) as lamp wobbles.',
      trigger: () => soundEngine.playLampDing(),
    },
    {
      project: 'paper-ball' as const,
      name: 'Ceiling Fan WHACK',
      time: 'Paper Ball (7.5s)',
      desc: 'Heavy impact filtered noise slap + low 260Hz body thump from the spinning blade.',
      trigger: () => soundEngine.playFanWhack(),
    },
    {
      project: 'paper-ball' as const,
      name: 'Wall Bounce Pop',
      time: 'Paper Ball (8.6s)',
      desc: 'Elastic 520Hz rebound pop off the right wall.',
      trigger: () => soundEngine.playWallBounce(),
    },
    {
      project: 'paper-ball' as const,
      name: 'Forehead Cartoon Bonk',
      time: 'Paper Ball (9.4s)',
      desc: 'Classic hollow skull cartoon "dook" with 950Hz click + 380Hz resonant head bonk.',
      trigger: () => soundEngine.playHeadBonk(),
    },
    {
      project: 'paper-ball' as const,
      name: 'Desk Paper Plop',
      time: 'Paper Ball (9.6s)',
      desc: 'Damped 220Hz low plop as crumpled paper settles on the wooden desk.',
      trigger: () => soundEngine.playDeskPlop(),
    },
    // 30-Second Director's Cut Effects
    {
      project: 'paper-ball-30' as const,
      name: 'No-Look Toss Whoosh',
      time: '30s Cut (0.8s)',
      desc: 'Casual air-release whoosh as the first paper ball leaves his hand without a glance.',
      trigger: () => soundEngine.playWhoosh(),
    },
    {
      project: 'paper-ball-30' as const,
      name: 'Wall Miss Thud',
      time: '30s Cut (1.8s)',
      desc: 'Flat elastic wall bounce when the no-look shot misses the trash can.',
      trigger: () => soundEngine.playWallBounce(),
    },
    {
      project: 'paper-ball-30' as const,
      name: 'Calculator Button Beeps',
      time: '30s Cut (4.35s, 4.85s, 5.35s)',
      desc: 'Three precise scientific button chirps while he measures the impossible shot.',
      trigger: () => {
        soundEngine.playCalculatorBeep();
        setTimeout(() => soundEngine.playCalculatorBeep(), 280);
        setTimeout(() => soundEngine.playCalculatorBeep(), 560);
      },
    },
    {
      project: 'paper-ball-30' as const,
      name: 'Confident Thumbs-Up Ding',
      time: '30s Cut (6.65s)',
      desc: 'Bright two-note confirmation chime for a plan that is about to go horribly wrong.',
      trigger: () => soundEngine.playConfidenceDing(),
    },
    {
      project: 'paper-ball-30' as const,
      name: 'Forehead Rebound Bonk',
      time: '30s Cut (9.6s)',
      desc: 'The second throw rebounds off the wall and lands with a hollow cartoon bonk.',
      trigger: () => soundEngine.playHeadBonk(),
    },
    {
      project: 'paper-ball-30' as const,
      name: 'Training Montage Music',
      time: '30s Cut (11.2s – 14.8s)',
      desc: 'Procedural triangle-wave workout melody with stomp-like downbeats. No external music files.',
      trigger: () => soundEngine.playTrainingMusic(),
    },
    {
      project: 'paper-ball-30' as const,
      name: 'Lamp Bell Ding',
      time: '30s Cut (16.3s)',
      desc: 'Resonant brass bell as the ricochet clips the table lamp.',
      trigger: () => soundEngine.playLampDing(),
    },
    {
      project: 'paper-ball-30' as const,
      name: 'Ceiling Fan WHACK',
      time: '30s Cut (17.7s)',
      desc: 'Heavy spinning-blade impact that redirects the ball toward the trash can.',
      trigger: () => soundEngine.playFanWhack(),
    },
    {
      project: 'paper-ball-30' as const,
      name: 'Suspense Heartbeat',
      time: '30s Cut (19.3s, 20.3s, 21.3s, 22.2s)',
      desc: 'Low lub-dub heartbeat under the exaggerated slow-motion drop.',
      trigger: () => soundEngine.playHeartbeat(),
    },
    {
      project: 'paper-ball-30' as const,
      name: 'Trash Plop',
      time: '30s Cut (23.0s)',
      desc: 'Satisfying damp paper plop as the ball finally lands inside the can.',
      trigger: () => soundEngine.playDeskPlop(),
    },
    {
      project: 'paper-ball-30' as const,
      name: 'Victory Fanfare',
      time: '30s Cut (23.6s – 26.9s)',
      desc: 'Triumphant three-second sawtooth brass fanfare that cuts out the instant he kicks the can.',
      trigger: () => soundEngine.playVictoryFanfare(),
    },
    {
      project: 'paper-ball-30' as const,
      name: 'Trash Can Crash',
      time: '30s Cut (27.0s)',
      desc: 'Noise burst, metal clatter, low thud, and paper-ball bounces as the can tips over.',
      trigger: () => soundEngine.playTrashCrash(),
    },
    {
      project: 'paper-ball-30' as const,
      name: 'Sad Trombone',
      time: '30s Cut (28.2s – 30.0s)',
      desc: 'Mournful wah-wah-wah-waaah under the final defeated deadpan stare.',
      trigger: () => soundEngine.playSadTrombone(),
    },
    // Shadow Quit Effects
    {
      project: 'shadow-quit' as const,
      name: 'Record Scratch',
      time: 'Shadow Quit (2.0s)',
      desc: 'Sharp comedic vinyl needle rip as the shadow stops dead in its tracks.',
      trigger: () => soundEngine.playRecordScratch(),
    },
    {
      project: 'shadow-quit' as const,
      name: 'Clipboard Paper Slap',
      time: 'Shadow Quit (4.5s)',
      desc: 'Filtered high-frequency friction burst as the shadow pulls the clipboard.',
      trigger: () => soundEngine.playPaperSlap(),
    },
    {
      project: 'shadow-quit' as const,
      name: 'Clipboard Double Tap',
      time: 'Shadow Quit (5.05s, 5.25s)',
      desc: 'Two dry, bureaucratic finger taps (1350Hz click) on the grievance page.',
      trigger: () => {
        soundEngine.playClipboardTap();
        setTimeout(() => soundEngine.playClipboardTap(), 180);
      },
    },
    {
      project: 'shadow-quit' as const,
      name: 'Sad Trombone (Wah-wah-waaah)',
      time: 'Shadow Quit (8.0s - 9.2s)',
      desc: 'Iconic 4-note mournful brass glide (Eb3 -> D3 -> Db3 -> C3 drooping to B2) during thumbs down.',
      trigger: () => soundEngine.playSadTrombone(),
    },
    // Episode 2 Effects
    {
      project: 'paper-ball-sequel' as const,
      name: 'Dramatic Opening Rumble',
      time: 'Episode 2 (0.1s)',
      desc: 'Low filtered sub-rumble that rolls in under the stare at the wreckage.',
      trigger: () => soundEngine.playDramaticRumble(),
    },
    {
      project: 'paper-ball-sequel' as const,
      name: 'Cartoon Bonks (Ceiling & Foot)',
      time: 'Episode 2 (7.75s, 8.35s)',
      desc: 'Hollow dook for the ceiling bonk and the ball that lands on his own foot.',
      trigger: () => {
        soundEngine.playHeadBonk();
        setTimeout(() => soundEngine.playHeadBonk(), 620);
      },
    },
    {
      project: 'paper-ball-sequel' as const,
      name: 'Knuckle Cracks',
      time: 'Episode 2 (6.35s)',
      desc: 'Two dry filtered pops as he cracks his knuckles before the champion pose.',
      trigger: () => soundEngine.playKnuckleCrack(),
    },
    {
      project: 'paper-ball-sequel' as const,
      name: 'Mechanical Assembly Clicks',
      time: 'Episode 2 (5.45s – 16.95s)',
      desc: 'Band-passed noise clicks with a square blip as balls line up and the launcher is built.',
      trigger: () => {
        soundEngine.playMechanicalClick();
        setTimeout(() => soundEngine.playMechanicalClick(), 150);
        setTimeout(() => soundEngine.playMechanicalClick(), 300);
      },
    },
    {
      project: 'paper-ball-sequel' as const,
      name: 'Calming Chime',
      time: 'Episode 2 (14.55s)',
      desc: 'Warm three-partial bell that introduces the fake peaceful smile.',
      trigger: () => soundEngine.playCalmingChime(),
    },
    {
      project: 'paper-ball-sequel' as const,
      name: 'Deep Inhale',
      time: 'Episode 2 (14.05s)',
      desc: 'Band-passed breath noise swelling up before the rage is swallowed.',
      trigger: () => soundEngine.playDeepBreath(),
    },
    {
      project: 'paper-ball-sequel' as const,
      name: 'Over-Powered Launcher',
      time: 'Episode 2 (19.0s)',
      desc: 'Spring twang, air blast, and a low body thump for far too much force.',
      trigger: () => soundEngine.playLauncherFire(),
    },
    {
      project: 'paper-ball-sequel' as const,
      name: 'Rubber Band Twang',
      time: 'Episode 2 (17.45s)',
      desc: 'Descending triangle-wave pluck as the bands are stretched back.',
      trigger: () => soundEngine.playRubberBandTwang(),
    },
    {
      project: 'paper-ball-sequel' as const,
      name: 'Victory Fanfare',
      time: 'Episode 2 (25.0s)',
      desc: 'Three-second triumphant brass fanfare for the impossible sink.',
      trigger: () => soundEngine.playVictoryFanfare(),
    },
    {
      project: 'paper-ball-sequel' as const,
      name: 'Launcher Snap Crash',
      time: 'Episode 2 (27.6s)',
      desc: 'Noise burst, metal clatter, and a low thud as the contraption and books explode.',
      trigger: () => soundEngine.playTrashCrash(),
    },
    {
      project: 'paper-ball-sequel' as const,
      name: 'Sad Trombone Finale',
      time: 'Episode 2 (28.8s – 30.0s)',
      desc: 'Mournful wah-wah-wah-waaah under the frozen, book-crowned deadpan stare.',
      trigger: () => soundEngine.playSadTrombone(),
    },
    // Trick-Shot Champion Effects
    {
      project: 'trick-shot-champion' as const,
      name: 'Epic Championship Score',
      time: 'Trick Shot (0.0s - 60.0s)',
      desc: 'A 60-second original pop instrumental: a driving 128 BPM beat that grows into a full cinematic epic for the championship shot and ends on a triumphant final chord.',
      trigger: () => soundEngine.playTrickShotScoreSection(undefined, 0, 60),
    },
    {
      project: 'trick-shot-champion' as const,
      name: 'Hoop Crash',
      time: 'Trick Shot (0.2s, 15.6s)',
      desc: 'A heavy metal clatter for the hoop falling on his head and being knocked upright again.',
      trigger: () => soundEngine.playHoopCrash(),
    },
    {
      project: 'trick-shot-champion' as const,
      name: 'Rim Clank',
      time: 'Trick Shot (4.95s, 13.3s, 32.9s, 41.65s, 44.2s)',
      desc: 'The sharp ring of a basketball hitting the rim or the backboard.',
      trigger: () => soundEngine.playRimClink(),
    },
    {
      project: 'trick-shot-champion' as const,
      name: 'Forehead Bonk',
      time: 'Trick Shot (5.65s)',
      desc: 'The dull thud of the basketball dropping straight onto his forehead after the rim bounce.',
      trigger: () => soundEngine.playHeadBonk(),
    },
    {
      project: 'trick-shot-champion' as const,
      name: 'Wall Rebound',
      time: 'Trick Shot (9.35s, 17.9s, 39.3s)',
      desc: 'A rubbery slap as the ball ricochets off the right wall of the court.',
      trigger: () => soundEngine.playWallBounce(),
    },
    {
      project: 'trick-shot-champion' as const,
      name: 'Swish',
      time: 'Trick Shot (25.3s, 46.05s)',
      desc: 'The clean net swish of the practice shot and the impossible championship shot.',
      trigger: () => soundEngine.playSwish(),
    },
    {
      project: 'trick-shot-champion' as const,
      name: 'Championship Crowd',
      time: 'Trick Shot (46.15s, 47.4s, 52.6s)',
      desc: 'A swelling crowd roar for the impossible shot and the trophy presentation.',
      trigger: () => soundEngine.playCrowdCheer(),
    },
    {
      project: 'trick-shot-champion' as const,
      name: 'Deep Breath',
      time: 'Trick Shot (35.0s)',
      desc: 'A long steadying inhale before the impossible shot is thrown.',
      trigger: () => soundEngine.playDeepBreath(),
    },
    {
      project: 'trick-shot-champion' as const,
      name: 'Victory Fanfare',
      time: 'Trick Shot (59.55s)',
      desc: 'The final triumphant blast on the last frame before the cut to black.',
      trigger: () => soundEngine.playVictoryFanfare(),
    },
    // Pop Star Effects
    {
      project: 'pop-star' as const,
      name: 'Original Pop Instrumental',
      time: 'Pop Star (0.0s - 58.0s)',
      desc: 'A 58-second original upbeat pop arrangement: kick, snare, hats, bass, plucks, a pad and a lead that joins the robot dance.',
      trigger: () => soundEngine.playPopTrack(),
    },
    {
      project: 'pop-star' as const,
      name: 'Crowd Cheer',
      time: 'Pop Star (0.7s, 39.0s, 44.2s)',
      desc: 'A swelling crowd wash with pitched whoops for the screen crowd going wild.',
      trigger: () => soundEngine.playCrowdCheer(),
    },
    {
      project: 'pop-star' as const,
      name: 'Robot Bleep',
      time: 'Pop Star (23.2s, 29.1s, 32.0s)',
      desc: 'Two tiny square-wave bleeps, the only sound Beep ever makes.',
      trigger: () => soundEngine.playRobotBleep(),
    },
    {
      project: 'pop-star' as const,
      name: 'Hairbrush Break',
      time: 'Pop Star (5.1s)',
      desc: 'A descending snap with a filtered noise burst as Max is left holding half a brush.',
      trigger: () => soundEngine.playBrushBreak(),
    },
    {
      project: 'pop-star' as const,
      name: 'Microphone Sparkle',
      time: 'Pop Star (3.0s, 7.2s, 45.0s, 54.4s)',
      desc: 'A rising four-note shimmer for glamorous mics, superstar dreams and crowns.',
      trigger: () => soundEngine.playMicSparkle(),
    },
    {
      project: 'pop-star' as const,
      name: 'Soft Cushion Boing',
      time: 'Pop Star (49.6s)',
      desc: 'A rubbery 320Hz-to-88Hz boing for Rex sliding into the cushions.',
      trigger: () => soundEngine.playBasketballBounce(),
    },
    // Part 4 Effects
    {
      project: 'paper-ball-part4' as const,
      name: 'Opening Swish & Hoop Creak',
      time: 'Part 4 (0.15s, 1.2s)',
      desc: 'A soft net swish, then the strained metal creak of the hoop about to give up.',
      trigger: () => {
        soundEngine.playSwish();
        setTimeout(() => soundEngine.playArmCrossSqueak(), 900);
      },
    },
    {
      project: 'paper-ball-part4' as const,
      name: 'The Hoop Bonk',
      time: 'Part 4 (2.6s)',
      desc: 'The whole hoop assembly landing on his head with a hollow cartoon bonk.',
      trigger: () => soundEngine.playHeadBonk(),
    },
    {
      project: 'paper-ball-part4' as const,
      name: 'Ball Barrage',
      time: 'Part 4 (7.5s – 14.4s)',
      desc: 'Foot bonks, rubbery bounces, a squeaky chase and a hard landing as the balls get away from him.',
      trigger: () => {
        soundEngine.playHeadBonk();
        setTimeout(() => soundEngine.playBasketballBounce(), 320);
        setTimeout(() => soundEngine.playFloorThump(), 900);
      },
    },
    {
      project: 'paper-ball-part4' as const,
      name: 'Trick Shot',
      time: 'Part 4 (16.1s – 20.4s)',
      desc: 'A throw whoosh, a support clink, two boings off the floor and the wall, and the swish.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playRimClink(), 700);
        setTimeout(() => soundEngine.playBasketballBounce(), 1250);
        setTimeout(() => soundEngine.playSwish(), 4300);
      },
    },
    {
      project: 'paper-ball-part4' as const,
      name: 'Champion Fanfare',
      time: 'Part 4 (21.0s, 21.8s)',
      desc: 'A triumphant fanfare and an imaginary crowd cheer for a podium of basketballs.',
      trigger: () => {
        soundEngine.playVictoryFanfare();
        setTimeout(() => soundEngine.playCrowdCheer(), 700);
      },
    },
    {
      project: 'paper-ball-part4' as const,
      name: 'Net Snag & Sad Trombone',
      time: 'Part 4 (26.3s – 29.8s)',
      desc: 'Balls rolling away, the net creaking on the support, one last bounce and a mournful trombone.',
      trigger: () => {
        soundEngine.playBasketballBounce();
        setTimeout(() => soundEngine.playArmCrossSqueak(), 1500);
        setTimeout(() => soundEngine.playSadTrombone(), 3000);
      },
    },
    {
      project: 'paper-ball-part3' as const,
      name: 'Book Bonk',
      time: 'Part 3 (0.62s)',
      desc: 'Hollow cartoon dook as the book drops straight onto his head.',
      trigger: () => soundEngine.playHeadBonk(),
    },
    {
      project: 'paper-ball-part3' as const,
      name: 'The Long Walk March',
      time: 'Part 3 (2.0s)',
      desc: 'Four-on-the-floor kick, snare and a low bass line for the walk to the court.',
      trigger: () => soundEngine.playDramaticMarch(),
    },
    {
      project: 'paper-ball-part3' as const,
      name: 'Squeaky Shoes',
      time: 'Part 3 (3.9s, 4.6s, 5.3s)',
      desc: 'High band-passed creak for the tiny fast steps that get him there.',
      trigger: () => soundEngine.playSqueak(),
    },
    {
      project: 'paper-ball-part3' as const,
      name: 'Panting & Calm Down',
      time: 'Part 3 (5.6s, 19.9s)',
      desc: 'A swelling breath for the exhausted walk, then the deep inhale before the final shot.',
      trigger: () => soundEngine.playDeepBreath(),
    },
    {
      project: 'paper-ball-part3' as const,
      name: 'Rim Rattle',
      time: 'Part 3 (9.78s, 15.35s, 23.4s, 23.9s)',
      desc: 'Metallic rim clink for the rattles, the two circles, and the swish setup.',
      trigger: () => soundEngine.playRimClink(),
    },
    {
      project: 'paper-ball-part3' as const,
      name: 'Ball-To-Face Bonks',
      time: 'Part 3 (10.12s, 11.52s, 15.62s, 16.72s)',
      desc: 'The recurring hollow bonk of the basketball meeting his face. Again. And again.',
      trigger: () => {
        soundEngine.playHeadBonk();
        setTimeout(() => soundEngine.playHeadBonk(), 260);
      },
    },
    {
      project: 'paper-ball-part3' as const,
      name: 'Net Swish',
      time: 'Part 3 (24.5s)',
      desc: 'Airy band-passed flutter with a soft thump as the ball drops through the net.',
      trigger: () => soundEngine.playSwish(),
    },
    {
      project: 'paper-ball-part3' as const,
      name: 'Champion Fanfare & Crowd',
      time: 'Part 3 (25.0s, 25.6s)',
      desc: 'A triumphant fanfare and a swelling crowd cheer for an audience of nobody.',
      trigger: () => {
        soundEngine.playVictoryFanfare();
        setTimeout(() => soundEngine.playCrowdCheer(), 620);
      },
    },
    {
      project: 'paper-ball-part3' as const,
      name: 'Hoop Bonk & Sad Trombone',
      time: 'Part 3 (28.45s, 28.9s)',
      desc: 'The heavy bonk of the backboard landing on his head, then a mournful wah-wah-wah-waaah under the furious stare before the cut to black.',
      trigger: () => {
        soundEngine.playHeadBonk();
        setTimeout(() => soundEngine.playSadTrombone(), 450);
      },
    },
    {
      project: 'dart-shot' as const,
      name: 'Smug Challenge',
      time: 'Dart Shot (0.4s - 1.15s)',
      desc: 'A confident ding and a tiny sparkle under the shoulder roll, with one squeaky joint for the stretch.',
      trigger: () => {
        soundEngine.playConfidenceDing();
        setTimeout(() => soundEngine.playMicSparkle(), 750);
        setTimeout(() => soundEngine.playSqueak(), 500);
      },
    },
    {
      project: 'dart-shot' as const,
      name: 'Wild Miss & Cork THUNK',
      time: 'Dart Shot (4.2s - 4.85s)',
      desc: 'The throw whoosh, then a soft blunt dart thunk into the noticeboard — followed by dead silence.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playDartThunk(), 650);
      },
    },
    {
      project: 'dart-shot' as const,
      name: 'Book Launcher Build & Fire',
      time: 'Dart Shot (8.45s - 12.0s)',
      desc: 'Three book thumps, a ruler tap, mechanical clicks, the rubber-band pull and the spring launch of the dart.',
      trigger: () => {
        soundEngine.playDeskPlop();
        setTimeout(() => soundEngine.playDeskPlop(), 500);
        setTimeout(() => soundEngine.playDeskPlop(), 1000);
        setTimeout(() => soundEngine.playClipboardTap(), 1550);
        setTimeout(() => soundEngine.playMechanicalClick(), 1900);
        setTimeout(() => soundEngine.playMechanicalClick(), 2300);
        setTimeout(() => soundEngine.playRubberBandTwang(), 3250);
        setTimeout(() => soundEngine.playLauncherFire(), 3550);
        setTimeout(() => soundEngine.playDartThunk(), 4350);
      },
    },
    {
      project: 'dart-shot' as const,
      name: 'Rage Growl & Final Throw',
      time: 'Dart Shot (14.15s - 17.55s)',
      desc: 'A low dramatic rumble, a furious squeak, a heavy stomp, a deep breath and the huge wind-up whoosh.',
      trigger: () => {
        soundEngine.playDramaticRumble();
        setTimeout(() => soundEngine.playSqueak(), 750);
        setTimeout(() => soundEngine.playFloorThump(), 1300);
        setTimeout(() => soundEngine.playDeepBreath(), 1950);
        setTimeout(() => soundEngine.playWhoosh(), 2750);
        setTimeout(() => soundEngine.playWhoosh(), 3400);
      },
    },
    {
      project: 'dart-shot' as const,
      name: 'Clock, Lamp, Chair Ricochet',
      time: 'Dart Shot (19.35s - 23.46s)',
      desc: 'The clock bounce, the lampshade ding, the chair plop, then the rim clink and the confident DING on the bullseye.',
      trigger: () => {
        soundEngine.playWallBounce();
        setTimeout(() => soundEngine.playLampDing(), 850);
        setTimeout(() => soundEngine.playDeskPlop(), 1430);
        setTimeout(() => soundEngine.playRimClink(), 4050);
        setTimeout(() => soundEngine.playConfidenceDing(), 4110);
      },
    },
    {
      project: 'dart-shot' as const,
      name: 'Helmet Bonk & Record Scratch',
      time: 'Dart Shot (25.02s - 28.6s)',
      desc: 'The victory fanfare and crowd, the dart pluck, the creaking mount, the heavy board BONK and the record scratch under "I QUIT."',
      trigger: () => {
        soundEngine.playVictoryFanfare();
        setTimeout(() => soundEngine.playCrowdCheer(), 330);
        setTimeout(() => soundEngine.playDartThunk(), 560);
        setTimeout(() => soundEngine.playMechanicalClick(), 1030);
        setTimeout(() => soundEngine.playHeadBonk(), 1830);
        setTimeout(() => soundEngine.playFloorThump(), 2930);
        setTimeout(() => soundEngine.playRecordScratch(), 2500);
      },
    },
    {
      project: 'ping-pong-revenge' as const,
      name: 'Smug Table Bounce',
      time: 'Ping-Pong (0.35s - 3.12s)',
      desc: 'A confident ding, a cup sparkle and one light ping-pong bounce on the table before the throw.',
      trigger: () => {
        soundEngine.playConfidenceDing();
        setTimeout(() => soundEngine.playMicSparkle(), 500);
        setTimeout(() => soundEngine.playDeskPlop(), 2600);
      },
    },
    {
      project: 'ping-pong-revenge' as const,
      name: 'Wall Rebond & Forehead Bonk',
      time: 'Ping-Pong (4.05s - 6.0s)',
      desc: 'The throw whoosh, a hard far-wall bounce, then the forehead bonk with half a second of dead silence under it.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playWallBounce(), 700);
        setTimeout(() => soundEngine.playHeadBonk(), 1900);
      },
    },
    {
      project: 'ping-pong-revenge' as const,
      name: 'Book Ramp & Foot Plop',
      time: 'Ping-Pong (8.55s - 12.6s)',
      desc: 'Three book thumps, three measuring beeps, the launch whoosh, the top-book bounce and a tiny pained squeak.',
      trigger: () => {
        soundEngine.playDeskPlop();
        setTimeout(() => soundEngine.playCalculatorBeep(), 700);
        setTimeout(() => soundEngine.playCalculatorBeep(), 1050);
        setTimeout(() => soundEngine.playWhoosh(), 3000);
        setTimeout(() => soundEngine.playSqueak(), 3700);
      },
    },
    {
      project: 'ping-pong-revenge' as const,
      name: 'Table Slam & Spring Launch',
      time: 'Ping-Pong (15.42s - 15.7s)',
      desc: 'A heavy two-handed slam on the table, the table flexing and the ball firing vertically toward the ceiling.',
      trigger: () => {
        soundEngine.playFloorThump();
        setTimeout(() => soundEngine.playWhoosh(), 220);
      },
    },
    {
      project: 'ping-pong-revenge' as const,
      name: 'Ricochet & Cup Landing',
      time: 'Ping-Pong (18.6s - 22.9s)',
      desc: 'Four rapid boings around the room, the lamp ding, the porcelain clink of the cup landing on his head and the soft plop of the ball dropping in.',
      trigger: () => {
        soundEngine.playWallBounce();
        setTimeout(() => soundEngine.playWallBounce(), 780);
        setTimeout(() => soundEngine.playLampDing(), 1580);
        setTimeout(() => soundEngine.playRimClink(), 3600);
        setTimeout(() => soundEngine.playDeskPlop(), 4280);
        setTimeout(() => soundEngine.playMicSparkle(), 4450);
      },
    },
    {
      project: 'ping-pong-revenge' as const,
      name: 'Victory, Bonk & Record Scratch',
      time: 'Ping-Pong (25.0s - 28.6s)',
      desc: 'A short victory fanfare and crowd, a tiny pop, the second forehead bonk, then the record scratch as the cup slides over his face.',
      trigger: () => {
        soundEngine.playVictoryFanfare();
        setTimeout(() => soundEngine.playMechanicalClick(), 1950);
        setTimeout(() => soundEngine.playHeadBonk(), 2650);
        setTimeout(() => soundEngine.playRecordScratch(), 3600);
      },
    },
    {
      project: 'coin-flip' as const,
      name: 'Coin Flip & Rude Return',
      time: 'Coin Flip (2.55s - 5.9s)',
      desc: 'The flick whoosh, the metallic rim ting, the cartoon BONK on his forehead and the tiny gold coin ring as it lands on the table.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playRimClink(), 2070);
        setTimeout(() => soundEngine.playHeadBonk(), 2800);
        setTimeout(() => soundEngine.playCoinTing(), 3310);
      },
    },
    {
      project: 'coin-flip' as const,
      name: 'Science Fair Launcher',
      time: 'Coin Flip (8.45s - 13.4s)',
      desc: 'Three book thumps, a ruler tap, two mechanical clicks, the rubber-band pull, the spring launch and the plop into his own shoe.',
      trigger: () => {
        soundEngine.playDeskPlop();
        setTimeout(() => soundEngine.playDeskPlop(), 500);
        setTimeout(() => soundEngine.playDeskPlop(), 1000);
        setTimeout(() => soundEngine.playClipboardTap(), 1550);
        setTimeout(() => soundEngine.playMechanicalClick(), 1870);
        setTimeout(() => soundEngine.playMechanicalClick(), 2250);
        setTimeout(() => soundEngine.playCoinTing(), 2610);
        setTimeout(() => soundEngine.playRubberBandTwang(), 3250);
        setTimeout(() => soundEngine.playLauncherFire(), 3590);
        setTimeout(() => soundEngine.playWhoosh(), 3930);
        setTimeout(() => soundEngine.playDeskPlop(), 4930);
      },
    },
    {
      project: 'coin-flip' as const,
      name: 'Max Rage & Final Flick',
      time: 'Coin Flip (14.15s - 17.55s)',
      desc: 'The low rumble, the launcher clatter, the growl, the heavy stomp, the deep breath and the huge wind-up whoosh before the final flick.',
      trigger: () => {
        soundEngine.playDramaticRumble();
        setTimeout(() => soundEngine.playDeskPlop(), 50);
        setTimeout(() => soundEngine.playSqueak(), 1030);
        setTimeout(() => soundEngine.playFloorThump(), 1470);
        setTimeout(() => soundEngine.playDeepBreath(), 1950);
        setTimeout(() => soundEngine.playWhoosh(), 2650);
        setTimeout(() => soundEngine.playWhoosh(), 3400);
      },
    },
    {
      project: 'coin-flip' as const,
      name: 'Clock, Lamp Loop & Splash',
      time: 'Coin Flip (19.5s - 23.45s)',
      desc: 'The clock bounce, the lampshade ding, the book plop, then the water splash and the confident DING as the coin lands in the glass.',
      trigger: () => {
        soundEngine.playWallBounce();
        setTimeout(() => soundEngine.playLampDing(), 850);
        setTimeout(() => soundEngine.playWhoosh(), 1050);
        setTimeout(() => soundEngine.playDeskPlop(), 2350);
        setTimeout(() => soundEngine.playWaterSplash(), 3950);
        setTimeout(() => soundEngine.playConfidenceDing(), 4080);
      },
    },
    {
      project: 'coin-flip' as const,
      name: 'Water Bucket Ending',
      time: 'Coin Flip (25.02s - 28.6s)',
      desc: 'The victory fanfare and crowd, the wobbling glass, the big water splash on his head, the tiny coin ting and the record scratch under "I QUIT."',
      trigger: () => {
        soundEngine.playVictoryFanfare();
        setTimeout(() => soundEngine.playCrowdCheer(), 330);
        setTimeout(() => soundEngine.playSqueak(), 1580);
        setTimeout(() => soundEngine.playWhoosh(), 1980);
        setTimeout(() => soundEngine.playWaterSplash(), 2340);
        setTimeout(() => soundEngine.playCoinTing(), 2560);
        setTimeout(() => soundEngine.playRecordScratch(), 3030);
      },
    },
    {
      project: 'runaway-cake' as const,
      name: 'Cake Spring Boing',
      time: 'Runaway Cake (4.5s / 6.1s / 22.0s)',
      desc: 'Snappy cartoon spring boing (140Hz -> 760Hz sweep) for cake legs unfolding and dynamic leaps.',
      trigger: () => soundEngine.playBoingSpring(),
    },
    {
      project: 'runaway-cake' as const,
      name: 'Frosting Squirt & Slide',
      time: 'Runaway Cake (12.2s / 13.3s)',
      desc: 'Slick lowpass filtered squishy slide as cake squirts frosting trail across kitchen floor.',
      trigger: () => soundEngine.playFrostingSquirt(),
    },
    {
      project: 'runaway-cake' as const,
      name: 'Confetti Cannon Pop',
      time: 'Runaway Cake (25.0s)',
      desc: 'Festive explosion burst followed by high-frequency harmonic sparkle chimes.',
      trigger: () => soundEngine.playConfettiPop(),
    },
    {
      project: 'runaway-cake' as const,
      name: 'Cupcake Bite Chomp',
      time: 'Runaway Cake (28.2s)',
      desc: 'Snappy cartoon gulp and bite as the tiny cupcake steals the slice right in front of Stickman.',
      trigger: () => soundEngine.playCupcakeChomp(),
    },
    {
      project: 'runaway-cake' as const,
      name: 'Dizzy Stars Whirl',
      time: 'Runaway Cake (16.4s)',
      desc: 'Wobbling dual sinusoidal warble for Stickman cross-eyed cushion crash.',
      trigger: () => soundEngine.playDizzyWhirl(),
    },
    {
      project: 'runaway-cake' as const,
      name: 'Comedy Theme (Part 1)',
      time: 'Runaway Cake (0.0s - 7.5s)',
      desc: 'Upbeat bouncy cartoon marimba and bassline comedy score.',
      trigger: () => soundEngine.playRunawayCakeScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'self-building-robot' as const,
      name: 'Blue Laser Scan',
      time: 'Self-Building Robot (6.05s / 12.05s / 18.5s)',
      desc: 'Futuristic dual-sine radar sweep as the robot scans workshop and living room objects.',
      trigger: () => soundEngine.playLaserScan(),
    },
    {
      project: 'self-building-robot' as const,
      name: 'Servo Upgrade Latch',
      time: 'Self-Building Robot (8.3s / 13.0s / 26.75s)',
      desc: 'Mechanical sawtooth servo ramp with crisp latch click for attaching wheels, fan, pots, and giant legs.',
      trigger: () => soundEngine.playServoWhir(),
    },
    {
      project: 'self-building-robot' as const,
      name: 'Low-Battery Warning',
      time: 'Self-Building Robot (24.05s)',
      desc: 'Descending square-wave triple warning beep when the giant robot runs out of power.',
      trigger: () => soundEngine.playPowerDownBeep(),
    },
    {
      project: 'self-building-robot' as const,
      name: 'Power Bank Recharge Surge',
      time: 'Self-Building Robot (26.25s)',
      desc: 'Ascending electric chord surge as Stickman plugs the power bank into the robot.',
      trigger: () => soundEngine.playPowerUpSurge(),
    },
    {
      project: 'self-building-robot' as const,
      name: 'Workshop Comedy Score (Part 1)',
      time: 'Self-Building Robot (0.0s - 7.5s)',
      desc: 'Playful 136 BPM synth bass and arpeggio comedy theme.',
      trigger: () => soundEngine.playRobotScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'infinite-gift-box' as const,
      name: 'Golden Ribbon Pull',
      time: 'Infinite Gift Box (3.9s / 19.5s / 25.25s)',
      desc: 'Elastic golden ribbon tug squeak as Stickman pulls the bow or tests the doorway barrier.',
      trigger: () => soundEngine.playRibbonPull(),
    },
    {
      project: 'infinite-gift-box' as const,
      name: 'Nested Box Pop Open',
      time: 'Infinite Gift Box (6.05s / 7.85s / 9.05s)',
      desc: 'Crisp cardboard lid pop + escalating reveal chime as purple, blue, and green boxes open.',
      trigger: () => {
        soundEngine.playBoxPopOpen(undefined, 0.9);
        setTimeout(() => soundEngine.playBoxPopOpen(undefined, 1.15), 350);
        setTimeout(() => soundEngine.playBoxPopOpen(undefined, 1.4), 700);
      },
    },
    {
      project: 'infinite-gift-box' as const,
      name: 'Giant Box Unfold & Retract',
      time: 'Infinite Gift Box (13.35s / 18.05s / 25.45s)',
      desc: 'Rising cardboard expansion sweep as the giant red box swells over the living room.',
      trigger: () => soundEngine.playMagicExpand(undefined, false),
    },
    {
      project: 'infinite-gift-box' as const,
      name: '100-Box Surprise Fountain',
      time: 'Infinite Gift Box (27.55s)',
      desc: 'Playful popping cascade as the purple box erupts tiny colorful gift boxes upward.',
      trigger: () => soundEngine.playGiftFountain(),
    },
    {
      project: 'infinite-gift-box' as const,
      name: 'Living-Room Comedy Score (Part 1)',
      time: 'Infinite Gift Box (0.0s - 7.5s)',
      desc: 'Bouncy 134 BPM living-room synth comedy groove.',
      trigger: () => soundEngine.playGiftBoxScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'living-traffic-light' as const,
      name: 'Traffic Light Glitch Blink',
      time: 'Living Traffic Light (1.65s / 2.2s / 2.55s)',
      desc: 'Electronic signal blink & cartoon eye-pop chirp as the traffic light comes alive.',
      trigger: () => soundEngine.playTrafficBlink(),
    },
    {
      project: 'living-traffic-light' as const,
      name: 'Mechanical STOP Sign Snap',
      time: 'Living Traffic Light (7.05s / 8.5s / 9.85s / 21.55s)',
      desc: 'Sharp metallic arm extension + horn block as the STOP sign slams into Stickman’s path.',
      trigger: () => soundEngine.playStopSignSnap(),
    },
    {
      project: 'living-traffic-light' as const,
      name: 'Rolling Pole Wheels',
      time: 'Living Traffic Light (13.6s / 15.2s / 16.5s)',
      desc: 'Squeaky rubber wheel roll as the living traffic light stalks sideways down the crosswalk.',
      trigger: () => soundEngine.playWheelRoll(),
    },
    {
      project: 'living-traffic-light' as const,
      name: 'Unplug & Blackout Drop',
      time: 'Living Traffic Light (24.85s)',
      desc: 'Downward electric power-off sweep when Stickman yanks the plug from the roadside power box.',
      trigger: () => soundEngine.playPowerBlackout(),
    },
    {
      project: 'living-traffic-light' as const,
      name: 'Backup Battery & Red Alarm',
      time: 'Living Traffic Light (26.65s - 28.5s)',
      desc: 'Rising hidden battery hum followed by flashing red alarm pulses in Stickman’s frozen face.',
      trigger: () => {
        soundEngine.playBatteryCharge();
        setTimeout(() => soundEngine.playRedAlarmFlash(), 900);
      },
    },
    {
      project: 'living-traffic-light' as const,
      name: 'Street Comedy Score (Part 1)',
      time: 'Living Traffic Light (0.0s - 7.5s)',
      desc: 'Upbeat 130 BPM street-crossing synth comedy groove with blackout & freeze silences.',
      trigger: () => soundEngine.playTrafficLightScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'clone-button-disaster' as const,
      name: 'CLONE Machine Button Press',
      time: 'Clone Button (2.2s / 6.3s–10.1s)',
      desc: 'Chunky mechanical red button click + spring release when Stickman mashes the CLONE panel.',
      trigger: () => soundEngine.playCloneButtonPress(),
    },
    {
      project: 'clone-button-disaster' as const,
      name: 'Clone Flash & Pop',
      time: 'Clone Button (2.9s / 6.75s–16.0s)',
      desc: 'Bright synth pop-in sparkle as an identical Stickman materializes from the machine flash.',
      trigger: () => soundEngine.playClonePop(undefined, 1),
    },
    {
      project: 'clone-button-disaster' as const,
      name: 'RESET Button & Crowd Vanish',
      time: 'Clone Button (25.45s)',
      desc: 'Downward sci-fi vanish sweep as the bright full-screen RESET flash erases all 20 floor clones.',
      trigger: () => soundEngine.playResetFlashVanish(),
    },
    {
      project: 'clone-button-disaster' as const,
      name: 'Mini Shoulder Clone Shock Sting',
      time: 'Clone Button (28.45s)',
      desc: 'Tiny high-pitched squeak pop followed by a sharp comedic shock chord when the mini clone waves.',
      trigger: () => {
        soundEngine.playClonePop(undefined, 1.65);
        setTimeout(() => soundEngine.playCloneShockSting(), 350);
      },
    },
    {
      project: 'clone-button-disaster' as const,
      name: 'Clone Chaos Score (Part 1)',
      time: 'Clone Button (0.0s - 7.5s)',
      desc: 'Upbeat 136 BPM comedy synth groove with brief silence windows for the reset vanish and ending shock.',
      trigger: () => soundEngine.playCloneDisasterScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'rubber-band-trap' as const,
      name: 'Giant Band Elastic Stretch',
      time: 'Rubber Band (2.8s / 4.4s / 6.4s)',
      desc: 'Strained rubber-band creak rising in tension as Stickman pulls the giant band back.',
      trigger: () => soundEngine.playRubberStretch(undefined, 1.15),
    },
    {
      project: 'rubber-band-trap' as const,
      name: 'Wooden Post Crack & Snap',
      time: 'Rubber Band (13.25s)',
      desc: 'Dry splintering wood crack and bolt pop right before the band launches Stickman.',
      trigger: () => soundEngine.playWoodCrackSnap(),
    },
    {
      project: 'rubber-band-trap' as const,
      name: 'Giant Slingshot Launch Twang',
      time: 'Rubber Band (13.55s / 22.05s / 26.05s)',
      desc: 'Heavy oscillating rubber recoil twang as the giant red band snaps Stickman airborne.',
      trigger: () => soundEngine.playRubberTwangSnap(undefined, 1.05),
    },
    {
      project: 'rubber-band-trap' as const,
      name: 'Sofa & Pillow Cushion Boing',
      time: 'Rubber Band (18.25s / 19.75s)',
      desc: 'Puffy elastic cushion bounce as Stickman ricochets off the giant sofa and pillow pile.',
      trigger: () => soundEngine.playCushionBounce(undefined, 1.0),
    },
    {
      project: 'rubber-band-trap' as const,
      name: 'Beanie Whip Flick',
      time: 'Rubber Band (28.15s)',
      desc: 'Crisp high-speed elastic snap as the loose rubber tail flicks Stickman’s red beanie off.',
      trigger: () => soundEngine.playBeanieFlick(),
    },
    {
      project: 'rubber-band-trap' as const,
      name: 'Slapstick Rubber Band Score (Part 1)',
      time: 'Rubber Band (0.0s - 7.5s)',
      desc: 'Upbeat 134 BPM pop comedy score with brief silence windows for the post snap and final glare.',
      trigger: () => soundEngine.playRubberBandScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'mystery-floor-hole' as const,
      name: 'Purple Portal Drop Bloop',
      time: 'Mystery Hole (2.35s / 7.15s / 13.05s / 19.75s)',
      desc: 'Descending mysterious bloop as a small coin, duck, car, or red beanie drops into the glowing floor hole.',
      trigger: () => soundEngine.playHoleDropBloop(undefined, 1.05),
    },
    {
      project: 'mystery-floor-hole' as const,
      name: 'Giant Portal Eruption Boom',
      time: 'Mystery Hole (3.3s / 7.85s / 13.75s / 20.75s / 27.8s)',
      desc: 'Heavy low boom + rising shimmer as an oversized version rockets out of the purple floor hole.',
      trigger: () => soundEngine.playHoleGiantErupt(undefined, 1.0),
    },
    {
      project: 'mystery-floor-hole' as const,
      name: 'Giant Rubber Duck Squeak-Honk',
      time: 'Mystery Hole (8.35s)',
      desc: 'Comically oversized double rubber-ducky squeak before the giant duck flattens the chair.',
      trigger: () => soundEngine.playGiantDuckSqueak(),
    },
    {
      project: 'mystery-floor-hole' as const,
      name: 'Living-Room Furniture Smash',
      time: 'Mystery Hole (9.25s / 14.5s)',
      desc: 'Splintering wood impact as the giant rubber duck and giant toy car wreck the chair and side table.',
      trigger: () => soundEngine.playFurnitureSmash(),
    },
    {
      project: 'mystery-floor-hole' as const,
      name: 'Mystery Portal Score (Part 1)',
      time: 'Mystery Hole (0.0s - 7.5s)',
      desc: 'Playful 132 BPM comedy mystery synth score with a suspense drop before the giant Stickman head reveal.',
      trigger: () => soundEngine.playMysteryHoleScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'super-bouncy-shoes' as const,
      name: 'Sneaker Silver Spring Boing',
      time: 'Bouncy Shoes (3.25s / 6.45s / 9.25s / 12.25s / 14.35s / 16.35s)',
      desc: 'Elastic upward pitch-sweep spring boing triggered each time the silver sneaker springs coil and snap open.',
      trigger: () => soundEngine.playSpringBoing(undefined, 1.15),
    },
    {
      project: 'super-bouncy-shoes' as const,
      name: 'Trampoline Rocket Launch Boing',
      time: 'Bouncy Shoes (19.65s)',
      desc: 'Massive dual trampoline + sneaker spring launch blast sending Stickman spinning sky-high.',
      trigger: () => soundEngine.playRocketLaunchBoing(),
    },
    {
      project: 'super-bouncy-shoes' as const,
      name: 'Pillow Pile Cushion Landing',
      time: 'Bouncy Shoes (8.8s / 24.3s)',
      desc: 'Soft bouncy thud as Stickman lands in the garden grass and later into the huge pile of pillows.',
      trigger: () => soundEngine.playCushionBounce(undefined, 0.9),
    },
    {
      project: 'super-bouncy-shoes' as const,
      name: 'Loose Spring Pop & Head Bonk',
      time: 'Bouncy Shoes (27.6s / 28.25s)',
      desc: 'Crisp metallic spring pop launching the discarded red sneaker onto Stickman’s head and knocking off his beanie.',
      trigger: () => soundEngine.playSpringPopOut(),
    },
    {
      project: 'super-bouncy-shoes' as const,
      name: 'Super Bouncy Comedy Score (Part 1)',
      time: 'Bouncy Shoes (0.0s - 7.5s)',
      desc: 'Upbeat 136 BPM pop cartoon synth score with brief silence windows for the final shoe bonk and angry glare.',
      trigger: () => soundEngine.playSuperBouncyScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'shadow-trickshot' as const,
      name: 'Shadow Kick & Catch Swoosh',
      time: 'Shadow Trickshot (8.2s / 14.75s / 15.4s / 24.15s)',
      desc: 'Magical shadow swoosh triggered when Stickman’s projected silhouette kicks, catches around the corner, or delivers the giant final shot.',
      trigger: () => soundEngine.playShadowWhoosh(undefined, 1.15),
    },
    {
      project: 'shadow-trickshot' as const,
      name: 'Spotlight Swivel Click & Flicker-Off',
      time: 'Shadow Trickshot (12.6s / 20.1s / 26.95s)',
      desc: 'Mechanical tripod swivel click and the electric bulb sputter blackout that vanishes the shadow right before the cup pops.',
      trigger: () => soundEngine.playSpotlightClick(undefined, false),
    },
    {
      project: 'shadow-trickshot' as const,
      name: 'White Cup Drop & Rattle',
      time: 'Shadow Trickshot (24.85s)',
      desc: 'Hollow ceramic cup drop & ring when the orange ball lands cleanly inside the target cup.',
      trigger: () => soundEngine.playCupDropClink(),
    },
    {
      project: 'shadow-trickshot' as const,
      name: 'Cup Pop-Out & Beanie Bonk',
      time: 'Shadow Trickshot (27.55s / 28.25s)',
      desc: 'Sudden spring pop ejecting the orange ball out of the cup straight onto Stickman’s head to knock his red beanie off.',
      trigger: () => soundEngine.playHeadBonk(),
    },
    {
      project: 'shadow-trickshot' as const,
      name: 'Spy Trickshot Comedy Score (Part 1)',
      time: 'Shadow Trickshot (0.0s - 7.5s)',
      desc: 'Playful 134 BPM spy-comedy synth score that cuts dead when the spotlight flickers out at 26.95s.',
      trigger: () => soundEngine.playShadowTrickshotScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'invisible-wall-challenge' as const,
      name: 'Invisible Glass Wall Ping',
      time: 'Invisible Wall (1.85s / 8.05s / 14.75s..24.1s)',
      desc: 'Crystalline glass forcefield ping + basketball bounce thud heard every time a hidden wall flashes glowing blue.',
      trigger: () => soundEngine.playInvisibleWallPing(undefined, 1.2),
    },
    {
      project: 'invisible-wall-challenge' as const,
      name: 'Trash Can & Rim Clank',
      time: 'Invisible Wall (8.95s / 16.65s / 24.7s)',
      desc: 'Metallic bin drop, near-miss hoop rim clink, and the final clean basketball net swish.',
      trigger: () => soundEngine.playSwish(),
    },
    {
      project: 'invisible-wall-challenge' as const,
      name: 'Glass Face-Slam Thud',
      time: 'Invisible Wall (26.85s)',
      desc: 'Heavy cartoon impact thud + glass shimmer when Stickman sprints face-first into the huge invisible wall.',
      trigger: () => soundEngine.playGlassFaceSlam(),
    },
    {
      project: 'invisible-wall-challenge' as const,
      name: 'Rubber-on-Glass Slide Squeak',
      time: 'Invisible Wall (27.35s)',
      desc: 'Descending squeak-squeak-squeak as Stickman slides slowly down the invisible glass wall.',
      trigger: () => soundEngine.playGlassSqueakSlide(),
    },
    {
      project: 'invisible-wall-challenge' as const,
      name: 'Invisible Wall Trickshot Score (Part 1)',
      time: 'Invisible Wall (0.0s - 7.5s)',
      desc: 'Energetic 136 BPM pop arcade score that cuts dead right before Stickman runs into the wall at 26.85s.',
      trigger: () => soundEngine.playInvisibleWallScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'ten-fan-trickshot' as const,
      name: 'Desk Fan Switch Click',
      time: '10-Fan Trickshot (1.75s / 7.55s / 14.1s / 26.25s)',
      desc: 'Crisp mechanical snap + motor spin-up hum as Stickman switches on fans or all 10 swivel toward him.',
      trigger: () => soundEngine.playFanSwitchClick(undefined, 1.2),
    },
    {
      project: 'ten-fan-trickshot' as const,
      name: 'Fan Tunnel Air Whoosh',
      time: '10-Fan Trickshot (1.9s / 8.35s / 14.55s..18.85s)',
      desc: 'Rising airy rush as the orange ping-pong ball whips through the desk fans and loops around the ceiling lamp.',
      trigger: () => soundEngine.playFanAirWhoosh(undefined, 1.25),
    },
    {
      project: 'ten-fan-trickshot' as const,
      name: 'Tiny Red Cup Drop Clink',
      time: '10-Fan Trickshot (24.45s / 28.15s)',
      desc: 'Crisp hollow cup drop clink when the ping-pong ball (and later Stickman’s red beanie) lands inside the cup.',
      trigger: () => soundEngine.playCupDropClink(),
    },
    {
      project: 'ten-fan-trickshot' as const,
      name: 'Giant 10-Fan Gust Blast',
      time: '10-Fan Trickshot (26.75s)',
      desc: 'Massive rushing windstorm roar + whistling beanie flight sweep as all 10 fans turn and blow Stickman backward.',
      trigger: () => soundEngine.playGiantFanGust(),
    },
    {
      project: 'ten-fan-trickshot' as const,
      name: '10-Fan Trickshot Comedy Score (Part 1)',
      time: '10-Fan Trickshot (0.0s - 7.5s)',
      desc: 'Peppy 138 BPM synth comedy score that cuts dead right as all 10 fans swivel toward Stickman at 26.15s.',
      trigger: () => soundEngine.playTenFanScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'hundred-ball-chain' as const,
      name: 'Domino Cascade Clack',
      time: '100-Ball Chain (2.95s..4.15s / 10.1s / 15.1s)',
      desc: 'Crisp rising wooden domino tip clacks as each row triggers the next stage of the Rube Goldberg machine.',
      trigger: () => soundEngine.playDominoClack(undefined, 1.15),
    },
    {
      project: 'hundred-ball-chain' as const,
      name: 'Spring Bumper Boing',
      time: '100-Ball Chain (6.55s / 12.9s / 14.55s / 20.65s)',
      desc: 'Bouncy metallic coil boing as the seesaw, spring bumpers, and launch kicker fling colorful balls.',
      trigger: () => soundEngine.playSpringBoing(undefined, 1.3),
    },
    {
      project: 'hundred-ball-chain' as const,
      name: 'Red Button & Ceiling Hoop Drop',
      time: '100-Ball Chain (24.35s)',
      desc: 'Bright target chime + hydraulic ceiling hoop deployment when the final shot slams the giant red button.',
      trigger: () => soundEngine.playChainButtonSlam(),
    },
    {
      project: 'hundred-ball-chain' as const,
      name: '100-Ball Avalanche Bury Rumble',
      time: '100-Ball Chain (26.95s)',
      desc: 'Roaring cascade of 100 colorful balls bursting out of the bottom chamber and burying Stickman up to his beanie.',
      trigger: () => soundEngine.playBallAvalancheRumble(),
    },
    {
      project: 'hundred-ball-chain' as const,
      name: '100-Ball Chain Comedy Score (Part 1)',
      time: '100-Ball Chain (0.0s - 7.5s)',
      desc: 'Upbeat 140 BPM arcade comedy score that cuts right before the 100-ball avalanche buries Stickman.',
      trigger: () => soundEngine.playHundredBallScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'longest-ruler-shot' as const,
      name: 'Ruler Flick Twang',
      time: 'Longest Ruler Shot (1.25s / 27.15s)',
      desc: 'Elastic springy plastic ruler twang—high-pitched for the tiny table flick and deep booming catapult for the giant ruler finale.',
      trigger: () => soundEngine.playRulerFlick(undefined, 0.72),
    },
    {
      project: 'longest-ruler-shot' as const,
      name: 'Giant Ruler Snap Click',
      time: 'Longest Ruler Shot (6.4s / 7.2s)',
      desc: 'Crisp interlocking snap click as Stickman locks three giant yellow rulers together onto hardcover book stacks.',
      trigger: () => soundEngine.playMechanicalClick(),
    },
    {
      project: 'longest-ruler-shot' as const,
      name: 'Garden Trampoline Rocket Boing',
      time: 'Longest Ruler Shot (21.25s)',
      desc: 'High-tension spring trampoline bounce launching the tiny orange ball skyward toward the backyard basketball hoop.',
      trigger: () => soundEngine.playSpringBoing(undefined, 1.15),
    },
    {
      project: 'longest-ruler-shot' as const,
      name: 'Ruler Collapse Dominoes & Catapult',
      time: 'Longest Ruler Shot (26.05s - 28.75s)',
      desc: 'Sequential collapsing ruler clacks followed by the giant catapult flick, net plop, and sad trombone sting.',
      trigger: () => soundEngine.playDominoClack(undefined, 0.9),
    },
    {
      project: 'longest-ruler-shot' as const,
      name: 'Longest Ruler Comedy Score (Part 1)',
      time: 'Longest Ruler Shot (0.0s - 7.5s)',
      desc: 'Bouncy 138 BPM synth comedy score that cuts dead at 26.85s right before the ruler ramp catapults Stickman into the hoop.',
      trigger: () => soundEngine.playLongestRulerScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'giant-slinky-trickshot' as const,
      name: 'Metallic Slinky Twang',
      time: 'Giant Slinky (1.65s / 2.95s / 8.8s / 18.0s / 26.0s)',
      desc: 'Shimmering metallic rainbow coil stretch, snap recoil, and mega-launcher release resonance.',
      trigger: () => soundEngine.playSlinkyTwang(undefined, 1.15),
    },
    {
      project: 'giant-slinky-trickshot' as const,
      name: 'Wall Bounce & Forehead Bonk',
      time: 'Giant Slinky (3.42s / 3.85s / 21.05s)',
      desc: 'Sharp living-room wall rebound followed by an orange ball bonk straight onto Stickman’s forehead.',
      trigger: () => soundEngine.playHeadBonk(),
    },
    {
      project: 'giant-slinky-trickshot' as const,
      name: 'Tiny Red Cup Swish Ding',
      time: 'Giant Slinky (24.25s)',
      desc: 'Bright celebratory target chime right as the orange ball drops cleanly inside the tiny red cup.',
      trigger: () => soundEngine.playConfidenceDing(),
    },
    {
      project: 'giant-slinky-trickshot' as const,
      name: 'Spring-Cage Bounce & Beanie Fly',
      time: 'Giant Slinky (26.55s - 28.75s)',
      desc: 'Heavy rainbow spring-cage pogo bounces accompanied by a beanie launch whoosh and sad trombone sting.',
      trigger: () => soundEngine.playSpringBoing(undefined, 1.1),
    },
    {
      project: 'giant-slinky-trickshot' as const,
      name: 'Giant Slinky Comedy Score (Part 1)',
      time: 'Giant Slinky (0.0s - 7.5s)',
      desc: 'Energetic 138 BPM Modern Pop synth comedy score that cuts dead at 26.0s right before the slinky cages Stickman.',
      trigger: () => soundEngine.playGiantSlinkyScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'impossible-keyhole-shot' as const,
      name: 'Brass Keyhole Rim Clink & Mirror Ping',
      time: 'Impossible Keyhole (9.35s / 16.95s / 18.65s)',
      desc: 'Crisp metallic keyhole rim miss followed by dual mirror reflection pings guiding the orange ball through the hole.',
      trigger: () => soundEngine.playRimClink(),
    },
    {
      project: 'impossible-keyhole-shot' as const,
      name: 'Keyhole Thread & Red Cup Ding',
      time: 'Impossible Keyhole (22.8s / 24.3s)',
      desc: 'Clean keyhole pass swish and bright target chime as the ball lands inside the red cup on the other side.',
      trigger: () => soundEngine.playConfidenceDing(),
    },
    {
      project: 'impossible-keyhole-shot' as const,
      name: 'Giant Door Slam & Beanie Through Keyhole',
      time: 'Impossible Keyhole (26.15s - 28.5s)',
      desc: 'Heavy wooden door swing slam that knocks Stickman backward and launches his red beanie through the keyhole.',
      trigger: () => soundEngine.playDoorSlam(),
    },
    {
      project: 'impossible-keyhole-shot' as const,
      name: 'Keyhole Trickshot Score (Part 1)',
      time: 'Impossible Keyhole (0.0s - 7.5s)',
      desc: 'Mischievous 134 BPM trickshot synth score that cuts dead right at 26.05s before the door slams Stickman.',
      trigger: () => soundEngine.playKeyholeScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'impossible-laser-maze' as const,
      name: 'Red Laser Barrier Deflect Zap',
      time: 'Impossible Laser Maze (2.75s)',
      desc: 'Sharp sci-fi sawtooth zap as the vertical red laser barrier deflects Stickman’s opening throw.',
      trigger: () => soundEngine.playLaserZap(),
    },
    {
      project: 'impossible-laser-maze' as const,
      name: 'Mirror Reflection Ping',
      time: 'Impossible Laser Maze (6.9s / 16.6s / 18.1s / 21.0s)',
      desc: 'Escalating crystalline glass mirror reflection pings as Stickman steers the lasers and bounces the ball.',
      trigger: () => soundEngine.playInvisibleWallPing(undefined, 1.25),
    },
    {
      project: 'impossible-laser-maze' as const,
      name: 'Hidden Switch & Red Laser Cage Alarm',
      time: 'Impossible Laser Maze (26.15s - 28.5s)',
      desc: 'Pedestal pressure-plate click followed by the vault laser-cage alarm and a final sad trombone sting.',
      trigger: () => soundEngine.playLaserCageAlarm(),
    },
    {
      project: 'impossible-laser-maze' as const,
      name: 'Laser Maze Spy-Heist Score (Part 1)',
      time: 'Impossible Laser Maze (0.0s - 7.5s)',
      desc: 'Tense 136 BPM spy-heist synth score that cuts silent at 26.15s right as the laser cage activates.',
      trigger: () => soundEngine.playLaserMazeScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'impossible-pinball-trickshot' as const,
      name: 'Pinball Plunger Twang',
      time: 'Impossible Pinball (2.35s / 7.45s / 13.2s)',
      desc: 'Spring-loaded mechanical lever recoil twang launching the silver ball up the arcade chute.',
      trigger: () => soundEngine.playPinballPlunger(),
    },
    {
      project: 'impossible-pinball-trickshot' as const,
      name: 'Red Bumper Solenoid Chime',
      time: 'Impossible Pinball (8.55s - 9.75s / 26.55s - 27.75s)',
      desc: 'Classic arcade bumper solenoid thump + dual bell ding on every ball and Stickman collision.',
      trigger: () => soundEngine.playPinballBumper(undefined, 1.15),
    },
    {
      project: 'impossible-pinball-trickshot' as const,
      name: 'Yellow Flipper Snap & WIN Fanfare',
      time: 'Impossible Pinball (18.42s / 24.15s)',
      desc: 'Punchy flipper solenoid snap and ascending 6-note arcade jackpot arpeggio when the ball hits the hole.',
      trigger: () => soundEngine.playPinballJackpot(),
    },
    {
      project: 'impossible-pinball-trickshot' as const,
      name: 'Arcade Pinball Score (Part 1)',
      time: 'Impossible Pinball (0.0s - 7.5s)',
      desc: 'High-energy 142 BPM arcade pinball score that cuts silent at 25.75s right as the machine launches Stickman.',
      trigger: () => soundEngine.playPinballScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'thousand-degree-hot-shot' as const,
      name: '1,000-Degree Ice Melt Sizzle',
      time: '1,000-Degree Hot Shot (2.1s / 8.45s / 15.55s)',
      desc: 'Crisp steam-and-sizzle noise burst as the glowing orange ball melts ice cubes, thin barriers, and the giant ice wall.',
      trigger: () => soundEngine.playHeatSizzle(),
    },
    {
      project: 'thousand-degree-hot-shot' as const,
      name: 'Spinning Metal Ring Chime',
      time: '1,000-Degree Hot Shot (12.65s - 14.45s)',
      desc: 'Escalating crystalline metallic chime as the superheated ball zips through three spinning metal rings.',
      trigger: () => soundEngine.playInvisibleWallPing(undefined, 1.2),
    },
    {
      project: 'thousand-degree-hot-shot' as const,
      name: 'Red-Hot Golden Cup Launch',
      time: '1,000-Degree Hot Shot (26.15s)',
      desc: 'Sharp metallic pressure pop and upward steam-rocket sweep launching the ball straight onto his beanie.',
      trigger: () => soundEngine.playHotCupLaunch(),
    },
    {
      project: 'thousand-degree-hot-shot' as const,
      name: 'Heat-Lab Action Score (Part 1)',
      time: '1,000-Degree Hot Shot (0.0s - 7.5s)',
      desc: 'Punchy 138 BPM synth score that cuts silent at 25.85s right as the golden cup overheats.',
      trigger: () => soundEngine.playHotShotScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'magnetic-maze-trickshot' as const,
      name: 'Electromagnetic Pull Hum',
      time: 'Magnetic Maze (1.95s / 6.95s - 20.65s)',
      desc: 'Wobbly cartoon electromagnetic shimmer as red and blue horseshoe magnets pull the silver ball through the maze and vertical wall.',
      trigger: () => soundEngine.playMagnetHum(undefined, 1.15),
    },
    {
      project: 'magnetic-maze-trickshot' as const,
      name: 'Silver Ball & Metal Chair Clank',
      time: 'Magnetic Maze (2.75s / 27.65s)',
      desc: 'Metallic impact ring when the silver ball snaps onto the magnet or when the giant metal chair slams onto Stickman.',
      trigger: () => soundEngine.playMetalClank(undefined, 0.85),
    },
    {
      project: 'magnetic-maze-trickshot' as const,
      name: 'All-Magnets Overload Surge',
      time: 'Magnetic Maze (25.8s)',
      desc: 'Escalating dual-oscillator electromagnetic surge when every magnet fires together and pulls all metal objects across the room.',
      trigger: () => soundEngine.playMagnetOverload(),
    },
    {
      project: 'magnetic-maze-trickshot' as const,
      name: 'Magnetic Maze Sci-Fi Score (Part 1)',
      time: 'Magnetic Maze (0.0s - 7.5s)',
      desc: 'Playful 136 BPM sci-fi comedy synth score that cuts silent at 25.75s right as the magnets overload.',
      trigger: () => soundEngine.playMagneticMazeScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'spiral-staircase-shot' as const,
      name: 'Spiral Step Roll Tick',
      time: 'Spiral Staircase (1.9s / 7.45s - 8.85s)',
      desc: 'Crisp wooden-and-steel step tick as the orange basketball accelerates down the curved spiral staircase.',
      trigger: () => soundEngine.playSpiralRollTick(undefined, 1.15),
    },
    {
      project: 'spiral-staircase-shot' as const,
      name: 'Rotating Platform Spring Boing',
      time: 'Spiral Staircase (14.35s - 16.25s)',
      desc: 'Ascending cartoon bounce as the basketball hops cleanly across all three spinning platforms.',
      trigger: () => soundEngine.playSpringBoing(undefined, 1.2),
    },
    {
      project: 'spiral-staircase-shot' as const,
      name: 'Carousel Staircase Motor Spin-Up',
      time: 'Spiral Staircase (25.8s)',
      desc: 'Whirring mechanical motor spin-up when the entire spiral staircase turns into a giant carousel.',
      trigger: () => soundEngine.playCarouselMotorSpin(),
    },
    {
      project: 'spiral-staircase-shot' as const,
      name: 'Spiral Staircase Arcade Score (Part 1)',
      time: 'Spiral Staircase (0.0s - 7.5s)',
      desc: 'Lively 138 BPM pop-arcade score that cuts silent at 25.8s right as the staircase begins spinning.',
      trigger: () => soundEngine.playSpiralStaircaseScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'giant-scissor-trickshot' as const,
      name: 'Giant Silver Scissor Snip',
      time: 'Giant Scissor (2.15s / 12.25s / 18.35s / 26.55s)',
      desc: 'Metallic double-blade steel snip with sharp latch snap when cutting hanging strings — and snagging his red beanie.',
      trigger: () => soundEngine.playScissorSnip(undefined, 1.05),
    },
    {
      project: 'giant-scissor-trickshot' as const,
      name: 'Domino Cascade & Seesaw Boing',
      time: 'Giant Scissor (13.15s / 14.1s - 15.1s / 20.35s)',
      desc: 'Seesaw bounce followed by five rising colorful domino clacks and a heavy spring-launcher rocket boing.',
      trigger: () => {
        soundEngine.playDominoClack(undefined, 1.0);
        setTimeout(() => soundEngine.playDominoClack(undefined, 1.15), 180);
        setTimeout(() => soundEngine.playSpringBoing(undefined, 1.3), 380);
      },
    },
    {
      project: 'giant-scissor-trickshot' as const,
      name: 'Loose String Snap Recoil',
      time: 'Giant Scissor (25.85s)',
      desc: 'Taut cyan string recoil twang & snap right before the mounted giant scissors swing shut onto his red beanie.',
      trigger: () => soundEngine.playStringSnap(),
    },
    {
      project: 'giant-scissor-trickshot' as const,
      name: 'Giant Scissor Comedy Score (Part 1)',
      time: 'Giant Scissor (0.0s - 7.5s)',
      desc: 'Energetic 136 BPM trickshot synth score that cuts silent at 25.8s right before the loose string snaps.',
      trigger: () => soundEngine.playGiantScissorScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'triple-gravity-trickshot' as const,
      name: 'Gravity Zone Directional Hum',
      time: 'Triple Gravity (2.35s / 8.35s / 14.85s - 21.85s)',
      desc: 'Shimmering sci-fi gravity field modulation whenever the basketball enters Blue (sideways), Purple (upward), or Green (downward).',
      trigger: () => soundEngine.playGravityHum(undefined, 1.2),
    },
    {
      project: 'triple-gravity-trickshot' as const,
      name: 'Floating Bounce Pad & Golden Swish',
      time: 'Triple Gravity (22.7s / 24.15s)',
      desc: 'Angled hover-platform spring rebound launching the ball cleanly into a crisp golden basketball hoop swish.',
      trigger: () => {
        soundEngine.playSpringBoing(undefined, 1.25);
        setTimeout(() => soundEngine.playSwish(), 500);
      },
    },
    {
      project: 'triple-gravity-trickshot' as const,
      name: 'All-3-Zones Overload Surge',
      time: 'Triple Gravity (25.8s)',
      desc: 'Three-voice harmonic overload surge as Blue, Purple, and Green gravity zones fire beneath Stickman at once.',
      trigger: () => soundEngine.playTripleGravityOverload(),
    },
    {
      project: 'triple-gravity-trickshot' as const,
      name: 'Triple Gravity Sci-Fi Score (Part 1)',
      time: 'Triple Gravity (0.0s - 7.5s)',
      desc: 'Bouncy 136 BPM sci-fi comedy synth score that cuts silent at 25.8s right as all three zones activate.',
      trigger: () => soundEngine.playTripleGravityScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'invisible-tube-trickshot' as const,
      name: 'Hollow Tube Suction Pop & Loop Whoosh',
      time: 'Invisible Tube (1.95s / 2.35s / 8.85s / 14.55s)',
      desc: 'Crisp pneumatic tube entry pop followed by resonant transparent-loop airflow whoosh as the orange ball zooms around bends.',
      trigger: () => {
        soundEngine.playTubeEnterPop();
        setTimeout(() => soundEngine.playAirTubeWhoosh(undefined, 1.25), 140);
      },
    },
    {
      project: 'invisible-tube-trickshot' as const,
      name: 'Air Pump Turbo Forward Blast',
      time: 'Invisible Tube (18.85s)',
      desc: 'Mechanical switch thump into pressurized cyan pneumatic turbo blast as the ball rockets through the ultimate tube track.',
      trigger: () => soundEngine.playAirPumpBlast(),
    },
    {
      project: 'invisible-tube-trickshot' as const,
      name: 'Air Pump Reverse Vacuum & Beanie Bonk',
      time: 'Invisible Tube (25.85s / 27.15s)',
      desc: 'Descending red <<< vacuum suction surge that pulls the ball backward through every tube to knock off Stickman’s red beanie.',
      trigger: () => {
        soundEngine.playAirPumpReverse();
        setTimeout(() => soundEngine.playHeadBonk(), 700);
      },
    },
    {
      project: 'invisible-tube-trickshot' as const,
      name: 'Invisible Tube Comedy Score (Part 1)',
      time: 'Invisible Tube (0.0s - 7.5s)',
      desc: 'Bouncy 136 BPM Modern Pop synth score that cuts silent at 25.8s right as the Air Pump flips into REVERSE.',
      trigger: () => soundEngine.playInvisibleTubeScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'giant-gear-trickshot' as const,
      name: 'Interlocking Gear Whir & Tooth Clink',
      time: 'Giant Gear (1.2s / 7.55s / 13.7s - 15.05s / 19.15s)',
      desc: 'Rhythmic metallic clockwork gear whirring paired with ascending steel tooth clinks as the silver ball transfers across gears.',
      trigger: () => {
        soundEngine.playGearWhir(undefined, 1.15);
        setTimeout(() => soundEngine.playGearToothClink(undefined, 1.25), 220);
      },
    },
    {
      project: 'giant-gear-trickshot' as const,
      name: 'Spring Launcher & Small Ramp Boing',
      time: 'Giant Gear (2.15s / 18.45s / 22.15s)',
      desc: 'Punchy red-coil spring launch and ramp bounce driving the silver ball through the metal ring toward the golden cup.',
      trigger: () => soundEngine.playSpringBoing(undefined, 1.28),
    },
    {
      project: 'giant-gear-trickshot' as const,
      name: 'Reverse Gear Clutch & Spring-Hat Snap',
      time: 'Giant Gear (25.8s / 27.55s / 28.25s)',
      desc: 'Heavy mechanical reverse clutch clank pulling the red beanie into the gears before snapping back onto his head like a giant spring.',
      trigger: () => {
        soundEngine.playGearReverse();
        setTimeout(() => soundEngine.playSpringBoing(undefined, 1.35), 680);
      },
    },
    {
      project: 'giant-gear-trickshot' as const,
      name: 'Giant Gear Clockwork Score (Part 1)',
      time: 'Giant Gear (0.0s - 7.5s)',
      desc: 'Upbeat 138 BPM clockwork-arcade synth score that cuts silent at 25.8s right before all six gears reverse direction.',
      trigger: () => soundEngine.playGiantGearScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'reverse-bowling-trickshot' as const,
      name: 'Wooden Lane Roll & Mirror Ricochet Ping',
      time: 'Reverse Bowling (2.85s / 7.55s / 15.1s / 16.05s)',
      desc: 'Warm wooden bowling alley lane rumble paired with crystalline mirror pings as the purple bowling ball bounces around the room.',
      trigger: () => {
        soundEngine.playBowlingRoll(undefined, 1.05);
        setTimeout(() => soundEngine.playMirrorPing(undefined, 1.15), 260);
      },
    },
    {
      project: 'reverse-bowling-trickshot' as const,
      name: 'Single Pin Knock vs. 10-Pin Backwards Strike',
      time: 'Reverse Bowling (10.15s / 22.45s)',
      desc: 'Cascading maple bowling pin crash knocking down all 10 red-striped pins in one perfect backwards strike.',
      trigger: () => soundEngine.playPinHit(undefined, 10),
    },
    {
      project: 'reverse-bowling-trickshot' as const,
      name: 'Reverse Ball Trip & Final Pin Head Bonk',
      time: 'Reverse Bowling (27.15s / 28.25s)',
      desc: 'Purple ball trips Stickman backward into the lane right before the final stray pin drops squarely onto his head.',
      trigger: () => {
        soundEngine.playHeadBonk();
        setTimeout(() => soundEngine.playPinHit(undefined, 1), 450);
      },
    },
    {
      project: 'reverse-bowling-trickshot' as const,
      name: 'Reverse Bowling Arcade Score (Part 1)',
      time: 'Reverse Bowling (0.0s - 7.5s)',
      desc: 'Bouncy 136 BPM bowling-alley comedy synth score that cuts silent at 25.8s right before the ball rolls back.',
      trigger: () => soundEngine.playReverseBowlingScoreSection(undefined, 0, 7.5),
    },
    {
      project: 'giant-yoyo-trickshot' as const,
      name: 'Giant Yo-Yo Whir & Forehead Bonk',
      time: 'Giant Yo-Yo (1.55s / 3.25s / 6.65s)',
      desc: 'Spinning red-and-blue yo-yo string whir paired with the cartoon forehead bonk when it whips back up.',
      trigger: () => {
        soundEngine.playYoyoWhir(undefined, 1.0);
        setTimeout(() => soundEngine.playHeadBonk(), 460);
      },
    },
    {
      project: 'giant-yoyo-trickshot' as const,
      name: 'Triple Spinning Hoop Chimes',
      time: 'Giant Yo-Yo (20.15s / 20.8s / 21.45s)',
      desc: 'Three ascending triangle-wave chimes as the spinning giant yo-yo slices cleanly through all three hoops.',
      trigger: () => {
        soundEngine.playHoopPassDing(undefined, 1.05);
        setTimeout(() => soundEngine.playHoopPassDing(undefined, 1.2), 180);
        setTimeout(() => soundEngine.playHoopPassDing(undefined, 1.38), 360);
      },
    },
    {
      project: 'giant-yoyo-trickshot' as const,
      name: 'Waist Recoil Snap & Floor Beanie Spin',
      time: 'Giant Yo-Yo (26.65s / 26.85s / 27.4s)',
      desc: 'Yo-yo whips back to wrap Stickman’s waist and yank him skyward while his red beanie spins like a top on the floor.',
      trigger: () => {
        soundEngine.playYoyoRecoilSnap();
        setTimeout(() => soundEngine.playYoyoWhir(undefined, 1.55), 500);
      },
    },
    {
      project: 'giant-yoyo-trickshot' as const,
      name: 'Giant Yo-Yo Arcade Score (Part 1)',
      time: 'Giant Yo-Yo (0.0s - 7.5s)',
      desc: 'Upbeat 138 BPM trickshot synth score that cuts silent at 25.75s right before the yo-yo recoils.',
      trigger: () => soundEngine.playGiantYoyoScoreSection(undefined, 0, 7.5),
    },
  ];
  const visibleEffects = soundEffects.filter((effect) => effect.project === config.activeProject);

  const testVoiceLine = (line: string) => {
    stopVoiceOver();
    speakVoiceOver(line, {
      rate: config.voiceRate,
      pitch: config.voicePitch,
      volume: config.voiceVolume,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {isPaperBall ? 'Sound Design Studio' : 'Sound & Voice Design Studio'}
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mt-1">
          {isGiantYoyo
            ? 'The Giant Yo-Yo Trickshot is a 30-second dialogue-free comedy short with a 138 BPM synth score, spinning yo-yo whirs, a forehead bonk, a cup rim miss clink, ascending triple-hoop chimes, a golden cup victory drop, a waist-wrap hoist snap, a floor-spinning beanie whir, and a sad trombone sting — all synthesized live via Web Audio.'
            : isReverseBowling
            ? 'The Reverse Bowling Trickshot is a 30-second dialogue-free comedy short with a 136 BPM synth score, wooden bowling lane roll rumbles, crystalline mirror ricochet pings, curved tunnel whooshes, spring ramp boings, a 10-pin backwards strike crash, a feet-trip thump, a final stray pin head knock, and a sad trombone sting — all synthesized live via Web Audio.'
            : isGiantGear
            ? 'The Giant Gear Trickshot is a 30-second dialogue-free clockwork comedy with a 138 BPM synth score, rhythmic interlocking metallic gear whirs, ascending tooth & metal-ring clinks, spring-launcher & ramp boings, a golden cup clink, a heavy reverse-gear clutch, a spring-hat snap, and a final sad trombone sting — all synthesized live via Web Audio.'
            : isInvisibleTube
            ? 'The Invisible Tube Trickshot is a 30-second dialogue-free comedy short with a 136 BPM synth score, hollow pneumatic tube entry pops, ascending loop & spiral whooshes, a pressurized Air Pump turbo blast, a red cup clink, a descending reverse-vacuum suction surge, a red-beanie bonk, and a final sad trombone sting — all synthesized live via Web Audio.'
            : isTripleGravity
            ? 'The Triple Gravity Trickshot is a 30-second dialogue-free sci-fi comedy with a 136 BPM synth score, directional gravity-zone hums, mechanical switch clicks, floating-platform spring boings, a golden hoop swish, a triple-zone overload surge, a ceiling thump, and a final sad trombone sting — all synthesized live via Web Audio.'
            : isGiantScissor
            ? 'The Giant Scissor Trickshot is a 30-second dialogue-free chain-reaction comedy with a 136 BPM synth score, metallic double-blade scissor snips, mechanical string setup clicks, seesaw & spring-launcher boings, rising domino clacks, a red cup victory ding, a loose string snap, and a final sad trombone sting — all synthesized live via Web Audio.'
            : isSpiralStaircase
            ? 'The Impossible Spiral Staircase Shot is a 30-second dialogue-free trickshot comedy with a 138 BPM arcade score, spiral step roll ticks, soft cushion crashes, rotating platform spring boings, circular hoop pings, a clean basketball swish, a carousel motor spin-up, and a final sad trombone sting — all synthesized live via Web Audio.'
            : isMagneticMaze
            ? 'The Magnetic Maze Trickshot is a 30-second dialogue-free physics comedy with a 136 BPM sci-fi synth score, electromagnetic attraction hums, metallic ball-snap and chair-slam clanks, a forehead bonk, an all-magnets overload surge, beanie zip whooshes, and a final sad trombone sting — all synthesized live via Web Audio.'
            : isHotShot
            ? 'The 1,000-Degree Hot Shot is a 30-second dialogue-free heat-lab comedy with a 138 BPM synth score, sizzling ice-melt steam bursts, a springboard boing, escalating spinning metal ring chimes, a narrow-hoop swish, a golden-cup overheat pop launch, frantic beanie pats, and a sad trombone sting — all synthesized live via Web Audio.'
            : isImpossiblePinball
            ? 'The Impossible Pinball Trickshot is a 30-second dialogue-free arcade comedy with a 142 BPM pinball score, spring plunger launches, escalating red bumper solenoid chimes, spinning-blade & sliding-platform pings, a yellow flipper snap, a bonus ring swish, a WIN jackpot arpeggio, a floor spring launch, and a sad trombone sting — all synthesized live via Web Audio.'
            : isImpossibleLaser
            ? 'The Impossible Laser Maze is a 30-second dialogue-free spy-vault comedy with a 136 BPM synth score, red laser barrier zaps, ascending glass mirror reflection pings, a golden-cup victory chime, a hidden pedestal switch click, a red laser-cage alarm, and a sad trombone sting — all synthesized live via Web Audio.'
            : isImpossibleKeyhole
            ? 'The Impossible Keyhole Shot is a 30-second dialogue-free doorway comedy with a 134 BPM synth score, forehead & wood-door thuds, brass keyhole rim clinks, dual mirror reflection pings, a keyhole pass swish, a heavy door slam, and a sad trombone sting — all synthesized live via Web Audio.'
            : isGiantSlinky
            ? 'The Giant Slinky Trickshot is a 30-second dialogue-free physics comedy with a 138 BPM Modern Pop synth score, shimmering metallic rainbow coil twangs, wall bounces, forehead & shoe thumps, 360-degree coil-loop whooshes, a tiny red-cup victory chime, heavy spring-cage bounces, and a sad trombone sting — all synthesized live via Web Audio.'
            : isLongestRuler
            ? "The World's Longest Ruler Shot is a 30-second dialogue-free trickshot comedy with a 138 BPM arcade synth score, crisp plastic ruler flicks, interlocking ruler snap clicks, hardcover book bounces, doorway air whooshes, a garden trampoline boing, a clean net swish, collapsing domino ruler clacks, a giant ruler catapult flick, and a final sad trombone sting — all synthesized live via Web Audio."
            : isHundredBall
            ? 'The 100-Ball Chain Reaction is a 30-second dialogue-free Rube Goldberg comedy with a 140 BPM arcade synth score, rising domino cascade clacks, seesaw & spring bumper boings, loop-de-loop whooshes, red button & ceiling-hoop deployment, net swish, roaring 100-ball avalanche rumble, and a final sad trombone sting — all synthesized live via Web Audio.'
            : isTenFan
            ? 'The 10-Fan Impossible Trickshot is a 30-second dialogue-free comedy short with a 138 BPM arcade synth score, mechanical fan switch clicks, escalating airflow whooshes across all 10 fans and ceiling lamp loop, studio wall bounce, tiny cup drop clinks, a massive 10-fan gale blast, and a final sad trombone sting — all synthesized live via Web Audio.'
            : isInvisibleWall
            ? 'The Invisible Wall Challenge is a 30-second dialogue-free basketball trickshot comedy with a procedural 136 BPM arcade synth score, escalating crystalline glass wall pings, trash can & rim clinks, a clean net swish, a heavy face-slam thud, descending glass slide squeaks, and a final sad trombone sting — all synthesized live via Web Audio.'
            : isShadowTrickshot
            ? 'The Impossible Shadow Trickshot is a 30-second dialogue-free spy-comedy with a procedural 134 BPM synth score, magical shadow kick swooshes, spotlight swivel clicks and bulb blackout flicker, corner-wall ball bonks, a white-cup drop clink, a sudden cup pop-out, a beanie head bonk, and a sad trombone sting — all synthesized live via Web Audio.'
            : isSuperBouncyShoes
            ? 'The Super Bouncy Shoes is a 30-second dialogue-free slapstick comedy with a procedural 136 BPM synth score, escalating silver-spring sneaker boings, a huge trampoline rocket launch, spinning mid-air whooshes, a soft pillow-pile cushion thud, a loose spring pop, a head bonk, and a final trombone sting — all synthesized live via Web Audio.'
            : isMysteryFloorHole
            ? 'The Mystery Hole in the Floor is a 30-second dialogue-free sci-fi comedy with a procedural 132 BPM synth score, descending portal bloops, oversized eruption booms, a giant rubber duck squeak-honk, living-room furniture crashes, purple surge charges, and a final trombone sting — all synthesized live via Web Audio.'
            : isRubberBandTrap
            ? 'The Giant Rubber Band Trap is a 30-second dialogue-free slapstick comedy with a procedural 134 BPM synth score, creaky rising elastic stretches, a splintering wooden post snap, booming rubber-band recoil twangs, puffy sofa & pillow cushion bounces, a crisp beanie-flick whip, and a final trombone sting — all synthesized live via Web Audio.'
            : isCloneDisaster
            ? 'The Clone Button Disaster is a 30-second dialogue-free cloning comedy with a procedural 136 BPM synth score, chunky CLONE/RESET button clicks, ascending clone-spawn flash pops, synchronized crowd jumps, a full-crowd vanish sweep, and a comedic shock scream sting — all synthesized live via Web Audio.'
            : isLivingTrafficLight
            ? 'The Living Traffic Light is a 30-second dialogue-free street comedy with a procedural 130 BPM synth score, electronic blink chirps, mechanical STOP-sign arm snaps, squeaky rolling wheels, a power-box blackout drop, a rising backup battery hum, and flashing crimson alarm blasts — all synthesized live via Web Audio.'
            : isInfiniteGiftBox
            ? 'The Infinite Gift Box is a 30-second dialogue-free living-room comedy with a procedural 134 BPM synth score, elastic golden ribbon pulls, escalating nested-box reveal pops, cardboard unfold/retract sweeps, doorway tug squeaks, a 100-box fountain eruption, a beanie-knocking head bonk, and a final trombone sting — all synthesized live via Web Audio.'
            : isSelfBuildingRobot
            ? 'The Self-Building Robot is a 30-second dialogue-free workshop comedy with a procedural 136 BPM synth score, futuristic blue laser scan sweeps, mechanical servo upgrade latches, low-battery warning beeps, an electric power-bank surge, tug-of-war squeaks, and a comedic trombone sting — all synthesized live via Web Audio.'
            : isCoinFlip
            ? 'The Angry Stickman vs. The Impossible Coin Flip is a 30-second one-room comedy with a fully procedural score: a smug showman strut, a mechanical engineering march, a rage tremolo that cuts dead on the final flick, a pinball ricochet, a tiny victory fanfare and a record scratch — plus the rim tings, the forehead bonk, the rubber-band launch, the glass splashes and the gold coin ring that ends the film. No external audio files.'
            : isDartShot
            ? 'The Angry Stickman vs. The Impossible Dart Shot is a 30-second one-room comedy with a fully procedural score: a smug pizzicato opening, a ticking measuring theme, a rage tremolo that cuts dead on the final throw, a tick-tock ricochet, a tiny victory fanfare and a record scratch — plus the cork thunks, book clatters, the rubber-band launch and the heavy board bonk that ends the film. No external audio files.'
            : isPingPong
            ? 'The Ping-Pong Revenge is a 30-second one-room comedy with a fully procedural score: a smug pizzicato opening, a ticking measuring theme, a rage tremolo that cuts dead on the table slam, a tick-tock ricochet, a tiny victory fanfare and a record scratch — plus the bonks, boings and the porcelain clink of the cup landing on his head. No external audio files.'
            : isTrickShot
            ? 'Angry Stickman: Trick-Shot Champion is a 60-second dialogue-free sports comedy with an original score that grows into a full epic for the championship shot: rim clanks, wall rebounds, a forehead bonk, a rolling snare build through the slow-motion rim spin, a swish and a roaring crowd - all synthesized live with no external audio files.'
            : isPop
            ? 'Max, Rex & Beep is a 58-second dialogue-free pop comedy with a full original score: an upbeat pop instrumental, crowd reactions, robot bleeps, a snapping hairbrush, a glamorous mic sparkle and a cushion boing - all synthesized in real time with no external audio files.'
            : isPart4
            ? 'Episode 4 is a dialogue-free Shorts comedy with a full procedural soundscape: a swish, a metal creak, a heavy hoop bonk, a runaway basketball barrage, a lucky trick shot, a championship fanfare, an imaginary crowd cheer and a final sad trombone — all synthesized in real time with no external audio files.'
            : isPart3
            ? 'Part 3 is a dialogue-free sports comedy with a full procedural soundscape: a book bonk, a marching walk, squeaky shoes, panting, rim rattles, a run of ball-to-face bonks, a net swish, a championship fanfare, an imaginary crowd cheer and a sad trombone — all synthesized in real time with no external audio files.'
            : isSequel
            ? 'Episode 2 is a dialogue-free sequel with a full procedural soundscape: dramatic rumble, cartoon bonks, calming chime, mechanical clicks, an over-powered launch, ricochets, victory fanfare, a crash, and a sad trombone — all synthesized in real time with no external audio files.'
            : isExtended
            ? 'The 30-second director’s cut is a dialogue-free film with a full procedural soundscape: whooshes, calculator beeps, training music, heartbeat, fanfare, crash, and sad trombone — all synthesized in real time with no external audio files.'
            : isPaperBall
            ? 'Paper Ball Ricochet is a dialogue-free film. Every cartoon sound effect is synthesized in real-time via the Web Audio API — no external audio files.'
            : 'Minimal, carefully synchronized cartoon sound effects and deadpan voice cues synthesized entirely in real-time via the Web Audio API. No external MP3 files required.'}
        </p>
      </div>

      {/* Voice-Over Synthesis Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPaperBall ? (
              <MicOff className="w-5 h-5 text-zinc-300" />
            ) : (
              <Mic className="w-5 h-5 text-zinc-300" />
            )}
            <h3 className="text-lg font-semibold text-white">
              {isTrickShot
                ? 'No Dialogue, Score Only'
                : isPop
                ? 'No Dialogue, But Seven Captions'
                : isPaperBall
                ? 'Dialogue-Free by Design'
                : 'Voice-Over Synthesizer'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {isTrickShot
              ? 'No Voice · No Text · Original Score'
              : isPop
              ? 'No Voice · Captions On Screen · Original Score'
              : isPaperBall
              ? 'No Voice · No Text · SFX Only'
              : 'Calm · Monotone · Deadpan'}
          </span>
        </div>

        {!isPaperBall && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cue 1 */}
          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">Opening Hook (0.0s – 2.0s)</span>
              <button
                onClick={() => testVoiceLine(config.customVO1)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-200 rounded-md transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Play Voice</span>
              </button>
            </div>
            <input
              type="text"
              value={config.customVO1}
              onChange={(e) => setConfig({ ...config, customVO1: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-white"
            />
            <p className="text-xs text-slate-500">
              Delivery: Neutral tone, slight documentary curiosity, no exaggerated emotion.
            </p>
          </div>

          {/* Cue 2 */}
          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">Punchline (8.0s – 9.5s)</span>
              <button
                onClick={() => testVoiceLine(config.customVO2)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-200 rounded-md transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Play Voice</span>
              </button>
            </div>
            <input
              type="text"
              value={config.customVO2}
              onChange={(e) => setConfig({ ...config, customVO2: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-white"
            />
            <p className="text-xs text-slate-500">
              Delivery: Completely serious, bureaucratic finality.
            </p>
          </div>
        </div>
        )}

        {isPaperBall && (
          <p className="text-sm text-slate-400">
            {isTrickShot
              ? 'This film has no spoken dialogue, no captions and no on-screen text. The score is an original pop instrumental that escalates into a cinematic epic during the championship shot, and every impact (rim clank, wall rebound, forehead bonk, swish, crowd) is procedural cartoon SFX.'
              : isPop
              ? 'This film has no spoken dialogue. The seven scene captions are burned into the picture, the score is an original upbeat pop instrumental, and every accent (crowd, robot bleeps, brush snap, mic sparkle, cushion boing) is procedural cartoon SFX.'
              : 'This film intentionally has no dialogue, captions, or on-screen text. Only the procedural cartoon SFX track is used.'}
          </p>
        )}

        {/* Sound mix and speech controls */}
        <div className={`grid grid-cols-1 gap-6 pt-2 border-t border-slate-800 ${isPaperBall ? '' : 'md:grid-cols-3'}`}>
          {!isPaperBall && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Speech Rate (Speed)</span>
              <span className="font-mono text-white">{config.voiceRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.2"
              step="0.02"
              value={config.voiceRate}
              onChange={(e) => setConfig({ ...config, voiceRate: parseFloat(e.target.value) })}
              className="w-full accent-white"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Slow & Dry</span>
              <span>Fast</span>
            </div>
          </div>
          )}

          {!isPaperBall && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Pitch (Monotone Depth)</span>
              <span className="font-mono text-white">{config.voicePitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.02"
              value={config.voicePitch}
              onChange={(e) => setConfig({ ...config, voicePitch: parseFloat(e.target.value) })}
              className="w-full accent-white"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Lower / Deadpan</span>
              <span>Higher</span>
            </div>
          </div>
          )}

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Master Sound Volume</span>
              <span className="font-mono text-white">{Math.round(config.voiceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.voiceVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                setConfig({ ...config, voiceVolume: vol });
                soundEngine.setVolume(vol);
              }}
              className="w-full accent-white"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Mute</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Procedural Sound Effects Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-zinc-300" />
            <h3 className="text-lg font-semibold text-white">Procedural Cartoon SFX Triggers</h3>
          </div>
          <span className="text-xs text-slate-400">Click to preview individual synchronized effects</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleEffects.map((sfx, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors"
            >
              <div>
                <div className="text-[11px] font-mono text-zinc-400">{sfx.time}</div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{sfx.name}</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{sfx.desc}</p>
              </div>
              <button
                onClick={sfx.trigger}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test FX</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};