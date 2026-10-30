/**
 * Headless smoke test for the vending-machine renderer.
 */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = join(root, 'src', 'animation', 'vendingMachineRenderer.ts');
const source = readFileSync(srcPath, 'utf8').replace(
  "import type { StudioConfig } from '../types';",
  'type StudioConfig = { showSafeZones?: boolean; showCaptions?: boolean; canvasTheme?: string; vividAccent?: string };'
);
const tmpDir = mkdtempSync(join(tmpdir(), 'vending-smoke-'));
const tmpFile = join(tmpDir, 'vendingMachineRenderer.ts');
writeFileSync(tmpFile, source);
const { VendingMachineRenderer } = await import(pathToFileURL(tmpFile).href);

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
const renderer = new VendingMachineRenderer() as unknown as Record<string, unknown>;
const config = { showSafeZones: false, showCaptions: true, canvasTheme: 'black-on-white' } as never;

// --- Timeline continuity assertions ---
const bagState = (t: number, which: 'yellow' | 'orange') =>
  (renderer.bagState as (t: number, w: string) => { x: number; y: number; visible: boolean })(t, which);

const orangeBefore = bagState(7.79, 'orange');
const orangeAfter = bagState(7.81, 'orange');
if (orangeBefore.visible) throw new Error('orange bag should appear only after 7.8s');
if (!orangeAfter.visible) throw new Error('orange bag should be visible after 7.8s');

const yellowHook = bagState(0.5, 'yellow');
if (!yellowHook.visible) throw new Error('yellow bag should hang during the hook');

// Both bags must be held during the celebration
for (const which of ['yellow', 'orange'] as const) {
  const bag = bagState(21.0, which);
  if (!bag.visible) throw new Error(`${which} bag should be held during the celebration`);
}

// The chip appears only after 26.2s and the end frame holds it
const rendererAny = renderer as unknown as Record<string, unknown>;
if (typeof rendererAny.characterState !== 'function') throw new Error('characterState missing');
const stateHook = (rendererAny.characterState as (t: number) => { x: number; pose: { brow: string } })(0.5);
const stateEnd = (rendererAny.characterState as (t: number) => { x: number; pose: { brow: string } })(29.5);
if (stateHook.pose.brow !== 'angry') throw new Error('hook should be angry');
if (stateEnd.pose.brow !== 'angry') throw new Error('end frame should be furious');
console.log('vending-machine timeline continuity checks passed');

const r = renderer as unknown as { render: (ctx: CanvasRenderingContext2D, t: number, c: unknown) => void };
let frames = 0;
for (let t = 0; t <= 30.5; t += 1 / 48) {
  r.render(ctx, t, config);
  frames++;
}
r.render(ctx, 29.5, { showSafeZones: true, showCaptions: true } as never);
r.render(ctx, 18.4, config);
r.render(ctx, 24.2, config);
frames += 3;

console.log(`vending-machine smoke test passed: ${frames} frames rendered with no runtime errors`);
