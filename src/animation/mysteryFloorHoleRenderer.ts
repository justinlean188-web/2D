import type { StudioConfig } from '../types';
import { drawHand } from './handRenderer';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

// --- Locked Character Palette (POP_UP_TENT_CHARACTER.md) --------------------
const INK = '#17121f';
const WHITE = '#ffffff';

const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const BEANIE_POM = '#ff6b6b';
const SHIRT = '#ffd166';
const SHIRT_DEEP = '#e8b23f';
const TROUSER = '#2f5fa8';
const SHOE = '#141414';

// --- Scene & Prop Palette (Modern Pop 2D Flat Vector) ----------------------
const WALL_TOP = '#efe6ff';
const WALL_MAIN = '#fff9f2';
const WALL_STRIPE = '#f6edff';
const BASEBOARD = '#ffffff';
const FLOOR = '#e2ae74';
const FLOOR_LINE = '#c99155';

const PURPLE_DEEP = '#140826';
const PURPLE_GLOW = '#a855f7';
const PURPLE_LIGHT = '#e9d5ff';

const GOLD = '#facc15';
const GOLD_DEEP = '#eab308';
const DUCK_YELLOW = '#fde047';
const DUCK_ORANGE = '#f97316';
const CAR_RED = '#ef4444';
const CAR_BLUE = '#38bdf8';
const WOOD_MAIN = '#a96b38';
const WOOD_DARK = '#7c4a21';
const WOOD_LIGHT = '#c9884f';

const FLOOR_Y = 1500;
const HEAD_R = 70;
const HOLE_X = 560;
const HOLE_Y = FLOOR_Y;

