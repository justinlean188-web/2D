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

// --- Arcade & Pinball Palette (Modern Pop 2D Flat Vector) -------------------
const ROOM_WALL = '#eef2ff';
const ROOM_BAND = '#e0e7ff';
const FLOOR_TILE = '#cbd5e1';
const FLOOR_LINE = '#94a3b8';

const CABINET_BLUE = '#2563eb';
const CABINET_DARK = '#1e3a8a';
const CABINET_TRIM = '#facc15';
const PLAYFIELD_BG = '#0f172a';
const PLAYFIELD_INNER = '#1e293b';
const BUMPER_RED = '#ef4444';
const BUMPER_CORE = '#fef08a';
const FLIPPER_YELLOW = '#facc15';
const SPINNER_PURPLE = '#a855f7';
const SPINNER_ORANGE = '#f97316';
const PLATFORM_CYAN = '#06b6d4';
const TARGET_CYAN = '#22d3ee';
const SILVER_LIGHT = '#f8fafc';
const SILVER_MID = '#94a3b8';

const FLOOR_Y = 1520;
const HEAD_R = 70;
const BALL_R = 16;

// --- Static Playfield Landmarks ---------------------------------------------
const B1 = { x: 545, y: 610, r: 42 };
const B2 = { x: 770, y: 565, r: 42 };
const B3 = { x: 670, y: 775, r: 42 };
const SPIN1 = { x: 820, y: 725, r: 54 };
const SPIN2 = { x: 540, y: 880, r: 54 };
const RING_POS = { x: 675, y: 475, r: 52 };
const TARGET_HOLE = { x: 855, y: 905, r: 28 };
const FLIP_L = { x: 505, y: 1210 };
const FLIP_R = { x: 775, y: 1210 };
const PRIZE_SLOT = { x: 845, y: 1215, w: 130, h: 130 };

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
type EyeShape = 'open' | 'wide' | 'squint' | 'shut' | 'happy' | 'dizzy';
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
  crouch: 0,
  sit: 0,
};

