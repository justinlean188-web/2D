import type { StudioConfig } from '../types';
import { drawHand, HandStyle } from './handRenderer';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

const INK = '#141024';
const WHITE = '#ffffff';
const BG = '#1b1140';
const BG_DEEP = '#241856';
const FLOOR = '#2b1d63';
const FLOOR_LINE = '#3c2a7a';

const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const SHIRT = '#ffd166';
const TROUSER = '#2f5fa8';
const TROUSER_DEEP = '#22457c';
const SHOE = '#141414';

const MACHINE_BODY = '#3a2470';
const MACHINE_DEEP = '#2a1a52';
const MACHINE_LIGHT = '#4b3189';
const PANEL = '#2f1d5c';
const METAL = '#cfd6e4';
const METAL_DARK = '#8c93a8';
const CHUTE_DARK = '#150c2e';
const SCREEN = '#7ef0ff';

const RAINBOW = [
  '#ff4d6d',
  '#ff9f1c',
  '#ffd23f',
  '#4ecdc4',
  '#4d96ff',
  '#b06bff',
];

const CANDY_COLORS = [
  '#ff5fa2',
  '#ffd23f',
  '#4ecdc4',
  '#5aa9ff',
  '#b06bff',
  '#ff8a3d',
  '#7bd88f',
  '#ff4d6d',
];

const FLOOR_Y = 1580;
const HIP_Y = 1280;
const HEAD_R = 70;
const HEAD_Y = 1032;

const MACH_L = 260;
const MACH_R = 1020;
const MACH_T = 180;
const MACH_B = 1560;
const GLASS_L = 300;
const GLASS_R = 980;
const GLASS_T = 300;
const GLASS_B = 1090;
const RAIL_Y = 372;

const PANEL_T = 1090;
const JOY_X = 465;
const JOY_Y = 1245;
const BUTTON_X = 575;
const BUTTON_Y = 1215;
const COIN_X = 430;
const COIN_Y = 1150;
const CHUTE_L = 700;
const CHUTE_R = 930;
const CHUTE_T = 1150;
const CHUTE_B = 1330;
const CHUTE_MOUTH_X = 815;
const CHUTE_MOUTH_Y = 1205;

const LOLLI_HOME = { x: 640, y: 815 };
const LOLLI_R = 95;

const PINK_HOME = { x: 500, y: 1000 };
const PINK_R = 52;

type MouthShape = 'flat' | 'smile' | 'grin' | 'o' | 'frown' | 'grit' | 'smirk';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'determined';
type EyeShape = 'open' | 'wide' | 'squint' | 'shut' | 'happy' | 'peek';
type LookDir = 'front' | 'down' | 'up' | 'right' | 'left';
type CandyKind = 'ball' | 'gummy' | 'wrapped' | 'lolli';

interface Pt {
  x: number;
  y: number;
}

interface Pose {
  lean: number;
  headTilt: number;
  headDrop: number;
  headTurn: number;
  look: LookDir;
  mouth: MouthShape;
  brow: BrowShape;
  eye: EyeShape;
  legs: 'stand' | 'walk';
  walkPhase: number;
  handL: Pt;
  handR: Pt;
  bendL: 1 | -1;
  bendR: 1 | -1;
  fistL: boolean;
  fistR: boolean;
  pointR: boolean;
  gripL: boolean;
  gripR: boolean;
  beanieOn: boolean;
}

interface CaptionLine {
  text: string;
  from: number;
  to: number;
}

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

interface CandyDef {
  x: number;
  y: number;
  r: number;
  color: string;
  kind: CandyKind;
  rot: number;
}

interface PourCandy {
  spawn: number;
  dur: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  r: number;
  color: string;
  kind: CandyKind;
  rot: number;
  spin: number;
}

