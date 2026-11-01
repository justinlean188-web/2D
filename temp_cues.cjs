const fs = require('fs');
const filePath = 'src/audio/cueMaps.ts';
const content = fs.readFileSync(filePath, 'utf8');

const endMarker = '];';
const lastIndex = content.lastIndexOf(endMarker);
const before = content.substring(0, lastIndex + endMarker.length);
const after = content.substring(lastIndex + endMarker.length);

const newCues = `
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
`;

const newContent = before + '\n' + newCues + after;
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Done');