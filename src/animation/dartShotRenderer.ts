import { StudioConfig } from '../types';

/**
 * DartShotRenderer
 *
 * "THE ANGRY STICKMAN VS. THE IMPOSSIBLE DART SHOT" â€” a 30-second vertical
 * comedy on the same one-room stickman rig as the ping-pong short.
 *
 * Scene 1 0-4     ONE SHOT. EASY.       (smug bounce, point, thumbs-up)
 * Scene 2 4-8     IMPOSSIBLE!           (wild throw, dart in the noticeboard)
 * Scene 3 8-14    100% ACCURATE!        (book / ruler / spoon launcher, dart
 *                                        lands in his own head)
 * Scene 4 14-19   JUST HIT THE BOARD!   (rage, stomp, final throw)
 * Scene 5 19-25   PERFECT!              (clock / lampshade / chair ricochet
 *                                        into the bullseye)
 * Scene 6 25-30   I QUIT.               (celebration, dartboard helmet)
 *
 * White room, black outlines, one flat red accent for the board and the dart
 * flights. The dartboard hangs on the right wall, the thrower lives on the
 * left, and the whole film is one continuous camera move with hard cuts.
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
// Minimalist Monochrome palette: stark ink black and pure white
const RED = '#000000';
const INK = '#000000';
const PANEL = '#ededed';

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
  { text: 'ONE SHOT. EASY.', from: 0.5, to: 3.86 },
  { text: 'IMPOSSIBLE!', from: 5.95, to: 7.86 },
  { text: '100% ACCURATE!', from: 8.4, to: 13.25 },
  { text: 'JUST HIT THE BOARD!', from: 14.1, to: 17.5 },
  { text: 'PERFECT!', from: 22.75, to: 24.95 },
  { text: 'I QUIT.', from: 27.9, to: 29.7 },
];

export class DartShotRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  private readonly floorY = 1460;
  private readonly ceilingY = 150;
  private readonly leftWallX = 42;
  private readonly rightWallX = 1400;

  private readonly tableLeft = 360;
  private readonly tableRight = 620;
  private readonly tableTop = 1150;

  // The dartboard hangs on the right wall. r = 120 keeps its bottom 16 px above
  // the stickman's head so he can stand underneath it for the final gag.
  private readonly boardX = 880;
  private readonly boardY = 620;
  private readonly boardR = 120;

  private readonly clockX = 960;
  private readonly clockY = 260;
  private readonly clockR = 66;

  private readonly noticeX = 520;
  private readonly noticeY = 560;

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 540, y: 980, zoom: 1.0 },
    { t: 2.3, x: 540, y: 980, zoom: 1.0 },
    { t: 2.8, x: 430, y: 960, zoom: 1.15 },
    { t: 3.98, x: 430, y: 960, zoom: 1.15 },
    { t: 4.12, x: 560, y: 1000, zoom: 1.0 },
    { t: 5.05, x: 560, y: 1000, zoom: 1.0 },
    { t: 5.25, x: 300, y: 960, zoom: 1.36 },
    { t: 6.9, x: 300, y: 960, zoom: 1.36 },
    { t: 7.1, x: 520, y: 940, zoom: 1.08 },
    { t: 7.75, x: 520, y: 940, zoom: 1.08 },
    { t: 8.15, x: 470, y: 1000, zoom: 1.06 },
    { t: 11.9, x: 470, y: 1000, zoom: 1.06 },
    { t: 12.2, x: 520, y: 940, zoom: 1.0 },
    { t: 12.9, x: 520, y: 940, zoom: 1.0 },
    { t: 13.1, x: 320, y: 970, zoom: 1.34 },
    { t: 13.95, x: 320, y: 970, zoom: 1.34 },
    { t: 14.1, x: 620, y: 990, zoom: 1.12 },
    { t: 15.0, x: 620, y: 1020, zoom: 1.2 },
    { t: 15.6, x: 650, y: 1230, zoom: 1.3 },
    { t: 16.6, x: 650, y: 1230, zoom: 1.3 },
    { t: 17.0, x: 660, y: 930, zoom: 1.3 },
    { t: 18.4, x: 720, y: 910, zoom: 1.2 },
    { t: 19.0, x: 540, y: 1000, zoom: 1.05 },
    { t: 22.2, x: 610, y: 990, zoom: 1.05 },
    { t: 22.6, x: 880, y: 940, zoom: 1.25 },
    { t: 23.4, x: 880, y: 980, zoom: 1.4 },
    { t: 23.7, x: 620, y: 990, zoom: 1.42 },
    { t: 24.9, x: 620, y: 930, zoom: 1.28 },
    { t: 25.1, x: 860, y: 960, zoom: 1.15 },
    { t: 26.1, x: 860, y: 960, zoom: 1.15 },
    { t: 26.5, x: 880, y: 860, zoom: 1.2 },
    { t: 26.9, x: 845, y: 940, zoom: 1.18 },
    { t: 30.0, x: 845, y: 940, zoom: 1.18 },
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
    this.renderNoticeboard(ctx);
    if (t < 26.45) this.renderMountedBoard(ctx, t);
    this.renderLauncher(ctx, t);
    this.renderStuckDarts(ctx, t);
    this.renderVibrationGhosts(ctx, pose, t);
    this.renderStickman(ctx, pose, t);
    if (t >= 26.45 && t < 26.85) this.renderFallingBoard(ctx, t);
    this.renderFlyingDart(ctx, t);
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
      kick(4.85, 9, 7) +
      kick(12.78, 9, 6) +
      kick(23.4, 8, 8) +
      kick(26.85, 7, 12);
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
      // Minimalist Monochrome: Heavy black ink outline, pure white text
      ctx.strokeStyle = INK;
      ctx.lineWidth = 18;
      ctx.strokeText(text, 0, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }

  private renderSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
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
    ctx.ellipse(760, this.floorY + 8, 82, 11, 0, 0, TAU);
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
    // The bump at 27.95 rocks the chair for a beat.
    const bumpU = clamp((t - 27.95) / 0.7, 0, 1);
    const rock = t > 27.95 ? Math.sin(bumpU * Math.PI * 3) * 0.14 * (1 - bumpU) : 0;
    const cx = 760;
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
    ctx.rect(798, 1120, 20, 124);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(770, 1112, 48, 20);
    ctx.fill();
    ctx.stroke();

    // Seat.
    ctx.beginPath();
    ctx.rect(700, 1244, 118, 18);
    ctx.fill();
    ctx.stroke();

    // Legs.
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(712, 1262);
    ctx.lineTo(706, this.floorY);
    ctx.moveTo(808, 1262);
    ctx.lineTo(814, this.floorY);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // TABLE LAMP
  // ==========================================================

  private renderLamp(ctx: CanvasRenderingContext2D, t: number) {
    // The shade swings when the dart clips it at 20.2.
    const hit = t > 20.2 ? Math.exp(-(t - 20.2) * 4) * Math.sin((t - 20.2) * 26) * 0.16 : 0;
    const pivotX = 580;
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
    ctx.ellipse(580, 1148, 40, 9, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(580, 1144);
    ctx.lineTo(580, 1050);
    ctx.stroke();

    // Shade: a trapezoid with a rounded bottom lip.
    ctx.beginPath();
    ctx.moveTo(554, 978);
    ctx.lineTo(606, 978);
    ctx.lineTo(628, 1038);
    ctx.lineTo(532, 1038);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // A bulb glow hint: a small white circle under the shade.
    ctx.beginPath();
    ctx.arc(580, 1044, 8, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // WALL CLOCK
  // ==========================================================

  private renderClock(ctx: CanvasRenderingContext2D, t: number) {
    const hit = t > 19.35 ? Math.exp(-(t - 19.35) * 5) * Math.sin((t - 19.35) * 30) * 0.16 : 0;
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
  // NOTICEBOARD (the miss target)
  // ==========================================================

  private renderNoticeboard(ctx: CanvasRenderingContext2D) {
    const w = 260;
    const h = 200;
    ctx.save();
    ctx.fillStyle = PANEL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.fillRect(this.noticeX - w / 2, this.noticeY - h / 2, w, h);
    ctx.strokeRect(this.noticeX - w / 2, this.noticeY - h / 2, w, h);

    // Three pinned notes. No text, just clean rectangles, so the board reads at
    // a glance without adding clutter.
    const notes: { x: number; y: number; r: number; tilt: number }[] = [
      { x: -70, y: -30, r: 0.03, tilt: 0.05 },
      { x: 10, y: 18, r: 0.04, tilt: -0.06 },
      { x: 68, y: -38, r: 0.05, tilt: 0.04 },
    ];
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    for (const note of notes) {
      ctx.save();
      ctx.translate(this.noticeX + note.x, this.noticeY + note.y);
      ctx.rotate(note.tilt);
      ctx.beginPath();
      ctx.rect(-30, -36, 60, 72);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Corner pins.
    ctx.fillStyle = INK;
    for (const [dx, dy] of [
      [-w / 2 + 12, -h / 2 + 12],
      [w / 2 - 12, -h / 2 + 12],
      [-w / 2 + 12, h / 2 - 12],
      [w / 2 - 12, h / 2 - 12],
    ] as const) {
      ctx.beginPath();
      ctx.arc(this.noticeX + dx, this.noticeY + dy, 4, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // ==========================================================
  // DARTBOARD
  // ==========================================================

  /**
   * The board face: red outer ring, alternating black/white scoring wedges,
   * a black outer bull and the red bullseye. `rot` is a drawing rotation in
   * radians, used by the wobble and the helmet landing.
   */
  private drawBoardFace(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    rot: number,
    hole: boolean
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // White disc.
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Alternating wedges inside the red ring.
    const innerR = r * 0.8;
    const bullR = r * 0.18;
    const wedges = 20;
    for (let i = 0; i < wedges; i++) {
      if (i % 2 !== 0) continue;
      const a0 = (i / wedges) * TAU - Math.PI / 2;
      const a1 = ((i + 1) / wedges) * TAU - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(0, 0, innerR, a0, a1);
      ctx.arc(0, 0, bullR, a1, a0, true);
      ctx.closePath();
      ctx.fillStyle = INK;
      ctx.fill();
    }

    // Red treble ring: reads cleanly over both the black and white sectors.
    ctx.strokeStyle = RED;
    ctx.lineWidth = r * 0.07;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.57, 0, TAU);
    ctx.stroke();

    // Wire spider.
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < wedges; i++) {
      const a = (i / wedges) * TAU - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * bullR, Math.sin(a) * bullR);
      ctx.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
      ctx.stroke();
    }

    // Red outer ring, edged in black.
    ctx.strokeStyle = RED;
    ctx.lineWidth = r * 0.13;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.915, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.98, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, TAU);
    ctx.stroke();

    // Black outer bull and red bullseye.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, bullR, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, bullR * 0.62, 0, TAU);
    ctx.fillStyle = INK;
    ctx.fill();

    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(0, 0, bullR * 0.3, 0, TAU);
    ctx.fill();

    if (hole) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.035, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderMountedBoard(ctx: CanvasRenderingContext2D, t: number) {
    // A creak and a tip forward just before the mount lets go.
    let rot = 0;
    let dy = 0;
    if (t > 25.95) {
      const u = clamp((t - 25.95) / 0.5, 0, 1);
      rot = -0.1 * smooth(u) + Math.sin(t * 39) * 0.012 * u;
      dy = 8 * smooth(u);
    }
    // Bullseye wobble after the hit.
    if (t > 23.4 && t < 25.9) {
      rot += Math.exp(-(t - 23.4) * 6) * Math.sin((t - 23.4) * 30) * 0.03;
    }
    this.drawBoardFace(ctx, this.boardX, this.boardY + dy, this.boardR, rot, t > 25.55);

    // Mounting bracket peeking above the board.
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(this.boardX, this.boardY + dy - this.boardR - 2);
    ctx.lineTo(this.boardX, this.boardY + dy - this.boardR - 20);
    ctx.stroke();
    ctx.restore();
  }

  private renderFallingBoard(ctx: CanvasRenderingContext2D, t: number) {
    const u = smooth((t - 26.45) / 0.4);
    const cy = lerp(this.boardY + 8, 826, u);
    const cx = lerp(this.boardX, 880, u);
    const rot = lerp(-0.1, -0.03, u);
    const squash = 1 + 0.1 * Math.exp(-Math.max(0, t - 26.85) * 20);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 1 / squash);
    ctx.translate(-cx, -cy);
    this.drawBoardFace(ctx, cx, cy, this.boardR, rot, true);
    ctx.restore();
  }

  // ==========================================================
  // BOOK / RULER / SPOON LAUNCHER
  // ==========================================================

  private renderLauncher(ctx: CanvasRenderingContext2D, t: number) {
    const books = [0, 1, 2];
    const baseY = 1148;
    // The whole contraption is swiped off the table at 13.62.
    const fly = smooth((t - 13.62) / 0.45);
    const flyAlpha = 1 - fly;

    ctx.save();
    ctx.globalAlpha = flyAlpha;
    // Spin in place around the stack's centre, then carry it off the table.
    ctx.translate(450, 1080);
    ctx.rotate(-fly * 0.9);
    ctx.translate(-450, -1080);
    ctx.translate(-fly * 260, -fly * 140);
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
      ctx.rect(380, y - 30, 140, 32);
      ctx.fill();
      ctx.stroke();
      // Spine line.
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(402, y - 28);
      ctx.lineTo(402, y + 1);
      ctx.stroke();
    }

    // Ruler balanced across the stack.
    if (t >= 10.0) {
      const drop = smooth((t - 10.0) / 0.2);
      const y = 1044 - (1 - drop) * 90;
      ctx.save();
      ctx.translate(450, y);
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
      ctx.translate(380, 1044);
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
      // The loaded dart rides in the bowl until the launch.
      if (t >= 11.5 && t < 12.0) {
        this.drawDart(ctx, 54, -42, -0.72 - bend, 1, 1);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // ==========================================================
  // CHARACTER POSITION
  // ==========================================================

  private charXAt(t: number): number {
    if (t < 7.7) return 265;
    if (t < 8.35) return lerp(265, 310, smooth((t - 7.7) / 0.65));
    if (t < 13.7) return 310;
    if (t < 14.35) return lerp(310, 700, smooth((t - 13.85) / 0.5));
    if (t < 25.0) return 700;
    if (t < 27.75) return 880;
    return lerp(880, 845, smooth((t - 27.75) / 0.35));
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
    else if (t < 13.85) this.poseEngineer(p, t);
    else if (t < 19) this.poseRage(p, t);
    else if (t < 25) this.poseTrickshot(p, t);
    else this.poseChampion(p, t);
    return p;
  }

  // ==========================================================
  // POSES
  // ==========================================================

  private poseChallenge(p: Pose, t: number) {
    p.gazeX = 0.85;
    p.gazeY = -0.55;
    p.brow = 'oneRaised';
    p.mouth = 'smirk';
    p.rightHand = { x: 78, y: -240 };
    p.rightHandStyle = 'hold';
    p.leftHand = { x: -58, y: -44 };

    // Shoulder roll.
    if (t > 0.7 && t < 1.3) {
      const a = ((t - 0.7) / 0.6) * TAU;
      p.rightHand = { x: 100 + Math.cos(a) * 26, y: -190 + Math.sin(a) * 26 };
      p.rightElbow = 36 + Math.sin(a) * 18;
      p.headTilt = 0.05;
      return;
    }

    // Stretch across the chest.
    if (t >= 1.3 && t < 1.8) {
      const u = smooth((t - 1.3) / 0.2);
      p.rightHand = { x: lerp(78, -66, u), y: lerp(-240, -252, u) };
      p.rightElbow = -40;
      p.headTilt = 0.09;
      p.mouth = 'flat';
      p.brow = 'raised';
      return;
    }

    // Point at the bullseye with the free hand.
    if (t >= 1.8 && t < 2.3) {
      p.leftHand = { x: 196, y: -178 };
      p.leftElbow = 6;
      p.leftHandStyle = 'point';
      p.rightHand = { x: 64, y: -232 };
      p.mouth = 'smirk';
      p.brow = 'determined';
      p.lean = 0.03;
      return;
    }

    // Smug thumbs-up.
    if (t >= 2.3 && t < 2.85) {
      p.leftHand = { x: -86, y: -176 };
      p.leftElbow = -40;
      p.leftHandStyle = 'thumb';
      p.rightHand = { x: 64, y: -238 };
      p.mouth = 'grin';
      p.brow = 'oneRaised';
      p.headTilt = -0.06;
      return;
    }

    // Raise the dart and line the shot up.
    if (t >= 2.85) {
      const u = smooth((t - 2.85) / 0.3);
      p.rightHand = { x: lerp(64, 104, u), y: lerp(-238, -318, u) };
      p.rightElbow = 30;
      p.leftHand = { x: -74, y: -84 };
      p.leftElbow = -18;
      p.brow = 'oneRaised';
      p.mouth = 'smirk';
      p.eye = 'normal';
      p.gazeX = 0.6;
      p.gazeY = -0.5;
      p.lean = lerp(0.02, -0.04, u);
      p.headTilt = -0.04;
    }
  }

  private poseMiss(p: Pose, t: number) {
    p.gazeX = 0.9;
    p.gazeY = -0.5;
    p.rightHand = { x: 78, y: -240 };
    p.rightHandStyle = 'hold';

    // Wind-up.
    if (t < 4.18) {
      p.rightHand = { x: 8, y: -272 };
      p.rightElbow = -34;
      p.lean = -0.08;
      p.brow = 'determined';
      p.mouth = 'grit';
      p.eye = 'squint';
      return;
    }

    // Release.
    if (t < 4.38) {
      const u = smooth((t - 4.18) / 0.2);
      p.rightHand = { x: lerp(8, 208, u), y: lerp(-272, -272, u) };
      p.rightElbow = 12;
      p.rightHandStyle = 'open';
      p.leftHand = { x: -96, y: -96 };
      p.lean = 0.15;
      p.eye = 'wide';
      p.mouth = 'open';
      p.brow = 'raised';
      return;
    }

    // Frozen follow-through.
    p.rightHand = { x: 208, y: -272 };
    p.rightElbow = 16;
    p.rightHandStyle = 'open';
    p.leftHand = { x: -92, y: -92 };
    p.lean = 0.1;

    if (t < 5.5) {
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      return;
    }

    // Look at the misplaced dart.
    if (t < 6.1) {
      p.headTilt = 0.16;
      p.gazeX = 0.8;
      p.gazeY = 0.45;
      p.eye = 'wide';
      p.brow = 'oneRaised';
      p.mouth = 'flat';
      return;
    }

    // Look at the board.
    if (t < 6.5) {
      p.headTilt = -0.14;
      p.gazeX = 0.55;
      p.gazeY = -0.7;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      return;
    }

    // Look right at the camera.
    p.headTilt = 0;
    p.gazeX = 0;
    p.gazeY = 0;
    p.eye = 'stunned';
    p.brow = 'raised';
    p.mouth = 'o';
    p.pupilScale = 0.7;

    // Disbelief, then fists.
    if (t > 7.15) {
      p.lean = -0.07;
      p.mouth = 'open';
      p.eye = 'wide';
    }
    if (t > 7.55) {
      p.lean = 0.12;
      p.mouth = 'grit';
      p.brow = 'angry';
      p.eye = 'squint';
      p.rightHandStyle = 'fist';
      p.rightHand = { x: -60, y: -60 };
      p.leftHand = { x: -84, y: -52 };
      p.leftHandStyle = 'fist';
    }
  }

  private poseEngineer(p: Pose, t: number) {
    p.gazeX = 0.7;
    p.gazeY = 0.2;

    // March to the table.
    if (t < 8.35) {
      const u = (t - 8.0) / 0.35;
      p.leftFoot = { x: -55 + Math.sin(u * TAU) * 26, y: 300 - Math.abs(Math.sin(u * TAU)) * 26 };
      p.rightFoot = { x: 55 - Math.sin(u * TAU) * 26, y: 300 - Math.abs(Math.cos(u * TAU)) * 18 };
      p.rightHand = { x: 70, y: -70 };
      p.leftHand = { x: -70, y: -70 };
      p.lean = 0.08;
      p.mouth = 'grit';
      return;
    }

    p.hipX = 310;

    // Drop the books into a stack.
    if (t < 9.4) {
      const u = (t - 8.4) / 1.0;
      const bob = Math.abs(Math.sin(u * Math.PI * 3));
      p.rightHand = { x: 150, y: -46 - bob * 34 };
      p.rightElbow = 28;
      p.leftHand = { x: -46, y: -70 };
      p.lean = 0.1;
      p.gazeX = 0.75;
      p.gazeY = 0.45;
      p.mouth = 'grit';
      p.brow = 'determined';
      return;
    }

    // Balance the ruler.
    if (t < 10.05) {
      const u = (t - 9.4) / 0.65;
      const wobble = Math.sin(u * Math.PI * 4) * 8;
      p.rightHand = { x: 150 + wobble, y: -110 };
      p.leftHand = { x: 124 - wobble, y: -118 };
      p.rightElbow = 22;
      p.leftElbow = 24;
      p.lean = 0.12;
      p.gazeX = 0.7;
      p.gazeY = 0.5;
      p.eye = 'normal';
      p.brow = 'determined';
      p.mouth = 'grit';
      return;
    }

    // Bend the spoon.
    if (t < 10.6) {
      p.rightHand = { x: 140, y: -140 };
      p.leftHand = { x: 130, y: -164 };
      p.rightElbow = 26;
      p.leftElbow = 30;
      p.lean = 0.13;
      p.gazeY = 0.55;
      p.eye = 'squint';
      p.brow = 'determined';
      p.mouth = 'grit';
      return;
    }

    // Rub the hands, mad-scientist style.
    if (t < 11.1) {
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

    // Proud nod.
    if (t < 11.55) {
      const u = (t - 11.1) / 0.45;
      p.rightHand = { x: 64, y: -140 };
      p.leftHand = { x: -78, y: -130 };
      p.rightElbow = 30;
      p.leftElbow = -28;
      p.lean = -0.05;
      p.headTilt = Math.sin(u * Math.PI) * 0.16;
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'grin';
      p.gazeX = 0.5;
      p.gazeY = 0.3;
      return;
    }

    // Pull the launcher back.
    if (t < 12.0) {
      const u = smooth((t - 11.55) / 0.3);
      p.rightHand = { x: lerp(130, 145, u), y: lerp(-162, -113, u) };
      p.rightElbow = 34;
      p.leftHand = { x: 40, y: -90 };
      p.lean = 0.06;
      p.eye = 'squint';
      p.brow = 'determined';
      p.mouth = 'grit';
      p.gazeX = 0.4;
      p.gazeY = 0.4;
      return;
    }

    // Release!
    if (t < 12.35) {
      p.rightHand = { x: 150, y: -196 };
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

    // Watch the dart loop.
    if (t < 12.85) {
      p.rightHand = { x: 150, y: -150 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -40, y: -120 };
      p.headTilt = -0.12;
      p.lean = -0.02;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeX = 0.3;
      p.gazeY = -1;
      return;
    }

    // The dart lands in his head.
    if (t < 13.12) {
      p.rightHand = { x: 140, y: -140 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -50, y: -120 };
      p.eye = 'stunned';
      p.brow = 'raised';
      p.mouth = 'flat';
      p.headTilt = 0.04;
      p.lean = 0.02;
      p.pupilScale = 0.7;
      return;
    }

    // Reach up and pull it out.
    if (t < 13.3) {
      p.rightHand = { x: 78, y: -392 };
      p.rightElbow = -8;
      p.leftHand = { x: -56, y: -60 };
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeY = -1;
      p.headTilt = 0.05;
      return;
    }

    // Stare at the dart in his hand, left arm already over the launcher.
    if (t < 13.6) {
      p.rightHand = { x: 84, y: -250 };
      p.rightHandStyle = 'hold';
      p.rightElbow = 26;
      p.leftHand = { x: 196, y: -140 };
      p.leftHandStyle = 'open';
      p.gazeX = 0.6;
      p.gazeY = 0.3;
      p.eye = 'squint';
      p.brow = 'angry';
      p.mouth = 'grit';
      p.headTilt = 0.06;
      p.anger = true;
      return;
    }

    // Sweep the launcher off the table.
    const u = smooth((t - 13.6) / 0.25);
    p.rightHand = { x: 84, y: -250 };
    p.rightHandStyle = 'hold';
    // A flat swat just above the ruler, so the arm never ploughs through the stack.
    p.leftHand = { x: lerp(196, -120, u), y: -150 };
    p.leftHandStyle = 'open';
    p.leftElbow = -10;
    p.lean = 0.16;
    p.eye = 'squint';
    p.brow = 'angry';
    p.mouth = 'grit';
    p.anger = true;
  }

  private poseRage(p: Pose, t: number) {
    p.gazeX = 0.6;
    p.gazeY = -0.5;
    p.brow = 'angry';
    p.mouth = 'grit';
    p.eye = 'squint';
    p.anger = true;

    // Stomp across the room to the throwing spot.
    if (t < 14.35) {
      const u = clamp((t - 13.85) / 0.5, 0, 1);
      const swing = Math.sin(u * TAU * 1.5);
      p.rightFoot = { x: 30 + swing * 40, y: 300 - Math.max(0, swing) * 42 };
      p.leftFoot = { x: -30 + swing * 40, y: 300 - Math.max(0, -swing) * 42 };
      p.rightHand = { x: 62 - swing * 26, y: -118 };
      p.leftHand = { x: -62 - swing * 26, y: -126 };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.lean = 0.06;
      p.squashY = 1 + Math.abs(swing) * 0.015;
      return;
    }

    // Tremble.
    if (t < 14.9) {
      p.rightHand = { x: 66, y: -66 };
      p.leftHand = { x: -66, y: -66 };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.lean = -0.03;
      return;
    }

    // Silent scream.
    if (t < 15.35) {
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
    if (t < 15.7) {
      const u = (t - 15.35) / 0.35;
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
    if (t < 16.7) {
      const u = smooth((t - 15.7) / 0.6);
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

    // Big wind-up.
    if (t < 17.45) {
      const u = smooth((t - 16.7) / 0.55);
      p.rightHand = { x: lerp(96, 112, u), y: lerp(-70, -340, u) };
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

    // Throw.
    if (t < 17.7) {
      const u = smooth((t - 17.45) / 0.2);
      p.rightHand = { x: lerp(112, 206, u), y: lerp(-340, -252, u) };
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
    if (t < 18.35) {
      p.rightHand = { x: 216, y: -164 };
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

    // Eyes track the dart across the room.
    const dart = this.dartFlight(t);
    if (dart && t < 23.4) {
      const dx = dart.x - (p.hipX + 2);
      const dy = dart.y - 826;
      p.gazeX = clamp(dx / 320, -0.9, 0.95);
      p.gazeY = clamp(dy / 320, -0.9, 0.95);
      p.headTilt = clamp(dx / 4000, -0.1, 0.1);
    }

    if (t < 23.4) {
      p.pupilScale = 1;
      return;
    }

    // Bullseye.
    if (t < 24.05) {
      p.gazeX = 0.55;
      p.gazeY = -0.6;
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.pupilScale = 1.35;
      p.lean = -0.06;
      p.squashY = 1.03;
      return;
    }

    // Slowly raise both arms.
    if (t < 24.65) {
      const u = smooth((t - 24.05) / 0.6);
      p.rightHand = { x: lerp(70, 104, u), y: lerp(-56, -300, u) };
      p.leftHand = { x: lerp(-70, -104, u), y: lerp(-56, -300, u) };
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'grin';
      p.gazeX = 0.4;
      p.gazeY = -0.5;
      p.lean = -0.02;
      return;
    }

    // Celebration starts.
    const u = (t - 24.65) / 0.35;
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

    // Victory dance under the board.
    if (t < 25.55) {
      const phase = (t - 25.0) * 9;
      p.rightHand = { x: 90 + Math.sin(phase) * 26, y: -300 - Math.cos(phase) * 20 };
      p.leftHand = { x: -90 - Math.sin(phase) * 26, y: -300 + Math.cos(phase) * 20 };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.jump = Math.abs(Math.sin(phase * 0.7)) * 34;
      p.hipY = this.floorY - 300;
      p.headTilt = Math.sin(phase * 0.7) * 0.08;
      p.mouth = 'scream';
      return;
    }

    // Hop up and pluck the dart out of the bullseye.
    if (t < 25.72) {
      const u = (t - 25.55) / 0.17;
      p.jump = Math.sin(u * Math.PI) * 58;
      p.rightHand = { x: 0, y: -486 };
      p.rightElbow = -6;
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -80, y: -110 };
      p.eye = 'wide';
      p.mouth = 'open';
      p.gazeY = -1;
      p.brow = 'raised';
      return;
    }

    // Flick it away.
    if (t < 25.9) {
      p.jump = 0;
      p.rightHand = { x: 128, y: -318 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -84, y: -100 };
      p.eye = 'happy';
      p.mouth = 'grin';
      p.gazeX = 0.2;
      p.gazeY = -0.5;
      return;
    }

    // Proud pose.
    if (t < 26.6) {
      p.rightHand = { x: 84, y: -268 };
      p.leftHand = { x: -84, y: -268 };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.eye = 'happy';
      p.mouth = 'grin';
      p.lean = -0.03;
      p.gazeX = 0.15;
      p.gazeY = -0.4;
      return;
    }

    // Board lands on his head.
    if (t < 26.9) {
      const u = smooth((t - 26.6) / 0.25);
      p.rightHand = { x: lerp(84, 96, u), y: lerp(-268, -170, u) };
      p.leftHand = { x: lerp(-84, -96, u), y: lerp(-268, -170, u) };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.squashY = 0.94;
      p.eye = 'wide';
      p.mouth = 'o';
      p.brow = 'raised';
      p.headTilt = 0;
      p.lean = 0.04;
      return;
    }

    // Freeze, try to look around.
    if (t < 27.6) {
      const u = (t - 26.9) / 0.7;
      p.rightHand = { x: 70, y: -110 };
      p.leftHand = { x: -70, y: -110 };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.headTilt = Math.sin(u * Math.PI * 2) * 0.16;
      p.eye = 'wide';
      p.mouth = 'flat';
      p.lean = 0.02;
      return;
    }

    // One small step into the chair.
    if (t < 28.1) {
      const u = smooth((t - 27.75) / 0.3);
      p.rightHand = { x: 66, y: -86 };
      p.leftHand = { x: -66, y: -86 };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.leftFoot = { x: -55 - u * 12, y: 300 - Math.sin(u * Math.PI) * 26 };
      p.lean = 0.07;
      p.headTilt = -0.06;
      p.eye = 'squint';
      p.mouth = 'grit';
      return;
    }

    // Silent rage in the helmet.
    p.rightHand = { x: 56, y: -74 };
    p.leftHand = { x: -56, y: -74 };
    p.rightHandStyle = 'fist';
    p.leftHandStyle = 'fist';
    p.anger = t < 29.35;
    p.eye = 'squint';
    p.mouth = 'grit';
    p.headTilt = 0.05;
    p.lean = 0.04;
    p.sweat = true;
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
  private dartFlight(t: number): { x: number; y: number; trail: number } | null {
    // First throw: short, weak, into the noticeboard.
    if (t >= 4.2 && t < 4.85) {
      const u = easeOut((t - 4.2) / 0.65);
      const p = DartShotRenderer.arc({ x: 350, y: 850 }, { x: 560, y: 600 }, 14, u);
      return { ...p, trail: 0.55 };
    }

    // Launcher shot.
    if (t >= 12.0 && t < 12.32) {
      const u = easeOut((t - 12.0) / 0.32);
      const p = DartShotRenderer.arc({ x: 440, y: 998 }, { x: 640, y: 770 }, 22, u);
      return { ...p, trail: 0.9 };
    }
    if (t >= 12.32 && t < 12.62) {
      const u = (t - 12.32) / 0.3;
      const ang = -Math.PI / 2 + u * TAU * 0.82;
      const rad = 90;
      return {
        x: 640 + Math.cos(ang) * rad,
        y: 860 + Math.sin(ang) * rad,
        trail: 0.8,
      };
    }
    if (t >= 12.62 && t < 12.8) {
      const u = (t - 12.62) / 0.18;
      const p = DartShotRenderer.arc({ x: 558, y: 822 }, { x: 388, y: 766 }, 24, u);
      return { ...p, trail: 0.5 };
    }

    // Flicked away after the head gag.
    if (t >= 13.22 && t < 13.48) {
      const u = easeOut((t - 13.22) / 0.26);
      const p = DartShotRenderer.arc({ x: 400, y: 700 }, { x: 120, y: 520 }, 50, u);
      return { ...p, trail: 0.7 };
    }

    // The final throw: rockets up over the board and clips the clock.
    if (t >= 17.55 && t < 18.25) {
      const u = easeOut((t - 17.55) / 0.7);
      const p = DartShotRenderer.arc({ x: 880, y: 860 }, { x: 850, y: 460 }, 30, u);
      return { ...p, trail: 0.95 };
    }
    if (t >= 18.25 && t < 19.35) {
      const u = (t - 18.25) / 1.1;
      const p = DartShotRenderer.arc({ x: 850, y: 460 }, { x: 925, y: 300 }, 40, u * u);
      return { ...p, trail: 0.7 };
    }

    // Clock -> lampshade. The arc bows left so it never crosses the board face.
    if (t >= 19.35 && t < 20.2) {
      const u = (t - 19.35) / 0.85;
      const p = DartShotRenderer.arc({ x: 925, y: 300 }, { x: 580, y: 990 }, 40, u);
      return { ...p, trail: 0.75 };
    }

    // Lampshade -> the chair's back.
    if (t >= 20.2 && t < 20.75) {
      const u = (t - 20.2) / 0.55;
      const p = DartShotRenderer.arc({ x: 580, y: 990 }, { x: 840, y: 1170 }, 28, u);
      return { ...p, trail: 0.7 };
    }

    // A tight loop around the chair.
    if (t >= 20.75 && t < 20.9) {
      const u = (t - 20.75) / 0.15;
      const p = DartShotRenderer.arc({ x: 840, y: 1170 }, { x: 848, y: 1222 }, 0, u);
      return { ...p, trail: 0.5 };
    }
    if (t >= 20.9 && t < 21.05) {
      const u = (t - 20.9) / 0.15;
      const p = DartShotRenderer.arc({ x: 848, y: 1222 }, { x: 788, y: 1292 }, 8, u);
      return { ...p, trail: 0.5 };
    }
    if (t >= 21.05 && t < 21.22) {
      const u = (t - 21.05) / 0.17;
      const p = DartShotRenderer.arc({ x: 788, y: 1292 }, { x: 690, y: 1160 }, 26, u);
      return { ...p, trail: 0.5 };
    }

    // The long, slowing arc into the bullseye.
    if (t >= 21.22 && t < 23.4) {
      const u = (t - 21.22) / 2.18;
      const e = 1 - Math.pow(1 - u, 2.4);
      const p = DartShotRenderer.arc({ x: 690, y: 1160 }, { x: 880, y: 620 }, 54, e);
      const trail = 0.35 + 0.5 * (1 - u);
      return { ...p, trail };
    }

    return null;
  }

  private dartAngle(t: number): number {
    const a = this.dartFlight(Math.max(0, t - 0.008));
    const b = this.dartFlight(t + 0.008);
    if (!a || !b) return 0;
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  private isHoldingDart(t: number): boolean {
    return t < 4.2 || (t >= 11.4 && t < 12.0) || (t >= 16.7 && t < 17.55) || (t >= 25.55 && t < 25.75);
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

    if (this.isHoldingDart(t)) this.drawHeldDart(ctx, pose, t);

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

    // The second dart, stuck in the top of his head.
    if (t >= 12.8 && t < 13.12) {
      this.drawDart(ctx, 8, -58, 2.2, 1.05, 1);
    }

    // The dartboard helmet.
    if (t >= 26.85) {
      this.drawBoardFace(ctx, 0, 2, this.boardR, -0.03, true);
    }

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

  private drawHeldDart(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    let angle = -0.5;
    if (t >= 11.4) angle = -1.28;
    else if (t >= 16.7) angle = -0.72;
    else if (t >= 25.5) angle = -2.4;
    const hand = pose.rightHand;
    this.drawDart(ctx, hand.x + Math.cos(angle) * 26, hand.y + Math.sin(angle) * 26, angle, 1.15, 1);
  }

  // ==========================================================
  // DARTS
  // ==========================================================

  private drawDart(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    scale: number,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // White halo: a dark dart must never vanish against a black wedge.
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(-33, 0);
    ctx.stroke();
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-32, 0);
    ctx.lineTo(-54, -8);
    ctx.lineTo(-60, 0);
    ctx.lineTo(-54, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Blunt tip.
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(0, 0, 3.6, 0, TAU);
    ctx.fill();

    // Barrel.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-33, 0);
    ctx.stroke();

    // Red grip band.
    ctx.strokeStyle = RED;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-17, 0);
    ctx.stroke();

    // Flight.
    ctx.fillStyle = RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-32, 0);
    ctx.lineTo(-54, -8);
    ctx.lineTo(-60, 0);
    ctx.lineTo(-54, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-40, 0);
    ctx.lineTo(-50, -4);
    ctx.lineTo(-54, 0);
    ctx.lineTo(-50, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private renderStuckDarts(ctx: CanvasRenderingContext2D, t: number) {
    // The miss, still stuck in the cork board for the rest of the film.
    if (t >= 4.85) {
      this.drawDart(ctx, 560, 600, -0.08, 1.2, 1);
    }
    // The bullseye dart, until he plucks it out.
    if (t >= 23.4 && t < 25.58) {
      this.drawDart(ctx, this.boardX, this.boardY, -1.24, 1.25, 1);
    }
  }

  private renderFlyingDart(ctx: CanvasRenderingContext2D, t: number) {
    const d = this.dartFlight(t);
    if (!d) return;
    const angle = this.dartAngle(t);

    // Motion ghosts behind the dart.
    for (let i = 2; i >= 1; i--) {
      const ghost = this.dartFlight(t - i * 0.035);
      if (!ghost) continue;
      this.drawDart(
        ctx,
        ghost.x,
        ghost.y,
        this.dartAngle(t - i * 0.035),
        1.05,
        (d.trail * 0.32) / i
      );
    }

    this.drawDart(ctx, d.x, d.y, angle, 1.15, 1);

    // A short ink speed line while it is really moving.
    if (d.trail > 0.55) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(d.x - Math.cos(angle) * 76, d.y - Math.sin(angle) * 76);
      ctx.lineTo(d.x - Math.cos(angle) * 56, d.y - Math.sin(angle) * 56);
      ctx.stroke();
      ctx.restore();
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
    ctx.fillStyle = RED;
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

  private renderEffects(ctx: CanvasRenderingContext2D, t: number, pose: Pose) {
    // Dart hits the cork board.
    this.impactBurst(ctx, 560, 600, (t - 4.85) / 0.3, INK);
    // Dart lands in his own head.
    if (t > 12.8 && t < 13.15) this.stars(ctx, 392, 772, (t - 12.8) / 0.35);
    // Dart clips the clock.
    this.impactBurst(ctx, 925, 300, (t - 19.35) / 0.32, INK);
    // Lampshade.
    this.impactBurst(ctx, 580, 990, (t - 20.2) / 0.3, INK);
    // Chair.
    this.impactBurst(ctx, 846, 1218, (t - 20.78) / 0.3, INK);

    // The bullseye: a red ring that expands outside the board so the dart
    // stays readable against the black wedges.
    if (t > 23.4 && t < 23.95) {
      const u = (t - 23.4) / 0.55;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = RED;
      ctx.lineWidth = 10 * (1 - u * 0.5);
      ctx.beginPath();
      ctx.arc(this.boardX, this.boardY, this.boardR + 12 + u * 70, 0, TAU);
      ctx.stroke();
      ctx.restore();
      this.sparkle(ctx, this.boardX, this.boardY, 150 + u * 60, 1 - u);
    }

    // Stomp dust.
    if (t > 15.38 && t < 15.75) {
      const u = (t - 15.38) / 0.37;
      ctx.save();
      ctx.globalAlpha = 0.5 * (1 - u);
      ctx.fillStyle = INK;
      for (const dx of [-30, 0, 30]) {
        ctx.beginPath();
        ctx.arc(650 + dx + u * 18, 1452 - u * 10, 6 + u * 8, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // The board lands on his head.
    if (t > 26.85 && t < 27.4) this.stars(ctx, 880, 700, (t - 26.85) / 0.55);

    // The bump against the chair.
    if (t > 27.95 && t < 28.25) {
      this.impactBurst(ctx, 812, 1226, (t - 27.95) / 0.3, INK);
    }

    // Red anger ticks beside the board late in the final beat.
    if (t > 28.6 && t < 29.7) {
      ctx.save();
      ctx.strokeStyle = RED;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const pulse = Math.sin((t - 28.6) * 14) * 6;
      for (const [dx, dy] of [
        [-136, 720],
        [136, 760],
      ] as const) {
        ctx.beginPath();
        ctx.moveTo(880 + dx, dy - 16 - pulse);
        ctx.lineTo(880 + dx, dy + 16 + pulse);
        ctx.stroke();
      }
      ctx.restore();
    }

    // A tiny dust puff while he stamps under the board.
    if (pose.anger && t > 28.0) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(pose.hipX, 1452, 60, 8, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }
}
