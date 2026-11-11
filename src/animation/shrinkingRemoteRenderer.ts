import type { StudioConfig } from '../types';
import { drawHand, HandStyle } from './handRenderer';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

// --- palette -------------------------------------------------------------
const INK = '#17121f';
const WHITE = '#ffffff';
const WALL = '#d9ecff';
const WALL_STRIPE = '#c7dffa';
const FLOOR = '#f0c48a';
const FLOOR_LINE = '#dfae72';
const BASEBOARD = '#ffffff';
const RUG = '#ffd166';
const RUG_DARK = '#eeb52f';
const BED_FRAME = '#8d5a3b';
const BED_FRAME_DARK = '#6f4429';
const MATTRESS = '#ffffff';
const BLANKET = '#2ec4b6';
const BLANKET_DARK = '#1f9c8f';
const PILLOW = '#ff8fab';
const PILLOW_DARK = '#ef6f91';
const SHELF = '#b07d4f';
const SHELF_DARK = '#8d5a3b';
const DESK = '#c98a4b';
const DESK_DARK = '#a86b34';
const CHAIR = '#e07a5f';
const CHAIR_DARK = '#c05a42';
const LAMP = '#ffb703';
const LAMP_DARK = '#e09f00';
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
const REMOTE_BODY = '#23232d';
const REMOTE_EDGE = '#0e0e13';
const PURPLE = '#a855f7';
const PURPLE_LIGHT = '#d8b4fe';
const RED = '#ef4444';

const FLOOR_Y = 1500;
const HIP_Y = 1200;
const HEAD_R = 70;
const CHAR_X = 540;

const REMOTE_W = 260;
const REMOTE_H = 110;
const REMOTE_FLOOR_X = 640;
const REMOTE_FLOOR_Y = 1430;
const REMOTE_TOP = 1400;
const REMOTE_BUTTON_X = 600;
const REMOTE_RESET_X = 730;

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
  /** Hand targets are offsets from (character x, character ground). */
  handL: Pt;
  handR: Pt;
  bendL: 1 | -1;
  bendR: 1 | -1;
  gripL: boolean;
  gripR: boolean;
  fistL: boolean;
  fistR: boolean;
  pointL: boolean;
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
};

