import { StudioConfig } from '../types';

/**
 * CoinFlipRenderer
 *
 * "THE ANGRY STICKMAN VS. THE IMPOSSIBLE COIN FLIP" — a 30-second vertical
 * comedy on the same one-room stickman rig as the dart-shot short.
 *
 * Scene 1 0-4     EASY MONEY!           (smug point, confident flick, clean miss)
 * Scene 2 4-8     ARE YOU SERIOUS?!     (the coin clangs the rim, spins back
 *                                        and bonks his own forehead)
 * Scene 3 8-14    PERFECT ENGINEERING!  (book / ruler / spoon launcher fires
 *                                        the coin straight into his shoe)
 * Scene 4 14-19   GET IN THE GLASS!     (rage, stomp, maximum-force flick)
 * Scene 5 19-25   I'M A GENIUS!         (clock / lamp / book ricochet, perfect
 *                                        splash landing)
 * Scene 6 25-30   I QUIT.               (victory dance, the glass tips on his
 *                                        head, the coin follows)
 *
 * White room, black outlines, one flat gold accent for the coin and a pale
 * blue for the water. One continuous camera language with hard cuts.
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
}

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

const TAU = Math.PI * 2;
const INK = '#000000';
const GOLD = '#d99b00';
const GOLD_PALE = '#ffe08a';
const WATER = '#cfe3f5';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => {
  const c = clamp(u, 0, 1);
  return c * c * (3 - 2 * c);
};
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u, 0, 1), 2);

/** A soft 0 -> 1 -> 0 bump used for hops and winces. */
const bump = (u: number) => Math.sin(clamp(u, 0, 1) * Math.PI);

const CAPTIONS: { text: string; from: number; to: number }[] = [
  { text: 'EASY MONEY!', from: 0.5, to: 3.86 },
  { text: 'ARE YOU SERIOUS?!', from: 5.6, to: 7.86 },
  { text: 'PERFECT ENGINEERING!', from: 8.4, to: 13.25 },
  { text: 'GET IN THE GLASS!', from: 14.1, to: 17.55 },
  { text: "I'M A GENIUS!", from: 23.55, to: 24.95 },
  { text: 'I QUIT.', from: 28.35, to: 29.7 },
];

