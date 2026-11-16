import type { StudioConfig } from '../types';
import { drawHand } from './handRenderer';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

// --- palette (Character colors locked to POP_UP_TENT_CHARACTER.md) --------
const INK = '#17121f';
const WHITE = '#ffffff';

const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const BEANIE_POM = '#ff6b6b';
const SHIRT = '#ffd166';
const SHIRT_DEEP = '#e8b23f';
const TROUSER = '#2f5fa8';
const SHOE = '#141414';

// Room & Machine palette (Modern Pop flat 2D vector)
const WALL_TOP = '#d8f3ff';
const WALL_MAIN = '#eef9ff';
const WALL_STRIPE = '#dff3fe';
const BASEBOARD = '#ffffff';
const FLOOR = '#e3a96f';
const FLOOR_LINE = '#c88b50';
const DOOR_FRAME = '#f8fafc';
const DOOR_FILL = '#8d5a3b';
const DOOR_PANEL = '#72462b';
const KNOB_GOLD = '#ffd166';
const MACHINE_BODY = '#2b4c7e';
const MACHINE_DARK = '#1b3154';
const MACHINE_TRIM = '#60a5fa';
const SCREEN_BG = '#0f172a';
const SCREEN_CYAN = '#22d3ee';
const BTN_RED = '#ef233c';
const BTN_RED_DEEP = '#b91c1c';
const FLASH_CYAN = '#67e8f9';
const FLASH_GOLD = '#fde047';

const FLOOR_Y = 1500;
const HEAD_R = 70;

// Machine world coordinates
const MACH_X = 250;
const CLONE_BTN_X = 342;
const CLONE_BTN_Y = 1118;
const RESET_BTN_X = 340;
const RESET_BTN_Y = 1252;

// --- helpers -------------------------------------------------------------
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
};
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 2);
const inv = (a: number, b: number, t: number) => clamp((t - a) / (b - a), 0, 1);

interface Pt {
  x: number;
  y: number;
}

// --- pose ----------------------------------------------------------------
type MouthShape =
  | 'flat'
  | 'smile'
  | 'grin'
  | 'o'
  | 'frown'
  | 'grit'
  | 'smirk'
  | 'bigsmile';
type BrowShape =
  | 'normal'
  | 'angry'
  | 'raised'
  | 'sad'
  | 'cocky'
  | 'determined'
  | 'uneven';
type EyeShape = 'open' | 'wide' | 'squint' | 'shut' | 'happy';
type LookDir = 'front' | 'down' | 'up' | 'right' | 'left';

interface Pose {
  lean: number;
  hipDrop: number;
  headTilt: number;
  headDrop: number;
  headTurn: number;
  look: LookDir;
  mouth: MouthShape;
  brow: BrowShape;
  eye: EyeShape;
  stance: number;
  footLift: number;
  handL: Pt; // relative x from character x, world y at ground (FLOOR_Y)
  handR: Pt;
  bendL: 1 | -1;
  bendR: 1 | -1;
  gripL: boolean;
  gripR: boolean;
  fistL: boolean;
  fistR: boolean;
  pointL: boolean;
  pointR: boolean;
  beanieOn: boolean;
  crouch: number;
  sit: number;
}

type PosePatch = Partial<Pose>;

const BASE_POSE: Pose = {
  lean: 0,
  hipDrop: 0,
  headTilt: 0.02,
  headDrop: 0,
  headTurn: -3,
  look: 'left',
  mouth: 'smile',
  brow: 'normal',
  eye: 'open',
  stance: 0,
  footLift: 0,
  handL: { x: -68, y: 1248 },
  handR: { x: 68, y: 1248 },
  bendL: 1,
  bendR: 1,
  gripL: false,
  gripR: false,
  fistL: false,
  fistR: false,
  pointL: false,
  pointR: false,
  beanieOn: true,
  crouch: 0,
  sit: 0,
};

