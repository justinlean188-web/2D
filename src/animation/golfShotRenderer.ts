import { StudioConfig } from '../types';

/**
 * GolfShotRenderer
 *
 * "THE ANGRY STICKMAN: THE IMPOSSIBLE HOLE-IN-ONE" — a 30-second vertical
 * golf comedy on the same stickman rig as the dart and coin shorts.
 *
 * Scene 1 0-5    THE CHALLENGE      (point at the island, waggle, address)
 * Scene 2 5-9    COMPLETE FAIL      (whiff, three spins, club into the bunker)
 * Scene 3 9-15   THE CANNON         (cart + leaf blower + spring + lever)
 * Scene 4 15-22  THE IMPOSSIBLE SHOT(cannon, buoy, windmill loop, hole)
 * Scene 5 22-26  THE FORGOTTEN SPRING(island launches toward the pool)
 * Scene 6 26-30  THE PAYOFF         (splash, basket landing, ball bonk)
 *
 * One continuous golf course: tee on the left, water in the middle with a
 * tiny island green, the pool and windmill on the right, the cart parked
 * behind the tee. Bright flat colours, thick black outlines, no text inside
 * the artwork except the six burned-in captions at the top of the frame.
 */

type EyeStyle =
  | 'normal'
  | 'wide'
  | 'happy'
  | 'closed'
  | 'cross'
  | 'stunned'
  | 'squint';

type BrowStyle = 'neutral' | 'angry' | 'raised' | 'determined' | 'sad' | 'oneRaised';

type MouthStyle =
  | 'flat'
  | 'smirk'
  | 'grin'
  | 'open'
  | 'grit'
  | 'o'
  | 'wobble'
  | 'scream';

type HandStyle = 'relaxed' | 'fist' | 'open' | 'point' | 'hold' | 'thumb';

interface Vec {
  x: number;
  y: number;
}

interface Pose {
  hipX: number;
  hipY: number;
  lean: number;
  bodyRot: number;
  jump: number;
  squashX: number;
  squashY: number;
  headTilt: number;
  leftFoot: Vec;
  rightFoot: Vec;
  leftKnee: number;
  rightKnee: number;
  leftHand: Vec;
  rightHand: Vec;
  leftElbow: number;
  rightElbow: number;
  leftHandStyle: HandStyle;
  rightHandStyle: HandStyle;
  eye: EyeStyle;
  brow: BrowStyle;
  mouth: MouthStyle;
  gazeX: number;
  gazeY: number;
  pupilScale: number;
  flush: boolean;
  anger: boolean;
  sweat: boolean;
  silhouette: boolean;
  holdClub: boolean;
  clubAngle: number;
}

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

interface Caption {
  lines: string[];
  from: number;
  to: number;
  skull?: boolean;
}

const TAU = Math.PI * 2;
const INK = '#000000';
const SKY = '#eef8ff';
const GRASS = '#4ade80';
const GRASS_DARK = '#22c55e';
const GRASS_LIGHT = '#86efac';
const WATER = '#38bdf8';
const WATER_DARK = '#0284c7';
const POOL = '#0ea5e9';
const SAND = '#fde68a';
const RED = '#dc2626';
const YELLOW = '#facc15';
const ORANGE = '#f97316';
const WHITE = '#ffffff';
const SLATE = '#334155';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => {
  const c = clamp(u, 0, 1);
  return c * c * (3 - 2 * c);
};
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u, 0, 1), 2);
const bump = (u: number) => Math.sin(clamp(u, 0, 1) * Math.PI);

/** 0 -> 1 with a tiny overshoot, used when the cannon parts snap together. */
const popIn = (t: number, at: number, dur = 0.24) => {
  if (t < at) return 0;
  const u = clamp((t - at) / dur, 0, 1);
  return 1 + Math.sin(u * Math.PI) * 0.14 - (1 - u) * 0;
};

const CAPTIONS: Caption[] = [
  { lines: ['He wants a HOLE-IN-ONE', 'from 100 meters away!'], from: 0.4, to: 4.86 },
  { lines: ['His first shot is a', 'COMPLETE FAIL!'], from: 5.12, to: 8.76 },
  { lines: ['So he builds a', 'GOLF BALL CANNON!'], from: 9.16, to: 14.82 },
  { lines: ["WAIT… IT'S", 'ACTUALLY WORKING!'], from: 15.18, to: 21.82 },
  { lines: ['BUT HE FORGOT', 'ONE THING…'], from: 22.16, to: 25.86 },
  { lines: ['HOLE-IN-ONE.', 'BRAIN-IN-ZERO.'], from: 26.24, to: 30.0, skull: true },
];

