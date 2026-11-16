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

// --- Stage & Machine Palette (Modern Pop 2D Flat Vector) --------------------
const WALL_BG = '#fdf8f3';
const WALL_BAND = '#f1ede8';
const FLOOR_MAIN = '#fde68a';
const FLOOR_PLANK = '#f59e0b';

const MACHINE_FRAME = '#334155';
const MACHINE_STEEL = '#94a3b8';
const RAMP_TEAL = '#0ea5e9';
const RAMP_DARK = '#0369a1';
const TUNNEL_GLASS = 'rgba(186, 230, 253, 0.42)';
const LOOP_PURPLE = '#a855f7';
const SPRING_GOLD = '#facc15';
const SEESAW_AMBER = '#f59e0b';
const DOMINO_IVORY = '#fffbeb';
const DOMINO_DOT = '#1e293b';

const BALL_PALETTE = [
  '#f97316', // orange
  '#3b82f6', // blue
  '#22c55e', // green
  '#ec4899', // pink
  '#eab308', // yellow
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#ef4444', // red
];

const FLOOR_Y = 1500;
const HEAD_R = 70;
const STICKMAN_X = 175;
const WALL_RIGHT_X = 995;
const BUTTON_X = 960;
const BUTTON_Y = 565;
const HOOP_RIM_X = 720;

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
  // Scene 1 (0–6s): Places 1 orange ball at Ramp 1, flicks it, grins confidently
  {
    t: 0.0,
    p: {
      lean: 0.08,
      look: 'right',
      mouth: 'smirk',
      brow: 'cocky',
      eye: 'open',
      handL: { x: -68, y: 1242 },
      handR: { x: 78, y: 1180 },
      gripR: true,
    },
  },
  {
    t: 0.75,
    p: {
      lean: 0.14,
      look: 'right',
      mouth: 'flat',
      brow: 'determined',
      handL: { x: -68, y: 1242 },
      handR: { x: 96, y: 1110 },
      gripR: true,
    },
  },
  {
    t: 1.25,
    p: {
      lean: 0.18,
      look: 'right',
      mouth: 'grin',
      brow: 'cocky',
      gripR: false,
      pointR: true,
      handR: { x: 118, y: 1095 },
    },
  },
  {
    t: 2.3,
    p: {
      lean: 0.02,
      pointR: false,
      look: 'right',
      mouth: 'bigsmile',
      brow: 'cocky',
      eye: 'happy',
      handL: { x: -82, y: 1235 },
      handR: { x: 82, y: 1235 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 2 (6–12s): Seesaw launches blue ball into 10-ball ramp -> watches intrigued
  {
    t: 6.35,
    p: {
      lean: 0.08,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handL: { x: -75, y: 1210 },
      handR: { x: 92, y: 1180 },
    },
  },
  {
    t: 8.2,
    p: {
      lean: 0.04,
      look: 'right',
      mouth: 'grin',
      brow: 'raised',
      eye: 'open',
      handL: { x: -72, y: 1230 },
      handR: { x: 105, y: 1165 },
      pointR: true,
    },
  },

  // Scene 3 (12–18s): 100 balls activated -> watches with huge excitement!
  {
    t: 12.15,
    p: {
      lean: -0.06,
      pointR: false,
      look: 'up',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -102, y: 1110 },
      handR: { x: 102, y: 1110 },
      bendL: -1,
      bendR: -1,
      fistL: true,
      fistR: true,
    },
  },
  {
    t: 15.0,
    p: {
      lean: 0.04,
      look: 'right',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -112, y: 1085 },
      handR: { x: 112, y: 1085 },
    },
  },

  // Scene 4 (18–24s): Final shot flies toward red button -> holds breath!
  {
    t: 19.6,
    p: {
      lean: 0.1,
      crouch: 0.18,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      fistL: false,
      fistR: false,
      bendL: 1,
      bendR: 1,
      handL: { x: -75, y: 1185 },
      handR: { x: 85, y: 1185 },
    },
  },
  {
    t: 22.0,
    p: {
      lean: 0.14,
      crouch: 0.28,
      look: 'right',
      mouth: 'flat',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -42, y: 1185 },
      handR: { x: 48, y: 1185 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 5 (24–30s): Button hit -> hoop swish -> celebrates -> buried under 100 balls!
  {
    t: 25.6,
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
    t: 27.05,
    p: {
      lean: -0.14,
      stance: 14,
      look: 'right',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handL: { x: -102, y: 1110 },
      handR: { x: 102, y: 1110 },
    },
  },
  {
    t: 27.95,
    p: {
      lean: 0,
      crouch: 0.3,
      look: 'front',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      beanieOn: false,
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
  { from: 0.25, to: 5.75, text: 'JUST ONE BALL...' },
  { from: 6.25, to: 11.75, text: "IT'S STARTING!" },
  { from: 12.25, to: 17.75, text: '100 BALLS ACTIVATED!' },
  { from: 18.25, to: 23.75, text: 'THE FINAL SHOT!' },
  { from: 24.25, to: 29.85, text: '100 BALLS... 1 VICTIM! 😂' },
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

interface BallPos {
  x: number;
  y: number;
  color: string;
  r: number;
  layer: 'back' | 'front' | 'pile';
}

// Precomputed 100-ball resting grid positions in the burial pile at the end (centered around STICKMAN_X=175)
const BURY_PILE: { x: number; y: number; color: string }[] = (() => {
  const arr: { x: number; y: number; color: string }[] = [];
  // Triangular mound rows from bottom (y=1486) up to peak (y=1210)
  const rows = [
    { y: 1486, count: 16, span: 350 },
    { y: 1460, count: 15, span: 325 },
    { y: 1434, count: 14, span: 300 },
    { y: 1408, count: 13, span: 275 },
    { y: 1382, count: 11, span: 235 },
    { y: 1356, count: 10, span: 210 },
    { y: 1330, count: 8, span: 170 },
    { y: 1304, count: 6, span: 130 },
    { y: 1278, count: 4, span: 85 },
    { y: 1252, count: 2, span: 42 },
  ]; // Sum = 99 balls! (Ball 99 is the hero basketball-hoop ball)
  let idx = 0;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.count; c++) {
      const u = row.count === 1 ? 0.5 : c / (row.count - 1);
      const jitterX = Math.sin(idx * 2.3) * 5;
      const jitterY = Math.cos(idx * 1.9) * 3;
      arr.push({
        x: STICKMAN_X - row.span / 2 + u * row.span + jitterX,
        y: row.y + jitterY,
        color: BALL_PALETTE[idx % BALL_PALETTE.length],
      });
      idx++;
    }
  }
  return arr;
})();

export class HundredBallChainRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const ch = this.charAt(time);
    const pose = this.poseAt(time);

    // 1. Pop 2D Studio Background
    this.drawBackground(ctx, time);

    // 2. Giant Basketball Hoop (stowed near ceiling until red button hit at 24.35s, then drops!)
    this.drawCeilingHoopBack(ctx, time);

    // 3. Rube Goldberg Machine Structure (ramps, glass hopper, loop track, springs, funnel, chamber)
    this.drawMachineStructure(ctx, time);

    // 4. Domino Rows A, B, C & Seesaw
    this.drawDominoRows(ctx, time);
    this.drawSeesaw(ctx, time);

    // 5. Giant Red Target Button on Right Wall
    this.drawRedTargetButton(ctx, time);

    // 6. Compute all 100 balls continuously & draw back/machine balls
    const balls = this.computeAllBalls(time, ch, pose);
    for (const b of balls) {
      if (b.layer === 'back') this.drawColorBall(ctx, b.x, b.y, b.r, b.color);
    }

    // 7. Translucent glass tunnel & hopper front glass overlay
    this.drawGlassOverlays(ctx, time);

    // 8. Stickman (hidden beneath pile once completely buried at 28.05s)
    if (time < 28.05) {
      this.drawCharacter(ctx, ch, pose);
    }

    // 9. Front layer balls & Hero Ball #99 + Basketball Hoop Front Rim/Net
    for (const b of balls) {
      if (b.layer === 'front') this.drawColorBall(ctx, b.x, b.y, b.r, b.color);
    }
    this.drawCeilingHoopFront(ctx, time);

    // 10. Burial Mound Balls + ONLY Red Beanie Visible on Top!
    for (const b of balls) {
      if (b.layer === 'pile') this.drawColorBall(ctx, b.x, b.y, b.r, b.color);
    }
    this.drawBuriedBeanieTop(ctx, time);

    // 11. FX (spring flashes, button burst, confetti, safe zones, captions)
    this.drawVisualFX(ctx, time);
    this.drawCaptions(ctx, time);
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Character & Pose Timelines
  // -------------------------------------------------------------------------
  private charAt(t: number): CharState {
    let lift = 0;
    if (t >= 25.65 && t < 26.9) {
      const j = ((t - 25.65) * 2.4) % 1;
      lift = Math.sin(j * Math.PI) * 52;
    }
    return { x: STICKMAN_X, ground: FLOOR_Y, lift, walkPhase: 0 };
  }

  private poseAt(t: number): Pose {
    let i = 0;
    while (i + 1 < POSE_KEYS.length && POSE_KEYS[i + 1].t <= t) i++;
    const a = POSE_KEYS[i];
    const b = POSE_KEYS[Math.min(i + 1, POSE_KEYS.length - 1)];

    if (a === b || b.t <= a.t) {
      return { ...a, handL: { ...a.handL }, handR: { ...a.handR } };
    }
    const u = clamp((t - a.t) / (b.t - a.t), 0, 1);
    const s = smooth(u);
    const mid = u >= 0.5 ? b : a;
    return {
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

  // -------------------------------------------------------------------------
  // Exact 100-Ball Physics & Continuity Timeline
  // -------------------------------------------------------------------------
  private computeAllBalls(t: number, ch: CharState, pose: Pose): BallPos[] {
    const balls: BallPos[] = [];

    // --- Ball 0: The First Tiny Orange Ball (Scene 1) ---
    {
      let bx: number;
      let by: number;
      let layer: BallPos['layer'] = 'front';
      if (t < 0.75) {
        bx = ch.x + pose.handR.x;
        by = pose.handR.y;
      } else if (t < 1.25) {
        const u = smooth(inv(0.75, 1.25, t));
        bx = lerp(ch.x + pose.handR.x, 275, u);
        by = lerp(pose.handR.y, 1110, u);
      } else if (t < 2.95) {
        // Rolls smoothly down Ramp 1: (275, 1110) -> (540, 1236)
        const u = inv(1.25, 2.95, t);
        bx = lerp(275, 540, u);
        by = lerp(1110, 1236, u);
      } else if (t < 3.6) {
        // Drops neatly into bottom holding chamber via connector chute
        const u = inv(2.95, 3.6, t);
        bx = lerp(540, 620, u);
        by = lerp(1236, 1482, u * u);
        layer = 'back';
      } else if (t < 26.95) {
        bx = 620;
        by = 1482;
        layer = 'back';
      } else if (t < 28.1) {
        const u = inv(26.95, 28.1, t);
        bx = lerp(620, BURY_PILE[0].x, u);
        by = lerp(1482, BURY_PILE[0].y, u) - Math.sin(u * Math.PI) * 145;
        layer = 'pile';
      } else {
        bx = BURY_PILE[0].x;
        by = BURY_PILE[0].y;
        layer = 'pile';
      }
      balls.push({ x: bx, y: by, r: 16, color: BALL_PALETTE[0], layer });
    }

    // --- Ball 1: Blue Seesaw Ball (Scene 2) ---
    {
      let bx: number;
      let by: number;
      let layer: BallPos['layer'] = 'front';
      if (t < 6.55) {
        const tilt = this.getSeesawTilt(t);
        bx = 795 + Math.cos(tilt) * 68;
        by = 1365 + Math.sin(tilt) * 68 - 16;
      } else if (t < 7.6) {
        // Seesaw launches blue ball upward into the 10-ball rack gate at (905, 845)
        const u = inv(6.55, 7.6, t);
        bx = lerp(865, 905, u);
        by = lerp(1350, 845, u) - Math.sin(u * Math.PI) * 185;
      } else if (t < 9.2) {
        // Drops onto Ramp 2A behind the 10 balls
        const u = inv(7.6, 9.2, t);
        bx = lerp(905, 435, u);
        by = lerp(845, 965, u);
      } else if (t < 11.4) {
        const u = inv(9.2, 11.4, t);
        bx = lerp(435, 765, u);
        by = lerp(985, 1102, u);
      } else if (t < 12.6) {
        const u = inv(11.4, 12.6, t);
        bx = lerp(765, 860, u);
        by = lerp(1102, 1482, u * u);
        layer = 'back';
      } else if (t < 26.95) {
        bx = 860;
        by = 1482;
        layer = 'back';
      } else if (t < 28.15) {
        const u = inv(26.95, 28.15, t);
        bx = lerp(860, BURY_PILE[1].x, u);
        by = lerp(1482, BURY_PILE[1].y, u) - Math.sin(u * Math.PI) * 155;
        layer = 'pile';
      } else {
        bx = BURY_PILE[1].x;
        by = BURY_PILE[1].y;
        layer = 'pile';
      }
      balls.push({ x: bx, y: by, r: 15, color: BALL_PALETTE[1], layer });
    }

    // --- Balls 2..11: Ten Colorful Balls (Scene 2 Ramp 2A/2B -> Domino Row B -> Chamber -> Pile) ---
    for (let k = 0; k < 10; k++) {
      const idx = 2 + k;
      const color = BALL_PALETTE[idx % BALL_PALETTE.length];
      const slotX = 875 - k * 24;
      const slotY = 852 - (875 - slotX) * 0.25;
      const startT = 7.6 + k * 0.14;
      const chamberX = 635 + ((idx * 29) % 260);
      const chamberY = 1482 - Math.floor(idx / 8) * 24;

      let bx: number;
      let by: number;
      let layer: BallPos['layer'] = 'back';

      if (t < startT) {
        bx = slotX;
        by = slotY;
      } else if (t < startT + 1.45) {
        // Ramp 2A: (slotX, slotY) -> (425, 965)
        const u = inv(startT, startT + 1.45, t);
        bx = lerp(slotX, 425, u);
        by = lerp(slotY, 965, u);
      } else if (t < startT + 2.65) {
        // Ramp 2B: (425, 985) -> (775, 1102)
        const u = inv(startT + 1.45, startT + 2.65, t);
        bx = lerp(425, 775, u);
        by = lerp(985, 1102, u);
      } else if (t < startT + 3.6) {
        // Drops down side drop tube into holding chamber
        const u = inv(startT + 2.65, startT + 3.6, t);
        bx = lerp(775, chamberX, u);
        by = lerp(1102, chamberY, u * u);
      } else if (t < 26.95 + k * 0.03) {
        bx = chamberX;
        by = chamberY;
      } else if (t < 28.05 + k * 0.03) {
        const u = inv(26.95 + k * 0.03, 28.05 + k * 0.03, t);
        bx = lerp(chamberX, BURY_PILE[idx].x, u);
        by = lerp(chamberY, BURY_PILE[idx].y, u) - Math.sin(u * Math.PI) * 185;
        layer = 'pile';
      } else {
        bx = BURY_PILE[idx].x;
        by = BURY_PILE[idx].y;
        layer = 'pile';
      }
      balls.push({ x: bx, y: by, r: 14, color, layer });
    }

    // --- Balls 12..98: 87 Colorful Balls inside 100-Ball Overhead Hopper -> Chaos Course -> Chamber -> Pile ---
    for (let k = 0; k < 87; k++) {
      const idx = 12 + k;
      const color = BALL_PALETTE[idx % BALL_PALETTE.length];
      // Resting stacked grid inside overhead glass hopper (x=305..525, y=260..420)
      const col = k % 9;
      const row = Math.floor(k / 9);
      const restX = 315 + col * 24 + (row % 2) * 10;
      const restY = 412 - row * 19;

      const releaseT = 12.02 + k * 0.052;
      const chamberX = 610 + ((idx * 31) % 295);
      const chamberY = 1482 - Math.floor(idx / 11) * 21;

      let bx: number;
      let by: number;
      let layer: BallPos['layer'] = 'back';

      if (t < releaseT) {
        // Settle slightly downward as balls below exit
        const dropProgress = clamp((t - 12.0) / 4.5, 0, 1);
        bx = restX;
        by = lerp(restY, 412, dropProgress * 0.45);
      } else {
        const dt = t - releaseT;
        if (dt < 0.85) {
          // S-curve translucent tunnel: (440, 445) -> (765, 535)
          const u = dt / 0.85;
          bx = lerp(440, 765, u);
          by = lerp(445, 535, smooth(u)) + Math.sin(u * Math.PI) * 28;
        } else if (dt < 1.35) {
          // Bounce off Spring Bumper 1 (795, 610) into loop entry
          const u = (dt - 0.85) / 0.5;
          bx = lerp(765, 690, u);
          by = lerp(535, 655, u) - Math.sin(u * Math.PI) * 55;
        } else if (dt < 2.35) {
          // Circular 360° loop-de-loop track centered at (605, 655), r=95
          const u = (dt - 1.35) / 1.0;
          const a = -u * TAU;
          bx = 605 + Math.cos(a) * 92;
          by = 655 + Math.sin(a) * 92;
        } else if (dt < 2.95) {
          // Bounce off Spring Bumper 2 (410, 765) across Domino Row C
          const u = (dt - 2.35) / 0.6;
          bx = lerp(605, 360, u);
          by = lerp(747, 920, u) - Math.sin(u * Math.PI) * 85;
        } else if (dt < 4.1) {
          // Giant funnel ramp: (360, 965) -> (885, 1280) -> drop into chamber
          const u = (dt - 2.95) / 1.15;
          if (u < 0.72) {
            const ru = u / 0.72;
            bx = lerp(360, 865, ru);
            by = lerp(965, 1280, ru);
          } else {
            const cu = (u - 0.72) / 0.28;
            bx = lerp(865, chamberX, cu);
            by = lerp(1280, chamberY, cu * cu);
          }
        } else {
          const spillStart = 26.95 + (k % 18) * 0.028;
          if (t < spillStart) {
            bx = chamberX;
            by = chamberY;
          } else if (t < spillStart + 0.98) {
            const u = inv(spillStart, spillStart + 0.98, t);
            bx = lerp(chamberX, BURY_PILE[idx].x, u);
            by = lerp(chamberY, BURY_PILE[idx].y, u) - Math.sin(u * Math.PI) * (150 + (k % 4) * 32);
            layer = 'pile';
          } else {
            bx = BURY_PILE[idx].x;
            by = BURY_PILE[idx].y;
            layer = 'pile';
          }
        }
      }

      balls.push({ x: bx, y: by, r: 14, color, layer });
    }

    // --- Ball 99: Hero #100 Final Shot Ball (Bright Red-Orange Star Ball, r=18) ---
    {
      const releaseT = 16.55;
      let bx: number;
      let by: number;
      let layer: BallPos['layer'] = 'front';

      if (t < releaseT) {
        bx = 420;
        by = 250 + clamp((t - 12.0) / 4.5, 0, 1) * 162;
        layer = 'back';
      } else if (t < 17.4) {
        const u = inv(16.55, 17.4, t);
        bx = lerp(440, 765, u);
        by = lerp(445, 535, smooth(u)) + Math.sin(u * Math.PI) * 28;
        layer = 'back';
      } else if (t < 17.9) {
        const u = inv(17.4, 17.9, t);
        bx = lerp(765, 690, u);
        by = lerp(535, 655, u) - Math.sin(u * Math.PI) * 55;
        layer = 'back';
      } else if (t < 18.8) {
        const u = inv(17.9, 18.8, t);
        const a = -u * TAU;
        bx = 605 + Math.cos(a) * 92;
        by = 655 + Math.sin(a) * 92;
        layer = 'back';
      } else if (t < 19.45) {
        const u = inv(18.8, 19.45, t);
        bx = lerp(605, 360, u);
        by = lerp(747, 920, u) - Math.sin(u * Math.PI) * 85;
        layer = 'back';
      } else if (t < 20.65) {
        // Rides down the Giant Funnel Ramp straight onto the upward launch kicker!
        const u = inv(19.45, 20.65, t);
        bx = lerp(360, 915, u);
        by = lerp(965, 1270, u);
      } else if (t < 21.85) {
        // Kicker launches Hero Ball upward to left upper bounce wall (310, 495)!
        const u = inv(20.65, 21.85, t);
        bx = lerp(915, 310, u);
        by = lerp(1270, 495, u) - Math.sin(u * Math.PI) * 145;
      } else if (t < 24.35) {
        // Bounces off wall (310, 495) and flies straight toward Giant Red Target Button (946, 565)!
        const u = inv(21.85, 24.35, t);
        bx = lerp(310, BUTTON_X - 18, smooth(u));
        by = lerp(495, BUTTON_Y, u) - Math.sin(u * Math.PI) * 135;
      } else if (t < 25.45) {
        // Rebounds off red button into the newly dropped Giant Basketball Hoop (720, 675)!
        const u = inv(24.35, 25.45, t);
        bx = lerp(BUTTON_X - 18, HOOP_RIM_X, u);
        by = lerp(BUTTON_Y, 675, u) - Math.sin(u * Math.PI) * 95;
      } else if (t < 26.15) {
        // Swishes cleanly down through the hoop net onto the floor!
        const u = inv(25.45, 26.15, t);
        bx = HOOP_RIM_X;
        by = lerp(675, FLOOR_Y - 18, u * u);
      } else if (t < 26.8) {
        const u = inv(26.15, 26.8, t);
        bx = lerp(HOOP_RIM_X, 755, u);
        by = FLOOR_Y - 18 - Math.sin(u * Math.PI) * 48;
      } else {
        bx = 755;
        by = FLOOR_Y - 18;
      }

      balls.push({ x: bx, y: by, r: 18, color: '#f97316', layer });
    }

    return balls;
  }

  // -------------------------------------------------------------------------
  // Background & Machine Geometry
  // -------------------------------------------------------------------------
  private drawBackground(ctx: CanvasRenderingContext2D, t: number) {
    ctx.fillStyle = WALL_BG;
    ctx.fillRect(0, 0, WIDTH, FLOOR_Y);

    ctx.fillStyle = WALL_BAND;
    ctx.fillRect(0, 1150, WALL_RIGHT_X, FLOOR_Y - 1150);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 1150);
    ctx.lineTo(WALL_RIGHT_X, 1150);
    ctx.stroke();

    // Right wall for Scene 4 bounce / button mount
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(WALL_RIGHT_X, 0, WIDTH - WALL_RIGHT_X, FLOOR_Y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(WALL_RIGHT_X, 0);
    ctx.lineTo(WALL_RIGHT_X, FLOOR_Y);
    ctx.stroke();

    // Left upper bounce deflector bumper for Scene 4 (310, 495)
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(272, 435, 28, 120, 10);
    ctx.fill();
    ctx.stroke();

    if (t >= 21.85 && t < 22.35) {
      const u = inv(21.85, 22.35, t);
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(305, 495, 18 + u * 48, -Math.PI * 0.5, Math.PI * 0.5);
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
  }

  private getHoopRimY(t: number): number {
    if (t < 24.35) return 215; // stowed right up near the ceiling
    if (t < 25.0) return lerp(215, 675, easeOut(inv(24.35, 25.0, t)));
    return 675;
  }

  private drawCeilingHoopBack(ctx: CanvasRenderingContext2D, t: number) {
    const rimY = this.getHoopRimY(t);
    ctx.save();
    // Telescoping ceiling steel mount pole
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(HOOP_RIM_X + 58, 0, 22, rimY - 35);
    ctx.fill();
    ctx.stroke();

    // Giant White & Red Backboard
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.roundRect(HOOP_RIM_X + 44, rimY - 140, 28, 175, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.rect(HOOP_RIM_X + 46, rimY - 95, 24, 85);
    ctx.fill();
    ctx.stroke();

    // Back rim line
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(HOOP_RIM_X - 58, rimY);
    ctx.lineTo(HOOP_RIM_X + 44, rimY);
    ctx.stroke();
    ctx.restore();
  }

  private drawCeilingHoopFront(ctx: CanvasRenderingContext2D, t: number) {
    const rimY = this.getHoopRimY(t);
    const sway = t >= 25.4 && t < 26.15 ? Math.sin((t - 25.4) * 24) * 14 : 0;

    ctx.save();
    // Crisp white mesh net
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const tx = lerp(HOOP_RIM_X - 50, HOOP_RIM_X + 38, i / 4);
      const bx = lerp(HOOP_RIM_X - 34, HOOP_RIM_X + 22, i / 4) + sway;
      ctx.moveTo(tx, rimY + 4);
      ctx.lineTo(bx, rimY + 86);
    }
    ctx.moveTo(HOOP_RIM_X - 44 + sway * 0.4, rimY + 42);
    ctx.lineTo(HOOP_RIM_X + 32 + sway * 0.4, rimY + 42);
    ctx.moveTo(HOOP_RIM_X - 38 + sway * 0.8, rimY + 70);
    ctx.lineTo(HOOP_RIM_X + 26 + sway * 0.8, rimY + 70);
    ctx.stroke();

    // Front orange hoop rim
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(HOOP_RIM_X - 58, rimY);
    ctx.lineTo(HOOP_RIM_X + 44, rimY);
    ctx.stroke();

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(HOOP_RIM_X - 58, rimY);
    ctx.lineTo(HOOP_RIM_X + 44, rimY);
    ctx.stroke();
    ctx.restore();
  }

  private drawMachineStructure(ctx: CanvasRenderingContext2D, t: number) {
    const drawRamp = (x1: number, y1: number, x2: number, y2: number, color = RAMP_TEAL) => {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.strokeStyle = color;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    // Vertical support columns for machine shelves
    ctx.strokeStyle = MACHINE_STEEL;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(540, 1255);
    ctx.lineTo(540, FLOOR_Y);
    ctx.moveTo(715, 1255);
    ctx.lineTo(715, FLOOR_Y);
    ctx.moveTo(935, 1125);
    ctx.lineTo(935, FLOOR_Y);
    ctx.stroke();

    // Ramp 1 (Scene 1 start) + Domino Row A shelf
    drawRamp(260, 1128, 540, 1252);
    drawRamp(540, 1254, 712, 1254, MACHINE_FRAME);

    // Ramp 2A + Ramp 2B (Scene 2 10-ball ramps) + Domino Row B shelf
    drawRamp(910, 858, 420, 982);
    drawRamp(420, 1002, 775, 1118);
    drawRamp(775, 1122, 938, 1122, MACHINE_FRAME);

    // Causal trigger cable connecting Domino Row B lever -> 100-ball Hopper Latch
    ctx.strokeStyle = t >= 11.95 ? '#ef4444' : '#64748b';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(938, 1122);
    ctx.lineTo(938, 390);
    ctx.lineTo(535, 430);
    ctx.stroke();
    ctx.setLineDash([]);

    // 100-Ball Overhead Hopper Box Back (x=295..535, y=240..432)
    ctx.fillStyle = '#e0f2fe';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(295, 240, 240, 194, 16);
    ctx.fill();
    ctx.stroke();

    // Hopper release hatch gate (opens at 12.0s)
    const gateOpen = smooth(inv(11.95, 12.25, t));
    ctx.save();
    ctx.translate(440, 434);
    ctx.rotate(-gateOpen * 1.15);
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(-38, -6, 76, 12, 5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Circular Loop-de-Loop Track (center (605, 655), r=92)
    ctx.strokeStyle = INK;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.arc(605, 655, 105, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = LOOP_PURPLE;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(605, 655, 105, 0, TAU);
    ctx.stroke();

    // Coiled Spring Bumpers (795, 610) & (405, 765)
    this.drawSpringBumper(ctx, 795, 610, t);
    this.drawSpringBumper(ctx, 405, 765, t);

    // Domino Row C shelf (335..525, y=938)
    drawRamp(335, 938, 525, 938, MACHINE_FRAME);

    // Giant Bottom Funnel Ramp (340, 982) -> (920, 1288) + Upward Launch Kicker
    drawRamp(340, 982, 912, 1288, RAMP_DARK);
    drawRamp(912, 1288, 950, 1185, '#f97316');

    // Bottom Holding Chamber Box (x=585..925, y=1325..FLOOR_Y)
    ctx.fillStyle = 'rgba(203, 213, 225, 0.55)';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(585, 1325, 340, FLOOR_Y - 1325, 12);
    ctx.fill();
    ctx.stroke();

    // Left avalanche hatch door (opens violently at 26.95s!)
    const hatchOpen = easeOut(inv(26.95, 27.25, t));
    ctx.save();
    ctx.translate(585, 1325);
    ctx.rotate(hatchOpen * 1.35);
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(-8, 0, 16, FLOOR_Y - 1325);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawSpringBumper(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
    const bounce = Math.abs(Math.sin(t * 14)) * (t >= 12.8 && t < 18.5 ? 0.16 : 0);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1 + bounce, 1 - bounce);
    ctx.fillStyle = SPRING_GOLD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawGlassOverlays(ctx: CanvasRenderingContext2D, _t: number) {
    // S-curve translucent tube from Hopper (440, 445) -> (765, 535)
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 42;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(440, 445);
    ctx.bezierCurveTo(540, 455, 650, 520, 765, 535);
    ctx.stroke();

    ctx.strokeStyle = TUNNEL_GLASS;
    ctx.lineWidth = 32;
    ctx.beginPath();
    ctx.moveTo(440, 445);
    ctx.bezierCurveTo(540, 455, 650, 520, 765, 535);
    ctx.stroke();
    ctx.restore();
  }

  private drawDominoRows(ctx: CanvasRenderingContext2D, t: number) {
    const drawDomino = (x: number, y: number, angle: number, color = DOMINO_IVORY) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-7, -44, 14, 44, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = DOMINO_DOT;
      ctx.beginPath();
      ctx.arc(0, -32, 2.5, 0, TAU);
      ctx.arc(0, -14, 2.5, 0, TAU);
      ctx.fill();
      ctx.restore();
    };

    // Row A: 6 dominoes at (558..688, 1244)
    for (let i = 0; i < 6; i++) {
      const hitT = 2.95 + i * 0.28;
      const tip = smooth(inv(hitT, hitT + 0.35, t)) * 1.18;
      drawDomino(558 + i * 26, 1244, tip);
    }

    // Row B: 5 dominoes at (795..915, 1112)
    for (let i = 0; i < 5; i++) {
      const hitT = 10.1 + i * 0.25;
      const tip = smooth(inv(hitT, hitT + 0.32, t)) * 1.18;
      drawDomino(795 + i * 28, 1112, tip, '#fef08a');
    }

    // Row C: 6 dominoes at (355..495, 928)
    for (let i = 0; i < 6; i++) {
      const hitT = 15.0 + i * 0.22;
      const tip = smooth(inv(hitT, hitT + 0.32, t)) * 1.18;
      drawDomino(355 + i * 28, 928, tip, '#e0e7ff');
    }
  }

  private getSeesawTilt(t: number): number {
    if (t < 6.2) return 0.24;
    if (t < 6.6) return lerp(0.24, -0.32, easeOut(inv(6.2, 6.6, t)));
    return -0.32;
  }

  private drawSeesaw(ctx: CanvasRenderingContext2D, t: number) {
    const px = 795;
    const py = 1365;
    const tilt = this.getSeesawTilt(t);

    // Fulcrum triangle
    ctx.fillStyle = MACHINE_FRAME;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(px - 22, py + 36);
    ctx.lineTo(px + 22, py + 36);
    ctx.lineTo(px, py);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tilting plank
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(tilt);
    ctx.fillStyle = SEESAW_AMBER;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(-84, -8, 168, 16, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawRedTargetButton(ctx: CanvasRenderingContext2D, t: number) {
    const press = t >= 24.35 ? easeOut(inv(24.35, 24.5, t)) * 12 : 0;

    ctx.save();
    ctx.translate(BUTTON_X, BUTTON_Y);

    // Yellow steel mounting collar on right wall
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(14, -46, 24, 92, 8);
    ctx.fill();
    ctx.stroke();

    // Red plunger button face
    ctx.fillStyle = t >= 24.35 ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.roundRect(-12 + press, -36, 28 - press * 0.4, 72, 12);
    ctx.fill();
    ctx.stroke();

    // Target bullseye ring
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(-2 + press, 0, 14, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawColorBall(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    color: string
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.beginPath();
    ctx.arc(-r * 0.32, -r * 0.34, r * 0.28, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawBuriedBeanieTop(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 27.95) return;
    const pop = easeOut(inv(27.95, 28.25, t));
    const shake = t >= 28.5 ? Math.sin(t * 28) * 3 : 0;
    ctx.save();
    ctx.translate(STICKMAN_X + shake, 1245);
    ctx.scale(pop, pop);
    this.drawBeanieShape(ctx);
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Visual FX (Button hit burst & Victory Confetti)
  // -------------------------------------------------------------------------
  private drawVisualFX(ctx: CanvasRenderingContext2D, t: number) {
    if (t >= 24.35 && t < 24.9) {
      const k = 1 - inv(24.35, 24.9, t);
      ctx.save();
      ctx.translate(BUTTON_X - 18, BUTTON_Y);
      ctx.scale(k * 1.4, k * 1.4);
      ctx.fillStyle = '#4ade80';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i * TAU) / 10;
        const r = i % 2 === 0 ? 44 : 18;
        ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (t >= 25.5 && t < 27.0) {
      const k = inv(25.5, 27.0, t);
      const colors = ['#facc15', '#38bdf8', '#ef4444', '#4ade80'];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + k * 1.6;
        const dist = 48 + Math.sin(k * Math.PI) * 105;
        ctx.save();
        ctx.translate(HOOP_RIM_X + Math.cos(a) * dist, 675 + Math.sin(a) * dist * 0.6);
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
