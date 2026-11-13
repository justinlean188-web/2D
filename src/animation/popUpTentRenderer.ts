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
const WALL = '#ffe3c2';
const WALL_LINE = '#ffd39b';
const WALL_SHADE = '#f7c68a';
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
const ORANGE = '#ff8a3d';
const ORANGE_LIGHT = '#ffa55c';
const ORANGE_DEEP = '#e86a1e';
const TURQUOISE = '#2ec4c6';
const TURQUOISE_DEEP = '#1a9fa4';
const YELLOW = '#ffd166';
const YELLOW_DEEP = '#e8b23f';
const POLE = '#3b3b46';
const POLE_LIGHT = '#8f8f9a';
const BUTTON_RED = '#e63946';
const BUTTON_DEEP = '#a81f2c';
const BAG = '#2ec4c6';
const BAG_DEEP = '#1a9fa4';
const BAG_LINING = '#ffd166';
const GROUNDSHEET = '#f2c14e';

const FLOOR_Y = 1500;
const HEAD_R = 70;

// House geometry (cutaway elevation), shared with the giant-balloon world.
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
const DOOR_TOP = 850;
const WINDOW_X = 720;
const WINDOW_W = 210;
const WINDOW_Y = 900;
const WINDOW_H = 280;
const SOFA_W = 260;
const SOFA_SEAT_Y = 1370;
const TABLE_X = 280;
const TABLE_W = 170;
const TABLE_TOP_Y = 1288;
const LAMP_X = 760;

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
  crouch: 0,
  sit: 0,
};