const POSE_PATCHES: { t: number; p?: PosePatch }[] = [
  // --- Scene 1 (0–6s): Approaches CLONE machine, presses button, shocked by twin ---
  {
    t: 0.0,
    p: {
      lean: -0.05,
      headTurn: -6,
      look: 'left',
      mouth: 'smile',
      brow: 'normal',
      eye: 'open',
      handL: { x: -72, y: 1244 },
      handR: { x: 72, y: 1244 },
    },
  },
  {
    t: 1.4,
    p: {
      lean: -0.02,
      headTurn: -8,
      look: 'left',
      mouth: 'grin',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -82, y: 1228 },
      handR: { x: 70, y: 1248 },
    },
  },
  {
    t: 2.35,
    p: {
      lean: -0.08,
      headTilt: -0.04,
      headTurn: -8,
      look: 'left',
      mouth: 'bigsmile',
      brow: 'cocky',
      eye: 'happy',
      pointL: true,
      bendL: -1,
      handL: { x: -120, y: 1122 },
      handR: { x: 70, y: 1248 },
    },
  },
  {
    t: 2.85,
    p: {
      lean: -0.1,
      headTurn: -8,
      look: 'left',
      mouth: 'grin',
      brow: 'raised',
      eye: 'open',
      pointL: true,
      bendL: -1,
      handL: { x: -102, y: 1134 },
      handR: { x: 70, y: 1248 },
    },
  },
  {
    t: 3.3,
    p: {
      lean: -0.08,
      headTilt: 0.05,
      headTurn: 8,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      pointL: false,
      bendL: 1,
      handL: { x: -95, y: 1230 },
      handR: { x: 96, y: 1230 },
    },
  },
  {
    t: 4.5,
    p: {
      lean: 0.04,
      headTilt: -0.04,
      headTurn: 8,
      look: 'right',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      pointR: true,
      bendR: -1,
      handL: { x: -68, y: 1248 },
      handR: { x: 158, y: 1030 },
    },
  },

  // --- Scene 2 (6–12s): Repeatedly presses CLONE button; 5 Stickmen crowd room ---
  {
    t: 6.1,
    p: {
      lean: -0.08,
      headTilt: 0,
      headTurn: -8,
      look: 'left',
      mouth: 'grin',
      brow: 'cocky',
      eye: 'open',
      pointR: false,
      pointL: true,
      bendR: 1,
      bendL: -1,
      handL: { x: -115, y: 1120 },
      handR: { x: 70, y: 1248 },
    },
  },
  {
    t: 6.55,
    p: {
      lean: -0.1,
      headTurn: -8,
      look: 'left',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'open',
      handL: { x: -102, y: 1132 },
      handR: { x: 70, y: 1248 },
    },
  },
  {
    t: 7.7,
    p: {
      lean: -0.1,
      headTurn: -6,
      look: 'left',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      handL: { x: -102, y: 1134 },
      handR: { x: 76, y: 1238 },
    },
  },
  {
    t: 8.9,
    p: {
      lean: -0.08,
      headTurn: -4,
      look: 'left',
      mouth: 'frown',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -102, y: 1134 },
      handR: { x: 78, y: 1235 },
    },
  },
  {
    t: 9.9,
    p: {
      lean: 0,
      headTilt: 0.02,
      headTurn: 4,
      look: 'right',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      pointL: false,
      fistL: true,
      fistR: true,
      bendL: 1,
      bendR: 1,
      handL: { x: -72, y: 1246 },
      handR: { x: 72, y: 1246 },
    },
  },

  // --- Scene 3 (12–18s): Clones copy every move; room packs with clones ---
  {
    t: 12.2,
    p: {
      lean: 0,
      headTurn: 3,
      look: 'front',
      mouth: 'flat',
      brow: 'uneven',
      eye: 'open',
      fistL: false,
      fistR: false,
      handL: { x: -68, y: 1248 },
      handR: { x: 68, y: 1248 },
    },
  },
  {
    t: 13.0,
    p: {
      lean: 0.03,
      headTurn: 4,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      bendR: -1,
      handL: { x: -68, y: 1248 },
      handR: { x: 118, y: 895 },
    },
  },
  {
    t: 14.0,
    p: {
      lean: 0,
      headTurn: 0,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      bendL: -1,
      bendR: -1,
      handL: { x: -120, y: 895 },
      handR: { x: 120, y: 895 },
    },
  },
  {
    t: 15.0,
    p: {
      lean: 0,
      crouch: 0.14,
      headTurn: 0,
      look: 'front',
      mouth: 'grit',
      brow: 'determined',
      eye: 'wide',
      bendL: -1,
      bendR: -1,
      handL: { x: -130, y: 900 },
      handR: { x: 130, y: 900 },
    },
  },
  {
    t: 15.85,
    p: {
      lean: -0.06,
      crouch: 0,
      headTurn: 0,
      look: 'front',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      bendL: 1,
      bendR: 1,
      handL: { x: -96, y: 1222 },
      handR: { x: 96, y: 1222 },
    },
  },

  // --- Scene 4 (18–24s): Tries escaping, arguing, everyone points at him ---
  {
    t: 18.2,
    p: {
      lean: 0.2,
      headTurn: 8,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      fistL: true,
      fistR: true,
      handL: { x: -78, y: 1236 },
      handR: { x: 86, y: 1230 },
    },
  },
  {
    t: 19.3,
    p: {
      lean: -0.2,
      headTurn: -8,
      look: 'left',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      fistL: true,
      fistR: true,
      handL: { x: -86, y: 1230 },
      handR: { x: 78, y: 1236 },
    },
  },
  {
    t: 20.3,
    p: {
      lean: 0,
      headTurn: 4,
      look: 'right',
      mouth: 'o',
      brow: 'angry',
      eye: 'wide',
      fistL: false,
      fistR: false,
      bendL: -1,
      bendR: -1,
      handL: { x: -135, y: 1030 },
      handR: { x: 135, y: 1030 },
    },
  },
  {
    t: 22.0,
    p: {
      lean: -0.04,
      headTurn: 0,
      look: 'front',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      pointR: true,
      bendL: 1,
      bendR: -1,
      handL: { x: -72, y: 1244 },
      handR: { x: 18, y: 1088 },
    },
  },

  // --- Scene 5 (24–30s): Squeezes to RESET button, wipes crowd, tiny shoulder clone waves ---
  {
    t: 24.15,
    p: {
      lean: -0.18,
      headTurn: -8,
      look: 'left',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      pointR: false,
      pointL: true,
      bendL: 1,
      bendR: 1,
      handL: { x: -85, y: 1230 },
      handR: { x: 74, y: 1240 },
    },
  },
  {
    t: 25.1,
    p: {
      lean: -0.16,
      crouch: 0.25,
      headTurn: -8,
      look: 'left',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      pointL: true,
      bendL: 1,
      bendR: 1,
      handL: { x: -94, y: 1260 },
      handR: { x: 72, y: 1265 },
    },
  },
  {
    t: 26.0,
    p: {
      lean: 0,
      crouch: 0,
      headTilt: -0.06,
      headTurn: 0,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      pointL: false,
      fistL: true,
      fistR: true,
      bendL: -1,
      bendR: -1,
      handL: { x: -125, y: 885 },
      handR: { x: 125, y: 885 },
    },
  },
  {
    t: 27.35,
    p: {
      lean: 0,
      headTilt: 0.02,
      headTurn: 0,
      look: 'front',
      mouth: 'smile',
      brow: 'normal',
      eye: 'open',
      fistL: false,
      fistR: false,
      bendL: 1,
      bendR: 1,
      handL: { x: -68, y: 1248 },
      handR: { x: 68, y: 1248 },
    },
  },
  {
    t: 28.0,
    p: {
      lean: 0.04,
      headTilt: -0.06,
      headTurn: -8,
      look: 'left',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      handL: { x: -74, y: 1244 },
      handR: { x: 74, y: 1244 },
    },
  },
  {
    t: 28.5,
    p: {
      lean: -0.05,
      headTilt: -0.03,
      headTurn: -4,
      look: 'front',
      mouth: 'o',
      brow: 'angry',
      eye: 'wide',
      bendL: -1,
      bendR: -1,
      handL: { x: -135, y: 1020 },
      handR: { x: 135, y: 1020 },
    },
  },
  {
    t: 30.0,
    p: {
      lean: -0.05,
      headTilt: -0.03,
      headTurn: -4,
      look: 'front',
      mouth: 'o',
      brow: 'angry',
      eye: 'wide',
      bendL: -1,
      bendR: -1,
      handL: { x: -135, y: 1020 },
      handR: { x: 135, y: 1020 },
    },
  },
];

function buildPoseKeys() {
  let current: Pose = { ...BASE_POSE };
  const keys: { t: number; pose: Pose }[] = [];
  for (const patch of POSE_PATCHES) {
    current = { ...current, ...(patch.p ?? {}) };
    keys.push({ t: patch.t, pose: current });
  }
  return keys;
}

const POSE_KEYS = buildPoseKeys();

// --- captions ------------------------------------------------------------
const CAPTIONS = [
  { text: 'ONE MORE ME?!', from: 0.25, to: 5.8 },
  { text: 'STOP MAKING COPIES!', from: 6.2, to: 11.8 },
  { text: 'THEY COPY EVERYTHING!', from: 12.2, to: 17.8 },
  { text: "WHO'S THE REAL ME?!", from: 18.2, to: 23.8 },
  { text: "THERE'S STILL ONE?!", from: 24.2, to: 29.9 },
];

// --- camera --------------------------------------------------------------
interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 540, y: 1040, zoom: 1.0 },
  { t: 2.8, x: 430, y: 1045, zoom: 1.12 },
  { t: 4.5, x: 525, y: 1045, zoom: 1.05 },
  { t: 6.5, x: 515, y: 1040, zoom: 1.02 },
  { t: 10.5, x: 540, y: 1035, zoom: 0.96 },
  { t: 13.0, x: 540, y: 1030, zoom: 0.95 },
  { t: 17.5, x: 540, y: 1030, zoom: 0.94 },
  { t: 20.5, x: 540, y: 1030, zoom: 0.96 },
  { t: 22.8, x: 520, y: 1045, zoom: 1.08 },
  { t: 25.3, x: 425, y: 1080, zoom: 1.18 },
  { t: 26.8, x: 530, y: 1035, zoom: 1.12 },
  { t: 28.6, x: 515, y: 985, zoom: 1.48 },
  { t: 30.0, x: 515, y: 985, zoom: 1.52 },
];

// Deterministic clone roster
interface CloneSpec {
  id: number;
  spawnAt: number;
  x: number;
  scale: number;
  yOffset: number;
  eye: EyeShape;
  brow: BrowShape;
  mouth: MouthShape;
  look: LookDir;
  role: 'main' | 'blockerL' | 'blockerR' | 'crowd';
}

