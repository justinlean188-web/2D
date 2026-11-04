import type { StudioConfig } from '../types';
import { drawHand, HandStyle } from './handRenderer';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

const INK = '#17121f';
const WHITE = '#ffffff';
const CREAM = '#fff4e2';
const CREAM_DEEP = '#ffe6c8';
const CORAL = '#ffd3c2';
const WALL = '#ffeede';
const WALL_LINE = '#f2d3bb';
const FLOOR = '#f2c48d';
const FLOOR_ALT = '#e8b478';
const FLOOR_DEEP = '#cf9257';
const FLOOR_LINE = '#b97a42';

const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const SHIRT = '#ffd166';
const TROUSER = '#2f5fa8';
const TROUSER_DEEP = '#22457c';
const SHOE = '#141414';

const CANOPY = '#e63946';
const CANOPY_DEEP = '#b3222e';
const GOLD = '#ffc93c';
const GOLD_DEEP = '#d99a12';
const GOLD_LIGHT = '#ffe9a8';
const CURTAIN = '#6c4bd1';
const CURTAIN_DEEP = '#4d2fa4';
const CURTAIN_LIGHT = '#8a6bea';
const WOOD = '#c4824d';
const WOOD_DEEP = '#9a5c31';
const WOOD_DARK = '#6f3d1d';
const SIGN_BG = '#0f6b6b';
const SIGN_DEEP = '#0a4f4f';

const FLOOR_Y = 1580;
const HIP_Y = 1280;
const HEAD_R = 70;

const CRATE_L = 690;
const CRATE_R = 820;
const CRATE_T = 1275;
const CRATE_B = 1535;
const STACK_X = 754;
const STACK_BOTTOM = 1262;
const STACK_STEP = 11;
const STACK_R = 44;

const FALL_START = 21.05;
const LAND_TIME = 24.3;

// New constant for sign position
const SIGN_CENTER_Y = 240;

type MouthShape = 'flat' | 'smile' | 'grin' | 'o' | 'frown' | 'grit' | 'smirk';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'determined';
type EyeShape = 'open' | 'wide' | 'squint' | 'shut' | 'happy' | 'peek';
type LookDir = 'front' | 'down' | 'up' | 'right' | 'left';

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
  fingerR: boolean;
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

interface StickDef {
  x: number;
  baseY: number;
  plateY: number;
  r: number;
  color: string;
  placed: number;
}

const PLATE_STICKS: StickDef[] = [
  { x: 660, baseY: 1516, plateY: 1000, r: 52, color: '#4cc9f0', placed: 4.92 },
  { x: 420, baseY: 1516, plateY: 1000, r: 52, color: '#ffb703', placed: 7.05 },
  { x: 480, baseY: 1408, plateY: 765, r: 46, color: '#8ac926', placed: 9.25 },
  { x: 600, baseY: 1416, plateY: 765, r: 46, color: '#b06bff', placed: 12.7 },
  { x: 300, baseY: 1442, plateY: 870, r: 48, color: '#ff8c42', placed: 13.2 },
  { x: 780, baseY: 1452, plateY: 870, r: 48, color: '#2ec4b6', placed: 13.7 },
  { x: 180, baseY: 1480, plateY: 940, r: 50, color: '#f15bb5', placed: 14.2 },
  { x: 900, baseY: 1490, plateY: 940, r: 50, color: '#ffd166', placed: 14.7 },
  { x: 95, baseY: 1528, plateY: 1040, r: 52, color: '#5aa9ff', placed: 15.2 },
  { x: 985, baseY: 1528, plateY: 1040, r: 52, color: '#ffc93c', placed: 15.7 },
];

