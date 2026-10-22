import { StudioConfig } from '../types';

/**
 * SequelPaperBallRenderer
 *
 * "The Paper Ball Ricochet — Episode 2".
 *
 * A direct sequel to the 30s episode: same white room, same stickman rig, same
 * props and same flat black-and-white vector language. The film opens on the
 * previous episode's aftermath (overturned trash can, scattered crumpled paper
 * balls) and runs eight new beats from 0.0s to 30.0s.
 */

type EyeStyle =
  | 'normal'
  | 'wide'
  | 'happy'
  | 'closed'
  | 'half'
  | 'deadpan'
  | 'angry'
  | 'fear';

type BrowStyle =
  | 'neutral'
  | 'raised'
  | 'oneRaised'
  | 'angry'
  | 'confused'
  | 'sad'
  | 'determined'
  | 'fear'
  | 'smug';

type MouthStyle =
  | 'flat'
  | 'smile'
  | 'grin'
  | 'open'
  | 'o'
  | 'grit'
  | 'smirk'
  | 'frown'
  | 'wobble';

type HandStyle = 'relaxed' | 'hold' | 'fist' | 'thumb' | 'point' | 'pointIn' | 'open';

interface Vec {
  x: number;
  y: number;
}

interface Pose {
  hipX: number;
  hipY: number;
  jump: number;
  lean: number;
  squashX: number;
  squashY: number;
  headTilt: number;
  face: number;
  gazeX: number;
  gazeY: number;
  eye: EyeStyle;
  brow: BrowStyle;
  mouth: MouthStyle;
  leftHand: Vec;
  rightHand: Vec;
  leftElbow: number;
  rightElbow: number;
  leftFoot: Vec;
  rightFoot: Vec;
  leftKnee: number;
  rightKnee: number;
  leftHandStyle: HandStyle;
  rightHandStyle: HandStyle;
  pupilScale: number;
  goggles: boolean;
  anger: boolean;
  sweat: boolean;
  tremble: boolean;
}

interface PathPoint {
  t: number;
  x: number;
  y: number;
}

interface BallFlight {
  id: string;
  points: PathPoint[];
  landTime: number;
  restX: number;
  restY: number;
  spin: number;
}

const TAU = Math.PI * 2;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => {
  const x = clamp(u, 0, 1);
  return x * x * (3 - 2 * x);
};
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u, 0, 1), 2);

/** Row of five paper balls waiting in front of the stickman. */
const ROW_X = [650, 690, 730, 770, 810];

/** Throw times, right-most ball first. */
const THROW_TIMES = [7.3, 8.05, 8.75, 9.55, 10.25];

/** Where each launched ball comes to rest. */
const BALL_REST: Array<{ x: number; y: number }> = [
  { x: 500, y: 1437 },
  { x: 740, y: 1437 },
  { x: 800, y: 1437 },
  { x: 430, y: 1437 },
  { x: 330, y: 1437 },
];

