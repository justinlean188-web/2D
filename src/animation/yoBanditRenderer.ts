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
const LAUNCHER_BROWN = '#8b5e3c';
const LAUNCHER_DARK = '#6b4226';
const RUBBER_BAND = '#e63946';
const RUBBER_BAND_DEEP = '#b3222e';
const PAPER_WHITE = '#f5f5f5';
const PAPER_SHADOW = '#d0d0d0';
const BIN_BLUE = '#1e3a8a';
const BIN_BLUE_DEEP = '#162a6a';
const BIN_BLUE_LIGHT = '#3b82f6';
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

const TABLE_Y = 1120;
const TABLE_SLAB = 72;
const TABLE_L = 610;
const TABLE_R = 1000;
const LEG_NEAR_X = 660;
const LEG_FAR_X = 950;
const LEG_W = 46;

// Launcher on table
const LAUNCHER_X = 720;
const LAUNCHER_Y = TABLE_Y - 12;
const LAUNCHER_W = 120;
const LAUNCHER_H = 28;
const BAND_ANCHOR_L = LAUNCHER_X - LAUNCHER_W / 2 + 8;
const BAND_ANCHOR_R = LAUNCHER_X + LAUNCHER_W / 2 - 8;
const BAND_Y = LAUNCHER_Y - 8;

// Bin far right
const BIN_X = 1200;
const BIN_W = 160;
const BIN_H = 200;
const BIN_BASE_Y = FLOOR_Y;
const BIN_TOP_Y = BIN_BASE_Y - BIN_H;
const BIN_RIM_Y = BIN_TOP_Y;
const BIN_RIM_H = 16;
const BIN_INNER_W = BIN_W - 24;
const BIN_INNER_L = BIN_X - BIN_INNER_W / 2;
const BIN_INNER_R = BIN_X + BIN_INNER_W / 2;

const BALL_R = 18;
const BALL_REST_Y = BAND_Y - 10;

// Paper balls inside bin for Scene 5
const BIN_BALL_COUNT = 6;
const BIN_BALL_R = 12;
const BIN_BALL_POS: { x: number; y: number }[] = [
  { x: BIN_X - 30, y: BIN_BASE_Y - 30 },
  { x: BIN_X + 20, y: BIN_BASE_Y - 25 },
  { x: BIN_X - 10, y: BIN_BASE_Y - 55 },
  { x: BIN_X + 40, y: BIN_BASE_Y - 50 },
  { x: BIN_X - 40, y: BIN_BASE_Y - 80 },
  { x: BIN_X + 10, y: BIN_BASE_Y - 85 },
];

const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + Math.round(amt * 255)));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + Math.round(amt * 255)));
  const b = Math.min(255, Math.max(0, (n & 255) + Math.round(amt * 255)));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const bez = (a: number, b: number, c: number, t: number) =>
  (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;

// Camera keyframes
const CAM_KEYS = [
  { t: 0.0, x: 540, y: 960, zoom: 1.0 },
  { t: 0.8, x: 540, y: 960, zoom: 1.0 },
  { t: 2.0, x: 540, y: 1000, zoom: 1.1 },
  { t: 4.0, x: 620, y: 1040, zoom: 1.25 },
  { t: 5.5, x: 540, y: 1060, zoom: 1.15 },
  { t: 7.0, x: 540, y: 1100, zoom: 1.1 },
  { t: 8.5, x: 540, y: 1120, zoom: 1.05 },
  { t: 11.0, x: 540, y: 1060, zoom: 1.15 },
  { t: 13.0, x: 540, y: 1100, zoom: 1.1 },
  { t: 15.5, x: 540, y: 1140, zoom: 1.0 },
  { t: 17.5, x: 540, y: 1060, zoom: 1.15 },
  { t: 19.0, x: 540, y: 1080, zoom: 1.1 },
  { t: 21.0, x: 540, y: 1120, zoom: 1.05 },
  { t: 22.5, x: 540, y: 1060, zoom: 1.15 },
  { t: 24.0, x: 540, y: 1040, zoom: 1.08 },
  { t: 25.5, x: 540, y: 1060, zoom: 1.1 },
  { t: 27.0, x: 540, y: 1100, zoom: 1.12 },
  { t: 29.0, x: 540, y: 1120, zoom: 1.14 },
  { t: 30.0, x: 540, y: 1100, zoom: 1.1 },
];

// Captions
interface CaptionLine { text: string; from: number; to: number; }
const CAPTIONS: CaptionLine[] = [
  { text: 'IMPOSSIBLE RUBBER BAND SHOT!', from: 0.0, to: 5.0 },
  { text: 'WAY TOO HIGH!', from: 5.0, to: 11.0 },
  { text: 'NOW IT\'S TOO LOW!', from: 11.0, to: 17.0 },
  { text: 'PERFECT SHOT!!!', from: 17.0, to: 24.0 },
  { text: 'THE BIN GOT REVENGE! 😂', from: 24.0, to: 30.0 },
];

// --- pose types ----------------------------------------------------------
type MouthShape = 'flat' | 'smile' | 'grin' | 'o' | 'frown' | 'grit' | 'smirk' | 'bigsmile';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'determined' | 'uneven';
type EyeShape = 'open' | 'wide' | 'squint' | 'shut' | 'happy' | 'cross';
type LookDir = 'front' | 'down' | 'up' | 'right' | 'left';

interface Pt { x: number; y: number; }

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
  sx: number; sy: number;
  ex: number; ey: number;
  hx: number; hy: number;
}

