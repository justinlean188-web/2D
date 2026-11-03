const fs = require('fs');
const file = 'src/audio/soundEngine.ts';
let s = fs.readFileSync(file, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';

if (!s.includes('playDominoClick')) {
  const anchor = '}' + eol + eol + 'export const soundEngine = new SoundEngine();';
  const at = s.indexOf(anchor);
  if (at < 0) throw new Error('anchor not found');
  const add = [
    '',
    '  public playDominoClick(dest?: AudioNode) {',
    '    this.sfx(dest, [',
    "      { k: 't', f: 1000, f2: 600, d: 0.06, g: 0.1, w: 'triangle' },",
    "      { k: 'n', f: 2600, f2: 1200, d: 0.04, g: 0.05, ft: 'bandpass', q: 3 },",
    '    ]);',
    '  }',
  ].join(eol);
  s = s.slice(0, at) + add + s.slice(at);
  fs.writeFileSync(file, s, 'utf8');
  console.log('added playDominoClick');
}

// Report any remaining two-argument cue-map calls.
const cues = fs.readFileSync('src/audio/cueMaps.ts', 'utf8').split(/\r?\n/);
[722, 723, 724, 725, 760].forEach((n) => {
  const line = cues[n - 1] || '';
  const m = line.match(/soundEngine\.(\w+)\(([^)]*)\)/);
  console.log(n, m ? m[1] + ' :: ' + m[2] : line.trim());
});
