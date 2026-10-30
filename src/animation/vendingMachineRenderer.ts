import type { StudioConfig } from '../types';

/**
 * THE VENDING MACHINE REVENGE - 30s vertical (1080x1920) Modern Pop stickman comedy.
 *
 * Shot map:
 *  0.0-2.0   Shot 1  hook: face against the glass, yellow bag dangling
 *  2.0-6.0   Shot 2  attempt 1: shake the machine
 *  6.0-10.0  Shot 3  attempt 2: second coin, orange bag joins the yellow one
 * 10.0-14.0  Shot 4  attempt 3: the broom jams in the flap
 * 14.0-19.0  Shot 5  flying kick into the glass
 * 19.0-23.0  Shot 6  both bags drop, confetti celebration
 * 23.0-29.0  Shot 7  the bag is 99% air, one tiny chip
 * 29.0-30.0  Shot 8  defeated chip stare
 */

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

const INK = '#111111';
const WHITE = '#ffffff';
const MINT = '#b8f2e6';
const MINT_DARK = '#8fddc9';
const PURPLE = '#6f5aa8';
const PURPLE_DARK = '#584588';
const BLUE = '#3a86ff';
const BLUE_DARK = '#2463c4';
const GLASS = '#dff6ff';
const GLASS_LINE = '#a9d8ec';
const YELLOW_BAG = '#ffd166';
const ORANGE_BAG = '#ff9f1c';
const RED = '#e63946';
const YELLOW_SHIRT = '#ffd166';
const GOLD = '#f6bd60';
const SILVER = '#dcdcdc';

const MACHINE_L = 260;
const MACHINE_R = 720;
const MACHINE_TOP = 220;
const MACHINE_BOTTOM = 1550;
const GLASS_L = 300;
const GLASS_R = 660;
const GLASS_TOP = 320;
const GLASS_BOTTOM = 1140;
const PANEL_L = 660;
const PANEL_R = 720;
const FLAP_L = 360;
const FLAP_R = 620;
const FLAP_TOP = 1340;
const FLAP_BOTTOM = 1450;

const FLOOR_Y = 1560;
const HIP_Y = 1260;
const HEAD_R = 70;

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
  { text: 'IT STOLE HIS COIN.', from: 0.15, to: 1.9 },
  { text: 'ATTEMPT 1: SHAKE IT.', from: 2.2, to: 5.8 },
  { text: 'SECOND COIN…', from: 6.2, to: 8.8 },
  { text: 'NOW IT STOLE TWO.', from: 9.0, to: 9.8 },
  { text: 'TIME FOR A BROOM.', from: 10.2, to: 13.8 },
  { text: "NOW IT'S PERSONAL.", from: 14.2, to: 18.9 },
  { text: 'BOTH BAGS!!!', from: 19.2, to: 22.9 },
  { text: '99% AIR 💀', from: 23.2, to: 28.9 },
];

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

type MouthShape = 'flat' | 'smile' | 'grin' | 'o' | 'frown' | 'grit';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad';
type EyeShape = 'open' | 'wide' | 'squint';

interface Pose {
  lean: number;
  leftArm: number;
  leftElbow: number;
  rightArm: number;
  rightElbow: number;
  mouth: MouthShape;
  brow: BrowShape;
  eye: EyeShape;
  headTilt: number;
  kick: number;
  sitting: boolean;
  kneel: boolean;
}

interface CharacterState {
  x: number;
  hipY: number;
  jump: number;
  pose: Pose;
}

interface BagState {
  x: number;
  y: number;
  rot: number;
  visible: boolean;
  held: boolean;
  open: boolean;
}