// --- ball state ---
interface BallState {
  x: number; y: number;
  spin: number;
  visible: boolean;
  inBin: boolean;
  binIndex?: number;
  binOffsetX?: number;
  binOffsetY?: number;
}

const ballAtRest = (): BallState => ({
  x: LAUNCHER_X, y: BALL_REST_Y, spin: 0, visible: true, inBin: false,
});

const ballInLauncher = (): BallState => ({
  x: LAUNCHER_X, y: BALL_REST_Y, spin: 0, visible: true, inBin: false,
});

const ballFlying = (x: number, y: number, spin: number): BallState => ({
  x, y, spin, visible: true, inBin: false,
});

const ballInBin = (index: number): BallState => ({
  x: BIN_BALL_POS[index].x, y: BIN_BALL_POS[index].y,
  spin: 0, visible: true, inBin: true, binIndex: index,
});

// --- pose keys -----------------------------------------------------------
const BASE_POSE: Pose = {
  lean: 0, hipDrop: 0, headTilt: 0.03, headDrop: 0, headTurn: 3,
  look: 'right', mouth: 'flat', brow: 'normal', eye: 'open',
  stance: 0, footLift: 0,
  handL: { x: CHAR_X - 90, y: 1185 },
  handR: { x: CHAR_X + 115, y: 1060 },
  bendL: 1, bendR: 1,
  gripL: false, fistL: false, fistR: false,
  pointL: false, pointR: false,
  beanieOn: true, hideArms: false,
};