const CLONES: CloneSpec[] = [
  // Clone 1 (Scene 1 flash at 2.95s)
  { id: 1, spawnAt: 2.95, x: 645, scale: 1.0, yOffset: 0, eye: 'wide', brow: 'raised', mouth: 'o', look: 'left', role: 'main' },
  // Clones 2-4 (Scene 2 presses at 6.6s, 7.8s, 9.0s -> 5 Stickmen total)
  { id: 2, spawnAt: 6.6, x: 785, scale: 1.0, yOffset: 0, eye: 'open', brow: 'uneven', mouth: 'smirk', look: 'left', role: 'main' },
  { id: 3, spawnAt: 7.8, x: 535, scale: 1.0, yOffset: 0, eye: 'squint', brow: 'angry', mouth: 'frown', look: 'right', role: 'main' },
  { id: 4, spawnAt: 9.0, x: 905, scale: 1.0, yOffset: 0, eye: 'wide', brow: 'sad', mouth: 'o', look: 'left', role: 'blockerR' },

  // Swarm wave 1 (15.7s) - background row (drawn behind)
  { id: 5, spawnAt: 15.7, x: 180, scale: 0.78, yOffset: -72, eye: 'happy', brow: 'raised', mouth: 'bigsmile', look: 'front', role: 'crowd' },
  { id: 6, spawnAt: 15.72, x: 310, scale: 0.78, yOffset: -72, eye: 'wide', brow: 'uneven', mouth: 'o', look: 'front', role: 'crowd' },
  { id: 7, spawnAt: 15.74, x: 430, scale: 0.78, yOffset: -72, eye: 'squint', brow: 'angry', mouth: 'grit', look: 'right', role: 'crowd' },
  { id: 8, spawnAt: 15.76, x: 560, scale: 0.78, yOffset: -72, eye: 'open', brow: 'cocky', mouth: 'grin', look: 'left', role: 'crowd' },
  { id: 9, spawnAt: 15.78, x: 690, scale: 0.78, yOffset: -72, eye: 'shut', brow: 'raised', mouth: 'smile', look: 'front', role: 'crowd' },
  { id: 10, spawnAt: 15.8, x: 820, scale: 0.78, yOffset: -72, eye: 'wide', brow: 'sad', mouth: 'frown', look: 'left', role: 'crowd' },
  { id: 11, spawnAt: 15.82, x: 950, scale: 0.78, yOffset: -72, eye: 'open', brow: 'angry', mouth: 'grit', look: 'left', role: 'crowd' },

  // Swarm wave 2 (16.25s) - midground row
  { id: 12, spawnAt: 16.25, x: 145, scale: 0.89, yOffset: -36, eye: 'squint', brow: 'angry', mouth: 'grit', look: 'right', role: 'blockerL' },
  { id: 13, spawnAt: 16.27, x: 375, scale: 0.89, yOffset: -36, eye: 'wide', brow: 'raised', mouth: 'o', look: 'right', role: 'crowd' },
  { id: 14, spawnAt: 16.29, x: 500, scale: 0.89, yOffset: -36, eye: 'open', brow: 'uneven', mouth: 'smirk', look: 'front', role: 'crowd' },
  { id: 15, spawnAt: 16.31, x: 625, scale: 0.89, yOffset: -36, eye: 'happy', brow: 'normal', mouth: 'bigsmile', look: 'left', role: 'crowd' },
  { id: 16, spawnAt: 16.33, x: 740, scale: 0.89, yOffset: -36, eye: 'squint', brow: 'determined', mouth: 'frown', look: 'left', role: 'crowd' },
  { id: 17, spawnAt: 16.35, x: 865, scale: 0.89, yOffset: -36, eye: 'wide', brow: 'cocky', mouth: 'grin', look: 'left', role: 'blockerR' },

  // Swarm wave 3 (16.8s) - front packers
  { id: 18, spawnAt: 16.8, x: 220, scale: 0.96, yOffset: -12, eye: 'wide', brow: 'raised', mouth: 'o', look: 'right', role: 'blockerL' },
  { id: 19, spawnAt: 16.82, x: 710, scale: 0.96, yOffset: -12, eye: 'angry' as never, brow: 'angry', mouth: 'grit', look: 'left', role: 'crowd' },
  { id: 20, spawnAt: 16.84, x: 965, scale: 0.96, yOffset: -12, eye: 'squint', brow: 'uneven', mouth: 'smirk', look: 'left', role: 'blockerR' },
];
// Ensure clone 19 uses a valid EyeShape
CLONES[18].eye = 'squint';

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

