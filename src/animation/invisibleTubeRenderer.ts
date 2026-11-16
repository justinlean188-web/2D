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

// --- Studio & Transparent Tube Palette (Modern Pop 2D Flat Vector) ---------
const WALL_BG = '#f8fafc';
const WALL_BAND = '#e2e8f0';
const FLOOR_TILE = '#cbd5e1';
const FLOOR_LINE = '#94a3b8';

const METAL_DARK = '#475569';
const METAL_MID = '#64748b';
const PUMP_YELLOW = '#facc15';
const PUMP_RED = '#ef4444';
const PUMP_CYAN = '#06b6d4';

const BALL_ORANGE = '#f97316';
const CUP_RED = '#ef4444';
const CUP_DEEP = '#991b1b';

const TUBE_OUTLINE = 'rgba(59, 130, 246, 0.58)';
const TUBE_FILL = 'rgba(219, 234, 254, 0.34)';
const TUBE_GLOSS = 'rgba(255, 255, 255, 0.72)';

const FLOOR_Y = 1520;
const HEAD_R = 70;
const BALL_R = 19;

// --- Deterministic Helpers -------------------------------------------------
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

interface Spline {
  pts: Pt[];
  lens: number[];
  total: number;
}

function makeSpline(rawPts: Pt[]): Spline {
  const pts: Pt[] = [];
  for (let i = 0; i < rawPts.length - 1; i++) {
    const a = rawPts[i];
    const b = rawPts[i + 1];
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(dist / 12));
    for (let s = 0; s < steps; s++) {
      const u = s / steps;
      pts.push({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });
    }
  }
  pts.push(rawPts[rawPts.length - 1]);

  const lens: number[] = [0];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    acc += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    lens.push(acc);
  }
  return { pts, lens, total: Math.max(1, acc) };
}

function sampleSpline(sp: Spline, uRaw: number): Pt {
  const u = clamp(uRaw, 0, 1);
  const target = u * sp.total;
  let lo = 0;
  let hi = sp.lens.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (sp.lens[mid] <= target) lo = mid;
    else hi = mid;
  }
  const seg = Math.max(0.0001, sp.lens[hi] - sp.lens[lo]);
  const f = (target - sp.lens[lo]) / seg;
  return {
    x: lerp(sp.pts[lo].x, sp.pts[hi].x, f),
    y: lerp(sp.pts[lo].y, sp.pts[hi].y, f),
  };
}

function arcPts(cx: number, cy: number, r: number, a0: number, a1: number, steps: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = lerp(a0, a1, i / steps);
    out.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return out;
}

// --- Connected Transparent Tube Geometries ---------------------------------
// Scene 1: U-bend invisible tube curving behind Stickman (x=540 -> x=190)
const TUBE_S1 = makeSpline([
  { x: 545, y: 1020 },
  { x: 545, y: 1240 },
  ...arcPts(455, 1265, 90, 0, Math.PI * 0.5, 12),
  { x: 280, y: 1355 },
  ...arcPts(280, 1265, 90, Math.PI * 0.5, Math.PI, 12),
  { x: 190, y: 1030 },
]);

// Scene 2: Giant transparent tube with bends + full upside-down loop
const TUBE_S2 = makeSpline([
  { x: 385, y: 975 },
  { x: 435, y: 1175 },
  { x: 520, y: 1175 },
  // Full 360 upside-down loop centered at (615, 1045), r=130
  ...arcPts(615, 1045, 130, Math.PI * 0.5, Math.PI * 0.5 - TAU, 32),
  { x: 745, y: 1175 },
  ...arcPts(745, 1095, 80, Math.PI * 0.5, 0, 10),
  { x: 825, y: 980 },
  { x: 855, y: 955 },
]);