const POSE_PATCHES: { t: number; p?: PosePatch }[] = [
  // Scene 1: The Impossible Target (0-5s)
  { t: 0.0 },
  { t: 0.8, p: { lean: 0.04, headTilt: 0.08, headTurn: 8 } },
  { t: 1.5, p: {
      lean: 0.05, headTilt: 0.08, headTurn: 8, brow: 'cocky',
      eye: 'squint', mouth: 'smirk', pointL: true,
      handL: { x: 588, y: 1094 }, handR: { x: 680, y: 1060 },
  }},
  { t: 2.5, p: { look: 'front', headTurn: 5, mouth: 'grin',
      handL: { x: 598, y: 1084 }, handR: { x: 690, y: 1050 },
  }},
  { t: 3.8, p: { handL: { x: 594, y: 1088 }, handR: { x: 685, y: 1055 } } },
  { t: 4.5, p: {
      lean: -0.03, headTilt: 0.02, headTurn: 6, look: 'right',
      brow: 'determined', eye: 'squint', mouth: 'grit',
      pointL: false, handL: { x: 470, y: 1130 }, handR: { x: 680, y: 1040 },
  }},
  { t: 5.0, p: { lean: 0.08, handL: { x: 505, y: 1112 }, handR: { x: 695, y: 1040 } } },

  // Scene 2: Way Too High! (5-11s)
  { t: 5.3, p: {
      lean: 0.12, headTurn: 10, brow: 'raised', eye: 'wide', mouth: 'o',
      gripL: true, handL: { x: 622, y: 1128 }, handR: { x: BAND_ANCHOR_R, y: BAND_Y - 20 },
  }},
  { t: 6.0, p: { handR: { x: BAND_ANCHOR_R, y: BAND_Y - 40 } } },
  { t: 6.5, p: {
      lean: -0.1, hipDrop: 15, headTilt: -0.1, headDrop: 10, headTurn: 4,
      handR: { x: BAND_ANCHOR_R, y: BAND_Y - 60 },
  }},
  { t: 7.0, p: {
      brow: 'raised', eye: 'wide', mouth: 'o', lean: -0.14, hipDrop: 25,
      headTilt: -0.14, headDrop: 12,
      handR: { x: BAND_ANCHOR_R, y: BAND_Y - 80 },
  }},
  { t: 7.8, p: {
      lean: -0.04, hipDrop: 8, headTilt: 0, headDrop: 2, headTurn: 4,
      brow: 'raised', eye: 'wide', mouth: 'o', gripL: false,
      handL: { x: 540, y: 1120 }, handR: { x: 574, y: 1072 },
  }},
  { t: 8.5, p: {
      lean: 0.02, hipDrop: 0, headTurn: 0, look: 'front',
      brow: 'angry', eye: 'squint', mouth: 'grit', fistL: true, fistR: true,
      handL: { x: 414, y: 1142 }, handR: { x: 540, y: 1118 },
  }},
  { t: 10.0, p: { handL: { x: 408, y: 1152 }, handR: { x: 545, y: 1128 } } },
  { t: 11.0 },

  // Scene 3: Too Low! (11-17s)
  { t: 11.5, p: {
      lean: 0.06, hipDrop: 28, headTilt: 0.02, headTurn: 6, look: 'down',
      brow: 'determined', eye: 'open', mouth: 'flat',
      fistL: false, pointL: true, gripL: true,
      handL: { x: 596, y: 1200 }, handR: { x: BAND_ANCHOR_R, y: BAND_Y - 10 },
  }},
  { t: 12.2, p: { hipDrop: 34, handL: { x: 600, y: 1206 }, handR: { x: BAND_ANCHOR_R, y: BAND_Y - 20 } } },
  { t: 13.0, p: { look: 'down', headTurn: 8, brow: 'determined', eye: 'open', mouth: 'o' } },
  { t: 13.8, p: {
      hipDrop: 22, lean: 0.02, headTilt: -0.04, headTurn: 2, look: 'down',
      brow: 'uneven', eye: 'wide', mouth: 'o', pointL: false, footLift: 34,
      handL: { x: 302, y: 1168 }, handR: { x: 588, y: 1180 },
  }},
  { t: 14.5, p: {
      hipDrop: 20, headTilt: -0.08, headDrop: 6, footLift: 50,
      handL: { x: 286, y: 1154 }, handR: { x: 600, y: 1162 },
  }},
  { t: 15.2, p: {
      lean: -0.02, headTilt: -0.1, footLift: 56,
      handL: { x: 270, y: 1140 }, handR: { x: 610, y: 1142 },
  }},
  { t: 15.8, p: {
      lean: 0, hipDrop: 12, headTilt: 0, headDrop: 0, look: 'front',
      brow: 'sad', eye: 'shut', mouth: 'flat', footLift: 0,
      handL: { x: 382, y: 1166 }, handR: { x: 576, y: 1136 },
  }},
  { t: 16.5, p: {
      hipDrop: 4, headTurn: 5, look: 'right', brow: 'determined',
      eye: 'squint', handL: { x: 390, y: 1172 }, handR: { x: 560, y: 1076 },
  }},

  // Scene 4: Perfect Shot! (17-24s)
  { t: 17.2, p: {
      hipDrop: 14, lean: 0.1, stance: 14, headTurn: 6,
      brow: 'determined', eye: 'squint', mouth: 'grit',
      pointL: true, gripL: true,
      handL: { x: 520, y: 995 }, handR: { x: BAND_ANCHOR_R, y: BAND_Y - 15 },
  }},
  { t: 18.0, p: { lean: 0.12, hipDrop: 20, handL: { x: 526, y: 986 }, handR: { x: BAND_ANCHOR_R, y: BAND_Y - 25 } } },
  { t: 18.8, p: {
      lean: 0.14, headTurn: 8, brow: 'angry',
      handL: { x: 530, y: 978 }, handR: { x: BAND_ANCHOR_R, y: BAND_Y - 35 },
  }},
  { t: 19.3, p: {
      eye: 'shut', brow: 'determined', mouth: 'flat',
      handL: { x: 520, y: 990 }, handR: { x: BAND_ANCHOR_R, y: BAND_Y - 45 },
  }},
  { t: 19.6, p: {
      lean: 0.18, hipDrop: 16, stance: 12, eye: 'open', mouth: 'grit',
      pointL: false, gripL: false,
      handR: { x: BAND_ANCHOR_R, y: BAND_Y - 50 }, handL: { x: 548, y: 1040 },
  }},
  { t: 20.2, p: {
      lean: 0.14, brow: 'raised', eye: 'wide', mouth: 'o',
      handR: { x: BAND_ANCHOR_R + 20, y: BAND_Y - 30 }, handL: { x: 556, y: 1050 },
  }},
  { t: 21.0, p: { headTurn: 12, handR: { x: BAND_ANCHOR_R + 40, y: BAND_Y + 10 }, handL: { x: 566, y: 1052 } } },
  { t: 21.8, p: {
      headTurn: 8, eye: 'wide', brow: 'raised', mouth: 'o',
      handR: { x: BAND_ANCHOR_R + 60, y: BAND_Y + 40 }, handL: { x: 546, y: 1000 },
  }},
  { t: 22.5, p: {
      hipDrop: 8, headTurn: 4, eye: 'happy', mouth: 'bigsmile',
      handL: { x: 480, y: 950 }, handR: { x: 588, y: 940 },
  }},
  { t: 23.2, p: {
      lean: 0.02, hipDrop: -8, stance: 16, headTilt: 0.02, headTurn: 0,
      brow: 'raised', eye: 'happy', mouth: 'bigsmile',
      handL: { x: 334, y: 922 }, handR: { x: 548, y: 922 },
  }},
  { t: 24.0, p: { lean: -0.04, stance: 18, handL: { x: 330, y: 916 }, handR: { x: 548, y: 916 } } },

  // Scene 5: The Bin's Revenge! (24-30s)
  { t: 24.7, p: {
      lean: -0.07, hipDrop: -6, stance: 20, headTilt: -0.03,
      handL: { x: 326, y: 920 }, handR: { x: 546, y: 920 },
  }},
  { t: 25.2, p: { headTurn: 6, eye: 'happy', mouth: 'grin', handR: { x: 556, y: 924 } } },
  { t: 25.6, p: {
      lean: 0.02, hipDrop: 4, headTilt: 0, headTurn: 8,
      brow: 'raised', eye: 'wide', mouth: 'o',
      handR: { x: 544, y: 974 }, handL: { x: 344, y: 986 },
  }},
  { t: 26.2, p: {
      lean: 0, headTilt: 0.02, eye: 'wide', brow: 'raised', mouth: 'o',
      handR: { x: 534, y: 1020 }, handL: { x: 358, y: 1010 },
  }},
  { t: 26.8, p: {
      lean: -0.06, hipDrop: 18, stance: 18, headTilt: -0.2, headDrop: 6,
      headTurn: 2, brow: 'uneven', eye: 'cross', mouth: 'o', beanieOn: false,
      handL: { x: 290, y: 1070 }, handR: { x: 590, y: 1110 },
  }},
  { t: 27.5, p: {
      lean: -0.08, hipDrop: 20, stance: 20, headTilt: -0.24, headDrop: 8,
      handL: { x: 284, y: 1080 }, handR: { x: 586, y: 1090 },
  }},
  { t: 28.2, p: {
      lean: -0.05, hipDrop: 14, stance: 18, headTilt: -0.18, headDrop: 5,
      brow: 'sad', handL: { x: 298, y: 1074 }, handR: { x: 574, y: 1076 },
  }},
  { t: 29.0 },
  { t: 29.7 },
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

export class YoBanditRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  private readonly captions = CAPTIONS;

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    void config;
    const t = clamp(time, 0, 30);
    this.setupCamera(ctx, t);
    this.drawScene(ctx, t);
    this.restoreCamera(ctx);
    this.drawCaptions(ctx, t);
  }

  private setupCamera(ctx: CanvasRenderingContext2D, t: number) {
    let a = CAM_KEYS[0], b = CAM_KEYS[0];
    if (t <= CAM_KEYS[0].t) { a = CAM_KEYS[0]; b = CAM_KEYS[0]; }
    else if (t >= CAM_KEYS[CAM_KEYS.length - 1].t) {
      a = CAM_KEYS[CAM_KEYS.length - 1]; b = a;
    } else {
      for (let i = 0; i < CAM_KEYS.length - 1; i++) {
        if (t >= CAM_KEYS[i].t && t <= CAM_KEYS[i + 1].t) { a = CAM_KEYS[i]; b = CAM_KEYS[i + 1]; break; }
      }
    }
    const u = (b.t === a.t) ? 0 : clamp((t - a.t) / (b.t - a.t), 0, 1);
    const su = smooth(u);
    const cx = lerp(a.x, b.x, su);
    const cy = lerp(a.y, b.y, su);
    const zoom = lerp(a.zoom, b.zoom, su);

    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);
  }

  private restoreCamera(ctx: CanvasRenderingContext2D) { ctx.restore(); }

  private poseAt(t: number): Pose {
    let a = POSE_KEYS[0], b = POSE_KEYS[0];
    if (t <= POSE_KEYS[0].t) { a = POSE_KEYS[0]; b = POSE_KEYS[0]; }
    else if (t >= POSE_KEYS[POSE_KEYS.length - 1].t) {
      a = POSE_KEYS[POSE_KEYS.length - 1]; b = a;
    } else {
      for (let i = 0; i < POSE_KEYS.length - 1; i++) {
        if (t >= POSE_KEYS[i].t && t <= POSE_KEYS[i + 1].t) { a = POSE_KEYS[i]; b = POSE_KEYS[i + 1]; break; }
      }
    }
    const u = (b.t === a.t) ? 0 : clamp((t - a.t) / (b.t - a.t), 0, 1);
    const su = smooth(u);
    const pa = a.pose, pb = b.pose;
    return {
      lean: lerp(pa.lean, pb.lean, su),
      hipDrop: lerp(pa.hipDrop, pb.hipDrop, su),
      headTilt: lerp(pa.headTilt, pb.headTilt, su),
      headDrop: lerp(pa.headDrop, pb.headDrop, su),
      headTurn: lerp(pa.headTurn, pb.headTurn, su),
      look: su < 0.5 ? pa.look : pb.look,
      mouth: su < 0.5 ? pa.mouth : pb.mouth,
      brow: su < 0.5 ? pa.brow : pb.brow,
      eye: su < 0.5 ? pa.eye : pb.eye,
      stance: lerp(pa.stance, pb.stance, su),
      footLift: lerp(pa.footLift, pb.footLift, su),
      handL: { x: lerp(pa.handL.x, pb.handL.x, su), y: lerp(pa.handL.y, pb.handL.y, su) },
      handR: { x: lerp(pa.handR.x, pb.handR.x, su), y: lerp(pa.handR.y, pb.handR.y, su) },
      bendL: pa.bendL, bendR: pa.bendR,
      gripL: su < 0.5 ? pa.gripL : pb.gripL,
      fistL: su < 0.5 ? pa.fistL : pb.fistL,
      fistR: su < 0.5 ? pa.fistR : pb.fistR,
      pointL: su < 0.5 ? pa.pointL : pb.pointL,
      pointR: su < 0.5 ? pa.pointR : pb.pointR,
      rotL: pa.rotL ?? pb.rotL,
      beanieOn: pb.beanieOn, hideArms: pb.hideArms,
    };
  }

  private drawScene(ctx: CanvasRenderingContext2D, t: number) {
    this.drawRoom(ctx);
    this.drawTable(ctx);

    const pose = this.poseAt(t);
    const x = CHAR_X;
    const hipY = HIP_Y + pose.hipDrop;
    const arms = this.computeArms(pose, x, hipY);
    const ball = this.ballAt(t, arms.r, pose);

    this.drawShadow(ctx, x, hipY);
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'body');
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'head');
    this.drawLauncher(ctx, ball, t);
    this.drawBin(ctx, t);
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'hands');
    this.drawBinBalls(ctx, t);
    if (!pose.beanieOn) this.drawFlyingBeanie(ctx, t);
  }

  private drawRoom(ctx: CanvasRenderingContext2D) {
    // Wall
    ctx.fillStyle = WALL;
    ctx.fillRect(0, 0, WIDTH, WALL_END);
    ctx.strokeStyle = WALL_LINE; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const y = WALL_END / 6 * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke();
    }
    // Baseboard
    ctx.fillStyle = BASEBOARD;
    ctx.fillRect(0, WALL_END, WIDTH, 22);
    ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, WALL_END); ctx.lineTo(WIDTH, WALL_END); ctx.stroke();

    // Floor planks
    ctx.fillStyle = FLOOR;
    ctx.fillRect(0, WALL_END + 22, WIDTH, HEIGHT);
    for (let i = 0; i < 8; i++) {
      const y = WALL_END + 22 + i * 80;
      ctx.fillStyle = i % 2 === 0 ? FLOOR : shade(FLOOR, -0.06);
      ctx.fillRect(0, y, WIDTH, 80);
      ctx.strokeStyle = FLOOR_LINE; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke();
    }
  }

  private drawTable(ctx: CanvasRenderingContext2D) {
    // Table slab
    ctx.fillStyle = TABLE_TOP; ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(TABLE_L, TABLE_Y, TABLE_R - TABLE_L, TABLE_SLAB, 8); ctx.fill(); ctx.stroke();
    // Grain
    ctx.strokeStyle = TABLE_GRAIN; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const y = TABLE_Y + 12 + i * 10;
      ctx.beginPath(); ctx.moveTo(TABLE_L + 10, y); ctx.lineTo(TABLE_R - 10, y); ctx.stroke();
    }
    // Legs
    this.drawLeg(ctx, LEG_NEAR_X, false);
    this.drawLeg(ctx, LEG_FAR_X, true);
  }

  private drawLeg(ctx: CanvasRenderingContext2D, cx: number, far: boolean) {
    const top = TABLE_Y + TABLE_SLAB;
    ctx.fillStyle = far ? TABLE_DEEP : TABLE_WOOD;
    ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(cx - LEG_W / 2, top, LEG_W, FLOOR_Y - top, 7); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = shade(far ? TABLE_DEEP : TABLE_WOOD, -0.16); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 7, top + 14); ctx.lineTo(cx - 7, FLOOR_Y - 14); ctx.stroke();
  }

  private drawLauncher(ctx: CanvasRenderingContext2D, ball: BallState, t: number) {
    ctx.save();
    // Base
    ctx.fillStyle = LAUNCHER_BROWN; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(LAUNCHER_X - LAUNCHER_W / 2, LAUNCHER_Y - LAUNCHER_H, LAUNCHER_W, LAUNCHER_H, 4); ctx.fill(); ctx.stroke();
    // Grain
    ctx.strokeStyle = LAUNCHER_DARK; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const y = LAUNCHER_Y - LAUNCHER_H + 6 + i * 6;
      ctx.beginPath(); ctx.moveTo(LAUNCHER_X - LAUNCHER_W / 2 + 4, y); ctx.lineTo(LAUNCHER_X + LAUNCHER_W / 2 - 4, y); ctx.stroke();
    }
    // Anchors
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(BAND_ANCHOR_L, LAUNCHER_Y - 4, 6, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(BAND_ANCHOR_R, LAUNCHER_Y - 4, 6, 0, TAU); ctx.fill();

    // Rubber band - draw based on scene
    if (t < 24.0) {
      const pullBack = this.getBandPullBack(t);
      const bandY = BAND_Y - pullBack;
      // Left strand
      ctx.strokeStyle = RUBBER_BAND; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(BAND_ANCHOR_L, LAUNCHER_Y - 4); ctx.lineTo(LAUNCHER_X - 10, bandY); ctx.stroke();
      // Right strand
      ctx.beginPath(); ctx.moveTo(BAND_ANCHOR_R, LAUNCHER_Y - 4); ctx.lineTo(LAUNCHER_X + 10, bandY); ctx.stroke();
      // Center connector
      ctx.beginPath(); ctx.moveTo(LAUNCHER_X - 10, bandY); ctx.lineTo(LAUNCHER_X + 10, bandY); ctx.stroke();

      // Ball in pouch
      if (ball.visible && !ball.inBin && t < 17.0) {
        ctx.save(); ctx.translate(LAUNCHER_X, bandY);
        ctx.fillStyle = PAPER_WHITE; ctx.strokeStyle = INK; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, BALL_R, 0, TAU); ctx.fill(); ctx.stroke();
        // Crumple lines
        ctx.strokeStyle = PAPER_SHADOW; ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          const a = i * 2.1; ctx.beginPath(); ctx.arc(0, 0, BALL_R * 0.7, a, a + 0.8); ctx.stroke();
        }
        ctx.restore();
      }
    }

    ctx.restore();
  }

  private getBandPullBack(t: number): number {
    // Scene 1: slight tension
    if (t < 5.0) return 0;
    // Scene 2: pulls back then releases
    if (t < 11.0) {
      if (t < 6.0) return lerp(0, 80, (t - 5.0) / 1.0);
      if (t < 6.5) return lerp(80, 0, (t - 6.0) / 0.5);
      return 0;
    }
    // Scene 3: pulls back lower then releases
    if (t < 17.0) {
      if (t < 12.5) return lerp(0, 50, (t - 11.5) / 1.0);
      if (t < 13.2) return lerp(50, 0, (t - 12.5) / 0.7);
      return 0;
    }
    // Scene 4: pulls back perfect then releases
    if (t < 24.0) {
      if (t < 19.0) return lerp(0, 90, (t - 17.5) / 1.5);
      if (t < 19.5) return lerp(90, 0, (t - 19.0) / 0.5);
      return 0;
    }
    return 0;
  }

  private drawBin(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    // Bin body
    const tilt = t >= 26.0 ? Math.min(1, (t - 26.0) / 2.0) * Math.PI / 2.5 : 0;
    const binX = BIN_X + (t >= 27.5 ? (t - 27.5) * 40 : 0);
    const binY = BIN_BASE_Y + (t >= 27.5 ? (t - 27.5) * 20 : 0);

    ctx.translate(binX, binY);
    ctx.rotate(tilt);

    // Outer
    ctx.fillStyle = BIN_BLUE; ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(-BIN_W / 2, -BIN_H, BIN_W, BIN_H, 8); ctx.fill(); ctx.stroke();
    // Rim
    ctx.fillStyle = BIN_BLUE_LIGHT;
    ctx.beginPath(); ctx.roundRect(-BIN_W / 2, -BIN_H, BIN_W, BIN_RIM_H, 4); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-BIN_W / 2, -BIN_H + BIN_RIM_H); ctx.lineTo(BIN_W / 2, -BIN_H + BIN_RIM_H); ctx.stroke();
    // Inner shadow
    ctx.fillStyle = shade(BIN_BLUE_DEEP, -0.1);
    ctx.beginPath(); ctx.roundRect(-BIN_INNER_W / 2, -BIN_H + BIN_RIM_H, BIN_INNER_W, BIN_H - BIN_RIM_H, 4); ctx.fill();

    ctx.restore();
  }

  private drawBinBalls(ctx: CanvasRenderingContext2D, t: number) {
    // Scene 5: bin tips, balls spill
    if (t >= 27.0) {
      const spillProgress = clamp((t - 27.0) / 3.0, 0, 1);
      const tilt = Math.min(1, (t - 26.0) / 2.0) * Math.PI / 2.5;
      const binCX = BIN_X + (t >= 27.5 ? (t - 27.5) * 40 : 0);
      const binCY = BIN_BASE_Y + (t >= 27.5 ? (t - 27.5) * 20 : 0);

      for (let i = 0; i < BIN_BALL_COUNT; i++) {
        const base = BIN_BALL_POS[i];
        const relX = base.x - BIN_X;
        const relY = base.y - BIN_BASE_Y;
        // Rotate around bin center
        const rotX = Math.cos(tilt) * relX - Math.sin(tilt) * relY;
        const rotY = Math.sin(tilt) * relX + Math.cos(tilt) * relY;
        // Spill out
        const spillX = rotX + (t >= 27.5 ? (t - 27.5) * 60 : 0) * (i % 2 === 0 ? 1 : -1);
        const spillY = rotY + (t >= 27.5 ? (t - 27.5) * 30 : 0);
        const x = binCX + spillX;
        const y = binCY + spillY;

        ctx.fillStyle = PAPER_WHITE; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(x, y, BIN_BALL_R, 0, TAU); ctx.fill(); ctx.stroke();
      }
    }
  }

  private computeArms(pose: Pose, cx: number, hipY: number): { l: Arm; r: Arm } {
    const shoulderY = hipY - 170;
    const shoulderX = cx;
    const armLen = 180;

    // Left arm
    const targetL = pose.handL;
    const dxL = targetL.x - shoulderX;
    const dyL = targetL.y - shoulderY;
    const distL = Math.hypot(dxL, dyL);
    const clampedL = Math.min(distL, armLen);
    const angleL = Math.atan2(dyL, dxL);
    const elbowLx = shoulderX + Math.cos(angleL) * clampedL * 0.55;
    const elbowLy = shoulderY + Math.sin(angleL) * clampedL * 0.55;
    const wristLx = shoulderX + Math.cos(angleL) * clampedL;
    const wristLy = shoulderY + Math.sin(angleL) * clampedL;

    // Right arm
    const targetR = pose.handR;
    const dxR = targetR.x - shoulderX;
    const dyR = targetR.y - shoulderY;
    const distR = Math.hypot(dxR, dyR);
    const clampedR = Math.min(distR, armLen);
    const angleR = Math.atan2(dyR, dxR);
    const elbowRx = shoulderX + Math.cos(angleR) * clampedR * 0.55;
    const elbowRy = shoulderY + Math.sin(angleR) * clampedR * 0.55;
    const wristRx = shoulderX + Math.cos(angleR) * clampedR;
    const wristRy = shoulderY + Math.sin(angleR) * clampedR;

    return {
      l: { sx: shoulderX, sy: shoulderY, ex: elbowLx, ey: elbowLy, hx: wristLx, hy: wristLy },
      r: { sx: shoulderX, sy: shoulderY, ex: elbowRx, ey: elbowRy, hx: wristRx, hy: wristRy },
    };
  }

  private drawShadow(ctx: CanvasRenderingContext2D, cx: number, hipY: number) {
    ctx.fillStyle = 'rgba(20,20,20,0.12)';
    ctx.beginPath(); ctx.ellipse(cx, FLOOR_Y - 8, 70, 14, 0, 0, TAU); ctx.fill();
  }

  private drawStickman(ctx: CanvasRenderingContext2D, cx: number, hipY: number, pose: Pose, arms: { l: Arm; r: Arm }, t: number, layer: 'body' | 'head' | 'hands') {
    if (layer === 'body') {
      // Torso
      const shoulderY = hipY - 170;
      ctx.fillStyle = SHIRT; ctx.strokeStyle = INK; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 50 - pose.stance, hipY);
      ctx.lineTo(cx - 60 - pose.stance, shoulderY + 20);
      ctx.lineTo(cx + 60 + pose.stance, shoulderY + 20);
      ctx.lineTo(cx + 50 + pose.stance, hipY);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Trousers
      ctx.fillStyle = TROUSER; ctx.strokeStyle = INK; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 30 - pose.stance, hipY);
      ctx.lineTo(cx - 35 - pose.stance, FLOOR_Y - 20);
      ctx.lineTo(cx + 35 + pose.stance, FLOOR_Y - 20);
      ctx.lineTo(cx + 30 + pose.stance, hipY);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Shoes
      this.drawShoe(ctx, cx - 35 - pose.stance, FLOOR_Y - 20, 0);
      this.drawShoe(ctx, cx + 35 + pose.stance, FLOOR_Y - 20, 0);

      // Arms
      const drawLimb = (arm: Arm, isLeft: boolean) => {
        ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(arm.sx, arm.sy); ctx.lineTo(arm.ex, arm.ey); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(arm.ex, arm.ey); ctx.lineTo(arm.hx, arm.hy); ctx.stroke();
        ctx.strokeStyle = SHIRT; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(arm.sx, arm.sy); ctx.lineTo(arm.ex, arm.ey); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(arm.ex, arm.ey); ctx.lineTo(arm.hx, arm.hy); ctx.stroke();

        // Sleeves
        ctx.fillStyle = SHIRT; ctx.strokeStyle = INK; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(arm.ex, arm.ey, 18, 12, 0, 0, TAU); ctx.fill(); ctx.stroke();
      };
      drawLimb(arms.l, true); drawLimb(arms.r, false);

    } else if (layer === 'head') {
      const head = this.headPoint(pose);
      this.drawHead(ctx, head.x, head.y, pose, t, hipY - 170, cx);
    } else {
      // Hands overlay
      if (pose.gripL) {
        drawHand(ctx, arms.l, { side: 'left', pose: 'grip', layer: 'overlay' });
      }
      drawHand(ctx, arms.r, { side: 'right', pose: 'grip', layer: 'overlay' });
      if (pose.pointL) { /* pointing hand drawn in body layer */ }
    }
  }

  private headPoint(pose: Pose): Pt {
    const shoulderY = HIP_Y - 170 + pose.hipDrop;
    return { x: CHAR_X, y: shoulderY - 140 - pose.headDrop };
  }

  private drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, pose: Pose, t: number, shoulderY: number, bodyTopX: number) {
    const r = HEAD_R;
    void shoulderY; void bodyTopX;

    ctx.save(); ctx.translate(cx, cy); ctx.rotate(pose.headTilt);

    // Head
    ctx.fillStyle = WHITE; ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();

    if (pose.beanieOn) this.drawBeanieShape(ctx, 0, 0);

    const eyeShiftY = pose.look === 'down' ? 7 : pose.look === 'up' ? -7 : 0;
    const eyeShiftX = pose.look === 'right' ? 7 : pose.look === 'left' ? -7 : 0;
    const eyeY = 8 + eyeShiftY;
    const eyeDX = 26;
    const fx = pose.headTurn + eyeShiftX;

    ctx.strokeStyle = INK; ctx.fillStyle = INK;

    if (pose.eye === 'shut') {
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath(); ctx.arc(fx + side * eyeDX, eyeY + 8, 14, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      }
    } else if (pose.eye === 'happy') {
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath(); ctx.arc(fx + side * eyeDX, eyeY + 6, 14, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
      }
    } else if (pose.eye === 'cross') {
      for (const side of [-1, 1]) {
        ctx.beginPath(); ctx.ellipse(fx + side * 16, eyeY + 2, 9.5, 13, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(fx + side * 16 - 2, eyeY - 3, 2.4, 0, TAU); ctx.fill();
        ctx.fillStyle = INK;
      }
    } else {
      const eyeH = pose.eye === 'wide' ? 30 : pose.eye === 'squint' ? 8 : 20;
      for (const side of [-1, 1]) {
        ctx.beginPath(); ctx.ellipse(fx + side * eyeDX, eyeY, 10, eyeH / 2, 0, 0, TAU); ctx.fill();
      }
    }

    // Brows
    ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = 'round';
    const browY = -12; const twitch = t >= 28.6 && t < 29.4 ? Math.sin(t * 24) * 2.5 : 0;
    ctx.beginPath();
    if (pose.brow === 'angry' || pose.brow === 'determined') {
      ctx.moveTo(fx - 42, browY - 8); ctx.lineTo(fx - 12, browY + 8 + twitch);
      ctx.moveTo(fx + 42, browY - 8); ctx.lineTo(fx + 12, browY + 8 - twitch);
    } else if (pose.brow === 'raised') {
      ctx.moveTo(fx - 42, browY - 12); ctx.lineTo(fx - 12, browY - 10);
      ctx.moveTo(fx + 42, browY - 12); ctx.lineTo(fx + 12, browY - 10);
    } else if (pose.brow === 'sad') {
      ctx.moveTo(fx - 42, browY + 8); ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY + 8); ctx.lineTo(fx + 12, browY - 8);
    } else if (pose.brow === 'cocky') {
      ctx.moveTo(fx - 42, browY - 8); ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY - 2); ctx.lineTo(fx + 12, browY + 4);
    } else if (pose.brow === 'uneven') {
      ctx.moveTo(fx - 42, browY - 15); ctx.lineTo(fx - 12, browY - 10);
      ctx.moveTo(fx + 42, browY + 8); ctx.lineTo(fx + 12, browY + 1);
    } else {
      ctx.moveTo(fx - 42, browY - 4); ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY - 4); ctx.lineTo(fx + 12, browY - 8);
    }
    ctx.stroke();

    // Mouth
    ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 6;
    const my = 40; ctx.beginPath();
    if (pose.mouth === 'smile') { ctx.arc(0, my, 22, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    else if (pose.mouth === 'grin') { ctx.arc(0, my + 4, 28, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); }
    else if (pose.mouth === 'bigsmile') { ctx.arc(0, my + 6, 36, Math.PI * 1.0, Math.PI * 2.0); ctx.stroke(); }
    else if (pose.mouth === 'frown') { ctx.arc(0, my + 18, 22, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke(); }
    else if (pose.mouth === 'grit') { ctx.moveTo(-18, my); ctx.lineTo(18, my); ctx.stroke(); }
    else if (pose.mouth === 'smirk') { ctx.moveTo(-20, my + 2); ctx.quadraticCurveTo(0, my + 14, 20, my + 2); ctx.stroke(); }
    else if (pose.mouth === 'o') { ctx.ellipse(0, my + 2, 10, 14, 0, 0, TAU); ctx.stroke(); }
    else { ctx.moveTo(-16, my); ctx.lineTo(16, my); ctx.stroke(); }

    ctx.restore();
  }

  private drawBeanieShape(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.fillStyle = BEANIE; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 65, cy - 10);
    ctx.bezierCurveTo(cx - 65, cy - 50, cx + 65, cy - 50, cx + 65, cy - 10);
    ctx.lineTo(cx + 65, cy + 8);
    ctx.lineTo(cx - 65, cy + 8);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Pom
    ctx.fillStyle = BEANIE_POM; ctx.strokeStyle = BEANIE_DEEP; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy - 65, 14, 0, TAU); ctx.fill(); ctx.stroke();
  }

  private drawShoe(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = SHOE; ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(-32, -13, 64, 26, 11); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.roundRect(-24, -8, 14, 6, 3); ctx.fill();
    ctx.restore();
  }

  private drawFlyingBeanie(ctx: CanvasRenderingContext2D, t: number) {
    const head = this.headPoint(this.poseAt(t));
    const keys: { t: number; x: number; y: number; rot: number }[] = [
      { t: 26.8, x: head.x, y: head.y, rot: -0.2 },
      { t: 27.2, x: head.x + 22, y: head.y - 150, rot: -2.2 },
      { t: 27.8, x: head.x + 48, y: head.y - 235, rot: -4.6 },
      { t: 28.5, x: head.x + 55, y: head.y - 250, rot: -6.0 },
      { t: 29.2, x: head.x + 38, y: head.y - 192, rot: -6.6 },
      { t: 29.7, x: head.x + 16, y: head.y - 96, rot: -6.85 },
      { t: 30.0, x: head.x + 2, y: head.y - 10, rot: -TAU },
    ];
    let a = keys[0], b = keys[0];
    if (t <= keys[0].t) { a = keys[0]; b = keys[0]; }
    else if (t >= keys[keys.length - 1].t) { a = keys[keys.length - 1]; b = a; }
    else { for (let i = 0; i < keys.length - 1; i++) { if (t >= keys[i].t && t <= keys[i + 1].t) { a = keys[i]; b = keys[i + 1]; break; } } }
    const u = (b.t === a.t) ? 0 : clamp((t - a.t) / (b.t - a.t), 0, 1);
    const x = lerp(a.x, b.x, u); const y = lerp(a.y, b.y, u); const rot = lerp(a.rot, b.rot, u);

    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = BEANIE; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-55, -10); ctx.bezierCurveTo(-55, -40, 55, -40, 55, -10); ctx.lineTo(55, 5); ctx.lineTo(-55, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = BEANIE_POM; ctx.strokeStyle = BEANIE_DEEP; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -55, 12, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  private ballAt(t: number, armR: Arm, pose: Pose): BallState {
    // Scene 1: in launcher
    if (t < 5.0) return ballInLauncher();

    // Scene 2: launches high
    if (t < 11.0) {
      if (t < 6.0) return ballInLauncher();
      if (t < 6.5) {
        const u = (t - 6.0) / 0.5;
        return ballFlying(
          bez(LAUNCHER_X, 800, 1000, u),
          bez(BALL_REST_Y, 600, 400, u),
          u * 20
        );
      }
      if (t < 8.0) {
        const u = (t - 6.5) / 1.5;
        return ballFlying(
          bez(1000, 1200, 1300, u),
          bez(400, 300, 350, u),
          20 + u * 10
        );
      }
      if (t < 11.0) {
        // Hits wall, falls
        return ballFlying(1300, 350 + (t - 8.0) * 50, 30);
      }
    }

    // Scene 3: launches low
    if (t < 17.0) {
      if (t < 13.0) return ballInLauncher();
      if (t < 13.5) {
        const u = (t - 13.0) / 0.5;
        return ballFlying(
          bez(LAUNCHER_X, 700, 900, u),
          bez(BALL_REST_Y, 1000, 1100, u),
          u * 15
        );
      }
      if (t < 15.0) {
        const u = (t - 13.5) / 1.5;
        return ballFlying(
          bez(900, 1100, 1300, u),
          bez(1100, 1250, 1350, u),
          15 + u * 10
        );
      }
      if (t < 17.0) {
        // Hits floor, bounces, rolls under bin
        return ballFlying(1300, 1350 + (t - 15.0) * 80, 25);
      }
    }

    // Scene 4: perfect shot
    if (t < 24.0) {
      if (t < 19.0) return ballInLauncher();
      if (t < 19.5) {
        const u = (t - 19.0) / 0.5;
        return ballFlying(
          bez(LAUNCHER_X, 600, 800, u),
          bez(BALL_REST_Y, 900, 700, u),
          u * 25
        );
      }
      if (t < 21.5) {
        const u = (t - 19.5) / 2.0;
        return ballFlying(
          bez(800, 950, 1200, u),
          bez(700, 500, 1000, u),
          25 + u * 15
        );
      }
      if (t < 22.5) {
        // Ball enters bin
        return ballInBin(0);
      }
      return ballInBin(0);
    }

    // Scene 5: bin tips, ball spills with others
    return ballInBin(0);
  }

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
    ctx.font = `900 ${size}px system-ui, sans-serif`;
    const width = ctx.measureText(line.text).width;
    if (width > 960) {
      size = Math.max(40, Math.floor((size * 960) / width));
      ctx.font = `900 ${size}px system-ui, sans-serif`;
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(12, size * 0.24);
    ctx.strokeText(line.text, 0, 0);
    ctx.fillStyle = WHITE;
    ctx.fillText(line.text, 0, 0);
    ctx.restore();
  }
}