const CAPTIONS: CaptionLine[] = [
  { text: 'CAN HE WIN THE GIANT LOLLIPOP?', from: 0.35, to: 5.8 },
  { text: 'SO CLOSE... BUT NO CANDY!', from: 6.2, to: 11.85 },
  { text: 'HE GOT THE BIG ONE!', from: 12.2, to: 17.85 },
  { text: 'WHY IS EVERYTHING FALLING?!', from: 18.2, to: 23.85 },
  { text: 'HE WON... TOO MUCH CANDY!', from: 24.2, to: 29.7 },
];

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 540, y: 940, zoom: 0.9 },
  { t: 1.9, x: 540, y: 940, zoom: 0.92 },
  { t: 2.6, x: 600, y: 820, zoom: 1.14 },
  { t: 3.9, x: 600, y: 820, zoom: 1.18 },
  { t: 4.8, x: 540, y: 950, zoom: 0.97 },
  { t: 6.0, x: 540, y: 950, zoom: 0.98 },
  { t: 7.4, x: 560, y: 900, zoom: 1.08 },
  { t: 9.6, x: 570, y: 780, zoom: 1.14 },
  { t: 10.15, x: 560, y: 820, zoom: 1.2 },
  { t: 10.5, x: 360, y: 1010, zoom: 1.62 },
  { t: 11.9, x: 360, y: 1010, zoom: 1.7 },
  { t: 12.4, x: 520, y: 940, zoom: 1.12 },
  { t: 13.9, x: 610, y: 830, zoom: 1.1 },
  { t: 15.4, x: 640, y: 780, zoom: 1.16 },
  { t: 16.4, x: 620, y: 800, zoom: 1.0 },
  { t: 17.4, x: 500, y: 1000, zoom: 1.06 },
  { t: 18.2, x: 560, y: 880, zoom: 1.0 },
  { t: 19.4, x: 590, y: 940, zoom: 1.03 },
  { t: 20.4, x: 600, y: 1080, zoom: 1.02 },
  { t: 22.4, x: 520, y: 1160, zoom: 1.02 },
  { t: 24.2, x: 460, y: 1190, zoom: 1.06 },
  { t: 25.6, x: 390, y: 1190, zoom: 1.18 },
  { t: 26.8, x: 340, y: 1110, zoom: 1.32 },
  { t: 27.5, x: 305, y: 1050, zoom: 1.72 },
  { t: 28.4, x: 305, y: 1040, zoom: 1.86 },
  { t: 29.4, x: 305, y: 1030, zoom: 1.95 },
  { t: 30.0, x: 305, y: 1030, zoom: 2.02 },
];

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function smooth(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}
function lerpPt(a: Pt, b: Pt, u: number): Pt {
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
}
/** Deterministic pseudo-random value so candy never flickers. */
function rand(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
/** Smoothly interpolates a numeric key list. */
function keyAt(keys: [number, number][], t: number): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t >= t0 && t <= t1) {
      if (t1 <= t0) return v1;
      return lerp(v0, v1, smooth((t - t0) / (t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
}

const INTERIOR_CANDY: CandyDef[] = [];
for (let i = 0; i < 150; i++) {
  const x = GLASS_L + 26 + rand(i + 1) * (GLASS_R - GLASS_L - 52);
  const mound = 470 * Math.max(0, 1 - Math.pow((x - 640) / 360, 2)) + 60;
  const y = GLASS_B - 14 - rand(i + 40) * mound;
  INTERIOR_CANDY.push({
    x,
    y: clamp(y, GLASS_T + 60, GLASS_B - 16),
    r: 16 + rand(i + 80) * 15,
    color: CANDY_COLORS[i % CANDY_COLORS.length],
    kind: (['ball', 'gummy', 'wrapped', 'lolli'] as CandyKind[])[i % 4],
    rot: rand(i + 120) * TAU,
  });
}

const POUR_CANDY: PourCandy[] = [];
for (let i = 0; i < 200; i++) {
  const f = i / 200;
  const spawn = 19.65 + f * 6.25 + rand(i + 10) * 0.22;
  const x1 = 940 - 910 * Math.pow(f, 0.72) + (rand(i + 20) - 0.5) * 80;
  const mound = 470 * Math.max(0, 1 - Math.pow((x1 - 470) / 610, 2)) + 18;
  const height = 0.22 + 0.78 * Math.pow(f, 0.9);
  const y1 = FLOOR_Y - mound * height - rand(i + 30) * 24;
  POUR_CANDY.push({
    spawn,
    dur: 0.5 + rand(i + 50) * 0.4,
    x0: CHUTE_MOUTH_X - 70 + rand(i + 60) * 150,
    y0: CHUTE_MOUTH_Y + rand(i + 70) * 40,
    x1,
    y1,
    r: 14 + rand(i + 90) * 13,
    color: CANDY_COLORS[i % CANDY_COLORS.length],
    kind: (['ball', 'gummy', 'wrapped', 'lolli'] as CandyKind[])[i % 4],
    rot: rand(i + 100) * TAU,
    spin: (rand(i + 110) > 0.5 ? 1 : -1) * (3 + rand(i + 130) * 8),
  });
}

export class CandyClawRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  private readonly floorY = FLOOR_Y;
  private readonly hipY = HIP_Y;
  private readonly headR = HEAD_R;

  private readonly captions = CAPTIONS;

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    void config;
    const t = clamp(time, 0, 30);
    // The last half second is a held comedic freeze-frame.
    const at = Math.min(t, 29.4);

    ctx.save();
    ctx.fillStyle = BG;
    ctx.fillRect(-200, -200, WIDTH + 400, HEIGHT + 400);

    this.applyCamera(ctx, t);

    this.drawArcade(ctx, at);
    this.drawMachine(ctx, at);

    const x = this.charX(at);
    const hop = this.charHop(at);
    const hipY = this.hipY - hop;
    const pose = this.poseAt(at);
    if (hop > 0) {
      pose.handL = { x: pose.handL.x, y: pose.handL.y - hop };
      pose.handR = { x: pose.handR.x, y: pose.handR.y - hop };
    }
    const arms = this.computeArms(pose, x, hipY);

    this.drawShadows(ctx, x, hop);
    this.drawStickman(ctx, x, hipY, pose, arms, at, 'body');
    this.drawStickman(ctx, x, hipY, pose, arms, at, 'front');

    // Candy pours out of the machine and buries him, so it draws in front.
    this.drawPouredCandy(ctx, at, x, hipY, pose);

    this.drawLollipopOutside(ctx, at, x, hipY, pose);

    this.restoreCamera(ctx);

    this.drawCaptions(ctx, t);
    this.drawFreezeFrame(ctx, t);
    ctx.restore();
  }

  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    let prev = CAMERA_KEYS[0];
    let next = CAMERA_KEYS[CAMERA_KEYS.length - 1];
    for (let i = 0; i < CAMERA_KEYS.length - 1; i++) {
      const a = CAMERA_KEYS[i];
      const b = CAMERA_KEYS[i + 1];
      if (t >= a.t && t <= b.t) {
        prev = a;
        next = b;
        break;
      }
    }
    let cx = prev.x;
    let cy = prev.y;
    let zoom = prev.zoom;
    if (next.t > prev.t) {
      const u = smooth((t - prev.t) / (next.t - prev.t));
      cx = lerp(prev.x, next.x, u);
      cy = lerp(prev.y, next.y, u);
      zoom = lerp(prev.zoom, next.zoom, u);
    }

    let shake = 0;
    if (t >= 18.85 && t < 19.7) {
      shake = Math.sin(t * 74) * 9 * (1 - (t - 18.85) / 0.85);
    }
    if (t >= 23.9 && t < 26.3) {
      shake = Math.max(shake, Math.sin(t * 52) * 6);
    }

    ctx.translate(WIDTH / 2 + shake, HEIGHT / 2 + shake * 0.55);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);
  }

  private restoreCamera(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }

  private drawArcade(ctx: CanvasRenderingContext2D, t: number) {
    // Flat neon wall bands.
    ctx.fillStyle = BG_DEEP;
    ctx.fillRect(-200, -200, WIDTH + 400, 760);
    ctx.fillStyle = '#20144a';
    ctx.fillRect(-200, 560, WIDTH + 400, 520);

    // Glowing carnival arches behind the machine.
    const arches = [
      { r: 470, color: 'rgba(255, 79, 163, 0.16)' },
      { r: 392, color: 'rgba(77, 150, 255, 0.16)' },
      { r: 314, color: 'rgba(78, 205, 196, 0.14)' },
    ];
    for (const arch of arches) {
      ctx.strokeStyle = arch.color;
      ctx.lineWidth = 22;
      ctx.beginPath();
      ctx.arc(640, 700, arch.r, Math.PI, TAU);
      ctx.stroke();
    }

    // Twinkling wall bulbs.
    for (let i = 0; i < 26; i++) {
      const x = 30 + (i % 13) * 82;
      const y = 80 + Math.floor(i / 13) * 980;
      const lit = 0.45 + 0.55 * Math.sin(t * 4 + i * 1.3);
      ctx.globalAlpha = 0.3 + lit * 0.55;
      ctx.fillStyle = RAINBOW[i % RAINBOW.length];
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Hanging pennants.
    ctx.strokeStyle = '#120a2c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-40, 150);
    ctx.quadraticCurveTo(280, 250, 560, 168);
    ctx.quadraticCurveTo(840, 92, 1120, 190);
    ctx.stroke();
    for (let i = 0; i < 14; i++) {
      const x = -10 + i * 82;
      const y = 168 + Math.sin((x / 1080) * Math.PI) * 44;
      ctx.fillStyle = RAINBOW[i % RAINBOW.length];
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 42, y);
      ctx.lineTo(x + 21, y + 54);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Candy-cane pillars at the sides.
    for (const px of [60, 1000]) {
      ctx.fillStyle = '#f6f0ff';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(px, 520, 44, FLOOR_Y - 520, 22);
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(px + 5, 526, 34, FLOOR_Y - 532, 17);
      ctx.clip();
      ctx.fillStyle = '#ff4d6d';
      for (let y = 540; y < FLOOR_Y; y += 56) {
        ctx.save();
        ctx.translate(px + 22, y);
        ctx.rotate(-0.6);
        ctx.fillRect(-50, -16, 120, 28);
        ctx.restore();
      }
      ctx.restore();
    }

    // Floor.
    ctx.fillStyle = FLOOR;
    ctx.fillRect(-200, FLOOR_Y, WIDTH + 400, HEIGHT - FLOOR_Y + 300);
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-200, FLOOR_Y);
    ctx.lineTo(WIDTH + 200, FLOOR_Y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.045)';
    for (let i = 0; i < 60; i++) {
      const x = -40 + rand(i) * 1160;
      const y = FLOOR_Y + 40 + rand(i + 80) * 300;
      ctx.beginPath();
      ctx.arc(x, y, 4 + rand(i + 40) * 8, 0, TAU);
      ctx.fill();
    }
  }

  private drawMachine(ctx: CanvasRenderingContext2D, t: number) {
    const shake =
      t >= 18.85 && t < 19.7
        ? Math.sin(t * 78) * 7 * (1 - (t - 18.85) / 0.85)
        : t >= 23.9 && t < 26.3
        ? Math.sin(t * 60) * 4
        : 0;

    ctx.save();
    ctx.translate(shake, 0);

    // Body.
    ctx.fillStyle = MACHINE_BODY;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.roundRect(MACH_L, MACH_T, MACH_R - MACH_L, MACH_B - MACH_T, 26);
    ctx.fill();
    ctx.stroke();

    // Marquee.
    ctx.fillStyle = MACHINE_DEEP;
    ctx.beginPath();
    ctx.roundRect(300, 205, 680, 82, 18);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = WHITE;
    ctx.font = '900 52px "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CANDY CLAW', 640, 250);
    // Little lollipop on the marquee.
    this.drawLollipopCandy(ctx, 350, 246, 24, t);
    this.drawLollipopCandy(ctx, 930, 246, 24, t * 1.3);
    this.drawBulbs(ctx, 316, 288, 964, 288, 12, t, 0);

    // Rainbow border around the glass.
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = RAINBOW[i];
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.roundRect(
        GLASS_L - 18 - i * 5,
        GLASS_T - 18 - i * 5,
        GLASS_R - GLASS_L + 36 + i * 10,
        GLASS_B - GLASS_T + 36 + i * 10,
        14 + i * 3
      );
      ctx.stroke();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(GLASS_L - 48, GLASS_T - 48, GLASS_R - GLASS_L + 96, GLASS_B - GLASS_T + 96, 22);
    ctx.stroke();

    // Glass interior.
    ctx.fillStyle = '#1f1445';
    ctx.beginPath();
    ctx.roundRect(GLASS_L, GLASS_T, GLASS_R - GLASS_L, GLASS_B - GLASS_T, 10);
    ctx.fill();

    // Back glow so the candy pile reads.
    ctx.fillStyle = 'rgba(126, 240, 255, 0.08)';
    ctx.fillRect(GLASS_L + 20, GLASS_T + 20, GLASS_R - GLASS_L - 40, 420);

    // Interior candy pile.
    for (const candy of INTERIOR_CANDY) {
      this.drawCandy(ctx, candy.x, candy.y, candy.r, candy.color, candy.kind, candy.rot);
    }
    this.drawPinkCandy(ctx, t);

    // The giant rainbow lollipop at home (or held by the claw).
    if (t < 15.6) {
      this.drawGiantLollipop(ctx, LOLLI_HOME.x, LOLLI_HOME.y, LOLLI_R, 0);
    } else if (t <= 26.85) {
      const cx = this.clawX(t);
      const cy = this.clawY(t);
      this.drawGiantLollipop(ctx, cx, cy - 155, LOLLI_R, 0.03 * Math.sin(t * 2));
    }

    // Overhead rail and trolley.
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(GLASS_L + 20, RAIL_Y - 10, GLASS_R - GLASS_L - 40, 20, 8);
    ctx.fill();
    ctx.stroke();
    this.drawBulbs(ctx, GLASS_L + 30, RAIL_Y - 12, GLASS_R - 30, RAIL_Y - 12, 16, t, 2);

    this.drawClaw(ctx, t);

    // Glass front reflection.
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(GLASS_L, GLASS_T, GLASS_R - GLASS_L, GLASS_B - GLASS_T, 10);
    ctx.clip();
    ctx.fillStyle = 'rgba(160, 220, 255, 0.10)';
    ctx.fillRect(GLASS_L, GLASS_T, GLASS_R - GLASS_L, GLASS_B - GLASS_T);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.13)';
    ctx.beginPath();
    ctx.moveTo(GLASS_L + 10, GLASS_T + 260);
    ctx.lineTo(GLASS_L + 210, GLASS_T);
    ctx.lineTo(GLASS_L + 300, GLASS_T);
    ctx.lineTo(GLASS_L + 60, GLASS_T + 320);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(GLASS_R - 220, GLASS_B);
    ctx.lineTo(GLASS_R - 20, GLASS_B - 240);
    ctx.lineTo(GLASS_R - 20, GLASS_B - 140);
    ctx.lineTo(GLASS_R - 120, GLASS_B);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // LED trim around the glass.
    for (let i = 0; i < 22; i++) {
      const lit = 0.5 + 0.5 * Math.sin(t * 5 + i * 0.7);
      ctx.globalAlpha = 0.4 + lit * 0.55;
      ctx.fillStyle = RAINBOW[i % RAINBOW.length];
      ctx.beginPath();
      ctx.arc(GLASS_L - 24 + i * (GLASS_R - GLASS_L + 48) / 21, GLASS_T - 26, 7, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    this.drawControlPanel(ctx, t);
    ctx.restore();
  }

  private drawBulbs(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    count: number,
    t: number,
    offset: number
  ) {
    for (let i = 0; i < count; i++) {
      const u = count <= 1 ? 0 : i / (count - 1);
      const x = lerp(x0, x1, u);
      const y = lerp(y0, y1, u);
      const lit = 0.5 + 0.5 * Math.sin(t * 5 + i * 0.8 + offset);
      ctx.globalAlpha = 0.4 + lit * 0.55;
      ctx.fillStyle = RAINBOW[(i + Math.floor(offset)) % RAINBOW.length];
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  private drawControlPanel(ctx: CanvasRenderingContext2D, t: number) {
    // Panel slab.
    ctx.fillStyle = PANEL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(MACH_L + 10, PANEL_T + 36, MACH_R - MACH_L - 20, MACH_B - PANEL_T - 46, 18);
    ctx.fill();
    ctx.stroke();

    // Rainbow strip at the top of the panel.
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = RAINBOW[i];
      ctx.fillRect(MACH_L + 30 + i * 115, PANEL_T + 50, 115, 10);
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(MACH_L + 30, PANEL_T + 50, 690, 10);

    // Token slot + insert light.
    ctx.fillStyle = '#1a1038';
    ctx.strokeStyle = METAL;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(COIN_X - 34, COIN_Y - 12, 68, 24, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = SCREEN;
    ctx.globalAlpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 6));
    ctx.beginPath();
    ctx.arc(COIN_X, COIN_Y - 34, 7, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Joystick.
    ctx.fillStyle = '#221545';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(JOY_X, JOY_Y + 24, 48, 18, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    const joyTilt = this.clawX(t) < 560 ? -0.22 : this.clawX(t) > 700 ? 0.22 : 0;
    ctx.save();
    ctx.translate(JOY_X, JOY_Y + 20);
    ctx.rotate(joyTilt);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -68);
    ctx.stroke();
    ctx.strokeStyle = METAL_DARK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -66);
    ctx.stroke();
    ctx.fillStyle = '#e63946';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -82, 27, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(-9, -91, 8, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Big red button.
    const pressed = t >= 7.85 && t < 8.2 ? 7 : t >= 14.85 && t < 15.2 ? 7 : 0;
    ctx.fillStyle = '#221545';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(BUTTON_X, BUTTON_Y + 22, 44, 17, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#b3222e';
    ctx.beginPath();
    ctx.arc(BUTTON_X, BUTTON_Y + 4 + pressed, 36, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = pressed > 0 ? '#c9303d' : '#ff4d5e';
    ctx.beginPath();
    ctx.arc(BUTTON_X, BUTTON_Y + pressed, 33, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(BUTTON_X - 11, BUTTON_Y - 11 + pressed, 9, 0, TAU);
    ctx.fill();

    // Prize chute.
    const open = t >= 19.6 ? smooth((t - 19.6) / 0.35) : 0;
    ctx.fillStyle = CHUTE_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.roundRect(CHUTE_L, CHUTE_T + 30, CHUTE_R - CHUTE_L, CHUTE_B - CHUTE_T - 20, 16);
    ctx.fill();
    ctx.stroke();

    // Flap swings inward as candy pours.
    ctx.save();
    ctx.translate(CHUTE_L + 8, CHUTE_T + 38);
    ctx.scale(1, Math.max(0.05, 1 - open));
    ctx.fillStyle = '#4a2b83';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(0, 0, CHUTE_R - CHUTE_L - 16, 84, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = WHITE;
    ctx.font = '800 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PRIZE', (CHUTE_R - CHUTE_L) / 2 - 8, 42);
    ctx.restore();

    // Chute glow once open.
    if (open > 0) {
      ctx.save();
      ctx.globalAlpha = 0.22 * open * (0.7 + 0.3 * Math.sin(t * 12));
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.roundRect(CHUTE_L + 6, CHUTE_T + 150, CHUTE_R - CHUTE_L - 12, 120, 12);
      ctx.fill();
      ctx.restore();
    }

    // Collection tray lip.
    ctx.fillStyle = MACHINE_LIGHT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(CHUTE_L - 18, CHUTE_B + 46, CHUTE_R - CHUTE_L + 36, 46, 12);
    ctx.fill();
    ctx.stroke();

    // Side lights.
    for (const px of [MACH_L + 26, MACH_R - 26]) {
      for (let i = 0; i < 5; i++) {
        const lit = 0.5 + 0.5 * Math.sin(t * 5 + i);
        ctx.globalAlpha = 0.35 + lit * 0.55;
        ctx.fillStyle = RAINBOW[i % RAINBOW.length];
        ctx.beginPath();
        ctx.arc(px, PANEL_T + 130 + i * 74, 8, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    }
  }

  // ------------------------------------------------------------------ candy

  private drawCandy(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    color: string,
    kind: CandyKind,
    rot: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(2.4, r * 0.16);

    if (kind === 'gummy') {
      // Squishy gummy bear shape.
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(-r * 0.48, -r * 0.66, r * 0.3, 0, TAU);
      ctx.arc(r * 0.48, -r * 0.66, r * 0.3, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(-r * 0.82, -r * 0.5, r * 1.64, r * 1.4, r * 0.52);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.3, -r * 0.18, r * 0.18, r * 0.26, -0.4, 0, TAU);
      ctx.fill();
    } else if (kind === 'wrapped') {
      // Wrapped sweet with two twisted ends.
      ctx.fillStyle = color;
      ctx.strokeStyle = INK;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.8, r, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, 0);
      ctx.lineTo(-r * 1.35, -r * 0.62);
      ctx.lineTo(-r * 1.15, 0);
      ctx.lineTo(-r * 1.35, r * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(r * 0.7, 0);
      ctx.lineTo(r * 1.35, -r * 0.62);
      ctx.lineTo(r * 1.15, 0);
      ctx.lineTo(r * 1.35, r * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.24, -r * 0.3, r * 0.16, r * 0.3, -0.4, 0, TAU);
      ctx.fill();
    } else if (kind === 'lolli') {
      // Small lollipop.
      ctx.strokeStyle = '#f6f0ff';
      ctx.lineWidth = Math.max(3, r * 0.28);
      ctx.beginPath();
      ctx.moveTo(0, r * 0.6);
      ctx.lineTo(0, r * 1.8);
      ctx.stroke();
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(1.6, r * 0.1);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.94, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = Math.max(2, r * 0.16);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.52, 0.4, 3.9);
      ctx.stroke();
    } else {
      // Round candy ball.
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.32, -r * 0.34, r * 0.24, r * 0.18, -0.6, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawLollipopCandy(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    t: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.4);
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(2.5, r * 0.14);
    for (let i = 0; i < 6; i++) {
      const a0 = (i / 6) * TAU;
      const a1 = ((i + 1) / 6) * TAU;
      ctx.fillStyle = RAINBOW[i];
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, a0, a1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // White spiral on top.
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = Math.max(2, r * 0.16);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const u = i / 60;
      const a = u * TAU * 2.4;
      const rad = u * r * 0.82;
      const px = Math.cos(a) * rad;
      const py = Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.34, -r * 0.4, r * 0.2, r * 0.12, -0.7, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawGiantLollipop(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    rot: number
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Stick.
    const stickTop = r * 0.72;
    const stickBottom = r + 155;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, stickTop);
    ctx.lineTo(0, stickBottom);
    ctx.stroke();
    ctx.strokeStyle = '#f6f0ff';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(0, stickTop);
    ctx.lineTo(0, stickBottom);
    ctx.stroke();
    ctx.strokeStyle = '#ff4d6d';
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const u = i / 10;
      const px = Math.sin(u * Math.PI * 4) * 7;
      const py = lerp(stickTop + 8, stickBottom - 8, u);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Candy disc.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    for (let i = 0; i < 6; i++) {
      const a0 = (i / 6) * TAU;
      const a1 = ((i + 1) / 6) * TAU;
      ctx.fillStyle = RAINBOW[i];
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, a0, a1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Thick white spiral.
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 90; i++) {
      const u = i / 90;
      const a = u * TAU * 2.7;
      const rad = u * r * 0.85;
      const px = Math.cos(a) * rad;
      const py = Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // Rim.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.36, -r * 0.4, r * 0.22, r * 0.13, -0.7, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // ------------------------------------------------------------------- claw

  private clawX(t: number): number {
    return keyAt(
      [
        [0, 640],
        [6.2, 640],
        [7.6, 500],
        [9.85, 500],
        [12.9, 500],
        [14.55, 640],
        [18.0, 640],
        [18.9, 840],
        [30, 840],
      ],
      t
    );
  }

  private clawY(t: number): number {
    return keyAt(
      [
        [0, 430],
        [6.35, 430],
        [8.6, 930],
        [8.9, 930],
        [9.65, 610],
        [10.3, 610],
        [12.7, 610],
        [14.7, 610],
        [15.4, 962],
        [15.6, 962],
        [16.55, 560],
        [18.0, 560],
        [18.9, 470],
        [30, 470],
      ],
      t
    );
  }

  private clawOpen(t: number): number {
    return keyAt(
      [
        [0, 1],
        [8.7, 1],
        [8.9, 0],
        [9.78, 0],
        [9.95, 1],
        [12.95, 1],
        [15.05, 1],
        [15.5, 0],
        [26.85, 0],
        [27.05, 1],
        [30, 1],
      ],
      t
    );
  }

  private drawClaw(ctx: CanvasRenderingContext2D, t: number) {
    const cx = this.clawX(t);
    const cy = this.clawY(t);
    const open = clamp(this.clawOpen(t), 0, 1);

    // Trolley + stem.
    ctx.fillStyle = METAL_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(cx - 46, RAIL_Y - 34, 92, 32, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = METAL;
    ctx.beginPath();
    ctx.roundRect(cx - 32, RAIL_Y - 28, 64, 12, 5);
    ctx.fill();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(cx, RAIL_Y + 2);
    ctx.lineTo(cx, cy - 34);
    ctx.stroke();
    ctx.strokeStyle = METAL;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, RAIL_Y + 2);
    ctx.lineTo(cx, cy - 34);
    ctx.stroke();

    // Claw housing.
    ctx.fillStyle = METAL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(cx - 30, cy - 30, 60, 30, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.roundRect(cx - 20, cy - 24, 40, 10, 5);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Three prongs: centre one sits behind the two outer ones.
    const tipX = 5 + open * 44;
    const tipY = cy + 58 - open * 6;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    const prong = (side: -1 | 0 | 1) => {
      const sx = cx + side * 20;
      const tx = cx + side * tipX;
      ctx.beginPath();
      ctx.moveTo(sx, cy - 4);
      if (side === 0) {
        ctx.quadraticCurveTo(cx, cy + 34, tx, tipY);
      } else {
        ctx.quadraticCurveTo(cx + side * (30 + open * 26), cy + 22, tx, tipY);
      }
      ctx.stroke();
    };
    prong(0);
    prong(-1);
    prong(1);

    ctx.strokeStyle = METAL;
    ctx.lineWidth = 11;
    prong(0);
    prong(-1);
    prong(1);

    // Prong tips.
    for (const side of [-1, 0, 1] as const) {
      ctx.fillStyle = METAL_DARK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx + side * tipX, tipY, 9, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  }

  // ---------------------------------------------------------------- pouring

  private drawPinkCandy(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 8.85) {
      this.drawCandy(ctx, PINK_HOME.x, PINK_HOME.y, PINK_R, '#ff5fa2', 'gummy', 0.2);
      return;
    }
    if (t < 9.7) {
      const cx = this.clawX(t);
      const cy = this.clawY(t) + 26;
      this.drawCandy(ctx, cx, cy, PINK_R, '#ff5fa2', 'gummy', 0.2 + (t - 8.85) * 0.6);
      return;
    }
    if (t < 10.32) {
      const u = clamp((t - 9.7) / 0.45, 0, 1);
      const y = lerp(636, PINK_HOME.y, u * u);
      const x = lerp(500, PINK_HOME.x, u);
      const bounce = t > 10.05 ? Math.sin(((t - 10.05) / 0.27) * Math.PI) * 26 : 0;
      this.drawCandy(ctx, x, y - bounce, PINK_R, '#ff5fa2', 'gummy', 0.2 + u * 3.2);
      return;
    }
    const wobble = Math.sin((t - 10.32) * 8) * Math.exp(-(t - 10.32) * 5) * 0.18;
    this.drawCandy(ctx, PINK_HOME.x, PINK_HOME.y, PINK_R, '#ff5fa2', 'gummy', 0.2 + wobble);
  }

  private drawPouredCandy(
    ctx: CanvasRenderingContext2D,
    t: number,
    x: number,
    hipY: number,
    pose: Pose
  ) {
    void x;
    void hipY;
    void pose;
    for (const candy of POUR_CANDY) {
      if (t < candy.spawn) continue;
      const age = t - candy.spawn;
      if (age < candy.dur) {
        const u = age / candy.dur;
        const px = lerp(candy.x0, candy.x1, smooth(u)) + Math.sin(u * Math.PI * 2) * 14;
        const py = lerp(candy.y0, candy.y1, u * u);
        this.drawCandy(
          ctx,
          px,
          py,
          candy.r,
          candy.color,
          candy.kind,
          candy.rot + candy.spin * age
        );
      } else {
        const settle = age - candy.dur;
        const hop = settle < 0.24 ? Math.sin((settle / 0.24) * Math.PI) * 14 : 0;
        this.drawCandy(
          ctx,
          candy.x1,
          candy.y1 - hop,
          candy.r,
          candy.color,
          candy.kind,
          candy.rot + candy.spin * candy.dur + (hop > 0 ? settle * 4 : 0)
        );
      }
    }
  }

  private drawShadows(ctx: CanvasRenderingContext2D, x: number, hop: number) {
    const lift = clamp(hop / 60, 0, 1);
    ctx.fillStyle = 'rgba(8, 4, 22, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + 16, FLOOR_Y - 4, lerp(74, 48, lift), lerp(15, 9, lift), 0, 0, TAU);
    ctx.fill();

    // Machine floor shadow.
    ctx.fillStyle = 'rgba(8, 4, 22, 0.28)';
    ctx.beginPath();
    ctx.ellipse(640, FLOOR_Y - 2, 420, 28, 0, 0, TAU);
    ctx.fill();
  }

  // -------------------------------------------------------------- character

  private charX(t: number): number {
    return keyAt(
      [
        [0, 360],
        [23.8, 360],
        [24.6, 336],
        [25.3, 305],
        [30, 305],
      ],
      t
    );
  }

  private charHop(t: number): number {
    const hop = (a: number, b: number, h: number) =>
      t >= a && t < b ? h * Math.sin(((t - a) / (b - a)) * Math.PI) : 0;
    return hop(16.55, 17.15, 66) + hop(17.25, 17.85, 54) + hop(24.1, 24.45, 18);
  }

  private poseAt(t: number): Pose {
    const p = this.defaultPose();
    p.headTurn = 4;
    p.look = 'right';

    if (t < 6.0) {
      // Shot 1 — spotting the giant lollipop.
      if (t < 1.35) {
        p.brow = 'normal';
        p.eye = 'open';
        p.mouth = 'flat';
        p.handL = { x: 285, y: 1180 };
        p.handR = { x: 440, y: 1180 };
      } else if (t < 2.25) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.pointR = true;
        p.bendR = -1;
        p.handR = { x: 500, y: 930 };
        p.handL = { x: 285, y: 1170 };
      } else if (t < 2.95) {
        p.brow = 'raised';
        p.eye = 'happy';
        p.mouth = 'grin';
        p.handR = { x: 445, y: 1055 };
        p.handL = { x: 300, y: 1065 };
        p.fistR = true;
        p.fistL = true;
      } else if (t < 3.5) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'smirk';
        p.handR = { x: 430, y: 1148 };
        p.handL = { x: 300, y: 1160 };
      } else if (t < 4.15) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.handR = { x: 440, y: 1170 };
        p.handL = { x: 290, y: 1140 };
      } else if (t < 4.9) {
        p.brow = 'raised';
        p.eye = 'happy';
        p.mouth = 'grin';
        p.handR = { x: 450, y: 1030 };
        p.handL = { x: 300, y: 1040 };
        p.fistR = true;
        p.fistL = true;
      } else {
        p.brow = 'raised';
        p.eye = 'open';
        p.mouth = 'smile';
        p.handR = { x: 445, y: 1110 };
        p.handL = { x: 295, y: 1120 };
      }
    } else if (t < 12.0) {
      // Shot 2 — the first grab fails.
      if (t < 6.45) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'smirk';
        p.lean = 0.04;
        p.handR = { x: JOY_X, y: JOY_Y - 62 };
        p.handL = { x: 285, y: 1150 };
      } else if (t < 7.65) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'flat';
        p.lean = 0.06;
        const knob = this.clawX(t) < 560 ? -18 : 18;
        p.handR = { x: JOY_X + knob, y: JOY_Y - 62 };
        p.handL = { x: 285, y: 1150 };
      } else if (t < 7.95) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.05;
        p.handR = { x: BUTTON_X, y: BUTTON_Y - 4 };
        p.handL = { x: 285, y: 1150 };
      } else if (t < 8.85) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.handR = { x: BUTTON_X, y: BUTTON_Y + 2 };
        p.handL = { x: 290, y: 1140 };
      } else if (t < 9.7) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'grin';
        p.handR = { x: 460, y: 1035 };
        p.handL = { x: 305, y: 1045 };
        p.fistR = true;
        p.fistL = true;
      } else if (t < 10.15) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.handR = { x: 470, y: 970 };
        p.handL = { x: 300, y: 1000 };
        p.bendR = -1;
      } else if (t < 10.45) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.handR = { x: 500, y: 900 };
        p.handL = { x: 280, y: 930 };
        p.bendR = -1;
        p.bendL = -1;
      } else {
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.03;
        p.handL = { x: 300, y: 1120 };
        p.handR = { x: 435, y: 1120 };
        p.fistR = true;
        p.fistL = true;
      }
    } else if (t < 18.0) {
      // Shot 3 — the perfect grab.
      if (t < 12.65) {
        p.brow = 'determined';
        p.eye = 'shut';
        p.mouth = 'flat';
        p.headDrop = 5;
        p.handL = { x: 290, y: 1150 };
        p.handR = { x: 430, y: 1150 };
      } else if (t < 14.0) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.05;
        p.handR = { x: JOY_X + 10, y: JOY_Y - 62 };
        p.handL = { x: 285, y: 1150 };
      } else if (t < 14.9) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'flat';
        p.handR = { x: BUTTON_X, y: BUTTON_Y - 4 };
        p.handL = { x: 290, y: 1145 };
      } else if (t < 15.5) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.handR = { x: BUTTON_X, y: BUTTON_Y + 2 };
        p.handL = { x: 300, y: 1105 };
      } else if (t < 16.45) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'grin';
        p.handL = { x: 300, y: 1010 };
        p.handR = { x: 455, y: 1010 };
        p.fistR = true;
        p.fistL = true;
      } else {
        p.brow = 'raised';
        p.eye = 'happy';
        p.mouth = 'grin';
        p.handL = { x: 240, y: 900 };
        p.handR = { x: 480, y: 900 };
        p.bendR = -1;
        p.bendL = -1;
      }
    } else if (t < 24.0) {
      // Shot 4 — candy overload.
      if (t < 18.75) {
        p.brow = 'raised';
        p.eye = 'happy';
        p.mouth = 'grin';
        p.handL = { x: 260, y: 950 };
        p.handR = { x: 460, y: 950 };
        p.bendR = -1;
        p.bendL = -1;
      } else if (t < 19.35) {
        p.brow = 'raised';
        p.eye = 'open';
        p.mouth = 'flat';
        p.look = 'right';
        p.handL = { x: 290, y: 1140 };
        p.handR = { x: 440, y: 1140 };
      } else if (t < 20.0) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.handL = { x: 275, y: 1020 };
        p.handR = { x: 455, y: 1020 };
        p.fistL = true;
        p.fistR = true;
      } else if (t < 23.55) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.legs = 'walk';
        p.walkPhase = t * 12;
        p.lean = -0.08;
        p.handL = { x: 250 + Math.sin(t * 14) * 40, y: 980 };
        p.handR = { x: 460 + Math.sin(t * 14 + 1) * 40, y: 980 };
        p.bendL = -1;
        p.bendR = -1;
      } else {
        p.brow = 'sad';
        p.eye = 'shut';
        p.mouth = 'grit';
        p.lean = -0.04;
        p.handL = { x: 300, y: 950 };
        p.handR = { x: 400, y: 950 };
        p.fistL = true;
        p.fistR = true;
      }
    } else {
      // Shot 5 — buried in candy.
      if (t < 24.85) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.legs = 'walk';
        p.walkPhase = t * 14;
        p.lean = -0.12;
        p.handL = { x: 245, y: 930 };
        p.handR = { x: 455, y: 930 };
        p.bendL = -1;
        p.bendR = -1;
      } else if (t < 25.6) {
        p.brow = 'sad';
        p.eye = 'shut';
        p.mouth = 'o';
        p.lean = -0.06;
        p.handL = { x: 275, y: 960 };
        p.handR = { x: 425, y: 960 };
        p.fistL = true;
        p.fistR = true;
      } else if (t < 26.7) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 4 + Math.sin(t * 18) * 6;
        p.handL = { x: 280, y: 1120 };
        p.handR = { x: 410, y: 1120 };
      } else if (t < 27.55) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.look = 'up';
        p.headDrop = -5;
        p.handL = { x: 285, y: 1130 };
        p.handR = { x: 405, y: 1130 };
      } else if (t < 28.4) {
        p.brow = 'raised';
        p.eye = 'open';
        p.mouth = 'o';
        p.look = 'up';
        p.headDrop = -3;
        p.handL = { x: 285, y: 1140 };
        p.handR = { x: 405, y: 1140 };
      } else if (t < 28.9) {
        p.brow = 'normal';
        p.eye = 'open';
        p.mouth = 'flat';
        p.look = 'front';
        p.handL = { x: 285, y: 1150 };
        p.handR = { x: 405, y: 1150 };
      } else {
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.look = 'front';
        p.lean = 0.02;
        p.handL = { x: 275, y: 1140 };
        p.handR = { x: 415, y: 1140 };
        p.fistL = true;
        p.fistR = true;
      }
    }

    // Derive grip states from hand positions and actions
    // Right hand grips: joystick (6.45-7.95), button (7.95), lollipop (15.5+)
    p.gripR = (t >= 6.45 && t < 7.95) || t >= 15.5;
    // Left hand rarely grips
    p.gripL = false;

    return p;
  }

  private defaultPose(): Pose {
    return {
      lean: 0,
      headTilt: 0,
      headDrop: 0,
      headTurn: 0,
      look: 'front',
      mouth: 'flat',
      brow: 'normal',
      eye: 'open',
      legs: 'stand',
      walkPhase: 0,
      handL: { x: 285, y: 1160 },
      handR: { x: 435, y: 1160 },
      bendL: 1,
      bendR: 1,
      fistL: false,
      fistR: false,
      pointR: false,
      gripL: false,
      gripR: false,
      beanieOn: true,
    };
  }

  private computeArms(pose: Pose, hipX: number, hipY: number) {
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(pose.lean) * 170;
    const upper = 112;
    const fore = 106;

    const solve = (side: -1 | 1, target: Pt, bend: number) => {
      const sx = bodyTopX + side * 34;
      const sy = shoulderY + 12;
      const ux = (target.x - sx) * side;
      const uy = target.y - sy;
      const raw = Math.hypot(ux, uy);
      const d = clamp(raw, 10, upper + fore - 4);
      const base = Math.atan2(ux, uy);
      const cosA = clamp((upper * upper + d * d - fore * fore) / (2 * upper * d), -1, 1);
      const alpha = Math.acos(cosA);
      const a1 = base + bend * alpha;
      const ex = sx + Math.sin(a1) * side * upper;
      const ey = sy + Math.cos(a1) * upper;
      const hx = sx + Math.sin(base) * side * d;
      const hy = sy + Math.cos(base) * d;
      return { sx, sy, ex, ey, hx, hy };
    };

    return {
      l: solve(-1, pose.handL, pose.bendL),
      r: solve(1, pose.handR, pose.bendR),
    };
  }

  private drawStickman(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    pose: Pose,
    arms: { l: Arm; r: Arm },
    t: number,
    layer: 'body' | 'front'
  ) {
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(pose.lean) * 170;
    const footY = this.floorY - Math.max(0, this.hipY - hipY);

    ctx.save();
    ctx.lineCap = 'round';

    if (layer === 'body') {
      const stride = pose.legs === 'walk' ? Math.sin(pose.walkPhase) * 34 : 0;
      const kneeL = { x: hipX - 20 + stride * 0.4, y: hipY + 82 };
      const kneeR = { x: hipX + 20 - stride * 0.4, y: hipY + 82 };
      const ankleL = { x: hipX - 38 + stride, y: footY - 16 };
      const ankleR = { x: hipX + 38 - stride, y: footY - 16 };
      const hips = [
        { x: hipX - 8, y: hipY + 6 },
        { x: hipX + 8, y: hipY + 6 },
      ];

      // Blue trousers over thin cartoon legs.
      for (let i = 0; i < 2; i++) {
        const hip = hips[i];
        const knee = i === 0 ? kneeL : kneeR;
        const ankle = i === 0 ? ankleL : ankleR;
        const path = () => {
          ctx.beginPath();
          ctx.moveTo(hip.x, hip.y);
          ctx.lineTo(knee.x, knee.y);
          ctx.lineTo(ankle.x, ankle.y);
        };
        ctx.strokeStyle = INK;
        ctx.lineWidth = 32;
        path();
        ctx.stroke();
        ctx.strokeStyle = i === 0 ? TROUSER : TROUSER_DEEP;
        ctx.lineWidth = 23;
        path();
        ctx.stroke();
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      for (const ankle of [ankleL, ankleR]) {
        ctx.beginPath();
        ctx.moveTo(ankle.x - 14, ankle.y);
        ctx.lineTo(ankle.x + 14, ankle.y);
        ctx.stroke();
      }
      this.drawShoe(ctx, ankleL.x - 4, ankleL.y + 14, -0.07);
      this.drawShoe(ctx, ankleR.x + 4, ankleR.y + 14, 0.07);

      // Yellow short-sleeved shirt.
      ctx.fillStyle = SHIRT;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(hipX - 34, hipY + 8);
      ctx.lineTo(bodyTopX - 36, shoulderY);
      ctx.lineTo(bodyTopX + 36, shoulderY);
      ctx.lineTo(hipX + 34, hipY + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(20,20,20,0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bodyTopX - 18, shoulderY + 16);
      ctx.lineTo(bodyTopX + 18, shoulderY + 16);
      ctx.stroke();
    }

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

    const leftHandStyle: HandStyle = {
      side: 'left',
      pose: pose.gripL ? 'grip' : pose.fistL ? 'fist' : 'relaxed',
    };
    const rightHandStyle: HandStyle = {
      side: 'right',
      pose: pose.gripR ? 'grip' : pose.fistR ? 'fist' : pose.pointR ? 'point' : 'relaxed',
    };

    drawHand(ctx, arms.l, leftHandStyle);
    drawHand(ctx, arms.r, rightHandStyle);

    if (layer === 'front') {
      const head = this.headPoint(pose, hipX, hipY);
      this.drawHead(ctx, head.x, head.y, pose, t);
    }

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
    ctx.roundRect(-32, -13, 64, 26, 11);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.roundRect(-24, -8, 14, 6, 3);
    ctx.fill();
    ctx.restore();
  }

  private headPoint(pose: Pose, hipX: number, hipY: number): Pt {
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(pose.lean) * 170;
    return {
      x: bodyTopX + Math.sin(pose.headTilt) * 10,
      y: shoulderY - 78 + pose.headDrop,
    };
  }

  private drawHead(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    pose: Pose,
    t: number
  ) {
    const r = this.headR;
    const turn = pose.headTurn;

    // Neck.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(cx, cy + r);
    ctx.lineTo(cx, cy + r + 26);
    ctx.stroke();

    // Face.
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (pose.beanieOn) this.drawBeanie(ctx, cx, cy);

    // Eyes.
    const eyeShiftY = pose.look === 'down' ? 7 : pose.look === 'up' ? -7 : 0;
    const eyeShiftX = pose.look === 'right' ? 7 : pose.look === 'left' ? -7 : 0;
    const eyeY = cy + 8 + eyeShiftY;
    const eyeDX = 26;
    const fx = cx + turn + eyeShiftX;

    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;

    if (pose.eye === 'shut') {
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(fx + side * eyeDX, eyeY + 8, 14, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    } else if (pose.eye === 'peek') {
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(fx - eyeDX, eyeY + 8, 14, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(fx + eyeDX, eyeY, 11, 9, 0, 0, TAU);
      ctx.fill();
    } else if (pose.eye === 'happy') {
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(fx + side * eyeDX, eyeY + 6, 14, Math.PI * 1.12, Math.PI * 1.88);
        ctx.stroke();
      }
    } else {
      const eyeH = pose.eye === 'wide' ? 30 : pose.eye === 'squint' ? 8 : 20;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(fx + side * eyeDX, eyeY, 10, eyeH / 2, 0, 0, TAU);
        ctx.fill();
      }
    }

    // Eyebrows.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    const browY = cy - 12;
    const twitch = t >= 28.9 ? Math.sin(t * 22) * 3 : 0;
    ctx.beginPath();
    if (pose.brow === 'angry' || pose.brow === 'determined') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY + 8 + twitch);
      ctx.moveTo(fx + 42, browY - 8);
      ctx.lineTo(fx + 12, browY + 8 - twitch);
    } else if (pose.brow === 'raised') {
      ctx.moveTo(fx - 42, browY - 10);
      ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY - 10);
      ctx.lineTo(fx + 12, browY - 8);
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
    } else {
      ctx.moveTo(fx - 42, browY - 4);
      ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY - 4);
      ctx.lineTo(fx + 12, browY - 8);
    }
    ctx.stroke();

    // Mouth.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    const my = cy + 40;
    ctx.beginPath();
    if (pose.mouth === 'grin') {
      ctx.arc(fx, my - 12, 26, 0.15 * Math.PI, 0.85 * Math.PI);
    } else if (pose.mouth === 'smile') {
      ctx.arc(fx, my - 14, 20, 0.2 * Math.PI, 0.8 * Math.PI);
    } else if (pose.mouth === 'smirk') {
      ctx.moveTo(fx - 22, my + 2);
      ctx.quadraticCurveTo(fx + 4, my + 10, fx + 24, my - 10);
    } else if (pose.mouth === 'frown') {
      ctx.arc(fx, my + 16, 24, 1.15 * Math.PI, 1.85 * Math.PI);
    } else if (pose.mouth === 'o') {
      ctx.ellipse(fx, my, 14, 18, 0, 0, TAU);
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

    // Final-close-up anger vein.
    if (t >= 28.95) {
      ctx.strokeStyle = '#e63946';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const vx = cx + 44;
      const vy = cy - 22;
      for (let i = 0; i < 3; i++) {
        const a = -0.6 + i * 0.7;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(vx + Math.cos(a) * 18, vy + Math.sin(a) * 18);
        ctx.stroke();
      }
    }
  }

  private drawBeanie(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    const r = this.headR;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillStyle = BEANIE;
    ctx.beginPath();
    ctx.arc(cx, cy - 24, r + 4, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = BEANIE_DEEP;
    ctx.fillRect(cx - r - 4, cy - 40, (r + 4) * 2, 16);
    ctx.strokeRect(cx - r - 4, cy - 40, (r + 4) * 2, 16);
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(cx, cy - r - 32, 16, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private drawLollipopOutside(
    ctx: CanvasRenderingContext2D,
    t: number,
    x: number,
    hipY: number,
    pose: Pose
  ) {
    // After the claw releases it at 26.85s, the lollipop falls and lands on his beanie.
    if (t < 26.85) return;
    const head = this.headPoint(pose, x, hipY);
    const fall = keyAt(
      [
        [26.85, 0],
        [27.2, 160],
        [27.55, 210],
        [28.2, 210],
        [30, 210],
      ],
      t
    );
    const rot = keyAt(
      [
        [26.85, 0],
        [27.2, -0.18],
        [27.55, 0.12],
        [28.0, 0],
        [30, 0],
      ],
      t
    );
    const bob = t > 28.2 ? Math.sin(t * 6) * 4 : 0;
    this.drawGiantLollipop(ctx, head.x, head.y - this.headR - 155 - fall + bob, LOLLI_R, rot);
  }

  private drawFreezeFrame(ctx: CanvasRenderingContext2D, t: number) {
    if (t >= 29.4) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = '#e63946';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-40, -40);
      ctx.lineTo(WIDTH + 40, -40);
      ctx.lineTo(WIDTH + 40, HEIGHT + 40);
      ctx.lineTo(-40, HEIGHT + 40);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawCaptions(ctx: CanvasRenderingContext2D, t: number) {
    const line = this.captions.find((c) => t >= c.from && t < c.to);
    if (!line) return;

    const u = clamp((t - line.from) / 0.1, 0, 1);
    const fade = Math.min(1, (line.to - t) / 0.2);
    const alpha = clamp(Math.min((t - line.from) / 0.05, fade), 0, 1);
    if (alpha <= 0) return;

    const scale = 1 - (1 - u) * 0.25 + Math.sin(u * Math.PI) * 0.18;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.width / 2, 470);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    const family = '"Arial Black", "Helvetica Neue", Arial, sans-serif';
    let size = 76;
    ctx.font = `900 ${size}px ${family}`;
    const width = ctx.measureText(line.text).width;
    if (width > 960) {
      size = Math.max(44, Math.floor((size * 960) / width));
      ctx.font = `900 ${size}px ${family}`;
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(14, size * 0.26);
    ctx.strokeText(line.text, 0, 0);
    ctx.fillStyle = WHITE;
    ctx.fillText(line.text, 0, 0);
    ctx.restore();
  }
}