const POSE_PATCHES: { t: number; p?: PosePatch }[] = [
  // Scene 1 (0–6s): Holds silver ball -> drops in launcher -> pulls plunger -> bonked on forehead!
  {
    t: 0.0,
    p: {
      lean: 0.04,
      look: 'right',
      mouth: 'grin',
      brow: 'cocky',
      eye: 'open',
      handL: { x: -64, y: 1255 },
      handR: { x: 84, y: 1170 },
      gripR: true,
    },
  },
  {
    t: 1.1,
    p: {
      lean: 0.14,
      look: 'right',
      mouth: 'smile',
      brow: 'determined',
      handR: { x: 145, y: 1135 },
      gripR: true,
    },
  },
  {
    t: 1.75,
    p: {
      lean: -0.06,
      crouch: 0.18,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      handR: { x: 115, y: 1230 },
      gripR: true,
    },
  },
  {
    t: 2.35,
    p: {
      lean: 0.1,
      crouch: 0.0,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      gripR: false,
      handR: { x: 112, y: 1165 },
    },
  },
  {
    t: 3.78,
    p: {
      lean: -0.24,
      headTilt: -0.22,
      headDrop: 8,
      look: 'front',
      mouth: 'o',
      brow: 'uneven',
      eye: 'dizzy',
      handL: { x: -82, y: 1190 },
      handR: { x: 82, y: 1190 },
    },
  },
  {
    t: 4.85,
    p: {
      lean: 0.02,
      headTilt: 0.02,
      headDrop: 0,
      look: 'right',
      mouth: 'frown',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -72, y: 1245 },
      handR: { x: 72, y: 1245 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 2 (6–12s): Picks up ball -> loads -> launches 3-bumper combo -> groans at near-miss!
  {
    t: 6.0,
    p: {
      lean: 0.12,
      crouch: 0.35,
      fistL: false,
      fistR: false,
      look: 'down',
      mouth: 'grit',
      brow: 'determined',
      eye: 'open',
      handR: { x: 90, y: 1410 },
      gripR: true,
    },
  },
  {
    t: 6.75,
    p: {
      lean: 0.1,
      crouch: 0.08,
      look: 'right',
      mouth: 'smile',
      brow: 'determined',
      handR: { x: 138, y: 1135 },
      gripR: true,
    },
  },
  {
    t: 7.45,
    p: {
      lean: 0.06,
      crouch: 0.0,
      look: 'right',
      mouth: 'grin',
      brow: 'raised',
      eye: 'wide',
      gripR: false,
      handR: { x: 108, y: 1170 },
    },
  },
  {
    t: 10.95,
    p: {
      lean: 0.04,
      look: 'right',
      mouth: 'frown',
      brow: 'angry',
      eye: 'wide',
      handL: { x: -74, y: 1235 },
      handR: { x: 74, y: 1235 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 3 (12–18s): Hits UPGRADE button -> pulls plunger -> cheers as ball speeds up!
  {
    t: 12.1,
    p: {
      lean: 0.14,
      fistL: false,
      look: 'right',
      mouth: 'grin',
      brow: 'determined',
      eye: 'open',
      handR: { x: 130, y: 1040 },
      fistR: true,
    },
  },
  {
    t: 13.0,
    p: {
      lean: -0.05,
      crouch: 0.14,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      fistR: false,
      handR: { x: 112, y: 1225 },
      gripR: true,
    },
  },
  {
    t: 13.9,
    p: {
      lean: 0.05,
      crouch: 0.0,
      look: 'right',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'wide',
      gripR: false,
      handL: { x: -95, y: 1090 },
      handR: { x: 95, y: 1090 },
      bendL: -1,
      bendR: -1,
      fistL: true,
      fistR: true,
    },
  },

  // Scene 4 (18–24s): Slams yellow FLIPPER button -> holds breath watching spinning ring & drop!
  {
    t: 18.2,
    p: {
      lean: 0.15,
      crouch: 0.12,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'wide',
      handL: { x: -64, y: 1255 },
      handR: { x: 135, y: 1110 },
      bendL: 1,
      bendR: 1,
      fistL: false,
      fistR: true,
    },
  },
  {
    t: 19.3,
    p: {
      lean: 0.14,
      crouch: 0.2,
      look: 'right',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -56, y: 1205 },
      handR: { x: 56, y: 1205 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 5 (24–30s): Ball scores! Celebrates -> launched into machine -> bounces 3 bumpers -> stuck in Prize Slot!
  {
    t: 24.15,
    p: {
      lean: 0,
      crouch: 0,
      stance: 22,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      handL: { x: -115, y: 1030 },
      handR: { x: 115, y: 1030 },
      bendL: -1,
      bendR: -1,
      fistL: true,
      fistR: true,
    },
  },
  {
    t: 25.85,
    p: {
      lean: 0.1,
      crouch: 0.35,
      stance: 10,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handL: { x: -95, y: 1080 },
      handR: { x: 95, y: 1080 },
      bendL: -1,
      bendR: -1,
    },
  },
  {
    t: 28.55,
    p: {
      lean: 0,
      crouch: 0.45,
      sit: 0.6,
      stance: 0,
      look: 'front',
      mouth: 'frown',
      brow: 'angry',
      eye: 'dizzy',
      handL: { x: -82, y: 1175 },
      handR: { x: 82, y: 1175 },
      bendL: 1,
      bendR: 1,
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
  { from: 0.25, to: 5.75, text: "LET'S MAKE THE IMPOSSIBLE SHOT!" },
  { from: 6.25, to: 11.75, text: 'THREE PERFECT BOUNCES!' },
  { from: 12.25, to: 17.75, text: 'MAXIMUM PINBALL POWER!' },
  { from: 18.25, to: 23.75, text: 'ONE LAST BOUNCE!' },
  { from: 24.25, to: 29.85, text: "I'M THE JACKPOT! 😂" },
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
  inMachine: boolean;
  inPrizeSlot: boolean;
}

interface BallState {
  x: number;
  y: number;
  rot: number;
  visible: boolean;
}

export class ImpossiblePinballRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const ch = this.charAt(time);
    const pose = this.poseAt(time);
    const ball = this.ballAt(time);
    const shake = this.impactShake(time);

    ctx.save();
    ctx.translate(shake.x, shake.y);

    // 1. Arcade Room Backdrop
    this.drawRoomBackdrop(ctx);

    // 2. Giant Pinball Machine Cabinet Body, Marquee, Legs & Side Controls
    this.drawCabinetBack(ctx, time);

    // 3. Playfield Interior: Bumpers, Spinners, Moving Platforms, Spinning Ring, Glowing Target Hole, Flippers, Prize Slot
    this.drawPlayfield(ctx, time);

    // 4. Shiny Silver Ball (inside playfield or bouncing outside)
    if (ball.visible) {
      this.drawSilverBall(ctx, ball.x, ball.y, ball.rot);
    }

    // 5. Stickman (outside left, flying through machine bumpers, or wedged inside Prize Slot!)
    this.drawCharacterLayer(ctx, ch, pose, time);

    // 6. Front Prize Slot Lip & Hinged Flap + Cabinet Glass Highlights
    this.drawCabinetFrontDetails(ctx, time);

    // 7. Visual Collision Ripples & WIN Confetti
    this.drawVisualFX(ctx, time);

    ctx.restore();

    // 8. Burned-In Captions & Safe Zones (screen space, unshaken)
    this.drawCaptions(ctx, time);
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Exact Moving Platform Coordinates (Shared Between Physics & Rendering)
  // -------------------------------------------------------------------------
  private platform1X(t: number): number {
    if (t < 12.4) return 580;
    return 610 + Math.sin((t - 12.4) * 2.8) * 68;
  }

  private platform2X(t: number): number {
    if (t < 12.4) return 760;
    return 760 - Math.sin((t - 12.4) * 2.8) * 68;
  }

  private impactShake(t: number): Pt {
    const impacts = [3.78, 8.55, 9.15, 9.75, 14.05, 14.55, 15.05, 16.15, 21.35, 24.15, 25.85, 26.55, 27.15, 27.75, 28.55];
    for (const mark of impacts) {
      if (t >= mark && t < mark + 0.16) {
        const u = 1 - inv(mark, mark + 0.16, t);
        return {
          x: Math.sin(t * 95) * 7 * u,
          y: Math.cos(t * 115) * 7 * u,
        };
      }
    }
    return { x: 0, y: 0 };
  }

  // -------------------------------------------------------------------------
  // Character Timeline (Standing Left -> Celebrates -> Launched Into Machine!)
  // -------------------------------------------------------------------------
  private charAt(t: number): CharState {
    if (t < 24.15) {
      return { x: 175, ground: FLOOR_Y, lift: 0, rot: 0, inMachine: false, inPrizeSlot: false };
    }
    if (t < 25.8) {
      // Victory dance!
      const u = (t - 24.15) * 3.0;
      const bounce = Math.abs(Math.sin(u * Math.PI)) * 52;
      return {
        x: 175 + Math.sin(u * 3.2) * 14,
        ground: FLOOR_Y,
        lift: bounce,
        rot: 0,
        inMachine: false,
        inPrizeSlot: false,
      };
    }
    // 25.80–26.55s: Spring ejector launches Stickman straight up into Giant Red Bumper 1!
    if (t < 26.55) {
      const u = inv(25.8, 26.55, t);
      const cx = lerp(175, B1.x, u);
      const cy = lerp(1280, B1.y + 85, u) - Math.sin(u * Math.PI) * 190;
      return {
        x: cx,
        ground: cy + 250,
        lift: 0,
        rot: u * 4.2,
        inMachine: true,
        inPrizeSlot: false,
      };
    }
    // 26.55–27.15s: Bounces off Giant Bumper 1 -> Giant Bumper 2!
    if (t < 27.15) {
      const u = inv(26.55, 27.15, t);
      const cx = lerp(B1.x, B2.x, u);
      const cy = lerp(B1.y + 85, B2.y + 85, u) - Math.sin(u * Math.PI) * 75;
      return {
        x: cx,
        ground: cy + 250,
        lift: 0,
        rot: 4.2 + u * 3.8,
        inMachine: true,
        inPrizeSlot: false,
      };
    }
    // 27.15–27.75s: Bounces off Giant Bumper 2 -> Giant Bumper 3!
    if (t < 27.75) {
      const u = inv(27.15, 27.75, t);
      const cx = lerp(B2.x, B3.x, u);
      const cy = lerp(B2.y + 85, B3.y + 85, u) - Math.sin(u * Math.PI) * 45;
      return {
        x: cx,
        ground: cy + 250,
        lift: 0,
        rot: 8.0 + u * 3.5,
        inMachine: true,
        inPrizeSlot: false,
      };
    }
    // 27.75–28.55s: Ricochets off Giant Bumper 3 straight into Prize Slot!
    if (t < 28.55) {
      const u = inv(27.75, 28.55, t);
      const cx = lerp(B3.x, 910, u);
      const cy = lerp(B3.y + 85, 1300, u) - Math.sin(u * Math.PI) * 90;
      return {
        x: cx,
        ground: cy + 250,
        lift: 0,
        rot: 11.5 + u * 1.06, // settles cleanly near upright (~2 turns)
        inMachine: true,
        inPrizeSlot: false,
      };
    }
    // 28.55–30.0s: Wedged visibly inside the Prize Slot!
    return {
      x: 910,
      ground: 1580,
      lift: 0,
      rot: 0.08,
      inMachine: true,
      inPrizeSlot: true,
    };
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
  // Silver Ball Physics Timeline (Every Collision Hits Exact Object Edge)
  // -------------------------------------------------------------------------
  private ballAt(t: number): BallState {
    // Scene 1 (0–6s): Held -> dropped in launcher -> shoots over arch -> misses all -> bonks forehead (3.78s)!
    if (t < 1.1) {
      return { x: 259, y: 1170, rot: 0, visible: true };
    }
    if (t < 1.75) {
      const k = smooth(inv(1.1, 1.75, t));
      return { x: lerp(259, 378, k), y: lerp(1170, 1142, k), rot: k * 2, visible: true };
    }
    if (t < 2.35) {
      const pull = smooth(inv(1.75, 2.25, t));
      return { x: 378, y: lerp(1142, 1218, pull), rot: 2, visible: true };
    }
    if (t < 2.72) {
      const u = inv(2.35, 2.72, t);
      return { x: 378, y: lerp(1218, 430, u), rot: 2 + u * 10, visible: true };
    }
    if (t < 3.15) {
      // Smooth top arch around bumpers (missing all!)
      const u = inv(2.72, 3.15, t);
      const ang = lerp(Math.PI, 0, u);
      return {
        x: 660 + Math.cos(ang) * 282,
        y: 430 - Math.sin(ang) * 72,
        rot: 12 + u * 10,
        visible: true,
      };
    }
    if (t < 3.55) {
      // Swoops diagonally across side rail out the left return slot (340, 1015)
      const u = inv(3.15, 3.55, t);
      return {
        x: lerp(942, 340, u),
        y: lerp(430, 1015, u) + Math.sin(u * Math.PI) * 145,
        rot: 22 + u * 10,
        visible: true,
      };
    }
    if (t < 3.78) {
      // Shoots straight into Stickman's forehead at (185, 1035)!
      const u = inv(3.55, 3.78, t);
      return { x: lerp(340, 185, u), y: lerp(1015, 1035, u), rot: 32 + u * 6, visible: true };
    }
    if (t < 4.45) {
      // Drops off forehead onto the floor at (265, FLOOR_Y - BALL_R)
      const u = inv(3.78, 4.45, t);
      return {
        x: lerp(185, 265, u),
        y: lerp(1035, FLOOR_Y - BALL_R, u * u) - Math.sin(u * Math.PI) * 65,
        rot: 38 + u * 8,
        visible: true,
      };
    }
    if (t < 6.0) {
      return { x: 265, y: FLOOR_Y - BALL_R, rot: 46, visible: true };
    }

    // Scene 2 (6–12s): Picked up -> Launch 2 -> hits B1(8.55) -> B2(9.15) -> B3(9.75) -> Wall(10.30) -> Rim miss(10.85) -> Drain
    if (t < 6.85) {
      const k = smooth(inv(6.0, 6.85, t));
      return { x: lerp(265, 378, k), y: lerp(FLOOR_Y - BALL_R, 1142, k), rot: 46, visible: true };
    }
    if (t < 7.45) {
      const pull = smooth(inv(6.85, 7.35, t));
      return { x: 378, y: lerp(1142, 1218, pull), rot: 46, visible: true };
    }
    if (t < 7.85) {
      const u = inv(7.45, 7.85, t);
      return { x: 378, y: lerp(1218, 430, u), rot: 46 + u * 10, visible: true };
    }
    if (t < 8.55) {
      // Over arch straight onto Red Bumper 1 top edge
      const u = inv(7.85, 8.55, t);
      return {
        x: lerp(378, B1.x, u),
        y: lerp(430, B1.y - B1.r - BALL_R, u) - Math.sin(u * Math.PI) * 58,
        rot: 56 + u * 12,
        visible: true,
      };
    }
    if (t < 9.15) {
      // B1 -> Red Bumper 2 left edge
      const u = inv(8.55, 9.15, t);
      return {
        x: lerp(B1.x, B2.x - B2.r - BALL_R, u),
        y: lerp(B1.y - B1.r - BALL_R, B2.y, u) - Math.sin(u * Math.PI) * 45,
        rot: 68 + u * 10,
        visible: true,
      };
    }
    if (t < 9.75) {
      // B2 -> Red Bumper 3 upper-right edge
      const u = inv(9.15, 9.75, t);
      return {
        x: lerp(B2.x - B2.r - BALL_R, B3.x + 36, u),
        y: lerp(B2.y, B3.y - 42, u),
        rot: 78 + u * 10,
        visible: true,
      };
    }
    if (t < 10.3) {
      // B3 -> Right wall rail (978, 825)
      const u = inv(9.75, 10.3, t);
      return {
        x: lerp(B3.x + 36, 978, u),
        y: lerp(B3.y - 42, 825, u),
        rot: 88 + u * 10,
        visible: true,
      };
    }
    if (t < 10.85) {
      // Right wall -> narrowly grazes Glowing Target Hole outer rim (822, 888)
      const u = inv(10.3, 10.85, t);
      return {
        x: lerp(978, TARGET_HOLE.x - 33, u),
        y: lerp(825, TARGET_HOLE.y - 18, u),
        rot: 98 + u * 8,
        visible: true,
      };
    }
    if (t < 11.8) {
      // Misses past rim and rolls down to bottom drain
      const u = inv(10.85, 11.8, t);
      return {
        x: lerp(TARGET_HOLE.x - 33, 640, u),
        y: lerp(TARGET_HOLE.y - 18, 1345, u),
        rot: 106 + u * 10,
        visible: true,
      };
    }

    // Scene 3 (12–18s): Auto-feeds launcher -> Launch 3 (13.20) -> B1(14.05) -> S1(14.55) -> B3(15.05) -> P1(15.60) -> S2(16.15) -> P2(16.70) -> Wall(17.25) -> Left Flipper!
    if (t < 12.8) {
      const u = smooth(inv(12.2, 12.8, t));
      return { x: lerp(640, 378, u), y: lerp(1345, 1142, u), rot: 116, visible: true };
    }
    if (t < 13.2) {
      const pull = smooth(inv(12.8, 13.15, t));
      return { x: 378, y: lerp(1142, 1218, pull), rot: 116, visible: true };
    }
    if (t < 13.6) {
      const u = inv(13.2, 13.6, t);
      return { x: 378, y: lerp(1218, 430, u), rot: 116 + u * 12, visible: true };
    }
    if (t < 14.05) {
      const u = inv(13.6, 14.05, t);
      return {
        x: lerp(378, B1.x, u),
        y: lerp(430, B1.y - B1.r - BALL_R, u) - Math.sin(u * Math.PI) * 52,
        rot: 128 + u * 12,
        visible: true,
      };
    }
    if (t < 14.55) {
      const u = inv(14.05, 14.55, t);
      return {
        x: lerp(B1.x, SPIN1.x - 44, u),
        y: lerp(B1.y - B1.r - BALL_R, SPIN1.y - 26, u),
        rot: 140 + u * 14,
        visible: true,
      };
    }
    if (t < 15.05) {
      const u = inv(14.55, 15.05, t);
      return {
        x: lerp(SPIN1.x - 44, B3.x + 34, u),
        y: lerp(SPIN1.y - 26, B3.y - 36, u),
        rot: 154 + u * 14,
        visible: true,
      };
    }
    const p1HitX = this.platform1X(15.6);
    if (t < 15.6) {
      const u = inv(15.05, 15.6, t);
      return {
        x: lerp(B3.x + 34, p1HitX, u),
        y: lerp(B3.y - 36, 1000, u),
        rot: 168 + u * 16,
        visible: true,
      };
    }
    if (t < 16.15) {
      const u = inv(15.6, 16.15, t);
      return {
        x: lerp(p1HitX, SPIN2.x + 38, u),
        y: lerp(1000, SPIN2.y - 22, u),
        rot: 184 + u * 16,
        visible: true,
      };
    }
    const p2HitX = this.platform2X(16.7);
    if (t < 16.7) {
      const u = inv(16.15, 16.7, t);
      return {
        x: lerp(SPIN2.x + 38, p2HitX, u),
        y: lerp(SPIN2.y - 22, 1060, u),
        rot: 200 + u * 18,
        visible: true,
      };
    }
    if (t < 17.25) {
      const u = inv(16.7, 17.25, t);
      return {
        x: lerp(p2HitX, 978, u),
        y: lerp(1060, 1020, u) - Math.sin(u * Math.PI) * 35,
        rot: 218 + u * 18,
        visible: true,
      };
    }
    if (t < 18.42) {
      // Slides cleanly down onto Left Yellow Flipper tip!
      const u = inv(17.25, 18.42, t);
      return {
        x: lerp(978, 565, u),
        y: lerp(1020, 1216, u),
        rot: 236 + u * 16,
        visible: true,
      };
    }

    // Scene 4 (18–24s): Left Flipper launches (18.42) -> passes through Spinning Ring (19.65) -> One Last Bounce off B2 (21.35) -> drops into Glowing Target Hole (24.15)!
    if (t < 19.65) {
      const u = inv(18.42, 19.65, t);
      return {
        x: lerp(565, RING_POS.x, u),
        y: lerp(1216, RING_POS.y, u) - Math.sin(u * Math.PI) * 45,
        rot: 252 + u * 22,
        visible: true,
      };
    }
    if (t < 21.35) {
      const u = inv(19.65, 21.35, t);
      return {
        x: lerp(RING_POS.x, B2.x + 28, u),
        y: lerp(RING_POS.y, B2.y - B2.r - BALL_R, u) - Math.sin(u * Math.PI) * 75,
        rot: 274 + u * 14,
        visible: true,
      };
    }
    if (t < 24.15) {
      // Dramatic slow-motion descent toward the tiny Glowing Target Hole!
      const u = inv(21.35, 24.15, t);
      return {
        x: lerp(B2.x + 28, TARGET_HOLE.x, smooth(u)),
        y: lerp(B2.y - B2.r - BALL_R, TARGET_HOLE.y, u) - Math.sin(u * Math.PI) * 95,
        rot: 288 + u * 12,
        visible: true,
      };
    }

    // Scene 5 (24–30s): Locked cleanly inside the Glowing Target Hole!
    return { x: TARGET_HOLE.x, y: TARGET_HOLE.y, rot: 300, visible: false };
  }

  // -------------------------------------------------------------------------
  // Scene Environment & Giant Pinball Machine Rendering
  // -------------------------------------------------------------------------
  private drawRoomBackdrop(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = ROOM_WALL;
    ctx.fillRect(0, 0, WIDTH, FLOOR_Y);

    ctx.fillStyle = ROOM_BAND;
    ctx.fillRect(0, 1220, WIDTH, FLOOR_Y - 1220);
    ctx.strokeStyle = '#c7d2fe';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 1220);
    ctx.lineTo(WIDTH, 1220);
    ctx.stroke();

    // Clean arcade wall stripe accents
    ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.fillRect(55, 0, 75, 1220);
    ctx.fillRect(210, 0, 35, 1220);

    // Arcade floor
    ctx.fillStyle = FLOOR_TILE;
    ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);
    ctx.strokeStyle = FLOOR_LINE;
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

  private drawCabinetBack(ctx: CanvasRenderingContext2D, t: number) {
    // Arcade cabinet sturdy legs
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    for (const lx of [355, 935]) {
      ctx.beginPath();
      ctx.roundRect(lx, 1365, 42, FLOOR_Y - 1365, 6);
      ctx.fill();
      ctx.stroke();
    }

    // Main Giant Pinball Machine Outer Cabinet (310..1030, y=185..1380)
    ctx.fillStyle = CABINET_BLUE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(310, 185, 720, 1195, 28);
    ctx.fill();
    ctx.stroke();

    // Yellow arcade trim stripe
    ctx.fillStyle = CABINET_TRIM;
    ctx.beginPath();
    ctx.roundRect(326, 200, 688, 1165, 22);
    ctx.fill();
    ctx.stroke();

    // Deep blue playfield surround
    ctx.fillStyle = CABINET_DARK;
    ctx.beginPath();
    ctx.roundRect(338, 212, 664, 1141, 16);
    ctx.fill();
    ctx.stroke();

    // Top Marquee Sign Header (y=218..328)
    const isWin = t >= 24.15;
    const flash = isWin && Math.floor(t * 8) % 2 === 0;
    ctx.fillStyle = isWin ? (flash ? '#ef4444' : '#facc15') : '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(354, 222, 632, 98, 14);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.font = '900 58px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 10;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    const signText = t >= 28.55 ? 'JACKPOT!' : isWin ? 'WIN!! 🎉' : 'SUPER PINBALL';
    ctx.strokeText(signText, 670, 272);
    ctx.fillStyle = isWin ? WHITE : '#facc15';
    ctx.fillText(signText, 670, 272);
    ctx.restore();

    // Side Cabinet Controls for Stickman (Left edge x=310):
    // 1. Cyan UPGRADE Button (y=1040)
    const upgLit = t >= 12.4;
    const upgPush = t >= 12.32 && t < 12.55 ? 10 : 0;
    ctx.fillStyle = upgLit ? '#22d3ee' : '#a855f7';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(288 + upgPush, 1020, 26 - upgPush * 0.4, 42, 8);
    ctx.fill();
    ctx.stroke();

    // 2. Yellow FLIPPER Button (y=1110)
    const flipPush = t >= 18.35 && t < 18.6 ? 10 : 0;
    ctx.fillStyle = FLIPPER_YELLOW;
    ctx.beginPath();
    ctx.roundRect(288 + flipPush, 1090, 26 - flipPush * 0.4, 42, 8);
    ctx.fill();
    ctx.stroke();

    // 3. External Red Plunger Handle (pull-back synced with launcher windows!)
    const pull1 = t >= 1.75 && t < 2.35 ? smooth(inv(1.75, 2.25, t)) : 0;
    const pull2 = t >= 6.85 && t < 7.45 ? smooth(inv(6.85, 7.35, t)) : 0;
    const pull3 = t >= 12.8 && t < 13.2 ? smooth(inv(12.8, 13.15, t)) : 0;
    const pull = Math.max(pull1, pull2, pull3);
    const leverY = 1175 + pull * 65;

    ctx.strokeStyle = SILVER_MID;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(286, leverY);
    ctx.lineTo(345, leverY);
    ctx.stroke();

    ctx.fillStyle = BUMPER_RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(282, leverY, 18, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private drawPlayfield(ctx: CanvasRenderingContext2D, t: number) {
    // Playfield background board
    ctx.fillStyle = PLAYFIELD_BG;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(348, 336, 644, 1012, 16);
    ctx.fill();
    ctx.stroke();

    // Decorative diagonal arcade stripes inside playfield
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(348, 336, 644, 1012, 16);
    ctx.clip();

    ctx.fillStyle = PLAYFIELD_INNER;
    ctx.beginPath();
    ctx.moveTo(348, 460);
    ctx.lineTo(992, 336);
    ctx.lineTo(992, 540);
    ctx.lineTo(348, 664);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(348, 860);
    ctx.lineTo(992, 740);
    ctx.lineTo(992, 920);
    ctx.lineTo(348, 1040);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Left Plunger Lane Divider Rail & Top Entry Curve Guide
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(408, 435);
    ctx.lineTo(408, 1255);
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(404, 435);
    ctx.lineTo(404, 1255);
    ctx.stroke();

    // Internal Plunger Spring & Rod at (378, 1158..1310)
    const pull1 = t >= 1.75 && t < 2.35 ? smooth(inv(1.75, 2.25, t)) : 0;
    const pull2 = t >= 6.85 && t < 7.45 ? smooth(inv(6.85, 7.35, t)) : 0;
    const pull3 = t >= 12.8 && t < 13.2 ? smooth(inv(12.8, 13.15, t)) : 0;
    const plungerTop = 1160 + Math.max(pull1, pull2, pull3) * 76;

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const sy = lerp(plungerTop + 14, 1325, i / 6);
      const sx = 378 + (i % 2 === 0 ? -10 : 10);
      if (i === 0) ctx.moveTo(378, plungerTop + 14);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    ctx.fillStyle = FLIPPER_YELLOW;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(360, plungerTop, 36, 18, 4);
    ctx.fill();
    ctx.stroke();

    // Left Side Ball-Return Chute Opening (Scene 1 escape slot)
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(334, 985, 24, 62, 6);
    ctx.fill();
    ctx.stroke();

    // Glowing Target Hole (ALWAYS visible throughout all 5 scenes!)
    const holePulse = 1 + Math.sin(t * 6) * 0.08;
    const ballInHole = t >= 24.15;
    ctx.save();
    ctx.translate(TARGET_HOLE.x, TARGET_HOLE.y);
    ctx.fillStyle = ballInHole ? 'rgba(250, 204, 21, 0.35)' : 'rgba(34, 211, 238, 0.28)';
    ctx.beginPath();
    ctx.arc(0, 0, (TARGET_HOLE.r + 16) * holePulse, 0, TAU);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.strokeStyle = ballInHole ? FLIPPER_YELLOW : TARGET_CYAN;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, TARGET_HOLE.r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (ballInHole) {
      // Draw the winning ball nestled inside the target hole!
      this.drawSilverBall(ctx, 0, 0, 300);
    }
    ctx.restore();

    // Three Giant Red Bumpers (pop & flash when hit!)
    this.drawRedBumper(ctx, B1.x, B1.y, B1.r, t, [8.55, 14.05, 26.55]);
    this.drawRedBumper(ctx, B2.x, B2.y, B2.r, t, [9.15, 21.35, 27.15]);
    this.drawRedBumper(ctx, B3.x, B3.y, B3.r, t, [9.75, 15.05, 27.75]);

    // Spinning Obstacles (idle dimly before 12.4s, spin fast & bright in Scene 3+)
    const turbo = t >= 12.4;
    const spinAng = turbo ? (t - 12.4) * 7.5 : t * 0.5;
    this.drawSpinner(ctx, SPIN1.x, SPIN1.y, SPIN1.r, spinAng, turbo, t, 14.55);
    this.drawSpinner(ctx, SPIN2.x, SPIN2.y, SPIN2.r, -spinAng * 1.1, turbo, t, 16.15);

    // Moving Platforms (docked before 12.4s, sliding smoothly in Scene 3+)
    this.drawMovingPlatform(ctx, this.platform1X(t), 1025, turbo, t, 15.6);
    this.drawMovingPlatform(ctx, this.platform2X(t), 1085, turbo, t, 16.7);

    // Spinning Bonus Ring (Scene 4 highlight!)
    this.drawSpinningRing(ctx, RING_POS.x, RING_POS.y, t);

    // Yellow Flippers (Left snaps up at 18.42s!)
    const flipWave =
      t >= 18.42 && t < 18.72 ? Math.sin(inv(18.42, 18.72, t) * Math.PI) : 0;
    this.drawFlipper(ctx, FLIP_L.x, FLIP_L.y, 118, lerp(0.38, -0.58, flipWave));
    this.drawFlipper(ctx, FLIP_R.x, FLIP_R.y, 118, Math.PI - 0.38);

    // Prize Slot Background Compartment (bottom-right)
    const prizeOpen = t >= 28.55;
    ctx.fillStyle = prizeOpen ? '#020617' : '#0f172a';
    ctx.strokeStyle = FLIPPER_YELLOW;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(PRIZE_SLOT.x, PRIZE_SLOT.y, PRIZE_SLOT.w, PRIZE_SLOT.h, 14);
    ctx.fill();
    ctx.stroke();
  }

  private drawRedBumper(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    t: number,
    hitTimes: number[]
  ) {
    let pop = 0;
    for (const h of hitTimes) {
      if (t >= h && t < h + 0.24) {
        pop = Math.max(pop, Math.sin(inv(h, h + 0.24, t) * Math.PI));
      }
    }
    const sc = 1 + pop * 0.24;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);

    if (pop > 0.05) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
      ctx.beginPath();
      ctx.arc(0, 0, r + 18, 0, TAU);
      ctx.fill();
    }

    ctx.fillStyle = pop > 0.25 ? '#f97316' : BUMPER_RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.62, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = BUMPER_CORE;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.32, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawSpinner(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    ang: number,
    active: boolean,
    t: number,
    hitTime: number
  ) {
    const flash = t >= hitTime && t < hitTime + 0.22;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.globalAlpha = active ? 1 : 0.45;

    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 2);
      ctx.fillStyle = flash ? FLIPPER_YELLOW : i % 2 === 0 ? SPINNER_PURPLE : SPINNER_ORANGE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.roundRect(-10, -r, 20, r * 2, 10);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawMovingPlatform(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    active: boolean,
    t: number,
    hitTime: number
  ) {
    const flash = t >= hitTime && t < hitTime + 0.2;
    ctx.save();
    ctx.globalAlpha = active ? 1 : 0.45;
    ctx.fillStyle = flash ? WHITE : PLATFORM_CYAN;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(cx - 64, cy - 11, 128, 22, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawSpinningRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
    const active = t >= 12.4;
    const passBurst = t >= 19.65 && t < 20.05 ? Math.sin(inv(19.65, 20.05, t) * Math.PI) : 0;
    const rx = Math.max(16, Math.abs(Math.cos(t * (active ? 3.2 : 0.8))) * 54);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = active ? 1 : 0.45;

    ctx.strokeStyle = passBurst > 0.1 ? WHITE : TARGET_CYAN;
    ctx.lineWidth = 12 + passBurst * 6;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, 52, 0, 0, TAU);
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, 52, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  private drawFlipper(ctx: CanvasRenderingContext2D, px: number, py: number, len: number, ang: number) {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(ang);

    ctx.fillStyle = FLIPPER_YELLOW;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(len, -9);
    ctx.arc(len, 0, 9, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(0, 16);
    ctx.arc(0, 0, 16, Math.PI / 2, (Math.PI * 3) / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = BUMPER_RED;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawCabinetFrontDetails(ctx: CanvasRenderingContext2D, t: number) {
    const prizeOpen = t >= 28.55;
    // Prize Slot Badge above slot
    ctx.fillStyle = prizeOpen && Math.floor(t * 8) % 2 === 0 ? BUMPER_RED : CABINET_TRIM;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(PRIZE_SLOT.x + 12, PRIZE_SLOT.y - 24, 106, 30, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 18px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = prizeOpen ? WHITE : INK;
    ctx.fillText('PRIZE', PRIZE_SLOT.x + 65, PRIZE_SLOT.y - 8);

    // Lower front lip of Prize Slot (covers lower torso/legs when Stickman lands inside!)
    if (prizeOpen) {
      ctx.fillStyle = CABINET_DARK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(PRIZE_SLOT.x, PRIZE_SLOT.y + 88, PRIZE_SLOT.w, 46, 8);
      ctx.fill();
      ctx.stroke();
    }
  }

  private drawSilverBall(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = SILVER_MID;
    ctx.beginPath();
    ctx.arc(3, 4, BALL_R * 0.65, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = SILVER_LIGHT;
    ctx.beginPath();
    ctx.arc(-5, -5, 5.5, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawVisualFX(ctx: CanvasRenderingContext2D, t: number) {
    // Scene 1 Forehead Bonk burst
    if (t >= 3.78 && t < 4.25) {
      const u = inv(3.78, 4.25, t);
      ctx.save();
      ctx.translate(182, 1020);
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = FLIPPER_YELLOW;
      ctx.lineWidth = 6;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (16 + u * 24), Math.sin(a) * (16 + u * 24));
        ctx.lineTo(Math.cos(a) * (38 + u * 45), Math.sin(a) * (38 + u * 45));
        ctx.stroke();
      }
      ctx.restore();
    }

    // Scene 5 WIN Confetti around Target Hole & Stickman
    if (t >= 24.15 && t < 26.2) {
      const u = inv(24.15, 26.2, t);
      const colors = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + 0.3;
        const px = TARGET_HOLE.x + Math.cos(a) * (30 + u * 170);
        const py = TARGET_HOLE.y + Math.sin(a) * (30 + u * 120) - u * 50 + u * u * 130;
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.rect(px - 6, py - 5, 12, 10);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Spring ejector pad beneath Stickman at launch (25.80–26.40s)
    if (t >= 25.8 && t < 26.5) {
      const u = easeOut(inv(25.8, 26.05, t));
      const padY = lerp(FLOOR_Y, FLOOR_Y - 75, u);
      ctx.strokeStyle = SILVER_MID;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(155, FLOOR_Y);
      ctx.lineTo(195, lerp(FLOOR_Y, padY, 0.5));
      ctx.lineTo(155, padY);
      ctx.stroke();

      ctx.fillStyle = BUMPER_RED;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.roundRect(125, padY - 14, 100, 18, 6);
      ctx.fill();
      ctx.stroke();
    }
  }

  // -------------------------------------------------------------------------
  // Locked Angry Stickman Rig (Preserves 100% Proportions Everywhere)
  // -------------------------------------------------------------------------
  private drawCharacterLayer(ctx: CanvasRenderingContext2D, ch: CharState, pose: Pose, t: number) {
    if (ch.inPrizeSlot) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(PRIZE_SLOT.x - 30, PRIZE_SLOT.y - 165, PRIZE_SLOT.w + 60, 260);
      ctx.clip();
      this.drawCharacter(ctx, ch, pose, t);
      ctx.restore();
      return;
    }

    if (ch.inMachine) {
      const centerX = ch.x;
      const centerY = ch.ground - 260;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(ch.rot);
      ctx.translate(-centerX, -centerY);
      this.drawCharacter(ctx, ch, pose, t);
      ctx.restore();
      return;
    }

    this.drawCharacter(ctx, ch, pose, t);
  }

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

    if (pose.eye === 'dizzy') {
      ctx.lineWidth = 6;
      for (const side of [-1, 1]) {
        const ex = fx + side * eyeDX;
        ctx.beginPath();
        ctx.moveTo(ex - 9, eyeY - 9);
        ctx.lineTo(ex + 9, eyeY + 9);
        ctx.moveTo(ex + 9, eyeY - 9);
        ctx.lineTo(ex - 9, eyeY + 9);
        ctx.stroke();
      }
    } else if (pose.eye === 'shut' || pose.eye === 'happy') {
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
