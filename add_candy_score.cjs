const fs=require('fs');
let s=fs.readFileSync('src/audio/soundEngine.ts','utf8');
const i=s.indexOf('playBalloonPopScoreSection');
const j=s.indexOf('\n  }', i);
if(i>=0 && j>=0) {
  const insert = `
  playCandyClawScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 155,
      wave: 'square',
      level: 0.42,
      chords: [
        [293.66, 369.99, 440.0],    // D4 + F#4 + A4 (D major)
        [329.63, 415.3, 493.88],   // E4 + G#4 + B4 (E major)
        [277.18, 349.23, 415.3],   // C#4 + F4 + G#4 (C# minor / F major)
        [293.66, 369.99, 440.0],   // D4 + F#4 + A4 (D major)
      ],
    });
  }`;
  s = s.slice(0, j+1) + '\n' + insert + s.slice(j+1);
  fs.writeFileSync('src/audio/soundEngine.ts', s, 'utf8');
  console.log('Added CandyClaw score section');
} else {
  console.log('Could not find insertion point');
}