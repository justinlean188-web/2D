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

// --- Modern Pop 2D Bowling Alley & Trickshot Palette -----------------------
const WALL_BG = '#f8fafc';
const WALL_BAND = '#e2e8f0';
const LANE_WOOD = '#fde68a';
const LANE_WOOD_ALT = '#fcd34d';
const LANE_BORDER = '#b45309';
const GUTTER_DARK = '#475569';

const BALL_PURPLE = '#9333ea';
const BALL_DEEP = '#6b21a8';
const BALL_GLOW = '#c084fc';

const PIN_STRIPE = '#ef4444';
const RAMP_ORANGE = '#f97316';
const RAMP_DEEP = '#c2410c';
const MIRROR_CYAN = '#67e8f9';
const MIRROR_FRAME = '#334155';
const TUNNEL_TEAL = 'rgba(45, 212, 191, 0.35)';
const TUNNEL_RIM = '#0d9488';
const PLATFORM_BLUE = '#3b82f6';
const SPRING_RED = '#ef4444';

const FLOOR_Y = 1520;
const HEAD_R = 70;
const BALL_R = 30;

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

// 10 Bowling Pins arranged in staggered 1-2-3-4 side-perspective formation on the right lane
interface PinBase {
  id: number;
  x: number;
  y: number;
  // Deterministic strike scatter targets
  fallDx: number;
  fallDy: number;
  fallRot: number;
}

const PINS: PinBase[] = [
  // Row 1 (Center front pin = index 0)
  { id: 0, x: 760, y: 1516, fallDx: 45, fallDy: 8, fallRot: -1.45 },
  // Row 2
  { id: 1, x: 805, y: 1502, fallDx: -55, fallDy: 14, fallRot: -1.55 },
  { id: 2, x: 805, y: 1526, fallDx: 72, fallDy: -6, fallRot: 1.52 },
  // Row 3
  { id: 3, x: 855, y: 1492, fallDx: -80, fallDy: 20, fallRot: -1.62 },
  { id: 4, x: 855, y: 1514, fallDx: 30, fallDy: 10, fallRot: 1.48 },
  { id: 5, x: 855, y: 1532, fallDx: 95, fallDy: -10, fallRot: 1.58 },
  // Row 4 (Back row; Pin #9 launches skyward on strike and lands on Stickman's head in Scene 5!)
  { id: 6, x: 908, y: 1484, fallDx: -65, fallDy: 24, fallRot: -1.52 },
  { id: 7, x: 908, y: 1504, fallDx: 60, fallDy: 12, fallRot: 1.6 },
  { id: 8, x: 908, y: 1522, fallDx: 105, fallDy: -4, fallRot: 1.45 },
  { id: 9, x: 908, y: 1538, fallDx: -320, fallDy: -4, fallRot: 1.75 },
];

// Props Positions (Continuous World Coordinates)
const CURVED_RAMP_P0 = { x: 485, y: 1410 };
const CURVED_RAMP_CTRL = { x: 265, y: 1495 };
const CURVED_RAMP_P2 = { x: 165, y: 1295 };

const SPIN_PLATFORM = { x: 245, y: 955 };
const MIRROR_1 = { x: 155, y: 495, angle: 0.72 };
const MIRROR_2 = { x: 895, y: 410, angle: -0.78 };
const TUNNEL_START = { x: 280, y: 505 };
const TUNNEL_CTRL = { x: 520, y: 315 };
const TUNNEL_END = { x: 745, y: 515 };
const SPRING_RAMP = { x: 830, y: 1035 };

// --- Character Pose Timeline -----------------------------------------------
interface Pose {
  lean: number;
  hipDrop: number;
  crouch: number;
  bodyFallAngle: number; // 0 upright, -PI/2 fallen backward into bowling lane
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
  bodyFallAngle: 0,
  headTilt: 0,
  headTurn: 2,
  headDrop: 0,
  beanieOn: true,
  look: 'right',
  mouth: 'smirk',
  brow: 'determined',
  eye: 'open',
  stance: 14,
  footLift: 0,
  handL: { x: -64, y: 1210 },
  handR: { x: 76, y: 1210 },
  bendL: -1,
  bendR: 1,
};

