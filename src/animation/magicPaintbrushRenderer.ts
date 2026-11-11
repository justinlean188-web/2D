import type { StudioConfig } from '../types';
import { drawHand, HandStyle } from './handRenderer';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

// --- palette -------------------------------------------------------------
const INK = '#17121f';
const WHITE = '#ffffff';
const WALL = '#ffe9c7';
const WALL_STRIPE = '#f5d6a4';
const FLOOR = '#f0c48a';
const FLOOR_LINE = '#dfae72';
const BASEBOARD = '#ffffff';
const BED_FRAME = '#8d5a3b';
const BED_FRAME_DARK = '#6f4429';
const MATTRESS = '#ffffff';
const BLANKET = '#2ec4b6';
const PILLOW = '#ff8fab';
const SHELF = '#b07d4f';
const SHELF_DARK = '#8d5a3b';
const DESK = '#c98a4b';
const DESK_DARK = '#a86b34';
const CHAIR = '#e07a5f';
const CURTAIN = '#ff8fab';
const SKY = '#81d4fa';
const CLOUD = '#ffffff';
const BOOKS = ['#ef476f', '#118ab2', '#06d6a0', '#ffd166', '#8338ec'];
const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const BEANIE_POM = '#ff6b6b';
const SHIRT = '#ffd166';
const SHIRT_DEEP = '#e8b23f';
const TROUSER = '#2f5fa8';
const TROUSER_DEEP = '#22457c';
const SHOE = '#141414';
const WOOD = '#c98a4b';
const WOOD_DARK = '#a86b34';
const GOLD = '#ffd166';
const GOLD_DEEP = '#e8b23f';
const PURPLE = '#a855f7';
const PURPLE_DEEP = '#8b5cf6';
const MONSTER = '#b388ff';
const MONSTER_DEEP = '#7c3aed';
const MONSTER_EYE = '#ffffff';
const CAKE_FROST = '#ffd166';
const CAKE_LAYER = '#ef4444';
const CAKE_FILL = '#fbcfe8';
const BOX = '#8d5a3b';

const FLOOR_Y = 1500;
const HIP_Y = 1200;
const HEAD_R = 70;
const CHAR_X = 540;

// --- helpers -------------------------------------------------------------
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeIn = (t: number) => t * t;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

interface Pt { x: number; y: number; }

// --- pose ----------------------------------------------------------------
type MouthShape = 'flat' | 'smile' | 'grin' | 'o' | 'frown' | 'grit' | 'smirk' | 'bigsmile';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'determined' | 'uneven';
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
  holdBrushL: boolean;
  holdBrushR: boolean;
}

type PosePatch = Partial<Pose>;
interface PoseKey { t: number; pose: Pose; }

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
  handL: { x: -90, y: -350 },
  handR: { x: 95, y: -350 },
  bendL: 1,
  bendR: 1,
  gripL: false,
  gripR: false,
  fistL: false,
  fistR: false,
  pointL: false,
  holdBrushL: false,
  holdBrushR: false,
};