// --- Helpers ---------------------------------------------------------------
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
  handL: Pt; // relative to char x (dx), world y relative to ground=FLOOR_Y
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
  headTurn: 3,
  look: 'front',
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
  // --- Scene 1 (0–6s): Discovers hole, drops tiny coin, recoils at giant coin ---
  {
    t: 0.0,
    p: {
      lean: 0.04,
      look: 'down',
      mouth: 'smile',
      brow: 'normal',
      eye: 'open',
      handL: { x: -68, y: 1246 },
      handR: { x: 68, y: 1246 },
    },
  },
  {
    t: 1.5,
    p: {
      lean: 0.22,
      crouch: 0.28,
      look: 'down',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      bendR: -1,
      handL: { x: -70, y: 1248 },
      handR: { x: 145, y: 1185 },
    },
  },
  {
    t: 2.35,
    p: {
      lean: 0.24,
      crouch: 0.25,
      look: 'down',
      mouth: 'smirk',
      brow: 'raised',
      eye: 'open',
      bendR: -1,
      handL: { x: -68, y: 1248 },
      handR: { x: 162, y: 1170 },
    },
  },
  {
    t: 3.45,
    p: {
      lean: -0.18,
      crouch: 0.16,
      stance: 32,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      bendL: -1,
      bendR: -1,
      handL: { x: -125, y: 1125 },
      handR: { x: 125, y: 1125 },
    },
  },
  {
    t: 5.2,
    p: {
      lean: -0.05,
      crouch: 0,
      stance: 12,
      look: 'right',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      handL: { x: -85, y: 1230 },
      handR: { x: 140, y: 1140 },
      pointR: true,
    },
  },

  // --- Scene 2 (6–12s): Drops rubber duck, jumps back from giant bouncing duck ---
  {
    t: 6.2,
    p: {
      lean: 0.14,
      crouch: 0.15,
      look: 'down',
      mouth: 'grin',
      brow: 'cocky',
      eye: 'open',
      pointR: false,
      gripR: true,
      bendR: -1,
      handL: { x: -68, y: 1248 },
      handR: { x: 145, y: 1165 },
    },
  },
  {
    t: 7.2,
    p: {
      lean: 0.2,
      look: 'down',
      mouth: 'smile',
      brow: 'raised',
      eye: 'open',
      gripR: false,
      bendR: -1,
      handL: { x: -68, y: 1248 },
      handR: { x: 165, y: 1175 },
    },
  },
  {
    t: 8.1,
    p: {
      lean: -0.22,
      crouch: 0.3,
      stance: 38,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      bendL: -1,
      bendR: -1,
      handL: { x: -135, y: 1090 },
      handR: { x: 135, y: 1090 },
    },
  },
  {
    t: 10.6,
    p: {
      lean: -0.08,
      crouch: 0.1,
      look: 'right',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -95, y: 1210 },
      handR: { x: 95, y: 1210 },
    },
  },

  // --- Scene 3 (12–18s): Drops tiny toy car, runs away from giant car! ---
  {
    t: 12.2,
    p: {
      lean: 0.16,
      crouch: 0.2,
      look: 'down',
      mouth: 'grin',
      brow: 'determined',
      eye: 'open',
      gripR: true,
      bendR: -1,
      handL: { x: -68, y: 1248 },
      handR: { x: 145, y: 1170 },
    },
  },
  {
    t: 13.15,
    p: {
      lean: 0.2,
      look: 'down',
      mouth: 'smirk',
      brow: 'raised',
      eye: 'open',
      gripR: false,
      handL: { x: -68, y: 1248 },
      handR: { x: 168, y: 1178 },
    },
  },
  {
    t: 14.0,
    p: {
      lean: -0.24,
      crouch: 0.22,
      stance: 30,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -135, y: 1085 },
      handR: { x: 135, y: 1085 },
    },
  },
  {
    t: 15.6,
    p: {
      lean: -0.3,
      crouch: 0.18,
      stance: 42,
      look: 'right',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -145, y: 1055 },
      handR: { x: 130, y: 1120 },
    },
  },

  // --- Scene 4 (18–24s): Mischievous lean over hole, beanie drops in, trapped! ---
  {
    t: 18.2,
    p: {
      lean: 0.1,
      crouch: 0.08,
      stance: 10,
      look: 'down',
      mouth: 'smirk',
      brow: 'cocky',
      eye: 'open',
      handL: { x: -68, y: 1248 },
      handR: { x: 68, y: 1248 },
    },
  },
  {
    t: 19.3,
    p: {
      lean: 0.34,
      crouch: 0.35,
      headTilt: 0.28,
      look: 'down',
      mouth: 'grin',
      brow: 'cocky',
      eye: 'open',
      handL: { x: -75, y: 1240 },
      handR: { x: 92, y: 1235 },
    },
  },
  {
    t: 19.8,
    p: {
      lean: 0.28,
      crouch: 0.32,
      headTilt: 0.22,
      look: 'down',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      beanieOn: false,
      bendL: -1,
      bendR: -1,
      handL: { x: -105, y: 1140 },
      handR: { x: 125, y: 1140 },
    },
  },
  {
    t: 21.4,
    p: {
      lean: 0.06,
      crouch: 0.45,
      beanieOn: false,
      look: 'front',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -140, y: 1060 },
      handR: { x: 140, y: 1060 },
    },
  },

  // --- Scene 5 (24–30s): Covers hole with board, celebrates, giant head erupts! ---
  {
    t: 24.4,
    p: {
      lean: -0.15,
      crouch: 0.3,
      beanieOn: false,
      look: 'left',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      gripL: true,
      gripR: true,
      handL: { x: -110, y: 1210 },
      handR: { x: -20, y: 1210 },
    },
  },
  {
    t: 25.4,
    p: {
      lean: 0.22,
      crouch: 0.4,
      beanieOn: false,
      look: 'down',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      gripL: true,
      gripR: true,
      handL: { x: 20, y: 1280 },
      handR: { x: 120, y: 1280 },
    },
  },
  {
    t: 26.15,
    p: {
      lean: 0,
      crouch: 0,
      stance: 18,
      headTilt: -0.04,
      beanieOn: false,
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
      handL: { x: -115, y: 985 },
      handR: { x: 115, y: 985 },
    },
  },
  {
    t: 27.6,
    p: {
      lean: -0.1,
      crouch: 0.14,
      beanieOn: false,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      fistL: false,
      fistR: false,
      bendL: 1,
      bendR: 1,
      handL: { x: -110, y: 1190 },
      handR: { x: 110, y: 1190 },
    },
  },
  {
    t: 28.65,
    p: {
      lean: 0,
      crouch: 0,
      stance: 4,
      headTilt: 0,
      headTurn: 0,
      beanieOn: false,
      look: 'front',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -68, y: 1248 },
      handR: { x: 68, y: 1248 },
    },
  },
];

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