export class GolfShotRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  private readonly floorY = 1460;
  private readonly horizonY = 880;

  // World anchors.
  private readonly teeLeft = 340;
  private readonly teeRight = 580;
  private readonly teeTop = 1340;
  private readonly ballTee = { x: 505, y: 1316 };

  private readonly cartLeft = 24;
  private readonly cartRight = 332;
  private readonly basketLeft = 6;
  private readonly basketRight = 150;
  private readonly basketTop = 1060;
  private readonly basketBottom = 1368;

  private readonly cannonMuzzle = { x: 700, y: 1118 };

  private readonly waterLeft = 620;
  private readonly waterRight = 1010;
  private readonly waterTop = 960;
  private readonly waterBottom = 1390;

  private readonly islandX = 830;
  private readonly islandY = 1172;
  private readonly holeX = 848;
  private readonly holeY = 1150;

  private readonly poolLeft = 1030;
  private readonly poolRight = 1400;
  private readonly poolTop = 1040;
  private readonly poolBottom = 1432;

  private readonly windmillX = 1210;
  private readonly windmillY = 880;
  private readonly windmillBladeY = 752;

  private readonly buoy = { x: 900, y: 1294 };

  private readonly cameraKeys: CameraKey[] = [
    // Scene 1: wide course, push in to the determined address.
    { t: 0.0, x: 560, y: 1040, zoom: 0.68 },
    { t: 0.9, x: 540, y: 1030, zoom: 0.72 },
    { t: 1.7, x: 500, y: 1020, zoom: 0.82 },
    { t: 1.95, x: 460, y: 990, zoom: 0.98 },
    { t: 2.5, x: 450, y: 970, zoom: 1.06 },
    { t: 3.75, x: 450, y: 960, zoom: 1.12 },
    { t: 4.0, x: 450, y: 925, zoom: 1.3 },
    { t: 4.95, x: 450, y: 925, zoom: 1.3 },

    // Scene 2: the overswing, three spins, then the motionless ball.
    { t: 5.0, x: 450, y: 985, zoom: 1.12 },
    { t: 5.6, x: 450, y: 1000, zoom: 1.12 },
    { t: 5.95, x: 450, y: 1020, zoom: 1.08 },
    { t: 6.15, x: 450, y: 1040, zoom: 0.98 },
    { t: 7.4, x: 450, y: 1040, zoom: 0.98 },
    { t: 7.7, x: 440, y: 1090, zoom: 1.06 },
    { t: 7.95, x: 505, y: 1220, zoom: 1.05 },
    { t: 8.4, x: 505, y: 1220, zoom: 1.05 },
    { t: 8.55, x: 450, y: 1030, zoom: 1.12 },
    { t: 9.0, x: 450, y: 1030, zoom: 1.12 },

    // Scene 3: the build beside the cart and cannon.
    { t: 9.05, x: 500, y: 1060, zoom: 0.94 },
    { t: 9.45, x: 500, y: 1060, zoom: 0.94 },
    { t: 9.6, x: 480, y: 1070, zoom: 0.92 },
    { t: 14.0, x: 480, y: 1070, zoom: 0.92 },
    { t: 14.15, x: 520, y: 1040, zoom: 1.0 },
    { t: 15.0, x: 520, y: 1040, zoom: 1.0 },

    // Scene 4: track the ball over the water, through the windmill and back.
    { t: 15.05, x: 700, y: 1030, zoom: 0.92 },
    { t: 15.4, x: 820, y: 1000, zoom: 0.92 },
    { t: 16.1, x: 900, y: 1060, zoom: 1.0 },
    { t: 16.4, x: 950, y: 1020, zoom: 0.9 },
    { t: 17.6, x: 1000, y: 930, zoom: 0.82 },
    { t: 18.4, x: 1040, y: 900, zoom: 0.78 },
    { t: 19.4, x: 1000, y: 920, zoom: 0.82 },
    { t: 20.45, x: 860, y: 1040, zoom: 1.0 },
    { t: 20.55, x: 848, y: 1100, zoom: 1.42 },
    { t: 20.95, x: 848, y: 1100, zoom: 1.42 },
    { t: 21.1, x: 450, y: 1010, zoom: 1.12 },
    { t: 21.95, x: 450, y: 990, zoom: 1.1 },

    // Scene 5: the spring, the launch, then his horrified face.
    { t: 22.0, x: 830, y: 1000, zoom: 1.05 },
    { t: 22.45, x: 830, y: 1060, zoom: 1.18 },
    { t: 23.35, x: 830, y: 1050, zoom: 1.18 },
    { t: 23.55, x: 850, y: 900, zoom: 0.92 },
    { t: 24.3, x: 980, y: 820, zoom: 0.88 },
    { t: 24.9, x: 1030, y: 800, zoom: 0.86 },
    { t: 25.05, x: 450, y: 1020, zoom: 1.12 },
    { t: 25.95, x: 450, y: 1000, zoom: 1.14 },

    // Scene 6: pool impact, wave hit, flight, basket, freeze.
    { t: 26.0, x: 1250, y: 1080, zoom: 0.95 },
    { t: 26.6, x: 1200, y: 1040, zoom: 0.96 },
    { t: 26.78, x: 1180, y: 1040, zoom: 0.98 },
    // Hard cut back to the tee just before the surge reaches him.
    { t: 26.82, x: 560, y: 1030, zoom: 1.05 },
    { t: 27.0, x: 520, y: 1000, zoom: 1.0 },
    { t: 27.2, x: 500, y: 1000, zoom: 0.98 },
    { t: 27.5, x: 400, y: 1010, zoom: 0.9 },
    { t: 27.8, x: 250, y: 1080, zoom: 0.95 },
    { t: 27.95, x: 170, y: 1150, zoom: 1.05 },
    { t: 28.6, x: 130, y: 1170, zoom: 1.42 },
    { t: 30.0, x: 130, y: 1170, zoom: 1.42 },
  ];

  // ==========================================================
  // ENTRY POINT
  // ==========================================================

  public render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = clamp(time, 0, 30);
    const pose = this.getPose(t);

    ctx.save();
    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, this.width, this.height);

    this.applyCamera(ctx, t);
    this.renderBackground(ctx, t);
    this.renderCourse(ctx, t);
    this.renderBunker(ctx, t);
    this.renderWater(ctx, t);
    this.renderPool(ctx, t);
    this.renderWindmill(ctx, t);
    this.renderCartBack(ctx, t);
    this.renderTee(ctx, t);
    this.renderIsland(ctx, t);
    this.renderCannon(ctx, t);
    this.renderWave(ctx, t);
    this.renderStickman(ctx, pose, t);
    this.renderCartFront(ctx, t);
    this.renderBall(ctx, t, pose);
    this.renderFlyingClub(ctx, t, pose);
    this.renderEffects(ctx, t, pose);
    ctx.restore();

    this.renderCaption(ctx, t);

    if (config.showSafeZones) this.renderSafeZones(ctx);
  }

  // ==========================================================
  // CAMERA
  // ==========================================================

  private cameraAt(t: number): CameraKey {
    const keys = this.cameraKeys;
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const u = smooth((t - a.t) / Math.max(0.0001, b.t - a.t));
    const zoom = lerp(a.zoom, b.zoom, u);
    const x = lerp(a.x, b.x, u);
    let y = lerp(a.y, b.y, u);
    // Keep the floor above the bottom caption-safe band.
    const minY = this.floorY - (1592 - this.height / 2) / zoom;
    y = Math.max(y, minY);
    return { t, x, y, zoom };
  }

  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    const cam = this.cameraAt(t);
    const kick = (at: number, decay: number, amp: number) =>
      t < at ? 0 : Math.exp(-(t - at) * decay) * amp;
    const shake =
      kick(7.12, 10, 4) +
      kick(15.06, 9, 10) +
      kick(16.12, 11, 4) +
      kick(20.5, 9, 5) +
      kick(23.35, 8, 8) +
      kick(26.02, 7, 12) +
      kick(27.92, 8, 6) +
      kick(29.02, 9, 5);
    const sx = Math.sin(t * 35) * shake;
    const sy = Math.cos(t * 31) * shake;

    ctx.save();
    ctx.translate(this.width / 2 + sx, this.height / 2 + sy);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);
  }

  // ==========================================================
  // CAPTIONS
  // ==========================================================

  private renderCaption(ctx: CanvasRenderingContext2D, t: number) {
    for (const caption of CAPTIONS) {
      if (t < caption.from || t > caption.to) continue;
      const fadeIn = clamp((t - caption.from) / 0.16, 0, 1);
      const fadeOut = caption.to >= 30 ? 1 : clamp((caption.to - t) / 0.16, 0, 1);
      const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
      const pop = 1 + 0.055 * Math.exp(-Math.max(0, t - caption.from) * 20);
      const twoLines = caption.lines.length > 1;
      const baseY = twoLines ? 160 : 200;
      const lineGap = 94;

      let size = 64;
      ctx.save();
      ctx.font = `900 ${size}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
      let widest = 0;
      for (const line of caption.lines) widest = Math.max(widest, ctx.measureText(line).width);
      if (widest > 930) size = Math.floor(size * (930 / widest));
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.width / 2, baseY);
      ctx.scale(pop, pop);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 ${size}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      caption.lines.forEach((line, index) => {
        const y = index * lineGap;
        ctx.strokeStyle = YELLOW;
        ctx.lineWidth = 30;
        ctx.strokeText(line, 0, y);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 18;
        ctx.strokeText(line, 0, y);
        ctx.fillStyle = WHITE;
        ctx.fillText(line, 0, y);
      });

      if (caption.skull) {
        const last = caption.lines[caption.lines.length - 1];
        const w = ctx.measureText(last).width;
        const y = (caption.lines.length - 1) * lineGap;
        this.drawSkullIcon(ctx, w / 2 + 36, y + 2, 21);
      }
      ctx.restore();
    }
  }

  private drawSkullIcon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -3, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(-r * 0.45, r * 0.55, r * 0.9, r * 0.55);
    ctx.strokeRect(-r * 0.45, r * 0.55, r * 0.9, r * 0.55);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(-r * 0.38, -4, r * 0.24, 0, TAU);
    ctx.arc(r * 0.38, -4, r * 0.24, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, r * 0.18);
    ctx.lineTo(-r * 0.14, r * 0.5);
    ctx.lineTo(r * 0.14, r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 3;
    for (const dx of [-r * 0.2, 0, r * 0.2]) {
      ctx.beginPath();
      ctx.moveTo(dx, r * 0.66);
      ctx.lineTo(dx, r * 1.0);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
    ctx.setLineDash([14, 12]);
    ctx.lineWidth = 3;

    // Title / action safe area.
    ctx.strokeRect(48, 120, this.width - 96, this.height - 240);

    // Top caption-safe band (where the golf captions sit).
    ctx.strokeRect(48, 62, this.width - 96, 276);

    // Right-hand action bar.
    ctx.beginPath();
    ctx.moveTo(this.width - 150, 520);
    ctx.lineTo(this.width - 150, 1380);
    ctx.stroke();

    // Bottom platform caption band.
    ctx.strokeRect(48, 1590, this.width - 96, 210);
    ctx.restore();
  }

  // ==========================================================
  // BACKGROUND / COURSE
  // ==========================================================

  private renderBackground(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();

    // A flat pale sun, high enough to stay clear of the caption band.
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(208, 438, 58, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Three soft clouds. No black outline, so the sky stays light.
    const cloud = (x: number, y: number, s: number) => {
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, 38 * s, 0, TAU);
      ctx.arc(x + 42 * s, y - 16 * s, 50 * s, 0, TAU);
      ctx.arc(x + 92 * s, y, 36 * s, 0, TAU);
      ctx.rect(x - 4 * s, y, 96 * s, 34 * s);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = WHITE;
      ctx.fillRect(x - 4 * s, y + 2, 96 * s, 32 * s);
    };
    cloud(600 + Math.sin(t * 0.08) * 8, 460, 0.8);
    cloud(940 + Math.sin(t * 0.06 + 1) * 10, 540, 0.72);
    cloud(96 + Math.sin(t * 0.05 + 2) * 6, 760, 0.55);

    // Far rolling hills behind the fairway.
    ctx.fillStyle = GRASS_LIGHT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-900, this.horizonY);
    ctx.quadraticCurveTo(150, 626, 520, this.horizonY);
    ctx.quadraticCurveTo(900, 704, 1380, this.horizonY);
    ctx.quadraticCurveTo(1700, 680, 2320, this.horizonY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#bbf7d0';
    ctx.beginPath();
    ctx.moveTo(420, this.horizonY);
    ctx.quadraticCurveTo(800, 720, 1340, this.horizonY);
    ctx.quadraticCurveTo(1560, 732, 1880, this.horizonY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private renderCourse(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.fillStyle = GRASS;
    ctx.fillRect(-1200, this.horizonY, 3600, this.floorY - this.horizonY + 120);

    // Flat mown bands, just a shade apart.
    for (let i = 0; i < 8; i++) {
      const y = 920 + i * 68;
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.fillRect(-1200, y, 3600, 34);
      }
    }

    // A paler fairway stripe winding from the tee to the water.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.11)';
    ctx.beginPath();
    ctx.moveTo(380, this.horizonY + 20);
    ctx.quadraticCurveTo(560, 1120, 620, 1420);
    ctx.lineTo(880, 1420);
    ctx.quadraticCurveTo(790, 1120, 660, this.horizonY + 20);
    ctx.closePath();
    ctx.fill();

    // Horizon line.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-1100, this.horizonY);
    ctx.lineTo(2320, this.horizonY);
    ctx.stroke();

    // A handful of grass tufts to keep the big green from feeling empty.
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const tufts: Vec[] = [
      { x: 78, y: 1200 },
      { x: 596, y: 1130 },
      { x: 964, y: 1436 },
      { x: 1044, y: 1140 },
      { x: 392, y: 1476 },
      { x: 744, y: 1478 },
      { x: 1120, y: 1472 },
      { x: 1462, y: 1438 },
      { x: 1690, y: 1474 },
      { x: 1950, y: 1452 },
    ];
    for (const tuft of tufts) {
      const sway = Math.sin(t * 1.4 + tuft.x * 0.01) * 3;
      ctx.beginPath();
      ctx.moveTo(tuft.x, tuft.y);
      ctx.lineTo(tuft.x - 5 + sway, tuft.y - 18);
      ctx.moveTo(tuft.x, tuft.y);
      ctx.lineTo(tuft.x + 7 + sway, tuft.y - 15);
      ctx.moveTo(tuft.x, tuft.y);
      ctx.lineTo(tuft.x + 1 + sway, tuft.y - 22);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderBunker(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.fillStyle = SAND;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(640, 1434, 88, 28, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fcd34d';
    for (const [dx, dy, r] of [
      [-42, -4, 4],
      [16, 6, 5],
      [48, -7, 3.5],
      [-8, 13, 3],
    ] as const) {
      ctx.beginPath();
      ctx.arc(640 + dx, 1434 + dy, r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderWater(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    // Water hazard block with rounded banks.
    this.rr(ctx, this.waterLeft, this.waterTop, this.waterRight - this.waterLeft, this.waterBottom - this.waterTop, 64);
    ctx.fillStyle = WATER;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.stroke();

    ctx.fillStyle = 'rgba(2, 132, 199, 0.28)';
    this.rr(ctx, this.waterLeft + 18, this.waterTop + 210, this.waterRight - this.waterLeft - 36, this.waterBottom - this.waterTop - 250, 44);
    ctx.fill();

    // White ripples.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const y = 1052 + i * 78;
      const sway = Math.sin(t * 1.1 + i) * 8;
      ctx.beginPath();
      for (let x = 0; x <= 5; x++) {
        const px = this.waterLeft + 62 + x * 54 + sway;
        const py = y + Math.sin(x * 1.8 + t * 1.3 + i) * 5;
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // The floating red-and-white buoy.
    const bob = Math.sin(t * 2.1) * 4;
    const bx = this.buoy.x;
    const by = this.buoy.y + bob;
    ctx.fillStyle = 'rgba(2, 132, 199, 0.35)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 30, 44, 10, 0, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.translate(bx, by);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, TAU);
    ctx.clip();
    ctx.fillStyle = RED;
    ctx.fillRect(-34, -10, 68, 17);
    ctx.fillRect(-34, 18, 68, 12);
    ctx.restore();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(0, -33, 5, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  private renderPool(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    // Deck.
    this.rr(ctx, this.poolLeft - 18, this.poolTop - 18, this.poolRight - this.poolLeft + 36, this.poolBottom - this.poolTop + 36, 26);
    ctx.fillStyle = WHITE;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.stroke();

    // Pool water.
    this.rr(ctx, this.poolLeft, this.poolTop, this.poolRight - this.poolLeft, this.poolBottom - this.poolTop, 22);
    ctx.fillStyle = POOL;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(3, 105, 161, 0.32)';
    this.rr(ctx, this.poolLeft + 16, this.poolTop + 170, this.poolRight - this.poolLeft - 32, this.poolBottom - this.poolTop - 200, 18);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const y = 1112 + i * 80;
      ctx.beginPath();
      for (let x = 0; x <= 4; x++) {
        const px = this.poolLeft + 44 + x * 74;
        const py = y + Math.sin(t * 1.6 + x + i) * 5;
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Chrome ladder on the right-hand deck.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(this.poolRight - 52, this.poolTop - 10);
    ctx.lineTo(this.poolRight - 52, this.poolTop + 146);
    ctx.moveTo(this.poolRight - 18, this.poolTop - 10);
    ctx.lineTo(this.poolRight - 18, this.poolTop + 146);
    ctx.stroke();
    ctx.lineWidth = 6;
    for (const y of [this.poolTop + 28, this.poolTop + 70, this.poolTop + 112]) {
      ctx.beginPath();
      ctx.moveTo(this.poolRight - 52, y);
      ctx.lineTo(this.poolRight - 18, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderWindmill(ctx: CanvasRenderingContext2D, t: number) {
    const tower = () => {
      ctx.beginPath();
      ctx.moveTo(1150, this.poolTop + 4);
      ctx.lineTo(1182, 720);
      ctx.lineTo(1238, 720);
      ctx.lineTo(1270, this.poolTop + 4);
      ctx.closePath();
      ctx.fillStyle = WHITE;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 7;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Roof.
      ctx.beginPath();
      ctx.moveTo(1170, 720);
      ctx.lineTo(1210, 674);
      ctx.lineTo(1250, 720);
      ctx.closePath();
      ctx.fillStyle = GRASS_DARK;
      ctx.fill();
      ctx.stroke();

      // The dark arch the ball must thread.
      ctx.beginPath();
      ctx.moveTo(this.windmillX - 38, 942);
      ctx.lineTo(this.windmillX - 38, 902);
      ctx.arc(this.windmillX, 902, 38, Math.PI, TAU);
      ctx.lineTo(this.windmillX + 38, 942);
      ctx.closePath();
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.stroke();

      // A small sill under the opening.
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.rect(this.windmillX - 46, 942, 92, 12);
      ctx.fill();
      ctx.stroke();
    };

    tower();

    // Four blades, slow until the ball clips the mill.
    let angle = t * 0.28;
    if (t > 17.62) {
      const u = t - 17.62;
      angle += Math.min(3.4, u * 5.5) * Math.exp(-u * 0.35);
    }
    const cx = this.windmillX;
    const cy = this.windmillBladeY;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 2);
      ctx.beginPath();
      ctx.moveTo(3, -11);
      ctx.lineTo(92, -22);
      ctx.lineTo(98, 0);
      ctx.lineTo(92, 22);
      ctx.lineTo(3, 11);
      ctx.closePath();
      ctx.fillStyle = WHITE;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private rr(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.arc(x + w - radius, y + radius, radius, -Math.PI / 2, 0);
    ctx.lineTo(x + w, y + h - radius);
    ctx.arc(x + w - radius, y + h - radius, radius, 0, Math.PI / 2);
    ctx.lineTo(x + radius, y + h);
    ctx.arc(x + radius, y + h - radius, radius, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + radius);
    ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
    ctx.closePath();
  }

  // ==========================================================
  // GOLF CART
  // ==========================================================

  private renderCartBack(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();

    // Ground shadow.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(190, this.floorY + 8, 168, 18, 0, 0, TAU);
    ctx.fill();

    // Wire basket: the back panel first, so the stickman can sit inside it.
    this.rr(ctx, this.basketLeft, this.basketTop, this.basketRight - this.basketLeft, this.basketBottom - this.basketTop, 14);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.rect(this.basketLeft + 5, this.basketTop + 5, this.basketRight - this.basketLeft - 10, this.basketBottom - this.basketTop - 10);
    ctx.clip();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.lineWidth = 3;
    for (let x = this.basketLeft + 18; x < this.basketRight; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, this.basketTop);
      ctx.lineTo(x, this.basketBottom);
      ctx.stroke();
    }
    for (let y = this.basketTop + 16; y < this.basketBottom; y += 22) {
      ctx.beginPath();
      ctx.moveTo(this.basketLeft, y);
      ctx.lineTo(this.basketRight, y);
      ctx.stroke();
    }
    ctx.restore();

    // Wheels.
    const wheel = (x: number, y: number) => {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(x, y, 44, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.arc(x, y, 19, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, TAU);
      ctx.fill();
    };
    wheel(204, this.floorY - 54);
    wheel(304, this.floorY - 54);

    // Chassis.
    this.rr(ctx, 148, 1270, 192, 116, 18);
    ctx.fillStyle = WHITE;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.stroke();

    // Green racing stripe.
    ctx.fillStyle = GRASS_DARK;
    ctx.fillRect(158, 1302, 172, 30);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(158, 1302);
    ctx.lineTo(330, 1302);
    ctx.moveTo(158, 1332);
    ctx.lineTo(330, 1332);
    ctx.stroke();

    // Seat back and steering column.
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    this.rr(ctx, 174, 1220, 54, 82, 12);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(306, 1284);
    ctx.lineTo(292, 1234);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(288, 1222, 24, -0.2, Math.PI * 1.15);
    ctx.stroke();

    // Canopy posts and roof.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(166, 1272);
    ctx.lineTo(174, 1174);
    ctx.moveTo(322, 1272);
    ctx.lineTo(314, 1162);
    ctx.stroke();

    this.rr(ctx, 146, 1138, 190, 40, 12);
    ctx.fillStyle = GRASS_DARK;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(162, 1148, 158, 9);

    // Small front basket on the nose.
    this.rr(ctx, 310, 1290, 38, 46, 8);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Rear cargo cradle: a tow bar and a little trailer wheel so the tall
    // basket reads as part of the cart instead of a crate hovering beside it.
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(166, 1382);
    ctx.lineTo(96, 1382);
    ctx.moveTo(80, 1362);
    ctx.lineTo(80, 1406);
    ctx.stroke();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(166, 1382);
    ctx.lineTo(96, 1382);
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(80, 1428, 25, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(80, 1428, 10, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // Basket clang: a white shock ring around the rim, behind the stickman.
    if (t >= 27.92 && t < 28.24) {
      const u = (t - 27.92) / 0.32;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.ellipse(78, this.basketTop + 4, 74 + u * 64, 18 + u * 20, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  private renderCartFront(ctx: CanvasRenderingContext2D, t: number) {
    // Only the wire grid of the rear basket sits in front of the stickman.
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.basketLeft + 5, this.basketTop + 5, this.basketRight - this.basketLeft - 10, this.basketBottom - this.basketTop - 10);
    ctx.clip();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 3.5;
    for (let x = this.basketLeft + 18; x < this.basketRight; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, this.basketTop);
      ctx.lineTo(x, this.basketBottom);
      ctx.stroke();
    }
    for (let y = this.basketTop + 16; y < this.basketBottom; y += 22) {
      ctx.beginPath();
      ctx.moveTo(this.basketLeft, y);
      ctx.lineTo(this.basketRight, y);
      ctx.stroke();
    }
    ctx.restore();

    // Rim bar.
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.basketLeft - 6, this.basketTop + 2);
    ctx.lineTo(this.basketRight + 6, this.basketTop + 2);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================
  // TEE PLATFORM
  // ==========================================================

  private renderTee(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    // Shadow and block.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(460, 1444, 136, 15, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.rect(this.teeLeft, this.teeTop, this.teeRight - this.teeLeft, 92);
    ctx.fill();
    ctx.stroke();

    // Grassy top.
    ctx.fillStyle = GRASS_DARK;
    ctx.fillRect(this.teeLeft, this.teeTop, this.teeRight - this.teeLeft, 18);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.teeLeft, this.teeTop + 18);
    ctx.lineTo(this.teeRight, this.teeTop + 18);
    ctx.stroke();

    // Two little white tee markers.
    for (const x of [386, 542]) {
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, this.teeTop);
      ctx.lineTo(x - 5, this.teeTop - 15);
      ctx.lineTo(x + 5, this.teeTop - 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // The peg under the ball.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.ballTee.x, this.teeTop - 2);
    ctx.lineTo(this.ballTee.x, this.ballTee.y + 14);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================
  // ISLAND GREEN + FLAG + SPRING
  // ==========================================================

  private islandState(t: number): { x: number; y: number; rot: number; scale: number } {
    let x = this.islandX;
    let y = this.islandY;
    let rot = 0;
    let scale = 1;

    if (t >= 22.4 && t < 23.35) {
      const u = (t - 22.4) / 0.95;
      y += Math.sin(u * Math.PI * 3) * 8 + u * 14;
      rot = Math.sin(u * Math.PI * 1.4) * 0.018;
    } else if (t >= 23.35 && t < 26.0) {
      const keys = [
        { t: 23.35, x: 830, y: 1186 },
        { t: 23.55, x: 850, y: 1050 },
        { t: 24.0, x: 946, y: 832 },
        { t: 24.55, x: 1090, y: 704 },
        { t: 25.15, x: 1250, y: 742 },
        { t: 25.7, x: 1264, y: 962 },
        { t: 26.0, x: 1180, y: 1128 },
      ];
      const p = this.pathPoint(keys, t);
      x = p.x;
      y = p.y;
      const u = clamp((t - 23.35) / 2.65, 0, 1);
      rot = -0.24 * Math.sin(u * Math.PI) + 0.07 * Math.sin(u * Math.PI * 2);
      scale = 1 - 0.1 * smooth((t - 25.3) / 0.7);
    } else if (t >= 26.0) {
      x = 1190;
      y = 1360;
      rot = 0.12;
      scale = 0.84;
    }
    return { x, y, rot, scale };
  }

  private renderIsland(ctx: CanvasRenderingContext2D, t: number) {
    // The spring lives under the island and is only revealed at 22.4s.
    if (t >= 22.4 && t < 26.0) this.renderIslandSpring(ctx, t);

    // At 26.0 the island is in the pool: the splash owns the shot from here,
    // so the green (and its flagpole) must not show through the water plumes.
    if (t >= 26.0) return;

    const state = this.islandState(t);

    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.rotate(state.rot);
    ctx.scale(state.scale, state.scale);

    // Sand collar.
    ctx.fillStyle = SAND;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(0, 14, 138, 54, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Green top.
    ctx.fillStyle = GRASS_DARK;
    ctx.beginPath();
    ctx.ellipse(0, 0, 120, 42, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Subtle mow ring.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -4, 92, 30, 0, 0, TAU);
    ctx.stroke();

    // A couple of grass tufts.
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (const [dx, dy] of [
      [-64, 4],
      [46, -8],
      [-18, -18],
    ] as const) {
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx - 5, dy - 15);
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + 6, dy - 12);
      ctx.stroke();
    }

    // The hole itself.
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(-this.islandX + this.holeX, -this.islandY + this.holeY, 19, 10, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Flagpole. The pole telescopes upward just before the launch.
    let poleTop = -232;
    if (t >= 22.92) poleTop -= 64 * smooth((t - 22.92) / 0.4);
    let poleBend = 0;
    if (t >= 20.5 && t < 21.6) poleBend = Math.sin((t - 20.5) * 22) * 8 * Math.exp(-(t - 20.5) * 3);
    const baseX = -this.islandX + this.holeX;
    const baseY = -this.islandY + this.holeY;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(baseX + poleBend, poleTop * 0.5 + baseY * 0.5, baseX + poleBend * 1.4, poleTop);
    ctx.stroke();

    // Red flag, fluttering in the wind.
    const wave = Math.sin(t * 5.2) * 5;
    ctx.fillStyle = RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(baseX + poleBend * 1.4, poleTop + 5);
    ctx.quadraticCurveTo(baseX + 62, poleTop + wave, baseX + 92, poleTop + 34 + wave * 0.5);
    ctx.quadraticCurveTo(baseX + 56, poleTop + 44 - wave, baseX + poleBend * 1.4, poleTop + 66);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private renderIslandSpring(ctx: CanvasRenderingContext2D, t: number) {
    const state = this.islandState(t);
    const bottom = 1408;
    let top: number;
    let x = 830;

    if (t < 23.55) {
      // The coil stays glued to the island's sand collar while it loads.
      top = state.y + 54;
      x = state.x;
    } else {
      const u = clamp((t - 23.55) / 0.35, 0, 1);
      top = lerp(state.y + 54, 1312, smooth(u));
      x = lerp(state.x, 830, smooth(u));
      if (t > 23.9) top = 1312 + Math.sin((t - 23.9) * 9) * 6 * Math.exp(-(t - 23.9) * 2.5);
    }
    const coils = 6;

    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      ctx.moveTo(x, top);
      for (let i = 0; i <= coils; i++) {
        const y = lerp(top, bottom, i / coils);
        const sway = i % 2 === 0 ? -30 : 30;
        ctx.lineTo(x + sway, y);
      }
      ctx.lineTo(x, bottom);
      if (pass === 0) {
        ctx.stroke();
        ctx.strokeStyle = YELLOW;
        ctx.lineWidth = 5;
      } else {
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ==========================================================
  // GOLF BALL CANNON
  // ==========================================================

  private renderCannon(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 9.82) return;

    const shake = t > 13.4 ? Math.sin(t * 72) * 2.2 : 0;
    const recoil = t > 15.06 ? 38 * Math.exp(-(t - 15.06) * 6) * Math.cos((t - 15.06) * 35) : 0;
    const pivotX = 620;
    const pivotY = 1220;
    const angle = -0.906;

    ctx.save();
    ctx.translate(shake, 0);

    // Drive belt back to the cart wheel.
    if (t >= 11.96) {
      ctx.save();
      ctx.globalAlpha = clamp((t - 11.96) / 0.2, 0, 1);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(302, this.floorY - 54);
      ctx.lineTo(612, 1362);
      ctx.moveTo(306, this.floorY - 38);
      ctx.lineTo(618, 1378);
      ctx.stroke();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 12]);
      ctx.beginPath();
      ctx.moveTo(302, this.floorY - 54);
      ctx.lineTo(612, 1362);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Tripod.
    const tripodScale = popIn(t, 9.86);
    if (tripodScale > 0) {
      ctx.save();
      ctx.translate(pivotX, 1270);
      ctx.scale(tripodScale, tripodScale);
      ctx.strokeStyle = INK;
      ctx.lineCap = 'round';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-66, 186);
      ctx.moveTo(0, 0);
      ctx.lineTo(92, 188);
      ctx.moveTo(0, 0);
      ctx.lineTo(16, 190);
      ctx.stroke();
      ctx.strokeStyle = SLATE;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-66, 186);
      ctx.moveTo(0, 0);
      ctx.lineTo(92, 188);
      ctx.moveTo(0, 0);
      ctx.lineTo(16, 190);
      ctx.stroke();
      // Pivot block.
      ctx.fillStyle = SLATE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Barrel.
    const barrelScale = popIn(t, 10.06);
    if (barrelScale > 0) {
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(angle);
      ctx.scale(barrelScale, barrelScale);
      ctx.translate(-recoil, 0);

      // Breech block.
      this.rr(ctx, -46, -42, 66, 84, 12);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.stroke();

      // Barrel tube.
      this.rr(ctx, 0, -28, 136, 56, 20);
      ctx.fillStyle = SLATE;
      ctx.fill();
      ctx.stroke();

      // Bands.
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 8;
      for (const x of [28, 104]) {
        ctx.beginPath();
        ctx.moveTo(x, -25);
        ctx.lineTo(x, 25);
        ctx.stroke();
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(136, -26);
      ctx.lineTo(136, 26);
      ctx.stroke();

      // Muzzle opening.
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(136, 0, 12, 27, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Highlight.
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(18, -14);
      ctx.lineTo(112, -14);
      ctx.stroke();

      ctx.restore();
    }

    // Yellow recoil spring behind the breech.
    const springScale = popIn(t, 10.42);
    if (springScale > 0) {
      const compress = t > 15.06 ? 1 - 0.45 * Math.exp(-(t - 15.06) * 8) : 1;
      ctx.save();
      ctx.translate(582, 1294);
      ctx.scale(springScale, springScale);
      const top = -72 * compress;
      const bottom = 46;
      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        ctx.moveTo(0, bottom);
        for (let i = 0; i <= 5; i++) {
          const y = lerp(bottom, top, i / 5);
          ctx.lineTo(i % 2 === 0 ? -24 : 24, y);
        }
        if (pass === 0) {
          ctx.strokeStyle = INK;
          ctx.lineWidth = 10;
          ctx.stroke();
        } else {
          ctx.strokeStyle = YELLOW;
          ctx.lineWidth = 5;
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Orange leaf blower feeding the breech.
    const blowerScale = popIn(t, 10.98);
    if (blowerScale > 0) {
      ctx.save();
      ctx.translate(570, 1322);
      ctx.scale(blowerScale, blowerScale);
      // Hose to the breech.
      ctx.strokeStyle = INK;
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(-8, -28);
      ctx.quadraticCurveTo(18, -108, 76, -96);
      ctx.stroke();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(-8, -28);
      ctx.quadraticCurveTo(18, -108, 76, -96);
      ctx.stroke();

      this.rr(ctx, -42, -24, 74, 58, 18);
      ctx.fillStyle = ORANGE;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.stroke();

      // Fan housing.
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.arc(-18, 4, 25, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const a = t * 17 + (i * TAU) / 3;
        ctx.beginPath();
        ctx.moveTo(-18, 4);
        ctx.lineTo(-18 + Math.cos(a) * 19, 4 + Math.sin(a) * 19);
        ctx.stroke();
      }

      // Throttle handle.
      ctx.strokeStyle = INK;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(22, -24);
      ctx.lineTo(30, -54);
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(31, -58, 8, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // Red plunger.
    const plungerScale = popIn(t, 11.4);
    if (plungerScale > 0) {
      ctx.save();
      ctx.translate(660, 1204);
      ctx.scale(plungerScale, plungerScale);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, 28);
      ctx.lineTo(0, -94);
      ctx.stroke();
      ctx.fillStyle = RED;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      this.rr(ctx, -28, -118, 56, 27, 10);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Giant red lever.
    const leverScale = popIn(t, 11.7);
    if (leverScale > 0) {
      let leverAngle = -0.95;
      if (t >= 12.8) leverAngle = lerp(-0.95, -0.55, smooth((t - 12.8) / 0.25));
      if (t >= 13.4) leverAngle = lerp(-0.55, 0.08, smooth((t - 13.4) / 0.55));
      ctx.save();
      ctx.translate(706, 1274);
      ctx.scale(leverScale, leverScale);
      ctx.rotate(leverAngle);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -112);
      ctx.stroke();
      ctx.strokeStyle = RED;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -112);
      ctx.stroke();
      ctx.fillStyle = RED;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, -122, 16, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // Cannon pulley.
    if (t >= 11.96) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(615, 1370, 22, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(615, 1370, 9, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  // ==========================================================
  // CHARACTER POSITION / BASE POSE
  // ==========================================================

  private charXAt(t: number): number {
    if (t < 9.15) return 450;
    if (t < 9.45) return lerp(450, 480, smooth((t - 9.15) / 0.3));
    if (t < 27.0) return 480;
    if (t < 27.92) return lerp(480, 85, smooth((t - 27.0) / 0.92));
    return 85;
  }

  private groundAt(t: number): number {
    if (t < 9.2) return this.teeTop;
    if (t < 9.45) return lerp(this.teeTop, this.floorY, smooth((t - 9.2) / 0.25));
    return this.floorY;
  }

  private basePose(t: number): Pose {
    return {
      hipX: this.charXAt(t),
      hipY: this.groundAt(t) - 300,
      lean: 0,
      bodyRot: 0,
      jump: 0,
      squashX: 1,
      squashY: 1,
      headTilt: 0,
      leftFoot: { x: -55, y: 300 },
      rightFoot: { x: 55, y: 300 },
      leftKnee: -14,
      rightKnee: 14,
      leftHand: { x: -62, y: -40 },
      rightHand: { x: 62, y: -40 },
      leftElbow: -20,
      rightElbow: 20,
      leftHandStyle: 'relaxed',
      rightHandStyle: 'relaxed',
      eye: 'normal',
      brow: 'neutral',
      mouth: 'flat',
      gazeX: 0,
      gazeY: 0,
      pupilScale: 1,
      flush: false,
      anger: false,
      sweat: false,
      silhouette: false,
      holdClub: true,
      clubAngle: 1.58,
    };
  }

  private getPose(t: number): Pose {
    const p = this.basePose(t);
    if (t < 5) this.poseChallenge(p, t);
    else if (t < 9) this.poseMiss(p, t);
    else if (t < 15) this.poseEngineer(p, t);
    else if (t < 22) this.poseShot(p, t);
    else if (t < 26) this.poseSpring(p, t);
    else this.posePayoff(p, t);
    return p;
  }

  // ==========================================================
  // POSES
  // ==========================================================

  private poseChallenge(p: Pose, t: number) {
    p.gazeX = 0.72;
    p.gazeY = -0.45;
    p.mouth = 'smirk';
    p.brow = 'oneRaised';
    p.hipY += Math.sin(t * 2.1) * 2;

    // Idle confidence.
    if (t < 0.9) {
      p.rightHand = { x: 72, y: -54 };
      p.leftHand = { x: -58, y: -42 };
      p.clubAngle = 1.56;
      return;
    }

    // Point across the water at the tiny island.
    if (t < 1.62) {
      p.leftHand = { x: 182, y: -184 };
      p.leftElbow = 5;
      p.leftHandStyle = 'point';
      p.rightHand = { x: 70, y: -48 };
      p.headTilt = 0.06;
      p.lean = 0.02;
      p.mouth = 'smirk';
      p.brow = 'determined';
      p.gazeX = 0.9;
      p.gazeY = -0.4;
      return;
    }

    // Hold the point and give one confident nod.
    if (t < 1.95) {
      p.leftHand = { x: 182, y: -184 };
      p.leftElbow = 5;
      p.leftHandStyle = 'point';
      p.rightHand = { x: 70, y: -48 };
      p.headTilt = 0.06 - Math.sin((t - 1.62) * Math.PI * 2) * 0.07;
      p.lean = 0.02;
      p.mouth = 'smirk';
      p.brow = 'oneRaised';
      return;
    }

    // Bring the club up across the shoulder.
    if (t < 2.5) {
      const u = smooth((t - 1.95) / 0.3);
      p.rightHand = { x: lerp(70, 96, u), y: lerp(-48, -300, u) };
      p.leftHand = { x: lerp(-58, 52, u), y: lerp(-42, -264, u) };
      p.rightElbow = 28;
      p.leftElbow = 26;
      p.clubAngle = lerp(1.56, -2.48, u);
      p.lean = -0.04;
      p.brow = 'determined';
      p.mouth = 'flat';
      p.gazeX = 0.5;
      p.gazeY = 0.2;
      return;
    }

    // Two practice waggles over the ball.
    if (t < 3.7) {
      const phase = t < 3.1 ? (t - 2.5) / 0.6 : (t - 3.1) / 0.6;
      const wobble = Math.sin(phase * Math.PI * 2);
      p.rightHand = { x: 64 + wobble * 8, y: -56 + Math.abs(wobble) * 7 };
      p.leftHand = { x: 32 + wobble * 5, y: -58 };
      p.rightElbow = 20;
      p.leftElbow = 22;
      p.clubAngle = 1.58 + wobble * 0.12;
      p.lean = 0.06;
      p.headTilt = 0.12;
      p.gazeX = 0.5;
      p.gazeY = 0.9;
      p.brow = 'determined';
      p.mouth = 'flat';
      p.eye = 'normal';
      return;
    }

    // Set the stance and stare the shot down.
    p.leftFoot = { x: -67, y: 300 };
    p.rightFoot = { x: 70, y: 300 };
    p.leftKnee = -20;
    p.rightKnee = 22;
    p.lean = 0.1;
    p.rightHand = { x: 58, y: -52 + Math.sin(t * 2.6) * 1.5 };
    p.leftHand = { x: 28, y: -62 };
    p.rightElbow = 18;
    p.leftElbow = 24;
    p.clubAngle = 1.6;
    p.headTilt = t > 4.35 ? 0.17 : 0.12;
    p.gazeX = 0.55;
    p.gazeY = 1;
    p.brow = t > 4.35 ? 'angry' : 'determined';
    p.mouth = 'grit';
    p.eye = 'squint';
    if (t > 4.35) {
      p.pupilScale = 0.8;
      p.lean = 0.12;
    }
  }

  private poseMiss(p: Pose, t: number) {
    // Wind-up.
    if (t < 5.55) {
      const u = smooth((t - 5.0) / 0.55);
      p.rightHand = { x: lerp(58, 96, u), y: lerp(-52, -324, u) };
      p.leftHand = { x: lerp(28, 58, u), y: lerp(-62, -290, u) };
      p.rightElbow = 30;
      p.leftElbow = 30;
      p.clubAngle = lerp(1.6, -2.55, u);
      p.lean = -0.14;
      p.headTilt = 0.1;
      p.gazeX = 0.55;
      p.gazeY = 1;
      p.eye = 'squint';
      p.brow = 'determined';
      p.mouth = 'grit';
      p.leftFoot = { x: -70, y: 300 };
      p.rightFoot = { x: 72, y: 300 };
      return;
    }

    // The enormous swing: the clubhead skims just over the ball.
    if (t < 5.85) {
      const u = smooth((t - 5.55) / 0.3);
      p.rightHand = { x: lerp(96, 215, u), y: lerp(-324, -80, u) };
      p.leftHand = { x: lerp(58, 165, u), y: lerp(-290, -74, u) };
      p.rightElbow = 8;
      p.leftElbow = 12;
      p.clubAngle = lerp(-2.55, 2.04, u);
      p.lean = lerp(-0.14, 0.2, u);
      p.headTilt = 0.02;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'open';
      p.gazeX = 0.8;
      p.gazeY = 1;
      return;
    }

    // Frozen follow-through: the club went straight past the ball.
    if (t < 6.1) {
      p.rightHand = { x: 238, y: -158 };
      p.leftHand = { x: 188, y: -150 };
      p.rightElbow = 12;
      p.leftElbow = 18;
      p.clubAngle = 1.42;
      p.lean = 0.09;
      p.headTilt = -0.04;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeX = 0.6;
      p.gazeY = 0.9;
      return;
    }

    // Exactly three spins, with the club slipping out at 6.25s.
    if (t < 7.4) {
      const u = smooth((t - 6.1) / 1.3);
      p.bodyRot = -TAU * 3 * u;
      p.jump = Math.sin(clamp((t - 6.1) / 1.3, 0, 1) * Math.PI) * 148;
      p.leftFoot = { x: -34, y: 205 };
      p.rightFoot = { x: 36, y: 205 };
      p.leftKnee = 30;
      p.rightKnee = -30;
      p.leftHand = { x: -146, y: -186 };
      p.rightHand = { x: 154, y: -190 };
      p.leftElbow = -18;
      p.rightElbow = 20;
      p.leftHandStyle = 'open';
      p.rightHandStyle = 'open';
      p.eye = t < 6.45 ? 'wide' : 'cross';
      p.brow = 'raised';
      p.mouth = 'open';
      p.holdClub = t < 6.25;
      p.clubAngle = -0.3;
      p.gazeX = 0.3;
      p.gazeY = -0.2;
      return;
    }

    // Dizzy wobble.
    if (t < 7.9) {
      p.bodyRot = 0;
      p.hipY += Math.sin(t * 11) * 3;
      p.lean = Math.sin(t * 8) * 0.09;
      p.headTilt = Math.sin(t * 9) * 0.14;
      p.leftFoot = { x: -78, y: 300 };
      p.rightFoot = { x: 78, y: 300 };
      p.leftHand = { x: -122, y: -96 };
      p.rightHand = { x: 120, y: -92 };
      p.leftElbow = -22;
      p.rightElbow = 22;
      p.eye = 'cross';
      p.brow = 'raised';
      p.mouth = 'wobble';
      p.holdClub = false;
      p.sweat = true;
      return;
    }

    // Look at the still ball.
    if (t < 8.4) {
      p.headTilt = 0.2;
      p.gazeX = 0.6;
      p.gazeY = 0.95;
      p.leftFoot = { x: -62, y: 300 };
      p.rightFoot = { x: 62, y: 300 };
      p.leftHand = { x: -86, y: -84 };
      p.rightHand = { x: 88, y: -82 };
      p.leftElbow = -18;
      p.rightElbow = 18;
      p.eye = 'wide';
      p.brow = 'oneRaised';
      p.mouth = 'flat';
      p.holdClub = false;
      p.sweat = true;
      return;
    }

    // Empty hands. Mounting rage.
    p.lean = 0.13;
    p.headTilt = 0.02;
    p.leftFoot = { x: -60, y: 300 };
    p.rightFoot = { x: 60, y: 300 };
    p.leftHand = { x: -62, y: -76 };
    p.rightHand = { x: 62, y: -76 };
    p.leftElbow = -30;
    p.rightElbow = 30;
    p.leftHandStyle = 'fist';
    p.rightHandStyle = 'fist';
    p.eye = 'squint';
    p.brow = 'angry';
    p.mouth = 'grit';
    p.flush = true;
    p.anger = true;
    p.holdClub = false;
    p.gazeX = 0.4;
    p.gazeY = 0.4;
  }

  private poseEngineer(p: Pose, t: number) {
    p.holdClub = false;
    p.gazeX = 0.7;
    p.gazeY = 0.3;

    // Rage stomp and march to the cart.
    if (t < 9.45) {
      const march = Math.sin((t - 9.0) * 15);
      p.leftFoot = { x: -55 - march * 22, y: 300 - Math.max(0, march) * 22 };
      p.rightFoot = { x: 55 + march * 22, y: 300 - Math.max(0, -march) * 22 };
      p.leftHand = { x: -70 - march * 26, y: -66 };
      p.rightHand = { x: 70 + march * 26, y: -66 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
      p.lean = 0.12;
      p.eye = 'squint';
      p.brow = 'angry';
      p.mouth = 'grit';
      p.flush = true;
      p.anger = t < 9.2;
      return;
    }

    // Crack the knuckles.
    if (t < 9.9) {
      const u = smooth((t - 9.45) / 0.3);
      p.rightHand = { x: lerp(64, 94, u), y: -118 };
      p.leftHand = { x: lerp(-64, -8, u), y: -116 };
      p.rightElbow = 28;
      p.leftElbow = -28;
      p.lean = 0.06;
      p.headTilt = 0.08;
      p.gazeX = 0.5;
      p.gazeY = 0.5;
      p.brow = 'determined';
      p.mouth = 'smirk';
      p.eye = 'normal';
      return;
    }

    // Drop the tripod and heave the barrel up.
    if (t < 10.5) {
      const u = (t - 9.9) / 0.6;
      const lift = Math.sin(clamp(u, 0, 1) * Math.PI);
      p.rightHand = { x: 130, y: -120 - lift * 170 };
      p.leftHand = { x: 96, y: -116 - lift * 160 };
      p.rightElbow = 22;
      p.leftElbow = 26;
      p.lean = -0.06 + lift * 0.1;
      p.headTilt = -0.06;
      p.gazeX = 0.7;
      p.gazeY = -0.4;
      p.brow = 'determined';
      p.mouth = 'grit';
      p.eye = 'squint';
      return;
    }

    // Bolt the leaf blower onto the breech.
    if (t < 11.1) {
      const shove = Math.sin((t - 10.5) * 22) * 8;
      p.rightHand = { x: 152 + shove, y: -98 };
      p.leftHand = { x: -44, y: -116 };
      p.rightElbow = 14;
      p.leftElbow = -24;
      p.lean = 0.1;
      p.headTilt = 0.1;
      p.gazeX = 0.85;
      p.gazeY = 0.55;
      p.brow = 'determined';
      p.mouth = 'grit';
      p.eye = 'squint';
      return;
    }

    // Snap the plunger and hose together.
    if (t < 11.7) {
      const push = smooth((t - 11.1) / 0.22);
      p.rightHand = { x: 150 + push * 24, y: -162 };
      p.leftHand = { x: 112 + push * 22, y: -154 };
      p.rightElbow = 12;
      p.leftElbow = 18;
      p.lean = 0.13;
      p.headTilt = 0.06;
      p.gazeX = 0.7;
      p.gazeY = 0.5;
      p.brow = 'determined';
      p.mouth = 'grit';
      p.eye = 'squint';
      return;
    }

    // Run the drive belt.
    if (t < 12.2) {
      p.rightHand = { x: 170, y: -50 };
      p.leftHand = { x: 112, y: -70 };
      p.rightElbow = 10;
      p.leftElbow = 24;
      p.lean = 0.19;
      p.leftFoot = { x: -74, y: 300 };
      p.rightFoot = { x: 76, y: 300 };
      p.headTilt = 0.14;
      p.gazeX = 0.6;
      p.gazeY = 0.75;
      p.brow = 'determined';
      p.mouth = 'grit';
      p.eye = 'squint';
      return;
    }

    // Load the ball into the muzzle.
    if (t < 12.8) {
      const u = smooth((t - 12.2) / 0.35);
      p.rightHand = { x: lerp(120, 196, u), y: lerp(-150, -278, u) };
      p.leftHand = { x: lerp(94, 140, u), y: lerp(-130, -226, u) };
      p.rightElbow = 14;
      p.leftElbow = 20;
      p.lean = lerp(0.08, -0.04, u);
      p.headTilt = -0.06;
      p.gazeX = 0.75;
      p.gazeY = -0.7;
      p.brow = 'determined';
      p.mouth = 'grit';
      p.eye = 'squint';
      return;
    }

    // Grab the giant lever with one hand and brace on the breech.
    if (t < 13.4) {
      p.rightHand = { x: 162, y: 10 };
      p.leftHand = { x: 130, y: 40 };
      p.rightElbow = 22;
      p.leftElbow = 18;
      p.lean = 0.12;
      p.leftFoot = { x: -76, y: 300 };
      p.rightFoot = { x: 78, y: 300 };
      p.headTilt = 0.06;
      p.gazeX = 0.7;
      p.gazeY = 0.25;
      p.brow = 'determined';
      p.mouth = 'grit';
      p.eye = 'squint';
      return;
    }

    // Haul the lever down.
    if (t < 14.0) {
      const u = smooth((t - 13.4) / 0.55);
      p.rightHand = { x: lerp(162, 236, u), y: lerp(10, -8, u) };
      p.leftHand = { x: 130, y: 40 };
      p.rightElbow = 18;
      p.leftElbow = 18;
      p.lean = lerp(0.12, -0.06, u);
      p.leftFoot = { x: -80, y: 300 };
      p.rightFoot = { x: 82, y: 300 };
      p.headTilt = 0.06;
      p.gazeX = 0.7;
      p.gazeY = 0.5;
      p.brow = 'angry';
      p.mouth = 'grit';
      p.eye = 'squint';
      return;
    }

    // Brace for the blast.
    p.rightHand = { x: 62, y: -354 };
    p.leftHand = { x: -62, y: -354 };
    p.rightElbow = -12;
    p.leftElbow = 12;
    p.lean = 0.08;
    p.leftFoot = { x: -72, y: 300 };
    p.rightFoot = { x: 74, y: 300 };
    p.leftKnee = -22;
    p.rightKnee = 24;
    p.squashX = 1.04;
    p.squashY = 0.94;
    p.headTilt = 0.02;
    p.eye = 'closed';
    p.brow = 'determined';
    p.mouth = 'grit';
    p.sweat = true;
    p.anger = true;
  }

  private poseShot(p: Pose, t: number) {
    p.holdClub = false;

    // Cannon recoil knocks him backwards.
    if (t < 15.3) {
      const u = clamp((t - 15.0) / 0.3, 0, 1);
      p.lean = -0.26 * Math.sin(u * Math.PI);
      p.leftHand = { x: -142, y: -188 };
      p.rightHand = { x: 138, y: -172 };
      p.leftElbow = -22;
      p.rightElbow = 26;
      p.leftFoot = { x: -84, y: 300 };
      p.rightFoot = { x: 86, y: 300 };
      p.headTilt = -0.12;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'open';
      p.gazeX = 0.9;
      p.gazeY = -0.3;
      return;
    }

    // Track the ball.
    if (t < 16.1) {
      p.headTilt = 0.12;
      p.gazeX = 0.92;
      p.gazeY = -0.55;
      p.rightHand = { x: 116, y: -248 };
      p.rightHandStyle = 'point';
      p.rightElbow = 8;
      p.leftHand = { x: -60, y: -110 };
      p.lean = 0.08;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      return;
    }

    // Buoy boing: a little sympathy hop.
    if (t < 16.4) {
      p.headTilt = 0.1;
      p.gazeX = 0.9;
      p.gazeY = -0.6;
      p.rightHand = { x: 110, y: -250 };
      p.leftHand = { x: -74, y: -96 };
      p.jump = 18 * Math.exp(-(t - 16.12) * 9);
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      return;
    }

    // Follow the ball up toward the windmill.
    if (t < 17.6) {
      p.headTilt = -0.16;
      p.gazeX = 0.9;
      p.gazeY = -0.9;
      p.rightHand = { x: 88, y: -274 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -48, y: -144 };
      p.lean = -0.03;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      return;
    }

    // Through the windmill and around the loop.
    if (t < 20.5) {
      const sweep = Math.sin((t - 17.6) * 1.4);
      p.headTilt = -0.2 + sweep * 0.1;
      p.gazeX = 0.55 + sweep * 0.3;
      p.gazeY = -1;
      p.rightHand = { x: 48, y: -186 };
      p.leftHand = { x: -48, y: -186 };
      p.rightElbow = 28;
      p.leftElbow = -28;
      p.lean = -0.04 + sweep * 0.05;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'open';
      p.pupilScale = 0.75;
      return;
    }

    // The ball drops in. Total disbelief.
    if (t < 21.1) {
      p.headTilt = -0.04;
      p.gazeX = 0.75;
      p.gazeY = -0.35;
      p.rightHand = { x: 100, y: -132 };
      p.leftHand = { x: -100, y: -130 };
      p.leftElbow = -20;
      p.rightElbow = 20;
      p.eye = 'stunned';
      p.brow = 'raised';
      p.mouth = 'o';
      p.pupilScale = 0.65;
      p.lean = 0;
      return;
    }

    // Wild celebration.
    const u = t - 21.1;
    p.jump = Math.abs(Math.sin(u * 7.2)) * 62;
    p.lean = Math.sin(u * 7.2) * 0.06;
    const pump = Math.sin(u * 7.2);
    p.rightHand = { x: 76 + pump * 18, y: -322 - Math.max(0, pump) * 26 };
    p.leftHand = { x: -76 + pump * 18, y: -302 - Math.max(0, -pump) * 26 };
    p.rightElbow = 8;
    p.leftElbow = -8;
    p.rightHandStyle = 'fist';
    p.leftHandStyle = 'fist';
    p.headTilt = -0.06 + pump * 0.05;
    p.gazeX = 0;
    p.gazeY = -0.1;
    p.eye = 'happy';
    p.brow = 'raised';
    p.mouth = 'scream';
    p.flush = true;
  }

  private poseSpring(p: Pose, t: number) {
    p.holdClub = false;

    // The celebration keeps going, then stops dead mid-jump.
    if (t < 23.4) {
      const air = t < 22.9 ? Math.abs(Math.sin((t - 22.0) * 7)) * 48 : 48;
      p.jump = air;
      p.rightHand = { x: 86, y: -328 };
      p.leftHand = { x: -86, y: -328 };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.rightElbow = 4;
      p.leftElbow = -4;
      p.headTilt = -0.04;
      p.gazeX = 0.2;
      p.gazeY = -0.5;
      p.eye = t < 22.9 ? 'happy' : 'wide';
      p.brow = t < 22.9 ? 'raised' : 'oneRaised';
      p.mouth = t < 22.9 ? 'grin' : 'open';
      p.flush = true;
      return;
    }

    // He hangs there while the island starts to rise.
    if (t < 24.1) {
      const u = smooth((t - 23.4) / 0.7);
      p.jump = 48 - u * 18;
      p.rightHand = { x: lerp(86, 112, u), y: lerp(-328, -238, u) };
      p.leftHand = { x: lerp(-86, -108, u), y: lerp(-328, -230, u) };
      p.rightElbow = 10;
      p.leftElbow = -10;
      p.headTilt = 0.14;
      p.gazeX = 0.9;
      p.gazeY = -0.8;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'open';
      p.pupilScale = 0.7;
      return;
    }

    // Land and grab his head.
    if (t < 24.8) {
      const u = smooth((t - 24.1) / 0.7);
      p.jump = 0;
      p.squashY = 1 - Math.sin(u * Math.PI) * 0.08;
      p.rightHand = { x: lerp(112, 42, u), y: lerp(-238, -374, u) };
      p.leftHand = { x: lerp(-108, -42, u), y: lerp(-230, -374, u) };
      p.rightElbow = 18;
      p.leftElbow = -18;
      p.headTilt = 0.14;
      p.gazeX = 0.8;
      p.gazeY = -0.8;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'open';
      p.sweat = true;
      return;
    }

    // Horrified hands-on-head freeze.
    p.rightHand = { x: 44 + Math.sin(t * 18) * 1.5, y: -378 };
    p.leftHand = { x: -44 + Math.sin(t * 18) * 1.5, y: -378 };
    p.rightElbow = 20;
    p.leftElbow = -20;
    p.headTilt = 0.16 + Math.sin(t * 2.2) * 0.02;
    p.gazeX = 0.9;
    p.gazeY = -0.8;
    p.eye = 'wide';
    p.brow = 'raised';
    p.mouth = t > 25.2 ? 'wobble' : 'open';
    p.sweat = true;
    p.lean = -0.04;
  }

  private posePayoff(p: Pose, t: number) {
    p.holdClub = false;

    // The island hits the pool. He is still holding his head.
    if (t < 27.0) {
      if (t < 26.35) {
        p.jump = 16 * Math.exp(-(t - 26.02) * 12);
      }
      // The surge reaches him at 26.95. His arms fly out over the last few
      // frames so the launch pose does not pop on the cut.
      const u = smooth((t - 26.84) / 0.16);
      p.rightHand = { x: lerp(44, 158, u), y: lerp(-378, -194, u) };
      p.leftHand = { x: lerp(-44, -152, u), y: lerp(-378, -190, u) };
      p.rightElbow = lerp(20, 22, u);
      p.leftElbow = lerp(-20, -22, u);
      p.leftHandStyle = u > 0.5 ? 'open' : 'relaxed';
      p.rightHandStyle = u > 0.5 ? 'open' : 'relaxed';
      p.headTilt = lerp(0.18, 0, u);
      p.gazeX = lerp(0.9, 0.2, u);
      p.gazeY = lerp(-0.7, -0.4, u);
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'scream';
      p.sweat = true;
      p.anger = u < 0.4;
      return;
    }

    // The wave hits. Launch.
    if (t < 27.92) {
      const keys = [
        { t: 27.0, x: 480, y: 1160 },
        { t: 27.18, x: 470, y: 1040 },
        { t: 27.38, x: 430, y: 900 },
        { t: 27.58, x: 330, y: 780 },
        { t: 27.76, x: 205, y: 902 },
        { t: 27.92, x: 85, y: 1282 },
      ];
      const pos = this.pathPoint(keys, t);
      p.hipX = pos.x;
      p.hipY = pos.y;
      p.bodyRot = -TAU * smooth((t - 27.0) / 0.92);
      p.leftFoot = { x: -118, y: 214 };
      p.rightFoot = { x: 122, y: 220 };
      p.leftKnee = 42;
      p.rightKnee = -42;
      p.leftHand = { x: -152, y: -190 };
      p.rightHand = { x: 158, y: -194 };
      p.leftElbow = -22;
      p.rightElbow = 22;
      p.leftHandStyle = 'open';
      p.rightHandStyle = 'open';
      p.headTilt = Math.sin(t * 17) * 0.12;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'scream';
      p.sweat = true;
      return;
    }

    // Crashed into the cart basket.
    if (t < 28.12) {
      p.hipX = 85;
      p.hipY = 1282;
      p.bodyRot = 0;
      p.leftFoot = { x: -36, y: 82 };
      p.rightFoot = { x: 38, y: 84 };
      p.leftKnee = 46;
      p.rightKnee = -46;
      p.leftHand = { x: -66, y: -188 };
      p.rightHand = { x: 66, y: -188 };
      p.leftElbow = -12;
      p.rightElbow = 12;
      p.squashX = 1.12;
      p.squashY = 0.86;
      p.headTilt = -0.12;
      p.gazeX = 0;
      p.gazeY = 0;
      p.eye = 'cross';
      p.brow = 'raised';
      p.mouth = 'o';
      p.anger = false;
      return;
    }

    // Pop up dazed.
    if (t < 28.42) {
      p.hipX = 85;
      p.hipY = 1264;
      p.leftFoot = { x: -32, y: 82 };
      p.rightFoot = { x: 34, y: 84 };
      p.leftKnee = 40;
      p.rightKnee = -40;
      p.rightHand = { x: 46, y: -98 };
      p.leftHand = { x: -46, y: -96 };
      p.rightElbow = 18;
      p.leftElbow = -18;
      p.headTilt = Math.sin((t - 28.12) * 22) * 0.11;
      p.eye = 'cross';
      p.brow = 'raised';
      p.mouth = 'wobble';
      p.sweat = true;
      return;
    }

    // Proud champion finger.
    if (t < 29.02) {
      const u = smooth((t - 28.42) / 0.3);
      p.hipX = 85;
      p.hipY = 1262;
      p.leftFoot = { x: -30, y: 80 };
      p.rightFoot = { x: 32, y: 82 };
      p.leftKnee = 36;
      p.rightKnee = -36;
      p.rightHand = { x: lerp(46, 150, u), y: lerp(-98, -410, u) };
      p.rightElbow = -8;
      p.rightHandStyle = 'point';
      p.leftHand = { x: -44, y: -112 };
      p.leftElbow = -12;
      p.headTilt = -0.1;
      p.gazeX = 0;
      p.gazeY = 0;
      p.eye = 'happy';
      p.brow = 'oneRaised';
      p.mouth = 'grin';
      p.flush = true;
      return;
    }

    // Tiny bonk.
    if (t < 29.16) {
      p.hipX = 85;
      p.hipY = 1262;
      p.leftFoot = { x: -30, y: 80 };
      p.rightFoot = { x: 32, y: 82 };
      p.leftKnee = 36;
      p.rightKnee = -36;
      p.rightHand = { x: 150, y: -410 };
      p.rightHandStyle = 'point';
      p.leftHand = { x: -44, y: -112 };
      p.squashX = 1.08;
      p.squashY = 0.88;
      p.headTilt = 0.14;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'open';
      return;
    }

    // Collapse into the basket, furious.
    if (t < 29.4) {
      const u = smooth((t - 29.16) / 0.24);
      p.hipX = 85;
      p.hipY = lerp(1262, 1320, u);
      p.leftFoot = { x: -30, y: lerp(80, 44, u) };
      p.rightFoot = { x: 32, y: lerp(82, 46, u) };
      p.leftKnee = 36;
      p.rightKnee = -36;
      p.rightHand = { x: lerp(150, 20, u), y: lerp(-410, -148, u) };
      p.leftHand = { x: -20, y: -148 };
      p.rightElbow = 22;
      p.leftElbow = -22;
      p.headTilt = lerp(0.14, 0.22, u);
      p.eye = 'cross';
      p.brow = 'angry';
      p.mouth = 'flat';
      p.flush = true;
      return;
    }

    // The frozen deadpan.
    p.hipX = 85;
    p.hipY = 1320;
    p.leftFoot = { x: -30, y: 44 };
    p.rightFoot = { x: 32, y: 46 };
    p.leftKnee = 36;
    p.rightKnee = -36;
    p.rightHand = { x: 20, y: -148 };
    p.leftHand = { x: -20, y: -148 };
    p.rightElbow = 22;
    p.leftElbow = -22;
    p.headTilt = 0.2;
    p.eye = 'squint';
    p.brow = 'angry';
    p.mouth = 'flat';
    p.flush = true;
    p.gazeX = 0;
    p.gazeY = 0;
  }

  // ==========================================================
  // STICKMAN
  // ==========================================================

  private renderStickman(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    // Contact shadow (skip it while he is flying over the course).
    if (t < 27.0) {
      const ground = this.groundAt(t);
      const lift = Math.max(0, pose.jump);
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.ellipse(
        pose.hipX,
        ground + 9,
        Math.max(34, 92 - lift * 0.22),
        Math.max(6, 15 - lift * 0.03),
        0,
        0,
        TAU
      );
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const trembleX = pose.anger ? Math.sin(t * 43) * 3.2 : 0;
    const trembleY = pose.anger ? Math.cos(t * 37) * 2.2 : 0;

    ctx.translate(pose.hipX + trembleX, pose.hipY - pose.jump + trembleY);
    ctx.rotate(pose.lean + pose.bodyRot);
    ctx.scale(pose.squashX, pose.squashY);

    // Legs.
    const leftKnee = this.drawLimb(ctx, { x: 0, y: 0 }, pose.leftFoot, pose.leftKnee, 12);
    const rightKnee = this.drawLimb(ctx, { x: 0, y: 0 }, pose.rightFoot, pose.rightKnee, 12);
    this.drawFoot(ctx, pose.leftFoot, leftKnee, -1);
    this.drawFoot(ctx, pose.rightFoot, rightKnee, 1);

    // Torso.
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -220);
    ctx.stroke();

    // Arms.
    const leftElbow = this.drawLimb(ctx, { x: 0, y: -220 }, pose.leftHand, pose.leftElbow, 11);
    const rightElbow = this.drawLimb(ctx, { x: 0, y: -220 }, pose.rightHand, pose.rightElbow, 11);
    this.drawHand(ctx, pose.leftHand, leftElbow, pose.leftHandStyle);
    this.drawHand(ctx, pose.rightHand, rightElbow, pose.rightHandStyle);

    if (pose.holdClub) {
      this.drawClubLocal(ctx, pose.rightHand.x, pose.rightHand.y, pose.clubAngle);
    }

    // Neck and head.
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, -220);
    ctx.lineTo(0, -270);
    ctx.stroke();

    ctx.save();
    ctx.translate(0, -334);
    ctx.rotate(pose.headTilt);

    ctx.fillStyle = pose.silhouette ? INK : WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (!pose.silhouette) this.drawFace(ctx, pose, t);
    ctx.restore();
    ctx.restore();
  }

  private drawFace(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    const eyeX = 26;
    const eyeY = -4;

    // Flushed cheeks, for the celebration and the final fury.
    if (pose.flush) {
      ctx.fillStyle = 'rgba(248, 113, 113, 0.38)';
      ctx.beginPath();
      ctx.ellipse(-42, 18, 15, 9, 0, 0, TAU);
      ctx.ellipse(42, 18, 15, 9, 0, 0, TAU);
      ctx.fill();
    }

    // Brows.
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineWidth = 6;
    const brow = (side: -1 | 1, y: number, kind: BrowStyle) => {
      const x = side * eyeX;
      ctx.beginPath();
      if (kind === 'angry') {
        ctx.moveTo(x - side * 15, y + 5);
        ctx.lineTo(x + side * 12, y - 8);
      } else if (kind === 'determined') {
        ctx.moveTo(x - side * 14, y + 3);
        ctx.lineTo(x + side * 12, y - 6);
      } else if (kind === 'raised') {
        ctx.arc(x, y + 6, 14, Math.PI * 1.15, Math.PI * 1.85);
      } else if (kind === 'sad') {
        ctx.moveTo(x - side * 14, y - 5);
        ctx.lineTo(x + side * 12, y + 4);
      } else if (kind === 'oneRaised') {
        if (side === -1) {
          ctx.moveTo(x - 13, y);
          ctx.lineTo(x + 13, y);
        } else {
          ctx.arc(x, y + 4, 13, Math.PI * 1.15, Math.PI * 1.85);
        }
      } else {
        ctx.moveTo(x - 14, y);
        ctx.lineTo(x + 14, y);
      }
      ctx.stroke();
    };
    brow(-1, -34, pose.brow);
    brow(1, -34, pose.brow);

    // Eyes.
    for (const side of [-1, 1] as const) {
      const x = side * eyeX;
      if (pose.eye === 'happy') {
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, eyeY + 4, 10, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        continue;
      }
      if (pose.eye === 'closed') {
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x - 10, eyeY);
        ctx.lineTo(x + 10, eyeY);
        ctx.stroke();
        continue;
      }
      if (pose.eye === 'cross') {
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - 8, eyeY - 8);
        ctx.lineTo(x + 8, eyeY + 8);
        ctx.moveTo(x + 8, eyeY - 8);
        ctx.lineTo(x - 8, eyeY + 8);
        ctx.stroke();
        continue;
      }

      const whiteR = pose.eye === 'wide' ? 13 : pose.eye === 'stunned' ? 12 : pose.eye === 'squint' ? 9 : 9;
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(x, eyeY, whiteR, 0, TAU);
      ctx.fill();
      ctx.stroke();

      let pupilR = 5 * pose.pupilScale;
      if (pose.eye === 'wide') pupilR = 4.5;
      if (pose.eye === 'stunned') pupilR = 2.6;
      const px = x + pose.gazeX * (whiteR - pupilR - 1.5);
      const py = eyeY + pose.gazeY * (whiteR - pupilR - 1.5);
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1.6, pupilR), 0, TAU);
      ctx.fill();

      if (pose.eye === 'squint') {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - side * 11, eyeY - 9);
        ctx.lineTo(x + side * 11, eyeY - 2);
        ctx.stroke();
      }
    }

    // Mouth.
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = 5;
    const my = 34;
    if (pose.mouth === 'flat') {
      ctx.beginPath();
      ctx.moveTo(-14, my);
      ctx.lineTo(14, my);
      ctx.stroke();
    } else if (pose.mouth === 'smirk') {
      ctx.beginPath();
      ctx.moveTo(-14, my);
      ctx.quadraticCurveTo(2, my + 6, 16, my - 8);
      ctx.stroke();
    } else if (pose.mouth === 'grin') {
      ctx.beginPath();
      ctx.moveTo(-20, my - 4);
      ctx.quadraticCurveTo(0, my + 18, 20, my - 4);
      ctx.closePath();
      ctx.fill();
    } else if (pose.mouth === 'open') {
      ctx.beginPath();
      ctx.ellipse(0, my + 4, 12, 15, 0, 0, TAU);
      ctx.fill();
    } else if (pose.mouth === 'o') {
      ctx.beginPath();
      ctx.ellipse(0, my + 2, 8, 10, 0, 0, TAU);
      ctx.fill();
    } else if (pose.mouth === 'grit') {
      ctx.beginPath();
      ctx.rect(-18, my - 6, 36, 13);
      ctx.fill();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 2.5;
      for (const dx of [-9, 0, 9]) {
        ctx.beginPath();
        ctx.moveTo(dx, my - 6);
        ctx.lineTo(dx, my + 7);
        ctx.stroke();
      }
    } else if (pose.mouth === 'wobble') {
      ctx.beginPath();
      ctx.moveTo(-16, my);
      ctx.quadraticCurveTo(-8, my - 6, 0, my);
      ctx.quadraticCurveTo(8, my + 6, 16, my);
      ctx.stroke();
    } else if (pose.mouth === 'scream') {
      ctx.beginPath();
      ctx.ellipse(0, my + 8, 16, 22, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.ellipse(0, my + 20, 8, 6, 0, 0, TAU);
      ctx.fill();
    }

    if (pose.sweat) {
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      for (const [dx, dy, s] of [
        [58, -34, 1],
        [-62, -20, 0.8],
      ] as const) {
        ctx.beginPath();
        ctx.ellipse(dx, dy + Math.sin(t * 8 + dx) * 4, 5 * s, 8 * s, 0.3, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  private drawLimb(
    ctx: CanvasRenderingContext2D,
    start: Vec,
    end: Vec,
    bend: number,
    width: number
  ): Vec {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy) || 1;
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const joint = { x: midX + (-dy / len) * bend, y: midY + (dx / len) * bend };

    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(joint.x, joint.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    return joint;
  }

  private drawFoot(ctx: CanvasRenderingContext2D, foot: Vec, knee: Vec, side: -1 | 1) {
    const dir = side >= 0 ? 1 : -1;
    const fold = Math.abs(foot.x) > 70 ? 10 : 0;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(foot.x - knee.x > 0 ? foot.x - 8 : foot.x + 8, foot.y);
    ctx.lineTo(foot.x + dir * (20 + fold), foot.y + 2);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(foot.x + dir * 4, foot.y + 2);
    ctx.lineTo(foot.x - dir * 6, foot.y + 8);
    ctx.stroke();
  }

  private drawHand(
    ctx: CanvasRenderingContext2D,
    hand: Vec,
    elbow: Vec,
    style: HandStyle
  ) {
    const angle = Math.atan2(hand.y - elbow.y, hand.x - elbow.x);
    ctx.save();
    ctx.translate(hand.x, hand.y);
    ctx.rotate(angle);
    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';

    if (style === 'fist') {
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, TAU);
      ctx.fill();
    } else if (style === 'point') {
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(24, 0);
      ctx.stroke();
    } else if (style === 'open') {
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 4;
      for (const a of [-0.5, 0, 0.5]) {
        ctx.beginPath();
        ctx.moveTo(2, 0);
        ctx.lineTo(18 * Math.cos(a), 18 * Math.sin(a));
        ctx.stroke();
      }
    } else if (style === 'thumb') {
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-2, -6);
      ctx.lineTo(-6, -24);
      ctx.stroke();
    } else if (style === 'hold') {
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, TAU);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawClubLocal(
    ctx: CanvasRenderingContext2D,
    gripX: number,
    gripY: number,
    angle: number
  ) {
    ctx.save();
    ctx.translate(gripX, gripY);
    ctx.rotate(angle);
    ctx.lineCap = 'round';

    // Shaft.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(318, 0);
    ctx.stroke();
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(318, 0);
    ctx.stroke();

    // Grip tape.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(46, 0);
    ctx.stroke();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(46, 0);
    ctx.stroke();

    // Iron head.
    ctx.translate(318, 0);
    ctx.rotate(0.08);
    ctx.beginPath();
    ctx.moveTo(-14, -9);
    ctx.quadraticCurveTo(26, -28, 45, -5);
    ctx.lineTo(40, 16);
    ctx.quadraticCurveTo(10, 22, -12, 8);
    ctx.closePath();
    ctx.fillStyle = SLATE;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(28, -12);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================
  // BALL + CLUB
  // ==========================================================

  private ballFlight = [
    { t: 15.06, x: 700, y: 1118 },
    { t: 15.28, x: 798, y: 1044 },
    { t: 15.62, x: 858, y: 1074 },
    { t: 16.12, x: 900, y: 1262 },
    { t: 16.34, x: 952, y: 1206 },
    { t: 16.9, x: 1062, y: 1082 },
    { t: 17.62, x: 1210, y: 880 },
    { t: 18.0, x: 1302, y: 758 },
    { t: 18.55, x: 1268, y: 612 },
    { t: 19.1, x: 1130, y: 602 },
    { t: 19.65, x: 1032, y: 742 },
    { t: 20.1, x: 962, y: 930 },
    { t: 20.5, x: 848, y: 1150 },
  ];

  private pathPoint(keys: { t: number; x: number; y: number }[], t: number): Vec {
    if (keys.length === 0) return { x: 0, y: 0 };
    if (t <= keys[0].t) return { x: keys[0].x, y: keys[0].y };
    if (t >= keys[keys.length - 1].t) {
      const last = keys[keys.length - 1];
      return { x: last.x, y: last.y };
    }
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const p0 = keys[Math.max(0, i - 1)];
    const p1 = keys[i];
    const p2 = keys[i + 1];
    const p3 = keys[Math.min(keys.length - 1, i + 2)];
    const u = clamp((t - p1.t) / Math.max(0.0001, p2.t - p1.t), 0, 1);
    const u2 = u * u;
    const u3 = u2 * u;
    const x =
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * u +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3);
    const y =
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * u +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3);
    return { x, y };
  }

  private ballState(t: number): { x: number; y: number; r: number; visible: boolean } {
    if (t < 12.3) {
      return { x: this.ballTee.x, y: this.ballTee.y, r: 17, visible: true };
    }
    if (t < 12.72) {
      const u = smooth((t - 12.3) / 0.42);
      const x = lerp(this.ballTee.x, this.cannonMuzzle.x, u);
      const y = lerp(this.ballTee.y, this.cannonMuzzle.y, u) - Math.sin(u * Math.PI) * 190;
      return { x, y, r: 17, visible: true };
    }
    if (t < 15.06) {
      return { x: this.cannonMuzzle.x, y: this.cannonMuzzle.y, r: 17, visible: true };
    }
    if (t < 20.5) {
      const p = this.pathPoint(this.ballFlight, t);
      return { x: p.x, y: p.y, r: 17, visible: true };
    }
    if (t < 20.64) {
      const u = (t - 20.5) / 0.14;
      return { x: this.holeX, y: this.holeY + u * 16, r: 17 * (1 - u), visible: true };
    }
    if (t < 28.84) return { x: 0, y: 0, r: 0, visible: false };
    if (t < 29.02) {
      const u = clamp((t - 28.84) / 0.18, 0, 1);
      const x = lerp(112, 88, smooth(u));
      const y = lerp(220, 841, u * u);
      return { x, y, r: 17, visible: true };
    }
    if (t < 29.16) {
      const u = clamp((t - 29.02) / 0.14, 0, 1);
      return { x: 88, y: 841 - Math.sin(u * Math.PI) * 17, r: 17, visible: true };
    }
    if (t < 29.4) {
      const u = smooth((t - 29.16) / 0.24);
      return { x: 88, y: lerp(841, 899, u), r: 17, visible: true };
    }
    return { x: 88, y: 899, r: 17, visible: true };
  }

  private renderBall(ctx: CanvasRenderingContext2D, t: number, pose: Pose) {
    const ball = this.ballState(t);
    if (!ball.visible) return;

    // Flight trail.
    if (t > 15.1 && t < 20.5) {
      ctx.save();
      for (let i = 6; i >= 1; i--) {
        const sampleT = t - i * 0.034;
        if (sampleT < 15.06) continue;
        const p = this.pathPoint(this.ballFlight, sampleT);
        ctx.globalAlpha = (1 - i / 7) * 0.34;
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 13 - i * 1.35, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // A small impact star when the ball lands on his head. Drawn first so the
    // ball itself stays readable on top of the flash.
    if (t >= 29.02 && t < 29.16) {
      const u = (t - 29.02) / 0.14;
      const x = 88;
      const y = 858;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.translate(x, y);
      ctx.rotate(u * 0.6);
      ctx.fillStyle = YELLOW;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU - Math.PI / 2;
        const r = i % 2 === 0 ? 34 * (1 - u * 0.4) : 15;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, 0, ball.r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Dimples, rotated with the flight so the ball reads as spinning.
    ctx.save();
    ctx.rotate(t * 5.2 + Math.hypot(ball.x, ball.y) * 0.01);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    for (const [dx, dy, r] of [
      [-6, -7, 2.2],
      [6, -4, 2],
      [0, 7, 2.3],
    ] as const) {
      ctx.beginPath();
      ctx.arc(dx, dy, r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    ctx.restore();
  }

  private renderFlyingClub(ctx: CanvasRenderingContext2D, t: number, pose: Pose) {
    if (t < 6.25) return;

    if (t < 7.12) {
      const keys = [
        { t: 6.25, x: 612, y: 846 },
        { t: 6.45, x: 758, y: 668 },
        { t: 6.8, x: 764, y: 984 },
        { t: 7.12, x: 640, y: 1428 },
      ];
      const p = this.pathPoint(keys, t);
      const u = clamp((t - 6.25) / 0.87, 0, 1);
      this.drawClubWorld(ctx, p.x, p.y, u * TAU * 3.4, 1);
      return;
    }

    // It stays stuck in the sand bunker for the rest of the film.
    this.drawClubWorld(ctx, 640, 1432, 1.18, 0.94);
    ctx.save();
    ctx.fillStyle = SAND;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(648, 1440, 48, 12, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawClubWorld(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    ctx.lineCap = 'round';

    // Shaft.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(-128, 0);
    ctx.lineTo(190, 0);
    ctx.stroke();
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-128, 0);
    ctx.lineTo(190, 0);
    ctx.stroke();

    // Grip.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(-128, 0);
    ctx.lineTo(-76, 0);
    ctx.stroke();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-128, 0);
    ctx.lineTo(-76, 0);
    ctx.stroke();

    // Club head.
    ctx.translate(190, 0);
    ctx.rotate(0.1);
    ctx.beginPath();
    ctx.moveTo(-14, -10);
    ctx.quadraticCurveTo(28, -30, 48, -5);
    ctx.lineTo(42, 17);
    ctx.quadraticCurveTo(10, 23, -12, 9);
    ctx.closePath();
    ctx.fillStyle = SLATE;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================
  // WAVE
  // ==========================================================

  private renderWave(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 26.3 || t > 27.2) return;
    const u = smooth((t - 26.3) / 0.62);
    const frontX = lerp(1190, 480, u);
    const backX = 1500;
    const fade = clamp((27.2 - t) / 0.2, 0, 1);

    ctx.save();
    ctx.globalAlpha = fade;

    // A low, knee-high surge rolling out of the pool.
    ctx.beginPath();
    ctx.moveTo(backX, 1470);
    ctx.lineTo(frontX, 1470);
    ctx.quadraticCurveTo(frontX + 8, 1398, frontX + 30, 1360);
    ctx.quadraticCurveTo(frontX + 80, 1292, frontX + 168, 1296);
    ctx.quadraticCurveTo(frontX + 268, 1310, backX, 1364);
    ctx.closePath();
    ctx.fillStyle = WATER;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dark trough inside the curl.
    ctx.fillStyle = 'rgba(2, 132, 199, 0.4)';
    ctx.beginPath();
    ctx.moveTo(frontX + 30, 1464);
    ctx.quadraticCurveTo(frontX + 42, 1392, frontX + 64, 1366);
    ctx.quadraticCurveTo(frontX + 112, 1328, frontX + 172, 1334);
    ctx.lineTo(backX, 1388);
    ctx.lineTo(backX, 1464);
    ctx.closePath();
    ctx.fill();

    // White foam crest along the leading edge.
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(frontX + 20, 1376);
    ctx.quadraticCurveTo(frontX + 64, 1308, frontX + 144, 1302);
    ctx.quadraticCurveTo(frontX + 232, 1306, frontX + 302, 1344);
    ctx.stroke();

    // Foam bubbles on the crest.
    for (let i = 0; i < 5; i++) {
      const cx = frontX + 66 + i * 46;
      const cy = 1318 - Math.sin((i / 4) * Math.PI) * 28;
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 12 - i * 0.8, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Streaks on the face.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 4; i++) {
      const x = frontX + 54 + i * 38;
      ctx.beginPath();
      ctx.moveTo(x, 1384 + i * 8);
      ctx.lineTo(x + 18, 1434);
      ctx.stroke();
    }

    // Droplets thrown off the crest.
    const dropU = clamp((t - 26.35) / 0.7, 0, 1);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 1.5 + 0.3;
      const speed = 90 + (i % 3) * 36;
      const dx = frontX + 150 + Math.cos(a) * speed * dropU;
      const dy = 1320 - Math.sin(a) * speed * dropU + 240 * dropU * dropU;
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(dx, dy, 7, 11, a, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Foam burst where the surge scoops him up. It is drawn with the wave so
    // the stickman is always in front of it instead of inside a white star.
    if (t >= 26.95 && t < 27.24) {
      const fu = (t - 26.95) / 0.29;
      ctx.save();
      ctx.globalAlpha = fade * (1 - fu) * 0.9;
      ctx.translate(480, 1276);
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU - Math.PI / 2;
        const r = i % 2 === 0 ? 92 * (0.6 + fu * 0.5) : 34;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = fade * (1 - fu) * 0.8;
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 8; i++) {
        const a = -Math.PI + (i / 7) * Math.PI;
        const d = 58 + fu * 200;
        ctx.beginPath();
        ctx.arc(480 + Math.cos(a) * d, 1276 + Math.sin(a) * d, 18 - fu * 8, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // ==========================================================
  // EFFECTS
  // ==========================================================

  private renderEffects(ctx: CanvasRenderingContext2D, t: number, pose: Pose) {
    // Practice-swing arcs.
    for (const at of [2.75, 3.85]) {
      if (t >= at && t < at + 0.24) {
        const u = (t - at) / 0.24;
        ctx.save();
        ctx.globalAlpha = 1 - u;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(510, 1000, 70 + i * 24 + u * 20, 1.0, 2.2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // Whiff rings and the frozen follow-through.
    if (t >= 5.72 && t < 6.12) {
      const u = (t - 5.72) / 0.4;
      ctx.save();
      ctx.globalAlpha = 1 - u * 0.7;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(540, 930, 78 + i * 28 + u * 26, -0.5, 1.4);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Spin whirl.
    if (t >= 6.1 && t < 7.4) {
      const u = (t - 6.1) / 1.3;
      ctx.save();
      ctx.globalAlpha = 0.55 * (1 - Math.abs(u - 0.5) * 0.7);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      const cy = 1040 - Math.sin(clamp(u, 0, 1) * Math.PI) * 148 - 300;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(450, cy + 220, 160 + i * 24, 54 + i * 10, -0.2 + u * 3, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Dizzy stars.
    if (t >= 7.2 && t < 8.5) {
      const alpha = clamp((8.5 - t) / 0.5, 0, 1);
      for (let i = 0; i < 3; i++) {
        const a = t * 4 + (i * TAU) / 3;
        const x = 450 + Math.cos(a) * 72;
        const y = 642 + Math.sin(a) * 26;
        this.star(ctx, x, y, 14, YELLOW, alpha, a);
      }
    }

    // Club clang in the bunker.
    if (t >= 7.12 && t < 7.48) {
      this.burst(ctx, 640, 1408, (t - 7.12) / 0.36, 66, YELLOW);
    }

    // Build clanks.
    for (const [at, x, y] of [
      [9.86, 620, 1280],
      [10.42, 582, 1260],
      [10.98, 558, 1310],
      [11.4, 660, 1204],
      [11.96, 615, 1370],
    ] as const) {
      if (t >= at && t < at + 0.28) {
        this.burst(ctx, x, y, (t - at) / 0.28, 34, ORANGE);
      }
    }

    // Leaf-blower exhaust before the launch.
    if (t >= 12.5 && t < 15.0) {
      const puffs = 5;
      for (let i = 0; i < puffs; i++) {
        const phase = (t * 2.8 + i * 0.19) % 1;
        const x = 548 - phase * 74;
        const y = 1340 - phase * 34;
        ctx.save();
        ctx.globalAlpha = (1 - phase) * 0.32;
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(x, y, 16 + phase * 24, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }

    // Muzzle blast.
    if (t >= 15.06 && t < 15.6) {
      const u = (t - 15.06) / 0.54;
      ctx.save();
      ctx.globalAlpha = (1 - u) * 0.8;
      ctx.fillStyle = '#cbd5e1';
      for (let i = 0; i < 6; i++) {
        const a = -0.9 + (i - 2.5) * 0.16;
        const d = 40 + u * (100 + i * 22);
        ctx.beginPath();
        ctx.arc(700 + Math.cos(a) * d, 1118 + Math.sin(a) * d, 24 + u * 30, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      this.burst(ctx, 700, 1118, u, 120, YELLOW);
    }

    // Buoy impact.
    if (t >= 16.12 && t < 16.42) {
      const u = (t - 16.12) / 0.3;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(900, 1262, 34 + u * 86, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = RED;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(900, 1262, 22 + u * 62, 0, TAU);
      ctx.stroke();
      ctx.restore();
      this.burst(ctx, 900, 1262, u, 56, YELLOW);
    }

    // Windmill speed lines.
    if (t >= 17.58 && t < 18.3) {
      const u = (t - 17.58) / 0.72;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(1210, 880, 62 + i * 24, -0.4 + u * 2, 0.8 + u * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Hole drop: a gold ring and sparkles.
    if (t >= 20.5 && t < 21.15) {
      const u = (t - 20.5) / 0.65;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = YELLOW;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(848, 1150, 26 + u * 110, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(848, 1150, 18 + u * 74, 0, TAU);
      ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.4;
        this.sparkle(ctx, 848 + Math.cos(a) * (40 + u * 100), 1150 + Math.sin(a) * (30 + u * 74), 13 * (1 - u), 1 - u, YELLOW);
      }
    }

    // Celebration confetti.
    if (t >= 21.1 && t < 22.05) {
      const u = t - 21.1;
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * TAU + 0.3;
        const speed = 120 + (i % 5) * 44;
        const x = 450 + Math.cos(a) * speed * u;
        const y = 900 - Math.sin(a) * speed * u + 340 * u * u;
        const color = [RED, YELLOW, WHITE, GRASS_DARK][i % 4];
        ctx.save();
        ctx.globalAlpha = clamp(1 - u / 0.95, 0, 1);
        ctx.translate(x, y);
        ctx.rotate(u * 12 + i);
        ctx.fillStyle = color;
        ctx.fillRect(-7, -4, 14, 8);
        ctx.restore();
      }
    }

    // Spring click and launch dust.
    if (t >= 22.12 && t < 22.4) {
      this.burst(ctx, 830, 1200, (t - 22.12) / 0.28, 44, YELLOW);
    }
    if (t >= 23.35 && t < 24.0) {
      const u = (t - 23.35) / 0.65;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 5;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        ctx.beginPath();
        ctx.moveTo(830 + Math.cos(a) * 120, 1270 + Math.sin(a) * 30);
        ctx.lineTo(830 + Math.cos(a) * (190 + u * 80), 1270 + Math.sin(a) * (46 + u * 20));
        ctx.stroke();
      }
      ctx.restore();
      this.burst(ctx, 830, 1260, u, 92, YELLOW);
    }

    // Island flight streaks.
    if (t >= 23.45 && t < 26.0) {
      const state = this.islandState(t);
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      for (let i = 1; i <= 4; i++) {
        const past = this.islandState(Math.max(23.35, t - i * 0.055));
        ctx.beginPath();
        ctx.moveTo(past.x, past.y);
        ctx.lineTo(state.x, state.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Pool impact splash.
    if (t >= 26.0 && t < 27.1) {
      const u = (t - 26.0) / 1.1;
      this.drawSplash(ctx, 1190, 1120, u, 1.15);
    }

    // Dazed stars while he pops up.
    if (t >= 28.12 && t < 28.45) {
      for (let i = 0; i < 3; i++) {
        const a = t * 5 + (i * TAU) / 3;
        this.star(ctx, 85 + Math.cos(a) * 62, 872 + Math.sin(a) * 18, 11, YELLOW, 1, a);
      }
    }

    // Final bonk stars.
    if (t >= 29.02 && t < 29.45) {
      const u = (t - 29.02) / 0.43;
      const drop = 58 * smooth((t - 29.16) / 0.24);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + u * 3;
        this.star(ctx, 88 + Math.cos(a) * (52 + u * 20), 858 + drop + Math.sin(a) * (26 + u * 12), 12 * (1 - u * 0.4), YELLOW, 1 - u * 0.5, a);
      }
    }
  }

  private drawSplash(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    u: number,
    scale: number
  ) {
    const rise = Math.sin(clamp(u * 1.1, 0, 1) * Math.PI) * 300 * scale;
    ctx.save();
    ctx.globalAlpha = clamp(1 - u * 0.35, 0, 1);

    // Crown ring.
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.ellipse(x, y + 120, 170 + u * 100, 30 + u * 16, 0, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.6)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(x, y + 124, 132 + u * 80, 22 + u * 10, 0, 0, TAU);
    ctx.stroke();

    // Rounded water plumes, tallest in the middle — merged into a continuous crown.
    const plumes = 7;
    const spread = 360 * scale;
    ctx.beginPath();
    ctx.moveTo(x - spread / 2 - 20, y + 100);
    for (let i = 0; i <= plumes; i++) {
      const t2 = i / plumes;
      const px = x + (t2 - 0.5) * spread;
      const h = (100 + Math.sin(t2 * Math.PI) * 220) * (rise / 240);
      const lean = (Math.sin(t2 * 6) * 12);
      const baseW = 38 + Math.sin(t2 * Math.PI) * 10;
      if (i === 0) {
        ctx.lineTo(px - baseW, y + 100);
      } else {
        // Smooth curve to the next peak.
        const prevT2 = (i - 1) / plumes;
        const prevPx = x + (prevT2 - 0.5) * spread;
        const prevH = (100 + Math.sin(prevT2 * Math.PI) * 220) * (rise / 240);
        const prevLean = (Math.sin(prevT2 * 6) * 12);
        ctx.bezierCurveTo(
          prevPx + prevLean + 25, y - prevH * 0.55,
          px + lean - 25, y - h * 0.55,
          px + lean, y - h
        );
      }
    }
    // Return along the bottom.
    for (let i = plumes; i >= 0; i--) {
      const t2 = i / plumes;
      const px = x + (t2 - 0.5) * spread;
      const baseW = 38 + Math.sin(t2 * Math.PI) * 10;
      ctx.lineTo(px + baseW, y + 100);
    }
    ctx.closePath();
    ctx.fillStyle = WHITE;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Round droplets.
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI + (i / 11) * Math.PI;
      const d = 90 + (i % 4) * 38;
      const dx = x + Math.cos(a) * (d + u * 160) * scale;
      const dy = y + 40 + Math.sin(a) * (d + u * 220) * scale + u * u * 340;
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(dx, dy, 9, 14, a, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private burst(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    u: number,
    size: number,
    color: string
  ) {
    if (u < 0 || u > 1) return;
    ctx.save();
    ctx.globalAlpha = 1 - u;
    ctx.translate(x, y);
    ctx.rotate(u * 0.5);
    ctx.fillStyle = color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    const points = 10;
    for (let i = 0; i < points; i++) {
      const a = (i / points) * TAU - Math.PI / 2;
      const r = i % 2 === 0 ? size * (0.55 + u * 0.45) : size * 0.26;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private star(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    alpha: number,
    rot: number
  ) {
    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU - Math.PI / 2;
      const r = i % 2 === 0 ? size : size * 0.44;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private sparkle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    alpha: number,
    color: string
  ) {
    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();
    ctx.restore();
  }
}
