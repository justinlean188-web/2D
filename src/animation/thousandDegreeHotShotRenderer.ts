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

// --- Heat-Lab & Ice Palette (Modern Pop 2D Flat Vector) ----------------------
const LAB_WALL = '#f8fafc';
const LAB_BAND = '#e2e8f0';
const FLOOR_TILE = '#cbd5e1';
const FLOOR_LINE = '#94a3b8';

const METAL_LIGHT = '#cbd5e1';
const METAL_MID = '#94a3b8';
const METAL_DARK = '#475569';

const ICE_FILL = '#bae6fd';
const ICE_EDGE = '#38bdf8';
const ICE_SHINE = '#f0f9ff';

const HOT_ORANGE = '#f97316';
const HOT_CORE = '#fef08a';
const HOT_RED = '#ef4444';
const GOLD_CUP = '#facc15';
const GOLD_DEEP = '#ca8a04';
const GOGGLE_LENS = 'rgba(125, 211, 252, 0.42)';

const FLOOR_Y = 1520;
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
  goggles: boolean;
  gogglesTilt: number;
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
  handL: { x: -68, y: 1265 },
  handR: { x: 68, y: 1265 },
  bendL: 1,
  bendR: 1,
  gripL: false,
  gripR: false,
  fistL: false,
  fistR: false,
  pointL: false,
  pointR: false,
  beanieOn: true,
  goggles: false,
  gogglesTilt: 0,
  crouch: 0,
  sit: 0,
};

