import type { StudioConfig } from '../types';
import { drawHand } from './handRenderer';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

// --- palette -------------------------------------------------------------
const INK = '#17121f';
const WHITE = '#ffffff';
const SKY = '#8fd6f7';
const SKY_DEEP = '#6ec3ef';
const CLOUD = '#ffffff';
const LAWN = '#57c25a';
const LAWN_DARK = '#3da344';
const LAWN_LIGHT = '#7ad97c';
const WALL = '#ffd9a8';
const WALL_LINE = '#f2c48c';
const WALL_SHADE = '#efb877';
const ROOF = '#e4572e';
const ROOF_DARK = '#b93f1d';
const ROOF_LINE = '#8f2f14';
const CHIMNEY = '#c96b4a';
const FLOOR = '#d9a066';
const FLOOR_LINE = '#bf8452';
const BASEBOARD = '#ffffff';
const DOOR = '#8d5a3b';
const DOOR_DARK = '#6f4429';
const DOOR_KNOB = '#ffd166';
const WINDOW_GLASS = '#bfe9ff';
const WINDOW_FRAME = '#ffffff';
const SOFA = '#2f7fd6';
const SOFA_DARK = '#1f5da3';
const SOFA_LIGHT = '#4a9ae8';
const TABLE = '#c98a4b';
const TABLE_DARK = '#a86b34';
const LAMP = '#ffd166';
const LAMP_DARK = '#e8b23f';
const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const BEANIE_POM = '#ff6b6b';
const SHIRT = '#ffd166';
const SHIRT_DEEP = '#e8b23f';
const TROUSER = '#2f5fa8';
const SHOE = '#141414';
const BALLOON = '#e63946';
const BALLOON_DARK = '#9b1c28';
const BALLOON_LIGHT = '#ff8f97';

const FLOOR_Y = 1500;
const HEAD_R = 70;
const CHAR_REF_X = 480;

// House geometry (cutaway elevation).
const HOUSE_LEFT = 80;
const HOUSE_RIGHT = 1000;
const HOUSE_WALL_TOP = 700;
const HOUSE_APEX_Y = 470;
const ROOM_LEFT = 110;
const ROOM_RIGHT = 970;
const ROOM_TOP = 720;
const CHIMNEY_X = 830;
const CHIMNEY_W = 96;
const CHIMNEY_TOP = 392;
const DOOR_X = 130;
const DOOR_W = 130;
const DOOR_TOP = 1160;
const WINDOW_X = 720;
const WINDOW_W = 210;
const WINDOW_Y = 900;
const WINDOW_H = 280;
const SOFA_X = 540;
const SOFA_W = 260;
const SOFA_SEAT_Y = 1370;
const TABLE_X = 280;
const TABLE_W = 170;
const TABLE_TOP_Y = 1288;
const LAMP_X = 490;

const HOUSE_LIFT_MAX = 420;

// --- helpers -------------------------------------------------------------
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
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
  handL: Pt;
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
  handL: { x: 490, y: 1120 },
  handR: { x: 650, y: 1120 },
  bendL: 1,
  bendR: 1,
  gripL: false,
  gripR: false,
  fistL: false,
  fistR: false,
  pointL: false,
  pointR: false,
  beanieOn: true,
};

