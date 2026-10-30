import type { StudioConfig } from '../types';

/**
 * THE PERFECT PANCAKE FLIP - 30s vertical (1080x1920) Modern Pop stickman comedy.
 *
 * Shot map:
 *  0.0-2.0   Shot 1  the hook (close-up smash zoom)
 *  2.0-6.0   Shot 2  pancake sticks to the ceiling
 *  6.0-10.0  Shot 3  ramp of books + cutting board, plate placed
 * 10.0-13.0  Shot 4  pancake slides back into the pan, glare at camera
 * 13.0-16.0  Shot 5A final launch up the ramp, airborne
 * 16.0-19.0  Shot 5B perfect landing in the plate
 * 19.0-23.0  Shot 6  confetti champion celebration
 * 23.0-29.0  Shot 7  counter bump, pancake to the face, fury
 * 29.0-30.0  Shot 8  pancake hat, defeated stare
 */

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

const INK = '#111111';
const WHITE = '#ffffff';
const TURQ = '#2ec4b6';
const TURQ_DARK = '#1f9d92';
const PINK = '#ffb3c6';
const PINK_DARK = '#ff87ab';
const ORANGE = '#ff9f1c';
const ORANGE_DARK = '#dd8007';
const YELLOW = '#ffd166';
const RED = '#e63946';
const GOLD = '#f6bd60';
const GOLD_DARK = '#d99a35';
const FLOOR = '#d9c7ad';
const WOOD = '#c89f7b';
const WOOD_DARK = '#9c744c';
const SILVER = '#dcdcdc';

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

interface CaptionLine {
  text: string;
  from: number;
  to: number;
}

const CAPTIONS: CaptionLine[] = [
  { text: 'CAN HE LAND IT?', from: 0.15, to: 1.9 },
  { text: 'FIRST TRY…', from: 2.2, to: 5.8 },
  { text: 'TIME FOR A RAMP.', from: 6.2, to: 9.8 },
  { text: 'NOPE.', from: 10.2, to: 12.9 },
  { text: 'ONE SHOT.', from: 13.2, to: 15.9 },
  { text: 'PERFECT!!!', from: 19.2, to: 22.9 },
  { text: '…OR NOT 💀', from: 23.2, to: 28.9 },
];

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

interface PancakeState {
  x: number;
  y: number;
  rot: number;
  visible: boolean;
  shape: 'flat' | 'edge';
}

type MouthShape = 'flat' | 'smile' | 'grin' | 'o' | 'frown' | 'grit';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad';

interface Pose {
  lean: number;
  leftArm: number;
  leftElbow: number;
  rightArm: number;
  rightElbow: number;
  mouth: MouthShape;
  brow: BrowShape;
  eye: 'open' | 'wide' | 'squint';
  headTilt: number;
}

