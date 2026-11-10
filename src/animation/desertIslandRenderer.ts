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
const SAND = '#f5d6a4';
const SAND_DARK = '#e8c490';
const SAND_LINE = '#d4b078';
const PALM_TRUNK = '#8b5e3c';
const PALM_TRUNK_DARK = '#6b4226';
const PALM_LEAF = '#2d7d32';
const PALM_LEAF_DARK = '#1b5e20';
const PALM_LEAF_LIGHT = '#66bb6a';
const OCEAN_BLUE = '#1565c0';
const OCEAN_BLUE_DEEP = '#0d47a1';
const OCEAN_BLUE_LIGHT = '#42a5f5';
const OCEAN_WAVE = '#64b5f6';
const SKY_BLUE = '#81d4fa';
const SKY_BLUE_LIGHT = '#b3e5fc';
const CLOUD_WHITE = '#ffffff';
const COCONUT_BROWN = '#5d4037';
const COCONUT_BROWN_DARK = '#3e2723';
const WOOD_DARK = '#4e342e';
const WOOD_LIGHT = '#8d6e63';
const LEAF_GREEN = '#388e3c';
const LEAF_GREEN_DARK = '#2e7d32';
const FISH_SILVER = '#b0bec5';
const FISH_SILVER_DARK = '#90a4ae';
const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const BEANIE_POM = '#ff6b6b';
const SHIRT = '#ffd166';
const SHIRT_DEEP = '#e8b23f';
const TROUSER = '#2f5fa8';
const TROUSER_DEEP = '#22457c';
const SHOE = '#141414';

const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + Math.round(amt * 255)));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + Math.round(amt * 255)));
  const b = Math.min(255, Math.max(0, (n & 255) + Math.round(amt * 255)));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};

// --- world ---------------------------------------------------------------
const FLOOR_Y = 1580;
const WALL_END = 1440;
const HIP_Y = 1280;
const HEAD_R = 70;
const CHAR_X = 540;

const SAND_Y = 1500;
const OCEAN_Y = 1400;
const HORIZON_Y = 800;
const SKY_TOP = 0;

const ISLAND_CX = 540;
const ISLAND_W = 800;
const ISLAND_H = 600;

const PALM1_X = 200;
const PALM2_X = 880;
const PALM3_X = 600;
const PALM_BASE_Y = SAND_Y;
const PALM_H = 500;
const PALM_TRUNK_W = 30;

const COCONUT_R = 18;
const COCONUTS_ON_GROUND = [
  { x: 180, y: SAND_Y - 20 },
  { x: 220, y: SAND_Y - 15 },
  { x: 900, y: SAND_Y - 25 },
  { x: 940, y: SAND_Y - 10 },
];

const RAFT_X = 400;
const RAFT_Y = SAND_Y - 10;
const RAFT_W = 200;
const RAFT_H = 40;

const HUT_X = 700;
const HUT_Y = SAND_Y - 10;
const HUT_W = 200;
const HUT_H = 250;

const ROCK_X = 300;
const ROCK_Y = SAND_Y - 5;
const ROCK_W = 120;
const ROCK_H = 40;

const FISHING_ROCK_X = 300;
const FISHING_ROCK_Y = SAND_Y - 5;

const SOS_X = 540;
const SOS_Y = 1000;
const SOS_LETTER_W = 80;
const SOS_LETTER_H = 120;
const SOS_SPACING = 100;

const PLANE_X_START = -200;
const PLANE_Y = 400;
const PLANE_SPEED = 300;

const FALLING_COCO_X = 200;
const FALLING_COCO_START_Y = 300;

const BIN_X = 840;
const BIN_BASE_Y = SAND_Y;
const BIN_W = 160;
const BIN_H = 200;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

const bez = (a: number, b: number, c: number, t: number) =>
  (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;

const easeOutElastic = (t: number) => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
};

// --- camera keyframes ----------------------------------------------------
const CAM_KEYS = [
  { t: 0.0, x: 540, y: 1000, zoom: 1.0 },
  { t: 2.0, x: 540, y: 950, zoom: 1.05 },
  { t: 4.0, x: 540, y: 900, zoom: 1.1 },
  { t: 6.0, x: 540, y: 950, zoom: 1.05 },
  { t: 8.0, x: 600, y: 1100, zoom: 1.15 },
  { t: 10.0, x: 600, y: 1150, zoom: 1.2 },
  { t: 12.0, x: 400, y: 1150, zoom: 1.15 },
  { t: 14.0, x: 400, y: 1150, zoom: 1.1 },
  { t: 16.0, x: 400, y: 1150, zoom: 1.05 },
  { t: 18.0, x: 540, y: 900, zoom: 0.9 },
  { t: 20.0, x: 540, y: 850, zoom: 0.85 },
  { t: 22.0, x: 540, y: 850, zoom: 0.85 },
  { t: 24.0, x: 540, y: 900, zoom: 0.95 },
  { t: 26.0, x: 540, y: 950, zoom: 1.0 },
  { t: 28.0, x: 540, y: 1000, zoom: 1.05 },
  { t: 30.0, x: 540, y: 1050, zoom: 1.1 },
];

