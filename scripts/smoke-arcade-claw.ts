/**
 * Headless smoke test for the arcade-claw renderer.
 *
 * Stubs CanvasRenderingContext2D with a recording no-op proxy, then steps the
 * whole 30-second timeline (plus the freeze tail) so any runtime error in any
 * code path — poses, claw timeline, ball flight, avalanche, effects — throws
 * loudly instead of silently breaking the film.
 *
 * The renderer's only import is the `StudioConfig` type from ../types, which
 * Node's type stripping cannot resolve extensionlessly, so the source is
 * copied to a temp file with that import swapped for a local stub type.
 *
 * Run with: node --experimental-strip-types scripts/smoke-arcade-claw.ts
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = join(root, 'src', 'animation', 'arcadeClawRenderer.ts');
const source = readFileSync(srcPath, 'utf8').replace(
  "import { StudioConfig } from '../types';",
  'type StudioConfig = { showSafeZones?: boolean };'
);
const tmpDir = mkdtempSync(join(tmpdir(), 'arcade-smoke-'));
const tmpFile = join(tmpDir, 'arcadeClawRenderer.ts');
writeFileSync(tmpFile, source);
const { ArcadeClawRenderer } = await import(pathToFileURL(tmpFile).href);

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
      // Any other member is a draw call: return a no-op function.
      return () => {};
    },
    set(obj, prop, value) {
      obj[prop as string] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
}

const ctx = makeStubContext();
const renderer = new ArcadeClawRenderer();
const config = { showSafeZones: false } as never;

// --- Timeline continuity assertions -------------------------------------
// These lock the design invariants: every hand-off between two timeline
// branches must happen at the exact same position, or the film pops.
type Any = Record<string, (...args: never[]) => unknown>;
const r = renderer as unknown as Any;
const bear = (t: number) => (r as Any & { giantBear: (t: number) => { x: number; y: number; hidden: boolean } }).giantBear(t);
const claw = (t: number) => (r as Any & { clawAt: (t: number) => { x: number; y: number } }).clawAt(t);
const ball = (t: number) => (r as Any & { ballFlight: (t: number) => { x: number; y: number } | null }).ballFlight(t);

const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
const check = (label: string, ax: number, ay: number, bx: number, by: number, tol = 1.5) => {
  if (!near(ax, bx, tol) || !near(ay, by, tol)) {
    throw new Error(`${label}: (${ax},${ay}) != (${bx},${by}) tol=${tol}`);
  }
};

// Grip hand-off: bear is home until the claw closes, then follows it.
const g1 = bear(5.7499), g2 = bear(5.7501);
check('bear home→grip', g1.x, g1.y, claw(5.75).x, claw(5.75).y + 100);
check('bear grip continuity', g1.x, g1.y, g2.x, g2.y);
const g3 = bear(21.4999), g4 = bear(21.5001);
check('bear home→grip 2', g3.x, g3.y, g4.x, g4.y);
// Release hand-off: carry → fall.
const g5 = bear(22.7999), g6 = bear(22.8001);
check('bear carry→fall', g5.x, g5.y, g6.x, g6.y);
// Ball hand-off: flight lands on the button and stays.
const b1 = ball(18.6199)!, b2 = ball(18.6201)!;
check('ball flight→button', b1.x, b1.y, b2.x, b2.y);
// Ricochet boundary continuity.
const b3 = ball(16.0699)!, b4 = ball(16.0701)!;
check('ball bumper→cabinet', b3.x, b3.y, b4.x, b4.y);
const b5 = ball(15.5499)!, b6 = ball(15.5501)!;
check('ball lip→bumper', b5.x, b5.y, b6.x, b6.y, 4);
// The held ball lands exactly on the ramp lip when it detaches at 14.28s.
{
  const pose = (r as Any & { getPose: (t: number) => { hipX: number; hipY: number; lean: number; rightHand: { x: number; y: number } } }).getPose(14.279);
  const hx = pose.hipX + pose.rightHand.x + 6;
  const hy = pose.hipY + pose.rightHand.y - 26;
  check('held ball → lip', hx, hy, 212, 1332, 3);
}
console.log('timeline continuity checks passed');

let frames = 0;
for (let t = 0; t <= 30.5; t += 1 / 48) {
  renderer.render(ctx, t, config);
  frames++;
}
// Also hit the safe-zones path and a couple of exact cue-boundary times.
renderer.render(ctx, 29.55, { showSafeZones: true } as never);
renderer.render(ctx, 14.28, config);
renderer.render(ctx, 22.8, config);
frames += 3;

console.log(`arcade-claw smoke test passed: ${frames} frames rendered with no runtime errors`);