export class PancakeFlipRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  private readonly floorY = 1460;
  private readonly hipY = 1160;
  private readonly shoulderY = 990;
  private readonly headR = 70;

  private readonly stoveL = 80;
  private readonly stoveR = 340;
  private readonly stoveTop = 1130;

  private readonly sinkL = 400;
  private readonly sinkR = 560;

  private readonly counterTopY = 1150;
  private readonly counterL = 40;
  private readonly counterR = 1040;

  private readonly rampLowX = 560;
  private readonly rampLowY = 1150;
  private readonly rampHighX = 820;
  private readonly rampHighY = 930;

  private readonly bookL = 758;
  private readonly bookR = 872;

  private readonly plateX = 946;
  private readonly plateY = 1080;
  private readonly plateR = 72;

  private readonly panHomeX = 330;
  private readonly panHomeY = 1120;
  private readonly panR = 92;
  private readonly pancakeR = 60;

  private readonly characterX = 420;

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 420, y: 880, zoom: 2.15 },
    { t: 1.2, x: 420, y: 880, zoom: 2.15 },
    { t: 2.0, x: 540, y: 980, zoom: 1.0 },
    { t: 2.8, x: 540, y: 980, zoom: 1.0 },
    { t: 3.8, x: 540, y: 430, zoom: 1.55 },
    { t: 4.7, x: 540, y: 980, zoom: 1.0 },
    { t: 6.0, x: 540, y: 980, zoom: 1.0 },
    { t: 8.0, x: 600, y: 1000, zoom: 1.05 },
    { t: 10.0, x: 620, y: 1040, zoom: 1.08 },
    { t: 13.0, x: 640, y: 1020, zoom: 1.08 },
    { t: 15.2, x: 700, y: 940, zoom: 1.12 },
    { t: 16.0, x: 800, y: 880, zoom: 1.2 },
    { t: 18.6, x: 850, y: 950, zoom: 1.18 },
    { t: 19.0, x: 620, y: 980, zoom: 1.02 },
    { t: 23.0, x: 620, y: 980, zoom: 1.02 },
    { t: 24.4, x: 700, y: 1000, zoom: 1.0 },
    { t: 24.6, x: 420, y: 880, zoom: 1.4 },
    { t: 29.0, x: 420, y: 880, zoom: 1.45 },
    { t: 30.0, x: 420, y: 870, zoom: 1.65 },
  ];

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = Math.min(time, 30);

    ctx.save();
    ctx.fillStyle = '#f3ede4';
    ctx.fillRect(0, 0, this.width, this.height);

    this.applyCamera(ctx, t);

    this.renderKitchen(ctx, t);
    this.renderProps(ctx, t);
    this.renderCharacter(ctx, t);
    this.renderPancake(ctx, t);
    this.renderEffects(ctx, t);

    ctx.restore();

    if (config.showCaptions) this.renderCaption(ctx, time);
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
        const u = smooth((t - a.t) / (b.t - a.t));
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

  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    const cam = this.cameraAt(t);
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);
  }

  // ------------------------------------------------------------------
  // Kitchen
  // ------------------------------------------------------------------

  private renderKitchen(ctx: CanvasRenderingContext2D, t: number) {
    // Upper turquoise cabinets
    ctx.fillStyle = TURQ;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillRect(60, 150, 960, 290);
    ctx.strokeRect(60, 150, 960, 290);

    ctx.strokeStyle = TURQ_DARK;
    ctx.lineWidth = 4;
    for (let i = 0; i < 4; i++) {
      const x = 110 + i * 230;
      ctx.strokeRect(x, 190, 200, 210);
      ctx.beginPath();
      ctx.moveTo(x + 100, 190);
      ctx.lineTo(x + 100, 400);
      ctx.stroke();
      // handles
      ctx.fillStyle = INK;
      ctx.fillRect(x + 78, 280, 44, 10);
      ctx.fillRect(x + 130, 280, 44, 10);
    }

    // Pink backsplash tiles
    ctx.fillStyle = PINK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillRect(60, 440, 960, 710);
    ctx.strokeRect(60, 440, 960, 710);
    ctx.strokeStyle = PINK_DARK;
    ctx.lineWidth = 3;
    for (let y = 500; y < 1150; y += 80) {
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(1020, y);
      ctx.stroke();
    }
    for (let x = 140; x < 1040; x += 110) {
      ctx.beginPath();
      ctx.moveTo(x, 440);
      ctx.lineTo(x, 1150);
      ctx.stroke();
    }

    // Orange countertop slab
    ctx.fillStyle = ORANGE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillRect(this.counterL, this.counterTopY, this.counterR - this.counterL, 60);
    ctx.strokeRect(this.counterL, this.counterTopY, this.counterR - this.counterL, 60);

    // Counter body / lower cabinets
    ctx.fillStyle = TURQ;
    ctx.fillRect(this.counterL, this.counterTopY + 60, this.counterR - this.counterL, 250);
    ctx.strokeRect(this.counterL, this.counterTopY + 60, this.counterR - this.counterL, 250);
    ctx.strokeStyle = TURQ_DARK;
    ctx.lineWidth = 4;
    for (let i = 0; i < 5; i++) {
      const x = 70 + i * 196;
      ctx.strokeRect(x, this.counterTopY + 90, 170, 190);
      ctx.fillStyle = INK;
      ctx.fillRect(x + 68, this.counterTopY + 170, 34, 9);
    }

    // Floor
    ctx.fillStyle = FLOOR;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillRect(40, this.counterTopY + 310, 1000, this.floorY - (this.counterTopY + 310));
    ctx.strokeRect(40, this.counterTopY + 310, 1000, this.floorY - (this.counterTopY + 310));
    ctx.strokeStyle = '#c2ad8f';
    ctx.lineWidth = 3;
    for (let x = 120; x < 1040; x += 140) {
      ctx.beginPath();
      ctx.moveTo(x, this.counterTopY + 310);
      ctx.lineTo(x, this.floorY);
      ctx.stroke();
    }

    // Gas stove on the left
    ctx.fillStyle = '#2b2b2b';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillRect(this.stoveL, this.stoveTop, this.stoveR - this.stoveL, 30);
    ctx.strokeRect(this.stoveL, this.stoveTop, this.stoveR - this.stoveL, 30);
    ctx.fillStyle = '#3f3f3f';
    ctx.fillRect(this.stoveL, this.stoveTop + 30, this.stoveR - this.stoveL, 300);
    ctx.strokeRect(this.stoveL, this.stoveTop + 30, this.stoveR - this.stoveL, 300);
    // Oven door
    ctx.fillStyle = '#565656';
    ctx.fillRect(this.stoveL + 18, this.stoveTop + 120, this.stoveR - this.stoveL - 36, 180);
    ctx.strokeRect(this.stoveL + 18, this.stoveTop + 120, this.stoveR - this.stoveL - 36, 180);
    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(this.stoveL + 18, this.stoveTop + 150, this.stoveR - this.stoveL - 36, 22);
    // Burners
    for (let i = 0; i < 2; i++) {
      ctx.fillStyle = '#1c1c1c';
      ctx.beginPath();
      ctx.arc(this.stoveL + 70 + i * 120, this.stoveTop + 12, 34, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#5a5a5a';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    // Knobs
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = SILVER;
      ctx.beginPath();
      ctx.arc(this.stoveL + 30 + i * 44, this.stoveTop + 60, 13, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Sink beside the stove
    ctx.fillStyle = '#5f6c72';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillRect(this.sinkL, this.stoveTop + 10, this.sinkR - this.sinkL, 330);
    ctx.strokeRect(this.sinkL, this.stoveTop + 10, this.sinkR - this.sinkL, 330);
    ctx.fillStyle = '#8a979e';
    ctx.beginPath();
    ctx.ellipse((this.sinkL + this.sinkR) / 2, this.stoveTop + 80, 62, 34, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = SILVER;
    ctx.fillRect((this.sinkL + this.sinkR) / 2 - 6, this.stoveTop - 60, 12, 90);
    ctx.strokeRect((this.sinkL + this.sinkR) / 2 - 6, this.stoveTop - 60, 12, 90);
    ctx.beginPath();
    ctx.arc((this.sinkL + this.sinkR) / 2, this.stoveTop - 60, 16, Math.PI, TAU);
    ctx.stroke();

    // Ceiling strip so the splat has a surface to hit
    ctx.fillStyle = '#efe6d8';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillRect(40, 40, 1000, 90);
    ctx.strokeRect(40, 40, 1000, 90);
  }

  // ------------------------------------------------------------------
  // Props: ramp, books, plate, pan, spatula, syrup
  // ------------------------------------------------------------------

  private renderProps(ctx: CanvasRenderingContext2D, t: number) {
    // Maple syrup bottle
    ctx.save();
    ctx.translate(640, 1052);
    ctx.fillStyle = '#b5651d';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.fillRect(-24, -30, 48, 78);
    ctx.strokeRect(-24, -30, 48, 78);
    ctx.fillStyle = '#f4a261';
    ctx.fillRect(-16, -12, 32, 44);
    ctx.strokeRect(-16, -12, 32, 44);
    ctx.fillStyle = RED;
    ctx.fillRect(-14, -50, 28, 22);
    ctx.strokeRect(-14, -50, 28, 22);
    ctx.fillStyle = WHITE;
    ctx.fillRect(-16, 4, 32, 18);
    ctx.strokeRect(-16, 4, 32, 18);
    ctx.restore();

    // Metal spatula resting on the counter
    ctx.save();
    ctx.translate(720, 1128);
    ctx.rotate(-0.12);
    ctx.fillStyle = SILVER;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.fillRect(-18, -46, 36, 72);
    ctx.strokeRect(-18, -46, 36, 72);
    ctx.fillStyle = '#8c8c8c';
    ctx.fillRect(-9, -46, 18, 72);
    ctx.strokeRect(-9, -46, 18, 72);
    ctx.fillStyle = '#333';
    ctx.fillRect(-7, 22, 14, 62);
    ctx.strokeRect(-7, 22, 14, 62);
    ctx.restore();

    // The ramp: cutting board on three stacked cookbooks (assembled from 6s)
    if (t >= 6.0) {
      const appear = smooth((t - 6.0) / 0.5);
      ctx.save();
      ctx.globalAlpha = appear;

      // Stacked cookbooks
      const books = [
        { y: this.counterTopY - 150, color: '#5a67d8', label: 'RECIPES' },
        { y: this.counterTopY - 210, color: '#38a169', label: 'BAKING' },
        { y: this.counterTopY - 262, color: '#c53030', label: 'FLIP!' },
      ];
      for (const b of books) {
        ctx.fillStyle = b.color;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 4;
        ctx.fillRect(this.bookL, b.y, this.bookR - this.bookL, 52);
        ctx.strokeRect(this.bookL, b.y, this.bookR - this.bookL, 52);
        ctx.fillStyle = WHITE;
        ctx.fillRect(this.bookL + 8, b.y + 12, 12, 28);
        ctx.strokeRect(this.bookL + 8, b.y + 12, 12, 28);
      }

      // Cutting board ramp
      ctx.save();
      ctx.translate((this.rampLowX + this.rampHighX) / 2, (this.rampLowY + this.rampHighY) / 2);
      ctx.rotate(Math.atan2(this.rampHighY - this.rampLowY, this.rampHighX - this.rampLowX));
      const len = Math.hypot(this.rampHighX - this.rampLowX, this.rampHighY - this.rampLowY);
      ctx.fillStyle = WOOD;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.fillRect(-len / 2, -16, len, 32);
      ctx.strokeRect(-len / 2, -16, len, 32);
      ctx.strokeStyle = WOOD_DARK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-len / 2 + 18, 0);
      ctx.lineTo(len / 2 - 18, 0);
      ctx.stroke();
      ctx.fillStyle = WOOD_DARK;
      ctx.beginPath();
      ctx.arc(len / 2 - 8, 0, 12, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    // White plate (jolts when he bumps the counter)
    let plateJoltX = 0;
    let plateJoltY = 0;
    let plateTilt = 0;
    if (t >= 23.4 && t < 24.8) {
      const u = (t - 23.4) / 1.4;
      plateJoltX = Math.sin(u * Math.PI * 4) * 10 * (1 - u);
      plateJoltY = -Math.sin(u * Math.PI) * 8;
      plateTilt = Math.sin(u * Math.PI * 3) * 0.12 * (1 - u);
    }
    ctx.save();
    ctx.translate(this.plateX + plateJoltX, this.plateY + plateJoltY);
    ctx.rotate(plateTilt);
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, this.plateR, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#c9c9c9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.plateR - 16, 0, TAU);
    ctx.stroke();
    ctx.restore();

    // Frying pan: rests on the counter at home, moves under the ramp
    const pan = this.panPosition(t);
    this.drawPan(ctx, pan.x, pan.y, pan.rot);
  }

  private panPosition(t: number): { x: number; y: number; rot: number } {
    // 0-10.4: resting at home on the counter
    if (t < 10.4) return { x: this.panHomeX, y: this.panHomeY, rot: 0 };
    // 10.4-13: held below the lower end of the ramp
    if (t < 13.0) return { x: this.rampLowX + 6, y: this.rampLowY + 40, rot: 0 };
    // 13-15.8: still under the ramp for the final flick
    if (t < 15.8) return { x: this.rampLowX + 6, y: this.rampLowY + 40, rot: 0 };
    // 15.8-19: back to home while he watches the pancake
    if (t < 19.0) {
      const u = smooth((t - 15.8) / 1.0);
      return {
        x: lerp(this.rampLowX + 6, this.panHomeX, u),
        y: lerp(this.rampLowY + 40, this.panHomeY, u),
        rot: 0,
      };
    }
    return { x: this.panHomeX, y: this.panHomeY, rot: 0 };
  }

  private drawPan(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = '#1f1f1f';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.panR, this.panR * 0.42, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.panR - 14, this.panR * 0.32, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.stroke();
    // Handle
    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(this.panR - 8, -20, 120, 40);
    ctx.strokeRect(this.panR - 8, -20, 120, 40);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(this.panR + 12, -12, 90, 24);
    ctx.strokeRect(this.panR + 12, -12, 90, 24);
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Character
  // ------------------------------------------------------------------

  private poseAt(t: number): Pose {
    const pose: Pose = {
      lean: 0,
      leftArm: 0.15,
      leftElbow: 0.1,
      rightArm: 0.4,
      rightElbow: 0.2,
      mouth: 'flat',
      brow: 'normal',
      eye: 'open',
      headTilt: 0,
    };

    // Shot 1 hook: determined close-up
    if (t < 2.0) {
      pose.brow = 'angry';
      pose.eye = 'squint';
      pose.mouth = 'grit';
      pose.rightArm = 0.55; // gripping the pan
      pose.rightElbow = 0.3;
    } else if (t < 6.0) {
      // Shot 2: confident flick, then disbelief at the ceiling
      if (t < 2.8) {
        pose.rightArm = 0.2;
        pose.rightElbow = 0.1;
        pose.mouth = 'grin';
        pose.brow = 'raised';
      } else if (t < 3.6) {
        const u = (t - 2.8) / 0.8;
        pose.rightArm = lerp(0.2, -1.3, smooth(u));
        pose.rightElbow = 0.1;
        pose.mouth = 'o';
        pose.brow = 'raised';
        pose.eye = 'wide';
      } else {
        pose.headTilt = 0;
        pose.brow = 'sad';
        pose.mouth = 'frown';
        pose.rightArm = 0.6;
        pose.rightElbow = 0.25;
      }
    } else if (t < 10.0) {
      // Shot 3: idea, measuring, overconfident grin
      if (t < 7.4) {
        pose.brow = 'raised';
        pose.mouth = 'o';
        pose.rightArm = 0.9;
        pose.rightElbow = 0.5;
      } else if (t < 9.2) {
        const u = smooth((t - 7.4) / 1.2);
        pose.rightArm = lerp(0.9, 1.35, u);
        pose.rightElbow = lerp(0.5, 0.15, u);
        pose.leftArm = lerp(0.2, -0.4, u);
        pose.leftElbow = 0.2;
        pose.mouth = 'flat';
        pose.brow = 'raised';
      } else {
        pose.mouth = 'grin';
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.rightArm = 1.35;
        pose.rightElbow = 0.15;
        pose.leftArm = -0.4;
        pose.leftElbow = 0.2;
      }
    } else if (t < 13.0) {
      // Shot 4: flick, catch back in the pan, glare at the camera
      if (t < 10.6) {
        pose.rightArm = 0.9;
        pose.rightElbow = 0.3;
        pose.mouth = 'flat';
      } else if (t < 11.4) {
        const u = smooth((t - 10.6) / 0.8);
        pose.rightArm = lerp(0.9, 1.5, u);
        pose.rightElbow = 0.2;
        pose.mouth = 'o';
        pose.brow = 'raised';
      } else if (t < 12.1) {
        pose.rightArm = 1.5;
        pose.rightElbow = 0.2;
        pose.mouth = 'o';
        pose.brow = 'raised';
        pose.eye = 'wide';
      } else {
        pose.mouth = 'frown';
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.rightArm = 1.2;
        pose.rightElbow = 0.3;
        pose.headTilt = 0;
      }
    } else if (t < 16.0) {
      // Shot 5A: knuckles, breath, final flick
      if (t < 13.5) {
        pose.rightArm = 0.8;
        pose.leftArm = -0.6;
        pose.rightElbow = 0.2;
        pose.leftElbow = 0.2;
        pose.mouth = 'flat';
        pose.brow = 'angry';
      } else if (t < 14.2) {
        pose.rightArm = 0.2;
        pose.leftArm = 0.2;
        pose.mouth = 'o';
        pose.brow = 'raised';
        pose.eye = 'wide';
      } else if (t < 15.0) {
        const u = smooth((t - 14.2) / 0.8);
        pose.rightArm = lerp(0.2, 1.5, u);
        pose.rightElbow = 0.15;
        pose.mouth = 'o';
        pose.brow = 'raised';
      } else {
        pose.rightArm = 1.3;
        pose.rightElbow = 0.2;
        pose.mouth = 'o';
        pose.brow = 'raised';
        pose.eye = 'wide';
      }
    } else if (t < 19.0) {
      // Shot 5B: lean forward and hold breath
      pose.lean = 0.28;
      pose.rightArm = 1.1;
      pose.rightElbow = 0.3;
      pose.leftArm = 0.9;
      pose.leftElbow = 0.4;
      pose.mouth = 'flat';
      pose.brow = 'raised';
      pose.eye = 'wide';
      if (t > 18.2) {
        pose.mouth = 'grin';
      }
    } else if (t < 23.0) {
      // Shot 6: freeze, jump, celebrate, point
      if (t < 19.6) {
        pose.mouth = 'o';
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.lean = 0.28;
        pose.rightArm = 1.1;
      } else if (t < 21.2) {
        const u = smooth((t - 19.6) / 1.6);
        pose.rightArm = lerp(1.1, -2.5, u);
        pose.leftArm = lerp(0.2, -2.5, u);
        pose.mouth = 'grin';
        pose.brow = 'raised';
        pose.lean = lerp(0.28, 0, u);
        pose.headTilt = Math.sin(t * 14) * 0.08;
      } else {
        pose.rightArm = 1.2;
        pose.leftArm = -0.5;
        pose.rightElbow = 0.1;
        pose.mouth = 'grin';
        pose.brow = 'raised';
        pose.eye = 'open';
      }
    } else if (t < 29.0) {
      // Shot 7: bump, face pancake, fury
      if (t < 24.4) {
        pose.rightArm = -1.6;
        pose.leftArm = -1.6;
        pose.mouth = 'grin';
        pose.brow = 'raised';
        pose.lean = 0.15;
      } else if (t < 27.2) {
        pose.rightArm = 0.2;
        pose.leftArm = 0.2;
        pose.mouth = 'flat';
        pose.brow = 'normal';
      } else {
        pose.rightArm = 0.7;
        pose.leftArm = 0.7;
        pose.rightElbow = 0.9;
        pose.leftElbow = 0.9;
        pose.mouth = 'grit';
        pose.brow = 'angry';
        pose.eye = 'squint';
      }
    } else {
      // Shot 8: defeated pancake hat
      pose.mouth = 'frown';
      pose.brow = 'angry';
      pose.eye = 'squint';
      pose.rightArm = 0.1;
      pose.leftArm = 0.1;
    }

    return pose;
  }

  private renderCharacter(ctx: CanvasRenderingContext2D, t: number) {
    const pose = this.poseAt(t);

    // Jump offset for the celebration
    let jump = 0;
    if (t >= 19.6 && t < 21.4) {
      const u = (t - 19.6) / 1.8;
      jump = -Math.sin(u * Math.PI) * 170;
    }
    // Small hop on the final launch
    if (t >= 14.6 && t < 15.4) {
      const u = (t - 14.6) / 0.8;
      jump = -Math.sin(u * Math.PI) * 24;
    }

    this.drawStickman(ctx, this.characterX, this.hipY + jump, pose, t);
  }

  private drawStickman(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    pose: Pose,
    t: number
  ) {
    const lean = pose.lean;
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(lean) * 170;

    ctx.save();
    ctx.lineCap = 'round';

    // Legs
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    const footSpread = 44;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(hipX - footSpread, this.floorY);
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(hipX + footSpread, this.floorY);
    ctx.stroke();

    // Body: yellow shirt
    ctx.fillStyle = YELLOW;
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

    // Arms
    const arm = (side: -1 | 1, shoulderAngle: number, elbowAngle: number) => {
      const sx = bodyTopX + side * 34;
      const sy = shoulderY + 12;
      const upperLen = 110;
      const foreLen = 104;
      const ex = sx + Math.sin(shoulderAngle) * side * upperLen;
      const ey = sy + Math.cos(shoulderAngle) * upperLen;
      const hx = ex + Math.sin(shoulderAngle + elbowAngle) * side * foreLen;
      const hy = ey + Math.cos(shoulderAngle + elbowAngle) * foreLen;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      return { hx, hy };
    };
    arm(-1, pose.leftArm, pose.leftElbow);
    arm(1, pose.rightArm, pose.rightElbow);

    // Head
    const headX = bodyTopX + Math.sin(pose.headTilt) * 10;
    const headY = shoulderY - 78;
    this.drawHead(ctx, headX, headY, pose);

    ctx.restore();
  }

  private drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, pose: Pose) {
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
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(cx, cy - 6, r + 4, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#b3222e';
    ctx.fillRect(cx - r - 4, cy - 22, (r + 4) * 2, 16);
    ctx.strokeRect(cx - r - 4, cy - 22, (r + 4) * 2, 16);
    // Beanie pompom
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(cx, cy - r - 14, 16, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Eyes
    const eyeY = cy + 6;
    const eyeDX = 26;
    const eyeH = pose.eye === 'wide' ? 24 : pose.eye === 'squint' ? 8 : 18;
    ctx.fillStyle = INK;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + side * eyeDX, eyeY, 11, eyeH / 2, 0, 0, TAU);
      ctx.fill();
    }

    // Eyebrows
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    const browY = cy - 16;
    const browOff = pose.brow === 'angry' ? 1 : pose.brow === 'sad' ? -1 : 0;
    ctx.beginPath();
    if (pose.brow === 'angry') {
      ctx.moveTo(cx - 42, browY - 10);
      ctx.lineTo(cx - 12, browY + 8);
      ctx.moveTo(cx + 42, browY - 10);
      ctx.lineTo(cx + 12, browY + 8);
    } else if (pose.brow === 'raised') {
      ctx.moveTo(cx - 42, browY - 16);
      ctx.lineTo(cx - 12, browY - 16);
      ctx.moveTo(cx + 42, browY - 16);
      ctx.lineTo(cx + 12, browY - 16);
    } else {
      ctx.moveTo(cx - 42, browY - 4 + browOff * 6);
      ctx.lineTo(cx - 12, browY - 8 + browOff * 6);
      ctx.moveTo(cx + 42, browY - 4 + browOff * 6);
      ctx.lineTo(cx + 12, browY - 8 + browOff * 6);
    }
    ctx.stroke();

    // Mouth
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    const my = cy + 38;
    if (pose.mouth === 'grin') {
      ctx.arc(cx, my - 10, 26, 0.15 * Math.PI, 0.85 * Math.PI);
    } else if (pose.mouth === 'smile') {
      ctx.arc(cx, my - 12, 20, 0.2 * Math.PI, 0.8 * Math.PI);
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
  // Pancake
  // ------------------------------------------------------------------

  private pancakeState(t: number): PancakeState {
    const pan = this.panPosition(t);

    // 0-2 hook: in the pan
    if (t < 2.8) return { x: pan.x, y: pan.y - 6, rot: 0, visible: true, shape: 'flat' };

    // 2.8-3.1 launched up
    if (t < 3.1) {
      const u = smooth((t - 2.8) / 0.3);
      return { x: lerp(pan.x, 540, u), y: lerp(pan.y, 240, u), rot: u * 6, visible: true, shape: 'edge' };
    }
    // 3.1-3.6 sticks to the ceiling
    if (t < 3.6) {
      const u = smooth((t - 3.1) / 0.5);
      return { x: 540, y: lerp(240, 150, u), rot: 0, visible: true, shape: u < 1 ? 'edge' : 'flat' };
    }
    // 3.6-6.0 stuck to the ceiling
    if (t < 6.0) return { x: 540, y: 150, rot: 0, visible: true, shape: 'flat' };

    // 6.0 hard cut: back in the pan
    if (t < 10.5) return { x: pan.x, y: pan.y - 6, rot: 0, visible: true, shape: 'flat' };

    // 10.5-11.3 flicked onto the ramp
    if (t < 11.3) {
      const u = smooth((t - 10.5) / 0.8);
      return {
        x: lerp(pan.x, this.rampLowX + 30, u),
        y: lerp(pan.y, this.rampLowY - 8, u) - Math.sin(u * Math.PI) * 40,
        rot: u * 4,
        visible: true,
        shape: 'edge',
      };
    }
    // 11.3-12.3 slides up, tips and slides back into the pan
    if (t < 12.3) {
      const u = (t - 11.3) / 1.0;
      const up = u < 0.5 ? smooth(u / 0.5) : 1 - smooth((u - 0.5) / 0.5);
      const x = lerp(this.rampLowX + 30, (this.rampLowX + this.rampHighX) / 2, up);
      const y = lerp(this.rampLowY - 8, (this.rampLowY + this.rampHighY) / 2, up);
      return { x, y, rot: up * 0.5, visible: true, shape: 'flat' };
    }
    // 12.3-13: back in the pan
    if (t < 13.0) return { x: pan.x, y: pan.y - 6, rot: 0, visible: true, shape: 'flat' };

    // 13-14.5 in the pan while he prepares
    if (t < 14.5) return { x: pan.x, y: pan.y - 6, rot: 0, visible: true, shape: 'flat' };

    // 14.5-15.5 slides up the ramp
    if (t < 15.5) {
      const u = smooth((t - 14.5) / 1.0);
      return {
        x: lerp(this.rampLowX + 30, this.rampHighX, u),
        y: lerp(this.rampLowY - 8, this.rampHighY, u),
        rot: u * 2,
        visible: true,
        shape: 'flat',
      };
    }
    // 15.5-18.2 arc into the plate
    if (t < 18.2) {
      const u = (t - 15.5) / 2.7;
      const arc = -Math.sin(u * Math.PI) * 330;
      return {
        x: lerp(this.rampHighX, this.plateX, u),
        y: lerp(this.rampHighY, this.plateY, u) + arc,
        rot: u * 12,
        visible: true,
        shape: 'edge',
      };
    }
    // 18.2-18.6 settles onto the plate
    if (t < 18.6) {
      const u = smooth((t - 18.2) / 0.4);
      return { x: this.plateX, y: this.plateY - 8, rot: lerp(12, 0, u), visible: true, shape: 'flat' };
    }
    // 18.6-24.2 resting on the plate
    if (t < 24.2) return { x: this.plateX, y: this.plateY - 8, rot: 0, visible: true, shape: 'flat' };

    // 24.2-24.6 slides off the jolted plate
    if (t < 24.6) {
      const u = smooth((t - 24.2) / 0.4);
      return { x: this.plateX + u * 30, y: this.plateY - 8 + u * 60, rot: u * 3, visible: true, shape: 'edge' };
    }
    // 24.6-27.3 stuck to his face, then slides down
    if (t < 27.3) {
      const headX = this.characterX;
      const headY = this.shoulderY - 78;
      const u = t < 25.2 ? 0 : smooth((t - 25.2) / 2.1);
      return {
        x: headX + u * 20,
        y: headY + 10 + u * 60,
        rot: u * 1.2,
        visible: true,
        shape: 'flat',
      };
    }
    // 27.3-28.9 hidden (drops away)
    if (t < 29.0) return { x: this.characterX, y: this.shoulderY - 78, rot: 0, visible: false, shape: 'flat' };

    // 29-30 pancake hat
    return { x: this.characterX, y: this.shoulderY - 78 - 92, rot: 0, visible: true, shape: 'flat' };
  }

  private renderPancake(ctx: CanvasRenderingContext2D, t: number) {
    const p = this.pancakeState(t);
    if (!p.visible) return;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);

    const ry = p.shape === 'edge' ? this.pancakeR * 0.32 : this.pancakeR * 0.62;
    ctx.fillStyle = GOLD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.pancakeR, ry, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Syrup sheen
    ctx.fillStyle = GOLD_DARK;
    ctx.beginPath();
    ctx.ellipse(-12, -6, this.pancakeR * 0.55, ry * 0.5, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Effects: lightbulb, sparkle, confetti, impact rings
  // ------------------------------------------------------------------

  private renderEffects(ctx: CanvasRenderingContext2D, t: number) {
    const headX = this.characterX;
    const headY = this.shoulderY - 78;

    // Lightbulb (Shot 3)
    if (t >= 6.6 && t < 8.4) {
      const pop = Math.min(1, (t - 6.6) / 0.25);
      const fade = Math.min(1, (8.4 - t) / 0.3);
      const a = clamp(Math.min(pop, fade), 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(headX, headY - 150);
      ctx.fillStyle = '#ffe066';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b0b0b0';
      ctx.fillRect(-16, 30, 32, 22);
      ctx.strokeRect(-16, 30, 32, 22);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      for (let i = 0; i < 5; i++) {
        const ang = -Math.PI / 2 + (i - 2) * 0.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 52, Math.sin(ang) * 52);
        ctx.lineTo(Math.cos(ang) * 74, Math.sin(ang) * 74);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Ceiling splat impact ring
    if (t >= 3.4 && t < 4.4) {
      const u = (t - 3.4) / 1.0;
      ctx.save();
      ctx.globalAlpha = (1 - u) * 0.8;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(540, 150, 40 + u * 90, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // Plate sparkle (Shot 5B)
    if (t >= 18.2 && t < 19.0) {
      const u = (t - 18.2) / 0.8;
      const a = 1 - u;
      ctx.save();
      ctx.globalAlpha = clamp(a, 0, 1);
      ctx.strokeStyle = '#fff3b0';
      ctx.lineWidth = 6;
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * TAU + u * 1.2;
        const len = 30 + u * 60;
        ctx.beginPath();
        ctx.moveTo(this.plateX + Math.cos(ang) * 40, this.plateY + Math.sin(ang) * 40);
        ctx.lineTo(this.plateX + Math.cos(ang) * (40 + len), this.plateY + Math.sin(ang) * (40 + len));
        ctx.stroke();
      }
      ctx.restore();
    }

    // Confetti burst (Shot 6)
    if (t >= 20.4 && t < 23.0) {
      const u = (t - 20.4) / 2.6;
      ctx.save();
      const colors = [RED, YELLOW, TURQ, PINK, '#7c4dff', '#43aa8b'];
      for (let i = 0; i < 46; i++) {
        const seed = i * 1.7;
        const ang = (i / 46) * TAU;
        const speed = 260 + (i % 7) * 60;
        const px = headX + Math.cos(ang) * speed * u;
        const py = headY - 40 + Math.sin(ang) * speed * u + u * u * 520;
        const size = 14 + (i % 4) * 6;
        ctx.globalAlpha = clamp(1 - u * 0.85, 0, 1);
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(seed + u * 8);
        ctx.fillRect(-size / 2, -size / 2, size, size * 0.6);
        ctx.strokeRect(-size / 2, -size / 2, size, size * 0.6);
        ctx.restore();
      }
      ctx.restore();
    }

    // Counter bump shake ring (Shot 7 beat 1)
    if (t >= 23.3 && t < 24.0) {
      const u = (t - 23.3) / 0.7;
      ctx.save();
      ctx.globalAlpha = (1 - u) * 0.7;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(this.characterX + 100, this.counterTopY + 30, 40 + u * 90, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // Syrup drip on the shirt (Shot 7)
    if (t >= 26.6 && t < 29.0) {
      const u = smooth((t - 26.6) / 1.4);
      ctx.save();
      ctx.fillStyle = '#b5651d';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(this.characterX + 18, this.hipY - 130 + u * 60, 10, 16 + u * 10, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------
  // Captions and guides
  // ------------------------------------------------------------------

  private renderCaption(ctx: CanvasRenderingContext2D, t: number) {
    const line = CAPTIONS.find((c) => t >= c.from && t < c.to);
    if (!line) return;

    const pop = Math.min(1, (t - line.from) / 0.18);
    const fade = Math.min(1, (line.to - t) / 0.25);
    const alpha = clamp(Math.min(pop, fade), 0, 1);
    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    const size = 84;
    ctx.font = `900 ${size}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
    const y = 470 + (1 - pop) * 30;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 20;
    ctx.strokeText(line.text, this.width / 2, y);
    ctx.fillStyle = WHITE;
    ctx.fillText(line.text, this.width / 2, y);

    ctx.restore();
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
