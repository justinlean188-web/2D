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

// --- Stage & Props Palette (Modern Pop 2D Flat Vector) ----------------------
const WALL_BG = '#eff6ff';
const WALL_STRIPE = '#dbeafe';
const FLOOR_MAIN = '#fde68a';
const FLOOR_PLANK = '#f59e0b';

const BALL_ORANGE = '#f97316';
const BALL_DEEP = '#ea580c';

const BACKBOARD_FILL = '#ffffff';
const BACKBOARD_ACCENT = '#ef4444';
const RIM_COLOR = '#f97316';
const POLE_STEEL = '#475569';

const TRASH_BODY = '#64748b';
const TRASH_DARK = '#475569';

const GLASS_GLOW = '#38bdf8';
const GLASS_CORE = '#bae6fd';

const FLOOR_Y = 1500;
const HEAD_R = 70;

const HOOP_RIM_X = 835;
const HOOP_RIM_Y = 685;
const TRASH_X = 585;

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
  handL: Pt; // dx from character x, world y at ground=FLOOR_Y
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
  // --- Scene 1 (0–6s): Prepares shot, bounces back off Wall A, touches invisible wall ---
  {
    t: 0.0,
    p: {
      lean: 0.04,
      look: 'right',
      mouth: 'grin',
      brow: 'cocky',
      eye: 'open',
      handL: { x: -72, y: 1220 },
      handR: { x: 88, y: 1235 },
      gripR: true,
    },
  },
  {
    t: 0.55,
    p: {
      lean: 0.1,
      crouch: 0.2,
      handL: { x: -78, y: 1210 },
      handR: { x: 88, y: 1320 },
      gripR: true,
    },
  },
  {
    t: 1.05,
    p: {
      lean: -0.1,
      crouch: 0.28,
      look: 'up',
      mouth: 'grit',
      brow: 'determined',
      handL: { x: -45, y: 1110 },
      handR: { x: -12, y: 1085 },
      bendL: -1,
      bendR: -1,
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 1.4,
    p: {
      lean: 0.18,
      crouch: 0,
      stance: 18,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -65, y: 1190 },
      handR: { x: 135, y: 1060 },
      gripL: false,
      gripR: false,
    },
  },
  {
    t: 1.95,
    p: {
      lean: -0.06,
      stance: 12,
      look: 'right',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      handL: { x: -85, y: 1210 },
      handR: { x: 95, y: 1210 },
      bendL: 1,
      bendR: 1,
    },
  },
  {
    t: 3.45,
    p: {
      lean: 0.14,
      look: 'right',
      mouth: 'flat',
      brow: 'uneven',
      eye: 'squint',
      handL: { x: -68, y: 1245 },
      handR: { x: 115, y: 1145 },
      pointR: true,
    },
  },
  {
    t: 4.35,
    p: {
      lean: -0.1,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      pointR: false,
      handL: { x: -100, y: 1150 },
      handR: { x: 118, y: 1145 },
    },
  },

  // --- Scene 2 (6–12s): Shoots at angle -> hits trash can -> early celebration -> disbelief ---
  {
    t: 6.1,
    p: {
      lean: 0.08,
      crouch: 0.3,
      look: 'down',
      mouth: 'smirk',
      brow: 'cocky',
      eye: 'open',
      handL: { x: -75, y: 1265 },
      handR: { x: 75, y: 1350 },
      gripR: true,
    },
  },
  {
    t: 7.05,
    p: {
      lean: -0.12,
      crouch: 0.2,
      look: 'up',
      mouth: 'grin',
      brow: 'determined',
      handL: { x: -42, y: 1115 },
      handR: { x: -10, y: 1085 },
      bendL: -1,
      bendR: -1,
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 7.45,
    p: {
      lean: 0.2,
      crouch: 0,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -75, y: 1185 },
      handR: { x: 132, y: 1045 },
      gripL: false,
      gripR: false,
    },
  },
  {
    t: 9.0,
    p: {
      lean: -0.04,
      stance: 20,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      handL: { x: -120, y: 1015 },
      handR: { x: 120, y: 1015 },
      fistL: true,
      fistR: true,
    },
  },
  {
    t: 10.25,
    p: {
      lean: 0.1,
      stance: 10,
      look: 'right',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      fistL: false,
      fistR: false,
      bendL: 1,
      bendR: 1,
      handL: { x: -72, y: 1245 },
      handR: { x: 72, y: 1245 },
    },
  },

  // --- Scene 3 (12–18s): Discovers 3 walls, aims carefully, 3-wall near miss ---
  {
    t: 12.6,
    p: {
      lean: 0.2,
      crouch: 0.35,
      look: 'down',
      mouth: 'grit',
      brow: 'determined',
      eye: 'open',
      handL: { x: 60, y: 1320 },
      handR: { x: 110, y: 1320 },
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 13.85,
    p: {
      lean: -0.1,
      crouch: 0.22,
      look: 'right',
      mouth: 'flat',
      brow: 'determined',
      eye: 'squint',
      handL: { x: -45, y: 1125 },
      handR: { x: -10, y: 1100 },
      bendL: -1,
      bendR: -1,
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 14.3,
    p: {
      lean: 0.22,
      crouch: 0,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -75, y: 1185 },
      handR: { x: 138, y: 1090 },
      gripL: false,
      gripR: false,
    },
  },
  {
    t: 16.7,
    p: {
      lean: -0.06,
      look: 'right',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -108, y: 1055 },
      handR: { x: 108, y: 1055 },
    },
  },

  // --- Scene 4 (18–24s): Moves far left, 5-wall crazy bounces, wide eyes follow ---
  {
    t: 18.85,
    p: {
      lean: -0.14,
      crouch: 0.35,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      handL: { x: -48, y: 1140 },
      handR: { x: -14, y: 1110 },
      bendL: -1,
      bendR: -1,
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 19.5,
    p: {
      lean: 0.26,
      crouch: 0,
      stance: 22,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -85, y: 1190 },
      handR: { x: 142, y: 1095 },
      gripL: false,
      gripR: false,
    },
  },
  {
    t: 20.6,
    p: {
      lean: -0.04,
      headTilt: -0.12,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -95, y: 1185 },
      handR: { x: 95, y: 1185 },
      bendL: 1,
      bendR: 1,
    },
  },
  {
    t: 22.1,
    p: {
      lean: 0.06,
      headTilt: 0.12,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
    },
  },

  // --- Scene 5 (24–30s): Swish -> celebrates & sprints -> SMACK into invisible wall -> slide down ---
  {
    t: 24.75,
    p: {
      lean: 0,
      headTilt: 0,
      stance: 24,
      look: 'right',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      handL: { x: -125, y: 1015 },
      handR: { x: 125, y: 1015 },
      bendL: -1,
      bendR: -1,
      fistL: true,
      fistR: true,
    },
  },
  {
    t: 26.85,
    p: {
      lean: 0.04,
      headDrop: 12,
      headTilt: -0.06,
      stance: 12,
      look: 'front',
      mouth: 'o',
      brow: 'uneven',
      eye: 'shut',
      fistL: false,
      fistR: false,
      handL: { x: 64, y: 1090 },
      handR: { x: 70, y: 1210 },
      bendL: 1,
      bendR: 1,
    },
  },
  {
    t: 27.35,
    p: {
      lean: 0.02,
      headDrop: 6,
      headTilt: 0.03,
      crouch: 0.45,
      sit: 0.2,
      look: 'front',
      mouth: 'frown',
      brow: 'sad',
      eye: 'squint',
      handL: { x: 66, y: 1190 },
      handR: { x: 68, y: 1280 },
    },
  },
  {
    t: 28.55,
    p: {
      lean: -0.02,
      headDrop: 0,
      headTilt: 0,
      crouch: 0.25,
      sit: 1.0,
      look: 'front',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -64, y: 1380 },
      handR: { x: 64, y: 1380 },
    },
  },
];

