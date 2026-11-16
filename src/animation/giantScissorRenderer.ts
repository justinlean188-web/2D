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

// --- Scissor Studio Palette (Modern Pop 2D Flat Vector) --------------------
const WALL_BG = '#f8fafc';
const WALL_BAND = '#e2e8f0';
const FLOOR_TILE = '#cbd5e1';
const FLOOR_LINE = '#94a3b8';

const BLADE_SILVER = '#e2e8f0';
const BLADE_EDGE = '#94a3b8';
const HANDLE_RED = '#ef4444';
const HANDLE_DEEP = '#b91c1c';

const METAL_DARK = '#475569';
const RAMP_SILVER = '#94a3b8';
const RAMP_LIGHT = '#cbd5e1';

const BALL_ORANGE = '#f97316';
const CUP_RED = '#ef4444';
const CUP_DEEP = '#991b1b';

const STRING_CYAN = '#06b6d4';
const STRING_PURPLE = '#a855f7';
const STRING_GOLD = '#eab308';
const STRING_GREEN = '#22c55e';

const FLOOR_Y = 1520;
const HEAD_R = 70;
const BALL_R = 20;

// --- Helpers ---------------------------------------------------------------
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const inv = (a: number, b: number, v: number) => clamp((v - a) / (b - a), 0, 1);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

type Pt = { x: number; y: number };
type Look = 'center' | 'right' | 'left' | 'up' | 'down';
type Mouth = 'flat' | 'smile' | 'grin' | 'bigsmile' | 'smirk' | 'frown' | 'o' | 'grit';
type Brow = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'uneven' | 'determined';
type Eye = 'open' | 'wide' | 'squint' | 'shut' | 'happy';

interface Pose {
  lean: number;
  hipDrop: number;
  crouch: number;
  sit: number;
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
  sit: 0,
  headTilt: 0,
  headTurn: 2,
  headDrop: 0,
  beanieOn: true,
  look: 'right',
  mouth: 'smirk',
  brow: 'determined',
  eye: 'open',
  stance: 12,
  footLift: 0,
  handL: { x: -64, y: 1200 },
  handR: { x: 64, y: 1200 },
  bendL: -1,
  bendR: 1,
};