export class SequelPaperBallRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  private readonly floorY = 1460;
  private readonly ceilingY = 170;

  private readonly fanX = 545;
  private readonly fanY = 325;

  private readonly tableX = 70;
  private readonly tableY = 1130;
  private readonly tableW = 430;

  private readonly lampX = 270;

  private readonly trashX = 900;
  private readonly trashW = 112;
  private readonly trashH = 155;

  private readonly charX = 590;
  private readonly headRadius = 70;

  /** Launcher rig, all in world coordinates. */
  private readonly launcherX = 430;
  private readonly launcherY = 1130;
  private readonly bandAnchorX = 352;
  private readonly bandAnchorY = 1044;
  private readonly loadedBallX = 560;
  private readonly loadedBallY = 1022;

  public render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = clamp(time, 0, 30);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.width, this.height);

    const camera = this.getCamera(t);
    ctx.save();
    ctx.translate(this.width / 2 + camera.shakeX, this.height / 2 + camera.shakeY);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    this.renderRoom(ctx);
    this.renderCeilingFan(ctx, t);
    this.renderTable(ctx);
    this.renderTableLamp(ctx, t);
    this.renderTrashCan(ctx, t);
    this.renderLauncher(ctx, t);
    this.renderBooks(ctx, t);

    const pose = this.getPose(t);

    this.renderScatteredBalls(ctx, t);
    this.renderRowBalls(ctx, t);
    this.renderFlights(ctx, t);

    this.renderStickman(ctx, pose, t);

    this.renderEffects(ctx, t, pose);
    ctx.restore();

    if (config.showSafeZones) {
      this.renderSafeZones(ctx);
    }
  }

  // ==========================================================
  // CAMERA
  // ==========================================================

  private getCamera(t: number) {
    let x = 540;
    let y = 960;
    let zoom = 1.0;

    if (t < 3.0) {
      // Open on the aftermath: character plus the mess.
      x = 745;
      y = 1035;
      zoom = 1.04;
    } else if (t < 4.6) {
      // Follow him to the can and back.
      const u = smooth((t - 3.0) / 1.6);
      x = lerp(700, 560, u);
      y = lerp(1040, 970, u);
      zoom = 1.04;
    } else if (t < 7.0) {
      x = 560;
      y = 985;
      zoom = 1.02;
    } else if (t < 11.0) {
      x = 640;
      y = 1000;
      zoom = 1.05;
    } else if (t < 15.0) {
      x = 575;
      y = 975;
      zoom = 1.07;
    } else if (t < 19.0) {
      const u = smooth((t - 15.0) / 4.0);
      x = lerp(560, 600, u);
      y = lerp(990, 1000, u);
      zoom = lerp(1.05, t >= 18.2 ? 1.22 : 1.1, smooth((t - 17.8) / 1.0));
    } else if (t < 23.2) {
      // Track the returning ball.
      const ball = this.getLauncherBall(t);
      const focus = ball ? ball : { x: 500, y: 700 };
      x = lerp(620, focus.x, 0.42);
      y = lerp(980, focus.y, 0.34);
      zoom = 1.16;
    } else if (t < 27.0) {
      x = 700;
      y = 1010;
      zoom = 1.1;
    } else {
      x = 620;
      y = 1000;
      zoom = 1.14;
    }

    let shakeX = 0;
    let shakeY = 0;
    const impacts = [
      { at: 2.6, amp: 4 },
      { at: 3.85, amp: 9 },
      { at: 7.75, amp: 7 },
      { at: 8.35, amp: 6 },
      { at: 9.15, amp: 8 },
      { at: 12.45, amp: 9 },
      { at: 13.25, amp: 9 },
      { at: 19.0, amp: 16 },
      { at: 19.85, amp: 8 },
      { at: 20.55, amp: 11 },
      { at: 24.0, amp: 4 },
      { at: 27.6, amp: 15 },
      { at: 28.45, amp: 12 },
    ];
    for (const impact of impacts) {
      const age = t - impact.at;
      if (age >= 0 && age < 0.35) {
        const decay = Math.exp(-age * 12);
        shakeX += Math.sin(age * 110 + impact.at) * impact.amp * decay;
        shakeY += Math.cos(age * 95 + impact.at) * impact.amp * decay;
      }
    }

    return { x, y, zoom, shakeX, shakeY };
  }

  // ==========================================================
  // ROOM
  // ==========================================================

  private renderRoom(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Floor
    ctx.beginPath();
    ctx.moveTo(55, this.floorY);
    ctx.lineTo(1025, this.floorY);
    ctx.stroke();

    // Ceiling
    ctx.beginPath();
    ctx.moveTo(55, this.ceilingY);
    ctx.lineTo(1025, this.ceilingY);
    ctx.stroke();

    // Right wall corner
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(1015, this.ceilingY);
    ctx.lineTo(1015, this.floorY);
    ctx.stroke();

    // Tiny wall baseboard tick marks keep the corner readable.
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(995, 1418);
    ctx.lineTo(1015, 1418);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // CEILING FAN
  // ==========================================================

  private renderCeilingFan(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();

    // Ceiling plate and downrod
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.fanX - 42, this.ceilingY, 84, 16);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(this.fanX, this.ceilingY + 16);
    ctx.lineTo(this.fanX, this.fanY - 27);
    ctx.stroke();

    ctx.translate(this.fanX, this.fanY);

    // Motor housing
    ctx.fillStyle = '#000000';
    ctx.fillRect(-38, -27, 76, 54);

    const spin = t * 5.1 + (t >= 20.55 ? (t - 20.55) * 9 : 0);
    let bladeFlex = 0;
    if (t >= 20.55 && t <= 21.05) {
      const u = (t - 20.55) / 0.5;
      bladeFlex = Math.sin(u * Math.PI * 3.2) * 20 * (1 - u);
    }

    for (let i = 0; i < 3; i++) {
      const angle = spin + (i * TAU) / 3;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(24, -20 + (i === 0 ? bladeFlex : 0));
      ctx.lineTo(190, -30);
      ctx.quadraticCurveTo(216, 0, 190, 30);
      ctx.lineTo(24, 20 + (i === 0 ? bladeFlex : 0));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, 21, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, TAU);
    ctx.fill();

    // Fan impact burst
    if (t >= 20.55 && t <= 20.9) {
      const u = (t - 20.55) / 0.35;
      ctx.save();
      ctx.translate(-145, 5);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4 * (1 - u);
      for (let i = 0; i < 7; i++) {
        const a = (i * TAU) / 7;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20);
        ctx.lineTo(Math.cos(a) * (65 + u * 40), Math.sin(a) * (65 + u * 40));
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // ==========================================================
  // TABLE + LAMP
  // ==========================================================

  private renderTable(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.rect(this.tableX, this.tableY, this.tableW, 26);
    ctx.fill();
    ctx.stroke();

    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(this.tableX + 45, this.tableY + 26);
    ctx.lineTo(this.tableX + 45, this.floorY);
    ctx.moveTo(this.tableX + this.tableW - 45, this.tableY + 26);
    ctx.lineTo(this.tableX + this.tableW - 45, this.floorY);
    ctx.stroke();

    // Lower crossbar
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(this.tableX + 45, this.floorY - 110);
    ctx.lineTo(this.tableX + this.tableW - 45, this.floorY - 110);
    ctx.stroke();

    ctx.restore();
  }

  private renderTableLamp(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.translate(this.lampX, this.tableY);

    let wobble = 0;
    if (t >= 19.85 && t <= 20.9) {
      const u = (t - 19.85) / 1.05;
      wobble = Math.sin(u * Math.PI * 6) * 0.36 * Math.exp(-u * 3.1);
    }

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(0, 0, 37, 10, 0, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -115);
    ctx.stroke();

    ctx.translate(0, -115);
    ctx.rotate(wobble);

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(-49, -84);
    ctx.lineTo(49, -84);
    ctx.lineTo(26, 0);
    ctx.lineTo(-26, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillRect(-6, -96, 12, 13);

    if (t >= 19.85 && t <= 20.2) {
      const u = (t - 19.85) / 0.35;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3 * (1 - u);
      ctx.beginPath();
      ctx.arc(43, -45, 12 + u * 45, 0, TAU);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================
  // TRASH CAN
  // ==========================================================

  private renderTrashCan(ctx: CanvasRenderingContext2D, t: number) {
    // Overturned at the start, stood back up between 3.68s and 3.92s.
    const tip = 1.32 * (1 - smooth((t - 3.68) / 0.24));
    ctx.save();

    // Pivot at the bottom-right corner; an upright can has tip = 0.
    ctx.translate(this.trashX + 45, this.floorY);
    ctx.rotate(tip);
    ctx.translate(-45, 0);

    const topW = this.trashW;
    const botW = this.trashW * 0.78;
    const h = this.trashH;

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(-topW / 2, -h);
    ctx.lineTo(topW / 2, -h);
    ctx.lineTo(botW / 2, 0);
    ctx.lineTo(-botW / 2, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, -h, topW / 2 - 5, 12, 0, 0, TAU);
    ctx.stroke();

    // The winning ball resting in the can.
    if (t >= 24.2) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -h - 4, 13, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================
  // BOOKS + LAUNCHER
  // ==========================================================

  private drawBook(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    angle: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, w, h);
    ctx.fill();
    ctx.stroke();

    // Black spine band on the left edge.
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, 12, h);
    ctx.fill();

    // Page edges on the right.
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 8, -h / 2 + 4);
    ctx.lineTo(w / 2 - 8, h / 2 - 4);
    ctx.moveTo(w / 2 - 14, -h / 2 + 6);
    ctx.lineTo(w / 2 - 14, h / 2 - 6);
    ctx.stroke();
    ctx.restore();
  }

  private renderBooks(ctx: CanvasRenderingContext2D, t: number) {
    // The stack lives on the table until the launcher snaps apart.
    if (t < 15.6) return;

    if (t < 27.6) {
      // Static stack on the table.
      for (let i = 0; i < 3; i++) {
        const jitter = i === 1 ? 4 : 0;
        this.drawBook(
          ctx,
          this.launcherX + jitter,
          this.launcherY - 13 - i * 26,
          92 - i * 4,
          24,
          (i - 1) * 0.02
        );
      }
      return;
    }

    // Books fly apart when the launcher snaps.
    const u = clamp((t - 27.6) / 0.85, 0, 1);
    const targets = [
      { x: 150, y: 520, rot: -2.4 },
      { x: 880, y: 430, rot: 2.6 },
      { x: 0, y: 0, rot: 0 },
    ];
    for (let i = 0; i < 3; i++) {
      const target = targets[i];
      if (i === 2) continue; // the third book lands on his head instead
      const startX = this.launcherX + (i === 1 ? 4 : 0);
      const startY = this.launcherY - 13 - i * 26;
      const x = lerp(startX, target.x, easeOut(u));
      const y = lerp(startY, target.y, easeOut(u)) - Math.sin(u * Math.PI) * 150;
      this.drawBook(ctx, x, y, 92 - i * 4, 24, target.rot * u);
    }
  }

  private renderLauncher(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 16.4) return;

    const built = smooth((t - 16.4) / 0.5);
    ctx.save();

    // Ruler laid across the book stack.
    ctx.save();
    ctx.translate(this.launcherX - 6, this.launcherY - 88);
    ctx.rotate(-0.06 * built);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.rect(-92, -13, 184, 26);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 2.5;
    for (let i = -75; i <= 75; i += 15) {
      ctx.beginPath();
      ctx.moveTo(i, -13);
      ctx.lineTo(i, i % 30 === 0 ? -2 : -6);
      ctx.stroke();
    }
    ctx.restore();

    // Rubber bands stretched back to the loaded ball.
    if (t >= 17.0 && t < 19.02) {
      const pull = smooth((t - 17.0) / 0.5);
      const release = smooth((t - 19.0) / 0.02);
      const ballX = lerp(this.bandAnchorX + 30, this.loadedBallX, pull);
      const ballY = lerp(this.bandAnchorY - 6, this.loadedBallY, pull);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      const snap = release > 0 ? 26 : 0;
      ctx.beginPath();
      ctx.moveTo(this.bandAnchorX, this.bandAnchorY);
      ctx.lineTo(ballX - 6, ballY - 4);
      ctx.moveTo(this.bandAnchorX + 14, this.bandAnchorY + 10);
      ctx.lineTo(ballX + 2, ballY + 8);
      ctx.stroke();

      if (release > 0) {
        // The snapped bands whip away from the ball.
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.bandAnchorX, this.bandAnchorY);
        ctx.lineTo(this.bandAnchorX - 60 - snap, this.bandAnchorY - 40 - snap);
        ctx.moveTo(this.bandAnchorX + 14, this.bandAnchorY + 10);
        ctx.lineTo(this.bandAnchorX - 30 - snap, this.bandAnchorY + 50 + snap);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ==========================================================
  // BALLS
  // ==========================================================

  private getFlights(): BallFlight[] {
    return [
      {
        id: 'throw-1',
        landTime: 8.5,
        restX: BALL_REST[0].x,
        restY: BALL_REST[0].y,
        spin: 5,
        points: [
          { t: 7.3, x: 740, y: 1010 },
          { t: 7.55, x: 650, y: 620 },
          { t: 7.75, x: 500, y: 205 },
          { t: 8.1, x: 486, y: 700 },
          { t: 8.5, x: 470, y: 1437 },
        ],
      },
      {
        id: 'throw-2',
        landTime: 8.95,
        restX: BALL_REST[1].x,
        restY: BALL_REST[1].y,
        spin: -6,
        points: [
          { t: 8.05, x: 740, y: 1010 },
          { t: 8.2, x: 690, y: 1240 },
          { t: 8.35, x: 648, y: 1416 },
          { t: 8.6, x: 730, y: 1330 },
          { t: 8.95, x: 790, y: 1437 },
        ],
      },
      {
        id: 'throw-3',
        landTime: 9.95,
        restX: BALL_REST[2].x,
        restY: BALL_REST[2].y,
        spin: 7,
        points: [
          { t: 8.75, x: 740, y: 1010 },
          { t: 8.95, x: 880, y: 880 },
          { t: 9.15, x: 990, y: 905 },
          { t: 9.5, x: 930, y: 1200 },
          { t: 9.95, x: 860, y: 1437 },
        ],
      },
      {
        id: 'throw-4',
        landTime: 10.4,
        restX: BALL_REST[3].x,
        restY: BALL_REST[3].y,
        spin: -4,
        points: [
          { t: 9.55, x: 740, y: 1010 },
          { t: 9.75, x: 655, y: 690 },
          { t: 9.95, x: 520, y: 640 },
          { t: 10.15, x: 450, y: 1000 },
          { t: 10.4, x: 430, y: 1437 },
        ],
      },
      {
        id: 'throw-5',
        landTime: 11.1,
        restX: BALL_REST[4].x,
        restY: BALL_REST[4].y,
        spin: 5,
        points: [
          { t: 10.25, x: 740, y: 1010 },
          { t: 10.45, x: 660, y: 700 },
          { t: 10.65, x: 470, y: 660 },
          { t: 10.85, x: 380, y: 1010 },
          { t: 11.1, x: 330, y: 1437 },
        ],
      },
    ];
  }

  private getLauncherBall(t: number): Vec | null {
    if (t < 19.0 || t > 24.25) return null;
    const points: PathPoint[] = [
      { t: 19.0, x: this.loadedBallX, y: this.loadedBallY },
      { t: 19.3, x: 430, y: 1000 },
      { t: 19.85, x: 300, y: 975 },
      { t: 20.1, x: 330, y: 700 },
      { t: 20.55, x: 400, y: 330 },
      { t: 21.1, x: 450, y: 560 },
      { t: 21.7, x: 520, y: 690 },
      { t: 23.05, x: 592, y: 700 },
      { t: 23.55, x: 700, y: 810 },
      { t: 24.0, x: 900, y: 1262 },
      { t: 24.25, x: 900, y: 1292 },
    ];
    return this.samplePath(points, t);
  }

  private samplePath(points: PathPoint[], t: number): Vec {
    if (t <= points[0].t) return { x: points[0].x, y: points[0].y };
    const last = points[points.length - 1];
    if (t >= last.t) return { x: last.x, y: last.y };

    let i = 0;
    while (i < points.length - 2 && t > points[i + 1].t) i++;

    const p1 = points[i];
    const p2 = points[i + 1];
    const u = (t - p1.t) / Math.max(0.0001, p2.t - p1.t);

    const p0 = points[Math.max(0, i - 1)];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Hermite tangents from the neighbouring keyframes.
    const m1x = (p2.x - p0.x) * 0.5;
    const m1y = (p2.y - p0.y) * 0.5;
    const m2x = (p3.x - p1.x) * 0.5;
    const m2y = (p3.y - p1.y) * 0.5;

    const u2 = u * u;
    const u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1;
    const h10 = u3 - 2 * u2 + u;
    const h01 = -2 * u3 + 3 * u2;
    const h11 = u3 - u2;

    const rawX = h00 * p1.x + h10 * m1x + h01 * p2.x + h11 * m2x;
    const rawY = h00 * p1.y + h10 * m1y + h01 * p2.y + h11 * m2y;

    // Clamp to the segment box so a ball never overshoots past a bounce.
    return {
      x: clamp(rawX, Math.min(p1.x, p2.x), Math.max(p1.x, p2.x)),
      y: clamp(rawY, Math.min(p1.y, p2.y), Math.max(p1.y, p2.y)),
    };
  }

  private renderScatteredBalls(ctx: CanvasRenderingContext2D, t: number) {
    if (t >= 6.2) return;

    // The five balls from the previous episode's crash, then they scoot into
    // a neat row between 5.4s and 6.1s.
    const spilled = [
      { x: 935, y: 1438 },
      { x: 985, y: 1448 },
      { x: 1025, y: 1432 },
      { x: 890, y: 1450 },
      { x: 965, y: 1412 },
    ];

    spilled.forEach((from, i) => {
      const delay = i * 0.06;
      const u = smooth(clamp((t - 5.4 - delay) / 0.55, 0, 1));
      const to = { x: ROW_X[i], y: 1437 };
      const x = lerp(from.x, to.x, u);
      const y = lerp(from.y, to.y, u) - Math.sin(u * Math.PI) * 26;
      this.drawPaperBall(ctx, x, y, u * 2.2 + i, 1, 1, 1);
    });
  }

  private renderRowBalls(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 5.4) return;

    ROW_X.forEach((x, i) => {
      const throwTime = THROW_TIMES[ROW_X.length - 1 - i];
      if (t >= throwTime) return;
      const delay = i * 0.06;
      const u = smooth(clamp((t - 5.4 - delay) / 0.55, 0, 1));
      const from = { x: 935 + i * 22, y: 1440 };
      const px = lerp(from.x, x, u);
      const py = lerp(from.y, 1437, u) - Math.sin(u * Math.PI) * 26;
      this.drawPaperBall(ctx, px, py, u * 2.2 + i, 1, 1, 1);
    });
  }

  private renderFlights(ctx: CanvasRenderingContext2D, t: number) {
    // The ball loaded in the rubber bands before the launch.
    if (t >= 17.0 && t < 19.0) {
      const pull = smooth((t - 17.0) / 0.5);
      const x = lerp(this.bandAnchorX + 30, this.loadedBallX, pull);
      const y = lerp(this.bandAnchorY - 6, this.loadedBallY, pull);
      this.drawPaperBall(ctx, x, y, 0.2, 1, 1, 1);
    }

    for (const flight of this.getFlights()) {
      const start = flight.points[0].t;
      if (t < start) continue;

      if (t >= flight.landTime) {
        // Resting on the floor from here on (it stops spinning once it lands).
        this.drawPaperBall(ctx, flight.restX, flight.restY, flight.spin * 0.4, 1, 1, 1);
        continue;
      }

      const p = this.samplePath(flight.points, t);
      this.drawPaperBall(ctx, p.x, p.y, flight.spin * (t - start), 1, 1, 1);

      // Motion trail
      const prev = this.samplePath(flight.points, Math.max(start, t - 0.06));
      this.drawPaperBall(ctx, prev.x, prev.y, flight.spin * (t - start) - 0.4, 1, 1, 0.18);
    }

    // The launcher shot.
    const shot = this.getLauncherBall(t);
    if (shot) {
      this.drawPaperBall(ctx, shot.x, shot.y, (t - 19.0) * 9, 1, 1, 1);
      if (t >= 19.0) {
        const prev = this.samplePath(
          [
            { t: 19.0, x: this.loadedBallX, y: this.loadedBallY },
            { t: 19.3, x: 430, y: 1000 },
            { t: 19.85, x: 300, y: 975 },
            { t: 20.1, x: 330, y: 700 },
            { t: 20.55, x: 400, y: 330 },
            { t: 21.1, x: 450, y: 560 },
            { t: 21.7, x: 520, y: 690 },
            { t: 23.05, x: 592, y: 700 },
            { t: 23.55, x: 700, y: 810 },
            { t: 24.0, x: 900, y: 1262 },
            { t: 24.25, x: 900, y: 1292 },
          ],
          Math.max(19.0, t - 0.05)
        );
        this.drawPaperBall(ctx, prev.x, prev.y, (t - 19.0) * 9 - 0.4, 1, 1, 0.18);
      }
    }
  }

  private drawPaperBall(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rotation: number,
    scaleX: number,
    scaleY: number,
    alpha: number
  ) {
    const radius = 23;
    const points = [
      { r: 1.05, a: 0 },
      { r: 0.88, a: 0.72 },
      { r: 1.14, a: 1.45 },
      { r: 0.9, a: 2.24 },
      { r: 1.08, a: 3.02 },
      { r: 0.85, a: 3.82 },
      { r: 1.12, a: 4.6 },
      { r: 0.92, a: 5.45 },
    ];

    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scaleX, scaleY);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((pt, idx) => {
      const px = Math.cos(pt.a) * radius * pt.r;
      const py = Math.sin(pt.a) * radius * pt.r;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.lineWidth = 2.7;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.58, -radius * 0.3);
    ctx.lineTo(0, radius * 0.1);
    ctx.lineTo(radius * 0.66, -radius * 0.2);
    ctx.moveTo(-radius * 0.2, radius * 0.58);
    ctx.lineTo(radius * 0.12, -radius * 0.38);
    ctx.lineTo(radius * 0.48, radius * 0.38);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // STICKMAN RIG
  // ==========================================================

  private basePose(): Pose {
    return {
      hipX: this.charX,
      hipY: 1160,
      jump: 0,
      lean: 0,
      squashX: 1,
      squashY: 1,
      headTilt: 0,
      face: 0,
      gazeX: 0.45,
      gazeY: 0,
      eye: 'normal',
      brow: 'neutral',
      mouth: 'flat',
      leftHand: { x: -58, y: -60 },
      rightHand: { x: 62, y: -60 },
      leftElbow: -18,
      rightElbow: 18,
      leftFoot: { x: -50, y: 300 },
      rightFoot: { x: 54, y: 300 },
      leftKnee: -12,
      rightKnee: 12,
      leftHandStyle: 'relaxed',
      rightHandStyle: 'relaxed',
      pupilScale: 1,
      goggles: false,
      anger: false,
      sweat: false,
      tremble: false,
    };
  }

  private pose(overrides: Partial<Pose> = {}): Pose {
    return { ...this.basePose(), ...overrides };
  }

  private blendPose(a: Pose, b: Pose, rawU: number): Pose {
    const u = smooth(rawU);
    const discrete = rawU >= 0.5 ? b : a;
    return {
      hipX: lerp(a.hipX, b.hipX, u),
      hipY: lerp(a.hipY, b.hipY, u),
      jump: lerp(a.jump, b.jump, u),
      lean: lerp(a.lean, b.lean, u),
      squashX: lerp(a.squashX, b.squashX, u),
      squashY: lerp(a.squashY, b.squashY, u),
      headTilt: lerp(a.headTilt, b.headTilt, u),
      face: lerp(a.face, b.face, u),
      gazeX: lerp(a.gazeX, b.gazeX, u),
      gazeY: lerp(a.gazeY, b.gazeY, u),
      eye: discrete.eye,
      brow: discrete.brow,
      mouth: discrete.mouth,
      leftHand: { x: lerp(a.leftHand.x, b.leftHand.x, u), y: lerp(a.leftHand.y, b.leftHand.y, u) },
      rightHand: { x: lerp(a.rightHand.x, b.rightHand.x, u), y: lerp(a.rightHand.y, b.rightHand.y, u) },
      leftElbow: lerp(a.leftElbow, b.leftElbow, u),
      rightElbow: lerp(a.rightElbow, b.rightElbow, u),
      leftFoot: { x: lerp(a.leftFoot.x, b.leftFoot.x, u), y: lerp(a.leftFoot.y, b.leftFoot.y, u) },
      rightFoot: { x: lerp(a.rightFoot.x, b.rightFoot.x, u), y: lerp(a.rightFoot.y, b.rightFoot.y, u) },
      leftKnee: lerp(a.leftKnee, b.leftKnee, u),
      rightKnee: lerp(a.rightKnee, b.rightKnee, u),
      leftHandStyle: discrete.leftHandStyle,
      rightHandStyle: discrete.rightHandStyle,
      pupilScale: lerp(a.pupilScale, b.pupilScale, u),
      goggles: discrete.goggles,
      anger: discrete.anger,
      sweat: discrete.sweat,
      tremble: discrete.tremble,
    };
  }

  private fromFrames(t: number, frames: Array<[number, Pose]>): Pose {
    if (t <= frames[0][0]) return frames[0][1];
    for (let i = 0; i < frames.length - 1; i++) {
      const [timeA, poseA] = frames[i];
      const [timeB, poseB] = frames[i + 1];
      if (t < timeB) {
        return this.blendPose(poseA, poseB, (t - timeA) / Math.max(0.0001, timeB - timeA));
      }
    }
    return frames[frames.length - 1][1];
  }

  private getPose(t: number): Pose {
    if (t < 3.0) return this.getOpeningPose(t);
    if (t < 7.0) return this.getPreparationPose(t);
    if (t < 11.0) return this.getThrowPose(t);
    if (t < 15.0) return this.getRagePose(t);
    if (t < 19.0) return this.getBuildPose(t);
    if (t < 23.8) return this.getLaunchPose(t);
    if (t < 27.0) return this.getVictoryPose(t);
    return this.getCrashPose(t);
  }

  // --- 0-3s: stare, accuse, clench -------------------------------

  private getOpeningPose(t: number): Pose {
    return this.fromFrames(t, [
      [
        0.0,
        this.pose({
          face: 0.15,
          eye: 'normal',
          brow: 'sad',
          mouth: 'flat',
          gazeX: 0.45,
          gazeY: 0.5,
          headTilt: 0.08,
          squashY: 0.96,
          leftHand: { x: -56, y: -46 },
          rightHand: { x: 60, y: -46 },
        }),
      ],
      [
        1.2,
        this.pose({
          face: 0.2,
          eye: 'normal',
          brow: 'sad',
          mouth: 'flat',
          gazeX: 0.8,
          gazeY: 0.05,
          headTilt: -0.04,
          squashY: 0.97,
          leftHand: { x: -56, y: -48 },
          rightHand: { x: 62, y: -48 },
        }),
      ],
      [
        2.0,
        this.pose({
          face: 0.55,
          eye: 'normal',
          brow: 'angry',
          mouth: 'open',
          gazeX: 0.85,
          gazeY: 0.05,
          headTilt: -0.02,
          rightHand: { x: 168, y: -92 },
          rightHandStyle: 'point',
          rightElbow: 2,
          leftHand: { x: -60, y: -60 },
        }),
      ],
      [
        2.45,
        this.pose({
          face: 0.55,
          eye: 'normal',
          brow: 'angry',
          mouth: 'open',
          gazeX: 0.85,
          gazeY: 0.05,
          headTilt: -0.02,
          rightHand: { x: 152, y: -80 },
          rightHandStyle: 'point',
          rightElbow: 4,
          leftHand: { x: -62, y: -62 },
        }),
      ],
      [
        2.75,
        this.pose({
          face: 0.6,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          gazeX: 0.8,
          gazeY: 0,
          headTilt: 0.02,
          rightHand: { x: 74, y: -70 },
          rightHandStyle: 'fist',
          rightElbow: 18,
          leftHand: { x: -72, y: -70 },
          leftHandStyle: 'fist',
          leftElbow: -18,
          anger: true,
          squashY: 0.98,
        }),
      ],
      [
        3.0,
        this.pose({
          face: 0.6,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          gazeX: 0.85,
          gazeY: 0,
          rightHand: { x: 74, y: -66 },
          rightHandStyle: 'fist',
          leftHand: { x: -72, y: -66 },
          leftHandStyle: 'fist',
          anger: true,
          squashY: 0.98,
        }),
      ],
    ]);
  }

  // --- 3-7s: right the can, measure, line up, pose ---------------

  private getPreparationPose(t: number): Pose {
    return this.fromFrames(t, [
      [
        3.0,
        this.pose({
          face: 0.4,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: 0.8,
          gazeY: 0.1,
          anger: false,
          rightHand: { x: 74, y: -66 },
          rightHandStyle: 'fist',
          leftHand: { x: -72, y: -66 },
          leftHandStyle: 'fist',
        }),
      ],
      [
        3.6,
        this.pose({
          face: 0.3,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: 0.85,
          gazeY: 0.2,
          hipX: 752,
          squashY: 0.9,
          rightHand: { x: 120, y: -30 },
          rightHandStyle: 'open',
          leftHand: { x: -40, y: -50 },
        }),
      ],
      [
        3.95,
        this.pose({
          face: 0.3,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: 0.85,
          gazeY: 0.15,
          hipX: 748,
          squashY: 0.88,
          rightHand: { x: 128, y: -20 },
          rightHandStyle: 'open',
          leftHand: { x: -40, y: -50 },
        }),
      ],
      [
        4.5,
        this.pose({
          face: 0.2,
          eye: 'normal',
          brow: 'neutral',
          mouth: 'flat',
          gazeX: 0.8,
          gazeY: 0.05,
          hipX: 600,
          squashY: 0.98,
          rightHand: { x: 64, y: -52 },
          leftHand: { x: -60, y: -56 },
        }),
      ],
      [
        4.75,
        this.pose({
          face: 0.25,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: 0.75,
          gazeY: 0.1,
          rightHand: { x: 128, y: -108 },
          rightHandStyle: 'hold',
          rightElbow: 8,
          leftHand: { x: -60, y: -56 },
        }),
      ],
      [
        5.3,
        this.pose({
          face: 0.25,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: 0.7,
          gazeY: 0.15,
          rightHand: { x: 152, y: -122 },
          rightHandStyle: 'hold',
          rightElbow: 4,
          leftHand: { x: -62, y: -56 },
        }),
      ],
      [
        6.1,
        this.pose({
          face: 0.25,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: 0.5,
          gazeY: 0.35,
          leftHand: { x: -64, y: -56 },
          rightHand: { x: 64, y: -56 },
        }),
      ],
      [
        6.5,
        this.pose({
          face: 0.35,
          eye: 'normal',
          brow: 'determined',
          mouth: 'smirk',
          gazeX: 0.6,
          gazeY: 0,
          leftHand: { x: -48, y: -186 },
          leftHandStyle: 'fist',
          leftElbow: -34,
          rightHand: { x: 48, y: -186 },
          rightHandStyle: 'fist',
          rightElbow: 34,
        }),
      ],
      [
        6.9,
        this.pose({
          face: 0.45,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          gazeX: 0.55,
          gazeY: -0.05,
          squashX: 1.05,
          squashY: 0.97,
          lean: -0.03,
          leftHand: { x: -86, y: -34 },
          leftElbow: -30,
          rightHand: { x: 88, y: -34 },
          rightElbow: 30,
        }),
      ],
      [
        7.0,
        this.pose({
          face: 0.45,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          gazeX: 0.55,
          gazeY: -0.05,
          squashX: 1.05,
          squashY: 0.97,
          lean: -0.03,
          leftHand: { x: -86, y: -34 },
          leftElbow: -30,
          rightHand: { x: 88, y: -34 },
          rightElbow: 30,
        }),
      ],
    ]);
  }

  // --- 7-11s: five throws, fading smile -------------------------

  private getThrowPose(t: number): Pose {
    const frames: Array<[number, Pose]> = [];

    // The champion pose bleeds into the first wind-up.
    frames.push([
      7.0,
      this.pose({
        face: 0.45,
        eye: 'happy',
        brow: 'smug',
        mouth: 'grin',
        gazeX: 0.55,
        gazeY: -0.05,
        squashX: 1.05,
        squashY: 0.97,
        lean: -0.03,
        leftHand: { x: -86, y: -34 },
        leftElbow: -30,
        rightHand: { x: 88, y: -34 },
        rightElbow: 30,
      }),
    ]);

    // Confidence evaporates shot by shot.
    const moods = [
      { face: 0.45, eye: 'happy' as EyeStyle, brow: 'smug' as BrowStyle, mouth: 'grin' as MouthStyle },
      { face: 0.4, eye: 'normal' as EyeStyle, brow: 'smug' as BrowStyle, mouth: 'smile' as MouthStyle },
      { face: 0.3, eye: 'normal' as EyeStyle, brow: 'neutral' as BrowStyle, mouth: 'flat' as MouthStyle },
      { face: 0.2, eye: 'normal' as EyeStyle, brow: 'sad' as BrowStyle, mouth: 'frown' as MouthStyle },
      { face: 0.1, eye: 'deadpan' as EyeStyle, brow: 'oneRaised' as BrowStyle, mouth: 'flat' as MouthStyle },
    ];

    THROW_TIMES.forEach((throwTime, index) => {
      const mood = moods[index];
      frames.push([
        throwTime - 0.24,
        this.pose({
          face: mood.face,
          eye: mood.eye,
          brow: mood.brow,
          mouth: mood.mouth,
          gazeX: 0.65,
          gazeY: -0.05,
          rightHand: { x: 58, y: -232 },
          rightHandStyle: 'hold',
          rightElbow: 22,
          leftHand: { x: -60, y: -58 },
          leftElbow: -20,
        }),
      ]);
      frames.push([
        throwTime,
        this.pose({
          face: mood.face,
          eye: mood.eye,
          brow: mood.brow,
          mouth: mood.mouth,
          gazeX: 0.75,
          gazeY: -0.1,
          lean: 0.04,
          rightHand: { x: 150, y: -150 },
          rightHandStyle: 'open',
          rightElbow: 10,
          leftHand: { x: -66, y: -60 },
          leftElbow: -22,
        }),
      ]);
      frames.push([
        throwTime + 0.16,
        this.pose({
          face: mood.face,
          eye: mood.eye,
          brow: mood.brow,
          mouth: mood.mouth,
          gazeX: 0.8,
          gazeY: -0.1,
          lean: 0.02,
          rightHand: { x: 172, y: -66 },
          rightHandStyle: 'open',
          rightElbow: 12,
          leftHand: { x: -64, y: -58 },
          leftElbow: -20,
        }),
      ]);
      frames.push([
        throwTime + 0.3,
        this.pose({
          face: mood.face,
          eye: mood.eye,
          brow: mood.brow,
          mouth: mood.mouth,
          gazeX: 0.7,
          gazeY: -0.05,
          rightHand: { x: 76, y: -70 },
          rightHandStyle: 'relaxed',
          rightElbow: 18,
          leftHand: { x: -62, y: -58 },
          leftElbow: -20,
        }),
      ]);
    });

    // Wincing after the foot bonk, and turning to watch the misses.
    frames.push([
      8.42,
      this.pose({
        face: 0.4,
        eye: 'closed',
        brow: 'sad',
        mouth: 'open',
        gazeX: 0.3,
        gazeY: 0.4,
        rightFoot: { x: 78, y: 244 },
        rightHand: { x: 70, y: -90 },
        rightHandStyle: 'open',
        rightElbow: 18,
        leftHand: { x: -62, y: -58 },
      }),
    ]);
    frames.push([
      9.4,
      this.pose({
        face: 0.25,
        eye: 'normal',
        brow: 'neutral',
        mouth: 'flat',
        gazeX: 0.85,
        gazeY: -0.05,
        headTilt: -0.05,
        rightHand: { x: 72, y: -66 },
        leftHand: { x: -60, y: -56 },
      }),
    ]);
    frames.push([
      10.1,
      this.pose({
        face: 0.2,
        eye: 'normal',
        brow: 'sad',
        mouth: 'frown',
        gazeX: -0.5,
        gazeY: 0,
        headTilt: 0.12,
        rightHand: { x: 70, y: -60 },
        leftHand: { x: -58, y: -54 },
      }),
    ]);
    frames.push([
      10.7,
      this.pose({
        face: 0.1,
        eye: 'deadpan',
        brow: 'oneRaised',
        mouth: 'flat',
        gazeX: -0.2,
        gazeY: 0,
        headTilt: 0.05,
        rightHand: { x: 68, y: -58 },
        leftHand: { x: -56, y: -52 },
      }),
    ]);
    frames.push([
      11.0,
      this.pose({
        face: 0.1,
        eye: 'deadpan',
        brow: 'oneRaised',
        mouth: 'flat',
        gazeX: -0.1,
        gazeY: 0,
        headTilt: 0.02,
        rightHand: { x: 68, y: -58 },
        leftHand: { x: -56, y: -52 },
      }),
    ]);

    return this.fromFrames(t, frames);
  }

  // --- 11-15s: rage, stomps, fake calm ---------------------------

  private getRagePose(t: number): Pose {
    const rage = (extra: Partial<Pose> = {}) =>
      this.pose({
        face: 0.6,
        eye: 'angry',
        brow: 'angry',
        mouth: 'grit',
        gazeX: 0.8,
        gazeY: 0,
        rightHand: { x: 72, y: -78 },
        rightHandStyle: 'fist',
        rightElbow: 20,
        leftHand: { x: -74, y: -78 },
        leftHandStyle: 'fist',
        leftElbow: -20,
        anger: true,
        tremble: true,
        ...extra,
      });

    return this.fromFrames(t, [
      [
        11.0,
        rage({
          face: 0.25,
          eye: 'deadpan',
          brow: 'oneRaised',
          mouth: 'flat',
          anger: false,
          tremble: false,
        }),
      ],
      [
        11.35,
        rage({ tremble: true }),
      ],
      [
        12.18,
        rage({ jump: 58, squashY: 1.05, tremble: false }),
      ],
      [
        12.45,
        rage({ jump: 0, squashY: 0.88, squashX: 1.08, tremble: false }),
      ],
      [
        12.7,
        rage({ squashY: 1, squashX: 1 }),
      ],
      [
        13.0,
        rage({ jump: 52, squashY: 1.05, tremble: false }),
      ],
      [
        13.25,
        rage({ jump: 0, squashY: 0.88, squashX: 1.08, tremble: false }),
      ],
      [
        13.5,
        rage({ squashY: 1, squashX: 1 }),
      ],
      [
        14.0,
        this.pose({
          face: 0.4,
          eye: 'closed',
          brow: 'neutral',
          mouth: 'o',
          gazeX: 0,
          gazeY: 0,
          squashY: 1.08,
          squashX: 0.95,
          anger: false,
          tremble: false,
          rightHand: { x: 26, y: -150 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -26, y: -150 },
          leftHandStyle: 'open',
          leftElbow: -26,
        }),
      ],
      [
        14.4,
        this.pose({
          face: 0.4,
          eye: 'closed',
          brow: 'neutral',
          mouth: 'smile',
          gazeX: 0,
          gazeY: 0,
          squashY: 0.96,
          squashX: 1.03,
          anger: false,
          tremble: false,
          rightHand: { x: 26, y: -150 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -26, y: -150 },
          leftHandStyle: 'open',
          leftElbow: -26,
        }),
      ],
      [
        14.75,
        this.pose({
          face: 0.5,
          eye: 'happy',
          brow: 'raised',
          mouth: 'grin',
          gazeX: 0.35,
          gazeY: -0.05,
          jump: 14,
          squashY: 1.02,
          anger: false,
          tremble: false,
          rightHand: { x: 62, y: -150 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -62, y: -150 },
          leftHandStyle: 'open',
          leftElbow: -26,
        }),
      ],
      [
        15.0,
        this.pose({
          face: 0.4,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: -0.55,
          gazeY: 0.1,
          jump: 0,
          anger: false,
          tremble: false,
          rightHand: { x: 40, y: -120 },
          rightHandStyle: 'open',
          rightElbow: 20,
          leftHand: { x: -90, y: -130 },
          leftHandStyle: 'open',
          leftElbow: -18,
        }),
      ],
    ]);
  }

  // --- 15-19s: build the launcher, goggles, thumbs-up ------------

  private getBuildPose(t: number): Pose {
    return this.fromFrames(t, [
      [
        15.0,
        this.pose({
          face: 0.4,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: -0.55,
          gazeY: 0.1,
          rightHand: { x: 40, y: -120 },
          rightHandStyle: 'open',
          rightElbow: 20,
          leftHand: { x: -90, y: -130 },
          leftHandStyle: 'open',
          leftElbow: -18,
        }),
      ],
      [
        15.6,
        this.pose({
          face: 0.35,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: -0.6,
          gazeY: 0.25,
          hipX: 528,
          squashY: 0.95,
          rightHand: { x: 20, y: -110 },
          rightHandStyle: 'open',
          rightElbow: 16,
          leftHand: { x: -140, y: -140 },
          leftHandStyle: 'open',
          leftElbow: -14,
        }),
      ],
      [
        16.4,
        this.pose({
          face: 0.35,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: -0.5,
          gazeY: 0.2,
          hipX: 528,
          rightHand: { x: -70, y: -150 },
          rightHandStyle: 'open',
          rightElbow: 14,
          leftHand: { x: -120, y: -130 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
      [
        16.95,
        this.pose({
          face: 0.35,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: -0.35,
          gazeY: 0.1,
          hipX: 540,
          rightHand: { x: -30, y: -140 },
          rightHandStyle: 'open',
          rightElbow: 16,
          leftHand: { x: -110, y: -120 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
      [
        17.5,
        this.pose({
          face: 0.4,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: -0.2,
          gazeY: 0,
          hipX: 552,
          rightHand: { x: -30, y: -138 },
          rightHandStyle: 'hold',
          rightElbow: 14,
          leftHand: { x: -100, y: -110 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
      [
        18.1,
        this.pose({
          face: 0.55,
          eye: 'normal',
          brow: 'smug',
          mouth: 'smirk',
          gazeX: 0.25,
          gazeY: -0.05,
          hipX: 566,
          goggles: true,
          rightHand: { x: -24, y: -136 },
          rightHandStyle: 'hold',
          rightElbow: 14,
          leftHand: { x: -92, y: -104 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
      [
        18.4,
        this.pose({
          face: 0.65,
          eye: 'happy',
          brow: 'smug',
          mouth: 'smirk',
          gazeX: 0.4,
          gazeY: -0.05,
          hipX: 578,
          goggles: true,
          rightHand: { x: 120, y: -318 },
          rightHandStyle: 'thumb',
          rightElbow: 22,
          leftHand: { x: -80, y: -96 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
      [
        19.0,
        this.pose({
          face: 0.65,
          eye: 'happy',
          brow: 'smug',
          mouth: 'smirk',
          gazeX: 0.45,
          gazeY: -0.05,
          hipX: 580,
          goggles: true,
          rightHand: { x: 128, y: -326 },
          rightHandStyle: 'thumb',
          rightElbow: 22,
          leftHand: { x: -78, y: -94 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
    ]);
  }

  // --- 19-23s: the shot, the panic -------------------------------

  private getLaunchPose(t: number): Pose {
    return this.fromFrames(t, [
      [
        19.0,
        this.pose({
          face: 0.65,
          eye: 'happy',
          brow: 'smug',
          mouth: 'smirk',
          gazeX: 0.45,
          gazeY: -0.05,
          hipX: 580,
          goggles: true,
          rightHand: { x: 128, y: -326 },
          rightHandStyle: 'thumb',
          rightElbow: 22,
          leftHand: { x: -78, y: -94 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
      [
        19.12,
        this.pose({
          face: 0.5,
          eye: 'wide',
          brow: 'raised',
          mouth: 'open',
          gazeX: -0.6,
          gazeY: 0,
          hipX: 584,
          goggles: true,
          rightHand: { x: 150, y: -160 },
          rightHandStyle: 'open',
          rightElbow: 12,
          leftHand: { x: -70, y: -90 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
      [
        20.4,
        this.pose({
          face: 0.45,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          gazeX: -0.35,
          gazeY: -0.35,
          hipX: 586,
          goggles: true,
          rightHand: { x: 120, y: -230 },
          rightHandStyle: 'open',
          rightElbow: 16,
          leftHand: { x: -110, y: -230 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
      [
        21.0,
        this.pose({
          face: 0.5,
          eye: 'fear',
          brow: 'fear',
          mouth: 'o',
          pupilScale: 0.75,
          gazeX: 0.5,
          gazeY: -0.1,
          hipX: 588,
          goggles: true,
          rightHand: { x: 90, y: -300 },
          rightHandStyle: 'open',
          rightElbow: 18,
          leftHand: { x: -90, y: -300 },
          leftHandStyle: 'open',
          leftElbow: -18,
          sweat: true,
        }),
      ],
      [
        22.1,
        this.pose({
          face: 0.55,
          eye: 'fear',
          brow: 'fear',
          mouth: 'open',
          pupilScale: 0.45,
          gazeX: 0.6,
          gazeY: -0.15,
          hipX: 590,
          goggles: true,
          rightHand: { x: 76, y: -330 },
          rightHandStyle: 'open',
          rightElbow: 16,
          leftHand: { x: -76, y: -330 },
          leftHandStyle: 'open',
          leftElbow: -16,
          sweat: true,
        }),
      ],
      [
        22.8,
        this.pose({
          face: 0.6,
          eye: 'fear',
          brow: 'fear',
          mouth: 'open',
          pupilScale: 0.35,
          gazeX: 0.7,
          gazeY: -0.1,
          hipX: 590,
          squashY: 0.9,
          goggles: true,
          rightHand: { x: 62, y: -330 },
          rightHandStyle: 'open',
          rightElbow: 14,
          leftHand: { x: -62, y: -330 },
          leftHandStyle: 'open',
          leftElbow: -14,
          sweat: true,
        }),
      ],
      [
        23.15,
        this.pose({
          face: 0.6,
          eye: 'closed',
          brow: 'fear',
          mouth: 'open',
          pupilScale: 0.3,
          gazeX: 0.7,
          gazeY: 0,
          hipX: 590,
          hipY: 1290,
          squashY: 0.78,
          squashX: 1.06,
          goggles: true,
          rightHand: { x: 40, y: -210 },
          rightHandStyle: 'open',
          rightElbow: 6,
          leftHand: { x: -40, y: -210 },
          leftHandStyle: 'open',
          leftElbow: -6,
          sweat: true,
        }),
      ],
      [
        23.4,
        this.pose({
          face: 0.6,
          eye: 'fear',
          brow: 'fear',
          mouth: 'open',
          pupilScale: 0.35,
          gazeX: 0.8,
          gazeY: -0.1,
          hipX: 590,
          hipY: 1260,
          squashY: 0.84,
          squashX: 1.04,
          goggles: true,
          rightHand: { x: 56, y: -250 },
          rightHandStyle: 'open',
          rightElbow: 10,
          leftHand: { x: -56, y: -250 },
          leftHandStyle: 'open',
          leftElbow: -10,
          sweat: true,
        }),
      ],
      [
        23.75,
        this.pose({
          face: 0.4,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          gazeX: 0.9,
          gazeY: 0,
          hipX: 590,
          hipY: 1160,
          squashY: 1,
          squashX: 1,
          goggles: false,
          rightHand: { x: 80, y: -150 },
          rightHandStyle: 'open',
          rightElbow: 16,
          leftHand: { x: -80, y: -150 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
    ]);
  }

  // --- 23-27s: the duck, the sink, the pride ---------------------

  private getVictoryPose(t: number): Pose {
    return this.fromFrames(t, [
      [
        23.75,
        this.pose({
          face: 0.4,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          gazeX: 0.9,
          gazeY: 0,
          goggles: false,
          rightHand: { x: 80, y: -150 },
          rightHandStyle: 'open',
          rightElbow: 16,
          leftHand: { x: -80, y: -150 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
      [
        24.4,
        this.pose({
          face: 0.5,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          gazeX: -0.7,
          gazeY: -0.45,
          headTilt: -0.22,
          lean: -0.07,
          goggles: false,
          rightHand: { x: 104, y: -128 },
          rightHandStyle: 'open',
          rightElbow: 22,
          leftHand: { x: -104, y: -128 },
          leftHandStyle: 'open',
          leftElbow: -22,
        }),
      ],
      [
        25.0,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          gazeX: 0.3,
          gazeY: -0.05,
          headTilt: -0.04,
          lean: 0,
          goggles: false,
          rightHand: { x: 90, y: -168 },
          rightHandStyle: 'pointIn',
          rightElbow: 96,
          leftHand: { x: -90, y: -168 },
          leftHandStyle: 'pointIn',
          leftElbow: -96,
        }),
      ],
      [
        25.6,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          gazeX: 0.3,
          gazeY: -0.05,
          jump: 26,
          goggles: false,
          rightHand: { x: 90, y: -168 },
          rightHandStyle: 'pointIn',
          rightElbow: 96,
          leftHand: { x: -90, y: -168 },
          leftHandStyle: 'pointIn',
          leftElbow: -96,
        }),
      ],
      [
        26.0,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          gazeX: 0.3,
          gazeY: -0.05,
          jump: 0,
          goggles: false,
          rightHand: { x: 60, y: -300 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -60, y: -300 },
          leftHandStyle: 'open',
          leftElbow: -26,
        }),
      ],
      [
        26.4,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          gazeX: 0.3,
          gazeY: -0.05,
          jump: 30,
          goggles: false,
          rightHand: { x: 90, y: -168 },
          rightHandStyle: 'pointIn',
          rightElbow: 96,
          leftHand: { x: -90, y: -168 },
          leftHandStyle: 'pointIn',
          leftElbow: -96,
        }),
      ],
      [
        26.8,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          gazeX: 0.3,
          gazeY: -0.05,
          jump: 0,
          goggles: false,
          rightHand: { x: 60, y: -300 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -60, y: -300 },
          leftHandStyle: 'open',
          leftElbow: -26,
        }),
      ],
      [
        27.0,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          gazeX: 0.3,
          gazeY: -0.05,
          jump: 0,
          goggles: false,
          rightHand: { x: 70, y: -320 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -70, y: -320 },
          leftHandStyle: 'open',
          leftElbow: -26,
        }),
      ],
    ]);
  }

  // --- 27-30s: celebration, snap, book, deadpan -----------------

  private getCrashPose(t: number): Pose {
    return this.fromFrames(t, [
      [
        27.0,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          gazeX: 0.3,
          gazeY: -0.05,
          jump: 0,
          rightHand: { x: 92, y: -330 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -92, y: -330 },
          leftHandStyle: 'open',
          leftElbow: -26,
        }),
      ],
      [
        27.3,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          gazeX: 0.3,
          gazeY: -0.05,
          jump: 66,
          rightHand: { x: 92, y: -346 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -92, y: -346 },
          leftHandStyle: 'open',
          leftElbow: -26,
        }),
      ],
      [
        27.6,
        this.pose({
          face: 0.65,
          eye: 'wide',
          brow: 'raised',
          mouth: 'open',
          gazeX: -0.5,
          gazeY: -0.1,
          jump: 24,
          rightHand: { x: 96, y: -250 },
          rightHandStyle: 'open',
          rightElbow: 20,
          leftHand: { x: -96, y: -250 },
          leftHandStyle: 'open',
          leftElbow: -20,
        }),
      ],
      [
        28.2,
        this.pose({
          face: 0.6,
          eye: 'wide',
          brow: 'raised',
          mouth: 'open',
          gazeX: 0.3,
          gazeY: -0.05,
          jump: 0,
          rightHand: { x: 70, y: -300 },
          rightHandStyle: 'open',
          rightElbow: 22,
          leftHand: { x: -70, y: -300 },
          leftHandStyle: 'open',
          leftElbow: -22,
        }),
      ],
      [
        28.45,
        this.pose({
          face: 0.5,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          gazeX: 0.2,
          gazeY: 0,
          jump: 0,
          squashY: 0.9,
          squashX: 1.08,
          rightHand: { x: 70, y: -290 },
          rightHandStyle: 'open',
          rightElbow: 22,
          leftHand: { x: -70, y: -290 },
          leftHandStyle: 'open',
          leftElbow: -22,
        }),
      ],
      [
        28.7,
        this.pose({
          face: 0.2,
          eye: 'deadpan',
          brow: 'neutral',
          mouth: 'flat',
          gazeX: 0.1,
          gazeY: 0,
          jump: 0,
          squashY: 0.97,
          squashX: 1.02,
          rightHand: { x: 66, y: -60 },
          rightHandStyle: 'relaxed',
          rightElbow: 16,
          leftHand: { x: -60, y: -56 },
          leftHandStyle: 'relaxed',
          leftElbow: -16,
        }),
      ],
      [
        30.0,
        this.pose({
          face: 0.2,
          eye: 'deadpan',
          brow: 'neutral',
          mouth: 'flat',
          gazeX: 0.1,
          gazeY: 0,
          jump: 0,
          squashY: 0.97,
          squashX: 1.02,
          rightHand: { x: 66, y: -60 },
          rightHandStyle: 'relaxed',
          rightElbow: 16,
          leftHand: { x: -60, y: -56 },
          leftHandStyle: 'relaxed',
          leftElbow: -16,
        }),
      ],
    ]);
  }

  // ==========================================================
  // STICKMAN DRAWING
  // ==========================================================

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

    if (style === 'thumb') {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.lineTo(-2, -23);
      ctx.stroke();
    } else if (style === 'point') {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 22, Math.sin(angle) * 22);
      ctx.stroke();
    } else if (style === 'pointIn') {
      // The finger always aims at the middle of the chest, so the gesture
      // reads as "me?" no matter where the elbow sits.
      const dx = 0 - hand.x;
      const dy = -190 - hand.y;
      const len = Math.hypot(dx, dy) || 1;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo((dx / len) * 32, (dy / len) * 32);
      ctx.stroke();
    } else if (style === 'open') {
      ctx.fillStyle = '#000000';
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
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, TAU);
      ctx.fill();
    } else {
      ctx.fillStyle = '#000000';
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

  private renderStickman(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const trembleX = pose.tremble ? Math.sin(t * 46) * 4 : 0;
    const trembleY = pose.tremble ? Math.cos(t * 39) * 3 : 0;
    // A barely-there breath keeps the final deadpan alive instead of a hard
    // frozen frame.
    const breath = t >= 28.7 ? Math.sin((t - 28.7) * 3.4) * 1.5 : 0;

    ctx.translate(pose.hipX + trembleX, pose.hipY - pose.jump + trembleY + breath);
    ctx.rotate(pose.lean);
    ctx.scale(pose.squashX, pose.squashY);

    // Legs
    const leftKnee = this.drawLimb(ctx, { x: 0, y: 0 }, pose.leftFoot, pose.leftKnee, 12);
    const rightKnee = this.drawLimb(ctx, { x: 0, y: 0 }, pose.rightFoot, pose.rightKnee, 12);
    this.drawFoot(ctx, pose.leftFoot, leftKnee);
    this.drawFoot(ctx, pose.rightFoot, rightKnee);

    // Torso
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -220);
    ctx.stroke();

    // Arms
    const shoulder = { x: 0, y: -220 };
    const leftElbow = this.drawLimb(ctx, shoulder, pose.leftHand, pose.leftElbow, 10);
    const rightElbow = this.drawLimb(ctx, shoulder, pose.rightHand, pose.rightElbow, 10);
    this.drawHand(ctx, pose.leftHand, leftElbow, pose.leftHandStyle);
    this.drawHand(ctx, pose.rightHand, rightElbow, pose.rightHandStyle);

    // Neck
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, -220);
    ctx.lineTo(0, -264);
    ctx.stroke();

    // Head
    ctx.save();
    ctx.translate(0, -334);
    ctx.rotate(pose.headTilt);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.headRadius + pose.face * 3, this.headRadius, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    this.drawFace(ctx, pose);

    if (pose.goggles) {
      this.drawGoggles(ctx, pose);
    }

    if (pose.anger) {
      this.drawAngerMark(ctx, t);
    }

    if (pose.sweat) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(58, -35);
      ctx.quadraticCurveTo(67, -16, 58, -10);
      ctx.quadraticCurveTo(49, -16, 58, -35);
      ctx.stroke();
    }

    ctx.restore();

    // The book that lands on his head.
    if (t >= 28.45) {
      const drop = smooth((t - 28.45) / 0.18);
      this.drawBook(ctx, 4, -408 - (1 - drop) * 120, 96, 26, 0.06 * (1 - drop));
    }

    // The ruler he uses to measure the distance to the trash can.
    if (t >= 4.6 && t < 5.45) {
      this.drawRuler(ctx, pose.rightHand);
    }

    ctx.restore();
  }

  /** Flat ruler with tick marks, used for the distance measurement. */
  private drawRuler(ctx: CanvasRenderingContext2D, hand: Vec) {
    ctx.save();
    ctx.translate(hand.x, hand.y);
    ctx.rotate(-0.1);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.rect(-92, -13, 184, 26);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 2.5;
    for (let i = -75; i <= 75; i += 15) {
      ctx.beginPath();
      ctx.moveTo(i, -13);
      ctx.lineTo(i, i % 30 === 0 ? -2 : -6);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================================
  // FACE
  // ==========================================================

  private drawFace(ctx: CanvasRenderingContext2D, pose: Pose) {
    const face = clamp(pose.face, 0, 1);
    const eyeY = -10;
    const leftEyeX = lerp(16, -22, face);
    const rightEyeX = lerp(44, 18, face);
    const pupilX = clamp(pose.gazeX, -1, 1) * 4.2;
    const pupilY = clamp(pose.gazeY, -1, 1) * 4;

    this.drawEye(ctx, leftEyeX, eyeY, pose.eye, pupilX, pupilY, pose.pupilScale);
    this.drawEye(ctx, rightEyeX, eyeY, pose.eye, pupilX, pupilY, pose.pupilScale);

    this.drawBrows(ctx, leftEyeX, rightEyeX, eyeY, pose.brow);

    const mouthX = lerp(28, 0, face);
    this.drawMouth(ctx, mouthX, 31, pose.mouth);
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
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineCap = 'round';

    if (style === 'closed') {
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x - 8, y);
      ctx.lineTo(x + 8, y);
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

    if (style === 'wide' || style === 'fear') {
      ctx.lineWidth = 4.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(x + pupilX, y + pupilY, 4.8 * pupilScale, 0, TAU);
      ctx.fill();
      return;
    }

    if (style === 'deadpan' || style === 'half') {
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(x, y + 1, 6.8, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 6);
      ctx.lineTo(x + 10, y - 6);
      ctx.stroke();
      return;
    }

    if (style === 'angry') {
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(x, y + 1, 7.2, 5, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 7);
      ctx.lineTo(x + 10, y - 2);
      ctx.stroke();
      return;
    }

    // normal
    ctx.beginPath();
    ctx.arc(x, y, 7.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + pupilX * 0.3 - 1.6, y + pupilY * 0.3 - 1.6, 1.7, 0, TAU);
    ctx.fill();
  }

  private drawBrows(
    ctx: CanvasRenderingContext2D,
    leftX: number,
    rightX: number,
    eyeY: number,
    style: BrowStyle
  ) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    const y = eyeY - 22;

    // The "inner" end of each brow is the end closer to the centre of the face.
    const draw = (x: number, innerLift: number, outerLift: number) => {
      const isLeft = x < 0;
      const innerX = isLeft ? x + 11 : x - 11;
      const outerX = isLeft ? x - 11 : x + 11;
      ctx.beginPath();
      ctx.moveTo(outerX, y + outerLift);
      ctx.lineTo(innerX, y + innerLift);
      ctx.stroke();
    };

    if (style === 'raised') {
      draw(leftX, -4, -9);
      draw(rightX, -4, -9);
    } else if (style === 'oneRaised') {
      draw(leftX, -4, -10);
      draw(rightX, 0, 0);
    } else if (style === 'angry') {
      draw(leftX, 6, -6);
      draw(rightX, 6, -6);
    } else if (style === 'confused') {
      draw(leftX, -6, 3);
      draw(rightX, 3, -3);
    } else if (style === 'sad') {
      draw(leftX, -5, 5);
      draw(rightX, -5, 5);
    } else if (style === 'fear') {
      draw(leftX, -9, 2);
      draw(rightX, -9, 2);
    } else if (style === 'determined') {
      draw(leftX, 4, -4);
      draw(rightX, 4, -4);
    } else if (style === 'smug') {
      draw(leftX, -5, -8);
      draw(rightX, 0, 0);
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
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
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
    } else if (style === 'smirk') {
      ctx.beginPath();
      ctx.moveTo(x - 9, y + 3);
      ctx.quadraticCurveTo(x, y - 4, x + 11, y - 1);
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
    } else {
      ctx.beginPath();
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 10, y);
      ctx.stroke();
    }
  }

  /** Dashed imaginary safety goggles, drawn like the phantom trophy. */
  private drawGoggles(ctx: CanvasRenderingContext2D, pose: Pose) {
    const face = clamp(pose.face, 0, 1);
    const leftEyeX = lerp(16, -22, face);
    const rightEyeX = lerp(44, 18, face);

    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.setLineDash([9, 7]);

    ctx.beginPath();
    ctx.ellipse(leftEyeX, -10, 21, 17, 0, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(rightEyeX, -10, 21, 17, 0, 0, TAU);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(leftEyeX - 21, -12);
    ctx.lineTo(-64, -18);
    ctx.moveTo(rightEyeX + 21, -12);
    ctx.lineTo(72, -18);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();
  }

  private drawAngerMark(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.translate(52, -58);
    ctx.rotate(Math.sin(t * 10) * 0.08);
    ctx.strokeStyle = '#000000';
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

  // ==========================================================
  // EFFECTS
  // ==========================================================

  private renderEffects(ctx: CanvasRenderingContext2D, t: number, pose: Pose) {
    // Ceiling bonk
    this.impactBurst(ctx, t, 7.75, 0.28, 500, 200, 72);
    // Foot bonk
    this.impactBurst(ctx, t, 8.35, 0.26, 648, 1416, 55);
    // Wall rebound
    this.impactBurst(ctx, t, 9.15, 0.26, 990, 905, 70);
    // Lamp ricochet
    this.impactBurst(ctx, t, 19.85, 0.28, 300, 975, 72);
    // Trash can sink
    this.impactBurst(ctx, t, 24.0, 0.22, 900, 1300, 40);
    // Launcher snap
    this.impactBurst(ctx, t, 27.6, 0.36, 430, 1040, 110);
    // Book bonk
    this.impactBurst(ctx, t, 28.45, 0.3, 594, 790, 78);
    this.stars(ctx, t, 28.45, 0.5, 594, 790, 4);

    // Dust puffs under the stomps.
    [12.45, 13.25].forEach((at) => {
      if (t < at || t > at + 0.4) return;
      const u = (t - at) / 0.4;
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const spread = 18 + i * 12 + u * 40;
        ctx.beginPath();
        ctx.moveTo(560 - spread, 1444 - u * 10);
        ctx.lineTo(524 - spread, 1450 - u * 10);
        ctx.moveTo(620 + spread, 1444 - u * 10);
        ctx.lineTo(656 + spread, 1450 - u * 10);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Rage steam.
    if (pose.tremble) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const rise = ((t * 1.6 + i * 0.33) % 1) * 90;
        const x = -70 + i * 62;
        ctx.beginPath();
        ctx.moveTo(x, -380 - rise);
        ctx.quadraticCurveTo(x + 16, -400 - rise, x, -420 - rise);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Celebration sparkles.
    if (t >= 25.0 && t < 27.6) {
      const sparklePositions = [
        { x: 470, y: 700 },
        { x: 700, y: 620 },
        { x: 860, y: 830 },
        { x: 400, y: 980 },
        { x: 760, y: 1080 },
      ];
      sparklePositions.forEach((p, i) => {
        const pulse = Math.sin((t - 25.0) * 7 + i * 1.7);
        if (pulse > 0.25) {
          this.sparkle(ctx, p.x, p.y, 11 + pulse * 8, 0.35 + pulse * 0.35);
        }
      });
    }
  }

  private impactBurst(
    ctx: CanvasRenderingContext2D,
    t: number,
    at: number,
    duration: number,
    x: number,
    y: number,
    radius: number
  ) {
    const age = t - at;
    if (age < 0 || age > duration) return;
    const u = age / duration;
    ctx.save();
    ctx.globalAlpha = 1 - u;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4 * (1 - u);
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8 + 0.18;
      const r1 = radius * 0.36;
      const r2 = radius * (0.72 + u * 0.35);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private stars(
    ctx: CanvasRenderingContext2D,
    t: number,
    at: number,
    duration: number,
    x: number,
    y: number,
    count: number
  ) {
    const age = t - at;
    if (age < 0 || age > duration) return;
    const u = age / duration;
    ctx.save();
    ctx.globalAlpha = 1 - u;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    for (let i = 0; i < count; i++) {
      const a = (i * TAU) / count + 0.4;
      const r = 90 + u * 40;
      this.sparkle(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, 16, 1);
    }
    ctx.restore();
  }

  private sparkle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================
  // SAFE ZONES
  // ==========================================================

  private renderSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(60, 220, this.width - 120, this.height - 560);
    ctx.fillStyle = 'rgba(225, 29, 72, 0.08)';
    ctx.fillRect(this.width - 160, 400, 120, 900);
    ctx.fillRect(60, this.height - 340, this.width - 120, 260);
    ctx.fillStyle = '#e11d48';
    ctx.font = '600 24px "JetBrains Mono", monospace';
    ctx.fillText('9:16 MOBILE SAFE BOUNDS (1080 × 1920)', 80, 200);
    ctx.restore();
  }
}
