import { StudioConfig } from '../types';

/**
 * MachineRenderer
 *
 * "The Paper Ball Ricochet — Episode 4": the Angry Stickman keeps going on the
 * basketball court. The lightweight hoop falls on his head, he over-prepares,
 * chases a dozen runaway balls, gets an accidental trick shot, celebrates on a
 * podium of basketballs, and finishes hanging upside down in the net.
 *
 * One continuous 30-second timeline in 1080x1920, same flat black-and-white
 * vector language as the rest of the series plus one flat orange accent.
 */

type EyeStyle =
  | 'normal'
  | 'wide'
  | 'happy'
  | 'closed'
  | 'half'
  | 'deadpan'
  | 'angry'
  | 'fear'
  | 'squint'
  | 'cross';

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
  | 'wobble'
  | 'pucker';

type HandStyle = 'relaxed' | 'hold' | 'fist' | 'point' | 'pointUp' | 'open';

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
  anger: boolean;
  sweat: boolean;
  tremble: boolean;
  flush: boolean;
  net: number;
  trophy: number;
  hanging: boolean;
}

interface PathPoint {
  t: number;
  x: number;
  y: number;
}

const TAU = Math.PI * 2;
// Minimalist Monochrome palette: white cartoon basketball with black seams
const ORANGE = '#ffffff';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => {
  const x = clamp(u, 0, 1);
  return x * x * (3 - 2 * x);
};
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u, 0, 1), 2);

