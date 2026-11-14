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

// Environment & Traffic Light palette (Modern Pop flat 2D cartoon)
const SKY = '#7cd4fc';
const SKY_DEEP = '#53bdf2';
const CLOUD = '#ffffff';
const SIDEWALK = '#e2e8f0';
const SIDEWALK_LINE = '#cbd5e1';
const CURB = '#94a3b8';
const ROAD = '#475569';
const ROAD_STRIPE = '#f8fafc';
const PARK_GRASS = '#4ade80';
const PARK_GRASS_DEEP = '#22c55e';
const PARK_TREE = '#16a34a';
const PARK_TRUNK = '#854d0e';
const LIGHT_BODY = '#1e1e26';
const LIGHT_BEZEL = '#323240';
const LIGHT_POLE = '#64748b';
const LIGHT_ARM = '#64748b';
const RED_ON = '#ff3b4e';
const RED_OFF = '#5c1a22';
const YELLOW_ON = '#ffd166';
const YELLOW_OFF = '#634f1e';
const GREEN_ON = '#2ee57d';
const GREEN_OFF = '#155232';
const STOP_RED = '#ef233c';
const BATT_GREEN = '#38f27a';
const SPARK_YELLOW = '#fde047';

const FLOOR_Y = 1500;
const HEAD_R = 70;

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
  handL: Pt; // Authored as local offset from character x (cx + dx, y) in POSE_PATCHES, converted to world in poseAt
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
  headTilt: 0.03,
  headDrop: 0,
  headTurn: 3,
  look: 'right',
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
  // --- Scene 1 (0–6s): Approaches crossing, light blinks & grows eyes ----
  {
    t: 0.0,
    p: {
      lean: 0.05,
      headTurn: 6,
      look: 'right',
      mouth: 'smile',
      brow: 'normal',
      eye: 'open',
      handL: { x: -72, y: 1245 },
      handR: { x: 74, y: 1242 },
    },
  },
  {
    t: 1.5,
    p: {
      lean: 0,
      headTurn: 6,
      look: 'up',
      mouth: 'flat',
      brow: 'normal',
      eye: 'open',
      handL: { x: -68, y: 1248 },
      handR: { x: 68, y: 1248 },
    },
  },
  {
    t: 2.2,
    p: {
      lean: -0.04,
      headTilt: -0.06,
      headTurn: 8,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -102, y: 1222 },
      handR: { x: 106, y: 1218 },
    },
  },
  {
    t: 3.1,
    p: {
      lean: -0.05,
      headTilt: -0.04,
      headTurn: 8,
      look: 'right',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      pointR: true,
      handL: { x: -68, y: 1248 },
      handR: { x: 165, y: 985 },
      bendR: -1,
    },
  },
  {
    t: 5.5,
    p: {
      lean: 0,
      headTilt: 0.02,
      headTurn: 4,
      look: 'right',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      pointR: false,
      bendR: 1,
      handL: { x: -68, y: 1248 },
      handR: { x: 68, y: 1248 },
    },
  },

  // --- Scene 2 (6–12s): Green light walk, then Red STOP blocks every way ---
  {
    t: 6.1,
    p: {
      lean: 0.06,
      headTilt: -0.03,
      headTurn: 6,
      look: 'right',
      mouth: 'grin',
      brow: 'raised',
      eye: 'happy',
      handL: { x: -72, y: 1245 },
      handR: { x: 74, y: 1242 },
    },
  },
  {
    t: 7.0,
    p: {
      lean: -0.14,
      hipDrop: 10,
      headTilt: -0.08,
      headTurn: 6,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -135, y: 1040 },
      handR: { x: 135, y: 1035 },
      bendL: -1,
      bendR: -1,
    },
  },
  {
    t: 7.8,
    p: {
      lean: -0.08,
      hipDrop: 0,
      headTilt: 0,
      headTurn: -6,
      look: 'left',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      fistL: true,
      fistR: true,
      bendL: 1,
      bendR: 1,
      handL: { x: -82, y: 1232 },
      handR: { x: 78, y: 1234 },
    },
  },
  {
    t: 9.0,
    p: {
      lean: 0.14,
      headTurn: 8,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      handL: { x: -74, y: 1232 },
      handR: { x: 92, y: 1222 },
    },
  },
  {
    t: 10.3,
    p: {
      lean: 0.18,
      crouch: 0.72,
      hipDrop: 12,
      headTilt: 0.06,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      handL: { x: -76, y: 1340 },
      handR: { x: 84, y: 1340 },
    },
  },
  {
    t: 11.2,
    p: {
      lean: -0.08,
      crouch: 0,
      hipDrop: 0,
      headTilt: -0.04,
      headTurn: 4,
      look: 'up',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      fistL: true,
      fistR: true,
      bendL: -1,
      bendR: -1,
      handL: { x: -130, y: 970 },
      handR: { x: 130, y: 970 },
    },
  },

  // --- Scene 3 (12–18s): Yellow light tiptoe, traffic light rolls alongside ---
  {
    t: 12.1,
    p: {
      lean: 0.08,
      crouch: 0.24,
      headTilt: 0.04,
      headTurn: 7,
      look: 'right',
      mouth: 'smirk',
      brow: 'cocky',
      eye: 'open',
      fistL: false,
      fistR: false,
      bendL: 1,
      bendR: 1,
      handL: { x: -84, y: 1265 },
      handR: { x: 92, y: 1255 },
    },
  },
  {
    t: 14.8,
    p: {
      lean: 0.12,
      crouch: 0.26,
      headTilt: -0.02,
      headTurn: 6,
      look: 'up',
      mouth: 'flat',
      brow: 'uneven',
      eye: 'wide',
      handL: { x: -86, y: 1262 },
      handR: { x: 94, y: 1252 },
    },
  },
  {
    t: 17.2,
    p: {
      lean: -0.14,
      crouch: 0,
      headTilt: -0.08,
      headTurn: 8,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      bendL: -1,
      bendR: -1,
      handL: { x: -135, y: 1035 },
      handR: { x: 135, y: 1035 },
    },
  },

  // --- Scene 4 (18–24s): Runs to park, mini-light wall rises, jumps & blocked ---
  {
    t: 18.2,
    p: {
      lean: 0.24,
      crouch: 0.12,
      headTilt: 0.05,
      headTurn: 8,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      fistL: true,
      fistR: true,
      bendL: 1,
      bendR: 1,
      handL: { x: -76, y: 1236 },
      handR: { x: 86, y: 1230 },
    },
  },
  {
    t: 20.2,
    p: {
      lean: 0.16,
      crouch: 0.6,
      hipDrop: 12,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'wide',
      handL: { x: -92, y: 1310 },
      handR: { x: 92, y: 1310 },
    },
  },
  {
    t: 20.7,
    p: {
      lean: 0.14,
      crouch: 0.15,
      hipDrop: 0,
      headTilt: -0.06,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      bendL: -1,
      bendR: -1,
      handL: { x: -115, y: 905 },
      handR: { x: 118, y: 900 },
    },
  },
  {
    t: 21.35,
    p: {
      lean: 0.05,
      crouch: 0.35,
      headTilt: 0.04,
      look: 'right',
      mouth: 'grin',
      brow: 'cocky',
      eye: 'open',
      bendL: 1,
      bendR: 1,
      handL: { x: -78, y: 1270 },
      handR: { x: 84, y: 1265 },
    },
  },
  {
    t: 21.7,
    p: {
      lean: -0.18,
      crouch: 0.1,
      headTilt: -0.1,
      headDrop: 6,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      fistL: false,
      fistR: false,
      bendL: -1,
      bendR: -1,
      handL: { x: -135, y: 1040 },
      handR: { x: 135, y: 1035 },
    },
  },
  {
    t: 22.6,
    p: {
      lean: 0,
      crouch: 0,
      headDrop: 0,
      headTilt: 0.02,
      headTurn: 4,
      look: 'right',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      fistL: true,
      fistR: true,
      bendL: 1,
      bendR: 1,
      handL: { x: -68, y: 1248 },
      handR: { x: 68, y: 1248 },
    },
  },

  // --- Scene 5 (24–30s): Unplugs cable, blackout dance, backup battery flash ---
  {
    t: 24.1,
    p: {
      lean: -0.22,
      crouch: 0.1,
      headTurn: -8,
      look: 'left',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      fistL: true,
      fistR: true,
      handL: { x: -84, y: 1236 },
      handR: { x: 80, y: 1240 },
    },
  },
  {
    t: 24.65,
    p: {
      lean: -0.18,
      crouch: 0.34,
      headTilt: -0.04,
      headTurn: -8,
      look: 'left',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      fistL: false,
      fistR: false,
      gripL: true,
      gripR: true,
      handL: { x: -78, y: 1295 },
      handR: { x: -56, y: 1288 },
    },
  },
  {
    t: 25.05,
    p: {
      lean: 0.2,
      crouch: 0.18,
      headTilt: 0.08,
      headTurn: -4,
      look: 'left',
      mouth: 'grin',
      brow: 'raised',
      eye: 'wide',
      gripL: true,
      gripR: true,
      handL: { x: -45, y: 1255 },
      handR: { x: -20, y: 1250 },
    },
  },
  {
    t: 25.55,
    p: {
      lean: -0.05,
      crouch: 0,
      headTilt: -0.06,
      headTurn: 0,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      gripL: false,
      gripR: false,
      fistL: true,
      fistR: true,
      bendL: -1,
      bendR: -1,
      handL: { x: -125, y: 885 },
      handR: { x: 125, y: 885 },
    },
  },
  {
    t: 26.85,
    p: {
      lean: 0.02,
      headTilt: -0.04,
      headTurn: -6,
      look: 'left',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      fistL: false,
      fistR: false,
      bendL: 1,
      bendR: 1,
      handL: { x: -76, y: 1242 },
      handR: { x: 76, y: 1242 },
    },
  },
  {
    t: 27.65,
    p: {
      lean: 0,
      headTilt: 0.02,
      headTurn: -3,
      look: 'front',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      fistL: true,
      fistR: true,
      handL: { x: -66, y: 1248 },
      handR: { x: 66, y: 1248 },
    },
  },
  {
    t: 30.0,
    p: {
      lean: 0,
      headTilt: 0.03,
      headTurn: -2,
      look: 'front',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      fistL: true,
      fistR: true,
      handL: { x: -66, y: 1248 },
      handR: { x: 66, y: 1248 },
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
  { text: 'THAT LIGHT JUST BLINKED AT ME!', from: 0.25, to: 5.8 },
  { text: 'WHY ARE YOU STOPPING ME?!', from: 6.2, to: 11.8 },
  { text: "IT'S FOLLOWING ME!", from: 12.2, to: 17.8 },
  { text: 'THE WHOLE CITY IS AGAINST ME!', from: 18.2, to: 23.8 },
  { text: "I'M NEVER CROSSING AGAIN!", from: 24.2, to: 29.9 },
];

// --- camera --------------------------------------------------------------
interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 520, y: 1020, zoom: 1.0 },
  { t: 1.6, x: 580, y: 1020, zoom: 1.05 },
  { t: 2.8, x: 615, y: 960, zoom: 1.24 },
  { t: 5.5, x: 580, y: 1000, zoom: 1.12 },
  { t: 6.5, x: 580, y: 1020, zoom: 1.02 },
  { t: 7.4, x: 600, y: 1020, zoom: 1.15 },
  { t: 10.5, x: 580, y: 1060, zoom: 1.2 },
  { t: 12.0, x: 650, y: 1020, zoom: 1.04 },
  { t: 15.0, x: 860, y: 1020, zoom: 1.05 },
  { t: 17.4, x: 1040, y: 1010, zoom: 1.15 },
  { t: 18.4, x: 1200, y: 1010, zoom: 1.0 },
  { t: 20.5, x: 1510, y: 1000, zoom: 0.98 },
  { t: 22.0, x: 1540, y: 1020, zoom: 1.08 },
  { t: 24.0, x: 1320, y: 1030, zoom: 1.08 },
  { t: 24.8, x: 1230, y: 1070, zoom: 1.24 },
  { t: 25.8, x: 1240, y: 1030, zoom: 1.15 },
  { t: 27.1, x: 1185, y: 1010, zoom: 1.24 },
  { t: 28.2, x: 1220, y: 1015, zoom: 1.42 },
  { t: 30.0, x: 1220, y: 1015, zoom: 1.48 },
];

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