const POSE_PATCHES: { t: number; p?: PosePatch }[] = [
  // --- Shot 1: The Tiny Balloon (0-6s) ---
  { t: 0.0 },
  { t: 0.8, p: { headTurn: 8, look: 'right', brow: 'raised', mouth: 'o', eye: 'wide' } },
  {
    t: 1.4,
    p: {
      lean: 0.1,
      hipDrop: 8,
      headTurn: 10,
      look: 'down',
      brow: 'raised',
      mouth: 'o',
      handL: { x: 396, y: 1248 },
      handR: { x: 560, y: 1150 },
    },
  },
  {
    t: 2.0,
    p: {
      lean: 0.02,
      hipDrop: 0,
      headTurn: 6,
      look: 'down',
      mouth: 'smile',
      brow: 'raised',
      gripL: true,
      handL: { x: 404, y: 1168 },
      handR: { x: 570, y: 1130 },
    },
  },
  {
    t: 2.6,
    p: {
      lean: 0.06,
      look: 'down',
      mouth: 'flat',
      brow: 'determined',
      gripL: true,
      handL: { x: 404, y: 1168 },
      handR: { x: 470, y: 1246 },
    },
  },
  {
    t: 3.2,
    p: {
      lean: 0.08,
      look: 'down',
      mouth: 'grit',
      brow: 'determined',
      gripL: true,
      gripR: true,
      handL: { x: 430, y: 1200 },
      handR: { x: 470, y: 1220 },
    },
  },
  {
    t: 3.8,
    p: {
      lean: 0.1,
      look: 'down',
      mouth: 'grit',
      brow: 'determined',
      gripL: true,
      gripR: true,
      handL: { x: 430, y: 1196 },
      handR: { x: 486, y: 1176 },
    },
  },
  {
    t: 4.2,
    p: { lean: 0.06, look: 'down', mouth: 'grit', brow: 'determined', gripL: true, gripR: true, handR: { x: 462, y: 1274 } },
  },
  {
    t: 4.6,
    p: { lean: 0.1, look: 'down', mouth: 'grit', brow: 'determined', gripL: true, gripR: true, handR: { x: 486, y: 1176 } },
  },
  {
    t: 5.0,
    p: { lean: 0.06, look: 'down', mouth: 'grit', brow: 'determined', gripL: true, gripR: true, handR: { x: 462, y: 1274 } },
  },
  {
    t: 5.4,
    p: {
      lean: -0.06,
      hipDrop: -6,
      headTilt: -0.06,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      gripL: true,
      handL: { x: 408, y: 1140 },
      handR: { x: 566, y: 1110 },
    },
  },
  { t: 6.0, p: { lean: -0.02, mouth: 'bigsmile', brow: 'raised', eye: 'happy', gripL: true } },

  // --- Shot 2: Too Much Air (6-12s) ---
  {
    t: 6.5,
    p: {
      lean: 0.02,
      headTilt: 0.06,
      headTurn: 8,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      gripL: false,
      handL: { x: 400, y: 1130 },
      handR: { x: 566, y: 1110 },
    },
  },
  {
    t: 7.4,
    p: {
      lean: -0.04,
      headTilt: 0.1,
      look: 'right',
      mouth: 'flat',
      brow: 'sad',
      eye: 'wide',
      handL: { x: 380, y: 1120 },
      handR: { x: 586, y: 1120 },
    },
  },
  {
    t: 8.2,
    p: {
      lean: -0.14,
      hipDrop: 14,
      headTilt: 0.08,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      handL: { x: 396, y: 1120 },
      handR: { x: 470, y: 1128 },
    },
  },
  {
    t: 9.0,
    p: {
      lean: -0.2,
      hipDrop: 22,
      headTilt: 0.04,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      handR: { x: 500, y: 1080 },
    },
  },
  {
    t: 9.8,
    p: {
      lean: 0.18,
      hipDrop: 10,
      headTilt: -0.1,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      footLift: 24,
      handL: { x: 340, y: 1080 },
      handR: { x: 620, y: 1060 },
    },
  },
  {
    t: 10.6,
    p: {
      lean: 0,
      hipDrop: 0,
      headTilt: 0,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      footLift: 0,
      handL: { x: 790, y: 1060 },
      handR: { x: 920, y: 1060 },
    },
  },
  {
    t: 11.4,
    p: {
      lean: 0.04,
      headTilt: -0.06,
      look: 'right',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: 780, y: 1010 },
      handR: { x: 930, y: 1010 },
    },
  },
  { t: 12.0, p: { mouth: 'o', brow: 'sad', eye: 'wide' } },

  // --- Shot 3: The House Gets Trapped (12-18s) ---
  { t: 12.6, p: { look: 'right', mouth: 'flat', brow: 'sad', eye: 'wide' } },
  { t: 13.4, p: { headTilt: 0.14, headDrop: 10, look: 'up', mouth: 'o', brow: 'raised', eye: 'wide' } },
  { t: 14.4, p: { headTilt: 0.2, headDrop: 14, look: 'up', mouth: 'o', brow: 'raised', eye: 'wide' } },
  { t: 15.4, p: { headTilt: 0.02, headDrop: 0, look: 'right', mouth: 'o', brow: 'raised', eye: 'wide' } },
  {
    t: 16.4,
    p: {
      lean: 0.08,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 760, y: 1010 },
      handR: { x: 930, y: 1010 },
    },
  },
  { t: 17.4, p: { lean: 0.02, mouth: 'flat', brow: 'sad', eye: 'wide', handL: { x: 760, y: 1050 }, handR: { x: 930, y: 1050 } } },
  { t: 18.0, p: { mouth: 'flat', brow: 'sad', eye: 'wide' } },

  // --- Shot 4: The Balloon Prison (18-24s) ---
  {
    t: 18.4,
    p: {
      lean: -0.1,
      hipDrop: 16,
      headTilt: 0.08,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 790, y: 1060 },
      handR: { x: 930, y: 1060 },
    },
  },
  {
    t: 19.0,
    p: {
      lean: 0.22,
      hipDrop: 26,
      headTilt: -0.08,
      look: 'left',
      mouth: 'grit',
      brow: 'determined',
      eye: 'wide',
      footLift: 26,
      handL: { x: 770, y: 1100 },
      handR: { x: 920, y: 1080 },
    },
  },
  {
    t: 19.8,
    p: {
      lean: 0.12,
      hipDrop: 12,
      headTilt: 0,
      look: 'left',
      mouth: 'grit',
      brow: 'determined',
      eye: 'wide',
      footLift: 0,
      handL: { x: 180, y: 1120 },
      handR: { x: 250, y: 1190 },
    },
  },
  {
    t: 20.4,
    p: {
      lean: -0.12,
      hipDrop: 8,
      look: 'left',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      handL: { x: 170, y: 1120 },
      handR: { x: 280, y: 1130 },
    },
  },
  {
    t: 21.0,
    p: {
      lean: 0.06,
      hipDrop: 0,
      look: 'left',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 150, y: 1100 },
      handR: { x: 300, y: 1100 },
    },
  },
  {
    t: 21.4,
    p: {
      lean: 0.1,
      look: 'left',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      fistL: true,
      fistR: true,
      handL: { x: 150, y: 1120 },
      handR: { x: 240, y: 1110 },
    },
  },
  {
    t: 21.8,
    p: {
      lean: -0.12,
      look: 'left',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      fistL: true,
      fistR: true,
      handL: { x: 200, y: 1080 },
      handR: { x: 280, y: 1060 },
    },
  },
  {
    t: 22.1,
    p: {
      lean: 0.24,
      look: 'left',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      fistL: true,
      fistR: true,
      handL: { x: 150, y: 1140 },
      handR: { x: 205, y: 1140 },
    },
  },
  {
    t: 22.5,
    p: {
      lean: -0.24,
      hipDrop: 18,
      look: 'left',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 340, y: 1040 },
      handR: { x: 500, y: 1040 },
    },
  },
  {
    t: 22.9,
    p: {
      lean: -0.3,
      hipDrop: 24,
      headTilt: -0.12,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      footLift: 30,
      handL: { x: 380, y: 980 },
      handR: { x: 540, y: 980 },
    },
  },
  {
    t: 23.5,
    p: {
      lean: 0.06,
      hipDrop: 10,
      headTilt: 0.1,
      look: 'front',
      mouth: 'flat',
      brow: 'sad',
      eye: 'shut',
      footLift: 0,
      handL: { x: 600, y: 1150 },
      handR: { x: 720, y: 1150 },
    },
  },
  {
    t: 24.0,
    p: {
      lean: 0.02,
      hipDrop: 6,
      headTilt: 0.08,
      look: 'front',
      mouth: 'flat',
      brow: 'sad',
      eye: 'squint',
      handL: { x: 600, y: 1160 },
      handR: { x: 720, y: 1160 },
    },
  },

  // --- Shot 5: The Worst Escape (24-30s) ---
  {
    t: 24.6,
    p: {
      lean: 0.08,
      hipDrop: 0,
      headTilt: 0,
      look: 'left',
      mouth: 'flat',
      brow: 'normal',
      eye: 'open',
      handL: { x: 300, y: 1120 },
      handR: { x: 430, y: 1120 },
    },
  },
  {
    t: 25.1,
    p: {
      lean: 0.1,
      headTilt: 0.06,
      look: 'left',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 200, y: 1160 },
      handR: { x: 290, y: 1180 },
    },
  },
  {
    t: 25.6,
    p: {
      lean: 0.18,
      headTilt: 0.12,
      look: 'left',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      gripL: true,
      gripR: true,
      handL: { x: 228, y: 1276 },
      handR: { x: 300, y: 1264 },
    },
  },
  {
    t: 26.1,
    p: {
      lean: -0.16,
      hipDrop: 18,
      headTilt: -0.06,
      look: 'left',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      gripL: true,
      gripR: true,
      handL: { x: 240, y: 1160 },
      handR: { x: 312, y: 1150 },
    },
  },
  {
    t: 26.5,
    p: {
      lean: -0.26,
      hipDrop: 26,
      headTilt: -0.14,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      gripL: false,
      gripR: false,
      handL: { x: 205, y: 1080 },
      handR: { x: 325, y: 1060 },
    },
  },
  {
    t: 27.1,
    p: {
      lean: 0.1,
      hipDrop: 16,
      headTilt: 0.06,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 200, y: 1130 },
      handR: { x: 330, y: 1130 },
    },
  },
  {
    t: 27.7,
    p: {
      lean: -0.08,
      hipDrop: -14,
      headTilt: -0.1,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      handL: { x: 140, y: 940 },
      handR: { x: 300, y: 940 },
    },
  },
  {
    t: 28.1,
    p: {
      lean: 0,
      hipDrop: 0,
      headTilt: 0.1,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 180, y: 1010 },
      handR: { x: 320, y: 1000 },
    },
  },
  {
    t: 28.4,
    p: {
      lean: 0,
      headTilt: 0.16,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      beanieOn: false,
      handL: { x: 200, y: 880 },
      handR: { x: 330, y: 870 },
    },
  },
  {
    t: 28.9,
    p: {
      lean: 0.04,
      headTilt: 0.06,
      look: 'up',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      beanieOn: false,
      fistL: true,
      fistR: true,
      handL: { x: 170, y: 1040 },
      handR: { x: 330, y: 1030 },
    },
  },
  { t: 29.6, p: { mouth: 'grit', brow: 'angry', eye: 'squint', beanieOn: false } },
  { t: 30.0, p: { mouth: 'grit', brow: 'angry', eye: 'squint', beanieOn: false } },
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
  { text: 'HOW BIG CAN THIS GET?', from: 0.15, to: 5.78 },
  { text: 'WAIT\u2026 STOP!', from: 6.15, to: 11.85 },
  { text: "IT'S BIGGER THAN MY HOUSE!", from: 12.15, to: 17.85 },
  { text: 'LET ME OUT!', from: 18.15, to: 23.85 },
  { text: 'MY HAT!!!', from: 24.15, to: 29.75 },
];

