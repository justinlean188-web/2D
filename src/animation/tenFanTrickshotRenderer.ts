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
const WALL_BG = '#f0f9ff';
const WALL_BAND = '#e0f2fe';
const WALL_TRIM = '#bae6fd';
const FLOOR_MAIN = '#fde68a';
const FLOOR_PLANK = '#f59e0b';

const FAN_GRAY = '#94a3b8';
const FAN_GRAY_DARK = '#64748b';
const FAN_CAGE = '#475569';
const FAN_BLADE = '#38bdf8';
const FAN_BLADE_DEEP = '#0284c7';

const BALL_ORANGE = '#f97316';
const BALL_HIGHLIGHT = '#fdba74';

const CUP_RED = '#ef4444';
const CUP_RED_DARK = '#b91c1c';
const CUP_RED_RIM = '#fca5a5';

const WIND_COLOR = '#38bdf8';
const FLOOR_Y = 1500;
const WALL_X = 975;
const LAMP_X = 585;
const LAMP_Y = 415;
const CUP_X = 890;
const HEAD_R = 70;
const BALL_R = 18;

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
  // --- Scene 1 (0–6s): Places ping-pong ball in front of Fan 1, turns on -> forehead bonk -> idea ---
  {
    t: 0.0,
    p: {
      lean: 0.06,
      look: 'down',
      mouth: 'smirk',
      brow: 'cocky',
      eye: 'open',
      handL: { x: -68, y: 1245 },
      handR: { x: 68, y: 1255 },
      gripR: true,
    },
  },
  {
    t: 0.65,
    p: {
      lean: 0.24,
      crouch: 0.72,
      look: 'down',
      mouth: 'flat',
      brow: 'determined',
      handL: { x: -55, y: 1310 },
      handR: { x: 80, y: 1465 },
      gripR: true,
    },
  },
  {
    t: 1.35,
    p: {
      lean: 0.14,
      crouch: 0.25,
      look: 'right',
      mouth: 'grin',
      brow: 'cocky',
      handL: { x: -68, y: 1245 },
      handR: { x: 112, y: 1385 },
      gripR: false,
      pointR: true,
    },
  },
  {
    t: 1.75,
    p: {
      lean: 0.04,
      crouch: 0.05,
      look: 'right',
      mouth: 'smile',
      brow: 'raised',
      handR: { x: 105, y: 1350 },
      pointR: false,
    },
  },
  {
    t: 2.35,
    p: {
      lean: -0.18,
      crouch: 0,
      headTilt: -0.22,
      headDrop: 12,
      stance: 20,
      look: 'front',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      handL: { x: -95, y: 1140 },
      handR: { x: 95, y: 1140 },
      bendL: -1,
      bendR: -1,
    },
  },
  {
    t: 3.15,
    p: {
      lean: 0.02,
      headTilt: 0.03,
      headDrop: 0,
      stance: 8,
      look: 'right',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -68, y: 1245 },
      handR: { x: 68, y: 1245 },
      bendL: 1,
      bendR: 1,
    },
  },
  {
    t: 4.15,
    p: {
      lean: 0.06,
      look: 'right',
      mouth: 'grin',
      brow: 'raised',
      eye: 'open',
      handL: { x: -68, y: 1240 },
      handR: { x: 118, y: 1165 },
      pointR: true,
    },
  },

  // --- Scene 2 (6–12s): Lines up 3 fans -> ball makes 2 sharp turns -> lands on head -> furious ---
  {
    t: 6.1,
    p: {
      lean: 0.14,
      crouch: 0.48,
      pointR: false,
      look: 'down',
      mouth: 'grit',
      brow: 'determined',
      eye: 'open',
      handL: { x: -55, y: 1290 },
      handR: { x: 85, y: 1410 },
      gripR: true,
    },
  },
  {
    t: 7.45,
    p: {
      lean: 0.08,
      crouch: 0.1,
      look: 'right',
      mouth: 'grin',
      brow: 'cocky',
      gripR: false,
      handL: { x: -70, y: 1245 },
      handR: { x: 110, y: 1365 },
      pointR: true,
    },
  },
  {
    t: 8.35,
    p: {
      lean: 0.04,
      crouch: 0,
      pointR: false,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -82, y: 1210 },
      handR: { x: 88, y: 1175 },
    },
  },
  {
    t: 10.15,
    p: {
      lean: -0.06,
      headDrop: 14,
      headTilt: -0.1,
      look: 'up',
      mouth: 'o',
      brow: 'uneven',
      eye: 'shut',
      handL: { x: -88, y: 1175 },
      handR: { x: 88, y: 1175 },
    },
  },
  {
    t: 10.7,
    p: {
      lean: 0.06,
      headDrop: 0,
      headTilt: 0,
      stance: 18,
      look: 'right',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -95, y: 1205 },
      handR: { x: 95, y: 1205 },
      fistL: true,
      fistR: true,
    },
  },

  // --- Scene 3 (12–18s): Adds 7 more fans, releases ball into 10-fan air tunnel ---
  {
    t: 12.15,
    p: {
      lean: 0.08,
      stance: 10,
      fistL: false,
      fistR: false,
      look: 'right',
      mouth: 'smirk',
      brow: 'determined',
      eye: 'open',
      handL: { x: -70, y: 1240 },
      handR: { x: 108, y: 1165 },
      pointR: true,
    },
  },
  {
    t: 13.75,
    p: {
      lean: 0.2,
      crouch: 0.6,
      pointR: false,
      look: 'down',
      mouth: 'flat',
      brow: 'determined',
      handL: { x: -58, y: 1290 },
      handR: { x: 75, y: 1415 },
      gripR: true,
    },
  },
  {
    t: 14.1,
    p: {
      lean: 0.05,
      crouch: 0,
      gripR: false,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -85, y: 1210 },
      handR: { x: 110, y: 1320 },
    },
  },
  {
    t: 16.0,
    p: {
      lean: -0.04,
      headTilt: -0.08,
      look: 'up',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -102, y: 1135 },
      handR: { x: 102, y: 1135 },
      bendL: -1,
      bendR: -1,
    },
  },

  // --- Scene 4 (18–24s): Lamp loop, wall bounce, approaches tiny red cup -> holds breath ---
  {
    t: 18.6,
    p: {
      lean: 0.04,
      headTilt: -0.1,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -95, y: 1165 },
      handR: { x: 95, y: 1165 },
      bendL: 1,
      bendR: 1,
    },
  },
  {
    t: 21.25,
    p: {
      lean: 0.1,
      headTilt: 0.06,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'wide',
      handL: { x: -75, y: 1200 },
      handR: { x: 95, y: 1190 },
    },
  },
  {
    t: 22.4,
    p: {
      lean: 0.14,
      crouch: 0.22,
      headTilt: 0.02,
      look: 'right',
      mouth: 'flat',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -45, y: 1190 },
      handR: { x: 52, y: 1190 },
      fistL: true,
      fistR: true,
    },
  },

  // --- Scene 5 (24–30s): Swish! Victory -> 10 fans swivel -> giant gust blows beanie into cup ---
  {
    t: 24.55,
    p: {
      lean: 0,
      crouch: 0,
      stance: 24,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      handL: { x: -120, y: 1015 },
      handR: { x: 120, y: 1015 },
      bendL: -1,
      bendR: -1,
      fistL: true,
      fistR: true,
    },
  },
  {
    t: 26.25,
    p: {
      lean: 0.02,
      stance: 14,
      look: 'right',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handL: { x: -90, y: 1175 },
      handR: { x: 90, y: 1175 },
      bendL: 1,
      bendR: 1,
    },
  },
  {
    t: 26.95,
    p: {
      lean: -0.34,
      crouch: 0.18,
      headTilt: -0.22,
      stance: 22,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      beanieOn: false,
      handL: { x: -110, y: 1085 },
      handR: { x: 95, y: 1065 },
      bendL: -1,
      bendR: -1,
    },
  },
  {
    t: 28.45,
    p: {
      lean: 0,
      crouch: 0.08,
      headTilt: 0,
      stance: 14,
      look: 'front',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      beanieOn: false,
      handL: { x: -68, y: 1248 },
      handR: { x: 68, y: 1248 },
      bendL: 1,
      bendR: 1,
      fistL: true,
      fistR: true,
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
  { from: 0.25, to: 5.75, text: 'WHAT IF I USE MORE FANS?!' },
  { from: 6.25, to: 11.75, text: 'THREE FANS... NOT ENOUGH!' },
  { from: 12.25, to: 17.75, text: '10 FANS ACTIVATED!' },
  { from: 18.25, to: 23.75, text: "DON'T MISS!" },
  { from: 24.25, to: 29.85, text: 'PERFECT SHOT... WRONG TARGET! 😂' },
];

interface FanStation {
  id: number;
  x: number;
  y: number;
  appearAt: number;
  tunnelAngle: number;
  hasShelf: boolean;
}

const FAN_STATIONS: FanStation[] = [
  { id: 1, x: 340, y: 1455, appearAt: 0.0, tunnelAngle: -0.71, hasShelf: false },
  { id: 2, x: 560, y: 1265, appearAt: 6.05, tunnelAngle: -2.38, hasShelf: true },
  { id: 3, x: 360, y: 1075, appearAt: 6.15, tunnelAngle: 0.14, hasShelf: true },
  { id: 4, x: 640, y: 1115, appearAt: 12.15, tunnelAngle: -0.44, hasShelf: true },
  { id: 5, x: 840, y: 1020, appearAt: 12.35, tunnelAngle: -2.66, hasShelf: true },
  { id: 6, x: 580, y: 885, appearAt: 12.55, tunnelAngle: -2.89, hasShelf: true },
  { id: 7, x: 310, y: 815, appearAt: 12.75, tunnelAngle: -0.54, hasShelf: true },
  { id: 8, x: 525, y: 685, appearAt: 12.95, tunnelAngle: 0.0, hasShelf: true },
  { id: 9, x: 790, y: 685, appearAt: 13.15, tunnelAngle: -2.76, hasShelf: true },
  { id: 10, x: 415, y: 535, appearAt: 13.35, tunnelAngle: -0.61, hasShelf: true },
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
  visible: boolean;
  inCup: boolean;
}

export class TenFanTrickshotRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.walkPhase);
    const ball = this.ballAt(time, ch, pose);

    // 1. Clean Pop 2D Studio Background & Obstacles
    this.drawBackground(ctx, time);

    // 2. Ceiling Lamp (Scene 4 loop target)
    this.drawCeilingLamp(ctx, time);

    // 3. 10 Identical Gray Desk Fans with Blue Blades + Airflow Ribbons
    this.drawAllFans(ctx, time);

    // 4. Tiny Red Target Cup (Back layer + ball/beanie + Front layer)
    this.drawCupBack(ctx);
    if (ball.visible && ball.inCup) {
      this.drawPingPongBall(ctx, ball.x, ball.y, ball.rot);
    }
    this.drawCupFront(ctx);

    // 5. Locked Angry Stickman Character
    this.drawCharacter(ctx, ch, pose);

    // 6. Flying / Floor Ping-Pong Ball & Knocked-off Red Beanie
    if (ball.visible && !ball.inCup) {
      this.drawPingPongBall(ctx, ball.x, ball.y, ball.rot);
    }
    this.drawFlyingBeanie(ctx, time);

    // 7. Visual FX (bonk stars, idea spark, confetti, 10-fan giant gust)
    this.drawVisualFX(ctx, time, ch);

    // 8. Burned-in Captions & Safe Zones
    this.drawCaptions(ctx, time);
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Character, Pose & Ball Timelines
  // -------------------------------------------------------------------------
  private charAt(t: number): CharState {
    let x = 215;
    let lift = 0;
    let walkPhase = 0;

    if (t < 2.35) {
      x = 215;
    } else if (t < 2.95) {
      const u = inv(2.35, 2.95, t);
      x = lerp(215, 195, easeOut(u));
    } else if (t < 6.0) {
      x = 195;
    } else if (t < 6.85) {
      const k = smooth(inv(6.0, 6.85, t));
      x = lerp(195, 215, k);
      walkPhase = k * TAU;
    } else if (t < 24.65) {
      x = 215;
    } else if (t < 26.2) {
      x = 215;
      const j = ((t - 24.65) * 2.4) % 1;
      lift = Math.sin(j * Math.PI) * 52;
    } else if (t < 26.75) {
      x = 215;
    } else if (t < 27.65) {
      const k = easeOut(inv(26.75, 27.65, t));
      x = lerp(215, 108, k);
      lift = Math.sin(k * Math.PI) * 38;
    } else {
      x = 108;
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
      p.footLift += Math.max(0, w) * 28;
      p.stance += w * 14;
    }

    return p;
  }

  private samplePolyline(points: Pt[], u: number): Pt {
    const n = points.length - 1;
    const scaled = clamp(u, 0, 1) * n;
    const idx = Math.min(n - 1, Math.floor(scaled));
    const localU = scaled - idx;
    const p0 = points[Math.max(0, idx - 1)];
    const p1 = points[idx];
    const p2 = points[idx + 1];
    const p3 = points[Math.min(n, idx + 2)];

    // Catmull-Rom spline for fluid curving airflow path
    const t2 = localU * localU;
    const t3 = t2 * localU;
    const x =
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * localU +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
    const y =
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * localU +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
    return { x, y };
  }

  private ballAt(t: number, ch: CharState, pose: Pose): BallState {
    const floorY = FLOOR_Y - BALL_R;

    // Scene 1 (0–6s)
    if (t < 0.9) {
      return { x: ch.x + pose.handR.x, y: pose.handR.y, rot: 0, visible: true, inCup: false };
    }
    if (t < 1.85) {
      return { x: 285, y: floorY, rot: 0, visible: true, inCup: false };
    }
    if (t < 2.35) {
      const u = inv(1.85, 2.35, t);
      return {
        x: lerp(285, 215, u),
        y: lerp(floorY, 1175, u) - Math.sin(u * Math.PI) * 35,
        rot: -u * 8,
        visible: true,
        inCup: false,
      };
    }
    if (t < 3.05) {
      const u = inv(2.35, 3.05, t);
      return {
        x: lerp(215, 130, u),
        y: lerp(1175, floorY, u * u) - Math.sin(u * Math.PI) * 55,
        rot: -8 - u * 5,
        visible: true,
        inCup: false,
      };
    }
    if (t < 6.0) {
      return { x: 130, y: floorY, rot: -13, visible: true, inCup: false };
    }

    // Scene 2 (6–12s): 3 fans, 2 sharp turns, bonk top of head at 10.15s
    if (t < 7.0) {
      const k = smooth(inv(6.0, 6.75, t));
      return {
        x: lerp(130, 310, k),
        y: lerp(floorY, 1445, k),
        rot: -13 + k * 4,
        visible: true,
        inCup: false,
      };
    }
    if (t < 7.65) {
      return { x: 310, y: 1445, rot: -9, visible: true, inCup: false };
    }
    if (t < 8.35) {
      const u = inv(7.65, 8.35, t);
      return {
        x: lerp(310, 555, u),
        y: lerp(1445, 1255, u),
        rot: -9 + u * 7,
        visible: true,
        inCup: false,
      };
    }
    if (t < 9.2) {
      const u = inv(8.35, 9.2, t);
      return {
        x: lerp(555, 360, u),
        y: lerp(1255, 1065, u) - Math.sin(u * Math.PI) * 28,
        rot: -2 - u * 8,
        visible: true,
        inCup: false,
      };
    }
    if (t < 10.15) {
      const u = inv(9.2, 10.15, t);
      return {
        x: lerp(360, 215, u),
        y: lerp(1065, 1085, u) - Math.sin(u * Math.PI) * 32,
        rot: -10 - u * 9,
        visible: true,
        inCup: false,
      };
    }
    if (t < 10.85) {
      const u = inv(10.15, 10.85, t);
      return {
        x: lerp(215, 145, u),
        y: lerp(1085, floorY, u * u) - Math.sin(u * Math.PI) * 48,
        rot: -19 - u * 4,
        visible: true,
        inCup: false,
      };
    }
    if (t < 13.75) {
      return { x: 145, y: floorY, rot: -23, visible: true, inCup: false };
    }

    // Scene 3 (12–18s): Placed near F1, flies through all 10 fans!
    if (t < 14.3) {
      const k = smooth(inv(13.75, 14.1, t));
      return {
        x: lerp(145, 330, k),
        y: lerp(floorY, 1445, k),
        rot: -23 + k * 4,
        visible: true,
        inCup: false,
      };
    }
    if (t < 18.0) {
      const u = inv(14.3, 18.0, t);
      const pts: Pt[] = [
        { x: 330, y: 1445 },
        { x: 560, y: 1250 },
        { x: 365, y: 1060 },
        { x: 500, y: 1210 },
        { x: 640, y: 1100 },
        { x: 840, y: 1005 },
        { x: 750, y: 845 },
        { x: 580, y: 870 },
        { x: 310, y: 800 },
        { x: 525, y: 670 },
        { x: 790, y: 670 },
        { x: 650, y: 540 },
        { x: 415, y: 520 },
      ];
      const pos = this.samplePolyline(pts, u);
      return {
        x: pos.x,
        y: pos.y,
        rot: -19 + u * 42,
        visible: true,
        inCup: false,
      };
    }

    // Scene 4 (18–24s): Exits F10 -> 360 loop around ceiling lamp -> wall bounce -> cup approach
    if (t < 18.55) {
      const u = inv(18.0, 18.55, t);
      return {
        x: lerp(415, LAMP_X - 78, u),
        y: lerp(520, LAMP_Y + 12, u),
        rot: 23 + u * 6,
        visible: true,
        inCup: false,
      };
    }
    if (t < 19.65) {
      const u = inv(18.55, 19.65, t);
      const theta = Math.PI - u * TAU;
      const rx = 86;
      const ry = 74;
      return {
        x: LAMP_X + Math.cos(theta) * rx,
        y: LAMP_Y + Math.sin(theta) * ry,
        rot: 29 + u * 12,
        visible: true,
        inCup: false,
      };
    }
    if (t < 21.25) {
      const u = inv(19.65, 21.25, t);
      return {
        x: lerp(LAMP_X - 78, WALL_X - BALL_R, u),
        y: lerp(LAMP_Y + 12, 575, u) - Math.sin(u * Math.PI) * 55,
        rot: 41 + u * 10,
        visible: true,
        inCup: false,
      };
    }
    if (t < 24.0) {
      const u = inv(21.25, 24.0, t);
      return {
        x: lerp(WALL_X - BALL_R, CUP_X, smooth(u)),
        y: lerp(575, 1345, u) - Math.sin(u * Math.PI) * 145,
        rot: 51 - u * 12,
        visible: true,
        inCup: false,
      };
    }

    // Scene 5 (24–30s): Drops straight into red cup at 24.45s and rests inside!
    if (t < 24.45) {
      const u = inv(24.0, 24.45, t);
      return {
        x: CUP_X,
        y: lerp(1345, FLOOR_Y - 26, u * u),
        rot: 39 + u * 3,
        visible: true,
        inCup: u > 0.65,
      };
    }
    return {
      x: CUP_X - 8,
      y: FLOOR_Y - 22,
      rot: 42,
      visible: true,
      inCup: true,
    };
  }

  // -------------------------------------------------------------------------
  // Background, Obstacles & Ceiling Lamp
  // -------------------------------------------------------------------------
  private drawBackground(ctx: CanvasRenderingContext2D, t: number) {
    ctx.fillStyle = WALL_BG;
    ctx.fillRect(0, 0, WIDTH, FLOOR_Y);

    ctx.fillStyle = WALL_BAND;
    ctx.fillRect(0, 1140, WALL_X, FLOOR_Y - 1140);
    ctx.strokeStyle = WALL_TRIM;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 1140);
    ctx.lineTo(WALL_X, 1140);
    ctx.stroke();

    // Right studio wall (Scene 4 bounce target at WALL_X = 975)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(WALL_X, 0, WIDTH - WALL_X, FLOOR_Y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(WALL_X, 0);
    ctx.lineTo(WALL_X, FLOOR_Y);
    ctx.stroke();

    // Wall bounce impact ripple ring at 21.25s
    if (t >= 21.25 && t < 21.85) {
      const u = inv(21.25, 21.85, t);
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = BALL_ORANGE;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(WALL_X - 6, 575, 20 + u * 55, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();
    }

    // Studio floor planks
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

    // Geometric obstacles inside the 10-fan course (appear at 12.1s)
    if (t >= 12.1) {
      const pop = easeOut(inv(12.1, 12.5, t));
      this.drawObstacleBlock(ctx, 470, 1175, 62, 62, '#fb923c', pop);
      this.drawObstacleBlock(ctx, 705, 800, 68, 68, '#a855f7', pop);
    }
  }

  private drawObstacleBlock(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    h: number,
    color: string,
    scale: number
  ) {
    if (scale <= 0.01) return;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 8, -h / 2 + 8, w - 16, 12, 6);
    ctx.fill();
    ctx.restore();
  }

  private drawCeilingLamp(ctx: CanvasRenderingContext2D, t: number) {
    const sway = t >= 18.6 && t < 20.4 ? Math.sin((t - 18.6) * 10) * 0.06 : 0;
    ctx.save();
    ctx.translate(LAMP_X, 0);
    ctx.rotate(sway);

    // Cord
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, LAMP_Y - 26);
    ctx.stroke();

    // Warm yellow shade
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-22, LAMP_Y - 26);
    ctx.lineTo(22, LAMP_Y - 26);
    ctx.lineTo(54, LAMP_Y + 26);
    ctx.lineTo(-54, LAMP_Y + 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing bulb bottom
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, LAMP_Y + 26, 16, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 10 Identical Gray Desk Fans with Blue Blades + Airflow
  // -------------------------------------------------------------------------
  private isFanSpinning(fanId: number, t: number): boolean {
    if (t >= 1.75 && t < 3.4) return fanId === 1;
    if (t >= 7.55 && t < 10.95) return fanId <= 3;
    if (t >= 14.1 && t < 25.0) return true;
    if (t >= 26.6 && t < 28.4) return true;
    return false;
  }

  private getFanAimAngle(fan: FanStation, t: number): number {
    // Scene 1: Fan 1 faces Stickman straight left (PI)
    if (t < 6.0) {
      return Math.PI;
    }
    // Scene 2: Fans 1-3 configured for 2-turn test
    if (t < 12.0) {
      if (fan.id === 1) return -0.71;
      if (fan.id === 2) return -2.38;
      if (fan.id === 3) return 2.55;
      return fan.tunnelAngle;
    }
    // Scene 3-5 pre-swivel: 10-fan tunnel angles
    if (t < 26.2) {
      return fan.tunnelAngle;
    }
    // Scene 5 swivel: all 10 swivel to aim straight left at Stickman!
    const u = smooth(inv(26.2, 26.65, t));
    const target = Math.PI;
    let delta = target - fan.tunnelAngle;
    while (delta > Math.PI) delta -= TAU;
    while (delta < -Math.PI) delta += TAU;
    return fan.tunnelAngle + delta * u;
  }

  private drawAllFans(ctx: CanvasRenderingContext2D, t: number) {
    for (const fan of FAN_STATIONS) {
      if (t < fan.appearAt) continue;
      const pop = fan.appearAt === 0 ? 1 : easeOut(inv(fan.appearAt, fan.appearAt + 0.28, t));
      const spinning = this.isFanSpinning(fan.id, t);
      const aimAngle = this.getFanAimAngle(fan, t);

      if (fan.hasShelf) {
        this.drawFanShelf(ctx, fan.x, fan.y, pop);
      }
      this.drawDeskFan(ctx, fan.x, fan.y, aimAngle, spinning, t, pop);

      if (spinning && t < 25.0) {
        this.drawFanAirflow(ctx, fan.x, fan.y - 38, aimAngle, t);
      }
    }
  }

  private drawFanShelf(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-42, 0, 84, 14, 5);
    ctx.fill();
    ctx.stroke();

    // Clean small shelf bracket underneath
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(-24, 14);
    ctx.lineTo(24, 14);
    ctx.lineTo(0, 32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawDeskFan(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    aimAngle: number,
    spinning: boolean,
    t: number,
    scale: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Gray base & neck
    ctx.fillStyle = FAN_GRAY_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(-30, -14, 60, 14, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = FAN_GRAY;
    ctx.beginPath();
    ctx.rect(-7, -36, 14, 24);
    ctx.fill();
    ctx.stroke();

    // Small red/green power LED on base
    ctx.fillStyle = spinning ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(14, -7, 4, 0, TAU);
    ctx.fill();

    // Tilting gray fan head + spinning blue blades
    ctx.translate(0, -48);
    const faceSign = Math.cos(aimAngle) >= 0 ? 1 : -1;
    const visualTilt = Math.atan2(Math.sin(aimAngle), Math.abs(Math.cos(aimAngle))) * 0.45 * faceSign;
    ctx.rotate(visualTilt);

    // Motor housing back knob
    ctx.fillStyle = FAN_GRAY_DARK;
    ctx.beginPath();
    ctx.roundRect(-22 * faceSign - 8, -12, 16, 24, 6);
    ctx.fill();
    ctx.stroke();

    // Gray circular fan cage
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Spinning blue blades inside cage!
    const spinAngle = spinning ? t * 26 : 0.4;
    ctx.save();
    ctx.rotate(spinAngle);
    for (let i = 0; i < 3; i++) {
      ctx.rotate(TAU / 3);
      ctx.fillStyle = FAN_BLADE;
      ctx.strokeStyle = FAN_BLADE_DEEP;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(15, 0, 15, 7, 0.2, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // Front wire guard spokes + blue center cap
    ctx.strokeStyle = FAN_CAGE;
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * -34, Math.sin(a) * -34);
      ctx.lineTo(Math.cos(a) * 34, Math.sin(a) * 34);
      ctx.stroke();
    }
    ctx.fillStyle = FAN_GRAY_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Directional aim arrow ring edge cue
    ctx.fillStyle = FAN_BLADE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(Math.cos(aimAngle) * 36, Math.sin(aimAngle) * 36, 6, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawFanAirflow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    t: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = WIND_COLOR;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      const phase = ((t * 3.5 + (i + 1) * 0.33) % 1);
      const startX = 44 + phase * 65;
      const len = 34;
      ctx.globalAlpha = (1 - phase) * 0.65;
      ctx.beginPath();
      ctx.moveTo(startX, i * 14);
      ctx.lineTo(startX + len, i * 14);
      ctx.stroke();
    }
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Tiny Red Target Cup, Ping-Pong Ball & Knocked-off Beanie
  // -------------------------------------------------------------------------
  private drawCupBack(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(23,18,31,0.16)';
    ctx.beginPath();
    ctx.ellipse(CUP_X, FLOOR_Y + 6, 46, 12, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = CUP_RED_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.ellipse(CUP_X, FLOOR_Y - 78, 38, 10, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private drawCupFront(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = CUP_RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(CUP_X - 38, FLOOR_Y - 78);
    ctx.quadraticCurveTo(CUP_X, FLOOR_Y - 66, CUP_X + 38, FLOOR_Y - 78);
    ctx.lineTo(CUP_X + 27, FLOOR_Y);
    ctx.lineTo(CUP_X - 27, FLOOR_Y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cup rim highlight stripe
    ctx.strokeStyle = CUP_RED_RIM;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(CUP_X - 34, FLOOR_Y - 72);
    ctx.quadraticCurveTo(CUP_X, FLOOR_Y - 62, CUP_X + 34, FLOOR_Y - 72);
    ctx.stroke();
  }

  private drawPingPongBall(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.fillStyle = BALL_ORANGE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = BALL_HIGHLIGHT;
    ctx.beginPath();
    ctx.arc(-5, -6, 5, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawFlyingBeanie(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 26.95) return;
    let bx: number;
    let by: number;
    let brot: number;
    let bscale: number;

    if (t < 28.15) {
      const u = inv(26.95, 28.15, t);
      bx = lerp(180, CUP_X + 4, u);
      by = lerp(1100, FLOOR_Y - 56, u) - Math.sin(u * Math.PI) * 340;
      brot = u * TAU * 1.65;
      bscale = lerp(1, 0.48, u);
    } else {
      bx = CUP_X + 4;
      by = FLOOR_Y - 56;
      brot = 0.25;
      bscale = 0.48;
    }

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(brot);
    ctx.scale(bscale, bscale);
    this.drawBeanieShape(ctx);
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Visual FX (Bonk stars, Idea spark, Confetti, Giant 10-Fan Gust)
  // -------------------------------------------------------------------------
  private drawVisualFX(ctx: CanvasRenderingContext2D, t: number, ch: CharState) {
    // Bonk bursts at 2.35s and 10.15s
    for (const hitTime of [2.35, 10.15]) {
      if (t >= hitTime && t < hitTime + 0.5) {
        const k = 1 - inv(hitTime, hitTime + 0.5, t);
        const yOff = hitTime < 5 ? 1170 : 1095;
        ctx.save();
        ctx.translate(ch.x, yOff);
        ctx.scale(k * 1.15, k * 1.15);
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = (i * TAU) / 10;
          const r = i % 2 === 0 ? 36 : 15;
          ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // Idea lightbulb flash at 4.15s
    if (t >= 4.15 && t < 5.45) {
      const k = easeOut(inv(4.15, 4.45, t)) * (1 - inv(5.15, 5.45, t));
      ctx.save();
      ctx.translate(ch.x, 965);
      ctx.scale(k, k);
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      for (let i = 0; i < 6; i++) {
        const a = (i * TAU) / 6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 32, Math.sin(a) * 32);
        ctx.lineTo(Math.cos(a) * 44, Math.sin(a) * 44);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Cup swish confetti (24.5s .. 26.2s)
    if (t >= 24.5 && t < 26.2) {
      const k = inv(24.5, 26.2, t);
      const colors = ['#facc15', '#38bdf8', '#ef4444', '#4ade80'];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + k * 1.5;
        const dist = 42 + Math.sin(k * Math.PI) * 95;
        ctx.save();
        ctx.translate(CUP_X + Math.cos(a) * dist, FLOOR_Y - 110 + Math.sin(a) * dist * 0.65);
        ctx.rotate(a);
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(-7, -7, 14, 14);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // Gigantic leftward 10-fan wind storm in Scene 5 (26.75s .. 28.2s)
    if (t >= 26.7 && t < 28.25) {
      const fade = 1 - inv(27.95, 28.25, t);
      ctx.save();
      ctx.strokeStyle = WIND_COLOR;
      ctx.lineCap = 'round';
      for (let i = 0; i < 12; i++) {
        const rowY = 510 + i * 88;
        const phase = ((t * 2.8 + i * 0.17) % 1);
        const startX = 910 - phase * 820;
        ctx.globalAlpha = fade * 0.65 * Math.sin(phase * Math.PI);
        ctx.lineWidth = i % 2 === 0 ? 8 : 5;
        ctx.beginPath();
        ctx.moveTo(startX, rowY);
        ctx.lineTo(startX - 150, rowY);
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

    ctx.font = '900 46px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.strokeText(caption.text, 0, 0, 920);

    ctx.fillStyle = '#facc15';
    ctx.fillText(caption.text, 0, 0, 920);
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
