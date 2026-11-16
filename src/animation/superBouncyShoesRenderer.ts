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

// --- Magic Shoes & World Palette (Modern Pop 2D Flat Vector) ---------------
const SNEAKER_RED = '#ef233c';
const SNEAKER_DARK = '#b91c1c';
const SPRING_SILVER = '#cbd5e1';
const SPRING_LIGHT = '#f8fafc';

const SKY_BLUE = '#7dd3fc';
const WALL_MAIN = '#fff9f0';
const WALL_STRIPE = '#ffefd6';
const HOUSE_WALL = '#fde68a';
const HOUSE_ROOF = '#e11d48';
const GRASS = '#4ade80';
const GRASS_DEEP = '#22c55e';
const STREET = '#94a3b8';
const TREE_TRUNK = '#854d0e';
const TREE_LEAF = '#16a34a';
const TRAMP_BLUE = '#2563eb';
const TRAMP_YELLOW = '#facc15';
const PILLOW_COLORS = ['#fbbf24', '#38bdf8', '#f472b6', '#a78bfa'];

const FLOOR_Y = 1500;
const HEAD_R = 70;

// World landmarks along continuous panoramic path
const MAT_X = 590;
const HOUSE_X = 1420;
const GARDEN_X = 1940;
const ROOF2_X = 2360;
const TREE_X = 2760;
const LAMP_X = 3160;
const TRAMP_X = 3740;
const PILLOW_X = 4380;

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
  handL: Pt; // dx from character x, world y at ground=FLOOR_Y
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
  // --- Scene 1 (0–6s): Finds red spring shoes, puts them on, test bounce! ---
  {
    t: 0.0,
    p: {
      lean: 0.04,
      look: 'right',
      mouth: 'smile',
      brow: 'normal',
      eye: 'open',
      handL: { x: -68, y: 1246 },
      handR: { x: 68, y: 1246 },
    },
  },
  {
    t: 1.35,
    p: {
      lean: 0.22,
      crouch: 0.55,
      look: 'down',
      mouth: 'grin',
      brow: 'raised',
      eye: 'wide',
      gripL: true,
      gripR: true,
      handL: { x: -46, y: 1380 },
      handR: { x: 46, y: 1380 },
    },
  },
  {
    t: 2.35,
    p: {
      lean: 0,
      crouch: 0,
      stance: 12,
      look: 'down',
      mouth: 'bigsmile',
      brow: 'cocky',
      eye: 'happy',
      gripL: false,
      gripR: false,
      handL: { x: -75, y: 1240 },
      handR: { x: 75, y: 1240 },
    },
  },
  {
    t: 3.0,
    p: {
      lean: 0.08,
      crouch: 0.42,
      look: 'front',
      mouth: 'grin',
      brow: 'determined',
      eye: 'open',
      handL: { x: -95, y: 1220 },
      handR: { x: 95, y: 1220 },
    },
  },
  {
    t: 3.45,
    p: {
      lean: -0.04,
      crouch: 0.06,
      stance: 28,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'wide',
      bendL: -1,
      bendR: -1,
      handL: { x: -135, y: 1030 },
      handR: { x: 135, y: 1030 },
    },
  },
  {
    t: 5.05,
    p: {
      lean: 0,
      crouch: 0.25,
      stance: 12,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      handL: { x: -90, y: 1200 },
      handR: { x: 90, y: 1200 },
    },
  },

  // --- Scene 2 (6–12s): Takes another step -> launches over house & garden! ---
  {
    t: 6.15,
    p: {
      lean: 0.14,
      crouch: 0.48,
      look: 'right',
      mouth: 'grin',
      brow: 'determined',
      eye: 'open',
      handL: { x: -95, y: 1210 },
      handR: { x: 95, y: 1210 },
    },
  },
  {
    t: 6.65,
    p: {
      lean: -0.1,
      crouch: 0.08,
      stance: 32,
      look: 'down',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      bendL: -1,
      bendR: -1,
      handL: { x: -145, y: 1045 },
      handR: { x: 145, y: 1045 },
    },
  },
  {
    t: 8.95,
    p: {
      lean: 0.12,
      crouch: 0.44,
      look: 'down',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -120, y: 1180 },
      handR: { x: 120, y: 1180 },
    },
  },

  // --- Scene 3 (12–18s): Rooftops, tree, streetlight — grin turns to panic! ---
  {
    t: 12.1,
    p: {
      lean: 0.06,
      crouch: 0.42,
      look: 'right',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -135, y: 1115 },
      handR: { x: 135, y: 1115 },
    },
  },
  {
    t: 14.3,
    p: {
      lean: -0.12,
      crouch: 0.15,
      stance: 38,
      look: 'front',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -150, y: 1020 },
      handR: { x: 150, y: 1020 },
    },
  },
  {
    t: 16.3,
    p: {
      lean: 0.14,
      crouch: 0.2,
      look: 'down',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -150, y: 1020 },
      handR: { x: 150, y: 1020 },
    },
  },

  // --- Scene 4 (18–24s): Spots giant trampoline, aims, rockets sky-high spinning! ---
  {
    t: 18.4,
    p: {
      lean: 0.16,
      crouch: 0.15,
      look: 'down',
      mouth: 'grin',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -120, y: 1100 },
      handR: { x: 120, y: 1100 },
    },
  },
  {
    t: 19.65,
    p: {
      lean: 0,
      crouch: 0.52,
      look: 'down',
      mouth: 'o',
      brow: 'determined',
      eye: 'wide',
      handL: { x: -130, y: 1180 },
      handR: { x: 130, y: 1180 },
    },
  },
  {
    t: 20.1,
    p: {
      lean: -0.08,
      crouch: 0.12,
      stance: 42,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      bendL: -1,
      bendR: -1,
      handL: { x: -152, y: 1015 },
      handR: { x: 152, y: 1015 },
    },
  },

  // --- Scene 5 (24–30s): Pillow pile landing, removes shoes, celebrates, shoe bonks beanie off! ---
  {
    t: 24.3,
    p: {
      lean: 0,
      sit: 0.75,
      crouch: 0,
      look: 'front',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      handL: { x: -120, y: 1150 },
      handR: { x: 120, y: 1150 },
    },
  },
  {
    t: 25.35,
    p: {
      lean: 0.2,
      sit: 0,
      crouch: 0.55,
      look: 'down',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      gripL: true,
      gripR: true,
      handL: { x: -35, y: 1390 },
      handR: { x: 55, y: 1390 },
    },
  },
  {
    t: 26.25,
    p: {
      lean: 0,
      crouch: 0,
      stance: 16,
      headTilt: -0.04,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      gripL: false,
      gripR: false,
      fistL: true,
      fistR: true,
      bendL: -1,
      bendR: -1,
      handL: { x: -115, y: 985 },
      handR: { x: 115, y: 985 },
    },
  },
  {
    t: 28.25,
    p: {
      lean: 0.04,
      headTilt: 0.12,
      headDrop: 14,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      fistL: false,
      fistR: false,
      beanieOn: false,
      bendL: 1,
      bendR: 1,
      handL: { x: -95, y: 1215 },
      handR: { x: 95, y: 1215 },
    },
  },
  {
    t: 28.75,
    p: {
      lean: 0,
      headTilt: 0,
      headDrop: 0,
      headTurn: 0,
      stance: 4,
      look: 'front',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      beanieOn: false,
      handL: { x: -68, y: 1248 },
      handR: { x: 68, y: 1248 },
    },
  },
];

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

