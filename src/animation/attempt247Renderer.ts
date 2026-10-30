import type { StudioConfig } from '../types';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

const INK = '#141414';
const WHITE = '#ffffff';

const WALL = '#cbb9e8';
const WALL_STRIPE = '#c3b0e2';
const WALL_DARK = '#b29ed4';
const CEILING = '#efeafa';
const BASEBOARD = '#f3eefb';

const FLOOR = '#c98a4e';
const FLOOR_LIGHT = '#dda166';
const FLOOR_DARK = '#a86a34';

const SKY = '#bfe4ff';
const SKY_DEEP = '#8fd0f5';

const BIN_GREEN = '#3f9b57';
const BIN_GREEN_DARK = '#2b7440';
const BIN_GREEN_LIGHT = '#58b56f';
const BIN_GREEN_DEEP = '#153a22';

const BIN_GRAY = '#9aa3af';
const BIN_GRAY_DARK = '#737c89';
const BIN_GRAY_LIGHT = '#bcc3cc';
const BIN_GRAY_DEEP = '#3c424c';

const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const SHIRT = '#ffd166';

const PAPER = '#fbfbfb';
const PAPER_SHADE = '#dcdce2';

const FAN_WHITE = '#f7f7fa';
const FAN_SHADE = '#d8d9e2';
const BULB = '#ffe066';

const CONFETTI = ['#ffd166', '#ff5fb0', '#2fb3a8', '#f08a2e', '#8b5cf6', '#ffffff'];

const FLOOR_Y = 1500;
const CEIL_Y = 180;
const HIP_Y = 1200;
const HEAD_R = 70;

const WINDOW = { x: 55, y: 500, w: 220, h: 480 };
const FAN = { x: 370, y: 245 };
const BIN = { x: 930, top: 1150, bottom: FLOOR_Y, topW: 194, botW: 164, rimRY: 26 };
const GRAY_BIN = { x: 600, top: 1408, bottom: FLOOR_Y, topW: 96, botW: 82, rimRY: 10 };

const WALK_LEFT: [number, number] = [6.02, 7.15];
const WALK_RIGHT: [number, number] = [14.18, 14.8];

const BALL_R = 34;

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
function keyAt(keys: Array<[number, number]>, t: number): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, va] = keys[i];
    const [tb, vb] = keys[i + 1];
    if (t >= ta && t <= tb) {
      if (tb - ta < 0.0001) return vb;
      return lerp(va, vb, smooth((t - ta) / (tb - ta)));
    }
  }
  return keys[keys.length - 1][1];
}

type MouthShape = 'flat' | 'smile' | 'grin' | 'o' | 'frown' | 'grit' | 'smirk';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'determined';
type EyeShape = 'open' | 'wide' | 'squint' | 'shut' | 'sly' | 'happy' | 'peek';
type LookDir = 'front' | 'down' | 'up';

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
  legs: 'stand' | 'walk' | 'crouch';
  walkPhase: number;
  handL: Pt;
  handR: Pt;
  bendL: 1 | -1;
  bendR: 1 | -1;
  fistL: boolean;
  fistR: boolean;
  fingersR: number;
  pointR: boolean;
}

interface CharState {
  x: number;
  hipY: number;
  pose: Pose;
}

interface BallState {
  x: number;
  y: number;
  r: number;
  rot: number;
  visible: boolean;
  inBin: boolean;
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

interface FloorBall {
  x: number;
  y: number;
  r: number;
  rot: number;
}

interface ConfettiPiece {
  a: number;
  speed: number;
  spin: number;
  size: number;
  color: string;
  delay: number;
}

const CAPTIONS: CaptionLine[] = [
  { text: 'ATTEMPT #247.', from: 0.15, to: 1.92 },
  { text: 'JUST AIM. EASY.', from: 2.15, to: 5.85 },
  { text: 'NOW FROM FAR AWAY.', from: 6.2, to: 9.9 },
  { text: 'NO-LOOK SHOT.', from: 10.15, to: 13.9 },
  { text: 'THE IMPOSSIBLE BANK SHOT.', from: 14.2, to: 17.95 },
  { text: "IT'S IN?!", from: 18.2, to: 21.95 },
  { text: "IT'S IN!!!", from: 22.12, to: 24.08 },
  { text: '…WAIT.', from: 24.3, to: 25.45 },
  { text: 'BIN #2 💀', from: 25.65, to: 26.95 },
  { text: 'DID YOU SPOT IT? 👀', from: 27.15, to: 29.6 },
];

const COUNTDOWN: Array<[number, string]> = [
  [20.3, '3'],
  [20.77, '2'],
  [21.24, '1'],
];

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 548, y: 1000, zoom: 1.95 },
  { t: 0.85, x: 552, y: 990, zoom: 2.2 },
  { t: 1.99, x: 552, y: 990, zoom: 2.24 },

  { t: 2.0, x: 600, y: 990, zoom: 1.12 },
  { t: 2.9, x: 610, y: 985, zoom: 1.15 },
  { t: 3.7, x: 650, y: 1000, zoom: 1.2 },
  { t: 4.4, x: 650, y: 1030, zoom: 1.22 },
  { t: 5.99, x: 650, y: 1040, zoom: 1.24 },

  { t: 6.01, x: 560, y: 920, zoom: 1.04 },
  { t: 7.4, x: 540, y: 920, zoom: 1.06 },
  { t: 8.29, x: 500, y: 860, zoom: 1.14 },
  { t: 8.3, x: 380, y: 430, zoom: 1.55 },
  { t: 8.61, x: 360, y: 420, zoom: 1.6 },
  { t: 8.63, x: 320, y: 830, zoom: 1.62 },
  { t: 9.89, x: 320, y: 830, zoom: 1.66 },

  { t: 9.92, x: 540, y: 930, zoom: 1.05 },
  { t: 11.39, x: 540, y: 930, zoom: 1.06 },
  { t: 11.41, x: 340, y: 900, zoom: 1.38 },
  { t: 13.2, x: 340, y: 930, zoom: 1.45 },
  { t: 13.94, x: 340, y: 930, zoom: 1.42 },

  { t: 13.96, x: 540, y: 900, zoom: 1.02 },
  { t: 17.0, x: 540, y: 900, zoom: 1.06 },
  { t: 18.0, x: 540, y: 900, zoom: 1.08 },

  { t: 18.45, x: 640, y: 850, zoom: 1.14 },
  { t: 19.0, x: 830, y: 720, zoom: 1.24 },
  { t: 19.5, x: 760, y: 520, zoom: 1.34 },
  { t: 20.14, x: 930, y: 1080, zoom: 1.55 },
  { t: 21.9, x: 930, y: 1080, zoom: 1.62 },

  { t: 21.92, x: 656, y: 1040, zoom: 1.3 },
  { t: 23.3, x: 656, y: 1020, zoom: 1.34 },
  { t: 24.14, x: 656, y: 1010, zoom: 1.3 },

  { t: 24.16, x: 540, y: 900, zoom: 1.02 },
  { t: 25.0, x: 556, y: 940, zoom: 1.06 },
  { t: 25.9, x: 570, y: 980, zoom: 1.12 },
  { t: 26.3, x: 560, y: 1000, zoom: 1.42 },
  { t: 26.99, x: 560, y: 1010, zoom: 1.5 },

  { t: 27.0, x: 492, y: 990, zoom: 2.2 },
  { t: 28.2, x: 494, y: 982, zoom: 2.3 },
  { t: 30.0, x: 496, y: 972, zoom: 2.42 },
];

