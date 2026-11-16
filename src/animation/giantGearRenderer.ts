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

// --- Modern Pop 2D Flat Vector Workshop & Gear Palette ---------------------
const WALL_BG = '#f8fafc';
const WALL_BAND = '#e2e8f0';
const FLOOR_TILE = '#cbd5e1';
const FLOOR_LINE = '#94a3b8';

const FRAME_DARK = '#334155';
const FRAME_MID = '#475569';
const GEAR_LIGHT = '#e2e8f0';
const GEAR_BODY = '#cbd5e1';
const GEAR_SHADE = '#94a3b8';
const GEAR_HUB = '#64748b';
const BALL_BRIGHT = '#f8fafc';
const BALL_MID = '#cbd5e1';
const BALL_SHADE = '#64748b';

const GOLD_BRIGHT = '#fde047';
const GOLD_MID = '#f59e0b';
const GOLD_DEEP = '#b45309';

const RAMP_BLUE = '#38bdf8';
const RAMP_DEEP = '#0284c7';
const RING_ORANGE = '#f97316';
const SPRING_RED = '#ef4444';
const TURBO_CYAN = '#06b6d4';

const FLOOR_Y = 1520;
const HEAD_R = 70;
const BALL_R = 20;

// --- Deterministic Math Helpers --------------------------------------------
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const inv = (a: number, b: number, v: number) => clamp((v - a) / (b - a), 0, 1);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const easeIn = (u: number) => u * u * u;
const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

type Pt = { x: number; y: number };
type Look = 'center' | 'right' | 'left' | 'up' | 'down';
type Mouth = 'flat' | 'smile' | 'grin' | 'bigsmile' | 'smirk' | 'frown' | 'o' | 'grit';
type Brow = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'uneven' | 'determined';
type Eye = 'open' | 'wide' | 'squint' | 'shut' | 'happy';

interface GearSpec {
  cx: number;
  cy: number;
  teeth: number;
  r: number; // pitch radius = teeth * module / 2
  dir: 1 | -1;
  ratio: number; // relative angular speed magnitude vs G1
  phase: number; // tooth meshing phase offset
}

function buildGearChain(
  startCx: number,
  startCy: number,
  moduleVal: number,
  defs: { teeth: number; angleDegFromPrev?: number }[]
): GearSpec[] {
  const out: GearSpec[] = [];
  const baseTeeth = defs[0].teeth;
  for (let i = 0; i < defs.length; i++) {
    const teeth = defs[i].teeth;
    const r = (teeth * moduleVal) / 2;
    if (i === 0) {
      out.push({ cx: startCx, cy: startCy, teeth, r, dir: 1, ratio: 1, phase: 0 });
    } else {
      const prev = out[i - 1];
      const ang = ((defs[i].angleDegFromPrev ?? 0) * Math.PI) / 180;
      const dist = prev.r + r;
      const cx = prev.cx + Math.cos(ang) * dist;
      const cy = prev.cy + Math.sin(ang) * dist;
      const dir = (prev.dir * -1) as 1 | -1;
      const ratio = baseTeeth / teeth;
      // Interleave teeth cleanly along the connecting line angle:
      // At angle `ang`, prev tooth angle is (prev.phase + prev.dir * theta).
      // For tooth of gear i at `ang + PI` to sit halfway between two teeth of prev:
      const prevAtLine = ang - prev.phase;
      const stepCurr = TAU / teeth;
      const targetPhase = ang + Math.PI + (prevAtLine * prev.teeth) / teeth + stepCurr * 0.5;
      out.push({ cx, cy, teeth, r, dir, ratio, phase: targetPhase });
    }
  }
  return out;
}

// Scene 1: Two giant equal interlocking gears (center pinch launches upward!)
const S1_GEARS = buildGearChain(468, 1175, 16, [
  { teeth: 14 },
  { teeth: 14, angleDegFromPrev: 0 },
]);
// S1 midpoint between gears = (580, 1175)

// Scene 2: Three interlocking gears of different sizes (Large -> Medium -> Small)
const S2_GEARS = buildGearChain(385, 1195, 13.5, [
  { teeth: 16 },
  { teeth: 12, angleDegFromPrev: -24 },
  { teeth: 8, angleDegFromPrev: -32 },
]);

// Scenes 3–5: Six-gear mega machine across the workshop
const MEGA_GEARS = buildGearChain(315, 1235, 11, [
  { teeth: 14 },
  { teeth: 10, angleDegFromPrev: -22 },
  { teeth: 12, angleDegFromPrev: -32 },
  { teeth: 8, angleDegFromPrev: 18 },
  { teeth: 14, angleDegFromPrev: -45 },
  { teeth: 10, angleDegFromPrev: -66 },
]);

const SPIN_TRACK = { cx: 480, cy: 555, r: 108 };
const METAL_RING = { cx: 815, cy: 655, rx: 22, ry: 54 };
const SMALL_RAMP = { x0: 715, y0: 1125, x1: 815, y1: 1165 };
const GOLDEN_CUP = { x: 945, y: 1275 };
const SPRING_LAUNCHER = { x: 185, y: 1235 };

