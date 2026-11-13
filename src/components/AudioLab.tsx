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
  const isDiamondHeist = config.activeProject === 'diamond-heist';
  const isPancakeFlip = config.activeProject === 'pancake-flip';
  const isVendingMachine = config.activeProject === 'vending-machine';
  const isBiggestBalloon = config.activeProject === 'biggest-balloon';
  const isFindTheBall = config.activeProject === 'find-the-ball';
  const isAttempt247 = config.activeProject === 'attempt-247';
  const isArcadeClaw = config.activeProject === 'arcade-claw';
  const isDominoTrickshot = config.activeProject === 'domino-trickshot';
  const isBalloonPop = config.activeProject === 'balloon-pop-jackpot';
  const isCandyClaw = config.activeProject === 'candy-claw';
  const isPlateSpin = config.activeProject === 'plate-spin';
  const isThreeWallPingPong = config.activeProject === 'three-wall-ping-pong';
  const isCupInCup = config.activeProject === 'cup-in-cup';
  const isYoYoRevenge = config.activeProject === 'yo-yo-revenge';
  const isDesertIsland = config.activeProject === 'desert-island';
  const isShrinkingRemote = config.activeProject === 'shrinking-remote';
  const isMagicPaintbrush = config.activeProject === 'magic-paintbrush';
  const isGiantBalloonPrison = config.activeProject === 'giant-balloon-prison';
  const isPopUpTent = config.activeProject === 'pop-up-tent';
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
      project: 'arcade-claw' as const,
      name: 'One Coin, One Dream',
      time: 'Arcade Claw (1.55s - 3.75s)',
      desc: 'The flourish sparkle, the coin up, the slot click, the arcade chime, the button beep and punch, and the first claw motor rolling out.',
      trigger: () => {
        soundEngine.playMicSparkle();
        setTimeout(() => soundEngine.playCoinTing(), 600);
        setTimeout(() => soundEngine.playMechanicalClick(), 950);
        setTimeout(() => soundEngine.playArcadeChime(), 1120);
        setTimeout(() => soundEngine.playConfidenceDing(), 1650);
        setTimeout(() => soundEngine.playFloorThump(), 1800);
        setTimeout(() => soundEngine.playClawMotor(undefined, 1.4), 2200);
      },
    },
    {
      project: 'arcade-claw' as const,
      name: 'The Claw Betrays Him',
      time: 'Arcade Claw (5.1s - 9.05s)',
      desc: 'Grip, the lift strain, the claw opening at the last second, the sad trombone, the bear thud, the eye-twitch squeak and the low machine growl.',
      trigger: () => {
        soundEngine.playClawMotor(undefined, 0.7);
        setTimeout(() => soundEngine.playClawMotor(undefined, 1.3), 700);
        setTimeout(() => soundEngine.playSqueak(), 2020);
        setTimeout(() => soundEngine.playSadTrombone(), 2750);
        setTimeout(() => soundEngine.playFloorThump(), 3180);
        setTimeout(() => soundEngine.playSqueak(), 3500);
        setTimeout(() => soundEngine.playDramaticRumble(), 3950);
      },
    },
    {
      project: 'arcade-claw' as const,
      name: 'Building the Trickshot Rig',
      time: 'Arcade Claw (10.05s - 14.3s)',
      desc: 'The racing cabinet scooting twice, the ramp slam and tap, the bumper drag and stop, the two backstop drops and the ball set on the lip.',
      trigger: () => {
        soundEngine.playWallBounce();
        setTimeout(() => soundEngine.playWallBounce(), 550);
        setTimeout(() => soundEngine.playFloorThump(), 1450);
        setTimeout(() => soundEngine.playClipboardTap(), 1800);
        setTimeout(() => soundEngine.playWhoosh(), 2350);
        setTimeout(() => soundEngine.playFloorThump(), 2900);
        setTimeout(() => soundEngine.playDeskPlop(), 3100);
        setTimeout(() => soundEngine.playDeskPlop(), 3500);
        setTimeout(() => soundEngine.playHeadBonk(), 4250);
      },
    },
    {
      project: 'arcade-claw' as const,
      name: 'The Impossible Shot',
      time: 'Arcade Claw (15.0s - 19.62s)',
      desc: 'Launch, the bumper boing, the cabinet ricochet, two flight whooshes, the button slam, the confirm blip, power-on and the win jingle.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playWallBounce(), 570);
        setTimeout(() => soundEngine.playWallBounce(), 1070);
        setTimeout(() => soundEngine.playWhoosh(), 1870);
        setTimeout(() => soundEngine.playWhoosh(), 2870);
        setTimeout(() => soundEngine.playFloorThump(), 3620);
        setTimeout(() => soundEngine.playConfidenceDing(), 3950);
        setTimeout(() => soundEngine.playMechanicalClick(), 4420);
        setTimeout(() => soundEngine.playArcadeWinJingle(), 4620);
      },
    },
    {
      project: 'arcade-claw' as const,
      name: 'Winner, Winner',
      time: 'Arcade Claw (20.35s - 25.9s)',
      desc: 'The second claw motor, the grab and release, the chute deposit, the victory fanfare, the crowd cheer, the celebration hops and the prize-door rattle.',
      trigger: () => {
        soundEngine.playClawMotor(undefined, 1.4);
        setTimeout(() => soundEngine.playMechanicalClick(), 1650);
        setTimeout(() => soundEngine.playMechanicalClick(), 2230);
        setTimeout(() => soundEngine.playDeskPlop(), 2830);
        setTimeout(() => soundEngine.playVictoryFanfare(), 3100);
        setTimeout(() => soundEngine.playCrowdCheer(), 3430);
        setTimeout(() => soundEngine.playFootstep(), 4100);
        setTimeout(() => soundEngine.playFootstep(), 4350);
        setTimeout(() => soundEngine.playMechanicalClick(), 5250);
      },
    },
    {
      project: 'arcade-claw' as const,
      name: 'Malfunction & Plush Avalanche',
      time: 'Arcade Claw (26.0s - 29.55s)',
      desc: 'The alarm strobe, the plush avalanche pouring out of the prize door, a second alarm, the tiny coin ding and the freeze sting under the final frame.',
      trigger: () => {
        soundEngine.playArcadeAlarm();
        setTimeout(() => soundEngine.playPlushAvalanche(), 550);
        setTimeout(() => soundEngine.playArcadeAlarm(), 1150);
        setTimeout(() => soundEngine.playDramaticRumble(), 2200);
        setTimeout(() => soundEngine.playCoinTing(), 3150);
        setTimeout(() => soundEngine.playHeartbeat(), 3550);
      },
    },
    {
      project: 'diamond-heist' as const,
      name: 'Heist Intro & Diamond Reveal',
      time: 'Diamond Heist (1.0s - 2.5s)',
      desc: 'The sneaky pizzicato bed, the sparkling diamond chime, and the spoon draw from pocket.',
      trigger: () => {
        soundEngine.playHeistPizzicatoSection();
        setTimeout(() => soundEngine.playDiamondChime(), 1000);
        setTimeout(() => soundEngine.playSpoonDraw(), 2000);
      },
    },
    {
      project: 'diamond-heist' as const,
      name: 'Laser Alarm & Panic',
      time: 'Diamond Heist (6.5s - 9.0s)',
      desc: 'The laser zap, the blaring alarm siren, and the awkward cough when he freezes.',
      trigger: () => {
        soundEngine.playLaserZap();
        setTimeout(() => soundEngine.playAlarmSiren(undefined, 3.5), 50);
        setTimeout(() => soundEngine.playAwkwardCough(), 2000);
      },
    },
    {
      project: 'diamond-heist' as const,
      name: 'Rage Build & Idea',
      time: 'Diamond Heist (9.0s - 13.5s)',
      desc: 'The rage growl, bucket roll, tray clink, mop thud, record scratch, and idea ding.',
      trigger: () => {
        soundEngine.playDramaticRumble();
        setTimeout(() => soundEngine.playFloorThump(), 500);
        setTimeout(() => soundEngine.playMechanicalClick(), 1500);
        setTimeout(() => soundEngine.playFloorThump(), 2500);
        setTimeout(() => soundEngine.playRecordScratch(), 3000);
        setTimeout(() => soundEngine.playIdeaDing(), 4000);
      },
    },
    {
      project: 'diamond-heist' as const,
      name: 'The Impossible Shot',
      time: 'Diamond Heist (15.0s - 20.5s)',
      desc: 'Spoon flick whoosh, tray ping, wall boing, flight, button click, case open mechanical, success sting.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playTrayPing(), 500);
        setTimeout(() => soundEngine.playWallBoing(), 1200);
        setTimeout(() => soundEngine.playButtonClick(), 4500);
        setTimeout(() => soundEngine.playCaseOpen(), 4600);
        setTimeout(() => soundEngine.playConfidenceDing(), 5500);
      },
    },
    {
      project: 'diamond-heist' as const,
      name: 'Victory & Celebration',
      time: 'Diamond Heist (22.5s - 25.5s)',
      desc: 'Diamond scoop, alarms cut, angelic choir, victory fanfare, celebration steps.',
      trigger: () => {
        soundEngine.playScoop();
        setTimeout(() => soundEngine.playAngelicChoir(), 1500);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 2000);
        setTimeout(() => soundEngine.playFootstep(), 2500);
        setTimeout(() => soundEngine.playFootstep(), 2900);
      },
    },
    {
      project: 'diamond-heist' as const,
      name: 'The Trap & Freeze',
      time: 'Diamond Heist (26.5s - 29.5s)',
      desc: 'Glass clunk, camera shutter clicks, muffled scream, freeze sting.',
      trigger: () => {
        soundEngine.playGlassClunk();
        setTimeout(() => soundEngine.playCameraClick(), 1000);
        setTimeout(() => soundEngine.playCameraClick(), 1250);
        setTimeout(() => soundEngine.playCameraClick(), 1500);
        setTimeout(() => soundEngine.playCameraClick(), 1750);
        setTimeout(() => soundEngine.playCameraClick(), 2000);
        setTimeout(() => soundEngine.playCameraClick(), 2250);
        setTimeout(() => soundEngine.playMuffledScream(), 2500);
        setTimeout(() => soundEngine.playFreezeSting(), 3000);
      },
    },
    {
      project: 'pancake-flip' as const,
      name: 'The Hook & First Failure',
      time: 'Pancake Flip (0.0s - 4.0s)',
      desc: 'Dramatic whoosh, record-scratch freeze, pan swoosh, cartoon boing and the sticky ceiling splat.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playRecordScratch(), 900);
        setTimeout(() => soundEngine.playWhoosh(), 2600);
        setTimeout(() => soundEngine.playCartoonBoing(), 3100);
        setTimeout(() => soundEngine.playPancakeSplat(), 3600);
      },
    },
    {
      project: 'pancake-flip' as const,
      name: 'The Plan',
      time: 'Pancake Flip (7.2s - 8.2s)',
      desc: 'Lightbulb ding and the wooden clack of the cutting-board ramp landing on the cookbooks.',
      trigger: () => {
        soundEngine.playIdeaDing();
        setTimeout(() => soundEngine.playWoodClack(), 1000);
      },
    },
    {
      project: 'pancake-flip' as const,
      name: 'The Second Failure',
      time: 'Pancake Flip (11.3s - 12.3s)',
      desc: 'Pancake slides up the ramp, flops back into the pan, then the sad trombone.',
      trigger: () => {
        soundEngine.playPancakeSlide(undefined, 0.6);
        setTimeout(() => soundEngine.playFloorThump(), 700);
        setTimeout(() => soundEngine.playSadTrombone(), 1000);
      },
    },
    {
      project: 'pancake-flip' as const,
      name: 'The Perfect Landing',
      time: 'Pancake Flip (13.3s - 18.4s)',
      desc: 'Knuckle crack, deep breath, launch whoosh, ramp slide, sparkle and the satisfying plate clink.',
      trigger: () => {
        soundEngine.playKnuckleCrack();
        setTimeout(() => soundEngine.playDeepBreath(), 500);
        setTimeout(() => soundEngine.playWhoosh(), 1200);
        setTimeout(() => soundEngine.playPancakeSlide(undefined, 0.8), 1400);
        setTimeout(() => soundEngine.playMicSparkle(), 4900);
        setTimeout(() => soundEngine.playPlateClink(), 5100);
      },
    },
    {
      project: 'pancake-flip' as const,
      name: 'Champion Celebration',
      time: 'Pancake Flip (19.8s - 21.0s)',
      desc: 'Victory fanfare, confetti pop and the short crowd cheer.',
      trigger: () => {
        soundEngine.playVictoryFanfareShort();
        setTimeout(() => soundEngine.playConfettiPop(), 800);
        setTimeout(() => soundEngine.playCrowdCheer(), 1200);
      },
    },
    {
      project: 'pancake-flip' as const,
      name: 'Pancake Revenge & Final Gag',
      time: 'Pancake Flip (23.4s - 29.1s)',
      desc: 'Counter bump, wet face splat, slow sticky slide, angry sting and the tiny sad trombone.',
      trigger: () => {
        soundEngine.playCounterBump();
        setTimeout(() => soundEngine.playWetSplat(), 1400);
        setTimeout(() => soundEngine.playPancakeSlide(undefined, 1.6), 2000);
        setTimeout(() => soundEngine.playAngrySting(), 4000);
        setTimeout(() => soundEngine.playSadTrombone(), 5700);
      },
    },
    {
      project: 'vending-machine' as const,
      name: 'The Hook & The Shake',
      time: 'Vending Machine (0.0s - 4.8s)',
      desc: 'Dramatic whoosh, record-scratch freeze, machine rattle, cartoon boing and a second record scratch.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playRecordScratch(), 900);
        setTimeout(() => soundEngine.playVendingRattle(undefined, 1.7), 2600);
        setTimeout(() => soundEngine.playCartoonBoing(), 4300);
        setTimeout(() => soundEngine.playRecordScratch(), 4800);
      },
    },
    {
      project: 'vending-machine' as const,
      name: 'The Second Coin',
      time: 'Vending Machine (7.7s - 9.0s)',
      desc: 'Coin clink, spiral whirr, heavy thud as the orange bag drops, then the disbelief scratch.',
      trigger: () => {
        soundEngine.playCoinClink();
        setTimeout(() => soundEngine.playSpiralWhirr(), 100);
        setTimeout(() => soundEngine.playVendingThud(), 800);
        setTimeout(() => soundEngine.playRecordScratch(), 1300);
      },
    },
    {
      project: 'vending-machine' as const,
      name: 'The Broom',
      time: 'Vending Machine (10.8s - 13.4s)',
      desc: 'Lightbulb ding, broom scrape, strained tug and the sad trombone note.',
      trigger: () => {
        soundEngine.playIdeaDing();
        setTimeout(() => soundEngine.playBroomScrape(), 800);
        setTimeout(() => soundEngine.playStrainedTug(), 1800);
        setTimeout(() => soundEngine.playSadTrombone(), 2600);
      },
    },
    {
      project: 'vending-machine' as const,
      name: 'The Flying Kick',
      time: 'Vending Machine (14.9s - 18.35s)',
      desc: 'Three footsteps, a rising whistle and the huge cartoon impact.',
      trigger: () => {
        soundEngine.playFootstep();
        setTimeout(() => soundEngine.playFootstep(), 300);
        setTimeout(() => soundEngine.playFootstep(), 600);
        setTimeout(() => soundEngine.playRisingWhistle(undefined, 2.2), 1100);
        setTimeout(() => soundEngine.playBigImpact(), 3450);
      },
    },
    {
      project: 'vending-machine' as const,
      name: 'The Celebration',
      time: 'Vending Machine (19.3s - 21.5s)',
      desc: 'Double thud, victory fanfare, confetti pop and the short crowd cheer.',
      trigger: () => {
        soundEngine.playVendingThud();
        setTimeout(() => soundEngine.playVendingThud(), 180);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 500);
        setTimeout(() => soundEngine.playConfettiPop(), 1900);
        setTimeout(() => soundEngine.playCrowdCheer(), 2200);
      },
    },
    {
      project: 'vending-machine' as const,
      name: 'The Punchline & End Frame',
      time: 'Vending Machine (23.5s - 29.1s)',
      desc: 'Bag rip, big air puff, one tiny chip tink, angry sting and the tiny sad trombone.',
      trigger: () => {
        soundEngine.playBagRip();
        setTimeout(() => soundEngine.playAirPuff(), 700);
        setTimeout(() => soundEngine.playTinyChipTink(), 3200);
        setTimeout(() => soundEngine.playAngrySting(), 4100);
        setTimeout(() => soundEngine.playSadTrombone(), 5600);
      },
    },
    {
      project: 'biggest-balloon' as const,
      name: 'The Hook & Size: Medium',
      time: 'Biggest Balloon (0.0s - 4.6s)',
      desc: 'Dramatic whoosh, record-scratch freeze, deep inhale, rubber inflate squeaks and the cheerful chime.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playRecordScratch(), 900);
        setTimeout(() => soundEngine.playDeepBreath(), 2150);
        setTimeout(() => soundEngine.playBalloonSqueak(0.9), 2800);
        setTimeout(() => soundEngine.playBalloonSqueak(1.1), 3250);
        setTimeout(() => soundEngine.playBalloonSqueak(1.2), 4100);
        setTimeout(() => soundEngine.playCalmingChime(), 4600);
      },
    },
    {
      project: 'biggest-balloon' as const,
      name: 'The Fake-Out',
      time: 'Biggest Balloon (6.3s - 9.4s)',
      desc: 'Stretch creaks, the tense drum roll, the held breath (score drop) and the relieved sigh.',
      trigger: () => {
        soundEngine.playBalloonStretch();
        setTimeout(() => soundEngine.playBalloonStretch(), 800);
        setTimeout(() => soundEngine.playDramaticRumble(), 1200);
        setTimeout(() => soundEngine.playRelievedSigh(), 3100);
      },
    },
    {
      project: 'biggest-balloon' as const,
      name: 'Size: Giant',
      time: 'Biggest Balloon (10.3s - 12.8s)',
      desc: 'Final big inflates, the knot snap and the proud fanfare note.',
      trigger: () => {
        soundEngine.playBalloonStretch();
        setTimeout(() => soundEngine.playBalloonStretch(), 700);
        setTimeout(() => soundEngine.playKnotSnap(), 1900);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 2500);
      },
    },
    {
      project: 'biggest-balloon' as const,
      name: 'Uh Oh & This Is Fine',
      time: 'Biggest Balloon (14.2s - 21.8s)',
      desc: 'Wind gust, rising whistle, record scratch, calm chime and the dramatic sting as the pine enters.',
      trigger: () => {
        soundEngine.playWindGust(undefined, 1.6);
        setTimeout(() => soundEngine.playRisingWhistle(undefined, 1.4), 800);
        setTimeout(() => soundEngine.playRecordScratch(), 2200);
        setTimeout(() => soundEngine.playCalmingChime(), 4200);
        setTimeout(() => soundEngine.playWindGust(undefined, 1.8), 5400);
        setTimeout(() => soundEngine.playFreezeSting(), 7600);
      },
    },
    {
      project: 'biggest-balloon' as const,
      name: 'The Anti-Pop & End Frame',
      time: 'Biggest Balloon (22.2s - 28.6s)',
      desc: 'Spot whoosh, needle-poke psst, the long raspberry air release, whirling swoosh, cartoon boing and the tiny sad trombone with a final squeak.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playNeedlePoke(), 1100);
        setTimeout(() => soundEngine.playAirRelease(undefined, 2.9), 1300);
        setTimeout(() => soundEngine.playWhoosh(), 2200);
        setTimeout(() => soundEngine.playCartoonBoing(), 3200);
        setTimeout(() => soundEngine.playSadTrombone(), 5200);
        setTimeout(() => soundEngine.playBalloonSqueak(1.5), 6400);
      },
    },
    {
      project: 'find-the-ball' as const,
      name: 'The Hook & Setup',
      time: 'Find the Ball (0.0s - 4.6s)',
      desc: 'Dramatic whoosh, record-scratch freeze, magic sparkles, the teal cup lift and the cup clunk as the ball is covered.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playRecordScratch(), 900);
        setTimeout(() => soundEngine.playMagicSparkle(), 950);
        setTimeout(() => soundEngine.playCupClunk(), 2500);
        setTimeout(() => soundEngine.playMagicSparkle(), 3050);
        setTimeout(() => soundEngine.playCupClunk(), 4000);
        setTimeout(() => soundEngine.playMagicSparkle(), 4150);
      },
    },
    {
      project: 'find-the-ball' as const,
      name: 'The Slow & Fast Shuffle',
      time: 'Find the Ball (6.4s - 12.9s)',
      desc: 'Two long cup slides, four fast cup slides and the very quiet ball roll as the ball escapes off the left edge.',
      trigger: () => {
        soundEngine.playCupSlide(undefined, 0.85);
        setTimeout(() => soundEngine.playCupSlide(undefined, 0.85), 1300);
        setTimeout(() => soundEngine.playCupSlide(undefined, 0.5), 3900);
        setTimeout(() => soundEngine.playCupSlide(undefined, 0.5), 4600);
        setTimeout(() => soundEngine.playCupSlide(undefined, 0.5), 5300);
        setTimeout(() => soundEngine.playCupSlide(undefined, 0.5), 6000);
        setTimeout(() => soundEngine.playBallRoll(undefined, 1.6), 5020);
        setTimeout(() => soundEngine.playMagicSparkle(), 6550);
      },
    },
    {
      project: 'find-the-ball' as const,
      name: 'Pick a Cup',
      time: 'Find the Ball (15.0s - 18.2s)',
      desc: 'The table slap, the drum roll and the three rising countdown beeps.',
      trigger: () => {
        soundEngine.playVendingThud();
        setTimeout(() => soundEngine.playDrumRoll(undefined, 3.2), 350);
        setTimeout(() => soundEngine.playCountBeep(undefined, 1.0), 1600);
        setTimeout(() => soundEngine.playCountBeep(undefined, 1.12), 2400);
        setTimeout(() => soundEngine.playCountBeep(undefined, 1.26), 3200);
      },
    },
    {
      project: 'find-the-ball' as const,
      name: 'The Empty Cups',
      time: 'Find the Ball (19.0s - 22.5s)',
      desc: 'Two empty cup lifts, the wah-wah trombone and the record scratch before the last cup comes up.',
      trigger: () => {
        soundEngine.playCupClunk();
        setTimeout(() => soundEngine.playCupClunk(), 850);
        setTimeout(() => soundEngine.playCupClunk(), 1300);
        setTimeout(() => soundEngine.playSadTrombone(), 1850);
        setTimeout(() => soundEngine.playCupClunk(), 2250);
        setTimeout(() => soundEngine.playRecordScratch(), 2550);
        setTimeout(() => soundEngine.playCupClunk(), 3050);
      },
    },
    {
      project: 'find-the-ball' as const,
      name: 'The Escape & End Frame',
      time: 'Find the Ball (22.5s - 27.4s)',
      desc: 'Record scratch, frantic cup re-flips, the tiny ball roll, the angry sting and the tiny sad trombone.',
      trigger: () => {
        soundEngine.playRecordScratch();
        setTimeout(() => soundEngine.playCupClunk(), 750);
        setTimeout(() => soundEngine.playCupClunk(), 1200);
        setTimeout(() => soundEngine.playCupClunk(), 1550);
        setTimeout(() => soundEngine.playBallRoll(undefined, 0.6), 2450);
        setTimeout(() => soundEngine.playAngrySting(), 3300);
        setTimeout(() => soundEngine.playSadTrombone(), 4900);
      },
    },
    {
      project: 'attempt-247' as const,
      name: 'The Hook & The Easy Shot',
      time: 'Attempt 247 (0.0s - 6.0s)',
      desc: 'Whoosh on the easy rim-out, rim clank, soft thud, tiny wah, whoosh on the release.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playRimClink(), 3660);
        setTimeout(() => soundEngine.playPaperSlap(), 4330);
        setTimeout(() => soundEngine.playSadTrombone(), 4600);
      },
    },
    {
      project: 'attempt-247' as const,
      name: 'The Doorway Shot',
      time: 'Attempt 247 (6.0s - 10.0s)',
      desc: 'Throw whoosh, fan tink, boing, record scratch on the beanie landing.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playFanTink(), 8420);
        setTimeout(() => soundEngine.playPaperSlap(), 8930);
        setTimeout(() => soundEngine.playCartoonBoing(), 8960);
        setTimeout(() => soundEngine.playRecordScratch(), 9640);
      },
    },
    {
      project: 'attempt-247' as const,
      name: 'The No-Look Shot',
      time: 'Attempt 247 (10.0s - 14.0s)',
      desc: 'Laid-back score note, whoosh, window knock, floor thud, record scratch.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playWindowKnock(), 11320);
        setTimeout(() => soundEngine.playPaperSlap(), 12060);
        setTimeout(() => soundEngine.playRecordScratch(), 13150);
      },
    },
    {
      project: 'attempt-247' as const,
      name: 'The Plan',
      time: 'Attempt 247 (14.0s - 18.0s)',
      desc: 'Lightbulb ding, sparkle, paper crumple, knuckle crack.',
      trigger: () => {
        soundEngine.playIdeaDing();
        setTimeout(() => soundEngine.playMagicSparkle(), 14060);
        setTimeout(() => soundEngine.playPaperCrumple(), 15200);
        setTimeout(() => soundEngine.playKnuckleCrack(), 17000);
      },
    },
    {
      project: 'attempt-247' as const,
      name: 'The Impossible Shot',
      time: 'Attempt 247 (18.0s - 22.0s)',
      desc: 'Launch whoosh, wall bounce, ceiling bounce, rim clink, drum roll, countdown beeps, held breath.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playWallBounce(), 19000);
        setTimeout(() => soundEngine.playPaperSlap(), 19500);
        setTimeout(() => soundEngine.playRimClink(), 20150);
        setTimeout(() => soundEngine.playDrumRoll(undefined, 1.55), 20170);
        setTimeout(() => soundEngine.playCountBeep(undefined, 1.0), 20300);
        setTimeout(() => soundEngine.playCountBeep(undefined, 1.12), 20770);
        setTimeout(() => soundEngine.playCountBeep(undefined, 1.26), 21240);
        setTimeout(() => soundEngine.playHeartbeat(), 21620);
      },
    },
    {
      project: 'attempt-247' as const,
      name: 'The Win & Reveal',
      time: 'Attempt 247 (22.0s - 27.0s)',
      desc: 'Bin thunk, freeze sting, confetti pop, crowd cheer, record scratch, angry sting.',
      trigger: () => {
        soundEngine.playBinThunk();
        setTimeout(() => soundEngine.playFreezeSting(), 22400);
        setTimeout(() => soundEngine.playConfettiPop(), 23120);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 23150);
        setTimeout(() => soundEngine.playCrowdCheer(), 23180);
        setTimeout(() => soundEngine.playRecordScratch(), 24150);
        setTimeout(() => soundEngine.playAngrySting(), 25800);
      },
    },
    {
      project: 'attempt-247' as const,
      name: 'The End Frame',
      time: 'Attempt 247 (27.0s - 30.0s)',
      desc: 'Paper crumple on fresh ball, sad trombone, short silence.',
      trigger: () => {
        soundEngine.playPaperCrumple();
        setTimeout(() => soundEngine.playSadTrombone(), 27450);
      },
    },
    {
      project: 'needle-thread' as const,
      name: 'The Hook & First Failures',
      time: 'Needle Thread (0.0s - 7.0s)',
      desc: 'Pull-back whoosh, needle ding, thread flick, comedic sting, rubbery boings, angry stomp.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playCoinTing(), 500);
        setTimeout(() => soundEngine.playSqueak(), 1700);
        setTimeout(() => soundEngine.playFreezeSting(), 2400);
        setTimeout(() => soundEngine.playCartoonBoing(), 3850);
        setTimeout(() => soundEngine.playSqueak(), 5050);
        setTimeout(() => soundEngine.playCartoonBoing(), 5650);
        setTimeout(() => soundEngine.playFloorThump(), 6500);
      },
    },
    {
      project: 'needle-thread' as const,
      name: 'The Magnifying Glass',
      time: 'Needle Thread (7.0s - 12.0s)',
      desc: 'Lightbulb ding, sparkle, raise whoosh, outside-catch squeak, miss squeak, descending slide whistle.',
      trigger: () => {
        soundEngine.playIdeaDing();
        setTimeout(() => soundEngine.playMagicSparkle(), 70);
        setTimeout(() => soundEngine.playWhoosh(), 950);
        setTimeout(() => soundEngine.playArmCrossSqueak(), 2300);
        setTimeout(() => soundEngine.playSqueak(), 3500);
        setTimeout(() => soundEngine.playSlideWhistle(), 3800);
      },
    },
    {
      project: 'needle-thread' as const,
      name: 'The Ridiculous Machine',
      time: 'Needle Thread (12.0s - 18.0s)',
      desc: 'Mounting clacks and clicks, proud ding, lever clunk, spring launch, thread whip, fabric squeak, record scratch.',
      trigger: () => {
        soundEngine.playWoodClack();
        setTimeout(() => soundEngine.playWoodClack(), 350);
        setTimeout(() => soundEngine.playMechanicalClick(), 700);
        setTimeout(() => soundEngine.playWoodClack(), 1050);
        setTimeout(() => soundEngine.playMechanicalClick(), 1400);
        setTimeout(() => soundEngine.playMechanicalClick(), 1680);
        setTimeout(() => soundEngine.playConfidenceDing(), 2200);
        setTimeout(() => soundEngine.playMechanicalClick(), 3650);
        setTimeout(() => soundEngine.playWoodClack(), 3700);
        setTimeout(() => soundEngine.playLauncherFire(), 4030);
        setTimeout(() => soundEngine.playWhoosh(), 4300);
        setTimeout(() => soundEngine.playBalloonStretch(), 4720);
        setTimeout(() => soundEngine.playRecordScratch(), 5050);
      },
    },
    {
      project: 'needle-thread' as const,
      name: 'One Last Try',
      time: 'Needle Thread (18.0s - 24.0s)',
      desc: 'Deep breath, quiet heartbeats, fake-out squeak, the threading pass, sparkle, victory fanfare.',
      trigger: () => {
        soundEngine.playDeepBreath();
        setTimeout(() => soundEngine.playHeartbeat(), 350);
        setTimeout(() => soundEngine.playHeartbeat(), 1150);
        setTimeout(() => soundEngine.playHeartbeat(), 1950);
        setTimeout(() => soundEngine.playHeartbeat(), 2750);
        setTimeout(() => soundEngine.playSqueak(), 3070);
        setTimeout(() => soundEngine.playHeartbeat(), 3350);
        setTimeout(() => soundEngine.playNeedlePoke(), 3730);
        setTimeout(() => soundEngine.playMagicSparkle(), 4100);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 4700);
      },
    },
    {
      project: 'needle-thread' as const,
      name: 'The Final Twist',
      time: 'Needle Thread (24.0s - 30.0s)',
      desc: 'Fanfare cut by record scratch, fabric tug, stretch squeak, pop-off impact, short silence, angry sting.',
      trigger: () => {
        soundEngine.playRecordScratch();
        setTimeout(() => soundEngine.playStrainedTug(), 1050);
        setTimeout(() => soundEngine.playBalloonStretch(), 2400);
        setTimeout(() => soundEngine.playBigImpact(), 3080);
        setTimeout(() => soundEngine.playAngrySting(), 4650);
      },
    },
    // Domino Trickshot Effects
    {
      project: 'domino-trickshot' as const,
      name: 'The Challenge',
      time: 'Domino Trickshot (0.0s - 4.0s)',
      desc: 'Dramatic boom, ticking countdown, confident chime.',
      trigger: () => {
        soundEngine.playDramaticBoom();
        soundEngine.playTickingCountdown(undefined, 3.0);
        setTimeout(() => soundEngine.playConfidenceDing(), 2000);
      },
    },
    {
      project: 'domino-trickshot' as const,
      name: 'First Failure',
      time: 'Domino Trickshot (4.5s - 8.0s)',
      desc: 'Soft flick, ball roll, tiny plop, sad trombone.',
      trigger: () => {
        soundEngine.playSoftFlick();
        soundEngine.playBallRoll(undefined, 1.5);
        setTimeout(() => soundEngine.playTinyPlop(), 1600);
        setTimeout(() => soundEngine.playSadTrombone(), 2000);
      },
    },
    {
      project: 'domino-trickshot' as const,
      name: 'Total Disaster',
      time: 'Domino Trickshot (8.5s - 14.0s)',
      desc: 'Hard flick, rapid domino clatter, cartoon crash, frustrated stomp.',
      trigger: () => {
        soundEngine.playHardFlick();
        soundEngine.playDominoClatter(undefined, 3.0);
        setTimeout(() => soundEngine.playCartoonCrash(), 3800);
        setTimeout(() => soundEngine.playFloorThump(), 4800);
      },
    },
    {
      project: 'domino-trickshot' as const,
      name: 'The Perfect Chain',
      time: 'Domino Trickshot (14.0s - 20.0s)',
      desc: 'Deep breath, precise tap, 20 rhythmic domino clicks, rising music swell, red ball roll.',
      trigger: () => {
        soundEngine.playDeepBreath();
        setTimeout(() => soundEngine.playPreciseTap(), 1100);
        // 20 domino clicks at ~0.15s intervals
        for (let i = 0; i < 20; i++) {
          setTimeout(() => soundEngine.playDominoClick(), 1250 + i * 150);
        }
        setTimeout(() => soundEngine.playRisingMusicSwelling(), 1250);
        setTimeout(() => soundEngine.playBallRoll(undefined, 1.0), 4750);
      },
    },
    {
      project: 'domino-trickshot' as const,
      name: 'Impossible Success',
      time: 'Domino Trickshot (20.0s - 25.0s)',
      desc: 'Satisfying cup ping, victory fanfare, crowd cheer, victory hops, cup wobble creak.',
      trigger: () => {
        soundEngine.playCupPing();
        setTimeout(() => soundEngine.playVictoryFanfare(), 300);
        setTimeout(() => soundEngine.playCrowdCheer(), 800);
        setTimeout(() => soundEngine.playFloorThump(), 1800);
        setTimeout(() => soundEngine.playFloorThump(), 2800);
        setTimeout(() => soundEngine.playCupWobbleCreak(), 3800);
      },
    },
    {
      project: 'domino-trickshot' as const,
      name: 'The Twist',
      time: 'Domino Trickshot (25.0s - 30.0s)',
      desc: 'Final cup wobble, hollow bonk, record scratch, angry sting.',
      trigger: () => {
        soundEngine.playCupWobbleCreak();
        setTimeout(() => soundEngine.playHollowBonk(), 500);
        setTimeout(() => soundEngine.playRecordScratch(), 800);
        setTimeout(() => soundEngine.playAngrySting(), 4000);
      },
    },
    // Balloon Pop Jackpot Effects
    {
      project: 'balloon-pop-jackpot' as const,
      name: 'Carnival Booth',
      time: 'Balloon Pop Jackpot (0.0s - 0.6s)',
      desc: 'Booth light shimmer and a confident chime as he points at the trophy.',
      trigger: () => {
        soundEngine.playBoothLights();
        setTimeout(() => soundEngine.playConfidenceDing(), 1400);
      },
    },
    {
      project: 'balloon-pop-jackpot' as const,
      name: 'Three Terrible Darts',
      time: 'Balloon Pop Jackpot (6.5s - 11.0s)',
      desc: 'Dart whooshes, a wooden thunk, a floor thunk, a balloon wobble squeak, then an angry sting.',
      trigger: () => {
        soundEngine.playDartWhoosh();
        setTimeout(() => soundEngine.playDartThunkWood(), 450);
        setTimeout(() => soundEngine.playDartWhoosh(), 1800);
        setTimeout(() => soundEngine.playFloorThump(), 2280);
        setTimeout(() => soundEngine.playDartWhoosh(), 3200);
        setTimeout(() => soundEngine.playBalloonSqueak(1.18), 3600);
        setTimeout(() => soundEngine.playAngrySting(), 4500);
      },
    },
    {
      project: 'balloon-pop-jackpot' as const,
      name: 'Three Quick Pops',
      time: 'Balloon Pop Jackpot (12.35s - 15.45s)',
      desc: 'Three dart whooshes, three balloon pops with confetti, then a cartoon boing as the beanie flies off.',
      trigger: () => {
        soundEngine.playDartWhoosh();
        setTimeout(() => soundEngine.playBalloonPop(), 250);
        setTimeout(() => soundEngine.playConfettiPop(), 290);
        setTimeout(() => soundEngine.playDartWhoosh(), 800);
        setTimeout(() => soundEngine.playBalloonPop(), 1050);
        setTimeout(() => soundEngine.playDartWhoosh(), 1600);
        setTimeout(() => soundEngine.playBalloonPop(), 1850);
        setTimeout(() => soundEngine.playMechanicalClick(), 2550);
        setTimeout(() => soundEngine.playCartoonBoing(), 3100);
      },
    },
    {
      project: 'balloon-pop-jackpot' as const,
      name: 'Jackpot',
      time: 'Balloon Pop Jackpot (18.2s - 23.6s)',
      desc: 'A long drum roll, one perfect dart, a golden pop, sparkles and a victory fanfare.',
      trigger: () => {
        soundEngine.playDrumRoll(undefined, 3.0);
        setTimeout(() => soundEngine.playDartWhoosh(), 3100);
        setTimeout(() => soundEngine.playGoldenPop(), 3400);
        setTimeout(() => soundEngine.playConfettiPop(), 3440);
        setTimeout(() => soundEngine.playPrizeSparkle(), 3700);
        setTimeout(() => soundEngine.playVictoryFanfare(), 3500);
      },
    },
    {
      project: 'balloon-pop-jackpot' as const,
      name: 'The Prize Is A Balloon',
      time: 'Balloon Pop Jackpot (24.4s - 29.0s)',
      desc: 'The trophy case opens, a giant balloon inflates and bursts, a record scratch, a tiny balloon squeak and an angry sting.',
      trigger: () => {
        soundEngine.playCaseOpen();
        setTimeout(() => soundEngine.playBalloonInflate(undefined, 2.1), 900);
        setTimeout(() => soundEngine.playBigImpact(), 3000);
        setTimeout(() => soundEngine.playGoldenPop(), 3020);
        setTimeout(() => soundEngine.playConfettiPop(), 3100);
        setTimeout(() => soundEngine.playRecordScratch(), 3850);
        setTimeout(() => soundEngine.playBalloonSqueak(1.72), 4000);
        setTimeout(() => soundEngine.playAngrySting(), 4600);
      },
    },
    // Candy Claw Disaster Effects
    {
      project: 'candy-claw' as const,
      name: 'Carnival Booth',
      time: 'Candy Claw Disaster (0.0s - 0.5s)',
      desc: 'Booth light shimmer, token clink, machine chime, and magical sparkle.',
      trigger: () => {
        soundEngine.playBoothLights();
        setTimeout(() => soundEngine.playCoinClink(), 3300);
        setTimeout(() => soundEngine.playArcadeChime(), 4000);
        setTimeout(() => soundEngine.playMagicSparkle(), 4400);
      },
    },
    {
      project: 'candy-claw' as const,
      name: 'The First Grab',
      time: 'Candy Claw Disaster (6.5s - 11.0s)',
      desc: 'Claw motor, button click, mechanical click, rising whistle, cartoon boing for slip, floor thump, angry sting.',
      trigger: () => {
        soundEngine.playClawMotor(undefined, 1.5);
        setTimeout(() => soundEngine.playButtonClick(), 1500);
        setTimeout(() => soundEngine.playMechanicalClick(), 1600);
        setTimeout(() => soundEngine.playRisingWhistle(undefined, 0.7), 1700);
        setTimeout(() => soundEngine.playCartoonBoing(), 3300);
        setTimeout(() => soundEngine.playFloorThump(), 3700);
        setTimeout(() => soundEngine.playAngrySting(), 4600);
      },
    },
    {
      project: 'candy-claw' as const,
      name: 'The Perfect Grab',
      time: 'Candy Claw Disaster (12.7s - 18.0s)',
      desc: 'Deep breath, claw motor, button click, mechanical click, rising whistle, victory fanfare, happy hops.',
      trigger: () => {
        soundEngine.playDeepBreath();
        setTimeout(() => soundEngine.playClawMotor(undefined, 0.9), 1400);
        setTimeout(() => soundEngine.playButtonClick(), 1500);
        setTimeout(() => soundEngine.playMechanicalClick(), 1600);
        setTimeout(() => soundEngine.playRisingWhistle(undefined, 0.9), 1700);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 3800);
        setTimeout(() => soundEngine.playFloorThump(), 4100);
        setTimeout(() => soundEngine.playFloorThump(), 4800);
      },
    },
    {
      project: 'candy-claw' as const,
      name: 'Candy Overload',
      time: 'Candy Claw Disaster (18.9s - 24.0s)',
      desc: 'Arcade alarm, mechanical click, plush avalanche, dramatic rumble.',
      trigger: () => {
        soundEngine.playArcadeAlarm();
        setTimeout(() => soundEngine.playMechanicalClick(), 750);
        setTimeout(() => soundEngine.playPlushAvalanche(), 1100);
        setTimeout(() => soundEngine.playDramaticRumble(), 3150);
      },
    },
    {
      project: 'candy-claw' as const,
      name: 'Buried in Candy',
      time: 'Candy Claw Disaster (24.4s - 29.0s)',
      desc: 'Big impact, cartoon crash, balloon squeak, freeze sting.',
      trigger: () => {
        soundEngine.playBigImpact();
        setTimeout(() => soundEngine.playCartoonCrash(), 600);
        setTimeout(() => soundEngine.playBalloonSqueak(1.5), 4000);
        setTimeout(() => soundEngine.playFreezeSting(), 4600);
      },
    },
    // The Impossible Plate Spin Effects
    {
      project: 'plate-spin' as const,
      name: 'The First Plate',
      time: 'Plate Spin (0.0s - 5.2s)',
      desc: 'Footsteps, a sign sparkle, a determined ding, the crate rattle, the plate whoosh, a clean clink and the first spin whirr.',
      trigger: () => {
        soundEngine.playFootstep();
        setTimeout(() => soundEngine.playFootstep(), 550);
        setTimeout(() => soundEngine.playFootstep(), 1100);
        setTimeout(() => soundEngine.playMagicSparkle(), 1900);
        setTimeout(() => soundEngine.playIdeaDing(), 2450);
        setTimeout(() => soundEngine.playWoodClack(), 3500);
        setTimeout(() => soundEngine.playWhoosh(), 4370);
        setTimeout(() => soundEngine.playPlateClink(), 4820);
        setTimeout(() => soundEngine.playPlateWhir(undefined, 0.9), 4840);
      },
    },
    {
      project: 'plate-spin' as const,
      name: 'Three Plates',
      time: 'Plate Spin (6.5s - 10.6s)',
      desc: 'Two more crate grabs, two plate whooshes, two light clinks and a confident ding.',
      trigger: () => {
        soundEngine.playWoodClack();
        setTimeout(() => soundEngine.playWhoosh(), 100);
        setTimeout(() => soundEngine.playPlateClink(), 550);
        setTimeout(() => soundEngine.playPlateWhir(undefined, 0.8), 580);
        setTimeout(() => soundEngine.playWoodClack(), 2200);
        setTimeout(() => soundEngine.playWhoosh(), 2300);
        setTimeout(() => soundEngine.playPlateClink(), 2750);
        setTimeout(() => soundEngine.playPlateWhir(undefined, 1.0), 2780);
        setTimeout(() => soundEngine.playConfidenceDing(), 4000);
      },
    },
    {
      project: 'plate-spin' as const,
      name: 'Ten Plate Montage',
      time: 'Plate Spin (12.1s - 17.6s)',
      desc: 'Seven rapid crate grabs, seven whooshes and clinks, the ten-plate whirr, a nervous wobble and a proud ding.',
      trigger: () => {
        for (let i = 0; i < 7; i++) {
          const at = i * 500;
          setTimeout(() => soundEngine.playWoodClack(), at);
          setTimeout(() => soundEngine.playWhoosh(), at + 120);
          setTimeout(() => soundEngine.playPlateClink(), at + 570);
        }
        setTimeout(() => soundEngine.playPlateWhir(undefined, 1.4), 3650);
        setTimeout(() => soundEngine.playPlateWobble(), 4850);
        setTimeout(() => soundEngine.playMagicSparkle(), 5250);
        setTimeout(() => soundEngine.playConfidenceDing(), 5500);
      },
    },
    {
      project: 'plate-spin' as const,
      name: 'The Wobble & Flight',
      time: 'Plate Spin (18.2s - 23.6s)',
      desc: 'Victory fanfare, happy hops, a wobbling creak, rising tension, the slip, the flying-plate whistle and a hush.',
      trigger: () => {
        soundEngine.playVictoryFanfareShort();
        setTimeout(() => soundEngine.playFloorThump(), 80);
        setTimeout(() => soundEngine.playFloorThump(), 520);
        setTimeout(() => soundEngine.playPlateWobble(), 1300);
        setTimeout(() => soundEngine.playRisingMusicSwelling(), 2100);
        setTimeout(() => soundEngine.playSlideWhistle(), 2850);
        setTimeout(() => soundEngine.playWhoosh(), 2920);
        setTimeout(() => soundEngine.playSpinWhistle(), 2980);
        setTimeout(() => soundEngine.playPlateWhir(undefined, 1.3), 3700);
        setTimeout(() => soundEngine.playSoftFlick(), 5200);
      },
    },
    {
      project: 'plate-spin' as const,
      name: 'The Beanie Record',
      time: 'Plate Spin (24.3s - 29.2s)',
      desc: 'A gentle plate clink and tiny plop on the beanie, a record scratch, the beanie-plate whirr, a proud ding, sparkles and the freeze sting.',
      trigger: () => {
        soundEngine.playPlateClink();
        setTimeout(() => soundEngine.playTinyPlop(), 30);
        setTimeout(() => soundEngine.playRecordScratch(), 300);
        setTimeout(() => soundEngine.playPlateWhir(undefined, 1.2), 600);
        setTimeout(() => soundEngine.playIdeaDing(), 2500);
        setTimeout(() => soundEngine.playPrizeSparkle(), 3300);
        setTimeout(() => soundEngine.playFreezeSting(), 4900);
      },
    },
    // The Three-Wall Ping-Pong Shot Effects
    {
      project: 'three-wall-ping-pong' as const,
      name: 'The Setup',
      time: 'Three-Wall Ping-Pong (0.0s - 4.5s)',
      desc: 'Confident ding, paddle grip click, wind-up whoosh.',
      trigger: () => {
        soundEngine.playConfidenceDing();
        setTimeout(() => soundEngine.playMechanicalClick(), 1500);
        setTimeout(() => soundEngine.playWhoosh(), 2500);
      },
    },
    {
      project: 'three-wall-ping-pong' as const,
      name: 'The First Fail',
      time: 'Three-Wall Ping-Pong (6.5s - 10.0s)',
      desc: 'Paddle hit, ball flight, wall bounce, ricochet boing, beanie bonk, angry sting, ball plop.',
      trigger: () => {
        soundEngine.playPaddleHit();
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playWallBounce(), 1300);
        setTimeout(() => soundEngine.playCartoonBoing(), 1500);
        setTimeout(() => soundEngine.playHeadBonk(), 2000);
        setTimeout(() => soundEngine.playAngrySting(), 2500);
        setTimeout(() => soundEngine.playDeskPlop(), 3300);
      },
    },
    {
      project: 'three-wall-ping-pong' as const,
      name: 'So Close',
      time: 'Three-Wall Ping-Pong (12.3s - 17.6s)',
      desc: 'Deep breath, paddle hit, three clean wall bounces, near-miss slide, sad trombone.',
      trigger: () => {
        soundEngine.playDeepBreath();
        setTimeout(() => soundEngine.playPaddleHit(), 500);
        setTimeout(() => soundEngine.playWallBounce(), 1500);
        setTimeout(() => soundEngine.playWallBounce(), 2700);
        setTimeout(() => soundEngine.playWallBounce(), 3900);
        setTimeout(() => soundEngine.playSlideWhistle(), 4900);
        setTimeout(() => soundEngine.playSadTrombone(), 5300);
      },
    },
    {
      project: 'three-wall-ping-pong' as const,
      name: 'The Perfect Shot',
      time: 'Three-Wall Ping-Pong (18.5s - 23.9s)',
      desc: 'Slow-mo swell, perfect paddle hit, three resonant wall chimes, cup plink, victory fanfare, happy hop.',
      trigger: () => {
        soundEngine.playRisingMusicSwelling();
        setTimeout(() => soundEngine.playPaddleHit(), 1500);
        setTimeout(() => soundEngine.playMagicSparkle(), 2300);
        setTimeout(() => soundEngine.playMagicSparkle(), 3300);
        setTimeout(() => soundEngine.playMagicSparkle(), 4300);
        setTimeout(() => soundEngine.playCupPing(), 5000);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 5200);
        setTimeout(() => soundEngine.playFloorThump(), 5400);
      },
    },
    {
      project: 'three-wall-ping-pong' as const,
      name: 'Too Many Balls',
      time: 'Three-Wall Ping-Pong (24.2s - 29.0s)',
      desc: 'Cup rattle, avalanche rumble, balls cascade, beanie rise, freeze sting.',
      trigger: () => {
        soundEngine.playMechanicalClick();
        setTimeout(() => soundEngine.playDramaticRumble(), 300);
        setTimeout(() => soundEngine.playPlushAvalanche(), 800);
        setTimeout(() => soundEngine.playSoftFlick(), 3300);
        setTimeout(() => soundEngine.playFreezeSting(), 4800);
      },
    },
    // The Impossible Cup-in-Cup Shot Effects
    {
      project: 'cup-in-cup' as const,
      name: 'The Setup',
      time: 'Cup-in-Cup (0.0s - 4.5s)',
      desc: 'Cup placement clicks, ball pickup, confident ding.',
      trigger: () => {
        soundEngine.playMechanicalClick();
        setTimeout(() => soundEngine.playMechanicalClick(), 700);
        setTimeout(() => soundEngine.playMechanicalClick(), 1200);
        setTimeout(() => soundEngine.playMechanicalClick(), 2000);
        setTimeout(() => soundEngine.playConfidenceDing(), 3500);
      },
    },
    {
      project: 'cup-in-cup' as const,
      name: 'First Failure',
      time: 'Cup-in-Cup (6.5s - 8.5s)',
      desc: 'Paddle hit, ball bounce, rim clang, angry sting.',
      trigger: () => {
        soundEngine.playPaddleHit();
        setTimeout(() => soundEngine.playWallBounce(), 700);
        setTimeout(() => soundEngine.playRimClink(), 900);
        setTimeout(() => soundEngine.playAngrySting(), 1300);
      },
    },
    {
      project: 'cup-in-cup' as const,
      name: 'Almost Perfect',
      time: 'Cup-in-Cup (12.3s - 16.5s)',
      desc: 'Deep breath, paddle hit, bounce, suspense swell, soft plink, record scratch, sad trombone.',
      trigger: () => {
        soundEngine.playDeepBreath();
        setTimeout(() => soundEngine.playPaddleHit(), 500);
        setTimeout(() => soundEngine.playWallBounce(), 1900);
        setTimeout(() => soundEngine.playRisingMusicSwelling(), 2200);
        setTimeout(() => soundEngine.playCupPing(), 3200);
        setTimeout(() => soundEngine.playRecordScratch(), 3700);
        setTimeout(() => soundEngine.playSadTrombone(), 4200);
      },
    },
    {
      project: 'cup-in-cup' as const,
      name: 'The Perfect Shot',
      time: 'Cup-in-Cup (18.5s - 23.5s)',
      desc: 'Slow-mo swell, paddle thock, bounce, resonant chime, perfect plink, victory fanfare, happy hop.',
      trigger: () => {
        soundEngine.playRisingMusicSwelling();
        setTimeout(() => soundEngine.playPaddleHit(), 1500);
        setTimeout(() => soundEngine.playWallBounce(), 3000);
        setTimeout(() => soundEngine.playMagicSparkle(), 3500);
        setTimeout(() => soundEngine.playCupPing(), 4500);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 4800);
        setTimeout(() => soundEngine.playFloorThump(), 5000);
      },
    },
    {
      project: 'cup-in-cup' as const,
      name: 'The Cup Avalanche',
      time: 'Cup-in-Cup (24.5s - 29.0s)',
      desc: 'Table bump, wobble creak, avalanche rumble, cups cascading, beanie rise, freeze sting.',
      trigger: () => {
        soundEngine.playFloorThump();
        setTimeout(() => soundEngine.playCupWobbleCreak(), 500);
        setTimeout(() => soundEngine.playDramaticRumble(), 1000);
        setTimeout(() => soundEngine.playPlushAvalanche(), 1500);
        setTimeout(() => soundEngine.playSoftFlick(), 3500);
        setTimeout(() => soundEngine.playFreezeSting(), 4500);
      },
    },
    // The Yo-Yo Revenge Effects
    {
      project: 'yo-yo-revenge' as const,
      name: 'The Challenge',
      time: 'Yo-Yo Revenge (0.0s - 5.0s)',
      desc: 'String twang, confident ding, cup settle, wind-up whoosh.',
      trigger: () => {
        soundEngine.playRubberBandTwang();
        setTimeout(() => soundEngine.playConfidenceDing(), 1200);
        setTimeout(() => soundEngine.playPreciseTap(), 1900);
        setTimeout(() => soundEngine.playWhoosh(), 3100);
      },
    },
    {
      project: 'yo-yo-revenge' as const,
      name: 'Too High!',
      time: 'Yo-Yo Revenge (5.1s - 9.5s)',
      desc: 'Release twang, swing whirr, high-pass whoosh, cup wobble, near-miss whoosh, cartoon boing, angry sting.',
      trigger: () => {
        soundEngine.playRubberBandTwang();
        setTimeout(() => soundEngine.playSpiralWhirr(), 750);
        setTimeout(() => soundEngine.playWhoosh(), 1550);
        setTimeout(() => soundEngine.playCupWobbleCreak(), 1800);
        setTimeout(() => soundEngine.playWhoosh(), 2600);
        setTimeout(() => soundEngine.playCartoonBoing(), 2850);
        setTimeout(() => soundEngine.playAngrySting(), 3850);
      },
    },
    {
      project: 'yo-yo-revenge' as const,
      name: 'Around the Table',
      time: 'Yo-Yo Revenge (11.0s - 16.5s)',
      desc: 'Idea ding, drop whoosh, leg whirr, strained wrap, ankle squeak, balance boing, relieved sigh.',
      trigger: () => {
        soundEngine.playIdeaDing();
        setTimeout(() => soundEngine.playWhoosh(), 700);
        setTimeout(() => soundEngine.playSpiralWhirr(), 1600);
        setTimeout(() => soundEngine.playStrainedTug(), 2800);
        setTimeout(() => soundEngine.playSqueak(), 3400);
        setTimeout(() => soundEngine.playCartoonBoing(), 4100);
        setTimeout(() => soundEngine.playRelievedSigh(), 4900);
      },
    },
    {
      project: 'yo-yo-revenge' as const,
      name: 'Perfect Shot',
      time: 'Yo-Yo Revenge (17.0s - 23.5s)',
      desc: 'Deep breath, soft flick, leg whirr, rising whistle, cup ping, magic sparkle, victory fanfare.',
      trigger: () => {
        soundEngine.playDeepBreath();
        setTimeout(() => soundEngine.playSoftFlick(), 1800);
        setTimeout(() => soundEngine.playSpiralWhirr(), 2600);
        setTimeout(() => soundEngine.playRisingWhistle(), 3600);
        setTimeout(() => soundEngine.playCupPing(), 4300);
        setTimeout(() => soundEngine.playMagicSparkle(), 4500);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 5300);
      },
    },
    {
      project: 'yo-yo-revenge' as const,
      name: 'Yo-Yo Revenge',
      time: 'Yo-Yo Revenge (24.0s - 29.5s)',
      desc: 'Proud ding, taut-string snap, whoosh, forehead bonk, beanie-pop boing, wobble, descending whistle, freeze sting.',
      trigger: () => {
        soundEngine.playConfidenceDing();
        setTimeout(() => soundEngine.playKnotSnap(), 600);
        setTimeout(() => soundEngine.playWhoosh(), 1000);
        setTimeout(() => soundEngine.playHeadBonk(), 1800);
        setTimeout(() => soundEngine.playCartoonBoing(), 1850);
        setTimeout(() => soundEngine.playSqueak(), 2400);
        setTimeout(() => soundEngine.playSlideWhistle(), 4200);
        setTimeout(() => soundEngine.playFreezeSting(), 5100);
      },
    },
    // Desert Island Effects
    {
      project: 'desert-island' as const,
      name: 'No Way Home',
      time: 'Desert Island (0.0s - 6.0s)',
      desc: 'Ocean waves, tropical birds, dramatic rumble.',
      trigger: () => {
         soundEngine.playWaterSplash(undefined, 0.3);
        setTimeout(() => soundEngine.playTropicalBirds(), 500);
        setTimeout(() => soundEngine.playDramaticRumble(), 1500);
      },
    },
    {
      project: 'desert-island' as const,
      name: 'Building a Shelter',
      time: 'Desert Island (6.0s - 12.0s)',
      desc: 'Wood tapping, leaves rustling, hut collapse, leaf flutter.',
      trigger: () => {
        soundEngine.playMechanicalClick();
        setTimeout(() => soundEngine.playPaperSlap(), 1000);
        setTimeout(() => soundEngine.playMechanicalClick(), 2000);
        setTimeout(() => soundEngine.playConfidenceDing(), 3000);
        setTimeout(() => soundEngine.playCupWobbleCreak(), 3500);
        setTimeout(() => soundEngine.playTrashCrash(), 4000);
        setTimeout(() => soundEngine.playPaperSlap(), 5000);
      },
    },
    {
      project: 'desert-island' as const,
      name: 'Fishing Disaster',
      time: 'Desert Island (12.0s - 18.0s)',
      desc: 'Water lapping, line creak, excited whoosh, rod bend, fish splash, sad trombone.',
      trigger: () => {
         soundEngine.playWaterSplash(undefined, 0.2);
        setTimeout(() => soundEngine.playRubberBandTwang(), 2300);
        setTimeout(() => soundEngine.playWhoosh(), 2800);
        setTimeout(() => soundEngine.playStrainedTug(), 3000);
         soundEngine.playWaterSplash(undefined, 1.0);
        setTimeout(() => soundEngine.playSadTrombone(), 3800);
         soundEngine.playWaterSplash(undefined, 0.1);
      },
    },
    {
      project: 'desert-island' as const,
      name: 'Rescue Signal',
      time: 'Desert Island (18.0s - 24.0s)',
      desc: 'Coconut rolling, uplifting fanfare, airplane engine, excited whoosh, jump boing.',
      trigger: () => {
        soundEngine.playFloorThump();
        setTimeout(() => soundEngine.playMechanicalClick(), 1000);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 2500);
        setTimeout(() => soundEngine.playPlaneEngine(), 3000);
        setTimeout(() => soundEngine.playWhoosh(), 3500);
        setTimeout(() => soundEngine.playCartoonBoing(), 4000);
      },
    },
    {
      project: 'desert-island' as const,
      name: 'Worst Timing Ever',
      time: 'Desert Island (24.0s - 30.0s)',
      desc: 'Coconut creak, fall whoosh, beanie pop, plane pass, sad trombone, freeze sting.',
      trigger: () => {
        soundEngine.playCupWobbleCreak();
        setTimeout(() => soundEngine.playWhoosh(), 300);
        setTimeout(() => soundEngine.playCartoonBoing(), 600);
        setTimeout(() => soundEngine.playCartoonBoing(), 800);
        setTimeout(() => soundEngine.playFloorThump(), 1200);
        setTimeout(() => soundEngine.playPlaneEngine(), 1500);
        setTimeout(() => soundEngine.playSadTrombone(), 2000);
        setTimeout(() => soundEngine.playFreezeSting(), 4500);
      },
    },
    // The Shrinking Remote Effects
    {
      project: 'shrinking-remote' as const,
      name: 'The Mysterious Remote',
      time: 'Shrinking Remote (0.0s - 6.0s)',
      desc: 'Notebook tap, magical hum, remote click, purple beam zap, shrinking whoosh, surprised boing.',
      trigger: () => {
        soundEngine.playMechanicalClick();
        setTimeout(() => soundEngine.playShrinkBeam(), 500);
        setTimeout(() => soundEngine.playRemoteClick(), 1550);
        setTimeout(() => soundEngine.playShrinkBeam(), 1600);
        setTimeout(() => soundEngine.playShrinkDown(), 1900);
        setTimeout(() => soundEngine.playCartoonBoing(), 2800);
      },
    },
    {
      project: 'shrinking-remote' as const,
      name: 'I\'m a Genius!',
      time: 'Shrinking Remote (6.0s - 12.0s)',
      desc: 'Remote clicks, three beam zaps and shrink whooshes, victory fanfare, ominous rumble.',
      trigger: () => {
        soundEngine.playRemoteClick();
        setTimeout(() => soundEngine.playShrinkBeam(), 50);
        setTimeout(() => soundEngine.playShrinkDown(), 300);
        setTimeout(() => soundEngine.playRemoteClick(), 1250);
        setTimeout(() => soundEngine.playShrinkBeam(), 1300);
        setTimeout(() => soundEngine.playShrinkDown(), 1500);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 3100);
        setTimeout(() => soundEngine.playDramaticRumble(), 4900);
      },
    },
    {
      project: 'shrinking-remote' as const,
      name: 'Oops!',
      time: 'Shrinking Remote (12.0s - 18.0s)',
      desc: 'Beam zap, long shrinking whoosh, remote floor thump, bounce, shocked boing.',
      trigger: () => {
        soundEngine.playShrinkBeam();
        setTimeout(() => soundEngine.playShrinkDown(), 100);
        setTimeout(() => soundEngine.playFloorThump(), 850);
        setTimeout(() => soundEngine.playCartoonBoing(), 1100);
        setTimeout(() => soundEngine.playCartoonBoing(), 2600);
      },
    },
    {
      project: 'shrinking-remote' as const,
      name: 'Giant Bedroom Survival',
      time: 'Shrinking Remote (18.0s - 24.0s)',
      desc: 'Tiny footsteps, pencil tap, giant sneaker slide, panic boing, jump whoosh, pillow poof, sneaker thud.',
      trigger: () => {
        soundEngine.playFootstep(false);
        setTimeout(() => soundEngine.playMechanicalClick(), 700);
        setTimeout(() => soundEngine.playSneakerSlide(), 1500);
        setTimeout(() => soundEngine.playCartoonBoing(), 1900);
        setTimeout(() => soundEngine.playWhoosh(), 2100);
        setTimeout(() => soundEngine.playPillowPoof(), 2700);
        setTimeout(() => soundEngine.playFloorThump(), 3100);
      },
    },
    {
      project: 'shrinking-remote' as const,
      name: 'That Was Not Reset!',
      time: 'Shrinking Remote (24.0s - 30.0s)',
      desc: 'Jump whoosh, tiny footsteps, purple button click, beam, furniture shrink, sad trombone, freeze sting.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playFootstep(false), 800);
        setTimeout(() => soundEngine.playRemoteClick(), 1900);
        setTimeout(() => soundEngine.playShrinkBeam(), 1950);
        setTimeout(() => soundEngine.playShrinkDown(), 2200);
        setTimeout(() => soundEngine.playSadTrombone(), 3700);
        setTimeout(() => soundEngine.playFreezeSting(), 4900);
      },
    },
    // The Magic Paintbrush Effects
    {
      project: 'magic-paintbrush' as const,
      name: 'The Magic Discovery',
      time: 'Magic Paintbrush (0.0s - 6.0s)',
      desc: 'Box creak, magical shimmer, paint swish, sparkle chime, transform ding, surprised boing.',
      trigger: () => {
        soundEngine.playFunnyImpact();
        setTimeout(() => soundEngine.playMagicSparkle(), 700);
        setTimeout(() => soundEngine.playPaintSwish(), 1400);
        setTimeout(() => soundEngine.playPaintSwish(), 2400);
        setTimeout(() => soundEngine.playMagicSparkle(), 3400);
        setTimeout(() => soundEngine.playTransformDing(), 4000);
        setTimeout(() => soundEngine.playCartoonBoing(), 4500);
      },
    },
    {
      project: 'magic-paintbrush' as const,
      name: 'I Can Create Anything!',
      time: 'Magic Paintbrush (6.0s - 12.0s)',
      desc: 'Paint swish, staircase chime, transform ding, fanfare, cake swish, transform ding, celebration fanfare.',
      trigger: () => {
        soundEngine.playPaintSwish();
        setTimeout(() => soundEngine.playMagicSparkle(), 800);
        setTimeout(() => soundEngine.playTransformDing(), 1500);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 2100);
        setTimeout(() => soundEngine.playPaintSwish(), 2900);
        setTimeout(() => soundEngine.playTransformDing(), 3900);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 4600);
      },
    },
    {
      project: 'magic-paintbrush' as const,
      name: 'The Terrible Drawing',
      time: 'Magic Paintbrush (12.0s - 18.0s)',
      desc: 'Monster swish, purple hum, shake rumble, head pop, monster bounce, shock boing.',
      trigger: () => {
        soundEngine.playPaintSwish();
        setTimeout(() => soundEngine.playMagicSparkle(), 800);
        setTimeout(() => soundEngine.playDramaticRumble(), 1600);
        setTimeout(() => soundEngine.playFunnyImpact(), 2300);
        setTimeout(() => soundEngine.playCartoonBoing(), 2600);
        setTimeout(() => soundEngine.playCartoonBoing(), 3600);
      },
    },
    {
      project: 'magic-paintbrush' as const,
      name: 'The Monster Chase',
      time: 'Magic Paintbrush (18.0s - 24.0s)',
      desc: 'Monster footsteps, cartoon run, cake bump, frosting splat, stairs, cage swish, cage glow.',
      trigger: () => {
        soundEngine.playMonsterFootstep();
        setTimeout(() => soundEngine.playMonsterFootstep(), 800);
        setTimeout(() => soundEngine.playCartoonRun(), 1300);
        setTimeout(() => soundEngine.playFunnyImpact(), 2000);
        setTimeout(() => soundEngine.playFunnyImpact(), 2200);
        setTimeout(() => soundEngine.playCartoonRun(), 2800);
        setTimeout(() => soundEngine.playPaintSwish(), 3700);
        setTimeout(() => soundEngine.playMagicSparkle(), 4700);
      },
    },
    {
      project: 'magic-paintbrush' as const,
      name: 'The Final Mistake',
      time: 'Magic Paintbrush (24.0s - 30.0s)',
      desc: 'Cage slam, realisation boing, wave chime, sad trombone, brush pickup, tiny draw, tiny transform, freeze sting.',
      trigger: () => {
        soundEngine.playFunnyImpact();
        setTimeout(() => soundEngine.playCartoonBoing(), 1100);
        setTimeout(() => soundEngine.playMagicSparkle(), 1800);
        setTimeout(() => soundEngine.playSadTrombone(), 2600);
        setTimeout(() => soundEngine.playPaintSwish(), 3400);
        setTimeout(() => soundEngine.playPaintSwish(), 3900);
        setTimeout(() => soundEngine.playTransformDing(), 4500);
        setTimeout(() => soundEngine.playFreezeSting(), 5500);
      },
    },
    // The Giant Balloon Prison Effects
    {
      project: 'giant-balloon-prison' as const,
      name: 'The Tiny Balloon',
      time: 'Giant Balloon Prison (0.0s - 6.0s)',
      desc: 'Balloon squeak, pump pickup, pump clicks, four hand-pump squirts, balloon inflate, proud sparkle.',
      trigger: () => {
        soundEngine.playBalloonSqueak(1.35);
        setTimeout(() => soundEngine.playSqueak(), 700);
        setTimeout(() => soundEngine.playHandPump(), 1300);
        setTimeout(() => soundEngine.playHandPump(), 1900);
        setTimeout(() => soundEngine.playHandPump(), 2300);
        setTimeout(() => soundEngine.playHandPump(), 2700);
        setTimeout(() => soundEngine.playHandPump(), 3100);
        setTimeout(() => soundEngine.playBalloonInflate(undefined, 1.1), 3200);
        setTimeout(() => soundEngine.playMagicSparkle(), 3800);
      },
    },
    {
      project: 'giant-balloon-prison' as const,
      name: 'Too Much Air',
      time: 'Giant Balloon Prison (6.0s - 12.0s)',
      desc: 'Balloon stretch, sofa whoosh, table whoosh, lamp creak, elastic press, panicked squeak.',
      trigger: () => {
        soundEngine.playBalloonStretch();
        setTimeout(() => soundEngine.playWhoosh(), 1400);
        setTimeout(() => soundEngine.playWhoosh(), 2300);
        setTimeout(() => soundEngine.playWoodCreak(), 2900);
        setTimeout(() => soundEngine.playElasticStretch(), 3900);
        setTimeout(() => soundEngine.playSqueak(), 4600);
      },
    },
    {
      project: 'giant-balloon-prison' as const,
      name: 'The House Gets Trapped',
      time: 'Giant Balloon Prison (12.0s - 18.0s)',
      desc: 'Balloon stretch, roof creak, big inflate, shimmer as the face appears, shock boing, dramatic rumble.',
      trigger: () => {
        soundEngine.playBalloonStretch();
        setTimeout(() => soundEngine.playWoodCreak(), 1300);
        setTimeout(() => soundEngine.playBalloonInflate(undefined, 1.9), 2300);
        setTimeout(() => soundEngine.playMagicSparkle(), 3600);
        setTimeout(() => soundEngine.playSpringBoing(), 4700);
        setTimeout(() => soundEngine.playDramaticRumble(), 5100);
      },
    },
    {
      project: 'giant-balloon-prison' as const,
      name: 'The Balloon Prison',
      time: 'Giant Balloon Prison (18.0s - 24.0s)',
      desc: 'House-lift rumble, cartoon run, door whoosh, angry sting, punch impact, elastic stretch, spring boing, sofa landing.',
      trigger: () => {
        soundEngine.playDramaticRumble();
        setTimeout(() => soundEngine.playCartoonRun(), 700);
        setTimeout(() => soundEngine.playWhoosh(), 1500);
        setTimeout(() => soundEngine.playSpringBoing(undefined, 0.6), 2500);
        setTimeout(() => soundEngine.playFunnyImpact(), 3100);
        setTimeout(() => soundEngine.playElasticStretch(), 3450);
        setTimeout(() => soundEngine.playSpringBoing(undefined, 1.4), 3800);
        setTimeout(() => soundEngine.playFunnyImpact(), 4500);
      },
    },
    {
      project: 'giant-balloon-prison' as const,
      name: 'The Worst Escape',
      time: 'Giant Balloon Prison (24.0s - 30.0s)',
      desc: 'Spot the knot, reach whoosh, knot squeak, knot pop, air blast, house thud, victory fanfare, rocket launch, beanie whoosh, freeze sting.',
      trigger: () => {
        soundEngine.playSqueak();
        setTimeout(() => soundEngine.playWhoosh(), 700);
        setTimeout(() => soundEngine.playBalloonSqueak(0.8), 1200);
        setTimeout(() => soundEngine.playAirPuff(), 1600);
        setTimeout(() => soundEngine.playAirRelease(undefined, 0.9), 1850);
        setTimeout(() => soundEngine.playHouseThud(), 2600);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 3100);
        setTimeout(() => soundEngine.playRocketLaunch(), 3500);
        setTimeout(() => soundEngine.playBeanieWhoosh(), 3900);
        setTimeout(() => soundEngine.playFreezeSting(), 5000);
      },
    },
    // The Giant Pop-Up Tent Effects
    {
      project: 'pop-up-tent' as const,
      name: 'The Tiny Tent',
      time: 'Pop-Up Tent (0.0s - 6.0s)',
      desc: 'Notice squeak, walk whoosh, pickup squeak, fabric rustle, proud sparkle, throw whoosh, package plop, wiggle squeak.',
      trigger: () => {
        soundEngine.playSqueak();
        setTimeout(() => soundEngine.playWhoosh(), 700);
        setTimeout(() => soundEngine.playSqueak(), 1400);
        setTimeout(() => soundEngine.playBalloonSqueak(1.4), 2000);
        setTimeout(() => soundEngine.playMagicSparkle(), 2800);
        setTimeout(() => soundEngine.playWhoosh(), 3600);
        setTimeout(() => soundEngine.playDeskPlop(), 4200);
        setTimeout(() => soundEngine.playBalloonSqueak(1.2), 4800);
      },
    },
    {
      project: 'pop-up-tent' as const,
      name: 'Too Big!',
      time: 'Pop-Up Tent (6.0s - 12.0s)',
      desc: 'Big tent pop, spring burst, jump whoosh, fabric stretch, sofa slide, elastic stretch, wooden creak, settle boing, shock squeak.',
      trigger: () => {
        soundEngine.playBalloonPop();
        setTimeout(() => soundEngine.playSpringBoing(undefined, 1.6), 60);
        setTimeout(() => soundEngine.playWhoosh(), 150);
        setTimeout(() => soundEngine.playBalloonStretch(), 500);
        setTimeout(() => soundEngine.playWhoosh(), 1300);
        setTimeout(() => soundEngine.playElasticStretch(), 2200);
        setTimeout(() => soundEngine.playWoodCreak(), 3000);
        setTimeout(() => soundEngine.playSpringBoing(undefined, 0.7), 3600);
        setTimeout(() => soundEngine.playSqueak(), 4200);
      },
    },
    {
      project: 'pop-up-tent' as const,
      name: 'The House Disappears',
      time: 'Pop-Up Tent (12.0s - 18.0s)',
      desc: 'Fabric stretch, wooden creak, wall rumble, big inflate, roof creak, deep rumble, pole slide whoosh, grab squeak, drag whoosh, stumble impact.',
      trigger: () => {
        soundEngine.playBalloonStretch();
        setTimeout(() => soundEngine.playWoodCreak(), 700);
        setTimeout(() => soundEngine.playDramaticRumble(), 1200);
        setTimeout(() => soundEngine.playBalloonInflate(undefined, 1.8), 2000);
        setTimeout(() => soundEngine.playWoodCreak(), 2700);
        setTimeout(() => soundEngine.playDramaticRumble(), 3200);
        setTimeout(() => soundEngine.playWhoosh(), 4200);
        setTimeout(() => soundEngine.playSqueak(), 4600);
        setTimeout(() => soundEngine.playWhoosh(), 5000);
        setTimeout(() => soundEngine.playFunnyImpact(), 5500);
      },
    },
    {
      project: 'pop-up-tent' as const,
      name: 'Camping Disaster',
      time: 'Pop-Up Tent (18.0s - 24.0s)',
      desc: 'Fabric ripple, elastic push, tension creak, snap boing, launch whoosh, sleeping-bag landing, bounce boing, settle puff, dizzy boing.',
      trigger: () => {
        soundEngine.playBalloonStretch();
        setTimeout(() => soundEngine.playElasticStretch(), 1000);
        setTimeout(() => soundEngine.playWoodCreak(), 1500);
        setTimeout(() => soundEngine.playSpringBoing(undefined, 1.5), 1950);
        setTimeout(() => soundEngine.playWhoosh(), 2100);
        setTimeout(() => soundEngine.playFunnyImpact(), 2600);
        setTimeout(() => soundEngine.playSpringBoing(undefined, 0.9), 2850);
        setTimeout(() => soundEngine.playAirPuff(), 3100);
        setTimeout(() => soundEngine.playCartoonBoing(), 4000);
      },
    },
    {
      project: 'pop-up-tent' as const,
      name: 'The Worst Camping Trip',
      time: 'Pop-Up Tent (24.0s - 30.0s)',
      desc: 'Get-up whoosh, button notice squeak, walk whoosh, jump boing, release-button click, air release, fabric fold, pole retract creak, collapse impact, proud fanfare, package drop whoosh, head bonk, beanie whoosh, freeze sting.',
      trigger: () => {
        soundEngine.playWhoosh();
        setTimeout(() => soundEngine.playSqueak(), 600);
        setTimeout(() => soundEngine.playWhoosh(), 900);
        setTimeout(() => soundEngine.playSpringBoing(undefined, 0.7), 1400);
        setTimeout(() => soundEngine.playButtonClick(), 1900);
        setTimeout(() => soundEngine.playAirRelease(undefined, 0.9), 2050);
        setTimeout(() => soundEngine.playBalloonStretch(), 2200);
        setTimeout(() => soundEngine.playWoodCreak(), 2450);
        setTimeout(() => soundEngine.playFunnyImpact(), 2750);
        setTimeout(() => soundEngine.playVictoryFanfareShort(), 3500);
        setTimeout(() => soundEngine.playWhoosh(), 4000);
        setTimeout(() => soundEngine.playHeadBonk(), 4250);
        setTimeout(() => soundEngine.playBeanieWhoosh(), 4350);
        setTimeout(() => soundEngine.playFreezeSting(), 5500);
      },
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
          {isDiamondHeist
            ? 'The Angry Stickman: The Impossible Diamond Heist is a 30-second museum comedy with a fully procedural 110 bpm sneaky score sliced into four 7.5-second sections (silence for alarm, trap, freeze) — plus diamond chime, spoon draw, laser zap, siren, tray ping, wall boing, button click, angelic choir, fanfare, glass clunk, camera clicks, and freeze sting. No external audio files.'
            : isPancakeFlip
            ? 'The Angry Stickman: The Perfect Pancake Flip is a 30-second kitchen comedy with a fully procedural 128 bpm bouncy score sliced into four 7.5-second sections (a music dip before the face splat and a short silence after the final trombone) — plus pan swoosh, cartoon boing, sticky ceiling splat, wood clack, pancake slides, plate clink, confetti pop, crowd cheer, counter bump, wet splat, angry sting and the tiny sad trombone. No external audio files.'
            : isVendingMachine
            ? 'The Angry Stickman: The Vending Machine Revenge is a 30-second snack-nook comedy with a fully procedural 122 bpm bouncy score sliced into four 7.5-second sections (a music dip before the air puff and a short silence after the final trombone) — plus machine rattle, coin clink, spiral whirr, heavy thud, broom scrape, strained tug, flying-kick impact, bag rip, giant air puff, one tiny chip tink, confetti pop, crowd cheer and the angry sting. No external audio files.'
            : isBiggestBalloon
            ? 'The Angry Stickman: The Biggest Balloon is a 30-second anti-pop comedy with a fully procedural 126 bpm bouncy score sliced into four 7.5-second sections (the music drops out for the shot 3 fake-out and goes silent after the last trombone) — plus deep breath, rubber inflate squeaks, stretch creaks, tense drum roll, relieved sigh, knot snap, proud fanfare, wind gusts, needle-poke psst, a long raspberry air release, whirling swoosh and the tiny sad trombone. No external audio files.'
            : isFindTheBall
            ? 'The Angry Stickman: Find the Ball is a 30-second cup-shuffle comedy with a fully procedural 118 bpm playful magic-show score sliced into four 7.5-second sections (the music dips for the empty middle-cup reveal and goes silent after the last trombone) — plus cup lifts and clunks, wooden cup slides, magic sparkles, the table slap, a drum roll, three rising countdown beeps, a very quiet ball roll, the wah-wah trombone, record scratches, a frantic cup-flip flurry and the angry sting. No external audio files.'
            : isArcadeClaw
            ? 'The Angry Stickman: The Impossible Claw Machine is a 30-second neon arcade comedy with a fully procedural 132 bpm chiptune sliced into four 7.5-second sections (silence windows for the gag beats, a sting at the button and a fanfare in the chute) — plus coin and slot clicks, claw motors, the bumper boing, the cabinet ricochet, the win jingle, the alarm strobe and the plush avalanche. No external audio files.'
            : isDominoTrickshot
            ? 'The Angry Stickman: The Impossible Domino Trickshot is a 30-second chain reaction comedy with a fully procedural 124 bpm bouncy score sliced into four 7.5-second sections (music dip during the cup wobble, silence after the final sting) — plus dramatic boom, ticking countdown, soft flick, hard flick, 20 rhythmic domino clicks, rising swell, cup ping, victory fanfare, crowd cheer, hollow bonk, record scratch, and angry sting. No external audio files.'
            : isBalloonPop
            ? 'The Angry Stickman: The Balloon Pop Jackpot is a 30-second carnival-booth comedy with a fully procedural carnival score sliced into four 7.5-second sections — plus booth light shimmer, dart whooshes and wooden thunks, balloon wobble squeaks, three confetti balloon pops, a cartoon boing for the beanie, a long drum roll, a golden pop with sparkles, a victory fanfare, the trophy case opening, a giant balloon inflate and burst, a record scratch, a tiny balloon squeak and the angry sting. No external audio files.'
            : isCandyClaw
            ? 'The Angry Stickman: The Candy Claw Disaster is a 30-second neon arcade comedy with a fully procedural carnival score sliced into four 7.5-second sections — plus booth lights, claw motor whirs, button clicks, mechanical clicks, rising whistles, cartoon boings, victory fanfares, arcade alarms, plush avalanches, dramatic rumbles, big impacts, cartoon crashes, balloon squeaks, and freeze stings. No external audio files.'
            : isPlateSpin
            ? 'The Angry Stickman: The Impossible Plate Spin is a 30-second circus-booth comedy with a fully procedural 160 bpm carnival score sliced into four 7.5-second sections — plus footsteps, crate rattles, ten plate whooshes and clinks, spinning whirrs, a nervous wobble, a rising tension swell, the flying-plate whistle, a record scratch, a proud ding and the freeze sting. No external audio files.'
            : isThreeWallPingPong
            ? 'The Angry Stickman: The Three-Wall Ping-Pong Shot is a 30-second trickshot comedy with a fully procedural 140 bpm playful score sliced into four 7.5-second sections — plus paddle hits, three distinct wall bounces, a beanie bonk, slow-mo swell, resonant wall chimes, a cup plink, victory fanfare, an avalanche rumble and a freeze sting. No external audio files.'
            : isCupInCup
            ? 'The Angry Stickman: The Impossible Cup-in-Cup Shot is a 30-second cup trickshot comedy with a fully procedural 135 bpm playful score sliced into four 7.5-second sections — plus cup clicks, paddle hits, table bounces, rim clangs, suspense swells, soft plinks, victory fanfares, cup tower wobbles, avalanche rumbles, and a freeze sting. No external audio files.'
            : isYoYoRevenge
            ? 'The Angry Stickman: The Yo-Yo Revenge is a 30-second trickshot comedy with a fully procedural 142 bpm playful score sliced into four 7.5-second sections, plus string twangs, swing whirrs, a wobbling cup, an angry sting, the leg-wrap loops, a rising whistle, the cup ping, a victory fanfare, the taut-string snap, the forehead bonk, a beanie-pop boing, a descending whistle and the freeze sting. No external audio files.'
            : isDesertIsland
            ? 'The Angry Stickman: Stranded on a Desert Island is a 30-second survival comedy with a fully procedural 110 bpm tropical score sliced into four 7.5-second sections — plus ocean waves, tropical birds, wood tapping, hut collapse, fishing line creaks, fish splash, coconut rolling, uplifting fanfare, airplane engine, coconut fall, beanie pop, sad trombone, and freeze sting. No external audio files.'
            : isShrinkingRemote
            ? 'The Angry Stickman: The Shrinking Remote Control is a 30-second bedroom comedy with a fully procedural 120 bpm playful score sliced into four 7.5-second sections — plus remote clicks, purple beam zaps, shrinking whooshes, tiny footsteps, pencil taps, a giant sneaker slide, a pillow poof, a sad trombone and the freeze sting. No external audio files.'
            : isMagicPaintbrush
            ? 'The Angry Stickman: The Magic Paintbrush is a 30-second magic comedy with a fully procedural 128 bpm playful score sliced into four 7.5-second sections — plus paint swishes, magical sparkles, transformation dings, monster footsteps, cartoon running and funny impacts. No external audio files.'
            : isGiantBalloonPrison
            ? 'The Angry Stickman: The Giant Balloon Prison is a 30-second balloon comedy with a fully procedural 132 bpm playful score sliced into four 7.5-second sections — plus hand-pump squirts, balloon squeaks, stretch and inflate layers, wooden creaks, elastic boings, a knot pop, an air blast, a rocket launch, the beanie whoosh and a freeze sting. No external audio files.'
            : isPopUpTent
            ? 'The Angry Stickman: The Giant Pop-Up Tent is a 30-second camping comedy with a fully procedural 138 bpm playful score sliced into four 7.5-second sections — plus a big tent pop, spring burst, fabric stretch and rustle layers, whooshes, elastic boings, wooden creaks, the release-button click, a rapid air-release collapse, the package head bonk, the beanie whoosh and a freeze sting. No external audio files.'
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