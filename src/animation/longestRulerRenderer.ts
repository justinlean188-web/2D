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
const ROOM_WALL = '#fefaf2';
const ROOM_BAND = '#f1e8da';
const FLOOR_WOOD = '#fde68a';
const FLOOR_PLANK = '#f59e0b';

const GARDEN_SKY = '#7dd3fc';
const GARDEN_GRASS = '#4ade80';
const GARDEN_TRIM = '#22c55e';

const RULER_YELLOW = '#facc15';
const RULER_EDGE = '#eab308';
const BALL_ORANGE = '#f97316';
const BALL_HIGHLIGHT = '#fdba74';

const BOOK_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#06b6d4'];

const FLOOR_Y = 1500;
const HEAD_R = 70;
const BALL_R = 18;
const HOOP_RIM_X = 3015;
const HOOP_RIM_Y = 710;

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
  // Scene 1 (0–6s): Tries normal ruler flick -> barely moves -> idea -> pulls giant yellow ruler
  {
    t: 0.0,
    p: {
      lean: 0.1,
      look: 'right',
      mouth: 'smirk',
      brow: 'cocky',
      eye: 'open',
      handL: { x: -68, y: 1240 },
      handR: { x: 92, y: 1205 },
      gripR: true,
    },
  },
  {
    t: 1.25,
    p: {
      lean: 0.16,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      handR: { x: 118, y: 1185 },
      gripR: true,
    },
  },
  {
    t: 2.0,
    p: {
      lean: 0.02,
      look: 'right',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      gripR: false,
      handL: { x: -75, y: 1245 },
      handR: { x: 75, y: 1245 },
      fistL: true,
      fistR: true,
    },
  },
  {
    t: 3.65,
    p: {
      lean: -0.04,
      look: 'front',
      mouth: 'grin',
      brow: 'raised',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handR: { x: 105, y: 1125 },
      pointR: true,
    },
  },
  {
    t: 4.3,
    p: {
      lean: -0.08,
      pointR: false,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      handL: { x: -102, y: 1120 },
      handR: { x: 102, y: 1120 },
      bendL: -1,
      bendR: -1,
      gripL: true,
      gripR: true,
    },
  },

  // Scene 2 (6–12s): Connects giant rulers into mega ramp, sets ball at top & releases
  {
    t: 6.2,
    p: {
      lean: 0.14,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'open',
      bendL: 1,
      bendR: 1,
      handL: { x: -62, y: 1210 },
      handR: { x: 105, y: 1110 },
    },
  },
  {
    t: 8.4,
    p: {
      lean: 0.12,
      look: 'right',
      mouth: 'smile',
      brow: 'cocky',
      handL: { x: -68, y: 1245 },
      handR: { x: 95, y: 1055 },
      gripL: false,
      gripR: true,
    },
  },
  {
    t: 9.0,
    p: {
      lean: 0.06,
      look: 'right',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'wide',
      gripR: false,
      handR: { x: 115, y: 1150 },
      pointR: true,
    },
  },

  // Scene 3 (12–18s): Runs after the ball through the open doorway into the garden!
  {
    t: 12.6,
    p: {
      lean: 0.22,
      pointR: false,
      look: 'right',
      mouth: 'o',
      brow: 'determined',
      eye: 'wide',
      handL: { x: -85, y: 1215 },
      handR: { x: 85, y: 1215 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 4 (18–24s): Outside in garden watching final ramp -> fence -> trampoline -> hoop!
  {
    t: 18.2,
    p: {
      lean: 0.04,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handL: { x: -88, y: 1200 },
      handR: { x: 96, y: 1165 },
    },
  },
  {
    t: 21.6,
    p: {
      lean: 0.14,
      crouch: 0.24,
      look: 'right',
      mouth: 'flat',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -45, y: 1185 },
      handR: { x: 52, y: 1185 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 5 (24–30s): Swish! Celebrates -> ruler collapses & flicks Stickman into empty basket!
  {
    t: 24.45,
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
    t: 26.85,
    p: {
      lean: -0.22,
      stance: 14,
      look: 'down',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handL: { x: -102, y: 1105 },
      handR: { x: 102, y: 1105 },
    },
  },
  {
    t: 27.35,
    p: {
      lean: -0.28,
      headTilt: -0.18,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -115, y: 1045 },
      handR: { x: 115, y: 1045 },
    },
  },
  {
    t: 28.45,
    p: {
      lean: 0,
      headTilt: 0,
      sit: 0.35,
      stance: 10,
      look: 'front',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      bendL: 1,
      bendR: 1,
      handL: { x: -64, y: 710 },
      handR: { x: 64, y: 710 },
      gripL: true,
      gripR: true,
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
  { from: 0.25, to: 5.75, text: 'I NEED A LONGER RULER!' },
  { from: 6.25, to: 11.75, text: 'THE LONGEST RULER EVER!' },
  { from: 12.25, to: 17.75, text: "DON'T STOP NOW!" },
  { from: 18.25, to: 23.75, text: 'THE FINAL SHOT!' },
  { from: 24.25, to: 29.85, text: 'I BECAME THE FINAL SHOT! 😂' },
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
  behindRim: boolean;
}

export class LongestRulerRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const camX = this.camXAt(time);
    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.walkPhase);
    const ball = this.ballAt(time);

    ctx.save();
    ctx.translate(-camX, 0);

    // 1. Living Room + Doorway + Garden Backdrop
    this.drawWorldBackground(ctx, time);

    // 2. Scene 1 Table & Cup
    this.drawScene1TableAndCup(ctx, time);

    // 3. Connected Giant Yellow Ruler Mega Ramp, Books, Trampoline & Collapsing Rulers
    this.drawSupportsAndRulers(ctx, time);
    this.drawGardenProps(ctx, time);

    // 4. Basketball Hoop Back (pole, backboard, back rim)
    this.drawHoopBack(ctx);

    // 5. Ball when falling inside net or Stickman when wedged inside net
    if (ball.behindRim) {
      this.drawOrangeBall(ctx, ball.x, ball.y, ball.rot);
    }

    // 6. Locked Angry Stickman (standing/running OR flying/wedged inside basket!)
    this.drawCharacter(ctx, ch, pose, time);

    // 7. Basketball Hoop Front Rim & Net (drawn over Stickman's lower legs when wedged in basket at 28.4s+)
    this.drawHoopFront(ctx, time);

    // 8. Orange Ball in open air / rulers / grass + Scene 1 held rulers
    if (!ball.behindRim) {
      this.drawOrangeBall(ctx, ball.x, ball.y, ball.rot);
    }
    this.drawHeldRulers(ctx, ch, time);

    // 9. FX (Idea spark, confetti)
    this.drawVisualFX(ctx, time, ch);

    ctx.restore();

    // 10. Screen-space Burned-in Scene Captions & Safe Zones
    this.drawCaptions(ctx, time);
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Camera, Character, Pose & Ball Timelines
  // -------------------------------------------------------------------------
  private camXAt(t: number): number {
    if (t < 8.8) return 0;
    if (t < 12.2) return lerp(0, 720, smooth(inv(8.8, 12.2, t)));
    if (t < 17.8) return lerp(720, 2160, smooth(inv(12.2, 17.8, t)));
    return 2160;
  }

  private charAt(t: number): CharState {
    let x = 235;
    let ground = FLOOR_Y;
    let lift = 0;
    let walkPhase = 0;

    if (t < 8.8) {
      x = 235;
    } else if (t < 12.2) {
      const k = smooth(inv(9.2, 12.2, t));
      x = lerp(235, 960, k);
      walkPhase = k * TAU * 4;
    } else if (t < 17.8) {
      const k = smooth(inv(12.2, 17.8, t));
      x = lerp(960, 2335, k);
      walkPhase = k * TAU * 7;
    } else if (t < 24.5) {
      x = 2335;
    } else if (t < 26.2) {
      x = 2335;
      const j = ((t - 24.5) * 2.4) % 1;
      lift = Math.sin(j * Math.PI) * 52;
    } else if (t < 27.15) {
      x = 2335;
    } else if (t < 28.4) {
      // Flicked cleanly by sliding yellow ruler straight into the empty basketball hoop!
      const u = inv(27.15, 28.4, t);
      x = lerp(2335, HOOP_RIM_X, u);
      const baseArcY = lerp(FLOOR_Y, HOOP_RIM_Y + 265, u) - Math.sin(u * Math.PI) * 540;
      ground = baseArcY;
    } else {
      // Seated/wedged inside the basketball hoop rim (hipY = HOOP_RIM_Y - 35 -> ground = HOOP_RIM_Y + 225)
      x = HOOP_RIM_X;
      ground = HOOP_RIM_Y + 220;
    }

    return { x, ground, lift, walkPhase };
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
      p.footLift += Math.max(0, w) * 38;
      p.stance += w * 18;
      p.handL.x += w * 22;
      p.handR.x -= w * 22;
    }

    return p;
  }

  private ballAt(t: number): BallState {
    // Scene 1 (0–6s): Small flick on table, barely moves!
    if (t < 1.25) {
      return { x: 400, y: 1212, rot: 0, behindRim: false };
    }
    if (t < 1.75) {
      const u = easeOut(inv(1.25, 1.75, t));
      return {
        x: lerp(400, 442, u),
        y: 1212 - Math.sin(u * Math.PI) * 18,
        rot: u * 2.1,
        behindRim: false,
      };
    }
    if (t < 6.0) {
      return { x: 442, y: 1212, rot: 2.1, behindRim: false };
    }

    // Scene 2 (6–12s): Placed at top of Giant Connected Ruler Ramp (330, 1042) & accelerates!
    if (t < 8.4) {
      const k = smooth(inv(6.0, 8.4, t));
      return {
        x: lerp(442, 330, k),
        y: lerp(1212, 1042, k) - Math.sin(k * Math.PI) * 80,
        rot: 2.1,
        behindRim: false,
      };
    }
    if (t < 9.0) {
      return { x: 330, y: 1042, rot: 2.1, behindRim: false };
    }
    if (t < 12.0) {
      // Accelerating continuously down Ruler A -> B -> C: (330, 1042) -> (1485, 1357)
      const u = inv(9.0, 12.0, t);
      const accel = u * u * 0.72 + u * 0.28;
      return {
        x: lerp(330, 1485, accel),
        y: lerp(1042, 1357, accel),
        rot: 2.1 + accel * 22,
        behindRim: false,
      };
    }

    // Scene 3 (12–18s): Flies off Ruler C -> bounces off Book Stack (1615, 1245) -> Doorway Ruler D -> Garden Book Stack!
    if (t < 12.85) {
      const u = inv(12.0, 12.85, t);
      return {
        x: lerp(1485, 1615, u),
        y: lerp(1357, 1085, u) - Math.sin(u * Math.PI) * 95,
        rot: 24.1 + u * 5,
        behindRim: false,
      };
    }
    if (t < 13.45) {
      const u = inv(12.85, 13.45, t);
      return {
        x: lerp(1615, 1685, u),
        y: lerp(1085, 1112, u) - Math.sin(u * Math.PI) * 45,
        rot: 29.1 + u * 4,
        behindRim: false,
      };
    }
    if (t < 15.6) {
      // Rolls fast down Ruler D straight through open doorway (1685, 1112) -> (2055, 1220)
      const u = inv(13.45, 15.6, t);
      return {
        x: lerp(1685, 2055, u),
        y: lerp(1112, 1220, u),
        rot: 33.1 + u * 14,
        behindRim: false,
      };
    }
    if (t < 16.55) {
      const u = inv(15.6, 16.55, t);
      return {
        x: lerp(2055, 2170, u),
        y: lerp(1220, 1255, u) - Math.sin(u * Math.PI) * 48,
        rot: 47.1 + u * 6,
        behindRim: false,
      };
    }
    if (t < 18.0) {
      const u = inv(16.55, 18.0, t);
      return {
        x: lerp(2170, 2245, u),
        y: lerp(1255, 1197, u) - Math.sin(u * Math.PI) * 75,
        rot: 53.1 + u * 6,
        behindRim: false,
      };
    }

    // Scene 4 (18–24s): Outside on Final Ruler E -> Fence -> Trampoline -> Skyward toward Tiny Hoop!
    if (t < 19.8) {
      const u = inv(18.0, 19.8, t);
      return {
        x: lerp(2245, 2515, u),
        y: lerp(1197, 1317, u),
        rot: 59.1 + u * 12,
        behindRim: false,
      };
    }
    if (t < 21.25) {
      // Launches over fence (x=2600) onto Trampoline (2785, 1435)
      const u = inv(19.8, 21.25, t);
      return {
        x: lerp(2515, 2785, u),
        y: lerp(1317, 1432, u) - Math.sin(u * Math.PI) * 285,
        rot: 71.1 + u * 10,
        behindRim: false,
      };
    }
    if (t < 24.0) {
      // Trampoline launches ball skyward toward tiny hoop (3015, 710)
      const u = inv(21.25, 24.0, t);
      return {
        x: lerp(2785, HOOP_RIM_X, smooth(u)),
        y: lerp(1432, HOOP_RIM_Y - 12, u) - Math.sin(u * Math.PI) * 340,
        rot: 81.1 + u * 14,
        behindRim: false,
      };
    }

    // Scene 5 (24–30s): Swishes through hoop (24.35s) & rests on grass, leaving basket empty!
    if (t < 24.4) {
      const u = inv(24.0, 24.4, t);
      return {
        x: HOOP_RIM_X,
        y: lerp(HOOP_RIM_Y - 12, HOOP_RIM_Y + 60, u),
        rot: 95.1 + u * 2,
        behindRim: true,
      };
    }
    if (t < 25.1) {
      const u = inv(24.4, 25.1, t);
      return {
        x: HOOP_RIM_X,
        y: lerp(HOOP_RIM_Y + 60, FLOOR_Y - BALL_R, u * u),
        rot: 97.1 + u * 3,
        behindRim: false,
      };
    }
    return {
      x: HOOP_RIM_X + 24,
      y: FLOOR_Y - BALL_R,
      rot: 100.5,
      behindRim: false,
    };
  }

  // -------------------------------------------------------------------------
  // Background, Doorway, Rulers, Book Stacks, Fence, Trampoline & Hoop
  // -------------------------------------------------------------------------
  private drawWorldBackground(ctx: CanvasRenderingContext2D, _t: number) {
    // 1. Living Room (0 .. 1970)
    ctx.fillStyle = ROOM_WALL;
    ctx.fillRect(0, 0, 1970, FLOOR_Y);

    ctx.fillStyle = ROOM_BAND;
    ctx.fillRect(0, 1150, 1970, FLOOR_Y - 1150);
    ctx.strokeStyle = '#d6cbba';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 1150);
    ctx.lineTo(1970, 1150);
    ctx.stroke();

    // Hardwood floor inside
    ctx.fillStyle = FLOOR_WOOD;
    ctx.fillRect(0, FLOOR_Y, 1970, HEIGHT - FLOOR_Y);
    ctx.strokeStyle = FLOOR_PLANK;
    ctx.lineWidth = 4;
    for (let fy = FLOOR_Y + 46; fy < HEIGHT; fy += 60) {
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.lineTo(1970, fy);
      ctx.stroke();
    }

    // 2. Sunny Garden (1970 .. 3300)
    ctx.fillStyle = GARDEN_SKY;
    ctx.fillRect(1970, 0, 1330, FLOOR_Y);

    // Bright cartoon sun & clouds
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(2980, 270, 68, 0, TAU);
    ctx.fill();
    ctx.stroke();

    const drawCloud = (cx: number, cy: number) => {
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 38, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(cx + 38, cy - 20, 44, Math.PI, Math.PI * 2);
      ctx.arc(cx + 82, cy, 36, Math.PI * 1.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    drawCloud(2280, 320);
    drawCloud(2630, 240);

    // Lush green grass
    ctx.fillStyle = GARDEN_GRASS;
    ctx.fillRect(1970, FLOOR_Y, 1330, HEIGHT - FLOOR_Y);
    ctx.fillStyle = GARDEN_TRIM;
    ctx.fillRect(1970, FLOOR_Y, 1330, 34);

    // Wall Divider & Open Doorway at x=1960..2010
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(1945, 0, 48, 760);
    ctx.fill();
    ctx.stroke();

    // Doorframe side trim
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.rect(1940, 748, 58, 22);
    ctx.fill();
    ctx.stroke();

    // Shared crisp floor horizon line
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(3300, FLOOR_Y);
    ctx.stroke();
  }

  private drawScene1TableAndCup(ctx: CanvasRenderingContext2D, _t: number) {
    // Table x=350..590, top y=1230
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(350, 1230, 240, 24, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    for (const lx of [375, 545]) {
      ctx.beginPath();
      ctx.rect(lx, 1254, 18, FLOOR_Y - 1254);
      ctx.fill();
      ctx.stroke();
    }

    // Small white cup at (540, 1230)
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.moveTo(514, 1172);
    ctx.lineTo(566, 1172);
    ctx.lineTo(558, 1230);
    ctx.lineTo(522, 1230);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawRulerSegment(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thickness = 22
  ) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(angle);

    ctx.fillStyle = RULER_YELLOW;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(0, -thickness / 2, len, thickness, 4);
    ctx.fill();
    ctx.stroke();

    // Black measurement tick markings along the top edge
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    for (let px = 16; px < len - 12; px += 18) {
      const h = px % 54 === 16 ? thickness * 0.55 : thickness * 0.34;
      ctx.beginPath();
      ctx.moveTo(px, -thickness / 2);
      ctx.lineTo(px, -thickness / 2 + h);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawBookStack(
    ctx: CanvasRenderingContext2D,
    cx: number,
    topY: number,
    bottomY: number,
    width = 96,
    collapseTilt = 0
  ) {
    const h = Math.max(24, bottomY - topY);
    const count = Math.max(1, Math.round(h / 32));
    const bookH = h / count;

    ctx.save();
    ctx.translate(cx, bottomY);
    ctx.rotate(collapseTilt);
    for (let i = 0; i < count; i++) {
      const y = -h + i * bookH;
      const w = width - (i % 2) * 8;
      ctx.fillStyle = BOOK_COLORS[i % BOOK_COLORS.length];
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-w / 2, y, w, bookH - 2, 5);
      ctx.fill();
      ctx.stroke();

      // White page edge stripe
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.rect(-w / 2 + 12, y + 6, w - 24, Math.max(4, bookH - 14));
      ctx.fill();
    }
    ctx.restore();
  }

  private drawSupportsAndRulers(ctx: CanvasRenderingContext2D, t: number) {
    // Mega ramp appears smoothly in Scene 2 (6.05s+) and collapses like dominoes in Scene 5 (26.05s+)
    if (t < 6.05) return;

    const collapse1 = smooth(inv(26.05, 26.55, t));
    const collapse2 = smooth(inv(26.35, 26.85, t));
    const slideForward = easeOut(inv(26.85, 27.3, t)) * 185;

    // Tall book stacks supporting Ruler A -> B -> C (interior)
    if (t < 18.0) {
      const popA = easeOut(inv(6.05, 6.55, t));
      if (popA > 0.01) {
        this.drawBookStack(ctx, 325, lerp(FLOOR_Y, 1068, popA), FLOOR_Y, 96);
        this.drawBookStack(ctx, 715, lerp(FLOOR_Y, 1178, popA), FLOOR_Y, 96);
        this.drawRulerSegment(ctx, 315, 1064, lerp(315, 715, popA), lerp(1064, 1174, popA));
      }

      const popB = easeOut(inv(6.6, 7.15, t));
      if (popB > 0.01) {
        this.drawBookStack(ctx, 1115, lerp(FLOOR_Y, 1288, popB), FLOOR_Y, 96);
        this.drawRulerSegment(ctx, 715, 1174, lerp(715, 1115, popB), lerp(1174, 1284, popB));
      }

      const popC = easeOut(inv(7.15, 7.75, t));
      if (popC > 0.01) {
        this.drawBookStack(ctx, 1465, lerp(FLOOR_Y, 1384, popC), FLOOR_Y, 96);
        this.drawRulerSegment(ctx, 1115, 1284, lerp(1115, 1485, popC), lerp(1284, 1378, popC));
      }
    }

    // Scene 3 Book Stack bounce + Doorway Ruler D
    if (t >= 7.75 && t < 26.0) {
      this.drawBookStack(ctx, 1615, 1105, FLOOR_Y, 110);
      this.drawBookStack(ctx, 1715, 1138, FLOOR_Y, 88);
      this.drawBookStack(ctx, 2035, 1244, FLOOR_Y, 88);
      this.drawRulerSegment(ctx, 1675, 1132, 2065, 1242);
      this.drawBookStack(ctx, 2170, 1274, FLOOR_Y, 98);
    }

    // Outdoor Final Giant Ruler E (2245, 1218 -> 2515, 1338) + collapse dominoes in Scene 5!
    const fallDrop = collapse2 * 165;
    const tiltLeft = collapse1 * 0.95;
    const tiltRight = collapse2 * 0.34;
    this.drawBookStack(ctx, 2260, 1230 + collapse1 * 180, FLOOR_Y, 94, tiltLeft);
    this.drawBookStack(ctx, 2480, 1344 + fallDrop * 0.4, FLOOR_Y, 86, tiltRight);

    // Ruler E slides forward & tips slightly upward at the front tip to flick Stickman at 27.15s!
    const rx1 = 2245 + slideForward;
    const ry1 = 1218 + fallDrop * 1.45;
    const rx2 = 2515 + slideForward;
    const ry2 = 1338 + collapse2 * 135 - easeOut(inv(27.0, 27.3, t)) * 65;
    this.drawRulerSegment(ctx, rx1, ry1, rx2, ry2, 24);
  }

  private drawHeldRulers(ctx: CanvasRenderingContext2D, ch: CharState, t: number) {
    // Small normal yellow ruler in Scene 1 (0.0s .. 2.35s)
    if (t < 2.4) {
      ctx.save();
      ctx.translate(ch.x + 88, 1205);
      ctx.rotate(t >= 1.2 && t < 1.65 ? -0.35 : 0.12);
      this.drawRulerSegment(ctx, -20, 0, 110, 0, 16);
      ctx.restore();
    }

    // Pulls out giant 600px yellow ruler at 3.9s .. 5.95s
    if (t >= 3.9 && t < 6.0) {
      const k = easeOut(inv(3.9, 4.5, t));
      ctx.save();
      ctx.translate(ch.x, 1135);
      ctx.scale(k, k);
      ctx.rotate(-0.08);
      this.drawRulerSegment(ctx, -280, 0, 320, 0, 24);
      ctx.restore();
    }
  }

  private drawGardenProps(ctx: CanvasRenderingContext2D, t: number) {
    // White Picket Fence at x=2595
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    for (const px of [2565, 2595, 2625]) {
      ctx.beginPath();
      ctx.moveTo(px - 10, FLOOR_Y);
      ctx.lineTo(px - 10, 1345);
      ctx.lineTo(px, 1322);
      ctx.lineTo(px + 10, 1345);
      ctx.lineTo(px + 10, FLOOR_Y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.rect(2548, 1385, 94, 16);
    ctx.fill();
    ctx.stroke();

    // Trampoline centered at x=2785, y=1445
    const trampDip =
      t >= 21.15 && t < 21.75 ? Math.sin(inv(21.15, 21.75, t) * Math.PI) * 26 : 0;

    ctx.fillStyle = '#334155';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    for (const lx of [2722, 2848]) {
      ctx.beginPath();
      ctx.rect(lx - 7, 1448, 14, FLOOR_Y - 1448);
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.ellipse(2785, 1445 + trampDip * 0.4, 78, 18 + trampDip * 0.25, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(2785, 1445 + trampDip * 0.65, 56, 11 + trampDip * 0.2, 0, 0, TAU);
    ctx.fill();
  }

  private drawHoopBack(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // Steel pole on right grass
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(3105, 640, 24, FLOOR_Y - 640);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(3082, FLOOR_Y - 40, 70, 40, 8);
    ctx.fill();
    ctx.stroke();

    // Support arm
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.rect(3070, 650, 42, 18);
    ctx.fill();
    ctx.stroke();

    // White & red backboard
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.roundRect(3060, 560, 24, 185, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.rect(3062, 608, 20, 92);
    ctx.fill();
    ctx.stroke();

    // Back rim bar
    ctx.strokeStyle = INK;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(HOOP_RIM_X - 56, HOOP_RIM_Y);
    ctx.lineTo(3060, HOOP_RIM_Y);
    ctx.stroke();
    ctx.restore();
  }

  private drawHoopFront(ctx: CanvasRenderingContext2D, t: number) {
    const ballSway = t >= 24.3 && t < 24.95 ? Math.sin((t - 24.3) * 24) * 14 : 0;
    const stickSway = t >= 28.35 && t < 29.2 ? Math.sin((t - 28.35) * 18) * 10 : 0;
    const sway = ballSway + stickSway;

    ctx.save();
    // White mesh net
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const tx = lerp(HOOP_RIM_X - 48, HOOP_RIM_X + 42, i / 4);
      const bx = lerp(HOOP_RIM_X - 30, HOOP_RIM_X + 26, i / 4) + sway;
      ctx.moveTo(tx, HOOP_RIM_Y + 4);
      ctx.lineTo(bx, HOOP_RIM_Y + 95);
    }
    ctx.moveTo(HOOP_RIM_X - 42 + sway * 0.4, HOOP_RIM_Y + 46);
    ctx.lineTo(HOOP_RIM_X + 36 + sway * 0.4, HOOP_RIM_Y + 46);
    ctx.moveTo(HOOP_RIM_X - 34 + sway * 0.8, HOOP_RIM_Y + 76);
    ctx.lineTo(HOOP_RIM_X + 30 + sway * 0.8, HOOP_RIM_Y + 76);
    ctx.stroke();

    // Front orange rim bar
    ctx.strokeStyle = INK;
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(HOOP_RIM_X - 56, HOOP_RIM_Y);
    ctx.lineTo(3060, HOOP_RIM_Y);
    ctx.stroke();

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(HOOP_RIM_X - 56, HOOP_RIM_Y);
    ctx.lineTo(3060, HOOP_RIM_Y);
    ctx.stroke();
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

    ctx.fillStyle = BALL_HIGHLIGHT;
    ctx.beginPath();
    ctx.arc(-5, -6, 5, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawVisualFX(ctx: CanvasRenderingContext2D, t: number, ch: CharState) {
    // Lightbulb spark at 3.65s
    if (t >= 3.65 && t < 4.75) {
      const k = easeOut(inv(3.65, 3.9, t)) * (1 - inv(4.45, 4.75, t));
      ctx.save();
      ctx.translate(ch.x, 960);
      ctx.scale(k, k);
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Swish celebration confetti (24.4s .. 26.1s)
    if (t >= 24.4 && t < 26.1) {
      const k = inv(24.4, 26.1, t);
      const colors = ['#facc15', '#38bdf8', '#ef4444', '#4ade80'];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + k * 1.5;
        const dist = 48 + Math.sin(k * Math.PI) * 115;
        ctx.save();
        ctx.translate(HOOP_RIM_X + Math.cos(a) * dist, HOOP_RIM_Y - 30 + Math.sin(a) * dist * 0.6);
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
  private drawCharacter(ctx: CanvasRenderingContext2D, ch: CharState, pose: Pose, t: number) {
    const baseY = ch.ground - ch.lift;
    const hipY = baseY - (300 - 150 * pose.crouch - 170 * pose.sit);
    const arms = this.computeArms(pose, ch.x, hipY, t);

    if (ch.lift < 16 && pose.sit < 0.5 && ch.ground === FLOOR_Y) {
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

  private computeArms(pose: Pose, x: number, hipY: number, t: number): { l: Arm; r: Arm } {
    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(pose.lean) * 170;
    const headCx = bodyTopX + Math.sin(pose.headTilt) * 12;
    const headCy = shoulderY - 20 - HEAD_R + pose.headDrop;
    const handClear = HEAD_R + 26;
    const elbowClear = HEAD_R + 30;
    const airborneOffset = t >= 27.15 && t < 28.4 ? hipY - 1200 : 0;

    const solve = (side: -1 | 1, target: Pt, bend: 1 | -1): Arm => {
      const sx = bodyTopX + side * 36;
      const sy = shoulderY;
      let hx = x + target.x;
      let hy = target.y + (t >= 27.15 && t < 28.4 ? airborneOffset : 0);
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