// --- Character Pose Timeline -----------------------------------------------
interface Pose {
  lean: number;
  hipDrop: number;
  crouch: number;
  headTilt: number;
  headTurn: number;
  headDrop: number;
  beanieOn: boolean;
  beanieSpringWobble: number;
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
  beanieSpringWobble: 0,
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
  // Scene 1: Drops silver ball between 2 giant gears -> steps right -> ball lands on head!
  { t: 0.0, p: { look: 'right', mouth: 'smirk', brow: 'determined', handL: { x: -58, y: 1210 }, handR: { x: 78, y: 1170 } } },
  { t: 1.0, p: { lean: 0.14, handL: { x: -52, y: 1170 }, handR: { x: 110, y: 1035 }, gripR: true } },
  { t: 1.65, p: { lean: 0.12, gripR: false, mouth: 'grin', eye: 'wide', handL: { x: -64, y: 1150 }, handR: { x: 116, y: 985 } } },
  { t: 2.35, p: { lean: -0.02, headTilt: -0.1, look: 'up', eye: 'wide', brow: 'raised', mouth: 'bigsmile', handL: { x: -84, y: 1095 }, handR: { x: 84, y: 1095 } } },
  // 3.45s: Silver ball lands on his head!
  { t: 3.45, p: { lean: 0.04, hipDrop: 18, headDrop: 16, headTilt: 0.08, look: 'center', eye: 'shut', brow: 'angry', mouth: 'grit', handL: { x: -96, y: 1045 }, handR: { x: 96, y: 1045 } } },
  { t: 4.5, p: { hipDrop: 0, headDrop: 0, headTilt: -0.05, look: 'right', eye: 'wide', brow: 'raised', mouth: 'bigsmile', handL: { x: -62, y: 1175 }, handR: { x: 112, y: 1080 }, pointR: true } },

  // Scene 2: Connects 3 gears -> drops ball -> launches backward over his head!
  { t: 6.0, p: { pointR: false, lean: 0.1, look: 'right', brow: 'determined', mouth: 'smile', handL: { x: -58, y: 1180 }, handR: { x: 96, y: 1060 } } },
  { t: 7.55, p: { lean: 0.16, mouth: 'grin', handL: { x: -60, y: 1140 }, handR: { x: 112, y: 1015 } } },
  { t: 8.5, p: { lean: 0.06, look: 'right', eye: 'wide', brow: 'raised', mouth: 'bigsmile', handL: { x: -58, y: 1140 }, handR: { x: 64, y: 1140 }, fistL: true, fistR: true } },
  // 9.85s: Launches backward over his head -> ducks in shock!
  { t: 9.9, p: { lean: -0.16, crouch: 0.45, hipDrop: 24, fistL: false, fistR: false, look: 'up', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -92, y: 1050 }, handR: { x: 92, y: 1050 } } },
  { t: 10.9, p: { crouch: 0, hipDrop: 0, lean: -0.06, look: 'left', eye: 'squint', brow: 'angry', mouth: 'frown', handL: { x: -68, y: 1205 }, handR: { x: 74, y: 1205 } } },

  // Scene 3: Activates 6-gear mega machine -> watches ball climb ramp & spin in track!
  { t: 12.15, p: { lean: 0.12, look: 'right', eye: 'open', brow: 'determined', mouth: 'smirk', handL: { x: -56, y: 1175 }, handR: { x: 108, y: 1105 } } },
  { t: 13.35, p: { lean: 0.14, mouth: 'grin', handL: { x: -60, y: 1160 }, handR: { x: 114, y: 1080 } } },
  { t: 15.2, p: { lean: 0.02, look: 'up', eye: 'wide', brow: 'raised', mouth: 'bigsmile', handL: { x: -72, y: 1110 }, handR: { x: 106, y: 1020 }, pointR: true } },

  // Scene 4: Cranks Spring Launcher / Turbo -> ball rockets through ring, bounces ramp, heads for cup!
  { t: 18.2, p: { pointR: false, lean: -0.1, crouch: 0.2, hipDrop: 12, look: 'right', brow: 'determined', mouth: 'grit', handL: { x: -82, y: 1215 }, handR: { x: 94, y: 1185 }, gripR: true } },
  { t: 18.75, p: { gripR: false, crouch: 0, hipDrop: 0, lean: 0.14, look: 'right', eye: 'wide', brow: 'raised', mouth: 'grin', handL: { x: -72, y: 1120 }, handR: { x: 112, y: 1045 }, pointR: true } },
  { t: 21.8, p: { pointR: false, lean: 0.12, hipDrop: 16, crouch: 0.22, look: 'right', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -54, y: 1085 }, handR: { x: 64, y: 1085 }, fistL: true, fistR: true } },

  // Scene 5: Scores! Celebrates -> gears reverse -> steals red beanie -> snaps back as spring!
  { t: 24.15, p: { lean: 0, hipDrop: 0, crouch: 0, eye: 'happy', brow: 'raised', mouth: 'bigsmile', fistL: false, fistR: false, handL: { x: -112, y: 925 }, handR: { x: 112, y: 925 } } },
  // 25.85s: Gears reverse!
  { t: 25.85, p: { lean: -0.06, look: 'right', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -96, y: 1045 }, handR: { x: 96, y: 1045 } } },
  // 26.10s: Beanie yanked off into gears!
  { t: 26.1, p: { beanieOn: false, lean: 0.16, headTilt: 0.12, look: 'right', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -92, y: 990 }, handR: { x: 108, y: 965 } } },
  // 28.25s: Stretched spring beanie snaps onto his head!
  { t: 28.25, p: { beanieOn: true, beanieSpringWobble: 1, lean: -0.06, hipDrop: 14, headDrop: 10, headTilt: -0.06, look: 'center', eye: 'shut', brow: 'angry', mouth: 'grit', handL: { x: -82, y: 1120 }, handR: { x: 82, y: 1120 } } },
  { t: 28.75, p: { hipDrop: 0, headDrop: 0, headTilt: 0, lean: -0.02, headTurn: 0, look: 'center', eye: 'squint', brow: 'uneven', mouth: 'frown', handL: { x: -72, y: 1205 }, handR: { x: 72, y: 1205 } } },
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
  { from: 0.25, to: 5.75, text: 'GEARS CAN LAUNCH BALLS?!' },
  { from: 6.25, to: 11.75, text: 'MORE GEARS, MORE POWER!' },
  { from: 12.25, to: 17.75, text: 'SIX GEARS ACTIVATED!' },
  { from: 18.25, to: 23.75, text: 'THE PERFECT LAUNCH!' },
  { from: 24.25, to: 29.85, text: 'THE GEARS STOLE MY HAT! 😂' },
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

