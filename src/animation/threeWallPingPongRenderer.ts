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
const CUP_RED = '#e63946';
const CUP_RED_DEEP = '#b3222e';
const CUP_RED_LIGHT = '#ff6b6b';
const PADDLE_RED = '#c0392b';
const PADDLE_RED_DEEP = '#962d22';
const BALL_WHITE = '#ffffff';
const BALL_SHINE = '#e0e0e0';

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
const TABLE_L = 120;
const TABLE_R = 960;
const TABLE_H = 80;

const CUP_X = 820;
const CUP_Y = TABLE_Y - 4;
const CUP_R = 28;
const CUP_H = 50;

const PADDLE_HOME_X = 380;
const PADDLE_HOME_Y = 1220;

const WALL1_X = 1040;
const WALL2_Y = 300;
const WALL3_X = 40;

const BALL_R = 18;

const FALL_START = 24.5;
const AVALANCHE_END = 29.5;

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
  pointR: boolean;
  paddleSwing: number;
  holdBallR: boolean;
  holdPaddleR: boolean;
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
}

const CAPTIONS: CaptionLine[] = [
  { text: '3 WALLS. 1 SHOT. IMPOSSIBLE!', from: 0.35, to: 5.8 },
  { text: 'SHOT NUMBER ONE… FAILED!', from: 6.2, to: 11.85 },
  { text: 'SO CLOSE!', from: 12.2, to: 17.85 },
  { text: 'PERFECT THREE-WALL SHOT!', from: 18.2, to: 23.85 },
  { text: 'HE WON… TOO MANY BALLS! 😂', from: 24.2, to: 29.75 },
];

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 540, y: 960, zoom: 0.95 },
  { t: 1.5, x: 540, y: 960, zoom: 0.96 },
  { t: 2.5, x: 600, y: 900, zoom: 1.1 },
  { t: 6.0, x: 540, y: 1000, zoom: 1.04 },
  { t: 7.0, x: 540, y: 1000, zoom: 1.04 },
  { t: 8.5, x: 480, y: 950, zoom: 1.25 },
  { t: 9.5, x: 460, y: 900, zoom: 1.4 },
  { t: 12.0, x: 540, y: 980, zoom: 0.9 },
  { t: 13.0, x: 700, y: 900, zoom: 1.0 },
  { t: 14.5, x: 850, y: 850, zoom: 1.1 },
  { t: 16.0, x: 820, y: 1050, zoom: 1.15 },
  { t: 17.5, x: 600, y: 1100, zoom: 1.2 },
  { t: 18.0, x: 540, y: 980, zoom: 0.95 },
  { t: 20.0, x: 540, y: 850, zoom: 1.1 },
  { t: 21.5, x: 700, y: 800, zoom: 1.15 },
  { t: 22.8, x: 820, y: 1050, zoom: 1.2 },
  { t: 23.5, x: 820, y: 1050, zoom: 1.25 },
  { t: 24.5, x: 820, y: 1050, zoom: 1.2 },
  { t: 25.5, x: 820, y: 1100, zoom: 1.1 },
  { t: 27.0, x: 820, y: 1150, zoom: 1.05 },
  { t: 29.0, x: 820, y: 1080, zoom: 1.6 },
  { t: 30.0, x: 820, y: 1080, zoom: 1.7 },
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

const PLUS_MINUS = [-1, 1];

export class ThreeWallPingPongRenderer {
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
    this.drawCup(ctx, t);
    this.drawWalls(ctx);

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

    this.drawBall(ctx, t, x, hipY, pose);
    this.drawPaddle(ctx, t, x, hipY, pose, arms);

    this.drawStickman(ctx, x, hipY, pose, arms, t, 'front');

    this.drawAvalanche(ctx, t);
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
        : t > 8.5 && t < 9.5
        ? 3
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
    // Floor
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

    // Back wall (behind table)
    ctx.fillStyle = WALL_BLUE_DEEP;
    ctx.fillRect(-200, 150, WIDTH + 400, 1250);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.strokeRect(-200, 150, WIDTH + 400, 1250);

