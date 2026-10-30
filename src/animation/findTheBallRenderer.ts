import type { StudioConfig } from '../types';

/**
 * FIND THE BALL - 30s vertical (1080x1920) Modern Pop stickman comedy.
 *
 * Shot map:
 *  0.0-2.0   Shot 1  hook: smug face + pink ball between two fingers, freeze
 *  2.0-6.0   Shot 2  setup: ball goes under the teal middle cup, "watch me"
 *  6.0-10.0  Shot 3  slow shuffle: two readable swaps
 * 10.0-15.0  Shot 4  fast shuffle: four swaps, the ball escapes at the midpoint
 * 15.0-19.0  Shot 5  pick a cup: table slap, point at camera, 3-2-1 countdown
 * 19.0-22.0  Shot 6  two empty cups (left then right)
 * 22.0-27.0  Shot 7  the third cup is empty; he panics, then spots the ball
 * 27.0-30.0  Shot 8  end frame: ball held up again, defeated fury
 */

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

const INK = '#111111';
const WHITE = '#ffffff';
const CURTAIN = '#17233f';
const CURTAIN_LIGHT = '#1f2f52';
const CURTAIN_DARK = '#101a2f';
const FLOOR = '#8a5a2b';
const FLOOR_LIGHT = '#9d6a35';
const FLOOR_DARK = '#6f4720';
const TABLE_TOP = '#cf8f4e';
const TABLE_TOP_LIGHT = '#e0a45f';
const TABLE_SIDE = '#a06b34';
const TABLE_DARK = '#7c4f24';
const CUP_ORANGE = '#f08a2e';
const CUP_ORANGE_DARK = '#c96a17';
const CUP_TEAL = '#2fb3a8';
const CUP_TEAL_DARK = '#1e8d84';
const CUP_PURPLE = '#8b5cf6';
const CUP_PURPLE_DARK = '#6d3fd6';
const BALL_PINK = '#ff5fb0';
const BALL_PINK_DARK = '#e13a92';
const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const SHIRT = '#ffd166';

const FLOOR_Y = 1500;
const HIP_Y = 1170;
const HEAD_R = 70;
const TABLE_TOP_Y = 1220;
const TABLE_BOTTOM_Y = 1280;
const TABLE_L = 230;
const TABLE_R = 850;
const CUP_BASE_Y = 1220;
const SLOT_X = [360, 540, 720];

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
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky';
type EyeShape = 'open' | 'wide' | 'squint' | 'shut' | 'sly';

interface Pt {
  x: number;
  y: number;
}

interface Pose {
  lean: number;
  headTilt: number;
  headDrop: number;
  look: 'front' | 'down';
  mouth: MouthShape;
  brow: BrowShape;
  eye: EyeShape;
  legs: 'stand';
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

type CupKey = 'orange' | 'teal' | 'purple';

interface CupVisual {
  key: CupKey;
  x: number;
  shadowX: number;
  y: number;
  lift: number;
  hop: number;
  lean: number;
  color: string;
  dark: string;
}

interface BallVisual {
  x: number;
  y: number;
  r: number;
  visible: boolean;
  roll: number;
  squash: number;
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

interface SwapEvent {
  from: number;
  to: number;
  a: number;
  b: number;
}

export class FindTheBallRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  private readonly floorY = FLOOR_Y;
  private readonly hipY = HIP_Y;
  private readonly headR = HEAD_R;

  private readonly cupColors: Record<CupKey, [string, string]> = {
    orange: [CUP_ORANGE, CUP_ORANGE_DARK],
    teal: [CUP_TEAL, CUP_TEAL_DARK],
    purple: [CUP_PURPLE, CUP_PURPLE_DARK],
  };

  /** Six swaps total (two slow, four fast) whose product is the identity, so
   *  the final row is orange / teal / purple again and the teal cup ends in
   *  the middle. */
  private readonly swaps: SwapEvent[] = [
    { from: 6.4, to: 7.3, a: 0, b: 1 },
    { from: 7.7, to: 8.6, a: 1, b: 2 },
    { from: 10.6, to: 11.15, a: 0, b: 1 },
    { from: 11.3, to: 11.85, a: 1, b: 2 },
    { from: 12.0, to: 12.55, a: 0, b: 1 },
    { from: 12.7, to: 13.25, a: 1, b: 2 },
  ];

  private readonly lifts: Record<CupKey, Array<[number, number]>> = {
    teal: [
      [0, 0],
      [2.5, 0], [3.05, 1], [3.45, 1], [4.0, 0],
      [22.0, 0], [22.48, 1], [22.95, 1], [23.25, 0],
      [24.05, 0], [24.25, 1], [24.35, 1], [24.55, 0],
      [30, 0],
    ],
    orange: [
      [0, 0],
      [19.0, 0], [19.35, 1], [19.85, 1], [20.15, 0],
      [23.25, 0], [23.5, 1], [23.6, 1], [23.8, 0],
      [30, 0],
    ],
    purple: [
      [0, 0],
      [20.3, 0], [20.65, 1], [21.25, 1], [21.55, 0],
      [23.7, 0], [23.95, 1], [24.05, 1], [24.25, 0],
      [30, 0],
    ],
  };

