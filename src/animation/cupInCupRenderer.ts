import type { StudioConfig } from '../types';
import { drawHand, HandStyle } from './handRenderer';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

const INK = '#17121f';
const WHITE = '#ffffff';
const CREAM = '#fff4e2';
const CREAM_DEEP = '#ffe6c8';
const WALL_BLUE = '#2d6cdf';
const WALL_BLUE_DEEP = '#1a4bc9';
const WALL_BLUE_LIGHT = '#5a8ff0';
const FLOOR = '#2a2a2a';
const FLOOR_LINE = '#3d3d3d';
const TABLE = '#1a7a3e';
const TABLE_DEEP = '#145a2c';
const TABLE_LINE = '#0f4521';
const BLUE_CUP = '#2196f3';
const BLUE_CUP_DEEP = '#1565c0';
const BLUE_CUP_LIGHT = '#64b5f6';
const RED_CUP = '#e63946';
const RED_CUP_DEEP = '#b3222e';
const RED_CUP_LIGHT = '#ff6b6b';
const BALL_WHITE = '#ffffff';
const BALL_SHINE = '#e0e0e0';
const TOWER_COLORS = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff8c42', '#b06bff', '#4cc9f0', '#f15bb5',
];

const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const SHIRT = '#ffd166';
const TROUSER = '#2f5fa8';
const TROUSER_DEEP = '#22457c';
const SHOE = '#141414';

const FLOOR_Y = 1580;
const HIP_Y = 1280;
const HEAD_R = 70;

const TABLE_Y = 1160;
const TABLE_L = 110;
const TABLE_R = 1010;
const TABLE_H = 80;
const TABLE_TOP = TABLE_Y - TABLE_H / 2;

const BLUE_CUP_X = 700;
const BLUE_CUP_Y = TABLE_TOP;
const BLUE_CUP_R = 46;
const BLUE_CUP_BASE_R = 34;
const BLUE_CUP_H = 88;
const BLUE_CUP_MOUTH_RY = 15;

const RED_CUP_X = 700;
const RED_CUP_Y = TABLE_TOP;
const RED_CUP_R = 30;
const RED_CUP_BASE_R = 22;
const RED_CUP_H = 104;
const RED_CUP_MOUTH_RY = 10;

const BALL_R = 15;
const REL_X = 600;
const REL_Y = 990;

const AVALANCHE_START = 24.5;
const AVALANCHE_END = 29.5;
const CHAR_X = 510;

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
  legs: 'stand' | 'walk' | 'kneel';
  walkPhase: number;
  handL: Pt;
  handR: Pt;
  bendL: 1 | -1;
  bendR: 1 | -1;
  fistL: boolean;
  fistR: boolean;
  pointL: boolean;
  pointR: boolean;
  holdBallR: boolean;
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

interface BallState {
  x: number;
  y: number;
  visible: boolean;
  spin: number;
  trail: Pt[];
  mode: 'air' | 'blue' | 'red';
}

interface TowerCup {
  x0: number;
  y0: number;
  tx: number;
  ty: number;
  r: number;
  color: string;
  delay: number;
  dur: number;
  spin: number;
  arc: number;
  tilt: number;
}

const CAPTIONS: CaptionLine[] = [
  { text: 'ONE BALL. TWO CUPS. IMPOSSIBLE!', from: 0.35, to: 5.8 },
  { text: 'NOT EVEN CLOSE!', from: 6.2, to: 11.85 },
  { text: 'SO CLOSE… WRONG CUP!', from: 12.2, to: 17.85 },
  { text: 'CUP-IN-CUP! PERFECT!', from: 18.2, to: 23.85 },
  { text: 'HE WON… THEN LOST EVERYTHING! 😂', from: 24.2, to: 29.75 },
];

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 540, y: 1000, zoom: 0.96 },
  { t: 1.5, x: 540, y: 1000, zoom: 0.96 },
  { t: 2.2, x: 585, y: 1010, zoom: 1.06 },
  { t: 5.8, x: 585, y: 1010, zoom: 1.06 },
  { t: 6.4, x: 610, y: 1020, zoom: 1.16 },
  { t: 8.0, x: 620, y: 1030, zoom: 1.22 },
  { t: 9.0, x: 560, y: 1000, zoom: 1.02 },
  { t: 12.0, x: 560, y: 1000, zoom: 1.02 },
  { t: 12.6, x: 575, y: 1040, zoom: 1.14 },
  { t: 13.2, x: 640, y: 1030, zoom: 1.24 },
  { t: 15.2, x: 680, y: 1030, zoom: 1.42 },
  { t: 16.4, x: 670, y: 1030, zoom: 1.5 },
  { t: 17.2, x: 580, y: 1000, zoom: 1.02 },
  { t: 18.0, x: 610, y: 1030, zoom: 1.16 },
  { t: 19.3, x: 585, y: 1000, zoom: 1.08 },
  { t: 20.0, x: 620, y: 1020, zoom: 1.2 },
  { t: 21.2, x: 670, y: 1030, zoom: 1.36 },
  { t: 22.4, x: 690, y: 1028, zoom: 1.52 },
  { t: 23.4, x: 640, y: 1005, zoom: 1.18 },
  { t: 24.4, x: 560, y: 1000, zoom: 1.04 },
  { t: 25.4, x: 540, y: 1060, zoom: 1.0 },
  { t: 26.6, x: 520, y: 1130, zoom: 1.02 },
  { t: 27.6, x: 510, y: 1110, zoom: 1.1 },
  { t: 28.6, x: 510, y: 1040, zoom: 1.3 },
  { t: 29.4, x: 510, y: 1000, zoom: 1.45 },
  { t: 30.0, x: 510, y: 990, zoom: 1.55 },
];

