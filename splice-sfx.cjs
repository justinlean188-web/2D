const fs = require('fs');

const FILE = 'src/audio/soundEngine.ts';
let s = fs.readFileSync(FILE, 'utf8');
const block = fs.readFileSync('gen-sfx-block.txt', 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';

if (s.includes('playDominoTrickshotScoreSection')) {
  console.log('already spliced');
  process.exit(0);
}

const layerType = [
  'export interface SfxLayer {',
  "  k: 't' | 'n';",
  '  f: number;',
  '  f2?: number;',
  '  d: number;',
  '  g: number;',
  '  w?: OscillatorType;',
  '  ft?: BiquadFilterType;',
  '  q?: number;',
  '  t?: number;',
  '}',
  '',
  '',
].join(eol);

const classAt = s.indexOf('class SoundEngine {');
if (classAt < 0) throw new Error('class not found');
s = s.slice(0, classAt) + layerType + s.slice(classAt);

const anchor = `}${eol}${eol}export const soundEngine = new SoundEngine();`;
const anchorAt = s.indexOf(anchor);
if (anchorAt < 0) throw new Error('class end anchor not found');

const body = block.replace(/\r?\n/g, eol);
s = s.slice(0, anchorAt) + body + s.slice(anchorAt);
fs.writeFileSync(FILE, s, 'utf8');
console.log('spliced, now', s.length, 'chars');