export class VendingMachineRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  private readonly floorY = FLOOR_Y;
  private readonly hipY = HIP_Y;
  private readonly headR = HEAD_R;

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 660, y: 930, zoom: 1.75 },
    { t: 0.9, x: 660, y: 930, zoom: 2.1 },
    { t: 2.0, x: 540, y: 980, zoom: 1.0 },
    { t: 2.5, x: 540, y: 980, zoom: 1.0 },
    { t: 3.2, x: 540, y: 720, zoom: 1.3 },
    { t: 4.0, x: 540, y: 980, zoom: 1.0 },
    { t: 6.0, x: 540, y: 1000, zoom: 1.0 },
    { t: 7.6, x: 650, y: 940, zoom: 1.15 },
    { t: 8.0, x: 500, y: 700, zoom: 1.35 },
    { t: 8.7, x: 650, y: 980, zoom: 1.05 },
    { t: 10.0, x: 540, y: 1020, zoom: 1.0 },
    { t: 12.6, x: 600, y: 1100, zoom: 1.15 },
    { t: 14.0, x: 540, y: 1000, zoom: 1.0 },
    { t: 15.2, x: 300, y: 1000, zoom: 1.05 },
    { t: 17.2, x: 560, y: 980, zoom: 1.08 },
    { t: 18.2, x: 720, y: 980, zoom: 1.2 },
    { t: 18.5, x: 760, y: 980, zoom: 1.45 },
    { t: 19.2, x: 540, y: 1000, zoom: 1.0 },
    { t: 19.7, x: 600, y: 1000, zoom: 1.08 },
    { t: 23.0, x: 540, y: 1000, zoom: 1.0 },
    { t: 23.6, x: 700, y: 1230, zoom: 1.22 },
    { t: 26.2, x: 790, y: 1220, zoom: 1.35 },
    { t: 27.4, x: 780, y: 1060, zoom: 1.6 },
    { t: 29.0, x: 780, y: 1020, zoom: 1.55 },
    { t: 30.0, x: 780, y: 1010, zoom: 1.85 },
  ];

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = Math.min(time, 30);

    ctx.save();
    ctx.fillStyle = MINT;
    ctx.fillRect(0, 0, this.width, this.height);

    this.applyCamera(ctx, t);

    this.renderRoom(ctx, t);
    this.renderMachine(ctx, t);
    this.renderCharacter(ctx, t);
    this.renderBags(ctx, t);
    this.renderBroom(ctx, t);
    this.renderCoin(ctx, t);
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
  // Room: mint wall, purple floor
  // ------------------------------------------------------------------

  private renderRoom(ctx: CanvasRenderingContext2D, t: number) {
    // Wall
    ctx.fillStyle = MINT;
    ctx.fillRect(0, 0, WIDTH, this.floorY);
    // Soft wall panel seams
    ctx.strokeStyle = MINT_DARK;
    ctx.lineWidth = 3;
    for (let x = 90; x < WIDTH; x += 180) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.floorY - 40);
      ctx.stroke();
    }

    // Baseboard
    ctx.fillStyle = '#f3f7f5';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillRect(0, this.floorY - 40, WIDTH, 40);
    ctx.strokeRect(0, this.floorY - 40, WIDTH, 40);

    // Purple floor
    ctx.fillStyle = PURPLE;
    ctx.fillRect(0, this.floorY, WIDTH, HEIGHT - this.floorY);
    ctx.strokeStyle = PURPLE_DARK;
    ctx.lineWidth = 4;
    for (let y = this.floorY + 70; y < HEIGHT; y += 90) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }
    for (let x = -100; x < WIDTH + 200; x += 150) {
      ctx.beginPath();
      ctx.moveTo(x, this.floorY);
      ctx.lineTo(x - 120, HEIGHT);
      ctx.stroke();
    }

    // Ceiling light strip
    ctx.fillStyle = '#fdfdfd';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.fillRect(390, 34, 300, 40);
    ctx.strokeRect(390, 34, 300, 40);
  }

  // ------------------------------------------------------------------
  // Vending machine
  // ------------------------------------------------------------------

  private machineSway(t: number): number {
    let sway = 0;
    if (t >= 2.5 && t < 4.4) {
      const u = (t - 2.5) / 1.9;
      sway += Math.sin(t * 38) * 12 * Math.sin(Math.min(1, u) * Math.PI);
    }
    if (t >= 18.35 && t < 19.1) {
      const u = (t - 18.35) / 0.75;
      sway += Math.sin(t * 62) * 15 * (1 - u);
    }
    return sway;
  }

  private renderMachine(ctx: CanvasRenderingContext2D, t: number) {
    const sway = this.machineSway(t);
    ctx.save();
    ctx.translate(sway, 0);

    // Feet
    ctx.fillStyle = BLUE_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillRect(MACHINE_L + 24, MACHINE_BOTTOM - 30, 70, 32);
    ctx.strokeRect(MACHINE_L + 24, MACHINE_BOTTOM - 30, 70, 32);
    ctx.fillRect(MACHINE_R - 94, MACHINE_BOTTOM - 30, 70, 32);
    ctx.strokeRect(MACHINE_R - 94, MACHINE_BOTTOM - 30, 70, 32);

    // Machine body
    ctx.fillStyle = BLUE;
    ctx.fillRect(MACHINE_L, MACHINE_TOP, MACHINE_R - MACHINE_L, MACHINE_BOTTOM - MACHINE_TOP);
    ctx.strokeRect(MACHINE_L, MACHINE_TOP, MACHINE_R - MACHINE_L, MACHINE_BOTTOM - MACHINE_TOP);

    // Top cap
    ctx.fillStyle = BLUE_DARK;
    ctx.fillRect(MACHINE_L - 10, MACHINE_TOP - 26, MACHINE_R - MACHINE_L + 20, 34);
    ctx.strokeRect(MACHINE_L - 10, MACHINE_TOP - 26, MACHINE_R - MACHINE_L + 20, 34);

    // Glass frame
    ctx.fillStyle = GLASS;
    ctx.fillRect(GLASS_L - 8, GLASS_TOP - 8, GLASS_R - GLASS_L + 16, GLASS_BOTTOM - GLASS_TOP + 16);
    ctx.strokeRect(GLASS_L - 8, GLASS_TOP - 8, GLASS_R - GLASS_L + 16, GLASS_BOTTOM - GLASS_TOP + 16);

    // Glass pane
    ctx.fillStyle = GLASS;
    ctx.fillRect(GLASS_L, GLASS_TOP, GLASS_R - GLASS_L, GLASS_BOTTOM - GLASS_TOP);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(GLASS_L, GLASS_TOP, GLASS_R - GLASS_L, GLASS_BOTTOM - GLASS_TOP);

    // Glass highlight
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.moveTo(GLASS_L + 24, GLASS_TOP + 20);
    ctx.lineTo(GLASS_L + 86, GLASS_TOP + 20);
    ctx.lineTo(GLASS_L + 24, GLASS_TOP + 300);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Three snack rows
    const rows = [420, 620, 820];
    const snackColors = [RED, '#43aa8b', YELLOW_BAG, '#7c4dff', '#ff8fab', '#4cc9f0'];
    for (let r = 0; r < rows.length; r++) {
      const rowY = rows[r];
      // Shelf
      ctx.fillStyle = '#f1f7fa';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.fillRect(GLASS_L + 10, rowY + 86, GLASS_R - GLASS_L - 20, 12);
      ctx.strokeRect(GLASS_L + 10, rowY + 86, GLASS_R - GLASS_L - 20, 12);

      // Spiral coils
      ctx.strokeStyle = '#7f8c8d';
      ctx.lineWidth = 4;
      for (let i = 0; i < 5; i++) {
        const cx = GLASS_L + 64 + i * 62;
        for (let k = 0; k < 4; k++) {
          ctx.beginPath();
          ctx.arc(cx, rowY + 34 + k * 14, 22, 0.2, Math.PI * 1.2);
          ctx.stroke();
        }
      }

      // Plain colored snack shapes (no labels or logos)
      for (let i = 0; i < 6; i++) {
        const sx = GLASS_L + 34 + i * 54;
        ctx.fillStyle = snackColors[(i + r) % snackColors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        if ((i + r) % 2 === 0) {
          ctx.beginPath();
          ctx.roundRect(sx, rowY + 6, 32, 44, 8);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(sx + 16, rowY + 30, 17, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    // Right control panel
    ctx.fillStyle = BLUE_DARK;
    ctx.fillRect(PANEL_L, GLASS_TOP - 8, PANEL_R - PANEL_L, GLASS_BOTTOM - GLASS_TOP + 16);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(PANEL_L, GLASS_TOP - 8, PANEL_R - PANEL_L, GLASS_BOTTOM - GLASS_TOP + 16);

    // Coin slot
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(PANEL_L + 14, 560, 32, 54);
    ctx.strokeRect(PANEL_L + 14, 560, 32, 54);
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(PANEL_L + 20, 568, 20, 8);

    // Keypad
    for (let ry = 0; ry < 3; ry++) {
      for (let rx = 0; rx < 2; rx++) {
        ctx.fillStyle = SILVER;
        ctx.beginPath();
        ctx.roundRect(PANEL_L + 12 + rx * 22, 690 + ry * 30, 20, 22, 4);
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // Small display (no letters)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(PANEL_L + 10, 400, 40, 60);
    ctx.strokeRect(PANEL_L + 10, 400, 40, 60);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(PANEL_L + 16, 412, 28, 6);
    ctx.fillRect(PANEL_L + 16, 426, 20, 6);
    ctx.fillRect(PANEL_L + 16, 440, 24, 6);

    // Bottom flap
    ctx.fillStyle = '#111827';
    ctx.fillRect(FLAP_L, FLAP_TOP, FLAP_R - FLAP_L, FLAP_BOTTOM - FLAP_TOP);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.strokeRect(FLAP_L, FLAP_TOP, FLAP_R - FLAP_L, FLAP_BOTTOM - FLAP_TOP);
    // Flap lip
    ctx.fillStyle = '#374151';
    ctx.fillRect(FLAP_L + 12, FLAP_BOTTOM - 22, FLAP_R - FLAP_L - 24, 10);

    // Bottom trim
    ctx.fillStyle = BLUE_DARK;
    ctx.fillRect(MACHINE_L, FLAP_BOTTOM + 30, MACHINE_R - MACHINE_L, MACHINE_BOTTOM - (FLAP_BOTTOM + 30));
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(MACHINE_L, FLAP_BOTTOM + 30, MACHINE_R - MACHINE_L, MACHINE_BOTTOM - (FLAP_BOTTOM + 30));

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Character
  // ------------------------------------------------------------------

  private characterState(t: number): CharacterState {
    let x = 770;
    let hipY = this.hipY;
    let jump = 0;
    let kick = 0;
    let sitting = false;

    const pose: Pose = {
      lean: 0,
      leftArm: 0.15,
      leftElbow: 0.1,
      rightArm: 0.35,
      rightElbow: 0.2,
      mouth: 'flat',
      brow: 'normal',
      eye: 'open',
      headTilt: 0,
      kick: 0,
      sitting: false,
      kneel: false,
    };

    if (t < 2.0) {
      // Hook: pressed to the glass, furious
      pose.brow = 'angry';
      pose.eye = 'squint';
      pose.mouth = 'grit';
      pose.rightArm = 0.85;
      pose.rightElbow = 0.6;
      pose.lean = 0.06;
      x = 640;
    } else if (t < 6.0) {
      // Shake
      if (t < 2.6) {
        pose.brow = 'angry';
        pose.mouth = 'grit';
        pose.eye = 'squint';
        pose.rightArm = -1.1;
        pose.leftArm = 0.9;
        pose.rightElbow = 0.2;
        pose.leftElbow = 0.2;
        x = 760;
      } else if (t < 4.3) {
        pose.brow = 'angry';
        pose.mouth = 'grit';
        pose.eye = 'squint';
        pose.rightArm = -1.3;
        pose.leftArm = 1.0;
        pose.rightElbow = 0.3;
        pose.leftElbow = 0.3;
        x = 760 + Math.sin(t * 38) * 6;
      } else if (t < 4.9) {
        pose.brow = 'sad';
        pose.mouth = 'frown';
        pose.rightArm = 0.6;
        pose.leftArm = 0.2;
        x = 760;
      } else {
        pose.brow = 'angry';
        pose.mouth = 'grit';
        pose.eye = 'squint';
        pose.rightArm = 0.35;
        pose.leftArm = 0.25;
        x = 760;
      }
    } else if (t < 10.0) {
      // Second coin
      if (t < 6.6) {
        pose.brow = 'sad';
        pose.mouth = 'frown';
        pose.rightArm = 0.7;
        pose.leftArm = 0.2;
      } else if (t < 7.2) {
        pose.brow = 'raised';
        pose.mouth = 'grin';
        pose.rightArm = 1.1;
        pose.rightElbow = 0.9;
      } else if (t < 7.8) {
        pose.brow = 'raised';
        pose.mouth = 'grin';
        pose.rightArm = 1.4;
        pose.rightElbow = 1.1;
      } else if (t < 8.7) {
        pose.brow = 'raised';
        pose.mouth = 'o';
        pose.eye = 'wide';
        pose.rightArm = 1.2;
      } else {
        pose.brow = 'sad';
        pose.mouth = 'frown';
        pose.eye = 'squint';
        pose.rightArm = 0.5;
        pose.leftArm = 0.2;
      }
    } else if (t < 14.0) {
      // Broom
      x = 720;
      if (t < 10.6) {
        pose.brow = 'raised';
        pose.mouth = 'o';
        pose.rightArm = 1.2;
        pose.leftArm = 1.0;
      } else if (t < 11.4) {
        pose.brow = 'raised';
        pose.mouth = 'grin';
        pose.rightArm = 1.5;
        pose.leftArm = 1.3;
      } else {
        const u = smooth((t - 11.2) / 0.6);
        hipY = lerp(1260, 1370, u);
        pose.kneel = true;
        pose.lean = 0.18;
        if (t < 13.2) {
          pose.brow = 'angry';
          pose.mouth = 'grit';
          pose.rightArm = 0;
          pose.rightElbow = 0;
          pose.leftArm = 0;
          pose.leftElbow = 0;
          if (t >= 12.2) x = 720 + Math.sin(t * 30) * 5;
        } else {
          pose.brow = 'sad';
          pose.mouth = 'frown';
          pose.rightArm = 0;
          pose.rightElbow = 0;
          pose.leftArm = 0;
          pose.leftElbow = 0;
        }
      }
    } else if (t < 19.0) {
      // Flying kick
      if (t < 14.8) {
        x = lerp(760, 190, smooth((t - 14.0) / 0.8));
        pose.brow = 'angry';
        pose.mouth = 'grit';
        pose.rightArm = 0.9;
        pose.leftArm = 0.9;
        pose.rightElbow = 0.8;
        pose.leftElbow = 0.8;
      } else if (t < 15.8) {
        x = lerp(190, 560, smooth((t - 14.8) / 1.0));
        pose.brow = 'angry';
        pose.mouth = 'grit';
        pose.eye = 'squint';
        pose.rightArm = lerp(0.9, -0.8, smooth((t - 14.8) / 1.0));
        pose.leftArm = lerp(0.9, 1.4, smooth((t - 14.8) / 1.0));
      } else if (t < 18.2) {
        const u = smooth((t - 15.8) / 2.4);
        x = lerp(560, 840, u);
        jump = -Math.sin(u * Math.PI) * 150;
        pose.brow = 'angry';
        pose.mouth = 'grit';
        pose.eye = 'squint';
        pose.rightArm = -1.2;
        pose.leftArm = 1.2;
        pose.lean = -0.15;
        kick = 1;
      } else {
        x = 840;
        jump = -70;
        pose.brow = 'angry';
        pose.mouth = 'grit';
        pose.eye = 'squint';
        pose.rightArm = -1.0;
        pose.leftArm = 1.1;
        pose.lean = -0.12;
        kick = 1;
      }
    } else if (t < 23.0) {
      // Celebration
      x = 770;
      if (t < 19.6) {
        pose.brow = 'raised';
        pose.mouth = 'o';
        pose.eye = 'wide';
        pose.rightArm = 0.9;
        pose.leftArm = 0.6;
      } else if (t < 20.4) {
        pose.brow = 'raised';
        pose.mouth = 'grin';
        pose.rightArm = 1.3;
        pose.leftArm = 1.2;
        pose.rightElbow = 0.6;
        pose.leftElbow = 0.6;
      } else if (t < 22.0) {
        const u = (t - 20.4) / 1.6;
        jump = -Math.sin(u * Math.PI) * 130;
        pose.brow = 'raised';
        pose.mouth = 'grin';
        pose.rightArm = -2.5;
        pose.leftArm = -2.5;
      } else {
        pose.brow = 'raised';
        pose.mouth = 'grin';
        pose.rightArm = 1.2;
        pose.leftArm = 1.1;
      }
    } else if (t < 29.0) {
      // Punchline: sit, tear the bag, get blasted, find one chip, rage
      sitting = true;
      hipY = 1390;
      x = 780;
      if (t < 23.8) {
        pose.brow = 'raised';
        pose.mouth = 'grin';
        pose.rightArm = 1.1;
        pose.leftArm = 1.2;
      } else if (t < 25.0) {
        pose.brow = 'sad';
        pose.mouth = 'o';
        pose.eye = 'wide';
        pose.lean = -0.25;
        pose.rightArm = 1.4;
        pose.leftArm = 1.4;
      } else if (t < 26.4) {
        pose.brow = 'raised';
        pose.mouth = 'o';
        pose.eye = 'wide';
        pose.lean = 0.1;
        pose.rightArm = 1.2;
        pose.leftArm = 1.5;
      } else if (t < 27.2) {
        pose.brow = 'raised';
        pose.mouth = 'o';
        pose.eye = 'wide';
        pose.rightArm = 1.5;
        pose.leftArm = 1.6;
      } else {
        pose.brow = 'angry';
        pose.mouth = 'grit';
        pose.eye = 'squint';
        pose.rightArm = 0.6;
        pose.leftArm = 0.9;
      }
    } else {
      // End frame
      x = 780;
      pose.brow = 'angry';
      pose.mouth = 'grit';
      pose.eye = 'squint';
      pose.rightArm = 2.2;
      pose.rightElbow = 1.0;
      pose.leftArm = 0.2;
    }

    pose.kick = kick;
    pose.sitting = sitting;
    return { x, hipY, jump, pose };
  }

  private renderCharacter(ctx: CanvasRenderingContext2D, t: number) {
    const state = this.characterState(t);
    this.drawStickman(ctx, state.x, state.hipY + state.jump, state.pose, t);
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
    if (pose.kick > 0) {
      // Flying kick: front leg extended toward the machine (left), back leg tucked
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX - 50, hipY - 10);
      ctx.lineTo(hipX - 100, hipY - 110);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 60, hipY + 50);
      ctx.lineTo(hipX + 30, hipY + 130);
      ctx.stroke();
    } else if (pose.sitting) {
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 90, hipY + 30);
      ctx.lineTo(hipX + 120, hipY + 130);
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 30, hipY + 60);
      ctx.lineTo(hipX + 70, hipY + 130);
      ctx.stroke();
    } else if (pose.kneel) {
      // Crouched over the broom, knees bent
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX - 58, hipY + 80);
      ctx.lineTo(hipX - 68, this.floorY);
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 58, hipY + 70);
      ctx.lineTo(hipX + 66, this.floorY);
      ctx.stroke();
    } else {
      const spread = hipX > 500 ? 44 : 40;
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX - spread, this.floorY);
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + spread, this.floorY);
      ctx.stroke();
    }

    // Body: yellow shirt
    ctx.fillStyle = YELLOW_SHIRT;
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
    this.drawHead(ctx, headX, headY, pose, t);

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
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(cx, cy - 6, r + 4, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#b3222e';
    ctx.fillRect(cx - r - 4, cy - 22, (r + 4) * 2, 16);
    ctx.strokeRect(cx - r - 4, cy - 22, (r + 4) * 2, 16);
    // Pompom
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
    // A tiny twitch on the hook close-up
    const twitch = t < 2.0 ? Math.sin(t * 30) * 2 : 0;
    ctx.beginPath();
    if (pose.brow === 'angry') {
      ctx.moveTo(cx - 42, browY - 10);
      ctx.lineTo(cx - 12, browY + 8 + twitch);
      ctx.moveTo(cx + 42, browY - 10);
      ctx.lineTo(cx + 12, browY + 8 - twitch);
    } else if (pose.brow === 'raised') {
      ctx.moveTo(cx - 42, browY - 16);
      ctx.lineTo(cx - 12, browY - 16);
      ctx.moveTo(cx + 42, browY - 16);
      ctx.lineTo(cx + 12, browY - 16);
    } else if (pose.brow === 'sad') {
      ctx.moveTo(cx - 42, browY + 8);
      ctx.lineTo(cx - 12, browY - 8);
      ctx.moveTo(cx + 42, browY + 8);
      ctx.lineTo(cx + 12, browY - 8);
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
  // Bags
  // ------------------------------------------------------------------

  private bagState(t: number, which: 'yellow' | 'orange'): BagState {
    const isYellow = which === 'yellow';
    const baseX = isYellow ? 560 : 548;
    const hangY = isYellow ? 560 : 628;

    // Before the orange bag appears
    if (!isYellow && t < 7.8) {
      return { x: baseX, y: hangY, rot: 0, visible: false, held: false, open: false };
    }

    // Inside the glass
    if (t < 19.0) {
      let y = hangY;
      let rot = isYellow ? -0.38 : 0.12;
      if (!isYellow && t < 8.5) {
        const u = smooth((t - 7.8) / 0.7);
        y = lerp(360, hangY, u);
      }
      // Shake swing
      if (t >= 2.5 && t < 4.4) {
        rot += Math.sin(t * 30) * 0.18 * Math.sin(((t - 2.5) / 1.9) * Math.PI);
      }
      // Both bags drop together at 19.0
      return { x: baseX + this.machineSway(t), y, rot, visible: true, held: false, open: false };
    }

    // In the flap
    if (t < 19.55) {
      const u = smooth((t - 19.0) / 0.55);
      return {
        x: lerp(baseX, isYellow ? 470 : 520, u),
        y: lerp(hangY, 1390, u),
        rot: lerp(0, 0.3, u),
        visible: true,
        held: false,
        open: false,
      };
    }

    // Celebration: pulled from the flap and held above his head
    if (t < 23.0) {
      const heldX = isYellow ? 690 : 852;
      const heldY = 838;
      const rot = isYellow ? -0.25 : 0.25;
      if (t < 19.85) {
        const u = smooth((t - 19.55) / 0.3);
        return {
          x: lerp(isYellow ? 470 : 520, heldX, u),
          y: lerp(1390, heldY, u),
          rot: lerp(0.3, rot, u),
          visible: true,
          held: true,
          open: false,
        };
      }
      return { x: heldX, y: heldY, rot, visible: true, held: true, open: false };
    }

    // Punchline: orange bag on the floor, yellow bag in his hands
    if (isYellow) {
      if (t < 23.8) {
        return { x: 800, y: 1240, rot: -0.2, visible: true, held: true, open: false };
      }
      return { x: 800, y: 1250, rot: -0.1, visible: true, held: true, open: true };
    }
    return { x: 930, y: 1495, rot: 0.4, visible: true, held: false, open: false };
  }

  private renderBags(ctx: CanvasRenderingContext2D, t: number) {
    // Draw orange first so the yellow one overlaps it inside the glass
    for (const which of ['orange', 'yellow'] as const) {
      const bag = this.bagState(t, which);
      if (!bag.visible) continue;
      this.drawBag(ctx, bag.x, bag.y, bag.rot, which === 'orange' ? ORANGE_BAG : YELLOW_BAG, bag.open);
    }
  }

  private drawBag(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rot: number,
    color: string,
    open: boolean
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    const w = 86;
    const h = 120;

    // Bag body
    ctx.fillStyle = color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 14);
    ctx.fill();
    ctx.stroke();

    // Zigzag top seal (or torn top)
    ctx.beginPath();
    if (open) {
      ctx.moveTo(-w / 2 + 6, -h / 2 + 4);
      ctx.lineTo(-w / 2 + 20, -h / 2 - 8);
      ctx.lineTo(-w / 2 + 34, -h / 2 + 4);
      ctx.lineTo(-w / 2 + 48, -h / 2 - 10);
      ctx.lineTo(-w / 2 + 62, -h / 2 + 4);
      ctx.lineTo(w / 2 - 6, -h / 2 - 4);
    } else {
      ctx.moveTo(-w / 2 + 4, -h / 2 + 6);
      for (let i = 0; i < 5; i++) {
        const zx = -w / 2 + 4 + ((w - 8) / 5) * (i + 0.5);
        const zy = i % 2 === 0 ? -h / 2 - 10 : -h / 2 + 4;
        ctx.lineTo(zx, zy);
      }
      ctx.lineTo(w / 2 - 4, -h / 2 + 6);
    }
    ctx.stroke();

    // Simple chip mark (plain, no letters)
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 24, 16, -0.2, 0, TAU);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 10, -h / 2 + 18, 14, 52, 6);
    ctx.fill();

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Broom (Shot 4)
  // ------------------------------------------------------------------

  private renderBroom(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 10.0 || t >= 14.0) return;

    let angle = -0.55;
    let baseX = 820;
    let baseY = 1510;
    if (t >= 12.0) {
      // Jammed in the flap, tugging
      angle = -1.15;
      baseX = 820 + Math.sin(t * 26) * 5;
      baseY = 1510;
    }

    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.rotate(angle);

    // Handle
    ctx.strokeStyle = '#a1662f';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -520);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.lineTo(-11, -520);
    ctx.moveTo(11, 0);
    ctx.lineTo(11, -520);
    ctx.stroke();

    // Brush head
    ctx.fillStyle = '#f4c542';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-60, 0);
    ctx.lineTo(60, 0);
    ctx.lineTo(76, 90);
    ctx.lineTo(-76, 90);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#c99a1f';
    ctx.lineWidth = 4;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 24, 10);
      ctx.lineTo(i * 28, 84);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Coin (Shot 3)
  // ------------------------------------------------------------------

  private renderCoin(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 6.4 || t >= 8.0) return;

    const headX = 760;
    const headY = 1012;
    let x = headX + 60;
    let y = 1200;
    let visible = true;

    if (t < 6.8) {
      // Pulled from pocket
      const u = smooth((t - 6.4) / 0.4);
      x = lerp(headX + 60, headX + 50, u);
      y = lerp(1220, 1150, u);
    } else if (t < 7.3) {
      // Kiss
      const u = smooth((t - 6.8) / 0.5);
      x = lerp(headX + 50, headX + 18, u);
      y = lerp(1150, headY + 46, u);
    } else if (t < 7.8) {
      // Drop into the slot
      const u = smooth((t - 7.3) / 0.5);
      x = lerp(headX + 18, 690, u);
      y = lerp(headY + 46, 585, u);
    } else {
      visible = false;
    }

    if (!visible) return;

    ctx.save();
    ctx.fillStyle = GOLD;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 17, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#c9973a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Effects
  // ------------------------------------------------------------------

  private renderEffects(ctx: CanvasRenderingContext2D, t: number) {
    const state = this.characterState(t);
    const headX = state.x;
    const headY = state.hipY - 248;

    // Hook freeze flash
    if (t >= 0.9 && t < 1.15) {
      const u = (t - 0.9) / 0.25;
      ctx.save();
      ctx.globalAlpha = (1 - u) * 0.65;
      ctx.fillStyle = WHITE;
      ctx.fillRect(-600, -600, WIDTH + 1200, HEIGHT + 1200);
      ctx.restore();
    }

    // Lightbulb (Shot 4)
    if (t >= 10.6 && t < 11.8) {
      const pop = Math.min(1, (t - 10.6) / 0.2);
      const fade = Math.min(1, (11.8 - t) / 0.3);
      ctx.save();
      ctx.globalAlpha = clamp(Math.min(pop, fade), 0, 1);
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

    // Kick impact shockwave
    if (t >= 18.35 && t < 19.0) {
      const u = (t - 18.35) / 0.65;
      ctx.save();
      ctx.globalAlpha = (1 - u) * 0.9;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(740, 1080, 50 + u * 220, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // Celebration confetti
    if (t >= 21.2 && t < 23.4) {
      const u = (t - 21.2) / 2.2;
      ctx.save();
      const colors = [RED, YELLOW_BAG, BLUE, '#43aa8b', '#ff8fab', '#7c4dff'];
      for (let i = 0; i < 46; i++) {
        const ang = (i / 46) * TAU;
        const speed = 260 + (i % 7) * 55;
        const px = headX + Math.cos(ang) * speed * u;
        const py = headY + Math.sin(ang) * speed * u + u * u * 520;
        const size = 14 + (i % 4) * 6;
        ctx.globalAlpha = clamp(1 - u * 0.85, 0, 1);
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(i * 1.7 + u * 8);
        ctx.fillRect(-size / 2, -size / 2, size, size * 0.6);
        ctx.strokeRect(-size / 2, -size / 2, size, size * 0.6);
        ctx.restore();
      }
      ctx.restore();
    }

    // Giant air puff (Shot 7)
    if (t >= 23.8 && t < 25.3) {
      const u = (t - 23.8) / 1.5;
      ctx.save();
      ctx.globalAlpha = clamp(1 - u, 0, 1) * 0.85;
      ctx.fillStyle = '#eef7ff';
      ctx.strokeStyle = '#b9d9ea';
      ctx.lineWidth = 4;
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * TAU;
        const radius = 40 + u * 220 + (i % 3) * 30;
        const px = headX + Math.cos(ang) * radius;
        const py = headY + Math.sin(ang) * radius;
        const size = 24 + (i % 4) * 12 + u * 26;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Single tiny chip: falls into palm, then held at the end
    if (t >= 26.2) {
      let chipX = 840;
      let chipY = 1230;
      let rot = 0.3;
      if (t < 27.0) {
        const u = smooth((t - 26.2) / 0.8);
        chipX = lerp(820, 840, u);
        chipY = lerp(1140, 1230, u);
        rot = u * 2.2;
      } else if (t >= 29.0) {
        chipX = 875;
        chipY = 925;
        rot = 0.15;
      }
      ctx.save();
      ctx.translate(chipX, chipY);
      ctx.rotate(rot);
      ctx.fillStyle = '#f8d27a';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 20, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#c99a3a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 19, 12, 0, 0, TAU);
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

    const u = clamp((t - line.from) / 0.1, 0, 1);
    const fade = Math.min(1, (line.to - t) / 0.2);
    const alpha = clamp(Math.min((t - line.from) / 0.05, fade), 0, 1);
    if (alpha <= 0) return;

    // 0.1s scale-bounce pop-in with a small overshoot.
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
