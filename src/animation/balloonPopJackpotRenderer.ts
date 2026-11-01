import type { StudioConfig } from '../types';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

const INK = '#141414';
const WHITE = '#ffffff';
const CREAM = '#fff4e2';
const CREAM_DEEP = '#f4dfbe';
const FLOOR = '#f7e6c8';
const FLOOR_LINE = '#dcc09a';

const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const SHIRT = '#ffd166';
const TROUSER = '#2f5fa8';
const TROUSER_DEEP = '#22457c';
const SHOE = '#141414';

const WOOD = '#b5652f';
const WOOD_DARK = '#8a4a20';
const WOOD_DEEP = '#613013';
const BOARD = '#1e3355';
const BOARD_DEEP = '#162640';
const BOARD_LINE = '#2f4a74';
const CURTAIN = '#b3222e';
const CURTAIN_DEEP = '#8c1822';
const GOLD = '#f5c542';
const GOLD_DEEP = '#c8961a';
const GOLD_LIGHT = '#ffe9a8';
const GLASS = 'rgba(196, 232, 255, 0.22)';

const FLOOR_Y = 1520;
const HIP_Y = 1220;
const HEAD_R = 70;
const CHAR_X = 150;

const BOOTH_L = 290;
const BOOTH_R = 1010;
const BOARD_L = 340;
const BOARD_R = 960;
const BOARD_T = 545;
const BOARD_B = 1170;
const COUNTER_Y = 1170;

const GOLD_X = 640;
const GOLD_Y = 855;
const GOLD_R = 118;

type MouthShape = 'flat' | 'smile' | 'grin' | 'o' | 'frown' | 'grit' | 'smirk';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'determined';
type EyeShape = 'open' | 'wide' | 'squint' | 'shut' | 'happy' | 'peek';
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
  legs: 'stand' | 'walk';
  walkPhase: number;
  handL: Pt;
  handR: Pt;
  bendL: 1 | -1;
  bendR: 1 | -1;
  fistL: boolean;
  fistR: boolean;
  pointR: boolean;
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

interface BalloonDef {
  x: number;
  y: number;
  r: number;
  body: string;
  shade: string;
}

interface DartSpec {
  id: string;
  launch: number;
  impact: number;
  to: Pt;
  arc: number;
  after: 'stick' | 'fall';
  rest?: Pt;
  fallEnd?: number;
}

const BALLOONS: BalloonDef[] = [
  { x: 400, y: 660, r: 46, body: '#ef4444', shade: '#b91c1c' },
  { x: 520, y: 660, r: 46, body: '#3b82f6', shade: '#1d4ed8' },
  { x: 640, y: 660, r: 46, body: '#facc15', shade: '#ca8a04' },
  { x: 760, y: 660, r: 46, body: '#22c55e', shade: '#15803d' },
  { x: 880, y: 660, r: 46, body: '#a855f7', shade: '#7e22ce' },
  { x: 400, y: 1050, r: 46, body: '#ec4899', shade: '#be185d' },
  { x: 520, y: 1050, r: 46, body: '#ef4444', shade: '#b91c1c' },
  { x: 640, y: 1050, r: 46, body: '#3b82f6', shade: '#1d4ed8' },
  { x: 760, y: 1050, r: 46, body: '#facc15', shade: '#ca8a04' },
  { x: 880, y: 1050, r: 46, body: '#22c55e', shade: '#15803d' },
];

// The three darts of shot 3 pop these balloons; every other target balloon is
// cleared by the compartment balloon stream at 15.26s.
const BALLOON_POPS: (number | null)[] = [
  12.6, null, null, null, 13.4, null, null, null, 14.2, null,
];
const SWEEP_TIME = 15.26;

const DARTS: DartSpec[] = [
  { id: 'a', launch: 6.5, impact: 6.95, to: { x: 600, y: 500 }, arc: 120, after: 'stick' },
  { id: 'b', launch: 8.3, impact: 8.78, to: { x: 470, y: 1492 }, arc: 80, after: 'stick' },
  {
    id: 'c',
    launch: 9.7,
    impact: 10.02,
    to: { x: 556, y: 590 },
    arc: 70,
    after: 'fall',
    rest: { x: 520, y: 1496 },
    fallEnd: 10.75,
  },
  { id: 'd', launch: 12.35, impact: 12.6, to: { x: 400, y: 660 }, arc: 55, after: 'stick' },
  { id: 'e', launch: 13.15, impact: 13.4, to: { x: 880, y: 660 }, arc: 65, after: 'stick' },
  { id: 'f', launch: 13.95, impact: 14.2, to: { x: 760, y: 1050 }, arc: 50, after: 'stick' },
  { id: 'g', launch: 21.3, impact: 21.6, to: { x: GOLD_X, y: GOLD_Y }, arc: 85, after: 'stick' },
];

const CAPTIONS: CaptionLine[] = [
  { text: 'POP 10 BALLOONS TO WIN!', from: 0.45, to: 5.85 },
  { text: "WHY CAN'T HE HIT ONE?!", from: 6.2, to: 11.9 },
  { text: "HE'S FINALLY ON FIRE!", from: 12.2, to: 17.85 },
  { text: 'JACKPOT! ONE LAST BALLOON!', from: 18.2, to: 23.85 },
  { text: 'WAIT... THE PRIZE IS A BALLOON?!', from: 24.2, to: 29.55 },
];

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 210, y: 960, zoom: 2.1 },
  { t: 1.15, x: 235, y: 960, zoom: 2.05 },
  { t: 2.0, x: 540, y: 880, zoom: 0.98 },
  { t: 6.0, x: 540, y: 880, zoom: 1.02 },
  { t: 9.0, x: 540, y: 880, zoom: 1.12 },
  { t: 11.9, x: 540, y: 880, zoom: 1.1 },
  { t: 12.25, x: 610, y: 800, zoom: 1.22 },
  { t: 15.0, x: 420, y: 900, zoom: 1.12 },
  { t: 16.6, x: 320, y: 860, zoom: 1.3 },
  { t: 17.9, x: 420, y: 900, zoom: 1.16 },
  { t: 18.35, x: 640, y: 855, zoom: 1.55 },
  { t: 20.35, x: 640, y: 855, zoom: 1.62 },
  { t: 20.9, x: 540, y: 880, zoom: 1.16 },
  { t: 22.4, x: 540, y: 880, zoom: 1.04 },
  { t: 24.0, x: 540, y: 880, zoom: 1.04 },
  { t: 24.3, x: 560, y: 320, zoom: 1.55 },
  { t: 25.6, x: 580, y: 420, zoom: 1.34 },
  { t: 26.6, x: 540, y: 700, zoom: 1.0 },
  { t: 27.3, x: 540, y: 800, zoom: 0.97 },
  { t: 28.4, x: 195, y: 985, zoom: 1.75 },
  { t: 28.7, x: 180, y: 980, zoom: 2.2 },
  { t: 30.0, x: 178, y: 975, zoom: 2.3 },
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
/** Deterministic pseudo-random value so confetti does not flicker. */
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

