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
const OTHER_WALL = '#ecfeff';
const OTHER_BAND = '#cffafe';
const FLOOR_WOOD = '#fde68a';
const FLOOR_PLANK = '#f59e0b';

const DOOR_WOOD = '#b45309';
const DOOR_PANEL = '#92400e';
const DOOR_FRAME = '#78350f';
const BRASS = '#facc15';
const BRASS_DEEP = '#ca8a04';

const MIRROR_GLASS = '#bae6fd';
const MIRROR_FRAME = '#64748b';
const RAMP_TEAL = '#06b6d4';
const CUP_RED = '#ef4444';
const CUP_DARK = '#b91c1c';
const BALL_ORANGE = '#f97316';
const BALL_HIGHLIGHT = '#fdba74';

const BOOK_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7'];

const FLOOR_Y = 1500;
const HEAD_R = 70;
const BALL_R = 16;

// Door & Keyhole fixed world coordinates
const DOOR_X = 810;
const DOOR_W = 200;
const DOOR_TOP = 650;
const KEYHOLE_X = 890;
const KEYHOLE_Y = 1120;
const KEYHOLE_R = 24;

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
  // Scene 1 (0–6s): Points at tiny keyhole -> throws ball -> hits door & bonks forehead!
  {
    t: 0.0,
    p: {
      lean: 0.06,
      look: 'right',
      mouth: 'smirk',
      brow: 'raised',
      eye: 'open',
      handL: { x: -65, y: 1240 },
      handR: { x: 112, y: 1125 },
      pointR: true,
    },
  },
  {
    t: 1.5,
    p: {
      lean: -0.14,
      pointR: false,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      handL: { x: -75, y: 1230 },
      handR: { x: -45, y: 1085 },
      gripR: true,
    },
  },
  {
    t: 2.0,
    p: {
      lean: 0.2,
      stance: 20,
      look: 'right',
      mouth: 'o',
      brow: 'determined',
      gripR: false,
      handR: { x: 118, y: 1125 },
    },
  },
  {
    t: 3.7,
    p: {
      lean: -0.22,
      headTilt: -0.24,
      look: 'front',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -86, y: 1120 },
      handR: { x: 86, y: 1120 },
    },
  },
  {
    t: 4.7,
    p: {
      lean: 0.04,
      headTilt: 0,
      stance: 6,
      look: 'right',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -72, y: 1245 },
      handR: { x: 72, y: 1245 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 2 (6–12s): Builds small book ramp -> launches -> clips brass keyhole rim -> kicks ramp!
  {
    t: 6.2,
    p: {
      lean: 0.14,
      crouch: 0.4,
      fistL: false,
      fistR: false,
      look: 'right',
      mouth: 'flat',
      brow: 'determined',
      eye: 'open',
      handL: { x: 52, y: 1320 },
      handR: { x: 105, y: 1320 },
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 7.9,
    p: {
      lean: 0.14,
      crouch: 0.25,
      look: 'right',
      mouth: 'smirk',
      brow: 'cocky',
      handL: { x: -65, y: 1230 },
      handR: { x: 112, y: 1300 },
      gripL: false,
      gripR: false,
    },
  },
  {
    t: 9.45,
    p: {
      lean: 0.04,
      crouch: 0,
      look: 'right',
      mouth: 'frown',
      brow: 'angry',
      eye: 'wide',
      handL: { x: -85, y: 1220 },
      handR: { x: 85, y: 1220 },
      fistL: true,
      fistR: true,
    },
  },
  {
    t: 10.45,
    p: {
      lean: -0.14,
      footLift: 92,
      stance: 14,
      look: 'right',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -86, y: 1200 },
      handR: { x: 86, y: 1200 },
    },
  },
  {
    t: 11.2,
    p: {
      lean: 0,
      footLift: 0,
      stance: 4,
      fistL: false,
      fistR: false,
    },
  },

  // Scene 3 (12–18s): Places 2 mirrors + curved ramp -> adjusts angles -> releases ball!
  {
    t: 12.6,
    p: {
      lean: 0.08,
      look: 'up',
      mouth: 'smile',
      brow: 'determined',
      eye: 'open',
      handL: { x: -58, y: 1200 },
      handR: { x: 92, y: 1060 },
      gripR: true,
    },
  },
  {
    t: 14.0,
    p: {
      lean: 0.1,
      look: 'right',
      mouth: 'smirk',
      brow: 'cocky',
      handL: { x: -62, y: 1210 },
      handR: { x: 96, y: 1095 },
      gripR: true,
    },
  },
  {
    t: 15.6,
    p: {
      lean: -0.06,
      look: 'up',
      mouth: 'grin',
      brow: 'raised',
      eye: 'wide',
      gripR: false,
      handL: { x: -75, y: 1120 },
      handR: { x: 45, y: 1015 },
    },
  },

  // Scene 4 (18–24s): Steps closer to watch mirror 2 -> curved ramp -> keyhole with mouth wide open!
  {
    t: 18.5,
    p: {
      lean: 0.14,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -72, y: 1200 },
      handR: { x: 95, y: 1180 },
    },
  },
  {
    t: 22.0,
    p: {
      lean: 0.18,
      crouch: 0.16,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -64, y: 1165 },
      handR: { x: 64, y: 1165 },
    },
  },

  // Scene 5 (24–30s): Celebrates wildly -> giant door swings open & knocks him back (beanie through keyhole!)
  {
    t: 24.3,
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
    t: 26.2,
    p: {
      beanieOn: false,
      lean: -0.35,
      headTilt: -0.25,
      sit: 0.85,
      stance: 18,
      look: 'right',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handL: { x: -108, y: 1240 },
      handR: { x: 108, y: 1180 },
      bendL: 1,
      bendR: 1,
    },
  },
  {
    t: 27.8,
    p: {
      beanieOn: false,
      lean: -0.18,
      headTilt: -0.05,
      sit: 0.95,
      stance: 14,
      look: 'right',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -85, y: 1365 },
      handR: { x: 85, y: 1365 },
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
  { from: 0.25, to: 5.75, text: 'THROUGH THAT TINY HOLE?!' },
  { from: 6.25, to: 11.75, text: 'SO CLOSE!' },
  { from: 12.25, to: 17.75, text: 'CALCULATED PERFECTLY!' },
  { from: 18.25, to: 23.75, text: 'IT WENT THROUGH!' },
  { from: 24.25, to: 29.85, text: 'THE DOOR GOT REVENGE! 😂' },
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
  inKeyhole: boolean;
}