function buildPoseKeys(): { t: number; p: Pose }[] {
  const keys: { t: number; p: Pose }[] = [];
  let cur: Pose = { ...BASE_POSE };
  for (const patch of POSE_PATCHES) {
    cur = { ...cur, ...patch.p };
    keys.push({ t: patch.t, p: cur });
  }
  return keys;
}

const POSE_KEYS = buildPoseKeys();

const CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: 0.25, to: 5.8, text: 'WHAT IS THIS HOLE?!' },
  { from: 6.2, to: 11.8, text: 'IT MAKES EVERYTHING HUGE!' },
  { from: 12.2, to: 17.85, text: "THAT'S TOO BIG!" },
  { from: 18.2, to: 23.85, text: 'NOT MY BEANIE!' },
  { from: 24.3, to: 29.95, text: "I'M NEVER TOUCHING THAT AGAIN!" },
];

export class MysteryFloorHoleRenderer {
  public render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig): void {
    ctx.save();
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // 1. Living room wall, window & wooden floor
    this.drawRoom(ctx);

    // 2. Living-room furniture (chair at x=875, coffee table at x=730)
    this.drawFurniture(ctx, time);

    // 3. Mysterious glowing purple hole in the floor
    this.drawPurpleHole(ctx, time);

    // 4. Dropped tiny props falling into the hole (before giant versions erupt)
    this.drawSmallDroppedObjects(ctx, time);

    // 5. Giant objects emerging & floorboard / giant head
    this.drawGiantCoin(ctx, time);
    this.drawGiantDuck(ctx, time);
    this.drawWoodenFloorboard(ctx, time);
    this.drawGiantStickmanHead(ctx, time);

    // 6. Angry Stickman
    this.drawCharacter(ctx, time);

    // 7. Giant Toy Car (passes across front during chase) & Giant Beanie blanket
    this.drawGiantCar(ctx, time);
    this.drawGiantBeanieBlanket(ctx, time);

    // 8. Portal sparks & burst rays
    this.drawPortalParticles(ctx, time);

    // 9. Burned-in captions
    if (config.showCaptions) {
      this.drawCaptions(ctx, time);
    }

    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Character Motion Blocking
  // -------------------------------------------------------------------------
  private charAt(t: number): { x: number; ground: number; lift: number; flip: number } {
    // Scene 1: walks in 200 -> 360, drops coin, hops back to 240 when giant coin slams
    if (t < 1.4) {
      const u = smooth(inv(0.0, 1.4, t));
      return { x: lerp(210, 360, u), ground: FLOOR_Y, lift: Math.abs(Math.sin(t * 9)) * 10, flip: 1 };
    }
    if (t < 3.35) return { x: 360, ground: FLOOR_Y, lift: 0, flip: 1 };
    if (t < 6.0) {
      const hopU = inv(3.35, 4.15, t);
      const lift = hopU < 1 ? Math.sin(hopU * Math.PI) * 70 : 0;
      return { x: lerp(360, 240, smooth(inv(3.35, 4.0, t))), ground: FLOOR_Y, lift, flip: 1 };
    }

    // Scene 2: walks back to 360 to drop duck, jumps back to 215 from giant duck
    if (t < 7.85) {
      return { x: lerp(240, 365, smooth(inv(6.0, 6.7, t))), ground: FLOOR_Y, lift: 0, flip: 1 };
    }
    if (t < 12.0) {
      const hop = inv(7.95, 8.65, t);
      return {
        x: lerp(365, 215, smooth(inv(7.95, 8.75, t))),
        ground: FLOOR_Y,
        lift: hop < 1 ? Math.sin(hop * Math.PI) * 110 : 0,
        flip: 1,
      };
    }

    // Scene 3: walks to 365 to drop toy car, runs left & leaps away from giant car!
    if (t < 13.85) {
      return { x: lerp(215, 365, smooth(inv(12.0, 12.6, t))), ground: FLOOR_Y, lift: 0, flip: 1 };
    }
    if (t < 18.0) {
      const runX = lerp(365, 130, smooth(inv(14.0, 15.6, t)));
      const jump = inv(15.6, 16.9, t);
      const hop = jump < 1 && t >= 15.6 ? Math.sin(jump * Math.PI) * 260 : 0;
      return { x: runX, ground: FLOOR_Y, lift: hop, flip: 1 };
    }

    // Scene 4: returns to 395, leans over hole, drops beanie, squirms under giant beanie blanket
    if (t < 20.8) {
      return { x: lerp(130, 395, smooth(inv(18.0, 18.8, t))), ground: FLOOR_Y, lift: 0, flip: 1 };
    }
    if (t < 24.0) {
      const wiggle = Math.sin(t * 22) * 18;
      return { x: 430 + wiggle, ground: FLOOR_Y, lift: Math.abs(Math.sin(t * 14)) * 16, flip: 1 };
    }

    // Scene 5: pulls giant beanie left (24-25s), slams board over hole (25-25.8s), celebrates & freezes
    if (t < 25.0) {
      return { x: lerp(430, 320, smooth(inv(24.0, 24.8, t))), ground: FLOOR_Y, lift: 0, flip: 1 };
    }
    if (t < 26.1) {
      return { x: lerp(320, 345, smooth(inv(25.0, 25.7, t))), ground: FLOOR_Y, lift: 0, flip: 1 };
    }
    if (t < 27.6) {
      return {
        x: 310,
        ground: FLOOR_Y,
        lift: Math.abs(Math.sin((t - 26.1) * 8)) * 22,
        flip: 1,
      };
    }
    return { x: lerp(310, 260, smooth(inv(27.6, 28.4, t))), ground: FLOOR_Y, lift: 0, flip: 1 };
  }

  private poseAt(t: number): Pose {
    if (t <= POSE_KEYS[0].t) return { ...POSE_KEYS[0].p };
    if (t >= POSE_KEYS[POSE_KEYS.length - 1].t) {
      return { ...POSE_KEYS[POSE_KEYS.length - 1].p };
    }
    let idx = 0;
    for (let i = 0; i < POSE_KEYS.length - 1; i++) {
      if (t >= POSE_KEYS[i].t && t <= POSE_KEYS[i + 1].t) {
        idx = i;
        break;
      }
    }
    const a = POSE_KEYS[idx];
    const b = POSE_KEYS[idx + 1];
    const raw = (t - a.t) / Math.max(0.0001, b.t - a.t);
    const u = smooth(raw);
    const mid = raw >= 0.5;
    const ch = this.charAt(t);

    const dxL = lerp(a.p.handL.x, b.p.handL.x, u);
    const dyL = lerp(a.p.handL.y, b.p.handL.y, u);
    const dxR = lerp(a.p.handR.x, b.p.handR.x, u);
    const dyR = lerp(a.p.handR.y, b.p.handR.y, u);

    return {
      lean: lerp(a.p.lean, b.p.lean, u),
      hipDrop: lerp(a.p.hipDrop, b.p.hipDrop, u),
      headTilt: lerp(a.p.headTilt, b.p.headTilt, u),
      headDrop: lerp(a.p.headDrop, b.p.headDrop, u),
      headTurn: lerp(a.p.headTurn, b.p.headTurn, u),
      look: mid ? b.p.look : a.p.look,
      mouth: mid ? b.p.mouth : a.p.mouth,
      brow: mid ? b.p.brow : a.p.brow,
      eye: mid ? b.p.eye : a.p.eye,
      stance: lerp(a.p.stance, b.p.stance, u),
      footLift: lerp(a.p.footLift, b.p.footLift, u),
      handL: { x: ch.x + dxL, y: dyL - ch.lift },
      handR: { x: ch.x + dxR, y: dyR - ch.lift },
      bendL: mid ? b.p.bendL : a.p.bendL,
      bendR: mid ? b.p.bendR : a.p.bendR,
      gripL: mid ? b.p.gripL : a.p.gripL,
      gripR: mid ? b.p.gripR : a.p.gripR,
      fistL: mid ? b.p.fistL : a.p.fistL,
      fistR: mid ? b.p.fistR : a.p.fistR,
      pointL: mid ? b.p.pointL : a.p.pointL,
      pointR: mid ? b.p.pointR : a.p.pointR,
      beanieOn: mid ? b.p.beanieOn : a.p.beanieOn,
      crouch: lerp(a.p.crouch, b.p.crouch, u),
      sit: lerp(a.p.sit, b.p.sit, u),
    };
  }

  // -------------------------------------------------------------------------
  // Room & Living-Room Furniture
  // -------------------------------------------------------------------------
  private drawRoom(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = WALL_MAIN;
    ctx.fillRect(0, 0, WIDTH, FLOOR_Y);

    ctx.fillStyle = WALL_TOP;
    ctx.fillRect(0, 0, WIDTH, 210);

    ctx.fillStyle = WALL_STRIPE;
    for (let x = 35; x < WIDTH; x += 180) {
      ctx.fillRect(x, 210, 74, FLOOR_Y - 210);
    }

    // Living-room window
    ctx.save();
    ctx.fillStyle = '#bae6fd';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(410, 310, 260, 290, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(495, 390, 30, 0, TAU);
    ctx.arc(535, 384, 36, 0, TAU);
    ctx.arc(572, 395, 26, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(540, 310);
    ctx.lineTo(540, 600);
    ctx.moveTo(410, 455);
    ctx.lineTo(670, 455);
    ctx.stroke();
    ctx.restore();

    // Baseboard
    ctx.fillStyle = BASEBOARD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillRect(0, FLOOR_Y - 46, WIDTH, 46);
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y - 46);
    ctx.lineTo(WIDTH, FLOOR_Y - 46);
    ctx.stroke();

    // Wooden floor
    ctx.fillStyle = FLOOR;
    ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);

    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 4;
    for (let y = FLOOR_Y + 75; y < HEIGHT; y += 82) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }

    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(WIDTH, FLOOR_Y);
    ctx.stroke();
  }

  private drawFurniture(ctx: CanvasRenderingContext2D, t: number) {
    // 1. Living-room chair (right side, knocked over at 9.25s by giant duck!)
    const chairFall = smooth(inv(9.2, 9.8, t));
    const chairRot = lerp(0, 1.38, chairFall);
    const chairX = lerp(900, 965, chairFall);
    const chairY = lerp(FLOOR_Y, FLOOR_Y - 12, chairFall);

    ctx.save();
    ctx.translate(chairX, chairY);
    ctx.rotate(chairRot);
    ctx.fillStyle = WOOD_MAIN;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    // Chair back & legs
    ctx.beginPath();
    ctx.roundRect(-55, -240, 22, 240, 6);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(33, -110, 22, 110, 6);
    ctx.fill();
    ctx.stroke();
    // Seat
    ctx.fillStyle = WOOD_LIGHT;
    ctx.beginPath();
    ctx.roundRect(-62, -124, 124, 24, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Small Wooden Side Table (at x=760, smashed at 14.5s by giant car!)
    if (t < 14.5) {
      ctx.save();
      ctx.translate(765, FLOOR_Y);
      ctx.fillStyle = WOOD_DARK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.fillRect(-52, -135, 16, 135);
      ctx.strokeRect(-52, -135, 16, 135);
      ctx.fillRect(36, -135, 16, 135);
      ctx.strokeRect(36, -135, 16, 135);
      ctx.fillStyle = WOOD_MAIN;
      ctx.beginPath();
      ctx.roundRect(-75, -155, 150, 24, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (t < 16.2) {
      // Flying/toppled table debris after giant car smash
      const u = inv(14.5, 15.8, t);
      ctx.save();
      ctx.globalAlpha = 1 - smooth(inv(15.3, 16.2, t));
      ctx.translate(lerp(765, 960, u), FLOOR_Y - Math.sin(u * Math.PI) * 160);
      ctx.rotate(u * 2.4);
      ctx.fillStyle = WOOD_MAIN;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(-70, -14, 140, 24, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------------
  // Mysterious Glowing Purple Hole
  // -------------------------------------------------------------------------
  private drawPurpleHole(ctx: CanvasRenderingContext2D, t: number) {
    const pulse = 1 + Math.sin(t * 6) * 0.08;
    const surge =
      (t >= 2.7 && t <= 3.7) ||
      (t >= 7.5 && t <= 8.3) ||
      (t >= 13.4 && t <= 14.2) ||
      (t >= 20.3 && t <= 21.1) ||
      (t >= 27.1 && t <= 28.2)
        ? 1.45
        : 1.0;

    ctx.save();
    ctx.translate(HOLE_X, HOLE_Y);

    // Outer purple glow halo
    ctx.fillStyle = 'rgba(168, 85, 247, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 124 * pulse * surge, 34 * pulse * surge, 0, 0, TAU);
    ctx.fill();

    // Glowing ring rim
    ctx.fillStyle = PURPLE_GLOW;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 96, 25, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Inner bright highlight rim
    ctx.strokeStyle = PURPLE_LIGHT;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 88, 20, 0, 0, TAU);
    ctx.stroke();

    // Deep pitch-purple void
    ctx.fillStyle = PURPLE_DEEP;
    ctx.beginPath();
    ctx.ellipse(0, 1, 78, 17, 0, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Small Objects Falling Into the Hole (Continuity before giant emergence)
  // -------------------------------------------------------------------------
  private drawCoinShape(ctx: CanvasRenderingContext2D, r: number) {
    ctx.fillStyle = GOLD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(3, r * 0.06);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = GOLD_DEEP;
    ctx.lineWidth = Math.max(2, r * 0.05);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.74, 0, TAU);
    ctx.stroke();

    ctx.fillStyle = GOLD_DEEP;
    ctx.font = `900 ${Math.round(r * 0.95)}px "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, r * 0.05);
  }

  private drawDuckShape(ctx: CanvasRenderingContext2D, scale: number) {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;

    // Body
    ctx.fillStyle = DUCK_YELLOW;
    ctx.beginPath();
    ctx.ellipse(0, 14, 48, 34, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(26, -24, 24, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Orange beak
    ctx.fillStyle = DUCK_ORANGE;
    ctx.beginPath();
    ctx.moveTo(45, -28);
    ctx.lineTo(68, -21);
    ctx.lineTo(45, -13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wing
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(-6, 12, 24, 14, -0.2, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(33, -29, 4.5, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawCarShape(ctx: CanvasRenderingContext2D, scale: number) {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;

    // Roof cabin
    ctx.fillStyle = CAR_BLUE;
    ctx.beginPath();
    ctx.roundRect(-48, -56, 86, 36, 14);
    ctx.fill();
    ctx.stroke();

    // Car body
    ctx.fillStyle = CAR_RED;
    ctx.beginPath();
    ctx.roundRect(-84, -26, 168, 44, 14);
    ctx.fill();
    ctx.stroke();

    // Yellow headlight on left front (faces chase direction)
    ctx.fillStyle = DUCK_YELLOW;
    ctx.beginPath();
    ctx.roundRect(-86, -16, 14, 16, 4);
    ctx.fill();
    ctx.stroke();

    // Wheels
    for (const wx of [-48, 48]) {
      ctx.fillStyle = SHOE;
      ctx.beginPath();
      ctx.arc(wx, 22, 20, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.arc(wx, 22, 7, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawSmallDroppedObjects(ctx: CanvasRenderingContext2D, t: number) {
    // 1. Small coin (1.5–2.7s)
    if (t >= 1.4 && t < 2.75) {
      const drop = inv(2.2, 2.75, t);
      const x = lerp(522, HOLE_X, drop);
      const y = lerp(1180, HOLE_Y + 6, drop * drop);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(drop * 3.2);
      this.drawCoinShape(ctx, 18);
      ctx.restore();
    }

    // 2. Small yellow rubber duck (6.1–7.55s)
    if (t >= 6.1 && t < 7.55) {
      const drop = inv(7.05, 7.55, t);
      const x = lerp(515, HOLE_X, drop);
      const y = lerp(1165, HOLE_Y + 8, drop * drop);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(drop * 0.7);
      this.drawDuckShape(ctx, 0.45);
      ctx.restore();
    }

    // 3. Small toy car (12.1–13.45s)
    if (t >= 12.1 && t < 13.45) {
      const drop = inv(13.0, 13.45, t);
      const x = lerp(515, HOLE_X, drop);
      const y = lerp(1170, HOLE_Y + 8, drop * drop);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(drop * 0.8);
      this.drawCarShape(ctx, 0.42);
      ctx.restore();
    }

    // 4. Stickman's actual red beanie falling off into the hole (19.65–20.35s)
    if (t >= 19.65 && t < 20.35) {
      const u = inv(19.65, 20.35, t);
      const x = lerp(470, HOLE_X, smooth(u));
      const y = lerp(1035, HOLE_Y + 10, u * u);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(lerp(0.25, 1.4, u));
      ctx.scale(0.88, 0.88);
      this.drawBeanieShape(ctx);
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------------
  // Giant Oversized Objects Emerging From the Hole
  // -------------------------------------------------------------------------
  private drawGiantCoin(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 3.25 || t > 6.1) return;
    let x = HOLE_X;
    let y = HOLE_Y;
    let rot = 0;
    let scale = 1;

    if (t < 4.15) {
      const u = inv(3.25, 4.15, t);
      x = lerp(HOLE_X, 740, easeOut(u));
      y = lerp(HOLE_Y - 10, FLOOR_Y - 155, u) - Math.sin(u * Math.PI) * 430;
      rot = u * 2.2;
      scale = clamp(u * 2.8, 0.25, 1);
    } else if (t < 5.1) {
      x = 740;
      y = FLOOR_Y - 155 - Math.abs(Math.sin((t - 4.15) * 8)) * (5.1 - t) * 35;
      rot = 2.2;
    } else {
      const roll = inv(5.1, 6.05, t);
      x = lerp(740, 1260, smooth(roll));
      y = FLOOR_Y - 155;
      rot = 2.2 + roll * 4.5;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    this.drawCoinShape(ctx, 155);
    ctx.restore();
  }

  private drawGiantDuck(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 7.8 || t > 12.0) return;
    let x = HOLE_X;
    let y = FLOOR_Y - 110;
    let scale = 3.1;

    if (t < 8.55) {
      const u = inv(7.8, 8.55, t);
      x = lerp(HOLE_X, 720, u);
      y = lerp(FLOOR_Y, FLOOR_Y - 110, u) - Math.sin(u * Math.PI) * 360;
      scale = lerp(0.6, 3.1, easeOut(u));
    } else if (t < 9.65) {
      const u = inv(8.55, 9.65, t);
      x = lerp(720, 880, u);
      y = FLOOR_Y - 110 - Math.sin(u * Math.PI) * 230;
    } else {
      const u = inv(9.65, 11.8, t);
      x = lerp(880, 1340, smooth(u));
      y = FLOOR_Y - 110 - Math.abs(Math.sin(u * Math.PI * 2)) * 120;
    }

    ctx.save();
    ctx.translate(x, y);
    this.drawDuckShape(ctx, scale);
    ctx.restore();
  }

  private drawGiantCar(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 13.7 || t > 18.0) return;
    let x = HOLE_X;
    let y = FLOOR_Y - 135;
    let scale = 3.2;

    if (t < 14.55) {
      const u = inv(13.7, 14.55, t);
      x = lerp(HOLE_X, 735, u);
      y = lerp(FLOOR_Y, FLOOR_Y - 135, u) - Math.sin(u * Math.PI) * 350;
      scale = lerp(0.55, 3.2, easeOut(u));
    } else if (t < 15.15) {
      x = 735;
      y = FLOOR_Y - 135;
    } else {
      const drive = inv(15.15, 17.9, t);
      x = lerp(735, -360, smooth(drive));
      y = FLOOR_Y - 135 - Math.abs(Math.sin(t * 24)) * 8;
    }

    ctx.save();
    ctx.translate(x, y);
    this.drawCarShape(ctx, scale);
    ctx.restore();
  }

  private drawGiantBeanieBlanket(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 20.7 || t > 25.0) return;

    // 20.7–21.3s: bursts high; 21.3–24.0s: blankets Stickman & room; 24.0–25.0s: pulled aside to left pile
    let cx = HOLE_X;
    let cy = FLOOR_Y - 90;
    let scaleX = 5.4;
    let scaleY = 4.2;

    if (t < 21.35) {
      const u = inv(20.7, 21.35, t);
      cx = lerp(HOLE_X, 490, u);
      cy = lerp(FLOOR_Y, FLOOR_Y - 120, u) - Math.sin(u * Math.PI) * 440;
      scaleX = lerp(1.0, 5.6, easeOut(u));
      scaleY = lerp(1.0, 4.4, easeOut(u));
    } else if (t < 24.0) {
      const squirm = Math.sin(t * 18) * 18;
      cx = 490 + squirm;
      cy = FLOOR_Y - 20;
      scaleX = 5.6 + Math.sin(t * 15) * 0.25;
      scaleY = 4.2 + Math.cos(t * 16) * 0.2;
    } else {
      const pull = smooth(inv(24.0, 25.0, t));
      cx = lerp(490, 90, pull);
      cy = FLOOR_Y - 10;
      scaleX = lerp(5.6, 2.2, pull);
      scaleY = lerp(4.2, 1.5, pull);
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scaleX, scaleY);
    this.drawBeanieShape(ctx);
    ctx.restore();
  }

  private drawWoodenFloorboard(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 25.2) return;
    let x = 560;
    let y = FLOOR_Y - 16;
    let rot = 0;
    let alpha = 1;

    if (t < 25.8) {
      const u = inv(25.2, 25.8, t);
      x = lerp(455, HOLE_X, smooth(u));
      y = lerp(1240, FLOOR_Y - 12, u);
      rot = lerp(-0.35, 0, u);
    } else if (t < 27.65) {
      // Shakes violently as purple energy builds underneath!
      const shake = t >= 27.1 ? Math.sin(t * 58) * 9 : 0;
      x = HOLE_X + shake;
      y = FLOOR_Y - 12 - (t >= 27.1 ? Math.abs(Math.sin(t * 32)) * 18 : 0);
    } else {
      // Blasted upward and off to right when giant head erupts
      const u = inv(27.65, 28.4, t);
      x = lerp(HOLE_X, 940, easeOut(u));
      y = lerp(FLOOR_Y - 12, FLOOR_Y - 16, u) - Math.sin(u * Math.PI) * 480;
      rot = lerp(0, 2.6, u);
      alpha = 1 - smooth(inv(28.1, 28.5, t));
    }

    if (alpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = WOOD_MAIN;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(-145, -18, 290, 36, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = WOOD_LIGHT;
    ctx.fillRect(-125, -8, 250, 8);
    ctx.restore();
  }

  private drawGiantStickmanHead(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 27.65) return;
    const u = clamp(inv(27.65, 28.55, t), 0, 1);
    const x = lerp(HOLE_X, 685, easeOut(u));
    const y = lerp(FLOOR_Y, FLOOR_Y - 220, u) - Math.sin(u * Math.PI) * 320;
    const scale = lerp(0.55, 3.1, easeOut(u));

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Exact locked Stickman head (white circle + 5px ink + vertical oval eyes + brows + flat mouth)
    this.drawHead(ctx, 0, 0, {
      ...BASE_POSE,
      beanieOn: false,
      headTilt: 0,
      headTurn: -2,
      look: 'left',
      eye: 'wide',
      brow: 'raised',
      mouth: 'o',
    });
    ctx.restore();
  }

  private drawPortalParticles(ctx: CanvasRenderingContext2D, t: number) {
    const eruptTimes = [3.3, 7.85, 13.75, 20.75, 27.7];
    for (const et of eruptTimes) {
      const dt = t - et;
      if (dt < 0 || dt > 0.55) continue;
      const u = dt / 0.55;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      for (let i = 0; i < 8; i++) {
        const ang = -Math.PI * 0.9 + (i / 7) * Math.PI * 0.8;
        const dist = u * 260;
        const px = HOLE_X + Math.cos(ang) * dist * 1.1;
        const py = HOLE_Y - 20 + Math.sin(ang) * dist * 1.6;
        ctx.fillStyle = i % 2 === 0 ? PURPLE_GLOW : PURPLE_LIGHT;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(px, py, 16 * (1 - u * 0.5), 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------------
  // Locked Character Rig (POP_UP_TENT_CHARACTER.md — exact proportions)
  // -------------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, t: number) {
    const ch = this.charAt(t);
    const pose = this.poseAt(t);
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

    ctx.strokeStyle = INK;
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(kneeL.x, kneeL.y);
    ctx.lineTo(ankleL.x, ankleL.y);
    ctx.moveTo(kneeR.x, kneeR.y);
    ctx.lineTo(ankleR.x, ankleR.y);
    ctx.stroke();

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

    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(bodyTopX, shoulderY + 8);
    ctx.lineTo(bodyTopX, shoulderY - 20);
    ctx.stroke();

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

  // -------------------------------------------------------------------------
  // Captions & Safe Zones
  // -------------------------------------------------------------------------
  private drawCaptions(ctx: CanvasRenderingContext2D, t: number) {
    const caption = CAPTIONS.find((c) => t >= c.from && t <= c.to);
    if (!caption) return;

    const popIn = clamp((t - caption.from) / 0.16, 0, 1);
    const popOut = clamp((caption.to - t) / 0.18, 0, 1);
    const scale = easeOut(popIn) * easeOut(popOut);

    ctx.save();
    ctx.translate(WIDTH / 2, 1605);
    ctx.scale(scale, scale);

    ctx.font = '900 48px "Plus Jakarta Sans", system-ui, sans-serif';
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
