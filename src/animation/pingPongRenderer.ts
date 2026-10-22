import { StudioConfig } from '../types';

/**
 * PingPongRenderer
 *
 * "THE PING-PONG REVENGE" — a 30-second vertical comedy.
 *
 * Scene 1 0-4     EASIEST TRICKSHOT EVER!  (a smug bounce shot)
 * Scene 2 4-8     WHAT?!                   (miss, wall, forehead bonk)
 * Scene 3 8-13    SCIENTIFIC PRECISION!    (book ramp, foot plop)
 * Scene 4 13-18   I'VE HAD ENOUGH!         (table slam, ball fired upward)
 * Scene 5 18-25   1000 IQ?!                (ceiling / wall / lamp / table
 *                                          ricochet into a cup that lands
 *                                          upright on his head)
 * Scene 6 25-30   I HATE THIS GAME!        (celebration, ball to the
 *                                          forehead, cup over the face)
 *
 * Same flat vector language as the rest of the studio: white background, black
 * outlines, a round white head, thin black limbs, one orange accent for the
 * ball, plus a table, a tiny cup, three books and a hanging lamp.
 */

type EyeStyle =
  | 'normal'
  | 'wide'
  | 'happy'
  | 'closed'
  | 'angry'
  | 'squint'
  | 'stunned'
  | 'cross';
type BrowStyle = 'neutral' | 'angry' | 'raised' | 'determined' | 'sad' | 'oneRaised';
type MouthStyle =
  | 'flat'
  | 'smile'
  | 'grin'
  | 'open'
  | 'o'
  | 'grit'
  | 'frown'
  | 'wobble'
  | 'smirk';
type HandStyle = 'relaxed' | 'fist' | 'open' | 'point' | 'hold';

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
  /** Drawn as a solid black silhouette for the rage beat. */
  silhouette: boolean;
}

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

interface BookState {
  /** 0 = still in the stack, 1 = flying off stage. */
  fly: number;
  /** 0 = not there yet, 1 = settled in the stack. */
  drop: number;
}

const TAU = Math.PI * 2;
const ORANGE = '#f97316';
const INK = '#000000';
const CUP_GREY = '#ededed';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => {
  const x = clamp(u, 0, 1);
  return x * x * (3 - 2 * x);
};
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u, 0, 1), 2);
const easeIn = (u: number) => clamp(u, 0, 1) * clamp(u, 0, 1);

/** The six scene captions, burned in with a black outline. */
const CAPTIONS: { text: string; from: number; to: number }[] = [
  { text: 'EASIEST TRICKSHOT EVER!', from: 0.55, to: 3.9 },
  { text: 'WHAT?!', from: 6.05, to: 7.95 },
  { text: 'SCIENTIFIC PRECISION!', from: 8.35, to: 12.95 },
  { text: "I'VE HAD ENOUGH!", from: 13.2, to: 17.9 },
  { text: '1000 IQ?!', from: 21.7, to: 25.0 },
  { text: 'I HATE THIS GAME!', from: 28.05, to: 30 },
];

