import { soundEngine } from './soundEngine';

export interface AudioCue {
  id: string;
  time: number;
  play: (dest?: AudioNode) => void;
}

/**
 * Complete 30-second sound map for "The Paper Ball Ricochet â€” 30s".
 * The same cue list drives both live preview and the export audio track.
 */
export const PAPER_BALL_30_CUES: AudioCue[] = [
  { id: 'pb30-toss-1', time: 0.8, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pb30-wall-1', time: 1.8, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'pb30-ruler', time: 4.1, play: (d) => soundEngine.playClipboardTap(d) },
  { id: 'pb30-calc-1', time: 4.35, play: (d) => soundEngine.playCalculatorBeep(d) },
  { id: 'pb30-calc-2', time: 4.85, play: (d) => soundEngine.playCalculatorBeep(d) },
  { id: 'pb30-calc-3', time: 5.35, play: (d) => soundEngine.playCalculatorBeep(d) },
  { id: 'pb30-thumbs-up', time: 6.65, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'pb30-toss-2', time: 8.5, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pb30-wall-2', time: 9.0, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'pb30-bonk', time: 9.6, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'pb30-training', time: 11.2, play: (d) => soundEngine.playTrainingMusic(d) },
  { id: 'pb30-stretch', time: 11.6, play: (d) => soundEngine.playArmCrossSqueak(d) },
  { id: 'pb30-squat-1', time: 12.5, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'pb30-squat-2', time: 12.95, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'pb30-arm-circle', time: 13.55, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pb30-flex', time: 14.2, play: (d) => soundEngine.playArmCrossSqueak(d) },
  { id: 'pb30-toss-3', time: 15.6, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pb30-lamp', time: 16.3, play: (d) => soundEngine.playLampDing(d) },
  { id: 'pb30-table', time: 17.0, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'pb30-fan', time: 17.7, play: (d) => soundEngine.playFanWhack(d) },
  { id: 'pb30-ricochet', time: 18.1, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pb30-heart-1', time: 19.3, play: (d) => soundEngine.playHeartbeat(d) },
  { id: 'pb30-heart-2', time: 20.3, play: (d) => soundEngine.playHeartbeat(d) },
  { id: 'pb30-heart-3', time: 21.3, play: (d) => soundEngine.playHeartbeat(d) },
  { id: 'pb30-heart-4', time: 22.2, play: (d) => soundEngine.playHeartbeat(d) },
  { id: 'pb30-plop', time: 23.0, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'pb30-fanfare', time: 23.6, play: (d) => soundEngine.playVictoryFanfare(d) },
  { id: 'pb30-crash', time: 27.0, play: (d) => soundEngine.playTrashCrash(d) },
  { id: 'pb30-trombone', time: 28.2, play: (d) => soundEngine.playSadTrombone(d) },
];

/**
 * Complete 30-second sound map for "The Paper Ball Ricochet â€” Episode 2".
 * Sound effects only: rumble, bonks, chime, clicks, launch, ricochets,
 * fanfare, crash, and a sad trombone.
 */
export const PAPER_BALL_SEQUEL_CUES: AudioCue[] = [
  { id: 'sq-rumble-open', time: 0.1, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'sq-clench', time: 2.7, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'sq-can-upright', time: 3.85, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'sq-ruler', time: 4.7, play: (d) => soundEngine.playClipboardTap(d) },
  { id: 'sq-ball-line-1', time: 5.45, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'sq-ball-line-2', time: 5.6, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'sq-ball-line-3', time: 5.75, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'sq-ball-line-4', time: 5.9, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'sq-ball-line-5', time: 6.05, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'sq-knuckles', time: 6.35, play: (d) => soundEngine.playKnuckleCrack(d) },
  { id: 'sq-toss-1', time: 7.3, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'sq-ceiling-bonk', time: 7.75, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'sq-toss-2', time: 8.05, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'sq-foot-bonk', time: 8.35, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'sq-toss-3', time: 8.75, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'sq-wall', time: 9.15, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'sq-toss-4', time: 9.55, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'sq-toss-5', time: 10.25, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'sq-rage-rumble', time: 11.35, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'sq-stomp-1', time: 12.45, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'sq-stomp-2', time: 13.25, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'sq-breath', time: 14.05, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'sq-calm-chime', time: 14.55, play: (d) => soundEngine.playCalmingChime(d) },
  { id: 'sq-build-1', time: 15.55, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'sq-build-2', time: 16.35, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'sq-build-3', time: 16.95, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'sq-band-twang', time: 17.45, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'sq-smug-ding', time: 18.2, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'sq-launch', time: 19.0, play: (d) => soundEngine.playLauncherFire(d) },
  { id: 'sq-lamp', time: 19.85, play: (d) => soundEngine.playLampDing(d) },
  { id: 'sq-fan', time: 20.55, play: (d) => soundEngine.playFanWhack(d) },
  { id: 'sq-ricochet-1', time: 21.1, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'sq-ricochet-2', time: 22.2, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'sq-plop', time: 24.0, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'sq-fanfare', time: 25.0, play: (d) => soundEngine.playVictoryFanfare(d) },
  { id: 'sq-crash', time: 27.6, play: (d) => soundEngine.playTrashCrash(d) },
  { id: 'sq-book-bonk', time: 28.45, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'sq-trombone', time: 28.8, play: (d) => soundEngine.playSadTrombone(d) },
];

/**
 * Complete 30-second sound map for "The Paper Ball Ricochet - Part 3".
 * A book bonk, a long walk, a run of failed shots, one perfect swish, a
 * championship celebration and a final bonk in the face.
 */
export const PAPER_BALL_PART3_CUES: AudioCue[] = [
  { id: 'p3-incident', time: 0.05, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'p3-book-bonk', time: 0.62, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'p3-clench', time: 1.4, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'p3-march', time: 2.0, play: (d) => soundEngine.playDramaticMarch(d) },
  { id: 'p3-shoe-1', time: 3.9, play: (d) => soundEngine.playSqueak(d) },
  { id: 'p3-shoe-2', time: 4.6, play: (d) => soundEngine.playSqueak(d) },
  { id: 'p3-shoe-3', time: 5.3, play: (d) => soundEngine.playSqueak(d) },
  { id: 'p3-panting', time: 5.6, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'p3-sigh', time: 6.4, play: (d) => soundEngine.playArmCrossSqueak(d) },
  { id: 'p3-book-drop', time: 7.4, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'p3-ball-pickup', time: 8.2, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'p3-throw-1', time: 9.2, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'p3-rim-1', time: 9.78, play: (d) => soundEngine.playRimClink(d) },
  { id: 'p3-face-1', time: 10.12, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'p3-growl', time: 10.5, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'p3-throw-2', time: 10.85, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'p3-backboard', time: 11.22, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'p3-forehead', time: 11.52, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'p3-stumble', time: 11.8, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'p3-throw-3', time: 14.1, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'p3-womp', time: 14.75, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'p3-throw-4', time: 15.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'p3-rim-2', time: 15.35, play: (d) => soundEngine.playRimClink(d) },
  { id: 'p3-face-2', time: 15.62, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'p3-throw-5', time: 16.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'p3-floor-bounce', time: 16.45, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'p3-face-3', time: 16.72, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'p3-throw-6', time: 17.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'p3-fist-rattle', time: 17.6, play: (d) => soundEngine.playKnuckleCrack(d) },
  { id: 'p3-throw-7', time: 18.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'p3-wail', time: 18.6, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'p3-rage', time: 19.4, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'p3-breath', time: 19.9, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'p3-calm', time: 20.4, play: (d) => soundEngine.playCalmingChime(d) },
  { id: 'p3-release', time: 21.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'p3-slowmo', time: 22.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'p3-rim-roll-1', time: 23.4, play: (d) => soundEngine.playRimClink(d) },
  { id: 'p3-rim-roll-2', time: 23.9, play: (d) => soundEngine.playRimClink(d) },
  { id: 'p3-swish', time: 24.5, play: (d) => soundEngine.playSwish(d) },
  { id: 'p3-fanfare', time: 25.0, play: (d) => soundEngine.playVictoryFanfare(d) },
  { id: 'p3-crowd', time: 25.6, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'p3-last-bounce', time: 28.0, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'p3-final-bonk', time: 28.45, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'p3-trombone', time: 28.9, play: (d) => soundEngine.playSadTrombone(d) },
];

/**
 * Complete 30-second sound map for "The Paper Ball Ricochet — Episode 4".
 * The hoop falls on his head, he over-prepares, chases the balls, lands an
 * accidental trick shot, celebrates on a podium and ends up hanging in the net.
 */
export const PAPER_BALL_PART4_CUES: AudioCue[] = [
  { id: 'p4-swish-open', time: 0.15, play: (d) => soundEngine.playSwish(d) },
  { id: 'p4-hoop-creak', time: 1.2, play: (d) => soundEngine.playArmCrossSqueak(d) },
  { id: 'p4-hoop-bonk', time: 2.6, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'p4-push-off', time: 4.4, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'p4-collect', time: 5.6, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'p4-foot-bonk', time: 7.5, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'p4-scatter', time: 8.0, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'p4-scatter-2', time: 8.35, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'p4-run-squeak', time: 10.5, play: (d) => soundEngine.playSqueak(d) },
  { id: 'p4-slip', time: 12.4, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'p4-catch', time: 13.4, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'p4-spin-land', time: 14.4, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'p4-breath', time: 15.2, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'p4-throw', time: 16.1, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'p4-support', time: 16.9, play: (d) => soundEngine.playRimClink(d) },
  { id: 'p4-floor-hit', time: 17.4, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'p4-wall-hit', time: 18.4, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'p4-swish', time: 20.4, play: (d) => soundEngine.playSwish(d) },
  { id: 'p4-fanfare', time: 21.0, play: (d) => soundEngine.playVictoryFanfare(d) },
  { id: 'p4-crowd', time: 21.8, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'p4-podium-collapse', time: 26.3, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'p4-pulled-back', time: 28.4, play: (d) => soundEngine.playArmCrossSqueak(d) },
  { id: 'p4-roll-past', time: 29.4, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'p4-kick', time: 29.65, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'p4-trombone', time: 29.8, play: (d) => soundEngine.playSadTrombone(d) },
];

/**
 * Complete 58-second sound map for "Max, Rex & Beep - Pop Star".
 * An original upbeat pop instrumental plus cartoon accents, crowd reactions
 * and the robot's little bleeps.
 */
export const POP_STAR_CUES: AudioCue[] = [
  { id: 'pop-track-1', time: 0.00, play: (d) => soundEngine.playPopTrackSection(d, 0.00, 7.25) },
  { id: 'pop-track-2', time: 7.25, play: (d) => soundEngine.playPopTrackSection(d, 7.25, 14.50) },
  { id: 'pop-track-3', time: 14.50, play: (d) => soundEngine.playPopTrackSection(d, 14.50, 21.75) },
  { id: 'pop-track-4', time: 21.75, play: (d) => soundEngine.playPopTrackSection(d, 21.75, 29.00) },
  { id: 'pop-track-5', time: 29.00, play: (d) => soundEngine.playPopTrackSection(d, 29.00, 36.25) },
  { id: 'pop-track-6', time: 36.25, play: (d) => soundEngine.playPopTrackSection(d, 36.25, 43.50) },
  { id: 'pop-track-7', time: 43.50, play: (d) => soundEngine.playPopTrackSection(d, 43.50, 50.75) },
  { id: 'pop-track-8', time: 50.75, play: (d) => soundEngine.playPopTrackSection(d, 50.75, 58.00) },
  { id: 'pop-crowd-1', time: 0.7, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'pop-dream', time: 3.0, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'pop-brush-break', time: 5.1, play: (d) => soundEngine.playBrushBreak(d) },
  { id: 'pop-mic-sparkle', time: 7.2, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'pop-groan', time: 9.0, play: (d) => soundEngine.playArmCrossSqueak(d) },
  { id: 'pop-dramatic-beat', time: 12.4, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'pop-dance-whoosh', time: 14.2, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pop-backflip-thud', time: 18.5, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'pop-rex-spin', time: 19.8, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pop-mic-kick', time: 21.3, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pop-robot-1', time: 23.2, play: (d) => soundEngine.playRobotBleep(d) },
  { id: 'pop-sweep', time: 26.0, play: (d) => soundEngine.playArmCrossSqueak(d) },
  { id: 'pop-plug', time: 28.6, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'pop-robot-2', time: 29.1, play: (d) => soundEngine.playRobotBleep(d) },
  { id: 'pop-dance-mode', time: 32.0, play: (d) => soundEngine.playRobotBleep(d) },
  { id: 'pop-crowd-2', time: 39.0, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'pop-applause', time: 44.2, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'pop-confetti', time: 45.0, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'pop-max-flat', time: 47.6, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'pop-cushions', time: 49.6, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'pop-sweep-2', time: 52.0, play: (d) => soundEngine.playArmCrossSqueak(d) },
  { id: 'pop-crown', time: 54.4, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'pop-crown-clink', time: 55.6, play: (d) => soundEngine.playRimClink(d) },
  { id: 'pop-final-hit', time: 57.6, play: (d) => soundEngine.playFloorThump(d) },
];

/**
 * Complete 60-second sound map for "ANGRY STICKMAN: TRICK-SHOT CHAMPION".
 * An original pop score that turns epic for the championship shot, plus
 * cartoon basketball impacts.
 */
export const TRICK_SHOT_CUES: AudioCue[] = [
  { id: 'ts-score-1', time: 0.00, play: (d) => soundEngine.playTrickShotScoreSection(d, 0.00, 7.50) },
  { id: 'ts-score-2', time: 7.50, play: (d) => soundEngine.playTrickShotScoreSection(d, 7.50, 15.00) },
  { id: 'ts-score-3', time: 15.00, play: (d) => soundEngine.playTrickShotScoreSection(d, 15.00, 22.50) },
  { id: 'ts-score-4', time: 22.50, play: (d) => soundEngine.playTrickShotScoreSection(d, 22.50, 30.00) },
  { id: 'ts-score-5', time: 30.00, play: (d) => soundEngine.playTrickShotScoreSection(d, 30.00, 37.50) },
  { id: 'ts-score-6', time: 37.50, play: (d) => soundEngine.playTrickShotScoreSection(d, 37.50, 45.00) },
  { id: 'ts-score-7', time: 45.00, play: (d) => soundEngine.playTrickShotScoreSection(d, 45.00, 52.50) },
  { id: 'ts-score-8', time: 52.50, play: (d) => soundEngine.playTrickShotScoreSection(d, 52.50, 60.00) },
  { id: 'ts-hoop-fall', time: 0.2, play: (d) => soundEngine.playHoopCrash(d) },
  { id: 'ts-hoop-impact', time: 1.15, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'ts-net', time: 2.2, play: (d) => soundEngine.playArmCrossSqueak(d) },
  { id: 'ts-throw-1', time: 4.4, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ts-base-clank', time: 5.0, play: (d) => soundEngine.playRimClink(d) },
  { id: 'ts-forehead', time: 5.6, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'ts-throw-2', time: 7.2, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ts-wall', time: 8.4, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'ts-bottom', time: 9.4, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'ts-throw-3', time: 10.6, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ts-can-miss', time: 11.6, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'ts-chase', time: 12.4, play: (d) => soundEngine.playFootstep(false, d) },
  { id: 'ts-throw-4', time: 13.8, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ts-bucket-rim', time: 14.2, play: (d) => soundEngine.playRimClink(d) },
  { id: 'ts-head-2', time: 14.9, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'ts-training-wall', time: 17.9, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'ts-training-thud', time: 20.2, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'ts-slip', time: 22.35, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'ts-calendar', time: 23.6, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'ts-target-ding', time: 25.3, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'ts-whistle', time: 26.0, play: (d) => soundEngine.playSqueak(d) },
  { id: 'ts-drama', time: 28.2, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'ts-spin', time: 30.5, play: (d) => soundEngine.playSqueak(d) },
  { id: 'ts-attempt', time: 32.3, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ts-miss', time: 32.9, play: (d) => soundEngine.playRimClink(d) },
  { id: 'ts-breath', time: 35.0, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'ts-impossible-throw', time: 37.4, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ts-impossible-wall', time: 39.3, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'ts-impossible-floor', time: 40.45, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'ts-impossible-board', time: 41.65, play: (d) => soundEngine.playRimClink(d) },
  { id: 'ts-rim-rattle-1', time: 42.6, play: (d) => soundEngine.playRimClink(d) },
  { id: 'ts-rim-rattle-2', time: 44.2, play: (d) => soundEngine.playRimClink(d) },
  { id: 'ts-swish', time: 46.05, play: (d) => soundEngine.playSwish(d) },
  { id: 'ts-crowd-1', time: 46.15, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'ts-crowd-2', time: 47.4, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'ts-trophy', time: 49.9, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'ts-confetti', time: 50.6, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'ts-crowd-3', time: 52.6, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'ts-kiss', time: 56.5, play: (d) => soundEngine.playCalmingChime(d) },
  { id: 'ts-ball-in-trophy', time: 58.05, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'ts-trophy-tip', time: 58.75, play: (d) => soundEngine.playRimClink(d) },
  { id: 'ts-final', time: 59.55, play: (d) => soundEngine.playVictoryFanfare(d) },
];

/**
 * Complete 30-second sound map for "THE PING-PONG REVENGE".
 * Four score sections carry the smug opening, the scheming, the rage and the
 * silent-movie ricochet; the SFX are all tiny cartoon table-top sounds.
 */
export const PING_PONG_CUES: AudioCue[] = [
  { id: 'pp-score-1', time: 0.00, play: (d) => soundEngine.playPingPongScoreSection(d, 0.00, 7.5) },
  { id: 'pp-score-2', time: 7.50, play: (d) => soundEngine.playPingPongScoreSection(d, 7.5, 15.0) },
  { id: 'pp-score-3', time: 15.00, play: (d) => soundEngine.playPingPongScoreSection(d, 15.0, 22.5) },
  { id: 'pp-score-4', time: 22.50, play: (d) => soundEngine.playPingPongScoreSection(d, 22.5, 30.0) },
  { id: 'pp-confident', time: 0.35, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'pp-cup-shine', time: 0.85, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'pp-bounce-1', time: 3.12, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'pp-throw-1', time: 4.05, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pp-wall-1', time: 4.76, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'pp-bonk-1', time: 6.00, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'pp-accuse', time: 7.36, play: (d) => soundEngine.playSqueak(d) },
  { id: 'pp-book-1', time: 8.55, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'pp-book-2', time: 9.05, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'pp-book-3', time: 9.55, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'pp-measure-1', time: 9.95, play: (d) => soundEngine.playCalculatorBeep(d) },
  { id: 'pp-measure-2', time: 10.3, play: (d) => soundEngine.playCalculatorBeep(d) },
  { id: 'pp-measure-3', time: 10.62, play: (d) => soundEngine.playCalculatorBeep(d) },
  { id: 'pp-nod', time: 10.98, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'pp-launch', time: 11.85, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pp-book-top', time: 12.12, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'pp-foot-plop', time: 12.50, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'pp-foot-ouch', time: 12.62, play: (d) => soundEngine.playSqueak(d) },
  { id: 'pp-books-away', time: 13.00, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pp-books-floor', time: 13.45, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'pp-rage-rumble', time: 13.60, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'pp-table-slam', time: 15.42, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'pp-spring-launch', time: 15.62, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pp-ceiling', time: 18.60, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'pp-cup-tip', time: 19.42, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pp-left-wall', time: 19.40, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'pp-lamp', time: 20.20, play: (d) => soundEngine.playLampDing(d) },
  { id: 'pp-table-bounce', time: 20.90, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'pp-cup-land', time: 22.20, play: (d) => soundEngine.playRimClink(d) },
  { id: 'pp-ball-in-cup', time: 22.88, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'pp-magic', time: 23.05, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'pp-fanfare', time: 25.00, play: (d) => soundEngine.playVictoryFanfare(d) },
  { id: 'pp-crowd', time: 25.35, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'pp-pop', time: 26.98, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'pp-bonk-2', time: 27.66, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'pp-cup-slip', time: 28.10, play: (d) => soundEngine.playSqueak(d) },
  { id: 'pp-record-scratch', time: 28.60, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'pp-low-rumble', time: 29.15, play: (d) => soundEngine.playDramaticRumble(d) },
];

/**
 * Complete 30-second sound map for "THE ANGRY STICKMAN VS. THE IMPOSSIBLE
 * COIN FLIP". One list drives both the preview and the export track.
 */
export const COIN_FLIP_CUES: AudioCue[] = [
  { id: 'cf-score-1', time: 0.0, play: (d) => soundEngine.playCoinFlipScoreSection(d, 0, 7.5) },
  { id: 'cf-score-2', time: 7.5, play: (d) => soundEngine.playCoinFlipScoreSection(d, 7.5, 15.0) },
  { id: 'cf-score-3', time: 15.0, play: (d) => soundEngine.playCoinFlipScoreSection(d, 15.0, 22.5) },
  { id: 'cf-score-4', time: 22.5, play: (d) => soundEngine.playCoinFlipScoreSection(d, 22.5, 30.0) },
  { id: 'cf-confident', time: 0.35, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'cf-sparkle', time: 1.2, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'cf-shoulder', time: 0.85, play: (d) => soundEngine.playSqueak(d) },
  { id: 'cf-flick', time: 2.56, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'cf-return', time: 4.12, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'cf-rim', time: 4.62, play: (d) => soundEngine.playRimClink(d) },
  { id: 'cf-bonk', time: 5.35, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'cf-coin-drop', time: 5.86, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'cf-twitch', time: 6.35, play: (d) => soundEngine.playSqueak(d) },
  { id: 'cf-march', time: 7.96, play: (d) => soundEngine.playFootstep(true) },
  { id: 'cf-book-1', time: 8.45, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'cf-book-2', time: 8.95, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'cf-book-3', time: 9.45, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'cf-ruler', time: 10.0, play: (d) => soundEngine.playClipboardTap(d) },
  { id: 'cf-bend-1', time: 10.32, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'cf-bend-2', time: 10.7, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'cf-pick', time: 11.06, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'cf-load', time: 11.52, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'cf-pull', time: 11.7, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'cf-launch', time: 12.04, play: (d) => soundEngine.playLauncherFire(d) },
  { id: 'cf-loop', time: 12.38, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'cf-shoe', time: 13.38, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'cf-clatter', time: 14.2, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'cf-rage', time: 14.15, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'cf-walk-1', time: 14.62, play: (d) => soundEngine.playFootstep(true) },
  { id: 'cf-walk-2', time: 14.84, play: (d) => soundEngine.playFootstep(true) },
  { id: 'cf-walk-3', time: 15.02, play: (d) => soundEngine.playFootstep(true) },
  { id: 'cf-book-chair', time: 14.56, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'cf-growl', time: 15.18, play: (d) => soundEngine.playSqueak(d) },
  { id: 'cf-stomp', time: 15.62, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'cf-breath', time: 16.1, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'cf-windup', time: 16.8, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'cf-throw', time: 17.55, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'cf-clock', time: 19.5, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'cf-lamp', time: 20.35, play: (d) => soundEngine.playLampDing(d) },
  { id: 'cf-lamp-loop', time: 20.55, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'cf-book-bounce', time: 21.85, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'cf-splash', time: 23.45, play: (d) => soundEngine.playWaterSplash(d, 0.85) },
  { id: 'cf-ding', time: 23.58, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'cf-gasp', time: 24.0, play: (d) => soundEngine.playSqueak(d) },
  { id: 'cf-fanfare', time: 25.02, play: (d) => soundEngine.playVictoryFanfare(d) },
  { id: 'cf-crowd', time: 25.35, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'cf-wobble', time: 26.6, play: (d) => soundEngine.playSqueak(d) },
  { id: 'cf-tip', time: 27.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'cf-spill', time: 27.36, play: (d) => soundEngine.playWaterSplash(d, 1.25) },
  { id: 'cf-coin-head', time: 27.58, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'cf-record-scratch', time: 28.05, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'cf-low-rumble', time: 28.4, play: (d) => soundEngine.playDramaticRumble(d) },
];

/**
 * Complete 30-second sound map for "THE ANGRY STICKMAN VS. THE IMPOSSIBLE
 * DART SHOT". One list drives both the preview and the export track.
 */
export const DART_SHOT_CUES: AudioCue[] = [
  { id: 'ds-score-1', time: 0.0, play: (d) => soundEngine.playDartShotScoreSection(d, 0, 7.5) },
  { id: 'ds-score-2', time: 7.5, play: (d) => soundEngine.playDartShotScoreSection(d, 7.5, 15.0) },
  { id: 'ds-score-3', time: 15.0, play: (d) => soundEngine.playDartShotScoreSection(d, 15.0, 22.5) },
  { id: 'ds-score-4', time: 22.5, play: (d) => soundEngine.playDartShotScoreSection(d, 22.5, 30.0) },
  { id: 'ds-confident', time: 0.4, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'ds-sparkle', time: 1.15, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'ds-shoulder', time: 0.9, play: (d) => soundEngine.playSqueak(d) },
  { id: 'ds-throw-1', time: 4.2, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ds-miss', time: 4.85, play: (d) => soundEngine.playDartThunk(d) },
  { id: 'ds-twitch', time: 6.25, play: (d) => soundEngine.playSqueak(d) },
  { id: 'ds-book-1', time: 8.45, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'ds-book-2', time: 8.95, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'ds-book-3', time: 9.45, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'ds-ruler', time: 10.0, play: (d) => soundEngine.playClipboardTap(d) },
  { id: 'ds-bend-1', time: 10.35, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'ds-bend-2', time: 10.75, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'ds-nod', time: 11.15, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'ds-load', time: 11.5, play: (d) => soundEngine.playDartThunk(d) },
  { id: 'ds-pull', time: 11.7, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'ds-launch', time: 12.0, play: (d) => soundEngine.playLauncherFire(d) },
  { id: 'ds-loop', time: 12.34, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ds-head-dart', time: 12.8, play: (d) => soundEngine.playDartThunk(d) },
  { id: 'ds-pull-out', time: 13.15, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'ds-sweep', time: 13.65, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ds-clatter', time: 13.98, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'ds-walk-1', time: 13.98, play: (d) => soundEngine.playFootstep(true) },
  { id: 'ds-walk-2', time: 14.2, play: (d) => soundEngine.playFootstep(true) },
  { id: 'ds-rage', time: 14.15, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'ds-growl', time: 14.9, play: (d) => soundEngine.playSqueak(d) },
  { id: 'ds-stomp', time: 15.45, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'ds-breath', time: 16.1, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'ds-windup', time: 16.9, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ds-throw-2', time: 17.55, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ds-clock', time: 19.35, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'ds-lamp', time: 20.2, play: (d) => soundEngine.playLampDing(d) },
  { id: 'ds-chair', time: 20.78, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'ds-bullseye', time: 23.4, play: (d) => soundEngine.playRimClink(d) },
  { id: 'ds-ding', time: 23.46, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'ds-gasp', time: 23.9, play: (d) => soundEngine.playSqueak(d) },
  { id: 'ds-fanfare', time: 25.02, play: (d) => soundEngine.playVictoryFanfare(d) },
  { id: 'ds-crowd', time: 25.35, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'ds-pluck', time: 25.58, play: (d) => soundEngine.playDartThunk(d) },
  { id: 'ds-flick', time: 25.78, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ds-creak', time: 26.05, play: (d) => soundEngine.playSqueak(d) },
  { id: 'ds-bonk', time: 26.85, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'ds-step', time: 27.8, play: (d) => soundEngine.playFootstep(true) },
  { id: 'ds-bump', time: 27.98, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'ds-record-scratch', time: 28.1, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'ds-low-rumble', time: 28.8, play: (d) => soundEngine.playDramaticRumble(d) },
];

/**
 * Complete 30-second sound map for "THE ANGRY STICKMAN: ROOFTOP PAPER AIRPLANE TRICKSHOT".
 * One list drives both the preview and the export track.
 */
/**
 * Complete 30-second sound map for "THE ANGRY STICKMAN: BOWLING MARBLE TRICKSHOT".
 * One list drives both the preview and the export track.
 */
export const BOWLING_STRIKE_CUES: AudioCue[] = [
  // Background comedy score sections (sliced in 7.5s chunks for export safety)
  { id: 'bs-score-1', time: 0.0, play: (d) => soundEngine.playCoinFlipScoreSection(d, 0, 7.5) },
  { id: 'bs-score-2', time: 7.5, play: (d) => soundEngine.playCoinFlipScoreSection(d, 7.5, 15.0) },
  { id: 'bs-score-3', time: 15.0, play: (d) => soundEngine.playCoinFlipScoreSection(d, 15.0, 22.5) },
  { id: 'bs-score-4', time: 22.5, play: (d) => soundEngine.playCoinFlipScoreSection(d, 22.5, 30.0) },

  // Scene 1: The Challenge (0-5s)
  { id: 'bs-marble-twinkle', time: 0.5, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'bs-confident-ding', time: 1.2, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'bs-point-whoosh', time: 2.2, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'bs-windup-squeak', time: 4.2, play: (d) => soundEngine.playSqueak(d) },

  // Scene 2: Epic Failure (5-9s)
  { id: 'bs-marble-roll-slow', time: 5.2, play: (d) => soundEngine.playMarbleRoll(d) },
  { id: 'bs-slowmo-whistle', time: 6.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'bs-stomp-thump', time: 7.4, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'bs-wind-whoosh', time: 7.8, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'bs-pin-topple-single', time: 8.3, play: (d) => soundEngine.playPinImpact(d, 0.7) },

  // Scene 3: The Invention (9-15s)
  { id: 'bs-rage-growl', time: 9.3, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'bs-build-clank-1', time: 10.4, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'bs-build-clank-2', time: 11.2, play: (d) => soundEngine.playClipboardTap(d) },
  { id: 'bs-spring-boing-1', time: 12.0, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'bs-marble-load', time: 13.0, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'bs-lever-pull', time: 14.1, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'bs-tension-heartbeat', time: 14.6, play: (d) => soundEngine.playHeartbeat(d) },

  // Scene 4: The Perfect Shot (15-22s)
  { id: 'bs-launch-fire', time: 15.02, play: (d) => soundEngine.playLauncherFire(d) },
  { id: 'bs-wall-bonk', time: 15.75, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'bs-pipe-clang', time: 16.7, play: (d) => soundEngine.playRimClink(d) },
  { id: 'bs-lane-zip', time: 17.6, play: (d) => soundEngine.playMarbleRoll(d) },
  { id: 'bs-strike-crash', time: 18.85, play: (d) => soundEngine.playBowlingStrikeCrash(d) },
  { id: 'bs-victory-fanfare', time: 19.8, play: (d) => soundEngine.playVictoryFanfare(d) },
  { id: 'bs-crowd-cheer', time: 20.2, play: (d) => soundEngine.playCrowdCheer(d) },

  // Scene 5: The Revenge of the Pins (22-27s)
  { id: 'bs-bumper-rebound', time: 22.6, play: (d) => soundEngine.playPinImpact(d, 0.9) },
  { id: 'bs-pins-rolling-rumble', time: 23.5, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'bs-pins-rolling-clatter', time: 24.2, play: (d) => soundEngine.playPinImpact(d, 0.6) },
  { id: 'bs-record-scratch', time: 25.1, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'bs-horror-rumble', time: 25.8, play: (d) => soundEngine.playDramaticRumble(d) },

  // Scene 6: The Punchline (27-30s)
  { id: 'bs-pins-pile-crash', time: 27.2, play: (d) => soundEngine.playBowlingStrikeCrash(d) },
  { id: 'bs-marble-roll-out', time: 28.1, play: (d) => soundEngine.playMarbleRoll(d) },
  { id: 'bs-final-pin-dink', time: 28.6, play: (d) => soundEngine.playPinImpact(d, 0.65) },
  { id: 'bs-muffled-scream', time: 28.9, play: (d) => soundEngine.playMuffledScream(d) },
  { id: 'bs-freeze-horn', time: 29.8, play: (d) => soundEngine.playConfidenceDing(d) },
];

export const ROOFTOP_PLANE_CUES: AudioCue[] = [
  // Background comedy score sections (sliced in 7.5s chunks for export safety)
  { id: 'rp-score-1', time: 0.0, play: (d) => soundEngine.playCoinFlipScoreSection(d, 0, 7.5) },
  { id: 'rp-score-2', time: 7.5, play: (d) => soundEngine.playCoinFlipScoreSection(d, 7.5, 15.0) },
  { id: 'rp-score-3', time: 15.0, play: (d) => soundEngine.playCoinFlipScoreSection(d, 15.0, 22.5) },
  { id: 'rp-score-4', time: 22.5, play: (d) => soundEngine.playCoinFlipScoreSection(d, 22.5, 30.0) },

  // Scene 1: Rooftop wind, confident stance, throw & wall smack
  { id: 'rp-wind-open', time: 0.2, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rp-confident', time: 0.8, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'rp-throw-1', time: 2.65, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rp-wall-smack', time: 3.52, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'rp-wall-flop', time: 3.75, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'rp-squeak-twitch', time: 4.3, play: (d) => soundEngine.playSqueak(d) },

  // Scene 2: Second plane, AC bounce, orbit, coffee cup landing, angry throw
  { id: 'rp-plane2-pull', time: 5.2, play: (d) => soundEngine.playClipboardTap(d) },
  { id: 'rp-throw-2', time: 5.85, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rp-ac-boing', time: 6.62, play: (d) => soundEngine.playRimClink(d) },
  { id: 'rp-orbit-whoosh', time: 7.25, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rp-cup1-plop', time: 7.92, play: (d) => soundEngine.playCoffeeDrip(d) },
  { id: 'rp-glare-squeak', time: 8.4, play: (d) => soundEngine.playSqueak(d) },
  { id: 'rp-cup-throw', time: 9.25, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rp-cup-crash', time: 9.85, play: (d) => soundEngine.playFloorThump(d) },

  // Scene 3: Crazy idea, building launcher, loading & tension
  { id: 'rp-idea-ding', time: 10.25, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'rp-mop-cone-1', time: 11.35, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'rp-mop-cone-2', time: 12.15, play: (d) => soundEngine.playClipboardTap(d) },
  { id: 'rp-bands-twang', time: 12.85, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'rp-load-click', time: 13.55, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'rp-pull-stretch', time: 14.1, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'rp-heartbeat-1', time: 14.8, play: (d) => soundEngine.playHeartbeat(d) },
  { id: 'rp-heartbeat-2', time: 15.5, play: (d) => soundEngine.playHeartbeat(d) },

  // Scene 4: Incredible launch, obstacle ricochets, tiny window swish, wild celebration
  { id: 'rp-launch-blast', time: 16.02, play: (d) => soundEngine.playLauncherFire(d) },
  { id: 'rp-gap-whoosh', time: 16.9, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rp-tank-curve', time: 18.2, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rp-dish-boing', time: 19.45, play: (d) => soundEngine.playRimClink(d) },
  { id: 'rp-dish-shimmer', time: 19.6, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'rp-window-swish', time: 20.85, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'rp-fanfare', time: 21.6, play: (d) => soundEngine.playVictoryFanfare(d) },
  { id: 'rp-cheer', time: 21.9, play: (d) => soundEngine.playCrowdCheer(d) },

  // Scene 5: Reveal cup landing, panel teeter, catapult catapulting cup into air, horror turn
  { id: 'rp-cup2-dock', time: 23.85, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'rp-panel-creak', time: 24.6, play: (d) => soundEngine.playSqueak(d) },
  { id: 'rp-panel-launch', time: 25.35, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'rp-cup-flying', time: 25.6, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rp-horror-rumble', time: 26.25, play: (d) => soundEngine.playDramaticRumble(d) },

  // Scene 6: Cup drops upside down on head, plane docks, triumph, drip, rage scream & freeze
  { id: 'rp-cup-head-bonk', time: 27.28, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'rp-plane-dock', time: 27.75, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'rp-triumph-chime', time: 28.1, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'rp-coffee-drip-1', time: 28.75, play: (d) => soundEngine.playCoffeeDrip(d) },
  { id: 'rp-coffee-drip-2', time: 29.1, play: (d) => soundEngine.playCoffeeDrip(d) },
  { id: 'rp-angry-scream', time: 29.42, play: (d) => soundEngine.playAngryScream(d) },
  { id: 'rp-freeze-hit', time: 29.82, play: (d) => soundEngine.playRecordScratch(d) },
];

