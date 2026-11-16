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

const WOOD_TOP = '#d97706';
const WOOD_LEG = '#b45309';
const RAMP_TOP = '#f59e0b';
const CUP_RED = '#ef4444';
const CUP_DARK = '#b91c1c';
const BALL_ORANGE = '#f97316';
const BALL_HIGHLIGHT = '#fdba74';

const SOFA_MAIN = '#0d9488';
const SOFA_CUSHION = '#14b8a6';
const SOFA_DEEP = '#0f766e';

// Metallic rainbow palette for the giant slinky coils
const RAINBOW_COILS = [
  '#ef4444',
  '#f97316',
  '#facc15',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
];

const FLOOR_Y = 1500;
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
  // Scene 1 (0–6s): Finds giant rainbow slinky -> stretches between hands -> snaps -> ball bonks forehead!
  {
    t: 0.0,
    p: {
      lean: 0.08,
      look: 'down',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -64, y: 1245 },
      handR: { x: 74, y: 1245 },
    },
  },
  {
    t: 0.9,
    p: {
      lean: 0.16,
      crouch: 0.55,
      look: 'down',
      mouth: 'smile',
      brow: 'cocky',
      eye: 'open',
      handL: { x: -45, y: 1380 },
      handR: { x: 75, y: 1380 },
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 1.65,
    p: {
      lean: 0.0,
      crouch: 0.0,
      look: 'right',
      mouth: 'grin',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -135, y: 1185 },
      handR: { x: 145, y: 1185 },
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 2.65,
    p: {
      lean: -0.05,
      stance: 18,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      handL: { x: -175, y: 1180 },
      handR: { x: 175, y: 1180 },
    },
  },
  {
    t: 2.95,
    p: {
      lean: -0.1,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      gripR: false,
      handL: { x: -115, y: 1190 },
      handR: { x: 155, y: 1145 },
    },
  },
  {
    t: 3.85,
    p: {
      lean: -0.22,
      headTilt: -0.24,
      look: 'front',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      gripL: false,
      handL: { x: -86, y: 1120 },
      handR: { x: 86, y: 1120 },
    },
  },
  {
    t: 4.9,
    p: {
      lean: 0.04,
      headTilt: 0.0,
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

  // Scene 2 (6–12s): Stretches slinky between two tables -> launches ball -> misses cup & lands in shoe!
  {
    t: 6.2,
    p: {
      lean: 0.1,
      fistL: false,
      fistR: false,
      look: 'right',
      mouth: 'flat',
      brow: 'determined',
    },
  },
  {
    t: 6.3,
    p: {
      lean: 0.06,
      look: 'front',
      mouth: 'smirk',
      brow: 'determined',
      eye: 'open',
      handL: { x: -140, y: 1210 },
      handR: { x: 140, y: 1210 },
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 7.9,
    p: {
      lean: 0.14,
      crouch: 0.35,
      look: 'down',
      mouth: 'grit',
      brow: 'determined',
      handL: { x: -45, y: 1320 },
      handR: { x: 55, y: 1320 },
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 8.85,
    p: {
      lean: -0.04,
      crouch: 0.0,
      look: 'up',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'wide',
      gripL: false,
      gripR: false,
      handL: { x: -95, y: 1110 },
      handR: { x: 95, y: 1110 },
    },
  },
  {
    t: 10.55,
    p: {
      lean: -0.06,
      footLift: 68,
      look: 'down',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -78, y: 1230 },
      handR: { x: 78, y: 1230 },
      fistL: true,
      fistR: true,
    },
  },
  {
    t: 11.4,
    p: {
      lean: 0.22,
      footLift: 0,
      look: 'right',
      mouth: 'o',
      brow: 'determined',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handL: { x: -72, y: 1215 },
      handR: { x: 92, y: 1215 },
      gripR: true,
    },
  },

  // Scene 3 (12–18s): Sets cup on coffee table, climbs stairs, stretches giant slinky down ramp & pulls back!
  {
    t: 13.8,
    p: {
      lean: 0.12,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'open',
      handL: { x: -65, y: 740 },
      handR: { x: 105, y: 740 },
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 16.0,
    p: {
      lean: -0.18,
      crouch: 0.28,
      stance: 22,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      handL: { x: 52, y: 790 },
      handR: { x: 78, y: 805 },
      gripL: true,
      gripR: true,
    },
  },
  {
    t: 17.6,
    p: {
      lean: -0.26,
      crouch: 0.35,
      stance: 26,
      look: 'right',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      handL: { x: 20, y: 780 },
      handR: { x: 46, y: 795 },
      gripL: true,
      gripR: true,
    },
  },

  // Scene 4 (18–24s): Releases mega spring -> watches ball rocket through coil loop, wall, over sofa -> toward cup!
  {
    t: 18.0,
    p: {
      lean: 0.14,
      crouch: 0,
      stance: 18,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      gripL: false,
      gripR: false,
      handL: { x: -95, y: 710 },
      handR: { x: 115, y: 720 },
    },
  },
  {
    t: 20.5,
    p: {
      lean: 0.12,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -78, y: 1210 },
      handR: { x: 94, y: 1150 },
      pointR: true,
    },
  },
  {
    t: 22.8,
    p: {
      lean: 0.16,
      crouch: 0.22,
      pointR: false,
      look: 'right',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -55, y: 1200 },
      handR: { x: 55, y: 1200 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 5 (24–30s): Swish! Celebrates -> giant slinky recoils into spring cage & bounces him (beanie flies off!)
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
    t: 26.0,
    p: {
      lean: -0.14,
      stance: 12,
      look: 'left',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handL: { x: -102, y: 1125 },
      handR: { x: 102, y: 1125 },
    },
  },
  {
    t: 26.65,
    p: {
      beanieOn: false,
      lean: 0.0,
      headTilt: -0.12,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -86, y: 1185 },
      handR: { x: 86, y: 1185 },
      bendL: 1,
      bendR: 1,
    },
  },
  {
    t: 28.4,
    p: {
      beanieOn: false,
      lean: 0.0,
      headTilt: 0.08,
      look: 'front',
      mouth: 'grit',
      brow: 'angry',
      eye: 'squint',
      handL: { x: -72, y: 1215 },
      handR: { x: 72, y: 1215 },
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
  { from: 0.25, to: 5.75, text: 'THIS SPRING IS CRAZY!' },
  { from: 6.25, to: 11.75, text: 'MORE POWER!' },
  { from: 12.25, to: 17.75, text: 'MAXIMUM SPRING POWER!' },
  { from: 18.25, to: 23.75, text: 'THE PERFECT SHOT?!' },
  { from: 24.25, to: 29.85, text: 'THE SPRING WON! 😂' },
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
  visible: boolean;
}

export class GiantSlinkyRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const camX = this.camXAt(time);
    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.walkPhase);
    const ball = this.ballAt(time);

    ctx.save();
    ctx.translate(-camX, 0);

    // 1. Living Room Backdrop, Tables, Staircase + Wooden Ramp, Coffee Table, Plush Sofa
    this.drawRoomBackdrop(ctx);
    this.drawFurniture(ctx, time);

    // 2. Red Target Cup Back Half (so ball can drop inside cleanly)
    const cupPos = this.cupPosAt(time, ch);
    this.drawCupBack(ctx, cupPos.x, cupPos.y);

    // 3. Back Layer of Giant Metallic Rainbow Slinky (when caging Stickman in Scene 5, or floor/tables/stairs)
    const isCaged = time >= 26.55;
    if (isCaged) {
      this.drawSpringCageLayer(ctx, ch, time, 'back');
    } else {
      this.drawSlinkyWorld(ctx, ch, pose, time);
    }

    // 4. Locked Angry Stickman
    this.drawCharacter(ctx, ch, pose, time);

    // 5. Front Layer of Giant Rainbow Slinky Cage (wrapping over Stickman's torso in Scene 5)
    if (isCaged) {
      this.drawSpringCageLayer(ctx, ch, time, 'front');
    }

    // 6. Orange Ball & Red Target Cup Front Lip (so ball sits cleanly inside cup or shoe)
    if (ball.visible) {
      this.drawOrangeBall(ctx, ball.x, ball.y, ball.rot);
    }
    this.drawCupFront(ctx, cupPos.x, cupPos.y);

    // 7. Flying Red Beanie when knocked off in Scene 5 + Impact / Celebration FX
    this.drawLooseBeanie(ctx, time, ch);
    this.drawVisualFX(ctx, time, ch);

    ctx.restore();

    // 8. Burned-in Scene Captions & Safe Zones
    this.drawCaptions(ctx, time);
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Camera, Character, Pose, Cup & Ball Timelines
  // -------------------------------------------------------------------------
  private camXAt(t: number): number {
    if (t < 11.4) return 0;
    if (t < 13.8) return lerp(0, 1080, smooth(inv(11.4, 13.8, t)));
    return 1080;
  }

  private charAt(t: number): CharState {
    let x = 445;
    let ground = FLOOR_Y;
    let lift = 0;
    let walkPhase = 0;

    if (t < 11.4) {
      x = 445;
    } else if (t < 13.3) {
      // Runs across room carrying red cup & slinky to coffee table (x=1520)
      const k = smooth(inv(11.4, 13.3, t));
      x = lerp(445, 1520, k);
      walkPhase = k * TAU * 4.5;
    } else if (t < 14.5) {
      // Sprints back left up the staircase to top landing (x=1150, ground=1030)
      const k = smooth(inv(13.3, 14.5, t));
      x = lerp(1520, 1150, k);
      ground = lerp(FLOOR_Y, 1030, k);
      walkPhase = k * TAU * 3;
    } else if (t < 19.2) {
      x = 1150;
      ground = 1030;
    } else if (t < 21.4) {
      // Runs down stairs to watch the shot beside coffee table (x=1365, ground=1500)
      const k = smooth(inv(19.2, 21.4, t));
      x = lerp(1150, 1365, k);
      ground = lerp(1030, FLOOR_Y, k);
      walkPhase = k * TAU * 3;
    } else if (t < 24.3) {
      x = 1365;
    } else if (t < 26.0) {
      // Celebrates!
      x = 1365;
      const j = ((t - 24.3) * 2.5) % 1;
      lift = Math.sin(j * Math.PI) * 58;
    } else if (t < 26.65) {
      x = 1365;
    } else {
      // Spring-cage bounces Stickman violently up and down!
      x = 1365;
      const b1 = t < 27.3 ? Math.sin(inv(26.65, 27.3, t) * Math.PI) * 320 : 0;
      const b2 = t >= 27.3 && t < 28.35 ? Math.sin(inv(27.3, 28.35, t) * Math.PI) * 260 : 0;
      const b3 = t >= 28.35 && t < 29.3 ? Math.sin(inv(28.35, 29.3, t) * Math.PI) * 195 : 0;
      const b4 = t >= 29.3 ? Math.abs(Math.sin((t - 29.3) * 9)) * 36 * (1 - inv(29.3, 30.0, t)) : 0;
      lift = b1 + b2 + b3 + b4;
    }

    return { x, ground, lift, walkPhase };
  }

  private cupPosAt(t: number, ch: CharState): Pt {
    // Scene 1–2: sits on Right Table (785, 1240)
    if (t < 12.1) {
      return { x: 785, y: 1240 };
    }
    // Carried cleanly across room to Coffee Table (1600, 1360)
    if (t < 13.2) {
      const k = smooth(inv(12.1, 13.2, t));
      return {
        x: lerp(785, 1600, k),
        y: lerp(1240, 1360, k) - Math.sin(k * Math.PI) * 110,
      };
    }
    // Stays firmly visible on Coffee Table for Scenes 3, 4 & 5
    void ch;
    return { x: 1600, y: 1360 };
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
    // Scene 1 (0–6s): Floor beside slinky -> picked up -> launched across room -> wall bounce -> forehead BONK!
    if (t < 0.9) {
      return { x: 615, y: FLOOR_Y - BALL_R, rot: 0, visible: true };
    }
    if (t < 1.65) {
      const k = smooth(inv(0.9, 1.65, t));
      return { x: lerp(615, 585, k), y: lerp(FLOOR_Y - BALL_R, 1185, k), rot: k * 2, visible: true };
    }
    if (t < 2.95) {
      const k = smooth(inv(1.65, 2.95, t));
      return { x: lerp(585, 615, k), y: 1182, rot: 2, visible: true };
    }
    if (t < 3.42) {
      // Snaps across the room to right wall (985, 960)
      const u = inv(2.95, 3.42, t);
      return {
        x: lerp(615, 985, u),
        y: lerp(1182, 960, u) - Math.sin(u * Math.PI) * 85,
        rot: 2 + u * 12,
        visible: true,
      };
    }
    if (t < 3.85) {
      // Wall rebound straight into Stickman's forehead (445, 1110)
      const u = inv(3.42, 3.85, t);
      return {
        x: lerp(985, 455, u),
        y: lerp(960, 1110, u) - Math.sin(u * Math.PI) * 55,
        rot: 14 + u * 10,
        visible: true,
      };
    }
    if (t < 4.55) {
      // Drops from forehead to floor
      const u = inv(3.85, 4.55, t);
      return {
        x: lerp(455, 535, u),
        y: lerp(1110, FLOOR_Y - BALL_R, u * u),
        rot: 24 + u * 5,
        visible: true,
      };
    }
    if (t < 7.5) {
      return { x: 535, y: FLOOR_Y - BALL_R, rot: 29, visible: true };
    }

    // Scene 2 (6–12s): Placed in two-table slinky slingshot -> launches upward -> misses cup -> lands in his shoe!
    if (t < 7.9) {
      const k = smooth(inv(7.5, 7.9, t));
      return { x: lerp(535, 445, k), y: lerp(FLOOR_Y - BALL_R, 1345, k), rot: 29, visible: true };
    }
    if (t < 8.8) {
      const vib = Math.sin(t * 48) * 3;
      return { x: 445 + vib, y: 1345, rot: 29, visible: true };
    }
    if (t < 9.7) {
      // Rockets upward toward cup at (785, 1172)
      const u = inv(8.8, 9.7, t);
      return {
        x: lerp(445, 755, u),
        y: lerp(1345, 1135, u) - Math.sin(u * Math.PI) * 560,
        rot: 29 + u * 16,
        visible: true,
      };
    }
    if (t < 10.55) {
      // Misses cup rim and arcs straight down into Stickman's lifted right shoe (505, 1414)!
      const u = inv(9.7, 10.55, t);
      return {
        x: lerp(755, 505, u),
        y: lerp(1135, 1414, u) - Math.sin(u * Math.PI) * 185,
        rot: 45 + u * 12,
        visible: true,
      };
    }
    if (t < 11.4) {
      return { x: 505, y: 1414, rot: 57, visible: true };
    }
    if (t < 14.5) {
      // Carried cleanly across room with Stickman up to the staircase starting point
      const k = smooth(inv(11.4, 14.5, t));
      return {
        x: lerp(505, 1210, k),
        y: lerp(1414, 1010, k) - Math.sin(k * Math.PI) * 90,
        rot: 57 + k * 8,
        visible: true,
      };
    }

    // Scene 3 (12–18s): Placed at top of giant staircase ramp & pulled back!
    if (t < 16.0) {
      return { x: 1210, y: 1010, rot: 65, visible: true };
    }
    if (t < 18.0) {
      const pull = smooth(inv(16.0, 17.8, t));
      const vib = pull * Math.sin(t * 58) * 3;
      return {
        x: lerp(1210, 1168, pull) + vib,
        y: lerp(1010, 995, pull),
        rot: 65,
        visible: true,
      };
    }

    // Scene 4 (18–24s): Rockets down ramp -> 360° rainbow coil loop -> wall bounce -> flies over sofa -> cup!
    if (t < 18.85) {
      const u = inv(18.0, 18.85, t);
      return {
        x: lerp(1168, 1455, u * 0.65 + u * u * 0.35),
        y: lerp(995, 1272, u * 0.65 + u * u * 0.35),
        rot: 65 + u * 18,
        visible: true,
      };
    }
    if (t < 19.95) {
      // Full 360° circular coil loop centered at (1515, 1190), radius 82
      const u = inv(18.85, 19.95, t);
      const ang = Math.PI * 0.5 - u * TAU;
      return {
        x: 1515 + Math.cos(ang) * 82,
        y: 1190 + Math.sin(ang) * 82,
        rot: 83 + u * 20,
        visible: true,
      };
    }
    if (t < 21.05) {
      // Rockets up-right over sofa toward right wall (2102, 790)
      const u = inv(19.95, 21.05, t);
      return {
        x: lerp(1515, 2102, u),
        y: lerp(1272, 790, u) - Math.sin(u * Math.PI) * 145,
        rot: 103 + u * 18,
        visible: true,
      };
    }
    if (t < 22.8) {
      // Bounces off right wall & flies cleanly OVER the plush sofa (x=2025..1715)
      const u = inv(21.05, 22.8, t);
      return {
        x: lerp(2102, 1695, u),
        y: lerp(790, 980, u) - Math.sin(u * Math.PI) * 265,
        rot: 121 + u * 16,
        visible: true,
      };
    }
    if (t < 24.25) {
      // Suspenseful arc down into the tiny Red Target Cup at (1600, 1292)
      const u = inv(22.8, 24.25, t);
      return {
        x: lerp(1695, 1600, smooth(u)),
        y: lerp(980, 1292, u) - Math.sin(u * Math.PI) * 110,
        rot: 137 + u * 10,
        visible: true,
      };
    }

    // Scene 5 (24–30s): Drops inside the red target cup and stays tucked cleanly inside!
    if (t < 24.5) {
      const u = inv(24.25, 24.5, t);
      return {
        x: 1600,
        y: lerp(1292, 1326, u),
        rot: 147,
        visible: true,
      };
    }
    return { x: 1600, y: 1326, rot: 147, visible: true };
  }

  // -------------------------------------------------------------------------
  // Living Room Backdrop, Tables, Staircase + Wooden Ramp & Plush Sofa
  // -------------------------------------------------------------------------
  private drawRoomBackdrop(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = ROOM_WALL;
    ctx.fillRect(0, 0, 2200, FLOOR_Y);

    // Warm dado wainscoting band
    ctx.fillStyle = ROOM_BAND;
    ctx.fillRect(0, 1160, 2200, FLOOR_Y - 1160);
    ctx.strokeStyle = '#d6cbba';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 1160);
    ctx.lineTo(2200, 1160);
    ctx.stroke();

    // Framed pop art paintings on walls
    const drawPicture = (px: number, py: number, pw: number, ph: number, accent: string) => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(px + pw * 0.5, py + ph * 0.5, Math.min(pw, ph) * 0.25, 0, TAU);
      ctx.fill();
      ctx.stroke();
    };
    drawPicture(190, 620, 180, 150, '#fbbf24');
    drawPicture(820, 560, 140, 190, '#38bdf8');
    drawPicture(1760, 520, 200, 160, '#a855f7');

    // Right wall boundary bumper line
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(2118, 0, 82, FLOOR_Y);
    ctx.fill();
    ctx.stroke();

    // Wooden floor planks
    ctx.fillStyle = FLOOR_WOOD;
    ctx.fillRect(0, FLOOR_Y, 2200, HEIGHT - FLOOR_Y);
    ctx.strokeStyle = FLOOR_PLANK;
    ctx.lineWidth = 4;
    for (let fy = FLOOR_Y + 46; fy < HEIGHT; fy += 60) {
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.lineTo(2200, fy);
      ctx.stroke();
    }

    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(2200, FLOOR_Y);
    ctx.stroke();
  }

  private drawFurniture(ctx: CanvasRenderingContext2D, _t: number) {
    // Zone A Table 1 (120..300, top y=1240) & Table 2 (640..860, top y=1240)
    const drawTable = (tx: number, ty: number, tw: number) => {
      ctx.fillStyle = WOOD_LEG;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      for (const lx of [tx + 20, tx + tw - 38]) {
        ctx.beginPath();
        ctx.rect(lx, ty + 20, 18, FLOOR_Y - (ty + 20));
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = WOOD_TOP;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, 24, 8);
      ctx.fill();
      ctx.stroke();
    };
    drawTable(120, 1240, 180);
    drawTable(640, 1240, 220);

    // Zone B Staircase (1110..1490) + Smooth Wooden Ramp along steps
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(1110, FLOOR_Y);
    ctx.lineTo(1110, 1030);
    ctx.lineTo(1210, 1030);
    ctx.lineTo(1210, 1125);
    ctx.lineTo(1280, 1125);
    ctx.lineTo(1280, 1220);
    ctx.lineTo(1350, 1220);
    ctx.lineTo(1350, 1315);
    ctx.lineTo(1420, 1315);
    ctx.lineTo(1420, 1410);
    ctx.lineTo(1490, 1410);
    ctx.lineTo(1490, FLOOR_Y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top stair anchor post at (1175, 1030)
    ctx.fillStyle = WOOD_LEG;
    ctx.beginPath();
    ctx.roundRect(1164, 982, 22, 48, 6);
    ctx.fill();
    ctx.stroke();

    // Sloping Wooden Ramp resting solidly on the stairs (1175, 1020) -> (1485, 1320)
    ctx.save();
    ctx.translate(1175, 1020);
    ctx.rotate(Math.atan2(300, 310));
    ctx.fillStyle = RAMP_TOP;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(0, -12, Math.hypot(310, 300), 22, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Wooden Coffee Table holding Red Target Cup (1535..1665, top y=1360)
    drawTable(1535, 1360, 130);

    // Plush Living-Room Sofa (1715..2025, floor=1500)
    ctx.fillStyle = SOFA_DEEP;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(1725, 1235, 290, 180, 26);
    ctx.fill();
    ctx.stroke();

    // Sofa base & armrests
    ctx.fillStyle = SOFA_MAIN;
    ctx.beginPath();
    ctx.roundRect(1715, 1330, 310, 145, 22);
    ctx.fill();
    ctx.stroke();

    // Two plump cushions
    ctx.fillStyle = SOFA_CUSHION;
    ctx.beginPath();
    ctx.roundRect(1748, 1320, 118, 56, 16);
    ctx.roundRect(1874, 1320, 118, 56, 16);
    ctx.fill();
    ctx.stroke();

    // Sofa wooden feet
    ctx.fillStyle = WOOD_LEG;
    for (const fx of [1740, 1982]) {
      ctx.beginPath();
      ctx.roundRect(fx, 1475, 18, 25, 4);
      ctx.fill();
      ctx.stroke();
    }
  }

  private drawCupBack(ctx: CanvasRenderingContext2D, cx: number, bottomY: number) {
    ctx.fillStyle = CUP_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(cx, bottomY - 68, 28, 8, 0, 0, TAU);
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

    // Bright white pop rim highlight
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 21, bottomY - 62);
    ctx.lineTo(cx + 21, bottomY - 62);
    ctx.stroke();
  }

  // -------------------------------------------------------------------------
  // Giant Metallic Rainbow Slinky Renderer (Stretch, Compression, Loop & Cage)
  // -------------------------------------------------------------------------
  private drawCoilRing(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    rot: number,
    color: string,
    wireW: number
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Outer ink outline
    ctx.strokeStyle = INK;
    ctx.lineWidth = wireW + 7;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
    ctx.stroke();

    // Vibrant rainbow coil fill
    ctx.strokeStyle = color;
    ctx.lineWidth = wireW;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
    ctx.stroke();

    // Metallic specular gleam
    ctx.strokeStyle = 'rgba(255,255,255,0.62)';
    ctx.lineWidth = Math.max(2, wireW * 0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, Math.PI * 1.12, Math.PI * 1.65);
    ctx.stroke();

    ctx.restore();
  }

  private drawSlinkyPath(
    ctx: CanvasRenderingContext2D,
    pts: Pt[],
    rx: number,
    ry: number,
    wireW: number
  ) {
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const next = pts[Math.min(i + 1, pts.length - 1)];
      const prev = pts[Math.max(i - 1, 0)];
      const angle = Math.atan2(next.y - prev.y, next.x - prev.x);
      const color = RAINBOW_COILS[i % RAINBOW_COILS.length];
      this.drawCoilRing(ctx, p.x, p.y, rx, ry, angle + Math.PI * 0.5, color, wireW);
    }
  }

  private drawSlinkyWorld(
    ctx: CanvasRenderingContext2D,
    ch: CharState,
    pose: Pose,
    t: number
  ) {
    // 1. Scene 1 (0–6s): Floor coil -> stretched between Stickman's hands -> snaps violently back!
    if (t < 6.0) {
      if (t < 0.9) {
        // Resting coiled stack on floor at x=575
        const pts: Pt[] = [];
        for (let i = 0; i < 14; i++) {
          pts.push({ x: 575, y: FLOOR_Y - 12 - i * 8 });
        }
        this.drawSlinkyPath(ctx, pts, 42, 13, 8);
        return;
      }
      if (t < 1.65) {
        const k = smooth(inv(0.9, 1.65, t));
        const hxL = ch.x + pose.handL.x;
        const hyL = ch.ground - (FLOOR_Y - pose.handL.y);
        const hxR = ch.x + pose.handR.x;
        const hyR = ch.ground - (FLOOR_Y - pose.handR.y);
        const pts: Pt[] = [];
        for (let i = 0; i < 18; i++) {
          const u = i / 17;
          pts.push({
            x: lerp(lerp(575, hxL, k), lerp(575, hxR, k), u),
            y: lerp(lerp(FLOOR_Y - 16 - i * 6, hyL, k), lerp(FLOOR_Y - 16 - i * 6, hyR, k), u),
          });
        }
        this.drawSlinkyPath(ctx, pts, 38, 14, 7.5);
        return;
      }
      if (t < 2.95) {
        // Stretched taut between hands with visible vibration
        const hxL = ch.x + pose.handL.x;
        const hyL = pose.handL.y;
        const hxR = ch.x + pose.handR.x;
        const hyR = pose.handR.y;
        const tension = inv(1.65, 2.95, t);
        const pts: Pt[] = [];
        for (let i = 0; i < 20; i++) {
          const u = i / 19;
          const vib = tension * Math.sin(t * 58 + i * 0.7) * 5;
          pts.push({
            x: lerp(hxL, hxR, u),
            y: lerp(hyL, hyR, u) + Math.sin(u * Math.PI) * 18 * (1 - tension * 0.7) + vib,
          });
        }
        this.drawSlinkyPath(ctx, pts, 34, 13, 7.5);
        return;
      }
      if (t < 3.6) {
        // Violent snap recoil back to Stickman's left hand!
        const uSnap = easeOut(inv(2.95, 3.3, t));
        const hxL = ch.x + pose.handL.x;
        const hyL = pose.handL.y;
        const rightEndX = lerp(ch.x + 175, hxL + 28, uSnap) + Math.sin(t * 70) * (1 - uSnap) * 35;
        const pts: Pt[] = [];
        for (let i = 0; i < 18; i++) {
          const u = i / 17;
          pts.push({ x: lerp(hxL, rightEndX, u), y: hyL + Math.sin(u * Math.PI) * 12 });
        }
        this.drawSlinkyPath(ctx, pts, 38, 14, 7.5);
        return;
      }
      // Dropped coiled on floor by Stickman's left foot after bonk
      const dropU = smooth(inv(3.6, 4.3, t));
      const bx = lerp(ch.x - 110, 345, dropU);
      const by = lerp(1190, FLOOR_Y - 12, dropU * dropU);
      const pts: Pt[] = [];
      for (let i = 0; i < 14; i++) {
        pts.push({ x: bx, y: by - i * 7.5 });
      }
      this.drawSlinkyPath(ctx, pts, 42, 13, 8);
      return;
    }

    // 2. Scene 2 (6–12s): Stretched between Left Table (265, 1228) & Right Table (675, 1228)
    if (t < 11.4) {
      const stretchU = smooth(inv(6.0, 7.0, t));
      const pullU = t >= 7.5 && t < 8.8 ? smooth(inv(7.5, 8.6, t)) : 0;
      const snapOsc = t >= 8.8 && t < 9.7 ? Math.exp(-(t - 8.8) * 5) * Math.sin((t - 8.8) * 36) * 110 : 0;
      const midDrop = pullU * 118 + snapOsc;

      const pts: Pt[] = [];
      const count = 22;
      for (let i = 0; i < count; i++) {
        const u = i / (count - 1);
        const startX = lerp(345, 265, stretchU);
        const endX = lerp(395, 675, stretchU);
        const baseY = lerp(FLOOR_Y - 12, 1228, stretchU);
        const sag = Math.sin(u * Math.PI) * (16 + midDrop);
        pts.push({ x: lerp(startX, endX, u), y: baseY + sag });
      }
      this.drawSlinkyPath(ctx, pts, 34, 13, 7.5);
      return;
    }

    // Carried across room (11.4 .. 13.8s)
    if (t < 13.8) {
      const hx = ch.x + 28;
      const hy = ch.ground - 260;
      const pts: Pt[] = [];
      for (let i = 0; i < 14; i++) {
        pts.push({ x: hx + Math.sin(t * 14 + i * 0.4) * 8, y: hy + i * 7 });
      }
      this.drawSlinkyPath(ctx, pts, 36, 12, 7.5);
      return;
    }

    // 3. Scenes 3–5 (13.8 .. 26.55s): Giant Rainbow Slinky down Staircase Ramp + 360° Coil Loop!
    const anchorPull = t >= 16.0 && t < 18.0 ? smooth(inv(16.0, 17.8, t)) : 0;
    const snapWave =
      t >= 18.0 && t < 18.9 ? Math.exp(-(t - 18.0) * 4.5) * Math.sin((t - 18.0) * 42) * 24 : 0;

    // Retract / whip across the room toward Stickman during 26.0 .. 26.55s!
    const whipU = t >= 26.0 ? smooth(inv(26.0, 26.55, t)) : 0;

    const pts: Pt[] = [];
    // Part A: Ramp coils from top stair post (1175, 1002) -> (1455, 1272)
    const rampCount = 15;
    for (let i = 0; i < rampCount; i++) {
      const u = i / (rampCount - 1);
      // Compress coils slightly toward top when pulled back!
      const compU = lerp(u, u * 0.84, anchorPull * (1 - u));
      let px = lerp(1175, 1455, compU);
      let py = lerp(1002, 1272, compU) + Math.sin(u * Math.PI) * snapWave;
      if (whipU > 0) {
        px = lerp(px, ch.x, whipU);
        py = lerp(py, FLOOR_Y - 170 - (1 - u) * 140, whipU);
      }
      pts.push({ x: px, y: py });
    }
    // Part B: 360° circular loop made of stretched rainbow coils at (1515, 1190, r=82)
    const loopCount = 12;
    for (let j = 1; j <= loopCount; j++) {
      const lu = j / loopCount;
      const ang = Math.PI * 0.5 - lu * TAU;
      let px = 1515 + Math.cos(ang) * 82;
      let py = 1190 + Math.sin(ang) * 82;
      if (whipU > 0) {
        px = lerp(px, ch.x, whipU);
        py = lerp(py, FLOOR_Y - 120 - lu * 120, whipU);
      }
      pts.push({ x: px, y: py });
    }

    this.drawSlinkyPath(ctx, pts, 32, 12, 7.5);
  }

  private drawSpringCageLayer(
    ctx: CanvasRenderingContext2D,
    ch: CharState,
    t: number,
    half: 'back' | 'front'
  ) {
    const baseY = ch.ground - ch.lift;
    const hipY = baseY - 260;
    const cageTop = hipY - 195;
    const cageBot = lerp(FLOOR_Y - 16, baseY - 35, 0.45);
    const cageCoils = 12;

    // Slight squash-and-stretch on the spring cage as it bounces Stickman!
    const bounceVel = Math.sin((t - 26.65) * 14) * 10;

    for (let i = 0; i < cageCoils; i++) {
      const u = i / (cageCoils - 1);
      const cy = lerp(cageBot, cageTop, u) + bounceVel * (u - 0.5);
      const rx = 104 + Math.sin(u * Math.PI) * 18 - (1 - u) * Math.min(24, ch.lift * 0.06);
      const ry = 22;
      const color = RAINBOW_COILS[i % RAINBOW_COILS.length];

      ctx.save();
      ctx.translate(ch.x, cy);
      ctx.rotate(0.08);
      const startA = half === 'back' ? Math.PI : 0;
      const endA = half === 'back' ? TAU : Math.PI;

      ctx.strokeStyle = INK;
      ctx.lineWidth = 17;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, startA, endA);
      ctx.stroke();

      ctx.strokeStyle = color;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, startA, endA);
      ctx.stroke();

      if (half === 'front') {
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0.25, Math.PI - 0.25);
        ctx.stroke();
      }

      ctx.restore();
    }
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
    ctx.arc(-5, -5, 5.5, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawLooseBeanie(ctx: CanvasRenderingContext2D, t: number, ch: CharState) {
    if (t < 26.65) return;
    const u = clamp((t - 26.65) / 1.15, 0, 1);
    const bx = lerp(ch.x, ch.x - 165, u);
    const by = lerp(ch.ground - 530, FLOOR_Y - 12, u * u) - Math.sin(u * Math.PI) * 340;
    const rot = lerp(0, -Math.PI * 2.35, u);

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rot);
    this.drawBeanieShape(ctx);
    ctx.restore();
  }

  private drawVisualFX(ctx: CanvasRenderingContext2D, t: number, ch: CharState) {
    // Forehead bonk star burst at 3.85s
    if (t >= 3.85 && t < 4.35) {
      const u = inv(3.85, 4.35, t);
      const bx = ch.x + 12;
      const by = ch.ground - 525;
      ctx.save();
      ctx.translate(bx, by);
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 6;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (16 + u * 20), Math.sin(a) * (16 + u * 20));
        ctx.lineTo(Math.cos(a) * (36 + u * 45), Math.sin(a) * (36 + u * 45));
        ctx.stroke();
      }
      ctx.restore();
    }

    // Celebration confetti at 24.3–26.0s
    if (t >= 24.3 && t < 26.0) {
      const u = inv(24.3, 26.0, t);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + 0.3;
        const dist = 60 + u * 260;
        const px = 1600 + Math.cos(a) * dist * 0.9;
        const py = 1270 + Math.sin(a) * dist * 0.65 - u * 90 + u * u * 160;
        ctx.fillStyle = RAINBOW_COILS[i % RAINBOW_COILS.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.rect(px - 7, py - 5, 14, 10);
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

    ctx.fillStyle = '#38bdf8';
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