interface PoseKey extends Pose {
  t: number;
}

const POSE_KEYS: PoseKey[] = (() => {
  let acc: Pose = {
    ...BASE_POSE,
    handL: { ...BASE_POSE.handL },
    handR: { ...BASE_POSE.handR },
  };
  return POSE_PATCHES.map(({ t, p }) => {
    acc = {
      ...acc,
      ...p,
      handL: p?.handL ? { ...p.handL } : { ...acc.handL },
      handR: p?.handR ? { ...p.handR } : { ...acc.handR },
    };
    return { t, ...acc };
  });
})();

const CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: 0.25, to: 5.75, text: 'INVISIBLE WALL?!' },
  { from: 6.25, to: 11.75, text: 'WAIT... I CAN USE IT!' },
  { from: 12.25, to: 17.75, text: 'THREE WALL BOUNCES!' },
  { from: 18.25, to: 23.75, text: 'FIVE BOUNCES!' },
  { from: 24.25, to: 29.85, text: 'I FORGOT THE WALL! 😂' },
];

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

interface CharState {
  x: number;
  ground: number;
  lift: number;
  walkPhase: number;
}

interface BallState {
  x: number;
  y: number;
  rot: number;
  inTrash: boolean;
  behindRim: boolean;
}

interface WallPanel {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  impacts: { time: number; ix: number; iy: number; dur: number }[];
}

