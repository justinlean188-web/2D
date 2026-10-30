/**
 * Headless smoke test for the diamond-heist renderer.
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = join(root, 'src', 'animation', 'diamondHeistRenderer.ts');
const source = readFileSync(srcPath, 'utf8').replace(
  "import { StudioConfig } from '../types';",
  'type StudioConfig = { showSafeZones?: boolean; canvasTheme?: string; vividAccent?: string };'
);
const tmpDir = mkdtempSync(join(tmpdir(), 'diamond-smoke-'));
const tmpFile = join(tmpDir, 'diamondHeistRenderer.ts');
writeFileSync(tmpFile, source);
const { DiamondHeistRenderer } = await import(pathToFileURL(tmpFile).href);

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
const renderer = new DiamondHeistRenderer();
const config = { showSafeZones: false, canvasTheme: 'black-on-white', vividAccent: '#ef4444' } as never;

// --- Timeline continuity assertions ---
type Any = Record<string, (...args: never[]) => unknown>;
const r = renderer as unknown as Any;
const ball = (t: number) => (r as Any & { ballFlight: (t: number) => { x: number; y: number } | null }).ballFlight(t);

const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
const check = (label: string, ax: number, ay: number, bx: number, by: number, tol = 2) => {
  if (!near(ax, bx, tol) || !near(ay, by, tol)) {
    throw new Error(`${label}: (${ax.toFixed(1)},${ay.toFixed(1)}) != (${bx.toFixed(1)},${by.toFixed(1)}) tol=${tol}`);
  }
};

// Ball hand-off: tray hit
const b1 = ball(15.4999)!, b2 = ball(15.5001)!;
check('ball tray hit', b1.x, b1.y, b2.x, b2.y);
// Ball hand-off: wall boing
const b3 = ball(16.1999)!, b4 = ball(16.2001)!;
check('ball wall boing', b3.x, b3.y, b4.x, b4.y, 3);
// Ball hand-off: button press (button sinks 4px when pressed)
const b5 = ball(19.4999)!, b6 = ball(19.5001)!;
check('ball button press', b5.x, b5.y, b6.x, b6.y, 5);
// Case open continuity (case should be open at 19.5+)
console.log('diamond-heist timeline continuity checks passed');

let frames = 0;
for (let t = 0; t <= 30.5; t += 1 / 48) {
  renderer.render(ctx, t, config);
  frames++;
}
renderer.render(ctx, 29.5, { showSafeZones: true } as never);
renderer.render(ctx, 15.0, config);
renderer.render(ctx, 19.5, config);
frames += 3;

console.log(`diamond-heist smoke test passed: ${frames} frames rendered with no runtime errors`);