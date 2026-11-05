import type { StudioConfig } from '../types';
import { drawHand, HandStyle } from './handRenderer';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

// --- palette -------------------------------------------------------------
const INK = '#17121f';
const WHITE = '#ffffff';
const WALL = '#ffe9c7';
const WALL_LINE = '#f5d6a4';
const BASEBOARD = '#c98a4b';
const FLOOR = '#e8a45f';
const FLOOR_LINE = '#cf8a45';
const TABLE_TOP = '#e09a57';
const TABLE_WOOD = '#c97a3f';
const TABLE_DEEP = '#a85f2c';
const TABLE_GRAIN = '#8f4a22';
const CUP_BLUE = '#2f80ed';
const CUP_BLUE_DEEP = '#1a56b8';
const CUP_BLUE_LIGHT = '#8cc4ff';
const YOYO_BLUE = '#2d6cdf';
const YOYO_BLUE_DEEP = '#1a4bc9';
const YOYO_RED = '#e63946';
const YOYO_RED_DEEP = '#b3222e';
const YOYO_WHITE = '#f8f8f8';
const STRING = '#2b2118';
const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const BEANIE_POM = '#ff6b6b';
const SHIRT = '#ffd166';
const SHIRT_DEEP = '#e8b23f';
const TROUSER = '#2f5fa8';
const TROUSER_DEEP = '#22457c';
const SHOE = '#141414';

// --- world ---------------------------------------------------------------
const FLOOR_Y = 1580;
const WALL_END = 1440;
const HIP_Y = 1280;
const HEAD_R = 70;
const CHAR_X = 430;

const TABLE_Y = 1120; // tabletop surface
const TABLE_SLAB = 72;
const TABLE_L = 610;
const TABLE_R = 1000;
const LEG_NEAR_X = 660;
const LEG_FAR_X = 950;
const LEG_W = 46;

const CUP_X = 840;
const CUP_BASE_Y = TABLE_Y;
const CUP_BASE_R = 24;
const CUP_RIM_R = 34;
const CUP_H = 68;
const CUP_MOUTH_RY = 9;
const CUP_RIM_Y = CUP_BASE_Y - CUP_H;
const CUP_REST_Y = 1062;

const YOYO_R = 26;
const BONK_X = 488;
const BONK_Y = 974;

const YOYO_ORBIT_CX = 660;
const YOYO_ORBIT_CY = 1395;
const YOYO_ORBIT_RX = 125;
const YOYO_ORBIT_RY = 118;

const ANKLE_ORBIT_CX = CHAR_X;
const ANKLE_ORBIT_CY = 1502;

type MouthShape =
  | 'flat'
  | 'smile'
  | 'grin'
  | 'o'
  | 'frown'
  | 'grit'
  | 'smirk'
  | 'bigsmile';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'determined' | 'uneven';
type EyeShape = 'open' | 'wide' | 'squint' | 'shut' | 'happy' | 'cross';
type LookDir = 'front' | 'down' | 'up' | 'right' | 'left';

interface Pt {
  x: number;
  y: number;
}

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
  fistL: boolean;
  fistR: boolean;
  pointL: boolean;
  pointR: boolean;
  rotL?: number;
  beanieOn: boolean;
  hideArms: boolean;
}

type PosePatch = Partial<Pose>;

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

interface CaptionLine {
  text: string;
  from: number;
  to: number;
}

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

interface YoYoState {
  x: number;
  y: number;
  spin: number;
  visible: boolean;
  inCup: boolean;
  behindLeg: boolean;
  wrapLeg: boolean;
  slack: boolean;
  fast: boolean;
}

// --- helpers -------------------------------------------------------------
function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function smooth(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}
function bez(a: number, b: number, c: number, u: number) {
  return (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c;
}
function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (c: number) =>
    amount < 0 ? Math.round(c * (1 + amount)) : Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}