const WALL_PANELS: WallPanel[] = [
  // Huge vertical wall (Scene 1 bounce + Scene 1 hand tap + Scene 3 Bounce 3 + Scene 5 Face Slam!)
  {
    id: 'wall-a',
    x1: 525,
    y1: 480,
    x2: 525,
    y2: FLOOR_Y,
    impacts: [
      { time: 1.85, ix: 525, iy: 835, dur: 0.72 },
      { time: 4.35, ix: 525, iy: 1145, dur: 0.95 },
      { time: 15.95, ix: 525, iy: 885, dur: 0.55 },
      { time: 26.85, ix: 525, iy: 1060, dur: 1.65 },
    ],
  },
  // Upper-left angled deflector (Scene 2 trash bounce)
  {
    id: 'wall-b',
    x1: 450,
    y1: 475,
    x2: 605,
    y2: 635,
    impacts: [{ time: 8.05, ix: 515, iy: 555, dur: 0.7 }],
  },
  // Lower-left ramp (Scene 3 Bounce 1 & Scene 4 Bounce 1)
  {
    id: 'wall-c',
    x1: 350,
    y1: 1265,
    x2: 555,
    y2: 1320,
    impacts: [
      { time: 14.75, ix: 465, iy: 1285, dur: 0.55 },
      { time: 19.95, ix: 445, iy: 1295, dur: 0.55 },
    ],
  },
  // Overhead angled glass ceiling (Scene 3 Bounce 2 & Scene 4 Bounce 2)
  {
    id: 'wall-d',
    x1: 605,
    y1: 355,
    x2: 835,
    y2: 470,
    impacts: [
      { time: 15.35, ix: 730, iy: 445, dur: 0.55 },
      { time: 20.65, ix: 715, iy: 395, dur: 0.55 },
    ],
  },
  // Far-left vertical/angled glass panel (Scene 4 Bounce 3)
  {
    id: 'wall-e',
    x1: 245,
    y1: 500,
    x2: 280,
    y2: 750,
    impacts: [{ time: 21.35, ix: 265, iy: 625, dur: 0.55 }],
  },
  // Mid-right angled glass floor-side panel (Scene 4 Bounce 4)
  {
    id: 'wall-f',
    x1: 580,
    y1: 1255,
    x2: 765,
    y2: 1185,
    impacts: [{ time: 22.1, ix: 665, iy: 1225, dur: 0.55 }],
  },
  // Upper-center ceiling panel (Scene 4 Bounce 5)
  {
    id: 'wall-g',
    x1: 315,
    y1: 455,
    x2: 485,
    y2: 535,
    impacts: [{ time: 22.9, ix: 395, iy: 495, dur: 0.55 }],
  },
  // Final trickshot glass backboard helper above hoop approach (Scene 5 Final Bounce)
  {
    id: 'wall-h',
    x1: 605,
    y1: 435,
    x2: 770,
    y2: 525,
    impacts: [{ time: 24.1, ix: 685, iy: 480, dur: 0.65 }],
  },
];