    // Wall pattern - subtle grid
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

    // Ceiling lights
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
    // Table top
    ctx.fillStyle = TABLE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(TABLE_L, TABLE_Y - TABLE_H / 2, TABLE_R - TABLE_L, TABLE_H, 12);
    ctx.fill();
    ctx.stroke();

    // Table center line
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(540, TABLE_Y - TABLE_H / 2);
    ctx.lineTo(540, TABLE_Y + TABLE_H / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Table edge highlight
    ctx.strokeStyle = '#2eb852';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(TABLE_L, TABLE_Y - TABLE_H / 2);
    ctx.lineTo(TABLE_R, TABLE_Y - TABLE_H / 2);
    ctx.stroke();

    // Legs
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

  private drawCup(ctx: CanvasRenderingContext2D, t: number) {
    if (t >= FALL_START) return; // Cup tips over in shot 5

    // Cup shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(CUP_X, TABLE_Y + 2, CUP_R * 1.1, 6, 0, 0, TAU);
    ctx.fill();

    // Cup body
    ctx.fillStyle = CUP_RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(CUP_X - CUP_R, CUP_Y);
    ctx.lineTo(CUP_X - CUP_R * 0.8, CUP_Y - CUP_H);
    ctx.arc(CUP_X, CUP_Y - CUP_H, CUP_R * 0.8, Math.PI, 0);
    ctx.lineTo(CUP_X + CUP_R, CUP_Y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cup highlight
    ctx.fillStyle = CUP_RED_LIGHT;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(CUP_X - 8, CUP_Y - CUP_H + 12, CUP_R * 0.5, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Cup rim
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CUP_X, CUP_Y - CUP_H, CUP_R * 0.8, Math.PI, 0);
    ctx.stroke();

    // Shake before tipping
    if (t > 24.2 && t < FALL_START) {
      ctx.save();
      ctx.translate(Math.sin(t * 40) * 3, 0);
      ctx.restore();
    }
  }

  private drawWalls(ctx: CanvasRenderingContext2D) {
    // Wall 1 - Right side vertical
    ctx.fillStyle = WALL_BLUE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.fillRect(WALL1_X - 10, 180, 10, 1200);
    ctx.strokeRect(WALL1_X - 10, 180, 10, 1200);
    // Wall 1 label
    ctx.fillStyle = WHITE;
    ctx.font = heavy(20);
    ctx.textAlign = 'center';
    ctx.fillText('WALL 1', WALL1_X - 5, 230);

    // Wall 2 - Top horizontal
    ctx.fillStyle = WALL_BLUE;
    ctx.fillRect(60, WALL2_Y - 10, WIDTH - 120, 10);
    ctx.strokeRect(60, WALL2_Y - 10, WIDTH - 120, 10);
    ctx.fillStyle = WHITE;
    ctx.fillText('WALL 2', 540, WALL2_Y - 15);

    // Wall 3 - Left side vertical
    ctx.fillStyle = WALL_BLUE;
    ctx.fillRect(WALL3_X, 180, 10, 1200);
    ctx.strokeRect(WALL3_X, 180, 10, 1200);
    ctx.fillStyle = WHITE;
    ctx.fillText('WALL 3', WALL3_X + 5, 230);

    // Bounce markers (subtle)
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    // Wall 1 bounce zone
    ctx.beginPath();
    ctx.arc(WALL1_X - 5, 700, 15, 0, TAU);
    ctx.fill();
    // Wall 2 bounce zone
    ctx.beginPath();
    ctx.arc(540, WALL2_Y - 5, 15, 0, TAU);
    ctx.fill();
    // Wall 3 bounce zone
    ctx.beginPath();
    ctx.arc(WALL3_X + 5, 700, 15, 0, TAU);
    ctx.fill();
  }

  private drawPaddle(ctx: CanvasRenderingContext2D, t: number, hipX: number, hipY: number, pose: Pose, arms: { l: Arm; r: Arm }) {
    if (t > 24) return; // Paddle disappears after shot 4

    const a = arms.r;
    const swing = pose.paddleSwing || 0;
    const angle = -0.5 + swing * 1.8;

    ctx.save();
    ctx.translate(a.hx, a.hy);
    ctx.rotate(angle);

    // Paddle handle
    ctx.fillStyle = '#8b5a2b';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-6, 0, 12, 30, 4);
    ctx.fill();
    ctx.stroke();

    // Paddle face
    ctx.fillStyle = PADDLE_RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-42, -10, 84, 80, 16);
    ctx.fill();
    ctx.stroke();

    // Paddle rubber texture
    ctx.strokeStyle = PADDLE_RED_DEEP;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const y = -6 + i * 20;
      ctx.beginPath();
      ctx.moveTo(-38, y);
      ctx.lineTo(38, y);
      ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const x = -28 + i * 28;
      ctx.beginPath();
      ctx.moveTo(x, -8);
      ctx.lineTo(x, 68);
      ctx.stroke();
    }

