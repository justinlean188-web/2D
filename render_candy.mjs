import { createCanvas } from 'file:///D:/Clipped/2DAnimation/node_modules/@napi-rs/canvas/index.js';
import fs from 'node:fs';
import path from 'node:path';

const out = 'C:/Users/olive/AppData/Local/Temp/opencode/candy-frames';
fs.mkdirSync(out, { recursive: true });

const { CandyClawRenderer } = await import(
  'file:///D:/Clipped/2DAnimation/src/animation/candyClawRenderer.ts'
);

const canvas = createCanvas(1080, 1920);
const ctx = canvas.getContext('2d');
const renderer = new CandyClawRenderer();
const config = {
  activeProject: 'candy-claw',
  canvasTheme: 'black-on-white',
  vividAccent: '#ef4444',
  accentColor: '#000000',
  enableVoiceOver: false,
  enableSFX: true,
  voiceRate: 1,
  voicePitch: 1,
  voiceVolume: 1,
  showCaptions: true,
  showSafeZones: false,
  fpsMode: 24,
  customVO1: '',
  customVO2: '',
  customEndCaption: '',
};

const times = [1.0, 3.0, 5.0, 7.0, 9.0, 11.0, 13.0, 15.0, 17.0, 19.0, 21.0, 23.0, 25.0, 27.0, 28.5, 29.5];
for (const t of times) {
  ctx.save();
  ctx.clearRect(0, 0, 1080, 1920);
  renderer.render(ctx, t, config);
  ctx.restore();
  const file = path.join(out, `frame-${t.toFixed(2)}.png`);
  fs.writeFileSync(file, await canvas.encode('png'));
  console.log(file);
}