  private readonly captions: CaptionLine[] = [
    { text: 'FIND THE BALL.', from: 0.15, to: 1.9 },
    { text: 'WATCH CLOSELY…', from: 2.2, to: 5.8 },
    { text: 'EASY, RIGHT?', from: 6.2, to: 9.9 },
    { text: 'NOW FASTER.', from: 10.2, to: 14.8 },
    { text: 'PICK A CUP.', from: 15.15, to: 18.9 },
    { text: 'NOPE.', from: 19.2, to: 21.9 },
    { text: "WHERE'S THE BALL?!", from: 22.2, to: 24.4 },
    { text: "…IT ESCAPED 💀", from: 24.6, to: 26.9 },
    { text: 'DID YOU SEE IT? 👀', from: 27.15, to: 29.6 },
  ];

  private readonly countdown: Array<[number, string]> = [
    [16.6, '3'],
    [17.4, '2'],
    [18.2, '1'],
  ];

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 540, y: 970, zoom: 2.05 },
    { t: 0.9, x: 548, y: 960, zoom: 2.2 },
    { t: 1.99, x: 548, y: 960, zoom: 2.2 },
    { t: 2.0, x: 540, y: 1078, zoom: 1.52 },
    { t: 2.6, x: 540, y: 1074, zoom: 1.55 },
    { t: 6.0, x: 540, y: 1076, zoom: 1.55 },
    { t: 9.9, x: 540, y: 1080, zoom: 1.58 },
    { t: 10.1, x: 540, y: 1080, zoom: 1.58 },
    { t: 14.9, x: 540, y: 1080, zoom: 1.62 },
    { t: 15.0, x: 540, y: 1080, zoom: 1.62 },
    { t: 16.2, x: 540, y: 1090, zoom: 1.7 },
    { t: 18.0, x: 540, y: 1085, zoom: 1.75 },
    { t: 18.9, x: 540, y: 1085, zoom: 1.75 },
    { t: 19.0, x: 540, y: 1100, zoom: 1.64 },
    { t: 21.9, x: 540, y: 1100, zoom: 1.66 },
    { t: 22.0, x: 540, y: 1100, zoom: 1.7 },
    { t: 22.6, x: 540, y: 1100, zoom: 1.8 },
    { t: 23.3, x: 540, y: 1100, zoom: 1.72 },
    { t: 24.5, x: 540, y: 1100, zoom: 1.68 },
    { t: 24.95, x: 540, y: 1180, zoom: 1.6 },
    { t: 25.6, x: 520, y: 1140, zoom: 1.48 },
    { t: 26.9, x: 520, y: 1140, zoom: 1.5 },
    { t: 27.0, x: 548, y: 960, zoom: 2.2 },
    { t: 28.2, x: 548, y: 950, zoom: 2.28 },
    { t: 30.0, x: 548, y: 940, zoom: 2.38 },
  ];

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = clamp(time, 0, 30);

    // Shot 1 is a freeze-frame from 0.9s.
    const visual = t >= 0.9 && t < 1.9 ? 0.9 : t;

    ctx.save();
    ctx.fillStyle = CURTAIN;
    ctx.fillRect(0, 0, this.width, this.height);

    this.applyCamera(ctx, visual);

    this.renderStage(ctx, visual);
    const cups = this.cupStates(visual);
    const char = this.charState(visual, cups);
    const ball = this.ballState(visual);

    this.renderCharacterBody(ctx, char, visual);
    this.renderTable(ctx);
    this.renderCups(ctx, cups);
    if (ball.visible) this.drawBall(ctx, ball);
    this.renderCharacterArms(ctx, char, visual);
    this.renderEffects(ctx, visual, cups, ball, char);

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
    const keys = this.cameraKeys;
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
    if (t >= 15.0 && t < 15.4) {
      const u = (t - 15.0) / 0.4;
      const k = (1 - u) * 9;
      x = Math.sin(t * 130) * k;
      y = Math.cos(t * 110) * k * 0.6;
    }
    if (t >= 23.3 && t < 24.6) {
      const k = Math.sin(((t - 23.3) / 1.3) * Math.PI) * 7;
      x = Math.sin(t * 115) * k;
      y = Math.cos(t * 95) * k * 0.6;
    }
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
  // Stage: curtains, spotlight, wooden floor
  // ------------------------------------------------------------------

  private renderStage(ctx: CanvasRenderingContext2D, t: number) {
    // Curtain wall
    ctx.fillStyle = CURTAIN;
    ctx.fillRect(-1200, -600, WIDTH + 2400, FLOOR_Y + 600);

    // Vertical folds
    for (let x = -300; x < WIDTH + 300; x += 132) {
      ctx.fillStyle = CURTAIN_LIGHT;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(x, -600, 44, FLOOR_Y + 600);
      ctx.fillStyle = CURTAIN_DARK;
      ctx.fillRect(x + 66, -600, 30, FLOOR_Y + 600);
      ctx.globalAlpha = 1;
    }

    // Valance
    ctx.fillStyle = CURTAIN_DARK;
    ctx.fillRect(-1200, -600, WIDTH + 2400, 240);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-1200, 240);
    for (let x = -1200; x < WIDTH + 1200; x += 200) {
      ctx.quadraticCurveTo(x + 100, 320, x + 200, 240);
    }
    ctx.stroke();

    // Warm spotlight cone
    ctx.save();
    ctx.globalAlpha = 0.1 + Math.sin(t * 2.2) * 0.012;
    ctx.fillStyle = '#ffdf9e';
    ctx.beginPath();
    ctx.moveTo(330, 240);
    ctx.lineTo(750, 240);
    ctx.lineTo(980, FLOOR_Y + 260);
    ctx.lineTo(100, FLOOR_Y + 260);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Wooden floor
    ctx.fillStyle = FLOOR;
    ctx.fillRect(-1200, FLOOR_Y, WIDTH + 2400, HEIGHT - FLOOR_Y + 600);

    // Planks
    ctx.strokeStyle = FLOOR_DARK;
    ctx.lineWidth = 4;
    for (let y = FLOOR_Y + 70; y < HEIGHT + 200; y += 110) {
      ctx.beginPath();
      ctx.moveTo(-1200, y);
      ctx.lineTo(WIDTH + 1200, y);
      ctx.stroke();
    }
    ctx.strokeStyle = FLOOR_LIGHT;
    ctx.lineWidth = 2;
    for (let y = FLOOR_Y + 74; y < HEIGHT + 200; y += 110) {
      ctx.beginPath();
      ctx.moveTo(-1200, y);
      ctx.lineTo(WIDTH + 1200, y);
      ctx.stroke();
    }
    // Board seams
    ctx.strokeStyle = FLOOR_DARK;
    ctx.lineWidth = 4;
    const seams = [90, 300, 520, 760, 980, 1180];
    for (let i = 0; i < seams.length; i++) {
      const sx = seams[i];
      const off = i % 2 === 0 ? 0 : 55;
      for (let y = FLOOR_Y; y < HEIGHT + 200; y += 220) {
        ctx.beginPath();
        ctx.moveTo(sx, y + off);
        ctx.lineTo(sx, y + off + 110);
        ctx.stroke();
      }
    }

    // Floor line
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-1200, FLOOR_Y);
    ctx.lineTo(WIDTH + 1200, FLOOR_Y);
    ctx.stroke();

    // Warm light pool on the floor
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = '#ffe6ae';
    ctx.beginPath();
    ctx.ellipse(540, FLOOR_Y + 190, 390, 92, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private renderTable(ctx: CanvasRenderingContext2D) {
    const l = TABLE_L;
    const r = TABLE_R;

    // Front legs
    ctx.fillStyle = TABLE_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    for (const lx of [l + 70, r - 120]) {
      ctx.fillRect(lx, TABLE_BOTTOM_Y + 60, 50, FLOOR_Y - TABLE_BOTTOM_Y - 60);
      ctx.strokeRect(lx, TABLE_BOTTOM_Y + 60, 50, FLOOR_Y - TABLE_BOTTOM_Y - 60);
    }

    // Apron
    ctx.fillStyle = TABLE_SIDE;
    ctx.fillRect(l + 20, TABLE_BOTTOM_Y, r - l - 40, 64);
    ctx.strokeRect(l + 20, TABLE_BOTTOM_Y, r - l - 40, 64);

    // Top slab
    ctx.fillStyle = TABLE_TOP;
    ctx.fillRect(l, TABLE_TOP_Y, r - l, TABLE_BOTTOM_Y - TABLE_TOP_Y);
    ctx.strokeRect(l, TABLE_TOP_Y, r - l, TABLE_BOTTOM_Y - TABLE_TOP_Y);

    // Glossy top stripe
    ctx.fillStyle = TABLE_TOP_LIGHT;
    ctx.fillRect(l + 10, TABLE_TOP_Y + 8, r - l - 20, 20);
    ctx.fillStyle = WHITE;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(l + 10, TABLE_TOP_Y + 8, r - l - 20, 8);
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------
  // Cups
  // ------------------------------------------------------------------

  private cupStates(t: number): CupVisual[] {
    const keys: CupKey[] = ['orange', 'teal', 'purple'];
    const slots = [0, 1, 2];

    let active: { iA: number; iB: number; a: number; b: number; u: number } | null = null;

    for (const swap of this.swaps) {
      if (t >= swap.to) {
        const iA = slots.indexOf(swap.a);
        const iB = slots.indexOf(swap.b);
        slots[iA] = swap.b;
        slots[iB] = swap.a;
      } else if (t >= swap.from) {
        const iA = slots.indexOf(swap.a);
        const iB = slots.indexOf(swap.b);
        active = { iA, iB, a: swap.a, b: swap.b, u: smooth((t - swap.from) / (swap.to - swap.from)) };
      }
    }

    return keys.map((key, i) => {
      let x = SLOT_X[slots[i]];
      let hop = 0;
      if (active && (i === active.iA || i === active.iB)) {
        const from = i === active.iA ? active.a : active.b;
        const to = i === active.iA ? active.b : active.a;
        x = lerp(SLOT_X[from], SLOT_X[to], active.u);
        // The cup travelling to the right lifts clear over the other one so
        // the pair never reads as a single fused blob while they pass.
        const arc = Math.sin(active.u * Math.PI);
        hop = to > from ? -arc * 112 : -arc * 4;
      }
      const lift = keyAt(this.lifts[key], t);
      const [color, dark] = this.cupColors[key];
      // The middle cup is lifted up AND to the left so it never covers his face.
      const shift = key === 'teal' ? -168 * lift : 0;
      return {
        key,
        x: x + shift,
        shadowX: x,
        y: CUP_BASE_Y - 190 * lift + hop,
        lift,
        hop,
        lean: Math.sin(t * 9 + i) * 0.02 + lift * Math.sin(t * 7) * 0.05,
        color,
        dark,
      };
    });
  }

  private renderCups(ctx: CanvasRenderingContext2D, cups: CupVisual[]) {
    // Shadows first
    for (const cup of cups) {
      ctx.save();
      ctx.globalAlpha = 0.22 * (1 - cup.lift * 0.6);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(cup.shadowX, CUP_BASE_Y + 6, 52 - cup.lift * 12, 10, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    // Draw order: the fixed row order, but a cup lifted over a swap is drawn
    // last so it passes in front of the one still on the table.
    const order: CupKey[] = ['orange', 'purple', 'teal'];
    const sorted = [...cups].sort((a, b) => {
      const byHop = b.hop - a.hop;
      if (Math.abs(byHop) > 1) return byHop;
      return order.indexOf(a.key) - order.indexOf(b.key);
    });
    for (const cup of sorted) this.drawCup(ctx, cup);
  }

  private drawCup(ctx: CanvasRenderingContext2D, cup: CupVisual) {
    const h = 112;
    const wBot = 50;
    const wTop = 36;

    ctx.save();
    ctx.translate(cup.x, cup.y);
    ctx.rotate(cup.lean);

    ctx.fillStyle = cup.color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-wBot, 0);
    ctx.lineTo(-wBot, -18);
    ctx.quadraticCurveTo(-wBot + 4, -h * 0.62, -wTop, -h + 14);
    ctx.quadraticCurveTo(0, -h - 12, wTop, -h + 14);
    ctx.quadraticCurveTo(wBot - 4, -h * 0.62, wBot, -18);
    ctx.lineTo(wBot, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bottom rim band
    ctx.fillStyle = cup.dark;
    ctx.beginPath();
    ctx.moveTo(-wBot, -5);
    ctx.lineTo(wBot, -5);
    ctx.lineTo(wBot, -14);
    ctx.lineTo(-wBot, -14);
    ctx.closePath();
    ctx.fill();

    // Top cap (the cup base, now facing up)
    ctx.fillStyle = cup.dark;
    ctx.beginPath();
    ctx.ellipse(0, -h + 9, wTop * 0.92, 9, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Glossy stripe
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.moveTo(-wBot + 14, -18);
    ctx.quadraticCurveTo(-wBot + 16, -h * 0.6, -wTop + 10, -h + 18);
    ctx.lineTo(-wTop + 21, -h + 18);
    ctx.quadraticCurveTo(-wBot + 26, -h * 0.6, -wBot + 24, -18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Ball
  // ------------------------------------------------------------------

  private ballState(t: number): BallVisual {
    let x = 640;
    let y = 880;
    let r = 38;
    let visible = true;
    let roll = 0;
    let squash = 1;

    if (t < 2.0) {
      // Shot 1: held up between two fingers
      x = 640;
      y = 880 + Math.sin(t * 3) * 3;
      r = 40;
    } else if (t < 3.45) {
      // Shot 2: raised, then placed under the lifted cup
      if (t < 2.5) {
        const u = smooth((t - 2.0) / 0.5);
        x = lerp(640, 690, u);
        y = lerp(880, 960, u);
        r = 40;
      } else if (t < 3.05) {
        x = 690;
        y = 960;
        r = 40;
      } else {
        const u = smooth((t - 3.05) / 0.4);
        x = lerp(690, 540, u);
        y = lerp(960, CUP_BASE_Y - 36, u);
        r = 38;
      }
    } else if (t < 11.36) {
      // Hidden under the teal cup (it rides with the cup, unseen).
      visible = false;
      x = 540;
      y = CUP_BASE_Y - 36;
    } else if (t < 12.45) {
      // The cup slides right off it: the ball is revealed and rolls left.
      const u = smooth((t - 11.36) / 1.09);
      x = lerp(540, 300, u);
      y = CUP_BASE_Y - 36;
      r = 38;
      roll = (x - 540) / 38;
    } else if (t < 13.05) {
      // Off the left edge of the table.
      const u = (t - 12.45) / 0.6;
      x = lerp(300, 252, u);
      y = lerp(CUP_BASE_Y - 36, FLOOR_Y - 36, u * u);
      r = 38;
      roll += 2.6;
    } else if (t < 13.35) {
      // Landing squash.
      const u = (t - 13.05) / 0.3;
      x = 252 + u * 14;
      y = FLOOR_Y - 36;
      r = 38;
      squash = 1 - Math.sin(u * Math.PI) * 0.22;
      roll += 0.5;
    } else if (t < 14.5) {
      // Rolling to a stop on the floor.
      const u = smooth((t - 13.35) / 1.15);
      x = lerp(266, 330, u);
      y = FLOOR_Y - 36;
      r = 38;
      roll = (roll + (x - 266) / 38) % TAU;
    } else if (t < 24.95) {
      // Resting on the floor by the table leg.
      x = 330;
      y = FLOOR_Y - 36;
      r = 38;
    } else if (t < 25.5) {
      // The final calm roll to a stop.
      const u = smooth((t - 24.95) / 0.55);
      x = lerp(330, 360, u);
      y = FLOOR_Y - 36;
      r = 38;
      roll = smooth((t - 24.95) / 0.55) * 0.8;
    } else if (t < 27.0) {
      x = 360;
      y = FLOOR_Y - 36;
      r = 38;
    } else if (t < 27.55) {
      // Picked back up into the close-up.
      const u = smooth((t - 27.0) / 0.55);
      x = lerp(360, 640, u);
      y = lerp(FLOOR_Y - 40, 880, Math.min(1, u * 1.15));
      r = lerp(38, 40, u);
    } else {
      x = 640;
      y = 880 + Math.sin(t * 2.4) * 3;
      r = 40;
    }

    return { x, y, r, visible, roll, squash };
  }

  private drawBall(ctx: CanvasRenderingContext2D, ball: BallVisual) {
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.scale(1, ball.squash);

    // Floor/table contact shadow
    const onFloor = ball.y > FLOOR_Y - 70;
    const groundY = onFloor ? FLOOR_Y : ball.y < 900 ? 0 : CUP_BASE_Y + 4;
    if (groundY > 0) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(0, groundY - ball.y, ball.r * 1.05, ball.r * 0.32, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = BALL_PINK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, ball.r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Rolling mark: two dots that spin with the roll
    ctx.save();
    ctx.rotate(ball.roll);
    ctx.fillStyle = BALL_PINK_DARK;
    ctx.beginPath();
    ctx.arc(ball.r * 0.42, 0, ball.r * 0.16, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-ball.r * 0.4, ball.r * 0.18, ball.r * 0.12, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Highlight
    ctx.save();
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.ellipse(-ball.r * 0.34, -ball.r * 0.38, ball.r * 0.24, ball.r * 0.16, -0.5, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Character
  // ------------------------------------------------------------------

  private defaultPose(): Pose {
    return {
      lean: 0,
      headTilt: 0,
      headDrop: 0,
      look: 'front',
      mouth: 'flat',
      brow: 'normal',
      eye: 'open',
      legs: 'stand',
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

  private charState(t: number, cups: CupVisual[]): CharState {
    const pose = this.defaultPose();
    const cup = (key: CupKey) => cups.find((c) => c.key === key)!;
    const liftHand = (c: CupVisual): Pt => ({ x: c.x + 8, y: c.y - 66 });
    let x = 540;
    let hipY = this.hipY;
    const hang = (dx: number, dy: number): Pt => ({ x: x + dx, y: hipY + dy });

    if (t < 2.0) {
      // Shot 1: smug close-up, ball up between two fingers
      pose.brow = 'cocky';
      pose.eye = 'sly';
      pose.mouth = 'smirk';
      pose.lean = 0.02;
      pose.handR = { x: 622, y: 905 };
      pose.handL = hang(-80, 20);
      pose.bendR = -1;
      pose.fingersR = 2;
    } else if (t < 6.0) {
      // Shot 2: the setup
      if (t < 2.5) {
        pose.brow = 'cocky';
        pose.eye = 'sly';
        pose.mouth = 'smirk';
        pose.handR = { x: 690, y: 985 };
        pose.handL = hang(-80, 20);
        pose.bendR = -1;
        pose.fingersR = 2;
      } else if (t < 4.0) {
        const teal = cup('teal');
        pose.brow = 'cocky';
        pose.eye = 'sly';
        pose.mouth = 'smirk';
        if (t < 3.05) {
          pose.handL = liftHand(teal);
          pose.handR = { x: 668, y: 985 };
        } else {
          pose.handL = liftHand(teal);
          const u = smooth((t - 3.05) / 0.4);
          pose.handR = { x: lerp(668, 552, u), y: lerp(985, CUP_BASE_Y - 78, u) };
        }
        pose.bendL = -1;
        pose.bendR = -1;
      } else if (t < 4.6) {
        // point at his eyes, then at the camera
        const u = smooth((t - 4.0) / 0.6);
        if (u < 0.5) {
          pose.handR = { x: 618, y: lerp(1080, 990, u * 2) };
        } else {
          pose.handR = { x: lerp(618, 640, (u - 0.5) * 2), y: lerp(990, 1140, (u - 0.5) * 2) };
        }
        pose.handL = hang(-70, 10);
        pose.brow = 'cocky';
        pose.eye = 'sly';
        pose.mouth = 'smirk';
        pose.bendR = -1;
        pose.fingersR = 2;
        pose.pointR = u >= 0.5;
      } else {
        pose.brow = 'cocky';
        pose.eye = 'sly';
        pose.mouth = 'smirk';
        pose.handL = { x: 400, y: 1200 };
        pose.handR = { x: 680, y: 1200 };
      }
    } else if (t < 10.0) {
      // Shot 3: slow shuffle
      pose.brow = 'cocky';
      pose.eye = 'sly';
      pose.mouth = 'smirk';
      pose.lean = -0.02;
      this.handsOnSwap(t, cups, pose, 1202);
    } else if (t < 15.0) {
      // Shot 4: fast shuffle, then a flourish
      if (t < 13.25) {
        const beat = Math.floor((t - 10.0) / 0.35);
        pose.brow = beat % 2 === 0 ? 'cocky' : 'raised';
        pose.eye = 'sly';
        pose.mouth = 'smirk';
        pose.lean = -0.03;
        this.handsOnSwap(t, cups, pose, 1202);
      } else {
        // Ta-da flourish over the cups
        const u = (t - 13.25) / 1.25;
        const wave = Math.sin(u * Math.PI * 2.2) * 60;
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'grin';
        pose.handL = { x: 430 + wave * 0.4, y: 1040 - Math.sin(u * Math.PI) * 60 };
        pose.handR = { x: 650 - wave * 0.4, y: 1040 - Math.sin(u * Math.PI) * 60 };
        pose.bendL = -1;
        pose.bendR = -1;
      }
    } else if (t < 19.0) {
      // Shot 5: slap, lean, point at the viewer
      if (t < 15.35) {
        const u = smooth((t - 15.0) / 0.35);
        pose.handL = { x: lerp(400, 430, u), y: lerp(1080, 1212, u) };
        pose.handR = { x: lerp(680, 650, u), y: lerp(1080, 1212, u) };
        pose.brow = 'cocky';
        pose.eye = 'sly';
        pose.mouth = 'smirk';
        pose.lean = 0.05 * u;
      } else if (t < 16.0) {
        const u = smooth((t - 15.35) / 0.65);
        pose.handL = { x: 440, y: 1200 };
        pose.handR = { x: lerp(650, 640, u), y: lerp(1212, 1160, u) };
        pose.brow = 'cocky';
        pose.eye = 'open';
        pose.mouth = 'grin';
        pose.lean = 0.12;
        pose.pointR = u > 0.4;
      } else {
        const bob = Math.sin(t * 2.4) * 6;
        pose.handL = { x: 440, y: 1200 };
        pose.handR = { x: 640, y: 1150 + bob };
        pose.brow = t >= 18.6 ? 'cocky' : 'angry';
        pose.eye = 'open';
        pose.mouth = 'grin';
        pose.lean = 0.12;
        pose.pointR = true;
      }
    } else if (t < 22.0) {
      // Shot 6: two empty cups
      const orange = cup('orange');
      const purple = cup('purple');
      pose.lean = 0.04;
      pose.look = 'front';
      if (t < 19.85) {
        pose.handL = liftHand(orange);
        pose.handR = { x: 690, y: 1200 };
        pose.bendL = -1;
        pose.brow = 'cocky';
        pose.mouth = 'smirk';
        pose.eye = 'open';
      } else if (t < 20.3) {
        pose.handL = { x: 400, y: 1200 };
        pose.handR = { x: 690, y: 1200 };
        pose.brow = 'raised';
        pose.mouth = 'flat';
        pose.eye = 'open';
      } else if (t < 21.55) {
        pose.handR = liftHand(purple);
        pose.handL = { x: 400, y: 1200 };
        pose.bendR = -1;
        pose.brow = t < 21.25 ? 'raised' : 'sad';
        pose.mouth = 'flat';
        pose.eye = 'open';
      } else {
        pose.handR = { x: 690, y: 1200 };
        pose.handL = { x: 470, y: 1140 };
        pose.brow = 'sad';
        pose.mouth = 'frown';
        pose.eye = 'open';
      }
    } else if (t < 27.0) {
      // Shot 7: the real answer
      const orange = cup('orange');
      const purple = cup('purple');
      const teal = cup('teal');
      if (t < 23.25) {
        pose.handL = liftHand(teal);
        pose.handR = { x: 690, y: 1200 };
        pose.bendL = -1;
        pose.brow = 'sad';
        pose.mouth = 'o';
        pose.eye = 'wide';
        pose.lean = 0.02;
      } else if (t < 24.5) {
        // frantic re-flips
        if (t < 23.8) {
          pose.handL = liftHand(orange);
          pose.bendL = -1;
        } else if (t < 24.3) {
          pose.handR = liftHand(purple);
          pose.bendR = -1;
        } else {
          pose.handL = liftHand(teal);
          pose.bendL = -1;
        }
        pose.brow = 'sad';
        pose.mouth = 'o';
        pose.eye = 'wide';
        pose.lean = -0.04;
      } else if (t < 24.95) {
        pose.handL = { x: 430, y: 1200 };
        pose.handR = { x: 650, y: 1200 };
        pose.brow = 'sad';
        pose.mouth = 'o';
        pose.eye = 'wide';
        pose.lean = -0.02;
      } else if (t < 25.6) {
        pose.handL = { x: 430, y: 1200 };
        pose.handR = { x: 650, y: 1200 };
        pose.brow = 'raised';
        pose.mouth = 'o';
        pose.eye = 'wide';
        pose.look = 'down';
        pose.headDrop = 12;
        pose.lean = -0.02;
      } else if (t < 26.3) {
        pose.handL = { x: 430, y: 1200 };
        pose.handR = { x: 650, y: 1200 };
        pose.brow = 'angry';
        pose.mouth = 'grit';
        pose.eye = 'squint';
        pose.look = 'down';
        pose.headDrop = 10;
      } else {
        pose.handL = { x: 440, y: 1200 };
        pose.handR = { x: 640, y: 1130 };
        pose.brow = 'angry';
        pose.mouth = 'grit';
        pose.eye = 'squint';
        pose.lean = 0.03;
      }
    } else {
      // Shot 8: defeated fury
      pose.brow = 'angry';
      pose.eye = 'squint';
      pose.mouth = 'grit';
      pose.lean = 0.02;
      pose.handR = { x: 622, y: 905 };
      pose.handL = hang(-80, 20);
      pose.bendR = -1;
      pose.fingersR = 2;
    }

    return { x, hipY, pose };
  }

  /** Both hands follow the two cups of the currently active swap. */
  private handsOnSwap(t: number, cups: CupVisual[], pose: Pose, restY: number) {
    for (const swap of this.swaps) {
      if (t >= swap.from && t < swap.to) {
        // Which cups are in slots a and b right now?
        const slots = [0, 1, 2];
        for (const s of this.swaps) {
          if (s === swap) break;
          if (t >= s.to) {
            const iA = slots.indexOf(s.a);
            const iB = slots.indexOf(s.b);
            slots[iA] = s.b;
            slots[iB] = s.a;
          }
        }
        const iA = slots.indexOf(swap.a);
        const iB = slots.indexOf(swap.b);
        const cupA = cups[iA];
        const cupB = cups[iB];
        // One cup hops clear over the other while it travels right, while the
        // other one slides left along the table: the right hand carries the
        // hopping cup, the left hand slides the low one. Holding on by cup (not
        // by whichever happens to be further right) keeps the hands from
        // swapping places halfway through the pass.
        const lifted = cupA.hop < -20 ? cupA : cupB;
        const low = lifted === cupA ? cupB : cupA;
        const hold = { x: lifted.x + 6, y: lifted.y - 104 };
        const push = { x: low.x + 34, y: restY - 26 };
        const grab = clamp(
          Math.min((t - swap.from) / 0.12, (swap.to - t) / 0.12),
          0,
          1
        );
        pose.handL = { x: lerp(400, push.x, grab), y: lerp(restY - 2, push.y, grab) };
        pose.handR = { x: lerp(680, hold.x, grab), y: lerp(restY - 2, hold.y, grab) };
        pose.bendL = -1;
        // A hand reaching across the body folds its elbow down and in, or the
        // bent arm ends up drawn straight across his face.
        pose.bendR = hold.x < 560 ? 1 : -1;
        return;
      }
    }
    pose.handL = { x: 420, y: restY - 40 };
    pose.handR = { x: 660, y: restY - 40 };
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

  private renderCharacterBody(ctx: CanvasRenderingContext2D, char: CharState, t: number) {
    this.drawStickman(ctx, char.x, char.hipY, char.pose, t, false);
  }

  private renderCharacterArms(ctx: CanvasRenderingContext2D, char: CharState, t: number) {
    this.drawStickman(ctx, char.x, char.hipY, char.pose, t, true);
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
      // Legs (standing behind the table)
      ctx.strokeStyle = INK;
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX - 44, this.floorY);
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 44, this.floorY);
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
        // Foreshortened index finger toward the camera, drawn down-left with
        // a black keyline so it still reads against the cups and his shirt.
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
      // Head
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
    const lookDrop = pose.look === 'down' ? 7 : 0;
    const eyeY = cy + 8 + lookDrop;
    const eyeDX = 26;
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    if (pose.eye === 'shut') {
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(cx + side * eyeDX, eyeY + 8, 14, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    } else if (pose.eye === 'sly') {
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + side * eyeDX, eyeY, 12, 8, 0, 0, TAU);
        ctx.fill();
      }
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + side * (eyeDX - 12), eyeY - 12);
        ctx.lineTo(cx + side * (eyeDX + 12), eyeY - 12);
        ctx.stroke();
      }
    } else {
      const eyeH = pose.eye === 'wide' ? 30 : pose.eye === 'squint' ? 8 : 20;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + side * eyeDX, eyeY, 11, eyeH / 2, 0, 0, TAU);
        ctx.fill();
      }
    }

    // Eyebrows
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    const browY = cy - 12;
    const twitch = t < 2.0 ? Math.sin(t * 30) * 2 : 0;
    ctx.beginPath();
    if (pose.brow === 'angry') {
      ctx.moveTo(cx - 42, browY - 8);
      ctx.lineTo(cx - 12, browY + 8 + twitch);
      ctx.moveTo(cx + 42, browY - 8);
      ctx.lineTo(cx + 12, browY + 8 - twitch);
    } else if (pose.brow === 'raised') {
      ctx.moveTo(cx - 42, browY - 8);
      ctx.lineTo(cx - 12, browY - 8);
      ctx.moveTo(cx + 42, browY - 8);
      ctx.lineTo(cx + 12, browY - 8);
    } else if (pose.brow === 'sad') {
      ctx.moveTo(cx - 42, browY + 8);
      ctx.lineTo(cx - 12, browY - 8);
      ctx.moveTo(cx + 42, browY + 8);
      ctx.lineTo(cx + 12, browY - 8);
    } else if (pose.brow === 'cocky') {
      // one raised, one angled
      ctx.moveTo(cx - 42, browY - 8);
      ctx.lineTo(cx - 12, browY - 8);
      ctx.moveTo(cx + 42, browY - 2);
      ctx.lineTo(cx + 12, browY + 4);
    } else {
      ctx.moveTo(cx - 42, browY - 4);
      ctx.lineTo(cx - 12, browY - 8);
      ctx.moveTo(cx + 42, browY - 4);
      ctx.lineTo(cx + 12, browY - 8);
    }
    ctx.stroke();

    // Mouth
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    const my = cy + 40;
    ctx.beginPath();
    if (pose.mouth === 'grin') {
      ctx.arc(cx, my - 12, 26, 0.15 * Math.PI, 0.85 * Math.PI);
    } else if (pose.mouth === 'smile') {
      ctx.arc(cx, my - 14, 20, 0.2 * Math.PI, 0.8 * Math.PI);
    } else if (pose.mouth === 'smirk') {
      ctx.moveTo(cx - 22, my + 2);
      ctx.quadraticCurveTo(cx + 4, my + 10, cx + 24, my - 10);
    } else if (pose.mouth === 'frown') {
      ctx.arc(cx, my + 16, 24, 1.15 * Math.PI, 1.85 * Math.PI);
    } else if (pose.mouth === 'o') {
      ctx.ellipse(cx, my, 14, 18, 0, 0, TAU);
    } else if (pose.mouth === 'grit') {
      ctx.moveTo(cx - 24, my);
      ctx.lineTo(cx + 24, my);
      for (let i = -2; i <= 2; i++) {
        ctx.moveTo(cx + i * 10, my - 8);
        ctx.lineTo(cx + i * 10, my + 8);
      }
    } else {
      ctx.moveTo(cx - 18, my);
      ctx.lineTo(cx + 18, my);
    }
    ctx.stroke();
  }

  // ------------------------------------------------------------------
  // Effects
  // ------------------------------------------------------------------

  private renderEffects(
    ctx: CanvasRenderingContext2D,
    t: number,
    cups: CupVisual[],
    ball: BallVisual,
    char: CharState
  ) {
    // Magic sparkles around the handled ball
    if ((t >= 2.5 && t < 3.5) || (t >= 4.1 && t < 4.6)) {
      ctx.save();
      const cx = ball.x;
      const cy = ball.y;
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + t * 3;
        const px = cx + Math.cos(a) * (ball.r + 34);
        const py = cy + Math.sin(a) * (ball.r + 34);
        const pulse = 12 + Math.sin(t * 16 + i) * 4;
        ctx.beginPath();
        ctx.moveTo(px - pulse, py);
        ctx.lineTo(px + pulse, py);
        ctx.moveTo(px, py - pulse);
        ctx.lineTo(px, py + pulse);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Cup motion streaks during the fast shuffle
    if (t >= 10.25 && t < 13.0) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      for (const cup of cups) {
        const speed = Math.abs(cup.hop);
        if (speed > 6) {
          ctx.beginPath();
          ctx.moveTo(cup.x - 90, cup.y - 70);
          ctx.lineTo(cup.x - 24, cup.y - 70);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // "Notice me" glint on the rolling ball as it escapes
    if (t >= 11.42 && t < 12.4) {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(ball.x - ball.r - 26, ball.y - ball.r - 20);
      ctx.lineTo(ball.x - ball.r - 10, ball.y - ball.r - 34);
      ctx.stroke();
      ctx.restore();
    }

    // Angry shake marks when he spots the ball
    if (t >= 25.6 && t < 26.6) {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const hx = char.x + 70;
      const hy = char.hipY - 250;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(hx + 10 + i * 16, hy + 10 + i * 10);
        ctx.lineTo(hx + 30 + i * 16, hy - 8 + i * 10);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private renderScreenEffects(ctx: CanvasRenderingContext2D, t: number) {
    // White graphic flash on the shot 1 freeze
    if (t >= 0.9 && t < 1.15) {
      const u = (t - 0.9) / 0.25;
      ctx.save();
      ctx.globalAlpha = (1 - u) * 0.75;
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

    const size = 78;
    ctx.font = `900 ${size}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 20;
    ctx.strokeText(line.text, 0, 0);
    ctx.fillStyle = WHITE;
    ctx.fillText(line.text, 0, 0);

    ctx.restore();
  }

  private renderCountdown(ctx: CanvasRenderingContext2D, t: number) {
    for (const [at, text] of this.countdown) {
      const from = at;
      const to = at + 0.72;
      if (t < from || t >= to) continue;
      const u = clamp((t - from) / 0.1, 0, 1);
      const fade = Math.min(1, (to - t) / 0.16);
      const alpha = clamp(Math.min((t - from) / 0.05, fade), 0, 1);
      const scale = 1 - (1 - u) * 0.4 + Math.sin(u * Math.PI) * 0.22;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.width / 2, 1360);
      ctx.scale(scale, scale);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.font = '900 280px "Arial Black", "Helvetica Neue", Arial, sans-serif';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 32;
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