// --- balloon -------------------------------------------------------------
interface BalloonKey {
  t: number;
  x: number;
  y: number;
  r: number;
}

// Rest geometry: a sphere that encloses the whole house and sits on the lawn.
const BALLOON_KEYS: BalloonKey[] = [
  { t: 0.0, x: 404, y: 1232, r: 26 },
  { t: 1.6, x: 404, y: 1230, r: 26 },
  { t: 2.1, x: 404, y: 1226, r: 28 },
  { t: 3.5, x: 404, y: 1216, r: 34 },
  { t: 3.85, x: 408, y: 1206, r: 50 },
  { t: 4.2, x: 414, y: 1194, r: 68 },
  { t: 4.55, x: 420, y: 1182, r: 86 },
  { t: 4.9, x: 426, y: 1172, r: 102 },
  { t: 5.6, x: 440, y: 1148, r: 118 },
  { t: 6.4, x: 470, y: 1110, r: 152 },
  { t: 7.4, x: 510, y: 1064, r: 224 },
  { t: 8.4, x: 552, y: 1056, r: 300 },
  { t: 9.4, x: 588, y: 1050, r: 366 },
  { t: 10.6, x: 620, y: 1046, r: 430 },
  { t: 12.0, x: 588, y: 1030, r: 500 },
  { t: 13.4, x: 556, y: 950, r: 700 },
  { t: 14.4, x: 540, y: 880, r: 940 },
  { t: 27.8, x: 540, y: 880, r: 940 },
  { t: 28.2, x: 556, y: 640, r: 900 },
  { t: 28.7, x: 596, y: 120, r: 780 },
  { t: 29.1, x: 620, y: -600, r: 620 },
  { t: 30.0, x: 640, y: -1700, r: 470 },
];

// Where Stickman drags the knot once he grabs it through the open front door.
const KNOT_PULLED = { x: 300, y: 1150 };

