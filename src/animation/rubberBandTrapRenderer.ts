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

// --- Scene & Prop Palette (Modern Pop 2D Flat Vector) ----------------------
const WALL_TOP = '#fff3d6';
const WALL_MAIN = '#fff9eb';
const WALL_STRIPE = '#ffefc7';
const BASEBOARD = '#ffffff';
const FLOOR = '#e2ae74';
const FLOOR_LINE = '#c99155';

const WOOD_MAIN = '#a96b38';
const WOOD_DARK = '#7c4a21';
const WOOD_LIGHT = '#c9884f';
const STEEL = '#64748b';
const STEEL_DARK = '#334155';

const BAND_RED = '#ef233c';
const BAND_DARK = '#b91c1c';
const BAND_HIGHLIGHT = '#ff758f';

const SOFA_BASE = '#0f766e';
const SOFA_CUSHION = '#14b8a6';
const SOFA_LIGHT = '#5eead4';

const PILLOW_COLORS = ['#fbbf24', '#38bdf8', '#f472b6', '#a78bfa'];

const FLOOR_Y = 1500;
const HEAD_R = 70;

// Continuous room geometry
const POST1_X = 220;
const POST2_X = 900;
const POST_H = 490;
const BAND_ANCHOR_Y = FLOOR_Y - 310; // y = 1190
const SOFA_X = 1600;
const PILLOW_X = 1290;

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
  handL: Pt; // relative to char x (dx), world y relative to ground=FLOOR_Y
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
  // --- Scene 1 (0–6s): Approaches giant red rubber band & pulls ---
  {
    t: 0.0,
    p: {
      lean: 0.03,
      look: 'right',
      mouth: 'smile',
      brow: 'normal',
      eye: 'open',
      handL: { x: -70, y: 1246 },
      handR: { x: 70, y: 1246 },
    },
  },
  {
    t: 1.4,
    p: {
      lean: 0.04,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -82, y: 1230 },
      handR: { x: 82, y: 1230 },
    },
  },
  {
    t: 2.1,
    p: {
      lean: 0.14,
      crouch: 0.2,
      look: 'front',
      mouth: 'grin',
      brow: 'determined',
      eye: 'open',
      gripL: true,
      gripR: true,
      bendL: -1,
      bendR: -1,
      handL: { x: -55, y: 1188 },
      handR: { x: 55, y: 1188 },
    },
  },
  {
    t: 3.8,
    p: {
      lean: -0.22,
      crouch: 0.32,
      stance: 32,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      gripL: true,
      gripR: true,
      bendL: -1,
      bendR: -1,
      handL: { x: -45, y: 1185 },
      handR: { x: 45, y: 1185 },
    },
  },
  {
    t: 5.5,
    p: {
      lean: -0.28,
      crouch: 0.36,
      stance: 38,
      look: 'front',
      mouth: 'grit',
      brow: 'raised',
      eye: 'wide',
      gripL: true,
      gripR: true,
      handL: { x: -42, y: 1185 },
      handR: { x: 42, y: 1185 },
    },
  },

  // --- Scene 2 (6–12s): Pulls farther, loops around waist, gets stuck! ---
  {
    t: 6.4,
    p: {
      lean: -0.34,
      crouch: 0.42,
      stance: 44,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      gripL: true,
      gripR: true,
      handL: { x: -40, y: 1192 },
      handR: { x: 40, y: 1192 },
    },
  },
  {
    t: 7.9,
    p: {
      lean: -0.1,
      crouch: 0.25,
      headTilt: -0.12,
      look: 'down',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      gripL: false,
      gripR: false,
      bendL: 1,
      bendR: 1,
      handL: { x: -115, y: 1160 },
      handR: { x: 115, y: 1160 },
    },
  },
  {
    t: 9.2,
    p: {
      lean: 0.14,
      crouch: 0.2,
      headTilt: 0.04,
      look: 'down',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -125, y: 1130 },
      handR: { x: 125, y: 1130 },
    },
  },
  {
    t: 11.4,
    p: {
      lean: 0.2,
      crouch: 0.28,
      headTilt: 0.06,
      look: 'left',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -135, y: 1120 },
      handR: { x: 115, y: 1140 },
    },
  },

  // --- Scene 3 (12–18s): Post bends/snaps, launched spinning across room ---
  {
    t: 12.6,
    p: {
      lean: 0.28,
      crouch: 0.35,
      look: 'left',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -140, y: 1110 },
      handR: { x: 120, y: 1130 },
    },
  },
  {
    t: 13.6,
    p: {
      lean: -0.1,
      crouch: 0.15,
      stance: 42,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      bendL: -1,
      bendR: -1,
      handL: { x: -148, y: 1035 },
      handR: { x: 148, y: 1035 },
    },
  },
  {
    t: 17.8,
    p: {
      lean: 0.15,
      crouch: 0.1,
      look: 'front',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -140, y: 1045 },
      handR: { x: 140, y: 1045 },
    },
  },

  // --- Scene 4 (18–24s): Sofa cushion -> pillows -> elastic slingshot trap ---
  {
    t: 18.25,
    p: {
      lean: 0,
      sit: 0.8,
      crouch: 0,
      look: 'front',
      mouth: 'o',
      brow: 'uneven',
      eye: 'wide',
      handL: { x: -135, y: 1120 },
      handR: { x: 135, y: 1120 },
    },
  },
  {
    t: 19.75,
    p: {
      lean: -0.12,
      sit: 0.35,
      crouch: 0.25,
      look: 'left',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -145, y: 1060 },
      handR: { x: 145, y: 1060 },
    },
  },
  {
    t: 21.2,
    p: {
      lean: 0.22,
      sit: 0,
      crouch: 0.2,
      stance: 28,
      look: 'left',
      mouth: 'grit',
      brow: 'angry',
      eye: 'wide',
      handL: { x: -140, y: 1080 },
      handR: { x: 140, y: 1080 },
    },
  },
  {
    t: 23.6,
    p: {
      lean: -0.18,
      crouch: 0.18,
      look: 'left',
      mouth: 'o',
      brow: 'sad',
      eye: 'shut',
      handL: { x: -120, y: 1130 },
      handR: { x: 120, y: 1130 },
    },
  },

  // --- Scene 5 (24–30s): Carefully unhooks end, celebrates, beanie flicked off! ---
  {
    t: 24.4,
    p: {
      lean: 0.08,
      crouch: 0.2,
      stance: 12,
      look: 'left',
      mouth: 'flat',
      brow: 'determined',
      eye: 'squint',
      bendL: -1,
      bendR: -1,
      handL: { x: -76, y: 1215 },
      handR: { x: 76, y: 1215 },
    },
  },
  {
    t: 25.1,
    p: {
      lean: -0.06,
      crouch: 0.22,
      look: 'left',
      mouth: 'grit',
      brow: 'determined',
      eye: 'squint',
      gripL: true,
      gripR: true,
      bendL: -1,
      bendR: -1,
      handL: { x: -102, y: 1192 },
      handR: { x: -35, y: 1196 },
    },
  },
  {
    t: 26.1,
    p: {
      lean: 0.05,
      crouch: 0.08,
      look: 'left',
      mouth: 'o',
      brow: 'raised',
      eye: 'open',
      gripL: false,
      gripR: false,
      bendL: 1,
      bendR: 1,
      handL: { x: -95, y: 1165 },
      handR: { x: 74, y: 1240 },
    },
  },
  {
    t: 26.8,
    p: {
      lean: 0,
      crouch: 0,
      stance: 18,
      headTilt: -0.04,
      look: 'front',
      mouth: 'bigsmile',
      brow: 'raised',
      eye: 'happy',
      fistL: true,
      fistR: true,
      bendL: -1,
      bendR: -1,
      handL: { x: -118, y: 985 },
      handR: { x: 118, y: 985 },
    },
  },
  {
    t: 28.25,
    p: {
      lean: 0.06,
      headTilt: 0.14,
      headDrop: 10,
      look: 'up',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      fistL: false,
      fistR: false,
      beanieOn: false,
      bendL: 1,
      bendR: 1,
      handL: { x: -92, y: 1220 },
      handR: { x: 92, y: 1220 },
    },
  },
  {
    t: 28.65,
    p: {
      lean: 0,
      headTilt: 0,
      headDrop: 0,
      headTurn: 0,
      look: 'front',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      beanieOn: false,
      stance: 4,
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
  { from: 0.25, to: 5.8, text: 'HOW STRONG IS THIS THING?!' },
  { from: 6.2, to: 11.8, text: 'UH-OH…' },
  { from: 13.45, to: 17.85, text: 'AAAAAAAA!' },
  { from: 18.2, to: 23.85, text: 'MAKE IT STOP!' },
  { from: 24.3, to: 29.95, text: 'NEVER TOUCH THAT AGAIN!' },
];

export class RubberBandTrapRenderer {
  public render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig): void {
    ctx.save();
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const camX = this.cameraXAt(time);

    ctx.save();
    ctx.translate(-camX, 0);

    // 1. Background room
    this.drawRoom(ctx);

    // 2. Sofa cushion & pillow pile on the right lounge half of the room
    this.drawSofaAndPillows(ctx, time);

    // 3. Two heavy wooden posts (Post 1 snaps loose at 13.3s!)
    this.drawWoodenPosts(ctx, time);

    // 4. Rubber band back layer (strands behind Stickman)
    this.drawRubberBandLayer(ctx, time, 'back');

    // 5. Angry Stickman
    this.drawCharacter(ctx, time);

    // 6. Rubber band front layer (waist loop / front strap / beanie flick tail)
    this.drawRubberBandLayer(ctx, time, 'front');

    // 7. Knocked-off red beanie & impact effects
    this.drawFlyingBeanie(ctx, time);
    this.drawMotionAndImpactFX(ctx, time);

    ctx.restore();

    // 8. Burned-in captions (screen space)
    if (config.showCaptions) {
      this.drawCaptions(ctx, time);
    }

    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Camera Pan & Character Motion Timeline (Continuous World)
  // -------------------------------------------------------------------------
  private cameraXAt(t: number): number {
    if (t < 13.55) return 0;
    if (t < 17.8) return lerp(0, 760, smooth(inv(13.55, 17.4, t)));
    return 760;
  }

  private charAt(t: number): {
    x: number;
    ground: number;
    lift: number;
    rot: number;
    bandWaist: boolean;
  } {
    // Scene 1 (0–6s): walks from x=580 to x=510, grabs band, pulls back to x=385
    if (t < 2.0) {
      const u = smooth(inv(0.0, 1.4, t));
      const x = lerp(600, 515, u);
      const bob = t < 1.4 ? Math.abs(Math.sin(t * 9)) * 10 : 0;
      return { x, ground: FLOOR_Y, lift: bob, rot: 0, bandWaist: false };
    }
    if (t < 6.0) {
      const u = smooth(inv(2.3, 5.6, t));
      const x = lerp(515, 385, u);
      return { x, ground: FLOOR_Y, lift: 0, rot: 0, bandWaist: false };
    }
    // Scene 2 (6–12s): pulls harder to x=335, stumbles so band loops around waist!
    if (t < 7.8) {
      const u = smooth(inv(6.0, 7.2, t));
      const x = lerp(385, 335, u);
      const shake = Math.sin(t * 44) * 3.5;
      return { x: x + shake, ground: FLOOR_Y, lift: 0, rot: 0, bandWaist: t >= 7.4 };
    }
    if (t < 13.5) {
      const tremble = t > 11.8 ? Math.sin(t * 48) * 5 : Math.sin(t * 28) * 2;
      const pullFwd = smooth(inv(8.0, 13.3, t)) * 32;
      return { x: 335 + pullFwd + tremble, ground: FLOOR_Y, lift: 0, rot: 0, bandWaist: true };
    }
    // Scene 3 (13.5–18.1s): Launched violently rightward, spinning through the air!
    if (t < 18.1) {
      const u = inv(13.5, 18.1, t);
      const x = lerp(367, SOFA_X - 10, easeOut(u));
      const arc = Math.sin(u * Math.PI) * 560;
      const rot = u * Math.PI * 5.2;
      return { x, ground: FLOOR_Y, lift: arc + 40, rot, bandWaist: true };
    }
    // Scene 4 (18.1–24.0s): Sofa bounce -> Pillow pile -> Elastic slingshot rebounds
    if (t < 19.75) {
      // Bounce from Sofa (1600) up into Pillow Pile (1290)
      const u = inv(18.1, 19.75, t);
      const x = lerp(SOFA_X - 10, PILLOW_X, u);
      const arc = Math.sin(u * Math.PI) * 390;
      const rot = lerp(0.35, -0.45, u);
      return { x, ground: FLOOR_Y - 65, lift: arc, rot, bandWaist: true };
    }
    if (t < 21.15) {
      // Rebound off pillows toward left slingshot catch (1040 -> 1340)
      const u = inv(19.75, 21.15, t);
      const x = lerp(PILLOW_X, 1350, smooth(u));
      const arc = Math.sin(u * Math.PI) * 240;
      const rot = Math.sin(u * Math.PI) * 0.65;
      return { x, ground: FLOOR_Y - 50, lift: arc, rot, bandWaist: true };
    }
    if (t < 24.0) {
      // Slingshot yo-yo oscillations anchored back to Post 2 (900)
      const u = inv(21.15, 24.0, t);
      const decay = 1 - 0.55 * u;
      const osc = Math.cos(u * Math.PI * 3.0);
      const x = 1140 + osc * 225 * decay;
      const lift = Math.abs(Math.sin(u * Math.PI * 3.0)) * 130 * decay + 15;
      const rot = osc * 0.35 * decay;
      return { x, ground: FLOOR_Y, lift, rot, bandWaist: true };
    }
    // Scene 5 (24.0–30.0s): Steadies at x=1140, carefully unhooks band, celebrates, gets beanie flicked!
    const x = 1140;
    const bandWaist = t < 26.05;
    let lift = 0;
    if (t >= 26.75 && t < 28.05) {
      lift = Math.abs(Math.sin((t - 26.75) * 8)) * 22;
    }
    return { x, ground: FLOOR_Y, lift, rot: 0, bandWaist };
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

    // Keep hands locked near waist/band when stretching or grabbing
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
      handL: { x: ch.x + dxL, y: dyL - ch.lift - groundOff },
      handR: { x: ch.x + dxR, y: dyR - ch.lift - groundOff },
      bendL: mid ? b.p.bendL : a.p.bendL,
      bendR: mid ? b.p.bendR : a.p.bendR,
      gripL: mid ? b.p.gripL : a.p.gripL,
      gripR: mid ? b.p.gripR : a.p.gripR,
      fistL: mid ? b.p.fistL : a.p.fistL,
      fistR: mid ? b.p.fistR : a.p.fistR,
      pointL: mid ? b.p.pointL : a.p.pointL,
      pointR: mid ? b.p.pointR : a.p.pointR,
      beanieOn: mid ? b.p.beanieOn : a.p.beanieOn,
      crouch: lerp(a.p.crouch, b.p.crouch, u),
      sit: lerp(a.p.sit, b.p.sit, u),
    };
  }

  // -------------------------------------------------------------------------
  // Room, Sofa & Wooden Posts
  // -------------------------------------------------------------------------
  private drawRoom(ctx: CanvasRenderingContext2D) {
    // Wall
    ctx.fillStyle = WALL_MAIN;
    ctx.fillRect(-100, 0, 2200, FLOOR_Y);

    // Top ceiling accent
    ctx.fillStyle = WALL_TOP;
    ctx.fillRect(-100, 0, 2200, 220);

    // Subtle pop vertical stripes
    ctx.fillStyle = WALL_STRIPE;
    for (let x = 0; x < 2100; x += 180) {
      ctx.fillRect(x, 220, 70, FLOOR_Y - 220);
    }

    // Framed sunny window on left wall & right lounge wall
    for (const wx of [540, 1450]) {
      ctx.save();
      ctx.fillStyle = '#bae6fd';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(wx - 130, 360, 260, 300, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath();
      ctx.arc(wx - 50, 440, 32, 0, TAU);
      ctx.arc(wx - 15, 435, 38, 0, TAU);
      ctx.arc(wx + 25, 445, 28, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(wx, 360);
      ctx.lineTo(wx, 660);
      ctx.moveTo(wx - 130, 510);
      ctx.lineTo(wx + 130, 510);
      ctx.stroke();
      ctx.restore();
    }

    // Baseboard
    ctx.fillStyle = BASEBOARD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillRect(-100, FLOOR_Y - 46, 2200, 46);
    ctx.beginPath();
    ctx.moveTo(-100, FLOOR_Y - 46);
    ctx.lineTo(2100, FLOOR_Y - 46);
    ctx.stroke();

    // Floor
    ctx.fillStyle = FLOOR;
    ctx.fillRect(-100, FLOOR_Y, 2200, HEIGHT - FLOOR_Y);

    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 4;
    for (let y = FLOOR_Y + 75; y < HEIGHT; y += 85) {
      ctx.beginPath();
      ctx.moveTo(-100, y);
      ctx.lineTo(2100, y);
      ctx.stroke();
    }

    // Crisp floor border
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-100, FLOOR_Y);
    ctx.lineTo(2100, FLOOR_Y);
    ctx.stroke();
  }

  private drawSofaAndPillows(ctx: CanvasRenderingContext2D, t: number) {
    // 1. Giant Sofa Cushion (x = 1600) with squash on impact at 18.25s
    const sofaSquash =
      t >= 18.1 && t <= 19.0
        ? Math.sin(inv(18.1, 19.0, t) * Math.PI) * 0.28
        : 0;

    ctx.save();
    ctx.translate(SOFA_X, FLOOR_Y);
    ctx.scale(1 + sofaSquash * 0.45, 1 - sofaSquash);

    // Shadow
    ctx.fillStyle = 'rgba(23,18,31,0.16)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 210, 18, 0, 0, TAU);
    ctx.fill();

    // Sofa wooden feet
    ctx.fillStyle = WOOD_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    for (const fx of [-155, 130]) {
      ctx.beginPath();
      ctx.roundRect(fx, -26, 28, 28, 6);
      ctx.fill();
      ctx.stroke();
    }

    // Backrest
    ctx.fillStyle = SOFA_BASE;
    ctx.beginPath();
    ctx.roundRect(-190, -250, 380, 165, 34);
    ctx.fill();
    ctx.stroke();

    // Giant puffy seat cushion
    ctx.fillStyle = SOFA_CUSHION;
    ctx.beginPath();
    ctx.roundRect(-200, -140, 400, 118, 42);
    ctx.fill();
    ctx.stroke();

    // Cushion highlight
    ctx.fillStyle = SOFA_LIGHT;
    ctx.beginPath();
    ctx.roundRect(-165, -124, 330, 24, 12);
    ctx.fill();

    // Side armrest
    ctx.fillStyle = SOFA_BASE;
    ctx.beginPath();
    ctx.roundRect(145, -195, 62, 172, 26);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Soft Pile of Pillows (x = 1290)
    const pillowSquash =
      t >= 19.55 && t <= 20.5
        ? Math.sin(inv(19.55, 20.5, t) * Math.PI) * 0.3
        : 0;
    const pillows = [
      { dx: -70, dy: -42, w: 150, h: 72, rot: -0.14, c: PILLOW_COLORS[0] },
      { dx: 68, dy: -40, w: 155, h: 74, rot: 0.12, c: PILLOW_COLORS[1] },
      { dx: -18, dy: -94, w: 162, h: 76, rot: 0.08, c: PILLOW_COLORS[2] },
      { dx: 24, dy: -138, w: 140, h: 68, rot: -0.18, c: PILLOW_COLORS[3] },
    ];
    ctx.save();
    ctx.translate(PILLOW_X, FLOOR_Y);
    ctx.scale(1 + pillowSquash * 0.4, 1 - pillowSquash);
    ctx.fillStyle = 'rgba(23,18,31,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 170, 16, 0, 0, TAU);
    ctx.fill();

    for (const pv of pillows) {
      ctx.save();
      ctx.translate(pv.dx, pv.dy);
      ctx.rotate(pv.rot);
      ctx.fillStyle = pv.c;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(-pv.w / 2, -pv.h / 2, pv.w, pv.h, 28);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  private drawPost(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tilt: number,
    cracked: boolean
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);

    // Shadow
    ctx.fillStyle = 'rgba(23,18,31,0.16)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 52, 12, 0, 0, TAU);
    ctx.fill();

    // Wooden column
    ctx.fillStyle = WOOD_MAIN;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(-28, -POST_H, 56, POST_H, 10);
    ctx.fill();
    ctx.stroke();

    // Wood grain highlight
    ctx.fillStyle = WOOD_LIGHT;
    ctx.fillRect(-16, -POST_H + 14, 12, POST_H - 34);

    // Post cap
    ctx.fillStyle = WOOD_DARK;
    ctx.beginPath();
    ctx.roundRect(-36, -POST_H - 18, 72, 26, 8);
    ctx.fill();
    ctx.stroke();

    // Rubber band notch collar at anchor height
    ctx.fillStyle = STEEL;
    ctx.beginPath();
    ctx.roundRect(-34, -335, 68, 48, 8);
    ctx.fill();
    ctx.stroke();

    if (cracked) {
      // Jagged crack near base
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-26, -34);
      ctx.lineTo(-4, -22);
      ctx.lineTo(14, -40);
      ctx.lineTo(28, -24);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawFloorBracket(ctx: CanvasRenderingContext2D, x: number, broken: boolean) {
    ctx.save();
    ctx.translate(x, FLOOR_Y);
    ctx.fillStyle = STEEL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-42, -24, 84, 24, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = STEEL;
    for (const bx of [-26, 26]) {
      ctx.beginPath();
      ctx.arc(bx, broken ? -26 : -12, 6, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawWoodenPosts(ctx: CanvasRenderingContext2D, t: number) {
    // Post 1 (x = 220): bends inward 12.0–13.3s, snaps off at 13.3s!
    const bendIn = t < 12.0 ? smooth(inv(4.0, 12.0, t)) * 0.14 : 0.14 + smooth(inv(12.0, 13.3, t)) * 0.28;
    const tremble = t >= 11.8 && t < 13.3 ? Math.sin(t * 58) * 0.035 : 0;

    if (t < 13.3) {
      this.drawPost(ctx, POST1_X, FLOOR_Y, bendIn + tremble, t >= 12.4);
      this.drawFloorBracket(ctx, POST1_X, false);
    } else {
      // Broken floor bracket + toppled Post 1 lying tilted on floor
      this.drawFloorBracket(ctx, POST1_X, true);
      const fallU = smooth(inv(13.3, 14.0, t));
      const tilt = lerp(0.42, -1.42, easeOut(fallU));
      const px = lerp(POST1_X, POST1_X + 70, fallU);
      const py = FLOOR_Y - Math.sin(fallU * Math.PI) * 55 - 24 * fallU;
      this.drawPost(ctx, px, py, tilt, true);
    }

    // Post 2 (x = 900): stays firmly anchored throughout all 5 scenes
    let p2Tilt = 0;
    if (t >= 3.0 && t < 13.3) {
      p2Tilt = -smooth(inv(3.0, 13.0, t)) * 0.12 - (t > 11.8 ? Math.sin(t * 54) * 0.02 : 0);
    } else if (t >= 13.3 && t < 14.2) {
      const u = inv(13.3, 14.2, t);
      p2Tilt = -0.12 * (1 - u) * Math.cos(u * 14);
    } else if (t >= 21.15 && t < 24.2) {
      p2Tilt = 0.08 * Math.sin((t - 21.15) * 7);
    }
    this.drawPost(ctx, POST2_X, FLOOR_Y, p2Tilt, false);
    this.drawFloorBracket(ctx, POST2_X, false);
  }

  // -------------------------------------------------------------------------
  // Giant Stretchy Red Rubber Band (back & front layers)
  // -------------------------------------------------------------------------
  private drawStrap(
    ctx: CanvasRenderingContext2D,
    p1: Pt,
    ctrl: Pt,
    p2: Pt,
    thickness = 22
  ) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Thick black outline
    ctx.strokeStyle = INK;
    ctx.lineWidth = thickness + 10;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(ctrl.x, ctrl.y, p2.x, p2.y);
    ctx.stroke();

    // Vibrant red fill
    ctx.strokeStyle = BAND_RED;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(ctrl.x, ctrl.y, p2.x, p2.y);
    ctx.stroke();

    // Inner bright highlight
    ctx.strokeStyle = BAND_HIGHLIGHT;
    ctx.lineWidth = Math.max(4, thickness * 0.25);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y - 3);
    ctx.quadraticCurveTo(ctrl.x, ctrl.y - 3, p2.x, p2.y - 3);
    ctx.stroke();

    ctx.restore();
  }

  private drawRubberBandLayer(
    ctx: CanvasRenderingContext2D,
    t: number,
    layer: 'back' | 'front'
  ) {
    const ch = this.charAt(t);
    const hipY = ch.ground - ch.lift - 265;
    const p1X = POST1_X + (t < 13.3 ? Math.sin(smooth(inv(4, 13.3, t)) * 0.42) * 310 : 0);
    const p1 = { x: p1X, y: BAND_ANCHOR_Y };
    const p2 = { x: POST2_X, y: BAND_ANCHOR_Y };

    // Before Post 1 snaps (0.0 – 13.3s): band spans between Post 1 & Post 2
    if (t < 13.3) {
      const vib = t >= 4.0 ? Math.sin(t * 58) * (t > 11.5 ? 10 : 5) : 0;

      if (layer === 'back') {
        // Back strand stretches cleanly behind Stickman between Post 1 and Post 2
        const sag = t < 2.2 ? 32 : lerp(32, -8, smooth(inv(2.2, 6.5, t)));
        this.drawStrap(
          ctx,
          p1,
          { x: (p1.x + p2.x) / 2, y: BAND_ANCHOR_Y + sag + vib * 0.6 },
          p2,
          20
        );
      } else {
        // Front strand: Stickman pulls it with hands (2.1–7.4s) then loops around waist (7.4–13.3s)!
        let pullPt: Pt;
        if (t < 2.1) {
          pullPt = { x: (p1.x + p2.x) / 2, y: BAND_ANCHOR_Y + 46 };
        } else if (t < 7.4) {
          const blend = smooth(inv(2.1, 2.5, t));
          const handPull = { x: ch.x + 10, y: 1188 + vib };
          const slack = { x: (p1.x + p2.x) / 2, y: BAND_ANCHOR_Y + 46 };
          pullPt = { x: lerp(slack.x, handPull.x, blend), y: lerp(slack.y, handPull.y, blend) };
        } else {
          pullPt = { x: ch.x, y: hipY + 12 + vib };
        }
        const thick = clamp(22 - smooth(inv(2.4, 12.8, t)) * 5, 16, 22);
        this.drawStrap(ctx, p1, { x: lerp(p1.x, pullPt.x, 0.55), y: pullPt.y + 8 }, pullPt, thick);
        this.drawStrap(ctx, pullPt, { x: lerp(pullPt.x, p2.x, 0.45), y: pullPt.y + 8 }, p2, thick);

        if (ch.bandWaist) {
          // Draw waist collar wrap directly over Stickman's torso/hip seam
          ctx.save();
          ctx.strokeStyle = INK;
          ctx.lineWidth = 28;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(ch.x - 42, hipY + 8);
          ctx.quadraticCurveTo(ch.x, hipY + 24, ch.x + 42, hipY + 8);
          ctx.stroke();
          ctx.strokeStyle = BAND_RED;
          ctx.lineWidth = 18;
          ctx.beginPath();
          ctx.moveTo(ch.x - 42, hipY + 8);
          ctx.quadraticCurveTo(ch.x, hipY + 24, ch.x + 42, hipY + 8);
          ctx.stroke();
          ctx.restore();
        }
      }
      return;
    }

    // 13.3s – 26.05s: Freed from Post 1, band stays anchored to Post 2 (x = 900)
    // and wraps around Stickman through his flight, cushion bounce & slingshot trap!
    if (t < 26.05) {
      if (layer === 'back') {
        // Upper strand behind Stickman from Post 2 to Stickman's waist
        this.drawStrap(
          ctx,
          p2,
          { x: lerp(p2.x, ch.x, 0.5), y: lerp(p2.y, hipY, 0.5) - 24 },
          { x: ch.x, y: hipY },
          18
        );
      } else {
        // Lower/front strand from Post 2 to Stickman's waist + waist loop
        this.drawStrap(
          ctx,
          p2,
          { x: lerp(p2.x, ch.x, 0.5), y: lerp(p2.y, hipY, 0.5) + 28 },
          { x: ch.x, y: hipY + 10 },
          18
        );

        // Waist wrap (except while he carefully slips it open at 25.2–26.05s)
        const unhook = inv(25.2, 26.05, t);
        if (unhook < 1) {
          ctx.save();
          ctx.translate(ch.x, hipY + 10);
          ctx.rotate(ch.rot);
          ctx.strokeStyle = INK;
          ctx.lineWidth = 26;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-42 - unhook * 28, -4);
          ctx.quadraticCurveTo(0, 14 + unhook * 10, 42 - unhook * 20, -4);
          ctx.stroke();
          ctx.strokeStyle = BAND_RED;
          ctx.lineWidth = 16;
          ctx.beginPath();
          ctx.moveTo(-42 - unhook * 28, -4);
          ctx.quadraticCurveTo(0, 14 + unhook * 10, 42 - unhook * 20, -4);
          ctx.stroke();
          ctx.restore();
        }
      }
      return;
    }

    // 26.05s – 30.0s: Snaps back cleanly to Post 2, then tail flicks Stickman's beanie off at 28.18s!
    if (layer === 'front') {
      const snapU = inv(26.05, 26.8, t);
      const decay = 1 - clamp(snapU, 0, 1);
      const tailEnd =
        t < 26.8
          ? {
              x: lerp(ch.x - 40, POST2_X + 75, easeOut(snapU)),
              y: lerp(hipY, BAND_ANCHOR_Y + 90, snapU) + Math.sin(t * 42) * 55 * decay,
            }
          : t >= 28.0 && t < 28.65
          ? // Cheeky elastic tail flicks right up to Stickman's beanie at 28.25s and snaps back!
            (() => {
              const f = inv(28.0, 28.65, t);
              const reach = Math.sin(f * Math.PI);
              return {
                x: lerp(POST2_X + 50, ch.x - 10, reach),
                y: lerp(BAND_ANCHOR_Y + 115, ch.ground - 585, reach),
              };
            })()
          : {
              x: POST2_X + 52 + Math.sin(t * 7) * 8,
              y: BAND_ANCHOR_Y + 125 + Math.cos(t * 5) * 6,
            };

      this.drawStrap(
        ctx,
        p2,
        { x: lerp(p2.x, tailEnd.x, 0.5) - 18, y: lerp(p2.y, tailEnd.y, 0.5) + 32 },
        tailEnd,
        20
      );

      // Loop collar visibly wrapped around Post 2
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 28;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(POST2_X - 36, BAND_ANCHOR_Y);
      ctx.lineTo(POST2_X + 36, BAND_ANCHOR_Y);
      ctx.stroke();
      ctx.strokeStyle = BAND_RED;
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(POST2_X - 36, BAND_ANCHOR_Y);
      ctx.lineTo(POST2_X + 36, BAND_ANCHOR_Y);
      ctx.stroke();
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------------
  // Flying Knocked-Off Beanie & FX
  // -------------------------------------------------------------------------
  private drawFlyingBeanie(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 28.25) return;
    const ch = this.charAt(28.25);
    const startX = ch.x;
    const startY = FLOOR_Y - 580;
    const endX = 1365;
    const endY = FLOOR_Y - 26;

    const u = clamp(inv(28.25, 29.05, t), 0, 1);
    const x = lerp(startX, endX, easeOut(u));
    const y = lerp(startY, endY, u * u) - Math.sin(u * Math.PI) * 190;
    const rot = lerp(0, 2.35, u);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(0.92, 0.92);
    this.drawBeanieShape(ctx);
    ctx.restore();
  }

  private drawMotionAndImpactFX(ctx: CanvasRenderingContext2D, t: number) {
    // Wood splinters when Post 1 cracks loose at 13.3s
    if (t >= 13.25 && t <= 14.0) {
      const u = inv(13.25, 14.0, t);
      ctx.save();
      ctx.globalAlpha = 1 - u;
      for (let i = 0; i < 6; i++) {
        const ang = -Math.PI * 0.8 + i * 0.32;
        const dist = u * (140 + (i % 3) * 45);
        const sx = POST1_X + Math.cos(ang) * dist;
        const sy = FLOOR_Y - 30 + Math.sin(ang) * dist + u * u * 160;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(ang + u * 4);
        ctx.fillStyle = WOOD_LIGHT;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 4;
        ctx.fillRect(-14, -6, 28, 12);
        ctx.strokeRect(-14, -6, 28, 12);
        ctx.restore();
      }
      ctx.restore();
    }

    // Cartoon "SNAP!" / "BOING!" starburst at post break & beanie flick
    if (t >= 13.3 && t <= 13.75) {
      this.drawBurstRing(ctx, POST1_X + 35, FLOOR_Y - 80, inv(13.3, 13.75, t), '#fde047');
    }
    if (t >= 28.18 && t <= 28.6) {
      this.drawBurstRing(ctx, 1140, FLOOR_Y - 565, inv(28.18, 28.6, t), '#fde047');
    }
  }

  private drawBurstRing(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    u: number,
    color: string
  ) {
    ctx.save();
    ctx.globalAlpha = 1 - u;
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 7;
    const r0 = 28 + u * 55;
    const r1 = 62 + u * 95;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.stroke();
    }
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Locked Character Rig (POP_UP_TENT_CHARACTER.md — exact proportions)
  // -------------------------------------------------------------------------
  private drawCharacter(ctx: CanvasRenderingContext2D, t: number) {
    const ch = this.charAt(t);
    const pose = this.poseAt(t);
    const baseY = ch.ground - ch.lift;
    const hipY = baseY - (300 - 150 * pose.crouch - 170 * pose.sit);

    const arms = this.computeArms(pose, ch.x, hipY);

    if (ch.lift < 6 && pose.sit < 0.5) {
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

    // Thin black legs, knee to ankle.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(kneeL.x, kneeL.y);
    ctx.lineTo(ankleL.x, ankleL.y);
    ctx.moveTo(kneeR.x, kneeR.y);
    ctx.lineTo(ankleR.x, ankleR.y);
    ctx.stroke();

    // Blue trousers, hip to knee.
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

    // Torso.
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

    // Neck.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(bodyTopX, shoulderY + 8);
    ctx.lineTo(bodyTopX, shoulderY - 20);
    ctx.stroke();

    // Arms.
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

    // Brows.
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

    // Mouth.
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
