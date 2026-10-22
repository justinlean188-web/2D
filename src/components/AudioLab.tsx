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
          {isCoinFlip
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
              <MicOff className="w-5 h-5 text-rose-500" />
            ) : (
              <Mic className="w-5 h-5 text-rose-500" />
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
              <span className="text-xs font-mono text-rose-400">Opening Hook (0.0s – 2.0s)</span>
              <button
                onClick={() => testVoiceLine(config.customVO1)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Play Voice</span>
              </button>
            </div>
            <input
              type="text"
              value={config.customVO1}
              onChange={(e) => setConfig({ ...config, customVO1: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-rose-500"
            />
            <p className="text-xs text-slate-500">
              Delivery: Neutral tone, slight documentary curiosity, no exaggerated emotion.
            </p>
          </div>

          {/* Cue 2 */}
          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-rose-400">Punchline (8.0s – 9.5s)</span>
              <button
                onClick={() => testVoiceLine(config.customVO2)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Play Voice</span>
              </button>
            </div>
            <input
              type="text"
              value={config.customVO2}
              onChange={(e) => setConfig({ ...config, customVO2: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-rose-500"
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
              className="w-full accent-rose-500"
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
              className="w-full accent-rose-500"
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
              className="w-full accent-rose-500"
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
            <Volume2 className="w-5 h-5 text-rose-500" />
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
                <div className="text-[11px] font-mono text-rose-400">{sfx.time}</div>
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