export class MachineRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  private readonly floorY = 1460;

  private readonly charX = 470;
  private readonly headRadius = 70;

  private readonly ballRadius = 62;

  /** The hoop. */
  private readonly boardX = 810;
  private readonly boardY = 470;
  private readonly rimY = 595;
  private readonly poleX = 940;

  public render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = clamp(time, 0, 30);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.width, this.height);

    const camera = this.getCamera(t);
    ctx.save();
    ctx.translate(this.width / 2 + camera.shakeX, this.height / 2 + camera.shakeY);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    this.renderEnvironment(ctx);

    const pose = this.getPose(t);
    // While the hoop is lying on top of him it has to be drawn over him.
    const hoopOnTop = t >= 1.95 && t < 4.95;
    // While he hangs in the net he is in front of the ball litter.
    const hanging = t >= 28.8;

    if (!hoopOnTop) {
      this.renderHoop(ctx, t);
    }
    if (hanging) {
      this.renderBalls(ctx, t);
    }

    this.renderStickman(ctx, pose, t);

    if (!hanging) {
      this.renderBalls(ctx, t);
    }
    if (hoopOnTop) {
      this.renderHoop(ctx, t);
    }

    // The net cord snagged on the fallen metal support.
    if (t >= 27.4) {
      const headX = pose.hipX + 334 * Math.sin(pose.lean);
      const headY = pose.hipY - 334 * Math.cos(pose.lean);
      ctx.save();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(headX, headY);
      ctx.lineTo(300, 1440);
      ctx.stroke();
      ctx.restore();
    }

    this.renderEffects(ctx, t, pose);
    ctx.restore();

    if (t >= 29.95) {
      // Cut to black.
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, this.width, this.height);
    }

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

    if (t < 5.0) {
      x = lerp(540, 500, smooth(t / 5.0));
      y = 980;
      zoom = 1.06;
    } else if (t < 10.0) {
      x = 500;
      y = 980;
      zoom = 1.04;
    } else if (t < 15.0) {
      x = 520;
      y = 970;
      zoom = 1.06;
    } else if (t < 21.0) {
      x = 560;
      y = 950;
      zoom = 1.08;
    } else if (t < 26.0) {
      x = 540;
      y = 960;
      zoom = 1.08;
    } else if (t < 28.6) {
      x = 500;
      y = 960;
      zoom = 1.12;
    } else {
      // Push in on the upside-down punchline.
      x = 470;
      y = 1010;
      zoom = 1.3;
    }

    let shakeX = 0;
    let shakeY = 0;
    const impacts = [
      { at: 2.6, amp: 14 },
      { at: 7.5, amp: 7 },
      { at: 12.4, amp: 8 },
      { at: 14.2, amp: 9 },
      { at: 16.4, amp: 6 },
      { at: 18.4, amp: 6 },
      { at: 26.4, amp: 8 },
      { at: 28.4, amp: 7 },
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
  // ENVIRONMENT
  // ==========================================================

  private renderEnvironment(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(40, this.floorY);
    ctx.lineTo(1040, this.floorY);
    ctx.stroke();

    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(this.boardX, this.floorY, 300, Math.PI, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.boardX - 300, this.floorY);
    ctx.lineTo(this.boardX - 300, this.floorY - 34);
    ctx.stroke();

    // The right wall the trick shot rebounds off.
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(1015, 255);
    ctx.lineTo(1015, this.floorY);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // THE HOOP
  // ==========================================================

  /** Where the hoop assembly is at time t: tilt, collapse and slide. */
  private getHoopState(t: number) {
    let angle = 0;
    let scale = 1;
    let shakeX = 0;
    let shakeY = 0;

    if (t >= 1.0 && t < 1.9) {
      // Violent shake right before it goes.
      const u = t - 1.0;
      shakeX = Math.sin(u * 52) * 10;
      shakeY = Math.cos(u * 44) * 7;
      angle = Math.sin(u * 30) * 0.02;
    } else if (t >= 1.9) {
      // Tips forward onto his head.
      const fall = smooth((t - 1.9) / 0.9);
      angle = -0.56 * fall;
      scale = 1 - 0.15 * fall;
      if (t >= 4.35) {
        // He shoves it off himself and it collapses to the floor.
        const push = smooth((t - 4.35) / 0.7);
        angle = lerp(-0.56, -0.92, push);
        scale = lerp(0.85, 0.68, push);
      }
    }

    return { angle, scale, shakeX, shakeY };
  }

  private renderHoop(ctx: CanvasRenderingContext2D, t: number) {
    const shake = t >= 1.0 && t < 1.9 ? Math.sin((t - 1.0) * 52) * 9 : 0;
    const shakeY = t >= 1.0 && t < 1.9 ? Math.cos((t - 1.0) * 44) * 6 : 0;

    // The hoop's lifecycle: it stands, tips onto him, lies on the floor, is
    // knocked upright by a stray ball, then topples for good at the end.
    let upright = 1;
    let fallenX = 520;
    if (t >= 1.9 && t < 2.6) {
      upright = 1 - smooth((t - 1.9) / 0.7);
    } else if (t >= 2.6 && t < 4.35) {
      upright = 0;
    } else if (t >= 4.35 && t < 5.05) {
      upright = 0;
      fallenX = lerp(520, 480, smooth((t - 4.35) / 0.7));
    } else if (t >= 5.05 && t < 8.55) {
      upright = 0;
      fallenX = 480;
    } else if (t >= 8.55 && t < 8.95) {
      // A loose ball knocks it back upright.
      upright = smooth((t - 8.55) / 0.4);
      fallenX = 480;
    } else if (t >= 25.9 && t < 26.7) {
      upright = 1 - smooth((t - 25.9) / 0.8);
    } else if (t >= 26.7) {
      upright = 0;
      fallenX = 300;
    }

    const poleEndX = lerp(fallenX, this.poleX, upright);
    const poleEndY = lerp(1440, 545, upright) + shakeY;
    const boardX = lerp(fallenX - 100, this.boardX, upright) + shake;
    const boardY = lerp(1388, this.boardY, upright) + shakeY;
    const boardRot = lerp(-0.16, 0, upright);

    ctx.save();

    // Pole
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.poleX, this.floorY);
    ctx.lineTo(poleEndX, poleEndY);
    ctx.stroke();

    // Base
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(this.poleX, this.floorY, 44, 12, 0, 0, TAU);
    ctx.fill();

    // Backboard, rim and net
    ctx.save();
    ctx.translate(boardX, boardY);
    ctx.rotate(boardRot);
    this.drawHoopHead(ctx, t < 4.6);
    ctx.restore();

    ctx.restore();
  }

  /** Backboard, rim and net in the hoop's own space. */
  private drawHoopHead(ctx: CanvasRenderingContext2D, withNet: boolean) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.rect(-135, -92, 270, 185);
    ctx.fill();
    ctx.stroke();

    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(-50, -50, 100, 90);
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, 125, 56, 14, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (withNet) {
      this.drawNet(ctx, 0, 0, 0);
    }
  }

  /** The hoop net, drawn in the backboard's local space. */
  private drawNet(ctx: CanvasRenderingContext2D, x: number, y: number, wobble: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.2;
    const netTop = 133;
    const netBottom = 240;
    for (let i = -2; i <= 2; i++) {
      const u = i / 2;
      ctx.beginPath();
      ctx.moveTo(u * 52, netTop);
      ctx.quadraticCurveTo(
        u * 62 + wobble * 8,
        (netTop + netBottom) / 2,
        u * 28 + wobble * 12,
        netBottom
      );
      ctx.stroke();
    }
    for (let r = 1; r <= 3; r++) {
      const p = r / 4;
      const yy = lerp(netTop, netBottom, p);
      const half = lerp(52, 28, p) + wobble * 6 * Math.sin(p * Math.PI);
      ctx.beginPath();
      ctx.moveTo(-half, yy);
      ctx.quadraticCurveTo(0, yy + 7, half, yy);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================================
  // BALLS
  // ==========================================================

  /** The pile he carries in his arms (5.0s - 7.8s). */
  private getPile(t: number): { x: number; y: number; r: number }[] {
    if (t < 5.0 || t > 8.4) return [];
    const build = smooth((t - 5.0) / 1.5);
    const count = Math.floor(1 + build * 6);
    const pile: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const wobble = t > 6.4 ? Math.sin(t * 16 + i) * 4 : 0;
      pile.push({
        x: this.charX + (col === 0 ? -34 : 34) + wobble,
        y: 1010 - i * 56,
        r: this.ballRadius,
      });
    }
    return pile;
  }

  /** Balls loose on the floor after the pile collapses. */
  private getScatter(t: number): { x: number; y: number; r: number }[] {
    if (t < 7.9) return [];
    const seeds = [
      { dx: -180, dy: 0 },
      { dx: 140, dy: 0 },
      { dx: -60, dy: 0 },
      { dx: 300, dy: 0 },
      { dx: -380, dy: 0 },
      { dx: 430, dy: 0 },
      { dx: 60, dy: 0 },
      { dx: -260, dy: 0 },
    ];
    const out: { x: number; y: number; r: number }[] = [];
    seeds.forEach((seed, i) => {
      const start = 7.9 + i * 0.06;
      const u = smooth(clamp((t - start) / 0.9, 0, 1));
      const x = this.charX + seed.dx * easeOut(u);
      const bounce = Math.sin(u * Math.PI) * (40 + i * 10);
      out.push({ x, y: this.floorY - this.ballRadius - bounce, r: this.ballRadius });
    });
    return out;
  }

  /** The podium of basketballs he stands on (23.4s - 26.6s). */
  private getPodium(t: number): { x: number; y: number; r: number }[] {
    if (t < 23.4 || t > 27.0) return [];
    const roll = t >= 26.0 ? smooth((t - 26.0) / 0.7) : 0;
    const wobble = t >= 23.4 && t < 26.0 ? Math.sin((t - 23.4) * 9) * (t - 23.4) * 2.2 : 0;
    return [
      { x: this.charX - 46 + roll * -150, y: this.floorY - this.ballRadius - wobble, r: this.ballRadius },
      { x: this.charX + 46 + roll * 170, y: this.floorY - this.ballRadius + wobble, r: this.ballRadius },
      { x: this.charX + roll * 40, y: this.floorY - this.ballRadius * 2.1 - wobble, r: this.ballRadius },
    ];
  }

  /** The trick shot that somehow finds the hoop. */
  private getTrickShot(t: number): Vec | null {
    if (t < 15.6 || t > 21.0) return null;
    const points: PathPoint[] = [
      { t: 15.6, x: 500, y: 1050 },
      { t: 16.1, x: 640, y: 700 },
      { t: 16.4, x: 700, y: 520 },
      { t: 16.9, x: 900, y: 760 },
      { t: 17.4, x: 700, y: 1150 },
      { t: 17.9, x: 400, y: 1330 },
      { t: 18.4, x: 960, y: 1150 },
      { t: 18.9, x: 700, y: 800 },
      { t: 19.4, x: 860, y: 620 },
      { t: 19.9, x: 810, y: 760 },
      { t: 20.4, x: 810, y: 640 },
      { t: 20.9, x: 810, y: 760 },
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

    return {
      x: clamp(rawX, Math.min(p1.x, p2.x), Math.max(p1.x, p2.x)),
      y: clamp(rawY, Math.min(p1.y, p2.y), Math.max(p1.y, p2.y)),
    };
  }

  private renderBalls(ctx: CanvasRenderingContext2D, t: number) {
    // The opening shot: a ball drops through the hoop.
    if (t < 1.6) {
      const u = clamp(t / 1.2, 0, 1);
      const y = lerp(420, 720, smooth(u));
      this.drawBasketball(ctx, this.boardX, y, t * 5, 1);
    } else if (t < 2.4) {
      this.drawBasketball(ctx, this.boardX, 720, t * 5, 1);
    }

    // The pile in his arms.
    this.getPile(t).forEach((b, i) => {
      this.drawBasketball(ctx, b.x, b.y, i * 0.8 + t * 2, 1);
    });

    // The loose balls.
    this.getScatter(t).forEach((b, i) => {
      this.drawBasketball(ctx, b.x, b.y, i * 1.3 + t * 1.4, 1);
    });

    // The podium.
    this.getPodium(t).forEach((b, i) => {
      this.drawBasketball(ctx, b.x, b.y, i * 0.9 + t * 1.1, 1);
    });

    // The trick shot.
    const trick = this.getTrickShot(t);
    if (trick) {
      this.drawBasketball(ctx, trick.x, trick.y, (t - 15.6) * 4.5, 1);
    }

    // The ball that rolls past him at the very end.
    if (t >= 29.3) {
      const u = clamp((t - 29.3) / 0.7, 0, 1);
      const x = lerp(900, 470, u);
      const kick = t >= 29.62 ? Math.sin((t - 29.62) * 30) * 26 : 0;
      this.drawBasketball(ctx, x, this.floorY - this.ballRadius, t * 4, 1);
      if (kick !== 0) {
        // The tiny angry kick.
        this.drawBasketball(ctx, x + kick, this.floorY - this.ballRadius, t * 4, 1);
      }
    }
  }

  private drawBasketball(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rotation: number,
    scale: number
  ) {
    const r = this.ballRadius * scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    ctx.fillStyle = ORANGE;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.44, r, 0, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.44, r, 0, Math.PI / 2, (Math.PI * 3) / 2);
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
      anger: false,
      sweat: false,
      tremble: false,
      flush: false,
      net: 0,
      trophy: 0,
      hanging: false,
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
      anger: discrete.anger,
      sweat: discrete.sweat,
      tremble: discrete.tremble,
      flush: discrete.flush,
      net: lerp(a.net, b.net, u),
      trophy: lerp(a.trophy, b.trophy, u),
      hanging: discrete.hanging,
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
    if (t < 5.0) return this.getHoopBonkScene(t);
    if (t < 10.0) return this.getPlanScene(t);
    if (t < 15.0) return this.getChaseScene(t);
    if (t < 21.0) return this.getTrickShotScene(t);
    if (t < 26.0) return this.getCelebrationScene(t);
    return this.getFinalGagScene(t);
  }

  // --- 0-5s: the hoop bonk ----------------------------------------

  private getHoopBonkScene(t: number): Pose {
    return this.fromFrames(t, [
      [
        0.0,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'raised',
          mouth: 'grin',
          gazeX: 0.6,
          gazeY: -0.4,
          hipX: this.charX,
          rightHand: { x: 88, y: -300 },
          rightHandStyle: 'fist',
          rightElbow: 24,
          leftHand: { x: -88, y: -300 },
          leftHandStyle: 'fist',
          leftElbow: -24,
        }),
      ],
      [
        1.0,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'raised',
          mouth: 'grin',
          gazeX: 0.6,
          gazeY: -0.4,
          hipX: this.charX,
          rightHand: { x: 88, y: -300 },
          rightHandStyle: 'fist',
          rightElbow: 24,
          leftHand: { x: -88, y: -300 },
          leftHandStyle: 'fist',
          leftElbow: -24,
        }),
      ],
      [
        1.9,
        this.pose({
          face: 0.6,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          pupilScale: 0.7,
          gazeX: 0.8,
          gazeY: -0.3,
          hipX: this.charX,
          rightHand: { x: 96, y: -260 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -96, y: -260 },
          leftHandStyle: 'open',
          leftElbow: -26,
        }),
      ],
      // Flattened under the hoop: only his legs stick out.
      [
        2.6,
        this.pose({
          face: 0.7,
          eye: 'cross',
          brow: 'raised',
          mouth: 'open',
          pupilScale: 0.5,
          gazeX: 0.2,
          gazeY: 0.2,
          headTilt: 0.3,
          hipX: this.charX,
          hipY: 1400,
          squashY: 0.24,
          squashX: 2.2,
          rightHand: { x: 140, y: 60 },
          rightHandStyle: 'open',
          rightElbow: 20,
          leftHand: { x: -140, y: 60 },
          leftHandStyle: 'open',
          leftElbow: -20,
          leftFoot: { x: -110, y: 180 },
          rightFoot: { x: 110, y: 180 },
          sweat: true,
        }),
      ],
      // One beat of stillness under the hoop.
      [
        3.6,
        this.pose({
          face: 0.7,
          eye: 'cross',
          brow: 'raised',
          mouth: 'open',
          pupilScale: 0.5,
          gazeX: 0.2,
          gazeY: 0.2,
          headTilt: 0.3,
          hipX: this.charX,
          hipY: 1400,
          squashY: 0.24,
          squashX: 2.2,
          rightHand: { x: 140, y: 60 },
          rightHandStyle: 'open',
          rightElbow: 20,
          leftHand: { x: -140, y: 60 },
          leftHandStyle: 'open',
          leftElbow: -20,
          leftFoot: { x: -110, y: 180 },
          rightFoot: { x: 110, y: 180 },
          sweat: true,
        }),
      ],
      // His legs twitch angrily.
      [
        4.1,
        this.pose({
          face: 0.7,
          eye: 'cross',
          brow: 'raised',
          mouth: 'open',
          pupilScale: 0.5,
          gazeX: 0.2,
          gazeY: 0.2,
          headTilt: 0.3,
          hipX: this.charX,
          hipY: 1400,
          squashY: 0.24,
          squashX: 2.2,
          rightHand: { x: 140, y: 60 },
          rightHandStyle: 'open',
          rightElbow: 20,
          leftHand: { x: -140, y: 60 },
          leftHandStyle: 'open',
          leftElbow: -20,
          leftFoot: { x: -130, y: 130 },
          rightFoot: { x: 110, y: 180 },
          sweat: true,
        }),
      ],
      // He shoves the hoop off and stands up, net tangled on his head.
      [
        4.7,
        this.pose({
          face: 0.7,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          pupilScale: 0.7,
          gazeX: -0.6,
          gazeY: 0.2,
          headTilt: 0.06,
          hipX: this.charX,
          hipY: 1160,
          rightHand: { x: 118, y: -120 },
          rightHandStyle: 'fist',
          rightElbow: 30,
          leftHand: { x: -118, y: -120 },
          leftHandStyle: 'fist',
          leftElbow: -30,
          anger: true,
          net: 1,
        }),
      ],
      [
        5.0,
        this.pose({
          face: 0.7,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          pupilScale: 0.7,
          gazeX: -0.7,
          gazeY: 0.15,
          headTilt: 0.05,
          hipX: this.charX,
          hipY: 1160,
          rightHand: { x: 118, y: -120 },
          rightHandStyle: 'fist',
          rightElbow: 30,
          leftHand: { x: -118, y: -120 },
          leftHandStyle: 'fist',
          leftElbow: -30,
          anger: true,
          net: 1,
        }),
      ],
    ]);
  }

  // --- 5-10s: the over-prepared plan ------------------------------

  private getPlanScene(t: number): Pose {
    return this.fromFrames(t, [
      [
        5.0,
        this.pose({
          face: 0.7,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          pupilScale: 0.7,
          gazeX: -0.7,
          gazeY: 0.15,
          headTilt: 0.05,
          hipX: this.charX,
          rightHand: { x: 118, y: -120 },
          rightHandStyle: 'fist',
          rightElbow: 30,
          leftHand: { x: -118, y: -120 },
          leftHandStyle: 'fist',
          leftElbow: -30,
          anger: true,
          net: 1,
        }),
      ],
      [
        5.6,
        this.pose({
          face: 0.55,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: -0.4,
          gazeY: 0.1,
          headTilt: -0.05,
          hipX: this.charX - 40,
          rightHand: { x: 40, y: -110 },
          rightHandStyle: 'open',
          rightElbow: 18,
          leftHand: { x: -40, y: -110 },
          leftHandStyle: 'open',
          leftElbow: -18,
          net: 1,
        }),
      ],
      [
        6.6,
        this.pose({
          face: 0.6,
          eye: 'normal',
          brow: 'smug',
          mouth: 'smirk',
          gazeX: 0.5,
          gazeY: -0.1,
          headTilt: -0.06,
          hipX: this.charX,
          rightHand: { x: 34, y: -118 },
          rightHandStyle: 'open',
          rightElbow: 12,
          leftHand: { x: -34, y: -118 },
          leftHandStyle: 'open',
          leftElbow: -12,
          net: 1,
        }),
      ],
      [
        7.4,
        this.pose({
          face: 0.6,
          eye: 'normal',
          brow: 'determined',
          mouth: 'open',
          gazeX: 0.6,
          gazeY: -0.1,
          hipX: this.charX + 40,
          jump: 14,
          leftFoot: { x: -46, y: 262 },
          rightFoot: { x: 52, y: 300 },
          rightHand: { x: 34, y: -118 },
          rightHandStyle: 'open',
          rightElbow: 12,
          leftHand: { x: -34, y: -118 },
          leftHandStyle: 'open',
          leftElbow: -12,
          net: 1,
        }),
      ],
      // A ball slips out and hits his foot.
      [
        7.8,
        this.pose({
          face: 0.6,
          eye: 'closed',
          brow: 'sad',
          mouth: 'open',
          gazeX: 0.2,
          gazeY: 0.4,
          hipX: this.charX + 40,
          rightFoot: { x: 66, y: 262 },
          rightHand: { x: 30, y: -110 },
          rightHandStyle: 'open',
          rightElbow: 12,
          leftHand: { x: -30, y: -110 },
          leftHandStyle: 'open',
          leftElbow: -12,
          net: 1,
          sweat: true,
        }),
      ],
      // Everything scatters.
      [
        8.8,
        this.pose({
          face: 0.65,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          pupilScale: 0.6,
          gazeX: 0.3,
          gazeY: 0.2,
          headTilt: 0.12,
          hipX: this.charX + 40,
          rightHand: { x: 90, y: -170 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -90, y: -170 },
          leftHandStyle: 'open',
          leftElbow: -26,
          net: 1,
          sweat: true,
        }),
      ],
      // Frozen. Then the fists clench.
      [
        9.4,
        this.pose({
          face: 0.65,
          eye: 'wide',
          brow: 'raised',
          mouth: 'flat',
          pupilScale: 0.6,
          gazeX: 0.3,
          gazeY: 0.2,
          headTilt: 0.1,
          hipX: this.charX + 40,
          rightHand: { x: 92, y: -60 },
          rightHandStyle: 'open',
          rightElbow: 20,
          leftHand: { x: -92, y: -60 },
          leftHandStyle: 'open',
          leftElbow: -20,
          net: 1,
          sweat: true,
        }),
      ],
      [
        10.0,
        this.pose({
          face: 0.7,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          pupilScale: 0.6,
          gazeX: 0.4,
          gazeY: 0,
          headTilt: 0.04,
          hipX: this.charX + 40,
          rightHand: { x: 86, y: -74 },
          rightHandStyle: 'fist',
          rightElbow: 20,
          leftHand: { x: -86, y: -74 },
          leftHandStyle: 'fist',
          leftElbow: -20,
          anger: true,
          net: 1,
        }),
      ],
    ]);
  }

  // --- 10-15s: the great basketball chase -------------------------

  private getChaseScene(t: number): Pose {
    return this.fromFrames(t, [
      [
        10.0,
        this.pose({
          face: 0.7,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          pupilScale: 0.6,
          gazeX: 0.4,
          gazeY: 0,
          headTilt: 0.04,
          hipX: this.charX + 40,
          rightHand: { x: 86, y: -74 },
          rightHandStyle: 'fist',
          rightElbow: 20,
          leftHand: { x: -86, y: -74 },
          leftHandStyle: 'fist',
          leftElbow: -20,
          anger: true,
          net: 1,
        }),
      ],
      // Running after a rolling ball.
      [
        10.8,
        this.pose({
          face: 0.6,
          eye: 'normal',
          brow: 'determined',
          mouth: 'grit',
          pupilScale: 0.7,
          gazeX: 0.8,
          gazeY: 0,
          hipX: this.charX - 60,
          lean: 0.2,
          jump: 22,
          leftFoot: { x: -60, y: 250 },
          rightFoot: { x: 64, y: 300 },
          rightHand: { x: 80, y: -120 },
          rightHandStyle: 'fist',
          rightElbow: 30,
          leftHand: { x: -80, y: -70 },
          leftHandStyle: 'fist',
          leftElbow: -20,
          net: 1,
        }),
      ],
      // Diving for another one.
      [
        11.8,
        this.pose({
          face: 0.6,
          eye: 'wide',
          brow: 'raised',
          mouth: 'open',
          pupilScale: 0.6,
          gazeX: 0.7,
          gazeY: 0.3,
          hipX: this.charX + 30,
          hipY: 1260,
          lean: 0.9,
          jump: 30,
          leftHand: { x: 110, y: 40 },
          leftHandStyle: 'open',
          leftElbow: 6,
          rightHand: { x: 150, y: 20 },
          rightHandStyle: 'open',
          rightElbow: 6,
          leftFoot: { x: -60, y: 280 },
          rightFoot: { x: 60, y: 270 },
          net: 1,
        }),
      ],
      // Slipping.
      [
        12.4,
        this.pose({
          face: 0.7,
          eye: 'wide',
          brow: 'raised',
          mouth: 'open',
          pupilScale: 0.5,
          gazeX: 0.2,
          gazeY: 0.3,
          headTilt: 0.24,
          hipX: this.charX + 30,
          hipY: 1300,
          lean: -0.3,
          jump: 60,
          leftHand: { x: -120, y: -180 },
          leftHandStyle: 'open',
          leftElbow: -30,
          rightHand: { x: 120, y: -180 },
          rightHandStyle: 'open',
          rightElbow: 30,
          leftFoot: { x: -40, y: 240 },
          rightFoot: { x: 90, y: 296 },
          net: 1,
          sweat: true,
        }),
      ],
      // A triumphant catch.
      [
        13.2,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          pupilScale: 0.9,
          gazeX: 0.2,
          gazeY: 0.1,
          headTilt: -0.06,
          hipX: this.charX + 20,
          rightHand: { x: 30, y: -150 },
          rightHandStyle: 'hold',
          rightElbow: 16,
          leftHand: { x: -30, y: -150 },
          leftHandStyle: 'hold',
          leftElbow: -16,
          net: 1,
        }),
      ],
      // A ball rolls behind and bumps his feet together.
      [
        13.8,
        this.pose({
          face: 0.7,
          eye: 'wide',
          brow: 'raised',
          mouth: 'open',
          pupilScale: 0.5,
          gazeX: 0.1,
          gazeY: 0.2,
          headTilt: 0.1,
          hipX: this.charX + 20,
          jump: 20,
          leftFoot: { x: -30, y: 286 },
          rightFoot: { x: 34, y: 290 },
          rightHand: { x: 30, y: -150 },
          rightHandStyle: 'hold',
          rightElbow: 16,
          leftHand: { x: -30, y: -150 },
          leftHandStyle: 'hold',
          leftElbow: -16,
          net: 1,
        }),
      ],
      // Spinning, then landing sitting down.
      [
        14.4,
        this.pose({
          face: 0.75,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          pupilScale: 0.5,
          gazeX: 0.1,
          gazeY: 0,
          headTilt: 0.2,
          hipX: this.charX + 20,
          hipY: 1330,
          lean: -0.2,
          squashY: 0.9,
          rightHand: { x: 36, y: -140 },
          rightHandStyle: 'hold',
          rightElbow: 16,
          leftHand: { x: -36, y: -140 },
          leftHandStyle: 'hold',
          leftElbow: -16,
          leftFoot: { x: -70, y: 292 },
          rightFoot: { x: 74, y: 288 },
          anger: true,
          flush: true,
          net: 1,
        }),
      ],
      [
        15.0,
        this.pose({
          face: 0.75,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          pupilScale: 0.5,
          gazeX: 0.1,
          gazeY: 0,
          headTilt: 0.18,
          hipX: this.charX + 20,
          hipY: 1330,
          lean: -0.18,
          squashY: 0.9,
          rightHand: { x: 36, y: -140 },
          rightHandStyle: 'hold',
          rightElbow: 16,
          leftHand: { x: -36, y: -140 },
          leftHandStyle: 'hold',
          leftElbow: -16,
          leftFoot: { x: -70, y: 292 },
          rightFoot: { x: 74, y: 288 },
          anger: true,
          flush: true,
          net: 1,
        }),
      ],
    ]);
  }

  // --- 15-21s: the impossible trick shot --------------------------

  private getTrickShotScene(t: number): Pose {
    return this.fromFrames(t, [
      [
        15.0,
        this.pose({
          face: 0.75,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          pupilScale: 0.5,
          gazeX: 0.1,
          gazeY: 0,
          headTilt: 0.18,
          hipX: this.charX + 20,
          hipY: 1330,
          lean: -0.18,
          squashY: 0.9,
          rightHand: { x: 36, y: -140 },
          rightHandStyle: 'hold',
          rightElbow: 16,
          leftHand: { x: -36, y: -140 },
          leftHandStyle: 'hold',
          leftElbow: -16,
          leftFoot: { x: -70, y: 292 },
          rightFoot: { x: 74, y: 288 },
          anger: true,
          flush: true,
          net: 1,
        }),
      ],
      // He stands up, breathes, and aims.
      [
        15.6,
        this.pose({
          face: 0.5,
          eye: 'closed',
          brow: 'neutral',
          mouth: 'o',
          pupilScale: 0.9,
          gazeX: 0,
          gazeY: 0,
          hipX: this.charX,
          hipY: 1160,
          squashY: 1.07,
          squashX: 0.96,
          rightHand: { x: 30, y: -150 },
          rightHandStyle: 'hold',
          rightElbow: 20,
          leftHand: { x: -30, y: -150 },
          leftHandStyle: 'hold',
          leftElbow: -20,
          net: 1,
        }),
      ],
      [
        16.2,
        this.pose({
          face: 0.6,
          eye: 'normal',
          brow: 'determined',
          mouth: 'open',
          pupilScale: 0.9,
          gazeX: 0.9,
          gazeY: -0.35,
          headTilt: -0.08,
          hipX: this.charX,
          lean: -0.1,
          rightHand: { x: 120, y: -250 },
          rightHandStyle: 'open',
          rightElbow: 16,
          leftHand: { x: -60, y: -130 },
          leftHandStyle: 'open',
          leftElbow: -20,
          net: 1,
        }),
      ],
      // The ball comes back across the court.
      [
        18.8,
        this.pose({
          face: 0.6,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          pupilScale: 0.6,
          gazeX: 0.4,
          gazeY: -0.2,
          hipX: this.charX,
          rightHand: { x: 110, y: -190 },
          rightHandStyle: 'open',
          rightElbow: 24,
          leftHand: { x: -110, y: -190 },
          leftHandStyle: 'open',
          leftElbow: -24,
          net: 1,
        }),
      ],
      // He ducks.
      [
        19.3,
        this.pose({
          face: 0.6,
          eye: 'closed',
          brow: 'raised',
          mouth: 'open',
          pupilScale: 0.7,
          gazeX: 0.2,
          gazeY: -0.3,
          hipX: this.charX,
          hipY: 1290,
          squashY: 0.8,
          squashX: 1.18,
          rightHand: { x: 96, y: -240 },
          rightHandStyle: 'open',
          rightElbow: 20,
          leftHand: { x: -96, y: -240 },
          leftHandStyle: 'open',
          leftElbow: -20,
          net: 1,
        }),
      ],
      // Stunned by the accidental make.
      [
        20.9,
        this.pose({
          face: 0.6,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          pupilScale: 0.6,
          gazeX: 0.6,
          gazeY: -0.6,
          headTilt: -0.16,
          hipX: this.charX,
          rightHand: { x: 78, y: -150 },
          rightHandStyle: 'open',
          rightElbow: 22,
          leftHand: { x: -78, y: -150 },
          leftHandStyle: 'open',
          leftElbow: -22,
          net: 1,
        }),
      ],
      [
        21.0,
        this.pose({
          face: 0.6,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          pupilScale: 0.6,
          gazeX: 0.6,
          gazeY: -0.6,
          headTilt: -0.16,
          hipX: this.charX,
          rightHand: { x: 78, y: -150 },
          rightHandStyle: 'open',
          rightElbow: 22,
          leftHand: { x: -78, y: -150 },
          leftHandStyle: 'open',
          leftElbow: -22,
          net: 1,
        }),
      ],
    ]);
  }

  // --- 21-26s: the champion celebration ----------------------------

  private getCelebrationScene(t: number): Pose {
    return this.fromFrames(t, [
      [
        21.0,
        this.pose({
          face: 0.6,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          pupilScale: 0.6,
          gazeX: 0.6,
          gazeY: -0.6,
          headTilt: -0.16,
          hipX: this.charX,
          rightHand: { x: 78, y: -150 },
          rightHandStyle: 'open',
          rightElbow: 22,
          leftHand: { x: -78, y: -150 },
          leftHandStyle: 'open',
          leftElbow: -22,
          net: 1,
        }),
      ],
      // Wild celebration, flexing and jumping.
      [
        21.7,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'raised',
          mouth: 'grin',
          pupilScale: 0.9,
          gazeX: 0.4,
          gazeY: -0.1,
          hipX: this.charX,
          jump: 76,
          rightHand: { x: 92, y: -300 },
          rightHandStyle: 'fist',
          rightElbow: 46,
          leftHand: { x: -92, y: -300 },
          leftHandStyle: 'fist',
          leftElbow: -46,
          net: 1,
        }),
      ],
      // Miming the championship trophy.
      [
        22.5,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'smug',
          mouth: 'smirk',
          pupilScale: 0.9,
          gazeX: 0.3,
          gazeY: -0.2,
          headTilt: -0.08,
          hipX: this.charX,
          rightHand: { x: 86, y: -280 },
          rightHandStyle: 'open',
          rightElbow: 30,
          leftHand: { x: -86, y: -280 },
          leftHandStyle: 'open',
          leftElbow: -30,
          trophy: 1,
          net: 1,
        }),
      ],
      // Climbing onto the podium of basketballs.
      [
        23.4,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'raised',
          mouth: 'grin',
          pupilScale: 0.9,
          gazeX: 0.4,
          gazeY: -0.1,
          hipX: this.charX,
          hipY: 1260,
          jump: 10,
          rightHand: { x: 88, y: -290 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -88, y: -290 },
          leftHandStyle: 'open',
          leftElbow: -26,
          net: 1,
        }),
      ],
      // Heroic pose on the wobbling podium.
      [
        24.4,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          pupilScale: 0.9,
          gazeX: 0.4,
          gazeY: -0.1,
          headTilt: -0.05,
          hipX: this.charX,
          hipY: 1230,
          tremble: true,
          rightHand: { x: 96, y: -330 },
          rightHandStyle: 'open',
          rightElbow: 24,
          leftHand: { x: -96, y: -330 },
          leftHandStyle: 'open',
          leftElbow: -24,
          net: 1,
        }),
      ],
      [
        26.0,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          pupilScale: 0.9,
          gazeX: 0.4,
          gazeY: -0.1,
          headTilt: -0.05,
          hipX: this.charX,
          hipY: 1230,
          tremble: true,
          rightHand: { x: 96, y: -330 },
          rightHandStyle: 'open',
          rightElbow: 24,
          leftHand: { x: -96, y: -330 },
          leftHandStyle: 'open',
          leftElbow: -24,
          net: 1,
        }),
      ],
    ]);
  }

  // --- 26-30s: the unexpected final gag --------------------------

  private getFinalGagScene(t: number): Pose {
    return this.fromFrames(t, [
      [
        26.0,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          pupilScale: 0.9,
          gazeX: 0.4,
          gazeY: -0.1,
          headTilt: -0.05,
          hipX: this.charX,
          hipY: 1230,
          tremble: true,
          rightHand: { x: 96, y: -330 },
          rightHandStyle: 'open',
          rightElbow: 24,
          leftHand: { x: -96, y: -330 },
          leftHandStyle: 'open',
          leftElbow: -24,
          net: 1,
        }),
      ],
      // The podium rolls out and he drops safely onto his feet.
      [
        26.8,
        this.pose({
          face: 0.6,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          pupilScale: 0.7,
          gazeX: 0.2,
          gazeY: 0.1,
          hipX: this.charX,
          hipY: 1160,
          rightHand: { x: 100, y: -300 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -100, y: -300 },
          leftHandStyle: 'open',
          leftElbow: -26,
          net: 1,
        }),
      ],
      // Proud pose; the net catches on the metal support.
      [
        27.8,
        this.pose({
          face: 0.65,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          pupilScale: 0.9,
          gazeX: 0.4,
          gazeY: -0.1,
          headTilt: -0.06,
          hipX: this.charX,
          rightHand: { x: 96, y: -320 },
          rightHandStyle: 'open',
          rightElbow: 24,
          leftHand: { x: -96, y: -320 },
          leftHandStyle: 'open',
          leftElbow: -24,
          net: 1,
        }),
      ],
      // He steps forward and is gently pulled backwards, off his feet.
      [
        28.5,
        this.pose({
          face: 0.65,
          eye: 'wide',
          brow: 'raised',
          mouth: 'open',
          pupilScale: 0.7,
          gazeX: 0.2,
          gazeY: 0,
          headTilt: -0.2,
          hipX: 500,
          hipY: 1150,
          lean: -0.3,
          leftFoot: { x: -46, y: 266 },
          rightFoot: { x: 34, y: 276 },
          rightHand: { x: 104, y: -290 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -104, y: -290 },
          leftHandStyle: 'open',
          leftElbow: -26,
          net: 1,
        }),
      ],
      // Hanging upside down, just above the ground.
      [
        29.0,
        this.pose({
          face: 0.7,
          eye: 'deadpan',
          brow: 'angry',
          mouth: 'flat',
          pupilScale: 0.8,
          gazeX: 0.1,
          gazeY: 0,
          headTilt: 0.1,
          hipX: 330,
          hipY: 1070,
          lean: Math.PI,
          rightHand: { x: 34, y: -300 },
          rightHandStyle: 'relaxed',
          rightElbow: 8,
          leftHand: { x: -34, y: -300 },
          leftHandStyle: 'relaxed',
          leftElbow: -8,
          leftFoot: { x: -48, y: 250 },
          rightFoot: { x: 52, y: 250 },
          net: 1,
          hanging: true,
        }),
      ],
      [
        30.0,
        this.pose({
          face: 0.7,
          eye: 'deadpan',
          brow: 'angry',
          mouth: 'flat',
          pupilScale: 0.8,
          gazeX: 0.1,
          gazeY: 0,
          headTilt: 0.1,
          hipX: 330,
          hipY: 1070,
          lean: Math.PI,
          rightHand: { x: 34, y: -300 },
          rightHandStyle: 'relaxed',
          rightElbow: 8,
          leftHand: { x: -34, y: -300 },
          leftHandStyle: 'relaxed',
          leftElbow: -8,
          leftFoot: { x: -48, y: 250 },
          rightFoot: { x: 52, y: 250 },
          net: 1,
          hanging: true,
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

    if (style === 'point') {
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
    } else if (style === 'pointUp') {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(22, -14);
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

    const trembleX = pose.tremble ? Math.sin(t * 44) * 4 : 0;
    const trembleY = pose.tremble ? Math.cos(t * 37) * 3 : 0;

    ctx.translate(pose.hipX + trembleX, pose.hipY - pose.jump + trembleY);
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

    // Cartoon rage flush.
    if (pose.flush) {
      ctx.fillStyle = ORANGE;
      ctx.beginPath();
      ctx.ellipse(0, 2, this.headRadius - 12, this.headRadius - 12, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    this.drawFace(ctx, pose, t);

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

    // The net tangled around his head.
    if (pose.net > 0) {
      this.drawNetOnHead(ctx, pose);
    }

    ctx.restore();

    // The imaginary championship trophy.
    if (pose.trophy > 0) {
      this.drawImaginaryTrophy(ctx, pose.trophy);
    }

    ctx.restore();
  }

  /** Net strands draped over his head, and the cord to the fallen support. */
  private drawNetOnHead(ctx: CanvasRenderingContext2D, pose: Pose) {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';

    const spread = 46 + (1 - pose.net) * 30;
    ctx.beginPath();
    ctx.moveTo(-spread, -30);
    ctx.quadraticCurveTo(-spread * 0.5, -78, 0, -62);
    ctx.quadraticCurveTo(spread * 0.5, -78, spread, -30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-spread * 0.8, -12);
    ctx.quadraticCurveTo(0, -44, spread * 0.8, -12);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-spread * 0.55, 34);
    ctx.quadraticCurveTo(0, 6, spread * 0.55, 34);
    ctx.stroke();

    ctx.restore();
  }

  /** A dashed imaginary championship trophy, drawn like the trophy in Part 1. */
  private drawImaginaryTrophy(ctx: CanvasRenderingContext2D, amount: number) {
    ctx.save();
    ctx.translate(0, -520 + (1 - amount) * 120);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([9, 7]);

    ctx.beginPath();
    ctx.moveTo(-36, -54);
    ctx.lineTo(36, -54);
    ctx.quadraticCurveTo(33, 0, 0, 18);
    ctx.quadraticCurveTo(-33, 0, -36, -54);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-38, -32, 20, -1.35, 1.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(38, -32, 20, Math.PI - 1.35, Math.PI + 1.35);
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(-7, 18, 14, 18);
    ctx.rect(-25, 36, 50, 9);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();
  }

  // ==========================================================
  // FACE
  // ==========================================================

  private drawFace(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    const face = clamp(pose.face, 0, 1);
    const eyeY = -10;
    const leftEyeX = lerp(16, -22, face);
    const rightEyeX = lerp(44, 18, face);
    const pupilX = clamp(pose.gazeX, -1, 1) * 4.2;
    const pupilY = clamp(pose.gazeY, -1, 1) * 4;
    // One eye twitches during the final furious stare.
    const twitch = t >= 29.0 ? Math.sin((t - 29.0) * 31) * 4.4 : 0;

    this.drawEye(ctx, leftEyeX, eyeY, pose.eye, pupilX, pupilY, pose.pupilScale);
    this.drawEye(ctx, rightEyeX, eyeY, pose.eye, pupilX + twitch, pupilY, pose.pupilScale);

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

    if (style === 'squint') {
      ctx.lineWidth = 4.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + pupilX, y + pupilY, 4.2 * pupilScale, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 1);
      ctx.lineTo(x + 11, y - 3);
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
    } else if (style === 'pucker') {
      ctx.beginPath();
      ctx.ellipse(x, y + 1, 5, 6, 0, 0, TAU);
      ctx.fill();
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
      ctx.moveTo(x - 10, y + 2);
      ctx.quadraticCurveTo(x + 2, y - 6, x + 12, y - 4);
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
    // The hoop landing on him.
    this.impactBurst(ctx, t, 2.6, 0.34, 400, 800, 96);
    this.stars(ctx, t, 2.6, 0.5, 400, 800, 4);
    // The ball hitting his foot.
    this.impactBurst(ctx, t, 7.6, 0.24, 560, 1400, 54);
    // The slip and the spin.
    this.impactBurst(ctx, t, 12.4, 0.26, 470, 1400, 60);
    this.impactBurst(ctx, t, 14.4, 0.28, 470, 1400, 62);
    // The trick shot bouncing off the support, the floor and the wall.
    this.impactBurst(ctx, t, 16.9, 0.2, 900, 760, 58);
    this.impactBurst(ctx, t, 17.4, 0.2, 700, 1150, 54);
    this.impactBurst(ctx, t, 18.4, 0.2, 960, 1150, 54);
    // The swish.
    this.impactBurst(ctx, t, 20.4, 0.24, 810, 600, 58);
    // The podium collapsing.
    this.impactBurst(ctx, t, 26.4, 0.3, 470, 1400, 80);
    // The final pull backwards.
    this.impactBurst(ctx, t, 28.4, 0.24, 470, 1000, 60);

    // Celebration sparkles.
    if (t >= 21.0 && t < 26.0) {
      const sparklePositions = [
        { x: 360, y: 700 },
        { x: 640, y: 620 },
        { x: 780, y: 820 },
        { x: 300, y: 980 },
        { x: 700, y: 1060 },
      ];
      sparklePositions.forEach((p, i) => {
        const pulse = Math.sin((t - 21.0) * 7 + i * 1.7);
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
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(60, 220, this.width - 120, this.height - 560);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(this.width - 160, 400, 120, 900);
    ctx.fillRect(60, this.height - 340, this.width - 120, 260);
    ctx.fillStyle = '#111111';
    ctx.font = '600 24px "JetBrains Mono", monospace';
    ctx.fillText('9:16 MOBILE SAFE BOUNDS (1080 × 1920)', 80, 200);
    ctx.restore();
  }
}