// Scenes 3–5: Full Ultimate Twisting Tube Track connected to Air Pump!
// Starts at Air Pump inlet (250, 965) -> 2 spiral coils -> vertical climb -> ceiling loop -> vertical drop -> exit nozzle aimed at Red Cup (940, 1260)!
const TUBE_ULTIMATE = makeSpline([
  { x: 255, y: 965 },
  { x: 335, y: 1095 },
  // Spiral Coil 1 (415, 1015)
  ...arcPts(415, 1015, 80, Math.PI * 0.5, Math.PI * 0.5 - TAU, 24),
  { x: 485, y: 1095 },
  // Spiral Coil 2 (535, 1015)
  ...arcPts(535, 1015, 80, Math.PI * 0.5, Math.PI * 0.5 - TAU, 24),
  // Vertical climb section (x=590, y=1095 -> 380)
  { x: 590, y: 1095 },
  { x: 590, y: 390 },
  ...arcPts(655, 390, 65, Math.PI, Math.PI * 1.5, 10),
  // Ceiling run + Ceiling Loop centered at (745, 420), r=95
  { x: 745, y: 325 },
  ...arcPts(745, 420, 95, -Math.PI * 0.5, -Math.PI * 0.5 - TAU, 28),
  { x: 810, y: 325 },
  ...arcPts(810, 390, 65, -Math.PI * 0.5, 0, 10),
  // Vertical Drop & Exit Nozzle aimed toward Red Target Cup!
  { x: 875, y: 895 },
  ...arcPts(815, 895, 60, 0, Math.PI * 0.38, 10),
  { x: 865, y: 950 },
]);

const RED_CUP = { x: 945, y: 1280 };

interface Pose {
  lean: number;
  hipDrop: number;
  crouch: number;
  headTilt: number;
  headTurn: number;
  headDrop: number;
  beanieOn: boolean;
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
  headTilt: 0,
  headTurn: 2,
  headDrop: 0,
  beanieOn: true,
  look: 'right',
  mouth: 'smirk',
  brow: 'determined',
  eye: 'open',
  stance: 12,
  footLift: 0,
  handL: { x: -64, y: 1210 },
  handR: { x: 76, y: 1210 },
  bendL: -1,
  bendR: 1,
};