const POSE_PATCHES: { t: number; p?: PosePatch }[] = [
  // Scene 1 (0–6s): Places glowing orange ball -> watches ice cube melt -> puts on oversized safety goggles & grins!
  {
    t: 0.0,
    p: {
      lean: 0.06,
      look: 'right',
      mouth: 'smirk',
      brow: 'cocky',
      handR: { x: 84, y: 1120 },
      gripR: true,
    },
  },
  {
    t: 1.35,
    p: {
      lean: 0.14,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      gripR: false,
      handR: { x: 85, y: 920 },
    },
  },
  {
    t: 2.3,
    p: {
      lean: 0.06,
      look: 'right',
      mouth: 'grin',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -72, y: 1245 },
      handR: { x: 84, y: 1185 },
    },
  },
  {
    t: 3.7,
    p: {
      lean: -0.02,
      look: 'front',
      mouth: 'smile',
      brow: 'determined',
      eye: 'open',
      handL: { x: -85, y: 1005 },
      handR: { x: 85, y: 1005 },
      bendL: -1,
      bendR: -1,
    },
  },
  {
    t: 4.15,
    p: {
      lean: 0.0,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'cocky',
      eye: 'open',
      goggles: true,
      handL: { x: -72, y: 1245 },
      handR: { x: 96, y: 1135 },
      bendL: 1,
      bendR: 1,
      fistR: true,
    },
  },

  // Scene 2 (6–12s): Releases ball -> watches ice melt & springboard launch -> cheers!
  {
    t: 6.3,
    p: {
      lean: 0.14,
      fistR: false,
      look: 'right',
      mouth: 'grin',
      brow: 'determined',
      handR: { x: 85, y: 920 },
      pointR: true,
    },
  },
  {
    t: 9.8,
    p: {
      lean: -0.04,
      pointR: false,
      look: 'right',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -110, y: 1035 },
      handR: { x: 110, y: 1035 },
      bendL: -1,
      bendR: -1,
      fistL: true,
      fistR: true,
    },
  },

  // Scene 3 (12–18s): Runs excitedly alongside ball through 3 spinning rings, giant ice wall & metal bounce ramp!
  {
    t: 12.0,
    p: {
      lean: 0.18,
      look: 'right',
      mouth: 'grin',
      brow: 'determined',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handL: { x: -74, y: 1185 },
      handR: { x: 96, y: 1125 },
      bendL: 1,
      bendR: 1,
    },
  },

  // Scene 4 (18–24s): Skids before ice pit -> watches ball fly through metal hoop toward golden cup!
  {
    t: 18.2,
    p: {
      lean: 0.14,
      crouch: 0.18,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -58, y: 1200 },
      handR: { x: 58, y: 1200 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 5 (24–30s): Celebrates & leaps over ice pit -> red-hot cup launches ball onto his beanie -> frantically pats it out!
  {
    t: 24.15,
    p: {
      lean: 0,
      crouch: 0,
      stance: 20,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      handL: { x: -115, y: 1020 },
      handR: { x: 115, y: 1020 },
      bendL: -1,
      bendR: -1,
    },
  },
  {
    t: 25.85,
    p: {
      lean: -0.08,
      stance: 10,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handL: { x: -85, y: 1180 },
      handR: { x: 85, y: 1180 },
      bendL: 1,
      bendR: 1,
    },
  },
  {
    t: 27.15,
    p: {
      lean: 0.04,
      headTilt: -0.1,
      headDrop: 8,
      gogglesTilt: 0.16,
      look: 'up',
      mouth: 'o',
      brow: 'angry',
      eye: 'wide',
      handL: { x: -34, y: 895 },
      handR: { x: 34, y: 895 },
      bendL: -1,
      bendR: -1,
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
  { from: 0.25, to: 5.75, text: '1,000-DEGREE BALL?!' },
  { from: 6.25, to: 11.75, text: 'TOO HOT TO STOP!' },
  { from: 12.25, to: 17.75, text: 'ULTIMATE HEAT TRICKSHOT!' },
  { from: 18.25, to: 23.75, text: 'PERFECT LANDING!' },
  { from: 24.25, to: 29.85, text: 'MY BEANIE!!! 😂' },
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
}

export class ThousandDegreeHotShotRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const camX = this.cameraXAt(time);
    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.walkPhase);
    const ball = this.ballAt(time);

    ctx.save();
    ctx.translate(-camX, 0);

    // 1. Lab Course Backdrop & Floor
    this.drawLabBackdrop(ctx);

    // 2. Heat-Resistant Metal Ramps, Springboard, Spinning Rings, Metal Hoop & Golden Cup Back
    this.drawMetalCourse(ctx, time);
    this.drawIceObstacles(ctx, time);
    this.drawGoldenCupBack(ctx, time);

    // 3. Locked Angry Stickman (with oversized safety goggles from 3.9s+)
    this.drawCharacter(ctx, ch, pose, time);

    // 4. Glowing 1,000-Degree Orange Ball & Heat Shimmer
    this.drawGlowingBall(ctx, ball.x, ball.y, ball.rot, time);

    // 5. Golden Cup Front Rim + Spinning Ring Front Arcs + Ice Pit Front Rim
    this.drawGoldenCupFront(ctx, 2295, 1345, time);
    this.drawIcePitFront(ctx);

    // 6. Cartoon Steam, Smoke & Victory Confetti
    this.drawHeatAndSmokeFX(ctx, time, ch, ball);

    ctx.restore();

    // 7. Burned-in Scene Captions & Safe Zones (screen space)
    this.drawCaptions(ctx, time);
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Camera, Character & Ball Timelines
  // -------------------------------------------------------------------------
  private cameraXAt(t: number): number {
    if (t < 10.0) return 0;
    if (t < 12.2) return lerp(0, 880, smooth(inv(10.0, 12.2, t)));
    if (t < 16.4) return 880;
    if (t < 18.6) return lerp(880, 1460, smooth(inv(16.4, 18.6, t)));
    return 1460;
  }

  private charAt(t: number): CharState {
    let x = 195;
    let lift = 0;
    let walkPhase = 0;

    if (t < 10.2) {
      x = 195;
    } else if (t < 15.6) {
      const k = smooth(inv(10.2, 15.6, t));
      x = lerp(195, 1140, k);
      walkPhase = k * TAU * 4.5;
    } else if (t < 18.4) {
      const k = smooth(inv(15.6, 18.4, t));
      x = lerp(1140, 1650, k);
      walkPhase = k * TAU * 2.5;
    } else if (t < 24.15) {
      x = 1650;
    } else if (t < 25.35) {
      // Celebrates & leaps cleanly over the Ice Pit (1780..2050) to stand right beside the Golden Cup!
      const u = inv(24.25, 25.35, t);
      x = lerp(1650, 2135, smooth(u));
      lift = Math.sin(u * Math.PI) * 185;
      walkPhase = u * TAU;
    } else if (t < 25.85) {
      x = 2135;
      const bounce = ((t - 25.35) * 4) % 1;
      lift = Math.sin(bounce * Math.PI) * 38;
    } else {
      x = 2135;
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
        gogglesTilt: lerp(a.gogglesTilt, b.gogglesTilt, s),
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
        goggles: mid.goggles,
      };
    }

    if (walkPhase > 0.001) {
      const w = Math.sin(walkPhase);
      p.footLift += Math.max(0, w) * 34;
      p.stance += w * 18;
      p.handL.x += w * 22;
      p.handR.x -= w * 22;
    }

    // Frantic beanie patting motion (27.25–30.0s)!
    if (t >= 27.25) {
      const pat = Math.sin((t - 27.25) * 26);
      p.handL.y = 895 + pat * 32;
      p.handR.y = 895 - pat * 32;
      p.stance = Math.sin((t - 27.25) * 14) * 10;
    }

    return p;
  }

  private ballAt(t: number): BallState {
    // Scene 1 (0–6s): Held -> placed at top of Metal Ramp 1 (278, 902) -> melts nearby ice cube
    if (t < 1.35) {
      const k = smooth(inv(0.0, 1.35, t));
      return { x: lerp(255, 278, k), y: lerp(1120, 902, k), rot: 0 };
    }
    if (t < 6.65) {
      return { x: 278, y: 902, rot: 0 };
    }

    // Scene 2 (6–12s): Races down Metal Ramp 1 -> melts through Thin Ice Obstacle (8.45s) -> Springboard (9.90s) -> launches!
    if (t < 9.9) {
      const u = inv(6.65, 9.9, t);
      const ease = u * u * 0.4 + u * 0.6;
      return {
        x: lerp(278, 785, ease),
        y: lerp(902, 1164, ease),
        rot: ease * 18,
      };
    }
    if (t < 11.9) {
      const u = inv(9.9, 11.9, t);
      return {
        x: lerp(785, 1005, u),
        y: lerp(1164, 755, u) - Math.sin(u * Math.PI) * 185,
        rot: 18 + u * 12,
      };
    }

    // Scene 3 (12–18s): Rolls through 3 spinning metal rings -> melts Giant Ice Wall (15.55s) -> bounces off Metal Ramp 2 (16.65s)
    if (t < 15.55) {
      const u = inv(11.9, 15.55, t);
      return {
        x: lerp(1005, 1455, u),
        y: lerp(755, 855, u),
        rot: 30 + u * 20,
      };
    }
    if (t < 16.65) {
      // Breaks through Giant Ice Wall and drops cleanly onto Heat-Resistant Bounce Ramp (1655, 1142)
      const u = inv(15.55, 16.65, t);
      return {
        x: lerp(1455, 1655, u),
        y: lerp(855, 1142, u * u),
        rot: 50 + u * 8,
      };
    }
    if (t < 18.6) {
      const u = inv(16.65, 18.6, t);
      return {
        x: lerp(1655, 1815, u),
        y: lerp(1142, 825, u) - Math.sin(u * Math.PI) * 110,
        rot: 58 + u * 10,
      };
    }

    // Scene 4 (18–24s): Flies over Ice Pit -> threads Narrow Metal Hoop (20.85s) -> drops into Golden Target Cup (24.15s)!
    if (t < 20.85) {
      const u = inv(18.6, 20.85, t);
      return {
        x: lerp(1815, 1960, u),
        y: lerp(825, 760, u) - Math.sin(u * Math.PI) * 55,
        rot: 68 + u * 10,
      };
    }
    if (t < 24.15) {
      const u = inv(20.85, 24.15, t);
      return {
        x: lerp(1960, 2295, smooth(u)),
        y: lerp(760, 1280, u) - Math.sin(u * Math.PI) * 120,
        rot: 78 + u * 12,
      };
    }

    // Scene 5 (24–30s): Inside cup -> cup heats red-hot -> blasts straight up (26.15s) -> lands on Stickman's beanie (27.15s)!
    if (t < 26.15) {
      return { x: 2295, y: 1304, rot: 90 };
    }
    if (t < 27.15) {
      const u = inv(26.15, 27.15, t);
      return {
        x: lerp(2295, 2135, smooth(u)),
        y: lerp(1304, 895, u) - Math.sin(u * Math.PI) * 440,
        rot: 90 + u * 18,
      };
    }

    // Sizzling right on top of Stickman's red beanie!
    const bounce = Math.abs(Math.sin((t - 27.15) * 14)) * 10;
    return { x: 2135, y: 895 - bounce, rot: 108 };
  }

  // -------------------------------------------------------------------------
  // Lab Environment, Ramps, Spinning Rings, Ice Obstacles & Golden Cup
  // -------------------------------------------------------------------------
  private drawLabBackdrop(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = LAB_WALL;
    ctx.fillRect(-200, 0, 2900, FLOOR_Y);

    ctx.fillStyle = LAB_BAND;
    ctx.fillRect(-200, 1210, 2900, FLOOR_Y - 1210);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-200, 1210);
    ctx.lineTo(2700, 1210);
    ctx.stroke();

    // Subtle test-lab wall seams
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 2600; x += 260) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1210);
      ctx.stroke();
    }

    // Floor tiles
    ctx.fillStyle = FLOOR_TILE;
    ctx.fillRect(-200, FLOOR_Y, 2900, HEIGHT - FLOOR_Y);
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 4;
    for (let fy = FLOOR_Y + 46; fy < HEIGHT; fy += 60) {
      ctx.beginPath();
      ctx.moveTo(-200, fy);
      ctx.lineTo(2700, fy);
      ctx.stroke();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-200, FLOOR_Y);
    ctx.lineTo(2700, FLOOR_Y);
    ctx.stroke();
  }

  private drawMetalCourse(ctx: CanvasRenderingContext2D, t: number) {
    // 1. Metal Ramp 1 (260,916 -> 745,1176) on steel struts
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    for (const [sx, sy] of [
      [290, 935],
      [710, 1165],
    ]) {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx, FLOOR_Y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(255, 916);
    ctx.rotate(Math.atan2(260, 490));
    ctx.fillStyle = METAL_LIGHT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(0, 0, 560, 26, 6);
    ctx.fill();
    ctx.stroke();
    // Rivet dots
    ctx.fillStyle = METAL_DARK;
    for (let rx = 25; rx < 540; rx += 65) {
      ctx.beginPath();
      ctx.arc(rx, 13, 4, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // Small side shelf holding Scene 1 nearby ice cube at (335, 862)
    ctx.fillStyle = METAL_MID;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(310, 862, 74, 14, 4);
    ctx.fill();
    ctx.stroke();

    // 2. Scene 2 Springboard at (785, 1185)
    const springPush = t >= 9.85 && t < 10.1 ? Math.sin(inv(9.85, 10.1, t) * Math.PI) * 18 : 0;
    ctx.strokeStyle = METAL_DARK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(765, FLOOR_Y);
    ctx.lineTo(765, 1205);
    ctx.moveTo(810, FLOOR_Y);
    ctx.lineTo(810, 1205);
    ctx.stroke();

    ctx.save();
    ctx.translate(785, 1185 + springPush);
    ctx.rotate(-0.26);
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-48, -10, 96, 20, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 3. Scene 3 Metal Guide Rail & Three Spinning Metal Rings (1060, 1190, 1320)
    const rings = [
      { x: 1085, y: 770, phase: 0.0 },
      { x: 1205, y: 798, phase: 1.0 },
      { x: 1325, y: 825, phase: 2.0 },
    ];
    for (const r of rings) {
      // Steel ceiling mount rod
      ctx.strokeStyle = INK;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y - 62);
      ctx.lineTo(r.x, 540);
      ctx.stroke();

      const rx = Math.max(15, Math.abs(Math.cos(t * 2.8 + r.phase)) * 44);
      ctx.strokeStyle = METAL_LIGHT;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, rx, 62, 0, 0, TAU);
      ctx.stroke();

      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, rx, 62, 0, 0, TAU);
      ctx.stroke();
    }

    // 4. Scene 3 Heat-Resistant Metal Bounce Ramp at (1655, 1165)
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(1655, 1175);
    ctx.lineTo(1655, FLOOR_Y);
    ctx.stroke();

    ctx.save();
    ctx.translate(1655, 1165);
    ctx.rotate(-0.42);
    ctx.fillStyle = METAL_LIGHT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-72, -12, 144, 24, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 5. Scene 4 Narrow Metal Hoop at (1960, 760)
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(1960, 704);
    ctx.lineTo(1960, 520);
    ctx.stroke();

    ctx.strokeStyle = METAL_LIGHT;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.ellipse(1960, 760, 22, 54, 0, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(1960, 760, 22, 54, 0, 0, TAU);
    ctx.stroke();
  }

  private drawIceObstacles(ctx: CanvasRenderingContext2D, t: number) {
    // 1. Scene 1 Nearby Ice Cube at (347, 862) — melts smoothly between 1.8s and 4.2s!
    const melt1 = smooth(inv(1.8, 4.2, t));
    const cubeSize = lerp(48, 8, melt1);
    if (melt1 > 0.05) {
      ctx.fillStyle = ICE_EDGE;
      ctx.beginPath();
      ctx.ellipse(347, 860, 18 + melt1 * 22, 5, 0, 0, TAU);
      ctx.fill();
    }
    if (cubeSize > 10) {
      ctx.fillStyle = ICE_FILL;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(347 - cubeSize / 2, 862 - cubeSize, cubeSize, cubeSize, 6);
      ctx.fill();
      ctx.stroke();
    }

    // 2. Scene 2 Thin Ice Obstacle across Ramp 1 at (545, 960..1075) — melts open at 8.45s!
    const melt2 = smooth(inv(8.35, 8.75, t));
    ctx.fillStyle = ICE_FILL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    if (melt2 < 0.2) {
      ctx.beginPath();
      ctx.roundRect(533, 950, 24, 125, 5);
      ctx.fill();
      ctx.stroke();
    } else {
      // Top & bottom stubs remain with melted center hole!
      ctx.beginPath();
      ctx.roundRect(533, 950, 24, 34, 4);
      ctx.roundRect(533, 1044, 24, 32, 4);
      ctx.fill();
      ctx.stroke();
    }

    // 3. Scene 3 Giant Ice Wall at (1455, 700..1120) — melts a hole cleanly at 15.55s!
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(1415, 1120, 80, FLOOR_Y - 1120);
    ctx.fill();
    ctx.stroke();

    const melt3 = smooth(inv(15.45, 15.85, t));
    ctx.fillStyle = ICE_FILL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    if (melt3 < 0.2) {
      ctx.beginPath();
      ctx.roundRect(1425, 700, 60, 420, 8);
      ctx.fill();
      ctx.stroke();
    } else {
      // Melted hole through the middle (y=820..895)!
      ctx.beginPath();
      ctx.roundRect(1425, 700, 60, 120, 8);
      ctx.roundRect(1425, 895, 60, 225, 8);
      ctx.fill();
      ctx.stroke();
    }

    // 4. Scene 4 Ice Pit Floor Trench (x = 1785..2045)
    ctx.fillStyle = '#0c4a6e';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(1785, FLOOR_Y - 8, 260, 110);
    ctx.fill();
    ctx.stroke();

    // Jagged ice spikes inside Ice Pit
    ctx.fillStyle = ICE_FILL;
    for (let ix = 1795; ix < 2030; ix += 32) {
      ctx.beginPath();
      ctx.moveTo(ix, FLOOR_Y + 95);
      ctx.lineTo(ix + 16, FLOOR_Y + 12);
      ctx.lineTo(ix + 32, FLOOR_Y + 95);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    void ICE_SHINE;
  }

  private drawIcePitFront(ctx: CanvasRenderingContext2D) {
    // Crisp white-cyan frost rim on Ice Pit top edge
    ctx.fillStyle = ICE_EDGE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(1780, FLOOR_Y - 10, 270, 18, 6);
    ctx.fill();
    ctx.stroke();
  }

  private drawGoldenCupBack(ctx: CanvasRenderingContext2D, t: number) {
    // Pedestal at (2250..2340, top y=1345)
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(2260, 1345, 70, FLOOR_Y - 1345);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = METAL_MID;
    ctx.beginPath();
    ctx.roundRect(2245, 1335, 100, 20, 5);
    ctx.fill();
    ctx.stroke();

    const redHot = t >= 25.85;
    ctx.fillStyle = redHot ? '#b91c1c' : GOLD_DEEP;
    ctx.beginPath();
    ctx.ellipse(2295, 1277, 28, 8, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private drawGoldenCupFront(ctx: CanvasRenderingContext2D, cx: number, bottomY: number, t: number) {
    const redHot = t >= 25.85;
    const shakeX = redHot && t < 26.25 ? Math.sin(t * 75) * 4 : 0;

    ctx.save();
    ctx.translate(shakeX, 0);
    if (redHot) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, bottomY - 34, 52, 0, TAU);
      ctx.fill();
    }

    ctx.fillStyle = redHot ? HOT_RED : GOLD_CUP;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 28, bottomY - 68);
    ctx.lineTo(cx + 28, bottomY - 68);
    ctx.lineTo(cx + 21, bottomY);
    ctx.lineTo(cx - 21, bottomY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = redHot ? '#fecaca' : WHITE;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 21, bottomY - 62);
    ctx.lineTo(cx + 21, bottomY - 62);
    ctx.stroke();
    ctx.restore();
  }

  private drawGlowingBall(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number, t: number) {
    const pulse = 1 + Math.sin(t * 14) * 0.12;
    ctx.save();
    ctx.translate(x, y);

    // Subtle heat shimmer halo
    ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R * 1.65 * pulse, 0, TAU);
    ctx.fill();

    // Cartoon wavy heat-shimmer lines rising above the ball
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.85)';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    for (const ox of [-9, 0, 9]) {
      const wave = Math.sin(t * 10 + ox) * 4;
      ctx.beginPath();
      ctx.moveTo(ox, -BALL_R - 4);
      ctx.quadraticCurveTo(ox + wave, -BALL_R - 14, ox - wave, -BALL_R - 24);
      ctx.stroke();
    }

    ctx.rotate(rot);
    ctx.fillStyle = HOT_ORANGE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = HOT_CORE;
    ctx.beginPath();
    ctx.arc(-3, -3, BALL_R * 0.45, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawHeatAndSmokeFX(ctx: CanvasRenderingContext2D, t: number, ch: CharState, _ball: BallState) {
    // Steam puffs during ice melts
    const steamSpots = [
      { from: 1.9, to: 3.6, x: 347, y: 840 },
      { from: 8.35, to: 9.2, x: 545, y: 985 },
      { from: 15.45, to: 16.5, x: 1455, y: 845 },
    ];
    for (const s of steamSpots) {
      if (t >= s.from && t < s.to) {
        const u = inv(s.from, s.to, t);
        ctx.save();
        ctx.globalAlpha = 1 - u;
        ctx.fillStyle = WHITE;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
          const px = s.x + (i - 1) * 18;
          const py = s.y - u * (45 + i * 16);
          ctx.beginPath();
          ctx.arc(px, py, 10 + i * 2, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // Scene 5 Victory Confetti (24.15–25.85s)
    if (t >= 24.15 && t < 25.85) {
      const u = inv(24.15, 25.85, t);
      const colors = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU + 0.2;
        const px = 2295 + Math.cos(a) * (25 + u * 145);
        const py = 1265 + Math.sin(a) * (20 + u * 100) - u * 45 + u * u * 100;
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.rect(px - 6, py - 5, 12, 10);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Scene 5 Smoking Beanie Cartoon Clouds (27.15–30.0s)!
    if (t >= 27.15) {
      const smokeCycle = t - 27.15;
      for (let i = 0; i < 4; i++) {
        const phase = (smokeCycle * 1.4 + i * 0.25) % 1;
        const sx = ch.x + Math.sin(phase * 5 + i) * 28;
        const sy = 885 - phase * 145;
        const rad = lerp(14, 34, phase);
        ctx.save();
        ctx.globalAlpha = 1 - phase;
        ctx.fillStyle = i % 2 === 0 ? '#94a3b8' : '#cbd5e1';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(sx, sy, rad, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  // -------------------------------------------------------------------------
  // Locked Angry Stickman Rig + Oversized Safety Goggles
  // -------------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, ch: CharState, pose: Pose, t: number) {
    const baseY = ch.ground - ch.lift;
    const hipY = baseY - 260 + pose.hipDrop + pose.crouch * 52 + pose.sit * 44;
    const shoulderY = hipY - 170;
    const bodyTopX = ch.x + Math.sin(pose.lean) * 170;
    const headCx = bodyTopX + Math.sin(pose.headTilt) * 12;
    const headCy = shoulderY - 20 - HEAD_R + pose.headDrop;
    const arms = this.computeArms(pose, ch.x, hipY, t);

    this.drawBody(ctx, ch.x, hipY, baseY, pose, arms);
    this.drawHead(ctx, headCx, headCy, pose);
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
    const hipShift = hipY - 1260;

    const solve = (side: -1 | 1, target: Pt, bend: 1 | -1): Arm => {
      const sx = bodyTopX + side * 36;
      const sy = shoulderY;
      let hx = x + target.x;
      let hy = target.y + (target.y > 950 ? hipShift : 0);
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

    // Oversized cartoon safety goggles (translucent cyan lenses so eyes stay 100% readable)
    if (pose.goggles) {
      ctx.save();
      ctx.translate(fx, eyeY);
      ctx.rotate(pose.gogglesTilt);
      // Side strap
      ctx.strokeStyle = INK;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-r + 4, 0);
      ctx.lineTo(-46, 0);
      ctx.moveTo(46, 0);
      ctx.lineTo(r - 4, 0);
      ctx.stroke();

      // Bridge & dual round goggle cups
      ctx.fillStyle = GOGGLE_LENS;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5.5;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(side * eyeDX, 0, 22, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-5, -2);
      ctx.lineTo(5, -2);
      ctx.stroke();
      ctx.restore();
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

    ctx.fillStyle = '#fb923c';
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