// Captions
interface CaptionLine { text: string; from: number; to: number; }
const CAPTIONS: CaptionLine[] = [
  { text: 'WHERE AM I?!', from: 0.0, to: 6.0 },
  { text: 'MY FIVE STAR HOTEL!', from: 6.0, to: 12.0 },
  { text: "I'M SUPPOSED TO EAT YOU!", from: 12.0, to: 18.0 },
  { text: 'FINALLY! SAVE ME!', from: 18.0, to: 24.0 },
  { text: 'RESCUE FAILED. AGAIN.', from: 24.0, to: 30.0 },
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

// --- ball state (for coconut/beanie physics) ---
interface PropState {
  x: number; y: number;
  spin: number;
  visible: boolean;
  falling?: boolean;
  bounce?: number;
}

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
  // Scene 1: No Way Home (0-6s)
  { t: 0.0 },
  { t: 0.8, p: { lean: 0.04, headTilt: 0.08, headTurn: 8 } },
  { t: 1.5, p: {
      lean: 0.05, headTilt: 0.08, headTurn: 8, brow: 'cocky',
      eye: 'squint', mouth: 'smirk', pointL: true,
      handL: { x: 588, y: 1094 }, handR: { x: 566, y: 1044 },
  }},
  { t: 2.5, p: { look: 'left', headTurn: -5, mouth: 'o' } },
  { t: 3.5, p: { look: 'right', headTurn: 5, mouth: 'o' } },
  { t: 4.5, p: {
      lean: -0.03, headTilt: 0.02, headTurn: 6, look: 'front',
      brow: 'raised', eye: 'wide', mouth: 'o',
      pointL: false, fistL: true, fistR: true,
      handL: { x: 470, y: 1130 }, handR: { x: 545, y: 1000 },
  }},
  { t: 5.0, p: { lean: 0.08, handL: { x: 505, y: 1112 }, handR: { x: 592, y: 1000 } } },

  // Scene 2: Building a Shelter (6-12s)
  { t: 6.3, p: {
      lean: 0.1, hipDrop: 10, headTilt: 0.05, headTurn: 10, look: 'down',
      brow: 'determined', eye: 'open', mouth: 'flat',
      fistL: false, pointL: false, gripL: true,
      handL: { x: 650, y: 1250 }, handR: { x: 600, y: 1200 },
  }},
  { t: 7.5, p: { hipDrop: 20, handL: { x: 680, y: 1280 }, handR: { x: 620, y: 1230 } } },
  { t: 8.5, p: {
      lean: -0.05, hipDrop: 5, headTilt: -0.05, headTurn: 0, look: 'front',
      brow: 'normal', eye: 'open', mouth: 'smile', gripL: false,
      handL: { x: 600, y: 1150 }, handR: { x: 700, y: 1150 },
  }},
  { t: 9.5, p: {
      lean: -0.1, hipDrop: -10, headTilt: -0.1, headTurn: 0,
      brow: 'raised', eye: 'happy', mouth: 'bigsmile',
      handL: { x: 550, y: 1050 }, handR: { x: 750, y: 1050 },
  }},
  { t: 10.0, p: {
      lean: 0.15, hipDrop: 30, headTilt: 0.2, headTurn: 0,
      brow: 'uneven', eye: 'wide', mouth: 'o',
      handL: { x: 500, y: 1200 }, handR: { x: 700, y: 1200 },
  }},
  { t: 10.5, p: {
      lean: 0, hipDrop: 40, headTilt: 0.3, headDrop: 20,
      brow: 'uneven', eye: 'shut', mouth: 'o',
      handL: { x: 480, y: 1250 }, handR: { x: 720, y: 1250 },
  }},
  { t: 11.0, p: {
      lean: -0.05, hipDrop: 20, headTilt: 0.1, headDrop: 10,
      brow: 'uneven', eye: 'wide', mouth: 'frown', beanieOn: true,
      handL: { x: 480, y: 1250 }, handR: { x: 720, y: 1250 },
  }},
  { t: 12.0, p: { lean: 0, hipDrop: 0, headTilt: 0, headDrop: 0 } },

  // Scene 3: The Fishing Disaster (12-18s)
  { t: 12.3, p: {
      lean: 0.05, hipDrop: 50, headTilt: 0.05, headTurn: 10, look: 'down',
      brow: 'normal', eye: 'open', mouth: 'flat', fistL: false,
      handL: { x: 350, y: 1400 }, handR: { x: 400, y: 1380 },
  }},
  { t: 13.5, p: { hipDrop: 60, handL: { x: 340, y: 1420 }, handR: { x: 390, y: 1400 } } },
  { t: 14.5, p: {
      lean: -0.1, hipDrop: 60, headTilt: -0.1, headTurn: 0,
      brow: 'raised', eye: 'wide', mouth: 'o',
      handL: { x: 330, y: 1380 }, handR: { x: 380, y: 1360 },
  }},
  { t: 15.0, p: {
      lean: -0.2, hipDrop: 70, headTilt: -0.2, headTurn: 0,
      brow: 'raised', eye: 'wide', mouth: 'o',
      handL: { x: 320, y: 1350 }, handR: { x: 370, y: 1330 },
  }},
  { t: 15.5, p: {
      lean: 0.1, hipDrop: 60, headTilt: 0.1, headTurn: 0,
      brow: 'uneven', eye: 'shut', mouth: 'o',
      handL: { x: 350, y: 1400 }, handR: { x: 400, y: 1380 },
  }},
  { t: 16.0, p: {
      lean: 0, hipDrop: 50, headTilt: 0, headDrop: 0, look: 'front',
      brow: 'angry', eye: 'squint', mouth: 'frown',
      handL: { x: 400, y: 1400 }, handR: { x: 450, y: 1380 },
  }},
  { t: 17.0, p: { hipDrop: 40, headTurn: 0, handL: { x: 420, y: 1420 }, handR: { x: 470, y: 1400 } } },
  { t: 18.0, p: { lean: 0, hipDrop: 0, headTilt: 0, headDrop: 0 } },

  // Scene 4: The Rescue Signal (18-24s)
  { t: 18.3, p: {
      lean: 0.1, hipDrop: 20, headTilt: 0.05, headTurn: -10, look: 'down',
      brow: 'determined', eye: 'open', mouth: 'flat', gripL: true,
      handL: { x: 450, y: 1300 }, handR: { x: 500, y: 1280 },
  }},
  { t: 19.5, p: { hipDrop: 25, handL: { x: 480, y: 1320 }, handR: { x: 530, y: 1300 } } },
  { t: 20.5, p: {
      lean: -0.05, hipDrop: 5, headTilt: -0.05, headTurn: 0, look: 'up',
      brow: 'raised', eye: 'wide', mouth: 'o', gripL: false,
      handL: { x: 450, y: 1150 }, handR: { x: 630, y: 1150 },
  }},
  { t: 21.0, p: {
      lean: -0.1, hipDrop: -5, headTilt: -0.1, headTurn: 0,
      brow: 'raised', eye: 'wide', mouth: 'bigsmile',
      handL: { x: 400, y: 1000 }, handR: { x: 680, y: 1000 },
  }},
  { t: 22.0, p: {
      lean: -0.15, hipDrop: -15, headTilt: -0.15, headTurn: 0,
      brow: 'raised', eye: 'wide', mouth: 'bigsmile',
      footLift: 30, handL: { x: 350, y: 950 }, handR: { x: 730, y: 950 },
  }},
  { t: 23.0, p: {
      lean: -0.1, hipDrop: -10, headTilt: -0.1, headTurn: 0,
      brow: 'raised', eye: 'wide', mouth: 'bigsmile',
      footLift: 20, handL: { x: 380, y: 980 }, handR: { x: 700, y: 980 },
  }},
  { t: 24.0, p: { lean: 0, hipDrop: 0, headTilt: 0, headDrop: 0, footLift: 0 } },

  // Scene 5: Worst Timing Ever (24-30s)
  { t: 24.3, p: {
      lean: -0.05, hipDrop: 0, headTilt: -0.05, headTurn: 0,
      brow: 'raised', eye: 'wide', mouth: 'bigsmile', beanieOn: true,
      handL: { x: 380, y: 1000 }, handR: { x: 700, y: 1000 },
  }},
  { t: 25.0, p: { headTurn: 5, handR: { x: 710, y: 990 } } },
  { t: 25.6, p: {
      lean: 0, hipDrop: 0, headTilt: 0, headTurn: 0,
      brow: 'uneven', eye: 'wide', mouth: 'o', beanieOn: false,
      handL: { x: 380, y: 1050 }, handR: { x: 700, y: 1050 },
  }},
  { t: 26.2, p: {
      lean: 0.05, hipDrop: 5, headTilt: 0.05, headTurn: 0,
      brow: 'uneven', eye: 'wide', mouth: 'o',
      handL: { x: 380, y: 1050 }, handR: { x: 700, y: 1050 },
  }},
  { t: 27.0, p: {
      lean: 0.02, hipDrop: 10, headTilt: 0.02, headTurn: -5,
      brow: 'sad', eye: 'squint', mouth: 'frown',
      handL: { x: 420, y: 1100 }, handR: { x: 660, y: 1100 },
  }},
  { t: 28.0, p: {
      lean: 0.05, hipDrop: 30, headTilt: 0.1, headTurn: -5,
      brow: 'sad', eye: 'squint', mouth: 'frown', footLift: 20,
      handL: { x: 450, y: 1200 }, handR: { x: 630, y: 1200 },
  }},
  { t: 29.0, p: {
      lean: 0.08, hipDrop: 50, headTilt: 0.15, headTurn: -5,
      brow: 'sad', eye: 'squint', mouth: 'frown', footLift: 40,
      handL: { x: 480, y: 1300 }, handR: { x: 600, y: 1300 },
  }},
  { t: 30.0, p: { lean: 0.1, hipDrop: 60, headTilt: 0.2, headTurn: -5 } },
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

export class DesertIslandRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  private readonly captions = CAPTIONS;

  // Scene state
  private hutBuilt = 0; // 0=none, 1=building, 2=built, 3=collapsing, 4=collapsed
  private hutCollapseProgress = 0;
  private leavesOnHead = false;
  private fishOnLine = false;
  private fishJumpProgress = 0;
  private splashProgress = 0;
  private sosBuilt = 0;
  private planeX = PLANE_X_START;
  private fallingCocoY = FALLING_COCO_START_Y;
  private fallingCocoVY = 0;
  private beaniePopProgress = 0;
  private beaniePop = false;
  private beanieX = 0;
  private beanieY = 0;
  private beanieRot = 0;
  private planeProgress = 0;

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    void config;
    const t = clamp(time, 0, 30);
    this.updateSceneState(t);
    this.setupCamera(ctx, t);
    this.drawScene(ctx, t);
    this.restoreCamera(ctx);
    this.drawCaptions(ctx, t);
  }

  private updateSceneState(t: number) {
    // Scene 2: Hut building
    if (t >= 6.0 && t < 12.0) {
      if (t < 7.0) this.hutBuilt = 1;
      else if (t < 9.5) this.hutBuilt = 2;
      else if (t < 10.0) this.hutBuilt = 3;
      else if (t < 11.0) {
        this.hutBuilt = 3;
        this.hutCollapseProgress = (t - 10.0) / 1.0;
        if (t >= 11.0) this.leavesOnHead = true;
      }
      else this.hutBuilt = 4;
    } else {
      this.hutBuilt = 0;
      this.hutCollapseProgress = 0;
      this.leavesOnHead = false;
    }

    // Scene 3: Fishing
    if (t >= 12.0 && t < 18.0) {
      if (t >= 14.5 && t < 15.5) this.fishOnLine = true;
      if (t >= 15.5 && t < 16.5) this.fishJumpProgress = (t - 15.5) / 1.0;
      if (t >= 15.6 && t < 16.6) this.splashProgress = (t - 15.6) / 1.0;
    } else {
      this.fishOnLine = false;
      this.fishJumpProgress = 0;
      this.splashProgress = 0;
    }

    // Scene 4: SOS building
    if (t >= 18.0 && t < 24.0) {
      if (t < 19.5) this.sosBuilt = 1;
      else if (t < 20.5) this.sosBuilt = 2;
      else if (t < 21.0) this.sosBuilt = 3;
      else this.sosBuilt = 3;
    } else {
      this.sosBuilt = 0;
    }

    // Scene 4-5: Plane
    if (t >= 21.0) {
      this.planeProgress = Math.min(1, (t - 21.0) / 9.0);
      this.planeX = PLANE_X_START + this.planeProgress * (WIDTH + 400);
    }

    // Scene 5: Falling coconut and beanie pop
    if (t >= 25.0 && t < 25.8) {
      if (t < 25.3) {
        this.fallingCocoY = FALLING_COCO_START_Y;
      } else if (t < 25.6) {
        const u = (t - 25.3) / 0.3;
        this.fallingCocoY = lerp(FALLING_COCO_START_Y, SAND_Y - 20, u);
      } else {
        const u = (t - 25.6) / 0.2;
        this.fallingCocoY = SAND_Y - 20 + Math.sin(u * Math.PI) * 10;
      }
    } else {
      this.fallingCocoY = FALLING_COCO_START_Y;
    }

    // The beanie pops off at 25.8 and stays on the sand for the final beat.
    if (t >= 25.8) {
      const u = clamp((t - 25.8) / 0.7, 0, 1);
      const crownY = HIP_Y - 380;
      const apexY = crownY - 170;
      const restY = SAND_Y - 42;
      this.beaniePop = true;
      this.beaniePopProgress = u;
      this.beanieX = CHAR_X + 55 * u;
      if (u < 0.45) {
        this.beanieY = lerp(crownY, apexY, easeOut(u / 0.45));
      } else {
        this.beanieY = lerp(apexY, restY, easeIn((u - 0.45) / 0.55));
      }
      this.beanieRot = u * TAU * 1.5;
    } else {
      this.beaniePop = false;
      this.beaniePopProgress = 0;
      this.beanieX = CHAR_X;
      this.beanieY = HIP_Y - 380;
      this.beanieRot = 0;
    }
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
      beanieOn: pa.beanieOn || pb.beanieOn, hideArms: pb.hideArms,
    };
  }

  private drawScene(ctx: CanvasRenderingContext2D, t: number) {
    this.drawBackground(ctx, t);
    this.drawIsland(ctx, t);
    this.drawProps(ctx, t);

    const pose = this.poseAt(t);
    const x = CHAR_X;
    const hipY = HIP_Y + pose.hipDrop;
    const arms = this.computeArms(pose, x, hipY);

    this.drawShadow(ctx, x, hipY);
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'body');
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'head');
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'hands');
    this.drawFlyingBeanie(ctx, t);

    // Scene 3: Splash overlay
    if (this.splashProgress > 0) {
      this.drawSplash(ctx, t);
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D, t: number) {
    // Sky
    const skyGrad = ctx.createLinearGradient(0, SKY_TOP, 0, HORIZON_Y);
    skyGrad.addColorStop(0, SKY_BLUE);
    skyGrad.addColorStop(1, SKY_BLUE_LIGHT);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, SKY_TOP, WIDTH, HORIZON_Y);

    // Clouds
    ctx.fillStyle = CLOUD_WHITE;
    const clouds = [
      { x: 150, y: 120, w: 120, h: 60 },
      { x: 500, y: 80, w: 180, h: 70 },
      { x: 850, y: 140, w: 140, h: 65 },
      { x: 1000, y: 220, w: 100, h: 50 },
    ];
    for (const c of clouds) {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, 0, 0, TAU);
      ctx.fill();
    }

    // Ocean
    const oceanGrad = ctx.createLinearGradient(0, OCEAN_Y, 0, FLOOR_Y);
    oceanGrad.addColorStop(0, OCEAN_BLUE_LIGHT);
    oceanGrad.addColorStop(0.5, OCEAN_BLUE);
    oceanGrad.addColorStop(1, OCEAN_BLUE_DEEP);
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, OCEAN_Y, WIDTH, FLOOR_Y - OCEAN_Y);

    // Waves
    ctx.strokeStyle = OCEAN_WAVE;
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const y = OCEAN_Y + 50 + i * 80;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= WIDTH; x += 50) {
      const wave = Math.sin((x + t * 220) * 0.02) * 15;
        ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }

    // Horizon line
    ctx.strokeStyle = OCEAN_BLUE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, HORIZON_Y);
    ctx.lineTo(WIDTH, HORIZON_Y);
    ctx.stroke();
  }

  private drawIsland(ctx: CanvasRenderingContext2D, t: number) {
    // Sand base
    ctx.fillStyle = SAND;
    ctx.beginPath();
    ctx.moveTo(0, SAND_Y);
    ctx.lineTo(WIDTH, SAND_Y);
    ctx.lineTo(WIDTH, FLOOR_Y);
    ctx.lineTo(0, FLOOR_Y);
    ctx.closePath();
    ctx.fill();

    // Sand texture lines
    ctx.strokeStyle = SAND_LINE;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const y = SAND_Y + 20 + i * 15;
      ctx.beginPath();
      ctx.moveTo(100, y);
      ctx.lineTo(WIDTH - 100, y);
      ctx.stroke();
    }

    // Palm trees
    this.drawPalm(ctx, PALM1_X, PALM_BASE_Y);
    this.drawPalm(ctx, PALM2_X, PALM_BASE_Y);
    this.drawPalm(ctx, PALM3_X, PALM_BASE_Y);

    // Coconuts on ground
    ctx.fillStyle = COCONUT_BROWN;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    for (const c of COCONUTS_ON_GROUND) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, COCONUT_R, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // Coconut detail
      ctx.strokeStyle = COCONUT_BROWN_DARK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x - 8, c.y - 5);
      ctx.lineTo(c.x + 8, c.y + 5);
      ctx.stroke();
    }

    // Driftwood
    ctx.fillStyle = WOOD_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(100, SAND_Y - 10, 80, 20, 4);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(950, SAND_Y - 15, 60, 15, 3);
    ctx.fill(); ctx.stroke();
  }

  private drawPalm(ctx: CanvasRenderingContext2D, cx: number, baseY: number) {
    // Trunk
    ctx.fillStyle = PALM_TRUNK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - PALM_TRUNK_W / 2, baseY);
    ctx.lineTo(cx - PALM_TRUNK_W / 2 + 5, baseY - PALM_H);
    ctx.lineTo(cx + PALM_TRUNK_W / 2 + 5, baseY - PALM_H);
    ctx.lineTo(cx + PALM_TRUNK_W / 2, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Trunk rings
    ctx.strokeStyle = PALM_TRUNK_DARK;
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const y = baseY - i * (PALM_H / 8);
      ctx.beginPath();
      ctx.moveTo(cx - 12, y);
      ctx.lineTo(cx + 12, y);
      ctx.stroke();
    }

    // Fronds
    ctx.fillStyle = PALM_LEAF;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    const frondCount = 6;
    for (let i = 0; i < frondCount; i++) {
      const angle = -Math.PI / 2 + (i / (frondCount - 1)) * Math.PI * 0.8;
      const length = 180;
      const cx1 = cx + Math.cos(angle) * 20;
      const cy1 = baseY - PALM_H + Math.sin(angle) * 20;
      const cx2 = cx + Math.cos(angle) * (length * 0.6);
      const cy2 = baseY - PALM_H + Math.sin(angle) * (length * 0.6);
      const cx3 = cx + Math.cos(angle) * length;
      const cy3 = baseY - PALM_H + Math.sin(angle) * length;

      ctx.beginPath();
      ctx.moveTo(cx1, cy1);
      ctx.quadraticCurveTo(cx2, cy2, cx3, cy3);
      ctx.quadraticCurveTo(cx2 + 20, cy2, cx1, cy1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center vein
      ctx.strokeStyle = PALM_LEAF_DARK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx1, cy1);
      ctx.quadraticCurveTo(cx2, cy2, cx3, cy3);
      ctx.stroke();
    }

    // Coconuts at top
    ctx.fillStyle = COCONUT_BROWN;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const angle = -Math.PI / 2 + (i / 2) * Math.PI * 0.6;
      const cocoX = cx + Math.cos(angle) * 30;
      const cy = baseY - PALM_H + Math.sin(angle) * 30;
      ctx.beginPath();
      ctx.arc(cocoX, cy, COCONUT_R, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  }

  private drawProps(ctx: CanvasRenderingContext2D, t: number) {
    // Scene 1: Raft
    if (t < 6.0) {
      this.drawRaft(ctx);
    }

    // Scene 2: Hut
    if (t >= 6.0 && t < 12.0) {
      this.drawHut(ctx, t);
    }

    // Scene 3: Fishing rod
    if (t >= 12.0 && t < 18.0) {
      this.drawFishingRod(ctx, t);
      if (this.fishOnLine) this.drawFish(ctx, t);
    }

    // Scene 4-5: Plane
    if (t >= 21.0) {
      this.drawPlane(ctx, t);
    }

    // Scene 5: Falling coconut
    if (t >= 25.0 && t < 26.5) {
      if (t < 25.3) {
        // Coconut at top of tree
        ctx.fillStyle = COCONUT_BROWN;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(FALLING_COCO_X, this.fallingCocoY, COCONUT_R, 0, TAU);
        ctx.fill();
        ctx.stroke();
      } else if (t < 25.8) {
        // Falling
        ctx.fillStyle = COCONUT_BROWN;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(FALLING_COCO_X, this.fallingCocoY, COCONUT_R, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
    }

    // SOS coconuts (Scene 4-5)
    if (t >= 18.0) {
      this.drawSOSCoconuts(ctx);
    }
  }

  private drawRaft(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = WOOD_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(RAFT_X - RAFT_W / 2, RAFT_Y - RAFT_H / 2, RAFT_W, RAFT_H, 6);
    ctx.fill();
    ctx.stroke();

    // Planks
    ctx.strokeStyle = WOOD_LIGHT;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const x = RAFT_X - RAFT_W / 2 + 10 + i * 45;
      ctx.beginPath();
      ctx.moveTo(x, RAFT_Y - RAFT_H / 2);
      ctx.lineTo(x, RAFT_Y + RAFT_H / 2);
      ctx.stroke();
    }
  }

  private drawHut(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    const cx = HUT_X;
    const baseY = HUT_Y;
    const w = HUT_W;
    const h = HUT_H;

    // Frame
    ctx.strokeStyle = WOOD_DARK;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Base
    ctx.moveTo(cx - w / 2, baseY);
    ctx.lineTo(cx + w / 2, baseY);
    // Sides
    if (this.hutBuilt >= 1) {
      const sideProgress = this.hutBuilt === 1 ? 0.5 : 1;
      ctx.moveTo(cx - w / 2, baseY);
      ctx.lineTo(cx - w / 2, baseY - h * sideProgress);
      ctx.moveTo(cx + w / 2, baseY);
      ctx.lineTo(cx + w / 2, baseY - h * sideProgress);
    }
    // Top
    if (this.hutBuilt >= 2) {
      ctx.moveTo(cx - w / 2, baseY - h);
      ctx.lineTo(cx + w / 2, baseY - h);
    }
    ctx.stroke();

    // Collapse
    if (this.hutBuilt === 3) {
      ctx.save();
      const u = this.hutCollapseProgress;
      const angle = u * Math.PI / 4;
      const fallX = Math.sin(angle) * 100;
      const fallY = (1 - Math.cos(angle)) * 50;

      ctx.translate(fallX, fallY);
      ctx.rotate(-angle * 0.5);

      // Leaves falling
      ctx.fillStyle = PALM_LEAF;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const leafX = cx - w / 2 + (i % 3) * (w / 2);
        const leafY = baseY - h + (i < 3 ? 0 : -30) + u * 200;
        ctx.save();
        ctx.translate(leafX, leafY);
        ctx.rotate(u * Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(40, 60);
        ctx.lineTo(-40, 60);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    // Leaves on roof
    if (this.hutBuilt >= 2 && this.hutBuilt < 4) {
      ctx.fillStyle = PALM_LEAF;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const x = cx - w / 2 + 10 + i * (w / 5);
        const y = baseY - h + 10;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20, y - 30);
        ctx.lineTo(x + 40, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Collapsed leaves on ground
    if (this.hutBuilt >= 4) {
      ctx.fillStyle = PALM_LEAF;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const x = cx - w / 2 + (i % 4) * (w / 3);
        const y = baseY - 10;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20, y - 30);
        ctx.lineTo(x + 40, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  private drawFishingRod(ctx: CanvasRenderingContext2D, t: number) {
    const pose = this.poseAt(t);
    const x = CHAR_X;
    const hipY = HIP_Y + pose.hipDrop;
    const arms = this.computeArms(pose, CHAR_X, hipY);

    // Rod
    const rodBaseX = arms.r.hx;
    const rodBaseY = arms.r.hy;
    const rodTipX = FISHING_ROCK_X + 200;
    const rodTipY = OCEAN_Y + 50;

    ctx.strokeStyle = WOOD_DARK;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(rodBaseX, rodBaseY);
    ctx.quadraticCurveTo(
      (rodBaseX + rodTipX) / 2, Math.min(rodBaseY, rodTipY) - 100,
      rodTipX, rodTipY
    );
    ctx.stroke();

    // Line
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(rodTipX, rodTipY);
    ctx.lineTo(rodTipX, OCEAN_Y + 100);
    ctx.stroke();
    ctx.setLineDash([]);

    // Hook
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(rodTipX, OCEAN_Y + 100, 4, 0, TAU);
    ctx.fill();
  }

  private drawFish(ctx: CanvasRenderingContext2D, t: number) {
    const u = this.fishJumpProgress;
    const startX = 500;
    const startY = OCEAN_Y + 100;
    const endX = 500;
    const endY = OCEAN_Y - 100;

    const fishX = lerp(startX, endX, u);
    const fishY = lerp(startY, endY, easeOut(u)) - Math.sin(u * Math.PI) * 80;

    ctx.save();
    ctx.translate(fishX, fishY);
    ctx.rotate(u * Math.PI * 0.5);

    // Body
    ctx.fillStyle = FISH_SILVER;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 12, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Tail
    ctx.fillStyle = FISH_SILVER_DARK;
    ctx.beginPath();
    ctx.moveTo(-25, 0);
    ctx.lineTo(-45, -15);
    ctx.lineTo(-45, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(15, -3, 4, 0, TAU);
    ctx.fill();

    ctx.restore();

    // Splash
    if (this.splashProgress > 0) {
      this.drawSplashAt(ctx, CHAR_X + 50, OCEAN_Y, this.splashProgress);
    }
  }

  private drawSplashAt(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number) {
    ctx.save();
    ctx.translate(x, y);
    const drops = 8;
    for (let i = 0; i < drops; i++) {
      const angle = (i / drops) * TAU;
      const dist = progress * 60;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist * 0.5;
      ctx.fillStyle = `rgba(100,181,246,${1 - progress})`;
      ctx.beginPath();
      ctx.arc(dx, dy, 5 * (1 - progress), 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawSplash(ctx: CanvasRenderingContext2D, t: number) {
    // Draw splash on character's face
    this.drawSplashAt(ctx, CHAR_X, HIP_Y - 200, this.splashProgress);
  }

  private drawSOSCoconuts(ctx: CanvasRenderingContext2D) {
    const progress = this.sosBuilt;
    if (progress === 0) return;

    const letters = ['S', 'O', 'S'];
    const totalW = letters.length * SOS_LETTER_W + (letters.length - 1) * SOS_SPACING;
    const startX = SOS_X - totalW / 2;

    ctx.fillStyle = COCONUT_BROWN;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;

    for (let li = 0; li < letters.length; li++) {
      const letterX = startX + li * (SOS_LETTER_W + SOS_SPACING);
      const letterY = SOS_Y;
      const letter = letters[li];

      if (progress >= 1 || (progress === 1 && li === 0) || (progress === 2 && li <= 1)) {
        this.drawLetterCoconuts(ctx, letter, letterX, letterY, SOS_LETTER_W, SOS_LETTER_H);
      }
    }
  }

  private drawLetterCoconuts(ctx: CanvasRenderingContext2D, letter: string, cx: number, cy: number, w: number, h: number) {
    const coconutR = 12;
    const cols = 3;
    const rows = 5;
    const spacingX = w / (cols + 1);
    const spacingY = h / (rows + 1);

    const patterns: Record<string, boolean[][]> = {
      'S': [
        [true, true, true],
        [true, false, false],
        [true, true, true],
        [false, false, true],
        [true, true, true],
      ],
      'O': [
        [true, true, true],
        [true, false, true],
        [true, false, true],
        [true, false, true],
        [true, true, true],
      ],
    };

    const pattern = patterns[letter] || patterns['O'];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (pattern[row][col]) {
          const x = cx - w / 2 + (col + 1) * spacingX;
          const y = cy - h / 2 + (row + 1) * spacingY;
          ctx.fillStyle = COCONUT_BROWN;
          ctx.strokeStyle = INK;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, coconutR, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      }
    }
  }

  private drawPlane(ctx: CanvasRenderingContext2D, t: number) {
    const x = this.planeX;
    const y = PLANE_Y;

    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;

    // Body
    ctx.beginPath();
    ctx.ellipse(x, y, 40, 12, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Wings
    ctx.beginPath();
    ctx.moveTo(x - 50, y);
    ctx.lineTo(x - 20, y - 8);
    ctx.lineTo(x - 20, y + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 50, y);
    ctx.lineTo(x + 20, y - 8);
    ctx.lineTo(x + 20, y + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(x + 40, y);
    ctx.lineTo(x + 60, y - 10);
    ctx.lineTo(x + 60, y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Window
    ctx.fillStyle = '#42a5f5';
    ctx.beginPath();
    ctx.arc(x - 10, y - 2, 6, 0, TAU);
    ctx.fill();
  }

  private drawShadow(ctx: CanvasRenderingContext2D, cx: number, hipY: number) {
    ctx.fillStyle = 'rgba(20,20,20,0.12)';
    ctx.beginPath();
    ctx.ellipse(cx, FLOOR_Y - 8, 70, 14, 0, 0, TAU);
    ctx.fill();
  }

  private drawStickman(ctx: CanvasRenderingContext2D, cx: number, hipY: number, pose: Pose, arms: { l: Arm; r: Arm }, t: number, layer: 'body' | 'head' | 'hands') {
    if (layer === 'body') {
      // Torso
      const shoulderY = hipY - 170;
      ctx.fillStyle = SHIRT;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 50 - pose.stance, hipY);
      ctx.lineTo(cx - 60 - pose.stance, shoulderY + 20);
      ctx.lineTo(cx + 60 + pose.stance, shoulderY + 20);
      ctx.lineTo(cx + 50 + pose.stance, hipY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Trousers
      ctx.fillStyle = TROUSER;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 30 - pose.stance, hipY);
      ctx.lineTo(cx - 35 - pose.stance, FLOOR_Y - 20);
      ctx.lineTo(cx + 35 + pose.stance, FLOOR_Y - 20);
      ctx.lineTo(cx + 30 + pose.stance, hipY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Shoes
      this.drawShoe(ctx, cx - 35 - pose.stance, FLOOR_Y - 20, 0);
      this.drawShoe(ctx, cx + 35 + pose.stance, FLOOR_Y - 20, 0);

      // Arms
      const drawLimb = (arm: Arm) => {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(arm.sx, arm.sy);
        ctx.lineTo(arm.ex, arm.ey);
        ctx.lineTo(arm.hx, arm.hy);
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
      drawHand(ctx, arms.r, { side: 'right', pose: 'grip', layer: 'full' });

    } else if (layer === 'head') {
      const head = this.headPoint(pose);
      this.drawHead(ctx, head.x, head.y, pose, t, hipY - 170, cx);
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
  }

  private headPoint(pose: Pose): Pt {
    const shoulderY = HIP_Y - 170 + pose.hipDrop;
    return { x: CHAR_X, y: shoulderY - 140 - pose.headDrop };
  }

  private drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, pose: Pose, t: number, shoulderY: number, bodyTopX: number) {
    const r = HEAD_R;
    void shoulderY; void bodyTopX;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(pose.headTilt);

    // Head
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

    // Brows
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

    // Mouth
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = 6;
    const my = 40;
    ctx.beginPath();
    if (pose.mouth === 'smile') {
      ctx.arc(0, my, 22, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (pose.mouth === 'grin') {
      ctx.arc(0, my + 4, 28, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
    } else if (pose.mouth === 'bigsmile') {
      ctx.arc(0, my + 6, 36, Math.PI * 1.0, Math.PI * 2.0);
      ctx.stroke();
    } else if (pose.mouth === 'frown') {
      ctx.arc(0, my + 18, 22, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    } else if (pose.mouth === 'grit') {
      ctx.moveTo(-18, my);
      ctx.lineTo(18, my);
      ctx.stroke();
    } else if (pose.mouth === 'smirk') {
      ctx.moveTo(-20, my + 2);
      ctx.quadraticCurveTo(0, my + 14, 20, my + 2);
      ctx.stroke();
    } else if (pose.mouth === 'o') {
      ctx.ellipse(0, my + 2, 10, 14, 0, 0, TAU);
      ctx.stroke();
    } else {
      ctx.moveTo(-16, my);
      ctx.lineTo(16, my);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawBeanieShape(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.fillStyle = BEANIE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 65, cy - 10);
    ctx.bezierCurveTo(cx - 65, cy - 50, cx + 65, cy - 50, cx + 65, cy - 10);
    ctx.lineTo(cx + 65, cy + 8);
    ctx.lineTo(cx - 65, cy + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pom
    ctx.fillStyle = BEANIE_POM;
    ctx.strokeStyle = BEANIE_DEEP;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy - 65, 14, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private drawShoe(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
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

  private drawFlyingBeanie(ctx: CanvasRenderingContext2D, t: number) {
    // Only draw if beanie is flying (scene 5)
    if (!this.beaniePop) return;

    const u = this.beaniePopProgress;
    const x = this.beanieX;
    const y = this.beanieY;
    const rot = this.beanieRot;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.fillStyle = BEANIE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-55, -10);
    ctx.bezierCurveTo(-55, -40, 55, -40, 55, -10);
    ctx.lineTo(55, 5);
    ctx.lineTo(-55, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = BEANIE_POM;
    ctx.strokeStyle = BEANIE_DEEP;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -55, 12, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
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