export class PingPongRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  private readonly floorY = 1460;
  private readonly tableLeft = 370;
  private readonly tableRight = 1000;
  private readonly tableTop = 1160;
  private readonly tableThick = 28;

  private readonly charX = 265;
  private readonly headRadius = 70;
  private readonly ballRadius = 24;

  private readonly cupHomeX = 906;
  private readonly cupHeight = 80;

  private readonly lampX = 430;
  private readonly lampTop = 150;
  private readonly lampBottom = 430;
  private readonly ceilingY = 150;
  private readonly leftWallX = 42;
  private readonly rightWallX = 1038;

  /** The books form a staircase ramp up toward the right. */
  private readonly books = [
    { x: 440, y: 1136, w: 164, h: 44, rot: 0, dropAt: 8.55 },
    { x: 498, y: 1094, w: 152, h: 42, rot: -0.05, dropAt: 9.05 },
    { x: 556, y: 1053, w: 142, h: 40, rot: -0.1, dropAt: 9.55 },
  ];

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 540, y: 980, zoom: 1.0 },
    { t: 3.05, x: 540, y: 980, zoom: 1.0 },
    { t: 3.45, x: 570, y: 985, zoom: 1.26 },
    { t: 3.95, x: 570, y: 985, zoom: 1.26 },
    { t: 4.12, x: 540, y: 980, zoom: 1.0 },
    { t: 5.85, x: 540, y: 980, zoom: 1.0 },
    { t: 6.02, x: 330, y: 990, zoom: 1.38 },
    { t: 6.9, x: 330, y: 990, zoom: 1.38 },
    { t: 7.15, x: 470, y: 970, zoom: 1.14 },
    { t: 8.0, x: 470, y: 970, zoom: 1.14 },
    { t: 8.3, x: 520, y: 1010, zoom: 1.1 },
    { t: 12.15, x: 520, y: 1010, zoom: 1.1 },
    { t: 12.4, x: 430, y: 1100, zoom: 1.18 },
    { t: 12.95, x: 430, y: 1100, zoom: 1.18 },
    { t: 13.2, x: 540, y: 990, zoom: 1.02 },
    { t: 15.28, x: 540, y: 990, zoom: 1.02 },
    { t: 15.42, x: 570, y: 1070, zoom: 1.22 },
    { t: 15.75, x: 570, y: 1070, zoom: 1.22 },
    { t: 15.95, x: 545, y: 860, zoom: 1.06 },
    { t: 16.9, x: 530, y: 880, zoom: 1.02 },
    { t: 17.2, x: 540, y: 900, zoom: 1.0 },
    { t: 18.15, x: 540, y: 900, zoom: 1.0 },
    { t: 18.45, x: 540, y: 940, zoom: 0.93 },
    { t: 21.95, x: 540, y: 940, zoom: 0.93 },
    { t: 22.2, x: 300, y: 1000, zoom: 1.4 },
    { t: 24.95, x: 300, y: 1015, zoom: 1.48 },
    { t: 25.18, x: 540, y: 1000, zoom: 1.0 },
    { t: 27.45, x: 540, y: 1000, zoom: 1.0 },
    { t: 27.68, x: 300, y: 1000, zoom: 1.38 },
    { t: 28.2, x: 300, y: 1000, zoom: 1.38 },
    { t: 28.45, x: 540, y: 1040, zoom: 1.04 },
    { t: 30.0, x: 540, y: 1040, zoom: 1.04 },
  ];

  public render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = clamp(time, 0, 30);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.width, this.height);

    const camera = this.getCamera(t);
    ctx.save();
    ctx.translate(this.width / 2 + camera.shakeX, this.height / 2 + camera.shakeY);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    const pose = this.getPose(t);

    this.renderRoom(ctx, t);
    this.renderTable(ctx, t);
    this.renderLamp(ctx, t);
    this.renderBooks(ctx, t);
    this.renderVibrationGhosts(ctx, pose, t);
    this.renderStickman(ctx, pose, t);
    this.renderWorldCup(ctx, t);
    this.renderWorldBall(ctx, t);
    this.renderEffects(ctx, t, pose);

    ctx.restore();

    this.renderCaption(ctx, t);

    if (config.showSafeZones) {
      this.renderSafeZones(ctx);
    }
  }

  // ==========================================================
  // CAPTIONS
  // ==========================================================

  private renderCaption(ctx: CanvasRenderingContext2D, t: number) {
    for (const caption of CAPTIONS) {
      if (t < caption.from || t > caption.to) continue;
      const fadeIn = Math.min(1, (t - caption.from) / 0.2);
      // The closing gag holds to the very last frame instead of fading out.
      const fadeOut =
        caption.to >= 30 ? 1 : Math.min(1, (caption.to - t) / 0.2);
      const alpha = Math.max(0, Math.min(fadeIn, fadeOut));

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let size = 56;
      ctx.font = `900 ${size}px "Arial Black", "Segoe UI", Arial, sans-serif`;
      const maxWidth = this.width - 110;
      const measured = ctx.measureText(caption.text).width;
      if (measured > maxWidth) {
        size = Math.max(28, Math.floor((size * maxWidth) / measured));
        ctx.font = `900 ${size}px "Arial Black", "Segoe UI", Arial, sans-serif`;
      }
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(8, Math.round(size * 0.2));
      ctx.strokeStyle = '#000000';
      ctx.strokeText(caption.text, this.width / 2, 1704);
      ctx.fillStyle = ORANGE;
      ctx.fillText(caption.text, this.width / 2, 1704);
      ctx.restore();
    }
  }

  // ==========================================================
  // CAMERA
  // ==========================================================

  private getCamera(t: number) {
    const keys = this.cameraKeys;
    let x = keys[0].x;
    let y = keys[0].y;
    let zoom = keys[0].zoom;

    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (t >= a.t && t <= b.t) {
        const u = (t - a.t) / Math.max(0.0001, b.t - a.t);
        const e = smooth(u);
        x = lerp(a.x, b.x, e);
        y = lerp(a.y, b.y, e);
        zoom = lerp(a.zoom, b.zoom, e);
        break;
      }
      if (t > b.t) {
        x = b.x;
        y = b.y;
        zoom = b.zoom;
      }
    }

    // Keep the floor above the burned-in caption band on every zoom.
    y = Math.max(y, this.floorY - (1620 - this.height / 2) / zoom);

    let shakeX = 0;
    let shakeY = 0;
    const hits = [
      { at: 4.76, amp: 9 },
      { at: 6.0, amp: 17 },
      { at: 8.62, amp: 5 },
      { at: 9.12, amp: 6 },
      { at: 9.62, amp: 7 },
      { at: 12.12, amp: 4 },
      { at: 12.5, amp: 10 },
      { at: 13.1, amp: 6 },
      { at: 15.42, amp: 18 },
      { at: 15.62, amp: 8 },
      { at: 18.6, amp: 6 },
      { at: 19.4, amp: 6 },
      { at: 20.2, amp: 8 },
      { at: 20.9, amp: 5 },
      { at: 22.2, amp: 9 },
      { at: 22.86, amp: 7 },
      { at: 26.98, amp: 5 },
      { at: 27.66, amp: 14 },
      { at: 28.12, amp: 6 },
    ];
    for (const hit of hits) {
      const age = t - hit.at;
      if (age >= 0 && age < 0.3) {
        const decay = Math.exp(-age * 12);
        shakeX += Math.sin(age * 126 + hit.at) * hit.amp * decay;
        shakeY += Math.cos(age * 104 + hit.at) * hit.amp * decay;
      }
    }

    // A tiny breathing drift keeps the locked-off camera from feeling dead.
    x += Math.sin(t * 0.54) * 5;
    y += Math.cos(t * 0.47) * 4;

    return { x, y, zoom, shakeX, shakeY };
  }

  private renderSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.85)';
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 12]);
    ctx.strokeRect(54, 96, this.width - 108, this.height - 192);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(225, 29, 72, 0.9)';
    ctx.font = '700 26px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('9:16 SAFE AREA', 66, 76);

    // Right-hand action bar and bottom caption band.
    ctx.strokeRect(this.width - 208, 420, 132, 620);
    ctx.strokeRect(66, 1584, this.width - 132, 206);
    ctx.restore();
  }

  // ==========================================================
  // ROOM
  // ==========================================================

  private renderRoom(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineWidth = 7;

    // Floor.
    ctx.beginPath();
    ctx.moveTo(24, this.floorY);
    ctx.lineTo(this.width - 24, this.floorY);
    ctx.stroke();

    // Side walls and ceiling, so the ricochets have something to hit.
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(this.leftWallX, this.ceilingY);
    ctx.lineTo(this.leftWallX, this.floorY);
    ctx.moveTo(this.rightWallX, this.ceilingY);
    ctx.lineTo(this.rightWallX, this.floorY);
    ctx.moveTo(this.leftWallX, this.ceilingY);
    ctx.lineTo(this.rightWallX, this.ceilingY);
    ctx.stroke();

    // A soft flat shadow under the character and the table.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
    const hopLift = Math.max(0, this.getPoseLight(t).jump);
    ctx.beginPath();
    ctx.ellipse(this.charX + 6, this.floorY + 10, 118 - hopLift * 0.25, 16 - hopLift * 0.03, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse((this.tableLeft + this.tableRight) / 2, this.floorY + 12, 330, 20, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  /** A cheap pose read used only for the ground shadow. */
  private getPoseLight(t: number) {
    if (t < 25.2) return { jump: 0 };
    if (t < 27.35) {
      const phase = (t - 25.2) * 2.1;
      return { jump: Math.abs(Math.sin(phase * Math.PI)) * 95 };
    }
    return { jump: 0 };
  }

  // ==========================================================
  // TABLE
  // ==========================================================

  /** Damped spring wobble of the tabletop, in pixels. */
  private tableWobble(t: number) {
    const spring = (at: number, amp: number, freq: number, damp: number) => {
      const age = t - at;
      if (age < 0 || age > 2) return 0;
      return amp * Math.exp(-age * damp) * Math.cos(age * freq);
    };
    return spring(15.42, 54, 17, 5.2) + spring(19.33, 12, 15, 6);
  }

  /** Upward flick of the far table edge that launches the cup. */
  private tableEdgeFlick(t: number) {
    const age = t - 19.33;
    if (age < 0 || age > 1.2) return 0;
    return -30 * Math.exp(-age * 5.5) * Math.sin(age * 13);
  }

  private tableSurfaceY(x: number, t: number) {
    const u = clamp((x - this.tableLeft) / (this.tableRight - this.tableLeft), 0, 1);
    const sag = this.tableWobble(t);
    // A quadratic through both ends needs twice the sag in its control point.
    const curve = sag * 4 * u * (1 - u);
    const flick = this.tableEdgeFlick(t) * clamp((x - 620) / 380, 0, 1);
    return this.tableTop + curve + flick;
  }

  private renderTable(ctx: CanvasRenderingContext2D, t: number) {
    const left = this.tableLeft;
    const right = this.tableRight;
    const mid = (left + right) / 2;
    const yL = this.tableSurfaceY(left, t);
    const yR = this.tableSurfaceY(right, t);
    const controlY = (this.tableTop + this.tableWobble(t) * 2) * 2 - (yL + yR) / 2;

    ctx.save();
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Legs first, so the top surface sits over them.
    const legY = this.tableSurfaceY(left + 72, t);
    const legY2 = this.tableSurfaceY(right - 92, t);
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(left + 72, legY + 18);
    ctx.lineTo(left + 72, this.floorY);
    ctx.moveTo(right - 92, legY2 + 18);
    ctx.lineTo(right - 92, this.floorY);
    ctx.stroke();

    // The tabletop slab.
    ctx.beginPath();
    ctx.moveTo(left, yL);
    ctx.quadraticCurveTo(mid, controlY, right, yR);
    ctx.lineTo(right, yR + this.tableThick);
    ctx.quadraticCurveTo(mid, controlY + this.tableThick, left, yL + this.tableThick);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.stroke();

    // A thin inner line gives the slab its edge without a gradient.
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(left + 8, yL + 8);
    ctx.quadraticCurveTo(mid, controlY + 8, right - 8, yR + 8);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================
  // BOOKS
  // ==========================================================

  private bookState(index: number, t: number): BookState {
    const dropAt = this.books[index].dropAt;
    let drop = 1;
    if (t < dropAt) drop = 0;
    else if (t < dropAt + 0.22) drop = easeOut((t - dropAt) / 0.22);
    let fly = 0;
    if (t > 13.0 + index * 0.07) {
      fly = smooth((t - 13.0 - index * 0.07) / 0.7);
    }
    return { fly, drop };
  }

  private renderBooks(ctx: CanvasRenderingContext2D, t: number) {
    this.books.forEach((book, index) => {
      const state = this.bookState(index, t);
      if (state.drop <= 0) return;

      const dropOffset = (1 - state.drop) * -110;
      const settle = Math.sin(state.drop * Math.PI) * 6;
      const flyX = state.fly * (700 + index * 70);
      const flyY = state.fly * (-140 - index * 40) + state.fly * state.fly * 380;
      const flyRot = state.fly * (1.1 + index * 0.4);

      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - state.fly * 1.25);
      ctx.translate(book.x + flyX, book.y + dropOffset + settle + flyY);
      ctx.rotate(book.rot + flyRot);
      this.drawBook(ctx, book.w, book.h);
      ctx.restore();
    });
  }

  private drawBook(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const left = -w / 2;
    const top = -h / 2;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.rect(left, top, w, h);
    ctx.fill();
    ctx.stroke();

    // Spine.
    ctx.beginPath();
    ctx.moveTo(left + 16, top);
    ctx.lineTo(left + 16, top + h);
    ctx.stroke();

    // Page lines on the open edge.
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 1; i <= 2; i++) {
      ctx.moveTo(left + 26, top + (h * i) / 3);
      ctx.lineTo(left + w - 12, top + (h * i) / 3);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================
  // LAMP
  // ==========================================================

  private lampSwing(t: number) {
    if (t < 20.2) {
      return Math.sin(t * 0.9) * 0.012;
    }
    const age = t - 20.2;
    return Math.exp(-age * 2.6) * Math.sin(age * 12) * 0.34;
  }

  private renderLamp(ctx: CanvasRenderingContext2D, t: number) {
    const swing = this.lampSwing(t);
    ctx.save();
    ctx.translate(this.lampX, this.lampTop);
    ctx.rotate(swing);
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Cord.
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, this.lampBottom - this.lampTop - 92);
    ctx.stroke();

    // Shade.
    ctx.beginPath();
    ctx.moveTo(-24, this.lampBottom - this.lampTop - 92);
    ctx.lineTo(-86, this.lampBottom - this.lampTop);
    ctx.lineTo(86, this.lampBottom - this.lampTop);
    ctx.lineTo(24, this.lampBottom - this.lampTop - 92);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.stroke();

    // Bulb.
    ctx.beginPath();
    ctx.arc(0, this.lampBottom - this.lampTop + 20, 15, 0, TAU);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // CUP
  // ==========================================================

  /** The cup drawn upright with its base at (x, y) and opening toward -y. */
  private drawCup(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    rot: number,
    ballDrop: number | null
  ) {
    const h = this.cupHeight;
    const rimW = 64;
    const baseW = 44;

    const bodyPath = () => {
      ctx.beginPath();
      ctx.moveTo(-rimW / 2, -h);
      ctx.lineTo(-baseW / 2, 0);
      ctx.quadraticCurveTo(0, 7, baseW / 2, 0);
      ctx.lineTo(rimW / 2, -h);
      ctx.closePath();
    };

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK;

    // The opening, seen from slightly above.
    ctx.beginPath();
    ctx.ellipse(0, -h, rimW / 2, 9, 0, 0, TAU);
    ctx.fillStyle = CUP_GREY;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.stroke();

    if (ballDrop !== null) {
      const ballY = -h - 42 + clamp(ballDrop, 0, 1) * 50;
      this.drawBall(ctx, 0, ballY, this.ballRadius);
    }

    // The front wall: covers the lower half of a ball resting in the mouth.
    bodyPath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.stroke();

    // A flat shade band down one side.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rimW / 2, -h);
    ctx.lineTo(baseW / 2, 0);
    ctx.lineTo(baseW / 2 - 9, 0);
    ctx.lineTo(rimW / 2 - 10, -h);
    ctx.closePath();
    ctx.fillStyle = CUP_GREY;
    ctx.fill();
    ctx.restore();

    // The near half of the rim sits in front of anything in the cup.
    ctx.beginPath();
    ctx.ellipse(0, -h, rimW / 2, 9, 0, 0, Math.PI);
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.restore();
  }

  private cupOnTableY(t: number) {
    return this.tableSurfaceY(this.cupHomeX, t);
  }

  /** Where the loose cup is: on the table, in the air, or already on his head. */
  private renderWorldCup(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 19.42) {
      this.drawCup(ctx, this.cupHomeX, this.cupOnTableY(t), 1, 0, null);
      return;
    }
    if (t >= 22.2) return;

    const keys = [
      { t: 19.42, x: 906, y: 1158, rot: 0 },
      { t: 19.72, x: 878, y: 1072, rot: -0.7 },
      { t: 20.3, x: 760, y: 772, rot: -2.6 },
      { t: 21.0, x: 606, y: 604, rot: -4.5 },
      { t: 21.68, x: 424, y: 664, rot: -5.9 },
      { t: 22.2, x: 265, y: 764, rot: -TAU },
    ];

    let a = keys[0];
    let b = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (t >= keys[i].t && t <= keys[i + 1].t) {
        a = keys[i];
        b = keys[i + 1];
        break;
      }
    }
    const u = clamp((t - a.t) / Math.max(0.0001, b.t - a.t), 0, 1);
    const e = u;
    const x = lerp(a.x, b.x, e);
    const y = lerp(a.y, b.y, e) - Math.sin(u * Math.PI) * 26;
    const rot = lerp(a.rot, b.rot, u);
    this.drawCup(ctx, x, y, 1, rot, null);
  }

  // ==========================================================
  // THE BALL
  // ==========================================================

  private drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fillStyle = ORANGE;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(3, r * 0.16);
    ctx.stroke();

    // A flat white glint.
    ctx.beginPath();
    ctx.arc(-r * 0.32, -r * 0.34, r * 0.22, 0, TAU);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }

  private seg(
    t: number,
    t0: number,
    t1: number,
    ax: number,
    ay: number,
    bx: number,
    by: number,
    lift = 0
  ): Vec {
    const u = clamp((t - t0) / Math.max(0.0001, t1 - t0), 0, 1);
    return {
      x: lerp(ax, bx, u),
      y: lerp(ay, by, u) - Math.sin(u * Math.PI) * lift,
    };
  }

  /** Full ball timeline. Returns null while the ball is inside the cup. */
  private ballAt(t: number): { x: number; y: number; r: number; visible: boolean } | null {
    const R = this.ballRadius;
    let x = 340;
    let y = 955;
    let r = R;
    let visible = true;

    if (t < 1.2) {
      x = 340;
      y = 955;
    } else if (t < 2.2) {
      x = 205;
      y = 1124;
    } else if (t < 3.0) {
      x = 370;
      y = 900;
    } else if (t < 3.12) {
      x = 420;
      y = lerp(990, 1136, easeIn((t - 3.0) / 0.12));
    } else if (t < 3.45) {
      x = 420;
      y = lerp(1136, 1000, easeOut((t - 3.12) / 0.33));
    } else if (t < 4.05) {
      x = 420;
      y = 1000;
    } else if (t < 4.75) {
      const p = this.seg(t, 4.05, 4.75, 420, 1000, this.rightWallX - 24, 952, 30);
      x = p.x;
      y = p.y;
    } else if (t < 6.0) {
      const p = this.seg(t, 4.75, 6.0, this.rightWallX - 24, 952, 268, 800, 180);
      x = p.x;
      y = p.y;
    } else if (t < 6.06) {
      x = 268;
      y = 800;
      visible = false;
    } else if (t < 6.42) {
      const u = easeIn((t - 6.06) / 0.36);
      x = lerp(268, 306, u);
      y = lerp(800, 1436, u);
    } else if (t < 6.72) {
      const u = (t - 6.42) / 0.3;
      x = lerp(306, 336, u);
      y = 1436 - Math.sin(u * Math.PI) * 80;
    } else if (t < 7.55) {
      x = lerp(336, 468, smooth((t - 6.72) / 0.83));
      y = 1436;
    } else if (t < 11.3) {
      x = 468;
      y = 1436;
    } else if (t < 11.55) {
      const u = smooth((t - 11.3) / 0.25);
      x = lerp(468, 400, u);
      y = lerp(1436, 1120, u);
    } else if (t < 11.8) {
      const u = smooth((t - 11.55) / 0.25);
      x = lerp(400, 600, u);
      y = lerp(1120, 1032, u);
    } else if (t < 11.95) {
      const u = (t - 11.8) / 0.15;
      x = lerp(600, 658, u);
      y = lerp(1032, 962, u);
    } else if (t < 12.12) {
      const u = smooth((t - 11.95) / 0.17);
      x = lerp(658, 664, u);
      y = lerp(962, 958, u);
    } else if (t < 12.45) {
      const u = easeIn((t - 12.12) / 0.33);
      x = lerp(664, 330, u);
      y = lerp(958, 1372, u);
    } else if (t < 12.6) {
      // It clips the top of his raised foot and pops back up.
      const u = (t - 12.45) / 0.15;
      x = lerp(330, 344, u);
      y = 1372 - Math.sin(u * Math.PI) * 46;
    } else if (t < 12.78) {
      const u = easeIn((t - 12.6) / 0.18);
      x = lerp(344, 360, u);
      y = lerp(1326, 1436, u);
    } else if (t < 13.05) {
      const u = smooth((t - 12.78) / 0.27);
      x = lerp(360, 560, u);
      y = lerp(1436, 1120, u);
    } else if (t < 13.18) {
      const u = (t - 13.05) / 0.13;
      x = lerp(560, 572, u);
      y = 1120 - Math.sin(u * Math.PI) * 18;
    } else if (t < 13.34) {
      const u = smooth((t - 13.18) / 0.16);
      x = lerp(572, 566, u);
      y = lerp(1102, 1136, u);
    } else if (t < 15.56) {
      x = 566;
      y = 1136;
    } else if (t < 15.7) {
      const u = (t - 15.56) / 0.14;
      x = 566;
      y = lerp(1136, 1010, easeOut(u));
    } else if (t < 18.55) {
      // The long, decelerating climb to the ceiling.
      const u = easeOut((t - 15.7) / 2.85);
      x = lerp(566, 600, u);
      y = lerp(1010, 162, u);
      r = lerp(R, 12, Math.min(1, u * 2.2));
    } else if (t < 18.6) {
      x = 600;
      y = 162;
      r = 12;
    } else if (t < 19.4) {
      const u = smooth((t - 18.6) / 0.8);
      x = lerp(600, 62, u);
      y = lerp(162, 544, u);
      r = lerp(12, 18, u);
    } else if (t < 20.2) {
      const p = this.seg(t, 19.4, 20.2, 62, 544, this.lampX, 432, 26);
      x = p.x;
      y = p.y;
      r = 18;
    } else if (t < 20.9) {
      const p = this.seg(t, 20.2, 20.9, this.lampX, 432, 430, 1138, 40);
      x = p.x;
      y = p.y;
      r = lerp(18, 22, (t - 20.2) / 0.7);
    } else if (t < 21.6) {
      const u = smooth((t - 20.9) / 0.7);
      x = lerp(430, 330, u);
      y = lerp(1138, 608, u);
      r = 22;
    } else if (t < 22.75) {
      const u = smooth((t - 21.6) / 1.15);
      x = lerp(330, 265, u);
      y = lerp(608, 692, u) + Math.sin(u * Math.PI) * 36;
      r = R;
    } else if (t < 27.66) {
      return null;
    } else if (t < 27.96) {
      const u = (t - 27.66) / 0.3;
      x = lerp(295, 344, u);
      y = 776 - Math.sin(u * Math.PI) * 74;
    } else if (t < 28.36) {
      x = lerp(344, 404, smooth((t - 27.96) / 0.4));
      y = lerp(704, 1180, easeIn((t - 27.96) / 0.4));
    } else if (t < 28.56) {
      const u = easeIn((t - 28.36) / 0.2);
      x = lerp(404, 424, u);
      y = lerp(1180, 1436, u);
    } else if (t < 28.72) {
      const u = (t - 28.56) / 0.16;
      x = lerp(424, 444, u);
      y = 1436 - Math.sin(u * Math.PI) * 58;
    } else if (t < 28.88) {
      x = lerp(444, 462, smooth((t - 28.72) / 0.16));
      y = lerp(1378, 1436, easeIn((t - 28.72) / 0.16));
    } else {
      x = lerp(462, 602, smooth((t - 28.88) / 1.07));
      y = 1436;
    }

    return { x, y, r, visible };
  }

  private renderWorldBall(ctx: CanvasRenderingContext2D, t: number) {
    const ball = this.ballAt(t);
    if (!ball || !ball.visible) return;

    // Ink speed lines rather than ghost balls: they read over the body and the table.
    const speed = this.ballSpeed(t);
    if (speed > 950) {
      const a = this.ballAt(t - 0.055);
      const b = this.ballAt(t - 0.01);
      if (a && b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const px = -uy;
        const py = ux;
        const tail = Math.min(96, 0.045 * speed);
        ctx.save();
        ctx.strokeStyle = INK;
        ctx.lineCap = 'round';
        for (let i = -1; i <= 1; i++) {
          const off = i * 9;
          ctx.globalAlpha = i === 0 ? 0.36 : 0.2;
          ctx.lineWidth = i === 0 ? 5 : 4;
          ctx.beginPath();
          ctx.moveTo(
            ball.x - ux * ball.r * 0.8 + px * off,
            ball.y - uy * ball.r * 0.8 + py * off
          );
          ctx.lineTo(
            ball.x - ux * (ball.r * 0.8 + tail) + px * off,
            ball.y - uy * (ball.r * 0.8 + tail) + py * off
          );
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    this.drawBall(ctx, ball.x, ball.y, ball.r);
  }

  private ballSpeed(t: number) {
    const a = this.ballAt(t - 0.02);
    const b = this.ballAt(t);
    if (!a || !b) return 0;
    return Math.hypot(b.x - a.x, b.y - a.y) / 0.02;
  }

  // ==========================================================
  // POSES
  // ==========================================================

  private basePose(): Pose {
    return {
      hipX: this.charX,
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
    const p = this.basePose();
    if (t < 4) this.poseChallenge(p, t);
    else if (t < 8) this.poseFailure(p, t);
    else if (t < 13) this.posePlan(p, t);
    else if (t < 18) this.poseRage(p, t);
    else if (t < 25) this.poseImpossible(p, t);
    else this.poseRevenge(p, t);
    return p;
  }

  /** Scene 1: the confident challenge. */
  private poseChallenge(p: Pose, t: number) {
    p.gazeX = 1;
    p.gazeY = 0.15;

    if (t < 1.2) {
      p.rightHand = { x: 76, y: -205 };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -58, y: -34 };
      p.brow = 'oneRaised';
      p.mouth = 'grin';
      p.headTilt = -0.05;
      p.lean = -0.03;
    } else if (t < 2.2) {
      // He points at the cup, the ball parked on his hip.
      p.rightHand = { x: 170, y: -178 };
      p.rightHandStyle = 'point';
      p.rightElbow = 10;
      p.leftHand = { x: -60, y: -36 };
      p.brow = 'determined';
      p.mouth = 'grin';
      p.lean = 0.04;
    } else if (t < 3.0) {
      // A double bicep flex.
      p.leftHand = { x: -120, y: -250 };
      p.rightHand = { x: 120, y: -250 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
      p.leftElbow = -62;
      p.rightElbow = 62;
      p.brow = 'determined';
      p.mouth = 'grin';
      p.headTilt = -0.06;
    } else if (t < 3.45) {
      // The one warm-up bounce on the table.
      p.rightHand = { x: 152, y: -168 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -55, y: -30 };
      p.brow = 'oneRaised';
      p.mouth = 'smirk';
      p.gazeY = 0.55;
    } else {
      p.rightHand = { x: 155, y: -160 };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -55, y: -30 };
      p.brow = 'determined';
      p.mouth = 'smirk';
    }
  }

  /** Scene 2: the miss, the wall and the forehead. */
  private poseFailure(p: Pose, t: number) {
    const u = t - 4;
    p.gazeX = 0.85;
    p.gazeY = -0.35;

    if (u < 0.12) {
      p.rightHand = { x: 104, y: -120 };
      p.rightHandStyle = 'hold';
      p.lean = -0.06;
      p.brow = 'determined';
      p.mouth = 'grit';
    } else if (u < 1.1) {
      p.rightHand = { x: 178, y: -205 };
      p.rightHandStyle = 'open';
      p.rightElbow = 8;
      p.lean = 0.1;
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeX = 1;
      p.gazeY = -0.7;
    } else if (u < 1.95) {
      p.rightHand = { x: 122, y: -150 };
      p.leftHand = { x: -100, y: -130 };
      p.leftHandStyle = 'open';
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeX = 0.8;
      p.gazeY = -0.9;
    } else if (u < 2.86) {
      // BONK. The head snaps back, the eyes cross.
      p.headTilt = -0.4;
      p.lean = -0.15;
      p.squashX = 1.09;
      p.squashY = 0.89;
      p.eye = 'cross';
      p.brow = 'raised';
      p.mouth = 'o';
      p.sweat = true;
      p.leftHand = { x: -108, y: -258 };
      p.rightHand = { x: 108, y: -258 };
      p.leftHandStyle = 'open';
      p.rightHandStyle = 'open';
      p.gazeY = -0.2;
      p.gazeX = 0;
    } else if (u < 3.38) {
      // Slowly turns back with an offended stare.
      p.headTilt = 0.04;
      p.eye = 'squint';
      p.brow = 'angry';
      p.mouth = 'frown';
      p.leftHand = { x: -52, y: -28 };
      p.rightHand = { x: 52, y: -28 };
      p.gazeX = 0;
      p.gazeY = 0;
    } else {
      // The accusation.
      p.rightHand = { x: 174, y: -146 };
      p.rightHandStyle = 'point';
      p.rightElbow = 4;
      p.leftHand = { x: -58, y: -26 };
      p.leftHandStyle = 'fist';
      p.brow = 'angry';
      p.mouth = 'grit';
      p.gazeX = 1;
      p.headTilt = 0.03;
      p.lean = 0.03;
    }
  }

  /** Scene 3: books, angles and a foot. */
  private posePlan(p: Pose, t: number) {
    p.gazeX = 1;
    p.gazeY = 0.35;

    if (t < 8.5) {
      p.rightHand = { x: 152, y: -74 };
      p.leftHand = { x: 96, y: -104 };
      p.rightHandStyle = 'open';
      p.leftHandStyle = 'open';
      p.lean = 0.09;
      p.brow = 'determined';
      p.mouth = 'grit';
    } else if (t < 8.62) {
      p.rightHand = { x: 142, y: -42 };
      p.leftHand = { x: 92, y: -84 };
      p.lean = 0.14;
      p.squashY = 0.99;
    } else if (t < 9.0) {
      p.rightHand = { x: 166, y: -120 };
      p.leftHand = { x: 110, y: -124 };
      p.rightHandStyle = 'open';
      p.leftHandStyle = 'open';
      p.lean = 0.1;
    } else if (t < 9.12) {
      p.rightHand = { x: 152, y: -80 };
      p.leftHand = { x: 104, y: -100 };
      p.lean = 0.15;
      p.squashY = 0.985;
    } else if (t < 9.5) {
      p.rightHand = { x: 182, y: -152 };
      p.leftHand = { x: 120, y: -142 };
      p.lean = 0.11;
    } else if (t < 9.62) {
      p.rightHand = { x: 164, y: -108 };
      p.leftHand = { x: 112, y: -120 };
      p.lean = 0.16;
      p.squashY = 0.985;
    } else if (t < 10.0) {
      // Steps back to admire the ramp.
      p.leftHand = { x: -58, y: -24 };
      p.rightHand = { x: 58, y: -24 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
      p.brow = 'oneRaised';
      p.mouth = 'smirk';
      p.headTilt = -0.04;
      p.gazeY = 0.15;
    } else if (t < 10.9) {
      // Measures the angle with both hands.
      p.leftHand = { x: -56, y: -268 };
      p.rightHand = { x: 172, y: -94 };
      p.leftHandStyle = 'point';
      p.rightHandStyle = 'point';
      p.leftElbow = -6;
      p.rightElbow = 2;
      p.eye = 'squint';
      p.brow = 'determined';
      p.mouth = 'flat';
      p.headTilt = -0.08;
      p.lean = 0.05;
    } else if (t < 11.15) {
      const u = (t - 10.9) / 0.25;
      p.leftHand = { x: -56, y: -268 };
      p.rightHand = { x: 172, y: -94 };
      p.leftHandStyle = 'point';
      p.rightHandStyle = 'point';
      p.headTilt = -0.08 + Math.sin(u * Math.PI) * 0.24;
      p.brow = 'determined';
      p.mouth = 'smirk';
      p.eye = 'happy';
    } else if (t < 11.45) {
      // Bends down to pick the ball off the floor.
      const u = smooth((t - 11.15) / 0.3);
      p.hipY = 1160 + u * 96;
      p.hipX = 265 + u * 34;
      p.lean = u * 0.44;
      p.rightHand = { x: 138, y: -60 + u * 300 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -70, y: 40 };
      p.leftHandStyle = 'open';
      p.eye = 'squint';
      p.brow = 'determined';
      p.mouth = 'flat';
      p.gazeY = 0.8;
      p.headTilt = 0.16;
    } else if (t < 11.65) {
      const u = smooth((t - 11.45) / 0.2);
      p.hipY = 1256 - u * 96;
      p.hipX = 299 - u * 34;
      p.lean = 0.44 - u * 0.3;
      p.rightHand = { x: 78 + u * 57, y: 240 - u * 280 };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -70, y: 40 - u * 60 };
      p.brow = 'determined';
      p.mouth = 'flat';
      p.gazeY = 0.4;
      p.headTilt = 0.16 - u * 0.2;
    } else if (t < 11.9) {
      // The flick up the book ramp.
      const u = smooth((t - 11.65) / 0.25);
      p.rightHand = { x: 135 + u * 70, y: -40 - u * 30 };
      p.rightHandStyle = 'open';
      p.lean = 0.14 + u * 0.06;
      p.brow = 'determined';
      p.mouth = 'grit';
      p.gazeX = 1;
      p.gazeY = -0.2;
    } else if (t < 12.12) {
      p.rightHand = { x: 205, y: -80 };
      p.gazeX = 1;
      p.gazeY = -0.85;
      p.brow = 'raised';
      p.mouth = 'o';
      p.lean = 0.1;
    } else if (t < 12.45) {
      p.rightHand = { x: 170, y: -110 };
      p.gazeX = 0.5;
      p.gazeY = 0.7;
      p.brow = 'raised';
      p.mouth = 'o';
      p.lean = 0.04;
    } else if (t < 13.0) {
      // The foot plop and the one-legged hop.
      const hop = Math.abs(Math.sin((t - 12.45) * Math.PI * 2.6)) * 34;
      p.jump = hop;
      p.rightFoot = { x: 74, y: 216 };
      p.rightKnee = 44;
      p.leftFoot = { x: -48, y: 300 };
      p.leftHand = { x: -136, y: -176 };
      p.rightHand = { x: 138, y: -126 };
      p.leftHandStyle = 'open';
      p.rightHandStyle = 'open';
      p.eye = 'closed';
      p.brow = 'sad';
      p.mouth = 'open';
      p.sweat = true;
      p.headTilt = Math.sin(t * 31) * 0.07;
      p.lean = Math.sin(t * 17) * 0.06;
    } else {
      // Sweeps the books off the table in disgust.
      p.rightHand = { x: 182, y: -128 };
      p.leftHand = { x: 148, y: -88 };
      p.rightHandStyle = 'open';
      p.leftHandStyle = 'open';
      p.lean = 0.12;
      p.brow = 'angry';
      p.mouth = 'grit';
      p.gazeX = 0.9;
    }
  }

  /** Scene 4: trembling, screaming, table slam. */
  private poseRage(p: Pose, t: number) {
    p.gazeX = 0.3;

    if (t < 14.5) {
      const ramp = smooth((t - 13.4) / 1.1);
      p.leftHand = { x: -80, y: -44 };
      p.rightHand = { x: 80, y: -44 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
      p.eye = 'angry';
      p.brow = 'angry';
      p.mouth = 'grit';
      p.anger = true;
      p.flush = t > 14.0;
      p.lean = Math.sin(t * 37) * 0.014 * ramp;
      p.headTilt = Math.sin(t * 41) * 0.05 * ramp;
      p.squashX = 1 + Math.sin(t * 52) * 0.01 * ramp;
      p.squashY = 1 - Math.sin(t * 52) * 0.01 * ramp;
    } else if (t < 15.2) {
      // The silent scream. For a flash he is a solid black silhouette.
      p.leftHand = { x: -112, y: -395 };
      p.rightHand = { x: 112, y: -395 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
      p.leftElbow = -18;
      p.rightElbow = 18;
      p.headTilt = -0.14;
      p.eye = 'closed';
      p.brow = 'angry';
      p.mouth = 'open';
      p.anger = true;
      p.jump = 9;
      p.squashX = 1.02;
      p.squashY = 1.05;
      p.silhouette = t > 14.55 && t < 15.02;
    } else if (t < 15.42) {
      // Both hands slam the table.
      p.lean = 0.3;
      p.leftHand = { x: 152, y: -26 };
      p.rightHand = { x: 196, y: -46 };
      p.leftHandStyle = 'open';
      p.rightHandStyle = 'open';
      p.headTilt = 0.2;
      p.eye = 'angry';
      p.brow = 'angry';
      p.mouth = 'open';
      p.anger = true;
    } else if (t < 15.72) {
      p.hipY = 1178;
      p.lean = 0.24;
      p.squashY = 0.87;
      p.squashX = 1.11;
      p.leftHand = { x: 158, y: -20 };
      p.rightHand = { x: 200, y: -36 };
      p.leftHandStyle = 'open';
      p.rightHandStyle = 'open';
      p.eye = 'closed';
      p.mouth = 'open';
      p.brow = 'angry';
      p.sweat = true;
    } else if (t < 16.15) {
      const u = smooth((t - 15.72) / 0.43);
      p.hipY = lerp(1178, 1160, u);
      p.lean = 0.24 - u * 0.36;
      p.squashY = 0.9 + u * 0.1;
      p.squashX = 1.08 - u * 0.08;
      p.leftHand = { x: -60, y: -120 };
      p.rightHand = { x: 62, y: -104 };
      p.leftHandStyle = 'open';
      p.rightHandStyle = 'open';
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeY = -0.5;
    } else {
      // Follows the ball up into the ceiling, baffled.
      p.headTilt = -0.26;
      p.leftHand = { x: -46, y: -96 };
      p.rightHand = { x: 46, y: -78 };
      p.eye = t > 17.15 && t < 17.32 ? 'closed' : 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeX = 0.1;
      p.gazeY = -1;
      p.pupilScale = 0.8;
      p.lean = -0.04;
    }
  }

  /** Scene 5: the impossible ricochet and the cup on his head. */
  private poseImpossible(p: Pose, t: number) {
    const ball = this.ballAt(t);
    if (ball) {
      p.gazeX = clamp((ball.x - (this.charX + 20)) / 330, -1, 1);
      p.gazeY = clamp((ball.y - 826) / 430, -1, 1);
    }
    p.headTilt = clamp(p.gazeX * 0.1 + p.gazeY * 0.06, -0.22, 0.22);
    p.eye = 'wide';
    p.brow = 'raised';
    p.mouth = 'o';
    p.leftHand = { x: -102, y: -142 };
    p.rightHand = { x: 102, y: -142 };
    p.leftHandStyle = 'open';
    p.rightHandStyle = 'open';
    p.leftElbow = -18;
    p.rightElbow = 18;

    if (t < 22.2) {
      // Watching the ball, oblivious to the cup flipping through the air.
      if (t > 19.3 && t < 20.0) {
        p.gazeX = -1;
        p.gazeY = 0.2;
      }
      return;
    }

    if (t < 22.36) {
      // The cup lands.
      p.squashY = 0.94;
      p.squashX = 1.04;
      p.eye = 'closed';
      p.gazeY = -0.2;
      p.headTilt = 0;
      p.leftHand = { x: -82, y: -170 };
      p.rightHand = { x: 82, y: -170 };
      return;
    }

    if (t < 22.8) {
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeY = -0.25;
      p.gazeX = 0;
      p.headTilt = 0;
      p.pupilScale = 0.8;
      p.leftHand = { x: -72, y: -150 };
      p.rightHand = { x: 72, y: -150 };
      return;
    }

    if (t < 23.35) {
      // The ball drops into the cup with a little jolt.
      p.squashY = 1 - Math.exp(-(t - 22.86) * 9) * 0.06;
      p.eye = 'stunned';
      p.pupilScale = 0.55;
      p.mouth = 'o';
      p.brow = 'raised';
      p.gazeY = -0.6;
      p.headTilt = 0.02;
      p.leftHand = { x: -86, y: -168 };
      p.rightHand = { x: 86, y: -168 };
      return;
    }

    if (t < 24.6) {
      // A slow look up, head still facing forward.
      const u = smooth((t - 23.35) / 1.25);
      p.gazeY = lerp(-0.6, -1, u);
      p.gazeX = 0;
      p.pupilScale = 0.7;
      p.headTilt = 0.01;
      p.sweat = true;
      p.leftHand = { x: -64, y: -60 };
      p.rightHand = { x: 64, y: -60 };
      p.mouth = 'o';
      p.brow = 'raised';
      return;
    }

    // Stunned pride.
    p.eye = 'squint';
    p.brow = 'oneRaised';
    p.mouth = 'smirk';
    p.gazeY = -0.9;
    p.headTilt = -0.02;
    p.leftHand = { x: -58, y: -34 };
    p.rightHand = { x: 58, y: -34 };
  }

  /** Scene 6: the celebration and the revenge of the cup. */
  private poseRevenge(p: Pose, t: number) {
    if (t < 25.35) {
      p.leftHand = { x: -112, y: -320 };
      p.rightHand = { x: 112, y: -320 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
      p.leftElbow = -34;
      p.rightElbow = 34;
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'grin';
      p.jump = 20;
      return;
    }

    if (t < 27.3) {
      const phase = (t - 25.35) * 2.1;
      p.jump = Math.abs(Math.sin(phase * Math.PI)) * 95;
      const pump = Math.sin((t - 25.35) * 9);
      p.leftHand = { x: -112, y: -320 + pump * 42 };
      p.rightHand = { x: 112, y: -320 - pump * 42 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
      p.leftElbow = -34;
      p.rightElbow = 34;
      p.leftFoot = { x: -42, y: 262 };
      p.rightFoot = { x: 42, y: 262 };
      p.leftKnee = -34;
      p.rightKnee = 34;
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'grin';
      p.headTilt = Math.sin((t - 25.35) * 7) * 0.05;
      return;
    }

    if (t < 27.65) {
      // Lands and looks up at the pop.
      p.leftHand = { x: -104, y: -300 };
      p.rightHand = { x: 104, y: -300 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeY = -1;
      p.headTilt = -0.12;
      return;
    }

    if (t < 28.15) {
      // The forehead bonk.
      p.headTilt = -0.42;
      p.lean = -0.12;
      p.squashY = 0.94;
      p.squashX = 1.05;
      p.leftHand = { x: -72, y: -268 };
      p.rightHand = { x: 72, y: -268 };
      p.leftHandStyle = 'open';
      p.rightHandStyle = 'open';
      p.eye = 'cross';
      p.brow = 'raised';
      p.mouth = 'open';
      p.sweat = true;
      p.gazeY = 0;
      return;
    }

    if (t < 28.6) {
      // The arms sink as the cup slides down.
      const u = smooth((t - 28.15) / 0.45);
      p.headTilt = -0.42 + u * 0.46;
      p.lean = -0.12 + u * 0.14;
      p.leftHand = { x: -72, y: -268 + u * 226 };
      p.rightHand = { x: 72, y: -268 + u * 226 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
      p.eye = 'closed';
      p.brow = 'angry';
      p.mouth = 'frown';
      return;
    }

    if (t < 29.7) {
      // Silent shaking rage.
      p.leftHand = { x: -74, y: -42 };
      p.rightHand = { x: 74, y: -42 };
      p.leftHandStyle = 'fist';
      p.rightHandStyle = 'fist';
      p.eye = 'closed';
      p.brow = 'angry';
      p.mouth = 'grit';
      p.anger = true;
      p.lean = Math.sin(t * 45) * 0.018;
      p.headTilt = Math.sin(t * 48) * 0.05;
      p.squashX = 1 + Math.sin(t * 55) * 0.012;
      p.squashY = 1 - Math.sin(t * 55) * 0.012;
      return;
    }

    // One last motionless beat.
    p.leftHand = { x: -74, y: -42 };
    p.rightHand = { x: 74, y: -42 };
    p.leftHandStyle = 'fist';
    p.rightHandStyle = 'fist';
    p.eye = 'closed';
    p.brow = 'angry';
    p.mouth = 'grit';
  }

  // ==========================================================
  // THE STICKMAN
  // ==========================================================

  private renderStickman(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const trembleX = pose.anger ? Math.sin(t * 40) * 3 : 0;
    const trembleY = pose.anger ? Math.cos(t * 33) * 2 : 0;

    ctx.translate(pose.hipX + trembleX, pose.hipY - pose.jump + trembleY);
    ctx.rotate(pose.lean);
    ctx.scale(pose.squashX, pose.squashY);

    // Legs.
    const leftKnee = this.drawLimb(ctx, { x: 0, y: 0 }, pose.leftFoot, pose.leftKnee, 12);
    const rightKnee = this.drawLimb(ctx, { x: 0, y: 0 }, pose.rightFoot, pose.rightKnee, 12);
    this.drawFoot(ctx, pose.leftFoot, leftKnee);
    this.drawFoot(ctx, pose.rightFoot, rightKnee);

    // Torso.
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -220);
    ctx.stroke();

    // Arms.
    const shoulder = { x: 0, y: -220 };
    const leftElbow = this.drawLimb(ctx, shoulder, pose.leftHand, pose.leftElbow, 10);
    const rightElbow = this.drawLimb(ctx, shoulder, pose.rightHand, pose.rightElbow, 10);
    this.drawHand(ctx, pose.leftHand, leftElbow, pose.leftHandStyle);
    this.drawHand(ctx, pose.rightHand, rightElbow, pose.rightHandStyle);

    // Neck.
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, -220);
    ctx.lineTo(0, -264);
    ctx.stroke();

    // Head.
    ctx.save();
    ctx.translate(0, -334);
    ctx.rotate(pose.headTilt);
    ctx.fillStyle = pose.silhouette ? INK : '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.headRadius, this.headRadius, 0, 0, TAU);
    ctx.fill();
    if (!pose.silhouette) {
      ctx.stroke();
    }

    if (pose.flush && !pose.silhouette) {
      ctx.fillStyle = ORANGE;
      ctx.beginPath();
      ctx.ellipse(0, 2, this.headRadius - 16, this.headRadius - 16, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    if (!pose.silhouette) {
      this.drawFace(ctx, pose, t);
    }

    if (pose.anger && !pose.silhouette) {
      this.drawAngerMark(ctx, t);
    }

    if (pose.sweat && !pose.silhouette) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(58, -35);
      ctx.quadraticCurveTo(67, -16, 58, -10);
      ctx.quadraticCurveTo(49, -16, 58, -35);
      ctx.stroke();
    }

    // The cup lives on this head for the whole second half.
    this.drawHeadCup(ctx, t);
    this.drawPopBall(ctx, t);

    ctx.restore();

    ctx.restore();
  }

  /** Two lighter copies of the body while the rage vibrates. */
  private renderVibrationGhosts(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    if (t < 13.6 || t > 15.1) return;
    const strength = 1 - Math.abs((t - 14.35) / 0.75);
    for (let i = 1; i <= 2; i++) {
      ctx.save();
      ctx.globalAlpha = 0.1 * Math.max(0, strength);
      ctx.translate(i % 2 === 0 ? -1 : 1, 0);
      this.renderStickman(ctx, pose, t);
      ctx.restore();
    }
  }

  // ==========================================================
  // THE CUP ON HIS HEAD
  // ==========================================================

  private drawHeadCup(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 22.2) return;

    let baseY = -this.headRadius + 8;
    let rot = 0;
    let scale = 1;
    let ballDrop: number | null = null;

    if (t < 27.8) {
      const wobble = 0.18 * Math.exp(-(t - 22.2) * 5) * Math.sin((t - 22.2) * 26);
      rot = wobble;
      if (t >= 22.75 && t < 26.9) {
        if (t < 23.0) {
          ballDrop = lerp(0, 1, smooth((t - 22.75) / 0.25));
        } else if (t < 23.18) {
          ballDrop = 1 - Math.sin(((t - 23.0) / 0.18) * Math.PI) * 0.32;
        } else {
          ballDrop = 1;
        }
      }
    } else {
      // It flips over and drops down his face like a helmet.
      const u = smooth((t - 27.8) / 0.38);
      baseY = -this.headRadius + 8 + u * 22;
      rot = u * Math.PI;
      scale = 1 + u * 0.72;
    }

    this.drawCup(ctx, 0, baseY, scale, rot, ballDrop);
  }

  private drawPopBall(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 26.9 || t >= 27.66) return;
    const rimY = -this.headRadius - this.cupHeight; // -150
    let x = 0;
    let y = rimY + 8;
    if (t < 27.08) {
      const u = (t - 26.9) / 0.18;
      x = u * 6;
      y = lerp(rimY + 8, rimY - 55, easeOut(u));
    } else if (t < 27.3) {
      const u = smooth((t - 27.08) / 0.22);
      x = lerp(6, 14, u);
      y = lerp(rimY - 55, rimY - 85, u);
    } else {
      const u = easeIn((t - 27.3) / 0.36);
      x = lerp(14, 30, u);
      y = lerp(rimY - 85, -50, u);
    }
    this.drawBall(ctx, x, y, this.ballRadius);
  }

  // ==========================================================
  // FACE
  // ==========================================================

  private drawFace(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    const eyeY = -10;
    const leftX = -26;
    const rightX = 24;
    const pupilX = clamp(pose.gazeX, -1, 1) * 4.4;
    const pupilY = clamp(pose.gazeY, -1, 1) * 4;
    const twitch =
      (t >= 6.05 && t < 6.72) || (t >= 27.7 && t < 28.05)
        ? Math.sin((t - 6.05) * 36) * 5
        : 0;

    this.drawEye(ctx, leftX, eyeY, pose.eye, pupilX, pupilY, pose.pupilScale);
    this.drawEye(ctx, rightX, eyeY, pose.eye, pupilX + twitch, pupilY, pose.pupilScale);
    this.drawBrows(ctx, leftX, rightX, eyeY, pose.brow);
    this.drawMouth(ctx, -1, 31, pose.mouth);
  }

  private drawEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    style: EyeStyle,
    pupilX: number,
    pupilY: number,
    pupilScale: number
  ) {
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineCap = 'round';

    if (style === 'closed') {
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x - 9, y);
      ctx.lineTo(x + 9, y);
      ctx.stroke();
      return;
    }

    if (style === 'happy') {
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y + 2, 9, Math.PI, TAU);
      ctx.stroke();
      return;
    }

    if (style === 'cross') {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 8);
      ctx.lineTo(x + 8, y + 8);
      ctx.moveTo(x + 8, y - 8);
      ctx.lineTo(x - 8, y + 8);
      ctx.stroke();
      return;
    }

    if (style === 'stunned') {
      ctx.lineWidth = 4.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(x + pupilX, y + pupilY, 3.4, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 12);
      ctx.lineTo(x + 11, y - 6);
      ctx.stroke();
      return;
    }

    if (style === 'squint') {
      ctx.lineWidth = 4.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(x + pupilX, y + pupilY, 4.4 * pupilScale, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 1);
      ctx.lineTo(x + 11, y - 3);
      ctx.stroke();
      return;
    }

    if (style === 'wide') {
      ctx.lineWidth = 4.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(x + pupilX, y + pupilY, 5 * pupilScale, 0, TAU);
      ctx.fill();
      return;
    }

    if (style === 'angry') {
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(x, y + 1, 7.4, 5, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 8);
      ctx.lineTo(x + 11, y - 2);
      ctx.stroke();
      return;
    }

    // normal
    ctx.beginPath();
    ctx.arc(x, y, 7.4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + pupilX * 0.3 - 1.6, y + pupilY * 0.3 - 1.6, 1.8, 0, TAU);
    ctx.fill();
  }

  private drawBrows(
    ctx: CanvasRenderingContext2D,
    leftX: number,
    rightX: number,
    eyeY: number,
    style: BrowStyle
  ) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    const y = eyeY - 22;

    const draw = (x: number, innerLift: number, outerLift: number) => {
      const isLeft = x < 0;
      const innerX = isLeft ? x + 11 : x - 11;
      const outerX = isLeft ? x - 11 : x + 11;
      ctx.beginPath();
      ctx.moveTo(outerX, y + outerLift);
      ctx.lineTo(innerX, y + innerLift);
      ctx.stroke();
    };

    if (style === 'angry') {
      draw(leftX, 7, -6);
      draw(rightX, 7, -6);
    } else if (style === 'determined') {
      draw(leftX, 5, -5);
      draw(rightX, 5, -5);
    } else if (style === 'raised') {
      draw(leftX, -5, -10);
      draw(rightX, -5, -10);
    } else if (style === 'oneRaised') {
      draw(leftX, -5, -10);
      draw(rightX, 0, 0);
    } else if (style === 'sad') {
      draw(leftX, -6, 5);
      draw(rightX, -6, 5);
    } else {
      draw(leftX, 0, 0);
      draw(rightX, 0, 0);
    }
  }

  private drawMouth(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    style: MouthStyle
  ) {
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';

    if (style === 'smile') {
      ctx.beginPath();
      ctx.arc(x, y - 2, 10, 0, Math.PI);
      ctx.stroke();
    } else if (style === 'grin') {
      ctx.beginPath();
      ctx.arc(x, y - 2, 12, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.rect(x - 7, y + 5, 14, 3);
      ctx.fill();
    } else if (style === 'open') {
      ctx.beginPath();
      ctx.ellipse(x, y + 2, 8, 11, 0, 0, TAU);
      ctx.fill();
    } else if (style === 'o') {
      ctx.beginPath();
      ctx.arc(x, y + 1, 7, 0, TAU);
      ctx.stroke();
    } else if (style === 'grit') {
      ctx.beginPath();
      ctx.rect(x - 11, y - 4, 22, 9);
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 4);
      ctx.lineTo(x - 5, y + 5);
      ctx.moveTo(x + 5, y - 4);
      ctx.lineTo(x + 5, y + 5);
      ctx.stroke();
    } else if (style === 'frown') {
      ctx.beginPath();
      ctx.arc(x, y + 9, 10, Math.PI, TAU);
      ctx.stroke();
    } else if (style === 'wobble') {
      ctx.beginPath();
      ctx.moveTo(x - 12, y);
      ctx.quadraticCurveTo(x - 6, y - 6, x, y);
      ctx.quadraticCurveTo(x + 6, y + 6, x + 12, y);
      ctx.stroke();
    } else if (style === 'smirk') {
      ctx.beginPath();
      ctx.moveTo(x - 11, y + 2);
      ctx.quadraticCurveTo(x + 2, y + 4, x + 13, y - 5);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 10, y);
      ctx.stroke();
    }
  }

  private drawAngerMark(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.translate(54, -60);
    ctx.rotate(Math.sin(t * 10) * 0.08);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const a = -0.7 + i * 0.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
      ctx.lineTo(Math.cos(a) * 19, Math.sin(a) * 19);
      ctx.stroke();
    }
    ctx.restore();
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
    const joint = {
      x: midX + (-dy / len) * bend,
      y: midY + (dx / len) * bend,
    };

    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(joint.x, joint.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    return joint;
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
    ctx.fillStyle = INK;

    if (style === 'point') {
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 26, Math.sin(angle) * 26);
      ctx.stroke();
    } else if (style === 'open') {
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        const a = angle + i * 0.32;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16);
        ctx.stroke();
      }
    } else if (style === 'fist') {
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, TAU);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, style === 'hold' ? 6.5 : 5.5, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawFoot(ctx: CanvasRenderingContext2D, foot: Vec, knee: Vec) {
    const dir = foot.x < knee.x ? -1 : 1;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(foot.x, foot.y);
    ctx.lineTo(foot.x + dir * 24, foot.y + 1);
    ctx.stroke();
  }

  // ==========================================================
  // EFFECTS
  // ==========================================================

  private impactBurst(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    t: number,
    at: number,
    size: number
  ) {
    const age = t - at;
    if (age < 0 || age > 0.32) return;
    const u = age / 0.32;
    const r = lerp(size * 0.35, size, easeOut(u));
    ctx.save();
    ctx.globalAlpha = 1 - u;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + at * 1.7;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      ctx.lineTo(x + Math.cos(a) * (r + size * 0.55), y + Math.sin(a) * (r + size * 0.55));
      ctx.stroke();
    }
    ctx.restore();
  }

  private sparkle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    t: number,
    at: number,
    size: number
  ) {
    const age = t - at;
    if (age < 0 || age > 0.6) return;
    const u = age / 0.6;
    const s = Math.sin(u * Math.PI) * size;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.16, -s * 0.16, s, 0);
    ctx.quadraticCurveTo(s * 0.16, s * 0.16, 0, s);
    ctx.quadraticCurveTo(-s * 0.16, s * 0.16, -s, 0);
    ctx.quadraticCurveTo(-s * 0.16, -s * 0.16, 0, -s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private littleStars(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    t: number,
    at: number,
    radius: number
  ) {
    const age = t - at;
    if (age < 0 || age > 0.9) return;
    const u = age / 0.9;
    ctx.save();
    ctx.globalAlpha = 1 - u;
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      const a = age * 7 + (i / 3) * TAU;
      const sx = x + Math.cos(a) * radius;
      const sy = y + Math.sin(a) * radius * 0.5;
      const s = 14;
      ctx.beginPath();
      ctx.moveTo(sx, sy - s);
      ctx.lineTo(sx + s * 0.3, sy - s * 0.3);
      ctx.lineTo(sx + s, sy);
      ctx.lineTo(sx + s * 0.3, sy + s * 0.3);
      ctx.lineTo(sx, sy + s);
      ctx.lineTo(sx - s * 0.3, sy + s * 0.3);
      ctx.lineTo(sx - s, sy);
      ctx.lineTo(sx - s * 0.3, sy - s * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderEffects(ctx: CanvasRenderingContext2D, t: number, pose: Pose) {
    const headY = pose.hipY - pose.jump - 334;

    // The smug sparkle on the cup.
    this.sparkle(ctx, this.cupHomeX + 48, this.cupOnTableY(t) - 92, t, 0.8, 22);

    // Scene 2.
    this.impactBurst(ctx, this.rightWallX - 6, 952, t, 4.76, 54);
    this.impactBurst(ctx, 268, 800, t, 6.0, 70);
    this.littleStars(ctx, 268, headY - 40, t, 6.05, 96);

    // Scene 3.
    this.impactBurst(ctx, 462, 1112, t, 8.6, 26);
    this.impactBurst(ctx, 520, 1070, t, 9.1, 26);
    this.impactBurst(ctx, 578, 1028, t, 9.6, 26);
    this.impactBurst(ctx, 654, 950, t, 12.12, 36);
    this.impactBurst(ctx, 306, 1362, t, 12.5, 48);

    // Scene 4.
    this.impactBurst(ctx, 470, 1150, t, 15.42, 82);
    if (t > 15.55 && t < 15.9) {
      ctx.save();
      ctx.globalAlpha = 1 - (t - 15.55) / 0.35;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const x = 520 + i * 32;
        ctx.beginPath();
        ctx.moveTo(x, 1156);
        ctx.lineTo(x + 6, 1110 - i * 10);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Scene 5.
    this.impactBurst(ctx, 600, 158, t, 18.6, 30);
    this.impactBurst(ctx, 52, 544, t, 19.4, 46);
    this.impactBurst(ctx, this.lampX, 452, t, 20.2, 34);
    this.impactBurst(ctx, 430, 1138, t, 20.9, 40);
    this.impactBurst(ctx, 265, 750, t, 22.2, 44);
    this.littleStars(ctx, 265, 660, t, 22.22, 74);
    this.sparkle(ctx, 300, 610, t, 22.95, 26);
    this.sparkle(ctx, 214, 640, t, 23.1, 18);
    this.sparkle(ctx, 330, 700, t, 23.25, 14);

    // Scene 6.
    this.sparkle(ctx, 265, 720, t, 26.98, 20);
    this.impactBurst(ctx, 295, 776, t, 27.66, 62);
    this.littleStars(ctx, 295, headY - 20, t, 27.7, 88);
  }
}