export class InvisibleWallRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.walkPhase);
    const ball = this.ballAt(time, ch, pose);

    // 1. Clean Pop 2D Gym/Studio Backdrop
    this.drawBackground(ctx);

    // 2. Basketball Hoop Back (pole, backboard, back rim)
    this.drawHoopBack(ctx);

    // 3. Trash Can Back + Ball inside if inTrash + Trash Can Front
    this.drawTrashCanBack(ctx);
    if (ball.inTrash) {
      this.drawBasketball(ctx, ball.x, ball.y, ball.rot);
    }
    this.drawTrashCanFront(ctx);

    // 4. Basketball when falling through rim/net (behind front rim & net)
    if (!ball.inTrash && ball.behindRim) {
      this.drawBasketball(ctx, ball.x, ball.y, ball.rot);
    }

    // 5. Basketball Hoop Front Rim & Net
    this.drawHoopFront(ctx, time);

    // 6. Locked Angry Stickman Character
    this.drawCharacter(ctx, ch, pose);

    // 7. Basketball in open air / hand / floor
    if (!ball.inTrash && !ball.behindRim) {
      this.drawBasketball(ctx, ball.x, ball.y, ball.rot);
    }

    // 8. Invisible Glass Walls (transparent except brief glowing blue flash on impact)
    this.drawInvisibleWalls(ctx, time);

    // 9. Face-slam comic stars & celebration confetti
    this.drawVisualFX(ctx, time, ch);

    // 10. Burned-in Scene Captions & Safe Zones
    this.drawCaptions(ctx, time);
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Character, Pose & Basketball Timelines
  // -------------------------------------------------------------------------
  private charAt(t: number): CharState {
    let x = 235;
    let lift = 0;
    let walkPhase = 0;

    if (t < 2.8) {
      x = 235;
    } else if (t < 3.85) {
      const k = smooth(inv(2.8, 3.85, t));
      x = lerp(235, 398, k);
      walkPhase = k * TAU * 1.6;
    } else if (t < 6.0) {
      x = 398;
    } else if (t < 6.65) {
      const k = smooth(inv(6.0, 6.65, t));
      x = lerp(398, 220, k);
      walkPhase = k * TAU * 1.4;
    } else if (t < 12.0) {
      x = 220;
      if (t >= 9.0 && t < 10.1) {
        const j = ((t - 9.0) * 2.1) % 1;
        lift = Math.sin(j * Math.PI) * 44;
      }
    } else if (t < 12.7) {
      const k = smooth(inv(12.0, 12.7, t));
      x = lerp(220, 468, k);
      walkPhase = k * TAU * 1.8;
    } else if (t < 13.6) {
      const k = smooth(inv(12.85, 13.6, t));
      x = lerp(468, 200, k);
      walkPhase = k * TAU * 1.8;
    } else if (t < 17.5) {
      x = 200;
    } else if (t < 18.25) {
      const k = smooth(inv(17.5, 18.25, t));
      x = lerp(200, 625, k);
      walkPhase = k * TAU * 2.2;
    } else if (t < 19.0) {
      const k = smooth(inv(18.25, 19.0, t));
      x = lerp(625, 145, k);
      walkPhase = k * TAU * 2.6;
    } else if (t < 24.75) {
      x = 145;
    } else if (t < 25.85) {
      x = 145;
      const j = ((t - 24.75) * 2.2) % 1;
      lift = Math.sin(j * Math.PI) * 55;
    } else if (t < 26.85) {
      const k = inv(25.85, 26.85, t);
      x = lerp(145, 456, k);
      walkPhase = k * TAU * 3.0;
    } else if (t < 27.35) {
      // Squished face-first against Wall A (x = 525)
      x = 456;
    } else if (t < 28.55) {
      x = lerp(456, 464, smooth(inv(27.35, 28.55, t)));
    } else {
      x = 464;
    }

    return { x, ground: FLOOR_Y, lift, walkPhase };
  }

  private poseAt(t: number, walkPhase: number): Pose {
    let i = 0;
    while (i + 1 < POSE_KEYS.length && POSE_KEYS[i + 1].t <= t) i++;
    const a = POSE_KEYS[i];
    const b = POSE_KEYS[Math.min(i + 1, POSE_KEYS.length - 1)];

    let p: Pose;
    if (a === b || b.t <= a.t) {
      p = { ...a, handL: { ...a.handL }, handR: { ...a.handR } };
    } else {
      const u = clamp((t - a.t) / (b.t - a.t), 0, 1);
      const s = smooth(u);
      const mid = u >= 0.5 ? b : a;
      p = {
        lean: lerp(a.lean, b.lean, s),
        hipDrop: lerp(a.hipDrop, b.hipDrop, s),
        headTilt: lerp(a.headTilt, b.headTilt, s),
        headDrop: lerp(a.headDrop, b.headDrop, s),
        headTurn: lerp(a.headTurn, b.headTurn, s),
        stance: lerp(a.stance, b.stance, s),
        footLift: lerp(a.footLift, b.footLift, s),
        crouch: lerp(a.crouch, b.crouch, s),
        sit: lerp(a.sit, b.sit, s),
        handL: { x: lerp(a.handL.x, b.handL.x, s), y: lerp(a.handL.y, b.handL.y, s) },
        handR: { x: lerp(a.handR.x, b.handR.x, s), y: lerp(a.handR.y, b.handR.y, s) },
        look: mid.look,
        mouth: mid.mouth,
        brow: mid.brow,
        eye: mid.eye,
        bendL: mid.bendL,
        bendR: mid.bendR,
        gripL: mid.gripL,
        gripR: mid.gripR,
        fistL: mid.fistL,
        fistR: mid.fistR,
        pointL: mid.pointL,
        pointR: mid.pointR,
        beanieOn: mid.beanieOn,
      };
    }

    if (walkPhase > 0.001) {
      const w = Math.sin(walkPhase);
      p.footLift += Math.max(0, w) * 34;
      p.stance += w * 16;
      p.handL.x += w * 18;
      p.handR.x -= w * 18;
    }

    return p;
  }

  private ballAt(t: number, ch: CharState, pose: Pose): BallState {
    const r = 38;
    const restY = FLOOR_Y - r;

    // 0.0–0.85s: dribble & hold
    if (t < 0.85) {
      if (t >= 0.35 && t < 0.78) {
        const u = inv(0.35, 0.78, t);
        const drop = Math.sin(u * Math.PI);
        return {
          x: ch.x + 88,
          y: lerp(pose.handR.y + 18, restY, drop),
          rot: u * 1.4,
          inTrash: false,
          behindRim: false,
        };
      }
      return { x: ch.x + pose.handR.x, y: pose.handR.y, rot: 0, inTrash: false, behindRim: false };
    }
    // 0.85–1.35s: windup
    if (t < 1.35) {
      return { x: ch.x + pose.handR.x, y: pose.handR.y, rot: 0, inTrash: false, behindRim: false };
    }
    // 1.35–1.85s: shot #1 toward hoop -> hits invisible Wall A (525, 835)
    if (t < 1.85) {
      const u = inv(1.35, 1.85, t);
      return {
        x: lerp(255, 505, u),
        y: lerp(1090, 835, u) - Math.sin(u * Math.PI) * 95,
        rot: u * 4.5,
        inTrash: false,
        behindRim: false,
      };
    }
    // 1.85–2.65s: bounces backward off Wall A to floor behind Stickman
    if (t < 2.65) {
      const u = inv(1.85, 2.65, t);
      return {
        x: lerp(505, 265, u),
        y: lerp(835, restY, u * u) - Math.sin(u * Math.PI) * 110,
        rot: 4.5 - u * 5.2,
        inTrash: false,
        behindRim: false,
      };
    }
    // 2.65–6.15s: sits on floor at x=265
    if (t < 6.15) {
      return { x: 265, y: restY, rot: -0.7, inTrash: false, behindRim: false };
    }
    // 6.15–7.40s: picked up and aimed steep upward
    if (t < 7.4) {
      const k = smooth(inv(6.15, 6.65, t));
      return {
        x: lerp(265, ch.x + pose.handR.x, k),
        y: lerp(restY, pose.handR.y, k),
        rot: -0.7,
        inTrash: false,
        behindRim: false,
      };
    }
    // 7.40–8.05s: shot #2 hits angled Wall B (515, 555)
    if (t < 8.05) {
      const u = inv(7.4, 8.05, t);
      return {
        x: lerp(255, 515, u),
        y: lerp(1080, 555, u) - Math.sin(u * Math.PI) * 75,
        rot: u * 5.2,
        inTrash: false,
        behindRim: false,
      };
    }
    // 8.05–8.95s: deflects sideways-down into the trash can (585, 1390)
    if (t < 8.95) {
      const u = inv(8.05, 8.95, t);
      return {
        x: lerp(515, TRASH_X, u),
        y: lerp(555, 1390, u * u),
        rot: 5.2 + u * 4.5,
        inTrash: u > 0.85,
        behindRim: false,
      };
    }
    // 8.95–12.65s: sits inside trash can
    if (t < 12.65) {
      return { x: TRASH_X, y: 1405, rot: 9.7, inTrash: true, behindRim: false };
    }
    // 12.65–14.25s: Stickman grabs ball out of trash can & lines up 3-bounce shot
    if (t < 14.25) {
      const k = smooth(inv(12.65, 13.05, t));
      return {
        x: lerp(TRASH_X, ch.x + pose.handR.x, k),
        y: lerp(1405, pose.handR.y, k),
        rot: 9.7,
        inTrash: false,
        behindRim: false,
      };
    }
    // 14.25–16.65s: 3-wall bounce sequence -> narrow rim miss!
    if (t < 14.75) {
      const u = inv(14.25, 14.75, t);
      return {
        x: lerp(225, 465, u),
        y: lerp(1100, 1285, u) - Math.sin(u * Math.PI) * 55,
        rot: 9.7 + u * 4.5,
        inTrash: false,
        behindRim: false,
      };
    }
    if (t < 15.35) {
      const u = inv(14.75, 15.35, t);
      return {
        x: lerp(465, 730, u),
        y: lerp(1285, 445, u),
        rot: 14.2 + u * 5.0,
        inTrash: false,
        behindRim: false,
      };
    }
    if (t < 15.95) {
      const u = inv(15.35, 15.95, t);
      return {
        x: lerp(730, 525, u),
        y: lerp(445, 885, u),
        rot: 19.2 - u * 4.8,
        inTrash: false,
        behindRim: false,
      };
    }
    if (t < 16.65) {
      const u = inv(15.95, 16.65, t);
      return {
        x: lerp(525, 775, u),
        y: lerp(885, HOOP_RIM_Y, u) - Math.sin(u * Math.PI) * 75,
        rot: 14.4 + u * 5.2,
        inTrash: false,
        behindRim: false,
      };
    }
    // 16.65–17.35s: bounces off front rim to floor at x=710
    if (t < 17.35) {
      const u = inv(16.65, 17.35, t);
      return {
        x: lerp(775, 705, u),
        y: lerp(HOOP_RIM_Y, restY, u * u) - Math.sin(u * Math.PI) * 85,
        rot: 19.6 - u * 4.0,
        inTrash: false,
        behindRim: false,
      };
    }
    // 17.35–19.45s: Stickman picks up ball & retreats far left
    if (t < 19.45) {
      const k = smooth(inv(17.95, 18.4, t));
      return {
        x: lerp(705, ch.x + pose.handR.x, k),
        y: lerp(restY, pose.handR.y, k),
        rot: 15.6,
        inTrash: false,
        behindRim: false,
      };
    }
    // 19.45–24.10s: 5 crazy wall bounces + final setup bounce!
    if (t < 19.95) {
      const u = inv(19.45, 19.95, t);
      return {
        x: lerp(180, 445, u),
        y: lerp(1105, 1295, u),
        rot: 15.6 + u * 5.0,
        inTrash: false,
        behindRim: false,
      };
    }
    if (t < 20.65) {
      const u = inv(19.95, 20.65, t);
      return {
        x: lerp(445, 715, u),
        y: lerp(1295, 395, u),
        rot: 20.6 + u * 6.0,
        inTrash: false,
        behindRim: false,
      };
    }
    if (t < 21.35) {
      const u = inv(20.65, 21.35, t);
      return {
        x: lerp(715, 265, u),
        y: lerp(395, 625, u),
        rot: 26.6 - u * 6.2,
        inTrash: false,
        behindRim: false,
      };
    }
    if (t < 22.1) {
      const u = inv(21.35, 22.1, t);
      return {
        x: lerp(265, 665, u),
        y: lerp(625, 1225, u),
        rot: 20.4 + u * 6.5,
        inTrash: false,
        behindRim: false,
      };
    }
    if (t < 22.9) {
      const u = inv(22.1, 22.9, t);
      return {
        x: lerp(665, 395, u),
        y: lerp(1225, 495, u),
        rot: 26.9 - u * 6.0,
        inTrash: false,
        behindRim: false,
      };
    }
    if (t < 24.1) {
      const u = inv(22.9, 24.1, t);
      return {
        x: lerp(395, 685, u),
        y: lerp(495, 480, u) - Math.sin(u * Math.PI) * 65,
        rot: 20.9 + u * 6.0,
        inTrash: false,
        behindRim: false,
      };
    }
    // 24.10–24.70s: one final bounce down through the basketball hoop!
    if (t < 24.7) {
      const u = inv(24.1, 24.7, t);
      return {
        x: lerp(685, HOOP_RIM_X, u),
        y: lerp(480, HOOP_RIM_Y, u) - Math.sin(u * Math.PI) * 55,
        rot: 26.9 + u * 4.5,
        inTrash: false,
        behindRim: u > 0.85,
      };
    }
    // 24.70–25.35s: drops cleanly through mesh net to court floor
    if (t < 25.35) {
      const u = inv(24.7, 25.35, t);
      return {
        x: HOOP_RIM_X,
        y: lerp(HOOP_RIM_Y, restY, u * u),
        rot: 31.4 + u * 2.5,
        inTrash: false,
        behindRim: u < 0.25,
      };
    }
    // 25.35–30.0s: small court bounce then rests under hoop
    if (t < 25.95) {
      const u = inv(25.35, 25.95, t);
      return {
        x: lerp(HOOP_RIM_X, 885, u),
        y: restY - Math.sin(u * Math.PI) * 85,
        rot: 33.9 + u * 2.0,
        inTrash: false,
        behindRim: false,
      };
    }
    return {
      x: lerp(885, 905, easeOut(inv(25.95, 26.6, t))),
      y: restY,
      rot: 36.2,
      inTrash: false,
      behindRim: false,
    };
  }

  // -------------------------------------------------------------------------
  // Background, Basketball Hoop, Trash Can & Ball
  // -------------------------------------------------------------------------
  private drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = WALL_BG;
    ctx.fillRect(0, 0, WIDTH, FLOOR_Y);

    // Subtle geometric gym wall stripes
    ctx.fillStyle = WALL_STRIPE;
    ctx.fillRect(0, 1140, WIDTH, FLOOR_Y - 1140);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 1140);
    ctx.lineTo(WIDTH, 1140);
    ctx.stroke();

    // Hardwood gym floor
    ctx.fillStyle = FLOOR_MAIN;
    ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);
    ctx.strokeStyle = FLOOR_PLANK;
    ctx.lineWidth = 4;
    for (let fy = FLOOR_Y + 46; fy < HEIGHT; fy += 60) {
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.lineTo(WIDTH, fy);
      ctx.stroke();
    }

    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(WIDTH, FLOOR_Y);
    ctx.stroke();
  }

  private drawHoopBack(ctx: CanvasRenderingContext2D) {
    // Tall steel pole on right
    ctx.fillStyle = POLE_STEEL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(956, 610, 26, FLOOR_Y - 610);
    ctx.fill();
    ctx.stroke();

    // Base pad
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(928, FLOOR_Y - 46, 82, 46, 10);
    ctx.fill();
    ctx.stroke();

    // Support arm to backboard
    ctx.fillStyle = POLE_STEEL;
    ctx.beginPath();
    ctx.rect(918, 618, 44, 20);
    ctx.fill();
    ctx.stroke();

    // White & red backboard (edge-profile pop 2D)
    ctx.fillStyle = BACKBOARD_FILL;
    ctx.beginPath();
    ctx.roundRect(896, 495, 28, 235, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = BACKBOARD_ACCENT;
    ctx.beginPath();
    ctx.rect(898, 560, 24, 115);
    ctx.fill();
    ctx.stroke();

    // Back half of rim
    ctx.strokeStyle = INK;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(775, HOOP_RIM_Y);
    ctx.lineTo(896, HOOP_RIM_Y);
    ctx.stroke();
  }

  private drawHoopFront(ctx: CanvasRenderingContext2D, t: number) {
    const netSway = t >= 24.65 && t < 25.35 ? Math.sin((t - 24.65) * 24) * 14 : 0;

    // White mesh net
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const topX = lerp(782, 888, i / 4);
      const botX = lerp(802, 868, i / 4) + netSway;
      ctx.moveTo(topX, HOOP_RIM_Y + 4);
      ctx.lineTo(botX, HOOP_RIM_Y + 95);
    }
    ctx.moveTo(790 + netSway * 0.4, HOOP_RIM_Y + 48);
    ctx.lineTo(880 + netSway * 0.4, HOOP_RIM_Y + 48);
    ctx.moveTo(798 + netSway * 0.8, HOOP_RIM_Y + 78);
    ctx.lineTo(872 + netSway * 0.8, HOOP_RIM_Y + 78);
    ctx.stroke();

    // Front orange rim bar
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(775, HOOP_RIM_Y);
    ctx.lineTo(896, HOOP_RIM_Y);
    ctx.stroke();

    ctx.strokeStyle = RIM_COLOR;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(775, HOOP_RIM_Y);
    ctx.lineTo(896, HOOP_RIM_Y);
    ctx.stroke();
  }

  private drawTrashCanBack(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(23,18,31,0.16)';
    ctx.beginPath();
    ctx.ellipse(TRASH_X, FLOOR_Y + 8, 54, 14, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(TRASH_X, 1365, 52, 13, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private drawTrashCanFront(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = TRASH_BODY;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(TRASH_X - 52, 1365);
    ctx.quadraticCurveTo(TRASH_X, 1380, TRASH_X + 52, 1365);
    ctx.lineTo(TRASH_X + 42, FLOOR_Y);
    ctx.lineTo(TRASH_X - 42, FLOOR_Y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Vertical trash ribs
    ctx.strokeStyle = TRASH_DARK;
    ctx.lineWidth = 4;
    for (const dx of [-20, 0, 20]) {
      ctx.beginPath();
      ctx.moveTo(TRASH_X + dx * 1.05, 1388);
      ctx.lineTo(TRASH_X + dx * 0.9, FLOOR_Y - 12);
      ctx.stroke();
    }
  }

  private drawBasketball(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    const r = 38;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.fillStyle = BALL_ORANGE;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();

    ctx.fillStyle = BALL_DEEP;
    ctx.beginPath();
    ctx.arc(0, 0, r - 2, 0.2, Math.PI - 0.2);
    ctx.fill();

    // Basketball seams
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-r * 0.72, 0, r * 0.75, -0.78, 0.78);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r * 0.72, 0, r * 0.75, Math.PI - 0.78, Math.PI + 0.78);
    ctx.stroke();

    // Outer 5px ink outline
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.stroke();

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Invisible Glass Walls (Transparent Until Impact Flash!)
  // -------------------------------------------------------------------------
  private drawInvisibleWalls(ctx: CanvasRenderingContext2D, t: number) {
    for (const wall of WALL_PANELS) {
      let bestAlpha = 0;
      let activeImpact: { time: number; ix: number; iy: number; dur: number } | null = null;

      for (const imp of wall.impacts) {
        if (t >= imp.time && t <= imp.time + imp.dur) {
          const u = (t - imp.time) / imp.dur;
          const a = u < 0.12 ? u / 0.12 : 1 - (u - 0.12) / 0.88;
          if (a > bestAlpha) {
            bestAlpha = a;
            activeImpact = imp;
          }
        }
      }

      if (bestAlpha <= 0.01 || !activeImpact) continue;

      ctx.save();
      ctx.globalAlpha = clamp(bestAlpha, 0, 1);

      // Soft glowing blue halo outline
      ctx.strokeStyle = GLASS_GLOW;
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.stroke();

      // Crisp bright inner core line
      ctx.strokeStyle = GLASS_CORE;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.stroke();

      // Faint glass surface shimmer band beside the line
      const dx = wall.x2 - wall.x1;
      const dy = wall.y2 - wall.y1;
      const len = Math.max(1, Math.hypot(dx, dy));
      const nx = -dy / len;
      const ny = dx / len;
      ctx.fillStyle = 'rgba(186, 230, 253, 0.22)';
      ctx.beginPath();
      ctx.moveTo(wall.x1 + nx * 12, wall.y1 + ny * 12);
      ctx.lineTo(wall.x2 + nx * 12, wall.y2 + ny * 12);
      ctx.lineTo(wall.x2 - nx * 12, wall.y2 - ny * 12);
      ctx.lineTo(wall.x1 - nx * 12, wall.y1 - ny * 12);
      ctx.closePath();
      ctx.fill();

      // Expanding glowing blue impact ring at contact point
      const ringU = clamp((t - activeImpact.time) / 0.45, 0, 1);
      if (ringU < 1) {
        ctx.globalAlpha = clamp((1 - ringU) * 0.95, 0, 1);
        ctx.strokeStyle = GLASS_CORE;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(activeImpact.ix, activeImpact.iy, 22 + ringU * 68, 0, TAU);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private drawVisualFX(ctx: CanvasRenderingContext2D, t: number, ch: CharState) {
    // Victory confetti over hoop after swish (24.85s .. 26.8s)
    if (t >= 24.85 && t < 26.85) {
      const k = inv(24.85, 26.85, t);
      const colors = ['#facc15', '#38bdf8', '#fb7185', '#4ade80'];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + k * 1.4;
        const dist = 55 + Math.sin(k * Math.PI) * 110;
        ctx.save();
        ctx.translate(HOOP_RIM_X + Math.cos(a) * dist, HOOP_RIM_Y - 40 + Math.sin(a) * dist * 0.55);
        ctx.rotate(a);
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(-8, -8, 16, 16);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // Face-slam impact burst against Wall A at 26.85s
    if (t >= 26.84 && t < 27.3) {
      const k = 1 - inv(26.84, 27.3, t);
      ctx.save();
      ctx.translate(525, 1060);
      ctx.scale(k * 1.3, k * 1.3);
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i * TAU) / 10;
        const r = i % 2 === 0 ? 42 : 18;
        ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Subtle dizzy stars while sliding/sitting stunned (27.4s .. 28.6s)
    if (t >= 27.4 && t < 28.6) {
      const u = inv(27.4, 28.6, t);
      const hy = ch.ground - (300 - 150 * 0.35 - 170 * u) - 275;
      ctx.save();
      ctx.translate(ch.x, hy);
      for (let i = 0; i < 3; i++) {
        const a = u * TAU * 2 + (i * TAU) / 3;
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 58, Math.sin(a) * 18, 9, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------------
  // Locked Character Rig (POP_UP_TENT_CHARACTER.md)
  // -------------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, ch: CharState, pose: Pose) {
    const baseY = ch.ground - ch.lift;
    const hipY = baseY - (300 - 150 * pose.crouch - 170 * pose.sit);
    const arms = this.computeArms(pose, ch.x, hipY);

    if (ch.lift < 16 && pose.sit < 0.5) {
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
      let hx = x + target.x;
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
    ctx.strokeText(caption.text, 0, 0, 900);

    ctx.fillStyle = '#facc15';
    ctx.fillText(caption.text, 0, 0, 900);
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