export class CoinFlipRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  private readonly floorY = 1460;
  private readonly ceilingY = 150;
  private readonly leftWallX = 42;
  private readonly rightWallX = 1400;

  private readonly tableLeft = 300;
  private readonly tableRight = 780;
  private readonly tableTop = 1150;

  // The glass sits at the table's right end, the lamp to its left.
  private readonly glassX = 690;
  private readonly glassW = 88;
  private readonly glassH = 170;
  private readonly glassTop = 980;
  private readonly waterTop = 1078;

  private readonly lampX = 570;
  private readonly chairX = 820;

  private readonly clockX = 960;
  private readonly clockY = 260;
  private readonly clockR = 66;

  private readonly coinR = 18;

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 540, y: 980, zoom: 1.0 },
    { t: 2.2, x: 540, y: 980, zoom: 1.0 },
    { t: 2.55, x: 420, y: 950, zoom: 1.16 },
    { t: 3.9, x: 420, y: 950, zoom: 1.16 },
    { t: 4.05, x: 560, y: 1000, zoom: 1.0 },
    { t: 5.2, x: 560, y: 1000, zoom: 1.0 },
    { t: 5.35, x: 300, y: 960, zoom: 1.36 },
    { t: 7.05, x: 300, y: 960, zoom: 1.36 },
    { t: 7.25, x: 520, y: 960, zoom: 1.1 },
    { t: 8.0, x: 520, y: 960, zoom: 1.1 },
    { t: 8.2, x: 470, y: 1000, zoom: 1.06 },
    { t: 11.9, x: 470, y: 1000, zoom: 1.06 },
    { t: 12.2, x: 520, y: 940, zoom: 1.0 },
    { t: 12.9, x: 520, y: 940, zoom: 1.0 },
    { t: 13.1, x: 330, y: 1220, zoom: 1.28 },
    { t: 13.9, x: 330, y: 1220, zoom: 1.28 },
    { t: 14.05, x: 480, y: 1020, zoom: 1.12 },
    { t: 14.7, x: 700, y: 1010, zoom: 1.15 },
    { t: 15.2, x: 700, y: 1030, zoom: 1.2 },
    { t: 15.6, x: 700, y: 1240, zoom: 1.3 },
    { t: 16.5, x: 700, y: 1240, zoom: 1.3 },
    { t: 17.0, x: 700, y: 930, zoom: 1.3 },
    { t: 18.6, x: 800, y: 900, zoom: 1.2 },
    { t: 19.0, x: 790, y: 900, zoom: 1.18 },
    { t: 19.9, x: 790, y: 900, zoom: 1.18 },
    { t: 20.3, x: 620, y: 1000, zoom: 1.12 },
    { t: 21.5, x: 620, y: 1000, zoom: 1.12 },
    { t: 21.7, x: 520, y: 1060, zoom: 1.2 },
    { t: 22.3, x: 600, y: 1040, zoom: 1.34 },
    { t: 22.7, x: 650, y: 1020, zoom: 1.45 },
    { t: 23.5, x: 650, y: 1030, zoom: 1.5 },
    { t: 24.0, x: 700, y: 980, zoom: 1.3 },
    { t: 24.9, x: 700, y: 940, zoom: 1.3 },
    { t: 25.1, x: 700, y: 960, zoom: 1.2 },
    { t: 26.3, x: 700, y: 980, zoom: 1.2 },
    { t: 26.7, x: 670, y: 990, zoom: 1.24 },
    { t: 27.2, x: 640, y: 1000, zoom: 1.26 },
    { t: 27.8, x: 690, y: 960, zoom: 1.24 },
    { t: 28.4, x: 720, y: 950, zoom: 1.2 },
    { t: 30.0, x: 720, y: 950, zoom: 1.2 },
  ];

  // ==========================================================
  // ENTRY POINT
  // ==========================================================

  public render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = clamp(time, 0, 30);

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.width, this.height);

    if (t >= 29.75) {
      ctx.fillStyle = INK;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
      if (config.showSafeZones) this.renderSafeZones(ctx);
      return;
    }

    const pose = this.getPose(t);

    this.applyCamera(ctx, t);
    this.renderRoom(ctx, pose);
    this.renderTable(ctx);
    this.renderChair(ctx, t);
    this.renderLamp(ctx, t);
    this.renderClock(ctx, t);
    this.renderLauncher(ctx, t);
    this.renderLooseBook(ctx, t);
    this.renderGlassBack(ctx, t);
    if (t < 27.55) this.renderCoin(ctx, t);
    this.renderGlassFront(ctx, t);
    this.renderVibrationGhosts(ctx, pose, t);
    this.renderStickman(ctx, pose, t);
    if (t >= 27.55) this.renderCoin(ctx, t);
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
    // Keep the floor line above the caption band so the last frame never
    // drops into the text.
    const minY = this.floorY - (1592 - this.height / 2) / zoom;
    y = Math.max(y, minY);
    return { t, x, y, zoom };
  }

  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    const cam = this.cameraAt(t);
    // Four short impact kicks. Each one is silent until its own hit, then
    // decays in a few frames - otherwise the whole film jitters forever.
    const kick = (at: number, decay: number, amp: number) =>
      t < at ? 0 : Math.exp(-(t - at) * decay) * amp;
    const shake =
      kick(4.62, 10, 4) +
      kick(5.35, 9, 7) +
      kick(15.62, 10, 5) +
      kick(23.45, 8, 8) +
      kick(27.8, 7, 10) +
      kick(28.15, 11, 4);
    const sx = Math.sin(t * 34) * shake;
    const sy = Math.cos(t * 29) * shake;
    ctx.save();
    ctx.translate(this.width / 2 + sx, this.height / 2 + sy);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);
  }

  // ==========================================================
  // CAPTIONS AND SAFE ZONES
  // ==========================================================

  private renderCaption(ctx: CanvasRenderingContext2D, t: number) {
    for (const caption of CAPTIONS) {
      if (t < caption.from || t > caption.to) continue;
      const fadeIn = Math.min(1, (t - caption.from) / 0.18);
      const fadeOut = Math.min(1, (caption.to - t) / 0.18);
      const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
      const pop = 1 + 0.08 * Math.exp(-Math.max(0, t - caption.from) * 22);
      const text = caption.text;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.width / 2, 1704);
      ctx.scale(pop, pop);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 74px "Arial Black", "Helvetica Neue", Arial, sans-serif';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      // Gold halo, heavy black outline, white face.
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 23;
      ctx.strokeText(text, 0, 0);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 16;
      ctx.strokeText(text, 0, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }

  private renderSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
    ctx.setLineDash([14, 12]);
    ctx.lineWidth = 3;

    // Title / action safe area.
    ctx.strokeRect(48, 120, this.width - 96, this.height - 240);

    // Right-hand action bar.
    ctx.beginPath();
    ctx.moveTo(this.width - 150, 520);
    ctx.lineTo(this.width - 150, 1380);
    ctx.stroke();

    // Caption band.
    ctx.strokeRect(48, 1590, this.width - 96, 210);
    ctx.restore();
  }

  // ==========================================================
  // ROOM
  // ==========================================================

  private renderRoom(ctx: CanvasRenderingContext2D, pose: Pose) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(this.leftWallX, this.floorY);
    ctx.lineTo(this.rightWallX, this.floorY);
    ctx.stroke();

    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(this.leftWallX, this.ceilingY);
    ctx.lineTo(this.leftWallX, this.floorY);
    ctx.moveTo(this.rightWallX, this.ceilingY);
    ctx.lineTo(this.rightWallX, this.floorY);
    ctx.moveTo(this.leftWallX, this.ceilingY);
    ctx.lineTo(this.rightWallX, this.ceilingY);
    ctx.stroke();

    // Ground shadow under the character (compresses when he hops).
    const lift = Math.max(0, pose.jump);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
    ctx.beginPath();
    ctx.ellipse(pose.hipX, this.floorY + 10, 112 - lift * 0.2, 15 - lift * 0.02, 0, 0, TAU);
    ctx.fill();

    // Table and chair shadows.
    ctx.beginPath();
    ctx.ellipse((this.tableLeft + this.tableRight) / 2, this.floorY + 8, 150, 13, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(899, this.floorY + 8, 82, 11, 0, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================================
  // TABLE
  // ==========================================================

  private renderTable(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';

    // Top slab.
    ctx.beginPath();
    ctx.rect(
      this.tableLeft,
      this.tableTop,
      this.tableRight - this.tableLeft,
      24
    );
    ctx.fill();
    ctx.stroke();

    // Legs.
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(this.tableLeft + 34, this.tableTop + 24);
    ctx.lineTo(this.tableLeft + 30, this.floorY);
    ctx.moveTo(this.tableRight - 34, this.tableTop + 24);
    ctx.lineTo(this.tableRight - 30, this.floorY);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // CHAIR
  // ==========================================================

  private renderChair(ctx: CanvasRenderingContext2D, t: number) {
    // The thrown book lands on the seat at 14.5 and rocks the chair.
    const bumpU = clamp((t - 14.48) / 0.55, 0, 1);
    const rock = t > 14.48 ? Math.sin(bumpU * Math.PI * 3) * 0.1 * (1 - bumpU) : 0;
    const cx = 899;
    const cy = 1300;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rock);
    ctx.translate(-cx, -cy);
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';

    // Rear posts and back rail (the chair faces left).
    ctx.beginPath();
    ctx.rect(938, 1120, 20, 124);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(910, 1112, 48, 20);
    ctx.fill();
    ctx.stroke();

    // Seat.
    ctx.beginPath();
    ctx.rect(840, 1244, 118, 18);
    ctx.fill();
    ctx.stroke();

    // Legs.
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(852, 1262);
    ctx.lineTo(846, this.floorY);
    ctx.moveTo(948, 1262);
    ctx.lineTo(954, this.floorY);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // TABLE LAMP
  // ==========================================================

  private renderLamp(ctx: CanvasRenderingContext2D, t: number) {
    // The shade swings when the coin clips it at 20.35.
    const hit = t > 20.35 ? Math.exp(-(t - 20.35) * 4) * Math.sin((t - 20.35) * 26) * 0.16 : 0;
    const pivotX = 570;
    const pivotY = 1070;

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(hit);
    ctx.translate(-pivotX, -pivotY);

    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Base and stem.
    ctx.beginPath();
    ctx.ellipse(570, 1148, 44, 9, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(570, 1144);
    ctx.lineTo(570, 1042);
    ctx.stroke();

    // Shade: a trapezoid with a rounded bottom lip.
    ctx.beginPath();
    ctx.moveTo(544, 970);
    ctx.lineTo(596, 970);
    ctx.lineTo(618, 1030);
    ctx.lineTo(522, 1030);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // A bulb glow hint: a small white circle under the shade.
    ctx.beginPath();
    ctx.arc(570, 1036, 8, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // WALL CLOCK
  // ==========================================================

  private renderClock(ctx: CanvasRenderingContext2D, t: number) {
    const hit = t > 19.5 ? Math.exp(-(t - 19.5) * 5) * Math.sin((t - 19.5) * 30) * 0.16 : 0;
    ctx.save();
    ctx.translate(this.clockX, this.clockY);
    ctx.rotate(hit);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, this.clockR, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Tick marks.
    ctx.lineWidth = 3.5;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU - Math.PI / 2;
      const inner = i % 3 === 0 ? this.clockR - 16 : this.clockR - 10;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
      ctx.lineTo(Math.cos(a) * (this.clockR - 5), Math.sin(a) * (this.clockR - 5));
      ctx.stroke();
    }

    // Hands frozen at a quarter past ten.
    const hand = (angle: number, len: number, width: number) => {
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
      ctx.stroke();
    };
    hand(-Math.PI / 2 + 0.9, 26, 5);
    hand(-Math.PI / 2 - 0.35, 38, 4);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================================
  // GLASS OF WATER
  // ==========================================================

  /**
   * The glass wobbles, hops, tips over above his head and comes back down on
   * its side. `dx`/`dy` move the whole glass; `rot` spins it about its centre.
   */
  private glassOffset(t: number): { dx: number; dy: number; rot: number } {
    let dx = 0;
    let dy = 0;
    let rot = 0;

    if (t > 26.5 && t < 27.08) {
      const u = clamp((t - 26.5) / 0.58, 0, 1);
      rot += Math.sin(u * Math.PI * 4) * 0.075 * (1 - u * 0.3);
    }

    if (t >= 26.75) {
      const up = smooth(clamp((t - 26.75) / 0.3, 0, 1));
      const down = smooth(clamp((t - 27.35) / 0.27, 0, 1));
      dx = 40 * up - 10 * down;
      dy = -360 * up * (1 - down) + 41 * down;
      rot += 1.55 * smooth(clamp((t - 26.85) / 0.45, 0, 1));
    }

    return { dx, dy, rot };
  }

  private glassTransform(ctx: CanvasRenderingContext2D, t: number) {
    const { dx, dy, rot } = this.glassOffset(t);
    const cy = (this.glassTop + this.tableTop) / 2;
    ctx.translate(dx, dy);
    ctx.translate(this.glassX, cy);
    ctx.rotate(rot);
    ctx.translate(-this.glassX, -cy);
  }

  private glassPath(ctx: CanvasRenderingContext2D) {
    const x = this.glassX;
    const halfTop = this.glassW / 2;
    const halfBase = this.glassW / 2 - 9;
    const top = this.glassTop;
    const bottom = this.tableTop;
    ctx.beginPath();
    ctx.moveTo(x - halfTop, top);
    ctx.lineTo(x - halfBase, bottom - 14);
    ctx.quadraticCurveTo(x - halfBase, bottom, x - halfBase + 12, bottom);
    ctx.lineTo(x + halfBase - 12, bottom);
    ctx.quadraticCurveTo(x + halfBase, bottom, x + halfBase, bottom - 14);
    ctx.lineTo(x + halfTop, top);
    ctx.closePath();
  }

  /** Water and the pale glass tint, behind the coin. */
  private renderGlassBack(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    this.glassTransform(ctx, t);

    // A barely-there glass tint.
    ctx.fillStyle = '#f5fafd';
    this.glassPath(ctx);
    ctx.fill();

    // Water: clipped to the glass, draining away once it tips.
    const drain = t < 27.15 ? 0 : smooth((t - 27.15) / 0.35);
    const level = lerp(this.waterTop, this.tableTop - 4, drain);
    if (t < 27.5) {
      ctx.save();
      this.glassPath(ctx);
      ctx.clip();
      ctx.fillStyle = WATER;
      ctx.fillRect(this.glassX - 60, level, 120, this.tableTop - level + 12);
      // A soft surface line, sloshing very slightly.
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const wob = Math.sin(t * 7) * 2.5;
      ctx.moveTo(this.glassX - 40, level + wob);
      ctx.quadraticCurveTo(this.glassX - 18, level - 4 + wob, this.glassX, level + 1 + wob);
      ctx.quadraticCurveTo(this.glassX + 18, level + 6 + wob, this.glassX + 40, level + 1 + wob);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  /** The glass outline, rim and highlights, in front of the coin. */
  private renderGlassFront(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    this.glassTransform(ctx, t);

    ctx.strokeStyle = INK;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 7;
    this.glassPath(ctx);
    ctx.stroke();

    // Mouth: a full ellipse so the opening reads.
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(this.glassX, this.glassTop, this.glassW / 2, 10, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(this.glassX, this.glassTop + 4, this.glassW / 2 - 7, 5.5, 0, 0, TAU);
    ctx.stroke();

    // Glints down the left wall.
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.glassX - 27, this.glassTop + 28);
    ctx.lineTo(this.glassX - 31, this.tableTop - 38);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.glassX - 17, this.glassTop + 32);
    ctx.lineTo(this.glassX - 21, this.glassTop + 84);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // GOLD COIN
  // ==========================================================

  /**
   * One flat gold coin. `flip` turns it edge-on as it spins; the outline stays
   * heavy so it never disappears against the white room.
   */
  private drawCoin(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    flip: number,
    scale = 1,
    alpha = 1
  ) {
    const w = Math.max(0.14, Math.abs(Math.cos(flip * TAU)));
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = GOLD_PALE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.coinR * w, this.coinR, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (w > 0.42) {
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.coinR * w * 0.6, this.coinR * 0.6, 0, 0, TAU);
      ctx.stroke();
      // A highlight arc on the upper left.
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(
        -this.coinR * w * 0.18,
        -this.coinR * 0.2,
        this.coinR * w * 0.28,
        this.coinR * 0.26,
        0,
        Math.PI * 0.9,
        Math.PI * 1.55
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================
  // BOOK / RULER / SPOON LAUNCHER
  // ==========================================================

  private renderLauncher(ctx: CanvasRenderingContext2D, t: number) {
    const books = [0, 1, 2];
    const baseY = 1148;
    // The whole contraption is swiped off the table at 14.05.
    const fly = smooth((t - 14.05) / 0.42);
    const flyAlpha = 1 - fly;

    ctx.save();
    ctx.globalAlpha = flyAlpha;
    // Spin in place around the stack's centre, then carry it off the table.
    ctx.translate(400, 1080);
    ctx.rotate(-fly * 0.9);
    ctx.translate(-400, -1080);
    ctx.translate(-fly * 280, -fly * 120);
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineJoin = 'round';

    for (const i of books) {
      const dropAt = 8.45 + i * 0.5;
      if (t < dropAt) continue;
      const drop = smooth((t - dropAt) / 0.18);
      const y = baseY - i * 34 - (1 - drop) * 130;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.rect(330, y - 30, 140, 32);
      ctx.fill();
      ctx.stroke();
      // Spine line.
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(352, y - 28);
      ctx.lineTo(352, y + 1);
      ctx.stroke();
    }

    // Ruler balanced across the stack.
    if (t >= 10.0) {
      const drop = smooth((t - 10.0) / 0.2);
      const y = 1044 - (1 - drop) * 90;
      ctx.save();
      ctx.translate(400, y);
      ctx.rotate(-0.05);
      ctx.lineWidth = 4;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.rect(-100, -6, 200, 12);
      ctx.fill();
      ctx.stroke();
      // Ruler ticks.
      ctx.lineWidth = 2;
      for (let i = -9; i <= 9; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 11, -6);
        ctx.lineTo(i * 11, i % 3 === 0 ? -1 : -3);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Bent spoon catapult at the left end of the ruler.
    if (t >= 10.55) {
      const pull = t >= 11.65 && t < 12.0 ? smooth((t - 11.65) / 0.28) : 0;
      const snap = t >= 12.0 && t < 12.2 ? 1 - smooth((t - 12.0) / 0.18) : 0;
      const bend = pull * 0.7 - snap * 0.5;
      ctx.save();
      ctx.translate(330, 1050);
      ctx.rotate(-0.15 + bend);
      ctx.strokeStyle = INK;
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      // Handle: a straight stalk that stops at the bowl's rim.
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(38, -26);
      ctx.stroke();
      // Bowl: a long oval, almost a spoon's silhouette.
      ctx.beginPath();
      ctx.ellipse(54, -40, 16, 24, -0.55, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // Dish line so the bowl reads as a spoon and not a lollipop.
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(57, -42, 8, 15, -0.55, Math.PI * 0.15, Math.PI * 1.15);
      ctx.stroke();
      // The loaded coin rides in the bowl until the launch.
      if (t >= 11.5 && t < 12.06) {
        this.drawCoin(ctx, 54, -42, 0.22, 0.95);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // ==========================================================
  // THE THROWN BOOK (the coin's mid-air rebound)
  // ==========================================================

  private renderLooseBook(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 14.12) return;
    const flight = smooth((t - 14.12) / 0.4);
    const landed = t >= 14.52;
    const x = landed ? 898 : lerp(430, 898, flight);
    const y = landed ? 1228 : lerp(1084, 1228, flight) - Math.sin(flight * Math.PI) * 96;
    const rot = landed ? 0.03 : -1.9 * (1 - flight) + 0.03;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(-50, -16, 100, 32);
    ctx.fill();
    ctx.stroke();
    // Spine line.
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-38, -14);
    ctx.lineTo(-38, 14);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================
  // CHARACTER POSITION
  // ==========================================================

  private charXAt(t: number): number {
    if (t < 7.95) return 265;
    if (t < 8.35) return lerp(265, 310, smooth((t - 7.95) / 0.4));
    if (t < 14.55) return 310;
    if (t < 15.05) return lerp(310, 720, smooth((t - 14.55) / 0.5));
    return 720;
  }

  private basePose(t: number): Pose {
    return {
      hipX: this.charXAt(t),
      hipY: this.floorY - 300,
      lean: 0,
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
    };
  }

  private getPose(t: number): Pose {
    const p = this.basePose(t);
    if (t < 4) this.poseChallenge(p, t);
    else if (t < 8) this.poseMiss(p, t);
    else if (t < 14.1) this.poseEngineer(p, t);
    else if (t < 19) this.poseRage(p, t);
    else if (t < 25) this.poseTrickshot(p, t);
    else this.poseChampion(p, t);
    return p;
  }

  // ==========================================================
  // POSES
  // ==========================================================

  private poseChallenge(p: Pose, t: number) {
    // He starts with the coin up, showing it off.
    p.gazeX = 0.8;
    p.gazeY = -0.3;
    p.brow = 'oneRaised';
    p.mouth = 'smirk';
    p.rightHand = { x: 72, y: -300 };
    p.rightHandStyle = 'hold';
    p.leftHand = { x: -58, y: -44 };

    // A smug shoulder roll.
    if (t > 0.65 && t < 1.45) {
      const a = ((t - 0.65) / 0.8) * TAU;
      p.rightHand = { x: 88 + Math.cos(a) * 24, y: -276 + Math.sin(a) * 24 };
      p.rightElbow = 34 + Math.sin(a) * 16;
      p.headTilt = 0.05;
      return;
    }

    // Point at the glass with the free hand.
    if (t >= 1.45 && t < 2.15) {
      p.leftHand = { x: 190, y: -230 };
      p.leftElbow = 6;
      p.leftHandStyle = 'point';
      p.gazeX = 0.9;
      p.gazeY = 0.35;
      p.mouth = 'smirk';
      p.brow = 'determined';
      p.lean = 0.03;
      return;
    }

    // Cock the coin behind his ear.
    if (t >= 2.15 && t < 2.55) {
      const u = smooth((t - 2.15) / 0.3);
      p.rightHand = { x: lerp(72, 4, u), y: lerp(-300, -292, u) };
      p.rightElbow = -30;
      p.leftHand = { x: -70, y: -84 };
      p.leftElbow = -18;
      p.brow = 'determined';
      p.mouth = 'grit';
      p.eye = 'squint';
      p.gazeX = 0.7;
      p.gazeY = 0.2;
      p.lean = lerp(0.02, -0.07, u);
      return;
    }

    // The flick: one fast snap.
    if (t < 2.72) {
      const u = smooth((t - 2.55) / 0.17);
      p.rightHand = { x: lerp(4, 196, u), y: lerp(-278, -256, u) };
      p.rightElbow = 10;
      p.rightHandStyle = 'open';
      p.leftHand = { x: -86, y: -96 };
      p.lean = 0.12;
      p.eye = 'wide';
      p.mouth = 'open';
      p.brow = 'raised';
      return;
    }

    // Follow-through: enjoy the inevitable.
    p.rightHand = { x: 200, y: -256 };
    p.rightElbow = 14;
    p.rightHandStyle = 'open';
    p.leftHand = { x: -84, y: -92 };
    p.lean = 0.1;
    p.brow = 'oneRaised';
    p.mouth = 'smirk';
    p.gazeX = 0.95;
    p.gazeY = -0.15;
    p.headTilt = 0.03;

    // ...and the smirk starts to crack.
    if (t > 3.15) {
      p.gazeX = 0.95;
      p.gazeY = -0.3;
      p.brow = 'raised';
      p.mouth = 'flat';
      p.headTilt = 0.06;
    }
    if (t > 3.5) {
      p.eye = 'wide';
      p.mouth = 'wobble';
      p.brow = 'raised';
      p.gazeX = 0.9;
      p.gazeY = 0.1;
      p.headTilt = 0.08;
      p.pupilScale = 0.75;
    }
  }

  private poseMiss(p: Pose, t: number) {
    // Watching the coin come back.
    p.rightHand = { x: 120, y: -180 };
    p.rightHandStyle = 'open';
    p.leftHand = { x: -70, y: -110 };
    p.gazeX = 0.9;
    p.gazeY = -0.35;
    p.brow = 'raised';
    p.mouth = 'flat';
    p.eye = 'wide';

    // It clangs the rim, then comes straight at him.
    if (t < 5.34) {
      if (t > 4.62) {
        p.mouth = 'o';
        p.pupilScale = 1.25;
        p.lean = -0.06 * smooth((t - 4.62) / 0.4);
        p.gazeX = 0.85;
        p.gazeY = -0.2;
      }
      return;
    }

    // BONK. Squash, then a frozen stare.
    if (t < 6.05) {
      p.headTilt = 0.14;
      p.eye = 'stunned';
      p.brow = 'raised';
      p.mouth = 'flat';
      p.pupilScale = 0.5;
      p.squashY = 0.95;
      p.lean = -0.05;
      p.rightHand = { x: 96, y: -150 };
      p.leftHand = { x: -84, y: -96 };
      return;
    }

    // A slow blink and the eyebrow starts to twitch.
    if (t < 6.95) {
      const twitch = Math.sin((t - 6.05) * 26) * 0.012;
      p.headTilt = 0.06 + twitch;
      p.brow = 'angry';
      p.mouth = 'flat';
      p.eye = 'squint';
      p.rightHand = { x: 84, y: -120 };
      p.leftHand = { x: -84, y: -110 };
      p.gazeX = 0.2;
      p.gazeY = 0.1;
      return;
    }

    // The full snarl.
    p.headTilt = 0.04;
    p.brow = 'angry';
    p.mouth = 'grit';
    p.eye = 'squint';
    p.anger = true;
    p.rightHand = { x: 70, y: -70 };
    p.leftHand = { x: -70, y: -70 };
    p.rightHandStyle = 'fist';
    p.leftHandStyle = 'fist';
    p.lean = 0.06;
    p.gazeX = 0.1;
    p.gazeY = 0.2;
    // He snaps his head toward the table before the march.
    if (t > 7.55) {
      p.headTilt = -0.1;
      p.gazeX = 0.8;
      p.gazeY = 0.3;
    }
  }

  private poseEngineer(p: Pose, t: number) {
    p.gazeX = 0.7;
    p.gazeY = 0.25;

    // March the last few steps to the table.
    if (t < 8.35) {
      const u = (t - 7.95) / 0.4;
      p.leftFoot = { x: -55 + Math.sin(u * TAU) * 26, y: 300 - Math.abs(Math.sin(u * TAU)) * 26 };
      p.rightFoot = { x: 55 - Math.sin(u * TAU) * 26, y: 300 - Math.abs(Math.cos(u * TAU)) * 18 };
      p.rightHand = { x: 70, y: -80 };
      p.leftHand = { x: -70, y: -80 };
      p.lean = 0.08;
      p.mouth = 'grit';
      p.brow = 'angry';
      p.anger = true;
      return;
    }

    p.hipX = 310;

    // Slam the books into a stack.
    if (t < 9.55) {
      const u = (t - 8.4) / 1.1;
      const bob = Math.abs(Math.sin(u * Math.PI * 3));
      p.rightHand = { x: 96, y: -46 - bob * 38 };
      p.rightElbow = 28;
      p.leftHand = { x: -46, y: -70 };
      p.lean = 0.1;
      p.gazeX = 0.88;
      p.gazeY = 0.5;
      p.mouth = 'grit';
      p.brow = 'determined';
      p.eye = 'squint';
      return;
    }

    // Balance the ruler.
    if (t < 10.05) {
      const u = (t - 9.55) / 0.5;
      const wobble = Math.sin(u * Math.PI * 4) * 8;
      p.rightHand = { x: 100 + wobble, y: -110 };
      p.leftHand = { x: 76 - wobble, y: -118 };
      p.rightElbow = 22;
      p.leftElbow = 24;
      p.lean = 0.12;
      p.gazeX = 0.78;
      p.gazeY = 0.55;
      p.brow = 'determined';
      p.mouth = 'grit';
      return;
    }

    // Bend the spoon into a catapult.
    if (t < 10.6) {
      p.rightHand = { x: 78, y: -150 };
      p.leftHand = { x: 62, y: -176 };
      p.rightElbow = 26;
      p.leftElbow = 30;
      p.lean = 0.13;
      p.gazeY = 0.6;
      p.eye = 'squint';
      p.brow = 'determined';
      p.mouth = 'grit';
      return;
    }

    // Rub the hands: mad-scientist time.
    if (t < 10.85) {
      const a = (t - 10.6) * 26;
      p.rightHand = { x: 92 + Math.cos(a) * 12, y: -112 + Math.sin(a) * 10 };
      p.leftHand = { x: 68 - Math.cos(a) * 12, y: -116 - Math.sin(a) * 10 };
      p.rightElbow = 30;
      p.leftElbow = -30;
      p.lean = 0.08;
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'grin';
      return;
    }

    // Dip down and pinch the coin off the table.
    if (t < 11.5) {
      const dip = smooth((t - 10.85) / 0.16) * (1 - smooth((t - 11.05) / 0.2));
      const lift = smooth((t - 11.05) / 0.4);
      p.rightHand = {
        x: lerp(196, 96, lift),
        y: lerp(-26 - dip * 18, -142, lift),
      };
      p.rightElbow = 16;
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -78, y: -80 };
      p.lean = 0.22 * dip + 0.04;
      p.gazeX = lerp(0.55, 0.7, lift);
      p.gazeY = lerp(0.9, 0.15, lift);
      p.brow = 'determined';
      p.mouth = 'grit';
      p.headTilt = 0.12 * dip;
      return;
    }

    // Load the coin into the spoon and pull the lever.
    if (t < 12.05) {
      const load = smooth((t - 11.5) / 0.14);
      const pull = t >= 11.65 ? smooth((t - 11.65) / 0.32) : 0;
      p.rightHand = {
        x: lerp(96, 78, load) + pull * 6,
        y: lerp(-142, -152, load) + pull * 12,
      };
      p.rightElbow = 30;
      p.leftHand = { x: 52, y: -96 };
      p.leftElbow = -18;
      p.lean = 0.06 + pull * 0.05;
      p.eye = 'squint';
      p.brow = 'determined';
      p.mouth = 'grit';
      p.gazeX = 0.35;
      p.gazeY = 0.4;
      return;
    }

    // Release!
    if (t < 12.4) {
      p.rightHand = { x: 80, y: -152 };
      p.rightElbow = 8;
      p.rightHandStyle = 'open';
      p.leftHand = { x: -30, y: -150 };
      p.lean = 0.1;
      p.eye = 'wide';
      p.mouth = 'open';
      p.brow = 'raised';
      p.gazeX = 0.2;
      p.gazeY = -0.9;
      return;
    }

    // Watch the coin loop.
    if (t < 12.95) {
      p.rightHand = { x: 80, y: -120 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -40, y: -120 };
      p.headTilt = -0.14;
      p.lean = -0.02;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeX = 0.3;
      p.gazeY = -1;
      return;
    }

    // Track it down into his shoe.
    if (t < 13.4) {
      const u = smooth((t - 12.95) / 0.45);
      p.rightHand = { x: 140, y: -140 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -50, y: -120 };
      p.headTilt = 0.22;
      p.lean = 0.07;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeX = 0.35;
      p.gazeY = lerp(-0.6, 0.95, u);
      return;
    }

    // Stare at the foot. Nothing.
    if (t < 13.78) {
      p.headTilt = 0.26;
      p.rightHand = { x: 130, y: -120 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -60, y: -110 };
      p.eye = 'stunned';
      p.brow = 'raised';
      p.mouth = 'flat';
      p.pupilScale = 0.62;
      p.gazeY = 0.95;
      p.lean = 0.05;
      return;
    }

    // The slow burn before the sweep.
    p.headTilt = 0.12;
    p.brow = 'angry';
    p.mouth = 'grit';
    p.eye = 'squint';
    p.anger = true;
    p.leftHand = { x: -96, y: -150 };
    p.leftHandStyle = 'open';
    p.rightHand = { x: 110, y: -118 };
    p.rightHandStyle = 'fist';
    p.lean = 0.08;
    p.gazeY = 0.6;
    p.gazeX = 0.5;
  }

  private poseRage(p: Pose, t: number) {
    p.gazeX = 0.7;
    p.gazeY = -0.45;
    p.brow = 'angry';
    p.mouth = 'grit';
    p.eye = 'squint';
    p.anger = true;

    // Swat the whole launcher off the table.
    if (t < 14.55) {
      const u = smooth((t - 14.12) / 0.26);
      p.leftHand = { x: lerp(196, -140, u), y: -150 };
      p.leftHandStyle = 'open';
      p.leftElbow = -10;
      p.rightHand = { x: 90, y: -70 };
      p.rightHandStyle = 'fist';
      p.lean = 0.16;
      p.gazeX = 0.55;
      p.gazeY = 0.3;
      return;
    }

    // Stomp across the room to the throwing spot.
    if (t < 15.05) {
      const u = clamp((t - 14.55) / 0.5, 0, 1);
      const swing = Math.sin(u * TAU * 2.5);
      p.rightFoot = { x: 30 + swing * 44, y: 300 - Math.max(0, swing) * 44 };
      p.leftFoot = { x: -30 + swing * 44, y: 300 - Math.max(0, -swing) * 44 };
      p.rightHand = { x: 62 - swing * 26, y: -118 };
      p.leftHand = { x: -62 - swing * 26, y: -126 };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.lean = 0.06;
      p.squashY = 1 + Math.abs(swing) * 0.015;
      p.gazeX = 0.8;
      p.gazeY = 0.1;
      return;
    }

    // Tremble.
    if (t < 15.3) {
      p.rightHand = { x: 66, y: -66 };
      p.leftHand = { x: -66, y: -66 };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.lean = -0.03;
      return;
    }

    // Silent scream at the glass.
    if (t < 15.6) {
      p.rightHand = { x: 118, y: -322 };
      p.leftHand = { x: -118, y: -322 };
      p.rightHandStyle = 'open';
      p.leftHandStyle = 'open';
      p.eye = 'wide';
      p.mouth = 'scream';
      p.brow = 'angry';
      p.headTilt = -0.06;
      p.lean = -0.06;
      p.squashY = 1.04;
      return;
    }

    // Stomp.
    if (t < 15.95) {
      const u = (t - 15.6) / 0.35;
      const up = Math.sin(Math.PI * clamp(u * 1.6, 0, 1));
      p.rightFoot = { x: 30, y: 300 - up * 70 };
      p.leftFoot = { x: -60, y: 300 };
      p.rightHand = { x: 86, y: -96 };
      p.leftHand = { x: -86, y: -96 };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.lean = 0.08;
      p.eye = 'wide';
      p.mouth = 'scream';
      return;
    }

    // Breathe in.
    if (t < 16.6) {
      const u = smooth((t - 15.95) / 0.6);
      p.rightHand = { x: lerp(86, 96, u), y: lerp(-96, -70, u) };
      p.leftHand = { x: lerp(-86, -96, u), y: lerp(-96, -70, u) };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.lean = lerp(0.04, -0.1, u);
      p.headTilt = -0.1;
      p.eye = 'closed';
      p.mouth = 'flat';
      p.squashY = 1 + 0.05 * u;
      return;
    }

    // Big wind-up, coin pinched high.
    if (t < 17.35) {
      const u = smooth((t - 16.6) / 0.55);
      p.rightHand = { x: lerp(96, 116, u), y: lerp(-70, -344, u) };
      p.rightElbow = -30;
      p.rightHandStyle = 'hold';
      p.leftHand = { x: 56, y: -150 };
      p.leftHandStyle = 'fist';
      p.lean = lerp(-0.1, -0.16, u);
      p.headTilt = 0.02;
      p.eye = 'squint';
      p.brow = 'determined';
      p.mouth = 'grit';
      return;
    }

    // Flick it with everything he has.
    if (t < 17.58) {
      const u = smooth((t - 17.35) / 0.2);
      p.rightHand = { x: lerp(116, 210, u), y: lerp(-344, -250, u) };
      p.rightElbow = 12;
      p.rightHandStyle = 'open';
      p.leftHand = { x: 46, y: -196 };
      p.lean = 0.28;
      p.eye = 'wide';
      p.mouth = 'scream';
      p.brow = 'angry';
      return;
    }

    // Follow-through.
    if (t < 18.3) {
      p.rightHand = { x: 220, y: -160 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: 40, y: -190 };
      p.lean = 0.3;
      p.eye = 'wide';
      p.mouth = 'open';
      p.brow = 'raised';
      return;
    }

    // Watch it fly.
    p.rightHand = { x: 200, y: -150 };
    p.rightHandStyle = 'open';
    p.leftHand = { x: 20, y: -120 };
    p.lean = 0.16;
    p.eye = 'wide';
    p.mouth = 'o';
    p.brow = 'raised';
    p.gazeX = 0.85;
    p.gazeY = -0.65;
    p.anger = false;
  }

  private poseTrickshot(p: Pose, t: number) {
    p.rightHand = { x: 70, y: -56 };
    p.leftHand = { x: -70, y: -56 };
    p.brow = 'raised';
    p.mouth = 'flat';
    p.eye = 'wide';
    p.gazeX = 0.7;
    p.gazeY = -0.6;

    // Eyes track the coin across the room.
    const coin = this.coinFlight(t);
    if (coin && t < 23.45) {
      const dx = coin.x - (p.hipX + 2);
      const dy = coin.y - 826;
      p.gazeX = clamp(dx / 320, -0.9, 0.95);
      p.gazeY = clamp(dy / 320, -0.9, 0.95);
      p.headTilt = clamp(dx / 4000, -0.1, 0.1);
    }

    if (t < 23.45) {
      p.pupilScale = 1;
      // He leans after it as it drops.
      if (t > 22.4) {
        p.lean = 0.04;
        p.mouth = 'o';
      }
      return;
    }

    // The splash. Total disbelief.
    if (t < 24.05) {
      p.gazeX = 0.7;
      p.gazeY = 0.4;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.pupilScale = 1.3;
      p.lean = -0.05;
      p.squashY = 1.03;
      return;
    }

    // Slowly raise both arms.
    if (t < 24.6) {
      const u = smooth((t - 24.05) / 0.55);
      p.rightHand = { x: lerp(70, 104, u), y: lerp(-56, -300, u) };
      p.leftHand = { x: lerp(-70, -104, u), y: lerp(-56, -300, u) };
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'grin';
      p.gazeX = 0.35;
      p.gazeY = -0.5;
      p.lean = -0.02;
      return;
    }

    // Celebration starts.
    const u = (t - 24.6) / 0.4;
    const hop = Math.abs(Math.sin(u * Math.PI * 1.5)) * 26;
    p.jump = hop;
    p.rightHand = { x: 108, y: -330 };
    p.leftHand = { x: -108, y: -330 };
    p.rightHandStyle = 'fist';
    p.leftHandStyle = 'fist';
    p.eye = 'happy';
    p.brow = 'raised';
    p.mouth = 'scream';
    p.headTilt = -0.05;
    p.gazeX = 0;
    p.gazeY = -0.4;
  }

  private poseChampion(p: Pose, t: number) {
    p.brow = 'raised';
    p.eye = 'happy';
    p.mouth = 'grin';
    p.gazeX = 0.3;
    p.gazeY = -0.4;

    // Victory dance beside the table.
    if (t < 27.15) {
      const phase = (t - 25.0) * 8;
      p.rightHand = { x: 92 + Math.sin(phase) * 26, y: -300 - Math.cos(phase) * 20 };
      p.leftHand = { x: -92 - Math.sin(phase) * 26, y: -300 + Math.cos(phase) * 20 };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.jump = Math.abs(Math.sin(phase * 0.7)) * 30;
      p.hipY = this.floorY - 300;
      p.headTilt = Math.sin(phase * 0.7) * 0.08;
      p.mouth = 'scream';
      return;
    }

    // The water hits. He freezes with his arms still up.
    if (t < 27.75) {
      const hit = smooth((t - 27.3) / 0.18);
      p.rightHand = { x: 104, y: -318 };
      p.leftHand = { x: -104, y: -318 };
      p.rightHandStyle = 'open';
      p.leftHandStyle = 'open';
      p.headTilt = -0.02;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.squashY = 1 - 0.06 * hit;
      p.lean = -0.04;
      p.gazeX = 0;
      p.gazeY = 0;
      p.pupilScale = 0.8;
      return;
    }

    // He tries to look up at the coin on his head.
    if (t < 28.2) {
      p.rightHand = { x: 96, y: -290 };
      p.leftHand = { x: -96, y: -290 };
      p.rightHandStyle = 'open';
      p.leftHandStyle = 'open';
      p.headTilt = -0.12;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'flat';
      p.gazeX = 0.15;
      p.gazeY = -1;
      p.pupilScale = 0.75;
      p.squashY = 0.98;
      return;
    }

    // Arms come down, fists clench: the slow burn.
    if (t < 28.85) {
      const u = smooth((t - 28.2) / 0.5);
      p.rightHand = { x: lerp(96, 62, u), y: lerp(-290, -76, u) };
      p.leftHand = { x: lerp(-96, -62, u), y: lerp(-290, -76, u) };
      p.rightHandStyle = u > 0.6 ? 'fist' : 'open';
      p.leftHandStyle = u > 0.6 ? 'fist' : 'open';
      p.headTilt = 0.02;
      p.eye = 'squint';
      p.brow = 'angry';
      p.mouth = 'grit';
      p.gazeX = 0;
      p.gazeY = 0.1;
      p.lean = 0.03;
      p.squashY = 1;
      return;
    }

    // The frozen pose. Nothing moves from here to the black frame.
    p.rightHand = { x: 58, y: -74 };
    p.leftHand = { x: -58, y: -74 };
    p.rightHandStyle = 'fist';
    p.leftHandStyle = 'fist';
    p.eye = 'squint';
    p.brow = 'angry';
    p.mouth = 'grit';
    p.headTilt = 0.04;
    p.lean = 0.03;
    p.gazeX = 0;
    p.gazeY = 0.1;
  }

  // ==========================================================
  // DART TRAJECTORY
  // ==========================================================

  private static arc(a: Vec, b: Vec, bulge: number, u: number): Vec {
    const x = lerp(a.x, b.x, u);
    const y = lerp(a.y, b.y, u) - Math.sin(Math.PI * clamp(u, 0, 1)) * bulge;
    return { x, y };
  }

  /** The dart's free-flight position, or null while held / stuck / gone. */
  private coinFlight(t: number): { x: number; y: number; trail: number; flip: number } | null {
    // Scene 1: the confident flick, sailing over the glass and off frame.
    if (t >= 2.6 && t < 3.55) {
      const u = easeOut((t - 2.6) / 0.95);
      const p = CoinFlipRenderer.arc({ x: 466, y: 902 }, { x: 1150, y: 842 }, 52, u);
      return { ...p, trail: 0.85, flip: (t - 2.6) * 5.5 };
    }

    // Scene 2: it comes back, clips the rim...
    if (t >= 4.12 && t < 4.62) {
      const u = easeOut((t - 4.12) / 0.5);
      const p = CoinFlipRenderer.arc({ x: 1130, y: 905 }, { x: 728, y: 982 }, -6, u);
      return { ...p, trail: 0.8, flip: 2.6 - (t - 4.12) * 6 };
    }
    // ...and spins backward into his own forehead.
    if (t >= 4.62 && t < 5.34) {
      const u = smooth((t - 4.62) / 0.72);
      const p = CoinFlipRenderer.arc({ x: 728, y: 982 }, { x: 330, y: 790 }, 70, u);
      return { ...p, trail: 0.55, flip: 2.6 - (t - 4.12) * 6 };
    }
    // The drop onto the table.
    if (t >= 5.34 && t < 5.84) {
      const u = (t - 5.34) / 0.5;
      return { x: lerp(330, 500, u), y: lerp(790, 1128, u * u), trail: 0.3, flip: 0.16 };
    }
    if (t >= 5.84 && t < 6.02) {
      const u = (t - 5.84) / 0.18;
      return { x: 500, y: 1132 - Math.sin(u * Math.PI) * 24, trail: 0, flip: 0.16 };
    }
    // It waits on the table while he builds.
    if (t >= 6.02 && t < 10.98) {
      return { x: 500, y: 1132, trail: 0, flip: 0.16 };
    }

    // Scene 3: the launcher.
    if (t >= 12.06 && t < 12.32) {
      const u = easeOut((t - 12.06) / 0.26);
      const p = CoinFlipRenderer.arc({ x: 454, y: 1008 }, { x: 640, y: 805 }, 18, u);
      return { ...p, trail: 0.95, flip: (t - 12.06) * 6 };
    }
    if (t >= 12.32 && t < 12.95) {
      const u = (t - 12.32) / 0.63;
      const ang = -Math.PI / 2 + u * TAU * 1.15;
      return {
        x: 640 + Math.cos(ang) * 95,
        y: 900 + Math.sin(ang) * 95,
        trail: 0.9,
        flip: (t - 12.06) * 6,
      };
    }
    if (t >= 12.95 && t < 13.4) {
      const u = (t - 12.95) / 0.45;
      const p = CoinFlipRenderer.arc({ x: 717, y: 844 }, { x: 365, y: 1448 }, 12, u);
      return { ...p, trail: 0.5, flip: (t - 12.06) * 6 };
    }

    // Scene 4: the maximum-force flick.
    if (t >= 17.55 && t < 18.3) {
      const u = easeOut((t - 17.55) / 0.75);
      const p = CoinFlipRenderer.arc({ x: 930, y: 905 }, { x: 940, y: 620 }, 34, u);
      return { ...p, trail: 0.95, flip: (t - 17.55) * 6.5 };
    }
    if (t >= 18.3 && t < 19.5) {
      const u = (t - 18.3) / 1.2;
      const p = CoinFlipRenderer.arc({ x: 940, y: 620 }, { x: 958, y: 330 }, 26, u * u);
      return { ...p, trail: 0.7, flip: (t - 17.55) * 6.5 };
    }

    // Scene 5: clock -> lampshade.
    if (t >= 19.5 && t < 20.35) {
      const u = (t - 19.5) / 0.85;
      const p = CoinFlipRenderer.arc({ x: 958, y: 330 }, { x: 540, y: 930 }, 44, u);
      return { ...p, trail: 0.8, flip: (t - 17.55) * 6.5 };
    }
    // A full loop around the shade.
    if (t >= 20.35 && t < 21.15) {
      const u = (t - 20.35) / 0.8;
      const ang = -Math.PI / 2 + u * TAU;
      return {
        x: 540 + Math.cos(ang) * 84,
        y: 1008 + Math.sin(ang) * 84,
        trail: 0.75,
        flip: (t - 17.55) * 6.5,
      };
    }
    // Lampshade -> the book on the chair.
    if (t >= 21.15 && t < 21.85) {
      const u = (t - 21.15) / 0.7;
      const p = CoinFlipRenderer.arc({ x: 540, y: 924 }, { x: 898, y: 1206 }, 30, u);
      return { ...p, trail: 0.7, flip: (t - 17.55) * 6.5 };
    }
    // The book bounce, then the long drop into the glass.
    if (t >= 21.85 && t < 23.1) {
      const u = (t - 21.85) / 1.25;
      const e = 1 - Math.pow(1 - u, 2.2);
      const p = CoinFlipRenderer.arc({ x: 898, y: 1206 }, { x: 690, y: 1005 }, 46, e);
      return { ...p, trail: 0.35 + 0.45 * (1 - u), flip: (t - 17.55) * 6.5 };
    }
    if (t >= 23.1 && t < 23.45) {
      const u = (t - 23.1) / 0.35;
      return { x: 690, y: lerp(1005, 1128, u * u), trail: 0.25, flip: 0.16 };
    }

    // Scene 6: out of the tipped glass and onto his head.
    if (t >= 27.22 && t < 27.56) {
      const u = (t - 27.22) / 0.34;
      return { x: lerp(815, 722, u), y: lerp(699, 734, u * u), trail: 0.2, flip: 0.16 };
    }
    if (t >= 27.56) {
      return { x: 722, y: 734, trail: 0, flip: 0.16 };
    }

    return null;
  }

  private isHoldingCoin(t: number): boolean {
    return t < 2.6 || (t >= 11.05 && t < 11.52) || (t >= 16.6 && t < 17.55);
  }

  // ==========================================================
  // STICKMAN
  // ==========================================================

  private renderStickman(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const trembleX = pose.anger ? Math.sin(t * 42) * 3 : 0;
    const trembleY = pose.anger ? Math.cos(t * 35) * 2 : 0;

    ctx.translate(pose.hipX + trembleX, pose.hipY - pose.jump + trembleY);
    ctx.rotate(pose.lean);
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

    if (this.isHoldingCoin(t)) this.drawHeldCoin(ctx, pose);

    // Neck and head.
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, -220);
    ctx.lineTo(0, -270);
    ctx.stroke();

    ctx.save();
    ctx.translate(0, -334);
    ctx.rotate(pose.headTilt);

    // Head.
    ctx.fillStyle = pose.silhouette ? INK : '#ffffff';
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

    // Eyebrows.
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineWidth = 6;

    const brow = (side: -1 | 1, y: number, kind: BrowStyle) => {
      const x = side * eyeX;
      ctx.beginPath();
      if (kind === 'angry') {
        // Inner end down, outer end up: a proper angry V.
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

      const whiteR =
        pose.eye === 'wide' ? 13 : pose.eye === 'stunned' ? 12 : pose.eye === 'squint' ? 9 : 9;
      ctx.fillStyle = '#ffffff';
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

      // A heavy, angry lid for the suspicious squint.
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
      ctx.strokeStyle = '#ffffff';
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
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, my + 20, 8, 6, 0, 0, TAU);
      ctx.fill();
    }

    if (pose.sweat) {
      ctx.fillStyle = '#ffffff';
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

  private drawHeldCoin(ctx: CanvasRenderingContext2D, pose: Pose) {
    const hand = pose.rightHand;
    this.drawCoin(ctx, hand.x + 9, hand.y - 14, 0.16, 1);
  }

  // ==========================================================
  // THE COIN IN FLIGHT
  // ==========================================================

  private renderCoin(ctx: CanvasRenderingContext2D, t: number) {
    // Inside the glass it rides the glass, then slides to the mouth as it tips.
    if (t >= 23.45 && t < 27.22) {
      const slide = smooth((t - 26.8) / 0.42);
      ctx.save();
      this.glassTransform(ctx, t);
      this.drawCoin(
        ctx,
        lerp(this.glassX - 2, this.glassX, slide),
        lerp(1128, 980, slide),
        0.18,
        1
      );
      ctx.restore();
      return;
    }

    const c = this.coinFlight(t);
    if (!c) return;

    // Motion ghosts behind the coin.
    if (c.trail > 0.45) {
      for (let i = 2; i >= 1; i--) {
        const ghost = this.coinFlight(t - i * 0.035);
        if (!ghost) continue;
        this.drawCoin(ctx, ghost.x, ghost.y, ghost.flip, 1, (c.trail * 0.26) / i);
      }
    }

    this.drawCoin(ctx, c.x, c.y, c.flip, 1);

    // A short speed line while it is really moving.
    if (c.trail > 0.55) {
      const prev = this.coinFlight(t - 0.04);
      if (prev) {
        const ang = Math.atan2(c.y - prev.y, c.x - prev.x);
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(c.x - Math.cos(ang) * 46, c.y - Math.sin(ang) * 46);
        ctx.lineTo(c.x - Math.cos(ang) * 30, c.y - Math.sin(ang) * 30);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  private renderVibrationGhosts(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    if (!pose.anger) return;
    for (const dx of [-5, 5]) {
      const ghost: Pose = { ...pose, hipX: pose.hipX + dx, silhouette: true, sweat: false };
      ctx.save();
      ctx.globalAlpha = 0.1;
      this.renderStickman(ctx, ghost, t);
      ctx.restore();
    }
  }

  // ==========================================================
  // IMPACT EFFECTS
  // ==========================================================

  private impactBurst(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    u: number,
    color: string
  ) {
    if (u < 0 || u > 1) return;
    const alpha = 1 - u;
    const r0 = 10 + 26 * u;
    const r1 = 22 + 44 * u;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 6 * (1 - u * 0.5);
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
      ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      ctx.stroke();
    }
    ctx.restore();
  }

  private sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = GOLD;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + Math.PI / 4;
      const px = x + Math.cos(a) * size;
      const py = y + Math.sin(a) * size;
      ctx.beginPath();
      ctx.moveTo(px, py - 6);
      ctx.lineTo(px + 3, py);
      ctx.lineTo(px, py + 6);
      ctx.lineTo(px - 3, py);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private stars(ctx: CanvasRenderingContext2D, x: number, y: number, u: number) {
    if (u < 0 || u > 1) return;
    ctx.save();
    ctx.globalAlpha = 1 - u;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU + u * 2.4;
      const r = 34 + u * 26;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      const s = 9 * (1 - u * 0.4);
      ctx.beginPath();
      ctx.moveTo(px - s, py);
      ctx.lineTo(px + s, py);
      ctx.moveTo(px, py - s);
      ctx.lineTo(px, py + s);
      ctx.stroke();
    }
    ctx.restore();
  }

  private puff(ctx: CanvasRenderingContext2D, x: number, y: number, u: number) {
    if (u < 0 || u > 1) return;
    ctx.save();
    ctx.globalAlpha = 0.38 * (1 - u);
    ctx.fillStyle = INK;
    for (const dx of [-26, 0, 26]) {
      ctx.beginPath();
      ctx.arc(x + dx + (dx > 0 ? u * 14 : -u * 14), y - u * 12, 5 + u * 7, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderEffects(ctx: CanvasRenderingContext2D, t: number, pose: Pose) {
    // The coin clangs the glass rim.
    this.impactBurst(ctx, 728, 982, (t - 4.62) / 0.26, INK);
    // ...and bonks him on the forehead.
    if (t > 5.34 && t < 5.75) this.stars(ctx, 330, 790, (t - 5.34) / 0.41);

    // The books land.
    for (const dropAt of [8.45, 8.95, 9.45]) {
      this.puff(ctx, 470, 1142, (t - dropAt) / 0.3);
    }
    // The spoon snaps.
    this.puff(ctx, 454, 1014, (t - 12.0) / 0.28);
    // The coin drops into his shoe.
    this.puff(ctx, 365, 1448, (t - 13.4) / 0.28);
    // The stomp.
    if (t > 15.62 && t < 16.0) {
      const u = (t - 15.62) / 0.38;
      ctx.save();
      ctx.globalAlpha = 0.5 * (1 - u);
      ctx.fillStyle = INK;
      for (const dx of [-30, 0, 30]) {
        ctx.beginPath();
        ctx.arc(720 + dx + u * 18, 1452 - u * 10, 6 + u * 8, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // The ricochet hits.
    this.impactBurst(ctx, 960, 330, (t - 19.5) / 0.3, INK);
    this.impactBurst(ctx, 540, 935, (t - 20.35) / 0.28, INK);
    this.impactBurst(ctx, 898, 1206, (t - 21.85) / 0.28, INK);

    // The winning splash: a crown of water out of the glass.
    if (t > 23.45 && t < 24.3) {
      const u = (t - 23.45) / 0.85;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.fillStyle = WATER;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * 0.34;
        const r = 34 + u * 96;
        const px = 690 + Math.cos(a) * r * 0.8;
        const py = 986 + Math.sin(a) * r;
        ctx.beginPath();
        ctx.ellipse(px, py, 5.5, 8.5, a + Math.PI / 2, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // Rings on the water surface.
      ctx.save();
      ctx.globalAlpha = 0.8 * (1 - u);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(690, 1082, 20 + u * 46, 5 + u * 10, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();

      this.sparkle(ctx, 720, 900, 120 + u * 70, 1 - u);
    }

    // The tipped glass pours a fat ribbon of water onto his head.
    if (t > 27.14 && t < 27.7) {
      ctx.save();
      ctx.globalAlpha = clamp(1 - (t - 27.56) / 0.14, 0, 1);
      ctx.fillStyle = WATER;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(812, 688);
      ctx.quadraticCurveTo(806, 752, 744, 796);
      ctx.lineTo(702, 778);
      ctx.quadraticCurveTo(762, 730, 776, 686);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // The splash on his head.
    if (t > 27.34 && t < 28.0) {
      const u = (t - 27.34) / 0.66;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.fillStyle = WATER;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        const a = -Math.PI / 2 + (i - 3.5) * 0.42;
        const r = 26 + u * 78;
        ctx.beginPath();
        ctx.ellipse(
          720 + Math.cos(a) * r,
          800 + Math.sin(a) * r * 0.8,
          5,
          8,
          a + Math.PI / 2,
          0,
          TAU
        );
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // The coin lands on his head.
    if (t > 27.56 && t < 27.98) this.stars(ctx, 722, 730, (t - 27.56) / 0.42);

    // Drips run off his head.
    if (t > 27.7 && t < 29.05) {
      ctx.save();
      ctx.fillStyle = WATER;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) {
        const start = 27.7 + i * 0.2;
        const u = (t - start) / 0.55;
        if (u < 0 || u > 1) continue;
        const px = 694 + i * 12 + Math.sin(u * 7) * 3;
        const py = 806 + u * 96;
        ctx.beginPath();
        ctx.ellipse(px, py, 4.5, 7.5, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Silent rage ticks beside his head.
    if (t > 28.7 && t < 29.35) {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const pulse = Math.sin((t - 28.7) * 14) * 6;
      for (const [dx, dy] of [
        [-118, 700],
        [118, 730],
      ] as const) {
        ctx.beginPath();
        ctx.moveTo(720 + dx, dy - 16 - pulse);
        ctx.lineTo(720 + dx, dy + 16 + pulse);
        ctx.stroke();
      }
      ctx.restore();
    }

    // A tiny puddle spreading under the table.
    if (t > 27.7) {
      const u = clamp((t - 27.7) / 0.7, 0, 1);
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = WATER;
      ctx.beginPath();
      ctx.ellipse(690, 1458, 30 + u * 54, 5 + u * 4, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    if (pose.anger && t < 29.2) {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(pose.hipX, 1452, 60, 8, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }
}