const POSE_PATCHES: { t: number; p?: PosePatch }[] = [
  // --- Shot 1: The Tiny Tent (0-6s) ---
  {
    t: 0.0,
    p: {
      headTurn: 8,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      handL: { x: 366, y: 1130 },
      handR: { x: 500, y: 1120 },
    },
  },
  { t: 0.7, p: { headTurn: 10, look: 'right', mouth: 'o', brow: 'raised', eye: 'wide' } },
  {
    t: 1.6,
    p: {
      lean: 0.06,
      headTurn: 8,
      look: 'down',
      mouth: 'flat',
      brow: 'normal',
      handL: { x: 430, y: 1180 },
      handR: { x: 560, y: 1160 },
    },
  },
  {
    t: 2.1,
    p: {
      lean: 0.18,
      crouch: 0.92,
      hipDrop: 12,
      headTilt: 0.08,
      headTurn: 6,
      look: 'down',
      mouth: 'flat',
      brow: 'determined',
      gripL: true,
      gripR: true,
      handL: { x: 500, y: 1408 },
      handR: { x: 612, y: 1398 },
    },
  },
  {
    t: 2.5,
    p: {
      lean: 0.12,
      crouch: 0.75,
      hipDrop: 8,
      look: 'down',
      mouth: 'flat',
      brow: 'determined',
      gripL: true,
      gripR: true,
      handL: { x: 486, y: 1330 },
      handR: { x: 598, y: 1320 },
    },
  },
  {
    t: 3.1,
    p: {
      lean: 0.02,
      crouch: 0.12,
      hipDrop: 0,
      headTurn: 5,
      look: 'down',
      mouth: 'smile',
      brow: 'raised',
      gripL: true,
      gripR: true,
      handL: { x: 482, y: 1200 },
      handR: { x: 598, y: 1190 },
    },
  },
  {
    t: 3.6,
    p: {
      lean: -0.05,
      crouch: 0,
      headTilt: -0.05,
      headTurn: 2,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      gripL: true,
      gripR: true,
      handL: { x: 478, y: 1140 },
      handR: { x: 602, y: 1130 },
    },
  },
  {
    t: 4.1,
    p: {
      lean: -0.1,
      headTilt: -0.08,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      gripL: true,
      gripR: true,
      handL: { x: 472, y: 1088 },
      handR: { x: 608, y: 1080 },
    },
  },
  {
    t: 4.45,
    p: {
      lean: 0.16,
      hipDrop: 10,
      headTilt: 0.06,
      look: 'down',
      mouth: 'grit',
      brow: 'determined',
      gripL: true,
      gripR: true,
      handL: { x: 516, y: 1240 },
      handR: { x: 624, y: 1258 },
    },
  },
  {
    t: 4.65,
    p: {
      lean: 0.26,
      hipDrop: 16,
      look: 'down',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      gripL: false,
      gripR: false,
      handL: { x: 556, y: 1330 },
      handR: { x: 660, y: 1340 },
    },
  },
  {
    t: 5.1,
    p: {
      lean: 0.08,
      hipDrop: 4,
      headTurn: 8,
      look: 'down',
      mouth: 'flat',
      brow: 'sad',
      eye: 'open',
      handL: { x: 500, y: 1190 },
      handR: { x: 600, y: 1180 },
    },
  },
  {
    t: 5.7,
    p: {
      lean: 0.04,
      headTurn: 10,
      look: 'down',
      mouth: 'flat',
      brow: 'sad',
      handL: { x: 490, y: 1180 },
      handR: { x: 590, y: 1170 },
    },
  },
  {
    t: 6.0,
    p: {
      lean: -0.04,
      headTilt: 0.08,
      headTurn: 8,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
    },
  },

  // --- Shot 2: Too Big! (6-12s) ---
  {
    t: 6.15,
    p: {
      lean: -0.18,
      hipDrop: 18,
      headTilt: 0.12,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 410, y: 990 },
      handR: { x: 540, y: 970 },
    },
  },
  {
    t: 6.55,
    p: {
      lean: -0.06,
      hipDrop: 24,
      headTilt: 0.04,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 180, y: 1030 },
      handR: { x: 320, y: 1010 },
    },
  },
  {
    t: 7.3,
    p: {
      lean: -0.12,
      hipDrop: 18,
      headTilt: -0.02,
      look: 'right',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: 190, y: 1060 },
      handR: { x: 330, y: 1040 },
    },
  },
  {
    t: 8.4,
    p: {
      lean: -0.18,
      hipDrop: 14,
      headTilt: 0.04,
      look: 'right',
      mouth: 'flat',
      brow: 'sad',
      eye: 'wide',
      handL: { x: 170, y: 1080 },
      handR: { x: 310, y: 1060 },
    },
  },
  {
    t: 9.6,
    p: {
      lean: -0.1,
      hipDrop: 8,
      headTilt: 0.08,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 180, y: 1030 },
      handR: { x: 320, y: 1010 },
    },
  },
  {
    t: 10.6,
    p: {
      lean: -0.2,
      hipDrop: 16,
      headTilt: 0.02,
      look: 'right',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: 160, y: 1070 },
      handR: { x: 300, y: 1050 },
    },
  },
  { t: 12.0, p: { mouth: 'o', brow: 'sad', eye: 'wide', handL: { x: 165, y: 1080 }, handR: { x: 305, y: 1060 } } },

  // --- Shot 3: The House Disappears (12-18s) ---
  {
    t: 12.4,
    p: {
      lean: -0.1,
      hipDrop: 10,
      headTilt: 0.12,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 160, y: 1030 },
      handR: { x: 300, y: 1010 },
    },
  },
  {
    t: 13.0,
    p: {
      lean: 0.06,
      hipDrop: 4,
      headTilt: 0.18,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 170, y: 1000 },
      handR: { x: 310, y: 990 },
    },
  },
  { t: 13.6, p: { headTilt: 0.2, look: 'up', mouth: 'o', brow: 'raised', eye: 'wide' } },

  // --- Shot 3 interior: grab the sliding pole (16-18s) ---
  {
    t: 16.0,
    p: {
      lean: 0.02,
      headTilt: 0,
      headTurn: 8,
      look: 'right',
      mouth: 'flat',
      brow: 'normal',
      eye: 'open',
      handL: { x: 500, y: 1120 },
      handR: { x: 620, y: 1120 },
    },
  },
  {
    t: 16.35,
    p: {
      lean: 0.08,
      headTurn: 10,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 560, y: 1080 },
      handR: { x: 660, y: 1070 },
    },
  },
  {
    t: 16.7,
    p: {
      lean: 0.16,
      hipDrop: 10,
      headTurn: 8,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 17.2,
    p: {
      lean: 0.3,
      hipDrop: 22,
      headTilt: -0.04,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 17.5,
    p: {
      lean: 0.4,
      hipDrop: 30,
      headTilt: 0.1,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      gripL: false,
      gripR: false,
      handL: { x: 850, y: 980 },
      handR: { x: 930, y: 960 },
    },
  },
  {
    t: 17.9,
    p: {
      lean: 0.1,
      hipDrop: 8,
      headTilt: 0,
      look: 'right',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: 610, y: 1080 },
      handR: { x: 730, y: 1060 },
    },
  },

  // --- Shot 4: Camping Disaster (18-24s) ---
  {
    t: 18.0,
    p: {
      lean: 0,
      hipDrop: 0,
      headTilt: 0.1,
      headTurn: 0,
      look: 'up',
      mouth: 'flat',
      brow: 'normal',
      eye: 'open',
      handL: { x: 310, y: 1120 },
      handR: { x: 450, y: 1120 },
    },
  },
  {
    t: 18.55,
    p: {
      lean: 0.04,
      crouch: 0.22,
      headTilt: 0.14,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 310, y: 1010 },
      handR: { x: 450, y: 1010 },
    },
  },
  {
    t: 19.0,
    p: {
      lean: 0.02,
      crouch: 0.34,
      hipDrop: 10,
      headTilt: 0.16,
      look: 'up',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      handL: { x: 320, y: 830 },
      handR: { x: 440, y: 830 },
    },
  },
  {
    t: 19.55,
    p: {
      lean: 0,
      crouch: 0.4,
      hipDrop: 12,
      headTilt: 0.18,
      look: 'up',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      handL: { x: 342, y: 772 },
      handR: { x: 418, y: 772 },
    },
  },
  {
    t: 19.95,
    p: {
      lean: -0.18,
      crouch: 0.18,
      hipDrop: 10,
      headTilt: 0.08,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 340, y: 800 },
      handR: { x: 420, y: 800 },
    },
  },
  {
    t: 20.2,
    p: {
      lean: -0.32,
      crouch: 0,
      hipDrop: 20,
      headTilt: -0.18,
      headTurn: -4,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 260, y: 940 },
      handR: { x: 400, y: 920 },
    },
  },
  {
    t: 20.55,
    p: {
      lean: -0.12,
      hipDrop: 10,
      headTilt: 0.12,
      headTurn: 0,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 700, y: 1140 },
      handR: { x: 840, y: 1120 },
      sit: 1,
    },
  },
  {
    t: 20.8,
    p: {
      lean: -0.06,
      hipDrop: 4,
      headTilt: -0.1,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 716, y: 1080 },
      handR: { x: 856, y: 1060 },
      sit: 1,
    },
  },
  {
    t: 21.15,
    p: {
      lean: -0.08,
      hipDrop: 8,
      headTilt: 0.12,
      look: 'front',
      mouth: 'flat',
      brow: 'sad',
      eye: 'shut',
      handL: { x: 704, y: 1180 },
      handR: { x: 844, y: 1160 },
      sit: 1,
    },
  },
  {
    t: 22.1,
    p: {
      lean: -0.06,
      hipDrop: 8,
      headTilt: -0.12,
      look: 'front',
      mouth: 'flat',
      brow: 'sad',
      eye: 'shut',
      handL: { x: 712, y: 1180 },
      handR: { x: 852, y: 1160 },
      sit: 1,
    },
  },
  {
    t: 23.0,
    p: {
      lean: -0.04,
      hipDrop: 8,
      headTilt: 0.1,
      look: 'front',
      mouth: 'flat',
      brow: 'sad',
      eye: 'squint',
      handL: { x: 720, y: 1170 },
      handR: { x: 860, y: 1150 },
      sit: 1,
    },
  },
  { t: 24.0, p: { mouth: 'flat', brow: 'sad', eye: 'squint', sit: 1 } },

  // --- Shot 5: The Worst Camping Trip (24-30s) ---
  {
    t: 24.2,
    p: {
      lean: -0.02,
      hipDrop: 6,
      headTilt: 0.04,
      look: 'front',
      mouth: 'flat',
      brow: 'normal',
      eye: 'open',
      handL: { x: 700, y: 1140 },
      handR: { x: 820, y: 1140 },
      sit: 0.55,
    },
  },
  {
    t: 24.55,
    p: {
      lean: 0,
      hipDrop: 0,
      headTilt: 0.02,
      headTurn: 8,
      look: 'left',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 510, y: 1120 },
      handR: { x: 620, y: 1120 },
      sit: 0,
    },
  },
  {
    t: 24.95,
    p: {
      lean: 0,
      headTilt: 0.08,
      headTurn: 8,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 490, y: 1100 },
      handR: { x: 600, y: 1100 },
    },
  },
  {
    t: 25.25,
    p: {
      lean: 0.04,
      crouch: 0.5,
      hipDrop: 8,
      headTilt: 0.12,
      look: 'up',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      handL: { x: 486, y: 920 },
      handR: { x: 598, y: 920 },
    },
  },
  {
    t: 25.55,
    p: {
      lean: 0,
      crouch: 0.08,
      hipDrop: 0,
      headTilt: 0.1,
      look: 'up',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      gripL: true,
      gripR: true,
      handL: { x: 506, y: 782 },
      handR: { x: 574, y: 782 },
    },
  },
  {
    t: 25.9,
    p: {
      lean: 0,
      crouch: 0,
      headTilt: 0.08,
      look: 'up',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      gripL: true,
      gripR: true,
      handL: { x: 506, y: 788 },
      handR: { x: 574, y: 788 },
    },
  },
  {
    t: 26.1,
    p: {
      lean: -0.06,
      headTilt: 0.06,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      gripL: true,
      gripR: true,
      handL: { x: 506, y: 796 },
      handR: { x: 574, y: 796 },
    },
  },
  {
    t: 26.45,
    p: {
      lean: 0,
      hipDrop: 12,
      headTilt: 0.12,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      gripL: false,
      gripR: false,
      handL: { x: 470, y: 930 },
      handR: { x: 610, y: 930 },
    },
  },
  {
    t: 26.75,
    p: {
      lean: 0.08,
      crouch: 0.4,
      hipDrop: 16,
      headTilt: 0.08,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: 470, y: 1030 },
      handR: { x: 610, y: 1030 },
    },
  },
  {
    t: 27.05,
    p: {
      lean: 0,
      crouch: 0.08,
      hipDrop: 0,
      headTilt: 0,
      headTurn: 0,
      look: 'front',
      mouth: 'flat',
      brow: 'normal',
      eye: 'open',
      handL: { x: 490, y: 1130 },
      handR: { x: 590, y: 1130 },
    },
  },
  {
    t: 27.5,
    p: {
      lean: -0.06,
      headTilt: -0.06,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      fistL: true,
      fistR: true,
      handL: { x: 478, y: 1178 },
      handR: { x: 602, y: 1178 },
    },
  },
  {
    t: 28.05,
    p: {
      lean: -0.04,
      headTilt: -0.04,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      fistL: true,
      fistR: true,
      handL: { x: 480, y: 1178 },
      handR: { x: 600, y: 1178 },
    },
  },
  {
    t: 28.3,
    p: {
      lean: 0,
      headTilt: 0.12,
      headDrop: 12,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      beanieOn: false,
      fistL: false,
      fistR: false,
      handL: { x: 450, y: 1080 },
      handR: { x: 630, y: 1080 },
    },
  },
  {
    t: 28.6,
    p: {
      lean: 0,
      headTilt: 0,
      headDrop: 0,
      look: 'front',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      beanieOn: false,
      handL: { x: 482, y: 1180 },
      handR: { x: 598, y: 1180 },
    },
  },
  {
    t: 29.2,
    p: {
      headTilt: 0.02,
      look: 'front',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      beanieOn: false,
      handL: { x: 488, y: 1180 },
      handR: { x: 592, y: 1180 },
    },
  },
  {
    t: 30.0,
    p: {
      headTilt: 0.03,
      look: 'front',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      beanieOn: false,
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
  { text: 'JUST A TINY TENT\u2026', from: 0.15, to: 4.5 },
  { text: 'WAIT\u2026 THAT\'S NOT NORMAL!', from: 6.12, to: 11.84 },
  { text: 'IT ATE THE WHOLE HOUSE!', from: 12.12, to: 17.84 },
  { text: 'WELCOME TO MY NEW HOUSE?!', from: 18.12, to: 23.84 },
  { text: 'NEVER GO CAMPING AGAIN!', from: 24.12, to: 29.78 },
];

// --- tent growth ---------------------------------------------------------
interface TentKey {
  t: number;
  cx: number;
  baseY: number;
  w: number;
  h: number;
}

const TENT_KEYS: TentKey[] = [
  { t: 0.0, cx: 620, baseY: FLOOR_Y, w: 0, h: 0 },
  { t: 5.99, cx: 620, baseY: FLOOR_Y, w: 0, h: 0 },
  { t: 6.0, cx: 620, baseY: FLOOR_Y, w: 58, h: 52 },
  { t: 6.18, cx: 620, baseY: FLOOR_Y, w: 158, h: 152 },
  { t: 6.6, cx: 620, baseY: FLOOR_Y, w: 212, h: 238 },
  { t: 7.4, cx: 620, baseY: FLOOR_Y, w: 248, h: 316 },
  { t: 8.4, cx: 605, baseY: FLOOR_Y, w: 258, h: 398 },
  { t: 9.6, cx: 570, baseY: FLOOR_Y, w: 300, h: 560 },
  { t: 12.0, cx: 580, baseY: FLOOR_Y, w: 360, h: 680 },
  { t: 12.7, cx: 570, baseY: FLOOR_Y, w: 500, h: 900 },
  { t: 13.4, cx: 555, baseY: FLOOR_Y, w: 660, h: 1100 },
  { t: 14.2, cx: 545, baseY: FLOOR_Y, w: 900, h: 1300 },
  { t: 15.0, cx: 540, baseY: FLOOR_Y, w: 992, h: 1462 },
  { t: 15.9, cx: 540, baseY: FLOOR_Y, w: 992, h: 1462 },
];

// --- camera --------------------------------------------------------------
interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 540, y: 1080, zoom: 1.25 },
  { t: 0.9, x: 540, y: 1090, zoom: 1.3 },
  { t: 1.7, x: 520, y: 1130, zoom: 1.38 },
  { t: 2.6, x: 530, y: 1120, zoom: 1.42 },
  { t: 3.6, x: 530, y: 1100, zoom: 1.42 },
  { t: 4.6, x: 570, y: 1160, zoom: 1.5 },
  { t: 5.4, x: 620, y: 1320, zoom: 1.85 },
  { t: 5.95, x: 620, y: 1410, zoom: 2.3 },
  { t: 6.1, x: 620, y: 1230, zoom: 1.5 },
  { t: 6.6, x: 600, y: 1120, zoom: 1.25 },
  { t: 7.4, x: 560, y: 1100, zoom: 1.2 },
  { t: 9.2, x: 560, y: 1080, zoom: 1.18 },
  { t: 11.4, x: 540, y: 1060, zoom: 1.18 },
  { t: 12.0, x: 540, y: 1060, zoom: 1.15 },
  { t: 12.8, x: 540, y: 1030, zoom: 1.05 },
  { t: 13.4, x: 540, y: 1000, zoom: 1.05 },
  { t: 13.7, x: 540, y: 900, zoom: 0.94 },
  { t: 14.4, x: 540, y: 880, zoom: 0.82 },
  { t: 15.0, x: 540, y: 880, zoom: 0.8 },
  { t: 15.8, x: 540, y: 880, zoom: 0.8 },
  { t: 15.9, x: 540, y: 1000, zoom: 1.2 },
  { t: 16.6, x: 580, y: 1010, zoom: 1.16 },
  { t: 17.4, x: 680, y: 1030, zoom: 1.1 },
  { t: 18.0, x: 480, y: 1080, zoom: 1.05 },
  { t: 18.8, x: 460, y: 1080, zoom: 1.05 },
  { t: 19.6, x: 440, y: 1000, zoom: 1.14 },
  { t: 20.2, x: 560, y: 1010, zoom: 1.1 },
  { t: 20.7, x: 760, y: 1080, zoom: 1.16 },
  { t: 21.4, x: 780, y: 1120, zoom: 1.2 },
  { t: 23.6, x: 780, y: 1120, zoom: 1.16 },
  { t: 24.1, x: 760, y: 1120, zoom: 1.18 },
  { t: 24.8, x: 540, y: 1100, zoom: 1.14 },
  { t: 25.4, x: 480, y: 1030, zoom: 1.24 },
  { t: 26.0, x: 480, y: 1030, zoom: 1.24 },
  { t: 26.6, x: 520, y: 1080, zoom: 1.12 },
  { t: 27.4, x: 540, y: 1080, zoom: 1.14 },
  { t: 28.3, x: 540, y: 1050, zoom: 1.32 },
  { t: 29.2, x: 540, y: 990, zoom: 1.9 },
  { t: 30.0, x: 540, y: 980, zoom: 2.15 },
];

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

