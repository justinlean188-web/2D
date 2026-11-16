import type { StudioConfig } from '../types';
import { drawHand } from './handRenderer';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

// --- Locked Character Palette (Angry Stickman Rig) -------------------------
const INK = '#17121f';
const WHITE = '#ffffff';

const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const BEANIE_POM = '#ff6b6b';
const SHIRT = '#ffd166';
const SHIRT_DEEP = '#e8b23f';
const TROUSER = '#2f5fa8';
const SHOE = '#141414';

// --- Spiral Staircase Studio Palette (Modern Pop 2D Flat Vector) -----------
const WALL_BG = '#f8fafc';
const WALL_BAND = '#e2e8f0';
const FLOOR_TILE = '#cbd5e1';
const FLOOR_LINE = '#94a3b8';

const POLE_MID = '#64748b';
const POLE_LIGHT = '#cbd5e1';
const STEP_TOP = '#fbbf24';
const STEP_EDGE = '#d97706';
const RAIL_CYAN = '#06b6d4';
const PLAT_INDIGO = '#6366f1';
const PLAT_YELLOW = '#facc15';
const RAMP_SILVER = '#94a3b8';
const RAMP_LIGHT = '#e2e8f0';

const BALL_ORANGE = '#f97316';
const HOOP_RING = '#ec4899';
const BASKET_RED = '#ef4444';

const FLOOR_Y = 1520;
const POLE_X = 385;
const TOP_Y = 720;
const BOT_Y = 1470;
const SPIRAL_RX = 195;
const SPIRAL_RY = 42;
const HEAD_R = 70;
const BALL_R = 28;

// --- Helpers ---------------------------------------------------------------
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const inv = (a: number, b: number, v: number) => clamp((v - a) / (b - a), 0, 1);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

type Pt = { x: number; y: number };
type Look = 'center' | 'right' | 'left' | 'up' | 'down';
type Mouth = 'flat' | 'smile' | 'grin' | 'bigsmile' | 'smirk' | 'frown' | 'o' | 'grit';
type Brow = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'uneven' | 'determined';
type Eye = 'open' | 'wide' | 'squint' | 'shut' | 'happy';

interface Pose {
  lean: number;
  hipDrop: number;
  crouch: number;
  sit: number;
  headTilt: number;
  headTurn: number;
  headDrop: number;
  look: Look;
  mouth: Mouth;
  brow: Brow;
  eye: Eye;
  stance: number;
  footLift: number;
  handL: Pt;
  handR: Pt;
  bendL: 1 | -1;
  bendR: 1 | -1;
  pointL?: boolean;
  pointR?: boolean;
  fistL?: boolean;
  fistR?: boolean;
  gripL?: boolean;
  gripR?: boolean;
}

const BASE_POSE: Pose = {
  lean: 0.04,
  hipDrop: 0,
  crouch: 0,
  sit: 0,
  headTilt: 0,
  headTurn: 2,
  headDrop: 0,
  look: 'right',
  mouth: 'smirk',
  brow: 'determined',
  eye: 'open',
  stance: 12,
  footLift: 0,
  handL: { x: -64, y: 420 },
  handR: { x: 64, y: 420 },
  bendL: -1,
  bendR: 1,
};