const POSE_PATCHES: { t: number; p?: PosePatch }[] = [
  // Scene 1 -- magic discovery (0-6s)
  { t: 0.0 },
  { t: 0.8, p: { lean: 0.1, headTurn: 8, look: 'down', mouth: 'o', brow: 'raised' } },
  { t: 1.6, p: { lean: 0.16, hipDrop: 10, headTilt: 0.1, look: 'down', mouth: 'o', handL: { x: 145, y: -400 }, handR: { x: 205, y: -390 } } },
  { t: 2.4, p: { lean: 0.02, hipDrop: 0, headTilt: 0.12, look: 'down', mouth: 'o', handL: { x: 170, y: -405 }, handR: { x: 225, y: -395 } } },
  { t: 3.2, p: { lean: 0.05, headDrop: 14, headTilt: 0.12, look: 'down', mouth: 'smirk', brow: 'cocky', handL: { x: 200, y: -410 }, handR: { x: 250, y: -400 }, gripR: true } },
  { t: 4.0, p: { headDrop: 5, headTilt: 0.04, look: 'front', mouth: 'o', brow: 'raised', eye: 'wide', handL: { x: 170, y: -390 }, handR: { x: 230, y: -390 }, gripR: true } },
  { t: 4.6, p: { headDrop: 0, look: 'down', mouth: 'o', brow: 'raised', eye: 'wide' } },
  { t: 5.2, p: { look: 'front', mouth: 'o', brow: 'raised', eye: 'wide', handL: { x: -90, y: -350 }, handR: { x: 95, y: -350 }, gripR: true } },
  { t: 6.0, p: { look: 'front', mouth: 'smile', brow: 'cocky', eye: 'happy', gripR: true } },

  // Scene 2 -- creating anything (6-12s)
  { t: 6.2, p: { lean: 0.06, headTurn: 8, look: 'down', mouth: 'flat', brow: 'determined', gripR: true } },
  { t: 6.9, p: { lean: 0.12, hipDrop: 6, mouth: 'grin', brow: 'cocky', gripR: true } },
  { t: 7.5, p: { lean: 0.02, mouth: 'smile', brow: 'raised', gripR: true } },
  { t: 8.3, p: { headTurn: 6, look: 'down', mouth: 'flat', brow: 'determined', gripR: true } },
  { t: 8.9, p: { lean: 0.04, look: 'down', mouth: 'grin', gripR: true } },
  { t: 9.5, p: { lean: -0.08, hipDrop: -12, headTilt: -0.08, look: 'front', mouth: 'bigsmile', brow: 'raised', eye: 'happy', gripR: true } },
  { t: 10.2, p: { lean: -0.12, hipDrop: -16, headTilt: -0.16, mouth: 'bigsmile', eye: 'shut', gripR: true } },
  { t: 11.0, p: { hipDrop: -6, headTilt: -0.04, mouth: 'bigsmile', eye: 'happy', gripR: true } },
  { t: 12.0, p: { lean: 0, hipDrop: 0, headTilt: 0, mouth: 'bigsmile', eye: 'happy', gripR: true } },

  // Scene 3 -- terrible drawing (12-18s)
  { t: 12.2, p: { lean: -0.04, headDrop: 0, headTilt: 0, look: 'front', mouth: 'flat', brow: 'determined', eye: 'open', gripR: true } },
  { t: 13.0, p: { lean: 0.05, headDrop: 8, look: 'down', mouth: 'flat', brow: 'determined', eye: 'wide', gripR: true } },
  { t: 13.8, p: { lean: 0.08, hipDrop: 12, look: 'down', mouth: 'flat', brow: 'determined', eye: 'wide', gripR: true } },
  { t: 14.6, p: { lean: 0.02, headTilt: 0.05, look: 'down', mouth: 'o', brow: 'raised', eye: 'wide', gripR: true } },
  { t: 15.4, p: { headTilt: -0.08, look: 'front', mouth: 'o', brow: 'raised', eye: 'wide', gripR: true } },
  { t: 16.2, p: { headTilt: 0.04, look: 'front', mouth: 'o', brow: 'raised', eye: 'wide', gripR: true } },
  { t: 17.0, p: { look: 'front', mouth: 'o', brow: 'raised', eye: 'wide', gripR: true } },
  { t: 18.0, p: { look: 'front', mouth: 'o', brow: 'raised', eye: 'wide', gripR: true } },

  // Scene 4 -- monster chase (18-24s)
  { t: 18.2, p: { lean: 0.15, hipDrop: 10, headTilt: -0.08, look: 'right', mouth: 'o', brow: 'raised', eye: 'wide', gripR: true } },
  { t: 18.9, p: { lean: 0.25, hipDrop: 30, headTilt: -0.12, look: 'right', mouth: 'o', brow: 'raised', eye: 'wide', footLift: 20, handL: { x: -110, y: -380 }, handR: { x: 120, y: -380 }, gripR: true } },
  { t: 19.8, p: { lean: 0.18, hipDrop: 12, look: 'right', mouth: 'o', brow: 'raised', eye: 'wide', footLift: 0, gripR: true } },
  { t: 20.5, p: { lean: 0.22, hipDrop: 25, look: 'right', mouth: 'o', brow: 'raised', eye: 'wide', footLift: 15, gripR: true } },
  { t: 21.2, p: { lean: 0.3, hipDrop: -5, headTilt: 0.08, look: 'up', mouth: 'o', brow: 'raised', eye: 'wide', footLift: 25, gripR: true } },
  { t: 21.8, p: { lean: 0.2, hipDrop: 0, headTilt: 0.15, look: 'front', mouth: 'flat', brow: 'determined', eye: 'wide', footLift: 0, handL: { x: 20, y: -450 }, handR: { x: 100, y: -450 }, gripR: true } },
  { t: 22.4, p: { headTilt: 0.02, look: 'front', mouth: 'flat', brow: 'determined', eye: 'wide', gripR: true } },
  { t: 23.0, p: { headTilt: 0, look: 'front', mouth: 'smile', brow: 'raised', eye: 'happy', gripR: true } },
  { t: 24.0, p: { lean: 0, hipDrop: 0, headTilt: 0, mouth: 'smile', eye: 'happy', gripR: true } },

  // Scene 5 -- final mistake (24-30s)
  { t: 24.2, p: { headTilt: -0.06, look: 'right', mouth: 'o', brow: 'raised', eye: 'wide', gripR: true } },
  { t: 24.8, p: { lean: -0.02, headTilt: 0, look: 'front', mouth: 'o', brow: 'raised', eye: 'wide', gripR: true } },
  { t: 25.4, p: { headTilt: 0.02, look: 'front', mouth: 'smile', brow: 'raised', eye: 'wide', gripR: true } },
  { t: 26.0, p: { headTilt: 0.04, look: 'front', mouth: 'flat', brow: 'sad', eye: 'squint', gripR: true } },
  { t: 26.8, p: { headTilt: 0, look: 'front', mouth: 'frown', brow: 'sad', eye: 'squint', gripR: true } },
  { t: 27.4, p: { headTilt: 0.02, look: 'front', mouth: 'frown', brow: 'sad', eye: 'squint', gripR: true } },
  { t: 28.0, p: { headTilt: 0.04, look: 'front', mouth: 'frown', brow: 'sad', eye: 'squint', gripR: true } },
  { t: 28.8, p: { headTilt: 0.02, look: 'front', mouth: 'frown', brow: 'sad', eye: 'squint', gripR: true } },
  { t: 29.6, p: { headTilt: 0, look: 'front', mouth: 'flat', brow: 'sad', eye: 'squint', gripR: true } },
  { t: 30.0, p: { headTilt: 0, look: 'front', mouth: 'flat', brow: 'sad', eye: 'squint', gripR: true } },
];

function buildPoseKeys(): PoseKey[] {
  let current: Pose = { ...BASE_POSE };
  const keys: PoseKey[] = [];
  for (const patch of POSE_PATCHES) {
    current = { ...current, ...(patch.p ?? {}) };
    keys.push({ t: patch.t, pose: current });
  }
  return keys;
}

const POSE_KEYS = buildPoseKeys();