export class ImpossibleKeyholeRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const camX = this.camXAt(time);
    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.walkPhase);
    const ball = this.ballAt(time);
    const doorSwing = time >= 26.15 ? easeOut(inv(26.15, 26.7, time)) : 0;

    ctx.save();
    ctx.translate(-camX, 0);

    // 1. Living Room + Cutaway Other Side of the Door
    this.drawRoomBackdrop(ctx);

    // 2. Red Target Cup on the other side of the door (x = 1190, y = 1360)
    this.drawOtherSideTableAndCupBack(ctx);

    // 3. Scene 2 Book Ramp & Scene 3-4 Mirrors + Curved Ramp
    this.drawBookRamp(ctx, time);
    this.drawMirrorsAndCurvedRamp(ctx, time);

    // 4. Giant Wooden Door Back / Frame & Swing Panel
    this.drawGiantDoorBack(ctx, doorSwing);

    // 5. Ball when threading keyhole / behind door front face
    if (ball.inKeyhole) {
      this.drawOrangeBall(ctx, ball.x, ball.y, ball.rot);
    }

    // 6. Front Face & Keyhole Rim of Giant Door + Tiny Golden Key
    this.drawGiantDoorFront(ctx, doorSwing);

    // 7. Ball in open air & Red Target Cup front lip
    if (!ball.inKeyhole) {
      this.drawOrangeBall(ctx, ball.x, ball.y, ball.rot);
    }
    this.drawCupFront(ctx, 1190, 1360);

    // 8. Locked Angry Stickman & Flying Red Beanie through keyhole!
    this.drawCharacter(ctx, ch, pose, time);
    this.drawFlyingBeanie(ctx, time, doorSwing);
    this.drawVisualFX(ctx, time, ch);

    ctx.restore();

    // 9. Screen-space Burned-in Scene Captions & Safe Zones
    this.drawCaptions(ctx, time);
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Camera, Character, Pose & Ball Timelines
  // -------------------------------------------------------------------------
  private camXAt(t: number): number {
    if (t < 21.8) return 0;
    if (t < 23.8) return lerp(0, 340, smooth(inv(21.8, 23.8, t)));
    return 340;
  }

  private charAt(t: number): CharState {
    let x = 185;
    const ground = FLOOR_Y;
    let lift = 0;
    let walkPhase = 0;

    if (t < 6.0) {
      x = 185;
    } else if (t < 11.4) {
      x = lerp(185, 220, smooth(inv(6.0, 7.2, t)));
    } else if (t < 15.2) {
      const k = smooth(inv(11.4, 15.2, t));
      x = lerp(220, 290, k);
      walkPhase = k * TAU * 1.5;
    } else if (t < 18.2) {
      x = 290;
    } else if (t < 21.6) {
      const k = smooth(inv(18.2, 21.6, t));
      x = lerp(290, 560, k);
      walkPhase = k * TAU * 3;
    } else if (t < 24.3) {
      x = 560;
    } else if (t < 26.15) {
      x = 560;
      const j = ((t - 24.3) * 2.4) % 1;
      lift = Math.sin(j * Math.PI) * 55;
    } else if (t < 26.75) {
      // Knocked backward cleanly by the swinging giant door!
      const u = easeOut(inv(26.15, 26.75, t));
      x = lerp(560, 420, u);
      lift = Math.sin(u * Math.PI) * 68;
    } else {
      x = 420;
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
      p.footLift += Math.max(0, w) * 34;
      p.stance += w * 16;
      p.handL.x += w * 18;
      p.handR.x -= w * 18;
    }

    return p;
  }

  private ballAt(t: number): BallState {
    // Scene 1 (0–6s): Held in hand -> thrown toward keyhole -> hits door & bounces off his forehead!
    if (t < 1.5) {
      return { x: 240, y: 1215, rot: 0, inKeyhole: false };
    }
    if (t < 2.0) {
      const k = smooth(inv(1.5, 2.0, t));
      return { x: lerp(240, 145, k), y: lerp(1215, 1085, k), rot: 0, inKeyhole: false };
    }
    if (t < 2.85) {
      // Flies toward door, misses slightly high above keyhole (820, 1020)
      const u = inv(2.0, 2.85, t);
      return {
        x: lerp(145, 815, u),
        y: lerp(1085, 1020, u) - Math.sin(u * Math.PI) * 140,
        rot: u * 10,
        inKeyhole: false,
      };
    }
    if (t < 3.7) {
      // Bounces back straight into Stickman's forehead (195, 1110)
      const u = inv(2.85, 3.7, t);
      return {
        x: lerp(815, 195, u),
        y: lerp(1020, 1110, u) - Math.sin(u * Math.PI) * 95,
        rot: 10 + u * 12,
        inKeyhole: false,
      };
    }
    if (t < 4.35) {
      const u = inv(3.7, 4.35, t);
      return {
        x: lerp(195, 290, u),
        y: lerp(1110, FLOOR_Y - BALL_R, u * u),
        rot: 22 + u * 4,
        inKeyhole: false,
      };
    }
    if (t < 6.5) {
      return { x: 290, y: FLOOR_Y - BALL_R, rot: 26, inKeyhole: false };
    }

    // Scene 2 (6–12s): Placed on book ramp (310, 1345) -> launches -> clips keyhole rim (875, 1096)!
    if (t < 8.0) {
      const k = smooth(inv(6.5, 7.6, t));
      return { x: lerp(290, 315, k), y: lerp(FLOOR_Y - BALL_R, 1325, k), rot: 26, inKeyhole: false };
    }
    if (t < 8.45) {
      // Rolls down book ramp (315, 1325) -> (455, 1395)
      const u = inv(8.0, 8.45, t);
      return { x: lerp(315, 455, u), y: lerp(1325, 1395, u), rot: 26 + u * 6, inKeyhole: false };
    }
    if (t < 9.35) {
      // Flies toward keyhole but clips brass edge at (875, 1096)
      const u = inv(8.45, 9.35, t);
      return {
        x: lerp(455, 875, u),
        y: lerp(1395, 1096, u) - Math.sin(u * Math.PI) * 145,
        rot: 32 + u * 10,
        inKeyhole: false,
      };
    }
    if (t < 10.1) {
      const u = inv(9.35, 10.1, t);
      return {
        x: lerp(875, 755, u),
        y: lerp(1096, FLOOR_Y - BALL_R, u * u),
        rot: 42 + u * 6,
        inKeyhole: false,
      };
    }
    if (t < 15.8) {
      const k = smooth(inv(14.5, 15.6, t));
      return {
        x: lerp(755, 335, k),
        y: lerp(FLOOR_Y - BALL_R, 1015, k),
        rot: 48,
        inKeyhole: false,
      };
    }

    // Scene 3 (12–18s): Released at (335, 1015) -> bounces off Mirror 1 (240, 820) -> heads to Mirror 2!
    if (t < 16.95) {
      const u = inv(15.8, 16.95, t);
      return {
        x: lerp(335, 240, u),
        y: lerp(1015, 820, u) - Math.sin(u * Math.PI) * 45,
        rot: 48 + u * 8,
        inKeyhole: false,
      };
    }
    if (t < 18.65) {
      // Redirected by Mirror 1 across room toward Mirror 2 at (620, 910)
      const u = inv(16.95, 18.65, t);
      return {
        x: lerp(240, 620, u),
        y: lerp(820, 910, u) - Math.sin(u * Math.PI) * 75,
        rot: 56 + u * 12,
        inKeyhole: false,
      };
    }

    // Scene 4 (18–24s): Mirror 2 (620, 910) -> Curved Ramp -> Straight through tiny keyhole (890, 1120)!
    if (t < 19.55) {
      const u = inv(18.65, 19.55, t);
      return {
        x: lerp(620, 445, u),
        y: lerp(910, 1295, u) - Math.sin(u * Math.PI) * 55,
        rot: 68 + u * 8,
        inKeyhole: false,
      };
    }
    if (t < 21.5) {
      // Smooth arc along curved teal ramp (445, 1295) -> (685, 1170)
      const u = inv(19.55, 21.5, t);
      return {
        x: lerp(445, 685, u),
        y: lerp(1295, 1170, u) + Math.sin(u * Math.PI) * 52,
        rot: 76 + u * 14,
        inKeyhole: false,
      };
    }
    if (t < 22.85) {
      // Flies straight up-right to keyhole entry (890, 1120)
      const u = inv(21.5, 22.85, t);
      return {
        x: lerp(685, KEYHOLE_X, u),
        y: lerp(1170, KEYHOLE_Y, u) - Math.sin(u * Math.PI) * 38,
        rot: 90 + u * 10,
        inKeyhole: u > 0.78,
      };
    }
    if (t < 23.4) {
      // Passes physically through the keyhole tunnel (890 -> 960)!
      const u = inv(22.85, 23.4, t);
      return {
        x: lerp(KEYHOLE_X, 960, u),
        y: KEYHOLE_Y,
        rot: 100 + u * 6,
        inKeyhole: true,
      };
    }

    // Scene 5 (24–30s): Exits other side of keyhole & lands inside Red Target Cup (1190, 1326)!
    if (t < 24.3) {
      const u = inv(23.4, 24.3, t);
      return {
        x: lerp(960, 1190, u),
        y: lerp(KEYHOLE_Y, 1292, u) - Math.sin(u * Math.PI) * 75,
        rot: 106 + u * 8,
        inKeyhole: false,
      };
    }
    if (t < 24.55) {
      const u = inv(24.3, 24.55, t);
      return {
        x: 1190,
        y: lerp(1292, 1326, u),
        rot: 114,
        inKeyhole: false,
      };
    }
    return { x: 1190, y: 1326, rot: 114, inKeyhole: false };
  }

  // -------------------------------------------------------------------------
  // Room Backdrop, Other-Side Cup, Ramps, Mirrors & Giant Door
  // -------------------------------------------------------------------------
  private drawRoomBackdrop(ctx: CanvasRenderingContext2D) {
    // Left Room (0 .. 940)
    ctx.fillStyle = ROOM_WALL;
    ctx.fillRect(0, 0, 940, FLOOR_Y);
    ctx.fillStyle = ROOM_BAND;
    ctx.fillRect(0, 1160, 940, FLOOR_Y - 1160);
    ctx.strokeStyle = '#d6cbba';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 1160);
    ctx.lineTo(940, 1160);
    ctx.stroke();

    // Right Cutaway Room — Other Side of the Door (940 .. 1520)
    ctx.fillStyle = OTHER_WALL;
    ctx.fillRect(940, 0, 580, FLOOR_Y);
    ctx.fillStyle = OTHER_BAND;
    ctx.fillRect(940, 1160, 580, FLOOR_Y - 1160);

    // Wall Cutaway Cross-Section Pillar above doorway (890..940, 0..650)
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(895, 0, 48, DOOR_TOP);
    ctx.fill();
    ctx.stroke();

    // Wooden Floor
    ctx.fillStyle = FLOOR_WOOD;
    ctx.fillRect(0, FLOOR_Y, 1520, HEIGHT - FLOOR_Y);
    ctx.strokeStyle = FLOOR_PLANK;
    ctx.lineWidth = 4;
    for (let fy = FLOOR_Y + 46; fy < HEIGHT; fy += 60) {
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.lineTo(1520, fy);
      ctx.stroke();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(1520, FLOOR_Y);
    ctx.stroke();
  }

  private drawOtherSideTableAndCupBack(ctx: CanvasRenderingContext2D) {
    // Pedestal table on other side of door (1130..1250, top y=1360)
    ctx.fillStyle = DOOR_PANEL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(1176, 1380, 28, FLOOR_Y - 1380);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = DOOR_WOOD;
    ctx.beginPath();
    ctx.roundRect(1130, 1360, 120, 22, 6);
    ctx.fill();
    ctx.stroke();

    // Cup back ellipse
    ctx.fillStyle = CUP_DARK;
    ctx.beginPath();
    ctx.ellipse(1190, 1292, 28, 8, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private drawCupFront(ctx: CanvasRenderingContext2D, cx: number, bottomY: number) {
    ctx.fillStyle = CUP_RED;
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

    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 21, bottomY - 62);
    ctx.lineTo(cx + 21, bottomY - 62);
    ctx.stroke();
  }

  private drawBookRamp(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 6.0 || t >= 12.2) return;
    const kickU = t >= 10.5 ? smooth(inv(10.5, 11.3, t)) : 0;

    // 3 stacked books on right end + angled book ramp resting on them
    for (let i = 0; i < 3; i++) {
      const bx = 310 + kickU * (55 + i * 38);
      const by = FLOOR_Y - 26 - i * 26 - Math.sin(kickU * Math.PI) * (35 + i * 22);
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(kickU * (i - 1) * 0.45);
      ctx.fillStyle = BOOK_COLORS[i % BOOK_COLORS.length];
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.roundRect(-45, 0, 90, 26, 5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Sloped ramp board resting on the stack
    ctx.save();
    ctx.translate(lerp(310, 440, kickU), lerp(1345, FLOOR_Y - 14, kickU * kickU) - Math.sin(kickU * Math.PI) * 90);
    ctx.rotate(0.45 + kickU * 0.9);
    ctx.fillStyle = BOOK_COLORS[3];
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(0, -10, 165, 20, 5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawMirrorsAndCurvedRamp(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 12.0) return;
    const fadeIn = smooth(inv(12.0, 12.9, t));

    const drawMirrorStand = (mx: number, my: number, angle: number) => {
      ctx.save();
      ctx.globalAlpha = fadeIn;
      // Floor support stand
      ctx.strokeStyle = INK;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx, FLOOR_Y);
      ctx.moveTo(mx - 36, FLOOR_Y);
      ctx.lineTo(mx + 36, FLOOR_Y);
      ctx.stroke();

      ctx.translate(mx, my);
      ctx.rotate(angle);
      ctx.fillStyle = MIRROR_FRAME;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(-64, -14, 128, 28, 7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = MIRROR_GLASS;
      ctx.beginPath();
      ctx.roundRect(-56, -8, 112, 16, 4);
      ctx.fill();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-40, -3);
      ctx.lineTo(20, -3);
      ctx.stroke();
      ctx.restore();
    };

    drawMirrorStand(240, 820, 0.42);
    drawMirrorStand(620, 910, -0.58);

    // Curved Ramp resting on two sturdy floor posts (x=445..685)
    ctx.save();
    ctx.globalAlpha = fadeIn;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(455, 1300);
    ctx.lineTo(455, FLOOR_Y);
    ctx.moveTo(675, 1185);
    ctx.lineTo(675, FLOOR_Y);
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(435, 1305);
    ctx.quadraticCurveTo(565, 1310, 695, 1175);
    ctx.stroke();

    ctx.strokeStyle = RAMP_TEAL;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(435, 1305);
    ctx.quadraticCurveTo(565, 1310, 695, 1175);
    ctx.stroke();
    ctx.restore();
  }

  private drawGiantDoorBack(ctx: CanvasRenderingContext2D, swing: number) {
    // Door frame anchored around x = DOOR_X..DOOR_X+DOOR_W
    ctx.fillStyle = DOOR_FRAME;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(DOOR_X - 18, DOOR_TOP - 18, DOOR_W + 36, FLOOR_Y - (DOOR_TOP - 18));
    ctx.fill();
    ctx.stroke();

    // Inner bright doorway opening visible once giant door swings open
    ctx.fillStyle = OTHER_WALL;
    ctx.beginPath();
    ctx.rect(DOOR_X, DOOR_TOP, DOOR_W, FLOOR_Y - DOOR_TOP);
    ctx.fill();
    ctx.stroke();

    // Swinging door panel body (hinged at DOOR_X = 810, swings leftward toward Stickman!)
    const panelW = lerp(DOOR_W, -230, swing);
    const xStart = DOOR_X;
    const xEnd = xStart + panelW;
    const minX = Math.min(xStart, xEnd);
    const wAbs = Math.abs(panelW);

    ctx.fillStyle = DOOR_WOOD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(minX, DOOR_TOP, wAbs, FLOOR_Y - DOOR_TOP);
    ctx.fill();
    ctx.stroke();

    // Inset decorative wood panels (if wide enough)
    if (wAbs > 60) {
      const pad = 22;
      ctx.fillStyle = DOOR_PANEL;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(minX + pad, DOOR_TOP + 36, wAbs - pad * 2, 290, 8);
      ctx.roundRect(minX + pad, DOOR_TOP + 490, wAbs - pad * 2, 310, 8);
      ctx.fill();
      ctx.stroke();
    }
  }

  private drawGiantDoorFront(ctx: CanvasRenderingContext2D, swing: number) {
    const panelW = lerp(DOOR_W, -230, swing);
    const kx = DOOR_X + panelW * 0.4;
    const ky = KEYHOLE_Y;

    // Brass keyhole escutcheon plate
    ctx.fillStyle = BRASS;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(kx - 36, ky - 52, 72, 130, 18);
    ctx.fill();
    ctx.stroke();

    // Brass doorknob above keyhole
    ctx.fillStyle = BRASS_DEEP;
    ctx.beginPath();
    ctx.arc(kx, ky - 115, 22, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = BRASS;
    ctx.beginPath();
    ctx.arc(kx - 4, ky - 118, 13, 0, TAU);
    ctx.fill();

    // Actual transparent/dark Keyhole bore (round top + trapezoid bottom slot)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(kx, ky, KEYHOLE_R, Math.PI * 0.72, Math.PI * 2.28);
    ctx.lineTo(kx + 14, ky + 48);
    ctx.lineTo(kx - 14, ky + 48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tiny golden key hanging on a brass hook right beside the door frame!
    ctx.save();
    ctx.translate(DOOR_X - 42, 1080);
    ctx.fillStyle = BRASS;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(-3, 10, 6, 26);
    ctx.rect(3, 24, 9, 5);
    ctx.rect(3, 31, 7, 5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Orange Ball, Flying Red Beanie & FX
  // -------------------------------------------------------------------------
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
    ctx.arc(-4.5, -4.5, 5, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawFlyingBeanie(ctx: CanvasRenderingContext2D, t: number, doorSwing: number) {
    if (t < 26.2) return;
    const panelW = lerp(DOOR_W, -230, doorSwing);
    const kx = DOOR_X + panelW * 0.4;

    const u = clamp((t - 26.2) / 1.7, 0, 1);
    let bx: number;
    let by: number;
    if (u < 0.48) {
      // Flies straight from Stickman's head into the keyhole!
      const s = u / 0.48;
      bx = lerp(560, kx, s);
      by = lerp(1030, KEYHOLE_Y, s) - Math.sin(s * Math.PI) * 120;
    } else {
      // Pops through the keyhole onto the other side floor!
      const s = (u - 0.48) / 0.52;
      bx = lerp(kx, 1090, s);
      by = lerp(KEYHOLE_Y, FLOOR_Y - 12, s * s) - Math.sin(s * Math.PI) * 60;
    }

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(u * Math.PI * 2.4);
    ctx.scale(lerp(1, 0.78, Math.sin(clamp((u - 0.35) / 0.3, 0, 1) * Math.PI)), 1);
    this.drawBeanieShape(ctx);
    ctx.restore();
  }

  private drawVisualFX(ctx: CanvasRenderingContext2D, t: number, ch: CharState) {
    // Mirror bounce flashes
    for (const m of [
      { time: 16.95, x: 240, y: 820 },
      { time: 18.65, x: 620, y: 910 },
    ]) {
      if (t >= m.time && t < m.time + 0.35) {
        const u = inv(m.time, m.time + 0.35, t);
        ctx.save();
        ctx.globalAlpha = 1 - u;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 18 + u * 55, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Forehead bonk burst at 3.7s
    if (t >= 3.7 && t < 4.2) {
      const u = inv(3.7, 4.2, t);
      ctx.save();
      ctx.translate(ch.x + 15, ch.ground - 525);
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 6;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (16 + u * 20), Math.sin(a) * (16 + u * 20));
        ctx.lineTo(Math.cos(a) * (36 + u * 44), Math.sin(a) * (36 + u * 44));
        ctx.stroke();
      }
      ctx.restore();
    }

    // Victory confetti at 24.3–26.1s
    if (t >= 24.3 && t < 26.1) {
      const u = inv(24.3, 26.1, t);
      const colors = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU + 0.2;
        const px = 1190 + Math.cos(a) * (40 + u * 180);
        const py = 1260 + Math.sin(a) * (30 + u * 120) - u * 70 + u * u * 120;
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.rect(px - 6, py - 5, 12, 10);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  // -------------------------------------------------------------------------
  // Locked Angry Stickman Rig
  // -------------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, ch: CharState, pose: Pose, t: number) {
    const baseY = ch.ground - ch.lift;
    const hipY = baseY - 260 + pose.hipDrop + pose.crouch * 52 + pose.sit * 84;
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

    const sitKneeL = { x: hipX + 46, y: hipY + 34 };
    const sitKneeR = { x: hipX + 62, y: hipY + 38 };
    const sitAnkleL = { x: hipX + 108, y: ankleBase };
    const sitAnkleR = { x: hipX + 124, y: ankleBase };

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

    this.drawShoe(ctx, ankleL.x - 4, ankleL.y + 12, lerp(-0.06, -0.3, pose.sit));
    this.drawShoe(
      ctx,
      ankleR.x + 4,
      ankleR.y + 12,
      lerp(pose.footLift > 20 ? -0.24 : 0.06, 0.3, pose.sit)
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
    const hipShift = hipY - 1240;

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