function buildPoseKeys(): { t: number; p: Pose }[] {
  const keys: { t: number; p: Pose }[] = [];
  let cur: Pose = { ...BASE_POSE };
  for (const patch of POSE_PATCHES) {
    cur = { ...cur, ...patch.p };
    keys.push({ t: patch.t, p: cur });
  }
  return keys;
}

const POSE_KEYS = buildPoseKeys();

const CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: 0.25, to: 5.8, text: 'THESE SHOES ARE AMAZING!' },
  { from: 6.2, to: 11.8, text: "I CAN'T CONTROL THEM!" },
  { from: 12.2, to: 17.85, text: 'SOMEONE STOP ME!' },
  { from: 18.2, to: 23.85, text: 'WRONG LANDING!' },
  { from: 24.3, to: 29.95, text: 'NEVER AGAIN!' },
];

export class SuperBouncyShoesRenderer {
  public render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig): void {
    ctx.save();
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const cam = this.cameraAt(time);

    // Sky fill in screen space so high jumps never show empty space
    ctx.fillStyle = time < 6.0 ? WALL_MAIN : SKY_BLUE;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);

    // 1. World scenery (indoor room -> house -> garden -> rooftops -> tree -> streetlight -> park trampoline -> pillow pile)
    this.drawWorld(ctx, time);

    // 2. Magic Shoes sitting on mat (before 1.85s) or beside him on floor (after 25.7s)
    this.drawLooseMagicShoes(ctx, time);

    // 3. Angry Stickman (wearing the red spring sneakers from 1.85s to 25.7s)
    this.drawCharacter(ctx, time);

    // 4. Knocked-off red beanie & impact burst lines
    this.drawFlyingBeanie(ctx, time);
    this.drawBounceBursts(ctx, time);

    ctx.restore();

    if (config.showCaptions) {
      this.drawCaptions(ctx, time);
    }

    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Spring Compression & Trajectory Timeline
  // -------------------------------------------------------------------------
  private springCompressionAt(t: number): number {
    // Visible spring compression right before every single upward bounce!
    const windows: [number, number][] = [
      [2.85, 3.28],
      [6.05, 6.48],
      [8.8, 9.25],
      [11.9, 12.28],
      [14.05, 14.38],
      [16.05, 16.38],
      [19.3, 19.72],
    ];
    for (const [a, b] of windows) {
      if (t >= a && t <= b) {
        return Math.sin(inv(a, b, t) * Math.PI);
      }
    }
    return 0;
  }

  private charAt(t: number): {
    x: number;
    ground: number;
    lift: number;
    rot: number;
    wearingMagicShoes: boolean;
  } {
    const wearing = t >= 1.85 && t < 25.75;

    // Scene 1 (0–6s): Walks to mat x=565, puts shoes on (1.3–2.3s), test bounce (3.25–4.9s)
    if (t < 1.35) {
      const u = smooth(inv(0.0, 1.2, t));
      return {
        x: lerp(260, 540, u),
        ground: FLOOR_Y,
        lift: Math.abs(Math.sin(t * 9)) * 10,
        rot: 0,
        wearingMagicShoes: wearing,
      };
    }
    if (t < 3.25) {
      return { x: 540, ground: FLOOR_Y, lift: 0, rot: 0, wearingMagicShoes: wearing };
    }
    if (t < 4.9) {
      const u = inv(3.25, 4.9, t);
      return {
        x: lerp(540, 620, u),
        ground: FLOOR_Y,
        lift: Math.sin(u * Math.PI) * 430,
        rot: 0,
        wearingMagicShoes: wearing,
      };
    }
    if (t < 6.45) {
      return {
        x: lerp(620, 740, smooth(inv(5.0, 6.1, t))),
        ground: FLOOR_Y,
        lift: 0,
        rot: 0,
        wearingMagicShoes: wearing,
      };
    }

    // Scene 2 (6.45–12.0s): Vaults over his house (x=1420) -> lands in Garden (x=1940) -> bounces again!
    if (t < 8.85) {
      const u = inv(6.45, 8.85, t);
      return {
        x: lerp(740, GARDEN_X, u),
        ground: FLOOR_Y,
        lift: Math.sin(u * Math.PI) * 920,
        rot: u * 0.25,
        wearingMagicShoes: wearing,
      };
    }
    if (t < 9.25) {
      return { x: GARDEN_X, ground: FLOOR_Y, lift: 0, rot: 0, wearingMagicShoes: wearing };
    }
    if (t < 12.05) {
      const u = inv(9.25, 12.05, t);
      return {
        x: lerp(GARDEN_X, ROOF2_X - 40, u),
        ground: FLOOR_Y,
        lift: Math.sin(u * Math.PI) * 760,
        rot: lerp(0, 0.35, u),
        wearingMagicShoes: wearing,
      };
    }

    // Scene 3 (12–18s): Bounces over Rooftop (2360) -> Tree (2760) -> Streetlight (3160), each higher!
    if (t < 14.35) {
      const u = inv(12.05, 14.35, t);
      return {
        x: lerp(ROOF2_X - 40, TREE_X - 90, u),
        ground: FLOOR_Y,
        lift: Math.sin(u * Math.PI) * 860,
        rot: Math.sin(u * Math.PI) * 0.28,
        wearingMagicShoes: wearing,
      };
    }
    if (t < 16.35) {
      const u = inv(14.35, 16.35, t);
      return {
        x: lerp(TREE_X - 90, LAMP_X - 40, u),
        ground: FLOOR_Y,
        lift: Math.sin(u * Math.PI) * 980,
        rot: -Math.sin(u * Math.PI) * 0.3,
        wearingMagicShoes: wearing,
      };
    }
    if (t < 19.65) {
      const u = inv(16.35, 19.65, t);
      return {
        x: lerp(LAMP_X - 40, TRAMP_X, smooth(u)),
        ground: FLOOR_Y,
        lift: Math.sin(u * Math.PI) * 1120,
        rot: u * 0.4,
        wearingMagicShoes: wearing,
      };
    }

    // Scene 4 (19.65–24.3s): Giant trampoline rocket launch straight upward & spinning!
    if (t < 24.3) {
      const u = inv(19.65, 24.3, t);
      return {
        x: lerp(TRAMP_X, PILLOW_X, smooth(u)),
        ground: FLOOR_Y - 40 * (1 - u),
        lift: Math.sin(u * Math.PI) * 1380,
        rot: u * Math.PI * 6.0,
        wearingMagicShoes: wearing,
      };
    }

    // Scene 5 (24.3–30.0s): Safe landing on pillow pile, removes shoes, celebrates, shoe bonks head!
    if (t < 25.25) {
      return { x: PILLOW_X, ground: FLOOR_Y - 55, lift: 0, rot: 0, wearingMagicShoes: wearing };
    }
    const stepOff = smooth(inv(25.25, 25.8, t));
    const standX = lerp(PILLOW_X, PILLOW_X + 160, stepOff);
    let lift = 0;
    if (t >= 26.25 && t < 27.55) {
      lift = Math.abs(Math.sin((t - 26.25) * 8)) * 22;
    }
    return { x: standX, ground: FLOOR_Y, lift, rot: 0, wearingMagicShoes: wearing };
  }

  private cameraAt(t: number): { x: number; y: number; zoom: number } {
    const ch = this.charAt(t);
    const camX = t < 5.5 ? 540 : clamp(ch.x + 20, 540, PILLOW_X + 120);
    // Keep ground visible while following high jumps cleanly with mild zoom-out
    const zoom = clamp(1 - ch.lift / 3200, 0.68, 1.0);
    const desiredY = FLOOR_Y - 420 - ch.lift * 0.58;
    const maxY = FLOOR_Y - 420;
    const camY = Math.min(maxY, desiredY);
    return { x: camX, y: camY, zoom };
  }

  private poseAt(t: number): Pose {
    if (t <= POSE_KEYS[0].t) return { ...POSE_KEYS[0].p };
    if (t >= POSE_KEYS[POSE_KEYS.length - 1].t) {
      return { ...POSE_KEYS[POSE_KEYS.length - 1].p };
    }
    let idx = 0;
    for (let i = 0; i < POSE_KEYS.length - 1; i++) {
      if (t >= POSE_KEYS[i].t && t <= POSE_KEYS[i + 1].t) {
        idx = i;
        break;
      }
    }
    const a = POSE_KEYS[idx];
    const b = POSE_KEYS[idx + 1];
    const raw = (t - a.t) / Math.max(0.0001, b.t - a.t);
    const u = smooth(raw);
    const mid = raw >= 0.5;
    const ch = this.charAt(t);
    const comp = this.springCompressionAt(t);

    const dxL = lerp(a.p.handL.x, b.p.handL.x, u);
    const dyL = lerp(a.p.handL.y, b.p.handL.y, u);
    const dxR = lerp(a.p.handR.x, b.p.handR.x, u);
    const dyR = lerp(a.p.handR.y, b.p.handR.y, u);
    const groundOff = FLOOR_Y - ch.ground;

    return {
      lean: lerp(a.p.lean, b.p.lean, u),
      hipDrop: lerp(a.p.hipDrop, b.p.hipDrop, u),
      headTilt: lerp(a.p.headTilt, b.p.headTilt, u),
      headDrop: lerp(a.p.headDrop, b.p.headDrop, u),
      headTurn: lerp(a.p.headTurn, b.p.headTurn, u),
      look: mid ? b.p.look : a.p.look,
      mouth: mid ? b.p.mouth : a.p.mouth,
      brow: mid ? b.p.brow : a.p.brow,
      eye: mid ? b.p.eye : a.p.eye,
      stance: lerp(a.p.stance, b.p.stance, u),
      footLift: lerp(a.p.footLift, b.p.footLift, u),
      handL: { x: ch.x + dxL, y: dyL - ch.lift - groundOff + comp * 24 },
      handR: { x: ch.x + dxR, y: dyR - ch.lift - groundOff + comp * 24 },
      bendL: mid ? b.p.bendL : a.p.bendL,
      bendR: mid ? b.p.bendR : a.p.bendR,
      gripL: mid ? b.p.gripL : a.p.gripL,
      gripR: mid ? b.p.gripR : a.p.gripR,
      fistL: mid ? b.p.fistL : a.p.fistL,
      fistR: mid ? b.p.fistR : a.p.fistR,
      pointL: mid ? b.p.pointL : a.p.pointL,
      pointR: mid ? b.p.pointR : a.p.pointR,
      beanieOn: mid ? b.p.beanieOn : a.p.beanieOn,
      crouch: clamp(lerp(a.p.crouch, b.p.crouch, u) + comp * 0.25, 0, 0.8),
      sit: lerp(a.p.sit, b.p.sit, u),
    };
  }

  // -------------------------------------------------------------------------
  // World Scenery (Indoor Room -> House -> Garden -> Street -> Park -> Pillows)
  // -------------------------------------------------------------------------
  private drawWorld(ctx: CanvasRenderingContext2D, t: number) {
    // Indoor room (x: -200 to 1060)
    ctx.fillStyle = WALL_MAIN;
    ctx.fillRect(-200, -400, 1260, FLOOR_Y + 400);
    ctx.fillStyle = WALL_STRIPE;
    for (let x = -100; x < 1000; x += 180) {
      ctx.fillRect(x, 120, 74, FLOOR_Y - 120);
    }

    // Open doorway to outside at x=1060
    ctx.fillStyle = '#a16207';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.fillRect(1020, 950, 48, FLOOR_Y - 950);
    ctx.strokeRect(1020, 950, 48, FLOOR_Y - 950);

    // Outdoor grass & sidewalk (x: 1060 to 5200)
    ctx.fillStyle = GRASS;
    ctx.fillRect(1060, FLOOR_Y, 4200, 600);
    ctx.fillStyle = GRASS_DEEP;
    ctx.fillRect(1060, FLOOR_Y, 4200, 22);

    // Indoor wooden floor
    ctx.fillStyle = '#e2ae74';
    ctx.fillRect(-200, FLOOR_Y, 1260, 600);

    // Clouds in the outdoor sky
    ctx.fillStyle = WHITE;
    for (let cx = 1280; cx < 4900; cx += 520) {
      const cy = 360 + ((cx * 37) % 340);
      ctx.beginPath();
      ctx.arc(cx, cy, 48, 0, TAU);
      ctx.arc(cx + 46, cy - 16, 62, 0, TAU);
      ctx.arc(cx + 102, cy + 4, 44, 0, TAU);
      ctx.fill();
    }

    // Welcome mat in indoor room
    ctx.fillStyle = '#93c5fd';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(MAT_X - 110, FLOOR_Y - 10, 220, 22, 10);
    ctx.fill();
    ctx.stroke();

    // Scene 2: Stickman's House (x=1420) + Garden Picket Fence (x=1940)
    this.drawHouse(ctx, HOUSE_X, FLOOR_Y, 1.0, '#fde68a', '#e11d48');
    this.drawGarden(ctx, GARDEN_X, FLOOR_Y);

    // Scene 3: Neighbor Rooftop (x=2360), Tree (x=2760), Streetlight (x=3160)
    this.drawHouse(ctx, ROOF2_X, FLOOR_Y, 0.9, '#fed7aa', '#2563eb');
    this.drawTree(ctx, TREE_X, FLOOR_Y);
    this.drawStreetlight(ctx, LAMP_X, FLOOR_Y);

    // Scene 4: Giant Park Trampoline (x=3740)
    this.drawTrampoline(ctx, TRAMP_X, FLOOR_Y, t);

    // Scene 5: Huge Soft Pile of Pillows (x=4380)
    this.drawPillowPile(ctx, PILLOW_X, FLOOR_Y, t);

    // Ground horizon line
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-200, FLOOR_Y);
    ctx.lineTo(5200, FLOOR_Y);
    ctx.stroke();
  }

  private drawHouse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    wallCol: string,
    roofCol: string
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;

    // House body
    ctx.fillStyle = wallCol;
    ctx.fillRect(-170, -340, 340, 340);
    ctx.strokeRect(-170, -340, 340, 340);

    // Roof triangle
    ctx.fillStyle = roofCol;
    ctx.beginPath();
    ctx.moveTo(-205, -340);
    ctx.lineTo(0, -520);
    ctx.lineTo(205, -340);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Door & windows
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-38, -160, 76, 160);
    ctx.strokeRect(-38, -160, 76, 160);

    ctx.fillStyle = '#bae6fd';
    for (const wx of [-115, 75]) {
      ctx.fillRect(wx, -275, 58, 58);
      ctx.strokeRect(wx, -275, 58, 58);
    }
    ctx.restore();
  }

  private drawGarden(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    // White picket fence
    ctx.fillStyle = WHITE;
    ctx.fillRect(-165, -75, 330, 20);
    ctx.strokeRect(-165, -75, 330, 20);
    for (let fx = -150; fx <= 150; fx += 50) {
      ctx.beginPath();
      ctx.moveTo(fx - 14, 0);
      ctx.lineTo(fx - 14, -95);
      ctx.lineTo(fx, -118);
      ctx.lineTo(fx + 14, -95);
      ctx.lineTo(fx + 14, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Garden flowers
    for (const [fx, col] of [
      [-95, '#f472b6'],
      [0, '#facc15'],
      [105, '#a78bfa'],
    ] as [number, string][]) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(fx, -32, 16, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.fillStyle = TREE_TRUNK;
    ctx.fillRect(-32, -260, 64, 260);
    ctx.strokeRect(-32, -260, 64, 260);

    ctx.fillStyle = TREE_LEAF;
    for (const [lx, ly, lr] of [
      [-65, -310, 75],
      [65, -310, 75],
      [0, -395, 92],
    ]) {
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawStreetlight(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.fillStyle = STREET;
    ctx.fillRect(-14, -460, 28, 460);
    ctx.strokeRect(-14, -460, 28, 460);
    ctx.beginPath();
    ctx.roundRect(-14, -475, 110, 24, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(72, -445, 28, 16, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawTrampoline(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
    const dip = t >= 19.4 && t <= 20.1 ? Math.sin(inv(19.4, 20.1, t) * Math.PI) * 58 : 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;

    // Legs
    ctx.fillStyle = '#475569';
    for (const lx of [-170, -70, 70, 170]) {
      ctx.fillRect(lx - 10, -110, 20, 110);
      ctx.strokeRect(lx - 10, -110, 20, 110);
    }

    // Sagging elastic mat
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-195, -110);
    ctx.quadraticCurveTo(0, -110 + dip * 1.4, 195, -110);
    ctx.lineTo(195, -90);
    ctx.quadraticCurveTo(0, -90 + dip * 1.4, -195, -90);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Padded blue/yellow frame rim
    ctx.fillStyle = TRAMP_BLUE;
    ctx.beginPath();
    ctx.roundRect(-215, -124, 430, 32, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = TRAMP_YELLOW;
    ctx.beginPath();
    ctx.roundRect(-145, -116, 290, 12, 6);
    ctx.fill();
    ctx.restore();
  }

  private drawPillowPile(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
    const squash =
      t >= 24.15 && t <= 24.9
        ? Math.sin(inv(24.15, 24.9, t) * Math.PI) * 0.28
        : 0;
    const pillows = [
      { dx: -115, dy: -42, w: 175, h: 78, rot: -0.1, c: PILLOW_COLORS[0] },
      { dx: 110, dy: -42, w: 180, h: 78, rot: 0.12, c: PILLOW_COLORS[1] },
      { dx: -40, dy: -98, w: 185, h: 82, rot: 0.06, c: PILLOW_COLORS[2] },
      { dx: 55, dy: -135, w: 165, h: 76, rot: -0.14, c: PILLOW_COLORS[3] },
    ];

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1 + squash * 0.4, 1 - squash);
    for (const pv of pillows) {
      ctx.save();
      ctx.translate(pv.dx, pv.dy);
      ctx.rotate(pv.rot);
      ctx.fillStyle = pv.c;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(-pv.w / 2, -pv.h / 2, pv.w, pv.h, 30);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Consistent Magic Shoes (Bright Red Sneakers + Shiny Silver Springs)
  // -------------------------------------------------------------------------
  private drawBouncySneaker(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rot: number,
    compress = 0,
    withSpring = true
  ) {
    const springH = withSpring ? lerp(38, 12, clamp(compress, 0, 1)) : 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    if (withSpring) {
      // Shiny silver spring coil underneath shoe
      ctx.strokeStyle = INK;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const drawCoil = () => {
        ctx.beginPath();
        ctx.moveTo(-22, -2);
        ctx.lineTo(22, -springH * 0.35);
        ctx.lineTo(-22, -springH * 0.7);
        ctx.lineTo(22, -springH);
        ctx.stroke();
      };
      drawCoil();
      ctx.strokeStyle = SPRING_SILVER;
      ctx.lineWidth = 6;
      drawCoil();
      ctx.strokeStyle = SPRING_LIGHT;
      ctx.lineWidth = 2.5;
      drawCoil();
    }

    // Sneaker sits right above the spring
    const sy = -springH;
    ctx.fillStyle = SNEAKER_RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-38, sy - 34, 78, 32, 12);
    ctx.fill();
    ctx.stroke();

    // White rubber sole & toe cap
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.roundRect(-38, sy - 10, 78, 12, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = SNEAKER_DARK;
    ctx.beginPath();
    ctx.roundRect(14, sy - 30, 22, 18, 8);
    ctx.fill();
    ctx.restore();
  }

  private drawLooseMagicShoes(ctx: CanvasRenderingContext2D, t: number) {
    // 1. Before putting them on (0.0 – 1.85s): sit on welcome mat at x=590
    if (t < 1.85) {
      this.drawBouncySneaker(ctx, MAT_X - 38, FLOOR_Y - 6, 0, 0, true);
      this.drawBouncySneaker(ctx, MAT_X + 46, FLOOR_Y - 6, 0, 0, true);
      return;
    }

    // 2. After removing them in Scene 5 (25.75 – 30.0s): sit beside him on floor!
    if (t >= 25.75) {
      const ch = this.charAt(t);
      const sxLeft = PILLOW_X + 275;
      const sxRight = PILLOW_X + 355;

      // Left sneaker stays resting on floor
      this.drawBouncySneaker(ctx, sxLeft, FLOOR_Y, 0, 0, true);

      if (t < 27.55) {
        // Right sneaker sits beside it until loose spring pops out
        this.drawBouncySneaker(ctx, sxRight, FLOOR_Y, 0, 0, true);
      } else {
        // Loose silver spring stays coiled on ground while sneaker launches onto his head!
        ctx.save();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(sxRight - 18, FLOOR_Y);
        ctx.lineTo(sxRight + 18, FLOOR_Y - 22);
        ctx.lineTo(sxRight - 12, FLOOR_Y - 46);
        ctx.stroke();
        ctx.strokeStyle = SPRING_SILVER;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.restore();

        // Launched sneaker arcs onto Stickman's head at 28.25s, then falls beside him
        if (t < 28.25) {
          const u = inv(27.55, 28.25, t);
          const x = lerp(sxRight, ch.x, u);
          const y = lerp(FLOOR_Y - 12, FLOOR_Y - 585, u) - Math.sin(u * Math.PI) * 260;
          this.drawBouncySneaker(ctx, x, y, u * Math.PI * 2, 0, false);
        } else {
          const u = clamp(inv(28.25, 28.95, t), 0, 1);
          const x = lerp(ch.x, ch.x - 165, easeOut(u));
          const y = lerp(FLOOR_Y - 585, FLOOR_Y, u * u) - Math.sin(u * Math.PI) * 140;
          this.drawBouncySneaker(ctx, x, y, lerp(0, -0.45, u), 0, false);
        }
      }
    }
  }

  private drawFlyingBeanie(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 28.25) return;
    const ch = this.charAt(28.25);
    const u = clamp(inv(28.25, 29.0, t), 0, 1);
    const x = lerp(ch.x, PILLOW_X + 20, easeOut(u));
    const y = lerp(FLOOR_Y - 585, FLOOR_Y - 165, u * u) - Math.sin(u * Math.PI) * 190;
    const rot = lerp(0, -2.1, u);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(0.92, 0.92);
    this.drawBeanieShape(ctx);
    ctx.restore();
  }

  private drawBounceBursts(ctx: CanvasRenderingContext2D, t: number) {
    const bounceTimes = [3.25, 6.45, 9.25, 12.25, 14.35, 16.35, 19.65, 28.25];
    for (const bt of bounceTimes) {
      const dt = t - bt;
      if (dt < 0 || dt > 0.42) continue;
      const u = dt / 0.42;
      const ch = this.charAt(bt);
      const cy = bt === 28.25 ? FLOOR_Y - 570 : ch.ground - 18;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.translate(ch.x, cy);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 7;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        const r0 = 28 + u * 45;
        const r1 = 62 + u * 85;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
        ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------------
  // Locked Character Rig (POP_UP_TENT_CHARACTER.md)
  // -------------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, t: number) {
    const ch = this.charAt(t);
    const pose = this.poseAt(t);
    const comp = this.springCompressionAt(t);
    const springOffset = ch.wearingMagicShoes ? lerp(36, 12, comp) : 0;
    const baseY = ch.ground - ch.lift - springOffset;
    const hipY = baseY - (300 - 150 * pose.crouch - 170 * pose.sit);

    const arms = this.computeArms(pose, ch.x, hipY);

    if (ch.lift < 16 && pose.sit < 0.5) {
      ctx.fillStyle = 'rgba(23,18,31,0.16)';
      ctx.beginPath();
      ctx.ellipse(ch.x, ch.ground + 8, 78, 15, 0, 0, TAU);
      ctx.fill();
    }

    ctx.save();
    if (Math.abs(ch.rot) > 0.001) {
      ctx.translate(ch.x, hipY);
      ctx.rotate(ch.rot);
      ctx.translate(-ch.x, -hipY);
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.drawBody(ctx, ch.x, hipY, baseY, pose, arms, ch.wearingMagicShoes, comp, ch.ground - ch.lift);
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
    arms: { l: Arm; r: Arm },
    wearingMagicShoes: boolean,
    compress: number,
    soleY: number
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

    if (wearingMagicShoes) {
      this.drawBouncySneaker(ctx, ankleL.x - 4, soleY, lerp(-0.06, -0.4, pose.sit), compress, true);
      this.drawBouncySneaker(ctx, ankleR.x + 4, soleY, lerp(0.06, 0.4, pose.sit), compress, true);
    } else {
      this.drawShoe(ctx, ankleL.x - 4, ankleL.y + 12, lerp(-0.06, -0.45, pose.sit));
      this.drawShoe(
        ctx,
        ankleR.x + 4,
        ankleR.y + 12,
        lerp(pose.footLift > 20 ? -0.24 : 0.06, 0.45, pose.sit)
      );
    }

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
      let hx = target.x;
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

    ctx.font = '900 50px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.strokeText(caption.text, 0, 0, 880);

    ctx.fillStyle = '#facc15';
    ctx.fillText(caption.text, 0, 0, 880);
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