const POSE_PATCHES: { t: number; p?: PosePatch }[] = [
  // Scene 1 -- the mysterious remote (0-6s)
  { t: 0.0 },
  { t: 0.6, p: { lean: 0.1, handL: { x: 60, y: -360 }, handR: { x: -70, y: -330 }, brow: 'raised' } },
  { t: 1.4, p: {
      lean: 0.16, hipDrop: 8, headTilt: 0.1, headTurn: 8, look: 'down',
      mouth: 'o', brow: 'raised',
      handL: { x: 145, y: -390 }, handR: { x: 205, y: -400 },
  } },
  { t: 2.2, p: {
      lean: 0.12, hipDrop: 4, headTilt: 0.12, look: 'down',
      mouth: 'o', handL: { x: 170, y: -395 }, handR: { x: 225, y: -385 },
  } },
  { t: 2.4, p: { lean: 0.02, hipDrop: 0, headTilt: 0.12, look: 'down', mouth: 'o', brow: 'raised' } },
  { t: 2.9, p: { headDrop: 14, headTilt: 0.2, look: 'down', mouth: 'o', eye: 'wide' } },
  { t: 3.4, p: { headDrop: 5, headTilt: 0.04, look: 'front', mouth: 'smirk', brow: 'cocky' } },
  { t: 3.9, p: { lean: 0.08, headTilt: 0.02, headTurn: 8, look: 'right', mouth: 'flat', brow: 'determined' } },
  { t: 4.35, p: { lean: 0.02, headTilt: -0.04, look: 'right', mouth: 'o', brow: 'raised', eye: 'wide' } },
  { t: 4.8, p: { lean: -0.03, headTilt: -0.06, look: 'right', mouth: 'bigsmile', eye: 'happy' } },
  { t: 5.3, p: { look: 'down', headDrop: 10, mouth: 'smile', brow: 'raised' } },
  { t: 5.9, p: { look: 'front', headDrop: 0, mouth: 'smirk', brow: 'cocky' } },

  // Scene 2 -- shrinking everything (6-12s)
  { t: 6.2, p: { lean: 0.06, headTurn: 8, look: 'right', mouth: 'flat', brow: 'determined' } },
  { t: 6.7, p: { lean: 0.12, hipDrop: 6, mouth: 'grin', brow: 'cocky' } },
  { t: 7.2, p: { lean: 0.02, mouth: 'smile', brow: 'raised' } },
  { t: 7.6, p: { headTurn: 6, look: 'up', mouth: 'flat', brow: 'determined' } },
  { t: 8.1, p: { lean: 0.04, look: 'up', mouth: 'grin' } },
  { t: 8.5, p: { lean: -0.06, headTurn: -12, look: 'left', mouth: 'flat', brow: 'determined' } },
  { t: 9.0, p: { headTurn: -14, look: 'left', mouth: 'grin' } },
  { t: 9.5, p: {
      lean: -0.08, hipDrop: -12, headTilt: -0.08, headTurn: 0, look: 'front',
      mouth: 'bigsmile', brow: 'raised', eye: 'happy',
  } },
  { t: 10.2, p: { lean: -0.12, hipDrop: -16, headTilt: -0.16, mouth: 'bigsmile', eye: 'shut' } },
  { t: 11.0, p: { hipDrop: -6, headTilt: -0.04, mouth: 'bigsmile', eye: 'happy' } },
  { t: 11.5, p: {
      lean: 0.02, hipDrop: 0, headTilt: 0.12, headDrop: 12, look: 'down',
      mouth: 'flat', brow: 'uneven', eye: 'open',
  } },
  { t: 12.0, p: { headDrop: 6, mouth: 'o', brow: 'raised', eye: 'wide' } },

  // Scene 3 -- oops (12-18s)
  { t: 12.2, p: { lean: -0.04, headDrop: 0, headTilt: 0, look: 'down', mouth: 'o', brow: 'raised', eye: 'wide' } },
  { t: 12.5, p: { lean: 0, hipDrop: 10, mouth: 'o', brow: 'uneven', eye: 'wide' } },
  { t: 13.2, p: { hipDrop: 0, headTilt: 0.03, look: 'up', mouth: 'o', brow: 'raised', eye: 'wide' } },
  { t: 14.2, p: { headTilt: -0.1, look: 'up', mouth: 'o', brow: 'raised', eye: 'wide', handL: { x: -130, y: -430 }, handR: { x: 130, y: -430 } } },
  { t: 15.6, p: { headTilt: -0.14, look: 'up', mouth: 'o', eye: 'wide' } },
  { t: 16.5, p: { headTilt: 0.04, look: 'front', mouth: 'frown', brow: 'sad', eye: 'squint', handL: { x: -95, y: -360 }, handR: { x: 100, y: -360 } } },
  { t: 17.6, p: { look: 'up', mouth: 'frown' } },

  // Scene 4 -- giant bedroom survival (18-24s)
  { t: 18.0, p: { headTilt: -0.08, look: 'up', mouth: 'frown', brow: 'sad' } },
  { t: 18.8, p: { headTilt: 0, look: 'front', mouth: 'grit', brow: 'determined', eye: 'squint', fistL: true, fistR: true } },
  { t: 19.4, p: { lean: 0.08, handL: { x: -50, y: -380 }, handR: { x: 90, y: -400 }, fistL: false, fistR: false } },
  { t: 20.2, p: { lean: 0.16, hipDrop: 20, look: 'up', mouth: 'grit', brow: 'determined', handL: { x: 40, y: -470 }, handR: { x: 105, y: -500 } } },
  { t: 21.1, p: { lean: 0.1, hipDrop: 12, headTilt: -0.1, look: 'up', mouth: 'o', brow: 'raised', eye: 'wide' } },
  { t: 21.6, p: { lean: -0.05, headTilt: 0, headTurn: 12, look: 'right', mouth: 'o', brow: 'raised', eye: 'wide', handL: { x: -60, y: -460 }, handR: { x: 80, y: -470 } } },
  { t: 22.0, p: { lean: -0.12, headTilt: -0.15, headTurn: 4, look: 'right', mouth: 'o', brow: 'uneven', eye: 'wide', handL: { x: -110, y: -480 }, handR: { x: 120, y: -480 } } },
  { t: 22.4, p: { lean: -0.04, headTilt: -0.1, look: 'down', mouth: 'bigsmile', eye: 'wide', handL: { x: -120, y: -470 }, handR: { x: 125, y: -470 } } },
  { t: 22.8, p: { lean: 0.05, hipDrop: 24, headTilt: 0.12, look: 'down', mouth: 'o', brow: 'uneven', eye: 'shut', handL: { x: -100, y: -360 }, handR: { x: 110, y: -360 } } },
  { t: 23.4, p: { hipDrop: 18, headTilt: 0.06, look: 'front', mouth: 'smile', brow: 'sad', eye: 'happy', handL: { x: -80, y: -350 }, handR: { x: 90, y: -350 } } },
  { t: 24.0, p: { hipDrop: 0, headTilt: -0.08, look: 'up', mouth: 'grit', brow: 'determined', eye: 'open' } },

  // Scene 5 -- the wrong button (24-30s)
  { t: 24.4, p: { lean: -0.05, hipDrop: 8, headTilt: -0.04, look: 'up', mouth: 'o', brow: 'raised', eye: 'wide', handL: { x: -40, y: -450 }, handR: { x: 55, y: -450 } } },
  { t: 24.8, p: { lean: 0.04, hipDrop: 18, headTilt: 0.08, look: 'down', mouth: 'o', brow: 'uneven', eye: 'shut', handL: { x: -30, y: -350 }, handR: { x: 50, y: -350 } } },
  { t: 25.2, p: { lean: 0.08, hipDrop: 10, headTilt: 0.04, look: 'down', mouth: 'flat', brow: 'determined', eye: 'open' } },
  { t: 25.6, p: { lean: 0.22, hipDrop: 120, headTilt: 0.1, headDrop: 8, look: 'down', mouth: 'grit', brow: 'determined', eye: 'squint', handL: { x: 0, y: -6 }, handR: { x: 42, y: -6 } } },
  { t: 26.0, p: { lean: 0.24, hipDrop: 126, headDrop: 10, mouth: 'grit', eye: 'shut' } },
  { t: 26.3, p: { lean: 0.12, hipDrop: 70, headTilt: -0.02, headDrop: 0, look: 'up', mouth: 'o', brow: 'raised', eye: 'wide', handL: { x: -55, y: -220 }, handR: { x: 70, y: -220 } } },
  { t: 27.2, p: { lean: 0, hipDrop: 0, headTilt: 0.02, headTurn: 4, look: 'front', mouth: 'o', brow: 'raised', eye: 'wide' } },
  { t: 27.7, p: { lean: 0.06, headTurn: 12, look: 'right', mouth: 'o', brow: 'raised', eye: 'wide', handR: { x: 143, y: 0 }, pointL: false } },
  { t: 28.3, p: { lean: 0.02, headTurn: 8, look: 'right', mouth: 'frown', brow: 'sad', eye: 'squint', handR: { x: 135, y: 0 } } },
  { t: 29.0, p: { lean: 0, headTurn: 0, look: 'front', mouth: 'flat', brow: 'sad', eye: 'squint', handR: { x: 95, y: -340 } } },
  { t: 30.0, p: { lean: 0, headTurn: 0, look: 'front', mouth: 'flat', brow: 'sad', eye: 'squint' } },
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
  { t: 3.9, x: 660, y: 1100, zoom: 1.3 },
  { t: 4.2, x: 840, y: 1260, zoom: 1.65 },
  { t: 4.6, x: 840, y: 1260, zoom: 1.65 },
  { t: 4.9, x: 620, y: 1100, zoom: 1.32 },
  { t: 6.3, x: 640, y: 1100, zoom: 1.3 },
  { t: 6.8, x: 800, y: 1180, zoom: 1.45 },
  { t: 7.5, x: 700, y: 1080, zoom: 1.35 },
  { t: 7.9, x: 650, y: 1010, zoom: 1.55 },
  { t: 8.5, x: 420, y: 1060, zoom: 1.35 },
  { t: 8.95, x: 190, y: 1000, zoom: 1.55 },
  { t: 9.5, x: 540, y: 1060, zoom: 1.15 },
  { t: 11.2, x: 600, y: 1080, zoom: 1.4 },
  { t: 11.7, x: 620, y: 1100, zoom: 1.5 },
  { t: 12.2, x: 560, y: 1100, zoom: 1.7 },
  { t: 12.8, x: 560, y: 1200, zoom: 1.9 },
  { t: 13.5, x: 590, y: 1370, zoom: 2.15 },
  { t: 14.6, x: 630, y: 1370, zoom: 2.05 },
  { t: 18.0, x: 620, y: 1380, zoom: 2.0 },
  { t: 20.3, x: 640, y: 1400, zoom: 2.15 },
  { t: 21.6, x: 760, y: 1410, zoom: 1.6 },
  { t: 22.2, x: 600, y: 1410, zoom: 1.7 },
  { t: 22.8, x: 420, y: 1420, zoom: 2.15 },
  { t: 23.4, x: 450, y: 1420, zoom: 2.1 },
  { t: 24.2, x: 600, y: 1380, zoom: 1.95 },
  { t: 24.9, x: 600, y: 1360, zoom: 2.5 },
  { t: 25.9, x: 620, y: 1360, zoom: 2.85 },
  { t: 26.35, x: 540, y: 1200, zoom: 1.12 },
  { t: 27.3, x: 540, y: 1180, zoom: 1.08 },
  { t: 27.9, x: 620, y: 1380, zoom: 3.3 },
  { t: 28.7, x: 610, y: 1375, zoom: 5.0 },
  { t: 30.0, x: 600, y: 1370, zoom: 6.2 },
];