// --- camera --------------------------------------------------------------
interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 560, y: 1120, zoom: 1.2 },
  { t: 0.9, x: 600, y: 1130, zoom: 1.25 },
  { t: 1.7, x: 470, y: 1200, zoom: 1.45 },
  { t: 2.4, x: 470, y: 1160, zoom: 1.4 },
  { t: 3.4, x: 450, y: 1130, zoom: 1.45 },
  { t: 4.6, x: 430, y: 1080, zoom: 1.5 },
  { t: 5.6, x: 480, y: 1060, zoom: 1.45 },
  { t: 6.4, x: 540, y: 1080, zoom: 1.0 },
  { t: 7.6, x: 620, y: 1150, zoom: 1.05 },
  { t: 8.8, x: 700, y: 1150, zoom: 1.05 },
  { t: 9.8, x: 800, y: 1050, zoom: 1.2 },
  { t: 10.8, x: 860, y: 1000, zoom: 1.6 },
  { t: 12.0, x: 760, y: 980, zoom: 1.15 },
  { t: 13.6, x: 560, y: 950, zoom: 0.95 },
  { t: 15.4, x: 540, y: 980, zoom: 0.56 },
  { t: 17.6, x: 540, y: 980, zoom: 0.56 },
  { t: 18.8, x: 540, y: 940, zoom: 0.56 },
  { t: 20.2, x: 540, y: 880, zoom: 0.56 },
  { t: 20.8, x: 300, y: 780, zoom: 1.15 },
  { t: 21.8, x: 300, y: 780, zoom: 1.2 },
  { t: 22.6, x: 480, y: 800, zoom: 1.1 },
  { t: 23.4, x: 640, y: 900, zoom: 1.15 },
  { t: 24.2, x: 520, y: 980, zoom: 0.9 },
  { t: 24.9, x: 300, y: 1060, zoom: 1.15 },
  { t: 25.6, x: 240, y: 1080, zoom: 1.5 },
  { t: 26.2, x: 260, y: 1040, zoom: 1.45 },
  { t: 26.8, x: 420, y: 960, zoom: 0.85 },
  { t: 27.4, x: 300, y: 1000, zoom: 1.2 },
  { t: 27.9, x: 280, y: 960, zoom: 1.05 },
  { t: 28.4, x: 300, y: 900, zoom: 1.3 },
  { t: 29.0, x: 250, y: 900, zoom: 2.7 },
  { t: 30.0, x: 250, y: 890, zoom: 3.0 },
];

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

