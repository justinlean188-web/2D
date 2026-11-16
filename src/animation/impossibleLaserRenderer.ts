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

// --- Vault & Laser Palette (Modern Pop 2D Flat Vector) ----------------------
const VAULT_WALL = '#f1f5f9';
const VAULT_BAND = '#e2e8f0';
const FLOOR_TILE = '#cbd5e1';
const FLOOR_LINE = '#94a3b8';

const EMITTER_BODY = '#334155';
const EMITTER_CAP = '#475569';
const LASER_RED = '#ef4444';
const LASER_CORE = '#fecaca';
const GLASS_FILL = 'rgba(125, 211, 252, 0.34)';
const GLASS_EDGE = '#0ea5e9';
const MIRROR_GLASS = '#bae6fd';
const MIRROR_FRAME = '#475569';
const RAMP_TEAL = '#06b6d4';

const GOLD_CUP = '#facc15';
const GOLD_DEEP = '#ca8a04';
const BALL_ORANGE = '#f97316';
const BALL_HIGHLIGHT = '#fdba74';

const FLOOR_Y = 1500;
const HEAD_R = 70;
const BALL_R = 16;

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
  // Scene 1 (0–6s): Discovers laser vault -> throws ball -> blocked by laser barrier -> gets idea!
  {
    t: 0.0,
    p: {
      lean: 0.06,
      look: 'right',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      handL: { x: -66, y: 1242 },
      handR: { x: 86, y: 1185 },
      gripR: true,
    },
  },
  {
    t: 1.75,
    p: {
      lean: -0.14,
      look: 'right',
      mouth: 'grit',
      brow: 'determined',
      handR: { x: -40, y: 1090 },
      gripR: true,
    },
  },
  {
    t: 2.1,
    p: {
      lean: 0.18,
      stance: 18,
      look: 'right',
      mouth: 'o',
      brow: 'determined',
      gripR: false,
      handR: { x: 115, y: 1125 },
    },
  },
  {
    t: 2.85,
    p: {
      lean: -0.06,
      look: 'right',
      mouth: 'frown',
      brow: 'angry',
      eye: 'wide',
      handL: { x: -75, y: 1240 },
      handR: { x: 75, y: 1240 },
    },
  },
  {
    t: 4.5,
    p: {
      lean: -0.04,
      look: 'front',
      mouth: 'grin',
      brow: 'raised',
      eye: 'wide',
      handR: { x: 102, y: 1120 },
      pointR: true,
    },
  },

  // Scene 2 (6–12s): Places laser-reflecting mirror -> smiles & sets ball on ramp!
  {
    t: 6.4,
    p: {
      lean: 0.14,
      pointR: false,
      look: 'right',
      mouth: 'smile',
      brow: 'determined',
      eye: 'open',
      handL: { x: -64, y: 1205 },
      handR: { x: 96, y: 1090 },
      gripR: true,
    },
  },
  {
    t: 8.6,
    p: {
      lean: 0.04,
      look: 'right',
      mouth: 'bigsmile',
      brow: 'cocky',
      eye: 'happy',
      gripR: false,
      handL: { x: -68, y: 1242 },
      handR: { x: 98, y: 1155 },
    },
  },

  // Scene 3 (12–18s): Places 3 trickshot mirrors -> releases ball down ramp!
  {
    t: 12.6,
    p: {
      lean: 0.12,
      look: 'right',
      mouth: 'smirk',
      brow: 'determined',
      eye: 'open',
      handL: { x: -60, y: 1215 },
      handR: { x: 98, y: 1185 },
      gripR: true,
    },
  },
  {
    t: 15.0,
    p: {
      lean: 0.16,
      look: 'right',
      mouth: 'grin',
      brow: 'cocky',
      gripR: false,
      handL: { x: -72, y: 1240 },
      handR: { x: 112, y: 1140 },
      pointR: true,
    },
  },

  // Scene 4 (18–24s): Watches ball squeeze between crossing laser beams -> golden cup nervously!
  {
    t: 18.4,
    p: {
      lean: 0.18,
      crouch: 0.24,
      pointR: false,
      look: 'right',
      mouth: 'o',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -52, y: 1195 },
      handR: { x: 52, y: 1195 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 5 (24–30s): Victory dance -> cup triggers hidden switch -> red laser cage traps him -> slowly raises hands!
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
      handL: { x: -115, y: 1020 },
      handR: { x: 115, y: 1020 },
      bendL: -1,
      bendR: -1,
      fistL: true,
      fistR: true,
    },
  },
  {
    t: 26.35,
    p: {
      lean: 0,
      stance: 6,
      look: 'front',
      mouth: 'o',
      brow: 'raised',
      eye: 'wide',
      fistL: false,
      fistR: false,
      handL: { x: -74, y: 1225 },
      handR: { x: 74, y: 1225 },
      bendL: 1,
      bendR: 1,
    },
  },
  {
    t: 27.3,
    p: {
      lean: 0,
      stance: 4,
      look: 'front',
      mouth: 'flat',
      brow: 'sad',
      eye: 'wide',
      handL: { x: -72, y: 1015 },
      handR: { x: 72, y: 1015 },
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
  { from: 0.25, to: 5.75, text: 'IMPOSSIBLE LASER MAZE?!' },
  { from: 6.25, to: 11.75, text: 'CONTROL THE LASERS!' },
  { from: 12.25, to: 17.75, text: 'THREE PERFECT ANGLES!' },
  { from: 18.25, to: 23.75, text: "DON'T TOUCH THE LASERS!" },
  { from: 24.25, to: 29.85, text: "I WON... BUT I'M TRAPPED! 😂" },
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

export class ImpossibleLaserRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.walkPhase);
    const ball = this.ballAt(time);

    // 1. Vault Backdrop, Glass Walls & Pedestal with Golden Target Cup
    this.drawVaultBackdrop(ctx);
    this.drawPedestalAndCupBack(ctx, time);

    // 2. Ramp & Mirrors (Laser-Deflector Mirror in Scene 2 + 3 Trickshot Mirrors in Scene 3+)
    this.drawRampAndMirrors(ctx, time);

    // 3. Laser Emitters & Active Red Laser Beams (always reflecting believably)
    this.drawLaserSystem(ctx, time);

    // 4. Glass Wall Panels framing the narrow laser gap
    this.drawGlassWalls(ctx);

    // 5. Locked Angry Stickman
    this.drawCharacter(ctx, ch, pose, time);

    // 6. Scene 5 Trap Cage Lasers around Stickman (front glow bars)
    if (time >= 26.35) {
      this.drawTrapCage(ctx, time, ch.x);
    }

    // 7. Orange Ball & Golden Cup Front Lip
    this.drawOrangeBall(ctx, ball.x, ball.y, ball.rot);
    this.drawCupFront(ctx, 955, time >= 26.15 ? 1326 : 1320);

    // 8. Visual FX (laser block zap, mirror glint, victory confetti)
    this.drawVisualFX(ctx, time);

    // 9. Screen-space Burned-in Scene Captions & Safe Zones
    this.drawCaptions(ctx, time);
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Character, Pose & Ball Timelines (Single Locked Vault Room, camX = 0)
  // -------------------------------------------------------------------------
  private charAt(t: number): CharState {
    let x = 185;
    const ground = FLOOR_Y;
    let lift = 0;
    let walkPhase = 0;

    if (t < 6.0) {
      x = 185;
    } else if (t < 7.8) {
      const k = smooth(inv(6.0, 7.2, t));
      x = lerp(185, 320, k);
      walkPhase = k * TAU;
    } else if (t < 11.4) {
      const k = smooth(inv(7.8, 9.2, t));
      x = lerp(320, 185, k);
      walkPhase = k * TAU;
    } else if (t < 24.3) {
      x = 185;
    } else if (t < 26.15) {
      // Victory dance!
      x = 185 + Math.sin((t - 24.3) * 8) * 16;
      const j = ((t - 24.3) * 2.5) % 1;
      lift = Math.sin(j * Math.PI) * 44;
    } else {
      x = 185;
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
      p.footLift += Math.max(0, w) * 32;
      p.stance += w * 14;
      p.handL.x += w * 16;
      p.handR.x -= w * 16;
    }

    return p;
  }

  private ballAt(t: number): BallState {
    // Scene 1 (0–6s): Held -> thrown -> deflected off Laser 1 barrier at x=434 (never passes through beam!)
    if (t < 1.75) {
      return { x: 255, y: 1185, rot: 0 };
    }
    if (t < 2.1) {
      const k = smooth(inv(1.75, 2.1, t));
      return { x: lerp(255, 145, k), y: lerp(1185, 1090, k), rot: 0 };
    }
    if (t < 2.75) {
      const u = inv(2.1, 2.75, t);
      return {
        x: lerp(145, 434, u),
        y: lerp(1090, 1130, u) - Math.sin(u * Math.PI) * 55,
        rot: u * 8,
      };
    }
    if (t < 3.6) {
      // Blocked and bounced cleanly back left to floor!
      const u = inv(2.75, 3.6, t);
      return {
        x: lerp(434, 240, u),
        y: lerp(1130, FLOOR_Y - BALL_R, u * u),
        rot: 8 + u * 8,
      };
    }
    if (t < 10.5) {
      return { x: 240, y: FLOOR_Y - BALL_R, rot: 16 };
    }

    // Scene 2–3 (10.5–15.2s): Positioned cleanly at top of launch ramp (215, 1175)
    if (t < 15.2) {
      const k = smooth(inv(10.5, 11.8, t));
      return {
        x: lerp(240, 215, k),
        y: lerp(FLOOR_Y - BALL_R, 1175, k),
        rot: 16,
      };
    }

    // Scene 3 (15.2–18s): Rolls down ramp -> Mirror 1 (380, 1380) -> Mirror 2 (460, 1015)!
    if (t < 16.3) {
      const u = inv(15.2, 16.3, t);
      return { x: lerp(215, 330, u), y: lerp(1175, 1320, u), rot: 16 + u * 8 };
    }
    if (t < 16.6) {
      const u = inv(16.3, 16.6, t);
      return { x: lerp(330, 380, u), y: lerp(1320, 1380, u), rot: 24 + u * 3 };
    }
    if (t < 18.1) {
      // Bounces off Mirror 1 steeply up-right to Mirror 2 (460, 1015) — completely clear of lasers!
      const u = inv(16.6, 18.1, t);
      return {
        x: lerp(380, 460, u),
        y: lerp(1380, 1015, u),
        rot: 27 + u * 12,
      };
    }

    // Scene 4 (18–24s): Travels strictly inside the laser-free corridor (y=1015..1005) between glass walls & crossing beams -> Mirror 3 (855, 1005) -> Golden Cup!
    if (t < 21.0) {
      const u = inv(18.1, 21.0, t);
      return {
        x: lerp(460, 855, u),
        y: lerp(1015, 1005, u),
        rot: 39 + u * 16,
      };
    }
    if (t < 24.3) {
      // Bounces off Mirror 3 cleanly into Golden Target Cup (955, 1252)
      const u = inv(21.0, 24.3, t);
      return {
        x: lerp(855, 955, smooth(u)),
        y: lerp(1005, 1252, u) - Math.sin(u * Math.PI) * 115,
        rot: 55 + u * 12,
      };
    }

    // Scene 5 (24–30s): Drops inside Golden Cup & rests!
    if (t < 24.55) {
      const u = inv(24.3, 24.55, t);
      return { x: 955, y: lerp(1252, 1288, u), rot: 67 };
    }
    return { x: 955, y: t >= 26.15 ? 1294 : 1288, rot: 67 };
  }

  // -------------------------------------------------------------------------
  // Vault Backdrop, Pedestal, Golden Cup, Ramp, Mirrors & Laser Beams
  // -------------------------------------------------------------------------
  private drawVaultBackdrop(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = VAULT_WALL;
    ctx.fillRect(0, 0, WIDTH, FLOOR_Y);

    ctx.fillStyle = VAULT_BAND;
    ctx.fillRect(0, 1140, WIDTH, FLOOR_Y - 1140);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 1140);
    ctx.lineTo(WIDTH, 1140);
    ctx.stroke();

    // Subtle geometric vault wall panels
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    for (let x = 180; x < WIDTH; x += 240) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1140);
      ctx.stroke();
    }

    // Floor tiles
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

  private drawPedestalAndCupBack(ctx: CanvasRenderingContext2D, t: number) {
    const switchTriggered = t >= 26.15;
    // Pedestal column (905..1005, top y=1320)
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(915, 1340, 80, FLOOR_Y - 1340);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.roundRect(900, 1320, 110, 24, 6);
    ctx.fill();
    ctx.stroke();

    // Hidden switch plate under the golden cup
    ctx.fillStyle = switchTriggered ? '#ef4444' : '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(928, switchTriggered ? 1316 : 1312, 54, 8, 3);
    ctx.fill();
    ctx.stroke();

    // Cup back ellipse
    const cupY = switchTriggered ? 1326 : 1320;
    ctx.fillStyle = GOLD_DEEP;
    ctx.beginPath();
    ctx.ellipse(955, cupY - 68, 28, 8, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private drawCupFront(ctx: CanvasRenderingContext2D, cx: number, bottomY: number) {
    ctx.fillStyle = GOLD_CUP;
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

  private drawRampAndMirrors(ctx: CanvasRenderingContext2D, t: number) {
    // 1. Launch Ramp (Scene 2+, from 8.2s)
    if (t >= 8.2) {
      const fade = smooth(inv(8.2, 9.0, t));
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(215, 1190);
      ctx.lineTo(215, FLOOR_Y);
      ctx.moveTo(320, 1340);
      ctx.lineTo(320, FLOOR_Y);
      ctx.stroke();

      ctx.save();
      ctx.translate(205, 1190);
      ctx.rotate(Math.atan2(145, 130));
      ctx.fillStyle = RAMP_TEAL;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(0, -11, 195, 22, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    }

    const drawMirror = (mx: number, my: number, angle: number, standToFloor: boolean, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      if (standToFloor) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx, FLOOR_Y);
        ctx.moveTo(mx - 28, FLOOR_Y);
        ctx.lineTo(mx + 28, FLOOR_Y);
        ctx.stroke();
      } else {
        // Wall bracket arm
        ctx.strokeStyle = INK;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx, my - 56);
        ctx.stroke();
      }
      ctx.translate(mx, my);
      ctx.rotate(angle);
      ctx.fillStyle = MIRROR_FRAME;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.roundRect(-48, -12, 96, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = MIRROR_GLASS;
      ctx.beginPath();
      ctx.roundRect(-41, -7, 82, 14, 4);
      ctx.fill();
      ctx.restore();
    };

    // 2. Laser-Control Mirror (placed in Scene 2 at 6.9s) at (450, 860)
    if (t >= 6.8) {
      drawMirror(450, 860, -0.52, false, smooth(inv(6.8, 7.4, t)));
    }

    // 3. Three Trickshot Mirrors (placed in Scene 3 from 12.2s)
    if (t >= 12.2) {
      const a1 = smooth(inv(12.2, 12.8, t));
      const a2 = smooth(inv(12.9, 13.5, t));
      const a3 = smooth(inv(13.6, 14.2, t));
      drawMirror(380, 1400, -0.35, true, a1);
      drawMirror(460, 1015, -0.82, false, a2);
      drawMirror(855, 1005, 0.92, false, a3);
    }
  }

  private drawLaserBeam(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    // Soft red outer glow
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Bright red beam
    ctx.strokeStyle = LASER_RED;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Crisp hot white-pink core
    ctx.strokeStyle = LASER_CORE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  private drawEmitter(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.fillStyle = EMITTER_BODY;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(-18, -14, 36, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = LASER_RED;
    ctx.beginPath();
    ctx.arc(14, 0, 6, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawLaserSystem(ctx: CanvasRenderingContext2D, t: number) {
    // Primary Laser 1 from ceiling (450, 420):
    // Before 6.9s it blocks the whole entrance to the floor (450, 1500);
    // From 6.9s onward it reflects off Mirror (450, 860) cleanly upward to (780, 560)!
    this.drawEmitter(ctx, 450, 420, Math.PI * 0.5);
    if (t < 6.9) {
      this.drawLaserBeam(ctx, 450, 434, 450, FLOOR_Y);
    } else {
      this.drawLaserBeam(ctx, 450, 434, 450, 860);
      this.drawLaserBeam(ctx, 450, 860, 780, 560);
      this.drawEmitter(ctx, 780, 560, Math.PI * 0.78);
    }

    // Corridor Crossing Beams framing the narrow gap (y = 950..1075)
    this.drawEmitter(ctx, 460, 780, 0.42);
    this.drawEmitter(ctx, 810, 935, Math.PI + 0.42);
    this.drawLaserBeam(ctx, 474, 785, 796, 930);

    this.drawEmitter(ctx, 550, 1210, -0.45);
    this.drawEmitter(ctx, 810, 1085, Math.PI - 0.45);
    this.drawLaserBeam(ctx, 564, 1204, 796, 1091);

    // Upper Crossing X Beams (safely above y=730)
    this.drawEmitter(ctx, 560, 520, 0.72);
    this.drawEmitter(ctx, 560, 730, -0.72);
    this.drawLaserBeam(ctx, 572, 530, 798, 720);
    this.drawLaserBeam(ctx, 572, 720, 798, 530);
    this.drawEmitter(ctx, 810, 730, Math.PI + 0.72);
    this.drawEmitter(ctx, 810, 520, Math.PI - 0.72);
  }

  private drawGlassWalls(ctx: CanvasRenderingContext2D) {
    const panels = [
      { x: 580, y: 785, w: 22, h: 160 },
      { x: 705, y: 1085, w: 22, h: 250 },
    ];
    for (const p of panels) {
      ctx.fillStyle = GLASS_FILL;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, p.h, 5);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = GLASS_EDGE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x + 6, p.y + 18);
      ctx.lineTo(p.x + p.w - 6, p.y + 42);
      ctx.stroke();
    }
  }

  private drawTrapCage(ctx: CanvasRenderingContext2D, t: number, cx: number) {
    const u = easeOut(inv(26.35, 26.75, t));
    const topY = lerp(740, 910, u);
    const leftX = cx - 98;
    const rightX = cx + 98;

    // Ceiling & floor cage emitters
    for (const bx of [leftX, cx - 34, cx + 34, rightX]) {
      this.drawEmitter(ctx, bx, topY, Math.PI * 0.5);
      this.drawLaserBeam(ctx, bx, topY + 12, bx, FLOOR_Y);
    }
    // Horizontal cross laser bars around him
    for (const by of [1095, 1315]) {
      this.drawEmitter(ctx, leftX - 18, by, 0);
      this.drawEmitter(ctx, rightX + 18, by, Math.PI);
      this.drawLaserBeam(ctx, leftX - 6, by, rightX + 6, by);
    }
    void EMITTER_CAP;
  }

  // -------------------------------------------------------------------------
  // Orange Ball & FX
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

  private drawVisualFX(ctx: CanvasRenderingContext2D, t: number) {
    // Scene 1 Laser block zap at (450, 1130)
    if (t >= 2.75 && t < 3.25) {
      const u = inv(2.75, 3.25, t);
      ctx.save();
      ctx.translate(450, 1130);
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = LASER_RED;
      ctx.lineWidth = 6;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (14 + u * 22), Math.sin(a) * (14 + u * 22));
        ctx.lineTo(Math.cos(a) * (36 + u * 48), Math.sin(a) * (36 + u * 48));
        ctx.stroke();
      }
      ctx.restore();
    }

    // Mirror bounce glints
    for (const m of [
      { time: 16.6, x: 380, y: 1400 },
      { time: 18.1, x: 460, y: 1015 },
      { time: 21.0, x: 855, y: 1005 },
    ]) {
      if (t >= m.time && t < m.time + 0.35) {
        const u = inv(m.time, m.time + 0.35, t);
        ctx.save();
        ctx.globalAlpha = 1 - u;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 16 + u * 46, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Victory confetti at 24.3–26.1s
    if (t >= 24.3 && t < 26.1) {
      const u = inv(24.3, 26.1, t);
      const colors = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU + 0.25;
        const px = 955 + Math.cos(a) * (35 + u * 160);
        const py = 1230 + Math.sin(a) * (25 + u * 110) - u * 65 + u * u * 110;
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

    ctx.fillStyle = '#f87171';
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
