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
 * Complete 30-second sound map for "Angry Stickman: Mind Traps & The Red Cage".
 * Drives both preview and video export.
 */
export const MIND_TRAPS_CUES: AudioCue[] = [
  { id: 'mt-rumble-open', time: 0.2, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'mt-cage-creak', time: 1.2, play: (d) => soundEngine.playSqueak(d) },
  { id: 'mt-heart-1', time: 2.2, play: (d) => soundEngine.playHeartbeat(d) },
  { id: 'mt-heart-2', time: 3.4, play: (d) => soundEngine.playHeartbeat(d) },
  { id: 'mt-meter-tick-1', time: 5.2, play: (d) => soundEngine.playClipboardTap(d) },
  { id: 'mt-meter-tick-2', time: 6.2, play: (d) => soundEngine.playClipboardTap(d) },
  { id: 'mt-meter-tick-3', time: 7.2, play: (d) => soundEngine.playClipboardTap(d) },
  { id: 'mt-alarm', time: 8.4, play: (d) => soundEngine.playCalculatorBeep(d) },
  { id: 'mt-steam', time: 9.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'mt-stomp', time: 10.4, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'mt-gavel-windup', time: 12.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'mt-gavel-slam', time: 12.8, play: (d) => soundEngine.playTrashCrash(d) },
  { id: 'mt-column-crack', time: 13.0, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'mt-step-1', time: 16.2, play: (d) => soundEngine.playFootstep(false) },
  { id: 'mt-step-2', time: 16.7, play: (d) => soundEngine.playFootstep(false) },
  { id: 'mt-calc-ding', time: 17.8, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'mt-leap', time: 18.5, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'mt-land', time: 19.8, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'mt-swing-whoosh', time: 22.4, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'mt-shatter', time: 23.2, play: (d) => soundEngine.playTrashCrash(d) },
  { id: 'mt-rumble-end', time: 23.6, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'mt-clarity-chime', time: 26.6, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'mt-thumbs-sparkle', time: 28.5, play: (d) => soundEngine.playMicSparkle(d) },
];

/**
 * Complete 30-second sound map for "THE ANGRY STICKMAN: THE IMPOSSIBLE
 * CLAW MACHINE". One list drives both the preview and the export track;
 * the chiptune score is scheduled in four 7.5-second slices.
 */
export const ARCADE_CLAW_CUES: AudioCue[] = [
  { id: 'ac-score-1', time: 0.0, play: (d) => soundEngine.playArcadeClawScoreSection(d, 0, 7.5) },
  { id: 'ac-score-2', time: 7.5, play: (d) => soundEngine.playArcadeClawScoreSection(d, 7.5, 15.0) },
  { id: 'ac-score-3', time: 15.0, play: (d) => soundEngine.playArcadeClawScoreSection(d, 15.0, 22.5) },
  { id: 'ac-score-4', time: 22.5, play: (d) => soundEngine.playArcadeClawScoreSection(d, 22.5, 30.0) },
  // Scene 1 - the challenge (0-5): coin, chime, button, claw motor.
  { id: 'ac-sparkle', time: 1.6, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'ac-coin-up', time: 2.1, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'ac-slot', time: 2.45, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'ac-chime', time: 2.62, play: (d) => soundEngine.playArcadeChime(d) },
  { id: 'ac-beep', time: 3.15, play: (d) => soundEngine.playCalculatorBeep(d) },
  { id: 'ac-button', time: 3.3, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'ac-motor-1', time: 3.6, play: (d) => soundEngine.playClawMotor(d, 1.4) },
  // Scene 2 - the drop (5-9): grip, lift, squeak, trombone, thud, twitch.
  { id: 'ac-grip', time: 5.1, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'ac-lift', time: 5.8, play: (d) => soundEngine.playClawMotor(d, 1.3) },
  { id: 'ac-strain', time: 7.12, play: (d) => soundEngine.playSqueak(d) },
  { id: 'ac-open', time: 7.48, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'ac-trombone', time: 7.85, play: (d) => soundEngine.playSadTrombone(d) },
  { id: 'ac-thud', time: 8.28, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'ac-twitch', time: 8.6, play: (d) => soundEngine.playSqueak(d) },
  // Scene 3 - the invention (9-15): rage, clanks and thuds of the build.
  { id: 'ac-growl', time: 9.05, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'ac-knuckle', time: 9.5, play: (d) => soundEngine.playKnuckleCrack(d) },
  { id: 'ac-cab-1', time: 10.05, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'ac-cab-2', time: 10.6, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'ac-ramp', time: 11.5, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'ac-ramp-tap', time: 11.85, play: (d) => soundEngine.playClipboardTap(d) },
  { id: 'ac-drag', time: 12.4, play: (d) => soundEngine.playSqueak(d) },
  { id: 'ac-bumper', time: 12.95, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'ac-stop-1', time: 13.2, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'ac-stop-2', time: 13.6, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'ac-ball', time: 14.3, play: (d) => soundEngine.playBasketballBounce(d) },
  { id: 'ac-aim', time: 14.78, play: (d) => soundEngine.playConfidenceDing(d) },
  // Scene 4 - the impossible shot (15-22): launch, boing, ricochet, sting.
  { id: 'ac-launch', time: 15.02, play: (d) => soundEngine.playLauncherFire(d) },
  { id: 'ac-boing', time: 15.57, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'ac-ricochet', time: 16.07, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'ac-whoosh-1', time: 16.9, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ac-whoosh-2', time: 17.9, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ac-slam', time: 18.62, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'ac-confirm', time: 18.95, play: (d) => soundEngine.playCalculatorBeep(d) },
  { id: 'ac-power-on', time: 19.42, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'ac-jingle', time: 19.62, play: (d) => soundEngine.playArcadeWinJingle(d) },
  { id: 'ac-motor-2', time: 20.35, play: (d) => soundEngine.playClawMotor(d, 1.4) },
  { id: 'ac-grab-2', time: 21.05, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'ac-motor-3', time: 21.55, play: (d) => soundEngine.playClawMotor(d, 1.1) },
  // Scene 5 - the victory (22-26): deposit, fanfare, cheer, dance, rattle.
  { id: 'ac-release', time: 22.58, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'ac-deposit', time: 23.18, play: (d) => soundEngine.playDeskPlop(d) },
  { id: 'ac-fanfare', time: 23.45, play: (d) => soundEngine.playVictoryFanfare(d) },
  { id: 'ac-crowd', time: 23.78, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'ac-hop', time: 24.45, play: (d) => soundEngine.playFootstep(true) },
  { id: 'ac-reach', time: 24.95, play: (d) => soundEngine.playSqueak(d) },
  { id: 'ac-rattle', time: 25.55, play: (d) => soundEngine.playDramaticRumble(d) },
  // Scene 6 - the avalanche (26-30): alarm, plush rush, coin ding, freeze.
  { id: 'ac-alarm', time: 26.05, play: (d) => soundEngine.playArcadeAlarm(d) },
  { id: 'ac-avalanche', time: 26.55, play: (d) => soundEngine.playPlushAvalanche(d) },
  { id: 'ac-alarm-2', time: 27.15, play: (d) => soundEngine.playArcadeAlarm(d) },
  { id: 'ac-coin-end', time: 29.15, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'ac-freeze', time: 29.55, play: (d) => soundEngine.playRecordScratch(d) },
];

/**
 * Complete 30-second sound map for "THE ANGRY STICKMAN: THE IMPOSSIBLE
 * DIAMOND HEIST". One list drives both the preview and the export track;
 * the score is scheduled in four 7.5-second slices with silence windows.
 */
export const DIAMOND_HEIST_CUES: AudioCue[] = [
  // Score slices
  { id: 'dh-score-1', time: 0.0, play: (d) => soundEngine.playDiamondHeistScoreSection(d, 0, 7.5) },
  { id: 'dh-score-2', time: 7.5, play: (d) => soundEngine.playDiamondHeistScoreSection(d, 7.5, 15.0) },
  { id: 'dh-score-3', time: 15.0, play: (d) => soundEngine.playDiamondHeistScoreSection(d, 15.0, 22.5) },
  { id: 'dh-score-4', time: 22.5, play: (d) => soundEngine.playDiamondHeistScoreSection(d, 22.5, 30.0) },

  // Scene 1 - the heist begins (0-5): sneaky pizzicato, diamond chime, spoon draw
  { id: 'dh-chime', time: 1.0, play: (d) => soundEngine.playDiamondChime(d) },
  { id: 'dh-spoon-draw', time: 2.0, play: (d) => soundEngine.playSpoonDraw(d) },

  // Scene 2 - the alarm (5-9): laser zap, siren, cough
  { id: 'dh-laser', time: 6.5, play: (d) => soundEngine.playLaserZap(d) },
  { id: 'dh-siren', time: 6.5, play: (d) => soundEngine.playAlarmSiren(d, 3.5) },
  { id: 'dh-cough', time: 8.5, play: (d) => soundEngine.playAwkwardCough(d) },

  // Scene 3 - the setup (9-15): rage growl, record scratch, idea ding, bucket/tray clatter
  { id: 'dh-growl', time: 9.0, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'dh-record-scratch', time: 12.0, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'dh-idea-ding', time: 13.0, play: (d) => soundEngine.playIdeaDing(d) },
  { id: 'dh-bucket', time: 10.5, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'dh-tray', time: 11.5, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'dh-mop', time: 12.5, play: (d) => soundEngine.playFloorThump(d) },

  // Scene 4 - the impossible shot (15-22): flick, tray ping, wall boing, button click, case open
  { id: 'dh-flick', time: 15.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'dh-tray-ping', time: 15.5, play: (d) => soundEngine.playTrayPing(d) },
  { id: 'dh-wall-boing', time: 16.2, play: (d) => soundEngine.playWallBoing(d) },
  { id: 'dh-button', time: 19.5, play: (d) => soundEngine.playButtonClick(d) },
  { id: 'dh-case-open', time: 19.6, play: (d) => soundEngine.playCaseOpen(d) },
  { id: 'dh-success-sting', time: 20.5, play: (d) => soundEngine.playConfidenceDing(d) },

  // Scene 5 - the victory (22-26): scoop, alarms cut, angelic choir, fanfare
  { id: 'dh-scoop', time: 22.5, play: (d) => soundEngine.playScoop(d) },
  { id: 'dh-choir', time: 24.0, play: (d) => soundEngine.playAngelicChoir(d) },
  { id: 'dh-fanfare', time: 24.5, play: (d) => soundEngine.playVictoryFanfareShort(d) },
  { id: 'dh-celebrate-1', time: 25.0, play: (d) => soundEngine.playFootstep(true, d) },
  { id: 'dh-celebrate-2', time: 25.4, play: (d) => soundEngine.playFootstep(true, d) },

  // Scene 6 - the trap (26-30): glass clunk, camera clicks, muffled scream, freeze sting
  { id: 'dh-glass-clunk', time: 26.5, play: (d) => soundEngine.playGlassClunk(d) },
  { id: 'dh-camera-1', time: 27.5, play: (d) => soundEngine.playCameraClick(d) },
  { id: 'dh-camera-2', time: 27.75, play: (d) => soundEngine.playCameraClick(d) },
  { id: 'dh-camera-3', time: 28.0, play: (d) => soundEngine.playCameraClick(d) },
  { id: 'dh-camera-4', time: 28.25, play: (d) => soundEngine.playCameraClick(d) },
  { id: 'dh-camera-5', time: 28.5, play: (d) => soundEngine.playCameraClick(d) },
  { id: 'dh-camera-6', time: 28.75, play: (d) => soundEngine.playCameraClick(d) },
  { id: 'dh-scream', time: 29.0, play: (d) => soundEngine.playMuffledScream(d) },
  { id: 'dh-freeze', time: 29.5, play: (d) => soundEngine.playFreezeSting(d) },
];

