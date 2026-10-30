/**
 * Headless smoke test for the find-the-ball renderer.
 *
 * Checks the cup choreography (the six swaps must land back on
 * orange / teal / purple), the ball's escape from under the middle cup, and
 * the character beats. Then renders the whole timeline against a stub canvas.
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = join(root, 'src', 'animation', 'findTheBallRenderer.ts');
const source = readFileSync(srcPath, 'utf8').replace(
  "import type { StudioConfig } from '../types';",
  'type StudioConfig = { showSafeZones?: boolean; showCaptions?: boolean; canvasTheme?: string; vividAccent?: string };'
);
const tmpDir = mkdtempSync(join(tmpdir(), 'find-ball-smoke-'));
const tmpFile = join(tmpDir, 'findTheBallRenderer.ts');
writeFileSync(tmpFile, source);
const { FindTheBallRenderer } = await import(pathToFileURL(tmpFile).href);

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

interface Cup {
  key: string;
  x: number;
  shadowX: number;
  lift: number;
}
interface Ball {
  x: number;
  y: number;
  visible: boolean;
}
interface Char {
  pose: { brow: string; eye: string; mouth: string; look: string; legs: string };
}

const ctx = makeStubContext();
const renderer = new FindTheBallRenderer() as unknown as Record<string, unknown>;
const config = { showSafeZones: false, showCaptions: true } as never;

const cupsAt = (t: number) => (renderer.cupStates as (t: number) => Cup[])(t);
const ballAt = (t: number) => (renderer.ballState as (t: number) => Ball)(t);
const charAt = (t: number) => (renderer.charState as (t: number, c: Cup[]) => Char)(t, cupsAt(t));

const cupX = (t: number, key: string) => {
  const cup = cupsAt(t).find((c) => c.key === key);
  if (!cup) throw new Error(`missing ${key} cup at ${t}s`);
  return cup.x;
};

// --- Setup: the row starts orange / teal / purple, ball under the middle cup.
if (Math.abs(cupX(5.0, 'orange') - 360) > 1) throw new Error('orange cup should start on the left');
if (Math.abs(cupX(5.0, 'teal') - 540) > 1) throw new Error('teal cup should start in the middle');
if (Math.abs(cupX(5.0, 'purple') - 720) > 1) throw new Error('purple cup should start on the right');
if (ballAt(5.0).visible) throw new Error('the ball must be hidden under the teal cup during the setup');

// The teal cup lifts and shifts clear of his face in shot 2, then covers the ball.
const lifted = cupsAt(3.0).find((c) => c.key === 'teal')!;
if (lifted.lift < 0.9) throw new Error('the teal cup should be lifted at 3.0s');
if (lifted.x > 430) throw new Error('the lifted middle cup should shift left, clear of his face');
if (Math.abs(lifted.shadowX - 540) > 1) throw new Error('the lifted cup shadow should stay on its slot');

// --- Slow shuffle: two readable swaps.
if (Math.abs(cupX(9.0, 'teal') - 360) > 1) throw new Error('after the slow swaps the teal cup should be on the left');
if (Math.abs(cupX(9.0, 'purple') - 540) > 1) throw new Error('after the slow swaps the purple cup should be in the middle');
if (Math.abs(cupX(9.0, 'orange') - 720) > 1) throw new Error('after the slow swaps the orange cup should be on the right');

// --- Fast shuffle: the ball is revealed at 11.36s and rolls left off the table.
const hidden = ballAt(10.0);
if (hidden.visible) throw new Error('the ball must stay hidden during the fast shuffle build-up');
const revealed = ballAt(11.8);
if (!revealed.visible) throw new Error('the ball should be revealed at 11.8s');
if (revealed.x > 500) throw new Error(`the ball should be rolling left, got x=${revealed.x}`);
const falling = ballAt(12.8);
if (!(falling.y > 1200)) throw new Error('the ball should be falling off the table at 12.8s');
const onFloor = ballAt(14.6);
if (onFloor.y < 1400) throw new Error('the ball should be resting on the floor by 14.6s');
if (onFloor.x > 360) throw new Error('the resting ball should sit left of the table centre');

// The final row is back to orange / teal / purple with the trick cup in the middle.
if (Math.abs(cupX(14.6, 'orange') - 360) > 1) throw new Error('the orange cup must finish on the left');
if (Math.abs(cupX(14.6, 'teal') - 540) > 1) throw new Error('the teal cup must finish in the middle');
if (Math.abs(cupX(14.6, 'purple') - 720) > 1) throw new Error('the purple cup must finish on the right');

// The ball is long gone before the reveals.
if (ballAt(20.0).visible === false) throw new Error('the escaped ball stays visible on the floor');

// --- Reveals: left, right, then the middle cup.
const middleLift = cupsAt(22.6).find((c) => c.key === 'teal')!;
if (middleLift.lift < 0.9) throw new Error('the middle cup should be lifted by 22.6s');
if (charAt(25.2).pose.look !== 'down') throw new Error('he should look down at the ball at 25.2s');
if (charAt(26.0).pose.brow !== 'angry') throw new Error('he should be furious by 26s');
if (charAt(29.5).pose.brow !== 'angry') throw new Error('the end frame should stay furious');

// --- Shots 1 and 8 mirror each other.
if (charAt(0.5).pose.mouth !== 'smirk') throw new Error('the hook should be smug');
if (charAt(29.5).pose.eye !== 'squint') throw new Error('the end frame should squint in fury');

console.log('find-the-ball timeline continuity checks passed');

const r = renderer as unknown as { render: (ctx: CanvasRenderingContext2D, t: number, c: unknown) => void };
let frames = 0;
for (let t = 0; t <= 30.5; t += 1 / 48) {
  r.render(ctx, t, config);
  frames++;
}
r.render(ctx, 7.5, { showSafeZones: true, showCaptions: true } as never);
r.render(ctx, 16.7, config);
r.render(ctx, 29.5, config);
frames += 3;

console.log(`find-the-ball smoke test passed: ${frames} frames rendered with no runtime errors`);