const CAPTIONS: CaptionLine[] = [
  { text: 'CAN HE SPIN 10 PLATES?', from: 0.35, to: 5.8 },
  { text: '3 PLATES! EASY!', from: 6.2, to: 11.85 },
  { text: '10 PLATES! UNBELIEVABLE!', from: 12.2, to: 17.85 },
  { text: 'UH-OH... LOOK OUT!', from: 18.2, to: 23.85 },
  { text: 'NEW WORLD RECORD?! 😂', from: 24.2, to: 29.75 },
];

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 540, y: 960, zoom: 0.95 },
  { t: 1.8, x: 540, y: 960, zoom: 0.96 },
  { t: 2.5, x: 540, y: 790, zoom: 1.1 },
  { t: 3.2, x: 540, y: 900, zoom: 1.04 },
  { t: 3.9, x: 600, y: 1030, zoom: 1.08 },
  { t: 4.7, x: 540, y: 1010, zoom: 1.04 },
  { t: 6.0, x: 540, y: 1010, zoom: 1.06 },
  { t: 8.2, x: 545, y: 1000, zoom: 1.08 },
  { t: 9.2, x: 555, y: 970, zoom: 1.12 },
  { t: 10.4, x: 540, y: 1010, zoom: 1.06 },
  { t: 12.0, x: 540, y: 1000, zoom: 1.04 },
  { t: 15.7, x: 540, y: 980, zoom: 1.0 },
  { t: 18.0, x: 540, y: 980, zoom: 1.02 },
  { t: 18.6, x: 540, y: 960, zoom: 1.06 },
  { t: 19.7, x: 570, y: 980, zoom: 1.1 },
  { t: 20.4, x: 610, y: 980, zoom: 1.22 },
  { t: 21.1, x: 570, y: 930, zoom: 1.18 },
  { t: 22.0, x: 545, y: 900, zoom: 1.25 },
  { t: 23.4, x: 540, y: 900, zoom: 1.2 },
  { t: 24.4, x: 540, y: 930, zoom: 1.25 },
  { t: 25.8, x: 540, y: 940, zoom: 1.28 },
  { t: 26.9, x: 540, y: 930, zoom: 1.34 },
  { t: 28.2, x: 540, y: 920, zoom: 1.7 },
  { t: 29.2, x: 540, y: 910, zoom: 1.98 },
  { t: 30.0, x: 540, y: 905, zoom: 2.08 },
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
function bezier(a: Pt, b: Pt, c: Pt, u: number): Pt {
  const v = 1 - u;
  return {
    x: v * v * a.x + 2 * v * u * b.x + u * u * c.x,
    y: v * v * a.y + 2 * v * u * b.y + u * u * c.y,
  };
}
const heavy = (size: number) =>
  `900 ${size}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;

export class PlateSpinRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  private readonly floorY = FLOOR_Y;
  private readonly hipY = HIP_Y;
  private readonly headR = HEAD_R;
  private readonly captions = CAPTIONS;

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    void config;
    const t = clamp(time, 0, 30);

    ctx.save();
    ctx.fillStyle = CREAM;
    ctx.fillRect(-200, -200, WIDTH + 400, HEIGHT + 400);

    this.applyCamera(ctx, t);
    this.drawBooth(ctx, t);
    this.drawSticks(ctx, t);
    this.drawCrate(ctx, t);
    this.drawMountedPlates(ctx, t);
    this.drawStack(ctx, t);

    const x = this.charX(t);
    const hop = this.charHop(t);
    const hipY = this.hipY - hop;
    const pose = this.poseAt(t, x);
    if (hop > 0) {
      pose.handL = { x: pose.handL.x, y: pose.handL.y - hop };
      pose.handR = { x: pose.handR.x, y: pose.handR.y - hop };
    }
    const arms = this.computeArms(pose, x, hipY);

    this.drawShadow(ctx, x, hipY, hop);
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'body');
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'front');

    this.drawFlyingPlates(ctx, t);
    this.drawFallenPlate(ctx, t, pose, x, hipY);
    this.drawEffects(ctx, t, x, hipY, pose);
    this.restoreCamera(ctx);

    this.drawCaptions(ctx, t);
    ctx.restore();
  }

  // ---------------------------------------------------------------- camera

  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    const keys = CAMERA_KEYS;
    let k = keys[0];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (t >= a.t && t <= b.t) {
        const u = smooth((t - a.t) / Math.max(0.0001, b.t - a.t));
        k = {
          t,
          x: lerp(a.x, b.x, u),
          y: lerp(a.y, b.y, u),
          zoom: lerp(a.zoom, b.zoom, u),
        };
        break;
      }
      if (t > keys[keys.length - 1].t) k = keys[keys.length - 1];
    }
    const shake =
      t > LAND_TIME && t < LAND_TIME + 0.3
        ? ((LAND_TIME + 0.3 - t) / 0.3) * 5
        : t > 20.4 && t < 21.05
        ? 1.6
        : 0;
    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.scale(k.zoom, k.zoom);
    ctx.translate(
      -k.x + Math.sin(t * 71) * shake,
      -k.y + Math.cos(t * 63) * shake * 0.6
    );
  }

  private restoreCamera(ctx: CanvasRenderingContext2D) {
    ctx.restore();
    ctx.save();
  }

  // ----------------------------------------------------------------- booth

  private drawBooth(ctx: CanvasRenderingContext2D, t: number) {
    this.drawWall(ctx);
    this.drawCanopy(ctx, t);
    this.drawCurtains(ctx);
    this.drawFloor(ctx);
    this.drawSign(ctx, t);
  }

  private drawWall(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = WALL;
    ctx.fillRect(-200, 100, WIDTH + 400, 1340);

    const stripe = 96;
    for (let i = 0; i < 13; i++) {
      const x = i * stripe - 30;
      ctx.fillStyle = i % 2 === 0 ? CREAM_DEEP : CORAL;
      ctx.fillRect(x, 150, stripe, 1250);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      for (let row = 0; row < 6; row++) {
        const cx = x + 24 + (row % 2) * 46;
        const cy = 240 + row * 200;
        this.drawStar(ctx, cx, cy, 7, '#ffffff', 0.7);
      }
    }

    // Gentle wall shading bands (flat, no gradients).
    ctx.fillStyle = 'rgba(200,120,80,0.10)';
    ctx.fillRect(-200, 150, WIDTH + 400, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(-200, 1260, WIDTH + 400, 140);
  }

  private drawCanopy(ctx: CanvasRenderingContext2D, t: number) {
    // Deep red roof behind the canopy band.
    ctx.fillStyle = CANOPY_DEEP;
    ctx.fillRect(-200, -120, WIDTH + 400, 300);

    const stripe = 90;
    for (let i = 0; i < 13; i++) {
      ctx.fillStyle = i % 2 === 0 ? CANOPY : CREAM;
      ctx.fillRect(i * stripe - 30, 20, stripe, 130);
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    for (let i = 0; i <= 12; i++) {
      const x = i * stripe - 30;
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, 150);
      ctx.stroke();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-30, 20);
    ctx.lineTo(1050, 20);
    ctx.stroke();

    // Gold trim under the stripes.
    ctx.fillStyle = GOLD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.fillRect(-30, 142, 1080, 16);
    ctx.strokeRect(-30, 142, 1080, 16);

    // Scalloped valance with marquee bulbs.
    for (let i = 0; i < 12; i++) {
      const cx = 15 + i * 90;
      ctx.fillStyle = i % 2 === 0 ? CANOPY : CANOPY_DEEP;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, 158, 45, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = GOLD_LIGHT;
      ctx.beginPath();
      ctx.arc(cx, 186, 7, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.28)';
      ctx.lineWidth = 2;
      ctx.stroke();
      const twinkle = 0.55 + 0.45 * Math.sin(t * 4 + i * 0.9);
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = '#fffbe8';
      ctx.beginPath();
      ctx.arc(cx - 2, 184, 3, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Little gold posts at the ends of the valance.
    for (const px of [-8, 1088]) {
      ctx.fillStyle = GOLD;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(px - 16, 20, 32, 160, 12);
      ctx.fill();
      ctx.stroke();
    }
  }

  private drawCurtains(ctx: CanvasRenderingContext2D) {
    const drawn = (side: -1 | 1) => {
      ctx.save();
      const edge = side < 0 ? 0 : WIDTH;
      const inner = side < 0 ? 152 : WIDTH - 152;
      ctx.fillStyle = CURTAIN;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(edge, 180);
      ctx.lineTo(inner, 180);
      ctx.quadraticCurveTo(inner + side * -34, 520, inner, 900);
      ctx.quadraticCurveTo(inner + side * -26, 1180, inner - side * 12, 1400);
      ctx.lineTo(edge, 1400);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fold lines.
      ctx.strokeStyle = CURTAIN_DEEP;
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const x = side < 0 ? 38 + i * 40 : WIDTH - 38 - i * 40;
        ctx.beginPath();
        ctx.moveTo(x, 240);
        ctx.quadraticCurveTo(x + side * -16, 780, x + side * 10, 1340);
        ctx.stroke();
      }
      ctx.strokeStyle = CURTAIN_LIGHT;
      ctx.lineWidth = 7;
      for (let i = 0; i < 2; i++) {
        const x = side < 0 ? 58 + i * 44 : WIDTH - 58 - i * 44;
        ctx.beginPath();
        ctx.moveTo(x, 260);
        ctx.quadraticCurveTo(x + side * 12, 760, x + side * -8, 1320);
        ctx.stroke();
      }

      // Gold tieback.
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 18;
      ctx.beginPath();
      const ty = 790;
      if (side < 0) {
        ctx.moveTo(0, ty);
        ctx.quadraticCurveTo(78, ty + 22, 138, ty - 6);
      } else {
        ctx.moveTo(WIDTH, ty);
        ctx.quadraticCurveTo(WIDTH - 78, ty + 22, WIDTH - 138, ty - 6);
      }
      ctx.stroke();
      ctx.strokeStyle = GOLD_DEEP;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Tassel.
      const tx = side < 0 ? 136 : WIDTH - 136;
      ctx.fillStyle = GOLD;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(tx, ty - 6);
      ctx.lineTo(tx, ty + 46);
      ctx.lineTo(tx + 14, ty + 78);
      ctx.lineTo(tx - 14, ty + 78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    drawn(-1);
    drawn(1);
  }

  private drawFloor(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = FLOOR;
    ctx.fillRect(-200, 1400, WIDTH + 400, 520);
    for (let i = 0; i < 8; i++) {
      const y = 1400 + i * 68;
      ctx.fillStyle = i % 2 === 0 ? FLOOR : FLOOR_ALT;
      ctx.fillRect(-200, y, WIDTH + 400, 68);
      ctx.strokeStyle = FLOOR_LINE;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-200, y);
      ctx.lineTo(WIDTH + 200, y);
      ctx.stroke();
      // Staggered plank seams.
      for (let j = -1; j < 7; j++) {
        const x = j * 180 + (i % 2 === 0 ? 90 : 20);
        ctx.strokeStyle = 'rgba(150,90,40,0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 68);
        ctx.stroke();
      }
    }

    // Painted stage star under the performer.
    ctx.save();
    ctx.globalAlpha = 0.4;
    this.drawStar(ctx, 540, 1620, 150, GOLD, 1);
    ctx.restore();

    // Gold edge where the deck meets the wall.
    ctx.fillStyle = GOLD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillRect(-200, 1382, WIDTH + 400, 24);
    ctx.strokeRect(-200, 1382, WIDTH + 400, 24);
  }

  private drawSign(ctx: CanvasRenderingContext2D, t: number) {
    const x = 540;
    const y = SIGN_CENTER_Y;
    const w = 720;
    const h = 172;

    // Hanging ropes.
    ctx.strokeStyle = GOLD_DEEP;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    for (const rx of [-210, 210]) {
      ctx.beginPath();
      ctx.moveTo(x + rx, 196);
      ctx.lineTo(x + rx * 0.94, y - h / 2 - 2);
      ctx.stroke();
    }

    // Panel.
    ctx.fillStyle = SIGN_BG;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, 26);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = SIGN_DEEP;
    ctx.beginPath();
    ctx.roundRect(x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 18);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Marquee bulbs around the panel.
    const bulbs: Array<[number, number]> = [];
    for (let i = 0; i < 9; i++) {
      bulbs.push([x - w / 2 + 32 + (i * (w - 64)) / 8, y - h / 2 + 6]);
      bulbs.push([x - w / 2 + 32 + (i * (w - 64)) / 8, y + h / 2 - 6]);
    }
    for (let i = 0; i < 3; i++) {
      bulbs.push([x - w / 2 + 6, y - 38 + i * 46]);
      bulbs.push([x + w / 2 - 6, y - 38 + i * 46]);
    }
    for (let i = 0; i < bulbs.length; i++) {
      const [bx, by] = bulbs[i];
      const on = Math.sin(t * 5 + i * 1.3) > -0.25;
      ctx.fillStyle = on ? GOLD_LIGHT : '#c7a24a';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bx, by, 7, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Text.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = GOLD_LIGHT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.font = heavy(24);
    ctx.strokeText('THE IMPOSSIBLE', x, y - 45);
    ctx.fillText('THE IMPOSSIBLE', x, y - 45);
    ctx.font = heavy(56);
    ctx.lineWidth = 12;
    ctx.strokeText('SPIN 10 PLATES!', x, y + 26);
    ctx.fillStyle = WHITE;
    ctx.fillText('SPIN 10 PLATES!', x, y + 26);

    // Two little stars beside the headline.
    this.drawStar(ctx, x - 318, y + 24, 22, GOLD, 1);
    this.drawStar(ctx, x + 318, y + 24, 22, GOLD, 1);
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    color: string,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 === 0 ? r : r * 0.44;
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ----------------------------------------------------------------- sticks

  private drawSticks(ctx: CanvasRenderingContext2D, t: number) {
    const order = [...PLATE_STICKS].sort((a, b) => a.baseY - b.baseY);
    for (const s of order) this.drawStick(ctx, s, t);
  }

  private drawStick(ctx: CanvasRenderingContext2D, s: StickDef, t: number) {
    // Base foot.
    ctx.fillStyle = '#6d7484';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(s.x, s.baseY + 2, 30, 10, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#aab2c0';
    ctx.beginPath();
    ctx.ellipse(s.x, s.baseY - 2, 20, 7, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Pole with a candy-cane tick pattern.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s.x, s.baseY);
    ctx.lineTo(s.x, s.plateY + 8);
    ctx.stroke();
    ctx.strokeStyle = '#f6efe3';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(s.x, s.baseY);
    ctx.lineTo(s.x, s.plateY + 8);
    ctx.stroke();
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 7;
    for (let y = s.baseY - 34; y > s.plateY + 30; y -= 72) {
      ctx.beginPath();
      ctx.moveTo(s.x - 8, y);
      ctx.lineTo(s.x + 8, y - 18);
      ctx.stroke();
    }

    // Gold tip cup.
    ctx.fillStyle = GOLD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(s.x - 11, s.plateY + 4, 22, 14, 5);
    ctx.fill();
    ctx.stroke();

    if (t >= s.placed) {
      // Tiny landing sparks around the plate for a moment.
      const age = t - s.placed;
      if (age < 0.4) {
        const u = clamp(age / 0.4, 0, 1);
        ctx.save();
        ctx.globalAlpha = 1 - u;
        ctx.strokeStyle = GOLD_LIGHT;
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * TAU + 0.4;
          const d = 16 + u * 42;
          ctx.beginPath();
          ctx.moveTo(s.x + Math.cos(a) * d, s.plateY + Math.sin(a) * d * 0.4);
          ctx.lineTo(
            s.x + Math.cos(a) * (d + 12),
            s.plateY + Math.sin(a) * (d + 12) * 0.4
          );
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  // ------------------------------------------------------------------ crate

  private drawCrate(ctx: CanvasRenderingContext2D, t: number) {
    void t;
    // Shadow.
    ctx.fillStyle = 'rgba(80,40,20,0.18)';
    ctx.beginPath();
    ctx.ellipse(755, 1548, 82, 18, 0, 0, TAU);
    ctx.fill();

    // Back rim.
    ctx.fillStyle = WOOD_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(CRATE_L - 6, CRATE_T - 18, CRATE_R - CRATE_L + 12, 34, 8);
    ctx.fill();
    ctx.stroke();

    // Body.
    ctx.fillStyle = WOOD;
    ctx.beginPath();
    ctx.moveTo(CRATE_L, CRATE_T);
    ctx.lineTo(CRATE_R, CRATE_T);
    ctx.lineTo(CRATE_R - 6, CRATE_B);
    ctx.lineTo(CRATE_L + 6, CRATE_B);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Slats.
    ctx.strokeStyle = WOOD_DEEP;
    ctx.lineWidth = 8;
    for (let i = 1; i < 4; i++) {
      const y = CRATE_T + i * 62;
      ctx.beginPath();
      ctx.moveTo(CRATE_L + 4, y);
      ctx.lineTo(CRATE_R - 4, y);
      ctx.stroke();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(CRATE_L + 12, CRATE_T + 22);
    ctx.lineTo(CRATE_L + 12, CRATE_B - 8);
    ctx.moveTo(CRATE_R - 12, CRATE_T + 22);
    ctx.lineTo(CRATE_R - 12, CRATE_B - 8);
    ctx.stroke();

    // Gold star badge.
    this.drawStar(ctx, 755, 1408, 28, GOLD, 1);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Front rim.
    ctx.fillStyle = WOOD_DEEP;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(CRATE_L - 4, CRATE_T - 8, CRATE_R - CRATE_L + 8, 20, 6);
    ctx.fill();
    ctx.stroke();
  }

  private drawStack(ctx: CanvasRenderingContext2D, t: number) {
    const remaining = PLATE_STICKS.filter((s) => t < s.placed - 0.45);
    if (remaining.length === 0) return;
    // Bottom first so the top plate reads last.
    const ordered = [...remaining].reverse();
    ordered.forEach((s, k) => {
      const y = STACK_BOTTOM - k * STACK_STEP;
      this.drawPlate(
        ctx,
        STACK_X + Math.sin(k * 2.1) * 2,
        y,
        STACK_R,
        s.color,
        k * 1.7,
        0,
        0.26,
        1
      );
    });
  }

  // ----------------------------------------------------------------- plates

  private drawMountedPlates(ctx: CanvasRenderingContext2D, t: number) {
    PLATE_STICKS.forEach((s, i) => {
      if (t < s.placed) return;
      if (i === 0 && t >= FALL_START) return;
      let x = s.x;
      let y = s.plateY;
      let tilt = Math.sin(t * 2.4 + i * 1.3) * 0.035;

      // The whole row shivers while he balances it.
      if (t > 16.85 && t < 17.45) {
        const u = Math.sin(((t - 16.85) / 0.6) * Math.PI);
        x += Math.sin(t * 21 + i) * 6 * u;
        y += Math.cos(t * 17 + i * 2) * 3 * u;
        tilt += Math.sin(t * 19 + i) * 0.14 * u;
      }

      // Plate 0 gets the big, readable wobble before it slips.
      if (i === 0 && t > 19.4) {
        const w = smooth(clamp((t - 19.4) / 1.65, 0, 1));
        x += Math.sin(t * 19) * 8 * w;
        y += Math.cos(t * 23) * 5 * w;
        tilt += Math.sin(t * 17) * 0.1 * w + w * w * 0.28;
      }

      const spin = (t - s.placed) * (7.5 + i * 0.4);
      this.drawPlate(ctx, x, y, s.r, s.color, spin, tilt, 0.34, 1);

      // Speed arcs on fast spinners.
      if (i < 3 || (t > 15.7 && t < 18)) {
        this.drawWhirr(ctx, x, y, s.r, 0.22);
      }
    });
  }

  private drawWhirr(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x, y + 2, r * 0.86, side < 0 ? Math.PI * 0.72 : Math.PI * 1.62, side < 0 ? Math.PI * 1.28 : Math.PI * 2.18);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawPlate(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    color: string,
    spin: number,
    tilt: number,
    squash: number,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;

    // Bottom edge of the plate for a little thickness.
    ctx.save();
    ctx.translate(x, y + Math.max(4, r * 0.1));
    ctx.rotate(tilt);
    ctx.scale(1, squash);
    ctx.fillStyle = '#e6e0d6';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Top face.
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(1, squash);
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.83, 0, TAU);
    ctx.fill();

    // Rotating white streaks make the spin readable.
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = Math.max(4, r * 0.11);
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const a = spin + (i * TAU) / 3;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.58, a, a + 0.62);
      ctx.stroke();
    }

    // Centre hub.
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  /** Position of a plate while it flies from the crate to its stick. */
  private flightPoint(s: StickDef, i: number, t: number): Pt | null {
    const start = s.placed - 0.45;
    if (t < start || t > s.placed) return null;
    const u = clamp((t - start) / 0.45, 0, 1);
    const a = { x: 720, y: 1180 };
    const c = { x: s.x, y: s.plateY };
    const lift = Math.max(90, (a.y - c.y) * 0.5 + 80);
    const b = {
      x: (a.x + c.x) / 2 + (i % 2 === 0 ? 26 : -26),
      y: Math.min(a.y, c.y) - lift,
    };
    return bezier(a, b, c, u);
  }

  private drawFlyingPlates(ctx: CanvasRenderingContext2D, t: number) {
    PLATE_STICKS.forEach((s, i) => {
      if (i === 0 && t >= FALL_START) return;
      const p = this.flightPoint(s, i, t);
      if (!p) return;
      const u = clamp((t - (s.placed - 0.45)) / 0.45, 0, 1);
      const spin = u * 16 + i * 1.4;
      // Faint trail behind the plate.
      const prev = this.flightPoint(s, i, Math.max(s.placed - 0.45, t - 0.05));
      if (prev) {
        ctx.save();
        ctx.globalAlpha = 0.18;
        this.drawPlate(ctx, prev.x, prev.y, s.r * 0.92, s.color, spin - 1, 0.2, 0.3, 1);
        ctx.restore();
      }
      this.drawPlate(ctx, p.x, p.y, lerp(s.r * 0.92, s.r, u), s.color, spin, 0.12, 0.3, 1);
    });
  }

  /** The single plate that slips off and lands on the beanie. */
  private drawFallenPlate(
    ctx: CanvasRenderingContext2D,
    t: number,
    pose: Pose,
    hipX: number,
    hipY: number
  ) {
    if (t < FALL_START) return;
    const head = this.headPoint(pose, hipX, hipY);
    if (t >= LAND_TIME) {
      const u = clamp((t - LAND_TIME) / 0.22, 0, 1);
      const bob = Math.sin(u * Math.PI) * 8;
      const landingY = head.y - 128 + bob;
      this.drawPlate(
        ctx,
        head.x,
        landingY,
        52,
        PLATE_STICKS[0].color,
        (t - 4.92) * 7.8,
        Math.sin(t * 5) * 0.04,
        0.32,
        1
      );
      this.drawWhirr(ctx, head.x, landingY, 52, 0.3);
      return;
    }

    const x = keyAt(
      [
        [FALL_START, 660],
        [21.35, 700],
        [21.7, 668],
        [22.05, 606],
        [22.4, 560],
        [23.0, 548],
        [23.45, 538],
        [23.85, 540],
        [LAND_TIME, head.x],
      ],
      t
    );
    const y = keyAt(
      [
        [FALL_START, 1000],
        [21.35, 905],
        [21.7, 815],
        [22.05, 755],
        [22.4, 725],
        [23.0, 716],
        [23.45, 732],
        [23.85, 806],
        [LAND_TIME, head.y - 128],
      ],
      t
    );
    const spin = (t - 4.92) * 8.4;
    const squash = t < 21.6 ? 0.34 : 0.3;
    // Motion ghosts along the path.
    const gx = keyAt(
      [
        [FALL_START, 660],
        [21.35, 700],
        [21.7, 668],
        [22.05, 606],
        [22.4, 560],
        [23.0, 548],
        [23.45, 538],
        [23.85, 540],
        [LAND_TIME, head.x],
      ],
      Math.max(FALL_START, t - 0.06)
    );
    const gy = keyAt(
      [
        [FALL_START, 1000],
        [21.35, 905],
        [21.7, 815],
        [22.05, 755],
        [22.4, 725],
        [23.0, 716],
        [23.45, 732],
        [23.85, 806],
        [LAND_TIME, head.y - 128],
      ],
      Math.max(FALL_START, t - 0.06)
    );
    ctx.save();
    ctx.globalAlpha = 0.16;
    this.drawPlate(ctx, gx, gy, 52, PLATE_STICKS[0].color, spin - 0.8, 0.18, squash, 1);
    ctx.restore();
    this.drawPlate(ctx, x, y, 52, PLATE_STICKS[0].color, spin, 0.12, squash, 1);
    this.drawWhirr(ctx, x, y, 52, 0.28);
  }

  private drawEffects(
    ctx: CanvasRenderingContext2D,
    t: number,
    hipX: number,
    hipY: number,
    pose: Pose
  ) {
    // A little twinkle on the sign when he notices it.
    if (t > 1.9 && t < 2.9) {
      const u = clamp((t - 1.9) / 1.0, 0, 1);
      ctx.save();
      ctx.globalAlpha = Math.sin(u * Math.PI);
      this.drawStar(ctx, 780, 250, 18 + u * 10, '#fff6c9', 1);
      this.drawStar(ctx, 300, 370, 12 + u * 8, '#fff6c9', 1);
      ctx.restore();
    }

    // Wobble alarm lines beside the problem plate.
    if (t > 19.9 && t < FALL_START) {
      const u = clamp((t - 19.9) / 1.1, 0, 1);
      ctx.save();
      ctx.globalAlpha = 0.55 + Math.sin(t * 20) * 0.2;
      ctx.strokeStyle = '#e63946';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const a = -0.9 + i * 0.5;
        ctx.beginPath();
        ctx.moveTo(660 + Math.cos(a) * (74 + u * 8), 1000 + Math.sin(a) * (74 + u * 8));
        ctx.lineTo(660 + Math.cos(a) * (98 + u * 14), 1000 + Math.sin(a) * (98 + u * 14));
        ctx.stroke();
      }
      ctx.restore();
    }

    // Sweat drop while he watches the plate.
    if (t > 21.2 && t < 24.2) {
      const head = this.headPoint(pose, hipX, hipY);
      const u = clamp((t - 21.2) / 0.6, 0, 1);
      const dropY = head.y - 58 + ((t - 21.2) % 1.1) * 16;
      ctx.save();
      ctx.globalAlpha = 0.85 * Math.min(1, u);
      ctx.fillStyle = '#4cc9f0';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(head.x + 58, dropY - 18);
      ctx.quadraticCurveTo(head.x + 72, dropY, head.x + 58, dropY + 8);
      ctx.quadraticCurveTo(head.x + 44, dropY, head.x + 58, dropY - 18);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Landing burst on the beanie.
    if (t > LAND_TIME && t < LAND_TIME + 0.95) {
      const head = this.headPoint(pose, hipX, hipY);
      const u = clamp((t - LAND_TIME) / 0.95, 0, 1);
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(head.x, head.y - 128, 70 + u * 60, 24 + u * 24, 0, 0, TAU);
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + 0.3;
        const d = 76 + u * 58;
        this.drawStar(
          ctx,
          head.x + Math.cos(a) * d,
          head.y - 128 + Math.sin(a) * d * 0.45,
          8 + (1 - u) * 5,
          i % 2 === 0 ? GOLD_LIGHT : '#ffffff',
          1
        );
      }
      ctx.restore();
    }

    // Final sparkle around the record plate.
    if (t > 27.3) {
      const head = this.headPoint(pose, hipX, hipY);
      const pulse = 0.55 + Math.sin(t * 6) * 0.4;
      ctx.save();
      ctx.globalAlpha = clamp(pulse, 0, 1);
      this.drawStar(ctx, head.x - 70, head.y - 146, 12, GOLD_LIGHT, 1);
      this.drawStar(ctx, head.x + 78, head.y - 132, 9, '#ffffff', 1);
      ctx.restore();
    }
  }

  // -------------------------------------------------------------- character

  private charX(t: number): number {
    return keyAt(
      [
        [0, 205],
        [0.35, 235],
        [1.55, 540],
        [4.25, 540],
        [4.55, 548],
        [30, 548],
      ],
      t
    );
  }

  private charHop(t: number): number {
    const hop = (a: number, b: number, h: number) =>
      t >= a && t < b ? h * Math.sin(((t - a) / (b - a)) * Math.PI) : 0;
    return hop(18.15, 18.5, 26) + hop(18.62, 18.9, 20);
  }

  private defaultPose(x: number): Pose {
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
      handL: { x: x - 82, y: 1205 },
      handR: { x: x + 82, y: 1205 },
      bendL: 1,
      bendR: 1,
      fistL: false,
      fistR: false,
      pointR: false,
      fingerR: false,
      gripL: false,
      gripR: false,
      beanieOn: true,
    };
  }

  private poseAt(t: number, x: number): Pose {
    const p = this.defaultPose(x);
    const h = (dx: number, y: number): Pt => ({ x: x + dx, y });
    p.headTurn = 3;

    if (t < 6.0) {
      // Shot 1 - the challenge.
      if (t < 1.7) {
        p.legs = 'walk';
        p.walkPhase = t * 11;
        p.look = 'right';
        p.brow = 'normal';
        p.eye = 'open';
        p.mouth = 'flat';
        p.handL = h(-96 + Math.sin(t * 11) * 30, 1190 - Math.cos(t * 11) * 22);
        p.handR = h(96 - Math.sin(t * 11) * 30, 1190 + Math.cos(t * 11) * 22);
      } else if (t < 2.5) {
        p.look = 'up';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = -5;
        p.handL = h(-78, 1195);
        p.handR = h(78, 1195);
      } else if (t < 3.3) {
        p.look = 'front';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.03;
        p.fistL = true;
        p.fistR = true;
        p.handL = h(-74, 1140);
        p.handR = h(74, 1140);
      } else if (t < 4.22) {
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'flat';
        p.headTurn = 8;
        p.lean = 0.05;
        p.handR = h(196, 1190);
        p.bendR = 1;
        p.handL = h(-62, 1195);
      } else if (t < 4.5) {
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'open';
        p.mouth = 'smile';
        p.headTurn = 6;
        p.handR = h(150, 1110);
        p.handL = h(-70, 1195);
      } else if (t < 4.92) {
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'grin';
        p.headTurn = 7;
        p.handR = h(132, 1028);
        p.handL = h(-66, 1180);
      } else {
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'grin';
        p.headTurn = 7;
        p.handL = h(-82, 1180);
        p.handR = h(96, 1140);
      }
    } else if (t < 12.0) {
      // Shot 2 - three plates.
      if (t < 6.55) {
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'open';
        p.mouth = 'smile';
        p.headTurn = 6;
        p.handL = h(-80, 1195);
        p.handR = h(86, 1180);
      } else if (t < 6.82) {
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'flat';
        p.headTurn = 7;
        p.lean = 0.04;
        p.handR = h(196, 1210);
        p.handL = h(-64, 1190);
      } else if (t < 7.05) {
        p.look = 'left';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.handR = h(10, 1085);
        p.handL = h(-74, 1180);
      } else if (t < 8.6) {
        p.look = 'left';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'grin';
        p.handL = h(-92, 1170);
        p.handR = h(84, 1180);
      } else if (t < 8.9) {
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'flat';
        p.headTurn = 6;
        p.lean = 0.04;
        p.handR = h(196, 1200);
        p.handL = h(-62, 1190);
      } else if (t < 9.25) {
        p.look = 'up';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.handR = h(6, 1010);
        p.handL = h(-70, 1170);
      } else if (t < 10.3) {
        p.look = 'up';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = -6;
        p.handL = h(-80, 1170);
        p.handR = h(82, 1170);
      } else {
        p.look = 'front';
        p.brow = 'cocky';
        p.eye = 'open';
        p.mouth = 'smirk';
        p.headTilt = -4;
        p.headDrop = -3;
        p.handL = h(-66, 1248);
        p.handR = h(66, 1248);
      }
    } else if (t < 18.0) {
      // Shot 3 - ten plates, added one by one.
      const flicks = [12.25, 12.75, 13.25, 13.75, 14.25, 14.75, 15.25];
      let flicking = false;
      for (let i = 0; i < flicks.length; i++) {
        const ft = flicks[i];
        if (t >= ft - 0.26 && t < ft) {
          flicking = true;
          p.look = i % 2 === 0 ? 'right' : 'left';
          p.brow = 'determined';
          p.eye = 'squint';
          p.mouth = 'grit';
          p.headTurn = i % 2 === 0 ? 7 : -7;
          // Reach for the next plate in the crate.
          p.handR = h(196, 1205);
          p.bendR = 1;
          p.handL = h(-64, 1190);
        } else if (t >= ft && t < ft + 0.1) {
          flicking = true;
          p.look = i < 2 ? 'right' : i % 2 === 0 ? 'right' : 'left';
          p.brow = 'determined';
          p.eye = 'squint';
          p.mouth = 'grin';
          p.headTurn = i % 2 === 0 ? 6 : -6;
          p.handR = h(i % 2 === 0 ? 96 : -8, 1018);
          p.handL = h(-64, 1180);
        }
      }

      if (!flicking) {
        if (t < 15.8) {
          p.look = 'up';
          p.brow = 'raised';
          p.eye = 'wide';
          p.mouth = 'o';
          p.headDrop = -4;
          p.handL = h(-74, 1160);
          p.handR = h(86, 1160);
        } else if (t < 16.85) {
          p.look = 'left';
          p.brow = 'determined';
          p.eye = 'wide';
          p.mouth = 'grit';
          p.headTurn = -3;
          p.handL = h(-188, 1030 + Math.sin(t * 7) * 12);
          p.handR = h(188, 1030 - Math.sin(t * 7) * 12);
        } else if (t < 17.3) {
          p.look = 'right';
          p.brow = 'raised';
          p.eye = 'wide';
          p.mouth = 'o';
          p.headTurn = 3;
          p.handL = h(-196, 1000 + Math.sin(t * 15) * 8);
          p.handR = h(196, 1000 - Math.sin(t * 15) * 8);
        } else {
          p.look = 'front';
          p.brow = 'cocky';
          p.eye = 'happy';
          p.mouth = 'grin';
          p.headDrop = -7;
          p.lean = -0.03;
          p.handL = h(-158, 1010);
          p.handR = h(158, 1010);
        }
      }
    } else if (t < 24.0) {
      // Shot 4 - the wobble and the flight.
      if (t < 19.3) {
        p.look = 'front';
        p.brow = 'raised';
        p.eye = 'happy';
        p.mouth = 'grin';
        p.headDrop = -6;
        p.handL = h(-160, 960);
        p.handR = h(160, 960);
      } else if (t < 19.9) {
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 8;
        p.handL = h(-130, 1050);
        p.handR = h(130, 1040);
      } else if (t < 20.35) {
        p.look = 'right';
        p.brow = 'sad';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 9;
        p.lean = 0.05;
        p.handL = h(-112, 1070);
        p.handR = h(140, 1015);
      } else if (t < FALL_START) {
        p.look = 'right';
        p.brow = 'sad';
        p.eye = 'wide';
        p.mouth = 'grit';
        p.headTurn = 9;
        p.lean = 0.07;
        p.handL = h(-100, 1080);
        p.handR = h(148, 1002);
      } else if (t < 21.6) {
        p.look = 'up';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = -9;
        p.handL = h(-126, 1030);
        p.handR = h(132, 1000);
      } else if (t < 22.5) {
        p.look = 'up';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = -12;
        p.handL = h(-120, 1050);
        p.handR = h(126, 1040);
      } else {
        p.look = 'up';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = -12;
        p.headTilt = Math.sin(t * 18) * 2;
        p.handL = h(-100, 1130);
        p.handR = h(104, 1120);
      }
    } else {
      // Shot 5 - the new world record.
      if (t < 24.55) {
        p.look = 'up';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = -11;
        p.handL = h(-92, 1180);
        p.handR = h(92, 1180);
      } else if (t < 26.2) {
        p.look = 'up';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'flat';
        p.headDrop = -12;
        p.handL = h(-88, 1200);
        p.handR = h(88, 1200);
      } else if (t < 27.4) {
        const u = smooth(clamp((t - 26.2) / 1.2, 0, 1));
        p.look = 'up';
        p.brow = 'cocky';
        p.eye = 'open';
        p.mouth = 'smirk';
        p.headDrop = -10;
        p.handL = h(-88, 1200);
        p.handR = lerpPt(h(88, 1200), h(76, 1062), u);
        p.bendR = 1;
        p.fingerR = u > 0.45;
      } else {
        p.look = 'up';
        p.brow = 'cocky';
        p.eye = 'open';
        p.mouth = 'smirk';
        p.headDrop = -9;
        p.headTilt = 2;
        p.handL = h(-86, 1195);
        p.handR = h(76, 1052);
        p.bendR = 1;
        p.fingerR = true;
      }
    }

    // Derive grip states - right hand grips when picking up plates
    p.gripR = (t >= 3.2 && t < 4.9) || (t >= 6.4 && t < 7.0) || (t >= 8.6 && t < 9.2) ||
              (t >= 12.1 && t < 15.7);
    // Left hand rarely grips
    p.gripL = false;

    return p;
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
      pose: pose.gripR ? 'grip' : pose.fistR ? 'fist' : pose.pointR ? 'point' : pose.fingerR ? 'point' : 'relaxed',
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

    const squash =
      t > LAND_TIME && t < LAND_TIME + 0.32
        ? Math.sin(((t - LAND_TIME) / 0.32) * Math.PI) * 5
        : 0;
    if (pose.beanieOn) this.drawBeanie(ctx, cx, cy + squash * 0.5);

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
    ctx.beginPath();
    if (pose.brow === 'angry' || pose.brow === 'determined') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY + 8);
      ctx.moveTo(fx + 42, browY - 8);
      ctx.lineTo(fx + 12, browY + 8);
    } else if (pose.brow === 'raised') {
      ctx.moveTo(fx - 42, browY - 12);
      ctx.lineTo(fx - 12, browY - 10);
      ctx.moveTo(fx + 42, browY - 12);
      ctx.lineTo(fx + 12, browY - 10);
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

  private drawShadow(ctx: CanvasRenderingContext2D, x: number, hipY: number, hop: number) {
    const lift = clamp(hop / 26, 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.16 * (1 - lift * 0.5);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(x, this.floorY + 6, 78 - lift * 12, 15 - lift * 3, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    void hipY;
  }

  private drawCaptions(ctx: CanvasRenderingContext2D, t: number) {
    const line = this.captions.find((c) => t >= c.from && t < c.to);
    if (!line) return;

    const u = clamp((t - line.from) / 0.12, 0, 1);
    const fade = Math.min(1, (line.to - t) / 0.2);
    const alpha = clamp(Math.min((t - line.from) / 0.05, fade), 0, 1);
    if (alpha <= 0) return;

    const scale = 1 - (1 - u) * 0.22 + Math.sin(u * Math.PI) * 0.1;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(WIDTH / 2, 470);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    let size = 76;
    ctx.font = heavy(size);
    const width = ctx.measureText(line.text).width;
    if (width > 950) {
      size = Math.max(42, Math.floor((size * 950) / width));
      ctx.font = heavy(size);
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(13, size * 0.26);
    ctx.strokeText(line.text, 0, 0);
    ctx.fillStyle = WHITE;
    ctx.fillText(line.text, 0, 0);
    ctx.restore();
  }
}
