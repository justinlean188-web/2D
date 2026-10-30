/**
 * Headless smoke test for the pancake-flip renderer.
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = join(root, 'src', 'animation', 'pancakeFlipRenderer.ts');
const source = readFileSync(srcPath, 'utf8').replace(
  "import type { StudioConfig } from '../types';",
  'type StudioConfig = { showSafeZones?: boolean; showCaptions?: boolean; canvasTheme?: string; vividAccent?: string };'
);
const tmpDir = mkdtempSync(join(tmpdir(), 'pancake-smoke-'));
const tmpFile = join(tmpDir, 'pancakeFlipRenderer.ts');
writeFileSync(tmpFile, source);
const { PancakeFlipRenderer } = await import(pathToFileURL(tmpFile).href);

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
const renderer = new PancakeFlipRenderer();
const config = { showSafeZones: false, showCaptions: true, canvasTheme: 'black-on-white' } as never;

// --- Timeline continuity assertions ---
type Any = Record<string, (...args: never[]) => unknown>;
const r = renderer as unknown as Any;
const pancake = (t: number) =>
  (r as Any & { pancakeState: (t: number) => { x: number; y: number; visible: boolean } }).pancakeState(t);

const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
const check = (label: string, ax: number, ay: number, bx: number, by: number, tol = 3) => {
  if (!near(ax, bx, tol) || !near(ay, by, tol)) {
    throw new Error(`${label}: (${ax.toFixed(1)},${ay.toFixed(1)}) != (${bx.toFixed(1)},${by.toFixed(1)}) tol=${tol}`);
  }
};

// Launch hand-off: pancake leaves the ramp and stays airborne
const p1 = pancake(15.49)!;
const p2 = pancake(15.51)!;
check('ramp to airborne hand-off', p1.x, p1.y, p2.x, p2.y, 8);
// Landing hand-off: floating arc meets the plate
const p3 = pancake(18.59)!;
const p4 = pancake(18.61)!;
check('airborne to plate hand-off', p3.x, p3.y, p4.x, p4.y, 6);
// Resting on the plate through the celebration
const p5 = pancake(20.0)!;
const p6 = pancake(23.9)!;
check('plate rest', p5.x, p5.y, p6.x, p6.y);
// Pancake hat on the head
const p7 = pancake(29.5)!;
if (!p7.visible) throw new Error('pancake hat should be visible at 29.5s');
console.log('pancake-flip timeline continuity checks passed');

let frames = 0;
for (let t = 0; t <= 30.5; t += 1 / 48) {
  renderer.render(ctx, t, config);
  frames++;
}
renderer.render(ctx, 29.5, { showSafeZones: true, showCaptions: true } as never);
renderer.render(ctx, 15.0, config);
renderer.render(ctx, 18.4, config);
frames += 3;

console.log(`pancake-flip smoke test passed: ${frames} frames rendered with no runtime errors`);