// --- camera --------------------------------------------------------------
interface CameraKey { t: number; x: number; y: number; zoom: number; }

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 540, y: 1080, zoom: 1.15 },
  { t: 1.4, x: 560, y: 1080, zoom: 1.2 },
  { t: 2.3, x: 610, y: 1060, zoom: 1.5 },
  { t: 3.4, x: 600, y: 1070, zoom: 1.35 },
  { t: 4.2, x: 660, y: 1100, zoom: 1.3 },
  { t: 4.9, x: 620, y: 1100, zoom: 1.32 },
  { t: 6.3, x: 640, y: 1100, zoom: 1.3 },
  { t: 6.8, x: 800, y: 1180, zoom: 1.45 },
  { t: 7.5, x: 700, y: 1080, zoom: 1.35 },
  { t: 8.5, x: 420, y: 1060, zoom: 1.35 },
  { t: 9.2, x: 190, y: 1000, zoom: 1.55 },
  { t: 10.0, x: 540, y: 1060, zoom: 1.15 },
  { t: 12.4, x: 560, y: 1100, zoom: 1.5 },
  { t: 13.2, x: 560, y: 1200, zoom: 1.8 },
  { t: 14.0, x: 590, y: 1370, zoom: 2.15 },
  { t: 15.2, x: 630, y: 1370, zoom: 2.05 },
  { t: 16.5, x: 560, y: 1380, zoom: 2.0 },
  { t: 18.0, x: 620, y: 1380, zoom: 2.0 },
  { t: 18.9, x: 640, y: 1400, zoom: 2.15 },
  { t: 19.8, x: 760, y: 1410, zoom: 1.6 },
  { t: 20.5, x: 600, y: 1410, zoom: 1.7 },
  { t: 21.4, x: 420, y: 1420, zoom: 2.15 },
  { t: 22.2, x: 450, y: 1420, zoom: 2.1 },
  { t: 23.4, x: 600, y: 1380, zoom: 1.95 },
  { t: 24.2, x: 600, y: 1360, zoom: 2.5 },
  { t: 25.0, x: 620, y: 1360, zoom: 2.85 },
  { t: 26.4, x: 540, y: 1200, zoom: 1.12 },
  { t: 27.4, x: 540, y: 1180, zoom: 1.08 },
  { t: 28.6, x: 640, y: 1350, zoom: 2.5 },
  { t: 29.4, x: 650, y: 1345, zoom: 3.0 },
  { t: 30.0, x: 650, y: 1340, zoom: 3.15 },
];

// --- captions ------------------------------------------------------------
const CAPTIONS = [
  { text: 'WAIT\u2026 IT\u2019S REAL?!', from: 0.15, to: 5.78 },
  { text: 'I CAN CREATE ANYTHING!', from: 6.15, to: 11.85 },
  { text: 'UH\u2026 THAT\u2019S NOT GOOD!', from: 12.15, to: 17.85 },
  { text: 'SOMEBODY STOP IT!', from: 18.15, to: 23.85 },
  { text: 'I CREATED MY OWN PROBLEM!', from: 24.15, to: 29.75 },
];

