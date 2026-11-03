const fs = require('fs');
const file = 'src/audio/soundEngine.ts';
let s = fs.readFileSync(file, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';

const oldStart = s.indexOf('  public playBalloonSqueak(dest?: AudioNode) {');
if (oldStart >= 0) {
  const oldEnd = s.indexOf('  }', oldStart) + 3;
  const replacement = [
    '  public playBalloonSqueak(dest?: AudioNode, pitch = 1) {',
    '    const p = Math.max(0.4, Math.min(2.4, pitch));',
    '    this.sfx(dest, [',
    "      { k: 't', f: 900 * p, d: 0.1, g: 0.09, f2: 1500 * p, w: 'sine' },",
    "      { k: 't', f: 1400 * p, d: 0.12, g: 0.08, f2: 700 * p, w: 'sine', t: 0.1 },",
    '    ]);',
    '  }',
  ].join(eol);
  s = s.slice(0, oldStart) + replacement + s.slice(oldEnd);
  fs.writeFileSync(file, s, 'utf8');
  console.log('patched playBalloonSqueak');
} else {
  console.log('playBalloonSqueak not found');
}