const POSE_PATCHES: { t: number; p: Partial<Pose> }[] = [
  // Scene 1: Points at pins right -> winds up & throws purple ball BACKWARD (left) -> hits his foot!
  { t: 0.0, p: { look: 'right', mouth: 'smirk', brow: 'determined', handL: { x: -58, y: 1220 }, handR: { x: 108, y: 1120 }, pointR: true } },
  { t: 1.15, p: { pointR: false, lean: 0.08, look: 'left', mouth: 'grin', handL: { x: -88, y: 1190 }, handR: { x: -72, y: 1210 }, gripL: true } },
  { t: 1.9, p: { lean: -0.18, gripL: false, mouth: 'bigsmile', handL: { x: -124, y: 1120 }, handR: { x: 78, y: 1150 } } },
  // 3.65s: Ball rolls back behind him & hits his foot! Hops in pain!
  { t: 3.65, p: { lean: 0.14, hipDrop: -12, footLift: 46, look: 'left', eye: 'shut', brow: 'angry', mouth: 'grit', handL: { x: -72, y: 1265 }, handR: { x: 64, y: 1195 } } },
  { t: 4.9, p: { lean: 0.02, hipDrop: 0, footLift: 0, look: 'left', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -96, y: 1140 }, handR: { x: 84, y: 1120 } } },

  // Scene 2: Places curved ramp behind him -> rolls ball backward -> knocks 1 pin!
  { t: 6.1, p: { lean: -0.12, crouch: 0.2, hipDrop: 12, look: 'left', brow: 'determined', mouth: 'smirk', handL: { x: -102, y: 1265 }, handR: { x: -40, y: 1235 } } },
  { t: 7.55, p: { crouch: 0, hipDrop: 0, lean: -0.14, mouth: 'grin', handL: { x: -116, y: 1225 }, handR: { x: 76, y: 1165 } } },
  { t: 9.0, p: { lean: 0.05, look: 'right', eye: 'wide', brow: 'raised', mouth: 'bigsmile', handL: { x: -64, y: 1145 }, handR: { x: 108, y: 1080 }, pointR: true } },
  // 10.2s: Only ONE pin falls! Grumpy reaction
  { t: 10.35, p: { pointR: false, lean: 0.08, look: 'right', eye: 'squint', brow: 'angry', mouth: 'frown', handL: { x: -58, y: 1205 }, handR: { x: 62, y: 1205 }, fistL: true, fistR: true } },

  // Scene 3: Adds 2 mirrors & spinning platform -> rolls backward -> watches ricochet around room!
  { t: 12.15, p: { fistL: false, fistR: false, lean: -0.06, look: 'up', brow: 'determined', mouth: 'smirk', handL: { x: -88, y: 1110 }, handR: { x: 92, y: 1060 } } },
  { t: 13.55, p: { lean: -0.15, look: 'left', mouth: 'grin', handL: { x: -118, y: 1215 }, handR: { x: 74, y: 1165 } } },
  { t: 15.1, p: { lean: 0.02, look: 'up', eye: 'wide', brow: 'raised', mouth: 'bigsmile', handL: { x: -88, y: 1020 }, handR: { x: 88, y: 1020 } } },
  { t: 17.0, p: { lean: 0.14, look: 'right', eye: 'wide', brow: 'cocky', mouth: 'grin', handL: { x: -64, y: 1170 }, handR: { x: 112, y: 1120 }, pointR: true } },

  // Scene 4: Unlocks curved tunnel & spring ramp -> releases ball -> watches backwards strike!
  { t: 18.1, p: { pointR: false, lean: -0.14, crouch: 0.18, look: 'left', brow: 'determined', mouth: 'grit', handL: { x: -112, y: 1220 }, handR: { x: 64, y: 1180 } } },
  { t: 19.0, p: { crouch: 0, lean: 0.02, look: 'up', eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -72, y: 1125 }, handR: { x: 72, y: 1125 } } },
  { t: 21.6, p: { lean: 0.14, hipDrop: 14, look: 'right', eye: 'wide', brow: 'raised', mouth: 'bigsmile', handL: { x: -58, y: 1085 }, handR: { x: 66, y: 1085 }, fistL: true, fistR: true } },

  // Scene 5: Celebrates -> ball zooms back & hits his feet -> falls backward into lane -> pin drops on head!
  { t: 23.6, p: { fistL: false, fistR: false, lean: 0, hipDrop: 0, eye: 'happy', brow: 'raised', mouth: 'bigsmile', handL: { x: -116, y: 925 }, handR: { x: 116, y: 925 } } },
  // 27.15s: Ball hits his feet!
  { t: 27.15, p: { lean: 0.25, hipDrop: -22, footLift: 40, eye: 'wide', brow: 'raised', mouth: 'o', handL: { x: -115, y: 1040 }, handR: { x: 115, y: 1040 } } },
  // 27.75s: Falls backward into the bowling lane!
  { t: 27.75, p: { bodyFallAngle: Math.PI * 0.48, lean: 0, hipDrop: 12, footLift: 0, look: 'up', eye: 'shut', brow: 'angry', mouth: 'grit', handL: { x: -90, y: 1165 }, handR: { x: 90, y: 1165 } } },
  // 28.25s: Final pin drops onto his head -> deadpan dazed glare!
  { t: 28.35, p: { bodyFallAngle: Math.PI * 0.48, look: 'center', eye: 'squint', brow: 'uneven', mouth: 'frown', handL: { x: -76, y: 1200 }, handR: { x: 76, y: 1200 } } },
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
  { from: 0.25, to: 5.75, text: 'BOWLING... BACKWARDS?!' },
  { from: 6.25, to: 11.75, text: 'WRONG DIRECTION!' },
  { from: 12.25, to: 17.75, text: 'MASTER THE ANGLES!' },
  { from: 18.25, to: 23.75, text: 'BACKWARDS STRIKE!' },
  { from: 24.25, to: 29.85, text: 'STRIKE... ON ME! 😂' },
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
  dancePhase: number;
}

