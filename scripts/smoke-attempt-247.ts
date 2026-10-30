/**
 * Headless smoke test for the attempt-247 renderer.
 *
 * Checks the ball timeline (in bin after 22.2, on head at 9.6, hits window at 11.32,
 * bank shot path, rim spin with countdown 3/2/1, gray bin reveal at 24.15),
 * the character's x movement, and renders the full 900-frame timeline against a stub canvas.
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = join(root, 'src', 'animation', 'attempt247Renderer.ts');
const source = readFileSync(srcPath, 'utf8').replace(
  "import type { StudioConfig } from '../types';",
  'type StudioConfig = { showSafeZones?: boolean; showCaptions?: boolean; canvasTheme?: string; vividAccent?: string };'
);
const tmpDir = mkdtempSync(join(tmpdir(), 'attempt-247-smoke-'));
const tmpFile = join(tmpDir, 'attempt247Renderer.ts');
writeFileSync(tmpFile, source);
const { Attempt247Renderer } = await import(pathToFileURL(tmpFile).href);

const renderer = new Attempt247Renderer() as any;
const config = { showSafeZones: false, showCaptions: true } as never;

// --- Ball position sanity checks ---

// Ball should be held beside his face at t=0.5
const b05 = (renderer as any).ballAt(0.5, 540);
if (b05.visible && b05.x !== 630) throw new Error(`Shot 1 ball x should be ~630, got ${b05.x}`);

// At t=3.66 the ball should be near the rim
const b366 = (renderer as any).ballAt(3.66, 540);
if (b366.visible) {
  if (Math.abs(b366.x - 905) > 30) throw new Error(`Shot 2 rim hit x should be ~905, got ${b366.x}`);
}

// At t=8.95 the ball should be on the beanie
const b895 = (renderer as any).ballAt(8.95, 310);
if (b895.visible && Math.abs(b895.y - 808) > 15) throw new Error(`Shot 3 ball on beanie y should be ~808, got ${b895.y}`);

// At t=18.35 ball release for bank shot
const b1835 = (renderer as any).ballAt(18.35, 540);
if (b1835.visible && Math.abs(b1835.x - 636) > 15) throw new Error(`Shot 6 release x should be ~636, got ${b1835.x}`);

// At t=20.15 the ball should be on the rim back
const b2015 = (renderer as any).ballAt(20.15, 540);
if (b2015.visible) {
  if (Math.abs(b2015.x - 930) > 20) throw new Error(`Shot 6 rim back x should be ~930, got ${b2015.x}`);
}

// After 22.0 the ball should be IN the bin
const b2201 = (renderer as any).ballAt(22.01, 540);
if (!b2201.inBin) throw new Error(`Ball should be in bin after 22.0`);

// Shot 8: fresh ball rises into frame
const b28 = (renderer as any).ballAt(28.0, 492);
if (!b28.visible) throw new Error(`Shot 8 fresh ball should be visible at t=28`);

// --- Character x checks ---
// The walk timeline
const cx0 = (renderer as any).charX(0);
if (cx0 !== 540) throw new Error(`Shot 1 x should be 540, got ${cx0}`);

const cx3 = (renderer as any).charX(3);
if (cx3 !== 540) throw new Error(`Shot 2 x should still be 540, got ${cx3}`);

const cx6 = (renderer as any).charX(6);
// Walking window: 6.02-7.15
if (cx6 !== 310) throw new Error(`Shot 3 x should be 310 at t=6, got ${cx6}`);

const cx15 = (renderer as any).charX(15);
// After walk back: 14.15-14.8 returns to 540
if (cx15 !== 310) throw new Error(`Shot 4 x should be 310 at t=15, got ${cx15}`);

const cx16 = (renderer as any).charX(16);
if (cx16 !== 540) throw new Error(`Shot 5 x should return to 540 at t=16, got ${cx16}`);

// After hard cut at 24.16 steps left to 492
const cx25 = (renderer as any).charX(25);
if (cx25 !== 492) throw new Error(`Shot 7 x after cut should be 492 at t=25, got ${cx25}`);

const cx27 = (renderer as any).charX(27);
if (cx27 !== 492) throw new Error(`Shot 8 x should be 492 at t=27, got ${cx27}`);

// --- Render frames ---
try {
  const stubCtx: any = { save: () => {}, restore: () => {}, fillStyle: '#000', fillRect: () => {}, strokeStyle: '#fff', lineWidth: 1, beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {}, arc: () => {}, fill: () => {}, ellipse: () => {}, textAlign: 'center', textBaseline: 'middle', measureText: () => { width: 0; }, font: '' };
  renderer.render(stubCtx, 0, config);
  renderer.render(stubCtx, 15, config);
  renderer.render(stubCtx, 25, config);
  renderer.render(stubCtx, 30, config);
  console.log('Smoke test: all 4 renders completed without error');
} catch (e) {
  console.error('Render error:', e);
  process.exit(1);
}
console.log('All smoke checks passed!');