export class MagicPaintbrushRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    void config;
    const t = clamp(time, 0, 30);

    ctx.save();
    ctx.fillStyle = WALL;
    ctx.fillRect(-200, -200, WIDTH + 400, HEIGHT + 400);
    this.applyCamera(ctx, t);

    this.drawRoom(ctx, t);

    const monster = this.monsterAt(t);
    const cage = this.cageAt(t);
    const tiny = this.tinyStickmanAt(t);
    const brush = this.brushAt(t);

    this.drawBed(ctx);
    this.drawBookshelf(ctx);
    this.drawDesk(ctx);
    this.drawBox(ctx, t);
    this.drawStaircase(ctx, t);
    this.drawCake(ctx, t);
    this.drawWallDrawing(ctx, t);
    this.drawCage(ctx, t, cage);
    this.drawBrush(ctx, t, brush);
    this.drawMonster(ctx, monster);
    this.drawTinyStickman(ctx, tiny);

    const ch = this.charAt(t);
    const heldBrush = brush.held && t < 27.4;
    this.drawCharacter(ctx, t, ch, heldBrush ? brush : null);

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
  // Placement and animation state
  // ------------------------------------------------------------------
  private charAt(t: number) {
    // Scene 1: walk to desk, then stand at desk.
    if (t < 6.0) {
      const x = t < 1.2 ? lerp(440, 540, smooth((t) / 1.2)) : 540;
      return { x, ground: FLOOR_Y, scale: 1, lift: 0 };
    }
    // Scene 2: stand at desk/cake area.
    if (t < 12.0) return { x: 540, ground: FLOOR_Y, scale: 1, lift: 0 };
    // Scene 3: stand before wall.
    if (t < 18.0) return { x: 540, ground: FLOOR_Y, scale: 1, lift: 0 };
    // Scene 4: chase - run around room.
    if (t < 21.4) {
      // run right then up stairs
      if (t < 19.2) {
        const u = smooth((t - 18.2) / 1.0);
        return { x: lerp(540, 700, u), ground: FLOOR_Y, scale: 1, lift: 0 };
      }
      if (t < 21.4) {
        const u = smooth((t - 19.2) / 2.2);
        return { x: lerp(700, 420, u), ground: lerp(FLOOR_Y, 1350, u), scale: 1, lift: Math.sin(u * Math.PI) * 60 };
      }
      return { x: 420, ground: 1350, scale: 1, lift: 0 };
    }
    // Scene 5: trapped in cage.
    return { x: 540, ground: FLOOR_Y, scale: 1, lift: 0 };
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
      holdBrushL: pick(pa.holdBrushL, pb.holdBrushL),
      holdBrushR: pick(pa.holdBrushR, pb.holdBrushR),
    };
  }

  private brushAt(t: number) {
    // Brush: on desk in box (0-2.4), held in right hand (2.4-27.4), on cage floor (27.4-30).
    if (t < 2.4) return { x: 770, y: 1086, held: false, angle: -0.06, scale: 0.55 };
    if (t < 27.4) return { x: 0, y: 0, held: true, angle: 0.15, scale: 0.6 };
    return { x: 620, y: 1440, held: false, angle: -0.1, scale: 0.55 };
  }

  private monsterAt(t: number) {
    // Monster: not present (0-15.0), head out (15.0-15.7), on floor (15.7-30).
    if (t < 15.0) return { x: 700, y: FLOOR_Y, scale: 0, phase: 'off' };
    if (t < 15.7) {
      const u = (t - 15.0) / 0.7;
      return { x: 700, y: lerp(900, FLOOR_Y - 130, u), scale: u, phase: 'head' };
    }
    if (t < 16.5) {
      const u = (t - 15.7) / 0.8;
      return { x: lerp(700, 520, u), y: FLOOR_Y - 130, scale: 1, phase: 'jump' };
    }
    return { x: 520, y: FLOOR_Y - 130, scale: 1, phase: 'floor' };
  }

  private cageAt(t: number) {
    // Cage: drawn 21.8-22.6, appears around both at 24.0-24.8.
    if (t < 21.8) return { x: 540, y: 1300, w: 0, h: 0, active: false, glow: 0 };
    if (t < 24.0) {
      const u = smooth((t - 21.8) / 0.8);
      return { x: 540, y: 1300, w: 300 * u, h: 420 * u, active: true, glow: u };
    }
    if (t < 24.8) {
      const u = smooth((t - 24.0) / 0.8);
      return { x: 540 - 150 * u, y: 1080 - 210 * u, w: 300 * (1 + u), h: 420 * (1 + u), active: true, glow: 1 };
    }
    return { x: 390, y: 870, w: 600, h: 840, active: true, glow: 1 };
  }

  private tinyStickmanAt(t: number) {
    // Tiny stickman: drawn 28.0-29.2, appears 29.2-30.
    if (t < 28.0) return { x: 680, y: 1250, scale: 0, phase: 'off' };
    if (t < 29.2) {
      const u = (t - 28.0) / 1.2;
      return { x: 680, y: 1250 - 60 * u, scale: 0.18 * u, phase: 'draw' };
    }
    return { x: 680, y: 1190, scale: 0.18, phase: 'wave' };
  }

  // ------------------------------------------------------------------
  // Room
  // ------------------------------------------------------------------
  private drawRoom(ctx: CanvasRenderingContext2D, t: number) {
    void t;
    // Wall.
    ctx.fillStyle = WALL;
    ctx.fillRect(0, 0, WIDTH, FLOOR_Y);
    ctx.fillStyle = WALL_STRIPE;
    for (let x = 0; x < WIDTH; x += 120) {
      ctx.fillRect(x, 0, 46, FLOOR_Y);
    }

    // Window.
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(330, 250, 420, 430, 22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = SKY;
    ctx.beginPath();
    ctx.roundRect(356, 276, 368, 378, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = CLOUD;
    ctx.beginPath();
    ctx.ellipse(470, 390, 70, 30, 0, 0, TAU);
    ctx.ellipse(530, 370, 46, 24, 0, 0, TAU);
    ctx.ellipse(600, 410, 60, 26, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(540, 276);
    ctx.lineTo(540, 654);
    ctx.moveTo(356, 465);
    ctx.lineTo(724, 465);
    ctx.stroke();

    // Curtains.
    ctx.fillStyle = CURTAIN;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    for (const side of [-1, 1]) {
      const cx = 540 + side * 238;
      ctx.beginPath();
      ctx.moveTo(cx - side * 42, 240);
      ctx.quadraticCurveTo(cx + side * 30, 470, cx - side * 20, 710);
      ctx.lineTo(cx - side * 82, 710);
      ctx.quadraticCurveTo(cx + side * 4, 470, cx - side * 82, 240);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Floor.
    ctx.fillStyle = FLOOR;
    ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y + 200);
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 3;
    for (let y = FLOOR_Y + 42; y < HEIGHT; y += 58) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
      const x = 70 + i * 150;
      ctx.beginPath();
      ctx.moveTo(x, FLOOR_Y + (i % 2) * 30);
      ctx.lineTo(x - 30, HEIGHT);
      ctx.stroke();
    }

    // Baseboard.
    ctx.fillStyle = BASEBOARD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(0, FLOOR_Y - 42, WIDTH, 42);
    ctx.fill();
    ctx.stroke();

    // Rug.
    ctx.fillStyle = GOLD;
    ctx.strokeStyle = GOLD_DEEP;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(540, 1610, 390, 96, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Wall picture.
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(810, 300, 150, 170, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#06d6a0';
    ctx.beginPath();
    ctx.arc(885, 385, 46, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private scaleAround(ctx: CanvasRenderingContext2D, px: number, py: number, s: number, draw: () => void) {
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(s, s);
    ctx.translate(-px, -py);
    draw();
    ctx.restore();
  }

  private drawBed(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(220, FLOOR_Y);
    // Headboard.
    ctx.fillStyle = BED_FRAME;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(28, 1110, 72, 390, 14);
    ctx.fill();
    ctx.stroke();
    // Frame + legs.
    ctx.fillStyle = BED_FRAME_DARK;
    ctx.beginPath();
    ctx.roundRect(70, 1380, 330, 60, 8);
    ctx.fill();
    ctx.stroke();
    for (const lx of [92, 368]) {
      ctx.beginPath();
      ctx.roundRect(lx, 1430, 26, 70, 6);
      ctx.fill();
      ctx.stroke();
    }
    // Mattress.
    ctx.fillStyle = MATTRESS;
    ctx.beginPath();
    ctx.roundRect(88, 1280, 316, 110, 18);
    ctx.fill();
    ctx.stroke();
    // Blanket.
    ctx.fillStyle = BLANKET;
    ctx.beginPath();
    ctx.roundRect(160, 1300, 244, 94, 14);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#1f9c8f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(172, 1316);
    ctx.lineTo(392, 1316);
    ctx.stroke();
    // Pillow.
    ctx.fillStyle = PILLOW;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(102, 1258, 104, 62, 20);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawBookshelf(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(170, 1170);
    ctx.fillStyle = SHELF;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(40, 650, 268, 520, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f7e7ce';
    ctx.beginPath();
    ctx.rect(56, 668, 236, 484);
    ctx.fill();
    const shelfY = [820, 970, 1120];
    for (const y of shelfY) {
      ctx.fillStyle = SHELF_DARK;
      ctx.beginPath();
      ctx.rect(48, y, 252, 16);
      ctx.fill();
      ctx.stroke();
    }
    let seed = 0;
    for (const y of [668, 836, 986]) {
      let bx = 64;
      for (let i = 0; i < 6; i++) {
        const w = 22 + ((i * 7 + seed) % 13);
        const h = 92 + ((i * 13 + seed) % 40);
        ctx.fillStyle = BOOKS[(i + seed) % BOOKS.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(bx, y + 140 - h, w, h, 4);
        ctx.fill();
        ctx.stroke();
        bx += w + 9;
        seed++;
      }
    }
    ctx.restore();
  }

  private drawDesk(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(850, FLOOR_Y);
    ctx.fillStyle = DESK_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    for (const lx of [714, 968]) {
      ctx.beginPath();
      ctx.roundRect(lx, 1160, 34, FLOOR_Y - 1160, 6);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = DESK;
    ctx.beginPath();
    ctx.roundRect(698, 1112, 302, 52, 10);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#8a5628';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(712, 1150);
    ctx.lineTo(986, 1150);
    ctx.stroke();
    // Drawer.
    ctx.fillStyle = DESK_DARK;
    ctx.beginPath();
    ctx.roundRect(838, 1164, 150, 106, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e8b23f';
    ctx.beginPath();
    ctx.roundRect(868, 1198, 90, 18, 9);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawStaircase(ctx: CanvasRenderingContext2D, t: number) {
    // Golden staircase forms 6.8-7.9, stays after.
    if (t < 6.8) return;
    const u = smooth(clamp((t - 6.8) / 1.1, 0, 1));
    const steps = 5;
    const stepW = 70;
    const stepH = 40;
    const baseX = 620;
    const baseY = FLOOR_Y - 10;
    const glow = u < 1 ? 0.5 + 0.5 * Math.sin(t * 12) : 0;
    ctx.save();
    ctx.translate(baseX, baseY);
    for (let i = 0; i < steps; i++) {
      const sx = i * stepW;
      const sy = -i * stepH;
      ctx.fillStyle = u < 1 ? '#fff3c4' : GOLD;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(sx, sy, stepW, stepH, 6);
      ctx.fill();
      ctx.stroke();
      if (u < 1) {
        ctx.globalAlpha = glow;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.roundRect(sx + 4, sy + 4, stepW - 8, stepH - 8, 4);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  }

  private drawCake(ctx: CanvasRenderingContext2D, t: number) {
    // Cake drawn 8.6-10.8, stays after.
    if (t < 8.6) return;
    const u = smooth(clamp((t - 8.6) / 2.2, 0, 1));
    const cx = 820;
    const cy = FLOOR_Y - 10;
    const layers = 3;
    ctx.save();
    ctx.translate(cx, cy);
    // Glow while forming.
    if (u < 1) {
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 12);
      ctx.fillStyle = GOLD;
      ctx.beginPath();
      ctx.ellipse(0, -140, 90, 60, 0, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    for (let i = 0; i < layers; i++) {
      const lw = 140 - i * 30;
      const lh = 60;
      const ly = -i * lh - 20;
      const fill = u < 1 ? '#fff3c4' : CAKE_LAYER;
      ctx.fillStyle = fill;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(-lw / 2, ly - lh, lw, lh, 6);
      ctx.fill();
      ctx.stroke();
      // Frosting.
      ctx.fillStyle = u < 1 ? '#ffe5b4' : CAKE_FROST;
      ctx.beginPath();
      ctx.roundRect(-lw / 2 + 6, ly - lh + 6, lw - 12, 14, 7);
      ctx.fill();
      ctx.stroke();
    }
    // Top layer / candles.
    if (u > 0.5) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-20, -160, 7, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -162, 7, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(20, -158, 7, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawWallDrawing(ctx: CanvasRenderingContext2D, t: number) {
    // Monster outline drawn 12.6-14.2 on the wall, glows 14.2-15.0.
    if (t < 12.6 || t > 15.7) return;
    const drawU = smooth(clamp((t - 12.6) / 1.6, 0, 1));
    const glow = t >= 14.2 ? Math.min(1, (t - 14.2) / 0.8) : 0;
    const mx = 700;
    const my = 1050;
    ctx.save();
    ctx.translate(mx, my);
    ctx.fillStyle = 'rgba(168,85,247,0.25)';
    ctx.strokeStyle = PURPLE;
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.6 + glow * 0.4;
    // Body.
    ctx.beginPath();
    ctx.arc(0, -20, 70, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Horns.
    ctx.beginPath();
    ctx.moveTo(-40, -60);
    ctx.lineTo(-55, -100);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(40, -60);
    ctx.lineTo(55, -100);
    ctx.stroke();
    // Eyes.
    ctx.fillStyle = MONSTER_EYE;
    ctx.beginPath();
    ctx.ellipse(-28, -24, 24, 30, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(28, -24, 24, 30, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Arms.
    ctx.beginPath();
    ctx.moveTo(-70, -20);
    ctx.lineTo(-100, -20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(70, -20);
    ctx.lineTo(100, -20);
    ctx.stroke();
    // Legs.
    ctx.beginPath();
    ctx.moveTo(-25, 40);
    ctx.lineTo(-35, 80);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(25, 40);
    ctx.lineTo(35, 80);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private drawCage(ctx: CanvasRenderingContext2D, t: number, cage: { x: number; y: number; w: number; h: number; active: boolean; glow: number }) {
    if (!cage.active) return;
    const cx = cage.x + cage.w / 2;
    const cy = cage.y + cage.h / 2;
    const pulse = 0.5 + 0.5 * Math.sin(clamp((t - 24.0) / 1.0, 0, 1) * Math.PI * 4);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.globalAlpha = 0.8 + cage.glow * 0.2;
    ctx.beginPath();
    ctx.roundRect(-cage.w / 2, -cage.h / 2, cage.w, cage.h, 16);
    ctx.stroke();
    // Bars.
    ctx.lineWidth = 6;
    const bars = 5;
    for (let i = 0; i <= bars; i++) {
      const bx = -cage.w / 2 + (cage.w / bars) * i;
      ctx.beginPath();
      ctx.moveTo(bx, -cage.h / 2);
      ctx.lineTo(bx, cage.h / 2);
      ctx.stroke();
    }
    const rows = 4;
    for (let i = 0; i <= rows; i++) {
      const by = -cage.h / 2 + (cage.h / rows) * i;
      ctx.beginPath();
      ctx.moveTo(-cage.w / 2, by);
      ctx.lineTo(cage.w / 2, by);
      ctx.stroke();
    }
    // Glow.
    if (cage.glow > 0) {
      ctx.strokeStyle = PURPLE;
      ctx.lineWidth = 4;
      ctx.globalAlpha = cage.glow * 0.6;
      ctx.beginPath();
      ctx.roundRect(-cage.w / 2 - 8, -cage.h / 2 - 8, cage.w + 16, cage.h + 16, 20);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  private drawBrush(ctx: CanvasRenderingContext2D, t: number, brush: { x: number; y: number; held: boolean; angle: number; scale: number }) {
    if (!brush.held && t < 2.4) return; // drawn inside drawBox
    const cx = brush.x;
    const cy = brush.y;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(brush.angle);
    ctx.scale(brush.scale, brush.scale);
    const w = 26;
    const h = 150;
    // Handle.
    ctx.fillStyle = '#8d5a3b';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2 + 40, w, h - 90, 12);
    ctx.fill();
    ctx.stroke();
    // Ferrule.
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(-w / 2 - 4, -h / 2 + 2, w + 8, 26, 6);
    ctx.fill();
    ctx.stroke();
    // Tip.
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2 + 28);
    ctx.lineTo(-10, -h / 2 - 14);
    ctx.lineTo(10, -h / 2 - 14);
    ctx.lineTo(w / 2, -h / 2 + 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Glowing rainbow paint at tip.
    const pulse = 0.5 + 0.5 * Math.sin(t * 10);
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5 + pulse * 0.5;
    ctx.beginPath();
    ctx.arc(0, -h / 2 - 20, 12 + Math.sin(t * 8) * 3, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -h / 2 - 20, 8, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  private drawBox(ctx: CanvasRenderingContext2D, t: number) {
    // Wooden box on desk, open after 1.2s revealing the brush glow.
    const open = t >= 1.2;
    const u = open ? smooth(clamp((t - 1.2) / 0.5, 0, 1)) : 0;
    ctx.save();
    ctx.translate(770, 1086);
    ctx.rotate(-0.06);
    ctx.scale(0.55, 0.55);
    ctx.fillStyle = BOX;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(-60, -40, 120, 70, 10);
    ctx.fill();
    ctx.stroke();
    // Lid (opens up).
    ctx.save();
    ctx.translate(-60, -40);
    ctx.rotate(u * 0.9);
    ctx.translate(60, 40);
    ctx.fillStyle = WOOD_DARK;
    ctx.beginPath();
    ctx.roundRect(0, -34, 120, 34, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // Glowing brush inside.
    if (open) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 10);
      ctx.fillStyle = PURPLE;
      ctx.globalAlpha = 0.5 + pulse * 0.4;
      ctx.beginPath();
      ctx.arc(0, -28, 14 + Math.sin(t * 6) * 2, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = GOLD;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(0, -28, 8, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  private drawMonster(ctx: CanvasRenderingContext2D, monster: { x: number; y: number; scale: number; phase: string }) {
    if (monster.scale <= 0) return;
    ctx.save();
    ctx.translate(monster.x, monster.y);
    ctx.scale(monster.scale, monster.scale);
    // Body.
    ctx.fillStyle = MONSTER;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, 95, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Horns.
    ctx.fillStyle = MONSTER_DEEP;
    ctx.beginPath();
    ctx.moveTo(-55, -45);
    ctx.lineTo(-70, -110);
    ctx.lineTo(-45, -50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(55, -45);
    ctx.lineTo(70, -110);
    ctx.lineTo(45, -50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Eyes.
    ctx.fillStyle = MONSTER_EYE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    for (const sx of [-30, 30]) {
      ctx.beginPath();
      ctx.ellipse(sx, -10, 30, 40, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(sx + (sx < 0 ? -6 : 6), -10, 12, 0, TAU);
      ctx.fill();
      ctx.fillStyle = MONSTER_EYE;
    }
    // Mouth.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 30, 38, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    // Teeth.
    ctx.fillStyle = WHITE;
    for (const tx of [-8, 0, 8]) {
      ctx.beginPath();
      ctx.roundRect(tx - 6, 36, 12, 14, 3);
      ctx.fill();
      ctx.stroke();
    }
    // Arms.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-95, 8);
    ctx.lineTo(-135, 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(95, 8);
    ctx.lineTo(135, 8);
    ctx.stroke();
    // Legs.
    ctx.beginPath();
    ctx.moveTo(-38, 92);
    ctx.lineTo(-52, 140);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(38, 92);
    ctx.lineTo(52, 140);
    ctx.stroke();
    // Feet.
    ctx.fillStyle = MONSTER_DEEP;
    for (const fx of [-45, 45]) {
      ctx.beginPath();
      ctx.roundRect(fx - 20, 136, 40, 18, 8);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawTinyStickman(ctx: CanvasRenderingContext2D, tiny: { x: number; y: number; scale: number; phase: string }) {
    if (tiny.scale <= 0) return;
    ctx.save();
    ctx.translate(tiny.x, tiny.y);
    ctx.scale(tiny.scale, tiny.scale);
    const s = tiny.scale;
    // Head.
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.arc(0, 0, HEAD_R * s, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Beanie.
    ctx.fillStyle = BEANIE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.arc(0, -24 * s, (HEAD_R + 4) * s, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Eyes.
    ctx.fillStyle = INK;
    for (const sx of [-22, 22]) {
      ctx.beginPath();
      ctx.ellipse(sx * s, 6 * s, 8 * s, 16 * s, 0, 0, TAU);
      ctx.fill();
    }
    // Mouth (happy wave).
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.arc(0, 40 * s, 20 * s, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    // Body.
    ctx.fillStyle = SHIRT;
    ctx.beginPath();
    ctx.moveTo(-28 * s, 130 * s);
    ctx.lineTo(-32 * s, 20 * s);
    ctx.lineTo(32 * s, 20 * s);
    ctx.lineTo(28 * s, 130 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Arms raised waving.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 12 * s;
    ctx.beginPath();
    ctx.moveTo(-30 * s, 40 * s);
    ctx.lineTo(-60 * s, -10 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(30 * s, 40 * s);
    ctx.lineTo(60 * s, -10 * s);
    ctx.stroke();
    // Legs.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 22 * s;
    ctx.beginPath();
    ctx.moveTo(-14 * s, 130 * s);
    ctx.lineTo(-18 * s, 180 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(14 * s, 130 * s);
    ctx.lineTo(18 * s, 180 * s);
    ctx.stroke();
    // Shoes.
    ctx.fillStyle = SHOE;
    for (const sx of [-18, 18]) {
      ctx.beginPath();
      ctx.roundRect(sx - 12 * s, 176 * s, 24 * s, 12 * s, 5);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Character
  // ------------------------------------------------------------------
  private drawCharacter(
    ctx: CanvasRenderingContext2D,
    t: number,
    ch: { x: number; ground: number; scale: number; lift: number },
    brush: { x: number; y: number; held: boolean; angle: number; scale: number } | null
  ) {
    const baseY = ch.ground - ch.lift;
    const hipY = baseY - 300;

    const pose = this.poseAt(t);
    if (brush && brush.held) {
      const half = 40;
      pose.handR = { x: brush.x + Math.cos(brush.angle) * half, y: brush.y + Math.sin(brush.angle) * half };
      pose.gripR = true;
      pose.holdBrushR = true;
    } else {
      pose.handL = { x: ch.x + pose.handL.x, y: baseY + pose.handL.y };
      pose.handR = { x: ch.x + pose.handR.x, y: baseY + pose.handR.y };
    }

    const arms = this.computeArms(pose, ch.x, hipY);

    if (ch.lift < 4) {
      const s = ch.scale;
      ctx.fillStyle = 'rgba(23,18,31,0.16)';
      ctx.beginPath();
      ctx.ellipse(ch.x, ch.ground + 6, 75 * s, 16 * s, 0, 0, TAU);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(ch.x, baseY);
    ctx.scale(ch.scale, ch.scale);
    ctx.translate(-ch.x, -baseY);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    this.drawBody(ctx, ch.x, hipY, pose, arms);

    // Draw the brush gripped in the right hand.
    if (brush && brush.held) {
      ctx.save();
      ctx.translate(brush.x, brush.y);
      ctx.rotate(brush.angle);
      ctx.scale(brush.scale, brush.scale);
      const w = 26;
      const h = 150;
      ctx.fillStyle = '#8d5a3b';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2 + 40, w, h - 90, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(-w / 2 - 4, -h / 2 + 2, w + 8, 26, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2 + 28);
      ctx.lineTo(-10, -h / 2 - 14);
      ctx.lineTo(10, -h / 2 - 14);
      ctx.lineTo(w / 2, -h / 2 + 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    const head = this.headPoint(pose, ch.x, hipY);
    this.drawHead(ctx, head.x, head.y, pose);

    ctx.restore();
  }

  private headPoint(pose: Pose, x: number, hipY: number): Pt {
    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(pose.lean) * 170;
    const headX = bodyTopX + Math.sin(pose.headTilt) * 10;
    return { x: headX, y: shoulderY - 20 - HEAD_R + pose.headDrop };
  }

  private drawBody(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    pose: Pose,
    arms: { l: Arm; r: Arm }
  ) {
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(pose.lean) * 170;

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

    const drawLegPath = (knee: Pt, ankle: Pt) => {
      ctx.beginPath();
      ctx.moveTo(hipX - 8, hipY + 6);
      ctx.lineTo(knee.x, knee.y);
      ctx.lineTo(ankle.x, ankle.y);
    };
    ctx.strokeStyle = INK;
    ctx.lineWidth = 31;
    drawLegPath(kneeL, ankleL);
    ctx.stroke();
    drawLegPath(kneeR, ankleR);
    ctx.stroke();
    ctx.strokeStyle = TROUSER;
    ctx.lineWidth = 22;
    drawLegPath(kneeL, ankleL);
    ctx.stroke();
    drawLegPath(kneeR, ankleR);
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    for (const ankle of [ankleL, ankleR]) {
      ctx.beginPath();
      ctx.moveTo(ankle.x - 14, ankle.y);
      ctx.lineTo(ankle.x + 14, ankle.y);
      ctx.stroke();
    }
    this.drawShoe(ctx, ankleL.x - 4, ankleL.y + 14, -0.07);
    this.drawShoe(ctx, ankleR.x + 4, ankleR.y + 14, pose.footLift > 20 ? -0.22 : 0.07);

    // Torso.
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
    ctx.strokeStyle = SHIRT_DEEP;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bodyTopX - 18, shoulderY + 12);
    ctx.lineTo(bodyTopX + 18, shoulderY + 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hipX - 30, hipY + 1);
    ctx.lineTo(hipX + 30, hipY + 1);
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

    // Palms.
    drawHand(ctx, arms.l, { side: 'left', pose: pose.fistL ? 'fist' : 'relaxed', layer: 'full' });
    drawHand(ctx, arms.r, { side: 'right', pose: 'relaxed', layer: 'full' });
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
    ctx.strokeStyle = INK;
    ctx.lineWidth = 36;
    ctx.beginPath();
    ctx.moveTo(arm.sx, arm.sy);
    ctx.lineTo(arm.sx + ux * 34, arm.sy + uy * 34);
    ctx.stroke();
    ctx.strokeStyle = SHIRT;
    ctx.lineWidth = 27;
    ctx.beginPath();
    ctx.moveTo(arm.sx, arm.sy);
    ctx.lineTo(arm.sx + ux * 34, arm.sy + uy * 34);
    ctx.stroke();
    ctx.strokeStyle = SHIRT_DEEP;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(arm.sx + ux * 32 - uy * 13, arm.sy + uy * 32 + ux * 13);
    ctx.lineTo(arm.sx + ux * 32 + uy * 13, arm.sy + uy * 32 - ux * 13);
    ctx.stroke();
  }

  private computeArms(pose: Pose, x: number, hipY: number): { l: Arm; r: Arm } {
    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(pose.lean) * 170;
    const headCx = bodyTopX + Math.sin(pose.headTilt) * 10;
    const headCy = shoulderY - 140 + pose.headDrop;
    const handClear = HEAD_R + 24;
    const elbowClear = HEAD_R + 28;

    const solve = (side: -1 | 1, target: Pt, bend: 1 | -1): Arm => {
      const sx = bodyTopX + side * 34;
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
      if (d < 28) d = 28;
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

    this.drawBeanie(ctx);

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
      const eyeH = pose.eye === 'wide' ? 32 : pose.eye === 'squint' ? 9 : 21;
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

  private drawBeanie(ctx: CanvasRenderingContext2D) {
    const r = HEAD_R;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillStyle = BEANIE;
    ctx.beginPath();
    ctx.arc(0, -24, r + 4, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = BEANIE_DEEP;
    ctx.beginPath();
    ctx.rect(-r - 4, -42, (r + 4) * 2, 18);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#f07178';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 22, -68);
      ctx.lineTo(i * 22, -48);
      ctx.stroke();
    }
    ctx.fillStyle = BEANIE_POM;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -r - 32, 16, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  // ------------------------------------------------------------------
  // Captions
  // ------------------------------------------------------------------
  private drawCaptions(ctx: CanvasRenderingContext2D, t: number) {
    const line = CAPTIONS.find((c) => t >= c.from && t < c.to);
    if (!line) return;

    const u = clamp((t - line.from) / 0.1, 0, 1);
    const tailFade = Math.min(1, (line.to - t) / 0.2);
    const alpha = clamp(Math.min((t - line.from) / 0.05, tailFade), 0, 1);
    if (alpha <= 0) return;

    const scale = 1 - (1 - u) * 0.25 + Math.sin(u * Math.PI) * 0.18;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(WIDTH / 2, 470);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    const family = '"Arial Black", "Helvetica Neue", Arial, sans-serif';
    let size = 78;
    ctx.font = `900 ${size}px ${family}`;
    const width = ctx.measureText(line.text).width;
    if (width > 950) {
      size = Math.max(46, Math.floor((size * 950) / width));
      ctx.font = `900 ${size}px ${family}`;
    }

    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.strokeText(line.text, 0, 0);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeText(line.text, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(line.text, 0, 0);

    ctx.restore();
  }
}

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