const heavy = (size: number) =>
  `900 ${size}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;

function pointAlong(a: Pt, b: Pt, u: number): Pt {
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
}

// --- captions + camera ---------------------------------------------------
const CAPTIONS: CaptionLine[] = [
  { text: 'CAN HE LAND A YO-YO IN THIS TINY CUP?', from: 0.0, to: 5.0 },
  { text: 'TOO HIGH!', from: 5.0, to: 11.0 },
  { text: 'WAIT... TRY AROUND THE TABLE!', from: 11.0, to: 17.0 },
  { text: 'PERFECT SHOT!!!', from: 17.0, to: 24.0 },
  { text: 'THE YO-YO GOT REVENGE! 😂', from: 24.0, to: 30.0 },
];

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 540, y: 1040, zoom: 0.95 },
  { t: 1.2, x: 545, y: 1045, zoom: 0.98 },
  { t: 2.4, x: 650, y: 1060, zoom: 1.28 },
  { t: 4.4, x: 650, y: 1060, zoom: 1.28 },
  { t: 5.0, x: 560, y: 1060, zoom: 1.02 },
  { t: 7.0, x: 560, y: 1060, zoom: 1.04 },
  { t: 7.6, x: 470, y: 1010, zoom: 1.66 },
  { t: 8.4, x: 470, y: 1010, zoom: 1.66 },
  { t: 9.0, x: 545, y: 1060, zoom: 1.04 },
  { t: 11.0, x: 620, y: 1310, zoom: 1.12 },
  { t: 13.4, x: 640, y: 1330, zoom: 1.14 },
  { t: 13.9, x: 450, y: 1290, zoom: 1.2 },
  { t: 16.0, x: 450, y: 1270, zoom: 1.18 },
  { t: 17.0, x: 535, y: 1070, zoom: 1.02 },
  { t: 19.3, x: 560, y: 1080, zoom: 1.06 },
  { t: 19.7, x: 700, y: 1210, zoom: 1.16 },
  { t: 21.3, x: 760, y: 1180, zoom: 1.24 },
  { t: 21.6, x: 840, y: 1075, zoom: 1.5 },
  { t: 22.7, x: 840, y: 1075, zoom: 1.5 },
  { t: 23.3, x: 545, y: 1040, zoom: 1.06 },
  { t: 25.2, x: 545, y: 1020, zoom: 1.08 },
  { t: 25.7, x: 470, y: 1000, zoom: 1.56 },
  { t: 26.7, x: 470, y: 1000, zoom: 1.56 },
  { t: 27.4, x: 485, y: 1100, zoom: 1.12 },
  { t: 30.0, x: 475, y: 1045, zoom: 1.32 },
];

// --- pose keys -----------------------------------------------------------
const BASE_POSE: Pose = {
  lean: 0,
  hipDrop: 0,
  headTilt: 0.03,
  headDrop: 0,
  headTurn: 3,
  look: 'right',
  mouth: 'flat',
  brow: 'normal',
  eye: 'open',
  stance: 0,
  footLift: 0,
  handL: { x: CHAR_X - 90, y: 1185 },
  handR: { x: CHAR_X + 115, y: 1060 },
  bendL: 1,
  bendR: 1,
  gripL: false,
  fistL: false,
  fistR: false,
  pointL: false,
  pointR: false,
  beanieOn: true,
  hideArms: false,
};

// Each key only states what changes. The builder carries every field
// forward, so a pose is always complete; `poseAt` then blends the numeric
// fields and steps the expression at the key.
const POSE_PATCHES: { t: number; p?: PosePatch }[] = [
  // Shot 1 - the challenge
  { t: 0.0 },
  { t: 0.8, p: { lean: 0.04, headTilt: 0.08, headTurn: 8 } },
  {
    t: 1.5,
    p: {
      lean: 0.05,
      headTilt: 0.08,
      headTurn: 8,
      brow: 'cocky',
      eye: 'squint',
      mouth: 'smirk',
      pointL: true,
      handL: { x: 588, y: 1094 },
      handR: { x: 566, y: 1044 },
    },
  },
  {
    t: 2.7,
    p: {
      look: 'front',
      headTurn: 5,
      mouth: 'grin',
      handL: { x: 598, y: 1084 },
      handR: { x: 570, y: 1040 },
    },
  },
  { t: 3.9, p: { handL: { x: 594, y: 1088 }, handR: { x: 567, y: 1042 } } },
  {
    t: 4.5,
    p: {
      lean: -0.03,
      headTilt: 0.02,
      headTurn: 6,
      look: 'right',
      brow: 'determined',
      eye: 'squint',
      mouth: 'grit',
      pointL: false,
      handL: { x: 470, y: 1130 },
      handR: { x: 545, y: 1000 },
    },
  },
  {
    t: 5.0,
    p: {
      lean: 0.08,
      handL: { x: 505, y: 1112 },
      handR: { x: 592, y: 1000 },
    },
  },

  // Shot 2 - first failure
  {
    t: 5.3,
    p: {
      lean: 0.12,
      headTurn: 10,
      brow: 'raised',
      eye: 'wide',
      mouth: 'o',
      gripL: true,
      handL: { x: 622, y: 1128 },
      handR: { x: 620, y: 1010 },
    },
  },
  { t: 6.4, p: { handR: { x: 622, y: 1015 } } },
  {
    t: 7.3,
    p: {
      lean: -0.12,
      hipDrop: 18,
      headTilt: -0.12,
      headDrop: 10,
      headTurn: 4,
      handR: { x: 620, y: 1052 },
    },
  },
  {
    t: 7.7,
    p: {
      brow: 'raised',
      eye: 'wide',
      mouth: 'o',
      lean: -0.16,
      hipDrop: 30,
      headTilt: -0.18,
      headDrop: 12,
      handR: { x: 614, y: 1068 },
    },
  },
  {
    t: 8.2,
    p: {
      lean: -0.04,
      hipDrop: 8,
      headTilt: 0,
      headDrop: 2,
      headTurn: 4,
      brow: 'raised',
      eye: 'wide',
      mouth: 'o',
      gripL: false,
      handL: { x: 540, y: 1120 },
      handR: { x: 574, y: 1072 },
    },
  },
  {
    t: 9.0,
    p: {
      lean: 0.02,
      hipDrop: 0,
      headTurn: 0,
      look: 'front',
      brow: 'angry',
      eye: 'squint',
      mouth: 'grit',
      fistL: true,
      handL: { x: 414, y: 1142 },
      handR: { x: 540, y: 1118 },
    },
  },
  { t: 10.2, p: { handL: { x: 408, y: 1152 }, handR: { x: 545, y: 1128 } } },
  { t: 11.0 },

  // Shot 3 - the impossible route
  {
    t: 11.5,
    p: {
      lean: 0.06,
      hipDrop: 28,
      headTilt: 0.02,
      headTurn: 6,
      look: 'down',
      brow: 'determined',
      eye: 'open',
      mouth: 'flat',
      fistL: false,
      pointL: true,
      handL: { x: 596, y: 1200 },
      handR: { x: 612, y: 1228 },
    },
  },
  {
    t: 12.2,
    p: { hipDrop: 34, handL: { x: 600, y: 1206 }, handR: { x: 616, y: 1242 } },
  },
  {
    t: 13.4,
    p: { look: 'down', headTurn: 8, brow: 'determined', eye: 'open', mouth: 'o' },
  },
  {
    t: 14.2,
    p: {
      hipDrop: 22,
      lean: 0.02,
      headTilt: -0.04,
      headTurn: 2,
      look: 'down',
      brow: 'uneven',
      eye: 'wide',
      mouth: 'o',
      pointL: false,
      footLift: 34,
      handL: { x: 302, y: 1168 },
      handR: { x: 588, y: 1180 },
    },
  },
  {
    t: 14.8,
    p: {
      hipDrop: 20,
      headTilt: -0.08,
      headDrop: 6,
      footLift: 50,
      handL: { x: 286, y: 1154 },
      handR: { x: 600, y: 1162 },
    },
  },
  {
    t: 15.4,
    p: {
      lean: -0.02,
      headTilt: -0.1,
      footLift: 56,
      handL: { x: 270, y: 1140 },
      handR: { x: 610, y: 1142 },
    },
  },
  {
    t: 16.0,
    p: {
      lean: 0,
      hipDrop: 12,
      headTilt: 0,
      headDrop: 0,
      look: 'front',
      brow: 'sad',
      eye: 'shut',
      mouth: 'flat',
      footLift: 0,
      handL: { x: 382, y: 1166 },
      handR: { x: 576, y: 1136 },
    },
  },
  {
    t: 16.5,
    p: {
      hipDrop: 4,
      headTurn: 5,
      look: 'right',
      brow: 'determined',
      eye: 'squint',
      handL: { x: 390, y: 1172 },
      handR: { x: 560, y: 1076 },
    },
  },

  // Shot 4 - the perfect trickshot
  {
    t: 17.0,
    p: {
      hipDrop: 14,
      lean: 0.1,
      stance: 14,
      headTurn: 6,
      brow: 'determined',
      eye: 'squint',
      mouth: 'grit',
      pointL: true,
      handL: { x: 520, y: 995 },
      handR: { x: 536, y: 1086 },
    },
  },
  {
    t: 17.7,
    p: { lean: 0.12, hipDrop: 20, handL: { x: 526, y: 986 }, handR: { x: 524, y: 1096 } },
  },
  {
    t: 18.6,
    p: {
      lean: 0.14,
      headTurn: 8,
      brow: 'angry',
      handL: { x: 530, y: 978 },
      handR: { x: 514, y: 1102 },
    },
  },
  {
    t: 19.1,
    p: {
      eye: 'shut',
      brow: 'determined',
      mouth: 'flat',
      handL: { x: 520, y: 990 },
      handR: { x: 524, y: 1080 },
    },
  },
  {
    t: 19.35,
    p: {
      lean: 0.18,
      hipDrop: 16,
      stance: 12,
      eye: 'open',
      mouth: 'grit',
      pointL: false,
      handR: { x: 620, y: 1140 },
      handL: { x: 548, y: 1040 },
    },
  },
  {
    t: 19.8,
    p: {
      lean: 0.14,
      brow: 'raised',
      eye: 'wide',
      mouth: 'o',
      handR: { x: 620, y: 1130 },
      handL: { x: 556, y: 1050 },
    },
  },
  {
    t: 20.9,
    p: { headTurn: 12, handR: { x: 618, y: 1122 }, handL: { x: 566, y: 1052 } },
  },
  {
    t: 21.8,
    p: {
      headTurn: 8,
      eye: 'wide',
      brow: 'raised',
      mouth: 'o',
      handR: { x: 610, y: 1108 },
      handL: { x: 546, y: 1000 },
    },
  },
  {
    t: 22.5,
    p: {
      hipDrop: 8,
      headTurn: 4,
      eye: 'happy',
      mouth: 'bigsmile',
      handL: { x: 480, y: 950 },
      handR: { x: 588, y: 940 },
    },
  },
  {
    t: 23.0,
    p: {
      lean: 0.02,
      hipDrop: -8,
      stance: 16,
      headTilt: 0.02,
      headTurn: 0,
      brow: 'raised',
      eye: 'happy',
      mouth: 'bigsmile',
      handL: { x: 334, y: 922 },
      handR: { x: 548, y: 922 },
    },
  },
  { t: 24.0, p: { lean: -0.04, stance: 18, handL: { x: 330, y: 916 }, handR: { x: 548, y: 916 } } },

  // Shot 5 - the yo-yo gets revenge
  {
    t: 24.7,
    p: {
      lean: -0.07,
      hipDrop: -6,
      stance: 20,
      headTilt: -0.03,
      handL: { x: 326, y: 920 },
      handR: { x: 546, y: 920 },
    },
  },
  {
    t: 25.2,
    p: {
      headTurn: 6,
      eye: 'happy',
      mouth: 'grin',
      handR: { x: 556, y: 924 },
    },
  },
  {
    t: 25.55,
    p: {
      lean: 0.02,
      hipDrop: 4,
      headTilt: 0,
      headTurn: 8,
      brow: 'raised',
      eye: 'wide',
      mouth: 'o',
      handR: { x: 544, y: 974 },
      handL: { x: 344, y: 986 },
    },
  },
  {
    t: 25.95,
    p: {
      lean: 0,
      headTilt: 0.02,
      eye: 'wide',
      brow: 'raised',
      mouth: 'o',
      handR: { x: 534, y: 1020 },
      handL: { x: 358, y: 1010 },
    },
  },
  {
    t: 26.2,
    p: {
      lean: -0.06,
      hipDrop: 18,
      stance: 18,
      headTilt: -0.2,
      headDrop: 6,
      headTurn: 2,
      brow: 'uneven',
      eye: 'cross',
      mouth: 'o',
      beanieOn: false,
      handL: { x: 290, y: 1070 },
      handR: { x: 590, y: 1110 },
    },
  },
  {
    t: 26.7,
    p: {
      lean: -0.08,
      hipDrop: 20,
      stance: 20,
      headTilt: -0.24,
      headDrop: 8,
      handL: { x: 284, y: 1080 },
      handR: { x: 586, y: 1090 },
    },
  },
  {
    t: 27.4,
    p: {
      lean: -0.05,
      hipDrop: 14,
      stance: 18,
      headTilt: -0.18,
      headDrop: 5,
      brow: 'sad',
      handL: { x: 298, y: 1074 },
      handR: { x: 574, y: 1076 },
    },
  },
  { t: 28.4 },
  { t: 29.3 },
  { t: 30.0 },
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

export class YoYoRevengeRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  private readonly captions = CAPTIONS;

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    void config;
    const t = clamp(time, 0, 30);

    ctx.save();
    ctx.fillStyle = WALL;
    ctx.fillRect(-300, -300, WIDTH + 600, HEIGHT + 600);

    this.applyCamera(ctx, t);
    this.drawRoom(ctx);
    this.drawTable(ctx);

    const pose = this.poseAt(t);
    const crown = this.headPoint(pose);
    const cupWobble = this.cupWobble(t);
    this.drawCup(ctx, false, cupWobble);

    const x = CHAR_X;
    const hipY = HIP_Y + pose.hipDrop;
    const arms = this.computeArms(pose, x, hipY);
    const yoyo = this.yoyoAt(t, arms.r, pose);

    this.drawShadow(ctx, x, hipY);

    this.drawStickman(ctx, x, hipY, pose, arms, t, 'body');
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'head');
    this.drawBonkFx(ctx, t);

    this.drawString(ctx, arms.r, yoyo, t);
    this.drawYoYo(ctx, yoyo, t);
    if (yoyo.inCup) this.drawCup(ctx, true, cupWobble);
    if (yoyo.behindLeg) this.drawLeg(ctx, LEG_NEAR_X, false);

    this.drawStickman(ctx, x, hipY, pose, arms, t, 'hands');
    if (!pose.beanieOn) this.drawFlyingBeanie(ctx, t, crown);
    this.drawBeaniePopLines(ctx, t);

    this.restoreCamera(ctx);
    this.drawCaptions(ctx, t);
    ctx.restore();
  }

  // ---- camera ----------------------------------------------------------
  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    const keys = CAMERA_KEYS;
    let k = keys[0];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (t >= a.t && t <= b.t) {
        const u = smooth((t - a.t) / Math.max(0.0001, b.t - a.t));
        k = {
          t,
          x: lerp(a.x, b.x, u),
          y: lerp(a.y, b.y, u),
          zoom: lerp(a.zoom, b.zoom, u),
        };
        break;
      }
    }
    if (t > keys[keys.length - 1].t) k = keys[keys.length - 1];

    const shake =
      t > 26.18 && t < 26.55 ? ((26.55 - t) / 0.37) * 6 : 0;

    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.scale(k.zoom, k.zoom);
    ctx.translate(
      -k.x + Math.sin(t * 79) * shake,
      -k.y + Math.cos(t * 67) * shake * 0.5
    );
  }

  private restoreCamera(ctx: CanvasRenderingContext2D) {
    ctx.restore();
    ctx.save();
  }

  // ---- room ------------------------------------------------------------
  private drawRoom(ctx: CanvasRenderingContext2D) {
    // Wall.
    ctx.fillStyle = WALL;
    ctx.fillRect(-300, -300, WIDTH + 600, WALL_END + 300);
    ctx.strokeStyle = WALL_LINE;
    ctx.lineWidth = 2;
    for (let x = -60; x < WIDTH + 60; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, -300);
      ctx.lineTo(x, WALL_END);
      ctx.stroke();
    }

    // Baseboard.
    ctx.fillStyle = BASEBOARD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(-300, WALL_END - 26, WIDTH + 600, 48);
    ctx.fill();
    ctx.stroke();

    // Floor planks.
    ctx.fillStyle = FLOOR;
    ctx.fillRect(-300, WALL_END + 22, WIDTH + 600, HEIGHT);
    for (let i = 0; i < 8; i++) {
      const y = WALL_END + 22 + i * 80;
      ctx.fillStyle = i % 2 === 0 ? FLOOR : shade(FLOOR, -0.06);
      ctx.fillRect(-300, y, WIDTH + 600, 80);
      ctx.strokeStyle = FLOOR_LINE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-300, y);
      ctx.lineTo(WIDTH + 300, y);
      ctx.stroke();
    }
  }

  private drawTable(ctx: CanvasRenderingContext2D) {
    // Soft contact shadow on the floor.
    ctx.fillStyle = 'rgba(70,40,20,0.16)';
    ctx.beginPath();
    ctx.ellipse(
      (TABLE_L + TABLE_R) / 2,
      FLOOR_Y + 6,
      (TABLE_R - TABLE_L) * 0.56,
      20,
      0,
      0,
      TAU
    );
    ctx.fill();

    this.drawLeg(ctx, LEG_FAR_X, true);

    // Slab.
    ctx.fillStyle = TABLE_WOOD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(
      TABLE_L,
      TABLE_Y,
      TABLE_R - TABLE_L,
      TABLE_SLAB,
      12
    );
    ctx.fill();
    ctx.stroke();

    // Top surface strip.
    ctx.fillStyle = TABLE_TOP;
    ctx.beginPath();
    ctx.roundRect(TABLE_L + 5, TABLE_Y + 5, TABLE_R - TABLE_L - 10, 16, 6);
    ctx.fill();

    // Grain.
    ctx.strokeStyle = TABLE_GRAIN;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 3; i++) {
      const y = TABLE_Y + 32 + i * 14;
      ctx.beginPath();
      ctx.moveTo(TABLE_L + 26, y);
      ctx.bezierCurveTo(TABLE_L + 130, y - 4, TABLE_R - 140, y + 5, TABLE_R - 28, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Apron shadow.
    ctx.fillStyle = TABLE_DEEP;
    ctx.beginPath();
    ctx.roundRect(TABLE_L + 14, TABLE_Y + TABLE_SLAB, TABLE_R - TABLE_L - 28, 16, 5);
    ctx.fill();

    this.drawLeg(ctx, LEG_NEAR_X, false);

    // Cup contact shadow.
    ctx.fillStyle = 'rgba(60,30,10,0.2)';
    ctx.beginPath();
    ctx.ellipse(CUP_X, TABLE_Y + 4, CUP_RIM_R * 1.1, 7, 0, 0, TAU);
    ctx.fill();
  }

  private drawLeg(ctx: CanvasRenderingContext2D, cx: number, far: boolean) {
    const top = TABLE_Y + TABLE_SLAB;
    ctx.fillStyle = far ? TABLE_DEEP : TABLE_WOOD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(cx - LEG_W / 2, top, LEG_W, FLOOR_Y - top, 7);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = shade(far ? TABLE_DEEP : TABLE_WOOD, -0.16);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 7, top + 14);
    ctx.lineTo(cx - 7, FLOOR_Y - 14);
    ctx.stroke();
  }

  private drawCup(ctx: CanvasRenderingContext2D, frontOnly: boolean, wobble: number) {
    ctx.save();
    ctx.translate(CUP_X, CUP_BASE_Y);
    ctx.rotate(wobble);

    const rimY = -CUP_H;

    // Body (the top boundary is the lower half of the mouth ellipse, which
    // gives the cup its front lip).
    ctx.beginPath();
    ctx.moveTo(-CUP_RIM_R, rimY);
    ctx.lineTo(-CUP_BASE_R, 0);
    ctx.quadraticCurveTo(0, 7, CUP_BASE_R, 0);
    ctx.lineTo(CUP_RIM_R, rimY);
    ctx.ellipse(0, rimY, CUP_RIM_R, CUP_MOUTH_RY, 0, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = CUP_BLUE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fill();
    ctx.stroke();

    // Sheen.
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = CUP_BLUE_LIGHT;
    ctx.beginPath();
    ctx.roundRect(-CUP_RIM_R * 0.62, rimY + 16, 12, CUP_H * 0.44, 6);
    ctx.fill();
    ctx.restore();

    if (!frontOnly) {
      // Mouth.
      ctx.beginPath();
      ctx.ellipse(0, rimY, CUP_RIM_R, CUP_MOUTH_RY, 0, 0, TAU);
      ctx.fillStyle = CUP_BLUE_DEEP;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Inner rim highlight.
      ctx.strokeStyle = CUP_BLUE_LIGHT;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, rimY + 1, CUP_RIM_R - 6, CUP_MOUTH_RY * 0.55, 0, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Front lip.
      ctx.strokeStyle = CUP_BLUE_LIGHT;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, rimY, CUP_RIM_R - 3, CUP_MOUTH_RY * 0.55, 0, 0, Math.PI, false);
      ctx.stroke();
    } else {
      // When the yo-yo is inside, redraw the front lip over it.
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, rimY, CUP_RIM_R, CUP_MOUTH_RY, 0, 0.05, Math.PI - 0.05, false);
      ctx.stroke();
    }

    ctx.restore();
  }

  private cupWobble(t: number) {
    if (t < 21.75 || t > 22.35) return 0;
    const u = (t - 21.75) / 0.6;
    return Math.sin(u * Math.PI * 3) * 0.03 * (1 - u);
  }

  // ---- character -------------------------------------------------------
  private defaultPose(): Pose {
    return { ...BASE_POSE };
  }

  private poseAt(t: number): Pose {
    const keys = POSE_KEYS;
    if (t <= keys[0].t) return keys[0].pose;

    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (t < b.t) {
        const u = smooth((t - a.t) / Math.max(0.0001, b.t - a.t));
        const pa = a.pose;
        const pb = b.pose;
        return {
          // Discrete fields (expressions, flags) step at the key so the
          // acting reads on the beat.
          ...pa,
          lean: lerp(pa.lean, pb.lean, u),
          hipDrop: lerp(pa.hipDrop, pb.hipDrop, u),
          headTilt: lerp(pa.headTilt, pb.headTilt, u),
          headDrop: lerp(pa.headDrop, pb.headDrop, u),
          headTurn: lerp(pa.headTurn, pb.headTurn, u),
          stance: lerp(pa.stance, pb.stance, u),
          footLift: lerp(pa.footLift, pb.footLift, u),
          handL: pointAlong(pa.handL, pb.handL, u),
          handR: pointAlong(pa.handR, pb.handR, u),
          bendL: pa.bendL,
          bendR: pa.bendR,
          rotL: pa.rotL,
        };
      }
    }
    return keys[keys.length - 1].pose;
  }

  private computeArms(pose: Pose, hipX: number, hipY: number) {
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(pose.lean) * 170;
    const upper = 112;
    const fore = 106;

    const solve = (side: -1 | 1, target: Pt, bend: number): Arm => {
      const sx = bodyTopX + side * 34;
      const sy = shoulderY + 12;
      const ux = (target.x - sx) * side;
      const uy = target.y - sy;
      const raw = Math.hypot(ux, uy);
      const d = clamp(raw, 10, upper + fore - 4);
      const base = Math.atan2(ux, uy);
      const cosA = clamp(
        (upper * upper + d * d - fore * fore) / (2 * upper * d),
        -1,
        1
      );
      const alpha = Math.acos(cosA);
      const a1 = base + bend * alpha;
      const ex = sx + Math.sin(a1) * side * upper;
      const ey = sy + Math.cos(a1) * upper;
      const hx = sx + Math.sin(base) * side * d;
      const hy = sy + Math.cos(base) * d;
      return { sx, sy, ex, ey, hx, hy };
    };

    return {
      l: solve(-1, pose.handL, pose.bendL),
      r: solve(1, pose.handR, pose.bendR),
    };
  }

  private headPoint(pose: Pose): Pt {
    const hipY = HIP_Y + pose.hipDrop;
    const shoulderY = hipY - 170;
    const bodyTopX = CHAR_X + Math.sin(pose.lean) * 170;
    return {
      x: bodyTopX + Math.sin(pose.headTilt) * 6,
      y: shoulderY - 78 + pose.headDrop,
    };
  }

  private drawStickman(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    pose: Pose,
    arms: { l: Arm; r: Arm },
    t: number,
    layer: 'body' | 'head' | 'hands'
  ) {
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(pose.lean) * 170;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (layer === 'body') {
      if (pose.hideArms) {
        ctx.restore();
        return;
      }
      this.drawLegs(ctx, hipX, hipY, pose);
      this.drawTorso(ctx, hipX, hipY, pose, shoulderY, bodyTopX);
      this.drawNeck(ctx, bodyTopX, shoulderY, pose);

      // Thin black arms.
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

      // Full mitten hands.
      const leftHandStyle: HandStyle = {
        side: 'left',
        pose: pose.pointL ? 'point' : pose.gripL ? 'grip' : pose.fistL ? 'fist' : 'relaxed',
        layer: 'full',
        rotation: pose.rotL,
      };
      drawHand(ctx, arms.l, leftHandStyle);
      // The right hand is always wrapped around the yo-yo string.
      drawHand(ctx, arms.r, { side: 'right', pose: 'grip', layer: 'full' });
    } else if (layer === 'head') {
      const head = this.headPoint(pose);
      this.drawHead(ctx, head.x, head.y, pose, t, shoulderY, bodyTopX);
    } else {
      // Fingers curl back over the string and any held prop.
      if (pose.gripL) {
        drawHand(ctx, arms.l, { side: 'left', pose: 'grip', layer: 'overlay' });
      }
      drawHand(ctx, arms.r, { side: 'right', pose: 'grip', layer: 'overlay' });
      if (pose.pointL) {
        // no overlay needed for the pointing hand
      }
    }

    ctx.restore();
  }

  private drawLegs(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    pose: Pose
  ) {
    const stance = pose.stance;
    const ankleBase = FLOOR_Y - 16;
    const ankleL = { x: hipX - 38 - stance, y: ankleBase };
    const ankleR = { x: hipX + 38 + stance, y: ankleBase - pose.footLift };
    const kneeL = {
      x: hipX - 20 - stance * 0.4,
      y: hipY + 82 + Math.max(0, pose.hipDrop) * 0.35,
    };
    const kneeR = {
      x: hipX + 20 + stance * 0.4,
      y: hipY + 82 + Math.max(0, pose.hipDrop) * 0.35,
    };

    const drawLegPath = (knee: Pt, ankle: Pt, deep: boolean) => {
      const path = () => {
        ctx.beginPath();
        ctx.moveTo(hipX + (deep ? 8 : -8), hipY + 6);
        ctx.lineTo(knee.x, knee.y);
        ctx.lineTo(ankle.x, ankle.y);
      };
      ctx.strokeStyle = INK;
      ctx.lineWidth = 31;
      path();
      ctx.stroke();
      ctx.strokeStyle = deep ? TROUSER_DEEP : TROUSER;
      ctx.lineWidth = 22;
      path();
      ctx.stroke();
    };

    drawLegPath(kneeL, ankleL, false);
    drawLegPath(kneeR, ankleR, true);

    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    for (const ankle of [ankleL, ankleR]) {
      ctx.beginPath();
      ctx.moveTo(ankle.x - 14, ankle.y);
      ctx.lineTo(ankle.x + 14, ankle.y);
      ctx.stroke();
    }

    this.drawShoe(ctx, ankleL.x - 4, ankleL.y + 14, -0.07);
    this.drawShoe(
      ctx,
      ankleR.x + 4,
      ankleR.y + 14,
      pose.footLift > 20 ? -0.22 : 0.07
    );
  }

  private drawShoe(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rot: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = SHOE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-32, -13, 64, 26, 11);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.roundRect(-24, -8, 14, 6, 3);
    ctx.fill();
    ctx.restore();
  }

  private drawTorso(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    pose: Pose,
    shoulderY: number,
    bodyTopX: number
  ) {
    ctx.fillStyle = SHIRT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(hipX - 34, hipY + 8);
    ctx.lineTo(bodyTopX - 38, shoulderY);
    ctx.lineTo(bodyTopX + 38, shoulderY);
    ctx.lineTo(hipX + 34, hipY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Collar.
    ctx.strokeStyle = SHIRT_DEEP;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bodyTopX - 18, shoulderY + 12);
    ctx.lineTo(bodyTopX + 18, shoulderY + 12);
    ctx.stroke();

    // Hem.
    ctx.beginPath();
    ctx.moveTo(hipX - 30, hipY + 1);
    ctx.lineTo(hipX + 30, hipY + 1);
    ctx.stroke();
  }

  private drawNeck(
    ctx: CanvasRenderingContext2D,
    bodyTopX: number,
    shoulderY: number,
    pose: Pose
  ) {
    const head = this.headPoint(pose);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(bodyTopX, shoulderY + 8);
    ctx.lineTo(head.x, head.y);
    ctx.stroke();
  }

  private drawSleeve(ctx: CanvasRenderingContext2D, arm: Arm) {
    const dx = arm.ex - arm.sx;
    const dy = arm.ey - arm.sy;
    const len = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / len;
    const uy = dy / len;
    const draw = (width: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(arm.sx, arm.sy);
      ctx.lineTo(arm.sx + ux * 34, arm.sy + uy * 34);
      ctx.stroke();
    };
    draw(36, INK);
    draw(27, SHIRT);

    // Cuff line.
    ctx.strokeStyle = SHIRT_DEEP;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(
      arm.sx + ux * 32 - uy * 13,
      arm.sy + uy * 32 + ux * 13
    );
    ctx.lineTo(
      arm.sx + ux * 32 + uy * 13,
      arm.sy + uy * 32 - ux * 13
    );
    ctx.stroke();
  }

  private drawHead(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    pose: Pose,
    t: number,
    shoulderY: number,
    bodyTopX: number
  ) {
    const r = HEAD_R;

    // Neck is drawn in the body layer; this stub keeps the join covered.
    void shoulderY;
    void bodyTopX;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(pose.headTilt);

    // Head.
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (pose.beanieOn) this.drawBeanieShape(ctx, 0, 0);

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
    } else if (pose.eye === 'cross') {
      // Both pupils pull toward the nose for the dazed freeze.
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(fx + side * 16, eyeY + 2, 9.5, 13, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(fx + side * 16 - 2, eyeY - 3, 2.4, 0, TAU);
        ctx.fill();
        ctx.fillStyle = INK;
      }
    } else {
      const eyeH = pose.eye === 'wide' ? 30 : pose.eye === 'squint' ? 8 : 20;
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
    const twitch = t >= 28.6 && t < 29.4 ? Math.sin(t * 24) * 2.5 : 0;
    ctx.beginPath();
    if (pose.brow === 'angry' || pose.brow === 'determined') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY + 8 + twitch);
      ctx.moveTo(fx + 42, browY - 8);
      ctx.lineTo(fx + 12, browY + 8 - twitch);
    } else if (pose.brow === 'raised') {
      ctx.moveTo(fx - 42, browY - 12);
      ctx.lineTo(fx - 12, browY - 10);
      ctx.moveTo(fx + 42, browY - 12);
      ctx.lineTo(fx + 12, browY - 10);
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
      // Wide open celebration smile with a white tooth strip.
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

  private drawBeanieShape(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    const r = HEAD_R;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillStyle = BEANIE;
    ctx.beginPath();
    ctx.arc(cx, cy - 24, r + 4, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = BEANIE_DEEP;
    ctx.beginPath();
    ctx.rect(cx - r - 4, cy - 40, (r + 4) * 2, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = BEANIE_POM;
    ctx.beginPath();
    ctx.arc(cx, cy - r - 32, 16, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private drawFlyingBeanie(
    ctx: CanvasRenderingContext2D,
    t: number,
    crown: Pt
  ) {
    const keys: { t: number; x: number; y: number; rot: number }[] = [
      { t: 26.18, x: crown.x, y: crown.y, rot: -0.2 },
      { t: 26.45, x: crown.x + 22, y: crown.y - 150, rot: -2.2 },
      { t: 26.9, x: crown.x + 48, y: crown.y - 235, rot: -4.6 },
      { t: 27.4, x: crown.x + 55, y: crown.y - 250, rot: -6.0 },
      { t: 28.2, x: crown.x + 38, y: crown.y - 192, rot: -6.6 },
      { t: 29.2, x: crown.x + 16, y: crown.y - 96, rot: -6.85 },
      { t: 29.75, x: crown.x + 6, y: crown.y - 30, rot: -6.45 },
      { t: 30.0, x: crown.x + 2, y: crown.y - 10, rot: -TAU },
    ];

    let a = keys[0];
    let b = keys[0];
    if (t <= keys[0].t) {
      a = keys[0];
      b = keys[0];
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

    const u = b.t === a.t ? 1 : smooth((t - a.t) / (b.t - a.t));
    const x = lerp(a.x, b.x, u);
    const y = lerp(a.y, b.y, u);
    const rot = lerp(a.rot, b.rot, u);

    // Motion trails while it flies up and falls.
    if ((t > 26.2 && t < 27.0) || (t > 28.8 && t < 30.0)) {
      ctx.save();
      ctx.strokeStyle = 'rgba(23,18,31,0.25)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x - 30 + i * 9, y - 70 - i * 12);
        ctx.lineTo(x - 30 + i * 9, y - 102 - i * 12);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    this.drawBeanieShape(ctx, 0, 0);
    ctx.restore();
  }

  private drawBonkFx(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 26.16 || t > 26.75) return;
    const u = clamp((t - 26.16) / 0.55, 0, 1);
    const alpha = 1 - u;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = INK;
    ctx.fillStyle = WHITE;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    // Star burst.
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      const r = i % 2 === 0 ? 34 : 16;
      const px = BONK_X + Math.cos(a) * r;
      const py = BONK_Y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Radiating speed lines.
    ctx.strokeStyle = INK;
    for (let i = 0; i < 5; i++) {
      const a = -1.9 + i * 0.7;
      ctx.beginPath();
      ctx.moveTo(BONK_X + Math.cos(a) * 48, BONK_Y + Math.sin(a) * 48);
      ctx.lineTo(BONK_X + Math.cos(a) * 70, BONK_Y + Math.sin(a) * 70);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawBeaniePopLines(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 26.18 || t > 26.9) return;
    const u = clamp((t - 26.18) / 0.72, 0, 1);
    const crown = this.headPoint(this.poseAt(t));
    ctx.save();
    ctx.globalAlpha = 1 - u;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const a = -Math.PI * 0.15 - i * 0.42;
      ctx.beginPath();
      ctx.moveTo(crown.x + Math.cos(a) * 78, crown.y - 60 + Math.sin(a) * 30);
      ctx.lineTo(crown.x + Math.cos(a) * 108, crown.y - 90 + Math.sin(a) * 46);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawShadow(ctx: CanvasRenderingContext2D, x: number, _hipY: number) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(x, FLOOR_Y + 6, 84, 16, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // ---- yo-yo -----------------------------------------------------------
  private palmPoint(arm: Arm): Pt {
    const a = Math.atan2(arm.hy - arm.ey, arm.hx - arm.ex);
    return {
      x: arm.hx + Math.cos(a) * 16,
      y: arm.hy + Math.sin(a) * 16,
    };
  }

  private yoyoAt(t: number, armR: Arm, pose: Pose): YoYoState {
    void pose;
    const hand = this.palmPoint(armR);
    const air = (
      x: number,
      y: number,
      spin: number,
      extra: Partial<YoYoState> = {}
    ): YoYoState => ({
      x,
      y,
      spin,
      visible: true,
      inCup: false,
      behindLeg: false,
      wrapLeg: false,
      slack: false,
      fast: false,
      ...extra,
    });

    const hang = (): YoYoState =>
      air(
        hand.x + 8 + Math.sin(t * 2.2) * 5,
        hand.y + 108 + Math.cos(t * 2.2) * 3,
        t * 1.4,
        { slack: true }
      );

    const inCup = (): YoYoState => ({
      x: CUP_X,
      y: CUP_REST_Y,
      spin: 0,
      visible: true,
      inCup: true,
      behindLeg: false,
      wrapLeg: false,
      slack: false,
      fast: false,
    });

    // Shot 1: dangling from the string.
    if (t < 5.15) return hang();

    // Shot 2: the too-high swing and the near miss.
    if (t < 11.0) {
      if (t < 5.55) {
        const u = clamp((t - 5.15) / 0.4, 0, 1);
        return air(
          bez(hand.x + 8, 640, 655, u),
          bez(hand.y + 108, 1188, 1250, u),
          u * 10,
          { fast: true }
        );
      }
      if (t < 6.0) {
        const u = clamp((t - 5.55) / 0.45, 0, 1);
        return air(
          bez(655, 692, 722, u),
          bez(1250, 1268, 1248, u),
          10 + u * 10,
          { fast: true }
        );
      }
      if (t < 6.85) {
        const u = clamp((t - 6.0) / 0.85, 0, 1);
        return air(
          bez(722, 850, 858, u),
          bez(1248, 900, 760, u),
          20 + u * 16,
          { fast: true }
        );
      }
      if (t < 7.2) {
        const u = clamp((t - 6.85) / 0.35, 0, 1);
        return air(
          bez(858, 900, 900, u),
          bez(760, 800, 880, u),
          36 + u * 10,
          { fast: true }
        );
      }
      if (t < 7.8) {
        const u = clamp((t - 7.2) / 0.6, 0, 1);
        return air(
          bez(900, 760, 520, u),
          bez(880, 1010, 1000, u),
          46 + u * 18,
          { fast: true }
        );
      }
      if (t < 8.25) {
        const u = clamp((t - 7.8) / 0.45, 0, 1);
        return air(
          bez(520, 560, 588, u),
          bez(1000, 980, 1050, u),
          64 + u * 8,
          { fast: true }
        );
      }
      if (t < 8.65) {
        const u = clamp((t - 8.25) / 0.4, 0, 1);
        return air(
          bez(588, hand.x + 22, hand.x + 8, u),
          bez(1050, 1080, hand.y + 108, u),
          72 + u * 6
        );
      }
      return hang();
    }

    // Shot 3: around the leg, then around the ankles.
    if (t < 17.0) {
      if (t < 11.45) return hang();
      if (t < 12.0) {
        const u = clamp((t - 11.45) / 0.55, 0, 1);
        return air(
          bez(hand.x + 8, 600, 640, u),
          bez(hand.y + 108, 1410, 1545, u),
          u * 10,
          { slack: true }
        );
      }
      if (t < 12.5) {
        const u = clamp((t - 12.0) / 0.5, 0, 1);
        return air(
          bez(640, 600, 588, u),
          bez(1545, 1460, 1392, u),
          10 + u * 14
        );
      }
      if (t < 14.2) {
        const u = clamp((t - 12.5) / 1.7, 0, 1);
        const a = Math.PI + u * TAU;
        return air(
          YOYO_ORBIT_CX + Math.cos(a) * YOYO_ORBIT_RX,
          YOYO_ORBIT_CY + Math.sin(a) * YOYO_ORBIT_RY,
          24 + u * 34,
          {
            behindLeg: Math.cos(a) > 0,
            wrapLeg: true,
            fast: true,
          }
        );
      }
      if (t < 14.55) {
        const u = clamp((t - 14.2) / 0.35, 0, 1);
        return air(
          bez(YOYO_ORBIT_CX - YOYO_ORBIT_RX, 590, 540, u),
          bez(YOYO_ORBIT_CY, 1420, 1470, u),
          58 + u * 10,
          { fast: true }
        );
      }
      if (t < 16.0) {
        const u = clamp((t - 14.55) / 1.45, 0, 1);
        const a = Math.PI + u * TAU * 1.15;
        return air(
          ANKLE_ORBIT_CX + Math.cos(a) * 100,
          ANKLE_ORBIT_CY + Math.sin(a) * 55,
          68 + u * 42,
          { fast: true }
        );
      }
      if (t < 16.45) {
        const u = clamp((t - 16.0) / 0.45, 0, 1);
        return air(
          bez(ANKLE_ORBIT_CX + 100, 570, hand.x + 8, u),
          bez(ANKLE_ORBIT_CY, 1300, hand.y + 108, u),
          110 + u * 8
        );
      }
      return hang();
    }

    // Shot 4: the clean trick shot.
    if (t < 24.0) {
      if (t < 19.3) return hang();
      if (t < 19.65) {
        const u = clamp((t - 19.3) / 0.35, 0, 1);
        return air(
          bez(hand.x + 8, 640, 600, u),
          bez(hand.y + 108, 1340, 1400, u),
          u * 10,
          { fast: true }
        );
      }
      if (t < 20.0) {
        const u = clamp((t - 19.65) / 0.35, 0, 1);
        return air(
          bez(600, 560, 545, u),
          bez(1400, 1410, 1392, u),
          10 + u * 18,
          { fast: true }
        );
      }
      if (t < 21.0) {
        const u = clamp((t - 20.0) / 1.0, 0, 1);
        const a = Math.PI + u * TAU * 1.05;
        return air(
          YOYO_ORBIT_CX + Math.cos(a) * YOYO_ORBIT_RX,
          YOYO_ORBIT_CY + Math.sin(a) * YOYO_ORBIT_RY,
          28 + u * 30,
          {
            behindLeg: Math.cos(a) > 0 && u < 0.94,
            wrapLeg: true,
            fast: true,
          }
        );
      }
      if (t < 21.35) {
        const u = clamp((t - 21.0) / 0.35, 0, 1);
        const startA = Math.PI + TAU * 1.05;
        return air(
          bez(
            YOYO_ORBIT_CX + Math.cos(startA) * YOYO_ORBIT_RX,
            645,
            700,
            u
          ),
          bez(
            YOYO_ORBIT_CY + Math.sin(startA) * YOYO_ORBIT_RY,
            1195,
            1088,
            u
          ),
          58 + u * 18,
          { fast: true }
        );
      }
      if (t < 21.75) {
        const u = clamp((t - 21.35) / 0.4, 0, 1);
        return air(
          bez(700, 768, CUP_X, u),
          bez(1088, 1014, CUP_RIM_Y - 14, u),
          76 + u * 18,
          { fast: true }
        );
      }
      if (t < 22.0) {
        const u = clamp((t - 21.75) / 0.25, 0, 1);
        return air(
          CUP_X,
          bez(CUP_RIM_Y - 14, CUP_RIM_Y + 5, CUP_REST_Y, u),
          94 + u * 8,
          { inCup: true }
        );
      }
      const settle =
        t < 22.3 ? Math.sin(((t - 22.0) / 0.3) * Math.PI) * 3 : 0;
      return {
        ...inCup(),
        y: CUP_REST_Y - settle,
      };
    }

    // Shot 5: the revenge.
    if (t < 25.0) return inCup();

    if (t < 25.5) {
      const u = clamp((t - 25.0) / 0.5, 0, 1);
      return air(
        bez(CUP_X, 826, 812, u),
        bez(CUP_REST_Y, 988, 900, u),
        u * 14,
        { fast: true }
      );
    }
    if (t < 26.2) {
      const u = clamp((t - 25.5) / 0.7, 0, 1);
      return air(
        bez(812, 634, BONK_X, u),
        bez(900, 932, BONK_Y, u),
        14 + u * 16,
        { fast: true }
      );
    }
    if (t < 26.6) {
      // Bonk rebound.
      const u = clamp((t - 26.2) / 0.4, 0, 1);
      return air(
        bez(BONK_X, 516, 508, u),
        bez(BONK_Y, 924, 902, u),
        30 + u * 8,
        { fast: true }
      );
    }
    if (t < 27.2) {
      const u = clamp((t - 26.6) / 0.6, 0, 1);
      return air(
        bez(508, 546, hand.x + 8, u),
        bez(902, 1080, hand.y + 108, u),
        38 + u * 6
      );
    }
    return hang();
  }

  private drawString(
    ctx: CanvasRenderingContext2D,
    armR: Arm,
    s: YoYoState,
    _t: number
  ) {
    if (!s.visible) return;
    const from = this.palmPoint(armR);

    ctx.save();
    ctx.strokeStyle = STRING;
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);

    if (s.wrapLeg) {
      // Route the string around the near edge of the leg. The middle span
      // is hidden when the leg is redrawn on top, so it reads as a wrap.
      const leftEdge = LEG_NEAR_X - LEG_W / 2 - 3;
      const rightEdge = LEG_NEAR_X + LEG_W / 2 + 3;
      if (s.x > leftEdge + 6) {
        ctx.lineTo(leftEdge, s.y);
        ctx.lineTo(rightEdge, s.y);
        ctx.lineTo(s.x, s.y);
      } else {
        const mx = (from.x + s.x) / 2;
        const my = (from.y + s.y) / 2;
        ctx.quadraticCurveTo(mx + 4, my + 4, s.x, s.y);
      }
    } else {
      const mx = (from.x + s.x) / 2;
      const my = (from.y + s.y) / 2;
      const sag = s.slack ? 10 : 2;
      ctx.quadraticCurveTo(mx + 4, my + sag, s.x, s.y);
    }
    ctx.stroke();

    // A tiny visible wrap at the leg.
    if (s.wrapLeg && s.x > LEG_NEAR_X - LEG_W / 2 + 3) {
      const contactX = LEG_NEAR_X - LEG_W / 2 - 3;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(contactX, s.y, 8, Math.PI * 0.2, Math.PI * 1.3);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawYoYo(
    ctx: CanvasRenderingContext2D,
    s: YoYoState,
    _t: number
  ) {
    if (!s.visible) return;

    // Speed blur arcs behind the disc.
    if (s.fast) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const a = s.spin + i * 2.1;
        ctx.beginPath();
        ctx.arc(
          s.x + Math.cos(a) * 9,
          s.y + Math.sin(a) * 9,
          YOYO_R + 9 + i * 3,
          a,
          a + 0.85
        );
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.spin);

    // Back disc, offset to give the yo-yo a chunky 3/4 read.
    ctx.fillStyle = YOYO_BLUE_DEEP;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-7, -5, YOYO_R, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Front disc.
    ctx.fillStyle = YOYO_BLUE;
    ctx.beginPath();
    ctx.arc(0, 0, YOYO_R, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = YOYO_RED;
    ctx.beginPath();
    ctx.arc(0, 0, YOYO_R * 0.72, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = YOYO_RED_DEEP;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hub.
    ctx.fillStyle = YOYO_WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Shine.
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.ellipse(-10, -13, 6, 3.5, -0.6, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  // ---- captions --------------------------------------------------------
  private drawCaptions(ctx: CanvasRenderingContext2D, t: number) {
    const line = this.captions.find((c) => t >= c.from && t < c.to);
    if (!line) return;

    const u = clamp((t - line.from) / 0.14, 0, 1);
    const fade = Math.min(1, (line.to - t) / 0.2);
    const alpha = clamp(Math.min((t - line.from) / 0.05, fade), 0, 1);
    if (alpha <= 0) return;

    const scale = 1 - (1 - smooth(u)) * 0.2 + Math.sin(u * Math.PI) * 0.08;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(WIDTH / 2, 470);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    let size = 76;
    ctx.font = heavy(size);
    const width = ctx.measureText(line.text).width;
    if (width > 960) {
      size = Math.max(40, Math.floor((size * 960) / width));
      ctx.font = heavy(size);
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(12, size * 0.24);
    ctx.strokeText(line.text, 0, 0);
    ctx.fillStyle = WHITE;
    ctx.fillText(line.text, 0, 0);
    ctx.restore();
  }
}
