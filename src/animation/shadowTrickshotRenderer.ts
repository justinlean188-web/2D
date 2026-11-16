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
const WALL_TOP = '#e0e7ff';
const WALL_LOWER = '#c7d2fe';
const TRIM_COLOR = '#94a3b8';
const FLOOR_MAIN = '#fde68a';
const FLOOR_PLANK = '#f59e0b';

const BALL_ORANGE = '#f97316';
const BALL_DEEP = '#ea580c';
const BALL_HIGHLIGHT = '#fed7aa';

const CORNER_FRONT = '#38bdf8';
const CORNER_SIDE = '#0284c7';
const CORNER_TOP = '#7dd3fc';

const CUP_WHITE = '#ffffff';
const CUP_SHADE = '#e2e8f0';
const CUP_STRIPE = '#3b82f6';

const SPOT_DARK = '#334155';
const SPOT_STEEL = '#64748b';
const SPOT_LENS = '#fef08a';

const FLOOR_Y = 1500;
const HEAD_R = 70;

const CORNER_X = 638;
const CUP_X = 925;
const CUP_BASE_Y = FLOOR_Y;
const CUP_RIM_Y = 1360;

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
  // --- Scene 1 (0–6s): Places orange ball, throws & misses badly, notices shadow ---
  {
    t: 0.0,
    p: {
      lean: 0.04,
      look: 'right',
      mouth: 'smile',
      brow: 'normal',
      eye: 'open',
      handL: { x: -68, y: 1246 },
      handR: { x: 82, y: 1235 },
      gripR: true,
    },
  },
  {
    t: 0.9,
    p: {
      lean: 0.24,
      crouch: 0.56,
      look: 'down',
      mouth: 'flat',
      brow: 'determined',
      handL: { x: -58, y: 1320 },
      handR: { x: 75, y: 1455 },
      gripR: true,
    },
  },
  {
    t: 1.45,
    p: {
      lean: -0.06,
      crouch: 0.08,
      look: 'right',
      mouth: 'grin',
      brow: 'cocky',
      handL: { x: -72, y: 1230 },
      handR: { x: -42, y: 1120 },
      bendR: -1,
      gripR: true,
    },
  },
  {
    t: 1.95,
    p: {
      lean: 0.22,
      crouch: 0.04,
      stance: 18,
      look: 'right',
      mouth: 'o',
      brow: 'determined',
      eye: 'wide',
      handL: { x: -85, y: 1220 },
      handR: { x: 145, y: 1140 },
      bendR: -1,
      gripR: false,
    },
  },
  {
    t: 2.75,
    p: {
      lean: -0.05,
      crouch: 0,
      stance: 8,
      look: 'right',
      mouth: 'frown',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -68, y: 1248 },
      handR: { x: 68, y: 1248 },
      bendR: 1,
    },
  },
  {
    t: 3.65,
    p: {
      lean: 0.08,
      look: 'down',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -74, y: 1240 },
      handR: { x: 110, y: 1190 },
    },
  },
  {
    t: 4.15,
    p: {
      lean: 0.06,
      look: 'down',
      mouth: 'smile',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -76, y: 1230 },
      handR: { x: 148, y: 1090 },
      bendR: -1,
    },
  },
  {
    t: 4.7,
    p: {
      lean: 0.1,
      look: 'right',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      handL: { x: -68, y: 1248 },
      handR: { x: 142, y: 1235 },
      bendR: 1,
      pointR: true,
    },
  },

  // --- Scene 2 (6–12s): Moves arm, shadow copies & kicks ball into wall ---
  {
    t: 6.1,
    p: {
      lean: -0.04,
      stance: 16,
      look: 'right',
      mouth: 'smirk',
      brow: 'determined',
      eye: 'open',
      pointR: false,
      handL: { x: -72, y: 1235 },
      handR: { x: 64, y: 1240 },
    },
  },
  {
    t: 7.35,
    p: {
      lean: -0.14,
      stance: 24,
      footLift: 18,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'open',
      handL: { x: -92, y: 1185 },
      handR: { x: -55, y: 1265 },
      fistR: true,
    },
  },
  {
    t: 8.2,
    p: {
      lean: 0.2,
      stance: 26,
      footLift: 74,
      look: 'right',
      mouth: 'grin',
      brow: 'determined',
      eye: 'wide',
      handL: { x: -95, y: 1190 },
      handR: { x: 142, y: 1215 },
      fistR: false,
      pointR: true,
    },
  },
  {
    t: 9.15,
    p: {
      lean: -0.08,
      stance: 10,
      footLift: 0,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      pointR: false,
      handL: { x: -118, y: 1105 },
      handR: { x: 118, y: 1105 },
      bendL: -1,
      bendR: -1,
    },
  },
  {
    t: 10.6,
    p: {
      lean: 0.04,
      stance: 14,
      look: 'right',
      mouth: 'frown',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -64, y: 1205 },
      handR: { x: 64, y: 1205 },
      bendL: 1,
      bendR: 1,
      fistL: true,
      fistR: true,
    },
  },

  // --- Scene 3 (12–18s): Adjusts spotlight, throws ball, shadow kicks around corner ---
  {
    t: 12.15,
    p: {
      lean: -0.1,
      look: 'left',
      mouth: 'flat',
      brow: 'determined',
      eye: 'open',
      fistL: false,
      fistR: false,
      handL: { x: -115, y: 1050 },
      handR: { x: -85, y: 1070 },
      bendL: -1,
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 13.45,
    p: {
      lean: 0.14,
      crouch: 0.35,
      look: 'down',
      mouth: 'grin',
      brow: 'cocky',
      handL: { x: -68, y: 1245 },
      handR: { x: 96, y: 1380 },
      bendL: 1,
      gripL: false,
      gripR: true,
    },
  },
  {
    t: 13.95,
    p: {
      lean: -0.12,
      crouch: 0.05,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      handL: { x: -85, y: 1210 },
      handR: { x: -55, y: 1110 },
      bendR: -1,
      gripR: true,
    },
  },
  {
    t: 14.3,
    p: {
      lean: 0.24,
      crouch: 0,
      stance: 22,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -95, y: 1205 },
      handR: { x: 148, y: 1125 },
      gripR: false,
    },
  },
  {
    t: 15.1,
    p: {
      lean: 0.02,
      stance: 12,
      look: 'right',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -108, y: 1140 },
      handR: { x: 118, y: 1140 },
      bendL: -1,
      bendR: -1,
    },
  },

  // --- Scene 4 (18–24s): Ball stops short -> panic -> drags spotlight -> raises giant foot ---
  {
    t: 18.4,
    p: {
      lean: 0.12,
      look: 'right',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -115, y: 1030 },
      handR: { x: 115, y: 1030 },
    },
  },
  {
    t: 19.8,
    p: {
      lean: -0.16,
      crouch: 0.22,
      look: 'left',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      handL: { x: -102, y: 1265 },
      handR: { x: -82, y: 1285 },
      bendL: 1,
      bendR: 1,
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 21.8,
    p: {
      lean: -0.08,
      crouch: 0,
      stance: 16,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'open',
      gripL: false,
      gripR: false,
      handL: { x: -90, y: 1190 },
      handR: { x: 90, y: 1190 },
    },
  },
  {
    t: 22.8,
    p: {
      lean: -0.18,
      stance: 20,
      footLift: 98,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      handL: { x: -120, y: 1130 },
      handR: { x: 125, y: 1140 },
      bendL: -1,
      bendR: -1,
      fistL: true,
      fistR: true,
    },
  },

  // --- Scene 5 (24–30s): Giant kick scores! Celebrates -> spotlight dies -> ball bonks beanie! ---
  {
    t: 24.15,
    p: {
      lean: 0.26,
      stance: 26,
      footLift: 36,
      look: 'right',
      mouth: 'o',
      brow: 'determined',
      eye: 'wide',
      handL: { x: -105, y: 1200 },
      handR: { x: 145, y: 1160 },
      fistL: false,
      fistR: false,
    },
  },
  {
    t: 25.35,
    p: {
      lean: 0,
      stance: 22,
      footLift: 0,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      handL: { x: -125, y: 1005 },
      handR: { x: 125, y: 1005 },
      bendL: -1,
      bendR: -1,
      fistL: true,
      fistR: true,
    },
  },
  {
    t: 27.1,
    p: {
      lean: -0.02,
      stance: 10,
      look: 'left',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handL: { x: -85, y: 1225 },
      handR: { x: 85, y: 1225 },
      bendL: 1,
      bendR: 1,
    },
  },
  {
    t: 28.25,
    p: {
      lean: -0.06,
      headDrop: 14,
      headTilt: -0.1,
      beanieOn: false,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -115, y: 1150 },
      handR: { x: 115, y: 1150 },
    },
  },
  {
    t: 28.75,
    p: {
      lean: 0,
      headDrop: 0,
      headTilt: 0,
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
  { from: 0.25, to: 5.75, text: 'WHAT IF MY SHADOW COULD SHOOT?!' },
  { from: 6.25, to: 11.75, text: 'IT ACTUALLY WORKS?!' },
  { from: 12.25, to: 17.75, text: 'AROUND THE CORNER!' },
  { from: 18.25, to: 23.75, text: 'ONE LAST SHOT!' },
  { from: 24.25, to: 29.85, text: 'PERFECT SHOT... BAD LUCK!' },
];

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

interface SpotState {
  standX: number;
  headY: number;
  aimAngle: number;
  power: number;
  shadowLen: number;
  shadowTilt: number;
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
  inCup: boolean;
}

export class ShadowTrickshotRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const spot = this.spotAt(time);
    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.walkPhase);
    const ball = this.ballAt(time, ch, pose);

    // 1. Studio Backdrop & Corner Wall
    this.drawBackground(ctx, spot.power);
    this.drawCornerWall(ctx, time, spot.power);

    // 2. Spotlight Stand & Warm Light Cone (behind Stickman & shadow)
    this.drawSpotlightStand(ctx, spot);
    if (spot.power > 0.02) {
      this.drawLightCone(ctx, spot);
    }

    // 3. Stickman's Dark Silhouette Shadow (disappears when spotlight turns off!)
    if (spot.power > 0.02) {
      this.drawShadowProjection(ctx, time, ch, pose, spot);
    }

    // 4. White Cup Back Half + Inside Ball (if inCup) + Front Lip
    this.drawWhiteCupBack(ctx, time);
    if (ball.inCup) {
      this.drawOrangeBall(ctx, ball.x, ball.y, ball.rot);
    }
    this.drawWhiteCupFront(ctx, time);

    // 5. Locked Angry Stickman Character
    this.drawCharacter(ctx, ch, pose);

    // 6. Orange Ball (when outside the cup)
    if (!ball.inCup) {
      this.drawOrangeBall(ctx, ball.x, ball.y, ball.rot);
    }

    // 7. Knocked-off Beanie & Impact / Idea / Celebration Accents
    if (time >= 28.25) {
      this.drawFlyingBeanie(ctx, time);
    }
    this.drawVisualFX(ctx, time, ch, spot);

    // 8. Dark Room Vignette after spotlight flickers off
    if (spot.power < 0.99) {
      ctx.save();
      ctx.fillStyle = `rgba(15, 23, 42, ${(1 - spot.power) * 0.28})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.restore();
    }

    // 9. Burned-in Scene Captions & Safe Zones
    this.drawCaptions(ctx, time);
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Spotlight, Character, Ball & Pose Timelines
  // -------------------------------------------------------------------------
  private spotAt(t: number): SpotState {
    let standX = 135;
    let headY = 920;
    let aimAngle = 0.42;
    let shadowLen = 0.88;
    let shadowTilt = 1.24;

    if (t >= 12.4 && t < 13.4) {
      const k = smooth(inv(12.4, 13.4, t));
      headY = lerp(920, 845, k);
      aimAngle = lerp(0.42, 0.27, k);
      shadowLen = lerp(0.88, 1.04, k);
      shadowTilt = lerp(1.24, 1.32, k);
    } else if (t >= 13.4 && t < 19.9) {
      headY = 845;
      aimAngle = 0.27;
      shadowLen = 1.04;
      shadowTilt = 1.32;
    } else if (t >= 19.9 && t < 21.5) {
      const k = smooth(inv(19.9, 21.5, t));
      standX = lerp(135, 86, k);
      headY = lerp(845, 1275, k);
      aimAngle = lerp(0.27, 0.12, k);
      shadowLen = lerp(1.04, 1.38, k);
      shadowTilt = lerp(1.32, 1.38, k);
    } else if (t >= 21.5) {
      standX = 86;
      headY = 1275;
      aimAngle = 0.12;
      shadowLen = 1.38;
      shadowTilt = 1.38;
    }

    let power = 1;
    if (t >= 26.95 && t < 27.3) {
      const f = (t - 26.95) / 0.35;
      power = f < 0.28 ? 0.1 : f < 0.52 ? 0.9 : f < 0.76 ? 0.15 : 0;
    } else if (t >= 27.3) {
      power = 0;
    }

    return { standX, headY, aimAngle, power, shadowLen, shadowTilt };
  }

  private charAt(t: number): CharState {
    let x = 345;
    let lift = 0;
    let walkPhase = 0;

    if (t < 0.85) {
      const k = smooth(inv(0.0, 0.85, t));
      x = lerp(255, 345, k);
      walkPhase = k * TAU * 1.4;
    } else if (t >= 6.0 && t < 6.7) {
      const k = smooth(inv(6.0, 6.7, t));
      x = lerp(345, 310, k);
      walkPhase = k * TAU;
    } else if (t >= 6.7 && t < 12.0) {
      x = 310;
    } else if (t >= 12.0 && t < 12.55) {
      const k = smooth(inv(12.0, 12.55, t));
      x = lerp(310, 215, k);
      walkPhase = k * TAU * 1.2;
    } else if (t >= 12.55 && t < 13.25) {
      x = 215;
    } else if (t >= 13.25 && t < 13.8) {
      const k = smooth(inv(13.25, 13.8, t));
      x = lerp(215, 325, k);
      walkPhase = k * TAU * 1.2;
    } else if (t >= 13.8 && t < 19.6) {
      x = 325;
    } else if (t >= 19.6 && t < 20.15) {
      const k = smooth(inv(19.6, 20.15, t));
      x = lerp(325, 180, k);
      walkPhase = k * TAU * 1.3;
    } else if (t >= 20.15 && t < 21.5) {
      const k = smooth(inv(20.15, 21.5, t));
      x = lerp(180, 145, k);
    } else if (t >= 21.5 && t < 22.25) {
      const k = smooth(inv(21.5, 22.25, t));
      x = lerp(145, 445, k);
      walkPhase = k * TAU * 1.6;
    } else if (t >= 22.25 && t < 25.0) {
      x = 445;
    } else if (t >= 25.0 && t < 26.95) {
      const k = smooth(inv(25.0, 25.55, t));
      x = lerp(445, 425, k);
      walkPhase = k * TAU * 0.6;
      if (t >= 25.45) {
        const j = ((t - 25.45) * 2.1) % 1;
        lift = Math.sin(j * Math.PI) * 58;
      }
    } else if (t >= 26.95) {
      x = 425;
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
      p.stance += w * 14;
      p.handL.x += w * 16;
      p.handR.x -= w * 16;
    }

    return p;
  }

  private ballAt(t: number, ch: CharState, pose: Pose): BallState {
    // Radius = 26, resting y = FLOOR_Y - 26 = 1474
    const restY = FLOOR_Y - 26;

    // 0.0–0.95s: carried in right hand
    if (t < 0.95) {
      return { x: ch.x + pose.handR.x + 14, y: pose.handR.y + 8, rot: 0, inCup: false };
    }
    // 0.95–1.5s: placed on floor under spotlight
    if (t < 1.5) {
      const k = smooth(inv(0.95, 1.25, t));
      return { x: lerp(ch.x + 80, 440, k), y: restY, rot: k * 1.4, inCup: false };
    }
    // 1.5–1.95s: picked up for throw #1
    if (t < 1.95) {
      const k = smooth(inv(1.5, 1.85, t));
      return {
        x: lerp(440, ch.x + pose.handR.x, k),
        y: lerp(restY, pose.handR.y, k),
        rot: 1.4,
        inCup: false,
      };
    }
    // 1.95–2.65s: misses badly! Arcs short & bounces off floor
    if (t < 2.65) {
      const u = inv(1.95, 2.65, t);
      const x = lerp(ch.x + 115, 765, u);
      const y = lerp(1140, restY, u) - Math.sin(u * Math.PI) * 260;
      return { x, y, rot: 1.4 + u * 6.5, inCup: false };
    }
    // 2.65–3.25s: rebounds backward left to (475, restY)
    if (t < 3.25) {
      const u = inv(2.65, 3.25, t);
      const x = lerp(765, 475, easeOut(u));
      const y = restY - Math.sin(u * Math.PI) * 115;
      return { x, y, rot: 7.9 - u * 4.2, inCup: false };
    }
    // 3.25–8.20s: rests on floor in front of shadow
    if (t < 8.2) {
      return { x: 475, y: restY, rot: 3.7, inCup: false };
    }
    // 8.20–8.85s: shadow kicks it -> hits corner wall at x = 612!
    if (t < 8.85) {
      const u = inv(8.2, 8.85, t);
      const x = lerp(475, CORNER_X - 26, u);
      const y = restY - Math.sin(u * Math.PI) * 24;
      return { x, y, rot: 3.7 + u * 5.2, inCup: false };
    }
    // 8.85–9.45s: bounces back off the corner wall
    if (t < 9.45) {
      const u = inv(8.85, 9.45, t);
      const x = lerp(CORNER_X - 26, 495, easeOut(u));
      const y = restY - Math.sin(u * Math.PI) * 48;
      return { x, y, rot: 8.9 - u * 3.8, inCup: false };
    }
    // 9.45–13.55s: rests at (495, restY) while Stickman rotates spotlight
    if (t < 13.55) {
      return { x: 495, y: restY, rot: 5.1, inCup: false };
    }
    // 13.55–14.30s: Stickman picks up ball to throw toward wall
    if (t < 14.3) {
      const k = smooth(inv(13.55, 13.95, t));
      return {
        x: lerp(495, ch.x + pose.handR.x + 12, k),
        y: lerp(restY, pose.handR.y, k),
        rot: 5.1,
        inCup: false,
      };
    }
    // 14.30–14.75s: flies toward wall corner
    if (t < 14.75) {
      const u = inv(14.3, 14.75, t);
      return {
        x: lerp(ch.x + 135, 622, u),
        y: lerp(1130, 1188, u) - Math.sin(u * Math.PI) * 75,
        rot: 5.1 + u * 4.5,
        inCup: false,
      };
    }
    // 14.75–15.40s: shadow catches it around the corner & drops to shadow foot
    if (t < 15.4) {
      const u = smooth(inv(14.75, 15.4, t));
      return {
        x: lerp(622, 732, u),
        y: lerp(1188, restY, u * u),
        rot: 9.6 + u * 2.2,
        inCup: false,
      };
    }
    // 15.40–18.40s: rolls smoothly toward white cup and stops just short!
    if (t < 18.4) {
      const u = easeOut(inv(15.4, 18.4, t));
      return {
        x: lerp(732, 836, u),
        y: restY - Math.sin(clamp(u * 2.4, 0, 1) * Math.PI) * 18,
        rot: 11.8 + u * 6.5,
        inCup: false,
      };
    }
    // 18.40–24.15s: sits just short of the white cup
    if (t < 24.15) {
      return { x: 836, y: restY, rot: 18.3, inCup: false };
    }
    // 24.15–24.85s: giant shadow foot kicks it cleanly into the white cup!
    if (t < 24.85) {
      const u = inv(24.15, 24.85, t);
      const x = lerp(836, CUP_X, u);
      const y = lerp(restY, CUP_RIM_Y + 60, u) - Math.sin(u * Math.PI) * 185;
      return { x, y, rot: 18.3 + u * 7.5, inCup: u > 0.78 };
    }
    // 24.85–27.55s: settled inside the white cup
    if (t < 27.55) {
      const rattle = t >= 27.35 ? Math.sin((t - 27.35) * 48) * 5 : 0;
      return { x: CUP_X + rattle, y: CUP_RIM_Y + 52, rot: 25.8, inCup: true };
    }
    // 27.55–28.25s: spotlight is off -> ball pops out of cup & rockets to his head!
    if (t < 28.25) {
      const u = inv(27.55, 28.25, t);
      const x = lerp(CUP_X, ch.x + 8, u);
      const y = lerp(CUP_RIM_Y + 10, 995, u) - Math.sin(u * Math.PI) * 265;
      return { x, y, rot: 25.8 - u * 9.0, inCup: false };
    }
    // 28.25–29.15s: bounces off his beanie/head down onto floor
    if (t < 29.15) {
      const u = inv(28.25, 29.15, t);
      const x = lerp(ch.x + 8, 595, u);
      const y = lerp(995, restY, u * u);
      return { x, y, rot: 16.8 + u * 4.5, inCup: false };
    }
    return { x: lerp(595, 612, easeOut(inv(29.15, 29.8, t))), y: restY, rot: 21.8, inCup: false };
  }

  // -------------------------------------------------------------------------
  // Background, Corner Wall, Spotlight & Cup
  // -------------------------------------------------------------------------
  private drawBackground(ctx: CanvasRenderingContext2D, spotPower: number) {
    ctx.fillStyle = WALL_TOP;
    ctx.fillRect(0, 0, WIDTH, 1140);
    ctx.fillStyle = WALL_LOWER;
    ctx.fillRect(0, 1140, WIDTH, FLOOR_Y - 1140);

    // Baseboard trim
    ctx.fillStyle = TRIM_COLOR;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.fillRect(0, FLOOR_Y - 28, WIDTH, 28);
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y - 28);
    ctx.lineTo(WIDTH, FLOOR_Y - 28);
    ctx.stroke();

    // Warm wooden floor
    ctx.fillStyle = FLOOR_MAIN;
    ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);

    ctx.strokeStyle = FLOOR_PLANK;
    ctx.lineWidth = 4;
    for (let fy = FLOOR_Y + 48; fy < HEIGHT; fy += 62) {
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.lineTo(WIDTH, fy);
      ctx.stroke();
    }

    // Main floor edge
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(WIDTH, FLOOR_Y);
    ctx.stroke();

    // Soft ambient light glow on studio wall when spotlight is on
    if (spotPower > 0.05) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${0.22 * spotPower})`;
      ctx.beginPath();
      ctx.ellipse(620, 1280, 420, 190, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawCornerWall(ctx: CanvasRenderingContext2D, t: number, spotPower: number) {
    // Pop 2D corner divider block with clean 3D top/side angle so the "around the corner" path reads clearly
    const wobble = t >= 8.85 && t < 9.15 ? Math.sin((t - 8.85) * 42) * 4 : 0;
    ctx.save();
    ctx.translate(wobble, 0);

    // Floor contact shadow under divider
    ctx.fillStyle = `rgba(23,18,31,${0.14 * spotPower + 0.08})`;
    ctx.beginPath();
    ctx.ellipse(CORNER_X + 35, FLOOR_Y - 12, 65, 16, 0, 0, TAU);
    ctx.fill();

    // Top bevel face
    ctx.fillStyle = CORNER_TOP;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(CORNER_X, 1210);
    ctx.lineTo(CORNER_X + 46, 1175);
    ctx.lineTo(CORNER_X + 102, 1175);
    ctx.lineTo(CORNER_X + 56, 1210);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Side right face (the corner turn!)
    ctx.fillStyle = CORNER_SIDE;
    ctx.beginPath();
    ctx.moveTo(CORNER_X + 56, 1210);
    ctx.lineTo(CORNER_X + 102, 1175);
    ctx.lineTo(CORNER_X + 102, 1418);
    ctx.lineTo(CORNER_X + 56, 1455);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Front face (that the ball slams into in Scene 2)
    ctx.fillStyle = CORNER_FRONT;
    ctx.beginPath();
    ctx.rect(CORNER_X, 1210, 56, 245);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawSpotlightStand(ctx: CanvasRenderingContext2D, spot: SpotState) {
    ctx.save();
    // Tripod legs
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(spot.standX, FLOOR_Y - 125);
    ctx.lineTo(spot.standX - 52, FLOOR_Y);
    ctx.moveTo(spot.standX, FLOOR_Y - 125);
    ctx.lineTo(spot.standX + 52, FLOOR_Y);
    ctx.moveTo(spot.standX, FLOOR_Y - 125);
    ctx.lineTo(spot.standX, spot.headY);
    ctx.stroke();

    // Steel collar
    ctx.fillStyle = SPOT_STEEL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(spot.standX - 12, FLOOR_Y - 140, 24, 24, 6);
    ctx.fill();
    ctx.stroke();

    // Pivoting spotlight head
    ctx.translate(spot.standX, spot.headY);
    ctx.rotate(spot.aimAngle);

    ctx.fillStyle = SPOT_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-36, -26);
    ctx.lineTo(24, -36);
    ctx.lineTo(36, 36);
    ctx.lineTo(-36, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Barn-door rim & glowing lens
    ctx.fillStyle = spot.power > 0.05 ? SPOT_LENS : '#475569';
    ctx.beginPath();
    ctx.ellipse(32, 0, 12, 34, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawLightCone(ctx: CanvasRenderingContext2D, spot: SpotState) {
    const lensX = spot.standX + Math.cos(spot.aimAngle) * 34;
    const lensY = spot.headY + Math.sin(spot.aimAngle) * 34;
    const reachX = spot.headY > 1100 ? 1050 : 940;
    const spreadTopY = Math.max(820, lensY - 90 + Math.sin(spot.aimAngle) * 260);
    const spreadBotY = FLOOR_Y + 40;

    ctx.save();
    ctx.fillStyle = `rgba(254, 240, 138, ${0.26 * spot.power})`;
    ctx.beginPath();
    ctx.moveTo(lensX, lensY - 28);
    ctx.lineTo(reachX, spreadTopY);
    ctx.lineTo(reachX, spreadBotY);
    ctx.lineTo(lensX, lensY + 28);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Shadow Projection (Matches Stickman Silhouette + Special Corner Trickshot)
  // -------------------------------------------------------------------------
  private drawShadowProjection(
    ctx: CanvasRenderingContext2D,
    t: number,
    ch: CharState,
    pose: Pose,
    spot: SpotState
  ) {
    // Special Trickshot Window (14.7s – 16.0s): shadow bends around the corner wall to catch & kick!
    if (t >= 14.7 && t < 16.05) {
      this.drawCornerTrickshotShadow(ctx, t, spot.power);
      return;
    }

    // Normal Shadow: Always matches Stickman's exact live silhouette & movement,
    // projected along the spotlight direction & length!
    const giantK = smooth(inv(20.1, 22.0, t));
    const anchorX = ch.x + lerp(28, 195, giantK);
    const anchorY = FLOOR_Y;
    const scaleX = lerp(0.84, 1.1, giantK);

    ctx.save();
    ctx.globalAlpha = 0.84 * spot.power;
    ctx.translate(anchorX, anchorY);
    ctx.rotate(spot.shadowTilt);
    ctx.scale(scaleX, spot.shadowLen);
    ctx.translate(-ch.x, -FLOOR_Y);

    const hipY = ch.ground - ch.lift - (300 - 150 * pose.crouch - 170 * pose.sit);
    const arms = this.computeArms(pose, ch.x, hipY);
    this.drawSilhouetteCharacter(ctx, ch.x, hipY, ch.ground - ch.lift, pose, arms);
    ctx.restore();

    // Grounded contact shadow ellipse under the projected silhouette
    ctx.save();
    ctx.fillStyle = `rgba(23, 18, 31, ${0.2 * spot.power})`;
    ctx.beginPath();
    ctx.ellipse(anchorX + 210 * spot.shadowLen, FLOOR_Y + 8, 220 * spot.shadowLen, 18, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawCornerTrickshotShadow(ctx: CanvasRenderingContext2D, t: number, power: number) {
    // Stretched Stickman silhouette curving cleanly around the corner at CORNER_X (638)
    // to catch the orange ball at (622, 1188) and kick it toward the cup!
    const kickU = smooth(inv(15.25, 15.55, t));
    const shadowPose: Pose = {
      ...BASE_POSE,
      lean: lerp(0.18, 0.32, kickU),
      stance: 24,
      footLift: lerp(88, 28, kickU),
      bendL: -1,
      bendR: -1,
      handL: { x: -115, y: 1120 },
      handR: { x: 135, y: lerp(1150, 1235, kickU) },
    };

    const sx = lerp(520, 565, kickU);
    const hipY = FLOOR_Y - 300;
    const arms = this.computeArms(shadowPose, sx, hipY);

    ctx.save();
    ctx.globalAlpha = 0.86 * power;
    ctx.translate(sx, FLOOR_Y);
    ctx.rotate(1.18);
    ctx.scale(0.86, 1.05);
    ctx.translate(-sx, -FLOOR_Y);
    this.drawSilhouetteCharacter(ctx, sx, hipY, FLOOR_Y, shadowPose, arms);
    ctx.restore();
  }

  private drawSilhouetteCharacter(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    baseY: number,
    pose: Pose,
    arms: { l: Arm; r: Arm }
  ) {
    // Draws Stickman's exact geometric silhouette in solid dark shadow ink
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

    const mix = (stand: number, crouch: number) => lerp(stand, crouch, pose.crouch);

    const kneeL = { x: mix(standKneeL.x, crouchKneeL.x), y: mix(standKneeL.y, crouchKneeL.y) };
    const kneeR = { x: mix(standKneeR.x, crouchKneeR.x), y: mix(standKneeR.y, crouchKneeR.y) };
    const ankleL = { x: mix(standAnkleL.x, crouchAnkleL.x), y: mix(standAnkleL.y, crouchAnkleL.y) };
    const ankleR = { x: mix(standAnkleR.x, crouchAnkleR.x), y: mix(standAnkleR.y, crouchAnkleR.y) };

    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Shins
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(kneeL.x, kneeL.y);
    ctx.lineTo(ankleL.x, ankleL.y);
    ctx.moveTo(kneeR.x, kneeR.y);
    ctx.lineTo(ankleR.x, ankleR.y);
    ctx.stroke();

    // Trousers silhouette
    ctx.lineWidth = 34;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY - 4);
    ctx.lineTo(kneeL.x, kneeL.y);
    ctx.moveTo(hipX, hipY - 4);
    ctx.lineTo(kneeR.x, kneeR.y);
    ctx.stroke();

    // Shoes
    for (const [ax, ay, rot] of [
      [ankleL.x - 4, ankleL.y + 12, -0.06],
      [ankleR.x + 4, ankleR.y + 12, pose.footLift > 20 ? -0.24 : 0.06],
    ] as const) {
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.roundRect(-34, -13, 68, 26, 11);
      ctx.fill();
      ctx.restore();
    }

    // Torso
    ctx.beginPath();
    ctx.moveTo(hipX - 36, hipY + 10);
    ctx.lineTo(bodyTopX - 40, shoulderY);
    ctx.lineTo(bodyTopX + 40, shoulderY);
    ctx.lineTo(hipX + 36, hipY + 10);
    ctx.closePath();
    ctx.fill();

    // Neck & arms & sleeves & mitten circles
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(bodyTopX, shoulderY + 8);
    ctx.lineTo(bodyTopX, shoulderY - 20);
    ctx.stroke();

    ctx.lineWidth = 15;
    for (const a of [arms.l, arms.r]) {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(a.ex, a.ey);
      ctx.lineTo(a.hx, a.hy);
      ctx.stroke();

      const dx = a.ex - a.sx;
      const dy = a.ey - a.sy;
      const len = Math.max(1, Math.hypot(dx, dy));
      ctx.lineWidth = 38;
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(a.sx + (dx / len) * 36, a.sy + (dy / len) * 36);
      ctx.stroke();
      ctx.lineWidth = 15;

      // Mitten silhouette
      ctx.beginPath();
      ctx.arc(a.hx, a.hy, 15, 0, TAU);
      ctx.fill();
    }

    // Head + beanie silhouette
    const head = this.headPoint(pose, hipX, hipY);
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(pose.headTilt);
    ctx.beginPath();
    ctx.arc(0, 0, HEAD_R, 0, TAU);
    ctx.fill();
    if (pose.beanieOn) {
      ctx.beginPath();
      ctx.arc(0, -24, HEAD_R + 5, Math.PI * 1.02, Math.PI * 1.98);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.rect(-HEAD_R - 5, -44, (HEAD_R + 5) * 2, 20);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -HEAD_R - 33, 16, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // White Target Cup & Orange Ball Props
  // -------------------------------------------------------------------------
  private cupShudder(t: number): { sx: number; sy: number; dx: number } {
    if (t >= 27.35 && t < 27.7) {
      const s = Math.sin((t - 27.35) * 44) * (1 - inv(27.35, 27.7, t));
      return { sx: 1 + s * 0.08, sy: 1 - s * 0.08, dx: s * 4 };
    }
    if (t >= 24.85 && t < 25.15) {
      const s = Math.sin((t - 24.85) * 36) * (1 - inv(24.85, 25.15, t));
      return { sx: 1 + s * 0.05, sy: 1 - s * 0.05, dx: 0 };
    }
    return { sx: 1, sy: 1, dx: 0 };
  }

  private drawWhiteCupBack(ctx: CanvasRenderingContext2D, t: number) {
    const sh = this.cupShudder(t);
    ctx.save();
    ctx.translate(CUP_X + sh.dx, CUP_BASE_Y);
    ctx.scale(sh.sx, sh.sy);
    ctx.translate(-CUP_X, -CUP_BASE_Y);

    // Floor shadow under cup
    ctx.fillStyle = 'rgba(23,18,31,0.18)';
    ctx.beginPath();
    ctx.ellipse(CUP_X, CUP_BASE_Y + 8, 56, 14, 0, 0, TAU);
    ctx.fill();

    // Inner dark cavity opening at the top rim
    ctx.fillStyle = CUP_SHADE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(CUP_X, CUP_RIM_Y, 58, 16, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawWhiteCupFront(ctx: CanvasRenderingContext2D, t: number) {
    const sh = this.cupShudder(t);
    ctx.save();
    ctx.translate(CUP_X + sh.dx, CUP_BASE_Y);
    ctx.scale(sh.sx, sh.sy);
    ctx.translate(-CUP_X, -CUP_BASE_Y);

    // Tapered white cup body
    ctx.fillStyle = CUP_WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(CUP_X - 58, CUP_RIM_Y);
    ctx.quadraticCurveTo(CUP_X, CUP_RIM_Y + 20, CUP_X + 58, CUP_RIM_Y);
    ctx.lineTo(CUP_X + 42, CUP_BASE_Y);
    ctx.lineTo(CUP_X - 42, CUP_BASE_Y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Decorative target stripe
    ctx.fillStyle = CUP_STRIPE;
    ctx.beginPath();
    ctx.moveTo(CUP_X - 51, CUP_RIM_Y + 42);
    ctx.lineTo(CUP_X + 51, CUP_RIM_Y + 42);
    ctx.lineTo(CUP_X + 48, CUP_RIM_Y + 64);
    ctx.lineTo(CUP_X - 48, CUP_RIM_Y + 64);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crisp right shadow highlight
    ctx.fillStyle = CUP_SHADE;
    ctx.beginPath();
    ctx.moveTo(CUP_X + 28, CUP_RIM_Y + 6);
    ctx.lineTo(CUP_X + 53, CUP_RIM_Y + 2);
    ctx.lineTo(CUP_X + 39, CUP_BASE_Y - 3);
    ctx.lineTo(CUP_X + 20, CUP_BASE_Y - 3);
    ctx.closePath();
    ctx.fill();

    // Front lip outline
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(CUP_X - 58, CUP_RIM_Y);
    ctx.quadraticCurveTo(CUP_X, CUP_RIM_Y + 20, CUP_X + 58, CUP_RIM_Y);
    ctx.stroke();

    ctx.restore();
  }

  private drawOrangeBall(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Vibrant orange ball body
    ctx.fillStyle = BALL_ORANGE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, TAU);
    ctx.fill();

    // Lower shading crescent
    ctx.fillStyle = BALL_DEEP;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0.25, Math.PI - 0.25);
    ctx.fill();

    // Glossy highlight dot
    ctx.fillStyle = BALL_HIGHLIGHT;
    ctx.beginPath();
    ctx.ellipse(-8, -9, 7, 4.5, -0.5, 0, TAU);
    ctx.fill();

    // Curved seam line so ball spin is unmistakable
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 17, -0.7, 0.7);
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, TAU);
    ctx.stroke();

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Knocked-Off Beanie & Visual Comic FX
  // -------------------------------------------------------------------------
  private drawFlyingBeanie(ctx: CanvasRenderingContext2D, t: number) {
    const u = inv(28.25, 29.15, t);
    const k = easeOut(u);
    const x = lerp(430, 725, k);
    const y = lerp(960, FLOOR_Y - 22, u * u) - Math.sin(u * Math.PI) * 195;
    const rot = lerp(0.15, 2.35, k);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(0.9, 0.9);
    this.drawBeanieShape(ctx);
    ctx.restore();
  }

  private drawVisualFX(
    ctx: CanvasRenderingContext2D,
    t: number,
    ch: CharState,
    spot: SpotState
  ) {
    // Idea star spark when he realizes his shadow can shoot!
    if (t >= 4.65 && t < 5.55) {
      const k = Math.sin(inv(4.65, 5.55, t) * Math.PI);
      ctx.save();
      ctx.translate(ch.x + 86, 865);
      ctx.scale(k, k);
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? 32 : 12;
        ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Impact star when ball slams into the corner wall (Scene 2)
    if (t >= 8.83 && t < 9.2) {
      const k = 1 - inv(8.83, 9.2, t);
      ctx.save();
      ctx.translate(CORNER_X - 8, FLOOR_Y - 28);
      ctx.scale(k * 1.1, k * 1.1);
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i * TAU) / 10;
        const r = i % 2 === 0 ? 34 : 14;
        ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Victory celebration stars over the white cup before the blackout!
    if (t >= 25.0 && t < 26.95) {
      const k = inv(25.0, 26.95, t);
      const colors = ['#facc15', '#38bdf8', '#fb7185', '#4ade80'];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * TAU + k * 1.5;
        const dist = 65 + Math.sin(k * Math.PI) * 95;
        ctx.save();
        ctx.translate(CUP_X + Math.cos(angle) * dist, CUP_RIM_Y - 35 + Math.sin(angle) * dist * 0.55);
        ctx.rotate(angle);
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

    // Beanie bonk comic burst at 28.25s
    if (t >= 28.24 && t < 28.65 && spot.power <= 0.05) {
      const k = 1 - inv(28.24, 28.65, t);
      ctx.save();
      ctx.translate(ch.x + 12, 995);
      ctx.scale(k * 1.25, k * 1.25);
      ctx.fillStyle = '#f97316';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i * TAU) / 10;
        const r = i % 2 === 0 ? 38 : 16;
        ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
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
      // target.x is relative dx from character x; target.y is world y
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