export class PopUpTentRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    void config;
    const t = clamp(time, 0, 30);

    ctx.save();

    // Interior shots fill the frame with the living-room wall and floor; only
    // the scene-3 exterior beat pulls back far enough to reveal the house.
    const exterior = t >= 13.6 && t < 15.9;
    if (exterior) {
      this.drawSky(ctx, t);
      this.applyCamera(ctx, t);
      this.drawLawn(ctx);
      this.drawHouse(ctx, t);
    } else {
      this.applyCamera(ctx, t);
      this.drawInteriorBackdrop(ctx, t);
      this.drawRoomDecor(ctx);
      this.drawFurniture(ctx, t);
    }

    if (t < 15.9) {
      if (t >= 6.0) this.drawTentObject(ctx, t);
      if (t < 12.75) this.drawCharacter(ctx, t);
      // Held in front of him, so it is drawn after the body.
      if (t < 6.08) this.drawPackage(ctx, t);
    } else if (t < 27.0) {
      const collapse = smooth(inv(26.05, 26.95, t));
      if (collapse < 0.995) {
        ctx.save();
        ctx.translate(540, 600);
        ctx.scale(1 - 0.92 * collapse, 1 - 0.965 * collapse);
        ctx.translate(-540, -600);
        ctx.globalAlpha = 1 - 0.3 * collapse;
        this.drawTentInterior(ctx, t);
        if (t >= 17.95) this.drawSleepingBag(ctx, t);
        if (t < 18.0) this.drawGrabPole(ctx, t);
        ctx.restore();
      }
      this.drawCharacter(ctx, t);
      // The release button sits on the pole in front of his mitten hands while
      // he presses it, so the click stays readable.
      if (t > 25.2 && t < 26.1) this.drawReleaseButton(ctx, t);
      this.drawDizzyStars(ctx, t);
    } else {
      this.drawCharacter(ctx, t);
      this.drawPackage(ctx, t);
      this.drawFlyingBeanie(ctx, t);
    }

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
  private tentState(t: number) {
    const keys = TENT_KEYS;
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
    return {
      cx: lerp(a.cx, b.cx, u),
      baseY: lerp(a.baseY, b.baseY, u),
      w: lerp(a.w, b.w, u),
      h: lerp(a.h, b.h, u),
    };
  }

  private charAt(t: number) {
    let x = 420;
    let ground = FLOOR_Y;
    let lift = 0;

    if (t < 0.9) {
      x = 420;
    } else if (t < 1.7) {
      x = lerp(420, 520, smooth(inv(0.9, 1.7, t)));
    } else if (t < 6.05) {
      x = 520;
    } else if (t < 6.55) {
      const u = inv(6.05, 6.55, t);
      x = lerp(520, 300, smooth(u));
      lift = Math.sin(u * Math.PI) * 92;
    } else if (t < 12.0) {
      x = 300;
    } else if (t < 12.7) {
      x = lerp(300, 220, smooth(inv(12.0, 12.7, t)));
    } else if (t < 15.9) {
      x = 220;
    } else if (t < 17.5) {
      x = 520 + 300 * smooth(inv(16.1, 17.5, t));
    } else if (t < 18.0) {
      x = 820;
    } else if (t < 20.0) {
      x = 380;
    } else if (t < 20.55) {
      const u = inv(20.0, 20.55, t);
      x = lerp(380, 780, smooth(u));
      lift = Math.sin(u * Math.PI) * 180;
    } else if (t < 20.75) {
      x = 780;
      ground = 1490;
    } else if (t < 21.05) {
      x = 780;
      ground = 1490;
      lift = Math.sin(inv(20.75, 21.05, t) * Math.PI) * 95;
    } else if (t < 24.3) {
      x = 780;
      ground = 1490;
    } else if (t < 24.9) {
      x = lerp(780, 450, smooth(inv(24.3, 24.9, t)));
      ground = lerp(1490, FLOOR_Y, smooth(inv(24.3, 24.7, t)));
    } else if (t < 25.25) {
      x = 450;
    } else if (t < 25.65) {
      x = 450;
      lift = Math.sin(inv(25.25, 25.65, t) * Math.PI) * 95;
    } else if (t < 26.05) {
      x = 450;
      lift = 95;
    } else if (t < 26.6) {
      x = 450;
      lift = lerp(95, 0, smooth(inv(26.05, 26.6, t)));
    } else if (t < 27.0) {
      x = lerp(450, 540, smooth(inv(26.6, 27.0, t)));
    } else {
      x = 540;
    }

    return { x, ground, lift };
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
      crouch: lerp(pa.crouch, pb.crouch, u),
      sit: lerp(pa.sit, pb.sit, u),
    };
  }

  // ------------------------------------------------------------------
  // Sky and lawn
  // ------------------------------------------------------------------
  private drawSky(ctx: CanvasRenderingContext2D, t: number) {
    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = SKY_DEEP;
    ctx.fillRect(0, 0, WIDTH, 240);

    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.arc(150, 180, 74, 0, TAU);
    ctx.fill();

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
    ctx.fillRect(-1200, FLOOR_Y, WIDTH + 2400, 1600);
    ctx.fillStyle = LAWN_LIGHT;
    ctx.fillRect(-1200, FLOOR_Y, WIDTH + 2400, 26);
    ctx.fillStyle = LAWN_DARK;
    for (let i = 0; i < 30; i++) {
      const x = -200 + i * 58;
      const y = FLOOR_Y + 54 + (i % 3) * 26;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10, y - 22);
      ctx.lineTo(x + 20, y);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ------------------------------------------------------------------
  // House and room
  // ------------------------------------------------------------------
  private deformAt(t: number) {
    return smooth(inv(12.2, 13.6, t)) * (1 - smooth(inv(26.0, 26.8, t)));
  }

  private drawHouse(ctx: CanvasRenderingContext2D, t: number) {
    const deform = this.deformAt(t);
    const wallPush = 30 * deform;
    const roofLift = 100 * deform;
    const roomTop = ROOM_TOP - 32 * deform;

    // Chimney behind the roof.
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
    ctx.moveTo(HOUSE_LEFT - 46 - wallPush, HOUSE_WALL_TOP);
    ctx.lineTo(540, HOUSE_APEX_Y - roofLift);
    ctx.lineTo(HOUSE_RIGHT + 46 + wallPush, HOUSE_WALL_TOP);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = ROOF_DARK;
    ctx.lineWidth = 5;
    for (let i = 1; i <= 3; i++) {
      const u = i / 4;
      ctx.beginPath();
      ctx.moveTo(lerp(HOUSE_LEFT - 46 - wallPush, 540, u), lerp(HOUSE_WALL_TOP, HOUSE_APEX_Y - roofLift, u));
      ctx.lineTo(lerp(HOUSE_RIGHT + 46 + wallPush, 540, u), lerp(HOUSE_WALL_TOP, HOUSE_APEX_Y - roofLift, u));
      ctx.stroke();
    }

    // Exterior walls.
    ctx.fillStyle = WALL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.rect(HOUSE_LEFT - wallPush, HOUSE_WALL_TOP, HOUSE_RIGHT - HOUSE_LEFT + wallPush * 2, FLOOR_Y - HOUSE_WALL_TOP);
    ctx.fill();
    ctx.stroke();

    // Cutaway room interior.
    ctx.fillStyle = WALL;
    ctx.beginPath();
    ctx.rect(ROOM_LEFT - wallPush, roomTop, ROOM_RIGHT - ROOM_LEFT + wallPush * 2, FLOOR_Y - roomTop);
    ctx.fill();
    ctx.fillStyle = WALL_LINE;
    for (let x = ROOM_LEFT - wallPush + 30; x < ROOM_RIGHT + wallPush; x += 116) {
      ctx.fillRect(x, roomTop, 34, FLOOR_Y - roomTop);
    }
    ctx.fillStyle = WALL_SHADE;
    ctx.fillRect(ROOM_LEFT - wallPush, roomTop, ROOM_RIGHT - ROOM_LEFT + wallPush * 2, 18);

    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.rect(ROOM_LEFT - wallPush, roomTop, ROOM_RIGHT - ROOM_LEFT + wallPush * 2, FLOOR_Y - roomTop);
    ctx.stroke();

    // Interior floor.
    ctx.fillStyle = FLOOR;
    ctx.fillRect(ROOM_LEFT - wallPush, 1420, ROOM_RIGHT - ROOM_LEFT + wallPush * 2, FLOOR_Y - 1420);
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 4;
    for (let x = ROOM_LEFT - wallPush + 40; x < ROOM_RIGHT + wallPush; x += 92) {
      ctx.beginPath();
      ctx.moveTo(x, 1420);
      ctx.lineTo(x - 24, FLOOR_Y);
      ctx.stroke();
    }
    ctx.fillStyle = BASEBOARD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(ROOM_LEFT - wallPush, 1470, ROOM_RIGHT - ROOM_LEFT + wallPush * 2, 30);
    ctx.fill();
    ctx.stroke();

    this.drawRoomDecor(ctx);

    if (deform > 0.02) {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.globalAlpha = clamp(deform * 1.2, 0, 0.9);
      for (const cx of [300, 540, 780]) {
        ctx.beginPath();
        ctx.moveTo(cx - 28, roomTop + 6);
        ctx.lineTo(cx - 10, roomTop + 32);
        ctx.lineTo(cx + 8, roomTop + 12);
        ctx.lineTo(cx + 26, roomTop + 38);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // The living room fills the whole frame while the camera is inside: wall
  // above the baseboard, wooden floor below it, both bleeding past the crop.
  private drawInteriorBackdrop(ctx: CanvasRenderingContext2D, t: number) {
    const deform = this.deformAt(t);

    ctx.fillStyle = WALL;
    ctx.fillRect(-900, -900, 2880, 2400);

    ctx.fillStyle = WALL_LINE;
    for (let x = -900; x < 1980; x += 116) {
      const bow = 16 * deform * Math.sin((x - 540) / 190);
      ctx.beginPath();
      ctx.moveTo(x, -900);
      ctx.lineTo(x + 34, -900);
      ctx.lineTo(x + 34 + bow, FLOOR_Y);
      ctx.lineTo(x + bow, FLOOR_Y);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = WALL_SHADE;
    ctx.fillRect(-900, ROOM_TOP - 6, 2880, 18);

    // Floor plane running toward the viewer.
    ctx.fillStyle = FLOOR;
    ctx.fillRect(-900, FLOOR_Y, 2880, 1400);
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 4;
    for (let x = -900; x < 1980; x += 92) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR_Y);
      ctx.lineTo(x + (x - 540) * 0.55, 2500);
      ctx.stroke();
    }

    // Baseboard between wall and floor.
    ctx.fillStyle = BASEBOARD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(-900, 1470, 2880, 30);
    ctx.fill();
    ctx.stroke();

    if (deform > 0.02) {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.globalAlpha = clamp(deform * 1.2, 0, 0.9);
      for (const cx of [260, 540, 820]) {
        ctx.beginPath();
        ctx.moveTo(cx - 28, 720);
        ctx.lineTo(cx - 10, 748);
        ctx.lineTo(cx + 8, 726);
        ctx.lineTo(cx + 26, 754);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawRoomDecor(ctx: CanvasRenderingContext2D) {
    this.drawDoor(ctx);
    this.drawWindow(ctx);
    this.drawPicture(ctx);
    this.drawPlant(ctx);
  }

  private drawDoor(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = DOOR_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(DOOR_X - 12, DOOR_TOP - 14, DOOR_W + 24, FLOOR_Y - DOOR_TOP + 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3b2416';
    ctx.beginPath();
    ctx.rect(DOOR_X, DOOR_TOP, DOOR_W, FLOOR_Y - DOOR_TOP);
    ctx.fill();
    ctx.fillStyle = DOOR;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(DOOR_X, DOOR_TOP, DOOR_W, FLOOR_Y - DOOR_TOP);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = DOOR_DARK;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.rect(DOOR_X + 14, DOOR_TOP + 30 + i * 185, DOOR_W - 28, 170);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = DOOR_KNOB;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(DOOR_X + DOOR_W - 24, DOOR_TOP + 330, 11, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawWindow(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = WINDOW_FRAME;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.rect(WINDOW_X - 16, WINDOW_Y - 16, WINDOW_W + 32, WINDOW_H + 32);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = WINDOW_GLASS;
    ctx.beginPath();
    ctx.rect(WINDOW_X, WINDOW_Y, WINDOW_W, WINDOW_H);
    ctx.fill();
    ctx.fillStyle = CLOUD;
    ctx.beginPath();
    ctx.ellipse(WINDOW_X + 62, WINDOW_Y + 76, 42, 22, 0, 0, TAU);
    ctx.ellipse(WINDOW_X + 116, WINDOW_Y + 62, 32, 18, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = LAWN;
    ctx.beginPath();
    ctx.rect(WINDOW_X, WINDOW_Y + WINDOW_H - 62, WINDOW_W, 62);
    ctx.fill();
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
    ctx.fillStyle = WINDOW_FRAME;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(WINDOW_X - 26, WINDOW_Y + WINDOW_H + 12, WINDOW_W + 52, 26);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawPicture(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.roundRect(258, 790, 158, 116, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#bfe9ff';
    ctx.beginPath();
    ctx.rect(272, 804, 130, 88);
    ctx.fill();
    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.arc(368, 830, 16, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#57c25a';
    ctx.beginPath();
    ctx.moveTo(272, 892);
    ctx.lineTo(320, 842);
    ctx.lineTo(360, 884);
    ctx.lineTo(388, 856);
    ctx.lineTo(402, 892);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawPlant(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(930, 0);
    ctx.strokeStyle = '#2f8a3a';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    for (const [dx, dy] of [
      [-30, 1330],
      [0, 1280],
      [30, 1330],
    ] as const) {
      ctx.beginPath();
      ctx.moveTo(0, 1424);
      ctx.quadraticCurveTo(dx * 0.5, 1380, dx, dy);
      ctx.stroke();
    }
    ctx.fillStyle = '#3da344';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    for (const [dx, dy, rot] of [
      [-34, 1290, -0.5],
      [0, 1240, 0],
      [34, 1290, 0.5],
    ] as const) {
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 66, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#d96b3b';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-46, 1420);
    ctx.lineTo(46, 1420);
    ctx.lineTo(34, 1500);
    ctx.lineTo(-34, 1500);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Furniture
  // ------------------------------------------------------------------
  private furnitureReset(t: number) {
    return 1 - smooth(inv(26.1, 27.0, t));
  }

  private sofaOffset(t: number) {
    // Shoved early and hard so it clears the growing tent and stays visible
    // against the right wall for the rest of the room sequence.
    return 480 * smooth(inv(6.35, 7.5, t)) * this.furnitureReset(t);
  }

  private tableOffset(t: number) {
    return -34 * smooth(inv(8.0, 9.0, t)) * this.furnitureReset(t);
  }

  private lampTilt(t: number) {
    return 0.22 * smooth(inv(8.6, 9.6, t)) * this.furnitureReset(t);
  }

  private drawFurniture(ctx: CanvasRenderingContext2D, t: number) {
    const sofaX = 540 + this.sofaOffset(t);
    const tableDx = this.tableOffset(t);
    const lampTilt = this.lampTilt(t);

    // Rug.
    ctx.fillStyle = TURQUOISE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(300, 1502, 520, 88, 30);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = YELLOW;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(320, 1518, 480, 56, 22);
    ctx.stroke();

    this.drawSofa(ctx, sofaX);
    this.drawTable(ctx, tableDx);
    this.drawLamp(ctx, lampTilt);
  }

  private drawSofa(ctx: CanvasRenderingContext2D, x: number) {
    ctx.save();
    ctx.translate(x, 0);
    ctx.fillStyle = SOFA;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(-SOFA_W / 2, 1248, SOFA_W, 140, 26);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = SOFA_LIGHT;
    ctx.beginPath();
    ctx.roundRect(-SOFA_W / 2 - 16, SOFA_SEAT_Y - 26, SOFA_W + 32, 66, 22);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = SOFA_DARK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 1262);
    ctx.lineTo(0, 1364);
    ctx.stroke();
    ctx.fillStyle = SOFA_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(-SOFA_W / 2 - 10, SOFA_SEAT_Y + 40, SOFA_W + 20, 44, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    for (const lx of [-SOFA_W / 2 + 14, SOFA_W / 2 - 30]) {
      ctx.beginPath();
      ctx.roundRect(lx, SOFA_SEAT_Y + 84, 18, 26, 6);
      ctx.fill();
    }
    ctx.fillStyle = YELLOW;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(SOFA_W / 2 - 86, 1290, 62, 62, 16);
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
  // The pop-up tent
  // ------------------------------------------------------------------
  private tentPath(ctx: CanvasRenderingContext2D, s: { cx: number; baseY: number; w: number; h: number }) {
    const { cx, baseY, w, h } = s;
    ctx.beginPath();
    ctx.moveTo(cx - w, baseY);
    ctx.bezierCurveTo(cx - w * 0.98, baseY - h * 0.48, cx - w * 0.48, baseY - h * 0.94, cx - w * 0.12, baseY - h);
    ctx.quadraticCurveTo(cx, baseY - h * 1.025, cx + w * 0.12, baseY - h);
    ctx.bezierCurveTo(cx + w * 0.48, baseY - h * 0.94, cx + w * 0.98, baseY - h * 0.48, cx + w, baseY);
    ctx.closePath();
  }

  private drawTentObject(ctx: CanvasRenderingContext2D, t: number) {
    const s = this.tentState(t);
    if (s.w < 2) return;
    const { cx, baseY, w, h } = s;

    // The pop itself: a bright starburst and speed lines behind the fabric.
    if (t < 6.5) {
      const u = inv(6.0, 6.5, t);
      const fade = 1 - smooth(u);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(cx, baseY - h * 0.5);
      ctx.fillStyle = YELLOW;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU;
        const r = i % 2 === 0 ? 150 + 70 * u : 70 + 34 * u;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r * 0.75;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU + 0.2;
        const r0 = 90 + 80 * u;
        const r1 = r0 + 70;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0, baseY - 40 + Math.sin(a) * r0 * 0.5);
        ctx.lineTo(cx + Math.cos(a) * r1, baseY - 40 + Math.sin(a) * r1 * 0.5);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Contact shadow.
    ctx.fillStyle = 'rgba(23,18,31,0.16)';
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 8, w * 0.92, clamp(w * 0.06, 6, 26), 0, 0, TAU);
    ctx.fill();

    // Fabric body.
    this.tentPath(ctx, s);
    ctx.fillStyle = ORANGE;
    ctx.fill();

    ctx.save();
    this.tentPath(ctx, s);
    ctx.clip();

    // Turquoise centre panel.
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.24, baseY + 4);
    ctx.quadraticCurveTo(cx - w * 0.26, baseY - h * 0.55, cx - w * 0.15, baseY - h * 0.92);
    ctx.quadraticCurveTo(cx, baseY - h * 1.04, cx + w * 0.15, baseY - h * 0.92);
    ctx.quadraticCurveTo(cx + w * 0.26, baseY - h * 0.55, cx + w * 0.24, baseY + 4);
    ctx.closePath();
    ctx.fillStyle = TURQUOISE;
    ctx.fill();

    // Yellow lower side panels.
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.moveTo(cx - w, baseY + 4);
    ctx.lineTo(cx - w * 0.33, baseY + 4);
    ctx.quadraticCurveTo(cx - w * 0.42, baseY - h * 0.2, cx - w * 0.5, baseY - h * 0.34);
    ctx.quadraticCurveTo(cx - w * 0.8, baseY - h * 0.2, cx - w, baseY - h * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + w, baseY + 4);
    ctx.lineTo(cx + w * 0.33, baseY + 4);
    ctx.quadraticCurveTo(cx + w * 0.42, baseY - h * 0.2, cx + w * 0.5, baseY - h * 0.34);
    ctx.quadraticCurveTo(cx + w * 0.8, baseY - h * 0.2, cx + w, baseY - h * 0.1);
    ctx.closePath();
    ctx.fill();

    // Fabric seams.
    ctx.strokeStyle = INK;
    ctx.lineWidth = clamp(w * 0.009, 3, 7);
    ctx.lineCap = 'round';
    const seam = (x0: number, y0: number, c1x: number, c1y: number, x1: number, y1: number) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(c1x, c1y, x1, y1);
      ctx.stroke();
    };
    seam(cx - w * 0.24, baseY, cx - w * 0.27, baseY - h * 0.6, cx - w * 0.15, baseY - h * 0.93);
    seam(cx + w * 0.24, baseY, cx + w * 0.27, baseY - h * 0.6, cx + w * 0.15, baseY - h * 0.93);
    seam(cx - w * 0.5, baseY - h * 0.34, cx - w * 0.28, baseY - h * 0.42, cx - w * 0.24, baseY - h * 0.6);
    seam(cx + w * 0.5, baseY - h * 0.34, cx + w * 0.28, baseY - h * 0.42, cx + w * 0.24, baseY - h * 0.6);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.92, baseY - h * 0.2);
    ctx.quadraticCurveTo(cx, baseY - h * 0.32, cx + w * 0.92, baseY - h * 0.2);
    ctx.stroke();

    // A few fabric folds.
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = clamp(w * 0.006, 2, 5);
    for (let i = -2; i <= 2; i++) {
      const x = cx + i * w * 0.13;
      ctx.beginPath();
      ctx.moveTo(x, baseY - 6);
      ctx.quadraticCurveTo(x + i * 8, baseY - h * 0.12, x + i * 14, baseY - h * 0.2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Outline.
    this.tentPath(ctx, s);
    ctx.strokeStyle = INK;
    ctx.lineWidth = clamp(w * 0.014, 5, 11);
    ctx.stroke();

    // Flexible support poles.
    const poleW = clamp(w * 0.03, 7, 18);
    ctx.save();
    ctx.lineCap = 'round';
    // Rear arch.
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = POLE;
    ctx.lineWidth = poleW * 0.75;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.52, baseY);
    ctx.bezierCurveTo(cx - w * 0.18, baseY - h * 0.9, cx + w * 0.4, baseY - h * 0.9, cx + w * 0.9, baseY - h * 0.06);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Main arch.
    ctx.strokeStyle = INK;
    ctx.lineWidth = poleW * 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.94, baseY);
    ctx.bezierCurveTo(cx - w * 0.7, baseY - h * 1.13, cx + w * 0.7, baseY - h * 1.13, cx + w * 0.94, baseY);
    ctx.stroke();
    ctx.strokeStyle = POLE;
    ctx.lineWidth = poleW;
    ctx.stroke();
    ctx.strokeStyle = POLE_LIGHT;
    ctx.lineWidth = Math.max(2, poleW * 0.22);
    ctx.stroke();
    // Centre pole, stopping at the entrance.
    const doorW = w * 0.17;
    const doorH = h * 0.46;
    ctx.strokeStyle = INK;
    ctx.lineWidth = poleW * 0.9;
    ctx.beginPath();
    ctx.moveTo(cx, baseY - doorH);
    ctx.quadraticCurveTo(cx - w * 0.02, baseY - h * 0.7, cx, baseY - h * 0.99);
    ctx.stroke();
    ctx.strokeStyle = POLE;
    ctx.lineWidth = poleW * 0.55;
    ctx.stroke();
    // Base joints.
    ctx.fillStyle = INK;
    for (const px of [cx - w * 0.94, cx + w * 0.94]) {
      ctx.beginPath();
      ctx.arc(px, baseY, Math.max(5, poleW * 0.5), 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // Triangular entrance, with open fabric flaps.
    ctx.save();
    // Left flap folded out to the left.
    ctx.fillStyle = ORANGE_LIGHT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = clamp(w * 0.012, 4, 9);
    ctx.beginPath();
    ctx.moveTo(cx - doorW, baseY);
    ctx.lineTo(cx, baseY - doorH);
    ctx.lineTo(cx - doorW * 1.85, baseY - doorH * 0.32);
    ctx.lineTo(cx - doorW * 1.65, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right flap folded out to the right.
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.moveTo(cx + doorW, baseY);
    ctx.lineTo(cx, baseY - doorH);
    ctx.lineTo(cx + doorW * 1.85, baseY - doorH * 0.32);
    ctx.lineTo(cx + doorW * 1.65, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // The opening itself.
    ctx.beginPath();
    ctx.moveTo(cx - doorW, baseY);
    ctx.lineTo(cx, baseY - doorH);
    ctx.lineTo(cx + doorW, baseY);
    ctx.closePath();
    ctx.fillStyle = '#5a3426';
    ctx.fill();

    // Once the tent is giant, the house facade shows through the entrance.
    const houseAlpha = smooth(inv(14.4, 15.2, t));
    if (houseAlpha > 0.001) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - doorW, baseY);
      ctx.lineTo(cx, baseY - doorH);
      ctx.lineTo(cx + doorW, baseY);
      ctx.closePath();
      ctx.clip();
      ctx.globalAlpha = houseAlpha;
      ctx.fillStyle = WALL;
      ctx.fillRect(cx - doorW, baseY - doorH, doorW * 2, doorH);
      ctx.fillStyle = WALL_LINE;
      for (let x = cx - doorW + 22; x < cx + doorW; x += 46) {
        ctx.fillRect(x, baseY - doorH, 14, doorH);
      }
      // Door.
      ctx.fillStyle = DOOR;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      const fh = doorH * 0.5;
      const dw = fh * 0.3;
      const dh = fh * 0.62;
      ctx.beginPath();
      ctx.rect(cx - dw * 0.75, baseY - dh, dw, dh);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = DOOR_KNOB;
      ctx.beginPath();
      ctx.arc(cx + dw * 0.1, baseY - dh * 0.55, 8, 0, TAU);
      ctx.fill();
      // Window.
      const wx = cx + dw * 0.55;
      const wy = baseY - dh * 0.92;
      const ww = dw * 0.85;
      const wh = dh * 0.42;
      ctx.fillStyle = WINDOW_GLASS;
      ctx.strokeStyle = INK;
      ctx.beginPath();
      ctx.rect(wx, wy, ww, wh);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = WINDOW_FRAME;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(wx + ww * 0.5, wy);
      ctx.lineTo(wx + ww * 0.5, wy + wh);
      ctx.moveTo(wx, wy + wh * 0.5);
      ctx.lineTo(wx + ww, wy + wh * 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Opening outline.
    ctx.beginPath();
    ctx.moveTo(cx - doorW, baseY);
    ctx.lineTo(cx, baseY - doorH);
    ctx.lineTo(cx + doorW, baseY);
    ctx.strokeStyle = INK;
    ctx.lineWidth = clamp(w * 0.012, 4, 9);
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // The tiny folded package
  // ------------------------------------------------------------------
  private packagePose(t: number) {
    let x = 620;
    let y = 1470;
    let rot = 0;
    let scale = 1;
    let alpha = 1;

    if (t < 2.6) {
      x = 640;
      y = 1470;
      rot = 0;
    } else if (t < 3.2) {
      const u = smooth(inv(2.6, 3.2, t));
      x = lerp(640, 540, u);
      y = lerp(1470, 1150, u);
      rot = lerp(0.14, -0.1, u);
    } else if (t < 4.1) {
      x = 540;
      y = 1150;
      rot = -0.1;
    } else if (t < 4.55) {
      const u = smooth(inv(4.1, 4.55, t));
      x = 540;
      y = lerp(1150, 1250, u);
      rot = lerp(-0.1, 0.18, u);
    } else if (t < 5.0) {
      const u = inv(4.55, 5.0, t);
      x = lerp(540, 620, u);
      y = lerp(1240, 1470, u) - 80 * Math.sin(u * Math.PI);
      rot = 0.18 + u * 0.9;
    } else if (t < 5.4) {
      const u = inv(5.0, 5.4, t);
      x = 620;
      y = 1470 - 34 * Math.sin(u * Math.PI) * (1 - u);
      rot = 1.08 - u * 0.9;
    } else if (t < 6.08) {
      const u = inv(5.4, 6.08, t);
      x = 620;
      y = 1470;
      rot = Math.sin(u * 34) * 0.06;
      scale = 1 + Math.sin(u * 22) * 0.05;
    } else if (t < 27.0) {
      alpha = 0;
    } else if (t < 28.25) {
      const u = inv(27.0, 28.25, t);
      x = 540;
      y = 200 + 630 * u * u;
      rot = 0.1 + u * 1.7;
      scale = 1;
    } else {
      const u = inv(28.25, 28.5, t);
      x = 540;
      y = lerp(830, 842, smooth(u));
      rot = 1.8 + u * 0.1;
      scale = 1;
    }

    return { x, y, rot, scale, alpha };
  }

  private drawPackage(ctx: CanvasRenderingContext2D, t: number) {
    const p = this.packagePose(t);
    if (p.alpha <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(p.scale, p.scale);

    // Rolled bundle.
    ctx.fillStyle = ORANGE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(-62, -36, 124, 72, 18);
    ctx.fill();
    ctx.stroke();

    // Turquoise strap.
    ctx.fillStyle = TURQUOISE;
    ctx.beginPath();
    ctx.roundRect(-22, -37, 34, 74, 9);
    ctx.fill();
    ctx.stroke();

    // Yellow patch.
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.moveTo(26, -28);
    ctx.lineTo(54, 0);
    ctx.lineTo(26, 28);
    ctx.lineTo(40, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Black straps.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-46, -35);
    ctx.lineTo(-46, 35);
    ctx.moveTo(46, -35);
    ctx.lineTo(46, 35);
    ctx.stroke();

    // A pole end poking out.
    ctx.fillStyle = POLE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(64, 0, 12, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Fabric highlight.
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-54, -21);
    ctx.lineTo(-30, -21);
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Giant tent interior
  // ------------------------------------------------------------------
  private fabricPush(t: number) {
    if (t < 18.85) return 0;
    if (t < 19.55) return smooth(inv(18.85, 19.55, t));
    if (t < 19.95) return 1;
    if (t < 20.25) return 1 - smooth(inv(19.95, 20.25, t));
    return 0;
  }

  private drawTentInterior(ctx: CanvasRenderingContext2D, t: number) {
    // Background fabric wedges.
    ctx.fillStyle = ORANGE;
    ctx.fillRect(-300, -300, 1680, 2200);

    ctx.fillStyle = TURQUOISE;
    ctx.beginPath();
    ctx.moveTo(-300, -300);
    ctx.lineTo(420, -300);
    ctx.lineTo(210, 1520);
    ctx.lineTo(-300, 1520);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = ORANGE_LIGHT;
    ctx.beginPath();
    ctx.moveTo(420, -300);
    ctx.lineTo(660, -300);
    ctx.lineTo(810, 1520);
    ctx.lineTo(210, 1520);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.moveTo(660, -300);
    ctx.lineTo(1380, -300);
    ctx.lineTo(1380, 1520);
    ctx.lineTo(810, 1520);
    ctx.closePath();
    ctx.fill();

    // Giant seams.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(420, -300);
    ctx.lineTo(210, 1520);
    ctx.moveTo(660, -300);
    ctx.lineTo(810, 1520);
    ctx.stroke();
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-300, 520);
    ctx.quadraticCurveTo(540, 610, 1380, 520);
    ctx.stroke();

    // Groundsheet.
    ctx.fillStyle = GROUNDSHEET;
    ctx.fillRect(-300, 1480, 1680, 500);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-300, 1480);
    ctx.lineTo(1380, 1480);
    ctx.stroke();
    ctx.strokeStyle = '#d9a63a';
    ctx.lineWidth = 4;
    for (let x = -240; x < 1380; x += 150) {
      ctx.beginPath();
      ctx.moveTo(x, 1480);
      ctx.lineTo(x + 60, 1920);
      ctx.stroke();
    }

    // Elastic canopy that he pushes. It sags low over him so his raised hands
    // actually meet the fabric, then bulges upward when he shoves it.
    const push = this.fabricPush(t);
    const bump = (x: number) => Math.exp(-Math.pow((x - 380) / 230, 2));
    const edge = (x: number) => 660 + 150 * bump(x) - 190 * push * bump(x) + 14 * Math.sin(x * 0.012);
    const canopyPath = () => {
      ctx.beginPath();
      ctx.moveTo(-300, -300);
      ctx.lineTo(1380, -300);
      ctx.lineTo(1380, 620);
      for (let x = 1380; x >= -300; x -= 40) {
        ctx.lineTo(x, edge(x));
      }
      ctx.closePath();
    };
    canopyPath();
    ctx.fillStyle = ORANGE_LIGHT;
    ctx.fill();

    ctx.save();
    canopyPath();
    ctx.clip();
    ctx.fillStyle = TURQUOISE;
    ctx.fillRect(360, -300, 360, 1100);
    ctx.restore();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    canopyPath();
    ctx.stroke();
    ctx.lineWidth = 6;
    for (const x of [360, 720]) {
      ctx.beginPath();
      ctx.moveTo(x, -300);
      ctx.lineTo(x, edge(x));
      ctx.stroke();
    }

    // Tension folds around the pushed bulge.
    if (push > 0.01) {
      ctx.save();
      ctx.globalAlpha = 0.4 * push;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      for (let i = -3; i <= 3; i++) {
        const x = 380 + i * 92;
        ctx.beginPath();
        ctx.moveTo(x, edge(x) - 6);
        ctx.lineTo(x + i * 26, 250);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Huge curved support poles.
    ctx.save();
    ctx.lineCap = 'round';
    // Rear diagonal pole.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 34;
    ctx.beginPath();
    ctx.moveTo(-160, 940);
    ctx.bezierCurveTo(300, -260, 720, -240, 1240, 1140);
    ctx.stroke();
    ctx.strokeStyle = POLE;
    ctx.lineWidth = 20;
    ctx.stroke();
    ctx.strokeStyle = POLE_LIGHT;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Main arch.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 44;
    ctx.beginPath();
    ctx.moveTo(-160, 1760);
    ctx.bezierCurveTo(100, 80, 980, 80, 1240, 1760);
    ctx.stroke();
    ctx.strokeStyle = POLE;
    ctx.lineWidth = 27;
    ctx.stroke();
    ctx.strokeStyle = POLE_LIGHT;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Centre pole.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.moveTo(540, 1520);
    ctx.quadraticCurveTo(524, 900, 540, 270);
    ctx.stroke();
    ctx.strokeStyle = POLE;
    ctx.lineWidth = 17;
    ctx.stroke();
    ctx.strokeStyle = POLE_LIGHT;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Yellow bands on the centre pole.
    ctx.fillStyle = YELLOW;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    for (const y of [1080, 1300]) {
      ctx.beginPath();
      ctx.roundRect(524, y, 32, 20, 6);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    this.drawReleaseButton(ctx, t);
  }

  private drawReleaseButton(ctx: CanvasRenderingContext2D, t: number) {
    const press = smooth(inv(25.85, 25.95, t)) * (1 - smooth(inv(26.05, 26.3, t)));
    const y = 780 + press * 9;
    const r = 24 * (1 - press * 0.12);

    // Mount plate.
    ctx.fillStyle = YELLOW;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(540 - 34, 802, 68, 26, 9);
    ctx.fill();
    ctx.stroke();

    // Red button.
    ctx.fillStyle = press > 0.2 ? BUTTON_DEEP : BUTTON_RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(540, y, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(532, y - 8, 6, 0, TAU);
    ctx.fill();

    // Click ripple.
    if (t > 25.85 && t < 26.3) {
      const u = inv(25.85, 26.3, t);
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = BUTTON_RED;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(540, 780, 30 + 50 * u, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawSleepingBag(ctx: CanvasRenderingContext2D, t: number) {
    const fade = 1 - smooth(inv(25.95, 26.2, t));
    if (fade <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = fade;

    // Shadow.
    ctx.fillStyle = 'rgba(23,18,31,0.18)';
    ctx.beginPath();
    ctx.ellipse(780, 1508, 230, 24, 0, 0, TAU);
    ctx.fill();

    // Puffy bag.
    ctx.fillStyle = BAG;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(570, 1360, 420, 150, 62);
    ctx.fill();
    ctx.stroke();

    // Top roll.
    ctx.fillStyle = BAG_DEEP;
    ctx.beginPath();
    ctx.ellipse(780, 1370, 205, 38, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Yellow lining opening at the left.
    ctx.fillStyle = BAG_LINING;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(622, 1432, 50, 64, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7a4a1e';
    ctx.beginPath();
    ctx.ellipse(618, 1432, 31, 44, 0, 0, TAU);
    ctx.fill();

    // Puffy seams.
    ctx.strokeStyle = BAG_DEEP;
    ctx.lineWidth = 5;
    for (const x of [740, 830, 920]) {
      ctx.beginPath();
      ctx.moveTo(x, 1376);
      ctx.quadraticCurveTo(x - 10, 1435, x, 1500);
      ctx.stroke();
    }

    // Zipper.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(690, 1372);
    ctx.quadraticCurveTo(780, 1390, 960, 1372);
    ctx.stroke();

    // Pillow at the far end, clear of where he sits.
    ctx.fillStyle = YELLOW;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(856, 1338, 130, 58, 24);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawGrabPole(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 16.0 || t > 17.8) return;
    const u = smooth(inv(16.15, 17.55, t));
    const px = 700 + 300 * u;
    const alpha = 1 - smooth(inv(17.5, 17.8, t));

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round';

    // Motion streaks.
    ctx.strokeStyle = 'rgba(23,18,31,0.35)';
    ctx.lineWidth = 6;
    for (let i = 0; i < 3; i++) {
      const y = 1000 + i * 80;
      ctx.beginPath();
      ctx.moveTo(px - 90 - i * 18, y);
      ctx.lineTo(px - 20 - i * 8, y);
      ctx.stroke();
    }

    // Curved flexible pole.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 36;
    ctx.beginPath();
    ctx.moveTo(px + 30, 1660);
    ctx.bezierCurveTo(px - 50, 1100, px - 20, 620, px + 50, 280);
    ctx.stroke();
    ctx.strokeStyle = POLE;
    ctx.lineWidth = 22;
    ctx.stroke();
    ctx.strokeStyle = POLE_LIGHT;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Yellow bands.
    ctx.fillStyle = YELLOW;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    for (const y of [1060, 760]) {
      ctx.beginPath();
      ctx.roundRect(px - 28, y, 44, 20, 6);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Character
  // ------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, t: number) {
    const ch = this.charAt(t);
    const pose = this.poseAt(t);
    const baseY = ch.ground - ch.lift;
    const hipY = baseY - (300 - 150 * pose.crouch - 170 * pose.sit);

    // While the flexible pole drags him sideways, both mitten hands stay on it.
    if (t >= 16.0 && t < 17.55) {
      const u = smooth(inv(16.15, 17.55, t));
      const px = 700 + 300 * u;
      const w = 1 - smooth(inv(17.4, 17.55, t));
      pose.handL = { x: lerp(pose.handL.x, px - 26, w), y: lerp(pose.handL.y, 1010, w) };
      pose.handR = { x: lerp(pose.handR.x, px + 30, w), y: lerp(pose.handR.y, 990, w) };
      if (t > 16.5 && t < 17.45) {
        pose.gripL = true;
        pose.gripR = true;
      }
    }

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

    // Seated: knees splay outward and the feet rest on the floor in front of
    // the sleeping bag, so the pose reads from the front.
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
  // Dizzy stars and the knocked-off beanie
  // ------------------------------------------------------------------
  private drawDizzyStars(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 21.0 || t > 24.05) return;
    const fade = smooth(inv(21.0, 21.35, t)) * (1 - smooth(inv(23.75, 24.05, t)));
    if (fade <= 0.001) return;
    const cx = 780;
    const cy = 1000;
    ctx.save();
    ctx.globalAlpha = fade;
    for (let i = 0; i < 3; i++) {
      const a = t * 2.8 + i * (TAU / 3);
      const x = cx + Math.cos(a) * 108;
      const y = cy + Math.sin(a) * 34;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a * 0.6);
      ctx.fillStyle = YELLOW;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const rr = k % 2 === 0 ? 15 : 6;
        const aa = (k / 10) * TAU - Math.PI / 2;
        const px = Math.cos(aa) * rr;
        const py = Math.sin(aa) * rr;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  private drawFlyingBeanie(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 28.25) return;
    // It flips across the room and snags on the lamp shade, staying in frame
    // for the final annoyed stare.
    const u = clamp((t - 28.25) / 0.95, 0, 1);
    const x = 540 + 230 * u;
    const y = 820 + 260 * u;
    const rot = 2.2 * u;
    const scale = 1 - 0.12 * u;

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