const TOWER_BASE_X = 210;
const TOWER_BASE_Y = TABLE_TOP;

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
function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (c: number) =>
    amount < 0 ? Math.round(c * (1 + amount)) : Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}
function lerpPt(a: Pt, b: Pt, u: number): Pt {
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
}
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
const heavy = (size: number) =>
  `900 ${size}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;

const TOWER_ROWS = 9;
const TOWER_COLS = 4;
const TOWER_CUP_R = 26;
const TOWER_CUP_H = 62;
const TOWER_ROW_GAP = 58;
const TOWER_COL_GAP = 52;
const TOWER_BASE_CX = 240;

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// The tower has 36 cups. The avalanche stacks them into an eight-row pyramid
// that buries the stickman up to the chin.
const PILE_SLOTS: { x: number; y: number; row: number }[] = [];
for (let row = 0; row < 8; row++) {
  const count = 8 - row;
  for (let col = 0; col < count; col++) {
    PILE_SLOTS.push({
      x: CHAR_X + (col - (count - 1) / 2) * 54,
      y: FLOOR_Y - row * TOWER_ROW_GAP,
      row,
    });
  }
}

const TOWER_CUPS: TowerCup[] = [];
for (let row = 0; row < TOWER_ROWS; row++) {
  for (let col = 0; col < TOWER_COLS; col++) {
    const i = row * TOWER_COLS + col;
    const slot = PILE_SLOTS[i];
    TOWER_CUPS.push({
      x0: TOWER_BASE_CX + (col - (TOWER_COLS - 1) / 2) * TOWER_COL_GAP,
      y0: TOWER_BASE_Y - row * TOWER_ROW_GAP,
      tx: slot.x + (hash(i + 1) - 0.5) * 10,
      ty: slot.y,
      r: TOWER_CUP_R,
      color: TOWER_COLORS[i % TOWER_COLORS.length],
      delay: 25.0 + slot.row * 0.12 + hash(i + 7) * 0.07,
      dur: 0.55 + hash(i + 9) * 0.22,
      spin: (hash(i + 3) - 0.5) * 7,
      arc: 80 + hash(i + 5) * 110,
      tilt: (hash(i + 11) - 0.5) * 0.55,
    });
  }
}

export class CupInCupRenderer {
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
    this.drawRoom(ctx);
    this.drawTable(ctx);
    this.drawTower(ctx, t);
    this.drawTargetCups(ctx, t);

    const x = this.charX(t);
    const hipY = this.hipY;
    const pose = this.poseAt(t, x);
    const arms = this.computeArms(pose, x, hipY);

    this.drawShadow(ctx, x, hipY, 0);
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'body');
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'head');
    this.drawBall(ctx, t, arms.r.hx, arms.r.hy);
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'hands');

    this.drawAvalancheOverlay(ctx, t);
    this.restoreCamera(ctx);

    this.drawCaptions(ctx, t);
    ctx.restore();
  }

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
      t > AVALANCHE_END - 0.5 && t < AVALANCHE_END
        ? ((AVALANCHE_END - t) / 0.5) * 6
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

  private drawRoom(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = FLOOR;
    ctx.fillRect(-200, 1400, WIDTH + 400, 520);
    for (let i = 0; i < 8; i++) {
      const y = 1400 + i * 68;
      ctx.fillStyle = i % 2 === 0 ? FLOOR : '#333333';
      ctx.fillRect(-200, y, WIDTH + 400, 68);
      ctx.strokeStyle = FLOOR_LINE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-200, y);
      ctx.lineTo(WIDTH + 200, y);
      ctx.stroke();
    }

    ctx.fillStyle = WALL_BLUE_DEEP;
    ctx.fillRect(-200, 150, WIDTH + 400, 1250);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.strokeRect(-200, 150, WIDTH + 400, 1250);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= WIDTH; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 150);
      ctx.lineTo(x, 1400);
      ctx.stroke();
    }
    for (let y = 180; y <= 1380; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }

    for (let i = 0; i < 6; i++) {
      const lx = 90 + i * 180;
      ctx.fillStyle = '#fffbe8';
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(lx, 100, 20, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  private drawTable(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = TABLE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(TABLE_L, TABLE_Y - TABLE_H / 2, TABLE_R - TABLE_L, TABLE_H, 12);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(540, TABLE_Y - TABLE_H / 2);
    ctx.lineTo(540, TABLE_Y + TABLE_H / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#2eb852';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(TABLE_L, TABLE_Y - TABLE_H / 2);
    ctx.lineTo(TABLE_R, TABLE_Y - TABLE_H / 2);
    ctx.stroke();

    ctx.fillStyle = '#1a1a1a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    for (const lx of [TABLE_L + 20, TABLE_R - 20]) {
      ctx.beginPath();
      ctx.roundRect(lx - 12, TABLE_Y + TABLE_H / 2, 24, 200, 6);
      ctx.fill();
      ctx.stroke();
    }
  }

  private drawCup(
    ctx: CanvasRenderingContext2D,
    cx: number,
    baseY: number,
    baseHalf: number,
    rimHalf: number,
    height: number,
    rimRy: number,
    color: string,
    deep: string,
    light: string,
    lineWidth: number,
    frontOnly = false
  ) {
    const rimY = baseY - height;

    // Tapered body with a rounded front base.
    ctx.beginPath();
    ctx.moveTo(cx - rimHalf, rimY);
    ctx.lineTo(cx - baseHalf, baseY);
    ctx.quadraticCurveTo(cx, baseY + 7, cx + baseHalf, baseY);
    ctx.lineTo(cx + rimHalf, rimY);
    ctx.ellipse(cx, rimY, rimHalf, rimRy, 0, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = lineWidth;
    ctx.fill();
    ctx.stroke();

    // Left-side sheen.
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = light;
    const sheen = Math.max(3, (rimHalf - baseHalf) * 0.45);
    ctx.beginPath();
    ctx.roundRect(
      cx - rimHalf * 0.62,
      rimY + height * 0.24,
      sheen * 1.9,
      height * 0.46,
      sheen
    );
    ctx.fill();
    ctx.restore();

    if (frontOnly) return;

    // Mouth.
    ctx.beginPath();
    ctx.ellipse(cx, rimY, rimHalf, rimRy, 0, 0, TAU);
    ctx.fillStyle = deep;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = lineWidth * 0.7;
    ctx.stroke();

    // Inner rim highlight.
    ctx.strokeStyle = light;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = Math.max(2, lineWidth * 0.55);
    ctx.beginPath();
    ctx.ellipse(cx, rimY + 1, rimHalf - 5, rimRy * 0.55, 0, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Rim lip.
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(3, lineWidth * 0.8);
    ctx.beginPath();
    ctx.ellipse(cx, rimY, rimHalf - 2, rimRy * 0.55, 0, 0, Math.PI, false);
    ctx.stroke();
  }

  private drawTargetCups(ctx: CanvasRenderingContext2D, t: number) {
    // Contact shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(BLUE_CUP_X, TABLE_TOP + 3, BLUE_CUP_R * 1.15, 8, 0, 0, TAU);
    ctx.fill();

    // Blue cup.
    this.drawCup(
      ctx,
      BLUE_CUP_X,
      BLUE_CUP_Y,
      BLUE_CUP_BASE_R,
      BLUE_CUP_R,
      BLUE_CUP_H,
      BLUE_CUP_MOUTH_RY,
      BLUE_CUP,
      BLUE_CUP_DEEP,
      BLUE_CUP_LIGHT,
      5
    );

    // Red cup nested upright inside, its rim peeking above the blue mouth.
    this.drawCup(
      ctx,
      RED_CUP_X,
      RED_CUP_Y,
      RED_CUP_BASE_R,
      RED_CUP_R,
      RED_CUP_H,
      RED_CUP_MOUTH_RY,
      RED_CUP,
      RED_CUP_DEEP,
      RED_CUP_LIGHT,
      4.5
    );

    // The blue front wall sits in front of the red cup's lower body, so the
    // red cup reads as being inside the blue cup instead of stuck on it.
    this.drawCup(
      ctx,
      BLUE_CUP_X,
      BLUE_CUP_Y,
      BLUE_CUP_BASE_R,
      BLUE_CUP_R,
      BLUE_CUP_H,
      BLUE_CUP_MOUTH_RY,
      BLUE_CUP,
      BLUE_CUP_DEEP,
      BLUE_CUP_LIGHT,
      5,
      true
    );

    // Wobble while the tower comes down.
    if (t > 24.0) {
      const wobble = Math.sin(t * 26) * 3 * clamp((t - 24.0) / 0.8, 0, 1);
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(
        BLUE_CUP_X + wobble,
        BLUE_CUP_Y - BLUE_CUP_H,
        BLUE_CUP_R + 6,
        BLUE_CUP_MOUTH_RY + 3,
        0,
        0,
        TAU
      );
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawTower(ctx: CanvasRenderingContext2D, t: number) {
    for (const cup of TOWER_CUPS) {
      if (t >= cup.delay) continue; // launched / piled
      const wobble =
        t > AVALANCHE_START
          ? Math.sin(t * 28 + cup.y0 * 0.08) *
            clamp((t - AVALANCHE_START) / 0.7, 0, 1) *
            5
          : 0;
      this.drawCup(
        ctx,
        cup.x0 + wobble,
        cup.y0,
        cup.r,
        cup.r * 1.06,
        TOWER_CUP_H,
        cup.r * 0.28,
        cup.color,
        shade(cup.color, -0.32),
        shade(cup.color, 0.25),
        4
      );
    }
  }

  private drawBall(
    ctx: CanvasRenderingContext2D,
    t: number,
    handX: number,
    handY: number
  ) {
    const ball = this.ballAt(t, handX, handY);
    if (!ball.visible) return;

    const flying =
      (t >= 6.5 && t < 8.3) || (t >= 13.0 && t < 15.2) || (t >= 20.0 && t < 22.5);

    const paint = (x: number, y: number, spin: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(spin);
      ctx.fillStyle = BALL_WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, BALL_R, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-BALL_R, 0);
      ctx.lineTo(BALL_R, 0);
      ctx.stroke();
      ctx.fillStyle = BALL_SHINE;
      ctx.beginPath();
      ctx.arc(-5, -5, 4, 0, TAU);
      ctx.fill();
      ctx.restore();
    };

    if (ball.mode === 'air') {
      if (flying) {
        for (let i = 5; i >= 1; i--) {
          const past = this.ballAt(t - i * 0.035, handX, handY);
          if (!past.visible) continue;
          ctx.globalAlpha = 0.16 * (1 - i / 6);
          ctx.fillStyle = WHITE;
          ctx.beginPath();
          ctx.arc(past.x, past.y, BALL_R * (1 - i * 0.07), 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (ball.y > 1030) {
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(ball.x, TABLE_TOP + 2, BALL_R * 1.3, 5, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      paint(ball.x, ball.y, ball.spin);
      return;
    }

    // Resting in a cup: draw the ball, then repaint the cup's front wall so
    // only the part above the rim stays visible.
    paint(ball.x, ball.y, 0);

    if (ball.mode === 'blue') {
      this.drawCup(
        ctx,
        RED_CUP_X,
        RED_CUP_Y,
        RED_CUP_BASE_R,
        RED_CUP_R,
        RED_CUP_H,
        RED_CUP_MOUTH_RY,
        RED_CUP,
        RED_CUP_DEEP,
        RED_CUP_LIGHT,
        4.5,
        true
      );
      this.drawCup(
        ctx,
        BLUE_CUP_X,
        BLUE_CUP_Y,
        BLUE_CUP_BASE_R,
        BLUE_CUP_R,
        BLUE_CUP_H,
        BLUE_CUP_MOUTH_RY,
        BLUE_CUP,
        BLUE_CUP_DEEP,
        BLUE_CUP_LIGHT,
        5,
        true
      );
    } else {
      this.drawCup(
        ctx,
        RED_CUP_X,
        RED_CUP_Y,
        RED_CUP_BASE_R,
        RED_CUP_R,
        RED_CUP_H,
        RED_CUP_MOUTH_RY,
        RED_CUP,
        RED_CUP_DEEP,
        RED_CUP_LIGHT,
        4.5,
        true
      );
    }
  }

  private ballAt(t: number, handX: number, handY: number): BallState {
    const air = (x: number, y: number, spin = 0): BallState => ({
      x,
      y,
      visible: true,
      spin,
      trail: [],
      mode: 'air',
    });
    const inCup = (x: number, y: number, mode: 'blue' | 'red'): BallState => ({
      x,
      y,
      visible: true,
      spin: 0,
      trail: [],
      mode,
    });

    const bez = (a: number, b: number, c: number, u: number) =>
      (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c;

    // Shot 1: he shows the ball, then winds up.
    if (t < 0.9) {
      return { x: 0, y: 0, visible: false, spin: 0, trail: [], mode: 'air' };
    }
    if (t < 6.5) {
      return air(handX, handY);
    }

    // Shot 2: bounce, clang off the outside of the blue rim, fall back.
    if (t < 12.0) {
      if (t < 7.0) {
        const u = clamp((t - 6.5) / 0.5, 0, 1);
        return air(bez(REL_X, 606, 620, u), bez(REL_Y, 1020, 1105, u), u * 12);
      }
      if (t < 7.3) {
        const u = clamp((t - 7.0) / 0.3, 0, 1);
        return air(bez(620, 636, 650, u), bez(1105, 1080, 1040, u), 12 + u * 8);
      }
      if (t < 7.6) {
        const u = clamp((t - 7.3) / 0.3, 0, 1);
        return air(bez(650, 636, 614, u), bez(1040, 995, 968, u), 20 + u * 8);
      }
      if (t < 8.3) {
        const u = clamp((t - 7.6) / 0.7, 0, 1);
        return air(bez(614, 560, 520, u), bez(968, 1040, 1105, u), 28 + u * 12);
      }
      return air(520, 1105, 40);
    }

    // Shot 3: bounce, hop over the blue rim, land beside the red cup.
    if (t < 18.0) {
      if (t < 12.6) return air(520, 1105, 40);
      if (t < 13.0) return air(handX, handY);
      if (t < 13.45) {
        const u = clamp((t - 13.0) / 0.45, 0, 1);
        return air(bez(REL_X, 606, 620, u), bez(REL_Y, 1020, 1105, u), u * 14);
      }
      if (t < 14.0) {
        const u = clamp((t - 13.45) / 0.55, 0, 1);
        return air(bez(620, 640, 662, u), bez(1105, 1045, 1024, u), 14 + u * 12);
      }
      if (t < 14.45) {
        const u = clamp((t - 14.0) / 0.45, 0, 1);
        return air(bez(662, 682, 700, u), bez(1024, 992, 986, u), 26 + u * 8);
      }
      if (t < 15.0) {
        const u = clamp((t - 14.45) / 0.55, 0, 1);
        return air(bez(700, 720, 730, u), bez(986, 1004, 1030, u), 34 + u * 8);
      }
      if (t < 15.2) {
        const u = clamp((t - 15.0) / 0.2, 0, 1);
        return inCup(730, 1030 - Math.sin(u * Math.PI) * 4, 'blue');
      }
      return inCup(730, 1030, 'blue');
    }

    // Shot 4: he plucks the ball out, winds up, and drops it in the red cup.
    if (t < 24.0) {
      if (t < 20.0) return air(handX, handY);
      if (t < 20.5) {
        const u = clamp((t - 20.0) / 0.5, 0, 1);
        return air(bez(REL_X, 606, 620, u), bez(REL_Y, 1020, 1105, u), u * 12);
      }
      if (t < 21.1) {
        const u = clamp((t - 20.5) / 0.6, 0, 1);
        return air(bez(620, 640, 664, u), bez(1105, 1042, 1020, u), 12 + u * 10);
      }
      if (t < 21.6) {
        const u = clamp((t - 21.1) / 0.5, 0, 1);
        return air(bez(664, 682, 696, u), bez(1020, 982, 984, u), 22 + u * 6);
      }
      if (t < 22.2) {
        const u = clamp((t - 21.6) / 0.6, 0, 1);
        return air(bez(696, 699, 700, u), bez(984, 1000, 1012, u), 28 + u * 8);
      }
      if (t < 22.5) {
        const u = clamp((t - 22.2) / 0.3, 0, 1);
        return inCup(700, 1012 - Math.sin(u * Math.PI) * 5, 'red');
      }
      return inCup(700, 1012, 'red');
    }

    // Shot 5: the winning ball rides out the avalanche.
    return inCup(700, 1012, 'red');
  }

  private drawAvalancheOverlay(ctx: CanvasRenderingContext2D, t: number) {
    if (t < AVALANCHE_START) return;

    const bez = (a: number, b: number, c: number, u: number) =>
      (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c;

    for (let i = 0; i < TOWER_CUPS.length; i++) {
      const cup = TOWER_CUPS[i];
      if (t < cup.delay) continue;

      const u = clamp((t - cup.delay) / cup.dur, 0, 1);
      const landT = cup.delay + cup.dur;
      const bounce =
        t >= landT
          ? -Math.sin(clamp((t - landT) / 0.16, 0, 1) * Math.PI) * 5
          : 0;

      let x: number;
      let y: number;
      let angle: number;

      if (u < 1) {
        const ctrlX = (cup.x0 + cup.tx) / 2 + (hash(i + 31) - 0.5) * 190;
        const ctrlY = Math.min(cup.y0, cup.ty) - cup.arc;
        x = bez(cup.x0, ctrlX, cup.tx, u);
        y = bez(cup.y0, ctrlY, cup.ty, u);
        const turns = 1 + Math.floor(hash(i + 17) * 2);
        angle =
          TAU * turns * smooth(u) +
          cup.spin * Math.sin(Math.PI * u) * 0.7 +
          cup.tilt * smooth(u);
      } else {
        x = cup.tx;
        y = cup.ty + bounce;
        angle = cup.tilt;
      }

      // Rotate about the cup's centre so it tumbles instead of pivoting on
      // its base.
      ctx.save();
      ctx.translate(x, y - TOWER_CUP_H / 2);
      ctx.rotate(angle);
      this.drawCup(
        ctx,
        0,
        TOWER_CUP_H / 2,
        cup.r,
        cup.r * 1.06,
        TOWER_CUP_H,
        cup.r * 0.28,
        cup.color,
        shade(cup.color, -0.32),
        shade(cup.color, 0.25),
        4
      );
      ctx.restore();
    }

    // Final insult: a tiny cup drops onto the beanie's bobble.
    if (t > 28.1) {
      const u = clamp((t - 28.1) / 0.6, 0, 1);
      const baseY = lerp(540, 916, u * u);
      const landed = t > 28.7;
      const wobble = landed ? Math.sin((t - 28.7) * 26) * 0.08 * (1 - clamp((t - 28.7) / 0.8, 0, 1)) : 0;

      ctx.save();
      ctx.translate(CHAR_X, baseY);
      ctx.rotate(wobble);
      ctx.scale(0.55, 0.55);
      this.drawCup(
        ctx,
        0,
        0,
        TOWER_CUP_R * 0.8,
        TOWER_CUP_R,
        TOWER_CUP_H,
        TOWER_CUP_R * 0.28,
        TOWER_COLORS[1],
        shade(TOWER_COLORS[1], -0.32),
        shade(TOWER_COLORS[1], 0.25),
        6
      );
      ctx.restore();

      if (!landed && u > 0.1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        for (let i = 0; i < 2; i++) {
          ctx.beginPath();
          ctx.moveTo(CHAR_X - 14 + i * 28, baseY - 70);
          ctx.lineTo(CHAR_X - 14 + i * 28, baseY - 46);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
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

  private charX(t: number): number {
    void t;
    return CHAR_X;
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
      handL: { x: x - 80, y: 1185 },
      handR: { x: x + 80, y: 1185 },
      bendL: 1,
      bendR: 1,
      fistL: false,
      fistR: false,
      pointL: false,
      pointR: false,
      holdBallR: false,
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
      // Shot 1 - the setup.
      if (t < 0.9) {
        p.brow = 'normal';
        p.eye = 'open';
        p.mouth = 'flat';
      } else if (t < 2.0) {
        p.look = 'right';
        p.brow = 'cocky';
        p.eye = 'squint';
        p.mouth = 'smirk';
        p.headTurn = 8;
        p.pointL = true;
        p.handL = h(150, 1020);
        p.handR = h(70, 1030);
      } else if (t < 3.2) {
        p.look = 'front';
        p.brow = 'cocky';
        p.eye = 'squint';
        p.mouth = 'grin';
        p.headTurn = 0;
        p.pointL = true;
        p.handL = h(140, 1050);
        p.handR = h(60, 1010);
      } else if (t < 4.4) {
        p.look = 'front';
        p.brow = 'cocky';
        p.eye = 'squint';
        p.mouth = 'grin';
        p.headTurn = 0;
        p.pointL = true;
        p.handL = h(120, 1080);
        p.handR = h(55, 980);
      } else if (t < 5.6) {
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headTurn = 6;
        p.lean = -0.04;
        p.handL = h(-50, 1120);
        p.handR = h(5, 940);
      } else {
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headTurn = 6;
        p.lean = -0.06;
        p.handL = h(-60, 1130);
        p.handR = h(0, 930);
      }
    } else if (t < 12.0) {
      // Shot 2 - the first throw.
      if (t < 6.35) {
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headTurn = 6;
        p.lean = -0.06;
        p.handL = h(-60, 1130);
        p.handR = h(0, 930);
      } else if (t < 6.7) {
        p.look = 'right';
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headTurn = 10;
        p.lean = 0.12;
        p.handL = h(-30, 1100);
        p.handR = h(90, 990);
      } else if (t < 7.6) {
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 10;
        p.handR = h(65, 1050);
        p.handL = h(-40, 1120);
      } else if (t < 8.3) {
        p.look = 'front';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 0;
        p.handR = h(40, 1080);
        p.handL = h(-60, 1120);
      } else if (t < 9.0) {
        p.look = 'front';
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.handR = h(30, 1120);
        p.handL = h(-90, 1100);
        p.fistL = true;
        p.fistR = true;
      } else {
        p.look = 'down';
        p.brow = 'sad';
        p.eye = 'squint';
        p.mouth = 'frown';
        p.headDrop = 6;
        p.handL = h(-70, 1180);
        p.handR = h(70, 1180);
        p.fistL = true;
        p.fistR = true;
      }
    } else if (t < 18.0) {
      // Shot 3 - so close, wrong cup.
      if (t < 12.3) {
        p.look = 'down';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'flat';
        p.headDrop = 4;
        p.handL = h(-60, 1160);
        p.handR = h(10, 1105);
      } else if (t < 12.6) {
        p.look = 'down';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'flat';
        p.headDrop = 4;
        p.handL = h(-60, 1160);
        p.handR = h(10, 1105);
      } else if (t < 12.9) {
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headTurn = 6;
        p.handL = h(-50, 1130);
        p.handR = h(10, 1010);
      } else if (t < 13.2) {
        p.look = 'right';
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headTurn = 10;
        p.lean = 0.12;
        p.handL = h(-30, 1100);
        p.handR = h(90, 990);
      } else if (t < 14.4) {
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 10;
        p.handR = h(65, 1050);
        p.handL = h(-40, 1120);
      } else if (t < 15.2) {
        p.look = 'down';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 6;
        p.headDrop = 4;
        p.handR = h(100, 1050);
        p.handL = h(20, 1100);
      } else if (t < 16.2) {
        p.look = 'down';
        p.brow = 'sad';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = 8;
        p.handL = h(-10, 1040);
        p.handR = h(50, 1020);
      } else if (t < 17.0) {
        p.look = 'front';
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headTurn = 0;
        p.handL = h(-80, 1100);
        p.handR = h(50, 1100);
        p.fistL = true;
        p.fistR = true;
      } else {
        p.look = 'down';
        p.brow = 'sad';
        p.eye = 'squint';
        p.mouth = 'frown';
        p.headDrop = 8;
        p.handL = h(-70, 1160);
        p.handR = h(40, 1160);
      }
    } else if (t < 24.0) {
      // Shot 4 - the perfect one.
      if (t < 18.4) {
        p.look = 'down';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headDrop = 5;
        p.lean = 0.06;
        p.handL = h(-60, 1140);
        p.handR = h(220, 1030);
      } else if (t < 18.8) {
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'flat';
        p.headTurn = 8;
        p.handL = h(-60, 1130);
        p.handR = h(150, 1010);
      } else if (t < 19.3) {
        p.look = 'front';
        p.brow = 'cocky';
        p.eye = 'squint';
        p.mouth = 'smirk';
        p.headTurn = 0;
        p.handL = h(-70, 1120);
        p.handR = h(70, 1020);
      } else if (t < 19.9) {
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headTurn = 6;
        p.lean = -0.05;
        p.handL = h(-55, 1120);
        p.handR = h(0, 930);
      } else if (t < 20.2) {
        p.look = 'right';
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headTurn = 10;
        p.lean = 0.12;
        p.handL = h(-30, 1100);
        p.handR = h(90, 990);
      } else if (t < 21.3) {
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 10;
        p.handR = h(65, 1050);
        p.handL = h(-40, 1120);
      } else if (t < 22.2) {
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 12;
        p.headDrop = -2;
        p.handR = h(120, 1040);
        p.handL = h(30, 1080);
      } else if (t < 23.1) {
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'grin';
        p.headTurn = 10;
        p.handL = h(-20, 1030);
        p.handR = h(80, 1000);
      } else {
        p.look = 'front';
        p.brow = 'raised';
        p.eye = 'happy';
        p.mouth = 'grin';
        p.headTurn = 0;
        p.handL = h(-140, 990);
        p.handR = h(130, 990);
        p.fistL = true;
        p.fistR = true;
      }
    } else {
      // Shot 5 - he loses everything.
      if (t < 24.5) {
        p.look = 'front';
        p.brow = 'raised';
        p.eye = 'happy';
        p.mouth = 'grin';
        p.handL = h(-140, 990);
        p.handR = h(130, 990);
        p.fistL = true;
        p.fistR = true;
      } else if (t < 25.4) {
        p.look = 'up';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = -6;
        p.handL = h(-80, 940);
        p.handR = h(80, 940);
      } else if (t < 26.4) {
        p.look = 'up';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = -8;
        p.handL = h(-120, 1000);
        p.handR = h(120, 1000);
      } else if (t < 27.6) {
        p.look = 'up';
        p.brow = 'sad';
        p.eye = 'shut';
        p.mouth = 'flat';
        p.headDrop = -4;
        p.handL = h(-55, 910);
        p.handR = h(55, 910);
      } else if (t < 28.9) {
        p.look = 'front';
        p.brow = 'sad';
        p.eye = 'wide';
        p.mouth = 'flat';
        p.handL = h(-60, 1200);
        p.handR = h(60, 1200);
      } else if (t < 29.4) {
        p.look = 'up';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = -3;
        p.handL = h(-60, 1200);
        p.handR = h(60, 1200);
      } else {
        p.look = 'front';
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.handL = h(-60, 1200);
        p.handR = h(60, 1200);
      }
    }

    // Ball ownership drives the hand pose, and must match ballAt exactly.
    p.holdBallR =
      (t >= 0.9 && t < 6.5) || (t >= 12.6 && t < 13.0) || (t >= 18.0 && t < 20.0);

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
    layer: 'body' | 'head' | 'hands'
  ) {
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(pose.lean) * 170;
    const footY = this.floorY - Math.max(0, this.hipY - hipY);

    ctx.save();
    ctx.lineCap = 'round';

    if (layer === 'body') {
      let stride = 0;
      if (pose.legs === 'walk') stride = Math.sin(pose.walkPhase) * 34;
      else if (pose.legs === 'kneel') stride = 0;

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

      if (pose.legs === 'kneel') {
        const kneeY = hipY + 140;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 32;
        ctx.beginPath();
        ctx.moveTo(hipX - 8, hipY + 6);
        ctx.lineTo(hipX - 20, kneeY);
        ctx.stroke();
        ctx.strokeStyle = TROUSER;
        ctx.lineWidth = 23;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(hipX + 8, hipY + 6);
        ctx.lineTo(hipX + 20, kneeY);
        ctx.stroke();
        ctx.strokeStyle = TROUSER_DEEP;
        ctx.lineWidth = 23;
        ctx.stroke();
      }
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

    if (layer === 'body') {
      drawLimb(arms.l);
      drawLimb(arms.r);

      const leftHandStyle: HandStyle = {
        side: 'left',
        pose: pose.pointL ? 'point' : pose.gripL ? 'grip' : pose.fistL ? 'fist' : 'relaxed',
        layer: 'full',
      };
      const rightHandStyle: HandStyle = {
        side: 'right',
        pose: pose.holdBallR
          ? 'ball'
          : pose.gripR
            ? 'grip'
            : pose.fistR
              ? 'fist'
              : pose.pointR
                ? 'point'
                : 'relaxed',
        layer: 'full',
      };

      drawHand(ctx, arms.l, leftHandStyle);
      drawHand(ctx, arms.r, rightHandStyle);
    } else if (layer === 'head') {
      const head = this.headPoint(pose, hipX, hipY);
      this.drawHead(ctx, head.x, head.y, pose, t);
    } else {
      // Fingers curl back over the ball or a held prop.
      if (pose.gripL) {
        drawHand(ctx, arms.l, { side: 'left', pose: 'grip', layer: 'overlay' });
      }
      if (pose.holdBallR || pose.gripR) {
        drawHand(ctx, arms.r, {
          side: 'right',
          pose: pose.holdBallR ? 'ball' : 'grip',
          layer: 'overlay',
        });
      }
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

    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(cx, cy + r);
    ctx.lineTo(cx, cy + r + 26);
    ctx.stroke();

    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (pose.beanieOn) this.drawBeanie(ctx, cx, cy);

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

    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    const browY = cy - 12;
    const twitch = t >= 29.0 ? Math.sin(t * 22) * 3 : 0;
    ctx.beginPath();
    if (pose.brow === 'angry' || pose.brow === 'determined') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY + 8 + twitch);
      ctx.moveTo(fx + 42, browY - 8);
      ctx.lineTo(fx + 12, browY + 8 - twitch);
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

    if (t >= 29.0) {
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