export class BalloonPopJackpotRenderer {
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
    this.renderStage(ctx, t);

    const x = this.charX(t);
    const hop = this.charHop(t);
    const hipY = this.hipY - hop;
    const pose = this.poseAt(t);
    if (hop > 0) {
      // The whole body leaves the ground, so the raised fists travel with it.
      pose.handL = { x: pose.handL.x, y: pose.handL.y - hop };
      pose.handR = { x: pose.handR.x, y: pose.handR.y - hop };
    }
    const arms = this.computeArms(pose, x, hipY);

    // Back of the booth first, then the character, then everything that flies
    // towards the camera.
    this.drawRainbowCelebration(ctx, t);
    this.drawBooth(ctx, t);
    this.drawBoardBalloons(ctx, t);
    this.drawStuckDarts(ctx, t);
    this.drawShadows(ctx, x, hipY, hop);

    this.drawStickman(ctx, x, hipY, pose, arms, t, 'body');
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'front');

    this.drawBeanieProp(ctx, t, x, hipY, pose);
    this.drawCompartmentStream(ctx, t);
    this.drawDartInHand(ctx, t, arms, pose);
    this.drawFlyingDarts(ctx, t);
    this.drawGiantBalloon(ctx, t);
    this.drawBalloonBursts(ctx, t);
    this.drawGoldPile(ctx, t);
    this.drawTinyPrizeBalloon(ctx, t, x, hipY, pose);

    this.restoreCamera(ctx);
    ctx.restore();

    this.drawCaptions(ctx, t);
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
    // A short comic quake when the giant balloon bursts.
    const shake =
      t >= 27.4 && t < 27.95 ? Math.sin(t * 88) * 12 * (1 - (t - 27.4) / 0.55) : 0;

    ctx.translate(WIDTH / 2 + shake, HEIGHT / 2 + shake * 0.6);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);
  }

  private restoreCamera(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }

  private renderStage(ctx: CanvasRenderingContext2D, t: number) {
    // Warm tent wall behind the booth.
    ctx.fillStyle = CREAM;
    ctx.fillRect(-200, -200, WIDTH + 400, 700);
    ctx.fillStyle = CREAM_DEEP;
    ctx.fillRect(-200, 620, WIDTH + 400, 960);

    this.drawAwning(ctx);
    this.drawStringLights(ctx, t);
    this.drawPrizeShelves(ctx, t);
    this.drawTrophyCase(ctx, t);

    // Sawdust floor.
    ctx.fillStyle = FLOOR;
    ctx.fillRect(-200, this.floorY, WIDTH + 400, HEIGHT - this.floorY + 300);
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-200, this.floorY);
    ctx.lineTo(WIDTH + 200, this.floorY);
    ctx.stroke();

    ctx.fillStyle = 'rgba(170, 132, 84, 0.22)';
    for (let i = 0; i < 46; i++) {
      const fx = -80 + rand(i) * 1240;
      const fy = this.floorY + 18 + rand(i + 90) * (HEIGHT - this.floorY + 60);
      ctx.beginPath();
      ctx.ellipse(fx, fy, 5 + rand(i + 40) * 9, 2 + rand(i + 20) * 3, 0, 0, TAU);
      ctx.fill();
    }
  }

  private drawAwning(ctx: CanvasRenderingContext2D) {
    const stripe = 90;
    for (let i = 0; i < 13; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#d62828' : '#fff6e6';
      ctx.fillRect(i * stripe - 10, -20, stripe, 170);
    }
    // Scalloped valance.
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#d62828' : '#fff6e6';
      ctx.beginPath();
      ctx.arc(i * stripe + stripe / 2, 150, stripe / 2, 0, Math.PI);
      ctx.fill();
    }
    ctx.fillStyle = GOLD;
    ctx.fillRect(-20, 140, WIDTH + 40, 10);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-20, 150);
    ctx.lineTo(WIDTH + 20, 150);
    ctx.stroke();
  }

  private drawStringLights(ctx: CanvasRenderingContext2D, t: number) {
    const wireY = (x: number) => 222 + Math.sin((x / WIDTH) * Math.PI) * 24;
    ctx.strokeStyle = '#6b5138';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = -20; x <= WIDTH + 20; x += 12) {
      const y = wireY(x);
      if (x <= -8) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const colors = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
    for (let i = 0; i < 13; i++) {
      const x = 20 + i * 86;
      const y = wireY(x) + 16;
      const lit = 0.55 + 0.45 * Math.sin(t * 4.2 + i * 0.9);
      ctx.globalAlpha = 0.4 + lit * 0.6;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  private drawPrizeShelves(ctx: CanvasRenderingContext2D, t: number) {
    const shelves = [
      { x: 330, y: 320, w: 120 },
      { x: 850, y: 320, w: 120 },
    ];
    for (let s = 0; s < shelves.length; s++) {
      const sh = shelves[s];
      ctx.fillStyle = WOOD_DARK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(sh.x, sh.y + 76, sh.w, 18, 5);
      ctx.fill();
      ctx.stroke();
      // Little bracket.
      ctx.beginPath();
      ctx.moveTo(sh.x + 14, sh.y + 94);
      ctx.lineTo(sh.x + 8, sh.y + 116);
      ctx.lineTo(sh.x + 40, sh.y + 94);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const wobble = Math.sin(t * 2 + s * 2) * 2;
      if (s === 0) {
        this.drawTeddy(ctx, sh.x + 34, sh.y + 58 + wobble, 0.9);
        this.drawStarPrize(ctx, sh.x + 88, sh.y + 34 + wobble * 0.6);
      } else {
        this.drawDuck(ctx, sh.x + 32, sh.y + 62 + wobble, 0.9);
        this.drawStarPrize(ctx, sh.x + 90, sh.y + 36 + wobble * 0.6);
      }
    }
  }

  private drawTeddy(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillStyle = '#c98a5c';
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-18, -18, 10, 0, TAU);
    ctx.arc(18, -18, 10, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f3d3ac';
    ctx.beginPath();
    ctx.ellipse(0, 9, 12, 9, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(-8, -4, 3.2, 0, TAU);
    ctx.arc(8, -4, 3.2, 0, TAU);
    ctx.arc(0, 7, 3.2, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawDuck(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(0, 4, 26, 20, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-10, -18, 15, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-24, -18);
    ctx.lineTo(-40, -12);
    ctx.lineTo(-24, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(-14, -22, 3, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawStarPrize(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    this.traceStar(ctx, 0, 0, 22, 10, 5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private traceStar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    outer: number,
    inner: number,
    points: number
  ) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = -Math.PI / 2 + (i / (points * 2)) * TAU;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  private drawTrophyCase(ctx: CanvasRenderingContext2D, t: number) {
    const x0 = 470;
    const y0 = 225;
    const w = 360;
    const h = 205;
    const cx = x0 + w / 2;

    // Back glow.
    const glow = t > 24.4 ? 0.55 + 0.45 * Math.sin(t * 6) : 0.16;
    ctx.save();
    ctx.globalAlpha = glow;
    ctx.fillStyle = GOLD_LIGHT;
    ctx.beginPath();
    ctx.roundRect(x0 + 10, y0 + 12, w - 20, h - 24, 12);
    ctx.fill();
    ctx.restore();

    // Interior.
    ctx.fillStyle = '#2a1c11';
    ctx.beginPath();
    ctx.roundRect(x0 + 8, y0 + 8, w - 16, h - 16, 10);
    ctx.fill();

    // Trophy, still on its shelf until the case opens.
    if (t < 25.0) {
      const lift = t > 24.7 ? smooth((t - 24.7) / 0.3) * 150 : 0;
      ctx.save();
      ctx.globalAlpha = t > 24.85 ? 1 - smooth((t - 24.85) / 0.2) : 1;
      this.drawTrophy(ctx, cx, 352 - lift);
      ctx.restore();
    }

    // Gold frame.
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.roundRect(x0, y0, w, h, 14);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(x0 - 7, y0 - 7, w + 14, h + 14, 17);
    ctx.stroke();

    // Glass doors: two panes that swing open towards the viewer.
    const open = t > 24.4 ? smooth((t - 24.4) / 0.5) : 0;
    const panelW = w / 2 - 10;
    const panes: { px: number; dir: 1 | -1 }[] = [
      { px: x0 + 10, dir: 1 },
      { px: cx, dir: -1 },
    ];
    for (let i = 0; i < panes.length; i++) {
      const pane = panes[i];
      const scaleX = Math.max(0.05, 1 - open);
      ctx.save();
      ctx.globalAlpha = 0.9 - open * 0.4;
      ctx.translate(pane.dir === 1 ? pane.px : pane.px + panelW, y0 + 8);
      ctx.scale(pane.dir * scaleX, 1);
      ctx.fillStyle = GLASS;
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(0, 0, panelW, h - 16, 8);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(panelW * 0.18, h * 0.2);
      ctx.lineTo(panelW * 0.5, h * 0.72);
      ctx.stroke();
      ctx.restore();
      // Handle
      ctx.fillStyle = GOLD;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pane.px + (pane.dir === 1 ? panelW - 16 : 16), y0 + h / 2, 7, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Marquee bulbs around the case.
    this.drawBulbRow(ctx, x0 + 24, y0 - 14, x0 + w - 24, 6, t, 1);
  }

  private drawTrophy(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillStyle = GOLD;

    // Cup.
    ctx.beginPath();
    ctx.moveTo(-38, -42);
    ctx.lineTo(38, -42);
    ctx.quadraticCurveTo(30, 18, 0, 26);
    ctx.quadraticCurveTo(-30, 18, -38, -42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Handles.
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(-44, -18, 20, Math.PI * 0.45, Math.PI * 1.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(44, -18, 20, Math.PI * 1.45, Math.PI * 0.55);
    ctx.stroke();

    // Stem + base.
    ctx.fillStyle = GOLD_DEEP;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-11, 24, 22, 24, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.roundRect(-34, 46, 68, 16, 6);
    ctx.fill();
    ctx.stroke();

    // Star engraving.
    ctx.fillStyle = GOLD_LIGHT;
    this.traceStar(ctx, 0, -14, 15, 7, 5);
    ctx.fill();

    // Sparkle.
    ctx.fillStyle = '#fffbe6';
    ctx.beginPath();
    ctx.arc(-24, -28, 5, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private drawBulbRow(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y: number,
    x1: number,
    count: number,
    t: number,
    offset: number
  ) {
    const colors = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
    for (let i = 0; i < count; i++) {
      const x = lerp(x0, x1, count <= 1 ? 0 : i / (count - 1));
      const lit = 0.55 + 0.45 * Math.sin(t * 5 + i * 0.8 + offset);
      ctx.globalAlpha = 0.45 + lit * 0.55;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  private drawBooth(ctx: CanvasRenderingContext2D, t: number) {
    // Back wall panel inside the booth.
    ctx.fillStyle = BOARD_DEEP;
    ctx.fillRect(BOOTH_L + 10, 500, BOOTH_R - BOOTH_L - 20, 670);

    // Counter + curtain skirt.
    ctx.fillStyle = CURTAIN;
    ctx.fillRect(BOOTH_L, 1290, BOOTH_R - BOOTH_L, this.floorY - 1290);
    ctx.strokeStyle = CURTAIN_DEEP;
    ctx.lineWidth = 6;
    for (let x = BOOTH_L + 34; x < BOOTH_R; x += 62) {
      ctx.beginPath();
      ctx.moveTo(x, 1300);
      ctx.quadraticCurveTo(x + 16, 1400, x, this.floorY);
      ctx.stroke();
    }
    ctx.fillStyle = WOOD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(BOOTH_L, COUNTER_Y, BOOTH_R - BOOTH_L, 128, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = WOOD_DARK;
    ctx.beginPath();
    ctx.roundRect(BOOTH_L + 8, COUNTER_Y + 14, BOOTH_R - BOOTH_L - 16, 96, 8);
    ctx.fill();

    // Counter plaque.
    ctx.fillStyle = '#3a220f';
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(520, 1198, 260, 46, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = GOLD_LIGHT;
    ctx.font = '700 25px "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('POP 10 · WIN THE GOLD', 650, 1222);

    // Posts + top beam.
    ctx.fillStyle = WOOD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    for (const px of [BOOTH_L, BOOTH_R - 40]) {
      ctx.beginPath();
      ctx.roundRect(px, 500, 40, COUNTER_Y - 500, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = WOOD_DARK;
      ctx.fillRect(px + 8, 520, 8, COUNTER_Y - 540);
      ctx.fillStyle = WOOD;
    }
    ctx.beginPath();
    ctx.roundRect(BOOTH_L - 14, 470, BOOTH_R - BOOTH_L + 28, 70, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.fillRect(BOOTH_L - 14, 528, BOOTH_R - BOOTH_L + 28, 8);

    // Target board.
    ctx.fillStyle = BOARD;
    ctx.strokeStyle = WOOD_DARK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.roundRect(BOARD_L, BOARD_T, BOARD_R - BOARD_L, BOARD_B - BOARD_T, 14);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = BOARD_LINE;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(BOARD_L + 22, BOARD_T + 22, BOARD_R - BOARD_L - 44, BOARD_B - BOARD_T - 44, 8);
    ctx.stroke();

    // Little painted starbursts in the board corners.
    ctx.fillStyle = 'rgba(255, 233, 168, 0.22)';
    for (const [sx, sy] of [
      [BOARD_L + 66, BOARD_T + 62],
      [BOARD_R - 66, BOARD_T + 62],
      [BOARD_L + 66, BOARD_B - 62],
      [BOARD_R - 66, BOARD_B - 62],
    ]) {
      this.traceStar(ctx, sx, sy, 22, 9, 5);
      ctx.fill();
    }

    // Cable ties for the balloon rows.
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 3;
    for (const y of [660, 1050]) {
      ctx.beginPath();
      ctx.moveTo(BOARD_L + 40, y);
      ctx.lineTo(BOARD_R - 40, y);
      ctx.stroke();
    }

    // Chasing bulbs along the beam and both posts.
    this.drawBulbRow(ctx, BOOTH_L + 10, 505, BOOTH_R - 10, 16, t, 0);
    for (let i = 0; i < 16; i++) {
      const y = 560 + i * 58;
      for (const bx of [BOOTH_L + 20, BOOTH_R - 20]) {
        const lit = 0.5 + 0.5 * Math.sin(t * 5 + i * 0.7 + bx);
        ctx.globalAlpha = 0.35 + lit * 0.5;
        ctx.fillStyle = i % 2 === 0 ? GOLD : '#fff3c4';
        ctx.beginPath();
        ctx.arc(bx, y, 7, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    }

    // Hidden compartment hatch, still closed until shot 3.
    const hatchOpen = t > 14.9 ? smooth((t - 14.9) / 0.2) : 0;
    ctx.save();
    ctx.translate(330, 1180);
    ctx.rotate(hatchOpen * 1.2);
    ctx.fillStyle = WOOD_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-34, -14, 68, 26, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawBoardBalloons(ctx: CanvasRenderingContext2D, t: number) {
    for (let i = 0; i < BALLOONS.length; i++) {
      const b = BALLOONS[i];
      if (!this.balloonAlive(i, t)) continue;
      let sway = 0.03 * Math.sin(t * 2.1 + i * 1.3);
      let dx = 0;
      if (i === 1) {
        // The grazed blue balloon only wobbles; it never pops.
        if (t > 10.0) {
          const amp = Math.exp(-(t - 10.0) * 2.6);
          sway += Math.sin((t - 10.0) * 34) * 0.18 * amp;
          dx = Math.sin((t - 10.0) * 30) * 9 * amp;
        }
      }
      if (t > SWEEP_TIME - 0.16 && t < SWEEP_TIME) {
        const amp = (SWEEP_TIME - t) / 0.16;
        sway += Math.sin(t * 52) * 0.12 * amp;
        dx += Math.sin(t * 40) * 10 * amp;
      }
      const sx = b.x + dx;
      this.drawBalloon(ctx, sx, b.y, b.r, b.body, b.shade, sway);
    }

    // The golden prize balloon sits in the middle, bigger than the rest.
    if (t < 21.6) {
      const pulse = 1 + Math.sin(t * 2.6) * 0.012;
      this.drawGoldenBalloon(ctx, GOLD_X, GOLD_Y, GOLD_R * pulse, t);
    }

    // Pop flashes and confetti for the ten target balloons.
    for (let i = 0; i < BALLOONS.length; i++) {
      const b = BALLOONS[i];
      const pop = BALLOON_POPS[i] ?? SWEEP_TIME;
      if (t < pop) continue;
      const u = (t - pop) / 0.22;
      if (u >= 0 && u <= 1) {
        this.drawPopFlash(ctx, b.x, b.y, u, b.body);
      }
      if (t < pop + 0.75) {
        this.drawConfetti(
          ctx,
          t,
          pop,
          b.x,
          b.y,
          [b.body, b.shade, WHITE, GOLD],
          14,
          i * 31 + 7,
          0.9
        );
      }
    }

    if (t >= 21.6 && t < 22.4) {
      this.drawPopFlash(ctx, GOLD_X, GOLD_Y, (t - 21.6) / 0.26, GOLD);
    }
  }

  private balloonAlive(i: number, t: number) {
    const pop = BALLOON_POPS[i];
    if (pop !== null) return t < pop;
    return t < SWEEP_TIME;
  }

  private drawBalloon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    body: string,
    shade: string,
    sway: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sway);
    ctx.lineWidth = Math.max(3, r * 0.07);
    ctx.strokeStyle = INK;

    // Two-tone flat body.
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.94, r, 0, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.94, r, 0, 0, TAU);
    ctx.clip();
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.82, r * 0.98, r * 0.62, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.stroke();

    // Knot.
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.moveTo(-r * 0.14, r * 0.94);
    ctx.lineTo(r * 0.14, r * 0.94);
    ctx.lineTo(0, r * 1.18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Highlight.
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.34, -r * 0.36, r * 0.2, r * 0.31, -0.5, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawGoldenBalloon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    t: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;

    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.94, r, 0, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.94, r, 0, 0, TAU);
    ctx.clip();
    ctx.fillStyle = GOLD_DEEP;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.8, r, r * 0.6, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.stroke();

    // Knot + short string.
    ctx.fillStyle = GOLD_DEEP;
    ctx.beginPath();
    ctx.moveTo(-r * 0.13, r * 0.92);
    ctx.lineTo(r * 0.13, r * 0.92);
    ctx.lineTo(0, r * 1.14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#8a6a10';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, r * 1.14);
    ctx.quadraticCurveTo(8, r * 1.34, -4, r * 1.5);
    ctx.stroke();

    // Engraved star + highlight.
    ctx.fillStyle = GOLD_LIGHT;
    this.traceStar(ctx, 0, r * 0.06, r * 0.26, r * 0.115, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.36, -r * 0.38, r * 0.17, r * 0.29, -0.5, 0, TAU);
    ctx.fill();

    // Sparkle ticks.
    ctx.strokeStyle = '#fffbe6';
    ctx.lineWidth = 4;
    const spark = 0.6 + 0.4 * Math.sin(t * 5);
    ctx.globalAlpha = spark;
    for (let i = 0; i < 4; i++) {
      const a = -0.9 + i * 0.55;
      const sx = Math.cos(a) * r * 0.8;
      const sy = Math.sin(a) * r * 0.8;
      ctx.beginPath();
      ctx.moveTo(sx - 8, sy);
      ctx.lineTo(sx + 8, sy);
      ctx.moveTo(sx, sy - 8);
      ctx.lineTo(sx, sy + 8);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private drawPopFlash(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    u: number,
    color: string
  ) {
    const a = 1 - clamp(u, 0, 1);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(x, y);
    ctx.rotate(u * 0.8);
    ctx.fillStyle = color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    this.traceStar(ctx, 0, 0, 26 + 62 * u, 11 + 24 * u, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = WHITE;
    this.traceStar(ctx, 0, 0, 12 + 26 * u, 5 + 10 * u, 6);
    ctx.fill();
    ctx.restore();
  }

  private drawConfetti(
    ctx: CanvasRenderingContext2D,
    t: number,
    t0: number,
    x: number,
    y: number,
    palette: string[],
    count: number,
    seed: number,
    power: number
  ) {
    const dt = t - t0;
    if (dt < 0 || dt > 2.4) return;
    const fade = dt > 1.8 ? clamp(1 - (dt - 1.8) / 0.6, 0, 1) : 1;
    ctx.save();
    ctx.globalAlpha = fade;
    for (let i = 0; i < count; i++) {
      const a = rand(seed + i) * TAU;
      const speed = (170 + rand(seed + i + 40) * 390) * power;
      const px = x + Math.cos(a) * speed * dt;
      const py = y + Math.sin(a) * speed * dt * 0.62 + 700 * dt * dt;
      const rot =
        rand(seed + i + 80) * TAU +
        dt * (4 + rand(seed + i + 120) * 8) * (rand(seed + i + 160) > 0.5 ? 1 : -1);
      const size = 9 + rand(seed + i + 200) * 15;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rot);
      ctx.fillStyle = palette[i % palette.length];
      ctx.strokeStyle = 'rgba(20,20,20,0.35)';
      ctx.lineWidth = 2;
      ctx.fillRect(-size / 2, -size / 4, size, size / 2);
      ctx.strokeRect(-size / 2, -size / 4, size, size / 2);
      ctx.restore();
    }
    ctx.restore();
  }

  private drawShadows(ctx: CanvasRenderingContext2D, x: number, hipY: number, hop: number) {
    const lifted = clamp(hop / 60, 0, 1);
    ctx.fillStyle = 'rgba(20, 20, 20, 0.1)';
    ctx.beginPath();
    ctx.ellipse(x + 20, this.floorY - 6, lerp(78, 54, lifted), lerp(16, 10, lifted), 0, 0, TAU);
    ctx.fill();

    // Counter shadow.
    ctx.fillStyle = 'rgba(20,20,20,0.08)';
    ctx.beginPath();
    ctx.ellipse(650, this.floorY - 4, 360, 26, 0, 0, TAU);
    ctx.fill();
    void hipY;
  }

  // ---------------------------------------------------------------- darts

  private quad(a: Pt, c: Pt, b: Pt, u: number): Pt {
    const v = 1 - u;
    return {
      x: v * v * a.x + 2 * u * v * c.x + u * u * b.x,
      y: v * v * a.y + 2 * u * v * c.y + u * u * b.y,
    };
  }

  private dartControl(from: Pt, to: Pt, arc: number): Pt {
    return { x: lerp(from.x, to.x, 0.5), y: lerp(from.y, to.y, 0.5) - arc };
  }

  private handAt(time: number): Pt {
    const x = this.charX(time);
    const hop = this.charHop(time);
    const hipY = this.hipY - hop;
    const pose = this.poseAt(time);
    if (hop > 0) {
      pose.handL = { x: pose.handL.x, y: pose.handL.y - hop };
      pose.handR = { x: pose.handR.x, y: pose.handR.y - hop };
    }
    const arm = this.computeArms(pose, x, hipY).r;
    return { x: arm.hx, y: arm.hy };
  }

  private flightAngle(d: DartSpec): number {
    const from = this.handAt(d.launch);
    const control = this.dartControl(from, d.to, d.arc);
    const a = this.quad(from, control, d.to, 0.93);
    const b = d.to;
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  private drawDart(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.lineCap = 'round';

    // Needle.
    ctx.strokeStyle = '#c7ccd4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(44, 0);
    ctx.stroke();
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(36, 0);
    ctx.lineTo(46, 0);
    ctx.stroke();

    // Barrel.
    ctx.fillStyle = '#e63946';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-16, -7, 40, 14, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.roundRect(6, -7, 8, 14, 3);
    ctx.fill();

    // Fins.
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.lineTo(-34, -17);
    ctx.lineTo(-24, 0);
    ctx.lineTo(-34, 17);
    ctx.lineTo(-14, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawFlyingDarts(ctx: CanvasRenderingContext2D, t: number) {
    for (const d of DARTS) {
      if (t < d.launch) continue;
      const from = this.handAt(d.launch);
      const control = this.dartControl(from, d.to, d.arc);

      if (t <= d.impact) {
        const u = clamp((t - d.launch) / Math.max(0.01, d.impact - d.launch), 0, 1);
        const p = this.quad(from, control, d.to, u);
        const p2 = this.quad(from, control, d.to, Math.min(1, u + 0.03));
        this.drawDart(ctx, p.x, p.y, Math.atan2(p2.y - p.y, p2.x - p.x));
        continue;
      }

      if (d.after === 'fall' && d.rest && d.fallEnd && t < d.fallEnd) {
        const u = clamp((t - d.impact) / Math.max(0.01, d.fallEnd - d.impact), 0, 1);
        const x = lerp(d.to.x, d.rest.x, u);
        const y = lerp(d.to.y, d.rest.y, u * u);
        const angle = lerp(this.flightAngle(d), 1.5, smooth(u));
        this.drawDart(ctx, x, y, angle);
      }
    }
  }

  private drawStuckDarts(ctx: CanvasRenderingContext2D, t: number) {
    for (const d of DARTS) {
      if (t <= d.impact) continue;
      if (d.after === 'fall') {
        if (!d.rest || !d.fallEnd || t < d.fallEnd) continue;
        this.drawDart(ctx, d.rest.x, d.rest.y, 1.5);
        continue;
      }
      this.drawDart(ctx, d.to.x, d.to.y, this.flightAngle(d));
    }
  }

  private drawDartInHand(
    ctx: CanvasRenderingContext2D,
    t: number,
    arms: { l: Arm; r: Arm },
    pose: Pose
  ) {
    const windows: [number, number, number][] = [
      [2.9, 3.45, 0],
      [6.0, 6.5, 0],
      [8.0, 8.3, 1],
      [9.4, 9.7, 2],
      [12.0, 12.35, 3],
      [12.85, 13.15, 4],
      [13.65, 13.95, 5],
      [20.75, 21.3, 6],
    ];
    for (const [a, b, idx] of windows) {
      if (t < a || t >= b) continue;
      const target = DARTS[idx]?.to ?? { x: 600, y: 500 };
      const hand = arms.r;
      const angle = Math.atan2(target.y - hand.hy, target.x - hand.hx);
      this.drawDart(ctx, hand.hx + 16, hand.hy - 8, angle);
      void pose;
      return;
    }
  }

  // ---------------------------------------------------- compartment balloons

  private drawCompartmentStream(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 14.98 || t > 16.6) return;

    // Puff of air out of the hidden hatch.
    if (t < 15.5) {
      const u = clamp((t - 14.98) / 0.4, 0, 1);
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(330 + Math.cos(i) * 40 * u, 1160 - i * 30 * u, 22 + i * 8, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    const colors = ['#ef4444', '#3b82f6', '#facc15', '#22c55e', '#a855f7', '#ec4899'];
    const shades = ['#b91c1c', '#1d4ed8', '#ca8a04', '#15803d', '#7e22ce', '#be185d'];

    // A stream of balloons jets up out of the counter and sweeps the board.
    for (let i = 0; i < 12; i++) {
      const start = 15.0 + i * 0.055;
      const dur = 0.82 + rand(i + 4) * 0.35;
      const u = (t - start) / dur;
      if (u < 0 || u > 1) continue;
      const from = { x: 330 + (i % 3) * 8, y: 1160 };
      const control = { x: 250 + rand(i + 3) * 430, y: 1180 - rand(i + 5) * 440 };
      const to = { x: 1120 + rand(i + 7) * 220, y: 200 + rand(i + 9) * 420 };
      const p = this.quad(from, control, to, u);
      const r = 36 + rand(i + 11) * 18;
      const spin = Math.sin(t * 8 + i) * 0.25;
      this.drawBalloon(ctx, p.x, p.y, r, colors[i % 6], shades[i % 6], spin);
    }

    // The lead balloon bonks him on the head and bounces away.
    if (t >= 15.0 && t <= 16.3) {
      const bx = keyAt(
        [
          [15.0, 336],
          [15.3, 250],
          [15.45, 195],
          [15.7, 245],
          [16.3, 830],
        ],
        t
      );
      const by = keyAt(
        [
          [15.0, 1165],
          [15.3, 1040],
          [15.45, 942],
          [15.7, 790],
          [16.3, 170],
        ],
        t
      );
      this.drawBalloon(ctx, bx, by, 54, '#ec4899', '#be185d', Math.sin(t * 9) * 0.2);
    }
  }

  // ------------------------------------------------------------- the beanie

  private headPoint(pose: Pose, hipX: number, hipY: number): Pt {
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(pose.lean) * 170;
    return {
      x: bodyTopX + Math.sin(pose.headTilt) * 10,
      y: shoulderY - 78 + pose.headDrop,
    };
  }

  private drawBeanieAt(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    rot: number
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    this.drawBeanie(ctx, 0, 0);
    ctx.restore();
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

  private drawBeanieProp(
    ctx: CanvasRenderingContext2D,
    t: number,
    x: number,
    hipY: number,
    pose: Pose
  ) {
    if (t < 15.45 || t >= 17.05) return;
    const head = this.headPoint(pose, x, hipY);
    let bx = head.x;
    let by = head.y;
    let rot = 0;

    if (t < 16.35) {
      bx = keyAt(
        [
          [15.45, head.x],
          [15.75, 215],
          [16.05, 255],
          [16.35, 248],
        ],
        t
      );
      by = keyAt(
        [
          [15.45, head.y],
          [15.75, 800],
          [16.05, 860],
          [16.35, 905],
        ],
        t
      );
      rot = keyAt(
        [
          [15.45, 0],
          [15.8, 2.0],
          [16.1, 3.5],
          [16.35, TAU],
        ],
        t
      );
    } else {
      const hand = this.computeArms(this.poseAt(t), x, hipY).l;
      if (t < 16.9) {
        bx = hand.hx;
        by = hand.hy + 26;
        rot = 0;
      } else {
        const u = smooth((t - 16.9) / 0.15);
        bx = lerp(hand.hx, head.x, u);
        by = lerp(hand.hy + 26, head.y, u);
        rot = 0;
      }
    }

    this.drawBeanieAt(ctx, bx, by, rot);
  }

  private drawTinyPrizeBalloon(
    ctx: CanvasRenderingContext2D,
    t: number,
    x: number,
    hipY: number,
    pose: Pose
  ) {
    if (t < 28.35) return;
    const head = this.headPoint(pose, x, hipY);
    const bob = Math.sin(t * 4.5) * 4;
    const bx = head.x + 4 + Math.sin(t * 2.2) * 6;
    const by = head.y - this.headR - 92 + bob;
    const pomY = head.y - this.headR - 32;

    ctx.strokeStyle = '#8a6a10';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(head.x, pomY);
    ctx.quadraticCurveTo(head.x + 10, pomY - 26, bx, by + 22);
    ctx.stroke();

    this.drawGoldenBalloon(ctx, bx, by, 26, t * 1.4);
  }

  // ---------------------------------------------------------- the giant prize

  private drawGiantBalloon(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 25.3 || t > 27.42) return;
    const u = clamp((t - 25.3) / 1.95, 0, 1);
    const e = smooth(u);
    const wobble = 1 + Math.sin(t * 17) * 0.008 * e;
    const r = (24 + 318 * e) * wobble;
    const bx = lerp(650, 430, smooth(clamp((u - 0.12) / 0.88, 0, 1)));
    const by = lerp(340, 885, e);

    // Golden glow behind the prize.
    ctx.save();
    ctx.globalAlpha = 0.18 + 0.18 * Math.sin(t * 6);
    ctx.fillStyle = GOLD_LIGHT;
    ctx.beginPath();
    ctx.arc(bx, by, r * 1.12, 0, TAU);
    ctx.fill();
    ctx.restore();

    this.drawGoldenBalloon(ctx, bx, by, r, t * 1.6);

    // Strain ticks once it is larger than the display case.
    if (r > 150) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = GOLD_DEEP;
      ctx.lineWidth = 4;
      for (let i = 0; i < 7; i++) {
        const a = -0.6 + i * 0.38;
        ctx.beginPath();
        ctx.moveTo(bx + Math.cos(a) * r * 0.72, by + Math.sin(a) * r * 0.72);
        ctx.lineTo(bx + Math.cos(a) * r * 0.9, by + Math.sin(a) * r * 0.9);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawBalloonBursts(ctx: CanvasRenderingContext2D, t: number) {
    // Golden balloon jackpot.
    if (t >= 21.6) {
      this.drawConfetti(
        ctx,
        t,
        21.6,
        GOLD_X,
        GOLD_Y,
        [GOLD, GOLD_LIGHT, WHITE, '#f97316'],
        40,
        551,
        1.35
      );
      if (t < 21.85) {
        ctx.save();
        ctx.globalAlpha = 0.55 * (1 - (t - 21.6) / 0.25);
        ctx.fillStyle = GOLD_LIGHT;
        ctx.fillRect(-300, -300, WIDTH + 600, HEIGHT + 600);
        ctx.restore();
      }
    }

    // Giant balloon burst: gold confetti and streamers everywhere.
    if (t >= 27.4) {
      this.drawConfetti(
        ctx,
        t,
        27.4,
        430,
        880,
        [GOLD, GOLD_LIGHT, WHITE, '#f59e0b', '#fde68a'],
        90,
        997,
        1.9
      );
      this.drawStreamers(ctx, t);
      if (t < 27.62) {
        ctx.save();
        ctx.globalAlpha = 0.8 * (1 - (t - 27.4) / 0.22);
        ctx.fillStyle = '#fff6cf';
        ctx.fillRect(-300, -300, WIDTH + 600, HEIGHT + 600);
        ctx.restore();
      }
    }
  }

  private drawStreamers(ctx: CanvasRenderingContext2D, t: number) {
    const dt = t - 27.4;
    if (dt < 0 || dt > 1.6) return;
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 22; i++) {
      const a = rand(i + 300) * TAU;
      const speed = 260 + rand(i + 340) * 380;
      const x0 = 430 + Math.cos(a) * speed * Math.min(dt, 0.5);
      const y0 = 880 + Math.sin(a) * speed * Math.min(dt, 0.5) - 40;
      const fall = 420 * dt * dt;
      ctx.strokeStyle = i % 3 === 0 ? GOLD_LIGHT : i % 3 === 1 ? GOLD : WHITE;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x0, y0 + fall);
      ctx.quadraticCurveTo(
        x0 + 40 * Math.sin(dt * 6 + i),
        y0 + 40 + fall,
        x0 + 20 * Math.sin(dt * 4 + i),
        y0 + 96 + fall
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawGoldPile(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 27.42 || t > 28.62) return;
    const fade = t < 28.32 ? 1 : 1 - clamp((t - 28.32) / 0.3, 0, 1);
    const sink = t < 28.32 ? 0 : smooth((t - 28.32) / 0.3) * 80;

    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(0, sink);

    ctx.fillStyle = GOLD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-40, 1450);
    ctx.quadraticCurveTo(-10, 1120, 110, 900);
    ctx.quadraticCurveTo(230, 820, 330, 905);
    ctx.quadraticCurveTo(450, 1020, 470, 1450);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Foil lumps.
    for (let i = 0; i < 18; i++) {
      const x = 10 + rand(i + 60) * 430;
      const y = 940 + rand(i + 120) * 470;
      if (y < 900) continue;
      ctx.fillStyle = i % 3 === 0 ? GOLD_LIGHT : i % 3 === 1 ? GOLD : '#ffe17a';
      ctx.beginPath();
      ctx.arc(x, y, 26 + rand(i + 180) * 34, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,20,20,0.25)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // A few streamers poking out of the pile.
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const x = 40 + i * 52;
      ctx.strokeStyle = i % 2 === 0 ? WHITE : GOLD_LIGHT;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x, 960);
      ctx.quadraticCurveTo(x + 20, 900, x + 4, 850);
      ctx.stroke();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------- character

  private charX(t: number): number {
    void t;
    return CHAR_X;
  }

  private charHop(t: number): number {
    const hop = (a: number, b: number, h: number) =>
      t >= a && t < b ? h * Math.sin(((t - a) / (b - a)) * Math.PI) : 0;
    return hop(22.25, 22.85, 58) + hop(23.05, 23.65, 52) + hop(23.75, 24.05, 30);
  }

  private poseAt(t: number): Pose {
    const p = this.defaultPose();
    p.headTurn = 5;

    if (t < 6.0) {
      // Shot 1 — the challenge.
      if (t < 1.15) {
        p.brow = 'cocky';
        p.eye = 'squint';
        p.mouth = 'smirk';
        p.handL = { x: 225, y: 1140 };
        p.handR = { x: 265, y: 1130 };
      } else if (t < 2.35) {
        const u = smooth((t - 1.15) / 1.2);
        p.brow = 'cocky';
        p.eye = 'squint';
        p.mouth = 'grin';
        p.handR = lerpPt({ x: 265, y: 1130 }, { x: 282, y: 870 }, u);
        p.bendR = -1;
        p.pointR = true;
        p.handL = { x: 215, y: 1130 };
      } else if (t < 3.5) {
        p.brow = 'raised';
        p.eye = 'squint';
        p.mouth = 'grin';
        p.handR = { x: 300, y: 930 };
        p.bendR = -1;
        p.handL = { x: 215, y: 1120 };
      } else if (t < 4.55) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.handL = { x: 235, y: 1105 };
        p.handR = { x: 290, y: 1075 };
        p.fistL = true;
        p.fistR = true;
      } else {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.05;
        p.handL = { x: 210, y: 1120 };
        p.handR = { x: 315, y: 950 };
        p.bendR = -1;
      }
    } else if (t < 12.0) {
      // Shot 2 — three terrible darts.
      if (t < 6.45) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.16;
        p.handR = { x: 320, y: 930 };
        p.bendR = -1;
        p.handL = { x: 90, y: 1110 };
      } else if (t < 7.05) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.handR = { x: 350, y: 900 };
        p.bendR = -1;
        p.handL = { x: 90, y: 1100 };
      } else if (t < 7.75) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.handL = { x: 105, y: 1040 };
        p.handR = { x: 300, y: 960 };
      } else if (t < 8.22) {
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'flat';
        p.handL = { x: 70, y: 1120 };
        p.handR = { x: 275, y: 1120 };
      } else if (t < 8.8) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.08;
        p.handR = { x: 330, y: 1010 };
        p.bendR = -1;
        p.handL = { x: 80, y: 1110 };
      } else if (t < 9.42) {
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'flat';
        p.handL = { x: 235, y: 1120 };
        p.handR = { x: 270, y: 1120 };
      } else if (t < 10.02) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.1;
        p.handR = { x: 345, y: 930 };
        p.bendR = -1;
        p.handL = { x: 85, y: 1100 };
      } else if (t < 10.85) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.handL = { x: 150, y: 1000 };
        p.handR = { x: 245, y: 1000 };
        p.headDrop = 4;
      } else {
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = -0.04;
        p.handL = { x: 95, y: 1120 };
        p.handR = { x: 265, y: 1120 };
        p.fistL = true;
        p.fistR = true;
      }
    } else if (t < 18.0) {
      // Shot 3 — three quick pops, then the compartment gag.
      if (t < 12.3) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.14;
        p.handR = { x: 325, y: 935 };
        p.bendR = -1;
        p.handL = { x: 85, y: 1105 };
      } else if (t < 12.72) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'grin';
        p.handR = { x: 350, y: 900 };
        p.bendR = -1;
        p.handL = { x: 90, y: 1090 };
      } else if (t < 13.15) {
        p.brow = 'raised';
        p.eye = 'squint';
        p.mouth = 'smirk';
        p.handR = { x: 315, y: 930 };
        p.bendR = -1;
        p.handL = { x: 210, y: 1120 };
      } else if (t < 13.62) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'grin';
        p.handR = { x: 350, y: 905 };
        p.bendR = -1;
        p.handL = { x: 95, y: 1085 };
      } else if (t < 13.95) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.06;
        p.handR = { x: 330, y: 975 };
        p.bendR = -1;
        p.handL = { x: 215, y: 1110 };
      } else if (t < 15.02) {
        p.brow = 'raised';
        p.eye = 'happy';
        p.mouth = 'grin';
        p.handL = { x: 80, y: 860 };
        p.handR = { x: 300, y: 860 };
        p.bendL = -1;
        p.bendR = -1;
      } else if (t < 15.45) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.headDrop = -6;
        p.handL = { x: 130, y: 900 };
        p.handR = { x: 300, y: 900 };
        p.fistL = true;
        p.fistR = true;
      } else if (t < 16.35) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.look = 'up';
        p.headDrop = -10;
        p.handL = { x: 248, y: 890 };
        p.bendL = -1;
        p.handR = { x: 90, y: 1080 };
      } else if (t < 17.0) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.handL = { x: 238, y: 905 };
        p.bendL = -1;
        p.handR = { x: 280, y: 1120 };
      } else if (t < 17.45) {
        p.brow = 'raised';
        p.eye = 'shut';
        p.mouth = 'smile';
        p.handL = { x: 205, y: 1080 };
        p.handR = { x: 275, y: 1110 };
      } else {
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.03;
        p.handL = { x: 95, y: 1120 };
        p.handR = { x: 265, y: 1120 };
        p.fistL = true;
        p.fistR = true;
      }
    } else if (t < 24.0) {
      // Shot 4 — suspense, jackpot, victory hops.
      if (t < 18.65) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.handR = { x: 300, y: 900 };
        p.bendR = -1;
        p.pointR = true;
        p.handL = { x: 215, y: 1120 };
      } else if (t < 20.25) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.12;
        p.handR = { x: 315, y: 935 };
        p.bendR = -1;
        p.handL = { x: 85, y: 1110 };
      } else if (t < 21.35) {
        p.brow = 'determined';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.2;
        p.handR = { x: 320, y: 925 };
        p.bendR = -1;
        p.handL = { x: 75, y: 1100 };
      } else if (t < 22.2) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.handR = { x: 350, y: 900 };
        p.bendR = -1;
        p.handL = { x: 100, y: 1010 };
      } else if (t < 23.05) {
        p.brow = 'raised';
        p.eye = 'happy';
        p.mouth = 'grin';
        p.handL = { x: 80, y: 780 };
        p.handR = { x: 300, y: 780 };
        p.bendL = -1;
        p.bendR = -1;
      } else if (t < 23.7) {
        p.brow = 'raised';
        p.eye = 'happy';
        p.mouth = 'grin';
        p.handL = { x: 66, y: 760 };
        p.handR = { x: 315, y: 760 };
        p.bendL = -1;
        p.bendR = -1;
      } else {
        p.brow = 'raised';
        p.eye = 'happy';
        p.mouth = 'grin';
        p.handL = { x: 70, y: 800 };
        p.handR = { x: 310, y: 800 };
        p.bendL = -1;
        p.bendR = -1;
      }
    } else {
      // Shot 5 — the prize is a balloon.
      if (t < 24.5) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.look = 'up';
        p.headDrop = -6;
        p.handL = { x: 210, y: 1120 };
        p.handR = { x: 275, y: 1120 };
      } else if (t < 25.35) {
        p.brow = 'raised';
        p.eye = 'wide';
        p.mouth = 'o';
        p.lean = 0.08;
        p.handL = { x: 195, y: 1030 };
        p.handR = { x: 300, y: 1000 };
      } else if (t < 27.35) {
        p.brow = 'sad';
        p.eye = 'shut';
        p.mouth = 'o';
        p.lean = -0.08;
        p.headDrop = 8;
        p.handL = { x: 115, y: 925 };
        p.handR = { x: 250, y: 915 };
        p.fistL = true;
        p.fistR = true;
      } else if (t < 28.2) {
        p.brow = 'sad';
        p.eye = 'shut';
        p.mouth = 'o';
        p.headDrop = 14;
        p.handL = { x: 135, y: 910 };
        p.handR = { x: 225, y: 910 };
        p.fistL = true;
        p.fistR = true;
      } else if (t < 28.55) {
        p.brow = 'sad';
        p.eye = 'squint';
        p.mouth = 'frown';
        p.headDrop = 4;
        p.headTurn = Math.sin((t - 28.2) * 40) * 8;
        p.handL = { x: 110, y: 1110 };
        p.handR = { x: 260, y: 1110 };
      } else {
        p.brow = 'angry';
        p.eye = 'squint';
        p.mouth = 'grit';
        p.lean = 0.04;
        p.handL = { x: 95, y: 1120 };
        p.handR = { x: 265, y: 1120 };
        p.fistL = true;
        p.fistR = true;
      }
    }

    // The beanie is a flying prop between the bonk and the moment he puts it
    // back on, so the head stops drawing it.
    if (t >= 15.45 && t < 17.05) p.beanieOn = false;

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
      handL: { x: 60, y: 1130 },
      handR: { x: 270, y: 1130 },
      bendL: 1,
      bendR: 1,
      fistL: false,
      fistR: false,
      pointR: false,
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

      // Blue trousers over the cartoon legs.
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

      // Shirt.
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
      ctx.strokeStyle = 'rgba(20,20,20,0.22)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bodyTopX - 18, shoulderY + 16);
      ctx.lineTo(bodyTopX + 18, shoulderY + 16);
      ctx.stroke();
    }

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

    const drawHand = (a: Arm, fist: boolean, point: boolean) => {
      const r = fist ? 16 : 12;
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(a.hx, a.hy, r, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (point) {
        const dx = a.hx - a.ex;
        const dy = a.hy - a.ey;
        const len = Math.max(1, Math.hypot(dx, dy));
        ctx.strokeStyle = INK;
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.moveTo(a.hx, a.hy);
        ctx.lineTo(a.hx + (dx / len) * 34, a.hy + (dy / len) * 34);
        ctx.stroke();
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(a.hx, a.hy);
        ctx.lineTo(a.hx + (dx / len) * 32, a.hy + (dy / len) * 32);
        ctx.stroke();
      }
    };
    drawHand(arms.l, pose.fistL, false);
    drawHand(arms.r, pose.fistR, pose.pointR);

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
    const twitch = t >= 29.0 ? Math.sin(t * 22) * 3 : 0;
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
    if (t >= 29.05) {
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

  private drawRainbowCelebration(ctx: CanvasRenderingContext2D, t: number) {
    const a =
      t < 21.6 || t > 24.4 ? 0 : Math.sin(clamp((t - 21.6) / 2.8, 0, 1) * Math.PI);
    if (a <= 0) return;
    const colors = [
      '#ef4444',
      '#f97316',
      '#facc15',
      '#22c55e',
      '#3b82f6',
      '#6366f1',
      '#a855f7',
    ];
    ctx.save();
    ctx.globalAlpha = 0.16 * a;
    ctx.translate(650, 860);
    ctx.rotate(t * 0.4);
    for (let i = 0; i < colors.length; i++) {
      const a0 = (i / colors.length) * TAU;
      const a1 = ((i + 1) / colors.length) * TAU;
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 1300, a0, a1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
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