export class CloneButtonDisasterRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = clamp(time, 0, 30);

    ctx.save();
    this.drawRoomBackdrop(ctx);

    ctx.save();
    this.applyCamera(ctx, t);

    this.drawDoorsAndDecor(ctx);
    this.drawCloneMachine(ctx, t);

    // Draw background/midground clones before original, foreground properly sorted
    this.drawCrowdAndCharacters(ctx, t);

    this.drawSpawnFlashes(ctx, t);
    this.drawCelebrationSparkles(ctx, t);

    ctx.restore();

    this.drawFullResetFlash(ctx, t);
    if (config.showCaptions) this.drawCaptions(ctx, t);
    if (config.showSafeZones) this.drawSafeZones(ctx);
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Camera
  // ------------------------------------------------------------------
  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    let a = CAMERA_KEYS[0];
    let b = CAMERA_KEYS[0];
    if (t <= CAMERA_KEYS[0].t) {
      a = CAMERA_KEYS[0];
      b = a;
    } else if (t >= CAMERA_KEYS[CAMERA_KEYS.length - 1].t) {
      a = CAMERA_KEYS[CAMERA_KEYS.length - 1];
      b = a;
    } else {
      for (let i = 0; i < CAMERA_KEYS.length - 1; i++) {
        if (t >= CAMERA_KEYS[i].t && t <= CAMERA_KEYS[i + 1].t) {
          a = CAMERA_KEYS[i];
          b = CAMERA_KEYS[i + 1];
          break;
        }
      }
    }
    const u = b.t === a.t ? 0 : smooth((t - a.t) / (b.t - a.t));
    const cx = lerp(a.x, b.x, u);
    const cy = lerp(a.y, b.y, u);
    const zoom = lerp(a.zoom, b.zoom, u);

    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);
  }

  // ------------------------------------------------------------------
  // Room Backdrop & Decor
  // ------------------------------------------------------------------
  private drawRoomBackdrop(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = WALL_MAIN;
    ctx.fillRect(0, 0, WIDTH, FLOOR_Y);

    ctx.fillStyle = WALL_TOP;
    ctx.fillRect(0, 0, WIDTH, 420);

    // Soft pastel wallpaper stripes
    ctx.fillStyle = WALL_STRIPE;
    for (let x = 40; x < WIDTH; x += 120) {
      ctx.fillRect(x, 0, 56, FLOOR_Y - 12);
    }
  }

  private drawDoorsAndDecor(ctx: CanvasRenderingContext2D) {
    // Extend walls for camera zoom outs
    ctx.fillStyle = FLOOR;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.fillRect(-350, FLOOR_Y, WIDTH + 700, 700);

    // Floorboard lines
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 4;
    for (let y = FLOOR_Y + 48; y < FLOOR_Y + 560; y += 54) {
      ctx.beginPath();
      ctx.moveTo(-300, y);
      ctx.lineTo(WIDTH + 300, y);
      ctx.stroke();
    }

    // Baseboard
    ctx.fillStyle = BASEBOARD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(-350, FLOOR_Y - 26, WIDTH + 700, 26);
    ctx.fill();
    ctx.stroke();

    // Floor top line
    ctx.beginPath();
    ctx.moveTo(-350, FLOOR_Y);
    ctx.lineTo(WIDTH + 350, FLOOR_Y);
    ctx.stroke();

    // Left Exit Door (x = 4..122) & Right Exit Door (x = 958..1076)
    for (const dx of [4, 958]) {
      ctx.fillStyle = DOOR_FRAME;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(dx - 8, 920, 126, FLOOR_Y - 920, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = DOOR_FILL;
      ctx.beginPath();
      ctx.roundRect(dx, 932, 110, FLOOR_Y - 932, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = DOOR_PANEL;
      ctx.beginPath();
      ctx.roundRect(dx + 16, 962, 78, 190, 6);
      ctx.roundRect(dx + 16, 1185, 78, 250, 6);
      ctx.fill();

      // EXIT sign above doors
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.roundRect(dx + 14, 868, 82, 34, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = WHITE;
      ctx.font = '900 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('EXIT', dx + 55, 886);

      // Door knob
      ctx.fillStyle = KNOB_GOLD;
      ctx.beginPath();
      ctx.arc(dx > 500 ? dx + 22 : dx + 88, 1215, 9, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Center Sunlit Lab Window
    ctx.fillStyle = '#bae6fd';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(530, 560, 260, 290, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.moveTo(560, 580);
    ctx.lineTo(635, 580);
    ctx.lineTo(595, 830);
    ctx.lineTo(548, 830);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(660, 560);
    ctx.lineTo(660, 850);
    ctx.moveTo(530, 705);
    ctx.lineTo(790, 705);
    ctx.stroke();
  }

  // ------------------------------------------------------------------
  // The CLONE Machine (with Red CLONE Button & Red RESET Button)
  // ------------------------------------------------------------------
  private isClonePressedAt(t: number): number {
    const pressTimes = [2.85, 6.55, 7.7, 8.9, 15.65, 16.2, 16.75];
    for (const pt of pressTimes) {
      if (t >= pt - 0.08 && t <= pt + 0.16) {
        return Math.sin(inv(pt - 0.08, pt + 0.16, t) * Math.PI);
      }
    }
    return 0;
  }

  private isResetPressedAt(t: number): number {
    if (t >= 25.25 && t <= 25.55) {
      return Math.sin(inv(25.25, 25.55, t) * Math.PI);
    }
    return 0;
  }

  private drawCloneMachine(ctx: CanvasRenderingContext2D, t: number) {
    const clonePress = this.isClonePressedAt(t);
    const resetPress = this.isResetPressedAt(t);
    const activeGlow = clonePress > 0.1 || resetPress > 0.1 ? 1 : 0.4 + 0.25 * Math.sin(t * 4);

    ctx.save();
    // Machine Shadow
    ctx.fillStyle = 'rgba(23,18,31,0.16)';
    ctx.beginPath();
    ctx.ellipse(MACH_X, FLOOR_Y + 8, 118, 18, 0, 0, TAU);
    ctx.fill();

    // Base Plinth
    ctx.fillStyle = MACHINE_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(MACH_X - 102, FLOOR_Y - 56, 204, 56, 12);
    ctx.fill();
    ctx.stroke();

    // Main Machine Cabinet
    ctx.fillStyle = MACHINE_BODY;
    ctx.beginPath();
    ctx.roundRect(MACH_X - 88, 865, 176, FLOOR_Y - 865 - 48, 22);
    ctx.fill();
    ctx.stroke();

    // Top Dome Antenna / Flash Emitter
    ctx.fillStyle = MACHINE_TRIM;
    ctx.beginPath();
    ctx.roundRect(MACH_X - 42, 828, 84, 42, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = clonePress > 0.1 ? FLASH_GOLD : resetPress > 0.1 ? WHITE : SCREEN_CYAN;
    ctx.beginPath();
    ctx.arc(MACH_X, 804, 24, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // "CLONE" Label Plate
    ctx.fillStyle = SHIRT;
    ctx.beginPath();
    ctx.roundRect(MACH_X - 72, 886, 144, 50, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = '900 32px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CLONE', MACH_X, 912);

    // Digital Screen showing current clone count
    ctx.fillStyle = SCREEN_BG;
    ctx.beginPath();
    ctx.roundRect(MACH_X - 66, 954, 132, 112, 12);
    ctx.fill();
    ctx.stroke();

    const visibleClones =
      t >= 25.48
        ? t >= 27.3
          ? 1
          : 0
        : CLONES.filter((c) => t >= c.spawnAt).length;
    ctx.fillStyle = SCREEN_CYAN;
    ctx.globalAlpha = 0.7 + 0.3 * activeGlow;
    ctx.font = '900 44px monospace';
    ctx.fillText(`x${1 + visibleClones}`, MACH_X, 1004);
    ctx.font = '700 16px system-ui, sans-serif';
    ctx.fillText(visibleClones === 0 && t >= 25.48 ? 'CLEARED' : 'ACTIVE', MACH_X, 1044);
    ctx.globalAlpha = 1;

    // --- Side Pedestal 1: Big Red CLONE Button ---
    ctx.fillStyle = MACHINE_DARK;
    ctx.beginPath();
    ctx.roundRect(MACH_X + 74, CLONE_BTN_Y - 12, 54, 34, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.roundRect(CLONE_BTN_X - 30, CLONE_BTN_Y - 18, 60, 20, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = clonePress > 0.2 ? BTN_RED_DEEP : BTN_RED;
    ctx.beginPath();
    ctx.roundRect(CLONE_BTN_X - 24, CLONE_BTN_Y - 38 + clonePress * 12, 48, 24, 10);
    ctx.fill();
    ctx.stroke();

    // --- Side Pedestal 2: Red RESET Button (highlighted in Scene 5) ---
    ctx.fillStyle = MACHINE_DARK;
    ctx.beginPath();
    ctx.roundRect(MACH_X + 74, RESET_BTN_Y - 12, 50, 32, 8);
    ctx.fill();
    ctx.stroke();

    // "RESET" tag on cabinet next to button
    const resetHighlight = t >= 24.0 && t <= 25.5;
    ctx.fillStyle = resetHighlight ? '#fef08a' : '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(MACH_X - 52, RESET_BTN_Y - 20, 108, 36, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = '900 22px system-ui, sans-serif';
    ctx.fillText('RESET', MACH_X + 2, RESET_BTN_Y - 1);

    ctx.fillStyle = resetPress > 0.2 ? BTN_RED_DEEP : BTN_RED;
    ctx.beginPath();
    ctx.roundRect(RESET_BTN_X - 20, RESET_BTN_Y - 30 + resetPress * 10, 40, 20, 8);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Original Stickman & Clones Blocking
  // ------------------------------------------------------------------
  private origAt(t: number) {
    let x = 760;
    const ground = FLOOR_Y;
    let lift = 0;
    let walkPhase = 0;

    if (t < 1.35) {
      const u = smooth(inv(0.0, 1.35, t));
      x = lerp(760, 452, u);
      walkPhase = t * 10;
    } else if (t < 2.35) {
      x = 452;
    } else if (t < 2.95) {
      x = lerp(452, 438, smooth(inv(2.35, 2.85, t)));
    } else if (t < 3.45) {
      // Hops slightly back in shock as Clone #1 flashes in
      const u = inv(2.95, 3.45, t);
      x = lerp(438, 465, smooth(u));
      lift = Math.sin(u * Math.PI) * 32;
    } else if (t < 6.1) {
      x = 465;
    } else if (t < 9.4) {
      x = lerp(465, 435, smooth(inv(6.1, 6.5, t)));
    } else if (t < 12.0) {
      x = lerp(435, 420, smooth(inv(9.4, 10.2, t)));
    } else if (t < 15.0) {
      x = lerp(420, 445, smooth(inv(12.0, 12.8, t)));
    } else if (t < 15.65) {
      // Jumps in unison with clones at 15.0s!
      x = 445;
      const u = inv(15.0, 15.65, t);
      lift = Math.sin(u * Math.PI) * 145;
    } else if (t < 18.0) {
      x = 445;
    } else if (t < 19.0) {
      // Sprints right toward exit -> blocked
      const u = smooth(inv(18.0, 18.6, t));
      const bounce = smooth(inv(18.6, 19.0, t));
      x = lerp(445, 790, u) - bounce * 95;
      walkPhase = (t - 18.0) * 16;
    } else if (t < 20.1) {
      // Bolts left toward exit -> blocked
      const u = smooth(inv(19.0, 19.65, t));
      const bounce = smooth(inv(19.65, 20.1, t));
      x = lerp(695, 285, u) + bounce * 220;
      walkPhase = (t - 19.0) * 17;
    } else if (t < 24.0) {
      x = lerp(505, 515, smooth(inv(20.1, 21.0, t)));
    } else if (t < 25.35) {
      // Squeezes left through the crowd to RESET button
      const u = smooth(inv(24.0, 25.25, t));
      x = lerp(515, 425, u);
      walkPhase = (t - 24.0) * 13;
    } else if (t < 26.0) {
      x = 425;
    } else if (t < 27.3) {
      // Steps to center & celebrates wildly
      x = lerp(425, 520, smooth(inv(26.0, 26.45, t)));
      const hop = Math.abs(Math.sin((t - 26.0) * Math.PI * 2.4));
      lift = hop * 82;
    } else if (t < 28.5) {
      x = 520;
    } else {
      // Trembles slightly while screaming silently
      x = 520 + Math.sin((t - 28.5) * 38) * 3.5;
    }

    return { x, ground, lift, walkPhase };
  }

  private poseAt(t: number, ch: { x: number; lift: number; walkPhase: number }): Pose {
    let a = POSE_KEYS[0];
    let b = POSE_KEYS[0];
    if (t <= POSE_KEYS[0].t) {
      a = POSE_KEYS[0];
      b = a;
    } else if (t >= POSE_KEYS[POSE_KEYS.length - 1].t) {
      a = POSE_KEYS[POSE_KEYS.length - 1];
      b = a;
    } else {
      for (let i = 0; i < POSE_KEYS.length - 1; i++) {
        if (t >= POSE_KEYS[i].t && t <= POSE_KEYS[i + 1].t) {
          a = POSE_KEYS[i];
          b = POSE_KEYS[i + 1];
          break;
        }
      }
    }
    const u = b.t === a.t ? 0 : smooth((t - a.t) / (b.t - a.t));
    const pa = a.pose;
    const pb = b.pose;
    const pick = <T,>(x: T, y: T) => (u < 0.5 ? x : y);

    const swing = ch.walkPhase > 0 ? Math.sin(ch.walkPhase) : 0;
    const stepLift = ch.walkPhase > 0 ? Math.max(0, Math.sin(ch.walkPhase)) * 34 : 0;
    const armSwingX = ch.walkPhase > 0 ? swing * 48 : 0;

    return {
      lean: lerp(pa.lean, pb.lean, u),
      hipDrop: lerp(pa.hipDrop, pb.hipDrop, u),
      headTilt: lerp(pa.headTilt, pb.headTilt, u),
      headDrop: lerp(pa.headDrop, pb.headDrop, u),
      headTurn: lerp(pa.headTurn, pb.headTurn, u),
      look: pick(pa.look, pb.look),
      mouth: pick(pa.mouth, pb.mouth),
      brow: pick(pa.brow, pb.brow),
      eye: pick(pa.eye, pb.eye),
      stance: lerp(pa.stance, pb.stance, u) + Math.abs(swing) * 26,
      footLift: lerp(pa.footLift, pb.footLift, u) + stepLift,
      handL: {
        x: ch.x + lerp(pa.handL.x, pb.handL.x, u) + armSwingX,
        y: lerp(pa.handL.y, pb.handL.y, u) - ch.lift,
      },
      handR: {
        x: ch.x + lerp(pa.handR.x, pb.handR.x, u) - armSwingX,
        y: lerp(pa.handR.y, pb.handR.y, u) - ch.lift,
      },
      bendL: pick(pa.bendL, pb.bendL),
      bendR: pick(pa.bendR, pb.bendR),
      gripL: pick(pa.gripL, pb.gripL),
      gripR: pick(pa.gripR, pb.gripR),
      fistL: pick(pa.fistL, pb.fistL),
      fistR: pick(pa.fistR, pb.fistR),
      pointL: pick(pa.pointL, pb.pointL),
      pointR: pick(pa.pointR, pb.pointR),
      beanieOn: pick(pa.beanieOn, pb.beanieOn),
      crouch: lerp(pa.crouch, pb.crouch, u),
      sit: lerp(pa.sit, pb.sit, u),
    };
  }

  private clonePoseAt(clone: CloneSpec, t: number, origX: number, origLift: number): {
    x: number;
    ground: number;
    lift: number;
    pose: Pose;
  } {
    const age = t - clone.spawnAt;
    const hop = age < 0.35 ? Math.sin(clamp(age / 0.35, 0, 1) * Math.PI) * 58 : 0;
    const x = clone.x;
    const ground = FLOOR_Y + clone.yOffset;
    let lift = hop;

    // Default clone standing pose (same locked outfit & hanging arms)
    let pose: Pose = {
      ...BASE_POSE,
      eye: clone.eye,
      brow: clone.brow,
      mouth: clone.mouth,
      look: clone.look,
      headTurn: clone.look === 'left' ? -5 : clone.look === 'right' ? 5 : 0,
      handL: { x: x - 68, y: ground - lift - (1500 - 1248) },
      handR: { x: x + 68, y: ground - lift - (1500 - 1248) },
    };

    // Scene 3 (12.2–15.65s): Clones copy every move of the original!
    if (t >= 12.4 && t < 15.7) {
      if (t >= 15.0 && t < 15.65) {
        lift = origLift;
      }
      const gy = ground - lift;
      if (t >= 14.0) {
        pose = {
          ...pose,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          look: 'front',
          bendL: -1,
          bendR: -1,
          handL: { x: x - 120, y: gy - 605 },
          handR: { x: x + 120, y: gy - 605 },
        };
      } else if (t >= 13.0) {
        pose = {
          ...pose,
          eye: 'wide',
          brow: 'raised',
          mouth: 'smile',
          look: 'front',
          bendR: -1,
          handL: { x: x - 68, y: gy - 252 },
          handR: { x: x + 118, y: gy - 605 },
        };
      }
    } else if (t >= 18.0 && t < 20.1) {
      // Blocking exits on left & right!
      const isRightBlock = t < 19.0 && clone.role === 'blockerR';
      const isLeftBlock = t >= 19.0 && clone.role === 'blockerL';
      if (isRightBlock || isLeftBlock) {
        pose = {
          ...pose,
          brow: 'angry',
          mouth: 'grit',
          eye: 'squint',
          bendL: -1,
          bendR: -1,
          handL: { x: x - 128, y: ground - 470 },
          handR: { x: x + 128, y: ground - 470 },
        };
      }
    } else if (t >= 20.1 && t < 22.0) {
      // Mass argument waving hands
      const wave = Math.sin(t * 14 + clone.id * 1.7) * 45;
      pose = {
        ...pose,
        brow: clone.id % 2 === 0 ? 'angry' : 'uneven',
        mouth: clone.id % 2 === 0 ? 'o' : 'grit',
        eye: 'wide',
        bendL: -1,
        bendR: -1,
        handL: { x: x - 125, y: ground - 470 + wave },
        handR: { x: x + 125, y: ground - 470 - wave },
      };
    } else if (t >= 22.0 && t < 25.48) {
      // Every single clone points directly back at the original Stickman!
      const dx = origX - x;
      const pointRight = dx >= 0;
      pose = {
        ...pose,
        look: pointRight ? 'right' : 'left',
        headTurn: pointRight ? 7 : -7,
        brow: 'angry',
        eye: 'squint',
        mouth: 'grit',
        pointL: !pointRight,
        pointR: pointRight,
        bendL: pointRight ? 1 : -1,
        bendR: pointRight ? -1 : 1,
        handL: pointRight ? { x: x - 68, y: ground - 252 } : { x: x - 155, y: ground - 468 },
        handR: pointRight ? { x: x + 155, y: ground - 468 } : { x: x + 68, y: ground - 252 },
      };
    }

    return { x, ground, lift, pose };
  }

  private drawCrowdAndCharacters(ctx: CanvasRenderingContext2D, t: number) {
    const orig = this.origAt(t);
    const origPose = this.poseAt(t, orig);

    // Clones vanish cleanly at the peak of the RESET flash (t = 25.48s)
    const activeClones = t >= 25.48 ? [] : CLONES.filter((c) => t >= c.spawnAt);

    // Draw background & midground clones behind original
    for (const clone of activeClones) {
      if (clone.scale >= 0.99) continue;
      const cp = this.clonePoseAt(clone, t, orig.x, orig.lift);
      this.drawScaledStickman(ctx, cp.x, cp.ground, cp.lift, cp.pose, clone.scale);
    }

    // Draw full-size clones behind/beside original
    for (const clone of activeClones) {
      if (clone.scale < 0.99) continue;
      if (clone.role === 'blockerL' && t >= 19.0) continue; // draw blockers on top when blocking
      const cp = this.clonePoseAt(clone, t, orig.x, orig.lift);
      this.drawScaledStickman(ctx, cp.x, cp.ground, cp.lift, cp.pose, clone.scale);
    }

    // Draw Original Stickman
    this.drawScaledStickman(ctx, orig.x, orig.ground, orig.lift, origPose, 1.0);

    // Draw Tiny Clone on Original's Left Shoulder (27.3s - 30.0s)!
    if (t >= 27.3) {
      const pop = smooth(inv(27.3, 27.55, t));
      const hipY = orig.ground - orig.lift - (300 - 150 * origPose.crouch);
      const shoulderY = hipY - 170;
      const bodyTopX = orig.x + Math.sin(origPose.lean) * 170;
      const sx = bodyTopX - 42;
      const sy = shoulderY - 4;
      const wave = Math.sin((t - 27.3) * 12) * 32;
      const tinyPose: Pose = {
        ...BASE_POSE,
        eye: 'happy',
        brow: 'raised',
        mouth: 'bigsmile',
        look: 'front',
        headTurn: 2,
        bendL: -1,
        handL: { x: sx - 118, y: sy - 110 + wave },
        handR: { x: sx + 68, y: sy - 252 },
      };
      this.drawScaledStickman(ctx, sx, sy, 0, tinyPose, 0.24 * pop, true);
    }
  }

  private drawScaledStickman(
    ctx: CanvasRenderingContext2D,
    x: number,
    ground: number,
    lift: number,
    pose: Pose,
    scale: number,
    noShadow = false
  ) {
    if (scale <= 0.02) return;
    ctx.save();
    ctx.translate(x, ground);
    ctx.scale(scale, scale);
    ctx.translate(-x, -ground);
    // Keep pose hand coordinates adjusted to local ground=1500
    const dy = FLOOR_Y - ground;
    const localPose: Pose =
      dy === 0
        ? pose
        : {
            ...pose,
            handL: { x: pose.handL.x, y: pose.handL.y + dy },
            handR: { x: pose.handR.x, y: pose.handR.y + dy },
          };
    this.drawCharacterInstance(ctx, x, FLOOR_Y, lift, localPose, noShadow);
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Flashes & Celebration
  // ------------------------------------------------------------------
  private drawSpawnFlashes(ctx: CanvasRenderingContext2D, t: number) {
    for (const c of CLONES) {
      const dt = t - c.spawnAt;
      if (dt < 0 || dt > 0.38) continue;
      const u = dt / 0.38;
      const r = lerp(24, 165 * c.scale, easeOut(u));
      const alpha = 1 - u;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(c.x, FLOOR_Y + c.yOffset - 280 * c.scale);

      ctx.fillStyle = FLASH_CYAN;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = FLASH_GOLD;
      ctx.lineWidth = 8;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        ctx.moveTo(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45);
        ctx.lineTo(Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Tiny clone flash on Original's shoulder at 27.25s
    if (t >= 27.25 && t <= 27.65) {
      const u = (t - 27.25) / 0.4;
      const orig = this.origAt(t);
      const sx = orig.x - 42;
      const sy = orig.ground - orig.lift - 475;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.fillStyle = FLASH_GOLD;
      ctx.beginPath();
      ctx.arc(sx, sy - 60, lerp(12, 74, easeOut(u)), 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawFullResetFlash(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 25.38 || t > 26.05) return;
    const peak = t < 25.55 ? smooth(inv(25.38, 25.55, t)) : 1 - smooth(inv(25.55, 26.05, t));
    ctx.save();
    ctx.fillStyle = `rgba(224, 249, 255, ${0.92 * peak})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
  }

  private drawCelebrationSparkles(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 26.0 || t > 27.3) return;
    const fade = smooth(inv(26.0, 26.25, t)) * (1 - smooth(inv(27.0, 27.3, t)));
    ctx.save();
    ctx.globalAlpha = fade;
    const offsets = [
      { dx: -130, dy: -520 },
      { dx: 130, dy: -535 },
      { dx: 0, dy: -610 },
    ];
    for (let i = 0; i < offsets.length; i++) {
      const sx = 520 + offsets[i].dx + Math.sin(t * 7 + i) * 14;
      const sy = FLOOR_Y + offsets[i].dy + Math.cos(t * 6 + i) * 14;
      ctx.fillStyle = FLASH_GOLD;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const r = k % 2 === 0 ? 18 : 8;
        const a = (k / 8) * TAU + t * 2.5;
        const px = sx + Math.cos(a) * r;
        const py = sy + Math.sin(a) * r;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Character Rig (Locked POP_UP_TENT_CHARACTER.md rig — unchanged)
  // ------------------------------------------------------------------
  private drawCharacterInstance(
    ctx: CanvasRenderingContext2D,
    x: number,
    ground: number,
    lift: number,
    pose: Pose,
    noShadow = false
  ) {
    const baseY = ground - lift;
    const hipY = baseY - (300 - 150 * pose.crouch - 170 * pose.sit);

    const arms = this.computeArms(pose, x, hipY);

    if (!noShadow && lift < 6 && pose.sit < 0.5) {
      ctx.fillStyle = 'rgba(23,18,31,0.16)';
      ctx.beginPath();
      ctx.ellipse(x, ground + 8, 78, 15, 0, 0, TAU);
      ctx.fill();
    }

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.drawBody(ctx, x, hipY, baseY, pose, arms);
    const head = this.headPoint(pose, x, hipY);
    this.drawHead(ctx, head.x, head.y, pose);
    ctx.restore();
  }

  private headPoint(pose: Pose, x: number, hipY: number): Pt {
    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(pose.lean) * 170;
    const headX = bodyTopX + Math.sin(pose.headTilt) * 12;
    return { x: headX, y: shoulderY - 20 - HEAD_R + pose.headDrop };
  }

  private drawBody(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    baseY: number,
    pose: Pose,
    arms: { l: Arm; r: Arm }
  ) {
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(pose.lean) * 170;
    const stance = pose.stance;
    const ankleBase = baseY - 16;
    const kneeBend = Math.max(0, pose.hipDrop) * 0.3;

    const standKneeL = { x: hipX - 24 - stance * 0.4, y: hipY + 86 + kneeBend };
    const standKneeR = { x: hipX + 24 + stance * 0.4, y: hipY + 86 + kneeBend };
    const standAnkleL = { x: hipX - 40 - stance, y: ankleBase };
    const standAnkleR = { x: hipX + 40 + stance, y: ankleBase - pose.footLift };

    const crouchKneeL = { x: hipX - 66, y: hipY + 52 };
    const crouchKneeR = { x: hipX + 66, y: hipY + 52 };
    const crouchAnkleL = { x: hipX - 46, y: ankleBase };
    const crouchAnkleR = { x: hipX + 46, y: ankleBase };

    const sitKneeL = { x: hipX - 64, y: hipY + 44 };
    const sitKneeR = { x: hipX + 64, y: hipY + 44 };
    const sitAnkleL = { x: hipX - 118, y: hipY + 104 };
    const sitAnkleR = { x: hipX + 118, y: hipY + 104 };

    const mix = (stand: number, crouch: number, sit: number) =>
      lerp(lerp(stand, crouch, pose.crouch), sit, pose.sit);

    const kneeL = {
      x: mix(standKneeL.x, crouchKneeL.x, sitKneeL.x),
      y: mix(standKneeL.y, crouchKneeL.y, sitKneeL.y),
    };
    const kneeR = {
      x: mix(standKneeR.x, crouchKneeR.x, sitKneeR.x),
      y: mix(standKneeR.y, crouchKneeR.y, sitKneeR.y),
    };
    const ankleL = {
      x: mix(standAnkleL.x, crouchAnkleL.x, sitAnkleL.x),
      y: mix(standAnkleL.y, crouchAnkleL.y, sitAnkleL.y),
    };
    const ankleR = {
      x: mix(standAnkleR.x, crouchAnkleR.x, sitAnkleR.x),
      y: mix(standAnkleR.y, crouchAnkleR.y, sitAnkleR.y),
    };

    // Thin black legs, knee to ankle.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(kneeL.x, kneeL.y);
    ctx.lineTo(ankleL.x, ankleL.y);
    ctx.moveTo(kneeR.x, kneeR.y);
    ctx.lineTo(ankleR.x, ankleR.y);
    ctx.stroke();

    // Blue trousers, hip to knee.
    const trouser = (knee: Pt) => {
      ctx.beginPath();
      ctx.moveTo(hipX, hipY - 4);
      ctx.lineTo(knee.x, knee.y);
    };
    ctx.strokeStyle = INK;
    ctx.lineWidth = 34;
    trouser(kneeL);
    ctx.stroke();
    trouser(kneeR);
    ctx.stroke();
    ctx.strokeStyle = TROUSER;
    ctx.lineWidth = 25;
    trouser(kneeL);
    ctx.stroke();
    trouser(kneeR);
    ctx.stroke();

    this.drawShoe(ctx, ankleL.x - 4, ankleL.y + 12, lerp(-0.06, -0.45, pose.sit));
    this.drawShoe(
      ctx,
      ankleR.x + 4,
      ankleR.y + 12,
      lerp(pose.footLift > 20 ? -0.24 : 0.06, 0.45, pose.sit)
    );

    // Torso.
    ctx.fillStyle = SHIRT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(hipX - 36, hipY + 10);
    ctx.lineTo(bodyTopX - 40, shoulderY);
    ctx.lineTo(bodyTopX + 40, shoulderY);
    ctx.lineTo(hipX + 36, hipY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = SHIRT_DEEP;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bodyTopX - 19, shoulderY + 13);
    ctx.lineTo(bodyTopX + 19, shoulderY + 13);
    ctx.stroke();

    // Neck.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(bodyTopX, shoulderY + 8);
    ctx.lineTo(bodyTopX, shoulderY - 20);
    ctx.stroke();

    // Arms.
    const drawLimb = (a: Arm) => {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(a.ex, a.ey);
      ctx.lineTo(a.hx, a.hy);
      ctx.stroke();
    };
    drawLimb(arms.l);
    drawLimb(arms.r);
    this.drawSleeve(ctx, arms.l);
    this.drawSleeve(ctx, arms.r);

    drawHand(ctx, arms.l, {
      side: 'left',
      pose: pose.pointL ? 'point' : pose.fistL ? 'fist' : pose.gripL ? 'grip' : 'relaxed',
      layer: 'full',
    });
    drawHand(ctx, arms.r, {
      side: 'right',
      pose: pose.pointR ? 'point' : pose.fistR ? 'fist' : pose.gripR ? 'grip' : 'relaxed',
      layer: 'full',
    });
  }

  private drawShoe(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = SHOE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-34, -13, 68, 26, 11);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath();
    ctx.roundRect(-26, -8, 15, 6, 3);
    ctx.fill();
    ctx.restore();
  }

  private drawSleeve(ctx: CanvasRenderingContext2D, arm: Arm) {
    const dx = arm.ex - arm.sx;
    const dy = arm.ey - arm.sy;
    const len = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / len;
    const uy = dy / len;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 38;
    ctx.beginPath();
    ctx.moveTo(arm.sx, arm.sy);
    ctx.lineTo(arm.sx + ux * 36, arm.sy + uy * 36);
    ctx.stroke();
    ctx.strokeStyle = SHIRT;
    ctx.lineWidth = 29;
    ctx.beginPath();
    ctx.moveTo(arm.sx, arm.sy);
    ctx.lineTo(arm.sx + ux * 36, arm.sy + uy * 36);
    ctx.stroke();
    ctx.strokeStyle = SHIRT_DEEP;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(arm.sx + ux * 34 - uy * 14, arm.sy + uy * 34 + ux * 14);
    ctx.lineTo(arm.sx + ux * 34 + uy * 14, arm.sy + uy * 34 - ux * 14);
    ctx.stroke();
  }

  private computeArms(pose: Pose, x: number, hipY: number): { l: Arm; r: Arm } {
    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(pose.lean) * 170;
    const headCx = bodyTopX + Math.sin(pose.headTilt) * 12;
    const headCy = shoulderY - 20 - HEAD_R + pose.headDrop;
    const handClear = HEAD_R + 26;
    const elbowClear = HEAD_R + 30;

    const solve = (side: -1 | 1, target: Pt, bend: 1 | -1): Arm => {
      const sx = bodyTopX + side * 36;
      const sy = shoulderY;
      let hx = target.x;
      let hy = target.y;
      const hdx = hx - headCx;
      const hdy = hy - headCy;
      const hd = Math.hypot(hdx, hdy);
      if (hd < handClear && hd > 0.001) {
        hx = headCx + (hdx / hd) * handClear;
        hy = headCy + (hdy / hd) * handClear;
      }
      const ux = (hx - sx) * side;
      const uy = hy - sy;
      let d = Math.hypot(ux, uy);
      if (d < 30) d = 30;
      const base = Math.atan2(ux, uy);
      const upper = 118;
      const lower = 118;
      const cosAlpha = clamp((upper * upper + d * d - lower * lower) / (2 * upper * d), -1, 1);
      const alpha = Math.acos(cosAlpha);
      const elbowAt = (b: 1 | -1) => {
        const a1 = base + b * alpha;
        return { x: sx + Math.sin(a1) * side * upper, y: sy + Math.cos(a1) * upper };
      };
      const score = (e: Pt) => Math.hypot(e.x - headCx, e.y - headCy) + 0.35 * side * (e.x - sx);
      const preferred = elbowAt(bend);
      const other = elbowAt(bend === 1 ? -1 : 1);
      let elbow = score(preferred) + 8 >= score(other) ? preferred : other;
      const edx = elbow.x - headCx;
      const edy = elbow.y - headCy;
      const ed = Math.hypot(edx, edy);
      if (ed < elbowClear && ed > 0.001) {
        elbow = { x: headCx + (edx / ed) * elbowClear, y: headCy + (edy / ed) * elbowClear };
      }
      return { sx, sy, ex: elbow.x, ey: elbow.y, hx, hy };
    };

    return { l: solve(-1, pose.handL, pose.bendL), r: solve(1, pose.handR, pose.bendR) };
  }

  private drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, pose: Pose) {
    const r = HEAD_R;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(pose.headTilt);

    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (pose.beanieOn) this.drawBeanieShape(ctx);

    const eyeShiftY = pose.look === 'down' ? 7 : pose.look === 'up' ? -7 : 0;
    const eyeShiftX = pose.look === 'right' ? 7 : pose.look === 'left' ? -7 : 0;
    const eyeY = 8 + eyeShiftY;
    const eyeDX = 26;
    const fx = pose.headTurn + eyeShiftX;

    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;

    if (pose.eye === 'shut') {
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(fx + side * eyeDX, eyeY + 8, 14, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    } else if (pose.eye === 'happy') {
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(fx + side * eyeDX, eyeY + 6, 14, Math.PI * 1.12, Math.PI * 1.88);
        ctx.stroke();
      }
    } else {
      const eyeH = pose.eye === 'wide' ? 34 : pose.eye === 'squint' ? 9 : 22;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(fx + side * eyeDX, eyeY, 10, eyeH / 2, 0, 0, TAU);
        ctx.fill();
      }
    }

    // Brows.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    const browY = -12;
    ctx.beginPath();
    if (pose.brow === 'angry' || pose.brow === 'determined') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY + 8);
      ctx.moveTo(fx + 42, browY - 8);
      ctx.lineTo(fx + 12, browY + 8);
    } else if (pose.brow === 'raised') {
      ctx.moveTo(fx - 42, browY - 13);
      ctx.lineTo(fx - 12, browY - 11);
      ctx.moveTo(fx + 42, browY - 13);
      ctx.lineTo(fx + 12, browY - 11);
    } else if (pose.brow === 'sad') {
      ctx.moveTo(fx - 42, browY + 8);
      ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY + 8);
      ctx.lineTo(fx + 12, browY - 8);
    } else if (pose.brow === 'cocky') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY - 2);
      ctx.lineTo(fx + 12, browY + 4);
    } else if (pose.brow === 'uneven') {
      ctx.moveTo(fx - 42, browY - 15);
      ctx.lineTo(fx - 12, browY - 10);
      ctx.moveTo(fx + 42, browY + 8);
      ctx.lineTo(fx + 12, browY + 1);
    } else {
      ctx.moveTo(fx - 42, browY - 4);
      ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY - 4);
      ctx.lineTo(fx + 12, browY - 8);
    }
    ctx.stroke();

    // Mouth.
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = 6;
    const my = 40;
    ctx.beginPath();
    if (pose.mouth === 'bigsmile') {
      ctx.moveTo(fx - 34, my - 8);
      ctx.quadraticCurveTo(fx, my + 34, fx + 34, my - 8);
      ctx.quadraticCurveTo(fx, my + 8, fx - 34, my - 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.moveTo(fx - 27, my - 6);
      ctx.quadraticCurveTo(fx, my + 2, fx + 27, my - 6);
      ctx.lineTo(fx + 25, my - 12);
      ctx.lineTo(fx - 25, my - 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = INK;
    } else if (pose.mouth === 'grin') {
      ctx.arc(fx, my - 12, 26, 0.15 * Math.PI, 0.85 * Math.PI);
    } else if (pose.mouth === 'smile') {
      ctx.arc(fx, my - 14, 20, 0.2 * Math.PI, 0.8 * Math.PI);
    } else if (pose.mouth === 'smirk') {
      ctx.moveTo(fx - 22, my + 2);
      ctx.quadraticCurveTo(fx + 4, my + 10, fx + 24, my - 10);
    } else if (pose.mouth === 'frown') {
      ctx.arc(fx, my + 16, 24, 1.15 * Math.PI, 1.85 * Math.PI);
    } else if (pose.mouth === 'o') {
      ctx.ellipse(fx, my, 13, 17, 0, 0, TAU);
    } else if (pose.mouth === 'grit') {
      ctx.moveTo(fx - 24, my);
      ctx.lineTo(fx + 24, my);
      for (let i = -2; i <= 2; i++) {
        ctx.moveTo(fx + i * 10, my - 8);
        ctx.lineTo(fx + i * 10, my + 8);
      }
    } else {
      ctx.moveTo(fx - 18, my);
      ctx.lineTo(fx + 18, my);
    }
    ctx.stroke();

    ctx.restore();
  }

  private drawBeanieShape(ctx: CanvasRenderingContext2D) {
    const r = HEAD_R;
    ctx.fillStyle = BEANIE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -24, r + 5, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = BEANIE_DEEP;
    ctx.beginPath();
    ctx.rect(-r - 5, -44, (r + 5) * 2, 20);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#f07178';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 23, -70);
      ctx.lineTo(i * 23, -50);
      ctx.stroke();
    }
    ctx.fillStyle = BEANIE_POM;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -r - 33, 16, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  // ------------------------------------------------------------------
  // Captions & Safe Area Guides
  // ------------------------------------------------------------------
  private drawCaptions(ctx: CanvasRenderingContext2D, t: number) {
    const caption = CAPTIONS.find((c) => t >= c.from && t <= c.to);
    if (!caption) return;

    const popIn = clamp((t - caption.from) / 0.16, 0, 1);
    const popOut = clamp((caption.to - t) / 0.18, 0, 1);
    const scale = easeOut(popIn) * easeOut(popOut);

    ctx.save();
    ctx.translate(WIDTH / 2, 1605);
    ctx.scale(scale, scale);

    ctx.font = '900 50px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.strokeText(caption.text, 0, 0, 880);

    ctx.fillStyle = '#facc15';
    ctx.fillText(caption.text, 0, 0, 880);
    ctx.restore();
  }

  private drawSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 12]);
    ctx.strokeRect(80, 200, WIDTH - 160, HEIGHT - 460);
    ctx.restore();
  }
}
