/**
 * Headless smoke test for the biggest-balloon renderer.
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = join(root, 'src', 'animation', 'biggestBalloonRenderer.ts');
const source = readFileSync(srcPath, 'utf8').replace(
  "import type { StudioConfig } from '../types';",
  'type StudioConfig = { showSafeZones?: boolean; showCaptions?: boolean; canvasTheme?: string; vividAccent?: string };'
);
const tmpDir = mkdtempSync(join(tmpdir(), 'balloon-smoke-'));
const tmpFile = join(tmpDir, 'biggestBalloonRenderer.ts');
writeFileSync(tmpFile, source);
const { BiggestBalloonRenderer } = await import(pathToFileURL(tmpFile).href);

function makeStubContext() {
  const gradient = { addColorStop: () => {} };
  const target: Record<string, unknown> = {
    canvas: { width: 1080, height: 1920 },
    measureText: (text: string) => ({ width: text.length * 40 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    createPattern: () => null,
  };
  return new Proxy(target, {
    get(obj, prop) {
      if (prop in obj) return obj[prop as string];
      return () => {};
    },
    set(obj, prop, value) {
      obj[prop as string] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
}

const ctx = makeStubContext();
const renderer = new BiggestBalloonRenderer() as unknown as Record<string, unknown>;
const config = { showSafeZones: false, showCaptions: true, canvasTheme: 'black-on-white' } as never;

// --- Timeline continuity assertions ---
const balloonAt = (t: number) =>
  (renderer.balloonState as (t: number) => {
    x: number;
    y: number;
    r: number;
    limp: number;
    hole: boolean;
    visible: boolean;
    neck: { x: number; y: number };
  })(t);

const hook = balloonAt(0.5);
if (!hook.visible || hook.r > 60) throw new Error('the balloon should start limp and small');

const medium = balloonAt(4.6);
if (Math.abs(medium.r - 95) > 2) throw new Error(`head-size balloon expected at 4.6s, got r=${medium.r}`);

const large = balloonAt(8.5);
if (Math.abs(large.r - 230) > 2) throw new Error(`body-size balloon expected at 8.5s, got r=${large.r}`);

const giant = balloonAt(12.5);
if (giant.r < 300) throw new Error(`taller-than-him balloon expected at 12.5s, got r=${giant.r}`);

// It never pops: no hole before the pine poke at 23.3s
for (const t of [2.5, 7.9, 12.0, 18.0, 22.5]) {
  if (balloonAt(t).hole) throw new Error(`the balloon must not have a hole at ${t}s`);
}
if (!balloonAt(23.5).hole) throw new Error('the pine poke should open a hole at 23.3s');

// The deflation shrinks it but never removes it
const deflateEarly = balloonAt(24.2);
const deflateLate = balloonAt(26.5);
if (!(deflateLate.r < deflateEarly.r)) throw new Error('the balloon should shrink during the deflation');
if (!deflateLate.visible) throw new Error('the balloon must never pop or vanish');

// Shot 8: the limp mask slides down off his face
const mask = balloonAt(27.5);
const pushedDown = balloonAt(29.5);
if (mask.limp < 0.99) throw new Error('shot 8 needs the limp deflated balloon');
if (!(pushedDown.y > mask.y + 100)) throw new Error('the mask should be pushed down off his face by 29.5s');

// Character posing checks
const charAt = (t: number) =>
  (renderer.charState as (t: number, b: unknown) => {
    x: number;
    hipY: number;
    pose: { brow: string; eye: string; legs: string };
  })(t, balloonAt(t));

if (charAt(0.5).pose.brow !== 'angry') throw new Error('the hook should be determined');
if (charAt(8.5).pose.eye !== 'shut') throw new Error('the fake-out should shut his eyes');
if (charAt(17.0).pose.legs !== 'dangle') throw new Error('he should be dangling in the sky shot');
if (charAt(29.5).pose.brow !== 'angry') throw new Error('the end frame should be furious');
console.log('biggest-balloon timeline continuity checks passed');

const r = renderer as unknown as { render: (ctx: CanvasRenderingContext2D, t: number, c: unknown) => void };
let frames = 0;
for (let t = 0; t <= 30.5; t += 1 / 48) {
  r.render(ctx, t, config);
  frames++;
}
r.render(ctx, 7.5, { showSafeZones: true, showCaptions: true } as never);
r.render(ctx, 23.4, config);
r.render(ctx, 29.5, config);
frames += 3;

console.log(`biggest-balloon smoke test passed: ${frames} frames rendered with no runtime errors`);