export class ReverseBowlingRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.dancePhase);

    // 1. Bowling Alley Backdrop & Lane Deck
    this.drawBackdrop(ctx);

    // 2. Curved Tunnel Back + Trickshot Ramps, Mirrors & Spinning Platform
    this.drawPropsBack(ctx, time);

    // 3. Stickman Character (or fallen into bowling lane in Scene 5)
    this.drawCharacter(ctx, ch, pose, time);

    // 4. All 10 White Bowling Pins with Red Stripes (exact continuous physics!)
    this.drawBowlingPins(ctx, time);

    // 5. Purple Bowling Ball (consistent size & color across full route!)
    const ball = this.ballAt(time, ch);
    this.drawPurpleBowlingBall(ctx, ball.x, ball.y, ball.rot);

    // 6. Curved Tunnel Front Gloss & Action Sparks / Strike Confetti
    this.drawPropsFront(ctx, time);
    this.drawActionFX(ctx, time);

    // 7. Burned-In Captions + Optional Safe Zones
    this.drawCaptions(ctx, time);
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Character Position & Pose Timeline
  // -------------------------------------------------------------------------
  private charAt(t: number): CharState {
    // Stands behind the bowling foul line at x=585 facing the 10 pins on the right!
    let x = 585;
    let lift = 0;
    let dancePhase = 0;

    if (t >= 3.65 && t < 4.75) {
      // Hops in pain holding foot after ball hits him!
      const u = (t - 3.65) / 0.55;
      lift = Math.abs(Math.sin(u * Math.PI)) * 26;
    } else if (t >= 23.6 && t < 26.8) {
      // Victory dance!
      dancePhase = (t - 23.6) * 4.5;
      lift = Math.abs(Math.sin(dancePhase * Math.PI)) * 28;
      x = 585 + Math.sin(dancePhase * Math.PI * 0.5) * 26;
    } else if (t >= 27.15 && t < 27.8) {
      // Knocked backward rightward into the bowling lane!
      const u = easeOut(inv(27.15, 27.8, t));
      x = lerp(585, 650, u);
      lift = Math.sin(u * Math.PI) * 32;
    } else if (t >= 27.8) {
      x = 650;
    }
    return { x, lift, dancePhase };
  }

  private poseAt(t: number, dancePhase: number): Pose {
    let idx = 0;
    for (let i = 0; i < POSE_KEYS.length; i++) {
      if (POSE_KEYS[i].t <= t) idx = i;
    }
    const a = POSE_KEYS[idx];
    const b = POSE_KEYS[Math.min(POSE_KEYS.length - 1, idx + 1)];
    const span = Math.max(0.001, b.t - a.t);
    const u = a === b ? 0 : easeInOut(clamp((t - a.t) / span, 0, 1));
    const snap = u > 0.45 ? b : a;

    const danceWave = dancePhase > 0 ? Math.sin(dancePhase * TAU) : 0;

    return {
      lean: lerp(a.lean, b.lean, u) + danceWave * 0.08,
      hipDrop: lerp(a.hipDrop, b.hipDrop, u),
      crouch: lerp(a.crouch, b.crouch, u),
      bodyFallAngle: lerp(a.bodyFallAngle, b.bodyFallAngle, u),
      headTilt: lerp(a.headTilt, b.headTilt, u) + danceWave * 0.06,
      headTurn: lerp(a.headTurn, b.headTurn, u),
      headDrop: lerp(a.headDrop, b.headDrop, u),
      beanieOn: snap.beanieOn,
      look: snap.look,
      mouth: snap.mouth,
      brow: snap.brow,
      eye: snap.eye,
      stance: lerp(a.stance, b.stance, u) + Math.abs(danceWave) * 14,
      footLift: lerp(a.footLift, b.footLift, u),
      handL: {
        x: lerp(a.handL.x, b.handL.x, u) + danceWave * 18,
        y: lerp(a.handL.y, b.handL.y, u) - Math.abs(danceWave) * 16,
      },
      handR: {
        x: lerp(a.handR.x, b.handR.x, u) - danceWave * 18,
        y: lerp(a.handR.y, b.handR.y, u) - Math.abs(danceWave) * 16,
      },
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
  // Purple Bowling Ball Full Route Timeline (0–30s, zero teleportation!)
  // -------------------------------------------------------------------------
  private ballAt(t: number, ch: CharState): { x: number; y: number; rot: number } {
    // SCENE 1 (0–6s): Throws purple ball backward (left) -> rolls behind him -> hits his foot!
    if (t < 6.0) {
      if (t < 1.9) {
        const pose = this.poseAt(t, ch.dancePhase);
        const hipY = 1260 - ch.lift + pose.hipDrop + pose.crouch * 45;
        return { x: ch.x + pose.handL.x - 16, y: pose.handL.y + (hipY - 1260) + 12, rot: 0 };
      }
      if (t < 2.8) {
        // Thrown backward leftward -> bounces off left baseboard (95, FLOOR_Y - BALL_R)
        const u = inv(1.9, 2.8, t);
        return {
          x: lerp(460, 95, u),
          y: lerp(1150, FLOOR_Y - BALL_R, u * u) - Math.sin(u * Math.PI) * 90,
          rot: -u * 12,
        };
      }
      if (t < 3.65) {
        // Rolls back behind him toward his left heel (550, FLOOR_Y - BALL_R)
        const u = inv(2.8, 3.65, t);
        return { x: lerp(95, 550, u), y: FLOOR_Y - BALL_R, rot: -12 + u * 14 };
      }
      // Recoils softly left after hitting his foot
      const u = easeOut(inv(3.65, 4.6, t));
      return { x: lerp(550, 445, u), y: FLOOR_Y - BALL_R, rot: 2 - u * 3 };
    }

    // SCENE 2 (6–12s): Curved ramp -> bounces off left wall -> changes direction -> knocks 1 pin!
    if (t < 12.0) {
      if (t < 7.55) {
        const pose = this.poseAt(t, ch.dancePhase);
        const hipY = 1260 - ch.lift + pose.hipDrop + pose.crouch * 45;
        return { x: ch.x + pose.handL.x - 14, y: pose.handL.y + (hipY - 1260) + 10, rot: 0 };
      }
      if (t < 8.45) {
        // Rolls down curved ramp backward & rockets off left ramp lip toward left wall!
        const u = inv(7.55, 8.45, t);
        const omt = 1 - u;
        return {
          x: omt * omt * CURVED_RAMP_P0.x + 2 * omt * u * CURVED_RAMP_CTRL.x + u * u * 62,
          y: omt * omt * (CURVED_RAMP_P0.y - BALL_R) + 2 * omt * u * (CURVED_RAMP_CTRL.y - BALL_R) + u * u * 960,
          rot: -u * 14,
        };
      }
      if (t < 9.55) {
        // Bounces off left wall (62, 960), changes direction rightward over Stickman's head!
        const u = inv(8.45, 9.55, t);
        return {
          x: lerp(62, 665, u),
          y: lerp(960, FLOOR_Y - BALL_R, u * u) - Math.sin(u * Math.PI) * 250,
          rot: -14 + u * 18,
        };
      }
      if (t < 10.65) {
        // Rolls down bowling lane and clips ONLY pin #0 (760, 1516)!
        const u = easeOut(inv(9.55, 10.65, t));
        return { x: lerp(665, 805, u), y: FLOOR_Y - BALL_R, rot: 4 + u * 5 };
      }
      return { x: 805, y: FLOOR_Y - BALL_R, rot: 9 };
    }

    // SCENE 3 (12–18s): Backward down ramp -> Spinning Platform -> Mirror 1 -> Mirror 2 -> opposite side approach!
    if (t < 18.0) {
      if (t < 13.55) {
        const pose = this.poseAt(t, ch.dancePhase);
        const hipY = 1260 - ch.lift + pose.hipDrop + pose.crouch * 45;
        return { x: ch.x + pose.handL.x - 14, y: pose.handL.y + (hipY - 1260) + 10, rot: 0 };
      }
      if (t < 14.35) {
        // Curved ramp -> Spinning Platform (245, 955)
        const u = inv(13.55, 14.35, t);
        const omt = 1 - u;
        return {
          x: omt * omt * CURVED_RAMP_P0.x + 2 * omt * u * 230 + u * u * SPIN_PLATFORM.x,
          y: omt * omt * (CURVED_RAMP_P0.y - BALL_R) + 2 * omt * u * 1340 + u * u * (SPIN_PLATFORM.y - BALL_R - 8),
          rot: -u * 12,
        };
      }
      if (t < 15.1) {
        // Spinning platform flings ball up to Mirror 1 (155, 495)
        const u = inv(14.35, 15.1, t);
        return {
          x: lerp(SPIN_PLATFORM.x, MIRROR_1.x + 28, u),
          y: lerp(SPIN_PLATFORM.y - BALL_R - 8, MIRROR_1.y + 18, u) - Math.sin(u * Math.PI) * 55,
          rot: -12 + u * 10,
        };
      }
      if (t < 16.05) {
        // Mirror 1 reflects ball across top of room to Mirror 2 (895, 410)
        const u = inv(15.1, 16.05, t);
        return {
          x: lerp(MIRROR_1.x + 28, MIRROR_2.x - 28, u),
          y: lerp(MIRROR_1.y + 18, MIRROR_2.y + 18, u) - Math.sin(u * Math.PI) * 140,
          rot: -2 + u * 18,
        };
      }
      // Mirror 2 deflects ball down toward pins from opposite side (top-right -> right lane wall)
      const u = inv(16.05, 17.65, t);
      return {
        x: lerp(MIRROR_2.x - 28, 995, u),
        y: lerp(MIRROR_2.y + 18, FLOOR_Y - BALL_R, u * u) - Math.sin(u * Math.PI) * 60,
        rot: 16 + u * 12,
      };
    }

    // SCENE 4 (18–24s): Backward ramp -> Spinning Platform -> Curved Tunnel -> Spring Ramp -> Behind Pins -> CENTER PIN STRIKE!
    if (t < 24.0) {
      if (t < 18.65) {
        const pose = this.poseAt(t, ch.dancePhase);
        const hipY = 1260 - ch.lift + pose.hipDrop + pose.crouch * 45;
        return { x: ch.x + pose.handL.x - 14, y: pose.handL.y + (hipY - 1260) + 10, rot: 0 };
      }
      if (t < 19.35) {
        // Curved ramp -> Spinning Platform
        const u = inv(18.65, 19.35, t);
        const omt = 1 - u;
        return {
          x: omt * omt * CURVED_RAMP_P0.x + 2 * omt * u * 230 + u * u * SPIN_PLATFORM.x,
          y: omt * omt * (CURVED_RAMP_P0.y - BALL_R) + 2 * omt * u * 1340 + u * u * (SPIN_PLATFORM.y - BALL_R - 8),
          rot: -u * 12,
        };
      }
      if (t < 19.85) {
        // Spinning platform -> Curved Tunnel entrance (280, 505)
        const u = inv(19.35, 19.85, t);
        return {
          x: lerp(SPIN_PLATFORM.x, TUNNEL_START.x, u),
          y: lerp(SPIN_PLATFORM.y - BALL_R - 8, TUNNEL_START.y, u),
          rot: -12 + u * 8,
        };
      }
      if (t < 20.75) {
        // Rolls fast through the arched Curved Tunnel!
        const u = inv(19.85, 20.75, t);
        const omt = 1 - u;
        return {
          x: omt * omt * TUNNEL_START.x + 2 * omt * u * TUNNEL_CTRL.x + u * u * TUNNEL_END.x,
          y: omt * omt * TUNNEL_START.y + 2 * omt * u * TUNNEL_CTRL.y + u * u * TUNNEL_END.y,
          rot: -4 + u * 18,
        };
      }
      if (t < 21.35) {
        // Drops onto Spring Ramp (830, 1035)
        const u = easeIn(inv(20.75, 21.35, t));
        return {
          x: lerp(TUNNEL_END.x, SPRING_RAMP.x, u),
          y: lerp(TUNNEL_END.y, SPRING_RAMP.y - BALL_R - 6, u),
          rot: 14 + u * 8,
        };
      }
      if (t < 22.1) {
        // Launches off Spring Ramp & flies BEHIND the bowling pins (right wall bounce at 1015)!
        const u = inv(21.35, 22.1, t);
        return {
          x: lerp(SPRING_RAMP.x, 1012, u),
          y: lerp(SPRING_RAMP.y - BALL_R - 6, FLOOR_Y - BALL_R, u * u) - Math.sin(u * Math.PI) * 180,
          rot: 22 + u * 14,
        };
      }
      if (t < 22.45) {
        // Strikes straight into the center pins from BEHIND!
        const u = inv(22.1, 22.45, t);
        return { x: lerp(1012, 795, u), y: FLOOR_Y - BALL_R, rot: 36 - u * 8 };
      }
      // Rolls gently into right corner rest during strike celebration (22.45s -> 24.0s)
      const u = easeOut(inv(22.45, 23.4, t));
      return { x: lerp(795, 1005, u), y: FLOOR_Y - BALL_R, rot: 28 + u * 6 };
    }

    // SCENE 5 (24–30s): Rolls back along the SAME route -> hits Stickman's feet!
    if (t < 25.85) {
      return { x: 1005, y: FLOOR_Y - BALL_R, rot: 34 };
    }
    if (t < 26.4) {
      // Bounces back up onto Spring Ramp -> Curved Tunnel (reverse!)
      const u = inv(25.85, 26.4, t);
      return {
        x: lerp(1005, TUNNEL_END.x, u),
        y: lerp(FLOOR_Y - BALL_R, TUNNEL_END.y, u) - Math.sin(u * Math.PI) * 120,
        rot: 34 - u * 14,
      };
    }
    if (t < 26.8) {
      // Races backward through Curved Tunnel!
      const u = inv(26.4, 26.8, t);
      const omt = 1 - u;
      return {
        x: omt * omt * TUNNEL_END.x + 2 * omt * u * TUNNEL_CTRL.x + u * u * TUNNEL_START.x,
        y: omt * omt * TUNNEL_END.y + 2 * omt * u * TUNNEL_CTRL.y + u * u * TUNNEL_START.y,
        rot: 20 - u * 16,
      };
    }
    if (t < 27.18) {
      // Drops straight down onto Curved Ramp & slams into Stickman's feet (575, FLOOR_Y - BALL_R)!
      const u = inv(26.8, 27.18, t);
      return {
        x: lerp(TUNNEL_START.x, 575, u),
        y: lerp(TUNNEL_START.y, FLOOR_Y - BALL_R, u * u),
        rot: 4 + u * 12,
      };
    }
    // Rebounds left on floor after knocking Stickman backward into lane!
    const u = easeOut(inv(27.18, 28.1, t));
    return { x: lerp(575, 425, u), y: FLOOR_Y - BALL_R, rot: 16 - u * 6 };
  }

  // -------------------------------------------------------------------------
  // 10 White Bowling Pins with Red Stripes (Consistent State Across All 5 Scenes!)
  // -------------------------------------------------------------------------
  private drawBowlingPins(ctx: CanvasRenderingContext2D, t: number) {
    // Draw back-to-front by y so perspective stacking looks clean
    const sorted = [...PINS].sort((a, b) => a.y - b.y);

    for (const p of sorted) {
      let px = p.x;
      let py = p.y;
      let rot = 0;

      if (t < 6.0) {
        // Scene 1: all 10 pins stand tall!
      } else if (t < 12.0) {
        // Scene 2: ONLY Pin #0 gets knocked down at 10.15s! (Other 9 stand!)
        if (p.id === 0 && t >= 10.15) {
          const u = easeOut(inv(10.15, 10.75, t));
          px = p.x + lerp(0, 65, u);
          py = p.y + lerp(0, 8, u) - Math.sin(u * Math.PI) * 35;
          rot = lerp(0, 1.54, u);
        }
      } else if (t < 22.45) {
        // Scene 3 & early Scene 4: all 10 pins stand ready for the backwards strike!
      } else if (t < 24.0) {
        // Scene 4 (22.45s): ALL 10 PINS COLLAPSE IN ONE PERFECT STRIKE!
        const u = easeOut(inv(22.45, 23.25, t));
        if (p.id === 9) {
          // Pin #9 launches skyward above frame during the strike explosion!
          px = p.x;
          py = lerp(p.y, -180, u);
          rot = u * 8.5;
        } else {
          px = p.x + p.fallDx * u;
          py = p.y + p.fallDy * u - Math.sin(u * Math.PI) * (58 + (p.id % 3) * 20);
          rot = p.fallRot * u;
        }
      } else {
        // Scene 5 (24–30s): Pins #0..#8 remain collapsed on the lane; Pin #9 drops onto Stickman's head!
        if (p.id !== 9) {
          px = p.x + p.fallDx;
          py = p.y + p.fallDy;
          rot = p.fallRot;
        } else {
          // Stickman falls backward into lane so his head sits around (845, 1435)
          const targetHeadX = 845;
          const targetHeadY = 1412;
          if (t < 27.95) {
            px = targetHeadX;
            py = -180;
            rot = 0.25;
          } else if (t < 28.35) {
            const u = easeIn(inv(27.95, 28.35, t));
            px = targetHeadX;
            py = lerp(-180, targetHeadY, u);
            rot = lerp(0.18, -0.22, u);
          } else {
            // Settles tilted right on top of Stickman's head with a tiny wobble!
            const w = Math.sin((t - 28.35) * 14) * Math.exp(-(t - 28.35) * 4) * 0.14;
            px = targetHeadX;
            py = targetHeadY;
            rot = -0.22 + w;
          }
        }
      }

      this.drawSinglePin(ctx, px, py, rot);
    }
  }

  private drawSinglePin(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Classic bowling pin silhouette anchored at base (0, 0), total height ~114px
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.quadraticCurveTo(-24, -36, -15, -62);
    ctx.quadraticCurveTo(-8, -78, -9, -90);
    ctx.arc(0, -96, 11, Math.PI * 0.85, Math.PI * 0.15, false);
    ctx.quadraticCurveTo(8, -78, 15, -62);
    ctx.quadraticCurveTo(24, -36, 14, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dual Red Stripes around the neck (consistent across all 10 pins!)
    ctx.fillStyle = PIN_STRIPE;
    ctx.fillRect(-10, -78, 20, 6);
    ctx.fillRect(-12, -68, 24, 6);

    // Re-stroke outline cleanly over stripes
    ctx.stroke();
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Bowling Alley Backdrop & Lane Deck
  // -------------------------------------------------------------------------
  private drawBackdrop(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = WALL_BG;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Subtle bowling alley backdrop band & scoreboard trim
    ctx.fillStyle = WALL_BAND;
    ctx.fillRect(0, FLOOR_Y - 125, WIDTH, 125);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    for (let x = 120; x < WIDTH; x += 240) {
      ctx.beginPath();
      ctx.moveTo(x, 120);
      ctx.lineTo(x, FLOOR_Y - 125);
      ctx.stroke();
    }

    // Wooden Bowling Lane on Right Approach (x = 500..1080) & Approach Floor on Left
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, FLOOR_Y, 520, HEIGHT - FLOOR_Y);

    ctx.fillStyle = LANE_WOOD;
    ctx.fillRect(520, FLOOR_Y, WIDTH - 520, HEIGHT - FLOOR_Y);

    // Alternating wood planks on the bowling lane
    ctx.fillStyle = LANE_WOOD_ALT;
    for (let px = 540; px < WIDTH; px += 64) {
      ctx.fillRect(px, FLOOR_Y, 26, HEIGHT - FLOOR_Y);
    }

    // Foul line & gutter trim
    ctx.strokeStyle = LANE_BORDER;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(520, FLOOR_Y);
    ctx.lineTo(520, HEIGHT);
    ctx.stroke();

    // Floor edge
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(WIDTH, FLOOR_Y);
    ctx.stroke();

    // Subtle gutter strip behind pins
    ctx.fillStyle = GUTTER_DARK;
    ctx.fillRect(985, FLOOR_Y - 14, 95, 14);
  }

  // -------------------------------------------------------------------------
  // Props (Curved Ramp, Spinning Platform, 2 Mirrors, Curved Tunnel, Spring Ramp)
  // -------------------------------------------------------------------------
  private drawPropsBack(ctx: CanvasRenderingContext2D, t: number) {
    // Scene 2+: Curved Ramp behind Stickman
    if (t >= 6.0) {
      this.drawCurvedRamp(ctx, t);
    }

    // Scene 3+: Two Mirrors + Spinning Platform
    if (t >= 12.0) {
      this.drawSpinningPlatform(ctx, t);
      this.drawMirror(ctx, MIRROR_1.x, MIRROR_1.y, MIRROR_1.angle, t >= 15.0 && t <= 15.3);
      this.drawMirror(ctx, MIRROR_2.x, MIRROR_2.y, MIRROR_2.angle, t >= 15.95 && t <= 16.25);
    }

    // Scene 4+: Curved Tunnel + Spring Ramp
    if (t >= 18.0) {
      this.drawCurvedTunnelBack(ctx);
      this.drawSpringRamp(ctx, t);
    }
  }

  private drawPropsFront(ctx: CanvasRenderingContext2D, t: number) {
    if (t >= 18.0) {
      this.drawCurvedTunnelFront(ctx);
    }
  }

  private drawCurvedRamp(ctx: CanvasRenderingContext2D, t: number) {
    const pop = t < 6.4 ? easeOut(inv(6.0, 6.4, t)) : 1;
    ctx.save();
    if (pop < 1) {
      ctx.translate(320, FLOOR_Y);
      ctx.scale(1, pop);
      ctx.translate(-320, -FLOOR_Y);
    }

    // Support block
    ctx.fillStyle = RAMP_DEEP;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(155, 1300);
    ctx.lineTo(155, FLOOR_Y);
    ctx.lineTo(240, FLOOR_Y);
    ctx.lineTo(240, 1430);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Curved Ramp chute
    ctx.strokeStyle = INK;
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(CURVED_RAMP_P0.x, CURVED_RAMP_P0.y + 12);
    ctx.quadraticCurveTo(CURVED_RAMP_CTRL.x, CURVED_RAMP_CTRL.y + 12, CURVED_RAMP_P2.x, CURVED_RAMP_P2.y + 12);
    ctx.stroke();

    ctx.strokeStyle = RAMP_ORANGE;
    ctx.lineWidth = 16;
    ctx.stroke();
    ctx.restore();
  }

  private drawSpinningPlatform(ctx: CanvasRenderingContext2D, t: number) {
    const spin = t * 4.2;
    ctx.save();
    ctx.translate(SPIN_PLATFORM.x, SPIN_PLATFORM.y);

    // Wall bracket
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-110, 0);
    ctx.stroke();

    ctx.rotate(spin);
    ctx.fillStyle = PLATFORM_BLUE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(-84, -14, 168, 28, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawMirror(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, flash: boolean) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.fillStyle = MIRROR_FRAME;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-84, -18, 168, 30, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = flash ? '#ffffff' : MIRROR_CYAN;
    ctx.beginPath();
    ctx.roundRect(-74, -12, 148, 14, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawCurvedTunnelBack(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = TUNNEL_RIM;
    ctx.lineWidth = 92;
    ctx.beginPath();
    ctx.moveTo(TUNNEL_START.x, TUNNEL_START.y);
    ctx.quadraticCurveTo(TUNNEL_CTRL.x, TUNNEL_CTRL.y, TUNNEL_END.x, TUNNEL_END.y);
    ctx.stroke();

    ctx.strokeStyle = TUNNEL_TEAL;
    ctx.lineWidth = 80;
    ctx.stroke();
    ctx.restore();
  }

  private drawCurvedTunnelFront(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(TUNNEL_START.x + 6, TUNNEL_START.y - 22);
    ctx.quadraticCurveTo(TUNNEL_CTRL.x, TUNNEL_CTRL.y - 22, TUNNEL_END.x - 6, TUNNEL_END.y - 22);
    ctx.stroke();
    ctx.restore();
  }

  private drawSpringRamp(ctx: CanvasRenderingContext2D, t: number) {
    const bounce =
      (t >= 21.25 && t <= 21.65) || (t >= 26.05 && t <= 26.35)
        ? Math.sin(((t % 1) * Math.PI) * 6) * 10
        : 0;

    ctx.save();
    ctx.translate(SPRING_RAMP.x, SPRING_RAMP.y);

    // Base block
    ctx.fillStyle = MIRROR_FRAME;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(-55, 28, 110, 22, 6);
    ctx.fill();
    ctx.stroke();

    // Red coil spring
    ctx.strokeStyle = INK;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(-25, 28);
    ctx.lineTo(25, 14 + bounce);
    ctx.lineTo(-25, 4 + bounce);
    ctx.lineTo(20, -6 + bounce);
    ctx.stroke();
    ctx.strokeStyle = SPRING_RED;
    ctx.lineWidth = 6.5;
    ctx.stroke();

    // Angled launch plate
    ctx.translate(0, bounce);
    ctx.rotate(0.32);
    ctx.fillStyle = RAMP_ORANGE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(-72, -14, 144, 22, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Purple Bowling Ball (Consistent Size, Color & Rotating Finger Holes)
  // -------------------------------------------------------------------------
  private drawPurpleBowlingBall(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.fillStyle = BALL_PURPLE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Crescent shade
    ctx.fillStyle = BALL_DEEP;
    ctx.beginPath();
    ctx.arc(4, 5, BALL_R - 6, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.fill();

    // Specular gleam
    ctx.fillStyle = BALL_GLOW;
    ctx.beginPath();
    ctx.arc(-10, -10, 7.5, 0, TAU);
    ctx.fill();

    // Three classic bowling finger holes
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(8, -7, 4, 0, TAU);
    ctx.arc(14, 2, 4, 0, TAU);
    ctx.arc(4, 3, 4, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Strike Confetti & Impact Sparks
  // -------------------------------------------------------------------------
  private drawActionFX(ctx: CanvasRenderingContext2D, t: number) {
    // Perfect Strike confetti burst (22.45–25.0s)
    if (t >= 22.45 && t <= 25.0) {
      const u = inv(22.45, 25.0, t);
      const colors = ['#facc15', '#a855f7', '#3b82f6', '#22c55e', '#ef4444'];
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * TAU;
        const dist = 48 + u * (180 + (i % 4) * 35);
        const px = 835 + Math.cos(ang) * dist;
        const py = 1360 + Math.sin(ang) * dist * 0.72 + u * u * 160;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(u * 6 + i);
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.fillRect(-7, -4, 14, 8);
        ctx.strokeRect(-7, -4, 14, 8);
        ctx.restore();
      }
    }
  }

  // -------------------------------------------------------------------------
  // Locked Angry Stickman Rig (with Scene 5 Backward Fall Pivot!)
  // -------------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, ch: CharState, pose: Pose, t: number) {
    const x = ch.x;
    const hipY = 1260 - ch.lift + pose.hipDrop + pose.crouch * 45;

    ctx.save();
    if (pose.bodyFallAngle > 0.001) {
      // Pivot cleanly from feet on lane (x, FLOOR_Y - 14) falling backward rightward into the lane!
      ctx.translate(x, FLOOR_Y - 14);
      ctx.rotate(pose.bodyFallAngle);
      ctx.translate(-x, -(FLOOR_Y - 14));
    }

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

    ctx.restore();
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

    ctx.fillStyle = '#c084fc';
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