export class GiantGearRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.walkPhase);

    // 1. Workshop Backdrop & Floor
    this.drawBackdrop(ctx);

    // 2. Persistent Golden Target Cup (always visible right)
    this.drawGoldenCupBack(ctx);

    // 3. Machine Props & Gears per Scene
    if (time < 6.0) {
      this.drawScene1Machine(ctx, time);
    } else if (time < 12.0) {
      this.drawScene2Machine(ctx, time);
    } else {
      this.drawMegaMachine(ctx, time);
    }

    // 4. Stickman Character (drawn behind flying beanie / foreground cup front)
    this.drawCharacter(ctx, ch, pose, time);

    // 5. Silver Metal Ball
    const ball = this.ballAt(time, ch);
    this.drawSilverBall(ctx, ball.x, ball.y, ball.rot);

    // 6. Scene 5 Stolen & Spring-Stretched Red Beanie inside/out of gears
    if (time >= 26.1 && time < 28.25) {
      this.drawStolenBeanie(ctx, time);
    }

    // 7. Cup Front Lip + Confetti & Speed Sparks
    this.drawGoldenCupFront(ctx, time);
    this.drawActionFX(ctx, time);

    // 8. Burned-In Captions + Optional Safe-Zone Guides
    this.drawCaptions(ctx, time);
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Character Position & Pose Timeline
  // -------------------------------------------------------------------------
  private charAt(t: number): CharState {
    if (t < 6.0) {
      // Scene 1: starts at 320, steps right to 580 right above the 2-gear nip!
      if (t < 1.0) return { x: 320, lift: 0, walkPhase: 0 };
      if (t < 2.2) {
        const u = easeInOut(inv(1.0, 2.2, t));
        return { x: lerp(320, 580, u), lift: Math.abs(Math.sin(u * Math.PI * 2)) * 8, walkPhase: u * 2 };
      }
      if (t >= 3.45 && t < 3.85) {
        const u = inv(3.45, 3.85, t);
        return { x: 580, lift: -Math.sin(u * Math.PI) * 10, walkPhase: 0 };
      }
      return { x: 580, lift: 0, walkPhase: 0 };
    }
    if (t < 12.0) {
      return { x: 220, lift: 0, walkPhase: 0 };
    }
    // Scenes 3–5: stands left beside the Spring Launcher & G1!
    let lift = 0;
    if (t >= 24.2 && t < 25.4) {
      const u = (t - 24.2) / 0.6;
      lift = Math.abs(Math.sin(u * Math.PI)) * 34;
    }
    return { x: 148, lift, walkPhase: 0 };
  }

  private poseAt(t: number, walkPhase: number): Pose {
    let idx = 0;
    for (let i = 0; i < POSE_KEYS.length; i++) {
      if (POSE_KEYS[i].t <= t) idx = i;
    }
    const a = POSE_KEYS[idx];
    const b = POSE_KEYS[Math.min(POSE_KEYS.length - 1, idx + 1)];
    const span = Math.max(0.001, b.t - a.t);
    const u = a === b ? 0 : easeInOut(clamp((t - a.t) / span, 0, 1));
    const snap = u > 0.45 ? b : a;

    return {
      lean: lerp(a.lean, b.lean, u),
      hipDrop: lerp(a.hipDrop, b.hipDrop, u),
      crouch: lerp(a.crouch, b.crouch, u),
      headTilt: lerp(a.headTilt, b.headTilt, u),
      headTurn: lerp(a.headTurn, b.headTurn, u),
      headDrop: lerp(a.headDrop, b.headDrop, u),
      beanieOn: snap.beanieOn,
      beanieSpringWobble: snap.beanieSpringWobble,
      look: snap.look,
      mouth: snap.mouth,
      brow: snap.brow,
      eye: snap.eye,
      stance: lerp(a.stance, b.stance, u) + Math.abs(Math.sin(walkPhase * Math.PI)) * 12,
      footLift: Math.max(0, Math.sin(walkPhase * TAU) * 18),
      handL: { x: lerp(a.handL.x, b.handL.x, u), y: lerp(a.handL.y, b.handL.y, u) },
      handR: { x: lerp(a.handR.x, b.handR.x, u), y: lerp(a.handR.y, b.handR.y, u) },
      bendL: snap.bendL,
      bendR: snap.bendR,
      pointL: snap.pointL,
      pointR: snap.pointR,
      fistL: snap.fistL,
      fistR: snap.fistR,
      gripL: snap.gripL,
      gripR: snap.gripR,
    };
  }

  // -------------------------------------------------------------------------
  // Gear Angle Timelines (Strict Opposite Interlocking Rotations!)
  // -------------------------------------------------------------------------
  private baseGearAngle(t: number): number {
    if (t < 6.0) {
      // Scene 1: spins briskly starting at 1.4s; G1 CCW (-), G2 CW (+) so center teeth pinch UP!
      if (t < 1.2) return t * 0.4;
      return -(t - 1.2) * 3.1;
    }
    if (t < 12.0) {
      // Scene 2: G1 CW (+), G2 CCW (-), G3 CW (+)
      return (t - 6.0) * 2.55;
    }
    if (t < 18.0) {
      // Scene 3: 6 gears turning forward smoothly
      return (t - 12.0) * 2.4;
    }
    if (t < 25.8) {
      // Scene 4 -> Victory: accelerates sharply after 18.45s!
      const base = (18.0 - 12.0) * 2.4;
      if (t < 18.45) return base + (t - 18.0) * 2.4;
      const dt = t - 18.45;
      return base + 0.45 * 2.4 + dt * 3.8 + Math.min(dt, 2.2) * Math.min(dt, 2.2) * 1.45;
    }
    // Scene 5 (25.8s+): ALL GEARS REVERSE DIRECTION!
    const peakFwd = (18.0 - 12.0) * 2.4 + 0.45 * 2.4 + 7.35 * 3.8 + 2.2 * 2.2 * 1.45;
    const revDt = t - 25.8;
    return peakFwd - revDt * 6.2;
  }

  // -------------------------------------------------------------------------
  // Silver Metal Ball Timeline (0–30s, zero teleportation!)
  // -------------------------------------------------------------------------
  private ballAt(t: number, ch: CharState): { x: number; y: number; rot: number } {
    // SCENE 1 (0–6s): Stickman holds ball -> drops between 2 giant gears -> shoots UP -> lands on his head!
    if (t < 6.0) {
      if (t < 1.65) {
        const pose = this.poseAt(t, ch.walkPhase);
        const hipY = 1260 - ch.lift + pose.hipDrop + pose.crouch * 45;
        return { x: ch.x + pose.handR.x + 14, y: pose.handR.y + (hipY - 1260) - 6, rot: 0 };
      }
      if (t < 2.15) {
        // Drops right into the upper meshing gap at x=580
        const u = easeIn(inv(1.65, 2.15, t));
        return { x: lerp(552, 580, u), y: lerp(960, 1140, u), rot: u * 4 };
      }
      if (t < 2.85) {
        // Pinched by gears and rocketed straight UP!
        const u = easeOut(inv(2.15, 2.85, t));
        return { x: 580, y: lerp(1140, 290, u), rot: u * 16 };
      }
      if (t < 3.45) {
        // Gravity fall straight onto top of Stickman's head (580, 865)!
        const u = easeIn(inv(2.85, 3.45, t));
        return { x: 580, y: lerp(290, 865, u), rot: 16 + u * 10 };
      }
      if (t < 4.25) {
        // Bounces off beanie onto floor beside gears
        const u = inv(3.45, 4.25, t);
        const arcY = lerp(865, FLOOR_Y - BALL_R, u * u) - Math.sin(u * Math.PI) * 190;
        return { x: lerp(580, 395, u), y: arcY, rot: 26 + u * 8 };
      }
      // Small bounce settle on floor
      const b = inv(4.25, 4.85, t);
      return {
        x: lerp(395, 365, b),
        y: FLOOR_Y - BALL_R - Math.abs(Math.sin(b * Math.PI)) * (1 - b) * 45,
        rot: 34 + b * 2,
      };
    }

    // SCENE 2 (6–12s): Dropped onto G1 -> transfers G1 -> G2 -> G3 -> launches BACKWARD!
    if (t < 12.0) {
      const g1 = S2_GEARS[0];
      const g2 = S2_GEARS[1];
      const g3 = S2_GEARS[2];
      if (t < 7.55) {
        const pose = this.poseAt(t, ch.walkPhase);
        const hipY = 1260 - ch.lift + pose.hipDrop + pose.crouch * 45;
        return { x: ch.x + pose.handR.x + 14, y: pose.handR.y + (hipY - 1260) - 6, rot: 0 };
      }
      if (t < 7.9) {
        const u = easeIn(inv(7.55, 7.9, t));
        return { x: lerp(346, g1.cx - 20, u), y: lerp(995, g1.cy - g1.r - BALL_R, u), rot: u * 3 };
      }
      if (t < 8.55) {
        // Travels along G1 clockwise top rim to G1/G2 transfer
        const u = inv(7.9, 8.55, t);
        const ang = lerp(-Math.PI * 0.58, -0.42, u);
        const r = g1.r + BALL_R + 6;
        return { x: g1.cx + Math.cos(ang) * r, y: g1.cy + Math.sin(ang) * r, rot: 3 + u * 6 };
      }
      if (t < 9.2) {
        // Transfers onto G2 CCW bottom-to-right arc up toward G3
        const u = inv(8.55, 9.2, t);
        const ang = lerp(Math.PI * 0.72, -0.55, u);
        const r = g2.r + BALL_R + 6;
        return { x: g2.cx + Math.cos(ang) * r, y: g2.cy + Math.sin(ang) * r, rot: 9 + u * 8 };
      }
      if (t < 9.8) {
        // Spins fast around G3 CW rim to top-left launch tangent!
        const u = inv(9.2, 9.8, t);
        const ang = lerp(Math.PI * 0.75, -Math.PI * 0.65, u);
        const r = g3.r + BALL_R + 5;
        return { x: g3.cx + Math.cos(ang) * r, y: g3.cy + Math.sin(ang) * r, rot: 17 + u * 12 };
      }
      if (t < 10.75) {
        // Final gear launches it BACKWARD (leftward over ducking Stickman!)
        const u = inv(9.8, 10.75, t);
        const sx = g3.cx - 25;
        const sy = g3.cy - g3.r - 12;
        return {
          x: lerp(sx, 85, u),
          y: lerp(sy, FLOOR_Y - BALL_R, u * u) - Math.sin(u * Math.PI) * 280,
          rot: 29 - u * 18,
        };
      }
      const b = inv(10.75, 11.4, t);
      return {
        x: lerp(85, 65, b),
        y: FLOOR_Y - BALL_R - Math.abs(Math.sin(b * Math.PI)) * (1 - b) * 55,
        rot: 11 - b * 3,
      };
    }

    // SCENE 3 (12–18s): Travels across 6 gears -> climbs rotating ramp -> enters spinning circular track!
    if (t < 18.0) {
      if (t < 13.35) {
        const pose = this.poseAt(t, ch.walkPhase);
        const hipY = 1260 - ch.lift + pose.hipDrop + pose.crouch * 45;
        return { x: ch.x + pose.handR.x + 12, y: pose.handR.y + (hipY - 1260) - 6, rot: 0 };
      }
      // Step cleanly along each of the 6 interlocking gears (13.35s -> 15.45s)
      if (t < 15.45) {
        const uTotal = inv(13.35, 15.45, t);
        const seg = Math.min(5, Math.floor(uTotal * 6));
        const lu = uTotal * 6 - seg;
        const g = MEGA_GEARS[seg];
        const r = g.r + BALL_R + 6;
        const a0 = seg % 2 === 0 ? -Math.PI * 0.72 : Math.PI * 0.78;
        const a1 = seg % 2 === 0 ? -0.35 : -0.52;
        const ang = lerp(a0, a1, lu);
        return {
          x: g.cx + Math.cos(ang) * r,
          y: g.cy + Math.sin(ang) * r,
          rot: uTotal * 26,
        };
      }
      // Climbs the rotating ramp from G6 up into the Spinning Circular Track (15.45s -> 16.55s)
      if (t < 16.55) {
        const u = easeInOut(inv(15.45, 16.55, t));
        return {
          x: lerp(MEGA_GEARS[5].cx - 10, SPIN_TRACK.cx + SPIN_TRACK.r - 18, u),
          y: lerp(MEGA_GEARS[5].cy - MEGA_GEARS[5].r - 18, SPIN_TRACK.cy + 12, u) - Math.sin(u * Math.PI) * 28,
          rot: 26 + u * 10,
        };
      }
      // Orbits briskly inside the Spinning Circular Track (16.55s -> 18.0s)
      const u = inv(16.55, 18.0, t);
      const ang = -u * TAU * 1.45;
      const rTrack = SPIN_TRACK.r - 22;
      return {
        x: SPIN_TRACK.cx + Math.cos(ang) * rTrack,
        y: SPIN_TRACK.cy + Math.sin(ang) * rTrack,
        rot: 36 + u * 18,
      };
    }

    // SCENE 4 (18–24s): Re-feeds onto turbo Gear 6 -> launches through Metal Ring -> Small Ramp bounce -> Golden Cup!
    if (t < 24.15) {
      if (t < 19.05) {
        // Exits circular track down guide rail onto top of Gear 6
        const u = easeInOut(inv(18.0, 19.05, t));
        const g6 = MEGA_GEARS[5];
        return {
          x: lerp(SPIN_TRACK.cx + 95, g6.cx, u),
          y: lerp(SPIN_TRACK.cy + 40, g6.cy - g6.r - BALL_R - 4, u),
          rot: 54 + u * 12,
        };
      }
      if (t < 20.05) {
        // Rockets fast around turbo-charged Gear 6 to launch tangent!
        const u = inv(19.05, 20.05, t);
        const g6 = MEGA_GEARS[5];
        const ang = lerp(-Math.PI * 0.55, -Math.PI * 0.18 + TAU, u);
        const r = g6.r + BALL_R + 6;
        return {
          x: g6.cx + Math.cos(ang) * r,
          y: g6.cy + Math.sin(ang) * r,
          rot: 66 + u * 28,
        };
      }
      if (t < 22.15) {
        // Launches cleanly through the Metal Ring (815, 655) and drops onto Small Ramp (760, 1132)!
        const u = inv(20.05, 22.15, t);
        const g6 = MEGA_GEARS[5];
        const p0 = { x: g6.cx + 42, y: g6.cy - g6.r - 12 };
        const p1 = { x: METAL_RING.cx, y: METAL_RING.cy };
        const p2 = { x: 765, y: 1126 };
        // Smooth quadratic Bezier constrained so u=0.42 hits p1 cleanly:
        const ctrl = {
          x: (p1.x - (1 - 0.42) ** 2 * p0.x - 0.42 ** 2 * p2.x) / (2 * 0.42 * 0.58),
          y: (p1.y - (1 - 0.42) ** 2 * p0.y - 0.42 ** 2 * p2.y) / (2 * 0.42 * 0.58),
        };
        const omt = 1 - u;
        return {
          x: omt * omt * p0.x + 2 * omt * u * ctrl.x + u * u * p2.x,
          y: omt * omt * p0.y + 2 * omt * u * ctrl.y + u * u * p2.y,
          rot: 94 + u * 22,
        };
      }
      // Bounces off Small Ramp (765, 1126) directly into Golden Target Cup (945, 1275)!
      const u = inv(22.15, 24.15, t);
      const sx = 765;
      const sy = 1126;
      const ex = GOLDEN_CUP.x;
      const ey = GOLDEN_CUP.y - 44;
      const x = lerp(sx, ex, u);
      const y = lerp(sy, ey, u) - Math.sin(u * Math.PI) * 240;
      return { x, y, rot: 116 + u * 18 };
    }

    // SCENE 5 (24.15–30s): Settles inside Golden Target Cup!
    const settle = inv(24.15, 24.55, t);
    return {
      x: GOLDEN_CUP.x,
      y: lerp(GOLDEN_CUP.y - 44, GOLDEN_CUP.y - 18, easeOut(settle)),
      rot: 134 + settle * 2,
    };
  }

  // -------------------------------------------------------------------------
  // Scene 5 Stolen Red Beanie (Pulled into Gears -> Stretches into Spring -> Snaps on Head!)
  // -------------------------------------------------------------------------
  private drawStolenBeanie(ctx: CanvasRenderingContext2D, t: number) {
    // 26.10 -> 26.45: Beanie sucked off Stickman's head (148, 920) into G1 (315, 1235)
    // 26.45 -> 27.55: Travels up through reversing 6 gears (G1 -> G6)
    // 27.55 -> 28.25: Emerges stretched like a giant red spring & snaps onto head (148, 976)!
    let bx = 148;
    let by = 920;
    let rot = 0;
    let stretch = 1.0;

    if (t < 26.45) {
      const u = easeIn(inv(26.1, 26.45, t));
      bx = lerp(148, MEGA_GEARS[0].cx, u);
      by = lerp(940, MEGA_GEARS[0].cy, u);
      rot = u * 2.5;
      stretch = lerp(1.0, 1.35, u);
    } else if (t < 27.55) {
      const uTotal = inv(26.45, 27.55, t);
      const seg = Math.min(5, Math.floor(uTotal * 6));
      const lu = uTotal * 6 - seg;
      const gA = MEGA_GEARS[seg];
      const gB = MEGA_GEARS[Math.min(5, seg + 1)];
      bx = lerp(gA.cx, gB.cx, lu);
      by = lerp(gA.cy, gB.cy, lu) - Math.sin(lu * Math.PI) * 28;
      rot = 2.5 + uTotal * 14;
      stretch = lerp(1.35, 2.35, uTotal);
    } else {
      const u = easeInOut(inv(27.55, 28.25, t));
      const g6 = MEGA_GEARS[5];
      bx = lerp(g6.cx - 20, 148, u);
      by = lerp(g6.cy - 40, 965, u) - Math.sin(u * Math.PI) * 210;
      rot = lerp(0.55, 0, u);
      stretch = lerp(2.5, 1.18, u);
    }

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rot);

    // Draw beanie stretched like a giant coiled spring when emerging/snapping!
    if (stretch > 1.4) {
      const coils = 5;
      const halfW = 54;
      const totalH = 72 * stretch;
      // Red knitted coil loops
      ctx.strokeStyle = INK;
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i <= coils * 2; i++) {
        const px = (i % 2 === 0 ? -1 : 1) * halfW * (1 - (i / (coils * 2)) * 0.25);
        const py = totalH * 0.45 - (i / (coils * 2)) * totalH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.strokeStyle = BEANIE;
      ctx.lineWidth = 10;
      ctx.stroke();

      // Cuff rim at base
      ctx.fillStyle = BEANIE_DEEP;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.roundRect(-halfW - 6, totalH * 0.42, (halfW + 6) * 2, 18, 6);
      ctx.fill();
      ctx.stroke();

      // Pom-pom at spring tip
      ctx.fillStyle = BEANIE_POM;
      ctx.beginPath();
      ctx.arc(halfW * 0.75, -totalH * 0.56, 15, 0, TAU);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.scale(1 / Math.sqrt(stretch), stretch);
      this.drawBeanieShape(ctx, 0);
    }
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Workshop Backdrop
  // -------------------------------------------------------------------------
  private drawBackdrop(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = WALL_BG;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = WALL_BAND;
    ctx.fillRect(0, FLOOR_Y - 120, WIDTH, 120);

    // Subtle workshop blueprint wall panels
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    for (let x = 140; x < WIDTH; x += 220) {
      ctx.beginPath();
      ctx.moveTo(x, 120);
      ctx.lineTo(x, FLOOR_Y - 120);
      ctx.stroke();
    }
    for (let y = 240; y < FLOOR_Y - 120; y += 260) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
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
    ctx.lineWidth = 3;
    for (let i = -2; i <= 7; i++) {
      const topX = i * 180;
      ctx.beginPath();
      ctx.moveTo(topX, FLOOR_Y + 3);
      ctx.lineTo(topX - 80, HEIGHT);
      ctx.stroke();
    }
  }

  // -------------------------------------------------------------------------
  // Scene 1 Machine: 2 Giant Interlocking Gears
  // -------------------------------------------------------------------------
  private drawScene1Machine(ctx: CanvasRenderingContext2D, t: number) {
    // Support A-frame behind both gears
    for (const g of S1_GEARS) {
      this.drawStandPillar(ctx, g.cx, g.cy);
    }
    const baseAng = this.baseGearAngle(t);
    for (const g of S1_GEARS) {
      // Opposite directions! G1 CCW (-), G2 CW (+) so center teeth push UP!
      const rot = g.phase + -g.dir * baseAng * g.ratio;
      this.drawSilverGear(ctx, g, rot, false);
    }
  }

  // -------------------------------------------------------------------------
  // Scene 2 Machine: 3 Interlocking Gears of Different Sizes
  // -------------------------------------------------------------------------
  private drawScene2Machine(ctx: CanvasRenderingContext2D, t: number) {
    // Steel cross-rail holding the 3 gears
    ctx.strokeStyle = INK;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(S2_GEARS[0].cx, S2_GEARS[0].cy);
    ctx.lineTo(S2_GEARS[2].cx, S2_GEARS[2].cy);
    ctx.stroke();
    ctx.strokeStyle = FRAME_MID;
    ctx.lineWidth = 10;
    ctx.stroke();

    for (const g of S2_GEARS) {
      this.drawStandPillar(ctx, g.cx, g.cy);
    }
    const baseAng = this.baseGearAngle(t);
    for (const g of S2_GEARS) {
      const rot = g.phase + g.dir * baseAng * g.ratio;
      this.drawSilverGear(ctx, g, rot, false);
    }
  }

  // -------------------------------------------------------------------------
  // Scenes 3–5 Machine: 6 Interlocking Gears + Rotating Ramp + Circular Track + Ring + Small Ramp
  // -------------------------------------------------------------------------
  private drawMegaMachine(ctx: CanvasRenderingContext2D, t: number) {
    // 1. Structural Gear Truss Frame
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < MEGA_GEARS.length; i++) {
      const g = MEGA_GEARS[i];
      if (i === 0) ctx.moveTo(g.cx, g.cy);
      else ctx.lineTo(g.cx, g.cy);
    }
    ctx.stroke();
    ctx.strokeStyle = FRAME_MID;
    ctx.lineWidth = 9;
    ctx.stroke();

    this.drawStandPillar(ctx, MEGA_GEARS[0].cx, MEGA_GEARS[0].cy);
    this.drawStandPillar(ctx, MEGA_GEARS[3].cx, MEGA_GEARS[3].cy);
    this.drawStandPillar(ctx, MEGA_GEARS[4].cx, MEGA_GEARS[4].cy);

    // 2. Spring Launcher on Left (beside G1)
    this.drawSpringLauncher(ctx, t);

    // 3. Rotating Ramp connecting G6 -> Spinning Circular Track
    this.drawRotatingRamp(ctx, t);

    // 4. Spinning Circular Track (top center)
    this.drawSpinningTrack(ctx, t);

    // 5. Metal Ring (Scene 4 target gate, always mounted neatly for continuity)
    this.drawMetalRing(ctx, t);

    // 6. Small Bounce Ramp (before Golden Target Cup)
    this.drawSmallRamp(ctx, t);

    // 7. All 6 Interlocking Silver Gears!
    const baseAng = this.baseGearAngle(t);
    const isTurbo = t >= 18.45 && t < 24.15;
    const isRev = t >= 25.8;
    for (let i = 0; i < MEGA_GEARS.length; i++) {
      const g = MEGA_GEARS[i];
      const rot = g.phase + g.dir * baseAng * g.ratio;
      this.drawSilverGear(ctx, g, rot, isTurbo && i === 5);
    }

    // Reverse warning arrows in Scene 5 (25.8s+)
    if (isRev) {
      const pulse = 0.65 + 0.35 * Math.sin((t - 25.8) * 14);
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.font = '900 32px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 8;
      ctx.strokeText('<<< REVERSE <<<', 485, 895);
      ctx.fillStyle = SPRING_RED;
      ctx.fillText('<<< REVERSE <<<', 485, 895);
      ctx.restore();
    }
  }

  private drawStandPillar(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = FRAME_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.rect(x - 10, y, 20, FLOOR_Y - y);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = FRAME_MID;
    ctx.beginPath();
    ctx.roundRect(x - 36, FLOOR_Y - 18, 72, 18, 6);
    ctx.fill();
    ctx.stroke();
  }

  private drawSilverGear(
    ctx: CanvasRenderingContext2D,
    g: GearSpec,
    angle: number,
    turboGlow: boolean
  ) {
    const outerR = g.r + 11;
    const rootR = g.r - 9;

    ctx.save();
    ctx.translate(g.cx, g.cy);
    ctx.rotate(angle);

    if (turboGlow) {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.28)';
      ctx.beginPath();
      ctx.arc(0, 0, outerR + 18, 0, TAU);
      ctx.fill();
    }

    // Gear Tooth Polygon
    ctx.beginPath();
    for (let i = 0; i < g.teeth; i++) {
      const a0 = (i / g.teeth) * TAU;
      const step = TAU / g.teeth;
      const t1 = a0 - step * 0.22;
      const t2 = a0 - step * 0.14;
      const t3 = a0 + step * 0.14;
      const t4 = a0 + step * 0.22;
      const r0 = a0 - step * 0.5;
      if (i === 0) {
        ctx.moveTo(Math.cos(r0) * rootR, Math.sin(r0) * rootR);
      } else {
        ctx.lineTo(Math.cos(r0) * rootR, Math.sin(r0) * rootR);
      }
      ctx.lineTo(Math.cos(t1) * rootR, Math.sin(t1) * rootR);
      ctx.lineTo(Math.cos(t2) * outerR, Math.sin(t2) * outerR);
      ctx.lineTo(Math.cos(t3) * outerR, Math.sin(t3) * outerR);
      ctx.lineTo(Math.cos(t4) * rootR, Math.sin(t4) * rootR);
    }
    ctx.closePath();

    ctx.fillStyle = GEAR_BODY;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Inner recessed metallic face ring
    ctx.fillStyle = GEAR_SHADE;
    ctx.beginPath();
    ctx.arc(0, 0, rootR * 0.8, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Bright flat specular arc
    ctx.strokeStyle = GEAR_LIGHT;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, rootR * 0.68, -Math.PI * 0.85, -Math.PI * 0.25);
    ctx.stroke();

    // Spoke cutout holes (makes rotation clearly visible at 24fps!)
    const holeCount = g.teeth >= 12 ? 4 : 3;
    const holeDist = rootR * 0.5;
    const holeR = rootR * 0.17;
    ctx.fillStyle = WALL_BG;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    for (let h = 0; h < holeCount; h++) {
      const ha = (h / holeCount) * TAU;
      ctx.beginPath();
      ctx.arc(Math.cos(ha) * holeDist, Math.sin(ha) * holeDist, holeR, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Center axle hub & bolt
    ctx.fillStyle = GEAR_HUB;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(13, rootR * 0.24), 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = GEAR_LIGHT;
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawSpringLauncher(ctx: CanvasRenderingContext2D, t: number) {
    const x = SPRING_LAUNCHER.x;
    const y = FLOOR_Y;
    // Compresses before 18.45s, snaps up at 18.45s!
    let comp = 0;
    if (t >= 18.0 && t < 18.45) comp = inv(18.0, 18.45, t) * 34;
    else if (t >= 18.45 && t < 18.85) comp = (1 - easeOut(inv(18.45, 18.85, t))) * 34;

    const topY = y - 160 + comp;
    ctx.save();
    // Base housing
    ctx.fillStyle = FRAME_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(x - 36, y - 34, 72, 34, 8);
    ctx.fill();
    ctx.stroke();

    // Red coiled spring
    ctx.strokeStyle = INK;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const px = x + (i % 2 === 0 ? -18 : 18);
      const py = lerp(y - 34, topY + 14, i / 6);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = SPRING_RED;
    ctx.lineWidth = 6.5;
    ctx.stroke();

    // Launcher plate
    ctx.fillStyle = GOLD_MID;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(x - 34, topY, 68, 18, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawRotatingRamp(ctx: CanvasRenderingContext2D, t: number) {
    // Rotating ramp pivots cleanly between G6 & Circular Track
    const px = 640;
    const py = 720;
    const tilt =
      t >= 15.4 && t < 16.6
        ? Math.sin(inv(15.4, 16.6, t) * Math.PI) * 0.22 - 0.55
        : -0.52 + Math.sin(t * 2.2) * 0.08;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(tilt);
    ctx.fillStyle = RAMP_BLUE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(-125, -14, 250, 24, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = RAMP_DEEP;
    ctx.fillRect(-115, 2, 230, 6);

    ctx.fillStyle = GEAR_HUB;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawSpinningTrack(ctx: CanvasRenderingContext2D, t: number) {
    const { cx, cy, r } = SPIN_TRACK;
    const spin = t * 2.1;

    ctx.save();
    ctx.translate(cx, cy);

    // Outer silver track ring
    ctx.strokeStyle = INK;
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = GEAR_BODY;
    ctx.lineWidth = 18;
    ctx.stroke();

    // Rotating spokes & inner rail markers
    ctx.rotate(spin);
    ctx.strokeStyle = GEAR_SHADE;
    ctx.lineWidth = 8;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18);
      ctx.lineTo(Math.cos(a) * (r - 12), Math.sin(a) * (r - 12));
      ctx.stroke();
    }

    ctx.fillStyle = RAMP_BLUE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawMetalRing(ctx: CanvasRenderingContext2D, t: number) {
    const { cx, cy, rx, ry } = METAL_RING;
    const flash = t >= 20.75 && t <= 21.35;

    ctx.save();
    // Support bracket arm
    ctx.strokeStyle = INK;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(cx, cy + ry);
    ctx.lineTo(cx, cy + ry + 65);
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
    ctx.stroke();

    ctx.strokeStyle = flash ? GOLD_BRIGHT : RING_ORANGE;
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.restore();
  }

  private drawSmallRamp(ctx: CanvasRenderingContext2D, t: number) {
    const bounce = t >= 22.1 && t < 22.45 ? Math.sin(inv(22.1, 22.45, t) * Math.PI) * 8 : 0;

    ctx.save();
    // Ramp leg supports
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(SMALL_RAMP.x0 + 20, SMALL_RAMP.y0 + 10);
    ctx.lineTo(SMALL_RAMP.x0 + 20, FLOOR_Y);
    ctx.moveTo(SMALL_RAMP.x1 - 15, SMALL_RAMP.y1 + 10);
    ctx.lineTo(SMALL_RAMP.x1 - 15, FLOOR_Y);
    ctx.stroke();

    ctx.translate(0, bounce);
    ctx.fillStyle = RAMP_BLUE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(SMALL_RAMP.x0, SMALL_RAMP.y0);
    ctx.lineTo(SMALL_RAMP.x1, SMALL_RAMP.y1);
    ctx.lineTo(SMALL_RAMP.x1 - 8, SMALL_RAMP.y1 + 22);
    ctx.lineTo(SMALL_RAMP.x0 - 8, SMALL_RAMP.y0 + 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Persistent Golden Target Cup + Confetti / Sparks FX
  // -------------------------------------------------------------------------
  private drawGoldenCupBack(ctx: CanvasRenderingContext2D) {
    const { x, y } = GOLDEN_CUP;
    ctx.save();
    // Pedestal
    ctx.fillStyle = FRAME_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(x - 42, y + 6, 84, FLOOR_Y - (y + 6), 8);
    ctx.fill();
    ctx.stroke();

    // Cup inside cavity
    ctx.fillStyle = GOLD_DEEP;
    ctx.beginPath();
    ctx.ellipse(x, y - 72, 42, 12, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawGoldenCupFront(ctx: CanvasRenderingContext2D, t: number) {
    const { x, y } = GOLDEN_CUP;
    ctx.save();
    ctx.fillStyle = GOLD_MID;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 42, y - 72);
    ctx.arc(x, y - 72, 42, Math.PI, 0, true);
    ctx.lineTo(x + 28, y + 4);
    ctx.lineTo(x - 28, y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = GOLD_BRIGHT;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 24, y - 58);
    ctx.lineTo(x - 16, y - 8);
    ctx.stroke();

    // Confetti burst when scored at 24.15s
    if (t >= 24.15 && t <= 26.0) {
      const u = inv(24.15, 25.85, t);
      const colors = ['#facc15', '#3b82f6', '#22c55e', '#f97316', '#ef4444'];
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * TAU;
        const dist = 36 + u * (115 + (i % 3) * 28);
        const px = x + Math.cos(ang) * dist;
        const py = y - 72 + Math.sin(ang) * dist * 0.72 + u * u * 130;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(u * 5 + i);
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.fillRect(-6, -4, 12, 8);
        ctx.strokeRect(-6, -4, 12, 8);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  private drawActionFX(ctx: CanvasRenderingContext2D, t: number) {
    // Turbo launch streak when Gear 6 fires at 20.05s
    if (t >= 20.0 && t <= 20.9) {
      const g6 = MEGA_GEARS[5];
      const u = inv(20.0, 20.9, t);
      ctx.save();
      ctx.strokeStyle = TURBO_CYAN;
      ctx.globalAlpha = 1 - u;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(g6.cx + 10, g6.cy - g6.r + i * 16);
        ctx.lineTo(g6.cx + 90 + u * 50, g6.cy - g6.r - 35 + i * 16);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------------
  // Silver Metal Ball
  // -------------------------------------------------------------------------
  private drawSilverBall(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.fillStyle = BALL_MID;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Metallic crescent highlight & shadow
    ctx.fillStyle = BALL_SHADE;
    ctx.beginPath();
    ctx.arc(3, 4, BALL_R - 5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.fill();

    ctx.fillStyle = BALL_BRIGHT;
    ctx.beginPath();
    ctx.arc(-6, -6, 6.5, 0, TAU);
    ctx.fill();
    ctx.restore();
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
    this.drawHead(ctx, headCx, headCy, pose, t);

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

  private drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, pose: Pose, t: number) {
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

    if (pose.beanieOn) {
      const springBounce =
        pose.beanieSpringWobble > 0.5 && t >= 28.25
          ? Math.sin((t - 28.25) * 20) * Math.exp(-(t - 28.25) * 1.9) * 0.42
          : 0;
      this.drawBeanieShape(ctx, springBounce);
    }

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

  private drawBeanieShape(ctx: CanvasRenderingContext2D, springBounce: number) {
    const r = HEAD_R;
    ctx.save();
    if (springBounce !== 0) {
      ctx.translate(0, -24);
      ctx.scale(1 - springBounce * 0.25, 1 + springBounce * 0.55);
      ctx.translate(0, 24);
    }
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
    ctx.restore();
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