const POSE_PATCHES: { t: number; p: Partial<Pose> }[] = [
  // Scene 1: Throws ball right -> ball enters U-tube & shoots behind him -> turns around in shock!
  { t: 0.0, p: { look: 'right', mouth: 'smirk', brow: 'determined', handL: { x: -58, y: 1220 }, handR: { x: 78, y: 1180 } } },
  { t: 1.0, p: { lean: -0.08, handL: { x: -46, y: 1180 }, handR: { x: 96, y: 1095 }, gripR: true } },
  { t: 1.55, p: { lean: 0.16, gripR: false, mouth: 'grin', handL: { x: -66, y: 1155 }, handR: { x: 128, y: 1015 } } },
  // Ball shoots out behind him (2.85s) -> spins left in shock!
  { t: 2.95, p: { lean: -0.14, headTurn: -8, look: 'left', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -102, y: 1055 }, handR: { x: 86, y: 1085 } } },
  { t: 4.35, p: { lean: 0.14, headTurn: 2, look: 'right', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -78, y: 1165 }, handR: { x: 118, y: 1085 }, pointR: true } },

  // Scene 2: Drops ball into giant multi-bend + loop tube -> watches upside-down loop!
  { t: 6.0, p: { lean: 0.1, pointR: false, look: 'right', brow: 'determined', mouth: 'smile', handL: { x: -58, y: 1165 }, handR: { x: 92, y: 1020 } } },
  { t: 7.65, p: { lean: 0.18, hipDrop: 10, mouth: 'grin', handL: { x: -64, y: 1140 }, handR: { x: 105, y: 970 } } },
  { t: 9.2, p: { lean: 0.04, hipDrop: 0, look: 'right', eye: 'wide', brow: 'raised', mouth: 'bigsmile', handL: { x: -82, y: 1030 }, handR: { x: 88, y: 1030 } } },

  // Scene 3: Connects ultimate tube modules -> releases ball -> watches loops & drop!
  { t: 12.15, p: { lean: 0.14, hipDrop: 8, look: 'up', brow: 'determined', mouth: 'smirk', handL: { x: -58, y: 1070 }, handR: { x: 102, y: 1035 } } },
  { t: 13.65, p: { lean: 0.16, look: 'right', mouth: 'grin', handL: { x: -66, y: 1150 }, handR: { x: 106, y: 1035 } } },
  { t: 15.2, p: { lean: 0.02, look: 'up', eye: 'open', brow: 'cocky', mouth: 'bigsmile', handL: { x: -56, y: 1135 }, handR: { x: 60, y: 1135 }, fistL: true, fistR: true } },

  // Scene 4: Drops ball in Air Pump inlet & slams Air Pump ON (18.85s) -> suspense crouch!
  { t: 18.2, p: { lean: -0.18, hipDrop: 18, crouch: 0.25, fistL: false, fistR: false, look: 'left', brow: 'determined', mouth: 'grit', handL: { x: -115, y: 1265 }, handR: { x: -95, y: 1265 } } },
  { t: 18.95, p: { lean: 0.12, hipDrop: 4, crouch: 0, look: 'up', eye: 'wide', brow: 'raised', mouth: 'grin', handL: { x: -86, y: 1120 }, handR: { x: 114, y: 1060 }, pointR: true } },
  { t: 21.8, p: { lean: 0.1, hipDrop: 20, crouch: 0.3, pointR: false, look: 'right', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -52, y: 1085 }, handR: { x: 64, y: 1085 }, fistL: true, fistR: true } },

  // Scene 5: Ball lands in cup! Celebrates -> Air Pump reverses -> ball knocks red beanie off!
  { t: 24.15, p: { lean: 0, hipDrop: 0, crouch: 0, eye: 'happy', brow: 'raised', mouth: 'bigsmile', fistL: false, fistR: false, handL: { x: -114, y: 925 }, handR: { x: 114, y: 925 } } },
  // 25.85s: Notices reversed pump sucking ball back!
  { t: 25.95, p: { lean: -0.08, look: 'right', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -92, y: 1065 }, handR: { x: 96, y: 1065 } } },
  // 27.15s: Ball shoots out & knocks red beanie off his head!
  { t: 27.15, p: { beanieOn: false, lean: 0.18, headTilt: 0.14, look: 'left', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -102, y: 995 }, handR: { x: 88, y: 1030 } } },
  // 28.25s: Deadpan glare without beanie
  { t: 28.25, p: { beanieOn: false, lean: -0.02, headTilt: 0, headTurn: 0, look: 'center', eye: 'squint', brow: 'uneven', mouth: 'frown', handL: { x: -72, y: 1205 }, handR: { x: 72, y: 1205 } } },
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
  { from: 0.25, to: 5.75, text: 'WHERE DID IT GO?!' },
  { from: 6.25, to: 11.75, text: 'INVISIBLE BALL TRACK!' },
  { from: 12.25, to: 17.75, text: 'THE ULTIMATE TUBE!' },
  { from: 18.25, to: 23.75, text: 'FULL SPEED!' },
  { from: 24.25, to: 29.85, text: 'THE BALL CAME BACK! 😂' },
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
  lift: number;
  walkPhase: number;
}