export class GiantBalloonPrisonRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    void config;
    const t = clamp(time, 0, 30);
    const lift = this.houseLift(t);

    ctx.save();
    this.drawSky(ctx, t);
    this.applyCamera(ctx, t);
    this.drawLawn(ctx);

    // Everything inside the house group rises together when the balloon lifts.
    // Clip at the lawn line so the resting balloon reads as sitting on the
    // grass instead of spilling below the ground.
    ctx.save();
    ctx.beginPath();
    ctx.rect(-2000, -4000, WIDTH + 4000, 5518);
    ctx.clip();
    ctx.translate(0, -lift);

    this.drawHouse(ctx, t);
    this.drawFurniture(ctx, t);
    this.drawProps(ctx, t);
    // The balloon shell sits over the room and the house, but behind the
    // stickman so he stays readable while he is trapped inside it.
    this.drawBalloon(ctx, t);
    this.drawCharacter(ctx, t);
    this.drawNeckAndKnot(ctx, t);
    this.drawFlyingBeanie(ctx, t);

    ctx.restore();
    ctx.restore();

    this.drawCaptions(ctx, t);
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
  // Timeline state
  // ------------------------------------------------------------------
  private houseLift(t: number) {
    if (t < 18.8) return 0;
    if (t < 20.4) return HOUSE_LIFT_MAX * smooth(inv(18.8, 20.4, t));
    if (t < 26.3) return HOUSE_LIFT_MAX;
    if (t < 27.2) return HOUSE_LIFT_MAX * (1 - smooth(inv(26.3, 27.2, t)));
    return 0;
  }

  private charAt(t: number) {
    let x = CHAR_REF_X;
    let ground = FLOOR_Y;
    let lift = 0;

    if (t < 0.9) {
      x = 600;
    } else if (t < 1.6) {
      x = lerp(600, CHAR_REF_X, smooth(inv(0.9, 1.6, t)));
    } else if (t < 9.6) {
      x = CHAR_REF_X;
    } else if (t < 10.5) {
      x = lerp(CHAR_REF_X, 862, smooth(inv(9.6, 10.5, t)));
    } else if (t < 19.0) {
      x = 862;
    } else if (t < 19.9) {
      x = lerp(862, 196, smooth(inv(19.0, 19.9, t)));
    } else if (t < 21.7) {
      x = 196;
    } else if (t < 22.9) {
      x = lerp(196, 660, smooth(inv(21.7, 22.9, t)));
      lift = Math.sin(inv(21.7, 22.9, t) * Math.PI) * 210;
    } else if (t < 24.1) {
      x = 660;
      ground = SOFA_SEAT_Y;
    } else if (t < 24.9) {
      x = lerp(660, 196, smooth(inv(24.1, 24.9, t)));
      ground = lerp(SOFA_SEAT_Y, FLOOR_Y, smooth(inv(24.1, 24.9, t)));
    } else {
      x = 196;
    }

    return { x, ground, scale: 1, lift };
  }

  private poseAt(t: number): Pose {
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
      stance: lerp(pa.stance, pb.stance, u),
      footLift: lerp(pa.footLift, pb.footLift, u),
      handL: { x: lerp(pa.handL.x, pb.handL.x, u), y: lerp(pa.handL.y, pb.handL.y, u) },
      handR: { x: lerp(pa.handR.x, pb.handR.x, u), y: lerp(pa.handR.y, pb.handR.y, u) },
      bendL: pick(pa.bendL, pb.bendL),
      bendR: pick(pa.bendR, pb.bendR),
      gripL: pick(pa.gripL, pb.gripL),
      gripR: pick(pa.gripR, pb.gripR),
      fistL: pick(pa.fistL, pb.fistL),
      fistR: pick(pa.fistR, pb.fistR),
      pointL: pick(pa.pointL, pb.pointL),
      pointR: pick(pa.pointR, pb.pointR),
      beanieOn: pick(pa.beanieOn, pb.beanieOn),
    };
  }

  // ------------------------------------------------------------------
  // Sky and lawn
  // ------------------------------------------------------------------
  private drawSky(ctx: CanvasRenderingContext2D, t: number) {
    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = SKY_DEEP;
    ctx.fillRect(0, 0, WIDTH, 260);

    // Sun.
    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.arc(150, 180, 74, 0, TAU);
    ctx.fill();

    // Flat cartoon clouds drifting slowly.
    ctx.fillStyle = CLOUD;
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 380 + 120 + t * 14) % 1560) - 240;
      const cy = 150 + (i % 2) * 210;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 96, 38, 0, 0, TAU);
      ctx.ellipse(cx + 74, cy - 26, 66, 34, 0, 0, TAU);
      ctx.ellipse(cx - 76, cy - 16, 58, 28, 0, 0, TAU);
      ctx.fill();
    }
  }

  private drawLawn(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = LAWN;
    ctx.fillRect(-900, FLOOR_Y, WIDTH + 1800, 1500);
    ctx.fillStyle = LAWN_LIGHT;
    ctx.fillRect(-900, FLOOR_Y, WIDTH + 1800, 26);
    ctx.fillStyle = LAWN_DARK;
    for (let i = 0; i < 22; i++) {
      const x = -120 + i * 62;
      const y = FLOOR_Y + 52 + (i % 3) * 26;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10, y - 22);
      ctx.lineTo(x + 20, y);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ------------------------------------------------------------------
  // House
  // ------------------------------------------------------------------
  private roofLift(t: number) {
    return 46 * smooth(inv(13.4, 14.4, t));
  }

  private drawHouse(ctx: CanvasRenderingContext2D, t: number) {
    const roofLift = this.roofLift(t);
    const enclose = smooth(inv(14.2, 15.4, t));

    // Chimney (behind the roof).
    ctx.save();
    ctx.translate(0, -roofLift);
    ctx.fillStyle = CHIMNEY;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.rect(CHIMNEY_X, CHIMNEY_TOP, CHIMNEY_W, HOUSE_WALL_TOP + 30 - CHIMNEY_TOP);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#a95236';
    ctx.beginPath();
    ctx.rect(CHIMNEY_X - 12, CHIMNEY_TOP - 20, CHIMNEY_W + 24, 30);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Roof.
    ctx.fillStyle = ROOF;
    ctx.strokeStyle = ROOF_LINE;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(HOUSE_LEFT - 46, HOUSE_WALL_TOP);
    ctx.lineTo(540, HOUSE_APEX_Y - roofLift);
    ctx.lineTo(HOUSE_RIGHT + 46, HOUSE_WALL_TOP);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = ROOF_DARK;
    ctx.lineWidth = 5;
    for (let i = 1; i <= 3; i++) {
      const u = i / 4;
      ctx.beginPath();
      ctx.moveTo(lerp(HOUSE_LEFT - 46, 540, u), lerp(HOUSE_WALL_TOP, HOUSE_APEX_Y - roofLift, u));
      ctx.lineTo(lerp(HOUSE_RIGHT + 46, 540, u), lerp(HOUSE_WALL_TOP, HOUSE_APEX_Y - roofLift, u));
      ctx.stroke();
    }

    // Exterior walls.
    ctx.fillStyle = WALL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.rect(HOUSE_LEFT, HOUSE_WALL_TOP, HOUSE_RIGHT - HOUSE_LEFT, FLOOR_Y - HOUSE_WALL_TOP);
    ctx.fill();
    ctx.stroke();

    // Cutaway room interior.
    ctx.fillStyle = WALL;
    ctx.beginPath();
    ctx.rect(ROOM_LEFT, ROOM_TOP, ROOM_RIGHT - ROOM_LEFT, FLOOR_Y - ROOM_TOP);
    ctx.fill();
    ctx.fillStyle = WALL_LINE;
    for (let x = ROOM_LEFT + 30; x < ROOM_RIGHT; x += 116) {
      ctx.fillRect(x, ROOM_TOP, 34, FLOOR_Y - ROOM_TOP);
    }
    ctx.fillStyle = WALL_SHADE;
    ctx.fillRect(ROOM_LEFT, ROOM_TOP, ROOM_RIGHT - ROOM_LEFT, 18);

    // Room outline.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.rect(ROOM_LEFT, ROOM_TOP, ROOM_RIGHT - ROOM_LEFT, FLOOR_Y - ROOM_TOP);
    ctx.stroke();

    // Interior floor.
    ctx.fillStyle = FLOOR;
    ctx.fillRect(ROOM_LEFT, 1420, ROOM_RIGHT - ROOM_LEFT, FLOOR_Y - 1420);
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 4;
    for (let x = ROOM_LEFT + 40; x < ROOM_RIGHT; x += 92) {
      ctx.beginPath();
      ctx.moveTo(x, 1420);
      ctx.lineTo(x - 24, FLOOR_Y);
      ctx.stroke();
    }
    ctx.fillStyle = BASEBOARD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(ROOM_LEFT, 1470, ROOM_RIGHT - ROOM_LEFT, 30);
    ctx.fill();
    ctx.stroke();

    this.drawDoor(ctx, t, enclose);
    this.drawWindow(ctx, enclose);
  }

  private drawDoor(ctx: CanvasRenderingContext2D, t: number, enclose: number) {
    const open = smooth(inv(20.0, 20.7, t)) * 0.9;
    ctx.save();
    ctx.translate(DOOR_X, 0);

    // Frame.
    ctx.fillStyle = DOOR_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(-12, DOOR_TOP - 14, DOOR_W + 24, FLOOR_Y - DOOR_TOP + 14);
    ctx.fill();
    ctx.stroke();

    // The opening: hallway darkness, or the stretched balloon wall once the
    // shell has swallowed the house.
    ctx.fillStyle = this.mixHex('#3b2416', '#c9384a', enclose);
    ctx.beginPath();
    ctx.rect(0, DOOR_TOP, DOOR_W, FLOOR_Y - DOOR_TOP);
    ctx.fill();

    // Door leaf swings toward the viewer on its hinge.
    ctx.save();
    ctx.translate(0, DOOR_TOP);
    ctx.transform(1 - open * 0.82, 0, open * 0.22, 1, 0, 0);
    ctx.fillStyle = DOOR;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(0, 0, DOOR_W, FLOOR_Y - DOOR_TOP);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = DOOR_DARK;
    ctx.beginPath();
    ctx.rect(14, 26, DOOR_W - 28, 128);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(14, 176, DOOR_W - 28, 128);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = DOOR_KNOB;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(DOOR_W - 24, 186, 11, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  private drawWindow(ctx: CanvasRenderingContext2D, enclose: number) {
    const glass = this.mixHex(WINDOW_GLASS, '#f19aa0', enclose);

    ctx.save();
    ctx.fillStyle = WINDOW_FRAME;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.rect(WINDOW_X - 16, WINDOW_Y - 16, WINDOW_W + 32, WINDOW_H + 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.rect(WINDOW_X, WINDOW_Y, WINDOW_W, WINDOW_H);
    ctx.fill();

    // Outside detail: sky, a cloud and the red balloon wall once it surrounds us.
    if (enclose < 0.5) {
      ctx.fillStyle = CLOUD;
      ctx.beginPath();
      ctx.ellipse(WINDOW_X + 62, WINDOW_Y + 76, 42, 22, 0, 0, TAU);
      ctx.ellipse(WINDOW_X + 116, WINDOW_Y + 62, 32, 18, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = LAWN;
      ctx.beginPath();
      ctx.rect(WINDOW_X, WINDOW_Y + WINDOW_H - 62, WINDOW_W, 62);
      ctx.fill();
    } else {
      ctx.fillStyle = '#d94b58';
      ctx.globalAlpha = enclose;
      ctx.beginPath();
      ctx.rect(WINDOW_X, WINDOW_Y, WINDOW_W, WINDOW_H);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Mullions.
    ctx.strokeStyle = WINDOW_FRAME;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(WINDOW_X + WINDOW_W / 2, WINDOW_Y);
    ctx.lineTo(WINDOW_X + WINDOW_W / 2, WINDOW_Y + WINDOW_H);
    ctx.moveTo(WINDOW_X, WINDOW_Y + WINDOW_H / 2);
    ctx.lineTo(WINDOW_X + WINDOW_W, WINDOW_Y + WINDOW_H / 2);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(WINDOW_X, WINDOW_Y, WINDOW_W, WINDOW_H);
    ctx.stroke();

    // Sill.
    ctx.fillStyle = WINDOW_FRAME;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(WINDOW_X - 26, WINDOW_Y + WINDOW_H + 12, WINDOW_W + 52, 26);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Furniture
  // ------------------------------------------------------------------
  private sofaOffset(t: number) {
    return -62 * smooth(inv(7.6, 9.2, t));
  }

  private tableOffset(t: number) {
    return 56 * smooth(inv(8.4, 9.8, t));
  }

  private lampTilt(t: number) {
    return 0.38 * smooth(inv(8.9, 10.0, t));
  }

  private drawFurniture(ctx: CanvasRenderingContext2D, t: number) {
    this.drawSofa(ctx, this.sofaOffset(t));
    this.drawTable(ctx, this.tableOffset(t));
    this.drawLamp(ctx, this.lampTilt(t));
  }

  private drawSofa(ctx: CanvasRenderingContext2D, dx: number) {
    ctx.save();
    ctx.translate(dx, 0);

    // Back.
    ctx.fillStyle = SOFA;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(SOFA_X, 1248, SOFA_W, 140, 26);
    ctx.fill();
    ctx.stroke();

    // Seat.
    ctx.fillStyle = SOFA_LIGHT;
    ctx.beginPath();
    ctx.roundRect(SOFA_X - 16, SOFA_SEAT_Y - 26, SOFA_W + 32, 66, 22);
    ctx.fill();
    ctx.stroke();

    // Cushion seam.
    ctx.strokeStyle = SOFA_DARK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(SOFA_X + SOFA_W / 2, 1262);
    ctx.lineTo(SOFA_X + SOFA_W / 2, 1364);
    ctx.stroke();

    // Base and legs.
    ctx.fillStyle = SOFA_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(SOFA_X - 10, SOFA_SEAT_Y + 40, SOFA_W + 20, 44, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    for (const lx of [SOFA_X + 14, SOFA_X + SOFA_W - 30]) {
      ctx.beginPath();
      ctx.roundRect(lx, SOFA_SEAT_Y + 84, 18, 26, 6);
      ctx.fill();
    }

    // Throw pillow.
    ctx.fillStyle = '#ffd166';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(SOFA_X + SOFA_W - 86, 1290, 62, 62, 16);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawTable(ctx: CanvasRenderingContext2D, dx: number) {
    ctx.save();
    ctx.translate(dx, 0);
    ctx.fillStyle = TABLE_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    for (const lx of [TABLE_X + 18, TABLE_X + TABLE_W - 38]) {
      ctx.beginPath();
      ctx.roundRect(lx, TABLE_TOP_Y + 26, 22, FLOOR_Y - TABLE_TOP_Y - 26, 5);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = TABLE;
    ctx.beginPath();
    ctx.roundRect(TABLE_X, TABLE_TOP_Y, TABLE_W, 30, 10);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = TABLE_DARK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(TABLE_X + 10, TABLE_TOP_Y + 20);
    ctx.lineTo(TABLE_X + TABLE_W - 10, TABLE_TOP_Y + 20);
    ctx.stroke();
    ctx.restore();
  }

  private drawLamp(ctx: CanvasRenderingContext2D, tilt: number) {
    ctx.save();
    ctx.translate(LAMP_X, FLOOR_Y);
    ctx.rotate(tilt);
    ctx.fillStyle = LAMP_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 52, 16, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, -382);
    ctx.stroke();
    ctx.fillStyle = LAMP;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-64, -382);
    ctx.lineTo(64, -382);
    ctx.lineTo(42, -448);
    ctx.lineTo(-42, -448);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff2b8';
    ctx.beginPath();
    ctx.ellipse(0, -444, 30, 8, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Props
  // ------------------------------------------------------------------
  private drawProps(ctx: CanvasRenderingContext2D, t: number) {
    // Hand pump on the table, visible while he is inflating.
    if (t > 2.2 && t < 6.4) {
      const bob = t > 3.6 && t < 5.2 ? Math.sin((t - 3.6) * Math.PI * 4) * 6 : 0;
      ctx.save();
      ctx.translate(432 + this.tableOffset(t), 1266);
      ctx.fillStyle = '#7bd389';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(-30, -24 - bob, 60, 52 + bob, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4fae5e';
      ctx.beginPath();
      ctx.roundRect(-14, -56 - bob, 28, 34, 8);
      ctx.fill();
      ctx.stroke();
      // Nozzle.
      ctx.strokeStyle = INK;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-30, 6);
      ctx.lineTo(-58, 10);
      ctx.stroke();
      ctx.restore();
    }
  }

  private mixHex(a: string, b: string, u: number) {
    const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
    const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
    const c = pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(u, 0, 1))));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }

  // ------------------------------------------------------------------
  // Character
  // ------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, t: number) {
    const ch = this.charAt(t);
    const pose = this.poseAt(t);
    const baseY = ch.ground - ch.lift;
    const hipY = baseY - 300;

    // Hand targets in the pose table are absolute canvas coordinates.
    const arms = this.computeArms(pose, ch.x, hipY);

    if (ch.lift < 6) {
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
    const ankleL = { x: hipX - 40 - stance, y: ankleBase };
    const ankleR = { x: hipX + 40 + stance, y: ankleBase - pose.footLift };
    const kneeL = {
      x: hipX - 24 - stance * 0.4,
      y: hipY + 86 + Math.max(0, pose.hipDrop) * 0.3,
    };
    const kneeR = {
      x: hipX + 24 + stance * 0.4,
      y: hipY + 86 + Math.max(0, pose.hipDrop) * 0.3,
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

    this.drawShoe(ctx, ankleL.x - 4, ankleL.y + 12, -0.06);
    this.drawShoe(ctx, ankleR.x + 4, ankleR.y + 12, pose.footLift > 20 ? -0.24 : 0.06);

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
      pose: pose.fistL ? 'fist' : pose.gripL ? 'grip' : 'relaxed',
      layer: 'full',
    });
    drawHand(ctx, arms.r, {
      side: 'right',
      pose: pose.fistR ? 'fist' : pose.gripR ? 'grip' : 'relaxed',
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

    if (pose.beanieOn) this.drawBeanie(ctx);

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

  private drawBeanie(ctx: CanvasRenderingContext2D) {
    this.drawBeanieShape(ctx);
  }

  // ------------------------------------------------------------------
  // Balloon
  // ------------------------------------------------------------------
  private balloonState(t: number) {
    const keys = BALLOON_KEYS;
    let a = keys[0];
    let b = keys[0];
    if (t <= keys[0].t) {
      a = keys[0];
      b = a;
    } else if (t >= keys[keys.length - 1].t) {
      a = keys[keys.length - 1];
      b = a;
    } else {
      for (let i = 0; i < keys.length - 1; i++) {
        if (t >= keys[i].t && t <= keys[i + 1].t) {
          a = keys[i];
          b = keys[i + 1];
          break;
        }
      }
    }
    const u = b.t === a.t ? 0 : smooth((t - a.t) / (b.t - a.t));
    return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), r: lerp(a.r, b.r, u) };
  }

  private drawBalloon(ctx: CanvasRenderingContext2D, t: number) {
    const b = this.balloonState(t);
    if (b.r < 1) return;
    const rim = clamp(b.r * 0.022, 4, 16);

    ctx.save();

    // Contact shadow while it still rests on the table.
    if (b.r < 320) {
      ctx.fillStyle = 'rgba(23,18,31,0.14)';
      ctx.beginPath();
      ctx.ellipse(b.x, b.y + b.r * 0.96, b.r * 0.8, b.r * 0.16, 0, 0, TAU);
      ctx.fill();
    }

    // Transparent body: the house and Stickman stay visible through it.
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, TAU);
    ctx.fillStyle = 'rgba(230,57,70,0.17)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230,57,70,0.30)';
    ctx.lineWidth = Math.max(8, b.r * 0.075);
    ctx.stroke();

    // Thick dark-red outline.
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, TAU);
    ctx.strokeStyle = BALLOON_DARK;
    ctx.lineWidth = rim;
    ctx.stroke();

    // Glossy highlight.
    const gl = clamp(b.r * 0.30, 10, 240);
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.beginPath();
    ctx.ellipse(b.x - b.r * 0.40, b.y - b.r * 0.44, gl * 0.44, gl * 0.26, -0.72, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.52, b.y - b.r * 0.14, gl * 0.11, 0, TAU);
    ctx.fill();

    // Mischievous face, only once the balloon is enormous.
    const faceIn = smooth(inv(15.6, 16.6, t));
    if (faceIn > 0.001 && b.r > 480) {
      const eyeDX = b.r * 0.16;
      const eyeY = b.y - b.r * 0.42;
      const eyeW = Math.max(9, b.r * 0.026);
      const eyeH = Math.max(15, b.r * 0.05);
      ctx.globalAlpha = faceIn;
      ctx.fillStyle = INK;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(b.x + s * eyeDX, eyeY, eyeW, eyeH, 0, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = WHITE;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(b.x + s * eyeDX - eyeW * 0.34, eyeY - eyeH * 0.36, eyeW * 0.34, 0, TAU);
        ctx.fill();
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(6, b.r * 0.019);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(b.x, eyeY + b.r * 0.22, b.r * 0.155, 0.18 * Math.PI, 0.82 * Math.PI);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  private knotAt(t: number, b: { x: number; y: number; r: number }) {
    // Once the balloon swallows the house the neck flops into the open
    // doorway, where Stickman can actually reach it.
    const blend = smooth(clamp((b.r - 500) / 120, 0, 1));
    const sphereX = b.x - b.r * 0.36;
    const sphereY = b.y + b.r * 0.93;
    const riseX = t > 27.8 ? b.x - 540 : 0;
    const riseY = t > 27.8 ? b.y - 720 : 0;

    const baseX = lerp(sphereX, 240 + riseX, blend);
    const baseY = lerp(sphereY, 1165 + riseY, blend);
    const hang = clamp(b.r * 0.16, 22, 130);

    let pull = 0;
    if (t > 25.3) {
      pull = smooth(inv(25.3, 26.0, t));
      if (t > 26.0) pull = 1 - smooth(inv(26.0, 26.8, t));
    }

    return {
      x: lerp(baseX + 12, KNOT_PULLED.x + riseX, pull),
      y: lerp(baseY + hang, KNOT_PULLED.y + riseY, pull),
      baseX,
      baseY,
    };
  }

  private drawNeckAndKnot(ctx: CanvasRenderingContext2D, t: number) {
    const b = this.balloonState(t);
    const k = this.knotAt(t, b);

    const w0 = clamp(b.r * 0.10, 10, 44);
    const w1 = clamp(b.r * 0.07, 8, 30);
    const dx = k.x - k.baseX;
    const dy = k.y - k.baseY;
    const len = Math.max(1, Math.hypot(dx, dy));
    const px = -dy / len;
    const py = dx / len;
    const line = clamp(b.r * 0.013, 3, 8);

    // Tapered neck from the balloon to the knot.
    ctx.beginPath();
    ctx.moveTo(k.baseX + px * w0 * 0.5, k.baseY + py * w0 * 0.5);
    ctx.lineTo(k.x + px * w1 * 0.5, k.y + py * w1 * 0.5);
    ctx.lineTo(k.x - px * w1 * 0.5, k.y - py * w1 * 0.5);
    ctx.lineTo(k.baseX - px * w0 * 0.5, k.baseY - py * w0 * 0.5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(230,57,70,0.62)';
    ctx.fill();
    ctx.strokeStyle = BALLOON_DARK;
    ctx.lineWidth = line;
    ctx.stroke();

    // Knot.
    const kr = clamp(b.r * 0.052, 10, 42);
    ctx.fillStyle = BALLOON;
    ctx.strokeStyle = BALLOON_DARK;
    ctx.lineWidth = line;
    ctx.beginPath();
    ctx.ellipse(k.x, k.y, kr * 1.15, kr * 0.9, 0.25, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Two little tails.
    ctx.beginPath();
    ctx.moveTo(k.x - kr * 0.5, k.y + kr * 0.5);
    ctx.quadraticCurveTo(k.x - kr * 1.3, k.y + kr * 1.5, k.x - kr * 0.25, k.y + kr * 1.6);
    ctx.quadraticCurveTo(k.x + kr * 0.25, k.y + kr * 1.05, k.x + kr * 0.55, k.y + kr * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // ------------------------------------------------------------------
  // Flying beanie
  // ------------------------------------------------------------------
  private drawFlyingBeanie(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 28.25) return;
    const u = clamp((t - 28.25) / 1.05, 0, 1);
    const ch = this.charAt(t);
    const baseY = ch.ground - ch.lift;
    const headY = baseY - 300 - 170 - 20 - HEAD_R;

    const x = ch.x + 6 + 46 * u + 58 * u * u;
    const y = headY - 24 - 640 * u - 130 * u * u;
    const rot = -0.35 * u + 2.3 * u * u;
    const scale = 1 - 0.32 * u;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    this.drawBeanieShape(ctx);
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Captions
  // ------------------------------------------------------------------
  private drawCaptions(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const c of CAPTIONS) {
      if (t < c.from || t > c.to) continue;
      const u = inv(c.from, c.from + 0.24, t);
      const out = 1 - smooth(inv(c.to - 0.18, c.to, t));
      const alpha = Math.min(1, u * 2.4) * out;
      if (alpha <= 0.001) continue;
      const pop = 0.88 + 0.12 * easeOut(u) + Math.sin(clamp(u, 0, 1) * Math.PI) * 0.05;
      const size = c.text.length > 22 ? 54 : 62;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(WIDTH / 2, 470);
      ctx.scale(pop, pop);
      ctx.font = `900 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.shadowColor = 'rgba(23,18,31,0.45)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 16;
      ctx.strokeText(c.text, 0, 0);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = WHITE;
      ctx.fillText(c.text, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }
}