/* A fixed scatter of crumpled paper on the floor, so every frame agrees. */
function buildFloorBalls(): FloorBall[] {
  const list: FloorBall[] = [];
  let seed = 20261026;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < 34; i++) {
    const x = 40 + rnd() * 1000;
    const y = 1486 + rnd() * 84;
    list.push({ x, y, r: 16 + rnd() * 16, rot: rnd() * TAU });
  }
  // Keep the walk lane and the little heaps readable.
  return list.filter((b) => !(b.x > 360 && b.x < 500 && b.y < 1515));
}

function buildConfetti(): ConfettiPiece[] {
  const list: ConfettiPiece[] = [];
  let seed = 987654321;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < 46; i++) {
    list.push({
      a: rnd() * TAU,
      speed: 260 + rnd() * 420,
      spin: (rnd() - 0.5) * 14,
      size: 9 + rnd() * 10,
      color: CONFETTI[i % CONFETTI.length],
      delay: rnd() * 0.12,
    });
  }
  return list;
}

export class Attempt247Renderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  private readonly floorY = FLOOR_Y;
  private readonly hipY = HIP_Y;
  private readonly headR = HEAD_R;

  private readonly captions = CAPTIONS;
  private readonly countdown = COUNTDOWN;

  private readonly floorBalls = buildFloorBalls();
  private readonly confetti = buildConfetti();

  /** The heap he pulls a fresh ball from at 15.2s. */
  private readonly pickupHeap: FloorBall[] = [
    { x: 408, y: 1482, r: 27, rot: 0.4 },
    { x: 482, y: 1478, r: 29, rot: 1.1 },
    { x: 440, y: 1452, r: 28, rot: 2.3 },
    { x: 492, y: 1444, r: 23, rot: 3.4 },
    { x: 418, y: 1428, r: 24, rot: 4.2 },
    { x: 466, y: 1416, r: 25, rot: 5.1 },
    { x: 442, y: 1392, r: 23, rot: 0.9 },
  ];

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = clamp(time, 0, 30);

    // Shot 1 is a freeze-frame from 0.9s to the cut.
    const visual = t >= 0.9 && t < 1.9 ? 0.9 : t;

    ctx.save();
    ctx.fillStyle = WALL;
    ctx.fillRect(0, 0, this.width, this.height);

    this.applyCamera(ctx, visual);

    this.renderStage(ctx, visual);

    const x = this.charX(visual);
    const ball = this.ballAt(visual, x);
    const char = this.charState(visual, ball);

    this.renderFloorBalls(ctx, visual, x, false);
    this.drawGrayBin(ctx, visual);

    // The green bin is drawn in two passes so a ball falling in disappears
    // behind its front lip.
    this.drawBinBody(ctx, BIN, BIN_GREEN, BIN_GREEN_DARK, BIN_GREEN_LIGHT, BIN_GREEN_DEEP);
    if (ball.visible && ball.inBin) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(BIN.x, BIN.top + 4, BIN.topW / 2 - 8, BIN.rimRY - 4, 0, 0, TAU);
      ctx.clip();
      this.drawPaperBall(ctx, ball.x, ball.y, ball.r, ball.rot);
      ctx.restore();
    }
    this.drawBinRim(ctx, BIN, BIN_GREEN, BIN_GREEN_DARK, BIN_GREEN_LIGHT, BIN_GREEN_DEEP);

    this.drawStickman(ctx, char.x, char.hipY, char.pose, visual, false);

    if (ball.visible && !ball.inBin) {
      this.drawPaperBall(ctx, ball.x, ball.y, ball.r, ball.rot);

      // The ball sits on top of the beanie in shot 3, so its shadow has to sit
      // on the beanie rather than the floor.
      if (visual >= 8.95 && visual < 10.45) {
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(ball.x, 842, ball.r * 0.8, 7, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }

    this.drawStickman(ctx, char.x, char.hipY, char.pose, visual, true);

    this.renderFloorBalls(ctx, visual, x, true);
    this.renderEffects(ctx, visual, char, ball);

    ctx.restore();

    this.renderScreenEffects(ctx, t);

    if (config.showCaptions) {
      this.renderCaption(ctx, t);
      this.renderCountdown(ctx, t);
    }
    if (config.showSafeZones) this.renderSafeZones(ctx);
  }

  // ------------------------------------------------------------------
  // Camera
  // ------------------------------------------------------------------

  private cameraAt(t: number): CameraKey {
    const keys = CAMERA_KEYS;
    if (t <= keys[0].t) return keys[0];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (t >= a.t && t <= b.t) {
        const span = b.t - a.t;
        const u = span <= 0.001 ? 1 : smooth((t - a.t) / span);
        return {
          t,
          x: lerp(a.x, b.x, u),
          y: lerp(a.y, b.y, u),
          zoom: lerp(a.zoom, b.zoom, u),
        };
      }
    }
    return keys[keys.length - 1];
  }

  private shakeAt(t: number): Pt {
    let x = 0;
    let y = 0;
    const punch = (from: number, len: number, amp: number) => {
      if (t < from || t >= from + len) return;
      const u = (t - from) / len;
      const k = (1 - u) * amp;
      x += Math.sin(t * 140) * k;
      y += Math.cos(t * 118) * k * 0.6;
    };
    punch(0.9, 0.24, 8);
    punch(3.66, 0.22, 5);
    punch(4.32, 0.2, 4);
    punch(8.42, 0.24, 6);
    punch(8.92, 0.2, 5);
    punch(11.32, 0.22, 5);
    punch(20.15, 0.26, 7);
    punch(22.0, 0.2, 5);
    punch(24.05, 0.22, 6);
    punch(25.7, 0.2, 4);
    return { x, y };
  }

  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    const cam = this.cameraAt(t);
    const shake = this.shakeAt(t);
    ctx.translate(this.width / 2 + shake.x, this.height / 2 + shake.y);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);
  }

  // ------------------------------------------------------------------
  // Stage: lavender room, window, ceiling fan, wooden floor
  // ------------------------------------------------------------------

  private renderStage(ctx: CanvasRenderingContext2D, t: number) {
    // Ceiling band and back wall
    ctx.fillStyle = CEILING;
    ctx.fillRect(-1200, -800, WIDTH + 2400, CEIL_Y + 800);
    ctx.fillStyle = WALL;
    ctx.fillRect(-1200, CEIL_Y, WIDTH + 2400, FLOOR_Y - CEIL_Y);

    // Faint wall panels keep the flat lavender from looking empty.
    ctx.fillStyle = WALL_STRIPE;
    for (let x = -300; x < WIDTH + 300; x += 180) {
      ctx.fillRect(x, CEIL_Y, 84, FLOOR_Y - CEIL_Y);
    }

    // Ceiling edge
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-1200, CEIL_Y);
    ctx.lineTo(WIDTH + 1200, CEIL_Y);
    ctx.stroke();

    this.drawWindow(ctx);

    // Baseboard
    ctx.fillStyle = BASEBOARD;
    ctx.fillRect(-1200, FLOOR_Y - 52, WIDTH + 2400, 52);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-1200, FLOOR_Y - 52);
    ctx.lineTo(WIDTH + 1200, FLOOR_Y - 52);
    ctx.stroke();

    // Wooden floor
    ctx.fillStyle = FLOOR;
    ctx.fillRect(-1200, FLOOR_Y, WIDTH + 2400, HEIGHT + 600);

    ctx.strokeStyle = FLOOR_DARK;
    ctx.lineWidth = 4;
    for (let y = FLOOR_Y + 74; y < HEIGHT + 300; y += 104) {
      ctx.beginPath();
      ctx.moveTo(-1200, y);
      ctx.lineTo(WIDTH + 1200, y);
      ctx.stroke();
    }
    ctx.strokeStyle = FLOOR_LIGHT;
    ctx.lineWidth = 2;
    for (let y = FLOOR_Y + 78; y < HEIGHT + 300; y += 104) {
      ctx.beginPath();
      ctx.moveTo(-1200, y);
      ctx.lineTo(WIDTH + 1200, y);
      ctx.stroke();
    }
    ctx.strokeStyle = FLOOR_DARK;
    ctx.lineWidth = 4;
    const seams = [80, 300, 520, 760, 980, 1180];
    for (let i = 0; i < seams.length; i++) {
      const sx = seams[i];
      const off = i % 2 === 0 ? 0 : 52;
      for (let y = FLOOR_Y; y < HEIGHT + 300; y += 208) {
        ctx.beginPath();
        ctx.moveTo(sx, y + off);
        ctx.lineTo(sx, y + off + 104);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-1200, FLOOR_Y);
    ctx.lineTo(WIDTH + 1200, FLOOR_Y);
    ctx.stroke();

    this.drawFan(ctx, t);
  }

  private drawWindow(ctx: CanvasRenderingContext2D) {
    const { x, y, w, h } = WINDOW;

    // Sill
    ctx.fillStyle = BASEBOARD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(x - 16, y + h - 4, w + 32, 26);
    ctx.fill();
    ctx.stroke();

    // Glass
    ctx.fillStyle = SKY;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.fillStyle = SKY_DEEP;
    ctx.fillRect(x, y, w, 86);

    // A flat cloud
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(x + 62, y + 190, 30, 0, TAU);
    ctx.arc(x + 104, y + 176, 40, 0, TAU);
    ctx.arc(x + 152, y + 194, 26, 0, TAU);
    ctx.rect(x + 62, y + 186, 90, 26);
    ctx.fill();

    // Frame
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.stroke();
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.moveTo(x, y + h * 0.52);
    ctx.lineTo(x + w, y + h * 0.52);
    ctx.stroke();

    // Two hard shine strokes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 120);
    ctx.lineTo(x + 78, y + 62);
    ctx.moveTo(x + 46, y + 150);
    ctx.lineTo(x + 106, y + 82);
    ctx.stroke();
  }

  private drawFan(ctx: CanvasRenderingContext2D, t: number) {
    // It wobbles for a beat after the ball hits it, then hangs still again.
    let wobble = 0;
    if (t >= 8.42 && t < 9.3) {
      const u = (t - 8.42) / 0.88;
      wobble = Math.sin(u * 34) * 0.09 * (1 - u);
    }

    ctx.save();
    ctx.translate(FAN.x, FAN.y);
    ctx.rotate(wobble);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;

    // Downrod
    ctx.fillStyle = FAN_SHADE;
    ctx.beginPath();
    ctx.rect(-7, -CEIL_Y + FAN.y - 12, 14, 44);
    ctx.fill();
    ctx.stroke();

    // Blades
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i / 4) * TAU + 0.5);
      ctx.fillStyle = i % 2 === 0 ? FAN_WHITE : FAN_SHADE;
      ctx.beginPath();
      ctx.moveTo(-14, 16);
      ctx.lineTo(16, 16);
      ctx.lineTo(30, -96);
      ctx.quadraticCurveTo(4, -112, -20, -96);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Hub + globe
    ctx.fillStyle = FAN_WHITE;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = FAN_SHADE;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fdf4cf';
    ctx.beginPath();
    ctx.arc(0, 34, 13, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Little tink marks on the hit
    if (t >= 8.42 && t < 8.72) {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(FAN.x + 46 + i * 15, FAN.y - 34 + i * 12);
        ctx.lineTo(FAN.x + 68 + i * 15, FAN.y - 52 + i * 12);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  // ------------------------------------------------------------------
  // Bins
  // ------------------------------------------------------------------

  private drawBinBody(
    ctx: CanvasRenderingContext2D,
    bin: { x: number; top: number; bottom: number; topW: number; botW: number },
    fill: string,
    dark: string,
    light: string,
    deep: string
  ) {
    const halfTop = bin.topW / 2;
    const halfBot = bin.botW / 2;

    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';

    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(bin.x - halfTop, bin.top);
    ctx.lineTo(bin.x + halfTop, bin.top);
    ctx.lineTo(bin.x + halfBot, bin.bottom);
    ctx.lineTo(bin.x - halfBot, bin.bottom);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shaded right third
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bin.x - halfTop, bin.top);
    ctx.lineTo(bin.x + halfTop, bin.top);
    ctx.lineTo(bin.x + halfBot, bin.bottom);
    ctx.lineTo(bin.x - halfBot, bin.bottom);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = dark;
    ctx.fillRect(bin.x + halfTop * 0.32, bin.top, halfTop, bin.bottom - bin.top + 10);
    ctx.fillStyle = light;
    ctx.fillRect(bin.x - halfTop, bin.top, halfTop * 0.26, bin.bottom - bin.top + 10);
    ctx.restore();

    // Ridges
    ctx.strokeStyle = dark;
    ctx.lineWidth = 5;
    for (let i = 1; i <= 3; i++) {
      const k = i / 4;
      const tx = bin.x - halfTop + bin.topW * k;
      const bx = bin.x - halfBot + bin.botW * k;
      ctx.beginPath();
      ctx.moveTo(tx, bin.top + 14);
      ctx.lineTo(bx, bin.bottom - 4);
      ctx.stroke();
    }

    // Darker foot line
    ctx.strokeStyle = deep;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(bin.x - halfBot, bin.bottom - 8);
    ctx.lineTo(bin.x + halfBot, bin.bottom - 8);
    ctx.stroke();
    ctx.restore();
  }

  private drawBinRim(
    ctx: CanvasRenderingContext2D,
    bin: { x: number; top: number; topW: number; rimRY: number },
    fill: string,
    dark: string,
    light: string,
    deep: string
  ) {
    void fill;
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;

    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(bin.x, bin.top, bin.topW / 2, bin.rimRY, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = deep;
    ctx.beginPath();
    ctx.ellipse(bin.x, bin.top + 4, bin.topW / 2 - 13, bin.rimRY - 7, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = light;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(bin.x, bin.top, bin.topW / 2 - 5, bin.rimRY - 3, 0, 0.18 * Math.PI, 0.82 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  private drawGrayBin(ctx: CanvasRenderingContext2D, t: number) {
    // On the reveal the paper has been kicked aside so the bin reads at once.
    const clear = t >= 24.16;

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(GRAY_BIN.x, GRAY_BIN.bottom + 2, GRAY_BIN.topW * 0.66, 12, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    this.drawBinBody(ctx, GRAY_BIN, BIN_GRAY, BIN_GRAY_DARK, BIN_GRAY_LIGHT, BIN_GRAY_DEEP);

    if (clear) {
      // A pale rim so the eye lands on it after the hard cut.
      ctx.save();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 5;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(GRAY_BIN.x, GRAY_BIN.top, GRAY_BIN.topW / 2 - 2, GRAY_BIN.rimRY - 1, 0, 0.05 * Math.PI, 0.95 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    this.drawBinRim(ctx, GRAY_BIN, BIN_GRAY, BIN_GRAY_DARK, BIN_GRAY_LIGHT, BIN_GRAY_DEEP);
  }

  // ------------------------------------------------------------------
  // Paper on the floor
  // ------------------------------------------------------------------

  private renderFloorBalls(
    ctx: CanvasRenderingContext2D,
    t: number,
    charX: number,
    front: boolean
  ) {
    for (const b of this.floorBalls) {
      const isFront = b.y >= 1516;
      if (isFront !== front) continue;
      // The reveal hard cut kicks the paper clear of the little grey bin.
      if (t >= 24.16 && Math.hypot(b.x - GRAY_BIN.x, b.y - 1496) < 124) continue;
      this.drawPaperBall(ctx, b.x, b.y, b.r, b.rot);
    }
    for (const b of this.pickupHeap) {
      const isFront = b.y >= 1516;
      if (isFront !== front) continue;
      this.drawPaperBall(ctx, b.x, b.y, b.r, b.rot);
    }
    void charX;
  }

  private drawPaperBall(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    rot: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(3, r * 0.15);
    ctx.lineJoin = 'round';

    const n = 9;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const rr = r * (0.78 + 0.22 * Math.sin(i * 2.7 + 1.3));
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = PAPER;
    ctx.fill();
    ctx.stroke();

    // Crumple creases
    ctx.strokeStyle = PAPER_SHADE;
    ctx.lineWidth = Math.max(2, r * 0.11);
    ctx.beginPath();
    ctx.moveTo(-r * 0.52, -r * 0.18);
    ctx.lineTo(-r * 0.04, r * 0.12);
    ctx.lineTo(r * 0.46, -r * 0.24);
    ctx.moveTo(-r * 0.1, r * 0.5);
    ctx.lineTo(r * 0.1, r * 0.06);
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Character timing
  // ------------------------------------------------------------------

  private charX(t: number): number {
    return keyAt(
      [
        [0, 540],
        [6.0, 540],
        [6.02, 540],
        [7.15, 310],
        [14.15, 310],
        [14.8, 540],
        [24.15, 540],
        [24.16, 492],
        [30, 492],
      ],
      t
    );
  }

  private hipAt(t: number): number {
    return keyAt(
      [
        [0, HIP_Y],
        [7.14, HIP_Y],
        [7.45, 1234],
        [7.8, 1234],
        [8.05, HIP_Y],
        [14.8, HIP_Y],
        [15.2, 1330],
        [15.5, 1330],
        [15.85, HIP_Y],
        [23.1, HIP_Y],
        [23.6, 1052],
        [24.05, HIP_Y],
        [30, HIP_Y],
      ],
      t
    );
  }

  private arc(a: Pt, b: Pt, u: number, h: number): Pt {
    return {
      x: lerp(a.x, b.x, u),
      y: lerp(a.y, b.y, u) - Math.sin(u * Math.PI) * h,
    };
  }

  private quad(a: Pt, c: Pt, b: Pt, u: number): Pt {
    const v = 1 - u;
    return {
      x: v * v * a.x + 2 * v * u * c.x + u * u * b.x,
      y: v * v * a.y + 2 * v * u * c.y + u * u * b.y,
    };
  }

  // ------------------------------------------------------------------
  // Ball timeline
  // ------------------------------------------------------------------

  private ballAt(t: number, x: number): BallState {
    const R = BALL_R;
    const rest = this.floorY - R;
    const b = (bx: number, by: number, rot = 0, inBin = false): BallState => ({
      x: bx,
      y: by,
      r: R,
      rot,
      visible: true,
      inBin,
    });

    if (t < 2.0) {
      if (t < 0.9) {
        const u = smooth(t / 0.9);
        return b(lerp(602, 630, u), lerp(1030, 958, u), 0.4 + u * 0.6);
      }
      return b(630, 958, 1.0);
    }

    if (t < 6.0) {
      // Shot 2: the easy shot.
      if (t < 2.9) return b(625, 1032 + Math.sin(t * 3.2) * 4, t * 1.4);
      if (t < 3.05) {
        const u = smooth((t - 2.9) / 0.15);
        return b(lerp(625, 583, u), lerp(1032, 1064, u), 2 + u * 0.4);
      }
      if (t < 3.66) {
        const u = clamp((t - 3.05) / 0.61, 0, 1);
        const p = this.arc({ x: 610, y: 1008 }, { x: 905, y: 1148 }, u, 200);
        return b(p.x, p.y, u * 10);
      }
      if (t < 3.95) {
        const u = smooth((t - 3.66) / 0.29);
        return b(lerp(905, 856, u), lerp(1148, 1078, u), 4);
      }
      if (t < 4.32) {
        const u = (t - 3.95) / 0.37;
        return b(lerp(856, 792, u), lerp(1078, rest, u * u), 5);
      }
      if (t < 4.55) {
        const u = (t - 4.32) / 0.23;
        return b(lerp(792, 784, u), rest - Math.sin(u * Math.PI) * 44, 6);
      }
      if (t < 4.78) {
        const u = (t - 4.55) / 0.23;
        return b(784, rest - Math.sin((1 - u) * Math.PI * 0.5) * 10, 6);
      }
      return b(782, rest, 6.4);
    }

    if (t < 10.0) {
      // Shot 3: the walk, the sky-high arc, the fan, the beanie.
      if (t < 7.15) return b(x + 70, 1052 + Math.sin(t * 11) * 10, t * 2.2);
      if (t < 7.8) {
        const u = smooth((t - 7.15) / 0.65);
        return b(lerp(380, 330, u), lerp(1052, 1100, u), 2 + u);
      }
      if (t < 8.42) {
        const u = clamp((t - 7.8) / 0.62, 0, 1);
        const p = this.quad({ x: 370, y: 962 }, { x: 214, y: 470 }, { x: 356, y: 330 }, u);
        return b(p.x, p.y, u * 12);
      }
      if (t < 8.95) {
        const u = (t - 8.42) / 0.53;
        return b(lerp(356, 312, u), lerp(330, 808, u * u), 8);
      }
      if (t < 9.2) {
        const u = (t - 8.95) / 0.25;
        return b(310, 808 - Math.sin(u * Math.PI) * 12, 8);
      }
      return b(310, 808, 8.2);
    }

    if (t < 14.0) {
      // Shot 4: the no-look flick into the window.
      if (t < 10.45) {
        const u = smooth((t - 10.0) / 0.45);
        return b(lerp(310, 332, u), lerp(808, 860, u), 8 + u);
      }
      if (t < 11.0) {
        const u = smooth((t - 10.45) / 0.55);
        return b(lerp(332, 300, u), lerp(860, 870, u), 9);
      }
      if (t < 11.32) {
        const u = (t - 11.0) / 0.32;
        const p = this.quad({ x: 300, y: 868 }, { x: 252, y: 760 }, { x: 200, y: 690 }, u);
        return b(p.x, p.y, 9 + u * 6);
      }
      if (t < 12.05) {
        const u = (t - 11.32) / 0.73;
        return b(lerp(200, 340, u), lerp(690, rest, u * u), 12);
      }
      if (t < 12.3) {
        const u = (t - 12.05) / 0.25;
        return b(lerp(340, 356, u), rest - Math.sin(u * Math.PI) * 38, 13);
      }
      const u = clamp((t - 12.3) / 1.1, 0, 1);
      return b(lerp(356, 392, u), rest, 13.4);
    }

    if (t < 18.0) {
      // Shot 5: the fresh ball on the heap, then the plan.
      if (t < 15.2) return b(450, 1372, 0.5);
      if (t < 15.55) {
        const u = smooth((t - 15.2) / 0.35);
        return b(lerp(450, 498, u), lerp(1372, 1090, u), 1 + u * 2);
      }
      if (t < 17.05) {
        const u = smooth((t - 15.55) / 1.5);
        return b(lerp(498, 512, u), lerp(1090, 1064, u), 3 + Math.sin(t * 4) * 0.3);
      }
      if (t < 17.25) {
        const u = smooth((t - 17.05) / 0.2);
        return b(lerp(512, 572, u), lerp(1064, 1060, u), 3.4);
      }
      const u = smooth((t - 17.25) / 0.75);
      return b(lerp(572, 600, u), lerp(1060, 1068, u), 3.6);
    }

    if (t < 22.0) {
      // Shot 6: the impossible bank shot.
      if (t < 18.35) {
        const u = smooth((t - 18.0) / 0.35);
        return b(lerp(600, 636, u), lerp(1068, 992, u), 3.6 + u);
      }
      if (t < 19.0) {
        const u = clamp((t - 18.35) / 0.65, 0, 1);
        const p = this.quad({ x: 636, y: 988 }, { x: 900, y: 760 }, { x: 1008, y: 640 }, u);
        return b(p.x, p.y, 5 + u * 8);
      }
      if (t < 19.5) {
        const u = smooth((t - 19.0) / 0.5);
        return b(lerp(1008, 748, u), lerp(640, 212, u) - Math.sin(u * Math.PI) * 46, 13);
      }
      if (t < 20.15) {
        const u = (t - 19.5) / 0.65;
        return b(lerp(748, 930, u), lerp(212, 1134, u * u), 14);
      }
      if (t < 21.75) {
        const u = (t - 20.15) / 1.6;
        const a = -Math.PI / 2 + u * (TAU * 3 + 3.66);
        return b(930 + Math.cos(a) * 92, 1150 + Math.sin(a) * 26, 15 + u * 6);
      }
      const u = (t - 21.75) / 0.25;
      return b(884 + Math.sin(u * 26) * 3, 1172 + Math.sin(u * 22) * 3, 21);
    }

    if (t < 22.3) {
      const u = (t - 22.0) / 0.3;
      return b(lerp(884, 930, u), lerp(1172, 1262, u * u), 21, true);
    }

    if (t < 27.0) {
      return { x: 0, y: 0, r: R, rot: 0, visible: false, inBin: true };
    }

    // Shot 8: the fresh ball comes back up.
    const u = smooth((t - 27.0) / 0.4);
    return b(lerp(500, 567, u), lerp(1112, 958, u), 0.4 + u * 0.6);
  }
  // ------------------------------------------------------------------
  // Character
  // ------------------------------------------------------------------

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
      handL: { x: 420, y: 1200 },
      handR: { x: 660, y: 1200 },
      bendL: 1,
      bendR: 1,
      fistL: false,
      fistR: false,
      fingersR: 0,
      pointR: false,
    };
  }

  private charState(t: number, ball: BallState): CharState {
    const x = this.charX(t);
    const hipY = this.hipAt(t);
    const pose = this.defaultPose();
    const hang = (dx: number, dy: number): Pt => ({ x: x + dx, y: hipY + dy });
    const holdR = (): Pt => ({ x: ball.x, y: ball.y + 26 });
    const holdL = (): Pt => ({ x: ball.x, y: ball.y + 26 });

    const walking =
      (t > WALK_LEFT[0] && t < WALK_LEFT[1]) || (t > WALK_RIGHT[0] && t < WALK_RIGHT[1]);
    if (walking) {
      pose.legs = 'walk';
      pose.walkPhase = t * 11;
    }

    if (t < 2.0) {
      // Shot 1: exhausted, determined, ball up beside his face.
      pose.brow = 'angry';
      pose.eye = 'squint';
      pose.mouth = 'grit';
      pose.lean = 0.02;
      pose.handR = holdR();
      pose.handL = hang(-88, 30);
      pose.bendR = -1;
      pose.fingersR = 2;
    } else if (t < 6.0) {
      // Shot 2: the easy shot.
      if (t < 2.9) {
        const u = (t - 2.0) / 0.9;
        pose.brow = 'cocky';
        pose.eye = 'sly';
        pose.mouth = 'smirk';
        pose.handR = holdR();
        pose.handL = hang(-98, 10 + Math.sin(u * Math.PI * 2) * 30);
        pose.bendR = -1;
        pose.bendL = -1;
      } else if (t < 3.05) {
        pose.brow = 'cocky';
        pose.eye = 'sly';
        pose.mouth = 'smirk';
        pose.handR = holdR();
        pose.handL = hang(-92, 40);
        pose.bendR = -1;
        pose.lean = -0.04;
      } else if (t < 3.72) {
        pose.handR = hang(96, -190);
        pose.handL = hang(-70, 30);
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'smirk';
        pose.lean = 0.07;
        pose.bendR = -1;
      } else if (t < 4.05) {
        pose.handR = hang(96, -160);
        pose.handL = hang(-70, 30);
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.lean = 0.05;
      } else if (t < 4.45) {
        pose.handR = hang(88, -140);
        pose.handL = hang(-60, 40);
        pose.brow = 'sad';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.look = 'down';
        pose.headDrop = 6;
      } else {
        pose.lean = -0.06;
        pose.headDrop = 18;
        pose.brow = 'sad';
        pose.eye = 'open';
        pose.mouth = 'frown';
        pose.handL = hang(-72, 70);
        pose.handR = hang(72, 70);
      }
    } else if (t < 10.0) {
      // Shot 3: walk back, moon shot, fan tink, beanie hat.
      if (t < 7.15) {
        pose.handR = holdR();
        pose.handL = { x: x - 72, y: hipY - 70 };
        pose.brow = 'determined';
        pose.eye = 'open';
        pose.mouth = 'flat';
        pose.bendR = -1;
      } else if (t < 7.5) {
        pose.handR = holdR();
        pose.handL = hang(-64, -20);
        pose.brow = 'determined';
        pose.eye = 'squint';
        pose.mouth = 'grit';
        pose.lean = -0.06;
        pose.bendR = -1;
      } else if (t < 7.8) {
        pose.handR = holdR();
        pose.handL = hang(-60, 0);
        pose.brow = 'determined';
        pose.eye = 'squint';
        pose.mouth = 'grit';
        pose.lean = 0.06;
        pose.bendR = -1;
      } else if (t < 8.42) {
        pose.handR = hang(86, -240);
        pose.handL = hang(-64, 10);
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'grin';
        pose.lean = 0.08;
      } else if (t < 8.95) {
        pose.handR = hang(80, 10);
        pose.handL = hang(-80, 10);
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.look = 'up';
        pose.headDrop = -6;
      } else if (t < 9.45) {
        pose.handR = hang(76, 20);
        pose.handL = hang(-76, 20);
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'flat';
        pose.headDrop = 2;
      } else if (t < 9.62) {
        pose.handR = hang(72, 26);
        pose.handL = hang(-72, 26);
        pose.brow = 'raised';
        pose.eye = 'shut';
        pose.mouth = 'flat';
      } else {
        pose.handR = hang(70, 30);
        pose.handL = hang(-70, 30);
        pose.brow = 'cocky';
        pose.eye = 'open';
        pose.mouth = 'flat';
      }
    } else if (t < 14.0) {
      // Shot 4: the no-look flick.
      if (t < 10.45) {
        pose.handR = holdR();
        pose.handL = hang(-72, 20);
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'flat';
        pose.bendR = -1;
      } else if (t < 10.9) {
        pose.handR = holdR();
        pose.handL = hang(-70, 20);
        pose.headTurn = -22;
        pose.eye = 'shut';
        pose.mouth = 'smirk';
        pose.brow = 'cocky';
        pose.lean = -0.05;
        pose.bendR = -1;
      } else if (t < 11.0) {
        pose.handR = { x: x - 10, y: hipY - 304 };
        pose.handL = hang(-66, 10);
        pose.headTurn = -22;
        pose.eye = 'shut';
        pose.mouth = 'smirk';
        pose.brow = 'cocky';
        pose.lean = -0.04;
        pose.bendR = -1;
      } else if (t < 12.4) {
        pose.handR = hang(44, -360);
        pose.handL = hang(-60, 10);
        pose.headTurn = -24;
        pose.eye = 'shut';
        pose.mouth = 'smirk';
        pose.brow = 'cocky';
        pose.lean = -0.05;
        pose.bendR = -1;
      } else if (t < 13.15) {
        pose.handR = hang(60, 20);
        pose.handL = hang(-60, 20);
        pose.headTurn = -10;
        pose.eye = 'peek';
        pose.mouth = 'flat';
        pose.brow = 'raised';
        pose.lean = -0.02;
      } else {
        pose.handR = hang(66, 30);
        pose.handL = hang(-66, 30);
        pose.brow = 'sad';
        pose.eye = 'open';
        pose.mouth = 'frown';
        pose.lean = -0.06;
        pose.headDrop = 10;
      }
    } else if (t < 18.0) {
      // Shot 5: the plan.
      if (t < 14.15) {
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.look = 'up';
        pose.headDrop = -6;
        pose.handL = hang(-80, 20);
        pose.handR = hang(80, 20);
      } else if (t < 14.8) {
        pose.handL = { x: x - 70, y: hipY - 60 };
        pose.handR = { x: x + 70, y: hipY - 60 };
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'flat';
        pose.look = 'up';
      } else if (t < 15.25) {
        pose.lean = 0.02;
        pose.look = 'down';
        pose.headDrop = 12;
        pose.handL = { x: x - 90, y: 1398 };
        pose.handR = hang(64, 40);
        pose.brow = 'determined';
        pose.eye = 'squint';
        pose.mouth = 'flat';
        pose.bendL = -1;
      } else if (t < 15.7) {
        pose.handL = holdL();
        pose.handR = hang(64, 30);
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'smile';
      } else if (t < 16.25) {
        pose.handL = holdL();
        pose.handR = { x: x + 66, y: hipY - 250 };
        pose.brow = 'raised';
        pose.eye = 'squint';
        pose.mouth = 'flat';
        pose.look = 'up';
        pose.headTilt = 0.03;
        pose.bendR = -1;
      } else if (t < 16.75) {
        pose.handL = holdL();
        pose.handR = { x: x + 66, y: hipY - 250 };
        pose.brow = 'determined';
        pose.eye = 'squint';
        pose.mouth = 'grit';
        pose.headTilt = 0.08;
        pose.bendR = -1;
      } else if (t < 17.2) {
        const wig = Math.sin((t - 16.75) * 22) * 8;
        pose.handL = { x: x - 34 + wig, y: hipY - 120 };
        pose.handR = { x: x + 34 - wig, y: hipY - 120 };
        pose.brow = 'cocky';
        pose.eye = 'sly';
        pose.mouth = 'grin';
      } else {
        pose.handR = holdR();
        pose.handL = { x: x - 70, y: hipY - 160 };
        pose.brow = 'determined';
        pose.eye = 'squint';
        pose.mouth = 'grit';
        pose.lean = -0.06;
        pose.bendR = -1;
      }
    } else if (t < 22.0) {
      // Shot 6: the impossible bank shot.
      if (t < 18.35) {
        pose.handR = holdR();
        pose.handL = hang(-70, -40);
        pose.brow = 'determined';
        pose.eye = 'squint';
        pose.mouth = 'grit';
        pose.lean = 0.1;
        pose.bendR = -1;
      } else if (t < 20.2) {
        pose.handR = hang(96, -240);
        pose.handL = hang(-66, -10);
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.look = 'up';
        pose.lean = 0.1;
      } else {
        const tremble = Math.sin(t * 24) * 2;
        pose.handL = { x: x - 16 + tremble, y: hipY - 110 };
        pose.handR = { x: x + 16 - tremble, y: hipY - 110 };
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.look = 'up';
        pose.lean = 0.06;
      }
    } else if (t < 27.0) {
      // Shot 7: the win, the reveal, the fury.
      if (t < 22.35) {
        pose.handL = hang(-70, -40);
        pose.handR = hang(70, -40);
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.look = 'up';
        pose.lean = 0.08;
      } else if (t < 23.1) {
        pose.handL = hang(-80, 0);
        pose.handR = hang(80, 0);
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.lean = 0.02;
      } else if (t < 24.15) {
        pose.handL = { x: x - 130, y: hipY - 300 };
        pose.handR = { x: x + 130, y: hipY - 300 };
        pose.brow = 'raised';
        pose.eye = 'happy';
        pose.mouth = 'grin';
        pose.bendL = -1;
        pose.bendR = -1;
      } else if (t < 24.9) {
        const u = smooth((t - 24.16) / 0.74);
        pose.handL = { x: x - 130, y: lerp(900, hipY - 60, u) };
        pose.handR = { x: x + 130, y: lerp(900, hipY - 60, u) };
        pose.brow = 'normal';
        pose.eye = 'open';
        pose.mouth = 'flat';
      } else if (t < 25.6) {
        pose.handL = hang(-80, 20);
        pose.handR = hang(80, 20);
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'flat';
        pose.look = 'down';
        pose.headDrop = 16;
      } else if (t < 26.3) {
        pose.handL = hang(-80, 20);
        pose.handR = hang(80, 20);
        pose.brow = 'sad';
        pose.eye = 'open';
        pose.mouth = 'frown';
        pose.look = 'down';
        pose.headDrop = 18;
      } else {
        pose.handL = hang(-80, 24);
        pose.handR = hang(80, 24);
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.mouth = 'grit';
        pose.lean = 0.03;
      }
    } else {
      // Shot 8: the end frame call-back.
      pose.handR = holdR();
      pose.handL = hang(-88, 30);
      pose.brow = 'angry';
      pose.eye = 'squint';
      pose.mouth = 'grit';
      pose.lean = 0.02;
      pose.bendR = -1;
      pose.fingersR = 2;
    }

    return { x, hipY, pose };
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
    t: number,
    armsOnly: boolean
  ) {
    const lean = pose.lean;
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(lean) * 170;

    ctx.save();
    ctx.lineCap = 'round';

    if (!armsOnly) {
      // Legs
      ctx.strokeStyle = INK;
      ctx.lineWidth = 16;
      ctx.beginPath();
      if (pose.legs === 'walk') {
        const stride = Math.sin(pose.walkPhase) * 48;
        const liftL = Math.max(0, Math.sin(pose.walkPhase)) * 22;
        const liftR = Math.max(0, -Math.sin(pose.walkPhase)) * 22;
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX - 36 + stride, this.floorY - liftL);
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX + 36 - stride, this.floorY - liftR);
      } else {
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX - 44, this.floorY);
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX + 44, this.floorY);
      }
      ctx.stroke();

      // Body: yellow shirt
      ctx.fillStyle = SHIRT;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(hipX - 34, hipY + 4);
      ctx.lineTo(bodyTopX - 34, shoulderY);
      ctx.lineTo(bodyTopX + 34, shoulderY);
      ctx.lineTo(hipX + 34, hipY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Arms (IK)
    const arms = this.computeArms(pose, hipX, hipY);
    const drawLimb = (a: { sx: number; sy: number; ex: number; ey: number; hx: number; hy: number }) => {
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

    const drawHand = (
      a: { hx: number; hy: number },
      fist: boolean,
      fingers: number,
      point: boolean
    ) => {
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(a.hx, a.hy, point ? 16 : fist ? 15 : 12, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (point) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 17;
        ctx.beginPath();
        ctx.moveTo(a.hx - 2, a.hy - 4);
        ctx.lineTo(a.hx - 22, a.hy + 32);
        ctx.stroke();
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(a.hx - 2, a.hy - 4);
        ctx.lineTo(a.hx - 22, a.hy + 32);
        ctx.stroke();
      }
      if (fingers > 0) {
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(a.hx - 12, a.hy + 10);
        ctx.lineTo(a.hx - 14, a.hy + 30);
        ctx.moveTo(a.hx + 12, a.hy + 10);
        ctx.lineTo(a.hx + 14, a.hy + 30);
        ctx.stroke();
      }
    };
    drawHand(arms.l, pose.fistL, 0, false);
    drawHand(arms.r, pose.fistR, pose.fingersR, pose.pointR);

    if (!armsOnly) {
      const headX = bodyTopX + Math.sin(pose.headTilt) * 10;
      const headY = shoulderY - 78 + pose.headDrop;
      this.drawHead(ctx, headX, headY, pose, t);
    }

    ctx.restore();
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

    // Red beanie
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

    // Eyes
    const eyeShift = pose.look === 'down' ? 7 : pose.look === 'up' ? -6 : 0;
    const eyeY = cy + 8 + eyeShift;
    const eyeDX = 26;
    const fx = cx + turn;

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
    } else if (pose.eye === 'sly') {
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(fx + side * eyeDX, eyeY, 12, 8, 0, 0, TAU);
        ctx.fill();
      }
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(fx + side * (eyeDX - 12), eyeY - 12);
        ctx.lineTo(fx + side * (eyeDX + 12), eyeY - 12);
        ctx.stroke();
      }
    } else {
      const eyeH = pose.eye === 'wide' ? 30 : pose.eye === 'squint' ? 8 : 20;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(fx + side * eyeDX, eyeY, 11, eyeH / 2, 0, 0, TAU);
        ctx.fill();
      }
    }

    // Eyebrows
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    const browY = cy - 12;
    const twitch = t < 2.0 ? Math.sin(t * 31) * 2 : 0;
    ctx.beginPath();
    if (pose.brow === 'angry' || pose.brow === 'determined') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY + 8 + twitch);
      ctx.moveTo(fx + 42, browY - 8);
      ctx.lineTo(fx + 12, browY + 8 - twitch);
    } else if (pose.brow === 'raised') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY - 8);
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
  }
  // ------------------------------------------------------------------
  // Effects
  // ------------------------------------------------------------------

  private drawBurst(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    points: number,
    color: string,
    rot = 0
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const a = (i / (points * 2)) * TAU;
      const rr = i % 2 === 0 ? r : r * 0.45;
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawSweat(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#7dd3fc';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.85, s * 0.15, 0, s * 0.8);
    ctx.quadraticCurveTo(-s * 0.85, s * 0.15, 0, -s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private renderEffects(
    ctx: CanvasRenderingContext2D,
    t: number,
    char: CharState,
    ball: BallState
  ) {
    // Shot 1: a nervous bead of sweat.
    if (t >= 0.3 && t < 1.9) {
      const u = clamp((t - 0.3) / 1.6, 0, 1);
      this.drawSweat(ctx, char.x + 56, 892 + u * 44, 13);
    }

    // Shot 2: rim clank, floor puff.
    if (t >= 3.62 && t < 3.92) {
      const u = (t - 3.62) / 0.3;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      this.drawBurst(ctx, 905, 1146, 42 + u * 18, 7, WHITE, u * 0.4);
      ctx.restore();
    }
    if (t >= 4.3 && t < 4.68) {
      const u = (t - 4.3) / 0.38;
      ctx.save();
      ctx.globalAlpha = (1 - u) * 0.45;
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.ellipse(790, 1476, 40 + u * 46, 12 + u * 8, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // Shot 3: the ball lands on the beanie.
    if (t >= 8.92 && t < 9.2) {
      const u = (t - 8.92) / 0.28;
      ctx.save();
      ctx.globalAlpha = 1 - u * 0.6;
      this.drawBurst(ctx, 310, 842, 34 + u * 22, 6, '#ffe066', u * 0.5);
      ctx.restore();
    }

    // Shot 4: window knock.
    if (t >= 11.28 && t < 11.6) {
      const u = (t - 11.28) / 0.32;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 4;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + 0.6;
        ctx.beginPath();
        ctx.moveTo(200 + Math.cos(a) * (34 + u * 16), 690 + Math.sin(a) * (34 + u * 16));
        ctx.lineTo(200 + Math.cos(a) * (58 + u * 26), 690 + Math.sin(a) * (58 + u * 26));
        ctx.stroke();
      }
      this.drawBurst(ctx, 200, 690, 26, 5, WHITE, 0.3);
      ctx.restore();
    }

    // Shot 5: the lightbulb.
    if (t >= 14.0 && t < 15.28) {
      const pop = clamp((t - 14.0) / 0.16, 0, 1);
      const fade = t > 15.0 ? clamp(1 - (t - 15.0) / 0.28, 0, 1) : 1;
      const scale = 0.5 + 0.5 * smooth(pop) + Math.sin(clamp(pop, 0, 1) * Math.PI) * 0.22;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(char.x, 786);
      ctx.scale(scale, scale);

      // Rays
      ctx.strokeStyle = '#ffb703';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 48, Math.sin(a) * 48);
        ctx.lineTo(Math.cos(a) * 70, Math.sin(a) * 70);
        ctx.stroke();
      }

      // Bulb
      ctx.fillStyle = BULB;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#c9ccd6';
      ctx.beginPath();
      ctx.rect(-13, 28, 26, 20);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#b8860b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-8, 4);
      ctx.lineTo(0, -10);
      ctx.lineTo(8, 4);
      ctx.stroke();
      ctx.restore();
    }

    // Shot 5: the planned bank line.
    if (t >= 16.1 && t < 17.75) {
      const pulse = 0.55 + Math.sin((t - 16.1) * 7) * 0.15;
      const alpha = clamp(Math.min((t - 16.1) / 0.2, (17.75 - t) / 0.3), 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha * pulse;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([18, 14]);
      const path = () => {
        ctx.beginPath();
        ctx.moveTo(600, 1000);
        ctx.lineTo(1008, 640);
        ctx.lineTo(748, 212);
        ctx.lineTo(930, 1134);
        ctx.stroke();
      };
      ctx.strokeStyle = INK;
      ctx.lineWidth = 9;
      path();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 4;
      path();
      ctx.setLineDash([]);
      // Bounce nodes
      for (const p of [{ x: 1008, y: 640 }, { x: 748, y: 212 }, { x: 930, y: 1134 }]) {
        ctx.fillStyle = WHITE;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Shot 6: slow-motion streaks behind the ball.
    if (t >= 18.45 && t < 20.1 && ball.visible) {
      const prev = this.ballAt(t - 0.04, char.x);
      const dx = ball.x - prev.x;
      const dy = ball.y - prev.y;
      const len = Math.hypot(dx, dy) || 1;
      ctx.save();
      ctx.strokeStyle = WHITE;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < 3; i++) {
        const off = (i - 1) * 14;
        ctx.lineWidth = 7 - i * 2;
        ctx.beginPath();
        ctx.moveTo(ball.x - (dx / len) * (ball.r + 16) - (dy / len) * off,
          ball.y - (dy / len) * (ball.r + 16) + (dx / len) * off);
        ctx.lineTo(ball.x - (dx / len) * (ball.r + 76) - (dy / len) * off,
          ball.y - (dy / len) * (ball.r + 76) + (dx / len) * off);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Shot 6: the rim tick marks.
    if (t >= 20.15 && t < 21.85) {
      ctx.save();
      ctx.strokeStyle = WHITE;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(930, 1150, 104, 32, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // Shot 7: the confetti burst.
    if (t >= 23.1 && t < 24.16) {
      const ox = char.x;
      const oy = char.hipY - 300;
      for (const c of this.confetti) {
        const u = t - 23.1 - c.delay;
        if (u < 0 || u > 1.0) continue;
        const px = ox + Math.cos(c.a) * c.speed * u;
        const py = oy + Math.sin(c.a) * c.speed * u + 0.5 * 1500 * u * u;
        if (py > this.floorY + 20) continue;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(c.spin * u + c.a);
        ctx.fillStyle = c.color;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(-c.size / 2, -c.size / 3, c.size, c.size * 0.66);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // Shot 7: fury marks on the reveal.
    if (t >= 26.3 && t < 27.0) {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const hx = char.x + 76;
      const hy = char.hipY - 250;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(hx + 8 + i * 15, hy + 8 + i * 10);
        ctx.lineTo(hx + 28 + i * 15, hy - 10 + i * 10);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Shot 8: one last bead of sweat.
    if (t >= 28.1) {
      const u = clamp((t - 28.1) / 1.9, 0, 1);
      this.drawSweat(ctx, char.x + 58, 894 + u * 40, 12);
    }
  }

  private renderScreenEffects(ctx: CanvasRenderingContext2D, t: number) {
    // White graphic flash on the shot 1 freeze.
    if (t >= 0.9 && t < 1.16) {
      const u = (t - 0.9) / 0.26;
      ctx.save();
      ctx.globalAlpha = (1 - u) * 0.75;
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }
    // A short flash as the ball drops into the bin.
    if (t >= 22.0 && t < 22.1) {
      const u = (t - 22.0) / 0.1;
      ctx.save();
      ctx.globalAlpha = (1 - u) * 0.35;
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------
  // Captions and guides
  // ------------------------------------------------------------------

  private renderCaption(ctx: CanvasRenderingContext2D, t: number) {
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
    let size = 78;
    ctx.font = `900 ${size}px ${family}`;
    const width = ctx.measureText(line.text).width;
    if (width > 950) {
      size = Math.max(46, Math.floor((size * 950) / width));
      ctx.font = `900 ${size}px ${family}`;
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(14, size * 0.26);
    ctx.strokeText(line.text, 0, 0);
    ctx.fillStyle = WHITE;
    ctx.fillText(line.text, 0, 0);
    ctx.restore();
  }

  private renderCountdown(ctx: CanvasRenderingContext2D, t: number) {
    for (const [at, text] of this.countdown) {
      const from = at;
      const to = at + 0.39;
      if (t < from || t >= to) continue;
      const u = clamp((t - from) / 0.1, 0, 1);
      const fade = Math.min(1, (to - t) / 0.1);
      const alpha = clamp(Math.min((t - from) / 0.05, fade), 0, 1);
      const scale = 1 - (1 - u) * 0.4 + Math.sin(u * Math.PI) * 0.22;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.width / 2, 1260);
      ctx.scale(scale, scale);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.font = '900 260px "Arial Black", "Helvetica Neue", Arial, sans-serif';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 30;
      ctx.strokeText(text, 0, 0);
      ctx.fillStyle = WHITE;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }

  private renderSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 10]);
    ctx.strokeRect(48, 120, this.width - 96, this.height - 240);
    ctx.strokeRect(this.width - 152, 340, 100, 1100);
    ctx.strokeRect(60, 1590, this.width - 120, 210);
    ctx.setLineDash([]);
    ctx.restore();
  }
}