// --- captions ------------------------------------------------------------
const CAPTIONS = [
  { text: 'WHAT DOES THIS BUTTON DO?!', from: 0.15, to: 5.78 },
  { text: "I'M A GENIUS!", from: 6.15, to: 11.85 },
  { text: 'I SHRUNK MYSELF?!', from: 12.15, to: 17.85 },
  { text: 'EVERYTHING IS HUGE!', from: 18.15, to: 23.85 },
  { text: 'THAT WAS NOT RESET!', from: 24.15, to: 29.75 },
];

// --- character placement -------------------------------------------------
interface CharState {
  x: number;
  ground: number;
  scale: number;
  lift: number;
}

export class ShrinkingRemoteRenderer {
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

    const scales = this.furnitureScales(t);
    this.drawBookshelf(ctx, scales.shelf);
    this.drawBed(ctx, scales.bed);
    this.drawDesk(ctx, scales.desk);
    this.drawChair(ctx, scales.chair);
    this.drawLamp(ctx, scales.lamp);
    this.drawPencil(ctx, t);
    this.drawSneaker(ctx, t);
    this.drawPillow(ctx, t);

    const ch = this.charAt(t);
    const held = this.heldRemote(t, ch);

    if (!held) {
      const free = this.freeRemotePose(t, ch);
      this.drawRemote(ctx, free.cx, free.cy, free.angle, free.scale, t);
    }
    this.drawCharacter(ctx, t, ch, held);
    this.drawBeams(ctx, t, ch, held);
    this.drawDust(ctx, t, ch);

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
  private charAt(t: number): CharState {
    // Scenes 1-3: normal size, then a uniform shrink on the spot.
    if (t < 12.2) {
      const x = t < 0.6 ? 440 : t < 1.4 ? lerp(440, 540, smooth((t - 0.6) / 0.8)) : 540;
      return { x, ground: FLOOR_Y, scale: 1, lift: 0 };
    }
    if (t < 18.0) {
      const scale = t < 13.2 ? lerp(1, 0.13, smooth(clamp((t - 12.2) / 1.0, 0, 1))) : 0.13;
      return { x: 540, ground: FLOOR_Y, scale, lift: 0 };
    }
    if (t < 24.0) {
      // Scene 4: walk to the pencil, climb it, then leap to the pillow.
      if (t < 19.2) return { x: 540, ground: FLOOR_Y, scale: 0.13, lift: 0 };
      if (t < 20.0) {
        const u = smooth((t - 19.2) / 0.8);
        return { x: lerp(540, 690, u), ground: FLOOR_Y, scale: 0.13, lift: 0 };
      }
      if (t < 21.3) {
        const u = smooth((t - 20.0) / 1.3);
        return { x: lerp(690, 575, u), ground: lerp(FLOOR_Y, 1392, u), scale: 0.13, lift: 0 };
      }
      if (t < 21.9) return { x: 575, ground: 1392, scale: 0.13, lift: 0 };
      if (t < 22.6) {
        const u = smooth((t - 21.9) / 0.7);
        return {
          x: lerp(575, 360, u),
          ground: lerp(1392, 1440, u),
          scale: 0.13,
          lift: Math.sin(u * Math.PI) * 150,
        };
      }
      return { x: 360, ground: 1440, scale: 0.13, lift: 0 };
    }
    // Scene 5: leap onto the remote, walk to the purple button.
    if (t < 24.7) {
      const u = smooth(clamp((t - 24.0) / 0.7, 0, 1));
      return {
        x: lerp(360, 520, u),
        ground: lerp(1440, REMOTE_TOP, u),
        scale: 0.13,
        lift: Math.sin(u * Math.PI) * 120,
      };
    }
    if (t < 25.4) {
      const u = smooth(clamp((t - 24.7) / 0.7, 0, 1));
      return { x: lerp(520, 570, u), ground: REMOTE_TOP, scale: 0.13, lift: 0 };
    }
    return { x: 570, ground: REMOTE_TOP, scale: 0.13, lift: 0 };
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
    };
  }

  private furnitureScales(t: number) {
    return {
      chair: this.shrinkAt(t, 4.25, 0.16),
      desk: this.shrinkAt(t, 6.85, 0.16) * this.shrinkAt(t, 26.45, 0.35),
      lamp: this.shrinkAt(t, 8.05, 0.16) * this.shrinkAt(t, 26.45, 0.35),
      shelf: this.shrinkAt(t, 8.95, 0.16) * this.shrinkAt(t, 26.45, 0.35),
      bed: this.shrinkAt(t, 26.35, 0.07),
    };
  }

  private shrinkAt(t: number, start: number, target: number, dur = 0.45) {
    if (t < start) return 1;
    const u = smooth(clamp((t - start) / dur, 0, 1));
    return lerp(1, target, u);
  }

  // ------------------------------------------------------------------
  // Held remote
  // ------------------------------------------------------------------
  private heldRemote(t: number, ch: CharState): { cx: number; cy: number; angle: number; scale: number } | null {
    if (t < 2.4 || t >= 12.25) return null;
    const base = ch.ground;
    const keys = [
      { t: 2.4, dx: 90, dy: -420, a: 0.05 },
      { t: 3.0, dx: 80, dy: -470, a: 0.3 },
      { t: 3.6, dx: 90, dy: -420, a: 0.1 },
      { t: 3.95, dx: 100, dy: -420, a: 0.76 },
      { t: 4.7, dx: 90, dy: -420, a: 0.15 },
      { t: 6.65, dx: 90, dy: -420, a: 0.12 },
      { t: 7.85, dx: 70, dy: -440, a: -1.28 },
      { t: 8.75, dx: 50, dy: -440, a: -2.87 },
      { t: 9.4, dx: 20, dy: -500, a: -1.2 },
      { t: 10.2, dx: 40, dy: -500, a: -1.5 },
      { t: 11.2, dx: 90, dy: -430, a: 0.1 },
      { t: 12.55, dx: 100, dy: -410, a: Math.PI },
    ];
    let a = keys[0];
    let b = keys[0];
    if (t <= keys[0].t) {
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
      cx: ch.x + lerp(a.dx, b.dx, u),
      cy: base + lerp(a.dy, b.dy, u),
      angle: lerp(a.a, b.a, u),
      scale: 0.72,
    };
  }

  /**
   * The remote whenever it is not in his hands: on the desk before the pickup,
   * tumbling to the floor after the self-shrink, and finally enormous on the
   * floor for shots 3-5.
   */
  private freeRemotePose(t: number, ch: CharState) {
    if (t < 2.1) {
      return { cx: 775, cy: 1082, angle: -0.06, scale: 0.55 };
    }
    if (t < 2.4) {
      const u = smooth((t - 2.1) / 0.3);
      return {
        cx: lerp(775, ch.x + 90, u),
        cy: lerp(1082, ch.ground - 420, u),
        angle: lerp(-0.06, 0.05, u),
        scale: lerp(0.55, 0.72, u),
      };
    }
    if (t < 12.95) {
      const u = smooth(clamp((t - 12.25) / 0.7, 0, 1));
      return {
        cx: lerp(638.7, REMOTE_FLOOR_X, u),
        cy: lerp(1087.5, REMOTE_FLOOR_Y, u),
        angle: lerp(2.757, -0.05, u),
        scale: lerp(0.72, 1, u),
      };
    }
    if (t < 13.25) {
      const u = (t - 12.95) / 0.3;
      return {
        cx: REMOTE_FLOOR_X,
        cy: REMOTE_FLOOR_Y - Math.sin(u * Math.PI) * 16,
        angle: -0.05,
        scale: 1,
      };
    }
    return { cx: REMOTE_FLOOR_X, cy: REMOTE_FLOOR_Y, angle: -0.05, scale: 1 };
  }

  // ------------------------------------------------------------------
  // Room
  // ------------------------------------------------------------------
  private drawRoom(ctx: CanvasRenderingContext2D, t: number) {
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
    ctx.fillStyle = RUG;
    ctx.strokeStyle = RUG_DARK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(540, 1610, 390, 96, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(540, 1610, 330, 74, 0, 0, TAU);
    ctx.stroke();

    // Dodgy wall picture, kept simple.
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

    void t;
  }

  private scaleAround(
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    s: number,
    draw: () => void
  ) {
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(s, s);
    ctx.translate(-px, -py);
    draw();
    ctx.restore();
  }

  private drawBed(ctx: CanvasRenderingContext2D, scale: number) {
    this.scaleAround(ctx, 220, FLOOR_Y, scale, () => {
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
      ctx.strokeStyle = BLANKET_DARK;
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
      ctx.strokeStyle = PILLOW_DARK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(118, 1278);
      ctx.lineTo(188, 1278);
      ctx.stroke();
    });
  }

  private drawBookshelf(ctx: CanvasRenderingContext2D, scale: number) {
    this.scaleAround(ctx, 170, 1170, scale, () => {
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

      // Books.
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
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx + 4, y + 152 - h);
          ctx.lineTo(bx + 4, y + 132);
          ctx.stroke();
          bx += w + 9;
          seed++;
        }
      }
    });
  }

  private drawDesk(ctx: CanvasRenderingContext2D, scale: number) {
    this.scaleAround(ctx, 850, FLOOR_Y, scale, () => {
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

      // A drawer block under the desk.
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

      // Notebook on the desk.
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(855, 1070, 120, 40, 6);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#7d8fa8';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(871, 1080 + i * 9);
        ctx.lineTo(955, 1080 + i * 9);
        ctx.stroke();
      }
    });
  }

  private drawChair(ctx: CanvasRenderingContext2D, scale: number) {
    this.scaleAround(ctx, 850, FLOOR_Y, scale, () => {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';

      // Back legs and frame.
      ctx.fillStyle = CHAIR_DARK;
      for (const lx of [790, 894]) {
        ctx.beginPath();
        ctx.roundRect(lx, 1300, 24, 190, 6);
        ctx.fill();
        ctx.stroke();
      }

      // Backrest.
      ctx.fillStyle = CHAIR;
      ctx.beginPath();
      ctx.roundRect(792, 1128, 96, 156, 18);
      ctx.fill();
      ctx.stroke();

      // Seat.
      ctx.beginPath();
      ctx.roundRect(782, 1262, 132, 40, 14);
      ctx.fill();
      ctx.stroke();

      // Front legs.
      ctx.fillStyle = CHAIR_DARK;
      for (const lx of [776, 880]) {
        ctx.beginPath();
        ctx.roundRect(lx, 1300, 22, 196, 6);
        ctx.fill();
        ctx.stroke();
      }

      ctx.strokeStyle = '#a84632';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(806, 1150);
      ctx.lineTo(806, 1256);
      ctx.stroke();
    });
  }

  private drawLamp(ctx: CanvasRenderingContext2D, scale: number) {
    this.scaleAround(ctx, 660, FLOOR_Y, scale, () => {
      ctx.fillStyle = LAMP_DARK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(660, 1476, 76, 24, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.roundRect(650, 1010, 20, 470, 8);
      ctx.fill();
      ctx.stroke();

      // Shade.
      ctx.fillStyle = LAMP;
      ctx.beginPath();
      ctx.moveTo(584, 960);
      ctx.lineTo(736, 960);
      ctx.lineTo(704, 1064);
      ctx.lineTo(616, 1064);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = LAMP_DARK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(596, 976);
      ctx.lineTo(666, 976);
      ctx.stroke();
    });
  }

  private drawPillow(ctx: CanvasRenderingContext2D, t: number) {
    const squish = t >= 22.6 && t < 23.4 ? smooth((t - 22.6) / 0.8) : 0;
    const pulse = Math.sin(clamp((t - 22.6) / 0.8, 0, 1) * Math.PI);
    ctx.save();
    ctx.translate(330, 1470);
    ctx.scale(1 + pulse * 0.1, 1 - pulse * 0.16);
    ctx.translate(-330, -1470);

    ctx.fillStyle = '#f6c1d0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.roundRect(202, 1402, 256, 116, 46);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PILLOW;
    ctx.beginPath();
    ctx.roundRect(214, 1390, 232, 104, 42);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = PILLOW_DARK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(252, 1414);
    ctx.quadraticCurveTo(300, 1400, 338, 1420);
    ctx.stroke();
    void squish;
    ctx.restore();
  }

  private drawSneaker(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 21.35 || t > 26.5) return;
    const u = smooth(clamp((t - 21.35) / 1.65, 0, 1));
    const x = lerp(1180, 910, u);
    const tilt = t > 22.9 ? Math.sin((t - 22.9) * 9) * 0.02 * Math.max(0, 1 - (t - 22.9) * 2) : 0;

    ctx.save();
    ctx.translate(x, 1430);
    ctx.rotate(-0.05 + tilt);
    ctx.fillStyle = SHOE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-250, 20);
    ctx.quadraticCurveTo(-262, -50, -180, -62);
    ctx.lineTo(-60, -76);
    ctx.quadraticCurveTo(-10, -30, 60, -20);
    ctx.lineTo(210, -14);
    ctx.quadraticCurveTo(262, -4, 250, 46);
    ctx.lineTo(240, 78);
    ctx.lineTo(-236, 78);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sole.
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.roundRect(-246, 54, 492, 30, 14);
    ctx.fill();
    ctx.stroke();

    // Laces.
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-60 + i * 30, -46);
      ctx.lineTo(-40 + i * 30, -16);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawPencil(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 19.8) return;
    const u = smooth(clamp((t - 19.8) / 0.5, 0, 1));
    const baseX = 706;
    const baseY = 1496;
    const topX = 566;
    const topY = 1396;
    const x = lerp(baseX, baseX - 8, u);
    const y = lerp(baseY, baseY - 6, u);
    const tx = lerp(baseX + 30, topX, u);
    const ty = lerp(baseY, topY, u);

    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Tip.
    ctx.fillStyle = '#f4d6a0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(tx, ty, 10, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#4d4d4d';
    ctx.beginPath();
    ctx.arc(tx, ty, 5, 0, TAU);
    ctx.fill();

    // Eraser band.
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Character
  // ------------------------------------------------------------------
  private drawCharacter(
    ctx: CanvasRenderingContext2D,
    t: number,
    ch: CharState,
    held: { cx: number; cy: number; angle: number; scale: number } | null
  ) {
    const baseY = ch.ground - ch.lift;

    const pose = this.poseAt(t);
    const hipY = baseY - 300 + pose.hipDrop;
    if (held) {
      const half = (REMOTE_W * held.scale) / 2 - 28;
      pose.handL = {
        x: held.cx - Math.cos(held.angle) * half,
        y: held.cy - Math.sin(held.angle) * half,
      };
      pose.handR = {
        x: held.cx + Math.cos(held.angle) * half,
        y: held.cy + Math.sin(held.angle) * half,
      };
      pose.gripL = true;
      pose.gripR = true;
    } else {
      pose.handL = { x: ch.x + pose.handL.x, y: baseY + pose.handL.y };
      pose.handR = { x: ch.x + pose.handR.x, y: baseY + pose.handR.y };
    }

    const arms = this.computeArms(pose, ch.x, hipY);

    // Ground shadow stays on the floor even when he jumps.
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

    this.drawBody(ctx, ch.x, hipY, baseY, pose, arms, t);

    // The held remote is sandwiched between the palms and the fingers.
    if (held) this.drawRemote(ctx, held.cx, held.cy, held.angle, held.scale, t);

    const head = this.headPoint(pose, ch.x, hipY);
    this.drawHead(ctx, head.x, head.y, pose, t);

    if (held) {
      drawHand(ctx, arms.l, {
        side: 'left', pose: 'grip', layer: 'overlay', rotation: held.angle,
      });
      drawHand(ctx, arms.r, {
        side: 'right', pose: 'grip', layer: 'overlay', rotation: held.angle,
      });
    }

    ctx.restore();
  }

  private headPoint(pose: Pose, x: number, hipY: number): Pt {
    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(pose.lean) * 170;
    const headX = bodyTopX + Math.sin(pose.headTilt) * 10;
    // Shoulder is ~170 above the hip; head radius is HEAD_R. Place the head so
    // its bottom edge just touches the top of the neck (shoulderY - 20), giving
    // a continuous head -> neck -> body join with no gap.
    return { x: headX, y: shoulderY - 20 - HEAD_R + pose.headDrop };
  }

  private drawBody(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    groundY: number,
    pose: Pose,
    arms: { l: Arm; r: Arm },
    t: number
  ) {
    void t;
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(pose.lean) * 170;

    // Legs.
    const stance = pose.stance;
    const ankleBase = groundY - 16;
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
    const leftStyle: HandStyle = {
      side: 'left',
      pose: pose.pointL ? 'point' : pose.gripL ? 'grip' : pose.fistL ? 'fist' : 'relaxed',
      layer: 'full',
    };
    drawHand(ctx, arms.l, leftStyle);
    drawHand(ctx, arms.r, {
      side: 'right',
      pose: pose.gripR ? 'grip' : pose.fistR ? 'fist' : 'relaxed',
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
        return {
          x: sx + Math.sin(a1) * side * upper,
          y: sy + Math.cos(a1) * upper,
        };
      };

      const score = (e: Pt) => Math.hypot(e.x - headCx, e.y - headCy) + 0.35 * side * (e.x - sx);
      const preferred = elbowAt(bend);
      const other = elbowAt(bend === 1 ? -1 : 1);
      let elbow = score(preferred) + 8 >= score(other) ? preferred : other;

      const edx = elbow.x - headCx;
      const edy = elbow.y - headCy;
      const ed = Math.hypot(edx, edy);
      if (ed < elbowClear && ed > 0.001) {
        elbow = {
          x: headCx + (edx / ed) * elbowClear,
          y: headCy + (edy / ed) * elbowClear,
        };
      }

      return { sx, sy, ex: elbow.x, ey: elbow.y, hx, hy };
    };

    return { l: solve(-1, pose.handL, pose.bendL), r: solve(1, pose.handR, pose.bendR) };
  }

  private drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, pose: Pose, t: number) {
    const r = HEAD_R;

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
    const twitch = t >= 28.8 && t < 29.6 ? Math.sin(t * 26) * 2 : 0;
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

    // Folded lower edge.
    ctx.fillStyle = BEANIE_DEEP;
    ctx.beginPath();
    ctx.rect(-r - 4, -42, (r + 4) * 2, 18);
    ctx.fill();
    ctx.stroke();

    // Knit ribs.
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
  // Remote
  // ------------------------------------------------------------------
  private drawRemote(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    angle: number,
    scale: number,
    t: number
  ) {
    const w = REMOTE_W;
    const h = REMOTE_H;
    const pulse = 0.55 + 0.45 * Math.sin(t * 6);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    // Body.
    ctx.fillStyle = REMOTE_BODY;
    ctx.strokeStyle = REMOTE_EDGE;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 26);
    ctx.fill();
    ctx.stroke();

    // Glossy top edge.
    ctx.strokeStyle = '#454552';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 26, -h / 2 + 14);
    ctx.lineTo(w / 2 - 26, -h / 2 + 14);
    ctx.stroke();

    // Purple indicator light.
    ctx.fillStyle = PURPLE;
    ctx.globalAlpha = 0.5 + pulse * 0.5;
    ctx.beginPath();
    ctx.arc(-w / 2 + 26, h / 2 - 18, 6, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Large purple shrink button.
    const bx = -w * 0.16;
    const by = -35;
    ctx.fillStyle = 'rgba(168,85,247,0.28)';
    ctx.beginPath();
    ctx.arc(bx, by, 44, 0, TAU);
    ctx.fill();
    ctx.fillStyle = PURPLE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(bx, by, 32, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Shrink icon: four inward arrows.
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const ax = bx + dx * 17;
      const ay = by + dy * 17;
      const tx = bx + dx * 8;
      const ty = by + dy * 8;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx, ty - dy * 5);
      ctx.lineTo(tx, ty);
      ctx.lineTo(tx - dx * 5, ty);
      ctx.stroke();
    }

    // Small red reset button.
    const rx = w * 0.28;
    const ry = -33;
    ctx.fillStyle = RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(rx, ry, 18, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Reset icon: circular arrow.
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(rx, ry, 9, Math.PI * 0.25, Math.PI * 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx + 9, ry - 8);
    ctx.lineTo(rx + 12, ry - 1);
    ctx.lineTo(rx + 4, ry);
    ctx.stroke();

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Purple beam
  // ------------------------------------------------------------------
  private drawBeams(
    ctx: CanvasRenderingContext2D,
    t: number,
    ch: CharState,
    held: { cx: number; cy: number; angle: number; scale: number } | null
  ) {
    const muzzle = held
      ? {
          x: held.cx + Math.cos(held.angle) * (REMOTE_W * held.scale) / 2,
          y: held.cy + Math.sin(held.angle) * (REMOTE_W * held.scale) / 2,
        }
      : { x: REMOTE_FLOOR_X + REMOTE_W / 2 - 10, y: REMOTE_FLOOR_Y - 20 };

    const shots = [
      { start: 3.95, to: { x: 850, y: 1250 }, color: PURPLE },
      { start: 6.6, to: { x: 840, y: 1130 }, color: PURPLE },
      { start: 7.8, to: { x: 660, y: 1000 }, color: PURPLE },
      { start: 8.7, to: { x: 180, y: 950 }, color: PURPLE },
      { start: 12.2, to: { x: ch.x, y: ch.ground - 400 }, color: PURPLE },
    ];

    for (const shot of shots) {
      this.strokeBeam(ctx, muzzle, shot.to, t, shot.start, shot.color);
    }

    // Scene 5: the beam fans out over every piece of furniture still standing.
    if (t >= 26.02 && t < 26.7) {
      const targets = [
        { x: 220, y: 1380 },
        { x: 840, y: 1480 },
        { x: 660, y: 1480 },
        { x: 180, y: 1150 },
      ];
      for (const target of targets) {
        this.strokeBeam(ctx, muzzle, target, t, 26.02, PURPLE);
      }
    }
  }

  private strokeBeam(
    ctx: CanvasRenderingContext2D,
    from: Pt,
    to: Pt,
    t: number,
    start: number,
    color: string
  ) {
    if (t < start) return;
    const travel = clamp((t - start) / 0.16, 0, 1);
    const hold = 1 - clamp((t - (start + 0.18)) / 0.26, 0, 1);
    if (hold <= 0) return;

    const end = {
      x: lerp(from.x, to.x, easeOut(travel)),
      y: lerp(from.y, to.y, easeOut(travel)),
    };

    ctx.save();
    ctx.globalAlpha = hold;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(168,85,247,0.3)';
    ctx.lineWidth = 34;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.strokeStyle = PURPLE_LIGHT;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    if (travel >= 1) {
      for (let i = 0; i < 3; i++) {
        const u = (t - start) * 6 + i * 0.33;
        const radius = Math.max(1, 18 + Math.sin(u * Math.PI) * 34);
        ctx.strokeStyle = PURPLE_LIGHT;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(to.x, to.y, radius, 0, TAU);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private drawDust(ctx: CanvasRenderingContext2D, t: number, ch: CharState) {
    if (t >= 22.5 && t < 23.2) {
      const u = (t - 22.5) / 0.7;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 5; i++) {
        const dx = (i - 2) * 26;
        const dy = -Math.sin(u * Math.PI) * (20 + i * 7);
        ctx.beginPath();
        ctx.arc(ch.x + dx, ch.ground - 10 + dy, 9 - i, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
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