    // Paddle edge highlight
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-40, -8);
    ctx.lineTo(40, -8);
    ctx.stroke();

    ctx.restore();
  }

  private drawBall(ctx: CanvasRenderingContext2D, t: number, hipX: number, hipY: number, pose: Pose) {
    const ball = this.ballAt(t, hipX, hipY);
    if (!ball.visible) return;

    ctx.save();

    // Trail
    if (ball.trail.length > 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      for (let i = 1; i < ball.trail.length; i++) {
        const a = ball.trail[i - 1];
        const b = ball.trail[i];
        ctx.globalAlpha = 0.15 * (i / ball.trail.length);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Ball shadow
    if (ball.y < 1500) {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.ellipse(ball.x, FLOOR_Y + 4, BALL_R * 1.2, 4, 0, 0, TAU);
      ctx.fill();
    }

    // Ball body
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.spin);

    ctx.fillStyle = BALL_WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Ball brand line (ping-pong ball seam)
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-BALL_R, 0);
    ctx.lineTo(BALL_R, 0);
    ctx.stroke();

    // Shine
    ctx.fillStyle = BALL_SHINE;
    ctx.beginPath();
    ctx.arc(-6, -6, 6, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private ballAt(t: number, hipX: number, hipY: number): BallState {
    const trail: Pt[] = [];

    // Shot 1: wind-up, no ball visible yet
    if (t < 6.5) {
      return { x: PADDLE_HOME_X + 40, y: PADDLE_HOME_Y - 10, visible: false, spin: 0, trail: [] };
    }

    // Shot 2: first attempt - hits wall 1, bounces back to beanie
    if (t < 12.0) {
      if (t < 6.8) {
        // Flying from paddle toward wall 1
        const u = clamp((t - 6.5) / 0.3, 0, 1);
        const x = lerp(PADDLE_HOME_X + 60, WALL1_X - 30, u);
        const y = lerp(PADDLE_HOME_Y - 20, 700, u);
        if (u > 0.2) trail.push({ x: lerp(PADDLE_HOME_X + 60, x, 0.5), y: lerp(PADDLE_HOME_Y - 20, y, 0.5) });
        return { x, y, visible: true, spin: u * 30, trail };
      } else if (t < 7.8) {
        // Hits wall 1
        const u = clamp((t - 6.8) / 0.1, 0, 1);
        const x = lerp(WALL1_X - 30, WALL1_X - 5, u);
        const y = 700;
        trail.push({ x, y });
        return { x, y, visible: true, spin: 30 + u * 10, trail };
      } else if (t < 8.6) {
        // Ricochets back toward stickman
        const u = clamp((t - 7.8) / 0.8, 0, 1);
        const x = lerp(WALL1_X - 5, 460, u);
        const y = lerp(700, 1000, u);
        trail.push({ x, y });
        return { x, y, visible: true, spin: 40 + u * 20, trail };
      } else if (t < 9.0) {
        // Hits beanie
        const head = this.headPoint(this.poseAt(t, hipX), hipX, hipY);
        const u = clamp((t - 8.6) / 0.4, 0, 1);
        const x = lerp(460, head.x, u);
        const y = lerp(1000, head.y - 60, u);
        trail.push({ x, y });
        return { x, y, visible: true, spin: 60 + u * 15, trail };
      } else if (t < 9.8) {
        // Falls from beanie to table
        const u = clamp((t - 9.0) / 0.8, 0, 1);
        const x = 460;
        const y = lerp(1000, TABLE_Y - 10, u);
        trail.push({ x, y });
        return { x, y, visible: true, spin: 75, trail };
      } else {
        // Sits on table
        return { x: 460, y: TABLE_Y - 10, visible: true, spin: 75, trail: [] };
      }
    }

    // Shot 3: second attempt - three walls, misses cup
    if (t < 18.0) {
      if (t < 12.9) {
        // Reset, ball at paddle
        return { x: PADDLE_HOME_X + 40, y: PADDLE_HOME_Y - 10, visible: true, spin: 0, trail: [] };
      } else if (t < 13.5) {
        // Hit, flies to wall 1
        const u = clamp((t - 12.9) / 0.6, 0, 1);
        const x = lerp(PADDLE_HOME_X + 60, WALL1_X - 30, u);
        const y = lerp(PADDLE_HOME_Y - 20, 700, u);
        if (u > 0.2) trail.push({ x: lerp(PADDLE_HOME_X + 60, x, 0.5), y: lerp(PADDLE_HOME_Y - 20, y, 0.5) });
        return { x, y, visible: true, spin: u * 40, trail };
      } else if (t < 14.0) {
        // Wall 1 bounce
        const u = clamp((t - 13.5) / 0.1, 0, 1);
        const x = WALL1_X - 5;
        const y = 700;
        trail.push({ x, y });
        return { x, y, visible: true, spin: 24 + u * 5, trail };
      } else if (t < 15.2) {
        // Flies to wall 2
        const u = clamp((t - 14.0) / 1.2, 0, 1);
        const x = lerp(WALL1_X - 5, 540, u);
        const y = lerp(700, WALL2_Y - 5, u);
        trail.push({ x, y });
        return { x, y, visible: true, spin: 29 + u * 15, trail };
      } else if (t < 15.7) {
        // Wall 2 bounce
        const u = clamp((t - 15.2) / 0.1, 0, 1);
        const x = 540;
        const y = WALL2_Y - 5;
        trail.push({ x, y });
        return { x, y, visible: true, spin: 44 + u * 5, trail };
      } else if (t < 16.5) {
        // Flies to wall 3
        const u = clamp((t - 15.7) / 0.8, 0, 1);
        const x = lerp(540, WALL3_X + 30, u);
        const y = lerp(WALL2_Y - 5, 700, u);
        trail.push({ x, y });
        return { x, y, visible: true, spin: 49 + u * 12, trail };
      } else if (t < 17.0) {
        // Wall 3 bounce
        const u = clamp((t - 16.5) / 0.1, 0, 1);
        const x = WALL3_X + 5;
        const y = 700;
        trail.push({ x, y });
        return { x, y, visible: true, spin: 61 + u * 5, trail };
      } else if (t < 17.8) {
        // Returns toward cup, misses
        const u = clamp((t - 16.6) / 1.2, 0, 1);
        const x = lerp(WALL3_X + 5, CUP_X + 60, u);
        const y = lerp(700, TABLE_Y + 20, u);
        trail.push({ x, y });
        return { x, y, visible: true, spin: 66 + u * 8, trail };
      } else {
        // Rolls past cup on table
        const u = clamp((t - 17.8) / 0.2, 0, 1);
        const x = lerp(CUP_X + 60, CUP_X + 120, u);
        const y = TABLE_Y + 10;
        trail.push({ x, y });
        return { x, y, visible: true, spin: 74, trail };
      }
    }

    // Shot 4: perfect shot in slow-mo
    if (t < 24.0) {
      if (t < 20.0) {
        // Slow-mo wind-up
        return { x: PADDLE_HOME_X + 40, y: PADDLE_HOME_Y - 10, visible: true, spin: 0, trail: [] };
      } else if (t < 20.5) {
        // Slow-mo hit
        const u = clamp((t - 20.0) / 0.5, 0, 1);
        const x = lerp(PADDLE_HOME_X + 60, PADDLE_HOME_X + 80, u);
        const y = PADDLE_HOME_Y - 20;
        return { x, y, visible: true, spin: u * 10, trail: [] };
      } else if (t < 21.3) {
        // Slow-mo to wall 1
        const u = clamp((t - 20.5) / 0.8, 0, 1);
        const x = lerp(PADDLE_HOME_X + 80, WALL1_X - 30, u);
        const y = lerp(PADDLE_HOME_Y - 20, 700, u);
        if (u > 0.1) trail.push({ x: lerp(PADDLE_HOME_X + 80, x, 0.3), y: lerp(PADDLE_HOME_Y - 20, y, 0.3) });
        return { x, y, visible: true, spin: 5 + u * 20, trail };
      } else if (t < 21.8) {
        // Wall 1 slow bounce
        const u = clamp((t - 21.3) / 0.1, 0, 1);
        const x = WALL1_X - 5;
        const y = 700;
        trail.push({ x, y });
        return { x, y, visible: true, spin: 21 + u * 3, trail };
      } else if (t < 22.5) {
        // Slow-mo to wall 2
        const u = clamp((t - 21.8) / 0.7, 0, 1);
        const x = lerp(WALL1_X - 5, 540, u);
        const y = lerp(700, WALL2_Y - 5, u);
        trail.push({ x, y });
        return { x, y, visible: true, spin: 24 + u * 12, trail };
      } else if (t < 23.0) {
        // Wall 2 slow bounce
        const u = clamp((t - 22.5) / 0.1, 0, 1);
        const x = 540;
        const y = WALL2_Y - 5;
        trail.push({ x, y });
        return { x, y, visible: true, spin: 36 + u * 3, trail };
      } else if (t < 23.6) {
        // Slow-mo to wall 3
        const u = clamp((t - 23.0) / 0.6, 0, 1);
        const x = lerp(540, WALL3_X + 30, u);
        const y = lerp(WALL2_Y - 5, 700, u);
        trail.push({ x, y });
        return { x, y, visible: true, spin: 39 + u * 10, trail };
      } else if (t < 24.0) {
        // Wall 3 bounce, drops into cup
        const u = clamp((t - 23.6) / 0.4, 0, 1);
        if (u < 0.25) {
          // At wall 3
          const x = WALL3_X + 5;
          const y = 700;
          trail.push({ x, y });
          return { x, y, visible: true, spin: 45, trail };
        } else {
          // Falls into cup
          const v = clamp((u - 0.25) / 0.75, 0, 1);
          const x = lerp(WALL3_X + 5, CUP_X, v);
          const y = lerp(700, CUP_Y - CUP_H - 20, v);
          trail.push({ x, y });
          return { x, y, visible: true, spin: 45 + v * 5, trail };
        }
      }
    }

    // Shot 5: ball in cup, then avalanche
    if (t < 24.5) {
      return { x: CUP_X, y: CUP_Y - CUP_H - 20, visible: true, spin: 0, trail: [] };
    } else if (t < 26.0) {
      // Cup tips, first balls spill
      const u = clamp((t - 24.5) / 1.5, 0, 1);
      return { x: CUP_X + Math.sin(t * 10) * 30 * u, y: TABLE_Y - 20 + u * 100, visible: true, spin: u * 60, trail: [] };
    } else {
      // Buried in avalanche - don't draw single ball
      return { x: 0, y: 0, visible: false, spin: 0, trail: [] };
    }
  }

  private drawAvalanche(ctx: CanvasRenderingContext2D, t: number) {
    if (t < FALL_START) return;

    const progress = clamp((t - FALL_START) / (AVALANCHE_END - FALL_START), 0, 1);
    const numBalls = Math.floor(200 * progress * progress);
    const centerX = CUP_X;
    const baseY = TABLE_Y - CUP_H;

    ctx.save();

    for (let i = 0; i < numBalls; i++) {
      const angle = (i * 2.39996) % TAU;
      const radius = 15 + (i % 12) * 18 + Math.sin(t * 3 + i) * 8 * (1 - progress);
      const bx = centerX + Math.cos(angle) * radius;
      const by = baseY + Math.sin(angle) * radius * 0.5 + (i % 5) * 25 * progress;

      if (by > FLOOR_Y - 20) continue;

      const ballSpin = t * 10 + i * 1.7;
      const r = BALL_R * (0.8 + (i % 3) * 0.1);

      // Shadow
      if (by < FLOOR_Y - 30) {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(bx, FLOOR_Y + 2, r * 1.1, 3, 0, 0, TAU);
        ctx.fill();
      }

      // Ball
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(ballSpin);

      ctx.fillStyle = BALL_WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Seam
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.stroke();

      // Shine
      ctx.fillStyle = BALL_SHINE;
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.3, r * 0.33, 0, TAU);
      ctx.fill();

      ctx.restore();
    }

    // Beanie on top
    if (t > 26.5) {
      const rise = clamp((t - 26.5) / 2.0, 0, 1);
      const beanieY = baseY - 200 * rise + Math.sin(t * 5) * 2 * (1 - rise);
      this.drawBeanieAt(ctx, centerX, beanieY, Math.sin(t * 3) * 0.1 * (1 - rise));
    }

    ctx.restore();
  }

  private drawBeanieAt(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    const r = this.headR;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillStyle = BEANIE;
    ctx.beginPath();
    ctx.arc(0, -24, r + 4, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = BEANIE_DEEP;
    ctx.fillRect(-r - 4, -40, (r + 4) * 2, 16);
    ctx.strokeRect(-r - 4, -40, (r + 4) * 2, 16);
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(0, -r - 32, 16, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
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
    return keyAt(
      [
        [0, 360],
        [2.0, 360],
        [3.0, 340],
        [12.0, 340],
        [17.5, 320],
        [18.5, 340],
        [24.0, 340],
        [30, 340],
      ],
      t
    );
  }

  private charHop(t: number): number {
    const hop = (a: number, b: number, h: number) =>
      t >= a && t < b ? h * Math.sin(((t - a) / (b - a)) * Math.PI) : 0;
    return hop(23.8, 24.2, 40);
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
      paddleSwing: 0,
      holdBallR: false,
      holdPaddleR: false,
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
      // Shot 1 - setup
      if (t < 1.2) {
        p.brow = 'normal';
        p.eye = 'open';
        p.mouth = 'flat';
        p.handL = h(-82, 1205);
        p.handR = h(82, 1205);
      } else if (t < 2.0) {
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.pointR = true;
        p.bendR = -1;
        p.handR = h(220, 950);
        p.handL = h(-80, 1190);
      } else if (t < 2.8) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.fistL = true;
        p.fistR = true;
        p.handL = h(-64, 1140);
        p.handR = h(64, 1140);
      } else if (t < 3.6) {
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'smirk';
        p.headTurn = 6;
        p.handR = h(180, 1150);
        p.bendR = 1;
        p.paddleSwing = 0.2;
        p.handL = h(-70, 1180);
      } else if (t < 4.5) {
        p.look = 'right';
        p.brow = 'cocky';
        p.eye = 'squint';
        p.mouth = 'smirk';
        p.headTurn = 8;
        p.lean = 0.05;
        p.paddleSwing = 0.7;
        p.handR = h(200, 1080);
        p.handL = h(-60, 1160);
      } else {
        p.look = 'right';
        p.brow = 'cocky';
        p.eye = 'squint';
        p.mouth = 'grin';
        p.headTurn = 8;
        p.lean = 0.07;
        p.paddleSwing = 1.0;
        p.handR = h(210, 1050);
        p.handL = h(-50, 1140);
      }
    } else if (t < 12.0) {
      // Shot 2 - first fail
      if (t < 6.5) {
        p.look = 'right';
        p.brow = 'cocky';
        p.eye = 'squint';
        p.mouth = 'grin';
        p.headTurn = 8;
        p.lean = 0.07;
        p.paddleSwing = 1.0;
        p.handR = h(210, 1050);
        p.handL = h(-50, 1140);
      } else if (t < 6.8) {
        // Swing
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headTurn = 8;
        p.lean = 0.12;
        p.paddleSwing = smooth(clamp((t - 6.5) / 0.3, 0, 1)) * 1.8;
        p.handR = h(220, 1020);
        p.handL = h(-40, 1120);
      } else if (t < 7.8) {
        // Watch ball go to wall
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 10;
        p.paddleSwing = 1.8;
        p.handR = h(200, 1050);
        p.handL = h(-60, 1100);
      } else if (t < 8.6) {
        // Ball coming back
        p.look = 'front';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 0;
        p.paddleSwing = 1.5;
        p.handR = h(180, 1080);
        p.handL = h(-80, 1100);
      } else if (t < 9.0) {
        // Ball hits beanie!
        p.look = 'up';
        p.brow = 'angry';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = -15;
        p.headTilt = -20;
        p.paddleSwing = 1.0;
        p.handR = h(150, 1100);
        p.handL = h(-100, 1100);
      } else if (t < 10.0) {
        // Head tilted back, furious
        p.look = 'up';
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headDrop = -12;
        p.headTilt = -25;
        p.paddleSwing = 0.5;
        p.handR = h(120, 1150);
        p.handL = h(-120, 1150);
      } else {
        // Furious stare at ball on table
        p.look = 'down';
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'frown';
        p.headDrop = 5;
        p.paddleSwing = 0;
        p.handL = h(-80, 1180);
        p.handR = h(80, 1180);
        p.fistL = true;
        p.fistR = true;
      }
    } else if (t < 18.0) {
      // Shot 3 - so close
      if (t < 12.5) {
        // Reset
        p.look = 'front';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'flat';
        p.paddleSwing = 0;
        p.handL = h(-80, 1180);
        p.handR = h(180, 1150);
      } else if (t < 13.0) {
        // Deep breath
        p.look = 'front';
        p.brow = 'normal';
        p.eye = 'shut';
        p.mouth = 'flat';
        p.paddleSwing = 0;
        p.handL = h(-80, 1180);
        p.handR = h(180, 1150);
      } else if (t < 13.5) {
        // Swing
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headTurn = 8;
        p.lean = 0.1;
        p.paddleSwing = smooth(clamp((t - 13.0) / 0.5, 0, 1)) * 1.8;
        p.handR = h(220, 1020);
        p.handL = h(-40, 1120);
      } else if (t < 15.5) {
        // Watch first two bounces
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 12;
        p.paddleSwing = 1.8;
        p.handR = h(200, 1080);
        p.handL = h(-60, 1100);
      } else if (t < 17.0) {
        // Watch third bounce and approach
        p.look = 'left';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = -8;
        p.paddleSwing = 1.5;
        p.handR = h(150, 1100);
        p.handL = h(-50, 1080);
      } else {
        // Misses cup - drops to knees
        p.legs = 'kneel';
        p.look = 'down';
        p.brow = 'sad';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = 10;
        p.paddleSwing = 0;
        p.handL = h(-100, 1220);
        p.handR = h(100, 1220);
      }
    } else if (t < 24.0) {
      // Shot 4 - perfect shot
      if (t < 18.5) {
        // Stands up
        p.legs = 'stand';
        p.look = 'front';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'flat';
        p.paddleSwing = 0;
        p.handL = h(-80, 1180);
        p.handR = h(180, 1150);
      } else if (t < 19.5) {
        // Deep breath
        p.look = 'front';
        p.brow = 'normal';
        p.eye = 'shut';
        p.mouth = 'flat';
        p.paddleSwing = 0;
        p.handL = h(-70, 1160);
        p.handR = h(190, 1140);
      } else if (t < 20.0) {
        // Slow-mo aim
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headTurn = 6;
        p.lean = 0.08;
        p.paddleSwing = 0.3;
        p.handR = h(200, 1080);
        p.handL = h(-60, 1120);
      } else if (t < 20.5) {
        // Slow-mo strike
        p.look = 'right';
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.headTurn = 6;
        p.lean = 0.12;
        p.paddleSwing = smooth(clamp((t - 20.0) / 0.5, 0, 1)) * 1.8;
        p.handR = h(220, 1020);
        p.handL = h(-40, 1120);
      } else if (t < 23.5) {
        // Slow-mo watch three bounces
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 12;
        p.paddleSwing = 1.8;
        p.handR = h(180, 1060);
        p.handL = h(-50, 1080);
      } else {
        // Ball drops in cup - victory!
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'happy';
        p.mouth = 'grin';
        p.headTurn = 8;
        p.paddleSwing = 1.0;
        p.handL = h(-150, 1000);
        p.handR = h(150, 1000);
        p.fistL = true;
        p.fistR = true;
      }
    } else {
      // Shot 5 - avalanche
      if (t < 24.5) {
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'happy';
        p.mouth = 'grin';
        p.headTurn = 8;
        p.paddleSwing = 0.5;
        p.handL = h(-120, 1020);
        p.handR = h(120, 1020);
      } else if (t < 25.0) {
        // Cup shakes, surprise
        p.look = 'right';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headTurn = 8;
        p.paddleSwing = 0;
        p.handL = h(-100, 1100);
        p.handR = h(100, 1100);
      } else if (t < 26.5) {
        // Avalanche starts, tries to shield
        p.look = 'up';
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = -8;
        p.paddleSwing = 0;
        p.handL = h(-120, 1000);
        p.handR = h(120, 1000);
      } else if (t < 28.5) {
        // Buried, only beanie visible (handled by avalanche)
        p.beanieOn = true;
        p.look = 'front';
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.handL = h(-60, 1050);
        p.handR = h(60, 1050);
      } else {
        // Freeze frame with angry vein
        p.beanieOn = true;
        p.look = 'front';
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.handL = h(-60, 1050);
        p.handR = h(60, 1050);
      }
    }
    // Derive hand hold states from paddleSwing and time
    p.holdPaddleR = p.paddleSwing > 0.1;
    // Ball in hand before serving: shot 1 (3.6-6.5), shot 2 (6.0-6.5), shot 3 (12.0-13.0), shot 4 (18.0-20.0)
    p.holdBallR = (t >= 3.6 && t < 6.5) || (t >= 6.0 && t < 6.5) || (t >= 12.0 && t < 13.0) || (t >= 18.0 && t < 20.0);

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

      // Yellow short-sleeved shirt
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

      // Kneeling adjustment
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
    drawLimb(arms.l);
    drawLimb(arms.r);

    // Determine hand styles based on pose
    const leftHandStyle: HandStyle = {
      side: 'left',
      pose: pose.gripL ? 'grip' : pose.fistL ? 'fist' : 'relaxed',
    };
    const rightHandStyle: HandStyle = {
      side: 'right',
      pose: pose.holdPaddleR ? 'paddle'
        : pose.holdBallR ? 'ball'
        : pose.gripR ? 'grip'
        : pose.fistR ? 'fist'
        : pose.pointR ? 'point'
        : 'relaxed',
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

    // Neck
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(cx, cy + r);
    ctx.lineTo(cx, cy + r + 26);
    ctx.stroke();

    // Face
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (pose.beanieOn) this.drawBeanie(ctx, cx, cy);

    // Eyes
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

    // Eyebrows
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

    // Mouth
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

    // Angry vein at end
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