export class InvisibleTubeRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.walkPhase);

    // 1. Studio Backdrop
    this.drawBackdrop(ctx);

    // 2. Air Pump + Red Target Cup Pedestal (Back Layer)
    this.drawAirPump(ctx, time);
    this.drawRedCupPedestalAndBack(ctx);

    // 3. Transparent Tubes Back Fill (faint blue outlines & clear interior)
    const activeSpline = time < 6.0 ? TUBE_S1 : time < 12.0 ? TUBE_S2 : TUBE_ULTIMATE;
    this.drawTubeBack(ctx, activeSpline, time);

    // 4. Orange Ping-Pong Ball (always crisp & visible inside the transparent tubes!)
    const ball = this.ballAt(time, ch);
    this.drawOrangeBall(ctx, ball.x, ball.y, ball.rot);

    // 5. Transparent Tube Glass Rim Highlights (drawn OVER ball so it clearly looks inside!)
    this.drawTubeFront(ctx, activeSpline, time);

    // 6. Stickman Character + Knocked-Off Red Beanie in Scene 5
    this.drawCharacter(ctx, ch, pose, time);
    if (time >= 27.15) {
      this.drawFlyingBeanie(ctx, time);
    }

    // 7. Red Target Cup Front + Airflow Streaks & Confetti FX
    this.drawRedCupFrontAndFX(ctx, time, ball);

    if (config.showCaptions) {
      this.drawCaptions(ctx, time);
    }
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Character & Continuous Ball Physics Timelines
  // -------------------------------------------------------------------------
  private charAt(t: number): CharState {
    let x = 325;
    let lift = 0;
    let walkPhase = 0;

    if (t >= 6.0 && t < 7.2) {
      const u = easeInOut(inv(6.0, 7.2, t));
      x = lerp(325, 290, u);
      walkPhase = u * 2;
    } else if (t >= 7.2 && t < 24.15) {
      x = 290;
    } else if (t >= 24.15 && t < 25.85) {
      x = 290;
      lift = Math.abs(Math.sin((t - 24.15) * 6.5)) * 42;
    } else if (t >= 27.15 && t < 27.65) {
      const u = inv(27.15, 27.65, t);
      x = lerp(290, 310, u);
      lift = Math.sin(u * Math.PI) * 28;
    } else if (t >= 27.65) {
      x = 310;
    }

    return { x, lift, walkPhase };
  }

  private ballAt(t: number, ch: CharState): { x: number; y: number; rot: number } {
    // Scene 1: Held -> thrown right -> disappears into U-tube -> shoots behind him -> bounces to floor
    if (t < 1.55) {
      return { x: ch.x + 92, y: t < 1.0 ? 1175 : 1095, rot: t * 2 };
    }
    if (t < 1.95) {
      const u = inv(1.55, 1.95, t);
      return { x: lerp(ch.x + 92, 545, u), y: lerp(1095, 1020, u) - Math.sin(u * Math.PI) * 90, rot: u * 4 };
    }
    if (t < 2.85) {
      const u = easeInOut(inv(1.95, 2.85, t));
      const p = sampleSpline(TUBE_S1, u);
      return { x: p.x, y: p.y, rot: 4 + u * 10 };
    }
    if (t < 3.25) {
      const u = inv(2.85, 3.25, t);
      return { x: lerp(190, 125, u), y: lerp(1030, FLOOR_Y - BALL_R, u * u) - Math.sin(u * Math.PI) * 65, rot: 14 - u * 4 };
    }
    if (t < 6.0) {
      return { x: 125, y: FLOOR_Y - BALL_R, rot: 10 };
    }

    // Scene 2: Carried to inlet (6.0-7.65s) -> drops into giant loop tube -> shoots out -> returns
    if (t < 7.65) {
      const u = easeInOut(inv(6.0, 7.65, t));
      return { x: lerp(125, 385, u), y: lerp(FLOOR_Y - BALL_R, 975, easeOut(u)), rot: 10 + u * 3 };
    }
    if (t < 10.3) {
      const u = easeInOut(inv(7.65, 10.3, t));
      const p = sampleSpline(TUBE_S2, u);
      return { x: p.x, y: p.y, rot: 13 + u * 16 };
    }
    if (t < 10.85) {
      const u = inv(10.3, 10.85, t);
      return { x: lerp(855, 905, u), y: lerp(955, FLOOR_Y - BALL_R, u * u), rot: 29 + u * 4 };
    }
    if (t < 12.0) {
      const u = easeInOut(inv(10.85, 12.0, t));
      return { x: lerp(905, 355, u), y: FLOOR_Y - BALL_R, rot: 33 - u * 8 };
    }

    // Scene 3: Placed in Ultimate Tube -> races through spirals, loop & drop -> falls short of Red Cup
    if (t < 13.65) {
      const u = easeInOut(inv(12.0, 13.65, t));
      return { x: lerp(355, 255, u), y: lerp(FLOOR_Y - BALL_R, 965, u), rot: 25 - u * 4 };
    }
    if (t < 16.75) {
      const u = easeInOut(inv(13.65, 16.75, t));
      const p = sampleSpline(TUBE_ULTIMATE, u);
      return { x: p.x, y: p.y, rot: 21 + u * 24 };
    }
    if (t < 17.35) {
      // Falls short of Red Cup at x=900
      const u = inv(16.75, 17.35, t);
      return { x: lerp(865, 895, u), y: lerp(950, FLOOR_Y - BALL_R, u * u), rot: 45 + u * 3 };
    }
    if (t < 18.65) {
      const u = easeInOut(inv(17.35, 18.65, t));
      return { x: lerp(895, 255, u), y: lerp(FLOOR_Y - BALL_R, 965, easeOut(u)), rot: 48 - u * 10 };
    }

    // Scene 4: Air Pump ON (18.85s) -> FULL SPEED through spiral, vertical climb, ceiling loop -> shoots to Red Cup!
    if (t < 18.85) {
      return { x: 255, y: 965, rot: 38 };
    }
    if (t < 22.9) {
      const u = easeInOut(inv(18.85, 22.9, t));
      const p = sampleSpline(TUBE_ULTIMATE, u);
      return { x: p.x, y: p.y, rot: 38 + u * 36 };
    }
    if (t < 24.15) {
      const u = easeInOut(inv(22.9, 24.15, t));
      return {
        x: lerp(865, RED_CUP.x, u),
        y: lerp(950, RED_CUP.y - 36, u) - Math.sin(u * Math.PI) * 120,
        rot: 74 + u * 8,
      };
    }

    // Scene 5: Lands in cup (24.15-25.85s) -> Air Pump REVERSES -> sucks backward -> shoots out & hits beanie!
    if (t < 25.85) {
      return { x: RED_CUP.x, y: RED_CUP.y - 36, rot: 82 };
    }
    if (t < 26.15) {
      // Sucked backward out of Red Cup into exit nozzle!
      const u = easeInOut(inv(25.85, 26.15, t));
      return {
        x: lerp(RED_CUP.x, 865, u),
        y: lerp(RED_CUP.y - 36, 950, u) - Math.sin(u * Math.PI) * 55,
        rot: 82 - u * 6,
      };
    }
    if (t < 27.15) {
      // Zips backward through ENTIRE tube path (u = 1 -> 0)!
      const u = 1 - easeInOut(inv(26.15, 27.15, t));
      const p = sampleSpline(TUBE_ULTIMATE, u);
      return { x: p.x, y: p.y, rot: 76 - (1 - u) * 32 };
    }
    if (t < 27.95) {
      // Shoots backward out of inlet (255, 965) knocking Stickman's beanie off at (300, 960), landing on floor!
      const u = inv(27.15, 27.95, t);
      return {
        x: lerp(255, 455, u),
        y: lerp(965, FLOOR_Y - BALL_R, u * u) - Math.sin(u * Math.PI) * 85,
        rot: 44 + u * 6,
      };
    }
    return { x: 455, y: FLOOR_Y - BALL_R, rot: 50 };
  }

  private poseAt(t: number, walkPhase: number): Pose {
    let prev = POSE_KEYS[0];
    let next = POSE_KEYS[POSE_KEYS.length - 1];
    for (let i = 0; i < POSE_KEYS.length; i++) {
      if (POSE_KEYS[i].t <= t) prev = POSE_KEYS[i];
      if (POSE_KEYS[i].t >= t) {
        next = POSE_KEYS[i];
        break;
      }
    }
    const span = Math.max(0.0001, next.t - prev.t);
    const u = next.t === prev.t ? 0 : easeInOut(clamp((t - prev.t) / span, 0, 1));
    const sw = Math.sin(walkPhase * Math.PI * 2);
    return {
      ...prev,
      lean: lerp(prev.lean, next.lean, u),
      hipDrop: lerp(prev.hipDrop, next.hipDrop, u),
      crouch: lerp(prev.crouch, next.crouch, u),
      headTilt: lerp(prev.headTilt, next.headTilt, u),
      headTurn: lerp(prev.headTurn, next.headTurn, u),
      headDrop: lerp(prev.headDrop, next.headDrop, u),
      beanieOn: u < 0.5 ? prev.beanieOn : next.beanieOn,
      look: u < 0.5 ? prev.look : next.look,
      mouth: u < 0.5 ? prev.mouth : next.mouth,
      brow: u < 0.5 ? prev.brow : next.brow,
      eye: u < 0.5 ? prev.eye : next.eye,
      stance: lerp(prev.stance, next.stance, u) + Math.abs(sw) * 28,
      footLift: Math.max(0, sw) * 26,
      handL: { x: lerp(prev.handL.x, next.handL.x, u), y: lerp(prev.handL.y, next.handL.y, u) },
      handR: { x: lerp(prev.handR.x, next.handR.x, u), y: lerp(prev.handR.y, next.handR.y, u) },
      pointL: u < 0.5 ? prev.pointL : next.pointL,
      pointR: u < 0.5 ? prev.pointR : next.pointR,
      fistL: u < 0.5 ? prev.fistL : next.fistL,
      fistR: u < 0.5 ? prev.fistR : next.fistR,
      gripL: u < 0.5 ? prev.gripL : next.gripL,
      gripR: u < 0.5 ? prev.gripR : next.gripR,
    };
  }

  // -------------------------------------------------------------------------
  // Studio Backdrop, Air Pump, Red Cup & Transparent Tube Layers
  // -------------------------------------------------------------------------
  private drawBackdrop(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = WALL_BG;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = WALL_BAND;
    ctx.fillRect(0, 0, WIDTH, 220);

    ctx.fillStyle = FLOOR_TILE;
    ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);

    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 4;
    for (let gx = 40; gx <= WIDTH; gx += 160) {
      ctx.beginPath();
      ctx.moveTo(gx, FLOOR_Y);
      ctx.lineTo(gx - 85, HEIGHT);
      ctx.stroke();
    }

    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(WIDTH, FLOOR_Y);
    ctx.stroke();
  }

  private drawAirPump(ctx: CanvasRenderingContext2D, t: number) {
    const px = 115;
    const isForward = t >= 18.85 && t < 25.85;
    const isReverse = t >= 25.85;
    const pumpBounce =
      t >= 18.85 && t < 19.35 ? Math.sin(inv(18.85, 19.35, t) * Math.PI) * 18 : 0;

    // Connecting hose from Air Pump top into main tube inlet (255, 965) once installed in Scene 3+
    if (t >= 12.0) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px + 30, 1345);
      ctx.quadraticCurveTo(150, 1100, 255, 965);
      ctx.stroke();
      ctx.strokeStyle = isReverse ? PUMP_RED : isForward ? PUMP_CYAN : METAL_MID;
      ctx.lineWidth = 7;
      ctx.stroke();
    }

    // Pump Base & Tank
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(px - 52, FLOOR_Y - 28, 104, 28, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isReverse ? PUMP_RED : PUMP_YELLOW;
    ctx.beginPath();
    ctx.roundRect(px - 38, FLOOR_Y - 190, 76, 162, 14);
    ctx.fill();
    ctx.stroke();

    // Handle Piston
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(px, FLOOR_Y - 190);
    ctx.lineTo(px, FLOOR_Y - 245 + pumpBounce);
    ctx.stroke();

    ctx.fillStyle = PUMP_RED;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(px - 42, FLOOR_Y - 262 + pumpBounce, 84, 22, 10);
    ctx.fill();
    ctx.stroke();

    // Pressure Gauge + Clear Direction Arrow (Forward Cyan >>> vs Reverse Red <<<)
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(px, FLOOR_Y - 125, 24, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = isReverse ? PUMP_RED : isForward ? PUMP_CYAN : INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    if (isReverse) {
      // Left-pointing reverse suction arrow <<<
      ctx.moveTo(px + 10, FLOOR_Y - 125);
      ctx.lineTo(px - 10, FLOOR_Y - 125);
      ctx.moveTo(px - 3, FLOOR_Y - 133);
      ctx.lineTo(px - 11, FLOOR_Y - 125);
      ctx.lineTo(px - 3, FLOOR_Y - 117);
    } else {
      // Right-pointing forward blast arrow >>>
      ctx.moveTo(px - 10, FLOOR_Y - 125);
      ctx.lineTo(px + 10, FLOOR_Y - 125);
      ctx.moveTo(px + 3, FLOOR_Y - 133);
      ctx.lineTo(px + 11, FLOOR_Y - 125);
      ctx.lineTo(px + 3, FLOOR_Y - 117);
    }
    ctx.stroke();
  }

  private drawRedCupPedestalAndBack(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(RED_CUP.x - 28, RED_CUP.y, 56, FLOOR_Y - RED_CUP.y, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = CUP_DEEP;
    ctx.beginPath();
    ctx.ellipse(RED_CUP.x, RED_CUP.y - 72, 32, 10, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private strokeSpline(ctx: CanvasRenderingContext2D, sp: Spline) {
    ctx.beginPath();
    ctx.moveTo(sp.pts[0].x, sp.pts[0].y);
    for (let i = 1; i < sp.pts.length; i++) {
      ctx.lineTo(sp.pts[i].x, sp.pts[i].y);
    }
    ctx.stroke();
  }

  private drawTubeBack(ctx: CanvasRenderingContext2D, sp: Spline, t: number) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer faint blue wall outline
    ctx.strokeStyle = TUBE_OUTLINE;
    ctx.lineWidth = 56;
    this.strokeSpline(ctx, sp);

    // Translucent clear interior
    ctx.strokeStyle = TUBE_FILL;
    ctx.lineWidth = 46;
    this.strokeSpline(ctx, sp);

    // Subtle animated airflow chevrons along the tube when Air Pump is running (Scene 4 Forward / Scene 5 Reverse)
    if (t >= 18.85 && t < 27.3) {
      const reverse = t >= 25.85;
      const count = 8;
      ctx.strokeStyle = reverse ? 'rgba(239, 68, 68, 0.72)' : 'rgba(6, 182, 212, 0.75)';
      ctx.lineWidth = 5;
      for (let i = 0; i < count; i++) {
        const rawU = (i / count + (reverse ? -1 : 1) * ((t * 0.55) % 1) + 1) % 1;
        const p1 = sampleSpline(sp, rawU);
        const p2 = sampleSpline(sp, clamp(rawU + (reverse ? -0.015 : 0.015), 0, 1));
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.max(0.001, Math.hypot(dx, dy));
        const ux = dx / len;
        const uy = dy / len;
        const nx = -uy;
        const ny = ux;
        ctx.beginPath();
        ctx.moveTo(p1.x - ux * 8 + nx * 10, p1.y - uy * 8 + ny * 10);
        ctx.lineTo(p1.x + ux * 9, p1.y + uy * 9);
        ctx.lineTo(p1.x - ux * 8 - nx * 10, p1.y - uy * 8 - ny * 10);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private drawTubeFront(ctx: CanvasRenderingContext2D, sp: Spline, _t: number) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Thin glossy specular glass reflection crossing front of the ball
    ctx.strokeStyle = TUBE_GLOSS;
    ctx.lineWidth = 5;
    ctx.setLineDash([28, 34]);
    this.strokeSpline(ctx, sp);
    ctx.setLineDash([]);

    // Open nozzle cuff highlights at start & end
    const pStart = sp.pts[0];
    const pEnd = sp.pts[sp.pts.length - 1];
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.fillStyle = 'rgba(219, 234, 254, 0.55)';
    ctx.lineWidth = 4;
    for (const endPt of [pStart, pEnd]) {
      ctx.beginPath();
      ctx.arc(endPt.x, endPt.y, 26, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawOrangeBall(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
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

    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.ellipse(-6, -6, 5.5, 3, -0.6, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawFlyingBeanie(ctx: CanvasRenderingContext2D, t: number) {
    // Knocked off Stickman's head at 27.15s -> spins left and lands atop the Air Pump!
    const u = easeOut(inv(27.15, 27.95, t));
    const bx = lerp(310, 115, u);
    const by = lerp(955, FLOOR_Y - 275, u) - Math.sin(u * Math.PI) * 165;
    const rot = lerp(0, -Math.PI * 2 + 0.15, u);

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rot);
    this.drawBeanieShape(ctx);
    ctx.restore();
  }

  private drawRedCupFrontAndFX(
    ctx: CanvasRenderingContext2D,
    t: number,
    _ball: { x: number; y: number; rot: number }
  ) {
    // Red Target Cup Front Body
    ctx.fillStyle = CUP_RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(RED_CUP.x - 32, RED_CUP.y - 72);
    ctx.lineTo(RED_CUP.x + 32, RED_CUP.y - 72);
    ctx.lineTo(RED_CUP.x + 24, RED_CUP.y);
    ctx.lineTo(RED_CUP.x - 24, RED_CUP.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(RED_CUP.x - 24, RED_CUP.y - 64);
    ctx.lineTo(RED_CUP.x + 24, RED_CUP.y - 64);
    ctx.stroke();

    // Confetti Burst at 24.15–25.85s
    if (t >= 24.15 && t <= 26.0) {
      const u = clamp((t - 24.15) / 1.7, 0, 1);
      const colors = ['#facc15', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'];
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * TAU;
        const dist = 38 + u * (110 + (i % 3) * 32);
        const px = RED_CUP.x + Math.cos(ang) * dist;
        const py = RED_CUP.y - 70 + Math.sin(ang) * dist * 0.75 + u * u * 140;
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(u * 5 + i);
        ctx.fillRect(-6, -4, 12, 8);
        ctx.strokeRect(-6, -4, 12, 8);
        ctx.restore();
      }
    }
  }

  // -------------------------------------------------------------------------
  // Locked Angry Stickman Rig
  // -------------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, ch: CharState, pose: Pose, t: number) {
    const x = ch.x;
    const hipY = 1260 - ch.lift + pose.hipDrop + pose.crouch * 45;
    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(pose.lean) * 170;
    const bodyTilt = pose.lean;

    const footSpread = 22 + pose.stance;
    const footLX = x - footSpread;
    const footLY = FLOOR_Y - 14 - ch.lift - (pose.footLift > 0 ? pose.footLift : 0);
    const footRX = x + footSpread;
    const footRY = FLOOR_Y - 14 - ch.lift;

    const arms = this.computeArms(pose, x, hipY, t);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(arms.l.sx, arms.l.sy);
    ctx.lineTo(arms.l.ex, arms.l.ey);
    ctx.lineTo(arms.l.hx, arms.l.hy);
    ctx.stroke();
    this.drawSleeve(ctx, arms.l);

    ctx.strokeStyle = TROUSER;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(x - 16, hipY);
    ctx.lineTo(footLX, footLY);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.stroke();
    this.drawShoe(ctx, footLX, footLY, 0);

    ctx.strokeStyle = TROUSER;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(x + 16, hipY);
    ctx.lineTo(footRX, footRY);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.stroke();
    this.drawShoe(ctx, footRX, footRY, 0);

    ctx.save();
    ctx.translate(x, hipY);
    ctx.rotate(bodyTilt);
    ctx.fillStyle = SHIRT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-42, -176, 84, 178, 22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = SHIRT_DEEP;
    ctx.fillRect(-38, -24, 76, 20);
    ctx.restore();

    const headCx = bodyTopX + Math.sin(pose.headTilt) * 12;
    const headCy = shoulderY - 20 - HEAD_R + pose.headDrop;
    this.drawHead(ctx, headCx, headCy, pose);

    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(arms.r.sx, arms.r.sy);
    ctx.lineTo(arms.r.ex, arms.r.ey);
    ctx.lineTo(arms.r.hx, arms.r.hy);
    ctx.stroke();
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
    const hipShift = hipY - 1260;

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

    if (pose.beanieOn) this.drawBeanieShape(ctx);

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

    ctx.fillStyle = '#60a5fa';
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