const POSE_PATCHES: { t: number; p: Partial<Pose> }[] = [
  // Scene 1: Picks up giant scissors on table -> snips String 0 -> wide-eyed amazement!
  { t: 0.0, p: { look: 'right', mouth: 'smirk', brow: 'determined', handL: { x: -60, y: 1210 }, handR: { x: 66, y: 1205 } } },
  {
    t: 1.25,
    p: {
      lean: 0.14,
      hipDrop: 10,
      look: 'right',
      mouth: 'smile',
      handL: { x: 46, y: 1065 },
      handR: { x: 112, y: 1035 },
      gripL: true,
      gripR: true,
    },
  },
  // Snips String 0 at 2.15s
  {
    t: 2.15,
    p: {
      lean: 0.18,
      hipDrop: 12,
      mouth: 'grin',
      handL: { x: 75, y: 985 },
      handR: { x: 115, y: 965 },
    },
  },
  // Ball drops into red cup (3.35s) -> eyes widen!
  {
    t: 3.35,
    p: {
      lean: -0.06,
      hipDrop: 0,
      look: 'right',
      eye: 'wide',
      brow: 'raised',
      mouth: 'o',
      gripL: false,
      gripR: false,
      handL: { x: -85, y: 1075 },
      handR: { x: 96, y: 1075 },
    },
  },
  {
    t: 4.35,
    p: {
      lean: 0.08,
      eye: 'open',
      brow: 'cocky',
      mouth: 'bigsmile',
      handL: { x: -72, y: 1165 },
      handR: { x: 120, y: 1055 },
      pointR: true,
    },
  },

  // Scene 2: Connects colorful strings & places giant scissors beside String 1
  {
    t: 6.0,
    p: {
      lean: 0.16,
      hipDrop: 14,
      pointR: false,
      brow: 'determined',
      mouth: 'smirk',
      handL: { x: 58, y: 1035 },
      handR: { x: 120, y: 1015 },
      gripR: true,
    },
  },
  {
    t: 10.25,
    p: {
      lean: 0.12,
      hipDrop: 8,
      brow: 'cocky',
      mouth: 'grin',
      handL: { x: 64, y: 1020 },
      handR: { x: 118, y: 985 },
      gripL: true,
      gripR: true,
    },
  },

  // Scene 3: SNIP! Cuts String 1 at 12.25s -> watches chain reaction & runs ahead!
  {
    t: 12.25,
    p: {
      lean: 0.2,
      hipDrop: 10,
      mouth: 'bigsmile',
      handL: { x: 82, y: 970 },
      handR: { x: 116, y: 960 },
    },
  },
  {
    t: 14.0,
    p: {
      lean: 0.14,
      hipDrop: 4,
      brow: 'cocky',
      mouth: 'bigsmile',
      handL: { x: 58, y: 1050 },
      handR: { x: 112, y: 1020 },
    },
  },

  // Scene 4: Cuts final String 3 at 18.35s -> watches giant pendulum & spring launch!
  {
    t: 18.35,
    p: {
      lean: 0.18,
      hipDrop: 8,
      look: 'up',
      brow: 'determined',
      mouth: 'grin',
      handL: { x: 66, y: 965 },
      handR: { x: 118, y: 940 },
    },
  },
  {
    t: 20.4,
    p: {
      lean: 0.1,
      hipDrop: 18,
      crouch: 0.28,
      look: 'right',
      eye: 'wide',
      brow: 'raised',
      mouth: 'o',
      gripL: false,
      gripR: false,
      handL: { x: -48, y: 1085 },
      handR: { x: 58, y: 1085 },
      fistL: true,
      fistR: true,
    },
  },

  // Scene 5: Ball scores! Celebrates -> loose string snaps -> scissors swing shut & snag red beanie!
  {
    t: 24.15,
    p: {
      lean: 0.0,
      hipDrop: 0,
      crouch: 0,
      look: 'right',
      eye: 'happy',
      brow: 'raised',
      mouth: 'bigsmile',
      fistL: false,
      fistR: false,
      handL: { x: -110, y: 935 },
      handR: { x: 110, y: 935 },
    },
  },
  // Loose string snaps at 25.85s -> shocked backward leap!
  {
    t: 25.85,
    p: {
      lean: -0.14,
      headTilt: -0.1,
      look: 'right',
      eye: 'wide',
      brow: 'raised',
      mouth: 'o',
      handL: { x: -102, y: 1045 },
      handR: { x: 102, y: 1045 },
    },
  },
  // Scissors SNIP shut at 26.55s and catch red beanie!
  {
    t: 26.55,
    p: {
      beanieOn: false,
      lean: -0.22,
      headTilt: -0.16,
      look: 'right',
      eye: 'wide',
      brow: 'raised',
      mouth: 'o',
      handL: { x: -64, y: 955 },
      handR: { x: 64, y: 955 },
    },
  },
  {
    t: 27.6,
    p: {
      beanieOn: false,
      lean: 0.04,
      headTilt: 0.06,
      look: 'right',
      eye: 'squint',
      brow: 'uneven',
      mouth: 'frown',
      handL: { x: -78, y: 1185 },
      handR: { x: 94, y: 1055 },
      pointR: true,
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
  { from: 0.25, to: 5.75, text: 'SCISSORS CAN MAKE TRICKSHOTS?!' },
  { from: 6.25, to: 11.75, text: 'ONE CUT STARTS EVERYTHING!' },
  { from: 12.25, to: 17.75, text: 'THE CHAIN REACTION!' },
  { from: 18.25, to: 23.75, text: 'THE PERFECT CUT!' },
  { from: 24.25, to: 29.85, text: 'SNIP! THERE GOES MY HAT! 😂' },
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

export class GiantScissorRenderer {
  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const time = clamp(t, 0, 30);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const camX = this.cameraXAt(time);
    const ch = this.charAt(time);
    const pose = this.poseAt(time, ch.walkPhase);

    ctx.save();
    ctx.translate(-camX, 0);

    // 1. Studio Wall & Floor
    this.drawBackdrop(ctx);

    // 2. Scene 1 Discovery Table & Mini Ramp/Cup vs Scenes 2–5 Full Scissor Chain Rig
    if (time < 6.0) {
      this.drawDiscoveryProps(ctx, time);
    } else {
      this.drawChainReactionRig(ctx, time);
    }

    // 3. Stickman Character
    this.drawCharacter(ctx, ch, pose, time);

    // 4. Giant Silver Scissors with Red Handles (held by Stickman in Scenes 1–4, mounted/swinging in Scene 5!)
    this.drawGiantScissors(ctx, ch, time);

    // 5. Scene 1 & Scene 4–5 Red Cup Front Rim Overlays + Confetti/Snip FX
    this.drawCupFrontsAndFX(ctx, time, ch);

    ctx.restore();

    if (config.showCaptions) {
      this.drawCaptions(ctx, time);
    }
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  // -------------------------------------------------------------------------
  // Camera & Character Timeline
  // -------------------------------------------------------------------------
  private cameraXAt(t: number): number {
    if (t < 6.0) return 0;
    if (t < 7.2) return lerp(0, 260, easeInOut(inv(6.0, 7.2, t)));
    if (t < 13.5) return 260;
    if (t < 16.5) return lerp(260, 620, easeInOut(inv(13.5, 16.5, t)));
    if (t < 18.2) return lerp(620, 720, easeInOut(inv(16.5, 18.2, t)));
    return 720;
  }

  private charAt(t: number): CharState {
    let x = 250;
    let lift = 0;
    let walkPhase = 0;

    if (t < 6.0) {
      x = 250;
    } else if (t < 10.2) {
      const u = easeInOut(inv(6.0, 10.2, t));
      x = lerp(250, 390, u);
      walkPhase = u * 4;
    } else if (t < 13.6) {
      x = 390;
    } else if (t < 17.8) {
      const u = easeInOut(inv(13.6, 17.8, t));
      x = lerp(390, 1045, u);
      walkPhase = u * 9;
    } else if (t < 24.15) {
      x = 1045;
    } else if (t < 25.8) {
      const u = inv(24.15, 25.8, t);
      x = lerp(1045, 1185, easeOut(clamp(u * 2, 0, 1)));
      lift = Math.abs(Math.sin(u * Math.PI * 3.5)) * 62;
    } else if (t < 26.35) {
      x = 1185;
    } else if (t < 27.15) {
      // Jumps backward in shock as giant scissors swing shut!
      const u = inv(26.35, 27.15, t);
      x = lerp(1185, 1060, easeOut(u));
      lift = Math.sin(u * Math.PI) * 115;
    } else {
      x = 1060;
    }

    return { x, ground: FLOOR_Y, lift, walkPhase };
  }

  private poseAt(t: number, walkPhase: number): Pose {
    let idx = 0;
    for (let i = 0; i < POSE_KEYS.length; i++) {
      if (t >= POSE_KEYS[i].t) idx = i;
    }
    const cur = POSE_KEYS[idx];
    const next = POSE_KEYS[Math.min(POSE_KEYS.length - 1, idx + 1)];
    const span = Math.max(0.01, next.t - cur.t);
    const u = idx === POSE_KEYS.length - 1 ? 0 : easeInOut(clamp((t - cur.t) / span, 0, 1));

    const walkLift = walkPhase > 0 ? Math.abs(Math.sin(walkPhase * Math.PI)) * 32 : 0;
    const walkStance = walkPhase > 0 ? 14 + Math.sin(walkPhase * Math.PI) * 24 : lerp(cur.stance, next.stance, u);

    return {
      ...cur,
      lean: lerp(cur.lean, next.lean, u),
      hipDrop: lerp(cur.hipDrop, next.hipDrop, u),
      crouch: lerp(cur.crouch, next.crouch, u),
      sit: lerp(cur.sit, next.sit, u),
      headTilt: lerp(cur.headTilt, next.headTilt, u),
      headTurn: lerp(cur.headTurn, next.headTurn, u),
      headDrop: lerp(cur.headDrop, next.headDrop, u),
      stance: walkStance,
      footLift: Math.max(lerp(cur.footLift, next.footLift, u), walkLift),
      handL: { x: lerp(cur.handL.x, next.handL.x, u), y: lerp(cur.handL.y, next.handL.y, u) },
      handR: { x: lerp(cur.handR.x, next.handR.x, u), y: lerp(cur.handR.y, next.handR.y, u) },
    };
  }

  // -------------------------------------------------------------------------
  // Background
  // -------------------------------------------------------------------------
  private drawBackdrop(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = WALL_BG;
    ctx.fillRect(-100, 0, 2200, FLOOR_Y);

    ctx.fillStyle = WALL_BAND;
    ctx.fillRect(-100, 260, 2200, 130);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    for (let x = 0; x <= 2000; x += 280) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, FLOOR_Y);
      ctx.stroke();
    }

    ctx.fillStyle = FLOOR_TILE;
    ctx.fillRect(-100, FLOOR_Y, 2200, HEIGHT - FLOOR_Y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-100, FLOOR_Y);
    ctx.lineTo(2100, FLOOR_Y);
    ctx.stroke();

    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 4;
    for (let x = -40; x <= 2000; x += 180) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR_Y);
      ctx.lineTo(x - 60, HEIGHT);
      ctx.stroke();
    }
  }

  // -------------------------------------------------------------------------
  // Scene 1: Table, Discovery String, Small Ramp, Orange Ball & Red Cup
  // -------------------------------------------------------------------------
  private drawDiscoveryProps(ctx: CanvasRenderingContext2D, t: number) {
    // Table (x=280..760, topY=1140)
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    for (const lx of [315, 705]) {
      ctx.beginPath();
      ctx.rect(lx, 1170, 24, FLOOR_Y - 1170);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = RAMP_LIGHT;
    ctx.beginPath();
    ctx.roundRect(280, 1140, 480, 32, 8);
    ctx.fill();
    ctx.stroke();

    // Small metal ramp on table (455, 980 -> 630, 1085)
    ctx.strokeStyle = INK;
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(455, 985);
    ctx.lineTo(635, 1090);
    ctx.stroke();
    ctx.strokeStyle = RAMP_SILVER;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(455, 985);
    ctx.lineTo(635, 1090);
    ctx.stroke();

    // Ceiling pulley & Blue String #0 holding Orange Ball before snip at 2.15s
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(495, 500, 18, 0, TAU);
    ctx.fill();
    ctx.stroke();

    const cut = t >= 2.15;
    let ballX = 495;
    let ballY = 900;
    let ballRot = 0;

    if (t >= 2.15 && t < 2.55) {
      const u = inv(2.15, 2.55, t);
      ballY = lerp(900, 978, u * u);
    } else if (t >= 2.55 && t < 3.15) {
      const u = inv(2.55, 3.15, t);
      ballX = lerp(495, 640, u);
      ballY = lerp(978, 1072, u);
      ballRot = u * 5;
    } else if (t >= 3.15 && t < 3.45) {
      const u = inv(3.15, 3.45, t);
      ballX = lerp(640, 695, u);
      ballY = lerp(1072, 1110, u * u);
      ballRot = 5 + u * 2;
    } else if (t >= 3.45) {
      ballX = 695;
      ballY = 1110;
      ballRot = 7;
    }

    // String 0: taut before 2.15s, cut recoil after 2.15s
    ctx.strokeStyle = STRING_CYAN;
    ctx.lineWidth = 5;
    ctx.beginPath();
    if (!cut) {
      ctx.moveTo(495, 500);
      ctx.lineTo(ballX, ballY - BALL_R);
    } else {
      const recoil = easeOut(inv(2.15, 2.55, t));
      ctx.moveTo(495, 500);
      ctx.lineTo(495 + recoil * 12, lerp(760, 610, recoil));
      ctx.moveTo(ballX, ballY - BALL_R);
      ctx.lineTo(ballX - 10, ballY - BALL_R - 45 * (1 - recoil));
    }
    ctx.stroke();

    // Red target cup back (at 695, 1140)
    this.drawRedCupBack(ctx, 695, 1140);
    // Orange ball
    this.drawOrangeBall(ctx, ballX, ballY, ballRot);
  }

  // -------------------------------------------------------------------------
  // Scenes 2–5: Connected Strings, Pulley, Seesaw, Dominoes, Pendulum, Spring & Cup
  // -------------------------------------------------------------------------
  private drawChainReactionRig(ctx: CanvasRenderingContext2D, t: number) {
    // 1. Overhead Pulleys
    const pulleys = [
      { x: 515, y: 420 },
      { x: 965, y: 400 },
      { x: 1185, y: 380 },
      { x: 1445, y: 420 },
    ];
    for (const p of pulleys) {
      ctx.fillStyle = METAL_DARK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p.x, 0);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 20, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = RAMP_LIGHT;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, TAU);
      ctx.fill();
    }

    // 2. Seesaw at pivot (600, 1455)
    const seesawTilt =
      t < 13.15
        ? 0.22
        : t < 13.45
        ? lerp(0.22, -0.26, easeOut(inv(13.15, 13.45, t)))
        : -0.26;
    ctx.save();
    ctx.translate(600, 1455);
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-28, 65);
    ctx.lineTo(0, 0);
    ctx.lineTo(28, 65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.rotate(seesawTilt);
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(-115, -14, 230, 22, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 3. Suspended Weight Ball A (Cyan String #1, snipped at 12.25s -> drops onto Seesaw left!)
    const ballAY = t < 12.25 ? 775 : lerp(775, 1410, easeInOut(inv(12.25, 13.15, t)));
    ctx.strokeStyle = STRING_CYAN;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    if (t < 12.25) {
      ctx.moveTo(515, 420);
      ctx.lineTo(515, ballAY - 26);
    } else {
      const r = easeOut(inv(12.25, 12.6, t));
      ctx.moveTo(515, 420);
      ctx.lineTo(515 - r * 18, lerp(660, 520, r));
      ctx.moveTo(515, ballAY - 26);
      ctx.lineTo(515 + 12, ballAY - 70);
    }
    ctx.stroke();

    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(515, ballAY, 26, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // 4. Green Seesaw Trigger Ball -> launches into Domino 1 at 14.10s!
    let greenX = 685;
    let greenY = 1412;
    if (t >= 13.15 && t < 14.1) {
      const u = inv(13.15, 14.1, t);
      greenX = lerp(685, 765, u);
      greenY = lerp(1412, 1415, u) - Math.sin(u * Math.PI) * 165;
    } else if (t >= 14.1) {
      const u = clamp((t - 14.1) / 0.45, 0, 1);
      greenX = lerp(765, 735, u);
      greenY = lerp(1415, FLOOR_Y - 18, u * u);
    }
    ctx.fillStyle = STRING_GREEN;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(greenX, greenY, 18, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // 5. Five Colorful Dominoes (x = 775..935)
    const domColors = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#a855f7'];
    for (let i = 0; i < 5; i++) {
      const hitT = 14.1 + i * 0.25;
      const fallU = clamp((t - hitT) / 0.28, 0, 1);
      const angle = easeOut(fallU) * 1.18;
      ctx.save();
      ctx.translate(775 + i * 40, FLOOR_Y);
      ctx.rotate(angle);
      ctx.fillStyle = domColors[i];
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.roundRect(-10, -96, 20, 96, 5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 6. Purple String #2 (Domino 5 -> Pulley 2 -> Suspended Ball B on Ramp)
    const lastDomTopX = 775 + 4 * 40 + Math.sin(clamp((t - 15.1) / 0.28, 0, 1) * 1.18) * 90;
    const lastDomTopY = FLOOR_Y - Math.cos(clamp((t - 15.1) / 0.28, 0, 1) * 1.18) * 90;
    ctx.strokeStyle = STRING_PURPLE;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(lastDomTopX, lastDomTopY);
    ctx.lineTo(965, 400);
    ctx.lineTo(1035, t < 15.25 ? 920 : 960);
    ctx.stroke();

    // Elevated metal ramp (1010, 980 -> 1225, 1140) + Ball B
    ctx.strokeStyle = INK;
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(1010, 980);
    ctx.lineTo(1225, 1140);
    ctx.stroke();
    ctx.strokeStyle = RAMP_SILVER;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(1010, 980);
    ctx.lineTo(1225, 1140);
    ctx.stroke();

    let b2X = 1035;
    let b2Y = 945;
    if (t >= 15.25 && t < 16.55) {
      const u = easeInOut(inv(15.25, 16.55, t));
      b2X = lerp(1035, 1215, u);
      b2Y = lerp(945, 1110, u);
    } else if (t >= 16.55) {
      const u = clamp((t - 16.55) / 0.65, 0, 1);
      b2X = lerp(1215, 1255, u);
      b2Y = lerp(1110, FLOOR_Y - 22, u * u);
    }
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(b2X, b2Y, 22, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // 7. Giant Suspended Pendulum Ball (Gold String #3 cut at 18.35s -> swings down into Spring Launcher at 20.35s!)
    const pendAngle =
      t < 18.35
        ? -0.82
        : lerp(-0.82, 0.25, easeInOut(inv(18.35, 20.35, t)));
    const pivotX = 1350;
    const pivotY = 580;
    const pendLen = 790;
    const pendX = pivotX + Math.sin(pendAngle) * pendLen;
    const pendY = pivotY + Math.cos(pendAngle) * pendLen;

    // Gold tether string holding pendulum back before 18.35s
    ctx.strokeStyle = STRING_GOLD;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    if (t < 18.35) {
      ctx.moveTo(1185, 380);
      ctx.lineTo(pendX, pendY - 38);
    } else {
      const r = easeOut(inv(18.35, 18.75, t));
      ctx.moveTo(1185, 380);
      ctx.lineTo(1185 - r * 16, lerp(620, 480, r));
    }
    ctx.stroke();

    // Pendulum support arm & giant indigo ball
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pendX, pendY);
    ctx.stroke();

    ctx.fillStyle = '#6366f1';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.arc(pendX, pendY, 38, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // 8. Spring Launcher at (1395, 1465) & Orange Ball -> Tiny Red Target Cup at (1605, 1280)
    const springSquash = t >= 20.25 && t < 20.65 ? Math.sin(inv(20.25, 20.65, t) * Math.PI) * 28 : 0;
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(1360, 1485, 76, 35, 6);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(1375, 1485);
    ctx.lineTo(1418, 1465 + springSquash * 0.4);
    ctx.lineTo(1375, 1445 + springSquash * 0.7);
    ctx.lineTo(1418, 1425 + springSquash);
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(1355, 1405 + springSquash, 86, 22, 8);
    ctx.fill();
    ctx.stroke();

    // Red Target Cup Pedestal & Back at (1605, 1280)
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(1578, 1280, 54, FLOOR_Y - 1280, 8);
    ctx.fill();
    ctx.stroke();
    this.drawRedCupBack(ctx, 1605, 1280);

    // Last Loose String (from cup pedestal to wall pulley (1445, 420) down to Scissor Spring Rig at (1305, 1080))
    ctx.strokeStyle = STRING_CYAN;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    if (t < 25.85) {
      ctx.moveTo(1585, 1295);
      ctx.lineTo(1445, 420);
      ctx.lineTo(1310, 1055);
    } else {
      const snapU = easeOut(inv(25.85, 26.35, t));
      ctx.moveTo(1585, 1295);
      ctx.lineTo(1445, 420);
      ctx.lineTo(1445 + snapU * 35, lerp(880, 560, snapU));
    }
    ctx.stroke();

    // Orange Ball trajectory from Spring Launcher (1398, 1385) -> Red Target Cup (1605, 1235)!
    let obX = 1398;
    let obY = 1385 + springSquash;
    let obRot = 0;
    if (t >= 20.4 && t < 24.15) {
      const u = easeInOut(inv(20.4, 24.15, t));
      obX = lerp(1398, 1605, u);
      obY = lerp(1385, 1235, u) - Math.sin(u * Math.PI) * 520;
      obRot = u * 16;
    } else if (t >= 24.15) {
      obX = 1605;
      obY = 1238;
      obRot = 16;
    }
    this.drawOrangeBall(ctx, obX, obY, obRot);
  }

  private drawRedCupBack(ctx: CanvasRenderingContext2D, cx: number, bottomY: number) {
    ctx.fillStyle = CUP_DEEP;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(cx, bottomY - 68, 28, 9, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private drawRedCupFront(ctx: CanvasRenderingContext2D, cx: number, bottomY: number) {
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
    ctx.moveTo(cx - 21, bottomY - 61);
    ctx.lineTo(cx + 21, bottomY - 61);
    ctx.stroke();
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

    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.ellipse(-6, -6, 5.5, 3.2, -0.6, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // Giant Silver Scissors with Large Red Handles
  // -------------------------------------------------------------------------
  private drawGiantScissors(ctx: CanvasRenderingContext2D, ch: CharState, t: number) {
    let sx = 430;
    let sy = 1110;
    let baseRot = -0.2;
    let openAngle = 0.42;

    if (t < 1.25) {
      // Resting open on Scene 1 table
      sx = 430;
      sy = 1110;
      baseRot = 0;
      openAngle = 0.42;
    } else if (t < 6.0) {
      // Held by Stickman in Scene 1, snips shut at 2.15s
      sx = ch.x + 150;
      sy = 1020;
      baseRot = -0.15;
      openAngle = t >= 2.08 && t < 2.45 ? 0.05 : 0.44;
    } else if (t < 18.2) {
      // Positioned by Stickman beside String 1 (snips at 12.25s) and carried forward
      sx = ch.x + 145;
      sy = 985;
      baseRot = -0.1;
      openAngle = t >= 12.18 && t < 12.55 ? 0.05 : 0.44;
    } else if (t < 24.15) {
      // Cuts String 3 at 18.35s
      sx = ch.x + 145;
      sy = 920;
      baseRot = -0.25;
      openAngle = t >= 18.28 && t < 18.65 ? 0.05 : 0.44;
    } else {
      // Scene 5: Mounted on upright scissor stand at (1305, 1080); swings shut at 26.55s & snags red beanie!
      sx = 1305;
      sy = 1080;
      baseRot = t < 26.15 ? -0.35 : lerp(-0.35, -0.95, easeOut(inv(26.15, 26.55, t)));
      openAngle = t < 26.4 ? 0.56 : lerp(0.56, 0.08, easeOut(inv(26.4, 26.55, t)));
      // Stand post
      ctx.fillStyle = METAL_DARK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.rect(sx - 10, sy, 20, FLOOR_Y - sy);
      ctx.fill();
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(baseRot);

    const drawBladeAndHandle = (dir: 1 | -1) => {
      ctx.save();
      ctx.rotate(dir * openAngle);

      // Sharp Silver Blade extending right (+X)
      ctx.fillStyle = BLADE_SILVER;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-12, -dir * 12);
      ctx.lineTo(135, -dir * 3);
      ctx.lineTo(118, dir * 18);
      ctx.lineTo(-12, dir * 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = BLADE_EDGE;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(8, dir * 4);
      ctx.lineTo(112, dir * 6);
      ctx.stroke();

      // Tang & Large Red Loop Handle extending left (-X)
      ctx.strokeStyle = INK;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-65, dir * 18);
      ctx.stroke();

      ctx.strokeStyle = HANDLE_RED;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-65, dir * 18);
      ctx.stroke();

      ctx.strokeStyle = INK;
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.ellipse(-92, dir * 24, 30, 20, dir * 0.2, 0, TAU);
      ctx.stroke();

      ctx.strokeStyle = HANDLE_RED;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.ellipse(-92, dir * 24, 30, 20, dir * 0.2, 0, TAU);
      ctx.stroke();

      ctx.restore();
    };

    drawBladeAndHandle(-1);
    drawBladeAndHandle(1);

    // Center Silver Pivot Screw
    ctx.fillStyle = BLADE_EDGE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Red Beanie caught/impaled cleanly on the upper scissor blade (26.55–30.0s)!
    if (t >= 26.55) {
      ctx.save();
      ctx.translate(92, -32);
      ctx.rotate(0.45);
      ctx.scale(0.85, 0.85);
      this.drawBeanieShape(ctx);
      ctx.restore();
    }

    ctx.restore();
  }

  private drawCupFrontsAndFX(ctx: CanvasRenderingContext2D, t: number, _ch: CharState) {
    if (t < 6.0) {
      this.drawRedCupFront(ctx, 695, 1140);
    } else {
      this.drawRedCupFront(ctx, 1605, 1280);
    }

    // Victory Confetti (24.15–25.75s)
    if (t >= 24.15 && t < 25.75) {
      const u = inv(24.15, 25.75, t);
      const colors = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU + 0.2;
        const px = 1605 + Math.cos(a) * (25 + u * 145);
        const py = 1205 + Math.sin(a) * (20 + u * 100) - u * 45 + u * u * 100;
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.rect(px - 6, py - 5, 12, 10);
        ctx.fill();
        ctx.stroke();
      }
    }

    // SNIP sparkle flash at 26.55s beside the giant scissor blades!
    if (t >= 26.45 && t < 27.1) {
      const u = inv(26.45, 27.1, t);
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        ctx.beginPath();
        ctx.moveTo(1320 + Math.cos(a) * 28, 990 + Math.sin(a) * 28);
        ctx.lineTo(1320 + Math.cos(a) * (65 + u * 30), 990 + Math.sin(a) * (65 + u * 30));
        ctx.stroke();
      }
      ctx.restore();
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