const POSE_PATCHES: { t: number; p: Partial<Pose> }[] = [
  // Scene 1: Stands on top landing, places basketball & pushes -> bonked on head!
  { t: 0.0, p: { look: 'right', mouth: 'smirk', brow: 'determined', handL: { x: -58, y: 420 }, handR: { x: 68, y: 420 } } },
  {
    t: 0.9,
    p: {
      lean: 0.16,
      hipDrop: 10,
      headTilt: 0.08,
      look: 'down',
      mouth: 'smile',
      handR: { x: 96, y: 375 },
      gripR: true,
    },
  },
  {
    t: 1.65,
    p: {
      lean: 0.22,
      hipDrop: 12,
      mouth: 'grin',
      gripR: false,
      handR: { x: 118, y: 355 },
      pointR: true,
    },
  },
  // Ball flies back and bonks his head at 3.05s!
  {
    t: 3.05,
    p: {
      lean: -0.22,
      headTilt: -0.22,
      headDrop: 14,
      eye: 'shut',
      brow: 'angry',
      mouth: 'o',
      pointR: false,
      handL: { x: -72, y: 245 },
      handR: { x: 72, y: 245 },
    },
  },
  {
    t: 4.15,
    p: {
      lean: 0.08,
      headTilt: 0.05,
      headDrop: 0,
      eye: 'open',
      brow: 'cocky',
      mouth: 'bigsmile',
      look: 'down',
      handL: { x: -68, y: 400 },
      handR: { x: 110, y: 365 },
      pointR: true,
    },
  },

  // Scene 2: Installs curved rails -> launches ball -> reacts furiously to cushion crash
  {
    t: 6.0,
    p: {
      lean: 0.14,
      hipDrop: 10,
      pointR: false,
      brow: 'determined',
      mouth: 'smirk',
      look: 'down',
      handL: { x: -60, y: 410 },
      handR: { x: 96, y: 380 },
      gripR: true,
    },
  },
  {
    t: 7.0,
    p: {
      lean: 0.18,
      hipDrop: 8,
      mouth: 'grin',
      gripR: false,
      handR: { x: 115, y: 365 },
      pointR: true,
    },
  },
  {
    t: 10.15,
    p: {
      lean: 0.02,
      hipDrop: 0,
      eye: 'squint',
      brow: 'angry',
      mouth: 'grit',
      pointR: false,
      handL: { x: -84, y: 340 },
      handR: { x: 84, y: 340 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 3: Installs 3 rotating platforms -> cheers as ball jumps down
  {
    t: 12.15,
    p: {
      lean: 0.14,
      hipDrop: 12,
      eye: 'open',
      brow: 'determined',
      mouth: 'grin',
      fistL: false,
      fistR: false,
      handL: { x: -64, y: 415 },
      handR: { x: 102, y: 375 },
      gripR: true,
    },
  },
  {
    t: 14.0,
    p: {
      lean: 0.12,
      hipDrop: 0,
      brow: 'cocky',
      mouth: 'bigsmile',
      look: 'down',
      gripR: false,
      handL: { x: -95, y: 260 },
      handR: { x: 95, y: 260 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 4: Watches ball launch up through circular hoop toward basketball basket!
  {
    t: 18.2,
    p: {
      lean: 0.16,
      hipDrop: 14,
      crouch: 0.25,
      look: 'right',
      eye: 'wide',
      brow: 'raised',
      mouth: 'o',
      handL: { x: -48, y: 345 },
      handR: { x: 56, y: 345 },
      fistL: true,
      fistR: true,
    },
  },
  {
    t: 22.0,
    p: {
      lean: 0.12,
      hipDrop: 20,
      crouch: 0.3,
      look: 'right',
      eye: 'squint',
      brow: 'determined',
      mouth: 'grit',
      handL: { x: -42, y: 365 },
      handR: { x: 48, y: 365 },
    },
  },

  // Scene 5: Scores! Celebrates -> carousel spin throws him off balance -> lands inside basket!
  {
    t: 24.15,
    p: {
      lean: 0.0,
      hipDrop: 0,
      crouch: 0,
      look: 'right',
      eye: 'happy',
      brow: 'raised',
      mouth: 'bigsmile',
      fistL: false,
      fistR: false,
      handL: { x: -112, y: 210 },
      handR: { x: 112, y: 210 },
    },
  },
  // Carousel starts spinning at 25.80s -> panic!
  {
    t: 25.85,
    p: {
      lean: -0.18,
      headTilt: -0.15,
      look: 'down',
      eye: 'wide',
      brow: 'raised',
      mouth: 'o',
      handL: { x: -128, y: 220 },
      handR: { x: 128, y: 220 },
    },
  },
  // Slides down spiral & flies through hoop (26.2–29.0s)
  {
    t: 26.5,
    p: {
      lean: 0.24,
      crouch: 0.35,
      sit: 0.45,
      headTilt: 0.16,
      look: 'down',
      eye: 'wide',
      brow: 'angry',
      mouth: 'o',
      handL: { x: -115, y: 230 },
      handR: { x: 115, y: 230 },
    },
  },
  // Wedged inside the basketball basket (29.10–30.0s)!
  {
    t: 29.1,
    p: {
      lean: 0.04,
      hipDrop: 0,
      crouch: 0,
      sit: 0.85,
      headTilt: 0.04,
      headDrop: 6,
      look: 'center',
      eye: 'squint',
      brow: 'uneven',
      mouth: 'frown',
      handL: { x: -95, y: 315 },
      handR: { x: 95, y: 315 },
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
  { from: 0.25, to: 5.75, text: 'ONE STAIRCASE. ONE SHOT!' },
  { from: 6.25, to: 11.75, text: 'CONTROL THE CURVE!' },
  { from: 12.25, to: 17.75, text: 'PERFECT SPIRAL!' },
  { from: 18.25, to: 23.75, text: "DON'T MISS!" },
  { from: 24.25, to: 29.85, text: 'I BECAME THE BALL! 😂' },
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
  rot: number;
  inBasket: boolean;
}

interface BallState {
  x: number;
  y: number;
  rot: number;
  zDepth: number; // >0 in front of pole, <0 behind pole
}

export class SpiralStaircaseRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const camY = this.cameraYAt(time);
    const spin = this.staircaseSpinAt(time);
    const ch = this.charAt(time, spin);
    const pose = this.poseAt(time);
    const ball = this.ballAt(time, spin);

    ctx.save();
    ctx.translate(0, -camY);

    // 1. Studio Wall & Floor
    this.drawBackdrop(ctx);

    // 2. Scene 2 Cushion Pile at left spiral corner
    if (time >= 5.95 && time < 12.2) {
      this.drawCushionPile(ctx, 130, FLOOR_Y, time);
    }

    // 3. Opposite Wall Basketball Hoop Backboard & Pole (always visible from Scene 1 right side & clear in Scenes 4–5!)
    this.drawOppositeHoopBack(ctx, time, ch);

    // 4. Bottom Curved Launch Ramp & Circular Bonus Hoop
    this.drawRampAndCircularHoopBack(ctx, time);

    // 5. Spiral Staircase Back Steps (behind central pole)
    this.drawSpiralHalf(ctx, spin, time, false);

    // 6. Central Spiral Steel Pole
    this.drawCentralPole(ctx, time);

    // 7. Spiral Staircase Front Steps (in front of central pole) + Rails + 3 Rotating Platforms
    this.drawSpiralHalf(ctx, spin, time, true);
    if (time >= 11.9) {
      this.drawRotatingPlatforms(ctx, time);
    }

    // 8. Basketball (z-aware around central pole) & Stickman
    this.drawBasketball(ctx, ball.x, ball.y, ball.rot);
    this.drawCharacter(ctx, ch, pose, time);

    // 9. Front Rim & Net Overlay (so both the basketball and Stickman visibly drop INSIDE the basket!)
    this.drawOppositeHoopFront(ctx, time, ch);
    this.drawCircularHoopFront(ctx);

    // 10. FX: Idea rays, Cushion Poof, Confetti, Carousel Speed Arcs
    this.drawFX(ctx, time, ch);

    ctx.restore();

    if (config.showCaptions) {
      this.drawCaptions(ctx, time);
    }
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Camera & Spiral Geometry Helpers (Consistent Clockwise Helix)
  // -------------------------------------------------------------------------
  private cameraYAt(t: number): number {
    if (t < 5.6) return -115;
    if (t < 6.8) return lerp(-115, 0, easeInOut(inv(5.6, 6.8, t)));
    return 0;
  }

  private staircaseSpinAt(t: number): number {
    if (t < 25.8) return 0;
    const u = t - 25.8;
    // Accelerates into a fast carousel spin!
    return u * u * 1.9 + u * 2.2;
  }

  private spiralPoint(s: number, spinOffset: number, radius = SPIRAL_RX * 0.78): { x: number; y: number; sinA: number; cosA: number } {
    const theta = Math.PI - s * (1.5 * TAU) - spinOffset;
    const cosA = Math.cos(theta);
    const sinA = Math.sin(theta);
    return {
      x: POLE_X + cosA * radius,
      y: lerp(TOP_Y, BOT_Y, s) + sinA * SPIRAL_RY,
      sinA,
      cosA,
    };
  }

  // -------------------------------------------------------------------------
  // Character Position Timeline
  // -------------------------------------------------------------------------
  private charAt(t: number, spin: number): CharState {
    // Scenes 1–4 + early Scene 5: stands on top landing (s = 0 -> x ≈ 205, y = 720)
    if (t < 24.15) {
      return { x: 205, ground: TOP_Y, lift: 0, rot: 0, inBasket: false };
    }
    if (t < 25.8) {
      const u = inv(24.15, 25.8, t);
      return {
        x: 205,
        ground: TOP_Y,
        lift: Math.abs(Math.sin(u * Math.PI * 3.5)) * 54,
        rot: 0,
        inBasket: false,
      };
    }
    // 25.8–26.35s: Wobbles on rotating top landing
    if (t < 26.35) {
      const p = this.spiralPoint(0, spin, 175);
      return {
        x: p.x,
        ground: p.y,
        lift: 0,
        rot: Math.sin((t - 25.8) * 18) * 0.14,
        inBasket: false,
      };
    }
    // 26.35–28.15s: Slides down every step of the spinning spiral staircase!
    if (t < 28.15) {
      const u = easeInOut(inv(26.35, 28.15, t));
      const p = this.spiralPoint(u, spin, 165);
      return {
        x: p.x,
        ground: p.y + 15,
        lift: Math.abs(Math.sin(u * Math.PI * 7)) * 18,
        rot: Math.sin(u * Math.PI * 6) * 0.25,
        inBasket: false,
      };
    }
    // 28.15–29.10s: Rolls up bottom ramp, flies through circular hoop (745, 960), lands in basket (915, 835)!
    if (t < 28.5) {
      const u = inv(28.15, 28.5, t);
      return {
        x: lerp(555, 685, u),
        ground: lerp(BOT_Y, 1345, u),
        lift: 0,
        rot: 0.3,
        inBasket: false,
      };
    }
    if (t < 29.1) {
      const u = inv(28.5, 29.1, t);
      return {
        x: lerp(685, 915, u),
        ground: lerp(1345, 995, u) - Math.sin(u * Math.PI) * 265,
        lift: 0,
        rot: u * TAU,
        inBasket: false,
      };
    }
    // Wedged inside basketball basket at (915, 835)!
    return { x: 915, ground: 1045, lift: 0, rot: 0, inBasket: true };
  }

  private poseAt(t: number): Pose {
    let idx = 0;
    for (let i = 0; i < POSE_KEYS.length; i++) {
      if (t >= POSE_KEYS[i].t) idx = i;
    }
    const cur = POSE_KEYS[idx];
    const next = POSE_KEYS[Math.min(POSE_KEYS.length - 1, idx + 1)];
    const span = Math.max(0.01, next.t - cur.t);
    const u = idx === POSE_KEYS.length - 1 ? 0 : easeInOut(clamp((t - cur.t) / span, 0, 1));

    return {
      ...cur,
      lean: lerp(cur.lean, next.lean, u),
      hipDrop: lerp(cur.hipDrop, next.hipDrop, u),
      crouch: lerp(cur.crouch, next.crouch, u),
      sit: lerp(cur.sit, next.sit, u),
      headTilt: lerp(cur.headTilt, next.headTilt, u),
      headTurn: lerp(cur.headTurn, next.headTurn, u),
      headDrop: lerp(cur.headDrop, next.headDrop, u),
      stance: lerp(cur.stance, next.stance, u),
      footLift: lerp(cur.footLift, next.footLift, u),
      handL: { x: lerp(cur.handL.x, next.handL.x, u), y: lerp(cur.handL.y, next.handL.y, u) },
      handR: { x: lerp(cur.handR.x, next.handR.x, u), y: lerp(cur.handR.y, next.handR.y, u) },
    };
  }

  // -------------------------------------------------------------------------
  // Continuous Basketball Timeline (0–30s, zero teleporting!)
  // -------------------------------------------------------------------------
  private ballAt(t: number, spin: number): BallState {
    // Scene 1: Held -> placed on Step 1 (248, 712) -> rolls 2 steps -> flies off edge -> hits Stickman's head!
    if (t < 1.15) {
      const u = easeInOut(inv(0.0, 1.15, t));
      return { x: lerp(230, 265, u), y: lerp(540, TOP_Y - BALL_R, u), rot: 0, zDepth: 1 };
    }
    if (t < 1.65) {
      return { x: 265, y: TOP_Y - BALL_R, rot: 0, zDepth: 1 };
    }
    if (t < 2.35) {
      const u = inv(1.65, 2.35, t);
      const p = this.spiralPoint(lerp(0.03, 0.16, u), 0);
      return { x: p.x, y: p.y - BALL_R, rot: u * 4.2, zDepth: p.sinA };
    }
    if (t < 3.05) {
      // Flies off unrailed edge back up into Stickman's head (205, 315)!
      const u = inv(2.35, 3.05, t);
      return {
        x: lerp(375, 215, u),
        y: lerp(805, 325, u) - Math.sin(u * Math.PI) * 110,
        rot: 4.2 - u * 6,
        zDepth: 1,
      };
    }
    if (t < 5.95) {
      const u = clamp((t - 3.05) / 0.85, 0, 1);
      return {
        x: lerp(215, 265, u),
        y: lerp(325, TOP_Y - BALL_R, u * u),
        rot: -1.8 + u * 2.4,
        zDepth: 1,
      };
    }

    // Scene 2: Curved rails guide ball -> gains speed -> flies off corner (s=0.67) into cushion pile (130, 1455)
    if (t < 6.85) {
      return { x: 240, y: TOP_Y - BALL_R, rot: 0, zDepth: 1 };
    }
    if (t < 9.45) {
      const u = easeInOut(inv(6.85, 9.45, t));
      const p = this.spiralPoint(lerp(0.02, 0.67, u), 0);
      return { x: p.x, y: p.y - BALL_R, rot: u * 15, zDepth: p.sinA };
    }
    if (t < 10.15) {
      // Flies off left corner gap into cushion pile!
      const u = inv(9.45, 10.15, t);
      return {
        x: lerp(230, 130, u),
        y: lerp(1200, 1458, u) - Math.sin(u * Math.PI) * 85,
        rot: 15 + u * 5,
        zDepth: 1,
      };
    }
    if (t < 11.9) {
      return { x: 130, y: 1458, rot: 20, zDepth: 1 };
    }

    // Scene 3: Returns to top (11.9–12.95s) -> rolls spiral -> jumps cleanly across 3 rotating platforms!
    if (t < 12.95) {
      const u = easeInOut(inv(11.9, 12.95, t));
      return {
        x: lerp(130, 235, u),
        y: lerp(1458, TOP_Y - BALL_R, u) - Math.sin(u * Math.PI) * 90,
        rot: 20 - u * 4,
        zDepth: 1,
      };
    }
    if (t < 14.35) {
      const u = inv(12.95, 14.35, t);
      const p = this.spiralPoint(lerp(0.02, 0.4, u), 0);
      return { x: p.x, y: p.y - BALL_R, rot: u * 9, zDepth: p.sinA };
    }
    if (t < 15.25) {
      // Jump 1 onto Rotating Platform 1 (495, 1020)
      const u = inv(14.35, 15.25, t);
      return {
        x: lerp(515, 495, u),
        y: lerp(990, 1015, u) - Math.sin(u * Math.PI) * 75,
        rot: 9 + u * 4,
        zDepth: 1,
      };
    }
    if (t < 16.25) {
      // Jump 2 onto Rotating Platform 2 (265, 1215)
      const u = inv(15.25, 16.25, t);
      return {
        x: lerp(495, 265, u),
        y: lerp(1015, 1210, u) - Math.sin(u * Math.PI) * 95,
        rot: 13 + u * 5,
        zDepth: 1,
      };
    }
    if (t < 17.2) {
      // Jump 3 onto Rotating Platform 3 (435, 1365)
      const u = inv(16.25, 17.2, t);
      return {
        x: lerp(265, 435, u),
        y: lerp(1210, 1365, u) - Math.sin(u * Math.PI) * 80,
        rot: 18 + u * 5,
        zDepth: 1,
      };
    }
    if (t < 18.0) {
      // Lands back on bottom spiral rail to exit at (560, BOT_Y - BALL_R)
      const u = inv(17.2, 18.0, t);
      return {
        x: lerp(435, 560, u),
        y: lerp(1365, BOT_Y - BALL_R, u) - Math.sin(u * Math.PI) * 45,
        rot: 23 + u * 4,
        zDepth: 1,
      };
    }

    // Scene 4: Rolls onto curved ramp (18.0–19.35s) -> launches upward through circular hoop (745, 960 at 20.85s) -> flies toward basketball basket (915, 835)!
    if (t < 19.35) {
      const u = easeInOut(inv(18.0, 19.35, t));
      return {
        x: lerp(560, 695, u),
        y: lerp(BOT_Y - BALL_R, 1335, u * u),
        rot: 27 + u * 7,
        zDepth: 1,
      };
    }
    if (t < 20.85) {
      // Launches upward into center of circular hoop (745, 960)
      const u = inv(19.35, 20.85, t);
      return {
        x: lerp(695, 745, u),
        y: lerp(1335, 960, u) - Math.sin(u * Math.PI) * 55,
        rot: 34 + u * 8,
        zDepth: 1,
      };
    }
    if (t < 24.0) {
      // Graceful high arc from circular hoop (745, 960) to basketball rim (915, 825)
      const u = easeInOut(inv(20.85, 24.0, t));
      return {
        x: lerp(745, 915, u),
        y: lerp(960, 825, u) - Math.sin(u * Math.PI) * 235,
        rot: 42 + u * 11,
        zDepth: 1,
      };
    }

    // Scene 5: Swishes through net (24.0–24.5s), drops onto floor beneath basket (915, FLOOR_Y - BALL_R)
    if (t < 24.55) {
      const u = inv(24.0, 24.55, t);
      return {
        x: 915,
        y: lerp(825, 1020, u),
        rot: 53 + u * 2,
        zDepth: 1,
      };
    }
    if (t < 25.25) {
      const u = inv(24.55, 25.25, t);
      return {
        x: lerp(915, 935, u),
        y: lerp(1020, FLOOR_Y - BALL_R, u * u),
        rot: 55 + u * 2,
        zDepth: 1,
      };
    }
    // Rolls slightly aside when carousel starts
    const bounceOffset = spin > 0 ? Math.min(40, spin * 3) : 0;
    return { x: 935 + bounceOffset, y: FLOOR_Y - BALL_R, rot: 57, zDepth: 1 };
  }

  // -------------------------------------------------------------------------
  // Background, Cushions, Ramps & Hoops
  // -------------------------------------------------------------------------
  private drawBackdrop(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = WALL_BG;
    ctx.fillRect(0, -240, WIDTH, FLOOR_Y + 240);

    ctx.fillStyle = WALL_BAND;
    ctx.fillRect(0, 320, WIDTH, 140);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    for (let x = 180; x <= 900; x += 240) {
      ctx.beginPath();
      ctx.moveTo(x, -200);
      ctx.lineTo(x, FLOOR_Y);
      ctx.stroke();
    }

    ctx.fillStyle = FLOOR_TILE;
    ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(WIDTH, FLOOR_Y);
    ctx.stroke();

    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 4;
    for (let x = 80; x <= 1040; x += 180) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR_Y);
      ctx.lineTo(x - 60, HEIGHT);
      ctx.stroke();
    }
  }

  private drawCushionPile(ctx: CanvasRenderingContext2D, cx: number, floorY: number, t: number) {
    const squash = t >= 10.1 && t < 10.8 ? Math.sin(inv(10.1, 10.8, t) * Math.PI) * 14 : 0;
    const cushions = [
      { dx: -28, dy: -26 + squash * 0.6, w: 120, h: 48, col: '#ec4899', rot: -0.06 },
      { dx: 30, dy: -28 + squash * 0.6, w: 112, h: 46, col: '#3b82f6', rot: 0.08 },
      { dx: 0, dy: -66 + squash, w: 118, h: 46, col: '#facc15', rot: -0.03 },
    ];
    for (const c of cushions) {
      ctx.save();
      ctx.translate(cx + c.dx, floorY + c.dy);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.col;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(-c.w / 2, -c.h / 2, c.w, c.h, 20);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawRampAndCircularHoopBack(ctx: CanvasRenderingContext2D, _t: number) {
    // Curved steel ramp from bottom of spiral (540, BOT_Y) -> (695, 1345)
    ctx.strokeStyle = INK;
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(540, BOT_Y);
    ctx.quadraticCurveTo(640, BOT_Y + 4, 695, 1345);
    ctx.stroke();

    ctx.strokeStyle = RAMP_SILVER;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(540, BOT_Y);
    ctx.quadraticCurveTo(640, BOT_Y + 4, 695, 1345);
    ctx.stroke();

    // Ramp support strut
    ctx.fillStyle = POLE_MID;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(678, 1352, 20, FLOOR_Y - 1352);
    ctx.fill();
    ctx.stroke();

    // Circular Bonus Hoop stand & back half at (745, 960)
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(745, 1025);
    ctx.lineTo(745, FLOOR_Y);
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.ellipse(745, 960, 56, 62, 0, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.strokeStyle = HOOP_RING;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.ellipse(745, 960, 56, 62, 0, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }

  private drawCircularHoopFront(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.ellipse(745, 960, 56, 62, 0, Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();
    ctx.strokeStyle = HOOP_RING;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.ellipse(745, 960, 56, 62, 0, Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();
  }

  private drawOppositeHoopBack(ctx: CanvasRenderingContext2D, _t: number, _ch: CharState) {
    // Wall bracket & vertical stanchion on right edge
    ctx.fillStyle = POLE_MID;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(995, 760, 85, 24);
    ctx.fill();
    ctx.stroke();

    // White Backboard with Red Shooter Square
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(975, 655, 28, 220, 8);
    ctx.fill();
    ctx.stroke();

    // Back half of Rim at (915, 835)
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(855, 835);
    ctx.lineTo(975, 835);
    ctx.stroke();
    ctx.strokeStyle = BASKET_RED;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(855, 835);
    ctx.lineTo(975, 835);
    ctx.stroke();
  }

  private drawOppositeHoopFront(ctx: CanvasRenderingContext2D, t: number, ch: CharState) {
    const rimX = 915;
    const rimY = 835;
    const swishStretch = t >= 24.05 && t < 24.6 ? Math.sin(inv(24.05, 24.6, t) * Math.PI) * 18 : 0;
    const stickmanStretch = ch.inBasket ? 38 : 0;
    const netBottom = rimY + 95 + swishStretch + stickmanStretch;

    // White Basketball Net Diamond Lines
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(rimX + i * 24, rimY + 4);
      ctx.lineTo(rimX + i * 16, netBottom);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(rimX - 48, rimY + 35);
    ctx.lineTo(rimX + 42, rimY + 68);
    ctx.moveTo(rimX + 48, rimY + 35);
    ctx.lineTo(rimX - 42, rimY + 68);
    ctx.stroke();

    // Front Red Rim Overlay
    ctx.strokeStyle = INK;
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(855, rimY);
    ctx.lineTo(975, rimY);
    ctx.stroke();
    ctx.strokeStyle = BASKET_RED;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(855, rimY);
    ctx.lineTo(975, rimY);
    ctx.stroke();
  }

  // -------------------------------------------------------------------------
  // Giant Spiral Staircase (Consistent Direction + Z-Sorted Steps + Rails)
  // -------------------------------------------------------------------------
  private drawCentralPole(ctx: CanvasRenderingContext2D, t: number) {
    ctx.fillStyle = POLE_MID;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.rect(POLE_X - 18, TOP_Y - 120, 36, FLOOR_Y - (TOP_Y - 120));
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = POLE_LIGHT;
    ctx.beginPath();
    ctx.rect(POLE_X - 10, TOP_Y - 115, 8, FLOOR_Y - (TOP_Y - 115));
    ctx.fill();

    // Base motor hub (sparks when carousel twist starts at 25.8s!)
    ctx.fillStyle = t >= 25.8 ? '#ef4444' : RAMP_LIGHT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(POLE_X - 42, FLOOR_Y - 36, 84, 36, 8);
    ctx.fill();
    ctx.stroke();
  }

  private drawSpiralHalf(ctx: CanvasRenderingContext2D, spin: number, t: number, front: boolean) {
    const totalSteps = 15;
    const hasRails = t >= 6.0;

    for (let i = 0; i <= totalSteps; i++) {
      const s = i / totalSteps;
      const p = this.spiralPoint(s, spin, SPIRAL_RX * 0.72);
      const isFront = p.sinA >= 0;
      if (isFront !== front) continue;

      // Step plank radiating from central pole
      const outer = this.spiralPoint(s, spin, SPIRAL_RX);
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(POLE_X, lerp(TOP_Y, BOT_Y, s));
      ctx.lineTo(outer.x, outer.y);
      ctx.stroke();

      ctx.strokeStyle = i % 2 === 0 ? STEP_TOP : STEP_EDGE;
      ctx.lineWidth = 17;
      ctx.beginPath();
      ctx.moveTo(POLE_X, lerp(TOP_Y, BOT_Y, s));
      ctx.lineTo(outer.x, outer.y);
      ctx.stroke();

      // Guardrail post & cyan rail segment (Scene 2+, leaving Scene 2 gap around s=0.67 until Scene 3!)
      const showRailHere = hasRails && (t >= 12.0 || s < 0.6);
      if (showRailHere) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.moveTo(outer.x, outer.y);
        ctx.lineTo(outer.x, outer.y - 54);
        ctx.stroke();

        ctx.strokeStyle = RAIL_CYAN;
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(outer.x, outer.y);
        ctx.lineTo(outer.x, outer.y - 54);
        ctx.stroke();

        if (i < totalSteps) {
          const nextOuter = this.spiralPoint((i + 1) / totalSteps, spin, SPIRAL_RX);
          ctx.strokeStyle = INK;
          ctx.lineWidth = 13;
          ctx.beginPath();
          ctx.moveTo(outer.x, outer.y - 54);
          ctx.lineTo(nextOuter.x, nextOuter.y - 54);
          ctx.stroke();
          ctx.strokeStyle = RAIL_CYAN;
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(outer.x, outer.y - 54);
          ctx.lineTo(nextOuter.x, nextOuter.y - 54);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  private drawRotatingPlatforms(ctx: CanvasRenderingContext2D, t: number) {
    const platforms = [
      { x: 495, y: 1045, dir: 1 },
      { x: 265, y: 1240, dir: -1 },
      { x: 435, y: 1395, dir: 1 },
    ];
    for (const pl of platforms) {
      ctx.save();
      ctx.translate(pl.x, pl.y);
      ctx.rotate(t * 2.4 * pl.dir);
      ctx.fillStyle = PLAT_YELLOW;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(-56, -12, 112, 24, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PLAT_INDIGO;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawBasketball(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.fillStyle = BALL_ORANGE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Crisp basketball seam lines
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-BALL_R + 2, 0);
    ctx.lineTo(BALL_R - 2, 0);
    ctx.moveTo(0, -BALL_R + 2);
    ctx.lineTo(0, BALL_R - 2);
    ctx.arc(-BALL_R * 0.85, 0, BALL_R * 0.78, -0.78, 0.78);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(BALL_R * 0.85, 0, BALL_R * 0.78, Math.PI - 0.78, Math.PI + 0.78);
    ctx.stroke();

    ctx.restore();
  }

  private drawFX(ctx: CanvasRenderingContext2D, t: number, ch: CharState) {
    // Scene 1 Idea rays (4.2–5.1s)
    if (t >= 4.2 && t < 5.1) {
      const u = inv(4.2, 5.1, t);
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = STEP_TOP;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI * 0.85 + (i * Math.PI * 0.7) / 4;
        ctx.beginPath();
        ctx.moveTo(ch.x + Math.cos(a) * 95, 250 + Math.sin(a) * 95);
        ctx.lineTo(ch.x + Math.cos(a) * (120 + u * 22), 250 + Math.sin(a) * (120 + u * 22));
        ctx.stroke();
      }
      ctx.restore();
    }

    // Scene 5 Victory Confetti (24.15–25.75s)
    if (t >= 24.15 && t < 25.75) {
      const u = inv(24.15, 25.75, t);
      const colors = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU + 0.2;
        const px = 915 + Math.cos(a) * (25 + u * 145);
        const py = 835 + Math.sin(a) * (20 + u * 100) - u * 45 + u * u * 100;
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.rect(px - 6, py - 5, 12, 10);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Scene 5 Carousel Spin Motion Lines around the central pole (25.8–28.6s)
    if (t >= 25.8 && t < 28.6) {
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const ang = t * 9 + i * (Math.PI / 2);
        const ry = 840 + i * 165;
        ctx.beginPath();
        ctx.ellipse(POLE_X, ry, 235, 36, 0, ang, ang + 0.9);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------------
  // Locked Angry Stickman Rig
  // -------------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, ch: CharState, pose: Pose, t: number) {
    const baseY = ch.ground - ch.lift;
    const hipY = baseY - 260 + pose.hipDrop + pose.crouch * 52 + pose.sit * 44;
    const shoulderY = hipY - 170;
    const bodyTopX = ch.x + Math.sin(pose.lean) * 170;
    const headCx = bodyTopX + Math.sin(pose.headTilt) * 12;
    const headCy = shoulderY - 20 - HEAD_R + pose.headDrop;
    const arms = this.computeArms(pose, ch.x, hipY, t);

    ctx.save();
    if (ch.rot !== 0) {
      ctx.translate(ch.x, hipY - 60);
      ctx.rotate(ch.rot);
      ctx.translate(-ch.x, -(hipY - 60));
    }
    this.drawBody(ctx, ch.x, hipY, baseY, pose, arms);
    this.drawHead(ctx, headCx, headCy, pose);
    ctx.restore();
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

    const sitKneeL = { x: hipX - 34, y: hipY + 62 };
    const sitKneeR = { x: hipX + 34, y: hipY + 62 };
    const sitAnkleL = { x: hipX - 24, y: hipY + 148 };
    const sitAnkleR = { x: hipX + 24, y: hipY + 148 };

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

    this.drawShoe(ctx, ankleL.x - 4, ankleL.y + 12, lerp(-0.06, -0.25, pose.sit));
    this.drawShoe(
      ctx,
      ankleR.x + 4,
      ankleR.y + 12,
      lerp(pose.footLift > 20 ? -0.24 : 0.06, 0.25, pose.sit)
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

  private computeArms(pose: Pose, x: number, hipY: number, _t: number): { l: Arm; r: Arm } {
    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(pose.lean) * 170;
    const headCx = bodyTopX + Math.sin(pose.headTilt) * 12;
    const headCy = shoulderY - 20 - HEAD_R + pose.headDrop;
    const handClear = HEAD_R + 26;
    const elbowClear = HEAD_R + 30;
    const hipShift = hipY - 460;

    const solve = (side: -1 | 1, target: Pt, bend: 1 | -1): Arm => {
      const sx = bodyTopX + side * 36;
      const sy = shoulderY;
      let hx = x + target.x;
      let hy = target.y + hipShift;
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

    this.drawBeanieShape(ctx);

    const eyeShiftY = pose.look === 'down' ? 7 : pose.look === 'up' ? -7 : 0;
    const eyeShiftX = pose.look === 'right' ? 7 : pose.look === 'left' ? -7 : 0;
    const eyeY = 8 + eyeShiftY;
    const eyeDX = 26;
    const fx = pose.headTurn + eyeShiftX;

    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;

    if (pose.eye === 'shut' || pose.eye === 'happy') {
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
    ctx.translate(WIDTH / 2, 1615);
    ctx.scale(scale, scale);

    ctx.font = '900 48px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.strokeText(caption.text, 0, 0, 920);

    ctx.fillStyle = '#fbbf24';
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
