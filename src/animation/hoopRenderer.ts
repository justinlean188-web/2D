import { StudioConfig } from '../types';

/**
 * HoopRenderer
 *
 * "The Paper Ball Ricochet — Part 3": the same angry stickman, now on a
 * minimalist outdoor basketball court. One continuous 30-second timeline drawn
 * procedurally in 1080x1920 with the same flat black-and-white vector language
 * as the rest of the series (plus one flat orange accent for the basketball).
 *
 * Beat sheet:
 *   0-2s   book lands on his head, he freezes and glares at it
 *   2-7s   long walk to a basketball court that stays far away
 *   7-9s   arrival: catches his breath, picks up the ball, aims
 *   9-14s  first failures: rim rebound into his face, backboard into his head
 *   14-19s failure montage, quick cuts, escalating frustration
 *   19-21s he calms down and aims with concentration
 *   21-25s one perfect shot in slow motion, twice around the rim, swish
 *   25-28s championship celebration
 *   28-30s the ball comes back and BONKS him, furious deadpan stare, cut to black
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

type HandStyle =
  | 'relaxed'
  | 'hold'
  | 'fist'
  | 'thumb'
  | 'thumbDown'
  | 'point'
  | 'pointUp'
  | 'open';

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
  strain: boolean;
  book: number;
}

interface PathPoint {
  t: number;
  x: number;
  y: number;
}

const TAU = Math.PI * 2;
const ORANGE = '#f97316';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => {
  const x = clamp(u, 0, 1);
  return x * x * (3 - 2 * x);
};
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u, 0, 1), 2);

export class HoopRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  private readonly floorY = 1460;

  private readonly charStartX = 330;
  private readonly charCourtX = 470;
  private readonly headRadius = 70;

  /** The basketball. */
  private readonly ballRadius = 70;
  private readonly ballRestX = 540;
  private readonly ballRestY = 1390;

  /** The hoop in its final, court-side position. */
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

    this.renderEnvironment(ctx, t);
    this.renderCourt(ctx, t);

    const pose = this.getPose(t);
    const ball = this.getBallState(t);

    this.renderStickman(ctx, pose, t);

    // The ball is drawn with the distant court while the court is still far away.
    if (ball.visible && t >= 6.9) {
      this.drawBasketball(ctx, ball.x, ball.y, ball.rotation, ball.scale);
    }

    this.renderEffects(ctx, t, pose);
    ctx.restore();

    if (t >= 29.9) {
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

    if (t < 2.0) {
      x = 470;
      y = 980;
      zoom = 1.05;
    } else if (t < 7.0) {
      // The walk: a wide shot with the court small in the distance.
      const u = smooth((t - 2.0) / 5.0);
      x = lerp(430, 560, u);
      y = lerp(990, 1000, u);
      zoom = lerp(1.0, 1.04, u);
    } else if (t < 9.0) {
      x = 600;
      y = 970;
      zoom = 1.05;
    } else if (t < 14.0) {
      x = 620;
      y = 960;
      zoom = 1.06;
    } else if (t < 19.0) {
      x = 600;
      y = 950;
      zoom = 1.08;
    } else if (t < 21.0) {
      x = 600;
      y = 950;
      zoom = 1.1;
    } else if (t < 23.1) {
      // Slow motion: follow the ball up.
      const ball = this.getBallState(t);
      const focus = ball.visible ? ball : { x: 810, y: 500 };
      x = lerp(620, focus.x, 0.55);
      y = lerp(930, focus.y - 60, 0.5);
      zoom = lerp(1.12, 1.3, smooth((t - 21.0) / 2.0));
    } else if (t < 24.4) {
      // Close on the rim for the double roll.
      x = 810;
      y = 570;
      zoom = 1.55;
    } else if (t < 25.0) {
      x = 760;
      y = 700;
      zoom = 1.3;
    } else if (t < 28.4) {
      x = 660;
      y = 940;
      zoom = 1.12;
    } else if (t < 29.9) {
      x = 560;
      y = 880;
      zoom = 1.3;
    } else {
      x = 520;
      y = 840;
      zoom = 1.55;
    }

    let shakeX = 0;
    let shakeY = 0;
    const impacts = [
      { at: 0.62, amp: 9 },
      { at: 9.78, amp: 5 },
      { at: 10.12, amp: 11 },
      { at: 11.22, amp: 8 },
      { at: 11.52, amp: 9 },
      { at: 15.62, amp: 9 },
      { at: 16.72, amp: 8 },
      { at: 24.5, amp: 4 },
      { at: 28.45, amp: 16 },
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

  private renderEnvironment(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';

    // Ground / sidewalk line
    ctx.beginPath();
    ctx.moveTo(40, this.floorY);
    ctx.lineTo(1040, this.floorY);
    ctx.stroke();

    // Sidewalk seams scroll past while he walks, then stop.
    if (t < 6.9) {
      const speed = t < 3.6 ? 150 : t < 4.8 ? 80 : t < 5.6 ? 26 : 0;
      const offset = (t * speed) % 140;
      ctx.lineWidth = 5;
      for (let x = -140 + offset; x < 1080; x += 140) {
        ctx.beginPath();
        ctx.moveTo(x, this.floorY);
        ctx.lineTo(x, this.floorY + 16);
        ctx.stroke();
      }
    } else {
      // Minimalist court markings once he arrives.
      const fade = smooth((t - 6.9) / 0.8);
      if (fade > 0) {
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(this.boardX, this.floorY, 300, Math.PI, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.boardX - 300, this.floorY);
        ctx.lineTo(this.boardX - 300, this.floorY - 34);
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  /** The hoop, drawn small in the distance and full size once he arrives. */
  private renderCourt(ctx: CanvasRenderingContext2D, t: number) {
    let scale: number;
    let baseX: number;
    let baseY: number;

    if (t < 2.0) {
      scale = 0.14;
      baseX = 830;
      baseY = 1215;
    } else if (t < 6.9) {
      const u = smooth((t - 2.0) / 4.9);
      scale = lerp(0.14, 0.5, u);
      baseX = lerp(830, 830, u);
      baseY = lerp(1215, 1235, u);
    } else if (t < 7.6) {
      // Arrival: the court rushes up to meet him.
      const u = smooth((t - 6.9) / 0.7);
      scale = lerp(0.5, 1, u);
      baseX = 830;
      baseY = lerp(1235, this.floorY, u);
    } else {
      scale = 1;
      baseX = 810;
      baseY = this.floorY;
    }

    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.scale(scale, scale);
    ctx.translate(-this.boardX, -this.floorY);

    // While the court is still far away, the ball sits with it.
    if (t < 6.9) {
      this.drawBasketball(ctx, this.ballRestX, this.ballRestY, 0, 1);
    }

    // The hoop is unstable: in the final beat it tips over toward the
    // stickman and the backboard comes down on his head.
    const fall = t >= 28.0 ? smooth((t - 28.0) / 0.45) : 0;
    const angle = -0.56 * fall;
    const poleScale = 1 - 0.15 * fall;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotate = (x: number, y: number): Vec => ({
      x: x * cos - y * sin,
      y: x * sin + y * cos,
    });
    const base: Vec = { x: this.poleX, y: this.floorY };
    const topV = rotate(0, -915);
    const topX = base.x + topV.x * poleScale;
    const topY = base.y + topV.y * poleScale;
    const boardV = rotate(-130, -990);
    const boardCX = base.x + boardV.x * poleScale;
    const boardCY = base.y + boardV.y * poleScale;

    // Pole
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.poleX, this.floorY);
    ctx.lineTo(topX, topY);
    ctx.stroke();

    // Base
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(this.poleX, this.floorY, 44, 12, 0, 0, TAU);
    ctx.fill();

    // Backboard, rim and net
    ctx.save();
    ctx.translate(boardCX, boardCY);
    ctx.rotate(angle);

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

    ctx.fillStyle = ORANGE;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, 125, 56, 14, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.2;
    const netTop = 133;
    const netBottom = 240;
    for (let i = -2; i <= 2; i++) {
      const u = i / 2;
      ctx.beginPath();
      ctx.moveTo(u * 52, netTop);
      ctx.quadraticCurveTo(u * 62, (netTop + netBottom) / 2, u * 28, netBottom);
      ctx.stroke();
    }
    for (let r = 1; r <= 3; r++) {
      const p = r / 4;
      const yy = lerp(netTop, netBottom, p);
      const half = lerp(52, 28, p);
      ctx.beginPath();
      ctx.moveTo(-half, yy);
      ctx.quadraticCurveTo(0, yy + 7, half, yy);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }

  // ==========================================================
  // BASKETBALL
  // ==========================================================

  private getBallState(t: number) {
    // Sitting on the court until he picks it up.
    if (t < 7.9) {
      return { visible: true, x: this.ballRestX, y: this.ballRestY, rotation: 0, scale: 1 };
    }

    // Picked up at the arrival.
    if (t < 9.2) {
      const u = smooth((t - 7.9) / 0.7);
      return {
        visible: true,
        x: lerp(this.ballRestX, 560, u),
        y: lerp(this.ballRestY, 1120, u),
        rotation: u * 0.5,
        scale: 1,
      };
    }

    // Shot 1: misses, rattles the rim, bounces back into his face.
    if (t < 10.2) {
      const points: PathPoint[] = [
        { t: 9.2, x: 560, y: 1120 },
        { t: 9.45, x: 690, y: 800 },
        { t: 9.78, x: 810, y: 600 },
        { t: 9.95, x: 700, y: 700 },
        { t: 10.12, x: 520, y: 900 },
      ];
      const p = this.samplePath(points, t);
      return { visible: true, x: p.x, y: p.y, rotation: (t - 9.2) * 4, scale: 1 };
    }

    // Caught, then thrown again.
    if (t < 10.85) {
      return { visible: true, x: 500, y: 1060, rotation: 1.2, scale: 1 };
    }

    // Shot 2: backboard, then off his forehead.
    if (t < 11.7) {
      const points: PathPoint[] = [
        { t: 10.85, x: 500, y: 1060 },
        { t: 11.05, x: 660, y: 760 },
        { t: 11.22, x: 810, y: 440 },
        { t: 11.4, x: 720, y: 520 },
        { t: 11.52, x: 520, y: 830 },
      ];
      const p = this.samplePath(points, t);
      return { visible: true, x: p.x, y: p.y, rotation: (t - 10.85) * 4, scale: 1 };
    }

    // Montage, quick cuts.
    if (t < 19.0) {
      return this.getMontageBall(t);
    }

    // Held while he calms down.
    if (t < 21.0) {
      const u = smooth((t - 19.0) / 2.0);
      return {
        visible: true,
        x: lerp(520, 545, u),
        y: lerp(1080, 1060, u),
        rotation: 1.4,
        scale: 1,
      };
    }

    // The perfect shot: a long, slow arc.
    if (t < 23.2) {
      const points: PathPoint[] = [
        { t: 21.0, x: 545, y: 1060 },
        { t: 21.6, x: 610, y: 820 },
        { t: 22.3, x: 720, y: 520 },
        { t: 23.0, x: 800, y: 420 },
        { t: 23.2, x: 810, y: 560 },
      ];
      const p = this.samplePath(points, t);
      return { visible: true, x: p.x, y: p.y, rotation: (t - 21.0) * 2.2, scale: 1 };
    }

    // Twice around the rim, then a clean drop through the net.
    if (t < 24.75) {
      const u = (t - 23.2) / 1.55;
      const turns = u * 2 * TAU;
      const r = 52;
      const x = this.boardX + Math.cos(turns) * r;
      const y = this.rimY + Math.sin(turns) * r * 0.42;
      return { visible: true, x, y, rotation: turns * 0.6, scale: 1 };
    }

    // Through the net, then down to the floor.
    if (t < 25.6) {
      const u = smooth((t - 24.75) / 0.6);
      return {
        visible: true,
        x: lerp(this.boardX, 760, u),
        y: lerp(this.rimY + 40, this.ballRestY, u),
        rotation: 7 + u * 2,
        scale: 1,
      };
    }

    // Rolling on the floor during the celebration.
    if (t < 28.0) {
      return { visible: true, x: 745, y: this.ballRestY, rotation: 7, scale: 1 };
    }

    // The hoop comes down on him; the ball bounces out of the way.
    if (t < 28.9) {
      const points: PathPoint[] = [
        { t: 28.0, x: 745, y: this.ballRestY },
        { t: 28.2, x: 800, y: 1320 },
        { t: 28.45, x: 880, y: this.ballRestY },
        { t: 28.9, x: 960, y: this.ballRestY },
      ];
      const p = this.samplePath(points, t);
      return { visible: true, x: p.x, y: p.y, rotation: (t - 28.0) * 6, scale: 1 };
    }

    return { visible: true, x: 960, y: this.ballRestY, rotation: 6, scale: 1 };
  }

  private getMontageBall(t: number) {
    // Attempt 3: flies sideways.
    if (t < 15.0) {
      const points: PathPoint[] = [
        { t: 14.1, x: 520, y: 1060 },
        { t: 14.4, x: 560, y: 800 },
        { t: 14.7, x: 200, y: 640 },
        { t: 15.0, x: -120, y: 700 },
      ];
      const p = this.samplePath(points, t);
      return { visible: true, x: p.x, y: p.y, rotation: (t - 14.1) * 5, scale: 1 };
    }

    // Attempt 4: rim, then straight into his face.
    if (t < 16.0) {
      const points: PathPoint[] = [
        { t: 15.0, x: 520, y: 1060 },
        { t: 15.2, x: 660, y: 780 },
        { t: 15.35, x: 810, y: 600 },
        { t: 15.62, x: 520, y: 900 },
      ];
      const p = this.samplePath(points, t);
      return { visible: true, x: p.x, y: p.y, rotation: (t - 15.0) * 5, scale: 1 };
    }

    // Attempt 5: off the floor and up into his head.
    if (t < 17.0) {
      const points: PathPoint[] = [
        { t: 16.0, x: 520, y: 1060 },
        { t: 16.2, x: 620, y: 900 },
        { t: 16.45, x: 700, y: this.ballRestY },
        { t: 16.72, x: 540, y: 830 },
      ];
      const p = this.samplePath(points, t);
      return { visible: true, x: p.x, y: p.y, rotation: (t - 16.0) * 5, scale: 1 };
    }

    // Attempt 6: a wild lob that misses everything.
    if (t < 18.0) {
      const points: PathPoint[] = [
        { t: 17.0, x: 520, y: 1060 },
        { t: 17.3, x: 700, y: 620 },
        { t: 17.6, x: 900, y: 300 },
        { t: 18.0, x: 1000, y: 700 },
      ];
      const p = this.samplePath(points, t);
      return { visible: true, x: p.x, y: p.y, rotation: (t - 17.0) * 5, scale: 1 };
    }

    // Attempt 7: drops straight down at his feet.
    if (t < 19.0) {
      const points: PathPoint[] = [
        { t: 18.0, x: 520, y: 1060 },
        { t: 18.2, x: 540, y: 900 },
        { t: 18.45, x: 560, y: this.ballRestY },
        { t: 18.8, x: 520, y: 1300 },
      ];
      const p = this.samplePath(points, t);
      return { visible: true, x: p.x, y: p.y, rotation: (t - 18.0) * 5, scale: 1 };
    }

    return { visible: true, x: 520, y: 1080, rotation: 1.4, scale: 1 };
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

  private drawBasketball(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rotation: number,
    scale: number
  ) {
    const r = this.ballRadius;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    ctx.fillStyle = ORANGE;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.lineWidth = 6;
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
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, 12, h);
    ctx.fill();
    ctx.restore();
  }

  // ==========================================================
  // STICKMAN RIG
  // ==========================================================

  private basePose(): Pose {
    return {
      hipX: this.charStartX,
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
      strain: false,
      book: 0,
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
      strain: discrete.strain,
      book: lerp(a.book, b.book, u),
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
    if (t < 2.0) return this.getBookScene(t);
    if (t < 7.0) return this.getWalkScene(t);
    if (t < 9.0) return this.getArrivalScene(t);
    if (t < 14.0) return this.getFailureScene(t);
    if (t < 19.0) return this.getMontageScene(t);
    if (t < 21.0) return this.getCalmScene(t);
    if (t < 25.0) return this.getFinalShotScene(t);
    if (t < 28.0) return this.getCelebrationScene(t);
    return this.getBonkScene(t);
  }

  // --- 0-2s: the book lands on his head --------------------------

  private getBookScene(t: number): Pose {
    return this.fromFrames(t, [
      [
        0.0,
        this.pose({
          face: 0.3,
          eye: 'normal',
          brow: 'neutral',
          mouth: 'flat',
          gazeX: 0.2,
          gazeY: 0,
          book: 1,
        }),
      ],
      [
        0.62,
        this.pose({
          face: 0.45,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          gazeX: 0.2,
          gazeY: -0.1,
          book: 1,
        }),
      ],
      [
        1.1,
        this.pose({
          face: 0.5,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          gazeX: 0.35,
          gazeY: 0.1,
          headTilt: 0.06,
          rightHand: { x: 74, y: -70 },
          rightHandStyle: 'fist',
          rightElbow: 20,
          leftHand: { x: -70, y: -70 },
          leftHandStyle: 'fist',
          leftElbow: -20,
          anger: true,
          book: 1,
        }),
      ],
      [
        2.0,
        this.pose({
          face: 0.55,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          gazeX: 0.4,
          gazeY: 0.15,
          headTilt: 0.05,
          rightHand: { x: 76, y: -68 },
          rightHandStyle: 'fist',
          rightElbow: 20,
          leftHand: { x: -72, y: -68 },
          leftHandStyle: 'fist',
          leftElbow: -20,
          anger: true,
          book: 1,
        }),
      ],
    ]);
  }

  // --- 2-7s: the long walk to the court --------------------------

  private getWalkScene(t: number): Pose {
    const frames: Array<[number, Pose]> = [];

    // Determined march: tiny fast steps, swinging arms.
    let time = 2.0;
    let step = 0;
    while (time < 3.6) {
      const up = step % 2 === 0;
      frames.push([
        time,
        this.pose({
          face: 0.5,
          eye: 'angry',
          brow: 'determined',
          mouth: 'grit',
          gazeX: 0.8,
          gazeY: -0.15,
          headTilt: -0.05,
          hipX: lerp(this.charStartX, 380, (time - 2.0) / 4.6),
          jump: up ? 12 : 2,
          leftFoot: { x: -46, y: up ? 258 : 300 },
          rightFoot: { x: 50, y: up ? 300 : 258 },
          leftKnee: up ? -22 : -8,
          rightKnee: up ? 8 : 22,
          leftHand: { x: -72, y: up ? -70 : -116 },
          leftHandStyle: 'fist',
          leftElbow: -26,
          rightHand: { x: 74, y: up ? -116 : -70 },
          rightHandStyle: 'fist',
          rightElbow: 26,
          anger: true,
          book: 1,
        }),
      ]);
      time += 0.14;
      step++;
    }

    // Running out of steam.
    time = 3.6;
    step = 0;
    while (time < 4.8) {
      const up = step % 2 === 0;
      frames.push([
        time,
        this.pose({
          face: 0.45,
          eye: 'squint',
          brow: 'determined',
          mouth: 'wobble',
          gazeX: 0.75,
          gazeY: 0.05,
          hipX: lerp(380, 420, (time - 3.6) / 1.2),
          hipY: 1172,
          jump: up ? 7 : 0,
          leftFoot: { x: -46, y: up ? 272 : 300 },
          rightFoot: { x: 50, y: up ? 300 : 272 },
          leftHand: { x: -66, y: up ? -52 : -86 },
          leftHandStyle: 'relaxed',
          leftElbow: -20,
          rightHand: { x: 68, y: up ? -86 : -52 },
          rightHandStyle: 'relaxed',
          rightElbow: 20,
          sweat: true,
          book: 1,
        }),
      ]);
      time += 0.22;
      step++;
    }

    // Dragging his feet.
    time = 4.8;
    step = 0;
    while (time < 5.6) {
      const up = step % 2 === 0;
      frames.push([
        time,
        this.pose({
          face: 0.4,
          eye: 'half',
          brow: 'sad',
          mouth: 'wobble',
          gazeX: 0.7,
          gazeY: 0.25,
          headTilt: 0.12,
          hipX: lerp(420, 445, (time - 4.8) / 0.8),
          hipY: 1180,
          lean: 0.1,
          jump: up ? 3 : 0,
          leftFoot: { x: -44, y: up ? 290 : 300 },
          rightFoot: { x: 48, y: up ? 300 : 292 },
          leftHand: { x: -60, y: -44 },
          leftHandStyle: 'relaxed',
          leftElbow: -16,
          rightHand: { x: 62, y: -44 },
          rightHandStyle: 'relaxed',
          rightElbow: 16,
          sweat: true,
          book: 1,
        }),
      ]);
      time += 0.4;
      step++;
    }

    // Stops to catch his breath, hands on knees.
    frames.push([
      5.6,
      this.pose({
        face: 0.4,
        eye: 'closed',
        brow: 'sad',
        mouth: 'open',
        gazeX: 0.4,
        gazeY: 0.4,
        hipX: 448,
        hipY: 1230,
        lean: 0.34,
        headTilt: 0.18,
        leftHand: { x: -46, y: 46 },
        leftHandStyle: 'open',
        leftElbow: -4,
        rightHand: { x: 40, y: 52 },
        rightHandStyle: 'open',
        rightElbow: 4,
        sweat: true,
        book: 1,
      }),
    ]);
    frames.push([
      6.0,
      this.pose({
        face: 0.4,
        eye: 'closed',
        brow: 'sad',
        mouth: 'open',
        gazeX: 0.4,
        gazeY: 0.4,
        hipX: 448,
        hipY: 1230,
        lean: 0.34,
        headTilt: 0.18,
        leftHand: { x: -46, y: 46 },
        leftHandStyle: 'open',
        leftElbow: -4,
        rightHand: { x: 40, y: 52 },
        rightHandStyle: 'open',
        rightElbow: 4,
        sweat: true,
        book: 1,
      }),
    ]);

    // Annoyed at how far away the court still is.
    frames.push([
      6.4,
      this.pose({
        face: 0.5,
        eye: 'normal',
        brow: 'confused',
        mouth: 'frown',
        gazeX: 0.9,
        gazeY: -0.2,
        headTilt: -0.08,
        hipX: 452,
        leftHand: { x: -80, y: -30 },
        leftHandStyle: 'relaxed',
        leftElbow: -26,
        rightHand: { x: 150, y: -110 },
        rightHandStyle: 'pointUp',
        rightElbow: 6,
        sweat: true,
        book: 1,
      }),
    ]);
    frames.push([
      6.9,
      this.pose({
        face: 0.5,
        eye: 'normal',
        brow: 'confused',
        mouth: 'frown',
        gazeX: 0.9,
        gazeY: -0.2,
        headTilt: -0.06,
        hipX: 460,
        leftHand: { x: -80, y: -30 },
        leftHandStyle: 'relaxed',
        leftElbow: -26,
        rightHand: { x: 150, y: -110 },
        rightHandStyle: 'pointUp',
        rightElbow: 6,
        sweat: true,
        book: 1,
      }),
    ]);

    return this.fromFrames(t, frames);
  }

  // --- 7-9s: arrival --------------------------------------------

  private getArrivalScene(t: number): Pose {
    return this.fromFrames(t, [
      [
        7.0,
        this.pose({
          face: 0.5,
          eye: 'normal',
          brow: 'confused',
          mouth: 'frown',
          gazeX: 0.9,
          gazeY: -0.2,
          hipX: 460,
          leftHand: { x: -80, y: -30 },
          leftHandStyle: 'relaxed',
          leftElbow: -26,
          rightHand: { x: 150, y: -110 },
          rightHandStyle: 'pointUp',
          rightElbow: 6,
          sweat: true,
          book: 1,
        }),
      ],
      [
        7.5,
        this.pose({
          face: 0.45,
          eye: 'closed',
          brow: 'sad',
          mouth: 'open',
          gazeX: 0.3,
          gazeY: 0.45,
          hipX: this.charCourtX,
          hipY: 1240,
          lean: 0.38,
          headTilt: 0.2,
          leftHand: { x: -44, y: 40 },
          leftHandStyle: 'open',
          leftElbow: -4,
          rightHand: { x: 42, y: 48 },
          rightHandStyle: 'open',
          rightElbow: 4,
          sweat: true,
          book: 1,
        }),
      ],
      [
        8.2,
        this.pose({
          face: 0.5,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: 0.55,
          gazeY: 0.35,
          hipX: this.charCourtX,
          hipY: 1170,
          squashY: 0.95,
          leftHand: { x: -46, y: -18 },
          leftHandStyle: 'open',
          leftElbow: -14,
          rightHand: { x: 46, y: -18 },
          rightHandStyle: 'open',
          rightElbow: 14,
          sweat: true,
        }),
      ],
      [
        8.6,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'smug',
          mouth: 'smirk',
          gazeX: 0.85,
          gazeY: -0.3,
          headTilt: -0.08,
          hipX: this.charCourtX,
          rightHand: { x: 60, y: -110 },
          rightHandStyle: 'hold',
          rightElbow: 18,
          leftHand: { x: -56, y: -96 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
      [
        9.0,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'smug',
          mouth: 'smirk',
          gazeX: 0.85,
          gazeY: -0.3,
          headTilt: -0.08,
          hipX: this.charCourtX,
          rightHand: { x: 74, y: -150 },
          rightHandStyle: 'hold',
          rightElbow: 20,
          leftHand: { x: -58, y: -100 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
    ]);
  }

  // --- 9-14s: the first two failures -----------------------------

  private getFailureScene(t: number): Pose {
    return this.fromFrames(t, [
      [
        9.0,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'smug',
          mouth: 'smirk',
          gazeX: 0.85,
          gazeY: -0.3,
          headTilt: -0.08,
          hipX: this.charCourtX,
          rightHand: { x: 74, y: -150 },
          rightHandStyle: 'hold',
          rightElbow: 20,
          leftHand: { x: -58, y: -100 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
      [
        9.2,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          gazeX: 0.85,
          gazeY: -0.3,
          hipX: this.charCourtX,
          lean: -0.08,
          rightHand: { x: 120, y: -250 },
          rightHandStyle: 'open',
          rightElbow: 16,
          leftHand: { x: -64, y: -120 },
          leftHandStyle: 'open',
          leftElbow: -18,
        }),
      ],
      [
        9.45,
        this.pose({
          face: 0.6,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          gazeX: 0.85,
          gazeY: -0.3,
          hipX: this.charCourtX,
          lean: 0.12,
          rightHand: { x: 150, y: -150 },
          rightHandStyle: 'open',
          rightElbow: 12,
          leftHand: { x: -60, y: -80 },
          leftHandStyle: 'open',
          leftElbow: -18,
        }),
      ],
      [
        9.85,
        this.pose({
          face: 0.6,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          gazeX: 0.9,
          gazeY: -0.2,
          hipX: this.charCourtX,
          rightHand: { x: 100, y: -140 },
          rightHandStyle: 'open',
          rightElbow: 18,
          leftHand: { x: -66, y: -90 },
          leftHandStyle: 'open',
          leftElbow: -18,
        }),
      ],
      [
        10.12,
        this.pose({
          face: 0.7,
          eye: 'wide',
          brow: 'raised',
          mouth: 'open',
          pupilScale: 0.4,
          gazeX: 0.4,
          gazeY: 0.1,
          headTilt: 0.34,
          hipX: this.charCourtX,
          lean: -0.22,
          rightHand: { x: 96, y: -120 },
          rightHandStyle: 'open',
          rightElbow: 22,
          leftHand: { x: -70, y: -86 },
          leftHandStyle: 'open',
          leftElbow: -20,
          sweat: true,
        }),
      ],
      [
        10.4,
        this.pose({
          face: 0.65,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          gazeX: 0.6,
          gazeY: 0,
          hipX: this.charCourtX,
          rightHand: { x: 74, y: -80 },
          rightHandStyle: 'hold',
          rightElbow: 20,
          leftHand: { x: -66, y: -80 },
          leftHandStyle: 'open',
          leftElbow: -20,
          anger: true,
        }),
      ],
      [
        10.85,
        this.pose({
          face: 0.65,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          gazeX: 0.85,
          gazeY: -0.2,
          hipX: this.charCourtX,
          lean: -0.06,
          rightHand: { x: 120, y: -250 },
          rightHandStyle: 'open',
          rightElbow: 16,
          leftHand: { x: -62, y: -120 },
          leftHandStyle: 'open',
          leftElbow: -18,
          anger: true,
        }),
      ],
      [
        11.1,
        this.pose({
          face: 0.65,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          gazeX: 0.9,
          gazeY: -0.3,
          hipX: this.charCourtX,
          lean: 0.1,
          rightHand: { x: 150, y: -150 },
          rightHandStyle: 'open',
          rightElbow: 12,
          leftHand: { x: -58, y: -80 },
          leftHandStyle: 'open',
          leftElbow: -18,
          anger: true,
        }),
      ],
      [
        11.35,
        this.pose({
          face: 0.6,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          gazeX: 0.7,
          gazeY: -0.2,
          hipX: this.charCourtX,
          rightHand: { x: 96, y: -130 },
          rightHandStyle: 'open',
          rightElbow: 18,
          leftHand: { x: -64, y: -90 },
          leftHandStyle: 'open',
          leftElbow: -18,
        }),
      ],
      [
        11.55,
        this.pose({
          face: 0.7,
          eye: 'wide',
          brow: 'raised',
          mouth: 'open',
          pupilScale: 0.4,
          gazeX: 0.2,
          gazeY: 0.1,
          headTilt: 0.3,
          hipX: this.charCourtX,
          lean: -0.2,
          rightHand: { x: 92, y: -116 },
          rightHandStyle: 'open',
          rightElbow: 24,
          leftHand: { x: -72, y: -84 },
          leftHandStyle: 'open',
          leftElbow: -22,
          sweat: true,
        }),
      ],
      [
        12.0,
        this.pose({
          face: 0.6,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          gazeX: 0.5,
          gazeY: 0,
          hipX: this.charCourtX - 30,
          lean: -0.1,
          rightHand: { x: 96, y: -140 },
          rightHandStyle: 'open',
          rightElbow: 20,
          leftHand: { x: -76, y: -100 },
          leftHandStyle: 'open',
          leftElbow: -22,
          sweat: true,
        }),
      ],
      [
        14.0,
        this.pose({
          face: 0.6,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          gazeX: 0.5,
          gazeY: 0,
          hipX: this.charCourtX,
          rightHand: { x: 70, y: -110 },
          rightHandStyle: 'hold',
          rightElbow: 18,
          leftHand: { x: -64, y: -100 },
          leftHandStyle: 'open',
          leftElbow: -18,
          sweat: true,
        }),
      ],
    ]);
  }

  // --- 14-19s: the failure montage -------------------------------

  private getMontageScene(t: number): Pose {
    const throwPose = (at: number, next: number): [number, Pose] => [
      at,
      this.pose({
        face: 0.6,
        eye: 'angry',
        brow: 'angry',
        mouth: 'grit',
        gazeX: 0.85,
        gazeY: -0.2,
        hipX: this.charCourtX,
        lean: -0.08,
        rightHand: { x: 120, y: -250 },
        rightHandStyle: 'open',
        rightElbow: 16,
        leftHand: { x: -62, y: -120 },
        leftHandStyle: 'open',
        leftElbow: -18,
        anger: true,
      }),
    ];

    const frames: Array<[number, Pose]> = [
      [14.0, this.pose({
        face: 0.6,
        eye: 'wide',
        brow: 'raised',
        mouth: 'o',
        gazeX: 0.5,
        gazeY: 0,
        hipX: this.charCourtX,
        rightHand: { x: 70, y: -110 },
        rightHandStyle: 'hold',
        rightElbow: 18,
        leftHand: { x: -64, y: -100 },
        leftHandStyle: 'open',
        leftElbow: -18,
        sweat: true,
      })],
      throwPose(14.1, 14.45),
      // Shocked freeze: the ball flew sideways off screen.
      [14.7, this.pose({
        face: 0.5,
        eye: 'wide',
        brow: 'raised',
        mouth: 'o',
        pupilScale: 0.5,
        gazeX: -0.9,
        gazeY: 0,
        headTilt: -0.12,
        hipX: this.charCourtX,
        rightHand: { x: 86, y: -150 },
        rightHandStyle: 'open',
        rightElbow: 22,
        leftHand: { x: -86, y: -150 },
        leftHandStyle: 'open',
        leftElbow: -22,
        sweat: true,
      })],
      throwPose(15.0, 15.25),
      // Rim again, straight into the face: furious eye twitch.
      [15.62, this.pose({
        face: 0.7,
        eye: 'angry',
        brow: 'angry',
        mouth: 'grit',
        pupilScale: 0.55,
        gazeX: 0.3,
        gazeY: 0.1,
        headTilt: 0.3,
        hipX: this.charCourtX,
        lean: -0.2,
        rightHand: { x: 94, y: -120 },
        rightHandStyle: 'open',
        rightElbow: 24,
        leftHand: { x: -70, y: -86 },
        leftHandStyle: 'open',
        leftElbow: -22,
        anger: true,
        sweat: true,
      })],
      throwPose(16.0, 16.25),
      // Off the floor and into his head: stomping feet.
      [16.72, this.pose({
        face: 0.7,
        eye: 'wide',
        brow: 'raised',
        mouth: 'open',
        pupilScale: 0.4,
        gazeX: 0.2,
        gazeY: 0.1,
        headTilt: 0.28,
        hipX: this.charCourtX,
        jump: 26,
        leftFoot: { x: -56, y: 250 },
        rightFoot: { x: 58, y: 300 },
        rightHand: { x: 92, y: -118 },
        rightHandStyle: 'open',
        rightElbow: 24,
        leftHand: { x: -72, y: -88 },
        leftHandStyle: 'open',
        leftElbow: -22,
        sweat: true,
      })],
      throwPose(17.0, 17.25),
      // Shaking fists in frustration.
      [17.6, this.pose({
        face: 0.7,
        eye: 'angry',
        brow: 'angry',
        mouth: 'grit',
        gazeX: 0.5,
        gazeY: 0,
        hipX: this.charCourtX,
        tremble: true,
        rightHand: { x: 96, y: -150 },
        rightHandStyle: 'fist',
        rightElbow: 30,
        leftHand: { x: -96, y: -150 },
        leftHandStyle: 'fist',
        leftElbow: -30,
        anger: true,
        sweat: true,
      })],
      throwPose(18.0, 18.2),
      // Dramatic frustration: arms up, wailing.
      [18.6, this.pose({
        face: 0.7,
        eye: 'closed',
        brow: 'angry',
        mouth: 'open',
        gazeX: 0,
        gazeY: -0.2,
        headTilt: -0.2,
        hipX: this.charCourtX,
        rightHand: { x: 80, y: -300 },
        rightHandStyle: 'open',
        rightElbow: 26,
        leftHand: { x: -80, y: -300 },
        leftHandStyle: 'open',
        leftElbow: -26,
        anger: true,
        sweat: true,
      })],
      [19.0, this.pose({
        face: 0.7,
        eye: 'angry',
        brow: 'angry',
        mouth: 'grit',
        gazeX: 0.5,
        gazeY: 0,
        hipX: this.charCourtX,
        tremble: true,
        rightHand: { x: 74, y: -70 },
        rightHandStyle: 'fist',
        rightElbow: 20,
        leftHand: { x: -72, y: -70 },
        leftHandStyle: 'fist',
        leftElbow: -20,
        anger: true,
        sweat: true,
      })],
    ];

    return this.fromFrames(t, frames);
  }

  // --- 19-21s: calming down --------------------------------------

  private getCalmScene(t: number): Pose {
    return this.fromFrames(t, [
      [
        19.0,
        this.pose({
          face: 0.7,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          gazeX: 0.5,
          gazeY: 0,
          hipX: this.charCourtX,
          tremble: true,
          rightHand: { x: 74, y: -70 },
          rightHandStyle: 'fist',
          rightElbow: 20,
          leftHand: { x: -72, y: -70 },
          leftHandStyle: 'fist',
          leftElbow: -20,
          anger: true,
          sweat: true,
        }),
      ],
      [
        19.4,
        this.pose({
          face: 0.7,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          gazeX: 0.5,
          gazeY: 0,
          hipX: this.charCourtX,
          tremble: true,
          squashY: 0.98,
          rightHand: { x: 78, y: -76 },
          rightHandStyle: 'fist',
          rightElbow: 20,
          leftHand: { x: -76, y: -76 },
          leftHandStyle: 'fist',
          leftElbow: -20,
          anger: true,
          sweat: true,
        }),
      ],
      [
        19.9,
        this.pose({
          face: 0.4,
          eye: 'closed',
          brow: 'neutral',
          mouth: 'o',
          gazeX: 0,
          gazeY: 0,
          hipX: this.charCourtX,
          squashY: 1.08,
          squashX: 0.95,
          rightHand: { x: 30, y: -150 },
          rightHandStyle: 'open',
          rightElbow: 26,
          leftHand: { x: -30, y: -150 },
          leftHandStyle: 'open',
          leftElbow: -26,
          sweat: true,
        }),
      ],
      [
        20.4,
        this.pose({
          face: 0.45,
          eye: 'closed',
          brow: 'neutral',
          mouth: 'flat',
          gazeX: 0,
          gazeY: 0,
          hipX: this.charCourtX,
          squashY: 0.97,
          rightHand: { x: 40, y: -130 },
          rightHandStyle: 'open',
          rightElbow: 24,
          leftHand: { x: -40, y: -130 },
          leftHandStyle: 'open',
          leftElbow: -24,
          sweat: true,
        }),
      ],
      [
        20.7,
        this.pose({
          face: 0.55,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: 0.85,
          gazeY: -0.25,
          headTilt: -0.06,
          hipX: this.charCourtX,
          leftFoot: { x: -62, y: 300 },
          rightFoot: { x: 66, y: 300 },
          rightHand: { x: 66, y: -120 },
          rightHandStyle: 'hold',
          rightElbow: 18,
          leftHand: { x: -50, y: -96 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
      [
        21.0,
        this.pose({
          face: 0.6,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: 0.85,
          gazeY: -0.3,
          headTilt: -0.08,
          hipX: this.charCourtX,
          rightHand: { x: 70, y: -170 },
          rightHandStyle: 'hold',
          rightElbow: 20,
          leftHand: { x: -52, y: -100 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
    ]);
  }

  // --- 21-25s: the perfect shot ----------------------------------

  private getFinalShotScene(t: number): Pose {
    return this.fromFrames(t, [
      [
        21.0,
        this.pose({
          face: 0.6,
          eye: 'normal',
          brow: 'determined',
          mouth: 'flat',
          gazeX: 0.85,
          gazeY: -0.3,
          headTilt: -0.08,
          hipX: this.charCourtX,
          rightHand: { x: 70, y: -170 },
          rightHandStyle: 'hold',
          rightElbow: 20,
          leftHand: { x: -52, y: -100 },
          leftHandStyle: 'open',
          leftElbow: -16,
        }),
      ],
      [
        21.2,
        this.pose({
          face: 0.6,
          eye: 'normal',
          brow: 'determined',
          mouth: 'open',
          gazeX: 0.9,
          gazeY: -0.35,
          hipX: this.charCourtX,
          lean: -0.06,
          rightHand: { x: 130, y: -250 },
          rightHandStyle: 'open',
          rightElbow: 16,
          leftHand: { x: -58, y: -120 },
          leftHandStyle: 'open',
          leftElbow: -18,
        }),
      ],
      [
        21.6,
        this.pose({
          face: 0.65,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          pupilScale: 0.75,
          gazeX: 0.6,
          gazeY: -0.5,
          headTilt: -0.12,
          hipX: this.charCourtX,
          rightHand: { x: 60, y: -190 },
          rightHandStyle: 'open',
          rightElbow: 22,
          leftHand: { x: -58, y: -190 },
          leftHandStyle: 'open',
          leftElbow: -22,
        }),
      ],
      [
        22.6,
        this.pose({
          face: 0.65,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          pupilScale: 0.7,
          gazeX: 0.55,
          gazeY: -0.55,
          headTilt: -0.14,
          hipX: this.charCourtX,
          rightHand: { x: 44, y: -200 },
          rightHandStyle: 'open',
          rightElbow: 20,
          leftHand: { x: -44, y: -200 },
          leftHandStyle: 'open',
          leftElbow: -20,
        }),
      ],
      [
        24.6,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'raised',
          mouth: 'grin',
          gazeX: 0.6,
          gazeY: -0.5,
          headTilt: -0.1,
          hipX: this.charCourtX,
          jump: 18,
          rightHand: { x: 40, y: -230 },
          rightHandStyle: 'open',
          rightElbow: 18,
          leftHand: { x: -40, y: -230 },
          leftHandStyle: 'open',
          leftElbow: -18,
        }),
      ],
      [
        25.0,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'raised',
          mouth: 'grin',
          gazeX: 0.6,
          gazeY: -0.5,
          headTilt: -0.1,
          hipX: this.charCourtX,
          jump: 18,
          rightHand: { x: 40, y: -230 },
          rightHandStyle: 'open',
          rightElbow: 18,
          leftHand: { x: -40, y: -230 },
          leftHandStyle: 'open',
          leftElbow: -18,
        }),
      ],
    ]);
  }

  // --- 25-28s: championship celebration --------------------------

  private getCelebrationScene(t: number): Pose {
    return this.fromFrames(t, [
      [
        25.0,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'raised',
          mouth: 'grin',
          gazeX: 0.6,
          gazeY: -0.5,
          headTilt: -0.1,
          hipX: this.charCourtX,
          jump: 18,
          rightHand: { x: 40, y: -230 },
          rightHandStyle: 'open',
          rightElbow: 18,
          leftHand: { x: -40, y: -230 },
          leftHandStyle: 'open',
          leftElbow: -18,
        }),
      ],
      [
        25.4,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'raised',
          mouth: 'grin',
          gazeX: 0.4,
          gazeY: -0.1,
          hipX: this.charCourtX,
          jump: 74,
          rightHand: { x: 86, y: -330 },
          rightHandStyle: 'fist',
          rightElbow: 24,
          leftHand: { x: -86, y: -330 },
          leftHandStyle: 'fist',
          leftElbow: -24,
        }),
      ],
      [
        25.9,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'raised',
          mouth: 'grin',
          gazeX: 0.4,
          gazeY: -0.1,
          hipX: this.charCourtX,
          jump: 20,
          rightHand: { x: 86, y: -330 },
          rightHandStyle: 'fist',
          rightElbow: 24,
          leftHand: { x: -86, y: -330 },
          leftHandStyle: 'fist',
          leftElbow: -24,
        }),
      ],
      [
        26.3,
        this.pose({
          face: 0.75,
          eye: 'happy',
          brow: 'smug',
          mouth: 'grin',
          gazeX: 0.5,
          gazeY: 0,
          hipX: this.charCourtX,
          rightHand: { x: 92, y: -300 },
          rightHandStyle: 'fist',
          rightElbow: 46,
          leftHand: { x: -58, y: -60 },
          leftHandStyle: 'relaxed',
          leftElbow: -20,
        }),
      ],
      [
        26.8,
        this.pose({
          face: 0.75,
          eye: 'happy',
          brow: 'smug',
          mouth: 'smirk',
          gazeX: 0.5,
          gazeY: 0,
          hipX: this.charCourtX,
          jump: 40,
          rightHand: { x: 92, y: -300 },
          rightHandStyle: 'fist',
          rightElbow: 46,
          leftHand: { x: -60, y: -70 },
          leftHandStyle: 'relaxed',
          leftElbow: -20,
        }),
      ],
      [
        27.3,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'raised',
          mouth: 'grin',
          gazeX: 0.4,
          gazeY: -0.1,
          hipX: this.charCourtX,
          jump: 66,
          rightHand: { x: 86, y: -330 },
          rightHandStyle: 'fist',
          rightElbow: 24,
          leftHand: { x: -86, y: -330 },
          leftHandStyle: 'fist',
          leftElbow: -24,
        }),
      ],
      [
        28.0,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'raised',
          mouth: 'grin',
          gazeX: 0.5,
          gazeY: -0.1,
          hipX: this.charCourtX,
          jump: 0,
          rightHand: { x: 70, y: -280 },
          rightHandStyle: 'fist',
          rightElbow: 22,
          leftHand: { x: -70, y: -280 },
          leftHandStyle: 'fist',
          leftElbow: -22,
        }),
      ],
    ]);
  }

  // --- 28-30s: the hoop falls on him, then the furious stare -------

  private getBonkScene(t: number): Pose {
    return this.fromFrames(t, [
      [
        28.0,
        this.pose({
          face: 0.7,
          eye: 'happy',
          brow: 'raised',
          mouth: 'grin',
          gazeX: 0.5,
          gazeY: -0.1,
          hipX: this.charCourtX,
          jump: 0,
          rightHand: { x: 70, y: -280 },
          rightHandStyle: 'fist',
          rightElbow: 22,
          leftHand: { x: -70, y: -280 },
          leftHandStyle: 'fist',
          leftElbow: -22,
        }),
      ],
      [
        28.3,
        this.pose({
          face: 0.6,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          pupilScale: 0.6,
          gazeX: 0.9,
          gazeY: -0.2,
          hipX: this.charCourtX,
          jump: 0,
          rightHand: { x: 96, y: -200 },
          rightHandStyle: 'open',
          rightElbow: 24,
          leftHand: { x: -96, y: -200 },
          leftHandStyle: 'open',
          leftElbow: -24,
        }),
      ],
      [
        28.5,
        this.pose({
          face: 0.7,
          eye: 'cross',
          brow: 'raised',
          mouth: 'open',
          pupilScale: 0.6,
          gazeX: 0.1,
          gazeY: 0.2,
          headTilt: 0.26,
          hipX: this.charCourtX,
          lean: -0.16,
          squashY: 0.92,
          squashX: 1.08,
          rightHand: { x: 74, y: -300 },
          rightHandStyle: 'open',
          rightElbow: 18,
          leftHand: { x: -74, y: -300 },
          leftHandStyle: 'open',
          leftElbow: -18,
          sweat: true,
        }),
      ],
      [
        28.9,
        this.pose({
          face: 0.6,
          eye: 'cross',
          brow: 'sad',
          mouth: 'wobble',
          pupilScale: 0.6,
          gazeX: 0.1,
          gazeY: 0.3,
          headTilt: 0.2,
          hipX: this.charCourtX,
          lean: -0.1,
          squashY: 0.95,
          rightHand: { x: 70, y: -320 },
          rightHandStyle: 'open',
          rightElbow: 20,
          leftHand: { x: -70, y: -320 },
          leftHandStyle: 'open',
          leftElbow: -20,
          sweat: true,
        }),
      ],
      [
        29.2,
        this.pose({
          face: 0.5,
          eye: 'normal',
          brow: 'angry',
          mouth: 'grit',
          gazeX: 0.1,
          gazeY: 0.1,
          headTilt: 0.06,
          hipX: this.charCourtX,
          rightHand: { x: 64, y: -120 },
          rightHandStyle: 'open',
          rightElbow: 18,
          leftHand: { x: -62, y: -120 },
          leftHandStyle: 'open',
          leftElbow: -18,
          anger: true,
          sweat: true,
        }),
      ],
      [
        29.55,
        this.pose({
          face: 0.65,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          gazeX: 0.08,
          gazeY: 0,
          headTilt: 0.04,
          hipX: this.charCourtX,
          rightHand: { x: 72, y: -66 },
          rightHandStyle: 'fist',
          rightElbow: 18,
          leftHand: { x: -70, y: -66 },
          leftHandStyle: 'fist',
          leftElbow: -18,
          anger: true,
        }),
      ],
      [
        30.0,
        this.pose({
          face: 0.65,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          gazeX: 0.08,
          gazeY: 0,
          headTilt: 0.04,
          hipX: this.charCourtX,
          rightHand: { x: 72, y: -66 },
          rightHandStyle: 'fist',
          rightElbow: 18,
          leftHand: { x: -70, y: -66 },
          leftHandStyle: 'fist',
          leftElbow: -18,
          anger: true,
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
    } else if (style === 'thumbDown') {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.lineTo(-2, 23);
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
    const strainShake = pose.strain ? Math.sin(t * 38) * 3.5 : 0;

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
    ctx.translate(strainShake, 0);
    ctx.translate(0, -334);
    ctx.rotate(pose.headTilt);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.headRadius + pose.face * 3, this.headRadius, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

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

    ctx.restore();

    // The book: it drops onto his head, then rides along until he bends over.
    if (pose.book > 0) {
      let tilt = 0;
      let bookY = -412;
      if (t < 0.62) {
        const fall = clamp(t / 0.62, 0, 1);
        bookY = lerp(-800, -412, fall);
      } else {
        tilt = Math.sin((t - 0.62) * 26) * 0.06 * Math.exp(-(t - 0.62) * 2.2);
      }
      const off = t > 7.2 ? smooth((t - 7.2) / 0.45) : 0;
      this.drawBook(
        ctx,
        4 + off * 90,
        bookY + off * 800,
        96,
        26,
        tilt + off * 1.4
      );
    }

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
    const twitch = t >= 29.15 ? Math.sin((t - 29.15) * 33) * 4.6 : 0;

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
    // The book bonking his head.
    this.impactBurst(ctx, t, 0.62, 0.3, 340, 750, 70);
    this.stars(ctx, t, 0.62, 0.5, 340, 750, 4);
    // Rim rattles.
    this.impactBurst(ctx, t, 9.78, 0.22, 810, 595, 70);
    this.impactBurst(ctx, t, 11.22, 0.26, 810, 450, 80);
    this.impactBurst(ctx, t, 15.35, 0.22, 810, 595, 66);
    // Ball-to-face bonks.
    this.impactBurst(ctx, t, 10.12, 0.3, 500, 850, 78);
    this.stars(ctx, t, 10.12, 0.45, 500, 850, 4);
    this.impactBurst(ctx, t, 11.52, 0.3, 500, 850, 78);
    this.stars(ctx, t, 11.52, 0.45, 500, 850, 4);
    this.impactBurst(ctx, t, 15.62, 0.3, 500, 850, 78);
    this.impactBurst(ctx, t, 16.72, 0.3, 500, 850, 78);
    // The swish.
    this.impactBurst(ctx, t, 24.5, 0.24, 810, 600, 58);
    // The final bonk: the backboard comes down on his head.
    this.impactBurst(ctx, t, 28.45, 0.34, 470, 830, 92);
    this.stars(ctx, t, 28.45, 0.5, 470, 830, 4);

    // Stomping dust.
    if (t >= 16.6 && t < 17.1) {
      const u = (t - 16.6) / 0.5;
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const spread = 18 + i * 13 + u * 40;
        ctx.beginPath();
        ctx.moveTo(470 - spread, 1444 - u * 10);
        ctx.lineTo(436 - spread, 1450 - u * 10);
        ctx.moveTo(520 + spread, 1444 - u * 10);
        ctx.lineTo(554 + spread, 1450 - u * 10);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Celebration sparkles.
    if (t >= 25.0 && t < 28.0) {
      const sparklePositions = [
        { x: 380, y: 700 },
        { x: 640, y: 620 },
        { x: 780, y: 820 },
        { x: 300, y: 980 },
        { x: 700, y: 1060 },
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