/**
 * Complete 30-second sound map for "The Perfect Pancake Flip".
 * Four 7.5s slices of the bouncy score plus one-shot SFX.
 */
export const PANCAKE_FLIP_CUES: AudioCue[] = [
  // Score slices
  { id: 'pf-score-1', time: 0.0, play: (d) => soundEngine.playPancakeScoreSection(d, 0, 7.5) },
  { id: 'pf-score-2', time: 7.5, play: (d) => soundEngine.playPancakeScoreSection(d, 7.5, 15.0) },
  { id: 'pf-score-3', time: 15.0, play: (d) => soundEngine.playPancakeScoreSection(d, 15.0, 22.5) },
  { id: 'pf-score-4', time: 22.5, play: (d) => soundEngine.playPancakeScoreSection(d, 22.5, 30.0) },

  // Shot 1 - the hook (0-2)
  { id: 'pf-whoosh', time: 0.05, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pf-freeze', time: 0.9, play: (d) => soundEngine.playRecordScratch(d) },

  // Shot 2 - first failure (2-6): swoosh, boing, ceiling splat
  { id: 'pf-pan-swoosh', time: 2.6, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pf-boing', time: 3.1, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'pf-ceiling-splat', time: 3.6, play: (d) => soundEngine.playPancakeSplat(d) },
  { id: 'pf-scratch', time: 4.4, play: (d) => soundEngine.playRecordScratch(d) },

  // Shot 3 - the plan (6-10): ding, wood clack
  { id: 'pf-idea', time: 7.2, play: (d) => soundEngine.playIdeaDing(d) },
  { id: 'pf-wood-clack', time: 8.2, play: (d) => soundEngine.playWoodClack(d) },

  // Shot 4 - second failure (10-13): slide, flop, trombone, glare
  { id: 'pf-slide-1', time: 11.3, play: (d) => soundEngine.playPancakeSlide(d, 0.6) },
  { id: 'pf-flop', time: 12.0, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'pf-trombone-1', time: 12.3, play: (d) => soundEngine.playSadTrombone(d) },

  // Shot 5A - final launch (13-16): knuckles, breath, launch, whistle
  { id: 'pf-knuckles', time: 13.3, play: (d) => soundEngine.playKnuckleCrack(d) },
  { id: 'pf-breath', time: 13.8, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'pf-launch', time: 14.5, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pf-slide-2', time: 14.7, play: (d) => soundEngine.playPancakeSlide(d, 0.8) },

  // Shot 5B - perfect landing (16-19): sparkle, plate clink
  { id: 'pf-sparkle', time: 18.2, play: (d) => soundEngine.playMicSparkle(d) },
  { id: 'pf-plate-clink', time: 18.4, play: (d) => soundEngine.playPlateClink(d) },

  // Shot 6 - champion (19-23): fanfare, confetti, cheer
  { id: 'pf-fanfare', time: 19.8, play: (d) => soundEngine.playVictoryFanfareShort(d) },
  { id: 'pf-confetti', time: 20.6, play: (d) => soundEngine.playConfettiPop(d) },
  { id: 'pf-cheer', time: 21.0, play: (d) => soundEngine.playCrowdCheer(d) },

  // Shot 7 - pancake revenge (23-29): bump, wet splat, sticky slide, sting
  { id: 'pf-bump', time: 23.4, play: (d) => soundEngine.playCounterBump(d) },
  { id: 'pf-wet-splat', time: 24.8, play: (d) => soundEngine.playWetSplat(d) },
  { id: 'pf-sticky-slide', time: 25.4, play: (d) => soundEngine.playPancakeSlide(d, 1.6) },
  { id: 'pf-angry-sting', time: 27.4, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 8 - final gag (29-30): tiny trombone, then silence
  { id: 'pf-trombone-2', time: 29.1, play: (d) => soundEngine.playSadTrombone(d) },
];

/**
 * Complete 30-second sound map for "The Vending Machine Revenge".
 * Four 7.5s slices of the bouncy score plus one-shot SFX.
 */
export const VENDING_MACHINE_CUES: AudioCue[] = [
  // Score slices
  { id: 'vm-score-1', time: 0.0, play: (d) => soundEngine.playVendingScoreSection(d, 0, 7.5) },
  { id: 'vm-score-2', time: 7.5, play: (d) => soundEngine.playVendingScoreSection(d, 7.5, 15.0) },
  { id: 'vm-score-3', time: 15.0, play: (d) => soundEngine.playVendingScoreSection(d, 15.0, 22.5) },
  { id: 'vm-score-4', time: 22.5, play: (d) => soundEngine.playVendingScoreSection(d, 22.5, 30.0) },

  // Shot 1 - the hook (0-2)
  { id: 'vm-whoosh', time: 0.05, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'vm-freeze', time: 0.9, play: (d) => soundEngine.playRecordScratch(d) },

  // Shot 2 - the shake (2-6)
  { id: 'vm-rattle', time: 2.6, play: (d) => soundEngine.playVendingRattle(d, 1.7) },
  { id: 'vm-boing', time: 4.3, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'vm-scratch-1', time: 4.8, play: (d) => soundEngine.playRecordScratch(d) },

  // Shot 3 - second coin (6-10)
  { id: 'vm-coin', time: 7.7, play: (d) => soundEngine.playCoinClink(d) },
  { id: 'vm-spiral', time: 7.8, play: (d) => soundEngine.playSpiralWhirr(d) },
  { id: 'vm-thud-1', time: 8.5, play: (d) => soundEngine.playVendingThud(d) },
  { id: 'vm-scratch-2', time: 9.0, play: (d) => soundEngine.playRecordScratch(d) },

  // Shot 4 - the broom (10-14)
  { id: 'vm-idea', time: 10.8, play: (d) => soundEngine.playIdeaDing(d) },
  { id: 'vm-scrape', time: 11.6, play: (d) => soundEngine.playBroomScrape(d) },
  { id: 'vm-tug', time: 12.6, play: (d) => soundEngine.playStrainedTug(d) },
  { id: 'vm-trombone-1', time: 13.4, play: (d) => soundEngine.playSadTrombone(d) },

  // Shot 5 - flying kick (14-19)
  { id: 'vm-step-1', time: 14.9, play: (d) => soundEngine.playFootstep(false, d) },
  { id: 'vm-step-2', time: 15.2, play: (d) => soundEngine.playFootstep(false, d) },
  { id: 'vm-step-3', time: 15.5, play: (d) => soundEngine.playFootstep(false, d) },
  { id: 'vm-whistle', time: 16.0, play: (d) => soundEngine.playRisingWhistle(d, 2.2) },
  { id: 'vm-impact', time: 18.35, play: (d) => soundEngine.playBigImpact(d) },

  // Shot 6 - celebration (19-23)
  { id: 'vm-thud-2a', time: 19.3, play: (d) => soundEngine.playVendingThud(d) },
  { id: 'vm-thud-2b', time: 19.48, play: (d) => soundEngine.playVendingThud(d) },
  { id: 'vm-fanfare', time: 19.8, play: (d) => soundEngine.playVictoryFanfareShort(d) },
  { id: 'vm-confetti', time: 21.2, play: (d) => soundEngine.playConfettiPop(d) },
  { id: 'vm-cheer', time: 21.5, play: (d) => soundEngine.playCrowdCheer(d) },

  // Shot 7 - punchline (23-29)
  { id: 'vm-bag-rip', time: 23.5, play: (d) => soundEngine.playBagRip(d) },
  { id: 'vm-air-puff', time: 24.2, play: (d) => soundEngine.playAirPuff(d) },
  { id: 'vm-chip-tink', time: 26.7, play: (d) => soundEngine.playTinyChipTink(d) },
  { id: 'vm-angry', time: 27.6, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 8 - end frame (29-30)
  { id: 'vm-trombone-2', time: 29.1, play: (d) => soundEngine.playSadTrombone(d) },
];

/**
 * Complete 30-second sound map for "The Biggest Balloon".
 * Four 7.5s slices of the bouncy score (a music drop for the shot 3 fake-out
 * and a silence after the last trombone) plus one-shot SFX.
 */
export const BIGGEST_BALLOON_CUES: AudioCue[] = [
  // Score slices
  { id: 'bb-score-1', time: 0.0, play: (d) => soundEngine.playBalloonScoreSection(d, 0, 7.5) },
  { id: 'bb-score-2', time: 7.5, play: (d) => soundEngine.playBalloonScoreSection(d, 7.5, 15.0) },
  { id: 'bb-score-3', time: 15.0, play: (d) => soundEngine.playBalloonScoreSection(d, 15.0, 22.5) },
  { id: 'bb-score-4', time: 22.5, play: (d) => soundEngine.playBalloonScoreSection(d, 22.5, 30.0) },

  // Shot 1 - the hook (0-2)
  { id: 'bb-whoosh', time: 0.05, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'bb-freeze', time: 0.9, play: (d) => soundEngine.playRecordScratch(d) },

  // Shot 2 - size medium (2-6)
  { id: 'bb-breath', time: 2.15, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'bb-squeak-1', time: 2.8, play: (d) => soundEngine.playBalloonSqueak(0.9, d) },
  { id: 'bb-squeak-2', time: 3.25, play: (d) => soundEngine.playBalloonSqueak(1.1, d) },
  { id: 'bb-squeak-3', time: 3.7, play: (d) => soundEngine.playBalloonSqueak(0.95, d) },
  { id: 'bb-squeak-4', time: 4.1, play: (d) => soundEngine.playBalloonSqueak(1.2, d) },
  { id: 'bb-chime', time: 4.6, play: (d) => soundEngine.playCalmingChime(d) },

  // Shot 3 - the fake-out (6-10)
  { id: 'bb-stretch-1', time: 6.3, play: (d) => soundEngine.playBalloonStretch(d) },
  { id: 'bb-stretch-2', time: 7.1, play: (d) => soundEngine.playBalloonStretch(d) },
  { id: 'bb-drum', time: 7.5, play: (d) => soundEngine.playDramaticRumble(d) },
  // 8.0-9.2: held breath (the score drops out here)
  { id: 'bb-sigh', time: 9.4, play: (d) => soundEngine.playRelievedSigh(d) },

  // Shot 4 - size giant (10-14)
  { id: 'bb-stretch-3', time: 10.3, play: (d) => soundEngine.playBalloonStretch(d) },
  { id: 'bb-stretch-4', time: 11.0, play: (d) => soundEngine.playBalloonStretch(d) },
  { id: 'bb-knot', time: 12.2, play: (d) => soundEngine.playKnotSnap(d) },
  { id: 'bb-fanfare', time: 12.8, play: (d) => soundEngine.playVictoryFanfareShort(d) },

  // Shot 5 - uh oh (14-18)
  { id: 'bb-gust-1', time: 14.2, play: (d) => soundEngine.playWindGust(d, 1.6) },
  { id: 'bb-whistle', time: 15.0, play: (d) => soundEngine.playRisingWhistle(d, 1.4) },
  { id: 'bb-scratch-1', time: 16.4, play: (d) => soundEngine.playRecordScratch(d) },

  // Shot 6 - this is fine (18-22)
  { id: 'bb-calm', time: 18.4, play: (d) => soundEngine.playCalmingChime(d) },
  { id: 'bb-gust-2', time: 19.6, play: (d) => soundEngine.playWindGust(d, 1.8) },
  { id: 'bb-sting', time: 21.8, play: (d) => soundEngine.playFreezeSting(d) },

  // Shot 7 - the anti-pop (22-27)
  { id: 'bb-spot', time: 22.2, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'bb-poke', time: 23.3, play: (d) => soundEngine.playNeedlePoke(d) },
  { id: 'bb-release', time: 23.5, play: (d) => soundEngine.playAirRelease(d, 2.9) },
  { id: 'bb-whirl', time: 24.4, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'bb-boing', time: 25.4, play: (d) => soundEngine.playCartoonBoing(d) },

  // Shot 8 - end frame (27-30)
  { id: 'bb-trombone', time: 27.4, play: (d) => soundEngine.playSadTrombone(d) },
  { id: 'bb-final-squeak', time: 28.6, play: (d) => soundEngine.playBalloonSqueak(1.5, d) },
];

/**
 * Complete 30-second sound map for "Find the Ball".
 * Four 7.5s slices of the playful magic-show score (a music dip for the empty
 * middle-cup reveal and a silence after the final trombone) plus one-shot SFX.
 */
export const FIND_THE_BALL_CUES: AudioCue[] = [
  // Score slices
  { id: 'fb-score-1', time: 0.0, play: (d) => soundEngine.playFindTheBallScoreSection(d, 0, 7.5) },
  { id: 'fb-score-2', time: 7.5, play: (d) => soundEngine.playFindTheBallScoreSection(d, 7.5, 15.0) },
  { id: 'fb-score-3', time: 15.0, play: (d) => soundEngine.playFindTheBallScoreSection(d, 15.0, 22.5) },
  { id: 'fb-score-4', time: 22.5, play: (d) => soundEngine.playFindTheBallScoreSection(d, 22.5, 30.0) },

  // Shot 1 - the hook (0-2)
  { id: 'fb-whoosh', time: 0.05, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'fb-freeze', time: 0.9, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'fb-sparkle-1', time: 0.95, play: (d) => soundEngine.playMagicSparkle(d) },

  // Shot 2 - the setup (2-6)
  { id: 'fb-lift-1', time: 2.5, play: (d) => soundEngine.playCupClunk(d) },
  { id: 'fb-sparkle-2', time: 3.05, play: (d) => soundEngine.playMagicSparkle(d) },
  { id: 'fb-clunk-1', time: 4.0, play: (d) => soundEngine.playCupClunk(d) },
  { id: 'fb-sparkle-3', time: 4.15, play: (d) => soundEngine.playMagicSparkle(d) },

  // Shot 3 - slow shuffle (6-10)
  { id: 'fb-slide-1', time: 6.4, play: (d) => soundEngine.playCupSlide(d, 0.85) },
  { id: 'fb-slide-2', time: 7.7, play: (d) => soundEngine.playCupSlide(d, 0.85) },

  // Shot 4 - fast shuffle (10-15)
  { id: 'fb-slide-3', time: 10.6, play: (d) => soundEngine.playCupSlide(d, 0.5) },
  { id: 'fb-slide-4', time: 11.3, play: (d) => soundEngine.playCupSlide(d, 0.5) },
  { id: 'fb-slide-5', time: 12.0, play: (d) => soundEngine.playCupSlide(d, 0.5) },
  { id: 'fb-slide-6', time: 12.7, play: (d) => soundEngine.playCupSlide(d, 0.5) },
  { id: 'fb-ball-roll-1', time: 11.4, play: (d) => soundEngine.playBallRoll(d, 1.6) },
  { id: 'fb-flourish', time: 13.25, play: (d) => soundEngine.playMagicSparkle(d) },

  // Shot 5 - pick a cup (15-19)
  { id: 'fb-slap', time: 15.0, play: (d) => soundEngine.playVendingThud(d) },
  { id: 'fb-drum-roll', time: 15.35, play: (d) => soundEngine.playDrumRoll(d, 3.2) },
  { id: 'fb-beep-3', time: 16.6, play: (d) => soundEngine.playCountBeep(d, 1.0) },
  { id: 'fb-beep-2', time: 17.4, play: (d) => soundEngine.playCountBeep(d, 1.12) },
  { id: 'fb-beep-1', time: 18.2, play: (d) => soundEngine.playCountBeep(d, 1.26) },

  // Shot 6 - two empty cups (19-22)
  { id: 'fb-lift-2', time: 19.0, play: (d) => soundEngine.playCupClunk(d) },
  { id: 'fb-clunk-2', time: 19.85, play: (d) => soundEngine.playCupClunk(d) },
  { id: 'fb-lift-3', time: 20.3, play: (d) => soundEngine.playCupClunk(d) },
  { id: 'fb-wah-wah', time: 20.85, play: (d) => soundEngine.playSadTrombone(d) },
  { id: 'fb-clunk-3', time: 21.25, play: (d) => soundEngine.playCupClunk(d) },
  { id: 'fb-scratch-1', time: 21.55, play: (d) => soundEngine.playRecordScratch(d) },

  // Shot 7 - the real answer (22-27)
  { id: 'fb-lift-4', time: 22.05, play: (d) => soundEngine.playCupClunk(d) },
  { id: 'fb-scratch-2', time: 22.5, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'fb-clunk-4', time: 22.95, play: (d) => soundEngine.playCupClunk(d) },
  { id: 'fb-frantic-1', time: 23.25, play: (d) => soundEngine.playCupClunk(d) },
  { id: 'fb-frantic-2', time: 23.7, play: (d) => soundEngine.playCupClunk(d) },
  { id: 'fb-frantic-3', time: 24.05, play: (d) => soundEngine.playCupClunk(d) },
  { id: 'fb-ball-roll-2', time: 24.95, play: (d) => soundEngine.playBallRoll(d, 0.6) },
  { id: 'fb-sting', time: 25.8, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 8 - end frame (27-30)
  { id: 'fb-trombone', time: 27.4, play: (d) => soundEngine.playSadTrombone(d) },
];

/**
 * Complete 30-second sound map for "Attempt #247".
 * Four 7.5s slices of the sports-highlight score (the music dips for the rim
 * spin, cuts on the reveal and goes silent after the last trombone) plus the
 * one-shot SFX.
 */
export const ATTEMPT_247_CUES: AudioCue[] = [
  // Score slices
  { id: 'a247-score-1', time: 0.0, play: (d) => soundEngine.playAttempt247ScoreSection(d, 0, 7.5) },
  { id: 'a247-score-2', time: 7.5, play: (d) => soundEngine.playAttempt247ScoreSection(d, 7.5, 15.0) },
  { id: 'a247-score-3', time: 15.0, play: (d) => soundEngine.playAttempt247ScoreSection(d, 15.0, 22.5) },
  { id: 'a247-score-4', time: 22.5, play: (d) => soundEngine.playAttempt247ScoreSection(d, 22.5, 30.0) },

  // Shot 1 - the hook (0-2)
  { id: 'a247-whoosh-1', time: 0.05, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'a247-freeze', time: 0.9, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'a247-sting-1', time: 0.92, play: (d) => soundEngine.playBigImpact(d) },

  // Shot 2 - the easy shot (2-6)
  { id: 'a247-throw-1', time: 3.02, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'a247-rim-1', time: 3.66, play: (d) => soundEngine.playRimClink(d) },
  { id: 'a247-floor-1', time: 4.33, play: (d) => soundEngine.playPaperSlap(d) },
  { id: 'a247-wah-1', time: 4.6, play: (d) => soundEngine.playSadTrombone(d) },

  // Shot 3 - the doorway shot (6-10)
  { id: 'a247-step-1', time: 6.1, play: (d) => soundEngine.playFootstep(false, d) },
  { id: 'a247-step-2', time: 6.45, play: (d) => soundEngine.playFootstep(false, d) },
  { id: 'a247-step-3', time: 6.8, play: (d) => soundEngine.playFootstep(false, d) },
  { id: 'a247-step-4', time: 7.1, play: (d) => soundEngine.playFootstep(false, d) },
  { id: 'a247-throw-2', time: 7.78, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'a247-fan', time: 8.42, play: (d) => soundEngine.playFanTink(d) },
  { id: 'a247-plop-head', time: 8.93, play: (d) => soundEngine.playPaperSlap(d) },
  { id: 'a247-boing-1', time: 8.96, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'a247-scratch-1', time: 9.64, play: (d) => soundEngine.playRecordScratch(d) },

  // Shot 4 - the no-look shot (10-14)
  { id: 'a247-crumple-1', time: 10.02, play: (d) => soundEngine.playPaperCrumple(d) },
  { id: 'a247-throw-3', time: 10.95, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'a247-window', time: 11.32, play: (d) => soundEngine.playWindowKnock(d) },
  { id: 'a247-floor-2', time: 12.06, play: (d) => soundEngine.playPaperSlap(d) },
  { id: 'a247-scratch-2', time: 13.15, play: (d) => soundEngine.playRecordScratch(d) },

  // Shot 5 - the plan (14-18)
  { id: 'a247-idea', time: 14.0, play: (d) => soundEngine.playIdeaDing(d) },
  { id: 'a247-sparkle-1', time: 14.06, play: (d) => soundEngine.playMagicSparkle(d) },
  { id: 'a247-crumple-2', time: 15.2, play: (d) => soundEngine.playPaperCrumple(d) },
  { id: 'a247-knuckles', time: 17.0, play: (d) => soundEngine.playKnuckleCrack(d) },

  // Shot 6 - the impossible bank shot (18-22)
  { id: 'a247-throw-4', time: 18.32, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'a247-wall', time: 19.0, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'a247-ceiling', time: 19.5, play: (d) => soundEngine.playPaperSlap(d) },
  { id: 'a247-rim-2', time: 20.15, play: (d) => soundEngine.playRimClink(d) },
  { id: 'a247-drum', time: 20.17, play: (d) => soundEngine.playDrumRoll(d, 1.55) },
  { id: 'a247-beep-3', time: 20.3, play: (d) => soundEngine.playCountBeep(d, 1.0) },
  { id: 'a247-beep-2', time: 20.77, play: (d) => soundEngine.playCountBeep(d, 1.12) },
  { id: 'a247-beep-1', time: 21.24, play: (d) => soundEngine.playCountBeep(d, 1.26) },
  { id: 'a247-breath', time: 21.62, play: (d) => soundEngine.playHeartbeat(d) },

  // Shot 7 - the win, then the twist (22-27)
  { id: 'a247-bin', time: 22.03, play: (d) => soundEngine.playBinThunk(d) },
  { id: 'a247-freeze-2', time: 22.4, play: (d) => soundEngine.playFreezeSting(d) },
  { id: 'a247-confetti', time: 23.12, play: (d) => soundEngine.playConfettiPop(d) },
  { id: 'a247-fanfare', time: 23.15, play: (d) => soundEngine.playVictoryFanfareShort(d) },
  { id: 'a247-crowd', time: 23.18, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'a247-scratch-3', time: 24.15, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'a247-sting-2', time: 25.8, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 8 - end frame (27-30)
  { id: 'a247-crumple-3', time: 27.02, play: (d) => soundEngine.playPaperCrumple(d) },
  { id: 'a247-trombone', time: 27.45, play: (d) => soundEngine.playSadTrombone(d) },
];

/**
 * Complete 30-second sound map for "The Impossible Needle Thread".
 * Four 7.5s slices of the bouncy sewing-championship score (a quiet dip for
 * the Shot 5 heartbeats and hard silence after the beanie pops off) plus
 * one-shot SFX for every gag.
 */
export const NEEDLE_THREAD_CUES: AudioCue[] = [
  // Score slices
  { id: 'nt-score-1', time: 0.0, play: (d) => soundEngine.playNeedleThreadScoreSection(d, 0, 7.5) },
  { id: 'nt-score-2', time: 7.5, play: (d) => soundEngine.playNeedleThreadScoreSection(d, 7.5, 15.0) },
  { id: 'nt-score-3', time: 15.0, play: (d) => soundEngine.playNeedleThreadScoreSection(d, 15.0, 22.5) },
  { id: 'nt-score-4', time: 22.5, play: (d) => soundEngine.playNeedleThreadScoreSection(d, 22.5, 30.0) },

  // Shot 1 - the hook (0-3)
  { id: 'nt-whoosh-1', time: 0.05, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'nt-ding', time: 0.55, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'nt-flick', time: 1.75, play: (d) => soundEngine.playSqueak(d) },
  { id: 'nt-sting-1', time: 2.45, play: (d) => soundEngine.playFreezeSting(d) },

  // Shot 2 - first failures (3-7)
  { id: 'nt-boing-1', time: 3.9, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'nt-squeak-1', time: 5.05, play: (d) => soundEngine.playSqueak(d) },
  { id: 'nt-boing-2', time: 5.7, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'nt-stomp', time: 6.55, play: (d) => soundEngine.playFloorThump(d) },

  // Shot 3 - the magnifying glass (7-12)
  { id: 'nt-bulb', time: 7.35, play: (d) => soundEngine.playIdeaDing(d) },
  { id: 'nt-sparkle-1', time: 7.42, play: (d) => soundEngine.playMagicSparkle(d) },
  { id: 'nt-whoosh-2', time: 8.3, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'nt-catch', time: 9.65, play: (d) => soundEngine.playArmCrossSqueak(d) },
  { id: 'nt-squeak-2', time: 10.85, play: (d) => soundEngine.playSqueak(d) },
  { id: 'nt-whistle', time: 11.15, play: (d) => soundEngine.playSlideWhistle(d) },

  // Shot 4 - the ridiculous machine (12-18)
  { id: 'nt-clack-1', time: 12.3, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'nt-clack-2', time: 12.65, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'nt-click-1', time: 13.0, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'nt-clack-3', time: 13.35, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'nt-click-2', time: 13.7, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'nt-clamp', time: 13.98, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'nt-proud', time: 14.5, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'nt-lever', time: 15.95, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'nt-clunk', time: 16.0, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'nt-spring', time: 16.33, play: (d) => soundEngine.playLauncherFire(d) },
  { id: 'nt-whip', time: 16.6, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'nt-fabric', time: 17.02, play: (d) => soundEngine.playBalloonStretch(d) },
  { id: 'nt-scratch-1', time: 17.35, play: (d) => soundEngine.playRecordScratch(d) },

  // Shot 5 - one last try (18-24)
  { id: 'nt-breath', time: 18.85, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'nt-heart-1', time: 19.2, play: (d) => soundEngine.playHeartbeat(d) },
  { id: 'nt-heart-2', time: 20.0, play: (d) => soundEngine.playHeartbeat(d) },
  { id: 'nt-heart-3', time: 20.8, play: (d) => soundEngine.playHeartbeat(d) },
  { id: 'nt-heart-4', time: 21.6, play: (d) => soundEngine.playHeartbeat(d) },
  { id: 'nt-heart-5', time: 22.2, play: (d) => soundEngine.playHeartbeat(d) },
  { id: 'nt-fakeout', time: 21.92, play: (d) => soundEngine.playSqueak(d) },
  { id: 'nt-thread', time: 22.58, play: (d) => soundEngine.playNeedlePoke(d) },
  { id: 'nt-sparkle-2', time: 22.95, play: (d) => soundEngine.playMagicSparkle(d) },
  { id: 'nt-fanfare', time: 23.55, play: (d) => soundEngine.playVictoryFanfareShort(d) },

  // Shot 6 - the final twist (24-30)
  { id: 'nt-scratch-2', time: 24.15, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'nt-tug', time: 25.2, play: (d) => soundEngine.playStrainedTug(d) },
  { id: 'nt-stretch', time: 26.55, play: (d) => soundEngine.playBalloonStretch(d) },
  { id: 'nt-pop', time: 27.28, play: (d) => soundEngine.playBigImpact(d) },
  { id: 'nt-sting-2', time: 28.85, play: (d) => soundEngine.playAngrySting(d) },
];

export const MAGNET_TRICK_CUES: AudioCue[] = [
  // Score-like slices (4 x 7.5s comedic underscore).
  { id: 'mt-score-1', time: 0.0, play: (d) => soundEngine.playVictoryFanfareShort(d) },
  { id: 'mt-score-2', time: 7.5, play: (d) => soundEngine.playMagicSparkle(d) },
  { id: 'mt-score-3', time: 15.0, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'mt-score-4', time: 22.5, play: (d) => soundEngine.playCoinTing(d) },

  // Shot 1 - the hook (0-4)
  { id: 'mt-hum-1', time: 0.5, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'mt-tick', time: 1.6, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'mt-squeak-1', time: 2.7, play: (d) => soundEngine.playSqueak(d) },
  { id: 'mt-sting-1', time: 3.5, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 2 - why the spoons (4-9)
  { id: 'mt-wave', time: 4.6, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'mt-clang-1', time: 5.4, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'mt-clang-2', time: 5.8, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'mt-rattle', time: 6.2, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'mt-grunt', time: 8.4, play: (d) => soundEngine.playSqueak(d) },

  // Shot 3 - the chair chase (9-14)
  { id: 'mt-hum-2', time: 9.5, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'mt-scrape', time: 10.2, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'mt-steps', time: 10.6, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'mt-panic', time: 13.4, play: (d) => soundEngine.playRecordScratch(d) },

  // Shot 4 - the metal swarm (14-20)
  { id: 'mt-clatter-1', time: 14.8, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'mt-clatter-2', time: 15.4, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'mt-pan', time: 16.2, play: (d) => soundEngine.playBigImpact(d) },
  { id: 'mt-wobble', time: 17.6, play: (d) => soundEngine.playBalloonStretch(d) },
  { id: 'mt-moan', time: 19.2, play: (d) => soundEngine.playSqueak(d) },

  // Shot 5 - small magnet, small target (20-26)
  { id: 'mt-crawl', time: 20.4, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'mt-idea', time: 21.5, play: (d) => soundEngine.playIdeaDing(d) },
  { id: 'mt-ping', time: 22.6, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'mt-tap', time: 23.8, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'mt-drop', time: 24.6, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'mt-fanfare', time: 25.1, play: (d) => soundEngine.playVictoryFanfareShort(d) },

  // Shot 6 - mission complete bonk (26-30)
  { id: 'mt-fanfare-2', time: 26.2, play: (d) => soundEngine.playVictoryFanfareShort(d) },
  { id: 'mt-spoon', time: 27.7, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'mt-spoon-ping', time: 27.9, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'mt-drag', time: 28.3, play: (d) => soundEngine.playBalloonStretch(d) },
  { id: 'mt-sting', time: 29.8, play: (d) => soundEngine.playAngrySting(d) },
];

export const RING_SHOT_CUES: AudioCue[] = [
  // Score slices (4 x 7.5s sports underscore).
  { id: 'rs-score-1', time: 0.0, play: (d) => soundEngine.playRingShotScoreSection(d, 0, 7.5) },
  { id: 'rs-score-2', time: 7.5, play: (d) => soundEngine.playRingShotScoreSection(d, 7.5, 15.0) },
  { id: 'rs-score-3', time: 15.0, play: (d) => soundEngine.playRingShotScoreSection(d, 15.0, 22.5) },
  { id: 'rs-score-4', time: 22.5, play: (d) => soundEngine.playRingShotScoreSection(d, 22.5, 30.0) },

  // Shot 1 - the hook (0-4)
  { id: 'rs-hum-1', time: 0.4, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rs-smirk', time: 1.5, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'rs-point', time: 2.5, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'rs-sting-1', time: 3.4, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 2 - attempt #1 (4-8)
  { id: 'rs-windup', time: 4.3, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rs-throw-1', time: 4.75, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rs-wall', time: 5.15, play: (d) => soundEngine.playBigImpact(d) },
  { id: 'rs-bonk-1', time: 5.62, play: (d) => soundEngine.playBigImpact(d) },
  { id: 'rs-boing-1', time: 5.82, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'rs-land-1', time: 6.2, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'rs-sting-2', time: 6.6, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 3 - attempt #27 (8-13)
  { id: 'rs-throw-2', time: 8.22, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rs-hoop-1', time: 8.42, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'rs-hoop-2', time: 8.82, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'rs-throw-3', time: 9.55, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rs-rim', time: 9.78, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'rs-knock', time: 10.26, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'rs-throw-4', time: 10.95, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rs-squeak', time: 11.5, play: (d) => soundEngine.playSqueak(d) },
  { id: 'rs-stomp', time: 12.25, play: (d) => soundEngine.playBigImpact(d) },
  { id: 'rs-sting-3', time: 12.6, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 4 - one last try (13-20)
  { id: 'rs-inhale', time: 13.4, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rs-release', time: 14.5, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rs-through-1', time: 15.32, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'rs-through-2', time: 16.13, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'rs-through-3', time: 16.95, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'rs-through-4', time: 17.77, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'rs-through-5', time: 18.58, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'rs-plop', time: 19.4, play: (d) => soundEngine.playCoinTing(d) },

  // Shot 5 - he actually did it (20-26)
  { id: 'rs-wobble', time: 20.2, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'rs-sparkle', time: 21.0, play: (d) => soundEngine.playMagicSparkle(d) },
  { id: 'rs-fanfare', time: 21.4, play: (d) => soundEngine.playVictoryFanfareShort(d) },
  { id: 'rs-hop-1', time: 23.1, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'rs-hop-2', time: 24.5, play: (d) => soundEngine.playFloorThump(d) },

  // Shot 6 - never celebrate too early (26-30)
  { id: 'rs-clatter', time: 26.5, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'rs-bonk-2', time: 27.1, play: (d) => soundEngine.playBigImpact(d) },
  { id: 'rs-launch', time: 27.35, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'rs-scratch', time: 27.9, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'rs-sting-4', time: 29.0, play: (d) => soundEngine.playAngrySting(d) },
];

export const PENCIL_LANDING_CUES: AudioCue[] = [
  // Score slices (4 x 7.5s Modern Pop underscore).
  { id: 'pl-score-1', time: 0.0, play: (d) => soundEngine.playPencilLandingScoreSection(d, 0, 7.5) },
  { id: 'pl-score-2', time: 7.5, play: (d) => soundEngine.playPencilLandingScoreSection(d, 7.5, 15.0) },
  { id: 'pl-score-3', time: 15.0, play: (d) => soundEngine.playPencilLandingScoreSection(d, 15.0, 22.5) },
  { id: 'pl-score-4', time: 22.5, play: (d) => soundEngine.playPencilLandingScoreSection(d, 22.5, 30.0) },

  // Shot 1 - the flip (0-5)
  { id: 'pl-wind', time: 2.7, play: (d) => soundEngine.playSqueak(d) },
  { id: 'pl-flip', time: 4.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pl-land-flat', time: 4.85, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'pl-sting-1', time: 4.95, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 2 - why won't it stand up (5-10)
  { id: 'pl-throw-1', time: 5.25, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pl-roll', time: 5.55, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'pl-edge', time: 5.95, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pl-floor', time: 6.05, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'pl-bonk-1', time: 6.45, play: (d) => soundEngine.playBigImpact(d) },
  { id: 'pl-boing-1', time: 6.55, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'pl-under-book', time: 7.15, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'pl-stomp', time: 8.5, play: (d) => soundEngine.playBigImpact(d) },
  { id: 'pl-sting-2', time: 9.0, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 3 - practice makes perfect (10-15)
  { id: 'pl-pull-out', time: 10.0, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'pl-flick-1', time: 11.4, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pl-flat-1', time: 12.1, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'pl-flick-2', time: 12.6, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pl-flat-2', time: 13.4, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'pl-launch-1', time: 13.9, play: (d) => soundEngine.playWhoosh(d) },

  // Shot 4 - I actually did it (15-22)
  { id: 'pl-slowmo', time: 15.4, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pl-plop', time: 19.8, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'pl-wobble', time: 20.0, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'pl-fanfare', time: 21.2, play: (d) => soundEngine.playVictoryFanfareShort(d) },

  // Shot 5 - wait… that's not the desk (22-30)
  { id: 'pl-hop-1', time: 23.0, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'pl-hop-2', time: 24.4, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'pl-shake', time: 26.0, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'pl-launch-2', time: 26.4, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pl-spin-2', time: 26.7, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'pl-balance', time: 27.8, play: (d) => soundEngine.playCoinTing(d) },
  { id: 'pl-wobble-2', time: 27.9, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'pl-scratch', time: 28.35, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'pl-sting-3', time: 29.1, play: (d) => soundEngine.playAngrySting(d) },
];

/**
 * Complete 30-second sound map for "The Impossible Domino Trickshot".
 * Four 7.5s slices of the bouncy score plus one-shot SFX for every gag.
 */
export const DOMINO_TRICKSHOT_CUES: AudioCue[] = [
  // Score slices
  { id: 'dt-score-1', time: 0.0, play: (d) => soundEngine.playDominoTrickshotScoreSection(d, 0, 7.5) },
  { id: 'dt-score-2', time: 7.5, play: (d) => soundEngine.playDominoTrickshotScoreSection(d, 7.5, 15.0) },
  { id: 'dt-score-3', time: 15.0, play: (d) => soundEngine.playDominoTrickshotScoreSection(d, 15.0, 22.5) },
  { id: 'dt-score-4', time: 22.5, play: (d) => soundEngine.playDominoTrickshotScoreSection(d, 22.5, 30.0) },

  // Shot 1 - The Challenge (0-4s)
  { id: 'dt-boom', time: 0.05, play: (d) => soundEngine.playDramaticBoom(d) },
  { id: 'dt-countdown', time: 0.5, play: (d) => soundEngine.playTickingCountdown(d, 3.0) },
  { id: 'dt-confident-chime', time: 2.0, play: (d) => soundEngine.playConfidenceDing(d) },

  // Shot 2 - First Failure (4-8s)
  { id: 'dt-flick-1', time: 4.5, play: (d) => soundEngine.playSoftFlick(d) },
  { id: 'dt-roll', time: 4.5, play: (d) => soundEngine.playBallRoll(d, 1.5) },
  { id: 'dt-plop-1', time: 6.1, play: (d) => soundEngine.playTinyPlop(d) },
  { id: 'dt-trombone-1', time: 6.5, play: (d) => soundEngine.playSadTrombone(d) },

  // Shot 3 - Total Disaster (8-14s)
  { id: 'dt-hard-flick', time: 8.7, play: (d) => soundEngine.playHardFlick(d) },
  { id: 'dt-domino-chaos', time: 9.0, play: (d) => soundEngine.playDominoClatter(d, 3.0) },
  { id: 'dt-crash-1', time: 12.5, play: (d) => soundEngine.playCartoonCrash(d) },
  { id: 'dt-stomp', time: 13.5, play: (d) => soundEngine.playFloorThump(d) },

  // Shot 4 - The Perfect Chain (14-20s)
  { id: 'dt-breath', time: 14.2, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'dt-precise-tap', time: 15.3, play: (d) => soundEngine.playPreciseTap(d) },
  { id: 'dt-domino-click-1', time: 15.5, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-2', time: 15.65, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-3', time: 15.8, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-4', time: 15.95, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-5', time: 16.1, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-6', time: 16.25, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-7', time: 16.4, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-8', time: 16.55, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-9', time: 16.7, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-10', time: 16.85, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-11', time: 17.0, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-12', time: 17.15, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-13', time: 17.3, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-14', time: 17.45, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-15', time: 17.6, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-16', time: 17.75, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-17', time: 17.9, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-18', time: 18.05, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-19', time: 18.2, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-domino-click-20', time: 18.35, play: (d) => soundEngine.playDominoClick(d) },
  { id: 'dt-rising-music', time: 15.5, play: (d) => soundEngine.playRisingMusicSwelling(d) },
  { id: 'dt-red-ball-roll', time: 19.0, play: (d) => soundEngine.playBallRoll(d, 1.0) },

  // Shot 5 - Impossible Success (20-25s)
  { id: 'dt-cup-ping', time: 20.7, play: (d) => soundEngine.playCupPing(d) },
  { id: 'dt-fanfare', time: 21.0, play: (d) => soundEngine.playVictoryFanfare(d) },
  { id: 'dt-cheer', time: 21.5, play: (d) => soundEngine.playCrowdCheer(d) },
  { id: 'dt-hop-1', time: 22.5, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'dt-hop-2', time: 23.5, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'dt-cup-wobble', time: 24.5, play: (d) => soundEngine.playCupWobbleCreak(d) },

  // Shot 6 - The Twist (25-30s)
  { id: 'dt-final-wobble', time: 25.2, play: (d) => soundEngine.playCupWobbleCreak(d) },
  { id: 'dt-hollow-bonk', time: 25.7, play: (d) => soundEngine.playHollowBonk(d) },
  { id: 'dt-record-scratch', time: 26.0, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'dt-angry-sting', time: 29.0, play: (d) => soundEngine.playAngrySting(d) },
];

/**
 * Complete 30-second sound map for "The Balloon Pop Jackpot".
 * Four 7.5s slices of the carnival score plus one-shot SFX for every gag.
 */
export const BALLOON_POP_JACKPOT_CUES: AudioCue[] = [
  // Score slices
  { id: 'bp-score-1', time: 0.0, play: (d) => soundEngine.playBalloonPopScoreSection(d, 0, 7.5) },
  { id: 'bp-score-2', time: 7.5, play: (d) => soundEngine.playBalloonPopScoreSection(d, 7.5, 15.0) },
  { id: 'bp-score-3', time: 15.0, play: (d) => soundEngine.playBalloonPopScoreSection(d, 15.0, 22.5) },
  { id: 'bp-score-4', time: 22.5, play: (d) => soundEngine.playBalloonPopScoreSection(d, 22.5, 30.0) },

  // Shot 1 - The Challenge (0-6s)
  { id: 'bp-booth-lights', time: 0.6, play: (d) => soundEngine.playBoothLights(d) },
  { id: 'bp-confident-ding', time: 2.0, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'bp-fist-clap', time: 4.4, play: (d) => soundEngine.playKnuckleCrack(d) },

  // Shot 2 - Three Terrible Darts (6-12s)
  { id: 'bp-miss-1-whoosh', time: 6.5, play: (d) => soundEngine.playDartWhoosh(d) },
  { id: 'bp-miss-1-thunk', time: 6.95, play: (d) => soundEngine.playDartThunkWood(d) },
  { id: 'bp-miss-2-whoosh', time: 8.3, play: (d) => soundEngine.playDartWhoosh(d) },
  { id: 'bp-miss-2-floor', time: 8.78, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'bp-miss-3-whoosh', time: 9.7, play: (d) => soundEngine.playDartWhoosh(d) },
  { id: 'bp-graze-wobble', time: 10.1, play: (d) => soundEngine.playBalloonSqueak(1.18, d) },
  { id: 'bp-miss-sting', time: 11.0, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 3 - Three Quick Pops (12-18s)
  { id: 'bp-pop-1-whoosh', time: 12.35, play: (d) => soundEngine.playDartWhoosh(d) },
  { id: 'bp-pop-1', time: 12.6, play: (d) => soundEngine.playBalloonPop(d) },
  { id: 'bp-pop-1-confetti', time: 12.64, play: (d) => soundEngine.playConfettiPop(d) },
  { id: 'bp-pop-2-whoosh', time: 13.15, play: (d) => soundEngine.playDartWhoosh(d) },
  { id: 'bp-pop-2', time: 13.4, play: (d) => soundEngine.playBalloonPop(d) },
  { id: 'bp-pop-2-confetti', time: 13.44, play: (d) => soundEngine.playConfettiPop(d) },
  { id: 'bp-pop-3-whoosh', time: 13.95, play: (d) => soundEngine.playDartWhoosh(d) },
  { id: 'bp-pop-3', time: 14.2, play: (d) => soundEngine.playBalloonPop(d) },
  { id: 'bp-pop-3-confetti', time: 14.24, play: (d) => soundEngine.playConfettiPop(d) },
  { id: 'bp-hatch-open', time: 14.9, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'bp-balloon-rush', time: 15.0, play: (d) => soundEngine.playBalloonStretch(d) },
  { id: 'bp-balloon-rush-whoosh', time: 15.05, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'bp-beanie-boing', time: 15.45, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'bp-beanie-rustle', time: 17.0, play: (d) => soundEngine.playPaperCrumple(d) },
  { id: 'bp-angry-sting', time: 17.5, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 4 - Jackpot (18-24s)
  { id: 'bp-drum-roll', time: 18.2, play: (d) => soundEngine.playDrumRoll(d, 3.0) },
  { id: 'bp-jackpot-whoosh', time: 21.3, play: (d) => soundEngine.playDartWhoosh(d) },
  { id: 'bp-golden-pop', time: 21.6, play: (d) => soundEngine.playGoldenPop(d) },
  { id: 'bp-golden-confetti', time: 21.64, play: (d) => soundEngine.playConfettiPop(d) },
  { id: 'bp-golden-sparkle', time: 21.9, play: (d) => soundEngine.playPrizeSparkle(d) },
  { id: 'bp-victory-fanfare', time: 21.7, play: (d) => soundEngine.playVictoryFanfare(d) },
  { id: 'bp-hop-1', time: 22.25, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'bp-hop-2', time: 23.05, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'bp-hop-3', time: 23.75, play: (d) => soundEngine.playFloorThump(d) },

  // Shot 5 - The Prize Is A Balloon (24-30s)
  { id: 'bp-case-open', time: 24.4, play: (d) => soundEngine.playCaseOpen(d) },
  { id: 'bp-giant-inflate', time: 25.3, play: (d) => soundEngine.playBalloonInflate(d, 2.1) },
  { id: 'bp-giant-burst', time: 27.4, play: (d) => soundEngine.playBigImpact(d) },
  { id: 'bp-giant-pop', time: 27.42, play: (d) => soundEngine.playGoldenPop(d) },
  { id: 'bp-foil-rain', time: 27.5, play: (d) => soundEngine.playConfettiPop(d) },
  { id: 'bp-record-scratch', time: 28.25, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'bp-tiny-balloon', time: 28.4, play: (d) => soundEngine.playBalloonSqueak(1.72, d) },
  { id: 'bp-final-sting', time: 29.0, play: (d) => soundEngine.playAngrySting(d) },
];

/**
 * Complete 30-second sound map for "The Candy Claw Disaster".
 * Four 7.5s slices of the carnival score plus one-shot SFX for every gag.
 */
export const CANDY_CLAW_CUES: AudioCue[] = [
  // Score slices
  { id: 'cc-score-1', time: 0.0, play: (d) => soundEngine.playCandyClawScoreSection(d, 0, 7.5) },
  { id: 'cc-score-2', time: 7.5, play: (d) => soundEngine.playCandyClawScoreSection(d, 7.5, 15.0) },
  { id: 'cc-score-3', time: 15.0, play: (d) => soundEngine.playCandyClawScoreSection(d, 15.0, 22.5) },
  { id: 'cc-score-4', time: 22.5, play: (d) => soundEngine.playCandyClawScoreSection(d, 22.5, 30.0) },

  // Shot 1 - The Giant Candy Prize (0-6s)
  { id: 'cc-booth-lights', time: 0.5, play: (d) => soundEngine.playBoothLights(d) },
  { id: 'cc-token-clink', time: 3.8, play: (d) => soundEngine.playCoinClink(d) },
  { id: 'cc-machine-chime', time: 4.5, play: (d) => soundEngine.playArcadeChime(d) },
  { id: 'cc-magic-sparkle', time: 4.9, play: (d) => soundEngine.playMagicSparkle(d) },

  // Shot 2 - The First Grab (6-12s)
  { id: 'cc-grab-1-joy', time: 6.45, play: (d) => soundEngine.playClawMotor(d, 1.5) },
  { id: 'cc-grab-1-button', time: 7.95, play: (d) => soundEngine.playButtonClick(d) },
  { id: 'cc-grab-1-motor', time: 8.0, play: (d) => soundEngine.playClawMotor(d, 0.8) },
  { id: 'cc-grab-1-click', time: 8.85, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'cc-grab-1-lift', time: 8.9, play: (d) => soundEngine.playRisingWhistle(d, 0.7) },
  { id: 'cc-grab-1-slip', time: 9.7, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'cc-grab-1-bounce', time: 10.15, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'cc-grab-1-fail', time: 11.0, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 3 - The Perfect Grab (12-18s)
  { id: 'cc-breath', time: 12.65, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'cc-grab-2-joy', time: 14.0, play: (d) => soundEngine.playClawMotor(d, 0.9) },
  { id: 'cc-grab-2-button', time: 14.9, play: (d) => soundEngine.playButtonClick(d) },
  { id: 'cc-grab-2-motor', time: 15.0, play: (d) => soundEngine.playClawMotor(d, 0.5) },
  { id: 'cc-grab-2-click', time: 15.4, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'cc-grab-2-lift', time: 15.5, play: (d) => soundEngine.playRisingWhistle(d, 0.9) },
  { id: 'cc-victory-fanfare', time: 16.4, play: (d) => soundEngine.playVictoryFanfareShort(d) },
  { id: 'cc-hop-1', time: 16.55, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'cc-hop-2', time: 17.25, play: (d) => soundEngine.playFloorThump(d) },

  // Shot 4 - Candy Overload (18-24s)
  { id: 'cc-warning-beep', time: 18.85, play: (d) => soundEngine.playArcadeAlarm(d) },
  { id: 'cc-dispenser-open', time: 19.6, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'cc-candy-pour', time: 19.7, play: (d) => soundEngine.playPlushAvalanche(d) },
  { id: 'cc-avalanche-rumble', time: 22.0, play: (d) => soundEngine.playDramaticRumble(d) },

  // Shot 5 - Buried in Candy (24-30s)
  { id: 'cc-final-avalanche', time: 24.4, play: (d) => soundEngine.playBigImpact(d) },
  { id: 'cc-buried', time: 25.0, play: (d) => soundEngine.playCartoonCrash(d) },
  { id: 'cc-lollipop-land', time: 28.4, play: (d) => soundEngine.playBalloonSqueak(1.5, d) },
  { id: 'cc-freeze-sting', time: 29.0, play: (d) => soundEngine.playFreezeSting(d) },
];

/**
 * 30-second sound map for "The Impossible Plate Spin".
 * Four 7.5s circus-score slices plus one-shots for every plate placement,
 * the wobble, the flight and the beanie landing.
 */
export const PLATE_SPIN_CUES: AudioCue[] = [
  // Score slices
  { id: 'ps-score-1', time: 0.0, play: (d) => soundEngine.playPlateSpinScoreSection(d, 0, 7.5) },
  { id: 'ps-score-2', time: 7.5, play: (d) => soundEngine.playPlateSpinScoreSection(d, 7.5, 15.0) },
  { id: 'ps-score-3', time: 15.0, play: (d) => soundEngine.playPlateSpinScoreSection(d, 15.0, 22.5) },
  { id: 'ps-score-4', time: 22.5, play: (d) => soundEngine.playPlateSpinScoreSection(d, 22.5, 30.0) },

  // Shot 1 - The Challenge (0-6s)
  { id: 'ps-step-1', time: 0.35, play: (d) => soundEngine.playFootstep(false, d) },
  { id: 'ps-step-2', time: 0.9, play: (d) => soundEngine.playFootstep(false, d) },
  { id: 'ps-step-3', time: 1.45, play: (d) => soundEngine.playFootstep(false, d) },
  { id: 'ps-sign-sparkle', time: 2.0, play: (d) => soundEngine.playMagicSparkle(d) },
  { id: 'ps-determined-ding', time: 2.55, play: (d) => soundEngine.playIdeaDing(d) },
  { id: 'ps-crate-rattle', time: 3.6, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'ps-plate-1-pick', time: 4.15, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'ps-plate-1-throw', time: 4.47, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ps-plate-1-clink', time: 4.92, play: (d) => soundEngine.playPlateClink(d) },
  { id: 'ps-plate-1-whirr', time: 4.94, play: (d) => soundEngine.playPlateWhir(d, 0.9) },

  // Shot 2 - Three Plates (6-12s)
  { id: 'ps-plate-2-pick', time: 6.5, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'ps-plate-2-throw', time: 6.6, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ps-plate-2-clink', time: 7.05, play: (d) => soundEngine.playPlateClink(d) },
  { id: 'ps-plate-2-whirr', time: 7.08, play: (d) => soundEngine.playPlateWhir(d, 0.8) },
  { id: 'ps-plate-3-pick', time: 8.7, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'ps-plate-3-throw', time: 8.8, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ps-plate-3-clink', time: 9.25, play: (d) => soundEngine.playPlateClink(d) },
  { id: 'ps-plate-3-whirr', time: 9.28, play: (d) => soundEngine.playPlateWhir(d, 1.0) },
  { id: 'ps-three-confident', time: 10.5, play: (d) => soundEngine.playConfidenceDing(d) },

  // Shot 3 - Ten Plates (12-18s)
  { id: 'ps-plate-4-pick', time: 12.13, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'ps-plate-4-throw', time: 12.25, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ps-plate-4-clink', time: 12.7, play: (d) => soundEngine.playPlateClink(d) },
  { id: 'ps-plate-5-pick', time: 12.63, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'ps-plate-5-throw', time: 12.75, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ps-plate-5-clink', time: 13.2, play: (d) => soundEngine.playPlateClink(d) },
  { id: 'ps-plate-6-pick', time: 13.13, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'ps-plate-6-throw', time: 13.25, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ps-plate-6-clink', time: 13.7, play: (d) => soundEngine.playPlateClink(d) },
  { id: 'ps-plate-7-pick', time: 13.63, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'ps-plate-7-throw', time: 13.75, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ps-plate-7-clink', time: 14.2, play: (d) => soundEngine.playPlateClink(d) },
  { id: 'ps-plate-8-pick', time: 14.13, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'ps-plate-8-throw', time: 14.25, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ps-plate-8-clink', time: 14.7, play: (d) => soundEngine.playPlateClink(d) },
  { id: 'ps-plate-9-pick', time: 14.63, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'ps-plate-9-throw', time: 14.75, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ps-plate-9-clink', time: 15.2, play: (d) => soundEngine.playPlateClink(d) },
  { id: 'ps-plate-10-pick', time: 15.13, play: (d) => soundEngine.playWoodClack(d) },
  { id: 'ps-plate-10-throw', time: 15.25, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ps-plate-10-clink', time: 15.7, play: (d) => soundEngine.playPlateClink(d) },
  { id: 'ps-ten-plates-whirr', time: 15.75, play: (d) => soundEngine.playPlateWhir(d, 1.4) },
  { id: 'ps-row-wobble', time: 16.95, play: (d) => soundEngine.playPlateWobble(d) },
  { id: 'ps-row-sparkle', time: 17.35, play: (d) => soundEngine.playMagicSparkle(d) },
  { id: 'ps-proud-ding', time: 17.6, play: (d) => soundEngine.playConfidenceDing(d) },

  // Shot 4 - The Wobble (18-24s)
  { id: 'ps-victory-fanfare', time: 18.2, play: (d) => soundEngine.playVictoryFanfareShort(d) },
  { id: 'ps-hop-1', time: 18.28, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'ps-hop-2', time: 18.72, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'ps-wobble-creak', time: 19.5, play: (d) => soundEngine.playPlateWobble(d) },
  { id: 'ps-wobble-tense', time: 20.3, play: (d) => soundEngine.playRisingMusicSwelling(d) },
  { id: 'ps-plate-slip', time: 21.05, play: (d) => soundEngine.playSlideWhistle(d) },
  { id: 'ps-plate-fly', time: 21.12, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'ps-plate-fly-whistle', time: 21.18, play: (d) => soundEngine.playSpinWhistle(d) },
  { id: 'ps-plate-fly-whirr', time: 21.9, play: (d) => soundEngine.playPlateWhir(d, 1.3) },
  { id: 'ps-plate-drop-hush', time: 23.4, play: (d) => soundEngine.playSoftFlick(d) },

  // Shot 5 - The Record (24-30s)
  { id: 'ps-plate-land-clink', time: 24.3, play: (d) => soundEngine.playPlateClink(d) },
  { id: 'ps-plate-land-plop', time: 24.33, play: (d) => soundEngine.playTinyPlop(d) },
  { id: 'ps-shock-scratch', time: 24.6, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'ps-beanie-whirr', time: 24.9, play: (d) => soundEngine.playPlateWhir(d, 1.2) },
  { id: 'ps-proud-finger', time: 26.8, play: (d) => soundEngine.playIdeaDing(d) },
  { id: 'ps-record-sparkle', time: 27.6, play: (d) => soundEngine.playPrizeSparkle(d) },
  { id: 'ps-end-sting', time: 29.2, play: (d) => soundEngine.playFreezeSting(d) },
];

/**
 * 30-second sound map for "The Three-Wall Ping-Pong Shot".
 * Four 7.5s score slices plus one-shots for paddle hits, wall bounces,
 * the beanie bonk, the dramatic slow-mo, the cup plink, and the avalanche.
 */
export const THREE_WALL_PING_PONG_CUES: AudioCue[] = [
  // Score slices
  { id: 'twpp-score-1', time: 0.0, play: (d) => soundEngine.playThreeWallPingPongScoreSection(d, 0, 7.5) },
  { id: 'twpp-score-2', time: 7.5, play: (d) => soundEngine.playThreeWallPingPongScoreSection(d, 7.5, 15.0) },
  { id: 'twpp-score-3', time: 15.0, play: (d) => soundEngine.playThreeWallPingPongScoreSection(d, 15.0, 22.5) },
  { id: 'twpp-score-4', time: 22.5, play: (d) => soundEngine.playThreeWallPingPongScoreSection(d, 22.5, 30.0) },

  // Shot 1 - The Setup (0-6s)
  { id: 'twpp-confident', time: 1.5, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'twpp-paddle-grip', time: 3.0, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'twpp-windup-whoosh', time: 4.0, play: (d) => soundEngine.playWhoosh(d) },

  // Shot 2 - The First Fail (6-12s)
  { id: 'twpp-paddle-hit-1', time: 6.5, play: (d) => soundEngine.playPaddleHit(d) },
  { id: 'twpp-ball-flight-1', time: 6.5, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'twpp-wall-hit-1', time: 7.8, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'twpp-ricochet-boing', time: 8.0, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'twpp-beanie-bonk', time: 8.5, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'twpp-angry-sting', time: 9.0, play: (d) => soundEngine.playAngrySting(d) },
  { id: 'twpp-ball-plop', time: 9.8, play: (d) => soundEngine.playDeskPlop(d) },

  // Shot 3 - So Close (12-18s)
  { id: 'twpp-deep-breath', time: 12.3, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'twpp-paddle-hit-2', time: 12.8, play: (d) => soundEngine.playPaddleHit(d) },
  { id: 'twpp-wall-hit-1b', time: 13.8, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'twpp-wall-hit-2', time: 15.0, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'twpp-wall-hit-3', time: 16.2, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'twpp-near-miss', time: 17.2, play: (d) => soundEngine.playSlideWhistle(d) },
  { id: 'twpp-sad-trombone', time: 17.6, play: (d) => soundEngine.playSadTrombone(d) },

  // Shot 4 - The Perfect Shot (18-24s)
  { id: 'twpp-slowmo-swell', time: 18.5, play: (d) => soundEngine.playRisingMusicSwelling(d) },
  { id: 'twpp-paddle-hit-perfect', time: 20.0, play: (d) => soundEngine.playPaddleHit(d) },
  { id: 'twpp-wall-chime-1', time: 20.8, play: (d) => soundEngine.playMagicSparkle(d) },
  { id: 'twpp-wall-chime-2', time: 21.8, play: (d) => soundEngine.playMagicSparkle(d) },
  { id: 'twpp-wall-chime-3', time: 22.8, play: (d) => soundEngine.playMagicSparkle(d) },
  { id: 'twpp-cup-plink', time: 23.5, play: (d) => soundEngine.playCupPing(d) },
  { id: 'twpp-victory-fanfare', time: 23.7, play: (d) => soundEngine.playVictoryFanfareShort(d) },
  { id: 'twpp-happy-hop', time: 23.9, play: (d) => soundEngine.playFloorThump(d) },

  // Shot 5 - Too Many Balls (24-30s)
  { id: 'twpp-cup-rattle', time: 24.2, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'twpp-avalanche-rumble', time: 24.5, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'twpp-balls-cascade', time: 25.0, play: (d) => soundEngine.playPlushAvalanche(d) },
  { id: 'twpp-beanie-rise', time: 27.5, play: (d) => soundEngine.playSoftFlick(d) },
  { id: 'twpp-freeze-sting', time: 29.0, play: (d) => soundEngine.playFreezeSting(d) },
];

/**
 * 30-second sound map for "The Impossible Cup-in-Cup Shot".
 * Four 7.5s score slices plus one-shots for cup clicks, paddle hits,
 * table bounces, rim clangs, suspense swells, soft plinks, and avalanche.
 */
export const CUP_IN_CUP_CUES: AudioCue[] = [
  // Score slices
  { id: 'cic-score-1', time: 0.0, play: (d) => soundEngine.playCupInCupScoreSection(d, 0, 7.5) },
  { id: 'cic-score-2', time: 7.5, play: (d) => soundEngine.playCupInCupScoreSection(d, 7.5, 15.0) },
  { id: 'cic-score-3', time: 15.0, play: (d) => soundEngine.playCupInCupScoreSection(d, 15.0, 22.5) },
  { id: 'cic-score-4', time: 22.5, play: (d) => soundEngine.playCupInCupScoreSection(d, 22.5, 30.0) },

  // Shot 1 - The Setup (0-6s)
  { id: 'cic-cup-place-1', time: 1.5, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'cic-cup-place-2', time: 2.2, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'cic-cup-place-3', time: 3.0, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'cic-ball-pickup', time: 3.5, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'cic-confident', time: 4.0, play: (d) => soundEngine.playConfidenceDing(d) },

  // Shot 2 - First Failure (6-12s)
  { id: 'cic-paddle-hit-1', time: 6.5, play: (d) => soundEngine.playPaddleHit(d) },
  { id: 'cic-ball-bounce-1', time: 7.2, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'cic-rim-clang-1', time: 7.4, play: (d) => soundEngine.playRimClink(d) },
  { id: 'cic-angry-sting-1', time: 7.8, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 3 - So Close (12-18s)
  { id: 'cic-deep-breath', time: 12.3, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'cic-paddle-hit-2', time: 13.0, play: (d) => soundEngine.playPaddleHit(d) },
  { id: 'cic-ball-bounce-2', time: 14.2, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'cic-suspense-swell', time: 14.5, play: (d) => soundEngine.playRisingMusicSwelling(d) },
  { id: 'cic-soft-plink', time: 15.5, play: (d) => soundEngine.playCupPing(d) },
  { id: 'cic-record-scratch', time: 16.0, play: (d) => soundEngine.playRecordScratch(d) },
  { id: 'cic-sad-trombone', time: 16.5, play: (d) => soundEngine.playSadTrombone(d) },

  // Shot 4 - Perfect Shot (18-24s)
  { id: 'cic-slowmo-swell', time: 18.5, play: (d) => soundEngine.playRisingMusicSwelling(d) },
  { id: 'cic-paddle-hit-perfect', time: 20.0, play: (d) => soundEngine.playPaddleHit(d) },
  { id: 'cic-ball-bounce-perfect', time: 21.5, play: (d) => soundEngine.playWallBounce(d) },
  { id: 'cic-chime-1', time: 22.0, play: (d) => soundEngine.playMagicSparkle(d) },
  { id: 'cic-perfect-plink', time: 23.0, play: (d) => soundEngine.playCupPing(d) },
  { id: 'cic-victory-fanfare', time: 23.3, play: (d) => soundEngine.playVictoryFanfareShort(d) },
  { id: 'cic-happy-hop', time: 23.5, play: (d) => soundEngine.playFloorThump(d) },

  // Shot 5 - Avalanche (24-30s)
  { id: 'cic-table-bump', time: 24.5, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'cic-wobble-creak', time: 25.0, play: (d) => soundEngine.playCupWobbleCreak(d) },
  { id: 'cic-avalanche-rumble', time: 25.5, play: (d) => soundEngine.playDramaticRumble(d) },
  { id: 'cic-avalanche-cascade', time: 26.0, play: (d) => soundEngine.playPlushAvalanche(d) },
  { id: 'cic-beanie-rise', time: 28.0, play: (d) => soundEngine.playSoftFlick(d) },
  { id: 'cic-freeze-sting', time: 29.0, play: (d) => soundEngine.playFreezeSting(d) },
];

/**
 * 30-second sound map for "The Yo-Yo Revenge".
 * Four 7.5s score slices plus one-shots for string twangs, swing whirrs,
 * cup pings, the forehead bonk, the beanie pop and the freeze.
 */
export const YO_YO_REVENGE_CUES: AudioCue[] = [
  // Score slices
  { id: 'yyr-score-1', time: 0.0, play: (d) => soundEngine.playYoyoScoreSection(d, 0, 7.5) },
  { id: 'yyr-score-2', time: 7.5, play: (d) => soundEngine.playYoyoScoreSection(d, 7.5, 15.0) },
  { id: 'yyr-score-3', time: 15.0, play: (d) => soundEngine.playYoyoScoreSection(d, 15.0, 22.5) },
  { id: 'yyr-score-4', time: 22.5, play: (d) => soundEngine.playYoyoScoreSection(d, 22.5, 30.0) },

  // Shot 1 - The Challenge (0-5s)
  { id: 'yyr-string-twang', time: 1.5, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'yyr-confident', time: 2.7, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'yyr-cup-settle', time: 3.4, play: (d) => soundEngine.playPreciseTap(d) },
  { id: 'yyr-windup', time: 4.6, play: (d) => soundEngine.playWhoosh(d) },

  // Shot 2 - First Failure (5-11s)
  { id: 'yyr-release', time: 5.15, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'yyr-swing-1', time: 5.9, play: (d) => soundEngine.playSpiralWhirr(d) },
  { id: 'yyr-high-pass', time: 6.7, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'yyr-cup-wobble', time: 6.95, play: (d) => soundEngine.playCupWobbleCreak(d) },
  { id: 'yyr-near-miss', time: 7.75, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'yyr-boing', time: 8.0, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'yyr-angry-sting', time: 9.0, play: (d) => soundEngine.playAngrySting(d) },

  // Shot 3 - The Impossible Route (11-17s)
  { id: 'yyr-idea', time: 11.3, play: (d) => soundEngine.playIdeaDing(d) },
  { id: 'yyr-drop', time: 12.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'yyr-leg-whirr', time: 12.9, play: (d) => soundEngine.playSpiralWhirr(d) },
  { id: 'yyr-wrap', time: 14.1, play: (d) => soundEngine.playStrainedTug(d) },
  { id: 'yyr-ankle', time: 14.7, play: (d) => soundEngine.playSqueak(d) },
  { id: 'yyr-balance', time: 15.4, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'yyr-sigh', time: 16.2, play: (d) => soundEngine.playRelievedSigh(d) },

  // Shot 4 - Perfect Trickshot (17-24s)
  { id: 'yyr-breath', time: 17.4, play: (d) => soundEngine.playDeepBreath(d) },
  { id: 'yyr-flick', time: 19.2, play: (d) => soundEngine.playSoftFlick(d) },
  { id: 'yyr-leg-whirr-2', time: 20.0, play: (d) => soundEngine.playSpiralWhirr(d) },
  { id: 'yyr-rise', time: 21.0, play: (d) => soundEngine.playRisingWhistle(d) },
  { id: 'yyr-cup-ping', time: 21.7, play: (d) => soundEngine.playCupPing(d) },
  { id: 'yyr-sparkle', time: 21.9, play: (d) => soundEngine.playMagicSparkle(d) },
  { id: 'yyr-victory', time: 22.7, play: (d) => soundEngine.playVictoryFanfareShort(d) },

  // Shot 5 - The Yo-Yo Gets Revenge (24-30s)
  { id: 'yyr-proud', time: 24.4, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'yyr-string-snap', time: 25.0, play: (d) => soundEngine.playKnotSnap(d) },
  { id: 'yyr-revenge-whoosh', time: 25.4, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'yyr-bonk', time: 26.2, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'yyr-beanie-pop', time: 26.24, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'yyr-wobble', time: 26.8, play: (d) => soundEngine.playSqueak(d) },
  { id: 'yyr-fall-whistle', time: 28.6, play: (d) => soundEngine.playSlideWhistle(d) },
  { id: 'yyr-freeze', time: 29.5, play: (d) => soundEngine.playFreezeSting(d) },
];

/**
 * 30-second sound map for "The Rubber Band Trickshot".
 * Four 7.5s score slices plus one-shots for rubber band twangs, paper whooshes,
 * bin wobbles, the forehead bonk, the celebration, and the freeze.
 */
export const YO_BANDIT_CUES: AudioCue[] = [
  // Score slices
  { id: 'yb-score-1', time: 0.0, play: (d) => soundEngine.playRubberBandScoreSection(d, 0, 7.5) },
  { id: 'yb-score-2', time: 7.5, play: (d) => soundEngine.playRubberBandScoreSection(d, 7.5, 15.0) },
  { id: 'yb-score-3', time: 15.0, play: (d) => soundEngine.playRubberBandScoreSection(d, 15.0, 22.5) },
  { id: 'yb-score-4', time: 22.5, play: (d) => soundEngine.playRubberBandScoreSection(d, 22.5, 30.0) },

  // Scene 1 - The Impossible Target (0-5s)
  { id: 'yb-band-twang', time: 1.5, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'yb-challenge', time: 2.5, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'yb-point', time: 3.4, play: (d) => soundEngine.playPreciseTap(d) },

  // Scene 2 - Way Too High! (5-11s)
  { id: 'yb-release-1', time: 5.2, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'yb-whoosh-1', time: 5.8, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'yb-high-arc', time: 7.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'yb-wall-hit', time: 8.0, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'yb-angry', time: 9.0, play: (d) => soundEngine.playAngrySting(d) },

  // Scene 3 - Too Low! (11-17s)
  { id: 'yb-release-2', time: 12.2, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'yb-whoosh-2', time: 13.2, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'yb-floor-thump', time: 14.7, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'yb-bounce-1', time: 15.2, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'yb-bounce-2', time: 15.5, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'yb-roll', time: 15.8, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'yb-frustrated', time: 16.5, play: (d) => soundEngine.playRelievedSigh(d) },

  // Scene 4 - Perfect Shot! (17-24s)
  { id: 'yb-release-3', time: 17.5, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'yb-whoosh-3', time: 18.5, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'yb-rim-click', time: 20.5, play: (d) => soundEngine.playCupPing(d) },
  { id: 'yb-drop', time: 21.2, play: (d) => soundEngine.playPreciseTap(d) },
  { id: 'yb-celebrate', time: 22.0, play: (d) => soundEngine.playVictoryFanfareShort(d) },

  // Scene 5 - The Bin's Revenge! (24-30s)
  { id: 'yb-bin-snap', time: 24.5, play: (d) => soundEngine.playKnotSnap(d) },
  { id: 'yb-bin-wobble', time: 25.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'yb-bin-bonk', time: 26.0, play: (d) => soundEngine.playHeadBonk(d) },
  { id: 'yb-shocked', time: 26.5, play: (d) => soundEngine.playAngrySting(d) },
  { id: 'yb-whistle', time: 27.5, play: (d) => soundEngine.playSlideWhistle(d) },
  { id: 'yb-freeze', time: 29.0, play: (d) => soundEngine.playFreezeSting(d) },
];

/**
 * 30-second sound map for "Stranded on a Desert Island".
 * Four 7.5s score slices plus one-shots for ocean waves, tropical birds,
 * wood tapping, hut collapse, fishing line, fish splash, coconuts rolling,
 * airplane engine, coconut fall, beanie pop, sad trombone, and freeze sting.
 */
export const DESERT_ISLAND_CUES: AudioCue[] = [
  // Score slices
  { id: 'di-score-1', time: 0.0, play: (d) => soundEngine.playDesertIslandScoreSection(d, 0, 7.5) },
  { id: 'di-score-2', time: 7.5, play: (d) => soundEngine.playDesertIslandScoreSection(d, 7.5, 15.0) },
  { id: 'di-score-3', time: 15.0, play: (d) => soundEngine.playDesertIslandScoreSection(d, 15.0, 22.5) },
  { id: 'di-score-4', time: 22.5, play: (d) => soundEngine.playDesertIslandScoreSection(d, 22.5, 30.0) },

  // Scene 1 - No Way Home (0-6s)
  { id: 'di-waves', time: 0.5, play: (d) => soundEngine.playWaterSplash(d, 0.3) },
  { id: 'di-birds', time: 1.0, play: (d) => soundEngine.playTropicalBirds(d) },
  { id: 'di-challenge', time: 2.0, play: (d) => soundEngine.playDramaticRumble(d) },

  // Scene 2 - Building a Shelter (6-12s)
  { id: 'di-wood-tap-1', time: 6.5, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'di-leaves-rustle', time: 7.5, play: (d) => soundEngine.playPaperSlap(d) },
  { id: 'di-wood-tap-2', time: 8.5, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'di-confident', time: 9.5, play: (d) => soundEngine.playConfidenceDing(d) },
  { id: 'di-creak', time: 10.0, play: (d) => soundEngine.playCupWobbleCreak(d) },
  { id: 'di-collapse', time: 10.5, play: (d) => soundEngine.playTrashCrash(d) },
  { id: 'di-leaf-flutter', time: 11.5, play: (d) => soundEngine.playPaperSlap(d) },

  // Scene 3 - The Fishing Disaster (12-18s)
  { id: 'di-water-lap', time: 12.2, play: (d) => soundEngine.playWaterSplash(d, 0.2) },
  { id: 'di-line-creak', time: 14.5, play: (d) => soundEngine.playRubberBandTwang(d) },
  { id: 'di-excited', time: 15.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'di-rod-bend', time: 15.2, play: (d) => soundEngine.playStrainedTug(d) },
  { id: 'di-fish-splash', time: 15.6, play: (d) => soundEngine.playWaterSplash(d, 1.0) },
  { id: 'di-failure', time: 16.0, play: (d) => soundEngine.playSadTrombone(d) },
  { id: 'di-drip', time: 17.0, play: (d) => soundEngine.playWaterSplash(d, 0.1) },

  // Scene 4 - The Rescue Signal (18-24s)
  { id: 'di-coconut-roll', time: 18.5, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'di-coconut-thud', time: 19.5, play: (d) => soundEngine.playMechanicalClick(d) },
  { id: 'di-uplifting', time: 21.0, play: (d) => soundEngine.playVictoryFanfareShort(d) },
  { id: 'di-plane-engine', time: 21.5, play: (d) => soundEngine.playPlaneEngine(d) },
  { id: 'di-excited-jump', time: 22.0, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'di-jump', time: 22.5, play: (d) => soundEngine.playCartoonBoing(d) },

  // Scene 5 - Worst Timing Ever (24-30s)
  { id: 'di-coconut-loosen', time: 25.0, play: (d) => soundEngine.playCupWobbleCreak(d) },
  { id: 'di-coconut-fall', time: 25.3, play: (d) => soundEngine.playWhoosh(d) },
  { id: 'di-coconut-bounce', time: 25.6, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'di-beanie-pop', time: 25.8, play: (d) => soundEngine.playCartoonBoing(d) },
  { id: 'di-beanie-land', time: 26.2, play: (d) => soundEngine.playFloorThump(d) },
  { id: 'di-plane-pass', time: 26.5, play: (d) => soundEngine.playPlaneEngine(d) },
  { id: 'di-sad-trombone', time: 27.0, play: (d) => soundEngine.playSadTrombone(d) },
  { id: 'di-freeze', time: 29.5, play: (d) => soundEngine.playFreezeSting(d) },
];