export class LivingTrafficLightRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = clamp(time, 0, 30);

    ctx.save();
    this.drawSky(ctx, t);

    ctx.save();
    this.applyCamera(ctx, t);

    this.drawCityAndPark(ctx, t);
    this.drawStreetAndCrosswalk(ctx);
    this.drawPowerBoxAndCable(ctx, t);
    this.drawMiniTrafficLights(ctx, t);
    this.drawMainTrafficLight(ctx, t);
    this.drawCharacter(ctx, t);
    this.drawCelebrationNotes(ctx, t);
    this.drawBlackoutOverlay(ctx, t);
    this.drawRedFlashBeam(ctx, t);

    ctx.restore();

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
  // Deterministic blocking & traffic light state
  // ------------------------------------------------------------------
  private charAt(t: number) {
    let x = 240;
    const ground = FLOOR_Y;
    let lift = 0;
    let walkPhase = 0;

    if (t < 1.5) {
      const u = smooth(inv(0.0, 1.5, t));
      x = lerp(240, 430, u);
      walkPhase = t * 9;
    } else if (t < 6.1) {
      x = 430;
    } else if (t < 7.0) {
      const u = smooth(inv(6.1, 7.0, t));
      x = lerp(430, 560, u);
      walkPhase = (t - 6.1) * 10;
    } else if (t < 7.8) {
      x = 560;
    } else if (t < 8.9) {
      const u = smooth(inv(7.8, 8.9, t));
      x = lerp(560, 470, u);
      walkPhase = (t - 7.8) * 11;
    } else if (t < 10.2) {
      const u = smooth(inv(8.9, 10.2, t));
      x = lerp(470, 610, u);
      walkPhase = (t - 8.9) * 12;
    } else if (t < 11.2) {
      x = lerp(610, 570, smooth(inv(10.2, 11.2, t)));
    } else if (t < 12.3) {
      x = 570;
    } else if (t < 17.2) {
      const u = smooth(inv(12.3, 17.2, t));
      x = lerp(570, 960, u);
      walkPhase = (t - 12.3) * 6.5;
    } else if (t < 18.2) {
      x = lerp(960, 930, smooth(inv(17.2, 17.7, t)));
    } else if (t < 20.2) {
      const u = smooth(inv(18.2, 20.2, t));
      x = lerp(930, 1300, u);
      walkPhase = (t - 18.2) * 17;
    } else if (t < 21.35) {
      const u = inv(20.2, 21.35, t);
      x = lerp(1300, 1480, smooth(u));
      lift = Math.sin(u * Math.PI) * 260;
    } else if (t < 21.7) {
      const u = smooth(inv(21.35, 21.7, t));
      x = lerp(1480, 1520, u);
      walkPhase = (t - 21.35) * 15;
    } else if (t < 22.3) {
      const u = smooth(inv(21.7, 22.3, t));
      x = lerp(1520, 1435, u);
      lift = Math.sin(u * Math.PI) * 32;
    } else if (t < 24.0) {
      x = 1435;
    } else if (t < 24.6) {
      const u = smooth(inv(24.0, 24.6, t));
      x = lerp(1435, 1310, u);
      walkPhase = (t - 24.0) * 16;
    } else {
      x = 1310;
      if (t >= 25.5 && t < 26.8) {
        const hop = Math.abs(Math.sin((t - 25.5) * Math.PI * 2.3));
        lift = hop * 68;
      }
      if (t >= 27.65 && t < 28.25) {
        x += Math.sin((t - 27.65) * 55) * 4;
      }
    }

    return { x, ground, lift, walkPhase };
  }

  private lightXAt(t: number): number {
    if (t < 12.7) return 760;
    if (t < 17.3) return lerp(760, 1100, smooth(inv(12.7, 17.3, t)));
    return 1100;
  }

  private blackoutStrength(t: number): number {
    if (t < 25.0) return 0;
    if (t < 25.25) return smooth(inv(25.0, 25.25, t));
    if (t < 27.6) return 1;
    if (t < 28.0) return lerp(1, 0.72, smooth(inv(27.6, 28.0, t)));
    return 0.72;
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

  // ------------------------------------------------------------------
  // Backdrop & City + Park
  // ------------------------------------------------------------------
  private drawSky(ctx: CanvasRenderingContext2D, t: number) {
    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = SKY_DEEP;
    ctx.fillRect(0, 0, WIDTH, 260);

    // Sun
    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.arc(170, 190, 72, 0, TAU);
    ctx.fill();

    // Deterministic drifting clouds
    ctx.fillStyle = CLOUD;
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 360 + 140 + t * 12) % 1460) - 180;
      const cy = 160 + (i % 2) * 130;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 92, 34, 0, 0, TAU);
      ctx.ellipse(cx + 68, cy - 22, 60, 30, 0, 0, TAU);
      ctx.ellipse(cx - 72, cy - 14, 52, 26, 0, 0, TAU);
      ctx.fill();
    }
  }

  private drawCityAndPark(ctx: CanvasRenderingContext2D, t: number) {
    // Distant colorful Pop city buildings along x = -300..1850
    const buildings = [
      { x: -120, w: 220, h: 640, c: '#a5b4fc', win: '#fef08a' },
      { x: 120, w: 250, h: 780, c: '#fca5a5', win: '#ffffff' },
      { x: 390, w: 240, h: 590, c: '#93c5fd', win: '#fef08a' },
      { x: 650, w: 280, h: 740, c: '#fdba74', win: '#ffffff' },
      { x: 960, w: 260, h: 660, c: '#c4b5fd', win: '#fef08a' },
      { x: 1240, w: 250, h: 710, c: '#86efac', win: '#ffffff' },
      { x: 1510, w: 240, h: 560, c: '#f9a8d4', win: '#fef08a' },
    ];

    for (const b of buildings) {
      const top = FLOOR_Y - b.h;
      ctx.fillStyle = b.c;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.rect(b.x, top, b.w, b.h);
      ctx.fill();
      ctx.stroke();

      const winLit = this.blackoutStrength(t) < 0.35;
      ctx.fillStyle = winLit ? b.win : '#334155';
      for (let wy = top + 46; wy < FLOOR_Y - 120; wy += 95) {
        for (let wx = b.x + 34; wx < b.x + b.w - 60; wx += 70) {
          ctx.beginPath();
          ctx.roundRect(wx, wy, 38, 52, 6);
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    // City Park on the right (x = 1780..2700)
    const parkX = 1780;
    ctx.fillStyle = PARK_GRASS;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(parkX, FLOOR_Y - 140, 950, 140);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PARK_GRASS_DEEP;
    ctx.fillRect(parkX + 6, FLOOR_Y - 38, 938, 32);

    // Park trees
    for (const tx of [1930, 2130, 2340]) {
      ctx.fillStyle = PARK_TRUNK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.rect(tx - 18, FLOOR_Y - 320, 36, 200);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PARK_TREE;
      ctx.beginPath();
      ctx.arc(tx, FLOOR_Y - 370, 95, 0, TAU);
      ctx.arc(tx - 65, FLOOR_Y - 310, 68, 0, TAU);
      ctx.arc(tx + 65, FLOOR_Y - 310, 68, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Park Entrance Archway
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(1810, FLOOR_Y - 460, 230, 74, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = '900 36px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CITY PARK', 1925, FLOOR_Y - 423);
  }

  private drawStreetAndCrosswalk(ctx: CanvasRenderingContext2D) {
    // Sidewalk band at FLOOR_Y = 1500
    ctx.fillStyle = SIDEWALK;
    ctx.fillRect(-400, FLOOR_Y - 42, 3100, 42);
    ctx.strokeStyle = SIDEWALK_LINE;
    ctx.lineWidth = 4;
    for (let x = -300; x < 2600; x += 140) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR_Y - 42);
      ctx.lineTo(x - 24, FLOOR_Y);
      ctx.stroke();
    }

    // Curb
    ctx.fillStyle = CURB;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(-400, FLOOR_Y, 3100, 26);
    ctx.fill();
    ctx.stroke();

    // Asphalt road below curb
    ctx.fillStyle = ROAD;
    ctx.fillRect(-400, FLOOR_Y + 26, 3100, 600);

    // Zebra Crosswalk stripes (x = 460..920)
    ctx.fillStyle = ROAD_STRIPE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      const sx = 460 + i * 78;
      ctx.beginPath();
      ctx.roundRect(sx, FLOOR_Y + 60, 46, 175, 6);
      ctx.fill();
      ctx.stroke();
    }
  }

  // ------------------------------------------------------------------
  // Power Box & Power Cable (Scene 5 Unplug Gag)
  // ------------------------------------------------------------------
  private drawPowerBoxAndCable(ctx: CanvasRenderingContext2D, t: number) {
    const boxX = 1215;
    const boxY = 1235;
    const lightX = this.lightXAt(t);
    const unplugged = t >= 25.0;

    // Roadside Electrical Power Box
    ctx.save();
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(boxX - 42, boxY, 84, FLOOR_Y - boxY, 10);
    ctx.fill();
    ctx.stroke();

    // Lightning Bolt badge
    ctx.fillStyle = unplugged ? '#64748b' : '#facc15';
    ctx.beginPath();
    ctx.moveTo(boxX + 4, boxY + 26);
    ctx.lineTo(boxX - 14, boxY + 62);
    ctx.lineTo(boxX + 2, boxY + 62);
    ctx.lineTo(boxX - 6, boxY + 96);
    ctx.lineTo(boxX + 18, boxY + 54);
    ctx.lineTo(boxX + 2, boxY + 54);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Socket plate on right side of box
    const sockX = boxX + 28;
    const sockY = 1295;
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(sockX - 10, sockY - 20, 22, 40, 5);
    ctx.fill();
    ctx.stroke();

    // Plug coordinates
    const yankU = smooth(inv(24.92, 25.25, t));
    const plugX = unplugged ? lerp(sockX + 14, sockX + 58, yankU) : sockX + 12;
    const plugY = unplugged ? lerp(sockY, sockY + 120 * smooth(inv(25.15, 25.55, t)), 1) : sockY;

    // Power cable from Main Traffic Light base -> Power Box plug
    const startX = lightX + 28;
    const startY = 1438;
    const sagY = unplugged ? 1488 : 1480;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      lerp(startX, plugX, 0.35),
      sagY,
      lerp(startX, plugX, 0.72),
      sagY + 10,
      plugX,
      plugY
    );
    ctx.stroke();

    // Chunky plug head
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(plugX - 16, plugY - 14, 28, 28, 6);
    ctx.fill();
    ctx.stroke();

    if (unplugged) {
      // Exposed metal prongs
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(plugX - 16, plugY - 6);
      ctx.lineTo(plugX - 28, plugY - 6);
      ctx.moveTo(plugX - 16, plugY + 6);
      ctx.lineTo(plugX - 28, plugY + 6);
      ctx.stroke();
    }

    // Electric unplug sparks at 25.0-25.4s
    if (t >= 25.0 && t <= 25.45) {
      const spU = inv(25.0, 25.45, t);
      ctx.strokeStyle = SPARK_YELLOW;
      ctx.lineWidth = 5;
      for (let i = 0; i < 6; i++) {
        const a = -0.8 + i * 0.38;
        const r0 = 14 + spU * 24;
        const r1 = r0 + 26 * (1 - spU * 0.5);
        ctx.beginPath();
        ctx.moveTo(sockX + Math.cos(a) * r0, sockY + Math.sin(a) * r0);
        ctx.lineTo(sockX + Math.cos(a) * r1, sockY + Math.sin(a) * r1);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Main Living Traffic Light
  // ------------------------------------------------------------------
  private drawMainTrafficLight(ctx: CanvasRenderingContext2D, t: number) {
    const x = this.lightXAt(t);
    const wheelRot = (x - 760) / 28;

    // Active lens state
    const isOff = t >= 25.0 && t < 27.6;
    let active: 'red' | 'yellow' | 'green' | 'none' = 'none';
    if (!isOff) {
      if (t < 1.8) active = 'red';
      else if (t < 2.6) active = Math.floor((t - 1.8) * 10) % 2 === 0 ? 'red' : 'yellow';
      else if (t < 6.0) active = 'red';
      else if (t < 7.0) active = 'green';
      else if (t < 12.0) active = 'red';
      else if (t < 18.0) active = 'yellow';
      else if (t < 25.0) active = 'red';
      else active = Math.floor((t - 27.6) * 6) % 2 === 0 ? 'red' : 'none';
    }

    // Subtle body bounce while rolling in Scene 3
    const rollBounce = t >= 12.7 && t <= 17.3 ? Math.abs(Math.sin(t * 14)) * 5 : 0;

    ctx.save();
    ctx.translate(x, FLOOR_Y - rollBounce);

    // Contact shadow
    ctx.fillStyle = 'rgba(23,18,31,0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 8 + rollBounce, 74, 14, 0, 0, TAU);
    ctx.fill();

    // Base & Wheels
    ctx.fillStyle = LIGHT_POLE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(-52, -46, 104, 24, 10);
    ctx.fill();
    ctx.stroke();

    for (const wx of [-36, 36]) {
      ctx.save();
      ctx.translate(wx, -22);
      ctx.rotate(wheelRot);
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 10);
      ctx.stroke();
      ctx.restore();
    }

    // Steel Pole
    ctx.fillStyle = LIGHT_POLE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(-14, -390, 28, 344);
    ctx.fill();
    ctx.stroke();

    // Hidden Backup Battery compartment on right side of housing (opens at 26.8s)
    const battOpen = smooth(inv(26.8, 27.3, t));
    if (battOpen > 0.02) {
      ctx.save();
      ctx.translate(-56, -490);
      // Battery recess
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(-42 * battOpen, -52, 48 * battOpen, 104, 8);
      ctx.fill();
      ctx.stroke();

      // Glowing battery cells
      ctx.fillStyle = BATT_GREEN;
      ctx.beginPath();
      ctx.roundRect(-34 * battOpen, -40, 32 * battOpen, 80, 6);
      ctx.fill();
      ctx.stroke();

      // Hinged door swung downward
      ctx.save();
      ctx.translate(0, 52);
      ctx.rotate(-2.1 * battOpen);
      ctx.fillStyle = LIGHT_BEZEL;
      ctx.beginPath();
      ctx.roundRect(-10, -104, 16, 104, 5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Electric sparks when active
      if (t >= 27.1) {
        ctx.strokeStyle = SPARK_YELLOW;
        ctx.lineWidth = 4;
        const pulse = Math.sin(t * 24) * 8;
        ctx.beginPath();
        ctx.moveTo(-24, -64);
        ctx.lineTo(-34 + pulse * 0.4, -84);
        ctx.lineTo(-14, -86);
        ctx.lineTo(-28, -108);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Tall Black Housing
    ctx.fillStyle = LIGHT_BODY;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.roundRect(-60, -760, 120, 380, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = LIGHT_BEZEL;
    ctx.beginPath();
    ctx.roundRect(-46, -746, 92, 352, 18);
    ctx.fill();

    // Lenses (Red, Yellow, Green)
    const lenses: { cy: number; key: 'red' | 'yellow' | 'green'; on: string; off: string }[] = [
      { cy: -664, key: 'red', on: RED_ON, off: RED_OFF },
      { cy: -568, key: 'yellow', on: YELLOW_ON, off: YELLOW_OFF },
      { cy: -472, key: 'green', on: GREEN_ON, off: GREEN_OFF },
    ];
    for (const lens of lenses) {
      const lit = active === lens.key;
      if (lit) {
        ctx.save();
        ctx.fillStyle = lens.on;
        ctx.globalAlpha = 0.32;
        ctx.beginPath();
        ctx.arc(0, lens.cy, 46, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = lit ? lens.on : lens.off;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, lens.cy, 33, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Glint on lit lens
      if (lit) {
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.arc(-10, lens.cy - 11, 8, 0, TAU);
        ctx.fill();
      }
    }

    // Cartoon Eyes perched on top header of the housing (grow open at 1.9s!)
    const eyesScale = smooth(inv(1.9, 2.35, t));
    if (eyesScale > 0.02) {
      const asleep = t >= 25.0 && t < 27.6;
      const blink =
        !asleep &&
        ((t >= 2.4 && t <= 2.55) || (t >= 4.2 && t <= 4.35) || (t >= 13.8 && t <= 13.94));

      ctx.save();
      ctx.translate(0, -782);
      ctx.scale(eyesScale, eyesScale);

      // Eye brow housing cap
      ctx.fillStyle = LIGHT_BODY;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(-52, -32, 104, 56, 24);
      ctx.fill();
      ctx.stroke();

      for (const side of [-1, 1]) {
        const ex = side * 24;
        ctx.fillStyle = asleep ? '#64748b' : WHITE;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(ex, -4, 18, blink || asleep ? 3 : 20, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();

        if (!blink && !asleep) {
          // Pupils track Stickman
          const lookDir = t >= 24.0 ? 1 : -1;
          ctx.fillStyle = INK;
          ctx.beginPath();
          ctx.arc(ex + lookDir * 5, -2, 7, 0, TAU);
          ctx.fill();
        }
      }

      // Expressive angry/mischievous eyebrows on the traffic light
      if (!asleep) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        const angry = t >= 7.0;
        ctx.beginPath();
        if (angry) {
          ctx.moveTo(-44, -26);
          ctx.lineTo(-10, -14);
          ctx.moveTo(44, -26);
          ctx.lineTo(10, -14);
        } else {
          ctx.moveTo(-42, -26);
          ctx.lineTo(-12, -28);
          ctx.moveTo(42, -26);
          ctx.lineTo(12, -28);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // Mechanical Arm + Red Octagonal STOP Sign
    this.drawMechanicalStopArm(ctx, t);

    ctx.restore();
  }

  private drawMechanicalStopArm(ctx: CanvasRenderingContext2D, t: number) {
    // Extends in Scene 2 (7.0-12.0s), end of Scene 3 (17.1-18.0s), and Scene 5 red-flash (27.6-30.0s)
    let extend = 0;
    let signX = -155;
    let signY = -480;
    let signSide: -1 | 1 = -1;

    if (t >= 7.0 && t < 12.0) {
      extend = smooth(inv(7.0, 7.22, t)) * (1 - smooth(inv(11.75, 12.0, t)));
      if (t >= 7.9 && t < 9.0) {
        // Blocks left
        signX = lerp(-155, -245, smooth(inv(7.9, 8.2, t)));
        signY = -495;
      } else if (t >= 9.0 && t < 10.3) {
        // Blocks center/right
        signX = lerp(-245, -130, smooth(inv(9.0, 9.3, t)));
        signY = -510;
      } else if (t >= 10.3 && t < 11.2) {
        // Drops low to block crouch
        signX = -165;
        signY = lerp(-510, -280, smooth(inv(10.3, 10.6, t)));
      }
    } else if (t >= 17.05 && t < 18.1) {
      extend = smooth(inv(17.05, 17.28, t)) * (1 - smooth(inv(17.85, 18.1, t)));
      signX = -145;
      signY = -475;
    } else if (t >= 27.6) {
      extend = smooth(inv(27.6, 27.82, t));
      signSide = 1;
      signX = 148;
      signY = -500;
    }

    if (extend <= 0.02) return;

    const shoulderX = signSide * 56;
    const shoulderY = -510;
    const targetX = shoulderX + (signX - shoulderX) * extend;
    const targetY = lerp(shoulderY + 30, signY, extend);
    const elbowX = (shoulderX + targetX) / 2;
    const elbowY = Math.min(shoulderY, targetY) - 42;

    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    ctx.strokeStyle = LIGHT_ARM;
    ctx.lineWidth = 12;
    ctx.stroke();

    // Mechanical joint rivet
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(elbowX, elbowY, 9, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Octagonal STOP Sign Paddle
    this.drawStopSign(ctx, targetX, targetY, 48 * extend);
    ctx.restore();
  }

  private drawStopSign(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = STOP_RED;
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8 + Math.PI / 8;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = WHITE;
    ctx.font = `900 ${Math.round(r * 0.44)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('STOP', 0, 2);
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Scene 4 Mini Traffic Lights Rising from Pavement
  // ------------------------------------------------------------------
  private drawMiniTrafficLights(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 19.0 || t > 24.4) return;
    const configs = [
      { x: 1365, riseAt: 19.2 },
      { x: 1585, riseAt: 19.5 },
      { x: 1705, riseAt: 19.75 },
      { x: 1825, riseAt: 20.0 },
    ];

    for (const cfg of configs) {
      const pop = smooth(inv(cfg.riseAt, cfg.riseAt + 0.45, t));
      const retract = 1 - smooth(inv(23.85, 24.3, t));
      const u = pop * retract;
      if (u <= 0.01) continue;

      ctx.save();
      // Pavement hatch cover
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(cfg.x - 36, FLOOR_Y - 12, 72, 16, 4);
      ctx.fill();
      ctx.stroke();

      // Clip rising above pavement
      ctx.beginPath();
      ctx.rect(cfg.x - 160, FLOOR_Y - 600, 320, 600);
      ctx.clip();

      ctx.translate(cfg.x, FLOOR_Y + (1 - u) * 320);

      // Pole
      ctx.fillStyle = LIGHT_POLE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.rect(-8, -110, 16, 110);
      ctx.fill();
      ctx.stroke();

      // Mini Housing
      ctx.fillStyle = LIGHT_BODY;
      ctx.beginPath();
      ctx.roundRect(-34, -270, 68, 175, 14);
      ctx.fill();
      ctx.stroke();

      // Glowing RED top lens + dim yellow/green
      const ys = [-235, -182, -130];
      const cols = [RED_ON, YELLOW_OFF, GREEN_OFF];
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = cols[i];
        ctx.beginPath();
        ctx.arc(0, ys[i], 18, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }

      // Angry cartoon eyes on mini light
      ctx.fillStyle = WHITE;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(s * 14, -278, 10, 11, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.arc(s * 14 - 3, -277, 4, 0, TAU);
        ctx.fill();
        ctx.fillStyle = WHITE;
      }

      // Angry brows
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-26, -294);
      ctx.lineTo(-6, -286);
      ctx.moveTo(26, -294);
      ctx.lineTo(6, -286);
      ctx.stroke();

      // Mini STOP arm waving after Stickman lands
      const wave = t >= 21.5 ? Math.sin(t * 10 + cfg.x) * 14 : 0;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-34, -200);
      ctx.lineTo(-78, -210 + wave);
      ctx.stroke();
      this.drawStopSign(ctx, -84, -210 + wave, 28);

      ctx.restore();
    }
  }

  // ------------------------------------------------------------------
  // Scene 5 Blackout, Celebration & Red Flash Cone
  // ------------------------------------------------------------------
  private drawCelebrationNotes(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 25.4 || t > 26.8) return;
    const fade = smooth(inv(25.4, 25.65, t)) * (1 - smooth(inv(26.55, 26.8, t)));
    ctx.save();
    ctx.globalAlpha = fade;
    const stars = [
      { dx: -115, dy: -460 },
      { dx: 120, dy: -470 },
      { dx: 0, dy: -560 },
    ];
    for (let i = 0; i < stars.length; i++) {
      const sx = 1310 + stars[i].dx + Math.sin(t * 8 + i) * 12;
      const sy = FLOOR_Y + stars[i].dy + Math.cos(t * 7 + i) * 12;
      ctx.fillStyle = SPARK_YELLOW;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const r = k % 2 === 0 ? 18 : 8;
        const a = (k / 8) * TAU + t * 2;
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

  private drawBlackoutOverlay(ctx: CanvasRenderingContext2D, t: number) {
    const dark = this.blackoutStrength(t);
    if (dark <= 0.01) return;
    ctx.save();
    ctx.fillStyle = `rgba(10, 15, 30, ${0.68 * dark})`;
    ctx.fillRect(-600, -400, 3600, 2600);
    ctx.restore();
  }

  private drawRedFlashBeam(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 27.6) return;
    const isFlashOn = Math.floor((t - 27.6) * 6) % 2 === 0;
    const pulse = isFlashOn ? 0.95 : 0.22;
    const lightX = this.lightXAt(t);
    const lensX = lightX + 20;
    const lensY = FLOOR_Y - 664;

    ctx.save();
    // Red spotlight cone blasting from the RED lens straight into Stickman's face
    ctx.fillStyle = `rgba(255, 59, 78, ${0.42 * pulse})`;
    ctx.beginPath();
    ctx.moveTo(lensX, lensY - 26);
    ctx.lineTo(1470, lensY - 170);
    ctx.lineTo(1470, lensY + 340);
    ctx.lineTo(lensX, lensY + 26);
    ctx.closePath();
    ctx.fill();

    // Bright flare circle over red lens
    ctx.fillStyle = `rgba(255, 110, 125, ${0.7 * pulse})`;
    ctx.beginPath();
    ctx.arc(lensX - 20, lensY, 54, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Character (Locked POP_UP_TENT_CHARACTER.md rig — unchanged)
  // ------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, t: number) {
    const ch = this.charAt(t);
    const pose = this.poseAt(t, ch);
    const baseY = ch.ground - ch.lift;
    const hipY = baseY - (300 - 150 * pose.crouch - 170 * pose.sit);

    const arms = this.computeArms(pose, ch.x, hipY);

    if (ch.lift < 6 && pose.sit < 0.5) {
      ctx.fillStyle = 'rgba(23,18,31,0.16)';
      ctx.beginPath();
      ctx.ellipse(ch.x, ch.ground + 8, 78, 15, 0, 0, TAU);
      ctx.fill();
    }

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.drawBody(ctx, ch.x, hipY, baseY, pose, arms);
    const head = this.headPoint(pose, ch.x, hipY);
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
